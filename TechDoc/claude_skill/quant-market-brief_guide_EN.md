---
title: "quant-market-brief Installation and Usage Guide"
description: "A Claude Skill that summarizes today's market action through a quant lens (factors, volatility, flows, regime) rather than a simple news digest."
abstract: |
  This guide covers installing and configuring the quant-market-brief Claude Skill, which turns a request like "summarize today's market" into a structured regime briefing: a one-line regime call, a market-indicator table, a 4-axis factor scorecard, a "what changed since yesterday" section, and falsification conditions. It includes the full SKILL.md workflow, the factor checklist reference, the fixed output template, usage examples, and customization points.
summary_for_ai: |
  Reference note for AI agents: this skill enforces web search for all figures (never answering from training-data memory), explicitly forbids making predictions (only conditional scenarios are allowed), and forbids issuing buy/sell directives. The regime-call line always follows a fixed format - `Regime: {Risk-On|Risk-Off|Rotation|Chop} (confidence: {High|Medium|Low}) — {one-line basis}` - specifically so that other skills (e.g., portfolio-daily-review) can parse and reuse the regime determination from the same conversation. Output is explicitly framed as decision material, not investment advice.
lang: en
featured: false
author: Dennis Kim
date: 2026-07-15
schema_type: TechArticle
---

# quant-market-brief Installation and Usage Guide

> A Claude Skill that summarizes today's stock market action through a quant
> lens (factors, volatility, flows, regime).
> See Chapter 5 of [Claude_skill_guide.md](./Claude_skill_guide.md) for the concept and design background.

---

## 1. What This Skill Does

A single phrase like "summarize today's market" produces a **structured regime briefing**, not a list of news headlines.

- **Trigger phrases**: "market update," "today's session," "market brief," "session summary," "how's the KOSPI/Nasdaq today," and similar
- **Output structure (fixed)**:
  1. A one-line regime call — `Regime: Risk-On|Risk-Off|Rotation|Chop (confidence: High|Medium|Low) — basis`
  2. A numeric table (index/volatility/rates/FX/flows, with source and timestamp noted)
  3. A factor scorecard (4 axes: momentum, growth/value, large/small, quality)
  4. "What changed since yesterday" — describes only the delta
  5. Falsification conditions — what would be observed tomorrow if today's call is wrong
- **Design principles**: web search is mandatory (never answer from memory), predictions are forbidden (conditional scenarios only), and trading directives are forbidden

Because the regime-call line always uses a fixed format, other skills like `portfolio-daily-review` can parse and reuse it.

---

## 2. Installation

Choose one of three methods.

### Method A: Claude.ai (web/app) - Recommended

1. Zip the entire skill folder from this repository, or prepare the distributed `.skill` file.
   ```bash
   # If building directly from the folder (zip = same format as .skill)
   zip -r quant-market-brief.skill quant-market-brief/
   ```
2. Upload it via Claude.ai -> **Settings -> Capabilities -> Skills**. (Paid plan required)
3. After uploading, simply say a trigger phrase in a new conversation to activate it automatically.

### Method B: Claude Code

Copy the entire folder into your personal skills directory:

```bash
cp -r quant-market-brief/ ~/.claude/skills/quant-market-brief/
```

After restarting Claude Code, just mention it in natural language.

### Method C: Claude API

Refer to the [Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill) and upload the `.skill` package - it will work the same way through API calls.

> **Verification tip**: after installing, ask "what skills are currently available?" to confirm it loaded.

---

## 3. Folder Structure

```
quant-market-brief/
├── SKILL.md                      # The workflow itself (4 steps)
└── references/
    ├── factor-checklist.md       # Criteria for the 4 factor axes + VIX regime table
    └── output-template.md        # Fixed output template
```

---

## 4. Full File Contents

Copy the content below as-is into the same folder structure to complete the skill.

### 4.1 SKILL.md

