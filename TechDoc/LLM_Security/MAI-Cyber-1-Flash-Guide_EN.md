# MAI-Cyber-1-Flash Technical Guide

Microsoft's first cybersecurity-dedicated AI model — architecture, benchmarks, TCO, and competitive landscape analysis

| Field | Details |
|------|------|
| Document Version | 2.0 (Fact-checked and corrected edition) |
| Reference Date | July 30, 2026 |
| Target Model | MAI-Cyber-1-Flash (Microsoft AI) |
| Announcement Date | July 27, 2026 (Monday), San Francisco |
| Presenters | Mustafa Suleyman (CEO, Microsoft AI), Hayete Gallot (Microsoft Security) |
| Primary Sources | Microsoft AI official announcement, MAI-Cyber-1-Flash Model Card |
| Confidence Level | B2 (Vendor self-reported, partial cross-validation, independent verification incomplete) |

---

## 0. Major Corrections from v1.0

This document is a corrected revision of the initial edition. Corrections are listed first.

| # | v1.0 Statement | Correction | Basis |
|---|---------------|------------|-------|
| 1 | Base model MAI-Thinking-1 = 100B params / 35B active | **~1T total / 35B active**. "100B" was a typo | MAI-Thinking-1 Technical Report |
| 2 | Directly derived from MAI-Thinking-1 | Precisely: **cybersecurity fine-tune of MAI-Code-1-Flash**, which was developed from a MAI-Thinking-1 mid-training checkpoint (MAI-Thinking-1 lineage) | Model Card |
| 3 | Training data >10T tokens | **MAI-Cyber-1-Flash training tokens not disclosed**. 30T tokens is the pretraining scale of the upstream base model MAI-Base-1 | MAI-Thinking-1 Technical Report |
| 4 | CyberGym 96% | Actual: **95.95%**. Microsoft blog rounds to 96%. Also, this is the **MDASH system score, not model-only score** | Model Card, Microsoft AI Blog |
| 5 | Claude Mythos 5 = 84% | **83.8%** | The Register, Infosecurity Magazine |
| 6 | Gemini / GPT-5.6 Sol = "below 96% (comparison group)" | Specific figures exist: **GPT-5.5 Cyber 85.6%, GPT-5.6 Sol 83.6%, Gemini 3.5 Flash Cyber (within CodeMender) 83.2%** | Same |
| 7 | Trillions of signals daily | **Over 100 trillion** security signals daily, 1.6M customers | Microsoft AI Official Announcement |
| 8 | 90% used interchangeably as replacement rate | **90% = processable task share (design target); 80% = replaced model share within MDASH**. Different metrics | Model Card |
| 9 | Startable with Azure subscription or M365/Defender license | **Error**. Model is only available via Azure AI Foundry **private preview for approved MDASH customers**. No general API or standalone endpoint | Model Card, The Hacker News |
| 10 | Built into Defender, usable without separate installation | While Project Perception enters Defender public preview (Aug 3), launch is **focused on business customers already testing MDASH** | Directions on Microsoft, Forrester |
| 11 | (Missing) | All 3 ExploitGym categories scored **0 — intentional design** | Model Card |
| 12 | (Missing) | As of July 28, 2026, **95.95% not yet listed on public CyberGym leaderboard**; May 12 88.4% remains the latest registered entry | The Hacker News |
| 13 | (Missing) | **Model not provided to independent evaluators pre-release** (NYT report). Microsoft only mentions "anonymous third-party evaluation" | GeekWire |

---

## 1. Overview

**MAI-Cyber-1-Flash** is Microsoft's **first cybersecurity-dedicated AI model**, unveiled on July 27, 2026 at a San Francisco event. Developed internally by the Microsoft AI (MAI) organization, it is specialized for finding vulnerabilities in complex codebases.

The core architecture is not a standalone model but a **system**. The model is not offered as an independent endpoint; it operates exclusively within Microsoft's multi-agent vulnerability identification and remediation harness — **MDASH** (Multi-model agentic Discovery And Security Harness), which orchestrates over 100 specialized agents. MAI-Cyber-1-Flash handles up to 90% of the workload, while the remaining ~10% of hardest tasks are escalated to OpenAI's GPT-5.4.

