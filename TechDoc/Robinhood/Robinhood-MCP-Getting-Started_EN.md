---
title: "Robinhood MCP Getting Started Guide"
description: "A fact-checked guide to Robinhood's MCP ecosystem: the official Agentic Trading MCP plus five community servers, with setup steps and risk comparison."
abstract: |
  Robinhood's MCP ecosystem splits into an official Agentic Trading MCP (launched 2026-05-27, beta, isolated agentic account, stocks only) and five community-built servers that wrap either the unofficial robin_stocks API or the official Crypto API. This guide corrects common misconceptions from earlier writeups, walks through setup for each path, and provides a decision matrix based on account eligibility, asset class, and risk tolerance.
summary_for_ai: |
  Reference note for AI agents: this document is current as of 2026-07-21 and explicitly corrects several inaccuracies found in an earlier draft, including outdated tool counts and incorrect "unofficial API" framing for Robinhood's Crypto API and the official Agentic Trading MCP. The official trading MCP is U.S.-account-only and beta/invite-gated; community servers built on robin_stocks carry account-suspension risk since they rely on an unofficial API. Losses from agent actions are the user's responsibility across every path, official or community.
lang: en
featured: false
author: Dennis Kim
date: 2026-07-21
schema_type: TechArticle
---

# Robinhood MCP Getting Started Guide

> Last verified: 2026-07-21 | Status: fact-checked against publicly available information
> Key corrections vs. the original writeup: (1) filled in the missing official Robinhood Agentic Trading MCP, (2) corrected the "mostly unofficial API" framing, (3) updated individual repository install commands and authentication methods to current

---

## 1. Overview

The Robinhood MCP (Model Context Protocol) ecosystem splits broadly into **two layers**. The original writeup only covered community repositories, but the landscape shifted when Robinhood launched an official MCP server on May 27, 2026.

| Layer | Nature | Auth | Risk |
|------|------|------|--------|
| Official Agentic Trading MCP | Provided directly by Robinhood, beta | OAuth (dedicated agentic account) | Isolated to a dedicated account; no access to your main portfolio |
| Community MCP servers | Third-party (wrapping robin_stocks, an unofficial API, or the official Crypto API) | Account password / API key / remote OAuth | Possible account suspension; credential-management responsibility shifted to the user |

**Correction**: the original claim that "most repositories use unofficial APIs" is only half right. `robin_stocks`-based servers (verygoodplugins, open-stocks-mcp, etc.) are indeed unofficial, but Robinhood's **Crypto API is official** (API key + Ed25519 private key auth), and — most importantly — an **official stock-trading MCP** now exists.

---

## 2. Official: Robinhood Agentic Trading MCP

> Endpoint: `https://agent.robinhood.com/mcp/trading`
> Info: https://robinhood.com/us/en/agentic-trading/

Robinhood's official agentic trading infrastructure, launched May 27, 2026. It structurally solves the problems community repositories had to work around — unofficial-API blocking risk and credential exposure.

| Item | Details |
|------|------|
| Launch | 2026-05-27, beta (rolling out via email invite) |
| Supported assets | Equities. Options rolling out in phases. Crypto, futures, and event contracts are on the roadmap |
| Account structure | A dedicated agentic account fully separated from your main account. The agent can only access funds deposited into that account |
| Safeguards | Per-trade push notifications, real-time activity feed, optional pre-trade preview approval, one-tap disconnect, fraud detection |
| Supported agents | Claude, Claude Code, Claude Desktop, ChatGPT, Codex, Cursor, Grok, and MCP-compatible agents broadly |
| Prerequisites | A U.S. Robinhood individual account in good standing; initial setup is desktop-only |

### How to Connect

**Claude Code (terminal)**:
```bash
claude mcp add robinhood-trading --transport http https://agent.robinhood.com/mcp/trading
```

**Claude Desktop / Claude.ai**:
1. Settings → Connectors → Add custom connector
2. URL: `https://agent.robinhood.com/mcp/trading`
3. Complete OAuth authentication, then finish verification in the Robinhood mobile app

**Codex CLI**:
```bash
codex mcp add robinhood-trading --url https://agent.robinhood.com/mcp/trading
```

### Things to Know

- Beta stage means not every user gets immediate access (eligible users are notified by email)
- Losses caused by the agent are entirely the user's responsibility — the terms explicitly state Robinhood does not compensate for them
- U.S. accounts only. Non-residents (including Korea) should look at community servers or a separate broker alternative

---

## 3. Community Repository Analysis

### 3.1 verygoodplugins/robinhood-mcp — Read-Only Research

> https://github.com/verygoodplugins/robinhood-mcp

| Item | Details |
|------|------|
| Purpose | Read-only portfolio research (no trading functionality exposed) |
| Stack | Python, wraps robin_stocks (unofficial API) |
| Install | `pip install robinhood-mcp` or `uvx robinhood-mcp` |
| Scale | About 18 GitHub stars (small project) |

**Features**: portfolio value, sector concentration, P&L, stock fundamentals/news/analyst ratings, dividend analysis, earnings calendar, options positions, order history at the fill level.

