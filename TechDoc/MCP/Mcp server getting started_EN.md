---
title: "MCP Server Development Getting Started — From Concepts to Building the AMQS-AI-Infra Signal Server"
description: "A comprehensive getting-started guide to the Model Context Protocol (MCP): concepts, architecture, and how it differs from APIs in Part 1, followed by a hands-on walkthrough in Part 2 building, testing, and connecting a working MCP server based on the AMQS quant strategy to Claude Desktop."
keywords:
  - "MCP"
  - "Model Context Protocol"
  - "MCP server development"
  - "FastMCP"
  - "Claude Desktop"
  - "AMQS"
  - "MCP tools resources prompts"
  - "MCP security"
lang: en
featured: false
schema_type: TechArticle
---

# MCP Server Development Getting Started — From Concepts to Building the AMQS-AI-Infra Signal Server

> Part 1 comprehensively covers the concepts, characteristics, and API differences of MCP (Model Context Protocol).
> Part 2 walks through the full process of **building, testing, and connecting to Claude Desktop a working MCP server** based on the [vibe-investing / AMQS-AI-Infra](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20AI%20Infra) quant strategy.
> The accompanying code (`server.py`) has been verified end-to-end, including the stdio handshake and tool calls.

---

# Part 1 — Understanding MCP Concepts

## 1. What Is MCP?

MCP (Model Context Protocol) is an **open standard protocol** announced by Anthropic in November 2024 that lets AI models (particularly LLMs) connect to external data sources and tools. It has since been adopted by major tech companies including OpenAI, Google, and Microsoft, establishing itself as a de facto standard in the AI industry.

### 1.1 Why Is MCP Needed? — The Lineage of the Problem

| Stage | Situation | Limitation |
|---|---|---|
| 1. LLM alone | Responds only with knowledge from training time | Cannot access real-time info ("what's the weather now"), cannot interact with the outside world |
| 2. Agent frameworks | Langchain, CrewAI, etc. connect LLMs to external tools (search, APIs, DBs) | Every framework requires its own SDK per tool — the M×N integration problem |
| 3. **MCP** | Unified via a single standard protocol | Reduced to M+N — a tool provider builds just one MCP server and it works with every host |

Concretely, the M×N problem meant a connector had to be built for every combination of M agent frameworks × N external tools. Tool providers were burdened with the inefficiency of collaborating individually with every framework. MCP solves this with a standardized connection method — the **"USB-C port of AI"** — any AI application that supports MCP connects instantly to any data source that supports MCP.

### 1.2 MCP Architecture

| Component | Role | Example |
|---|---|---|
| **MCP Host** | The AI application environment that contains the LLM | Claude Desktop, Cursor, Windsurf |
| **MCP Client** | Mediates communication between the LLM and MCP servers within the host. 1:1 connection per server | Built into the host |
| **MCP Server** | Connects to external services (DBs, web APIs, filesystems, etc.) to provide context and functionality to the LLM | slack-mcp-server, notion-mcp-server, **the AMQS server built in this document** |
| **Transport layer** | Message exchange based on JSON-RPC 2.0 | stdio (local), Streamable HTTP (remote) |

```
┌─────────────── Host (Claude Desktop) ───────────────┐
│  LLM ↔ Client A ── stdio ──→ Server A (AMQS signals) │
│        Client B ── stdio ──→ Server B (Slack)        │
│        Client C ── HTTP ───→ Server C (remote DB)     │
└──────────────────────────────────────────────────────┘
```

A single host can connect to multiple servers simultaneously, and the LLM decides on its own, based on conversational context, which server's which function to use.

## 2. Core Characteristics of MCP

| Characteristic | Description |
|---|---|
| **Open Standard** | Spec and SDKs are open source. Not tied to a specific AI model or vendor; anyone can implement a server or client |
| **Bidirectional Communication** | Session-based rather than one-off request-response. The spec includes servers sending notifications to clients, or a server requesting LLM inference from the client (sampling) |
| **Universality** | Once you implement the MCP standard, access to various data sources is standardized. A server need not care whether the host is Claude or Cursor |
| **Dynamic Discovery** | Clients query server capabilities at runtime via `list_tools` — the AI can automatically discover and interact with tools without any hardcoded prior knowledge |
| **Composability** | The LLM can freely combine tools from multiple servers to perform multi-step workflows |

