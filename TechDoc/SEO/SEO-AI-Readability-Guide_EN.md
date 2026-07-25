---
title: "vibequant.cc SEO & AI Readability Practical Guide"
subtitle: "A runbook for making sites that search engines and AI search/agents read well from the same foundation"
description: "A practical SEO and AI-readability guide for Cloudflare Pages multi-subdomain setups — covering GSC, Naver, IndexNow, and AI Overviews, with Phase 1–7 checklists."
abstract: |
  A practical SEO and AI-readability runbook distilled from optimizing vibequant.cc.
  There is no separate AI index; the core sequence is infra checks first, then registration, indexing, on-page, AI structure, domestic channels, and measurement.
  Checklists and mythbusting as of July 2026, grounded in Google Search Central, Naver, IndexNow, and Cloudflare official docs.
summary_for_ai: |
  Practical SEO and AI-readability runbook for vibequant.cc (Cloudflare Pages, multi-subdomain, KO/EN/JA/ZH).
  Key claims: no separate AI index/submission; fix infra before GSC submit; cover Naver/Bing/IndexNow for Korean sites;
  eight document-structure rules; Google-Extended does not remove AI Overviews; llms.txt is for agents not Google ranking.
  Phases 1–7 plus P0–P3 checklist. Reference date: July 2026.
date: 2026-07-25
author: "Dennis Kim"
lang: en
tags:
  - SEO
  - AI-Readability
  - Google-Search-Console
  - Cloudflare
  - IndexNow
  - hreflang
  - Schema.org
keywords:
  - SEO
  - AI Overviews
  - Google Search Console
  - IndexNow
  - Cloudflare Pages
  - robots.txt
  - sitemap
  - Naver Search Advisor
  - AI readability
group: cloud-free
featured: false
schema_type: TechArticle
draft: false
---

# What I Learned Optimizing vibequant.cc for Search — A Practical SEO Guide

Getting content from a site you built to reach people matters. Search engine optimization especially matters. Naver Blog and Naver Cafe live inside Naver's walled garden, which creates problems for global reach and search discovery.
Good content that spreads more widely is what search engines like Google want.
While optimizing vibequant.cc for search, I organized the following process.

| Item | Details |
|------|---------|
| Scope | `vibequant.cc` and subdomains (`docs` / `tech` / `play` / `cti`) |
| Infra baseline | Cloudflare DNS + Cloudflare Pages–family static hosting, multi-subdomain, KO/EN/ZH/JA multilingual archive |
| Reference date | July 2026 |
| Sources | Google Search Central docs and blog, Naver Search Advisor, IndexNow spec, Cloudflare official docs |
| Goal | Establish a practical process so search engines and AI search/agents read the site well from the **same foundation** |

## Intro: Three-Line Summary

1. **There is no separate AI index or separate submission process for AI search.** Google states that to appear in AI features, a page must first be indexed in regular Search and eligible for snippet display. SEO and AI readability are not separate workstreams — they are two sides of the same job.
2. **Getting the order wrong is expensive.** Infra checks come before registration and submission. Once something is indexed in a bad state, fixing it takes weeks.
3. **A Korean-content site that only optimizes for Google is leaving half on the table.** Naver, Bing, and IndexNow are nearly free to cover in a Cloudflare environment.

---

## 1. Process Overview

| Phase | Purpose | Effort | Deliverable |
|-------|---------|--------|-------------|
| 1 | Infra consistency check | 1–2 days | Canonicalization, response codes, preview domains cleaned up |
| 2 | Property registration and ownership verification | 1 day | GSC domain property + per-host URL-prefix properties |
| 3 | Crawl and indexing pipeline | 2–3 days | robots.txt, sitemap index, submission complete |
| 4 | On-page optimization | 1–2 weeks | Title/Meta/canonical/structured data/hreflang |
| 5 | AI-readable structure | 1–2 weeks | Semantic structure, entity declaration, AI exposure policy |
| 6 | Domestic and other search channels | 2–3 days | Naver/Bing registration, IndexNow automation |
| 7 | Measurement system | Ongoing | Weekly/monthly review routines, data backup automation |

**Do not skip Phase 1 and jump to Phase 2.** That was the most expensive lesson from this work. If you submit a sitemap while preview domains are indexed or an SPA fallback returns 200, Google learns that state and then spends weeks correcting it.

---

