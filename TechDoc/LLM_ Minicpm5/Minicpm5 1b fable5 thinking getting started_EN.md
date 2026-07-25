---
title: "MiniCPM5-1B-Claude-Opus-Fable5-Thinking (GGUF) — Getting Started"
description: "A getting-started guide for the ultra-lightweight 1B-parameter local LLM MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF — quantization options, setup for llama.cpp/Ollama/LM Studio/vLLM, sampling parameters, benchmarks, and use-case recommendations."
abstract: |
  MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF is an ultra-lightweight 1-billion-parameter local LLM that runs on
  CPU alone or low-spec GPUs, distributed in GGUF format with a 128K token context window and a hybrid Think/No
  Think reasoning mode. This guide covers the model overview, quantization file options (Q4_K_M/Q5_K_M/Q8_0/F16),
  installation and usage across llama.cpp, Ollama, LM Studio, llama-cpp-python, vLLM, Docker Model Runner, and coding
  agent integration, recommended sampling parameters, tool-calling benchmark improvements over the base model,
  strengths and limitations, and scenario-based configuration recommendations.
summary_for_ai: |
  Getting-started guide for MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF, an Apache-2.0-licensed, ultra-lightweight
  1B-parameter local LLM fine-tuned from openbmb/MiniCPM5-1B on "Fable 5" data, distributed in GGUF format for
  llama.cpp-family runtimes. Note: "Fable 5" here refers to the training data source and is an unrelated open-source
  community model, not Anthropic's commercial "Claude Fable 5."
  Key specs: 1B parameters, llama architecture, 128K token max context (131,072 per upstream config.json), native
  chat template embedded in GGUF metadata, English/Chinese support, specialized in code generation/debugging,
  instruction following, and tool calling. Features hybrid reasoning: switchable "Thinking" mode (chain-of-thought)
  and "No Think" mode (fast response).
  Quantization files: Q4_K_M (~657MB, minimal footprint), Q5_K_M (~751MB, balanced), Q8_0 (~1.1GB, recommended
  default), F16 (~2.1GB, full precision). Since 1B models are relatively sensitive to quantization loss, Q8_0 is
  recommended when memory allows; Q4_K_M only for extreme constraints under 2GB RAM.
  Installation/usage covers: llama.cpp CLI (`llama cli -hf ...` or local file with `-m`), llama.cpp server for an
  OpenAI-compatible API (`llama-server`), Ollama (`ollama run hf.co/...`), LM Studio/jan/KoboldCpp (just load the
  .gguf file, template auto-detected), llama-cpp-python for Python integration, vLLM serving with OpenAI-compatible
  API, Docker Model Runner, and coding agent integration (Pi/Hermes/OpenClaw) via a local llama.cpp server as a
  custom OpenAI-compatible provider.
  Recommended sampling: Think mode uses temperature=0.9/top_p=0.95 (outputs a reasoning block before the final
  answer, needs post-processing to parse/strip it, suited to complex coding/reasoning tasks); No Think mode uses
  temperature=0.7/top_p=0.95/enable_thinking=False (immediate answer, suited to latency-sensitive chatbots/classification).
  Benchmarks: the V2 Thinking model improves over the base model on BFCL non_live (41.51% -> 43.06%), BFCL live
  (60.24% -> 63.33%), and especially API-Bank (7.30% -> 22.10%, roughly 3x), reflecting tool-calling-specialized
  training. A further tool-use-specialized derivative, MiniCPM5-Claude-Toolusage, is also available separately.
  Strengths: ultra-lightweight local execution (from 657MB, runs on CPU-only, Raspberry Pi-class SBCs, old laptops),
  unusually long 128K context for a 1B model, hybrid Think/No-Think mode selection, tool-calling performance aimed
  at SOTA among comparable 1B open models, broad runtime compatibility across the GGUF ecosystem, Apache-2.0 license
  with few restrictions on commercial use, and an embedded chat template requiring no manual setup.
  Limitations: fundamental capability ceiling of a 1B model (large gap from frontier models like GPT-4/Claude on
  complex general reasoning, multi-step logic, and broad world knowledge — better suited to narrow tasks like coding
  assistance, tool-call routing, and classification than a general assistant); Thinking mode's extra reasoning-block
  output requires added parsing logic and increases token consumption/latency; the 128K context is a theoretical
  maximum constrained in practice by runtime and hardware (RAM/VRAM), with ~8K being more realistic on low-spec
  hardware; quantization sensitivity (Q4 and below can show relatively noticeable quality degradation, hence the
  Q8_0 recommendation); limited official language coverage (English/Chinese, Korean performance unverified); and no
  availability via HuggingFace Inference Providers (local execution only, no cloud API option).
  Includes a scenario-based configuration table (offline local coding assistant, on-device tool-call router,
  low-latency chatbot/classifier, large document/codebase summarization, edge device experimentation) and reference
  links to the GGUF repo, Transformers checkpoint, base model, and llama.cpp.
