/** DeepSeek(OpenAI 호환) 채팅 클라이언트 + 로컬/테스트용 mock 모드. */

import type { Env } from "./types";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCallParams {
  system: string;
  user: string;
  env: Env;
  /** 클라이언트가 보낸 DeepSeek 키 (옵션). env.DEEPSEEK_API_KEY 보다 우선. */
  clientKey?: string;
  /** 모드 강제: live|mock|auto (auto: 키 없으면 mock) */
  mode?: "live" | "mock" | "auto";
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface ChatResult {
  text: string;
  mode: "live" | "mock";
  model: string;
  raw?: unknown;
}

const DEFAULT_BASE = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-v4-flash";

export function resolveModel(env: Env, model?: string): string {
  return model || env.DEEPSEEK_MODEL || DEFAULT_MODEL;
}

function resolveBaseUrl(env: Env): string {
  const b = (env.DEEPSEEK_BASE_URL || DEFAULT_BASE).trim().replace(/\/+$/, "");
  return b.endsWith("/v1") || b.endsWith("/chat") ? b : `${b}/chat/completions`;
}

/** JSON만 응답하도록 강제. 시스템 프롬프트에 "json" 단어 포함 필요(DeepSeek 제약). */
export async function chat(p: ChatCallParams): Promise<ChatResult> {
  const apiKey = p.clientKey?.trim() || p.env.DEEPSEEK_API_KEY?.trim() || "";
  const mode = p.mode === "auto" || !p.mode ? (apiKey ? "live" : "mock") : p.mode;
  const model = resolveModel(p.env, p.model);

  if (mode === "mock") {
    return { text: await mockReply(p.system, p.user), mode: "mock", model: `${model} (mock)` };
  }

  const base = resolveBaseUrl(p.env);
  const resp = await fetch(base, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: p.system },
        { role: "user", content: p.user },
      ],
      temperature: p.temperature ?? 0.2,
      max_tokens: p.maxTokens ?? 4096,
      response_format: { type: "json_object" },
      stream: false,
    }),
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`deepseek http ${resp.status}: ${body.slice(0, 300)}`);
  }
  const data = (await resp.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("deepseek empty content");
  return { text, mode: "live", model, raw: data };
}

/** 코드펜스/전후 잡음을 제거하고 JSON 파싱. 실패 시 null. */
export function parseJsonLoose(text: string): unknown | null {
  let t = text.trim();
  const fence = t.match(/^```(?:json)?\s*([\s\S]*?)```$/);
  if (fence) t = fence[1].trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first >= 0 && last > first) t = t.slice(first, last + 1);
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Mock: 키 없는 로컬 개발/테스트용 결정적 응답(실제 LLM 아님).
// 시스템 프롬프트를 보고 어느 작업인지 구분한다.
// ---------------------------------------------------------------------------
async function mockReply(system: string, user: string): Promise<string> {
  if (system.includes("planning engine")) {
    return mockPlan(user);
  }
  return mockOptimize(user);
}

function detectSourceLang(s: string): string {
  const hangul = (s.match(/[가-힣]/g) || []).length;
  if (hangul > 3) return "ko";
  const han = (s.match(/[\u4e00-\u9fff]/g) || []).length;
  if (han > 3) return "zh";
  const kana = (s.match(/[\u3040-\u30ff]/g) || []).length;
  if (kana > 3) return "ja";
  return "en";
}

function extractRequest(source: string): string {
  const m = source.match(/<request>([\s\S]*?)<\/request>/);
  return (m ? m[1] : source).trim();
}

function mockOptimize(user: string): string {
  const src = extractRequest(user);
  const lang = detectSourceLang(src);
  const isEn = lang === "en";
  const line = src
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ");
  const optimized = isEn
    ? `TASK\n${line}\n\nCONSTRAINTS\n- Keep output minimal and precise.\n- Return only the requested artifact.`
    : `(mock) Optimized English equivalent of the ${lang} request above. Structural shell (rule-based demo, not an LLM translation):\n\nROLE\nYou are a precise assistant.\n\nTASK\n${line.slice(0, 400)}\n\nRULES\n- Answer in English unless asked otherwise.\n- Be concise; no filler.\n- Preserve any code/paths verbatim.`;
  return JSON.stringify({
    optimized_prompt: optimized,
    summary_ko: `[mock] 원문(${lang})을 규칙 기반으로 영어 껍데기로 재구성했습니다. 실제 번역·압축은 DeepSeek API 키 설정 후 live 모드에서 수행됩니다.`,
    changes: [
      "원문 언어 감지: " + lang,
      "불필요한 문장부호/빈 줄 제거",
      "역할·작업·규칙 3단 구조화 (데모)",
    ],
    tips: [
      "토큰 절약 예상치는 프롬프트 본문 기준이며 mock 결과에는 미적용됩니다.",
      "실제 절감을 보려면 설정에서 DeepSeek 키를 입력하세요.",
    ],
  });
}

function mockPlan(user: string): string {
  let goal = "프로젝트 목표";
  try {
    const parsed = JSON.parse(user) as { goal?: string };
    if (parsed.goal) goal = parsed.goal;
  } catch {
    /* ignore */
  }
  const g = goal.trim() || "프로젝트 목표";
  const steps = [
    {
      id: "s1",
      title: "요구사항 분석 & 범위 확정",
      descriptionKo: "목표·제약·산출물을 명확히 하고 모호한 항목을 질문으로 정리한다.",
      draftPrompt: `[mock] ${g} 의 범위를 확정해줘. 요구사항, 제약, 산출물, 확인이 필요한 질문 목록을 한국어로 만들어줘.`,
    },
    {
      id: "s2",
      title: "아키텍처/구조 설계",
      descriptionKo: "디렉터리·모듈·데이터 흐름을 설계한다.",
      draftPrompt: `[mock] ${g} 를 위한 구조(폴더/모듈/흐름)를 제안해줘.`,
    },
    {
      id: "s3",
      title: "단계별 구현 프롬프트 작성",
      descriptionKo: "각 구현 단계를 독립 실행 가능한 세부 프롬프트로 분해한다.",
      draftPrompt: `[mock] ${g} 를 검증 가능한 단계로 나누고 각 단계 프롬프트를 작성해줘.`,
    },
  ];
  const whole =
    `Plan this project end-to-end first, then output: 1) goal restated, 2) constraints, ` +
    `3) deliverables, 4) ordered verifiable steps, 5) risks, 6) the overall-planning prompt and per-step prompts. ` +
    `Project: ${g}. Be concise.`;
  return JSON.stringify({
    title: g.slice(0, 60),
    goal: g,
    wholePromptEn: whole,
    steps,
    risks: ["범위 비대화 → 단계별 수용 기준(acceptance check)으로 방어"],
    outputs: ["전체 계획 프롬프트", "단계별 세부 프롬프트", "스킬(SKILL.md) 번들"],
    explanationKo:
      "[mock] 전체 계획 프롬프트는 프로젝트를 목표→제약→산출물→단계→리스크 순으로 분해하도록 지시합니다. 이 대시보드는 그 계획을 기억에 저장하고, 각 단계를 세부 프롬프트로 만들어 DeepSeek로 영어 최적화합니다.",
  });
}
