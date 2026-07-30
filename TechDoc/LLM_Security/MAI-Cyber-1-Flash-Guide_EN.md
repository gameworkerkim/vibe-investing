# MAI-Cyber-1-Flash Technical Guide

AI defends against vulnerabilities AI created — Microsoft's first cybersecurity-dedicated model and its competitive landscape

| Field | Details |
|------|------|
| Reference Date | July 30, 2026 |
| Target Model | MAI-Cyber-1-Flash (Microsoft AI) |
| Announcement Date | July 27, 2026 (Monday), San Francisco |
| Presenters | Mustafa Suleyman (CEO, Microsoft AI), Hayete Gallot (Microsoft Security) |
| Primary Sources | Microsoft AI official announcement, MAI-Cyber-1-Flash model card, MAI-Thinking-1 technical report |
| Confidence Level | B2 (vendor self-reported, partial cross-validation, independent verification incomplete) |
| Scope | Background, design concept, architecture, performance, competing projects (including Codex Open Security), TCO, adoption |

---

## 1. Background — Why a Cybersecurity-Dedicated Model Now

### 1.1 AI Writes the Code, and AI Writes the Vulnerabilities

The reason the character of software security changed in 2026 is simple. **Code production has outpaced human review capacity** — and generative models produce most of the excess.

| Metric | Figure | Source | Confidence |
|------|------|------|--------|
| Share of all code that is AI-generated or AI-assisted | **42%** (projected >50% by 2027) | Sonar developer survey 2026 | B2 |
| AI-generated code samples containing OWASP Top 10 vulnerabilities | **45%** (100+ LLMs tested) | Veracode | B1 |
| Generated samples failing to defend against XSS | **86%** | Veracode | B1 |
| Generated samples vulnerable to log injection | **88%** | Veracode | B1 |
| YoY increase in mean vulnerabilities per codebase | **+107%** | Black Duck OSSRA 2026 | B1 |
| Confirmed vulnerabilities across 534 samples from 6 major LLMs | **25%** | Independent study (OWASP Top 10) | C2 |
| Share of enterprise breaches traced to AI-generated code | **~1 in 5** | Industry aggregate reporting | C3 |

Sources and methodologies vary, but the direction converges: **defect production has structurally outrun human review throughput.** "Vibe coding" has increased the absolute volume of code merged without review, and the result shows up in CVE growth rates.

### 1.2 The Attacker's Discovery Cost Has Collapsed

The same model capability is available to the offensive side. In April 2026, Anthropic released Claude Mythos Preview through Project Glasswing, assessing that **the model had surpassed all but a small number of top human experts at finding and exploiting software vulnerabilities.** Roughly 50 partners used it to find **more than 10,000 high- or critical-severity vulnerabilities** in systemically important software. Anthropic expanded the program in June to about 150 organizations across 15+ countries (power, water, healthcare, communications, hardware).

Microsoft's official blog reaches the same diagnosis: attackers "can generate exploits faster, scale campaigns further and operate with unprecedented efficiency." In short, **as the cost of finding flaws collapses, the legacy security model of scanning intermittently and patching later is already obsolete.**

### 1.3 The Defender's Bottleneck Is Compute Cost, Not Model Availability

Defenders are not losing because equivalent models are unavailable to them. **Continuously scanning an entire enterprise repository estate with a frontier model makes token cost explode.** The moment coverage depends on a single frontier model, scan frequency and scope become budget line items — and that budget ceiling becomes the security gap.

Suleyman's market read lands precisely here: "People are maxing out tokens across their businesses. So there's an enormous counter-reaction to reduce cost anywhere they can." He added that the core barrier to AI adoption is chip access, and cost is ultimately a function of chips.

### 1.4 Therefore: AI Defends Against Vulnerabilities AI Created

Every major vendor arrived at the same conclusion in the first half of 2026. **Human-speed defense cannot absorb machine-speed attacks or machine-speed defect production.** In Hayete Gallot's phrasing, defenders must use AI to defend against AI at the same scale and speed as attackers.

The concept resolves into a four-stage loop:

```
   ① AI produces code               ② AI finds vulnerabilities
   (42%+ / 45% defect rate)  ─────▶  (Glasswing 10k+, Codex Security 11k+)
            ▲                              │
            │                              ▼
   ④ Validation and patches         ③ AI patches and proves it
      flow back into code   ◀─────  (MDASH Prove stage / green team agents)
      (the live RL loop)
```

MAI-Cyber-1-Flash is designed to run stages ② and ③ continuously **at a unit cost far below a frontier model.** That is precisely what this document covers.

### 1.5 The Full Announcement Package

| Component | Nature | Status |
|-----------|------|------|
| MAI-Cyber-1-Flash | Cybersecurity-dedicated LLM | Azure AI Foundry private preview (approved MDASH customers only) |
| MDASH | Multi-model agentic Discovery And Security Harness | First disclosed May 12, 2026; in operation |
| Project Perception | Agentic security system (red/blue/green teams) | Public preview inside Defender, August 3, 2026 |
| FORGE Lab | Frontier Offensive Research and Generative Exploration Lab | Newly formed, led by Taesoo Kim (former Team Atlanta lead) |

Suleyman's positioning is unambiguous: **"World-class performance at half the cost."** The substance of this announcement is cost-per-performance — routing — not raw performance.

---

## 2. Design Concept — What They Set Out to Build

### 2.1 Three Pillars: Model. Data. Harness.

