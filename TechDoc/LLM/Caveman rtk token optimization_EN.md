---
title: "caveman + rtk: The Complete AI Coding Assistant Token Optimization Guide"
description: "How two open-source projects, caveman and rtk, cut AI coding assistant token usage by 80-95% combined."
lang: en
featured: false
schema_type: TechArticle
keywords:
  - caveman
  - rtk
  - token optimization
  - Claude Code
  - LLM cost reduction
tags:
  - LLM
  - Claude Code
  - Cost Optimization
  - CLI Tools
---

# caveman + rtk: The Complete AI Coding Assistant Token Optimization Guide

> "Why use many token when few token do trick?" — the caveman slogan

---

## 1. Overview

As AI coding assistants become mainstream, API costs and context token consumption are becoming an ever-larger burden for developers. Against this backdrop, two innovative open-source projects have emerged.

**caveman** started from the idea, "why use many token when few token do trick?" It nudges the AI to convey only the essentials without unnecessary phrasing, cutting output tokens by roughly 65-75% while keeping technical accuracy at 100%. Since its April 2026 release, it quickly gained attention, surpassing 71,000 GitHub stars (as of June 2026).

rtk (Rust Token Killer) is a proxy tool that filters and compresses CLI command output in real time, reducing input token usage by 60-90% before it ever reaches the LLM's context. Built as a single dependency-free Rust binary with under 10ms of overhead, it has over 42,000 GitHub stars.

Because the two tools operate on different layers (input/output), using them together maximizes the synergy.

---

## 2. caveman

### 2.1 Background

caveman was born from a critical look at how AI's excessive verbosity and unnecessary phrasing affect cost and efficiency. A paper published on arXiv in March 2026 ("Brevity Constraints Reverse Performance Hierarchies in Language Models," number 2604.00025) demonstrated that the shorter and more concise an AI's answer, the more its accuracy can actually improve — by as much as 26 percentage points on certain benchmarks. caveman is the practical implementation of this academic finding.

Claude is trained by default to respond in a friendly, verbose manner. That's an advantage in casual conversation, but a costly inefficiency in automated development pipelines. caveman changes this default, stripping away the natural-language wrapping while keeping technical information — code, URLs, file paths — byte-perfect.

### 2.2 Effects

| Item | Effect |
|------|------|
| Output token reduction | Average 65-75% (range 22-87%) |
| Response speed improvement | About 3x faster |
| Technical accuracy | 100% maintained |
| Input token reduction | ~46% when compressing config files like CLAUDE.md |
| Example API cost savings | ~$7,665/year saved at 10,000 API calls/day (based on Claude Sonnet) |

### 2.3 Compression Intensity Levels

caveman offers four adjustable intensity levels to fit different situations.

| Level | Description | Example |
|------|------|------|
| `lite` | Preserves grammar, removes unnecessary modifiers | "Your component re-renders because you create a new object reference each render." |
| `full` | Removes articles/greetings, condenses sentences | "New object ref each render. Inline object prop = new ref = re-render." |
| `ultra` | Maximum compression, keeps technical terms | "Inline obj prop -> new ref -> re-render. useMemo." |
| `wenyan` | Classical Chinese style | "物出新參照，致重繪。useMemo Wrap之。" |

#### Real Comparison Example

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
| `/caveman-stats` | Shows real-time token statistics and cost |
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

**Inserting directly into CLAUDE.md / AGENTS.md (system prompt approach)**

```text
You are a code assistant. Respond in caveman speak only. No pleasantries.
No greetings, no sign-offs, no narration. Just the answer.
```

> Supported platforms: 34+ AI coding tools including Claude Code, Codex, Gemini CLI, Cursor, Windsurf, Cline, and GitHub Copilot

### 2.6 Caveats

caveman only affects **output tokens**. Thinking/reasoning tokens are unaffected. "Caveman no make brain smaller. Caveman make mouth smaller." Accordingly, its benefits stand out more in conversational, brainstorming, and Q&A-heavy sessions than in tasks primarily focused on code generation.

