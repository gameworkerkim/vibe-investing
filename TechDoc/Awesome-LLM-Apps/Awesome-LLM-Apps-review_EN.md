---
title: "Awesome LLM Apps: A Fact-Checked Review of the 118k-Star Agent Template Repository"
subtitle: "15 categories, Apache-2.0, and the maintenance risks nobody mentions"
description: "A fact-checked review of Awesome LLM Apps, a 118k-star GitHub repository of AI agent and RAG templates, verified against the actual repository — covering strengths, weaknesses, comparable projects, and setup steps."
abstract: |
  Awesome LLM Apps is a repository of 100+ AI agent and RAG templates maintained by Shubham Saboo, licensed under Apache-2.0
  and spanning 15 categories from agent skills to fine-tuning.
  Verification shows the "clone and run in 30 seconds" claim largely holds, but the framework and runtime differ from template
  to template, so the learning curve does not carry over, and some entries are just links out to external repositories.
  It is most valuable not as a starting point for a production codebase, but as a catalog of reference implementations.
summary_for_ai: |
  This document is a third-party fact-checked review of the GitHub repository Shubhamsaboo/awesome-llm-apps.
  The data cutoff is 2026-07-23; star and fork counts are from a repository page snapshot (roughly mid-July 2026).
  Five factual errors in the widely circulated original draft were corrected (category count, star-count source, authorship
  of awesome-ai-apps, cause of quality variance, Python version).
  Contributor count and some agent skill entries could not be verified and are explicitly flagged as unverified in the document.
  This document is a technical assessment, not investment advice or a recommendation to adopt any specific product.
date: 2026-07-23
updated: 2026-07-23
author: "Dennis Kim"
lang: en
tags:
  - LLM
  - AI Agent
  - RAG
  - MCP
  - Open Source
  - Developer Tools
keywords:
  - "Awesome LLM Apps"
  - "AI agent templates"
  - "RAG tutorial repository"
  - "Shubham Saboo"
  - "Apache-2.0 LLM templates"
  - "agent skills"
group: ai-llm
featured: false
schema_type: TechArticle
draft: false
---

# Awesome LLM Apps: A Fact-Checked Review of the 118k-Star Agent Template Repository

## 15 categories, Apache-2.0, and the maintenance risks nobody mentions

2026.07.23 Dennis Kim

---

## 1. Introduction

Repositories that cross 100k GitHub stars generally fall into two camps: infrastructure that actually runs every day, or a list people starred once and never opened again. `Shubhamsaboo/awesome-llm-apps` sits somewhere in between. It ships 100+ AI agent and RAG applications as complete, runnable code, and its Apache-2.0 license leaves the door open for commercial reuse. The fact that it contains code rather than a curated list of links is its single, decisive differentiator.

The problem is that most write-ups introducing this kind of repository simply copy the README verbatim. This document checks the numbers and structure against the actual repository, including what the README does not say, to compile the information needed for an adoption decision.

**One-line summary:** Risky as a starting point for a production codebase, but currently the broadest and most runnable catalog of reference implementations available.

---

## 2. Fact-Check Results

Claims commonly circulated in write-ups, checked against the actual repository. As of 2026-07-23; figures are a repository page snapshot from roughly mid-July 2026.

