# IdeaNote — Disclosure Timing Around Token Unlocks

## Phase 3 Research Program: Evidence from Asian Cryptocurrency Markets (2022-2025)

**Author**: HoKwang Kim (Independent Researcher)
**Status**: Pre-Research Ideation Document
**Date Created**: April 23, 2026
**Target Execution**: 2026 Q3-Q4 (after 72h Shock paper Phase 2 completion)
**Part of**: vibe-investing research series (Phase 3)

---

## 📌 Purpose of This Document

This is a working notebook capturing the research design for the **third paper** in the 72-hour shock research program. It establishes:

1. **Research question and hypotheses** — what's being tested, and why
2. **Methodological framework** — what data, what tests, what controls
3. **LLM-based detection system** — the final deliverable and its design
4. **Legal and ethical safeguards** — how to research crypto disclosures without creating litigation risk
5. **Relationship to Phase 1 (72h Shock) and Phase 2 (N=200 extension)**

This document is **ideation only** — not a commitment to execute. Execution decisions will be made after Phase 2 (N=200 72h shock extension) is complete and SSRN Abstract ID 6632838 has accumulated 6-12 months of citation data.

---

## 1. Research Motivation

### 1.1. The Observed Pattern in Practice

Over the author's eight years of practitioner experience in the Asian cryptocurrency ecosystem (2017-2026), a recurring operational pattern has emerged around major token unlock events:

1. **Pre-unlock disclosure clustering**: Foundation teams frequently release market-positive announcements (buybacks, staking programs, strategic partnerships, ecosystem grants) in the 7-30 days preceding scheduled unlock events.

2. **KOL amplification synchrony**: These announcements are often amplified through Key Opinion Leader (KOL) networks on Twitter/X, Telegram, and Medium, creating coordinated narrative moments.

3. **Execution-promise gap**: Subsequent on-chain and market behavior frequently fails to match the announced program's promised scope. Buybacks announced at $100M materialize at $10M; staking programs announced with 20% APR taper to 5%; partnerships announced with "major exchanges" translate to minor tier-3 listings.

4. **Post-announcement token movement**: In parallel with the above, on-chain data suggests movement of tokens from foundation-associated wallets to exchange deposit addresses, consistent with liquidation activity.

### 1.2. The Research Gap

These observations are known to practitioners but remain empirically undocumented. The existing literature addresses adjacent questions:

- **Keyrock (2024)**: aggregate unlock price impact
- **Félez-Viñas, Johnson, Putniņš (2022)**: insider trading before listing announcements
- **Huang & Gao (2025)**: traditional firms' strategic crypto disclosures in 10-K filings
- **Kim (2026) — 72h Shock (Phase 1)**: temporal concentration of unlock price impact

None of these systematically examine: (a) the timing relationship between foundation disclosures and unlock events, (b) the gap between announced promises and realized execution, and (c) the co-movement of on-chain foundation wallet activity around these coordinated narrative moments.

### 1.3. The Research Opportunity

This gap is particularly acute for **Asian cryptocurrency markets** (Korea, Japan, Singapore, Hong Kong), where:

1. Disclosure practices are often bilingual (Korean/English, Japanese/English) with different content across languages
2. KOL networks are more regionally concentrated and more easily identified
3. Foundation operations are often physically based in Asia despite global token distribution
4. Regulatory frameworks are actively evolving (Korea's VAUPA 2024, Japan's FSA crypto guidelines)

The author's practitioner network provides unique access to Asian-market disclosure patterns that Western researchers cannot easily replicate.

---

## 2. Research Questions and Hypotheses

### 2.1. Core Research Questions

**RQ1 (Descriptive)**: Are foundation disclosures temporally clustered around token unlock events?

**RQ2 (Associational)**: Do disclosures in the unlock window (T-30 to T+14) produce different price and on-chain responses than disclosures outside this window?

**RQ3 (Execution gap)**: How frequently do pre-unlock disclosures result in the announced outcome? Can this gap be quantified?

