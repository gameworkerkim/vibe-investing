<!--
---
title: "Awesome Agent — Hands-On Comparison of Open-Source AI Agents (OpenWorker · goose · OpenHands)"
title_ko: "Awesome Agent — 오픈소스 AI 에이전트 실측 비교 (OpenWorker · goose · OpenHands)"
subtitle: "Knowledge-work artifacts · local runtime · orchestration layer. MCP·ACP nesting and CTI adoption framing"
description: "Awesome Agent hub comparing OpenWorker, goose, and OpenHands from hands-on repo review. Per-project reviews (KO/EN/JA), comparison tables, tool proliferation, supply chain, and ATT&CK threat mapping from a CTI perspective."
abstract: |
  Awesome Agent hub document comparing three open-source AI agents — OpenWorker, goose, and OpenHands — from direct repository inspection.
  OpenWorker targets knowledge-work artifacts on the desktop; goose is the AAIF-backed general-purpose local runtime; OpenHands is the ACP-based agent orchestration control center.
  Includes CTI adoption framing: MCP·ACP nesting, approval fatigue, limits of LLM-based judgment, supply-chain and credential concentration, and ATT&CK threat mapping.
summary_for_ai: |
  Hub index for three hands-on TechDoc reviews: OpenWorker (Andrew Ng, knowledge-work artifacts), goose (AAIF local runtime), OpenHands (agent control center / orchestration).
  Includes comparison tables, landscape map, tool proliferation analysis, and CTI section with ATT&CK mapping.
  Not investment advice. Verify repo metrics and install paths at citation time (measured 2026-07-27).
date: 2026-07-27
updated: 2026-07-27
author: "Dennis Kim"
lang: en
tags:
  - Awesome Agent
  - OpenWorker
  - goose
  - OpenHands
  - AI Agent
  - LLM
  - MCP
  - ACP
  - CTI
  - Open Source
keywords:
  - "Awesome Agent"
  - "OpenWorker"
  - "goose AI agent"
  - "OpenHands"
  - "MCP"
  - "ACP"
  - "open-source AI agent comparison"
  - "agent security"
  - "Agent Canvas"
group: llm-agents
featured: true
featured_rank: 1
schema_type: TechArticle
draft: false
robots: index,follow
---
-->

# Awesome Agent

This is a hands-on technical review of open-source AI agent projects, organized as Awesome Agent. As agents proliferate, we see security gaps, degraded performance, and tools too heavy to deliver value after adoption — this curation helps you pick an agent that fits.
Moreover, many open-source tools cross-reference each other and can become a single point of attack. If I were an adversary, I would contribute one or two essential tools inside an agent stack and trigger a mass pandemic-style attack through latent vulnerabilities.

AI-based open-source projects today undergo unchecked mutual reference. Because they are not isolated from one another, the probability of a major incident is high.

**Languages.** Each review and this hub document are available in Korean, English, and Japanese (`readme.md` / `readme_EN.md` / `readme_JA.md`).

<!--
| Field | Detail |
| --- | --- |
| Location | `TechDoc/Awesome-Agent/` |
| Author | Dennis Kim, Betalabs Inc. |
| Measurement date | 2026-07-27 |
| Audience | Engineers, security owners, and technical decision-makers evaluating agent tooling |
| Nature | Vendor-neutral technical review. Not a deployment recommendation |
| Update policy | Repo metrics and install steps reflect the measurement date. Facts in this space decay quarterly |
-->
---

## 0. Why this document exists

In the first half of 2026, open-source AI agent projects exploded. The problem is not the count — it is **the rate of information decay**. Competing agents and daily LLM-generated updates produce convergent evolution that amplifies factual error.

---

## 1. Included documents

| Document | Project | Core positioning | Korean | English | Japanese |
| --- | --- | --- | --- | --- | --- |
| OpenWorker | OpenWorker (Andrew Ng, Rohit Prasad) | Local desktop agent for knowledge workers. Artifact-oriented | [KO](./Openworker-Review.md) | [EN](./Openworker-Review_EN.md) | [JA](./Openworker-Review_JA.md) |
| goose | goose (Agentic AI Foundation) | General-purpose local agent runtime. Governance-neutral | [KO](./Goose-Review.md) | [EN](./Goose-Review_EN.md) | [JA](./Goose-Review_JA.md) |
| OpenHands | OpenHands (All Hands AI) | Agent orchestration control center | [KO](./OpenHands-Review.md) | [EN](./OpenHands-Review_EN.md) | [JA](./OpenHands-Review_JA.md) |

