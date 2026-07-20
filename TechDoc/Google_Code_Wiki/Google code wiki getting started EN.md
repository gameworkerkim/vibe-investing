# Google Code Wiki Getting Started Guide (English)

Document version: 2026-07-11 | Verification: Web cross-verified (official announcements, tech media, GitHub sources)

---

## 1. What Is Google Code Wiki?

Google Code Wiki is an AI-based code documentation platform launched as a Public Preview on November 13, 2025 via the Google Developers Blog. It starts from the premise that "reading code is the biggest bottleneck in software development" — input a public GitHub repository and Gemini analyzes the entire codebase to auto-generate structured wiki documentation.

The key differentiator: documentation is not static. When code changes, documents and diagrams are automatically regenerated, always staying up to date, with every description hyperlinked to actual source files.

- Official site: https://codewiki.google
- Official announcement: Google Developers Blog, "Introducing Code Wiki: Accelerating your code understanding" (2025-11-13)
- Lineage: Auto Wiki by Mutable.ai (launched Jan 2024) was the precursor; that team joined Google and rebuilt the same concept (confirmed by Auto Wiki developers on Hacker News)

---

## 2. Key Features

| Feature | Description |
|---------|-------------|
| Auto-generated structured wiki | Scans the entire repo, generates docs including module/class/function purpose, parameters, and usage examples |
| Gemini-powered chat agent | AI chat using the repo's latest wiki as a knowledge base. Unlike generic chatbots, answers come with actual code links |
| Hyperlinked code references | Every description links directly to actual code files, classes, and functions |
| Auto-generated diagrams | Automatically generates architecture, class, and sequence diagrams. Regenerates on code changes to solve stale diagram problems |
| Continuous updates | Full documentation regeneration on code changes (commits/PR merges) |
| Knowledge graph-based analysis | Parses code as structures (classes, functions, call relationships) rather than plain text, building relationship graphs (likely using Tree-sitter parsers) |

---

## 3. Getting Started

### 3.1 Prerequisites

- Only GitHub **public** repositories supported (preview stage)
- No install, setup, or login required. Just a web browser
- Cost: Currently free

### 3.2 Step 1: Access the site

Open https://codewiki.google in your browser.

### 3.3 Step 2: Search for a repository

Enter the full GitHub repository URL or `owner/repo` format in the search field.

```
Examples:
- facebook/react
- vercel/next.js
- tensorflow/tensorflow
- https://github.com/facebook/react
```

Popular projects like React, Next.js, LangChain, and Gemini CLI have pre-generated wikis available instantly. Direct URL access is also supported (e.g., `codewiki.google/github.com/google-gemini/gemini-cli`).

### 3.4 Step 3: Explore the wiki

Typical wiki structure:

- Overview: Project summary and description
- Architecture: System design and component relationships
- Modules: Detailed docs per code module
- APIs: Function and class references
- Diagrams: Architecture/class/sequence diagrams

### 3.5 Step 4: Use the chat agent

Ask questions in natural language via the chat interface. Answers include source file links for direct verification.

```
Example questions:
- "How does the authentication flow work?"
- "What are the main entry points?"
- "Show me how to implement a custom middleware"
```

### 3.6 (Optional) Unofficial CLI — codewiki-cli

Code Wiki provides no official API. The unofficial CLI `codewiki-cli` (by aeroxy, MIT license, Rust) uses the same Google batchexecute RPC protocol as the web frontend to query wikis from the terminal. Designed for LLM coding agent pipeline integration, output is Markdown.

```bash
# Install
brew install aeroxy/tap/codewiki-cli   # macOS (Homebrew)
cargo install codewiki-cli             # Rust cargo

# Usage
codewiki structure facebook/react                       # Check wiki section structure
codewiki read facebook/react                            # Output entire wiki as Markdown
codewiki ask facebook/react "How does useEffect work?"  # Natural language query

# AI agent pipeline integration
codewiki read ast-grep/ast-grep | claude -p "Summarise the rule engine"
```

---

## 4. Comparison: Code Wiki vs DeepWiki vs OpenWiki

### 4.1 Three-Way Overview