**Project Perception**, announced alongside, is an agentic security system that coordinates Red Team (attack path discovery), Blue Team (risk identification and investigation), and Green Team (remediation and hardening) agents. It enters **public preview within Microsoft Defender on August 3, 2026**.

Mustafa Suleyman summarized the positioning succinctly: "World-class performance at half the cost." The core value proposition is not raw performance but **performance-per-cost (routing).**

### 1.1 Full Announcement Package

| Component | Nature | Status |
|-----------|--------|--------|
| MAI-Cyber-1-Flash | Cybersecurity-dedicated LLM | Azure AI Foundry private preview (MDASH-approved customers) |
| MDASH | Vulnerability discovery & remediation harness | First unveiled May 12, 2026; operational |
| Project Perception | Agentic security system (R/B/G teams) | Public preview Aug 3, 2026 (within Defender) |
| FORGE Lab | Frontier Offensive Research and Generative Exploration Lab | Newly established, led by Taesoo Kim (former Team Atlanta leader) |

---

## 2. Architecture & Model Specs

### 2.1 Official Specs (from Model Card)

| Specification | Details |
|---------------|---------|
| Architecture | Self-attention + **Sparse Mixture-of-Experts (MoE)** Transformer |
| Total Parameters | **137 billion (137B)** |
| Active Parameters | **5 billion (5B)** — per-token activation |
| Context Window | **256,000 tokens** |
| Input/Output Modality | Text-only (text-in / text-out) |
| Direct Base Model | **MAI-Code-1-Flash** (lightweight agentic coding model embedded in GitHub Copilot / VS Code) |
| Lineage | MAI-Base-1 → MAI-Thinking-1 (mid-training checkpoint) → MAI-Code-1-Flash → MAI-Cyber-1-Flash |
| Training Data Scale | **Not disclosed** |
| Deployment | MDASH-internal only. No standalone API. |

### 2.2 Upstream Models in the Lineage (Reference)

Understanding MAI-Cyber-1-Flash requires understanding its lineage. This was the biggest error in v1.0.

| Model | Total Params | Active Params | Notes |
|-------|-------------|---------------|-------|
| MAI-Base-1 | ~1T | 35B | Pretraining base. 30T tokens, no synthetic data, no third-party model distillation |
| **MAI-Thinking-1** | **~1T (~1T)** | **35B (35B)** | Announced Build 2026, June. 512 experts, 8 active per token. 256k context |
| MAI-Code-1-Flash | Not disclosed | 5B (5B) | Lightweight agentic coding model |
| **MAI-Cyber-1-Flash** | **137B (137B)** | **5B (5B)** | Subject of this document |

MAI-Cyber-1-Flash is a scaled-down derivative of the flagship reasoning model, designed as an **ultra-lightweight routing workhorse** with only 5B active parameters. This is the entirety of the TCO logic discussed later.

### 2.3 MDASH Harness Architecture

The harness is the actual product — more so than the model. As Microsoft VP Taesoo Kim put it: "The model is an input; the system around it is the product."

**5-Stage Pipeline**

| Stage | Role |
|-------|------|
| Prepare | Prepare target codebase and context |
| Scan | Discover vulnerability candidates |
| Validate | Verify candidates, remove false positives |
| Dedupe | Consolidate duplicate findings |
| Prove | Prove exploitability via trigger input execution (ASan for C/C++ targets) |

**Agent Role Distribution**

- **Auditor agent**: Flags findings
- **Debater agent**: Debates exploitability. **Disagreement between agents is itself used as a signal**
- 100+ specialized agents total, mixing multiple frontier and distilled models

**Development Organization & Track Record**

| Item | Details |
|------|---------|
| Dev Organization | Microsoft **Autonomous Code Security (ACS)** team |
| Key Personnel | Many alums of **Team Atlanta**, winners of DARPA AI Cyber Challenge (AIxCC) |
| May 2026 Results | **16 CVEs discovered** in Windows networking/auth stack (incl. 4 Critical RCEs) |
| Retrospective Validation | clfs.sys: **96% reproduction** of 28 MSRC cases over 5 years; tcpip.sys: **100%** of 7 cases |

### 2.4 90/10 Routing Architecture