## 2. Phase 1 — Infra Consistency Check (Cloudflare Static Hosting)

On static hosting, most indexing problems come from deploy config, not content. Before registering anything, verify all of the following.

| Check | How to verify | Symptom if ignored |
|-------|---------------|--------------------|
| Preview deploy domains (`*.pages.dev`) indexed | `site:pages.dev` search; check response headers on those URLs | Same content indexed twice as production; canonical confusion |
| Trailing slash consistency | Hit both `/path` and `/path/` | Same content on two URLs; signal split |
| `www` handling | Hit `www.vibequant.cc` | Unhandled → duplicate hosts |
| 404 response codes | HTTP status for nonexistent URLs | SPA fallback returning 200 → mass soft 404s |
| `_headers` file | Inspect repo directly | Staging `X-Robots-Tag: noindex` left in production → sitewide index block |
| Bot Fight Mode / WAF rules | Cloudflare Security settings | Over-aggressive bot blocking stops legitimate crawlers |
| SSL/TLS mode | Cloudflare SSL/TLS settings | Flexible causes redirect loops and mixed content. Prefer **Full (strict)** |

### Remediation Guidance

- Apply `X-Robots-Tag: noindex` on preview deploys, or restrict access with Cloudflare Access.
- Pick one URL shape (trailing slash, `www`) and 301 everything else, then put a self-referencing canonical on every page.
- Turn on Always Use HTTPS and Automatic HTTPS Rewrites. Apply HSTS only after policy is settled — it is hard to undo.
- A sitewide noindex from `_headers` can take weeks to recover from even after you revert it. Make it a fixed pre-deploy check.

---

## 3. Phase 2 — Property Registration and Ownership Verification

### 3.1 Property Types

| Type | Coverage | Ownership method | Recommendation |
|------|----------|------------------|----------------|
| **Domain property** (`vibequant.cc`) | All subdomains + http/https + www/non-www | DNS TXT **only** | Required |
| **URL-prefix property** (`https://docs.vibequant.cc/`) | That prefix only | HTML file, meta tag, GA, GTM, DNS | Recommended in parallel |

**Registering both types is practically advantageous.** A domain property captures everything at once, but subdomain performance is rolled into one graph. When `docs`, `tech`, `play`, and `cti` have different content characters, keeping per-host URL-prefix properties alongside gives much more useful judgment material.

### 3.2 Verifying Ownership in Cloudflare DNS

1. Add a domain property in GSC → copy the provided TXT value
2. Cloudflare Dashboard → zone → DNS → Records → Add record
   - Type `TXT` / Name `@` / Content `google-site-verification=...`
3. Click Verify in GSC (Cloudflare DNS propagation is usually a few minutes)

Deleting the TXT record drops ownership. Keep it permanently after verification.

---

## 4. Phase 3 — Crawl and Indexing Pipeline

### 4.1 robots.txt

You need one per host. For static sites, place it in each project's `public/robots.txt`.

```
User-agent: *
Allow: /

Sitemap: https://docs.vibequant.cc/sitemap.xml
```

The `Sitemap:` directive is a standard channel that Google, Bing, and Naver all read. Always include it, separately from GSC submission.

### 4.2 Sitemap Structure (Multi-Subdomain)

In principle, a sitemap should only include URLs on the host where it lives. The following structure is safe.

```
https://vibequant.cc/sitemap.xml          <- sitemap index
  ├─ https://vibequant.cc/sitemap-main.xml
  ├─ https://docs.vibequant.cc/sitemap.xml
  ├─ https://tech.vibequant.cc/sitemap.xml
  ├─ https://play.vibequant.cc/sitemap.xml
  └─ https://cti.vibequant.cc/sitemap.xml
```