**Beyond the original — how authentication actually behaves** (practically important info missing from the original):
- Without a TOTP secret, the server enters a **pending mobile push approval** state. You must approve in the app within `ROBINHOOD_APPROVAL_TIMEOUT` (default 60 seconds)
- After approval, the session is cached in `~/.tokens/robinhood.pickle`, so subsequent calls don't require re-login
- Login failures are cached for about 5 minutes — restart Claude Desktop to retry immediately

**Claude Desktop config**:
```json
{
  "mcpServers": {
    "robinhood": {
      "command": "uvx",
      "args": ["robinhood-mcp"],
      "env": {
        "ROBINHOOD_USERNAME": "your_email",
        "ROBINHOOD_PASSWORD": "your_password",
        "ROBINHOOD_TOTP_SECRET": "your_2fa_secret"
      }
    }
  }
}
```

---

### 3.2 trayders/trayd-mcp — Remote Full Trading

> https://github.com/trayders/trayd-mcp | Server: `https://mcp.trayd.ai/mcp`

| Item | Details |
|------|------|
| Purpose | Trade a real Robinhood account from Claude (web/CLI) |
| Structure | Remote server (AWS ECS) + Clerk Google auth. No local install needed |
| Credentials | Robinhood tokens are kept in memory only (never written to disk), cleared on restart, deleted immediately on logout |
| Notable | The only trading MCP in this category that works from the claude.ai web app |

**Beyond the original**:
- Limit orders are submitted by default as 24-hour extended-hours orders
- Quotes are available 24/7 — real-time from Robinhood during market hours, automatically falling back to a partner data source after hours
- Supports multiple accounts (manage several Robinhood accounts from a single connection)
- Persistent memory: a markdown-notes-based personal knowledge base that Claude reads and writes (persists across sessions)
- Combined with Claude Code's `/loop`, you can build a scheduled auto-trading agent (e.g., "check my positions every 5 minutes, sell if down 3%")

**Setup (Claude.ai web)**:
1. Settings → Connectors → Add custom connector
2. Name: `trayd` / URL: `https://mcp.trayd.ai/mcp`
3. Connect → sign in with Google → in chat, type "Link my Robinhood account" → approve via mobile 2FA

**Setup (Claude Code)**:
```bash
claude mcp add --transport http trayd https://mcp.trayd.ai/mcp --scope user
```

**Risk assessment**: credentials pass through a remote server. The code is public, but there's no way for users to verify that the actual running server matches the published code. If you're eligible for the official Agentic Trading, that path is preferable from a trust-model standpoint.

---

### 3.3 kevin1chun/robinhood-for-agents — Multi-Agent Toolkit

> https://github.com/kevin1chun/robinhood-for-agents

| Item | Details |
|------|------|
| Purpose | AI agent integration for stock/options/crypto trading (dual mode: MCP tools or direct TypeScript client calls) |
| Stack | TypeScript, Bun v1.3+, Chrome (browser automation captures OAuth tokens on login) |
| Compatibility | Claude Code, Codex, OpenClaw, etc. Interactive onboarding auto-detects the agent |
| License | MIT-0 |

**Correction to the original**:
- The "49 MCP tools" figure in the original was a point-in-time number that varies by version. This document describes it instead as "dual mode: MCP tools or TypeScript client," without a tool count
- The manual Claude Code registration command changed. It's no longer `bunx robinhood-for-agents` from the original; per the current README:

```bash
claude mcp add -s user robinhood-for-agents -- bun run /path/to/bin/robinhood-for-agents.ts
```

**Install (recommended — interactive onboarding)**:
```bash
npx robinhood-for-agents onboard
# or specify an agent
npx robinhood-for-agents onboard --agent claude-code
```

Supports both local execution and Docker/remote-host deployment, selected during onboarding.

**Security note**: it captures OAuth tokens from a login session via Chrome automation. Legitimate given how it works, but a sensitive pattern — reviewing the code before use is recommended.

---

### 3.4 Open-Agent-Tools/open-stocks-mcp — Multi-Broker

> https://github.com/Open-Agent-Tools/open-stocks-mcp

| Item | Details |
|------|------|
| Purpose | Multi-broker MCP server for Robinhood + Charles Schwab |
| Stack | Python, HTTP/STDIO transport, Docker support |
| Trading | Live-verified stock and options order execution (Robinhood) |
| Install | `pip install open-stocks-mcp` (or `uv sync` for source development) |

**Config** (`.env`):
```env
ROBINHOOD_USERNAME=your_email@example.com
ROBINHOOD_PASSWORD=your_password
# If also using Schwab
SCHWAB_API_KEY=your_api_key
SCHWAB_APP_SECRET=your_app_secret
SCHWAB_CALLBACK_URL=https://127.0.0.1:8182/
ENABLED_BROKERS=robinhood,schwab
```

**Run and verify**:
```bash
open-stocks-mcp-server --transport http --port 3001
curl http://localhost:3001/health
curl http://localhost:3001/metrics   # Prometheus metrics
```

The Schwab side uses official OAuth, but the Robinhood side depends on the unofficial robin_stocks API.

---

### 3.5 robinhood-mcp (npm) — Crypto API Only

