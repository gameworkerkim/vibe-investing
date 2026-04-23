# The 72-Hour Shock? Preliminary Evidence from 52 Token Unlock Events on Binance

## A Cross-Sectional Analysis of Unlock Events and Their Asymmetric Impact on Cryptocurrency Prices

**HoKwang Kim**
*Independent Researcher*
Seoul, Republic of Korea

Email: [gameworker@gmail.com](mailto:gameworker@gmail.com)
ORCID: [0009-0002-0962-2175](https://orcid.org/0009-0002-0962-2175)

**Draft Date**: April 23, 2026
**Working Paper — Version 3.1**

**JEL Classification**: G12, G14, G17, G19, C58

**Keywords**: token unlock, vesting cliff, cryptocurrency market microstructure, supply shock hypothesis, event study methodology, DeFi governance tokens, Binance, market efficiency, Keyrock 2024, crypto calendar events

---

## Author's Note on Affiliation

The author conducts this research in a personal, non-institutional capacity. While the author is the Chief Executive Officer of Betalabs Inc. (Seoul, South Korea), this paper is not produced under the auspices of Betalabs Inc., does not reflect the views of the company or its employees, and was not supported by company resources. The work is conducted as **independent research**. No compensation, funding, or in-kind support was received for this work from any institution, project, or market participant.

---

## Abstract

Token unlock events—scheduled releases of previously restricted cryptocurrency supply—represent one of the most predictable, yet paradoxically unmitigated, supply shocks in digital asset markets. Keyrock (2024) analyzed over 16,000 unlock events and documented a 90% negative price impact within a 30-day window, establishing the broad pattern of underperformance. However, this aggregate result leaves two empirical questions unresolved: first, within the 30-day window, when is the selling pressure concentrated? Second, does the effect persist after controlling for Bitcoin market beta? This paper offers **preliminary evidence** on both questions using a hand-collected sample of 52 major token unlock events on Binance-listed assets between January 2023 and December 2025.

We document three findings. First, 46 of 52 events (88.5%; binomial test p = 2.2 × 10⁻⁹; robust to Bonferroni correction across 17 formal hypothesis tests) exhibit negative returns within 72 hours of unlock, with a mean return of −16.97%. The similarity between our 72-hour rate and Keyrock's 30-day rate (90%) is suggestive of temporal concentration, though we emphasize this is a qualitative cross-study comparison across non-overlapping samples. Second, the same 88.5% of events underperform Bitcoin on a relative basis; one-way ANOVA across five Bitcoin regimes finds no statistically significant modulation of the effect (F-test p = 0.24). Robustness checks using Ethereum and a top-10 market-cap-weighted index yield qualitatively similar results. Third, we report an **exploratory, hypothesis-generating** observation: within our sample, all 14 events occurring within a 60-day window around the 365-day post-listing anniversary exhibit negative returns. We emphasize this pattern was identified post-hoc and any nominal p-value is not interpretable as a valid test; pre-registered out-of-sample replication is required.

We interpret these findings through a supply shock hypothesis. Notwithstanding the correlational nature of the evidence, the consistency of the effect across Bitcoin regimes, recipient categories, and alternative benchmarks suggests that unlock-specific selling pressure is the most parsimonious explanation among those we considered. Replication data and analysis code are publicly available.

---

# 1. Introduction

## 1.1. Motivation

Cryptocurrency markets present a laboratory for studying the price impact of supply shocks under conditions rarely available in traditional asset markets: publicly announced, precisely timed, and frequently large increments to outstanding supply. Token unlock schedules, typically specified at the inception of a project and encoded in smart contracts, release vested tokens to founders, early investors, ecosystem participants, and other recipient categories on deterministic dates. These events constitute a natural experiment in supply-demand dynamics.

Despite the transparency of unlock schedules—which are freely available on platforms such as Tokenomist, CoinMarketCap, and DefiLlama—empirical evidence documents persistent negative price effects around unlock dates. Keyrock (2024), analyzing more than 16,000 events, found that approximately 90% of unlocks are associated with negative 30-day price impacts, with magnitudes varying by recipient category. This result raises a natural question: if the information is public and the pattern is well-documented, why does the market fail to efficiently incorporate this information?

## 1.2. Research Questions

This paper addresses two empirical questions that remain underexplored in the existing literature.

**Question 1** — *Temporal concentration*: Within the 30-day window documented by Keyrock (2024), when is the selling pressure concentrated? Is the effect distributed evenly across the window, or is it front-loaded in a narrower interval?

**Question 2** — *Market beta neutrality*: Do unlock events underperform broader cryptocurrency market movements, or is the observed decline merely a reflection of Bitcoin's negative returns during the relevant periods?

Additionally, during our analysis, we identify a third regularity that we did not initially hypothesize: a pronounced clustering of negative outcomes near the 365-day post-listing cliff. We report this finding transparently as an **exploratory, hypothesis-generating result** and apply strict statistical qualifications throughout.

## 1.3. Contribution

Our contribution is threefold. First, we provide preliminary evidence suggesting that the 30-day negative effect documented by Keyrock (2024) may be temporally concentrated within a 72-hour window following unlock, though we emphasize that cross-study comparison has methodological limits (Section 6.3). Second, we show that unlock events underperform Bitcoin, Ethereum, and a broader top-10 index even during subsamples of market appreciation, suggesting the effect is not fully attributable to broader market beta. Third, we document a post-hoc observation of 100% negative outcomes across 14 events clustered around the 365-day post-listing anniversary, which we propose as a **hypothesis-generating finding requiring pre-registered out-of-sample replication** before being treated as an established calendar anomaly.

## 1.4. Scope and Caveats

Before proceeding, we state six explicit caveats.

1. **Preliminary evidence, small sample**: Our sample of 52 events is a small fraction of the universe studied by Keyrock. We do not claim statistical generalization beyond our sample period (January 2023 to December 2025). The title of this paper ends with a question mark deliberately.

2. **Not investment advice**: Our findings should not be interpreted as endorsing specific trading strategies. Any strategy implementation must incorporate transaction costs, slippage, market impact, funding costs, and—depending on jurisdiction—legal and tax constraints.

3. **No attribution to specific participants**: We do not attribute the observed patterns to any specific market participant, foundation, project, or investor category. The supply shock hypothesis is a market-wide structural interpretation and does not imply misconduct or manipulation.

4. **Multiple hypothesis testing**: Several analyses in this paper are exploratory. We apply Bonferroni correction (Section 3.3.3 and Appendix D) and flag post-hoc findings explicitly.

5. **Association, not causation**: Our event-study methodology identifies association. We do not claim causal identification.

6. **Post-hoc finding**: The 365-day cliff observation (Section 4.4) was identified through data exploration, not pre-registration. We present it as hypothesis-generating.

---

# 2. Literature Review

## 2.1. Token Unlock Mechanics

Token vesting schedules serve multiple economic functions: they mitigate founder-team moral hazard, align incentives between recipients and long-term project success, and prevent the immediate dumping of pre-launch allocations. The typical structure includes an initial lockup period ("cliff"), followed by either a one-time release (cliff unlock) or a gradual linear release (linear vesting) over a subsequent period. Recipients commonly include founding teams, early-stage venture investors, strategic advisors, ecosystem development funds, treasury reserves, and airdrop claimants.

The economic literature on vesting has historically focused on traditional equity markets, where lockup expirations following IPOs are well-studied (Field and Hanka, 2001; Brav and Gompers, 2003). These studies generally document negative abnormal returns around equity lockup expirations, attributed to information asymmetry and selling pressure from insiders. Cryptocurrency unlocks present analogous but distinct dynamics, with three important differences: (i) schedules are more granular, often monthly or quarterly; (ii) recipients are more diverse, including decentralized participants; and (iii) markets operate continuously, without regulatory trading halts.

## 2.2. Prior Empirical Evidence

**Keyrock (2024)** — *From Locked to Liquidity: What 16,000+ Token Unlocks Teach Us* — represents the most comprehensive empirical study to date. Key findings include:

- 90% of unlock events exhibit negative 30-day returns;
- Pre-event price drift begins approximately 30 days before unlock, consistent with informed front-running;
- Team unlocks produce the largest negative impact (approximately −25% on average);
- Ecosystem unlocks are the only category with a slight positive average return (+1.18%);
- Prices tend to revert toward neutral by day 14 post-unlock.

**Binance Research (2024)** — *Token Unlocks Reach $155 Billion by 2030* — documented the aggregate scale of upcoming unlocks and highlighted their potential to influence market liquidity over the coming decade.

**La Morgia, Mei, Sassi, and Stefa (2022)** — *The Doge of Wall Street* — analyzed pump-and-dump schemes in cryptocurrency, establishing methodological precedents for event-based analysis that we build upon in our event-study framework.

**Gandal, Hamrick, Moore, and Oberman (2018)** — documented price manipulation in early Bitcoin markets, providing foundational empirical techniques for identifying anomalous price behavior.

**Hu, Li, and Schwartz (2022)** — analyzed pre-pump detection in cryptocurrency markets using sequence-based methods, relevant to our discussion of front-running behavior around unlock events.

## 2.3. Gap in the Literature

While Keyrock (2024) established the broad pattern, two key questions remain empirically underexplored. First, the 30-day window aggregates the total effect but does not isolate the timing of the most acute selling pressure. If the effect is concentrated in a narrow window, it has different implications for both theoretical interpretation (mechanism) and practical application. Second, the Keyrock study measures absolute returns. Controlling for broader-market returns tests whether the effect is a genuine idiosyncratic shock or a market-wide artifact.

Our paper aims to provide preliminary evidence on both questions using a smaller but carefully curated dataset. We acknowledge that cross-study comparison between our results and Keyrock's is necessarily imperfect given differences in sample composition, measurement windows, and methodology (Section 6.3).

---

# 3. Data and Methodology

## 3.1. Sample Selection

Our primary sample consists of 52 token unlock events on Binance-listed tokens occurring between January 2023 and December 2025 (36 months). We selected events meeting all of the following criteria:

1. The underlying token was listed on Binance (spot or perpetual futures) at the time of unlock;
2. The unlock event released at least 1% of the circulating supply at the time of unlock;
3. Unlock schedule data was publicly verifiable through at least two of the following sources: Tokenomist, CoinMarketCap Unlocks, DefiLlama Unlocks, DropsTab, or the project's official documentation;
4. Continuous price data was available from at least T−7 days to T+14 days (where T is the unlock timestamp).

Our sampling approach is intentionally conservative: we prioritize events with strong data provenance over sample size. This reflects a tradeoff between statistical power and measurement quality. We acknowledge this as a sample-selection limitation in Section 9.

## 3.2. Event Window and Variables

The primary event window is T−24 hours to T+72 hours, with the unlock timestamp T defined as the on-chain release time reported in the relevant smart contract or project announcement. We record the following variables for each event:

- **Absolute 72-hour return (R₇₂)**: (P_{T+72h} / P_{T−24h}) − 1
- **Bitcoin return over the same window (R^{BTC}_{72})**: Same formula applied to BTC/USDT
- **Bitcoin-adjusted return**: R₇₂ − R^{BTC}_{72}
- **Ethereum-adjusted return**: R₇₂ − R^{ETH}_{72}
- **Top-10 market-cap weighted index adjusted return**: R₇₂ − R^{TOP10}_{72}, where the index is reconstructed at T−24h to exclude the event token and weighted by market capitalization at T−24h
- **Unlock size ratio**: (tokens unlocked) / (circulating supply at T−1)
- **Recipient category**: Team, Investor, Ecosystem, Miner, Community, or a combination
- **Days since listing**: (T − listing date) / 24h
- **Cliff vs. linear indicator**: Binary, based on project documentation

## 3.3. Statistical Methodology

### 3.3.1. Primary Test

Our primary statistical test is a one-sample binomial test on the proportion of negative 72-hour returns. The null hypothesis is H₀: p = 0.5. Under H₀, the probability of observing 46 or more negative outcomes in 52 trials is computed from the cumulative binomial distribution.

### 3.3.2. Statistical Power

With N = 52 and α = 0.05 (two-sided), the binomial test has approximately 80% power to detect a true negative rate of 0.70 or higher. Our observed rate of 0.885 substantially exceeds this detection threshold, suggesting the primary finding is not a consequence of under-powered testing.

### 3.3.3. Multiple Hypothesis Testing Correction

We conduct 17 formal hypothesis tests in this paper. The full list is provided in **Appendix D**. Key tests include: the primary 72-hour binomial test; Bitcoin-regime subsample analyses (5 subgroups); recipient-category decompositions (4 categories); alternative event-window analyses (3 windows); unlock-size filter analyses (2 subsamples); the exploratory 365-day cliff test; and alternative-benchmark (ETH, Top-10) comparisons (3 tests).

Applying the Bonferroni correction, the adjusted α-threshold becomes 0.05 / 17 ≈ 0.00294.

- **Primary 72-hour result (p = 2.2 × 10⁻⁹)**: **Remains highly significant after Bonferroni correction.**
- **365-day cliff nominal p-value (6.1 × 10⁻⁵)**: Remains below Bonferroni threshold numerically, but the post-hoc nature of the discovery means the effective number of tests conducted during data exploration is higher than 17. We therefore treat the 365-day cliff finding as not validly tested by this framework. See Section 4.4 for extended discussion.
- **Subgroup analyses**: Individual subgroup findings are flagged as provisional.

### 3.3.4. Secondary Tests

We complement the binomial test with Wilcoxon signed-rank statistics and compute t-tests on mean market-adjusted returns. We report confidence intervals (Clopper-Pearson exact method for proportions; bootstrap for means) alongside point estimates.

### 3.3.5. Multivariate Regression

To examine the independent contribution of key covariates, we estimate the following OLS specification on the N = 52 sample:

R₇₂,ᵢ = β₀ + β₁·UnlockSizeᵢ + β₂·MarketReturnᵢ + β₃·DaysSinceListingᵢ + β₄·RecipientTypeᵢ + εᵢ

where UnlockSize is the unlock size ratio (percent of circulating supply), MarketReturn is R^{BTC}_{72}, DaysSinceListing is the listing-age variable, and RecipientType is a categorical indicator (with Team+Investor as the reference category). Standard errors are heteroskedasticity-robust (HC1). Results are reported in Section 4.5.

## 3.4. Backtest Protocol (for Discussion Only)

For illustrative discussion of strategy implications, we describe a standardized backtest protocol used in Appendix E. **This is an illustrative benchmark, not an endorsed strategy.**

---

# 4. Empirical Results

## 4.1. The 72-Hour Shock

Table 1 presents the central finding. Of the 52 unlock events in our sample, 46 exhibit negative 72-hour returns (88.5%). The binomial test against H₀: p = 0.5 yields p = 2.2 × 10⁻⁹, well below the Bonferroni-adjusted threshold of 0.00294. The Clopper-Pearson 95% exact confidence interval for the proportion is [76.6%, 95.6%]. The mean return is −16.97% (bootstrap 95% CI [−20.1%, −13.8%]); the median is −18.57%.

**Table 1: Summary Statistics of 72-Hour Returns**

| Statistic | Value |
|-----------|-------|
| Sample size (N) | 52 |
| Negative outcomes | 46 |
| Proportion negative | 88.5% |
| 95% CI (Clopper-Pearson) | [76.6%, 95.6%] |
| Mean return | −16.97% |
| Median return | −18.57% |
| Std. deviation | 10.84% |
| Min / Max | −40.2% / +10.4% |
| Binomial test (H₀: p = 0.5) | p = 2.2 × 10⁻⁹ |
| Wilcoxon signed-rank test | p < 10⁻⁷ |
| Bonferroni-adjusted threshold | α ≈ 0.00294 |
| **Primary result significant after Bonferroni** | **Yes** |

## 4.2. Bitcoin-Adjusted Returns and Regime Analysis

Table 2 decomposes returns by Bitcoin trend during the event window. We define five regimes based on R^{BTC}_{72}.

**Table 2: Returns Decomposed by Bitcoin Regime**

| BTC Regime | N | Mean Token R₇₂ | Mean BTC R₇₂ | BTC-Adjusted |
|------------|---|----------------|--------------|--------------|
| Strong Up (≥ +5%) | 6 | −10.5% | +6.8% | −17.3% |
| Mild Up (0% to +5%) | 11 | −14.2% | +2.5% | −16.7% |
| Flat (−1% to +1%) | 13 | −16.8% | +0.2% | −17.0% |
| Mild Down (−5% to 0%) | 16 | −19.2% | −2.1% | −17.1% |
| Strong Down (≤ −5%) | 6 | −28.5% | −6.8% | −21.7% |

The Bitcoin-adjusted return ranges from −16.7% to −21.7% across regimes. A one-way ANOVA across the five regimes yields an F-statistic p = 0.24, indicating **no statistically significant modulation of the unlock effect by Bitcoin market direction at α = 0.05**. After Bonferroni correction, no pairwise regime comparison reaches conventional significance (all pairwise p > 0.10). We therefore revise our earlier language: the effect is *not meaningfully modulated* by Bitcoin regime, though we do not claim identical effect sizes across regimes.

Most notably, unlocked tokens exhibit negative returns (mean −10.5%) even during strong Bitcoin appreciation (+6.8% mean BTC). This pattern is difficult to reconcile with a pure market-beta explanation.

**Robustness — alternative benchmarks**: Market-adjusted returns computed using Ethereum yield a mean of −15.9%; using a top-10 market-cap-weighted index (reconstructed event-by-event to exclude the event token) yields −16.2%. Both are qualitatively similar to the Bitcoin-adjusted specification. Full results in Appendix C.

## 4.3. Recipient Category Analysis

Table 3 disaggregates events by recipient category. Consistent with Keyrock (2024), team-only and team-plus-investor unlocks exhibit the largest negative returns (−22.5% and −21.5% respectively). Ecosystem unlocks exhibit a smaller negative mean (−3.42%), qualitatively consistent with Keyrock's +1.18% result on a 30-day horizon.

**Table 3: Returns by Recipient Category**

| Recipient | N | Mean 72h Return | Keyrock 30d (for reference) |
|-----------|---|-----------------|------------------------------|
| Team Only | 3 | −22.5% | −25% |
| Team + Investor | 28 | −21.5% | −20% |
| Ecosystem | 4 | −3.42% | +1.18% |
| Mixed/Other | 16 | −13.8% | — |
| Miner | 1 | +5.69% | — |

Category-level comparisons are underpowered (N as low as 1 for Miner) and subject to multiple-testing concerns. After Bonferroni correction, no individual pairwise category comparison reaches conventional significance in isolation. These findings should be treated as descriptive and directional.

## 4.4. The 365-Day Anniversary — An EXPLORATORY, POST-HOC Observation

**⚠️ EXPLORATORY FINDING — DO NOT CITE AS CONFIRMED. Requires pre-registered out-of-sample replication before treating as established.**

We now turn to a pattern identified through **exploratory, post-hoc analysis** rather than pre-registered hypothesis. Among unlock events occurring within a 60-day window centered on the 365-day post-listing date (days 335 to 395 post-listing), we observe 14 events in our sample. All 14 exhibit negative 72-hour returns; mean return −27.5%.

### Critical Statistical Caveat

If one had pre-specified the 365-day window and assumed event independence, the probability of observing 14 negative outcomes in 14 trials would be 0.5¹⁴ ≈ 6.1 × 10⁻⁵. **However, given that this pattern was discovered post-hoc through data exploration, this nominal p-value is not interpretable as a valid hypothesis test.** The effective number of "windows" one might have searched (180 days, 270 days, 365 days, 500 days, 730 days, etc.), combined with the full set of subgroup analyses explored, means the family-wise false-discovery rate is substantially higher than the nominal calculation suggests.

**We therefore explicitly state**: the 365-day cliff observation is **hypothesis-generating, not hypothesis-confirming**. A valid test requires:

1. Pre-registration of the 365-day window as the target hypothesis before data examination;
2. Application on an independent, out-of-sample dataset (e.g., events occurring after April 2026);
3. Transparent reporting of all alternative windows considered.

Until such replication is conducted, the 365-day pattern should be treated as an observational curiosity, potentially reflecting a genuine structural mechanism (one-year cliff concentration in standard vesting contracts) or a data-mining artifact. We invite skeptical replication.

**Table 4: Selected 365-Day Cliff Events — ⚠️ EXPLORATORY, NOT CONFIRMED**

| Token | Unlock Date | Days Since Listing | 72h Return |
|-------|-------------|--------------------|-----------|
| TIA | 2024-10-31 | 366 | −29.57% |
| JTO | 2024-12-07 | 366 | −34.55% |
| ONDO | 2025-01-18 | 366 | −30.81% |
| W (Wormhole) | 2025-04-03 | 365 | −33.33% |
| BLAST | 2025-06-26 | 365 | −33.33% |
| ZK (ZKsync) | 2025-06-17 | 365 | −34.67% |
| TRUMP | 2025-04-18 | 365 | −25.28% |

*Caption note: Post-hoc exploratory observation from N = 14 events in our sample. Any attempt to derive trading strategies or confirmatory claims from this table without independent out-of-sample validation is statistically unwarranted.*

We offer a structural interpretation subject to the above qualifications: twelve-month vesting cliffs are common in cryptocurrency project documentation, typically applied to founding-team and early-stage-investor allocations. These structures concentrate a significant portion of total vested allocation at the one-year mark. Whether this structural feature produces the observed pattern—or whether the pattern is a sample-specific artifact—cannot be determined from our data alone.

## 4.5. Multivariate Regression Analysis

To examine the independent contribution of covariates, we estimate the OLS specification described in Section 3.3.5. Results are reported in Table 5. We emphasize that the small sample (N = 52) limits the statistical power of multivariate estimation; results should be interpreted as descriptive.

**Table 5: OLS Regression — Dependent Variable: 72-Hour Return (R₇₂)**

| Variable | Coefficient | Robust SE | t-stat | p-value |
|----------|-------------|-----------|--------|---------|
| Intercept | −0.082 | 0.034 | −2.41 | 0.020 |
| UnlockSize (%) | −0.0089 | 0.0031 | −2.87 | 0.006 |
| MarketReturn (BTC) | +0.52 | 0.18 | 2.89 | 0.006 |
| DaysSinceListing / 100 | −0.021 | 0.011 | −1.91 | 0.062 |
| Recipient: Ecosystem | +0.185 | 0.048 | 3.85 | <0.001 |
| Recipient: Mixed | +0.067 | 0.032 | 2.09 | 0.042 |
| (Reference: Team + Investor) | — | — | — | — |
| R² (adjusted) | 0.384 | | | |
| N | 52 | | | |
| F-stat (overall significance) | p < 0.001 | | | |

**Key inferences**:

- **Unlock size** is negatively associated with returns: a 1 percentage-point increase in the unlock-to-supply ratio is associated with approximately a 0.89 percentage-point decrease in 72-hour returns, holding other covariates constant.
- **Market return** loads with coefficient 0.52, substantially less than unity, indicating unlocks do not simply follow Bitcoin beta; the residual negative intercept and covariates dominate.
- **Days since listing** is marginally significant (p = 0.062), consistent with but not confirming the 365-day cliff interpretation.
- **Recipient: Ecosystem** is significantly less negative than Team+Investor (+18.5 percentage points), consistent with Keyrock (2024).

Overall, the regression confirms that the observed negative effect is not primarily attributable to either market beta or a single recipient category, and that unlock size is a meaningful driver. These findings are descriptive given the small sample.

---

# 5. Bayesian Hypothesis Analysis

We formalize the interpretation through informal comparison of three hypotheses.

**H₁ (Random Walk Null)**: Unlock events and price movements are independent. Under H₁, the probability of observing 46 or more negative outcomes in 52 trials is approximately 2.2 × 10⁻⁹. **H₁ is decisively rejected** by the binomial test, even after Bonferroni correction.

**H₂ (Market Beta Hypothesis)**: Observed negative returns are attributable to broader-market returns. Under H₂, unlock events should exhibit positive returns during market rallies. However, during Strong Up Bitcoin regimes (N = 6), 100% of events exhibit negative token returns. Robustness checks using ETH and top-10 indices yield qualitatively similar results. The ANOVA across Bitcoin regimes finds no significant modulation (p = 0.24). **H₂ is partially but strongly rejected**: broader-market beta cannot be the primary explanation.

**H₃ (Unlock-Specific Selling Pressure)**: Systematic selling pressure from unlock recipients, compounded by short-term liquidity constraints on the demand side. H₃ predicts negative returns across the majority of events (✓), largest effects for Team and Investor unlocks (✓), smallest effects for Ecosystem unlocks (✓), persistence across market regimes (✓), and a positive association between unlock size and effect magnitude (✓, β = −0.0089 in regression).

**Within our sample, H₃ is the hypothesis most consistent with the data.** Notwithstanding the correlational nature of the evidence, the consistency of the effect across Bitcoin regimes, recipient categories, alternative benchmarks, and the multivariate regression suggests that unlock-specific selling pressure is the most parsimonious explanation among those we considered. We acknowledge this does not constitute proof.

---

# 6. Discussion

## 6.1. Why Does the Market Underprice This Pattern?

**Attention constraints**: Retail investors may lack tools to systematically monitor vesting schedules across thousands of tokens.

**Institutional friction**: Short-selling cryptocurrency tokens is operationally constrained. Perpetual futures contracts exist for some tokens on some exchanges, with limited liquidity for mid-cap and long-tail assets. This friction prevents full arbitrage-elimination of the anomaly.

**Recipient heterogeneity**: Not all recipients liquidate immediately, contributing to observed variance across categories.

**Coordination problems**: When many recipients attempt to liquidate simultaneously, market impact is amplified. Individual recipients have no incentive to coordinate.

## 6.2. Supply Shock Theory

The supply shock hypothesis, drawing on Keyrock (2024) and the traditional equity lockup literature, provides a coherent framework: (i) asymmetric information between recipients and marginal buyers; (ii) concentrated liquidation incentives at release dates; (iii) limited absorption capacity on the demand side; (iv) predictable but underpriced timing.

This framework does not require misconduct. Recipients sell for individually rational reasons (diversification, liquidity needs, tax optimization). The anomaly arises from the interaction of these individually rational behaviors under cryptocurrency vesting structures.

## 6.3. Relationship to Keyrock (2024) — A Methodological Caveat

Our findings are qualitatively consistent with Keyrock (2024) in three respects: direction and approximate magnitude of the effect; ranking of recipient categories (Team > Mixed > Ecosystem); stronger effects from cliff versus linear vesting.

**However, we explicitly caution against interpreting our 72-hour result (88.5%) and Keyrock's 30-day result (90%) as a direct measurement of "where selling pressure is concentrated within a 30-day window."** This cross-study comparison has three methodological limitations:

1. **Non-overlapping samples**: Our 52 events are not a subset of Keyrock's 16,000+ events.
2. **Different measurement windows**: Our 72-hour window is not nested within Keyrock's 30-day window in a way permitting direct decomposition.
3. **Methodological differences**: Keyrock's exact event definition, price sourcing, and treatment of overlapping events are not identical to ours.

**Conservative interpretation**: "Within our sample, the majority of the observed unlock-return effect occurs within 72 hours. Our 72-hour rate (88.5%) is similar in magnitude to Keyrock's 30-day rate (90%), which is consistent with—but does not prove—the hypothesis that selling pressure is front-loaded." We view our work as complementary to Keyrock's, not a direct temporal decomposition.

---

# 7. Implications and Strategy Discussion

## 7.1. Academic Implications

Our findings contribute to three ongoing debates. First, we provide preliminary sample-level evidence against strong-form market efficiency in cryptocurrency markets with respect to publicly announced vesting events. Second, we demonstrate that cross-asset comparisons are essential for isolating idiosyncratic effects. Third, our 365-day cliff observation, if replicated out-of-sample, would suggest that calendar-based anomalies have cryptocurrency analogs awaiting systematic documentation.

## 7.2. Strategy Implications — Brief, With Strong Caveats

Our in-sample results suggest that a pre-unlock short position held for 72 hours would have generated positive returns in 88.5% of events in our sample. **For completeness, the results of 10 illustrative backtest specifications are provided in Appendix E. None of these specifications should be interpreted as a live trading strategy.** A number of factors would likely degrade live performance, including slippage, funding costs, borrow availability, regulatory constraints, adaptive market behavior, and tail risk. A more cautious practical implication is that understanding unlock calendars should inform long-position timing and sizing, not necessarily motivate aggressive short positions for retail participants.

## 7.3. Investor Protection Implications

Cryptocurrency investor protection frameworks—including Korea's Virtual Asset User Protection Act (enacted 2023, effective 19 July 2024), the EU's Markets in Crypto-Assets Regulation (MiCA; adopted April 2023, phased application from June 2024), and evolving U.S. SEC guidance—generally focus on disclosure, custody, and manipulation prevention. Our findings suggest that standardized pre-unlock disclosure could reduce information asymmetry.

---

# 8. Robustness Checks

Summary of robustness checks (full tables in Appendix D).

| Check | Result |
|-------|--------|
| 1. Sample-period subsetting (2023/2024/2025) | Negative rates 85.7% / 90.5% / 88.2% — stable |
| 2. Alternative windows (24h/48h/96h) | 80.8% / 86.5% / 90.4% — 72h near peak effect |
| 3. Unlock size filter (>3% of supply) | 94.1%, mean −21.3% — effect stronger |
| 4. Exclude 365-day cliff events | 84.2%, mean −13.1% — core pattern persists |
| 5. Wilcoxon signed-rank | p < 10⁻⁷ |
| 6. Alternative benchmarks (ETH, Top-10) | Similar qualitative results |
| 7. Bonferroni-corrected significance | Primary result significant; 365-day exploratory |
| 8. Volatility-regime split | Results stable across high-vol and low-vol periods |
| 9. Token-age bifurcation (<1y vs ≥1y) | Both subgroups negative; <1y slightly stronger |

---

# 9. Limitations and Future Research

## 9.1. Limitations

**Sample size and selection**: 52 events is approximately 0.3% of the universe studied by Keyrock. Smaller-cap and less-documented projects are likely underrepresented.

**Inference concerns**: Our Bayesian framework is informal. The 365-day cliff finding is post-hoc and subject to the multiple-hypothesis testing concerns emphasized throughout.

**Cross-study comparison limits**: Direct within-sample temporal decomposition of the Keyrock 30-day effect is not possible from our data.

**Causal inference**: Our event-study approach identifies association, not causation. Unobserved project-specific factors may correlate with both unlock scheduling and investor behavior.

**External validity**: Findings are specific to Binance-listed tokens during 2023-2025.

## 9.2. Future Research

**Direction 1 — Large-sample replication with fine temporal resolution**: Extending analysis to the full Keyrock sample with fine-grained temporal resolution would test whether our 72-hour concentration and 365-day cliff patterns generalize.

**Direction 2 — On-chain flow analysis**: Combining unlock event data with on-chain transaction data could identify whether predicted selling behavior occurs in recipient wallets.

**Direction 3 — Cross-exchange and cross-jurisdiction comparison**: Effects on centralized vs. decentralized exchanges, across jurisdictions with differing regulatory regimes.

**Direction 4 — Recipient heterogeneity modeling**: Structural models distinguishing diversifying recipients, cash-flow-constrained treasuries, and long-term-oriented holders.

**Direction 5 — Pre-registered out-of-sample test of the 365-day cliff**: Given post-hoc identification, a pre-registered analysis on events occurring after this paper's publication would provide a clean test.

**Direction 6 — Quasi-experimental causal identification**: Within-project comparisons of linear vs. cliff unlocks could provide a difference-in-differences identification strategy for the causal effect of unlock structure.

---

# 10. Conclusion

This paper documents three empirical regularities surrounding token unlock events in cryptocurrency markets, using a hand-curated sample of 52 events on Binance-listed assets between January 2023 and December 2025.

- **Finding 1** (confirmatory): 88.5% of events exhibit negative 72-hour returns (p = 2.2 × 10⁻⁹, robust to Bonferroni correction across 17 tests).
- **Finding 2** (methodologically novel): The effect is not meaningfully modulated by Bitcoin regime (ANOVA p = 0.24) and is robust to alternative market benchmarks (ETH, top-10 index). Multivariate regression further indicates that unlock size is an independent driver of the effect, beyond market beta and recipient category.
- **Finding 3** (exploratory, hypothesis-generating): All 14 events in our sample falling within 60 days of the 365-day post-listing anniversary exhibit negative outcomes. **This was identified through post-hoc exploration and is not a valid confirmatory test**. Pre-registered out-of-sample replication is essential.

**Notwithstanding the correlational nature of our findings, the consistency of the effect across Bitcoin regimes, recipient categories, alternative benchmarks, and the multivariate regression suggests that unlock-specific selling pressure is the most parsimonious explanation among those we considered.**

We emphasize that all patterns are observed within a bounded sample period, that our interpretation is a hypothesis rather than a causal claim, and that strategy implications should not be derived naively from in-sample statistics. Our findings contribute preliminary evidence to the growing literature on cryptocurrency market microstructure. We encourage replication with larger samples, alternative exchanges, and out-of-sample periods. All data and analysis code are publicly available.

---

# References

Brav, A., & Gompers, P. A. (2003). The role of lockups in initial public offerings. *Review of Financial Studies*, 16(1), 1-29.

Binance Research. (2024, May). *Token unlocks reach $155 billion by 2030*. Retrieved from https://www.binance.com/en/research

European Union. (2023). Regulation (EU) 2023/1114 of the European Parliament and of the Council of 31 May 2023 on markets in crypto-assets (MiCA); adopted April 2023, published in the *Official Journal of the European Union* on 9 June 2023, with phased application from 30 June 2024.

Field, L. C., & Hanka, G. (2001). The expiration of IPO share lockups. *Journal of Finance*, 56(2), 471-500.

Gandal, N., Hamrick, J. T., Moore, T., & Oberman, T. (2018). Price manipulation in the Bitcoin ecosystem. *Journal of Monetary Economics*, 95, 86-96.

Hu, Y., Li, R., & Schwartz, A. (2022). Sequence-based target coin prediction for cryptocurrency pump-and-dump. arXiv:2204.12929.

Keyrock. (2024, December). *From locked to liquidity: What 16,000+ token unlocks teach us*. Retrieved from https://keyrock.com/research

Kim, H. (2026). Replication data and analysis code for "The 72-Hour Shock? Preliminary Evidence from 52 Token Unlock Events on Binance" [Dataset and code repository]. GitHub. https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Token%20unlock%2072h%20shock%20analysis%20

La Morgia, M., Mei, A., Sassi, F., & Stefa, J. (2022). The Doge of Wall Street: Analysis and detection of pump and dump cryptocurrency manipulations. *ACM Transactions on Internet Technology*, 22(4), 1-28.

Republic of Korea. (2023). *Virtual Asset User Protection Act* (가상자산 이용자 보호 등에 관한 법률). Enacted 2023; came into effect on 19 July 2024. Korean Financial Services Commission.

Thaler, R. H. (1987). Anomalies: The January effect. *Journal of Economic Perspectives*, 1(1), 197-201.

---

# Appendix A — Data Availability Statement

The complete dataset and analysis code are publicly available at:

**Repository**: https://github.com/gameworkerkim/vibe-investing
**Path**: `/01.Trading Strategy/Token unlock 72h shock analysis /data/`

The repository contains the following files:

| File | Description |
|------|-------------|
| `01_binance_token_unlock_events_2023_2025.csv` | 52 unlock events with full metadata |
| `02_hypothesis_verification_summary.csv` | 13 metrics for hypothesis testing |
| `03_recipient_category_analysis.csv` | 7 recipient categories with return statistics |
| `04_btc_relative_performance_matrix.csv` | 5 Bitcoin regime decompositions |
| `05_unlock_trading_strategies_backtest.csv` | 10 illustrative backtest specifications |
| `06_hourly_prices_events.csv` | Hourly prices T−24h to T+72h for all 52 events |
| `07_top10_index_constituents.csv` | Top-10 market-cap index composition by quarter |
| `08_eth_prices_events.csv` | Ethereum prices over each event window |
| `09_tested_hypotheses_list.csv` | Complete list of 17 formal hypothesis tests |
| `10_regression_analysis_inputs.csv` | Integrated variables for OLS specification |

**Citation format**:
> HoKwang Kim. (2026). Replication data and analysis code for "The 72-Hour Shock?" [Dataset]. GitHub. https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Token%20unlock%2072h%20shock%20analysis%20

All results in this paper can be reproduced using the provided data and code. Errata and post-publication updates will be maintained on the repository.

---

# Appendix B — Ethics, Conflicts of Interest, and Affiliation Disclosure

## Research Capacity

This paper is produced in the author's independent research capacity. Although the author is the Chief Executive Officer of Betalabs Inc. (Seoul, South Korea), this research was not conducted under the auspices of Betalabs Inc., did not receive company funding, and does not reflect the views or positions of the company, its employees, or its shareholders.

## Financial Disclosure

The author declares no financial holdings in any tokens discussed in this paper as of the submission date. The author has not held and does not currently hold any short positions related to the specific events studied. No external funding, grant, or in-kind support was received from any institution, foundation, exchange, market-making firm, or individual investor.

## Conflicts of Interest

To the author's knowledge, there are no conflicts of interest. The author has no personal, professional, or commercial relationship with: the foundations, teams, or investor groups associated with any of the 52 tokens; Keyrock or its affiliates; Binance or other cryptocurrency exchanges referenced in the paper.

## Not Investment Advice

This paper does not provide investment, legal, or tax advice. It is a scholarly analysis intended to contribute to academic discourse on cryptocurrency market structure.

---

# Appendix C — Robustness: Alternative Market Benchmarks

**Table C.1: Market-Adjusted 72-Hour Returns by Benchmark**

| Benchmark | Mean Adjusted Return | % Events Negative | Pairwise corr. with BTC-adj |
|-----------|---------------------|-------------------|-----------------------------|
| Bitcoin (BTC/USDT) — Primary | −17.0% | 88.5% | 1.000 |
| Ethereum (ETH/USDT) | −15.9% | 86.5% | 0.94 |
| Top-10 Market-Cap Weighted Index | −16.2% | 86.5% | 0.97 |

The Top-10 index is reconstructed at event time T−24h to exclude the event token itself. Weights are proportional to market capitalization at T−24h, with daily rebalancing within the event window. All three benchmarks yield qualitatively identical conclusions.

---

# Appendix D — Complete List of 17 Hypothesis Tests with Bonferroni Correction

| # | Test | Null Hypothesis | p-value | Bonferroni Survives? |
|---|------|-----------------|---------|-----------------------|
| 1 | Primary 72h negative-rate | p = 0.5 | 2.2 × 10⁻⁹ | ✅ Yes |
| 2 | Wilcoxon signed-rank | Symmetric around 0 | < 10⁻⁷ | ✅ Yes |
| 3 | BTC regime: Strong Up | Mean = 0 | 0.018 | ❌ No |
| 4 | BTC regime: Mild Up | Mean = 0 | 0.001 | ✅ Yes |
| 5 | BTC regime: Flat | Mean = 0 | 0.0003 | ✅ Yes |
| 6 | BTC regime: Mild Down | Mean = 0 | 0.0001 | ✅ Yes |
| 7 | BTC regime: Strong Down | Mean = 0 | 0.009 | ❌ No |
| 8 | ANOVA across regimes | No modulation | 0.24 | — (confirms null) |
| 9 | Team Only vs Ecosystem | Equal means | 0.021 | ❌ No |
| 10 | Team+Investor vs Ecosystem | Equal means | < 10⁻⁴ | ✅ Yes |
| 11 | 24-hour window | p = 0.5 | 6.4 × 10⁻⁶ | ✅ Yes |
| 12 | 48-hour window | p = 0.5 | 5.8 × 10⁻⁸ | ✅ Yes |
| 13 | 96-hour window | p = 0.5 | 1.3 × 10⁻⁹ | ✅ Yes |
| 14 | Unlock size > 3% subsample | p = 0.5 | 4.1 × 10⁻⁸ | ✅ Yes |
| 15 | ETH-adjusted returns | Mean = 0 | < 10⁻⁶ | ✅ Yes |
| 16 | Top-10-adjusted returns | Mean = 0 | < 10⁻⁶ | ✅ Yes |
| 17 | **365-day cliff (POST-HOC)** | 14/14 random | 6.1 × 10⁻⁵ | ⚠️ Invalid due to post-hoc selection |

**Bonferroni-adjusted threshold**: α = 0.05 / 17 ≈ 0.00294

**Summary**: The primary finding (#1) and 9 of the secondary findings remain significant after Bonferroni correction. Four sub-analyses do not survive Bonferroni (#3, #7, #9). The 365-day cliff finding (#17), while nominally surviving, is invalidated by its post-hoc discovery and is treated as hypothesis-generating only.

---

# Appendix E — Illustrative Backtest Results (NOT a Trading Strategy Recommendation)

**⚠️ ILLUSTRATIVE ONLY — These results are provided for completeness and reproducibility. They should not be interpreted as live trading recommendations. Live implementation would require extensive additional analysis of slippage, funding costs, borrow availability, regulatory constraints, and tail risk.**

**Table E.1: 10 Illustrative Backtest Specifications**

| # | Specification | Entry Filter | N events | In-Sample Win Rate | Mean Return |
|---|---------------|--------------|----------|--------------------|-----------| 
| 1 | Naive 72h short, all events | None | 52 | 88.5% | +17.0% |
| 2 | Cliff-only events | Cliff structure | 38 | 89.5% | +18.8% |
| 3 | Unlock size >3% | Size ≥ 3% | 34 | 94.1% | +21.3% |
| 4 | Team+Investor recipients | Team/Investor | 31 | 93.5% | +20.8% |
| 5 | Hybrid: cliff + >3% + Team/Investor | 3 filters | 22 | 95.5% | +23.1% |
| 6 | 365-day anniversary cliff only | Days 335-395 | 14 | 100.0% | +27.5% |
| 7 | Exclude Strong Down BTC | BTC > −5% | 46 | 87.0% | +14.8% |
| 8 | Large-cap tokens only | Mkt cap rank <50 | 38 | 86.8% | +16.2% |
| 9 | Small-cap tokens only | Mkt cap rank ≥50 | 14 | 92.9% | +19.5% |
| 10 | Naive LONG (control) | Inverse of #1 | 52 | 11.5% | −17.0% |

**Critical caveats for Table E.1**:

1. These are **in-sample** statistics with no out-of-sample validation.
2. Transaction costs are modeled as 20 bps round-trip; real costs vary.
3. Funding costs, borrow availability, and slippage are not included beyond this.
4. Specifications #5 and #6 have very small sample sizes (N = 22 and N = 14); their high in-sample win rates should be interpreted as upper-bound illustrations, not expected future performance.
5. **Specification #6 incorporates the post-hoc 365-day cliff finding and is especially subject to data-mining concerns.**
6. Live implementation would likely produce substantially worse performance due to factors not modeled.

The illustrative nature of Table E.1 cannot be overstated. These numbers are for academic completeness and reproducibility, not as a practical trading guide.

---

**Manuscript word count**: ~10,200 words (excluding references and appendices)
**Page count (estimated, 12pt Times, single-spaced)**: ~20 pages

---

*Prepared for submission to SSRN (Social Science Research Network).*
*Version 3.1 — Final author-reviewed edition.*
*Draft date: April 23, 2026*
