---
title: "Quivr: Open Source Second Brain Powered by Generative AI"
description: "A complete guide to Quivr, the open-source RAG platform with 38,000+ GitHub stars — features, tech stack, installation, custom RAG workflows, and the 'Brain' concept."
abstract: |
  Quivr is an open-source RAG (Retrieval-Augmented Generation) platform, a "second brain" that turns personal or
  enterprise data into an intelligent AI assistant. Users can simply upload documents and ask questions in natural
  language to easily search and use vast amounts of information. This guide covers why Quivr exists, its core
  features (opinionated RAG workflows, support for all file formats, multi-LLM support, customizable RAG via YAML,
  tool integration and web search, Megaparse integration, privacy/self-hosting, tech stack), developer benefits,
  installation and usage (Python package, Docker self-hosted deployment, custom RAG configuration, Chainlit chat UI,
  API key usage), the "Brain" concept, and reference links.
summary_for_ai: |
  Complete guide to Quivr, an open-source RAG platform with 38,000+ GitHub stars, 50,000+ users, and 6,000+ companies
  using it, backed by Y Combinator and founded by three lifelong French friends.
  Problem it solves: roughly 20% of work time in enterprises is spent simply searching for information (asking
  colleagues who are on vacation, repeatedly answering the same questions, not knowing where or whether information
  exists). Quivr connects all of a company's tools, documents, APIs, and databases into a conversational AI platform,
  automating document summarization, extracting actionable info from databases, and context-aware email drafting.
  Core features: opinionated (pre-optimized) RAG workflows requiring no pipeline built from scratch; support for
  all file formats (txt, PDF, markdown, PPT, CSV/XLSX, Word, audio/video) with custom parser support; multi-LLM
  support (OpenAI, Anthropic Claude, Mistral, Google Gemma, Groq, local models via Ollama for full data privacy);
  YAML-configurable RAG tuning (reranker model/settings, conversation history depth, LLM temperature, max input
  tokens, chunk size/count); tool integration and web search beyond static documents; Megaparse integration for
  efficient large-scale document parsing; privacy/self-hosting support for full on-premises operation without
  external API calls.
  Tech stack: Next.js + Vercel frontend, FastAPI backend, Celery + queue for async embedding/indexing, PGVector/FAISS
  vector store, Supabase for auth/DB.
  Developer benefits: quick start (`pip install quivr-core`, a full RAG system in 5 lines of code), rich RESTful API
  with Swagger docs and API-key auth, extensible architecture (custom parsers, RAG workflow nodes, swappable vector
  stores, LangChain-integrated embedding models), an active open-source community, and productivity gains from
  abstracting RAG complexity while allowing YAML-based experimentation without code changes.
  Installation/usage covers: Python quick start via pip, a full basic usage code example (Brain.from_files, brain.ask,
  an interactive loop), Docker-based self-hosted deployment (clone, .env setup, docker compose up, web UI at
  localhost:3000, API docs at localhost:5050/docs), custom RAG workflow configuration via YAML (reranker, history
  depth, temperature, max tokens) loaded via RetrievalConfig.from_yaml, building a chat UI with Chainlit, and API key
  issuance/usage with a curl example.
  The "Brain" concept: Quivr's core abstraction for storing and processing a user's knowledge — one Brain can link
  multiple documents, each Brain can have its own RAG config and LLM, supports public/private settings, and can be
  shared via a Brain Marketplace.
  Conclusion: Quivr is designed as a developer-friendly AI framework prioritizing simplicity and extensibility, with
  full transparency as open source, a 30-second install, data privacy via on-premises deployment, no vendor lock-in
  across major LLMs, and an active community — described as "the idea of Obsidian, supercharged with AI."
date: 2026-04-10
author: "Dennis Kim"
lang: en
tags:
  - Quivr
  - RAG
  - Open Source
  - AI Assistant
  - LLM
keywords:
  - Quivr open source RAG
  - second brain AI
  - Quivr installation guide
  - quivr-core Python
  - self-hosted RAG platform
  - Brain concept Quivr
featured: false
schema_type: TechArticle
draft: false
---

# Quivr: Open Source Second Brain Powered by Generative AI

## 1. Overview

Quivr is an open-source RAG (Retrieval-Augmented Generation) platform — a "Second Brain" that turns personal or enterprise data into an intelligent AI assistant. Users can simply upload documents and ask questions in natural language to easily search and put vast amounts of information to use.

Quivr has drawn attention from developers worldwide with 38,000+ GitHub stars, and is used by 50,000+ users and 6,000+ companies. Backed by Y Combinator, the project was founded by three lifelong French friends.

---

## 2. Why Quivr? (Pain Point & Solution)

In enterprise environments, roughly 20% of work time is spent simply searching for information. Employees repeatedly run into difficulties like these:

- Having to ask a colleague who's on vacation for urgent information
- The inefficiency of asking and answering the same question over and over
- Not knowing where the information they need is located, or even whether it exists

Quivr solves this by providing an open-source AI platform that connects all of a company's tools, documents, APIs, and databases so you can converse with them. Quivr automates tasks such as:

- Summarizing lengthy documents down to their essentials
- Extracting actionable information from databases
- Drafting context-aware emails automatically

---

## 3. Core Features

### 3.1 Opinionated RAG (Optimized RAG Workflow)

