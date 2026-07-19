# VibeQuant Security Policy

This document describes VibeQuant's security architecture so that both humans and
LLM assistants can understand the threat model, trust boundaries, and enforcement
mechanisms. It is written to be ingestion-friendly for RAG systems and coding agents.

## 1. Trust Model

**Normative (new development):** Cloudflare Free data plane + browser Pyodide compute.
See [docs/ARCHITECTURE_TARGET.md](docs/ARCHITECTURE_TARGET.md) and
[docs/LIMITATIONS.md](docs/LIMITATIONS.md).

```
  BROWSER (untrusted script relative to other tenants; runs on user device)
 +---------------------------+
 | Pages webview + Pyodide   |  -- user Python executes HERE only
 | vi_browser (thin SDK)     |
 +---------------------------+
          | HTTPS fetch (no secrets in bundle)
          v
 +---------------------------+     +------------------+
 | Cloudflare Worker (API)   | --- | Cache API / CDN  |
 +---------------------------+     +------------------+
          |                        +------------------+
          |                        | D1 (meta/index)  |
          |                        +------------------+
          |                        | R2 (candle body) |
          v                        +------------------+
 +---------------------------+
 | Yahoo Finance / TOSS      |  (Worker outbound only; TOSS secrets in CF secrets)
 +---------------------------+

  OPTIONAL LOCAL RESEARCH (not dashboard path)
 +---------------------------+
 | vi_quant (pip)            |  may call providers directly — do not put secrets in Pages
 +---------------------------+
```

- **User quant scripts never run on Workers.** No server-side `exec` / sandbox-on-edge.
- **Market data secrets** (TOSS, optional `API_KEY`) live only in Cloudflare secrets / Worker env.
- Legacy `backend/` (Express + Neon + Upstash) is **frozen**; do not expand its trust surface.
- Historical note: older text claiming “only backend makes outbound calls” was **false** for
  embedded `vi_quant/providers` (yfinance/TOSS). Dashboard path must not repeat that mistake.
- Never call `*.gs.com` or any Goldman Sachs endpoint.
- All third-party market APIs use HTTPS.

## 2. Secret Management

| Principle | Enforcement |
|---|---|
| **No secrets in source** | `backend/.gitignore` blocks `.env`. `.env.example` contains only dummy placeholders. |
| **Pre-commit guard** | `backend/scripts/pre-commit-hook.sh` scans staged files for `client_secret`, `DATABASE_URL=postgresql://`, `UPSTASH_REDIS_TOKEN`, `TOSS_CLIENT_SECRET`. Blocks commit if found. |
| **Interactive setup** | `backend/scripts/setup-env.sh` prompts for credentials interactively and writes `.env` with `chmod 600`. |
| **Runtime-only access** | All credentials read from `process.env` at call time (lazy evaluation). Never stored in global variables or module-level constants. |
| **No defaults** | Missing credentials → graceful degradation (e.g., TOSS absent → routes return 502 with "not configured"). No hardcoded fallback keys. |

### Environment Variable Inventory

**Normative (Cloudflare path)** — collect via `cloudflare/scripts/setup-secrets.sh`:

| Variable | Sensitivity | Scope |
|---|---|---|
| `TOSS_CLIENT_ID` | LOW | TOSS OAuth client id (Worker secret / `.dev.vars`) |
| `TOSS_CLIENT_SECRET` | HIGH | TOSS OAuth secret (Worker secret / `.dev.vars`) |
| `CLOUDFLARE_API_TOKEN` | HIGH | Deploy/auth on developer machine or CI — **not** a Worker runtime secret |
| `CLOUDFLARE_ACCOUNT_ID` | LOW–MED | Account id for wrangler; written to `wrangler.toml` locally |

**Legacy (Express `backend/` — frozen):**

| Variable | Sensitivity | Scope |
|---|---|---|
| `DATABASE_URL` | HIGH — contains DB password | Neon PostgreSQL connection string |
| `UPSTASH_REDIS_URL` | MEDIUM | Redis endpoint URL |
| `UPSTASH_REDIS_TOKEN` | HIGH — bearer token | Redis authentication |
| `API_KEY` (optional) | HIGH — if set | Optional backend API key for clients |
| `PORT`, `NODE_ENV`, `RATE_LIMIT_*`, `CACHE_TTL_SECONDS` | LOW | Operational configuration |

## 3. API Security (backend/)

### 3.1 Rate Limiting

| Type | Limit | Enforcer | Failure Mode |
|---|---|---|---|
| Global | 100 req/s (sliding window) | Upstash `Ratelimit.slidingWindow(100, "1s")` | HTTP 429 + `Retry-After: 1` + `X-Global-RateLimit-*` headers |
| Per-route | 10 req/s (sliding window) | Upstash `Ratelimit.slidingWindow(10, "1s")` per route name | HTTP 429 + `Retry-After: 1` + `X-RouteRateLimit-*` headers |

Rate limits are applied before route handlers. If Redis is unreachable, the
system fails open (rate limiting skipped, logged).

### 3.2 HTTP Headers (Helmet)

| Header | Value | Purpose |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `X-XSS-Protection` | `0` | Disabled (deprecated; CSP used instead) |
| `Strict-Transport-Security` | `max-age=15552000; includeSubDomains` | Enforce HTTPS |
| `X-DNS-Prefetch-Control` | `off` | Disable DNS prefetch |
| `X-Powered-By` | *(removed)* | Server fingerprinting prevention |
| Referrer-Policy | `no-referrer` | No referrer leakage |

