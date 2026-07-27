<!--
---
title: "Solar Open 2 (250B-A15B) Getting Started — Upstage Open-Weight Guide"
title_ko: "Solar Open 2 (250B-A15B) Getting Started — 업스테이지 오픈 웨이트 가이드"
subtitle: "Hybrid MoE for Agents · 1M context · H200 on-premises deployment"
description: "A TechDoc covering Upstage Solar Open 2 (250B-A15B) official specs, benchmarks, Docker/vLLM setup, quantization, and agent adoption checklists — including Agent-first design assumptions and v1 correction notes."
abstract: |
  Solar Open 2 is a Hybrid-Attention MoE open-weight model released by Upstage on 2026-07-22 (250B total, 15B active/token, 1M context).
  It targets Agentic Use (long-horizon, long-context, tool calling) and on-premises inference cost (H200×4 BF16 / ×2 with quantization) simultaneously.
  This document consolidates v1 error corrections, architecture, benchmarks, competing models (MiMo-V2.5, etc.), Docker/Transformers execution, and pre-adoption checklists based on the official model card and technical blog.
summary_for_ai: |
  Hands-on TechDoc for Upstage Solar Open 2 (250B-A15B), released 2026-07-22.
  Hybrid-Attention MoE, NoPE + linear attention, 1M context, Upstage Solar License.
  Benchmarks are vendor-reported; third-party verification still thin. Not investment advice.
  Verify current HF card, Docker flags, and quantization notes before citing.
date: 2026-07-27
updated: 2026-07-27
author: "Dennis Kim"
lang: en
tags:
  - Solar Open 2
  - Upstage
  - Open Weight
  - MoE
  - LLM
  - Agent
  - vLLM
  - English
keywords:
  - "Solar Open 2"
  - "250B-A15B"
  - "Upstage"
  - "open weight"
  - "Hybrid Attention MoE"
  - "1M context"
  - "H200"
  - "Agentic LLM"
group: llm-agents
featured: true
featured_rank: 3
schema_type: TechArticle
draft: false
robots: index,follow
---
-->

# Solar Open 2 (250B-A15B) Project Guide — Final Verified Edition

> **Document version** v2.0 (2026-07-27) · **Verification basis** Upstage official model card / technical blog (2026-07-22) / domestic and international press
> **Note** Benchmark figures are based on Upstage's own announcements; independent third-party verification (e.g., Artificial Analysis) has not yet accumulated. Read with the assumption that internal data reproduction evaluation is required for adoption decisions.

---

## 0. Major Corrections vs v1

| # | Item | v1 claim | Correction |
|---|---|---|---|
| 1 | Tokenizer | "Korean-only tokenizer" | Korean-**optimized** tokenizer. The model itself is multilingual (Korean, English, Japanese). Ranked #1 among 12 tokenizers on Korean office text; ~24% advantage over leading global models |
| 2 | NoPE | "NoPE enables 1M support" | NoPE is a design that **does not apply positional encoding to softmax attention layers**. 1M context is the result of Hybrid Attention (fixed-size state) + NoPE combined |
| 3 | Mistral comparison | "Overwhelming advantage on all major benchmarks" | **Inaccurate**. SWE-Bench is narrow (70.4 vs 69.6); Terminal Bench Hard favors Mistral (33.3) over Solar (28.3) |
| 4 | Competitor table | MiMo-V2.5 omitted | **MiMo-V2.5 (310B-A15B)** is the most direct competitor with identical active parameters. Must be included |
| 5 | Ko-GDPval | 86.8 (vs V4-Flash 85.0) | Correct but incomplete. Per the blog, **86.75 points — 0.16 points behind 1.6T DeepSeek-V4-Pro (86.91)** — that is the key message |
| 6 | Kimi K3 | "Active parameters undisclosed" | Per press reports: **16 active among 896 experts**, Modified MIT, multimodal, weights released 2026-07-27 |
| 7 | Docker execution | `--logits-processors` omitted | Required flag in the official recommended configuration. Omitting it changes template processing behavior |
| 8 | Reasoning parsing | Not documented | When using Transformers directly, manual separation at the `<|think:end|>` token is required |
| 9 | Training specs | Not documented | 12T tokens / NVIDIA B200 / 2M GPU-hours / vocab 196,608 |
| 10 | Quantization | "2× H200" | Official blog cites 2× H200. However, the Nota INT4-GlobalPruned card explicitly states **2× H100** serving — varies by configuration |

---

## 1. Project Background

**Solar Open 2** is an open-weight foundation model released by Upstage at the developer event "Solar Open Weight Day" on July 22, 2026. It is the second public release in the context of the government's sovereign AI foundation model initiative, distributed on Hugging Face under a license permitting commercial use.

The core design goal is **Agent, not Chat**. CEO Kim Sung-hoon explained the focus is not on models that converse well, but on the ability to complete assigned tasks end-to-end. Upstage defines three requirements for Agentic Use:

1. **Long-horizon task** — Complete work through dozens of reasoning and tool-call cycles
2. **Long-context** — Retain long documents and task history
3. **Instruction following & tool calling** — Follow instructions precisely and invoke tools reliably

A fourth practical requirement is added: **inference cost**. Agents repeat plan→execute→verify→revise cycles, consuming far more tokens than Chat. For enterprises deploying on their own infrastructure, the model must not be excessively large or slow — that is a design premise.

### 1.1 Architecture Specs (Official Model Card)

| Item | Value |
|---|---|
| Model name | Solar Open 2 (250B-A15B) |
| Architecture | Hybrid-Attention Mixture-of-Experts |
| Total parameters | 250B (250,287,794,944) |
| Active parameters | 15B / token |
| Layers | 48 |
| Hidden size | 4,096 |
| Attention pattern | `[Softmax, Linear×3] × 12` (75% of 48 layers are linear) |
| Attention heads | Softmax: 64 query / 8 KV (GQA), Linear: 64 query |
| Positional encoding | NoPE (no RoPE) |
| Expert count | 321 (routed 320 + shared 1) |
| Active experts | routed top-8 + shared 1 |
| Vocabulary | 196,608 |
| Context | 1M tokens |
| Pre-training tokens | ~12T |
| Training hardware | NVIDIA B200 |
| Training GPU hours | 2M GPU-hours |
| Official languages | Korean · English · Japanese |
| License | Upstage Solar License |
| Hardware requirements | Minimum H200 ×4 / Recommended H200 ×8 |

