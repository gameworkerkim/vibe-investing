---
title: "Cloudflare Web Analytics Solutions Guide — Comparing Web Analytics, Zaraz, and Umami"
subtitle: "How to pick the right metrics stack in the Cloudflare ecosystem, from pageviews to scroll depth and custom events"
description: "A breakdown of Cloudflare Web Analytics, Zaraz, and Workers Analytics Engine alongside Umami, Plausible, GoatCounter, and GA4 — strengths, weaknesses, use cases, and a step-by-step selection guide."
abstract: |
  When you publish content on Cloudflare Pages/Workers, the right analytics tool depends on what you actually need to see: per-post pageviews and referrers, scroll depth and custom events, or full data ownership.
  The practical path is to start with free, cookieless Web Analytics, add Umami for events and multi-site tracking, use Zaraz + GA4 for ads and funnels, and reach for Analytics Engine + Logpush + R2 only if you want to own the infrastructure end to end.
  Matomo, PostHog, and Clarity are usually overkill for a content archive. The recommended path is: start with Web Analytics, then expand to Umami if needed.
summary_for_ai: |
  TechDoc comparing web analytics options for Cloudflare-hosted sites (as of mid-2026 context in the article).
  Native: Web Analytics (privacy-first PV/referrer), Zaraz (tag manager), Workers Analytics Engine + Logpush + R2.
  Third-party/OSS: Umami, Plausible, GoatCounter, Matomo, GA4, PostHog/Clarity, Fathom, Simple Analytics, Ackee, Pirsch.
  Recommended path for content archives: start Web Analytics, expand to Umami; avoid heavy stacks unless needed.
date: 2026-07-25
author: "Dennis Kim"
lang: en
tags:
  - Cloudflare
  - Web Analytics
  - Umami
  - Zaraz
  - Privacy
  - Observability
keywords:
  - Cloudflare Web Analytics
  - Zaraz
  - Umami
  - Plausible
  - GoatCounter
  - Workers Analytics Engine
  - web analytics
  - privacy analytics
group: cloud-free
featured: false
schema_type: TechArticle
draft: false
---

# Cloudflare Web Analytics Solutions Guide — Comparing Web Analytics, Zaraz, and Umami

If you're running a site on Cloudflare and start wondering "who's actually reading my posts, and where are they coming from?", you'll find there are more analytics options than you might expect. The right direction depends entirely on whether you just want raw pageviews, or you need scroll depth and custom event tracking, or you want to fully own your data. This article walks through Cloudflare's native solutions as well as third-party and open-source tools, covering the trade-offs and best-fit use cases for each.

---

## 1. Cloudflare Native Solutions

### 1.1 Web Analytics (Top Recommendation · Best Starting Point)

Cloudflare Web Analytics carries the strongest possible pitch: **free and privacy-first.** It doesn't use cookies or browser fingerprinting, and you can enable it instantly from the same account you use for Cloudflare Pages. It provides Top Pages, Referrer, and country-level traffic breakdowns per site out of the box, with almost no burden of adding a banner to your site. Since you just need to add a site to start seeing metrics for docs/tech/cti hosts, it's ideal for **weekly reviews of per-post pageviews plus traffic sources**, or for experiments around turning off social media traffic.

Starting October 15, 2025, Cloudflare began enabling Web Analytics by default on all free domains, and a major 2026 upgrade is underway that combines it with RUM (Real User Monitoring) tooling and network-level insights. An April 2026 update also added **Navigation Type filtering and reporting**, letting you see whether users arrived via a link click, back/forward navigation, or a cache hit. Dashboard stability was also improved for large accounts (100+ sites), enabling account-wide aggregate queries across up to 1,000 sites.

The **drawbacks** are clear. Scroll depth, dwell time, custom events, and funnel analysis are all quite weak, the UI is shallow, and long-term raw data export and SQL querying are limited. You also have to configure each subdomain separately, which adds friction.

> **Best for:** weekly "per-post pageviews + traffic source" checks, measuring social media impact, and a light starting point.

### 1.2 Zaraz

Zaraz is a tool that **relays tags at the edge**, letting you control third-party scripts without hurting performance. Since GA or ad pixels are processed at the Cloudflare edge instead of being injected directly into the browser, page load performance can improve significantly.

However, Zaraz itself is not an analytics tool that gives you "research-grade reports" — it's closer to a **tag manager**. Attaching GA reintroduces complexity and consent issues, and it's often overkill for a content archive.

> **Best for:** only when you eventually need to run GA/ad pixels. If you don't need that right now, skip it.

### 1.3 Workers Analytics Engine / Logpush + R2

This combination is for developers who want **100% data ownership.** You can accumulate per-path counts and scroll beacons yourself from a Worker's `_middleware` or a Pages Function, and Workers Analytics Engine lets you query **unlimited-cardinality time-series analytics** via a SQL API.

Logpush automatically ships Cloudflare's logs to external storage or analytics tools like R2, S3, Splunk, and Datadog. In 2026, a **Pipelines** feature was added that lets you transform Logpush data into SQL and store it in R2 as Parquet or Apache Iceberg tables. This lets you build infrastructure that retains raw logs long-term while still supporting fast queries.

