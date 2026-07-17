# VibeQuant Roadmap

Goal: a fully open-source quant engine that is **API-level compatible with GS Quant**,
with every `Gs*` symbol renamed to `Vi*` and the Goldman Sachs Marquee backend replaced by
open data sources and open-source pricing/risk engines.

Tracking baseline: `goldmansachs/gs-quant` @ release 2.1.1.

## Phase 0 — Foundation (Scaffolding & Compatibility Layer)

**Objective:** project skeleton, naming convention, and a working `ViSession`.

- [x] Repository layout under `vibe-investing/VibeQuant/`
- [x] GS → VI API mapping table ([docs/API_MAPPING.md](docs/API_MAPPING.md))
- [x] Official docs correspondence manual ([docs/OFFICIAL_DOCS_GUIDE.md](docs/OFFICIAL_DOCS_GUIDE.md))
- [ ] `vi_quant` package skeleton with `ViSession` (embedded mode, no credentials)
- [ ] Automated rename pipeline: script that vendors gs-quant source and applies
      `gs_quant→vi_quant`, `Gs→Vi` transforms + license headers
- [ ] Port pure-local modules that need no backend: `datetime`, `errors`, `common`,
      `timeseries` (algebra/econometrics/technicals), `tracing`
- [ ] CI: pytest + flake8, Python 3.9–3.12 matrix
- [ ] `CONTRIBUTING.md`, license policy (Apache-2.0-compatible deps only)

**Exit criteria:** `pip install -e .` works; `import vi_quant`; timeseries functions pass
tests ported from gs-quant.

## Phase 1 — Data Layer

**Objective:** `Dataset` / `DataContext` / `DataCoordinate` running on open data.

- [ ] `ViDataApi` with pluggable providers: yfinance (equities/ETF/FX), FRED (macro),
      local Parquet/DuckDB store
- [ ] VI dataset catalog + GS dataset-ID alias table (e.g. `TREOD`-style IDs → VI datasets)
- [ ] `ViAssetApi` + local security master; symbology mapping via OpenFIGI
- [ ] `ViCalendar` with bundled exchange holiday calendars
- [ ] Guides: data, assets & security master

**Exit criteria:** `Dataset('VI_EQUITY_EOD').get_data(...)` returns a DataFrame; GS Quant
data tutorial code runs after mechanical rename.

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

## Phase 4 — Platform Parity & Ecosystem

**Objective:** long-tail APIs, docs site, distribution.

- [ ] Remaining APIs: ESG, carbon, thematics, content, users/groups, monitors, DataGrid,
      plots, workspaces, marketview dashboards
- [ ] Optional self-hosted **VI Platform** service (FastAPI) exposing the same REST routes,
      so `ViSession` works in remote mode too
- [ ] Sphinx docs site (reuse gs-quant `docs/` toolchain) = SDK Reference
- [ ] PyPI release as `vi-quant`; semantic versioning tracking gs-quant releases
- [ ] Example notebooks ported from gs-quant tutorials (rename + open data)
- [ ] Compatibility test harness: run gs-quant's own test suite against `vi_quant`
      via an import-alias shim

**Exit criteria:** `pip install vi-quant`; docs site published; ≥90% of gs-quant public
API importable, with documented parity status.

## Continuous

- Track `goldmansachs/gs-quant` releases; update mapping table and regenerate vendored code
- Numerical parity notes per module (QuantLib vs GS engines will differ — document deltas)
- All documentation in English

## Non-Goals

- Reproducing Goldman Sachs proprietary data, models, or numerical results exactly
- Marquee UI features (PlotTool Pro, Marquee web links)
- GS-internal auth (`KerberosSession`, SSO pass-through)
