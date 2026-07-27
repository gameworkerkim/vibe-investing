<!--
---
title: "OpenHands Review — From Coding Agent to Agent Control Center"
title_ko: "OpenHands 리뷰 — 자율 코딩 에이전트에서 에이전트 컨트롤 센터로"
subtitle: "Agent Canvas orchestration. Self-hosted center driving Claude Code and Codex via ACP"
description: "TechDoc on All Hands AI's OpenHands (formerly OpenDevin): concept shift, open-core license, default-path sandbox gap, positioning vs goose and OpenWorker, plus install and adoption checklists."
abstract: |
  OpenHands from All Hands AI is transitioning from an MIT+enterprise open-core coding agent to an agent control center (Agent Canvas).
  It orchestrates Claude Code, Codex, and Gemini via ACP and runs schedules and webhooks through the Automation Server.
  Key caveats: the default npm install path has no sandbox, and enterprise/ uses a separate license with repo-split churn during the transition.
summary_for_ai: |
  Third-party tech review of github.com/OpenHands/OpenHands (~82.2k stars as of ~2026-07-27).
  MIT + separate enterprise/ LICENSE (open-core). Transitioning to Agent Canvas + software-agent-sdk + automation repos.
  Default npm path has no sandbox — Docker recommended. Closest peers: goose (local runtime), OpenWorker (knowledge work artifacts).
  Not investment advice. Verify LICENSE and install paths before citing.
date: 2026-07-27
updated: 2026-07-27
author: "Dennis Kim"
lang: en
tags:
  - OpenHands
  - Agent Canvas
  - All Hands AI
  - AI Agent
  - LLM
  - ACP
  - MCP
  - Coding Agent
keywords:
  - "OpenHands"
  - "Agent Canvas"
  - "OpenDevin"
  - "ACP agent"
  - "coding agent control center"
  - "OpenHands vs goose"
group: llm-agents
featured: true
featured_rank: 7
schema_type: TechArticle
draft: false
robots: index,follow
---
-->

# OpenHands: From Autonomous Coding Agent to Agent Control Center

| Field | Detail |
| --- | --- |
| Project | OpenHands (formerly OpenDevin) |
| Developer | All Hands AI |
| First release | Late 2024 as OpenDevin; renamed OpenHands in 2025 |
| License | Mixed MIT + separate license. `enterprise/` directory under `enterprise/LICENSE`; everything else MIT |
| Repository | github.com/OpenHands/OpenHands (moved from All-Hands-AI/OpenHands) |
| Repository scale | 82.2k stars, 10.5k forks, 7,082 commits, 135 open issues, 234 open PRs |
| Current status | Beta badge. Agent Canvas transition in progress |
| Release channels | Dual track: OSS 1.11.0 (2026-07-09) / Cloud 1.47.1 (2026-07-21) |
| Documentation | docs.openhands.dev |
| Implementation | Python (agent, server), TypeScript (frontend) |
| Deployment | Global npm install, Docker, source build, hosted cloud, Kubernetes enterprise |

---

## 1. Concept

Early OpenHands promised that "the agent can do everything a human developer can." It started as an open-source response to Cognition Labs' Devin, aiming at a single agent that autonomously edits code, runs commands, browses the web, and calls APIs.

The proposition has changed. The repository's first line now reads "self-hosted developer control center for coding agents and automations," redefined as an **orchestration layer** that runs not only its own agent but also ACP (Agent-Client Protocol)–compatible agents such as Claude Code, Codex, and Gemini. The project has moved from selling its own agent to a platform that manages other people's agents too.

| Aspect | Early OpenHands (OpenDevin) | Current OpenHands |
| --- | --- | --- |
| Identity | Autonomous coding agent | Agent control center |
| Executor | Native CodeAct agent | OpenHands agent + any ACP agent |
| Default interface | Local GUI, CLI | Agent Canvas |
| Run location | Local Docker sandbox | Choice of local, Docker, VM, on-prem infra, cloud |
| Focus | Issue resolution | Always-on automation team |

