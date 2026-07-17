# Official GS Quant Docs — VibeQuant Correspondence Manual

This manual maps every section of the official GS Quant documentation
([developer.gs.com/docs/gsquant/](https://developer.gs.com/docs/gsquant/)) to its
VibeQuant equivalent. Use it to (a) navigate GS docs while working with VibeQuant, and
(b) track VibeQuant documentation coverage.

**Legend** — Status of the VibeQuant counterpart:
`Compatible` (works with rename) · `Adapted` (same API, different backend/behavior) ·
`Planned` (see ROADMAP phase) · `N/A` (GS-platform-only, intentionally not ported)

## 1. Overview & Getting Started

| GS docs page | VibeQuant counterpart | Status |
|---|---|---|
| `/docs/gsquant/` (Overview) | `VibeQuant/README.md` | Compatible |
| `/docs/gsquant/getting-started/` | `VibeQuant/README.md` § Quick Start | Adapted - No credentials needed; `pip install vi-quant` (planned) |

## 2. Authentication

| GS docs page | VibeQuant counterpart | Status |
|---|---|---|
| `/docs/gsquant/authentication/` | `docs/guides/authentication.md` | Planned - P0 |
| `/docs/gsquant/authentication/sessions/` | Sessions guide — `ViSession` lifecycle | Adapted - Embedded mode is default; no OAuth |
| `/docs/gsquant/authentication/gs-session/` | "VI Session" guide (`ViSession.use()` / `.get()`) | Adapted - `client_id`/`client_secret` optional |
| `/docs/gsquant/authentication/proxy/` | Proxy configuration guide | Compatible - Same `requests`-level proxy support |

## 3. Data

| GS docs page | VibeQuant counterpart | Status |
|---|---|---|
| `/docs/gsquant/data/` | `docs/guides/data.md` | Planned - P1 |
| `/data/data-environment/datasets/` | `Dataset` guide — open dataset catalog (yfinance, FRED, local) replaces Marquee catalog | Adapted - Dataset IDs differ; VI ships its own catalog with a GS-ID alias table |
| `/data/data-environment/data-context/` | `DataContext` guide | Compatible |
| `/data/data-environment/data-coordinates/` | `DataCoordinate` guide | Adapted - Coordinates resolve against VI catalog |
| `/data/data-environment/entities/` | Entities guide (`Country`, `Index`, `Asset`, ...) | Adapted - Backed by local security master |
| `/data/accessing-data/querying-data/` | Querying data guide (`Dataset.get_data`) | Adapted |
| `/data/accessing-data/financial-series/` | Financial series guide | Adapted |
| `/data/accessing-data/exporting-data/` | Exporting data guide (pandas/CSV/Excel) | Compatible |
| `/data/accessing-data/map-symbology/` | Symbology mapping guide | Adapted - OpenFIGI-based, replaces Marquee xref |
| `/data/accessing-data/map-symbology-secmaster/` | Security-master symbology guide | Planned - P1 |
| `/data/accessing-data/secmaster_sdk/` | `ViSecurityMasterApi` SDK guide | Planned - P1 |
| `/data/data-analytics/timeseries/` | Timeseries functions guide (`vi_quant.timeseries`) | Compatible - Pure-local functions port unchanged |
| `/data/data-analytics/datagrid/*` (overview, processors, persistence, visualization) | DataGrid guide | Planned - P4 — persistence is local files, not Marquee |
| `/data/data-visualization/charting-data/` | Charting guide (matplotlib/plotly) | Adapted - PlotTool Pro links → local charts |

## 4. Pricing and Risk

| GS docs page | VibeQuant counterpart | Status |
|---|---|---|
| `/docs/gsquant/pricing-and-risk/` | `docs/guides/pricing-and-risk.md` | Planned - P2 |
| `/pricing-and-risk/instruments/` | Instruments guide (`vi_quant.instrument`) | Adapted - Priced by QuantLib engines, not GS engines |
| `/pricing-and-risk/measures/` | Risk measures guide (`Price`, `IRDelta`, ...) | Adapted - Measure coverage grows per phase; parity table maintained |
| `/pricing-and-risk/pricing-context/` | `PricingContext` guide (batching, async, historical) | Adapted - Local parallel execution instead of server batching |
| `/pricing-and-risk/portfolios/` | Portfolio pricing guide (`vi_quant.markets.Portfolio`) | Adapted |
| `/pricing-and-risk/scenarios/` | Scenarios guide (market shocks, carry, roll-forward) | Planned - P3 |

## 5. Markets

| GS docs page | VibeQuant counterpart | Status |
|---|---|---|
| `/docs/gsquant/markets/` | `docs/guides/markets.md` | Planned - P1–P3 |
| `/markets/assets-and-security-master/` | Assets & SecurityMaster guide | Adapted - Local security master |
| `/markets/dates/` | Relative dates guide (`0b`, `-1m`, RDate) | Compatible - Pure-local, ports unchanged with bundled calendars |

## 6. Hedging

| GS docs page | VibeQuant counterpart | Status |
|---|---|---|
| `/docs/gsquant/hedging/` | `docs/guides/hedging.md` | Planned - P3 |
| `/hedging/hedging-using-ml/` | ML hedging guide (local optimizer, cvxpy/sklearn) | Planned - P3 |

## 7. Contribute

| GS docs page | VibeQuant counterpart | Status |
|---|---|---|
| `/docs/gsquant/contribute/getting-started/` | `CONTRIBUTING.md` | Planned - P0 |
| `/contribute/approved-licenses/` | Licensing policy (Apache-2.0-compatible deps only) | Planned - P0 |
| `/contribute/building-docs/` | Docs build guide (Sphinx, same toolchain as gs-quant) | Planned - P4 |
| `/contribute/functions/` | Timeseries function authoring guide | Planned - P4 |
| `/contribute/creating-tests/` | Testing guide (pytest) | Planned - P0 |
| `/contribute/pycharm/` | IDE setup guide | Planned - P4 |

## 8. SDK Reference

| GS docs page | VibeQuant counterpart | Status |
|---|---|---|
| `/docs/gsquant/api/` (SDK Reference) | Sphinx-generated `vi_quant` API reference (from `docs/` rst, inherited from gs-quant) | Planned - P4 |

## 9. GS-Platform-Only Content (Not Ported)

| GS docs / platform area | Reason |
|---|---|
| Marquee Portfolio Analytics UI deep links | No Marquee; VI outputs local artifacts |
| PlotTool Pro integration | GS product; use matplotlib/plotly locally |
| Marquee dataset entitlement/licensing pages | No entitlements — all VI data sources are open |
| GS DAP®, Transaction Banking, other developer.gs.com services | Out of scope |

## 10. Documentation Rules for VibeQuant

1. All VibeQuant documentation is written in **English**.
2. Every guide page carries a header linking the GS docs page it corresponds to and its
   compatibility status (the legend above).
3. Whenever gs-quant master changes its public API, this manual and
   [API_MAPPING.md](API_MAPPING.md) must be updated in the same PR.
