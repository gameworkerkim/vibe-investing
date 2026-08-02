// Leaf — 모바일 화보집 뷰어 (Cloudflare Worker)
// 라우트: vibequant.cc/Leaf*
// - 정적 뷰어: ASSETS 바인딩 (public/)
// - 이미지: R2 leaf-images (업로드 시 워터마크 사전 합성 — CPU 10ms 회피)
// - 캡처 알림: D1 capture_alerts
// - 보안(로드맵 1단계): 세션 필수화 + 서명 URL + 레이트리밋 + 관리자 로그/신뢰소스
//   근거: docs/05-보안-개선-로드맵.md

export interface Env {
  leaf_images: R2Bucket;
  leaf_db: D1Database;
  ASSETS: Fetcher;
  LEAF_SIG_SECRET: string;      // 서명 URL HMAC 키 (secret)
  LEAF_ADMIN_TOKEN: string;     // 관리자 로그 조회 토큰 (secret)
  LEAF_RATE_LIMIT_PER_MIN?: string; // 세션당 분당 이미지 허용 수 (기본 15)
  LEAF_IP_LIMIT_PER_MIN?: string;   // IP당 분당 이미지 허용 수 (기본 60)
}

const BASE = '/Leaf';
const SIG_TTL = 120;            // 서명 URL 유효시간 (초)
const DEF_RATE_LIMIT = 15;
const DEF_IP_LIMIT = 60;
const ALERT_LIMIT_PER_MIN = 5;  // 캡처 알림 쓰기 상한 (세션·분)
const META_LIMIT_PER_MIN = 10;  // 메타 조회 상한 (세션·분)
const ALERT_DETAILS = new Set(['contextmenu', 'print_attempt', 'devtools_open', 'mobile_visibility_spike']);

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function securityHeaders(headers: Headers): Headers {
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return headers;
}

async function serveViewer(env: Env): Promise<Response> {
  const res = await env.ASSETS.fetch(new Request('https://leaf.local/index.html'));
  const headers = securityHeaders(new Headers(res.headers));
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'public, max-age=60');
  return new Response(res.body, { status: res.status, headers });
}

async function serveAsset(env: Env, assetPath: string): Promise<Response> {
  const res = await env.ASSETS.fetch(new Request('https://leaf.local' + assetPath));
  if (res.status === 404) return json({ error: 'not_found' }, 404);
  const headers = securityHeaders(new Headers(res.headers));
  return new Response(res.body, { status: res.status, headers });
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

function newSessionId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// 유효한 세션 쿠키만 수용 (형식: 32자 hex). 존재/형식 불일치 시 null.
function getSessionId(request: Request): string | null {
  const sid = parseCookies(request.headers.get('Cookie')).leaf_sid || '';
  return /^[a-f0-9]{32}$/i.test(sid) ? sid : null;
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

// ── D1 기반 슬라이딩 분당 레이트리밋 (scope: 세션·IP·엔드포인트별) ──
async function rateLimited(env: Env, scope: string, limit: number): Promise<{ ok: boolean; retryAfter: number }> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / 60) * 60;
  const key = `${scope}:${windowStart}`;

  await env.leaf_db
    .prepare(
      `INSERT INTO rate_limits (key, window_start, count) VALUES (?1, ?2, 1)
       ON CONFLICT (key, window_start) DO UPDATE SET count = count + 1`
    )
    .bind(key, windowStart)
    .run();

  const { results } = await env.leaf_db
    .prepare(`SELECT count FROM rate_limits WHERE key = ?1 AND window_start = ?2`)
    .bind(key, windowStart)
    .all();

  const count = Number(results[0]?.count ?? 1);
  if (count > limit) {
    return { ok: false, retryAfter: 60 - (now - windowStart) };
  }
  return { ok: true };
}

