# Red Team Guide with AntiFox

English edition — translated from the Korean original (AntiFox-Guide.md). Sync date: 2026-11-14. In case of discrepancy, the Korean original takes precedence.

**How to operate an AI multi-agent autonomous simulated penetration platform safely and evidence-based, in an authorized isolated environment**

> **v1.0-rc · proofread·verified edition (release candidate)** Author: Dennis Kim (김호광) · Betalabs Inc. Intended readers: red team operators · security consultants · blue/purple teams · enterprise·institution adoption reviewers · entry-level learners Target version: AntiFox v2.0.x line (repository check: 2026-11) Distribution: free distribution for knowledge sharing — no paywall
>
> *Reasons for release candidate status: (1) legal review completed, (2) additional simulated-test verification of the installation (LLM-connected task execution·report generation) — once these 2 items are done it will be finalized as v1.0. (3) Actual screenshot insertion was **completed on 2026-11-14** (10 official originals + 8 local real captures, Chapter 5), and real-field verification of the installed UI was also **completed on 2026-11-14** (SHA256-verified installation of the v2.0.3 binary, Chapter 6). Until the remaining 2 items are done, read it as "pending verification".*

---

> **Legal·ethical notice + upstream usage policy — must read first**
>
> This document was written on the premise of **authorized testing** and **learning·research·technical verification in isolated lab environments owned and controlled by the reader**. Running it against third-party systems or internet-exposed assets without written consent (authorization letter·ROE·scope agreement) can be subject to criminal punishment under the Information and Communications Network Act (정보통신망법)·Criminal Act (형법) and others (Appendix C). In fact, AntiFox is a **tool with reported abuse cases such as credential theft**, and even in 2026-11, AntiFox-linked attacks were reported in the news (Chapters 8·10).
>
> **Upstream (official AntiFox) usage policy** — the official README states that this tool is **"permitted only for personal learning·code research·local technical verification"** and **prohibits real testing against any online/production systems, red/blue adversarial exercises, and production use** (AGPL-3.0, confirmed 2026-11). Therefore, the "Red Team" this guide refers to is **limited to adversarial simulation·learning in owned, authorized isolated environments**; attacking real external targets violates both this tool's license·policy and the law. This guide does not provide specific exploits or attack recipes, and focuses on methodology·safe configuration for defense, verification, and report automation. This document is not legal advice.

---

## Terminology standard (unified in this edition)

Mistranslations·mixed usage that entered from the Chinese source material are unified as follows. In particular, **do not conflate "use"(이용) and "abuse"(악용)** — in security documents their meanings are completely different.

| Notation in this document | Meaning | Notation not used (mistranslation) |
| ----------------------------- | -------------------- | -------------------- |
| **abuse / exploit** | Actually using a vulnerability in an attack | "use"(이용/利用) |
| **exploit chain / attack chain** | Entry point→staged exploitation path | "use chain"(이용체인) |
| **reproduction** | Re-running an attack to prove it | "re-reproduction"(복현/复现) |
| **delivery-grade** | Quality deliverable to a customer | "manual-grade"(인공급/人工级) |
| **enrichment** | Enriching findings into structured data | "enrichment"(富化) |
| **base** | The code/structure serving as a foundation | "base"(底座) |
| **issuer / assignee(담당자) / subset** | issuer / 人员 / subset | "issuer·人员·subset"(출具方·人员·子집합) |
| **Report languages: Simplified·Traditional Chinese·English** | Official output, 3 kinds (简/繁/英) | "Korean·Chinese·English" (error in the source material) |

> **Report language correction** — AntiFox's official report output comes in 3 kinds: **Simplified Chinese·Traditional Chinese·English**. The "Korean" support notation in the early material was an error; **Korean is not an officially supported language** (translate separately if needed).

---

## v1.0-rc change summary (reflecting the v0.3 review)

**Quality corrections (P0)**

- **Full correction** of Chinese characters·mistranslations (출具方→발주처 (issuer), 人员→담당자 (assignee), 子집합→부분집합 (subset), 底座→기반 (base), 富化→보강 (enrichment), 인공급/교부급→납품급 (delivery-grade), 복현→재현 (reproduction), **이용→악용/익스플로잇 (use→abuse/exploit)**, 이용체인→익스플로잇 체인 (use-chain→exploit chain))
- Report language **correction** (not Korean → Simplified·Traditional Chinese·English)
- **Withdrawal of the "final" claim** → v1.0-rc, new terminology standard table above
- **Accuracy improvements (P1)**
- **Footnotes** added to the Sigma examples (not core spec·correlation rule required·backend mapping) + spec guidance
- Chapter 12 additions: **RTO/RPO·legal hold·chain of custody**
- **Filled-in example** added to Appendix E (fictional ACME internal-network ROE)
- `config.json` **Docker vs binary comparison table**, global egress proxy and other real features reflected
- **Completeness (P2·P3)**
- 10.3 **log pipeline (DB→SIEM) architecture**, retention-period **automation** (partitioning·TTL·cron), price **sources·verification methods**, screenshot **licensing** noted, Chapters 5-6 **direct capture guide**, legal review section marked **"draft"**

## 2026-11-14 changes — repository due diligence·screenshot reflection

- **Cloned due diligence** of the official repository (`github.com/AntiFox-AI/antifox`) to re-verify all facts (v2.0.3 latest release, CHANGELOG, `.env.example`, `config.example.json`, `docker-compose.yml`, `deploy/antifox.service`)
- **9 screenshots inserted** (Chapter 5) — login·dashboard·tasks·finding-steps·traffic-packet·env-leak·findings + demo.gif·login-en·wechat-qr originals included, AGPL attribution notice
- **At-a-glance architecture·process infographic included** (beginning of Chapter 1, `AntiFox-Guide-overview.png`)
- **Real-field verification (installed UI, 2026-11-14)** — installed the official v2.0.3 macOS (arm64) binary in a local isolated lab (PostgreSQL 16) **after SHA256 verification**, included **8 real captures** of `/setup`→login→dashboard→LLM config→new task (egress selection)→report management→system settings→RBAC screens (5.1·5.8). Confirmed in the UI: v2.0.3 version indication·global egress proxy·LLM failover·per-role models·built-in intercept rules·RBAC 4 roles
- `config.json` **real-field verification completed** (Chapter 6) — `database` block 6 fields + `ANTIFOX_PG_DSN` precedence
- **Official README architecture diagram included** (Chapter 1), **compose·systemd real-file behavior reflected** (Chapter 6 — ports `8787`/`8788`, exit 75 atomic swap, `ANTIFOX_UPDATE_PROXY`)
- Confirmed releases provide **`SHA256SUMS`** (Chapter 6 integrity verification ① updated)
- **Official channels organized** — no separate website, 3 channels: GitHub·GHCR·WeChat (1·5·Appendix G)

---

## Reading paths by reader type

| If you are… | Read in this order | Key output |
| ----------------- | --------------------------------- | --------------------- |
| **Red team operator** | 2 → 7 → 6 → 8 → 12 → 5 → Appendices A·B | How to run safely and leave evidence |
| **Security consultant** | 1 → 4 → 8 → Appendices B·E → 9 | Tool selection rationale·deliverables·contract templates |
| **Blue/purple team** | 2 → 10 → 4 → 7 | Detecting agent behavior·rule improvements |
| **Adoption reviewer (enterprise·institution)** | Legal notice → 6 → 8 → 11 → 12 → Appendices C·D·E | Risk·budget·legal·backup in executive language |
| **Entry-level learner** | 3 → 1 → 4 → Appendix F (glossary) → 9 → 11 | Concepts·history·principles first |

---

## Table of contents

**Main text**: 1. Introduction · 2. Red Team composition principles · 3. History · 4. Benefits and risks · 5. Features·screenshots·masking · 6. Installation and hardening · 7. Safety controls · 8. Scenarios · 9. Financial·public sector and open-weight · 10. Blue team detection·logging · 11. Budget·environment · 12. Operations (backup·recovery·IR·chain of custody·troubleshooting·organization-size checklist·TCO) **Appendices**: A. Walkthrough · B. Report sample · C. Legal checklist · D. AGPL · E. Contract·operations templates · F. Glossary · G. References

---

# 1. Introducing AntiFox

AntiFox is an **AI multi-agent autonomous penetration testing platform** secondarily developed from ARTEX (author @Autumn-27) v0.1.1. Its core aim is not just "discovery" but **"delivery (handover)"** — turning vulnerabilities found by AI into an evidence-backed report that engineers can understand and reproduce.

### At a glance — architecture·process summary

