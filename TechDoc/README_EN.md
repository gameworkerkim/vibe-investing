# TechDoc

> Technical documents evaluating and curating recently trending technologies — serverless, cloud cost optimization, AI/LLM, quant finance, Claude Skills, MCP, AI agent frameworks, open-weight models, web analytics, SEO, UI frameworks, and developer infrastructure by Dennis Kim (@gameworkerkim).
>
> 한국어 버전: [README.md](README.md)

---

## Available in English

These documents have English translations. Listed by read engagement (highest first).

### AI Open Weight Models **NEW**

| Document | Description |
|----------|-------------|
| [Awesome Open Weight Model — 3-Way Comparison (EN)](AI-Open-Weights-Model/readme_EN.md) | Solar Open2 (#1 Korean, 250B matching 1.6T) · DeepSeek V4-Flash (best self-host value) · KIMI K3 (frontend coding Arena #1, 2.8T) — benchmarks, hardware requirements, license matrix, scenario guide. |
| [DeepSeek V4 Getting Start (EN)](AI-Open-Weights-Model/DeepSeek-GettingStart_EN.md) | DeepSeek V4 Pro·V4-Flash — API, self-hosting, vLLM, SGLang, coding tool integration. |
| [KIMI K3 Getting Start (EN)](AI-Open-Weights-Model/KIMI-K3-GettingStart_EN.md) | Moonshot AI KIMI K3 (2.8T MoE/21B active) — 256K context, Mooncake serving, use cases. |
| [Solar Open2 Getting Start (EN)](AI-Open-Weights-Model/Solar-Open2-Getting-Start_EN.md) | Upstage Solar Open2 — Korean-English cross-lingual, 250B matching 1.6T, API + local inference. |

### Quant Finance & Trading

| Document | Description |
|----------|-------------|
| [Qlib Getting Started (EN)](Quant_Qlib/Qlib-getting-started-EN.md) | Complete Microsoft Qlib guide — from installation to Korean market integration with Toss Open API middleware. |
| [toss-qlib-middleware (EN)](Quant_Qlib/toss-qlib-middleware/README_EN.md) | Toss Securities Open API — Microsoft Qlib middleware. Node.js/TypeScript + Redis caching. |
| [GS Quant Getting Started (EN)](GS_Quant/GS%20Quant%20Getting%20Started%20EN.md) | Goldman Sachs institutional-grade quant finance toolkit — pros/cons, platform comparison, use cases. |
| [Robinhood MCP Getting Started (EN)](Robinhood/Robinhood-MCP-Getting-Started_EN.md) **NEW** | Official Agentic Trading MCP (2026.05.27) + 6 community servers — auth methods, risk analysis, selection guide. |

### Claude Skills & Prompt Optimization

| Document | Description |
|----------|-------------|
| [Claude Skill Building Guide (EN)](claude_skill/Claude_skill_guide_EN.md) | Skill anatomy, design principles, 2 worked examples (quant market brief + portfolio review). |
| [quant-market-brief skill](claude_skill/quant-market-brief.skill) | Daily quant market summary skill package — factors, volatility, fund flows. ([Guide](claude_skill/quant-market-brief_guide.md) · [Sample](claude_skill/quant-market-brief-2026-07-05.md)) |
| [portfolio-daily-review skill](claude_skill/portfolio-daily-review.skill) | Daily portfolio monitoring & evaluation skill package. ([Guide](claude_skill/portfolio-daily-review_guide.md)) |

### MCP & AI Agents

| Document | Description |
|----------|-------------|
| [AMQS-AI-Infra MCP Server (EN)](MCP/README.en.md) | Production MCP server for the AMQS quant strategy. 4 Tools, 1 Resource, 1 Prompt. |

### AI Agent Curation & Frameworks **NEW**

| Document | Description |
|----------|-------------|
| [Awesome Agent — OSS AI Agent Curation (EN)](Awesome-Agent/readme_EN.md) | OpenWorker (Andrew Ng) · goose (Linux Foundation AAIF) · OpenHands (All Hands AI) — hands-on comparison. CTI-focused security analysis (dual black-box, supply chain risk, approval fatigue) + 15-item adoption checklist. |
| [OpenWorker Review (EN)](Awesome-Agent/Openworker-Review_EN.md) | Andrew Ng's AI agent platform — architecture, trade-offs, competitor comparison. |
| [goose Review (EN)](Awesome-Agent/Goose-Review_EN.md) | Linux Foundation AAIF goose agent framework — MCP extensibility, governance, security boundaries. |
| [OpenHands Review (EN)](Awesome-Agent/OpenHands-Review_EN.md) | All Hands AI OpenHands (formerly OpenDevin) — real-world performance, limitations, security perimeter. |
| [AI Agent Framework — Microsoft vs LangChain (EN)](AI-Agent-Framework/AI-Agent-Framework_EN.md) | MAF Go vs LangChain/LangGraph — declarative agents, handoff, multi-agent patterns, selection criteria, Getting Started code. |
| [OpenCodex — LLM Proxy Analysis (EN)](LLM_Proxy/Opencodex_EN.md) | `@bitkyc08/opencodex` lightweight local LLM proxy — 40+ providers (Anthropic, Gemini, xAI, DeepSeek, Ollama etc.), OAuth, dashboard. |

### AI / LLM

| Document | Description |
|----------|-------------|
| [Claude Security Plugin Guide (EN)](LLM_Security/Claude-Security-Plugin-Guide_EN.md) | Multi-agent vulnerability scanner + preventative code review (claude-security + security-guidance) — architecture, 6-phase pipeline, 3-lens verification, 12-product comparison. |
| [Awesome LLM Apps — Fact-Check Review (EN)](Awesome-LLM-Apps/Awesome-LLM-Apps-review_EN.md) **NEW** | GitHub 118k-star `Shubhamsaboo/awesome-llm-apps` verified review — 15 categories, 100+ runnable templates, framework fragmentation & production readiness analysis. |
| [ClawSecCheck — AI Agent Security Self-Audit (EN)](Claw_Security/ClawSecCheck_EN.md) **NEW** | OpenClaw AI agent security audit tool — zero-dependency (Python stdlib), Lethal Trifecta metrics, A-F scoring, RISK-01~10 engine, CI gate. |

### AI Coding Assistants

| Document | Description |
|----------|-------------|
| [MiniMax Coding Guide (EN)](MiniMax%20Coding%20Guide/minimax-coding-guide.en.md) | Practical MiniMax coding assistant — VS Code, agent workflows, price/performance comparison. |
| [Visual Studio C# LLM Guide (EN)](MiniMax%20Coding%20Guide/visual-studio-csharp-llm-guide.en.md) | C# AI assistant recommendations for Visual Studio + LLM connections. |

### LLM Wiki

| Document | Description |
|----------|-------------|
| [DeepWiki Getting Started (EN)](DeepWiki/DeepWiki_Getting_Started_EN.md) | AI code documentation tool — just change `github.com` to `deepwiki.com`. Includes self-hosted `deepwiki-open` guide. |
| [Google Code Wiki Getting Started (EN)](Google_Code_Wiki/Google%20code%20wiki%20getting%20started%20EN.md) | Gemini-powered living documentation — auto-regenerates docs + diagrams on code changes. |
| [OpenWiki Technical Docs (EN)](openwiki/README_EN.md) | LangChain's agent wiki CLI — AI coding agent context infrastructure. |

### Serverless & SaaS Free Tier

| Document | Description |
|----------|-------------|
| [Cloudflare Free Tier Guide (EN)](CloudFlare/Cloudflare%20free%20tier%20guide%20EN.md) | Workers, Pages, R2, KV — Azure-to-Cloudflare migration perspective. |
| [Oracle Cloud Free Tier Guide (EN)](OracleCloud/Oracle%20Cloud%20Free%20Tier%20Guide%20EN.md) | Always Free ARM 4-core 24GB — sign-up, ARM capacity workarounds, pitfalls. |
| [Neon Review (EN)](Neon/Neon_review_EN.md) | Serverless PostgreSQL — scale-to-zero, branching, cold start analysis. |
| [Turso Guide (EN)](SQLite_%20Turso/Turso_guide_EN.md) | Edge-native SQLite — many-database architecture, Cloudflare D1 comparison. |
| [Upstash Guide (EN)](Serverless_Redis/upstash_guide_EN.md) | Serverless Redis/Kafka — Aiven, Redis Cloud comparison. |
| [Vercel Analysis (EN)](vercel/vercel_analysis_EN.md) | Platform pros/cons — cost unpredictability, vendor lock-in risks. |
| [Global Free CDN Guide (EN)](github_cdn/Global%20free%20cdn%20guide%20EN.md) | 5 ways: jsDelivr, Cloudflare Pages, Vercel, Google Drive, SNS. |
| [GitHub CDN Guide (EN)](github_cdn/github_cdn_EN.md) | GitHub + jsDelivr JSON hosting deep-dive. |
| [Free Email Sending Solutions (EN)](FreeEmail/FreeEmail_guide_EN.md) | 8 services compared — Resend, Brevo, Mailgun, SES, etc. |
| [Supabase Complete Guide (EN)](OpenSource_Firebase/SuperBase_guide_EN.md) | Open-source Firebase alternative — PostgreSQL, Auth, RLS, Vercel integration. |

### Cloudflare Web Analytics & SEO **NEW**

| Document | Description |
|----------|-------------|
| [Cloudflare Web Analytics Complete Guide (EN)](CloudeFlare-Web-Analytics/CloudeFlare-Web-Analytics-Guide_EN.md) | Cloudflare native analytics (Web Analytics, Zaraz, Workers Engine+Logpush+R2) vs third-party (Umami, Plausible, GoatCounter, GA4, Matomo, PostHog) — phased selection guide. |
| [Umami Self-Hosting Plan — vibequant (EN)](CloudeFlare-Web-Analytics/Umami-Self-Hosting-Plan-vibequant_EN.md) | vibequant.cc Umami deployment on Cloudflare Pages + D1 — setup, cost analysis, privacy-first design. |
| [SEO & AI Readability Guide (EN)](SEO/SEO-AI-Readability-Guide_EN.md) | Multi-subdomain Cloudflare Pages SEO optimization — GSC, Naver, IndexNow, AI Overviews, Phase 1~7 checklist, 11 common SEO myths debunked. |

### Reverse Engineering & LLM **NEW**

| Document | Description |
|----------|-------------|
| [GhidraGPT Getting Started (EN)](GhidraGPT-Getting-Sarted_EN.md) | NSA Ghidra reverse engineering + LLM plugin guide — machine code to C decompilation, Claude/GPT/Ollama/Qwen integration, security analysis workflows. |

### LLM Models & Local Deployment **NEW**

| Document | Description |
|----------|-------------|
| [Colibri Getting Started (EN)](Colibri-Getting-Started_EN.md) | 744B GLM-5.2 MoE engine in pure C at 25GB RAM — 3-tier streaming (NVMe/VRAM/RAM), learning cache, Speculative Decoding, zero dependencies, Apache 2.0. |

### AI Agents & Web Standards

| Document | Description |
|----------|-------------|
| [Agent-Friendly Website Guide (EN)](agent-friendly-website-guide/agent-friendly-website-guide.en.md) | 11-chapter practical guide: semantic HTML, ARIA, Schema.org JSON-LD, llms.txt, WebMCP. CC BY 4.0. |

---

## Full Directory

### Table of Contents
1. [LLM Wiki](#llm-wiki)
2. [AI Open Weight Models — Comparison](#ai-open-weight-models--comparison) **NEW**
3. [Quant Finance & Trading Platforms](#quant-finance--trading-platforms)
4. [Claude Skills & Prompt Optimization](#claude-skills--prompt-optimization)
5. [MCP & AI Agents](#mcp--ai-agents)
6. [AI Agent Curation & Orchestration](#ai-agent-curation--orchestration) **NEW**
7. [Serverless & SaaS Free Tier](#serverless--saas-free-tier)
8. [UI/Open Source Frameworks](#uiopen-source-frameworks)
9. [Python SaaS & Deployment](#python-saas--deployment)
10. [Cloud Cost Reduction](#cloud-cost-reduction)
11. [AI / LLM](#ai--llm)
12. [LLM Models & Local Deployment](#llm-models--local-deployment)
13. [Time Series Foundation Models (TSFM)](#time-series-foundation-models-tsfm)
14. [AI Coding Assistants](#ai-coding-assistants)
15. [Reverse Engineering & LLM](#reverse-engineering--llm) **NEW**
16. [AI Agents & Web Standards](#ai-agents--web-standards)
17. [Cloudflare Web Analytics & SEO](#cloudflare-web-analytics--seo) **NEW**
18. [China/Tech Industry Analysis](#chinatech-industry-analysis)
19. [OpenCode Korean Localization](#opencode-korean-localization)
20. [Developer Tools & Other](#developer-tools--other)

---

## LLM Wiki

LLM Wiki is a new tool category where AI scans GitHub codebases to auto-generate wiki-style documentation, enabling code exploration via natural language Q&A.

| Document | Lang | Provider | Type | One-Liner |
|----------|------|----------|------|-----------|
| [DeepWiki Getting Started](DeepWiki/DeepWiki_Getting_Started.md) · [EN](DeepWiki/DeepWiki_Getting_Started_EN.md) | KO·EN | Cognition Labs (Devin) | Hosted SaaS | Replace `github.com` with `deepwiki.com` in any URL. |
| [Google Code Wiki Getting Started](Google_Code_Wiki/Google%20code%20wiki%20getting%20started.md) · [EN](Google_Code_Wiki/Google%20code%20wiki%20getting%20started%20EN.md) | KO·EN | Google | Hosted SaaS | Gemini-powered. Auto-regenerates docs + diagrams on code changes. |
| [OpenWiki Technical Docs](openwiki/README.md) · [EN](openwiki/README_EN.md) | KO·EN | LangChain (Open Source) | Local CLI | Wiki for coding agents. AGENTS.md/CLAUDE.md auto-management.

> **Summary** — Use DeepWiki or Google Code Wiki (zero-install, free) for quick public repo exploration. Choose OpenWiki (local) for private codebases or local LLM/agent integration.

---

## AI Open Weight Models — Comparison

**Solar Open2 · DeepSeek V4 · KIMI K3 head-to-head** — benchmarks, hardware requirements, cost-performance, and scenario-based analysis of the most notable open-weight LLMs of H1 2026.

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Awesome Open Weight Model — 3-Way Comparison](AI-Open-Weights-Model/readme.md) · [EN](AI-Open-Weights-Model/readme_EN.md) · [JA](AI-Open-Weights-Model/readme_JA.md) | KO·EN·JA | Solar Open2 (Korean #1) · DeepSeek V4-Flash (best self-host value) · KIMI K3 (frontend coding Arena #1) — benchmarks, scenarios, licenses, hardware matrix. **NEW** | 2026-07-22 |
| [DeepSeek V4 Getting Start](AI-Open-Weights-Model/DeepSeek-GettingStart.md) · [EN](AI-Open-Weights-Model/DeepSeek-GettingStart_EN.md) · [JA](AI-Open-Weights-Model/DeepSeek-GettingStart_JA.md) | KO·EN·JA | DeepSeek V4 Pro·V4-Flash — API, self-hosting, vLLM, SGLang, coding tool (Claude Code·Cline·OpenCode) integration. | 2026-07-22 |
| [KIMI K3 Getting Start](AI-Open-Weights-Model/KIMI-K3-GettingStart.md) · [EN](AI-Open-Weights-Model/KIMI-K3-GettingStart_EN.md) · [JA](AI-Open-Weights-Model/KIMI-K3-GettingStart_JA.md) | KO·EN·JA | Moonshot AI KIMI K3 (2.8T MoE/21B active) — 256K context, Mooncake serving, real-world use cases. | 2026-07-22 |
| [Solar Open2 Getting Start](AI-Open-Weights-Model/Solar-Open2-Getting-Start.md) · [EN](AI-Open-Weights-Model/Solar-Open2-Getting-Start_EN.md) · [JA](AI-Open-Weights-Model/Solar-Open2-Getting-Start_JA.md) | KO·EN·JA | Upstage Solar Open2 Korean-specialized model — 250B matching 1.6T-class, Korean-English cross-lingual, API + local inference. | 2026-07-22 |

> *"The open-weight era. Solar Open2 delivers 1.6T-class performance at 250B for Korean services. DeepSeek V4-Flash is the cost-performance king. KIMI K3 sets a new bar for coding agents."*

---

## Quant Finance & Trading Platforms

Top traffic section. Practical platform guides for AI quant investors.

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Qlib Getting Started](Quant_Qlib/Qlib-getting-started-KR.md) · [EN](Quant_Qlib/Qlib-getting-started-EN.md) | KO·EN | Complete Microsoft Qlib guide — installation, data prep, workflow, benchmarks, KRX data integration, Toss Open API middleware. | 2026-07-18 |
| [toss-qlib-middleware](Quant_Qlib/toss-qlib-middleware/README.md) · [EN](Quant_Qlib/toss-qlib-middleware/README_EN.md) | KO·EN | Toss Securities Open API — Qlib middleware. OAuth2 + market data → CSV + Redis. Node.js/TypeScript. | 2026-07-18 |
| [GS Quant Getting Started](GS_Quant/GS%20Quant%20Getting%20Started.md) · [EN](GS_Quant/GS%20Quant%20Getting%20Started%20EN.md) | KO·EN | Goldman Sachs institutional quant toolkit — pros/cons, 8-platform comparison, use cases. | 2026-07-17 |
| [Kiwoom REST API SDK & LLM Trading Skill](Kiwoom_OpenAPI/readme.md) **NEW** | KO | Kiwoom Securities OpenAPI+ (855pp, 500+ endpoints) — Python/Java/TypeScript multi-language SDK roadmap, Claude Skill natural-language trading architecture (Intent classifier, Safety Guard, WebSocket real-time execution). | 2026-07-24 |
| [Robinhood MCP Getting Started](Robinhood/Robinhood-MCP-Getting-Started.md) · [EN](Robinhood/Robinhood-MCP-Getting-Started_EN.md) · [CN](Robinhood/Robinhood-MCP-Getting-Started_CN.md) · [JA](Robinhood/Robinhood-MCP-Getting-Started_JA.md) **NEW** | KO·EN·CN·JA | Robinhood Official Agentic Trading MCP (2026.05.27) + 6 community MCP servers — auth methods (OAuth, API key, remote pass-through, password), risk analysis, selection guide. 4 languages. | 2026-07-24 |

> *"Qlib is the open standard for AI quant. GS Quant is Wall Street's real weapon. Kiwoom OpenAPI is Korean retail investors' practical entry point. Together they draw the full map of quant investing."*

---

## Claude Skills & Prompt Optimization

Automating quant investing workflows with Claude Agent Skills.

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Claude Skills — Quant Workflow](claude_skill/readme.md) | KO | Overview of `quant-market-brief` + `portfolio-daily-review` skills and installation guide. | 2026-07-05 |
| [Claude Skill Building Guide](claude_skill/Claude_skill_guide.md) · [EN](claude_skill/Claude_skill_guide_EN.md) | KO·EN | Skill anatomy, design principles, 2 worked examples, linking skills, common mistakes. | 2026-07-05 |
| [quant-market-brief skill](claude_skill/quant-market-brief.skill) | EN | Daily quant market summary skill. ([Guide](claude_skill/quant-market-brief_guide.md) · [Sample](claude_skill/quant-market-brief-2026-07-05.md)) | 2026-07-05 |
| [portfolio-daily-review skill](claude_skill/portfolio-daily-review.skill) | EN | Daily portfolio monitoring & evaluation skill. ([Guide](claude_skill/portfolio-daily-review_guide.md)) | 2026-07-05 |
| [Claude Prompt Optimizer Comparison](claude/Claude-prompt-optimizer-tools-guide.md) | KO | 5 open-source prompt optimizers compared — CheswickDEV, johnpsasser, severity1, Hashaam101, nidhinjs. | 2026-07-14 |

---

## MCP & AI Agents

The Model Context Protocol for LLMs to securely communicate with external tools and data sources.

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [MCP Server Getting Started](MCP/Mcp%20server%20getting%20started.md) | KO | MCP concepts, architecture, AMQS quant signal server implementation. FastMCP, Claude Desktop integration, security. | 2026-07-28 |
| [AMQS-AI-Infra MCP Server](MCP/README.md) · [EN](MCP/README.en.md) | KO·EN | Production MCP server for AMQS. 4 Tools, 1 Resource, 1 Prompt. | 2026-07-28 |
| [MCP Security Migration Guide](MCP/MCP-2026-07-28-Security-Migration-Guide.md) | EN | MCP security migration guide. | 2026-07-28 |

---

## AI Agent Curation & Orchestration

**Hands-on evaluation of open-source AI agents and orchestration frameworks** — from Andrew Ng's OpenWorker to Microsoft Agent Framework and Linux Foundation AAIF's goose, with deep security, governance, and licensing analysis.

### Open-Source AI Agent Curation

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Awesome Agent — OSS AI Agent Curation](Awesome-Agent/readme.md) · [EN](Awesome-Agent/readme_EN.md) · [JA](Awesome-Agent/readme_JA.md) **NEW** | KO·EN·JA | OpenWorker (Andrew Ng) · goose (Linux Foundation AAIF) · OpenHands (All Hands AI) — hands-on comparison with CTI-focused security analysis (dual black-box, supply chain risk, approval fatigue) + 15-item adoption checklist. 3 languages. | 2026-07-22 |
| [OpenWorker Review](Awesome-Agent/Openworker-Review.md) · [EN](Awesome-Agent/Openworker-Review_EN.md) · [JA](Awesome-Agent/Openworker-Review_JA.md) | KO·EN·JA | Andrew Ng's AI agent platform — architecture, trade-offs, competitor comparison, security considerations. | 2026-07-22 |
| [goose Review](Awesome-Agent/Goose-Review.md) · [EN](Awesome-Agent/Goose-Review_EN.md) · [JA](Awesome-Agent/Goose-Review_JA.md) | KO·EN·JA | Linux Foundation AAIF goose agent framework — MCP-based extensibility, governance model, security boundaries. | 2026-07-22 |
| [OpenHands Review](Awesome-Agent/OpenHands-Review.md) · [EN](Awesome-Agent/OpenHands-Review_EN.md) · [JA](Awesome-Agent/OpenHands-Review_JA.md) | KO·EN·JA | All Hands AI OpenHands (formerly OpenDevin) — real-world code-gen agent performance, limitations, security perimeter. | 2026-07-22 |

### AI Agent Frameworks

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [AI Agent Framework — Microsoft vs LangChain](AI-Agent-Framework/AI-Agent-Framework.md) · [EN](AI-Agent-Framework/AI-Agent-Framework_EN.md) · [CN](AI-Agent-Framework/AI-Agent-Framework_CN.md) · [JA](AI-Agent-Framework/AI-Agent-Framework_JA.md) **NEW** | KO·EN·CN·JA | Microsoft Agent Framework for Go (MAF Go) vs LangChain/LangGraph — declarative agents, handoff, RAG, multi-agent patterns, selection criteria, Getting Started code. Go ecosystem alternatives (Eino, ADK Go, no-framework). 4 languages. | 2026-07-22 |

### LLM Proxy & Routing

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [OpenCodex — LLM Proxy Analysis](LLM_Proxy/Opencodex.md) · [EN](LLM_Proxy/Opencodex_EN.md) · [CN](LLM_Proxy/Opencodex_CN.md) · [JA](LLM_Proxy/Opencodex_JA.md) **NEW** | KO·EN·CN·JA | `@bitkyc08/opencodex` lightweight local LLM proxy — routes to 40+ providers (Anthropic, Gemini, xAI, DeepSeek, Ollama etc.), OAuth, ChatGPT account pool, dashboard. ToS risks, same-name project disambiguation. 4 languages. | 2026-07-23 |

> *"The real gate for AI agent adoption isn't technology — it's security and governance. Opening the dual black-box, evaluating supply chain risks, and designing approval gates is where real engineering begins."*

---

## Serverless & SaaS Free Tier

Free-tier serverless platforms and SaaS services for developers and startups.

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Cloudflare Free Tier Usage — VibeQuant (KR)](CloudFlare/Cloudflare_무료티어_사용법.md) | KO | Pros/cons, PaaS comparison, recommended stack, vibequant.cc free-tier case study, setup & caveats. | 2026-07-24 |
| [Cloudflare Free Tier Guide](CloudFlare/Cloudflare%20free%20tier%20guide.md) · [EN](CloudFlare/Cloudflare%20free%20tier%20guide%20EN.md) | KO·EN | Cloudflare Workers, Pages, D1, R2, KV, security services. | 2026-05-12 |
| [Oracle Cloud Free Tier Guide](OracleCloud/02.%20Oracle%20Cloud%20Free%20Tier%20Guide.md) · [EN](OracleCloud/Oracle%20Cloud%20Free%20Tier%20Guide%20EN.md) | KO·EN | Oracle Cloud always-free tier — ARM VM, Compute, databases, networking. | 2026-05-09 |
| [Neon Review](Neon/Neon_review.md) · [EN](Neon/Neon_review_EN.md) | KO·EN | Neon.tech — serverless PostgreSQL, branching, free tier, pricing, performance. | 2026-06-09 |
| [Turso Guide](SQLite_%20Turso/Turso_guide.md) · [EN](SQLite_%20Turso/Turso_guide_EN.md) | KO·EN | Edge-distributed SQLite Turso — setup, replication, use cases, free tier. | 2026-06-09 |
| [Upstash Guide](Serverless_Redis/upstash_guide.md) · [EN](Serverless_Redis/upstash_guide_EN.md) | KO·EN | Serverless Redis/Kafka Upstash — request-based billing, free tier analysis. | 2026-06-09 |
| [Vercel Analysis](vercel/vercel_analysis.md) · [EN](vercel/vercel_analysis_EN.md) | KO·EN | Vercel platform — pricing, edge functions, limitations, cost-efficiency. | 2026-06-09 |
| [Global Free CDN Guide](github_cdn/Global%20free%20cdn%20guide.md) · [EN](github_cdn/Global%20free%20cdn%20guide%20EN.md) | KO·EN | Static asset delivery via jsDelivr, GitHub raw CDN, and global free CDNs. | 2026-06-12 |
| [GitHub CDN](github_cdn/github_cdn.md) · [EN](github_cdn/github_cdn_EN.md) | KO·EN | GitHub repos with jsDelivr as a free CDN — technical deep-dive. | 2026-06-10 |
| [Free Email Sending Solutions](FreeEmail/FreeEmail_guide.md) · [EN](FreeEmail/FreeEmail_guide_EN.md) | KO·EN | 8 services compared (Resend, Brevo, Mailgun, SES, etc.) with Vercel + Next.js recommendations. | 2026-06-14 |
| [Supabase Complete Guide](OpenSource_Firebase/SuperBase_guide.md) · [EN](OpenSource_Firebase/SuperBase_guide_EN.md) | KO·EN | Open-source Firebase alternative — PostgreSQL, Auth, Storage, Realtime, Edge Functions. | 2026-06-14 |

---

## UI/Open Source Frameworks

Python web UI, Meta's design system, browser-based Python execution.

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Astryx Getting Started](UI_OpenSource/Astryx%20getting%20started.md) | KO | Meta's MIT-licensed "Agent-Ready" unified design system (React + StyleX) — 150+ components, 7 themes, CLI, MCP server. | 2026-07-15 |
| [NiceGUI Getting Started](Python_NiceUI/NiceGUI-Getting-Started.md) | KO | Build interactive web apps in pure Python — Streamlit, Gradio, Dash comparison. | 2026-07-18 |
| [Pyodide Technical Docs](Python_Pyodide/Pyodide.md) | KO | Python in the browser — WebAssembly + CPython. PEP 783, JS-Python FFI, 8-competitor comparison. | 2026-07-19 |

---

## Python SaaS & Deployment

Free Python web app deployment methods and PaaS comparisons.

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Python SaaS Free Hosting](Python_SaaS/Python-SaaS-Free-Hosting-Platforms.md) | KO | 10 free hosting platforms — Streamlit Cloud, Railway, Render, Fly.io, Hugging Face Spaces. | 2026-07-15 |
| [Free Web Hosting Comparison](Free_Hosting/FreeHosting.md) | KO | 8 free hosting services — GitHub Pages, Netlify, Vercel, Cloudflare Pages, Railway, Render, Fly.io, Firebase. | 2026-07-15 |
| [Railway Getting Started](PaaS_Railway/Railway_Getting_Start.md) | KO | Railway PaaS — deployment, databases, environment variables, templates, pricing. | 2026-07-11 |
| [Orca Getting Started](orca/Orca%20getting%20started%20.md) | KO | Orca platform — production deployment automation. | 2026-07-12 |

---

## Cloud Cost Reduction

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [AWS Cost Reduction for CEO](AWS/Aws%20cost%20reduction%20for%20ceo.md) | KO | AWS cost optimization — Reserved Instances, Savings Plans, rightsizing, architecture. | 2026-05-30 |

---

## AI / LLM

Token optimization, local deployment, security, knowledge management, LLM app verification, AI agent security.

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Caveman RTK Token Optimization](LLM/Caveman%20rtk%20token%20optimization.md) | KO | LLM interaction token optimization — cost/latency reduction. | 2026-06-13 |
| [Quivr Guide](LLM/Quivr_guide.md) | KO | Open-source second brain/knowledge management platform. 38,000+ stars. | 2026-06-13 |
| [Secret Scanning Harness Prompt](LLM_Security/Secret%20scanning%20llm%20harness%20prompt.md) | KO | LLM-based detection of secrets, API keys, credentials in codebases. | 2026-06-06 |
| [Claude Security Plugin Guide (KR)](LLM_Security/Claude-Security-Plugin-Guide_KR.md) · [EN](LLM_Security/Claude-Security-Plugin-Guide_EN.md) · [CN](LLM_Security/Claude-Security-Plugin-Guide_CN.md) · [JA](LLM_Security/Claude-Security-Plugin-Guide_JA.md) | KO·EN·CN·JA | Multi-agent vulnerability scanner + preventative code review (claude-security + security-guidance) — architecture, 6-phase pipeline, 3-lens verification panel, 12-product competitive comparison, Getting Started. 4 languages. | 2026-07-26 |
| [Ollama Installation Guide](Local_LLM/Ollama_Install_Guilde.md) | KO | Local LLMs (Llama, Mistral, etc.) on personal hardware. | 2026-05-xx |
| [Headroom Complete Guide](Headroom/Headroom%20complete%20guide.md) | KO | AI agent context-aware compression — 60-95% token savings. | 2026-06-12 |
| [Open Code Review Guide](LLM/Open%20code%20review%20guide.md) | KO | Deep review of Open Code CLI — DeepSeek V4 Pro, setup, optimization, comparison. | 2026-06-15 |
| [Tencent HY3 Getting Started](Tencent_LLM/Tencent%20HY3%20Getting%20Started%20KR.md) | KO | Tencent Hy3 (295B MoE) — price/performance (1/25th of Claude Sonnet), self-hosting. | 2026-07-16 |
| [Awesome LLM Apps — Fact-Check Review](Awesome-LLM-Apps/Awesome-LLM-Apps-review.md) · [EN](Awesome-LLM-Apps/Awesome-LLM-Apps-review_EN.md) · [CN](Awesome-LLM-Apps/Awesome-LLM-Apps-review_CN.md) · [JA](Awesome-LLM-Apps/Awesome-LLM-Apps-review_JA.md) **NEW** | KO·EN·CN·JA | GitHub 118k-star `Shubhamsaboo/awesome-llm-apps` verified hands-on review — 15 categories (Agent Skills, RAG, Chatbot, Finance etc.), 100+ runnable templates, framework fragmentation & production-readiness gap analysis. 4 languages. | 2026-07-23 |
| [ClawSecCheck — AI Agent Security Self-Audit](Claw_Security/ClawSecCheck.md) · [EN](Claw_Security/ClawSecCheck_EN.md) · [CN](Claw_Security/ClawSecCheck_CN.md) · [JA](Claw_Security/ClawSecCheck_JA.md) **NEW** | KO·EN·CN·JA | OpenClaw AI agent security audit tool `ClawSecCheck` — zero-dependency (Python stdlib only), Lethal Trifecta metrics, A-F scoring, RISK-01~10 risk engine, CI gate, UNKNOWN≠PASS design principle. 4 languages. | 2026-07-22 |

---

## LLM Models & Local Deployment

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [MiniCPM5 1B Fable5 Thinking](LLM_%20Minicpm5/Minicpm5%201b%20fable5%20thinking%20getting%20started.md) | KO | Claude-level reasoning inference, ultra-lightweight, local. | 2026-07-16 |
| [Bonsai-27B GGUF Guide](LLM_Bonsai/Bonsai-27b-gguf.md) | KO | Local execution — llama.cpp, Ollama, VRAM optimization. | 2026-07-16 |
| [Qwen Local Installation Guide](Local_LLM/Qwen_Local_Install_guilde.md) | KO | Alibaba Qwen series — Ollama, vLLM, SGLang setup. | 2026-07-10 |
| [Zcode GLM Review](Zcode/GLM_Reveiw.md) | KO | Tsinghua GLM series — ChatGLM, GLM-4 performance, Korean support, licensing. | 2026-07-14 |
| [Colibri Getting Started](Colibri-Getting-Started.md) · [EN](Colibri-Getting-Started_EN.md) · [CN](Colibri-Getting-Started_CN.md) · [JA](Colibri-Getting-Started_JA.md) **NEW** | KO·EN·CN·JA | 744B GLM-5.2 MoE engine in pure C at just 25GB RAM — 3-tier streaming (NVMe/VRAM/RAM) architecture, learning cache (gets faster with use), Speculative Decoding, zero dependencies, Apache 2.0. 4 languages. | 2026-07-24 |

---

## Time Series Foundation Models (TSFM)

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [TimesFM Analysis Guide](TimesFM/TimesFM_%EB%B6%84%EC%84%9D_%EA%B0%80%EC%9D%B4%EB%93%9C.md) | KO | Google Research — pros/cons, stock/Polymarket applications, competitor comparison. | 2026-06-19 |
| [iTransformer Getting Started](TimesFM/iTransformer_%EA%B0%80%EC%9D%B4%EB%93%9C.md) | KO | Tsinghua x Ant Group ICLR 2024 Spotlight — inverted Transformer SOTA. | 2026-06-19 |

---

## AI Coding Assistants

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [MiniMax Coding Guide](MiniMax%20Coding%20Guide/README.md) · [EN](MiniMax%20Coding%20Guide/minimax-coding-guide.en.md) | KO·EN | VS Code integration, agent workflows, price/performance vs DeepSeek/Anthropic/OpenAI. | 2026-06-04 |
| [Visual Studio C# LLM Guide](MiniMax%20Coding%20Guide/visual-studio-csharp-llm-guide.ko.md) · [EN](MiniMax%20Coding%20Guide/visual-studio-csharp-llm-guide.en.md) | KO·EN | C# AI assistant recommendations for Visual Studio + LLM connections. | 2026-06-04 |
| [AI Coding Workflow Guide](effective_LLM/AI%20coding%20workflow%20claude%20code%20cursor%20chatgpt.md) | KO | Claude Code, Cursor, ChatGPT — tool selection, parallel use, context management, cost optimization. | 2026-06-16 |

---

## Reverse Engineering & LLM

LLM-augmented binary analysis and reverse engineering tools.

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [GhidraGPT Getting Started](GhidraGPT-Getting-Sarted.md) · [EN](GhidraGPT-Getting-Sarted_EN.md) · [CN](GhidraGPT-Getting-Sarted_CN.md) · [JA](GhidraGPT-Getting-Sarted_JA.md) **NEW** | KO·EN·CN·JA | NSA Ghidra reverse engineering framework + LLM plugin (Claude, GPT, Ollama, Qwen) — machine code to C decompilation, Function Rewrite, Code Explanation, security analysis workflows. Use Ollama local mode for sensitive binaries. 4 languages. | 2026-07-24 |

---

## AI Agents & Web Standards

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Agent-Friendly Website Guide](agent-friendly-website-guide/README.md) · [EN](agent-friendly-website-guide/agent-friendly-website-guide.en.md) | KO·EN·JA | 11-chapter guide — semantic HTML, ARIA, Schema.org JSON-LD, llms.txt, WebMCP. CC BY 4.0. | 2026-05-19 |

---

## Cloudflare Web Analytics & SEO

**Optimize web analytics, SEO, and AI search visibility simultaneously** — from Cloudflare-native analytics selection to Google Search Console, Naver, IndexNow, and AI Overviews integration.

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Cloudflare Web Analytics Complete Guide](CloudeFlare-Web-Analytics/CloudeFlare-Web-Analytics-Guide.md) · [EN](CloudeFlare-Web-Analytics/CloudeFlare-Web-Analytics-Guide_EN.md) · [CN](CloudeFlare-Web-Analytics/CloudeFlare-Web-Analytics-Guide_CN.md) · [JA](CloudeFlare-Web-Analytics/CloudeFlare-Web-Analytics-Guide_JA.md) **NEW** | KO·EN·CN·JA | Cloudflare native analytics (Web Analytics, Zaraz, Workers Engine+Logpush+R2) vs third-party (Umami, Plausible, GoatCounter, GA4, Matomo, PostHog) — phased selection guide with recommended path "Web Analytics → Umami expansion". 4 languages. | 2026-07-25 |
| [Umami Self-Hosting Plan — vibequant](CloudeFlare-Web-Analytics/Umami-Self-Hosting-Plan-vibequant.md) · [EN](CloudeFlare-Web-Analytics/Umami-Self-Hosting-Plan-vibequant_EN.md) · [CN](CloudeFlare-Web-Analytics/Umami-Self-Hosting-Plan-vibequant_CN.md) · [JA](CloudeFlare-Web-Analytics/Umami-Self-Hosting-Plan-vibequant_JA.md) **NEW** | KO·EN·CN·JA | vibequant.cc Umami self-hosting on Cloudflare Pages + D1 — concrete deployment setup, cost analysis, privacy-first architecture. 4 languages. | 2026-07-25 |
| [SEO & AI Readability Guide — vibequant](SEO/SEO-AI-Readability-Guide.md) · [EN](SEO/SEO-AI-Readability-Guide_EN.md) · [JA](SEO/SEO-AI-Readability-Guide_JA.md) **NEW** | KO·EN·JA | Multi-subdomain Cloudflare Pages SEO optimization — GSC, Naver, IndexNow, AI Overviews, Phase 1~7 checklist, brand entity separation strategy, 11 common SEO myths debunked (Google-Extended ≠ AI Overviews exclusion, sitemap optimization, etc.). P0~P3 execution checklist. 3 languages. | 2026-07-25 |

> *"Good SEO = Good AI readability. Building a site that both search engines and AI agents understand are two sides of the same task."*

---

## China/Tech Industry Analysis

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [China Physical AI Analysis](China-Physical-AI/China-Physical-AI.md) | KO | China's physical AI (robotics, manufacturing, drones) — key companies, policy, tech stack. | 2026-07-17 |
| [Grok Build OSS Analysis](Grok_Build/Grok_build_oss_analysis_20260715.md) | KO | xAI Grok build system — infrastructure, training pipelines, technical insights. | 2026-07-15 |
| [Loop Engineering Failure Analysis](Loop/Why-Does-Loop-Engineering-Fail%3F.md) | KO | Why AI coding loops fail — structural causes and solutions. | 2026-07-16 |

---

## OpenCode Korean Localization

Korean translation project for the **OpenCode** AI coding CLI tool.

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [OpenCode KR README](OpenCode_KR/README.md) | KO | Project overview — goals, progress, contribution guide. | 2026-07-17 |
| [Translation Glossary](OpenCode_KR/Glossary.md) | KO | Standardized Korean translations for OpenCode UI/CLI terminology. | 2026-07-17 |
| [Translation Plan](OpenCode_KR/Translation_Plan.md) | KO | Phased translation roadmap and priorities. | 2026-07-17 |

---

## Developer Tools & Other

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Bigfive Getting Started](Bigfive/Bigfive%20getting%20started.md) | KO | Big Five personality trait web-based assessment framework. | 2026-05-27 |
| [MY-IP Project Analysis](MY-IP/MY-IP.md) **NEW** | KO | jason5ng32's Node.js network diagnostics unified web app (10.1k stars) — IP lookup, WHOIS, DNS leak, WebRTC, speed test, browser fingerprinting in a single interface. | 2026-07-24 |
| [LLM Wiki Introduction](LLM_Wiki_%EC%86%8C%EA%B0%9C.md) · [EN](LLM_Wiki_%EC%86%8C%EA%B0%9C_EN.md) · [CN](LLM_Wiki_%EC%86%8C%EA%B0%9C_CN.md) · [JA](LLM_Wiki_%EC%86%8C%EA%B0%9C_JA.md) | KO·EN·CN·JA | LLM Wiki category overview — DeepWiki, Google Code Wiki, OpenWiki 3-way comparison. 4 languages. | 2026-07-11 |

---

## Recently Updated

| Date | Document | Content |
|------|----------|---------|
| 2026-07-28 | MCP Server Getting Started | MCP concepts + AMQS signal server complete guide |
| 2026-07-28 | AMQS-AI-Infra MCP Server | MCP server (4 Tools, 1 Resource, 1 Prompt) |
| 2026-07-26 | Claude Security Plugin Guide | claude-security + security-guidance complete guide (4 languages) |
| 2026-07-26 | Toss Open API IP Whitelist | Toss OAuth indie caution + CASSANDRA Naver rollback (KR·EN) |
| 2026-07-25 | Cloudflare Web Analytics Complete Guide | Cloudflare native + third-party analytics comparison (4 languages) |
| 2026-07-25 | Umami Self-Hosting Plan | vibequant.cc Umami deployment design (4 languages) |
| 2026-07-25 | SEO & AI Readability Guide | vibequant.cc GSC·Naver·AI Overviews SEO (3 languages) |
| 2026-07-24 | Colibri Getting Started | 744B GLM-5.2 MoE ultra-light C engine (4 languages) |
| 2026-07-24 | GhidraGPT Getting Started | NSA Ghidra + LLM reverse engineering plugin (4 languages) |
| 2026-07-24 | Kiwoom REST API SDK & LLM Trading Skill | 500+ endpoints analysis, multi-language SDK, Claude Skill architecture |
| 2026-07-24 | Robinhood MCP Getting Started | Official + community MCP 7-server comparison (4 languages) |
| 2026-07-24 | MY-IP Project Analysis | Network diagnostics unified web app analysis |
| 2026-07-23 | OpenCodex — LLM Proxy Analysis | 40+ provider routing proxy (4 languages) |
| 2026-07-23 | Awesome LLM Apps Fact-Check Review | 118k-star LLM apps repo verified review (4 languages) |
| 2026-07-22 | ClawSecCheck — AI Agent Security Audit | OpenClaw security self-audit tool (4 languages) |
| 2026-07-22 | AI Agent Framework Comparison | MAF Go vs LangChain/LangGraph (4 languages) |
| 2026-07-22 | Awesome Agent — AI Agent Curation | OpenWorker·goose·OpenHands hands-on comparison (3 languages) |
| 2026-07-22 | Awesome Open Weight Model — 3-Way | Solar Open2·DeepSeek V4·KIMI K3 benchmark analysis (3 languages) |
| 2026-07-24 | Cloudflare Free Tier Usage — VibeQuant | Free-tier architecture case study (KR) |
| 2026-07-19 | Pyodide Technical Docs | Browser Python execution — verified & expanded (8 competitors) |
| 2026-07-18 | Qlib Getting Started | Microsoft Qlib complete guide (KO + EN) |
| 2026-07-18 | toss-qlib-middleware | Toss Open API ↔ Qlib middleware (KO + EN) |
| 2026-07-18 | NiceGUI Getting Started | Python web UI (4-framework comparison) |
| 2026-07-17 | GS Quant Getting Started | Goldman Sachs quant toolkit (KO + EN) |
| 2026-07-17 | China Physical AI Analysis | China physical AI ecosystem |
| 2026-07-16 | Tencent HY3 Getting Started | Tencent Hy3 guide |
| 2026-07-16 | MiniCPM5 1B Fable5 Thinking | Ultra-light reasoning model |
| 2026-07-16 | Bonsai-27B GGUF | Local LLM quantization guide |
| 2026-07-16 | Loop Engineering Failure Analysis | AI coding loop structural limits |
| 2026-07-15 | Astryx Getting Started | Meta design system |
| 2026-07-15 | Python SaaS Free Hosting | 10 free Python web app platforms |
| 2026-07-15 | Free Web Hosting Comparison | 8 free hosting services compared |
| 2026-07-15 | Grok Build OSS Analysis | xAI Grok build system |
| 2026-07-14 | Claude Prompt Optimizer (5 tools) | OSS prompt optimizer comparison |
| 2026-07-14 | Zcode GLM Review | Tsinghua GLM series analysis |
| 2026-07-12 | Orca Getting Started | Deployment automation platform |
| 2026-07-11 | Railway Getting Started | PaaS quick start |
| 2026-07-11 | DeepWiki Getting Started | LLM Wiki — AI code doc automation |
| 2026-07-11 | Google Code Wiki Getting Started | LLM Wiki — Gemini-powered |
| 2026-07-11 | OpenWiki Technical Docs | LLM Wiki — local agent wiki CLI |
| 2026-07-10 | Qwen Local Installation Guide | Alibaba Qwen local LLM |
| 2026-07-05 | Claude Skills Quant Workflow | 2 skills + building guide (KO + EN) |
| 2026-06-19 | iTransformer Getting Started | Tsinghua multivariate time series |
| 2026-06-19 | TimesFM Analysis Guide | Google time series foundation model |
| 2026-06-16 | AI Coding Workflow Guide | Coding tool strategy |
| 2026-06-15 | Open Code Review Guide | CLI tool deep dive |
| 2026-06-14 | Supabase Complete Guide | Open-source Firebase alternative |
| 2026-06-14 | Free Email Sending Solutions | 8 email SaaS compared |
| 2026-06-13 | Caveman RTK Token Optimization | LLM token savings |
| 2026-06-13 | Quivr Guide | AI knowledge management |
| 2026-06-12 | Headroom Complete Guide | Token compression solution |
| 2026-06-12 | Global Free CDN Guide | Free CDN usage |
| 2026-06-10 | GitHub CDN | jsDelivr in depth |
| 2026-06-09 | Upstash Guide | Serverless Redis |
| 2026-06-09 | Turso Guide | Edge SQLite |
| 2026-06-09 | Neon Review | Serverless PostgreSQL |
| 2026-06-09 | Vercel Analysis | Free SaaS web server |
| 2026-06-07 | Ollama Installation Guide | Local LLM |
| 2026-06-07 | Agent-Friendly Website Guide | AI agent web standards (KO + EN) |
| 2026-06-06 | Secret Scanning Harness | LLM security |
| 2026-06-04 | MiniMax Coding Guide | AI coding assistant (KO + EN) |
| 2026-05-30 | AWS Cost Reduction for CEO | Cloud cost |
| 2026-05-27 | Bigfive Getting Started | Personality assessment |
| 2026-05-12 | Cloudflare Free Tier Guide | Cloudflare free plan |
| 2026-05-09 | Oracle Cloud Free Tier Guide | Oracle free VMs |

---

## Note to AI Agents

This directory follows semantic structure where possible. The fastest machine-readable entry point is [llms.txt](llms.txt). Subdirectories with their own llms.txt files (e.g., `agent-friendly-website-guide/`, `Quant_Qlib/toss-qlib-middleware/`, `MCP/`, `China-Physical-AI/`, `AI-Open-Weights-Model/`, `Awesome-Agent/`, `AI-Agent-Framework/`) provide additional structured indexes.

## License

Unless otherwise stated in individual documents, documents authored by Dennis Kim are shared as reference material. `agent-friendly-website-guide/` is licensed under CC BY 4.0.