---

## 2. Strengths

### 2.1 Inference Efficiency — This Model's Practical Value Proposition

Of 250B total parameters, only 15B activate per token. More importantly, **only 12 of 48 layers (25%) maintain a KV cache**. Linear attention layers manage sequence information in a fixed-size state, so context length growth does not increase KV cache proportionally across all layers. Long-context memory is roughly 1/4 that of an equivalent all-softmax model.

As a result, BF16 runs on 4× H200, and quantization enables 2× H200. **The only near-frontier open-weight model where on-premises self-hosted deployment is realistically feasible** — that is the primary differentiator.

### 2.2 Training Efficiency — Selective Weight Transfer

Weights from the prior Solar Open 100B were selectively transferred where compatible with the new architecture for initialization. Per the model card, **transferred weights account for only 2.3%** of the total; the remainder was randomly initialized.

- 200B-A15B proxy experiment: tokens required to reach the same loss — random init ~22B → SWT ~12B (**~58% level**)
- Architecture validation: Solar Open 100B's all-softmax structure reached its MMLU performance with 671B tokens; Solar Open 2 architecture reached it with **210B tokens**

### 2.3 Agentic Use Optimization — Training Data Design

Rather than simple scenario generation, the distinguishing feature is training only on data that passed **verifiable environments**.

| Domain | Verification method |
|---|---|
| Search | Multi-stage validation of questions for structure, self-evidence, searchability, solvability, and source grounding |
| Tool calling | Not just appropriate tool selection — **verify results by reading state after actual environment changes** |
| Coding | After terminal tasks, self-generate and run tests; include fix-and-reverify loops in training data on failure |
| Office | Cross-check multiple documents and spreadsheets; recalculate after changing inputs on formula-bearing sheets — practical tasks. **Korean business-environment document scenarios reflected separately** |

The last item is practically important. The goal is not "generate Korean well" but "actually perform Korean-language business tasks."

### 2.4 Korean Token Efficiency

The same Korean text is processed in **~50–80% of the tokens** compared to global models. Ranked #1 among 12 tokenizers on Korean office business text; ~24% ahead of leading global models.

This is not a benchmark score but a **direct cost item**. If token consumption drops 30% for the same task, operating costs in Agent repeat-call environments drop 30% proportionally, and effective context lengthens accordingly.

### 2.5 Practical Deliverable Capability — Ko-GDPval

Ko-GDPval evaluates models by having them directly produce documents such as reports, plans, and presentations across **58 occupations and 170 real business scenarios** — lawyers, accountants, infection-control specialists, etc.

- Solar Open 2: **86.75**
- DeepSeek-V4-Pro (1.6T): 86.91 — **0.16-point gap**
- MiMo-V2.5-Pro (1T): 84.62

By active parameters, Solar Open 2 uses roughly 1/3 of DeepSeek-V4-Pro (15B). Published output examples include FATF mutual evaluation pre-response materials (regulatory submission PDF + 55-case monitoring workbook xlsx with mutual consistency), medical device PMS periodic reports, and law firm advertising self-audit results (with citation tables and statute indexes).

### 2.6 Commercial Use License

Under the Upstage Solar License, commercial use, fine-tuning, and derivative model development via distillation are all permitted.

---

## 3. Weaknesses and Limitations

### 3.1 Hardware Entry Barrier

BF16 requires 4× H200 (minimum) · 8× H200 (recommended). Official examples assume **8 GPUs with 141GB+ memory each**. Quantization can reduce to 2 GPUs, but this remains unrealistic for individuals or small teams. Practical adopters are limited to large enterprises, financial institutions, public sector, and GPU cloud users.

### 3.2 Three Officially Supported Languages

Limited to Korean, English, and Japanese. Chinese and European language groups are not officially supported; global multilingual services require additional validation and cost. Position as Asia-Pacific Korean/Japanese market focused.

### 3.3 No Japanese Performance Evidence

Japanese is listed as an official language, but **the model card publishes no Japanese benchmarks**. Contrast with 9 publicly released Korean benchmarks. Self-evaluation is mandatory when considering Japan market entry.

### 3.4 Serving Environment Dependency

Linear attention kernel optimization requires `fla-core` (KDA kernel) installation. **Without it, Transformers falls back to a significantly slower PyTorch path**. Production is effectively vLLM-only, and even then the Upstage fork (v0.22.0-solar-open2). Reasoning and tool-call parsers do not work on upstream vLLM/SGLang generic builds.

### 3.5 Reasoning Token Cost

With `reasoning_effort="high"`, the reasoning block cap is 131,072 tokens. Even with small active parameters, **high output token volume can offset savings**. End-to-end task cost comparison with actual measurements is required.

### 3.6 Immature Ecosystem

As a model released in July 2026, fine-tuning recipes, community tuned models, and llama.cpp/Ollama support remain shallow. License requirements for "Solar" prefix and "Built with Solar" attribution are cited as friction for Western open-source adoption.

### 3.7 Reliance on Self-Reported Benchmarks

