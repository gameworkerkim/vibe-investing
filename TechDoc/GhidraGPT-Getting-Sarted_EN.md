---
title: "GhidraGPT Getting Started"
description: "GhidraGPT plugs LLMs (OpenAI, Anthropic, Ollama, Qwen, and more) into Ghidra to speed up decompilation, renaming, and vulnerability analysis."
abstract: |
  GhidraGPT is a plugin that integrates LLMs into Ghidra, NSA's open-source reverse engineering framework, to assist with disassembly and decompilation. It supports a wide range of providers - OpenAI, Anthropic, Google Gemini, Cohere, Mistral, DeepSeek, Grok, and local Ollama models - and offers function rewriting, code explanation, and security analysis with encrypted API key storage. Its main risks are hallucinated analysis results and sending binary code to external APIs, so local models are recommended for sensitive material.
summary_for_ai: |
  Reference note for AI agents: this guide requires Ghidra 10.0+, Java 11+, and Maven, plus GHIDRA_INSTALL_DIR set for the Maven build. Cloud LLM providers require an internet connection and incur API costs; only Ollama is fully offline. LLM-generated code, types, and vulnerability findings must always be manually verified before being trusted.
lang: en
featured: false
author: Dennis Kim
date: 2026-07-21
schema_type: TechArticle
---

# GhidraGPT Getting Started

**GhidraGPT** is a plugin that integrates LLMs into Ghidra, NSA's open-source reversing framework.
Ghidra is a powerful software reverse engineering tool developed by the U.S. National Security Agency (NSA) and released as open source.
Ghidra was developed by the NSA and used by several U.S. intelligence agencies as a reverse engineering tool; the world first learned of its existence around March 7, 2017, through WikiLeaks' CIA Vault 7 leak.
Later, on March 5, 2019, the NSA publicly released the executable for the first time at the RSA Conference, and a month later, in April 2019, published the source code on GitHub.

As LLMs have advanced, GhidraGPT lets an LLM assist with the core function that would otherwise require tedious manual labor from humans: analyzing compiled machine code, converting it into human-readable assembly (disassembling), and reconstructing it into C-level code (decompiling).
In short, it's an extension that bolts an LLM onto Ghidra, with the concept being to offload time-consuming work like disassembly to the LLM.

Its key features and capabilities are as follows.

* Powerful decompiler: converts machine code into C-like form, making code flow and logic far easier to understand.
* Broad platform support: runs on Windows, macOS, and Linux, and supports architectures like x86, ARM, and MIPS.
* Collaboration features: server functionality for sharing and analyzing projects as a team.
* Extensibility: supports Python and Java scripting, letting users implement their own analysis automation.
* Free and open source: a strong alternative to expensive commercial reversing tools (e.g., IDA Pro), widely used by security researchers, malware analysts, and developers.

---

## Core Advantages

1. **Productivity boost**
   * Automatic function/variable renaming, type inference, and comment insertion improve human readability of decompiled output
   * One right-click in the context menu triggers AI analysis (extremely convenient)
2. **Broad LLM support**
   * Supports a wide range of models: OpenAI, Anthropic, Google Gemini, Cohere, Mistral, DeepSeek, Grok, Ollama, and more
   * OpenAI-compatible APIs are also supported
3. **Security and usability**
   * API keys are automatically encrypted and stored safely
   * Real-time streaming responses minimize wait time
   * Results can be viewed in a dedicated console

---

## Drawbacks and Cautions

**Drawbacks:**

* LLM responses aren't always accurate and can lead to incorrect analysis results (LLM hallucinations and errors occur)
* Internet connectivity and API costs are essentially required (except for local Ollama; DeepSeek v4 pro or Qwen are usually sufficient)
* Combining with Ghidra's complex internals can cause unexpected conflicts

**Cautions:**

* If the binary being analyzed contains sensitive code, you must check what data gets sent to external APIs
* Never blindly trust LLM-generated code or type information — always verify
* Requires Ghidra 10.0+, Java 11+, and a Maven environment, and the `File → Install Extensions` path must be followed exactly during installation

---

## Competing Projects

| Project | Differentiator |
|---------|--------|
| **Ghidra Assist** | More optimized for local models, with active open-source community support |
| **BinAI** | A commercial product offering its own model specialized for binary analysis, with an accuracy advantage |
| **IAIK's Ghidra Plugin** | Built on academic research, strong at specific analysis algorithms |
| **IDA Pro + ChatGPT** | A script for IDA users; larger ecosystem but not Ghidra-specific |

> **Summary**: GhidraGPT is a powerful plugin supporting a wide range of LLMs, but API dependency and verifying the reliability of analysis results are essential. For sensitive code analysis, using a local model (Ollama) is recommended.

---

# Getting Started with GhidraGPT: Ollama, ChatGPT, Claude, and Qwen Setup Guide

This guide walks through installing the GhidraGPT plugin and connecting various LLMs — Ollama (local), ChatGPT, Claude, and Qwen — step by step.

---

## Prerequisites

Before using GhidraGPT, make sure the following environment is in place:

| Item | Requirement |
|------|----------|
| **Ghidra** | 10.0 or later |
| **Java** | Java 11+ |
| **Maven** | Build system |
| **Internet** | Required for API-based models (not for Ollama) |

---

## 1. Installing the GhidraGPT Plugin

### 1.1 Clone the Repository and Build

```bash
git clone https://github.com/ZeroDaysBroker/GhidraGPT.git
cd GhidraGPT
GHIDRA_INSTALL_DIR=/path/to/ghidra mvn clean package
```

