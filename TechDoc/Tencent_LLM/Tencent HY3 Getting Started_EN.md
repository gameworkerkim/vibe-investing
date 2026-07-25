---
title: "Introducing Tencent Hunyuan Hy3 — Hy3 Getting Started Guide"
description: "A getting-started guide to Tencent's Hy3 model (officially released 2026-07-06): specs, pricing versus DeepSeek/Claude/ChatGPT, pros and cons, competitor comparison, and step-by-step setup for API, self-hosting, and AI coding tool integration."
keywords:
  - "Tencent Hy3"
  - "Hunyuan Hy3"
  - "Hy3 getting started"
  - "Hy3 pricing"
  - "Hy3 vs DeepSeek"
  - "MoE LLM"
  - "TokenHub"
  - "Claude Code integration"
lang: en
featured: false
schema_type: TechArticle
---

# Introducing Tencent Hunyuan Hy3 — Hy3 Getting Started Guide

> Written: 2026-07-12 | Target model: Tencent Hy3 (officially released 2026-07-06)
> All figures in this document are based on Tencent's official announcements and third-party benchmark data; sources are listed in the References section at the end.

---

## 1. Overview

Hy3 is a MoE (Mixture-of-Experts) LLM officially released by Tencent's Hy team (formerly Hunyuan) on July 6, 2026. It is the production version of the Hy3 preview released on April 23, refined through feedback from more than 50 product teams and reinforcement-learning (RL) scale-up. It is the first complete deliverable released 201 days after Chief AI Scientist Yao Shunyu joined the team. From the infrastructure rebuild in late January to the official launch, the team completed an end-to-end model development loop in roughly six months — reportedly by putting in unlimited funding and manpower under a default "996" schedule (9am–9pm, six days a week, as the practice is known in China).

The core positioning is clear. Rather than competing on maximum parameter count, Hy3 is positioned as "**a reliable, low-cost agent model for real-world productivity scenarios**." In Tencent's own words, it delivers performance comparable to flagship open-source models with 2 to 5 times its parameter count.

## 2. Model Specs

| Item | Value |
|---|---|
| Architecture | MoE (hybrid fast/slow thinking) |
| Total parameters | 295B |
| Active parameters | 21B (top-8 of 192 experts activated) |
| MTP layer | 3.8B (1 layer) |
| Number of layers | 80 (excluding MTP) |
| Attention | GQA, 64 heads / 8 KV heads / head dim 128 |
| Context length | 256K |
| Vocabulary | 120,832 |
| Precision | BF16 (a separate FP8-quantized version is also provided) |
| License | **Apache 2.0** (the preview used the Tencent Hy Community License) |
| Weight distribution | Hugging Face, ModelScope, GitCode, CNB |

## 3. Pricing Comparison: Hy3 vs DeepSeek vs Claude vs ChatGPT

### 3.1 Official Hy3 Pricing (Tencent Cloud TokenHub)

| Category | Price (RMB/1M tokens) | USD equivalent | KRW equivalent (approx.) |
|---|---|---|---|
| Input | ¥1 | $0.15 | ~₩195 |
| Output | ¥4 | $0.59 | ~₩780 |
| Cached input | ¥0.25 | $0.037 | ~₩49 |

This is dramatically cheaper than comparable-performance models, and daily token consumption increased 20x after the preview launch.

### 3.2 Major Model Pricing Comparison (July 2026, official prices, USD/1M tokens)

| Model | Input | Output | Cached-hit input | Output multiple vs Hy3 | Context |
|---|---|---|---|---|---|
| **Tencent Hy3** | $0.15 | $0.59 | $0.037 | 1.0x | 256K |
| DeepSeek V4 Flash | $0.14 | $0.28 | $0.0028 | 0.47x | 1M |
| DeepSeek V4 Pro | $0.435 | $0.87 | $0.003625 | 1.5x | 1M |
| Claude Haiku 4.5 | $1.00 | $5.00 | $0.10 | 8.5x | 200K |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $0.30 | 25x | 1M |
| Claude Opus 4.8 | $5.00 | $25.00 | $0.50 | 42x | 1M |
| GPT-5.4 (OpenAI) | $2.50 | $15.00 | ~0.1x input | 25x | 1M |
| GPT-5.5 (OpenAI) | $5.00 | $30.00 | ~0.1x input | 51x | — |