All figures at present are Upstage announcements; some are in-house benchmarks (Ko-AIME'25, KBank-MMLU, Ko-GDPval). Treat as reference values until independent verification accumulates.

---

## 4. Benchmarks (Full Official Model Card)

### 4.1 English Benchmarks

| Benchmark | **Solar Open 2**<br>250B-A15B | Solar Open 100B<br>102B-A12B | Command A+<br>218B-A25B | Mistral Medium 3.5<br>128B dense | MiMo-V2.5<br>310B-A15B | DeepSeek-V4-Flash<br>284B-A13B |
|---|---|---|---|---|---|---|
| **Knowledge & reasoning** | | | | | | |
| MMLU-Pro | **86.2** | 80.4 | 79.0 | 81.2 | 84.6 | 85.9 |
| GPQA-Diamond | 86.3 | 66.2 | 75.6 | 77.5 | 83.0 | **88.9** |
| HLE (w/o tools) | 28.8 | 11.5 | 11.4 | 12.8 | 24.3 | **32.3** |
| LiveCodeBench (v6) | **92.4** | 56.5 | 86.1 | 84.9 | 89.1 | 92.3 |
| ArtifactsBench | 55.9 | 43.4 | 42.8 | 49.8 | 59.3 | **61.0** |
| HMMT2602 | 93.9 | 68.9 | 73.5 | 62.9 | 61.4 | **94.7** |
| AIME2026 | 95.7 | 87.7 | 96.0 | 89.0 | 92.3 | **97.0** |
| **Instruction following & long context** | | | | | | |
| Multi-Challenge | 61.0 | 40.5 | 45.8 | 49.8 | 39.0 | **62.0** |
| IFBench | 80.0 | 57.7 | 73.9 | 69.0 | 67.1 | **80.3** |
| AA-LCR | 62.3 | 36.0 | 46.0 | 61.0 | 62.7 | **63.7** |
| **Agent** | | | | | | |
| SWE-Bench Verified | 70.4 | 15.4 | 14.4 | 69.6 | 73.0 | **73.8** |
| Terminal Bench Hard | 28.3 | 2.3 | 25.0 | 33.3 | **41.7** | 34.1 |
| APEX-Agents | **16.6** | 2.4 | 1.6 | 6.1 | 13.4 | 13.2 |
| MCP-Atlas | 58.2 | 34.4 | 27.2 | 30.7 | **63.9** | 58.2 |
| τ³ (banking) | 19.6 | 7.4 | 5.8 | 5.8 | 8.7 | **22.3** |
| GDPval-AA v2 (ELO) | 1128 | – | 712 | 929 | 1145 | **1187** |

**Interpretation points**
- First place on MMLU-Pro, LiveCodeBench, and APEX-Agents (3 items). Most others show narrow leads for DeepSeek-V4-Flash or MiMo-V2.5.
- **APEX-Agents 16.6 is meaningful.** Clear gap from #2 (MiMo 13.4) on real business-style agent evaluation.
- **Terminal Bench Hard 28.3 is a weakness.** For long terminal-based tasks, it trails MiMo-V2.5 (41.7), DeepSeek (34.1), and Mistral (33.3). Reconsider if CLI automation agents are the primary use case.
- τ³ banking 19.6 is also low for conversational financial agents.

### 4.2 Korean Benchmarks

| Benchmark | **Solar Open 2** | Solar Open 100B | MiMo-V2.5 | DeepSeek-V4-Flash | Claude Haiku 4.5 | GPT-5.4 mini |
|---|---|---|---|---|---|---|
| KMMLU-Pro | 78.4 | 64.0 | 69.1 | **78.9** | 67.9 | 78.1 |
| CLIcK | **90.7** | 78.9 | 78.4 | 89.2 | 53.5 | 89.6 |
| HAE-RAE v1.1 | **73.8** | 73.3 | 61.7 | 73.1 | 38.5 | 69.4 |
| Ko-AIME'25† | 97.7 | 80.0 | 88.0 | **98.0** | 81.7 | 90.7 |
| HRM8K | 92.2 | 87.6 | 90.7 | **93.4** | 90.6 | 91.3 |
| KBank-MMLU† | **80.8** | 65.5 | 71.0 | 79.5 | 68.9 | 79.0 |
| KBL (legal) | **75.5** | 65.5 | 69.8 | 72.8 | 69.9 | 75.3 |
| KorMedMCQA | 93.0 | 84.4 | 87.7 | 94.1 | 87.0 | **94.2** |
| Ko-GDPval† | **86.8** | 3.4 | 81.0 | 85.0 | 68.3 | 59.4 |
| **Korean average** | **85.4** | 66.95 | – | 84.9 | 69.6 | 80.8 |

† Upstage in-house benchmark

**Interpretation points**
- **KBank-MMLU (finance) 80.8, KBL (legal) 75.5 — #1** provides direct rationale for domestic finance and legal domain adoption.
- KorMedMCQA is 3rd. Medical domain favors GPT-5.4 mini (94.2) and DeepSeek (94.1).
- The gap vs the prior generation on Ko-GDPval (3.4) is abnormally large — meaning the predecessor could not produce document deliverables at all; this generation's core improvement is here.

### 4.3 Improvement vs Prior Generation

| Category | Benchmark | Solar Open 2 | Solar Open 100B | Gain |
|---|---|---|---|---|
| Knowledge & science reasoning | GPQA-Diamond | 86.26 | 66.16 | +20.10p |
| Math | HMMT | 93.94 | 68.94 | +25.00p |
| Coding | LiveCodeBench | 92.42 | 56.49 | +35.93p |
| Instruction following | IFBench | 80.00 | 57.70 | +22.30p |
| Korean overall | Korean average | 85.43 | 66.95 | +18.48p |

---

## 5. Competing Project Comparison

### 5.1 Kimi K3 (Moonshot AI) — Opposite Extreme of Scale

| Item | **Solar Open 2** | **Kimi K3** |
|---|---|---|
| Developer | Upstage (Korea) | Moonshot AI (China) |
| Total parameters | 250B | **2.8T** |
| Expert configuration | 320 routed + 1 shared, top-8 active | 896 experts, 16 active (per press) |
| Release date | 2026-07-22 | API 2026-07-16 / weights 2026-07-27 |
| Context | 1M | 1M |
| Multimodal | Text only | **Native vision support** |
| Reasoning mode | `none` / `high` selectable | Thinking mode always active |
| License | Upstage Solar License | Modified MIT |
| Official languages | Korean · English · Japanese | Chinese · English centric |
| API pricing | Self-hosted | $3 / $15 per 1M tokens |
| Hardware | H200 2~4 GPUs | Terabyte-scale storage + distributed cluster |

Kimi K3 is the largest open-weight model released to date, ranking #1 on Arena Frontend Code Arena (1,679 points), ahead of Claude Fable 5 and GPT-5.6 Sol. Artificial Analysis composite ELO 1,547 — up 732 points from K2.6.

**The two models are not competitors — they target different markets.** Kimi K3 aims to bring frontier performance to open weights; Solar Open 2 targets a **performance/cost point you can actually deploy on your own infrastructure**. A 2.8T model is not an option for on-premises adoption in Korean finance and public sector where it is required.

However, Kimi K3's self-reported benchmarks were API-based before weight release, and it is noted to be slow with high reasoning token consumption — both should be considered together.

### 5.2 MiMo-V2.5 (310B-A15B) — Most Direct Competitor

The **only comparison target with identical 15B active parameters** — i.e., nearly the same inference cost structure.

| Item | Solar Open 2 advantage | MiMo-V2.5 advantage |
|---|---|---|
| Knowledge | MMLU-Pro 86.2 vs 84.6, GPQA 86.3 vs 83.0 | – |
| Coding | LiveCodeBench 92.4 vs 89.1 | SWE-Bench 70.4 vs **73.0** |
| Agent | APEX-Agents 16.6 vs 13.4 | Terminal Bench Hard 28.3 vs **41.7**, MCP-Atlas 58.2 vs **63.9** |
| Instruction following | Multi-Challenge 61.0 vs 39.0, IFBench 80.0 vs 67.1 | – |
| Korean | Advantage on all items (avg 85.4 vs undisclosed) | – |
| Total parameters | 250B (memory favorable) | 310B |

**Conclusion**: Korean and instruction following favor Solar; **MCP tool calling and long terminal tasks favor MiMo**. MCP-Atlas 58.2 vs 63.9 is a gap organizations with MCP-based agents as primary use cannot ignore.

### 5.3 DeepSeek-V4-Flash (284B-A13B)

The most balanced competitor — #1 on 9 of 16 English benchmarks. Solar Open 2 leads on MMLU-Pro (86.2 vs 85.9), LiveCodeBench (92.4 vs 92.3), and APEX-Agents (16.6 vs 13.2); the first two are within margin of error.

In Korean, Solar leads overall (85.4 vs 84.9), but DeepSeek leads on KMMLU-Pro, Ko-AIME, HRM8K, and KorMedMCQA. **DeepSeek achieving this level of Korean performance significantly weakens Solar Open 2's Korean superiority narrative.** Practical differentiation lies in token efficiency, on-premises fit, and data sovereignty rather than Korean performance alone.

### 5.4 Mistral Medium 3.5 (128B dense)

Solar Open 2 clearly leads on knowledge, coding, and Korean (MMLU-Pro 86.2 vs 81.2). However, **agent domain is equal or weaker** — SWE-Bench 70.4 vs 69.6 (narrow), Terminal Bench Hard 28.3 vs 33.3 (weaker), AA-LCR 62.3 vs 61.0. Apache 2.0 license is Mistral's clear strength.

### 5.5 Command A+ (218B-A25B)

Solar Open 2 leads substantially overall (MMLU-Pro 86.2 vs 79.0, GPQA 86.3 vs 75.6). Especially **SWE-Bench 70.4 vs 14.4** — not really comparable for agent coding. Active parameters are also larger at 25B vs Solar.

### 5.6 Selection Guide

| Requirement | Recommendation |
|---|---|
| Korean document work + on-premises | **Solar Open 2** |
| Finance & legal domain Korean | **Solar Open 2** (KBank-MMLU · KBL #1) |
| MCP-intensive tool-calling agents | Consider MiMo-V2.5 |
| Terminal/CLI long automation | MiMo-V2.5, DeepSeek-V4-Flash |
| Peak performance, no infra constraints | Kimi K3, DeepSeek-V4-Pro |
| License freedom priority | Mistral (Apache 2.0), Kimi K3 (Modified MIT) |
| Multilingual (Chinese · European) required | DeepSeek family |

---

## 6. Getting Started

### 6.1 System Requirements

| Configuration | Hardware | Notes |
|---|---|---|
| BF16 minimum | NVIDIA H200 ×4 | Official minimum spec |
| BF16 recommended | NVIDIA H200 ×8 | Official examples assume 8× 141GB-class GPUs |
| Quantization (official blog) | H200 ×2 | NotaAI quantized model |
| INT4 + Expert Pruning | H100 ×2 | Per Nota INT4-GlobalPruned card |

Actual memory requirements vary with context length and serving configuration.

### 6.2 Transformers (Local Experimentation)

You must use the Upstage Transformers branch.

```bash
# Install CUDA-enabled PyTorch first
python -m pip install -U \
  "git+https://github.com/upstageAI/transformers.git@v5.14.1-solar-open2" \
  "fla-core[cuda]>=0.5.1" \
  accelerate einops
```

> Without `fla-core`, it falls back to a significantly slower PyTorch path instead of the optimized KDA kernel. Install it.

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_id = "upstage/Solar-Open2-250B"

tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=False)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    device_map="auto",
    dtype=torch.bfloat16,
    trust_remote_code=False,
)
model.eval()

