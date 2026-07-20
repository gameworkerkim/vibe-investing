# TechDoc

> Technical documents evaluating and curating recently trending technologies — serverless, cloud cost optimization, AI/LLM, quant finance, Claude Skills, MCP, UI frameworks, and developer infrastructure by Dennis Kim (@gameworkerkim).
>
> 한국어 버전: [README.md](README.md)

---

## Available in English

These documents have English translations. Listed by read engagement (highest first).

### Quant Finance & Trading

| Document | Description |
|----------|-------------|
| [Qlib Getting Started (EN)](Quant_Qlib/Qlib-getting-started-EN.md) | Complete Microsoft Qlib guide — from installation to Korean market integration with Toss Open API middleware. |
| [toss-qlib-middleware (EN)](Quant_Qlib/toss-qlib-middleware/README_EN.md) | Toss Securities Open API — Microsoft Qlib middleware. Node.js/TypeScript + Redis caching. |
| [GS Quant Getting Started (EN)](GS_Quant/GS%20Quant%20Getting%20Started%20EN.md) | Goldman Sachs institutional-grade quant finance toolkit — pros/cons, platform comparison, use cases. |

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

### AI Coding Assistants

| Document | Description |
|----------|-------------|
| [MiniMax Coding Guide (EN)](MiniMax%20Coding%20Guide/minimax-coding-guide.en.md) | Practical MiniMax coding assistant — VS Code, agent workflows, price/performance comparison. |
| [Visual Studio C# LLM Guide (EN)](MiniMax%20Coding%20Guide/visual-studio-csharp-llm-guide.en.md) | C# AI assistant recommendations for Visual Studio + LLM connections. |

### AI Agents & Web Standards

| Document | Description |
|----------|-------------|
| [Agent-Friendly Website Guide (EN)](agent-friendly-website-guide/agent-friendly-website-guide.en.md) | 11-chapter practical guide: semantic HTML, ARIA, Schema.org JSON-LD, llms.txt, WebMCP. CC BY 4.0. |

---

## Full Directory

### Table of Contents
1. [LLM Wiki](#llm-wiki)
2. [Quant Finance & Trading Platforms](#quant-finance--trading-platforms)
3. [Claude Skills & Prompt Optimization](#claude-skills--prompt-optimization)
4. [MCP & AI Agents](#mcp--ai-agents)
5. [Serverless & SaaS Free Tier](#serverless--saas-free-tier)
6. [UI/Open Source Frameworks](#uiopen-source-frameworks)
7. [Python SaaS & Deployment](#python-saas--deployment)
8. [Cloud Cost Reduction](#cloud-cost-reduction)
9. [AI / LLM](#ai--llm)
10. [LLM Models & Local Deployment](#llm-models--local-deployment)
11. [Time Series Foundation Models (TSFM)](#time-series-foundation-models-tsfm)
12. [AI Coding Assistants](#ai-coding-assistants)
13. [AI Agents & Web Standards](#ai-agents--web-standards)
14. [China/Tech Industry Analysis](#chinatech-industry-analysis)
15. [OpenCode Korean Localization](#opencode-korean-localization)
16. [Developer Tools & Other](#developer-tools--other)

---

## LLM Wiki

LLM Wiki is a new tool category where AI scans GitHub codebases to auto-generate wiki-style documentation, enabling code exploration via natural language Q&A.

| Document | Provider | Type | One-Liner |
|----------|----------|------|-----------|
| [DeepWiki Getting Started](DeepWiki/DeepWiki_Getting_Started.md) | Cognition Labs (Devin) | Hosted SaaS | Replace `github.com` with `deepwiki.com` in any URL. Includes self-hosted `deepwiki-open`. |
| [Google Code Wiki Getting Started](Google_Code_Wiki/Google%20code%20wiki%20getting%20started.md) | Google | Hosted SaaS | Gemini-powered. Auto-regenerates docs + diagrams on code changes. |
| [OpenWiki Technical Docs](openwiki/README.md) | LangChain (Open Source) | Local CLI | Wiki for coding agents. AGENTS.md/CLAUDE.md auto-management, private repo support. |

---

## Quant Finance & Trading Platforms

Top traffic section. Practical platform guides for AI quant investors.

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Qlib Getting Started](Quant_Qlib/Qlib-getting-started-KR.md) · [EN](Quant_Qlib/Qlib-getting-started-EN.md) | KO·EN | Complete Microsoft Qlib guide — installation, data prep, workflow, benchmarks, KRX data integration, Toss Open API middleware. | 2026-07-18 |
| [toss-qlib-middleware](Quant_Qlib/toss-qlib-middleware/README.md) · [EN](Quant_Qlib/toss-qlib-middleware/README_EN.md) | KO·EN | Toss Securities Open API — Qlib middleware. OAuth2 + market data → CSV + Redis. Node.js/TypeScript. | 2026-07-18 |
| [GS Quant Getting Started](GS_Quant/GS%20Quant%20Getting%20Started.md) · [EN](GS_Quant/GS%20Quant%20Getting%20Started%20EN.md) | KO·EN | Goldman Sachs institutional quant toolkit — pros/cons, 8-platform comparison, use cases. | 2026-07-17 |

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

## Serverless & SaaS Free Tier

Free-tier serverless platforms and SaaS services for developers and startups.

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Cloudflare Free Tier Guide](CloudFlare/Cloudflare%20free%20tier%20guide.md) | KO | Cloudflare Workers, Pages, D1, R2, KV, security services. | 2026-05-12 |
| [Oracle Cloud Free Tier Guide](OracleCloud/02.%20Oracle%20Cloud%20Free%20Tier%20Guide.md) | KO | Oracle Cloud always-free tier — ARM VM, Compute, databases, networking. | 2026-05-09 |
| [Neon Review](Neon/Neon_review.md) | KO | Neon.tech — serverless PostgreSQL, branching, free tier, pricing, performance. | 2026-06-09 |
| [Turso Guide](SQLite_%20Turso/Turso_guide.md) | KO | Edge-distributed SQLite Turso — setup, replication, use cases, free tier. | 2026-06-09 |
| [Upstash Guide](Serverless_Redis/upstash_guide.md) | KO | Serverless Redis/Kafka Upstash — request-based billing, free tier analysis. | 2026-06-09 |
| [Vercel Analysis](vercel/vercel_analysis.md) | KO | Vercel platform — pricing, edge functions, limitations, cost-efficiency. | 2026-06-09 |
| [Global Free CDN Guide](github_cdn/Global%20free%20cdn%20guide.md) | KO | Static asset delivery via jsDelivr, GitHub raw CDN, and global free CDNs. | 2026-06-12 |
| [GitHub CDN](github_cdn/github_cdn.md) | KO | GitHub repos with jsDelivr as a free CDN — technical deep-dive. | 2026-06-10 |
| [Free Email Sending Solutions](FreeEmail/FreeEmail_guide.md) | KO | 8 services compared (Resend, Brevo, Mailgun, SES, etc.) with Vercel + Next.js recommendations. | 2026-06-14 |
| [Supabase Complete Guide](OpenSource_Firebase/SuperBase_guide.md) | KO | Open-source Firebase alternative — PostgreSQL, Auth, Storage, Realtime, Edge Functions. | 2026-06-14 |

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

Token optimization, local deployment, security, knowledge management.

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Caveman RTK Token Optimization](LLM/Caveman%20rtk%20token%20optimization.md) | KO | LLM interaction token optimization — cost/latency reduction. | 2026-06-13 |
| [Quivr Guide](LLM/Quivr_guide.md) | KO | Open-source second brain/knowledge management platform. 38,000+ stars. | 2026-06-13 |
| [Secret Scanning Harness Prompt](LLM_Security/Secret%20scanning%20llm%20harness%20prompt.md) | KO | LLM-based detection of secrets, API keys, credentials in codebases. | 2026-06-06 |
| [Ollama Installation Guide](Local_LLM/Ollama_Install_Guilde.md) | KO | Local LLMs (Llama, Mistral, etc.) on personal hardware. | 2026-05-xx |
| [Headroom Complete Guide](Headroom/Headroom%20complete%20guide.md) | KO | AI agent context-aware compression — 60-95% token savings. | 2026-06-12 |
| [Open Code Review Guide](LLM/Open%20code%20review%20guide.md) | KO | Deep review of Open Code CLI — DeepSeek V4 Pro, setup, optimization, comparison. | 2026-06-15 |
| [Tencent HY3 Getting Started](Tencent_LLM/Tencent%20HY3%20Getting%20Started%20KR.md) | KO | Tencent Hy3 (295B MoE) — price/performance (1/25th of Claude Sonnet), self-hosting. | 2026-07-16 |

---

## LLM Models & Local Deployment

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [MiniCPM5 1B Fable5 Thinking](LLM_%20Minicpm5/Minicpm5%201b%20fable5%20thinking%20getting%20started.md) | KO | Claude-level reasoning inference, ultra-lightweight, local. | 2026-07-16 |
| [Bonsai-27B GGUF Guide](LLM_Bonsai/Bonsai-27b-gguf.md) | KO | Local execution — llama.cpp, Ollama, VRAM optimization. | 2026-07-16 |
| [Qwen Local Installation Guide](Local_LLM/Qwen_Local_Install_guilde.md) | KO | Alibaba Qwen series — Ollama, vLLM, SGLang setup. | 2026-07-10 |
| [Zcode GLM Review](Zcode/GLM_Reveiw.md) | KO | Tsinghua GLM series — ChatGLM, GLM-4 performance, Korean support, licensing. | 2026-07-14 |

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

## AI Agents & Web Standards

| Document | Lang | Description | Last Updated |
|----------|------|-------------|--------------|
| [Agent-Friendly Website Guide](agent-friendly-website-guide/README.md) · [EN](agent-friendly-website-guide/agent-friendly-website-guide.en.md) | KO·EN·JA | 11-chapter guide — semantic HTML, ARIA, Schema.org JSON-LD, llms.txt, WebMCP. CC BY 4.0. | 2026-05-19 |

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
| [LLM Wiki Introduction](LLM_Wiki_%EC%86%8C%EA%B0%9C.md) | KO | LLM Wiki category overview. | 2026-07-11 |

---

## Recently Updated

| Date | Document | Content |
|------|----------|---------|
| 2026-07-28 | MCP Server Getting Started | MCP concepts + AMQS signal server complete guide |
| 2026-07-28 | AMQS-AI-Infra MCP Server | MCP server (4 Tools, 1 Resource, 1 Prompt) |
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

This directory follows semantic structure where possible. The fastest machine-readable entry point is [llms.txt](llms.txt). Subdirectories with their own llms.txt files (e.g., `agent-friendly-website-guide/`, `Quant_Qlib/toss-qlib-middleware/`, `MCP/`, `China-Physical-AI/`) provide additional structured indexes.

## License

Unless otherwise stated in individual documents, documents authored by Dennis Kim are shared as reference material. `agent-friendly-website-guide/` is licensed under CC BY 4.0.
