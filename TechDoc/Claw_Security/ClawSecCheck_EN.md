---
title: "ClawSecCheck Project Analysis and Getting Started"
description: "A local, read-only, offline security self-audit tool for OpenClaw AI agents. Grades your config A-F, flags the Lethal Trifecta, and ships fix prompts."
abstract: |
  ClawSecCheck is a local, read-only, offline self-audit tool for OpenClaw AI agents, distributed as a skill or standard CLI. It grades configurations A-F using check IDs spanning exposure, permissions, secrets, supply chain, and agent behavior, and separately surfaces ten capability-chain risks (RISK-01 to RISK-10). The tool is honest by design: unknown items are never scored as passing, and shareable badges expose only the grade, never the findings.
summary_for_ai: |
  Reference note for AI agents: this document describes ClawSecCheck v0.30.1 (README-based, as of 2026-06-21). It is a pre-1.0, single-maintainer project; flags, schema, and check IDs may change in later releases. It only applies to the OpenClaw ecosystem and performs static/heuristic auditing, not runtime verification. Do not treat its grade as a guarantee of security.
lang: en
featured: false
author: Dennis Kim
date: 2026-06-21
schema_type: TechArticle
---

# ClawSecCheck Project Analysis and Getting Started

> Based on the official repository `github.com/gl0di/clawseccheck`, latest release v0.30.1 (2026-06-21)
> MIT license · Zero dependencies (Python standard library only) · Single author (gl0di)

---

## Concept

OpenClaw has recently become a frequent target for attackers. Between vulnerabilities in OpenClaw itself and a wave of LLM-friendly attack techniques, the threat landscape has grown noisy. ClawSecCheck was built to address this problem.

**ClawSecCheck** is a **local, read-only, offline security self-audit tool** for OpenClaw AI agents. It can be installed as an OpenClaw skill and used conversationally, or run as a standard CLI.

> "A one-command security self-audit for *your own* agent."

The core design principle is not "scan someone else's agent" but **audit your own agent yourself**. That sidesteps ownership-proof and legal gray-area problems entirely. The tool grades your configuration A through F, surfaces the most urgent gaps in plain language, and hands you copy-paste-ready fixes along with a **shareable grade badge**.

OpenClaw agents read user messages, remember conversations, hold keys, and act on the user's behalf. Those exact privileges are what attackers target — a single poisoned message or a single malicious skill can quietly turn an agent against its owner. ClawSecCheck inspects and grades your configuration to catch that risk before it materializes.

### Operating Principles

- **Conversation-driven auditing**: run inside OpenClaw and it walks the whole process conversationally, even if the agent doesn't know any flags (guided mode).
- **Read-only**: never modifies configuration or skills. There is no `--fix` feature at all.
- **Offline, zero-transmission**: no network calls, no API keys, no telemetry. It only reads `~/.openclaw/openclaw.json` and workspace bootstrap markdown files.
- **Honesty first**: anything it can't determine is marked `UNKNOWN` and excluded from scoring. `UNKNOWN` is never treated as `PASS`.

Internally, it invokes exactly one thing — the platform's own audit — read-only, and merges the result. No shell access, no `--fix`, a timeout exists, and it can be skipped with `--no-native`.

```
openclaw security audit --json
```

---

## What Does It Check?

### Lethal Trifecta — the flagship framework

This is the headline metric ClawSecCheck surfaces at the top of every report. When **untrusted input × sensitive data access × external (egress/execution) action** all hold true simultaneously, a compromise becomes fatal or trivial. The tool recommends keeping **at most 2 of the 3** satisfied, and displays Score, Grade, and Trifecta ratio together at the top (the shareable badge exposes only the grade).

### Check families (by check ID)

Checks are implemented under the following ID scheme: exposure/permissions/secrets (B1-B12), supply chain (B13-B15), preparedness (B16-B17), agent behavior (B18-B24), injection/deep exposure (B26 onward), capability/host expansion (B43, B50s), plus native audit merging (A1) and the risk engine (RISK).

