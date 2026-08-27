import { formatTestMessage, sendTelegramMessage } from "./alerts";
import { configFromEnv } from "./config";
import { Env } from "./env";
import { runArbitrageScan, signalsFromSnapshot } from "./scan";
import { kvStore, loadHistory, loadSnapshot } from "./storage";

/**
 * 크론 주기(5분)보다 짧게 잡아 엣지 캐시가 스냅샷보다 뒤처지지 않게 한다.
 *
 * `max-age=0` 이 반드시 필요하다 — `s-maxage` 만 주면 브라우저는 자체 휴리스틱으로
 * 응답을 캐시해서, 새 스냅샷이 나와도 대시보드가 옛 데이터를 계속 보여주고
 * 심지어 "stale N분 전" 경고까지 잘못 띄운다. 공유 캐시(엣지)만 240초 재사용한다.
 */
const PUBLIC_CACHE = "public, max-age=0, s-maxage=240, stale-while-revalidate=600";
const NO_STORE = "no-store";

function json(data: unknown, init: ResponseInit = {}, cache: string = PUBLIC_CACHE): Response {
  const status = init.status ?? 200;
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // 오류 응답은 절대 캐시하지 않는다. 401/502 가 s-maxage 로 엣지에 박히면
      // 토큰을 고치거나 업스트림이 살아나도 몇 분간 같은 오류가 반복된다.
      "Cache-Control": status >= 400 ? NO_STORE : cache,
      ...(init.headers as Record<string, string> | undefined),
    },
  });
}

/** 길이·내용 모두에 대해 조기 종료하지 않는 비교 (토큰 추측 시 타이밍 정보 차단) */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * 관리 토큰 인증.
 *
 * `Authorization: Bearer <token>` 를 우선한다 — 쿼리스트링 토큰은 Cloudflare 로그·
 * 브라우저 히스토리·Referer 헤더에 그대로 남기 때문에 권장하지 않는다.
 * `?token=` 은 로컬 curl 편의를 위해 남겨 둔 하위 호환 경로다.
 */
function isAuthorized(request: Request, env: Env): boolean {
  const expected = env.ADMIN_TOKEN;
  if (!expected) return false;

  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (bearer && safeEqual(bearer, expected)) return true;

  const token = new URL(request.url).searchParams.get("token");
  return token !== null && safeEqual(token, expected);
}

async function handleStatus(env: Env): Promise<Response> {
  const store = kvStore(env.ARB_DATA);
  const config = configFromEnv(env);
  const [snapshot, history] = await Promise.all([
    loadSnapshot(store),
    loadHistory(store),
  ]);
  // thresholdPct 를 함께 내려야 대시보드가 한 번의 응답으로 시그널을 판정할 수 있다.
  return json({
    ok: true,
    thresholdPct: config.signalThresholdPct,
    clearPct: config.signalClearPct,
    fxMode: config.fxMode,
    snapshot,
    history,
  });
}

async function handleSignals(env: Env): Promise<Response> {
  const store = kvStore(env.ARB_DATA);
  const snapshot = await loadSnapshot(store);
  const config = configFromEnv(env);
  return json({
    ok: true,
    thresholdPct: config.signalThresholdPct,
    clearPct: config.signalClearPct,
    fxMode: config.fxMode,
    signals: signalsFromSnapshot(snapshot, config.signalThresholdPct),
    updatedAt: snapshot?.fetchedAt ?? null,
  });
}

async function handleRefresh(request: Request, env: Env): Promise<Response> {
  if (!isAuthorized(request, env)) {
    return json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const result = await runArbitrageScan(env);
  // 관리자 전용 + 상태 변경 동작이므로 공유 캐시에 남기지 않는다.
  return json(result, { status: result.ok ? 200 : 502 }, NO_STORE);
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
  return json({ ok }, { status: ok ? 200 : 502 }, NO_STORE);
}

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  switch (url.pathname) {
    case "/api/status":
      return handleStatus(env);
    case "/api/signals":
      return handleSignals(env);
    case "/api/health":
      return json({ ok: true, time: Date.now() }, {}, NO_STORE);
    case "/api/refresh":
      return handleRefresh(request, env);
    case "/api/telegram/test":
      return handleTelegramTest(request, env);
    default:
      return json({ ok: false, error: "not found" }, { status: 404 });
  }
}