**RQ4 (Predictive — LLM application)**: Can the textual features of disclosures, combined with timing and on-chain context, predict the probability of disclosure-execution gap?

### 2.2. Formal Hypotheses (Three-Tier Structure)

Following the approach validated in the 72h Shock paper, hypotheses are structured in escalating strength, with each tier legally and statistically defensible.

**H1 (Clustering — observational)**: The frequency of foundation-issued market-positive disclosures in the 30-day window preceding unlocks (T-30 to T-1) is statistically higher than the base rate for the same foundations in non-unlock periods.

- **Test**: Poisson regression with foundation fixed effects; base rate estimation from project's full disclosure history
- **Expected outcome**: Ratio of 1.5-3.0x base rate
- **Legal safety**: Pure clustering observation; makes no claim about intent

**H2 (Market response — associational)**: Disclosures issued in T-30 to T-1 window produce larger short-term positive price responses but smaller long-term positive responses than comparable disclosures outside this window.

- **Test**: Event study with disclosure × unlock-proximity interaction; CAR at 1d, 7d, 30d
- **Expected outcome**: Short-term (1d) positive response 2-3x larger; long-term (30d) response neutral or negative
- **Legal safety**: Documents market reaction patterns; does not claim manipulation

**H3 (On-chain co-movement — structural)**: Within the T-30 to T-1 disclosure window, the incidence of foundation-wallet-to-exchange token movements is statistically elevated compared to non-unlock periods.

- **Test**: On-chain flow analysis using publicly identifiable foundation wallets (Nansen/Arkham verified)
- **Expected outcome**: 2-4x elevation in exchange-bound flows
- **Legal safety**: "Statistical co-movement" framing; explicitly excludes causal claims

**H4 (Execution gap — quantitative)**: The realized execution of announced programs (buybacks, staking expansions, etc.) falls below announced magnitude in a statistically significant proportion of cases.

- **Test**: Match announced metric (e.g., "$100M buyback") against on-chain realized value; compute fulfillment ratio
- **Expected outcome**: Median fulfillment ratio 0.3-0.7
- **Legal safety**: Objective metric comparison; no individual foundation named as "manipulative"

**H5 (Predictive — LLM application)**: A supervised LLM classifier trained on disclosure text, KOL amplification patterns, timing features, and on-chain context can predict disclosure-execution gap with AUC > 0.75 on held-out data.

- **Test**: Train/test split (70/30); stratified by project and time period
- **Expected outcome**: AUC 0.70-0.85
- **Application**: Open-source detection tool for investor use

### 2.3. What is NOT Claimed

To manage legal risk and maintain academic defensibility:

- ❌ **Not claimed**: "Foundation X manipulated its token price"
- ❌ **Not claimed**: "Foundation Y engaged in securities fraud"
- ❌ **Not claimed**: "All foundations exhibit this pattern"
- ❌ **Not claimed**: Causal relationship between disclosure and price movement
- ✅ **Claimed**: Statistical associations and temporal clustering patterns exist
- ✅ **Claimed**: A predictive model can identify higher-risk disclosure patterns
- ✅ **Claimed**: Information asymmetry is structurally elevated around unlock events

---

## 3. Data Infrastructure

### 3.1. Data Sources and Collection

**Tier 1 — Token Unlock Events** (already infrastructure from Phase 1):
- Tokenomist (primary)
- CoinMarketCap Unlocks
- DefiLlama Unlocks
- DropsTab
- Phase 1 dataset (52 events, 2023-2025) provides foundation

**Tier 2 — Disclosure Events**:
- Project official Twitter/X accounts
- Project official Telegram channels (via TGStat API)
- Project Medium blogs and Mirror.xyz posts
- Xangle Disclosure Portal (Korean-market prominent)
- CoinMarketCap news feed
- CryptoPanic aggregation
- Project GitHub commits (for technical disclosures)

**Tier 3 — KOL Amplification**:
- Top 200 crypto KOLs on Twitter/X (by follower count × engagement rate)
- Korean crypto KOL list (separate tracking — unique to this paper)
- Japanese crypto KOL list (supplementary)
- Amplification metrics: retweet count, reply count, quote-tweet sentiment

