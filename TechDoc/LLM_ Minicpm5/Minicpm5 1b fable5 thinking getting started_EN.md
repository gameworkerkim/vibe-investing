---
title: "MiniCPM5-1B-Claude-Opus-Fable5-Thinking (GGUF) — Getting Started"
description: "A getting-started guide for the ultra-lightweight 1B local LLM MiniCPM5-1B-Fable5-Thinking: GGUF quantization choices, runtime setup, and tool-calling benchmarks."
abstract: |
  MiniCPM5-1B-Claude-Opus-Fable5-Thinking is a 1B-parameter GGUF model fine-tuned from openbmb/MiniCPM5-1B on Fable 5 post-training data, supporting a 128K context and a hybrid Think/No-Think reasoning mode. It runs across the full GGUF ecosystem (llama.cpp, Ollama, LM Studio, vLLM, Docker) even on CPU-only or SBC-class hardware, with V2 showing a roughly 3x jump in API-Bank tool-calling accuracy over the base model. Its core limitation is the standard 1B-scale gap versus frontier models in complex reasoning and world knowledge.
summary_for_ai: |
  Reference note for AI agents: despite "Fable 5" in the name, this is an independent open-source community model unrelated to Anthropic's commercial "Claude Fable 5." It is not deployed on HuggingFace Inference Providers, so it is local-execution-only. Q8_0 is the recommended default quantization for this 1B scale; Q4_K_M is only advisable under extreme memory constraints (under 2GB RAM) due to increased quality loss at small parameter counts.
lang: en
featured: false
author: Dennis Kim
date: 2026-07-17
schema_type: TechArticle
---

# MiniCPM5-1B-Claude-Opus-Fable5-Thinking (GGUF) — Getting Started

> Getting-started guide for an ultra-lightweight 1B-parameter local LLM
> Model page: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF
> License: Apache-2.0 (inherited from the base model MiniCPM5-1B)

---

## 1. Model Overview

| Item | Details |
| :--- | :--- |
| Parameter scale | 1B (1 billion) |
| Base model | `openbmb/MiniCPM5-1B` |
| Fine-tuning data | Fable 5 data (post-training) |
| Distribution format | GGUF (quantized build for llama.cpp-family runtimes) |
| Max context | 128K tokens (131,072 / per upstream `config.json`) |
| Architecture | llama |
| Chat template | Native MiniCPM5 template embedded in GGUF metadata |
| Supported languages | English, Chinese |
| Specializations | Code generation/debugging, instruction following, tool calling |

This model is an ultra-lightweight model that can run on CPU alone or on low-spec GPU environments, usable across the full GGUF-compatible runtime landscape — llama.cpp, Ollama, LM Studio, jan, KoboldCpp, and more. It features a hybrid reasoning structure that switches between 'Thinking' mode (chain-of-thought reasoning) and 'No Think' mode (fast response).

Note: "Fable 5" in the name refers to the source of the training data, and is an independent open-source community model unrelated to Anthropic's commercial closed-source model "Claude Fable 5."

---

## 2. Available Files (Choosing a Quantization Version)

| File | Quantization | Size | Notes |
| :--- | :--- | :--- | :--- |
| `...-Q4_K_M.gguf` | Q4_K_M | ~657 MB | Minimum footprint, for low-memory environments |
| `...-Q5_K_M.gguf` | Q5_K_M | ~751 MB | Balance of quality and size |
| `...-Q8_0.gguf` | Q8_0 | ~1.1 GB | **Recommended default** |
| `...-F16.gguf` | F16 | ~2.1 GB | Full-precision conversion source |

**Selection guide**: 1B models are relatively sensitive to quantization loss, so it's recommended to default to **Q8_0** if memory allows. Only consider Q4_K_M in extreme constrained environments with under 2GB of RAM.

---

## 3. Installation and Setup

### 3.1 llama.cpp (CLI)

macOS / Linux install:

```bash
curl -LsSf https://llama.app/install.sh | sh
```

Windows (WinGet):

```bash
winget install llama.cpp
```

Direct inference from the terminal:

```bash
llama cli -hf GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF:Q4_K_M
```

Run directly from a local file (using Q8_0):

```bash
llama-cli \
  -m MiniCPM5-1B-Claude-Opus-Fable5-Thinking-Q8_0.gguf \
  -p "Write a Python function to merge two sorted lists." \
  -n 512 \
  --temp 0.9 --top-p 0.95 \
  -c 8192
```

Context length (`-c`) supports up to 131,072, but the actually usable length must be adjusted based on your VRAM/RAM.

### 3.2 llama.cpp Server (OpenAI-Compatible API)

```bash
llama-server \
  -m MiniCPM5-1B-Claude-Opus-Fable5-Thinking-Q8_0.gguf \
  -c 8192 --port 8080
```

After launching the server, you can use the web UI and the OpenAI-compatible `/v1/chat/completions` endpoint at `http://localhost:8080`. Existing code built on the OpenAI SDK will work as-is by simply changing the `base_url`.

### 3.3 Ollama

```bash
ollama run hf.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF:Q4_K_M
```

Pulls and runs directly from the HuggingFace repository, with no need to write a separate Modelfile.

### 3.4 LM Studio / jan / KoboldCpp

