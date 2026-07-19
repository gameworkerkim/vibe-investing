# Technical Review: Python Dashboard (Streamlit / NiceGUI) with Node.js Backend

**Date:** 2026-07-19
**Scope:** VibeQuant monitoring dashboard — feasibility of NiceGUI/Streamlit frontend over an Express+TypeScript backend
**Status:** Approved — full feasibility confirmed, no blockers

## 1. Summary

| Question | Verdict | Confidence |
|---|---|---|
| Can Streamlit call a Node.js backend? | **YES** | High |
| Can NiceGUI call a Node.js backend? | **YES** | High |
| Can Node.js serve as the sole data layer? | **YES** | High — all required endpoints exist |
| Is the dual-language repo (Python + TS) viable? | **YES** | High — already Python+TS today |
| Can Neon PostgreSQL be accessed from Python? | **YES** | High — standard PG via `psycopg2`/`asyncpg` |
| Can Upstash Redis be accessed from Python? | **YES** | High — official `upstash-redis` SDK |
| Can Docker Compose unify all services? | **YES** | Medium — needs `backend/Dockerfile` |

## 2. How It Works

Neither Streamlit nor NiceGUI embeds a Node.js runtime. **Both connect to the backend via HTTP REST API** — the standard microservices / BFF (Backend For Frontend) pattern.

```
Streamlit / NiceGUI (Python)         Node.js Backend (Express+TS)
┌──────────────────────────┐         ┌───────────────────────────────┐
│                          │  HTTP   │                               │
│  httpx / requests        │ ──────▶ │  GET /api/v1/candles/{p}/{s} │
│  @st.cache_data /        │         │  GET /api/v1/assets/{p}/{s}   │
│  @st.cache_resource      │         │  GET /api/v1/market-data/...  │
│                          │ ◀────── │  GET /api/health              │
│  Plotly / Altair charts  │  JSON   │                               │
└──────────────────────────┘         └───────────────────────────────┘
         Python                           Node.js (existing)
```

## 3. Feasibility Detail

### 3.1 Streamlit → Node.js Backend

Streamlit runs as a Python process. Every UI interaction re-executes the entire script from top to bottom. To avoid hammering the backend with redundant HTTP calls:

```python
import streamlit as st
import httpx

BACKEND_URL = "http://localhost:8080"

@st.cache_data(ttl=300)  # cache for 5 minutes
def fetch_candles(provider: str, symbol: str, days: int = 365) -> dict:
    r = httpx.get(
        f"{BACKEND_URL}/api/v1/candles/{provider}/{symbol}",
        params={"days": days},
    )
    r.raise_for_status()
    return r.json()
```

**Limitations:**
- No WebSocket/streaming — must use polling via `st_autorefresh(interval=60)`
- CORS: dev accepts `*`, production needs `localhost:8501` in the whitelist

### 3.2 NiceGUI → Node.js Backend

NiceGUI runs an internal FastAPI/ASGI server. Same HTTP pattern, but with async support and finer timer control:

```python
from nicegui import ui, app
import httpx

BACKEND_URL = "http://localhost:8080"

async def fetch_candles(provider: str, symbol: str, days: int = 365):
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BACKEND_URL}/api/v1/candles/{provider}/{symbol}",
            params={"days": days},
        )
        return r.json()

@ui.page('/')
def index():
    candles = ui.aggrid({})
    ui.timer(60.0, lambda: refresh(candles))  # every 60s

app.on_startup(lambda: app.storage.user.clear())  # session reset
```

### 3.3 Existing Backend Endpoints (All Required for Dashboard)

| Endpoint | Returns | Dashboard Use |
|---|---|---|
| `GET /api/v1/candles/:provider/:symbol` | OHLCV bars | Main chart data |
| `GET /api/v1/market-data/:provider/:symbol/price` | Close-price series | Line charts, returns calc |
| `GET /api/v1/market-data/:provider/:symbol/last` | Latest bar | Ticker panel, watchlist |
| `GET /api/v1/assets/:provider/:symbol` | Asset metadata | Search, info panel |
| `GET /api/health` | Provider/Redis/DB status | System status dashboard |

**Verdict:** All dashboard data needs are covered by existing endpoints. No new backend routes required.

### 3.4 Dual-Language Repo Viability

The VibeQuant subproject is already polyglot:

```
VibeQuant/
├── backend/          TypeScript (Express)
├── vi_quant/         Python (library)
├── dashboard/        Python (Streamlit/NiceGUI)  ← NEW
├── docker-compose.yml
├── pyproject.toml
└── Dockerfile
```

**Mitigations:**
- Both `npm` and `pip` already coexist — no new tooling needed
- Single `.env` at VibeQuant root, both services reference it
- Separate `Dockerfile` per service (already the pattern)

### 3.5 Neon PostgreSQL — Python Access

Neon is standard PostgreSQL. Python connects identically:

```python
import psycopg2
conn = psycopg2.connect(os.getenv("DATABASE_URL"))
```