### Architecture

```
              Agent Canvas (frontend + control center)
                          |
        +-----------------+------------------+
        |                 |                  |
  Agent Server      Agent Server       Agent Server
  (local laptop)      (Mac mini/VM)      (OpenHands Cloud)
        |
  Automation Server   scheduled runs, webhook event triggers
```

Agent Server is a REST API that runs multiple agents on a single host/port. Agent Canvas can connect to several Agent Servers at once and switch between them, so you can share a server for code review and dependency updates while running personal work on a laptop.

### Repository split status

Code is migrating out of the main repository; the current README is effectively Agent Canvas documentation.

| Component | New location |
| --- | --- |
| OpenHands agent, Agent Server | OpenHands/software-agent-sdk |
| Agent Canvas | OpenHands/agent-canvas |
| Automation Server | OpenHands/automation |
| Cloud Helm chart | OpenHands/openhands-cloud |

Transition progress is summarized in issue #14841 (Agent Canvas transition FAQ).

---

## 2. Strengths

| Aspect | Detail |
| --- | --- |
| Community scale | 82.2k stars, 10.5k forks, 7,082 commits. Largest open-source coding agent by scale, ahead of goose (51.7k) |
| Agent agnosticism | ACP support lets you plug in Claude Code, Codex, and Gemini as-is. Reuse existing subscriptions while taking the management layer open source |
| Backend flexibility | Switch between laptop, dedicated machine, VM, on-prem infra, and cloud from the same frontend. Always-on agents that keep running after you close the laptop is the officially recommended path |
| Model agnosticism | LiteLLM conventions. Anthropic, OpenAI, Google, Bedrock, plus local models via LM Studio, llama.cpp, Ollama |
| Sandbox option | Docker backend provides host-isolated execution. Official container images ship |
| Automation server | Scheduled runs and webhook triggers as a separate component. Always-on workflows such as weekly Slack reports and automatic GitHub issue breakdown |
| Integrations | GitHub, GitLab, Bitbucket, Slack, Jira, Linear, Notion. MCP server connections and OAuth support |
| Sub-agent delegation | Multi-agent workflows via TaskToolSet. Specialized agents split complex tasks |
| Enterprise features in-repo | Agent Profiles, Budgets dashboard, Usage & Monitoring, SAML/SSO, RBAC, BYOR key management exist as real code. Self-hosted Kubernetes deployment path |
| Public API | Full public API callable from scripts, CI workflows, and internal apps |
| Vulnerability response | Dependency CVE fixes are explicitly noted in release notes (e.g. vite CVE-2026-53571 patch) |
| Output ownership | Terms of service assign rights to agent-generated output to the user |

---

## 3. Weaknesses and caveats

| Aspect | Detail |
| --- | --- |
| Not purely open source | LICENSE splits `enterprise/` under a separate license — open-core structure. Do not treat the repo as a plain "MIT project" when designing commercial use. Read `enterprise/LICENSE` before adoption |
| Default install path has no sandbox | Current README Option 1 (`npm install -g`) and Option 3 (source run) start the agent server directly on the host. README itself warns that "the agent has access to the entire filesystem." Choose Docker backend explicitly for isolation |
| Transition churn | Agent core, Agent Canvas, and automation server are moving to separate repositories. More than half of existing docs, blogs, and tutorials already contain broken commands. Legacy `ghcr.io/all-hands-ai/openhands` image and port-3000 guidance are obsolete |
| Beta status | Project status badge is beta. Scale is large, but the current shape is pre-stabilization |
| Open-core drift to watch | Cloud 1.47.0 moved Agent Canvas behind SaaS authentication. Cloud-only for now, but track where features land |
| Heavy architecture | Event-loop stateful system unsuitable for serverless deployment. Requires Node.js 22.12.x+, uv, optional Docker |
| Local-run attack surface | Always-on exposure via webhooks and Slack triggers for agents with filesystem and shell access. Issue bodies and channel messages can become instructions — a standard prompt-injection entry point. Official docs emphasize security hardening separately in self-hosting guides |
| Cost | BYOK model. Parallel sub-agents and always-on automation consume tokens heavily. Budgets dashboard is enterprise-tier |
| Cloud data terms | Cloud use grants broad license over user data for service operation. Review terms before sensitive code |
| Multi-user | Auth, RBAC, SAML/SSO sit on the enterprise path. Pure OSS multi-tenant needs separate design |
| PR backlog | 234 open PRs. Sign of active contribution and review bottleneck |