| Pillar | Microsoft's Claim |
|----|----------------|
| **Model** | A compact, code-centric security model trained in-house from scratch on high-quality data. Not a shrunken general-purpose frontier model but a workhorse calibrated for security tasks |
| **Data** | The deepest advantage. **Over 100 trillion security signals daily** across identity, endpoint, cloud, and network; MSRC vulnerability handling history; operational insight from **1.6 million customers**; records of real exploits and remediations. "No one can manufacture this history artificially" |
| **Harness** | A 100+ agent system tuned by leading security practitioners. The orchestration around the model is itself the product |

### 2.2 Cybersecurity as a "Live Reinforcement Learning Loop"

This is the most persuasive part of Microsoft's differentiation argument: cybersecurity is not merely a data-rich domain but a **live RL loop.** Every day defenders investigate threats, triage alerts, remediate vulnerabilities, and learn from outcomes.

Microsoft claims to observe this loop end to end — what was exploitable, what was contained, what was blocked, and what actually worked. **If you can connect actions to outcomes, you have more than data.** This is the hardest part for a general-purpose model trained on a static corpus to replicate.

### 2.3 Defense-Only Design

From a CTI perspective, this is the most important design fact about the model. The model card reports standalone performance under a lightweight terminal harness:

| Benchmark | MAI-Cyber-1-Flash | What It Measures |
|----------|-------------------|-----------|
| CVEBench | 0.314 | CVE-related reasoning |
| CyberSecEval4 — Threat Intelligence | 0.553 | Threat intelligence interpretation |
| CyberSecEval4 — Malware Analysis | 0.330 | Malware analysis |
| CRSBench | 0.651 (POV=1200) | Cyber reasoning system |
| **ExploitGym — Kernel** | **0** | Exploit generation |
| **ExploitGym — Userspace** | **0** | Exploit generation |
| **ExploitGym — Browser** | **0** | Exploit generation |

ExploitGym measures the ability to convert a given vulnerability and crash input into a working code-execution exploit. Zero across all categories is not a defect but an **intended outcome.** Microsoft states the model was trained to perform defensive work such as patching bugs and was not trained on offensive work such as malware deployment.

**Practical implication**: a 5B-active model that drives a 95.95% discovery pipeline while being unable to produce exploits is a defender-only artifact that lowers offensive-capability leakage risk at the architecture level. The key point is that the dual-use risk — the biggest objection to cyber-dedicated models — was blocked at training time and published in a **measurable form.**

This choice is also exactly where the product diverges from its competitors. Google CodeMender takes the opposite path: it **autonomously builds PoC exploits and runs them in a customer-controlled sandbox** to eliminate false positives. It is a trade-off between proof capability and dual-use risk. Microsoft chose the latter and solved the Prove step at the harness layer instead.

### 2.4 "Not the Biggest Model — the Smartest Routing System"

Microsoft's thesis is a shift from a model-size race to a system-design race. Microsoft VP Taesoo Kim's phrasing summarizes this entire document:

> "The model is one input; the system around it is the product."

Microsoft argues that **compute cost, not model availability, constrains a defender's scan coverage.** The answer, therefore, is not a bigger model but a router that swaps models by difficulty.

### 2.5 Business Context: Reducing OpenAI Dependence

MAI-Cyber-1-Flash extends the **seven in-house model families** Microsoft announced at Build 2026 in June — part of a strategy to reduce dependence on external model providers, OpenAI included.

That said, the configuration producing the headline score still depends on GPT-5.4. This model **reduced rather than removed** MDASH's OpenAI dependence.

---

## 3. Architecture and Model Specifications

### 3.1 Official Specifications per the Model Card

| Specification | Details |
|------|----------|
| Architecture | Self-attention + **Sparse Mixture-of-Experts (MoE)** Transformer |
| Total parameters | **137 billion (137B)** |
| Active parameters | **5 billion (5B)** — activated per token |
| Context window | **256,000 tokens** |
| Modality | Text only (text-in / text-out) |
| Direct base model | **MAI-Code-1-Flash** (lightweight agentic coding model embedded in GitHub Copilot and VS Code) |
| Lineage | MAI-Base-1 → MAI-Thinking-1 (mid-training checkpoint) → MAI-Code-1-Flash → MAI-Cyber-1-Flash |
| Training data scale | **Undisclosed** |
| Deployment | MDASH-internal only. No standalone API |

### 3.2 Upstream Models in the Lineage (Reference)

| Model | Total Params | Active Params | Notes |
|------|--------------|--------------|------|
| MAI-Base-1 | ~1 trillion | 35 billion | Pretraining base. 30T tokens, no synthetic data, no third-party model distillation |
| **MAI-Thinking-1** | **~1 trillion (~1T)** | **35 billion (35B)** | Announced at Build 2026 (June). 8 of 512 experts active per token. 256k context |
| MAI-Code-1-Flash | Undisclosed | 5 billion (5B) | Lightweight agentic coding model |
| **MAI-Cyber-1-Flash** | **137 billion (137B)** | **5 billion (5B)** | Subject of this document |

MAI-Cyber-1-Flash sits in the reduced branch of the flagship reasoning line, engineered as an **ultra-light routing workhorse** with only 5B active parameters. This is the physical basis for the TCO argument later. Note that the 30T-token training scale belongs to MAI-Base-1's pretraining; MAI-Cyber-1-Flash's own training token count has not been disclosed.

### 3.3 MDASH Harness Structure

The harness, not the model, is the actual product.

**Five-stage pipeline**