---

## 3. rtk (Rust Token Killer)

### 3.1 Background

When AI coding agents run tests, linting, git commands, and similar operations, the massive volume of logs and console output generated consumes enormous input tokens. For example, a single `git status` alone can produce 2,000 tokens, and running `cargo test` injects 200+ lines of raw output directly into the context window. The agent reads every single line of it.

rtk solves this by filtering and compressing command output before it reaches the LLM's context, operating transparently with no workflow changes required.

### 3.2 Effects

| Item | Value |
|------|------|
| Token reduction rate | 60-90% |
| Supported commands | 100+ |
| Overhead | Under 10ms |
| Dependencies | None (single Rust binary) |
| GitHub stars | 42,000+ (June 2026) |
| License | Apache-2.0 |

### 3.3 Core Compression Strategies

rtk compresses output using four strategies:

1. **Smart Filtering**: removes ANSI codes, progress bars, comments, excessive whitespace, and boilerplate
2. **Group Aggregation**: groups similar items (files by directory, errors by type, etc.)
3. **Intelligent Truncation**: keeps relevant context, removes duplication
4. **Deduplication**: collapses repeated lines into counts

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

Only the information the LLM actually needs (branch, changed files) remains; everything else is removed.

### 3.4 Savings by Command (30-Minute Session Basis)

| Command | Executions | Normal tokens | With rtk | Reduction |
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

**Direct Install on Linux / macOS**

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh

# add to PATH (zsh example)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Install via Cargo**

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

**Windows**: download `rtk-x86_64-pc-windows-msvc.zip` from the releases page and add `rtk.exe` to PATH.

**Claude Code Integration (automatic hooking)**

```bash
# Automatically install Claude Code's PreToolUse hook
rtk init -g --claude-md

# Verify installation
rtk --version

# Test operation
rtk git status
```

Running `rtk init -g` automatically adds a `PreToolUse` hook to `~/.claude/settings.json`, routing all Bash commands through rtk. You don't need to manually prefix commands with `rtk`.

**Checking Savings Statistics**

```bash
# View cumulative savings statistics and an ASCII chart
rtk gain

# Export daily statistics as JSON
rtk gain --json

# Discover missed savings opportunities
rtk discover
```

**Custom Configuration (`~/.config/rtk/config.toml`)**

```toml
[filters]
exclude_commands = ["echo", "pwd"]
tee_mode = true   # restore original output on failure

[project.myapp]
extra_filters = ["*.lock"]
```

### 3.6 Caveats

Very short commands may actually see a slight token increase after going through rtk (rtk header overhead). Already-structured short output passes through unmodified. Check actual savings with `rtk gain`, and if savings remain below 10% after a week, consider removing it with `rtk init -g --uninstall`.

---

## 4. Combined caveman + rtk Optimization Guide

### 4.1 The Combined Concept: Bidirectional Input + Output Optimization

Because the two tools operate on different layers, using them together maximizes their effect.

```
[Developer command]
     |
     v
[rtk CLI Proxy]  <-- filters/compresses command output (60-90% reduction) [input optimization]
     |
     v
[Sent to LLM]   (input tokens already optimized)
     |
     v
[LLM processing]
     |
     v
[LLM response]
     |
     v
[caveman transformation]   <-- makes the response concise (65-75% reduction) [output optimization]
     |
     v
[Final compressed response]

Overall reduction: 80-95%
```

| Tool | Role | Target |
|------|------|-----------|
| rtk | Compresses CLI output before it reaches the LLM | Input tokens |
| caveman | Transforms the LLM's response into concise form | Output tokens |

### 4.2 Combined Setup

**Step 1: Install caveman and register the skill**

```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
claude skills add JuliusBrussee/caveman
```

**Step 2: Install rtk and hook it into Claude Code**

