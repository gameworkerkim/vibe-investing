---
title: "Claude Security Plugin — Technical Analysis & Getting Started Guide"
subtitle: "Distinguish security-guidance vs claude-security, then map the multi-agent verification pipeline and adoption path"
description: "Technical guide to Claude Code's claude-security (Beta) and security-guidance (GA): architecture, 3-panel adversarial verification, BYO inference, adoption steps, and position in a defense-in-depth stack."
abstract: |
  Separates Anthropic's two Claude Code security plugins (security-guidance GA vs claude-security Beta v0.10.0),
  covering reasoning-based scanning, adversarial verification (2/3 quorum), local BYO inference, and human-in-the-loop patches.
  Positions the tool as a SAST complement in a six-tier stack, with plan/CLI requirements and an adoption checklist. Dated 2026-07-26.
summary_for_ai: |
  Tech guide (EN) for Anthropic Claude Security Plugin: security-guidance (in-session GA) vs claude-security (on-demand multi-agent deep scan, Beta v0.10.0, paid plan, CLI ≥2.1.154).
  Core ideas: reasoning-over-pattern, adversarial 3-panel verification, locality/BYO inference, human-in-the-loop patches; complements SAST. Docs accessed 2026-07-23; published 2026-07-26.
date: 2026-07-26
author: "Dennis Kim"
lang: en
tags:
  - Claude
  - LLM Security
  - AppSec
  - DevSecOps
  - SAST
keywords:
  - Claude Security Plugin
  - claude-security
  - security-guidance
  - multi-agent vulnerability scanner
  - adversarial verification
  - BYO inference
group: security
featured: true
featured_rank: 1
schema_type: TechArticle
draft: false
robots: index,follow
---

# Claude Security Plugin — Technical Analysis & Getting Started Guide

Traditional security solutions and GitHub open-source security tools face obsolescence unless they deliver new value. The Claude Security Plugin extends security into an in-house technology layer.

| Item | Content |
|:---|:---|
| Document Version | 1.0 |
| Date | 2026-07-26 |
| Target Products | `claude-security` (Beta, plugin v0.10.0), `security-guidance` (GA) |
| Reference | code.claude.com/docs official documentation (accessed 2026-07-23) |
| Target Audience | AppSec / DevSecOps engineers, security architects, development leads |
| Summary | Architecture, verification pipeline, adoption procedure, and competitive positioning of a multi-agent vulnerability scanner that operates inside Claude Code sessions |

---

## 0. Two Plugins You Must Distinguish First

Under the name "Claude Security Plugin," two fundamentally different products exist. Confusion is common, so let's separate them first.

| Distinction | `security-guidance` | `claude-security` |
|:---|:---|:---|
| One-liner | Claude reviews its own changes **while writing code** | Multi-agent **on-demand deep-scan** of the entire repository |
| Trigger | Automatic (no invocation command) | Manual `/claude-security` |
| Status | GA | Beta (released 2026-07-22) |
| Plan | All plans (including free) | **Paid plan required** |
| Min CLI | v2.1.144+ | v2.1.154+ (dynamic workflows) |
| Output | Interactive in-session findings → immediate fix | Timestamped report directory + `.patch` files |
| Nature | Preventative guardrail (shift-left) | Auditing scanner (complements SAST, does not replace it) |
| Cost profile | Low-to-medium per layer | Heavy token consumption per scan |

In this document, "Claude Security Plugin" refers to the latter (`claude-security`). Chapter 5 covers `security-guidance` separately.

---

## 1. Concept

### 1.1 Design Premise

Traditional SAST relies on rule-based pattern matching. It catches known patterns but (a) has high false-positive rates and (b) misses context-dependent vulnerabilities such as cross-file logic flaws and authentication bypasses. Claude Security targets this gap by **"reproducing a skilled security researcher's reasoning process through an agent team."** It maps architecture, builds threat models, traces data flows from entry points to sinks, refutes its own discoveries, then reports.

The core concept compresses into four principles:

