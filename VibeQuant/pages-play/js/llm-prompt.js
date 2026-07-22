/**
 * LLM Quant Prompt client — calls Worker, optional Pyodide run.
 * Browser cooldown: 30s (mirrors Worker). Archive deferred.
 */

const COOLDOWN_MS = 30_000;
const STORAGE_KEY = "vq_llm_last_at";

function apiBase() {
  const cfg = globalThis.RUNTIME_CONFIG;
  return String(cfg?.VIBEQUANT_API_BASE || globalThis.VIBEQUANT_API_BASE || "").replace(/\/$/, "");
}

export function llmCooldownRemainingMs() {
  const last = Number(localStorage.getItem(STORAGE_KEY) || 0);
  const left = COOLDOWN_MS - (Date.now() - last);
  return left > 0 ? left : 0;
}

export function markLlmSent() {
  localStorage.setItem(STORAGE_KEY, String(Date.now()));
}

/**
 * @param {{ prompt: string, model?: "pro"|"flash" }} opts
 */
export async function requestQuantPrompt({ prompt, model = "pro" }) {
  const left = llmCooldownRemainingMs();
  if (left > 0) {
    return {
      ok: false,
      error: "RATE_LIMITED",
      message: `Wait ${Math.ceil(left / 1000)}s (1 prompt / 30s per browser).`,
      retryAfter: Math.ceil(left / 1000),
    };
  }

  const base = apiBase();
  if (!base) {
    return {
      ok: false,
      error: "NO_API_BASE",
      message: "VIBEQUANT_API_BASE missing — deploy Worker / runtime-config.js",
    };
  }

  const res = await fetch(`${base}/api/v1/llm/quant-prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    return { ok: false, error: "BAD_RESPONSE", message: `HTTP ${res.status}` };
  }

  // Count toward 30s cooldown unless Worker key is missing / bad JSON client-side
  if (data.error !== "DEEPSEEK_NOT_CONFIGURED" && data.error !== "NO_API_BASE") {
    markLlmSent();
  }

  if (!res.ok || data.ok === false) {
    return {
      ok: false,
      error: data.error || "HTTP_ERROR",
      message: data.message || `HTTP ${res.status}`,
      retryAfter: data.retryAfter,
    };
  }
  return data;
}
