---
title: "Quivr: Open Source Second Brain Powered by Generative AI"
description: "An overview of Quivr, an open-source RAG platform that turns personal and enterprise data into an intelligent AI assistant."
lang: en
featured: false
schema_type: TechArticle
keywords:
  - Quivr
  - RAG
  - second brain
  - open source AI
  - retrieval augmented generation
tags:
  - RAG
  - Open Source
  - AI Assistant
  - LLM
---

# Quivr: Open Source Second Brain Powered by Generative AI

## 1. Overview

Quivr is an open-source RAG (Retrieval-Augmented Generation) platform — a "Second Brain" that turns personal or enterprise data into an intelligent AI assistant. Users simply upload documents and ask questions in natural language to easily search and leverage vast amounts of information.

Quivr has attracted attention from developers worldwide with over 38,000 GitHub stars, and is used by more than 50,000 users and 6,000+ companies. Backed by Y Combinator, the project was founded by three French friends who had known each other for 20 years.

---

## 2. Why Quivr? (Pain Point & Solution)

In a corporate setting, employees spend roughly 20% of their working hours simply searching for information. Employees repeatedly face difficulties such as:

- Having to ask an urgent question to a colleague who's on vacation
- The inefficiency of asking and answering the same question repeatedly
- Not knowing where the information they need is — or even whether it exists

Quivr solves these problems by providing an open-source AI platform that connects all of a company's tools, documents, APIs, and databases, letting you converse with them. Quivr automates tasks such as:

- Summarizing lengthy documents to extract the essentials
- Extracting actionable information from databases
- Auto-drafting context-aware emails

---

## 3. Key Features

### 3.1 Opinionated RAG (Optimized RAG Workflow)

Quivr provides a pre-designed, optimized RAG workflow so developers don't need to build a RAG pipeline from scratch. Designed around speed and efficiency, it's ready for immediate production use.

### 3.2 Support for All File Formats

Supports a wide range of file formats, and custom parsers can be added as needed:

- Text files (.txt)
- PDF documents
- Markdown (.md)
- Presentations (.ppt, .pptx)
- Spreadsheets (.csv, .xlsx)
- Word documents
- Audio and video files

### 3.3 Multi-LLM Support

Quivr supports a variety of LLMs (Large Language Models) to avoid vendor lock-in:

- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Mistral
- Google (Gemma)
- Groq
- Local models (Ollama) — complete data privacy guaranteed

### 3.4 Customizable RAG Workflow

A YAML config file lets you fine-tune elements such as:

- Reranker model and settings
- History depth (how much conversational context is retained)
- LLM temperature and max input tokens
- Retrieval chunk size and count

### 3.5 Tool Integration and Internet Search

Beyond static document knowledge, Quivr can connect to internet search and external tools/APIs to enable dynamic information gathering and real-time intelligence.

### 3.6 Megaparse Integration

Megaparse, developed by the same team (QuivrHQ), is a tool for efficiently parsing large-scale documents, letting you preprocess thousands of files and connect them directly to a Quivr "Brain."

### 3.7 Privacy and Self-Hosting

For companies and developers where data privacy matters, Quivr supports local deployment and self-hosting. Data stays under the user's control and can operate in a fully on-premises environment with no external API calls.

### 3.8 Tech Stack

| Layer | Technology | Characteristics |
|------|------|------|
| Frontend | Next.js + Vercel | SSR-based, automated deployment |
| Backend API | FastAPI | High-performance Python-based API framework |
| Async tasks | Celery + Queue | Handles large-file embedding and indexing |
| Vector store | PGVector / FAISS | High-performance semantic search |
| Auth/DB | Supabase | Open-source Firebase alternative |

---

## 4. Advantages for Developers

### 4.1 Fast Start (Ready in 30 Seconds)

```bash
pip install quivr-core
# A complete RAG system built with just 5 lines of code
```

### 4.2 Rich API Support

Quivr provides a RESTful API, easily explorable and testable via Swagger docs. API-key-based authentication makes it easy to integrate into applications.

### 4.3 Extensible Architecture

- Add custom file parsers
- Extend RAG workflow nodes
- Swap out vector stores
- Support for various embedding models (LangChain integration)

### 4.4 Active Open-Source Community

- 38k+ stars on GitHub, active contributions
- Regular updates and feature improvements
- Active issue response and PR review

### 4.5 Improved Development Productivity

