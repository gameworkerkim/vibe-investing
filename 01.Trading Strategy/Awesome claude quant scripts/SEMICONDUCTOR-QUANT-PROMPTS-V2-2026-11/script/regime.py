#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
regime.py — 프롬프트 A 2) 사이클 국면 판정 (R1~R4 / N/A)
=========================================================
입력(모두 자기 5년 이력 대비 z-score):
  a: DRAM·NAND 계약가 3개월 변화율
  b: MU·SK하이닉스·WDC·STX 공시 재고일수 전년 대비 변화
  c: 메모리 업체 CAPEX/매출
  d: 차기 연도 HBM 물량 협상 완료/완판 언급(0/1)
규칙: R1 a>0,b<0,c<=0 | R2 a>0,b<=0,c>0 | R4 a<0,b>0 | R3 a 둔화 & (b>0 | c>+1σ)
입력 2개 이상 N/A이면 "N/A", confidence="low". 우선순위: R1 > R2 > R4 > R3.
"""
from __future__ import annotations

import numpy as np
import pandas as pd

import config as C


def regime_inputs(cycle: pd.DataFrame, t: pd.Timestamp, window_m: int = 60) -> dict:
    """월별 사이클 시계열 -> t 시점의 a/b/c z-score와 d."""
    sub = cycle.loc[:t]
    if len(sub) < window_m:
        return {"a_z": np.nan, "b_z": np.nan, "c_z": np.nan, "d": np.nan,
                "n_na": 4, "a_prev_q_z": np.nan}

    def z_at(col, shift_m: int = 0):
        w = sub[col].tail(window_m + shift_m).head(window_m)
        s = w.std(ddof=0)
        return (w.iloc[-1] - w.mean()) / s if s and s > 0 else np.nan

    a_z = z_at("a")
    b_z = z_at("b")
    c_z = z_at("c")
    d = float(sub["d"].iloc[-1])
    a_prev_q_z = z_at("a", shift_m=3)   # R3 판정용: 직전 분기 a 대비 둔화
    n_na = int(np.isnan([a_z, b_z, c_z]).sum())
    return {"a_z": a_z, "b_z": b_z, "c_z": c_z, "d": d, "n_na": n_na,
            "a_prev_q_z": a_prev_q_z}


def classify(inp: dict) -> dict:
    """국면 규칙 적용. 2개 이상 N/A면 N/A(confidence low)."""
    a, b, c, d = inp["a_z"], inp["b_z"], inp["c_z"], inp["d"]
    n_na = inp["n_na"] if inp["n_na"] >= 0 else int(np.isnan([a, b, c]).sum())
    if n_na >= 2:
        return {"label": "N/A", "inputs_used": [], "confidence": "low"}
    decel = (a < inp.get("a_prev_q_z", np.nan)) if not np.isnan(inp.get("a_prev_q_z", np.nan)) else False
    used = [x for x, v in [("a", a), ("b", b), ("c", c)] if not np.isnan(v)]
    if a > 0 and b < 0 and c <= 0:
        return {"label": "R1", "inputs_used": used, "confidence": "high"}
    if a > 0 and b <= 0 and c > 0:
        return {"label": "R2", "inputs_used": used, "confidence": "high"}
    if a < 0 and b > 0:
        return {"label": "R4", "inputs_used": used, "confidence": "high"}
    if decel and (b > 0 or c > 1.0):
        return {"label": "R3", "inputs_used": used, "confidence": "mid"}
    return {"label": "N/A", "inputs_used": used, "confidence": "low"}


def regime_series(cycle: pd.DataFrame, dates: pd.DatetimeIndex) -> pd.Series:
    """월말 기준 국면 판정 시계열 (백테스트·차트용)."""
    out = {}
    for t in pd.date_range(dates[0], dates[-1], freq="ME"):
        out[t] = classify(regime_inputs(cycle, t))["label"]
    return pd.Series(out, name="regime")


def cycle_score_z(regime_label: str, sectors: pd.Series) -> pd.Series:
    """프롬프트 A cycle 점수 -> 유니버스 내 z (중립화는 scoring에서)."""
    base = sectors.map(lambda s: C.CYCLE_SCORE.get(regime_label, 0.0) * C.CYCLE_SENSITIVITY[s])
    if base.std(ddof=0) > 0:
        return (base - base.mean()) / base.std(ddof=0)
    return base * 0.0
