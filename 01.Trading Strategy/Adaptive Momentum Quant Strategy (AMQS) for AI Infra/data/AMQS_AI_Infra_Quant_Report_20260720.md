# AMQS-AI-Infra Quant Report — 2026.07.20

**Strategy**: Adaptive Momentum Quant Strategy for AI Infrastructure (AMQS-AI-Infra v1)
**Data Source**: yfinance (real-time)
**Execution Time**: 2026-07-20 17:43 KST
**Regime**: RISK_ON
**Invested Fraction**: 100%

---

## 1. Macro Regime

| Indicator | Value | Threshold | Status |
|-----------|-------|-----------|--------|
| QQQ vs 200MA | Above | QQQ > 200MA | PASS |
| VIX | 18.5 | < 25 | PASS |
| QQQ 5-Day Return | -4.2% | > -8% | PASS |
| **Regime** | **RISK_ON** | — | **100% Invested** |

QQQ recorded a -4.2% five-day decline but remains above both the 200-day moving average and the -8% defensive threshold. The VIX at 18.5 reflects moderately elevated volatility consistent with a sector-wide correction in AI infrastructure, but not yet at levels triggering risk-off.

---

## 2. Universe Scan — Full Scorecard (18 Tickers, Score Descending)

Ticker data as of market close 2026-07-18 (Friday). PSTG excluded: no price data available from Yahoo Finance (potentially delisted).

**Scoring Legend**: CENTER >= 80 | SATELLITE 65-79 | TACTICAL 50-64 | REDUCE < 50 | EXIT (12M MDD < -30% or stop-loss) | EXCLUDED (pre-filter failure)

