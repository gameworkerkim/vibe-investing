---
title: "Team Big Five Harness — A Getting Started Guide for Non-Developers"
description: "A beginner-friendly guide to the Team Big Five Harness, a configuration bundle that makes multiple Claude Code AI agents collaborate like a real team, covering installation, trigger phrases, and when to use it."
abstract: |
  Team Big Five Harness is not an application but a set of role and rule files layered on top of Claude Code that makes
  multiple AI agents split up work like a human team — a team leader, several contributors, and a performance monitor
  who cross-checks their outputs. This guide walks a non-developer through the three concepts to understand first,
  when to use (and not use) team mode, step-by-step installation, the simple trigger-phrase formula for invoking it,
  four real-world usage examples, what happens behind the scenes, an FAQ, and a one-page cheat sheet.
summary_for_ai: |
  A non-developer-friendly getting started guide for Team Big Five Harness (github.com/tobyilee/team-bigfive), a
  configuration bundle (not a standalone app) that runs on top of Claude Code and switches it into "team mode."
  Key concepts: it's a set of role/procedure files (.claude folder + CLAUDE.md), it requires Claude Code (Anthropic's
  terminal tool) to function, and "harness" means a framework that keeps AI agents following a defined collaboration
  procedure rather than acting independently.
  Roles mirror a human team: team-lead (sets goals, assigns work), contributor (multiple worker agents), performance-monitor
  (cross-checks peers' work), and SMM.md (a shared memory/notes file acting like a shared whiteboard).
  Best suited for interdependent, complex tasks (e.g., building a UI and its backend together, synthesizing multiple
  research sources, keeping a story's worldbuilding and plot consistent); not suited for simple one-off questions or
  independent tasks that don't need to interlock.
  Installation: (1) install Claude Code first, (2) download the harness from GitHub (via ZIP button or `git clone`),
  (3) copy the `.claude` folder and `CLAUDE.md` file into your working project folder, (4) run `claude` in that folder
  to verify it works.
  Usage: no special commands needed — just add one "trigger phrase" (e.g., "as a team", "agent team", "high-performing team")
  to a normal natural-language request. Includes four example prompts (web dev, research/reporting, creative writing,
  data analysis + verification) and a walkthrough of the five-stage internal workflow (setup, team formation, collaborative
  execution, cross-review, synthesis), with output typically saved to `_workspace/final/`.
  Theoretical basis: Salas, Sims & Burke (2005), "Is there a 'Big Five' in Teamwork?" — five behaviors (team leadership,
  mutual performance monitoring, backup behavior, adaptability, team orientation) resting on three foundations (shared
  mental models, closed-loop communication, mutual trust).
date: 2026-05-15
author: "Dennis Kim"
lang: en
tags:
  - Claude Code
  - AI Agents
  - Multi-Agent
  - Productivity
keywords:
  - Team Big Five Harness
  - Claude Code multi-agent
  - AI team collaboration
  - team-lead contributor performance-monitor
  - shared mental model AI
featured: false
schema_type: TechArticle
draft: false
---

# Team Big Five Harness — A Getting Started Guide for Non-Developers

> A guide written so you can follow along even if you don't know a single line of code.
> Source: https://github.com/tobyilee/team-bigfive

---

## 0. One-Sentence Summary

**A configuration bundle that makes multiple AIs divide up roles and collaborate like "one team," so you get better output from the same AI.**

The finding from Team Science that "a group of ordinary people with good teamwork produces better results" has been applied directly to AI agents. The point isn't to use a smarter AI — it's to make **the AIs collaborate with each other better**.

---

## 1. Three Concepts to Understand First

Let's start with the parts non-developers get confused about most often.

### (1) This is a "configuration bundle," not a "program"

It's not an app you double-click to run. It's **a collection of rule and role files that sit on top of a tool called Claude Code**. Think of it as a "recipe + kitchen duty roster" handed to a chef (the AI).

### (2) It only works if you have "Claude Code"

Claude Code is a tool made by Anthropic that lets you give Claude tasks from a terminal (the black command-line window). Team Big Five Harness is an add-on configuration that switches how Claude Code operates into "team mode."

### (3) What "Harness" Means

A harness is originally the tack put on a horse (reins, saddle, and the like). Here, it's used to mean **a framework that keeps the AI from acting however it wants, and instead keeps it following a defined collaboration procedure**.

---

## 2. Why Use It — What Gets Better

Giving one AI a big task all at once tends to cause these problems:

- It forgets earlier decisions by the time it gets to later parts.
- Two outputs that need to fit together (e.g., a web app's frontend and backend) end up mismatched.
- Working alone, it can't catch its own mistakes.

Team Big Five Harness solves this **the way a human team works**.

| In a human team | In this harness |
|---|---|
| A lead sets the goal and divides the work | `team-lead` (the leader AI) |
| Team members each do their assigned part | `contributor` (multiple worker AIs) |
| One person cross-checks colleagues' work | `performance-monitor` (the reviewer AI) |
| Shared goals get written on a whiteboard | `SMM.md` (a shared notes file) |
| Repeating back an instruction: "OK, so you want me to...?" | A message confirmation / restatement step |

Key effect: **the more a task requires multiple outputs to fit together, the bigger the payoff.**

---

## 3. When to Use It — and When Not To

This is the most important judgment call. Using it unconditionally isn't automatically better.

### Good fit (interdependent tasks)

- "Design this API and wire up the frontend to it, all in one go"
- "Gather multiple sources on this topic and synthesize/verify them into one"
- "Build the worldbuilding and the plot for episodes 1-3 of a fantasy novel so they don't contradict each other"

### Better to skip (simple or independent tasks)

- Simple questions like "What's the English word for this?"
- Short, one-off tasks
- Multiple independent tasks that don't affect each other (just assign these separately — it's faster)

> **Analogy:** Having 5 people roll a single piece of kimbap actually slows things down. A team shines when there are multiple stages that need to interlock, like a multi-course meal.

---

## 4. Installation (Getting Started)

This is the part non-developers get stuck on most, so we'll break it down step by step.
Order: **① Set up Claude Code → ② Get the harness files → ③ Put them in your working folder → ④ Verify it works**

### Step ① Set Up Claude Code

Team Big Five Harness runs on top of Claude Code. If you don't have it yet, install Claude Code first.
- Claude Code is a terminal-based tool and requires an Anthropic account (a Claude subscription).
- The most accurate way to install it is to follow Anthropic's official documentation (search "install Claude Code").
- Once installed, typing `claude` in your working folder will launch Claude Code.

> If this is your first time using a terminal: on Mac it's called "Terminal"; on Windows it's "PowerShell" or "Command Prompt" — either one is the black window.

### Step ② Get the Harness Files

Get the files from the GitHub page (https://github.com/tobyilee/team-bigfive). Pick whichever of the two methods is more comfortable.

**Method A — Download via button (easiest, recommended)**
1. Go to the GitHub address above.
2. Click the green **`Code`** button.
3. Click **`Download ZIP`**.
4. Unzip the downloaded file.

**Method B — Download via command**
Paste this into your terminal as-is:
```
git clone https://github.com/tobyilee/team-bigfive.git
```

### Step ③ Put Them Into Your Working Folder

This is the key step. The folder and file that act as the harness's "brain" are **`.claude`** and **`CLAUDE.md`**.

1. Inside the downloaded files, find the **`.claude`** folder and the **`CLAUDE.md`** file.
   - (Folders starting with `.` are hidden by default and may not be visible. Turn on "Show hidden files" in your file explorer.)
2. Copy both of these entirely into **the actual project folder you'll be working in**.

What your working folder looks like after copying:
```
my-project-folder/
├── .claude/          ← the harness's role/procedure definitions (copied in)
├── CLAUDE.md         ← the harness's instructions file (copied in)
└── (your working files...)
```

### Step ④ Verify It Works

1. Open a terminal in that folder and type `claude` to launch Claude Code.
2. Try typing one of the trigger phrases from section 4 ("Usage Examples") below.
3. If the AI doesn't just answer on its own, but instead does something like "form a team / divide into roles," it's working correctly.

> **The key takeaway:** installation = putting the `.claude` folder and `CLAUDE.md` file into your working folder. That's it.

---

## 5. How to Use It — the "Trigger Phrase" Is Everything

Once installed, you don't need any complicated commands.
**Ask as you normally would, in your own words, and just include one "magic word" below**, and team mode turns on.

### Trigger words (any one of these is enough)

- "as a team"
- "agent team"
- "team big five"
- "high-performing team"
- "with multiple agents"
- "handle this collaboratively"

### The formula for building a sentence

> **[what you want done]** + **[trigger word]** + **please**

That's the whole thing.

> Note: since Claude interprets natural language, you can phrase this in whatever language you're working in — the examples above are just illustrative English equivalents of the concept.

---

## 6. Four Real Usage Examples

Examples any non-developer can type in directly.

### Example 1 — Building a Website (Development Task)

```
Build a company landing page and a contact form, and make sure they're wired together correctly, as a team.
```

One AI handles the UI, another handles the form logic, and the reviewer AI checks that "the two actually fit together."

### Example 2 — Research and Reporting (Non-Development Task)

```
Research 2025 EV market trends from multiple sources and synthesize them into one report, using an agent team.
```

Multiple worker AIs split up the research → the reviewer AI catches contradictions between sources → the lead AI merges everything into a single report.

### Example 3 — Writing and Planning (Creative Task)

```
Build out the worldbuilding and the plot for episodes 1-3 of a fantasy novel with team big five, so nothing contradicts.
```

The person handling the world and the person handling the plot both look at the shared notes (SMM) together to avoid conflicts.

### Example 4 — Analysis + Verification (Business Task)

```
Analyze this spreadsheet of sales data, and cross-verify the analysis is correct, using a high-performing team.
```

Analysis and verification are handled by separate roles, catching errors that a single person working alone would miss.

---

## 7. What Happens While It's Running (For Peace of Mind)

So you don't panic when unfamiliar terms scroll by on screen, here's the flow ahead of time.

1. **Setup** — The lead AI writes the goal and "definition of done" into the shared notes file (SMM.md).
2. **Team formation** — It creates several worker AIs plus one reviewer AI.
3. **Collaborative execution** — Workers reference the shared notes as they work, and confirm with each other when handing off results ("Just to confirm, you meant it this way, right?").
4. **Review** — The reviewer AI cross-checks whether the outputs actually fit together.
5. **Synthesis** — The lead AI merges everything into a single final version.

Output is typically organized into a folder called `_workspace/final/`.

---

## 8. Frequently Asked Questions

**Q. Does this work in the regular Claude app (web/mobile) too?**
No. This harness is **exclusive to Claude Code (the terminal tool)**. It doesn't work in the web or mobile Claude app.

**Q. I can't see the `.claude` folder.**
Folders starting with `.` are hidden by default. Turn on "Show hidden items" in your file explorer settings. (Mac Finder: `Cmd + Shift + .`)

**Q. I included the trigger word, but it's just answering normally.**
Check three things: ① is `.claude` and `CLAUDE.md` actually inside **your current working folder**, ② did you launch Claude Code from that folder, ③ is the trigger word spelled correctly.

**Q. Wouldn't it be better to always use team mode?**
No. Using a team for simple tasks is actually slower and less efficient. Use it only for "complex tasks whose outputs need to fit together" (see Section 3).

**Q. What if I don't like the result?**
Just continue the conversation and ask for revisions in natural language. The harness is designed to incorporate feedback and improve after each task.

---

## 9. One-Page Cheat Sheet

```
[Install]
1) Install Claude Code
2) Download the ZIP from GitHub (Code → Download ZIP)
3) Copy the .claude folder + CLAUDE.md into your working folder
4) Run 'claude' from that folder

[Use]
"(what you want done) + (trigger word) + please"

[Trigger words]
as a team / agent team / team big five / high-performing team / with multiple agents / handle this collaboratively

[Use it for] Complex tasks whose outputs need to interlock
[Skip it for] Simple questions, short one-off tasks, independent tasks
```

---

## Theoretical Background (For Further Reading)

This harness is grounded in the classic Team Science paper **Salas, Sims & Burke (2005), "Is there a 'Big Five' in Teamwork?"** Its core claim: good team performance comes from five behaviors (team leadership, mutual performance monitoring, backup behavior, adaptability, and team orientation) resting on three underlying foundations (shared mental models, closed-loop communication, and mutual trust). A detailed explanation can be found in `docs/TEAM-SCIENCE.md` in the source repository.