---

## 4. Similar and competing projects

| Project | License | Character | vs OpenHands |
| --- | --- | --- | --- |
| goose (AAIF/Linux Foundation) | Apache 2.0 | Rust general-purpose local agent. Desktop, CLI, API | Stronger governance neutrality and license simplicity; no open-core risk. OpenHands leads on distributed backend execution and enterprise management |
| OpenWorker (Andrew Ng, Rohit Prasad) | MIT | Local desktop agent for knowledge work | Outcome-centric, 25+ native connectors. Far behind on scale and maturity |
| Devin (Cognition Labs) | Commercial | AI software engineer | OpenHands' original benchmark. Closed, paid |
| Claude Code | Commercial | Anthropic official CLI agent | Single-model polish. Can run inside OpenHands as an ACP agent — competitor and component |
| Cline / Kilo Code | Open source | IDE-embedded agents | IDE workflow depth. Always-on automation and multi-backend out of scope |
| Aider | Apache 2.0 | Terminal-first, Git commit direct | Mature, lightweight single-purpose tool. No management layer |
| AutoGPT | Open source | Autonomous agent framework | No sandbox or production ops features |
| Codex (OpenAI) | Commercial | Coding assistant and agent | Runnable in OpenHands via ACP |
| n8n / Dify | Mixed | Workflow orchestration | Visual editing advantage. Weaker agentic autonomy |

### Positioning summary

In one line across the three projects: **goose is the local runtime, OpenWorker is work artifacts, OpenHands is the management layer.**

OpenHands' pivot looks smart. Agent-core performance is a game frontier model vendors win; orchestrating multiple agents above them was still an open slot. Repositioning Claude Code from competitor to runtime target is the result of that bet.

The pivot has costs. Open-core licensing, sandbox gap on the default path, and documentation fragmentation from repo splits are all happening at once. If you evaluate adoption now, assume the setup may look quite different six months out.

---

## 5. Getting Started

### 5.1 Choose a run mode

| Mode | Description | Sandbox | Best for |
| --- | --- | --- | --- |
| Global npm install | Run full Agent Canvas stack locally | None | Quick trial, personal dev |
| Docker | Containerized run; mount project directory only | Yes | Any case needing isolation |
| Source build | Run agent-canvas repo directly | None | Contributors, customization |
| VM self-host | Always-on Agent Server on cloud server | Depends on setup | Always-on automation, team sharing |
| OpenHands Cloud | Hosted at app.all-hands.dev | Provided | Avoid infra management |
| Kubernetes enterprise | Self-hosted via Helm chart | Provided | Org deployment, SSO/RBAC |

### 5.2 npm install (no sandbox)

Prerequisites: Node.js 22.12.x+, `uv`

```bash
npm install -g @openhands/agent-canvas
agent-canvas
```

The full stack starts; UI is at `http://localhost:8000`. To run components separately:

```bash
agent-canvas --frontend-only   # static frontend + ingress
agent-canvas --backend-only    # agent server + automation backend + ingress
```

This path runs the agent server on the host, exposing the full filesystem. Not recommended outside experiments.

### 5.3 Docker install (recommended)

Prerequisites: Docker Desktop or Docker Engine, parent directory of projects to expose to the agent

```bash
export PROJECTS_PATH="$HOME/projects"
mkdir -p "$PROJECTS_PATH" "$HOME/.openhands"

docker run -it --rm \
  -p 8000:8000 \
  -v "$HOME/.openhands:/home/openhands/.openhands" \
  -v "${PROJECTS_PATH}:/projects" \
  ghcr.io/openhands/agent-canvas:1
```

