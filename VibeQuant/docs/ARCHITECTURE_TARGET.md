# Target Architecture — Cloudflare Free + Pyodide Webview

**Status:** Normative for new development (2026-07-19)  
**Supersedes:** multi-SaaS “Vercel + Neon + Upstash” as the primary platform plan  
**Related:** [LIMITATIONS.md](LIMITATIONS.md) · [ROADMAP.md](../ROADMAP.md)

## 1. Goals

| Goal | Implementation |
|---|---|
| Replace GS Quant (API-level) | Local `vi_quant` + thin browser subset `vi_browser` |
| Dashboard script verification | Pages webview + Pyodide executes user Python |
| Market data | Cloudflare Worker + D1 + R2 + Cache/CDN |
| Cost | **Cloudflare Free tier first** |

## 2. Runtime split (non-negotiable)

```
User browser
  ├─ Pages UI (editor, charts)
  └─ Pyodide WASM
        ├─ user quant script
        ├─ vi_browser (thin SDK)
        └─ fetch ──► Worker API ──► Cache / D1 / R2
                                      │
                                      └─ Yahoo (and later TOSS) ingest
```

- **Never** run user-supplied Python on Workers.
- **Never** put TOSS/`API_KEY` secrets in the browser bundle.
- Local `pip install vi_quant` remains for heavy research; it is not the dashboard path.

## 3. Bindings (`wrangler.toml` sketch)

```toml
name = "vibequant-api"
main = "src/index.ts"
compatibility_date = "2026-07-01"

[[d1_databases]]
binding = "DB"
database_name = "vibequant"
database_id = "<id>"

[[r2_buckets]]
binding = "DATA"
bucket_name = "vibequant-data"

[triggers]
crons = ["0 8 * * *"]   # once daily UTC; keep work tiny (10 ms CPU)

[vars]
DEFAULT_PROVIDER = "yahoo"
```

Pages project hosts the webview; route `/api/*` to the Worker (or use Pages Functions thin proxy).

**Prefer Cache API over KV** on Free (KV write budget is harsh: ~1k writes/day).

## 4. D1 schema (index only)

Candles **bodies** live in R2. D1 stores metadata and object pointers.

```sql
CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT,
  currency TEXT DEFAULT 'USD',
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_assets_ps ON assets(provider, symbol);

CREATE TABLE candle_objects (
  asset_id TEXT NOT NULL,
  interval TEXT NOT NULL DEFAULT '1d',
  r2_key TEXT NOT NULL,
  rows INTEGER,
  from_ts TEXT,
  to_ts TEXT,
  refreshed_at TEXT NOT NULL,
  PRIMARY KEY (asset_id, interval)
);

CREATE TABLE watchlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'yahoo',
  priority INTEGER DEFAULT 100
);
```

### R2 key layout

```
candles/{provider}/{symbol}/{interval}.json
ingest/{yyyy-mm-dd}/{symbol}.raw.json
```

## 5. API surface (Worker)

| Method | Path | Role |
|---|---|---|
| GET | `/api/health` | Liveness (no secrets) |
| GET | `/api/v1/candles/:provider/:symbol` | OHLCV JSON (Cache → R2 → lazy Yahoo) |
| GET | `/api/v1/market-data/:provider/:symbol/price` | Close series |
| GET | `/api/v1/market-data/:provider/:symbol/last` | Latest bar |
| GET | `/api/v1/assets/:provider/:symbol` | Asset meta |

Validation: strict symbol regex (same spirit as legacy backend). CORS: Pages origin only in production.

## 6. Cron (Free)

| Constraint | Value | Design implication |
|---|---|---|
| CPU per cron | **10 ms** | Almost no JSON crunching |
| Crons / account | **5** | One daily job max for Phase 1 |
| Requests / day | **100k** shared with API | Keep ingest rare |

**Strategy A (preferred if Cron is too tight):** no Cron; **lazy fill** on first `GET /candles` (fetch Yahoo → R2 → D1 pointer → Cache).  
**Strategy B:** daily Cron refreshes only top-N watchlist with minimal parsing.

## 7. Pyodide / webview contract

```python
from vi_browser import get_candles, returns, volatility

df = get_candles("AAPL", days=260)
print(volatility(df["close"], 22))
```

| In scope (Phase 1) | Out of scope |
|---|---|
| pandas/numpy timeseries subset | QuantLib, full `vi_quant` |
| HTTP data via Worker | Direct TOSS from browser |
| Charts from returned frames | Multi-GB backtests |

## 8. Cost (Free target)

| Product | Free allowance (approx.) | Phase 1 use |
|---|---|---|
| Workers | 100k req/day, 10 ms CPU | API + optional Cron |
| Pages | Static hosting | Webview + Pyodide assets |
| D1 | 5M reads/day, 100k writes/day | Meta only |
| R2 | 10 GB storage; egress free | Candle bodies |
| Cache API | Edge cache | Hot candles |

**Target monthly cost: $0** within quotas. Exceeding quotas fails closed (errors), not silent upgrade.

## 9. Legacy components

| Path | Role now |
|---|---|
| `backend/` Express | Reference / freeze — do not add features |
| `vi_quant/providers` | Local research; dashboard uses Worker instead |
| Neon / Upstash / Vercel plan | Superseded for primary platform |

## 10. Agent / implementation note

Implement against Free + WASM limits as **hard requirements**. Do not assume Workers Paid,
Durable Objects rate-limit farms, or server-side sandboxes unless the ROADMAP phase explicitly
moves off Free.