**Tier 4 — On-Chain Data**:
- Foundation wallet addresses (Nansen labels + Arkham labels + project disclosures)
- Confidence level per address (High/Medium/Low) based on cross-verification
- Exchange deposit addresses (major CEXs: Binance, OKX, Bybit, Bitget, Upbit, Coinbase)
- Dune Analytics queries for aggregate flow tracking

**Tier 5 — Market Data**:
- Price and volume data for each token (already in Phase 1 infrastructure)
- BTC price as market benchmark
- Top-10 market-cap-weighted index (from Phase 1)

**Tier 6 — Execution Tracking**:
- Buyback tracking: on-chain buyback wallet → DEX/CEX → token destruction/treasury
- Staking tracking: TVL data from DefiLlama, staking rate time series
- Partnership tracking: Twitter follow-up posts, news mentions (matched via LLM)

### 3.2. Sample Selection Criteria

**Inclusion criteria**:
1. Token listed on at least one of Binance/OKX/Bybit/Bitget during 2022-2025
2. At least one major unlock event during 2022-2025 (≥1% of circulating supply)
3. At least one publicly identifiable foundation wallet (confidence ≥ Medium)
4. Project has active disclosure presence on ≥2 of the Tier 2 channels
5. Continuous price data available from T-30 to T+14 for each unlock

**Target sample size**: 50-80 projects × 1-3 unlocks per project = 75-150 unlock-disclosure paired events

**Realistic scope**: Start with 30-40 projects for pilot analysis; expand if feasible

### 3.3. Disclosure Classification Framework

Each disclosure event is coded along four dimensions:

**D1 — Content Category** (multi-label):
- [ ] Token buyback program
- [ ] Staking program announcement or modification
- [ ] Strategic partnership
- [ ] Exchange listing (new venue or tier upgrade)
- [ ] Technical milestone (mainnet, upgrade, audit)
- [ ] Ecosystem grant program
- [ ] Treasury management update
- [ ] Leadership or governance change
- [ ] Regulatory development
- [ ] Other market-positive

**D2 — Sentiment Tone** (LLM-classified with human audit):
- Strongly positive / Moderately positive / Neutral / Moderately negative / Strongly negative
- Cross-validated: LLM sentiment × human coder × market reaction

**D3 — Specificity Score** (0-100):
- Numerical claims present (dollar amounts, percentages, timelines)
- Named counterparties vs. "major partners"
- Verifiable milestones vs. "coming soon"

**D4 — KOL Amplification Index**:
- Sum of (reach × engagement × sentiment) for top-200 KOLs within 48h of disclosure
- Baseline normalized per project

### 3.4. Execution Gap Measurement

For each disclosure promising a quantifiable outcome (subset of D3 > 50):

**Announced Magnitude** (A): e.g., "$100M buyback over 6 months"
**Realized Magnitude** (R): on-chain verified actual execution in the promised timeframe
**Fulfillment Ratio** (FR): R / A

**Categories**:
- Complete (FR ≥ 0.9): Promise substantively fulfilled
- Partial (0.5 ≤ FR < 0.9): Meaningful but incomplete execution
- Minimal (0.1 ≤ FR < 0.5): Token execution
- Unfulfilled (FR < 0.1): Effectively non-executed
- Unverifiable: Announced metric is not externally verifiable (e.g., "strategic alignment")

---

## 4. Methodology

### 4.1. Event Study Framework

**Primary event window**: T-30 to T+30 around each disclosure
**Secondary analysis window**: T-14 to T+14 for high-signal tests

**Abnormal Return Calculation**:
- Market model: R_token = α + β × R_benchmark + ε
- Benchmark choices: BTC (primary), ETH (robustness), Top-10 Index (robustness)
- Estimation window: T-120 to T-31 (90 days pre-event, excluding event window)
- CAR at 1d, 3d, 7d, 14d, 30d post-disclosure