## 3. MCP vs Traditional APIs — What's Different?

| Aspect | Direct API integration | MCP |
|---|---|---|
| Connection method | Separate connection and SDK per service | Access multiple tools via a single standard protocol |
| Tool discovery | Developer reads docs and codes manually | AI auto-discovers at runtime (`list_tools`) |
| Communication model | One-off request-response (stateless) | Persistent session-based bidirectional real-time communication |
| Who decides to call | Application code decides when to call | **The LLM decides whether, when, and how to combine calls based on conversational context** |
| Interface spec | OpenAPI/Swagger — for humans and code | JSON Schema + natural-language description — **for LLMs** |
| Integration cost | M (apps) × N (tools) connectors | M+N (one server per tool) |
| Relationship | — | **MCP does not replace APIs** — internally, a server still calls REST APIs and DBs. MCP is an LLM-friendly adapter layer on top |

The last row is the most important. Building an MCP server ultimately means "**wrapping existing APIs, libraries, and calculation logic in a form the LLM can understand and call**." The AMQS server we build in Part 2 also internally uses the yfinance API and pandas calculations, but exposes them as MCP tools.

## 4. MCP Use Cases — From Concept to Practice

### Example 1: News Summarization and Slack Posting
"Summarize today's top 3 news items and post them to the Slack AI news channel" → the AI collects news via a search MCP server → summarizes the key points → posts to the specified channel via slack-mcp-server. The key here is **the LLM autonomously combining two different servers**.

### Example 2: YouTube Channel Analysis and Notion Report
"Analyze the last 10 videos and create a report in Notion" → analyzes retention rate and drop-off points via a YouTube analytics MCP → writes an insights document → creates a report page via notion-mcp-server.

### Example 3: Ecosystem of Work Automation Servers
`slack-mcp-server` (send/query messages), `notion-mcp-server` (DB management), `google-calendar-mcp-server` (schedule management), etc. — thousands of public servers already exist.

### Example 4: Quant Investment Signal Server (the topic of this document)
"Check the current regime, and if it's RISK_ON, pull the Top 10, and also check my MU stop-loss" → the LLM sequentially combines three tools from the AMQS MCP server. If Examples 1–3 are about *using servers someone else built*, Part 2 is about **how to build such a server yourself**.

---

# Part 2 — MCP Server Development in Practice: The AMQS-AI-Infra Signal Server

## 5. Why AMQS Is a Good MCP Sample

The original AMQS-AI-Infra document already contains a **Python / LLM role-division table**. This table alone can serve as a blueprint for the MCP server design.

| AMQS role division | Owner | MCP mapping |
|---|---|---|
| 4-factor momentum, stop-loss, regime, Top-N selection | Python (automated) | **Tools** — deterministic calculations the LLM invokes |
| Universe / strategy parameters (static reference) | Python | **Resources** — read-only context |
| Revenue acceleration, 13F, EPS revision, narrative | LLM (knowledge/search) | **Prompts** — cross-verification workflow templates |

In other words, the AMQS philosophy — "Python computes the technical signal, the LLM reviews the fundamentals" ("the LLM is Excel, not an oracle") — maps 1:1 to MCP's three primitives (Tools / Resources / Prompts). Placing deterministic computation in code and judgment in the model is the textbook pattern for MCP server design.

## 6. Reinterpreting the Architecture From a Developer's Perspective

Let's revisit the Part 1 Host / Client / Server structure from a developer's viewpoint.

| Component | What the developer actually touches |
|---|---|
| Host | Not built (use an off-the-shelf app) |
| Client | Not built (built into the host) — only written for protocol testing |
| **Server** | **What we build** — the entirety of this document |
| Transport layer | Handled by the SDK — you only choose the transport type |

### 6.1 The Three Primitives

| Primitive | Controlled by | Purpose | In the AMQS sample |
|---|---|---|---|
| **Tools** | Model-controlled (LLM decides whether to call) | Execute functions, may have side effects | `get_regime`, `get_momentum_score`, `get_top_signals`, `check_stop_loss` |
| **Resources** | Application-controlled (host manages) | Read-only data identified by URI | `amqs://universe` |
| **Prompts** | User-controlled (user selects) | Reusable prompt templates | `cross_validate_ticker` |

### 6.2 Choosing a Transport