| Stage | Role |
|------|------|
| Prepare | Prepare the target codebase and context |
| Scan | Search for vulnerability candidates |
| Validate | Verify candidates and remove false positives |
| Dedupe | Consolidate duplicate findings |
| Prove | Prove by executing an actual triggering input (ASan for C/C++ targets) |

**Agent division of labor**

- **Auditor agents**: flag findings
- **Debater agents**: argue exploitability. **Disagreement between agents is itself used as a signal**
- 100+ specialized agents total, mixing multiple frontier and distilled models

**Team and operational track record**

| Item | Details |
|------|------|
| Developing org | Microsoft **Autonomous Code Security (ACS)** team |
| Key personnel | Many from **Team Atlanta**, winner of the DARPA AI Cyber Challenge (AIxCC) |
| May 2026 results | **16 CVEs discovered** in the Windows networking and authentication stack (including 4 critical RCEs) |
| Retrospective validation | **96% reproduction** of 28 MSRC cases in clfs.sys over 5 years; **100%** of 7 cases in tcpip.sys |

### 3.4 The 90/10 Routing Architecture

The technical innovation is not the model itself but **difficulty-based routing.**

```
              ┌─────────────────────────────────────┐
  Security    │            MDASH harness             │
   task ─────▶│  (router + 100+ agents + 5 stages)   │
              └──────────┬────────────────┬─────────┘
                         │                │
                   up to 90%           ~10%
                         │                │
                         ▼                ▼
            MAI-Cyber-1-Flash        GPT-5.4
            (137B/5B, low cost)    (~10x larger)
```

Suleyman's explanation (July 27, 2026): "Within MDASH, MAI-Cyber-1-Flash handles up to 90% of queries, detecting and patching vulnerabilities and even verifying that the fix actually worked. The remaining 10% goes to a larger model, GPT-5.4." He noted GPT-5.4 is **roughly 10x larger** than MAI-Cyber-1-Flash.

In a VentureBeat interview he characterized the harness as a "router." The system has three parts — the harness, the small MAI-Cyber-1-Flash handling bulk queries, and GPT-5.4 as the general-purpose coding model for escalation.

The choice of GPT-5.4 over the newer GPT-5.6 for escalation is also about cost. Suleyman: "GPT-5.6 is expensive. GPT-5.4 is extremely good for the cost."

**Terminology caution**: 90% and 80% are different metrics. **90% is the share of work MAI-Cyber-1-Flash can handle** (a design target, "up to 90%"); **80% is the share of pre-existing models it replaced inside MDASH.** They must not be conflated.

### 3.5 Safety and Enterprise Controls

| Layer | Control |
|------|-----------|
| Model training | Security-first calibration; offensive tasks not trained |
| Evaluation | Microsoft AI Red Team assessment, automated and expert-led adversarial training, third-party independent evaluation (organization undisclosed) |
| Deployment | Role-based controls, tenant isolation, encryption, audit trails |
| Runtime | **Sandboxed execution with no internet access** |
| Benchmark environment | Network-isolated environment with no access to production, the public internet, or external services |

The model card warns that generated text and code may be inaccurate or incomplete and requires review before use in critical applications.

---

## 4. Performance

### 4.1 What CyberGym Measures — and What It Does Not

CyberGym is a public benchmark out of UC Berkeley that evaluates an AI system's reasoning ability to find real vulnerabilities in large codebases. Microsoft calls it the "gold standard."

| Property | Details |
|------|------|
| Tasks | **1,507** real vulnerability reproduction tasks |
| Source projects | **188 OSS-Fuzz projects** |
| Microsoft's evaluation configuration | **Level 1 (default setting)** |
| Level 1 definition | Provide vulnerable source code and a high-level vulnerability description, then check whether a working PoC is produced |
| **What it does not measure** | **Blind vulnerability discovery; correctness of generated patches** |

That last row is the crux. Level 1 tests "reproduction of a known vulnerability given its description." Neither the ability to find 0-days independently nor whether a patch is correct is captured in this score — meaning the two capabilities that matter most in practice are absent from the headline number.

### 4.2 Comparison as of the Announcement (July 27, 2026)

| Rank | System | CyberGym Level 1 | Provider |
|------|--------|------------------|--------|
| 1 | **MDASH + MAI-Cyber-1-Flash + GPT-5.4** | **95.95%** | Microsoft |
| 2 | GPT-5.5 Cyber | 85.6% | OpenAI |
| 3 | Mythos 5 | 83.8% | Anthropic |
| 4 | GPT-5.6 Sol | 83.6% | OpenAI |
| 5 | Gemini 3.5 Flash Cyber (inside CodeMender) | 83.2% | Google |

Microsoft framed this as "+12 points over Mythos," rounding 95.95% to 96%. The four competing systems cluster between 83.2% and 85.6%.

**Two caveats**

1. 95.95% is **a system score, not a model score.** That system includes a competitor's model (GPT-5.4) on its escalation path.
2. Every figure in the table is **Microsoft's own measurement on Microsoft's infrastructure** — not values submitted by each vendor to a leaderboard.

### 4.3 The MDASH Score Trend Is Not a Time Series

| Date | Configuration | Score | Notes |
|------|------|------|------|
| May 12, 2026 | MDASH, GA models only | **88.45%** | Public leaderboard #1 at the time, ~5pt over #2 (83.1%) |
| June 2026 | MDASH | 96.55% | **Counted all crashes**, including out-of-target vulnerabilities |
| July 27, 2026 | MDASH + MAI-Cyber-1-Flash + GPT-5.4 | **95.95%** | Judging criteria not stated |

