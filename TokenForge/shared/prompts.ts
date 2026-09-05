/** TokenForge 프롬프트 엔지니어링 — 시스템 프롬프트 & 빌더. */

export interface OptimizeSystemOptions {
  targetFamily: "claude" | "chatgpt";
  /** 참고할 기억 컨텍스트(프로젝트 설계 등) — 있으면 추천 품질 향상(미니 RAG) */
  memoryContext?: string;
}

/**
 * 최적화(번역+압축) 시스템 프롬프트.
 * 원문이 영어면 간결화만, 한국어/외국어면 영어로 번역하면서 토큰 효율 최적화.
 */
export function buildOptimizeSystem(opts: OptimizeSystemOptions): string {
  const target =
    opts.targetFamily === "claude"
      ? "Claude (Anthropic) — Claude Code / Claude.ai"
      : "ChatGPT (OpenAI) — GPT 시리즈";
  const ctx = opts.memoryContext
    ? `\n\n[PROJECT MEMORY — 참고할 프로젝트 전반 컨텍스트]\n${opts.memoryContext}\n이 컨텍스트를 활용해 누락된 전제를 채우고, 모순 없이 프롬프트를 정제할 것.\n`
    : "";
  return `You are a senior prompt engineer and precise translator.
Task: take the user's raw request (written in Korean or any other language, sometimes already English) and rewrite it into a single, high-quality, token-efficient English prompt optimized for ${target}.

HARD RULES
1. Output ENGLISH only inside the optimized_prompt field. Do NOT leave the original language in optimized_prompt (keep only proper nouns, identifiers, file paths, code, URLs, and exact terms verbatim).
2. Preserve 100% of the user's requirements, constraints, and intent. NEVER drop or invent requirements. Compression must not change meaning.
3. Apply modern token-saving techniques:
   - Remove filler, hedging, polite rephrasing, repetition, and empty connectors ("please", "I'd like you to", "basically", "as you know", etc.).
   - Use terse, imperative, unambiguous phrasing.
   - Structure only when it pays for itself (role/context/task/constraints/output format). For Claude prefer short XML-style tags or clean sections ONLY if they reduce ambiguity; for ChatGPT prefer concise numbered/plain-markdown structure. Do not add boilerplate sections the request does not need.
   - Compress long descriptions without losing technical precision.
4. Where the request is ambiguous but resolvable, resolve minimally; otherwise add a single bracketed short note such as "[assume: ...]" instead of verbose questions.
5. Keep code blocks, paths, and example data byte-for-byte intact.

RETURN ONLY valid JSON with exactly these keys:
{
  "optimized_prompt": "<the refined English prompt>",
  "summary_ko": "<2-3 sentence Korean summary of what you changed and why>",
  "changes": ["<bullet, Korean>", "..."],
  "tips": ["<1 actionable recommendation to use with ${target}, Korean>", "..."]
}
Do not wrap in markdown fences. No text before or after the JSON.${ctx}`;
}

export interface OptimizeUserParams {
  source: string;
  sourceLangLabel?: string;
  targetFamily: "claude" | "chatgpt";
  extraInstruction?: string;
}

export function buildOptimizeUser(p: OptimizeUserParams): string {
  const src = p.source.trim();
  const extra = p.extraInstruction?.trim()
    ? `\n\nAdditional user direction (must be honored):\n${p.extraInstruction.trim()}`
    : "";
  const lang = p.sourceLangLabel
    ? `(source language detected: ${p.sourceLangLabel})`
    : "";
  return `RAW REQUEST ${lang}:\n<request>\n${src}\n</request>\n
Rewrite it now into an optimized English prompt per the system rules.${extra}`;
}

/**
 * 전체 계획 프롬프트 — 사용자가 Claude/ChatGPT 에 던져 "전체 프로젝트를 계획"시키는
 * 마스터 프롬프트 템플릿(영어). 화면에서 설명용으로도 쓰임.
 */
export const MASTER_PLAN_PROMPT_TEMPLATE = `You are a senior engineering manager and system architect.
Plan the following project end-to-end BEFORE any code or writing begins. Do not start executing.

1. GOAL — restate the user's goal in one precise sentence.
2. CONTEXT & CONSTRAINTS — list assumptions, limits (budget/tokens/time), must-nots, and unknown items needing clarification.
3. DELIVERABLES — enumerate the concrete artifacts/outputs (files, pages, documents, code, skills).
4. WORK BREAKDOWN — split into ordered, independently verifiable steps. For each step give: title, purpose, and the acceptance check that proves it done.
5. RISKS — top risks and a mitigation each.
6. PLAN PROMPT — write the single English "overall planning prompt" an AI should follow, and the per-step detailed prompts to execute later.

Output a compact, structured plan. Prefer bullet density over prose.`;