### 3.3 Interpreting the Price Comparison

**vs DeepSeek — conditional.** Against V4 Pro, which is closest in performance class, Hy3 is clearly cheaper (about 1/3 the input price, 2/3 the output price). However, V4 Pro's current price reflects a 75% promotional discount; its original list price was $1.74/$3.48. Against the cheapest tier, V4 Flash, DeepSeek is actually cheaper — input is roughly on par, but output is less than half, and the cached-hit rate is more than 10x cheaper ($0.0028 vs $0.037). Because DeepSeek automatically applies a 98% input discount on cache hits with no extra configuration, the effective cost gap widens far beyond the sticker price for high-cache-hit workloads such as agent loops or RAG that repeatedly send the same system prompt.

**vs Claude / ChatGPT — overwhelming advantage.** On output pricing, Hy3 is 1/25 the cost of Claude Sonnet 4.6, 1/42 of Opus 4.8, and 1/51 of GPT-5.5. Both rival camps can lower effective costs through prompt caching (~90% discount) and batch APIs (50% discount for Claude), but even stacking every discount cannot reach Hy3's sticker price. That said, this gap is traded off against a performance gap — for the hardest reasoning and multi-tool orchestration tasks, a frontier model's higher per-task success rate can offset the per-token price difference.

**Three billing traps.**
(1) DeepSeek V4's thinking mode is on by default — invisible internal reasoning tokens are billed as output. Hy3 defaults to `no_think`, so there is no risk of a sudden runaway bill.

(2) OpenAI GPT-5.5's output price varies $25–30 across sources, so reconfirm on the official page before finalizing a production budget.
(3) Agentic workloads resend the accumulated context at every step, consuming 10–100x more tokens than chat — amplifying any per-token price gap directly.

## 4. Advantages

**(1) Cost efficiency.** With 21B active parameters keeping inference cost down, Hy3 competes with flagships 2–5x its size. Tencent's OpenRouter token-call share rising to 8.7% in June is evidence of market reception.

**(2) Agent/tool-call stability.** This is the core improvement in the official release: better tool-call success rates and error recovery, and fewer invalid calls that cause infinite loops. On SWE-Bench Verified, accuracy varies by less than 4% across different agent scaffolds (CodeBuddy, Cline, KiloCode) — a trait more important to production agent builders than raw benchmark scores.

**(3) Reduced hallucination.** Trained on the principle of "answer only when there is evidence, say so when there isn't, and never confuse sources or fabricate data." In internal real-usage scenario evaluations, hallucination rate dropped from 12.5% to 5.4%, and common-sense error rate from 25.4% to 12.7%.

**(4) Multi-turn / long-context retention.** Multi-turn issue rate dropped from 17.4% to 7.9%; MRCR (long-dialogue benchmark) rose from 42.9% to 75.1%. Improvements are focused on real-world pain points such as coreference resolution, ellipsis recovery, and constraint inheritance across turns.

**(5) Real-world validation.** In WorkBuddy internal evaluation, task resolution rate rose from 72% to 90% and average completion time fell 34%. A published case study shows a cash-flow model spanning 3 regions, 6 mining blocks, and 5,220 linked cells for an oil company built entirely with live formulas, with no hardcoding — one of several disclosed office/finance-modeling cases.

**(6) Fully open source.** Apache 2.0 commercial-friendly license, an FP8-quantized version, a fine-tuning pipeline (full/LoRA, DeepSpeed ZeRO, LLaMA-Factory integration), and the AngelSlim compression toolkit are all provided.

## 5. Disadvantages and Limitations

**(1) A ceiling on top-tier reasoning.** Hy3 still trails first-tier frontier models such as Claude and GPT-5.5 in core capabilities like hardcore coding, complex reasoning, and multi-tool coordination. On GPQA Diamond, both Hy3 and DeepSeek V4 Pro score around 90%, below GPT-5.4 (93.0%) and Gemini 3.1 Pro (94.3%).

**(2) Context length.** 256K is practical but only 1/4 of DeepSeek V4 Pro's 1M — a disadvantage for bulk analysis of very large codebases or document sets.