| Rank | Ticker | Subtheme | Price | 12-1 Mom | 6-1 Mom | 5D Ret | 20D Ret | RSI(14) | Dist 52W High | 12M MDD | D1 Mom | D2 PB | D3 Qual | D4 Vol | D5 Macro | **Total** | **Signal** | **Weight** |
|------|--------|----------|-------|----------|---------|--------|---------|---------|---------------|---------|--------|-------|---------|--------|----------|-----------|-------------|------------|
| 1 | HPE | Systems/Server | $45.82 | +136.2% | +121.6% | -5.6% | -4.9% | 50.9 | -18.2% | -26.4% | 40.2 | 96.0 | 100.0 | 87.1 | 70.0 | **73.5** | SATELLITE | **29.8%** |
| 2 | DELL | Systems/Server | $396.34 | +243.6% | +253.1% | -8.9% | -5.5% | 48.4 | -14.9% | -32.3% | 47.5 | 100.0 | 60.0 | 94.1 | 70.0 | **67.7** | EXCLUDED | 0.0% |
| 3 | MU | Memory/Storage | $848.95 | +822.4% | +210.0% | -13.3% | -18.6% | 41.0 | -30.0% | -30.3% | 64.8 | 0.0 | 100.0 | 84.2 | 70.0 | **67.3** | EXCLUDED | 0.0% |
| 4 | AMD | Compute/GPU | $495.76 | +219.5% | +124.8% | -11.1% | -3.3% | 45.9 | -14.7% | -27.8% | 35.7 | 0.0 | 95.1 | 78.6 | 70.0 | **58.9** | TACTICAL | **28.7%** |
| 5 | STX | Memory/Storage | $787.66 | +632.1% | +233.4% | -13.5% | -26.1% | 42.0 | -28.0% | **-31.8%** | 73.5 | 0.0 | 40.0 | 100.0 | 70.0 | **56.4** | EXIT | 0.0% |
| 6 | WDC | Memory/Storage | $477.22 | +965.4% | +220.9% | -18.1% | -33.0% | 40.0 | -36.0% | **-37.4%** | 74.2 | 0.0 | 40.0 | 100.0 | 70.0 | **56.4** | EXIT | 0.0% |
| 7 | CSCO | Networking | $111.94 | +74.7% | +56.8% | -7.7% | -4.2% | 44.7 | -13.6% | -13.6% | 30.1 | 0.0 | 100.0 | 69.1 | 70.0 | **55.2** | TACTICAL | **21.0%** |
| 8 | ANET | Networking | $168.61 | +47.3% | +26.3% | -9.8% | +2.2% | 50.0 | -9.8% | -28.3% | 36.0 | 0.0 | 100.0 | 55.6 | 70.0 | **54.9** | TACTICAL | **20.5%** |
| 9 | INTC | Compute/GPU | $95.04 | +431.1% | +150.6% | -13.5% | -21.5% | 35.9 | -32.6% | -24.2% | 56.2 | 0.0 | 96.0 | 44.2 | 70.0 | **54.9** | EXCLUDED | 0.0% |
| 10 | SNOW | Data/Software | $268.90 | +10.8% | +12.9% | +2.9% | +14.7% | 64.9 | -4.0% | **-56.3%** | 36.1 | 0.0 | 100.0 | 22.6 | 70.0 | **51.1** | EXIT | 0.0% |
| 11 | TSM | Compute/GPU | $398.37 | +77.9% | +27.2% | -8.2% | -7.8% | 38.7 | -16.6% | -18.1% | 27.2 | 0.0 | 80.3 | 57.8 | 70.0 | **48.9** | REDUCE | 0.0% |
| 12 | MRVL | Compute/GPU | $188.68 | +302.8% | +260.4% | -20.0% | -34.8% | 35.9 | -40.4% | -26.4% | 37.2 | 0.0 | 37.9 | 84.5 | 70.0 | **48.4** | EXCLUDED | 0.0% |
| 13 | VRT | Power/Cooling | $289.56 | +142.5% | +84.1% | -9.2% | -8.8% | 42.2 | -23.0% | -24.8% | 18.1 | 0.0 | 62.8 | 72.8 | 70.0 | **45.0** | REDUCE | 0.0% |
| 14 | NVDA | Compute/GPU | $202.81 | +18.4% | +9.5% | -3.9% | -0.9% | 47.5 | -13.9% | -20.2% | 15.7 | 0.0 | 59.4 | 62.3 | 70.0 | **42.2** | REDUCE | 0.0% |
| 15 | AVGO | Compute/GPU | $370.83 | +38.0% | +14.8% | -7.3% | -5.5% | 44.3 | -22.9% | -28.7% | 5.5 | 0.0 | 56.6 | 58.5 | 70.0 | **38.5** | REDUCE | 0.0% |
| 16 | ORCL | Data/Software | $126.41 | -25.6% | -3.0% | -10.1% | -30.9% | 29.2 | -61.1% | **-61.7%** | 4.6 | 0.0 | 41.5 | 3.2 | 70.0 | **23.3** | EXIT | 0.0% |
| 17 | SMCI | Systems/Server | $24.18 | -47.3% | -5.6% | -14.6% | -13.0% | 34.8 | -60.2% | **-66.2%** | 19.7 | 0.0 | 20.1 | 10.9 | 70.0 | **20.6** | EXCLUDED | 0.0% |
| 18 | PLTR | Data/Software | $132.38 | -15.2% | -26.2% | +4.4% | +1.3% | 53.0 | -36.1% | **-48.2%** | 20.8 | 0.0 | 24.7 | 0.0 | 70.0 | **20.5** | EXIT | 0.0% |

**Summary Statistics**:
- Mean Total Score: 50.7
- Median Total Score: 51.5
- Highest Score: 73.5 (HPE)
- Lowest Score: 20.5 (PLTR)
- CENTER (>=80): 0 tickers
- SATELLITE (65-79): 1 ticker
- TACTICAL (50-64): 5 tickers
- REDUCE (<50): 4 tickers
- EXIT/EXCLUDED: 8 tickers

---

## 3. Pre-Filter Failures (EXCLUDED)