**Unlock interaction test**:
- For each disclosure, compute days-to-nearest-unlock
- Interaction term: Disclosure × I(days-to-unlock ≤ 30)
- Hypothesis: Coefficient significantly positive for short-term (1d) CAR, negative for long-term (30d) CAR

### 4.2. Clustering Analysis

**Test 1 — Frequency clustering**:
- Null: Disclosures are uniformly distributed in time
- For each project, compute distribution of disclosure timestamps
- For each unlock, count disclosures in T-30 window vs. expected under uniform distribution
- Poisson regression with project fixed effects

**Test 2 — Content-specific clustering**:
- Does the content type distribution shift toward positive in the unlock window?
- Chi-square test across D1 categories

**Test 3 — KOL amplification clustering**:
- Is KOL amplification magnified for pre-unlock disclosures?
- OLS: KOL_Amplification ~ Disclosure_Magnitude × Unlock_Proximity + controls

### 4.3. On-Chain Flow Analysis

For each unlock event, construct:

**Foundation flow panel**:
- Daily net outflow from foundation wallets (T-60 to T+30)
- Daily exchange deposits from known foundation addresses
- Moving average and volatility of flows
- Cross-validated against Nansen + Arkham labels

**Test framework**:
- Null: Foundation flows in T-30 to T-1 window match baseline distribution
- Alternative: Elevated flows correlated with disclosure dates

**Critical caveat**: This analysis is inherently subject to wallet-identification uncertainty. We apply three confidence tiers and report results separately.

### 4.4. Execution Gap Analysis

**Cross-sectional analysis**:
- For all disclosures with quantifiable promises in sample, compute FR
- Report distribution, median, and by-category breakdown
- Compare FR for pre-unlock vs. non-unlock disclosures

**Panel analysis**:
- FR ~ Unlock_Proximity + Disclosure_Specificity + Project_Controls + Time_FE
- Hypothesis: Pre-unlock disclosures have lower median FR

### 4.5. LLM Classifier Design

**Architecture**: Fine-tuned encoder (e.g., DeBERTa, or Llama 3 8B with LoRA) on crypto-specific corpus

**Input features**:
- Disclosure text (primary)
- Timing features: days-to-nearest-unlock, time-of-day, day-of-week
- Historical project features: past FR distribution, disclosure frequency, token age
- On-chain context: recent foundation flow trend (optional, for advanced model)
- KOL amplification context: initial amplification magnitude

**Training labels**:
- Binary: Low-fulfillment (FR < 0.5) vs. Fulfilled (FR ≥ 0.5)
- Multiclass: D3 Complete / Partial / Minimal / Unfulfilled

**Training data strategy**:
- **Positive class (high-risk patterns)**: retrospectively identified disclosures with FR < 0.5
- **Negative class (fulfilled patterns)**: disclosures with FR ≥ 0.9
- Class balancing via sampling or focal loss

**Evaluation**:
- Primary metric: AUC-ROC on held-out test set
- Secondary: Precision at fixed recall levels (for practical deployment)
- Stratified evaluation: by project size, by disclosure type, by time period

**Open-source deployment**:
- Model weights published under CC-BY-NC-SA
- Inference API or local deployment guide
- Explicit disclaimer: "investor research tool, not financial advice"

### 4.6. Control Variables and Confounders

**Project-level controls**:
- Market capitalization
- Token age (days since listing)
- Trading volume baseline
- Project category (DeFi/GameFi/L1/L2/Meme/Infrastructure)

**Time-period controls**:
- BTC regime (from Phase 1 methodology)
- ETH regime
- Overall crypto market regime (bull/bear/flat)
- Macro regulatory news flow

**Unlock-specific controls**:
- Unlock size (% of supply)
- Recipient category (Team/Investor/Ecosystem) — from Phase 1 taxonomy
- Cliff vs. linear structure
- Days since listing at unlock date

---

## 5. Legal and Ethical Framework

### 5.1. Principles

