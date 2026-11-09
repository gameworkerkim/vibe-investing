#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
factors.py — 프롬프트 A/B/D 팩터 계산 (모두 t 시점 이전 데이터만 사용: 룩어헤드 차단)
=============================================================================
- mom_12_1, mom_3m, divergence 플래그
- revision (NTM EPS 3M 변화율, 애널리스트 5명 미만이면 N/A)
- quality (B: OM 3y 기울기+FCF 마진+순부채/EBITDA, D: FCF/총자산+EPS변동성 역수)
- value (서브섹터별 정의), low_vol, size, cycle 점수
- 서브섹터 중립 z-score (서브섹터 내 3종목 미만이면 해당 z 금지)
"""
from __future__ import annotations

import numpy as np
import pandas as pd

import config as C


def _z(x: pd.Series, min_periods: int = 24) -> float:
    x = x.dropna()
    if len(x) < min_periods:
        return np.nan
    s = x.std(ddof=0)
    return np.nan if (s == 0 or np.isnan(s)) else (x.iloc[-1] - x.mean()) / s


def _roll_z(x: pd.Series, window: int, min_periods: int = 24) -> pd.Series:
    """자기 과거 이력 대비 z-score(5y=60M/10y=120M 등)."""
    return (x - x.rolling(window, min_periods=min_periods).mean()) / \
           x.rolling(window, min_periods=min_periods).std(ddof=0)


def mom_12_1(px: pd.Series, t: pd.Timestamp) -> float:
    """직전 12개월 수익률 - 최근 1개월 제외. p(t-1M)/p(t-12M)-1"""
    sub = px.loc[:t]
    if len(sub) < 260:
        return np.nan
    p_now, p_1m, p_12m = sub.iloc[-1], sub.iloc[-21], sub.iloc[-252]
    return p_1m / p_12m - 1.0


def mom_3m(px: pd.Series, t: pd.Timestamp) -> float:
    sub = px.loc[:t]
    if len(sub) < 66:
        return np.nan
    return sub.iloc[-1] / sub.iloc[-63] - 1.0


def sigma_n(px: pd.Series, t: pd.Timestamp, n: int) -> float:
    """n일 실현 변동성(연율 아님, 일간)."""
    ret = px.loc[:t].pct_change().dropna()
    if len(ret) < n:
        return np.nan
    return ret.iloc[-n:].std(ddof=1)


def revision_3m(ntm_eps: pd.Series, n_analysts: pd.Series, t: pd.Timestamp) -> float:
    """NTM EPS 컨센서스 3개월 변화율(%). 애널리스트 5명 미만이면 N/A."""
    sub = ntm_eps.loc[:t]
    if len(sub) < 4:
        return np.nan
    if n_analysts.loc[:t].iloc[-1] < C.MIN_ANALYSTS:
        return np.nan
    cur, prev = sub.iloc[-1], sub.iloc[-4]
    if pd.isna(cur) or pd.isna(prev) or prev == 0:
        return np.nan
    return cur / prev - 1.0


def divergence_rank(px: pd.Series, t: pd.Timestamp) -> tuple[float, float]:
    """rank(mom_12_1) - rank(mom_3m) 산출용 원재료(유니버스 내 순위는 scoring에서)."""
    return mom_12_1(px, t), mom_3m(px, t)


def quality_b_z(om_slope: pd.Series, fcf_margin: pd.Series,
                nd_ebitda: pd.Series, t: pd.Timestamp, lookback_m: int = 36) -> float:
    """B quality: (OM 3y 추세 기울기, FCF 마진, -순부채/EBITDA) 평균 z."""
    zs = []
    for s in (om_slope, fcf_margin):
        zs.append(_z(s.loc[:t].iloc[-lookback_m:], min_periods=12))
    zs.append(-_z(nd_ebitda.loc[:t].iloc[-lookback_m:], min_periods=12))  # 낮을수록 +
    if any(np.isnan(z) for z in zs):
        return np.nan
    return float(np.mean(zs))


def quality_d_z(fcf_ta: pd.Series, eps_vol: pd.Series, t: pd.Timestamp) -> float:
    """D quality: z(FCF/총자산) + z(5년 EPS 변동성 역수) 평균."""
    z1 = _z(fcf_ta.loc[:t].iloc[-60:], min_periods=12)
    z2 = -_z(eps_vol.loc[:t].iloc[-60:], min_periods=12)
    if np.isnan(z1) or np.isnan(z2):
        return np.nan
    return float((z1 + z2) / 2.0)


def value_z(sector: str, price: pd.Series, ntm_eps: pd.Series, book_ps: pd.Series,
            fcf_margin: pd.Series, t: pd.Timestamp,
            cycle_avg_ebit: float | None = None) -> float:
    """서브섹터별 value 정의(프롬프트 B 1))."""
    sub_p, sub_e = price.loc[:t], ntm_eps.loc[:t]
    if sector in ("GPU", "CPU"):
        pe = sub_p.iloc[-1] / sub_e.iloc[-1] if len(sub_e) else np.nan
        return -_z(pe_series(price, ntm_eps, t), min_periods=24)
    if sector == "MEM":
        pb_z = -_z((price / book_ps).loc[:t], min_periods=24)      # P/B 10y 대신 가용 이력
        if cycle_avg_ebit is None or np.isnan(cycle_avg_ebit):
            return pb_z
        ev_ebit = price.iloc[-1] / cycle_avg_ebit
        return float(pb_z) + float(np.log1p(ev_ebit)) if ev_ebit > 0 else float(pb_z)
    if sector == "STO":
        fcf_y = fcf_margin.loc[:t].iloc[-1] / max(price.loc[:t].iloc[-1] / 100.0, 1e-9)
        return float(np.log1p(fcf_y))
    return np.nan


def pe_series(price: pd.Series, ntm_eps: pd.Series, t: pd.Timestamp) -> pd.Series:
    """NTM P/E 시계열(과거 5년)."""
    e = ntm_eps.loc[:t].replace(0, np.nan)
    if len(e) < 12:
        return pd.Series(dtype=float)
    return (price.loc[:t].resample("ME").last() / e).dropna()


def low_vol_z(px: pd.Series, t: pd.Timestamp) -> float:
    s60 = sigma_n(px, t, 60)
    return 1.0 / s60 if s60 and not np.isnan(s60) and s60 > 0 else np.nan


def size_z(mcap: pd.Series, t: pd.Timestamp) -> float:
    return float(np.log(mcap.loc[:t].iloc[-1])) if len(mcap.loc[:t]) else np.nan


def cycle_score_of(regime: str, sector: str) -> float:
    return C.CYCLE_SCORE.get(regime, 0.0) * C.CYCLE_SENSITIVITY[sector]


def factor_table(data: dict, t: pd.Timestamp, sector_map: dict) -> pd.DataFrame:
    """시점 t 기준 유니버스 전 종목 팩터 원시값 테이블(결측은 N/A 유지)."""
    rows = []
    for ticker in C.UNIVERSE:
        px = data["prices"][ticker]
        rows.append({
            "ticker": ticker,
            "subsector": sector_map[ticker],
            "mom_12_1": mom_12_1(px, t),
            "mom_3m": mom_3m(px, t),
            "revision": revision_3m(data["ntm_eps"][ticker], data["n_analysts"][ticker], t),
            "quality": quality_b_z(data["om_slope"][ticker], data["fcf_margin"][ticker],
                                   data["nd_ebitda"][ticker], t),
            "quality_d": quality_d_z(data["fcf_ta"][ticker], data["eps_vol"][ticker], t),
            "value": value_z(sector_map[ticker], px, data["ntm_eps"][ticker],
                             data["book_ps"][ticker], data["fcf_margin"][ticker], t),
            "low_vol": low_vol_z(px, t),
            "size": size_z(data["mcap"][ticker], t),
            "sigma60": sigma_n(px, t, 60),
            "sigma20": sigma_n(px, t, 20),
            "sigma90": sigma_n(px, t, 90),
        })
    return pd.DataFrame(rows).set_index("ticker")


def neutralize(df: pd.DataFrame, col: str, group_col: str = "subsector",
               min_names: int = 3) -> pd.Series:
    """유니버스 전체 z-score 후 서브섹터 평균을 빼서 중립화.
    서브섹터 종목 < min_names 면 해당 서브섹터는 N/A(0으로 채우지 않음)."""
    s = pd.Series(np.nan, index=df.index)
    valid = df[col].dropna()
    if len(valid) < 2:
        return s
    mu, sd = valid.mean(), valid.std(ddof=0)
    if sd == 0:
        return s
    z = (df[col] - mu) / sd
    for sub, grp in df.groupby(group_col):
        sub_z = z.loc[grp.index].dropna()
        if len(sub_z) >= min_names:
            s.loc[grp.index] = z.loc[grp.index] - sub_z.mean()
    return s
