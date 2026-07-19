/** Production CORS: Pages origins + local demo. */

const EXACT = new Set([
  "https://vibequant-web.pages.dev",
  "http://127.0.0.1:8787",
  "http://localhost:8787",
  "http://127.0.0.1:8788",
  "http://localhost:8788",
]);

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // same-origin / curl
  if (EXACT.has(origin)) return true;
  // Cloudflare Pages preview deployments
  try {
    const u = new URL(origin);
    if (u.protocol === "https:" && u.hostname.endsWith(".vibequant-web.pages.dev")) {
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function corsHeaders(origin: string | null): HeadersInit {
  const allowed = isAllowedOrigin(origin);
  const value = !origin ? "*" : allowed ? origin : "https://vibequant-web.pages.dev";
  return {
    "Access-Control-Allow-Origin": value,
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}