```markdown
---
name: quant-market-brief
description: >
  A skill that summarizes today's stock market action from a quant
  perspective. This skill MUST be used whenever the user mentions "market
  update," "today's session," "market brief," "session summary," "how's the
  KOSPI today," "how was the Nasdaq," "recap the market," or similar - even
  if the word "quant" is not explicitly used. It produces a regime-call
  briefing structured around factors, volatility, and flows, rather than a
  simple list of news. Also use for daily morning/evening market check
  requests.
---

# Quant Market Brief

## Purpose

Read market structure (regime) rather than individual news items. Answer not
"what happened," but "what regime is the market in from a factor / volatility
/ flow perspective, and what changed since yesterday."

Principle: **observed facts -> factor interpretation -> conditional
scenarios.** Never predict.

## Workflow

### Step 1: Data Collection (Web Search Required)

The following must be verified via web search. Never answer from
training-data memory. Note the source and timestamp for every figure.

- **Major indices**: KOSPI, KOSDAQ, S&P 500, NASDAQ, Philadelphia
  Semiconductor Index (SOX) — close/change
- **Volatility**: VIX level and change vs. the prior day, VKOSPI
- **Rates/FX**: US 10-year Treasury yield, USD/KRW, the Dollar Index (DXY)
- **Flows**: KRX foreign/institutional net buying, major sector ETF fund
  flows
- **Crypto (optional)**: BTC price, the "kimchi premium" — use only as a
  risk-appetite proxy, never as a direct directional signal

If the user specifies a particular market (Korea only, US only), focus on
that market, but always include global risk indicators (VIX, rates, dollar).

### Step 2: Apply the Factor Lens

Read `references/factor-checklist.md` and evaluate the following 4 axes:

1. **Momentum vs. Reversal**: are recent leading stocks continuing to lead,
   or turning over?
2. **Growth vs. Value**: consistency between the direction of rates and the
   style rotation
3. **Large vs. Small**: is risk appetite spreading down into small caps?
4. **Quality/Low-vol**: is capital moving toward defensive factors?

Rate each axis as bullish/neutral/bearish plus a one-line basis.

### Step 3: Regime Determination

Explicitly classify into one of the four below and attach a one-line basis:

- **Risk-On**: broad-based rally in risk assets, falling volatility,
  small-cap/crypto strength as well
- **Risk-Off**: preference for defensive assets, a volatility spike, safe-
  haven currency strength
- **Rotation**: the index is flat but there's clear capital movement between
  sectors/styles
- **Chop**: no clear direction, low trading value, conflicting factor
  signals

Mark the confidence of the call as High/Medium/Low. If the data conflicts,
write "conflicting" as-is - don't force a single narrative.

### Step 4: Output

Follow the template in `references/output-template.md`. Required elements:

1. **A one-line regime call** (at the top, including confidence)
2. **A numeric table** (index/volatility/rates/FX/flows)
3. **A factor scorecard** (4 axes, each with a call plus a one-line basis)
4. **"What changed since yesterday"** — focus on the delta. Don't repeat the
   same content as yesterday.
5. **Falsification conditions** — what would be observed tomorrow if today's
   call is wrong

## Guidelines

- Never predict. Describe only in conditional scenarios ("if X holds, regime
  Y continues").
- Note the source and timestamp for every figure.
- Never use investment-solicitation language ("buy/sell/increase your
  weighting"). Provide decision material only.
- Cite news headlines only when needed for factor interpretation. Listing
  headlines is forbidden.
- If requested before market close, explicitly state "intraday data, subject
  to change after close."
- Since other skills (e.g., portfolio-daily-review) may reuse this
  briefing's regime call, always keep the regime-call line in the exact same
  format:
  `Regime: {Risk-On|Risk-Off|Rotation|Chop} (confidence: {High|Medium|Low}) — {one-line basis}`
```

### 4.2 references/factor-checklist.md

