/**
 * Cache helper for Pages Functions — Cloudflare Cache API + memory fallback.
 * Mirrors cassandra-ai redis-cache TTL behaviour without Upstash.
 */

const mem = new Map(); // isolate-local fallback

function ttlForMarketHours() {
  const h = new Date().getUTCHours();
  const isMarketHours = h >= 14 && h <= 21; // US session-ish
  return isMarketHours ? 1800 : 7200; // 30m / 2h
}

export function marketAwareTtl() {
  return ttlForMarketHours();
}

export async function getCached(request, key) {
  const url = new URL(request.url);
  const force =
    url.searchParams.get("force") === "true" || url.searchParams.get("refresh") === "1";
  if (force) return null;

  const memHit = mem.get(key);
  if (memHit && Date.now() - memHit.at < memHit.ttl * 1000) {
    return {
      data: memHit.data,
      age: Math.floor((Date.now() - memHit.at) / 1000),
      stale: false,
      fromCache: true,
    };
  }

  try {
    const cache = caches.default;
    const cacheReq = new Request(`https://research-cache.vibequant.internal/${key}`);
    const hit = await cache.match(cacheReq);
    if (hit) {
      const data = await hit.json();
      const at = Number(hit.headers.get("x-cached-at") || Date.now());
      const ttl = Number(hit.headers.get("x-ttl") || 1800);
      const age = Math.floor((Date.now() - at) / 1000);
      return { data, age, stale: age > ttl, fromCache: true };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function setCached(key, data, ttlSec) {
  const ttl = ttlSec || ttlForMarketHours();
  const at = Date.now();
  mem.set(key, { data, at, ttl });

  try {
    const cache = caches.default;
    const cacheReq = new Request(`https://research-cache.vibequant.internal/${key}`);
    const res = new Response(JSON.stringify(data), {
      headers: {
        "content-type": "application/json",
        "cache-control": `public, max-age=${ttl}`,
        "x-cached-at": String(at),
        "x-ttl": String(ttl),
      },
    });
    await cache.put(cacheReq, res);
  } catch {
    /* ignore */
  }
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=60",
      ...extraHeaders,
    },
  });
}
