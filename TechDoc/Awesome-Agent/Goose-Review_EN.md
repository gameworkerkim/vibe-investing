<!--
---
title: "Goose Review — Open-Source AI Agent under Linux Foundation AAIF"
title_ko: "Goose 리뷰 — Linux Foundation AAIF 산하 오픈소스 AI 에이전트"
subtitle: "Universal local agent runtime. Governance-neutral, Apache 2.0, desktop·CLI·API"
description: "TechDoc on goose — donated from Block to Linux Foundation AAIF — covering concept, permission modes, pros and cons, positioning vs OpenWorker and OpenHands, plus install and adoption checklists."
abstract: |
  goose is an Apache 2.0 local AI agent that started at Block and was donated to the Linux Foundation Agentic AI Foundation on 2026-04-07.
  Rust implementation, desktop·CLI·embeddable API, 70+ MCP extensions, and ACP support are core strengths.
  The default permission mode is Completely Autonomous and subagents only run in autonomous mode — the biggest caveat is the structural tradeoff that you must disable approval gates to get full performance.
summary_for_ai: |
  Third-party tech review of github.com/aaif-goose/goose (51.7k stars, ~5130 commits as of ~2026-07-27).
  Apache 2.0, AAIF/Linux Foundation governance. Rust Cargo workspace. Modes: Completely Autonomous (default), Smart Approval, Manual Approval, Chat Only.
  Subagents only in autonomous mode. Closest peers: OpenWorker (knowledge work), OpenHands (orchestration).
  Not investment advice. Verify current stars and install paths before citing.
date: 2026-07-27
updated: 2026-07-27
author: "Dennis Kim"
lang: en
tags: [goose, AAIF, Linux Foundation, AI Agent, LLM, MCP, ACP, Open Source]
keywords: ["goose AI agent", "AAIF goose", "Linux Foundation agent", "local AI agent", "MCP extensions", "Goose vs OpenWorker"]
group: llm-agents
featured: true
featured_rank: 6
schema_type: TechArticle
draft: false
robots: index,follow
---
-->

# Goose, an Open-Source AI Agent Donated to the Linux Foundation

| Field | Detail |
| --- | --- |
| Project | goose |
| Origin | Started at Block (parent of Square, Cash App, Tidal); now under the Agentic AI Foundation (AAIF) |
| Governance transfer | 7 April 2026, donated to Linux Foundation AAIF (same foundation as MCP and AGENTS.md) |
| License | Apache 2.0 |
| Repository | github.com/aaif-goose/goose (migrated from block/goose) |
| Repository scale | 51.7k stars, 5.7k forks, 5,130 commits, 225 open issues, 180 open PRs |
| Documentation | goose-docs.ai |
| Implementation | Rust (Cargo workspace) |
| Supported OS | macOS (Apple Silicon/Intel), Linux (DEB, etc.), Windows |
| Delivery surfaces | Desktop app, CLI, embeddable API |

---

## 1. Concept

goose's claim is a **general-purpose local agent that goes beyond code suggestions**. It started as a coding tool, but its current positioning spans research, document writing, automation, and data analysis. What sets it apart from every competing project is that governance sits with a Linux Foundation foundation rather than a single vendor.

The flow works like this.

| Stage | What happens |
| --- | --- |
| 1 | Start a session (desktop app, CLI, or embedded API) |
| 2 | Enter a natural-language instruction. goose plans and decomposes it into tool calls |
| 3 | Every tool call passes through ToolInspectionManager. Security and Egress inspectors stack and inspect |
| 4 | Depending on the active permission mode: auto-approve, wait for user approval, or block |
| 5 | When needed, spawn subagents for parallel work, then merge results |

### Architecture

```
goose Desktop (Electron/native shell)  |  goose CLI  |  Embeddable API
                    |
              goose-server (goosed)     local backend daemon
                    |
                goose (core)            agent loop, providers, permissions, sessions
                    |
        goose-mcp  |  external MCP servers  |  ACP providers
                    |
   local files · shell · 70+ extensions · 15+ model providers
```

The Cargo workspace splits into `goose` (core), `goose-cli`, `goose-server`, and `goose-mcp` crates so the CLI and desktop app share the same core. Configuration lives in a single `~/.config/goose/config.yaml` shared by CLI and desktop.

### Permission model

Session-level modes (GooseMode) and per-tool permissions apply in tandem.