Each review follows the same format: metadata table, concept, pros, cons and caveats, similar competing projects, Getting Started, and pre-adoption checklist.

---

## 2. At-a-glance comparison

| Item | OpenWorker | goose | OpenHands |
| --- | --- | --- | --- |
| Maintainer | Andrew Ng, Rohit Prasad | Block alumni; now Linux Foundation AAIF | All Hands AI (for-profit) |
| License | MIT | Apache 2.0 | MIT + separate `enterprise/` |
| Governance | Individual-led; internal roadmap first | Foundation; vendor-neutral | Single company; open-core |
| Repository | andrewyng/openworker | aaif-goose/goose | OpenHands/OpenHands |
| Stars | 46 | 51.7k | 82.2k |
| Forks | 3 | 5.7k | 10.5k |
| Commits | 45 | 5,130 | 7,082 |
| Languages | Python + TypeScript + Rust | Rust | Python + TypeScript |
| Supported OS | macOS, Windows (unsigned) | macOS, Linux, Windows | Platform-agnostic (container/server) |
| Delivery | Desktop app | Desktop, CLI, API | Web control center, API |
| Default execution isolation | Local process | Local process | None (Docker optional) |
| Approval gates | 4-tier type classification; on by default | 4 modes; autonomous by default | Policy-based; config-dependent |
| Native connectors | 25+ | None (delegated to MCP) | GitHub/Slack/Jira, etc. |
| MCP support | Yes | Yes (70+ extensions) | Yes |
| ACP support | No | Yes | Yes (core feature) |
| Run other agents | No | As provider | First-class |
| Model providers | 11+ plus Ollama | 15+ plus Ollama | LiteLLM convention |
| Scheduled runs | Yes | Yes | Yes (separate server) |
| Subagents | No | Yes (autonomous mode only) | Yes |
| Enterprise management | None | Custom Distros | RBAC, SSO, Budgets (enterprise) |
| Maturity | Open beta | Production | Beta (transitioning) |

### Quick decision guide

| Scenario | Choice |
| --- | --- |
| Automate documents, calendars, email, and other work artifacts | OpenWorker |
| General-purpose local agent spanning code and non-code | goose |
| Manage multiple agents at organization scale | OpenHands |
| Minimize license risk for commercial embedding | goose |
| Isolated execution is mandatory | OpenHands + Docker backend |
| Fully offline | goose + Ollama |

**Positioning in one line:** goose = local runtime, OpenWorker = knowledge-work artifacts, OpenHands = management/orchestration layer.

---

## 3. Summaries of the three projects

### 3.1 OpenWorker

**Background.** Released July 23, 2026. A desktop agent built by Andrew Ng and Rohit Prasad on top of their aisuite library. Developed inside the aisuite repo before splitting into its own repository.

**Concept.** "Outcomes, not chat." You specify a desired result — not a prompt — and the agent decomposes steps and returns file-based artifacts. A Tauri 2 shell supervises a local Python FastAPI server (127.0.0.1:8765).

**Pros.** 25+ native connectors work out of the box. Approval gates are defined at the type-system level — read / write_local / exec / external — not as a UI add-on; unattended runs queue approvals in an inbox. Most conservative safety defaults among the three.

**Cons.** Early project: 45 commits, 46 stars. No Linux support; unsigned Windows builds. PRs that diverge from the internal roadmap are rejected — open source with centralized governance.

**Caveats.** Do not take "privacy protection" marketing at face value. A local agent loop is not the same as data staying local. Plug in a cloud API key and file contents leave the machine. True locality only holds on the Ollama path.

### 3.2 goose

**Background.** Started as an internal Block tool, open-sourced, and donated to the Linux Foundation Agentic AI Foundation on April 7, 2026 — same foundation as MCP and AGENTS.md. Repository and docs domains have migrated.

**Concept.** "A general-purpose local agent beyond code suggestions." Rust implementation with a Cargo workspace splitting core, CLI, server, and MCP crates. Desktop app, CLI, and embeddable API share one core and one config file.

**Pros.** Only project with vendor-neutral foundation governance; Apache 2.0 with no commercial embedding restrictions. Full support on three OSes, 70+ MCP extensions, ACP to reuse Claude Code and Codex subscriptions. Custom Distros officially support org-specific builds.

**Cons.** Business tools all require separate MCP server installs and individual auth. 70 extensions measure ecosystem size, not ready-to-use connectors. Docs and examples skew toward coding; weak onboarding for non-developers.

