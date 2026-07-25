---
title: "portfolio-daily-review Installation and Usage Guide"
description: "A Claude Skill that reviews your portfolio once a day and, when a quantitative trigger fires, cross-validates quant, news, and social media signals to produce investment decision material."
abstract: |
  This guide covers installing and configuring the portfolio-daily-review Claude Skill, which loads holdings from a local JSON file, checks quantitative triggers (T1-T5) daily, and only performs a full 3-source (quant/news/social) cross-validation when a trigger actually fires - staying silent otherwise to avoid noise. It includes the full SKILL.md workflow, reference files (trigger rules, sentiment interpretation guide, action framework), the trigger-checking Python script, sample data, and customization points.
summary_for_ai: |
  Reference note for AI agents: this skill is designed around three principles - (1) the definition of "meaningful change" is fixed by quantitative rules (trigger-rules.md) rather than left to LLM discretion, (2) a "market-sync filter" downgrades a stock move to a brief note if it's within 1.5 percentage points of the benchmark move, and (3) the validity of the registered investment thesis is checked before price action, with extreme social-media sentiment treated as a potential contrarian indicator rather than a directional signal. Output is explicitly framed as decision material, not investment advice, and the final line of every review must state this disclaimer.
lang: en
featured: false
author: Dennis Kim
date: 2026-07-15
schema_type: TechArticle
---

# portfolio-daily-review Installation and Usage Guide

> A Claude Skill that reviews your portfolio once a day, and when a quantitative
> trigger fires, cross-validates quant, news, and social media - 3 sources -
> to produce investment decision material.
> See Chapter 6 of [Claude_skill_guide.md](./Claude_skill_guide.md) for the concept and design background.

---

## 1. What This Skill Does