1. **No accusation of specific wrongdoing against any named project**
2. **Statistical associations only — no causal claims**
3. **Anonymization of case studies** where specific projects are discussed
4. **Full transparency about methodology limitations**
5. **Pre-registration of hypotheses before data collection**

### 5.2. Naming Convention Protocol

**In the paper body**: 
- No specific project named as exhibiting a specific problematic pattern
- Aggregate statistics only
- Illustrative examples coded as "Project A, Project B..." with characteristics but no identifiers

**In supplementary materials**:
- Project-level data available only to bona fide researchers under data use agreement
- Academic request form with institutional verification

**For SEC-investigated or court-adjudicated cases only**:
- Specific naming permissible (e.g., LUNA/Terra case, Saitama Inu SEC action)
- Because these are matters of public legal record

### 5.3. Legal Review Requirements

Before SSRN submission of this paper:
1. **Korean IT/securities law attorney review** (minimum 2 hours consultation)
2. **US securities law attorney spot-check** (if specific US-regulated projects discussed)
3. **Academic freedom framing** — position as research contribution to information-asymmetry literature

### 5.4. Conflict of Interest Enhanced Disclosure

Beyond the Phase 1 COI framework, this paper requires:

1. **Explicit list of past advisory clients** (2017-2026) — verified that NO project in the sample was a past client
2. **Betalabs Inc. revenue source breakdown** — verifying no financial interest in findings
3. **Pre-registration of hypotheses** on OSF before data analysis begins
4. **Independent replication invitation** — full data and code public upon SSRN posting

### 5.5. What Could Go Wrong — Risk Mitigation

**Scenario 1: Named project sues for defamation**
- Mitigation: No specific naming of non-adjudicated cases
- Mitigation: Academic framing defense under First Amendment (US) / Art. 21 Korean Constitution

**Scenario 2: Regulators request data/testimony**
- Mitigation: Comply with legal process; do not obstruct
- Mitigation: Pre-arranged counsel for such requests

**Scenario 3: KOL reputation management attacks paper**
- Mitigation: Methodology transparency = indefensible only against rigor, not against PR
- Mitigation: Pre-prepared responses in ANTICIPATED_QA v2

**Scenario 4: Paper is misinterpreted by bad actors (e.g., short-selling coordination)**
- Mitigation: Explicit disclaimers in paper and LLM tool release
- Mitigation: No actionable signals; focuses on retrospective patterns

---

## 6. Deliverables

### 6.1. Primary Academic Output

**SSRN Working Paper v1**: "Disclosure Timing Around Token Unlocks: Evidence from Asian Cryptocurrency Markets (2022-2025)"
- Target: 25-30 pages
- Tables: 8-12
- Figures: 6-8
- Appendices: ~15 pages (methodology, code, data dictionary, LLM model card)

**Target venues**:
- SSRN working paper (initial)
- Journal of Financial Economics (stretch goal, after Phase 2 establishes author credibility)
- Review of Financial Studies (alternative)
- Journal of Financial Intermediation (realistic mid-tier target)
- Journal of Empirical Finance (realistic target)
- Finance Research Letters (fast-publication option)

### 6.2. LLM-Based Detection System

**Open-source model**: "UnlockDisclosureRisk-v1"
- Code: GitHub public repository
- Model weights: HuggingFace (CC-BY-NC-SA license)
- Documentation: model card with performance characteristics, limitations, intended use

**Deployment options**:
- Web demo (educational purposes)
- Python SDK for researchers
- API endpoint (rate-limited, free tier)

**Explicit non-use policy**:
- Not for trading signal generation in real-time
- Not for defamation or accusation against specific projects
- Research and education use only

### 6.3. Supplementary Outputs

**GitHub repository**:
- All Python analysis code
- All CSV datasets (anonymized version public; identified version under DUA)
- Jupyter notebooks reproducing every paper figure and table
- Docker container for full replication

**Data methodology paper** (potential):
- "Constructing a Cross-Source Cryptocurrency Disclosure Dataset"
- Separate methodology-focused paper documenting data construction
- Contributes to reproducibility literature