/**
 * 계획 생성(LLM) 시스템 프롬프트 — 마스터 템플릿을 실행해 구조화된 PlanDocument JSON 생성.
 */
export const PLAN_SYSTEM = `You are a planning engine. Given a user goal, run the "overall planning prompt" methodology below and produce a structured plan in the requested language.

Return ONLY valid JSON (no markdown fences, no extra text) with this shape:
{
  "title": "<project title>",
  "goal": "<restated single-sentence goal>",
  "wholePromptEn": "<the polished ENGLISH overall-planning prompt for Claude/ChatGPT — concise and token-efficient>",
  "steps": [
    {"id": "s1", "title": "<step title>", "descriptionKo": "<what this step does, plan language>", "draftPrompt": "<a starting draft for this step's detailed prompt — write it in the plan language>"}
  ],
  "risks": ["<risk + mitigation>"],
  "outputs": ["<deliverable>"],
  "explanationKo": "<2-4 sentence Korean explanation of how the whole-planning prompt decomposes the project>"
}
Aim for 4-8 steps. Each step must be independently verifiable.`;

export interface PlanUserParams {
  goal: string;
  planLang: string;
  constraints?: string;
}

export function buildPlanUser(p: PlanUserParams): string {
  return JSON.stringify({
    goal: p.goal,
    language_for_plan_text: p.planLang,
    constraints_or_context: p.constraints?.trim() || null,
  });
}

/** 기억 항목 하나를 컨텍스트 텍스트로. */
export function memoryToContext(entry: {
  kind: string;
  title: string;
  content?: string;
  plan?: { wholePromptEn?: string; steps?: { title: string; draftPrompt?: string }[] } | null;
  optimizedText?: string | null;
}): string {
  const lines: string[] = [`[${entry.kind}] ${entry.title}`];
  if (entry.plan?.wholePromptEn) lines.push(`overall-plan: ${entry.plan.wholePromptEn}`);
  if (entry.plan?.steps?.length) {
    lines.push(
      "steps: " +
        entry.plan.steps
          .map((s) => `- ${s.title}${s.draftPrompt ? `: ${s.draftPrompt}` : ""}`)
          .join("\n")
    );
  }
  if (entry.content) lines.push(`notes: ${entry.content}`);
  if (entry.optimizedText) lines.push(`optimized_prompt: ${entry.optimizedText}`);
  return lines.join("\n");
}

/** 스킬(SKILL.md) 생성 — 프로젝트 계획/프롬프트 묶음을 Claude·opencode 스킬 포맷으로. */
export function buildSkillMarkdown(input: {
  title: string;
  goal: string;
  wholePromptEn?: string;
  steps: { title: string; descriptionKo?: string; draftPrompt?: string; optimizedPrompt?: string }[];
  tags?: string[];
}): string {
  const { title, goal, wholePromptEn, steps, tags = [] } = input;
  const safeName =
    title
      .toLowerCase()
      .replace(/[^a-z0-9\u3131-\uD79D]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "tokenforge-skill";
  const header = steps
    .map((s, i) => `- ${i + 1}. ${s.title}`)
    .join("\n");
  const body = steps
    .map((s, i) => {
      const desc = s.descriptionKo ? `\nPurpose: ${s.descriptionKo}` : "";
      const draft = s.draftPrompt ? `\n<source-draft>${s.draftPrompt}</source-draft>` : "";
      const opt = s.optimizedPrompt ? `\n<optimized-prompt>\n${s.optimizedPrompt}\n</optimized-prompt>` : "";
      return `## Step ${i + 1}: ${s.title}${desc}${draft}${opt}`;
    })
    .join("\n\n");
  const whole = wholePromptEn
    ? `## Overall Planning Prompt\n\n${wholePromptEn}\n`
    : "";
  const tagList = ["tokenforge", ...tags.map((t) => t.toLowerCase().replace(/\s+/g, "-"))]
    .filter(Boolean)
    .map((t) => `- ${t}`)
    .join("\n");
  return `---
name: ${safeName}
description: ${title} — 전체 계획 프롬프트와 세부 프롬프트(영어 최적화) 번들. 프로젝트 전반을 이해하고 단계별로 실행. Goal: ${goal.slice(0, 200)}
metadata:
  source: TokenForge
  goal: ${goal}
---

# ${title}

${whole}
## Steps Overview

${header}

${body}
## Tags

${tagList}
`;
}
