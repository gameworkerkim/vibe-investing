---
title: "Headroom Complete Guide"
description: "A complete guide to Headroom, the open-source LLM context compression proxy — what it is, installation, AI tool integration, DeepSeek V4 Pro / Open Code setup, and troubleshooting."
abstract: |
  Headroom is an open-source project that intelligently compresses the massive context (code, logs, search results, etc.)
  exchanged with AI coding agents, cutting cost by up to 95% while preserving response quality. This guide covers what
  Headroom is and how it works, proxy-mode installation, integrating it with AI tools like Open Code, DeepSeek V4 Pro,
  Cursor, Claude Code, Codex CLI, and Aider, alternative usage modes (agent wrapping, MCP server, Python library,
  multi-agent shared context), useful commands and compression-level tuning, troubleshooting, and reference links.
summary_for_ai: |
  Complete guide to Headroom (v0.22, as of June 2026), an open-source context compression proxy for AI coding agents,
  developed by Netflix senior engineer Tejas Chopra and open-sourced in January 2026 under Apache 2.0.
  Core value: cuts tokens by 60-95% and cost by up to ~50% (roughly 2x usage for the same budget) with equal or
  slightly improved quality, by sitting between the AI agent and the LLM API, intercepting requests, and applying
  smart compression plus cache alignment (CacheAligner) to avoid breaking prompt caching.
  Compression engines: SmartCrusher (generic JSON array/nested object compression), CodeCompressor (AST-aware
  compression for Python/JS/Go/Rust/Java/C++), Kompress-base (HuggingFace-trained agent trace compression),
  CacheAligner (stabilizes Anthropic/OpenAI KV cache prefixes), IntelligentContext (importance-score-based context
  fitting), CCR (reversible compression allowing the LLM to retrieve the original if needed).
  Recommended install: proxy mode via `pip install "headroom-ai[proxy]"`, run with `headroom proxy --port 8787`,
  then point tools at it via OPENAI_BASE_URL or ANTHROPIC_BASE_URL environment variables. Covers integration examples
  for Open Code, DeepSeek V4 Pro, Cursor, Claude Code, Codex CLI, Aider, Copilot CLI, and Continue, plus a full
  DeepSeek V4 Pro + Open Code walkthrough.
  Alternative usage modes: `headroom wrap <tool>` for automatic agent wrapping, `headroom mcp install` for MCP-server-based
  integration (headroom_compress/retrieve/stats tools), direct Python library usage via `from headroom import compress`,
  and SharedContext for deduplicated shared compression across multiple agents running in parallel.
  Useful commands: `headroom stats`, `headroom reset`, `headroom config` (compression level: aggressive/balanced/
  conservative, cache_alignment toggle). Includes a troubleshooting FAQ (proxy not starting, connection refused,
  parameters not working, minimal savings) and reference links (official site, GitHub, PyPI, integration docs for
  LangChain/CCR/metrics, related articles, and background reading on context engineering and prompt caching).
date: 2026-06-15
author: "Dennis Kim"
lang: en
tags:
  - Headroom
  - LLM
  - Context Compression
  - AI Agents
  - Cost Optimization
keywords:
  - Headroom AI proxy
  - LLM context compression
  - token cost reduction
  - DeepSeek V4 Pro
  - Open Code integration
  - CacheAligner
featured: false
schema_type: TechArticle
draft: false
---

# Headroom Complete Guide
> What it is, installation, configuration, and DeepSeek V4 Pro / Open Code integration

---

## Table of Contents

