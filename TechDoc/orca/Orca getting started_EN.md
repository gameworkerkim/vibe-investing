---
title: "Orca Getting Started — A Multi-AI-Agent Orchestration Guide"
description: "Orca lets you fan out one prompt to multiple CLI coding agents, run them in isolated git worktrees, and merge whichever result wins - a getting-started guide."
abstract: |
  Orca is a free, open-source Agent Development Environment (ADE) from Stably AI that orchestrates multiple terminal-based coding agents - Claude Code, Codex, OpenCode, Cursor CLI, Gemini CLI, and more - in parallel, each isolated in its own git worktree, so you can compare diffs side by side and merge only the best result. It requires no login or API keys of its own; you bring your own already-authenticated agent CLIs, and Orca is free while each agent's underlying subscription or API cost is still yours to pay.
summary_for_ai: |
  Reference note for AI agents: Orca is not a Cursor replacement - Cursor CLI itself is one of the agents that can run inside Orca. It requires Git 2.5+ for worktree support and at least one already-authenticated agent CLI before installation provides any value. Running multiple agents in parallel on the same task multiplies token/API consumption accordingly, which is a cost factor to account for, separate from Orca itself being free.
date: 2026-07-15
author: "Dennis Kim"
lang: en
featured: false
schema_type: TechArticle
draft: false
---

# Orca Getting Started — A Multi-AI-Agent Orchestration Guide

| Item | Details |
|---|---|
| Product name | Orca (Agent Development Environment, ADE) |
| Developer | Stably AI (Y Combinator portfolio company) |
| License | MIT (open source, free) |
| Supported platforms | macOS / Windows / Linux + iOS / Android companion apps |
| Repository | github.com/stablyai/orca |
| Official docs | onorca.dev/docs |
| Core concept | A desktop control plane that runs multiple CLI coding agents in parallel inside isolated git worktrees, then compares and merges the results |

---

## 1. What Is Orca?

Orca is an **orchestrator that commands terminal-based AI coding agents — Claude Code, Codex, OpenCode, Cursor CLI, Gemini CLI, and more — in parallel from a single screen**. Rather than bolting AI onto an existing IDE, it's an ADE (Agent Development Environment) designed from the ground up around the premise of "operating a fleet of agents."

The core idea is simple.

1. Broadcast a single development request to multiple agents at once (fan-out)
2. Each agent works in isolation inside its own `git worktree`
3. Once done, view the diffs side by side, compare, and merge only the best result (merge the winner)

Note: Orca is not a Cursor replacement. Even Cursor CLI is just one of the agents that can run inside Orca. What Orca replaces is the "existing workflow of manually juggling 5 open terminal tabs."

---

## 2. Prerequisites

Orca itself requires no login or API key registration. Instead, **the agent CLI(s) you plan to use must already be installed and authenticated.** Orca doesn't proxy or resell any API — each agent calls its own provider directly from your machine.

| Prerequisite | How to check | Notes |
|---|---|---|
| Git 2.5+ | `git --version` | Required for worktree support |
| At least one agent CLI | `claude --version`, `codex --version`, etc. | Anything that runs in a terminal works — Claude Code, Codex, OpenCode, Gemini CLI, Cursor CLI, and more |
| Each agent's authentication completed | Confirm standalone execution works normally in the terminal | E.g., confirm you're logged in after running `claude` |
| A Git repository to work on | A local clone or GitHub repo | Since it's worktree-based, a Git repository is a prerequisite |

Cost structure: Orca itself is free, but subscription fees for the agents running inside it (Claude Pro/Max, ChatGPT Plus, etc.) or API usage charges are your own responsibility.

---

## 3. Installation

### macOS (Homebrew)

```bash
brew install --cask stablyai/orca/orca
```

Note: `brew install --cask orca` (omitting the tap path) doesn't work. You must use the full `stablyai/orca/orca` path.

### Arch Linux (AUR)

```bash
yay -S stably-orca-bin
# For a source build: yay -S stably-orca-git
```

### Windows / Other Linux

- Download an installer from onorca.dev or GitHub Releases (github.com/stablyai/orca/releases)

### Mobile Companion App

- iOS: App Store / TestFlight
- Android: APK from GitHub Releases
- Pairing with the desktop app lets you monitor agent progress, receive completion notifications, and send follow-up prompts remotely.

---

## 4. Initial Setup (First Run)

1. **Connect a project**: launch Orca and add a local Git repository. Setting up GitHub integration lets you browse PRs, issues, and project boards directly inside the app.
2. **Verify agents**: Orca detects CLI agents installed on your system. When creating a new worktree, you choose which agent to attach.
3. **Configure notifications**: set up desktop/mobile notifications for when an agent finishes a task or is waiting for input. This is effectively essential for parallel operation.
4. **(Optional) Account switching/usage tracking**: check Claude/Codex usage and rate-limit reset times from the dashboard, and switch between multiple accounts without re-logging in.

---

## 5. Core Workflow

### 5.1 Basic Cycle: Fan-out → Isolate → Compare → Merge

