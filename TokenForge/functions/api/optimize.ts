import { jsonResponse, badRequest, serverError } from "../../shared/http";
import type { Env, OptimizeResult, TargetFamily } from "../../shared/types";
import { chat, parseJsonLoose } from "../../shared/llm";
import { buildOptimizeSystem, buildOptimizeUser, memoryToContext } from "../../shared/prompts";
import { createStore } from "../../shared/storage";

interface OptimizeBody {
  source?: string;
  sourceLang?: string;
  targetFamily?: TargetFamily;
  memoryId?: string;
  extraInstruction?: string;
  mode?: "live" | "mock" | "auto";
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;
  let body: OptimizeBody;
  try {
    body = (await ctx.request.json()) as OptimizeBody;
  } catch {
    return badRequest("JSON body required");
  }
  const source = (body.source ?? "").trim();
  if (!source) return badRequest("source prompt is required");
  const family: TargetFamily = body.targetFamily === "chatgpt" ? "chatgpt" : "claude";

  let memoryContext: string | undefined;
  if (body.memoryId) {
    const store = createStore(env);
    const mem = store ? await store.get(body.memoryId) : null;
    if (mem) memoryContext = memoryToContext(mem);
  }

  const clientKey = ctx.request.headers.get("x-deepseek-key") || undefined;
  try {
    const { text, mode, model } = await chat({
      system: buildOptimizeSystem({ targetFamily: family, memoryContext }),
      user: buildOptimizeUser({
        source,
        sourceLangLabel: body.sourceLang,
        targetFamily: family,
        extraInstruction: body.extraInstruction,
      }),
      env,
      clientKey,
      mode: body.mode,
      temperature: 0.2,
    });
    const parsed = (parseJsonLoose(text) ?? {}) as Record<string, unknown>;
    if (!parsed.optimized_prompt) {
      return serverError(`LLM 응답을 파싱하지 못했습니다. (mode=${mode}) 원문: ${text.slice(0, 200)}`);
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
    return jsonResponse({ ok: true, result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return serverError(msg.includes("deepseek http") ? msg : `optimize failed: ${msg}`);
  }
};
