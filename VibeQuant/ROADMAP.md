# VibeQuant Roadmap

**Positioning:** **Not** a GS Quant replacement. A **multi-LLM quant committee basic stage**
(educational sandbox OK) that borrows GS-style API names for familiarity.

**Primary goals**

1. **Committee stage:** reproduce/verify LLM outputs on the same `vi_browser` APIs + Cloudflare data.
2. **Dashboard verification loop:** webview Python → **Pyodide** → Worker candles → table/chart/stdout.
3. **Cloudflare Free first.** What WASM/free cannot do is deferred and documented.
4. **API continuity:** audit major Vi/GS surfaces; where full ports are impossible, ship **shims / routers / façades** so committee scripts still run.

**Normative sequence (active)**

| Phase | Focus | Status |
|-------|--------|--------|
| **0** | API compatibility matrix | ✅ done |
| **1** | Browser timeseries shims + aliases | ✅ done |
| **2** | Data router (`get_prices` / `get_asset` / thin `ViDataApi`) | ✅ done |
| **3** | Community evaluation (+ optional `vi_compat` façade) | ✅ done |
| **4** | LLM archive / multi-LLM bake-off | partial |

**Thin vertical slice:**

`Pages → Pyodide → Worker /candles|/assets|/prices → R2/D1 → timeseries shims + edu backtest`

Do not expand the legacy Vercel/Neon/Upstash stack.

---

## Completed foundation (prerequisite — frozen)

Historical Phase 0–2 work that the committee stage already depends on:

- [x] Repo layout, Apache-2.0 + NOTICE, GS → VI mapping docs
- [x] Local `ViSession` + vendored `timeseries` / `errors` / `datetime` (partial; see LIMITATIONS)
- [x] Cloudflare Worker: `/api/health`, `/api/v1/candles/:provider/:symbol`, Cache → R2 → Yahoo
- [x] D1 meta + R2 candle bodies + watchlist (max 50)
- [x] Pages + Pyodide dashboard (editors, chart, error log, i18n, Clear)
- [x] `vi_browser` core: candles, indicators, edu `backtest` / `ma_cross_signal`, `show_chart`
- [x] LLM Quant Prompt UI + Worker (`POST /api/v1/llm/quant-prompt`)
- [ ] **TOSS realtime — deferred:** Worker→TOSS blocked by IP allowlist ([docs/WORKER_TOSS_IP.md](docs/WORKER_TOSS_IP.md))
- [ ] CI: pytest + flake8 · `CONTRIBUTING.md`

---

## Phase 0 — API compatibility matrix

**Objective:** one authoritative table of what works where, so LLM scripts and humans know pass/fail before run.

- [x] [docs/API_COMPAT_MATRIX.md](docs/API_COMPAT_MATRIX.md) (+ KR) — layers: **browser** / **local** / **stub** / **planned**
- [x] Pass/fail notes for major `vi_quant` / GS-named APIs vs `vi_browser`
- [x] Link from README / LIMITATIONS / `api-catalog.js`

**Exit:** matrix covers data + timeseries + session + risk/instruments; every “browser” row has a runnable sample or explicit fail reason. ✅

---

## Phase 1 — Browser timeseries shims

**Objective:** close common GS/VI timeseries gaps in Pyodide without pulling full `vi_quant`.

- [x] `ema` / `exponential_moving_average` (span-based)
- [x] `change`, `index` (series normalization)
- [x] `percentiles` (simplified rolling percentile rank)
- [x] Friendly aliases (`sma` → `moving_average`) where useful
- [x] Keep `pages/js/pyodide-runner.js` ↔ `vi_browser/` in sync
- [x] Update `api-catalog.js` samples

**Exit:** golden script using EMA + change/index + percentiles runs twice with identical stdout on the same candles. ✅ (deterministic helpers)

**Non-goals:** full QuantLib/risk in WASM; parity with every GS Window edge case.

---

## Phase 2 — Data router

**Objective:** route familiar data entry points to Worker candles (or documented stubs) so scripts don’t die on missing APIs.

