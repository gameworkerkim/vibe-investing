// Leaf — 모바일 화보집 뷰어 (Cloudflare Worker)
// 라우트: vibequant.cc/Leaf*
// - 정적 뷰어: ASSETS 바인딩 (public/)
// - 이미지: R2 leaf-images (업로드 시 워터마크 사전 합성 — CPU 10ms 회피)
// - 캡처 알림: D1 capture_alerts

export interface Env {
  leaf_images: R2Bucket;
  leaf_db: D1Database;
  ASSETS: Fetcher;
}

const BASE = '/Leaf';

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

// ── 이미지 게이트 ──
// MVP: 인증 없이 전 페이지 열람 (로그인/결제 게이트는 P3/P4에서 추가)
async function pageHandler(
  albumId: string,
  pageNo: string,
  env: Env,
  request: Request
): Promise<Response> {
  const key = `images/${albumId}/${pageNo}.jpg`;
  const object = await env.leaf_images.get(key);

  if (!object) {
    return json({ error: 'page_not_found', albumId, pageNo }, 404);
  }

  const headers = securityHeaders(new Headers());
  headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
  headers.set('Cache-Control', 'private, max-age=3600');
  headers.set('ETag', object.httpEtag || '');
  // same-origin canvas LSB 워터마크용 (cross-origin 폴백 대비)
  headers.set('Access-Control-Allow-Origin', new URL(request.url).origin);
  headers.set('Vary', 'Origin');
  return new Response(object.body, { headers });
}

// ── 앨범 메타 (R2에서 페이지 수 집계 — 업로드만 하면 자동 반영) ──
async function albumMetaHandler(albumId: string, env: Env): Promise<Response> {
  const listed = await env.leaf_images.list({ prefix: `images/${albumId}/` });
  const pageNos = listed.objects
    .map((o) => o.key.replace(`images/${albumId}/`, '').replace(/\.jpg$/, ''))
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
    .sort((a, b) => a - b);

  return json({
    albumId,
    title: 'Leaf 화보집 ' + albumId,
    totalPages: pageNos.length,
    pages: pageNos,
  });
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

// ── 뷰어 신원 (시각/비가시 워터마크용) ──
// 로그인(P3) 전: guest email + 세션 쿠키 + CF IP
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

  // 로그인 연동 전: 이메일 자리표시자. 추후 Cookie/Authorization에서 교체.
  const email = cookies.leaf_email || 'guest@leaf.local';
  const label = `Leaf | ${email} | ${sessionId.slice(0, 8)} | ${ip}`;

  const headers = securityHeaders(new Headers({ 'Content-Type': 'application/json; charset=utf-8' }));
  headers.set('Cache-Control', 'no-store');
  for (const c of setCookie) headers.append('Set-Cookie', c);

  return new Response(
    JSON.stringify({
      sessionId,
      ip,
      email,
      label,
      auth: email !== 'guest@leaf.local',
    }),
    { status: 200, headers }
  );
}

// ── 캡처 알림 수신 ──
async function captureAlert(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const userAgent = request.headers.get('User-Agent') || '';
    const albumId = Number(body.albumId) || null;
    const pageNo = Number(body.page) || null;
    const sessionId = String(body.sessionId || '').slice(0, 64);
    const email = String(body.email || '').slice(0, 120);
    const detail = `${String(body.detail || '').slice(0, 80)}|sid=${sessionId}|email=${email}`.slice(
      0,
      200
    );

    await env.leaf_db
      .prepare(
        `INSERT INTO capture_alerts (album_id, page_no, detail, ip, user_agent)
         VALUES (?1, ?2, ?3, ?4, ?5)`
      )
      .bind(albumId, pageNo, detail, ip, userAgent.slice(0, 200))
      .run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }
}

// ── 캡처 알림 로그 (관리자용. MVP: 인증 없음 — P3에서 관리자 게이트 추가) ──
async function captureLog(env: Env): Promise<Response> {
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
      // 상대경로(api/...)가 /Leaf/ 기준으로 해석되도록 /Leaf/ 로 리다이렉트
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

    if (p === '/api/viewer-identity' && request.method === 'GET') {
      return viewerIdentity(request);
    }
    if (p === '/api/capture-alert' && request.method === 'POST') {
      return captureAlert(request, env);
    }
    if (p === '/api/capture-log' && request.method === 'GET') {
      return captureLog(env);
    }

    const meta = p.match(/^\/api\/albums\/([^/]+)\/meta$/);
    if (meta) return albumMetaHandler(meta[1], env);

    const page = p.match(/^\/api\/albums\/([^/]+)\/pages\/(\d+)$/);
    if (page) return pageHandler(page[1], page[2], env, request);

    if (p.startsWith('/api/')) {
      return json({ error: 'not_found' }, 404);
    }

    return serveAsset(env, p);
  },
};