```bash
brew install rtk          # macOS
rtk init -g --claude-md   # auto-install Claude Code's PreToolUse hook
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

**Step 4: Register shell aliases (optional, `~/.zshrc` or `~/.bashrc`)**

```bash
# Automatically apply the rtk proxy
for cmd in git ls cat grep rg cargo npm pytest go docker kubectl; do
  alias $cmd="rtk $cmd"
done
```

**Step 5: caveman config file (create `.caveman.config` in your project root)**

```text
mode=ultra
exclude_files=Dockerfile,*.log
always_compress_tokens=true
```

### 4.3 Advanced: OmniRoute Stacked Mode

OmniRoute is a tool that bundles multiple LLM optimization engines into a unified pipeline. Chaining caveman + rtk in Stacked mode lets both tools run automatically in sequence with a single configuration.

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

| Setup | Reduction | Target |
|------|--------|-----------|
| rtk alone | 60-90% | Command output (input tokens) |
| caveman alone | 65-75% | LLM response (output tokens) |
| rtk + caveman combined | **80-95%** | Both input and output |

### 4.5 Example Commands by Real-World Scenario

**Scenario 1: Debugging test failures**

```bash
# rtk extracts only failed tests, caveman returns a concise analysis
rtk cargo test
# example caveman response: "3 tests fail: auth::token_expired, db::conn_timeout, api::rate_limit. See logs."
```

**Scenario 2: Requesting a code review**

```bash
# rtk compresses the diff, caveman returns the review in one line
rtk git diff HEAD~1
/caveman-review
# example response: "Missing null check in token.ts:42. Add early return."
```

**Scenario 3: Generating a commit message**

```bash
rtk git status
/caveman-commit
# example response: "fix: null check in token validation"
```

**Scenario 4: Summarizing long logs**

```bash
rtk grep "ERROR" app.log
# example caveman ultra response: "14 errors: 11x DB timeout, 3x auth fail. Peak 14:30-15:00."
```

**Scenario 5: Checking dependencies**

```bash
rtk npm list --depth=0
# rtk removes duplicate/unnecessary info and delivers only the key package list
```

### 4.6 Real User Experiences

Users who combined the two tools consistently report similar effects. Claude Code contexts that used to run out within a 30-minute session have been extended to 3+ hours, with the effect particularly pronounced in environments with heavy repetitive CLI work (test-driven development, browsing large git histories, etc.).

---

## 5. Cost Savings Calculator (Quick Estimate)

Based on Claude Sonnet (early 2026, input $3/million tokens, output $15/million tokens):

| Condition | Monthly cost (before optimization) | After caveman | After rtk | Combined |
|------|---------------------|-----------------|-------------|--------------|
| Individual developer (small) | $50 | ~$17 | ~$15 | ~$5-10 |
| Team of 10 (medium) | $2,500 | ~$800 | ~$500 | ~$125-250 |
| Enterprise pipeline | $10,000+ | ~$3,000 | ~$2,000 | ~$500-1,000 |

> Actual savings vary by task type, LLM model, and usage patterns. Check your real measurements with `rtk gain` and `/caveman-stats`.

---

## 6. Closing

caveman and rtk each take a distinct approach to LLM cost optimization. caveman specializes in **output optimization**, rtk in **input optimization**, making the two tools perfectly complementary.

The core principle is simple. An LLM's defaults are optimized for **human-friendly responses**, not cost efficiency. caveman changes the response style; rtk removes context noise. Together, they let you use AI coding assistants more cheaply, faster, and with sharper focus.

---

## 7. References

| Item | Link |
|------|------|
| caveman GitHub | https://github.com/JuliusBrussee/caveman |
| rtk GitHub | https://github.com/rtk-ai/rtk |
| rtk official site | https://www.rtk-ai.app |
| arXiv paper (2604.00025) | https://arxiv.org/abs/2604.00025 |
| Claude Plugin Hub - caveman | https://www.claudepluginhub.com/plugins/juliusbrussee-caveman |

> GitHub star counts and figures are as of June 2026; the projects continue to evolve. Refer to each repository's official documentation for the latest information.
