/**
 * LLM Quant Prompt — DeepSeek V4 Flash (gate/fast) + V4 Pro (quant).
 * Secrets: DEEPSEEK_API_KEY (never expose to Pages).
 */

import type { Env } from "./env";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL_FLASH = "deepseek-v4-flash";
const MODEL_PRO = "deepseek-v4-pro";

/** Browser / IP: 1 LLM request per 30s */
const LLM_COOLDOWN_MS = 30_000;
/** After non-finance reject: block IP for 60s (Cache API) */
const REJECT_TTL_SECONDS = 60;

const llmHits = new Map<string, number>();

export type LlmModelChoice = "flash" | "pro";

export type QuantPromptResult =
  | {
      ok: true;
      mode: "answer" | "python" | "hybrid";
      answer: string;
      python: string | null;
      model: string;
      finance: true;
    }
  | {
      ok: false;
      error: string;
      message: string;
      retryAfter?: number;
      finance?: false;
    };

function clientKey(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anon"
  );
}

export function checkLlmCooldown(
  request: Request
): { ok: true } | { ok: false; retryAfter: number } {
  const key = clientKey(request);
  const now = Date.now();
  const last = llmHits.get(key) ?? 0;
  const elapsed = now - last;
  if (elapsed < LLM_COOLDOWN_MS) {
    return { ok: false, retryAfter: Math.ceil((LLM_COOLDOWN_MS - elapsed) / 1000) };
  }
  llmHits.set(key, now);
  return { ok: true };
}

function rejectCacheKey(ip: string): string {
  return `https://vibequant.local/llm-reject/${encodeURIComponent(ip)}`;
}

export async function isFinanceRejectCached(request: Request): Promise<boolean> {
  try {
    const cache = caches.default;
    const hit = await cache.match(rejectCacheKey(clientKey(request)));
    return !!hit;
  } catch {
    return false;
  }
}

export async function markFinanceReject(request: Request): Promise<void> {
  try {
    const cache = caches.default;
    const res = new Response("1", {
      headers: {
        "Cache-Control": `public, max-age=${REJECT_TTL_SECONDS}`,
        "Content-Type": "text/plain",
      },
    });
    await cache.put(rejectCacheKey(clientKey(request)), res);
  } catch {
    /* best-effort */
  }
}

/** Cheap keyword prefilter before calling DeepSeek. */
export function heuristicFinance(prompt: string): "yes" | "no" | "maybe" {
  const p = prompt.toLowerCase();
  const deny = [
    "요리",
    "레시피",
    "날씨",
    "연애",
    "게임 공략",
    "숙제 대신",
    "recipe",
    "weather",
    "girlfriend",
    "boyfriend",
    "minecraft",
    "fortnite",
  ];
  if (deny.some((w) => p.includes(w.trim()))) return "no";

  const allow = [
    "주식",
    "종목",
    "퀀트",
    "백테스트",
    "모멘텀",
    "변동성",
    "포트폴리오",
    "코인",
    "비트코인",
    "이더",
    "crypto",
    "bitcoin",
    "ethereum",
    "stock",
    "equity",
    "ticker",
    "nvda",
    "aapl",
    "tsla",
    "etf",
    "sharpe",
    "rsi",
    "macd",
    "bollinger",
    "yahoo",
    "kospi",
    "kosdaq",
    "나스닥",
    "금융",
    "투자",
    "hedge",
    "option",
    "futures",
    "fx",
    "환율",
    "채권",
    "bond",
    "005930",
    "삼성",
    "finance",
    "quant",
    "backtest",
  ];
  if (allow.some((w) => p.includes(w))) return "yes";
  return "maybe";
}

