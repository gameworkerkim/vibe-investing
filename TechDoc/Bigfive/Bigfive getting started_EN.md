---
title: "Team Big Five Harness — Getting Started Guide for Non-Developers"
description: "A guide written so anyone can follow along, even without knowing a single line of code."
lang: en
featured: false
schema_type: TechArticle
keywords:
  - Team Big Five Harness
  - Claude Code
  - multi-agent
  - AI teamwork
  - team science
tags:
  - Claude Code
  - AI Agents
  - Multi-Agent
  - Getting Started
---

# Team Big Five Harness — Getting Started Guide for Non-Developers

> A guide written so anyone can follow along, even without knowing a single line of code.
> Original source: https://github.com/tobyilee/team-bigfive

---

## 0. One-Sentence Summary

**A configuration bundle that makes multiple AIs split up roles and collaborate like "one team," producing better results even with the same AI.**

The idea is simple: gather ordinary people together, and if teamwork is good, the outcome improves — this finding from Team Science has been directly transplanted onto AI agents. The point isn't to use a smarter AI, but to make **AIs collaborate better with each other**.

---

## 1. Three Concepts You Need to Know First

Let's start with the parts non-developers find most confusing.

### (1) This is a "configuration bundle," not a "program"
It's not an app you double-click to run. It's **a collection of rule and role files that sit on top of a tool called Claude Code**. Think of it as a "recipe + kitchen duty roster" you hand to a chef (the AI).

### (2) It requires "Claude Code" to work
Claude Code is a tool made by Anthropic that lets you assign tasks to Claude from a terminal (a black command-line window). The Big Five Harness is an add-on configuration that switches this Claude Code's behavior into "team mode."

### (3) What the word "Harness" means
A harness is originally "the tack put on a horse (a set of reins, saddle, etc.)." Here, it's used to mean **a framework that keeps AI from acting on its own, and instead makes it follow a defined collaboration procedure**.

---

## 2. Why Use It — What Gets Better

When you give one AI a big task all at once, these problems occur:

