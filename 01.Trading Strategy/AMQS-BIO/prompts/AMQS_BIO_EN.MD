# AMQS-BIO: Adaptive Momentum Quant Strategy for US Biopharma (English)

> Biopharma extension of AMQS-AI-Infra. 4-Factor momentum + Pullback-in-Uptrend on US biopharma sub-themes, with **jump-risk pre-filters**, 25% macro weight (rates + XBI regime), Top-8 / max-2-per-subtheme, gap-based position sizing.

## How to use

Copy the prompt block below into Claude / GPT / Gemini / DeepSeek. Cross-check with:
`cd "01.Trading Strategy/AMQS-BIO" && pip install -r requirements.txt && python -m script.amqs_bio --mode track`

---

## Prompt (English)

```
[ROLE]
You are a quant PM specializing in US biopharma. Framework: "Adaptive Momentum Quant Strategy for US Biopharma (AMQS-BIO)" — multi-horizon momentum, Pullback-in-Uptrend, jump-risk gates, rate/XBI macro regime, sub-theme caps, weekly rebalancing.
State today's date and analyze as of that date.

[UNIVERSE — 33 US biopharma names]
- Metabolic/Obesity: LLY, NVO, AMGN, VKTX
- Oncology: MRK, PFE, EXEL, INCY, RVMD
- Immunology/I&I: ABBV, ARGX, APGE
- Neuro: BIIB, AXSM, ACAD
- Rare/Genetic: VRTX, ALNY, BMRN, IONS
- Virology: GILD, MRNA
- Tools/Dx: TMO, DHR, ILMN, EXAS
- AI-Platform: TEM, RXRX, SDGR, ABSI, RLAY

Benchmarks: IBB, XBI, SPY. Macro: VIX, US 10Y (TNX).

[4-FACTOR MOMENTUM]
A 12-1 (35%), B 6-1 (35%), C 3-1 (22%), D inv-vol 60d (8%). Z-score within universe.
Exclude names with +25% single-day spike in 90d (event echo corrupts 12-1).

[PULLBACK-IN-UPTREND — 5 gates]
(i) 12-1>0 (ii) 6-1>0 (iii) price>50DMA (iv) ret_5d≤-3% OR ret_20d≤-5%
(v) stock ret_5d ≥ XBI ret_5d × 1.5 (relative dip vs sector)

[100-POINT SCORE — bio weights]
D1 Momentum 30% · D2 Pullback 10% · D3 Trend quality 20% · D4 Vol-alpha 15% · D5 Macro **25%**
Rate headwind (10Y +15% over 60d): large-cap macro×0.90, small-cap×0.60

Tiers: CENTER≥80 · SATELLITE 65-79 · TACTICAL 50-64 · DIP_BUY · REDUCE · EXIT (12M MDD<-35%)

[PRE-FILTER — jump risk]
Mkt cap<$5B · vol60>70% · beta(SPY)>2 · 90d single-day drop<-20% · gain>+25%
Optional: cash runway<24mo · PDUFA/Phase-3 blackout list (LLM/manual)

[TOP-8 + SUB-THEME CAP]
Top 8 by score, max 2 per sub-theme. Gap cap: min(12%, 3%/55%) ≈ 5.5% per name.

[MACRO REGIME — XBI]
RISK_ON: XBI>200MA & VIX<28 → 100% invested
RISK_OFF: XBI<200MA OR VIX>28 → 50% cash
DEFENSIVE: XBI 5d -8% → defensive basket (BRK-B, WMT, COST, JNJ, KO, PG, PEP)

[STOPS & COSTS]
-12% stop (gap-ineffective — size pre-event). Weekly rebalance Fri→Mon.
No-trade band ±25%. Costs: 25bps + 20bps slip + 75bps FX (KR retail).

[BACKTEST]
2024-01-02 to present vs XBI, IBB, SPY. Report CAGR, Sharpe, MDD, turnover.

[OUTPUT]
1) Regime banner  2) Full score table  3) Top-8 weights  4) Alerts  5) Backtest  6) Risks

[LLM ADD-ONS]
PDUFA calendar · trial readouts · cash runway · 13F · EPS · FDA headlines

[DISCLAIMER]
Research tool only. Not investment advice. Validate with `python -m script.amqs_bio --mode track`.
```
