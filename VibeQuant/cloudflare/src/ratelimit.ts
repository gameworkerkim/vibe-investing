/**
 * Best-effort per-isolate rate limit (free tier; not global across colo).
 * ~30 GET /api/v1/* per IP per minute.
 */

const WINDOW_MS = 60_000;
const MAX = 30;
const hits = new Map<string, { count: number; start: number }>();

export function checkRateLimit(request: Request): { ok: true } | { ok: false; retryAfter: number } {
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anon";
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now - cur.start > WINDOW_MS) {
    hits.set(ip, { count: 1, start: now });
    return { ok: true };
  }
  cur.count += 1;
  if (cur.count > MAX) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - cur.start)) / 1000);
    return { ok: false, retryAfter: Math.max(1, retryAfter) };
  }
  return { ok: true };
}