| Transport | Communication | Use case | Notes |
|---|---|---|---|
| **stdio** | Standard I/O | Local (Claude Desktop, Cursor) | Always start here. No deployment or auth needed |
| **Streamable HTTP** | Single HTTP endpoint | Remote server | The current standard replacing SSE since the 2025-03 spec |
| SSE (legacy) | HTTP + Server-Sent Events | Remote (older) | Deprecated — do not use for new development |

> The "stdio (local) or SSE (remote)" description in earlier materials reflects the old spec. In the current spec, remote transport has been unified under **Streamable HTTP**.

### 6.3 Choosing an SDK

| Criterion | Python (`mcp` + FastMCP) | TypeScript (`@modelcontextprotocol/sdk`) |
|---|---|---|
| Quant/data work | Direct access to pandas/numpy/yfinance ecosystem | Requires a separate bridge |
| Amount of code | Done with 3 decorators | Somewhat verbose |
| Deployment | `uv` / `pip` | `npx` one-command deployment advantage |
| This sample | **Chosen** | — |

For a quant signal server, since the data stack lives in Python, the Python SDK is the natural choice. `FastMCP` auto-generates the tool schema from function signatures and docstrings — since the docstring is exactly what the LLM sees as the tool description, **docstring quality directly determines tool-call accuracy**.

## 7. Project Structure and Environment Setup

```
amqs-mcp-server/
├── server.py                            # The MCP server itself (single file)
├── requirements.txt
├── claude_desktop_config.example.json   # Example Claude Desktop connection config
└── MCP_Server_Getting_Started.md        # This document
```

```bash
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Instant demo (no network/API key required, synthetic prices)
AMQS_MOCK=1 python server.py

# Real data (yfinance)
python server.py
```

`AMQS_MOCK=1` is an offline mode that runs on reproducible synthetic prices — same principle as the Toss dashboard's MOCK mode. Being able to demonstrate the logic without any keys is what makes documentation and CI a "living document."

## 8. Step-by-Step Anatomy of the Server Implementation

See the enclosed `server.py` for the full source. Here we cover only the key patterns.

### Step 1 — Server Instance and Instructions

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
    "amqs-ai-infra",
    instructions=(
        "AMQS-AI-Infra quant strategy signal server. ... "
        "All output is a research reference signal, not investment advice."
    ),
)
```

`instructions` is the system-level hint that helps the client understand the server's overall nature. For a financial tool, **baking a disclaimer into the server level** is safer than repeating it in every single tool output (this sample does both).

### Step 2 — Layer Separation: Data / Strategy / MCP

```
Data layer      get_prices()          yfinance or synthetic data + cache
Strategy layer  composite_scores()    4-factor z-score → 0-100 score (pure function, unrelated to MCP)
MCP layer       @mcp.tool()           thinly wraps the strategy function and serializes it to JSON
```

Separating strategy logic from the MCP decorator makes it (1) easy to unit test, and (2) reusable across CLI, backtests, and the Signal Bot with the same logic. This mirrors the original repo's separation of `script/strategy.py` (the engine) from `script/amqs_ai_infra.py` (the CLI). This is the code-level implementation of the "MCP is an adapter layer over APIs" idea from Section 3.

### Step 3 — Defining Tools: The Docstring Is the LLM-Facing Spec

```python
@mcp.tool()
def get_top_signals(top_n: int = 10) -> str:
    """Returns AMQS's Top-N buy candidates. Applies a cap of at most 4 tickers per
    sub-theme to prevent over-concentration in a single theme like GPUs. Includes a
    warning if the macro regime is not RISK_ON."""
```

Checklist

| Item | Reason |
|---|---|
| Type hints required (`top_n: int = 10`) | The basis for auto-generating the JSON Schema |
| Docstring specifies behavior, constraints, preconditions | The LLM's only basis for deciding when to use this tool |
| Return a structured JSON string | Ensures parsing stability for the LLM (`ensure_ascii=False` preserves non-ASCII text) |
| Input validation + errors returned as JSON | For a ticker outside the universe, return `{"error": ..., "universe": [...]}` instead of raising an exception — lets the LLM self-recover |
| Clamp upper bounds (`min(top_n, len(UNIVERSE))`) | Stays safe even if the LLM passes `top_n=999` |

### Step 4 — Enforcing Domain Rules Inside the Tool

The sub-theme cap (max 4 tickers per theme) is not something you politely ask the LLM to respect — **the code enforces it**:

```python
for t, row in df.iterrows():
    theme = row["subtheme"]
    if theme_count.get(theme, 0) >= SUBTHEME_CAP:
        continue          # blocks GPU over-concentration at the code level
