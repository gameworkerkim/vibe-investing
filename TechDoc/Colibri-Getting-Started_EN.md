---
title: "Colibri Getting Started"
description: "Colibri runs GLM-5.2, a 744B-parameter MoE model, on a pure-C zero-dependency engine that fits on a 25GB-RAM consumer machine via disk-streamed experts."
abstract: |
  Colibri is a pure-C, zero-dependency inference engine that runs the 744B-parameter MoE model GLM-5.2 on machines with as little as 25GB of RAM by streaming inactive experts from disk. A learned cache pins frequently used experts over time, so the same engine scales from a 25GB laptop to multi-GPU servers with the full expert set resident in VRAM. Speculative decoding via GLM-5.2's native MTP head requires an int8 head to avoid acceptance-rate collapse.
summary_for_ai: |
  Reference note for AI agents: performance figures (tokens/s) and hardware requirements are from the project README as of the article's writing and may shift with future releases. The MTP head must be int8, not int4, or speculative decoding acceptance collapses to 0-4%. This is a one-person open-source project (Apache 2.0 engine, MIT GLM-5.2 weights); verify current benchmarks before relying on the numbers here.
lang: en
featured: false
author: Dennis Kim
date: 2026-07-21
schema_type: TechArticle
---

# Colibri Getting Started

**Colibri** is a project that runs **GLM-5.2**, a **744B-parameter MoE (Mixture of Experts) model**, using an ultra-lightweight engine written in pure C. It's designed to run even on ordinary consumer machines with as little as **25GB of RAM**. The catch is that "ordinary" here still means a fairly high-end developer machine, and disk streaming can feel noticeably sluggish. Still, the fact that you can run a model of this size locally at all is the whole point.

The more you use it continuously rather than just once, the faster it gets, since relevant topics get progressively loaded into memory.

---

## Project Description

Colibri exploits the fact that a 744B-scale MoE model activates **only about 40B parameters per token**, and that the activated experts differ per token (about 11GB):

- **Dense part** — attention, shared experts, embeddings, etc., roughly 17B parameters → **resident in RAM as int4** (about 9.9GB)
- **Routed experts** — 75 MoE layers x 256 = **19,456 experts**, each about 19MB at int4 → **stored on disk** (about 370GB)

The core idea is that **the model doesn't need to "fit" in fast memory**. Experts are streamed from disk as needed, treating VRAM, RAM, and storage as a single managed memory hierarchy.

---

## How It Works

### The Per-Token Path

Every token at every layer goes through five stages: **Route → Union → Place → Overlap → Learn**.

1. **Route** — the router decides which experts to activate for the input token
2. **Union** — when multiple tokens in a batch pick the same expert, it's deduplicated (batch-union)
3. **Place** — decides where to fetch the expert from (VRAM > RAM > disk). Batching policy only affects **speed**; it never changes router decisions or weight precision
4. **Overlap** — an async I/O pool (`PIPE=1`) loads missing experts from disk while computation proceeds using resident experts. A router lookahead thread (`PILOT=1`) prefetches the next layer's experts (routing is **71.6% predictable**)
5. **Learn** — routing history is saved to a `.coli_usage` file, and frequently used experts get automatically pinned

### Memory Hierarchy

[3-tier expert placement across VRAM / RAM / NVMe]

The same engine covers the full spectrum:
- **25GB laptop**: all experts streamed from disk (slow but accurate)
- **Large hosts**: the full expert set stays resident (`CUDA_EXPERT_GB=auto PIN_GB=all`) → eliminates the disk bottleneck entirely
- **Multi-socket hosts**: memory controller interleaving via `COLI_NUMA=1`

A **learned cache** operates across the tiers. It records which experts your workload uses and automatically pins the most frequent ones — **it gets faster the more you use it**.

### Compressed KV State

MLA (Multi-head Latent Attention) compresses KV state to 576 floats per token (32,768 → 576, a **57x compression**). It's saved to a `.coli_kv` file, so KV state survives restarts and is byte-identical to an uninterrupted session.

### Speculative Decoding (Inference Acceleration)

GLM-5.2's native MTP (Multi-Token Prediction) head drafts tokens for the main model to verify in a single batched forward pass, achieving **2.2-2.8 tokens/forward**.

