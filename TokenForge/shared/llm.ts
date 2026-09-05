/** DeepSeek(OpenAI 호환) 채팅 클라이언트 + 로컬/테스트용 mock 모드. */

import type { Env } from "./types";
import { mockOptimizeJson, mockPlanJson } from "./mock";

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
    let goal = "프로젝트 목표";
    try {
      const parsed = JSON.parse(user) as { goal?: string };
      if (parsed.goal) goal = parsed.goal;
    } catch {
      /* ignore */
    }
    return mockPlanJson(goal);
  }
  return mockOptimizeJson(user);
}