| Mode | Behavior | Subagents |
| --- | --- | --- |
| Completely Autonomous | Run everything automatically without approval. Default | Available |
| Smart Approval | LLM-based PermissionJudge classifier assesses risk and selectively asks for approval | Not available |
| Manual Approval | User confirmation for every tool call | Not available |
| Chat Only | Block tool access entirely. Inject a no-tools state into the system prompt | Not available |

Smart Approval reads the MCP standard `ToolAnnotations.read_only_hint` field and automatically queues non-read-only tools for approval. Runtime overrides beat config-file settings; the CLI uses slash commands like `/mode approve`, and the desktop uses UI toggles for instant switching.

### AdversaryInspector

An additional inspection layer enabled by placing a file at `~/.config/goose/adversary.md`. Frontmatter specifies which tools to inspect (defaults: `shell` and `computercontroller__automation_script`); natural-language rules below the delimiter let an LLM judge each tool call right before execution. You can describe policies that block data-exfiltration or destructive commands while allowing routine development work.

---

## 2. Strengths

| Area | Detail |
| --- | --- |
| Governance neutrality | Under Linux Foundation AAIF. Project direction is not driven by a single company's commercial judgment. The biggest plus in enterprise vendor-risk assessments |
| License | Apache 2.0. Unlike AGPL-style licenses, embed, redistribute, and commercialize without source-disclosure obligations. A practical difference for companies embedding agents in their own products |
| Maturity | 5,130 commits, 51.7k stars, 5.7k forks, hundreds of contributors. Not an early-stage project — already on a production track |
| Full support on 3 OSes | Official desktop apps for macOS, Linux, and Windows. Linux support is a rare strength vs competitors |
| Surface diversity | Desktop app, CLI, and embeddable API. Interactive work and unattended CI/CD runs on the same core |
| ACP support | Agent Client Protocol implementation. Attach goose as an ACP server in Zed, JetBrains, and VS Code; conversely reuse existing Claude Code or Codex subscriptions as providers. A path to burn existing subscriptions without new API billing |
| Model flexibility | 15+ providers: Anthropic, OpenAI, Google, Azure, Bedrock, OpenRouter, Ollama, and more. Fully local execution possible |
| Extension ecosystem | 70+ MCP extensions in the official registry. Arbitrary MCP servers can be connected |
| Subagents | Parallel subagent spawn per session. Each subagent can use a different provider than its parent, enabling cost-optimization patterns that delegate to cheaper models |
| Recipes + Scheduler | YAML recipes pin system instructions, extension lists, response schemas, and retry policies; cron schedules repeat runs. URL sharing and a Recipe Cookbook are provided |
| Layered security | Permission modes, per-tool permissions, prompt-injection detection, sandbox mode, and AdversaryInspector exist as independent layers |
| Custom Distros | Official support for building org-specific distributions with pre-baked providers, extensions, and branding. Practically necessary for organizational rollout |
| Rust implementation | Native performance, low resource footprint, minimal runtime dependencies |

---

## 3. Weaknesses and Caveats

| Area | Detail |
| --- | --- |
| Autonomous mode by default | Default permission mode is Completely Autonomous. Aggressive as a safe default for an agent with shell and file access; must be reconfigured for organizational deployment |
| Safety vs parallelism tradeoff | Subagents only run in autonomous mode. To use parallel performance you must disable all approval gates. Design close to a structural flaw; strong incentive in practice to turn safety off |
| LLM-dependent defenses | Both Smart Approval's PermissionJudge and AdversaryInspector use an LLM as the judge. Defense layers themselves become prompt-injection targets with no deterministic guarantees. Hard to submit as auditable controls |
| read_only_hint trust problem | Whether a tool is read-only is a value the MCP server declares about itself. A malicious or careless server can label write tools read-only and slip through auto-approval. Extension supply-chain verification is entirely on the user |
| No native connectors | Work tools like Slack, Jira, and Gmail all require separate MCP server installs and individual auth. The "70+ extensions" figure reflects ecosystem size, not plug-and-play connectors. Significant initial setup cost |
| Developer bias | Docs, quickstart, and recipe examples skew toward coding scenarios. Claims to be general-purpose but onboarding for non-developers is weak |
| Not outcome-oriented | Emitting documents or spreadsheets as files depends on extensions and prompts. The product does not guarantee output formats |
| Compliance gaps | No SOC 2, HIPAA, or similar certifications. A disqualifier where regulated industries require certified vendors |
| Cost management | BYOK structure — app is free but model charges are fully user-paid. Parallel subagent spawn sharply increases token burn. Provider-side limits are practically mandatory |
| Maintenance backlog | 225 open issues, 180 open PRs. A sign of activity and of review bottlenecks |
| Source build burden | Building the full Rust workspace consumes significant time and disk. Binary releases are the de facto default path |
| Commercial onboarding nudge | Quickstart steers toward Tetrate Agent Router as the recommended path with free credits. Less a foundation neutrality issue than a need to recognize the default path routes through a specific routing service |