| Ticker | Price | 60D Ann. Vol | Filter Trigger | Subtheme | 12-1 Momentum | 5D Return |
|--------|-------|-------------|----------------|----------|---------------|-----------|
| DELL | $396.34 | 101.1% | vol60d > 100% | Systems/Server | +243.6% | -8.9% |
| MU | $848.95 | 108.3% | vol60d > 100% | Memory/Storage | +822.4% | -13.3% |
| INTC | $95.04 | 101.5% | vol60d > 100% | Compute/GPU | +431.1% | -13.5% |
| MRVL | $188.68 | 114.8% | vol60d > 100% | Compute/GPU | +302.8% | -20.0% |
| SMCI | $24.18 | 117.3% | vol60d > 100% | Systems/Server | -47.3% | -14.6% |

All five exclusions triggered by the 60-day annualized volatility exceeding the 100% ceiling. Notably, four of the five (DELL, MU, INTC, MRVL) maintain strong positive 12-1 momentum (+136% to +822%), indicating that the volatility breach stems from extreme short-term price swings rather than structural deterioration. SMCI is the exception, with negative 12-1 momentum (-47.3%) compounding the volatility issue.

---

## 4. Exit Signals (12M MDD Violations)

| Ticker | Total Score | 12M MDD | 12-1 Momentum | Subtheme | Notes |
|--------|-------------|---------|---------------|----------|-------|
| STX | 56.4 | -31.8% | +632.1% | Memory/Storage | Highest momentum score in universe despite MDD violation. Near-threshold violation. |
| WDC | 56.4 | -37.4% | +965.4% | Memory/Storage | Extreme 12-1 (+965%) offset by -33% 20D drawdown. Deep correction within strong trend. |
| SNOW | 51.1 | -56.3% | +10.8% | Data/Software | Consumption-model transition drag. Near-zero 12-1 momentum. |
| ORCL | 23.3 | -61.7% | -25.6% | Data/Software | Negative 12-1 and 6-1 momentum. Deepest MDD in universe. |
| PLTR | 20.5 | -48.2% | -15.2% | Data/Software | Below 200MA. Both 12-1 and 6-1 negative. Full momentum collapse. |

All three Data/Software subtheme tickers are in EXIT. The Data/Software subtheme has been fully eliminated from the investable universe — capital rotation from AI software to AI hardware continues.

---

## 5. Selected Portfolio (Top-10 with Subtheme Cap)

**Selection Logic**: Pre-filter passed + not EXIT/REDUCE + sorted by Total Score descending + subtheme cap of 4 applied.

| # | Ticker | Subtheme | Price | Total Score | Signal | Target Weight | Allocation Basis |
|---|--------|----------|-------|-------------|--------|---------------|------------------|
| 1 | HPE | Systems/Server | $45.82 | 73.5 | SATELLITE | 29.8% | Score-tilted; only Systems/Server survivor |
| 2 | AMD | Compute/GPU | $495.76 | 58.9 | TACTICAL | 28.7% | Score-tilted; only Compute/GPU survivor |
| 3 | CSCO | Networking | $111.94 | 55.2 | TACTICAL | 21.0% | Score-tilted |
| 4 | ANET | Networking | $168.61 | 54.9 | TACTICAL | 20.5% | Score-tilted |

**Subtheme Distribution**:

| Subtheme | Tickers Selected | Max Allowed | Weight Sum |
|----------|-----------------|-------------|------------|
| Systems/Server | 1 (HPE) | 4 | 29.8% |
| Compute/GPU | 1 (AMD) | 4 | 28.7% |
| Networking | 2 (CSCO, ANET) | 4 | 41.5% |
| Memory/Storage | 0 | 4 | 0.0% |
| Data/Software | 0 | 4 | 0.0% |
| Power/Cooling | 0 | 4 | 0.0% |

**Concentration Risk**: Only 4 of 18 tickers survived the selection filters. The portfolio is highly concentrated with individual positions at 20-30%, substantially above the typical 4-18% AMQS range. This is a direct consequence of the sector-wide correction rather than a strategy parameter failure — the remaining investable universe is simply too small to support broader diversification.

---

## 6. Dimension Breakdown for Selected Tickers

