---
title: "Headroom Complete Guide"
description: "Description, installation, configuration, and DeepSeek V4 Pro / Open Code integration for Headroom, an open-source context compression tool."
lang: en
featured: false
schema_type: TechArticle
keywords:
  - Headroom
  - context compression
  - token reduction
  - Open Code
  - DeepSeek
tags:
  - LLM
  - Cost Optimization
  - Proxy
  - CLI Tools
---

# Headroom Complete Guide
> Description, installation, configuration, and DeepSeek V4 Pro / Open Code integration

---

## Table of Contents

1. [What Is Headroom?](#1-what-is-headroom)
2. [Installation (Proxy Mode Recommended)](#2-installation-proxy-mode-recommended)
3. [Integrating AI Tools](#3-integrating-ai-tools-proxy-mode)
4. [Using It with DeepSeek V4 Pro + Open Code](#4-using-it-with-deepseek-v4-pro--open-code)
5. [Other Ways to Use Headroom](#5-other-ways-to-use-headroom)
6. [Useful Commands and Tips](#6-useful-commands-and-tips)
7. [Troubleshooting](#7-troubleshooting)
8. [References and Key Links](#8-references-and-key-links)

---

## 1. What Is Headroom?

**Headroom** is an open-source project that intelligently compresses the massive context (code, logs, search results, etc.) generated when communicating with AI agents — particularly coding-focused AI models — **cutting costs by up to 95% while preserving response quality**.

> Developed by Netflix senior engineer Tejas Chopra, open-sourced in January 2026. Apache 2.0 license.

### Why Is It Needed?

Every time an AI performs a task, large volumes of context are sent with each request, such as:

- Code search results
- Log files
- API responses
- Prior conversation history

This leads to **increased cost** and **information overload**, causing the AI to miss important details.

### How It Works

```
[AI Agent] --request--> [Headroom Proxy] --compressed request--> [LLM API]
                              |
                         Smart compression
                    (removes repetition/unneeded info)
                    Applies CacheAligner
```

| Stage | Description |
|------|------|
| **Request interception** | Sits between the AI agent and the API, intercepting every request in the middle |
| **Smart compression** | Replaces repetitive or less important information with reference links, or compresses it |
| **Cache alignment** | Solves the prompt-cache-breaking problem with CacheAligner technology, maximizing cost savings |

### Core Compression Engines

| Engine | Role |
|------|------|
| `SmartCrusher` | General-purpose compression of JSON arrays and nested objects |
| `CodeCompressor` | AST-aware compression for Python, JS, Go, Rust, Java, C++ |
| `Kompress-base` | Agent-trace compression based on a HuggingFace-trained model |
| `CacheAligner` | Stabilizes Anthropic/OpenAI KV cache prefixes |
| `IntelligentContext` | Context fitting based on importance scoring |
| `CCR` | Reversible compression (LLM can retrieve the original when needed) |

### Key Results

| Category | Savings effect |
|------|-----------|
| Token reduction | **60% ~ 95%** |
| Cost reduction | **up to ~50%** (roughly 2x the usage for the same budget) |
| Quality | Equivalent or slightly improved |

---

## 2. Installation (Proxy Mode Recommended)

Proxy mode is the simplest way to use Headroom without any changes to existing code.
It works with any LLM and tool, including DeepSeek V4 Pro and Open Code.

### 2.1 Installing Headroom

```bash
pip install "headroom-ai[proxy]"
```

> Full feature install: `pip install "headroom-ai[all]"`

### 2.2 Running the Proxy Server

```bash
headroom proxy --port 8787
```

- `--port 8787`: specifies the port the proxy server uses (other ports work too)
- On successful startup, you'll see `Listening on http://localhost:8787`

### 2.3 Verifying It's Working

```bash
curl http://localhost:8787/health
```

Success response:

```json
{"status": "healthy", "version": "x.x.x"}
```

---

## 3. Integrating AI Tools (Proxy Mode)

With the proxy server running, configure each AI tool to call its API through this proxy.

### Basic Principle

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
| Continue | enter `OPENAI_BASE_URL=http://localhost:8787/v1` in the config file |

> **Tip for a permanent setup:** add the following line to `~/.bashrc` or `~/.zshrc`
> ```bash
> export OPENAI_BASE_URL=http://localhost:8787/v1
> ```

---

## 4. Using It with DeepSeek V4 Pro + Open Code

### Step-by-Step

**Step 1: Run the Headroom proxy**

```bash
headroom proxy --port 8787
```

**Step 2: Run Open Code through the proxy**

```bash
OPENAI_BASE_URL=http://localhost:8787/v1 openclaude
```

For calling DeepSeek V4 Pro directly:

```bash
OPENAI_BASE_URL=http://localhost:8787/v1 deepseek-v4-pro --model deepseek-v4-pro
```

**Step 3: Verify it's working correctly**

- Enter a normal coding question in Open Code
- Compression statistics (reduced token count) will display in the Headroom proxy terminal
- Check cumulative savings with the `headroom stats` command

> **Compatibility guarantee:** since Headroom operates at the proxy level, it never interferes with DeepSeek V4 Pro's unique API format or Open Code's communication method.

---

## 5. Other Ways to Use Headroom

### 5.1 Agent Wrap — the Simplest Approach

```bash
headroom wrap openclaude
headroom wrap cursor
```

From then on, Headroom is applied automatically whenever `openclaude` runs.

> Quick win: `pip install "headroom-ai[all]"` then `headroom wrap claude`

### 5.2 MCP Server (Model Context Protocol)

If you use multiple MCP clients, this approach is efficient.

```bash
headroom mcp install
```

Provided MCP tools:

| Tool | Description |
|------|------|
| `headroom_compress` | Request text compression |
| `headroom_retrieve` | Retrieve compressed context |
| `headroom_stats` | Query statistics |

### 5.3 Python Library

```python
from headroom import compress

compressed = compress(
    text="very long log file content...",
    model="deepseek-v4-pro"  # model can be specified
)
```

### 5.4 Multi-Agent Environments

When running Claude + Codex in parallel, you can share a common compressed context store with automatic deduplication via SharedContext.

---

## 6. Useful Commands and Tips

| Command | Description |
|--------|------|
| `headroom stats` | Print cumulative token/cost savings statistics |
| `headroom reset` | Reset statistics |
| `headroom proxy --help` | View all proxy options |
| `headroom config` | Edit the config file (adjust compression level, etc.) |

### Adjusting Compression Level (config.yaml)

```yaml
compression:
  level: "balanced"  # "aggressive" | "balanced" | "conservative"
  cache_alignment: true
```

### Quick Start (One-Liner)

```bash
# install + run proxy
pip install "headroom-ai[proxy]" && headroom proxy --port 8787

# in another terminal
OPENAI_BASE_URL=http://localhost:8787/v1 openclaude
```

---

## 7. Troubleshooting

**Q: The proxy server won't start.**

- Check for a port conflict: `lsof -i :8787` -> use a different port like `--port 8788`
- Reinstall Headroom: `pip install --upgrade "headroom-ai[proxy]"`

**Q: I get a "Connection refused" error in a tool.**

- Verify the proxy server is running first
- Verify the port number in your environment variable matches (`http://localhost:8787`)

**Q: A specific DeepSeek V4 Pro parameter isn't working.**

- Headroom passes parameters through unconditionally, so this is likely an issue with the tool itself
- Test without Headroom first for comparison

**Q: I'm barely seeing any savings.**

- Check the actual compression rate with `headroom stats`
- If the context was already small, compression effects may be minimal

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
| Practical Headroom Token Compression Guide (Build This Now) | [buildthisnow.com](https://www.buildthisnow.com/blog/tools/extensions/headroom-token-compression) |

### Related Technical References

| Reference | Description |
|------|------|
| Phil Schmid — Context Engineering principles | Foundation of Headroom's philosophy: priority order "Raw > Compaction > Summarization" |
| Anthropic Prompt Caching documentation | Background for understanding CacheAligner |
| OpenAI Compatible API spec | Basis for Proxy mode BASE_URL integration |

---

> **Version info:** this document is based on Headroom v0.22 (as of June 2026).
> Apache 2.0 License | Developer: Tejas Chopra (Netflix Senior Engineer)
