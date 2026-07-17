# GS → VI API Mapping Table

This document is the authoritative mapping between the GS Quant (`gs_quant`) public API and
the VibeQuant (`vi_quant`) public API. The rule is mechanical: **`gs_quant` → `vi_quant`,
prefix `Gs` → `Vi`**. Everything else — module layout, class names without the prefix,
method signatures — is preserved.

Source of truth: `goldmansachs/gs-quant` @ `master` (release 2.1.1, 2026-07).

## 1. Package and Module Mapping

| GS Quant | VibeQuant | Notes |
|---|---|---|
| `gs_quant` | `vi_quant` | Top-level package |
| `gs_quant.session` | `vi_quant.session` | Session/auth replaced by local backend |
| `gs_quant.api.gs.*` | `vi_quant.api.vi.*` | API client layer (see §3) |
| `gs_quant.data` | `vi_quant.data` | Same class names (`Dataset`, `DataContext`, `Fields`) |
| `gs_quant.instrument` | `vi_quant.instrument` | Same instrument classes (`IRSwap`, `FXOption`, ...) |
| `gs_quant.risk` | `vi_quant.risk` | Same measures (`Price`, `IRDelta`, `DollarPrice`, ...) |
| `gs_quant.markets` | `vi_quant.markets` | `Portfolio`, `PricingContext`, optimizer, baskets |
| `gs_quant.backtests` | `vi_quant.backtests` | Strategy / triggers / actions / engines |
| `gs_quant.timeseries` | `vi_quant.timeseries` | Algebra, econometrics, technicals, measures |
| `gs_quant.models` | `vi_quant.models` | Risk model abstractions |
| `gs_quant.entities` | `vi_quant.entities` | Entity abstractions |
| `gs_quant.analytics` | `vi_quant.analytics` | DataGrid, processors, workspaces |
| `gs_quant.datetime` | `vi_quant.datetime` | Date/schedule utilities (pure local, ported as-is) |
| `gs_quant.common` | `vi_quant.common` | Shared types/enums (ported as-is) |
| `gs_quant.errors` | `vi_quant.errors` | `MqError` hierarchy preserved |
| `gs_quant.target` | `vi_quant.target` | Generated service types (regenerated for VI schemas) |
| `gs_quant.content` | `vi_quant.content` | Content/research API |
| `gs_quant.tracing` | `vi_quant.tracing` | OpenTelemetry-style tracing (ported as-is) |

## 2. Session and Authentication

| GS Quant | VibeQuant | Backend change |
|---|---|---|
| `GsSession` | `ViSession` | OAuth against Marquee → optional local/self-hosted auth |
| `GsSession.use(Environment.PROD, client_id, client_secret)` | `ViSession.use()` | Credentials optional; defaults to local backend |
| `GsSession.get(...)` | `ViSession.get(...)` | Same factory signature |
| `Environment.PROD / QA / DEV` | `Environment.PROD / QA / DEV` | Resolves to VI endpoints (see §5) |
| `KerberosSession` | *(not ported)* | GS-internal only |
| `PassThroughSession` | `PassThroughSession` | For self-hosted VI backends with existing tokens |
| `PassThroughGSSSOSession` | *(not ported)* | GS SSO-internal only |
| `MQLoginSession` | *(not ported)* | Marquee-login-internal only |

## 3. API Client Classes (`gs_quant.api.gs.*` → `vi_quant.api.vi.*`)

