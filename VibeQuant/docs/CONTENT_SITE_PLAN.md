# VibeQuant content site plan — Columns · TechDoc · SEO · LLM discovery

Publish investment columns and tech docs as a **static site on Cloudflare Pages**, grow LinkedIn / Facebook / Threads / Google traffic, and make the site **discoverable by LLMs and agents** (`llms.txt` / GEO).

| Doc | Language |
|-----|----------|
| This file | English |
| [CONTENT_SITE_PLAN_KR.md](CONTENT_SITE_PLAN_KR.md) | 한국어 |

**Sources**

| Kind | GitHub | Target on Pages |
|------|--------|-----------------|
| Columns | [`02.Investment Idea Column`](https://github.com/gameworkerkim/vibe-investing/tree/main/02.Investment%20Idea%20Column) | `/columns/` |
| Tech docs | [`TechDoc`](https://github.com/gameworkerkim/vibe-investing/tree/main/TechDoc) | `/tech/` |
| Demo (existing) | `VibeQuant/pages` | `/` |
| Author | [`gameworkerkim/README`](https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md) | `/about/` + column placements (§3) |

**Rules:** HTML / SEO / OG / **`llms.txt`** on **Pages**. Worker = API only. No Pyodide on articles.  
Align **human search (SEO)** and **model discovery (GEO / llms.txt)** on the same URL and metadata layer.

Internal refs: [agent-friendly-website-guide](https://github.com/gameworkerkim/vibe-investing/tree/main/TechDoc/agent-friendly-website-guide) · repo [`llms.txt`](https://github.com/gameworkerkim/vibe-investing/blob/main/llms.txt)

---

## 1. Problem

Social-heavy traffic; weak **Open Graph**. No long-tail article URLs. LLM crawlers/agents need more than a sitemap: **`/llms.txt`**, semantic HTML, and fetchable summaries.

**Leverage:** large MD archive, CDN static hosting, GitHub ↔ web links, author profile, existing repo `llms.txt` / agent-friendly docs extended to Pages.

---

## 2. Architecture

```text
GitHub MD → build:content → Pages
  /  /columns/  /columns/{slug}/  /tech/  /tech/{slug}/  /about/
  /sitemap.xml  /robots.txt
  /llms.txt  /llms-full.txt (optional)
  /columns/llms.txt  /tech/llms.txt
```

```mermaid
flowchart TB
  subgraph pages [Cloudflare Pages]
    Art[Article HTML]
    SEO[sitemap · OG · JSON-LD]
    LLM[/llms.txt family]
  end
  subgraph in [Discovery]
    Search[Google SEO]
    Agents[LLM · Perplexity · Cursor]
    Social[LinkedIn · Threads]
  end
  Art --> SEO
  Art --> LLM
  SEO --> Search
  LLM --> Agents
  Art --> Social
```

Do **not** host article HTML on the API Worker.

---

## 3. Author placement (Dennis Kim / 김호광)

Profile: [gameworkerkim/README.md](https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md)

| Surface | Format |
|---------|--------|
| `/about/` | Profile summary + CTI / Quant / Essays + Email·LinkedIn·ORCID · `Person` JSON-LD |
| Global nav/footer | Name → About |
| **`/columns/` top** | **Author card** + link to GitHub profile README |
| **Each column footer** | Author block + About + profile README + **article GitHub blob** |
| `/tech/` | Light byline; article footer = byline + blob |
| Demo `/` footer | Columns · Tech · About |

---

## 4. SEO + LLM discovery structure

Two axes:

| Axis | Audience | Artifacts |
|------|----------|-----------|
| **SEO** | Google / Bing | Per-URL pages, sitemap, OG, JSON-LD, CWV |
| **GEO / LLM** | ChatGPT · Claude · Perplexity · Cursor agents | `/llms.txt`, semantic HTML, abstracts, stable canonicals |

Guide: [agent-friendly website (KO)](https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/agent-friendly-website-guide/agent-friendly-website-guide.ko.md).

### 4.1 Classic SEO

Per-article URLs · `sitemap.xml` + `robots.txt` · OG/Twitter (1200×630) · JSON-LD (`BlogPosting` / `TechArticle` / `Person` / `BreadcrumbList`) · `canonical` on Pages · `hreflang` when pairs exist · static-only CWV · cache headers · Web Analytics + GSC.

### 4.2 LLM / agent discovery

| Path | Role |
|------|------|
| `/llms.txt` | [llmstxt.org](https://llmstxt.org) site map: blurb, author, Demo/Columns/Tech/About, key links |
| `/llms-full.txt` | Optional full title+one-line+URL index |
| `/columns/llms.txt` · `/tech/llms.txt` | Section curation |
| Repo `llms.txt` | Keep for GitHub discovery; add Pages “Web reading” links |

Generate llms files from the **same catalog** as `sitemap.xml` in `build:content`.

**Draft `/llms.txt` skeleton**

```text
# VibeQuant Content
> Multi-LLM quant committee demo + investment columns + tech docs by Dennis Kim.
> Thesis: an LLM is a spreadsheet, not an oracle.

## Site
- [Demo](https://vibequant-web.pages.dev/)
- [Columns](https://vibequant-web.pages.dev/columns/)
- [Tech](https://vibequant-web.pages.dev/tech/)
- [About](https://vibequant-web.pages.dev/about/)
- [Author GitHub](https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md)

## Optional
- [Full index](https://vibequant-web.pages.dev/llms-full.txt)
- [Columns llms](https://vibequant-web.pages.dev/columns/llms.txt)
- [Tech llms](https://vibequant-web.pages.dev/tech/llms.txt)
```

### 4.3 HTML readable by crawlers and LLMs

Semantic `header`/`nav`/`main`/`article`/`footer` · **server-rendered body** (no JS-only content) · top-of-page **abstract** (2–4 sentences) · single `h1` · preserve lists/tables · correct `lang` · no keyword stuffing.

### 4.4 One metadata source → many outputs

`title`, `description`/`abstract`, `date`, `tags`, `lang`, `github`, `canonical` feed: HTML meta · OG · JSON-LD · sitemap · all `llms.txt` variants · breadcrumbs.

### 4.5 robots / AI crawl policy

Default **Allow: /** (discovery is the goal). Document Cloudflare AI crawl settings; blocking all AI bots while publishing `llms.txt` is contradictory. Optionally comment `llms.txt` location in `robots.txt`.

### 4.6 Verification

GSC · LinkedIn Inspector · Rich Results Test · `curl` HTML contains title+abstract · llms link checker (0 broken URLs).

---

## 5. Frontmatter (progressive)

ASCII slugs only. Add `abstract`, `keywords`, `schema_type` when possible. Fallback from title + first paragraph. Exclude `.csv`, tree-local `llms.txt` files (rolled into indexes), `draft: true`.

---

## 6. Phases

| Phase | Focus |
|-------|--------|
| **A** | Slug+keyword map, IA, author copy, llms.txt outline |
| **B** | `build:content`, semantic articles + abstracts, About, GitHub footers |
| **C** | sitemap/robots, OG, JSON-LD, **`/llms.txt` family**, OG images, headers, Rich Results smoke |
| **D** | Analytics (incl. llms hits), GSC, Inspector, PageSpeed, link audit |
| **E** | Custom domain, README ↔ web banners, sync repo `llms.txt` with Pages URLs |

---

## 7. Weekly plan

W1 design + llms skeleton · W2 ship pages · W3 SEO+llms+analytics · W4+ metadata & domain.

---

## 8. Success (4–8 weeks)

**SEO:** indexed URLs · OG preview success · column vs demo sessions · long-tail + author queries.  
**LLM/GEO:** `/llms.txt` fetches · citation sampling · 100% HTML-only body/abstract · repo↔Pages llms consistency.

---

## 9. Non-goals

Worker HTML · Pyodide on articles · Hangul pathnames · full frontmatter gate · live MD-only SEO · JS-injected bodies · block all AI crawlers while shipping llms.txt.

---

## 10. Links

- Profile · Columns · TechDoc · [agent-friendly guide](https://github.com/gameworkerkim/vibe-investing/tree/main/TechDoc/agent-friendly-website-guide) · [llmstxt.org](https://llmstxt.org) · https://vibequant-web.pages.dev/ · [DEPLOY.md](../cloudflare/DEPLOY.md)

*Plan updated 2026-07-22 — SEO + LLM/GEO. Implementation starts at Phase A.*
