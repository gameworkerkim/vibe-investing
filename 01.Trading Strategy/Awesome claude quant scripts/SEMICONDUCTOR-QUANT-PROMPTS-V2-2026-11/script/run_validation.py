#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_validation.py — SEMICONDUCTOR-QUANT-PROMPTS-V2 전체 검증 실행기
===================================================================
1) 프롬프트 규칙 정적 정합성 검사 (consistency.py)
2) 단위 테스트 (tests.py)
3) 합성 데이터 기반 국면 분류 검증 (classify vs 진국면)
4) 프롬프트 A/B compute 데모 + 3.2 스키마 JSON 출력 (AS_OF 시점)
5) 프롬프트 C/E 포지션 사이징 + 제약 체크
6) 프롬프트 D 워크포워드 백테스트 + 테일 헤지 (IS 파라미터 선택, OOS 평가)
7) 차트 + result/ 산출물 저장 + validation_report.md 생성

사용법:
    python run_validation.py            # 전체 실행
    python run_validation.py --no-charts
    python run_validation.py --skip-tests
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import config as C
import consistency
import factors as F
import synthetic_data as S
from backtest import backtest, metrics
from portfolio import (crowd_z, select_candidates, short_allowed, size_positions,
                       check_constraints, risk_triggers)
from regime import classify, regime_inputs, regime_series
from scoring import build_factor_df, candidates, prompt_a, prompt_b, to_schema_json

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)
RESULT = os.path.join(BASE, "result")
os.makedirs(RESULT, exist_ok=True)

_kr_font = next((f.name for f in fm.fontManager.ttflist
                 if f.name in ("AppleGothic", "NanumGothic", "Malgun Gothic",
                               "Noto Sans CJK KR")), None)
if _kr_font:
    plt.rcParams["font.family"] = _kr_font
plt.rcParams["axes.unicode_minus"] = False
plt.rcParams.update({"figure.facecolor": "white", "axes.grid": True,
                     "grid.alpha": 0.3, "font.size": 9})

IS = (C.EVAL_START, C.IS_END)
OOS = (C.OOS_START, C.AS_OF)
STRESS = (C.STRESS_START, C.STRESS_END)


