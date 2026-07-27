<!--
---
title: "DeepSeek-V4 (Pro/Flash) Getting Started — Open-Weight Guide"
title_ko: "DeepSeek-V4 (Pro/Flash) Getting Started — 오픈 웨이트 가이드"
subtitle: "1M Context MoE · MIT License · Think High/Max · vLLM/SGLang Deployment"
description: "TechDoc for DeepSeek-V4 Pro (1.6T-A49B) & Flash (284B-A13B): 1M context MoE, MIT license, encoding_dsv4, vLLM/DSpark, Claude Code, Korean third-party eval."
abstract: |
  DeepSeek-V4 is an open-weight MoE family (Pro 1.6T / Flash 284B, 1M context, MIT) released in late April 2026.
  CSA+HCA hybrid attention reduces KV cache to 10%. Non-think / Think High / Think Max three-tier reasoning modes.
  This document covers v1 corrections, Flash 2×H200 / Pro 8×H200 hardware, API / self-hosting, and Korea/Japan business scenarios.
summary_for_ai: |
  Hands-on TechDoc for DeepSeek-V4 Pro and Flash open-weight MoE models.
  MIT license, 1M context, encoding_dsv4 (no Jinja template), vLLM v0.23+, DSpark serving.
  Third-party Korean benchmarks avg 84.9. Preview status — verify GA checkpoints.
date: 2026-07-27
updated: 2026-07-27
author: "Dennis Kim"
lang: en
tags: [DeepSeek V4, DeepSeek, Open Weight, MoE, LLM, vLLM, English]
keywords: ["DeepSeek V4", "DeepSeek-V4-Flash", "DeepSeek-V4-Pro", "open weight", "1M context", "MIT license", "CSA HCA", "Agentic LLM"]
group: llm-agents
featured: true
featured_rank: 2
schema_type: TechArticle
draft: false
robots: index,follow
---
-->

# DeepSeek-V4 (Pro 1.6T-A49B / Flash 284B-A13B) Project Guide — Final Verified Edition

> **Document version** v2.0 (2026-07-27) · **Verification basis** DeepSeek official HF model cards / DeepSeek API Docs / technical report (arXiv 2606.19348)
> **Scope change** v1 covered Flash only; V4 is a **Pro/Flash two-model family release**, so both are covered together. The architecture is identical — separate write-ups would cause confusion.
> **Status** Official model cards label themselves as **preview version**. GA checkpoints are separate.

---

## 0. Major Corrections vs v1

| # | Item | v1 claim | Correction |
|---|---|---|---|
| 1 | Expert layout | "256 routed + 1 shared" | **Expert count not disclosed on official model card.** Unsourced figure removed |
| 2 | Architecture | "Static token-ID→expert-ID hash table" | **Not among the official three upgrades** (Hybrid Attention / mHC / Muon). Estimated from pre-release leaks — removed |
| 3 | Attention | "Hybrid local + long-range" | Precisely **CSA (Compressed Sparse Attention) + HCA (Heavily Compressed Attention)** |
| 4 | Flash hardware | "FP8 H100 ×2 / INT4 H100 ×1" | **Wrong.** Instruct is FP4+FP8 mixed ~158GB. With 1M context ~170–175GB → **2×H200 or 4×A100**. 2×H100 (160GB) is insufficient |
| 5 | Flash memory | "FP8 ~500GB, INT4 141–155GB" | Figures do not apply to Flash. Contradicts §2.1 |
| 6 | Recommended setup | "16-GPU machine" | Oversized for Flash. 16 GPUs is a **Pro multi-node** requirement |
| 7 | Coding performance | "Flash is top-tier for coding" | Model card applies that label to **V4-Pro-Max**. Flash-Max is LiveCodeBench 91.6 (Pro-Max 93.5) |
| 8 | Chat template | `apply_chat_template` example | **Model card explicitly states no Jinja template.** Must use `encoding_dsv4` — v1 code does not work |
| 9 | Sampling | temperature 0.7 / top_p 0.9 | Official recommendation is **1.0 / 1.0** |
| 10 | vLLM | `--enforce-eager` | Disables CUDA graphs and sharply reduces production throughput. Removed |
| 11 | Reasoning modes | Not documented | **Non-think / Think High / Think Max three modes** are central to V4 usage. Completely missing in v1 |
| 12 | DSpark | Not documented | Released 2026-06-27. **60–85% higher per-user generation speed** vs MTP-1, lossless |
| 13 | Claude Code | `api.deepseek.com/v1` | Wrong. Anthropic-compatible endpoint is **`/anthropic`**, model ID is `deepseek-v4-pro[1m]` |
| 14 | Legacy API | Not documented | `deepseek-chat` / `deepseek-reasoner` **ended 2026-07-24 15:59 UTC** (already past) |
| 15 | Korean | "Benchmarks not published" | No DeepSeek official Korean benchmarks, but **third-party (Upstage) evaluation averages 84.9** — changes Korea adoption calculus |
| 16 | GGUF | Table stated as confirmed fact | Community builds, **unverified vs official checkpoints**. Wording softened |
| 17 | Training specs | Partially documented | 32T tokens / Muon optimizer / 2-stage post-training (per-domain expert training → on-policy distillation merge) |
| 18 | Output limit | Not documented | Max output **384K tokens**. Think Max recommends context window **≥384K** |

---

## 1. Project Background

**DeepSeek-V4** is an open-weight MoE model family released by China's DeepSeek in late April 2026. The technical report title states the design intent plainly — *Towards Highly Efficient Million-Token Context Intelligence*. The goal is to make **1M-token context economically viable**.

> **Release date note**: Sources disagree (April 22, 23, 24, 27). HF paper publication is April 26. This document uses "late April 2026"; confirm exact dates via DeepSeek official channels if needed.

### 1.1 Three Official Architecture Upgrades

| Item | Details |
|---|---|
| **Hybrid Attention** | CSA + HCA combined. At 1M context, V4-Pro achieves **27% single-token inference FLOPs and 10% KV cache vs V3.2** |
| **mHC** | Manifold-Constrained Hyper-Connections. Strengthens residual connections for more stable inter-layer signal propagation while preserving expressiveness |
| **Muon Optimizer** | Improved convergence speed and training stability |

CSA+HCA replaces V3.2's MLA (Multi-head Latent Attention). The idea is to bypass quadratic attention growth via compression; **reducing KV cache to one-tenth is essentially the entire economic story of this model**.

### 1.2 Training Pipeline

- Pre-training: **32T+** high-quality tokens
- Two-stage post-training:
  1. **Individually train** per-domain expert models (SFT + GRPO-based RL)
  2. Merge into a single model via **on-policy distillation**