```

Verification result (Top-10, mock): `compute 4 / server 3 / software 2 / network 1` — the cap works correctly. Risk rules belong in code, not prompts. This is the MCP version of the "LLM is Excel" principle.

### Step 5 — Resources and Prompts

```python
@mcp.resource("amqs://universe")     # URI scheme is arbitrary — a server namespace convention
def universe_resource() -> str: ...

@mcp.prompt()
def cross_validate_ticker(ticker: str) -> str: ...
```

A Prompt is a channel through which the server distributes "standard instructions telling the LLM to do what Python cannot (revenue acceleration, 13F, EPS revision)." The workflow of copy-pasting the original repo's `prompts/AMQS_AI_Infra_kr.MD` becomes, in MCP, a one-click call from the host's UI.

## 9. Testing — A Three-Stage Verification Pipeline

| Stage | Method | What's verified |
|---|---|---|
| 1. Unit | Import the module and call functions directly | Strategy logic (independent of MCP) |
| 2. Protocol | stdio handshake via an MCP client | initialize → list_tools → call_tool |
| 3. Interactive | MCP Inspector | UI-level verification from a real host's perspective |

### 9.1 Unit Testing

```python
import os; os.environ["AMQS_MOCK"] = "1"
import server
print(server.get_top_signals(10))   # Can still be called directly as a function despite the decorator
```

### 9.2 Protocol Testing (Verified in Execution)

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

params = StdioServerParameters(command="python", args=["server.py"],
                               env={"AMQS_MOCK": "1"})
async with stdio_client(params) as (r, w):
    async with ClientSession(r, w) as s:
        await s.initialize()
        tools = await s.list_tools()      # confirms 4 tools
        out = await s.call_tool("get_regime", {})
```

Execution result

```
TOOLS: ['get_regime', 'get_momentum_score', 'get_top_signals', 'check_stop_loss']
RESOURCES: ['amqs://universe']
PROMPTS: ['cross_validate_ticker']
CALL get_regime OK: {"regime": "RISK_ON", ...}
```

This test demonstrates the "Dynamic Discovery" characteristic from Part 1, Section 2 — the client never sees the server code and obtains the full list of capabilities and schemas purely through a runtime query.

### 9.3 MCP Inspector

```bash
npx @modelcontextprotocol/inspector python server.py
```

Interactively verify the tool list, schema, and call results in a browser UI. A mandatory checkpoint before connecting to Claude Desktop.

> Common pitfall: never debug with `print()` in a stdio server. Since stdout is the JSON-RPC channel, logs must be sent to `logging` (stderr). This is the #1 cause of stdio server malfunctions.

## 10. Connecting to Claude Desktop

Location of `claude_desktop_config.json`:

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "amqs-ai-infra": {
      "command": "python",
      "args": ["/ABSOLUTE/PATH/TO/amqs-mcp-server/server.py"],
      "env": { "AMQS_MOCK": "0" }
    }
  }
}
```

Cautions: (1) the path must be absolute, (2) if using a venv, `command` should be the absolute path to the venv's python, (3) fully restart Claude Desktop after editing. Once connected, conversations like the following become possible:

```
User: Check the current regime, and if it's RISK_ON, pull the Top 10 and tell me
      where MU ranks. Also, my MU average cost is $200 — check if the stop-loss
      has triggered.

Claude: [get_regime] → RISK_ON
        [get_top_signals(10)] → MU ranked #3, tier SATELLITE
        [check_stop_loss("MU", 200.0)] → pnl -17.95%, action EXIT
        → "The -12% stop-loss threshold has been breached. Under AMQS rules,
           this is an EXIT signal..."