**Caveats.** Default permission mode is fully autonomous. Subagents only run in autonomous mode — **to use parallel processing you must disable approval gates.** A design that pushes users toward turning safety off; the most serious structural issue in this entire document.

### 3.3 OpenHands

**Background.** Started as OpenDevin in late 2024 as an open-source answer to Devin; renamed in 2025. As of 2026 the repo org moved to `OpenHands/OpenHands` and product identity is shifting toward Agent Canvas.

**Concept.** "Self-hosted developer control center for coding agents and automation." Runs not only its own agent but ACP-compatible agents such as Claude Code, Codex, and Gemini. Agent Canvas frontend connects to multiple Agent Servers; a separate Automation Server handles schedules and webhook triggers.

**Pros.** Largest scale. Pick backends from laptop, dedicated machine, VM, on-prem infra, or cloud and switch in one UI. Enterprise features (Agent Profiles, Budgets, Usage dashboard, SAML/SSO, RBAC) exist in code; Kubernetes self-host path available.

**Cons.** Not pure open source. `enterprise/` is separately licensed; much of what orgs actually need lives there. Repo split in progress — many docs and tutorials already broken.

**Caveats.** The Docker sandbox that was a headline differentiator is gone from the default install path. Current first-choice install is direct on the host with a full-filesystem access warning in the README. Combine Slack/GitHub webhook triggers and external text becomes instruction input immediately. Widest attack surface of the three.

---

## 4. Broader project landscape

### 4.1 Coding-focused agents

| Project | License | Surface | Notes |
| --- | --- | --- | --- |
| Claude Code | Commercial | CLI, desktop, IDE | Single-model optimized. Reused as ACP provider in goose and OpenHands |
| Codex | Commercial | CLI, cloud | Can join via ACP |
| Cline | Open source | VS Code | Strongest IDE-embedded. Plan-and-Act mode, MCP marketplace |
| Kilo Code | Open source | VS Code, JetBrains, CLI, Slack | Cline fork lineage. Multiple modes |
| Aider | Apache 2.0 | Terminal | Direct Git commits. Most mature terminal tool |
| OpenCode | Open source | Terminal | Reuses existing subscriptions |
| Open Interpreter | Apache 2.0 | CLI | Primitive, general-purpose. Native sandboxing |
| Tabby | Open source | Self-hosted server | Code completion focused. For data-residency requirements |
| Devin | Commercial | Cloud | Prototype of this category |

### 4.2 General-purpose and work agents

| Project | License | Character |
| --- | --- | --- |
| Manus | Commercial | Credit-based autonomous tasks. Polished product experience |
| Claude Cowork | Commercial | Managed knowledge-work agent |
| AutoGPT | Open source | Early autonomous agent framework. No sandbox |
| Messaging-native agents | Commercial | Run inside SMS/chat. Conversation-centric, not file artifacts |

### 4.3 Workflow orchestration

| Project | License | Difference |
| --- | --- | --- |
| n8n | Restricted license | Visual editing strength. Predefined flow execution |
| Dify | Open source | LLM app builder. Not goal-based autonomous decomposition |
| Zapier Agents | Commercial | Widest SaaS integration |

### 4.4 Protocols and foundation layers

| Item | Role | Notes |
| --- | --- | --- |
| MCP (Model Context Protocol) | Tool connection standard | All three adopt. AAIF member |
| ACP (Agent Client Protocol) | Agent interoperation standard | goose and OpenHands adopt |
| AGENTS.md | Agent instruction standard | AAIF member |
| aisuite | Provider abstraction | OpenWorker foundation |
| LiteLLM | Provider abstraction | OpenHands foundation |

---

## 5. The problem of tool proliferation

The issue is not too many choices — **choices have started wrapping around each other.**

### 5.1 Nested stacks

As of 2026, this configuration is actually possible:

```
OpenHands Agent Canvas
  └─ Run Claude Code as ACP provider
       └─ 12 MCP servers attached
            └─ One of them calls goose as subagent
                 └─ goose routes to Ollama local model
```

Each layer is reasonable alone. Combined, no one in the org can trace which layer ran what with which permissions. Log formats, permission models, and failure modes differ per layer.

### 5.2 The paradox of standards

MCP and ACP were built to reduce fragmentation. In practice they lowered connection cost and **exploded connection count.** Trust verification cost stayed flat while connections grew — total risk increased. The assumption that standardization improves security does not hold here.