**(3) Memory requirements.** Because it is MoE, per-request compute is only 21B, but the full 295B must reside in memory. Recommended self-hosting spec is 8x H20-3e-class GPUs.

**(4) Reliance on internal validation figures.** Many of the impressive numbers — hallucination rate, WorkBuddy resolution rate, etc. — come from Tencent's internal evaluations rather than standardized public benchmarks, making independent reproduction difficult.

**(5) Limits of Hy's internal standing at Tencent.** The WeChat ecosystem continues to run its own model, WeLM, as its primary — the fact that Hy has not become Tencent's unified AI foundation is cited as a long-term strategic risk.

## 6. Comparison with Competing Models

| Axis | Hy3 (Tencent) | DeepSeek V4 family | Qwen 3.7 (Alibaba) | Claude / GPT-5.5 |
|---|---|---|---|---|
| Structure | 295B MoE / A21B | V4 Pro: 1.6T MoE / ~A48B class | 3.7 Max: proprietary | Proprietary |
| Context | 256K | V4 Pro: 1M | — | Varies by model |
| License | Apache 2.0 | MIT (self-hostable) | Max is API-only | Closed |
| Strength | Agent stability, reduced hallucination, cost | Algorithmic/competitive coding (LiveCodeBench 93.5%), very long context | Long-duration autonomous agent runs (35-hour run), SWE-bench Pro 60.6% | Top-tier reasoning, multi-tool coordination, creative work |
| Price tier | Lowest tier | V4 Pro is also cheap ($0.87/1M output) | Max $7.50/1M output | Highest tier |

**vs DeepSeek V4.** A third-party comparison (CodingFleet) found Hy3 ahead of V4 Pro on 12 of 18 shared benchmarks. Notably, on the contamination-free DeepSWE benchmark, Hy3 scores 28.0% vs V4 Pro's 8.0% — a 20-point gap interpreted as a difference in tool-use generalization. On HLE without tools Hy3 is slightly behind (37.0% vs 37.7%), but with tools it leads by 5 points (53.2% vs 48.2%). Conversely, V4 Pro has advantages in 1M context, the MIT license, and disk-caching cost for repeated context. On SWE-bench Verified, Hy3 leads narrowly at 74.4% vs V4's approximately 72%.

**vs Qwen (Alibaba).** Qwen 3.7 Max positions itself as the "Agent Frontier" premium option, with SWE-bench Pro at 60.6% (highest among proprietary models) and 35-hour autonomous agent runs. However, it is API-only (locked to Alibaba Cloud) and over 10x more expensive than Hy3 on output pricing. Choose Hy3 for open weights, low cost, and self-hosting; choose Qwen Max for the longest autonomous agent performance.

**vs Claude / ChatGPT (GPT-5.5).** These still lead in frontier-level reasoning difficulty, complex multi-step problem solving, and multi-tool orchestration. Hy3's strategy is not to compete head-on but to "handle the vast majority of enterprise work at an extremely low cost." In Tencent's own blind evaluation (270 experts, 312 valid comparisons), Hy3 scored 2.67/4 vs GLM-5.1's 2.51/4 — the gap was widest in front-end development, CI/CD, and data/storage tasks.

## 7. Getting Started

### 7.1 Choosing an Access Path

| Path | Target audience | Notes |
|---|---|---|
| Tencent Cloud TokenHub API | Immediate use, no infrastructure needed | Pricing table above applies |
| Global platforms such as OpenRouter | Overseas developers | Being rolled out sequentially (preview already listed) |
| Self-hosting (vLLM/SGLang) | For data sovereignty / customization | 8x H20-3e-class GPUs recommended |
| Yuanbao / WorkBuddy | End-user experience | Yuanbao's agent features are free |

### 7.2 Calling the Tencent Cloud API Directly (Hosted)

Based on Tencent's official documentation center (aistudio.tencent.com/hunyuan/doc-center) and Tencent Cloud docs. The Hunyuan API is compatible with the OpenAI interface spec, so you can switch by simply replacing `base_url` and `api_key` in the official OpenAI SDK — no application code changes required.

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.hunyuan.cloud.tencent.com/v1",
    # Issue an API key from the console: console.cloud.tencent.com/hunyuan/api-key
    api_key="YOUR_HUNYUAN_API_KEY",
)