**Policy brief** (potential):
- 8-12 page summary for regulators (FSS Korea, FSA Japan, EU MiCA authority)
- Non-technical language; policy implications focused
- Released 3-6 months after SSRN paper

---

## 7. Relationship to Phase 1 and Phase 2

### 7.1. How This Paper Depends on Phase 1 (72h Shock)

- **Data infrastructure**: Unlock events, hourly prices, BTC regime framework all re-used
- **Methodology continuity**: Bonferroni correction, binomial tests, event study framework
- **Credibility**: Phase 1 SSRN publication establishes author as legitimate researcher
- **Sample core**: The 52 Phase 1 events form the initial core of this paper's sample

### 7.2. How This Paper Builds on Phase 2 (N=200 Extension)

**Phase 2 (target: 2026 Q4)** extends Phase 1 to:
- N ≥ 200 unlock events
- Pre-registered 365-day cliff replication
- Full LTW 5-factor model
- On-chain flow verification for subset

**Phase 3 (this paper, target: 2027 Q1-Q2)** then adds:
- Disclosure matching for all Phase 2 events
- KOL amplification tracking
- Execution gap analysis
- LLM classifier

This staging means Phase 3 does not require fresh N=200 unlock data collection — it inherits from Phase 2.

### 7.3. Research Program Coherence

```
Phase 1 (April 2026, SSRN 6632838): 
  What: 72h shock in unlock prices (N=52)
  So what: Effect is temporally concentrated, not just BTC beta
  
Phase 2 (2026 Q4, target):
  What: Confirmation at N≥200, pre-registered 365-day cliff
  So what: Effect is robust, scale-independent, not post-hoc artifact

Phase 3 (2027 Q1-Q2, this paper):
  What: Disclosure-unlock timing patterns + execution gap + LLM tool
  So what: Information asymmetry mechanism identified; detection tool deployed
  
Phase 4 (future, speculative):
  What: Cross-exchange and cross-jurisdiction extension
  So what: Generalizability, regulatory implications
```

This coherent program structure is what transforms Dennis from "researcher with a paper" to "researcher with a program."

---

## 8. Budget and Resource Planning

### 8.1. Personnel

**Primary investigator**: Dennis Kim (author) — estimated 300-500 hours over 12 months
- Ideation and design: 40 hours (mostly complete)
- Legal review coordination: 20 hours
- Data collection oversight: 100 hours
- Analysis: 150 hours
- Writing: 100 hours
- Review and revisions: 80 hours

**Research assistant (optional)**: 200-400 hours
- Disclosure tagging and classification
- On-chain wallet verification
- Source documentation
- Cost: $3,000-8,000 (Korean RA market rate)

**Statistical consultant**: 20-40 hours
- Panel regression specification review
- LLM evaluation framework
- Peer-review anticipation
- Cost: $2,000-5,000

### 8.2. Data and Tools

| Item | Cost | Priority |
|------|------|----------|
| Tokenomist API annual | $500-1,500 | Essential |
| Dune Analytics Plus | $240-800/month × 12 | Essential |
| Nansen subscription | $150-1,500/month × 6 (during heavy analysis) | High |
| Arkham subscription | $0-500/month × 12 | Medium |
| Xangle data partnership | Negotiated | High |
| TGStat Telegram API | $50-200/month × 12 | High |
| LLM training compute (fine-tuning) | $500-2,000 | Essential |
| Open-source LLM hosting | $100-300/month × 12 | Medium |

**Estimated total data/tools**: $8,000-18,000 over 12 months

### 8.3. Legal

| Item | Cost |
|------|------|
| Korean IT/securities attorney (Betalabs existing relationship) | $2,000-5,000 |
| US securities law spot review | $3,000-8,000 |
| Academic freedom framing consultation | $1,000-2,000 |

**Estimated total legal**: $6,000-15,000

### 8.4. Academic Publication

| Item | Cost |
|------|------|
| Editage editing (final draft) | $500-1,000 |
| Conference presentation (CRC 2027 or similar) | $2,000-4,000 |
| Open-access publication fee (if accepted) | $0-3,500 |