| # | Circulated Claim | Verification Result | Verdict |
|---|---|---|---|
| 1 | 7 categories (Agent Skills, Starter, Advanced, RAG, Voice, Generative UI, MCP) | The README table of contents lists **15 categories**. 8 missing: Always-on Agents, Multi-agent Teams, Autonomous Game-Playing Agents, LLM Apps with Memory, Chat with X, LLM Optimization Tools, LLM Fine-tuning, AI Agent Framework Crash Courses | Inaccurate |
| 2 | 124k GitHub stars | Actual repository page shows **118k stars / 17.6k forks / 1.2k watchers / 1,065 commits**. The 124k figure comes from the maintainer's own X profile, a different source | Source confusion |
| 3 | 95 contributors | Cannot confirm. The contributor graph page blocks automated access and the README badge renders dynamically | **Unverified** |
| 4 | `awesome-ai-apps` is another project by the same author | **Error.** `Arindam200/awesome-ai-apps` (128 projects, sponsored by Nebius) and `rohitg00/awesome-ai-apps` exist separately and are unrelated to Saboo | Error |
| 5 | Built from community contributions, causing quality variance | The README states the opposite: "hand-built, not curated — all templates are original work and tested end-to-end." The real cause of variance is not contributors but **the fact that each template uses a different framework and runtime** | Misattributed cause |
| 6 | Requires Python 3.8+ | No repository-wide requirement is stated. Language composition is **Python 54.6% / TypeScript 21.6% / JavaScript 16.4% / HTML 4.5%** — the Generative UI line is a Node stack. ADK/Agno-based templates often require 3.10+ | Inaccurate |
| 7 | Supported models: Claude, Gemini, GPT, DeepSeek, Llama, Qwen | The current README header lists **Claude · Gemini · OpenAI · xAI · Qwen · Llama**. DeepSeek is missing from the header but appears in individual templates (Deepseek Local RAG Agent) | Needs minor update |
| 8 | Apache-2.0, free for commercial use | True. Confirmed in LICENSE; README states "Fork it, ship it, sell it" | True |
| 9 | Quick Start in 4 commands | True. Matches the commands listed in the README exactly | True |
| 10 | Project Graveyard / Scope Creep Detector / Commit Archaeologist | Only Project Graveyard appears in the README list. The other two **are not in the README list** (whether subdirectories exist is unconfirmed). The other two skills currently listed are Advisor Orchestrator Worker and Self-Improving Agent Skills | Partially wrong |

---

## 3. Project Overview

### 3.1 Core Concept

Created and maintained by Shubham Saboo (Senior AI PM at Google Cloud). The premise is simple — there's no reason to rebuild the same RAG pipeline, the same agent loop, and the same MCP integration from scratch every time you start a new LLM project.

So while this repository is called an "awesome list," it's actually a **cookbook**. Instead of collecting links to external projects, each template ships as a self-contained, runnable unit with its own source code and `requirements.txt`. Accompanying tutorials are provided for free on a separate newsletter platform, Unwind AI.

| Item | Value |
|---|---|
| Repository | `github.com/Shubhamsaboo/awesome-llm-apps` |
| License | Apache-2.0 |
| Stars / Forks | 118k / 17.6k (2026-07 snapshot) |
| Commits | 1,065 |
| Releases | None (no tags or version management) |
| Language mix | Python 54.6%, TypeScript 21.6%, JavaScript 16.4%, HTML 4.5%, CSS 2.5% |
| Categories | 15 |
| Supported models | Claude, Gemini, OpenAI, xAI, Qwen, Llama (varies by template) |
| Tutorials | theunwindai.com (free, newsletter) |
| README languages | 8 languages including Korean (via an external i18n service) |

### 3.2 Full Category List (15)

| # | Category | Description | Representative entries |
|---|---|---|---|
| 1 | Agent Skills | Adds capabilities to coding agents. One-line install, invoked in natural language. Passes security + eval CI gates | Project Graveyard, Self-Improving Agent Skills |
| 2 | Starter AI Agents | Single file, runs with just an API key | AI Travel Agent, xAI Finance Agent, Web Scraping Agent |
| 3 | Advanced AI Agents | Production-style, with tools, memory, and multi-step reasoning | Deep Research Agent, VC Due Diligence Team, Fraud Investigation Agent |
| 4 | Always-on Agents | Runs continuously on a schedule or event trigger, with proactive delivery | Always-on Hacker News Briefing Agent |
| 5 | Multi-agent Teams | Multi-agent collaboration | Competitor Intelligence Team, Legal Agent Team, Recruitment Team |
| 6 | Voice AI Agents | Real-time voice input/output | Insurance Claim Live Agent Team, Customer Support Voice Agent |
| 7 | Generative UI / Agentic Frontends | Renders interactive UI such as forms, cards, and charts | AI Dashboard Canvas Agent, MCP App Builder, Shadcn Component Generator |
| 8 | Autonomous Game-Playing Agents | Autonomous gameplay | AI Chess Agent, 3D Pygame Agent |
| 9 | MCP AI Agents | External tool integration via Model Context Protocol | GitHub MCP Agent, Notion MCP Agent, Multi-MCP Agent Router |
| 10 | RAG | 20 variants, from simple chains to agentic, multi-source setups | Corrective RAG, Vision RAG, Knowledge Graph RAG with Citations |
| 11 | LLM Apps with Memory | Maintains state and conversation across sessions | Multi-LLM Shared Memory, Local ChatGPT Clone with Memory |
| 12 | Chat with X | Turns arbitrary data sources into a chat interface | Chat with GitHub / Gmail / PDF / ArXiv / YouTube |
| 13 | LLM Optimization Tools | Reduces tokens, context, and cost | Toonify (claims 30–60% reduction), Headroom (claims 50–90% reduction) |
| 14 | LLM Fine-tuning | Fine-tuning recipes for open-source models | Gemma 3 (4-bit LoRA + Unsloth), Llama 3.2 |
| 15 | Framework Crash Courses | Deep dives into major agent frameworks | Google ADK, OpenAI Agents SDK |