This "train separately, then merge" structure likely explains V4's relatively small domain variance.

### 1.3 Model Lineup

| Model | Total Params | Active | Context | Precision |
|---|---|---|---|---|
| DeepSeek-V4-Flash-Base | 284B | 13B | 1M | FP8 Mixed |
| DeepSeek-V4-Flash | 284B | 13B | 1M | FP4 + FP8 Mixed* |
| DeepSeek-V4-Pro-Base | 1.6T | 49B | 1M | FP8 Mixed |
| DeepSeek-V4-Pro | 1.6T | 49B | 1M | FP4 + FP8 Mixed* |

\* MoE expert parameters in FP4; most other weights in FP8

Derived checkpoints: `DeepSeek-V4-Pro-DSpark`, `DeepSeek-V4-Flash-DSpark` (§2.5), `nvidia/DeepSeek-V4-Pro-NVFP4`

### 1.4 Reasoning Modes (Core to V4 Usage)

| Mode | Characteristics | Use case | Response format |
|---|---|---|---|
| **Non-think** | Fast intuitive response | Daily work, low-risk decisions | `</think>` summary |
| **Think High** | Deliberate logical analysis, slower but accurate | Complex problem solving, planning | `<think>` reasoning `</think>` summary |
| **Think Max** | Maximum reasoning extension | Exploring model reasoning limits | Special system prompt + `<think>` reasoning `</think>` summary |

**Mode choice dominates performance.** Below are results on the same model with only the mode changed.

| Benchmark | Flash Non-Think | Flash Max | Pro Non-Think | Pro Max |
|---|---|---|---|---|
| HLE | 8.1 | 34.8 | 7.7 | **37.7** |
| LiveCodeBench | 55.2 | 91.6 | 56.8 | **93.5** |
| Apex | 1.0 | 33.0 | 0.4 | **38.3** |
| MRCR 1M | 37.5 | 78.7 | 44.7 | **83.5** |
| BrowseComp | – | 73.2 | – | **83.4** |

The gap between Non-think and Max is 36 points on LiveCodeBench and 32 on Apex. **Choosing the wrong mode costs more than switching models.**

---

## 2. Strengths

### 2.1 Long-Context Economics — The Essence of This Model

10% KV cache and 27% inference FLOPs vs V3.2. The differentiator is not "supports 1M context" but **"supports 1M at a bearable cost."** Flash's full 1M KV cache is ~10GB, so on top of 158GB weights it still fits on 2×H200.

### 2.2 MIT License — Practically the Biggest Strength

No restrictions on weights, derivative models, redistribution, or commercial use. No model-name prefix or attribution requirements. Compared to Upstage Solar License (naming/attribution obligations) or Llama-family licenses, **friction for embedding in your own branded product is zero**.

From an enterprise perspective this can matter more than benchmark scores. It is the only quasi-frontier class with effectively no legal review burden.

### 2.3 Flash Self-Hosting Fit

Flash 284B-A13B at **FP4+FP8 ~158GB**; with 1M context KV and runtime overhead ~170–175GB total. **2×H200 (282GB)** fits comfortably. Practitioners commonly estimate ~85–95% of Pro quality at far lower infrastructure.

### 2.4 Overwhelming API Pricing

| Model | Input (cache miss) | Output | Input (cache hit) |
|---|---|---|---|
| DeepSeek-V4-Pro | $0.435 / 1M | $0.87 / 1M | $0.003625 / 1M |
| DeepSeek-V4-Flash | $0.14 / 1M | $0.28 / 1M | $0.0028 / 1M |

As of May 22, 2026, V4-Pro's 75% discount became the standing price. **Cache-hit input at $0.003625/1M** is especially important — input cost effectively vanishes for agent workloads reusing the same system prompt.

### 2.5 DSpark — Serving Optimization (2026-06-27)

Not a new model — **draft modules attached to existing V4 weights**. Official cards state "not a new model."

| Item | Details |
|---|---|
| Method | Parallel draft backbone + small sequential head, confidence head and load-aware scheduler |
| Effect | **60–85% higher per-user generation speed vs MTP-1**, lossless output |
| Throughput | +51% / +52% total throughput at 80 tok/s/user (Flash) · 35 tok/s/user (Pro) |
| High-speed case | +661% / +406% at 120 tok/s/user · 50 tok/s/user |
| Checkpoints | `DeepSeek-V4-Pro-DSpark`, `DeepSeek-V4-Flash-DSpark` (MIT) |
| Code | DeepSpec (github.com/deepseek-ai/DeepSpec, MIT) |

**Note**: 60–85% is vs **DeepSeek's own MTP-1**, not naive decoding. No guarantee of reproduction on other serving stacks; no independent replication reports as of early July 2026.

### 2.6 Agent Tool Ecosystem Integration

Official Anthropic-compatible endpoint connects Claude Code, OpenCode, Copilot Chat, Cline, etc. without a proxy. The `awesome-deepseek-agent` repo documents official setup for 20 coding tools.

### 2.7 Base Model Release

`V4-Pro-Base` and `V4-Flash-Base` enable **continued pretraining.** A decisive difference from instruct-only releases; if you plan serious domain-specific models, this alone can be the selection reason.

---

## 3. Weaknesses and Limitations

### 3.1 Pro Is Effectively Cluster-Only

| Configuration | Requirement |
|---|---|
| V4-Pro weights | ~862GB (HF listing) / vLLM recommended recipe ~960GB footprint |
| Single node | **8×H200 141GB (1,128GB)** or B300 8-GPU node |
| Multi-node | 16×H100 80GB across 2 nodes + NVLink/InfiniBand |
| 8×H100 80GB | **Not viable** (640GB insufficient) |

Quantization does not fully solve this. Even at Q4 ~430GB, adding 1M KV exceeds 8×H100 again. **No quantization level makes Pro a workstation model — only a slightly smaller cluster model.**

### 3.2 No Chat Template — Biggest Integration Trap

Model cards state: **this release does not include a Jinja chat template.** Use Python scripts in the `encoding` folder (`encoding_dsv4`) to encode messages and parse output.

If your pipeline depends on `tokenizer.apply_chat_template()`, that code will not work. vLLM/SGLang handle this internally, but Transformers direct use or custom serving requires **implementing the encoding layer yourself.**

### 3.3 Asymmetric Official Multilingual Information

DeepSeek official benchmarks center on English and Chinese (C-Eval, CMMLU, Chinese-SimpleQA). No Korea/Japan-specific benchmarks published. Indirect evidence: Base MultiLoKo (multilingual) improved V3.2 38.7 → Flash 42.2 → Pro 51.1.