// ── 이미지 게이트 ──
// 로드맵 1단계: 세션 필수 → 서명 URL 검증 → 레이트리밋 → R2 서빙
async function pageHandler(
  albumId: string,
  pageNo: string,
  env: Env,
  request: Request
): Promise<Response> {
  // 1) 세션 필수
  const sessionId = getSessionId(request);
  if (!sessionId) return json({ error: 'session_required' }, 403);

  const page = parseInt(pageNo, 10);
  if (!Number.isInteger(page) || page < 1) return json({ error: 'bad_page' }, 400);

  // 2) 서명 URL 검증 (sessionId 바인딩 + 만료)
  const url = new URL(request.url);
  const exp = parseInt(url.searchParams.get('exp') || '', 10);
  const sig = url.searchParams.get('sig') || '';
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isInteger(exp) || exp < now) return json({ error: 'url_expired' }, 403);
  const expected = await hmacHex(env.LEAF_SIG_SECRET, `${sessionId}|${albumId}|${page}|${exp}`);
  if (sig !== expected) return json({ error: 'bad_signature' }, 403);

  // 3) 레이트리밋 (세션 + IP 백스톱)
  const perMin = Number(env.LEAF_RATE_LIMIT_PER_MIN) || DEF_RATE_LIMIT;
  const rlSession = await rateLimited(env, `img:${sessionId}`, perMin);
  if (!rlSession.ok) return json({ error: 'rate_limited', retryAfter: rlSession.retryAfter }, 429);

  const ipLimit = Number(env.LEAF_IP_LIMIT_PER_MIN) || DEF_IP_LIMIT;
  const ip = request.headers.get('CF-Connecting-IP') || '';
  if (ip) {
    const rlIp = await rateLimited(env, `img:ip:${ip}`, ipLimit);
    if (!rlIp.ok) return json({ error: 'rate_limited', retryAfter: rlIp.retryAfter }, 429);
  }

  // 4) R2 서빙
  const key = `images/${albumId}/${page}.jpg`;
  const object = await env.leaf_images.get(key);
  if (!object) return json({ error: 'page_not_found', albumId, pageNo }, 404);

  const headers = securityHeaders(new Headers());
  headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
  headers.set('Cache-Control', 'private, max-age=60'); // 서명 URL TTL(120s) 내 캐시
  headers.set('ETag', object.httpEtag || '');
  headers.set('Access-Control-Allow-Origin', new URL(request.url).origin);
  headers.set('Vary', 'Origin');
  return new Response(object.body, { headers });
}

// ── 앨범 메타 — 세션 필수, 서명 URL 발급 ──
async function albumMetaHandler(albumId: string, env: Env, request: Request): Promise<Response> {
  const sessionId = getSessionId(request);
  if (!sessionId) return json({ error: 'session_required' }, 403);

  const rl = await rateLimited(env, `meta:${sessionId}`, META_LIMIT_PER_MIN);
  if (!rl.ok) return json({ error: 'rate_limited', retryAfter: rl.retryAfter }, 429);

  const listed = await env.leaf_images.list({ prefix: `images/${albumId}/` });
  const pageNos = listed.objects
    .map((o) => o.key.replace(`images/${albumId}/`, '').replace(/\.jpg$/, ''))
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .sort((a, b) => a - b);

  const exp = Math.floor(Date.now() / 1000) + SIG_TTL;
  const pages: { page: number; url: string }[] = [];
  for (const n of pageNos) {
    const sig = await hmacHex(env.LEAF_SIG_SECRET, `${sessionId}|${albumId}|${n}|${exp}`);
    pages.push({ page: n, url: `/Leaf/api/albums/${albumId}/pages/${n}?exp=${exp}&sig=${sig}` });
  }

  return json({
    albumId,
    title: 'Leaf 화보집 ' + albumId,
    totalPages: pageNos.length,
    pages,
    sigExpiry: exp,
  });
}