June's 96.55% used loose judging criteria, and the July material does not state whether the same criteria applied. The model card asserts exactly one valid comparison: **"replacing 80% of the prior MDASH models moved 88.4% → 95.95%."**

### 4.4 Independent Verification Status

| Item | Status |
|-----------|------|
| CyberGym public leaderboard listing | **Not listed** (as verified July 28, 2026). The May 12 entry of 88.4% remains the latest. Microsoft's materials do not mention submission |
| Provided to independent evaluators pre-release | **Not provided** (NYT reporting) |
| Third-party evaluation | Microsoft claims one was conducted. **Organization undisclosed** |
| Reproducibility of cost savings | **Not possible.** Token usage, call volume, latency, task mix, and compute allocation are all undisclosed |

Calling a benchmark the "gold standard" while not appearing on its leaderboard is a gap worth weighing during evaluation.

### 4.5 The Gap Between Vendor Scores and Independent Measurement

This is a structural problem across the category. On July 21, 2026, Sakana AI released the orchestration model **Fugu-Cyber**, reporting **86.9%** on CyberGym and **72.1%** on CTI-REALM. Those figures exceed all four systems Microsoft used as its comparison set (83.2–85.6%), yet Fugu-Cyber does not appear in Microsoft's comparison chart.

At the same time, technology outlets noted that **CyberGym's own creators reported roughly 20% for top model combinations at ICLR 2026**, flagging the distance from vendor self-reported figures. When the evaluation setup differs — description provided or not, attempts allowed, judging criteria — the same benchmark name yields entirely different numbers.

**Conclusion**: in this category, vendor-published benchmark scores cannot be used for cross-vendor ranking. The comparison set and the measurement environment both belong to whoever is presenting.

### 4.6 Evidence Stronger Than Benchmarks

For MAI-Cyber-1-Flash, the more meaningful evidence is operational, not benchmark-based.

| Evidence | Details | Why It Is Stronger |
|------|------|--------------|
| 16 Windows CVEs (May 2026) | Including 4 critical RCEs | Real production codebase, real CVE assignments |
| clfs.sys retrospective | 96% reproduction of 28 MSRC cases over 5 years | Real incident history, not synthetic tasks |
| tcpip.sys retrospective | 100% of 7 cases | Same |

---

## 5. Project Perception — The Surface You Will Actually Touch

Practitioners will encounter MAI-Cyber-1-Flash through Perception, not through a model API.

### 5.1 Three-Color Agent Structure

| Team | Role |
|----|------|
| **Red team agents** | Explore compromise paths from the attacker's perspective. Reconnaissance, attack path assessment, vulnerability scanning |
| **Blue team agents** | Investigate signals, reason over context, identify and prioritize meaningful risk. Generate new detection rules |
| **Green team agents** | Execute remediation, write patches, harden environments. Can open GitHub PRs |

The color taxonomy is standard infosec terminology, not a Microsoft invention. The three teams form a closed loop in which each consumes the others' output — the productized form of the "live RL loop" claim in §2.2.

### 5.2 Operational Characteristics

| Item | Details |
|------|------|
| Delivery surface | **Inside Microsoft Defender** (Defender-only today) |
| Public preview | **August 3, 2026**, worldwide |
| Initial audience | Primarily business customers already testing MDASH |
| First scenario | Software vulnerability management within MDASH |
| Initial demo scope | Web application hardening |
| Interfaces | Defender workflows + **MCP server** (CLI-executable) + GitHub PRs |
| Human in the loop | **High-impact actions require human approval** |
| Shared context | Continuously updated layer of assets, identities, relationships, risk, and activity |
| Billing | Consumption-based, in SCUs |

Perception targets a broader scope than MDASH. Where MDASH focuses on vulnerability scanning and identification, Perception spans the full security lifecycle — attack path identification, prioritization, remediation implementation, and new detection generation. Microsoft has stated plans to extend MAI-Cyber-1-Flash to security workflows beyond software vulnerability work.

### 5.3 Privilege-Escalation Risk via Agents and MCP

Perception's MCP server warrants separate review before adoption. MCP is a protocol with numerous reported vulnerability cases across 2025–2026 involving prompt injection, excessive tool permissions, and server trust boundaries. **A security automation agent holding CLI execution rights through MCP is itself a potential privilege-escalation path.**

That this is not theoretical has already been demonstrated by a competing product. In March 2026, a vulnerability in OpenAI Codex was found and patched in which **maliciously named GitHub branches could inject commands during task setup and exfiltrate GitHub authentication tokens** — a scenario where the security agent itself becomes the supply-chain entry point.

Checklist for adoption:

- The MCP server's authentication/authorization model and token scopes
- The scope of green team agents' code modification rights and where the approval gate sits
- Which repositories and branches the GitHub PR creation right extends to
- Injection defenses for external input the agents process (threat intel feeds, issue comments, branch and commit messages)
- How to audit that sandbox isolation actually maintains its no-internet state

---

## 6. Competing Projects

### 6.1 Gated Commercial Cyber-Dedicated Models

| Model / System | Provider | CyberGym | Access |
|------|--------|----------|-----------|
| **MAI-Cyber-1-Flash (MDASH+GPT-5.4)** | Microsoft | **95.95%** | Approved MDASH customers, Azure AI Foundry private preview |
| Fugu-Cyber | Sakana AI | 86.9% | Orchestration model. Released July 21, 2026 |
| GPT-5.5 Cyber | OpenAI | 85.6% | Limited availability |
| Mythos 5 | Anthropic | 83.8% | **Glasswing** program, trusted partners only |
| GPT-5.6 Sol | OpenAI | 83.6% | **Daybreak** program (started May 2026), government-approved customers only |
| Gemini 3.5 Flash Cyber | Google | 83.2% | Inside **CodeMender**, invitation-based |

