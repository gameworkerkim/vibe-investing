
# Solar Open2, DeepSeek V4, KIMI K3 — Comparative Analysis

---

## 1. Spec Comparison at a Glance

| Category | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| Release date | 2026-07-22 | 2026-04-24 | 2026-04-24 | 2026-07-16 (API) |
| Total parameters | 250B | 284B | 1.6T | 2.8T |
| Active parameters | 15B | 13B | 49B | ~50–60B (16/896 experts) |
| Context | 1M tokens | 1M tokens | 1M tokens | 1M tokens |
| Architecture | Hybrid-Attention MoE (linear+softmax, NoPE) | CSA+HCA (sparse attention) | CSA+HCA (sparse attention) | KDA + AttnRes + Stable LatentMoE |
| Languages | Korean · English · Japanese | Multilingual | Multilingual | Multilingual + native vision |
| License | Upstage Solar License (Apache 2.0–based, attribution required) | MIT (most permissive) | MIT | TBD (open weights expected 2026-07-27) |
| Self-host hardware | 4×H200 (BF16) / 2×H200 (NVFP4) | 2×H200 / 4×A100 80GB | 8×H200 (cluster) | 64+ accelerators (supernode), min ~1.4TB VRAM |
| API price (in/out) | Upstage API | $0.14/$0.28 /M | $0.435/$0.87 /M | $3.00/$15.00 /M |

---

## 2. Key Benchmark Comparison

### 2-1. Knowledge & Reasoning

| Benchmark | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| MMLU-Pro | 86.2 | 85.9 | 87.5 | — |
| GPQA-Diamond | 86.3 | 88.9 | 90.1 | 93.5 |
| HLE (no tools) | 28.8 | 32.3 | 37.7 | — |
| HMMT2602 | 93.9 | 94.7 | 95.2 | 94.3 |
| AIME2026 | 95.7 | 97.0 | — | — |

### 2-2. Coding

| Benchmark | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| LiveCodeBench | 92.4 | 92.3 | 93.5 | — |
| SWE-Bench Verified | 70.4 | 73.8 | 80.6 | 67.5 (DeepSWE) |
| SWE-Bench Pro | — | 76.2 | 76.2 | 81.2 (FrontierSWE) |
| Terminal-Bench 2.1 | — | — | — | 88.3 |
| Program Bench | — | — | — | 77.8 |

### 2-3. Agent & Tool Use

