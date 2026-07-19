/**
 * VibeQuant Worker — health, CDN (/cdn/* → R2 STATIC), API stubs.
 * Secrets (TOSS_*) from wrangler secrets / .dev.vars — never hardcode.
 */

export interface Env {
  TOSS_CLIENT_ID?: string;
  TOSS_CLIENT_SECRET?: string;
  DEFAULT_PROVIDER?: string;
  CDN_PUBLIC_BASE?: string;
  DB?: D1Database;
  DATA?: R2Bucket;
  STATIC?: R2Bucket;
}

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

function corsHeaders(origin: string | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function serveCdn(request: Request, env: Env, pathname: string): Promise<Response> {
  if (!env.STATIC) {
    return Response.json(
      { error: "STATIC_R2_NOT_BOUND", message: "Run bootstrap.sh to create vibequant-static" },
      { status: 503 }
    );
  }

  const key = decodeURIComponent(pathname.slice(CDN_PREFIX.length)).replace(/^\/+/, "");
  if (!key || key.includes("..")) {
    return Response.json({ error: "BAD_KEY" }, { status: 400 });
  }

  const obj = await env.STATIC.get(key);
  if (!obj) {
    return Response.json({ error: "NOT_FOUND", key }, { status: 404 });
  }

  const headers = new Headers(corsHeaders(request.headers.get("Origin")));
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

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("Origin")) });
    }

    if (pathname === "/api/health" || pathname === "/") {
      const tossConfigured = !!(env.TOSS_CLIENT_ID && env.TOSS_CLIENT_SECRET);
      return Response.json({
        status: "ok",
        service: "vibequant-api",
        version: "0.0.1",
        provider_default: env.DEFAULT_PROVIDER ?? "yahoo",
        toss: { configured: tossConfigured },
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
      });
    }

    if (pathname.startsWith(CDN_PREFIX) || pathname === "/cdn") {
      if (pathname === "/cdn" || pathname === "/cdn/") {
        return Response.json({
          service: "vibequant-cdn",
          usage: "GET /cdn/<key>  e.g. /cdn/images/logo.png",
          upload: "npm run upload-static -- ./path/to/file.png images/file.png",
        });
      }
      if (request.method !== "GET" && request.method !== "HEAD") {
        return Response.json({ error: "METHOD_NOT_ALLOWED" }, { status: 405 });
      }
      return serveCdn(request, env, pathname.endsWith("/") ? pathname.slice(0, -1) : pathname);
    }

    // Placeholder for Phase 1 candle API
    if (pathname.startsWith("/api/v1/")) {
      return Response.json(
        {
          error: "NOT_IMPLEMENTED",
          message: "Candle API landing in Phase 1 — use mock vi_browser in Pages for now",
          path: pathname,
        },
        { status: 501 }
      );
    }

    return Response.json(
      { error: "NOT_FOUND", message: `No route for ${pathname}` },
      { status: 404 }
    );
  },
};