Quivr provides a pre-designed, optimized RAG workflow, so developers don't need to build a RAG pipeline from scratch. Designed with speed and efficiency at its core, it's ready for immediate use in production.

### 3.2 Support for All File Formats

Quivr supports a wide range of file formats, with the option to add custom parsers as needed:

- Text files (.txt)
- PDF documents
- Markdown (.md)
- Presentations (.ppt, .pptx)
- Spreadsheets (.csv, .xlsx)
- Word documents
- Audio and video files

### 3.3 Multi-LLM Support

Quivr supports a wide range of LLMs (Large Language Models) to avoid vendor lock-in:

- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Mistral
- Google (Gemma)
- Groq
- Local models (Ollama) — guarantees full data privacy

### 3.4 Customizable RAG Workflow

You can fine-tune the following elements through YAML configuration files:

- Reranker model and settings
- History depth (how much conversation context is factored in)
- LLM temperature and max input tokens
- Retrieval chunk size and count

### 3.5 Tool Integration and Web Search

Beyond static document knowledge, Quivr can connect to web search and external tools/APIs to enable dynamic information gathering and real-time intelligence.

### 3.6 Megaparse Integration

Megaparse, developed by the same team at QuivrHQ, is a tool for efficiently parsing large-scale documents, preprocessing thousands of files and connecting them directly to a Quivr "Brain."

### 3.7 Privacy and Self-Hosting

For companies and developers where data privacy matters, Quivr supports local deployment and self-hosting. Data stays under the user's control and can run entirely on-premises without any external API calls.

### 3.8 Tech Stack

| Layer | Technology | Characteristics |
|------|------|------|
| Frontend | Next.js + Vercel | SSR-based, automatic deployment |
| Backend API | FastAPI | Python-based high-performance API framework |
| Async jobs | Celery + Queue | Handles large-file embedding and indexing |
| Vector store | PGVector / FAISS | High-performance semantic search |
| Auth/DB | Supabase | Open-source Firebase alternative |

---

## 4. Benefits for Developers

### 4.1 Quick Start (Under 30 Seconds)

```bash
pip install quivr-core
# A full RAG system built in just 5 lines of code
```

### 4.2 Rich API Support

Quivr provides a RESTful API that's easy to explore and test via Swagger docs. It supports API-key-based authentication, making it easy to integrate into applications.

### 4.3 Extensible Architecture

- Custom file parsers can be added
- RAG workflow nodes can be extended
- Vector stores can be swapped out
- Supports a variety of embedding models (via LangChain integration)

### 4.4 An Active Open-Source Community

- 38k+ GitHub stars, active contributions
- Regular updates and feature improvements
- Active issue triage and PR review

### 4.5 Improved Development Productivity

- Abstracts RAG's complex internals so you can focus on business logic
- YAML-based configuration lets you experiment with RAG strategies without code changes
- A variety of example code provided (Chainlit, Streamlit integrations)

---

## 5. Installation and Usage

### 5.1 Installing the Python Package (Quick Start)

For the fastest way to get started, install the quivr-core package.

```bash
# Step 1: Install the package
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

If data privacy matters, or you want to use the full feature set:

```bash
# Step 1: Clone the repository
git clone https://github.com/quivrhq/quivr.git && cd quivr

# Step 2: Set up the environment
cp .env.example .env
# Enter your OPENAI_API_KEY in the .env file

# Step 3: Run with Docker
docker compose pull
docker compose up

# Step 4: Access it
# Web UI: http://localhost:3000
# API docs: http://localhost:5050/docs
```

### 5.4 Setting Up a Custom RAG Workflow

You can customize your RAG strategy with a YAML file:

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
answer = brain.ask("question", retrieval_config=config)
```

### 5.5 Building a Chat UI With Chainlit

```bash
cd examples/chatbot
rye sync
rye run chainlit run chainlit.py
```

### 5.6 Issuing and Using an API Key

```bash
# 1. Log in to the Quivr web app
# 2. Generate an API key on the /user page
# 3. Use the Bearer token when calling the API

curl -X GET https://api.quivr.app/brains/ \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 6. Understanding the "Brain" Concept

Quivr's core concept is the "Brain." A Brain is the fundamental component that stores and processes a user's knowledge.

- A single Brain can have multiple documents linked to it
- Each Brain can have its own unique RAG configuration and LLM
- Can be set to public or private (shared or not)
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
- Brain API guide: Create a Brain via the POST /brains/ endpoint
- Chat API: Look up conversation history via GET /chat/{chat_id}/history

### Community

- Product Hunt: https://www.producthunt.com/products/quivr
- Y Combinator Launch: https://www.ycombinator.com/launches/KPF-quivr

---

## 8. Conclusion

Quivr is designed to be more than just a RAG tool — it's a developer-friendly AI framework. Prioritizing simplicity and extensibility above all, it's helping boost productivity for everyone from individual developers to large AI teams.

Reasons to choose Quivr:

- Fully transparent and freely customizable as open source
- 30-second install, ready to use with 5 lines of code
- Data privacy — supports on-premises deployment
- No vendor lock-in — compatible with all major LLMs
- An active community with continuous updates

As one description puts it, "the idea of Obsidian, but supercharged with AI capabilities" — Quivr offers a new paradigm for knowledge management. Go build your own "second brain" with Quivr today.
