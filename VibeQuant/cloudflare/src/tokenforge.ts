/**
 * TokenForge API — Korean/other prompts → English optimize via DeepSeek.
 * Reuses Worker DEEPSEEK_API_KEY (same secret as Play quant-prompt).
 * No finance gate: this is a coding-prompt optimizer, not a quant Q&A.
 */

import type { Env } from "./env";
import { deepseekConfigured } from "./llm-quant";
import {
  PLAN_SYSTEM,
  buildPlanUser,
  buildOptimizeSystem,
  buildOptimizeUser,
} from "../../../TokenForge/shared/prompts";
import { chat, parseJsonLoose, resolveModel } from "../../../TokenForge/shared/llm";
import type { Env as TfEnv } from "../../../TokenForge/shared/types";
import type { OptimizeResult, PlanDocument, PlanStep, TargetFamily } from "../../../TokenForge/shared/types";

const TF_COOLDOWN_MS = 12_000;
const MAX_SOURCE = 8_000;
const tfHits = new Map<string, number>();

export type TfHandlerResult = {
  status: number;
  body: unknown;
  extra?: Record<string, string>;
};

function clientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anon"
  );
}

function checkTfCooldown(
  request: Request
): { ok: true } | { ok: false; retryAfter: number } {
  const key = clientIp(request);
  const now = Date.now();
  const last = tfHits.get(key) ?? 0;
  const elapsed = now - last;
  if (elapsed < TF_COOLDOWN_MS) {
    return { ok: false, retryAfter: Math.ceil((TF_COOLDOWN_MS - elapsed) / 1000) };
  }
  tfHits.set(key, now);
  return { ok: true };
}

function asTfEnv(env: Env): TfEnv {
  return {
    DEEPSEEK_API_KEY: env.DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL: "deepseek-v4-flash",
    DEEPSEEK_BASE_URL: "https://api.deepseek.com",
  };
}

function toSteps(raw: unknown): PlanStep[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .map((s, i) => {
      const o = (s ?? {}) as Record<string, unknown>;
      return {
        id: String(o.id ?? `s${i + 1}`),
        title: String(o.title ?? `단계 ${i + 1}`),
        descriptionKo: String(o.descriptionKo ?? ""),
        draftPrompt: o.draftPrompt !== undefined ? String(o.draftPrompt) : undefined,
      };
    })
    .filter((s) => (s.title ?? "").trim().length > 0);
}

export async function handleTokenforge(
  request: Request,
  env: Env,
  pathname: string
): Promise<TfHandlerResult | null> {
  const base = pathname.replace(/\/+$/, "") || pathname;
  if (base !== "/api/v1/tokenforge" && !base.startsWith("/api/v1/tokenforge/")) {
    return null;
  }

  const route = base.slice("/api/v1/tokenforge".length) || "/";
  const method = request.method;

  if (method === "GET" && (route === "/" || route === "/health")) {
    const live = deepseekConfigured(env);
    return {
      status: 200,
      body: {
        ok: true,
        service: "tokenforge",
        version: "0.2.0",
        mode: live ? "live" : "mock",
        model: resolveModel(asTfEnv(env)),
        storage: "browser-localStorage",
        deepseek: { configured: live },
      },
    };
  }

  if (method === "GET" && route === "/memory") {
    return {
      status: 200,
      body: { ok: true, backend: "none", items: [] },
    };
  }

  if ((method === "POST" || method === "DELETE") && route === "/memory") {
    return {
      status: 200,
      body: {
        ok: false,
        error: "storage_not_configured",
        backend: "none",
        message: "Lab uses browser localStorage for memory.",
      },
    };
  }

  if (method === "POST" && route === "/plan") {
    return plan(request, env);
  }
  if (method === "POST" && route === "/optimize") {
    return optimize(request, env);
  }

  return {
    status: 404,
    body: {
      ok: false,
      error: "NOT_FOUND",
      message: "Use GET /health, POST /plan, POST /optimize",
      path: pathname,
    },
  };
}