messages = [{"role": "user", "content": "What is Upstage?"}]
prompt = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    reasoning_effort="high",
    think_render_option="preserved",
)

input_device = model.get_input_embeddings().weight.device
model_inputs = tokenizer(prompt, return_tensors="pt").to(input_device)

generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=32768,
    do_sample=True,
    temperature=1.0,
    top_p=1.0,
)

# Separate reasoning trace and final answer (required when using Transformers directly)
new_token_ids = generated_ids[0, model_inputs.input_ids.shape[-1]:].tolist()
think_end_id = tokenizer.convert_tokens_to_ids("<|think:end|>")

if think_end_id in new_token_ids:
    answer_start = len(new_token_ids) - new_token_ids[::-1].index(think_end_id)
else:
    # No end marker — reasoning hit max_new_tokens before completion
    answer_start = len(new_token_ids)

reasoning = tokenizer.decode(new_token_ids[:answer_start], skip_special_tokens=True).strip()
answer = tokenizer.decode(new_token_ids[answer_start:], skip_special_tokens=True).strip()

print("[reasoning]", reasoning)
print("[answer]", answer)
```

**If the answer is empty**, the reasoning block reached `max_new_tokens` before finishing. Increase the value and retry.

### 6.3 vLLM Production Serving (Recommended)

#### Option 1: Docker

```bash
# Image basis: vLLM v0.22.0 / CUDA 12.9
docker run --rm --gpus all --ipc=host \
  -p 8000:8000 \
  -v "${HF_HOME:-$HOME/.cache/huggingface}:/root/.cache/huggingface" \
  upstage/vllm-solar-open2 \
  upstage/Solar-Open2-250B \
  --served-model-name solar-open2-250b \
  --tensor-parallel-size 8 \
  --enable-expert-parallel \
  --moe-backend triton \
  --default-chat-template-kwargs '{"think_render_option":"preserved"}' \
  --reasoning-parser solar_open2 \
  --tool-call-parser solar_open2 \
  --enable-auto-tool-choice \
  --logits-processors vllm.v1.sample.logits_processor.solar_open2:SolarOpen2TemplateLogitsProcessor
