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

## Dashboard

![Bithumb x Binance arbitrage signal dashboard](docs/assets/dashboard.png)

Live capture from a local `wrangler dev` run with real public quotes. Every premium here sits within ±0.1%,
which is exactly what `FX_MODE=usdt` is expected to show — see [§1.1](#11-which-usdkrw-do-you-mean).
`추정 순이익` (estimated net) goes negative once fees are deducted, i.e. **there is no executable edge at this moment**.

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
net(%)        = |premium| − Bithumb taker fee − Binance taker fee − withdrawal fee (as % of position)
```

`net` uses **`|premium|`** on purpose. Arbitrage earns the *magnitude* of the gap regardless of direction:
a −3% premium means "buy on Bithumb, sell on Binance" for a +3% gross edge. Subtracting costs from the signed
value would render that as −3.14%, which reads like a loss.

### 1.1 Which USD/KRW do you mean?

The two conversion bases measure different things, and the choice changes what the threshold means.
Set it with the `FX_MODE` var:

| `FX_MODE` | Rate source | What the premium means | Typical magnitude |
|---|---|---|---|
| `usdt` (default) | Bithumb `KRW-USDT` ticker | **Executable spread** — the coin-specific gap left after the stablecoin premium cancels out on both legs. This is what you actually capture by moving USDT. | ±0.1% — `±1.5%` almost never fires |
| `fx` | Dunamu `FRX.KRWUSD` | **Headline Kimchi premium** — includes the USDT premium itself. | Swings by whole percent |

If you want alerts that fire at all, either run `FX_MODE=fx`, or keep `usdt` and lower
`SIGNAL_THRESHOLD_PCT` to something on the order of the real spread (e.g. `0.3`).
Whichever source is picked first, the other one is used as a fallback when it is unreachable.

5. Evaluate signals (with **hysteresis** + **cooldown**):

| Premium | Signal | Meaning |
|---|---|---|
| `≥ +1.5%` | 🔴 `BITHUMB_SELL` | Bithumb is expensive → **sell on Bithumb, buy on Binance** |
| `≤ -1.5%` | 🟢 `BITHUMB_BUY` | Bithumb is cheap → **buy on Bithumb, sell on Binance** |
| otherwise | ⚪ `NEUTRAL` | wait |

6. **Persist + alert** — snapshots/history go to KV; newly triggered signals are sent to Telegram.

> Hysteresis: once tripped, a signal only returns to NEUTRAL when the premium crosses back inside the clear threshold (`±0.5%`), preventing alert flapping.
> A move past the threshold in the *opposite* direction flips the signal immediately, without waiting to pass through NEUTRAL.
> Cooldown: no re-alert within 30 minutes per coin. The cooldown clock starts only when a Telegram send actually
> succeeds — a failed send does not consume the window.

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
- **Pre-compute, then serve** — the cron stores results in KV; `/api/*` reads KV with edge caching
  (`max-age=0, s-maxage=240`: shared caches reuse for 4 min, browsers always revalidate).
- **Partial failure is survivable** — a coin missing from one exchange is stored as `null` and skipped for signals;
  the other coins still scan. Every upstream call has an 8 s timeout.
- **KV write budget** — the free plan allows 1,000 writes/day and a 5-minute cron is 288 scans/day.
  Each scan writes the snapshot + history (2 writes); alert state is written **only when it changes**.

## 3. Project layout

```
BTC-Arbitrage-for-Bithumb/
├── readme.md                  This file (English)
├── CLAUDE.md                  Project rules (Korean)
├── docs/DEVELOPMENT-PLAN.md   Development plan (Korean)
├── docs/assets/dashboard.png  Dashboard screenshot
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
│   │   └── providers/         bithumb / binance / fx / http (timeout + UA)
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
curl -H "Authorization: Bearer change-me-local" \
     "http://localhost:8787/api/refresh"                         # manual scan
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
| `GET /api/status` | none | Latest snapshot + premium history + thresholds |
| `GET /api/signals` | none | Current signal list (by threshold) |
| `GET /api/health` | none | Health check |
| `GET /api/refresh` | `ADMIN_TOKEN` | Run a manual scan |
| `GET /api/telegram/test` | `ADMIN_TOKEN` | Send a Telegram test message |

Admin endpoints prefer the header form — a token in the query string ends up in Cloudflare logs,
browser history, and `Referer`:

```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" https://<worker>/api/refresh
```

`?token=…` still works for local `curl` convenience. Comparison is constant-time, and admin/error
responses are returned `no-store` so a stale 401 or 502 never sticks in a shared cache.

## 7. Configuration (`wrangler.jsonc` `vars` / secrets)

| Variable | Default | Description |
|---|---|---|
| `COINS` | `BTC,ETH,SOL,XRP` | Watchlist (comma separated) |
| `FX_MODE` | `usdt` | `usdt` = executable spread · `fx` = headline Kimchi premium ([§1.1](#11-which-usdkrw-do-you-mean)) |
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
> The net estimate also **omits** KRW deposit/withdrawal cost, transfer latency, order-book depth, and slippage,
> so treat it as an optimistic upper bound rather than a P&L figure.

## 8. References

- [Bithumb Open API — Ticker](https://apidocs.bithumb.com/reference/현재가-조회)
- [Bithumb Developer Docs](https://apidocs.bithumb.com)
- [bithumb-ai-trade-kit (GitHub)](https://github.com/bithumb-official/bithumb-ai-trade-kit)
- [Binance Market Data API](https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints)

## 9. Disclaimer

- This project is a **research/educational signal detector**. It does not place orders or move funds automatically.
- Signals are estimates based on public quotes; fillability, fees, withdrawal delays, and slippage are not guaranteed.
- Korean virtual-asset taxation/regulation and exchange withdrawal policies change frequently — review them before operating with real funds.