> The savings figures in category 13 (30–60%, 50–90%) are **claims made by the repository**, not independently verified figures. Re-measure against your own workload.

---

## 4. Strengths

### 4.1 Code, Not Links

Most "awesome-" repositories are collections of curated links. Links die, and dead links never get fixed. In this repository, every template ships with its source code and dependency file, so it's runnable immediately after cloning. The repository size and commit count (1,065) back this up.

### 4.2 The Broadest Coverage of Current Stacks

Patterns used in real-world 2026 practice — MCP integration, Agent Skills, always-on (schedule-driven) agents, Generative UI, real-time voice APIs — all exist as separate categories here. In particular, **repositories that cover both Agent Skills and Generative UI at once are rare.** Most competing repositories stop at RAG and simple agents.

### 4.3 No Vendor Lock-in

LangChain-based repositories teach you LangChain; LlamaIndex examples teach you LlamaIndex. This repository doesn't force a specific framework, so you can compare multiple approaches before committing to one. Being able to see the same problem (e.g., RAG) solved side-by-side across Cohere, Gemini, DeepSeek, and local Llama implementations is genuinely useful.

### 4.4 Apache-2.0

More explicit on patent terms than MIT, with no restrictions on commercial distribution or resale. There's essentially no licensing review burden when promoting an internal PoC directly to production code. It avoids the common scenario of referencing a GPL-family repository and getting blocked in legal review.

### 4.5 Value as an Idea Catalog

Entries like Project Graveyard (finds abandoned side projects and diagnoses why they died), Self-Improving Agent Skills (automatically optimizes the skill itself), and Trust-Gated Multi-Agent Research Team (multi-agent setup with trust gating) are worth referencing for **the problem definition itself, more than the code.** Useful as a list to browse when you're stuck on "what should I build with an LLM."

---

## 5. Weaknesses

### 5.1 No Unified Framework — Freedom, but Also a Cost

The strength in 4.3 becomes a weakness here. Template A uses Agno, B uses Google ADK, C uses CrewAI, D uses the OpenAI Agents SDK, and E is Next.js + TypeScript. **Learning resets every time you switch templates.** There's no accumulated proficiency within a single repository, and the moment you try to combine multiple templates into one system, the cost rises sharply.

### 5.2 Not Production Code

The README says "production-style" and "tested end-to-end," but most of the actual code is a single-file Streamlit demo. Observability, retry/backoff, cost caps, prompt-injection defenses, secrets management, concurrency handling — the things production needs are generally absent. **What this repository outputs is scaffolding, not a foundation for production code.**

### 5.3 No Version Management

There are no releases or tags, only a `main` branch. There's no way to track whether a template you cloned six months ago behaves differently from the same template today. Given the pace at which new templates are added weekly, this is a real reproducibility risk. **If you reference this internally, fork it and pin the commit hash.**

### 5.4 The "Self-Contained" Principle Already Has Exceptions

The README claims everything is "original work, not collected from elsewhere," but the actual list mixes in entries that link out to external repositories (Openwork, OpenSource Voice Dictation Agent, etc.). The count is small, but it's a signal that principle and practice have already started to diverge, and this ratio tends to rise as the repository grows.

