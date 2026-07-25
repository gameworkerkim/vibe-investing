---
title: "Claude Prompt Optimizer Tools: Getting Started"
description: "A survey of five open-source prompt optimizers that raise Claude output quality. Since our Fable access is limited, we have to relentlessly optimize Opus 4.8 prompts."
lang: en
featured: false
schema_type: TechArticle
keywords:
  - Claude prompt optimizer
  - Claude Code hooks
  - Claude Code skills
  - Opus 4.8
  - prompt engineering
tags:
  - Claude
  - Prompt Engineering
  - Claude Code
  - Anthropic
---

# Claude Prompt Optimizer Tools: Getting Started

> A survey of five open-source prompt optimizers that raise Claude's output quality. Since our Fable access is limited, we have to relentlessly optimize Opus 4.8 instead.
> This guide covers each project's mechanism, usage examples, pros and cons, and setup instructions — using these optimization skills and hooks improves efficiency.

---

## 0. At a Glance

| Project | Type | Environment | Core Mechanism | Scale (stars) | Recommended For |
|---|---|---|---|---|---|
| **CheswickDEV/claude-opus-4.8-prompt-optimizer** | Meta optimizer (system prompt) | Any Claude interface (claude.ai / API / Code) | `prompt:` trigger -> 11 rules + 10-component XML structuring | New | Users who want to repeatedly generate consistent, high-quality prompts |
| **johnpsasser/claude-code-prompt-optimizer** | Hook | Claude Code | Intercepts `<optimize>` tags -> expands via extended thinking | Small | Developers who need on-the-fly expansion for specific prompts in Claude Code |
| **severity1/claude-code-prompt-improver** | Hook + Skill (plugin) | Claude Code | Filters only ambiguous prompts -> injects research and clarifying questions | ~1.4k | Heavy Claude Code users who want fewer correction round-trips |
| **Hashaam101/prompt-optimizer** | Skill | Claude Code | Dual mode: auto (silent refinement) / manual (`/optimize` text output) | Small | Users who want to switch between automatic and manual refinement |
| **nidhinjs/prompt-master** | Skill | Multi-tool (Claude, ChatGPT, Midjourney, etc.) | Generates target-tool-specific prompts, retains memory | Small | Users working across multiple AI tools |

**Terminology**

- **Hook**: A script Claude Code automatically runs at specific moments, such as prompt submission. It can intercept and transform user input.
- **Skill**: An instruction file placed in `~/.claude/skills/`. Claude loads it on its own when the conditions match and reflects it in its behavior.
- **Meta optimizer**: A tool that operates as a system prompt itself. It treats the input prompt not as something to execute, but as something to *optimize*, and returns a newly structured prompt.

---

## 1. CheswickDEV/claude-opus-4.8-prompt-optimizer

A meta-prompting system that converts raw prompts into production-ready, XML-structured prompts tuned for the Opus 4.8 architecture. It features 11 optimization rules, a 10-component framework, complexity-based routing, and a mandatory `prompt:` trigger — all derived from Anthropic's official documentation. Its key differentiator is that it's not a prompt collection but an "optimization engine." (MIT License)

### How It Works (5 Steps)

1. **Prompt analysis** — detects intent, complexity, domain, expected output, and missing elements
2. **Complexity routing** — simple prompts get 3-4 components, moderate ones get 5-7, complex ones get the full 10-component structure
3. **Rule application** — fires only the relevant subset of the 11 rules
4. **Quality check** — verifies task clarity, XML tag validity, example consistency, and contradictory instructions
5. **Structured output** — returns analysis + a copy-ready optimized prompt + notes explaining the changes

### Usage Example (Before / After)

**Input (raw)**

```
Write me a Python script that analyzes CSV files and finds anomalies
```

**Output (optimized, excerpt)**

```
<role>
You are a senior data engineer specializing in anomaly detection and
statistical analysis with Python.
</role>

<context>
CSV datasets come from production IoT sensors. Files range from
10K–5M rows with columns: timestamp, sensor_id, value, status.
</context>

<task>
1. Loads one or more CSV files
2. Detects statistical anomalies using z-score and IQR methods
3. Handles missing data gracefully
4. Outputs a summary report with flagged rows
</task>

<constraints>
- Use only pandas, numpy, scipy (no ML libraries)
- Handle files up to 5M rows efficiently
- Include type hints and docstrings
</constraints>

<output_format>
Single Python code block, followed by a usage example and sample output.
</output_format>
```