The defining feature of this category is that all of it is gated. Concerns about offensive-capability leakage have made restricted distribution the norm for cyber-dedicated models.

**Competing projects in detail**

| Project | Nature | Distinctive Design |
|----------|------|-------------|
| **Anthropic Project Glasswing** | Joint industry initiative | Mythos Preview released April 2026 → ~50 partners found 10,000+ high/critical issues → expanded in June to ~150 organizations in 15+ countries (power, water, healthcare, communications, hardware). Mythos 5 is the same underlying model as Fable 5 with safeguards lifted in some areas, explicitly positioned as having the strongest cyber capabilities in the world |
| **Google CodeMender** | Gemini Enterprise agent | Built on Gemini 3.5 Flash Cyber. **Autonomously generates PoC exploits and runs them in a customer-controlled sandbox** to remove false positives → writes a patch → verifies side effects with a model-as-judge → delivers a diff for developer approval. Supports C/C++, Go, Java, Python, Ruby, Rust, TypeScript. Nothing reaches a repo without approval |
| **OpenAI Daybreak** | Program for government and critical infrastructure | Started May 2026, provides GPT-5.6 Sol |
| **OpenAI Codex Security** | Developer-facing AppSec agent | Detailed in §6.2. A hybrid of **open-sourced CLI/SDK (Apache-2.0)** and a gated scanning engine |
| **Sakana AI Fugu-Cyber** | Orchestration model | Presents as a single model but is a multi-agent system dynamically routing a pool of specialized agents. **Same design philosophy as MDASH.** Pool configuration undisclosed |
| **NVIDIA Open Secure AI Alliance** | Industry standards initiative | Microsoft participating |

Note that the top two systems (MDASH and Fugu-Cyber) are **both orchestration systems.** The judgment that a single frontier model cannot cover the whole pipeline at a viable cost is now shared across the industry.

### 6.2 Codex Open Security — The Opposite Bet

Two days after the MAI-Cyber-1-Flash announcement, on **July 29, 2026**, OpenAI open-sourced the Codex Security CLI and TypeScript SDK under **Apache-2.0**. It attacks the same problem with the opposite distribution strategy, so it warrants separate treatment.

**Lineage and track record**

| Date | Event |
|------|------|
| March 2026 | Research preview begins under the internal codename **Aardvark** |
| March 2026 | A vulnerability in Codex itself — command injection via GitHub branch name leading to auth token exfiltration — found and patched |
| April 2026 | OpenAI reports **more than 3,000 critical vulnerabilities fixed** |
| Beta cumulative | **792 critical / 10,561 high** findings across **1.2 million+ commits** scanned. GnuPG, GnuTLS, GOGS, Thorium, libssh, PHP, Chromium and others |
| June 2026 | Codex reaches 5 million weekly users |
| **July 29, 2026** | **CLI + TypeScript SDK open-sourced (Apache-2.0)** |

**What is open and what is locked**

| Component | Status |
|-----------|------|
| CLI (`@openai/codex-security`) | **Open source, Apache-2.0.** Distributed via npm |
| TypeScript SDK | **Open source.** Programmatic integration supported |
| Scanning engine (model) | **Gated.** Limited beta for approved customers |
| Authentication | ChatGPT sign-in or API key (`OPENAI_API_KEY` / `CODEX_API_KEY`). API key preferred for CI |
| Model selection | Variants such as `gpt-5.6-terra` selectable; effort level configurable |
| Requirements | Node.js 22.13.0+ (22.x/24.x/26.x), Python 3.10+ |
| GitHub reception | ~1.5k stars at release → **5.2k stars / 325 forks** as of July 30, 2026 |

The Next Web's summary captures the structure precisely: **"open plumbing bolted to a gated engine."** The orchestration layer is opened for audit; the vulnerability-reasoning capability itself remains controlled.

**How it works**

Codex Security is designed to behave **like a security researcher** rather than a pattern-matching scanner. It reads code, runs tests, explores realistic attack paths, and proposes patches in a form teams can review in their normal workflow. The CLI supports repository scanning, comparing and tracking findings across runs, verifying fixes, CI/CD integration, and bulk scans across multiple repositories.

**Contrast with MAI-Cyber-1-Flash**

| Axis | MAI-Cyber-1-Flash | Codex Security |
|----|-------------------|----------------|
| Openness | Fully closed | **CLI/SDK open source (Apache-2.0)**, engine gated |
| Entry path | MDASH approval → Azure AI Foundry private preview | npm install + account auth (engine access still requires approval) |
| Primary user | Enterprise security organizations (SOC) | **Developers / AppSec engineers** |
| Integration points | Defender console, MCP, GitHub PRs | CLI, CI/CD, PR review, TypeScript SDK |
| Dual-use control | Blocked at training (ExploitGym 0/0/0) | Controlled by gating engine access |
| Auditability | Vendor-provided audit logs | **Full orchestration code auditable**; model is not |
| Cost structure | SCU consumption | API token billing |
| Competes with | Defender / SIEM budgets | **Snyk, Semgrep, Veracode, GitHub Advanced Security** |