### 5.5 Documentation Quality Varies

Some Agent Skills entries contain model names that appear to be nonexistent or misspelled left as-is, showing review gaps in the README itself. This is an inevitable outcome of a small number of people maintaining 100+ templates. **Don't trust the template descriptions as fact — open the code.**

### 5.6 API Costs Are on You

The repository is free, but running it isn't. A few runs of a single multi-agent team template can cost several dollars. Local model options (Llama, DeepSeek, Gemma) exist, but their tool-calling and structured-output reliability is noticeably worse than commercial models, so people often end up going back to commercial APIs anyway.

### 5.7 Star Count Is Not a Quality Signal

118k stars means "a lot of people clicked star intending to look at it later," not "a lot of people use it in production." Taken together with the lack of releases, the low issue count (1), and stack fragmentation from a growing TypeScript share, the repository's actual usage mode leans toward **reading and referencing** rather than deploying. On the other hand, an unusually high fork-to-star ratio (about 15%) is a counter-signal suggesting real usage — people cloning it to dig in.

---

## 6. Comparison with Similar Projects

| Project | Nature | Scale | vs. Awesome LLM Apps |
|---|---|---|---|
| **Arindam200/awesome-ai-apps** | Collection of RAG/agent/workflow projects (sponsored by Nebius) | 128 projects | Most direct competitor. More explicit framework diversity (AutoGen, AWS Strands, CAMEL, CrewAI, LangGraph). Sponsor-backed, so may lean toward specific infrastructure |
| **rohitg00/awesome-ai-apps** | 5 categories (Starter/Advanced/Multi-Agent/RAG/Multimodal) | Medium | Simpler structure, fewer categories |
| **Agno cookbook** (formerly phidata) | Official framework examples | Many | Optimized for a single framework. Deep, but framework-locked. Many Awesome LLM Apps templates are Agno-based, making it effectively an upstream dependency |
| **LlamaIndex official examples / LlamaHub** | RAG-focused official examples | Many | Overwhelming depth in RAG. Weak on agents, voice, and UI |
| **LangChain / LangGraph templates** | Official framework templates | Many | Strong ecosystem integration and deployment (e.g., LangSmith). Strongest framework lock-in |
| **awesome-llm-webapps** | Focused on LLM web UI applications | Small | Narrow scope, updated infrequently |

> The current operating status of LangChain-family templates (whether LangChain Templates have migrated to LangGraph templates) fluctuates significantly over time — re-check the official docs before adoption.

**Positioning:** If you've already picked a framework, that framework's official cookbook is the better choice. If you haven't, or you're still mapping out what's possible by comparing approaches, Awesome LLM Apps is the broadest option available.

---

## 7. Getting Started

### 7.1 Prerequisites

| Item | Requirement |
|---|---|
| Python | Varies by template. **3.10+ recommended** (ADK/Agno-based templates commonly require 3.10+) |
| Node.js | Needed for Generative UI templates (TypeScript ~22%) |
| API keys | Keys for whichever providers the template uses (OpenAI / Anthropic / Google / xAI, etc.) |
| For local execution | Ollama + Llama, Qwen, DeepSeek, Gemma, etc. |
| Recommended | Separate virtual environment per template (avoids dependency conflicts) |

### 7.2 Path A — Install as an Agent Skill (~10 seconds)

Adds capability to a coding agent (Claude Code, Codex, Cursor, etc.) without cloning the whole repository.

```bash
npx skills add https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/agent_skills/project-graveyard
```

After installation, invoke it in natural language.

```
Why do my side projects never make it to the finish line?
```

The repository states each skill includes real code and passes security and eval CI gates. Still, **read `SKILL.md` and the scripts yourself before installing.** Injecting arbitrary skills into a coding agent is, by itself, a supply-chain risk surface.

### 7.3 Path B — Clone a Template and Run (~30 seconds)

```bash
# 1. Clone the repository
git clone https://github.com/Shubhamsaboo/awesome-llm-apps.git
cd awesome-llm-apps/starter_ai_agents/ai_travel_agent

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run
streamlit run travel_agent.py
```

### 7.4 Recommended Procedure (Practical Guidance)