### HPE (Total: 73.5, SATELLITE)
| Dimension | Weight | Score | Contribution | Analysis |
|-----------|--------|-------|-------------|----------|
| D1 Momentum Signal | 35% | 40.2 | 14.1 | Below-average momentum composite; offset by high D2 |
| D2 Pullback Buy | 15% | 96.0 | 14.4 | 4-gate conditions met (trend intact, 5D -5.6% dip). RSI 50.9 near neutral. |
| D3 Trend Quality | 25% | 100.0 | 25.0 | Above 200MA, positive momentum acceleration, all 12 monthly candles positive |
| D4 Vol-Adj Alpha | 15% | 87.1 | 13.1 | Sharpe ratio within acceptable range; 12M MDD -26.4% under -30% threshold |
| D5 Macro Fit | 10% | 70.0 | 7.0 | RISK_ON regime baseline |

**Key Observation**: HPE is the only ticker with D2 (Pullback Buy) activated, scoring 96.0. Combined with D3 Trend Quality at 100.0, the model interprets the current -5.6% weekly decline as a pullback within an intact uptrend — the classic "buy the dip in an uptrend" pattern.

### AMD (Total: 58.9, TACTICAL)
| Dimension | Weight | Score | Contribution | Analysis |
|-----------|--------|-------|-------------|----------|
| D1 Momentum Signal | 35% | 35.7 | 12.5 | Modest composite. 12-1 +220% strong but 5D -11.1% drag. |
| D2 Pullback Buy | 15% | 0.0 | 0.0 | Gate (iv) borderline — 5D meets -3% threshold but pullback raw score insufficient |
| D3 Trend Quality | 25% | 95.1 | 23.8 | Above 200MA; 11 of 12 months positive |
| D4 Vol-Adj Alpha | 15% | 78.6 | 11.8 | Adequate risk-adjusted profile |
| D5 Macro Fit | 10% | 70.0 | 7.0 | RISK_ON regime baseline |

**Key Observation**: 12M MDD at -27.8% is approaching the -30% EXIT threshold. A further 2-3% decline in AMD would trigger an automatic liquidation signal. This is the highest-risk position in the current portfolio.

### CSCO (Total: 55.2, TACTICAL)
| Dimension | Weight | Score | Contribution | Analysis |
|-----------|--------|-------|-------------|----------|
| D1 Momentum Signal | 35% | 30.1 | 10.5 | Below-universe-average momentum. 12-1 +75% is modest relative to peers. |
| D2 Pullback Buy | 15% | 0.0 | 0.0 | Gate conditions not met |
| D3 Trend Quality | 25% | 100.0 | 25.0 | Strongest trend quality in portfolio; above 200MA, consistent positive months |
| D4 Vol-Adj Alpha | 15% | 69.1 | 10.4 | 12M MDD -13.6% is the lowest in the entire universe |
| D5 Macro Fit | 10% | 70.0 | 7.0 | RISK_ON regime baseline |

**Key Observation**: CSCO's standout metric is its 12M MDD of only -13.6% — the lowest drawdown in the universe. In an environment where most peers have MDD exceeding -25%, this defensive characteristic drives its selection despite below-average momentum scores.

### ANET (Total: 54.9, TACTICAL)
| Dimension | Weight | Score | Contribution | Analysis |
|-----------|--------|-------|-------------|----------|
| D1 Momentum Signal | 35% | 36.0 | 12.6 | Moderate composite. 20D +2.2% is the only positive 20D in the portfolio. |
| D2 Pullback Buy | 15% | 0.0 | 0.0 | Gate conditions not met |
| D3 Trend Quality | 25% | 100.0 | 25.0 | Above 200MA; all trend metrics positive |
| D4 Vol-Adj Alpha | 15% | 55.6 | 8.3 | Below-average risk-adjusted return |
| D5 Macro Fit | 10% | 70.0 | 7.0 | RISK_ON regime baseline |

**Key Observation**: ANET is the only portfolio constituent with a positive 20-day return (+2.2%), indicating the earliest sign of stabilization among AI infrastructure names.

---

## 7. Sector Health Assessment

### Subtheme-Level Status