**This does not mean "cannot do Korean."** See §5.

### 3.4 Serving Stack Constraints

| Stack | Status |
|---|---|
| vLLM | Native support v0.22.0, production hardening v0.23.0 |
| SGLang | Day-0 official support. MegaMoE is **Blackwell-only (B200/B300/GB200/GB300)** |
| TGI | Not supported at preview time |
| Ollama / llama.cpp | **Community GGUF only, unverified vs official checkpoints** |

Also, as of May 2026, **multiple reports of vLLM Inductor compile-path crashes on RTX Pro 6000 Blackwell.** Verify current vLLM/driver state before buying that hardware — memory may be sufficient while software path is unstable.

### 3.5 Flash Performance Ceiling

Flash-Max approaches Pro-level reasoning with large thinking budget, but **lags Pro on pure knowledge work and the most complex agent workflows** — acknowledged on the model card.

SimpleQA-Verified: Flash-Max 34.1 vs Pro-Max 57.9 — a 23.8-point gap. **Flash is risky when factual accuracy matters.**

### 3.6 Geopolitical / Regulatory Risk (Hosted API Only)

DeepSeek **hosted services/apps/API** are banned or restricted on government devices in many countries. Korea's PIPC suspended the app in 2025 over cross-border data transfer and issued corrective orders; many ministries, public agencies, and financial firms blocked access. The US federal government and many states banned government-device use; legislation introduced. Japan, Australia, Taiwan, Italy, and others took similar measures.

**Key distinction**: These rules target **hosted services with data sent to China**, not **running MIT-licensed weights on your own infrastructure.** This distinction underpins §9–11 business scenarios.

Some organizations may exclude "China-origin models" in procurement regardless — verify in advance.

### 3.7 Preview Status

Model cards label themselves preview. Quality may change at GA — use preview baselines as **evaluation reference lines, not final deliverable quality guarantees.**

---

## 4. Benchmarks (Official Model Card)

### 4.1 V4-Pro-Max vs Frontier Models

| Benchmark | Opus-4.6 Max | GPT-5.4 xHigh | Gemini-3.1-Pro High | K2.6 Thinking | GLM-5.1 Thinking | **DS-V4-Pro Max** |
|---|---|---|---|---|---|---|
| **Knowledge & Reasoning** | | | | | | |
| MMLU-Pro | 89.1 | 87.5 | **91.0** | 87.1 | 86.0 | 87.5 |
| SimpleQA-Verified | 46.2 | 45.3 | **75.6** | 36.9 | 38.1 | 57.9 |
| Chinese-SimpleQA | 76.4 | 76.8 | **85.9** | 75.9 | 75.0 | 84.4 |
| GPQA Diamond | 91.3 | 93.0 | **94.3** | 90.5 | 86.2 | 90.1 |
| HLE | 40.0 | 39.8 | **44.4** | 36.4 | 34.7 | 37.7 |
| LiveCodeBench | 88.8 | – | 91.7 | 89.6 | – | **93.5** |
| Codeforces (Rating) | – | 3168 | 3052 | – | – | **3206** |
| HMMT 2026 Feb | 96.2 | **97.7** | 94.7 | 92.7 | 89.4 | 95.2 |
| IMOAnswerBench | 75.3 | **91.4** | 81.0 | 86.0 | 83.8 | 89.8 |
| Apex | 34.5 | 54.1 | **60.9** | 24.0 | 11.5 | 38.3 |
| Apex Shortlist | 85.9 | 78.1 | 89.1 | 75.5 | 72.4 | **90.2** |
| **Long Context** | | | | | | |
| MRCR 1M | **92.9** | – | 76.3 | – | – | 83.5 |
| CorpusQA 1M | **71.7** | – | 53.8 | – | – | 62.0 |
| **Agent** | | | | | | |
| Terminal Bench 2.0 | 65.4 | **75.1** | 68.5 | 66.7 | 63.5 | 67.9 |
| SWE Verified | **80.8** | – | 80.6 | 80.2 | – | 80.6 |
| SWE Pro | 57.3 | 57.7 | 54.2 | **58.6** | 58.4 | 55.4 |
| SWE Multilingual | **77.5** | – | – | 76.7 | 73.3 | 76.2 |
| BrowseComp | 83.7 | 82.7 | **85.9** | 83.2 | 79.3 | 83.4 |
| HLE w/ tools | 53.1 | 52.0 | 51.6 | **54.0** | 50.4 | 48.2 |
| GDPval-AA (Elo) | 1619 | **1674** | 1314 | 1482 | 1535 | 1554 |
| MCPAtlas Public | **73.8** | 67.2 | 69.2 | 66.6 | 71.8 | 73.6 |
| Toolathlon | 47.2 | **54.6** | 48.8 | 50.0 | 40.7 | 51.8 |

**Interpretation**
- **Coding is #1.** LiveCodeBench 93.5, Codeforces 3206 beat closed frontiers — V4-Pro's strongest evidence.
- **MCPAtlas 73.6 is effectively tied with Opus-4.6 (73.8).** Rare case of open weight matching closed on MCP agents.
- **SimpleQA-Verified 57.9 trails Gemini (75.6) badly.** Unsuitable for factual lookup without RAG.
- **Long-context measured scores underwhelm.** MRCR 1M 83.5, CorpusQA 1M 62.0 vs Opus-4.6 (92.9 / 71.7). **"Can fit 1M" ≠ "reads accurately."**
- Apex 38.3 trails Gemini (60.9) and GPT-5.4 (54.1) substantially.

### 4.2 Mode Comparison (Flash vs Pro)

| Benchmark | Flash Non-Think | Flash High | Flash Max | Pro Non-Think | Pro High | Pro Max |
|---|---|---|---|---|---|---|
| MMLU-Pro | 83.0 | 86.4 | 86.2 | 82.9 | 87.1 | **87.5** |
| SimpleQA-Verified | 23.1 | 28.9 | 34.1 | 45.0 | 46.2 | **57.9** |
| Chinese-SimpleQA | 71.5 | 73.2 | 78.9 | 75.8 | 77.7 | **84.4** |
| GPQA Diamond | 71.2 | 87.4 | 88.1 | 72.9 | 89.1 | **90.1** |
| HLE | 8.1 | 29.4 | 34.8 | 7.7 | 34.5 | **37.7** |
| LiveCodeBench | 55.2 | 88.4 | 91.6 | 56.8 | 89.8 | **93.5** |
| Codeforces | – | 2816 | 3052 | – | 2919 | **3206** |
| HMMT 2026 Feb | 40.8 | 91.9 | 94.8 | 31.7 | 94.0 | **95.2** |
| Apex | 1.0 | 19.1 | 33.0 | 0.4 | 27.4 | **38.3** |
| MRCR 1M | 37.5 | 76.9 | 78.7 | 44.7 | 83.3 | **83.5** |
| CorpusQA 1M | 15.5 | 59.3 | 60.5 | 35.6 | 56.5 | **62.0** |
| Terminal Bench 2.0 | 49.1 | 56.6 | 56.9 | 59.1 | 63.3 | **67.9** |
| SWE Verified | 73.7 | 78.6 | 79.0 | 73.6 | 79.4 | **80.6** |
| SWE Pro | 49.1 | 52.3 | 52.6 | 52.1 | 54.4 | **55.4** |
| BrowseComp | – | 53.5 | 73.2 | – | 80.4 | **83.4** |
| MCPAtlas | 64.0 | 67.4 | 69.0 | 69.4 | **74.2** | 73.6 |
| Toolathlon | 40.7 | 43.5 | 47.8 | 46.3 | 49.0 | **51.8** |

