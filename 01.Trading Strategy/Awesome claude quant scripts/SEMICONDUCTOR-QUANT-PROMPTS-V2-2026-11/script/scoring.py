#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scoring.py — 프롬프트 A/B 컴포지트 스코어, 후보 선정, 3.2 JSON 스키마 출력
=========================================================================
- composite = Σ(가중치 × 서브섹터 중립 z) -> 0~100 백분위
- A: 국면별 가중치(mom_12_1/revision/cycle), B: 서브섹터별 가중치
- 후보: 서브섹터별 상위 2 롱 / 하위 1 언더웨이트, DIVERGENCE_HIGH는 risk_flags
"""
from __future__ import annotations

import numpy as np
import pandas as pd

import config as C
import factors as F
from regime import cycle_score_z, classify, regime_inputs


def build_factor_df(data: dict, t: pd.Timestamp) -> pd.DataFrame:
    """원시 팩터 + 중립 z + cycle z까지 담은 유니버스 테이블."""
    raw = F.factor_table(data, t, C.SECTOR_OF)
    df = raw.copy()
    for col in ["mom_12_1", "mom_3m", "revision", "quality", "quality_d",
                "value", "low_vol"]:
        df[f"{col}_z"] = F.neutralize(df, col)
    reg = classify(regime_inputs(data["cycle"], t))
    df["cycle_z"] = cycle_score_z(reg["label"], df["subsector"])
    # divergence 순위 (유니버스 내 rank 차이, 상위 20% 플래그)
    if df["mom_12_1"].notna().sum() >= 5:
        r12 = df["mom_12_1"].rank(pct=True)
        r3 = df["mom_3m"].rank(pct=True)
        df["divergence"] = r12 - r3
        thr = df["divergence"].quantile(1 - C.DIVERGENCE_TOP_PCT)
        df["DIVERGENCE_HIGH"] = df["divergence"] >= thr
    else:
        df["divergence"], df["DIVERGENCE_HIGH"] = np.nan, False
    df["VALUE_TRAP"] = False
    df["QUALITY_MOMENTUM"] = False
    return df, reg


def composite(df: pd.DataFrame, weights: dict) -> pd.Series:
    """가중합 -> 0~100 백분위 (결측 팩터는 0이 아닌 무시 후 재정규화)."""
    comp = pd.Series(0.0, index=df.index)
    w_sum = pd.Series(0.0, index=df.index)
    for k, w in weights.items():
        col = f"{k}_z"
        if col not in df.columns:
            continue
        mask = df[col].notna()
        comp[mask] += w * df.loc[mask, col]
        w_sum[mask] += w
    comp = comp / w_sum.replace(0, np.nan)
    valid = comp.dropna()
    if len(valid) < 2:
        return comp
    r = comp.rank(pct=True) * 100.0
    return r


def prompt_a(df: pd.DataFrame, reg: dict) -> pd.Series:
    return composite(df, C.REGIME_WEIGHTS_A[reg["label"]])


def prompt_b(df: pd.DataFrame, reg: dict) -> pd.Series:
    comp = pd.Series(np.nan, index=df.index)
    df["VALUE_TRAP"] = False
    df["QUALITY_MOMENTUM"] = False
    for sub, w in C.SUBSECTOR_WEIGHTS_B.items():
        idx = df[df["subsector"] == sub].index
        comp.loc[idx] = composite(df.loc[idx], w)
    # VALUE_TRAP / QUALITY_MOMENTUM 플래그
    for tkr in df.index:
        if df.loc[tkr, "value_z"] > 0 and df.loc[tkr, "revision_z"] < C.VALUE_TRAP_REV_SIGMA:
            df.loc[tkr, "VALUE_TRAP"] = True
        if df.loc[tkr, "quality_z"] > C.QM_SIGMA and df.loc[tkr, "revision_z"] > C.QM_SIGMA:
            df.loc[tkr, "QUALITY_MOMENTUM"] = True
    return comp


def candidates(df: pd.DataFrame, comp: pd.Series, top_n: int = 2, bot_n: int = 1) -> dict:
    """서브섹터별 롱/언더웨이트 후보."""
    longs, unders = [], []
    for sub, grp in df.groupby("subsector"):
        s = comp.loc[grp.index].dropna().sort_values(ascending=False)
        longs += list(s.head(top_n).index)
        unders += list(s.tail(bot_n).index)
    return {"long": longs, "short_or_underweight": unders}


def rationale_codes(df: pd.DataFrame, tkr: str, reg: dict) -> list[str]:
    r = []
    if df.loc[tkr, "DIVERGENCE_HIGH"]:
        r.append("DIVERGENCE_HIGH")
    if df.loc[tkr, "revision_z"] > 0:
        r.append("REV_UP")
    elif df.loc[tkr, "revision_z"] < 0:
        r.append("REV_DOWN")
    if df.loc[tkr, "VALUE_TRAP"]:
        r.append("VALUE_TRAP")
    if df.loc[tkr, "QUALITY_MOMENTUM"]:
        r.append("QUALITY_MOMENTUM")
    r.append(f"REGIME_{reg['label'].replace('/', '')}")
    return r


def to_schema_json(as_of, mode, reg, df, comp, cand, positions, risk_flags, data_gaps,
                   factor_keys=("mom_12_1", "mom_3m", "revision", "quality", "value", "cycle")):
    """3.2 출력 스키마를 정확히 지키는 dict 생성."""
    scores = []
    for rank, tkr in enumerate(comp.dropna().sort_values(ascending=False).index, 1):
        fz = {k: round(float(df.loc[tkr, f"{k}_z"]), 4) if f"{k}_z" in df.columns and pd.notna(df.loc[tkr, f"{k}_z"]) else None for k in factor_keys}
        scores.append({
            "ticker": tkr,
            "subsector": C.SECTOR_OF[tkr],
            "dual_exposure": C.DUAL_EXPOSURE.get(tkr, {}),
            "factor_z": fz,
            "composite": round(float(comp.loc[tkr]), 2),
            "rank_in_universe": rank,
            "rationale_codes": rationale_codes(df, tkr, reg),
            "missing": [k for k in factor_keys if fz[k] is None],
        })
    return {
        "as_of": str(as_of.date()),
        "mode": mode,
        "regime": {"label": reg["label"], "inputs_used": reg["inputs_used"],
                   "confidence": reg["confidence"]},
        "scores": scores,
        "candidates": cand,
        "positions": positions,
        "risk_flags": risk_flags,
        "data_gaps": data_gaps,
    }