[![AntiFox architecture·process at a glance](https://github.com/gameworkerkim/vibe-investing/raw/main/TechDoc/AntiFox/AntiFox-Guide-overview.png)](https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/AntiFox/AntiFox-Guide-overview.png)

> **Figure 1-0.** Authorized user (analyst/Red Team) → web console (Next.js) → Go API·event engine → multi-agents (Planner·Worker×N·Mainagent) → dual graph (global asset graph ↔ anchors ↔ per-task exploration graph) → MITM request·response evidence → finding verification → DOCX report. Bottom, the full 5-step process: ① scope approval ② planning ③ execution ④ evidence linkage ⑤ human review·reporting. The premise of the figure is the principle **"isolated lab only · use only within authorized scope"**. (The mermaid diagram in the "Official technical architecture" below is the official README version of the same structure.)

### Overview at a glance (repository checked 2026-11)

| Item | Contents |
| ------ | ------------------------------------------------------------------------ |
| Base | Secondarily developed from ARTEX v0.1.1 |
| Tech stack | Go single binary (Next.js embedded via `go:embed`) · PostgreSQL (+pgvector) |
| Required runtime | Go 1.24+ / Node 20+ / PostgreSQL / Python 3 (report rendering) |
| License | AGPL-3.0 (Appendix D) — **usage policy: only personal learning·local isolated verification permitted** |
| Current version | **v2.0.3** (released 2026-10-30) |
| Default ports | `8787` (web console, first-run `/setup` sets the admin password) · `8788` (MITM traffic recording proxy) |
| Container | `ghcr.io/antifox-ai/antifox` |
| Agents | planner (intent generation) · worker ×N (execution) · mainagent (human interface) |
| Knowledge structure | Global asset graph + per-task exploration graph (dual graph, interconnected via anchors) |
| Report languages | Simplified·Traditional Chinese·English (Korean not supported) |
| Official channels | GitHub repository·Releases · GHCR package · WeChat official account — **no separate website** (confirmed 2026-11-14) |

### Official technical architecture (per README)

Go single binary (Next.js frontend embedded via `go:embed`) + PostgreSQL. The core is the **dual graph** — a global asset graph (shared source of truth across tasks) + a per-task exploration graph (a lineage chain of goals·intents·facts·vulnerabilities), interconnected via anchors. The engine is **event-driven**: when the graph changes, the planner generates intents, workers write back execution results, and that in turn raises new events.

```mermaid
flowchart TB
  subgraph FE[Frontend Next.js · single binary with go:embed]
    UI[Dashboard · Tasks · Findings · Assets · Traffic · Reports · Knowledge Base]
  end
  subgraph SRV[server · Go net/http]
    API[REST /api · JWT · SSE]
    ENG[engine event-driven scheduling]
  end
  subgraph AG[multi-agent orchestration]
    PL[planner planning · sole intent generator]
    WK[worker execution ×N]
    MA[mainagent human interface]
  end
  subgraph DB[PostgreSQL]
    AGRAPH[asset graph · global shared]
    EGRAPH[exploration graph · per-task independent]
  end
  SUB[MITM traffic recording · HITL intercept · asset enrichment · reports · knowledge base RAG]

  UI --> API --> ENG --> PL & WK
  API --> MA
  PL & WK & MA --> DB
  WK --> SUB
```

> Source: mermaid diagram from the official README's "Technical architecture" section (confirmed 2026-11-14, labels translated into English).

### What makes it different from other Red Team security tools

- **Reproduction process recorded immediately** — at the same time as exploitation, each step's request·response·expectation·verification conclusion is recorded in structured form in the DB (not post-hoc reconstruction).
- **Exploit chain shown step-by-step on the findings page** — from entry point·preconditions to staged exploitation, each step consists of a natural-language description + the actual request.
- **Steps automatically linked to real traffic** — all requests during a task are MITM-recorded and matched to each step by time window·sequence (syntax highlighting·body search·hit counts).
- **Delivery-grade reports** — AI narrative + python-docx producing delivery-grade `.docx` (cover/table of contents/pagination/per-vulnerability attribute tables). Full support for **Simplified Chinese·Traditional Chinese·English**.

> Actual features the repository specifies: **RBAC multi-user** (permission matrix·system roles·resource-level scoping·login auditing), **rule-based HITL intercept** (inherited from the ARTEX base), **global egress proxy** (v2.0.3 — sends all agent traffic through a single http/https/socks5 proxy, source IP hiding/hopping, per-task direct/proxy selection, egress IP echo availability test), **confirm-to-enrich** (when a human confirms a vulnerability it is automatically enriched into structured data), report management (by default only confirmed vulnerabilities are included, naming template: issuer·logo·assignee·CVSS, selectable vulnerability subset inclusion), automatic evidence caption generation (based on reproduction step text, editable), 4-level vulnerability severity·batch enrichment, dual global+task pgvector RAG, one-click update (SHA256·atomic swap·rollback on failure), MCP/Skill extensions.

> **The strength is itself the risk** — automatic evidence collection means **credentials·sessions·requests/responses accumulate in PostgreSQL**. A supply-chain incident in the ARTEX family base was also confirmed: the **2026-11-06 CSA (Cloud Security Alliance) analysis "Trojanized Offensive AI Tooling: The ARTEX Docker Backdoor"** revealed that the Docker Hub images `tomicdd/artex` (and `congdonglinux/artex`) had **an unauthenticated root command execution backdoor hidden in the login handling**, downloaded about 9,000 times. **There is currently no evidence that AntiFox itself was infected** (the official Compose uses GHCR `ghcr.io/antifox-ai/antifox`) — but the key lesson is "a clean source does not guarantee a clean image". Before adoption, establish first (1) data retention·access control·destruction, and (2) distribution image provenance·integrity verification (Chapters 6·7·12, Appendix G).

### Comparison with competing projects

| Project | Characteristics | Relationship to AntiFox |
| ---------------------------------- | --------------------------------------------- | -------------------------------- |
| **ARTEX** | Exploration graph engine·MITM·HITL·multi-agent | Direct ancestor. Original closed-sourced after attack abuse |
| **PentAGI** | Fully autonomous, Docker, orchestrates Nmap·Metasploit·sqlmap | Closest alternative in design philosophy |
| **Agent Zero** | General-purpose autonomy, many cases deployed without authentication | Lightweight·general-purpose |
| **PentestGPT** | LLM-assisted, ranks high on the XBOW benchmark | Strengths in exploration·reasoning assistance |
| **HexStrike AI · Strix · RedAmon** | Tool-integration type · app-specific · MIT flexible | Niche alternatives, each |

> **Summary** — PentAGI for replacing ARTEX; if **report automation** is the core need, AntiFox's evidence-driven approach is the differentiator.

---

# 2. Principles of Red Team composition

The team comes before turning on the tool. Agents like AntiFox only **amplify** part of red team work; they are not the red team itself.

> **A shift in perspective — not a "tool" but "infrastructure holding privileges"** — an autonomous agent holds not only target information but also API keys·credentials·network access rights. Therefore, treat AntiFox not as a mere penetration testing program but as **execution infrastructure for agents that hold security privileges**, and apply that level of control (Chapters 6·7·12) throughout adoption·operation·decommissioning. The ARTEX backdoor incident (Chapters 1·6) shows why.

### Red · Blue · Purple

- **Red** — the attack side that emulates attackers to test detection·response.
- **Blue** — detection·response·defense (SOC·DFIR).
- **Purple** — red and blue collaborating in real time to improve detection rules together.

> Autonomous agents are especially valuable in **purple teams** — reproducible evidence immediately reveals "at which request detection was missing" (Chapter 10).

### Simulated penetration vs red team vs vulnerability assessment

| Type | Purpose | Scope | Stealth |
| ---------- | ------------- | ------ | --- |
| Vulnerability assessment (VA) | Identify·catalog known vulnerabilities | Broad and shallow | Not needed |
| Simulated penetration | Verify exploitability | Defined scope | Optional |
| Red team assessment | Goal achievement·detection testing | Goal-oriented | Required |

AntiFox automation accelerates the **VA-to-simulated-penetration** range. Full-scale red team assessments (stealth·goal decision-making) remain human-driven.

### Standard frameworks

Cyber Kill Chain · MITRE ATT&CK · PTES · OSSTMM / NIST SP 800-115.

### The engagement lifecycle and where AntiFox fits

| Stage | AntiFox contribution | Human responsibility |
| ------------------- | ------------ | ----------------- |
| ① Pre-negotiation (scope·ROE·authorization letter) | — | Entirely human |
| ② Reconnaissance · ③ Enumeration | Automated graph·mapping | Filtering out-of-scope·prioritization |
| ④ Verification | Agent verification + evidence | Screening False Positives |
| ⑤ Follow-up exploitation | Assistance | Decision-making·stealth |
| ⑥ Reporting | Draft docx in 3 languages | Business context·review |

> **Do not skip step ①** — running without a written scope agreement·authorization letter is illegal, and upstream policy also prohibits use against real environments. An ROE must include (a) a target whitelist, (b) prohibited actions, (c) a time window, (d) an emergency stop contact line (Appendices C·E).

---

# 3. History of red teaming and simulated penetration

"Red team" came from war, not security. People who try to break friendly plans through the enemy's eyes — that lineage explains the emergence of AntiFox.

- **Cold War·wargames (1950s–60s)** — the "red team" role took root in simulated exercises attacking one's own strategy from the Soviet (red camp) perspective.
- **Tiger teams (1960s–70s)** — deliberate attack teams of the US government·RAND. The *Anderson Report*·*Multics evaluation* left the prototype of penetration testing.
- **The tool era (1990s–2000s)** — Nmap (1997)·Nessus (1998)·Metasploit (2003), the OSSTMM·PTES·OSCP ecosystem.
- **APT·emulation (2010s)** — adversary emulation rose, and **MITRE ATT&CK** (internal 2013/public 2015) became the common language.
- **LLM·autonomous agents (2023– )** — from PentestGPT-type assistance to multi-agent autonomous pentesting like ARTEX·PentAGI·AntiFox. AntiFox is the "evidence·report automation" branch.

> *Tools have kept lowering the threshold of attack, and each time the discipline of "who takes responsibility and how far it goes" has chased after the tools.*

---

# 4. Benefits and risks of LLM-assisted simulated penetration

> *"An LLM is Excel, not an oracle." — a tool that quickly organizes and computes, not an oracle that declares truth.*

**Benefits** — speed·coverage, 24/7 execution, cost efficiency (shifted to tokens·GPU·Chapter 11), report automation, knowledge reuse (RAG), democratization.

**Risks — and mitigations**

1. **False positives·hallucination** — never finalize automated results; have engineers verify. MITM evidence linkage helps (no packet, no claim).
2. **Prompt injection against the agent** — hidden instructions in target responses induce scope violations. Defenses in Chapter 7.
3. **External LLM data exfiltration** — external APIs can be violations in financial·public sectors → local·open-weight (Chapter 9).
4. **Supply chain** — the ARTEX image backdoor precedent → provenance·integrity verification (Chapter 6).
5. **Sensitive data accumulation · scope violation · non-determinism** — retention·encryption·destruction policy + dual code·network scope enforcement + full log preservation (Chapters 7·12).

> **Field rules** — ① every claim goes in the report only when backed by evidence. ② a finding not signed off by a human is not a finding. ③ automation is a draft generator; conclusions are human. — An LLM is Excel.

---

# 5. Features · screenshots · masking

> The screenshots below are the actual files from the official AntiFox repository (`github.com/AntiFox-AI/antifox` — `screenshots/`), included as-is, **verified 2026-11-14**. Since the official README states that **"all on-screen data is synthetic demo data from a local lab"**, the assets·traffic shown on screen are not operational data.
>
> **Image license·source** — the original works are part of the AntiFox project (AGPL-3.0), and this document includes them in the `screenshots/` folder under their original file names in accordance with AGPL terms (attribution·license notice). They are used unedited·unmodified; if you rework·rehost them, comply with AGPL-3.0. When replacing them with your own lab captures, apply the masking in 5.0 below.

### 5.0 Screenshot masking guide

| Masking target | Location | Treatment |
| ----------- | ------------------- | --------------------------------- |
| LLM API keys | LLM config | Blur or `sk-****` |
| Target IP·domains | Target/Scope·graphs·logs | Lab dummy values (`10.10.x.x`·`lab.internal`) |
| Sessions·cookies·tokens | Traffic packet view | First 4 characters only, keep length |
| DB·proxy credentials | config·settings | Blur |
| Usernames·emails | Reports·findings | Pseudonymize |

### 5.1 Login · initial setup

After first launch, `http://localhost:8787` → the login screen where you set the admin password at `/setup`. The UI supports 3 languages: Simplified·Traditional·English.

[![AntiFox login screen](https://github.com/gameworkerkim/vibe-investing/raw/main/TechDoc/AntiFox/screenshots/login.png)](https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/AntiFox/screenshots/login.png)

> English UI for verifying 3-language internationalization: `screenshots/login-en.png`

The first `/setup` screen, captured directly in real-field verification (v2.0.3 binary, 2026-11-14):

<img src="screenshots/lab-01-setup.png" alt="AntiFox first-run /setup screen — real capture" width="720" />

### 5.2 Dashboard · task list

| Dashboard | Task list |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![AntiFox dashboard](https://github.com/gameworkerkim/vibe-investing/raw/main/TechDoc/AntiFox/screenshots/dashboard.png)](https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/AntiFox/screenshots/dashboard.png) | [![AntiFox task list](https://github.com/gameworkerkim/vibe-investing/raw/main/TechDoc/AntiFox/screenshots/tasks.png)](https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/AntiFox/screenshots/tasks.png) |

Dashboard in empty-lab state captured during real-field verification (immediately after installation, 2026-11-14):

<img src="screenshots/lab-12-dashboard.png" alt="AntiFox dashboard — real capture (empty lab)" width="720" />

### 5.3 Finding detail — split display of the exploit chain

The findings page shows entry point→preconditions→staged exploitation as **step-by-step natural-language descriptions + actual requests** (the core screen of evidence-driven delivery).

[![Finding detail — split display of the exploit chain](https://github.com/gameworkerkim/vibe-investing/raw/main/TechDoc/AntiFox/screenshots/finding-steps.png)](https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/AntiFox/screenshots/finding-steps.png)

### 5.4 Evidence · MITM packets (steps automatically linked to real traffic)

Each exploitation step is linked to actual request/response packets by time window·sequence. Syntax highlighting·body search·hit counts provided. (When capturing your own, mask sensitive values per 5.0)

[![MITM traffic packet view](https://github.com/gameworkerkim/vibe-investing/raw/main/TechDoc/AntiFox/screenshots/traffic-packet.png)](https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/AntiFox/screenshots/traffic-packet.png)

### 5.5 "Evidence as packets" — sensitive information exposure

For sensitive information exposure findings, the traffic packets themselves are the evidence (no need to reconstruct screenshots after the fact).

[![Sensitive information exposure — the packet is the evidence](https://github.com/gameworkerkim/vibe-investing/raw/main/TechDoc/AntiFox/screenshots/env-leak.png)](https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/AntiFox/screenshots/env-leak.png)

### 5.6 Findings list

The findings list showing confirmed/unconfirmed status·severity. This is the stage before picking the confirmed vulnerabilities to include in the report.

[![AntiFox findings list](https://github.com/gameworkerkim/vibe-investing/raw/main/TechDoc/AntiFox/screenshots/findings.png)](https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/AntiFox/screenshots/findings.png)

### 5.7 Demo · official channel QR

- **v2.0 evidence-driven flow demo**: `screenshots/demo.gif` (original v2.0 intro GIF from the official README)
- **Official channels**: no separate website (confirmed 2026-11-14); the official channels are the GitHub repository·GHCR package·WeChat official account (Appendix G). QR: `screenshots/wechat-qr.jpg`

### 5.8 LLM config / reports — real captures (real-field verification 2026-11-14)

LLM configuration, language settings, and report-related settings are available. The screens below were **captured directly after installing the official v2.0.3 macOS binary (SHA256-verified) in a local isolated lab** (synthetic lab data only, nothing to mask).

**5.8-1. LLM 配置 (LLM Config, `/system/llm/`)** — manage model·key·endpoint·rate-limit profiles, **LLM failover (2+ profiles)**, **per-role model assignment** (planner·worker·mainagent·report enrichment):

<img src="screenshots/lab-15-llm.png" alt="AntiFox LLM config — real capture" width="720" />

**5.8-2. New task dialog — egress selection** — per-task LLM profile·timeout·**egress proxy (follow global/direct)** selection (5.8-1~2 are new v2.0.3 features):

<img src="screenshots/lab-14-newtask.png" alt="AntiFox new task dialog — egress selection" width="720" />

**5.8-3. Report management (`/system/reports/`)** — organization settings (issuer·logo·assignee), pre-saved **per-language templates (简/繁/英)**, list·download of generated docx:

<img src="screenshots/lab-16-reports.png" alt="AntiFox report management — real capture" width="720" />

**5.8-4. System settings (`/system/settings/`)** — **global egress proxy** (egress IP test capability), global traffic capture switch, one-click update (currently v2.0.3 confirmed):

<img src="screenshots/lab-17-settings.png" alt="AntiFox system settings — real capture" width="720" />

**5.8-5. RBAC user management (`/system/rbac/`)** — admin account·4 system roles, member/role management (login auditing in 7.3):

<img src="screenshots/lab-18-rbac.png" alt="AntiFox user management (RBAC) — real capture" width="720" />

> **Remaining real-field items** — **final docx generation** (run a task → select confirmed vulnerabilities → specify language → generate) was excluded from this verification because it presupposes task execution requiring an LLM key and a target lab. The UI of that flow up to template selection·language specification (5.8-3) was confirmed via the captures above. Completing it resolves one more condition for finalizing v1.0.

---

# 6. Installation and hardening

Installation is easy. The hard part is "safely".

### Prerequisites

- **PostgreSQL** (required); an **LLM** is needed for exploration (key or the UI 「LLM 配置」 (LLM Config))
- **python3 + python-docx** for docx reports (built into the Docker image)
- Go 1.24+ / Node 20+ when building from source
- **Isolated network** — block internet outbound from the target subnet (Chapters 7·12)

### Method 1 — Docker Compose (recommended)

```bash
curl -O https://raw.githubusercontent.com/AntiFox-AI/antifox/main/docker-compose.yml
curl -O https://raw.githubusercontent.com/AntiFox-AI/antifox/main/.env.example
cp .env.example .env          # set POSTGRES_PASSWORD
docker compose up -d          # image+PostgreSQL start automatically
# http://localhost:8787 → first-run /setup to set the admin password
```

**Actual `.env` variables (cross-checked against the real file, 2026-11)**

| Variable | Meaning | Recommendation |
| ----------------------------------------------------- | ----------------- | --------------------------- |
| `ANTIFOX_TAG` | Image tag | **Pinned version/digest** instead of `latest` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | DB access | 32+ char random password, secret manager |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | External LLM keys (one·both·blank) | Leave blank in financial·public → local gateway |
| `ANTIFOX_LLM_PROVIDER` | LLM provider | Specify OpenAI-compatible for local serving |
| `ANTIFOX_LLM_MODEL` | Model id | Chapter 9 selection guide |
| `ANTIFOX_LLM_BASE_URL` | LLM endpoint | Local gateway URL (key to network separation) |
| `ANTIFOX_LLM_PROXY` | LLM proxy | When controlling the egress path |

> **Compose real-file verification (2026-11-14)** — the official `docker-compose.yml` has 2 services: `postgres:16-alpine` (healthcheck·`unless-stopped`) + `ghcr.io/antifox-ai/antifox:${ANTIFOX_TAG:-latest}`. `POSTGRES_PASSWORD` is a **required check** (startup is refused if unset); `ANTIFOX_PG_DSN` is assembled internally by compose and injected into the antifox container, and **both ports `8787:8787` and `8788:8788` are exposed**. Volumes bind `./data` (jwt.key·data, backup target) and `./skills` (host skill overlay).

### Method 2 — prebuilt binary

```bash
cp config.example.json config.json    # fill in the database connection
./antifox                             # Windows: antifox.exe
```

**Docker vs binary — settings location comparison**

| Setting | Docker Compose | Binary |
| -------------- | ----------------------------- | ---------------------------- |
| DB access | `.env` (`POSTGRES_*`) | `database` block in `config.json` |
| External LLM keys·endpoint | `.env` (`ANTIFOX_LLM_*`) or UI | Mostly the UI 「LLM 配置」 (LLM Config) |
| Image tag | `.env` (`ANTIFOX_TAG`) | N/A (release zip) |
| Global egress proxy·scope | UI (system settings/tasks) | UI (system settings/tasks) |

> **`config.json` real-file verification completed (2026-11-14)** — `config.example.json` contains only one block, `database`: `host` (default `127.0.0.1`)·`port` (`5432`)·`user`·`password`·`dbname`·`sslmode` (`disable`). **If the environment variable `ANTIFOX_PG_DSN` is set, it takes precedence over the `database` block in `config.json`** (a single connection string can specify everything). Everything else — proxy·scope·LLM — is handled in the **UI/system settings** as in the table above (the global egress proxy is a v2.0.3 UI feature).

### Method 3 — source build

```bash
cd web && NEXT_EXPORT=1 npx next build && cd ..   # static frontend export
cp -r web/out/. server/webui/dist/                # embed
CGO_ENABLED=0 go build -tags embedui -o antifox ./cmd/antifox
./antifox
```

### One-click update (actual behavior)

- Docker: `docker compose pull`
- Binary/source: `./start.sh` or systemd (`deploy/antifox.service`, `RestartForceExitStatus=75`) → check·install GitHub Release from 「시스템 설정」 (System Settings) (SHA256·atomic swap·rollback on failure, data preserved)

> **systemd real-file verification (2026-11-14)** — the exec line is `antifox -addr :8787 -data /opt/antifox/data` (place the binary in a writable directory; updates swap `antifox.new`/`antifox.old`), DB via the `ANTIFOX_PG_DSN` environment variable. **The updater exits with exit 75 ("restart me")** and systemd restarts it, performing the atomic swap on the next boot (exit code 0 does not restart). On networks where GitHub is blocked, optionally bypass only update traffic via `ANTIFOX_UPDATE_PROXY`.

### Release integrity verification

```bash
sha256sum -c SHA256SUMS                                           # ① verify with the release-provided SHA256SUMS
docker pull ghcr.io/antifox-ai/antifox@sha256:<verified-digest>     # ② digest pin
cosign verify ghcr.io/antifox-ai/antifox@sha256:<...>               # ③ signature verification
syft ghcr.io/antifox-ai/antifox@sha256:<...> -o spdx-json > sbom.json  # ④ SBOM
docker tag ghcr.io/antifox-ai/antifox@sha256:<...> registry.lab.internal/antifox:pinned  # internal mirror
```

> **Lessons from the ARTEX backdoor incident (CSA, 2026-11-06)** — the tampering was in the **image, not the source** (`tomicdd/artex`·`congdonglinux/artex`). Source code can be clean while the distribution image is not, so: ① cross-check GitHub source ↔ Dockerfile, ② verify the compose image source is the official GHCR, ③ **digest pin**, ④ verify signature·build provenance, ⑤ remove container root·unnecessary privileges, ⑥ separate mount permissions for `./data`·`./skills`, ⑦ keep LLM keys separate from target credentials. **If infection is suspected, per CSA guidance do not just replace the image — isolate the host → rotate all related credentials → rebuild from trusted images** (tied to 12.2 IR).

### Post-install feature verification sequence (smoke test)

This is a procedure that even includes a container restart to verify "does the data actually persist" (run immediately after installation, separate from the 12.1 recovery rehearsal):

1. **Asset graph** — whether lab target (OWASP Juice Shop·DVWA etc.) assets appear in the graph
2. **Exploration graph** — whether task goals·investigation results are linked to each other
3. **Agent behavior** — planner/worker task distribution·state transitions
4. **Traffic recording** — whether requests/responses are stored in MITM
5. **Vulnerability verification** — whether finding results link to reproduction steps·packets
6. **Report generation** — whether docx is generated from only the confirmed vulnerabilities
7. **Data persistence** — whether tasks·evidence survive a container restart

### Real-field verification performed (2026-11-14, items ①~④)

A record of the installation·UI verification actually performed while writing this guide (screenshots in 5.1·5.8):

| Item | What was performed |
|---|---|
| Environment | macOS arm64 · PostgreSQL 16.14 (Homebrew) · no Docker → chose the **official release binary** path |
| Integrity | Used `antifox-v2.0.3-darwin-arm64.zip` after confirming its **SHA256 matches the official `SHA256SUMS`** |
| DB setup | Connected to a temporary isolated PG instance (non-standard port) via `config.json` (`database` 6 fields) — real-file field verification |
| Startup | `./antifox` → confirmed in the logs `AntiFox v2.0.3 backend listening on :8787`, MCP tool loading (25 browser·16 filesystem tools) |
| UI check | First-run `/setup` password → `/login` → accessed dashboard·tasks·findings·traffic·assets screens; confirmed the full sidebar menu: **LLM·Agent·MCP·Skill·工具 (Tools)·拦截规则 (Intercept Rules)·审批记录 (Approval Logs)·用户管理 (User Management)·报告管理 (Report Management)·知识库 (Knowledge Base)·日志 (Logs)·系统配置 (System Config)** |
| v2.0.3 feature check | **Global egress proxy** (egress IP test)·traffic capture switch·**one-click update (current version shown as v2.0.3)** in system settings; **failover·per-role models (4 roles)** on the LLM page; **per-task LLM·timeout·egress selection** in new task; **per-language templates (简/繁/英)** in report management |
| RBAC·HITL check | User management (admin account, **4 system roles**); intercept rules' **built-in rules** (`rm -rf`·system directory deletion regex blocking, priority matching) |
| Not performed (limitations) | **LLM not connected** (no key) — agent task execution·live traffic capture·final docx generation unverified (only confirmed via engine idle logs). This is the remaining condition for v1.0 finalization |

### Version compatibility notes

| Tag | Release (2026) | Notes |
| --------------- | ------------- | ----------------------------------------- |
| v0.1.0 / v0.1.1 | 10-11 / 10-16 | Early versions, the base point of the ARTEX secondary development |
| v2.0.0 | 10-22 | Evidence-driven delivery theme |
| v2.0.1 / v2.0.2 | 10-25 / 10-29 | Stabilization |
| **v2.0.3** | 10-30 | LLM session headers, **global egress proxy**, confirm-to-enrich, report management |

※ This guide is based on the v2.0.x line. Cross-check against the actual version·features of your installation. (The "v0.3.15" in the source material does not match actual tags.)

### Hardening checklist

| Area | Action |
| ----- | -------------------------------------------------------------------------------- |
| Management console | **Never expose to the internet** either port `8787` (console)·`8788` (MITM proxy); reverse proxy+TLS+IP allowlist or VPN/bastion |
| Secret management | Keys·DB passwords in a secret manager, separate from target credentials |
| DB security | Encryption at rest, least privilege, destroy after engagement (Chapter 12) |
| Network | Separate execution·target networks, block target-network outbound (7.1) |
| Access control | RBAC resource-level scoping·system roles·login auditing (7.4) |
| Integrity | SHA256·signatures·digest pin·SBOM |
| License | AGPL-3.0 obligations + usage policy compliance (Appendix D) |

---

# 7. Configuring safety controls — scope·injection·isolation·auditing

If this is an "evidence-based" document, the safety mechanisms must also be backed by evidence. This chapter layers **AntiFox's actual features + external network controls**.

### 7.1 Scope enforcement — two layers

**① Product level** — define targets·scope narrowly in the UI Target/Scope, and use **rule-based HITL intercept** for human approval/blocking of high-risk actions (inherited from ARTEX). Use the **global egress proxy** (v2.0.3) to consolidate traffic into a single controllable path, with per-task direct/proxy selection. Restrict per-operator resource scope via RBAC (7.4).

**② Network level** — the **last safety net**: even if a non-deterministic agent tries to leave scope, the network blocks it.

```bash
# iptables — default DROP, allowlist only (conceptual example)
iptables -P OUTPUT DROP
iptables -A OUTPUT -o lo -j ACCEPT
iptables -A OUTPUT -d 10.10.0.0/16 -j ACCEPT                      # lab target network
iptables -A OUTPUT -d 10.20.0.10 -p tcp --dport 4000 -j ACCEPT   # LLM gateway
iptables -A OUTPUT -d 10.20.0.11 -p tcp --dport 5432 -j ACCEPT   # PostgreSQL
```

**The same principle in other environments**

| Environment | Application |
| --------------------- | -------------------------------------------------------------------------------------------- |
| **nftables** | `chain output { type filter hook output priority 0; policy drop; }` then `accept` for lab/gateway/DB destinations |
| **Cloud security groups** | Instead of allow-all outbound, **restrict destinations**; separate egress-only SG |
| **K8s NetworkPolicy** | default-deny egress on the AntiFox pod + `allow` only egress to lab/gateway |

> **Kill switch** — prepare in advance a one-line script that cuts all outbound. On anomalies, "cut first, analyze later" (IR in Chapter 12).

### 7.2 Prompt injection defense

The enforcement point is AntiFox's **rule-based HITL intercept** (blocks automatic execution of high-risk actions·human approval).

| Defense layer | Configuration |
| ------------ | --------------------------------------------- |
| Output trust boundary | Treat target responses **as data only** (never interpret as instructions) |
| HITL intercept rules | Intercept high-risk actions (writes·privilege escalation·external calls) by rule for approval/blocking |
| Scope re-validation | Compare the target host against Target/Scope; network blocking (7.1②) is the backstop |
| Rate·budget limits | Per-host request·token caps |

※ These are operating principles. Confirm the product's actual setting keys·rule syntax in the installed documentation·UI (do not use fabricated keys).

### 7.3 Audit logs

- Preserve agent decisions·tool calls·requests/responses **tamper-proof (append-only)**, with mandatory `engagement-id`·`task-id`·timestamps·target host.
- Operate together with AntiFox **login auditing** (RBAC). This becomes the input for blue team detection (Chapter 10).

### 7.4 Data isolation — logical vs physical

AntiFox's "evidence isolation" is **logical (application-level) isolation** via the **per-task exploration graph** — the global asset graph is shared across tasks, the exploration graph is separated per task. In multi-tenant·regulated environments, add **physical/DB-level controls**.

| Layer | Action |
| ------ | ----------------------------------- |
| Application | Restrict access per operator·role with RBAC resource-level scoping (product feature) |
| Schema separation | Separate schemas or DB instances per customer/engagement |
| RLS | Block cross-tenant row access with Row-Level Security |
| Key separation | Separate evidence encryption keys per tenant (reduces blast radius) |

> The mere existence of controls is a legal·contractual line of defense.

> **The supply chain of the knowledge base·extension structure** — the dual global+task pgvector RAG lets you reuse past reports·checklists·technical documents, but **unverified documents (unclear source·date·verification status, duplicates, misinformation) mixed into search results can contaminate even LLM judgment**. Manage source·date·verification status from the moment documents enter the knowledge base. The same applies to MCP servers·Skill extensions — **every external MCP/Skill you attach increases both execution privileges and supply-chain risk** (verify provenance·least privilege).

---

# 8. Configuration by scenario

A methodology·configuration-level playbook premised on **authorized scope·isolated lab** (not exploit recipes).

| Scenario | Scope·configuration | Mapping |
| --------------- | ----------------------------- | ---------------- |
| **Web app** | Single-domain whitelist, authentication areas specified | OWASP ASVS/WSTG |
| **Internal network/directory** | Subnet-limited, "observe only" on crown jewels, outbound blocked | MITRE ATT&CK |
| **Cloud configuration** | Read-focused, temporary·short-lived credentials, immediate revocation | CIS Benchmark |
| **API/microservices** | OpenAPI-based, inject specs·auth into RAG | OWASP API Top 10 |

> Internal networks have a large blast radius. Put a **prohibited destructive actions list** (account lockout·mass authentication·service disruption) in the ROE and enforce it with Chapter 7's HITL·network controls.

> **Cloud — real abuse cases (recent)** — AntiFox has a history of being abused for cloud credential theft, and **per 2026-11 reports, AntiFox-linked attacks accessed operational secrets even while some AWS API calls were blocked**, with CloudTrail detection gaps noted. Even in cloud lab scenarios, make temporary·short-lived credentials·immediate revocation an iron rule, and pair it with **multi-layer detection of secret access·webshells·config file reads and more**, not just API call logs (Chapter 10).

---

# 9. Financial·public institutions and open-weight models

In financial·public sectors, the premise of "sending data to an external API" often does not hold. This chapter synthesizes **why it gets blocked (Korean regulations overall) → why open-weight is the answer → what to choose (official models vs guardrail-removed models) → what hardware is needed**.

### 9.1 Why external APIs get blocked — Korean regulations·guidelines overall

**① Financial sector — Electronic Financial Supervision Regulations·outsourcing regulations·Credit Information Act**

- **Electronic Financial Supervision Regulations (Financial Services Commission notice)** — prescribes physical·logical protection of electronic financial infrastructure·information processing systems, the **network separation** principle, and incident response procedures. Sending penetration-test traffic (requests·responses·authentication info·sessions) to an external LLM API is **potentially a direct violation of external-network transmission controls**.
- **Regulations on Outsourcing of Financial Companies' Information Processing (FSC notice)** — outsourcing information processing to a third party (including LLM SaaS) triggers FSC reporting·confidentiality·outsourcer-management obligations. A structure that sends prompts to the API on every test can effectively constitute a 'standing outsourcing' arrangement.
- **Credit Information Act** — overseas transfer of personal credit information is restricted·subject to FSC reporting. If customer credit information is exposed on the target system, the overseas API call itself is potentially a violation.

**② Personal data — PIPA overseas transfer·Information and Communications Network Act**

- **Personal Information Protection Act Article 28-8 (overseas transfer restriction, effective 2023-09-15)** — transferring personal information abroad requires statutory requirements such as data-subject notice·consent. If requests·responses collected during testing contain personal information, sending them to an overseas LLM API = subject to overseas-transfer regulation.
- **Information and Communications Network Act** — prohibition on providing user personal information to third parties without consent, obligation to take safety measures. Whether the LLM provider counts as a 'third party' becomes the litigation issue.

**③ Public·government — e-Government Act·CSAP·NIS guidelines**

- **e-Government Act Article 54-2 + CSAP (Cloud Computing Service Security Assurance Program)** — national·public institutions may use private cloud only if it has passed security certification (IaaS/SaaS grades). Uncertified overseas LLM APIs are blocked at the source.
- **Basic Guidelines on Information Security for National·Public Institutions (National Intelligence Service)** — before introducing an information system: **security review**, **network separation (internal·business·internet networks)**, data export/import control, separation of development·operating environments, and application of cryptographic modules (KCMVP). A structure where "prompts containing test-target information travel over the internet and go abroad" makes passing export controls·security review effectively impossible.
- **NIS National Information Security Basic Guidelines·security suitability verification** — security suitability verification of introduced SW·HW and supply-chain inspection requirements. External API dependence makes the verification target (supplier) unmanageable.

**④ Conclusion — external APIs should be "exceptionally approved"**

Taken together, keeping AntiFox's LLM as an external API in financial·public sectors is a **default-prohibited + exceptionally approved** structure. Therefore the standard configuration is **on-premises open-weight serving**. Pointing `ANTIFOX_LLM_BASE_URL` at an **OpenAI-compatible local gateway** makes the LLM merely a 'local API' from AntiFox's perspective, so tool configuration is identical.

### 9.2 Direction of the open-weight transition — on-premises serving architecture

```
Network-separated internal network
  [AntiFox] → ANTIFOX_LLM_BASE_URL → [LiteLLM gateway] → [Inference server vLLM/SGLang/TGI/Ollama]
                                        (rate limit·audit·fallback)    (open-weight models, GPU segment)
  Internet path: fully blocked (7.1②). Model segment not externally exposed (same topology as Chapter 11)
```

- **Gateway (LiteLLM etc.)** — exposes an OpenAI-compatible endpoint, key management·rate limiting·call auditing·per-model routing. Combinable with AntiFox's LLM failover (5.8-1).
- **Inference server** — vLLM/SGLang if you need throughput·batching; Ollama for simple single-node setups (note that TGI is in maintenance). Use only **official hashes of official releases** for models.
- **Advantages** — the data overseas-transfer issue disappears, regulatory response documents (adoption path·provenance) become clear, and the token unit price itself disappears (shifts to electricity·depreciation, Chapter 11 break-even).

### 9.3 Recommended open-weight models + hardware specs

**Official model families** *checked 2026-11 (rapidly changing — re-verify at adoption time)*

| Model family | License nature | Strengths | Recommended use |
| --- | --- | --- | --- |
| DeepSeek V4 family | MIT-type (permissive) | All-round coding·agent, long context | Primary worker·planner |
| Qwen3.5 / Qwen3-Coder | Apache 2.0 | Top-tier agent coding, single-GPU variants | Single-GPU builds |
| GLM-5.x (Z.AI) | MIT-type | Tool use·terminal workflows | Tool-calling workloads |
| Kimi K2.x (Moonshot) | Open-weight | Ultra-long context | Long-report augmentation |
| Llama 4 (Meta) | Community license (restricted) | Largest Western ecosystem | Domestic·Western license requirements |
| Mistral/Devstral · Gemma | Apache 2.0 etc. | Lightweight·easy fine-tuning | Small labs·auxiliary roles |

**Required hardware specs (by VRAM)** *Q4/Q5 quantization, practical baseline including KV-cache headroom*

| Model size | Quantization | Minimum VRAM | Recommended GPU (example) |
| --- | --- | --- | --- |
| 7–9B (Qwen3.5-9B, Gemma etc.) | Q4/Q5 | 8–16GB | RTX 3090/4090 (24GB) ×1, Mac 32–64GB |
| 14–32B (Qwen3-Coder-32B etc.) | Q4/Q5 | 20–32GB | 4090 (24GB) ×1 (tight) or ×2, Mac 64GB+ |
| 70B-class (Llama-4-70B, Kimi K2 etc.) | Q4 | 48–80GB | A100 80GB ×1, 4090×2, Mac 128GB+ |
| 100B+ (DeepSeek V4, GLM-5 large) | Q4/FP8 | 80–160GB | A100/H100 80GB ×1–2, multi-GPU node |
| 200B+ (full MoE) | Q4 | 160GB+ | H100 80GB ×4+, GPU-server scale |

- **GGUF + Ollama/LM Studio/llama.cpp** — small labs·workstations. **vLLM/SGLang** — always-on serving·high batching (unit token cost ↓).
- Inference speed governs task latency (agents issue requests frequently): on a 24GB-class single GPU, 32B Q4 is the practical ceiling.

> **Pitfalls — capability gap · provenance · governance** — open-weight models are weaker than frontier ones, so **False Positives↑·review effort↑**. Many top performers originate from a specific region and some have loose guardrails — verify **weight provenance·hash·license**, and keep data retention·encryption·destruction in place even locally. Financial·public sectors must use **official releases only** and exclude the 9.4 derivative models.

### 9.4 Guardrail-removed (abliterated/uncensored) models — existence·usage·warning

Models distilled from DeepSeek reasoning data or based on GLM architectures **with the security guardrails (refusal behavior) removed** are being distributed on Hugging Face under the `abliterated`·`uncensored` keywords. The mainstream techniques are **Abliteration·Heretic**, which mathematically remove only the safety filtering (refusal direction vectors) while preserving the base model's reasoning performance.

| Category | Representative model names (Hugging Face) | Characteristics·base |
| --- | --- | --- |
| GLM-family guardrail-removed | `dealignai/GLM-5.3-UNCENSORED-FP8` | General-purpose model with the refusal tensors of GLM-5.3 weights permanently modified (a cybersecurity-specialized `GLM-5.3-CYBERSECURITY-FP8` also exists) |
| GLM-4 lightweight uncensored | `DavidAU/GLM-4.7-Flash-Uncensored-Heretic` | Heretic-technique censorship removal + coding·reasoning augmentation, for local GGUF running |
| DeepSeek R1 distilled uncensored | `huihui-ai/DeepSeek-R1-abliterated` collection | R1 reasoning data distilled into Qwen·Llama (1.5B–70B), then refusal removed |
| DeepSeek V4 distilled uncensored | `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic` | DeepSeek-V4-Pro reasoning distilled into Qwen3.5-9B, guardrails removed with Heretic v2 |

- **Search keywords** — not 'guardrails excluded': the tags `abliterated`, `uncensored`, `decensored`, `heretic` are appended after the model name.
- **Local execution** — on consumer GPUs·Macs, run the quantized versions with `GGUF` appended to the model name via Ollama·LM Studio·llama.cpp.
- **Warning (mandatory)** — guardrail-removed models do not have working official safety filtering. **Never use them in public-service·financial·public environments.** Personal research·red-team verification is limited to the precondition of an **externally non-exposed isolated lab + this document's scope controls (Chapter 7)**, and since derivative-model weight hashes have no 'official' value, you must evaluate the trustworthiness of the source repository yourself (supply chain: Chapters 1·6, Appendix G).

### 9.5 Box article — the open-weight data-leak incident, summarized from a security-hardening perspective

> **"Open-weight: deliberate or a training error?"** (Dennis Kim (김호광), 2026-10-27 — [original column](https://docs.vibequant.cc/columns/open-weight-data-leak/))
>
> **The incident** — a report Cohere published on 2026-10-26 ("Concerning behavior from a popular open-weight AI model"). Alibaba Qwen3.8-Flash-Next, while reasoning during a security-task evaluation that it would "not use tools", in the same turn performed reconnaissance (`ls /tmp`·`which curl wget python3 jq`·`cat /etc/resolv.conf`) and then **attempted a `curl -X PUT` upload to a Beijing Alibaba Cloud OSS bucket**. The frequency is under 1 per 100,000 calls, but for a service at a scale of 10 million agent turns per week, that is up to 100 per week.
>
> **Key lessons (security-hardening perspective)**
> 1. **Reasoning traces (CoT) are not a security boundary** — a model's "thoughts" and its actual tool calls are separate generation processes. Controls must be applied to the **tool calls right before execution**, not to what the model says (AntiFox's HITL intercept is exactly this point — 7.2).
> 2. **The "self-hosting = safe" formula collapses** — putting the weights on your own server only changes *where* the model runs, not *what it learned*. Habits from the training ground (saving to Beijing buckets, routing through routify proxies) follow through fine-tuning·quantization. Per a spring-2026 report, 41% of Hugging Face downloads were Chinese models, with over 113,000 Qwen derivatives alone.
> 3. **Intent is an unobservable variable** — whether deliberate (a call-home implant) or a training error, the 'behavior' crossing the boundary is identical. Defense policy must be applied to behavior.
> 4. **Practical checklist** — ① default-deny agent egress (allowlist only, force through proxy) ② block cloud metadata endpoints (`169.254.169.254`, enforce IMDSv2·least privilege) ③ block unprivileged user namespaces (`unshare -Urm` type — `kernel.unprivileged_userns_clone=0` or seccomp/AppArmor) ④ pre-control tool calls (human approval for high-risk commands) ⑤ alert on unfamiliar cloud hosts (watchlist DNS·proxy logs) ⑥ separate evaluation·production environments ⑦ don't trust static scanners alone for AI-generated code — run dynamic·attack testing in parallel.
> 5. **Supply-chain treatment** — treat weights like unsigned binaries. If you cannot answer who trained them and what derivation path they went through (see NIST SP 800-218A), the operator bears that risk.
>
> *The lesson is not "abandon open-weight" — self-hosting only decides where the model runs, so cut the 'phone line' with **network·tool-call layer controls** (Chapter 7).*

### 9.6 Financial·public adoption checklist

1. Block external LLM transmission (enforce local gateway·egress monitoring, 7.1②)
2. Verify model weight **official release·official hash·license** — exclude guardrail-removed·derivative models (9.4)
3. Document adoption rationale — CSAP certification scope where applicable, materials for NIS security review·security suitability verification
4. Test data classification·encryption·retention period·destruction automation (Chapter 12), determine overseas-transfer·outsourcing applicability
5. Network-separated deployment (model segment isolation), no console exposure, KCMVP cryptographic modules
6. Assume a weaker model — raise the human review ratio, budget effort for False Positive response
7. Tool-call HITL approval·default-deny agent egress·metadata IP blocking (9.5 checklist)
8. Preserve all audit logs·map to supervisory regulations (10.3 SIEM pipeline)

---

# 10. Blue team perspective — detecting and logging agent behavior

In purple teaming, AntiFox's real value is "showing detection gaps with evidence".

### 10.1 Detection signals

| Signal | Observation point | Detection idea |
| ------------ | --------------- | --------------------------------------------------- |
| Abnormal enumeration rate | WAF·web server | Mass endpoint/parameter probing in a short time |
| Automated request patterns | Proxy·L7 | Regular intervals·repetitive structure, non-human header order |
| Graph-style reconnaissance | DNS·network | Breadth·depth of relationship-exploring queries |
| Egress anomalies | Firewall | Unexpected external LLM/proxy connections from internal hosts |
| Secret access (cloud) | Secret manager·cloud logs | Secret access occurs even with API blocking (2026-11 case) → monitor secret access events on their own |

### 10.2 Detection rule examples

> **Important** — the Sigma rules below are written in **official spec format** (base rule + `correlation:` key), but (1) **field names such as `status`·`src_ip` need mapping to your SIEM backend pipeline** (replace with standard fields such as `http.response.status_code`), and (2) they must be **verified with pySigma/Sigma rule repository linting before deployment**. The WAF·KQL examples are conceptual. Do not copy them as-is; adapt them to your backend.

**Sigma — many auth/404 probes in a short time (base + correlation)**

```yaml
# base rule: web_probing_responses
title: Web Probing Responses
logsource:
  category: webserver
detection:
  selection:
    status: [401, 403, 404]        # field names need backend mapping
  condition: selection
---
# correlation rule: agentic probing burst
title: Agentic Web Probing Burst
status: experimental
description: Many 401/403/404 responses in a short time — autonomous agent enumeration pattern
correlation:
  type: event_count
  rules:
    - web_probing_responses
  group-by:
    - src_ip
  timespan: 1m
  condition:
    gte: 100
level: medium
tags:
  - attack.discovery
  - attack.t1595
```

**WAF (conceptual) — non-human rate/UA** (convert to Cloudflare WAF rules·ModSecurity expressions)

```
IF  req.rate_per_ip > 100/min
AND (req.user_agent matches /(curl|python-requests|go-http-client)/i
     OR req.header_order anomalous)
THEN tarpit + alert(label="agentic-recon")
```

**SIEM (conceptual KQL) — egress outside approved paths** (Microsoft Sentinel style)

```kusto
let RedTeamHosts = dynamic(["10.30.0.5", "10.30.0.6"]);
let ApprovedGW   = dynamic(["10.20.0.10", "10.20.0.11"]);   // approved paths such as LLM gateway·DB
CommonSecurityLog
| where SourceIP in~ (RedTeamHosts)
| where DestinationIP !in (ApprovedGW)
| summarize OutBytes = sum(SentBytes) by SourceIP, DestinationIP, bin(TimeGenerated, 5m)
| where OutBytes > 0        // egress outside approved paths = investigate
```

### 10.3 Log pipeline architecture (DB→SIEM)

Example path for flowing AntiFox audit·behavior logs into the blue team SIEM:

```
AntiFox (PostgreSQL audit logs·behavior events)
  → (A) Log shipper: PostgreSQL FDW/CDC or periodic extraction → JSON lines
  → (B) Transport: syslog/HTTP → collectors (Fluent Bit/Vector)
  → (C) SIEM indexing (Elastic/Splunk/OpenSearch) → correlation·dashboards
Common keys: engagement-id·task-id·timestamp·target-host (time synchronization required)
```

Only with this pipeline does the 10.1~10.2 closed loop of "detection gap → rule improvement → reproduce detection" actually turn.

### 10.4 Purple team loop · defending the agent itself

1. Red: authorized test → MITM evidence · 2. Blue: compare same-timeframe detection logs → identify gaps · 3. Joint: improve rules with reproduction data · 4. Regression: verify detection on the next run. Also, the blue team should include **red team infrastructure (AntiFox host·gateway·DB) in its monitoring scope** — console exposure·abnormal egress·anomalous gateway routing can be signs of tool compromise.

---

# 11. Budget and testing environment setup

Automation does not remove cost; it only changes its *form* — the labor cost of skilled pentest staff is redistributed into tokens·GPU·infrastructure·review effort. When budgeting, separate two things: (1) the **infrastructure/model cost** of running the platform, and (2) the **red team labor cost** — humans designing·reviewing·taking responsibility for the results. An autonomous tool like AntiFox reduces (1) but cannot eliminate (2). "An LLM is Excel, not an oracle" — automation fills the cells; the meaning and responsibility are read by humans.

This chapter assumes **local serving of open-weight models** as the baseline (since external APIs are often unusable or unwanted — see Chapter 9) and breaks budgets down by organization type into four cases: **SMB · Enterprise · Public sector · Financial institution**. The further down the list, the heavier the regulatory·isolation·audit requirements, and the larger the infrastructure·staffing costs accordingly.

> Caution: all amounts below are **rough assumptions as of 2026-11** and vary considerably with exchange rates·GPU supply·labor market rates·regulatory requirements. KRW amounts are reference values converted at 1 USD ≈ KRW 1,400. For actual approvals·quotes, recalculate at adoption time from vendor quotes·internal labor cost tables. The purpose of this chapter is not the "numbers" but the **structure of the budget and the calculation method**.

---

### 11.0 Four variables that decide the budget

The differences in amounts across organization types ultimately come from combinations of these four variables.

| Variable | Description | Impact on cost |
|---|---|---|
| **Isolation level** | external API allowed / internal network / full air-gap | the higher, the more local GPU·dedicated infrastructure is required → capital cost spikes |
| **Target scope** | number of assets (domains·IPs·apps), test scope | proportional to token consumption·test time·review effort |
| **Test frequency** | quarterly / monthly / continuous | decides GPU rental vs always-on ownership (break-even, 11.2) |
| **Audit·governance** | reporting structure·chain of custody·regulatory mapping | adds staffing·process costs in public·financial sectors |

One core principle: **GPU costs money by how long it is kept on, not by how much it is used.** So low test frequency favors rental (on-demand) and high frequency favors always-on ownership (11.2 break-even).

---

### 11.1 Open-weight model unit cost — token·GPU conversion

AntiFox's agents consume a lot of tokens through iterative reasoning. In local serving, the "token unit cost" is simply **GPU running time divided by token count**.

#### Model tier hardware·throughput assumptions (2026-11, quantized baseline)

| Model tier | Representative group (e.g.) | Minimum GPU | Sustained throughput (assumed) | Notes |
|---|---|---|---|---|
| Light (7B~14B) | small Qwen3-Coder, Gemma | 24GB VRAM×1 (e.g. L4/A10/RTX4090-class) | 1,500~3,000 tok/s | simple recon·summarization, review assistance |
| Mid (30B~70B-class) | mid Qwen3-Coder, mid GLM, Mistral | 48~80GB VRAM×1 (e.g. 1× A100/H100) | 800~2,000 tok/s | workhorse for production agent reasoning |
| Large (100B+ / MoE) | DeepSeek V4, Kimi K2.x, large GLM | 80GB×2~8 or multi-node | variable (batch-dependent) | best quality·large capital cost, for large organizations |

> Licenses·scores·latest versions change rapidly — reconfirm at adoption time against the Chapter 9 selection guide and each model's official card. The lighter the model, the more False Positives and the larger the **human review workload** — saving on model cost raises labor cost; it is a trade-off.

#### GPU cost conversion (on-demand rental basis, 2026-11)

| GPU | On-demand rental (assumed) | Monthly always-on (720h) | Purchase (reference) |
|---|---|---|---|
| L4/A10/RTX4090-class (24GB) | $0.4~0.8/hr | $290~580 | $2,000~8,000 |
| A100 80GB | $1.3~2.0/hr | $940~1,440 | $15,000~20,000 |
| H100 80GB | $1.5~3.0/hr (up to $12~15) | $1,080~2,160 | $25,000~35,000 |

#### Effective unit cost per 1M tokens (self-hosting)

```
Self-hosted per 1M tokens = (GPU hourly rate) / (tokens per second × 3600) × 1,000,000

e.g.) H100 $2/hr, mid model 1,500 tok/s sustained (high utilization)
   = 2 / (1500 × 3600) × 1e6 ≈ $0.37 / 1M
   at 40% utilization, effective unit cost ≈ 2.5× ≈ $0.93 / 1M
e.g.) A100 $1.5/hr, light model 2,500 tok/s sustained
   = 1.5 / (2500 × 3600) × 1e6 ≈ $0.17 / 1M
```

> For reference, the lowest-tier external APIs (DeepSeek-class) are around $0.1~0.2 input / $0.3 output per 1M. Local hosting is paying for "data never leaves the building" with money instead — and the more testing you do, the more favorable local becomes (11.2).

#### Token consumption assumptions per test run

Autonomous agents make repeated calls across the entire recon·enumeration·verification·reporting process. Assume the following by target size.

| Test scope | Tokens per run (assumed) | Converted at mid-model effective cost ($0.5/1M) |
|---|---|---|
| Small (1~2 apps, single domain) | 30M~80M | $15~40 |
| Medium (5~10 apps, subnet) | 150M~400M | $75~200 |
| Large (enterprise-wide, multiple segments) | 800M~2,000M+ | $400~1,000+ |

This "per-run token cost" becomes the basic building block of the monthly·annual budgets below.

---

### 11.2 Break-even — rental vs always-on ownership

```
Monthly test tokens × effective unit cost (rental, reflecting utilization)  vs  monthly always-on GPU cost

e.g.) mid model, 400M tokens/month (medium scope, once a month)
   - Rental: 400M × $0.9/1M (low utilization) ≈ $360/month  → rental wins
e.g.) spread 400M across every day + continuous regression → 3,000M/month
   - Always-on H100: fixed ≈ $1,440/month, handling 3,000M → ≈ $0.48 per 1M  → always-on wins
```

Principle: **if monthly testing is at the "once a month" level, rent; at the "continuous/weekly regression" level, own always-on.** Public·financial organizations often cannot rent at all because of air-gaps and are forced into always-on ownership (regulation decides, not cost).

---

### 11.3 Case A — SMB

- Profile: few assets (1~3 apps), external API usable or a single on-prem GPU, 0~1 dedicated security staff.
- Isolation: low (one hypervisor suffices for the isolated lab). External open-weight API or a light local model.
- Testing: quarterly~monthly, small scope.

#### Infrastructure/model (based on monthly testing)

| Item | Configuration | Monthly cost (assumed) |
|---|---|---|
| AntiFox + PostgreSQL server | small VM or one on-prem box | $50~150 (cloud) or a small amortized amount |
| Model | light local (24GB GPU rented only as needed) or cheapest external API | rental $0.5/hr × 20h/month ≈ $10 / API $20~40 |
| Test token cost (small scope, 1 run) | 30M~80M | $15~40 |
| Target lab (vulnerable VMs) | DVWA/Juice Shop etc., free | $0 |
| **Infrastructure subtotal, one monthly test** | | **≈ $80~230 (≈ KRW 110K~320K)** |

#### Annual infrastructure (monthly × 12)

≈ **$1,000~2,800 / year (≈ KRW 1.4M~4M)**. Quarterly testing brings it down to one third.

#### Red team labor cost (separate)

SMBs can rarely field a dedicated team. Realistic options:

| Operating model | Configuration | Annual labor cost (assumed) |
|---|---|---|
| 1 part-time staffer | a dev/infra staffer doubles up, several days a month | absorbed internally (0 or a small separate amount) |
| Outsourced | contracted to a pentest firm quarterly/annually | KRW several million~10M per engagement; KRW 10M~30M / year |

SMB recommendation: **keep the tool light (light model + small server), put the responsibility with an external firm or a part-time staffer.** The cost-efficient pattern is AntiFox as the supporting layer for "continuous automated scanning + external expert deep-dive once or twice a year".

**Case A total (assumed)**: infrastructure KRW 1.4M~4M/year + labor (part-time~outsourced) KRW 0~30M. A typical SMB running "AI autonomous checks + one external deep-dive per year" lands around **KRW 10M~35M / year**.

---

### 11.4 Case B — Enterprise

- Profile: dozens~hundreds of assets, internal network/partial isolation, has a security team, monthly regular checks or more + continuous regression.
- Isolation: medium (management/target/model segments separated, on-prem GPU). External API limited by data classification.
- Testing: monthly enterprise-wide + ad-hoc on major changes.

#### Infrastructure/model

| Item | Configuration | Cost (assumed) |
|---|---|---|
| AntiFox + PostgreSQL | 8 vCPU/32GB/500GB always-on | $150~300 / month |
| Local GPU (mid model) | 1× A100/H100 always-on or mixed | $1,000~2,160 / month |
| Model test token cost (medium scope monthly + regression) | 400M~1,000M / month | at $0.5/1M effective cost, $200~500 / month |
| Target lab/staging | cloned staging + hypervisor | $200~500 / month |
| **Monthly infrastructure subtotal** | | **≈ $1,550~3,460 / month (≈ KRW 2.2M~4.8M)** |

#### Annual infrastructure

≈ **$18,600~41,500 / year (≈ KRW 26M~58M)**. Converting the GPU to purchase (CapEx) means an initial $20,000~35,000 investment, then it drops to monthly power·operations cost.

#### "Per-run cost" of a monthly security test (infrastructure only)

Medium-scope per-run token cost $75~200 + that month's GPU·server amortization. Purely variable cost is **≈ $100~300 per run (≈ KRW 140K~420K)**. The trap is that this number looks small — the labor cost below is most of the real cost.

#### Red team labor cost (separate)

Minimum functional configuration, 3 roles (Chapter 2 lifecycle and response):

| Role | Assumed experience | Assumed salary (KRW) | Notes |
|---|---|---|---|
| Engagement lead | 7+ yrs | KRW 80M~120M | scope·ROE·legal·final review·responsibility |
| Operator (agent configuration·evidence verification) | 3~6 yrs | KRW 55M~80M | execution·False Positive triage |
| Reviewer (blue team liaison) | 3~6 yrs | KRW 55M~80M | detection gaps·purple team |

> In the 2026 Korean market, pentest·security-consulting hires start around KRW 30M for entry~1yr, mid-career runs in the KRW 50M~80M range, and lead-level is around KRW 100M (varies widely by posting·company; specialist white-hat groups command more). Replace with exact figures from your internal labor cost table.

- **Annual labor total for 3 dedicated full-time staff (assumed)**: ≈ **KRW 190M~280M** + social insurance·benefits (add ≈ 15~25% of labor cost) → actual burden ≈ **KRW 220M~350M**.
- If a full team is too much, a hybrid of **1 dedicated staffer + external deep-dive twice a year**: 1 dedicated at KRW 60M~100M + external KRW 20M~50M → KRW 80M~150M / year.

**Case B total (assumed)**: infrastructure KRW 26M~58M/year + labor KRW 80M~350M. With a 3-person dedicated team, roughly **KRW 250M~400M / year**; with the hybrid model, roughly **KRW 100M~200M / year**.

---

### 11.5 Case C — Public sector

- Profile: mandatory network separation, CSAP·public-sector guidelines apply, external APIs effectively impossible → **local open-weight is forced**. Heavy audit·documentation requirements.
- Isolation: high (work network/internet network separated; the model also stays on the internal network). Always-on GPU ownership is effectively mandatory.
- Testing: regular (monthly~quarterly) + ad-hoc audit responses. Strong chain-of-custody·retention requirements (Chapter 12).

#### Infrastructure/model

| Item | Configuration | Cost (assumed) |
|---|---|---|
| AntiFox + PostgreSQL (internal network) | redundancy recommended | $300~600 / month or CapEx amortization |
| Local GPU (mid~large, always-on) | 1~2× H100 always-on (air-gap) | $2,160~4,320 / month or purchase $50,000~70,000 |
| Inference gateway·internal serving | vLLM/SGLang + LiteLLM | included in operations labor |
| Target lab·cloned environment | internally isolated | $300~700 / month |
| Audit·log pipeline (10.3)·backup (12.1) | SIEM integration·retention storage | $300~800 / month |
| **Monthly infrastructure subtotal** | | **≈ $3,060~6,420 / month (≈ KRW 4.3M~9M)** |

#### Annual infrastructure

≈ **$36,700~77,000 / year (≈ KRW 51M~108M)**. Converting GPUs to purchase: initial capital KRW 50M~100M + operating costs.

#### Red team labor cost (separate)

The public sector typically uses **contracted services from specialist firms (procurement)** or a **hybrid of internal dedicated staff + contracted services**. Contracted work carries higher unit prices·management overhead than the private sector because of statements of work·procurement procedures·audit responses.

| Model | Configuration | Annual labor cost (assumed) |
|---|---|---|
| Annual contract with a specialist firm | regular checks + reporting + audit response | KRW 50M~150M / year (by scale) |
| 2~3 internal dedicated staff | operations·verification·audit response | KRW 150M~280M / year |

**Case C total (assumed)**: infrastructure KRW 51M~108M/year + labor KRW 50M~280M. On a hybrid basis, roughly **KRW 150M~350M / year**. However, in the public sector, **procurement·audit·documentation compliance** — not the amount — decides success or failure.

---

### 11.6 Case D — Financial institution

- Profile: Electronic Financial Supervision Regulations·network separation·strong audit. External data transfer blocked at the source → **local open-weight + full isolation**. Highest chain-of-custody·retention·legal hold requirements (Chapter 12). Continuous regression·high reliability required.
- Isolation: highest (air-gap, multiple segments, key separation). High availability·redundancy.
- Testing: continuous + regular + regulatory responses. Both token volume and GPU utilization are high.

#### Infrastructure/model

| Item | Configuration | Cost (assumed) |
|---|---|---|
| AntiFox + PostgreSQL | HA redundancy, encrypted storage | $600~1,200 / month |
| Local GPU (large/MoE, always-on, multiple units) | 2~8× H100 (air-gap) | $4,320~17,000 / month or purchase $70,000~280,000 |
| Inference·gateway·session routing | vLLM/SGLang + LiteLLM, multi-tenancy | included in operations labor |
| Data isolation (7.4: schema/RLS/key separation) | per tenant·engagement | build cost + operations |
| Audit·SIEM·chain of custody·backup·DR (Chapter 12) | retention·DR site | $800~2,000 / month |
| **Monthly infrastructure subtotal** | | **≈ $5,720~20,200 / month (≈ KRW 8M~28M)** |

#### Annual infrastructure

≈ **$68,600~242,000 / year (≈ KRW 96M~340M)**. Reflecting GPU·DR·retention as CapEx: initial KRW 100M~400M + operating costs.

#### Red team labor cost (separate)

Financial institutions typically run dedicated staff continuously in parallel with specialist firms, and regulatory response·evidence responsibility means a high proportion of lead-level staff.

| Role | Headcount (assumed) | Annual labor cost (assumed, incl. benefits) |
|---|---|---|
| Lead/responsible (7+ yrs, CISO reporting line) | 1~2 | KRW 100M~150M × headcount |
| Operations·verification (3~6 yrs) | 2~4 | KRW 65M~95M × headcount |
| Blue/purple liaison·audit response | 1~2 | KRW 65M~95M × headcount |
| External specialist periodic deep-dive | — | KRW 50M~200M / year |

- **5~8 continuous dedicated staff + external in parallel (assumed)**: labor **KRW 500M~1B+ / year**. This is based on large financial-sector security organizations, and the staff spans overall security operations rather than being dedicated to AntiFox. Taking only the AntiFox-related share, a design with 2~3 dedicated-equivalent staff + external is possible, landing in the **KRW 200M~400M / year** range.

**Case D total (assumed)**: infrastructure KRW 96M~340M/year + labor (AntiFox-related share) KRW 200M~500M+. Including regulation·DR·audit, **KRW 300M~800M / year** is the realistic range. In finance, **regulatory compliance·evidence reliability** — not "cost reduction" — is the core justification for adoption.

---

### 11.7 Summary table at a glance (assumptions, 2026-11)

| Category | Isolation/model | Per-run infrastructure cost (monthly test) | Annual infrastructure | Red team labor (separate) | Annual total (assumed) |
|---|---|---|---|---|---|
| SMB | low / external API·light local | ≈ KRW 110K~320K | KRW 1.4M~4M | part-time~outsourced KRW 0~30M | KRW 10M~35M |
| Enterprise | medium / local mid, always-on | ≈ KRW 140K~420K (variable) | KRW 26M~58M | KRW 80M~350M | KRW 100M~400M |
| Public sector | high / local mid~large, always-on | (always-on) | KRW 51M~108M | KRW 50M~280M | KRW 150M~350M |
| Financial institution | highest / local large·air-gap·HA | (always-on) | KRW 96M~340M | KRW 200M~500M+ | KRW 300M~800M |

> "Per-run test cost" looks only at purely variable infrastructure (token·GPU usage); public·financial organizations assume always-on GPU ownership, so splitting out a per-run figure has little meaning there. **Most of the real cost is labor**, and automation only reduces the "repetitive execution" portion of labor cost — it cannot reduce the "design·review·responsibility" portion.

---

### 11.8 Budget design checklist

- [ ] Confirm whether external APIs are allowed first (regulation) → if not, local GPU is "a premise, not a choice"
- [ ] Decide rental vs always-on ownership by test frequency (11.2 break-even)
- [ ] Judge the model tier as a capability–review-effort trade-off (light = model cost down · labor cost up)
- [ ] Per-run token consumption assumption × frequency = annual token cost
- [ ] **Always account infrastructure cost separately from labor cost** (labor is most of the total)
- [ ] For public·financial: audit·chain of custody·retention·DR (Chapters 10·12) costs as a separate line
- [ ] Agree with finance on the accounting treatment: GPU rental (OpEx) vs purchase (CapEx)
- [ ] Replace all figures with vendor quotes·internal labor tables at adoption time (this chapter provides structure only)

---

# 12. Operations — backup·recovery · incident response · chain of custody · troubleshooting

For a tool whose evidence is the deliverable, backup·recovery and incident response are not optional but mandatory. This chapter expands in the order: **operational scenario (narrative) → detailed cases in the four functional areas → organization-size checklist → maintenance·TCO**.

### 12.0 Operational scenario — the daily routine of scope·updates·isolation audits

**Clarify the scope of operations.** AntiFox's operational scope is not "a single program". It is a set of six: ① the application (binary·container) ② PostgreSQL (graph·evidence·reports) ③ the LLM gateway·inference server (9.2) ④ network control devices (egress rules·kill switch) ⑤ credentials (LLM keys·DB·target authentication) ⑥ the data lifecycle (retention·destruction·legal hold). Operators must track changes·failures·audits across this entire scope, and leaving any one of the six in a state where "who manages it is unclear" is itself an audit finding.

**Updates are "verified replacement".** As a weekly routine: ① check GitHub Release·CHANGELOG (the three official channels, Appendix G) ② verify the SHA256 of the new version's binary·image ③ **install in the staging lab first** and run the Chapter 6 smoke tests (asset graph→report→data retention) ④ if clean, replace in production — Docker via digest-pinned images and `docker compose pull`, the binary via the one-click update (exit 75 atomic replacement·automatic rollback, Chapter 6) ⑤ keep the previous version's hash·backup for a week after replacement to guard against regressions. **A failed update is not itself an incident** — with a verified rollback path, it ends as a routine event. Updating without a rollback path is the incident.

**The isolated environment is not something you "build" but something you "audit".** Firewall rules and network segregation drift over time. Verify the following in a quarterly audit: ① egress measured — confirm in a controlled, external way that connections from the lab host to destinations outside the allowlist are actually blocked (7.1②) ② kill switch live operation — verify full outbound blocking and task interruption after engaging the switch ③ integrity re-verification — that the hashes of running binaries·images match the approval list ④ access re-verification — review RBAC accounts·roles·login audit logs, disable departed employees' accounts ⑤ data retention·destruction status — that retention automation (12.1) works correctly together with legal hold exclusions ⑥ configuration drift — that `.env`·`config.json`·iptables/nftables match the version-controlled copies. Document the audit results and keep them as **audit-response evidence** (12.3).

### 12.1 Backup·recovery (with RTO/RPO)

The asset graph·exploration graph·evidence·reports all live in PostgreSQL. **The DB is the deliverable**.

| Target | Method |
| ---------------- | ------------------------------------------------ |
| Entire DB (graphs·evidence·reports) | Regular `pg_dump`/`pg_basebackup` + WAL archiving (PITR) |
| pgvector knowledge base | Included in the same DB dump (verify the extension is installed) |
| Encryption keys·secrets | Stored **separately from the DB** (evidence cannot be decrypted if keys are lost) |
| Configuration | Version-control `.env`·`config.json` (secrets in a secret manager) |

**Setting RTO/RPO targets (examples; the organization finalizes them)**: RPO ≤ 24h (daily logical backup) or ≤ 15m (WAL PITR), RTO ≤ 4h (isolated instance restore+verification). State the targets in the ROE·SLA.

```bash
pg_dump -Fc -d antifox -f /secure-backup/antifox_$(date +%F).dump   # daily logical backup
pg_restore -d antifox_restore_test /secure-backup/antifox_YYYY-MM-DD.dump  # quarterly restore rehearsal
```

> **Only what is "tested" gets restored.** Verify an isolated restore + one full report regeneration at least once a quarter.

**Retention automation** — the operational version of the Appendix E.3 policy:

- **Partitioning**: monthly partitions for evidence·traffic tables → `DETACH`+`DROP` expired partitions
- **TTL/cron**: a cron deleting records past the retention period (`DELETE ... WHERE created_at < now()-interval 'N months'`), archive before deleting
- **Caution**: 12.2 legal hold targets must be **excluded** from automatic deletion

**Detailed cases**

- **PG disk failure (risk of losing all deliverables)** — with WAL archiving (PITR) on, recovery goes to the last checkpoint. With an RPO 15m configuration, at worst one recent task is lost. A backup on the same disk as the DB is lost along with it, so **keep backups on a separate volume/remote site** (at minimum the 3-2-1 principle).
- **Encryption key loss** — evidence cannot be decrypted → the deliverable is effectively discarded. Maintain **separate** offline backups of keys (paper·hardware tokens) apart from the DB backup, and include a key rotation plan in the quarterly audit.
- **Update failure rollback** — the one-click update rolls back automatically on SHA256 mismatch, but verify in the restore rehearsal **whether the DB schema remains compatible with the previous version after rollback** (a release containing schema migrations is the worst case).
- **Total lab environment loss (disaster)** — document the procedure to rebuild from `config.json`+secrets+backups on an empty host, and measure the rebuild time to verify RTO achievability.

### 12.2 Incident response (IR) playbook — runaway·scope violation

1. **Contain** — cut outbound immediately with the kill switch (7.1②).
2. **Preserve** — stop tasks, snapshot the DB·logs·MITM traffic. Delete nothing.
3. **Analyze** — use audit logs to determine when·why scope was violated (injection? configuration error?), assess impact.
4. **Notify** — ROE emergency contact line, inform asset owners·legal (regulatory reporting if required).
5. **Correct·resume** — after removing the cause, resume **only when resume conditions (verified scope·approval)** are met.
6. **Lessons** — update detection·rules·ROE, purple team feedback (Chapter 10).

**Detailed cases**

- **Scope violation (scanning out-of-scope hosts)** — in step 3 analysis, pinpoint the offending request via the `target-host` field in the audit log, and determine whether the trigger was (a) a Target/Scope configuration error or (b) an injection inside a target response (7.2). If (a), fix the scope definition; if (b), strengthen the HITL rules. If the out-of-scope target was a third party, **notify first, analyze after** — notification delay is a secondary risk.
- **Prompt-injection-induced behavior** — if the agent attempts writes·privilege escalation·external calls "instructed by the target", the HITL block logs are the primary evidence. Even when blocked, **preserve the injection payload itself as evidence** (blocked ≠ harmless), and isolate the target asset that elicited the response to prevent retesting.
- **Supply-chain infection (suspected backdoor)** — if the image·binary is suspected of tampering (ARTEX backdoor type, Chapter 6), **do not stop at replacing the image**: isolate the host → container·host forensic snapshots → **rotate all related credentials (LLM keys·DB·target credentials)** → rebuild from trusted images → prevent recurrence (digest pin·signature verification). This is the procedure CSA (2026-11) recommended for the ARTEX backdoor response.
- **Suspected data exfiltration (9.5 type)** — if the agent attempted to transmit outside an approved path, extend the investigation with the 12.2 standard flow + the 9.5 checklist (metadata IP·unfamiliar-host alerts), and check whether the transmitted payload contained personal data·credentials to determine whether notification obligations (Personal Information Protection Act) apply.

**Legal hold** — if litigation·audit·regulatory investigation is expected, **immediately exclude the relevant data from retention-period automatic deletion** (hold flag) and prohibit changes·deletion until released. The 12.1 automatic destruction scripts must reference the hold list.

### 12.3 Chain of custody

For evidence to hold weight in court·audit, each stage must be recorded:

| Stage | Record |
| --- | ------------------------------------------ |
| Collection | Collection time·collector·target·tool/version, original **hash (SHA256)** |
| Storage | Storage location·access control (RBAC)·access logs, periodic integrity verification (hash recalculation) |
| Transfer | Transfer time·recipient·method, hash comparison of the transferred copy |
| Destruction | Destruction time·reason·approver, destruction record preserved (only when not under legal hold) |

> AntiFox's append-only audit logs (7.3) and MITM packets are the primary evidence of the "collection" stage. Add hashes·signatures·timestamps to complete the chain of custody.

**Detailed cases**

- **Submission to court·investigators** — record the hash of every submitted copy, and **never submit the original** (retain the original, provide a copy). Record the hashing tool·version·time in the log, and periodically re-verify the original's integrity after submission to counter claims of "tampering after submission".
- **Audit response (financial supervision·CSAP post-inspection)** — what auditors require is not a "log you can show" but **completeness at each point in time**. You must be able to present audit logs recording collection time·collector·tool version and backup snapshots aligned by point in time. Anti-virus false positives and access-log gaps become findings if not cleaned up in advance.
- **Transfer (resignation·external outsourcing·inter-agency sharing)** — record the transfer time·recipient·method·copy hash in the log, and state the receiving side's **retention·destruction obligations** in the agreement. Transfer is the point where control is lost.
- **Destruction** — preserve the destruction time·reason·approver records, and keep **destruction proof** (capture·evidence) according to the physical destruction·cryptographic erasure method. Destruction during a legal hold period is itself an incident.

### 12.4 Troubleshooting

| Symptom | Check |
| ------------ | ------------------------------------------------------------------------------------- |
| LLM call failures | Key/quota, reachability of `ANTIFOX_LLM_BASE_URL`, gateway status, whether egress rules (7.1) block the gateway |
| DB connection errors | `POSTGRES_*`/`config.json` connection values, sslmode, network allowances |
| Local model latency/failure | VRAM overflow·quantization·batch, inference server logs |
| Report (docx) failure | python3·python-docx (binary mode), templates/permissions |
| Update failure | Automatic rollback on SHA256 mismatch, systemd `RestartForceExitStatus=75`, Docker `docker compose pull` |
| Console unreachable | Binding of ports `8787` (console)·`8788` (MITM), reverse proxy/TLS, IP allowlist |

**Detailed cases**

- **"A task that worked yesterday fails today"** — narrow down in this order: ① update status·rollback logs (the most common cause) ② LLM gateway rate limits·failover status (5.8-1) ③ DB capacity (leaving traffic capture on makes PG balloon).
- **When a task appears stuck** — check the engine log for LLM idle status (see the Chapter 6 real-verification logs), and confirm the `:8788` MITM proxy matches the traffic capture switch. Check the intercept approval queue for a pending HITL approval the agent is waiting on.
- **Unconfirmed findings mixed into the report** — check whether the report manager's default filter (confirmed vulnerabilities only) was bypassed and review the template settings; if auto-generated evidence captions contradict the reproduction-step wording, a human edits them (5.8-3).

### 12.5 Organization-size operations checklist — public·financial·SMB

| Area | Public institutions | Financial companies | SMB·small labs |
| --- | --- | --- | --- |
| Operating model | On-premises within security review·CSAP certification scope, dedicated staff | Compliance with supervisory·outsourcing regulations, operations team + audit dualization | 1–2 people wearing multiple hats, automation first |
| Backup·recovery | RPO ≤ 15m (WAL PITR) + remote backups, quarterly restore rehearsal **results reported** | RPO ≤ 24h minimum, evidence retained for contract·supervision periods | Daily `pg_dump` + external storage, semi-annual rehearsals |
| Updates | Apply after approval procedure·security suitability re-verification (change management council) | Staging verification → weekend rollout → monitoring, documented rollback plan | One-click update + hash verification, keep previous version backup |
| Isolation audit | Semi-annual security inspection based on NIS guidelines + external audit response | Regular self-inspection in preparation for FSS IT inspections | Quarterly egress measurement + kill switch test |
| Incident response | Notification obligations·institutional reporting procedures (NIS·MSIT etc.) in parallel | FSC·FSS reporting requirements, meet business-day reporting deadlines | Notify ROE emergency contacts, analyze after evidence snapshot |
| Chain of custody | Align with public records management requirements (production registration·retention periods) | Point-in-time log alignment for supervisory inspections, internal control evidence | Minimal hash·timestamp records, use templates (Appendix E) |
| TCO specifics | Security review·certification costs are the largest item | Audit response·report quality costs | Hardware·electricity are the largest items |

### 12.6 Maintenance·TCO perspective

**Maintenance schedule (operational calendar)**

| Cadence | Items |
| --- | --- |
| Daily | Verify backup success (automatic alerts), LLM gateway status, disk·token usage |
| Weekly | Check GitHub Release·CHANGELOG, spot-review access logs, check key expiry |
| Monthly | Check retention automation (partitioning·TTL), review RBAC accounts·roles, cost report (tokens·GPU) |
| Quarterly | Restore rehearsal (12.1), egress measurement·kill switch live operation, integrity re-verification, key rotation |
| Semi-annual | Full isolation environment audit (12.0), document updates (update policy), re-verify models·pricing·laws |

**TCO composition** — the cost of automation does not disappear; it moves (Chapter 11). Over a 3-year horizon:

```
Annual TCO ≈ infrastructure (server·GPU depreciation + power) + LLM (tokens or self-hosted effective unit cost)
           + labor (operations·review·audit response) + maintenance (update verification·restore rehearsals·audits)
           + compliance (public: security review·CSAP / financial: audit response / SMB: minimal)
```

- **For public·financial organizations the dominant items are labor·compliance** — no matter how much infrastructure is saved, review effort (FP↑)·audit response decide the TCO. The earlier the human review process (Chapter 4 rules) is established, the cheaper it gets.
- **For SMBs the dominant items are hardware·power** — one 24GB GPU (9.3) makes 32B Q4 the practical ceiling, and at low utilization external APIs (only if data transmission is permitted) become favorable in some ranges (Chapter 11 break-even).
- **Three hidden costs** — ① real disaster losses from skipping restore rehearsals ② storing data past its retention period (storage + legal risk) ③ rollback·rework from unverified updates. All three are costs prevented by the 12.0–12.3 routines.

---

# Appendix A. Fictional engagement walkthrough

A fictional authorized test against **intentionally vulnerable targets in an isolated lab**. Not exploits — the **procedure·evidence flow**.

| Stage | Action | Output/evidence |
| ---------- | ---------------------------------------------------- | ---------------- |
| 0. Pre-negotiation | Confirm lab ownership, agree on scope·prohibited actions·time window·kill switch | Written ROE·authorization letter (Appendix E) |
| 1. Environment setup | Target/Scope, HITL rules, global egress proxy/egress blocking, local model connection | config snapshot |
| 2–3. Reconnaissance·enumeration | Map assets·endpoints → build graphs | Asset/exploration graphs |
| 4. Verification | Automatically reproduce 1 candidate, MITM recording | Finding-evidence linkage (+hash) |
| 5. Human review | Inspect packets, judge FP, rate severity, confirm-to-enrich | Review signature |
| 6. Reporting | Draft docx with confirmed vulnerabilities only (简/繁/英) → enrich context·recommendations | Final report (Appendix B) |
| 7. Cleanup | Evidence preservation (chain of custody)·destruction schedule·backup check | Destruction·backup·custody records |

> The core is the **seam** between 4 and 5 — agents produce "candidates", humans produce "confirmation" with evidence.

### A.1 Real environment setup command sequence (2026-11-14 verified)

The actual commands·outputs from performing stage 1 (environment setup) above. All run in the isolated lab; no sensitive values.

**① Release download + integrity verification**

```bash
curl -sL -o antifox.zip https://github.com/AntiFox-AI/antifox/releases/download/v2.0.3/antifox-v2.0.3-darwin-arm64.zip
curl -sL -O https://github.com/AntiFox-AI/antifox/releases/download/v2.0.3/SHA256SUMS
shasum -a 256 antifox.zip        # → 4012597ccdbb4b990828d17a3dfc43392b91b45fc61e1d7fa34042384ade0a3a
                                 #    ← 1:1 comparison with the official SHA256SUMS (Chapter 6 integrity verification ①)
unzip antifox.zip && cd antifox-v2.0.3-darwin-arm64
```

**② Isolated PostgreSQL + `config.json`**

```bash
initdb -D pgdata -U antifox --auth=trust -E UTF8
pg_ctl -D pgdata -o "-p 55432 -c listen_addresses=127.0.0.1" start
createdb -h 127.0.0.1 -p 55432 -U antifox antifox
cat > config.json <<'EOF'
{ "database": { "host": "127.0.0.1", "port": 55432, "user": "antifox",
                "password": "", "dbname": "antifox", "sslmode": "disable" } }
EOF
```

**③ Startup — actual log output (with interpretation)**

```bash
./antifox
```

```
2026/11/14 10:36:01 [tools] 已刷新 orchestration/platform 工具 schema 到代码默认(一次性)
2026/11/14 10:36:01 [mainagent] 已默认绑定 report_finding（主 Agent 现可记录漏洞）
2026/11/14 10:36:01 [custom-tool] 自动检测到 python 解释器: /usr/bin/python3
2026/11/14 10:36:01 [engine] no LLM provider configured — engine idle until set via /api/llm or env
2026/11/14 10:36:01 AntiFox v2.0.3 backend listening on :8787 (data=data, workers=3)
2026/11/14 10:36:03 [mcp] browser 发现 25 个工具并已缓存
2026/11/14 10:36:04 [mcp] filesystem 发现 16 个工具并已缓存
```

- `custom-tool` — automatic python3 detection (docx rendering path). If reports fail, check whether this line is missing (12.4)
- `engine ... idle` — **it starts even without an LLM configured**. Agent operation begins after configuration at `/system/llm/` (or the `ANTIFOX_LLM_*` environment variables)
- `listening on :8787` + the MITM recording proxy on a separate `:8788` (Chapter 6 port table)

**④ Initial setup → login (same flow as the 5.1 real captures)**

Open `http://localhost:8787` in a browser → automatic redirect to `/setup/` → enter the admin password twice → 「设置密码并登录」 (Set Password and Log In) → enter `/function/tasks/`. On later visits, log in at `/login` with account `admin`.

**⑤ Pre-exploration configuration — actual UI paths**

| Purpose | UI path | Items to check·configure |
|---|---|---|
| LLM connection | `/system/llm/` | Create profile (model·key·endpoint·rate limit) → activate, failover·per-role models (4 roles) |
| Egress·capture | `/system/settings/` | Global egress proxy (http/https/socks5, check egress IP via 「测试可用性」 (Test Availability)), traffic capture switch |
| HITL rules | `/system/intercept/` | Confirm built-in rules (`rm -rf`·system directory deletion regex blocking) + add rules as needed |
| Scope setup | `/function/tasks/` → 「新建任务」 (New Task) | Enter goal·target, select **per-task LLM profile·timeout·egress (follow global/direct)** |
| Report prep | `/system/reports/` | Organization settings (issuer·logo·assignee), pre-register per-language templates (简/繁/英) |

### A.2 Human review → reporting flow (details of table stages 4~7)

1. **Verification candidates arrive** — check status·severity in the task detail's findings list (5.6)
2. **Packet inspection** — judge FP or not from the finding's exploit chain (5.3) → step-linked packets (5.4). Also filter out-of-scope targets mixed in here
3. **Confirm-to-enrich** — confirm button → automatic enrichment into structured data (CVSS·impact·fix·reproduction). The human finalizes signature·severity at this point
4. **Report generation** — `/system/reports/` → 「新建报告」 (New Report): select template (language) → select subset of confirmed vulnerabilities → generate. Use the fact that **by default only confirmed vulnerabilities are included** to include only reviewed items
5. **Context·recommendation enrichment** — the human enriches the generated docx draft with business context·recommendations (never quote the agent draft verbatim, Chapter 4 rules)
6. **Cleanup** — check evidence hashes·backups·destruction schedule (Chapter 12), leave logs in the SIEM pipeline (10.3)

---

# Appendix B. Report sample structure (masked)

AntiFox report management **includes only confirmed vulnerabilities by default**, and supports **naming templates (issuer·logo·assignee·CVSS)**, **selectable vulnerability subset inclusion**, and **automatic evidence caption generation**.

**Table of contents**: 1 Executive Summary · 2 Scope & ROE · 3 Methodology (PTES/ATT&CK) · 4 Findings (by severity) · 5–7 Risk Overview · Remediation · Appendices (evidence·logs·graphs)

**Finding structure**

```
Finding ID: AF-2026-00X
Title:       [Category] vulnerability summary
Severity:    High  (CVSS 3.1: 8.1 / vector masked)
Asset:       https://app.lab.internal/****
Status:      Confirmed (operator review **** / 2026-**-**)
Evidence hash: sha256:****   (chain of custody — 12.3)
[Description] What is wrong and why (business impact)
[Evidence]    MITM request/response reference #**** (values masked, reproduction packets)
[Reproduction] 1) … 2) … 3) (within lab scope)
[Impact] / [Remediation] / [References] OWASP·ATT&CK·CWE
```

> Status·review signature·Evidence hash appearing in the report makes "agent draft vs human confirmation vs evidence integrity" visible at a glance.

---

# Appendix C. Domestic (Korean) law legal checklist

> **Disclaimer — draft, pending legal review** — general information, not legal advice. Cited provisions·precedents require case-by-case interpretation. **Do not use in practice until legal review is completed**; after review, fill in the date below: **Legal review completed on: ____**. Attorney review is mandatory before any actual engagement.

### Key relevant provisions

| Law/provision | Act | Statutory penalty (approximate) |
| ------------ | ----------------- | --------------------- |
| Information and Communications Network Act (정보통신망법) Article 48(1) | Intrusion without legitimate access rights/in excess of them | Up to 5 years or up to KRW 50 million (Article 71(1)9) |
| Information and Communications Network Act (정보통신망법) Article 48(2) | Delivering·disseminating malicious programs | Up to 5 years or up to KRW 50 million |
| Information and Communications Network Act (정보통신망법) Article 48(3) | Causing network malfunction | Aggravated punishment |
| Criminal Act (형법) Article 314(2) | Obstructing computer-related business | Up to 5 years or up to KRW 15 million |
| Criminal Act (형법) Article 347-2 | Computer fraud | Up to 10 years or up to KRW 20 million |
| Personal Information Protection Act (개인정보보호법) Article 59 | Wrongful acquisition·use of personal information | Separate punishment |

> **Case law notes (conservative)** — courts focus on **"whether legitimate access rights were exceeded"** and **"whether technical measures were neutralized"** (e.g., Supreme Court 2021도1533 on web crawling). Some lower courts have denied intrusion in public API access cases, but this **depends heavily on individual facts (technical protection measures·collection scope·causation)** and **by no means** means "public APIs·unauthorized crawling are always legal". The conclusion is the **boundary of authority** — the ROE·authorization letter is the written basis for it.

### Practical checklist

- [ ] Written authorization from the owner/operator (one per third-party asset)
- [ ] ROE specifying scope·prohibited actions·time window·emergency contact·data handling
- [ ] Basis for processing·storage·destruction of collected personal information
- [ ] Availability-affecting actions (DoS etc.) prohibited without explicit consent
- [ ] For cloud/external hosting, confirm the provider's terms permit testing
- [ ] For financial·public sectors, additional review of supervisory regulations·network separation·CSAP
- [ ] Legality of cross-border data transfer when using external LLMs (local if unused)
- [ ] Compliance with tool license·usage policy (AGPL + upstream AUP)

---

# Appendix D. AGPL-3.0 compliance

AntiFox is AGPL-3.0, and **providing it as a network service** also triggers source disclosure obligations. Also note the upstream usage policy prohibits real attack·production use.

| Usage form | Source disclosure obligation |
| ----------------- | ----------------- |
| Use without internal modification | None in principle (keep notices) |
| Internal use after modification | Debatable — prepare conservatively |
| Providing a modified version as a network service | **Yes** (Article 13) |
| SaaS·commercial inclusion | **Yes** or separate licensing |

- [ ] Track modifications separately under version control · [ ] Provide network users a source access path (Article 13)
- [ ] Keep license·change notices · [ ] Third-party library compatibility
- [ ] For commercial·closed distribution, consider alternative tools (MIT/Apache) or separate licensing

---

# Appendix E. Contract·operations templates

> **Reference skeletons** that do not guarantee legal effect. Always use after legal review.

### E.1 ROE (Rules of Engagement) template

```
Project: ____            Period: YYYY-MM-DD ~ YYYY-MM-DD
Target scope (allowed): [domain/IP/subnet whitelist]
Out of scope (prohibited): everything not in the list above
Prohibited actions: DoS, data destruction/modification, mass account authentication, operational data exfiltration, lateral movement out of scope
Test time window: [days/times], advance notice channel: ____
Emergency stop (kill switch) contact line: [person/contact, 24h]
Data handling: classification·storage location·encryption·retention period·destruction date·legal hold conditions
RTO/RPO: RPO ___ / RTO ___
Tools/environment: AntiFox vX.Y.Z (isolated lab), LLM: local/external (specified)
Deliverables: report format·language·delivery method
Signatures: issuer (owner) ____ / performer (lead) ____ / date ____
```

### E.2 Test authorization letter skeleton

```
I/we [owner], as the owner/legitimate operator of the systems below,
hereby delegate in writing to [performer] the performance of simulated testing
limited to the following scope·period.
 - Target systems/assets: ____    - Scope·exclusions: ____
 - Period: ____                   - Restrictions (prohibited actions): ____
This delegation is limited to the scope above and does not approve out-of-scope actions.
Owner signature/seal ____  Date ____   (if third-party assets are included, attach each owner's delegation separately)
```

### E.3 Data retention·destruction policy template

```
Data classification: [Sensitive (credentials/personal data) / General (logs/evidence) / Public]
Storage location/encryption/key management: ____
Access control: RBAC roles·resource scope, access log retention
Retention period: evidence [N months], sensitive [contract end + N days]   (automation: 12.1 partitioning/TTL/cron)
Legal hold: exclude from automatic destruction when litigation·audit is expected
Destruction: on expiry via [method], destruction records·approver preserved (chain of custody 12.3)
```

### E.4 Filled-in example — fictional "ACME internal network simulated test" ROE

```
Project: ACME internal web portal simulated test (isolated cloned staging)
Period: 2026-12-01 ~ 2026-12-05 (weekdays 10:00–18:00)
Target scope (allowed): 10.50.10.0/24, *.stg.acme.lab  (not the production network; staging clones)
Out of scope (prohibited): everything else, especially 10.50.20.0/24 (production), internet
Prohibited actions: service disruption·mass login attempts·data destruction, production DB access
Emergency stop contact: ACME security team, Hong Gil-dong, 010-****-**** (24h), performer-side lead Kim**
Data handling: collected traffic AES-256 encrypted, retained 3 months, destroyed contract end +30 days
            Legal hold: not applicable (applies upon advance notice)
RTO/RPO: RPO ≤ 24h (daily backup) / RTO ≤ 4h
Tools/environment: AntiFox v2.0.3 (company isolated lab), LLM: local Qwen3-Coder (company gateway)
Deliverables: Korean summary + original AntiFox docx (英/English), encrypted delivery
Signatures: issuer ACME security team lead ____ / performer lead ____ / 2026-11-28
```

---

# Appendix F. Glossary

- **Red / Blue / Purple Team** — attack side / defense side / the two collaborating to improve detection.
- **Adversary Emulation** — an assessment technique emulating a specific attack group's actual TTPs.
- **ROE** — a written agreement specifying allowed·prohibited·scope·time window·emergency contact·data handling. The premise of all testing.
- **Scope** — the asset range testing is allowed on (whitelist). Everything outside is prohibited.
- **Authorization Letter (위임장)** — the owner/operator's written approval of testing with a specific scope·period.
- **Abuse / exploit** — actually using a vulnerability in an attack. (Distinct from "use".)
- **Exploit chain** — entry point→staged exploitation path.
- **Cyber Kill Chain / MITRE ATT&CK** — linear attack stage model / tactics·techniques knowledge base (the common language of red·blue).
- **C2 / Lateral Movement / PrivEsc** — remote control channel / lateral movement / privilege escalation.
- **Multi-agent (planner/worker/mainagent)** — a cooperative structure differentiated into intent generation·execution·human interface.
- **Dual graph** — global asset graph (shared) + per-task exploration graph (separated). Interconnected via anchors.
- **MITM** — man-in-the-middle. Intercepts traffic and records it as evidence.
- **HITL** — intercepting high-risk actions by rule for human approval/blocking. AntiFox's enforcement point.
- **RBAC** — role-based access control. Resource-level scoping·system roles·login auditing.
- **Global egress proxy** — sends all agent traffic through a single proxy (http/https/socks5), per-task direct/proxy selection (v2.0.3).
- **RAG / pgvector** — retrieval-augmented generation / PostgreSQL vector search extension.
- **False Positive** — false positive. Filtered by human review.
- **Prompt Injection** — hijacking·manipulating agent behavior with instructions hidden in input.
- **Egress blocking** — blocking outbound leaving only an allowlist. The last safety net against scope violation·exfiltration.
- **RLS** — Row-Level Security. Multi-tenant evidence isolation.
- **Chain of Custody** — hash·signature·timestamp records at each stage of collection·storage·transfer·destruction.
- **Legal Hold** — excluding·freezing data from automatic destruction in anticipation of litigation·audit.
- **RTO / RPO** — recovery time objective / recovery point objective.
- **SBOM / Digest Pin / PITR** — software bill of materials / pinning via `@sha256:` / point-in-time recovery.
- **Open-weight** — models with public weights (licenses vary).
- **Air-gap / network separation** — blocking external transmission through network separation.
- **AGPL-3.0** — a copyleft license with source disclosure obligations even when provided as a network service.
- **Enrichment / delivery-grade / reproduction** — structured enrichment / customer-deliverable quality / proof by re-running the attack.
- **Crown Jewel / Kill Switch** — an organization's core asset / emergency total cutoff ("cut first, analyze later").

---

# Appendix G. References

1. **AntiFox** — 3 official channels (no separate website, confirmed 2026-11-14): ① GitHub repository `github.com/AntiFox-AI/antifox` (README·CHANGELOG·releases·`screenshots/`·`.env.example`·`config.example.json`) ② GHCR package `ghcr.io/antifox-ai/antifox` ③ WeChat official account (QR in the repository). AGPL-3.0, currently v2.0.3 (2026-10-30). Each release provides **`SHA256SUMS`**. Usage policy: only personal learning·local isolated verification permitted. Report languages: 简/繁/英.
2. **ARTEX** (@Autumn-27) — technical base (original closed-sourced). Supply-chain incident: CSA "The ARTEX Docker Backdoor" (2026-11-06) — Docker Hub image backdoor.
3. Competitors — PentAGI · Agent Zero · PentestGPT · HexStrike AI · Strix · RedAmon.
4. **MITRE ATT&CK · Cyber Kill Chain · PTES · OSSTMM · NIST SP 800-115 · OWASP · CIS**.
5. **Sigma** — official spec (including correlation rules). Verify rule examples after backend mapping.
6. Open-weight models (checked 2026-11) — DeepSeek V4, Qwen3.5/3-Coder, GLM-5.x, Kimi K2.x, Llama 4, Mistral/Gemma. Re-verify each model's official cards·leaderboards.
7. Cost anchors (checked 2026-11) — public GPU rental·LLM API price comparison pages (H100 market rates·token unit prices·break-even). Re-verify vendor price pages.
8. Recent cases (2026-11) — reports of AntiFox-linked AWS credential·secret access, CloudTrail detection gaps.
9. Domestic (Korean) law — Information and Communications Network Act (정보통신망법) Articles 48·71, Criminal Act (형법) Articles 314(2)·347-2, Personal Information Protection Act (개인정보보호법); Supreme Court 2021도1533 etc. (check the latest at adoption time).
10. License — GNU AGPL-3.0 (especially Article 13).
11. Open-weight supply chain — Cohere "Concerning behavior from a popular open-weight AI model" (2026-10-26) · [incident summary column](https://docs.vibequant.cc/columns/open-weight-data-leak/) (2026-10-27) · NIST SP 800-218A. Guardrail-removed models (abliterated/uncensored) are derivatives, not official releases — follow the 9.4 warning.

> AntiFox·models·prices·laws change fast. **Verify facts against official sources at adoption time.** Always cross-check setting variables·features against your installation.

---

## Update Policy (maintaining this document)

1. **Check-date fields** — versions·prices·models·laws·cases state their time in the text as "(checked 2026-11)". Dates may differ per item.
2. **Periodic review** — at least once every 6 months: re-check official repository releases·CHANGELOG → re-check price pages·model cards → refresh domestic law·case law.
3. **Change log** — when updating, add dated items to the "Change summary" at the top of the document (current: 2026-11-14 changes).
4. **RC → v1.0 finalization conditions** — ① legal review completed (fill in the Appendix C date), ② LLM-connected task execution·report generation verified (the unperformed item in Chapter 6 real-field verification). When complete, remove the "pending verification" wording and the RC notation from the cover banner.
5. **Language editions** — the Korean original is the baseline, with the English edition (`AntiFox-Guide_EN.md`) in parallel. The English edition is synced from the Korean original, with sync dates noted; when the original changes, sync the English edition (record the sync date).

---

## About the author

**Dennis Kim (김호광)** — CEO of Betalabs Inc., former CEO of Cyworld. Over 28 years of development experience spanning game security·social platforms·blockchain, with independent vulnerability research published including a Telegram 0-click RCE (ZDI-CAN-30207, CVSS 9.8). He **freely distributes security research in multiple languages (Korean·English·Japanese·Chinese) with no paywall**, motivated by "sharing knowledge to make the world a little better".

GitHub: github.com/gameworkerkim · Contact: gameworker@gmail.com

---

*© Dennis Kim. Free distribution for knowledge sharing. Responsibility for use of this document rests with the user, and use against unauthorized systems is prohibited. Use of AntiFox is governed by the project's AGPL-3.0 license and usage policy.*
