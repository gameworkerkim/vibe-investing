---
name: tokenforge-ko-to-en-prompt-dashboard
description: 한국어·외국어 프롬프트를 DeepSeek으로 영어 최적화하고 Claude/ChatGPT 토큰 절약을 예측하는 브라우저 대시보드. Goal: 1) 전체 계획 프롬프트로 설계 → 2) 기억에 저장 → 3) 단계별 세부 프롬프트를 한국어로 작성 → 4) DeepSeek(v4-flash)로 영어 최적화 → 5) 토큰 절약(Claude/ChatGPT) 예측 → 6) SKILL.md 로 내보내기.
metadata:
  source: TokenForge
  goal: 한국어 프롬프트를 영어로 최적화하고 토큰 절약을 예측하는 웹 변환기 구축
---

# TokenForge 예시 스킬 — 한국어 → 영어 프롬프트 최적화 대시보드

> 이 파일은 TokenForge ⑤스킬 탭이 만드는 SKILL.md의 **샘플**입니다.

## Overall Planning Prompt

Plan this project end-to-end first, then output: 1) goal restated, 2) constraints (free tier, no external DB beyond optional Upstash/Neon, browser converter), 3) deliverables (static page, Pages Functions API, memory, token estimator, skill exporter), 4) ordered verifiable steps, 5) risks (token accuracy, translation quality), 6) the overall-planning prompt and per-step prompts. Be concise.

## Steps Overview

- 1. 아키텍처/스택 확정
- 2. 전체 계획 프롬프트 + 계획 API
- 3. 영어 최적화(Forge) API
- 4. 기억(Memory) 저장소
- 5. 대시보드 UI
- 6. 스킬 빌더

## Step 1: 아키텍처/스택 확정

Purpose: 목표를 Cloudflare Pages free tier로 실현할 구조를 정한다.

<source-draft>
토큰 절약 프롬프트 변환기를 Cloudflare Pages 무료 티어로 만들 거야. 정적 프론트 + API 함수 + 기억 저장소(KV/Upstash 폴백) 구조를 제안해줘.
</source-draft>

<optimized-prompt>
Architect a token-saving prompt converter on Cloudflare Pages free tier. Propose: (a) static frontend structure, (b) Pages Functions API endpoints (plan, optimize, memory), (c) memory storage with KV default and Upstash Redis fallback. Return a compact file/module tree and request flow. Keep it concise; no intro.
</optimized-prompt>

## Step 2: 전체 계획 프롬프트 + 계획 API

<source-draft>
사용자 목표를 받아서 "전체 계획 프롬프트"를 만들고, 그 계획을 단계(세부 프롬프트 초안 포함)로 분해해 JSON으로 돌려주는 함수를 만들어줘.
</source-draft>

<optimized-prompt>
Build a Pages Function POST /api/plan: input {goal, planLang, constraints}; call DeepSeek (mock fallback) to produce a PlanDocument JSON {title, goal, wholePromptEn, steps[{id,title,descriptionKo,draftPrompt}], risks, outputs, explanationKo}. Parse with fence-stripping JSON parser. Return envelope {ok, plan, mode, model}. Handle errors and empty goal (400).
</optimized-prompt>

## Step 3: 영어 최적화(Forge) API

<source-draft>
한국어나 외국어로 된 프롬프트를 받아서, 의미는 그대로 두고 토큰을 아끼는 영어 프롬프트로 바꿔줘. 대상 모델(Claude/ChatGPT)별로 다르게 해주고, 무엇을 바꿨는지 한국어 요약과 팁도 줘.
</source-draft>

<optimized-prompt>
Build POST /api/optimize: accept {source, sourceLang, targetFamily(claude|chatgpt), memoryId?, extraInstruction?}; send to DeepSeek with a system prompt enforcing: English output, 100% intent preservation, token-efficient rewrite (remove filler/redundancy; structure only when it pays), verbatim code/paths. Response JSON must contain optimized_prompt, summary_ko, changes[], tips[]. Attach project memory context when memoryId provided (mini-RAG). Mock fallback when no key.
</optimized-prompt>

## Step 4: 기억(Memory) 저장소

<source-draft>
계획/프롬프트를 저장하고 검색하는 기억 기능을 만들어줘. 로컬(KV)이 기본이고, 설정되면 Upstash Redis REST 를 쓰고, 없으면 브라우저 localStorage 로 폴백해줘.
</source-draft>

<optimized-prompt>
Implement a MemoryStore with adapters selected by env: Cloudflare KV (default, prefix "mem:"), Upstash Redis REST (optional, uses an index key for listing), browser localStorage (client fallback). Entry: {id, kind(project|prompt|wiki|skill), title, tags[], content, plan?, sourceText?, optimizedText?, targetFamily?, createdAt, updatedAt}. Expose save (upsert), get, list(q/kind/limit), del. Expose GET/POST/DELETE /api/memory and report backend via /api/health.
</optimized-prompt>

## Step 5: 대시보드 UI

<source-draft>
대시보드 화면을 만들자. 워크플로(파이프라인 설명), 계획 생성, 프롬프트 최적화, 기억 목록, 스킬 생성, 설정 탭이 있어야 해. 토큰 절약은 원문 vs 최적화문을 Claude와 ChatGPT로 나눠 보여줘.
</source-draft>

<optimized-prompt>
Build the dashboard UI as dependency-free vanilla HTML/CSS/JS served statically by Pages. Tabs: 워크플로 (pipeline explainer + whole-planning-prompt template), 계획 (goal → /api/plan, editable per-step draft prompts in Korean/foreign language), 최적화 (source → /api/optimize; show optimized English prompt, summary, changes, tips), 기억 (searchable list with load/copy/delete), 스킬 (SKILL.md preview/download), 설정 (DeepSeek key/base/model, prices, tiktoken precision toggle). Render Claude/ChatGPT token-savings cards (before/after/saved %, bar, cost) computed by an embedded estimator and, when enabled, gpt-tokenizer via CDN for ChatGPT.
</optimized-prompt>

## Step 6: 스킬 빌더

<source-draft>
현재 계획과 최적화된 프롬프트들을 묶어서 SKILL.md(프론트매터 포함)를 만들어 다운로드하게 해줘.
</source-draft>

<optimized-prompt>
Add a skill builder that bundles the active plan (wholePromptEn + steps) or a chosen memory entry into a SKILL.md with frontmatter {name, description, metadata.goal}. Include Steps Overview and per-step sections containing <source-draft> (original language) and <optimized-prompt> (English). Provide copy + download (.md) + install-path hints for Claude Code and opencode.
</optimized-prompt>

## Tags

- tokenforge
- prompt-optimization
- korean-english
- cloudflare-pages
- deepseek
- skill
