---
title: "How I Actually Run on the Cloudflare Free Tier — the VibeQuant Operations Case Study"
description: "A practical account of why and how VibeQuant is designed and operated entirely on Cloudflare's free tier — not a generic sign-up manual, but real operational decisions, pitfalls, and a stack that avoids fighting the free-tier limits."
abstract: |
  This document describes why and how VibeQuant was designed and operated using only Cloudflare's free tier, rather than
  repeating generic sign-up instructions. It covers Cloudflare's strengths (security, CDN, serverless integration) and
  weaknesses (daily request/CPU limits, KV write limits, weak native Python), compares it against Vercel/Netlify/Railway
  and other PaaS options, and lays out a stack (Markdown -> static HTML + TypeScript edge API + Pyodide) and a set of
  design rules that keep an SEO- and AI-search-friendly research archive running at zero infrastructure cost.
summary_for_ai: |
  Real-world operations case study for running vibequant.cc entirely on Cloudflare's free tier (Pages + Workers + Cache API/KV).
  Strengths: automatic HTTPS/DDoS mitigation at the edge, near-unlimited bandwidth for Pages static assets, R2's free egress,
  and integrated serverless (Pages + Workers/Functions + Cache/KV + R2/D1) in a single account.
  Weaknesses: Workers free tier is roughly 100k requests/day with ~10ms CPU per request, KV writes are capped around 1,000/day,
  Python support is Pyodide/WASM-based (no native numpy/heavy C extensions), and long-running Node backends or WebSockets fit
  better on Vercel/Railway/Fly.io.
  Recommended stack: Markdown source of truth on GitHub, static HTML build for Pages, TypeScript for edge APIs (Workers/Pages
  Functions), Cache API prioritized over KV for reads, and Pyodide in the browser for quant experiments that would otherwise
  hit CPU limits on the server.
  Design principles for staying on the free tier: build-time HTML over runtime rendering, aggressive caching, avoiding KV writes,
  offloading heavy computation to the client browser, and avoiding TCP/local-runtime assumptions (Prisma+Neon TCP, Puppeteer).
  Includes a minimal setup checklist (account, Wrangler CLI, Pages deploy, Worker deploy) and ten operational pitfalls actually
  hit in production (522 on unconnected subdomains, middleware accidentally blocking a path, R2 activation requiring a payment
  method, proxy environment variables breaking `wrangler` deploys, etc.).
date: 2026-07-24
author: "Dennis Kim"
lang: en
tags:
  - Cloudflare
  - Free Tier
  - Workers
  - Pages
  - Serverless
  - VibeQuant
keywords:
  - Cloudflare free tier
  - Cloudflare Workers limits
  - Cloudflare Pages deployment
  - VibeQuant architecture
  - Pyodide browser quant
  - Wrangler CLI
featured: false
schema_type: TechArticle
draft: false
---

# How I Actually Run on the Cloudflare Free Tier — the VibeQuant Operations Case Study

