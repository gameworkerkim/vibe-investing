---
title: "quant-market-brief Installation and Usage Guide"
description: "A Claude Skill that summarizes today's stock market from a quant perspective (factors, volatility, flows, regime). Full installation guide, file contents, and customization points."
keywords:
  - "Claude Skill"
  - "quant market brief"
  - "market regime"
  - "factor checklist"
  - "Claude Code skill"
  - "VIX regime"
  - "market briefing automation"
lang: en
featured: false
schema_type: TechArticle
---

# quant-market-brief Installation and Usage Guide

> A Claude Skill that summarizes today's stock market from a quant perspective (factors, volatility, flows, regime)
> For the concept and design rationale, see Section 5 of [Claude_skill_guide.md](./Claude_skill_guide.md)

---

## 1. What This Skill Does

A single phrase, "summarize today's market," produces a **structured regime briefing** — not a list of news headlines.

- **Trigger phrases**: "market conditions," "today's market," "market briefing," "market summary," "how's the KOSPI/NASDAQ today," etc.
- **Output structure** (fixed):
  1. One-line regime call — `Regime: Risk-On|Risk-Off|Rotation|Chop (Confidence: High|Medium|Low) — rationale`
  2. Numeric table (index/volatility/rates/FX/flows, with source and as-of time noted)
  3. Factor scorecard (4 axes: momentum, growth/value, large/small cap, quality)
  4. "What changed since yesterday" — describe only the delta
  5. Falsification conditions — what would be observed tomorrow if today's call is wrong
- **Design principles**: mandatory web search (never answer from memory), no forecasting (conditional scenarios only), no trading directives

The regime call line uses a fixed format so other skills (e.g., `portfolio-daily-review`) can parse and reuse it.

---

## 2. Installation

Choose one of three methods.

### Method A: Claude.ai (Web/App) — Recommended

1. Zip the entire skill folder from this repo, or prepare the distributed `.skill` file.
   ```bash
   # If creating directly from the folder (a zip = the same format as .skill)
   zip -r quant-market-brief.skill quant-market-brief/
   ```
2. Upload it under Claude.ai → **Settings → Capabilities → Skills**. (Paid plan required)
3. After uploading, simply say a trigger phrase in a new conversation and it activates automatically.

### Method B: Claude Code

Copy the whole folder into your personal skills directory:

```bash
cp -r quant-market-brief/ ~/.claude/skills/quant-market-brief/
```

After restarting Claude Code, just mention it in natural language.

### Method C: Claude API

Follow the [Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill)
to upload the `.skill` package, and it will work the same way via API calls.

> **Verification tip**: after installing, ask "what skills are currently available?" to confirm it loaded.


---

## 3. Folder Structure

```
quant-market-brief/
├── SKILL.md                      # The workflow body (4 steps)
└── references/
    ├── factor-checklist.md       # Judgment criteria for the 4 factor axes + VIX regime table
    └── output-template.md        # The fixed output template
```

---

## 4. Full File Contents

Copy the content below as-is into the same folder structure to complete the skill.

### 4.1 SKILL.md