| Item | Google Code Wiki | DeepWiki (Cognition) | OpenWiki (LangChain) |
|------|-------------------|----------------------|----------------------|
| Provider | Google | Cognition Labs (Devin) | LangChain (OSS) |
| Launch | Nov 2025 (Public Preview) | Apr 2025 | Early Jul 2026 |
| Type | Hosted web service | Hosted web service + MCP server | Local CLI OSS agent |
| Access | Search on codewiki.google | Replace github.com with deepwiki.com in URL | `openwiki --init` creates wiki inside repo |
| Base model | Gemini | Devin stack (in-house models/pipelines) | User-specified LLM (BYO API Key) |
| Public repos | Free | Free (top 50k+ repos pre-indexed) | Unlimited (local execution) |
| Private repos | Not supported (Gemini CLI extension waitlist) | Supported with Devin paid account | Supported (code stays local; LLM API calls occur) |
| Update method | Auto-regenerate on code change | Schedule-based regeneration (hours to days delay for active repos) | GitHub Action scheduled, git diff incremental updates |
| Generation control | None | `.devin/wiki.json` for page composition/notes | Full code-level customization (OSS) |
| AI agent integration | No official API (unofficial CLI/MCP only) | Official MCP server (mcp.deepwiki.com, 3 tools incl. ask_question) | Auto-inserts wiki references into AGENTS.md / CLAUDE.md |
| Chat Q&A | Built-in Gemini chat | Built-in Ask Devin chat (line-level citations) | No separate chat (agents consume wiki as context) |

### 4.2 Positioning

- **Code Wiki**: Aims for "living documentation for humans." Strengths: web UI polish and auto-regeneration cadence. Large repo processing on Google infrastructure.
- **DeepWiki**: "Humans + AI agents." Strengths: zero-barrier UX (URL replacement) and official MCP server. Functions as a free tier within the Devin ecosystem.
- **OpenWiki**: "Context infrastructure for AI coding agents." Documents live inside the repo, not in an external service. AGENTS.md/CLAUDE.md point to the wiki instead of embedding instructions, saving context. DeepAgents-based, supports LangSmith tracing.

---

## 5. Pros

| Pro | Description |
|-----|-------------|
| Documentation automation | Eliminates manual documentation writing and maintenance costs |
| Always up to date | Regenerates on every code change, solving stale documentation |
| Reduced onboarding time | Google claims new contributors can make their first commit on Day 1 |
| Legacy code understanding | Explains code even when original authors are absent, including commit history analysis |
| Free + no install | Public repos free during Public Preview; browser-only access |
| Verifiable answers | Chat answers include source code links for hallucination cross-checking |
| Visualizations | Architecture/class/sequence diagrams reflect current code state |

---

## 6. Cons

| Con | Description |
|-----|-------------|
| Public repos only | Preview stage: GitHub public only. Private requires Gemini CLI extension waitlist |
| No official API | Automation/pipeline integration depends on unofficial tools (codewiki-cli, codewiki-mcp) |
| Pricing unknown | May become paid after official launch. Enterprise paid plans mentioned |
| Preview instability | Features/policies may change; unexpected limitations exist |
| No generation steering | No equivalent of DeepWiki's `.devin/wiki.json` |
| GitHub-dependent | Only GitHub repos supported (no GitLab/Bitbucket) |
| Code quality dependency | Codebases heavy on metaprogramming or dynamic languages may produce lower-accuracy docs |

---

## 7. Cautions

### 7.1 Security & Privacy
- For public repos only — don't accidentally document sensitive code in public repos
- Gemini CLI extension for private repos is on waitlist, developing local wiki generation without sending code externally
- For immediate private repo documentation in no-leak environments: OpenWiki + local/on-prem LLM, or self-hosted alternatives

### 7.2 AI-Generated Doc Limitations
- AI docs may hallucinate — verify load-bearing claims by clicking source links to actual code
- Large monorepos may take longer or hit generation scope limits
- Complex dependencies, code generation, and non-standard architectures are common misinterpretation cases

### 7.3 License & Legal
- Assume generated docs follow the original code's license
- Currently unusable for internal corporate code or NDA-covered code

### 7.4 Future Roadmap
- Gemini CLI extension for local/private repos planned (waitlist open)
- Pricing policy unreleased; enterprise paid plans mentioned
- Features and policies may change during Public Preview

---

## 8. Summary & Selection Guide

| Situation | Recommended Tool | Reason |
|-----------|-----------------|--------|
| Quickly understand OSS project | Code Wiki or DeepWiki | No install, free, pre-indexed |
| Supply repo context to AI agents (Claude Code, Cursor) | DeepWiki (official MCP) or codewiki-cli | DeepWiki has official support |
| Private/internal repo docs (right now) | OpenWiki or DeepWiki (Devin paid) | Code Wiki not yet supported |
| Code must never leave infrastructure | OpenWiki + local LLM, or self-hosted alternatives | Only option for fully air-gapped setup |
| Integrate auto doc updates into CI | OpenWiki | GitHub Action + git diff incremental update design |

---

### References

- Google Developers Blog: Introducing Code Wiki (2025-11-13)
- codewiki.google official site
- InfoQ: Google Launches Code Wiki (2025-11)
- Cognition Blog: DeepWiki announcement / docs.devin.ai
- LangChain Blog: Introducing OpenWiki (2026-07) / github.com/langchain-ai/openwiki
- github.com/aeroxy/codewiki-cli (unofficial CLI)
