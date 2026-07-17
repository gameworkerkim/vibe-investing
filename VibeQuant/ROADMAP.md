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

## Phase 1 — Thin Data (end-to-end: session → data → analytics)

**Objective:** `ViSession → ViDataApi → Dataset.get_data() → timeseries` runs on open data.

- [ ] `ViDataApi` with pluggable providers: yfinance (equities/ETF/FX), FRED (macro),
      local Parquet/DuckDB cache
- [ ] VI dataset catalog + GS dataset-ID alias table
- [ ] `ViAssetApi` stub + symbology mapping basics (OpenFIGI)
- [ ] `ViCalendar` holiday coverage (bundled calendars; GS holiday dataset replaced with open source)
- [ ] One GS data tutorial runs after mechanical rename (e.g. equity EOD → returns → volatility)
- [ ] `DataContext` runs fully locally (no Marquee round-trips)

**Exit criteria:** `Dataset('VI_EQUITY_EOD').get_data(...)` returns a DataFrame;
`returns(prices)` produces the same output shape as gs-quant.

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
