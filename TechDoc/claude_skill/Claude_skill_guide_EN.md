# Claude Skill Guide (English)

> How to Build Repeatable Workflows Using Anthropic Agent Skills
> Reference: [anthropics/skills repository](https://github.com/anthropics/skills) · [Agent Skills Standard](http://agentskills.io)

---

## 1. What Is a Skill?

A Skill is a **folder containing instructions, scripts, and resources** that teaches Claude to perform specific tasks better in a **repeatable way**. Claude dynamically loads Skills based on the task context.

The core idea is simple:

- **Stop rewriting prompts.** Package a refined workflow into a single folder, and Claude follows those instructions every time it encounters the relevant task.
- **Progressive Disclosure.** Only the Skill's name and description stay in context at all times; the body and bundled resources load on demand. This saves context while enabling deep expertise.
- **LLM is Excel, not an Oracle.** Skills are the practical implementation of this principle — instead of expecting the model to "figure it out," you explicitly inject verified procedures and checklists.

---

## 2. Repository Structure

[anthropics/skills](https://github.com/anthropics/skills) repository layout:

| Directory | Description |
|-----------|-------------|
| `./skills` | Actual Skill examples (Creative & Design, Development & Technical, Enterprise & Communication, Document Skills) |
| `./spec` | Agent Skills standard specification |
| `./template` | Template for creating new Skills |

Notably, `skills/docx`, `skills/pdf`, `skills/pptx`, `skills/xlsx` are production Skills that power Claude's actual document generation — excellent reference material for designing complex Skills (source-visible, not open-source).

---

## 3. Anatomy of a Skill

```
skill-name/
├── SKILL.md            (required)
│   ├── YAML frontmatter  (name, description required)
│   └── Markdown instructions
└── Bundled resources     (optional)
    ├── scripts/        - Executable code for deterministic/repetitive tasks
    ├── references/     - Docs loaded into context only when needed
    └── assets/         - Files used in output (templates, icons, fonts)
```

### Required Frontmatter Fields

| Field | Description |
|-------|-------------|
| `name` | Unique identifier (lowercase, hyphens for spaces) |
| `description` | **Core of the trigger mechanism.** Must include both *what it does* AND *when to use it* |

### Design Principles

1. **Description should be slightly "aggressive"** — Claude tends to undertrigger Skills, so list trigger conditions concretely: "When the user mentions X, Y, or Z, use this Skill even without explicit request."
2. **Keep SKILL.md body under 500 lines** — If exceeding, offload to `references/` and clearly state when to read them.
3. **Deterministic tasks go in scripts** — Lock calculations, parsing, and API calls in `scripts/` code rather than leaving them to LLM free generation.
4. **Split by domain variants** — E.g., `references/krx.md`, `references/us-market.md` — separate market-specific reference files so Claude reads only what's needed.

---

## 4. How to Use

### Claude Code

```bash
/plugin marketplace add anthropics/skills
/plugin install example-skills@anthropic-agent-skills
```

After installation, just mention in natural language:
> "Summarize today's market using the quant market brief skill"

Personal Skills go in `~/.claude/skills/` as folders.

### Claude.ai (Web/App)

Paid plan: Settings → Capabilities → upload `.skill` package or a zip containing SKILL.md. ([Official Guide](https://support.claude.com/en/articles/12512180-using-skills-in-claude))

### Claude API

Pre-built Skills or custom Skill uploads supported. ([Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill))

---

## 5. Example 1: Quant Daily Market Brief Skill

Every morning, a single "summarize today's market" command produces a **factor-based, supply/demand, and volatility-perspective structured briefing** — not a news roundup.

### Folder Structure

```
quant-market-brief/
├── SKILL.md
└── references/
    ├── factor-checklist.md    # Factors to check and interpretation criteria
    └── output-template.md     # Briefing output template
```

### SKILL.md

```markdown
---
name: quant-market-brief
description: >
  Summarizes today's equity market from a quant perspective. When the user mentions
  "market", "today's session", "market briefing", "session summary", "how's KOSPI/NASDAQ
  today", etc., use this Skill even without the word "quant". Produces structured
  briefings framed by factors, volatility, and fund flows — not plain news summaries.
---

# Quant Market Brief

## Purpose
Read market structure (regime), not individual news. Answer "where is the market
in factor/volatility/flow terms and what changed?" — not "what happened."

## Workflow

### Step 1: Data Collection (Web Search Required)
Confirm the following via web search (do not rely on training data memory):
- Major index closes/changes: KOSPI, KOSDAQ, S&P 500, NASDAQ, Philadelphia Semiconductor
- Volatility: VIX level and day-over-day change, VKOSPI
- Rates/FX: US 10Y, KRW/USD, DXY
- Fund flows: Foreign/institutional net buys (KRX), major sector ETF flows
- Crypto (optional): BTC, Kimchi Premium — used only as risk appetite proxy

### Step 2: Apply Factor Lens
Read references/factor-checklist.md and assess:
- Momentum vs Reversal: Are leading stocks continuing or breaking?
- Growth vs Value: Rate direction and style rotation alignment
- Large vs Small: Risk appetite dispersion
- Quality/Low Vol: Defensive factor rotation

### Step 3: Regime Classification
Explicitly classify into one of the following with one-line reasoning:
Risk-On / Risk-Off / Rotation / Chop (no directionality)

### Step 4: Output
Follow the references/output-template.md template. Must include:
1. One-line regime classification (at the top)
2. Data table (index/volatility/rates/FX/flows)
3. Factor scorecard (each factor: Bullish/Neutral/Bearish + 1-line rationale)
4. "What Changed from Yesterday" section — focus on delta
5. Falsification condition — what would be observed if today's assessment is wrong

## Guidelines
- Don't predict. Follow: observed facts → factor interpretation → conditional scenarios.
- Cite source and timestamp for all figures.
- Mark confidence level: High/Medium/Low. If data conflicts, write "mixed signals."
- No investment advice language ("buy/sell"). Provide decision material only.
```

### references/factor-checklist.md (excerpt)

```markdown
# Factor Check Checklist

## Momentum
- Signal: Did last month's top-performing sector show relative strength today?
- Bullish: Leading sector relative return > market && trading value sustained
- Breakdown signal: Leading stocks plunge + volume surge (distribution selling)

## Volatility Regime
- VIX < 15: Low vol (carry/momentum favorable)
- VIX 15–25: Neutral
- VIX > 25: High vol (low vol/quality, consider position reduction)
- Note: VIX 'change rate' is more effective than 'level' for short-term signals
```

---

## 6. Example 2: Portfolio Daily Monitoring & Review Skill

Register your portfolio and get a **once-daily** assessment combining quant analysis, market news, and social sentiment whenever changes occur — in a form you can apply to investment decisions.

Key design points:

- **Portfolio stored as state in `assets/portfolio.json`** — no re-entering each time
- **Change trigger rules fixed as code/spec** — don't leave "what constitutes a change" to LLM discretion
- **3 information sources (quant/news/social) collected independently then cross-validated** — no single source dominates the conclusion (multi-source committee approach)

### Folder Structure

```
portfolio-daily-review/
├── SKILL.md
├── assets/
│   └── portfolio.json         # Holdings, quantities, cost basis, risk limits
├── references/
│   ├── trigger-rules.md       # Quantitative definitions of "change"
│   ├── sentiment-guide.md     # SNS sentiment interpretation guardrails
│   └── action-framework.md    # Evaluation → action candidate mapping criteria
└── scripts/
    └── check_triggers.py      # Price change/limit violation detection script (optional)
```

### assets/portfolio.json

```json
{
  "base_currency": "KRW",
  "last_review": "2026-07-04",
  "risk_limits": {
    "single_position_max_pct": 20,
    "daily_drawdown_alert_pct": -3.0,
    "portfolio_drawdown_alert_pct": -5.0
  },
  "positions": [
    { "ticker": "005930.KS", "name": "Samsung Electronics", "qty": 100, "avg_price": 72000, "thesis": "HBM cycle" },
    { "ticker": "NVDA",      "name": "NVIDIA", "qty": 10,  "avg_price": 118.5, "thesis": "AI infra capex" },
    { "ticker": "BTC",       "name": "Bitcoin", "qty": 0.5, "avg_price": 61000000, "thesis": "Macro hedge" }
  ]
}
```

### SKILL.md

```markdown
---
name: portfolio-daily-review
description: >
  Reviews the user's investment portfolio once daily. When pre-defined change triggers
  fire, synthesizes quant analysis, market news, and social sentiment into investment
  decision material. Use when the user mentions "portfolio review", "my account",
  "today's review", "how are my holdings", "rebalancing", or requests a daily check.
  Portfolio state is read from assets/portfolio.json.
---

# Portfolio Daily Review

## Purpose
Review the portfolio by rules, not emotions. If no triggers fire, end with "no issues"
in one line. When triggers fire, perform the full 3-source composite assessment.

## Workflow

### Step 0: Load State
Read assets/portfolio.json. If last_review is today, alert "Today's review already
completed" and confirm re-execution (once-daily principle).

### Step 1: Price Update & Trigger Check
Check current prices via web search for each position. Assess using
references/trigger-rules.md rules. Summary:
- Single position daily change ±3%+
- Portfolio total value daily change ±2%+
- risk_limits violation (single position overweight, loss limit reached)
- Material news on held stocks (earnings, regulation, hack/security incident, delisting)

**If no triggers**: Current price table + "No triggers, no action needed." End.
Do not generate unnecessary analysis.

### Step 2: 3-Source Collection (Triggered Positions Only)
Collect each source independently; do not mix:

[A] Quant Perspective
- Factor status for the stock: momentum (1M/3M), sector relative strength, vol change
- Market regime alignment (reuse quant-market-brief results if available)

[B] Market News
- Web search to identify trigger cause. Prioritize primary sources (filings, earnings
  releases, regulatory announcements). Distinguish speculative articles from facts.

[C] Social Sentiment
- Gauge direction and intensity of X (Twitter), Reddit, Korean community reactions via
  web search. Must read references/sentiment-guide.md first. Key point:
  SNS can be a contrarian indicator. Extreme clustering (fear/euphoria) is itself
  a signal — don't use it raw as a directional signal.

### Step 3: Cross-Validation & Composite Assessment
Matrix whether the three sources agree:

| Source | Direction | Strength | Key Evidence |
|---|---|---|---|
| Quant | Negative | Medium | Momentum breaking + sector relative weakness |
| News | Negative | Strong | Guidance downgrade (primary source) |
| SNS  | Extreme Fear | Strong | Note contrarian potential |

- 3 agree → High confidence
- 2:1 split → Include minority rationale explicitly in body
- News (facts) vs Quant (price action) conflict → highlight the conflict itself

### Step 4: Action Candidates
Following references/action-framework.md criteria, use this format:
- Action candidates: Hold / Reduce / Add / Consider Stop-Loss / Watch More — pick 1-2
- Provide rationale AND counter-arguments for each
- Falsification condition: "If X is observed, this assessment is invalid." Must include.
- State clearly: final decision rests with the user. No buy/sell directives.

### Step 5: Update State
Update portfolio.json's last_review to today, log review summary (used in next
review's "delta from yesterday" calculation).

## Guidelines
- Silence if no triggers. Daily walls of analysis are noise.
- Don't arbitrarily weight the three sources. Report disagreements as disagreements.
- When citing SNS, address aggregate direction/intensity only — no individual accounts.
- Timestamp all figures.
```

### references/trigger-rules.md (excerpt)

```markdown
# Change Trigger Definitions

"A change has occurred" means at least one of these quantitative conditions is met.
Do not use subjective LLM judgment ("seems like it dropped a lot") as a trigger.

| Trigger | Condition | Priority |
|---------|-----------|----------|
| T1 Single Sharp Move | Position daily change |±3%| or more | Medium |
| T2 Portfolio Move | Total value daily change |±2%| or more | High |
| T3 Risk Limit | Any risk_limits item violated | Highest |
| T4 Event | Earnings/regulation/security incident/delisting primary source news | High |
| T5 Volatility Jump | Position implied/historical vol +50% vs prior day | Medium |

Multiple triggers firing simultaneously → report highest priority first.
```

### Execution Example (Claude Code)

```
> Review my portfolio today

[portfolio-daily-review skill triggered]
1. Load portfolio.json → 3 positions
2. Price search → NVDA -4.2% (T1 fired), others no trigger
3. 3-source collection for NVDA (quant/news/social)
4. Cross-validation matrix + action candidates + falsification conditions
5. last_review updated
```

---

## 7. Linking the Two Skills

Both Skills work independently, but installing both creates synergy:

```
Morning Routine:
1. quant-market-brief  → Market regime classification (Risk-On / Off / Rotation / Chop)
2. portfolio-daily-review → Evaluate individual positions using that regime as context
   (SKILL.md Step 2 [A] explicitly states "reuse quant-market-brief results")
```

This cross-skill referencing is the production pattern for the Skills system — each Skill is small and single-responsibility, but they compose at the workflow level.

---

## 8. Common Mistakes When Building Skills

| Mistake | Fix |
|---------|-----|
| Description lists features but no trigger conditions | Explicitly state "Use when user mentions X, Y" (prevents undertrigger) |
| Leaving judgment criteria to LLM discretion | Lock quantitative rules in references/ (e.g., trigger definitions) |
| Re-entering the portfolio through conversation every time | Store as state file in assets/ |
| Cramming everything into a single SKILL.md | Split to references/ when exceeding 500 lines; state when to read |
| Outputting predictions or buy/sell directives | Enforce: observation → interpretation → conditional scenarios + falsification |
| Deploying without testing | Validate trigger behavior and output quality with 3-5 real prompts |

---

## 9. Related Links

- [anthropics/skills Repository](https://github.com/anthropics/skills)
- [What are skills?](https://support.claude.com/en/articles/12512176-what-are-skills)
- [Using skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude)
- [Creating custom skills](https://support.claude.com/en/articles/12512198-creating-custom-skills)
- [Equipping agents for the real world with Agent Skills (Engineering Blog)](https://anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill)
- [Agent Skills Standard](http://agentskills.io)

> **Note**: Repository Skills are demo/educational. Actual Claude behavior may differ — always test in your own environment before production use. The investment-related skills in this guide are tools to structure decision material, not investment advice.
