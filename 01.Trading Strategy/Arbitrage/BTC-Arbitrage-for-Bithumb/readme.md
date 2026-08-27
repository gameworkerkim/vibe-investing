# Bithumb × Binance Arbitrage Signal Bot

A serverless signal bot that compares prices between **Bithumb** (KRW market) and **Binance** (USDT market) in real time to detect **Kimchi premium** arbitrage opportunities. Built on Cloudflare Workers with a static dashboard and **Telegram alerts**.

| Item | Detail |
|---|---|
| Instruments | **BTC · ETH · SOL · XRP** (Bithumb KRW market ↔ Binance USDT market) |
| Stack | TypeScript · Cloudflare Workers · Cloudflare KV · static HTML dashboard |
| Schedule | Cron trigger every 5 minutes (`*/5 * * * *`) |
| Alerts | Telegram bot (HTML messages) |
| License | MIT (research purpose) |

> ⚠️ **Notice** — Depending on exchange withdrawal policies and South Korea's virtual-asset regulations, this arbitrage strategy may be **subject to taxation and regulation**.
> This project is provided for research and signal detection only and is not investment advice. Consult legal/tax professionals before deploying real capital.

---

## 1. How it works

On every scan (5 min):

1. Fetch **Bithumb** prices — `GET https://api.bithumb.com/v1/ticker?markets=KRW-BTC,...`
2. Fetch **Binance** prices — `GET https://api.binance.com/api/v3/ticker/price` (falls back to `data-api.binance.vision` when geo-blocked)
3. Fetch **USD/KRW** — primary: Bithumb's own `KRW-USDT` ticker (same-exchange conversion, no FX timing skew); fallback: Dunamu FX API
4. Compute the premium:

```
premium(%)    = (BithumbKRW / (BinanceUSDT × USD/KRW) − 1) × 100
spread(KRW)   = BithumbKRW − BinanceKRW
net(%)        = premium − Bithumb taker fee − Binance taker fee − withdrawal fee (as % of position)
```

5. Evaluate signals (with **hysteresis** + **cooldown**):

| Premium | Signal | Meaning |
|---|---|---|
| `≥ +1.5%` | 🔴 `BITHUMB_SELL` | Bithumb is expensive → **sell on Bithumb, buy on Binance** |
| `≤ -1.5%` | 🟢 `BITHUMB_BUY` | Bithumb is cheap → **buy on Bithumb, sell on Binance** |
| otherwise | ⚪ `NEUTRAL` | wait |

6. **Persist + alert** — snapshots/history go to KV; newly triggered signals are sent to Telegram.

> Hysteresis: once tripped, a signal only returns to NEUTRAL when the premium crosses back inside the clear threshold (`±0.5%`), preventing alert flapping.
> Cooldown: no re-alert within 30 minutes per coin.

## 2. Architecture

```
Cloudflare Worker (single serverless app)
├── scheduled (*/5 * * * *) ──▶ runArbitrageScan()
│     ├── providers/bithumb.ts   Bithumb public ticker API
│     ├── providers/binance.ts   Binance public ticker API (+ geo-block fallback)
│     ├── providers/fx.ts        USD/KRW (Bithumb KRW-USDT → Dunamu fallback)
│     ├── signals.ts             premium·net·hysteresis·cooldown (pure functions)
│     ├── storage.ts             KV snapshot/history/alert state
│     └── alerts.ts              Telegram HTML alerts
├── fetch ──▶ /api/*  (JSON API) | other paths → static dashboard (worker/static)
```

- **All data sources are public APIs** — no API keys required. Secrets are only Telegram token/chat ID and an admin token.
- **Pre-compute, then serve** — the cron stores results in KV; `/api/*` reads KV with edge caching (`s-maxage=240`).

## 3. Project layout

