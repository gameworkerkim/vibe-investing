# IdeaNote — Token Unlock 72h Shock Analysis

**Author**: HoKwang Kim (Independent Researcher)
**Last Updated**: April 23, 2026
**Status**: Companion notes to SSRN Working Paper v3.0

---

## 📌 Purpose of This Document

This is the author's working notebook for the Token Unlock 72h Shock research. It serves three purposes:

1. **Research motivation** — why this question, why now?
2. **Methodological decisions** — what choices were made and why?
3. **Self-critique** — where is the work weakest, and what comes next?

This document is deliberately less formal than the SSRN paper. It captures reasoning that is too exploratory for the main manuscript but essential for understanding the research program as a whole.

---

## 1. Research Motivation

### 1.1. Why token unlocks?

Token unlock events are one of the few "natural experiments" available in cryptocurrency markets:

- **Exogenous timing**: Dates are set at project inception and rarely change
- **Public information**: Schedules are on-chain and freely available
- **Quantifiable magnitude**: Exact token counts are known in advance
- **Repeatable**: Thousands of events per year across the token universe

If markets were efficient, these events should have zero price impact on the release date — all information should already be priced. The persistent negative impact documented by Keyrock (2024) therefore poses a fundamental puzzle about cryptocurrency market efficiency.

### 1.2. Why the 72-hour window?

Keyrock's 30-day window is well-suited for establishing aggregate patterns but unable to answer the mechanism question: when exactly does the selling pressure hit? Three candidate answers exist:

- **Evenly distributed**: Recipients sell gradually over 30 days
- **Front-loaded**: Most selling happens in the first few days
- **Back-loaded**: Waiting for liquidity to absorb the supply

If front-loaded, then a 72-hour window should capture most of the 30-day effect. If evenly distributed, it should capture ~10%. The empirical answer (88.5% ≈ 90%) strongly suggests front-loading, which in turn implies a specific mechanism: recipients are eager to liquidate, and market makers cannot absorb the flow quickly without price concessions.

### 1.3. Why Bitcoin-relative analysis?

A pure supply shock story should produce token underperformance regardless of broader market conditions. A market-beta story predicts the opposite: unlocks lose money when BTC loses money, and make money when BTC makes money.

The observed pattern (negative returns even during strong BTC rallies) is difficult to reconcile with market beta alone. It suggests the supply shock is an additive, not a multiplicative, phenomenon — more consistent with a flow-based mechanism than a factor-exposure mechanism.

### 1.4. Why the 365-day discovery was surprising

The 14/14 negative rate near the 365-day anniversary was the single most striking pattern in the data. But it was *discovered*, not *hypothesized*. This is a critical distinction I want to be explicit about:

- I did not enter the analysis looking for a 365-day pattern
- After seeing initial results, I explored various "cliff windows" (30-day, 90-day, 180-day, 365-day, 730-day)
- Only the 365-day window produced the striking result
- This is classic multiple-testing / garden-of-forking-paths territory

The correct statistical posture is to treat this as hypothesis-generating only. The paper reflects this explicitly (Section 4.4 with post-hoc flags, ⚠️ warnings in Table 4, and the complete absence of "this proves X" language).

---

## 2. Methodological Decisions

### 2.1. Sample size: N = 52, not N = 16,000

Why not replicate Keyrock's 16,000+ sample? Three reasons:

1. **Access**: Keyrock has proprietary data pipelines I don't have
2. **Quality over quantity**: My 52 events are all manually verified across 2+ sources. A researcher attempting to scale would inevitably trade off quality for quantity
3. **Speed**: This is a working paper, not a decade-long empirical project. N = 52 is the appropriate sample for a first-pass analysis

The implication is that my statistical claims are conservative (Bonferroni-robust even at N = 52) but less externally valid than a full-sample study. Phase 2 aims to remedy this.

### 2.2. Why Bonferroni, not FDR?

Benjamini-Hochberg FDR is arguably more appropriate for exploratory multi-testing contexts. I chose Bonferroni for two reasons:

1. **Readability**: Bonferroni is the more widely-understood correction
2. **Conservatism**: Bonferroni is strictly more conservative than BH-FDR, which means surviving Bonferroni implies surviving BH-FDR too. The primary finding (p = 2.2e-9) passes both with enormous margin

A future revision could report both Bonferroni and BH q-values for completeness. This is in the roadmap.

### 2.3. Why event-study, not causal inference?

Event studies identify association, not causation. A truly causal analysis would require:

- **Random assignment**: Unlock schedules were not randomly assigned to projects
- **Clean counterfactual**: No untreated "control" for the same token at the same time
- **Instrumental variable**: No obvious IV for unlock timing

Therefore, we stopped at event study. The paper is honest about this. Future work could exploit within-project variation (linear vs. cliff structures for the same project) as a quasi-experimental design.

### 2.4. Why three competing hypotheses?

The Bayesian 3-hypothesis framing (random walk / market beta / supply shock) came from earlier vibe-investing work (VTCLR, Iran Polymarket). It's a useful rhetorical device for:

- Making the alternative explanations explicit
- Showing that the data differentially favor one over the others
- Avoiding the trap of only considering the "preferred" hypothesis

H₃ being "most consistent with the data" is a weaker claim than "H₃ is proven". The paper maintains this distinction carefully.

---

## 3. Self-Critique

This section mirrors the SELF_CRITIQUE structure in the paper's companion materials. It is reproduced here with working notes.

### 3.1. Critical Weaknesses (5)

**CW1 — Sample Size vs. Claim Mismatch** (6/10)

N = 52 vs. Keyrock's 16,000+ is a 0.3% sample fraction. The title already reflects this (`?` + "Preliminary Evidence"), but the core claim is still vulnerable to replication failure on larger samples.

**CW2 — 365-Day Cliff as Post-Hoc** (7/10)

The highest-severity weakness. Despite multiple warnings in the paper, readers may still over-interpret 14/14 as confirmatory. The only real fix is pre-registered out-of-sample replication — planned for 12-18 months post-publication.

**CW3 — Multiple-Testing Correction Scope** (5/10)

Bonferroni on 17 tests may under-count the "effective number of tests" given data exploration. BH-FDR would be an improvement. Not critical for the primary finding (which passes any reasonable correction), but matters for sub-analyses.

**CW4 — Limited Bitcoin Beta Controls** (4/10)

BTC + ETH + Top-10 index covers most of the variance, but a proper Liu-Tsyvinski-Wu 5-factor model would be better. N = 52 precludes this technically. Phase 2 with larger N should implement it.

**CW5 — Causal Inference Not Established** (5/10)

Acknowledged repeatedly. Not a fatal flaw for an event study, but limits the paper's contribution ceiling. Future DID or quasi-experimental designs could address this.

### 3.2. Additional Limitations (3)

**L1 — Survivorship Bias** (3/10): Binance-listed tokens only; failed projects excluded.

**L2 — Transaction Cost Idealization** (2/10): 20 bps round-trip, zero slippage; flagged in the paper.

**L3 — Publication Bias Potential** (3/10): This is a single significant finding. The author has not pre-registered or reported null findings from similar analyses. Pre-registration for Phase 2 will address this.

### 3.3. Composite Self-Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| Research question clarity | 9/10 | Two questions well-defined |
| Methodological rigor | 7/10 | Good framework; N = 52 limits |
| Transparency and ethics | 10/10 | Full data release; independent positioning |
| Contribution magnitude | 6/10 | Extends Keyrock; does not supplant |
| Reproducibility | 8/10 | 10 CSVs + 8 Python scripts + full docs |
| Writing style | 8/10 | Clear; "Shock" may slightly overstate |

**Composite**: 8.0 / 10

**Position in literature**: Solid working paper. Appropriate for SSRN. Would require Phase 2 replication before top-tier peer-reviewed finance journals.

---

## 4. Roadmap

### Short-term (next 1-3 months)

1. ✅ v3.0 paper completed (April 23, 2026)
2. ⏳ Editage academic editing (~$200, 3-5 days turnaround)
3. ⏳ SSRN account creation + metadata preparation
4. ⏳ **SSRN submission target: May 10-15, 2026**
5. ⏳ LinkedIn / X / Hacker News outreach within 48h of SSRN publication