The technical innovation of MAI-Cyber-1-Flash is not the model itself but **difficulty-based routing**.

```
              ┌─────────────────────────────────────┐
   Security    │           MDASH Harness              │
   Task ──────▶│  (Router + 100+ Agents + 5-Stage)    │
              └──────────┬────────────────┬─────────┘
                         │                │
                    Up to 90%           ~10%
                         │                │
                         ▼                ▼
            MAI-Cyber-1-Flash         GPT-5.4
            (137B/5B, low cost)    (~10x larger)
```

Suleyman (July 27, 2026 event): "Within MDASH, MAI-Cyber-1-Flash handles up to 90% of queries — detecting vulnerabilities, patching them, and verifying the fix actually works. The remaining 10% are handed off to a larger model, GPT-5.4." He noted GPT-5.4 is **approximately 10x larger** than MAI-Cyber-1-Flash.

In a VentureBeat interview, the harness was described as a "router." The system has three components: the harness, the small MAI-Cyber-1-Flash handling the bulk, and the general-purpose coding model GPT-5.4 for escalation.

The choice of GPT-5.4 (not the latest GPT-5.6) as the escalation target is also cost-driven. Suleyman: "GPT-5.6 is expensive. GPT-5.4 is great value for money."

### 2.5 Defense-Only Design (Important)

This was entirely missing from v1.0 — and it is the most important design fact from a CTI perspective.

The Model Card reports standalone performance (lightweight terminal harness) as follows:

| Benchmark | MAI-Cyber-1-Flash |
|-----------|-------------------|
| CVEBench | 0.314 |
| CyberSecEval4 — Threat Intelligence | 0.553 |
| CyberSecEval4 — Malware Analysis | 0.330 |
| CRSBench | 0.651 (POV=1200) |
| **ExploitGym — Kernel** | **0** |
| **ExploitGym — Userspace** | **0** |
| **ExploitGym — Browser** | **0** |

ExploitGym measures the ability to turn a given vulnerability and crash input into an actual code-execution exploit. The zero scores across all categories are not a flaw — they are **intentional**. Microsoft explicitly states the model is trained to perform defensive tasks (bug patching, etc.) and is not trained on offensive tasks (malware distribution, etc.).

**Practical implication**: A 5B-active model that achieves 95.95% discovery pipeline performance without the ability to generate exploits is a structurally lower-risk defender-only artifact. This is an architecture-level approach to the dual-use problem — the biggest risk in adopting open-weight cyber models.

### 2.6 Safety & Enterprise Controls

| Layer | Controls |
|-------|----------|
| Model Training | Security-first calibration |
| Evaluation | Microsoft AI Red Team evaluation, automated + expert-led adversarial training, third-party independent evaluation (evaluator undisclosed) |
| Deployment | Role-Based Controls, tenant isolation, encryption, audit trail |
| Execution Environment | **Sandbox execution environment with no internet access** |
| Benchmark Environment | Network-isolated environment with no access to production, public internet, or external services |

The Model Card warns that generated text and code may be inaccurate or incomplete and requires review before use in critical contexts.

---

## 3. Performance Benchmarks

### 3.1 Understanding CyberGym

CyberGym is a public benchmark evaluating AI systems' ability to find real vulnerabilities in large codebases. Microsoft calls it the "gold standard."

| Attribute | Details |
|-----------|---------|
| Task Count | **1,507** real vulnerability reproduction tasks |
| Source Projects | **188 OSS-Fuzz projects** |
| Microsoft Evaluation Configuration | **Level 1 (default settings)** |
| Level 1 Definition | Provide vulnerable source code + high-level vulnerability description; verify if a working PoC is produced |
| **What it does NOT measure** | **Blind vulnerability discovery capability, correctness of generated patches** |

This last item is critical. Level 1 tests "reproduction of a known vulnerability given a description." It does NOT measure the ability to independently find 0-days or whether patches are correct.

### 3.2 CyberGym Comparison at Announcement (July 27, 2026)

