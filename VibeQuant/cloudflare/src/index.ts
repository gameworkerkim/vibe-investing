/**
 * Minimal Worker stub — health only until Phase 1 API lands.
 * Secrets (TOSS_*) come from wrangler secrets / .dev.vars — never hardcode.
 */

export interface Env {
  TOSS_CLIENT_ID?: string;
  TOSS_CLIENT_SECRET?: string;
  DEFAULT_PROVIDER?: string;
  DB?: D1Database;
  DATA?: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health" || url.pathname === "/") {
      const tossConfigured = !!(env.TOSS_CLIENT_ID && env.TOSS_CLIENT_SECRET);
      return Response.json({
        status: "ok",
        service: "vibequant-api",
        version: "0.0.1",
        provider_default: env.DEFAULT_PROVIDER ?? "yahoo",
        toss: { configured: tossConfigured },
        bindings: {
          d1: !!env.DB,
          r2: !!env.DATA,
        },
      });
    }

    return Response.json(
      { error: "NOT_FOUND", message: `No route for ${url.pathname}` },
      { status: 404 }
    );
  },
};
