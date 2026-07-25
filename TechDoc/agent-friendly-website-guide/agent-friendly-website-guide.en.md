---
title: "Agent-Friendly Website Construction: A Practical Technical Guide"
title_ko: "에이전트 친화적인 웹사이트 구축을 위한 실무 기술 가이드"
description: "A practical, code-first guide to building websites that AI agents can navigate, understand, and act on. Synthesizes Google web.dev's Building Agent-Friendly Websites (2026-04-01), Chrome's WebMCP Early Preview Program (2026-02-10), and Jeremy Howard's llms.txt standard."
slug: agent-friendly-website-guide
language: en
languages_available: [ko, en, ja, zh]
canonical: https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/agent-friendly-website-guide/agent-friendly-website-guide.en.md
version: "1.0"
date_published: 2026-05-19
last_updated: 2026-05-19
author:
  name: "Dennis Kim (HoKwang Kim / 김호광)"
  role: "CEO, Betalabs Inc. · Former CEO, Cyworld Z · Microsoft Azure MVP"
  github: gameworkerkim
  publication: Web3Paper
license: CC-BY-4.0
schema_type: TechArticle
keywords:
  - AI agents
  - agent-friendly websites
  - llms.txt
  - WebMCP
  - semantic HTML
  - accessibility tree
  - Schema.org
  - JSON-LD
  - GEO
  - Generative Engine Optimization
  - Core Web Vitals
  - Model Context Protocol
  - MCP
  - web standards
  - SEO
tags:
  - ai-agents
  - web-development
  - accessibility
  - semantic-html
  - llms-txt
  - webmcp
  - schema-org
  - geo
  - chrome
  - google-web-dev
audience:
  - Front-end developers
  - Technical writers
  - DevRel / Developer marketing
  - Product managers
  - SEO / GEO specialists
  - CTOs and engineering leads
sources:
  - title: "Building Agent-Friendly Websites"
    authors: ["Kasper Kulikowski", "Omkar More"]
    publisher: "Google web.dev"
    date: 2026-04-01
    url: https://web.dev/articles/ai-agent-site-ux
  - title: "Introduction to Agents"
    authors: ["Alexandra Klepper", "Kasper Kulikowski", "Rachel Lee Nabors"]
    publisher: "Google web.dev"
    date: 2025-02-25
    url: https://web.dev/articles/ai-agents
  - title: "WebMCP is available in Early Preview"
    authors: ["André Cipriani Bandarra"]
    publisher: "Chrome for Developers"
    date: 2026-02-10
    url: https://developer.chrome.com/blog/webmcp-epp
  - title: "The /llms.txt file"
    authors: ["Jeremy Howard"]
    publisher: "Answer.AI"
    date: 2024-09
    url: https://llmstxt.org
---

# Agent-Friendly Website Construction: A Practical Technical Guide

> AI agents now browse, summarize, and transact on websites on behalf of users. This guide consolidates Google web.dev (2026-04-01), Chrome's WebMCP EPP (2026-02-10), and Jeremy Howard's llms.txt standard into an 11-chapter practical manual for making your site one that agents can reliably understand and act on.

🌐 **Other languages** — [한국어](./agent-friendly-website-guide.ko.md) · [日本語](./agent-friendly-website-guide.ja.md) · [中文](./agent-friendly-website-guide.zh.md)

📌 **Tags** — `#AIAgents` `#WebMCP` `#llms-txt` `#SemanticHTML` `#Accessibility` `#Schema.org` `#GEO` `#CoreWebVitals` `#MCP`

---

## TL;DR

- **Who this is for**: front-end engineers, tech writers, DevRel, PMs, SEO/GEO leads, CTOs
- **What you get**: the three ways agents perceive a page, Google's 7 principles, working code for semantic HTML, ARIA, and Schema.org, the llms.txt format, a WebMCP rollout strategy, and a 4-phase adoption roadmap
- **Why now**: Pew Research (2024) found that Google users seeing AI summaries are roughly half as likely to click through. Half of your traffic, conversions, and brand surface area depend on whether agents can read you
- **Time investment**: ~35 minutes to read, 1–2 weeks to start shipping changes

---

## Table of Contents

