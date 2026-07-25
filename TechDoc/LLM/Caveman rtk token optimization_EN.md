---
title: "caveman + rtk: A Complete Guide to AI Coding Assistant Token Optimization"
description: "A complete guide to caveman (output token compression) and rtk (input token / CLI output compression) — two open-source tools that cut AI coding assistant API costs by 80-95% when combined."
abstract: |
  As AI coding assistants become mainstream, API costs and context token consumption are a growing burden on
  developers. This guide covers two open-source projects addressing this from opposite directions: caveman, which
  strips unnecessary verbosity from LLM responses to cut output tokens by 65-75% while preserving 100% technical
  accuracy, and rtk (Rust Token Killer), a CLI proxy that filters and compresses command output before it reaches
  the LLM context, cutting input tokens by 60-90%. Since they operate on different layers (output vs. input),
  combining them yields a combined 80-95% reduction. The guide covers installation, compression-level configuration,
  before/after examples, integration into Claude Code and other tools, and a cost-savings calculator.
summary_for_ai: |
  Complete guide to two open-source LLM token optimization tools for AI coding assistants: caveman (71,000+ GitHub
  stars as of June 2026) and rtk/Rust Token Killer (42,000+ stars).
  caveman: strips unnecessary verbosity/pleasantries from LLM output while keeping code/URLs/paths byte-perfect,
  based on the March 2026 arXiv paper "Brevity Constraints Reverse Performance Hierarchies in Language Models"
  (2604.00025), which found brevity can improve benchmark accuracy by up to 26 percentage points. Cuts output tokens
  65-75% (range 22-87%), speeds responses ~3x, keeps technical accuracy at 100%. Four intensity levels: lite, full,
  ultra, wenyan (classical-Chinese style). Extra commands: /caveman-commit, /caveman-review, /caveman-stats,
  /caveman-compress. Only affects output tokens, not thinking/reasoning tokens — most effective in conversational,
  back-and-forth sessions rather than pure code generation. Supports 34+ AI coding tools (Claude Code, Codex, Gemini
  CLI, Cursor, Windsurf, Cline, GitHub Copilot, etc.).
  rtk (Rust Token Killer): a dependency-free single Rust binary CLI proxy that filters/compresses command output
  (git status, cargo test, grep, etc.) before it hits LLM context, cutting input tokens 60-90% with under 10ms
  overhead across 100+ supported commands. Four compression strategies: smart filtering (removes ANSI codes,
  progress bars, boilerplate), group aggregation, intelligent truncation, and deduplication. Example: `git status`
  drops from ~2,000 tokens to ~400. A 30-minute session example shows ~118,000 raw tokens reduced to ~23,900 (80%)
  across common commands (ls, cat, grep, git, npm test, pytest, go test, docker ps). Installed via Homebrew, a shell
  script, or Cargo; integrates with Claude Code via a PreToolUse hook (`rtk init -g --claude-md`), with `rtk gain`
  for savings stats.
  Combined pipeline: rtk optimizes input (CLI output before it reaches the LLM), caveman optimizes output (the LLM's
  response), yielding a combined 80-95% token reduction. Includes step-by-step combined setup instructions, an
  "OmniRoute Stacked mode" config for chaining both automatically, five real usage scenarios (test-failure debugging,
  code review, commit message generation, log summarization, dependency checks), and a cost calculator estimating
  monthly Claude Sonnet API costs for individual developers, a 10-person team, and enterprise pipelines with/without
  each tool.
date: 2026-06-20
author: "Dennis Kim"
lang: en
tags:
  - LLM
  - Token Optimization
  - AI Coding Assistant
  - Claude Code
  - Cost Optimization
keywords:
  - caveman token compression
  - rtk Rust Token Killer
  - LLM output token reduction
  - CLI output compression
  - Claude Code cost optimization
  - AI coding assistant token savings
featured: false
schema_type: TechArticle
draft: false
---

# caveman + rtk: A Complete Guide to AI Coding Assistant Token Optimization

> "Why use many token when few token do trick?" — caveman's slogan

---

## 1. Overview

As AI coding assistants become mainstream, API costs and context token consumption are becoming an increasingly heavy burden for developers. Against this backdrop, two innovative open-source projects have emerged.

**caveman** starts from the idea, "why use many token when few token do trick?" By nudging the AI to convey only the essentials without unnecessary phrasing, it cuts output tokens by roughly 65-75% while keeping technical accuracy at 100%. Since its April 2026 launch, it has drawn significant attention, surpassing 71,000 GitHub stars in a short period (as of June 2026).

