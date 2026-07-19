# VibeQuant

**VibeQuant** is a fully open-source quantitative finance engine that is API-compatible with
[GS Quant](https://github.com/goldmansachs/gs-quant) (`gs_quant`) at the Python API level.

GS Quant is a world-class quant toolkit, but its real value — data, pricing models, risk
engines — lives behind Goldman Sachs' Marquee platform and requires an institutional
`client_id` / `client_secret`. VibeQuant replaces that closed backend with open data sources
and open-source pricing/risk libraries, while keeping the same class names, method
signatures, and workflows so that existing GS Quant code runs with a one-line change.

> **Naming convention:** every `Gs*` symbol becomes `Vi*` (Vibe Investing).
> `gs_quant` → `vi_quant`, `GsSession` → `ViSession`, `GsDataApi` → `ViDataApi`, and so on.
> See the full [API Mapping Table](docs/API_MAPPING.md).

## Why

| | GS Quant | VibeQuant |
|---|---|---|
| Client library | Open source (Apache 2.0) | Open source (Apache 2.0) |
| Data / models / compute | Goldman Sachs Marquee (closed, institutional only) | Open sources: yfinance, FRED, OpenFIGI, QuantLib, local engines |
| Credentials | `client_id` / `client_secret` required | None (optional keys for some data providers) |
| Execution | Remote (GS servers) | Local-first, self-hostable backend |
| API surface | `gs_quant.*` / `Gs*` | `vi_quant.*` / `Vi*` — signature-compatible (not numerically identical) |

## Compatibility Notice

VibeQuant targets **API-level compatibility** (same modules, class names modulo the
`Gs` → `Vi` prefix, and method signatures). It does **not** promise numerically identical
results: pricing and risk run on open-source engines (QuantLib and others), not on
Goldman Sachs' proprietary models and data. Known numerical differences are documented
per module as pricing features land (see [ROADMAP.md](ROADMAP.md)).

## Quick Start

```bash
pip install -e .
```

Everything below works today:

```python
import pandas as pd
from vi_quant.session import ViSession
from vi_quant.timeseries import returns, volatility, correlation, moving_average

# No client id / secret needed — embedded local mode by default
ViSession.use()

prices = pd.Series(...)          # any price series (e.g. from yfinance)
r = returns(prices)
vol = volatility(prices, 22)
ma = moving_average(prices, 22)
```

Derivative pricing is **not implemented yet** (planned — Phase 2):

```python
# PLANNED (Phase 2) — shown for the target API shape only; does not run today
from vi_quant.instrument import IRSwap
from vi_quant.risk import Price
IRSwap('Pay', '10y', 'USD').calc(Price())
```

Migrating from GS Quant is a mechanical rename:

```python
# Before (GS Quant)                      # After (VibeQuant)
from gs_quant.session import GsSession   from vi_quant.session import ViSession
GsSession.use(client_id=..., ...)        ViSession.use()
```

## Architecture

Same 3-layer architecture as GS Quant, with the remote Marquee backend replaced by
pluggable open backends:

| Layer | Module | GS Quant backend | VibeQuant backend |
|---|---|---|---|
| Data | `vi_quant/providers/` | Marquee Data APIs | Unified provider: TOSS + Yahoo Finance + Mock (auto-detect) |
| Data | `backend/` | — | REST data server (Express+TS, Redis cache, Neon DB, Vercel) |
| Model | `vi_quant/instrument/`, `vi_quant/risk/` | GS pricing & risk engines | QuantLib + local analytics |
| Application | `vi_quant/markets/`, `vi_quant/backtests/` | Marquee portfolio/backtest services | Local portfolio store + local backtest engine |

## Documentation

All documentation is in English.

| Document | Description |
|---|---|---|
| [docs/API_MAPPING.md](docs/API_MAPPING.md) | Complete GS → VI API mapping table |
| [docs/API_MAPPING_KR.md](docs/API_MAPPING_KR.md) | GS → VI API mapping table (Korean) |
| [docs/PROVIDER_API_MATCHING.md](docs/PROVIDER_API_MATCHING.md) | TOSS ↔ Yahoo Finance ↔ VibeQuant unified interface mapping |
| [docs/PROVIDER_API_MATCHING_KR.md](docs/PROVIDER_API_MATCHING_KR.md) | TOSS ↔ Yahoo Finance ↔ VibeQuant unified interface mapping (Korean) |
| [docs/OFFICIAL_DOCS_GUIDE.md](docs/OFFICIAL_DOCS_GUIDE.md) | GS Quant official docs correspondence manual |
| [docs/OFFICIAL_DOCS_GUIDE_KR.md](docs/OFFICIAL_DOCS_GUIDE_KR.md) | GS Quant official docs correspondence manual (Korean) |
| [docs/TECH_REVIEW_DASHBOARD.md](docs/TECH_REVIEW_DASHBOARD.md) | Technical review: Streamlit/NiceGUI over Node.js backend |
| [docs/TECH_REVIEW_DASHBOARD_KR.md](docs/TECH_REVIEW_DASHBOARD_KR.md) | 기술 검토: Streamlit/NiceGUI + Node.js 백엔드 연동 |
| [ROADMAP.md](ROADMAP.md) | Development roadmap (English) |
| [README_KR.md](README_KR.md) / [ROADMAP_KR.md](ROADMAP_KR.md) | Korean documentation |
| [SECURITY.md](SECURITY.md) | LLM-readable security policy |

## Data Providers — Swap Backends Without Changing Code

```python
from vi_quant.providers import get_provider

# Auto-detect: TOSS (if keys set) → Yahoo (always available) → Mock (fallback)
p = get_provider()

# Same 5 functions on every backend:
p.fetch_candles("AAPL", 260)           # → [{time, open, high, low, close, volume}]
p.fetch_prices(["AAPL", "TSLA"])       # → {"AAPL": {price, change, changeRate}}
p.fetch_asset("005930")                # → {symbol, name, exchange, currency}
p.provider_name()                      # → "toss" | "yahoo" | "mock"
p.is_available()                       # → True | False

# Force specific provider:
p = get_provider("yahoo")              # Yahoo Finance (global, no key needed)
p = get_provider("mock")               # Deterministic PRNG (no credentials)
```

See [docs/PROVIDER_API_MATCHING.md](docs/PROVIDER_API_MATCHING.md) for the full TOSS ↔ Yahoo interface map.

## Docker Quick Start

```bash
cd VibeQuant
docker compose build          # build the container
docker compose run vibequant  # interactive Python with mock provider
docker compose up -d          # start Jupyter on :8888

# Force Yahoo Finance (no credentials needed):
VI_QUANT_PROVIDER=yahoo docker compose run vibequant
```

## Compatibility Policy

1. **API-level compatibility**: public class names (modulo `Gs` → `Vi`), method signatures,
   and return types follow `gs-quant` `master`.
2. **Behavioral parity where feasible**: numerical results depend on models and data;
   VibeQuant documents any known divergence from GS results per module.
3. **No GS connectivity**: VibeQuant never calls `*.gs.com`. All endpoints resolve to a
   local or self-hosted VI backend.

## Status

**Pre-Alpha — local backtesting works (mock + Yahoo Finance), pricing not implemented yet.**

| Module | Status |
|---|---|
| `vi_quant.session` (`ViSession`, embedded mode) | Implemented |
| `vi_quant.errors` (`MqError` family) | Implemented (vendored from gs-quant) |
| `vi_quant.timeseries` (algebra, statistics, econometrics, technicals, analysis) | Implemented (vendored, runs fully locally) |
| `vi_quant.providers` (UnifiedProvider: TOSS + Yahoo Finance + Mock) | Implemented (auto-detect, identical signatures across backends) |
| `backend/` (Express + TS REST data server, Upstash Redis + Neon DB) | Implemented (Vercel-ready) |
| `Dockerfile` + `docker-compose.yml` | Implemented (local backtesting, `docker compose up`) |
| `vi_quant.instrument` / `vi_quant.risk` (pricing) | Not started — Phase 2 |
| `vi_quant.backtests`, `vi_quant.markets` (portfolio) | Not started — Phase 2+ |

See [ROADMAP.md](ROADMAP.md) for the full plan.

## License

Apache 2.0. VibeQuant is an independent open-source project. It is not affiliated with,
endorsed by, or supported by Goldman Sachs. "GS Quant" is referenced solely for API
compatibility purposes under its Apache 2.0 license.

## Disclaimer

For research and educational purposes only. Nothing in this repository constitutes
investment advice. Validate all models and data before using them with real capital.