| Concept | Implementation | Meaning |
|:---|:---|:---|
| **Reasoning over pattern** | LLM agents read and reason about code. Regex/rulesets are not the primary engine | Detects novel and logic-based vulnerabilities, though non-deterministic |
| **Adversarial verification** | Every candidate finding passes a 3-member verification panel with 2/3 quorum | False-positive suppression built into the architecture |
| **Locality (BYO inference)** | Scans run locally in the user's session with user permissions | Code never leaves the environment. Supports GitLab, Bitbucket, air-gapped networks |
| **Human-in-the-loop** | Patches are never auto-applied | Raises approval material quality without removing the approval checkpoint |

### 1.2 Position in the Defense-in-Depth Stack

Anthropic positions this plugin as one layer in a 6-tier stack, not a standalone solution.

| Tier | Tool | Coverage |
|:---|:---|:---|
| In-session | `security-guidance` plugin | Common vulnerabilities in Claude-written code, fixed in the same session |
| On-demand single pass | `/security-review` | One-time security review of the current branch |
| **On-demand deep scan** | **`claude-security` plugin** | **Repository/diff multi-agent scan with independently verified findings and patches** |
| At PR time | Code Review (Team/Enterprise) | Full codebase context consistency & security multi-agent review |
| Managed | Claude Security product (Enterprise) | Hosted scanning with continuous monitoring of connected repositories |
| CI | Existing SAST + dependency scanners | Language-specific rules, supply chain checks, policy enforcement |

> Official stance: **Does not replace existing source-code security tools.** It complements static analysis, dependency scanning, and code review.

---

## 2. Feature Details

### 2.1 Commands and 3 Operations

The plugin adds a single command `/claude-security` with a menu offering three operations.

| Operation | Target | Notes |
|:---|:---|:---|
| **Scan codebase** | Entire repo or scoped subset | Works even on non-version-controlled directories. Reads the working tree (uncommitted changes) |
| **Scan changes** | Branch diff, PR diff, single commit | Git required. **Committed changes only.** Research agents read the entire repo for context, not just the diff |
| **Suggest patches** | Selected findings from the report | Generates `.patch` files. No auto-apply |

You can bypass the menu with direct arguments or natural language:

```text
/claude-security scan my branch
/claude-security          → "scan commit abc1234"
```

Permission prompts appear at each stage and will block the scan. **Use auto mode.**

### 2.2 Scan Pipeline: 6 Phases

The scan is implemented as a JavaScript orchestration script (dynamic workflow) that fans out work to sub-agents.

| # | Phase | Description |
|:---|:---|:---|
| 1 | **Inventory** | Partition the repository into components. Every top-level directory must be scanned or **excluded with a stated reason** |
| 2 | **Threat model** | One modeler per component. Produces entry points, sinks, trust boundaries, and files requiring expert review |
| 3 | **Research** | One researcher per (component × category) cell |
| 4 | **Sweep** | Gap-fill areas not covered by the matrix |
| 5 | **Panel** | 3-lens adversarial verification, 1 voter per lens |
| 6 | **Adversarial** | Max effort only. Re-examine borderline decisions, then red-team all surviving findings |

Research categories are fixed at 4:

| Category | Scope |
|:---|:---|
| `injection-and-input` | Injection, input validation |
| `auth-and-access` | Authentication, authorization, access control (IDOR, privilege escalation) |
| `memory-and-unsafe` | Memory corruption, unsafe constructs |
| `crypto-and-secrets` | Cryptographic misuse, secret exposure |

Components written entirely in memory-safe languages skip `memory-and-unsafe`, operating with 3 lenses. Pure Python/TypeScript components avoid wasted tokens on irrelevant lenses.

### 2.3 Effort Tiers

| Tier | Max Components | Researchers per Cell | Gap-fill Sweep | Adversarial Phase |
|:---|:---|:---|:---|:---|
| low | 12 | 1 | 0 | Not run |
| medium | 12 | 1 | 1 | Not run |
| high | 24 | 2 | 2 | Not run |
| max | 24 | 2 | 2 | Run |

Small scopes or small diffs may collapse to a single-researcher configuration, but **verification criteria remain unchanged.**

### 2.4 Model Layers

| Role | Model | Tool Permissions |
|:---|:---|:---|
| Orchestrator | Opus | — |
| Repository cartographer, read-only code explorer | Sonnet | Read-only |
| Researcher, verifier | Inherits session model | Read-only |

