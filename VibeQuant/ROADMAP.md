# VibeQuant Roadmap

Goal: a fully open-source quant engine that is **API-level compatible with GS Quant**,
with every `Gs*` symbol renamed to `Vi*` and the Goldman Sachs Marquee backend replaced by
open data sources and open-source pricing/risk engines.

Tracking baseline: `goldmansachs/gs-quant` @ release 2.1.1.

**Guiding principle — thin vertical slice first.** Rather than porting the entire gs-quant
API surface breadth-first, each phase delivers one end-to-end path that actually runs
(e.g. `ViSession → ViDataApi → Dataset.get_data() → timeseries`), then widens coverage.

## Phase 0 — Foundation (Scaffolding & Compatibility Layer)

**Objective:** project skeleton, naming convention, and a working `ViSession`.

- [x] Repository layout under `vibe-investing/VibeQuant/`
- [x] GS → VI API mapping table ([docs/API_MAPPING.md](docs/API_MAPPING.md))
- [x] Official docs correspondence manual ([docs/OFFICIAL_DOCS_GUIDE.md](docs/OFFICIAL_DOCS_GUIDE.md))
- [x] `vi_quant` package skeleton with `ViSession` (embedded mode, no credentials)
- [x] Automated rename pipeline: script that vendors gs-quant source and applies
      `gs_quant→vi_quant`, `Gs→Vi` transforms + license headers (`scripts/vendor_rename.py`)
- [x] Port pure-local modules that need no backend: `errors`, `datetime`,
      `timeseries` (algebra/statistics/econometrics/technicals/analysis)
- [ ] CI: pytest + flake8, Python 3.9–3.12 matrix (local pytest exists; CI workflow pending)
- [x] LICENSE (Apache-2.0) + NOTICE with gs-quant attribution
- [ ] `CONTRIBUTING.md`, license policy (Apache-2.0-compatible deps only)

**Exit criteria:** `pip install -e .` works; `import vi_quant`; timeseries functions pass
tests ported from gs-quant.

## Phase 1 — Data Backend (REST API + Redis cache + Neon DB)

**Objective:** a standalone data backend serving market data via REST API, consumed by
both the `vi_quant` Python client and `VibeQuantClient` (TypeScript/Node.js).

- [x] Backend project scaffold: TypeScript + Express, Vercel-ready (`backend/`)
- [x] `src/routes/`: `/api/v1/candles`, `/api/v1/market-data`, `/api/v1/assets`, `/api/health`
- [x] `src/providers/`: Yahoo Finance (`yahoo-finance2` v4, free, no key) + TOSS Open API (KR+US stocks, OAuth2)
- [x] `src/db/`: Neon PostgreSQL schema (`market_assets`, `market_candles` with JSONB + BRIN indexes, `cache_metadata`)
- [x] `src/db/redis.ts`: Upstash Redis cache layer + sliding-window rate limiter (10 req/s per route, 100 req/s global)
- [x] Security middleware: Helmet, CORS, input validation (zod patterns), optional API key, OWASP-compliant headers
- [x] `scripts/setup-env.sh`: interactive terminal script for credential input (no secrets in source)
- [x] `scripts/pre-commit-hook.sh`: blocks commits containing API keys, DB URLs, or tokens
- [x] Python + TypeScript client examples (`examples/vibequant_client.py`, `examples/vibequant-client.ts`)
- [x] Python provider layer: `vi_quant/providers/` — UnifiedProvider (TOSS + Yahoo Finance + Mock), all 5 functions identical across backends
- [x] `docs/PROVIDER_API_MATCHING.md` — TOSS ↔ Yahoo Finance ↔ VibeQuant unified interface mapping
- [x] `Dockerfile` + `docker-compose.yml` — local backtesting environment (Jupyter + mock provider)
- [x] `notebooks/01_backtest_demo.py` — deterministic mock backtest demo (no credentials needed)
- [ ] Deploy to Vercel (free tier) with Neon + Upstash integrations
- [ ] Wire `vi_quant/data/` to call the backend REST API (replace current stubs)
- [ ] One end-to-end notebook: Python → backend → Yahoo Finance → timeseries