> ⚠**Critical rule**: the MTP head **must use int8**. The int4 version collapses to a 0-4% acceptance rate ([#8](https://github.com/JustVugg/colibri/issues/8)). Since drafting and verification must compute the same function, `SPEC_PIN=1` pins both operations to a single kernel family ([#163](https://github.com/JustVugg/colibri/issues/163)).

---

## Strengths

| Item | Description |
|------|------|
| **Runs on very low-end hardware** | A 744B model runs even on a laptop with only 25GB of RAM |
| **Pure C, zero dependencies** | No BLAS, Python runtime, or GPU required |
| **Preserves accuracy** | The default policy **never changes model precision or router semantics** |
| **Learned cache** | Records frequently used experts from your workload and auto-pins them, getting faster with use |
| **GPU support** | A CUDA backend that keeps experts resident in VRAM eliminates the disk bottleneck |
| **Metal support** | GPU acceleration available on Apple Silicon |
| **Compressed KV state** | MLA attention gives 576 floats per token (57x compression) → KV state persists across restarts |
| **Faster inference** | Speculative decoding (MTP head) gives 2.2-2.8 tokens/forward |
| **NUMA support** | Memory controller interleaving on multi-socket hosts |
| **Web dashboard** | Real-time token metrics, hardware panel, Expert Brain/Atlas visualization |
| **Grammar-forced output** | `GRAMMAR=file.gbnf` gains extra acceptance rate for structured JSON output |
| **Open source** | Apache 2.0 license (GLM-5.2 weights are Z.ai's MIT license) |

---

## Weaknesses

| Item | Description |
|------|------|
| **Disk dependency** | Requires 370GB of expert data on disk |
| **Slow on low-end setups** | Only 0.05-0.1 tok/s on a 25GB RAM environment |
| **Initial model download/conversion** | Requires converting or downloading a 370GB+ model yourself |
| **int4 MTP head caution** | int4 MTP heads collapse to a 0-4% acceptance rate, so int8 is mandatory |
| **Python dependency (partial)** | The converter and API gateway require Python |
| **Windows builds** | Pre-built binaries are recommended over native builds |

---

## Real-World Performance

Same engine, same int4 container — hardware only determines where experts are placed. See the [full benchmarks](https://github.com/JustVugg/colibri/blob/main/docs/benchmarks.md):

| Hardware | Decode speed | Notes |
|----------|------------|------|
| **6x RTX 5090 (full expert set resident in VRAM)** | **5.8-6.8 tok/s** | TTFT ~13 seconds |
| **128GB CPU-only desktop** | ~1.8 tok/s (warm) | RAM-resident |
| **Single RTX 5070 Ti** | 1.07 tok/s | GPU-resident pipeline |
| **25GB dev machine** | 0.05-0.1 tok/s (cold) | Pure disk streaming |

---

## Competing Projects

The README doesn't directly reference competing projects. But given the problem space Colibri addresses (running very large MoE models on low-end hardware), the following projects take a similar approach:

| Project | Description |
|----------|------|
| **llama.cpp** | A C++-based inference engine that efficiently runs various LLMs on CPU/GPU |
| **ExLlamaV2** | A GPU-focused high-speed inference engine leveraging GPTQ quantization |
| **vLLM** | An inference server that maximizes GPU memory efficiency via PagedAttention |
| **DeepSpeed** | Microsoft's large-scale distributed training/inference framework |

Colibri's differentiation lies in its extreme minimalism — **pure C, zero dependencies, running a 744B MoE model on 25GB of RAM**.

---

## Installation

### 1. System Requirements

- **RAM**: 25GB minimum (recommended)
- **Disk**: At least 400GB of free space (370GB model + other files)
- **OS**: Linux, Windows, macOS
- **Compiler**: GCC (Linux/macOS) or MSVC (Windows)
- **Python 3**: For model conversion and the API gateway (not required at runtime)

### 2. Clone the Repository

```bash
git clone https://github.com/JustVugg/colibri.git
cd colibri
```

### 3. Build

```bash
cd c
./setup.sh   # checks GCC/OpenMP, builds, runs self-tests
```

You can also build with `make` from the root.

For Nix/NixOS users:
```bash
nix develop   # flake.nix provided
```

### 4. Download the Model

Download the **pre-converted GLM-5.2 int4 container** from Hugging Face:

> ⚠**Make sure to use the version that includes the int8 MTP head!**
> The original mirror ships an int4 MTP head, which collapses acceptance rate to 0%.

```bash
# Correct version (with int8 MTP)
huggingface-cli download mateogrgic/GLM-5.2-colibri-int4-with-int8-mtp
```

You can also convert directly from the FP8 source (Python required, processed shard by shard so you don't need to hold the entire 756GB on disk at once):

```bash
cd c
./coli convert --model /nvme/glm52_i4   # shard-by-shard download+convert (one-time)
```

**How to verify the int8 MTP head**:
```bash
ls -l /path/to/model/out-mtp-*
# int8 (correct): 3527131672 / 5366238584 / 1065950496
```

### 5. Run

```bash
# Set the model path via environment variable
export COLI_MODEL=/path/to/glm52_i4

# Interactive chat
./coli chat

# Check the placement plan (VRAM/RAM/disk placement plan)
./coli plan

# Status diagnostics (read-only)
./coli doctor

# Web dashboard + API server (single port)
./coli web --model /path/to/glm52_i4

# OpenAI-compatible API server (API only)
./coli serve --model /path/to/glm52_i4
```

The runtime engine operates in pure C. Python is only used for the one-time converter and the optional API gateway.

### 6. Windows Users

Downloading a pre-built binary is the simplest path:

1. Download `colibri--windows-x86_64.zip` from the [Releases page](https://github.com/JustVugg/colibri/releases)
2. Unzip and rename `colibri-*-windows-x86_64.exe` to `glm.exe`
3. Install [Python 3](https://www.python.org/downloads/)
4. Run `coli chat`

See the [Windows guide](https://github.com/JustVugg/colibri/blob/main/docs/windows.md) for details.

---

## Dashboard Features

The web dashboard, launched with `./coli web`, provides three main views:

| Page | Description |
|--------|------|
| **Dashboard** | Real-time token metrics, per-turn timing analysis, VRAM/RAM/disk tier bars, a live mini-brain |
| **Brain** | Visualizes the 19,456 experts as a living cortex — color indicates storage tier, brightness indicates routing frequency, hover shows topic affinity |
| **Atlas** | Displays the measured Expert Atlas as a 3D galaxy — 13,260 experts clustered by topic (poetry, law, Chinese, SQL, etc.) |

---

## Project Support

Colibri started as a solo project on a 12-core laptop with 25GB of RAM. It has since grown through community data measured on real hardware. Ways to contribute:

- Star and share the repository
- Share benchmark data from your own hardware (via Issues)
- Sponsor development or offer hardware donations via GitHub Issues

---

## Additional Resources

| Topic | Document |
|------|------|
| Quick start guide | [docs/quickstart.md](https://github.com/JustVugg/colibri/blob/main/docs/quickstart.md) |
| Benchmarks and quality measurement | [docs/benchmarks.md](https://github.com/JustVugg/colibri/blob/main/docs/benchmarks.md) |
| Tuning guide | [docs/tuning.md](https://github.com/JustVugg/colibri/blob/main/docs/tuning.md) |
| Windows native build (+ CUDA DLL) | [docs/windows.md](https://github.com/JustVugg/colibri/blob/main/docs/windows.md) |
| CUDA backend | [docs/cuda.md](https://github.com/JustVugg/colibri/blob/main/docs/cuda.md) |
| Metal backend | [docs/metal.md](https://github.com/JustVugg/colibri/blob/main/docs/metal.md) |
| OpenAI-compatible API + KV slots | [docs/api.md](https://github.com/JustVugg/colibri/blob/main/docs/api.md) |
| Grammar-forced drafts (structured output) | [docs/grammar-draft.md](https://github.com/JustVugg/colibri/blob/main/docs/grammar-draft.md) |
| Environment variable list | [docs/ENVIRONMENT.md](https://github.com/JustVugg/colibri/blob/main/docs/ENVIRONMENT.md) |

---

> **Tip**: Colibri gets faster the more you use it (routing history is saved to `.coli_usage` and frequently used experts are auto-pinned). It may be slow at first, but performance improves with continued use. Whether MTP speculative decoding helps depends on cache temperature, so measure it yourself and decide whether to disable it with `DRAFT=0`.

---

## Origin of the Name

A hummingbird (Colibri) weighs only a few grams, yet visits thousands of flowers a day. This engine keeps a 744B-parameter giant fed on a hummingbird's diet: 25GB of RAM, 12 CPU cores, and a lot of disk patience.

---

**License**: Engine — Apache 2.0 / GLM-5.2 weights — distributed by Z.ai, MIT