response = client.chat.completions.create(
    model="hy3",
    messages=[{"role": "user", "content": "Hello."}],
)
print(response.choices[0].message.content)
```

Operational details to confirm in the official docs:

| Item | Detail |
|---|---|
| Endpoint | `https://api.hunyuan.cloud.tencent.com/v1/chat/completions` |
| Concurrency limit | Default 5 concurrent (shared across primary/sub-accounts; higher limits require a separate request) |
| `stop` parameter | OpenAI stops **right before** the matching string; Hunyuan stops **right after** it — parsing logic that relies on this behavior should account for the difference |
| Streaming usage | Setting `stream_options.include_usage=true` returns usage in the final chunk |
| Embedding | Fixed to `hunyuan-embedding`, fixed dimensions of 1024, supports only `input`/`model` parameters |
| Function calling | Supports the OpenAI-spec 2-pass flow (model selects function and arguments → client executes → result is appended to context and resent) |
| Platform migration | Hunyuan's functionality is **migrating to TokenHub** — new models such as Hy3 are prioritized on the TokenHub (`tencent-tokenhub`)/TokenPlan (`tencent-tokenplan`) endpoints. If restricting an API key's model scope, be sure to include `hy3` in the allowed models |

Tencent has pledged to maintain compatibility, but implementation details differ, so when migrating from OpenAI it is recommended to include the items in the table above in your regression test suite.

### 7.3 Downloading the Model (for Self-Hosting)

```bash
# Hugging Face
huggingface-cli download tencent/Hy3          # BF16
huggingface-cli download tencent/Hy3-FP8      # FP8-quantized version (lower memory footprint)
```

Weight mirrors: Hugging Face, ModelScope, GitCode, CNB.

### 7.4 Serving with vLLM

```bash
# Build from source
uv venv --python 3.12 --seed --managed-python
source .venv/bin/activate
git clone https://github.com/vllm-project/vllm.git
cd vllm
uv pip install --editable . --torch-backend=auto

# Start server with MTP (Multi-Token Prediction) enabled
export VLLM_FLASHINFER_ALLREDUCE_BACKEND=trtllm
vllm serve tencent/Hy3 \
  --tensor-parallel-size 8 \
  --speculative-config.method mtp \
  --speculative-config.num_speculative_tokens 2 \
  --tool-call-parser hy_v3 \
  --reasoning-parser hy_v3 \
  --enable-auto-tool-choice \
  --port 8000 \
  --served-model-name hy3
```

### 7.5 Serving with SGLang

```bash
git clone https://github.com/sgl-project/sglang
cd sglang
pip3 install pip --upgrade
pip3 install "transformers>=5.6.0"
pip3 install -e "python"

python3 -m sglang.launch_server \
  --model tencent/Hy3 \
  --tp-size 8 \
  --tool-call-parser hunyuan \
  --reasoning-parser hunyuan \
  --speculative-num-steps 2 \
  --speculative-eagle-topk 1 \
  --speculative-num-draft-tokens 3 \
  --speculative-algorithm EAGLE \
  --port 8000 \
  --served-model-name hy3
```

### 7.6 Calling the OpenAI-Compatible API (Against a Self-Hosted Server)

```python
from openai import OpenAI

client = OpenAI(base_url="http://127.0.0.1:8000/v1", api_key="EMPTY")

response = client.chat.completions.create(
    model="hy3",
    messages=[
        {"role": "user", "content": "Hello. Please introduce yourself briefly."},
    ],
    temperature=0.9,   # official recommended value
    top_p=1.0,         # official recommended value
    # reasoning_effort:
    #   "no_think" (default, instant answer) | "low" | "high" (deep chain-of-thought)
    extra_body={"chat_template_kwargs": {"reasoning_effort": "high"}},
)
print(response.choices[0].message.content)
```

Operational tip: use `reasoning_effort="high"` for math, coding, and complex reasoning; use `"no_think"` for simple responses and bulk processing. Switching fast/slow thinking with this single parameter is the core interface of Hy3's hybrid design.

### 7.7 Fine-Tuning and Quantization

Both full fine-tuning and LoRA are supported, with an official pipeline that includes DeepSpeed ZeRO configuration and LLaMA-Factory integration (see the `finetune/` directory in the repo). Compression is handled by the AngelSlim toolkit, which supports quantization, low-bit formats, and speculative sampling.