- It forgets earlier decisions by the time it reaches the end.
- Two outputs that need to fit together (e.g., an app's frontend and backend) don't match.
- Working alone, it can't catch its own mistakes.

The Big Five Harness solves this **the way a human team works**.

| In a human team | In this harness |
|---|---|
| A team lead sets the goal and divides the work | `team-lead` (leader AI) |
| Team members each do their assigned part | `contributor` (worker AIs, multiple) |
| One person cross-checks colleagues' work | `performance-monitor` (review AI) |
| Shared goals get written on a whiteboard | `SMM.md` (shared memo file) |
| Instructions get echoed back: "OK, you mean do this, right?" | A message-confirmation/restatement procedure |

Core effect: **the more complex the task — the more its outputs need to fit together — the bigger the benefit.**

---

## 3. When to Use It, and When Not To

This is the most important judgment criterion. Using it unconditionally isn't necessarily good.

### Good cases (interlocking work)
- "Design this API and hook it up to the screen all in one go"
- "Gather multiple sources on this topic and synthesize/verify them into one"
- "Write the world-building and plot of this novel together, without inconsistencies"

### Better not to use it (simple or independent work)
- Simple questions like "What's the English word for this?"
- Short tasks that finish in one shot
- Multiple independent tasks with no mutual dependency (just assign these separately — it's faster)

> **Analogy:** having 5 people crowd around rolling a single roll of kimbap actually slows things down. A team shines when multiple interlocking stages are involved, like a multi-course meal.

---

## 4. Getting Started (Installation)

This is where non-developers get stuck the most, so we'll break it down step by step.
Order: **① Prepare Claude Code -> ② Get the harness files -> ③ Put them in your working folder -> ④ Verify it runs**

### Step ① Prepare Claude Code
The Big Five Harness runs on top of Claude Code. If you don't have it yet, install Claude Code first.
- Claude Code is a terminal-based tool and requires an Anthropic account (a Claude subscription).
- For installation, following Anthropic's official documentation is most accurate. (search "install Claude Code")
- Once installed, typing `claude` in the folder you're working in launches Claude Code.

> If this is your first time with a terminal: on Mac it's "Terminal," on Windows it's "PowerShell" or "Command Prompt" — that's the black window.

### Step ② Get the Harness Files
Get the files from the GitHub page (https://github.com/tobyilee/team-bigfive). Choose whichever of the two methods is more convenient.

**Method A — Get it via button (easiest, recommended)**
1. Go to the GitHub address above.
2. Click the green **`Code`** button.
3. Click **`Download ZIP`**.
4. Unzip the downloaded file.

**Method B — Get it via command**
Paste the following into your terminal as-is.
```
git clone https://github.com/tobyilee/team-bigfive.git
```

### Step ③ Put Them in Your Working Folder
This is the key step. The folder that serves as the harness's "brain" consists of the **`.claude`** folder and the **`CLAUDE.md`** file.

1. Inside the files you downloaded, find the **`.claude`** folder and the **`CLAUDE.md`** file.
   - (Folders starting with `.` are hidden by default and may not be visible. Turn on "show hidden files" in your file explorer.)
2. Copy these two items in their entirety into **the project folder where you'll actually be working**.

What your working folder looks like after copying:
```
my-project-folder/
├── .claude/          <- harness role/procedure definitions (copied in)
├── CLAUDE.md         <- harness guide file (copied in)
└── (your working files...)
```

### Step ④ Verify It Runs
1. Open a terminal in that folder and type `claude` to launch Claude Code.
2. Try one of the "trigger phrases" from section 4 below (usage examples).
3. If the AI, instead of answering alone, behaves in a way that says "forming a team / dividing roles," it's working correctly.

> **Recap:** installation = putting the `.claude` folder and `CLAUDE.md` into your working folder. That's it.

---

## 5. How to Use It — The "Trigger Phrase" Is All You Need

Once installed, you don't need any complicated commands.
**Ask as usual, in your normal language, but include just one of the "magic words" below**, and team mode activates.

### Trigger words (any one of these is enough)
- "as a team"
- "agent team"
- "team big five"
- "high-performing team"
- "with multiple agents"
- "handle collaboratively"

### The sentence formula
> **[what you want done]** + **[trigger word]** + **please**

That's it.

---

## 6. Four Real Usage Examples

Examples any non-developer can type in directly.

### Example 1 — Building a website (development task)
```
Build a company intro page and a contact form, and make them connect well as a team
```
One AI handles the frontend, another handles the form logic, and a review AI checks that "the two fit together properly."

### Example 2 — Research and reporting (non-dev task)
```
Research 2025 EV market trends from multiple sources and organize it into one report with an agent team
```
Multiple worker AIs research in parallel -> a review AI catches contradictions between sources -> the lead AI merges everything into a single report.

### Example 3 — Writing and planning (creative task)
```
Build out the world-building and the plot for episodes 1-3 of a fantasy novel with team big five, without inconsistencies
```
The world-building lead and the plot lead watch a "shared memo (SMM)" together to prevent conflicts.

### Example 4 — Analysis + verification (practical task)
```
Analyze this Excel sales data, and handle it with a high-performing team including cross-verification of whether the analysis is correct
```
The analysis role and the verification role are kept separate, catching errors that would be missed working solo.

---

## 7. What Happens While It's Running (For Peace of Mind)

So you don't get thrown off by unfamiliar text scrolling by on screen, here's the flow in advance.

1. **Preparation** — the lead AI writes the goal and "definition of done" into a shared memo (SMM.md).
2. **Team formation** — multiple worker AIs plus one review AI are created.
3. **Collaborative execution** — workers reference the shared memo as they work, and confirm with each other ("this is what you meant, right?") when handing off results.
4. **Review** — the review AI cross-checks whether the outputs fit together properly.
5. **Synthesis** — the lead AI merges everything into a final version.

Results are typically organized into a folder called `_workspace/final/`.

---

## 8. Frequently Asked Questions (FAQ)

**Q. Does this work in the regular Claude app (web/mobile)?**
No. This harness is **exclusive to Claude Code (the terminal tool)**. It doesn't work in the web/mobile Claude apps.

**Q. I can't see the `.claude` folder.**
Folders starting with `.` are hidden by default. Turn on "show hidden items" in your file explorer settings. (Mac Finder: `Cmd + Shift + .`)

**Q. I included the trigger word, but it just answered normally.**
Check three things: ① is `.claude` and `CLAUDE.md` inside your **current working folder**, ② did you launch Claude Code from that folder, ③ is the trigger word spelled exactly right.

**Q. Wouldn't it be better to always use team mode?**
No. Using a team for simple tasks is actually slower and less efficient. Only use it for "complex tasks whose outputs need to fit together." (See section 3.)

**Q. What if I don't like the result?**
Just keep going and ask for changes in plain language. The harness is designed to incorporate feedback and improve after each task.

---

## 9. Cheat Sheet at a Glance

```
[Installation]
1) Install Claude Code
2) Download the ZIP from GitHub (Code -> Download ZIP)
3) Copy the .claude folder + CLAUDE.md into your working folder
4) Run 'claude' from that folder

[Usage]
"(what you want done) + (trigger word) + please"

[Trigger words]
as a team / agent team / team big five / high-performing team / with multiple agents / handle collaboratively

[When to use] Complex tasks whose outputs need to fit together
[When not to] Simple questions, short tasks, independent unrelated work
```

---

## Theoretical Background (For Those Who Want to Know More)

This harness is grounded in the classic Team Science paper **Salas, Sims & Burke (2005), "Is there a 'Big Five' in Teamwork?"** Its core claim is that strong team performance comes from five behaviors (team leadership, mutual performance monitoring, backup behavior, adaptability, and team orientation) supported by three underlying foundations (shared mental models, closed-loop communication, and mutual trust). A detailed explanation can be found in `docs/TEAM-SCIENCE.md` in the original repository.
