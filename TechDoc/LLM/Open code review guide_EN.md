---
title: "Open Code Review (OCR) — Complete Guide"
description: "A hybrid AI code review CLI open-sourced by Alibaba Group after two years of internal validation."
lang: en
featured: false
schema_type: TechArticle
keywords:
  - Open Code Review
  - AI code review
  - Alibaba
  - CI/CD
  - Claude Code
tags:
  - Code Review
  - AI Tools
  - CI/CD
  - LLM
---

# Open Code Review (OCR) — Complete Guide

> A hybrid AI code review CLI open-sourced by Alibaba Group after two years of internal validation
> Apache 2.0 | GitHub: [alibaba/open-code-review](https://github.com/alibaba/open-code-review)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Details](#2-architecture-details)
3. [Installation](#3-installation)
4. [LLM Setup — Cloud APIs](#4-llm-setup--cloud-apis)
5. [LLM Setup — Local Models (DeepSeek / Qwen / Ollama)](#5-llm-setup--local-models-deepseek--qwen--ollama)
6. [Basic Usage and Command Reference](#6-basic-usage-and-command-reference)
7. [Customizing Review Rules](#7-customizing-review-rules)
8. [CI/CD Integration](#8-cicd-integration)
9. [AI Agent Integration (Claude Code / Codex)](#9-ai-agent-integration-claude-code--codex)
10. [Full Configuration Reference](#10-full-configuration-reference)
11. [Pros and Cons Analysis](#11-pros-and-cons-analysis)
12. [Model Selection Guide](#12-model-selection-guide)
13. [Team Fit](#13-team-fit)

---

## 1. Project Overview

Open Code Review (OCR) is a CLI project born from Alibaba Group open-sourcing its AI code review tool after running and validating it internally for two years. During that internal period, more than 20,000 developers used it, detecting over 1 million code defects. It reads git diffs, sends the changed files to a configured LLM, and generates line-level, precise review comments.

Its core design philosophy is a hybrid architecture of "Deterministic Engineering + LLM Agent." Processing stages that must be accurate are handled by engineering logic, while only the parts requiring dynamic judgment are delegated to an LLM agent.

| Metric | Value |
|---|---|
| Internal usage period | 2 years |
| Cumulative developers | 20,000+ |
| Cumulative defects detected | 1,000,000+ |
| Token savings vs. pure LLM | ~80% |
| F1 performance improvement | 26.1% |
| License | Apache 2.0 |

---

## 2. Architecture Details

### Limitations of General AI Agents

Using Claude Code or a general-purpose agent directly for code review repeatedly runs into these problems:

- **Incomplete coverage**: on PRs with many changed files, some files get arbitrarily skipped.
- **Position drift**: the line number or file reference reported for an issue is misaligned with reality.
- **Quality instability**: minor variations in the prompt cause large swings in review quality.

OCR solves these three problems at the architecture level.

### Deterministic Engineering Layer

Steps that must be accurate are guaranteed by engineering logic, not the LLM.

| Feature | Description |
|---|---|
| Precise file selection | Precisely determines files to review and filters out unnecessary ones. Prevents omission of important changes |
| Smart file bundling | Groups related files into a single review unit (e.g., `message_en.properties` + `message_zh.properties`). Each bundle runs as a subagent with an independent context |
| Fine-grained rule matching | Matches review rules to each file's characteristics. Removes information noise and improves model focus |
| Position correction module | An independent comment-positioning and reflection module that systematically improves both the positional and content accuracy of AI feedback |

### LLM Agent Layer

Handles parts requiring dynamic judgment and context retrieval.

- Scenario-specific prompt templates optimized for code review
- A specialized toolset built from analyzing tool-call traces across large-scale production data
- Real-time codebase search, reading full file contents, cross-referencing other changed files

---

## 3. Installation

### NPM (Recommended)

```bash
npm install -g @alibaba-group/open-code-review
```

After installation, the `ocr` command becomes globally available.

### Direct Binary Download

```bash
# macOS (Apple Silicon / M1~M4)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-darwin-arm64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# macOS (Intel)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-darwin-amd64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# Linux (x86_64)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-linux-amd64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# Linux (ARM64)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-linux-arm64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr
```

### Build from Source

```bash
git clone https://github.com/alibaba/open-code-review.git
cd open-code-review
make build
sudo cp dist/opencodereview /usr/local/bin/ocr
```

---

## 4. LLM Setup — Cloud APIs

OCR supports both OpenAI-compatible endpoints and the native Anthropic API. Configuration is stored at `~/.opencodereview/config.json`. Environment variables take precedence over the config file.

### Anthropic (Claude)

```bash
ocr config set llm.url https://api.anthropic.com/v1/messages
ocr config set llm.auth_token sk-ant-xxxxxxx
ocr config set llm.model claude-opus-4-6
ocr config set llm.use_anthropic true
```

Claude Code users don't need any additional setup, since the `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, and `ANTHROPIC_MODEL` environment variables are automatically picked up from `~/.zshrc` or `~/.bashrc`.

Recommended models:

| Model | Use case |
|---|---|
| `claude-opus-4-6` | Highest-quality reviews, complex architecture analysis |
| `claude-sonnet-4-6` | Cost/performance balance, everyday PR reviews |

### OpenAI (ChatGPT)

```bash
ocr config set llm.url https://api.openai.com/v1/chat/completions
ocr config set llm.auth_token sk-xxxxxxx
ocr config set llm.model gpt-4o
ocr config set llm.use_anthropic false
```

Recommended models:

| Model | Use case |
|---|---|
| `gpt-4o` | Default recommendation for code review |
| `o3` | Complex security vulnerability analysis |
| `gpt-4.1-mini` | Cost-constrained environments |

### DeepSeek Cloud API

Since DeepSeek offers an OpenAI-compatible API, set `use_anthropic` to false.

```bash
ocr config set llm.url https://api.deepseek.com/v1/chat/completions
ocr config set llm.auth_token sk-xxxxxxx
ocr config set llm.model deepseek-coder
ocr config set llm.use_anthropic false
```

Recommended models:

| Model | Characteristics |
|---|---|
| `deepseek-coder` | Code-specialized, excellent cost efficiency |
| `deepseek-reasoner` | Strong at complex logic analysis and reasoning |

### Alibaba DashScope (Qwen Cloud)

```bash
ocr config set llm.url https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
ocr config set llm.auth_token sk-xxxxxxx
ocr config set llm.model qwen-coder-turbo
ocr config set llm.use_anthropic false
```

---

## 5. LLM Setup — Local Models (DeepSeek / Qwen / Ollama)

Using a local LLM ensures complete data privacy since code is never sent to an external API. OCR supports any runtime (Ollama, LM Studio, vLLM, etc.) that exposes an OpenAI-compatible endpoint locally.

### 5-1. Ollama-Based Setup (General Purpose)

Ollama is the simplest way to run a local LLM. After installation, it automatically exposes an OpenAI-compatible endpoint at `http://localhost:11434`.

```bash
# Install Ollama (macOS)
brew install ollama

# Install Ollama (Linux)
curl -fsSL https://ollama.com/install.sh | sh

# Start server in background
ollama serve &
```

Connecting OCR to Ollama:

```bash
ocr config set llm.url http://localhost:11434/v1/chat/completions
ocr config set llm.auth_token ollama
ocr config set llm.model qwen2.5-coder:32b
ocr config set llm.use_anthropic false
```

> The `auth_token` value can be any arbitrary string. Ollama doesn't verify tokens locally.

### 5-2. Running DeepSeek Locally

#### Running DeepSeek via Ollama

```bash
# DeepSeek-R1 (reasoning-focused, good fit for code review)
ollama pull deepseek-r1:14b    # ~9GB VRAM
ollama pull deepseek-r1:32b    # ~20GB VRAM
ollama pull deepseek-r1:70b    # ~48GB+ VRAM

# DeepSeek Coder V2 (code-specialized)
ollama pull deepseek-coder-v2:16b    # ~10GB VRAM
ollama pull deepseek-coder-v2:236b   # ~130GB VRAM, highest quality

# Expand context window (essential for agentic workflows)
ollama run deepseek-r1:14b
>>> /set parameter num_ctx 32768
>>> /save deepseek-r1-14b-32k
```

OCR configuration:

```bash
ocr config set llm.url http://localhost:11434/v1/chat/completions
ocr config set llm.auth_token ollama
ocr config set llm.model deepseek-r1:14b
ocr config set llm.use_anthropic false
```

#### Running DeepSeek via vLLM (High-Performance GPU Server)

```bash
docker pull vllm/vllm-openai:latest

# DeepSeek-R1 14B (requires ~30GB VRAM)
docker run --runtime nvidia --gpus all \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  -p 8000:8000 \
  vllm/vllm-openai:latest \
  --model deepseek-ai/DeepSeek-R1-Distill-Qwen-14B \
  --tensor-parallel-size 1
```

OCR configuration:

```bash
ocr config set llm.url http://localhost:8000/v1/chat/completions
ocr config set llm.auth_token vllm
ocr config set llm.model deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
ocr config set llm.use_anthropic false
```

#### Running DeepSeek via LM Studio (GUI Environment)

1. Install LM Studio from [lmstudio.ai](https://lmstudio.ai)
2. Search for `deepseek-r1` in the "Discover" tab and download your preferred size
3. Start the server from the "Local Server" tab (default port: 1234)

OCR configuration:

```bash
ocr config set llm.url http://localhost:1234/v1/chat/completions
ocr config set llm.auth_token lm-studio
ocr config set llm.model deepseek-r1-distill-qwen-14b
ocr config set llm.use_anthropic false
```

### 5-3. Running Qwen (Qwen2.5-Coder / Qwen3) Locally

The Qwen series demonstrates top-tier open-source performance for code generation and review. Qwen2.5-Coder 32B in particular achieves 92.1% on HumanEval, surpassing Claude Sonnet 4.6 (89.4%).

```bash
# Qwen2.5-Coder (code-specialized — top pick for code review)
ollama pull qwen2.5-coder:7b     # ~5GB VRAM, fast response
ollama pull qwen2.5-coder:14b    # ~9GB VRAM, balanced
ollama pull qwen2.5-coder:32b    # ~20GB VRAM, highest quality

# Qwen3 (latest general-purpose model, released February 2026)
ollama pull qwen3:8b
ollama pull qwen3:32b

# Expand context window (for models supporting 256K)
ollama run qwen2.5-coder:32b
>>> /set parameter num_ctx 32768
>>> /save qwen2.5-coder-32b-32k
```

OCR configuration:

```bash
ocr config set llm.url http://localhost:11434/v1/chat/completions
ocr config set llm.auth_token ollama
ocr config set llm.model qwen2.5-coder:32b
ocr config set llm.use_anthropic false
```

### 5-4. Local LLM Hardware Requirements

| Model | VRAM | Speed (tokens/sec) | Recommended use |
|---|---|---|---|
| DeepSeek-R1 14B | 9GB | 25-40 | Personal developer laptop, strong reasoning |
| Qwen2.5-Coder 7B | 5GB | 40-60 | Lightweight environments, fast PR reviews |
| Qwen2.5-Coder 14B | 9GB | 25-35 | Recommended for balance |
| Qwen2.5-Coder 32B | 20GB | 15-25 | High-quality code review, enterprise |
| DeepSeek-R1 32B | 20GB | 10-18 | Complex security analysis |
| DeepSeek Coder V2 236B | 130GB+ | 8-12 | Highest quality, GPU server only |

> Q4 quantization reduces VRAM usage by about 60% with only about 2% quality loss. Ollama applies quantization automatically when pulling a model.

### 5-5. Testing the Connection

```bash
# Verify LLM connection (works for both cloud and local)
ocr llm test
```

---

## 6. Basic Usage and Command Reference

### Main Review Commands

```bash
# Review current changes (staged + unstaged + untracked, all)
ocr review

# Compare between branches
ocr review --from main --to feature-auth

# Review a specific commit
ocr review --commit abc123

# Preview files to be reviewed without calling the LLM
ocr review --preview
ocr review --commit abc123 --preview

# JSON output (for CI/CD pipelines, script parsing)
ocr review --format json --audience agent

# Apply a custom rule file
ocr review --rule /path/to/my-rules.json

# Adjust concurrent review file count
ocr review --from main --to my-feature --concurrency 4
```

### Full Command List

| Command | Alias | Description |
|---|---|---|
| `ocr review` | `ocr r` | Start code review |
| `ocr rules check <file>` | — | Preview which rules apply to that file |
| `ocr config set <key> <value>` | — | Change a config value |
| `ocr llm test` | — | Test LLM connection |
| `ocr viewer` | `ocr v` | Launch browser-based session viewer (`localhost:5483`) |
| `ocr version` | — | Print version info |

### Key `ocr review` Flags

| Flag | Default | Description |
|---|---|---|
| `--repo` | Current directory | Git repository root path |
| `--from` | — | Comparison base ref (e.g., `main`) |
| `--to` | — | Comparison target ref (e.g., `feature-branch`) |
| `--commit`, `-c` | — | Review a single commit |
| `--preview`, `-p` | `false` | Preview files to review without calling the LLM |
| `--format`, `-f` | `text` | Output format: `text` or `json` |
| `--concurrency` | `8` | Max number of files reviewed concurrently |
| `--timeout` | `10` | Timeout for concurrent tasks (minutes) |
| `--audience` | `human` | `human` (shows progress) / `agent` (summary only) |
| `--rule` | — | Path to a custom review rule JSON file |
| `--max-tools` | Built-in default | Max tool calls per file |
| `--tools` | — | Path to a custom tool configuration JSON file |

---

## 7. Customizing Review Rules

OCR applies rules using a 4-tier priority system. At each tier, the first matching rule for a file path is applied; if there's no match, it falls through to the next tier.

| Priority | Source | Path | Description |
|---|---|---|---|
| 1 (highest) | `--rule` flag | user-specified path | explicit CLI override |
| 2 | Project config | `<repoDir>/.opencodereview/rule.json` | project-specific rules, committable to git |
| 3 | Global config | `~/.opencodereview/rule.json` | personal global settings |
| 4 (lowest) | System default | built-in `system_rules.json` | common rules like NPE, XSS, SQL Injection |

### Rule File Format

```json
{
  "rules": [
    {
      "path": "src/main/java/**/*.java",
      "rule": "All required parameters in new methods must be validated for null values"
    },
    {
      "path": "**/*mapper*.xml",
      "rule": "Check for SQL Injection risks, parameter errors, and missing closing tags"
    },
    {
      "path": "src/**/*.{ts,tsx}",
      "rule": "Check for missing error handling in async functions and Promise chains"
    }
  ]
}
```

- `path` supports `**` recursive matching and `{java,kt}` brace expansion.
- Within each layer, rules are evaluated in declaration order; the first match applies.
- If a rule file doesn't exist, it's silently skipped.

Preview which rules apply to a specific file:

```bash
ocr rules check src/main/java/com/example/UserService.java
ocr rules check --rule custom.json src/main/resources/mapper/UserMapper.xml
```

---

## 8. CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/code-review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install OCR
        run: npm install -g @alibaba-group/open-code-review

      - name: Run Code Review
        env:
          OCR_LLM_URL: https://api.anthropic.com/v1/messages
          OCR_LLM_TOKEN: ${{ secrets.ANTHROPIC_API_KEY }}
          OCR_LLM_MODEL: claude-sonnet-4-6
          OCR_USE_ANTHROPIC: "true"
        run: |
          ocr review \
            --from "origin/${{ github.base_ref }}" \
            --to "origin/${{ github.head_ref }}" \
            --format json \
            --audience agent
```

### GitLab CI

```yaml
# .gitlab-ci.yml
code-review:
  stage: test
  image: node:20
  before_script:
    - npm install -g @alibaba-group/open-code-review
  script:
    - ocr review
        --from "origin/${CI_MERGE_REQUEST_TARGET_BRANCH_NAME}"
        --to "origin/${CI_MERGE_REQUEST_SOURCE_BRANCH_NAME}"
        --format json
        --audience agent
  variables:
    OCR_LLM_URL: "https://api.openai.com/v1/chat/completions"
    OCR_LLM_TOKEN: $OPENAI_API_KEY
    OCR_LLM_MODEL: "gpt-4o"
    OCR_USE_ANTHROPIC: "false"
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

### Generic CI Script Pattern

```bash
ocr review \
  --from "origin/main" \
  --to "origin/feature-branch" \
  --format json \
  --audience agent
```

The combination of `--format json` + `--audience agent` returns structured output that's parseable in CI scripts. It's also published as an Action on the GitHub Marketplace.

---

## 9. AI Agent Integration (Claude Code / Codex)

Integrating OCR as a slash command in an AI coding agent lets you run code reviews directly within the agent's workflow.

### Method 1: Install as a Skill

```bash
npx skills add alibaba/open-code-review --skill open-code-review
```

The coding agent learns how to call `ocr`, prioritize issues, and use auto-fix options.

### Method 2: Install as a Claude Code Plugin

Run the following inside Claude Code:

```
/plugin marketplace add alibaba/open-code-review
/plugin install open-code-review@open-code-review
```

After installation, run OCR via the `/open-code-review:review` slash command, which also handles automatic issue filtering and fixes.

### Method 3: Directly Copy the Command File

The fastest way to set up without a package manager.

```bash
# Per-project (shared with team, git-committable)
mkdir -p .claude/commands
curl -o .claude/commands/open-code-review.md \
  https://raw.githubusercontent.com/alibaba/open-code-review/main/plugins/open-code-review/commands/review.md

# Per-user (personal use across all projects)
mkdir -p ~/.claude/commands
curl -o ~/.claude/commands/open-code-review.md \
  https://raw.githubusercontent.com/alibaba/open-code-review/main/plugins/open-code-review/commands/review.md
```

### OpenAI Codex Integration

```bash
# Install from Codex's plugin marketplace
codex plugin marketplace add alibaba/open-code-review
codex /plugins
```

After installation, use it in Codex like this:

```
@Open Code Review review my current changes
@Open Code Review review this branch against main
@Open Code Review review and fix high-confidence issues
```

> Prerequisite for all integration methods: the `ocr` CLI must be installed and the LLM configured. OCR's internal LLM backend operates independently regardless of the agent integration method.

---

## 10. Full Configuration Reference

Config file path: `~/.opencodereview/config.json`

### Configuration Keys

| Key | Type | Example | Description |
|---|---|---|---|
| `llm.url` | string | `https://api.openai.com/v1/chat/completions` | LLM API endpoint |
| `llm.auth_token` | string | `sk-xxxxxxx` | API key / auth token |
| `llm.model` | string | `claude-opus-4-6` | Model name |
| `llm.use_anthropic` | boolean | `true` / `false` | Whether to use the native Anthropic API |
| `language` | string | `English` / `Chinese` | Review output language (default: Chinese) |
| `telemetry.enabled` | boolean | `true` / `false` | Enable telemetry |
| `telemetry.exporter` | string | `console` / `otlp` | Telemetry export method |
| `telemetry.otlp_endpoint` | string | `localhost:4317` | OTLP collector address |
| `telemetry.content_logging` | boolean | — | Whether to include LLM prompts in telemetry |

### Environment Variables

Environment variables take precedence over the config file.

| Variable | Description |
|---|---|
| `OCR_LLM_URL` | LLM API endpoint URL |
| `OCR_LLM_TOKEN` | API key / auth token |
| `OCR_LLM_MODEL` | Model name |
| `OCR_USE_ANTHROPIC` | `true` = Anthropic, `false` = OpenAI-compatible |

Claude Code environment variables (`ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_MODEL`) are also picked up automatically.

### Changing the Review Output Language

The default output language is Chinese. To change it to Korean or English:

```bash
ocr config set language English
# or
ocr config set language Korean
```

### Telemetry Configuration (OpenTelemetry)

```bash
ocr config set telemetry.enabled true
ocr config set telemetry.exporter otlp
ocr config set telemetry.otlp_endpoint localhost:4317
```

Enabling `telemetry.content_logging` includes LLM prompts and responses in the exported data. Disabled by default.

---

## 11. Pros and Cons Analysis

### Pros

**Battle-Tested at Scale**

Used by 20,000+ Alibaba internal developers over two years, detecting over 1 million defects. Because it's a CLI tool rather than a SaaS, code and data never leave your infrastructure, satisfying enterprise security requirements. Combined with a local LLM, a fully air-gapped setup is also possible.

**Cost-Effectiveness and Hybrid Design**

Reduces token usage by 80% compared to a pure LLM agent. It structurally solves the three chronic problems of general AI code review (incomplete coverage, position drift, quality instability) at the deterministic engineering layer.

**Flexible Model Support**

Supports OpenAI, Anthropic, DeepSeek, DashScope (Qwen), Ollama, and any other runtime exposing an OpenAI-compatible endpoint. You can freely switch between cloud and local LLMs.

**CI/CD and Agent Ecosystem Integration**

Official examples are provided for GitHub Actions and GitLab CI. It integrates with major AI coding agents like Claude Code and Codex via plugins, skills, or commands.

### Cons and Considerations

**LLM API Costs**

The tool itself is free under Apache 2.0, but backend LLM API costs are the user's responsibility. A local LLM eliminates this cost but comes with hardware requirements.

**Initial Environment Setup**

Existing Claude Code users don't need any setup since environment variables are auto-detected. But new users must go through the process of setting an LLM API key, endpoint, and model. Using a local LLM adds the extra step of installing Ollama and downloading models (several GB).

**Business Logic Limitations**

Built-in and custom rules cover a substantial portion, but the tool doesn't fully understand a team's unique business logic or domain-specific conventions. Ongoing effort is required to keep adding team-specific guidance to rule files.

**Fundamental AI Limitations**

High-level architecture design fit and full alignment with business requirements are hard to replace with human judgment. OCR is a supplementary tool that reduces reviewer burden, not a complete replacement.

---

## 12. Model Selection Guide

| Situation | Recommended model | Reason |
|---|---|---|
| Highest-quality review, budget available | Claude Opus 4.6 (cloud) | Complex context understanding and architecture analysis |
| Everyday PR review, balanced cost | Claude Sonnet 4.6 or GPT-4o | Performance/cost balance |
| Code must never leave your infrastructure | Qwen2.5-Coder 32B (Ollama) | Local execution, 92.1% HumanEval |
| Complex security vulnerability analysis | DeepSeek-R1 (local or cloud) | Reasoning-specialized architecture |
| Minimize cost (cloud) | DeepSeek Coder API | Code-specialized + low API price |
| Lightweight local environment (8GB VRAM or less) | Qwen2.5-Coder 7B | Fast response, low hardware requirement |
| Highest quality on a GPU server | DeepSeek Coder V2 236B | 95.7% HumanEval (best open source) |

---

## 13. Team Fit

**Organizations operating large codebases**

Even on PRs where many files change simultaneously, smart bundling and file selection logic cover everything without omission. Structurally lower miss rate than general-purpose agents.

**Teams where security vulnerability response matters**

Blocks high-risk defects like NPE, SQL Injection, XSS, and thread-safety issues early in the review process. Combined with a local LLM, you can build a fully private environment where code never leaves your infrastructure.

**Teams sensitive to AI adoption costs**

An 80% token reduction lets the same budget cover 5x the review volume. Using the DeepSeek cloud API or local Qwen models can reduce costs further.

**Teams wanting to combine AI with an existing review process**

Once OCR handles first-pass filtering of NPE, security vulnerabilities, and coding convention violations, human reviewers can focus on architecture design and business logic review.

---

## References

- [GitHub repository](https://github.com/alibaba/open-code-review)
- [Official documentation site](https://alibaba.github.io/open-code-review/)
- [GitHub Marketplace (Actions)](https://github.com/marketplace?q=open-code-review)
- [Digital Today — coverage of 80% token usage reduction](https://digitaltoday.co.kr) (June 8, 2026)
- [Gigazine — internal performance benchmark report](https://gigazine.net) (June 7, 2026)