**The most important table for practitioners.**

- **Flash High is the cost-performance sweet spot.** MMLU-Pro 86.4 beats Flash Max (86.2); LiveCodeBench 88.4 is only 3.2 below Max (91.6) at much lower token cost.
- **MCPAtlas: Pro High (74.2) > Pro Max (73.6).** Excessive reasoning hurts tool calling. **Fix agent orchestration to High.**
- **Do not use Non-think for coding, math, or agents.** LiveCodeBench 55.2, Apex 1.0, HLE 8.1 — effectively useless. Non-think is for classification, summarization, routing only.
- **SWE Verified: Flash High 78.6 vs Pro Max 80.6 — 2-point gap.** Flash is enough for code-fix tasks.

### 4.3 Base Models (Pre-training Quality)

| Benchmark | V3.2-Base | V4-Flash-Base | V4-Pro-Base |
|---|---|---|---|
| MMLU (5-shot) | 87.8 | 88.7 | **90.1** |
| MMLU-Pro (5-shot) | 65.5 | 68.3 | **73.5** |
| MMMLU (5-shot) | 87.9 | 88.8 | **90.3** |
| C-Eval (5-shot) | 90.4 | 92.1 | **93.1** |
| CMMLU (5-shot) | 88.9 | 90.4 | **90.8** |
| **MultiLoKo (multilingual)** | 38.7 | 42.2 | **51.1** |
| Simple-QA verified | 28.3 | 30.1 | **55.2** |
| FACTS Parametric | 27.1 | 33.9 | **62.6** |
| SuperGPQA | 45.0 | 46.5 | **53.9** |
| HumanEval | 62.8 | 69.5 | **76.8** |
| BigCodeBench | **63.9** | 56.8 | 59.2 |
| MATH | 60.5 | 57.4 | **64.5** |
| LongBench-V2 | 40.2 | 44.7 | **51.5** |

**MultiLoKo 51.1 (Pro) is +12.4 vs V3.2** — among the largest gains. Signals real multilingual improvement across generations.

Caveat: **V4-Flash-Base trails V3.2-Base on BigCodeBench and MATH** — cost of active params 37B → 13B. Uncritical Flash-as-V3.2-replacement can regress.

---

## 5. Korean and Japanese Performance — No Official Data, Third-Party Data Exists

DeepSeek has not published Korean benchmarks. However, **Upstage evaluated DeepSeek-V4-Flash as a comparator when announcing Solar Open 2 (2026-07-22).** As a competitor's table meant to highlight their model, there is little incentive to inflate V4-Flash.

| Korean Benchmark | DeepSeek-V4-Flash | Solar Open 2 | GPT-5.4 mini | Claude Haiku 4.5 |
|---|---|---|---|---|
| KMMLU-Pro | **78.9** | 78.4 | 78.1 | 67.9 |
| CLIcK | 89.2 | **90.7** | 89.6 | 53.5 |
| HAE-RAE v1.1 | 73.1 | **73.8** | 69.4 | 38.5 |
| Ko-AIME'25 | **98.0** | 97.7 | 90.7 | 81.7 |
| HRM8K | **93.4** | 92.2 | 91.3 | 90.6 |
| KBank-MMLU (finance) | 79.5 | **80.8** | 79.0 | 68.9 |
| KBL (legal) | 72.8 | **75.5** | 75.3 | 69.9 |
| KorMedMCQA | 94.1 | 93.0 | **94.2** | 87.0 |
| Ko-GDPval | 85.0 | **86.8** | 59.4 | 68.3 |
| **Korean average** | 84.9 | **85.4** | 80.8 | 69.6 |

Also, **DeepSeek-V4-Pro (1.6T) scored 86.91 on Ko-GDPval**, narrowly ahead of Solar Open 2 (86.75).

**The conclusion flips.** v1's "insufficient Korean performance info → fine-tuning required for Korea" is wrong. **DeepSeek-V4-Flash is within 0.5 points of Korea-optimized models on Korean average.** Korean math (Ko-AIME 98.0, HRM8K 93.4) and general knowledge (KMMLU-Pro 78.9) actually lead.

**Japanese** still has no public data. Nejumi leaderboard or self-run JMMLU needed.

**Korean practical notes**
- Tokenizer is not Korean-optimized — **higher token cost than Korean-specialized models.** Measure cost even if quality is comparable
- Korean document formats and administrative idioms may be underrepresented. Ko-GDPval 85.0 is still strong; few-shot in-house format injection is essential
- Response bias reported on Chinese political/historical topics — validate if your domain touches them

---

## 6. Competing Projects

### 6.1 Solar Open 2 (Upstage, 250B-A15B)

| Item | **DeepSeek-V4-Flash** | **Solar Open 2** |
|---|---|---|
| Developer | DeepSeek (China) | Upstage (Korea) |
| Total / Active | 284B / 13B | 250B / 15B |
| Release | Late April 2026 | 2026-07-22 |
| Context | 1M | 1M |
| **License** | **MIT (unrestricted)** | Upstage Solar License (naming/attribution) |
| Base released | **Yes** | No |
| Hardware | 2×H200 (FP4+FP8) | 4×H200 (BF16) / 2×H200 (quantized) |
| Korean average | 84.9 | **85.4** |
| MMLU-Pro | 85.9 | **86.2** |
| LiveCodeBench | 92.3 | **92.4** |
| SWE-Bench Verified | **73.8** | 70.4 |
| MCP-Atlas | 58.2 | 58.2 |
| Terminal Bench Hard | **34.1** | 28.3 |
| τ³ (banking) | **22.3** | 19.6 |
| APEX-Agents | 13.2 | **16.6** |