**Exit criteria:** `VibeQuantClient.getPriceSeries("yahoo", "AAPL")` returns a DataFrame;
`vi_quant.DataSet('VI_EQUITY_EOD').get_data(...)` works through the backend.

## Phase 2 — Pricing, Risk & Backtesting Core

**Objective:** `Instrument.calc(Measure)` and the generic backtest engine, locally.

- [ ] `ViPriceApi` / `ViRiskApi` backed by QuantLib: IR swaps/swaptions, FX options,
      equity options first
- [ ] Risk measures: `Price`, `DollarPrice`, `IRDelta`, `IRVega`, `EqDelta`, `EqVega`,
      `FXDelta`, `Theta` (coverage/parity table per instrument)
- [ ] `PricingContext` / `HistoricalPricingContext` with local parallel execution
- [ ] `ViBacktestApi` + `GenericEngine` running fully locally (`Strategy`, triggers, actions)
- [ ] `ViPortfolioApi` with local portfolio store (SQLite/DuckDB)
- [ ] Guides: pricing-and-risk, backtesting

**Exit criteria:** `IRSwap('Pay','10y','USD').calc(Price())` returns a QuantLib-derived
price; a gs-quant backtesting example runs end-to-end after rename.

## Phase 3 — Portfolio Analytics, Factor Models & Hedging

**Objective:** institutional-style analytics from open models.

- [ ] `ViFactorRiskModelApi` / `ViRiskModelApi`: Fama-French + statistical (PCA) factor
      models built from open data
- [ ] `PortfolioManager` reports: performance, factor risk, thematic exposure
- [ ] `ViScenarioApi` / `ViFactorScenarioApi`: market shock & factor scenario engine
- [ ] `ViHedgeApi`: hedge optimizer (cvxpy)
- [ ] `ViIndexApi`, screens (`ViScreenApi`, `ViDataScreenApi`, `ViBaseScreenerApi`)
- [ ] Optimizer (`markets/optimizer.py`) on open solvers

**Exit criteria:** factor risk report for an equity portfolio using open factor models;
hedge optimization example runs.

## Phase 4 — Platform & Distribution

**Objective:** packageable library, documentation, and ecosystem integration.
The long-tail GS APIs (ESG, Carbon, Workspaces, Marketview) are explicitly
**non-goals** for the core team; they are welcome as community contributions.

- [ ] Self-hosted **VI Platform** service (FastAPI) exposing VI REST routes,
      so `ViSession` works in remote mode too
- [ ] Sphinx docs site (reuse gs-quant `docs/` toolchain) = SDK Reference
- [ ] PyPI release as `vi-quant`; semantic versioning tracking gs-quant releases
- [ ] Example notebooks: GS Quant tutorials ported (rename + open data)
- [ ] Compatibility test harness: import-check all public symbols via alias shim

**Exit criteria:** `pip install vi-quant`; docs site published; public API symbols
documented with parity status.

**Won't-do (community contributions welcome):** individual API shims for
`GsEsgApi→ViEsgApi`, `GsCarbonApi→ViCarbonApi`, `GsWorkspacesMarketsApi`,
`GsMarketviewDashboardsApi`, `GsDataGridApi`, `GsPlotApi`, `GsContentApi`,
`GsUsersApi`, `GsGroupsApi`, `GsMonitorsApi`, `GsParserApi`.

## Non-Goals

- Reproducing Goldman Sachs proprietary data, models, or exact numerical results
- Marquee UI features (PlotTool Pro, Marquee web links)
- GS-internal auth (`KerberosSession`, SSO pass-through)
- Long-tail ESG / Carbon / Thematics / Workspaces / Marketview / DataGrid API shims