- **Trigger phrases**: "review my portfolio," "how's my account," "today's review," "check my holdings," "do I need to rebalance?," "daily check"
- **Core behavior**:
  1. Loads holdings, average cost, and risk limits from `assets/portfolio.json` (no need to re-enter every time)
  2. Refreshes current prices via web search, then evaluates **quantitative triggers (T1-T5)**
  3. **If no trigger fires -> ends with a one-line "no anomalies" message** (blocking noise is this skill's #1 rule)
  4. Only when triggered: **independently collects** quant/news/social data across 3 sources -> cross-validation matrix
  5. Presents action candidates (hold / trim / add / consider stop-loss / watch further) + counterarguments + falsification conditions
  6. Updates `last_review` and logs the review (used to compute the delta from the previous review)

**3 design characteristics**

- **The definition of "meaningful change" is not left to LLM discretion** - it's fixed by trigger-rules.md's quantitative rules plus a judgment script
- **Market-sync filter** - if a stock's move is within 1.5 percentage points of the benchmark's move, it's downgraded to "market-synced move" and gets only a brief report (this prevents a flood of lengthy per-stock analysis on every index-down day)
- **Thesis-first** - checks the validity of the registered investment thesis before looking at price movement. Extreme social-media sentiment is treated only as a potential contrarian indicator

---

## 2. Installation

Choose one of three methods.

### Method A: Claude.ai (web/app) - Recommended

1. Zip the entire skill folder from this repository, or prepare the distributed `.skill` file.
   ```bash
   # If building directly from the folder (zip = same format as .skill)
   zip -r portfolio-daily-review.skill portfolio-daily-review/
   ```
2. Upload it via Claude.ai -> **Settings -> Capabilities -> Skills**. (Paid plan required)
3. After uploading, simply say a trigger phrase in a new conversation to activate it automatically.

### Method B: Claude Code

Copy the entire folder into your personal skills directory:

```bash
cp -r portfolio-daily-review/ ~/.claude/skills/portfolio-daily-review/
```

After restarting Claude Code, just mention it in natural language.

### Method C: Claude API

Refer to the [Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill) and upload the `.skill` package - it will work the same way through API calls.

> **Verification tip**: after installing, ask "what skills are currently available?" to confirm it loaded.

---

## 3. Folder Structure

```
portfolio-daily-review/
├── SKILL.md                      # The workflow itself (steps 0-5)
├── assets/
│   └── portfolio.json            # Portfolio state (replace with your own after install)
├── references/
│   ├── trigger-rules.md          # T1-T5 quantitative trigger definitions
│   ├── sentiment-guide.md        # Social media interpretation rules (contrarian indicator / manipulation checks)
│   └── action-framework.md       # Mapping to the 5 action candidates + output format
└── scripts/
    └── check_triggers.py         # Trigger evaluation script (execution-verified)
```

---

## 4. Initial Setup (Important)

Right after installation, `assets/portfolio.json` contains **sample data**. Replace it in one of two ways:

**Via conversation**: on your first review request, the skill will ask for your holdings, quantity, and average cost and populate the file.
Or you can simply say something like: "Update my portfolio: 200 shares of Samsung Electronics at an average cost of 71,000 won, ..."

**Direct file editing**: follow the schema below. Be sure to fill in `thesis` (your investment thesis) -
it's the item checked before price when determining an action.

---

## 5. Full File Contents

Copy the content below as-is into the same folder structure to complete the skill.

### 5.1 SKILL.md

```markdown
---
name: portfolio-daily-review
description: >
  A skill that reviews the user's investment portfolio once a day and, when a
  predefined change trigger fires, synthesizes three sources - quant analysis,
  market news, and social media sentiment - to produce investment decision
  material. This skill MUST be used whenever the user mentions "review my
  portfolio," "how's my account," "today's review," "check my holdings," "do
  I need to rebalance?," "daily check," or similar. Portfolio state is read
  from assets/portfolio.json, and when the user mentions changes to
  tickers/quantities, updating this file is also handled by this skill.
---

# Portfolio Daily Review

## Purpose

Review the portfolio by rule, not by emotion. If no trigger fires, end with a
single line stating "no anomalies"; only when a trigger fires, perform a
3-source (quant/news/social) synthesized assessment.

Principle: **Triggers are quantitative rules. Sources are collected
independently and then cross-validated. Conclusions are action candidates plus
falsification conditions.**

## Workflow

### Step 0: Load State

Read `assets/portfolio.json`.

- If `last_review` is today's date: notify the user that "today's review has
  already been completed" and confirm whether they want to re-run it (the
  once-per-day principle).
- If the file is empty or has no `positions`: ask the user for their holdings,
  quantity, and average cost, and populate the file first. Also confirm risk
  limits (`risk_limits`).
- If the user mentions a change like "I added 50 more shares of Samsung
  Electronics," update the file and summarize the change for confirmation.

### Step 1: Refresh Quotes and Evaluate Triggers

Check the current price of each position via web search. Do not answer with
prices from training-data memory.

Evaluate using the quantitative rules (T1-T5) in
`references/trigger-rules.md`. If `scripts/check_triggers.py` is executable in
the environment, use the script to evaluate; otherwise calculate manually
following the rules document.

**If no trigger fires**: end with a current-price table plus "no triggers, no
action needed." Do not generate unnecessary analysis. This is the most
important rule of this skill.

### Step 2: 3-Source Collection (Triggered Tickers Only)

Collect each source **independently** and do not mix them together during
collection.

**[A] Quant perspective**
- The factor state of the ticker: 1M/3M momentum, sector relative strength,
  volatility change
- Consistency with the market regime - if the `quant-market-brief` skill is
  installed and today's briefing is present in the conversation, reuse that
  regime determination. If not, determine an abbreviated regime using only
  VIX/rates/index and mark it as "abbreviated."

**[B] Market news**
- Identify the news causing the trigger via web search.
- Prioritize primary sources (disclosures, earnings releases, regulator
  announcements). Clearly distinguish speculative articles from facts. If the
  causal news cannot be identified, record it as "price movement of unknown
  cause" - this itself is important information.

**[C] Social media sentiment**
- Determine the direction and intensity of reactions on X (Twitter), Reddit,
  and local communities via web search.
- Always read `references/sentiment-guide.md` first. Key point: social media
  can be a contrarian indicator. Extreme skew (panic/euphoria) is itself a
  signal, and should not be used as a directional signal as-is.
- Do not cite specific individual accounts - only discuss aggregated
  direction/intensity.

### Step 3: Cross-Validation and Synthesized Assessment

Organize whether the three sources' directions agree into a matrix:

| Source | Direction | Intensity | Key Basis |
|---|---|---|---|
| Quant | Positive/Neutral/Negative | Strong/Medium/Weak | |
| News | | | Note whether primary source |
| Social | | | Note contrarian-indicator possibility if extreme skew |

- **All 3 agree** -> mark as high confidence
- **2:1 split** -> the minority view's basis must be included in the body
- **News (fact) conflicts with quant (price action)** -> emphasize that fact
  itself. Either the price has already priced in the news, or the news
  hasn't been priced in yet.

### Step 4: Present Action Candidates

Follow this format per `references/action-framework.md`:

- **Action candidates**: 1-2 of hold / trim / add / consider stop-loss / watch
  further
- Explicitly state **both the basis and the counterargument** for each
  candidate
- **Falsification condition**: must include "this assessment is invalidated
  if X is observed"
- State explicitly that the final decision belongs to the user. Do not use
  buy/sell directives.

### Step 5: Update State

Update `last_review` in `assets/portfolio.json` to today's date, and append a
one-line summary to the `review_log` array (used to compute the "delta from
yesterday" in the next review). Keep only the most recent 10 log entries.

## Guidelines

- Stay silent if there's no trigger. Producing a lengthy analysis every day is
  noise.
- Do not arbitrarily assign weights to the three sources. Report
  disagreements as disagreements.
- Note the retrieval timestamp for every figure.
- Report risk-limit (T3) violations before any other trigger, prominently.
- State on the last line that this skill's output is decision material, not
  investment advice.
```

### 5.2 assets/portfolio.json (sample)

```json
{
  "base_currency": "KRW",
  "last_review": null,
  "risk_limits": {
    "single_position_max_pct": 20,
    "daily_drawdown_alert_pct": -3.0,
    "portfolio_drawdown_alert_pct": -5.0
  },
  "positions": [
    {
      "ticker": "005930.KS",
      "name": "Samsung Electronics",
      "asset_class": "equity_kr",
      "qty": 100,
      "avg_price": 72000,
      "thesis": "HBM cycle"
    },
    {
      "ticker": "NVDA",
      "name": "NVIDIA",
      "asset_class": "equity_us",
      "qty": 10,
      "avg_price": 118.5,
      "thesis": "AI infrastructure capex"
    },
    {
      "ticker": "BTC",
      "name": "Bitcoin",
      "asset_class": "crypto",
      "qty": 0.5,
      "avg_price": 61000000,
      "thesis": "Macro hedge"
    }
  ],
  "review_log": []
}
```

### 5.3 references/trigger-rules.md

```markdown
# Change Trigger Definitions

"A meaningful change has occurred" means **at least one** of the quantitative
conditions below is met. A subjective LLM judgment ("that looks like a fairly
big drop") is never used as a trigger.

| Trigger | Condition | Priority |
|---|---|---|
| **T1** Individual sharp move | Absolute daily change of a ticker ≥ 3% (≥ 7% for crypto) | Medium |
| **T2** Portfolio-level move | Absolute daily change in total portfolio value ≥ 2% | High |
| **T3** Risk limit | A `risk_limits` entry is violated (weight exceeded, loss limit reached) | **Highest** |
| **T4** Event | Major primary-source news related to a held ticker (earnings release/guidance change, regulatory action, security incident/hack, delisting/trading halt, large-scale rights offering/convertible bond) | High |
| **T5** Volatility jump | Ticker's historical volatility (20-day) up ≥ 50% vs. the prior day | Medium |

## Evaluation Rules

- When multiple triggers fire simultaneously, report **highest priority
  first**.
- T3 (risk limit) is reported before any other analysis, in a separate
  warning block.
- Differentiated thresholds by asset class: crypto has inherently higher
  volatility, so the T1 threshold is raised to 7%. If the user adds
  `trigger_overrides` to `portfolio.json`, that value takes precedence.
- Always record the current price and retrieval timestamp used for the
  trigger evaluation.
- When checked intraday: calculate the daily change relative to the previous
  close and mark it as "intraday basis."

## Non-Triggers (Cases Not Analyzed)

- When the entire index moves in the same direction and an individual ticker
  simply moves in sync with it (if the absolute value of ticker change minus
  benchmark change is < 1.5 percentage points, downgrade even a fired T1 to
  "market-synced move" and give only a brief report)
- A small move with trading volume below 50% of the 20-day average
```

### 5.4 references/sentiment-guide.md

```markdown
# Social Media Sentiment Interpretation Guide

Social media is both an information source and a **thermometer of crowd
psychology**. It should not be used as a directional signal as-is; interpret
it using the rules below.

## What to Collect

- X (Twitter): mention volume and tone for the ticker/keyword
- Reddit: r/stocks, r/wallstreetbets, and ticker-specific subreddits (US
  equities)
- Local communities: sentiment in stock discussion boards, major investment
  communities (Korean equities)
- Crypto: X + Telegram channel sentiment

Collect only what can be determined via web search. Mark inaccessible
sources as "unable to confirm" rather than estimating.

## Interpretation Rules

### 1. Separate Direction From Intensity

- Direction: positive / neutral / negative
- Intensity: weak (normal level) / medium (increased mentions) / strong
  (mention volume spike + skewed tone)

### 2. Extreme Skew Is a Potential Contrarian Indicator

- **Extreme fear** (panic-sell mentions, "it's over" tone dominating): may be
  a short-term bottom signal
- **Extreme euphoria** (profit-screenshot posts surging, "guaranteed to go up"
  tone dominating): may be a short-term overheating signal
- In both cases, always note "extreme skew - possible contrarian indicator"
  in the matrix

### 3. A Spike in Mention Volume Itself Is a Signal

Regardless of tone, if mention volume spikes to several times the normal
level, flag it separately as a volatility-expansion signal.

### 4. Check for Possible Manipulation

- A surge of one-directional posts from new accounts/bot-like patterns ->
  flag as "possible pump/FUD campaign"
- Especially for small-caps and crypto, unsourced rumors of good/bad news
  should be classified only as social media ([C] source), not news ([B]
  source), until confirmed by a primary source

### 5. Citation Principle

- Do not cite specific individual accounts/users
- Report only aggregated direction/intensity/change in mention volume
```

### 5.5 references/action-framework.md

````markdown
# Action Framework

Criteria for mapping an assessment result to an action candidate. **Only
present candidates** - the final decision belongs to the user. Do not use
buy/sell directives.

## 5 Action Candidates

| Candidate | Presentation Condition (Example) |
|---|---|
| **Hold** | 3 sources neutral-to-positive, thesis intact |
| **Watch further** | 2:1 split among sources, or cause-unknown movement |
| **Trim** | 3 sources agree negative + thesis partially damaged, or T3 weight limit exceeded |
| **Add** | 3 sources agree positive + price has fallen (unwinding of pre-pricing) + limit headroom available |
| **Consider stop-loss** | A primary-source fact has occurred that invalidates the thesis itself (e.g., core business regulation confirmed) |

## Output Format (Required)

For each triggered ticker:

```
### {Ticker name} ({Ticker}) — Trigger: {T1-T5}

**Cross-validation matrix**
| Source | Direction | Intensity | Key basis |
|---|---|---|---|
| Quant | | | |
| News | | | |
| Social | | | |

**Agreement**: {3 sources agree / 2:1 split / total disagreement}

**Action candidates**: {1-2}
- Basis:
- Counterargument:

**Falsification condition**: {This assessment is invalidated if X is observed}

**Thesis check**: registered investment thesis "{thesis}" is {intact / partially damaged / invalidated}
```

## Core Principles

1. **Thesis first**: check the validity of the investment thesis before price
   movement. If the price has fallen but the thesis remains intact, "hold +
   watch" is the default.
2. **Counterargument required**: never present any candidate without a
   counterargument.
3. **Falsification condition required**: an assessment that cannot be
   falsified is not an assessment.
4. **Limits rule**: when T3 (risk limit) is violated, always include a
   limit-compliance candidate (trim) regardless of how positive the other
   sources are.
5. State on the last line: "This review is decision material, not investment
   advice."
````

### 5.6 scripts/check_triggers.py

```python
#!/usr/bin/env python3
"""
Portfolio trigger evaluation script.

Trigger definitions must stay in sync with references/trigger-rules.md.
Usage:
    python check_triggers.py --portfolio ../assets/portfolio.json --prices prices.json

prices.json format (populate with current prices collected by Claude via web search):
{
  "005930.KS": {"price": 74500, "prev_close": 76900, "benchmark_change_pct": -0.8},
  "NVDA":      {"price": 121.2, "prev_close": 126.5, "benchmark_change_pct": -1.1},
  "BTC":       {"price": 95000000, "prev_close": 93000000, "benchmark_change_pct": null}
}
"""

import argparse
import json
import sys
from datetime import date

T1_EQUITY_PCT = 3.0     # Individual sharp move (equities)
T1_CRYPTO_PCT = 7.0     # Individual sharp move (crypto)
T2_PORTFOLIO_PCT = 2.0  # Overall portfolio-level move
MARKET_SYNC_BAND = 1.5  # Market-sync determination band (percentage points)


def pct(a, b):
    return (a - b) / b * 100.0 if b else 0.0


def check(portfolio: dict, prices: dict) -> dict:
    triggers = []
    total_now, total_prev = 0.0, 0.0
    limits = portfolio.get("risk_limits", {})

    # Aggregate valuation
    values = {}
    for p in portfolio.get("positions", []):
        t = p["ticker"]
        if t not in prices:
            triggers.append({"type": "DATA_MISSING", "ticker": t,
                             "msg": "Current price unconfirmed — needs to be collected via web search"})
            continue
        now = p["qty"] * prices[t]["price"]
        prev = p["qty"] * prices[t]["prev_close"]
        values[t] = now
        total_now += now
        total_prev += prev

    # T1 / T5 individual tickers
    for p in portfolio.get("positions", []):
        t = p["ticker"]
        if t not in prices:
            continue
        d = pct(prices[t]["price"], prices[t]["prev_close"])
        limit = T1_CRYPTO_PCT if p.get("asset_class") == "crypto" else T1_EQUITY_PCT
        if abs(d) >= limit:
            bench = prices[t].get("benchmark_change_pct")
            sync = bench is not None and abs(d - bench) < MARKET_SYNC_BAND
            triggers.append({
                "type": "T1", "priority": "MID", "ticker": t,
                "change_pct": round(d, 2),
                "market_sync": sync,
                "msg": f"{p['name']} daily {d:+.2f}%"
                       + (" (market-synced — brief report)" if sync else ""),
            })

    # T2 portfolio
    if total_prev:
        pd = pct(total_now, total_prev)
        if abs(pd) >= T2_PORTFOLIO_PCT:
            triggers.append({"type": "T2", "priority": "HIGH",
                             "change_pct": round(pd, 2),
                             "msg": f"Portfolio value daily {pd:+.2f}%"})

    # T3 risk limits
    max_pct = limits.get("single_position_max_pct")
    if max_pct and total_now:
        for t, v in values.items():
            w = v / total_now * 100.0
            if w > max_pct:
                triggers.append({"type": "T3", "priority": "CRITICAL", "ticker": t,
                                 "weight_pct": round(w, 1),
                                 "msg": f"{t} weight {w:.1f}% > limit {max_pct}%"})

    dd = limits.get("portfolio_drawdown_alert_pct")
    if dd is not None and total_prev:
        pd = pct(total_now, total_prev)
        if pd <= dd:
            triggers.append({"type": "T3", "priority": "CRITICAL",
                             "msg": f"Portfolio daily {pd:+.2f}% ≤ loss limit {dd}%"})

    order = {"CRITICAL": 0, "HIGH": 1, "MID": 2}
    triggers.sort(key=lambda x: order.get(x.get("priority", "MID"), 3))

    return {
        "date": date.today().isoformat(),
        "portfolio_value": round(total_now, 2),
        "portfolio_change_pct": round(pct(total_now, total_prev), 2) if total_prev else None,
        "triggered": bool([t for t in triggers if t["type"].startswith("T")]),
        "triggers": triggers,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--portfolio", required=True)
    ap.add_argument("--prices", required=True)
    args = ap.parse_args()

    with open(args.portfolio, encoding="utf-8") as f:
        portfolio = json.load(f)
    with open(args.prices, encoding="utf-8") as f:
        prices = json.load(f)

    result = check(portfolio, prices)
    json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
    print()


if __name__ == "__main__":
    main()
```

---

## 6. Testing the Script on Its Own

You can validate the trigger-evaluation logic even without Claude:

```bash
cat > prices.json << 'EOF'
{
  "005930.KS": {"price": 74500, "prev_close": 76900, "benchmark_change_pct": -0.8},
  "NVDA": {"price": 121.2, "prev_close": 126.5, "benchmark_change_pct": -1.1},
  "BTC": {"price": 95000000, "prev_close": 93000000, "benchmark_change_pct": null}
}
EOF
python3 scripts/check_triggers.py --portfolio assets/portfolio.json --prices prices.json
```

Sample run result: BTC weight 86.4% > limit 20% -> **T3 (CRITICAL) sorted
first**; Samsung Electronics -3.12% / NVDA -4.19% -> T1 fires. This confirms
priority sorting (CRITICAL > HIGH > MID) works correctly.

---

## 7. Usage Example

```
> Review my portfolio today

[portfolio-daily-review activates]
1. Load portfolio.json → 3 positions, check last_review
2. Web search for quotes → NVDA -4.2% (T1), no other triggers
3. Collect 3 sources for NVDA only: quant (momentum/sector relative strength) / news (primary source) / social (direction/intensity)
4. Cross-validation matrix → agreement determination → action candidates + falsification conditions
5. Check validity of the "AI infrastructure capex" thesis
6. Update last_review + log to review_log
```

On a day with no triggers:

```
> Review my portfolio today
Current-price table + "No triggers, no action needed." (End)
```

---

## 8. Customization Points

| Item | Location | Default | Notes |
|---|---|---|---|
| Individual sharp-move threshold (T1) | trigger-rules.md, check_triggers.py | Equities ±3% / Crypto ±7% | Must be kept in sync across both files |
| Portfolio-level move threshold (T2) | Same as above | ±2% | |
| Risk limits (T3) | portfolio.json `risk_limits` | 20% weight / -3% daily / -5% overall | Only the file needs editing |
| Market-sync band | check_triggers.py `MARKET_SYNC_BAND` | 1.5pp | |
| Number of review-log entries retained | SKILL.md Step 5 | 10 | |

> **Note**: when changing a threshold, be sure to update both
> `trigger-rules.md` (the rules Claude reads) and `check_triggers.py` (the
> script constants) together. If they diverge, the evaluation will differ
> between the scripted and non-scripted environments.

---

## 9. Using Together With quant-market-brief

```
Morning routine:
1. "Summarize today's market"      → quant-market-brief: regime determination
2. "Review my portfolio"           → portfolio-daily-review: reuses the regime
                                       determination from the same conversation
                                       in Step 2 [A] quant source
```

If run in this order within the same conversation, the regime context connects
automatically. If no briefing is present, the skill falls back to an
abbreviated regime determination and marks it as "abbreviated."

---

## 10. Precautions

- This skill's output is **decision material, not investment advice.** The
  final decision belongs to the user.
- Do not put sensitive information such as actual account numbers or
  brokerage credentials into `portfolio.json`. Ticker, quantity, and average
  cost alone are sufficient. If committing to a public repository, it's
  recommended to `.gitignore` your actual portfolio file.
- This skill is for demo/educational purposes; test it thoroughly in your own
  environment before actual use.