| Subtheme | Tickers | Selected | EXCLUDED | EXIT | REDUCE | Health |
|----------|---------|----------|----------|------|--------|--------|
| Compute/GPU | 6 | 1 (AMD) | 2 (INTC, MRVL) | 0 | 3 (TSM, NVDA, AVGO) | WEAK |
| Memory/Storage | 4 | 0 | 1 (MU) | 2 (STX, WDC) | 0 | CRITICAL |
| Systems/Server | 3 | 1 (HPE) | 2 (DELL, SMCI) | 0 | 0 | WEAK |
| Networking | 2 | 2 (CSCO, ANET) | 0 | 0 | 0 | STABLE |
| Data/Software | 3 | 0 | 0 | 3 (SNOW, ORCL, PLTR) | 0 | CRITICAL |
| Power/Cooling | 1 | 0 | 0 | 0 | 1 (VRT) | WEAK |

**Key Findings**:
1. Memory/Storage and Data/Software subthemes are in critical condition — zero investable tickers.
2. Networking is the only subtheme at full strength (2 of 2 selected), reflecting relative resilience in enterprise networking demand.
3. Compute/GPU, the largest subtheme by ticker count (6), has only 1 survivor (AMD). NVDA, the bellwether of AI infrastructure, ranks 14th with a Total Score of 42.2, driven by a weak 12-1 momentum of +18.4%.

### Aggregate Momentum Indicators

| Metric | Current | 2026-06-01 | Change |
|--------|---------|------------|--------|
| Mean Total Score | 50.7 | 55.3 | -4.6 pts |
| Tickers Selected (Top-10) | 4 | 10 | -6 |
| Tickers EXCLUDED | 5 | 1 | +4 |
| Tickers EXIT | 5 | 4 | +1 |
| Highest Score | 73.5 (HPE) | 79.4 (INTC) | -5.9 pts |
| Lowest Non-Exit Score | 20.5 (PLTR) | 25.8 (PLTR) | -5.3 pts |

The deterioration across all aggregate metrics since June 1 confirms a broad-based correction in AI infrastructure. The 60% reduction in investable tickers (10 to 4) signals a significant contraction in the opportunity set.

---

## 8. Risk Alerts

**CRITICAL**: AMD 12M MDD Watch
- AMD's 12M MDD is -27.8%, approaching the -30% automatic EXIT threshold.
- A further drawdown of approximately 3% from current levels ($495.76 to ~$480) would breach this threshold.
- If triggered, the Compute/GPU subtheme would have zero investable tickers, reducing the portfolio to 3 positions.

**ELEVATED**: Portfolio Concentration
- With only 4 tickers selected, individual position weights of 20-30% far exceed the typical AMQS allocation range.
- The portfolio's effective diversification ratio is extremely low.
- Risk-Off transition to 50% cash would reduce total exposure but not address concentration within the invested portion.

**ELEVATED**: Sector-Wide Volatility
- 5 of 18 tickers (27.8%) breached the 100% annualized volatility filter.
- Mean 60-day volatility across the universe is 89.4%, significantly elevated versus historical norms.
- This volatility regime increases the probability of both stop-loss triggers and additional MDD-based exits.

**MODERATE**: Regime Transition Risk
- QQQ 5-day return of -4.2% approaches but does not breach the -8% defensive threshold.
- VIX at 18.5 remains well below the 30 risk-off trigger.
- However, a continued QQQ decline could shift the regime to RISK_OFF within 1-2 weeks, triggering a 50% cash allocation.

---

## 9. Rebalance Instructions (Paper Trading)

| Action | Ticker | Current Weight | Target Weight | Delta |
|--------|--------|---------------|---------------|-------|
| BUY | HPE | 0.0% | 29.8% | +29.8% |
| BUY | AMD | 0.0% | 28.7% | +28.7% |
| BUY | CSCO | 0.0% | 21.0% | +21.0% |
| BUY | ANET | 0.0% | 20.5% | +20.5% |
| SELL | All other positions | — | 0.0% | -100.0% |

**Execution Note**: Since no prior positions are recorded (empty state file), this constitutes a full portfolio initialization rather than a rebalance. All four positions are new entries.

---

## 10. Backtest Reference

