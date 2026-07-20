# OpenWiki Technical Documentation (English)

> Target repository: [langchain-ai/openwiki](https://github.com/langchain-ai/openwiki)
> License: MIT · Language: TypeScript(84%) / JavaScript(16%)

OpenWiki is a **CLI tool that automatically creates and maintains an "agent wiki" for your codebase or personal knowledge (personal memory)**. Built by the LangChain team, its key characteristic is being designed not just for humans to read, but for AI coding agents to reference when finding context.

## Table of Contents
- [Core Concept](#core-concept)
- [Features](#features)
- [Pros](#pros)
- [Cons / Limitations](#cons--limitations)
- [Comparison with Similar Projects](#comparison-with-similar-projects)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Cautions](#cautions)
- [Overall Assessment](#overall-assessment)

---

## Core Concept

OpenWiki provides two operating modes:

| Mode | Command | Description | Storage Location |
|------|---------|-------------|-----------------|
| **Personal mode** | `openwiki personal --init` | Creates a personal "brain" wiki integrating Gmail, Notion, local repos, web search, Hacker News, X/Twitter, etc. | `~/.openwiki/wiki` |
| **Code mode** | `openwiki code --init` | Generates repository documentation for the current codebase | `openwiki/` |

- **Connector-based ingestion**: Collects local knowledge sources via built-in connectors or git repositories.
- **Agent-first design**: `code` mode generates/updates `AGENTS.md` and `CLAUDE.md` at the repo root so coding agents reference the wiki when finding context.
- **Auto-refresh**: Can auto-generate documentation update PRs via GitHub Actions / GitLab CI workflows.

---

## Features

1. **AI agent-specific doc generation** — Unlike general doc generators, its primary goal is to be referenced by coding agents.
2. **Dual mode (Personal / Code)** — Handles personal knowledge management and code documentation in one tool.
3. **Rich connectors** — `git-repo`, `x`, `notion`, `google`(Gmail), `web-search`(Tavily), `hackernews`.
4. **Multi-source instances** — Configure multiple instances of the same connector (e.g., `web-search-1`, `web-search-2`).
5. **Multiple inference providers** — OpenAI (API key or ChatGPT login), OpenRouter, Fireworks, Baseten, OpenAI-compatible endpoints, Anthropic.
6. **CI integration** — GitHub Actions / GitLab CI example workflows provided; auto-submits doc changes as PRs.
7. **Local-first storage** — Config and secrets stored locally in `~/.openwiki/.env`.
8. **Scheduling** — On macOS, source schedules are installed as LaunchAgents for periodic wiki refresh.
9. **LangSmith tracing (optional)** — Traces execution to a LangSmith project ("openwiki").

---

## Pros

- **Optimized for agent workflows**: Auto-manages `AGENTS.md`/`CLAUDE.md`, preserving user content and only updating `<!-- OPENWIKI:START -->...<!-- OPENWIKI:END -->` blocks.
- **Auto-maintenance after setup**: Just add a CI workflow and docs stay current automatically. CI can use `--update` without `--init` for initial doc creation.
- **Broad source integration**: Unifies code plus personal knowledge (email, Notion, social media, etc.) into one wiki.
- **Flexible provider choice**: Supports commercial APIs, self-hosted gateways (LiteLLM via OpenAI-compatible), and ChatGPT subscription login.
- **Open source (MIT)**: Free use/modification, strong community interest (10k+ stars).
- **Security-oriented config**: Connector config files reference environment variable names rather than storing raw secrets.

---

## Cons / Limitations

- **LLM API costs**: Document generation/refresh requires LLM calls, consuming tokens (larger repos burn more).
- **Early-stage project (0.1.x)**: Only ~6 releases so far — API/command changes possible (e.g., bare `openwiki --init` no longer supported; must specify mode).
- **Node.js ecosystem dependency**: Global npm install needed; native dependency (`better-sqlite3`) exists.
- **Windows/Bun installation caveats**: `bun install` may fall back to native compilation of `better-sqlite3`, requiring Visual Studio Build Tools (C++ workload).
- **Per-connector auth complexity**: Slack/Gmail require pre-configured app client credentials; Slack OAuth requires ngrok tunnel; web search requires `TAVILY_API_KEY`.
- **Document quality is model-dependent**: Results vary by chosen model; human review still recommended.

---

## Comparison with Similar Projects

| Project | Nature | Source | AI Use | Agent Integration | Characteristics |
|---------|--------|--------|--------|-------------------|-----------------|
| **OpenWiki** | Agent wiki CLI | Code + personal knowledge (email/Notion/social/web) | Yes (multi-provider) | Yes: `AGENTS.md`/`CLAUDE.md` auto-management | Personal/Code dual mode, CI auto-PR |
| **DeepWiki (Cognition/Devin)** | Browse repos as wikis | Code repos | Yes | Indirect (query) | Web-based, interactive repo exploration |
| **Mintlify / docs.dev** | Doc site generation & hosting | Source code/comments | Partial AI assist | Low | Beautiful doc sites/hosting focused |
| **Docusaurus / MkDocs** | Static doc site generator | Manually written Markdown | No | No | Doc rendering/site-building; content is manual |
| **Doxygen / Sphinx / TypeDoc** | Code comments → API docs | Source comments/signatures | No | No | Deterministic API reference generation |

**Key Differentiator**: Unlike Doxygen-style deterministic API docs or Docusaurus-style rendering tools, OpenWiki uses LLMs to synthesize narrative wikis from code/personal knowledge and auto-maintains them via CI, targeting AI agent consumption as the primary use case.

---

## Installation

### Prerequisites
- Node.js and package manager (`npm` or `pnpm`) recommended
- LLM provider API key (e.g., OpenAI) — or ChatGPT login
- (Optional) `TAVILY_API_KEY` for web search connector

### Basic Install (macOS / Linux)

```bash
npm install -g openwiki
```

### Windows

```bash
npm install -g openwiki
# or
pnpm add -g openwiki
```

### Bun users (caution)

`bun install -g openwiki` may fall back to native compilation of `better-sqlite3`. You'll need Visual Studio Build Tools (Desktop development with C++ workload). **Recommend using `npm`/`pnpm` for stable installation.**

---

## Quick Start

```bash
# 1) Initialize code documentation mode (current repo)
openwiki code --init

# 2) Initialize personal brain mode
openwiki personal --init
```

First interactive run sets up inference provider, API key, and LLM. (Default: OpenAI + `gpt-5.6-terra`) Config and secrets stored in `~/.openwiki/.env`.

### Common Commands

```bash
openwiki                              # Start interactive CLI
openwiki "Generate docs for this repo" # Start with initial request
openwiki -p "Summarize what you can do" # Single command, non-interactive
openwiki --update                     # Update existing docs (default: personal mode)
openwiki code --update                # Update repo code docs
openwiki --help                       # Help
```

### Connector Auth

```bash
openwiki auth slack
openwiki auth gmail
openwiki auth x
openwiki auth notion
openwiki ngrok start                  # ngrok tunnel for Slack OAuth
```

### Ingest

```bash
openwiki ingest all            # Run all connector instances
openwiki ingest web-search     # All instances of a specific connector
openwiki ingest web-search-2   # A single instance
```

### CI Auto-Update

- **GitHub Actions**: Copy `examples/openwiki-update.yml` to `.github/workflows/openwiki-update.yml`
- **GitLab CI**: Copy `examples/openwiki-update.gitlab-ci.yml` to `.gitlab-ci.yml`

---

## Cautions

1. **Mode must be explicit**: bare `openwiki --init` no longer works. Specify `code` or `personal`.
2. **API costs**: LLM calls consume tokens and cost money. Larger repos = more cost/time.
3. **Secrets management**: All credentials stored in `~/.openwiki/.env`. Never commit this file. Connector config files should reference env var names, not raw secrets.
4. **Early version (0.1.x)**: Commands/behavior may change. Check release notes when upgrading.
5. **`AGENTS.md`/`CLAUDE.md` auto-editing**: These files get created/updated on every `code` run. OpenWiki only rewrites its own blocks, but be aware of automatic edits.

---

## Overall Assessment

OpenWiki moves beyond the "docs = for humans to read" perspective, targeting a new category: **documentation as a context source consumed by AI coding agents**. Its key differentiator is using LLMs to synthesize code/personal knowledge into narrative wikis and auto-maintaining them via CI.

- **Good fit**: AI agent-centric workflows (Claude, Cursor, etc.), teams needing living (always-current) repo wikis, individuals needing integrated personal knowledge.
- **Less fit**: Want to avoid LLM costs, need only deterministic API reference, require fully offline/air-gapped environments.