| Check family | Representative items |
|--------------|-----------|
| **B1-B12** | Gateway exposure/channel auth, plaintext secrets, least privilege, execution sandbox, TLS, local model hygiene |
| **B6** | Checks bootstrap files (`SOUL.md`, `AGENTS.md`, `TOOLS.md`) for prompt-injection-inducing directives |
| **B13** | Static inspection of installed third-party skill content. Detects ClawHavoc-style malware and base64-hidden payloads. From v0.21, Python AST parsing catches obfuscation like `exec(base64.b64decode(...))`; from v0.23, it traces taint from credential files flowing to network sinks |
| **B14 / B15** | Egress surface / MCP server trust boundary |
| **B16 / B17** | Presence of threat monitoring / autonomy and heartbeat |
| **B18-B24** | Subagent delegation, data-at-rest exposure, identity/memory file write protection, tool output trust boundary, self-modification, approval bypass, deep MCP hardening |
| **B26** | Untrusted context exposure (`contextVisibility="all"` default) |
| **B30 / B31 / B32** | Sender identity strength / the `tools.deny:["write"]` footgun that fails to block `apply_patch`/`exec` / control-plane change reachability |
| **B33** | Known-vulnerable version gate (checked against `meta.lastTouchedVersion`) |
| **B38 / B39 / B41 / B42** | Browser SSRF (e.g. 169.254.169.254) / session visibility and cross-user leakage / credential blast radius / install-time supply chain (preinstall hooks, world-writable skill directories) |
| **B43 / B44 (attestation layer)** | Supplements static scanning — which can't see real tool/verb usage — with agent self-reported inventory. Classifies into `EXEC/DESTRUCTIVE/EGRESS/MAILBOX_CONFIG/REVERSIBLE` and checks drift against config (confidence `ATTESTED`, experimental) |
| **B50-B54 (Host Watch)** | Whether the host the agent runs on is itself monitored: network IDS, host auditing, file integrity, EDR, host firewall. LOW severity, never causes a FAIL |
| **A1** | Runs the platform's own `openclaw security audit` and merges it into the same report (does not affect the score) |

The dirty-input sanitizer, action gate, and taint labeling (B26-B28) are still on the roadmap — the largest remaining coverage gap. That's also why some items remain marked `UNKNOWN`.

### Risk engine — RISK-01 through RISK-10

Beyond individual checks, the tool separately detects ten **capability chains** — combinations where a breach becomes catastrophic once two or more properties hold simultaneously.

| ID | Severity | Chain |
|----|--------|------|
| RISK-01 | CRITICAL | Untrusted sender → exec/write/escalation tool → host/filesystem |
| RISK-02 | HIGH | Untrusted input → sensitive data reachability → egress/execution (Lethal Trifecta) |
| RISK-03 | HIGH | Untrusted ingress + no sandbox → direct exec/write on the host |
| RISK-04 | HIGH | Mutable identity (name-matching) → escalation/exec tool → privilege escalation |
| RISK-05 | HIGH | Browser SSRF (private network) → secrets/credentials → exfiltration |
| RISK-06 | CRITICAL | Open/untrusted surface → control-plane endpoint → full takeover |
| RISK-07 | HIGH | Exec/write with no approval gate → writable bootstrap/identity files → persistent compromise |
| RISK-08 | MEDIUM | Multi-user channel → shared session (`dmScope="main"`) → cross-user leakage |
| RISK-09 | CRITICAL | Malicious installed skill (B13 fail) → reachable secrets → egress → exfiltration |
| RISK-10 | MEDIUM | Untrusted input → host exec/write → no host detection → invisible compromise |

Each chain only fires when every link has positive evidence (evidence-gated), keeping false positives low. The risk engine doesn't alter the deterministic A-F score and is surfaced separately, showing worst-case paths at a glance without score inflation.

---

## How Scoring Works

Scoring uses a weighted pass rate (CRITICAL=10, HIGH=6, MEDIUM=3, LOW=1), with an added **honesty hard cap**: any unresolved CRITICAL caps the score at **49**, and any unresolved HIGH caps it at **79** — so you can't earn an A while carrying a fatal hole.

| Grade | Score |
|------|-------|
| A | 90+ |
| B | 80-89 |
| C | 70-79 |
| D | 50-69 |
| F | <50 |

`UNKNOWN` items are never scored, and advisory checks never move the grade. The shareable card exposes only grade, score, and Trifecta ratio, keeping findings private — because sharing shouldn't hand attackers a map.

---

## Strengths

- **Privacy-first, fully local**: no accounts, no API keys, no telemetry, no network requests. The only thing it stores by default is a single owner-only local score history line (`~/.clawseccheck/history.jsonl`), which you can opt out of with `--no-history`.
- **Covers what native audits miss**: inspects bootstrap files (`SOUL.md`, `AGENTS.md`, `TOOLS.md`) — which the platform's own audit doesn't check — from a prompt-injection angle (B6).
- **Pre-install risk assessment**: vet skills before installing/trusting them with `--vet <skill>`, and connected MCP servers with `--vet-mcp` (SAFE/SUSPICIOUS/DANGEROUS). Most tools only look at skills and miss the MCP-server supply-chain gap this targets — especially important since the ClawHavoc incident.
- **Active injection testing**: `--canary` (manual injection self-test), `--redteam` (tool poisoning, MCP response injection, memory poisoning, multi-agent, approval bypass, dirty-to-exfiltration scenarios), and `--dryrun` (runtime behavior testing with fake secrets and fake tools).
- **Honest design**: `UNKNOWN != PASS`, and limitations aren't hidden behind a green score. Risk chains only fire with evidence.
- **Completely free, open-source, zero dependencies**: MIT license, pure Python standard library.
- **Multiple output formats and CI gating**: human-readable reports, `--json`, `--sarif` (SARIF 2.1.0), `--html`, `--badge` (SVG), `--card`. Gate CI with `--fail-under 70` and `--exit-code`.

---