---

## 4. Similar and Competing Projects

| Project | License | Character | vs goose |
| --- | --- | --- | --- |
| OpenWorker (Andrew Ng, Rohit Prasad) | MIT | Local desktop agent for knowledge workers. 25+ native connectors, artifact files returned | Strong on instant work-tool integration and typed approval gates. But early open beta, no Linux support, ecosystem orders of magnitude smaller than goose |
| OpenHands (All Hands AI) | MIT | Autonomous coding agent. Docker sandbox, SDK·CLI·cloud, Kubernetes deployment | Strong on isolated execution and SWE-bench performance. Issue-resolution focused rather than general work. Heavier and higher infra requirements than goose |
| Claude Code | Commercial | Anthropic official CLI agent | High polish from single-model optimization. No model choice or local data control. Can be reused in goose as an ACP provider |
| Cline / Kilo Code | Open source | IDE agents embedded in VS Code, JetBrains | Tight IDE workflow fit. goose leads on terminal, automation, and scheduling |
| Aider | Apache 2.0 | Terminal-first, Git commit direct | Mature single-purpose tool. No extension ecosystem or GUI |
| OpenCode | Open source | Terminal-first, reuse existing subscriptions | Lightweight. No desktop app or scheduler |
| Open Interpreter | Apache 2.0 | CLI local code-execution agent | More primitive. No MCP ecosystem or permission layers |
| n8n / Dify | Mixed (n8n has restrictive license) | Workflow orchestration | Runs predefined flows. goose recipes are more agentic but weaker on visual editing and admin UI |
| Manus | Commercial | Credit-based autonomous task agent | Polished product experience and cloud execution. Not open source |

### Positioning summary

At this point it is the de facto reference in the open-source local agent category. On scale, governance, license, OS coverage, and surface diversity, alternatives are not clearly better on any axis. OpenWorker claims a narrow edge on "work deliverables" UX framing; OpenHands on "sandbox and benchmarks"; goose occupies the general-purpose platform slot between them.

The cost of growing into a platform is looser safety defaults. Autonomous mode as default and subagent mode constraints structurally force a "turn off defenses to get performance" choice — the first blocker in regulated deployments.

---

## 5. Getting Started

### 5.1 Desktop app installation

| OS | Method |
| --- | --- |
| macOS (Apple Silicon) | Download `Goose.zip` from releases, unzip, run the executable |
| macOS (Intel) | Same procedure with `Goose_intel_mac.zip` from releases |
| Linux (Debian/Ubuntu) | Download DEB, `sudo dpkg -i (filename).deb`, launch from app menu |
| Windows | Download ZIP, unzip, run the executable |

Download paths are documented at goose-docs.ai/docs/getting-started/installation.

### 5.2 CLI installation

```bash
curl -fsSL https://github.com/aaif-goose/goose/releases/download/stable/download_cli.sh | bash
```

On Windows use `download_cli.ps1`. If PATH warnings appear after install, register PATH before running `goose configure`. On Windows keyring errors, disable keyring storage and proceed.

If pipe-to-shell install violates org policy, download the script first, review it, then run.

### 5.3 Provider configuration

```bash
goose configure
```

Menu structure:

```
◆ What would you like to configure?
  ● Configure Providers      Change providers and refresh credentials
  ○ Add Extension
  ○ Toggle Extensions
  ○ Remove Extension
  ○ goose settings
```

The provider list includes Amazon Bedrock, Amazon SageMaker TGI, Anthropic, Azure OpenAI, ChatGPT Codex, Claude Code CLI, Tetrate Agent Router, and more. GitHub Copilot connects via auth code rather than an API key.

The desktop app welcome screen on first launch lets you choose direct API key entry, ChatGPT subscription linking, Tetrate Agent Router, or OpenRouter.

### 5.4 Fully local setup (Ollama)

