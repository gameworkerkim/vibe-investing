---
title: "Umami Self-Hosting Rollout Plan — vibequant.cc"
subtitle: "A realistic setup on top of Cloudflare's free tier, connecting Vercel/Fly.io + Worker proxy"
description: "Instead of running Umami purely on Cloudflare, this plan lays out two practical scenarios — hosting the app on Vercel or Fly.io and first-party proxying through a Cloudflare Worker — along with prerequisites, risks, and trade-offs."
abstract: |
  Umami officially supports only PostgreSQL/MySQL, making a native Cloudflare D1/Workers deployment impractical.
  For vibequant.cc, there are two workable paths — A (Vercel + Worker) and B (Fly.io + Worker) — and multi-subdomain strategy, build.mjs injection, and free-tier limits all need to be considered together.
  The recommendation is to validate quickly with A, then migrate to B if stability or cold starts become a problem.
summary_for_ai: |
  Implementation plan for self-hosting Umami analytics on vibequant.cc (Cloudflare Pages free tier).
  Not pure Cloudflare (no D1/Workers-native Umami). Scenario A: Vercel + Neon/Supabase + CF Worker proxy.
  Scenario B: Fly.io Docker + Neon/Supabase + CF Worker proxy. Covers pros/cons, risks, multi-subdomain injection via build.mjs, APP_SECRET, ad-blocker bypass, free-tier limits.
date: 2026-07-25
author: "Dennis Kim"
lang: en
tags:
  - Cloudflare
  - Umami
  - Analytics
  - Self-hosting
  - Free Tier
keywords:
  - Umami
  - vibequant.cc
  - Cloudflare Worker
  - Vercel
  - Fly.io
  - Neon
  - Supabase
  - first-party tracking
group: cloud-free
featured: false
schema_type: TechArticle
draft: false
---

# Umami Self-Hosting Rollout Plan — vibequant.cc

## 1. Introduction: A Practical Approach

Attempting to run Umami **entirely** on Cloudflare is appealing, but in practice it's **a path with high complexity.**

Umami **officially supports only PostgreSQL or MySQL,** and Cloudflare D1 (SQLite-based) is not officially supported. Cloudflare Workers run in a V8 Isolate environment, so a Node.js-based app like Umami can't be deployed as-is — you'd need to patch the database layer directly, and that patch carries a high risk of breaking with every update.

