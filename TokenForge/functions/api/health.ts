import { jsonResponse } from "../../shared/http";
import type { Env } from "../../shared/types";
import { createStore } from "../../shared/storage";
import { resolveModel } from "../../shared/llm";

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const env = ctx.env;
  const store = createStore(env);
  return jsonResponse({
    ok: true,
    service: "tokenforge",
    version: "0.1.0",
    mode: env.DEEPSEEK_API_KEY ? "live" : "mock",
    model: resolveModel(env),
    storage: store ? store.backend : "browser-localStorage",
  });
};