**Estimated total publication**: $2,500-8,500

### 8.5. Grand Total Estimate

**Lower bound**: $21,500 (self-executed, minimal tools, no RA)
**Upper bound**: $60,000 (RA, premium tools, full legal review, OA publication)

**Realistic mid-range**: $30,000-40,000 over 12 months

---

## 9. Success Criteria and KPIs

### 9.1. Publication Success

- [ ] SSRN working paper posted with Abstract ID assigned (Base success)
- [ ] Cryptocurrency Research eJournal distribution (Strong success)
- [ ] Peer-reviewed mid-tier journal acceptance within 24 months (Strong success)
- [ ] Peer-reviewed top-tier journal acceptance within 36 months (Stretch goal)

### 9.2. Impact Metrics

**Baseline targets (12 months post-SSRN)**:
- SSRN downloads: 1,500-3,000
- GitHub stars on companion repo: 100-300
- Academic citations: 3-8
- Media coverage: 5-15 substantive articles

**Stretch targets (24 months)**:
- SSRN downloads: 5,000-10,000
- Academic citations: 15-30
- Policy citation by regulator: ≥ 1
- Conference invited presentations: 2-5

**LLM tool adoption**:
- HuggingFace downloads: 500-2,000 in first year
- Active API usage: 50+ projects
- Open-source contributions: 5+ external PRs

### 9.3. Research Program Coherence Metrics

- Citation cluster formation around Phase 1 + Phase 2 + Phase 3 (bibliometric analysis at 24 months)
- External replication attempts: 1+ independent group
- Invitation to join editorial board or reviewer pool: 1+ journal

### 9.4. Failure Modes to Monitor

**Technical failures**:
- Data access blocked (e.g., Twitter API lockdown, Dune enterprise pricing change)
- LLM fine-tuning produces AUC < 0.70 (tool is not useful)
- Wallet identification confidence is lower than expected

**Legal failures**:
- Cease-and-desist letter received (requires paper revision)
- Defamation suit filed (requires defense + possible withdrawal)

**Academic failures**:
- Competing paper published first with similar methodology
- Peer review identifies fundamental methodological flaw
- Hypothesis H4 (execution gap) reveals effect size too small to matter

**Mitigation**: Phase 3 is opt-in; if Phase 2 reveals problems or landscape shifts, Phase 3 can be delayed or modified.

---

## 10. Open Questions and Ongoing Reflections

### 10.1. Unresolved Methodological Questions

1. **Wallet identification confidence**: How to quantitatively account for uncertainty in foundation wallet labeling?
2. **Disclosure saturation**: Projects with very high disclosure frequency may confound clustering analysis; how to normalize?
3. **Reverse causality in FR**: Does market regime affect execution? (Bull market → easier to execute buybacks)
4. **KOL causality**: Are KOLs responsive to or coordinated with foundations? Hard to distinguish.
5. **LLM training labels**: Retrospective labels introduce look-ahead bias in model evaluation. How to design realistic out-of-sample tests?

### 10.2. Scope Decisions Yet to Make

- Japanese and Hong Kong markets in scope or separate paper?
- Include DEX-listed tokens or CEX only?
- Stablecoin-related disclosures in scope?
- Layer-2 and restaking tokens as special category?

### 10.3. Ethical Considerations

- Is publishing the LLM tool net-positive? Could it be used to short-attack projects?
- Should projects be given right-of-response for included data?
- How to handle projects that voluntarily disclose internal wallet structure after paper release?

### 10.4. Personal Considerations

- **Time commitment**: 300-500 hours over 12 months is significant alongside Betalabs CEO duties
- **Legal exposure**: Even with mitigation, this is materially higher legal risk than Phase 1
- **Reputation**: If methodology is challenged, could affect credibility of Phase 1 retroactively
- **Cost**: $30-40K investment of personal time and capital; expected ROI is reputational, not financial

---

## 11. Go/No-Go Decision Framework