```bash
ollama pull qwen3

# ~/.config/goose/config.yaml
# GOOSE_PROVIDER: ollama
# GOOSE_API_BASE: http://localhost:11434
```

The only configuration with no external data transmission. Multi-step tool-call accuracy still needs separate validation; parallel subagent runs bottleneck on local hardware.

### 5.5 Sessions and extensions

```bash
goose                       # start new session
goose session -r            # resume previous session
goose run --no-session -t "<task>"   # headless one-shot run (CI/CD)
```

Add extensions via `goose configure` > `Add Extension` > `Built-in Extension`. For web scraping and browser control, enable the `Computer Controller` extension and set timeout to 300 seconds.

### 5.6 Permission mode switching

```
/mode auto        fully autonomous
/mode smart       risk-based selective approval
/mode approve     manual approval for all
/mode chat        block tools
```

For organizational deployment, force default to `smart` or `approve`. Communicate upfront that subagents are disabled in those modes.

### 5.7 Context and recipes

| Target | File and location | Purpose |
| --- | --- | --- |
| Project hints | `.goosehints` | Continuously inject project conventions, prohibitions, build steps into sessions |
| Agent instructions | `AGENTS.md` | Standard-format agent directives |
| Adversary inspection rules | `~/.config/goose/adversary.md` | LLM judgment rules for high-risk tool calls such as shell |
| Recipes | YAML | System instructions, task prompts, extension lists, response schemas, retry policies |
| Global settings | `~/.config/goose/config.yaml` | Providers, extensions, modes. Shared by CLI and desktop |

Recipes can be pulled from the Recipe Cookbook; Recipe Generator and Deeplink Generator create and share them. Combined with Scheduler, cron runs them unattended.

### 5.8 Source build

Prerequisites: Rust toolchain (pinned in `rust-toolchain.toml`), Node (UI build), Just

```bash
git clone https://github.com/aaif-goose/goose
cd goose

just                # list Justfile tasks
cargo build          # build workspace
```

If an existing clone still points at `block/goose`, update the remote.

```bash
git remote set-url origin git@github.com:aaif-goose/goose.git
```

See `BUILDING_DOCKER.md` for Docker builds, `BUILDING_LINUX.md` for Linux builds, and `flake.nix` for Nix users.

### 5.9 Repository structure

| Path | Contents |
| --- | --- |
| `crates/goose` | Core agent logic, providers, permissions, sessions, subagents |
| `crates/goose-cli` | Command-line interface |
| `crates/goose-server` | Desktop app backend daemon (goosed) |
| `crates/goose-mcp` | Built-in MCP server implementations |
| `ui/` | Desktop app frontend |
| `documentation/` | Official documentation source |
| `evals/harbor` | Evaluation harness |
| `recipe-scanner/` | Recipe static analysis tool |
| `oidc-proxy/` | OIDC proxy |
| `workflow_recipes/` | Workflow recipe examples such as release risk checks |

### 5.10 Pre-adoption checklist

| Check | Decision criteria |
| --- | --- |
| Default permission mode | Pin to non-autonomous in deployment images. Enforceable via Custom Distros |
| Subagent policy | Decide upfront whether parallel processing or keeping approval gates matters more |
| Extension whitelist | Fix org-wide list of allowed MCP servers. Do not treat read_only_hint as a trust basis |
| AdversaryInspector rules | Deploy standard templates blocking data-exfiltration commands. Do not treat LLM judgment as the final defense line |
| Shell access scope | Limit working directories via developer extension access-control settings |
| Cost ceiling | Set limits in provider console. Subagent parallel spawn increases consumption non-linearly |
| Compliance | Disqualified where certified vendors are required. Confirm whether internal audit can substitute first |
| Logging and audit | Design session transcript retention and sensitive-data masking separately |

---

## References

- Repository: https://github.com/aaif-goose/goose
- Documentation: https://goose-docs.ai/
- Quickstart: https://goose-docs.ai/docs/quickstart
- AAIF transfer announcement: https://goose-docs.ai/blog/2026/04/07/goose-moves-to-aaif/
- Foundation: https://aaif.io/projects/goose
- Governance: https://github.com/aaif-goose/goose/blob/main/GOVERNANCE.md
- Custom distributions: https://github.com/aaif-goose/goose/blob/main/CUSTOM_DISTROS.md

#goose #AAIF #LinuxFoundation #AIAgent #OpenSource #MCP #ACP #WorkAutomation #LLM
