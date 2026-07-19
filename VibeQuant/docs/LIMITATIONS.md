# Limitations — Cold Assessment

This document lists **hard constraints and known breakages**. Treat them as product
truth for Free-tier Cloudflare + Pyodide dashboard development. Do not mark items here
as “done” in README/ROADMAP without removing the corresponding entry.

## 1. Product goals vs what is NOT promised

| Goal | Not promised |
|---|---|
| GS Quant API-level replacement | Full surface parity; Marquee datasets; GS auth |
| Same class/method names (`Gs`→`Vi`) | Same numerical results as Goldman Sachs |
| Dashboard Python scripts | Server-side execution of user code |
| Cloudflare Free hosting | Unlimited symbols, minute bars, global universe ingest |

## 2. Cloudflare Free — hard stops

| Limit | Approx. value | Feature impact |
|---|---|---|
| Worker CPU / request | **10 ms** | Heavy JSON parse / large Yahoo responses in-Worker fail or must be deferred |
| Worker CPU / Cron | **10 ms** | Daily Cron cannot bulk-ingest; prefer lazy fill |
| Requests / day | **100,000** | Shared by API + Cron; public abuse can exhaust quota |
| Subrequests / request | **50** | Deep TOSS pagination loops break |
| Worker bundle | **3 MB** | Bloated npm market SDKs may not fit; use thin `fetch` parsers |
| D1 writes / day | **100,000** | Do not store every bar in D1 |
| KV writes / day | **~1,000** | Avoid KV as primary cache on Free; use Cache API |
| Cron triggers / account | **5** | One simple schedule for Phase 1 |

**Latency expectations (honest):**

- Cache hit (edge): typically tens of ms.
- R2 read + Worker: often 50–200 ms+.
- Cold lazy Yahoo fill: **seconds**, provider-dependent; may hit CPU budget and fail.
- Pyodide first load (pandas/numpy): **several seconds to tens of seconds** on first visit.

## 3. Pyodide / browser compute — hard stops

| Constraint | Impact |
|---|---|
| No native extensions | **QuantLib unavailable** in dashboard |
| Package size / memory | Full `vi_quant` tree **will not** load; thin `vi_browser` only |
| Browser RAM | Large multi-asset backtests will OOM or freeze the tab |
| No secret access | TOSS OAuth cannot live in the webview |
| Single-threaded UI | Long scripts block the tab unless carefully chunked |
| Numeric parity | Same function names ≠ same floats as CPython/`vi_quant` local or GS |

**In-dashboard (Phase 1 target):** `get_candles`, `returns`, `volatility`,
`moving_average`, `correlation`, `max_drawdown` (and similar pure pandas helpers).

**Not in-dashboard:** `IRSwap.calc`, risk measures, full econometrics needing
`ViDataApi`/Marquee-style benchmarks, holiday calendars backed by remote Datasets.

## 4. Known code breakages (local `vi_quant` today)

These exist in the repo **now** and must not be advertised as working:

| Issue | Effect |
|---|---|
| `vi_quant.base` imports missing `json_convertors` | Module import fails |
| Holiday `Dataset` stub / missing `.id` | Calendars crash if forced; default calendars treat holidays as business days (e.g. US Independence Day) |
| `sharpe_ratio` / `excess_returns` default path | `NotImplementedError` via `ViDataApi` |
| `Asset.get_marquee_id` missing on stub | Asset-based econometrics paths fail |
| Python providers swallow exceptions | Empty data can look like “no ticker” |
| Express `backend` ↔ `ViSession.domain` | Not wired end-to-end; dual stacks |
| `/api/health` Express mount bug | Likely 404 if still using legacy server |
| Neon schema unused; Vercel cron path missing | “Implemented DB/cron” claims were overstated |

## 5. GS Quant compatibility — what breaks user expectations

| User expectation | Reality |
|---|---|
| `pip` install replaces Marquee workflows | Only offline/open subsets; many APIs stubbed |
| `Dataset('...')` like Marquee catalog | Stub / Phase work; IDs will not match GS |
| Business-day utilities “just work” | Without a real holiday feed they are wrong or crash |
| One-line migrate any gs-quant notebook | False for pricing, risk, portfolio, screens |
| Dashboard = full research workstation | Dashboard = **verification sandbox** for a small API subset |

## 6. Security constraints (dashboard)

- User code runs in the **user’s browser**, not a multi-tenant server sandbox.
- Still treat scripts as untrusted relative to the user’s own machine (XSS if UI is sloppy).
- Worker must never reflect upstream secret material in error bodies.
- Rate limits on Free are coarse; expect quota exhaustion under scraping.

## 7. When to leave Free / WASM (explicit future fork)

Only after Phase 1 exit, and only if documented as a new phase:

- Workers Paid for heavier ingest CPU
- Separate Python sandbox host for server-side notebooks (not Cloudflare Pages)
- Local QuantLib parity track (already Phase 2 in ROADMAP)

Until then, agents and contributors must implement the Free + Pyodide design, not a
hidden paid architecture.