### 7.8 Integrating with AI Coding Tools (Using Hy3 in Programming/OpenClaw Tools)

Tencent's official documentation center provides a dedicated section for connecting Hy3 to major AI coding tools. The following summarizes the full content based on TokenHub's official documentation (接入 AI 工具).

#### 7.8.1 Common Prerequisites

1. Create an API key from the TokenHub console's API Key management page (console.cloud.tencent.com/tokenhub/apikey).
2. **Caution**: If you set the access scope (可访问范围) to "restricted," you must check **Hy3** (and **Hy3 preview** if using the preview) in the allowed model list. Missing this step means authentication succeeds but model calls fail.
3. Copy and store the API key immediately after generation — it cannot be viewed again afterward.

#### 7.8.2 Claude Code (Anthropic Protocol)

Claude Code uses the Anthropic Messages protocol, so it connects via TokenHub's Anthropic-compatible endpoint. Unlike OpenAI-compatible tools, **the base URL is the root path** (no `/v1`).

Set the following in `~/.claude/settings.json` (Windows: `<user directory>/.claude/settings.json`):

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://tokenhub.tencentmaas.com",
    "ANTHROPIC_AUTH_TOKEN": "YOUR_API_KEY",
    "ANTHROPIC_MODEL": "hy3",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "hy3",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "hy3",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "hy3",
    "CLAUDE_CODE_SUBAGENT_MODEL": "hy3",
    "ENABLE_TOOL_SEARCH": false
  }
}
```

Meaning of each environment variable (per official docs):

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_BASE_URL` | Yes | Fixed to `https://tokenhub.tencentmaas.com` for TokenHub access |
| `ANTHROPIC_AUTH_TOKEN` | Yes | API key issued from the TokenHub console |
| `ANTHROPIC_MODEL` | Yes | Default model name (`hy3` or `hy3-preview`) |
| `ANTHROPIC_DEFAULT_OPUS/SONNET/HAIKU_MODEL` | No | Maps all three of Claude Code's model tiers to the same model — prevents silent failures where lightweight background calls route to a non-existent default model |
| `CLAUDE_CODE_SUBAGENT_MODEL` | No | Subagent model. Recommended to keep consistent with the main model to avoid cross-model compatibility issues |
| `ENABLE_TOOL_SEARCH` | No | Must be `false` — see the constraint below |

After configuring, open a new terminal, run `claude`, then run `/status` — if the API endpoint shows `https://tokenhub.tencentmaas.com` and the model shows `hy3`, the setup is applied.

Two operational constraints (explicitly stated in official docs):

**Enabling deep reasoning**: With the above configuration, Hy3's default thinking mode is `no_think`. For deep reasoning (high), run `/config` inside Claude Code → set Thinking mode to `true` → restart.

**Web search restriction**: Claude Code blocks third-party models from using native built-in web search. Once Hy3 is configured, triggering search will fail. The workaround is connecting a search MCP:

```bash
# Add the web-search MCP from Tencent Cloud's MCP marketplace (requires a separate cloud API key)
claude mcp add --transport sse WebSearchMCP "https://mcp-api.tencent-cloud.com/sse/XXX"

# Explicitly disable the native search tool at startup (ensures stable MCP calls)
claude --disallowedTools "WebSearch"
```

Claude Code must be restarted after adding the MCP. The cloud API key for the search MCP is separate from the model API key.

#### 7.8.3 OpenAI-Compatible Tools (Cline, Cursor, Roo Code, Kilo Code, OpenCode, Cherry Studio, Codex)

This group all connects with the same three values. Unlike Claude Code, **the base URL includes `/v1`**.

| Setting | Value |
|---|---|
| API Provider | `OpenAI Compatible` |
| Base URL | `https://tokenhub.tencentmaas.com/v1` |
| API Key | API key issued from TokenHub |
| Model ID | `hy3` |

Where to configure each tool (per official docs):

