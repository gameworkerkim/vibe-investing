# VibeQuant Data Provider API Matching Table

This table maps the TOSS Open API and Yahoo Finance data sources to the VibeQuant
unified provider interface. The goal: **swap data sources without changing function names**.

## Unified Interface (Python)

```
vi_quant/providers/
├── __init__.py          # re-exports the active provider
├── unified.py           # UnifiedProvider base + factory
├── toss_provider.py     # TOSS Open API adapter (KR+US stocks)
├── yahoo_provider.py    # Yahoo Finance adapter (global)
└── mock_provider.py     # Deterministic mock (no credentials needed)
```

All providers expose these 5 functions with **identical signatures**:

| # | Function | TOSS | Yahoo Finance | Mock | Purpose |
|---|---|---|---|---|---|
| 1 | `fetch_candles(code, days=260)` | `GET /api/v1/candles` | `yf.historical()` | Deterministic PRNG | Daily bar series `[{time, close, ...}]` |
| 2 | `fetch_prices(codes)` | `GET /api/v1/prices` | `yf.quote()` batch | Deterministic PRNG | Current prices `Map<code, {price, change, changeRate}>` |
| 3 | `fetch_asset(code)` | `GET /api/v1/stocks` | `yf.quoteSummary()` | Static lookup table | Asset metadata (name, exchange, currency, type) |
| 4 | `is_available()` | `TOSS_CLIENT_ID + TOSS_CLIENT_SECRET` env check | Always `True` (no key needed) | Always `True` | Is this provider configured? |
| 5 | `provider_name()` | `"toss"` | `"yahoo"` | `"mock"` | Provider identifier string |

## Endpoint Mapping: TOSS → Yahoo Finance → Unified

### Candles (Historical Prices)

| Feature | TOSS Endpoint | Yahoo Finance | Unified Output |
|---|---|---|---|
| URL | `GET /api/v1/candles` | `yahooFinance.historical()` | `fetch_candles(code, days)` |
| Params | `?symbol=&interval=1d&count=200&before=` | `{symbol, period1, period2, interval}` | `(code: str, days: int)` |
| Max per call | 200 bars | ~10 years of daily | internal pagination |
| Rate limit | ~1 req/s | ~2000 req/hr | internal throttling |
| Interval | `1d` only | `1d`, `1wk`, `1mo` | default `1d` |
| Auth | Bearer token (OAuth2) | None | provider-specific |
| Markets | KR + US | Global | filtered by provider |
| Return fields | `time, open_price, close_price, high_price, low_price, volume` | `date, open, high, low, close, volume` | normalized to `{time, open, high, low, close, volume}` |
| Symbol format | KR: `069500`, US: `AAPL` | all uppercase: `AAPL`, `TSLA` | provider-specific; wrapper adds prefix |
| Sort order | desc (TOSS) → wrapper sorts asc | asc | always asc (oldest first) |

### Current Prices

| Feature | TOSS Endpoint | Yahoo Finance | Unified Output |
|---|---|---|---|
| URL | `GET /api/v1/prices` | `yahooFinance.quote()` | `fetch_prices(codes)` |
| Params | `?symbols=CODE1,CODE2,...` | `[symbols]` | `(codes: list[str])` |
| Max symbols | 200 per call | ~50 per call | internal chunking |
| Auth | Bearer token | None | provider-specific |
| Return fields | `symbol, price, change, changeRate` | `symbol, regularMarketPrice, ...` | normalized to `{code: {price, change, changeRate}}` |

### Asset Metadata

| Feature | TOSS Endpoint | Yahoo Finance | Unified Output |
|---|---|---|---|
| URL | `GET /api/v1/stocks?symbol=` | `yahooFinance.quoteSummary()` | `fetch_asset(code)` |
| Auth | Bearer token | None | provider-specific |
| Return fields | `symbol, name, exchange, currency, type` | `price.shortName, price.exchangeName, ...` | `{symbol, name, exchange, currency, assetType}` |

## Provider Selection Logic

Priority order (auto-detected at runtime):

```
1. TOSS   — if TOSS_CLIENT_ID + TOSS_CLIENT_SECRET are set (KR+US stocks)
2. Yahoo  — always available as fallback (global, no key needed)
3. Mock   — if nothing is configured (no credentials)
```

The `UnifiedProvider` auto-selects and can be forcibly overridden with an env var:

```python
# Auto-detect (prefers TOSS > Yahoo > Mock)
from vi_quant.providers import get_provider
provider = get_provider()

# Force specific provider
provider = get_provider("yahoo")
provider = get_provider("mock")
```

## Migration Cheat Sheet

### TOSS.js → vi_quant providers (Python)

```python
# Before (TOSS Node.js)
# const { fetchCandles, fetchPrices, isMock } = await import('./src/toss.js');

# After (VibeQuant Python)
from vi_quant.providers import get_provider

provider = get_provider()
candles = provider.fetch_candles("069500", days=260)
prices   = provider.fetch_prices(["069500", "AAPL"])
info     = provider.fetch_asset("069500")
print(f"Using: {provider.provider_name()}, available: {provider.is_available()}")
```

### Direct provider usage (bypass auto-detect)

```python
from vi_quant.providers.toss_provider import TossProvider
from vi_quant.providers.yahoo_provider import YahooProvider
from vi_quant.providers.mock_provider import MockProvider

# TOSS only (KR market primary)
toss = TossProvider()
samsung = toss.fetch_candles("005930")

# Yahoo only (global coverage)
yahoo = YahooProvider()
apple = yahoo.fetch_candles("AAPL")

# Mock only (deterministic test data)
mock = MockProvider()
test_data = mock.fetch_candles("TEST", 100)
```

## Symbol Format Rules

| Market | TOSS symbol | Yahoo symbol | Mock |
|---|---|---|---|
| KOSPI 200 ETF | `069500` | `069500.KS` | `069500` |
| Samsung Electronics | `005930` | `005930.KS` | `005930` |
| Apple | `AAPL` | `AAPL` | `AAPL` |
| Tesla | `TSLA` | `TSLA` | `TSLA` |

The provider handles symbol format internally. Users always pass the **TOSS-style
bare code** (e.g., `"069500"` for KODEX 200, `"AAPL"` for Apple). Yahoo provider
auto-appends `.KS` suffix for numeric Korean codes.
