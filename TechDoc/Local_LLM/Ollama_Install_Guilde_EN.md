---
title: "Ollama Installation and Basic Usage — Building a Local LLM Environment for the Token-Poor"
description: "A step-by-step guide to building a cost-free local LLM environment with Ollama, plus a comparison of major open-source LLMs."
lang: en
featured: false
schema_type: TechArticle
keywords:
  - Ollama
  - local LLM
  - open source LLM
  - Llama
  - Qwen
tags:
  - LLM
  - Ollama
  - Local AI
  - Open Source
---

# Ollama Installation and Basic Usage — Building a Local LLM Environment for the Token-Poor

Tired of worrying about API costs every time you use a high-performance AI model like ChatGPT or Claude? What if you could run an LLM directly on your own computer, with no internet connection and no cost concerns? This document walks you step by step through building your own local LLM environment with **Ollama**, at zero token cost. The latter half also covers the strengths and weaknesses of the latest open-source LLM models, so you can find the best fit for your PC's specs.

> **Ollama** is a tool that lets you run various open-source LLMs — Llama, Mistral, Gemma, and more — on your local machine as easily as running a Docker container.

## Table of Contents

- [1. What Is Ollama?](#1-what-is-ollama)
- [2. Installing Ollama](#2-installing-ollama)
- [3. Basic Ollama Usage](#3-basic-ollama-usage)
- [4. Comparing Major LLM Models (Pros, Cons & Features)](#4-comparing-major-llm-models-pros-cons--features)
- [5. Choosing the Right Model for Your PC](#5-choosing-the-right-model-for-your-pc)
- [6. Useful Tips and Tools](#6-useful-tips-and-tools)
- [7. References](#7-references)

## 1. What Is Ollama?

Ollama is an **open-source framework that makes it easy to run and manage large language models (LLMs) in a local environment**. Just as Docker packages applications into containers, Ollama bundles model weights and configuration together so you can run them with ease. After installation, a few command lines are all it takes to run Meta's Llama, Mistral's Mistral, Google's Gemma, and many other LLMs directly on your own computer.

### Why Use Ollama? (Escaping Token Poverty)

| Advantage | Description |
|------|------|
| **Zero cost** | No per-API-call fees whatsoever. Ask unlimited questions with no billing worries |
| **Complete privacy** | All data stays on your computer. Analyze even sensitive documents with peace of mind |
| **Offline operation** | Once a model is downloaded, use it anywhere, no internet required |
| **Fast responses** | No network latency, so you get instant responses |
| **Free experimentation** | Swap between various models and test freely |
| **Excellent extensibility** | Integrates with a wide range of tools: REST API, Python integration, IDE extensions, and more |

## 2. Installing Ollama

### Prerequisites (Hardware Check)

Ollama runs on all modern OSes, but for smoothly running models, it's best to have **at least 8GB of RAM** (16GB recommended). For reference, a **Q4_K_M-quantized 7-billion-parameter model** requires about **4-6GB** of memory.

| Model size | Estimated memory needed at Q4 quantization |
|-----------|--------------------------------|
| 3B ~ 8B (small) | 4GB ~ 6GB |
| 13B ~ 20B (medium) | 8GB ~ 16GB |
| 32B ~ 40B (large) | 20GB ~ 32GB |
| 70B+ (extra-large) | 40GB+ |

A GPU gives faster inference speed but isn't required — even a plain CPU can generate roughly 5-15 tokens per second for a 7-billion-parameter model.

---

### Windows

1. Download the Windows installer (`OllamaSetup.exe`) from the [official Ollama download page](https://ollama.com/download).
2. Run the downloaded file to complete the installation.
3. After installation, open **PowerShell or Command Prompt (CMD)** and verify the install with the command below.

   ```bash
   ollama --version
   ```

---

### macOS

- **Using the official installer**
  Download and install the macOS file from [ollama.com](https://ollama.com).
- **Using Homebrew (recommended)**
  ```bash
  brew install ollama
  ```

---

### Linux

Run the command below in your terminal. Supports most distributions including Ubuntu, Debian, Fedora, and CentOS.

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

---

### Docker (Optional)

If you prefer container-based deployment, you can use the Docker image.

```bash
docker pull ollama/ollama
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

> `11434` is Ollama's default API port number.

### Verifying the Installation

Verify Ollama's service is running correctly with the command below.

```bash
ollama serve   # check that the server is running
```

You'll see output at `http://localhost:11434` indicating the Ollama server is running.

## 3. Basic Ollama Usage

### Running Your First Model — the Simplest Way

```bash
ollama run llama3.2
```

That's it — just this one line! If the model isn't already local, it downloads automatically and then launches an interactive prompt.

```
>>> Hi, who are you?
I'm Meta's Llama 3.2 model. How can I help you?
```

### Model Management Commands

| Command | Description |
|--------|------|
| `ollama list` | View downloaded models |
| `ollama pull <model>` | Download the model only (doesn't run it) |
| `ollama run <model>` | Download the model + start a chat |
| `ollama rm <model>` | Delete a model |
| `ollama cp <model> <new name>` | Copy a model |
| `ollama show <model>` | View detailed model info |

### One Tip — Using Model Tags

Adding `:latest` or a specific tag after the model name lets you pin a specific version. Note that `:latest` doesn't always point to the highest-performing model, so specifying an explicit tag is generally preferable.

```bash
# Example: specifying a particular size and quantization version
ollama run llama3.1:8b-q4_K_M
```

### Using Ollama from Python

Since Ollama provides a REST API, it's easy to integrate from Python and other languages.

```python
import requests

response = requests.post(
    "http://localhost:11434/api/generate",
    json={"model": "llama3.2", "prompt": "Hello, nice to meet you!", "stream": False}
)

print(response.json()["response"])
```

## 4. Comparing Major LLM Models (Pros, Cons & Features)

Ollama supports over 500 models. Here's a rundown of the pros, cons, and features of the most notable models as of 2025-2026.

### Llama 4 Series (Meta)

| Category | Llama 4 Scout | Llama 4 Maverick |
|------|---------------|------------------|
| **Architecture** | 17B active parameters, 16 MoE experts | 17B active parameters, 128 MoE experts |
| **Feature** | Industry-leading **10 million (10M) token** context window | 10M token context, full native image+text support |
| **Key benchmarks** | MMLU Pro 74.3 / GPQA Diamond 57.2 | MMLU Pro 80.5 / GPQA Diamond 69.8 |
| **Estimated hardware** | Single H100 GPU (at Int4 quantization) | Single H100 host |
| **Efficiency (estimated)** | ~$0.19-$0.49 / million (1M) tokens | ~$0.19-$0.49 / million (1M) tokens |

> **Llama 4 is the first publicly released natively multimodal open-weight model**, able to understand images and text simultaneously.

**Pros**
- **Overwhelming 10M context**: analyze an entire novel in one pass.
- **Excellent multimodal performance**: strong image recognition and analysis.
- **Mixture-of-Experts (MoE) architecture**: efficient thanks to optimized active parameters.

**Cons**
- Requires high-end hardware (especially VRAM).
- Large initial download size.
- An optimized quantized version is needed for fully offline use.

---

### Mistral Small 3.1 (Mistral AI)

| Category | Details |
|------|------|
| **Parameters** | 24B |
| **Context** | 128K tokens |
| **Inference speed (estimated)** | 150 tokens/sec |
| **Multimodal** | Supports text + image input |
| **License** | Apache 2.0 (fully open) |

> The Apache 2.0 license is a very permissive license allowing free commercial use, modification, and redistribution.

**Pros**
- **Fully open Apache 2.0 license**: free for commercial use.
- **Excellent speed/performance balance**: fast inference despite 24B parameters.
- **Strong multilingual support**: supports many languages including Korean.

**Cons**
- Running the 24B-parameter model smoothly requires high-end hardware. Some tests reported bottlenecks with long-context processing even on 256GB RAM with dual A100s.
- The theoretical max speed (150 tokens/sec) may be hard to achieve in an actual local environment.

---

### Gemma 4 / Gemma 3 Series (Google)

| Model | Parameters | Required VRAM (estimated) | Feature |
|------|----------|-------------------|------|
| Gemma 4 E2B / E4B | ~2B-4B (estimated) | ~15GB | Small and efficient, **strong on Math and ARC (science) benchmarks** |
| Gemma 4 26B-A4B | 26B | ~48GB | MoE architecture, excellent reasoning and coding ability |
| Gemma 3 4B | 4B | ~3-5GB | **Ultra-lightweight**, maximizes cost efficiency |

> Research from 2026 shows Gemma models particularly excel in ARC (scientific reasoning) and Math domains.

**Pros**
- **Optimized for lightweight use**: excellent performance with limited compute resources.
- **Strong scientific reasoning**: strong at math/logic problems.
- **Gemma 3 4B has unbeatable cost-efficiency**: roughly 12x cheaper per second than competing models.

**Cons**
- May be somewhat weaker than Qwen at the same size for coding.
- Requires proper prompting strategy (e.g., Few-shot CoT) to achieve peak performance.

---

### Phi-4 (Microsoft)

**Pros**
- **Strongest on the TruthfulQA (factuality) benchmark**: excels at generating accurate, fact-based answers.
- **Strong reasoning-specialized variants**: variants like Phi-4-mini-reasoning exist for reasoning-focused use.
- Reasonable resource requirements.

**Cons**
- Large performance variance depending on prompting method. Notably, sharp performance drops have been reported with Few-shot CoT (chain-of-thought) prompting.
- Better suited to specialized purposes (reasoning, fact-checking) than general conversation.

---

### Qwen 2.5 / Qwen 3 Series (Alibaba)

| Model | Parameters | Required VRAM (estimated) | Key benchmark |
|------|----------|-------------------|----------|
| Qwen2.5 7B | 7B | ~6GB | Outperforms Gemma 3 4B on 6 tasks |
| Qwen2.5-Coder 32B | 32B | ~20GB | **HumanEval 92.7% (GPT-4o level)** |
| Qwen2.5 32B | 32B | ~20GB | MMLU 83.2 |
| Qwen3 30B-A3B | 30B | 30-40GB | MoE architecture, latest reasoning ability |

> Qwen2.5 7B Instruct outperforms Gemma 3 4B on **6 out of 8 shared benchmark categories**.

**Pros**
- **The strongest in coding**: Qwen2.5-Coder 32B matches GPT-4o with 92.7% on HumanEval.
- **Excellent multilingual performance**: supports Chinese, English, and many other languages.
- **Broad size lineup**: options ranging from 7B up to 32B and 70B+.

**Cons**
- Some smaller models (e.g., 7B) may have output length limits (Gemma 3 4B supports 128k output, while Qwen2.5 7B Instruct is capped at 8192 tokens).
- Achieving top-tier performance requires relatively high-end hardware.

---

### Llama 3.3 70B (Meta)

**Pros**
- **#1 overall quality as of 2026 (MMLU 86.0)**
- Delivers similar performance to the 405B model while being far more efficient.
- Suitable for large-scale workloads (e.g., synthetic data generation).

**Cons**
- **Requires roughly 40GB+ VRAM**, a very high hardware bar.
- Better suited to enterprise/expert users than general users.
- Large download size (tens of GB).

---

### Model Comparison Summary Table

| Model | Suitable VRAM (estimated) | Best domain | Pros | Cons |
|------|--------------------------|----------|------|------|
| **Llama 4 Scout** | ~H100 GPU | Long-form analysis | 10M context, multimodal | Requires high-end hardware |
| **Llama 4 Maverick** | ~H100 host | Comprehensive multimodal | High performance, image understanding | Requires high-end hardware |
| **Mistral Small 3.1** | 24GB+ | Multilingual conversation | Speed/quality balance, fully open | Overloaded on long context |
| **Gemma 4 / 3** | 4GB-48GB | Math/scientific reasoning | Lightweight/efficient, low cost | Relatively weaker coding |
| **Phi-4** | ~16GB+ | Fact-based QA | Strong on TruthfulQA | Prompt-sensitive variance |
| **Qwen 2.5/3** | 6GB-40GB | **Coding** (strongest) | GPT-4o-level coding, various sizes | Output limits on some models |
| **Llama 3.3 70B** | ~40GB+ | Overall quality (top MMLU) | Overwhelming performance | Very high hardware requirement |

## 5. Choosing the Right Model for Your PC

Here are model recommendations based on your hardware specs.

### Low-end (8GB RAM / 4GB VRAM or less)

| Recommended model | Install command | Feature |
|-----------|-------------|------|
| **Llama 3.2 3B** | `ollama pull llama3.2` | Meta's latest small model, good for general conversation |
| **Gemma 3 4B** | `ollama pull gemma3:4b` | Unbeatable cost-efficiency, strong scientific reasoning |
| **Phi-4-mini** | `ollama pull phi4-mini` | Highly factual responses |

### Mid-range (16GB RAM / 8GB VRAM)

| Recommended model | Install command | Feature |
|-----------|-------------|------|
| **Llama 3.1 8B** | `ollama pull llama3.1:8b` | The most popular model, best general versatility |
| **Qwen2.5 7B** | `ollama pull qwen2.5:7b` | Strong at coding/multilingual tasks |
| **Mistral 7B** | `ollama pull mistral` | Well-proven 7B model |

### High-end (24GB+ VRAM)

| Recommended model | Install command | Feature |
|-----------|-------------|------|
| **Qwen2.5-Coder 32B** | `ollama pull qwen2.5-coder:32b` | **The strongest at coding** (92.7% HumanEval) |
| **Qwen2.5 32B** | `ollama pull qwen2.5:32b` | Best mid-sized all-rounder (MMLU 83.2) |
| **Mistral Small 22B** | `ollama pull mistral-small:22b` | Multilingual specialist |

### Ultra high-end (48GB+ VRAM)

| Recommended model | Install command | Feature |
|-----------|-------------|------|
| **Llama 3.3 70B** | `ollama pull llama3.3:70b` | **#1 overall quality** (MMLU 86.0) |
| **DeepSeek R1 Distill 70B** | `ollama pull deepseek-r1:70b` | Reasoning-specialized model |

### Model Selection Tips
- **"Bigger isn't always better"**: a model sized appropriately for your PC often provides a more pleasant experience.
- **Make good use of quantized versions (Q4_K_M, etc.)**: significantly reduces memory usage for a small accuracy trade-off.
- Use specific tags rather than `:latest` (e.g., `qwen2.5-coder:32b`).

## 6. Useful Tips and Tools

### Open WebUI — a Web Interface for Ollama

If the terminal isn't your preference, you can build a ChatGPT-style web interface with the command below.

```bash
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

### VS Code Extension — Continue

Installing the Continue extension lets you use Ollama models as a coding assistant right inside VS Code.

### LangChain + Ollama Integration

```python
from langchain_ollama import ChatOllama

llm = ChatOllama(model="llama3.2")
response = llm.invoke("Hi, welcome to the world of LLMs!")
print(response.content)
```

### Optimizing Performance with Environment Variables

Try setting the following environment variables for inference speed and memory management.

```bash
export OLLAMA_NUM_PARALLEL=4      # number of parallel requests (default: 1)
export OLLAMA_MAX_LOADED_MODELS=2 # max number of models loaded simultaneously
export OLLAMA_HOST=0.0.0.0        # allow API access from all interfaces
```

### Changing the Model Storage Location

Models are stored in `~/.ollama/models` by default. To change this, set the environment variable below.

```bash
export OLLAMA_MODELS=/path/to/your/models
```

## 7. References

- **Ollama official homepage** — [https://ollama.com](https://ollama.com)
- **Ollama GitHub repository** — [https://github.com/ollama/ollama](https://github.com/ollama/ollama)
- **Ollama official documentation** — [https://docs.ollama.com](https://docs.ollama.com)
- **Ollama model library** — [https://ollama.com/library](https://ollama.com/library)
- **Meta Llama 4 official blog** — [https://ai.meta.com/blog/llama-4-multimodal-intelligence/](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)
- **Mistral Small 3.1 announcement** — [https://mistral.ai/news/mistral-small-3-1](https://mistral.ai/news/mistral-small-3-1)
- **Gemma 4 / Phi-4 / Qwen3 performance comparison paper (arXiv:2604.07035)** — [https://arxiv.org/abs/2604.07035](https://arxiv.org/abs/2604.07035)
- **Gemma 3 vs Qwen2.5 benchmark comparison** — [https://llm-stats.com](https://llm-stats.com)
- **Ollama installation guide (SitePoint, 2026)** — [https://www.sitepoint.com/ollama-setup-guide-2026/](https://www.sitepoint.com/ollama-setup-guide-2026/)
- **The Complete Guide to Ollama (DEV Community)** — [https://dev.to/ajitkumar/the-complete-guide-to-ollama-run-large-language-models-locally-2mge](https://dev.to/ajitkumar/the-complete-guide-to-ollama-run-large-language-models-locally-2mge)

We've now walked through **Ollama installation and a comparison of major LLM models**. Go ahead and run LLMs to your heart's content on your own computer, with no more worries about token costs. Zero API cost, and complete privacy protection. Happy building with local AI!