Scan agents are limited to read-only tools — the architectural guarantee that scanning itself does not modify code.

### 2.5 Verification Panel — The Core of This Product

A finding reaches the report not because "the researcher found it" but because **it passed the panel.**

| Element | Rule |
|:---|:---|
| Voters | 3, one per lens: `REACHABILITY` / `IMPACT` / `DEFENSES` |
| Judgment format | `TRUE_POSITIVE` or `FALSE_POSITIVE` + decisive `file:line` evidence (1–2 lines) |
| Retention quorum | 2 out of 3 |
| Insufficient votes | Fewer than 3 replies → candidate cannot be retained |
| Confidence cap | Unanimous 3/3 → `high` allowed / 2/3 → capped at `medium` |
| Aggregation engine | **Calculated by the report renderer's Python code.** Not a model-claimed value |
| Verification stamp | `verification.status = verified` only when vote records prove panel execution for all findings; otherwise `unverified` with stated reason |

The critical practical point: aggregation is performed by code, not by the model, and the result is stamped into per-commit revision files. **The report's claimed rigor is verifiable by arithmetic, not by trust.** From a CTI/audit perspective, this is equivalent to auto-generating an Admiralty Code-like reliability framework.

### 2.6 Outputs

Every scan creates exactly one `CLAUDE-SECURITY-<timestamp>/` directory in the repository.

| File | Content |
|:---|:---|
| `CLAUDE-SECURITY-RESULTS.md` | Human-readable report. Finding IDs (`F1`, etc.), severity (HIGH/MEDIUM/LOW), confidence, CWE ID, exact sink line, impact, exploit scenario, prerequisites, recommendation |
| `CLAUDE-SECURITY-RESULTS.jsonl` | Machine-readable format of the same findings, one JSON object per line |
| `CLAUDE-SECURITY-REVISION-<commit>.json` | Revision stamp: scanned commit, effort, severity counts, verification level. Uncommitted changes → `-dirty` suffix; no VCS → `UNVERSIONED` |

This directory includes its own `.gitignore`. Even accidental `git add` won't mix reports into commits. Conversely, to **preserve an audit trail in history, delete that single `.gitignore` and commit as normal.**

### 2.7 Patch Generation — 3 Claims Requirement

| Step | Action |
|:---|:---|
| 1 | Patches are written in a **scratch clone** of the repository. Working tree and index are untouched |
| 2 | An **independent** verification agent (different from the patching agent) reviews the staged diff |
| 3 | If a project test suite exists, it runs against the changed code |
| 4 | Only when all 3 claims are confidently met is the `.patch` file written |
| 5 | `patches/F<n>.patch` + change description notes are placed |

**3 Claims:**

1. The change resolves that **single** finding
2. It introduces no new vulnerabilities
3. All other behavior is unchanged — *a change in the set of inputs the code accepts counts as a behavioral change*

Changes that weaken security while claiming to fix it (loosening auth checks, disabling tests, etc.) are **automatically rejected.** If the 3 claims cannot be guaranteed, a reason note replaces the patch. When the target code lacks tests, the note states "verified by code review only — no test execution."

Application is always the user's decision:

```bash
git apply CLAUDE-SECURITY-<timestamp>/patches/F1.patch
```

**One PR per patch** is the official recommendation to ensure individual reviewability and testability.

Additionally, if the report is stale (code has changed since discovery), that finding is skipped and a re-scan is suggested. Patches are never generated from stale reports.

---

## 3. Strengths

| # | Strength | Rationale |
|:---|:---|:---|
| 1 | **Context-dependent vulnerability detection** | Cross-file data flow tracing, multi-component combination patterns, auth bypasses, and compound logic flaws — classes that pattern matching misses |
| 2 | **Verifiable false-positive suppression** | 3-lens panel + 2/3 quorum + confidence cap. FP suppression is not marketing language — it's pipeline structure |
| 3 | **Code-based proof of report integrity** | Vote aggregation computed in Python by the renderer and stamped into revision files. Audit artifact reliability |
| 4 | **Code never leaves the environment** | In-session local execution. Reaches code that managed SaaS cannot: GitLab, Bitbucket, air-gapped private networks |
| 5 | **No additional vendor or contract** | Runs on existing Claude access and token budget. PoC cost is effectively zero |
| 6 | **Machine-readable output** | JSONL output enables ticket/SIEM/dashboard pipeline integration |
| 7 | **Patch safety gate** | Scratch clone + independent verification + 3 claims + no auto-apply. Security-weakening "fixes" auto-rejected |
| 8 | **Scopable** | Effort tiers and component scoping enable zone-by-zone scanning of large monorepos |
| 9 | **No workflow context switch** | Scan → analyze → patch → PR all within the terminal session. No separate console required |