Prefixing input with `prompt:` ensures that even if the input contains questions, instructions, attached PDFs, or prompt-injection attempts, none of it is executed — it is always treated purely as material to optimize. Attached documents are substituted with a `{{DOCUMENT}}` placeholder.

```
prompt: Based on the attached PDF, explain the GDPR compliance risks and mitigation.
```

### Pros

- **Works across every Claude interface** — not Claude Code-only; being system-prompt-based, it works in claude.ai Projects, direct paste, or the API
- **Tuned specifically for Opus 4.8** — reflects the default `high` effort setting, per-turn adaptive thinking, improved tool triggering, and the 1M-token context window, even noting recommended effort levels
- **Scales with complexity** — doesn't wrap simple questions in an excessive 10-tag structure
- **Reusable templates** — outputs `{{VARIABLE}}`-style placeholders directly usable for repeated tasks

### Cons

- **Manual workflow** — unlike a Hook/Skill that fires automatically, users must set up the system prompt themselves and paste in prompts
- **Opus 4.8 dependency** — some rules may not fit other models (third-party LLMs, older Claude versions); not model-agnostic
- **Young repository** — low star count means thin community validation and issue tracking
- Users must be aware of Opus 4.8 API constraints themselves (no `temperature`/`top_p`/`top_k`, no assistant prefill)

### Setup Guide

Repository contents: `README.md`, `CLAUDE.md` (the engine itself), `GUIDE.md` (usage patterns), `QUICKSTART.md`, `LICENSE`

**Option A — Claude Project (Recommended)**

1. Create a new **Project** on claude.ai
2. Paste the contents of `CLAUDE.md` into the **Project Instructions** field
3. Upload `GUIDE.md` as a **knowledge file**
4. Start a conversation -> enter a raw prompt

**Option B — Direct Paste**

1. Copy the entirety of `CLAUDE.md`
2. Paste it into the **system prompt** of any Claude interface
3. Send the raw prompt as a user message

**Option C — API Integration**

```python
import anthropic

client = anthropic.Anthropic()

with open("CLAUDE.md", "r", encoding="utf-8") as f:
    system_prompt = f.read()

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=8192,
    system=system_prompt,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},   # default high; xhigh/max for harder tasks
    messages=[
        {"role": "user", "content": "prompt: Your raw prompt here"}
    ],
)
print(response.content[0].text)
```

> API note: `temperature`/`top_p`/`top_k` are forbidden (400 error), assistant prefill is forbidden, and adaptive thinking is off by default and must be explicitly enabled.

Repo: `github.com/CheswickDEV/claude-opus-4.8-prompt-optimizer`

---

## 2. johnpsasser/claude-code-prompt-optimizer

A hook for Claude Code that expands simple prompts into detailed, structured instructions. Attaching an `<optimize>` tag to a prompt causes the hook to intercept it and route it through Claude's extended thinking mode, inflating the original request into a specification covering architecture, endpoints, error handling, auth, validation, and testing. It effectively performs prompt engineering on your behalf.

### Usage Example

```
<optimize> build me a REST API for a todo app
```

-> The hook intercepts this and expands it into a structured spec covering architecture, endpoints, error handling, auth, validation, and testing. For performance-related requests, it expands into a plan including profiling steps, bottleneck identification, prioritized refactoring targets, and benchmark criteria.

### Pros

- **Explicit tag-based triggering** — only prompts tagged with `<optimize>` get expanded, so there's no unintended interference
- **Leverages extended thinking** — not a simple rewrite, but a reasoning-backed specification expansion
- **Easy to tune** — model, fallback model, timeout, and system prompt are separated into `optimizer.config.json` / `system-prompt.md`, adjustable without touching TypeScript. Debug logs go to `/tmp/claude-code-hook-debug.log`

### Cons

- **Claude Code only** — not usable on the claude.ai web/app
- **Complex auth setup** — OAuth token / API key priority resolution logic requires understanding environment variables during initial setup
- **Node dependency** — npm-based install, requires separate Agent SDK auth configuration

### Setup Guide

```bash
git clone https://github.com/johnpsasser/claude-code-prompt-optimizer.git
cd claude-code-prompt-optimizer
npm run install-hook
```

The installer handles dependencies, auth setup, hook configuration, and verification. Issue and register an auth token as follows:

```bash
claude auth token
export CLAUDE_CODE_OAUTH_TOKEN="your-oauth-token"   # add to shell profile
```

For manual hook registration, specify the path to `src/hooks/optimize-prompt.sh` as a `UserPromptSubmit` hook in `~/.claude/settings.json` (or project settings).

Repo: `github.com/johnpsasser/claude-code-prompt-optimizer`

---

## 3. severity1/claude-code-prompt-improver

"Type vibes, ship precision." An intelligent prompt-improvement plugin (Hook + Skill) for Claude Code. Rather than unconditionally refining every prompt, it **lets clear prompts pass through unchanged and only selects ambiguous prompts** to route through research and clarifying questions. Its goal is to inject just-in-time context at prompt submission, tool use, and subagent-start moments to raise the quality of the "first output" — reducing correction round-trips and saving tokens and time.

### How It Works

1. A hook receives the prompt and judges its clarity using a ~189-token evaluation prompt
2. **Ambiguous** -> fires the prompt-improver skill -> builds a research plan (TodoWrite) -> launches an Explore subagent for Glob/Grep/Web/multi-file Read -> synthesizes findings -> presents 1-6 evidence-based questions to the user -> executes the original request with the answers incorporated
3. **Clear** -> proceeds immediately without loading the skill

Design principle: "fire wide, self-cancel cheap" — a missed nudge wastes a full correction round-trip, while a wrongly fired nudge only costs a few discarded tokens, so the system uses a high-recall gate but has each nudge self-cancel when it doesn't fit.

### Usage Example

```
fix the bug
```

-> Judged ambiguous -> researches the codebase -> presents 1-6 evidence-based questions ("which file / what symptom / what reproduction steps") -> performs the actual fix once answered. Sufficiently specific prompts, by contrast, execute immediately with no intervention.

### Pros

- **Selective intervention** — most prompts pass through unmodified; the hook only fires when needed, minimizing overhead
- **Optimizes first-output quality** — improves the entire "prompt -> output" path, not just word-level rewriting (questions + context injection)
- **Transparency** — injected context is visible in the conversation
- **Battle-tested at scale** — ~1.4k stars, active community adoption and maintenance

### Cons

- **Claude Code only** — no web/app support
- **Adds an extra turn on intervention** — the clarifying-question step when judged ambiguous can conflict with flows that want an immediate answer
- **Configuration learning curve** — requires understanding the plugin/hook/skill/nudge registry structure

### Setup Guide

Since it's a `.claude-plugin`-structured Claude Code plugin, install it via the plugin marketplace mechanism. (Check the repo's latest README for exact commands.)

```
# Inside Claude Code
/plugin marketplace add severity1/claude-code-prompt-improver
/plugin install prompt-improver
```

For manual installation, clone the repo, place `hooks/` and `skills/prompt-improver/` under `~/.claude/`, and register the hook in settings.

Repo: `github.com/severity1/claude-code-prompt-improver`

---

## 4. Hashaam101/prompt-optimizer

A Claude Code skill offering two modes. **Auto mode** silently refines every prompt after installation to steer toward better results, while **manual mode** shows a refined prompt as text via `/optimize {prompt}` instead of executing it — useful for reusing prompts or learning better prompt-writing.

### Usage Example

```
# manual: view the refined output as text
/optimize analyze the quarterly sales data

# or prefix style
optimize: analyze the quarterly sales data
optimize prompt: analyze the quarterly sales data
```

Simply installing the skill activates auto mode (Mode 1) for every prompt automatically, with no separate slash command needed.

### Pros

- **Dual mode** — auto-refines by default, and `/optimize` extracts the refined text for reuse or study when needed
- **Simple install** — just copy one `SKILL.md` file
- **Silent operation** — auto mode doesn't disrupt your workflow

### Cons

- **Claude Code only**
- **Opacity of auto mode** — silent auto-refinement can make it hard to track what changed (mitigated by manual mode)
- **Small repository** — thin community validation

### Setup Guide

Copy `SKILL.md` either globally (all projects) or per-project.

```bash
# Global install (Linux/macOS)
cp SKILL.md ~/.claude/skills/prompt-optimizer.md

# Per-project (Linux/macOS)
cp SKILL.md .claude/skills/prompt-optimizer.md
```

