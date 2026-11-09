#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
backtest.py — 프롬프트 D 사양의 워크포워드 백테스트 엔진
======================================================
- 월말 리밸런싱, 팩터 z는 모두 t 시점 이전 데이터만 사용
- 팩터 타이밍 오버레이(샤프 히스테리시스 + Jaccard 오버랩)
- 프롬프트 C 사이징/리스크 트리거 + 프롬프트 D 테일 헤지
- 평가 구간 2021-01~AS_OF, 파라미터는 2021-2024(IS)에서만 선택
- 2026-07 스트레스 구간은 튜닝에 사용하지 않음(별도 보고)
"""
from __future__ import annotations

import numpy as np
import pandas as pd

import config as C
import factors as F
from hedge import TailHedge


def mom_factor_return(prices: pd.DataFrame) -> pd.Series:
    """자체 모멘텀 L/S 팩터 일별 수익률(트리거·타이밍용).
    월말 mom_12_1 상위/하위 1/3 동일가중 L/S, 월별 리밸런싱."""
    dates = prices.index
    h = pd.DataFrame(0.0, index=dates, columns=prices.columns)
    for t in pd.date_range(dates[0], dates[-1], freq="ME"):
        m = prices.loc[:t]
        if len(m) < 260:
            continue
        mom = m.apply(lambda s: s.iloc[-22] / s.iloc[-253] - 1 if len(s) >= 253 else np.nan)
        mom = mom.dropna()
        third = max(2, int(len(mom) * C.D_TERCILE))
        longs = set(mom.nlargest(third).index)
        shorts = set(mom.nsmallest(third).index)
        for k in prices.columns:
            h.loc[t:, k] = (1.0 / third if k in longs
                            else -1.0 / third if k in shorts else 0.0)
    r = prices.pct_change().fillna(0.0)
    return (h * r).sum(axis=1)


def jaccard_overlap(df: pd.DataFrame) -> float:
    """mom_12_1 상위 1/3 ∩ mom_3m 상위 1/3 Jaccard."""
    third = max(2, int(len(df) * C.D_TERCILE))
    a = set(df["mom_12_1"].dropna().nlargest(third).index)
    b = set(df["mom_3m"].dropna().nlargest(third).index)
    u = a | b
    return len(a & b) / len(u) if u else np.nan


def timing_weights(df: pd.DataFrame, factor_ret: pd.Series, t: pd.Timestamp,
                   state: dict) -> tuple[dict, dict]:
    """프롬프트 D 3) 팩터 타이밍. state: {low_state, low_months, high_months, overlap_hist}"""
    w = dict(C.D_BASE_W)
    sub = factor_ret.loc[:t].iloc[-252:]
    sharpe = (sub.mean() / sub.std(ddof=0) * np.sqrt(252)
              if len(sub) > 20 and sub.std(ddof=0) > 0 else np.nan)
    if pd.notna(sharpe):
        if sharpe <= C.D_SHARPE_LOW:
            state["low_months"] += 1
            state["high_months"] = 0
        elif sharpe > C.D_SHARPE_HIGH:
            state["high_months"] += 1
            state["low_months"] = 0
        else:
            state["low_months"] = max(state["low_months"] - 1, 0)
            state["high_months"] = max(state["high_months"] - 1, 0)
    if state["low_months"] >= C.D_SHARPE_LOW_MONTHS:
        state["low_state"] = True
    if state["high_months"] >= C.D_SHARPE_HIGH_MONTHS:
        state["low_state"] = False
    if state["low_state"]:
        w = dict(C.D_TIMING_LOW)
    ov = jaccard_overlap(df)
    if not np.isnan(ov):
        state["overlap_hist"].append(ov)
        hist = pd.Series(state["overlap_hist"]).iloc[-60:]
        if len(hist) >= 12:
            lo = hist.mean() - hist.std(ddof=0)
            if ov < lo:
                w["momentum"] *= C.D_OVERLAP_MULT
    w = {k: v / sum(w.values()) for k, v in w.items()}
    return w, state


def _scale_to_constraints(new_pos: pd.Series) -> pd.Series:
    """종목 상한 / 롱·숏 그로스 / 서브섹터 순노출 ≤ 25% (프롬프트 C 3))."""
    for _ in range(8):
        cap = pd.Series([C.C_CAP_LONG if v > 0 else C.C_CAP_SHORT for v in new_pos],
                        index=new_pos.index)
        new_pos = new_pos.clip(-cap, cap)
        g_l = new_pos[new_pos > 0].sum()
        g_s = -new_pos[new_pos < 0].sum()
        if g_l > C.C_GROSS_LONG:
            new_pos[new_pos > 0] *= C.C_GROSS_LONG / g_l
        if g_s > C.C_GROSS_SHORT:
            new_pos[new_pos < 0] *= C.C_GROSS_SHORT / g_s
    for _ in range(6):
        net = pd.Series(0.0)
        for t_, v in new_pos.items():
            sub = C.SECTOR_OF[t_]
            net[sub] = net.get(sub, 0.0) + v
            for d_, f_ in C.DUAL_EXPOSURE.get(t_, {}).items():
                net[d_] = net.get(d_, 0.0) + v * f_
                net[sub] = net[sub] - v * f_
        over = net[net.abs() > C.C_SUBSECTOR_NET_CAP + 1e-12]
        if over.empty:
            break
        sc = C.C_SUBSECTOR_NET_CAP / over.abs().max()
        new_pos = new_pos * sc
    return new_pos


def backtest(data: dict, mom_base_w: float = 40.0) -> dict:
    """월말 리밸런싱 워크포워드 백테스트. mom_base_w는 IS(2021-2024)에서만 선택."""
    prices, dates = data["prices"], data["prices"].index
    idx_series = prices.mean(axis=1)
    iv = data["index_iv"]
    factor_ret = mom_factor_return(prices)

    w0 = dict(C.D_BASE_W)
    w0["momentum"] = mom_base_w
    w0 = {k: v / sum(w0.values()) for k, v in w0.items()}

    nav_h, nav_u = 1.0, 1.0
    nav_h_hist, nav_u_hist, dd_hist, hedge_pl_hist = [], [], [], []
    positions = pd.Series(0.0, index=prices.columns)
    gross_mult = 1.0
    state = {"low_state": False, "low_months": 0, "high_months": 0, "overlap_hist": []}
    hedge = TailHedge()
    entry_px = {}
    weights_table = []
    turnover_hist = []
    rebal_dates = pd.date_range(dates[0], dates[-1], freq="ME")
    rebal_iter = iter(rebal_dates)
    next_rebal = next(rebal_iter)

    for i, t in enumerate(dates):
        px_t = prices.loc[t]
        if i > 0 and t.year != dates[i - 1].year:
            hedge.yearly_reset()                   # 연간 프리미엄 예산 초기화
        # ---------------- 월말 리밸런싱 ----------------
        if t >= next_rebal:
            df_raw = F.factor_table(data, t, C.SECTOR_OF)
            df = df_raw.copy()
            for col in ["mom_12_1", "value", "quality_d", "low_vol", "size"]:
                df[f"{col}_z"] = F.neutralize(df, col)
            w_t, state = timing_weights(df_raw, factor_ret, t, state)
            # 워크포워드 파라미터: 모멘텀 기본 가중치(문서 초기값 40 기준 비례 조정)
            w_t = dict(w_t)
            w_t["momentum"] = w_t["momentum"] * (mom_base_w / C.D_BASE_W["momentum"])
            w_t = {k: v / sum(w_t.values()) for k, v in w_t.items()}
            # 팩터 키 -> z 컬럼 매핑 (프롬프트 D 1): momentum = mom_12_1
            factor_col = {"momentum": "mom_12_1", "value": "value",
                          "quality": "quality_d", "low_vol": "low_vol"}
            comp = pd.Series(0.0, index=df.index)
            ws = pd.Series(0.0, index=df.index)
            for k, wt in w_t.items():
                col = factor_col.get(k)
                if col is None:
                    continue
                zcol = f"{col}_z"
                if zcol in df.columns:
                    m = df[zcol].notna()
                    comp[m] += wt * df.loc[m, zcol]
                    ws[m] += wt
            comp = comp / ws.replace(0, np.nan)
            third = max(2, int(len(df) * C.D_TERCILE))
            longs = list(comp.dropna().nlargest(third).index)
            shorts = [x for x in list(comp.dropna().nsmallest(third).index) if x not in longs]
            inv_vol = pd.Series({x: 1.0 / df.loc[x, "sigma60"] for x in longs + shorts
                                 if pd.notna(df.loc[x, "sigma60"])})
            new_pos = pd.Series(0.0, index=prices.columns)
            for x in longs:
                new_pos[x] = inv_vol.get(x, 0.0)
            for x in shorts:
                new_pos[x] = -inv_vol.get(x, 0.0) * 0.5
            new_pos = _scale_to_constraints(new_pos)
            new_pos = new_pos * gross_mult
            turnover = (new_pos - positions).abs().sum()
            turnover_hist.append(turnover)
            cost = turnover * C.COST_US
            nav_h *= (1 - cost)
            nav_u *= (1 - cost)
            positions = new_pos
            entry_px = {x: px_t[x] for x in positions.index if positions[x] != 0}
            # 테일 헤지 월별 롤 (프리미엄은 보유 스프레드 mark-to-market으로 반영,
            # NAV에서는 거래 비용(스프레드 절반)만 차감)
            dd_now = dd_hist[-1] if dd_hist else 0.0
            fee = hedge.roll(t, idx_series.loc[t], iv.loc[t], nav_h, dd_now)
            nav_h -= fee
            weights_table.append({"date": t, **w_t, "gross_mult": gross_mult,
                                  "turnover": turnover})
            while next_rebal <= t:
                try:
                    next_rebal = next(rebal_iter)
                except StopIteration:
                    next_rebal = dates[-1] + pd.Timedelta(days=36500)
                    break

        # ---------------- 일별 리스크 트리거 (프롬프트 C 4)) ----------------
        ret5 = (1 + factor_ret.loc[:t].iloc[-5:]).prod() - 1 if i >= 5 else 0.0
        ret10 = (1 + factor_ret.loc[:t].iloc[-10:]).prod() - 1 if i >= 10 else 0.0
        if i >= 10 and ret10 <= C.C_TRIGGER_10D[0] and gross_mult > 0.6:
            gross_mult *= (1 - C.C_TRIGGER_10D[1])
            positions *= (1 - C.C_TRIGGER_10D[1])
        elif i >= 5 and ret5 <= C.C_TRIGGER_5D[0] and gross_mult > 0.8:
            gross_mult *= (1 - C.C_TRIGGER_5D[1])
            positions *= (1 - C.C_TRIGGER_5D[1])
        if i >= 5 and ret5 > 0 and gross_mult < 1.0:
            rs = [F.sigma_n(prices[x], t, 20) / F.sigma_n(prices[x], t, 90)
                  for x in prices.columns
                  if pd.notna(F.sigma_n(prices[x], t, 90)) and F.sigma_n(prices[x], t, 90) > 0]
            r_med = float(np.nanmedian(rs)) if rs else np.nan
            if pd.notna(r_med) and r_med < C.C_REENTRY_R:
                reentry_ok = True
            else:
                reentry_ok = False
        else:
            reentry_ok = False
        # 종목별: 변동성 비율 축소(전량 청산 아님) + 단일 종목 손절
        for x in positions.index:
            v = positions[x]
            if v == 0:
                continue
            s20, s90 = F.sigma_n(prices[x], t, 20), F.sigma_n(prices[x], t, 90)
            if pd.notna(s20) and pd.notna(s90) and s90 > 0:
                r_ = s20 / s90
                if r_ > C.C_VOL_RATIO:
                    positions[x] = v / r_
            if x in entry_px and pd.notna(s20) and entry_px[x] > 0:
                stop = -C.C_STOP_MULT * s20 * np.sqrt(5)
                if px_t[x] / entry_px[x] - 1 <= stop:
                    positions[x] = 0.0

        # ---------------- 일별 P&L ----------------
        ret_daily = prices.loc[:t].pct_change().iloc[-1].fillna(0.0)
        port_ret = float((positions * ret_daily).sum())
        borrow = -positions[positions < 0].sum() * 0.03 / 252.0
        hedge_pl = hedge.mark(t, idx_series.loc[t], iv.loc[t])
        nav_u *= (1 + port_ret - borrow)
        nav_h *= (1 + port_ret - borrow + hedge_pl)
        dd = float(nav_h / max(nav_h_hist) - 1) if nav_h_hist else 0.0
        nav_h_hist.append(nav_h)
        nav_u_hist.append(nav_u)
        dd_hist.append(dd)
        hedge_pl_hist.append(hedge_pl)

    equity = pd.DataFrame({"nav_hedged": nav_h_hist, "nav_unhedged": nav_u_hist,
                           "drawdown": dd_hist}, index=dates)
    return {"equity": equity,
            "weights_table": pd.DataFrame(weights_table),
            "factor_ret": factor_ret,
            "hedge_pl": pd.Series(hedge_pl_hist, index=dates),
            "turnover": pd.Series(turnover_hist),
            "hedge_annual_prem": hedge.annual_prem}


def metrics(nav: pd.Series, freq: int = 252) -> dict:
    nav = nav.dropna()
    if len(nav) < 10:
        return {"CAGR": np.nan, "ann_vol": np.nan, "Sharpe": np.nan,
                "max_drawdown": np.nan, "Calmar": np.nan, "final_nav": np.nan}
    ret = nav.pct_change().dropna()
    n_years = len(nav) / freq
    cagr = (nav.iloc[-1] / nav.iloc[0]) ** (1 / n_years) - 1 if n_years > 0 else np.nan
    vol = ret.std(ddof=1) * np.sqrt(freq)
    sharpe = (ret.mean() / ret.std(ddof=1) * np.sqrt(freq)) if ret.std(ddof=1) > 0 else np.nan
    dd = nav / nav.cummax() - 1
    mdd = dd.min()
    calmar = cagr / abs(mdd) if mdd and mdd != 0 else np.nan
    return {"CAGR": float(cagr), "ann_vol": float(vol), "Sharpe": float(sharpe),
            "max_drawdown": float(mdd), "Calmar": float(calmar),
            "final_nav": float(nav.iloc[-1])}