```

> **`--logits-processors` is a required item in the official recommended configuration.** It was omitted in the v1 document.

#### Option 2: Source Install

```bash
pip install -U uv

VLLM_PRECOMPILED_WHEEL_LOCATION="https://github.com/vllm-project/vllm/releases/download/v0.22.0/vllm-0.22.0%2Bcu129-cp38-abi3-manylinux_2_28_x86_64.whl" \
VLLM_USE_PRECOMPILED=1 \
uv pip install --reinstall-package vllm --torch-backend=cu129 \
  "git+https://github.com/UpstageAI/vllm.git@v0.22.0-solar-open2"
```

```bash
vllm serve upstage/Solar-Open2-250B \
  --served-model-name solar-open2-250b \
  --tensor-parallel-size 8 \
  --enable-expert-parallel \
  --moe-backend triton \
  --default-chat-template-kwargs '{"think_render_option":"preserved"}' \
  --reasoning-parser solar_open2 \
  --tool-call-parser solar_open2 \
  --enable-auto-tool-choice \
  --logits-processors vllm.v1.sample.logits_processor.solar_open2:SolarOpen2TemplateLogitsProcessor
```

#### API Call

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "solar-open2-250b",
    "messages": [{"role": "user", "content": "What is Upstage?"}],
    "max_tokens": 131584,
    "temperature": 1.0,
    "top_p": 1.0,
    "reasoning_effort": "high"
  }'
```

> `max_tokens` includes **both** the reasoning trace and the final answer. With a reasoning cap of 131,072, allow headroom above that so the answer is not truncated.

### 6.4 Official Quantized Models (NotaAI)

| Model | Method | Notes |
|---|---|---|
| `nota-ai/Solar-Open2-250B-Nota-INT4-GlobalPruned` | W4A16 INT4 + global expert pruning | Variable experts per layer, 2×H100 serving |
| `nota-ai/Solar-Open2-250B-Nota-NVFP4` | NVFP4 | Optimal for Blackwell-class |
| `nota-ai/Solar-Open2-250B-Nota-INT4` | W4A16 INT4 | No pruning applied |

The GlobalPruned version measures expert importance network-wide and varies retained expert count per layer. Better accuracy preservation vs uniform pruning.

### 6.5 Reasoning Mode Configuration

| Mode | `reasoning_effort` | temperature | top_p | max_tokens |
|---|---|---|---|---|
| Direct response | `"none"` | 1.0 | 1.0 | Max 128K |
| Advanced reasoning | `"high"` | 1.0 | 1.0 | Max 256K |

**Multi-turn note**: Do not remove prior-turn reasoning traces from conversation history. `think_render_option=preserved` (default) handles this automatically.

```python
from openai import OpenAI

client = OpenAI(api_key="EMPTY", base_url="http://localhost:8000/v1")

response = client.chat.completions.create(
    model="solar-open2-250b",
    messages=[{"role": "user", "content": "Prove that √2 is irrational."}],
    reasoning_effort="high",
    temperature=1.0,
    top_p=1.0,
    max_tokens=131584,
)

print(response.choices[0].message.reasoning)  # Reasoning trace (separate field)
print(response.choices[0].message.content)    # Final answer
```

### 6.6 Tool Calling

Start the server with `--tool-call-parser solar_open2 --enable-auto-tool-choice`. After that, the standard OpenAI function calling interface applies.

```python
from openai import OpenAI

client = OpenAI(api_key="EMPTY", base_url="http://localhost:8000/v1")

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "parameters": {
            "type": "object",
            "properties": {"location": {"type": "string"}},
            "required": ["location"],
        },
    },
}]

response = client.chat.completions.create(
    model="solar-open2-250b",
    messages=[{"role": "user", "content": "What's the weather in Seoul?"}],
    tools=tools,
)
print(response.choices[0].message.tool_calls)
```

### 6.7 Claude Code / Hermes Agent Integration

A single vLLM server exposes both interfaces simultaneously. Claude Code uses Anthropic-compatible `/v1/messages`; Hermes Agent uses OpenAI-compatible `/v1`. MCP-exposed tools reach the model through the same tool-calling interface; both agents natively support MCP.

**Claude Code — Environment variables**

```bash
export ANTHROPIC_BASE_URL=http://localhost:8000
export ANTHROPIC_AUTH_TOKEN=dummy   # Any non-empty arbitrary value
export ANTHROPIC_MODEL=solar-open2-250b
export ANTHROPIC_SMALL_FAST_MODEL=solar-open2-250b
claude
```

Model name must exactly match the server's `--served-model-name`.

**Claude Code — Upstage-provided script**

```bash
curl -fsSL https://console.upstage.ai/claude-upstage.sh | bash
```

**Hermes Agent** — Solar Open 2 is a Hermes Official model. `~/.hermes/config.yaml`:

```yaml
model:
  provider: custom
  default: solar-open2-250b
  base_url: http://localhost:8000/v1
  api_key: dummy
```

### 6.8 Playground

Try it on Upstage Playground with no separate setup. **Available through July 31, 2026.**

---

## 7. Key Use Cases

### 7.1 Regulatory Response Document Generation — Mutually Consistent Multi-Deliverables

Upstage's representative Ko-GDPval output case and this model's most distinctive capability: **generating two or more deliverables in different formats from the same data with matching numbers**.

- Regulatory submission summary report (PDF) — exposure by risk tier and country
- Operational monitoring workbook (xlsx) — line-item detail for every rule-triggered transaction

Where typical LLMs fail is total mismatch between the two deliverables.

```python
prompt = """Generate two deliverables for the attached transaction log.

[Deliverable 1] Regulatory submission response report
- Transaction count and amount totals by risk tier (high/medium/low)
- Top 10 countries by exposure
- Summary by triggered rule (R1~R4)

[Deliverable 2] Internal monitoring workbook (xlsx)
- Full detail of flagged transactions (transaction ID, datetime, amount, currency, counterparty country, rule, risk tier)
- Structure where all aggregates in Deliverable 1 are verifiable via SUMIF

Constraint: Every figure in Deliverable 1 must be recalculable from Deliverable 2.
If mismatch occurs, revise Deliverable 1 based on Deliverable 2."""
```

**Applicable domains**: FATF/AML response, financial supervisory reports, medical device PMS periodic reports, advertising review self-audits, disclosure document drafting.

