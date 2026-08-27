import { formatTestMessage, sendTelegramMessage } from "./alerts";
import { configFromEnv } from "./config";
import { Env } from "./env";
import { runArbitrageScan, signalsFromSnapshot } from "./scan";
import { kvStore, loadHistory, loadSnapshot } from "./storage";

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=240, stale-while-revalidate=600",
      ...(init.headers as Record<string, string>),
    },
  });
}

function isAuthorized(request: Request, env: Env): boolean {
  if (!env.ADMIN_TOKEN) return false;
  const token = new URL(request.url).searchParams.get("token");
  return token !== null && token === env.ADMIN_TOKEN;
}

async function handleStatus(env: Env): Promise<Response> {
  const store = kvStore(env.ARB_DATA);
  const [snapshot, history] = await Promise.all([
    loadSnapshot(store),
    loadHistory(store),
  ]);
  return json({ ok: true, snapshot, history });
}

async function handleSignals(env: Env): Promise<Response> {
  const store = kvStore(env.ARB_DATA);
  const snapshot = await loadSnapshot(store);
  const config = configFromEnv(env);
  return json({
    ok: true,
    thresholdPct: config.signalThresholdPct,
    clearPct: config.signalClearPct,
    signals: signalsFromSnapshot(snapshot, config.signalThresholdPct),
    updatedAt: snapshot?.fetchedAt ?? null,
  });
}

async function handleRefresh(request: Request, env: Env): Promise<Response> {
  if (!isAuthorized(request, env)) {
    return json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const result = await runArbitrageScan(env);
  return json(result, { status: result.ok ? 200 : 502 });
}

async function handleTelegramTest(request: Request, env: Env): Promise<Response> {
  if (!isAuthorized(request, env)) {
    return json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return json(
      { ok: false, error: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not configured" },
      { status: 503 }
    );
  }
  const ok = await sendTelegramMessage(
    env.TELEGRAM_BOT_TOKEN,
    env.TELEGRAM_CHAT_ID,
    formatTestMessage()
  );
  return json({ ok });
}

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  switch (url.pathname) {
    case "/api/status":
      return handleStatus(env);
    case "/api/signals":
      return handleSignals(env);
    case "/api/health":
      return json({ ok: true, time: Date.now() });
    case "/api/refresh":
      return handleRefresh(request, env);
    case "/api/telegram/test":
      return handleTelegramTest(request, env);
    default:
      return json({ ok: false, error: "not found" }, { status: 404 });
  }
}
