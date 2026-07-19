# TechDoc

> Technical documents evaluating and curating recently trending technologies — serverless, cloud cost optimization, AI/LLM, quant finance, Claude Skills, MCP, UI frameworks, and developer infrastructure by Dennis Kim (@gameworkerkim).
>
> 한국어 버전: [README.md](README.md)

---

## Table of Contents

1. [LLM Wiki](#llm-wiki)
2. [Quant Finance & Trading Platforms](#quant-finance--trading-platforms) 🔥 **NEW**
3. [Claude Skills & Prompt Optimization](#claude-skills--prompt-optimization) 🔥 **NEW**
4. [MCP & AI Agents](#mcp--ai-agents) 🔥 **NEW**
5. [Serverless & SaaS Free Tier](#serverless--saas-free-tier)
6. [UI/Open Source Frameworks](#uiopen-source-frameworks) 🔥 **NEW**
7. [Python SaaS & Deployment](#python-saas--deployment) 🔥 **NEW**
8. [Cloud Cost Reduction](#cloud-cost-reduction)
9. [AI / LLM](#ai--llm)
10. [LLM Models & Local Deployment](#llm-models--local-deployment) 🔥 **NEW**
11. [Time Series Foundation Models (TSFM)](#time-series-foundation-models-tsfm)
12. [AI Coding Assistants](#ai-coding-assistants)
13. [AI Agents & Web Standards](#ai-agents--web-standards)
14. [China/Tech Industry Analysis](#chinatech-industry-analysis) 🔥 **NEW**
15. [OpenCode Korean Localization](#opencode-korean-localization) 🔥 **NEW**
16. [Developer Tools & Other](#developer-tools--other)

---

## LLM Wiki

LLM Wiki is a new tool category where AI scans GitHub codebases to auto-generate wiki-style documentation (structure, architecture, APIs), enabling code exploration via natural language Q&A. Below is a comparison of 3 major players.

| Document | Provider | Type | One-Liner |
|----------|----------|------|-----------|
| [DeepWiki Getting Started](DeepWiki/DeepWiki_Getting_Started.md) | Cognition Labs (Devin) | Hosted SaaS | Replace `github.com` with `deepwiki.com` in any URL — zero barrier. Includes self-hosted `deepwiki-open`. |
| [Google Code Wiki Getting Started](Google_Code_Wiki/Google%20code%20wiki%20getting%20started.md) | Google | Hosted SaaS | Gemini-powered. Auto-regenerates docs + diagrams on code changes; every description hyperlinked to source. |
| [OpenWiki Technical Docs](openwiki/README.md) | LangChain (Open Source) | Local CLI | Wiki for coding agents. Auto-manages AGENTS.md/CLAUDE.md, CI auto-refresh, private repo support. |

> **Summary** — Use DeepWiki or Google Code Wiki (no install, free) for quick public repo browsing. Choose OpenWiki (local execution) for private code or local LLM/agent integration.

---

## Quant Finance & Trading Platforms

🔥 **Top traffic · #1 real-usage intent** — The highest-traffic section by GitHub visitors. Practical platform guides for AI quant investors.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Qlib Getting Started (KR)](Quant_Qlib/Qlib-getting-started-KR.md) | Complete Microsoft Qlib guide — installation, data prep, workflow, benchmarks, KRX data integration, Toss Open API middleware connection. | 2026-07-18 |
| [toss-qlib-middleware](Quant_Qlib/toss-qlib-middleware/README.md) · [EN](Quant_Qlib/toss-qlib-middleware/README_EN.md) | Toss Securities Open API ↔ Microsoft Qlib middleware. OAuth2 + market data → CSV pipeline + Redis caching. Node.js/TypeScript. | 2026-07-18 |
| [GS Quant Getting Started](GS_Quant/GS%20Quant%20Getting%20Started.md) | Goldman Sachs institutional-grade quant finance toolkit — pros/cons, 8-platform comparison, caveats, installation, use cases. Core pricing/risk on GS servers; Python SDK is the client. | 2026-07-17 |

> *"Qlib is Microsoft's open standard for AI quant platforms. GS Quant is Wall Street's real weapon. Read both and you'll see how shallow most GitHub trading bots really are."*

---

## Claude Skills & Prompt Optimization

🔥 **Claude Skill demand explosion** — Automating quant investing workflows with Claude Agent Skills, plus a 5-tool comparison of prompt optimizers.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Claude Skills — Quant Investing Workflow](claude_skill/readme.md) | Two skills: `quant-market-brief` + `portfolio-daily-review`. Installation guide for Claude.ai, Claude Code, and API. "LLM is Excel, not an Oracle." | 2026-07-05 |
| [Claude Skill Building Guide](claude_skill/Claude_skill_guide.md) | Skill anatomy, design principles, 2 worked examples (daily market brief + portfolio review), linking skills, common mistakes. | 2026-07-05 |
| [quant-market-brief.skill](claude_skill/quant-market-brief.skill) | Daily market summary skill from quant perspective. ([Usage Guide](claude_skill/quant-market-brief_guide.md) · [Sample: 2026-07-05](claude_skill/quant-market-brief-2026-07-05.md)) | 2026-07-05 |
| [portfolio-daily-review.skill](claude_skill/portfolio-daily-review.skill) | Daily portfolio monitoring & evaluation skill. ([Usage Guide](claude_skill/portfolio-daily-review_guide.md)) | 2026-07-05 |
| [Claude Prompt Optimizer Tools Comparison](claude/Claude-prompt-optimizer-tools-guide.md) | 5 open-source optimizers compared: CheswickDEV, johnpsasser, severity1, Hashaam101, nidhinjs. Hook/Skill/Meta-optimizer mechanisms + selection guide. | 2026-07-14 |

> *"Skills reveal the gap between those who merely use prompts and those who build them. This directory is the field manual that bridges that gap."*

---

## MCP & AI Agents

The Model Context Protocol (MCP) is a standard protocol for LLMs to securely communicate with external tools and data sources. Practical examples using the AMQS quant strategy as an MCP server.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [MCP Server Development Getting Started](MCP/Mcp%20server%20getting%20started.md) | MCP concepts, architecture, differentiation from APIs + Building an AMQS quant signal server from scratch (Part 1+2). FastMCP, validation pipeline, Claude Desktop integration, security, remote deployment. | 2026-07-28 |
| [AMQS-AI-Infra MCP Server](MCP/README.md) · [EN](MCP/README.en.md) | Production MCP server for the AMQS strategy. 4 Tools, 1 Resource, 1 Prompt. FastMCP + validation pipeline + Claude Desktop config. | 2026-07-28 |
| [MCP Security Migration Guide](MCP/MCP-2026-07-28-Security-Migration-Guide.md) | MCP security migration guide. | 2026-07-28 |

> *"MCP is the protocol that gives LLMs hands and feet. If APIs say 'give me data,' MCP says 'use these tools to get the job done.'"*

---

## Serverless & SaaS Free Tier

Practical guides evaluating free-tier serverless platforms and SaaS services. For developers and startups aiming to minimize infrastructure costs.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Cloudflare Free Tier Guide](CloudFlare/Cloudflare%20free%20tier%20guide.md) | Comprehensive Cloudflare free tier: Workers, Pages, D1, R2, KV, security services. | 2026-05-12 |
| [Oracle Cloud Free Tier Guide](OracleCloud/02.%20Oracle%20Cloud%20Free%20Tier%20Guide.md) | Oracle Cloud always-free tier (Korean): ARM VM, Compute, databases, networking. | 2026-05-09 |
| [Neon Review](Neon/Neon_review.md) | Neon.tech evaluation — serverless PostgreSQL, branching, free tier limits, pricing, performance. | 2026-06-09 |
| [Turso Guide](SQLite_%20Turso/Turso_guide.md) | Edge-distributed SQLite Turso — setup, replication, use cases, free tier. | 2026-06-09 |
| [Upstash Guide](Serverless_Redis/upstash_guide.md) | Serverless Redis/Kafka Upstash evaluation — request-based billing, free tier analysis. | 2026-06-09 |
| [Vercel Analysis](vercel/vercel_analysis.md) | Deep Vercel platform analysis: pricing, edge functions, limitations, workload cost-efficiency. | 2026-06-09 |
| [Global Free CDN Guide](github_cdn/Global%20free%20cdn%20guide.md) | Static asset delivery via jsDelivr, GitHub raw CDN, and other global free CDNs. | 2026-06-12 |
| [GitHub CDN](github_cdn/github_cdn.md) | Deep technical guide on using GitHub repos with jsDelivr as a free CDN. | 2026-06-10 |
| [Free Email Sending Solutions](FreeEmail/FreeEmail_guide.md) | 8 services compared (Resend, Brevo, Mailgun, MailerSend, SES, Mailtrap, SendGrid, Postmark) with Vercel + Next.js recommendations. | 2026-06-14 |
| [Supabase Complete Guide](OpenSource_Firebase/SuperBase_guide.md) | Open-source Firebase alternative — PostgreSQL, Auth, Storage, Realtime, Edge Functions, Vercel integration, pricing. | 2026-06-14 |

---

## UI/Open Source Frameworks

🔥 **#3 in views, top real-usage intent** — Python web UI, Meta's design system, browser-based Python execution.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Astryx Getting Started](UI_OpenSource/Astryx%20getting%20started.md) | Meta's MIT-licensed "Agent-Ready" unified design system (React + StyleX) — 150+ components, 7 themes, CLI, MCP server, templates. Battle-tested across 13,000+ internal Meta apps over 8 years. | 2026-07-15 |
| [NiceGUI Getting Started](Python_NiceUI/NiceGUI-Getting-Started.md) | Build modern interactive web apps in pure Python — compared with Streamlit, Gradio, Dash. Installation, UI elements, state management, chart examples. | 2026-07-18 |
| [Pyodide Technical Docs](Python_Pyodide/Pyodide.md) | Run Python in the browser — WebAssembly + CPython. PEP 783 standardization, JS-Python FFI, Worker patterns, 8-competitor comparison (verified & expanded edition). | 2026-07-19 |

> *"Astryx is the ultimate design system, NiceGUI is magic for Python frontends, Pyodide revolutionizes Python in the browser. Master them one at a time."*

---

## Python SaaS & Deployment

Free Python web app deployment methods and PaaS platform comparisons.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Python SaaS Free Hosting](Python_SaaS/Python-SaaS-Free-Hosting-Platforms.md) | 10 free hosting platforms for Python web apps — Streamlit Cloud, Railway, Render, Fly.io, Hugging Face Spaces, etc. | 2026-07-15 |
| [Free Web Hosting Comparison](Free_Hosting/FreeHosting.md) | 8 free hosting services compared: GitHub Pages, Netlify, Vercel, Cloudflare Pages, Railway, Render, Fly.io, Firebase. | 2026-07-15 |
| [Railway Getting Started](PaaS_Railway/Railway_Getting_Start.md) | Railway PaaS quick start — deployment, databases, environment variables, templates, pricing. | 2026-07-11 |
| [Orca Getting Started](orca/Orca%20getting%20started%20.md) | Orca platform guide — production deployment automation. | 2026-07-12 |

---

## Cloud Cost Reduction

Documents focused on reducing cloud infrastructure spending. For technical decision-makers and executives.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [AWS Cost Reduction for CEO](AWS/Aws%20cost%20reduction%20for%20ceo.md) | AWS cost optimization for executives: Reserved Instances, Savings Plans, rightsizing, architecture improvements. | 2026-05-30 |

---

## AI / LLM

LLM-related documents — token optimization, local deployment, security, knowledge management.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Caveman RTK Token Optimization](LLM/Caveman%20rtk%20token%20optimization.md) | LLM interaction token optimization — cost/latency reduction via prompt engineering and context management. | 2026-06-13 |
| [Quivr Guide](LLM/Quivr_guide.md) | LLM-based open-source second brain/knowledge management platform setup & usage. 38,000+ stars. | 2026-06-13 |
| [Secret Scanning LLM Harness Prompt](LLM_Security/Secret%20scanning%20llm%20harness%20prompt.md) | LLM-based prompt harness design for detecting secrets, API keys, and credentials in codebases. | 2026-06-06 |
| [Ollama Installation Guide](Local_LLM/Ollama_Install_Guilde.md) | Step-by-step Ollama guide for running local LLMs (Llama, Mistral, etc.) on personal hardware. | 2026-05-xx |
| [Headroom Complete Guide](Headroom/Headroom%20complete%20guide.md) | AI agent context-aware compression — 60-95% token savings. SmartCrusher, CodeCompressor, CacheAligner engines. | 2026-06-12 |
| [Open Code Review Guide](LLM/Open%20code%20review%20guide.md) | Deep review of the Open Code CLI tool — DeepSeek V4 Pro integration, setup, optimization, command reference, tool comparison. | 2026-06-15 |
| [Tencent HY3 Getting Started (KR)](Tencent_LLM/Tencent%20HY3%20Getting%20Started%20KR.md) | Tencent Hy3 (295B MoE) practical getting-started — price/performance comparison (1/25th of Claude Sonnet), self-hosting, coding tool integration. | 2026-07-16 |

---

## LLM Models & Local Deployment

🔥 Latest LLM model analysis and local execution guides.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [MiniCPM5 1B Fable5 Thinking](LLM_%20Minicpm5/Minicpm5%201b%20fable5%20thinking%20getting%20started.md) | Applying Fable5-style thinking to MiniCPM5 1B — Claude-level reasoning inference, ultra-lightweight, local. | 2026-07-16 |
| [Bonsai-27B GGUF Guide](LLM_Bonsai/Bonsai-27b-gguf.md) | Local execution guide for Bonsai-27B quantized models — llama.cpp, Ollama integration, VRAM optimization. | 2026-07-16 |
| [Qwen Local Installation Guide](Local_LLM/Qwen_Local_Install_guilde.md) | Alibaba Qwen series local installation & execution — Ollama, vLLM, SGLang setup. | 2026-07-10 |
| [Zcode GLM Review](Zcode/GLM_Reveiw.md) | Tsinghua GLM series model analysis — ChatGLM, GLM-4 performance, Korean support, licensing. | 2026-07-14 |

---

## Time Series Foundation Models (TSFM)

Time Series Foundation Model and specialized architecture analysis — with stock/macro/prediction market applications.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [TimesFM Analysis Guide](TimesFM/TimesFM_%EB%B6%84%EC%84%9D_%EA%B0%80%EC%9D%B4%EB%93%9C.md) | Google Research time series foundation model — pros/cons, stock/Polymarket applications, China & global competitor comparison. | 2026-06-19 |
| [iTransformer Getting Started](TimesFM/iTransformer_%EA%B0%80%EC%9D%B4%EB%93%9C.md) | Tsinghua × Ant Group ICLR 2024 Spotlight — inverted Transformer for multivariate time series SOTA, install, examples, stock use. | 2026-06-19 |

---

## AI Coding Assistants

AI coding assistant comparison, pricing, and development environment integration.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [MiniMax Coding Guide (KO/EN)](MiniMax%20Coding%20Guide/README.md) | Practical MiniMax coding assistant guide — VS Code integration, agent workflows, price/performance vs DeepSeek/Anthropic/OpenAI. | 2026-06-04 |
| [Visual Studio C# LLM Guide (KO/EN)](MiniMax%20Coding%20Guide/visual-studio-csharp-llm-guide.ko.md) | C# coding AI assistant recommendations for Visual Studio + connecting various LLMs (with data verification). | 2026-06-04 |
| [AI Coding Workflow Guide](effective_LLM/AI%20coding%20workflow%20claude%20code%20cursor%20chatgpt.md) | Real-world AI coding workflow strategies using Claude Code, Cursor, and ChatGPT — tool selection, parallel use, context management, cost optimization. | 2026-06-16 |

---

## AI Agents & Web Standards

Standards for building websites that AI agents can navigate, understand, and act upon.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Agent-Friendly Website Guide (KO/EN/JA)](agent-friendly-website-guide/README.md) | Trilingual 11-chapter practical guide integrating Google web.dev (2026-04), Chrome WebMCP EPP, and Jeremy Howard's llms.txt standard. Covers semantic HTML, ARIA, Schema.org JSON-LD, llms.txt, WebMCP. CC BY 4.0. | 2026-05-19 |

---

## China/Tech Industry Analysis

Structural analysis of China's AI industry — physical AI, open-source strategy, engineering culture.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [China Physical AI Analysis](China-Physical-AI/China-Physical-AI.md) | China's physical AI ecosystem (robotics, manufacturing, drones) — key companies, government policy, tech stack, global competitive landscape. | 2026-07-17 |
| [Grok Build OSS Analysis](Grok_Build/Grok_build_oss_analysis_20260715.md) | xAI Grok build system open-source release analysis — infrastructure, training pipelines, technical decision-making insights. | 2026-07-15 |
| [Loop Engineering Failure Analysis](Loop/Why-Does-Loop-Engineering-Fail%3F.md) | "Why Does Loop Engineering Fail?" — structural causes and solutions for AI coding's iterative approach breaking down. | 2026-07-16 |

---

## OpenCode Korean Localization

Korean translation & localization project for the **OpenCode** AI coding CLI tool.

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [OpenCode KR README](OpenCode_KR/README.md) | Project overview — goals, progress, contribution guide. | 2026-07-17 |
| [Translation Glossary](OpenCode_KR/Glossary.md) | Standardized Korean translations for OpenCode UI/CLI terminology. | 2026-07-17 |
| [Translation Plan](OpenCode_KR/Translation_Plan.md) | Phased translation roadmap and priorities. | 2026-07-17 |

---

## Developer Tools & Other

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Bigfive Getting Started](Bigfive/Bigfive%20getting%20started.md) | Big Five personality trait model web-based assessment framework getting-started guide. | 2026-05-27 |
| [LLM Wiki Introduction](LLM_Wiki_%EC%86%8C%EA%B0%9C.md) | LLM Wiki category overview. | 2026-07-11 |

---

## Recently Updated

Recently added or significantly modified documents (newest first):

| Date | Document | Content |
|------|----------|---------|
| 2026-07-28 | MCP Server Development Getting Started | MCP concepts + AMQS signal server complete guide |
| 2026-07-28 | AMQS-AI-Infra MCP Server | MCP server README (4 Tools, 1 Resource, 1 Prompt) |
| 2026-07-19 | Pyodide Technical Docs | Browser Python execution — verified & expanded (8 competitors) |
| 2026-07-18 | Qlib Getting Started (KR) | Microsoft Qlib complete Korean guide |
| 2026-07-18 | toss-qlib-middleware | Toss Open API ↔ Qlib middleware |
| 2026-07-18 | NiceGUI Getting Started | Python web UI (4-framework comparison) |
| 2026-07-17 | GS Quant Getting Started | Goldman Sachs quant toolkit complete guide |
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
| 2026-07-05 | Claude Skills Quant Workflow | 2 skills + building guide |
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
| 2026-06-07 | Agent-Friendly Website Guide | AI agent web standards |
| 2026-06-06 | Secret Scanning Harness | LLM security |
| 2026-06-04 | MiniMax Coding Guide | AI coding assistant |
| 2026-05-30 | AWS Cost Reduction for CEO | Cloud cost |
| 2026-05-27 | Bigfive Getting Started | Personality assessment |
| 2026-05-12 | Cloudflare Free Tier Guide | Cloudflare free plan |
| 2026-05-09 | Oracle Cloud Free Tier Guide | Oracle free VMs |

---

## Note to AI Agents

This directory follows semantic structure where possible. The fastest machine-readable entry point is [llms.txt](llms.txt). Subdirectories with their own llms.txt files (e.g., `agent-friendly-website-guide/`, `Quant_Qlib/toss-qlib-middleware/`, `MCP/`, `China-Physical-AI/`) provide additional structured indexes.

## License

Unless otherwise stated in individual documents, documents authored by Dennis Kim are shared as reference material. `agent-friendly-website-guide/` is licensed under CC BY 4.0.