| Step | Action | Description |
|---|---|---|
| 1. Fan-out | Send one prompt to multiple agents simultaneously | E.g., fire the same bug-fix request in parallel to Claude Code, Codex, and OpenCode |
| 2. Isolated execution | Each agent works in its own git worktree + dedicated terminal | Worktrees share the same repository but have completely separate working directories and branches. The main branch is never contaminated |
| 3. Monitoring | Check every agent's status via a live status dashboard | Working / awaiting input / completed states are shown at a glance, viewable from the mobile app too |
| 4. Compare | View each worktree's diff side by side | You can leave comments on specific lines and send fix feedback back to the agent |
| 5. Merge | Select the best result and merge it to the main branch | The remaining worktrees are discarded |

### 5.2 Real-World Scenarios

- **Parallel bug fixes**: assign the same bug to 3 agents simultaneously and merge only the fix that actually works
- **Risk hedging**: hedge against the chance that a single model goes in the wrong direction, using multiple attempts
- **GitHub/Linear task-based work**: open a worktree directly from a PR, issue, or Linear ticket, and the agent automatically receives the task context
- **Design Mode (frontend)**: clicking a UI element in the built-in Chromium browser automatically injects that element's HTML, CSS, and a cropped screenshot into the agent's prompt
- **Remote execution (SSH worktree)**: run agents on a high-spec remote server while still editing files, using git, and using the terminal locally as usual. Supports automatic reconnection and port forwarding
- **Orca CLI**: control the IDE itself via scripts from the terminal — adding projects, creating worktrees, posting progress checkpoints, and more

---

## 6. Strengths

| Strength | Detail |
|---|---|
| Tool integration | Manages 30+ proliferating CLI agents (Claude Code, Codex, Gemini, Copilot, Cline, and more) from a single UI. "If it runs in a terminal, it runs in Orca" |
| Risk hedging | Multiple attempts at the same task, then select the best result. Mitigates single-model dependency risk |
| Complete isolation | git-worktree-based physical separation of each task. Eliminates branch juggling and stash hell |
| Code review environment | Diff visualization + line-level comments + agent feedback loop + in-app commits |
| Remote/mobile | SSH remote worktrees, mobile monitoring and control. Your agent fleet keeps working even when you're away |
| Subscription-friendly | Uses your existing subscriptions as-is. No vendor lock-in, with usage tracking and account hot-swapping |
| Open source | MIT license. Fast development pace with daily releases |

---

## 7. Weaknesses and Cautions

| Weakness | Detail |
|---|---|
| Barrier to entry | Assumes familiarity with the git worktree concept and prior agent CLI setup. There's an initial learning curve compared to Cursor's "code immediately after install" |
| Immature UI/UX | Some rough edges remain, like the terminal input box narrowing when you shrink a split screen |
| Occasional instability | Terminal escape sequences can break, sometimes requiring a restart |
| Rapid change itself is a risk | As an early-stage product, the feature surface changes daily. Team-standard workflows can be destabilized by updates |
| Additional cost | Orca is free, but agent subscription/API costs are separate. Note that parallel execution multiplies token consumption |
| Overhead | For users who run only one agent on one task at a time, it can be more operational burden than a pure terminal |

---

## 8. Competitive Comparison

Orca's position isn't "a Cursor replacement" but "a control tower above the agents."

| Product | Type | Difference from Orca |
|---|---|---|
| Cursor / Windsurf | AI-native all-in-one IDE | Usable immediately after install, but lacks multi-agent parallel execution and comparison features. Cursor CLI can actually run inside Orca |
| Aider / Continue.dev | Open-source single-agent tool | Parallel execution and visual diff comparison aren't the core focus |
| Claude Squad | Terminal TUI-style multi-agent manager | For users who prefer a tmux-style workflow. No desktop GUI, mobile, or browser integration |
| Agent Deck | Terminal session manager | Focused on conductor, notifications, and MCP socket pooling. Lighter weight than Orca |
| Paseo | Self-hosted cross-device control | For cases prioritizing web/mobile/CLI access across the board over a desktop IDE surface |
| Pure terminal (e.g., Claude Code alone) | Basic workflow | If you only run one task at a time, orchestration itself is unnecessary |

Conclusion: Orca's biggest competitor is still the developer's "existing habits." It's powerful for power users seriously running multiple agents, but overkill for single-agent users.

---

## 9. 5-Minute Quick-Start Checklist

```text
[ ] Confirm Git 2.5+ with git --version
[ ] Install and log in to at least one agent CLI (e.g., claude)
[ ] brew install --cask stablyai/orca/orca (macOS)
[ ] Launch Orca and add a local Git repository
[ ] Create a new worktree → select an agent → send the first prompt
[ ] Fan out the same prompt to a second agent
[ ] Review both results on the diff comparison screen
[ ] Merge the winner, discard the loser's worktree
[ ] (Optional) Pair the mobile app and enable notifications
```

---

## 10. Reference Links

- Repository: https://github.com/stablyai/orca
- Official site/docs: https://www.onorca.dev
- Releases: https://github.com/stablyai/orca/releases
- Community: Discord, X (@orca_build)

---

*Written: 2026-07-15. Orca ships daily releases, so it's recommended to reconfirm specific features against the changelog.*