// ── 뷰어 신원 (시각/비가시 워터마크용) — 쿠키 발급 ──
async function viewerIdentity(request: Request): Promise<Response> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const cookies = parseCookies(request.headers.get('Cookie'));
  let sessionId = cookies.leaf_sid || '';
  const setCookie: string[] = [];

  if (!/^[a-f0-9]{32}$/i.test(sessionId)) {
    sessionId = newSessionId();
    setCookie.push(
      `leaf_sid=${sessionId}; Path=/Leaf; Max-Age=2592000; SameSite=Lax; Secure; HttpOnly`
    );
  }

  const email = cookies.leaf_email || 'guest@leaf.local';
  const label = `Leaf | ${email} | ${sessionId.slice(0, 8)} | ${ip}`;

  const headers = securityHeaders(new Headers({ 'Content-Type': 'application/json; charset=utf-8' }));
  headers.set('Cache-Control', 'no-store');
  for (const c of setCookie) headers.append('Set-Cookie', c);

  return new Response(
    JSON.stringify({ sessionId, ip, email, label, auth: email !== 'guest@leaf.local' }),
    { status: 200, headers }
  );
}

// ── 캡처 알림 수신 — 서버 신뢰 소스 (클라이언트 sid/email 폐기) ──
async function captureAlert(request: Request, env: Env): Promise<Response> {
  try {
    const sessionId = getSessionId(request);
    if (!sessionId) return json({ error: 'session_required' }, 403);

    const body = await request.json();
    const detail = ALERT_DETAILS.has(String(body.detail || '')) ? String(body.detail) : null;
    if (!detail) return json({ error: 'invalid_detail' }, 400);

    const albumId = Number(body.albumId) || null;
    const pageNo = Number(body.page) || null;

    const rl = await rateLimited(env, `alert:${sessionId}`, ALERT_LIMIT_PER_MIN);
    if (!rl.ok) return json({ error: 'rate_limited', retryAfter: rl.retryAfter }, 429);

    const ip = request.headers.get('CF-Connecting-IP') || '';
    const userAgent = request.headers.get('User-Agent') || '';

    await env.leaf_db
      .prepare(
        `INSERT INTO capture_alerts (album_id, page_no, detail, ip, user_agent)
         VALUES (?1, ?2, ?3, ?4, ?5)`
      )
      .bind(albumId, pageNo, `${detail}|sid=${sessionId}`, ip, userAgent.slice(0, 200))
      .run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }
}

// ── 캡처 알림 로그 — 관리자 토큰 필수 (Bearer) ──
async function captureLog(request: Request, env: Env): Promise<Response> {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || token !== env.LEAF_ADMIN_TOKEN) {
    return json({ error: 'unauthorized' }, 401);
  }
  const { results } = await env.leaf_db
    .prepare(`SELECT id, album_id, page_no, detail, ip, user_agent, created_at
              FROM capture_alerts ORDER BY id DESC LIMIT 100`)
    .all();
  return json(results);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === BASE) {
      return new Response(null, {
        status: 301,
        headers: { Location: BASE + '/', 'Cache-Control': 'public, max-age=300' },
      });
    }

    if (path === BASE + '/') {
      return serveViewer(env);
    }

    if (!path.startsWith(BASE)) {
      return json({ error: 'not_found' }, 404);
    }

    const p = path.slice(BASE.length);

    // 유출 정보 추출 페이지: /Leaf/audit → audit.html
    if (p === '/audit' || p === '/audit/') {
      return serveAsset(env, '/audit.html');
    }

    if (p === '/api/viewer-identity' && request.method === 'GET') {
      return viewerIdentity(request);
    }
    if (p === '/api/capture-alert' && request.method === 'POST') {
      return captureAlert(request, env);
    }
    if (p === '/api/capture-log' && request.method === 'GET') {
      return captureLog(request, env);
    }

    const meta = p.match(/^\/api\/albums\/([^/]+)\/meta$/);
    if (meta) return albumMetaHandler(meta[1], env, request);

    const page = p.match(/^\/api\/albums\/([^/]+)\/pages\/(\d+)$/);
    if (page) return pageHandler(page[1], page[2], env, request);

    if (p.startsWith('/api/')) {
      return json({ error: 'not_found' }, 404);
    }

    return serveAsset(env, p);
  },
};