1. [The New Visitor: AI Agents](#1-the-new-visitor-ai-agents)
2. [How Agents Perceive a Website](#2-how-agents-perceive-a-website)
3. [Google's 7 Agent-Friendly Principles](#3-googles-7-agent-friendly-principles)
4. [Semantic HTML and the Accessibility Tree](#4-semantic-html-and-the-accessibility-tree)
5. [Layout Stability and Visual Cues](#5-layout-stability-and-visual-cues)
6. [Structured Data: Schema.org and JSON-LD](#6-structured-data-schemaorg-and-json-ld)
7. [The AI Entry Point: llms.txt](#7-the-ai-entry-point-llmstxt)
8. [WebMCP: The Next-Generation Agent Interface](#8-webmcp-the-next-generation-agent-interface)
9. [Reference Implementations](#9-reference-implementations)
10. [Agent-Friendliness Audit Checklist](#10-agent-friendliness-audit-checklist)
11. [A Phased Adoption Roadmap](#11-a-phased-adoption-roadmap)
- [Appendix A. Glossary](#appendix-a-glossary)
- [Appendix B. References and Sources](#appendix-b-references-and-sources)

---

## 1. The New Visitor: AI Agents

### 1.1 What Is an \"Agent\"?

Per Google web.dev, an agent is \"a system that receives and interprets input, then plans and executes tasks on behalf of a user (human or another agent).\" Critically, an agent is not just an LLM — it is a unit assembled from **a model, rules, memory, and tools.**

#### Four defining traits

- **Autonomous** — can operate without direct human intervention
- **Interactive** — converses with other agents and humans
- **Reactive** — perceives its environment and responds to change
- **Proactive** — takes initiative to reach a goal

#### The four-step task loop

1. **Receive** a query in natural language
2. **Plan** a multi-step approach via the LLM
3. **Execute** by calling tools (APIs, browsers, MCP servers)
4. **Remember** — store outcomes in short- and long-term memory

### 1.2 Humans, Crawlers, and Agents Are Not the Same

| Visitor | Behavior | Intent | What you optimize for |
|---|---|---|---|
| Human | Visual, emotional, contextual browsing | Buy, learn, enjoy | Design, copy, perf, a11y |
| Search crawler | Link graph collection | Indexing, ranking | robots.txt, sitemap.xml, metadata |
| Training crawler (e.g. Common Crawl) | Bulk text collection | LLM training data | robots.txt, AI training policy |
| **AI agent (delegate)** | **Goal-directed action** | **Complete a user task (buy, book, file)** | **Semantic HTML, accessibility tree, WebMCP, llms.txt** |

> 💡 **The core distinction**: crawlers only *read*; agents *read + click + type + pay.* That means agents have a much higher bar on security, consent, and visual stability.

### 1.3 Three Agent Categories by Data Ownership

- **Zero-party agent** — operates entirely on local browser data (e.g. Chrome's built-in Gemini Nano). The safest option for personal data.
- **First-party agent** — the service operator owns both the agent and the data (e.g. Google's trip planner inside Google Maps). Highest trust and control.
- **Third-party agent** — built by an external developer, uses your site as a data source (e.g. a user's ChatGPT places an order on your store). **You become a third-party information provider to someone else's agent.**

> 📌 **Practical implication**: most e-commerce, travel, and fintech sites will end up serving third-party agents. Design explicit Human-in-the-loop checkpoints for payment, auth, and consent — the agent should not (and legally often cannot) silently transact on a user's behalf.

---

## 2. How Agents Perceive a Website

Agents do not look at your site through a monitor. They operate on its **machine-readable representation**, and the quality of that representation is the ceiling for agent performance. Google identifies three primary modalities.

### 2.1 Modality 1: Screenshots (Visual Analysis)

The agent captures a rendered page and feeds it to a vision model. A magnifier icon top-right is probably a search box; a large box in the middle is probably a form. **Color, size, and proximity all encode importance** — a big \"Delete\" button gets treated more carefully than a small \"Help\" link.

- **Strength**: sees the final rendered output, CSS and JS included
- **Weakness**: slow and expensive in tokens; typically the fallback when DOM and a11y signals are weak

### 2.2 Modality 2: HTML / DOM

The agent parses the DOM directly and reads relationships from the tree. If a \"Buy now\" button sits *inside* a product container, the agent infers it belongs to *that* product. **Nesting and naming carry meaning.**

### 2.3 Modality 3: The Accessibility Tree

The accessibility tree is a browser-native API that distills the DOM down to **roles, names, and states of interactive elements.** Built for screen readers, it functions for AI agents as a noise-free, high-fidelity map of the page. Read this tree well and you know every toggle, slider, and input on the screen without parsing a single line of CSS.

> 🔍 **Try it yourself**: Chrome DevTools → Elements → \"Accessibility\" pane → enable \"Full-page accessibility tree.\" Every missing role label is a spot an agent will fail.

### 2.4 Combined Modalities

Modern agents (ChatGPT Agent, Claude for Chrome, Gemini in Chrome) never rely on one channel. They use the DOM and accessibility tree for a clean structured list of interactive elements, then cross-reference the screenshot for layout and grouping.

> 🎯 **Your job**: ship clean, consistent signals across all three channels. Each compensates for the others — getting one right is not enough.

---

## 3. Google's 7 Agent-Friendly Principles

Below are the seven recommendations from Google web.dev, expanded with code examples. **Every one of them also improves human accessibility and UX.**

### Principle 1. Every required action must be visible in the UI

Features hidden behind keyboard shortcuts or right-click menus are invisible to agents.

- ❌ **Bad**: SaaS dashboard where downloads only open via `Ctrl+Shift+D`
- ✅ **Good**: explicit \"Download\" button in the toolbar; shortcut is a bonus

### Principle 2. Keep the layout stable

If \"Add to cart\" sits in a different place per category, the agent has to relearn every category.

**Practical rules**:
- Standardize CTA position at the template layer
- Keep CLS (Cumulative Layout Shift) below 0.1 (Core Web Vitals)
- Use skeleton UI so the final layout shape is visible during load
- Avoid bouncy ad banners that shift surrounding content

### Principle 3. No \"ghost\" elements or invisible overlays

A transparent div on top of a real button can make the agent's visual analyzer drop the underlying node entirely.

```css
/* ❌ Bad: invisible div covers the real button */
.overlay-trap {
  position: absolute;
  inset: 0;
  background: transparent;
  z-index: 9999;
}

/* ✅ Good: explicit pointer-events + sane z-index */
.overlay-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;  /* clicks fall through */
  z-index: 1;
}
```

### Principle 4. Use semantic HTML for actionable elements

Don't dress up divs to look like buttons. Use `<button>` and `<a>` directly — agents always recognize them as interactive. CSS handles the look.

```html
<!-- ❌ Bad -->
<div class="btn-primary" onclick="submit()">Order</div>

<!-- ⚠️ Acceptable fallback when semantics aren't possible -->
<div role="button" tabindex="0"
     aria-label="Order"
     onclick="submit()"
     onkeydown="if(event.key==='Enter')submit()">
  Order
</div>

<!-- ✅ Good -->
<button type="submit" class="btn-primary">Order</button>
```

### Principle 5. Set `cursor: pointer`

The pointer cursor is a strong visual cue to both humans and vision models that something is clickable.

```css
.product-card { cursor: pointer; }
.disabled-button { cursor: not-allowed; }
```

### Principle 6. Connect `<label>` to `<input>` via `for`

`placeholder` is not enough — it disappears on focus and never enters the accessibility tree.

```html
<!-- ❌ Bad -->
<input type="email" placeholder="Enter your email" />

<!-- ✅ Good -->
<label for="user-email">Email address</label>
<input type="email"
       id="user-email"
       name="email"
       autocomplete="email"
       required
       placeholder="name@example.com" />

<!-- ✅ Better: visually hidden label, still in the a11y tree -->
<label for="search" class="sr-only">Site search</label>
<input type="search" id="search" name="q" />
```

### Principle 7. Interactive elements should be larger than 8 px²

Anything below 8×8 px (64 px²) may be filtered out as noise by the agent's visual analyzer.

- Primary CTA buttons: at least 44×44 px (Apple HIG)
- Form fields: at least 40 px tall
- Icon buttons: 24 px icon is fine, but pad the hit area to 44+ px
- Close (X) buttons: small visually, but generous on hit area

---

## 4. Semantic HTML and the Accessibility Tree

### 4.1 From \"div soup\" to semantic landmarks

Many React and Vue codebases wrap everything in divs. The resulting accessibility tree is nearly flat, and agents cannot draw a map of the page.

| Semantic tag | A11y tree role | What agents do with it |
|---|---|---|
| `<header>` | banner | Identify site, logo, top nav |
| `<nav>` | navigation | Discover main menus |
| `<main>` | main | Find the primary content region |
| `<article>` | article | Recognize self-contained content (a blog post) |
| `<aside>` | complementary | Identify side material |
| `<footer>` | contentinfo | Find policy/contact info |
| `<section>` | region (with `aria-label`) | Group by topic |
| `<button>` | button | Recognize a clickable action |
| `<a href>` | link | Recognize a navigation target |
| `<input>` | textbox / checkbox / radio etc. | Map a form field |

### 4.2 A solid page skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Product Detail – Acme</title>
  <link rel="alternate" type="text/markdown"
        href="/products/widget-pro.md" />  <!-- llms.txt-friendly -->
</head>
<body>
  <header>
    <a href="/" aria-label="Home">
      <img src="/logo.svg" alt="Acme" />
    </a>
    <nav aria-label="Primary">
      <ul>
        <li><a href="/products">Products</a></li>
        <li><a href="/pricing">Pricing</a></li>
        <li><a href="/docs">Docs</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <h1>Widget Pro</h1>
      <section aria-labelledby="specs">
        <h2 id="specs">Specifications</h2>
        <!-- ... -->
      </section>
      <button type="button" data-action="add-to-cart">
        Add to cart
      </button>
    </article>
  </main>

  <footer>
    <p>© 2026 Acme</p>
  </footer>
</body>
</html>
```

### 4.3 The four ARIA attributes that matter most

#### `aria-label` / `aria-labelledby`

Give an element a name. Mandatory for icon-only buttons.

```html
<button aria-label="Close window">
  <svg><!-- X icon --></svg>
</button>

<section aria-labelledby="pricing-title">
  <h2 id="pricing-title">Pricing</h2>
</section>
```

#### `aria-describedby`

Attach a longer description. Common for help text and error messages on form fields.

```html
<label for="pwd">Password</label>
<input id="pwd" type="password"
       aria-describedby="pwd-help pwd-error" />
<p id="pwd-help">8+ characters, letters, numbers, symbol</p>
<p id="pwd-error" role="alert">Password is too short</p>
```

#### `aria-expanded`, `aria-controls`

Express state and control relationships for dropdowns, accordions, and modals — agents need to know whether the panel is open or closed.

```html
<button aria-expanded="false" aria-controls="faq-1">
  How long does shipping take?
</button>
<div id="faq-1" hidden>
  2–3 business days.
</div>
```

#### `role`

Use only when semantic HTML cannot express the pattern. Pair with `tabindex="0"` and a keyboard handler to make a true \"button.\"

```html
<div role="button" tabindex="0"
     aria-label="Toggle theme"
     onclick="toggleTheme()"
     onkeydown="if(['Enter',' '].includes(event.key))toggleTheme()">
  🌙
</div>
```

> 📐 **First law of ARIA**: \"Use semantic HTML if you can; only reach for ARIA when you can't.\" Misused ARIA is worse than none.

---

## 5. Layout Stability and Visual Cues

### 5.1 Core Web Vitals through an agent lens

| Metric | Meaning | Why it matters for agents |
|---|---|---|
| **LCP** | Largest Contentful Paint (< 2.5s) | When the agent decides the page is \"ready\" |
| **INP** | Interaction to Next Paint (< 200ms) | Post-click responsiveness — avoids agent timeouts |
| **CLS** | Cumulative Layout Shift (< 0.1) | Accuracy of screenshot- and coordinate-based clicks |

### 5.2 Four overlay traps that kill agent clicks

1. **Cookie consent banners** that cover the entire viewport on load
2. **Newsletter modals** that pop in after 3 seconds with a tiny close button and no ESC handler
3. **Floating chatbots** that obscure the primary CTA in the corner
4. **Sticky headers** with the wrong z-index, hiding content as the agent scrolls

> ✅ **Recommended pattern**: render consent banners in semantic `<dialog>` with `role="dialog"` and `aria-modal="true"`. Move initial focus to the accept/reject button. Agents will recognize and handle them correctly.

### 5.3 Visual cue checklist

- [ ] `cursor: pointer` on hover
- [ ] **Never** strip the focus ring (`outline: none` is forbidden)
- [ ] Visual hierarchy via color, size, spacing for primary CTAs
- [ ] Disabled states: `cursor: not-allowed` + `opacity: 0.5`
- [ ] Prefer color change over `transform: scale` on hover (avoids layout shift)

---

## 6. Structured Data: Schema.org and JSON-LD

Semantic HTML says \"this element is X.\" Structured data says \"this page is about Y.\" Agents treat well-formed JSON-LD as **ground truth** — high-confidence factual context they trust more than scraped prose.

### 6.1 Why JSON-LD

- **Decoupled**: lives in a `<script>` block — no markup pollution
- **Universally recommended**: Google, Bing, and the major LLM providers (Anthropic, OpenAI, Perplexity) all parse it first
- **Easy to template**: trivial to generate from a CMS or static site generator

### 6.2 Six schemas to know

#### Organization — every site needs one

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Betalabs Inc.",
  "url": "https://betalabs.io",
  "logo": "https://betalabs.io/logo.svg",
  "sameAs": [
    "https://github.com/betalabs",
    "https://www.linkedin.com/company/betalabs"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@betalabs.io",
    "availableLanguage": ["ko", "en"]
  }
}
```

#### Product — e-commerce

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Widget Pro",
  "sku": "WP-2026-001",
  "brand": { "@type": "Brand", "name": "Acme" },
  "description": "High-performance widget, Korean language support",
  "image": "https://acme.com/widget.jpg",
  "offers": {
    "@type": "Offer",
    "price": "49900",
    "priceCurrency": "KRW",
    "availability": "https://schema.org/InStock",
    "url": "https://acme.com/products/widget-pro"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "342"
  }
}
```

#### FAQPage — support pages

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is your return policy?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Full refund within 14 days of purchase if unused."
    }
  }]
}
```

#### BreadcrumbList — site hierarchy

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1,
      "name": "Home", "item": "https://acme.com/" },
    { "@type": "ListItem", "position": 2,
      "name": "Products", "item": "https://acme.com/products" },
    { "@type": "ListItem", "position": 3,
      "name": "Widget Pro" }
  ]
}
```

#### Article / Event

Both rely on `datePublished`, `author`, and (for Events) `location`. See [schema.org](https://schema.org) for the full vocabulary.

> 🛠 **Validate before shipping**: [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema Markup Validator](https://validator.schema.org). Make passing them a release gate.

---

## 7. The AI Entry Point: llms.txt

If robots.txt is for crawlers, **llms.txt is the entry point for LLM agents at inference time.** Proposed by Jeremy Howard (co-founder of Answer.AI) in September 2024 and adopted, as of 2026, by **Anthropic, Cloudflare, Vercel, Stripe, Perplexity, and Maryland.gov**, among others. WordPress (via Yoast), Webflow, and Mintlify offer native support.

### 7.1 Why it exists

LLM context windows are too small to ingest a full HTML site. After ads, navigation, and JavaScript-rendered content, more than half the tokens are noise. llms.txt provides a curated, markdown-native cheat sheet that **cuts token consumption by 50–70%.**

### 7.2 Two files

| File | Role | Approx size |
|---|---|---|
| `/llms.txt` | A map of the site (table of contents + links) | 1,000–3,000 tokens |
| `/llms-full.txt` | Full content flattened into one markdown file | tens to hundreds of thousands of tokens |

Profound's measurements show agents hit `/llms-full.txt` at roughly twice the rate of `/llms.txt`. Most sites should ship `llms.txt` first and add `llms-full.txt` once the pipeline can keep it fresh.

### 7.3 The llms.txt format

```markdown
# Acme Web3 Platform

> Acme operates blockchain infrastructure for the Korean and broader
> Asian markets. We issue stablecoins, power K-pop ticketing, and
> run an NFT marketplace.

Key concepts:
- REST + WebSocket for all APIs
- Authentication: API key or OAuth 2.0
- Available in Korean, English, Japanese, Chinese

## Core docs

- [Getting started](https://acme.io/docs/getting-started.md):
  Ship your first transaction in five minutes
- [API reference](https://acme.io/docs/api.md):
  Every endpoint, parameter, response shape
- [SDKs](https://acme.io/docs/sdk.md):
  JavaScript, Python, Go, Java

## Solutions

- [Stablecoin (STABLE1)](https://acme.io/products/stable1.md)
- [Ticketing NFT](https://acme.io/products/ticketing.md)

## Optional

- [About](https://acme.io/about.md)
- [Blog (latest 30)](https://acme.io/blog/feed.md)
```

#### Format rules

1. First line: `# H1` (site name) — **required**
2. `>` blockquote with a 1–3 sentence summary — **strongly recommended**, this becomes the LLM's mental model of your site
3. Plain markdown paragraphs for additional context — recommended
4. `## H2` sections to group pages (Core docs, Solutions, Policies)
5. Each item: `[Title](URL.md): one-sentence description`
6. `## Optional` section for material the LLM can deprioritize

### 7.4 Per-page .md alternates

If llms.txt is the map, per-page .md files are the territory. Configure your server so requesting the same URL with a `.md` suffix returns clean markdown.

```http
# Option 1: extension routing
GET /products/widget-pro      → HTML (humans)
GET /products/widget-pro.md   → Markdown (LLMs)

# Option 2: content negotiation
GET /products/widget-pro
Accept: text/markdown          → Markdown
Accept: text/html              → HTML
```

Advertise the alternate from each HTML page:

```html
<link rel="alternate"
      type="text/markdown"
      href="https://acme.io/products/widget-pro.md" />
```

### 7.5 The operations trap

> ⚠️ **Most common failure mode**: ship llms.txt once and never update it. **A stale index is worse than no index** — it actively misleads agents. Wire llms.txt regeneration into your build pipeline alongside sitemap generation, and make sure it lands with every major release.

### 7.6 Relationship with robots.txt

robots.txt says \"don't go here\"; llms.txt says \"this is what matters.\" They complement, not conflict. For AI training opt-outs, use a separate `ai.txt` or follow the emerging standards from the IETF AI Preferences Working Group.

---

## 8. WebMCP: The Next-Generation Agent Interface

**WebMCP is Chrome's proposed standard, released as an Early Preview Program in February 2026**, that lets a site expose structured tools directly to agents. Today's screenshot-plus-DOM approach is robust but slow. WebMCP cuts ambiguity by giving agents a typed contract for the actions you want them to perform.

### 8.1 Two APIs

#### Declarative — straight from HTML

For standard form-driven actions you can stay in HTML:

```html
<!-- Conceptual example; check the EPP docs for exact syntax -->
<form data-mcp-tool="searchProducts"
      data-mcp-description="Search the product catalog">
  <label for="q">Query</label>
  <input id="q" name="query"
         data-mcp-param="query"
         data-mcp-type="string"
         required />
  <label for="price">Max price</label>
  <input id="price" name="max_price"
         data-mcp-param="max_price"
         data-mcp-type="number" />
  <button type="submit">Search</button>
</form>
```

#### Imperative — register tools in JS

For multi-step or dynamic flows, register tools with JavaScript:

```javascript
// Conceptual pseudo-code
navigator.mcp?.registerTool({
  name: 'createSupportTicket',
  description: 'Create a technical support ticket',
  parameters: {
    title: { type: 'string', required: true },
    severity: { type: 'enum',
                values: ['low', 'normal', 'high', 'critical'] },
    description: { type: 'string' }
  },
  handler: async ({ title, severity, description }) => {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      body: JSON.stringify({ title, severity, description })
    });
    return await res.json();
  }
});
```

### 8.2 High-value use cases

- **Customer support**: the agent auto-fills OS, browser, app version into a precise ticket
- **E-commerce**: agent navigates product search, options, and checkout deterministically
- **Travel**: structured search, filter, and book — multi-step flows where DOM scraping is fragile
- **Fintech / Web3**: wallet connect and transaction signing, with explicit intent declared

### 8.3 Join the Early Preview Program

Sign up at [developer.chrome.com/docs/ai/join-epp](https://developer.chrome.com/docs/ai/join-epp) to access the docs, demos, and changelog.

> 🚀 **Rollout strategy**: you don't need WebMCP everywhere. Pick the 3–5 highest-leverage tasks you want agents to perform (search, checkout, ticket creation), run a PoC, then expand as the standard stabilizes.

---

## 9. Reference Implementations

### 9.1 Anthropic Docs

- **URL**: [docs.anthropic.com](https://docs.anthropic.com) · **llms.txt**: [docs.anthropic.com/llms.txt](https://docs.anthropic.com/llms.txt)
- Hosted on Mintlify; auto-generated `.md` alternates on every doc
- Both `llms.txt` and `llms-full.txt`
- Code blocks with explicit language tags and copy buttons
- Left tree navigation built with semantic `<nav>`
- Same content exposed to IDEs via `mcpdoc` MCP server

### 9.2 Vercel

- **URL**: [vercel.com](https://vercel.com) · **llms.txt**: [vercel.com/docs/llms.txt](https://vercel.com/docs/llms.txt)
- Rich contextual descriptions per API endpoint — improves agent tool selection
- Append `.md` to any docs URL for the markdown version
- CTA position is consistent across all pages — stable layout

### 9.3 Cloudflare Developers

- **URL**: [developers.cloudflare.com](https://developers.cloudflare.com) · **llms.txt**: [developers.cloudflare.com/llms.txt](https://developers.cloudflare.com/llms.txt)
- Ships both `llms.txt` and `llms-full.txt`
- Per-product grouping with clear `## H2` boundaries
- Workers code samples include runnable Playground URLs

### 9.4 Stripe Docs

- **URL**: [docs.stripe.com](https://docs.stripe.com)
- Stripe Workbench lets LLMs simulate real API calls
- Every page marks up its API object schema in JSON-LD
- Idempotency keys and error codes are surfaced as first-class — critical for agent reliability

### 9.5 Maryland.gov — public sector example

- **URL**: [maryland.gov](https://www.maryland.gov) · **llms.txt**: [maryland.gov/llms.txt](https://www.maryland.gov/llms.txt)
- Explicit usage policy: \"do not use for legal, policy, or eligibility determinations\"
- Accessibility policy, contact info, update cadence all stated
- The first widely-cited public-sector llms.txt — useful template for any regulated site

### 9.6 The Mintlify-hosted ecosystem

[Mintlify](https://mintlify.com) auto-generates `llms.txt` and an MCP server for every site it hosts — Cursor, Bolt.new, Resend, Octokit, and thousands of others get this for free. For your own docs, evaluate Mintlify or alternatives like Docusaurus with `docusaurus-plugin-llms`, or Astro Starlight.

### 9.7 Seven lessons to apply

1. Ship `.md` alternates for your key pages
2. Put `/llms.txt` at the domain root
3. Keep the primary CTA in the same place on every page
4. Mark up API objects, products, and the organization with JSON-LD
5. Pair every code example with a runnable environment (Playground, Replit)
6. State policies and disclaimers in `llms.txt`
7. Identify the 3–5 workflows worth wrapping in WebMCP

---

## 10. Agent-Friendliness Audit Checklist

Use this to score your site. Score each row per page (✅ / ⚠️ / ❌) and track the rollup quarterly.

### 10.1 HTML structure (weight 30%)

- [ ] `<html lang="...">` set to the correct language code
- [ ] Semantic landmarks: `header` / `nav` / `main` / `footer`
- [ ] Exactly one `<h1>` per page
- [ ] Heading levels never skip (h1 → h2 → h3)
- [ ] Every clickable element is `<button>` or `<a href>`
- [ ] Every form input has `<label for>`
- [ ] All images have meaningful `alt`

### 10.2 Accessibility tree (weight 20%)

- [ ] Chrome DevTools a11y tree is not flat
- [ ] Every button and link has an accessible name
- [ ] Icon buttons carry `aria-label`
- [ ] Modals and dropdowns use `aria-expanded` / `aria-controls`
- [ ] Lighthouse accessibility ≥ 95

### 10.3 Visual and layout (weight 15%)

- [ ] CLS < 0.1
- [ ] LCP < 2.5s
- [ ] Primary CTA in the same place on every page
- [ ] Clickable areas ≥ 44×44 px
- [ ] `cursor: pointer` where appropriate
- [ ] No invisible overlays blocking clicks

### 10.4 Structured data (weight 15%)

- [ ] Site-wide `Organization` JSON-LD
- [ ] Page-type specific schemas (`Product` / `Article` / `FAQPage` …)
- [ ] Passes Schema Markup Validator
- [ ] `BreadcrumbList` for hierarchy

### 10.5 AI entry point (weight 15%)

- [ ] `/llms.txt` exists and was updated in the last 30 days
- [ ] `/llms-full.txt` exists (optional)
- [ ] Key pages have `.md` alternates
- [ ] `<link rel="alternate" type="text/markdown">` advertised in `<head>`
- [ ] `robots.txt` references the `llms.txt` location

### 10.6 Next-generation (weight 5%)

- [ ] 3–5 core actions identified as WebMCP candidates
- [ ] Joined Chrome EPP; PoC underway

### 10.7 Tooling

| Tool | Purpose | URL |
|---|---|---|
| Lighthouse | A11y, perf, SEO scoring | Built into Chrome DevTools |
| Pa11y | CLI a11y automation | [pa11y.org](https://pa11y.org) |
| axe DevTools | Deep a11y inspection | [deque.com/axe](https://www.deque.com/axe) |
| Schema Validator | JSON-LD validation | [validator.schema.org](https://validator.schema.org) |
| Rich Results Test | Google-friendly check | [search.google.com/test/rich-results](https://search.google.com/test/rich-results) |
| llms-txt.io validator | llms.txt format check | [llms-txt.io](https://llms-txt.io) |

---

## 11. A Phased Adoption Roadmap

You can't ship everything at once. A four-phase plan, executed quarter by quarter, works well.

### Phase 1 (1–2 weeks): quick wins

1. Run the Chrome DevTools a11y tree audit on the home page and checkout
2. Replace div buttons with `<button>` sitewide
3. Add `<label for>` to every input that has only a placeholder
4. Add `cursor: pointer` to your global design tokens
5. Add a single `Organization` JSON-LD to every page

### Phase 2 (3–6 weeks): structure

1. Apply semantic landmarks (header/nav/main/footer) consistently
2. ARIA state attributes on every modal and dropdown
3. Page-type-specific JSON-LD (Product, Article, FAQPage)
4. Hit CLS / LCP / INP targets
5. Reach Lighthouse a11y 95+

### Phase 3 (7–10 weeks): AI entry point

1. Ship the first version of `/llms.txt`
2. Add `.md` alternates for your top docs and content pages
3. Wire `llms.txt` regeneration into your CMS / SSG build
4. Evaluate and ship `/llms-full.txt`
5. Publish your AI training / inference policy

### Phase 4 (week 11+): next-generation interfaces

1. Join the Chrome WebMCP EPP
2. Pick the 3–5 most valuable actions for agents
3. PoC with the declarative API
4. PoC with the imperative API for complex flows
5. Expand as the standard stabilizes

### 11.1 KPIs

| Metric | After Phase 1 | After Phase 2 | After Phase 3 | After Phase 4 |
|---|---|---|---|---|
| Lighthouse a11y | 85+ | 95+ | 95+ | 95+ |
| CLS | < 0.25 | < 0.1 | < 0.1 | < 0.1 |
| JSON-LD coverage | 30% | 70% | 90% | 95% |
| llms.txt | — | — | v1 shipped | Weekly refresh |
| Agent traffic share | baseline | +30% | +80% | +150% |
| AI citation frequency | baseline | +20% | +60% | +120% |

---

## Appendix A. Glossary

- **Accessibility tree** — the browser-native semantic tree derived from the DOM for assistive tech; also the primary input for AI agents.
- **Semantic HTML** — HTML that expresses meaning directly (`<button>`, `<nav>`) rather than generic containers.
- **JSON-LD** — JSON-formatted Linked Data. The standard way to express Schema.org vocabulary.
- **Schema.org** — the structured-data vocabulary jointly stewarded by Google, Microsoft, Yahoo, and Yandex.
- **llms.txt** — the LLM-targeted entry-point file proposed by Jeremy Howard in September 2024.
- **llms-full.txt** — a single markdown file containing the full flattened content of a site. Co-developed by Mintlify and Anthropic.
- **WebMCP** — Chrome's proposed standard (2026 EPP) for sites to expose structured tools to agents.
- **MCP (Model Context Protocol)** — the LLM ↔ external-tool protocol Anthropic released in November 2024.
- **Agent** — an autonomous system built from a model, rules, memory, and tools that plans and executes actions.
- **Zero-party agent** — an agent that operates only on local browser data.
- **First-party agent** — an agent built and operated by the service that owns its data.
- **Third-party agent** — an external agent that uses your site as a data source and tool.
- **Human-in-the-loop (HITL)** — a design pattern requiring explicit human confirmation at decision points.
- **Core Web Vitals** — Google's three web-performance metrics: LCP, INP, CLS.
- **GEO (Generative Engine Optimization)** — optimizing a site for visibility in generative AI search. The successor to SEO.

---

## Appendix B. References and Sources

### Primary sources

- Kulikowski, K. & More, O. (2026-04-01). **Building Agent-Friendly Websites**. [web.dev/articles/ai-agent-site-ux](https://web.dev/articles/ai-agent-site-ux). Google web.dev.
- Klepper, A., Kulikowski, K., & Nabors, R. L. (2025-02-25). **Introduction to Agents**. [web.dev/articles/ai-agents](https://web.dev/articles/ai-agents). Google web.dev.
- Bandarra, A. C. (2026-02-10). **WebMCP is available in Early Preview**. [developer.chrome.com/blog/webmcp-epp](https://developer.chrome.com/blog/webmcp-epp). Chrome for Developers.
- Howard, J. (2024-09). **The /llms.txt file**. [llmstxt.org](https://llmstxt.org). Answer.AI.

### Standards and tools

- **Schema.org**: [schema.org](https://schema.org)
- **Web Accessibility Initiative (WAI-ARIA)**: [w3.org/WAI/ARIA/apg/](https://www.w3.org/WAI/ARIA/apg/)
- **Core Web Vitals**: [web.dev/vitals](https://web.dev/vitals)
- **Mintlify (auto llms.txt + MCP)**: [mintlify.com](https://mintlify.com)
- **docusaurus-plugin-llms**: [github.com/rachfop/docusaurus-plugin-llms](https://github.com/rachfop/docusaurus-plugin-llms)
- **MCP**: [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Chrome AI EPP signup**: [developer.chrome.com/docs/ai/join-epp](https://developer.chrome.com/docs/ai/join-epp)

### License

This document quotes, translates, and synthesizes content from Google web.dev and Chrome for Developers. Those materials are licensed under [Creative Commons Attribution 4.0 (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) and the [Apache 2.0 license](https://www.apache.org/licenses/LICENSE-2.0). See [Google Developers Site Policies](https://developers.google.com/site-policies) for details.

This guide itself is distributed under **CC BY 4.0**. You may reuse, translate, and quote it freely with attribution.

---

## About the author

**Dennis Kim (HoKwang Kim / 김호광)**
- CEO, Betalabs Inc.
- Former CEO, Cyworld Z
- Microsoft Azure MVP (long-tenured)
- Publisher, Web3Paper
- GitHub: [@gameworkerkim](https://github.com/gameworkerkim)

---

<!-- Schema.org TechArticle metadata for AI agents -->
<!--
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Agent-Friendly Website Construction: A Practical Technical Guide",
  "alternateName": "에이전트 친화적인 웹사이트 구축을 위한 실무 기술 가이드",
  "description": "A practical, code-first guide to building websites that AI agents can navigate, understand, and act on.",
  "inLanguage": "en",
  "author": {
    "@type": "Person",
    "name": "Dennis Kim",
    "alternateName": "HoKwang Kim / 김호광",
    "jobTitle": "CEO of Betalabs Inc.",
    "url": "https://github.com/gameworkerkim"
  },
  "datePublished": "2026-05-19",
  "dateModified": "2026-05-19",
  "version": "1.0",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "keywords": "AI agents, agent-friendly websites, llms.txt, WebMCP, semantic HTML, accessibility tree, Schema.org, GEO",
  "about": [
    { "@type": "Thing", "name": "AI Agents" },
    { "@type": "Thing", "name": "Web Accessibility" },
    { "@type": "Thing", "name": "llms.txt standard" },
    { "@type": "Thing", "name": "WebMCP" },
    { "@type": "Thing", "name": "Schema.org Structured Data" }
  ],
  "isBasedOn": [
    {
      "@type": "CreativeWork",
      "url": "https://web.dev/articles/ai-agent-site-ux",
      "author": ["Kasper Kulikowski", "Omkar More"],
      "publisher": "Google web.dev",
      "datePublished": "2026-04-01"
    },
    {
      "@type": "CreativeWork",
      "url": "https://developer.chrome.com/blog/webmcp-epp",
      "author": "André Cipriani Bandarra",
      "publisher": "Chrome for Developers",
      "datePublished": "2026-02-10"
    },
    {
      "@type": "CreativeWork",
      "url": "https://llmstxt.org",
      "author": "Jeremy Howard",
      "publisher": "Answer.AI",
      "datePublished": "2024-09-03"
    }
  ]
}
-->