**rtk (Rust Token Killer)** is a proxy tool that filters and compresses CLI command output in real time, cutting input token usage by 60-90% before it ever reaches the LLM context. Built as a single dependency-free Rust binary, it adds under 10ms of overhead and has surpassed 42,000 GitHub stars.

Because the two tools operate on different layers (input vs. output), the synergy from using them together is maximized.

---

## 2. caveman

### 2.1 Background

caveman was born out of a critical look at how AI's excessive verbosity and unnecessary phrasing impact cost and efficiency. A paper published on arXiv in March 2026 ("Brevity Constraints Reverse Performance Hierarchies in Language Models," 2604.00025) demonstrated that the shorter and more concise an AI's answer, the more its accuracy can actually improve on certain benchmarks — by as much as 26 percentage points. caveman is a practical implementation of this academic finding.

Claude is trained by default to respond in a friendly, verbose manner. That's an advantage in ordinary conversation, but a costly inefficiency in automated development pipelines. caveman changes this default, stripping away the natural-language wrapping while keeping technical information — code, URLs, file paths — byte-perfect.

### 2.2 Effects

| Item | Effect |
|------|------|
| Output token reduction | Average 65-75% (range 22-87%) |
| Response speed improvement | About 3x faster |
| Technical accuracy | 100% preserved |
| Input token reduction | About 46% when compressing config files like CLAUDE.md |
| Example API cost savings | Roughly $7,665/year saved at 10,000 API calls/day (based on Claude Sonnet) |

### 2.3 Compression Intensity Levels

caveman offers four adjustable intensity levels for different situations.

| Level | Description | Example |
|------|------|------|
| `lite` | Keeps grammar, removes unnecessary modifiers | "Your component re-renders because you create a new object reference each render." |
| `full` | Removes articles/greetings, condenses sentences | "New object ref each render. Inline object prop = new ref = re-render." |
| `ultra` | Maximum compression, keeps technical terms | "Inline obj prop → new ref → re-render. useMemo." |
| `wenyan` | Classical-Chinese literary style | "物出新參照，致重繪。useMemo Wrap之。" |

#### A Real Before/After Comparison

Normal response:
```
I've successfully completed the refactoring of the authentication module.
The changes include updating the token validation logic to handle edge cases
more gracefully, adding appropriate error handling, and ensuring backwards
compatibility with the existing API contracts.
```

After applying caveman `ultra`:
```
Auth module refactored. Token validation, error handling, backward compat.
```

The same information is conveyed with roughly 75% fewer tokens.

### 2.4 Additional Utility Commands

| Command | Function |
|--------|------|
| `/caveman-commit` | Generates a commit message under 50 characters |
| `/caveman-review` | Writes a one-line PR comment |
| `/caveman-stats` | Displays real-time token stats and cost |
| `/caveman-compress` | Compresses config files like CLAUDE.md |

### 2.5 Installation and Usage

**macOS / Linux / WSL**

```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
```

**Windows (PowerShell)**

```powershell
irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1 | iex
```

**Activating in Claude Code**

```bash
# Register the skill
claude skills add JuliusBrussee/caveman

# Basic activation
/caveman

# Activate with a specific intensity
/caveman ultra

# Deactivate
stop caveman
```

**Inserting directly into CLAUDE.md / AGENTS.md (system prompt method)**

```text
You are a code assistant. Respond in caveman speak only. No pleasantries.
No greetings, no sign-offs, no narration. Just the answer.
```

> Supported platforms: 34+ AI coding tools including Claude Code, Codex, Gemini CLI, Cursor, Windsurf, Cline, and GitHub Copilot

### 2.6 Caveats

caveman only affects **output tokens**. Thinking/reasoning tokens are unaffected. "Caveman no make brain smaller. Caveman make mouth smaller." As a result, it shows more pronounced benefits in conversational, back-and-forth sessions — chat, brainstorming, Q&A — than in sessions where code generation is the primary task.

---

## 3. rtk (Rust Token Killer)

### 3.1 Background

When an AI coding agent runs tests, linting, git commands, and similar operations, the resulting volume of logs and console output consumes an enormous number of input tokens. A single `git status`, for instance, can generate 2,000 tokens, and running `cargo test` can inject 200+ lines of raw output directly into the context window. The agent reads every single line of it.

rtk solves this by filtering and compressing command output at the stage before it reaches LLM context. It operates transparently with no change to your workflow.

### 3.2 Effects