**Strategic implication**: the two companies are attacking the same market at different layers. Microsoft targets the SOC's managed-service budget; OpenAI targets the AppSec budget inside the developer toolchain. Open-sourcing is a standard-capture move — once the CLI becomes the default in CI/CD pipelines, the market is secured even with the engine still gated. The two announcements landed two days apart, and the industry reads them, along with Anthropic Glasswing and Google CodeMender, as **a fight over the same budget.**

**For adoption review**: Codex Security is open source but **is not a self-hosting option.** Without engine access, the CLI alone cannot scan. Do not read the "Apache-2.0" label as on-premises capability.

### 6.3 Versus Traditional AppSec Tools and Open-Weight Alternatives

| Aspect | MAI-Cyber-1-Flash | Open-source / traditional alternatives (CodeQL, Semgrep, SecBERT-family, open-weight coding models) |
|------|-------------------|--------------------------------------|
| License | **Closed; not open-weight** | Open |
| Detection method | Contextual reasoning + execution proof | Primarily rules and pattern matching (some dataflow analysis) |
| Training data | Decades of real security incidents and remediations (not replicable) | Public data |
| Harness | 100+ agents, 5 stages, expert-tuned | Must be built yourself |
| Escalation | GPT-5.4 integration built in | Must be designed yourself |
| Product integration | Microsoft Defender, GitHub PRs, MCP server | Individual integrations |
| On-premises self-hosting | Not possible | Possible |
| Auditability | Vendor-provided audit logs | Full-stack auditable |
| Cost structure | SCU consumption (variable) | Infrastructure cost (fixed) |
| Dual-use risk | Offensive capability not trained (ExploitGym 0) | Varies by model, hard to control |

**Category check**: MAI-Cyber-1-Flash is not a competitor within the open-weight ecosystem but a product in the **enterprise managed security service** category. Comparing it to open-source scanners is a coverage-layer comparison, not a substitute comparison. In practice, the realistic combination is rule-based scanners as a first filter with the LLM pipeline positioned for deep analysis.

### 6.4 Simultaneous Industry Movement

| Date | Vendor | Event |
|------|--------|------|
| March 2026 | OpenAI | Codex Security research preview (codename Aardvark) |
| April 2026 | Anthropic | Project Glasswing launched, Mythos Preview released |
| May 2026 | OpenAI | Daybreak program launched |
| May 12, 2026 | Microsoft | MDASH first disclosed, #1 on CyberGym leaderboard at 88.45% |
| June 2026 | Anthropic | Mythos 5 / Fable 5 released, Glasswing expanded to ~150 organizations |
| June 2026 | Microsoft | Build 2026, seven in-house model families announced |
| Early July 2026 | Google Cloud | **CodeMender** launched |
| July 21, 2026 | Google / Sakana AI | Three Gemini Flash models (including Cyber) / Fugu-Cyber released |
| July 27, 2026 | Microsoft | **MAI-Cyber-1-Flash + Project Perception + FORGE Lab** |
| July 29, 2026 | OpenAI | **Codex Security CLI/SDK open-sourced (Apache-2.0)** |
| Same period | NVIDIA | **Open Secure AI Alliance** launched (Microsoft participating) |

In four months, every major frontier lab shipped a cybersecurity-dedicated product. Two beliefs are shared across all of them: **cybersecurity is a multi-model, multi-agent problem, and cost determines coverage.**

---

## 7. TCO (Total Cost of Ownership)

### 7.1 Cost Structure

| Item | Details |
|------|------|
| Savings claim | **~50% reduction** versus the prior best MDASH configuration (**GPT-5.4 + GPT-5.4 mini + GPT-5.3 Codex**) |
| Savings mechanism | Default routing to a low-cost dedicated model; escalate only excess difficulty |
| Perception billing | Consumption-based pay-as-you-go, measured in **Security Compute Units (SCU)** |
| SCU unit price | **Undisclosed.** SCU consumption rates differ by agent type |
| Model billing | No published price list (private preview) |

### 7.2 TCO Advantages

1. **Removes the token-cost ceiling**: absorbing inbound attack volume requires higher scan frequency, and with frontier models token cost becomes the practical ceiling. Making a 5B-active model the default raises that ceiling.

2. **Shortens the scan cycle**: shifts from a monthly patch cycle to continuous operation. Perception agents run persistently.

3. **Shared context layer**: Perception maintains a shared security context of assets, identities, relationships, risk, and activity, continuously updated. Agents do not re-collect raw signals from scratch, reducing both token cost and latency.

4. **Labor savings**: agents absorb triage, investigation, and remediation workflows previously handled manually by multiple security specialists.

### 7.3 TCO Risks

| Risk | Details |
|--------|------|
| Unverifiable savings rate | The token usage, call volume, latency, task mix, and compute allocation behind the 50% claim are all undisclosed. Cannot be normalized against other systems |
| Comparison baseline is their own stack | The 50% is "versus Microsoft's previous configuration." It does not imply absolute cost advantage over competitors |
| SCU budget variability | Consumption-based rather than a fixed license tier, so **scan scope becomes a budget line item.** Expanding scans directly increases cost |
| Escalation ratio drift | 90/10 is a design target ("up to 90%"). If the difficulty distribution of a real codebase is unfavorable, GPT-5.4 call share rises and savings erode |
| Benchmark-to-production gap | Benchmark vulnerability sets behave differently from live codebases with incomplete documentation, stale dependencies, and years of accumulated patch history |
| False-positive review labor | The burden of reviewing LLM pipeline findings is not included in SCU charges. High false-positive rates offset savings with labor cost |