---

## 4. Weaknesses & Risks

| # | Weakness | Detail | Mitigation |
|:---|:---|:---|:---|
| 1 | **Non-determinism** | Two scans of the same code may yield different findings | Scheduled scans + revision stamps bind reports to code/config. Do not use as the sole release gate |
| 2 | **Lack of reproducibility → compliance unsuitable** | Cannot directly satisfy audit frameworks requiring "scan passed" proof | Maintain deterministic SAST in parallel. Treat this tool as supplementary evidence |
| 3 | **No isolation** | Scans run with user permissions; committed `.claude/` settings, hooks, and `CLAUDE.md` apply. Treats repo contents as data but **is not a defense against adversarial repos** | Scan untrusted code in `sandbox-runtime` or VM/container |
| 4 | **Token cost** | Deep scans consume substantial tokens, deducted from plan limits | Zone-by-zone scanning, lower effort tier, prioritize change scans |
| 5 | **Session lock** | Claude Code must remain open until scan completes | Separate session/machine, consider CI execution |
| 6 | **Uncommitted change limitation** | Change scans see only committed changes | Pre-commit or stash; otherwise use full scan |
| 7 | **Coverage opacity** | The report's coverage section must be reviewed. A human must read what was excluded and why | Institutionalize exclusion reason review |
| 8 | **Dependency/supply chain not covered** | No SCA, license, container, IaC, or DAST coverage | Maintain existing SCA/secret scanners |
| 9 | **Paid plan dependency** | Paid plan + v2.1.154+ + dynamic workflows required. Pro must manually enable in `/config` | Pre-standardize environment |
| 10 | **Beta** | Feature and output schema may change. Risk of breakage in automated pipelines | Version-guard JSONL parser |
| 11 | **Auto-downgrade with Fable 5** | Cybersecurity safety classifier may block some model activity, auto-downgrading to Opus (normal behavior — scan still completes) | Recognize as expected behavior |

---

## 5. Companion Product: `security-guidance` Plugin

This should actually be adopted before deep scanning. **Free on all plans**, it is the preventative layer where "Claude catches vulnerabilities Claude created, in the same session."

### 5.1 3-Tier Review

| Tier | Timing | Method | Cost | Example Detections |
|:---|:---|:---|:---|:---|
| Per-edit | Immediately after Edit/Write/NotebookEdit | Regex/substring deterministic matching, **no model calls** | 0 | `eval(`, `new Function`, `os.system`, `child_process.exec`, `pickle`, `dangerouslySetInnerHTML`, `.innerHTML =`, `document.write`, `.github/workflows/` modifications |
| End-of-turn | At turn completion | Working tree git diff from the turn is passed to a separate Claude reviewer, runs in background | ~1 call per turn | Auth bypass, IDOR, injection, SSRF, weak cryptography |
| Commit/Push | When Claude executes `git commit`/`git push` via Bash | Agentic deep review. Reads callers, sanitizers, and related files to determine actual exploitability | Multiple turns per commit | Eliminates false positives on patterns that look dangerous but are contextually safe |

Key limits and constraints:

- End-of-turn: max 30 changed files per turn, yields to user after 3 consecutive rounds
- Commit review: rolling 20-per-hour cap
- **Commits made in the user's own shell (or via `!` escape) are NOT reviewed**
- No tier blocks writes or commits (non-blocking, best-effort)
- The reviewer is a separate invocation with fresh context and security-specific prompts — it does not grade its own code

### 5.2 Extension Points