async function deepseekChat(
  apiKey: string,
  model: string,
  system: string,
  user: string,
  maxTokens = 2048
): Promise<string> {
  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`DeepSeek HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek empty response");
  return content.trim();
}

async function classifyFinance(apiKey: string, prompt: string): Promise<boolean> {
  const heur = heuristicFinance(prompt);
  if (heur === "yes") return true;
  if (heur === "no") return false;

  const out = await deepseekChat(
    apiKey,
    MODEL_FLASH,
    `You are a strict classifier. Reply with ONLY YES or NO.
YES if the user asks about US stocks, Korean stocks, crypto, markets, trading, quant, backtest, portfolio risk, or other finance.
NO for everything else (cooking, weather, general chat, homework unrelated to finance).`,
    prompt.slice(0, 2000),
    16
  );
  return /^YES\b/i.test(out.trim());
}

const QUANT_SYSTEM = `You are Vibe Quant's multi-LLM committee assistant for an educational sandbox.
Scope: US stocks, Korean stocks, crypto, and related finance/quant only.

Return ONLY a single JSON object (no markdown fences) with keys:
{
  "mode": "answer" | "python" | "hybrid",
  "answer": "string — prose answer in the user's language",
  "python": "string|null — runnable browser Python for Pyodide, or null",
  "notes": "string — short assumptions / limits",
  "risks": "string — optional short risk / not investment advice note"
}

Rules:
- mode=answer: explanation only, python=null.
- mode=python: must run vi_browser code to compute (candles, indicators, backtest).
- mode=hybrid: short answer PLUS python that verifies with data.
- Python MUST use only: from vi_browser import get_candles, returns, volatility, moving_average, momentum, correlation, max_drawdown, rsi, macd, bollinger_bands, backtest, ma_cross_signal, show_chart
- get_candles is async: candles = await get_candles("NVDA", days=180, provider="yahoo")
- KR tickers: bare codes like "005930"; US: "NVDA"; prefer provider="yahoo".
- Prefer days<=180. Print metrics clearly. Use show_chart for series.
- Not investment advice. No secrets. No network except get_candles.
- If the question is not finance, still never answer it here (server already gates).`;

const PYTHON_DENY =
  /\b(import\s+os|import\s+sys|import\s+subprocess|from\s+os\b|eval\s*\(|exec\s*\(|__import__|open\s*\(|requests\.|urllib\.|socket\.|pathlib\.|asyncio\.create_subprocess)/i;

function sanitizePython(code: string | null): string | null {
  if (!code) return null;
  if (PYTHON_DENY.test(code)) {
    throw new Error("Generated Python rejected: disallowed imports/calls");
  }
  if (!/vi_browser|get_candles|show_chart|backtest|momentum|rsi|macd/.test(code)) {
    // Allow pure prints only if short; otherwise require vi_browser surface
    if (code.length > 80 && !/from\s+vi_browser\s+import/.test(code)) {
      throw new Error("Generated Python must import from vi_browser");
    }
  }
  return code;
}

function parseQuantJson(raw: string): {
  mode: "answer" | "python" | "hybrid";
  answer: string;
  python: string | null;
  notes: string;
  risks: string;
} {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) text = text.slice(start, end + 1);
  const obj = JSON.parse(text) as Record<string, unknown>;
  const modeRaw = String(obj.mode || "answer");
  const mode =
    modeRaw === "python" || modeRaw === "hybrid" || modeRaw === "answer"
      ? modeRaw
      : "answer";
  let python =
    typeof obj.python === "string" && obj.python.trim() ? obj.python.trim() : null;
  python = sanitizePython(python);
  if (mode === "python" && !python) {
    throw new Error("mode=python but python field empty");
  }
  return {
    mode: python && mode === "answer" ? "hybrid" : mode,
    answer: String(obj.answer || "").trim() || "(no answer)",
    python,
    notes: String(obj.notes || "").trim(),
    risks: String(obj.risks || "").trim(),
  };
}

export function deepseekConfigured(env: Env): boolean {
  return !!(env.DEEPSEEK_API_KEY && env.DEEPSEEK_API_KEY.length > 8);
}

export async function handleQuantPrompt(
  request: Request,
  env: Env,
  body: { prompt?: string; model?: string }
): Promise<QuantPromptResult> {
  if (!deepseekConfigured(env)) {
    return {
      ok: false,
      error: "DEEPSEEK_NOT_CONFIGURED",
      message: "Set DEEPSEEK_API_KEY via ./scripts/setup-deepseek.sh --remote",
    };
  }

  const prompt = (body.prompt || "").trim();
  if (prompt.length < 4) {
    return { ok: false, error: "EMPTY_PROMPT", message: "Prompt too short" };
  }
  if (prompt.length > 4000) {
    return { ok: false, error: "PROMPT_TOO_LONG", message: "Max 4000 characters" };
  }

  if (await isFinanceRejectCached(request)) {
    return {
      ok: false,
      error: "FINANCE_COOLDOWN",
      message: "Non-finance prompts are blocked for 1 minute after a reject.",
      retryAfter: REJECT_TTL_SECONDS,
      finance: false,
    };
  }

  const cool = checkLlmCooldown(request);
  if (!cool.ok) {
    return {
      ok: false,
      error: "RATE_LIMITED",
      message: "One LLM prompt per 30 seconds per browser/IP.",
      retryAfter: cool.retryAfter,
    };
  }

  const apiKey = env.DEEPSEEK_API_KEY!;
  let finance = false;
  try {
    finance = await classifyFinance(apiKey, prompt);
  } catch (err) {
    return {
      ok: false,
      error: "DEEPSEEK_GATE_ERROR",
      message: err instanceof Error ? err.message : "finance gate failed",
    };
  }

  if (!finance) {
    await markFinanceReject(request);
    return {
      ok: false,
      error: "FINANCE_ONLY",
      message:
        "Only US stocks, Korean stocks, crypto, and finance/quant questions are allowed. Retry after 1 minute.",
      retryAfter: REJECT_TTL_SECONDS,
      finance: false,
    };
  }

  const choice: LlmModelChoice = body.model === "flash" ? "flash" : "pro";
  const model = choice === "flash" ? MODEL_FLASH : MODEL_PRO;

  try {
    const raw = await deepseekChat(apiKey, model, QUANT_SYSTEM, prompt, 3500);
    const parsed = parseQuantJson(raw);
    const extras = [parsed.notes, parsed.risks].filter(Boolean);
    return {
      ok: true,
      mode: parsed.mode,
      answer: extras.length ? `${parsed.answer}\n\n— ${extras.join(" | ")}` : parsed.answer,
      python: parsed.python,
      model,
      finance: true,
    };
  } catch (err) {
    return {
      ok: false,
      error: "DEEPSEEK_ERROR",
      message: err instanceof Error ? err.message : "quant prompt failed",
    };
  }
}