### 5.3 Information decay

Repos move, licenses split, default install paths change faster than documentation. AI-generated review content fills the gap and becomes training data again.
Wrong posts, LLM-misread facts, intentional pollution, human error, and LLM re-citation amplify contaminated information. LLM involvement in information circulation will increase fatigue from AI-generated documents and posts.

**One practical rule: open README and LICENSE yourself.** That is why this document states a measurement date.

### 5.4 Adoption fatigue

All three advertise "five-minute install." Real adoption cost:

| Item | Actual effort |
| --- | --- |
| Install and model keys | 10 minutes |
| Connector auth | 5–15 minutes per tool |
| Permission policy | Hours |
| Org deployment standardization | Days |
| Logging and audit design | Weeks |
| Incident response procedures | Mostly never started |

The lower rows get skipped. Incidents come from the bottom.

---

## 6. CTI perspective: agents as a new black box

### 6.1 Dual black box

LLMs as black boxes is an old critique. Agents add a second layer.

| Layer | Nature of opacity |
| --- | --- |
| Model | Cannot explain why it produced output |
| Orchestration | Hard to reconstruct which tools ran in what order with what permissions |

The second layer is more dangerous. First-layer errors produce wrong sentences; second-layer errors produce **executed commands** — and execution cannot be undone.

### 6.2 An LLM is not an Excel oracle

This framing fits best at the agent defense layer.

goose Smart Approval uses an LLM classifier called PermissionJudge to rate tool-call risk. AdversaryInspector also uses an LLM to interpret natural-language rules and decide whether to block shell commands. **A judgment subject bypassable via prompt injection is used as the prompt-injection defense.**

An LLM is a computation tool. Output variance on input is normal. Final judgment delegated to it makes defense probabilistic — and probabilistic defense cannot be submitted as auditable control. Deterministic controls (path allowlists, egress blocking, mount scope limits, credential scope) must sit in lower layers.

### 6.3 Self-attestation in trust delegation

goose Smart Approval reads MCP's `read_only_hint` field to decide auto-approval. That value is **declared by the MCP server about itself.**

```
Malicious MCP server declares write tool as read_only: true
  → Smart Approval adds it to auto-approve list
  → Runs without user confirmation
```

Trusting declarations without verification is TLS without certificates. The trust-delegation problem from MCP structural vulnerability analysis (CTI-2026-0422-MCP) reproduces here.

### 6.4 Conditions for catastrophic incidents

Agent incidents need three conditions simultaneously:

| Condition | Implementation in all three |
| --- | --- |
| Access to sensitive data | Local files, repos, mail, channel logs |
| Exposure to untrusted input | Web pages, issue bodies, mail, Slack messages, MCP responses |
| External communication ability | Model API calls, connector writes, shell network commands |

All three satisfy these in default configuration. OpenHands webhook-triggered automation keeps the second condition always on. Attach auto-decomposition to a public repo where outsiders can open issues and the issue body becomes remote instructions.

### 6.5 Approval fatigue

Approval gates are the common defense — and a common weakness.

| Stage | User behavior |
| --- | --- |
| Week 1 | Read and judge every approval |
| Week 2 | Skim familiar patterns and approve |
| Week 4 | Approve reflexively |
| Week 6 | Switch to autonomous mode |

goose accelerates this by design: subagents require turning approval mode off. Threat models that treat approval gates as the last line of defense do not hold in practice.

### 6.6 Supply chain

| Path | Risk |
| --- | --- |
| Pipe-to-shell install | goose CLI official install. Script runs without integrity verification |
| Global npm install | OpenHands recommended first path. Entire dependency tree is trusted |
| Arbitrary MCP server connection | Common to all three. No registry verification |
| Auto-update | OpenWorker enabled by default. Compromised channel affects all users immediately |
| Container images | Tag not pinned — image swap risk |

Patterns from GitHub supply-chain analysis (TeamPCP, Mini Shai-Hulud) apply directly. The difference: compromised packages now run **with shell access as a always-on process.**

### 6.7 Credential concentration

Agent adoption practically means credential concentration. Model API keys, GitHub tokens, Slack tokens, Jira credentials, Gmail OAuth tokens converge in one process scope. "Stored in local secret store" also means **single-point exfiltration of everything.**

### 6.8 Threat mapping