### 3.3 CORS

| Environment | Allowed Origins |
|---|---|
| `development` | `*` (any origin) |
| `production` | `https://vibe-investing.vercel.app`, `https://vibequant.vercel.app` |

Only `GET` and `OPTIONS` methods are allowed. Only `Content-Type`,
`Authorization`, and `X-API-Key` headers are permitted.

### 3.4 Input Validation

| Validation | Rule | Rejection |
|---|---|---|
| Symbol | 1-32 chars, `[A-Za-z0-9.%^\-=]` | HTTP 400 `INVALID_SYMBOL` |
| Provider | Enum: `yahoo` or `toss` | HTTP 400 `INVALID_PROVIDER` |
| `days` query param | Integer 1-3650 (clamped) | Clamped, never errored |
| `limit` query param | Integer 1-10000 (clamped) | Clamped, never errored |
| Request body | Max 1MB (Express `json({limit:'1mb'})`) | HTTP 413 |

### 3.5 Optional API Key

If `API_KEY` environment variable is set, all `/api/*` routes require the
`X-API-Key` header to match. If not set, the backend is open (suitable for
local development or Vercel's internal network).

### 3.6 Error Responses

All errors return JSON with a structured format — no stack traces in production:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description",
  "retryAfter": 1  // only for 429
}
```

## 4. Data Provider Security

### 4.1 Yahoo Finance

- No API key required. Rate limits enforced client-side by `yahoo-finance2`.
- Responses are cached in Upstash Redis (TTL 300s) to reduce upstream calls.

### 4.2 TOSS Open API

- OAuth 2.0 Client Credentials flow (`POST /oauth2/token`).
- Access token cached in memory; expires in 24h (refreshed 30s before expiry).
- Token never logged, stored only in module-scoped `let _accessToken`.
- Pagination uses 200-item pages with 200ms delay between pages.

## 5. Database Security (Neon PostgreSQL)

- Connection via `@neondatabase/serverless` HTTP driver (no persistent TCP pool).
- TLS enforced by Neon at the endpoint level (`sslmode=require` in connection string).
- Connection string stored only in `DATABASE_URL` environment variable.
- No raw SQL concatenation — Drizzle ORM provides parameterized queries.
- Vercel integration: connection string set via Vercel Environment Variables,
  never in `vercel.json` or source.

## 6. Cache Security (Upstash Redis)

- Authenticated via `UPSTASH_REDIS_TOKEN` (sent as Bearer token in HTTPS requests).
- Cache keys are namespaced (`vi:cache:`, `vi:global`, `vi:route:`).
- No PII or secrets stored in cache — only market data.
- Cache TTL: 300 seconds (configurable via `CACHE_TTL_SECONDS`).
- Cache misses are non-blocking — failures logged, not propagated.

## 7. Deployment (Vercel)

| Control | Implementation |
|---|---|
| TLS | Vercel provides HTTPS by default |
| Environment variables | Set via Vercel dashboard (encrypted at rest) |
| Serverless isolation | Each request runs in its own execution context |
| Cold start | First invocation after idle may be up to 300ms |
| Runtime | Node.js 20+ |
| Cron | `0 */6 * * *` cache refresh (at most once per 6h, ±59min precision on Hobby) |

## 8. Incident Response

If a secret is suspected to be exposed:

1. **Rotate immediately**: regenerate the credential at the provider (Neon, Upstash, TOSS).
2. **Update `.env`**: run `scripts/setup-env.sh` again or manually edit `.env`.
3. **Check git history**: `git log -p -- .env` — if the file was ever committed, rotate
   even if it was later removed (git history is permanent).
4. **Verify pre-commit hook**: confirm `scripts/pre-commit-hook.sh` is symlinked to
   `.git/hooks/pre-commit` and active.

## 9. LLM Assistant Guidance

The following instructions are for LLM coding assistants working on this codebase:

- **Never generate or suggest code that hardcodes API keys, tokens, or database URLs.**
  Always reference `process.env.VARIABLE_NAME`.
- **Never write sample `.env` code containing real-looking credentials.**
  Use placeholder strings like `your-key-here` or `abc123`.
- **When adding a new secret to the project**, update ALL of:
  1. `.env.example` (add the variable with a blank value)
  2. `scripts/setup-env.sh` (add the interactive prompt)
  3. `scripts/pre-commit-hook.sh` (add the detection regex)
  4. This document (Section 2, Environment Variable Inventory)
- **Rate limits are hard constraints**: 10 req/s per route, 100 req/s global.
  Proposed code must not circumvent them. Batch endpoints (if added) must count
  as a single request against the limit.
- **Input validation is mandatory for every new route parameter.**
  Follow the pattern in `src/middleware/index.ts`. Use `zod` for complex validation.
- **All outbound HTTP calls must use HTTPS.** No `http://` endpoints in production code.

## 10. References

- [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/)
- [Helmet.js docs](https://helmetjs.github.io/)
- [Upstash Ratelimit docs](https://upstash.com/docs/ratelimit/overview)
- [Neon Security docs](https://neon.tech/docs/security/security-overview)
- [Vercel Security docs](https://vercel.com/docs/security)