- Abstracts RAG's complex internals so you can focus on business logic
- YAML-based config lets you experiment with RAG strategies without code changes
- Various example code provided (Chainlit, Streamlit integration)

---

## 5. Installation and Usage

### 5.1 Python Package Installation (Quick Start)

For the fastest start, install the quivr-core package.

```bash
# Step 1: install the package
pip install quivr-core

# Verify installation
python -c "import quivr_core; print('Quivr installed!')"
```

### 5.2 Basic Usage Example

```python
from quivr_core import Brain

# 1. Create a Brain from documents
brain = Brain.from_files(
    name="my_smart_brain",
    file_paths=["./my_document.pdf", "./my_notes.txt"]
)

# 2. Ask the Brain a question
answer = brain.ask("Summarize the key points of this document")
print(answer.answer)

# 3. Run an interactive interface
while True:
    question = input("Question: ")
    if question.lower() == "exit":
        break
    response = brain.ask(question)
    print(f"Answer: {response.answer}")
```

### 5.3 Docker-Based Local Deployment (Self-Hosted)

If data privacy matters or you want full functionality:

```bash
# Step 1: clone the repository
git clone https://github.com/quivrhq/quivr.git && cd quivr

# Step 2: configure the environment
cp .env.example .env
# enter OPENAI_API_KEY in the .env file

# Step 3: run with Docker
docker compose pull
docker compose up

# Step 4: access
# Web UI: http://localhost:3000
# API docs: http://localhost:5050/docs
```

### 5.4 Setting Up a Custom RAG Workflow

You can customize your RAG strategy via a YAML file:

```yaml
# custom_rag.yaml
workflow_config:
  name: "advanced_rag"
  max_history: 10
  reranker_config:
    supplier: "cohere"
    model: "rerank-multilingual-v3.0"
    top_n: 5
  llm_config:
    max_input_tokens: 4000
    temperature: 0.3
```

```python
from quivr_core import Brain
from quivr_core.config import RetrievalConfig

brain = Brain.from_files(
    name="custom_brain",
    file_paths=["./data/*.pdf"]
)

config = RetrievalConfig.from_yaml("./custom_rag.yaml")
answer = brain.ask("your question", retrieval_config=config)
```

### 5.5 Building a Chat UI with Chainlit

```bash
cd examples/chatbot
rye sync
rye run chainlit run chainlit.py
```

### 5.6 Issuing and Using an API Key

```bash
# 1. Log into the Quivr web app
# 2. Generate an API key on the /user page
# 3. Use the Bearer token when calling the API

curl -X GET https://api.quivr.app/brains/ \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 6. Understanding the 'Brain' Concept

Quivr's core concept is the "Brain." A Brain is the fundamental component that stores and processes a user's knowledge.

- A single Brain can have multiple documents attached
- Each Brain can have its own RAG configuration and LLM
- Can be set to Public/Private (shared or private)
- Other users' Brains can also be used via the Brain Marketplace

---

## 7. References

### Official Documentation

- Official homepage: https://quivr.app
- Core docs: https://core.quivr.com
- API Swagger docs: https://api.quivr.app/docs

### GitHub Repositories

- QuivrHQ/quivr: https://github.com/quivrhq/quivr (38k+ stars)
- Megaparse (document parsing tool): https://github.com/quivrhq/megaparse

### Quick Links

- Quick Start: https://core.quivr.com/en/stable/
- Brain API guide: create a Brain via the POST /brains/ endpoint
- Chat API: retrieve conversation history via GET /chat/{chat_id}/history

### Community

- Product Hunt: https://www.producthunt.com/products/quivr
- Y Combinator Launch: https://www.ycombinator.com/launches/KPF-quivr

---

## 8. Conclusion

Quivr is designed to be more than a simple RAG tool — it's a developer-friendly AI framework. Prioritizing simplicity and extensibility above all, it contributes to productivity gains for everyone from individual developers to large AI teams.

Reasons to choose Quivr:

- Open source for complete transparency and free customization
- Up and running in 30 seconds, usable in just 5 lines of code
- Data privacy — supports on-premises deployment
- No vendor lock-in — compatible with all major LLMs
- Active community and continuous updates

As one description puts it, "the idea is like Obsidian, but supercharged with AI features" — Quivr presents a new paradigm for knowledge management. Build your own "second brain" with Quivr today.