| Scenario | ATT&CK technique | Entry point |
| --- | --- | --- |
| Issue-body injection to shell commands | T1059 Command and Scripting Interpreter | Webhook automation |
| Malicious MCP server connection | T1195.002 Compromise Software Supply Chain | Extension install |
| Local secret store theft | T1555 Credentials from Password Stores | Local compromise |
| API keys in config files | T1552.001 Credentials In Files | File-access tools |
| Data steganography in model API traffic | T1071.001 Application Layer Protocol | Normal egress |
| Exfiltration via connectors | T1567.002 Exfiltration Over Web Service | Write-capable connectors |
| Persistence via scheduled automation | T1053.003 Scheduled Task/Job: Cron | Recipes, automation server |
| Approval fatigue abuse | T1204.002 User Execution | Approval UI |
| OAuth token reuse | T1078 Valid Accounts | Connector auth |

### 6.9 Why detection is hard

| Factor | Explanation |
| --- | --- |
| Indistinguishable from normal traffic | Agent model API calls are normal behavior. Payload inspection required to see what leaves |
| Non-determinism | Same input does not produce same tool calls. Baselines are hard |
| Log fragmentation | Frontend, agent server, MCP server, model provider each log differently |
| User attribution | Agent-executed commands log under the user account. Agent subject not distinguished |
| Session volatility | Without preserved conversation context, post-incident reconstruction fails |

### 6.10 Minimum controls

Deterministic controls only — not relying on approval gates or LLM judgment.

| Layer | Control |
| --- | --- |
| Execution | Container isolation as default. No direct host execution |
| Files | Mount scope limited to project directory. No full home directory mount |
| Network | Egress allowlist. Model endpoints and required connectors only |
| Credentials | Least privilege. No org-wide tokens. Dedicated agent accounts |
| Extensions | MCP server allowlist. Do not trust `read_only_hint` |
| Versions | Disable auto-update, pin image tags, commit lockfiles |
| Permission modes | Block autonomous mode in deployment images. Enforce via Custom Distros, etc. |
| Audit | Central session transcript collection. Agent subject identifier |
| Triggers | Do not connect externally writable text to instruction paths |
| Cost | Provider console limits as anomaly detection signal |

### 6.11 Conclusion

Agents are productivity tools and simultaneously **always-on processes with shell access that accept untrusted external text as instructions and consolidate organizational credentials in one place.**

None of this is exaggeration — all confirmed in official documentation for the three projects. The problem is these facts are rarely discussed during adoption review.

This is not "do not adopt." It means **paste the paragraph above into your adoption document and start there.**

---

## 7. Adoption checklist

| # | Item | Done |
| --- | --- | --- |
| 1 | Opened LICENSE text; identified open-core boundaries | |
| 2 | Repository URL and org name still valid | |
| 3 | Default install path has execution isolation; if not, standardized on isolated path | |
| 4 | Verified default permission mode and reset to org standard | |
| 5 | Identified features that force bypassing approval gates (e.g., subagents) | |
| 6 | If using cloud models, listed what data leaves | |
| 7 | Defined MCP server allowlist | |
| 8 | Minimized credential scope; separated dedicated accounts | |
| 9 | Identified where externally writable text enters instruction paths | |
| 10 | Operating network egress allowlist | |
| 11 | Session log retention and sensitive-data masking plan | |
| 12 | Set model cost limits | |
| 13 | Auto-update policy and version pinning decided | |
| 14 | Agent incident response documented | |
| 15 | Exit plan assuming project structure may change in six months | |

---

## 8. Document conventions

- All metrics from direct repository page inspection with measurement date stated. Secondary sources cite source and variance.
- Install steps from official README only. No blogs or tutorials.
- License from LICENSE file text.
- Vendor marketing not copied verbatim. Privacy and security claims verified at implementation level.
- No emojis.

---

## 9. References

| Project | Repository | Docs |
| --- | --- | --- |
| OpenWorker | github.com/andrewyng/openworker | openworker.com |
| aisuite | github.com/andrewyng/aisuite | — |
| goose | github.com/aaif-goose/goose | goose-docs.ai |
| Agentic AI Foundation | — | aaif.io |
| OpenHands | github.com/OpenHands/OpenHands | docs.openhands.dev |
| Agent Canvas | github.com/OpenHands/agent-canvas | — |
| software-agent-sdk | github.com/OpenHands/software-agent-sdk | — |
| Model Context Protocol | — | modelcontextprotocol.io |

---

*This document was written with no vendor affiliation. Adoption decisions depend on each organization's threat model and regulatory requirements.*
