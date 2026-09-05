# VibeQuant

An open-source take on [GS Quant](https://github.com/goldmansachs/gs-quant) — the Vibe Quant website demo. Built for shared execution and verification across a multi-LLM quant committee. Live demo market data uses **Yahoo** via Cloudflare Worker (TOSS realtime deferred — IP allowlist). 

*LLMs are spreadsheets for reasoning, not oracles of prediction. The market owes certainty to no one.*

Trust here is not oracle-level forecast accuracy. It comes from **open-source contribution** and a **Python-verifiable quant workflow** you can reproduce yourself.

**Positioning (normative):** This is **not** a GS Quant replacement. We borrow the API style
(`gs_quant` → `vi_quant`, `Gs*` → `Vi*`) as a familiar surface for a
**multi-LLM quant committee stage / educational sandbox**. After the basic stage is solid:
backtesting → community review of others’ quants → LLM-native quant features.
Full map: [docs/API_MAPPING.md](docs/API_MAPPING.md).

Product split (normative):

| Concern | Where it runs | Why |
|---|---|---|
| Market data (quotes, candles, assets) | **Cloudflare** (Workers + Pages + D1 + R2 + CDN) | Single platform, free-tier first |
| Quant computation (scripts, timeseries, backtests) | **Browser Python via Pyodide (WASM)** | Workers cannot run full Python/`vi_quant`; no server-side `exec` |

## Explicit goals

1. **LLM committee basic stage:** same APIs + same market data for reproducible verification (edu sandbox OK).
2. **Dashboard script verification:** webview Python → Pyodide → Cloudflare candles → chart/table/stdout.
3. **Cloudflare Free tier first:** limits live in LIMITATIONS. Not goals: GS/Marquee number parity, full `vi_quant` in WASM.

Korean docs: [README_KR.md](README_KR.md) · [ROADMAP_KR.md](ROADMAP_KR.md).

## Compatibility notice (cold)

| Claim | Reality |
|---|---|
| API-compatible with GS Quant | Target for a **subset** of public APIs. Many vendored symbols are stubs or crash today. |
| Same numbers as GS / Marquee | **Never promised.** Different data and models. |
| Full `vi_quant` in the browser | **No.** Only a thin WASM-safe subset (`vi_browser` / selected timeseries). |
| Server runs user Python | **No.** Arbitrary server-side Python is out of scope (security + Workers limits). |
| Free-tier = unlimited ingest | **No.** See [Limitations](docs/LIMITATIONS.md). |

## Target architecture

![Vibe Quant on Cloudflare Free — Pages + Pyodide, Worker, Cache/D1/R2, optional local vi_quant](images/Vibe_Quant_CloudFlare.png)

Details: [docs/ARCHITECTURE_TARGET.md](docs/ARCHITECTURE_TARGET.md) ·
honest constraints: [docs/LIMITATIONS.md](docs/LIMITATIONS.md).

**Legacy note:** `backend/` (Express + Vercel/Neon/Upstash) and local `vi_quant/providers/`
remain as transitional code. New work targets Cloudflare + Pyodide. Do not expand the
multi-SaaS path.

## Cloudflare Free tier — what works / what does not

| Capability | Free tier | Notes |
|---|---|---|
| Pages static dashboard + Pyodide UI | Yes | Primary UI path |
| Worker REST for candles/assets | Yes (budget) | 100k req/day, **10 ms CPU**/invocation |
| D1 meta + R2 candle objects | Yes | Candles live in **R2**; D1 holds indexes only |
| CDN / Cache API | Yes | Hot responses |
| Cron ingest | Limited | **10 ms CPU** per cron — small watchlist, daily, or lazy-on-read |
| Durable Objects heavy rate-limit | Avoid | Prefer Cache + validation on free |
| Full Yahoo bulk history in Worker | Unreliable | Prefer R2 cache + lazy fill; keep parsing tiny |
| TOSS realtime via Worker | Deferred | IP allowlist blocks Free egress; separate ingest later |
| QuantLib / full gs-quant surface in WASM | No | Native / size / stub gaps |
| Streamlit / NiceGUI on Cloudflare | No | Long-lived Python servers ≠ Pages/Workers |

## Dashboard (browser demo)

**Live site:** [https://vibequant.cc](https://vibequant.cc/) · dashboard [https://vibequant-web.pages.dev/#workspace](https://vibequant-web.pages.dev/#workspace)  
**Play (quant prompt):** [https://play.vibequant.cc/play/](https://play.vibequant.cc/play/)  
**Lab (TokenForge):** [https://vibequant.cc/lab/](https://vibequant.cc/lab/) — Korean/other coding prompts → caveman-ultra English via DeepSeek (same Worker key as Play; mock fallback if the TokenForge route is not deployed yet)  
**User manual (Examples / LLM / Python):** [docs/USER_MANUAL.md](docs/USER_MANUAL.md) · [KR](docs/USER_MANUAL_KR.md) · [ZH](docs/USER_MANUAL_ZH.md)  
**Committee checklist:** [docs/COMMITTEE_CHECKLIST.md](docs/COMMITTEE_CHECKLIST.md)

| Overview | Runner |
|---|---|
| ![Vibe Quant dashboard overview (EN)](images/VibeQuant_Dashboard01_EN.png) | ![Vibe Quant Python runner (EN)](images/VibeQuant_Dashboard02_EN.png) |

```bash
cd pages
python3 -m http.server 8787
# open http://127.0.0.1:8787/  — UI language follows the browser (ko / en / zh)
```

Python input → Pyodide run → result pane. Candles via Worker (`provider=yahoo`); mock fallback shows a banner. Educational `backtest()` is in the golden sample.

### Cloudflare Pages / D1 / R2 / CDN build & deploy

```bash
cd /path/to/VibeQuant/cloudflare   # not $HOME
npm install
./scripts/setup-secrets.sh --local
./scripts/bootstrap.sh
export VIBEQUANT_API_BASE="https://vibequant-api.<SUBDOMAIN>.workers.dev"
./scripts/deploy.sh
./scripts/upload-static.sh ./static/images/foo.png images/foo.png
```

Full guide & troubleshooting (R2 10042, Pages 8000002, `--remote`, `wrangler.pages.toml`):  
[cloudflare/DEPLOY.md](cloudflare/DEPLOY.md) · [DEPLOY_KR.md](cloudflare/DEPLOY_KR.md)

## Quick start (local library — today)

```bash
pip install -e .
```

```python
import pandas as pd
from vi_quant.session import ViSession
from vi_quant.timeseries import returns, volatility, moving_average

ViSession.use()
prices = pd.Series(...)   # supply your own series for now
print(volatility(prices, 22))
```

Dashboard path is live (see [ROADMAP.md](ROADMAP.md)). Webview shape:

```python
# Runs in Pyodide — not on the Worker
from vi_browser import get_candles, ma_cross_signal, backtest, show_chart

candles = await get_candles("005930", days=180)   # → Cloudflare Worker API
bt = backtest(candles, ma_cross_signal(candles, 10, 30), fee_bps=10)
show_chart(bt["equity"], title="equity")
print(bt["metrics"])
```

Derivative pricing remains **unimplemented** (local/heavy; not in WASM free path):

```python
# PLANNED — does not run today
from vi_quant.instrument import IRSwap
from vi_quant.risk import Price
IRSwap('Pay', '10y', 'USD').calc(Price())
```

## Documentation

| Document | Description |
|---|---|
| [docs/USER_MANUAL.md](docs/USER_MANUAL.md) | User manual — Examples / LLM / Python |
| [docs/USER_MANUAL_KR.md](docs/USER_MANUAL_KR.md) | User manual (Korean) |
| [docs/USER_MANUAL_ZH.md](docs/USER_MANUAL_ZH.md) | User manual (Chinese) |
| [ROADMAP.md](ROADMAP.md) | Phased plan (API compat 0–4 + Cloudflare stage) |
| [docs/API_COMPAT_MATRIX.md](docs/API_COMPAT_MATRIX.md) | Browser / local / stub / planned pass-fail |
| [docs/API_COMPAT_MATRIX_KR.md](docs/API_COMPAT_MATRIX_KR.md) | API compat matrix (Korean) |
| [docs/DEPLOY_HISTORY.md](docs/DEPLOY_HISTORY.md) | Production deploy log + recent commits |
| [docs/DEPLOY_HISTORY_KR.md](docs/DEPLOY_HISTORY_KR.md) | Deploy / commit history (Korean) |
| [docs/CONTENT_SITE_PLAN_KR.md](docs/CONTENT_SITE_PLAN_KR.md) | Columns · TechDoc · SEO site plan (Korean) |
| [docs/CONTENT_SITE_PLAN.md](docs/CONTENT_SITE_PLAN.md) | Content site plan (English) |
| [docs/SHARE_FORMAT.md](docs/SHARE_FORMAT.md) | Community share JSON schema (Phase 3) |
| [docs/COMMUNITY_RUBRIC.md](docs/COMMUNITY_RUBRIC.md) | Community evaluation rubric |
| [docs/ARCHITECTURE_TARGET.md](docs/ARCHITECTURE_TARGET.md) | Bindings, schema, cron, cost |
| [docs/LIMITATIONS.md](docs/LIMITATIONS.md) | Latency, compatibility, free-tier hard stops |
| [docs/API_MAPPING.md](docs/API_MAPPING.md) | GS → VI API map |
| [docs/API_MAPPING_KR.md](docs/API_MAPPING_KR.md) | GS → VI API map (Korean) |
| [docs/PROVIDER_API_MATCHING.md](docs/PROVIDER_API_MATCHING.md) | Provider interface map |
| [docs/PROVIDER_API_MATCHING_KR.md](docs/PROVIDER_API_MATCHING_KR.md) | Provider interface map (Korean) |
| [docs/OFFICIAL_DOCS_GUIDE.md](docs/OFFICIAL_DOCS_GUIDE.md) | GS official docs correspondence |
| [docs/OFFICIAL_DOCS_GUIDE_KR.md](docs/OFFICIAL_DOCS_GUIDE_KR.md) | GS official docs correspondence (Korean) |
| [docs/TECH_REVIEW_DASHBOARD.md](docs/TECH_REVIEW_DASHBOARD.md) | Tech review: dashboards over Node.js |
| [docs/TECH_REVIEW_DASHBOARD_KR.md](docs/TECH_REVIEW_DASHBOARD_KR.md) | Tech review: dashboards over Node.js (Korean) |
| [docs/TECH_REVIEW_CLOUDFLARE.md](docs/TECH_REVIEW_CLOUDFLARE.md) | Tech review: Cloudflare vs Vercel |
| [docs/TECH_REVIEW_CLOUDFLARE_KR.md](docs/TECH_REVIEW_CLOUDFLARE_KR.md) | Tech review: Cloudflare vs Vercel (Korean) |
| [SECURITY.md](SECURITY.md) | Trust boundaries (CF + WASM) |
| [docs/SECRETS_SETUP.md](docs/SECRETS_SETUP.md) | DeepSeek / Cloudflare / TOSS secrets |
| [docs/SECRETS_SETUP_KR.md](docs/SECRETS_SETUP_KR.md) | Secrets manual (Korean) |
| [docs/LLM_QUANT_PROMPT.md](docs/LLM_QUANT_PROMPT.md) | LLM Quant Prompt + DeepSeek |
| [docs/LLM_QUANT_PROMPT_KR.md](docs/LLM_QUANT_PROMPT_KR.md) | LLM Quant Prompt (Korean) |
| [README_KR.md](README_KR.md) | Korean README |
| [ROADMAP_KR.md](ROADMAP_KR.md) | Korean ROADMAP |

## Status

**Pre-Alpha.** Committee demo stage is usable; edu backtest is in `vi_browser`.
Not a production pricing / research engine.

| Module | Status |
|---|---|
| `vi_quant.session` / `timeseries` (local) | Partial — subset tested |
| `vi_quant.providers` (Python direct) | Implemented (local research only — not the dashboard path) |
| `vi_browser` (indicators + `backtest`) | Implemented — synced into Pages Pyodide bootstrap |
| `backend/` Express (Vercel stack) | Implemented — **legacy**, freeze feature work |
| Cloudflare Worker + D1 + R2 | Live — Yahoo candles; TOSS deferred |
| Pages + Pyodide webview (`pages/`) | Live — https://vibequant-web.pages.dev/ |
| Lab TokenForge (`pages/lab/`, source `pages-lab/`) | Live UI — https://vibequant.cc/lab/ (Worker `/api/v1/tokenforge/*`; mock until Worker deploy) |
| `instrument` / `risk` / QuantLib | Not started — local/heavy later |

## License

Apache 2.0. Independent open-source project — not affiliated with Goldman Sachs.
"GS Quant" is referenced only for API compatibility under Apache 2.0.

## Disclaimer

Research and education only. Not investment advice. Validate models and data before
any real capital use.
