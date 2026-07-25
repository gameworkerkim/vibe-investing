---
title: "portfolio-daily-review Installation and Usage Guide"
description: "A Claude Skill that checks your portfolio once a day and, when quantitative triggers fire, cross-verifies quant/news/social signals to generate investment decision material. Full installation guide, file contents, and customization points."
keywords:
  - "Claude Skill"
  - "portfolio daily review"
  - "portfolio monitoring"
  - "quant trigger rules"
  - "Claude Code skill"
  - "cross-validation"
  - "investment decision support"
lang: en
featured: false
schema_type: TechArticle
---

# portfolio-daily-review Installation and Usage Guide

> A Claude Skill that checks your portfolio once a day and, when a quantitative trigger fires,
> cross-verifies three sources — quant, news, and social media — to generate investment
> decision material.
> For the concept and design rationale, see Section 6 of [Claude_skill_guide.md](./Claude_skill_guide.md)

---

## 1. What This Skill Does

- **Trigger phrases**: "check my portfolio," "how's my account," "today's review," "check my holdings," "do I need to rebalance?," "daily check"
- **Core behavior**:
  1. Load holdings, average cost, and risk limits from `assets/portfolio.json` (no need to re-enter every time)
  2. Refresh current prices via web search, then evaluate the **quantitative triggers (T1–T5)**
  3. **If no trigger fires → end with a one-line "no issues" report** (blocking noise is this skill's #1 rule)
  4. Only when triggered, independently collect quant/news/social data across **3 sources → cross-verification matrix**
  5. Present action candidates (hold / reduce / add / consider stop-loss / watch further) + counterarguments + falsification conditions
  6. Update `last_review` and log the review (used to compute the delta for the next review)

**Three design characteristics**

- **The definition of "change" is not left to the LLM's discretion** — fixed by the quantitative rules in trigger-rules.md plus a judgment script
- **Market-sync filter** — if a stock's move is within 1.5 percentage points of the benchmark, it's demoted to a "market-synced move" with only an abbreviated report (this prevents long-form per-stock analysis from flooding out every time the index drops)
- **Thesis first** — the validity of the registered investment thesis is checked before the price move itself. Extreme social-media sentiment skew is treated only as a candidate contrarian indicator

---

## 2. Installation

Choose one of three methods.

### Method A: Claude.ai (Web/App) — Recommended

1. Zip the entire skill folder from this repo, or prepare the distributed `.skill` file.
   ```bash
   # If creating directly from the folder (a zip = the same format as .skill)
   zip -r portfolio-daily-review.skill portfolio-daily-review/
   ```
2. Upload it under Claude.ai → **Settings → Capabilities → Skills**. (Paid plan required)
3. After uploading, simply say a trigger phrase in a new conversation and it activates automatically.

### Method B: Claude Code

Copy the whole folder into your personal skills directory:

```bash
cp -r portfolio-daily-review/ ~/.claude/skills/portfolio-daily-review/
```

After restarting Claude Code, just mention it in natural language.

### Method C: Claude API

Follow the [Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill)
to upload the `.skill` package, and it will work the same way via API calls.

> **Verification tip**: after installing, ask "what skills are currently available?" to confirm it loaded.


---

## 3. Folder Structure

```
portfolio-daily-review/
├── SKILL.md                      # The workflow body (steps 0-5)
├── assets/
│   └── portfolio.json            # Portfolio state (replace with your own after installing)
├── references/
│   ├── trigger-rules.md          # Definitions of quantitative triggers T1-T5
│   ├── sentiment-guide.md        # Social-media interpretation rules (contrarian/manipulation checks)
│   └── action-framework.md       # Mapping of the 5 action candidates + output format
└── scripts/
    └── check_triggers.py         # Trigger evaluation script (execution verified)
```

---

## 4. Initial Setup (Important)

Right after installation, `assets/portfolio.json` contains **sample data**. Replace it in one of two ways:

**Via conversation**: on your first review request, the skill will ask about your holdings, quantity, and average cost, and fill in the file.
Or you can just say something like, "update my portfolio: 200 shares of Samsung Electronics at an average cost of ₩71,000, ..."

**Editing the file directly**: follow the schema below. Be sure to fill in `thesis` (your investment
rationale) — it's checked before price when determining an action.

---

## 5. Full File Contents

Copy the content below as-is into the same folder structure to complete the skill.

### 5.1 SKILL.md

```markdown
---
name: portfolio-daily-review
description: >
  A skill that checks the user's investment portfolio once a day, and when a
  predefined change trigger fires, synthesizes three sources — quant analysis,
  market news, and social sentiment — to generate investment decision material.
  Always use this skill when the user mentions "check my portfolio," "how's my
  account," "today's review," "check my holdings," "do I need to rebalance?,"
  "daily check," or similar. Portfolio state is read from assets/portfolio.json,
  and if the user mentions a change in holdings/quantity, updating this file is
  also handled by this skill.
---

# Portfolio Daily Review

## Purpose

Review the portfolio by rules, not emotion. If no trigger fires, end with a
one-line "no issues" report; only when triggered, perform a comprehensive
3-source (quant/news/social) evaluation.

Principle: **triggers via quantitative rules, sources via independent collection
followed by cross-verification, conclusions via action candidates + falsification
conditions.**

## Workflow

### Step 0: Load State

Read `assets/portfolio.json`.

- If `last_review` is today's date: notify the user that "today's review is
  already complete" and confirm whether they want to re-run it (the once-a-day
  principle).
- If the file is empty or has no `positions`: ask the user for their holdings,
  quantity, and average cost, and fill in the file first. Also confirm risk
  limits (`risk_limits`).
- If the user mentions a change like "I added 50 more shares of Samsung
  Electronics," update the file and summarize the change for confirmation.

### Step 1: Refresh Prices and Evaluate Triggers

Confirm the current price of each position via web search. Do not answer with
a remembered price from training data.

Evaluate using the quantitative rules (T1-T5) in `references/trigger-rules.md`.
If `scripts/check_triggers.py` can be executed in the environment, use the
script for evaluation; otherwise follow the rules document and calculate
manually.

**If no trigger fires**: end with a current-price table + "No triggers, no
action needed." Do not generate unnecessary analysis. This is the single most
important rule of this skill.

### Step 2: Collect 3 Sources (Only for Triggered Positions)

Collect each source **independently**, without mixing them at the collection
stage.

**[A] Quant perspective**
- Factor state for the position: 1M/3M momentum, sector relative strength,
  volatility change
- Alignment with the market regime — if the `quant-market-brief` skill is
  installed and today's briefing is already in the conversation, reuse that
  regime determination. Otherwise, determine an abbreviated regime using only
  VIX/rates/index and mark it as "abbreviated."

**[B] Market news**
- Identify the news causing the trigger via web search.
- Prioritize primary sources (filings, earnings releases, regulatory
  announcements). Clearly distinguish speculative articles from facts. If the
  causal news cannot be identified, record it as "price movement of unknown
  cause" — this itself is important information.

**[C] Social media sentiment**
- Determine the direction and intensity of reactions on X (Twitter), Reddit,
  and domestic communities via web search.
- Always read `references/sentiment-guide.md` first. The key point: social
  media can be a contrarian indicator. Extreme skew (fear/euphoria) is itself
  a signal, and should not be used directly as a directional signal.
- Do not quote individual accounts by name; discuss only aggregated
  direction/intensity.

### Step 3: Cross-Verification and Comprehensive Evaluation

Summarize whether the three sources agree in direction, in a matrix:

| Source | Direction | Intensity | Key rationale |
|---|---|---|---|
| Quant | Positive/Neutral/Negative | Strong/Medium/Weak | |
| News | | | Note whether primary source |
| Social | | | Note contrarian-indicator possibility if extreme skew |

- **All 3 agree** → mark as high confidence
- **2:1 split** → the minority view's rationale must be documented in the body
- **News (fact) conflicts with quant (price action)** → emphasize that fact
  itself. It means either the price already priced in the news, or the news
  hasn't been priced in yet

### Step 4: Present Action Candidates

Follow this format per `references/action-framework.md`:

- **Action candidates**: 1-2 of hold / reduce / add / consider stop-loss / watch further
- State **both** the rationale and the counterargument for every candidate
- Must include a **falsification condition**: "if X is observed, this evaluation is void"
- Note that the final decision rests with the user. Do not use buy/sell directives

### Step 5: Update State

Update `last_review` in `assets/portfolio.json` to today's date, and append a
one-line summary to the `review_log` array (used to compute "the delta since
yesterday" in the next review). Keep only the most recent 10 log entries.

## Guidelines

- Stay silent if no trigger fires. Producing a long-form analysis every day is noise.
- Do not arbitrarily assign weights to the three sources. Report disagreement as disagreement.
- Note the lookup time for every figure.
- Report a violation of risk limits (T3) prominently, before any other trigger.
- State on the last line that this skill's output is decision-support material, not investment advice.
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
      "thesis": "macro hedge"
    }
  ],
  "review_log": []
}
```

### 5.3 references/trigger-rules.md

```markdown
# Definition of Change Triggers

"A change has occurred" means **at least one** of the following quantitative
conditions is met. Do not use the LLM's subjective judgment ("it seems to have
dropped quite a bit") as a trigger.

| Trigger | Condition | Priority |
|---|---|---|
| **T1** Individual sharp move | Absolute daily change ≥ 3% (≥ 7% for crypto) | Medium |
| **T2** Portfolio move | Absolute daily change in total valuation ≥ 2% | High |
| **T3** Risk limit | A `risk_limits` item is violated (weight exceeded, loss limit reached) | **Highest** |
| **T4** Event | Major primary-source news about a held position (earnings release/guidance change, regulation, security incident/hack, delisting/trading halt issue, large-scale rights offering/CB) | High |
| **T5** Volatility jump | 20-day historical volatility up 50%+ versus the prior day | Medium |

## Evaluation Rules

- If multiple triggers fire simultaneously, report the **highest priority first**.
- T3 (risk limit) must be reported before any other analysis, as a separate warning block.
- Differentiated thresholds by asset class: crypto's baseline volatility is
  higher, so raise the T1 threshold to 7%. If the user adds
  `trigger_overrides` to `portfolio.json`, that value takes priority.
- Always record the current price and lookup time used for the trigger determination.
- If checked intraday: compute the daily change versus the prior close and mark it "intraday basis."

## Non-Triggers (Cases Not Analyzed)

- When the entire index moves in the same direction and an individual stock
  simply moves in sync (if |stock change − benchmark change| < 1.5pp, demote
  even a fired T1 to a "market-synced move" with only an abbreviated report)
- A minor move on volume less than 50% of the 20-day average
```

### 5.4 references/sentiment-guide.md

```markdown
# Social Media Sentiment Interpretation Guide

Social media is both a source of information and a **thermometer of crowd
psychology**. It should not be used directly as a directional signal — interpret
it using the rules below.

## What to Collect

- X (Twitter): mention volume and tone for the ticker/keyword
- Reddit: r/stocks, r/wallstreetbets, ticker-specific subreddits (US stocks)
- Domestic: sentiment on stock discussion boards, major investment communities (Korean stocks)
- Crypto: X + Telegram channel sentiment

Collect only what can be confirmed via web search. Mark inaccessible sources as
"unable to confirm" rather than guessing.

## Interpretation Rules

### 1. Separate direction from intensity

- Direction: positive / neutral / negative
- Intensity: weak (normal level) / medium (increased mentions) / strong (sharp
  mention spike + tone skew)

### 2. Extreme skew is a candidate contrarian indicator

- **Extreme fear** (panic-sell mentions, "it's over" tone dominates): may
  signal a short-term bottom
- **Extreme euphoria** (surge in profit screenshots, "guaranteed moon" tone
  dominates): may signal short-term overheating
- In both cases, always note "extreme skew — possible contrarian indicator"
  alongside the matrix

### 3. A mention-volume spike is itself a signal

Regardless of tone, if mention volume spikes to several times the normal
level, note it separately as a signal of expanding volatility.

### 4. Check for manipulation possibility

- A sudden surge in one-directional posts from new/bot-pattern accounts →
  note "possible pump/FUD campaign"
- For small caps and crypto especially, unattributed rumors of good/bad news
  should be classified only as social media ([C] source), not news ([B]
  source), until confirmed by a primary source

### 5. Citation principle

- Do not quote or identify individual accounts/users
- Report only aggregated changes in direction/intensity/mention volume
```

### 5.5 references/action-framework.md

````markdown
# Action Framework

The criteria for mapping evaluation results to action candidates. **Only
present candidates** — the final decision rests with the user. Do not use
buy/sell directives.

## 5 Action Candidates

| Candidate | Presentation condition (example) |
|---|---|
| **Hold** | 3 sources neutral-to-positive, no damage to the thesis |
| **Watch further** | 2:1 split among sources, or a move of unknown cause |
| **Reduce** | 3 sources agree negative + partial damage to the thesis, or T3 weight limit exceeded |
| **Add** | 3 sources agree positive + price fell (unwinding of a prior pricing-in) + room under limits |
| **Consider stop-loss** | A primary-source fact emerges that invalidates the thesis itself (e.g., core business regulation confirmed) |

## Output Format (Required)

For every triggered position:

```
### {Stock name} ({ticker}) — Trigger: {T1-T5}

**Cross-verification matrix**
| Source | Direction | Intensity | Key rationale |
|---|---|---|---|
| Quant | | | |
| News | | | |
| Social | | | |

**Agreement**: {3-source agreement / 2:1 split / full disagreement}

**Action candidates**: {1-2}
- Rationale:
- Counterargument:

**Falsification condition**: {if X is observed, this evaluation is void}

**Thesis check**: the registered thesis "{thesis}" is {valid / partially damaged / invalidated}
```

## Core Principles

1. **Thesis first**: check the validity of the investment thesis before the
   price move. If the price falls but the thesis remains valid, "hold +
   watch" is the default.
2. **Counterargument required**: never present any candidate without a counterargument.
3. **Falsification condition required**: an evaluation that cannot be falsified is not an evaluation.
4. **The limit is king**: if T3 (risk limit) is violated, always include a
   limit-compliance candidate (reduce), no matter how positive the other
   sources are.
5. State on the last line: "This review is decision-support material, not investment advice."
````

### 5.6 scripts/check_triggers.py

```python
#!/usr/bin/env python3
"""
Portfolio trigger evaluation script.

Trigger definitions must stay in sync with references/trigger-rules.md.
Usage:
    python check_triggers.py --portfolio ../assets/portfolio.json --prices prices.json

prices.json format (current prices collected by Claude via web search go here):
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
T2_PORTFOLIO_PCT = 2.0  # Overall portfolio move
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
                             "msg": "Current price not confirmed — needs web search"})
            continue
        now = p["qty"] * prices[t]["price"]
        prev = p["qty"] * prices[t]["prev_close"]
        values[t] = now
        total_now += now
        total_prev += prev

    # T1 / T5 individual positions
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
                       + (" (market-synced — abbreviated report)" if sync else ""),
            })

    # T2 portfolio
    if total_prev:
        pd = pct(total_now, total_prev)
        if abs(pd) >= T2_PORTFOLIO_PCT:
            triggers.append({"type": "T2", "priority": "HIGH",
                             "change_pct": round(pd, 2),
                             "msg": f"Portfolio valuation daily {pd:+.2f}%"})

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
                             "msg": f"Portfolio daily {pd:+.2f}% <= loss limit {dd}%"})

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

## 6. Testing the Script Standalone

You can verify the trigger evaluation logic even without Claude:

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

Sample execution result: BTC weight 86.4% > limit 20% → **T3 (CRITICAL) sorted
first**, Samsung Electronics -3.12% / NVDA -4.19% → T1 fires. Confirmed that
the priority ordering (CRITICAL > HIGH > MID) works correctly.

---

## 7. Usage Example

```
> Review my portfolio today

[portfolio-daily-review triggered]
1. Load portfolio.json → 3 positions, check last_review
2. Web search for prices → NVDA -4.2% (T1), no other triggers
3. Collect 3 sources for NVDA only: quant (momentum/sector relative strength) / news (primary source) / social (direction·intensity)
4. Cross-verification matrix → agreement determination → action candidates + falsification condition
5. Check validity of the thesis "AI infrastructure capex"
6. Update last_review + log review_log
```

On a day with no trigger:

```
> Review my portfolio today
Current price table + "No triggers, no action needed." (End)
```

---

## 8. Customization Points

| Item | Location | Default | Notes |
|---|---|---|---|
| Individual sharp-move threshold (T1) | trigger-rules.md, check_triggers.py | Equity ±3% / Crypto ±7% | Must be kept in sync in both places |
| Portfolio move threshold (T2) | Same | ±2% | |
| Risk limits (T3) | portfolio.json `risk_limits` | Weight 20% / daily -3% / total -5% | Just edit the file |
| Market-sync band | check_triggers.py `MARKET_SYNC_BAND` | 1.5pp | |
| Number of review log entries retained | SKILL.md Step 5 | 10 | |

> **Caution**: when changing thresholds, be sure to update both
> `trigger-rules.md` (the rules Claude reads) and `check_triggers.py` (the
> script constants). If they diverge, the determination will differ between
> the environment where the script runs and where it doesn't.

---

## 9. Using It Together With quant-market-brief

```
Morning routine:
1. "Summarize today's market"        → quant-market-brief: regime determination
2. "Review my portfolio"             → portfolio-daily-review: reuses the same
                                        conversation's regime determination in
                                        Step 2 [A] quant source
```

Running them in order in the same conversation automatically links the regime
context. If there's no briefing, the skill falls back to an abbreviated regime
determination and marks it as "abbreviated."

---

## 10. Cautions

- The output of this skill is **decision-support material and not investment advice.** The final decision rests with the user.
- Do not put sensitive information such as actual account numbers or brokerage
  authentication credentials into `portfolio.json`. Ticker, quantity, and
  average cost are sufficient. If committing to a public repo, it's
  recommended to `.gitignore` your actual portfolio file.
- This skill is for demo/educational purposes; test it thoroughly in your own environment before real use.
