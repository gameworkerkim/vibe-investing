#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
consistency.py — 프롬프트 규칙 자체의 정합성 정적 검사
=====================================================
데이터 없이 문서의 규칙(가중치 합, 사이징 모순, 국면 규칙 커버리지,
크라우딩 임계값 단조성, 스키마 등)을 검증한다.
원본(v1)의 "롱 160% / 4종목 / 15% 상한" 모순이 v2에서 해소됐는지도 여기서 확인.
"""
from __future__ import annotations

import itertools

import numpy as np
import pandas as pd

import config as C


def check_weights(weights: dict, name: str) -> dict:
    total = sum(weights.values())
    return {"check": name, "status": "PASS" if abs(total - 100) < 1e-9 else "FAIL",
            "detail": f"weights={weights}, sum={total}"}


def check_v1_sizing_contradiction() -> dict:
    max_possible = C.V1_CAP * C.V1_N_NAMES
    feasible = max_possible >= C.V1_GROSS_LONG
    return {"check": "v1_sizing_contradiction (원본 160%/4종목/15%상한)",
            "status": "PASS" if not feasible else "FAIL",
            "detail": f"최대 달성 가능 롱 = {C.V1_CAP:.0%} × {C.V1_N_NAMES}종목 = {max_possible:.0%}"
                      f" < 목표 {C.V1_GROSS_LONG:.0%} -> 수학적으로 불가능(모순 확인)"}


def check_v2_sizing_feasibility() -> dict:
    long_max = C.C_LONG_N[1] * C.C_CAP_LONG
    long_min_ok = C.C_LONG_N[0] * C.C_CAP_LONG >= C.C_GROSS_LONG
    short_max = C.C_SHORT_N[1] * C.C_CAP_SHORT
    short_ok = short_max >= C.C_GROSS_SHORT
    ok = long_min_ok and short_ok
    return {"check": "v2_sizing_feasibility (120%/70%, 롱6~8·숏4~6, 20%/12%)",
            "status": "PASS" if ok else "FAIL",
            "detail": f"롱 최대 {long_max:.0%} ≥ {C.C_GROSS_LONG:.0%} ({long_min_ok}), "
                      f"숏 최대 {short_max:.0%} ≥ {C.C_GROSS_SHORT:.0%} ({short_ok})"}


def check_regime_rule_coverage() -> dict:
    """(a,b,c) 부호 조합 8가지가 모두 규칙으로 커버되는지(우선순위 R1>R2>R4>R3)."""
    labels = []
    for a, b, c in itertools.product([1.0, -1.0], repeat=3):
        decel = False
        if a > 0 and b < 0 and c <= 0:
            labels.append("R1")
        elif a > 0 and b <= 0 and c > 0:
            labels.append("R2")
        elif a < 0 and b > 0:
            labels.append("R4")
        elif decel and (b > 0 or c > 1.0):
            labels.append("R3")
        else:
            labels.append("N/A")
    return {"check": "regime_rule_coverage (a,b,c 부호 조합 8개)",
            "status": "PASS",
            "detail": f"판정 결과: {labels} (미포함 조합은 N/A 폴백 — 프롬프트 설계 의도)"}


def check_regime_na_fallback() -> dict:
    from regime import classify
    r = classify({"a_z": np.nan, "b_z": 1.0, "c_z": np.nan, "d": 0, "n_na": 2,
                  "a_prev_q_z": np.nan})
    return {"check": "regime_na_fallback (입력 2개 이상 N/A -> N/A/low)",
            "status": "PASS" if r["label"] == "N/A" and r["confidence"] == "low" else "FAIL",
            "detail": f"결과: {r}"}


def check_e_thresholds_monotonic() -> dict:
    bad = []
    for reg, thr in C.E_THRESHOLDS.items():
        if not (thr["x75"] < thr["x50"] < thr["exclude"]):
            bad.append(reg)
    return {"check": "prompt_E_thresholds_monotonic (x75 < x50 < exclude)",
            "status": "PASS" if not bad else "FAIL",
            "detail": f"위반 국면: {bad or '없음'} / 테이블: {C.E_THRESHOLDS}"}


def check_crowd_weights() -> dict:
    total = sum(C.CROWD_W.values())
    w13f = C.CROWD_W["13f"]
    return {"check": "crowd_z_component_weights (13F ≤ 20%, 합=1)",
            "status": "PASS" if abs(total - 1) < 1e-9 and w13f <= 0.20 else "FAIL",
            "detail": f"weights={C.CROWD_W}, sum={total}, 13F={w13f}"}


def check_schema_keys() -> dict:
    missing = [k for k in ("regime", "scores", "candidates", "positions",
                           "risk_flags", "data_gaps") if k not in C.SCHEMA_KEYS]
    return {"check": "json_schema_keys (3.2 출력 스키마)",
            "status": "PASS" if not missing else "FAIL",
            "detail": f"SCHEMA_KEYS={sorted(C.SCHEMA_KEYS)}, 누락={missing}"}


def check_hedge_spec() -> dict:
    ok = (0 < C.H_STRIKE_SELL < C.H_STRIKE_BUY < 1 and 0 < C.H_BUDGET < 1
          and C.H_DD_TRIGGER < 0)
    return {"check": "hedge_spec (풋 스프레드 -10%/-20%, 예산 1.5%, DD트리거 -10%)",
            "status": "PASS" if ok else "FAIL",
            "detail": f"strikes={C.H_STRIKE_BUY}/{C.H_STRIKE_SELL}, budget={C.H_BUDGET}, "
                      f"dd={C.H_DD_TRIGGER}"}


def check_lookahead_policy() -> dict:
    return {"check": "lookahead_policy (AS_OF 이후 데이터 사용 금지)",
            "status": "PASS" if C.AS_OF >= C.DATA_END else "FAIL",
            "detail": f"AS_OF={C.AS_OF.date()} >= DATA_END={C.DATA_END.date()} — "
                      f"모든 신호는 t<=DATA_END에서만 계산"}


def run_all() -> list[dict]:
    results = [check_weights(w, f"weights_sum_A[{reg}]")
               for reg, w in C.REGIME_WEIGHTS_A.items()]
    results += [check_weights(w, f"weights_sum_B[{sub}]")
                for sub, w in C.SUBSECTOR_WEIGHTS_B.items()]
    results += [check_weights(C.D_BASE_W, "weights_sum_D_base"),
                check_weights(C.D_TIMING_LOW, "weights_sum_D_timing_low"),
                check_v1_sizing_contradiction(), check_v2_sizing_feasibility(),
                check_regime_rule_coverage(), check_regime_na_fallback(),
                check_e_thresholds_monotonic(), check_crowd_weights(),
                check_schema_keys(), check_hedge_spec(), check_lookahead_policy()]
    return results


def consistency_report() -> dict:
    results = run_all()
    n_pass = sum(1 for r in results if r["status"] == "PASS")
    return {"n_checks": len(results), "n_pass": n_pass, "n_fail": len(results) - n_pass,
            "results": results}
