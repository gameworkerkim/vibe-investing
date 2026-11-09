#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
portfolio.py — 프롬프트 C(크라우딩 조정 롱/숏) + 프롬프트 E(국면 연동) 사이징
============================================================================
- crowd_z: 6개 구성 요소 z 평균(13F 가중치 ≤ 20%, 지연 기록)
- 후보 선정, 숏 금지 규칙, 1/σ60 기본 비중, crowd 배수, 상한·그로스·서브섹터 순노출 제약
- 리스크 트리거(단계적), 변동성 비율 축소, 단일 종목 손절, 재진입
"""
from __future__ import annotations

import numpy as np
import pandas as pd

import config as C


def crowd_z(data: dict, ticker: str, t: pd.Timestamp) -> tuple[float, list[str]]:
    """구성 요소별 z 평균. 각 요소의 데이터 지연을 lag 문자열로 함께 기록."""
    df = data["crowding"][ticker].loc[:t]
    if len(df) < 12:
        return np.nan, []
    zs, lags = [], []
    for k, w in C.CROWD_W.items():
        s = df[k].iloc[-12:]
        sd = s.std(ddof=0)
        if sd == 0 or np.isnan(sd):
            continue
        zs.append(w * (s.iloc[-1] - s.mean()) / sd)
        lags.append(k)
    lags_str = [k for k in lags]
    return float(np.sum(zs)), lags_str


def crowd_multiplier(z: float, thr: dict) -> float:
    """프롬프트 E 국면별 임계값 기준 ×0.75/×0.5/제외."""
    if np.isnan(z):
        return 1.0
    if z >= thr["exclude"]:
        return 0.0
    if z >= thr["x50"]:
        return 0.5
    if z >= thr["x75"]:
        return 0.75
    return 1.0


def e_thresholds(regime_label: str, prev_label: str | None, transition: bool) -> dict:
    """국면 전환 달에는 새 임계값 50%만 반영(프롬프트 E)."""
    new = C.E_THRESHOLDS[regime_label]
    if transition and prev_label and prev_label != regime_label:
        prev = C.E_THRESHOLDS[prev_label]
        return {k: prev[k] + (new[k] - prev[k]) * C.E_TRANSITION for k in new}
    return dict(new)


def select_candidates(df: pd.DataFrame, comp: pd.Series, crowd: pd.Series,
                      regime_label: str, prev_label: str | None = None,
                      transition: bool = False) -> dict:
    """프롬프트 C 1) 후보 선정.

    주의(검증 발견): 유니버스 15종목에서 "상위 1/3"은 5종목으로 롱 6~8종목 규칙과
    충돌한다. 여기서는 종목 수 규칙(6~8)을 우선해 상위 6종목을 사용하고 이를
    data_gap으로 보고한다.
    """
    thr = e_thresholds(regime_label, prev_label, transition)
    third = max(2, int(len(df) * C.D_TERCILE))
    n_long_min = C.C_LONG_N[0]
    top = comp.dropna().nlargest(max(third, n_long_min)).index
    bot12 = df["mom_12_1"].dropna().nsmallest(third).index
    bot3 = df["mom_3m"].dropna().nsmallest(third).index

    longs = [t for t in top if crowd.get(t, np.nan) < thr["exclude"] or np.isnan(crowd.get(t, np.nan))]
    shorts = []
    for t in bot12:
        if df.loc[t, "revision"] < 0:
            shorts.append(t)
    for t in df[df["DIVERGENCE_HIGH"] == True].index:  # noqa: E712
        if df.loc[t, "revision_z"] < C.C_SHORT_REV and t not in shorts:
            shorts.append(t)
    # 롱에 이미 포함된 종목은 숏에서 제외 (MRVL 등 이중 후보 충돌 방지)
    shorts = [t for t in shorts if t not in longs]
    return {"long": longs, "short": shorts, "thr": thr,
            "note": "top_third=5 < n_long_min=6 -> 종목 수 규칙 우선"}


def short_allowed(data: dict, ticker: str, t: pd.Timestamp) -> tuple[bool, str]:
    """숏 금지 규칙: DTC>5, 차입비용 결측/연 5% 초과, 한국 종목 공매도 가능 여부."""
    df = data["crowding"][ticker].loc[:t]
    if len(df) < 2:
        return False, "no_borrow_data"
    dtc = df["dtc"].iloc[-1]
    fee = df["borrow_fee"].iloc[-1]
    if dtc > C.C_DTC_LIMIT:
        return False, f"dtc>{C.C_DTC_LIMIT:g}"
    if pd.isna(fee) or fee > C.C_BORROW_FEE_LIMIT:
        return False, "borrow_fee>5%"
    if "borrow_available" in df.columns and pd.isna(df["borrow_available"].iloc[-1]):
        return False, "kr_short_unknown"
    return True, "ok"


def size_positions(df: pd.DataFrame, longs: list[str], shorts: list[str],
                   crowd: pd.Series, regime_label: str,
                   prev_label: str | None = None, transition: bool = False) -> list[dict]:
    """1/σ60 기본 비중 -> crowd 배수 -> 상한/그로스/서브섹터 제약 -> 목표 변동성."""
    thr = e_thresholds(regime_label, prev_label, transition)
    positions = []

    def build(side_tickers, side, n_range, gross, cap):
        base = pd.Series({t: 1.0 / df.loc[t, "sigma60"]
                          for t in side_tickers if pd.notna(df.loc[t, "sigma60"])})
        n = int(np.clip(len(base), n_range[0], n_range[1]))
        base = base.nlargest(n) if side == "long" else base.nsmallest(n)
        mult = {t: crowd_multiplier(crowd.get(t, np.nan), thr) for t in base.index}
        w = base * pd.Series(mult)
        w = w[w > 0]
        # 종목 상한
        for _ in range(6):
            w = w.clip(upper=cap)
            w = w / w.sum() * min(gross, cap * len(w))
        # 서브섹터 순노출 ≤ 25% (dual_exposure 반영)
        for _ in range(6):
            net = pd.Series(0.0)
            for t in w.index:
                sub = C.SECTOR_OF[t]
                net[sub] = net.get(sub, 0.0) + w[t]
                for d, frac in C.DUAL_EXPOSURE.get(t, {}).items():
                    net[d] = net.get(d, 0.0) + w[t] * frac
                    net[sub] = net[sub] - w[t] * frac
            over = net[net.abs() > C.C_SUBSECTOR_NET_CAP]
            if over.empty:
                break
            scale = min(C.C_SUBSECTOR_NET_CAP / net.abs()[over.index].max(), 1.0)
            w = w * scale
        return w

    w_long = build(longs, "long", C.C_LONG_N, C.C_GROSS_LONG, C.C_CAP_LONG)
    w_short = build(shorts, "short", C.C_SHORT_N, C.C_GROSS_SHORT, C.C_CAP_SHORT)
    # R3·R4: 메모리+스토리지 롱 그로스 합 ≤ 40% (프롬프트 E)
    if regime_label in ("R3", "R4"):
        ms = [t for t in w_long.index if C.SECTOR_OF[t] in ("MEM", "STO")]
        if ms and sum(w_long[t] for t in ms) > C.E_MEM_STO_LONG_CAP:
            s = C.E_MEM_STO_LONG_CAP / sum(w_long[t] for t in ms)
            for t in ms:
                w_long[t] *= s
    # 롱+숏 결합 기준 서브섹터 순노출 ≤ 25% 재수렴 (dual_exposure 반영)
    all_w = pd.concat([w_long, -w_short])
    for _ in range(6):
        net = pd.Series(0.0)
        for t, v in all_w.items():
            sub = C.SECTOR_OF[t]
            net[sub] = net.get(sub, 0.0) + v
            for d, frac in C.DUAL_EXPOSURE.get(t, {}).items():
                net[d] = net.get(d, 0.0) + v * frac
                net[sub] = net[sub] - v * frac
        over = net[net.abs() > C.C_SUBSECTOR_NET_CAP + 1e-12]
        if over.empty:
            break
        sc = min(C.C_SUBSECTOR_NET_CAP / over.abs().max(), 1.0)
        w_long = w_long * sc
        w_short = w_short * sc
        all_w = pd.concat([w_long, -w_short])

    for t in w_long.index:
        positions.append(_pos(df, t, "long", w_long[t], crowd.get(t, np.nan), thr))
    for t in w_short.index:
        positions.append(_pos(df, t, "short", -w_short[t], crowd.get(t, np.nan), thr))
    return positions


def _pos(df, t, side, weight, cz, thr) -> dict:
    s20 = df.loc[t, "sigma20"]
    stop = f"-{C.C_STOP_MULT:.1f} x σ20 x √5" + (f" = -{C.C_STOP_MULT * s20 * np.sqrt(5):.1%}" if pd.notna(s20) else "")
    codes = []
    if pd.notna(cz):
        codes.append("CROWD_HIGH" if cz >= thr["x75"] else "CROWD_OK")
    return {"ticker": t, "side": side, "weight": round(float(weight), 4),
            "crowd_z": round(float(cz), 3) if pd.notna(cz) else None,
            "stop_rule": stop, "rationale_codes": codes}


def check_constraints(positions: list[dict]) -> list[str]:
    """제약 위반 체크리스트(프롬프트 C 5)). 비중은 4자리 반올림 저장이므로 허용오차 1e-3."""
    TOL = 1e-3
    viol = []
    longs = [p for p in positions if p["side"] == "long"]
    shorts = [p for p in positions if p["side"] == "short"]
    g_l = sum(p["weight"] for p in longs)
    g_s = -sum(p["weight"] for p in shorts)
    if g_l > C.C_GROSS_LONG + TOL: viol.append(f"long gross {g_l:.1%}>{C.C_GROSS_LONG:.0%}")
    if g_s > C.C_GROSS_SHORT + TOL: viol.append(f"short gross {g_s:.1%}>{C.C_GROSS_SHORT:.0%}")
    if not (C.C_LONG_N[0] <= len(longs) <= C.C_LONG_N[1]):
        viol.append(f"n_long {len(longs)} not in {C.C_LONG_N}")
    if not (C.C_SHORT_N[0] <= len(shorts) <= C.C_SHORT_N[1]):
        viol.append(f"n_short {len(shorts)} not in {C.C_SHORT_N}")
    if any(p["weight"] > C.C_CAP_LONG + TOL for p in longs):
        viol.append("long cap breach")
    if any(-p["weight"] > C.C_CAP_SHORT + TOL for p in shorts):
        viol.append("short cap breach")
    net = pd.Series(0.0)
    for p in positions:
        w = p["weight"]
        sub = C.SECTOR_OF[p["ticker"]]
        net[sub] = net.get(sub, 0.0) + w
        for d, f in C.DUAL_EXPOSURE.get(p["ticker"], {}).items():
            net[d] = net.get(d, 0.0) + w * f
            net[sub] = net[sub] - w * f
    if (net.abs() > C.C_SUBSECTOR_NET_CAP + TOL).any():
        viol.append("subsector net cap breach")
    return viol


def risk_triggers(px: pd.DataFrame, t: pd.Timestamp) -> list[str]:
    """펀드 자체 모멘텀 L/S 팩터 수익률 기준 단계적 트리거 점검."""
    out = []
    r = px.pct_change().dropna()
    if len(r) >= 5:
        ret5 = (1 + r.iloc[-5:]).prod() - 1
        if ret5 <= C.C_TRIGGER_5D[0]:
            out.append(f"factor 5d {ret5:.1%} <= -5% -> gross -20%")
    if len(r) >= 10:
        ret10 = (1 + r.iloc[-10:]).prod() - 1
        if ret10 <= C.C_TRIGGER_10D[0]:
            out.append(f"factor 10d {ret10:.1%} <= -10% -> gross -40%")
    return out