date: 2026-07-17
author: "Dennis Kim"
lang: en
tags:
  - MiniCPM5
  - GGUF
  - Local LLM
  - llama.cpp
  - Ollama
keywords:
  - MiniCPM5-1B GGUF
  - local LLM getting started
  - llama.cpp quantization
  - Ollama GGUF model
  - 1B parameter model
  - tool calling small LLM
featured: false
schema_type: TechArticle
draft: false
---

# MiniCPM5-1B-Claude-Opus-Fable5-Thinking (GGUF) — Getting Started

> A getting-started guide for the ultra-lightweight 1B-parameter local LLM
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
| Max context | 128K tokens (131,072 per upstream `config.json`) |
| Architecture | llama |
| Chat template | MiniCPM5's native template embedded in GGUF metadata |
| Supported languages | English, Chinese |
| Specializations | Code generation/debugging, instruction following, tool calling |

This model is an ultra-lightweight model that can run on CPU alone or on a low-spec GPU environment, usable across the entire GGUF-compatible runtime ecosystem — llama.cpp, Ollama, LM Studio, jan, KoboldCpp, and more. It features a hybrid reasoning structure that can switch between "Thinking" mode (chain-of-thought reasoning) and "No Think" mode (fast response).

Note: "Fable 5" in the name refers to the source of the training data, and this is an unrelated open-source community model — not Anthropic's commercial closed model "Claude Fable 5."

---

## 2. Available Files (Choosing a Quantization)

| File | Quantization | Size | Notes |
| :--- | :--- | :--- | :--- |
| `...-Q4_K_M.gguf` | Q4_K_M | ~657 MB | Minimum footprint, for low-memory environments |
| `...-Q5_K_M.gguf` | Q5_K_M | ~751 MB | Balance of quality and size |
| `...-Q8_0.gguf` | Q8_0 | ~1.1 GB | **Recommended default** |
| `...-F16.gguf` | F16 | ~2.1 GB | Full-precision converted original |

**Selection guide**: 1B models are relatively sensitive to quantization loss, so if you have memory to spare, using **Q8_0** as your default is recommended. Only consider Q4_K_M in extremely constrained environments with under 2GB of RAM.

---

## 3. Installation and Usage

### 3.1 llama.cpp (CLI)

macOS / Linux installation:

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

Running directly from a local file (Q8_0 example):

```bash
llama-cli \
  -m MiniCPM5-1B-Claude-Opus-Fable5-Thinking-Q8_0.gguf \
  -p "Write a Python function to merge two sorted lists." \
  -n 512 \
  --temp 0.9 --top-p 0.95 \
  -c 8192
```

The context length (`-c`) supports up to 131,072, but the actually usable length must be tuned based on your VRAM/RAM.

### 3.2 llama.cpp Server (OpenAI-Compatible API)

```bash
llama-server \
  -m MiniCPM5-1B-Claude-Opus-Fable5-Thinking-Q8_0.gguf \
  -c 8192 --port 8080
```

Once the server starts, you can use the web UI and the OpenAI-compatible `/v1/chat/completions` endpoint at `http://localhost:8080`. Existing code built on the OpenAI SDK integrates as-is — just change the `base_url`.

### 3.3 Ollama

```bash
ollama run hf.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF:Q4_K_M
```

This pulls and runs the model directly from the HuggingFace repository, with no need to write a separate Modelfile.

### 3.4 LM Studio / jan / KoboldCpp

Just download the `.gguf` file from the repository and load it. Since the MiniCPM5 chat template is embedded in the GGUF metadata, no manual template configuration is needed.