- Cross-host submission (an index referencing another host's sitemap) is valid when ownership of the referenced host is verified. If you registered a domain property per §3.1, you already own all subdomains, so this structure works.
- Each host's `robots.txt` should declare **that host's own sitemap**.
- Put real content-modification times in `<lastmod>` only. Refreshing every URL to "now" on every build causes the signal to be ignored. Static site generators often do this by default — verify.
- Put **final URLs only** in sitemaps. Mixing redirect targets piles up "Page with redirect" in the indexing report.
- Single-sitemap limits: 50,000 URLs / 50MB uncompressed. Remember that as a split threshold when the CTI archive grows.

### 4.3 URL Inspection and Indexing Requests

- Use **URL Inspection** to check indexing status, chosen canonical, crawl time, and structured-data recognition per URL.
- **Request indexing** has a daily quota and does not guarantee indexing or ranking. Use it one URL at a time for new publishes.
- Discovery of large URL sets is the job of **sitemaps and internal links**. Do not invert that principle.

### 4.4 Two Channels You Should Not Use

| Channel | Current status | Action |
|---------|----------------|--------|
| Sitemap ping (`google.com/ping?sitemap=`) | Deprecated notice June 2023; **404 since January 2024** | Remove from CI/CD and deploy scripts. robots.txt + GSC is enough |
| Google Indexing API | Not deprecated, but **`JobPosting` and `BroadcastEvent` only** | Unusable for general docs/columns. Guides that claim this indexes blogs have no basis |

---

## 5. Phase 4 — On-Page Optimization

### 5.1 Site Structure and Internal Links

From a crawler's perspective, subdomains are **closer to separate sites.** A domain property does not change that.

- Make the root (`vibequant.cc`) a hub with explicit links to the four subdomain flagship sections.
- Put a shared global nav on each subdomain that links back to the root.
- Connect related content with in-body links (CTI report → related tech doc, column → source data). That is the best discovery path for new pages.
- Key sections (`/essays`, `/lab`, `/research`, `/about`) should be reachable within two clicks from the root.

### 5.2 Title / Meta / Canonical

| Element | Standard |
|---------|----------|
| Title | ~60 characters (roughly ~30 for Korean). Unique page topic + site name. Audit for leftover filename-based auto titles |
| Meta Description | Not a ranking factor, but directly affects CTR. Write uniquely per page |
| H1 | One per page. Need not be identical to Title |
| Canonical | Self-referencing canonical on every page. Easy to omit in static builds |
| OG / Twitter Card | Not a ranking factor, but high priority if social is a main acquisition path |

### 5.3 Structured Data

- `Article` or `TechArticle`: `headline`, `datePublished`, `dateModified`, `author`
- `Organization`: once on the root page. Put GitHub, ORCID, ETNews author page, and SSRN author page in `sameAs`
- `Person`: include ORCID as `identifier` on the author profile
- `BreadcrumbList`: convey subdomain hierarchy

Validate with Rich Results Test, then recheck recognition in the GSC structured-data report.

### 5.4 Performance

Mobile-first indexing still applies, so you still need to check — but **the tools changed.** GSC's Mobile Usability report and the Mobile-Friendly Test tool/API ended on December 1, 2023.

| Tool | Role |
|------|------|
| PageSpeed Insights | Field (CrUX) + lab (Lighthouse) together |
| Chrome DevTools Lighthouse | Local lab measurement, including accessibility and SEO audits |
| GSC Core Web Vitals | Sitewide trends from real-user data |

Static hosting is usually fine, but script-heavy hosts like the `play` subdomain need a separate INP check.

### 5.5 Multilingual (hreflang)

hreflang only makes sense when **language URLs are separated.** It does not apply when Korean and English are mixed on one page. Separating the language URL scheme is a precondition.

```html
<link rel="alternate" hreflang="ko" href="https://cti.vibequant.cc/ko/report-001" />
<link rel="alternate" hreflang="en" href="https://cti.vibequant.cc/en/report-001" />
<link rel="alternate" hreflang="ja" href="https://cti.vibequant.cc/ja/report-001" />
<link rel="alternate" hreflang="zh" href="https://cti.vibequant.cc/zh/report-001" />
<link rel="alternate" hreflang="x-default" href="https://cti.vibequant.cc/en/report-001" />
```

- **Reciprocal references are required.** If A points to B, B must point to A, and each page must include itself.
- Always set `x-default`.
- High payoff if you publish CTI reports in four languages.

---

## 6. Phase 5 — Making a Website AI Reads Well

### 6.1 Starting Point: No Separate Index for AI Exposure

Core statements from Google's official docs:

- AI Overviews and AI Mode use the **regular Search index**. What Googlebot crawled is the source.
- For a page to appear in AI features, it must first be **indexed and eligible for snippet display**.
- **There is no separate AI index and no separate submission process.** There are no extra requirements for AI feature exposure.
- New machine-readable files, AI-only markup, Markdown versions, content chunking, and AI-only rewriting are all unnecessary.

So you do not need a separate "AI optimization" workstream. Phases 1–4 *are* AI optimization. What you layer on top is not technique — it is **discipline in document structure**.

### 6.2 Eight Document-Structure Rules

For AI to cite content, it must be able to extract fact units. What actually worked were ordinary items like these.

| # | Rule | Why |
|---|------|-----|
| 1 | **Serve complete HTML from the server** | Relying on client JS rendering makes readability differ by crawler/agent. Static generation is best |
| 2 | **Use heading hierarchy for meaning** | One `h1`; `h2`/`h3` match the real logical structure. No heading tags for styling |
| 3 | **One topic per URL** | Packing multiple topics on one page means it matches no query precisely |
| 4 | **Put the conclusion first** | A 2–3 sentence summary at the top is used as-is as a citation unit. Long academic intros work against you here |
| 5 | **Use tables and definition lists** | Comparisons, numbers, and classifications extract more accurately from tables than prose. Add context with a caption or preceding sentence |
| 6 | **Give every section an anchor ID** | Citations reference sections, not whole pages |
| 7 | **State date, author, and source in the body** | Align `datePublished`/`dateModified` with body text. CTI report TLP levels and confidence ratings are strong trust signals by themselves |
| 8 | **Duplicate image information as text** | Charts without text numbers are unread. Pair with `alt`, captions, or an in-body table |

Additionally, **prefer HTML over PDF as the primary format.** PDF-only distribution of papers and reports hurts both indexing quality and citation likelihood. Keep HTML as the canonical body and offer PDF as an optional download.

### 6.3 Declare Entities Explicitly

AI answers accumulate trust at the **entity** level, not the individual-page level. That matters especially when same-name organizations or packages exist (see §9).

- Link GitHub, ORCID, SSRN author pages, and ETNews author pages in `sameAs` on `Organization` and `Person` schema.
- On `/about`, state career, expertise, and publishing channels in prose. Schema alone is not enough.
- Keep author bylines as the same string across every channel. Divergent strings split the entity.

### 6.4 Three AI Exposure Controls — Do Not Confuse Them

These three are often explained as interchangeable, but they control completely different things.

| Control | What it controls | Effect on organic Search | Effect on AI Overviews / AI Mode |
|---------|------------------|--------------------------|----------------------------------|
| **GSC settings → Search generative AI toggle** | Exposure and grounding use in generative AI features | None (Google states it is not a ranking signal) | Opt-out → exposure and traffic = 0 |
| **robots.txt `Google-Extended`** | Gemini-family model training and Gemini app grounding | None | **None.** AI Overviews use the regular Search index, so blocking still leaves exposure |
| **`nosnippet` / `max-snippet` / `data-nosnippet`** | How much text can appear in snippets | **Yes.** Organic snippets disappear too | Suppresses AI feature exposure |
| (`noindex`) | Indexing itself | Full removal from Search | Removed as a consequence |

**The most common mistake is believing that blocking `Google-Extended` removes you from AI Overviews.** It does not. Training and live grounding are different problems.

Policy note: if you care about people reading the original and use `nosnippet`, organic CTR falls with it. For an archive published under TLP:GREEN and CC BY-NC-SA, decide first whether diffusion or original-page visits come first, observe exposure data for a few weeks, then switch.

### 6.5 Where llms.txt Actually Fits

Judge by purpose.

| Purpose | Validity |
|---------|----------|
| Google Search / AI Overviews ranking or visibility | **Invalid.** Google's June 2026 official docs state it is unused and has no positive or negative ranking effect |
| Document discovery for some AI search tools (Claude, Perplexity, etc.) | Observational evidence of value |
| Doc reference for coding agents (Cursor, Copilot, etc.) | Practically useful. Stripe, Cloudflare, Anthropic and others publish for this |

Conclusion: **worth publishing on a subdomain that ships tools/API docs like `docs.vibequant.cc`; no reason to publish on columns or CTI archives for SEO.** A 2026 survey of ~300k domains reported ~10% adoption, and most published files were never actually fetched. If you publish, write it as a genuinely useful agent-facing doc index.

### 6.6 Cloudflare AI Crawler Policy — Default Change on September 15, 2026

Cloudflare users should know this schedule.

| Item | Details |
|------|---------|
| Change date | **September 15, 2026** |
| Change | Default-block "mixed-use" crawlers that do not separate search/agent/training purposes on **pages with ads** |
| Scope | New customers, existing customers' new sites, and **all existing Free-plan customers** |
| Billing model | Pay Per Crawl → **Pay Per Use**. Payment when content is actually used in an AI answer, not at crawl time |

`vibequant.cc` does not run ads, so it likely does not meet the default-block condition. But Free-plan default changes still apply, so check current settings before September 15.

Also check **AI Crawl Control** (formerly AI Audit). It works on all plans with no setup, and the dashboard shows which AI services hit you how often and whether they honor robots.txt. If you care about managing AI-mediated exposure, it is valuable as an **observation tool** before it is a blocking tool.

Caution: broadly blocking AI crawlers also removes AI-search citations and referral traffic. Crawl-to-referral ratios are often poor, but for an archive that values citation exposure itself, blanket blocking works against that goal.

---

## 7. Phase 6 — Domestic and Other Search Channels

### 7.1 Naver Search Advisor

1. `searchadvisor.naver.com` → Webmaster Tools
2. Register the site (**per host.** Naver has no domain-property concept)
3. Ownership: HTML file upload or meta tag. Meta-tag verification may need re-auth — check expiry
4. Requests → **submit sitemap** and **submit RSS**. RSS meaningfully speeds collection when available
5. Validation → use Web Page Optimization and robots.txt diagnostics

Do not register both `www` and non-`www`. Naver treats them as separate sites and splits signals. After registration, real exposure usually takes **1–4 weeks**.

### 7.2 Bing Webmaster Tools

You can **import properties from GSC**, so setup cost is almost zero. Some AI search products reference the Bing index, so priority is high relative to effort.

### 7.3 IndexNow

| Item | Details |
|------|---------|
| Supported | Bing, **Naver** (since July 2023), Yandex, Seznam, Yep, and others |
| Not supported | **Google** |
| Effect | Notify changes immediately without waiting for a crawl. Tell one place; participating engines share |

**For Cloudflare users, the cheapest path is Crawler Hints.** Cloudflare has natively supported IndexNow via Crawler Hints since 2021; turn it on in the dashboard and the CDN layer auto-notifies when cached content changes. No code.

Prerequisite: the domain must go through the **Cloudflare proxy (orange cloud)**. In DNS-only mode Cloudflare does not see traffic, so it does not work. Alternative: a Worker that reads the sitemap after deploy and POSTs to the IndexNow endpoint.

### 7.4 Daum (Kakao)

Daum Search registration and Webmaster Tools are separate processes and require robots.txt changes. Given traffic contribution, put this last in priority.

---

## 8. Phase 7 — Measurement System

### 8.1 Performance Report

| Feature | Use |
|---------|-----|
| **Query Groups** | Bundle similar queries to see topic-level performance. Effective for tech-doc sites with scattered long-tail |
| **Brand / non-brand filters** | Separate brand search from topic search. Essential for §9 diagnosis |
| **24-hour (hourly) view** | Check traffic right after publish; measure social-share impact |
| **Recommendations** | GSC auto-suggestions. Reference only; set priority yourself |

### 8.2 Page Indexing Report

Check order and interpretation:

1. How far **Indexed** page count diverges from sitemap-submitted URL count
2. Read **Not indexed** reasons by category
   - `Crawled - currently not indexed`: quality/duplicate judgment. **A content problem; technical fixes will not solve it**
   - `Alternate page with proper canonical tag`: normal. Variant URLs are being cleaned up
   - `Page with redirect`: redirect targets ended up in the sitemap
3. In the sitemaps report, confirm each subdomain sitemap was read successfully

### 8.3 Generative AI Performance Report

Introduced June 3, 2026. Separate view of how often your URLs appeared in generative AI surfaces in AI Overviews, AI Mode, and Discover.

| Item | Details |
|------|---------|
| Metrics | **Impressions only.** No clicks, CTR, or queries |
| Breakdowns | Page / country / device / date (hour to month) |
| Data start | Around May 18, 2026. No retrospective history |
| Rollout | Started with some UK sites → gradual expansion (expanded June 23). May not yet appear on domestic accounts |
| Effect on totals | **None.** Separates data that was already in the existing Performance report |

Because there are no clicks, **you cannot conclude from this report alone why "impressions rose but clicks stalled."** Watch impression trends alongside real traffic, and hold causal judgments.

### 8.4 Other Reports

- **Core Web Vitals**: real-user (CrUX) trends
- **HTTPS**: mixed content and non-HTTPS page detection (standing report since September 2022)
- **robots.txt report**: per-host recognition and errors
- **Structured data / rich results**: validate after §5.3
- **Crawl stats** (under Settings): response time, status-code distribution. Check Phase 1 WAF over-blocking here

### 8.5 Data Retention and Backup

- Performance report retention is **16 months**. Older data is not queryable.
- For longer tracking, use **BigQuery bulk export** or regular Search Console API backups. The latter is cheap to run as a GitHub Actions scheduled job.
- Queries below the privacy threshold are hidden, so query totals vs overall totals disagree — that is normal.

### 8.6 Cross-Check with Cloudflare Metrics

GSC sees **search impressions and clicks**; Cloudflare Web Analytics sees **actual arrival traffic**. The gap itself is information.

| Pattern | Interpretation |
|---------|----------------|
| GSC clicks ≫ CF sessions | Missing measurement script, or instant bounce |
| GSC impressions up · clicks flat | Title/Description problem, or AI summaries absorbing clicks |
| CF traffic present · no GSC data | Non-search acquisition (social, direct, GitHub referrers) is the main path |

The third pattern is likely the early state. Then SEO is **opening a new channel, not improving existing traffic**, and you should set the judgment horizon accordingly later.

---

## 9. Brand Entity Issues Found During the Work

Top results for the keyword `vibequant` are currently occupied by:

| Competitor | Nature |
|------------|--------|
| `vibequant.com` | Music-industry data science consulting firm (same name, owns `.com`) |
| `vibequant` (PyPI / GitHub) | Python package for financial data analysis |
| `github.com/vibequant` | Same-name GitHub organization |

`vibequant.cc` itself did not appear in the same search. Indexing does not appear established yet, which is further reason Phase 1–3 is the top priority.

Strategic implications:

1. **Do not use brand-alone keywords as a KPI.** The `.com` same-name company owns the slot, and the package name absorbs developer search intent.
2. **Structurally separate the entity.** The `sameAs` linking in §6.3 pays off directly here.
3. **Topic long-tail is the real acquisition path.** Concrete topic terms like "token unlock 72-hour shock," "Kimsuky APT43," "MCP security architecture," and "CEX HFT infrastructure limits" have no competitors. Concentrate Title, H1, and internal links there.
4. **Use non-brand impression growth alone as the early metric.** Split the two streams with brand filters.

---

## 10. Common Myths

Confirmed during this work — incorrect claims that still repeat in domestic and international guides.

| Common claim | Reality |
|--------------|---------|
| Check mobile usability in GSC | Mobile Usability report, Mobile-Friendly Test tool, and API **ended December 1, 2023.** Replace with Lighthouse / PageSpeed Insights |
| Check the 'Coverage' report | Current name is **Page indexing** |
| The HTTPS report was recently added | Launched **September 2022.** Kept as a standalone report with Core Web Vitals after the 2023 Page Experience report cleanup |
| One sitemap can hold all subdomain URLs | In principle, same host only. Cross-submission requires verified ownership |
| Sitemap ping can notify instantly | **404.** Does not work since January 2024 |
| Indexing API can index new posts faster | `JobPosting` / `BroadcastEvent` only. Unusable for general docs |
| Blocking `Google-Extended` removes you from AI Overviews | **It does not.** Training/grounding control token; unrelated to the Search index |
| llms.txt helps AI search ranking | Google Search does not use it; no ranking effect. Separate discussion for agents / some AI search tools |
| AI search needs separate markup or Markdown versions | Unnecessary. Google states there are no extra requirements |
| Results appear 10–14 days after applying SEO | Valid only as a window to confirm indexing. Ranking usually forms over 4–12 weeks |

---

## 11. Execution Checklist

### P0 — Foundation and Index Formation (1–2 weeks)

| # | Task | Done |
|---|------|------|
| 1 | Verify every item in §2 infra checklist (preview domains, soft 404, `_headers`, trailing slash, WAF) | [ ] |
| 2 | Register GSC domain property + verify ownership via Cloudflare DNS TXT | [ ] |
| 3 | Register URL-prefix properties per subdomain in parallel | [ ] |
| 4 | Create per-host `robots.txt` with `Sitemap:` directive | [ ] |
| 5 | Build per-host sitemaps + root sitemap index; verify `lastmod` accuracy | [ ] |
| 6 | Submit sitemaps in GSC and confirm successful reads | [ ] |
| 7 | URL Inspection + indexing request for 10–20 key pages | [ ] |
| 8 | Remove deprecated sitemap ping calls from deploy scripts | [ ] |

### P1 — Channel Expansion (2–3 weeks)

| # | Task | Done |
|---|------|------|
| 9 | Register each host in Naver Search Advisor + submit sitemap/RSS | [ ] |
| 10 | Import GSC into Bing Webmaster Tools | [ ] |
| 11 | Enable Cloudflare Crawler Hints (IndexNow) and confirm proxy status | [ ] |
| 12 | Review Cloudflare AI Crawl Control dashboard; check settings ahead of September 15 default change | [ ] |

### P2 — On-Page and AI-Readable Structure (4–6 weeks)

| # | Task | Done |
|---|------|------|
| 13 | Full audit of Title / Meta Description / canonical on every page | [ ] |
| 14 | Apply `Article` · `Organization` (with `sameAs`) · `Person` (ORCID) · `BreadcrumbList` schema | [ ] |
| 15 | Reflect all 8 document-structure rules from §6.2 at template level (heading hierarchy, summary-first, anchor IDs, table captions) | [ ] |
| 16 | Duplicate chart/image numbers as text | [ ] |
| 17 | Convert PDF-only docs to HTML canonical + PDF optional download | [ ] |
| 18 | Fix cross-subdomain internal linking | [ ] |
| 19 | Measure with PageSpeed Insights and improve Core Web Vitals | [ ] |
| 20 | Apply hreflang where language URLs are separated (reciprocal + `x-default`) | [ ] |

### P3 — Operations (Ongoing)

| # | Task | Done |
|---|------|------|
| 21 | Weekly Performance report review (brand/non-brand split, Query Groups) | [ ] |
| 22 | Monthly Page indexing report review and exclusion-reason handling | [ ] |
| 23 | Check Generative AI performance report availability and decide AI exposure policy | [ ] |
| 24 | Automate backup of data older than 16 months via Search Console API or BigQuery | [ ] |
| 25 | Evaluate publishing llms.txt for the `docs` subdomain (agent purpose only) | [ ] |

---

## 12. Expected Timeline

| When | Observable change |
|------|-------------------|
| 1–3 days | Ownership verified, sitemap reads succeed, GSC data collection starts |
| 1–2 weeks | Indexed page count starts rising; individually requested URLs reflect |
| 2–4 weeks | Naver exposure begins; brand search results appear |
| 4–8 weeks | Non-brand long-tail impressions form; first meaningful query data |
| 8–12 weeks | Rankings start stabilizing; use this data to adjust content strategy |

**Do not reverse strategy on data before week 8.** Ranking swings in undersampled windows are mostly noise.

---

## 13. Sources

- Google Search Central, "AI Features and Your Website" — AI feature exposure requirements; no separate index/submission; control distinctions (`nosnippet` / `Google-Extended`)
- Google Search Central, AI optimization guide "Mythbusting generative AI search" section (updated 2026-06) — llms.txt and AI-only markup unnecessary
- Google Search Central Blog, "Introducing Search Generative AI performance reports in Search Console" (2026-06-03) — https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports
- Google Search Central Blog, "The role of page experience in creating helpful content" (2023-04) — Mobile Usability report / Mobile-Friendly Test ended; Core Web Vitals / HTTPS reports retained — https://developers.google.com/search/blog/2023/04/page-experience-in-search
- Google Search Central Blog, "Sitemaps ping endpoint is going away" (2023-06) — https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping
- Search Engine Land, "The SEO's guide to Google Search Console" — GSC feature history (HTTPS report 2022-09, Recommendations 2024-08, Query Groups 2025-10, brand filter 2025-11)
- Search Engine Land, "Google officially drops Mobile Usability report..." (2023-12-04)
- Cloudflare Blog, "Your site, your rules: new AI traffic options for all customers" (2026-07) — mixed-use crawler default block, Pay Per Use transition
- Cloudflare Docs, AI Crawl Control overview — https://developers.cloudflare.com/ai-crawl-control/
- Bing Webmaster Blog, "Cloudflare Supports IndexNow via one-click Integration" (2021-11)
- IndexNow.org FAQ — participating search engines and endpoint spec
- Naver Webmaster official notice — IndexNow support launch (2023-07)
- Naver Search Advisor registration procedures and exposure timeline practical docs (2026)