> Written: 2026-07-24 · Audience: developers who want to run a personal site, independent research project, or small open-source site **without ever switching to a paid plan**
> Related: [Cloudflare Free Tier Sign-Up & Limits Guide](Cloudflare%20free%20tier%20guide.md) · [Vercel Analysis](../vercel/vercel_analysis.md) · [Free Web Hosting Comparison](../Free_Hosting/FreeHosting.md) · Site: [vibequant.cc](https://vibequant.cc/)

This document is not "a Googled-and-LLM-generated manual without real operational experience." It's a record of **why and how [VibeQuant](https://vibequant.cc/) was designed and operated using only Cloudflare's free tier**.
For sign-up steps, limits, and quota numbers, see the existing [sign-up & limits guide](Cloudflare%20free%20tier%20guide.md).

---

## 1. What Is Cloudflare?

Cloudflare originally built its reputation on **DNS, CDN, and DDoS protection** as an edge network company. In the industry, it's often placed in front of Web3 services, exchanges, and other services with volatile traffic. Since the 2020s, it has expanded into a **developer platform** that bundles **Workers (serverless), Pages (static/SSR), R2 (object storage), D1 (SQLite), KV, and the Cache API** into a single account, handling "security in front of the domain + global distribution + a lightweight backend" all **on the same edge**. More recently, AI-related products such as **Workers AI and AI Gateway** have been added too.

In one line:

> **No matter where the traffic comes from, handle HTML, API calls, and caching at the nearest PoP, and eliminate as much origin server cost as possible.**

Even on the free plan, you get custom domains, HTTPS, CDN, basic WAF/bot mitigation, and Pages/Workers — with some limits. It fits well with something like VibeQuant: **a content archive + a thin API + browser-based quant experiments**.

I bought a custom domain, so the only cost I actually incur is the domain itself. A `*.pages.dev` subdomain would work too, but having a real domain helps with SEO and branding.

---

## 2. Advantages

### 2.1 Security

True to its DDoS-protection roots, Cloudflare filters abnormal requests before they ever reach your origin.

| Item | Meaning |
|------|------|
| Automatic HTTPS / TLS | Less burden managing certificate renewal |
| DDoS / bot mitigation | Absorbed at the edge even if the origin is weak |
| DNS lives on the same platform | Once nameservers point to Cloudflare, CDN, WAF, and Pages operate as one pipeline |
| Secrets live only in Workers | It naturally becomes structural to never put API keys in Pages HTML |

If your site is mostly static HTML, this becomes a design where **the origin server is never exposed**. Attack traffic hits **Cloudflare's edge** first, rather than your application server's CPU.
That said, on the free tier you still have **daily edge limits and fair-use policy** to deal with. Reduced origin bombardment is a separate matter from quota exhaustion and terms-of-service issues (see §3, §8).

### 2.2 CDN (Bandwidth That's Nearly Free)

Pages static assets can be served with close to **unlimited bandwidth** (subject to fair use / terms of service). R2's key differentiator is **free egress**. This means "more Columns/TechDoc HTML pages" doesn't translate into "a bandwidth cost bomb" — a notable contrast to Vercel Hobby's monthly bandwidth cap and overage billing structure.

### 2.3 Serverless Integration

A single account can combine roughly this:

```
Pages (HTML/SEO)  +  Pages Functions / Workers (API)
      +  Cache API · KV (cache)
      +  R2 / D1 (storage)
      +  Custom domain · subdomains
```

You don't need to split "static site on Provider A, API on Provider B, CDN on Provider C." VibeQuant splits roles this way: **content as static HTML on Pages**, **price/research APIs on Workers/Pages Functions**, and **browser-side quant work on Pyodide**.

For a small, individually-run **static site + thin edge API**, this means fewer failure points and simpler maintenance.

### 2.4 Other Practical Benefits

- Workers/Pages can be started **without a credit card** (some products like R2 may require a payment method depending on the product/timing — see §8)
- Prototype without even owning a domain, via `*.pages.dev` / `*.workers.dev`
- Wrangler CLI gives you the same deploy script locally and in CI
- Pairs well with a GitHub Markdown -> static HTML build pipeline (good for SEO/GEO)

---

## 3. Disadvantages

Being blunt here. Mistaking the free tier for an "unlimited PaaS" causes problems immediately.

| Drawback | Description |
|------|------|
| **Daily request/CPU limits** | Workers free tier is roughly **100k requests/day**, with about **~10ms CPU per request**. If you exhaust it during a peak, you can be blocked until UTC midnight (09:00 KST) |
| **KV write limits** | Free KV writes are capped at roughly 1,000/day — tight. Not suitable for sessions or real-time counters → **prefer the Cache API** as the practical pattern |
| **Weak native Python** | Workers' Python support is Pyodide/WASM-based. `numpy`, heavy C extensions, and long-running jobs are hard to put on the edge |
| **Cold-start / runtime constraints** | Full Node backends (long background jobs, WebSockets, arbitrary binaries) are often more comfortable on Vercel/Railway |
| **Debugging UX** | Local reproduction and logs can be frustrating until you get used to them |
| **Vendor boundaries** | Durable Objects, some AI features, and advanced WAF are paid. "Fully free enterprise-grade" is a fantasy |
| **Subdomain/project sprawl** | Attaching custom hosts to multiple Pages projects can make DNS, middleware, and redirects complicated (VibeQuant simplified this into a single hub project with path-based routing) |
| **Terms of service / fair use** | Even "unlimited" bandwidth can be restricted for abuse, attacks, or large-scale commercial distribution |

**Summary:** Strong for security, CDN, and static-plus-thin-API workloads, but **heavy backends, strongly-consistent databases, and long-running Python** are better placed elsewhere.

When traffic or roles exceed what fits, mix providers **by role**. For example: read cache -> Upstash Redis, long jobs/Python APIs -> Render/Railway, Next.js full-stack experiments -> Vercel (check terms/bandwidth). Rather than "just bolt on Vercel," attach **only the piece that fits the limits and terms**.

---

## 4. Competing Services (PaaS, Including Vercel)

| Service | Position | vs. Cloudflare |
|--------|--------|-----------------|
| **[Vercel](../vercel/vercel_analysis.md)** | Next.js-optimized PaaS, best-in-class DX | Hobby plan has commercial-use restrictions, bandwidth caps, and overage-billing risk. Attractive for Next.js full-stack apps; for **high-traffic static archives**, CF is often the better fit |
| **Netlify** | JAMstack, forms, build pipelines | Free-tier limits (e.g., build minutes) have been trending tighter |
| **GitHub Pages** | Docs, portfolios | Weak on serverless APIs, edge caching, integrated WAF. Best as **an archive of the original Markdown** (VibeQuant uses a dual GitHub + CF structure) |
| **Railway / Render / Fly.io** | Containers, long-running processes | Sleep, time limits, pressure to upgrade to paid. Well suited to Python API servers |
| **Firebase Hosting** | Google ecosystem | Strong when paired with Auth/Firestore |
| **AWS Amplify / Azure Static Web Apps** | Cloud-vendor lock-in | Good when integrating with enterprise IAM or an existing cloud. CF tends to be simpler for personal, free-tier operation |
| **Oracle Cloud Free** | Always Free VM | IaaS. More management burden, more control — see [separate guide](../OracleCloud/02.%20Oracle%20Cloud%20Free%20Tier%20Guide.md) |

Selection heuristic:

- **Next.js App Router-centric product** -> Consider Vercel first, but read the cost/terms before starting
- **Markdown archive + SEO + thin API + zero cost** -> Cloudflare Pages (+ Workers)
- **Long-running Python / DB workers** -> Railway, Render, Fly, or a separate VPS with only the front end on Cloudflare

Initial cost is generally lower than locking everything into AWS. Because DDoS and scraping get blocked **in front of the origin**, the origin server is far less likely to melt down instantly. But **edge limits and fair-use policy** remain (§3).

---

## 5. An Efficient Language and Stack Combination

A combination that **fights the free tier less**. Push complex backends out to other providers.

### 5.1 Recommended Stack (VibeQuant Style)

| Layer | Technology | Reason |
|------|------|------|
| Content source of truth | **Markdown (GitHub)** | Version control, PRs, AI search (DeepWiki, etc.), human readability |
| Publishing surface | **Static HTML** (build script) | Deploy to Pages with Core Web Vitals, OG tags, sitemap, `llms.txt` |
| Edge API | **JavaScript / TypeScript** (Workers, Pages Functions) | First-class runtime citizen. Pairs well with `fetch` and the Cache API |
| Browser-side quant | **Python + Pyodide** | Doesn't consume server CPU quota. GS Quant-style experiments run client-side |
| Cache | **Cache API** (preferred) · KV (read-heavy) | Avoids the KV write limit |
| Secrets | Worker environment variables / `wrangler secret` | Never bundle keys into the frontend |

### 5.2 Avoid or Push "Outside the Boundary"

- **Heavy numpy/pandas batch jobs** on Workers — use browser-side Pyodide or an external PaaS instead
- **Long-lived connections** like Prisma + Neon over TCP — needs a redesign for Pages Functions (REST/HTTP client + caching)
- **Puppeteer / local filesystem access** — not available at the edge. Pre-build the output or use a different runtime
- **LLM calls on every request** — cache, respect daily limits and cost. Call things like DeepSeek from a Worker, but **cache the result**

### 5.3 One-Line Language Summary

> **TypeScript for the edge, Markdown for documents, browser Python for quant experiments.**
> This triangle fits well with Cloudflare's free tier. Forcing a tech stack that doesn't fit tends to cost you completeness, stability, and latency.

---

## 6. How the Site Was Actually Built — Design and Concept

### 6.1 The Problem

1. **The volatility of news/column pages on the web**
   I've been writing news columns since 2000. Media outlets and blog platforms keep getting redesigned, old article URLs disappear, and gaps appear — like an entire block of pre-2014 columns going missing. Losing 14 years of writing is a serious problem for search, citation, and research continuity. Keeping it locked inside a search engine's closed platform (like Naver) also blocks discovery by Google and LLMs.
   -> **Permanently archive the original text as Markdown on GitHub**, and treat the web as **the publishing surface for that source of truth**.

2. **Optimizing for both human search (SEO) and AI search (GEO) at once**
   A GitHub tree alone is weak for Google and social OG previews, and agents like ChatGPT, Perplexity, and Cursor tend to skip citing content without `llms.txt`, semantic HTML, and individual URLs.
   -> Deploy to Pages with **individual document URLs + sitemap + llms.txt + canonical links back to the GitHub blob**.

3. **A testing ground built on the premise of zero infrastructure cost**
   Tens of dollars a month in PaaS fees is overkill for a personal research/open-source archive.
   -> Impose **operating entirely on Cloudflare's free tier** as a hard constraint.

4. **Separating "what quant shows" from "what quant runs"**
   Running GS Quant-style price/strategy validation on a server runs into limits and dependency issues.
   -> **The playground runs on Pyodide (browser-side Python)**; the API only handles prices, caching, and thin proxying.

### 6.2 The Concept in One Diagram

```
[GitHub vibe-investing]
  ├─ 02.Investment Idea Column / essays / CTI / TechDoc   ← source of truth / SEO source
  └─ VibeQuant/
        build → static HTML
             ↓
[Cloudflare Pages]  vibequant.cc  (hub)
  docs / tech / cti / play / essays / research …
             ↓
[Workers / Pages Functions]  price/research API · caching
             ↓
[Browser]  Pyodide + GS Quant-style experiments (no server CPU used)
```

### 6.3 Services Actually Deployed

| Surface | Example URL | Role |
|----|--------|------|
| Hub | [vibequant.cc](https://vibequant.cc/) | Entry point, branding |
| Columns | docs.vibequant.cc | Investment column archive |
| Tech | tech.vibequant.cc | TechDoc |
| CTI | cti.vibequant.cc | Threat intelligence reports |
| Play | play.vibequant.cc | Python/quant web view |
| Research | vibequant.cc/research | Quant / Space / Trump signals (no login, cached) |
| Essays | vibequant.cc/essays | Essays |

Principle: **never gate content behind a login wall.** Even the research dashboard is public, with cache TTLs used to stay within free-tier limits.

### 6.4 Design Rules for Staying "Free Only"

1. HTML is a build artifact — minimize runtime rendering
2. Cache everything cacheable (e.g., 30 minutes during market hours, 2 hours after close)
3. No excessive KV writes -> use the Cache API instead
4. Heavy computation runs in **the user's browser**, not the edge
5. Exclude anything assuming TCP connections or a local runtime — Neon/Prisma/Puppeteer — from what gets ported, or precompute it instead
6. Deploy with `wrangler pages deploy` — unset any local `HTTP_PROXY` if present

---

## 7. Basic Setup (Minimal Checklist)

For detailed quotas and migration, see the [sign-up & limits guide](Cloudflare%20free%20tier%20guide.md). Here's just **the minimal path**.

### 7.1 Account

1. [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Verify email
3. **2FA is mandatory** (the account is the key to every site)

### 7.2 Wrangler

```bash
# Node.js 18+
npm i -g wrangler   # or a project-local node_modules install
wrangler login
wrangler whoami
```

### 7.3 Deploying Pages

```bash
wrangler pages deploy ./dist --project-name=my-site --commit-dirty=true
# → https://my-site.pages.dev
```

Domain: Dashboard -> Pages -> Custom domains. Pointing nameservers to Cloudflare lets DNS and SSL be managed in one place.

### 7.4 Worker (API)

```bash
cd cloudflare-worker
wrangler deploy
wrangler secret put MY_API_KEY
```

**Don't force Pages and Worker configuration into a single `wrangler.toml`.**
It's safer to run Pages with `cd pages && wrangler pages deploy .`.

### 7.5 The VibeQuant-Style Pipeline (Concept)

```bash
node content/build.mjs
npx wrangler pages deploy ./pages --project-name=vibequant-web
```

The source of truth is always GitHub; the web version is a derivative. **Even if a news article gets deleted, the repository stays the source of truth.**

---

## 8. Things to Watch Out For (Real Operational Pitfalls)

1. **100k requests/day on Workers** — this can be exhausted by the afternoon during a market close or a viral spike. Reduce API calls with caching and static generation.
2. **1,000 KV writes/day** — writing page views to KV will blow through this instantly. Use the Cache API for prices/responses instead.
3. **~10ms CPU** — precompute heavy calculations and large JSON payloads, or push them to the client or an external service.
4. **Activating R2** — must be enabled from the dashboard, and may require a payment method (`10042`).
5. **Proxy environments** — an active `HTTP_PROXY` can cause deploys to `api.cloudflare.com` to fail.
6. **522 on subdomains** — before a custom host is connected, serve from the apex path and move it over once DNS is ready.
7. **Don't let middleware block a path** — overlaying a "coming soon" HTML page on `/research/*` hides both the static content and the API (a real incident that happened).
8. **Never put secrets in HTML/Git** — DeepSeek and exchange keys belong in Worker secrets.
9. **Free = no SLA** — keep the GitHub source and the `pages.dev` URL documented as backups.
10. **Commercial / large-scale scraping** — read the terms and fair-use policy, and distinguish between open research publication and abuse.

---

## 9. Summary

| Question | Answer |
|------|----|
| Why use Cloudflare? | Security + CDN + serverless on **a single edge**, running static sites and thin APIs for free |
| Where is it weak? | Heavy Python backends, strong consistency, long-running jobs, unpredictable traffic spikes |
| How does it differ from Vercel? | Vercel wins on Next.js DX and previews; Cloudflare often wins on **bandwidth, predictable cost, and edge integration** |
| VibeQuant's core constraint? | **Free tier only**, permanent GitHub source of truth, SEO + AI search, browser-based quant |
| The stack? | Markdown → static HTML + TypeScript edge API + Pyodide |

The experience of columns disappearing from the web, GitHub trees invisible to search and LLMs, and the fear of monthly bills — solving all three at once makes Cloudflare's free tier not a "second-best option" but **a deliberate choice**.

For a small team, it can be rational to see the free tier's **limits and strengths** and use it to cap costs until it's time to scale up. AWS no longer has to be the default for every workload.

---

## References

- [Cloudflare Free Tier Sign-Up & Limits Guide](Cloudflare%20free%20tier%20guide.md) (KR) · [EN](Cloudflare%20free%20tier%20guide_EN.md)
- [Vercel Platform Analysis](../vercel/vercel_analysis.md)
- [Free Web Hosting Guide](../Free_Hosting/FreeHosting.md)
- [Agent-Friendly Website Guide](../agent-friendly-website-guide/agent-friendly-website-guide.en.md)
- [GS Quant Getting Started](../GS_Quant/GS%20Quant%20Getting%20Started.md)
- [Pyodide](../Python_Pyodide/Pyodide.md)
- Cloudflare Workers Pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Workers AI: https://developers.cloudflare.com/workers-ai/
- VibeQuant deployment notes: `VibeQuant/cloudflare/DEPLOY_KR.md` (in-repo)
- Site: https://vibequant.cc/ · Source: https://github.com/gameworkerkim/vibe-investing
