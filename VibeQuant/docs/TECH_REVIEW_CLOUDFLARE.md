# Technical Review: VibeQuant Backend on Cloudflare (Workers / Pages / D1 / R2 / KV)

> **SUPERSEDED (2026-07-19):** Primary platform is now **Cloudflare Free + Pyodide
> webview** (market data on CF, quant compute in browser WASM). See
> [ARCHITECTURE_TARGET.md](ARCHITECTURE_TARGET.md), [LIMITATIONS.md](LIMITATIONS.md),
> [../ROADMAP.md](../ROADMAP.md). Keep this file as historical analysis only.
> Note: some CPU claims below treat `fetch` wait as CPU time; Workers generally do **not**
> charge wall-clock I/O wait as CPU — Free **10 ms CPU** still constrains parsing/Cron.

**Date:** 2026-07-19
**Scope:** Migrate `VibeQuant/backend/` from Vercel+Neon+Upstash to Cloudflare Workers+Pages+D1+R2+KV
**Status:** Partial feasibility — background jobs recommended, full migration blocked

## 1. Summary Comparison

| Component | Current Stack | Cloudflare Equivalent | Compatibility |
|---|---|---|---|
| Serverless compute | Vercel (Express) | Workers / Pages Functions | Express code must be rewritten to Hono/itty-router |
| Relational DB | Neon PostgreSQL | D1 (SQLite) | Schema port possible; no TimescaleDB, no JSONB indexes, single-threaded |
| Cache + Rate-limit | Upstash Redis | KV (cache) + Durable Objects (rate-limit) | KV is eventually consistent; Durable Objects work but more complex |
| Object storage | N/A (not yet used) | R2 | Best-in-class: free egress, S3 API |
| Static hosting | Vercel | Pages | Drop-in compatible |
| Background cron | Vercel cron (6h min) | Workers Cron Triggers (1/min min) | Better granularity |
| Async queues | N/A | Queues | New capability |
| CDN | Vercel Edge | Cloudflare CDN (global, 330+ cities) | Superior coverage |

## 2. Vercel vs Cloudflare — Direct Migration Analysis

### 2.1 Express → Workers Migration

Workers use the **Web Fetch API** — Express middleware, `app.use()`, and `app.listen()` don't exist in the Workers runtime. The entire `backend/src/index.ts` must be rewritten to a Workers-compatible framework.

| Current (Express) | Cloudflare (Workers) | Migration Effort |
|---|---|---|
| `app.use(helmet())` | Manual header setting or `hono/secure-headers` | Low |
| `app.use(cors())` | `hono/cors` or manual headers | Low |
| `app.get('/api/...', handler)` | `app.get('/api/...', handler)` in Hono | Moderate |
| `app.listen(8080)` | `export default app` (fetch export) | Low |
| Express middleware chain | Hono middleware (similar pattern) | Moderate |
| Route params `:provider/:symbol` | Same in Hono | Low |
| Rate limiter (`@upstash/ratelimit`) | Durable Objects (rewrite needed) | **High** |
| `@neondatabase/serverless` | `@libsql/client` or D1 binding | Moderate |
| `yahoo-finance2` (npm) | May not work in Workers (128MB, 10ms free CPU) | **High** |

### 2.2 Runtime Constraints (Critical)

Workers free tier has severe limits for a data-fetching backend:

| Limit | Value | Impact |
|---|---|---|
| **CPU time per request** | 10 ms | Yahoo Finance HTTP call alone takes 200-500ms — **impossible on free tier** |
| **Memory** | 128 MB | `yahoo-finance2` + result data may fit, but tight |
| **Subrequests per invocation** | 50 | Each external API call counts; pagination for TOSS candles may hit this |
| **Worker bundle size** | 3 MB | `yahoo-finance2` package alone is ~1.5 MB — tight |

**Verdict:** Free tier Workers **cannot run data-fetching backends** that make outbound HTTP calls to external APIs. The 10ms CPU limit makes any realistic API call impossible. Even Workers Paid (30s wall time, 30ms CPU) is tight for Yahoo Finance historical data fetches.

### 2.3 Neon PostgreSQL → D1 Migration

D1 is SQLite, not PostgreSQL. Key differences:

| Feature | Neon (PostgreSQL) | D1 (SQLite) | Status |
|---|---|---|---|
| JSONB column type | Native, GIN indexes | JSON stored as TEXT, no index support | **Lost** — JSON queries much slower |
| TimescaleDB extension | Supported | Not available | **Lost** — no time-series hypertables |
| BRIN indexes | Supported | Not available | **Lost** |
| Concurrent reads | Full MVCC | Single-writer, reads can proceed | Degraded (single-threaded) |
| `INSERT ... ON CONFLICT` | Full upsert | `INSERT ... ON CONFLICT` supported | Compatible |
| Connection pooling | PgBouncer included | HTTP-based, no pooling needed | Better (simpler) |
| Schema migrations | Drizzle Kit | Drizzle Kit (same) | **Compatible** |
| Storage limit | 0.5 GB free | 500 MB free per DB (5 GB total) | Similar |
| Rows read/write | Unlimited free (CU-hrs model) | 5M reads/day, 100K writes/day | Comparable to Neon free |

**Verdict:** D1 can replace Neon for the current `market_assets` + `market_candles` tables, but loses JSONB GIN indexes and TimescaleDB. For low-volume time-series (< 5M reads/day), D1 is adequate. The Drizzle schema can be ported with minimal changes (swap `pg-core` for `sqlite-core`).

### 2.4 Upstash Redis → KV + Durable Objects

**Cache layer (KV):**

| Capability | Upstash Redis | Cloudflare KV | Notes |
|---|---|---|---|
| Strong consistency | Yes | **No** (eventually consistent) | KV may return stale data for up to 60s |
| Cache TTL | Any value | **Minimum 30 seconds** | Can't do short-lived caches |
| Atomic operations | INCR, DECR, SETNX | None | No counters |
| List operations | LRANGE, RPUSH | None | No list data structures |
| Key size | Unlimited | 512 bytes | Tight for compound keys |
| Free reads/writes | 500K/month | 100K reads/day, 1K writes/day | KV reads are more generous |

**Rate limiting (Durable Objects):**

Durable Objects can replace `@upstash/ratelimit` with atomic counters, but require significant code changes. Each rate-limited route needs a DO class:

```typescript
// Durable Object for rate limiting (pseudo-code)
export class RateLimiter extends DurableObject {
  async fetch(request: Request) {
    const ip = request.headers.get('cf-connecting-ip');
    const key = `rate:${ip}`;
    let count = (await this.ctx.storage.get(key)) || 0;
    if (count >= 10) return new Response('429', { status: 429 });
    await this.ctx.storage.put(key, count + 1);
    return new Response('ok');
  }
}
```

**Verdict:** KV cannot replace Upstash Redis for caching (eventual consistency, 30s min TTL). Durable Objects can replace rate limiting but increase code complexity. **Upstash Redis is superior for this use case.**

### 2.5 R2 (Object Storage) — New Capability

R2 is a net gain. Use cases not yet implemented but enabled:

| Use Case | Benefit |
|---|---|
| Cached OHLCV CSV/Parquet files | Free storage + free egress |
| Backtest result artifacts | Store and serve from R2, not DB |
| Notebook HTML exports | Publish from R2 via Pages |
| Data lake for historical analysis | 10 GB free storage |

**Verdict:** R2 is the strongest Cloudflare offering for this project. No equivalent exists in the Vercel stack without additional services.

## 3. Recommended Architecture — Cloudflare

Given the Workers free tier CPU limitation, a **direct migration is blocked**. The recommended architecture is **hybrid**:

### Option A: Cloudflare as Background Data Layer (Recommended)

```
┌────────────────────────────────────────────────────────────────┐
│  Vercel (Frontend + API)      Cloudflare (Background Data)     │
│                                                                │
│  Node.js Backend (:8080)      Workers Cron (every 5 min)       │
│  │                             │                                │
│  │  GET /api/v1/candles        │  fetch Yahoo/TOSS data        │
│  │  (reads from cache)         │  store in D1 + R2             │
│  │                             │  refresh KV cache             │
│  │                             │                                │
│  Upstash Redis                D1 (SQLite)                      │
│  (hot cache, rate-limit)      └ market_candles (time-series)  │
│                               R2 (Parquet/CSV)                 │
│                               └ cold storage + bulk export     │
│                               KV (eventual-cache)              │
│                               └ pre-computed dashboards        │
└────────────────────────────────────────────────────────────────┘
```

- **Vercel** continues serving the real-time API (Express, low latency, Upstash Redis)
- **Cloudflare Workers** run cron jobs every 5 minutes to pre-fetch Yahoo/TOSS data
- **D1** stores historical time-series for analytics queries
- **R2** stores bulk export files (Parquet/CSV)
- **KV** serves pre-computed dashboard aggregates with eventual consistency

### Option B: Full Migration (Requires Workers Paid, $5/month)

If Workers Paid is acceptable ($5/month unlocks 10M requests, 30s wall time, 30ms CPU):

