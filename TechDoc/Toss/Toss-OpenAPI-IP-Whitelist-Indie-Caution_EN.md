---
title: "Toss Open API IP Whitelist Shift — Caution for Indie Developers"
title_en: "Toss Open API IP Whitelist Shift — Caution for Indie Developers"
subtitle: "OAuth works until CI and laptops fail: lessons from broker Open APIs that allowlist fixed IPs only"
description: "How Toss Open API IP allowlisting broke GHA and local OAuth, emptied CASSANDRA KOSDAQ JSON for a month, and forced a Naver Finance rollback."
abstract: |
  Toss Securities Open API looks indie-friendly: OAuth Client Credentials, KR/US quotes, docs and llms.txt.
  Once calls are bound to console-registered IPs, GitHub-hosted runners and home/CGNAT IPs fail at token issue time.
  CASSANDRA AI shipped empty KOSDAQ artifacts for a month; the root cause was Toss OAuth, not DART. This tech note covers testing, ops pitfalls, the Naver rollback, and a checklist for indie builders.
summary_for_ai: |
  Tech guide (EN). Toss Open API + IP allowlist broke GHA/local batch (2026-06–07). Evidence: cassandra-ai empty kosdaq JSON; Naver Finance rollback 2026-07-26. Not investment advice.
date: 2026-07-26
updated: 2026-07-26
author: "Dennis Kim"
lang: en
tags:
  - Toss
  - OpenAPI
  - IP Whitelist
  - GitHub Actions
  - Indie Dev
  - Naver Finance
keywords:
  - "Toss Open API IP whitelist"
  - "broker Open API OAuth"
  - "GitHub Actions dynamic IP"
  - "Naver Finance rollback"
  - "indie developer API caution"
group: quant-data
featured: true
featured_rank: 2
schema_type: TechArticle
draft: false
robots: index,follow
---

# Toss Open API IP Whitelist Shift — Caution for Indie Developers

## OAuth works — until CI and your laptop do not

2026.07.26 Dennis Kim / 김호광