| GS class (module) | VI class (module) | Open backend (Phase — see ROADMAP) |
|---|---|---|
| `GsSession` (`session`) | `ViSession` (`session`) | Local (P0) |
| `GsDataApi` (`api.gs.data`) | `ViDataApi` (`api.vi.data`) | yfinance / FRED / local Parquet-DuckDB (P1) |
| `GsAssetApi` (`api.gs.assets`) | `ViAssetApi` (`api.vi.assets`) | OpenFIGI + local security master (P1) |
| `GsSecurityMasterApi` (`api.gs.secmaster`) | `ViSecurityMasterApi` (`api.vi.secmaster`) | Local security master DB (P1) |
| `GsSecurityMasterFederatedApi` (`api.gs.federated_secmaster`) | `ViSecurityMasterFederatedApi` (`api.vi.federated_secmaster`) | Federation over local sources (P3) |
| `GsIdType` (`api.gs.assets`) | `ViIdType` (`api.vi.assets`) | Enum, ported as-is (P1) |
| `GsAsset` (`target.assets`) | `ViAsset` (`target.assets`) | Data class, ported as-is (P1) |
| `GsTemporalXRef` (`target.assets`) | `ViTemporalXRef` (`target.assets`) | Data class, ported as-is (P1) |
| `GsPriceApi` (`api.gs.price`) | `ViPriceApi` (`api.vi.price`) | QuantLib pricing service (P2) |
| `GsRiskApi` (`api.gs.risk`) | `ViRiskApi` (`api.vi.risk`) | QuantLib + local risk engine (P2) |
| `GsRiskModelApi` (`api.gs.risk_models`) | `ViRiskModelApi` (`api.vi.risk_models`) | Open factor models (Fama-French, statistical PCA) (P3) |
| `GsFactorRiskModelApi` (`api.gs.risk_models`) | `ViFactorRiskModelApi` (`api.vi.risk_models`) | Open factor models (P3) |
| `GsScenarioApi` (`api.gs.scenarios`) | `ViScenarioApi` (`api.vi.scenarios`) | Local scenario engine (P3) |
| `GsFactorScenarioApi` (`api.gs.scenarios`) | `ViFactorScenarioApi` (`api.vi.scenarios`) | Local scenario engine (P3) |
| `GsBacktestApi` (`api.gs.backtests`) | `ViBacktestApi` (`api.vi.backtests`) | Local generic engine (P2) |
| `GsBacktestApiAsync` (`api.gs.backtests`) | `ViBacktestApiAsync` (`api.vi.backtests`) | Local generic engine, async (P2) |
| `GsBacktestXassetApi` (`api.gs.backtests_xasset`) | `ViBacktestXassetApi` (`api.vi.backtests_xasset`) | Local cross-asset engine (P3) |
| `GsBacktestXassetApiAsync` (`api.gs.backtests_xasset`) | `ViBacktestXassetApiAsync` (`api.vi.backtests_xasset`) | Local cross-asset engine, async (P3) |
| `GsPortfolioApi` (`api.gs.portfolios`) | `ViPortfolioApi` (`api.vi.portfolios`) | Local portfolio store (SQLite/DuckDB) (P2) |
| `GsReportApi` (`api.gs.reports`) | `ViReportApi` (`api.vi.reports`) | Local report engine (P3) |
| `GsIndexApi` (`api.gs.indices`) | `ViIndexApi` (`api.vi.indices`) | Local index construction (P3) |
| `GsHedgeApi` (`api.gs.hedges`) | `ViHedgeApi` (`api.vi.hedges`) | Local optimizer (cvxpy) (P3) |
| `GsScreenApi` (`api.gs.screens`) | `ViScreenApi` (`api.vi.screens`) | Local screening over data store (P3) |
| `GsBaseScreenerApi` (`api.gs.base_screener`) | `ViBaseScreenerApi` (`api.vi.base_screener`) | Local screening (P3) |
| `GsDataScreenApi` (`api.gs.data_screen`) | `ViDataScreenApi` (`api.vi.data_screen`) | Local screening (P3) |
| `GsEsgApi` (`api.gs.esg`) | `ViEsgApi` (`api.vi.esg`) | Open ESG datasets (P4) |
| `GsCarbonApi` (`api.gs.carbon`) | `ViCarbonApi` (`api.vi.carbon`) | Open carbon datasets (P4) |
| `GsThematicApi` (`api.gs.thematics`) | `ViThematicApi` (`api.vi.thematics`) | Local thematic baskets (P4) |
| `GsCountryApi` (`api.gs.countries`) | `ViCountryApi` (`api.vi.countries`) | Static reference data, bundled (P1) |
| `GsContentApi` (`api.gs.content`) | `ViContentApi` (`api.vi.content`) | Local/RSS content store (P4) |
| `GsUsersApi` (`api.gs.users`) | `ViUsersApi` (`api.vi.users`) | Local user store (P4) |
| `GsGroupsApi` (`api.gs.groups`) | `ViGroupsApi` (`api.vi.groups`) | Local user store (P4) |
| `GsMonitorsApi` (`api.gs.monitors`) | `ViMonitorsApi` (`api.vi.monitors`) | Local monitors (P4) |
| `GsDataGridApi` (`api.gs.datagrid`) | `ViDataGridApi` (`api.vi.datagrid`) | Local DataGrid persistence (P4) |
| `GsPlotApi` (`api.gs.plots`) | `ViPlotApi` (`api.vi.plots`) | Local plot persistence (P4) |
| `GsParserApi` (`api.gs.parser`) | `ViParserApi` (`api.vi.parser`) | Local parser (P4) |
| `GsWorkspacesMarketsApi` (`api.gs.workspaces`) | `ViWorkspacesMarketsApi` (`api.vi.workspaces`) | Local workspace persistence (P4) |
| `GsMarketviewDashboardsApi` (`api.gs.marketview`) | `ViMarketviewDashboardsApi` (`api.vi.marketview`) | Local dashboards (P4) |
| `GsCalendar` (`datetime.gscalendar`) | `ViCalendar` (`datetime.vicalendar`) | Bundled holiday calendars (P1) |
| `GsDataSource` (`backtests.data_sources`) | `ViDataSource` (`backtests.data_sources`) | Wraps `ViDataApi` (P2) |

## 4. Non-prefixed Public API (names unchanged)