```markdown
# Factor Check Checklist

Rate each factor as **bullish / neutral / bearish** and leave a one-line
basis. If signals conflict, mark it as "conflicting" and note which
indicators are clashing.

## 1. Momentum vs. Reversal

- **Indicators to check**: the same-day relative return of last month's top-
  performing sectors, trading value of leading stocks
- **Momentum-bullish**: leading sector's relative return > the market, AND
  trading value holds up or increases
- **Momentum-breakdown signal**: a sharp drop in leading stocks + a volume
  spike (a distributive-selling pattern)
- **Reversal signal**: a broad-based rebound in the recently oversold group +
  a decline in short-interest balances

## 2. Growth vs. Value

- **Indicators to check**: the direction of the US 10-year yield, growth
  index (NASDAQ) vs. value relative performance
- **Consistency check**: if an "inconsistent" combination such as rising
  rates + growth strength appears, always flag it separately - inconsistency
  can be an early signal of a regime shift
- **Caution**: don't conclude a style rotation from a single day of data.
  Mention the cumulative direction over 3-5 trading days as well

## 3. Large vs. Small

- **Indicators to check**: KOSPI vs. KOSDAQ relative performance, Russell
  2000 vs. S&P 500
- **Risk-appetite broadening**: the small-cap index outperforms large caps +
  trading value increases
- **Risk-appetite narrowing**: intensified large-cap concentration (the
  index gain is concentrated in a small number of stocks) — flag
  deteriorating breadth as a bearish signal separately, even in an up market

## 4. Quality/Low-vol (Defensive Factors)

- **Indicators to check**: relative performance of consumer staples/
  utilities/healthcare, fund inflows into dividend-stock ETFs
- **Defensive-shift signal**: if the index is flat-to-up but defensive
  sectors outperform, flag the possibility of preemptive defensive
  positioning by smart money

## Volatility Regime (the Backdrop for All Factor Calls)

| VIX level | Regime | Implication |
|---|---|---|
| < 15 | Low volatility | Favorable for carry/momentum strategies, but vulnerable to sharp reversals |
| 15–25 | Neutral | Interpret factor signals at face value |
| > 25 | High volatility | Low-vol/quality favored, a range to consider reducing positions |

**Caution**: the VIX's **rate of change** is a more valid near-term signal
than its **level**. A jump of +20% or more vs. the prior day should be
flagged as a separate warning regardless of level.

## Principles for Interpreting Flows

- Read foreign net buying together with the direction of USD/KRW
  (distinguish FX-hedged flows)
- Distinguish program vs. non-program trading in institutional net buying
  where possible
- Don't call a trend from a single day of flows. Note it alongside the
  5-trading-day cumulative figure
```

### 4.3 references/output-template.md

```markdown
# Briefing Output Template

Follow the structure and order below exactly. Do not omit sections or
reorder them.

---

## Quant Market Brief — {YYYY-MM-DD}

**Regime: {Risk-On|Risk-Off|Rotation|Chop} (confidence: {High|Medium|Low}) — {one-line basis}**

### Market Indicators

| Category | Indicator | Close/Level | Change | Notes |
|---|---|---|---|---|
| Index | KOSPI | | | |
| Index | KOSDAQ | | | |
| Index | S&P 500 | | | |
| Index | NASDAQ | | | |
| Index | SOX | | | |
| Volatility | VIX | | % vs. prior day | Flag if change ±20% |
| Rates | US 10Y | | bp | |
| FX | USD/KRW | | | |
| FX | DXY | | | |
| Flows | Foreign (KRX) | Net buy, KRW 100M units | | Note 5-day cumulative alongside |
| Flows | Institutions (KRX) | Net buy, KRW 100M units | | Note 5-day cumulative alongside |

*As of: {time}, Source: {source}*

### Factor Scorecard

| Factor axis | Call | Basis (one line) |
|---|---|---|
| Momentum vs. Reversal | Bullish/Neutral/Bearish/Conflicting | |
| Growth vs. Value | | |
| Large vs. Small | | |
| Quality/Low-vol | | |

### What Changed Since Yesterday

- (Describe only the delta. Do not repeat a state that's unchanged from
  yesterday. Maximum 3 items.)

### Falsification Conditions

- What would be observed tomorrow if today's regime call is wrong: {specific
  indicators and thresholds}

---

*This briefing is decision material, not investment advice. Data is as of the time it was retrieved.*
```

---

## 5. Usage Example

```
> How was the market today?

[quant-market-brief activates]
1. Web search: KOSPI/NASDAQ/VIX/10Y/FX/KRX flows
2. Evaluate the 4 axes using factor-checklist.md
3. Regime classification + confidence
4. Output the briefing in the output-template.md format
```

If you want only a specific market: "give me a summary of just the US market" - global risk indicators (VIX, rates, dollar) are always included regardless.

---

## 6. Customization Points

| Item | Location | Method |
|---|---|---|
| Add/remove tracked indices | SKILL.md Step 1 | Edit the index list (e.g., add Nikkei, Hang Seng) |
| VIX regime thresholds | factor-checklist.md | Adjust the 15/25 boundaries |
| Add a factor axis | factor-checklist.md + SKILL.md Step 2 | E.g., add a dividend or size factor |
| Output language/format | output-template.md | Edit the template directly |

---

## 7. Precautions

- This skill's output is **decision material, not investment advice.**
- Data is as of the time it was retrieved via web search, and may change
  after close if checked intraday.
- This skill is for demo/educational purposes; test it thoroughly in your
  own environment before actual use.