| File | Purpose | Limit |
|:---|:---|:---|
| `.claude/claude-security-guidance.md` | Inject organizational threat models/checklists as natural language into model-based reviews | 8KB total across all scopes |
| `.claude/security-patterns.yaml` (`.yml`/`.json`) | Add deterministic per-edit rules | Max 50 rules, `reminder` 1KB |

Lookup path: `~/.claude/` (user global) → `.claude/` (repo checked-in) → `.claude/*.local.md` (gitignored, personal). All existing files are concatenated. Deploying user-scope files via device management enables organization-wide rules.

Example pattern file:

```yaml
patterns:
  - rule_name: internal_api_key
    substrings: ["sk_live_", "AKIA"]
    reminder: "Hardcoded API key prefix detected. Load from secrets manager."
  - rule_name: tenant_unfiltered_query
    regex: "\\.objects\\.all\\(\\)"
    paths: ["**/src/tenants/**"]
    reminder: "Multi-tenant code must filter by org_id."
```

| Field | Description |
|:---|:---|
| `rule_name` | Identifier shown in the warning |
| `reminder` | Warning text injected into Claude's context (1KB limit) |
| `regex` | Python regex matched against edit content |
| `substrings` | Literal substrings (alternative to `regex`) |
| `paths` / `exclude_paths` | Glob. Matches against full paths; prefix project-relative patterns with `**/` |

Note: Guidance files are **additive.** You cannot suppress default checks with "ignore this vulnerability class" rules. For hard enforcement, combine with hooks or CI checks that block edits. The YAML format requires importable PyYAML — the plugin does not install it. If unavailable, use `.json`.

### 5.3 Disable Switches

| Environment Variable | Effect |
|:---|:---|
| `ENABLE_PATTERN_RULES=0` | Disable per-edit pattern checks |
| `ENABLE_STOP_REVIEW=0` | Disable end-of-turn diff reviews |
| `ENABLE_COMMIT_REVIEW=0` | Disable commit/push reviews |
| `ENABLE_CODE_SECURITY_REVIEW=0` | Disable all model-based reviews |
| `SECURITY_GUIDANCE_DISABLE=1` | Disable entire plugin without uninstalling |
| `SECURITY_REVIEW_MODEL` | Specify model for end-of-turn reviews (default Opus 4.7) |
| `SG_AGENTIC_MODEL` | Specify model for commit reviews |

### 5.4 Implementation Architecture

The plugin is implemented entirely on **hooks.** It can serve as a reference implementation for your own hooks.

| Hook Event | Purpose |
|:---|:---|
| `SessionStart` | Bootstrap plugin Python environment |
| `UserPromptSubmit` | Capture working tree baseline for end-of-turn diffing |
| `PostToolUse` (Edit/Write/NotebookEdit) | Per-edit pattern matching |
| `Stop` | End-of-turn diff review (background) |
| `PostToolUse` (Bash, filtered to `git commit`/`git push`) | Commit/push review (background) |

Based on Anthropic's own rollout and benchmarks, PRs raised with this plugin saw a **30–40% reduction in security-related comments.** It is positioned as a "lightweight first pass," not a replacement for full code review.

---

## 6. Competitive Comparison

### 6.1 Direct Competitors: AI-Native Agentic Security Reviewers

| Product | Vendor | Status (2026-07) | Execution | Verification | Patching | Key Differentiator |
|:---|:---|:---|:---|:---|:---|:---|
| **Claude Security Plugin** | Anthropic | Beta | Local session (BYO inference) | 3-lens panel 2/3 quorum, code-aggregated | `.patch`, manual apply | Code-based proof of report integrity. Supports private networks, non-GitHub |
| **Codex Security** (fka Aardvark) | OpenAI | Research preview (transitioned 2026-03) | Cloud (Codex Web) | Sandbox exploit verification using real triggers | PR proposals via Codex | **Sandbox exploit verification** is the key differentiator. Commit continuous monitoring. Claims 92% detection on known+synthetic vulns in golden repos |
| **Claude Security (Managed)** | Anthropic | Enterprise | Hosted | Same adversarial verification family | Recommended patches | Continuous monitoring of connected repos, webhooks (Slack/Jira), CSV/Markdown export, scheduled scans, dismissal history inheritance |
| **ZeroPath** | ZeroPath | Commercial | SaaS | AI-native detection | Auto-fix proposals | Strong on auth logic, IDOR, access control flaws. Natural-language rules. Relatively narrower language coverage |
| **Corgea** | Corgea | Commercial | SaaS | AI triage of upstream scanner results | High-confidence patch generation | Not an independent scanner. **Fix layer** for Semgrep/CodeQL/Snyk/Checkmarx results. Detection quality depends on upstream tool |
| **CodeAnt AI / Arnica** | Respective vendors | Commercial | SaaS | LLM first-pass detection | Auto-fix | AI-native tier. Platform-integration oriented |