These classes keep identical names and signatures; only their transport layer changes from
Marquee HTTP calls to the VI backend:

| Module | Key symbols (unchanged) |
|---|---|
| `vi_quant.data` | `Dataset`, `DataContext`, `DataCoordinate`, `Fields` |
| `vi_quant.instrument` | `IRSwap`, `IRSwaption`, `FXOption`, `EqOption`, `CDIndex`, ... (all `Instrument` subclasses) |
| `vi_quant.risk` | `Price`, `DollarPrice`, `IRDelta`, `IRVega`, `EqDelta`, `FXDelta`, `CarryScenario`, `MarketDataShockBasedScenario`, ... |
| `vi_quant.markets` | `PricingContext`, `HistoricalPricingContext`, `Portfolio`, `PositionSet`, `SecurityMaster`, `Basket`, `OptimizerStrategy` |
| `vi_quant.markets.portfolio_manager` | `PortfolioManager` |
| `vi_quant.backtests` | `Strategy`, `TriggerRequirements`, `PeriodicTrigger`, `AddTradeAction`, `HedgeAction`, `GenericEngine`, `EquityVolEngine`, `PredefinedAssetEngine` |
| `vi_quant.timeseries` | `returns`, `volatility`, `correlation`, `beta`, `zscores`, `moving_average`, ... (all functions) |
| `vi_quant.models` | `FactorRiskModel`, `MacroRiskModel`, `Format` |
| `vi_quant.errors` | `MqError`, `MqValueError`, `MqRequestError`, ... |

## 5. Endpoints

| Environment | GS Quant endpoint | VibeQuant endpoint |
|---|---|---|
| `Environment.PROD` | `https://marquee.gs.com` | `VI_QUANT_API_URL` (default `http://localhost:8080`) |
| `Environment.QA` | `https://marquee-qa.gs.com` | `VI_QUANT_QA_API_URL` (default `http://localhost:8081`) |
| `Environment.DEV` | GS-internal | `http://localhost:8082` |
| Auth endpoint | `https://idfs.gs.com/as/token.oauth2` | Local token issuer (optional; anonymous by default) |

The VI backend is an optional self-hosted service ("VI Platform") exposing the same REST
routes (`/v1/data/...`, `/v1/assets/...`, `/v1/risk/...`). In **embedded mode** (default),
`ViSession` short-circuits HTTP entirely and dispatches to in-process engines.

## 6. Environment Variables and Config

| GS Quant | VibeQuant |
|---|---|
| `CLIENT_ID` / `CLIENT_SECRET` | Not required; `VI_CLIENT_ID` / `VI_CLIENT_SECRET` for self-hosted auth |
| — | `VI_QUANT_API_URL` — backend URL (unset = embedded mode) |
| — | `VI_QUANT_DATA_DIR` — local data store path (default `~/.vi_quant/data`) |
| — | `VI_QUANT_FRED_API_KEY` — optional FRED key for macro series |
| `gs_quant/config.ini` | `vi_quant/config.ini` |

## 7. Contact / Metadata Strings

| GS Quant | VibeQuant |
|---|---|
| `gs-quant@gs.com` | GitHub Issues on `gameworkerkim/vibe-investing` |
| `developer.gs.com/docs/gsquant/` | `VibeQuant/docs/` (see [OFFICIAL_DOCS_GUIDE.md](OFFICIAL_DOCS_GUIDE.md)) |
| PyPI `gs-quant` | PyPI `vi-quant` (planned) |

## 8. Explicitly Not Ported

| Symbol | Reason |
|---|---|
| `KerberosSession`, `PassThroughGSSSOSession`, `MQLoginSession` | GS-internal authentication mechanisms |
| `gs_quant.api.fred` | Superseded — FRED is a first-class `ViDataApi` backend |
| Marquee-only UI deep links | No equivalent; VI returns local artifact paths |

## 9. Migration Cheat Sheet

```python
# 1. Package rename
import gs_quant                      ->  import vi_quant

# 2. Prefix rename
from gs_quant.session import GsSession        ->  from vi_quant.session import ViSession
from gs_quant.api.gs.data import GsDataApi    ->  from vi_quant.api.vi.data import ViDataApi
from gs_quant.api.gs.assets import GsAssetApi ->  from vi_quant.api.vi.assets import ViAssetApi

# 3. Session init (credentials become optional)
GsSession.use(Environment.PROD, client_id=cid, client_secret=sec)
->  ViSession.use()   # embedded local backend
->  ViSession.use(Environment.PROD)  # self-hosted VI Platform

# 4. Everything else is unchanged
IRSwap('Pay', '10y', 'USD').calc(Price())
```

A scripted migration is a two-step sed:

```bash
grep -rl "gs_quant" . | xargs sed -i '' -e 's/gs_quant/vi_quant/g' -e 's/\bGs\([A-Z]\)/Vi\1/g'
```