### 7.2 1M Context Contract & Regulation Cross-Review

With 1M context, **entire documents can be loaded at once without RAG chunking**. For documents where cross-clause references matter, chunking structurally breaks answers.

```python
messages = [{
    "role": "user",
    "content": f"""Below are the full text of the main contract, three supplementary agreements, and our company's standard contract guidelines.

{full_documents}   # ~400K tokens

Perform the following:
1. List all conflicting clauses between the main contract and each supplementary agreement (cite clause numbers)
2. Clauses violating standard guidelines and reasons for violation
3. Proposed revision text for each violating clause
4. Risk rating (high/medium/low) and negotiation priority

Do not speculate without basis; cite original clause text."""
}]
```

**Note**: Long-context benchmark AA-LCR is 62.3 — close to top (DeepSeek 63.7) but the absolute value is not high. Validate retrieval accuracy when actually filling 1M context with your own needle-in-haystack tests.

### 7.3 Spreadsheet Recalculation Agent

Explicitly included in training data: change inputs on formula-bearing sheets and recalculate results.

```python
tools = [
    {"type": "function", "function": {
        "name": "read_sheet",
        "description": "Read sheet range and return values and formulas",
        "parameters": {"type": "object", "properties": {
            "path": {"type": "string"}, "sheet": {"type": "string"}, "range": {"type": "string"}
        }, "required": ["path", "sheet", "range"]}}},
    {"type": "function", "function": {
        "name": "write_cells",
        "description": "Write values or formulas to cells",
        "parameters": {"type": "object", "properties": {
            "path": {"type": "string"}, "updates": {"type": "array", "items": {"type": "object"}}
        }, "required": ["path", "updates"]}}},
    {"type": "function", "function": {
        "name": "recalculate",
        "description": "Recalculate entire workbook and return specified cell results",
        "parameters": {"type": "object", "properties": {
            "path": {"type": "string"}, "check_cells": {"type": "array", "items": {"type": "string"}}
        }, "required": ["path"]}}},
]

# "Change the FX assumption from 1,340 KRW to 1,420 KRW, recalculate operating profit
#  by affected division, and write commentary on the top 3 divisions by variance"
```

The key is the model was trained to **write then read back to verify results**. You must provide a `recalculate` tool to activate this loop.

### 7.4 Internal Codebase Agent (Claude Code Integration)

SWE-Bench Verified 70.4 is top-tier among models you can run on your own infrastructure. Direct answer for organizations where source code must not leave the premises.

```bash
# 1. Start vLLM on internal GPU node (Section 6.3)
# 2. Developer workstation
export ANTHROPIC_BASE_URL=http://gpu-node.internal:8000
export ANTHROPIC_AUTH_TOKEN=dummy
export ANTHROPIC_MODEL=solar-open2-250b
export ANTHROPIC_SMALL_FAST_MODEL=solar-open2-250b
cd ~/legacy-erp && claude
```

**However, Terminal Bench Hard 28.3 must be noted.** Strong on file-level edits and test-pass tasks (SWE-Bench), but relatively weak on long autonomous terminal environment manipulation. Keep autonomous scope narrow and maintain human-in-the-loop.

### 7.5 MCP-Based Internal System Orchestration

```yaml
# Example internal MCP server configuration
servers:
  - name: erp-mcp          # Voucher inquiry/posting
  - name: groupware-mcp    # Approval submission, document box
  - name: dw-mcp           # Data warehouse queries
  - name: hr-mcp           # HR master (read-only)
```

```
"Look up this quarter's SG&A execution rate by department, find departments exceeding 90% of budget,
 and draft an approval request to each department head for execution summary and remaining budget plan."
```

**MCP-Atlas 58.2 trails the top tier (MiMo 63.9).** More tools and complex schemas increase mis-call risk. Practical design recommendations:
- Limit exposed tools to 15 or fewer per session
- Write (write) tools must pass an approval gate
- Write tool descriptions clearly in Korean (leverage Korean comprehension strength)

### 7.6 Domain-Specific Derivative Model Development

The license permits fine-tuning and distillation. Base performance of KBank-MMLU 80.8 · KBL 75.5 is a favorable starting point for finance and legal specialized derivatives.

```
Solar-KFinance-v1   # Domestic finance regulation · product terms specialized
Solar-KLegal-v1     # Case law · statute specialized
Solar-Med-PMS-v1    # Medical device post-market surveillance document specialized
```

> "Solar" prefix in model name required; "Built with Solar" on promotional materials; license copy must accompany distribution.

---

## 8. Korea Market Business Adoption Scenarios

### 8.0 Premise: Why It Is Valid in Korea Now

Three conditions hold simultaneously.

1. **Network isolation & data sovereignty regulation** — Financial network isolation, public cloud CSAP certification, and cross-border personal data transfer restrictions make foreign APIs structurally difficult.
2. **On-premises-feasible hardware requirements** — H200 2~4 GPUs is manageable even for mid-size enterprises. Virtually the only frontier-class open model meeting this condition.
3. **Korean business context training** — Korean business-environment document scenarios reflected in training.

Upstage references include: #1 supplier for Public Procurement Service generative AI business support (2025-12), planned Daum portal integration, and agent platform "Timely" supply to local governments, public institutions, and educational organizations.

### 8.1 Financial Sector — Compliance & AML Agents