**Practical recommendation**: during preview evaluation, measure **how the R/B/G loop performs against your own vulnerability backlog and threat profile** — and **whether the actual escalation ratio converges to 10%** — rather than the CyberGym score. The latter determines the entire TCO.

---

## 8. Adoption and Getting Started

### 8.1 Current Access Status (as of July 30, 2026)

| Target | Access Condition | Status |
|------|-----------|------|
| MAI-Cyber-1-Flash model | **Approved MDASH customers**, Azure AI Foundry private preview | Gated |
| Standalone API | **Does not exist** | Unavailable |
| General application integration | **Not possible** — MDASH-internal only | Unavailable |
| MDASH | Via Microsoft Security sales channel | Existing customers |
| Project Perception | Public preview inside Microsoft Defender | August 3, 2026 |

An Azure subscription or an M365/Defender license alone is not sufficient. The practical audience is **organizations already on the Microsoft Defender and MDASH track.**

### 8.2 Entry Path

**Step 1. Verify prerequisites**

- Whether Microsoft Defender is deployed (a precondition for Perception)
- Whether you participate in, or could join, the MDASH program
- Azure AI Foundry tenant and governance policy

**Step 2. Check the Project Perception preview (after August 3)**

Check preview availability in the Microsoft Security product pages and the Defender admin console. Access timing varies by organization size and existing contracts.

**Step 3. MDASH access runs through sales**

Using the model itself presupposes MDASH approval. There is no public self-service signup path today. Contact your Microsoft account representative or partner.

**Step 4. Design the pilot — define metrics up front**

| Metric | Why It Matters |
|-----------|-------------|
| Actual escalation ratio | If 90/10 does not hold, the 50% savings argument collapses |
| SCU consumption vs. findings count | Yields cost per finding |
| False-positive rate (post blue-team triage) | A metric the benchmark does not measure |
| Green-team patch accuracy | A metric CyberGym Level 1 does not measure |
| Coverage against your own backlog | Reveals the gap between synthetic benchmarks and live codebases |
| Approval gate latency | Whether human-in-the-loop becomes the real bottleneck |

**Step 5. Document governance**

- Agent permission matrix (RBAC mapping)
- Permitted and prohibited scope for automated remediation
- Audit log retention and review procedures
- Tenant isolation verification method
- Rollback procedure for incidents

### 8.3 Adoption Decision Criteria

| Condition | Recommendation |
|------|------|
| Already Defender-centric stack + large first-party codebase | High value in evaluating the preview |
| Multi-cloud / non-Microsoft security stack | Limited benefit at this stage (Defender-only). Consider CodeMender or Codex Security |
| Want to start with the developer toolchain / CI-CD | **Codex Security CLI** has the lowest barrier to entry (§6.2) |
| On-premises self-hosting requirement | Not applicable. The entire category fails this (even the open-source CLI calls a remote engine) |
| Regulatory requirement for model auditability | Verify in advance whether vendor-provided audit logs suffice |
| Small codebase | With limited scan scope, SCU-based billing offers limited advantage |

---

## 9. Overall Assessment

### 9.1 Claims by Confidence Level

| Confidence | Items |
|--------|------|
| **Confirmed (stated in model card / official docs)** | 137B/5B/256k MoE specs, MAI-Code-1-Flash fine-tuning, text-only, MDASH-only deployment, ExploitGym 0/0/0, standalone scores including CVEBench, 5-stage pipeline, Perception August 3 preview, SCU billing |
| **Vendor claims (partially cross-validated)** | CyberGym 95.95%, competitors at 83.2–85.6%, ~50% cost reduction, up to 90% task handling, 100T+ daily signals, 1.6M customers, third-party evaluation conducted |
| **Unverifiable / undisclosed** | Training token scale, SCU unit price, basis for the 50% savings, identity of the third-party evaluator, production false-positive rate, patch accuracy |
| **Contradicted or inconsistent** | Not listed on the CyberGym public leaderboard (as of 7/28), not provided to pre-release independent testers, large gap between vendor figures and the benchmark authors' own measurements |

### 9.2 What Holds Up

**The routing architecture is a substantive engineering answer.** Using a frontier model alone constrains scan frequency by cost, and that constraint becomes the security gap — an accurate diagnosis. Defaulting to a 5B-active model and escalating only excess difficulty is the right direction. That Sakana's Fugu-Cyber independently reached the same conclusion (orchestration first) corroborates the direction.

**Publishing the defense-only design in measurable form is creditable.** Zero across all ExploitGym categories is a verifiable claim that the biggest risk of cyber-dedicated models — dual use — was blocked at training time. It contrasts with competing products that adopted exploit generation as a feature.

**Operational results are stronger than the benchmark.** MDASH's retrospective validation (96% of 28 clfs.sys cases, 100% of 7 tcpip.sys cases) and the 16 real CVEs found in May carry more practical weight than synthetic benchmarks.

### 9.3 What Does Not

**95.95% is a system score, not a model score, and that system depends on a competitor's model (GPT-5.4).** The narrative of beating frontier competitors and the fact of running a frontier competitor's model internally sit inside the same announcement.

**CyberGym Level 1 measures "reproducing a known vulnerability given its description."** It measures neither blind discovery nor patch correctness — the two capabilities that matter most in practice are absent from the headline number.

**The leaderboard absence and the lack of pre-release independent testers are a problem taken together.** If the benchmark is the "gold standard," submitting to its leaderboard would be the natural step.

**The 50% savings is not reproducible, and the baseline is their own prior configuration.** It cannot support a claim of absolute cost advantage over competing systems.

