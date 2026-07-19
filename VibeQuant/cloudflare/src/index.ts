/**
 * VibeQuant Worker — health, CDN, candles API.
 * Secrets (TOSS_*) from wrangler secrets / .dev.vars — never hardcode.
 */

import type { Env } from "./env";
import { corsHeaders, isAllowedOrigin } from "./cors";
import { parseCandleParams } from "./validate";
import { checkRateLimit } from "./ratelimit";
import { getCandlesPayload } from "./candles";
import { listWatchlist, watchlistCount, WATCHLIST_MAX } from "./watchlist";
import { tossConfigured } from "./toss";

export type { Env };

const CDN_PREFIX = "/cdn/";

function contentTypeFor(key: string): string {
  const lower = key.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".json")) return "application/json; charset=utf-8";
  if (lower.endsWith(".css")) return "text/css; charset=utf-8";
  if (lower.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (lower.endsWith(".html")) return "text/html; charset=utf-8";
  if (lower.endsWith(".txt") || lower.endsWith(".md")) return "text/plain; charset=utf-8";
  if (lower.endsWith(".wasm")) return "application/wasm";
  return "application/octet-stream";
}

function json(data: unknown, status: number, origin: string | null, extra?: HeadersInit): Response {
  const headers = new Headers(corsHeaders(origin));
  headers.set("Content-Type", "application/json; charset=utf-8");
  if (extra) {
    for (const [k, v] of Object.entries(extra)) headers.set(k, String(v));
  }
  return new Response(JSON.stringify(data), { status, headers });
}

async function serveCdn(request: Request, env: Env, pathname: string): Promise<Response> {
  const origin = request.headers.get("Origin");
  if (!env.STATIC) {
    return json(
      { error: "STATIC_R2_NOT_BOUND", message: "Run bootstrap.sh to create vibequant-static" },
      503,
      origin
    );
  }

  const key = decodeURIComponent(pathname.slice(CDN_PREFIX.length)).replace(/^\/+/, "");
  if (!key || key.includes("..")) {
    return json({ error: "BAD_KEY" }, 400, origin);
  }

  const obj = await env.STATIC.get(key);
  if (!obj) {
    return json({ error: "NOT_FOUND", key }, 404, origin);
  }

  const headers = new Headers(corsHeaders(origin));
  headers.set("Content-Type", obj.httpMetadata?.contentType || contentTypeFor(key));
  headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  headers.set("ETag", obj.httpEtag);
  if (request.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }
  return new Response(obj.body, { status: 200, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      if (origin && !isAllowedOrigin(origin)) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (pathname === "/api/health" || pathname === "/") {
      const wlCount = await watchlistCount(env);
      return json(
        {
          status: "ok",
          service: "vibequant-api",
          version: "0.2.0",
          provider_default: env.DEFAULT_PROVIDER ?? "yahoo",
          toss: { configured: tossConfigured(env) },
          watchlist: { max: WATCHLIST_MAX, count: wlCount },
          bindings: {
            d1: !!env.DB,
            r2_data: !!env.DATA,
            r2_static: !!env.STATIC,
          },
          cdn: {
            prefix: CDN_PREFIX,
            public_base: env.CDN_PUBLIC_BASE ?? CDN_PREFIX,
            upload_hint: "cloudflare/scripts/upload-static.sh",
          },
          candles: "GET /api/v1/candles/:provider/:symbol?days=90",
        },
        200,
        origin
      );
    }

    if (pathname.startsWith(CDN_PREFIX) || pathname === "/cdn") {
      if (pathname === "/cdn" || pathname === "/cdn/") {
        return json(
          {
            service: "vibequant-cdn",
            usage: "GET /cdn/<key>  e.g. /cdn/images/logo.png",
            upload: "npm run upload-static -- ./path/to/file.png images/file.png",
          },
          200,
          origin
        );
      }
      if (request.method !== "GET" && request.method !== "HEAD") {
        return json({ error: "METHOD_NOT_ALLOWED" }, 405, origin);
      }
      return serveCdn(request, env, pathname.endsWith("/") ? pathname.slice(0, -1) : pathname);
    }

    if (pathname === "/api/v1/watchlist") {
      if (request.method !== "GET") {
        return json({ error: "METHOD_NOT_ALLOWED" }, 405, origin);
      }
      const items = await listWatchlist(env);
      return json(
        { max: WATCHLIST_MAX, count: items.length, items },
        200,
        origin,
        { "Cache-Control": "public, max-age=30" }
      );
    }

    const candleMatch = pathname.match(/^\/api\/v1\/candles\/([^/]+)\/([^/]+)\/?$/);
    if (candleMatch) {
      if (request.method !== "GET") {
        return json({ error: "METHOD_NOT_ALLOWED" }, 405, origin);
      }
      if (origin && !isAllowedOrigin(origin)) {
        return json({ error: "CORS_DENIED", message: "Origin not allowed" }, 403, origin);
      }

      const rl = checkRateLimit(request);
      if (!rl.ok) {
        return json(
          { error: "RATE_LIMITED", message: "Too many requests", retryAfter: rl.retryAfter },
          429,
          origin,
          { "Retry-After": String(rl.retryAfter) }
        );
      }

      const parsed = parseCandleParams(candleMatch[1], candleMatch[2], url.searchParams.get("days"));
      if (!parsed.ok) {
        return json({ error: parsed.error, message: parsed.message }, parsed.status, origin);
      }

      try {
        const payload = await getCandlesPayload(
          env,
          parsed.value.provider,
          parsed.value.symbol,
          parsed.value.days
        );
        return json(payload, 200, origin, {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        });
      } catch (err) {
        return json(
          {
            error: "CANDLE_ERROR",
            message: err instanceof Error ? err.message : "candle fetch failed",
          },
          502,
          origin
        );
      }
    }

    if (pathname.startsWith("/api/v1/")) {
      return json(
        {
          error: "NOT_IMPLEMENTED",
          message: "Use GET /api/v1/candles/:provider/:symbol?days=90",
          path: pathname,
        },
        501,
        origin
      );
    }

    return json({ error: "NOT_FOUND", message: `No route for ${pathname}` }, 404, origin);
  },
};