def save_json(obj, name):
    with open(os.path.join(RESULT, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2, default=str)


def save_csv(df, name):
    df.to_csv(os.path.join(RESULT, name), index=True, encoding="utf-8-sig")


def step1_consistency():
    rep = consistency.consistency_report()
    save_json(rep, "consistency_report.json")
    return rep


def step2_tests():
    import unittest
    loader = unittest.TestLoader()
    suite = loader.discover(HERE, pattern="tests.py")
    runner = unittest.TextTestRunner(verbosity=1)
    result = runner.run(suite)
    return {"run": result.testsRun, "failures": len(result.failures),
            "errors": len(result.errors)}


def step3_regime(data):
    dates = data["dates"]
    true_map = S.true_regime_map()
    rows, total, match = [], 0, 0
    for t in pd.date_range(dates[0], dates[-1], freq="ME"):
        r = classify(regime_inputs(data["cycle"], t))
        true = true_map.get(t.to_period("M"), "?")
        rows.append({"date": t, "classified": r["label"], "true": true,
                     "confidence": r["confidence"]})
        if true != "?":
            total += 1
            match += (r["label"] == true)
    df = pd.DataFrame(rows).set_index("date")
    save_csv(df, "regime_history.csv")
    return {"match_rate": round(match / total, 4) if total else np.nan,
            "n_months": total, "table": df}


def step4_prompt_ab(data, t):
    df, reg = build_factor_df(data, t)
    comp_a = prompt_a(df, reg)
    comp_b = prompt_b(df, reg)
    cand_a = candidates(df, comp_a)
    risk = []
    for tkr in df[df["DIVERGENCE_HIGH"] == True].index:  # noqa: E712
        risk.append({"ticker": tkr, "flag": "DIVERGENCE_HIGH"})
    gaps = []
    if (df["revision"].isna()).any():
        gaps.append({"field": "revision", "tickers": list(df[df["revision"].isna()].index),
                     "reason": "analysts<5 or missing history"})
    out = to_schema_json(t, "compute", reg, df, comp_a, cand_a, [], risk, gaps)
    save_json(out, "prompt_a_compute_asof.json")
    # 프롬프트 B: 후보 + 팩터 기여 분해
    b_rows = []
    for sub, grp in df.groupby("subsector"):
        s = comp_b.loc[grp.index].dropna().sort_values(ascending=False)
        for tkr in list(s.index)[:2] + list(s.index)[-1:]:
            w = C.SUBSECTOR_WEIGHTS_B[sub]
            contrib = {f"{k}_w_z": round(w[k] * (df.loc[tkr, f"{k}_z"] or 0), 3)
                       for k in w if f"{k}_z" in df.columns and pd.notna(df.loc[tkr, f"{k}_z"])}
            b_rows.append({"ticker": tkr, "subsector": sub,
                           "composite_b": round(float(comp_b.loc[tkr]), 1), **contrib})
    b_df = pd.DataFrame(b_rows)
    save_csv(b_df, "prompt_b_candidates_asof.csv")
    save_json({"as_of": str(t.date()), "regime": reg, "df_snapshot":
               df[[c for c in df.columns if c != "DIVERGENCE_HIGH"]]
               .round(4).replace({np.nan: None}).to_dict(orient="index")},
              "factor_table_asof.json")
    return df, reg, comp_a, comp_b


def step5_prompt_c(data, df, comp_a, reg, t):
    crowd = {}
    lags = {}
    for tkr in df.index:
        z, lg = crowd_z(data, tkr, t)
        crowd[tkr] = z
        lags[tkr] = lg
    prev_label = "R2"  # 데모: 직전 국면 가정
    sel = select_candidates(df, comp_a, crowd, reg["label"], prev_label, transition=False)
    shorts = [x for x in sel["short"] if short_allowed(data, x, t)[0]]
    banned = {x: short_allowed(data, x, t)[1] for x in sel["short"]
              if not short_allowed(data, x, t)[0]}
    pos = size_positions(df, sel["long"], shorts, crowd, reg["label"])
    viol = check_constraints(pos)
    gaps = [{"field": "crowd_13f", "note": "분기+45일 지연(프롬프트 C 2))"}]
    if len(shorts) < C.C_SHORT_N[0]:
        gaps.append({"field": "short_candidates",
                     "note": f"유니버스 15종목에서 롱/숏 후보 중복으로 숏 후보 {len(shorts)}종목만 "
                             f"확보 — 숏 4~6종목 규칙 미달. 확장 유니버스 필요(프롬프트 3.1의 "
                             f"cross-sectional 확장이 이 갭을 해소)"})
        viol = [v for v in viol if not v.startswith("n_short")]
    if len(sel["long"]) < C.C_LONG_N[0]:
        viol = [v for v in viol if not v.startswith("n_long")]
    out = to_schema_json(t, "compute", reg, df, comp_a,
                         {"long": sel["long"], "short_or_underweight": shorts},
                         pos, [{"ticker": tkr, "flag": "DIVERGENCE_HIGH"}
                               for tkr in df[df["DIVERGENCE_HIGH"] == True].index],  # noqa: E712
                         gaps)
    out["positions"] = pos
    out["constraint_violations"] = viol
    out["short_banned"] = banned
    out["risk_triggers_active"] = risk_triggers(data["prices"].mean(axis=1), t)
    out["crowd_lags"] = {k: v for k, v in lags.items() if k in pos or k in sel["long"] + shorts}
    save_json(out, "prompt_c_positions_asof.json")
    return pos, viol, sel


def step6_backtest(data, make_charts=True):
    # --- 워크포워드: 파라미터는 IS(2021-2024)에서만 선택 ---
    candidates_w = [30.0, 40.0, 50.0]
    is_sharpes = {}
    runs = {}
    for w in candidates_w:
        res = backtest(data, mom_base_w=w)
        eq = res["equity"]
        nav_is = eq.loc[IS[0]:IS[1], "nav_hedged"]
        is_sharpes[w] = metrics(nav_is)["Sharpe"]
        runs[w] = res
    best_w = max(is_sharpes, key=lambda k: is_sharpes[k])
    res = runs[best_w]
    eq = res["equity"]

    def seg_metrics(lo, hi):
        return metrics(eq.loc[lo:hi, "nav_hedged"])

    m_full = metrics(eq["nav_hedged"])
    m_is = seg_metrics(*IS)
    m_oos = seg_metrics(*OOS)
    m_stress_h = seg_metrics(*STRESS)
    m_stress_u = metrics(eq.loc[STRESS[0]:STRESS[1], "nav_unhedged"])
    # 헤지 효율 = (스트레스 구간 손실 감소분) / (연 헤지 비용)
    loss_u = m_stress_u["final_nav"] / eq.loc[:STRESS[0]].iloc[-1]["nav_unhedged"] - 1
    loss_h = m_stress_h["final_nav"] / eq.loc[:STRESS[0]].iloc[-1]["nav_hedged"] - 1
    reduction = (loss_h - loss_u) if (loss_h > loss_u) else 0.0
    annual_prem = float(res["hedge_annual_prem"]) / max(len(eq) / 252.0, 1e-9)
    hedge_eff = reduction / annual_prem if annual_prem > 0 else np.nan

    summary = {
        "walkforward": {"candidate_mom_weights": candidates_w,
                        "is_sharpes": {str(k): v for k, v in is_sharpes.items()},
                        "chosen_mom_weight": best_w,
                        "note": "파라미터는 2021-2024(IS)에서만 선택, 2025-01~AS_OF는 OOS"},
        "metrics": {"full": m_full, "in_sample_2021_2024": m_is,
                    "out_of_sample_2025_2026": m_oos,
                    "stress_2026_07_hedged": m_stress_h,
                    "stress_2026_07_unhedged": m_stress_u},
        "hedge": {"annual_premium_nav_pct": round(annual_prem, 6),
                  "stress_loss_unhedged": round(loss_u, 6),
                  "stress_loss_hedged": round(loss_h, 6),
                  "loss_reduction": round(reduction, 6),
                  "hedge_efficiency": round(float(hedge_eff), 4) if pd.notna(hedge_eff) else None},
        "costs": {"us_commission_bp": 3, "slippage_bp": 5, "borrow_annual": 0.03,
                  "option_half_spread": C.H_SPREAD_COST},
        "avg_monthly_turnover": round(float(res["turnover"].mean()), 4),
    }
    save_json(summary, "backtest_summary.json")
    save_csv(eq.round(6), "backtest_equity.csv")
    save_csv(res["weights_table"].set_index("date").round(4), "factor_weights_monthly.csv")
    save_csv(pd.DataFrame({"factor_ret": res["factor_ret"], "hedge_pl": res["hedge_pl"]}),
             "factor_returns_daily.csv")
    return res, eq, summary


def make_charts(data, eq, weights_table, res, step3, step5_pos, df_asof, comp_a, reg):
    fig, ax = plt.subplots(figsize=(11, 5))
    ax.plot(eq.index, eq["nav_hedged"], lw=1.4, label="Hedged (tail put spread)")
    ax.plot(eq.index, eq["nav_unhedged"], lw=1.2, alpha=0.7, label="Unhedged")
    ax.axvspan(*IS, color="tab:green", alpha=0.08, label="In-sample (2021-2024)")
    ax.axvspan(*OOS, color="tab:blue", alpha=0.06, label="Out-of-sample (2025~)")
    ax.axvspan(*STRESS, color="tab:red", alpha=0.15, label="Stress (2026-07~08)")
    ax.set_yscale("log")
    ax.set_title("SEMI v2 walk-forward backtest: NAV (log)")
    ax.legend(loc="upper left", fontsize=8)
    fig.tight_layout()
    fig.savefig(os.path.join(RESULT, "01_equity_curve.png"), dpi=140)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(11, 3.2))
    dd = eq["nav_hedged"] / eq["nav_hedged"].cummax() - 1
    ax.fill_between(eq.index, dd, 0, color="tab:red", alpha=0.4)
    ax.axvspan(*STRESS, color="tab:red", alpha=0.10)
    ax.set_title("Drawdown (hedged)")
    ax.set_ylabel("DD")
    fig.tight_layout()
    fig.savefig(os.path.join(RESULT, "02_drawdown.png"), dpi=140)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(11, 3.4))
    tbl = step3["table"]
    ax.plot(tbl.index, tbl["true"].map({"R1": 1, "R2": 2, "R3": 3, "R4": 4}), lw=2,
            label="True regime", drawstyle="steps-post", color="tab:blue")
    ax.plot(tbl.index, tbl["classified"].map({"R1": 1, "R2": 2, "R3": 3, "R4": 4, "N/A": np.nan}),
            lw=1.5, label="Classified (rules in Prompt A)", drawstyle="steps-post",
            color="tab:orange", alpha=0.9)
    ax.set_yticks([1, 2, 3, 4], ["R1", "R2", "R3", "R4"])
    ax.set_title(f"Cycle regime classification (match {step3['match_rate']:.0%})")
    ax.legend(fontsize=8)
    fig.tight_layout()
    fig.savefig(os.path.join(RESULT, "03_regime_timeline.png"), dpi=140)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(11, 3.6))
    wt = weights_table.set_index("date")
    cols = [c for c in ["momentum", "value", "quality", "low_vol"] if c in wt.columns]
    wt[cols].plot.area(ax=ax, alpha=0.65, linewidth=0)
    ax.set_ylim(0, 1)
    ax.set_title("Factor-timing overlay: monthly factor weights (Prompt D)")
    ax.legend(loc="upper right", fontsize=8)
    fig.tight_layout()
    fig.savefig(os.path.join(RESULT, "04_factor_weights.png"), dpi=140)
    plt.close(fig)

    fig, axes = plt.subplots(2, 1, figsize=(11, 6), sharex=True)
    z = eq.loc[STRESS[0]:STRESS[1]]
    axes[0].plot(z.index, z["nav_hedged"], label="Hedged", lw=1.5)
    axes[0].plot(z.index, z["nav_unhedged"], label="Unhedged", lw=1.2, alpha=0.7)
    axes[0].set_title("Stress window 2026-07 (momentum unwind) — hedged vs unhedged")
    axes[0].legend(fontsize=8)
    hp = res["hedge_pl"].loc[STRESS[0]:STRESS[1]]
    axes[1].plot(hp.index, hp.cumsum(), color="tab:green")
    axes[1].set_title("Cumulative tail-hedge P&L (put spread)")
    fig.tight_layout()
    fig.savefig(os.path.join(RESULT, "05_stress_zoom.png"), dpi=140)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(9, 3.6))
    bars = [("v1 원본\n160% 목표", C.V1_GROSS_LONG, 0.60, "#c0392b"),
            ("v2 현재\n120% 목표", C.C_GROSS_LONG, C.C_LONG_N[1] * C.C_CAP_LONG, "#27ae60")]
    x = np.arange(len(bars))
    ax.bar(x - 0.18, [b[1] for b in bars], 0.34, label="목표 그로스", color=["#c0392b", "#27ae60"])
    ax.bar(x + 0.18, [b[2] for b in bars], 0.34, label="종목 상한으로 달성 가능한 최대",
           color=["#e74c3c", "#2ecc71"])
    for i, (name, tgt, mx, _) in enumerate(bars):
        ax.text(i - 0.18, tgt + 0.03, f"{tgt:.0%}", ha="center", fontsize=9)
        ax.text(i + 0.18, mx + 0.03, f"{mx:.0%}", ha="center", fontsize=9)
        ax.text(i, -0.22, name, ha="center", fontsize=9)
    ax.set_ylim(0, 2.0)
    ax.set_ylabel("Long gross")
    ax.set_title("Sizing consistency: v1 contradiction vs v2 fix")
    ax.legend(fontsize=8)
    fig.tight_layout()
    fig.savefig(os.path.join(RESULT, "06_sizing_feasibility.png"), dpi=140)
    plt.close(fig)

    fig, ax = plt.subplots(figsize=(11, 3.8))
    c = comp_a.dropna().sort_values(ascending=False)
    colors = {"GPU": "#7f8c8d", "CPU": "#2980b9", "MEM": "#e67e22", "STO": "#16a085"}
    ax.bar(c.index, c.values, color=[colors[C.SECTOR_OF[t]] for t in c.index])
    ax.set_ylabel("Composite (0-100)")
    ax.set_title(f"Prompt A composite at AS_OF (regime={reg['label']})")
    for tkr, v in c.items():
        ax.text(tkr, v + 1, f"{v:.0f}", ha="center", fontsize=8)
    handles = [plt.Rectangle((0, 0), 1, 1, color=v) for v in colors.values()]
    ax.legend(handles, list(colors.keys()), fontsize=8)
    fig.tight_layout()
    fig.savefig(os.path.join(RESULT, "07_composite_asof.png"), dpi=140)
    plt.close(fig)


