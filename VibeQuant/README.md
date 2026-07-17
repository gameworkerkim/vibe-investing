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
| API surface | `gs_quant.*` / `Gs*` | `vi_quant.*` / `Vi*` — drop-in compatible |

## Quick Start

```bash
pip install -e .
```

```python
from vi_quant.session import ViSession
from vi_quant.instrument import IRSwap
from vi_quant.risk import Price

# No client id / secret needed — local backend by default
ViSession.use()

swap = IRSwap('Pay', '10y', 'USD')
price = swap.calc(Price())
print(price)
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
| Data | `vi_quant/data/` | Marquee Data APIs | yfinance, FRED, local Parquet/DuckDB store |
| Model | `vi_quant/instrument/`, `vi_quant/risk/` | GS pricing & risk engines | QuantLib + local analytics |
| Application | `vi_quant/markets/`, `vi_quant/backtests/` | Marquee portfolio/backtest services | Local portfolio store + local backtest engine |

## Documentation

All documentation is in English.

| Document | Description |
|---|---|
| [docs/API_MAPPING.md](docs/API_MAPPING.md) | Complete GS → VI API mapping table (packages, classes, endpoints, env vars) |
| [docs/OFFICIAL_DOCS_GUIDE.md](docs/OFFICIAL_DOCS_GUIDE.md) | Correspondence manual for the official GS Quant docs ([developer.gs.com/docs/gsquant/](https://developer.gs.com/docs/gsquant/)) |
| [ROADMAP.md](ROADMAP.md) | Development roadmap and phase plan |

## Compatibility Policy

1. **API-level compatibility**: public class names (modulo `Gs` → `Vi`), method signatures,
   and return types follow `gs-quant` `master`.
2. **Behavioral parity where feasible**: numerical results depend on models and data;
   VibeQuant documents any known divergence from GS results per module.
3. **No GS connectivity**: VibeQuant never calls `*.gs.com`. All endpoints resolve to a
   local or self-hosted VI backend.

## Status

Early scaffolding. See [ROADMAP.md](ROADMAP.md).

## License

Apache 2.0. VibeQuant is an independent open-source project. It is not affiliated with,
endorsed by, or supported by Goldman Sachs. "GS Quant" is referenced solely for API
compatibility purposes under its Apache 2.0 license.

## Disclaimer

For research and educational purposes only. Nothing in this repository constitutes
investment advice. Validate all models and data before using them with real capital.