| Item | Detail |
|:---|:---|
| Document version | 1.0 |
| Date | 2026-07-26 |
| Subject | Toss Securities Open API (OAuth Client Credentials + IP allowlist) |
| Related code | [gameworkerkim/cassandra-ai](https://github.com/gameworkerkim/cassandra-ai) |
| Audience | Indie/side-project builders, quant monitor operators, teams batching quotes in CI |
| Summary | How broker Open APIs that allowlist fixed IPs fail quietly on GHA/laptops, and a Naver Finance rollback field report |

---

## 1. Introduction

Broker Open APIs look like the clean path for indie developers: official specs plus a key. Toss Securities Open API fit that story — OAuth 2.0 Client Credentials, KR/US quote batching, docs and `llms.txt`. We moved CASSANDRA AI’s (KOSDAQ DART risk monitor) quote layer from Naver Finance’s unofficial mobile API to Toss.

A month later the KOSDAQ anomaly report showed `totalStocks: 0` and every subset JSON was `[]`. The DART key still worked; GitHub Actions stayed green. The failure was not filings — it was **quote OAuth rejecting callers outside the allowlisted IPs**.

This is a caution note, not a complaint. IP binding is reasonable for finance. It is a poor fit for indie stacks, side projects, and public CI. Below is what testing and ops actually looked like.

Korean source / column twin: [02.Investment Idea Column/TOSS/readme.md](https://github.com/gameworkerkim/vibe-investing/blob/main/02.Investment%20Idea%20Column/TOSS/readme.md)

---

## 2. What we wired — and what broke

### 2-1. The 2026-06 migration choice

| Item | Detail |
|------|--------|
| Repo | [cassandra-ai](https://github.com/gameworkerkim/cassandra-ai) (local: dart-monitor) |
| Commit | `56056d0` — Naver Finance → Toss Open API |
| Call sites | `extract-kosdaq.ts`, `naver-crawler.ts`, `/api/quant-data`, `backfill-marketcap.ts` |
| Auth | `POST /oauth2/token` · `grant_type=client_credentials` |
| Quotes | `GET /api/v1/prices`, `GET /api/v1/candles` |
| Runtime | GitHub Actions (daily-sync, 09:00/18:00 KST) + local |

The intent was clear: replace scraping with an official API; inject `TOSS_CLIENT_ID` / `TOSS_CLIENT_SECRET` via GHA vars.

### 2-2. Symptoms

- `data/kosdaq-anomaly-report.json` → `totalStocks: 0` (from `f81e2f3` on 2026-06-26 onward)
- All `kosdaq-*.json` files → `[]`
- Logs: `Toss token issue failed` → `no Toss token — returning empty list`
- GHA step: `continue-on-error: true` + script **exit 0** → green workflow + empty JSON auto-commits

Failures were packaged as success. When security policy changes and monitors still look “healthy,” you burn a month.

### 2-3. Root cause: allowlisted IPs only

Toss Open API console/policy tightened so **only registered IPs** may obtain tokens or call the API. Valid client secrets still fail if the source IP is outside the allowlist.

| Environment | IP behavior | Result |
|-------------|-------------|--------|
| Home/café laptop | Variable public IP · CGNAT | Token failure |
| GitHub-hosted runner | New pool IP per job | Token failure |
| Fixed-IP VPS / office line | Can be allowlisted | (In theory) works |

That is exactly the **GHA + laptop** combo most indie builders use.

---

## 3. Checklist from testing and production use

### 3-1. Instrument token issuance first

Early `getTossToken()` only warned on `!res.ok` and omitted HTTP status/body. Without separating 401 (credentials) from 403 (IP/policy), you assume “the key died.”

Minimal local probe:

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST \
  'https://openapi.tossinvest.com/oauth2/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "grant_type=client_credentials&client_id=...&client_secret=..."
```

- **200** + `access_token` → current IP is allowlisted
- **4xx** → log the body; decide key vs IP/policy

### 3-2. “Official API” ≠ “CI-friendly”

| Question | What indie projects should check |
|----------|----------------------------------|
| Is there an IP allowlist? | If yes, GitHub-hosted runners are nearly a non-starter |
| Do you need a self-hosted runner / fixed IP? | Ops cost can exceed secret management cost |
| Is there an unofficial quote fallback? | Naver mobile API, Yahoo — no SLA, but no IP binding |
| Do empty payloads count as success? | `totalStocks===0` must fail the job |

### 3-3. Never put secrets in `vars`

We used `vars.TOSS_CLIENT_*`. Repository variables are broader exposure than secrets (logs/permissions). Independent of IP policy: **credentials always belong in secrets**.

### 3-4. Re-check product universe and units

During the Toss migration, dynamic KOSDAQ small-cap screening (under KRW 500bn market cap, SPAC filter) regressed into a hard-coded large-cap-heavy universe. Even with working OAuth, that breaks the original thesis (stressed microcaps). API migrations need regression tests for **universe, filters, and units (억 vs raw KRW)** — not only auth.

As of 2026-07, Naver’s `marketValue` API also ignores `sortType` (change/volume) and returns market-cap order only. On rollback we restored gainer/volume rankings with **client-side sorts**. Query params that “used to work” can break too.

---

## 4. Decision: roll back to Naver

As of 2026-07-26, CASSANDRA batch/quote paths use **Naver Finance mobile API** again.

| Layer | After rollback |
|-------|----------------|
| `scripts/extract-kosdaq.ts` | `m.stock.naver.com` marketValue + SPAC/cap filters |
| `src/lib/naver-crawler.ts` | Naver scraping restored |
| `/api/quant-data` | KOSDAQ sentiment gauge via Naver |
| `scripts/backfill-marketcap.ts` | Naver market-cap map → `Corp.marketCap` |
| GHA `daily-sync` | Drop TOSS env; exit 1 if `totalStocks=0` |

You do not have to delete Toss keys. A **fixed-IP ingest box** (idle iMac / VPS) on the allowlist can use Toss again. For an indie stack that wants **public GHA only at $0/mo**, Naver/Yahoo is operationally simpler.

Code: [gameworkerkim/cassandra-ai](https://github.com/gameworkerkim/cassandra-ai)  
Infra direction (ingest ≠ serve): `docs/CLOUDFLARE_MIGRATION.md` in that repo

---

## 5. One-liners for indie developers

1. **When picking a broker Open API, read network binding (IP / mTLS / device) before auth docs.**  
2. **If CI IPs are not fixed, that API becomes a SPOF for batch pipelines.**  
3. **Never commit empty data as success.** A red X is cheaper than a month of `[]` history.  
4. **Official APIs and unofficial quotes have different jobs.** Orders/accounts → official + fixed network; public monitor quotes → fallback-capable sources.  
5. **Policies change.** A valid key can stop working overnight — put OAuth itself in health checks.

---

## 6. Closing

Toss Open API’s IP whitelist is a natural finance-grade hardening. The clash is with the default indie environment: laptop + GitHub Actions. CASSANDRA lived that clash as a month of silent empty JSON, then rolled KOSDAQ quotes and market-cap backfill back to Naver.

For anyone wiring a broker API into a side project, the lesson is short: **network boundaries, not keys, decide product lifetime.**

---

*For information only — not investment advice. Toss, Naver, and other marks belong to their owners.*