The agent accesses only projects under `PROJECTS_PATH`. Mount scope is the access boundary — do not mount the entire home directory. On Windows, see `README.windows.md` in the agent-canvas repo.

### 5.4 Source run

```bash
git clone https://github.com/OpenHands/agent-canvas.git
cd agent-canvas
npm install
npm run dev
```

Prerequisites: Node.js 22.12.x+, npm, uv (agent server via `uvx`). This path also has no sandbox.

For the agent core or Agent Server directly, use the `OpenHands/software-agent-sdk` repository.

### 5.5 Model configuration

Follows LiteLLM conventions — use provider prefix notation.

```bash
export LLM_API_KEY="your-api-key"
export LLM_MODEL="anthropic/<model-id>"
```

Local models connect via LM Studio, llama.cpp, or Ollama. The settings UI stores and switches models per LLM profile.

### 5.6 Connect ACP agents

Agent Canvas runs the OpenHands agent by default but can register ACP-compatible agents as alternate executors.

| Agent | Notes |
| --- | --- |
| OpenHands Agent | Default; no extra setup |
| Claude Code | Existing subscription reusable |
| Codex | Existing subscription reusable |
| Gemini | Via ACP |
| Other ACP implementations | Connectable if protocol-compliant |

### 5.7 Automation setup

Automation Server configures scheduled runs and webhook triggers. Common patterns:

| Pattern | Trigger | Output |
| --- | --- | --- |
| Weekly report | cron | Post to Slack channel |
| Auto issue breakdown | GitHub webhook | Create subtasks |
| Dependency update | cron | Open PR |
| Alert response | External event (e.g. Datadog) | Investigate and reply in thread |

Webhooks and channel messages become instruction paths — narrow target repos and execution permissions under a don't-trust-external-input assumption.

### 5.8 Repository layout

| Path | Contents |
| --- | --- |
| `openhands/` | Python backend core |
| `frontend/` | Web frontend |
| `openhands-ui/` | UI components |
| `enterprise/` | Enterprise features; separately licensed |
| `containers/` | Container build definitions |
| `skills/`, `.agents/skills` | Agent skill definitions |
| `kind/` | Local Kubernetes config |
| `tests/` | Test suite |
| `Development.md` | Dev environment setup guide |

### 5.9 Pre-adoption checklist

| Check | Guidance |
| --- | --- |
| License | Read `enterprise/LICENSE` first. Identify whether features you need are MIT or enterprise |
| Execution isolation | Standardize on Docker backend, not default npm path. Limit mount scope to project directories |
| External triggers | Design trust boundaries for Slack, GitHub, webhooks. List paths where external text becomes instructions |
| Credential scope | Issue minimal repo write and issue-creation permissions. No org-wide tokens |
| Cost caps | Set provider limits upfront. Always-on automation accumulates usage |
| Cloud terms | Review data license clauses for sensitive code before choosing self-host vs cloud |
| Transition risk | Repo split in progress — pin versions and plan migration before adoption |
| Alternatives | For a simple local agent, goose is lighter with simpler licensing |

---

## References

- Main repository: https://github.com/OpenHands/OpenHands
- Agent Canvas: https://github.com/OpenHands/agent-canvas
- Agent SDK: https://github.com/OpenHands/software-agent-sdk
- Automation server: https://github.com/OpenHands/automation
- Cloud Helm chart: https://github.com/OpenHands/openhands-cloud
- Documentation: https://docs.openhands.dev/overview/introduction
- Self-hosting guide: https://docs.openhands.dev/openhands/usage/agent-canvas/backend-setup/vm
- Transition FAQ: https://github.com/OpenHands/OpenHands/issues/14841
- Development guide: https://github.com/OpenHands/OpenHands/blob/main/Development.md
- Slack: https://go.openhands.dev/slack

#OpenHands #AgentCanvas #AllHandsAI #AIAgent #OpenSource #ACP #MCP #CodingAgent #LLM
