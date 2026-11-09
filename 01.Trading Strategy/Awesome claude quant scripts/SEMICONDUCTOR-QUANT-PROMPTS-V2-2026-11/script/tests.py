#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tests.py — 프롬프트 로직 단위 테스트 (unittest)
===============================================
프롬프트의 "codegen 모드는 단위 테스트를 포함한다" 요구를 코드로 옮긴 것.
python -m unittest tests  또는  python tests.py
"""
from __future__ import annotations

import json
import os
import sys
import unittest

import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config as C
import factors as F
from consistency import (check_v1_sizing_contradiction, check_v2_sizing_feasibility,
                         check_crowd_weights, check_e_thresholds_monotonic,
                         check_hedge_spec, check_weights)
from hedge import TailHedge, put_spread_price
from portfolio import crowd_multiplier, size_positions, check_constraints, e_thresholds
from regime import classify, regime_inputs
from scoring import build_factor_df, prompt_a, to_schema_json
import synthetic_data as S


class TestMomentum(unittest.TestCase):
    def test_mom_12_1_excludes_last_month(self):
        idx = pd.bdate_range("2024-01-01", periods=260)
        px = pd.Series(100.0, index=idx)
        px.iloc[:239] = 50.0                     # t-12M~t-1M: 50 -> 100 (2배)
        t = idx[-1]
        self.assertAlmostEqual(F.mom_12_1(px, t), 1.0, places=6)   # 최근 1개월 제외

    def test_mom_3m(self):
        idx = pd.bdate_range("2024-01-01", periods=70)
        px = pd.Series(100.0, index=idx)
        px.iloc[:63] = 90.0
        self.assertAlmostEqual(F.mom_3m(px, idx[-1]), 100 / 90 - 1, places=6)

    def test_mom_short_history_is_nan(self):
        px = pd.Series([1.0] * 10)
        self.assertTrue(np.isnan(F.mom_12_1(px, px.index[-1])))


class TestRevision(unittest.TestCase):
    def test_few_analysts_is_na(self):
        idx = pd.date_range("2024-01-01", periods=8, freq="ME")
        eps = pd.Series([1.0] * 8, index=idx)
        na = pd.Series([3] * 8, index=idx)
        self.assertTrue(np.isnan(F.revision_3m(eps, na, idx[-1])))

    def test_revision_3m_change(self):
        idx = pd.date_range("2024-01-01", periods=8, freq="ME")
        eps = pd.Series([1.0, 1.0, 1.0, 1.0, 1.1, 1.1, 1.1, 1.21], index=idx)
        na = pd.Series([10] * 8, index=idx)
        self.assertAlmostEqual(F.revision_3m(eps, na, idx[-1]), 0.1, places=6)


class TestNeutralize(unittest.TestCase):
    def setUp(self):
        self.df = pd.DataFrame({
            "subsector": ["GPU"] * 3 + ["CPU"] * 3 + ["MEM"] * 2,
            "x": [1.0, 2.0, 3.0, 5.0, 6.0, 7.0, 0.1, 0.2],
        }, index=list("ABCDEFGH"))

    def test_subsector_neutral_sums_to_zero(self):
        z = F.neutralize(self.df, "x")
        for sub in ("GPU", "CPU"):
            self.assertAlmostEqual(z[self.df.subsector == sub].sum(), 0.0, places=9)

    def test_sub_3_names_becomes_na(self):
        z = F.neutralize(self.df, "x")
        self.assertTrue(z[self.df.subsector == "MEM"].isna().all())


class TestRegime(unittest.TestCase):
    def test_rules_map_to_expected(self):
        cases = [
            ({"a_z": 1.0, "b_z": -1.0, "c_z": -0.5, "d": 0, "n_na": 0, "a_prev_q_z": 0.0}, "R1"),
            ({"a_z": 1.0, "b_z": 0.0, "c_z": 0.5, "d": 1, "n_na": 0, "a_prev_q_z": 0.0}, "R2"),
            ({"a_z": 0.5, "b_z": 1.0, "c_z": 0.5, "d": 1, "n_na": 0, "a_prev_q_z": 1.5}, "R3"),
            ({"a_z": -1.0, "b_z": 1.0, "c_z": 0.0, "d": 0, "n_na": 0, "a_prev_q_z": 0.0}, "R4"),
        ]
        for inp, want in cases:
            self.assertEqual(classify(inp)["label"], want, msg=str(inp))

    def test_na_fallback(self):
        r = classify({"a_z": np.nan, "b_z": np.nan, "c_z": 1.0, "d": 0, "n_na": 2,
                      "a_prev_q_z": np.nan})
        self.assertEqual(r["label"], "N/A")
        self.assertEqual(r["confidence"], "low")

    def test_synthetic_cycle_matches_true_regime(self):
        """합성 데이터의 진국면 vs 분류기 국면 일치율 ≥ 80%."""
        data = S.load_all()
        dates = data["dates"]
        true = S.true_regime_map()
        match = total = 0
        for t in pd.date_range(dates[0], dates[-1], freq="ME"):
            if t.to_period("M") not in true:
                continue
            label = classify(regime_inputs(data["cycle"], t))["label"]
            total += 1
            match += (label == true[t.to_period("M")])
        self.assertGreaterEqual(match / total, 0.80)


class TestWeights(unittest.TestCase):
    def test_all_weight_tables_sum_to_100(self):
        for reg, w in C.REGIME_WEIGHTS_A.items():
            self.assertAlmostEqual(sum(w.values()), 100, msg=reg)
        for sub, w in C.SUBSECTOR_WEIGHTS_B.items():
            self.assertAlmostEqual(sum(w.values()), 100, msg=sub)
        self.assertAlmostEqual(sum(C.D_BASE_W.values()), 100)
        self.assertAlmostEqual(sum(C.D_TIMING_LOW.values()), 100)

    def test_v1_contradiction_v2_feasible(self):
        self.assertEqual(check_v1_sizing_contradiction()["status"], "PASS")  # 모순 확인됨
        self.assertEqual(check_v2_sizing_feasibility()["status"], "PASS")

    def test_crowd_13f_weight_capped(self):
        self.assertLessEqual(C.CROWD_W["13f"], 0.20)

    def test_e_thresholds_monotonic(self):
        self.assertEqual(check_e_thresholds_monotonic()["status"], "PASS")


class TestCrowdMultiplier(unittest.TestCase):
    def test_multiplier_steps(self):
        thr = {"x75": 2.0, "x50": 2.5, "exclude": 3.0}
        self.assertEqual(crowd_multiplier(1.0, thr), 1.0)
        self.assertEqual(crowd_multiplier(2.2, thr), 0.75)
        self.assertEqual(crowd_multiplier(2.6, thr), 0.5)
        self.assertEqual(crowd_multiplier(3.2, thr), 0.0)

    def test_regime_transition_50pct(self):
        thr = e_thresholds("R3", "R2", transition=True)
        self.assertAlmostEqual(thr["x75"], 1.5)     # (2.0+1.0)/2


class TestSizingConstraints(unittest.TestCase):
    def test_positions_meet_all_constraints(self):
        data = S.load_all()
        t = data["dates"][-1]
        df, reg = build_factor_df(data, t)
        comp = prompt_a(df, reg)
        longs = list(comp.dropna().nlargest(8).index)
        shorts = [x for x in list(comp.dropna().nsmallest(8).index)
                  if x not in longs and df.loc[x, "revision"] < 0]
        crowd = pd.Series({x: float(np.nan) for x in df.index})
        pos = size_positions(df, longs, shorts, crowd, reg["label"])
        self.assertEqual(check_constraints(pos), [])


class TestHedge(unittest.TestCase):
    def test_put_spread_price_bounded(self):
        prem, payoff = put_spread_price(100.0, 0.3, 0.25)
        self.assertGreaterEqual(prem, 0)
        self.assertLessEqual(prem, 0.10)
        self.assertAlmostEqual(payoff, 0.0, places=9)   # ATM: 페이오프 0

    def test_annual_budget_respected(self):
        h = TailHedge()
        nav, paid = 1.0, 0.0
        for m in range(12):
            prem = h.roll(pd.Timestamp(f"2026-{m + 1:02d}-28"), 100.0, 0.3, nav, 0.0)
            nav -= prem
            paid += prem
            h.yearly_reset() if m == 11 else None
        self.assertLessEqual(paid, C.H_BUDGET + 1e-9)

    def test_drawdown_doubles_notional(self):
        h = TailHedge()
        h.roll(pd.Timestamp("2026-01-30"), 100.0, 0.3, 1.0, 0.0)
        n0 = h.spread["notional"]
        self.assertGreater(n0, 0.0)
        h2 = TailHedge()
        h2.roll(pd.Timestamp("2026-01-30"), 100.0, 0.3, 1.0, -0.15)
        # 드로다운 -10% -> 명목 ×2 (단 예산 상한 내)
        self.assertAlmostEqual(h2.spread["notional"], 2 * n0, places=6)
        self.assertLessEqual(h2.prem_paid_ytd, C.H_BUDGET + 1e-9)


class TestLookahead(unittest.TestCase):
    def test_factor_table_ignores_future_rows(self):
        data = S.load_all()
        t = data["dates"][120]
        df1 = F.factor_table(data, t, C.SECTOR_OF)
        future = data.copy()
        future["prices"] = data["prices"].loc[:data["dates"][200]]   # 미래 행 추가
        df2 = F.factor_table(future, t, C.SECTOR_OF)
        pd.testing.assert_frame_equal(df1, df2)


class TestSchema(unittest.TestCase):
    def test_output_matches_schema(self):
        data = S.load_all()
        t = data["dates"][-1]
        df, reg = build_factor_df(data, t)
        comp = prompt_a(df, reg)
        out = to_schema_json(t, "compute", reg, df, comp,
                             {"long": [], "short_or_underweight": []},
                             [], [], [])
        self.assertTrue(C.SCHEMA_KEYS <= set(out.keys()))
        s0 = out["scores"][0]
        self.assertTrue(C.SCORE_KEYS <= set(s0.keys()))
        self.assertTrue(set(C.FACTOR_Z_KEYS) <= set(s0["factor_z"].keys()))
        json.dumps(out)  # 직렬화 가능


if __name__ == "__main__":
    unittest.main(verbosity=2)