| Item | Value |
|------|------|
| Token reduction rate | 60-90% |
| Supported commands | 100+ |
| Overhead | Under 10ms |
| Dependencies | None (single Rust binary) |
| GitHub stars | 42,000+ (as of June 2026) |
| License | Apache-2.0 |

### 3.3 Core Compression Strategies

rtk compresses output using four strategies:

1. **Smart Filtering**: removes ANSI codes, progress bars, comments, excessive whitespace, boilerplate
2. **Group Aggregation**: groups similar items (files by directory, errors by type, etc.)
3. **Intelligent Truncation**: keeps relevant context, removes redundancy
4. **Deduplication**: condenses repeated lines into a count

#### Before/After Comparison: `git status`

Normal output (~2,000 tokens):
```
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)

Changes not staged for commit:
  (use "git add <file>..." to update what will be staged)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/auth/token.ts

no changes added to commit (use "git add" and/or "git commit -a")
```

After rtk (~400 tokens):
```
main...origin/main ~ Modified: 1 files src/auth/token.ts
```

Everything except the information the LLM actually needs (branch, changed files) is removed.

### 3.4 Savings by Command (Based on a 30-Minute Session)

| Command | Runs | Raw tokens | With rtk | Reduction |
|--------|-----------|-----------|-----------|--------|
| `ls` / `tree` | 10 | 2,000 | 400 | 80% |
| `cat` / `read` | 20 | 40,000 | 12,000 | 70% |
| `grep` / `rg` | 8 | 16,000 | 3,200 | 80% |
| `git status` | 10 | 3,000 | 600 | 80% |
| `git diff` | 5 | 10,000 | 2,500 | 75% |
| `git add/commit/push` | 8 | 1,600 | 120 | 92% |
| `npm test` / `cargo test` | 5 | 25,000 | 2,500 | 90% |
| `pytest` | 4 | 8,000 | 800 | 90% |
| `go test` | 3 | 6,000 | 600 | 90% |
| `docker ps` | 3 | 900 | 180 | 80% |
| **Total** | — | **~118,000** | **~23,900** | **80%** |

### 3.5 Installation and Usage

**Homebrew (macOS, recommended)**

```bash
brew install rtk
```

**Direct install for Linux / macOS**

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh

# Add to PATH (for zsh)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Install via Cargo**

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

**Windows**: download `rtk-x86_64-pc-windows-msvc.zip` from the releases page and register `rtk.exe` in your PATH.

**Claude Code integration (automatic hooking)**

```bash
# Automatically install Claude Code's PreToolUse hook
rtk init -g --claude-md

# Verify installation
rtk --version

# Test operation
rtk git status
```

Running `rtk init -g` automatically adds a `PreToolUse` hook to `~/.claude/settings.json`, routing every Bash command through rtk. You never have to manually prefix commands with `rtk`.

**Checking savings stats**

```bash
# View cumulative savings stats and an ASCII graph
rtk gain

# Export daily JSON data
rtk gain --json

# Discover missed savings opportunities
rtk discover
```

**Custom configuration (`~/.config/rtk/config.toml`)**

```toml
[filters]
exclude_commands = ["echo", "pwd"]
tee_mode = true   # restore raw output on failure

[project.myapp]
extra_filters = ["*.lock"]
```

### 3.6 Caveats

Short commands can actually see a slight token *increase* when passed through rtk (due to rtk's header overhead). Already-structured short output is passed through as-is. Check actual savings with `rtk gain`, and if you don't see at least 10% savings after a week, consider removing it with `rtk init -g --uninstall`.

---

## 4. The caveman + rtk Combined Optimization Guide

### 4.1 The Combined Concept: Bidirectional Input + Output Optimization

Because the two tools operate on different layers, the effect is maximized when used together.

```
[Developer command]
     |
     v
[rtk CLI Proxy]  <-- filters/compresses command output (60-90% reduction) [input optimization]
     |
     v
[Sent to LLM]   (input token optimization complete)
     |
     v
[LLM processing]
     |
     v
[LLM response]
     |
     v
[caveman transformation]   <-- converts the response to be concise (65-75% reduction) [output optimization]
     |
     v
[Final compressed response]

Total reduction: 80-95%
```

| Tool | Role | Reduces |
|------|------|-----------|
| rtk | Compresses CLI output before it enters the LLM | Input tokens |
| caveman | Converts the LLM response into a concise form | Output tokens |

### 4.2 Combined Setup Instructions

**Step 1: Install caveman and register the skill**

```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
claude skills add JuliusBrussee/caveman
```

**Step 2: Install rtk and integrate with Claude Code**

```bash
brew install rtk          # macOS
rtk init -g --claude-md   # automatically installs the Claude Code PreToolUse hook
```

**Step 3: Add a session-start hook to `~/.claude/settings.json`**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "command": "echo 'RTK proxy active. Caveman mode ready.'"
      }
    ]
  }
}
```

**Step 4: Register shell aliases (optional, in `~/.zshrc` or `~/.bashrc`)**

```bash
# Automatically apply the rtk proxy
for cmd in git ls cat grep rg cargo npm pytest go docker kubectl; do
  alias $cmd="rtk $cmd"
