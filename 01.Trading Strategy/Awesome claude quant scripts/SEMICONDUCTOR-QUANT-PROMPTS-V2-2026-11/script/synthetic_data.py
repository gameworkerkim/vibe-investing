#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
synthetic_data.py — 합성 시장 데이터 생성기
===========================================
실데이터(yfinance 등) 없이 프롬프트 규칙을 검증하기 위한 결정적(seed 고정) 합성 데이터.
- 가격: 국면별 드리프트 + 시장/개별 요인, 2026-07 모멘텀 붕괴 스트레스 주입
- 사이클 입력: DRAM/NAND 계약가 변화율, 재고일수, CAPEX/매출, HBM 완판 플래그
- NTM EPS 컨센서스, 밸류에이션, 크라우딩, 옵션 IV
실데이터를 쓰려면 make_real_data()를 채우면 된다(같은 컬럼 계약).
"""
from __future__ import annotations

import numpy as np
import pandas as pd

from config import (BACKTEST_START, DATA_END, UNIVERSE, REGIME_INV_NAMES,
                    SUBSECTORS, CYCLE_SENSITIVITY)

SEED = 42

# 월별 진국면 (2020-01 ~ 2026-10). 2026-07 스트레스는 별도 가격 충격으로 주입.
REGIME_PATH = (
    [("2020", "R1")] * 12
    + [("2021", "R2")] * 12
    + [("2022", "R4")] * 12
    + [("2023", "R1")] * 12
    + [("2024", "R2")] * 12
    + [("2025", "R3")] * 12
    + [("2026", "R3")] * 6
    + [("2026", "R4")] * 4
)

# 국면별 산업 드리프트(일간) — 메모리·스토리지 기준
REGIME_DRIFT = {"R1": 0.0005, "R2": 0.0011, "R3": 0.0001, "R4": -0.0009}
# GPU/CPU는 메모리 사이클 민감도 0.5 + AI 구조적 성장
GPU_CPU_SECULAR = 0.0004


def _rng():
    return np.random.default_rng(SEED)


def make_cycle_data():
    """국면 판정 입력(a/b/c/d) 월별 시계열. 분류 규칙과 정합하도록 설계.

    a: DRAM/NAND 계약가 3개월 변화율(%), b: 재고일수 YoY 변화(pp),
    c: 메모리 CAPEX/매출, d: HBM 차기 연도 물량 완판 언급(0/1)
    2015~2019는 중립(≈0) 이력 — 60M z-score 기준점 제공용.
    """
    rng = _rng()
    idx = pd.date_range("2015-01-31", DATA_END, freq="ME")
    a_raw, b_raw, c_raw, d_raw = [], [], [], []

    def base(ts: pd.Timestamp):
        y, m = ts.year, ts.month
        if y < 2020:
            return 0.0, 0.0, 0.0, 0            # 중립 이력
        if y == 2020: return 8.0, -9.0, -0.4, 0    # R1
        if y == 2021: return 16.0, -4.0, 0.7, 1    # R2
        if y == 2022: return -6.0, 11.0, 0.2, 0    # R4
        if y == 2023: return 8.0, -9.0, -0.4, 0    # R1
        if y == 2024:                              # R2 후반: a 분기별 둔화 18 -> 15
            a = 18.0 - 3.0 * (m - 1) / 11.0
            return a, -4.0, 0.7, 1
        if y == 2025:                              # R3: a 둔화 지속 14 -> 12
            a = 14.0 - 2.0 * (m - 1) / 11.0
            return a, 3.0, 1.5, 1
        if m <= 6:                                 # 2026 H1: R3 후반 13 -> 11
            a = 13.0 - 2.0 * (m - 1) / 5.0
            return a, 3.0, 1.5, 1
        return -6.0, 11.0, 0.2, 0                  # 2026 H2: R4

    for ts in idx:
        a, b, c, d = base(ts)
        a_raw.append(a + rng.normal(0, 0.6))
        b_raw.append(b + rng.normal(0, 0.5))
        c_raw.append(c + rng.normal(0, 0.2))
        d_raw.append(d if rng.random() > 0.05 else 1 - d)
    return pd.DataFrame({"a": a_raw, "b": b_raw, "c": c_raw, "d": d_raw}, index=idx)


def make_prices():
    """일별 종가(USD, KR 종목은 USD 환산 후). 2026-07 스트레스 충격 포함."""
    rng = _rng()
    dates = pd.bdate_range(BACKTEST_START, DATA_END)
    n = len(dates)
    px = pd.DataFrame(index=dates)

    # 월 -> 국면 매핑
    periods = pd.period_range("2020-01", dates[-1].to_period("M"), freq="M")
    regime_map = {ts: REGIME_PATH[min(i, len(REGIME_PATH) - 1)][1]
                  for i, ts in enumerate(periods)}

    drift = np.zeros((n, len(UNIVERSE)))
    crash = np.zeros(n)
    # 2026-07-13 ~ 2026-07-24 (10 거래일) 모멘텀 붕괴
    crash_dates = pd.bdate_range("2026-07-13", "2026-07-24")
    crash[dates.isin(crash_dates)] = 1.0

    # 종목별 알파(AR(1) 지속성) — 모멘텀 팩터가 유효하도록 느린 상대강도 부여
    alphas = {}
    for ticker in UNIVERSE:
        eps = rng.normal(0, 0.00015, n)
        a = np.zeros(n)
        for i in range(1, n):
            a[i] = 0.985 * a[i - 1] + eps[i]
        alphas[ticker] = a
    # 붕괴 직전 12M 고모멘텀 종목이 추가 타격 (모멘텀 언와인드 재현)
    px_pre = {}
    for ticker in UNIVERSE:
        dr_pre = np.array([REGIME_DRIFT[regime_map[d.to_period("M")]] for d in dates])
        px_pre[ticker] = pd.Series(100 * np.exp(np.cumsum(dr_pre + alphas[ticker])),
                                   index=dates)
    mom_pre = {}
    for ticker in UNIVERSE:
        s = px_pre[ticker]
        start = s.loc[dates[dates <= "2025-07-10"][-1]]
        end = s.loc[dates[dates <= "2026-07-10"][-1]]
        mom_pre[ticker] = end / start - 1
    mom_series = pd.Series(mom_pre)
    top_mom = set(mom_series.nlargest(max(2, len(UNIVERSE) // 3)).index)

    for j, (ticker, (sector, _)) in enumerate(UNIVERSE.items()):
        sens = CYCLE_SENSITIVITY[sector]
        dr = np.array([REGIME_DRIFT[regime_map[d.to_period("M")]] for d in dates])
        if sector in ("GPU", "CPU"):
            dr = dr * sens + GPU_CPU_SECULAR
        else:
            dr = dr * sens
        idio = rng.normal(0, 0.014, n)
        market = rng.normal(0, 0.011, n)
        # 스트레스: 시장 -2.5%/일 + 고모멘텀 종목 추가 -2%/일
        shock = crash * (-0.025 - 0.02 * (ticker in top_mom))
        shock += crash * (sector in ("MEM", "STO")) * -0.006  # MU/메모리 추가 급락
        ret = dr + 0.8 * market + idio + alphas[ticker] + shock
        # 붕괴 직후 변동성 급등
        ret[crash.astype(bool)] = ret[crash.astype(bool)] * 1.6
        px[ticker] = 100 * np.exp(np.cumsum(ret))

    return px, dates


def make_eps_and_fundamentals(dates):
    """월별 NTM EPS, 애널리스트 수, 재무 팩터. SNDK는 2025-07 이전 결측."""
    rng = _rng()
    idx = pd.date_range("2019-12-31", DATA_END, freq="ME")
    eps = pd.DataFrame(index=idx, dtype=float)
    n_analysts = pd.DataFrame(index=idx, dtype=float)
    om_slope = pd.DataFrame(index=idx, dtype=float)
    fcf_margin = pd.DataFrame(index=idx, dtype=float)
    nd_ebitda = pd.DataFrame(index=idx, dtype=float)
    book_ps = pd.DataFrame(index=idx, dtype=float)
    fcf_ta = pd.DataFrame(index=idx, dtype=float)
    eps_vol = pd.DataFrame(index=idx, dtype=float)
    mcap = pd.DataFrame(index=idx, dtype=float)

    for ticker, (sector, _) in UNIVERSE.items():
        sens = CYCLE_SENSITIVITY[sector]
        g = rng.normal(0.0000, 0.02) if sector in ("GPU",) else rng.normal(0.0, 0.015)
        eps0 = rng.uniform(0.8, 6.0)
        e = []
        for i, ts in enumerate(idx):
            reg = _regime_for(ts)
            cyc = {"R1": 0.010, "R2": 0.022, "R3": 0.006, "R4": -0.020}[reg] * sens
            e.append(eps0 * np.exp(g * i + cyc * i / 12))
        eps[ticker] = np.array(e) * (1 + rng.normal(0, 0.015, len(idx)))
        n_analysts[ticker] = rng.integers(8, 42, len(idx))
        if ticker == "PSTG":                      # 애널리스트 5명 미만 -> revision N/A 경로
            n_analysts[ticker] = rng.integers(3, 5, len(idx))
        om_slope[ticker] = rng.uniform(-0.002, 0.004, len(idx)) + 0.0008 * sens
        fcf_margin[ticker] = rng.uniform(0.03, 0.22, len(idx))
        nd_ebitda[ticker] = rng.uniform(0.0, 3.0, len(idx))
        book_ps[ticker] = np.cumsum(rng.normal(0.15, 0.02, len(idx)))
        fcf_ta[ticker] = rng.uniform(0.04, 0.18, len(idx))
        eps_vol[ticker] = rng.uniform(0.1, 0.4, len(idx))
        mcap[ticker] = np.sort(rng.uniform(3e10, 3e12, len(idx)))

    if "SNDK" in eps:
        eps.loc[idx < "2025-07", "SNDK"] = np.nan       # 분할 상장 전 결측
        book_ps.loc[idx < "2025-07", "SNDK"] = np.nan
    return {"ntm_eps": eps, "n_analysts": n_analysts, "om_slope": om_slope,
            "fcf_margin": fcf_margin, "nd_ebitda": nd_ebitda,
            "book_ps": book_ps, "fcf_ta": fcf_ta, "eps_vol": eps_vol, "mcap": mcap}


def _regime_for(ts: pd.Timestamp) -> str:
    if ts.year < 2021: return "R1"
    if ts.year == 2021: return "R2"
    if ts.year == 2022: return "R4"
    if ts.year == 2023: return "R1"
    if ts.year == 2024: return "R2"
    if ts.year == 2025: return "R3"
    return "R3" if ts.month <= 6 else "R4"


def make_crowding():
    """월별 크라우딩 입력: 공매도 잔고/유동주식, DTC, IV 백분위, 스큐, ETF 플로우, 13F."""
    rng = _rng()
    idx = pd.date_range("2019-12-31", DATA_END, freq="ME")
    out = {}
    for ticker, (sector, _) in UNIVERSE.items():
        df = pd.DataFrame(index=idx)
        df["short_interest"] = np.clip(rng.uniform(0.005, 0.07, len(idx)), 0, 1)
        df["dtc"] = rng.uniform(1.0, 4.5, len(idx))
        df["iv_pct"] = rng.uniform(0.05, 0.95, len(idx))
        df["skew"] = rng.uniform(0.0, 8.0, len(idx))
        df["etf_flow"] = rng.normal(0, 0.4, len(idx))
        df["13f"] = rng.normal(0, 1, len(idx))
        df["borrow_fee"] = rng.uniform(0.002, 0.045, len(idx))
        if ticker == "000660.KS":               # 한국 종목: 공매도 가능 여부 결측(제도 확인 필요)
            df["borrow_available"] = np.where(rng.random(len(idx)) > 0.10, 1, np.nan)
        else:
            df["borrow_available"] = 1.0
        # 스트레스 직전 메모리 공매도 급증
        df.loc["2026-06":"2026-08", "short_interest"] *= 1.8
        df.loc["2026-06":"2026-08", "iv_pct"] = 0.98
        out[ticker] = df
    return out


def make_index_iv(dates):
    """테일 헤지용 'SMH 유사 지수' IV 시계열(연율)."""
    rng = _rng()
    iv = pd.Series(0.24 + 0.04 * rng.standard_normal(len(dates)), index=dates)
    crash = (dates >= "2026-07-13") & (dates <= "2026-08-14")
    iv[crash] = 0.60 + 0.10 * rng.standard_normal(int(crash.sum()))
    return iv.clip(0.08, 1.5)


def true_regime_map() -> dict:
    """{월 Period: 진국면} 매핑 (검증용 정답지)."""
    periods = pd.period_range("2020-01", "2026-11", freq="M")
    return {ts: REGIME_PATH[min(i, len(REGIME_PATH) - 1)][1]
            for i, ts in enumerate(periods)}


def load_all():
    """전체 합성 데이터셋을 dict로 반환 (run_validation.py 진입점)."""
    px, dates = make_prices()
    fund = make_eps_and_fundamentals(dates)
    return {
        "prices": px,
        "dates": dates,
        "cycle": make_cycle_data(),
        "crowding": make_crowding(),
        "index_iv": make_index_iv(dates),
        "regime_true": REGIME_PATH,
        **fund,
    }