```

Just as in the "news summary → Slack post" example in Part 1, Section 4, the user speaks in natural language and the LLM decides on its own how to combine tools. This tool orchestration is MCP's real value.

## 11. Remote Deployment (Streamable HTTP)

Switching from stdio to remote is a single line change:

```python
mcp.run(transport="streamable-http")   # default http://localhost:8000/mcp
```

| Item | stdio | Streamable HTTP |
|---|---|---|
| Users | Just yourself | Team / external public |
| Auth | Not needed (local process) | **OAuth 2.1 required** (spec requirement) |
| Deployment | — | Docker + reverse proxy, or Cloudflare Workers, etc. |
| State management | Process = session | Session-ID based, consider server scale-out |

Just as the Signal Bot's webview (`python -m http.server 8011`) was shared with the team, remoting the MCP server lets every team member's Claude use the same AMQS signal source — but public exposure without authentication is an absolute no-go (see the next section).

## 12. Security Considerations (from a CTI Perspective)

MCP is a new attack surface. The moment you build a server, you must also adopt a defender's mindset.

| Threat | Description | This sample's mitigation / recommendation |
|---|---|---|
| Tool Poisoning | A malicious server embeds hidden instructions in a tool description to manipulate the LLM | As a **server author**: keep descriptions strictly functional. As a **user**: audit third-party server descriptions before installing |
| Prompt Injection (indirect) | The LLM executes instructions embedded in external data (news/web) returned by a tool | Restrict return values to structured JSON, minimize free text |
| Confused Deputy | The LLM performs a tool call beyond the user's intent | Do not build tools with side effects (e.g., order execution) — this server is **read-only signals only**. Real-trade integration requires mandatory human-in-the-loop approval |
| Secrets Exposure | API keys stored in plaintext in config `env` | Use OS keychain / secret manager for integrations like the KIS API. `.gitignore` + pre-commit secret scanning (LAON VaultGuard-class tools) |
| Rug Pull | A server changes tool behavior after gaining trust via an update | Pin versions when installing, review diffs on changes |
| Unauthenticated remote exposure | Unauthorized use and data leakage when publishing a Streamable HTTP server | OAuth 2.1 + rate limiting; at minimum mTLS for internal networks |

One risk specific to financial signal servers: **the LLM over-interpreting tool output as a definitive trading recommendation**. The mitigation is threefold — a disclaimer in the server `instructions`, a `disclaimer` field in every tool output, and a mandatory notice at the end of prompt templates.

## 13. Expansion Roadmap

| Stage | Content | Difficulty |
|---|---|---|
| 1 | Integrate `backtest.py` — add a `run_backtest(start, end)` tool | Low |
| 2 | Expose the Signal Bot's `signals.json` as a Resource (`amqs://signals/latest`) | Low |
| 3 | Turn the ARDS-X regime classifier into a separate MCP server — let the LLM orchestrate AMQS/ARDS handoffs | Medium |
| 4 | Integrate Toss Open API / KIS API — but real-order tools require a mandatory approval gate | High |
| 5 | Integrate the crypto news pipeline (web3paper) — a news collection/summarization tool integrating CTI/investment | Medium |
| 6 | Team deployment via Streamable HTTP + OAuth, multilingual (KR/EN/ZH/JP) tool descriptions | Medium |

## 14. Summary

**Concepts (Part 1)**
1. MCP is an open standard that reduces the M×N integration problem between LLMs and external tools to M+N — the "USB-C port of AI."
2. In the Host / Client / Server structure, the only thing a developer builds is the Server.
3. MCP does not replace APIs — it's an **LLM-friendly adapter layer** on top of existing APIs, and the key differences are dynamic discovery and LLM-driven invocation.

**Development (Part 2)**
4. Building an MCP server means exposing **deterministic computation as Tools, static data as Resources, and LLM workflows as Prompts**.
5. AMQS's Python/LLM role-division table becomes the MCP design blueprint as-is — risk rules (sub-theme caps, stop-losses) are enforced in code, not prompts.
6. Development order: FastMCP + stdio → unit tests → protocol tests → Inspector → Claude Desktop → (if needed) Streamable HTTP + OAuth.
7. Building a server also creates an attack surface — consider Tool Poisoning, Injection, and Secrets at the design stage.

## Reference Links

- MCP official spec/docs: https://modelcontextprotocol.io
- Python SDK: https://github.com/modelcontextprotocol/python-sdk
- MCP Inspector: https://github.com/modelcontextprotocol/inspector
- AMQS-AI-Infra original: https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20AI%20Infra

---

*This document and code are for research and educational purposes and do not constitute investment advice. AMQS is a high-risk quant strategy with the potential for principal loss.*
*License: MIT — "Built on AMQS by Dennis Kim, vibe-investing repository."*