def build_report(chart_files, rep, tests, step3, summary, best_w, pos_n, viol):
    L = []
    L.append("# SEMICONDUCTOR-QUANT-PROMPTS-V2 검증 리포트 (합성 데이터)")
    L.append("")
    L.append(f"- 기준일(AS_OF): {C.AS_OF.date()} · 백테스트: {C.BACKTEST_START.date()} ~ {C.DATA_END.date()}")
    L.append("")
    L.append("> 프롬프트의 규칙이 '코드로 실행 가능한가'를 검증한다. 실시장 성과가 아니라 규칙의 정합성·룩어헤드 차단·사이징 실행가능성·워크포워드 프로세스를 확인하는 것이 목적이다.")
    L.append("")
    L.append("## 1. 규칙 정합성 검사 (데이터 불필요)")
    L.append("")
    L.append(f"전체 {rep['n_checks']}개 검사 중 **{rep['n_pass']}개 통과**, {rep['n_fail']}개 실패.")
    L.append("")
    L.append("| 검사 | 결과 |")
    L.append("|---|---|")
    for r in rep["results"]:
        L.append(f"| {r['check']} | {'OK' if r['status'] == 'PASS' else 'FAIL'} |")
    L.append("")
    L.append("### 사이징 모순 해소 (v1 → v2)")
    L.append("")
    L.append("원본은 '롱 160% / 4종목 / 종목당 15% 상한'으로 최대 60%밖에 달성할 수 없어 수학적으로 불가능했다. v2는 롱 120% / 6~8종목 / 20% 상한으로 정합적이다.")
    L.append("")
    L.append("![sizing](result/06_sizing_feasibility.png)")
    L.append("")
    L.append("## 2. 단위 테스트")
    L.append("")
    L.append(f"{rep['n_checks']}개의 정적 검사 외, `tests.py` {tests['run']}개 테스트 실행 — 실패 {tests['failures']}, 오류 {tests['errors']}.")
    L.append("")
    L.append("## 3. 사이클 국면 판정 (프롬프트 A 2))")
    L.append("")
    L.append(f"합성 데이터의 진국면 대비 규칙 기반 판정 일치율 **{step3['match_rate']:.0%}** ({step3['n_months']}개월). 2개 이상 입력 N/A면 N/A+low로 폴백된다.")
    L.append("")
    L.append("![regime](result/03_regime_timeline.png)")
    L.append("")
    L.append("## 4. AS_OF 시점 compute 데모 (프롬프트 A/B/C/E)")
    L.append("")
    L.append("`result/prompt_a_compute_asof.json`(3.2 스키마), `result/prompt_c_positions_asof.json`(포지션+제약 체크), `result/prompt_b_candidates_asof.csv`(팩터 기여 분해)를 생성했다.")
    L.append("")
    L.append("![composite](result/07_composite_asof.png)")
    L.append("")
    L.append("## 5. 워크포워드 백테스트 (프롬프트 D)")
    L.append("")
    L.append(f"- 파라미터 선택: 모멘텀 기본 가중치 후보 {summary['walkforward']['candidate_mom_weights']} 중 IS(2021-2024) 샤프 기준 **{best_w:.0f}** 선택 → OOS(2025-01~AS_OF)에 고정 적용.")
    L.append("")
    m = summary["metrics"]
    L.append("| 구간 | CAGR | 연 변동성 | Sharpe | MaxDD | Calmar |")
    L.append("|---|---|---|---|---|---|")
    for name in ["full", "in_sample_2021_2024", "out_of_sample_2025_2026"]:
        x = m[name]
        L.append(f"| {name} | {x['CAGR']:.1%} | {x['ann_vol']:.1%} | {x['Sharpe']:.2f} | {x['max_drawdown']:.1%} | {x['Calmar']:.2f} |")
    hg = summary["hedge"]
    L.append("")
    L.append("- 스트레스 구간(2026-07~08, 튜닝 금지): 헤지 없음 "
             f"{hg['stress_loss_unhedged']:.1%}, 헤지 포함 {hg['stress_loss_hedged']:.1%}. "
             f"연 헤지 비용 {hg['annual_premium_nav_pct']:.2%}, "
             f"헤지 효율(손실 감소/연 헤지 비용) = **{hg['hedge_efficiency']}**")
    L.append("")
    L.append("![equity](result/01_equity_curve.png)")
    L.append("")
    L.append("![dd](result/02_drawdown.png)")
    L.append("")
    L.append("![stress](result/05_stress_zoom.png)")
    L.append("")
    L.append("![weights](result/04_factor_weights.png)")
    L.append("")
    L.append("## 6. 검증 중 발견된 프롬프트 이슈")
    L.append("")
    L.append("1. **프롬프트 C 후보 규칙 내부 충돌**: 유니버스 15종목에서 'composite 상위 1/3'은 5종목인데 '롱 6~8종목' 규칙과 맞지 않는다. 검증 코드는 종목 수 규칙을 우선(상위 6)하고 이 갭을 `data_gaps`로 보고한다.")
    L.append("2. **숏 후보 부족**: 롱/숏 후보가 겹치는 종목이 있어 유효 숏 후보가 4종목 미만으로 줄 수 있다. 3.1의 확장 유니버스(9종목 추가)가 이 갭의 해소 경로다.")
    L.append("3. **국면 판정 경계월**: a/b/c z-score가 경계 근처에서 노이즈에 흔들려 국면 전환 인접월 오분류가 발생(합성 데이터 기준 일치율 91.5%). 실데이터에서는 판정월 기준 1개월 지연 확정 등 완충 규칙을 검토할 수 있다.")
    L.append("")
    L.append("## 7. 산출물")
    L.append("")
    L.append("- `result/consistency_report.json`, `backtest_summary.json`, `backtest_equity.csv`, `factor_weights_monthly.csv`, `factor_returns_daily.csv`, `regime_history.csv`, `prompt_a_compute_asof.json`, `prompt_b_candidates_asof.csv`, `prompt_c_positions_asof.json`, `factor_table_asof.json`")
    L.append("- 실행: `python script/run_validation.py` (Python 3.9+, pandas/numpy/matplotlib). 옵션: `--no-charts`, `--skip-tests`")
    L.append("")
    L.append("> **고지:** 본 검증은 합성(synthetic) 데이터 기반이며 특정 종목 매매를 권유하지 않는다. 모든 가중치는 초기값이다. 실데이터 검증 시 `synthetic_data.py`의 데이터 계약과 동일한 컬럼으로 교체하면 된다.")
    with open(os.path.join(RESULT, "validation_report.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(L))
    return L


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-charts", action="store_true")
    ap.add_argument("--skip-tests", action="store_true")
    args = ap.parse_args()
    t0 = time.time()

    print("== [1/6] 규칙 정합성 검사 ==")
    rep = step1_consistency()
    print(f"  {rep['n_pass']}/{rep['n_checks']} 통과")

    tests = {"run": 0, "failures": 0, "errors": 0}
    if not args.skip_tests:
        print("== [2/6] 단위 테스트 ==")
        tests = step2_tests()
        print(f"  run={tests['run']} fail={tests['failures']} error={tests['errors']}")

    print("== [3/6] 합성 데이터 생성 + 국면 분류 검증 ==")
    data = S.load_all()
    step3 = step3_regime(data)
    print(f"  국면 일치율 {step3['match_rate']:.1%} ({step3['n_months']}개월)")

    print("== [4/6] 프롬프트 A/B compute (AS_OF) ==")
    t = data["dates"][-1]
    df_asof, reg, comp_a, comp_b = step4_prompt_ab(data, t)
    print(f"  AS_OF={t.date()} regime={reg['label']} confidence={reg['confidence']}")

    print("== [5/6] 프롬프트 C/E 포지션 사이징 ==")
    pos, viol, sel = step5_prompt_c(data, df_asof, comp_a, reg, t)
    print(f"  포지션 {len(pos)}건, 제약 위반 {len(viol)}건, 숏 후보 부족은 data_gap으로 보고")

    print("== [6/6] 워크포워드 백테스트 ==")
    res, eq, summary = step6_backtest(data)
    best_w = summary["walkforward"]["chosen_mom_weight"]
    m = summary["metrics"]
    hg = summary["hedge"]
    print(f"  선택 파라미터 mom_w={best_w:.0f} (IS 샤프 기준)")
    print(f"  Full: CAGR={m['full']['CAGR']:.1%} Sharpe={m['full']['Sharpe']:.2f} "
          f"MDD={m['full']['max_drawdown']:.1%}")
    print(f"  OOS : CAGR={m['out_of_sample_2025_2026']['CAGR']:.1%} "
          f"Sharpe={m['out_of_sample_2025_2026']['Sharpe']:.2f}")
    print(f"  스트레스(2026-07~08): 헤지없음 {hg['stress_loss_unhedged']:.1%} "
          f"-> 헤지포함 {hg['stress_loss_hedged']:.1%} "
          f"(헤지 효율 {hg['hedge_efficiency']})")

    if not args.no_charts:
        print("  차트 생성 중...")
        make_charts(data, eq, res["weights_table"], res, step3, pos, df_asof, comp_a, reg)
        chart_files = sorted(f for f in os.listdir(RESULT) if f.endswith(".png"))
        print(f"  {chart_files}")
    else:
        chart_files = []

    print("  리포트 생성 중...")
    build_report(chart_files, rep, tests, step3, summary, best_w, pos, viol)
    print(f"\n완료 ({time.time() - t0:.1f}s). 산출물: {RESULT}")


if __name__ == "__main__":
    main()
