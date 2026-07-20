# API Compatibility Matrix

**Purpose:** pass/fail map for the committee stage. Layers:

| Layer | Runtime | Meaning |
|-------|---------|---------|
| **browser** | Pyodide + `vi_browser` | Runs in the webview today |
| **local** | CPython + `vi_quant` | Works with `pip install -e .` (subset) |
| **stub** | Present, raises / placeholder | Importable but not usable for real work |
| **planned** | Roadmap only | Not implemented |

Source of truth for names: [API_MAPPING.md](API_MAPPING.md). Limits: [LIMITATIONS.md](LIMITATIONS.md). Roadmap: [../ROADMAP.md](../ROADMAP.md).

**Legend:** ✅ pass · ⚠️ partial · ❌ fail / N/A

---

## 1. Data access

| API | GS analogue | browser | local | stub | Notes |
|-----|-------------|---------|-------|------|-------|
| `vi_browser.get_candles` | Dataset / GsDataApi prices | ✅ | ✅ (via Worker or mock) | — | Primary committee path |
| `vi_browser.get_prices` | last prices batch | ✅ Phase 2 | ✅ | — | Routes through candles |
| `vi_browser.get_last_price` | last bar | ✅ Phase 2 | ✅ | — | |
| `vi_browser.get_asset` | GsAssetApi thin | ✅ Phase 2 | ✅ | — | Worker `/assets` + heuristics |
| `ViDataApi.get_market_data` | GsDataApi | ⚠️ thin router | ❌ | ✅ class | Browser: prefer `get_candles` |
| `Dataset` / Marquee fields | gs_quant.data | ❌ | stub/planned | — | Not in WASM |
| `provider='toss'` | KR broker feed | ❌ deferred | — | — | See WORKER_TOSS_IP.md |

**Worker routes**

| Route | Status | Notes |
|-------|--------|-------|
| `GET /api/v1/candles/:provider/:symbol` | ✅ | Cache → R2 → Yahoo |
| `GET /api/v1/assets/:provider/:symbol` | ✅ Phase 2 | D1 row + heuristics |
| `GET /api/v1/prices/:provider?symbols=` | ✅ Phase 2 | Last close from candles |
| `GET /api/v1/market-data/:provider/:symbol` | ✅ Phase 2 | Thin alias → last price |
| `GET /api/v1/watchlist` | ✅ | Cap 50 |

---

## 2. Timeseries (committee-critical)

| API | GS analogue | browser | local (`vi_quant.timeseries`) | Notes |
|-----|-------------|---------|-------------------------------|-------|
| `returns` | returns | ✅ | ✅ | |
| `volatility` | volatility | ✅ | ✅ | Browser: annualized window stdev |
| `moving_average` / `sma` | moving_average | ✅ | ✅ | |
| `ema` / `exponential_moving_average` | exponential_moving_average | ✅ Phase 1 | ✅ (beta API differs) | Browser uses **span** EMA |
| `momentum` | — | ✅ | — | Price / shift − 1 |
| `change` | change | ✅ Phase 1 | ✅ | \(X_t - X_0\) |
| `index` | index | ✅ Phase 1 | ✅ | \(initial \cdot X_t / X_0\) |
| `percentiles` | percentiles | ✅ Phase 1 | ✅ | Simplified rolling rank; no Window object |
| `correlation` | correlation | ✅ | ✅ | Browser: full-series Pearson |
| `zscores` | zscores | ✅ | ✅ | |
| `max_drawdown` | max_drawdown | ✅ | ✅ | Browser: scalar MDD |
| `beta` | beta | ✅ | ✅ | |
| `annualized_return` / `sharpe_ratio` | measures | ✅ | ✅ | |
| `rsi` / `macd` / `bollinger_bands` | technicals | ✅ | ✅ / partial | |
| Full Window / DateOffset APIs | Window | ❌ | ⚠️ | Not in browser |

---

## 3. Backtest & viz

| API | browser | local | Notes |
|-----|---------|-------|-------|
| `backtest` / `ma_cross_signal` | ✅ | ✅ (`vi_browser`) | Educational next-bar only |
| `show_chart` | ✅ | print stub | Chart.js in dashboard |
| `gs_quant.backtests` engines | ❌ | planned/stub | Not WASM |

---

## 4. Session / instruments / risk

| API | browser | local | Notes |
|-----|---------|-------|-------|
| `ViSession` | ❌ (use `vi_browser`) | ✅ partial | No Marquee OAuth |
| `IRSwap` / `Price` / QuantLib | ❌ | planned | Desktop only |
| `ViRiskApi` / scenarios | ❌ | stub/planned | |

---

## 5. Pass criteria (committee)

A script **passes** the browser stage if:

1. It only imports from `vi_browser` (or documented thin aliases).
2. It fetches data via `get_candles` / `get_prices` / `get_asset` (Worker when online).
3. It uses listed timeseries + edu backtest helpers.
4. Re-run on the same candle snapshot yields the same metrics.

Anything requiring QuantLib, Marquee Datasets, or TOSS realtime **fails** by design until a later phase.

---

## Sync checklist

When adding a browser API:

1. Implement in `vi_browser/` (pandas where possible).
2. Mirror list-based form in `pages/js/pyodide-runner.js`.
3. Export in bootstrap `__vq_entry` imports.
4. Add row here + sample in `pages/js/api-catalog.js`.
5. Tick ROADMAP Phase 0–2 checkboxes when Exit is met.