**Honest conclusion**: Performance is comparable; Korean gap is 0.5 points. Solar Open 2 leads on APEX-Agents, Korean token efficiency (50–80% vs global), and Korean business context training. DeepSeek-V4-Flash leads on **MIT license, Base release, agent coding (SWE·Terminal), lower active params**.

Korean enterprise choice splits on other axes — **domestic procurement → Solar; license freedom and fine-tuning flexibility → DeepSeek; China-exclusion policy → Solar.**

### 6.2 Kimi K3 (Moonshot AI, 2.8T)

| Item | DeepSeek-V4-Pro | Kimi K3 |
|---|---|---|
| Total params | 1.6T | **2.8T** |
| Active | 49B | 16 experts active (of 896) |
| Release | Late April 2026 | API 7/16, weights **2026-07-27** |
| License | MIT | Modified MIT |
| Multimodal | Text | **Native vision** |
| Context | 1M | 1M |
| API price | $0.435 / $0.87 | $3 / $15 |
| Reasoning | 3 selectable modes | thinking always on |

Per model card vs K2.6 Thinking: V4-Pro-Max leads LiveCodeBench (93.5 vs 89.6), MCPAtlas (73.6 vs 66.6); trails SWE Pro (55.4 vs 58.6), HLE w/tools (48.2 vs 54.0). K3 is one generation ahead — re-evaluate after weight release.

**Price gap is decisive.** V4-Pro is ~1/7–1/17 of K3. For most production workloads not needing absolute frontier peak, V4-Pro economics dominate.

### 6.3 V4-Pro vs V4-Flash Selection

| Condition | Recommendation |
|---|---|
| Factual accuracy matters (SimpleQA 57.9 vs 34.1) | **Pro** |
| Code fix / test pass (SWE 80.6 vs 79.0) | **Flash** — 1.6-point gap, 5× infrastructure |
| Long-context accuracy (MRCR 83.5 vs 78.7) | Pro |
| MCP tool calling (74.2 vs 69.0) | Pro High |
| Browsing agent (83.4 vs 73.2) | **Pro** — 10-point gap |
| Self-hosting budget constrained | **Flash** |
| Classification / routing / summarization | Flash Non-think |

General rule: **Default Flash High; route SimpleQA·BrowseComp-type tasks to Pro.** DeepSeek's official Claude Code recipe uses exactly this (main Pro, sub-agent Flash).

---

## 7. Getting Started

### 7.1 Hardware Requirements

| Model | Precision | Weights | Total VRAM budget | Configuration |
|---|---|---|---|---|
| **V4-Flash** | FP4+FP8 | ~158GB | ~170–175GB | **2×H200** or 4×A100 80GB |
| V4-Flash | Community INT4 | ~90GB | – | 4×RTX 4090 (unverified) |
| **V4-Pro** | FP4+FP8 | ~862GB | ~960GB | **8×H200 141GB single node** or B300 8-GPU |
| V4-Pro | Multi-node | – | – | 16×H100 80GB 2-node + IB |

- System RAM: 256GB+ for Flash; NVMe storage 500GB+
- vLLM tensor parallel optimal at powers of 2 (1/2/4/8). 2×A100 (160GB) insufficient for 1M context — prefer 4×A100
- **V4-Pro does not fit on 8×H100 80GB (640GB)**

### 7.2 Chat Encoding (Required Prerequisite)

**This release has no Jinja chat template.** Use scripts in the `encoding` folder.

```python
from encoding_dsv4 import encode_messages, parse_message_from_completion_text
import transformers

messages = [
    {"role": "user", "content": "hello"},
    {"role": "assistant", "content": "Hello! I am DeepSeek.", "reasoning_content": "thinking..."},
    {"role": "user", "content": "1+1=?"},
]

# messages -> string
prompt = encode_messages(messages, thinking_mode="thinking")

# string -> tokens
tokenizer = transformers.AutoTokenizer.from_pretrained("deepseek-ai/DeepSeek-V4-Pro")
tokens = tokenizer.encode(prompt)
```

In multi-turn dialogue, preserve prior turns' `reasoning_content`.

### 7.3 vLLM Serving (Recommended)

```bash
# vLLM v0.23.0+ recommended (native from v0.22.0)
pip install -U vllm

# V4-Flash: 2×H200, 1M context
vllm serve deepseek-ai/DeepSeek-V4-Flash \
  --served-model-name deepseek-v4-flash \
  --tensor-parallel-size 2 \
  --max-model-len 1048576 \
  --enable-expert-parallel

# Conservative start (4×A100, 128K context)
vllm serve deepseek-ai/DeepSeek-V4-Flash \
  --tensor-parallel-size 4 \
  --max-model-len 131072
```

```bash
# V4-Pro: 8×H200
vllm serve deepseek-ai/DeepSeek-V4-Pro \
  --served-model-name deepseek-v4-pro \
  --tensor-parallel-size 8 \
  --enable-expert-parallel \
  --max-model-len 393216   # Think Max recommends ≥384K
```

> v1's `--enforce-eager` was removed. It disables CUDA graphs and sharply cuts production throughput.

### 7.4 SGLang Serving

```bash
pip install sglang

python3 -m sglang.launch_server \
    --model-path deepseek-ai/DeepSeek-V4-Flash \
    --host 0.0.0.0 --port 30000 \
    --tp 2 \
    --context-length 1048576
```

MegaMoE backend (higher throughput with negligible accuracy loss, Pro GPQA ~89.5) is **Blackwell-only (B200/B300/GB200/GB300).** Not available on Hopper (H100/H200).

### 7.5 DSpark Deployment

```bash
# Existing weights + draft module. Not a separate model
vllm serve deepseek-ai/DeepSeek-V4-Flash-DSpark \
  --tensor-parallel-size 2 \
  --max-model-len 1048576 \
  --enable-expert-parallel
```

Same output distribution — throughput gain without quality regression. Still measure whether 60–85% reproduces on your stack.

### 7.6 Sampling Parameters

| Parameter | Official recommendation | Notes |
|---|---|---|
| temperature | **1.0** | v1's 0.7 was wrong |
| top_p | **1.0** | v1's 0.9 was wrong |
| max output | up to 384K | |
| context (Think Max) | **≥384K** | Truncation mid-reasoning if insufficient |

### 7.7 API Usage (Without Self-Hosting)

```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [{"role": "user", "content": "Explain this"}],
    "thinking": true
  }'
```

- Supports both OpenAI ChatCompletions and Anthropic formats
- Thinking mode controlled via `thinking` parameter, not model ID
- **Legacy `deepseek-chat` / `deepseek-reasoner` ended 2026-07-24 15:59 UTC** — returns HTTP 400. Switch to `deepseek-v4-flash` / `deepseek-v4-pro`
- **Hosted API sends data to China.** Do not use for sensitive information (§3.6)