done
```

**Step 5: caveman config file (create `.caveman.config` at the project root)**

```text
mode=ultra
exclude_files=Dockerfile,*.log
always_compress_tokens=true
```

### 4.3 Advanced: OmniRoute Stacked Mode

OmniRoute is a tool that chains multiple LLM optimization engines into a unified pipeline. Connecting caveman + rtk in Stacked mode lets both tools run automatically in sequence from a single configuration.

```json
{
  "compression": {
    "mode": "stacked",
    "pipeline": ["rtk", "caveman"],
    "caveman_intensity": "ultra",
    "rtk_filters_path": ".rtk/filters.json"
  }
}
```

### 4.4 Summary of Savings

| Configuration | Reduction | Target |
|------|--------|-----------|
| rtk alone | 60-90% | Command output (input tokens) |
| caveman alone | 65-75% | LLM response (output tokens) |
| rtk + caveman combined | **80-95%** | Both input and output |

### 4.5 Example Commands by Real-World Scenario

**Scenario 1: Debugging a test failure**

```bash
# rtk extracts only the failing tests, caveman returns a concise analysis
rtk cargo test
# Example caveman response: "3 tests fail: auth::token_expired, db::conn_timeout, api::rate_limit. See logs."
```

**Scenario 2: Requesting a code review**

```bash
# rtk compresses the diff, caveman returns the review in one line
rtk git diff HEAD~1
/caveman-review
# Example response: "Missing null check in token.ts:42. Add early return."
```

**Scenario 3: Generating a commit message**

```bash
rtk git status
/caveman-commit
# Example response: "fix: null check in token validation"
```

**Scenario 4: Summarizing a long log**

```bash
rtk grep "ERROR" app.log
# Example caveman ultra response: "14 errors: 11x DB timeout, 3x auth fail. Peak 14:30-15:00."
```

**Scenario 5: Checking dependencies**

```bash
rtk npm list --depth=0
# rtk removes redundant/unnecessary information and delivers only the core package list
```

### 4.6 Real User Experience

Users combining both tools report consistent results. Claude Code context that used to be exhausted within a 30-minute session has been extended to 3+ hours, with the effect especially pronounced in environments with heavy repetitive CLI work — test-driven development, large-scale git history exploration, and similar workflows.

---

## 5. Cost Savings Calculator (Quick Estimate)

Based on Claude Sonnet pricing (early 2026, $3/million input tokens, $15/million output tokens):

| Scenario | Monthly cost (before optimization) | After caveman | After rtk | Both combined |
|------|---------------------|-----------------|-------------|--------------|
| Individual developer (small) | $50 | ~$17 | ~$15 | ~$5-10 |
| Team of 10 (medium) | $2,500 | ~$800 | ~$500 | ~$125-250 |
| Enterprise pipeline | $10,000+ | ~$3,000 | ~$2,000 | ~$500-1,000 |

> Actual savings vary by task type, LLM model, and usage patterns. Check your measured values with `rtk gain` and `/caveman-stats`.

---

## 6. Closing Thoughts

caveman and rtk each approach LLM cost optimization in their own distinct way. caveman specializes in **output optimization**, rtk in **input optimization**, making the two tools perfectly complementary.

The core principle is simple: an LLM's defaults are optimized for **human-friendly responses**, not cost efficiency. caveman changes the response style, and rtk removes context noise. Together, these two tools let you run AI coding assistants in a way that's cheaper, faster, and more focused.

---

## 7. References

| Item | Link |
|------|------|
| caveman GitHub | https://github.com/JuliusBrussee/caveman |
| rtk GitHub | https://github.com/rtk-ai/rtk |
| rtk official site | https://www.rtk-ai.app |
| arXiv paper (2604.00025) | https://arxiv.org/abs/2604.00025 |
| Claude Plugin Hub - caveman | https://www.claudepluginhub.com/plugins/juliusbrussee-caveman |

> GitHub star counts and figures are as of June 2026; these projects continue to evolve. Refer to each repository's official documentation for the latest information.