### 6.2 Adjacent Competitors: Traditional SAST/AppSec Platforms

| Product | Detection Engine | AI Layer | Strengths | vs Claude Security |
|:---|:---|:---|:---|:---|
| **Semgrep** | Rule-based (YAML) | Assistant (triage, fix assist) | 40+ languages, custom rule flexibility, free OSS engine, low FP rate | Deterministic and reproducible. But inherently a "detection engine" — weak on one-click fixes |
| **Snyk Code** | Static analysis + DeepCode AI | Agent Fix | SAST+SCA+Container+IaC integration, broadest IDE/registry ecosystem, free tier | Overwhelming platform breadth. Weaker on logic flaw reasoning |
| **GitHub Advanced Security (CodeQL)** | CodeQL dataflow queries | Copilot Autofix | GitHub Enterprise native, shortest PR loop, predictable per-active-committer billing | GitHub-dependent. Claude plugin covers GitLab/Bitbucket/air-gapped networks |
| **Checkmarx One** | Rule-based (CxQL) | AI triage | Enterprise portfolio governance, compliance response | Steep learning curve. FedRAMP High-Ready |
| **Veracode** | Binary + static | AI fix | Legacy language & binary analysis, FedRAMP Moderate ATO | Irreplaceable for regulated/defense sectors |
| **SonarQube CE** | Rule-based | Limited | Self-hosted free, integrated code quality | Baseline for budget-constrained teams |
| **Aikido Security** | Multi-engine unified | FP filtering | SAST+SCA+DAST+IaC+Secrets, 15-min setup, flat monthly pricing | SMB one-stop. Breadth over depth |
| **DryRun Security** | Context analysis | PR-native enforcement | Enforces code policies at PR/MR time | Gate-oriented rather than "backlog report" |

### 6.3 Market Context & Positioning

| Tier | Definition | Examples |
|:---|:---|:---|
| Tier 1 | Pure rule-based | SonarQube CE, Semgrep OSS |
| Tier 2 | AI-assisted SAST — rules detect, AI triages/fixes | Snyk Code, Semgrep Pro, Checkmarx One |
| Tier 3 | **AI-native SAST** — LLM is the primary detection engine | **Claude Security**, Codex Security, ZeroPath, CodeAnt AI |

Context numbers: AI-generated code appears in 93% of enterprise development workflows, ~45% introduces known defects, and application vulnerability exploitation attacks increased 44% in 2026 (Veracode). Tier 3's reason for existence: "Rule scanners cannot keep pace with the volume of AI-written code or novel vulnerability patterns."

**Practical conclusion:** The Claude Security Plugin is a **complement, not a replacement** for Snyk, Semgrep, or GHAS. Deterministic tools handle reproducibility, compliance, and supply chain; this plugin handles context-dependent logic flaws that those tools structurally cannot catch. The key adoption question is not "what to remove" but **"does the marginal detection rate justify the token cost when added to the existing stack?"** — and since no additional vendor contract is needed, the cost of that validation itself is very low.

---

## 7. Getting Started

### 7.1 Prerequisites

| Item | `claude-security` | Check Command |
|:---|:---|:---|
| Claude Code CLI | v2.1.154+ | `claude --version` |
| Plan | Paid plan required | — |
| Dynamic workflows | Must be enabled. Pro: enable in `/config` → Dynamic workflows | `/config` |
| Python | 3.9.6+, exposed as `python3` on `PATH`. Uses stdlib only — no additional installs | `python3 --version` |
| OS | Linux, macOS, Windows | — |
| Git | Required for change scans and patch generation (other VCS not supported). Full scans work without VCS | `git --version` |