| Item | Detail |
|---|---|
| Target | Banks, securities, insurance, VASPs |
| Rationale | KBank-MMLU 80.8 (#1), Ko-GDPval 86.8, multi-deliverable regulatory document capability |
| Problem | AML/CFT monitoring alert surge, FATF mutual evaluation document overload, network isolation blocks external LLMs |
| Setup | Internal H200 ×4 + vLLM + MCP (core banking read-only, AML rule engine, document management) |
| Output | STR drafts, supervisory submission reports + verification workbooks simultaneously, internal control checklists |
| KPI | Review time per alert, STR draft rejection rate, report drafting lead time |
| Risk | τ³ banking 19.6 is low for conversational financial agents → **Limit scope to back-office document work, not customer-facing** |

**Phased adoption recommendation**: Stage 1 document draft generation (mandatory human review) → Stage 2 alert primary classification → Stage 3 structured report automation. Defer customer touchpoints at least one year.

### 8.2 Legal Services — Contract Review & Self-Audit

| Item | Detail |
|---|---|
| Target | Law firms, in-house legal, compliance |
| Rationale | KBL 75.5 (#1), 1M context, citation table · statute index output examples |
| Problem | Contract review concentrated on junior staff, missed cross-clause conflicts, delayed statute updates |
| Setup | On-premises (client info must not leave) + internal case · contract DB MCP |
| Output | Clause-level risk tables, standard contract deviation reports, negotiation point summaries, advertising review self-audit results |
| KPI | Review time per contract, conflict detection rate vs humans, re-review issue count |
| Risk | Legal judgment ultimately rests with attorneys. **Position as draft-generation tool only; mandatory review watermark on outputs** |

### 8.3 Large Manufacturing — Technical & Quality Document Automation

| Item | Detail |
|---|---|
| Target | Semiconductor, automotive, chemical, shipbuilding |
| Rationale | 1M context, spreadsheet recalculation training, on-premises |
| Problem | Manual update of dozens of linked documents on design changes, repetitive certification documents, drawing · spec vs document mismatch |
| Setup | Closed network + PLM/MES MCP + Document Parse (document → LLM-readable format) |
| Output | ECN drafts, nonconformance reports, 8D reports, certification submission documents in Korean · English · Japanese |
| KPI | ECN issuance lead time, cross-document mismatch issue count |
| Note | **Korean · English · Japanese support aligns precisely with Japanese customer response scenarios.** Especially suitable for domestic parts suppliers serving Japanese OEMs and electronics customers |

### 8.4 Public Sector & Local Government — Civil Complaint Response & Administrative Documents

| Item | Detail |
|---|---|
| Target | Central ministries, metropolitan · local governments, public institutions, schools |
| Rationale | Sovereign AI alignment, procurement track record, CLIcK 90.7 (Korean culture · common sense) |
| Problem | Civil complaint staffing shortage, linked document updates on ordinance revisions, data that cannot leave the country |
| Setup | Public cloud or own IDC; quantized model (H200 ×2) to minimize budget |
| Output | Complaint response drafts, ordinance revision comparison tables, business plans · settlement reports, meeting minutes summaries |
| KPI | Complaint processing days, repeat complaint auto-response rate |
| Procurement angle | Open weight + domestic = **Simultaneously satisfies domestic AI adoption metrics and data sovereignty requirements**. Strong differentiator in proposals |

### 8.5 Mid-Size Enterprise — Back-Office Agent (Low-Cost Quantized Entry)

| Item | Detail |
|---|---|
| Target | Revenue 100B–1T KRW scale, 1–3 dedicated AI staff |
| Setup | **H200 ×2 (Nota INT4-GlobalPruned)** or H100 ×2. Minimize initial CAPEX |
| Output | First-pass contract review, quote · proposal drafts, accounting voucher classification, internal policy Q&A |
| Approach | 3-month PoC on cloud GPU → on-premises transition after validation |
| Failure factor | Deploying model alone without tool (MCP) readiness fails. **ERP/groupware API readiness is a prerequisite** |

### 8.6 Korea Scenario Overall Priority

| Priority | Segment | Evidence strength | Adoption difficulty | Expected ROI |
|---|---|---|---|---|
| 1 | Finance back-office documents | High (KBank #1) | Medium | High |
| 2 | Public administrative documents | High (procurement track record) | Low | Medium |
| 3 | Legal contract review | High (KBL #1) | Medium | High |
| 4 | Manufacturing technical documents | Medium | High | High |
| 5 | Internal code agent | Medium (SWE 70.4 / Terminal 28.3) | Medium | Medium |

---

## 9. Japan Market Business Adoption Scenarios

### 9.0 Premise: Structural Characteristics of the Japan Market

Japan is a market with **structurally strong on-premises preference**. Locally deployable models have lower adoption barriers than cloud-based US/Chinese models. Upstage already operates a Japan entity and holds W&B Nejumi leaderboard #1 with **Syn Pro (31B)**, a Japanese-specialized model co-developed with Japanese AI company Karakuri.

**Core strategy: Two-tier configuration of Syn Pro and Solar Open 2.**

| Aspect | Syn Pro (31B) | Solar Open 2 (250B-A15B) |
|---|---|---|
| Strength | Japanese · cultural context fine-tuning, verified Japanese performance | Agentic execution, 1M context, document deliverables |
| Hardware | Small on-premises | H200 2~4 GPUs |
| Role | Lightweight tasks: dialogue, summarization, classification | Multi-step business execution, complex document generation |

### 9.1 Critical Caveat — No Japanese Performance Evidence

**The Solar Open 2 model card publishes no Japanese benchmarks.** Contrast with 9 publicly released Korean benchmarks. Proposing to Japanese customers based on official language support alone is risky.

**Mandatory pre-work**:
1. Self-evaluation against W&B Nejumi leaderboard
2. Self-measurement on public Japanese benchmarks (JMMLU, JCommonsenseQA, etc.)
3. Actual Japanese token efficiency measurement (unlike Korean, optimization evidence is not public)
4. PoC with customer actual documents — especially keigo (honorific) · business idiom accuracy

Entering without this validation loses trust at the first PoC.

### 9.2 Korea-Japan Cross-Border Document Work — Strongest Entry Point

In Japan, Solar Open 2's **true differentiator is not standalone Japanese performance but simultaneous Korean · English · Japanese support**. Virtually no open-weight model offers this combination.

| Item | Detail |
|---|---|
| Target | Korea-Japan joint ventures, Korean companies in Japan, Japanese companies in Korea, trading companies |
| Problem | Maintaining contracts · specs · quality documents in 3 languages, translation outsourcing cost and lead time, consistency collapse vs originals after translation |
| Solution | Not simple translation but **simultaneous multilingual deliverable generation from the same facts** (Section 7.1 capability applied directly) |
| Output | Korean-Japanese counterpart contracts, trilingual nonconformance reports, HQ report (KO) + local submission (JA) consistent sets |
| KPI | Translation outsourcing cost, multilingual document lead time, cross-language mismatch issue count |

```python
prompt = """Generate three deliverables from the following quality nonconformance case data.

[1] 8D report for Japanese customer submission (Japanese, keigo, manufacturing standard style)
[2] HQ summary report for Korea (Korean, root cause · recurrence prevention focus)
[3] Global quality DB registration summary in English (within 200 words)

Constraints:
- Numerical values (defect rate, lots detected, quantity affected) must match exactly across all three
- [1] must be in a format the Japanese customer can accept as-is
- Mark items with unclear root cause as 'under investigation' rather than guessing"""
```

### 9.3 Japanese Manufacturing — On-Premises Quality & Design Documents

| Item | Detail |
|---|---|
| Target | Auto parts, electronics components, precision machinery, materials |
| Rationale | On-premises market preference + 1M context + spreadsheet recalculation |
| Problem | Extreme aversion to technical know-how leakage, voluminous drawings · specs, tacit knowledge loss from aging skilled workforce |
| Setup | Fully closed network H200 ×2~4, PLM integration, Syn Pro in parallel |
| Note | Japanese manufacturing has **very strict document format compliance**. Must inject internal standard templates via few-shot or fine-tuning |
| Entry strategy | "Formalizing veteran tacit knowledge" (ベテランの暗黙知の形式知化) framing has higher acceptance than full automation |

### 9.4 Japanese Finance & Insurance — Regulatory Response Documents

| Item | Detail |
|---|---|
| Target | Regional banks, non-life insurance, life insurance |
| Rationale | Multi-deliverable regulatory document generation, on-premises |
| Problem | Financial Services Agency report burden, regional bank IT staffing shortage, no external data export |
| Setup | Quantized model (H200 ×2) to suppress initial investment |
| Caution | **Korean finance regulation training does not transfer to Japanese finance regulation.** Do not cite KBank-MMLU #1 for Japan market. FSA regulation · industry template RAG is mandatory prerequisite |

### 9.5 Japanese Public & Local Government — Cautious Approach Recommended

Japanese local government market has long contract cycles and strong domestic · quasi-domestic preference. **Standalone proposal of a Korean model is realistically difficult.**
Realistic paths:
- Indirect entry via Japanese SIers · telecom (NTT, SoftBank, etc.)
- Approach as **joint development · derivative model with Japanese companies** like Syn Pro
- License requires "Solar" prefix — `Solar-<Partner>-JP-v1` naming inevitable; coordinate with partner in advance

### 9.6 Japan Scenario Overall Priority

| Priority | Segment | Evidence strength | Entry difficulty | Notes |
|---|---|---|---|---|
| 1 | Korea-Japan cross-border documents | High (structural differentiator) | Low | Can start immediately |
| 2 | Internal adoption by Korean companies in Japan | High | Low | Decision authority at Korea HQ |
| 3 | Japanese manufacturing on-premises | Medium (Japanese validation needed) | Medium | Syn Pro parallel required |
| 4 | Japanese finance | Medium | High | Regulation RAG prerequisite |
| 5 | Japanese public | Low | Very high | Partner route only realistic |

---

## 10. Adoption Decision Checklist

### 10.1 Technical Validation (Before PoC)

- [ ] Reproduce benchmarks on your own data — public figures are reference only
- [ ] Self-measure 1M context needle-in-haystack (validate practical meaning of AA-LCR 62.3)
- [ ] Measure mis-call rate in environments with 15+ MCP tools (MCP-Atlas 58.2 risk)
- [ ] Measure actual output token volume with `reasoning_effort="high"` → net vs active parameter savings
- [ ] Self-evaluate Japanese with Nejumi/JMMLU if using Japanese (mandatory)
- [ ] Measure throughput difference with/without `fla-core` installation

### 10.2 Infrastructure

- [ ] TCO comparison: BF16 (H200 ×4~8) vs quantization (×2)
- [ ] Upstage vLLM fork dependency — confirm upstream vLLM upgrade path
- [ ] Throughput estimate by concurrent users (Agents consume large tokens per session)
- [ ] Fallback path on failure (Solar Pro 3 API, etc.)

### 10.3 Governance & Legal

- [ ] Review full Upstage Solar License — derivative model definition scope
- [ ] Plan "Solar" prefix · "Built with Solar" attribution for derivative development
- [ ] License copy distribution process
- [ ] Approval gate design for write-permission tools
- [ ] Clarify output review responsibility (mandatory for legal · medical · finance)

### 10.4 Organization

- [ ] Internal system API readiness for MCP targets — **this is the bottleneck, not the model**
- [ ] Collect internal document standard templates (few-shot / fine-tuning material)
- [ ] Redefine reviewer role — from author to verifier

---

## 11. License

Distributed under the Upstage Solar License; **commercial use, fine-tuning, and derivative model development via distillation are permitted**.

Obligations when creating derivative AI models:

| Category | Requirement |
|---|---|
| Naming | "Solar" prefix in model name (e.g., `Solar-MyModel-v1`) |
| Attribution | "Built with Solar" on related public materials |
| Notice | Include copy of Upstage Solar License |

> More restrictive than Apache 2.0 (Mistral) or Modified MIT (Kimi K3). Naming obligation can be a marketing constraint when embedding in your own brand products — review in advance.

---

## 12. Citation

```bibtex
@misc{solar-open-2-2026,
    title={Solar Open 2 Technical Report},
    author={Upstage AI},
    year={2026},
    url={https://huggingface.co/upstage/Solar-Open2-250B}
}
```

---

## 13. References

| Category | Link |
|---|---|
| Model card | https://huggingface.co/upstage/Solar-Open2-250B |
| Technical Report | https://huggingface.co/upstage/Solar-Open2-250B/blob/main/Solar_Open_2_Tech_Report.pdf |
| License | https://huggingface.co/upstage/Solar-Open2-250B/blob/main/LICENSE |
| Technical blog (KO) | https://www.upstage.ai/blog/ko/solar-open-2 |
| Technical blog (EN) | https://www.upstage.ai/blog/en/solar-open-2 |
| Transformers branch | https://github.com/upstageAI/transformers/tree/v5.14.1-solar-open2 |
| vLLM fork | https://github.com/UpstageAI/vllm/tree/v0.22.0-solar-open2 |
| Quantized models | https://huggingface.co/nota-ai |
| Syn Pro (Japanese specialized) | https://www.upstage.ai/blog/en/upstage-ai-jp-syn-pro |
| Demo (~2026-07-31) | https://open2-beta.upstage.ai/ |

---

*Benchmark figures in this document are based on Upstage official announcements. Until independent third-party verification accumulates, use with the assumption of self-reproduction evaluation.*