As a reference, the AMQS-AI-Infra strategy delivered the following metrics in the backtest period 2024-01-02 to 2026-05-30 (weekly rebalance, -12% stop-loss, 5bps + 10bps transaction costs):

| Metric | AMQS-AI-Infra | QQQ | SMH | SOXX | AI-Infra EW |
|--------|---------------|-----|-----|------|-------------|
| Cumulative Return | +168.0% | +82.5% | +245.1% | +200.5% | +402.6% |
| CAGR | +50.9% | +28.5% | +67.7% | +58.3% | +96.2% |
| Annualized Volatility | 31.7% | 20.5% | 36.4% | 37.8% | 37.0% |
| Sharpe Ratio | 1.46 | 1.33 | 1.60 | 1.40 | 2.01 |
| Maximum Drawdown | -26.6% | -22.8% | -35.7% | -41.4% | -36.6% |
| Annual Turnover | ~1,384% | — | — | — | — |

**Current Context**: The backtest period (2024-01 to 2026-05) was a near-unidirectional AI bull market. The current July 2026 environment — with 28% of the universe excluded and 28% in EXIT — represents a materially different regime than the backtest sample. Historical metrics should not be extrapolated to the current correction.

---

## 11. Methodology Notes

**4-Factor Momentum Composite**: Weighted sum of z-score normalized 12-1 (50%), 6-1 (30%), 3-1 (15%), and inverse 60-day volatility (5%) components across the universe.

**5-Dimensional Scoring**: D1 Momentum Signal Strength (35%) = 4-Factor composite (60%) + 52-week high proximity (25%) + positive monthly candle ratio (15%). D2 Pullback Buy (15%) = 4-gate conditional activation with RSI bonus scoring. D3 Trend Quality (25%) = 200MA position (60%) + momentum acceleration (40%). D4 Volatility-Adjusted Alpha (15%) = 6-month Sharpe ratio (70%) + 12-month MDD penalty (30%). D5 Macro Fit (10%) = regime-based baseline score.

**Selection**: Top-10 by Total Score, subject to a maximum of 4 tickers per subtheme. Pre-filter requirements: market cap >= $10B, average daily volume >= $100M, 60-day vol <= 100%, beta <= 3.0, no single-day drop exceeding -35% within 90 days.

**Position Sizing**: Score-tilted equal weight with a strength factor of 1.5, capped at 4-18% per position, scaled to the invested fraction determined by the macro regime.

---

## Disclaimer

This report is generated by an automated quantitative model and is provided for research and educational purposes only. It does not constitute investment advice or a recommendation to buy, sell, or hold any security.

Key limitations and risk factors:

1. **In-Sample Bias**: All backtest metrics are derived from the 2024-2026 AI bull market cycle and may not generalize to downtrend, sideways, or high-volatility regimes.
2. **Survivorship Bias**: PSTG has been removed from the universe due to data unavailability (potential delisting). Historical performance including PSTG may differ from current live signals.
3. **Transaction Cost Assumptions**: The model assumes 5bps commission + 10bps slippage, which reflects institutional execution. Retail investors face materially higher costs (20-30bps + 50-100bps FX spread for Korean investors + 22% capital gains tax).
4. **Concentration Risk**: Current portfolio consists of 4 tickers with individual weights of 20-30%, providing minimal diversification benefit.
5. **Sector Concentration**: All 18 universe tickers belong to the AI infrastructure value chain, resulting in high pairwise correlations and limited cross-sector diversification.
6. **Model Risk**: Thresholds (volatility ceiling at 100%, MDD floor at -30%, stop-loss at -12%) were calibrated on the 2024-2026 bull period and require walk-forward re-validation.
7. **Data Quality**: yfinance free-tier data may contain gaps, corporate action errors, or delayed adjustments. PSTG is currently unavailable.

All investment decisions and their consequences are the sole responsibility of the investor. Past performance does not guarantee future results. The risk of permanent capital loss is substantial, particularly in high-beta, high-volatility sectors such as AI infrastructure.

---
*Generated by AMQS-AI-Infra v1 | vibe-investing | Dennis Kim | 2026-07-20*