A full clone is large and mostly unnecessary. In practice, the following is recommended.

```bash
# 1) Sparse checkout — only the template you need
git clone --filter=blob:none --sparse https://github.com/Shubhamsaboo/awesome-llm-apps.git
cd awesome-llm-apps
git sparse-checkout set starter_ai_agents/ai_travel_agent

# 2) Ensure reproducibility — pin the commit hash
git rev-parse HEAD   # record this hash in internal documentation

# 3) Isolated environment
python -m venv .venv && source .venv/bin/activate
pip install -r starter_ai_agents/ai_travel_agent/requirements.txt

# 4) Keys as environment variables. First check whether there's a hardcoded key field in the code
export OPENAI_API_KEY="..."
```

### 7.5 Recommended Entry Points

| Goal | Starting point |
|---|---|
| First LLM app | `starter_ai_agents/ai_travel_agent` — single file, minimal dependencies |
| Understand RAG | `rag_tutorials/rag_chain` → `corrective_rag` → `agentic_rag_with_reasoning`, in that order |
| Local models only | `rag_tutorials/deepseek_local_rag_agent`, `local_rag_agent` |
| See MCP structure | `mcp_ai_agents/multi_mcp_agent_router` — the most instructive routing pattern |
| Still choosing a framework | `ai_agent_framework_crash_course/` — compares ADK and the OpenAI SDK |
| Need a frontend too | `generative_ui_agents/generative-ui-starter-project` (Node stack) |

### 7.6 Pre-Run Checklist

- [ ] Did you record the commit hash (essential since there are no releases)?
- [ ] Did you check whether `requirements.txt` pins versions?
- [ ] Are API keys injected as environment variables rather than hardcoded in the code?
- [ ] Did you set a cost cap (usage limit in the provider console)?
- [ ] If bringing this in-house, did you meet Apache-2.0 notice obligations (NOTICE file, marking changes)?
- [ ] Did you read the scripts yourself before installing an Agent Skill?

---

## 8. Adoption Guidance

| Situation | Verdict |
|---|---|
| Technical evaluation / PoC for a new LLM feature | **Suitable.** Cuts what would be days of exploration down to hours |
| Team onboarding / training material | **Suitable.** Difficulty ramps by category, so it can be turned into a curriculum |
| Idea generation | **Suitable.** The value as a catalog of problem definitions can exceed the value of the code itself |
| Foundation code for a production service | **Unsuitable.** Observability, stability, and security elements are entirely absent |
| Deep learning of a single framework | **Unsuitable.** That framework's official cookbook is the better choice |
| Long-term dependency | **Caution.** No releases or tags. Fork and pin it |

---

## 9. Summary

The real value of Awesome LLM Apps isn't the 118k stars — it's **the density of having "yes, this is possible too" collected in one place, in runnable form.** The 15 categories are close to a map of the current LLM application stack as of 2026, and the fact that the code actually runs puts it on a different level from most awesome lists.

At the same time, this repository is not a production asset. There are no releases, the stack differs template to template, the documentation has review gaps, and exceptions to the "self-contained" principle have already appeared. **Read it, take it apart, borrow the ideas — but don't ship it as-is.** That's the right way to use this repository.

A tool is a tool. 100 templates won't make the decisions for you.

---

## 10. Verification Criteria and Limitations

| Item | Detail |
|---|---|
| Data cutoff | 2026-07-23 |
| Primary source | `github.com/Shubhamsaboo/awesome-llm-apps` README and repository page |
| Numeric snapshot | Stars, forks, and language composition as of roughly mid-July 2026 |
| Not verifiable | Contributor count (graph page blocks automated access), whether individual templates actually work, a full enumeration of subdirectories |
| Unverified markers | Noted in the table in Section 2 |
| Unverified claims | The cost-reduction figures for LLM optimization tools (30–60%, 50–90%) are claims made by the repository and not independently verified |
| Limitations | Not every one of the 100+ templates was run. Code quality assessments generalize from a sample review |

---

*This document is provided for informational, technical-assessment purposes only and does not constitute a recommendation to adopt any specific tool or a basis for investment decisions. Figures are as of the stated cutoff date and are subject to change.*