### 7.8 Claude Code Integration (Official)

```bash
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_AUTH_TOKEN=<your DeepSeek API Key>
export ANTHROPIC_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_OPUS_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_SONNET_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-v4-flash
export CLAUDE_CODE_SUBAGENT_MODEL=deepseek-v4-flash
export CLAUDE_CODE_EFFORT_LEVEL=max
cd /path/to/project && claude
```

> v1's `api.deepseek.com/v1` is wrong. Anthropic path is **`/anthropic`**; `[1m]` suffix is DeepSeek's 1M context modifier — keep as documented. Gateways may need suffix normalization for billing.

**For self-hosted vLLM**, replace the URL with your internal endpoint — standard path in regulated environments.

### 7.9 GGUF / Local Run (Unverified)

Community GGUF exists for llama.cpp/Ollama but is **unverified vs official checkpoints.** Experiments only; production should use vLLM or SGLang. Mainline support varies — verify current state before adoption.

---

## 8. Key Use Cases

### 8.1 Full-Repository Code Agent — Strongest Area

LiveCodeBench 93.5, Codeforces 3206 beat closed frontiers. With 1M context, **loading an entire monolithic legacy codebase for refactoring** is viable.

```bash
# Claude Code on internal vLLM
export ANTHROPIC_BASE_URL=http://gpu-node.internal:8000
export ANTHROPIC_AUTH_TOKEN=dummy
export ANTHROPIC_MODEL=deepseek-v4-pro
export ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-v4-flash
export CLAUDE_CODE_SUBAGENT_MODEL=deepseek-v4-flash
cd ~/legacy-erp && claude
```

**Cost design is key.** Orchestration on Pro, sub-agents on Flash — minimal quality loss, large cost drop. SWE Verified Flash High 78.6 vs Pro Max 80.6 — no reason for Pro on sub-agents.

### 8.2 1M Context Document Analysis — With Verification

```python
from openai import OpenAI
client = OpenAI(api_key="EMPTY", base_url="http://localhost:8000/v1")

resp = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[{"role": "user", "content": f"""
Below are the full main contract, three supplementary agreements, and internal standard contract guidelines.

{full_documents}

1. List all conflicting clauses across documents with clause numbers
2. Clauses violating standard guidelines and reasons
3. Risk grade per clause and negotiation priority

Do not speculate without evidence; cite original clause text.
"""}],
    temperature=1.0, top_p=1.0, max_tokens=131072,
)
```

**Must-state limits**: MRCR 1M 83.5, CorpusQA 1M 62.0 — below Opus-4.6 (92.9 / 71.7). **Fitting in context does not guarantee accurate reading.**

Practical guidance:
- Operate at **200–400K**, not full 1M
- **Cross-verify critical clauses with two independent queries**
- Run your own needle-in-haystack tests first

### 8.3 MCP-Based Agent Orchestration

MCPAtlas Public 73.6 ties Opus-4.6 (73.8) — top among open weights.

```python
resp = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[...],
    tools=mcp_tools,
    extra_body={"thinking": True},   # Think High
)
```

**Use Think High.** MCPAtlas Pro High 74.2 > Pro Max 73.6 — max reasoning hurts. Excessive deliberation increases tool-call errors.

### 8.4 Factual Lookup Workloads — Prohibited or RAG Required

SimpleQA-Verified: Pro-Max 57.9, Flash-Max 34.1 — far below Gemini-3.1-Pro (75.6).

**Flash factual Q&A may be wrong two-thirds of the time.** Internal knowledge Q&A, regulation lookup, customer support must use RAG and system prompts that refuse unsupported answers.

```python
SYSTEM = """Never answer content not grounded in provided documents.
If no evidence exists, respond 'Information not found.'
Cite source document and page for every stated fact."""
```

### 8.5 Domain-Specific Continued Pretraining

**Base model release enables this scenario.** MIT license — no derivative naming or attribution obligations.

```
V4-Flash-Base → continued pretraining on domestic finance rules/terms → own-brand model
V4-Flash-Base → continued pretraining on Japanese corpus → Japanese-specialized model
V4-Flash-Base → internal codebase + technical docs → org-specific coding model
```

284B-A13B is near the practical upper bound for continued pretraining. 1.6T Pro-Base training infrastructure is effectively national-scale.

### 8.6 Cost-Optimized Routing

```python
def route(task_type: str) -> dict:
    return {
        "classify":   {"model": "deepseek-v4-flash", "thinking": False},
        "summarize":  {"model": "deepseek-v4-flash", "thinking": False},
        "code_fix":   {"model": "deepseek-v4-flash", "thinking": True},
        "code_arch":  {"model": "deepseek-v4-pro",   "thinking": True},
        "tool_agent": {"model": "deepseek-v4-pro",   "thinking": True},   # not Max
        "fact_query": {"model": "deepseek-v4-pro",   "thinking": True},   # + RAG
        "browse":     {"model": "deepseek-v4-pro",   "thinking": True},
    }[task_type]
```

Cache-hit input at $0.003625/1M — **fix system prompts and maximize prefix caching** to nearly eliminate input cost. Largest effect on agent workloads.

---

## 9. Korea Market Adoption Scenarios

### 9.0 Prerequisite: Understand Regulatory Scope Precisely

In 2025 Korea's PIPC suspended DeepSeek's app over cross-border transfer and issued corrective orders; many ministries (Foreign Affairs, Defense, MOTIE), public agencies (KHNP, KEPCO KPS), and major financial firms blocked access. Kakao, LINE Yahoo, and other private IT firms banned business use.

**These measures target hosted services.** Running MIT weights on in-house GPUs sends no data abroad — the regulatory logic does not apply.

**Therefore the only legitimate Korea adoption path is self-hosting.** Treat API use as off the table.

Also acknowledge reality: some orgs penalize "China-origin model" in procurement regardless of technical validation — especially public, defense, and parts of finance. **Solar Open 2 is the alternative; performance gap is ~0.5 points.**

### 9.1 Software Development Organizations — Top Priority