| Benchmark | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| APEX-Agents | 16.6 (#1) | 13.2 | — | — |
| MCP-Atlas | 58.2 | 58.2 | 73.6 | 76.0 |
| GDPval-AA (Elo) | 1,128 | 1,187 | 1,554 | 1,687 |
| BrowseComp | — | — | 83.4 | 91.2 (#1) |
| Automation Bench | — | — | — | 30.8 (#1) |

### 2-4. Korean Specialization

| Benchmark | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| Korean benchmark average | 85.4 (#1) | 84.9 | — | — |
| Ko-GDPval | 86.8 (on par with 1.6T Pro) | 85.0 | 86.9 | — |
| CLiCK (language & culture) | 90.7 (#1) | — | — | — |
| KBank-MMLU | 80.8 (#1) | — | — | — |

---

## 3. Core Strengths by Model

### 3-1. Solar Open2: Korean/Japanese specialization, agent workflow optimization

- **Hybrid attention**: 36 linear + 12 softmax layers — 1M context at ~1/4 memory vs full softmax
- **NoPE (no positional encoding)**: recurrent state in linear layers encodes token order, removing length extrapolation limits
- **Korean token efficiency**: ~24% fewer tokens than global models on Korean text (4.41 bytes/token)
- **MOPD (Multi-teacher On-Policy Distillation)**: integrates 12 domain experts into one model
- **Agent focus**: APEX-Agents #1, MCP-Atlas tied with Flash, IFBench 80.0
- **Ko-GDPval 86.8**: near 1.6T DeepSeek-V4-Pro performance at 1/6 model size

### 3-2. DeepSeek V4: The most balanced open-source frontier

- **V4-Flash (284B/13B)**: best value self-hosted model — 1M context on 2×H200
- **V4-Pro (1.6T/49B)**: strongest open-source coding & math — SWE-Bench Verified 80.6%, LiveCodeBench 93.5%
- **MIT license**: most permissive commercial use — no restrictions on modification, redistribution, or commercialization
- **Token-level compression + DSA**: 1M context at 9.5× less memory than V3.2
- **Huawei Ascend NPU training**: reduces US chip dependency — geopolitical risk hedge

### 3-3. KIMI K3: Scale, vision, and frontend coding peak

- **2.8T parameters**: first open-source 3T-class model — 16 of 896 experts active
- **Native vision**: text + image input support
- **Frontend Code Arena #1**: 1,679 Elo, ahead of Claude Fable 5 (1,631)
- **2.5× scaling efficiency**: 2.5× performance vs K2 at same compute
- **GPU memory reality**: ~1.4–1.5TB at MXFP4 — not feasible on workstations; datacenter clusters required

---

## 4. Recommendations by Use Case

### 4-1. Scenario 1: Korean/Japanese enterprise agents (office, legal, finance)

| | Solar Open2 | DeepSeek V4 | KIMI K3 |
|---|---|---|---|
| Rating | 5/5 | 3/5 | 2/5 |
| Key rationale | Ko-GDPval 86.8 (Pro parity), 24% Korean token savings, official KO·EN·JA | Strong general multilingual | No Korean specialization data |

**Conclusion**: For Korean enterprises automating internal document, legal, and finance workflows, Solar Open2 is the clear choice — #1 in Korean understanding/generation, Ko-GDPval on par with 1.6T Pro at 250B size.

### 4-2. Scenario 2: Self-hosted internal coding agents

| | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| Rating | 3/5 | 4/5 | 5/5 | 2/5 |
| Key rationale | SWE-Bench 70.4, 4×H200 | SWE 73.8, 2×H200, MIT | SWE 80.6, 8×H200, MIT | SWE limited, hardware wall |

**Conclusion**:
- **Sufficient hardware (8×H200+)**: DeepSeek V4-Pro — SWE-Bench 80.6%, strongest across coding & math
- **Cost-conscious self-hosting (2–4 GPUs)**: DeepSeek V4-Flash — 85–95% of Pro at 1/5 cost
- **Solar Open2** ties Flash on agent tool calling (MCP-Atlas 58.2) with Korean coding environment strengths

### 4-3. Scenario 3: Frontend & full-stack development assistance

| | Solar Open2 | DeepSeek V4 | KIMI K3 |
|---|---|---|---|
| Rating | 2/5 | 3/5 | 5/5 |
| Key rationale | LiveCodeBench 92.4 | LiveCodeBench 93.5 | Frontend Code Arena #1 (1,679 Elo), Program Bench 77.8 |

**Conclusion**: For frontend development, especially React/Next.js UI, KIMI K3 dominates. DeepSeek V4-Pro is more balanced for backend/full-stack.

### 4-4. Scenario 4: Budget self-hosting (single GPU to few GPUs)

| | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| Rating | 4/5 | 5/5 | 1/5 | N/A |
| Key rationale | INT4 quant 2×H200 (136GB) | INT4 quant 4×RTX 4090 (96GB) | 1TB+ VRAM | 1.4TB+ VRAM, 64+ accelerators |

**Conclusion**: Budget self-hosting is a two-way race between DeepSeek V4-Flash (INT4) and Solar Open2 (NVFP4 quantization).

### 4-5. Scenario 5: API-based production (cost & speed priority)

| | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| Rating | 3/5 | 5/5 | 4/5 | 1/5 |
| Key rationale | Upstage API | $0.14/$0.28/M | $0.435/$0.87/M | $3.00/$15.00/M |

**Conclusion**: DeepSeek V4-Flash offers overwhelming API value — ~15–20× cheaper than KIMI K3 at scale.

### 4-6. Scenario 6: Long-horizon research with 1M context

| | Solar Open2 | DeepSeek V4 | KIMI K3 |
|---|---|---|---|
| Rating | 4/5 | 4/5 | 5/5 |
| Key rationale | 1M context, NoPE unlimited extrapolation | 1M context, CSA/HCA | 1M + native vision + BrowseComp 91.2 (#1) |

**Conclusion**: All three support large document analysis; KIMI K3 leads BrowseComp and DeepSearchQA. For operations, DeepSeek V4-Flash or Solar Open2 are more practical due to cost.

### 4-7. Scenario 7: License & commercial freedom priority

| | Solar Open2 | DeepSeek V4 | KIMI K3 |
|---|---|---|---|
| Rating | 3/5 | 5/5 | 2/5 |
| Key rationale | Solar License (attribution, naming rules) | MIT (unrestricted) | License TBD |

**Conclusion**: DeepSeek V4 under MIT is the most legally free choice for derivative products and commercial embedding.

---

## 5. Final Summary: Model Selection by Purpose

| Use case | Recommended model |
|---|---|
| Korean/Japanese enterprise agents | Solar Open2 |
| Coding agent (peak performance) | DeepSeek V4-Pro |
| Coding agent (value self-hosting) | DeepSeek V4-Flash |
| Frontend specialization | KIMI K3 |
| Budget self-hosting (single/few GPUs) | DeepSeek V4-Flash (INT4) |
| Most permissive license | DeepSeek V4 (MIT) |
| Low-cost API production | DeepSeek V4-Flash |
| 1M context deep research | KIMI K3 (API) / Solar Open2 (self-host) |
| Datacenter full-scale deployment | KIMI K3 / DeepSeek V4-Pro |

---

## 6. Key Insights

1. **Solar Open2 is "small but strong"** — 250B with 1.6T-class Korean performance, 2×H200 quantized deployment, #1 agent tool calling. Near-optimal for Korean enterprises and public sector.

2. **DeepSeek V4 is the most versatile open source** — Flash is the self-hosting value standard; Pro is strongest open coding & math. MIT license maximizes commercial freedom.

3. **KIMI K3 is the "frontier of scale"** — 2.8T largest open model, Frontend Code Arena #1, native vision. Hardware wall (64+ accelerators, 1.4TB+ VRAM) and high API cost ($3/$15/M) are offset by coding performance leadership.