If also adopting `security-guidance`:

| Item | Requirement |
|:---|:---|
| CLI | v2.1.144+ |
| Python | 3.7+. **Agentic commit review requires 3.10+.** Third-party providers (Bedrock, Google Cloud Agent Platform) require 3.10+ for all model-based reviews. Resolution order: `python3.13`~`python3.10` → `python3` → `python` → `py -3` |
| First run | Creates venv in `~/.claude/security/` + installs Claude Agent SDK → needs `pip` and network access |
| Git | End-of-turn/commit reviews diff against git state; silently skip outside repos. Per-edit checks work anywhere |

### 7.2 Installation

Install from the official Anthropic marketplace within a Claude Code session:

```text
/plugin install claude-security@claude-plugins-official
/reload-plugins
```

Together with `security-guidance`:

```text
/plugin install security-guidance@claude-plugins-official
/reload-plugins
```

**Installation scope:** choose `user`. It is written to user settings and auto-loads in all future local sessions on this machine.

Troubleshooting:

| Symptom | Action |
|:---|:---|
| `Marketplace "claude-plugins-official" not found` | `/plugin marketplace add anthropics/claude-plugins-official` then retry |
| Marketplace reports plugin missing | Local copy is stale. `/plugin marketplace update claude-plugins-official` then retry |
| `/plugin` not available | Desktop app: **+** next to prompt → Plugins → Add plugin. Web/cloud sessions: declare in `.claude/settings.json` |

`/reload-plugins` applies pending changes without restart.

### 7.3 Team / Cloud Session Rollout

User-scope plugins do not carry over to Claude Code web sessions (they run on Anthropic infrastructure). To enable for everyone cloning the repository, declare in checked-in settings:

```json
{
  "enabledPlugins": {
    "security-guidance@claude-plugins-official": true,
    "claude-security@claude-plugins-official": true
  }
}
```

Administrators can enable organization-wide via managed settings' `enabledPlugins`.

### 7.4 First Scan (Happy Path)

```text
1) /claude-security  →  Select "Scan codebase"
2) Select scan scope
   - Plugin reads the repo first, presents full or focused areas with file counts and relative cost
   - "I don't know" → auto-selects defaults appropriate to repo size
3) Confirm execution
   - Takes significant time and tokens; Claude Code must remain open throughout
   - Nothing runs until confirmed
4) Observe progress
   - Each phase reports at start. Details via /workflows
5) Review report
   - CLAUDE-SECURITY-<timestamp>/ directory created
6) /claude-security  →  "Suggest patches" → select findings to address
7) Apply only accepted patches: git apply, 1 PR per patch
```

Recommended: **enable auto mode** to prevent scan agents from being blocked by permission prompts at each stage. The plugin guides activation at the start of the operation.

### 7.5 Change-Only Scanning (Daily Workflow)

When a branch has commits not on base, the menu offers to scan just that diff.

```text
/claude-security scan my branch
/claude-security          → "scan commit abc1234"
```

| Constraint | Detail |
|:---|:---|
| Committed changes only | In-progress edits must be committed or stashed first. Otherwise use full scan (reads working tree) |
| Git required | Change scans need a git repo. Non-VCS directories support full scan only |
| PR lookup | Finding open PRs is the **only network-access step.** Only offered when the session already has GitHub CLI execution permission and `gh` is logged in |

### 7.6 Scoping Large Repositories

Do not run the entire tree at once — partition by zone. Pick one of the focused scopes the plugin suggests (API layer, auth code, etc.), and execution scales accordingly. The report's coverage section documents what was and wasn't scanned. Other zones can be scanned separately at any time.

### 7.7 Report Reading Order

```text
1. CLAUDE-SECURITY-REVISION-<commit>.json
   → Check verification.status. If unverified, read the reason
   → Check if filename contains -dirty (uncommitted code mixed in)
   → Check effort tier. low/medium means Adversarial phase did not run

2. CLAUDE-SECURITY-RESULTS.md coverage section
   → What was not scanned and why

3. Finding list
   → Sort by severity × confidence
   → confidence: high = 3/3 unanimous, medium = 2/3 quorum
   → Review each finding's CWE, sink line, prerequisites, exploit scenario

4. CLAUDE-SECURITY-RESULTS.jsonl
   → Connect to ticket system / dashboard pipeline
```