So this document examines two practical approaches to **"running Umami as close to Cloudflare as possible, but pragmatically."** The target sites are [vibequant.cc](https://vibequant.cc) and its subdomains, currently running on the Cloudflare Pages free tier.

Related background: this is the execution plan for "start with Web Analytics → expand to Umami if needed," as recommended in the [Cloudflare Web Analytics Solutions Guide](./CloudeFlare-Web-Analytics-Guide_EN.md).

| Approach | Description | Recommended When |
|--------|------|----------|
| **A. Vercel + Cloudflare Worker proxy** | Umami app on Vercel, DB on Neon/Supabase, tracking proxied via a Cloudflare Worker | Easiest and fastest. Top priority to validate and adopt first |
| **B. Fly.io + Cloudflare Worker proxy** | Umami app on a Fly.io container, DB on Neon/Supabase, tracking proxied via a Cloudflare Worker | When cold starts / serverless constraints become an issue. Requires some operational cost and setup |

```
Visitor's browser
    |
    |  script + /api/send  (analytics.vibequant.cc)
    v
Cloudflare Worker (first-party proxy)
    |
    v
Umami app (A: Vercel / B: Fly.io)  <-->  PostgreSQL (Neon or Supabase)
```

---

## 2. Scenario Comparison Summary

| Item | A. Vercel + Worker | B. Fly.io + Worker |
|------|--------------------|--------------------|
| Setup difficulty | Low (about 40–60 minutes) | Medium (CLI, memory scaling, deploy retries) |
| Monthly cost (small scale) | Can be effectively $0 | May not stay near $0 (see cost section below) |
| Cold start | Exists when Vercel Function + Neon/Supabase go idle | Low if the machine is always-on. Exists with scale-to-zero |
| Operational complexity | Fork syncing, Vercel build limits | Docker images, `fly scale`, IPv4 |
| Data ownership | DB on Neon/Supabase, app on Vercel | DB on Neon/Supabase (or Fly Postgres), app on Fly |
| Fit for vibequant.cc | **Top recommendation** | For migration after traffic/stability issues |
| Ad-blocker bypass | Equally possible via a custom Worker domain | Same |

**Conclusion (recommendation):** Adopt and validate with **A** first, then migrate to **B** if Vercel cold starts, Hobby-plan limits, or Prisma connection issues become noticeable. The Worker proxy and `analytics.vibequant.cc` domain design are reusable across both approaches.

---

## 3. Approach A: Vercel + Cloudflare Worker Proxy (Recommended)

This is the combination most widely used in the Umami community. Official guide: [Running on Vercel](https://docs.umami.is/docs/guides/running-on-vercel).

### 3.1 Architecture

```
Visitor's browser
    |
    |  GET /u.js , POST /api/send
    v
Cloudflare Worker @ analytics.vibequant.cc
    |
    v
Vercel (Umami Next.js)  <-->  Neon or Supabase (PostgreSQL)
```

### 3.2 Prerequisites

| Item | Notes |
|------|------|
| GitHub account | For forking Umami |
| Cloudflare account (free) | Already running vibequant.cc DNS/Pages |
| Vercel account (Hobby) | Sign in with GitHub |
| Neon or Supabase | Free PostgreSQL |
| `openssl` or a password generator | For `APP_SECRET` |
| Permission to modify the vibequant build pipeline | Injecting a script into `VibeQuant/content/build.mjs` |

### 3.3 Step-by-Step Installation

**Step 1: Fork the Umami repository**

Fork [umami-software/umami](https://github.com/umami-software/umami) to your GitHub account.

**Step 2: Create a PostgreSQL instance**

Create a project on [Neon](https://neon.tech) or [Supabase](https://supabase.com) and copy the connection string (`postgresql://...`).

- Neon: serverless Postgres, can suspend (cold start) when idle
- Supabase: check the free tier's DB storage and connection limits

**Step 3: Deploy Umami to Vercel**

1. In Vercel, use **Add New → Project** to import your forked `umami`
2. Set the environment variables:

| Variable | Value | Notes |
|--------|-----|------|
| `DATABASE_URL` | PostgreSQL connection string | Required. For Neon, use the pooled URL |
| `APP_SECRET` | Output of `openssl rand -hex 32` | For v2+. Replaces the older `HASH_SALT` from older docs ([Environment variables](https://docs.umami.is/docs/environment-variables)) |
| `TRACKER_SCRIPT_NAME` | e.g. `u` or `vq-beacon` | Use instead of the default `script.js` to reduce the chance of blocking |
| `COLLECT_API_ENDPOINT` | e.g. `/api/e` (optional) | Can be used instead of the default `/api/send` |
| `DISABLE_TELEMETRY` | `1` (optional) | Disables Umami's own telemetry |

3. After deploying, note the `.vercel.app` URL

**Step 4: Initial Umami setup**

1. Visit the deployed URL
2. Default account: `admin` / `umami` ([Login](https://docs.umami.is/docs/login))
3. **Change the password immediately**
4. Add a site under Settings → Websites and copy the **Website ID**

Since vibequant has multiple hosts, decide how to split up Websites before this step (see [Additional Requirements for vibequant.cc](#8-additional-requirements-for-vibequantcc) below).

**Step 5: Cloudflare Worker proxy**

The Worker needs to proxy **both the tracker script and the collection API.** If you only pass through `/api/send` as in the original guide, script loading breaks.

Example (adjust paths to match your actual `TRACKER_SCRIPT_NAME` / `COLLECT_API_ENDPOINT`):

```javascript
const UMAMI_ORIGIN = "https://your-umami.vercel.app"; // Vercel Umami URL
const SCRIPT_PATH = "/u.js";          // matches TRACKER_SCRIPT_NAME output
const COLLECT_PATH = "/api/send";     // or COLLECT_API_ENDPOINT

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const isScript = path === SCRIPT_PATH || path === SCRIPT_PATH.replace(/\.js$/, "");
    const isCollect = path === COLLECT_PATH;

    if (!isScript && !isCollect) {
      return new Response("Not found", { status: 404 });
    }

    const upstream = new URL(path + url.search, UMAMI_ORIGIN);
    const headers = new Headers(request.headers);
    headers.set("Host", new URL(UMAMI_ORIGIN).host);
    // Forward Cloudflare visitor location headers if enabled (with Managed Transforms)
    // CF-IPCountry, CF-IPCity, etc.

    const init = {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "follow",
    };

    const response = await fetch(upstream, init);
    const out = new Response(response.body, response);
    out.headers.set("Access-Control-Allow-Origin", "*"); // narrow to a host whitelist if needed
    return out;
  },
};
```

Notes:

- Do not hardcode the dashboard's statistics API token in the Worker source. Access the dashboard directly via the Vercel URL (or a separate protected path).
- In production, keep `UMAMI_ORIGIN` in Worker **Secrets / Vars.**

**Step 6: Custom domain**

Attach `analytics.vibequant.cc` to the Worker. Making tracking appear first-party (or a subdomain of the same registered domain) increases the odds of avoiding ad blockers. Community discussion: [umami#1026](https://github.com/umami-software/umami/discussions/1026).

**Step 7: Insert tracking code into vibequant.cc**

The correct script form is as follows (`src` points to the **script file**, not `/api/send`):

```html
<script
  defer
  src="https://analytics.vibequant.cc/u.js"
  data-website-id="YOUR_WEBSITE_ID"
></script>
```

Since static HTML is generated by `content/build.mjs`'s `layout()`, it's safer to insert this into the **build template's `<head>`** (e.g. `extraHead` or a shared snippet) rather than manually editing every `pages/**/index.html`. Then redeploy each affected Pages project (`vibequant-web`, `vibequant-tech`, `vibequant-cti`, etc.).

### 3.4 Pros and Cons

| Pros | Cons |
|------|------|
| Fastest setup, matches the official Vercel guide | Hobby plan Function execution time / concurrency limits |
| No Docker/CLI required | Neon/Supabase idle suspension can overlap with Vercel cold starts |
| Easy to keep cost near $0 | Fork needs to be periodically synced with upstream |
| Worker proxy is reusable if migrating to B | Possible Prisma + serverless DB connection pool issues (pooled URL is nearly mandatory) |
| Native Next.js hosting | Dashboard also lives on Vercel, so app and collection are both affected during an outage |

### 3.5 Risks (A)

| Risk | Impact | Mitigation |
|--------|------|------|
| Neon/Supabase idle suspension | Delayed/dropped first pageview | Periodic pinging, a minimal paid plan, or migrate to B |
| Exceeding Vercel Hobby limits | Deploy failures, bandwidth throttling | Monitor traffic; upgrade to Pro or move to B if needed |
| Using a non-pooled connection string | Intermittent DB errors | Use Neon's pooled / Supabase's pooler URL |
| Leaving the default `admin`/`umami` credentials | Dashboard takeover | Change the password immediately, minimize sharing the URL |
| Worker becoming an open proxy | Abuse, cost | Path whitelisting, Origin restrictions if needed |
| Neglected fork | Missing security patches | Periodically sync with the upstream remote |

---

## 4. Approach B: Fly.io + Cloudflare Worker Proxy

Choose this when Vercel's serverless constraints are burdensome or you want something closer to an always-on process. Official guide: [Running on Fly.io](https://docs.umami.is/docs/guides/running-on-fly-io).

### 4.1 Architecture

```
Visitor's browser
    |
    v
Cloudflare Worker (analytics.vibequant.cc)
    |
    v
Fly.io (Umami Docker)  <-->  Neon/Supabase or Fly Postgres
```

### 4.2 Setup Overview

1. Create a PostgreSQL instance on Neon/Supabase (same as A) — or create Postgres during `fly launch`
2. Install and log in to [flyctl](https://fly.io/docs/flyctl/)
3. Write a `fly.toml` and deploy. Example image:

```toml
# Based on the official docs example. Adjust region/app name for your environment
kill_signal = "SIGINT"
kill_timeout = "5s"

[experimental]
auto_rollback = true

[build]
  # See docs: docker.umami.is/... or ghcr.io/umami-software/umami:postgresql-latest
  image = "docker.umami.is/umami-software/umami:postgresql-latest"

[[services]]
  protocol = "tcp"
  internal_port = 3000
  processes = ["app"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20

  [[services.tcp_checks]]
    interval = "15s"
    timeout = "2s"
    grace_period = "1s"
```

4. Key operational steps (per the official docs):

```bash
fly secrets set APP_SECRET="$(openssl rand -hex 32)"
fly deploy
fly scale memory 512   # Umami often fails at 256MB
fly deploy
```

5. Log in: `admin` / `umami` → change the password
6. Follow the same Worker proxy / domain / site-script setup as Steps 5–7 in A (just change `UMAMI_ORIGIN` to the Fly URL)

### 4.3 Pros and Cons

| Pros | Cons |
|------|------|
| Container gives clear control | Learning cost of CLI, scaling, health checks, etc. |
| 512MB always-on mitigates cold starts | **The free tier's 256MB machine alone is likely insufficient** |
| Region selectable (e.g. `nrt`/`icn`) | Possible **small fixed charges**, e.g. for a public IPv4 ([Fly pricing](https://fly.io/docs/about/pricing/)) |
| Easy to reuse the Worker/DB from A | Responsibility for tracking/rolling back the `latest` image tag |
| Independent of Vercel Hobby limits | Machine costs and orphaned volumes can accumulate if left unmanaged |

### 4.4 Risks (B)

| Risk | Impact | Mitigation |
|--------|------|------|
| Under 512MB memory | OOM, deploy/migration failures | `fly scale memory 512` or higher |
| Assuming it's "free" | Monthly charges of a few dollars | Set billing alerts; check IPv4 and machine count |
| Also running Fly Postgres | Duplicate storage/machine cost | Keep the DB on Neon/Supabase instead |
| Scale-to-zero | Delay on the first request | Keep at least 1 machine always-on, or ping like in A |
| Region mismatch (app in Tokyo, DB in the US) | Latency in the collection API | Keep app and DB regions close together |

---

## 5. Common: Cloudflare Optimization and Why D1 Is Not Recommended

### 5.1 Cloudflare location headers

Enabling visitor location headers under Managed Transforms in the Cloudflare dashboard lets Umami better recognize country/region. Related environment variables: `CLIENT_IP_HEADER`, `SKIP_LOCATION_HEADERS` ([Environment variables](https://docs.umami.is/docs/environment-variables)).

### 5.2 Running Umami on D1

Running on D1 would require patching the DB layer.

- The patch would need to be reapplied with every Umami update
- Officially unsupported → you'd depend on the community during incidents
- D1's free quota and SQLite constraints

**Not recommended.** Free PostgreSQL on Neon/Supabase is more favorable relative to maintenance cost.

### 5.3 First-party tracking

The combination of `analytics.vibequant.cc` plus custom `TRACKER_SCRIPT_NAME` / `COLLECT_API_ENDPOINT` is the most realistic approach for avoiding ad blockers. This "bypass" is not perfect, and some strict blocklists may still catch it.

---

## 6. Cost Summary (Free Tier, 2026 Context)

| Service | Free/allowance (approx.) | Sufficient for Umami? | Caveats |
|--------|-------------------|-------------------|------|
| Cloudflare Workers | Daily request limit (per account plan) | Usually sufficient as a tracking proxy | Can be exhausted by open-proxy abuse/bots |
| Vercel Hobby | Bandwidth / Function limits | Usually enough for small content sites | Commercial-use limits, cold starts |
| Neon Free | Storage / compute time | Sufficient for early-stage, low-traffic use | Idle suspension |
| Supabase Free | DB storage / bandwidth | Sufficient early on | Check the project pause policy |
| Fly.io | Some shared CPU/time allowance exists | **May conflict with Umami's 512MB requirement** | Charges kick in past IPv4/memory limits |

**Realistic monthly cost expectations**

- **A:** can stay close to **$0** if traffic is not large
- **B:** hard to guarantee "completely free." Memory and IPv4 alone can incur a small monthly charge. Be sure to enable billing alerts.

"$0/month" is only a safe target with the **A + Neon/Supabase + Worker** combination.

---

## 7. Common Risks and Operational Issues

| Area | Notes |
|------|------|
| **Security** | Change default password, minimize dashboard URL exposure, don't put an API bearer token in the Worker, never leak `APP_SECRET` |
| **Privacy** | Umami is close to cookieless, but confirm it matches your public site's privacy policy/cookie banner policy. State retention period and purpose if you have EU visitors |
| **Data loss** | Free-tier deletion/pause policies on Neon/Supabase. Do periodic DB dumps or logical backups |
| **Accuracy** | Ad blockers, ITP, and bot filters mean PV is always somewhat under/overcounted. Recommend cross-checking against Cloudflare Web Analytics |
| **Dependencies** | Three axes: app host (Vercel/Fly) + DB (Neon/Supabase) + CF Worker. A gap in collection occurs if any one axis fails |
| **Updates** | Fork syncing (A) or pinned image tags (B). Have a rollback plan for failed Prisma migrations |
| **Abuse** | DB bloat via `/api/send` spam. Since the Website ID is inevitably public, monitor for rate limits and anomalies |

---

## 8. Additional Requirements for vibequant.cc

Below are the **additional tasks required specifically because of this repo's domain/site structure**, which aren't covered in the original guide.

### 8.1 Multi-host strategy

Current approximate mapping ([CUSTOM_DOMAIN_SETUP.md](../../VibeQuant/cloudflare/docs/CUSTOM_DOMAIN_SETUP.md)):

| Host | Pages project | Content |
|--------|----------------|--------|
| `vibequant.cc` | vibequant-web | Hub, essays, etc. |
| `docs.vibequant.cc` | vibequant-docs | Columns |
| `tech.vibequant.cc` | vibequant-tech | TechDoc |
| `cti.vibequant.cc` | vibequant-cti | CTI |
| `play.vibequant.cc` | vibequant-play | Playground |
| `lab` / `research` | respective | Experiments/research |

Options:

1. **A Website ID per host** — cleaner dashboards, branch the script's ID per host
2. **A single Website across multiple domains** — simpler configuration, filter by host/path in reports

For a content archive use case, **a Website per host** (docs / tech / cti / hub) is better for analysis.

### 8.2 Build pipeline injection

The tracking code should go into `<head>` of the `layout()` function in `VibeQuant/content/build.mjs`. Editing the generated HTML directly will just get overwritten on the next build.

Additional needs:

- Injecting `UMAMI_WEBSITE_ID_*` or the ID via a build-time env variable
- A flag to disable tracking during local previews (`UMAMI_ENABLED=0`)
- Redeploying **every affected Pages project** after the build

### 8.3 DNS / Worker

- `analytics.vibequant.cc` → Worker custom domain
- Verify no conflict with existing Pages custom domains
- CORS: since scripts and POSTs come from multiple subdomains, check the Worker/Umami CORS settings

### 8.4 Relationship with Cloudflare Web Analytics

If you're already using or plan to use Web Analytics:

- Short term: run **both in parallel** to cross-check numbers
- Medium term: once Umami stabilizes, keep Web Analytics only as a PV backup, or clean it up

Running both is cheap in page overhead, but be careful not to confuse double-counting when interpreting metrics.

### 8.5 Custom events (follow-up)

Add scroll depth, outbound clicks, etc. via Umami [Custom Events](https://docs.umami.is/docs/tracker-functions). Implement this after basic pageview tracking has stabilized.

### 8.6 Documentation and ops checks

- Never commit `APP_SECRET` or the DB URL to the repo (use `.env` / Vercel·Fly secrets)
- Incident contact channels: Vercel/Fly status, Neon/Supabase status
- Weekly: fork sync or verify image digest (optional)

---

## 9. Checklist: vibequant.cc Rollout Timeline

| Step | Task | Estimated Time |
|------|------|----------|
| 1 | Decide the per-host Website strategy (single vs. multiple IDs) | 10 min |
| 2 | Fork Umami on GitHub | 2 min |
| 3 | Create a Neon/Supabase PostgreSQL instance | 5 min |
| 4 | Deploy to Vercel + set `DATABASE_URL` / `APP_SECRET` / tracker name | 15 min |
| 5 | Log in, change password, add a Website | 5 min |
| 6 | Cloudflare Worker (script + collect proxy) + Secrets | 15 min |
| 7 | Connect `analytics.vibequant.cc` | 5 min |
| 8 | Verify Managed Transforms (visitor location) | 3 min |
| 9 | Insert the script into `build.mjs` + verify local build | 15 min |
| 10 | Redeploy the relevant Pages project | 10–20 min |
| 11 | Test visit → check Realtime/dashboard | 5 min |
| 12 | (Optional) Billing alert, DB backup, notes on running alongside Web Analytics | 10 min |

**Total estimate: about 1–1.5 hours** (including multi-host and build changes). The original guide's 40–50 minutes assumes a "single site, manual HTML insertion" scope.

Choosing Approach B from the start adds **+30–60 minutes** for Fly memory scaling and billing checks, plus the possibility of a small cost.

---

## 10. Recommended Decision

1. **First: Approach A (Vercel + Neon + Worker)**
   - The best fit for vibequant.cc in terms of cost, speed, and documentation maturity
2. **Proxy through `analytics.vibequant.cc` from the start**
   - Migrating to B later just means swapping the Worker origin
3. **Do not attempt D1/Workers-native Umami**
4. **Insert via build.mjs + use per-host Website IDs**
5. **Migrate to B once cold starts / Hobby limits become noticeable**
   - Until then, don't assume Fly is "free"

This combination keeps you close to the free tier while securing first-party tracking, data ownership, and a viable path for Umami updates. Starting light with Cloudflare Web Analytics and then attaching Umami via this plan gives the best return relative to operational burden.

---

## 11. References

### Official documentation

- [Umami — Running on Vercel](https://docs.umami.is/docs/guides/running-on-vercel)
- [Umami — Running on Fly.io](https://docs.umami.is/docs/guides/running-on-fly-io)
- [Umami — Environment variables](https://docs.umami.is/docs/environment-variables) (`APP_SECRET`, `TRACKER_SCRIPT_NAME`, `COLLECT_API_ENDPOINT`)
- [Umami — Login (default admin / umami)](https://docs.umami.is/docs/login)
- [Umami — Tracker functions / custom events](https://docs.umami.is/docs/tracker-functions)
- [Umami GitHub](https://github.com/umami-software/umami)
- [Fly.io — Resource pricing](https://fly.io/docs/about/pricing/)
- [Fly.io — flyctl](https://fly.io/docs/flyctl/)
- [Vercel — Rewrites](https://vercel.com/docs/rewrites) (alternative: same-domain proxy when the main app is on Vercel)
- [Neon](https://neon.tech) / [Supabase](https://supabase.com)

### Community and guides

- [Preventing ad blockers with Cloudflare Worker (umami#1026)](https://github.com/umami-software/umami/discussions/1026)
- [Self-hosted Umami on Vercel + Supabase (example post)](https://www.surajon.dev/how-to-self-host-umami-analytics-with-supabase-and-vercel)
- [Umami on Vercel + Neon (summary guide)](https://setuptracking.com/umami-vercel/)

### This repo

- [Cloudflare Web Analytics Solutions Guide](./CloudeFlare-Web-Analytics-Guide_EN.md)
- [VibeQuant Custom Domain Setup](../../VibeQuant/cloudflare/docs/CUSTOM_DOMAIN_SETUP.md)
- Tracking injection point: `VibeQuant/content/build.mjs` (`layout()` `<head>`)
