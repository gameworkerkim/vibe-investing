import { jsonResponse, badRequest, serverError } from "../../shared/http";
import type { Env, PlanDocument, PlanStep } from "../../shared/types";
import { chat, parseJsonLoose } from "../../shared/llm";
import { PLAN_SYSTEM, buildPlanUser } from "../../shared/prompts";

interface PlanBody {
  goal?: string;
  planLang?: string;
  constraints?: string;
  mode?: "live" | "mock" | "auto";
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
      } as PlanStep;
    })
    .filter((s) => (s.title ?? "").trim().length > 0);
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;
  let body: PlanBody;
  try {
    body = (await ctx.request.json()) as PlanBody;
  } catch {
    return badRequest("JSON body required");
  }
  const goal = (body.goal ?? "").trim();
  if (!goal) return badRequest("goal is required");

  const clientKey = ctx.request.headers.get("x-deepseek-key") || undefined;
  try {
    const { text, mode, model } = await chat({
      system: PLAN_SYSTEM,
      user: buildPlanUser({
        goal,
        planLang: body.planLang || "ko",
        constraints: body.constraints,
      }),
      env,
      clientKey,
      mode: body.mode,
      temperature: 0.3,
    });
    const parsed = (parseJsonLoose(text) ?? {}) as Record<string, unknown>;
    if (!parsed.wholePromptEn) {
      return serverError(`plan 응답 파싱 실패 (mode=${mode}) 원문: ${text.slice(0, 200)}`);
    }
    const plan: PlanDocument = {
      title: String(parsed.title ?? goal.slice(0, 60)).trim(),
      goal,
      wholePromptEn: String(parsed.wholePromptEn).trim(),
      steps: toSteps(parsed.steps),
      risks: Array.isArray(parsed.risks) ? parsed.risks.map(String) : [],
      outputs: Array.isArray(parsed.outputs) ? parsed.outputs.map(String) : [],
      explanationKo: String(parsed.explanationKo ?? "").trim(),
    };
    return jsonResponse({ ok: true, plan, mode, model });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return serverError(msg.includes("deepseek http") ? msg : `plan failed: ${msg}`);
  }
};