- LM Studio: type `GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF` in the search bar and download the quantization version you want

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
        {"role": "user", "content": "Write a Python function to merge two sorted lists."}
    ]
)
print(response["choices"][0]["message"]["content"])
```

### 3.6 vLLM

```bash
pip install vllm
vllm serve "GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF"
```

Calling the OpenAI-compatible API:

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

The approach is to run a llama.cpp server as the backend, then register its OpenAI-compatible endpoint (`http://localhost:8080/v1`) as a custom provider in each agent. This is useful for local coding agent experimentation.

---

## 4. Recommended Sampling Parameters

Inherits the base model's (MiniCPM5-1B) default generation settings.

| Mode | Parameters |
| :--- | :--- |
| **Think** (default) | `temperature=0.9`, `top_p=0.95` |
| **No Think** | `temperature=0.7`, `top_p=0.95`, `enable_thinking=False` |

- **Think mode**: outputs an internal reasoning block before the final answer. Suited to complex coding/reasoning tasks, but requires post-processing logic to parse and strip the reasoning block when integrating into a pipeline.
- **No Think mode**: answers immediately with no reasoning process. Suited to latency-sensitive chatbot/classification tasks.

---

## 5. Performance Benchmarks

Tool-calling performance was significantly improved in the V2 version (per figures published by the model's creators).

| Model | BFCL (non_live) | BFCL (live) | API-Bank |
| :--- | :--- | :--- | :--- |
| MiniCPM5-1B (Base) | 41.51% | 60.24% | 7.30% |
| **V2 Thinking model** | **43.06%** | **63.33%** | **22.10%** |

The API-Bank score in particular rose roughly 3x, from 7.30% to 22.10%, demonstrating the effect of tool-calling-specialized training. A derivative model further specialized for tool use, `MiniCPM5-Claude-Toolusage`, is also provided separately.

---

## 6. Strengths

- **Ultra-lightweight local execution**: at as little as 657MB (Q4_K_M), it can run on CPU alone, Raspberry Pi-class SBCs, and older laptops
- **128K long context**: an unusually long context window for a 1B-class model, usable for analyzing large codebases and long documents
- **Hybrid reasoning**: switch between Think/No Think modes to choose quality vs. speed per task
- **Enhanced tool calling**: designed with the aim of SOTA tool-calling performance among comparable 1B open-source models
- **Broad runtime compatibility**: supports virtually the entire GGUF ecosystem — llama.cpp, Ollama, LM Studio, vLLM, Docker, and more
- **Apache-2.0 license**: few restrictions on commercial use and redistribution
- **Embedded template**: the chat template is included in the GGUF, so it's ready to use immediately without separate configuration

---

## 7. Weaknesses and Limitations

- **Fundamental limits of a 1B model**: a significant gap remains vs. frontier-class models (GPT-4, Claude, etc.) on complex general reasoning, multi-step logic, and broad world knowledge. It's more realistic to use it for specific tasks (coding assistance, tool-call routing, classification) than as a general-purpose assistant
- **Extra output from Thinking mode**: since the reasoning block is output before the final answer, application integration requires additional parsing logic. Token consumption and latency also increase proportionally to the reasoning block
- **Effective context constraints**: 128K is a theoretical maximum, and the actually usable length depends on the runtime and hardware (RAM/VRAM). A setting around 8K is more realistic on low-spec hardware
- **Quantization sensitivity**: due to its small size, quality degradation can be relatively pronounced at Q4 and below quantization (the reason Q8_0 is recommended)
- **Language coverage**: officially supported languages are centered on English and Chinese. Korean performance needs separate verification
- **No inference provider support**: not currently deployed on HuggingFace Inference Providers, so it can't be used as a cloud API (local execution only)

---

## 8. Suggested Use-Case Scenarios

| Scenario | Recommended configuration |
| :--- | :--- |
| Local coding assistant (offline) | Q8_0 + Think mode, llama-server integrated with an editor |
| On-device tool-call router | Q8_0 + Think mode (leveraging BFCL/API-Bank strengths) |
| Low-latency chatbot / classifier | Q5_K_M + No Think mode |
| Large document/codebase summarization | F16 or Q8_0 + a long `-c` setting (sufficient RAM required) |
| Edge device experimentation | Q4_K_M + context of 4K or less |

---

## 9. Reference Links

- GGUF repository: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF
- Transformers checkpoint: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking
- Base model: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp: https://github.com/ggml-org/llama.cpp
