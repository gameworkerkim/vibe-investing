# DeepWiki Getting Started (English)

> An AI-powered tool that automatically generates codebase documentation just by changing the GitHub URL — an introductory guide.

---

## 1. What Is DeepWiki?

**DeepWiki** is an **AI-based code documentation tool** developed by **Cognition Labs**, known for the AI software engineer 'Devin'. Just enter a GitHub public repository URL, and AI analyzes the codebase structure and logic to automatically generate **structured wiki-style documentation**.

Simply put: "A service where you drop in a GitHub repo and AI automatically writes the manual."

### Key Features
- **Repository structure and architecture overview**
- **Automatic identification of tech stack and key components**
- **Auto-generated diagrams** visualizing module dependencies and data flows (Mermaid diagrams)
- **Natural language Q&A** about the codebase ("Where is authentication implemented?", etc.)
- Generates ~8 sections of Markdown pages: Overview / Structure / Architecture / API / Subsystems / Operations / Testing / Glossary

---

## 2. 60-Second Quick Start

### Method 1: Just change the URL (simplest)

Replace `github.com` with `deepwiki.com` in any GitHub URL. **No signup required, free.**

```
# Original (GitHub)
https://github.com/gameworkerkim/vibe-investing

# DeepWiki documentation
https://deepwiki.com/gameworkerkim/vibe-investing
```

### Method 2: Search on deepwiki.com

1. Go to https://deepwiki.com
2. Enter `username/repository` in the search bar (e.g., `facebook/react`)
3. Explore the generated wiki pages

### Method 3: Ask questions in natural language

Use the **Ask feature** on the generated wiki page to get context-aware answers:

```
Q: Where does this project handle authentication (login)?
Q: Which file contains the database connection configuration?
Q: What is the entry point of this repository?
```

---

## 3. When Is This Useful?

| Scenario | Use Case |
|---|---|
| New hire onboarding | Grasp the entire structure without reading hundreds of files |
| Preparing to contribute to OSS | Quickly understand which modules and data flows are relevant |
| Tech interview prep | Study the architecture of famous projects (React, TensorFlow, LangChain, etc.) |
| Investigating unfamiliar libraries | Get explanations from code even when official docs are sparse |

---

## 4. Strengths

- **Near-zero barrier** — no install, no plugin, no signup. Just change the URL.
- **Rapid understanding of complex codebases** — grasp overall structure and core logic at a glance.
- **Interactive exploration** — natural language Q&A offers more intuitive learning than static docs.
- **Multi-language and large repo support** — JavaScript, Python, Rust, Go, Java, etc. Popular projects are pre-indexed.
- **Deep Research mode** — code smell detection, architecture-level improvement suggestions, and other deep analyses.

## 5. Weaknesses

- **Only public repos are free** — private repos are planned for enterprise offering.
- **AI-generated documentation limits** — not official docs; errors, omissions, and deviations from actual implementation are possible.
- **Internet required** — cloud-based SaaS, no offline mode.
- **Potential duplicate information** — may overlap with well-maintained official documentation.
- **Large repos may have scope limits** — you can specify generation scope via `.devin/wiki.json`.

## 6. Cautions

- **Always verify AI-generated information** — a supplementary tool, not a replacement for official reference docs. Always check actual source code and official docs before production changes.
- **Don't upload sensitive code** — this is a public service. Don't use it to analyze private/sensitive code.
- **Documentation accuracy depends on code quality** — sparse comments and READMEs will produce lower-quality generated docs. Ensure your code has good LLM-friendly indexing.

---

## 7. Self-Hosted — `deepwiki-open`

The official DeepWiki SaaS runs only in the cloud and cannot be customized. To **self-host and operate** it, use the community open-source version **`deepwiki-open`**.

> Repository: https://github.com/AsyncFuncAI/deepwiki-open

### Why self-host?
- **Document private repos** — process internal/private code locally or on-premises without exposing it to external SaaS.
- **Choose your own LLM** — connect OpenAI, Google Gemini, OpenRouter, Azure, and even **Ollama local models**.
- **Full freedom** — customize prompts, generation scope, UI, and more.

### Install Method 1: Docker (recommended, simplest)

```bash
# 1. Clone repo
git clone https://github.com/AsyncFuncAI/deepwiki-open.git
cd deepwiki-open

# 2. Create .env file — only fill in the LLM keys you use
cat > .env <<'EOF'
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key
# (optional) OPENROUTER_API_KEY=...
# (optional) OLLAMA_HOST=http://host.docker.internal:11434
EOF

# 3. Run
docker-compose up

# 4. Browser
#   http://localhost:3000
```

### Install Method 2: Manual (frontend + backend)

```bash
# Backend (Python API server)
pip install -r api/requirements.txt
python -m api.main          # default port 8001

# Frontend (Next.js)
npm install
npm run dev                 # default port 3000
```

### SaaS vs Self-Hosted Summary

| Aspect | DeepWiki (Official SaaS) | deepwiki-open (Self-Hosted) |
|---|---|---|
| Installation | Not needed (just change URL) | Docker or manual install required |
| Private repos | Not free | Yes (local processing) |
| LLM choice | Fixed (proprietary LLM) | OpenAI/Gemini/Ollama etc. |
| Customization | None | Full freedom |
| Data security | Data sent to external cloud | Can stay on-premises |
| Entry difficulty | Very low | Medium (requires setup) |

> **One-liner**: For quickly browsing public repos, use **official SaaS**. For internal/private code or local LLM integration, choose **`deepwiki-open` self-hosted**.

---

## 8. Key Competitors

| Project | Developer | Characteristics |
|---|---|---|
| **DeepWiki** | Cognition Labs | The originator. SaaS model, uses proprietary LLM |
| **deepwiki-open** | Community (OSS) | Fully open-source DeepWiki clone. Self-host, customize |
| **Google CodeWiki** | Google | Launched Nov 2025. Google Cloud + Gemini, optimized for Google Search integration |
| **Alphadoc** | - | Similar AI documentation tool |
| **Others** | - | ConnectWise PSA, IBM Cloud Pak for AIOps (closer to DevOps/AIOps) |

---

## Summary

DeepWiki is a highly useful tool for **"developers who want to quickly understand complex open-source code."** However, don't blindly trust AI-generated information — always verify alongside actual code.

- For quick public repo browsing → **Official DeepWiki (SaaS)**
- For private code, local LLM, and customization → **`deepwiki-open` (self-hosted)**
- For Google ecosystem integration → **Google CodeWiki**

## Reference Links
- Official service: https://deepwiki.com
- Self-hosted (OSS): https://github.com/AsyncFuncAI/deepwiki-open
- Developer: Cognition Labs (https://cognition.ai)