async function plan(request: Request, env: Env): Promise<TfHandlerResult> {
  let body: { goal?: string; planLang?: string; constraints?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return { status: 400, body: { ok: false, error: "bad_request", message: "JSON body required" } };
  }
  const goal = (body.goal ?? "").trim();
  if (!goal) {
    return { status: 400, body: { ok: false, error: "bad_request", message: "goal is required" } };
  }
  if (goal.length > MAX_SOURCE) {
    return { status: 400, body: { ok: false, error: "bad_request", message: `goal max ${MAX_SOURCE} chars` } };
  }

  const cool = checkTfCooldown(request);
  if (!cool.ok && deepseekConfigured(env)) {
    return {
      status: 429,
      body: {
        ok: false,
        error: "RATE_LIMITED",
        message: `Wait ${cool.retryAfter}s between TokenForge LLM calls.`,
        retryAfter: cool.retryAfter,
      },
      extra: { "Retry-After": String(cool.retryAfter) },
    };
  }

  try {
    const { text, mode, model } = await chat({
      system: PLAN_SYSTEM,
      user: buildPlanUser({
        goal,
        planLang: body.planLang || "ko",
        constraints: body.constraints,
      }),
      env: asTfEnv(env),
      temperature: 0.3,
    });
    const parsed = (parseJsonLoose(text) ?? {}) as Record<string, unknown>;
    if (!parsed.wholePromptEn) {
      return {
        status: 500,
        body: {
          ok: false,
          error: "internal_error",
          message: `plan parse failed (mode=${mode}) ${text.slice(0, 180)}`,
        },
      };
    }
    const planDoc: PlanDocument = {
      title: String(parsed.title ?? goal.slice(0, 60)).trim(),
      goal,
      wholePromptEn: String(parsed.wholePromptEn).trim(),
      steps: toSteps(parsed.steps),
      risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
      outputs: Array.isArray(parsed.outputs) ? parsed.outputs.map(String) : [],
      explanationKo: String(parsed.explanationKo ?? "").trim(),
    };
    return { status: 200, body: { ok: true, plan: planDoc, mode, model } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { status: 500, body: { ok: false, error: "internal_error", message: msg } };
  }
}

async function optimize(request: Request, env: Env): Promise<TfHandlerResult> {
  let body: {
    source?: string;
    sourceLang?: string;
    targetFamily?: TargetFamily;
    extraInstruction?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return { status: 400, body: { ok: false, error: "bad_request", message: "JSON body required" } };
  }
  const source = (body.source ?? "").trim();
  if (!source) {
    return { status: 400, body: { ok: false, error: "bad_request", message: "source prompt is required" } };
  }
  if (source.length > MAX_SOURCE) {
    return { status: 400, body: { ok: false, error: "bad_request", message: `source max ${MAX_SOURCE} chars` } };
  }
  const family: TargetFamily = body.targetFamily === "chatgpt" ? "chatgpt" : "claude";

  const cool = checkTfCooldown(request);
  if (!cool.ok && deepseekConfigured(env)) {
    return {
      status: 429,
      body: {
        ok: false,
        error: "RATE_LIMITED",
        message: `Wait ${cool.retryAfter}s between TokenForge LLM calls.`,
        retryAfter: cool.retryAfter,
      },
      extra: { "Retry-After": String(cool.retryAfter) },
    };
  }

  try {
    const { text, mode, model } = await chat({
      system: buildOptimizeSystem({ targetFamily: family }),
      user: buildOptimizeUser({
        source,
        sourceLangLabel: body.sourceLang,
        targetFamily: family,
        extraInstruction: body.extraInstruction,
      }),
      env: asTfEnv(env),
      temperature: 0.2,
    });
    const parsed = (parseJsonLoose(text) ?? {}) as Record<string, unknown>;
    if (!parsed.optimized_prompt) {
      return {
        status: 500,
        body: {
          ok: false,
          error: "internal_error",
          message: `optimize parse failed (mode=${mode}) ${text.slice(0, 180)}`,
        },
      };
    }
    const result: OptimizeResult = {
      optimizedPrompt: String(parsed.optimized_prompt).trim(),
      summaryKo: String(parsed.summary_ko ?? "").trim(),
      changes: Array.isArray(parsed.changes) ? parsed.changes.map(String) : [],
      tips: Array.isArray(parsed.tips) ? parsed.tips.map(String) : [],
      targetFamily: family,
      mode,
      model,
    };
    return { status: 200, body: { ok: true, result } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { status: 500, body: { ok: false, error: "internal_error", message: msg } };
  }
}