| Rank | System | CyberGym Level 1 | Provider |
|------|--------|------------------|----------|
| 1 | **MDASH + MAI-Cyber-1-Flash + GPT-5.4** | **95.95%** | Microsoft |
| 2 | GPT-5.5 Cyber | 85.6% | OpenAI |
| 3 | Mythos 5 | 83.8% | Anthropic |
| 4 | GPT-5.6 Sol | 83.6% | OpenAI |
| 5 | Gemini 3.5 Flash Cyber (within CodeMender) | 83.2% | Google |

Microsoft frames this as "+12 points vs. Mythos" and rounds 95.95% to 96%. The four competing systems cluster between 83.2%–85.6%.

**Caution**: All numbers in this table are Microsoft-run tests on Microsoft's own infrastructure. These are Microsoft's measurements of competitor systems — not vendor-submitted leaderboard entries.

### 3.3 MDASH Performance Timeline — Interpret with Care

| Date | Configuration | Score | Notes |
|------|--------------|-------|-------|
| May 12, 2026 | MDASH, GA models only | **88.45%** | #1 on public leaderboard at the time; ~5pt gap to #2 (83.1%) |
| June 2026 | MDASH | 96.55% | **Counted all crashes.** Included vulnerabilities beyond the target set |
| July 27, 2026 | MDASH + MAI-Cyber-1-Flash + GPT-5.4 | **95.95%** | Judgment criteria not disclosed |

**Do not read these three numbers as a time-series improvement.** The June 96.55% used looser criteria; whether July data used the same criteria is undisclosed. The Model Card only states: "replaced 80% of existing MDASH models, improving from 88.4% → 95.95%."

### 3.4 Independent Verification Status

| Verification Item | Status |
|-------------------|--------|
| CyberGym public leaderboard listing | **Not listed** (confirmed July 28, 2026). May 12 88.4% remains the latest entry. Microsoft materials don't mention submission |
| Provided to independent evaluators pre-release | **Not provided** (NYT report) |
| Third-party evaluation | Microsoft claims it was conducted. **Evaluator name undisclosed** |
| Cost savings reproducibility | **Impossible**. Token usage, call volume, latency, task mix, compute allocation all undisclosed |

### 3.5 Competitive Benchmark Context — Missing Reference Point

Two days before the announcement (July 25, 2026), Sakana AI released its orchestration model **Fugu-Cyber**, reporting CyberGym **86.9%** and CTI-REALM **72.1%**. These numbers exceed all four systems (83.2–85.6%) in Microsoft's comparison chart. It was excluded from Microsoft's comparison set.

When citing benchmark comparison tables, note that they reflect the vendor's chosen comparison group.

---

## 4. Strategic Direction

### 4.1 "Defend AI with AI"

The official announcement's thesis: Attackers wield increasingly powerful capabilities, scanning massive codebases for a single weakness. **As the cost of finding flaws collapses, the traditional model of intermittent scanning followed by later patching is already obsolete.**

Hayete Gallot described Perception as enabling defenders to "defend AI with AI at the same scale and speed as attackers."

### 4.2 "Not the biggest model — the smartest routing system"

Microsoft's argument is a shift from model-size competition to system-design competition. Running a frontier model across an entire enterprise repository is cost-prohibitive. Microsoft contends that **compute cost, not model availability, constrains a defender's scan coverage.**

Suleyman's market diagnosis is also valid: "People are maxing out on tokens across their business. So there's a massive pushback everywhere to reduce costs." He added that the key barrier to AI adoption is chip access, and cost is a function of chips.

### 4.3 Three Pillars: Model. Data. Harness.

| Pillar | Microsoft's Claim |
|--------|-------------------|
| **Model** | Compact, code-centric security model trained from scratch on high-quality data |
| **Data** | Deepest advantage. **100+ trillion security signals daily** spanning identity, endpoint, cloud, and network; MSRC vulnerability history; operational insights from **1.6M customers**; records of real exploits and remediations. "No one can artificially create this history" |
| **Harness** | 100+ agent system tuned by top industry security experts |

### 4.4 Cybersecurity as a "Live RL Loop"

The most compelling part of Microsoft's differentiation logic. Cybersecurity is not merely a data-rich domain — it is a **living RL loop**. Every day, defenders investigate threats, triage alerts, remediate vulnerabilities, and learn from outcomes.