**Recommendation:** Use **read-only** access from Python for analytics/ETL. All normal data retrieval routes through the Node.js backend. This keeps the Drizzle ORM schema as the single source of truth and avoids schema drift.

**Caveats:**
- Neon serverless sleeps after ~5 min inactivity → first query 200-500ms cold start
- Existing DB schema is defined but not yet populated by routes — may need a sync cron job before analytics queries work

### 3.6 Upstash Redis — Python Access

**Critical finding:** Upstash uses a **REST (HTTP) API**, not the standard Redis TCP/RESP protocol. The popular `redis-py` library **does NOT work** with Upstash. Use the official Python SDK instead:

```python
# WRONG — will not connect to Upstash
# import redis  # ❌ TCP/RESP protocol

# CORRECT — uses Upstash REST API
from upstash_redis import Redis  # pip install upstash-redis

r = Redis(url=os.getenv("UPSTASH_REDIS_URL"), token=os.getenv("UPSTASH_REDIS_TOKEN"))
cached = r.get("vi:cache:yahoo:candles:AAPL:1d:365")
```

**Recommendation:** Route normal data through the Node.js backend (which already handles caching transparently). Use direct Python Redis access only for:
- Dashboard-specific cache keys (namespace `vi:dash:*`)
- Cache invalidation
- Session/user preference storage

**Caveats:**
- Upstash free tier: 1 GB storage, 10K commands/day — adequate for dashboard metadata, not for time-series storage
- Python SDK less mature than Node.js SDK — basic get/set/del/expire all work

### 3.7 Docker Compose Integration

Need to add 3 services to the existing `docker-compose.yml`:

```yaml
services:
  # Existing
  vibequant: { ... }
  vibequant-jupyter: { ... }

  # New
  vibequant-backend:
    build: { context: ./backend, dockerfile: Dockerfile }
    ports: ["8080:8080"]
    environment: [DATABASE_URL, UPSTASH_REDIS_URL, ...]

  vibequant-dashboard-streamlit:
    build: { context: ./dashboard, dockerfile: Dockerfile.streamlit }
    ports: ["8501:8501"]
    environment: [BACKEND_URL=http://vibequant-backend:8080, ...]
    depends_on: [vibequant-backend]

  vibequant-dashboard-nicegui:
    build: { context: ./dashboard, dockerfile: Dockerfile.nicegui }
    ports: ["8081:8080"]
    depends_on: [vibequant-backend]
```

**Gap:** `backend/` currently has no Dockerfile. The `api/index.ts` entry is Vercel-only. For Docker, need `node dist/index.js` (standalone Express `app.listen()` — already implemented in `src/index.ts`).

## 4. Recommended Stack

| Layer | Choice | Rationale |
|---|---|---|
| Quick dashboard | **Streamlit** | Python-only, fastest path from code → UI, built-in caching |
| Rich UI / desktop-like | **NiceGUI** | Async, more widgets, Timer-based refresh, AG Grid for large tables |
| HTTP client | **httpx** | Async support, connection pooling, both frameworks support it |
| Charts | **Plotly** | Built into Streamlit, works standalone in NiceGUI |
| Python → Redis | **upstash-redis** | Only Python SDK compatible with Upstash REST API |
| Python → Neon | **psycopg2** | Read-only analytics; all normal data through backend API |

## 5. Security Alignment

| SECURITY.md section | Dashboard compliance |
|---|---|
| No secrets in source | `BACKEND_URL` only — all provider keys in backend's `.env` |
| Rate limiting | Inherited from backend (10/s per route, 100/s global) |
| CORS | Add `localhost:8501` to production whitelist |
| Input validation | Backend validates symbol/provider — dashboard passes through |
| HTTPS | Dev: localhost. Prod: Vercel (backend) + Streamlit Cloud or Docker reverse proxy |
| Pre-commit | Apply same `scripts/pre-commit-hook.sh` to dashboard Python files |

## 6. Gaps & Action Items

| # | Gap | Action |
|---|---|---|
| 1 | `backend/` has no Dockerfile | Create `backend/Dockerfile` (Node 20, `npm build && node dist/index.js`) |
| 2 | DB tables not populated | Either add cron job or `POST /api/v1/candles/sync` endpoint |
| 3 | No batch multi-symbol endpoint | Add `POST /api/v1/candles/batch` for dashboard efficiency (future) |
| 4 | CORS production whitelist | Add Streamlit/NiceGUI ports to `corsMiddleware()` |
| 5 | No WebSocket for live updates | Accept polling as initial strategy; add WS later if needed |

## 7. Verdict

**The architecture is sound and fully feasible.** Streamlit and NiceGUI connect to the Node.js backend through standard HTTP REST calls — both frameworks are Python-only but do not require a Python backend. The existing Express+TS server already exposes all endpoints a monitoring dashboard needs. The dual-language repo pattern is already in production. No architectural blockers.

**Recommended first step:** Create `dashboard/app.py` (Streamlit) that calls `http://localhost:8080/api/health` — this alone validates the entire connectivity chain.