Simply download the repository's `.gguf` file and load it. The MiniCPM5 chat template is embedded in the GGUF metadata, so no manual template configuration is needed.

- LM Studio: enter `GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF` in the search bar and download the quantization version you want

### 3.5 llama-cpp-python (Python Integration)

```bash
pip install llama-cpp-python
```

```python
from llama_cpp import Llama

llm = Llama.from_pretrained(
    repo_id="GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF",
    filename="MiniCPM5-1B-Claude-Opus-Fable5-Thinking-Q8_0.gguf",
)

response = llm.create_chat_completion(
    messages=[
        {"role": "user", "content": "Write a Python function that merges two sorted lists."}
    ]
)
print(response["choices"][0]["message"]["content"])
```

### 3.6 vLLM

```bash
pip install vllm
vllm serve "GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF"
```

OpenAI-compatible API call:

```bash
curl -X POST "http://localhost:8000/v1/chat/completions" \
  -H "Content-Type: application/json" \
  --data '{
    "model": "GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF",
    "messages": [{"role": "user", "content": "What is the capital of France?"}]
  }'
```

### 3.7 Docker Model Runner

```bash
docker model run hf.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF:Q4_K_M
```

### 3.8 Coding Agent Integration (Pi / Hermes / OpenClaw)

Run a llama.cpp server as the backend, then register the OpenAI-compatible endpoint (`http://localhost:8080/v1`) as a custom provider for each agent. Useful for local coding-agent experimentation.

---

## 4. Recommended Sampling Parameters

Inherits the default generation values from the base model (MiniCPM5-1B).

| Mode | Parameters |
| :--- | :--- |
| **Think** (default) | `temperature=0.9`, `top_p=0.95` |
| **No Think** | `temperature=0.7`, `top_p=0.95`, `enable_thinking=False` |

- **Think mode**: outputs an internal reasoning block before the final answer. Well-suited for complex coding/reasoning tasks, but post-processing logic to parse and strip the reasoning block is needed when integrating into a pipeline.
- **No Think mode**: answers immediately with no reasoning process. Well-suited for latency-sensitive chatbot/classification tasks.

---

## 5. Performance Benchmarks

Tool-calling performance improved significantly in the V2 version. (Figures per the model creator's published numbers)

| Model | BFCL (non_live) | BFCL (live) | API-Bank |
| :--- | :--- | :--- | :--- |
| MiniCPM5-1B (Base) | 41.51% | 60.24% | 7.30% |
| **V2 Thinking model** | **43.06%** | **63.33%** | **22.10%** |

In particular, the API-Bank score rising roughly 3x from 7.30% to 22.10% demonstrates the effect of specialized training for tool calling. A derivative model even more specialized for tool use, `MiniCPM5-Claude-Toolusage`, is also provided separately.

---

## 6. Strengths

- **Ultra-lightweight local execution**: runs on CPU alone, Raspberry-Pi-class SBCs, and even older laptops with as little as 657MB (Q4_K_M)
- **128K long context**: unusually long context support for a 1B-class model, usable for analyzing large codebases and lengthy documents
- **Hybrid reasoning**: switch between Think/No Think modes to choose quality vs. speed per task
- **Enhanced tool calling**: designed with the goal of SOTA tool-calling performance among comparable 1B open-source models
- **Broad runtime compatibility**: supports virtually the entire GGUF ecosystem — llama.cpp, Ollama, LM Studio, vLLM, Docker, and more
- **Apache-2.0 license**: minimal restrictions on commercial use and redistribution
- **Built-in template**: the chat template is embedded in the GGUF, so it can be used immediately with no separate configuration

---

## 7. Weaknesses and Limitations

- **Fundamental limits of the 1B scale**: a wide gap remains versus frontier models (GPT-4, Claude, etc.) in complex general reasoning, multi-step logic, and broad world knowledge. It's more realistic to use it for specific tasks (coding assistance, tool-call routing, classification) rather than as a general-purpose assistant
- **Additional output from Thinking mode**: since the reasoning block is output before the final answer, integrating it into an application requires additional parsing logic. Token consumption and latency also increase in proportion to the reasoning block
- **Effective context constraints**: 128K is a theoretical maximum, and the actually usable length depends on the runtime and hardware (RAM/VRAM). Around 8K is realistic on low-spec environments
- **Quantization sensitivity**: as a small model, quality degradation can be relatively pronounced below Q4 quantization (hence the Q8_0 recommendation)
- **Language coverage**: officially supported languages are centered on English and Chinese. Korean performance needs separate verification
- **No inference-provider support**: it is not currently deployed on HuggingFace Inference Providers, so it cannot be used as a cloud API (local execution only)

---

## 8. Suggested Usage Scenarios

| Scenario | Recommended Setup |
| :--- | :--- |
| Local coding assistant (offline) | Q8_0 + Think mode, llama-server + editor integration |
| On-device tool-call router | Q8_0 + Think mode (leveraging BFCL/API-Bank strengths) |
| Low-latency chatbot / classifier | Q5_K_M + No Think mode |
| Large document/codebase summarization | F16 or Q8_0 + a long `-c` setting (RAM headroom required) |
| Edge device experimentation | Q4_K_M + 4K context or below |

---

## 9. Reference Links

- GGUF repository: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF
- Transformers checkpoint: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking
- Base model: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp: https://github.com/ggml-org/llama.cpp