## Weaknesses and Limitations

- **OpenClaw-ecosystem only**: not applicable to other agent platforms.
- **Requires awareness of conversational exposure**: using it inside OpenClaw chat makes the report text part of that conversation, processed by whichever model provider you're already using. The scanner itself doesn't open a new channel, but this is worth being aware of.
- **CLI usage requires a Python environment**: pipx installation is recommended (`pip install .` also works). On Windows, POSIX permission checks are skipped, and unicode-unsupported consoles fall back to ASCII.
- **Static, heuristic auditing**: this is not runtime verification or formal proof, and false positives/negatives can occur. It cannot replace adversarial testing of a running agent. Its scope is also limited to config files, bootstrap markdown, and installed skill text.
- **Very new, small-scale project**: still pre-1.0 (0.x) and run by a single author. Flags, schema, and check IDs can change even in minor releases, and the contract only stabilizes at 1.0. In terms of maturity and validation history, it lags behind larger projects like ClawSec or ClawSecure. It's safer to note this explicitly when citing it in public reports or columns.

---

## Comparison With Similar Projects

| Project | Form | Characteristics |
|----------|------|------|
| **ClawSec** (prompt-security) | Skill suite | Targets OpenClaw, Hermes, PicoClaw, NanoClaw. Drift detection, skill integrity verification, NVD-based security advisory feed |
| **ClawSecure** | Cloud audit platform | Audits 3,000+ skills, OWASP ASI 10/10 coverage, 3-Layer Audit Protocol, continuous monitoring |
| **ClawScan** | CLI (`npx clawscan`) | Detects malware, reverse shells, prompt injection, and unicode attacks before skill install, MIT |
| **ClawVitals** | Skill + plugin | Local execution health checks, config tampering/drift alerts, scoring |
| **openclaw-security-scan** (legendaryabhi) | Pure Bash CLI | No Python required, auto-fix for critical issues, JSON output for CI |

**What sets ClawSecCheck apart** is running fully offline and locally with zero dependencies (versus cloud-dashboard-style alternatives), checking for bootstrap-file injection that native audits miss (B6), the Lethal Trifecta ratio combined with a findings-private shareable badge, pre-install MCP server vetting (`--vet-mcp`), and extending coverage further into host monitoring posture (B50-B54) and the attestation layer (B43/B44).

---

## Getting Started

### From OpenClaw chat (no terminal needed)

```
openclaw skills install clawseccheck            # from ClawHub (unique slug)
openclaw skills install git:gl0di/clawseccheck  # or directly from GitHub
```

Once installed, just ask **"audit my OpenClaw setup with clawseccheck"** and the grade plus the most urgent issues show up right in the chat.
ClawHub skill page: **https://clawhub.ai/gl0di/clawseccheck**

### Standard CLI

```
pipx install git+https://github.com/gl0di/clawseccheck   # or pip install .
clawseccheck --home ~/.openclaw                          # afterward, just clawseccheck
python -m clawseccheck                                    # works the same way
```

### Running the bundled script directly

```
python3 audit.py                 # human-readable report + shareable card
python3 audit.py --json          # machine-readable
python3 audit.py --card          # badge only
python3 audit.py --sarif results.sarif   # for GitHub Code Scanning upload (local record)
python3 audit.py --html report.html      # standalone HTML report (owner-only)
python3 audit.py --fail-under 70         # exit 1 if score is below 70 (CI)
python3 audit.py --ascii         # fallback for unicode-unsupported consoles
```

### Integrity verification

```
python3 audit.py --verify-self    # SHA-256 of ClawSecCheck's own source (tamper protection)
```

Releases are tagged and public, so for security-sensitive use, it's safer to **review and pin a tag before updating** rather than relying on blind auto-update.

### Conversational commands and what happens under the hood

| User request | What happens internally |
|-------------|-----------|
| "Audit my OpenClaw setup" | Default audit: A-F grade + prioritized fix list + Trifecta |
| "Is this skill safe to install?" | `--vet <skill>` (SAFE/SUSPICIOUS/DANGEROUS) |
| "Are my MCP servers safe?" | `--vet-mcp` |
| "Am I vulnerable to prompt injection?" | `--canary` / `--redteam` |
| "Watch my setup for changes" | `--monitor` (drift/score-drop/new-skill/MCP/channel alerts) |
| "What should I fix first?" | `--next` (finding-based prioritization) |
| "Give me fix prompts" | `--prompts` (copy-paste fix prompt per finding) |
| "Share my grade" | `--badge` / `--card` (grade only, publicly) |

---

## References

- Repository: https://github.com/gl0di/clawseccheck
- Security model: https://github.com/gl0di/clawseccheck/blob/main/SECURITY_MODEL.md
- Skill definition: https://github.com/gl0di/clawseccheck/blob/main/SKILL.md
- ClawHub skill page: https://clawhub.ai/gl0di/clawseccheck

---

*This document is based on README v0.30.1. Being a pre-1.0 project, flags, schema, and check IDs may change in later releases.*