| Tool | Form | Configuration location |
|---|---|---|
| Cline | VSCode extension | On first run, "Bring my own API key" → Continue, or the settings button in the top-right |
| Cursor | IDE | Settings → Models → custom OpenAI-compatible endpoint |
| Roo Code | VSCode extension | Choose OpenAI Compatible in provider settings |
| Kilo Code | VSCode extension | Provider settings (offered a free Hy3 access promotion at launch) |
| OpenCode | CLI | Register the OpenAI-compatible endpoint in the provider config file |
| Cherry Studio | Desktop app | Add model provider → OpenAI Compatible |
| Codex | CLI | Register an OpenAI-compatible provider in config |

#### 7.8.4 OpenClaw / Hermes Agent (Dedicated Integrations)

**OpenClaw**: An official provider plugin is available. It supports both the TokenHub (`tencent-tokenhub`) and TokenPlan (`tencent-tokenplan`) endpoints, and the built-in catalog uses `https://tokenhub.tencentmaas.com/v1`. The model ID is `hy3` — do not confuse it with Tencent's `HY-3D-*` family (the 3D generation API).

```bash
# Connect TokenHub
openclaw onboard --non-interactive \
  --auth-choice tokenhub-api-key \
  --tokenhub-api-key "$TOKENHUB_API_KEY"
```

When running the gateway as a managed service (launchd/systemd/Docker), a key exported in an interactive shell is invisible to the managed process, so `TOKENHUB_API_KEY` must be persisted in `~/.openclaw/.env`.

**Hermes Agent**: Accessed through the Nous Portal (portal.nousresearch.com) subscription gateway. Connect via OAuth with `hermes setup --portal`, then select the Hy3 model from the portal catalog; a free tier was offered during the launch promotion period.

#### 7.8.5 Complete List of Official Integration Docs

| Tool | Official documentation URL |
|---|---|
| Documentation center (English) | https://aistudio.tencent.com/hunyuan/doc-center |
| 接入 AI 工具 (integration doc index) | https://cloud.tencent.com.cn/document/product/1823/130931 |
| CodeBuddy Code | https://cloud.tencent.com.cn/document/product/1823/131901 |
| WorkBuddy | https://cloud.tencent.com.cn/document/product/1823/131902 |
| Claude Code | https://cloud.tencent.com.cn/document/product/1823/131903 |
| OpenClaw | https://cloud.tencent.com.cn/document/product/1823/130935 |
| Hermes Agent | https://cloud.tencent.com.cn/document/product/1823/131927 |
| OpenCode | https://cloud.tencent.com.cn/document/product/1823/130936 |
| Cline | https://cloud.tencent.com.cn/document/product/1823/130932 |
| Cursor | https://cloud.tencent.com.cn/document/product/1823/130933 |
| Kilo Code | https://cloud.tencent.com.cn/document/product/1823/131904 |
| Roo Code | https://cloud.tencent.com.cn/document/product/1823/131905 |
| Codex | https://cloud.tencent.com.cn/document/product/1823/133532 |

## 8. Recommended Use Scenarios

**Hy3 recommended for:** enterprise AI agents where tool-call stability is a core requirement, high-volume low-cost processing (customer support, document/data-processing automation), office productivity (financial modeling, report/presentation generation), and regulated environments requiring self-hosting (Apache 2.0).

**Other models recommended for:** bulk analysis of million-token-scale documents → DeepSeek V4 Pro. Multi-tens-of-hours autonomous agent runs → Qwen 3.7 Max. The hardest reasoning, mathematical proofs, and long-form creative work → Claude, GPT-5.5.

Summary in one line: **Hy3 is a pragmatic model built to "reliably handle the vast majority of everyday enterprise work at a tiny fraction of frontier cost."** It is not the benchmark leader but the first tangible product of Yao Shunyu's "AI second half" philosophy — competing on production reliability rather than leaderboard rank.

---

## References