```markdown
---
name: quant-market-brief
description: >
  A skill that summarizes today's stock market from a quant perspective. Always
  use this skill when the user mentions "market conditions," "today's market,"
  "market briefing," "market summary," "how's the KOSPI today," "how was the
  NASDAQ," "sum up the market," or similar — even without the word "quant"
  explicitly present. Rather than a plain list of news, it generates a regime
  determination briefing structured around factors, volatility, and flows. Also
  use for daily morning/evening market-check requests.
---

# Quant Market Brief

## Purpose

Read the market's structure (regime), not individual news items. Answer not
"what happened" but "what regime is the market in from a factor/volatility/flow
perspective, and what changed from yesterday."

Principle: **observed facts → factor interpretation → conditional scenarios.**
No forecasting.

## Workflow

### Step 1: Data Collection (Web Search Required)

The following must be confirmed via web search. Do not answer with a memory
from training data. Note the source and as-of time for every figure.

- **Major indices**: KOSPI, KOSDAQ, S&P 500, NASDAQ, Philadelphia Semiconductor
  Index (SOX) — close/change
- **Volatility**: VIX level and its change vs. the prior day, VKOSPI
- **Rates/FX**: US 10-year Treasury yield, USD/KRW, the Dollar Index (DXY)
- **Flows**: KRX foreign/institutional net buying, major sector ETF fund flows
- **Crypto (optional)**: BTC price, the Kimchi premium — use only as a
  risk-appetite proxy, not directly as a directional signal

If the user specifies a particular market (Korea only, US only), focus on that
market, but always include global risk indicators (VIX, rates, dollar).

### Step 2: Apply the Factor Lens

Read `references/factor-checklist.md` and determine these 4 axes:

1. **Momentum vs. reversal**: are recent leaders continuing, or turning?
2. **Growth vs. value**: alignment between rate direction and style rotation
3. **Large-cap vs. small-cap**: is risk appetite spreading down to small caps?
4. **Quality/low-vol**: is money moving into defensive factors?

Judge each axis as strong/neutral/weak with a one-line rationale.

### Step 3: Regime Determination

Explicitly classify into one of the four below, with a one-line rationale:

- **Risk-On**: broad risk-asset rally, falling volatility, small caps/crypto rallying together
- **Risk-Off**: preference for defensive assets, volatility spiking, safe-haven currencies strengthening
- **Rotation**: indices stagnant but clear capital movement between sectors/styles
- **Chop**: no clear direction, low trading volume, conflicting factor signals

Mark confidence as High/Medium/Low. If the data is mixed, just write "mixed."
Do not force a single narrative.

### Step 4: Output

Follow the template in `references/output-template.md`. Required elements:

1. **One-line regime call** (at the top, including confidence)
2. **Numeric table** (index/volatility/rates/FX/flows)
3. **Factor scorecard** (4 axes, each with a call + one-line rationale)
4. **"What changed since yesterday"** — focus on the delta. Do not repeat what's unchanged from yesterday
5. **Falsification conditions** — what would be observed tomorrow if today's call is wrong

## Guidelines

- Do not forecast. Describe only in conditional scenarios ("if X holds, Y regime persists").
- Note the source and as-of time for every figure.
- Do not use investment-recommendation language ("buy/sell/increase your weight"). Provide only decision-support material.
- Cite news headlines only where needed for factor interpretation. Do not simply list headlines.
- If the request comes before market close, state that "this is intraday data and may change after close."
- Because other skills (e.g., `portfolio-daily-review`) may reuse this briefing's regime call, always keep the regime line in the exact same format:
  `Regime: {Risk-On|Risk-Off|Rotation|Chop} (Confidence: {High|Medium|Low}) — {one-line rationale}`
```

### 4.2 references/factor-checklist.md

```markdown
# Factor Checklist

Judge each factor as **strong / neutral / weak** and leave a one-line rationale.
If signals conflict, mark "mixed" and note which indicators are in conflict.

## 1. Momentum vs. Reversal

- **Indicators to check**: same-day relative return of the past month's
  top-performing sector, trading volume of leading stocks
- **Momentum strong**: leading sector's relative return > market && trading
  volume sustained or higher
- **Momentum-breakdown signal**: sharp drop in leaders + volume spike
  (distribution/selling pattern)
- **Reversal signal**: broad rebound in recently oversold names + declining short interest

## 2. Growth vs. Value

- **Indicators to check**: direction of the US 10-year yield, growth index
  (NASDAQ) vs. value relative performance
- **Consistency check**: if an "inconsistent" combination appears — e.g., rates
  rising while growth stocks stay strong — flag it separately; inconsistency
  can be an early signal of a regime shift
- **Caution**: do not conclude a style rotation from a single day's data.
  Mention the cumulative direction over the last 3-5 trading days as well

## 3. Large-Cap vs. Small-Cap

- **Indicators to check**: KOSPI vs. KOSDAQ relative performance, Russell 2000 vs. S&P 500
- **Risk appetite spreading**: small-cap index outperforms large caps + trading volume rising
- **Risk appetite narrowing**: increased concentration in large caps (index gains
  concentrated in a handful of names) — flag deteriorating breadth as a bearish
  signal even in a rising market

## 4. Quality / Low-Vol (Defensive Factors)

- **Indicators to check**: relative performance of consumer staples/utilities/healthcare, dividend ETF fund inflows
- **Defensive-rotation signal**: if defensive sectors outperform while the index is flat-to-up, flag possible pre-emptive defensive positioning by smart money

## Volatility Regime (Background for All Factor Judgments)

| VIX level | Regime | Implication |
|---|---|---|
| < 15 | Low volatility | Favorable for carry/momentum strategies, but vulnerable to sharp reversals |
| 15-25 | Neutral | Interpret factor signals at face value |
| > 25 | High volatility | Low-vol/quality favored, consider reducing positions |

**Caution**: the VIX's *rate of change* is a more valid short-term signal than
its *level*. A jump of +20% or more versus the prior day should be flagged
separately as a warning regardless of the level.

## Flow Interpretation Principles

- Read foreign net buying alongside the USD/KRW direction (distinguish FX-hedged flows)
- Distinguish program vs. non-program institutional net buying where possible
- Do not call a trend from a single day's flow. Note it alongside the 5-day cumulative figure
```

