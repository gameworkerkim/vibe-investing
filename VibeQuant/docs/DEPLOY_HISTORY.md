# VibeQuant deploy & commit history

Living log of **production deploys** and the **git commits** they ship.
How to deploy: [cloudflare/DEPLOY.md](../cloudflare/DEPLOY.md).
Roadmap: [ROADMAP.md](../ROADMAP.md).

| Doc | Language |
|---|---|
| This file | English |
| [DEPLOY_HISTORY_KR.md](DEPLOY_HISTORY_KR.md) | 한국어 |

**URLs (stable)**

| Surface | URL |
|---|---|
| Pages (dashboard) | https://vibequant-web.pages.dev/ |
| Lab (DART Monitor) | https://vibequant.cc/lab/ |
| Worker (API) | https://vibequant-api.gameworker-4bb.workers.dev |
| Health | https://vibequant-api.gameworker-4bb.workers.dev/api/health |
| TokenForge health | https://api.vibequant.cc/api/v1/tokenforge/health |

**Commands (from `VibeQuant/cloudflare`)**

```bash
npm run deploy:worker
npm run deploy:pages
# or: ./scripts/deploy.sh
```

Git push alone does **not** update Pages/Worker.

---

## How to append

After each production deploy, add a new row under **Deploy log** (newest first):

1. Date/time (KST)
2. Git commit SHA on `main` that was deployed
3. Worker version ID (wrangler output) and/or Pages deployment URL
4. One-line summary of what changed

---

## Deploy log

### 2026-07-20 (pending Pages) — Phase 3 community + deploy history docs

| Field | Value |
|---|---|
| Git | (this commit) — Phase 3 community UI/rubric/share format + DEPLOY_HISTORY docs |
| Pages | Deploy after push (`npm run deploy:pages`) |
| Notes | `#community` section, `share-ma-cross-005930`, `vi_compat` GS aliases |

### 2026-07-20 ~15:02 KST — API compat Phases 0–2

| Field | Value |
|---|---|
| Git | `67cb4cc` on `main` — *Ship API compat Phases 0–2: matrix, timeseries shims, and data router.* |
| Worker | `vibequant-api` · Version ID `3f3945bf-83b4-412d-b29a-46df4c463784` · health `version: "0.3.0"` |
| Pages | project `vibequant-web` · this deploy https://969d2f97.vibequant-web.pages.dev → alias https://vibequant-web.pages.dev/ |
| Commands | `npm run deploy:worker && npm run deploy:pages` |

**Shipped**

- Roadmap restructured around API compat Phases 0–4; foundation (CF + Pyodide + edu backtest + LLM prompt) marked complete
- Phase 0: [API_COMPAT_MATRIX.md](API_COMPAT_MATRIX.md) (+ KR)
- Phase 1: browser shims — `ema` / `sma`, `change`, `index`, `percentiles` (`vi_browser` + `pyodide-runner.js`)
- Phase 2: data router — `get_prices`, `get_asset`, `get_last_price`, thin `ViDataApi`
- Worker routes: `GET /api/v1/assets/:provider/:symbol`, `GET /api/v1/prices/:provider?symbols=`, `GET /api/v1/market-data/:provider/:symbol`

**Smoke (post-deploy)**

```bash
curl -sS https://vibequant-api.gameworker-4bb.workers.dev/api/health
# expect: status=ok, version=0.3.0, assets/prices/market_data fields present
```

---

## Commit history (VibeQuant track, recent)

Commits under `VibeQuant/` on `main` (newest first). Full history: `git log -- VibeQuant/`.

### 2026-07-20

| SHA | Subject |
|---|---|
| `67cb4cc` | Ship API compat Phases 0–2: matrix, timeseries shims, and data router. |

### 2026-07-19 (committee stage hardening)

| SHA | Subject |
|---|---|
| `dcb3738` | Polish manuals with screenshots and fix README doc tables. |
| `99d2dfd` | Update Korean user manual for clarity and detail |
| `0bc3339` | Add files via upload |
| `05ef4bf` | Default LLM Quant model to DeepSeek V4 Flash. |
| `9d19cae` | Add 2x2 workspace, user manuals, and finance-only LLM errors. |
| `d5d4e13` | Stack workspace as LLM prompt, Python, then result with copy actions. |
| `85de656` | Reject short candle caches and store a fuller Yahoo series in R2. |
| `d95f214` | Require None-safe formatting in LLM-generated Python. |
| `24e6809` | Add LLM prompt running spinner and progress phases. |
| `7bbf07e` | Tighten LLM Python contract for Pyodide vi_browser lists. |
| `e9135e2` | Polish LLM Quant Prompt: golden chips, schema checks, DeepSeek status. |
| `bab9005` | Document DeepSeek and secrets setup in English and Korean. |
| `23b2c4f` | Add LLM Quant Prompt with DeepSeek V4 Pro/Flash. |
| `7346eb9` | Improve Momentum example output, grades, and N/A ranking. |
| `010b4cf` | Fix demo sample formatting when indicator values are None. |
| `b1459bb` | Add semiconductor Examples demos for the web runner. |
| `5f38d9f` | Sync demo indicators with vi_browser and ship educational backtest. |
| `3c909b4` | Add RSI, MACD, Bollinger Bands + show_chart to vi_browser |
| `b65641d` | Document TOSS API IP limitation, close issue |
| `dcd0568` | Ship P0/P1 ops: TOSS Worker path, watchlist, security hooks, Pages UX. |
| `71087f8` | Add live demo screenshots to READMEs and ship Pages GS/VI UI. |
| `e0e3a25` | Vibe Quant Dashboard |

Repo-root docs sometimes land outside `VibeQuant/` (e.g. `f0d391d` refresh `llms.txt`).

---

## Related

- [cloudflare/DEPLOY.md](../cloudflare/DEPLOY.md) — how to build & deploy
- [ROADMAP.md](../ROADMAP.md) — Phase 0–4 status
- [API_COMPAT_MATRIX.md](API_COMPAT_MATRIX.md) — pass/fail API map
- [LIMITATIONS.md](LIMITATIONS.md) — Free-tier / WASM hard stops