1. Tencent official press release — "Tencent Hunyuan Officially Releases Hy3" (2026-07-06): https://www.tencent.com/en-us/articles/2202386.html
2. Tencent Hy technical blog — "Introducing Hy3": https://hy.tencent.com/research/hy3
3. Official GitHub repo (specs, quickstart, deployment guide): https://github.com/Tencent-Hunyuan/Hy3
4. Hugging Face model card: https://huggingface.co/tencent/Hy3 / FP8: https://huggingface.co/tencent/Hy3-FP8
5. TechNode — launch and pricing coverage (2026-07-07): https://technode.com/2026/07/07/tencent-launches-hunyuan-hy3-integrates-model-across-multiple-products/
6. Caixin Global — launch coverage, Yao Shunyu / OpenRouter share (2026-07-06): https://www.caixinglobal.com/2026-07-06/tencent-launches-upgraded-hunyuan-3-ai-model-with-free-agent-feature-102461489.html
7. Pandaily — WorkBuddy 90% task resolution rate, real-world case studies: https://pandaily.com/tencent-hunyuan-hy3-launch-agent-90-percent-task-resolution-jul2026-v2
8. CodingFleet — "Hy3 vs DeepSeek V4 Pro" benchmark comparison: https://codingfleet.com/blog/hy3-vs-deepseek-v4-pro/
9. CodingFleet — "DeepSeek V4 Pro vs Qwen 3.7 Max": https://codingfleet.com/blog/deepseek-v4-pro-vs-qwen-3-7-max/
10. AIMadeTools — "Tencent Hy3 vs DeepSeek V4" (SWE-bench comparison): https://www.aimadetools.com/blog/tencent-hy3-vs-deepseek-v4/
11. BigGo Finance — critical analysis of Hy3 (limitations vs WeLM and first-tier models): https://finance.biggo.com/news/eac480c0-1840-4271-858a-eb43389b8811
12. The Standard — open-source license and pricing coverage: https://www.thestandard.com.hk/innovation/article/336512/Tencents-Hunyuan-releases-Hy3-available-on-WorkBuddy-and-more
13. OpenRouter model comparison page: https://openrouter.ai/compare/deepseek/deepseek-v4-pro/tencent/hy3-preview
14. Artificial Analysis — Hy3 intelligence/price/speed comparison: https://artificialanalysis.ai/models/comparisons/deepseek-v4-flash-vs-hy3
15. Tencent Hunyuan official documentation center: https://aistudio.tencent.com/hunyuan/doc-center
16. Tencent Cloud — official Hunyuan OpenAI-compatible interface documentation (endpoint, stop behavior, concurrency, embedding, function calling): https://cloud.tencent.com/document/product/1729/111007
17. OpenClaw — Tencent Cloud TokenHub/TokenPlan provider integration guide (hy3 model access): https://docs.openclaw.ai/providers/tencent
18. Tencent Cloud TokenHub — official Claude Code integration documentation (full settings.json configuration, deep reasoning, web search MCP): https://cloud.tencent.com.cn/document/product/1823/131903
19. Tencent Cloud TokenHub — 接入 AI 工具 documentation index (CodeBuddy/WorkBuddy/Claude Code/OpenClaw/Hermes/OpenCode/Cline/Cursor/Kilo/Roo/Codex): https://cloud.tencent.com.cn/document/product/1823/130931
20. Tencent Cloud TokenHub — official Cline integration documentation (OpenAI Compatible configuration pattern): https://cloud.tencent.com.cn/document/product/1823/130932
21. DeepSeek official Models & Pricing (V4 Flash/Pro pricing): https://api-docs.deepseek.com/quick_start/pricing/
22. Anthropic official Pricing documentation (per-model pricing, caching, batch discounts): https://platform.claude.com/docs/en/about-claude/pricing
23. CloudZero — Claude API Pricing 2026 / Claude Opus 4.8 Pricing (includes GPT-5.4/5.5 price comparison): https://www.cloudzero.com/blog/claude-api-pricing/
24. Morphllm — AI Coding Costs 2026 (consolidated comparison of official prices for major models, as of 2026-06-18): https://www.morphllm.com/ai-coding-costs

*Note: Hallucination rate (5.4%), common-sense error rate (12.7%), WorkBuddy task resolution rate (90%), and blind evaluation results (2.67/4 vs GLM-5.1's 2.51/4) are Tencent internal evaluation figures and not independently reproduced public benchmarks. KRW conversion is an approximation based on the early-July-2026 exchange rate (1 CNY ≈ 195 KRW). The pricing table in Section 3.2 reflects each company's official announcements as of early July 2026; DeepSeek V4 Pro's price is a promotional discount, and GPT-5.5's output price varies $25–30 across sources. LLM API prices change frequently, so reconfirm each company's official pricing page before finalizing a production budget.*