### 4.3 references/output-template.md

```markdown
# Briefing Output Template

Follow this structure and order exactly. Do not omit sections or reorder them.

---

## Quant Market Briefing — {YYYY-MM-DD}

**Regime: {Risk-On|Risk-Off|Rotation|Chop} (Confidence: {High|Medium|Low}) — {one-line rationale}**

### Market Indicators

| Category | Indicator | Close/Level | Change | Notes |
|---|---|---|---|---|
| Index | KOSPI | | | |
| Index | KOSDAQ | | | |
| Index | S&P 500 | | | |
| Index | NASDAQ | | | |
| Index | SOX | | | |
| Volatility | VIX | | % vs. prior day | flag with a caution mark if change is ±20% |
| Rates | US 10Y | | bp | |
| FX | USD/KRW | | | |
| FX | DXY | | | |
| Flows | Foreign (KRX) | net buy, ₩bn | | note 5-day cumulative |
| Flows | Institutional (KRX) | net buy, ₩bn | | note 5-day cumulative |

*As of: {time}, Source: {source}*

### Factor Scorecard

| Factor axis | Call | Rationale (1 line) |
|---|---|---|
| Momentum vs. reversal | strong/neutral/weak/mixed | |
| Growth vs. value | | |
| Large-cap vs. small-cap | | |
| Quality/low-vol | | |

### What Changed Since Yesterday

- (Describe only the delta. Do not repeat what's unchanged from yesterday. Max 3 items)

### Falsification Conditions

- What would be observed tomorrow if today's regime call is wrong: {specific indicator and threshold}

---

*This briefing is decision-support material, not investment advice. Data is as of the lookup time.*
```

---

## 5. Usage Example

```
> How was the market today?

[quant-market-brief triggered]
1. Web search: KOSPI/NASDAQ/VIX/10Y/FX/KRX flows
2. Determine the 4 axes via factor-checklist.md
3. Classify the regime + confidence
4. Output the briefing in the format from output-template.md
```

If you want just one market: "Just summarize the US market today" — global risk indicators (VIX, rates, dollar) are always included regardless.

---

## 6. Customization Points

| Item | Location | Method |
|---|---|---|
| Add/remove tracked indices | SKILL.md Step 1 | Edit the index list (e.g., add Nikkei, Hang Seng) |
| VIX regime thresholds | factor-checklist.md | Adjust the 15/25 boundary values |
| Add a factor axis | factor-checklist.md + SKILL.md Step 2 | e.g., add dividend or size factors |
| Output language/format | output-template.md | Edit the template directly |

---

## 7. Cautions

- The output of this skill is **decision-support material and not investment advice.**
- Data is as of the web-search time and may change intraday after market close.
- This skill is for demo/educational purposes; test it thoroughly in your own environment before real use.