```
BTC-Arbitrage-for-Bithumb/
├── readme.md                  Korean README
├── README.md                  English README
├── CLAUDE.md                  Project rules
├── docs/DEVELOPMENT-PLAN.md   Development plan (Korean)
├── wrangler.jsonc             Workers config (cron·KV·static assets)
├── worker/
│   ├── src/
│   │   ├── index.ts           fetch + scheduled entry
│   │   ├── api.ts             /api/* JSON API
│   │   ├── scan.ts            scan pipeline
│   │   ├── signals.ts         signal engine (pure)
│   │   ├── config.ts          coins·thresholds·fees
│   │   ├── storage.ts         KV layer
│   │   ├── alerts.ts          Telegram send + message formatting
│   │   ├── env.ts             Env types
│   │   └── providers/         bithumb / binance / fx
│   └── static/                static dashboard (index.html + app.js)
├── test/                      vitest unit & integration tests
├── tsconfig.json / vitest.config.ts / package.json
└── .dev.vars.example          local secrets template
```

## 4. Local development

```bash
npm install
cp .dev.vars.example .dev.vars   # optional Telegram token etc.

npm run dev                      # wrangler dev --test-scheduled → http://localhost:8787
npm test                         # vitest
npm run typecheck                # tsc --noEmit
```

Test the cron handler locally:

```bash
# 1) terminal A: npm run dev
# 2) terminal B:
curl "http://localhost:8787/__scheduled?cron=*/5+*+*+*+*"        # run a scan
curl "http://localhost:8787/api/refresh?token=change-me-local"   # manual scan
curl "http://localhost:8787/api/status"    # snapshot
curl "http://localhost:8787/api/signals"   # signals
```

## 5. Deploy (Cloudflare)

```bash
# 1) Create KV namespace
npx wrangler kv namespace create ARB_DATA
# → paste the returned id into wrangler.jsonc kv_namespaces[0].id

# 2) Set secrets (never commit)
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
npx wrangler secret put ADMIN_TOKEN

# 3) Deploy
npm run deploy          # wrangler deploy (cron included)
npx wrangler tail       # logs
```

After deploy, the dashboard is available at `https://<your-worker>.<subdomain>.workers.dev/`.

## 6. API endpoints

| Path | Auth | Description |
|---|---|---|
| `GET /api/status` | none | Latest snapshot + premium history |
| `GET /api/signals` | none | Current signal list (by threshold) |
| `GET /api/health` | none | Health check |
| `GET /api/refresh?token=…` | `ADMIN_TOKEN` | Run a manual scan |
| `POST/GET /api/telegram/test?token=…` | `ADMIN_TOKEN` | Send a Telegram test message |

## 7. Configuration (`wrangler.jsonc` `vars` / secrets)

| Variable | Default | Description |
|---|---|---|
| `COINS` | `BTC,ETH,SOL,XRP` | Watchlist (comma separated) |
| `SIGNAL_THRESHOLD_PCT` | `1.5` | Signal trigger premium threshold (%) |
| `SIGNAL_CLEAR_PCT` | `0.5` | Hysteresis clear threshold (%) |
| `ALERT_COOLDOWN_MIN` | `30` | Re-alert cooldown per coin (min) |
| `BITHUMB_TAKER_FEE_PCT` | `0.04` | Bithumb taker fee (%) |
| `BINANCE_TAKER_FEE_PCT` | `0.1` | Binance taker fee (%) |
| `ASSUMED_CAPITAL_KRW` | `5000000` | Assumed position size for withdrawal-fee ratio (KRW) |
| `TELEGRAM_BOT_TOKEN` | — | Telegram bot token (**secret**) |
| `TELEGRAM_CHAT_ID` | — | Telegram chat/group ID (**secret**) |
| `ADMIN_TOKEN` | — | Admin token for manual APIs (**secret**) |

> Withdrawal fee estimates (`WITHDRAWAL_FEES_USD` in `worker/src/config.ts`) change with exchange policy — tune them to real values.

## 8. References

- [Bithumb Open API — Ticker](https://apidocs.bithumb.com/reference/현재가-조회)
- [Bithumb Developer Docs](https://apidocs.bithumb.com)
- [bithumb-ai-trade-kit (GitHub)](https://github.com/bithumb-official/bithumb-ai-trade-kit)
- [Binance Market Data API](https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints)

## 9. Disclaimer

- This project is a **research/educational signal detector**. It does not place orders or move funds automatically.
- Signals are estimates based on public quotes; fillability, fees, withdrawal delays, and slippage are not guaranteed.
- Korean virtual-asset taxation/regulation and exchange withdrawal policies change frequently — review them before operating with real funds.