- [x] Wire `get_prices` / `get_last_price` → Worker candles (last bars), not mock-only
- [x] Wire `get_asset` → `GET /api/v1/assets/:provider/:symbol` (D1 + heuristics)
- [x] Thin browser `ViDataApi` / price helpers that call the same router
- [x] Document or implement `/api/v1/market-data/...` (thin alias OK)
- [x] Reject / document insufficient paths in LIMITATIONS

**Exit:** `get_prices(["AAPL","005930.KS"])` and `get_asset("AAPL")` return live-backed fields in the webview when Worker is up. ✅ (routes + client wiring; deploy to verify live)
---

## Phase 3 — Community evaluation (+ façade)

**Objective:** run and score **other people’s** quants on the same stage; optional GS-name façade package.

- [x] Share format (gist/repo link or R2 artifact) — [docs/SHARE_FORMAT.md](docs/SHARE_FORMAT.md); bundled `community-samples.js`
- [x] Rubric: reproducibility, risk metrics, data source, disclosed limits — [docs/COMMUNITY_RUBRIC.md](docs/COMMUNITY_RUBRIC.md)
- [x] UI: load shared sample → run → compare metrics (`#community` + Run & score)
- [x] Safety: browser-only execution; never server `exec`
- [x] (Optional) `vi_compat` façade: common `gs_quant.*` / `GsSession` aliases → `vi_browser`

**Exit:** one external script can be reproduced and scored on the stage. ✅ (`share-ma-cross-005930`)

---

## Phase 4 — LLM quant expansion

**Objective:** wire the stage to multi-LLM committee workflows.

- [x] LLM Quant Prompt UI + Worker (`POST /api/v1/llm/quant-prompt`)
- [x] DeepSeek V4 Pro / Flash; finance gate; 30s cooldown; 1m reject cache
- [x] Golden prompts + output schema (script / assumptions / risks)
- [x] Lab TokenForge ([vibequant.cc/lab](https://vibequant.cc/lab/)) — Korean/other coding prompts → caveman-ultra English; same Worker `DEEPSEEK_API_KEY` as Play; **no finance gate**
- [x] Worker `GET /api/v1/tokenforge/health`, `POST /api/v1/tokenforge/plan`, `POST /api/v1/tokenforge/optimize` (~12s IP cooldown). Memory stays in browser localStorage
- [ ] Archive successful prompt+stdout for human eval
- [ ] Multi-LLM bake-off harness (shared market snapshot)
- [ ] Optional local `vi_quant` heavy path (QuantLib desktop-only)

**Exit:** two models produce scripts that both run on the same candle snapshot with archived outputs.

---

## Phase 5 — Distribution

- [ ] PyPI `vi-quant` (optional local SDK)
- [ ] Docs site; public committee checklist
- [ ] CI: pytest + lint · `CONTRIBUTING.md`

**Won't-do (core):** claiming GS Quant replacement, Marquee/GS auth, server-side arbitrary Python,
free-tier bulk global ingest, “production hedge-fund OMS”, full QuantLib-in-browser.

## Non-Goals

- Numerically identical GS / Marquee results, or replacing GS Quant
- Full `vi_quant` / QuantLib inside Pyodide
- Replacing Cloudflare Free with multi-SaaS “for convenience”
- Streamlit/NiceGUI as the primary hosted dashboard on Cloudflare

## Related docs

- [docs/API_COMPAT_MATRIX.md](docs/API_COMPAT_MATRIX.md)
- [docs/SHARE_FORMAT.md](docs/SHARE_FORMAT.md)
- [docs/COMMUNITY_RUBRIC.md](docs/COMMUNITY_RUBRIC.md)
- [docs/DEPLOY_HISTORY.md](docs/DEPLOY_HISTORY.md)
- [docs/ARCHITECTURE_TARGET.md](docs/ARCHITECTURE_TARGET.md)
- [docs/LIMITATIONS.md](docs/LIMITATIONS.md)
- [docs/API_MAPPING.md](docs/API_MAPPING.md)
- [README.md](README.md)