> https://www.npmjs.com/package/robinhood-mcp

| Item | Details |
|------|------|
| Purpose | Execution toolkit for Robinhood's **official Crypto API** |
| Stack | TypeScript/Node.js |
| Auth | API key + Base64-encoded private key (no account password needed — safer in this respect than the robin_stocks-based servers) |

**Correction**: the original lumped this package into the "unofficial" category, but Robinhood's Crypto API is an officially provided API. That said, the original's warning that **there's no sandbox, so every order executes with real money** is accurate and still fully valid.

**Safeguards** (retained from the original, verified):

| Guard | Description |
|-------|------|
| Separate binary | Trading tools are not registered on the data-only server |
| Explicit opt-in | `ROBINHOOD_CRYPTO_ENABLE_TRADING=1` is required |
| Per-order USD cap | Rejects orders exceeding $100 by default |
| Daily cumulative cap | Limits total daily trading volume |
| Symbol allowlist | Only trades designated pairs |
| Buy-only mode | Setting `ROBINHOOD_CRYPTO_BUY_ONLY=1` rejects sells |
| Guard mode | Default: no order executes without confirmation |
| Kill switch | `risk_kill_switch_engage` halts all execution |

```bash
npm install -g robinhood-mcp
export ROBINHOOD_CRYPTO_API_KEY="your_api_key"
export ROBINHOOD_CRYPTO_PRIVATE_KEY="your_base64_private_key"
export ROBINHOOD_CRYPTO_ENABLE_TRADING=1   # only when trading
robinhood-mcp
```

---

### 3.6 rohitsingh-iitd/robinhood-mcp-server — Crypto REST/WebSocket

> https://github.com/rohitsingh-iitd/robinhood-mcp-server

The original description largely still holds. Built on Python 3.8+ and FastAPI, it exposes the official Crypto API via REST (`:8000`) and WebSocket (`:8001`). However, maintenance activity is not very active as a personal project, so for production use, the npm package in 3.5 is the safer choice given its stronger safeguards.

---

## 4. Selection Guide (Corrected)

| Use case | 1st choice | Notes |
|-----------|-------|------|
| U.S. account + automated stock trading | **Official Agentic Trading MCP** | The only official path. Isolated dedicated account |
| Portfolio viewing/research only | verygoodplugins/robinhood-mcp | No trading exposure eliminates misfire risk at the source |
| Immediate trading from the claude.ai web app | trayd-mcp | Zero install, but requires trusting the remote server |
| Crypto trading (safeguards prioritized) | npm robinhood-mcp | Official Crypto API, USD cap, kill switch |
| Robinhood + Schwab together | open-stocks-mcp | The only multi-broker option |
| Agents other than Claude | robinhood-for-agents | Supports Codex, OpenClaw, and others |

**Decision principle**: if you're eligible for official Agentic Trading, use it. Community servers exist for exactly four gaps: (1) not yet invited to the beta, (2) unsupported assets like crypto, (3) view-only research, and (4) multi-broker support.

---

## 5. Quick Start: Three Paths

### Path A — Official (stock trading, recommended)

```bash
# 1. Open and fund an Agentic account in the Robinhood app/web (desktop required)
# 2. Register with Claude Code
claude mcp add robinhood-trading --transport http https://agent.robinhood.com/mcp/trading
# 3. Restart Claude Code → /mcp → select robinhood-trading → OAuth authentication
# 4. Approve the verification step in the mobile app
```

### Path B — Zero Install (trayd)

```bash
claude mcp add --transport http trayd https://mcp.trayd.ai/mcp --scope user
# /mcp → trayd → Authorize → sign in with Google → "Link my Robinhood account"
```

### Path C — Local Read-Only (research)

```bash
pip install robinhood-mcp
export ROBINHOOD_USERNAME="your_email@example.com"
export ROBINHOOD_PASSWORD="your_password"
export ROBINHOOD_TOTP_SECRET="your_totp_secret"   # without it, a 60-second app-push approval wait
uvx robinhood-mcp
```

---

## 6. Cautions (Corrected)

1. **API status distinctions**: the official Agentic Trading MCP (stocks) and the Crypto API are official. Only robin_stocks-based servers (verygoodplugins, and the Robinhood side of open-stocks-mcp) are unofficial, meaning they can be blocked without notice and carry account-suspension risk.
2. **No sandbox**: the Crypto API has no test environment. The community-server technique of testing connectivity only via a limit order priced too low to ever fill, then canceling it, is recommended.
3. **Credential management**: passing your account password via environment variable (the robin_stocks-based approach) is the most fragile method. Priority order: official OAuth > Crypto API key > remote pass-through > password environment variable.
4. **Jurisdiction**: official Agentic Trading is U.S.-individual-account-only and beta/invite-gated. Non-U.S. residents cannot use the official path described in this document.
5. **Liability**: losses from agent actions are the user's responsibility across every path. Robinhood states explicitly that it does not compensate for agent losses even through the official path.
6. **Regulatory trends**: the SEC and CFTC are reviewing how existing regulations apply to AI agents executing orders. Track regulatory changes if you're running automated strategies.