Microsoft claims to observe this loop end-to-end — what was exploitable, what was contained, what was blocked, what actually worked. If you can connect actions to outcomes, you have more than just data.

### 4.5 The Backdrop: Reducing OpenAI Dependency

MAI-Cyber-1-Flash is part of Microsoft's **7 in-house model families** announced at Build 2026 in June — a strategy to reduce dependency on external model providers (including OpenAI).

However, the configuration that produced the headline score still depends on GPT-5.4. This model has **reduced**, not removed, MDASH's dependency on OpenAI.

---

## 5. TCO (Total Cost of Ownership)

### 5.1 Cost Structure

| Item | Details |
|------|---------|
| Savings claim | **50% reduction** vs. previous MDASH top configuration (**GPT-5.4 + GPT-5.4 mini + GPT-5.3 Codex**) |
| Savings mechanism | Route base queries through low-cost dedicated model; escalate only over-threshold difficulty |
| Perception billing | Consumption-based pay-as-you-go, measured in **Security Compute Units (SCU)** |
| SCU unit price | **Not disclosed**. Different agent types consume SCU at different rates |
| Model-specific pricing | No separate public price list (private preview) |

### 5.2 TCO Advantages

1. **Lifting the token cost ceiling**: Handling inbound attack volumes requires high scan frequency, but frontier model token cost is a practical ceiling. Defaulting to a 5B-active model raises this ceiling.

2. **Shortening scan cycles**: From monthly patch cycles to continuous operation. Perception agents run persistently.

3. **Shared context layer**: Perception maintains a continuously updated shared "security context" of the organization's assets, identities, relationships, risks, and activities. Agents don't collect raw signals from scratch — reducing both token cost and latency.

4. **Labor cost reduction**: Agent sharing of triage, investigation, and remediation workflows previously handled manually by multiple security experts.

### 5.3 TCO Risks

| Risk | Details |
|------|---------|
| Unverifiable savings rate | The 50% basis — token usage, call volume, latency, task mix, compute allocation — is entirely undisclosed. Cannot be normalized against other systems |
| Comparison baseline is own config | 50% = "vs. Microsoft's previous configuration." Does not imply absolute cost advantage vs. competitors |
| SCU budget variability | Consumption-based, not fixed license tier — **scan coverage becomes a budget item.** Expanding scans means expanding costs |
| Escalation ratio variability | 90/10 is a design target ("up to 90%"). If actual codebase difficulty distribution is unfavorable, GPT-5.4 call share rises, eroding savings |
| Benchmark–real-world gap | Vulnerability sets for benchmarking behave differently from live codebases with incomplete documentation, stale dependencies, and years of accumulated patch history |

**Practical recommendation**: When evaluating during preview, measure **how the R/B/G loop performs against your own vulnerability backlog and threat profile** — and whether **actual escalation ratio converges to 10%.** The latter determines the entire TCO.

---

## 6. Competitive Landscape

### 6.1 Commercial Dedicated Model Comparison

