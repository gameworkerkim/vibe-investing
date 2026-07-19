# VibeQuant Roadmap

**Primary goals**

1. **Replace GS Quant at the API level** (`gs_quant` → `vi_quant`, `Gs*` → `Vi*`), using open
   data and open engines — not Marquee, not GS numbers.
2. **Dashboard verification loop:** user types a Python quant script in a webview →
   **Pyodide (WASM)** runs it → market data comes from **Cloudflare** → user verifies
   tables/charts/stdout.
3. **Cloudflare Free tier first.** Anything that needs Paid Workers, native QuantLib in-browser,
   or server-side Python execution is deferred or marked unavailable.

Tracking baseline: `goldmansachs/gs-quant` @ release 2.1.1.

**Guiding principle — thin vertical slice.** Ship one end-to-end path that actually runs:

`Pages webview → Pyodide script → Worker `/api/v1/candles` → R2/D1 → timeseries result`

…then widen coverage. Do not expand the legacy Vercel/Neon/Upstash stack.

Docs are written with cold free-tier/WASM constraints so multiple coding agents can implement
against the same normative limits (not aspirational “eventually paid” features).

## Phase 0 — Foundation (done / freeze)

- [x] Repo layout, Apache-2.0 + NOTICE
- [x] GS → VI mapping docs, vendor rename script
- [x] Local `ViSession` + vendored `timeseries` / `errors` / `datetime` (partial; see LIMITATIONS)
- [x] Legacy Express `backend/` + Python `providers/` (transitional)
- [ ] CI: pytest + flake8 matrix
- [ ] `CONTRIBUTING.md`

**Exit:** `pip install -e .`; subset timeseries tests pass. *(Met for subset.)*

## Phase 1 — Cloudflare data plane + Pyodide dashboard (ACTIVE)

**Objective:** free-tier market data on Cloudflare; script-in-webview verification.

### 1A — Cloudflare (Free)

- [ ] Hono Worker: `/api/health`, `/api/v1/candles/:provider/:symbol`,
      `/api/v1/assets/:provider/:symbol`, `/api/v1/market-data/...`
- [ ] Bindings: D1 (meta/index), R2 (candle body), Cache API (hot JSON)
- [ ] Schema: `assets`, `candle_objects`, `watchlist` (see ARCHITECTURE_TARGET)
- [ ] Yahoo ingest: daily Cron **or** lazy-on-read fill (Cron CPU = 10 ms — prefer lazy if Cron fails)
- [ ] Watchlist capped for free (e.g. 20–50 symbols)
- [ ] Freeze feature work on Express/`backend/` multi-SaaS path; keep for reference only
- [ ] TOSS: optional Worker path with secrets in CF secrets — **not** required for Phase 1 exit;
      no heavy TOSS pagination on free Cron — **[x] TOSS IP limitation documented (WORKER_TOSS_IP.md); Yahoo confirmed as primary provider**

### 1B — Pages + Pyodide webview

- [ ] Static dashboard: code editor + run + stdout/table/chart panes
- [ ] Load Pyodide; ship thin `vi_browser` (or equivalent) wheel/CDN package — **[x] `vi_browser/` package with `data.py` + `timeseries.py`**
- [ ] `get_candles` / `get_prices` → `fetch` Worker API only (no secrets in browser)
- [ ] Port WASM-safe subset: `returns`, `volatility`, `moving_average`, `correlation`,
      `max_drawdown` (pure pandas/numpy) — **[x] `vi_browser` module created; timeseries subset + data fetch**
- [ ] Golden script demo: Samsung/AAPL candles → vol/returns plot
- [ ] Document package load time and memory limits in UI

**Exit criteria**

1. Deploy on Cloudflare Free (Pages + Worker + D1 + R2).
2. User pastes a short Python script in the webview, runs it, sees verified output.
3. Script uses Cloudflare-backed candles (not server-side Python).
4. LIMITATIONS page lists every blocked GS/vi_quant feature for this path.

## Phase 2 — Local/heavy parity (not free WASM)

**Objective:** deepen GS API parity where WASM/free cannot go.

- [ ] Repair stub boundaries (`Dataset`, calendars, `ViDataApi`) so failures are explicit
- [ ] Local QuantLib pricing path (`Instrument.calc`) — **desktop/CI only**, not dashboard WASM
- [ ] Optional: sync Cloudflare R2 → local research notebooks
- [ ] Backtest engine locally; export summary artifacts to R2 if useful

**Exit:** one rename-friendly pricing example runs **locally**; dashboard still WASM-subset only.

## Phase 3 — Portfolio analytics (open models)

- [ ] Factor / scenario / hedge modules on open data (local first)
- [ ] Dashboard may call precomputed R2 artifacts; not full in-browser optimization

## Phase 4 — Distribution

- [ ] PyPI `vi-quant` (local SDK)
- [ ] Published docs site; parity status per symbol
- [ ] Compatibility harness for public symbols

**Won't-do (core):** Marquee UI, GS auth, ESG/Carbon/Workspaces long-tail shims,
server-side execution of arbitrary user Python, promising free-tier bulk global ingest.

## Non-Goals

- Numerically identical GS / Marquee results
- Full `vi_quant` inside Pyodide
- Replacing Cloudflare Free with multi-SaaS “for convenience”
- Streamlit/NiceGUI as the primary hosted dashboard on Cloudflare

## Related docs

- [docs/ARCHITECTURE_TARGET.md](docs/ARCHITECTURE_TARGET.md)
- [docs/LIMITATIONS.md](docs/LIMITATIONS.md)
- [README.md](README.md)
