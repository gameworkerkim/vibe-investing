# TOSS API — Cloudflare Worker IP Limitation

**Status:** Blocked on Free tier. Documented 2026-07-19.
**Live Worker:** `vibequant-api.gameworker-4bb.workers.dev`
**Issue:** TOSS Open API requires IP whitelisting; Cloudflare Workers Free tier has no fixed outbound IP.

## 1. Problem

| Component | IP | Fixed? |
|---|---|---|
| Worker inbound (Cloudflare CDN) | `104.21.24.185` / `172.67.219.230` | CDN edge — changes |
| Worker outbound (to TOSS API) | Cloudflare shared egress pool | **No fixed IP** |
| TOSS API requirement | IP whitelist at TOSS portal | Whitelist expects static IPs |

When the Worker calls `POST https://openapi.tossinvest.com/oauth2/token`, the
outbound request originates from a Cloudflare shared IP. TOSS rejects it unless
that exact IP is whitelisted. Even if we whitelist the current IP, it rotates.

## 2. Confirmed working (as of 2026-07-19)

```
$ curl -s https://vibequant-api.gameworker-4bb.workers.dev/api/health | jq .toss
{ "configured": true }

$ curl -s "https://.../api/v1/candles/yahoo/AAPL?days=3" | jq .source
"r2"   ← Yahoo data, cached in R2, served successfully

$ curl -s "https://.../api/v1/candles/mock/AAPL?days=3" | jq .source
"mock"  ← fallback when all providers fail
```

Yahoo Finance (no IP restriction) works. TOSS is configured but its direct path
is blocked by IP whitelist.

## 3. Options

| Option | Cost | Effort | Viability |
|---|---|---|---|
| **A: Ask TOSS to allow Cloudflare egress IPs** | $0 | 1 email | Low — unlikely |
| **B: Workers Paid + Static IP add-on** | ~$5–15/mo | 1 config change | Medium — may be Enterprise-only |
| **C: Fixed-IP VPS proxy** (AWS Lightsail / Vultr) | ~$3.5–6/mo | Create tiny Node.js forward proxy on VPS; Worker routes TOSS calls through it | **Recommended if TOSS is needed** |
| **D: Yahoo-only** (current) | $0 | None | **Recommended for Phase 1** — Yahoo covers global equities; TOSS is KR+US only |

## 4. Option C detail — VPS proxy

```
Worker                     VPS (fixed IP)              TOSS API
┌──────────┐   HTTPS      ┌──────────────┐   HTTPS    ┌──────────┐
│  Worker  │ ───────────▶ │  Node proxy  │ ─────────▶ │  TOSS    │
│  (CF IP) │ ◀─────────── │  (35.x.x.x)  │ ◀───────── │  API     │
└──────────┘              └──────────────┘            └──────────┘
```

Minimal VPS proxy (Node.js, ~30 lines):

```javascript
// TOSS proxy running on fixed-IP VPS
const express = require("express");
const app = express();

app.use(express.json());
app.post("/toss/oauth2/token", async (req, res) => {
  const r = await fetch("https://openapi.tossinvest.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(req.body).toString(),
  });
  res.status(r.status).json(await r.json());
});

app.get("/toss/*", async (req, res) => {
  const path = req.path.replace("/toss", "");
  const url = `https://openapi.tossinvest.com${path}`;
  const r = await fetch(url, { headers: { Authorization: req.headers.authorization } });
  res.status(r.status).json(await r.json());
});

app.listen(3000);
```

Worker then routes TOSS calls to `https://<vps-ip>:3000/toss/...` instead of `https://openapi.tossinvest.com/...`.

## 5. Decision (2026-07-19)

**Phase 1 / committee stage uses Yahoo only.** TOSS Worker path is **deferred later work**
(IP allowlist). Realtime KR feed will arrive via a **separate ingest path**, not
Worker→TOSS direct on Cloudflare Free. Option C remains the pragmatic path if a
fixed-IP proxy is chosen later.

## 6. Related
- [LIMITATIONS.md](LIMITATIONS.md) — hard stops table
- [cloudflare/DEPLOY.md](../cloudflare/DEPLOY.md) — Worker deployment
- `cloudflare/src/candles.ts:177-186` — TOSS path comments