| Item | Details |
|---|---|
| Target | Game studios, SI, platforms, startup dev teams |
| Rationale | LiveCodeBench 93.5 (#1), Codeforces 3206, SWE Verified 80.6, MIT license |
| Problem | No external source export, commercial assistant license cost, missing legacy documentation |
| Setup | In-house 2×H200 Flash + Claude Code/OpenCode. Pro on cloud GPU as needed |
| KPI | PR lead time, review findings, test coverage |
| Strength | **No regulatory gray zone.** No PII in code, self-hosted, MIT license |

Lowest political friction and highest confidence ROI for DeepSeek-V4 in Korea.

### 9.2 Financial Sector — Self-Hosted Back Office

| Item | Details |
|---|---|
| Rationale | KBank-MMLU 79.5, KBL 72.8, τ³ banking 22.3 (vs Solar 19.6), air-gapped fit |
| Setup | Internal 2×H200 Flash, fully blocked external comms |
| Output | Regulation Q&A (RAG required), review report drafts, code review |
| Risk | **SimpleQA 34.1 (Flash).** No finance regulation Q&A without RAG |
| Reality | Many banks already block DeepSeek access. Self-hosting still faces **high internal approval bar.** Pre-align with InfoSec: "running weights locally ≠ cross-border data transfer" |

### 9.3 Manufacturing / Logistics — On-Premises Docs and Code

| Item | Details |
|---|---|
| Rationale | 1M context, MIT license for own-brand embedding |
| Use | PLC/MES legacy code analysis, technical doc multilingualization (KO/EN/ZH), spec cross-check |
| Note | **Chinese capability (C-Eval 93.1, CMMLU 90.8) is a real asset for firms with China operations.** Solar Open 2 lacks Chinese |
| Risk | High IP sensitivity — fully closed network required |

### 9.4 Public / Defense — Not Recommended

Technically solvable via self-hosting, but **procurement policy and NIS security review make China-origin models nearly impossible.** Government requires NIS security review for AI in public IT projects.

Use Solar Open 2 or other domestic models.

### 9.5 Korea Scenario Priority

| Rank | Segment | Performance | Regulatory friction | Overall |
|---|---|---|---|---|
| 1 | Dev org coding agent | Very high | Low | **Strongly recommended** |
| 2 | Manufacturing on-prem (China-linked) | High | Medium | Recommended |
| 3 | Domain derivative model dev | High (Base released) | Low | Recommended |
| 4 | Finance back office | Medium | High | Conditional |
| 5 | Public / defense | – | Very high | Not recommended |

---

## 10. Japan Market Adoption Scenarios

### 10.0 Prerequisite: Unverified Japanese + On-Premises Preference

Japan structurally favors on-premises — MIT open weights fit well in principle. **No public Japanese performance evidence.** MultiLoKo 51.1 (Pro Base) is only indirect signal.

Japan is among countries reviewing DeepSeek regulation; LINE Yahoo banned employee business use.

**Required pre-work**
1. Self-measure on W&B Nejumi leaderboard basis
2. Self-measure JMMLU / JCommonsenseQA
3. Measure Japanese token efficiency (Chinese-optimized tokenizer may help kanji, hurt kana)
4. PoC on keigo and business idiom accuracy

Do not propose to Japanese customers without this validation.

### 10.1 Japan IT / SIer Coding Agent — Top Priority

| Item | Details |
|---|---|
| Rationale | Code is language-neutral — **only use case bypassing Japanese validation** |
| Target | SIers, internal IS departments, SaaS vendors |
| Problem | COBOL/legacy modernization, developer shortage, no external code export |
| Setup | On-prem 2×H200 Flash + Claude Code |
| Strength | SWE Multilingual 76.2 — strong on multilingual codebases including Japanese comments |

Only scenario immediately actionable in Japan.

### 10.2 Japanese-Specialized Derivative Model — Mid/Long-Term Strategy

**Base release + MIT license creates the opportunity.**

Same strategy as Upstage's Karakuri and Syn Pro (31B) on Solar for Nejumi #1 — executable on DeepSeek-V4-Flash-Base **without license constraints.** Solar License requires "Solar" prefix and "Built with Solar"; MIT requires nothing.

| Stage | Details |
|---|---|
| 1 | Continued pretraining V4-Flash-Base on Japanese corpus |
| 2 | SFT on Japanese business docs and keigo |
| 3 | Deploy under own brand (naming free) |
| Condition | 284B CPT needs substantial compute — consider Japan partners or SoftBank AI Cloud |

### 10.3 Japan Manufacturing — Conditional

| Item | Details |
|---|---|
| Rationale | On-prem fit, 1M context, Chinese for China factory coordination |
| Risk | Japanese manufacturing demands extreme document-format compliance — risky without Japanese validation |
| Approach | Start with code/design data analysis; Japanese doc generation after validation |

### 10.4 Japan Finance / Public — Not Recommended

Strong caution on China-origin models; long contract cycles. Low realism except joint derivative with Japan partner (§10.2).

### 10.5 Japan Scenario Priority

| Rank | Segment | Japanese dependency | Overall |
|---|---|---|---|
| 1 | Coding agent | Low | **Start immediately** |
| 2 | Japanese derivative model | – (direct improvement) | Mid/long-term top opportunity |
| 3 | Manufacturing design/code analysis | Low | Recommended |
| 4 | Japanese document work | High | After validation |
| 5 | Finance / public | High | Not recommended |

---

## 11. US Market Adoption Scenarios

### 11.0 Prerequisite: Most Complex Regulatory Landscape

Three layers in the US:

| Layer | Status |
|---|---|
| General consumers | No nationwide ban |
| Federal / state / defense / intelligence | **Banned on government devices/systems.** Commerce, Navy, NASA, Texas, New York, Virginia, Tennessee, etc. |
| Government contractors | May be bound by contract terms |
| Private enterprises | Own policies |

Federal legislation such as `No DeepSeek on Government Devices Act` (H.R.1121) progressed.

**Decisive distinction**: Rules target "DeepSeek application or successor applications/services" because **data is sent to China servers.** **Running MIT weights on US infrastructure involves no data transfer.**

NVIDIA ships `nvidia/DeepSeek-V4-Pro-NVFP4` and published on build.nvidia.com; Runpod, Spheron, and other US GPU clouds provide deployment guides. **Running V4 on US infrastructure is already standard practice.**

### 11.1 AI Startups — Changes Cost Structure

| Item | Details |
|---|---|
| Target | Seed–Series A, frontier API cost pressuring burn rate |
| Rationale | V4-Pro ~34× cheaper input, ~86× output vs Opus. MIT license |
| Setup | API initially → self-host after PMF |
| Caution | **Enterprise diligence will ask "China model?"** Prepare self-hosting architecture diagram |
| Strength | MIT — no legal friction on fine-tuning, redistribution, own branding |

### 11.2 Developer Tools / Coding SaaS

| Item | Details |
|---|---|
| Rationale | LiveCodeBench 93.5, Codeforces 3206, SWE Verified 80.6 |
| Economics | Coding agents burn extreme tokens — **34–86× price gap creates margin** |
| Setup | 8×H200 (Pro) or 2×H200 (Flash) in own VPC |
| Example | Morph already serves V4-Flash bf16 unquantized |
| Risk | Many serverless hosts quantize activations to fp8 — output differs from reference weights. **Self-serve if quality consistency matters** |

### 11.3 Regulated Industries (Healthcare / Finance) — VPC Deployment

| Item | Details |
|---|---|
| Rationale | HIPAA / SOC2 / GLBA require data cannot leave |
| Setup | Self-deploy in AWS/Azure/GCP VPC, block external egress |
| Economics | p5.48xlarge on-demand ~$55/h, 1-year reserved ~$33/h |
| **Cold calculation** | API break-even at **~3–4 billion tokens/day.** Single 8×H100 node cannot physically handle that |
| Conclusion | **Self-hosting is for data sovereignty / compliance / fine-tuning, not cost.** Cost-only justification fails diligence |

### 11.4 Federal Contractors / Public — Contract Review Required

Self-hosting is technically possible, but **contracts may exclude China-origin software.** Whether weights count as software varies by contract.

Do not proceed without legal review. If proceeding:
- Written pre-inquiry to Contracting Officer (CO)
- Document model origin, deployment architecture, data flows
- Parallel evaluation of alternatives (Llama, Mistral, GPT-OSS, etc.)

### 11.5 US Scenario Priority

| Rank | Segment | Economics | Regulatory friction | Overall |
|---|---|---|---|---|
| 1 | Coding SaaS / dev tools | Very high | Low | **Strongly recommended** |
| 2 | AI startup backend | Very high | Medium (diligence) | Recommended |
| 3 | Regulated industry VPC | Low (sovereignty goal) | Medium | Conditional |
| 4 | Federal contractor | – | High | Legal review required |
| 5 | Government direct | – | Prohibited | Not possible |

### 11.6 Three-Country Comparison Summary

| Axis | Korea | Japan | US |
|---|---|---|---|
| Regulatory nature | Cross-border PII + public blocks | Review stage + private bans | Government/contractor explicit bans |
| Self-hosting legitimacy | Holds | Holds | Holds (established practice) |
| Language evidence | **Third-party sufficient (84.9)** | **None (validation required)** | Not an issue |
| Best entry | Dev org coding | Coding + derivative dev | Coding SaaS |
| Biggest obstacle | China-exclusion sentiment | Japanese unverified | Enterprise diligence |
| Alternative | Solar Open 2 (comparable) | Syn Pro etc. | Llama, Mistral, GPT-OSS |

**Coding agent is #1 in all three markets** — no language validation needed, strongest performance evidence (LiveCodeBench #1), minimal PII/regulatory friction.

---

## 12. Adoption Decision Checklist

### 12.1 Technical Validation

- [ ] Measure Flash vs Pro quality gap on real tasks — try to disprove "Flash is enough for most"
- [ ] **Measure quality / cost / latency across modes (Non-think / High / Max)** — biggest lever
- [ ] Own needle-in-haystack at 1M context (meaning of MRCR 83.5 / CorpusQA 62.0)
- [ ] SimpleQA mitigation: RAG pipeline and refusal of unsupported answers
- [ ] `encoding_dsv4` integration — audit all `apply_chat_template` dependencies
- [ ] Measure Korean token efficiency (cost may differ despite comparable quality)
- [ ] For Japanese: self-evaluate Nejumi / JMMLU (required)
- [ ] Measure throughput before/after DSpark
- [ ] Check Chinese political/historical bias if applicable

### 12.2 Infrastructure

- [ ] vLLM v0.23.0+. SGLang MegaMoE Blackwell-only
- [ ] RTX Pro 6000 Blackwell: current Inductor compile issue status
- [ ] Pro: confirm 8×H200 single-node availability (8×H100 not viable)
- [ ] Serverless hosts: check fp8 activation quantization — output differs from reference
- [ ] Preview → GA re-evaluation plan
- [ ] Cache-hit optimization design (prefix caching)

### 12.3 Governance / Legal

- [ ] **Decide hosted API prohibition** — sensitive data has no alternative to self-hosting
- [ ] Check org procurement China-software exclusion
- [ ] (US) Federal contract clause review, CO pre-inquiry
- [ ] (Korea) Pre-align InfoSec: "local weights ≠ cross-border transfer"
- [ ] Enterprise customer diligence materials (deployment architecture, data flow)
- [ ] Include MIT license copy (only obligation)

### 12.4 Cost

- [ ] **Recalculate self-hosting break-even** — ~3–4B tokens/day vs API. Most orgs never reach it
- [ ] Document real self-hosting reason: sovereignty / compliance / fine-tuning / latency
- [ ] Measure per-mode token use and set routing policy

---

## 13. License

**MIT License.** Applies to repository and model weights.

| Item | Details |
|---|---|
| Commercial use | Free |
| Modification / fine-tuning | Free |
| Redistribution | Free |
| Derivative model naming | **No constraints** |
| Attribution | **None required** |
| Only obligation | Include license and copyright notice copy |

Most permissive vs Upstage Solar License (prefix/attribution), Llama Community License (user limits/attribution), Modified MIT (Kimi K3). **Alone sufficient reason if embedding in own-branded product.**

---

## 14. Citation

```bibtex
@misc{deepseekai2026deepseekv4,
      title={DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence},
      author={DeepSeek-AI},
      year={2026},
}
```

---

## 15. References

| Category | Link |
|---|---|
| V4-Pro model card | https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro |
| V4-Flash model card | https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash |
| V4-Pro-Base | https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base |
| V4-Flash-Base | https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base |
| DSpark checkpoint | https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-DSpark |
| DSpark (Flash) | https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-DSpark |
| NVIDIA NVFP4 quantization | https://huggingface.co/nvidia/DeepSeek-V4-Pro-NVFP4 |
| Technical report | https://arxiv.org/abs/2606.19348 |
| API documentation | https://api-docs.deepseek.com/ |
| Claude Code integration (official) | https://api-docs.deepseek.com/quick_start/agent_integrations/claude_code/ |
| Coding agent integration (official) | https://api-docs.deepseek.com/guides/coding_agents/ |
| SGLang deployment guide | https://lmsysorg.mintlify.app/cookbook/autoregressive/DeepSeek/DeepSeek-V4 |
| DeepSpec (spec decoding) | https://github.com/deepseek-ai/DeepSpec |

---

*Benchmark figures are from DeepSeek official model cards. Korean data is third-party evaluation published by Upstage at Solar Open 2 announcement — not DeepSeek official. Model cards state preview status; base adoption decisions on self-reproduction evaluation.*