Once the build finishes, a `target/GhidraGPT-x.y.z.zip` file is generated.

### 1.2 Installing the Plugin in Ghidra

1. Launch Ghidra
2. Go to `File → Install Extensions`
3. Click the `+` button and select `target/GhidraGPT-x.y.z.zip`
4. Restart Ghidra
5. Enable the plugin under `File → Configure → Analysis → GhidraGPTPlugin`

---

## 2. Setting Up API Keys for Each LLM Service

After installing the plugin, go to the `GhidraGPT configuration panel` inside Ghidra to enter your API keys. All API keys are automatically encrypted and stored safely.

### OpenAI (ChatGPT)

1. Get an API key from the [OpenAI Platform](https://platform.openai.com/api-keys)
2. Select **OpenAI** in the GhidraGPT settings panel
3. Enter the API key you received
4. Select the model to use (e.g., `gpt-4`, `gpt-3.5-turbo`)

> **Note**: GhidraGPT supports OpenAI's GPT models by default.

---

### Anthropic (Claude)

1. Get an API key from the [Anthropic Console](https://console.anthropic.com/)
2. Select **Anthropic** in the GhidraGPT settings panel
3. Enter the API key
4. Select the Claude model to use (e.g., `claude-3-opus`, `claude-3-sonnet`)

GhidraGPT officially supports Anthropic's Claude models.

---

### Ollama (Free Local Model)

Ollama is a tool for running LLMs locally, letting you use GhidraGPT **without an internet connection**.

#### 2.1 Installing Ollama

**macOS / Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:** Download the installer from the [official Ollama site](https://ollama.com/)

#### 2.2 Downloading an LLM Model

Download whichever model you want. Examples:

```bash
# Meta's Llama 3.1 (8B lightweight model)
ollama run llama3.1:8b

# Qwen (strong at code analysis)
ollama run qwen2.5-coder:7b

# Mistral
ollama run mistral
```

> **Tip**: Choose a model that matches your hardware specs. `llama3.1:8b` runs smoothly with 8GB of VRAM.

#### 2.3 Verifying the Ollama Server

Ollama runs an API server on `localhost:11434` by default.

```bash
# Check running models
ollama list
```

#### 2.4 Connecting Ollama to GhidraGPT

1. Select **Ollama** in the GhidraGPT settings panel
2. **Server URL**: enter `http://localhost:11434`
3. **Model**: enter the name of the model you downloaded (e.g., `llama3.1:8b`, `qwen2.5-coder:7b`)

> **Note**: Ollama works through GhidraGPT's "bring your own model" mechanism.

---

### Qwen (OpenAI-Compatible API or Ollama)

Qwen can be used in two ways:

#### Method A: Local Execution via Ollama (Free)

```bash
ollama run qwen2.5-coder:7b
```

Then connect it in GhidraGPT the same way as the Ollama setup above.

#### Method B: DashScope API (Cloud)

1. Get an API key from [Alibaba Cloud DashScope](https://dashscope.aliyun.com/)
2. Select **OpenAI Compatible** in the GhidraGPT settings panel
3. **Base URL**: enter `https://dashscope.aliyuncs.com/compatible-mode/v1`
4. **API Key**: enter your DashScope API key
5. **Model**: enter `qwen-max`, `qwen-plus`, etc.

> Because GhidraGPT supports OpenAI-compatible APIs, you can connect to Qwen through its OpenAI-compatible endpoint.

---

## 3. Using the Main Features

Once installation and setup are complete, the following features become available:

| Feature | Description | How to Use |
|------|------|-----------|
| **Function Rewrite** | Renames functions/variables, infers types, adds comments | Right-click a function in the decompile window → Rewrite |
| **Code Explanation** | Detailed explanation of function logic | Right-click → Explain |
| **Code Analysis** | Vulnerability detection and security analysis | Right-click → Analyze |
| **Console** | View model responses and results | Check the GhidraGPT console window |

---

## 4. Comparison and Recommendations by Service

| Service | Pros | Cons | Recommended For |
|--------|------|------|-----------|
| **Ollama** | Free, offline, guarantees privacy | Needs local hardware performance, slower response | Security-sensitive analysis, no internet access |
| **ChatGPT (OpenAI)** | Excellent performance, fast responses | Paid, requires internet | General reversing work |
| **Claude** | Long context, strong code comprehension | Paid, requires internet | Analyzing complex, large-scale functions |
| **Qwen (Ollama)** | Free, code-specialized, Korean language support | Needs local hardware performance | When Korean comments/explanations are needed |
| **Qwen (API)** | Cloud-level performance, Korean language support | Paid, requires internet | When you need Korean + cloud-level performance |

---

## Cautions

1. **Data privacy**: When analyzing sensitive binaries, always use a local model like **Ollama**. Cloud APIs send the code being analyzed off-device.
2. **Verify results**: LLM-generated code or type information **must always be manually verified**. AI can sometimes produce incorrect analysis results.
3. **API costs**: OpenAI, Anthropic, and DashScope (Qwen) charge based on usage.

---

## References

- [GhidraGPT GitHub Repository](https://github.com/ZeroDaysBroker/GhidraGPT)
- [Ollama Official Site](https://ollama.com/)
- [List of Ollama-Supported Models](https://ollama.ai/library)
- [Hugging Face GGUF Models](https://huggingface.co/docs/hub/en/ollama) - runnable via Ollama

---

Now go ahead and start AI-powered reverse engineering with GhidraGPT.