```powershell
# Windows (PowerShell) — global
Copy-Item SKILL.md "$env:USERPROFILE\.claude\skills\prompt-optimizer.md"
```

Activates automatically after installation. Invoke manual mode with `/optimize`.

Repo: `github.com/Hashaam101/prompt-optimizer`

---

## 5. nidhinjs/prompt-master

"A Claude skill that writes accurate prompts for every AI tool." Aims to eliminate the token/credit waste caused by re-prompting by producing an accurate prompt on the first try. It generates optimal prompts tailored to target tools including Claude, ChatGPT, Gemini, o1/o3, Cursor, Claude Code, GitHub Copilot, Windsurf, Bolt, v0, Lovable, Perplexity, Midjourney, DALL-E, Stable Diffusion, ComfyUI, Sora, Runway, ElevenLabs, Zapier, and Make.

Design philosophy: "The best prompt isn't the longest one — it's the one where every word is load-bearing." It views forgetting earlier decisions in long sessions as the biggest source of waste, and maintains memory blocks to preserve decisions across a session.

### Usage Example

```
Build a claude code prompt for a landing page for a business dashboard
that looks and feels exactly like notion - smooth animations, clean ui
```

-> Routes based on target (Claude Code), framework, and estimated token count, then outputs a production-quality spec. If Midjourney is the target, it generates image-tool-specific formatting such as comma-separated descriptors, lighting/mood anchoring, fixed aspect ratio/version, and negative prompts.

### Pros

- **Multi-tool routing** — automatically applies the optimal format per tool, from Claude to ChatGPT, Midjourney, and coding agents
- **Retains memory** — remembers in-session decisions, reducing re-prompt waste
- **Actively updated** — Opus 4.8 compatible (v1.7.0), version-aware routing (4.6/4.7/4.8), Prompt Decompiler mode, and other continuous updates

### Cons

- **Uses Claude as a "prompt generator"** — leans more toward generating prompts for other tools rather than directly improving Claude's own output
- **Requires Claude Code skill infrastructure** — needs a skill environment
- **Small repository** — thin community validation

### Setup Guide

```bash
mkdir -p ~/.claude/skills
git clone https://github.com/nidhinjs/prompt-master.git ~/.claude/skills/prompt-master
```

Once installed, the skill fires automatically when trigger conditions match. Templates in the references folder assist target-tool-specific output.

Repo: `github.com/nidhinjs/prompt-master`

---

## 6. Selection Guide

| Situation | Recommendation |
|---|---|
| Repeatedly generating structured prompts on claude.ai web/app or the API | **CheswickDEV 4.8** (register as a Project) |
| On-the-fly expansion of specific prompts in Claude Code | **johnpsasser** (`<optimize>` tag) |
| Heavy Claude Code user wanting fewer correction round-trips and better first-output quality | **severity1** (selective intervention) |
| Want auto-refinement plus manual extraction of the refined text in Claude Code | **Hashaam101** (dual mode) |
| Generating prompts for ChatGPT, Midjourney, and coding agents besides Claude, all in one place | **nidhinjs** (multi-tool) |
| Want to reference well-crafted prompt "examples" (not a tool) | Curated collections like `langgptai/awesome-claude-prompts` |

**Combination tip**: If your environment is Claude Code, keep a selective-intervention tool (severity1) always on, and run CheswickDEV 4.8 as a claude.ai Project separately when building formal prompt assets. For workflows where consistency of repeated output matters (e.g., structured reports, quantitative-analysis prompts), it's more stable to reference the optimizer's component framework or your own hand-built templates rather than a prompt collection.

---

## 7. General Cautions

- **Check model dependency** — tools tuned specifically for Opus 4.8 (like CheswickDEV) may have rules that don't fit other models.
- **Opacity of auto-firing tools** — auto mode/silent hooks can make it hard to track what changed, so pair them with a manual mode or transparency option that exposes the changes whenever possible.
- **Auth/token management** — hook-type tools handle OAuth tokens/API keys, so be careful about exposure via environment variables and shell profiles.
- **Repository trust** — check stars, commits, and issue activity, and always cross-reference install commands against each repo's latest README. The commands in this document reflect the time of writing.
- **Use alongside official guides** — don't rely solely on tools; cross-referencing Anthropic's official prompt engineering documentation (`docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview`) helps you better validate each tool's output.

---

*As of: 2026-06-21. Each project's features and setup instructions may change over time, so check the latest README in each repository.*