The **drawback** is that you have to **build the dashboard, data retention, and queries yourself.** Operational cost and development time are considerable.

> **Best for:** when you don't want Umami either and just want infrastructure that's "completely your own." Recommended for teams with data engineering capacity.

---

## 2. Third-Party and Open Source

### 2.1 Umami (OSS, Often Recommended)

Umami is an MIT-licensed open-source analytics tool that can be **self-hosted (or run in the cloud).** It supports pageviews, referrers, custom events, and multi-site tracking, with a script under 2KB. There are many examples of pairing it with Cloudflare Workers/Pages plus D1/PostgreSQL, so it fits well within the Cloudflare ecosystem.

It's a natural next step after Cloudflare Web Analytics if you want to track **"per-post plus events."** Bloggers who switched from Cloudflare Web Analytics to Umami have generally left positive reviews.

The **drawback** is that you have to manage hosting, backups, and updates yourself, and you have to define your own events for scroll depth. Note also that Umami officially only supports PostgreSQL or MySQL — Cloudflare D1 or SQLite is not officially supported.

> **Best for:** the step after Cloudflare Web Analytics, when you want to track "per-post plus events."

### 2.2 Plausible (Open Core / Paid SaaS)

Plausible is a tool with a **clean UX and a strong privacy focus,** with excellent goal/custom event configuration and shared dashboard features. You can also proxy Plausible requests through Cloudflare Workers to send them to your own domain, which helps with ad-blocker avoidance.

The **drawback** is that the SaaS plan is paid. Self-hosting is possible, but the operational burden is similar to Umami's.

> **Best for:** when you're willing to pay for a clean UI and fast dashboards.

### 2.3 GoatCounter (OSS)

GoatCounter is a **very lightweight** open-source tool that supports both a free tier and self-hosting. It provides simple metrics centered on pageviews and referrers. There are also cases of pairing it with Cloudflare R2 for redirect tracking.

The **drawback** is that event tracking and segmentation are weak, so it falls short for "read-depth" analysis.

> **Best for:** when you just want ultra-lightweight pageview tracking.

### 2.4 Matomo (OSS)

Matomo is a powerful tool that provides **GA-level features** (heatmaps, sessions, goals) on-premises. However, it's **heavy and places a big burden on your server/DB,** and doesn't fit well with a static Pages architecture.

> **Best for:** **not recommended** at the current scale.

### 2.5 GA4 (+ Zaraz Optional)

GA4 offers **rich** scroll, engagement time, and navigation path tracking. Combined with Zaraz, you can collect GA4 data without hurting performance.

The **drawback** is a heavy cookie/consent and privacy burden, a poor fit for a content site's image, and issues with sampling and a learning curve.

> **Best for:** only when ad/funnel analysis is required.

### 2.6 PostHog / Clarity, etc.

These provide insight closer to **"how far did they actually read"** through session replay and heatmaps. But they're **heavy, come with PII/consent issues,** and are overkill for a CTI/column archive.

> **Best for:** product SaaS use cases, not the top priority for a public archive.

---

## 3. Other Tools Worth Considering

| Tool | Type | Characteristics | Best For |
|------|------|------|------|
| **Fathom** | Paid SaaS | Privacy-focused, similar to Plausible. Tight single-page UI and strict privacy policy | Similar positioning to Plausible. Choose based on UI preference |
| **Simple Analytics** | Paid SaaS | Offered as a Cloudflare app, so it's easy to install. No cookies | When you want an experience integrated with the Cloudflare dashboard |
| **Ackee** | OSS · Self-hosted | Node.js-based. Custom data queries via GraphQL API | When you're comfortable with Node.js and prefer GraphQL |
| **Pirsch** | Paid SaaS | Affordable privacy-focused tool starting at $6/month | Budget-constrained startups looking for a cost-effective paid option |

---

## 4. Summary: A Step-by-Step Selection Guide

| Stage | Recommended Tool | Reason |
|------|----------|------|
| **Stage 1: Start** | Cloudflare Web Analytics | Free, zero-setup, privacy-safe. Best for checking "PV + traffic source" |
| **Stage 2: Expand** | Umami (self-hosted) | Custom events, multi-site, data ownership |
| **Stage 3: Advanced** | Plausible (paid) / Workers Analytics Engine | When you care about UI/speed, or want fully custom infrastructure |
| **Special Purpose** | Zaraz + GA4 | Only when ad/funnel analysis is essential |
| **Not Recommended** | Matomo / PostHog / Clarity | Overkill for the current content archive scale |

Within the Cloudflare ecosystem, the smartest strategy is to **"start with Web Analytics, then expand to Umami when needed."** The two don't conflict, so it's also worth running them side by side to compare. If you want to fully own your data, the Workers Analytics Engine + Logpush + R2 combination is worth considering — but it's worth pausing to ask whether Umami alone might already be enough before going there.