1. [What Is Headroom?](#1-what-is-headroom)
2. [Installation (Proxy Mode Recommended)](#2-installation-proxy-mode-recommended)
3. [Integrating With AI Tools](#3-integrating-with-ai-tools-proxy-mode)
4. [Using It With DeepSeek V4 Pro + Open Code](#4-using-it-with-deepseek-v4-pro--open-code)
5. [Other Ways to Use Headroom](#5-other-ways-to-use-headroom)
6. [Useful Commands and Tips](#6-useful-commands-and-tips)
7. [Troubleshooting](#7-troubleshooting)
8. [References and Key Links](#8-references-and-key-links)

---

## 1. What Is Headroom?

**Headroom** is an open-source project that intelligently compresses the massive context (code, logs, search results, and more) exchanged with AI agents — particularly AI coding models — **cutting cost by up to 95% while preserving response quality**.

> Developed by Netflix senior engineer Tejas Chopra, open-sourced in January 2026 under the Apache 2.0 license.

### Why Is It Needed?

Every time an AI performs a task, a huge volume of context gets sent with each request:

- Code search results
- Log files
- API responses
- Prior conversation history

This drives up **cost** and causes **information overload**, leading the AI to miss important details.

### How It Works

```
[AI Agent] ──request──▶ [Headroom Proxy] ──compressed request──▶ [LLM API]
                              │
                         Smart compression
                    (removes repetition/noise)
                    Applies CacheAligner
```

| Stage | Description |
|------|------|
| **Request interception** | Sits between the AI agent and the API, intercepting every request |
| **Smart compression** | Replaces or compresses repetitive or less important information with reference links |
| **Cache alignment** | CacheAligner technology solves prompt-cache-busting issues to maximize cost savings |

### Key Compression Engines

| Engine | Role |
|------|------|
| `SmartCrusher` | Generic JSON array / nested object compression |
| `CodeCompressor` | AST-aware compression for Python, JS, Go, Rust, Java, C++ |
| `Kompress-base` | HuggingFace-trained model for compressing agent traces |
| `CacheAligner` | Stabilizes Anthropic/OpenAI KV cache prefixes |
| `IntelligentContext` | Importance-score-based context fitting |
| `CCR` | Reversible compression (the LLM can retrieve the original if needed) |

### Key Results

| Metric | Savings |
|------|-----------|
| Token reduction | **60% – 95%** |
| Cost reduction | **Up to ~50%** (roughly 2x usage for the same budget) |
| Quality | Equal or slightly improved |

---

## 2. Installation (Proxy Mode Recommended)

Proxy mode is the simplest way to use Headroom without changing any existing code.
It works with any LLM and tool, including DeepSeek V4 Pro and Open Code.

### 2.1 Installing Headroom

```bash
pip install "headroom-ai[proxy]"
```

> For the full feature set: `pip install "headroom-ai[all]"`

### 2.2 Running the Proxy Server

```bash
headroom proxy --port 8787
```

- `--port 8787`: sets the port used by the proxy server (any other port works too)
- On successful startup, you'll see `Listening on http://localhost:8787`

### 2.3 Verifying It's Working

```bash
curl http://localhost:8787/health
```

Successful response:

```json
{"status": "healthy", "version": "x.x.x"}
```

---

## 3. Integrating With AI Tools (Proxy Mode)

With the proxy server running, configure each AI tool to call its API through this proxy.

### The Basic Principle

| Compatibility mode | Environment variable |
|-----------|-----------|
| OpenAI-compatible tools | `OPENAI_BASE_URL=http://localhost:8787/v1` |
| Anthropic-compatible tools | `ANTHROPIC_BASE_URL=http://localhost:8787` |

### Integration Examples by Tool

| Tool | Command |
|------|--------|
| Open Code (OpenClaude) | `OPENAI_BASE_URL=http://localhost:8787/v1 openclaude` |
| DeepSeek V4 Pro | `OPENAI_BASE_URL=http://localhost:8787/v1 deepseek` |
| Cursor | `OPENAI_BASE_URL=http://localhost:8787/v1 cursor` |
| Claude Code | `ANTHROPIC_BASE_URL=http://localhost:8787 claude` |
| Codex CLI | `OPENAI_BASE_URL=http://localhost:8787/v1 codex` |
| Aider | `OPENAI_BASE_URL=http://localhost:8787/v1 aider` |
| Copilot CLI | `OPENAI_BASE_URL=http://localhost:8787/v1 copilot` |
| Continue | Add `OPENAI_BASE_URL=http://localhost:8787/v1` to the config file |

> **Tip for a permanent setup:** add the following line to `~/.bashrc` or `~/.zshrc`
> ```bash
> export OPENAI_BASE_URL=http://localhost:8787/v1
> ```

---

## 4. Using It With DeepSeek V4 Pro + Open Code

### Step-by-Step

**Step 1: Run the Headroom proxy**

```bash
headroom proxy --port 8787
```

**Step 2: Run Open Code through the proxy**

```bash
OPENAI_BASE_URL=http://localhost:8787/v1 openclaude
```

If calling DeepSeek V4 Pro directly:

```bash
OPENAI_BASE_URL=http://localhost:8787/v1 deepseek-v4-pro --model deepseek-v4-pro
```

**Step 3: Verify it's working**

- Type a normal coding question into Open Code
- The Headroom proxy terminal will display compression stats (tokens reduced)
- Use `headroom stats` to check cumulative savings

> **✅ Compatibility guaranteed:** Since Headroom operates at the proxy level, it never interferes with DeepSeek V4 Pro's specific API format or Open Code's communication protocol.

---

## 5. Other Ways to Use Headroom

### 5.1 Agent Wrap — the Easiest Option

```bash
headroom wrap openclaude
headroom wrap cursor
```

After this, Headroom is automatically applied whenever you run `openclaude`.

> Quick win: `pip install "headroom-ai[all]"`, then `headroom wrap claude`

### 5.2 MCP Server (Model Context Protocol)

This method is efficient if you use multiple MCP clients.

```bash
headroom mcp install
```

Available MCP tools:

| Tool | Description |
|------|------|
| `headroom_compress` | Request text compression |
| `headroom_retrieve` | Retrieve compressed context |
| `headroom_stats` | View statistics |

### 5.3 Python Library

```python
from headroom import compress

compressed = compress(
    text="Very long log file contents...",
    model="deepseek-v4-pro"  # model can be specified
)
```

### 5.4 Multi-Agent Environments

If you're running Claude and Codex in parallel, you can share a common compressed context store with automatic deduplication via SharedContext.

---

## 6. Useful Commands and Tips

| Command | Description |
|--------|------|
| `headroom stats` | Prints token/cost savings stats accumulated so far |
| `headroom reset` | Resets statistics |
| `headroom proxy --help` | Shows all proxy options |
| `headroom config` | Edit the config file (adjust compression level, etc.) |

### Adjusting Compression Level (config.yaml)

```yaml
compression:
  level: "balanced"  # "aggressive" | "balanced" | "conservative"
  cache_alignment: true
```

### Quick Start (One-Liner)

```bash
# Install + run the proxy
pip install "headroom-ai[proxy]" && headroom proxy --port 8787

# In another terminal
OPENAI_BASE_URL=http://localhost:8787/v1 openclaude
```

---

## 7. Troubleshooting

**Q: The proxy server won't start.**

- Check for a port conflict: `lsof -i :8787` -> if occupied, switch to another port with `--port 8788`, etc.
- Reinstall Headroom: `pip install --upgrade "headroom-ai[proxy]"`

**Q: My tool shows a "Connection refused" error.**

- Verify the proxy server is running first
- Check that the port number in the environment variable matches (`http://localhost:8787`)

**Q: A specific DeepSeek V4 Pro parameter isn't working.**

- Headroom passes parameters through unconditionally, so it's likely an issue with the tool itself
- Test without Headroom first, then compare

**Q: I'm barely seeing any savings.**

- Check the actual compression rate with `headroom stats`
- If the context is already small, compression gains may be minimal

---

## 8. References and Key Links

### Official Resources

| Resource | URL |
|--------|-----|
| Official homepage | [headroomlabs.ai](https://headroomlabs.ai/) |
| GitHub repository | [github.com/chopratejas/headroom](https://github.com/chopratejas/headroom) |
| Official docs (docs/) | [github.com/chopratejas/headroom/tree/main/docs](https://github.com/chopratejas/headroom/tree/main/docs) |
| PyPI package | [pypi.org/project/headroom-ai](https://pypi.org/project/headroom-ai/) |

### Integration Guides (Official Docs)

| Guide | URL |
|--------|-----|
| LangChain integration | [docs/langchain.md](https://github.com/chopratejas/headroom/blob/main/docs/langchain.md) |
| CCR (reversible compression) guide | [docs/ccr.md](https://github.com/chopratejas/headroom/blob/main/docs/ccr.md) |
| Metrics & Monitoring | [docs/metrics.md](https://github.com/chopratejas/headroom/blob/main/docs/metrics.md) |

### Reference Articles

| Title | URL |
|------|-----|
| Building Cost-Efficient Agents with Headroom (Medium) | [subratpati.medium.com](https://subratpati.medium.com/building-cost-efficient-agents-with-headroom-context-compression-for-llm-applications-b665128153b6) |
| Headroom: Cut LLM Token Usage by Up to 95% (DEV.to) | [dev.to/arshtechpro](https://dev.to/arshtechpro/headroom-cut-your-llm-token-usage-by-up-to-95-without-changing-your-answers-5g06) |
| A Practical Guide to Headroom Token Compression (Build This Now) | [buildthisnow.com](https://www.buildthisnow.com/blog/tools/extensions/headroom-token-compression) |

### Related Technical Background

| Resource | Description |
|------|------|
| Phil Schmid — Context Engineering Principles | The foundation of Headroom's philosophy: the priority order "Raw > Compaction > Summarization" |
| Anthropic Prompt Caching Docs | Background for understanding CacheAligner |
| OpenAI Compatible API Spec | The basis for proxy-mode BASE_URL integration |

---

> **Version info:** This document is based on Headroom v0.22 (as of June 2026).
> Apache 2.0 License | Developer: Tejas Chopra (Netflix Senior Engineer)