| Model | Provider | CyberGym | Access Approach |
|-------|----------|----------|-----------------|
| **MAI-Cyber-1-Flash (MDASH+GPT-5.4)** | Microsoft | **95.95%** | MDASH-approved customers, Azure AI Foundry private preview |
| GPT-5.5 Cyber | OpenAI | 85.6% | Limited availability |
| Mythos 5 | Anthropic | 83.8% | **Glasswing** program, limited trusted partners |
| GPT-5.6 Sol | OpenAI | 83.6% | **Daybreak** program (launched May 2026), government-approved customers only |
| Gemini 3.5 Flash Cyber | Google | 83.2% | Available within **CodeMender** |
| Fugu-Cyber | Sakana AI | 86.9% | Orchestration model (not included in Microsoft's comparison) |

This entire category is gated. Mythos 5 and GPT-5.6 Sol are restricted to small, government-approved customer sets; MAI-Cyber-1-Flash is MDASH-customer-only. Due to attack capability leakage concerns, cyber-dedicated models are effectively all restricted-distribution models.

### 6.2 Open-Source / Open-Weight Comparison

| Dimension | MAI-Cyber-1-Flash | Open-Source Alternatives (CodeQL, Semgrep, SecBERT lineage, open-weight coding models) |
|-----------|-------------------|--------------------------------------|
| Licensing | **Proprietary, not open-weight** | Open |
| Training Data | Decades of real security incidents & remediation records (non-replicable) | Public data |
| Harness | 100+ agents, 5-stage, expert-tuned | Requires self-build |
| Escalation | Built-in GPT-5.4 integration | Requires self-design |
| Product Integration | Microsoft Defender, GitHub PR, MCP server | Individual integration |
| On-premises self-hosting | Not available | Available |
| Auditability | Vendor-provided audit logs | Full stack auditable |
| Cost structure | SCU consumption-based (variable) | Infrastructure cost (fixed) |
| Dual-use risk | Attack capability not trained (ExploitGym 0) | Varies by model; difficult to control |

**Note**: MAI-Cyber-1-Flash is not open-source. v1.0's section header "Comparison with competing open-source models" was itself a category error. This model is not a competitor in the open-weight ecosystem — it is a product in the **enterprise managed security services** category.

### 6.3 Industry-Wide Simultaneous Moves

Announcements in the same direction clustered around MAI-Cyber-1-Flash:

| Date | Entity | Content |
|------|--------|---------|
| May 2026 | OpenAI | Daybreak program launched |
| June 2026 | Anthropic | Mythos 5 / Fable 5 released, Glasswing program |
| Early July 2026 | Google Cloud | **CodeMender** launched |
| July 25, 2026 | Sakana AI | Fugu-Cyber released |
| July 27, 2026 | Microsoft | MAI-Cyber-1-Flash + Project Perception + FORGE Lab |
| Concurrently | NVIDIA | **Open Secure AI Alliance** launched (Microsoft participating) |

The common theme: **cybersecurity is a multi-model problem.** The industry consensus is that covering the full spectrum with a single frontier model is financially untenable.

---

## 7. Project Perception Details

Since Perception is the actual path to encountering MAI-Cyber-1-Flash, it's detailed separately.

### 7.1 Three-Color Agent Structure

| Team | Role |
|------|------|
| **Red Team Agent** | Attack-path discovery from attacker perspective. Reconnaissance, attack path evaluation, vulnerability scanning |
| **Blue Team Agent** | Signal investigation, context reasoning, meaningful risk identification and prioritization. New detection rule creation |
| **Green Team Agent** | Remediation action execution, patch authoring, environment hardening. Can generate GitHub-linked PRs |

The color classification follows standard infosec industry terminology, not a Microsoft invention.

### 7.2 Operational Characteristics

| Item | Details |
|------|---------|
| Delivery Location | **Within Microsoft Defender** (Defender-only at present) |
| Public Preview | **August 3, 2026**, worldwide |
| Initial Target | Business customers already testing MDASH |
| First Application Scenario | Software vulnerability management within MDASH |
| Initial Demo Scope | Web application hardening |
| Interface | Defender workflow + **MCP server** (CLI-executable) + GitHub PR |
| Human-in-the-Loop | **Human approval required for high-impact actions** |
| Shared Context | Continuously updated layer of assets, identities, relationships, risks, activities |
| Billing | Consumption-based, SCU unit |

Perception targets a broader scope than MDASH. While MDASH focuses on vulnerability scanning/identification, Perception covers the full security lifecycle: attack path identification → prioritization → remediation implementation → new detection creation.

Microsoft plans to expand MAI-Cyber-1-Flash beyond software vulnerability work into other security workflows.

### 7.3 MCP Server Security Considerations

Perception providing an MCP server requires separate evaluation during adoption. MCP is a protocol for which multiple vulnerability cases (prompt injection, excessive tool permissions, server trust boundary issues) were reported during 2025–2026. A structure where a security automation agent holds CLI execution permissions via MCP **could become a privilege escalation path.**

Adoption checklist:

- MCP server authentication/authorization model and token scope
- Green Team agent's code modification permission scope and approval gate placement
- Which repositories/branches GitHub PR creation permission extends to
- Injection defense for external inputs processed by agents (threat intel feeds, issue comments, etc.)
- Audit method for whether sandbox isolation actually maintains internet-blocked state

---

## 8. Adoption & Getting Started

Most of this section in v1.0 was factually incorrect. The actual access path is far more restricted.

### 8.1 Current Accessibility (as of July 30, 2026)

| Target | Access Condition | Status |
|--------|-----------------|--------|
| MAI-Cyber-1-Flash model | **Approved MDASH customers**, Azure AI Foundry private preview | Gated |
| Standalone API | **Does not exist** | N/A |
| General application integration | **Not possible** — MDASH-internal only | N/A |
| MDASH | Via Microsoft Security sales channel | Existing customers |
| Project Perception | Public preview within Microsoft Defender | August 3, 2026 |

In other words, "startable with an Azure subscription" is false. Organizations already in the Microsoft Defender and MDASH track are the practical target.

### 8.2 Realistic Entry Path

**Step 1. Confirm Prerequisites**

- Microsoft Defender adoption (prerequisite for Perception)
- MDASH program participation or eligibility
- Azure AI Foundry tenant and governance policies

**Step 2. Check Project Perception Preview (after Aug 3)**

Verify preview activation eligibility on the Microsoft Security product page and Defender admin console. Access timing varies by organization size and existing contracts.

**Step 3. MDASH Access via Sales Channel**

Model access itself requires MDASH approval. No public self-service registration path currently exists. Contact your Microsoft account representative or partner.

**Step 4. Pilot Design**

Pre-define metrics to measure during preview evaluation.

| Metric | Why It Matters |
|--------|---------------|
| Actual escalation ratio | If 90/10 doesn't hold, the 50% savings logic collapses |
| SCU consumption vs. findings count | Derive cost per finding |
| False positive rate (post blue team triage) | Not measured by the benchmark |
| Green Team patch accuracy | Not measured by CyberGym Level 1 |
| Coverage vs. own backlog | Verify gap between synthetic benchmarks and live codebases |
| Approval gate throughput time | Whether human-in-the-loop becomes an actual bottleneck |

**Step 5. Governance Documentation**

- Agent permission matrix (RBAC mapping)
- Automated remediation scope (allowed/forbidden)
- Audit log retention and review procedures
- Tenant isolation verification method
- Incident rollback procedures

### 8.3 Adoption Decision Criteria

| Condition | Recommendation |
|-----------|---------------|
| Already Microsoft Defender-centric stack + large proprietary codebase | High preview evaluation value |
| Multi-cloud / non-Microsoft security stack | Low near-term benefit (Defender-only) |
| On-premises self-hosting requirement | Not applicable |
| Regulatory model auditability requirement | Pre-review whether vendor-provided audit logs suffice |
| Small codebase | SCU-based billing advantage limited with small scan scope |

---

## 9. Overall Assessment

### 9.1 By Verification Level

| Confidence | Item |
|------------|------|
| **Confirmed (Model Card / official docs)** | 137B/5B/256k MoE specs, MAI-Code-1-Flash fine-tune, text-only, MDASH-only deployment, ExploitGym 0/0/0, standalone scores (CVEBench etc.), 5-stage pipeline, Perception Aug 3 preview, SCU billing |
| **Vendor claim (partial cross-validation)** | CyberGym 95.95%, competitors 83.2–85.6%, 50% cost savings, up to 90% task handling, 100T+ daily signals, third-party evaluation conducted |
| **Unverifiable / undisclosed** | Training token scale, SCU unit price, 50% savings derivation, third-party evaluator identity, real-world false positive rate, patch accuracy |
| **Contradicted / inconsistent** | CyberGym public leaderboard not listed (as of Jul 28), independent testers not provided pre-release |

### 9.2 Assessment

**Convincing aspects**

The routing architecture is a substantive engineering answer. The diagnosis that single-frontier-model use constrains scan frequency via cost — and that constraint becomes a security gap — is accurate. Defaulting to a 5B-active model with escalation only for over-threshold difficulty is the right direction for relaxing this constraint.

Publicly announcing ExploitGym all-zero as an intentional design choice is also commendable. Blocking the dual-use problem — the biggest risk of cyber-dedicated models — at the training stage and publishing it in measurable form is notable.

MDASH's retrospective validation (96% of 28 clfs.sys cases, 100% of 7 tcpip.sys cases) and actual discovery of 16 CVEs in May are practically more meaningful evidence than benchmarks.

**Difficult to accept**

95.95% is a system score, not a model score — and that system depends on a competitor's model (GPT-5.4). The narrative of beating frontier competitors coexists in the same announcement with the fact of using a frontier competitor's model internally.

CyberGym Level 1 measures "reproduction of a known vulnerability given a description." It measures neither blind discovery nor patch correctness — arguably the two most important capabilities in practice. Neither is captured in the headline number.

Leaderboard non-listing and pre-release independent tester non-provision, taken together, are problematic. If the benchmark is the "gold standard," submitting to its leaderboard would be natural.

50% savings are non-reproducible. The comparison target is also Microsoft's own previous configuration. It cannot be used as a basis for claiming absolute cost advantage over competing systems.

**Conclusion**

This announcement is best read as a **system architecture announcement, not a model announcement.** Taesoo Kim's framing ("The model is an input; the system around it is the product") is the most honest summary of the entire event.

Benchmark numbers are vendor self-measured and therefore weak as a basis for adoption decisions. Two things are worth using as judgment criteria: First, Microsoft's operational track record of actually finding CVEs in its own Windows codebase. Second, the structural logic of reducing scan unit cost through routing. Both are verifiable without benchmarks and can be directly confirmed in a preview pilot against your own environment.

---

## 10. References

### 10.1 Primary Sources

| Source | Link |
|--------|------|
| MAI-Cyber-1-Flash official announcement | https://microsoft.ai/news/introducing-mai-cyber-1-flash-inside-mdash/ |
| MAI-Cyber-1-Flash model page | https://microsoft.ai/models/mai-cyber-1-flash/ |
| MAI-Cyber-1-Flash Model Card (PDF) | https://microsoft.ai/pdf/MAI-Cyber-1-Flash-Model-Card.pdf |
| MAI-Code-1-Flash Model Card (PDF) | https://microsoft.ai/pdf/MAI-Code-1-Flash-Model-Card.PDF |
| MAI-Thinking-1 Technical Report (PDF) | https://microsoft.ai/pdf/mai-thinking-1.pdf |
| Project Perception product page | https://www.microsoft.com/en-us/security/business/ai-powered-cybersecurity/project-perception-agentic-system |
| Rethinking security for the age of AI (blog) | https://blogs.microsoft.com/blog/2026/07/27/rethinking-security-for-the-age-of-ai/ |
| MDASH initial unveil (2026-05-12) | https://www.microsoft.com/en-us/security/blog/2026/05/12/defense-at-ai-speed-microsofts-new-multi-model-agentic-security-system-tops-leading-industry-benchmark/ |
| Beyond the Benchmark (2026-06-17) | https://www.microsoft.com/en-us/security/blog/2026/06/17/beyond-the-benchmark-advancing-security-at-ai-speed/ |
| CyberGym benchmark & leaderboard | https://www.cybergym.io/cybergym/ |
| ExploitGym | https://www.cybergym.io/exploitgym/ |

### 10.2 Secondary Sources (cross-validation)

| Outlet | Contribution |
|--------|-------------|
| The Hacker News | Model Card details, leaderboard non-listing confirmation, June 96.55% criteria issue |
| MarkTechPost | Standalone benchmark table, MDASH 5-stage structure, ACS team & retrospective validation numbers |
| The Register | Competitor exact numbers, Suleyman "~10x" quote |
| VentureBeat | Suleyman interview (harness=router, GPT-5.4 choice reasoning) |
| GeekWire | Independent tester non-provision, competitor model gating status |
| SiliconANGLE | SCU billing, human approval requirement |
| Forrester | Perception demo scope, MCP server, Defender-only status |
| Infosecurity Magazine | FORGE Lab & Team Atlanta staffing |
| Directions on Microsoft | Preview target customer scope |
| Constellation Research | Industry simultaneous announcement context (CodeMender, Open Secure AI Alliance) |

### 10.3 Usage Note

Most performance and cost figures in this document are based on **Microsoft's own announcements.** Independent verification is incomplete, and the CyberGym public leaderboard has not yet reflected the score. When citing for adoption decisions, please note the nature of the source.

After Project Perception's public preview (August 3, 2026), when real-usage data becomes available, the TCO and performance sections of this document will require revision.