- Replace Express with **Hono** (Express-like API, Workers-native)
- Replace Neon with **D1** (acceptable for low-volume time-series)
- Keep Upstash Redis for caching (KV can't replace it at current usage)
- Add **R2** for object storage
- Use **Durable Objects** for rate limiting
- Keep TOSS/Yahoo fetching in Workers with longer timeouts

```typescript
// Hono on Workers (replaces Express)
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/api/*', cors());
app.get('/api/health', (c) => c.json({ status: 'ok' }));
app.get('/api/v1/candles/:provider/:symbol', async (c) => {
  // fetch from D1 + R2 cache
  return c.json({ ... });
});

export default app;
```

### Option C: Pages Functions + D1 + R2 (Simplest)

For a dashboard-only use case (not the full data fetching backend):

- **Pages** hosts the dashboard static frontend + API functions
- **D1** stores user watchlists, preferences
- **R2** stores cached CSV data fetched by a separate Worker cron
- The data-fetching Worker (option A) pre-populates D1 + R2

This avoids the 10ms CPU limit by moving heavy data fetching to a paid Worker tier (or Keep Vercel for API).

## 4. Cost Comparison (at Scale)

| Monthly Usage | Vercel+Neon+Upstash | Cloudflare All-Free | Cloudflare Workers Paid |
|---|---|---|---|
| 10K API calls/day | $0 | $0 | $5 |
| 100K API calls/day | $0 ($20 Vercel Pro) | N/A (exceeds free) | $5 + overages (~$0.30/million) |
| 5 GB DB storage | $0 (Neon free) or $1.75 | $0 (D1 free) | $0 (included) |
| 500K Redis ops | $0 | N/A (KV 100K reads/day) | N/A |
| 50 GB egress/month | $0 (Vercel) or $4.50 (Neon) | $0 | $0 |
| Cron granularity | 6h minimum (Vercel) | 1 minute minimum | 1 minute minimum |
| **Best fit** | Real-time API + cache | Background data + storage | Full backend migration |

## 5. Decision Matrix

| Requirement | Vercel+Neon+Upstash | Cloudflare Free | Cloudflare Paid ($5/mo) |
|---|---|---|---|
| Real-time OHLCV API | Excellent | **Blocked** (10ms CPU) | Good (Hono + D1) |
| Rate limiting | Upstash (atomic) | Durable Objects (complex) | Durable Objects |
| Strongly consistent cache | Upstash Redis | **Not available** (KV is eventual) | **Not available** (still KV) |
| Time-series DB | Neon (TimescaleDB) | D1 (basic SQLite) | D1 (basic SQLite) |
| JSON queries | PostgreSQL JSONB + GIN | TEXT-only, no indexes | TEXT-only, no indexes |
| Object storage | Not used | R2 (excellent, free egress) | R2 (excellent) |
| Cron granularity | 6h minimum | 1 minute | 1 minute |
| Background data fetching | Same process | **Blocked** (10ms CPU) | Workers Paid (30ms CPU) |
| npm ecosystem support | Full Node.js | Workers subset | Workers subset |
| Egress costs at scale | $$$ (Neon, Vercel overages) | Free | Free |

## 6. Recommendation

**Keep the current Vercel+Neon+Upstash stack for the data API.** It's simpler, already built, and handles real-time queries well.

**Add Cloudflare for:**
1. **D1** — cold/historical time-series storage (cron-populated, not real-time)
2. **R2** — bulk data storage (backtest results, CSV exports, Parquet files) — zero egress is a major advantage
3. **Workers Cron** — background data pre-fetching (every 5 minutes instead of Vercel's 6-hour minimum)
4. **Pages** — optional for a static dashboard frontend if you want to split UI from API

**Do not attempt full migration to Cloudflare Workers free tier.** The 10ms CPU limit makes it impossible to run a data-fetching backend. Even Workers Paid may struggle with `yahoo-finance2` HTTP calls that routinely take 200-500ms.

## 7. Action Items (Hybrid Option A)

| # | Action | Service |
|---|---|---|
| 1 | Create Cloudflare Worker for cron-based data fetching | Workers |
| 2 | Create D1 schema matching `market_assets` + `market_candles` (Drizzle SQLite dialect) | D1 |
| 3 | Add R2 bucket for Parquet/CSV export | R2 |
| 4 | Worker cron: fetch Yahoo/TOSS data every 5 min → store in D1 + R2 → update KV | Workers Cron |
| 5 | Keep Vercel Express backend for real-time API (reads from Upstash Redis) | Vercel |
| 6 | Dashboard reads pre-computed aggregates from KV (eventual consistency OK for dashboards) | KV |