### Medium-term (3-12 months)

6. **Out-of-sample events** collected for pre-registered 365-day cliff replication (events from May 2026 onward)
7. **Sample expansion** to 200+ events across Binance + Coinbase + OKX
8. **Liu-Tsyvinski-Wu 5-factor model** implementation for rigorous beta control
9. **On-chain flow analysis**: verify predicted selling behavior in recipient wallets (Etherscan + custom indexers)

### Long-term (1-2 years)

10. **Phase 2 paper**: Full Keyrock-scale replication (target: 1,000+ events with fine-grained temporal resolution)
11. **Phase 3 paper**: Cross-exchange and cross-jurisdiction comparison
12. **Methodological paper**: Pre-registered framework for cryptocurrency event studies

---

## 5. Ethical Statement

The author affirms:

1. **No data manipulation**: Collection and analysis followed pre-specified procedures where pre-specification was possible
2. **Transparent exploration**: Exploratory findings are explicitly flagged (not dressed up as confirmatory)
3. **No financial conflict**: The author holds no material position in any token discussed
4. **Independent judgment**: Research conducted outside Betalabs Inc. in personal capacity
5. **No paid promotion**: No compensation received from any project, foundation, or market participant

Violations of any of the above would warrant retraction.

---

## 6. Personal Reflections

### 6.1. What I learned

The most humbling part of this research was the 365-day cliff discovery. My first instinct was excitement: "14/14! Probability 1/16,000!". My second instinct — after 24 hours of reflection — was caution: "I discovered this by looking at the data. That's not a valid test."

The paper's multiple disclaimers around Section 4.4 reflect this internal evolution. I believe this is the right epistemic posture. Exciting results discovered through exploration should be announced as hypotheses to be tested, not conclusions to be celebrated.

### 6.2. What I'd do differently

If starting over, I would:

1. **Pre-register** the analysis plan before collecting data (though this is difficult when using already-collected historical events)
2. **Fixed-window hypothesis**: Pre-specify that I would analyze 72 hours, 1 week, 1 month, etc., and report all, rather than emphasizing the one that produced the best result
3. **Cross-validation**: Hold out 20% of the sample as a test set for out-of-sample validation of in-sample findings

None of these changes would materially alter the primary 72-hour finding (which is robust to arbitrary window choices). But they would improve the statistical validity of the exploratory findings.

### 6.3. The bigger question

Why does this market anomaly persist despite public information? My working hypothesis (not in the paper) is:

- **Retail attention is too slow**: By the time retail notices an upcoming unlock, the front-running has already begun
- **Institutional capital is constrained**: Sophisticated arbitrageurs face borrow limits, jurisdictional constraints, and liquidity issues for mid-cap tokens
- **Coordination failure**: No single agent has the incentive to "fix" the market; recipients individually maximize their own returns

If this is right, the anomaly may persist until either (a) unlock schedules become more granular and less concentrated, or (b) institutional short infrastructure improves. Neither is imminent.

---

## 7. Acknowledgments

This research builds directly on Keyrock (2024)'s pioneering 16,000-event study. The author is grateful for Keyrock's public dissemination of their aggregate findings, which provided both the motivation and the baseline for this work.

The public availability of unlock schedule data via Tokenomist, CoinMarketCap, DefiLlama, and DropsTab made this research possible without proprietary data access.

No AI models are listed as coauthors. AI-assisted drafting tools were used under author direction for language refinement only; all methodological, analytical, and interpretive decisions are the author's responsibility.

---

## 8. Contact

**HoKwang Kim**
Independent Researcher (Betalabs Inc. CEO, personal capacity)
Email: gameworker@gmail.com
ORCID: [0009-0002-0962-2175](https://orcid.org/0009-0002-0962-2175)
GitHub: [@gameworkerkim](https://github.com/gameworkerkim)

---

*"Self-criticism, rigorously and publicly applied, is the only defense against the seduction of one's own findings."*

*— HoKwang Kim, vibe-investing research note*