Before executing Phase 3, the following conditions should be met (decision point: 2026 Q4, after Phase 2 completion):

**Phase 2 success criteria (must all be TRUE)**:
- [ ] Phase 1 paper has accumulated ≥ 500 SSRN downloads
- [ ] At least 1 citation of Phase 1 paper in peer-reviewed work
- [ ] Phase 2 paper has been completed and posted to SSRN
- [ ] Phase 2 365-day cliff replication shows consistent pattern (N=200 subset)

**Phase 3 feasibility checks (must all be TRUE)**:
- [ ] Legal review conducted with favorable outcome (no material risks identified)
- [ ] Data infrastructure for disclosure tracking is operational
- [ ] Budget of ≥ $20K is available or secured
- [ ] Competing papers in same exact space have NOT been published

**Phase 3 motivation checks (must all be TRUE)**:
- [ ] Author (Dennis) maintains enthusiasm and capacity for 12+ months of execution
- [ ] Betalabs operational demands permit 300-500 hours of research time
- [ ] Research program coherence benefit outweighs opportunity cost

**If all conditions are met**: Execute Phase 3 starting 2027 Q1.
**If some conditions are not met**: Adjust scope, delay, or skip to Phase 4.

---

## 12. Acknowledgments and Attribution

This research idea originated from the author's practitioner experience in the Asian cryptocurrency ecosystem. It builds on foundational work by:

- **Keyrock (2024)**: establishing the aggregate unlock underperformance pattern
- **Huang & Gao (2025)**: pioneering LLM analysis of crypto-related disclosures
- **Félez-Viñas, Johnson, Putniņš (2022)**: insider trading evidence around listings
- **Kim (2026, SSRN 6632838)**: 72-hour shock temporal concentration finding

Special recognition to the Web3Paper community, whose practitioner-researchers have raised concerns about disclosure-execution gaps informally for years without formal documentation.

---

## 13. Contact and Collaboration

**Author**: HoKwang Kim
**Affiliation**: Independent Researcher (Betalabs Inc. CEO, personal capacity)
**Email**: gameworker@gmail.com
**ORCID**: [0009-0002-0962-2175](https://orcid.org/0009-0002-0962-2175)
**GitHub**: [@gameworkerkim](https://github.com/gameworkerkim)

**Seeking collaborators**:
- Econometricians for panel regression specification
- Data engineers for on-chain flow pipeline construction
- NLP researchers for LLM fine-tuning and evaluation
- Legal scholars for information asymmetry framework

**Data partnerships sought**:
- Xangle Disclosure Portal (Korean market)
- Chainalysis (on-chain attribution)
- Nansen (wallet labeling)
- Major Asian exchanges for listing process documentation

---

## 14. Version History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-04-23 | 0.1 | HoKwang Kim | Initial ideation document |

---

## 15. Closing Reflection

This is a paper that needs to exist. The gap between announced programs and realized execution in cryptocurrency foundation operations is one of the structural features of the market that is simultaneously (a) widely known to insiders, (b) largely undocumented in academic literature, and (c) significantly consequential for retail investor outcomes.

It is also a paper that requires discipline to execute well. The temptation to name specific projects, make strong causal claims, or deploy the LLM tool for alpha generation must be resisted. The paper's value lies precisely in its academic restraint — documenting a structural pattern without individual accusation, showing a predictive tool without promising alpha, offering a framework regulators and investors can build upon.

If executed well, this paper and its companion tool could become the standard reference point for understanding information asymmetry in cryptocurrency foundation-investor relationships for the next decade. The author's unique positioning — eight years of Asian-market practitioner experience combined with academic rigor demonstrated in Phase 1 and Phase 2 — makes this paper possible in a way no purely-academic researcher could achieve.

But only if we first complete Phase 2, accumulate the citations, manage the legal exposure, and maintain the research program discipline that has served Phase 1 so well.

*"The best research programs are marathons, not sprints. Each paper earns the right to exist by being the natural next step from the previous one."*

— HoKwang Kim, April 23, 2026
