# TOSS Open API (Worker)

## Setup

Secrets overview (EN/KR): [../docs/SECRETS_SETUP.md](../docs/SECRETS_SETUP.md) · [../docs/SECRETS_SETUP_KR.md](../docs/SECRETS_SETUP_KR.md)

1. `./scripts/setup-secrets.sh --local` — write `TOSS_CLIENT_ID` / `TOSS_CLIENT_SECRET` to `.dev.vars`
2. `./scripts/verify-toss.sh` — OAuth + 1 page of candles (prints no secrets)
3. `./scripts/setup-secrets.sh --remote` — upload TOSS secrets to Worker
4. `npx wrangler deploy`

## Free-tier limits

- Max **2 pages × 200** bars per request (Worker CPU 10 ms)
- Prefer lazy `GET /api/v1/candles/toss/:symbol` — not Cron pagination

## IP allowlist

TOSS often returns:

```json
{"error":"access_denied","error_description":"IP address not allowed"}
```

You must allowlist:

- Your **developer machine IP** (for `verify-toss.sh`)
- **Cloudflare Workers egress** for the deployed API (TOSS console / support — CF IPs change; ask TOSS for Worker/server allowlisting guidance)

Until allowlisted, Worker responds with `source=mock_toss_fallback` (or `mock_toss_unconfigured` if secrets missing).

## Endpoints used

- `POST {TOSS_BASE}/oauth2/token` — client credentials
- `GET {TOSS_BASE}/api/v1/candles?symbol=&interval=1d&count=`

Default base: `https://openapi.tossinvest.com`
