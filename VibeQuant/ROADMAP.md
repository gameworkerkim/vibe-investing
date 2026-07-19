# VibeQuant Roadmap

**Positioning:** **Not** a GS Quant replacement. A **multi-LLM quant committee basic stage**
(educational sandbox OK) that borrows GS-style API names for familiarity.

**Primary goals**

1. **Committee stage:** reproduce/verify LLM outputs on the same `vi_browser` APIs + Cloudflare data.
2. **Dashboard verification loop:** webview Python → **Pyodide** → Worker candles → table/chart/stdout.
3. **Cloudflare Free first.** What WASM/free cannot do is deferred and documented.

**Sequence (normative)**

1. **Finish basic stage** (data, runner, charts, committee checklist) ← largely done
2. **Backtesting** (edu/reproducible metrics: Sharpe / MDD / CAGR) ← in progress / demo-ready
3. **Community** — evaluate others’ quants on the same stage
4. **LLM quant expansion** — committee workflows / agent bake-offs

**Thin vertical slice:**

`Pages → Pyodide → Worker /candles → R2/D1 → timeseries + edu backtest`

Do not expand the legacy Vercel/Neon/Upstash stack.

## Phase 0 — Foundation (done / freeze)

- [x] Repo layout, Apache-2.0 + NOTICE
- [x] GS → VI mapping docs, vendor rename script
- [x] Local `ViSession` + vendored `timeseries` / `errors` / `datetime` (partial; see LIMITATIONS)
- [x] Legacy Express `backend/` + Python `providers/` (transitional)
- [ ] CI: pytest + flake8 matrix
- [ ] `CONTRIBUTING.md`

**Exit:** `pip install -e .`; subset timeseries tests pass. *(Met for subset.)*

## Phase 1 — Cloudflare data plane + Pyodide dashboard (ACTIVE → near exit)

**Objective:** free-tier market data on Cloudflare; script-in-webview verification.

### 1A — Cloudflare (Free)

- [x] Hono Worker: `/api/health`, `/api/v1/candles/:provider/:symbol`
- [ ] `/api/v1/assets/:provider/:symbol`, `/api/v1/market-data/...` (stubs / later)
- [x] Bindings: D1 (meta/index), R2 (candle body), Cache API (hot JSON)
- [x] Schema: `assets`, `candle_objects`, `watchlist` (see ARCHITECTURE_TARGET)
- [x] Yahoo ingest: lazy-on-read fill (+ Cache → R2)
- [x] Watchlist capped for free (max 50) + `GET /api/v1/watchlist`
- [x] Freeze feature work on Express/`backend/` multi-SaaS path; keep for reference only
- [ ] **TOSS realtime — deferred (later work):** Worker→TOSS direct blocked by IP allowlist;
      KR realtime will use a **separate ingest path** (not required for Phase 1 exit).
      See [docs/WORKER_TOSS_IP.md](docs/WORKER_TOSS_IP.md).

### 1B — Pages + Pyodide webview

- [x] Static dashboard: code editor + run + stdout/chart panes (+ Clear, i18n, mock banner)
- [x] Load Pyodide; thin `vi_browser` bootstrap aligned with package
      (`returns`, `volatility`, `moving_average`, `correlation`, `max_drawdown`,
      `zscores`, `beta`, `annualized_return`, `sharpe_ratio`, `rsi`, `macd`, `bollinger_bands`)
- [x] `get_candles` → `fetch` Worker API only (no secrets in browser); local mock fallback
- [x] Golden script demo: Samsung/AAPL → chart + metrics (+ edu backtest sample)
- [x] Document package load time and memory limits in UI / LIMITATIONS

**Exit criteria**

1. Deploy on Cloudflare Free (Pages + Worker + D1 + R2). ✅
2. User pastes a short Python script in the webview, runs it, sees verified output. ✅
3. Script uses Cloudflare-backed candles (not server-side Python). ✅ (Yahoo; mock banner if fallback)
4. LIMITATIONS page lists every blocked GS/vi_quant feature for this path. ✅

## Phase 2 — Educational backtest (on the committee stage)

**Objective:** reproducible mini-backtests in the sandbox — not a production research engine.

- [x] Thin `vi_browser.backtest` helper (signals → positions → equity curve; next-bar)
- [x] Metrics: return, MDD, simple Sharpe, CAGR — stdout + chart
- [x] Golden backtest script (`ma_cross_signal` + `backtest`) + committee checklist items
- [x] Document day/memory caps (WASM) in LIMITATIONS / checklist

**Exit:** same script + same candles ⇒ same backtest numbers twice in the webview. ✅ (deterministic helper)

## Phase 3 — Community evaluation

**Objective:** run and score **other people’s** quants on the same stage.

- [ ] Share format (gist/repo link or R2 artifact)
- [ ] Rubric: reproducibility, risk metrics, data source, disclosed limits
- [ ] UI: load shared sample → run → compare metrics
- [ ] Safety: browser-only execution; never server `exec`

**Exit:** one external script can be reproduced and scored on the stage.

## Phase 4 — LLM quant expansion

**Objective:** wire the stage to multi-LLM committee workflows.

- [ ] Golden prompts + output schema (script / assumptions / risks)
- [ ] Multi-LLM bake-off harness (shared market snapshot)
- [ ] Optional local `vi_quant` heavy path (QuantLib desktop-only)

## Phase 5 — Distribution

- [ ] PyPI `vi-quant` (optional local SDK)
- [ ] Docs site; public committee checklist
- [ ] CI: pytest + lint · `CONTRIBUTING.md`

**Won't-do (core):** claiming GS Quant replacement, Marquee/GS auth, server-side arbitrary Python,
free-tier bulk global ingest, “production hedge-fund OMS”.

## Non-Goals

- Numerically identical GS / Marquee results, or replacing GS Quant
- Full `vi_quant` / QuantLib inside Pyodide
- Replacing Cloudflare Free with multi-SaaS “for convenience”
- Streamlit/NiceGUI as the primary hosted dashboard on Cloudflare

## Related docs

- [docs/ARCHITECTURE_TARGET.md](docs/ARCHITECTURE_TARGET.md)
- [docs/LIMITATIONS.md](docs/LIMITATIONS.md)
- [README.md](README.md)