### 9.4 Conclusion

This is best read as **a systems architecture announcement, not a model announcement.** Taesoo Kim's "the model is one input; the system around it is the product" is the honest summary of the whole event.

Zoomed out, the entire four-month release rush of 2026 converges on one proposition: **defects are produced at the speed AI writes code, so defense must be automated at the same speed, and the constraint on that automation is unit cost, not model capability.** Microsoft answered with a dedicated small model plus routing; OpenAI with open-sourcing the developer toolchain; Google with autonomous exploit verification; Anthropic with controlled distribution of top-tier capability. The approaches differ; the problem statement does not.

**Two things are worth basing an adoption decision on.** First, the operational record that Microsoft found real CVEs in its own Windows codebase. Second, the structural logic that routing lowers the unit cost of scanning. Both are verifiable without benchmarks and can be confirmed directly in your own environment during a preview pilot. Vendor-published benchmark scores are hard to use as decision criteria in this category.

---

## 10. References

### 10.1 Primary Sources — Microsoft

| Resource | Link |
|------|------|
| MAI-Cyber-1-Flash official announcement | https://microsoft.ai/news/introducing-mai-cyber-1-flash-inside-mdash/ |
| MAI-Cyber-1-Flash model page | https://microsoft.ai/models/mai-cyber-1-flash/ |
| MAI-Cyber-1-Flash model card (PDF) | https://microsoft.ai/pdf/MAI-Cyber-1-Flash-Model-Card.pdf |
| MAI-Code-1-Flash model card (PDF) | https://microsoft.ai/pdf/MAI-Code-1-Flash-Model-Card.PDF |
| MAI-Thinking-1 technical report (PDF) | https://microsoft.ai/pdf/mai-thinking-1.pdf |
| Project Perception product page | https://www.microsoft.com/en-us/security/business/ai-powered-cybersecurity/project-perception-agentic-system |
| Rethinking security for the age of AI (official blog) | https://blogs.microsoft.com/blog/2026/07/27/rethinking-security-for-the-age-of-ai/ |
| MDASH first disclosure (2026-05-12) | https://www.microsoft.com/en-us/security/blog/2026/05/12/defense-at-ai-speed-microsofts-new-multi-model-agentic-security-system-tops-leading-industry-benchmark/ |
| Beyond the Benchmark (2026-06-17) | https://www.microsoft.com/en-us/security/blog/2026/06/17/beyond-the-benchmark-advancing-security-at-ai-speed/ |

### 10.2 Primary Sources — Competing Projects

| Resource | Link |
|------|------|
| OpenAI Codex Security (research preview) | https://openai.com/index/codex-security-now-in-research-preview/ |
| openai/codex-security (GitHub, Apache-2.0) | https://github.com/openai/codex-security |
| Codex Security help center | https://help.openai.com/en/articles/20001107-codex-security |
| Anthropic Project Glasswing | https://www.anthropic.com/glasswing |
| Expanding Project Glasswing | https://www.anthropic.com/news/expanding-project-glasswing |
| Claude Fable 5 / Mythos 5 | https://www.anthropic.com/news/claude-fable-5-mythos-5 |
| Google CodeMender | https://cloud.google.com/security/codemender |
| CodeMender preview blog | https://cloud.google.com/blog/products/identity-security/find-and-fix-software-vulnerabilities-with-codemender |
| CyberGym benchmark and leaderboard | https://www.cybergym.io/cybergym/ |
| ExploitGym | https://www.cybergym.io/exploitgym/ |

### 10.3 Secondary Sources (Cross-Validation)

| Outlet | Contribution |
|------|------|
| The Hacker News | Model card details, leaderboard absence, issues with June's 96.55% judging criteria |
| MarkTechPost | Standalone benchmark table, MDASH 5-stage structure, ACS team and retrospective figures, Fugu-Cyber details |
| The Register | Exact competitor figures, original Suleyman "~10x" quote |
| VentureBeat | Suleyman interview (harness as router, rationale for GPT-5.4) |
| GeekWire | No pre-release independent testers, gating status of competing models |
| SiliconANGLE | SCU billing, human approval requirements |
| Forrester | Perception demo scope, MCP server, Defender-only status |
| Infosecurity Magazine | FORGE Lab and Team Atlanta hires |
| Directions on Microsoft | Preview customer scope |
| Constellation Research | Simultaneous industry announcements (CodeMender, Open Secure AI Alliance) |
| The Next Web | Analysis of Codex Security's "open plumbing, gated engine" structure |
| Cyber Security News | Codex Security CLI features and requirements |
| Help Net Security | Glasswing 10k findings, CodeMender mechanics |
| Cybersecurity Dive / TechCrunch | Glasswing expansion to 150 organizations across 15 countries |
| SecurityWeek | Codex GitHub token exfiltration vulnerability |
| Veracode / Black Duck OSSRA 2026 / Sonar | AI-generated code vulnerability statistics |
| Tech Times | Fugu-Cyber's undisclosed benchmark methodology |

### 10.4 Usage Note

Most performance and cost figures in this document are based on **vendor self-reporting.** Independent verification of MAI-Cyber-1-Flash is incomplete, and the CyberGym public leaderboard does not yet reflect the score. Competitor figures are likewise each vendor's own measurements and are not like-for-like comparisons. When citing for adoption decisions, state the nature of the source.

After Project Perception's public preview (August 3, 2026), when real-usage data becomes available, the performance and TCO sections will require revision.