For audit trails, delete the directory's single `.gitignore` and commit it. When distributing internally, treat reports as **TLP:AMBER or higher** — they contain exact vulnerability locations.

### 7.8 Troubleshooting

| Symptom | Cause / Action |
|:---|:---|
| `/claude-security` menu shows Python warning | `python3` 3.9.6+ required. If not found at all: install warning. If first `python3` is outdated: specific version noted. Install or reorder `PATH`, then **start a new session** |
| "Fable 5's safeguards flagged this message" | Cybersecurity classifier in Fable 5 blocked some activity; auto-downgraded to Opus. **Normal behavior, scan completes** |
| `security-guidance` reviews not appearing | Check `~/.claude/security/log.txt`. (a) Not a git repo (b) No Anthropic auth / third-party provider → model-based reviews skip, only per-edit works (c) `security-patterns.yaml` exists but PyYAML can't import → file ignored, use `.json` |
| Patch not generated, only notes | Independent verifier could not guarantee the 3 claims. Review note reasons, then fix manually |
| Finding skipped | Code changed since discovery → report is stale. Re-scan |

### 7.9 Removal

```text
# claude-security
/plugin  →  uninstall
claude plugin uninstall claude-security

# security-guidance
/plugin disable security-guidance@claude-plugins-official     # Pause
/plugin uninstall security-guidance@claude-plugins-official   # Remove user scope
```

When enabled via project `.claude/settings.json`, disabling from `/plugin` writes an override to `.claude/settings.local.json` without modifying the checked-in file. Only you are affected — teammates are not. The same dialog can remove from shared settings to disable for everyone (requires v2.1.203+). Managed settings activations can only be disabled by administrators.

---

## 8. Adoption Recommendations by Scenario

| Organization Situation | Recommendation |
|:---|:---|
| Already using Claude Code, no AppSec tools | Deploy `security-guidance` immediately (free). Use `claude-security` for pre-release branch scans |
| Existing SAST in place | Keep current stack. Use `claude-security` on high-risk components (auth, payments) to measure marginal detection rate |
| GitHub Enterprise-centric | GHAS + Copilot Autofix has the advantage in the PR loop. `claude-security` as secondary for logic flaws GHAS misses |
| GitLab / Bitbucket / air-gapped | Where managed SaaS cannot reach. Plugin's local execution is a structural advantage |
| Regulatory/audit compliance required | Deterministic SAST (Veracode, Checkmarx) must be maintained. Non-determinism prevents standalone evidence |
| Auditing external/untrusted code | Must use `sandbox-runtime` or VM. Plugin provides no inherent isolation |
| Enterprise, continuous monitoring needed | Evaluate the managed Claude Security product (webhooks, scheduled scans, dismissal history inheritance) |

### Minimum Operating Procedure Proposal

```text
[Daily]     security-guidance always active (free, automatic)
[Pre-PR]    /claude-security scan my branch  (changes only, medium effort)
[Sprint]    Full scan of 1 high-risk component (high effort) → commit report for audit trail
[Release]   Existing SAST + SCA + secret scan (deterministic gate)
[Quarterly] Full repo traversal scan (max effort), revision stamp for history
```

---

## 9. Sources

| Source | URL |
|:---|:---|
| Claude Security Plugin Official Docs | https://code.claude.com/docs/en/claude-security |
| security-guidance Plugin Official Docs | https://code.claude.com/docs/en/security-guidance |
| Claude Security Product Page | https://claude.com/product/claude-security |
| Plugin Source (claude-security) | https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-security |
| Plugin Source (security-guidance) | https://github.com/anthropics/claude-plugins-official/tree/main/plugins/security-guidance |
| Sandbox Runtime | https://github.com/anthropic-experimental/sandbox-runtime |
| Auto Security Review Support Docs | https://support.claude.com/en/articles/11932705-automated-security-reviews-in-claude-code |
| Security Review GitHub Action | https://github.com/anthropics/claude-code-security-review |

Beta product — features, output schemas, and requirements may change. Re-verify against official documentation before attaching automation pipelines.
