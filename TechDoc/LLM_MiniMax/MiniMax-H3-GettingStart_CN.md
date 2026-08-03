<!--
---
title: "MiniMax H3 开源权重指南 — 全模态视频生成模型"
title_ko: "MiniMax H3 오픈웨이트 가이드 — 옴니모달 비디오 생성 모델"
subtitle: "MiniMax 首个开源权重视频模型：使用方法、优缺点与视频制作/编辑产业影响"
description: "MiniMax H3（2026年7月）开源权重全模态生成模型指南。接受文本、图像、视频、音频输入，生成最高 2K、15 秒、含原生立体声音频的视频。包含异步 API 与本地部署（SGLang、vLLM、diffusers、ComfyUI）入门、T2V/I2V/Ref2V 示例、优缺点、视频制作与编辑产业影响、M1/M3/H3 产品线对比。"
abstract: |
  MiniMax H3 是 MiniMax 于 2026 年 7 月发布的首个开源权重视频生成模型。
  它统一理解文本、图像、视频、音频上下文，并生成最长 15 秒、最高 2K、带原生立体声的视频。
  在视频编辑领域排名第一、文本生成视频排名第二，并采用 MiniMax 社区许可证发布，
  允许年收入低于 2000 万美元的组织商用。本文档涵盖异步生成 API、本地部署
  （SGLang/vLLM/diffusers/ComfyUI）、优缺点，以及对视频制作与编辑产业的影响。
summary_for_ai: |
  TechDoc for MiniMax H3 open-weight omni-modal video generation model.
  Covers async video generation API (POST /v2/video_generation, poll /v2/query/video_generation/{task_id}),
  T2V/I2V/Ref2V input combinations, 2K 15s native stereo audio output, local deployment
  (SGLang 4-GPU, vLLM, diffusers, ComfyUI), MiniMax H3 Community License, M1/M3/H3 lineup,
  and the impact on video production and editing industry. Not legal advice.
date: 2026-08-03
updated: 2026-08-03
author: "김호광 (Dennis Kim)"
lang: zh
tags: [MiniMax H3, MiniMax, Open Weight, Video Generation, Omni-Modal, T2V, V2V, Video Editing]
keywords: ["MiniMax H3", "视频生成", "视频编辑", "开源权重", "全模态", "2K", "T2V", "I2V", "Ref2V"]
group: llm-agents
featured: true
featured_rank: 0
schema_type: TechArticle
draft: false
robots: index,follow
---
-->

# MiniMax H3 开源权重指南 — 全模态视频生成模型

**副标题：MiniMax 首个开源权重视频模型 — 使用方法、优缺点与视频制作/编辑产业影响**

| 项目 | 内容 |
|------|------|
| 文档版本 | v1.0 |
| 基准日期 | 2026-08-03 (KST) |
| 目标模型 | MiniMax H3（模型 ID：`MiniMax-H3`） |
| 分类 | TLP:CLEAR |
| 官方资料 | [H3 博客](https://www.minimax.io/blog/minimax-h3) · [HuggingFace](https://huggingface.co/MiniMaxAI/MiniMax-H3) · [API 文档](https://platform.minimax.io/docs/api-reference/video-generation-v2-create) |
| 提示 | H3 发布后仍在持续迭代。基准测试为 MiniMax 自测数据，需要独立验证 |

---

## 目录

1. [MiniMax 开源权重战略概述](#1-minimax-开源权重战略概述)
2. [MiniMax 开源权重模型产品线（M1 · M3 · H3）](#2-minimax-开源权重模型产品线)
3. [H3 核心技术](#3-h3-核心技术)
4. [入门指南 — API](#4-入门指南--api)
5. [入门指南 — 本地部署（开源权重）](#5-入门指南--本地部署开源权重)
6. [使用示例 — T2V · I2V · Ref2V](#6-使用示例--t2v--i2v--ref2v)
7. [优点](#7-优点)
8. [缺点](#8-缺点)
9. [对视频制作/编辑产业的影响](#9-对视频制作编辑产业的影响)
10. [主要竞争对手](#10-主要竞争对手)
11. [总结](#11-总结)

---

## 1. MiniMax 开源权重战略概述

在文本为主的 LLM（M 系列）之后，MiniMax 于 2026 年 7 月发布了 **首个开源权重视频生成模型 H3**，将开源权重战略扩展到图像、音频、视频全栈。

核心战略方向：

- **模态统一**：将文本、图像、视频、音频作为统一输入上下文理解，并联合生成视频与立体声音频的"全模态"模型。
- **任务统一**：把原本分散在专业模型上的任务 — 文本转视频（T2V）、图像转视频（I2V）、参考转视频（Ref2V）、视频编辑、语音/音效/音乐生成 — 泛化到单一模型。
- **开源权重开放**：最新 H3 权重公开，可在本地或私有环境直接部署，无需 API 费用，也可针对特定领域微调。
- **价格颠覆**：2K 分辨率每秒价格不足主流竞品的 1/3，768p 不足主流 720p 价格的一半。

---

## 2. MiniMax 开源权重模型产品线

| 模型 | 发布时间 | 主要特点与性能 |
| :--- | :--- | :--- |
| **MiniMax-M1** | 2025 年 6 月 | 全球首个开源权重混合注意力推理模型<br>- 架构：混合 MoE，总参数 4560 亿，每 token 激活 459 亿<br>- 上下文：最高 100 万 token（DeepSeek-R1 的 8 倍）<br>- 效率：生成 10 万 token 仅需 DeepSeek-R1 的 25% FLOPs<br>- 基准：优于 DeepSeek-R1、Qwen3-235B 等主流开源模型 |
| **MiniMax M3** | 2026 年 6 月 | 首个结合编码、1M 上下文、原生多模态的开源权重模型<br>- 架构：MoE，总参数约 4280 亿，每 token 激活约 230 亿<br>- 编码：SWE-Bench Pro 达 59.0%（超过 GPT-5.5 的 58.6%）<br>- 价格：API 价格为竞品闭源模型的 5%~10%（促销期 $0.3/百万输入 token） |
| **MiniMax H3** | 2026 年 7 月 | MiniMax 首个以开源权重发布的视频模型<br>- 性能：视频编辑领域全球第一，文本转视频第二<br>- 能力：接受文本、图像、视频、音频输入，生成最高 2K、15 秒、带原生立体声音频的视频<br>- 许可证：MiniMax 社区许可证（年收入 2000 万美元以下组织可商用）<br>- 开源权重：HuggingFace `MiniMaxAI/MiniMax-H3`（33B，BF16） |

---

## 3. H3 核心技术

H3 由三个模块组成。API 集成提供三者，开源权重仅包含 H3-Base。

| 模块 | 作用 | 开放情况 |
|------|------|-----------|
| **H3-Context-IR** | 理解并精炼多模态输入，转换为结构化提示（中间表示）。以语言作为"泛化的桥梁" | 仅 API |
| **H3-Base** | 依据 Context-IR 输出生成 768p 视频 + 立体声音频（33B dense Omni-Transformer） | **开源权重** |
| **H3-Regenerate-2K** | 将 768p 结果与原上下文一起重新注入，再生成 2K。复用基础模型生成能力，替代专用超分辨率模块 | 仅 API |

关键技术亮点：

- **H3-Contextual Omni Representation**：覆盖视频、音频、多镜头关系的字幕化流水线。大部分原始素材经约 10 万 token 推理，蒸馏为平均约 4 千 token。
- **H3-VAE**：彻底重新设计分词器，同时提升重建质量与可学习性。高压缩率带来 4 倍有效序列长度，是原生 2K 支持的关键技术。
- **H3-Omni Transformer**：面向任务泛化的 dense Transformer。分离理解与生成负载以优化硬件利用率，训练吞吐提升近 30%。MM-RoPE 表达（时间、高度、宽度）三维位置关系，并原生支持稀疏注意力。
- **In-Context Regeneration**：不用专用超分模块，由 H3 基础模型将自身低分辨率输出与原多模态上下文一起再生成，可恢复传统 SR 只能"猜测"的小文字、细节等信息。

### H3 输入/输出规格

| 项目 | 规格 |
|------|------|
| 输出时长 | 4~15 秒 |
| 输出分辨率 | 768p（默认）~ 2K（经 H3-Regenerate-2K） |
| 输出帧率 | 24 FPS |
| 输出音频 | 32 kHz 立体声 |
| 支持纵横比 | 21:9、16:9、4:3、1:1、3:4、9:16、adaptive |
| 对话语言 | 稳定支持阿拉伯语、中文、英语、法语、德语、意大利语、日语、韩语、葡萄牙语、俄语、西班牙语等 11 种语言 |

---

## 4. 入门指南 — API

H3 采用**异步生成流程**。提交生成请求后立即获得 `task_id`，随后轮询任务状态，下载完成的视频。

### 4.1 准备工作

1. 在 [platform.minimax.io](https://platform.minimax.io) 注册账号
2. 在 Account Management > API Keys 创建 API Key（用于 `Authorization: Bearer <API_KEY>` 请求头）
3. 充值余额/token 套餐（2K 每秒价格不足主流模型的 1/3）

```bash
export MINIMAX_API_KEY="<YOUR_API_KEY>"
export MINIMAX_API_BASE="https://api.minimax.io"   # 全球（中国：https://api.minimaxi.com）
```

### 4.2 创建任务

`POST {MINIMAX_API_BASE}/v2/video_generation`

```bash
curl -X POST "$MINIMAX_API_BASE/v2/video_generation" \
  -H "Authorization: Bearer $MINIMAX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "MiniMax-H3",
    "content": [
      {
        "type": "text",
        "text": "Epic space-opera theatrical teaser: a female captain stands alone before a massive observation window as the last fleet gathers and jumps away in a blinding flash, the bridge shaking, leaving her behind."
      }
    ],
    "resolution": "2K",
    "duration": 5,
    "ratio": "16:9"
  }'
```

响应中返回 `task_id`。

```json
{ "task_id": "424010985738629" }
```

### 4.3 查询任务

`GET {MINIMAX_API_BASE}/v2/query/video_generation/{task_id}`

```bash
curl -s "$MINIMAX_API_BASE/v2/query/video_generation/424010985738629" \
  -H "Authorization: Bearer $MINIMAX_API_KEY"
```

成功后 `status` 变为 `succeeded`，`content.url` 返回视频下载地址。

```json
{
  "task": {
    "id": "424010985738629",
    "model": "MiniMax-H3",
    "status": "succeeded",
    "content": { "url": "https://your-cdn.example.com/h3-generated-2k-output.mp4" },
    "resolution": "2K",
    "duration": 5,
    "ratio": "16:9"
  }
}
```

- 状态：`queued` → `running` → `succeeded` / `failed` / `cancelled`
- 仅可查询最近 7 天任务，视频 URL 有时效，请及时下载保存。
- 失败时返回 `error` 字段（含 `code`/`message`）。

### 4.4 Python 完整示例（创建 → 轮询 → 下载）

```python
import time
import requests

API_BASE = "https://api.minimax.io"
API_KEY = "<YOUR_API_KEY>"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

def create_video(prompt, resolution="2K", duration=5, ratio="16:9"):
    resp = requests.post(
        f"{API_BASE}/v2/video_generation",
        headers=HEADERS,
        json={
            "model": "MiniMax-H3",
            "content": [{"type": "text", "text": prompt}],
            "resolution": resolution,
            "duration": duration,
            "ratio": ratio,
        },
    )
    resp.raise_for_status()
    return resp.json()["task_id"]

def wait_video(task_id, timeout=600):
    url = f"{API_BASE}/v2/query/video_generation/{task_id}"
    deadline = time.time() + timeout
    while time.time() < deadline:
        data = requests.get(url, headers=HEADERS).json()["task"]
        if data["status"] in ("succeeded", "failed", "cancelled"):
            return data
        time.sleep(5)
    raise TimeoutError("task did not finish in time")

task_id = create_video("A boy playing basketball by the sea, golden hour, cinematic")
result = wait_video(task_id)
if result["status"] == "succeeded":
    video_url = result["content"]["url"]
    mp4 = requests.get(video_url).content
    open("output.mp4", "wb").write(mp4)
    print("saved output.mp4")
```

### 4.5 请求参数汇总

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | 是 | `MiniMax-H3`（当前唯一） |
| `content` | array | 是 | 多模态输入数组，由 `text`/`image_url`/`video_url`/`audio_url` 元素构成。**每个请求必须包含一个非空 `text`（提示词）**（最多 7000 字符） |
| `resolution` | string | 是 | `768P` 或 `2K` |
| `duration` | int | 是 | `4`~`15`（秒） |
| `ratio` | string | 视情况 | `adaptive`（默认）、`21:9`、`16:9`、`4:3`、`1:1`、`3:4`、`9:16`。**纯文本 T2V 不能使用 `adaptive`，必须显式指定；图像输入一律按 `adaptive` 处理** |
| `callback_url` | string | 否 | 状态变更时 POST 通知。需在 3 秒内响应 `challenge` 校验 |

**输入媒体限制**（请求体总大小 ≤ 64MB；大文件建议使用公开 URL）：

| 媒体 | 限制 |
|------|------|
| 图像（`image_url`） | JPG、JPEG、PNG、WEBP、HEIC、HEIF；单文件 ≤ 30MB；[256, 5760]px；纵横比 [0.4, 2.5]。first frame ≤ 1、last frame ≤ 1、参考图像 ≤ 9 |
| 视频（`video_url`，参考场景） | MP4、MOV；H.264/H.265、AAC、MP3；单文件 ≤ 50MB；≤ 3 段；每段 2~15 秒，总计 ≤ 15 秒 |
| 音频（`audio_url`，参考场景） | WAV、MP3；单文件 ≤ 15MB；≤ 3 段；每段 2~15 秒，总计 ≤ 15 秒（音频不能单独输入） |

---

## 5. 入门指南 — 本地部署（开源权重）

### 5.1 下载模型

从 HuggingFace 获取 `MiniMaxAI/MiniMax-H3`（33B 参数，Image-Text-to-Video，BF16）。分为两个按任务区分的检查点：**FL2VA**（首/末帧）与 **Ref2VA**（参考驱动）。

```bash
# 原始检查点（SGLang、vLLM 使用）— 两个任务族
hf download MiniMaxAI/MiniMax-H3 --include "FL2VA/*" "Ref2VA/*" --local-dir MiniMax-H3

# 单个任务族
hf download MiniMaxAI/MiniMax-H3 --include "FL2VA/*" --local-dir MiniMax-H3
```

diffusers 用户无需手动下载：`ModularPipeline.from_pretrained("MiniMaxAI/MiniMax-H3")` 会自动拉取所需组件。

### 5.2 推荐推理框架

| 框架 | 特点 |
|------|------|
| **SGLang** | 推荐 4 卡，Ulysses 并行高性能，有官方 cookbook |
| **vLLM** | 缓存与调度优化，提供 vllm recipes |
| **diffusers** | 一行 `ModularPipeline.from_pretrained` 加载，Python 流水线 |
| **ComfyUI** | Comfy-Org/MiniMax-H3 节点化工作流，提供 T2V/R2V 模板 |

### 5.3 SGLang 服务示例

```bash
# FL2VA（文本/首末帧 → 视频）
sglang serve \
  --model-path MiniMaxAI/MiniMax-H3 \
  --num-gpus 4 \
  --ulysses-degree 4 \
  --performance-mode speed \
  --host 0.0.0.0 \
  --port 30010 \
  --model-variant fl2va

# Ref2VA（参考图像/视频/音频 → 视频）
sglang serve \
  --model-path MiniMaxAI/MiniMax-H3 \
  --num-gpus 4 \
  --ulysses-degree 4 \
  --performance-mode speed \
  --host 0.0.0.0 \
  --port 30011 \
  --model-variant ref2va
```

### 5.4 完整 2K 工作流（API + 本地混合）

开源权重可在本地复现 768p 输出；结合官方 API 可复现 2K 质量。

1. **H3-Context-IR**（`POST /v2/h3_context_ir`）：本地生成前将输入转换为结构化提示，对最终质量至关重要，强烈推荐。
2. **H3-Base（本地 SGLang）**：基于转换后的提示生成 768p 视频。
3. **H3-Regenerate-2K**（`POST /v2/video_regeneration`）：将 768p 结果与原上下文一起再生成至 2K。

```bash
# 环境变量
export SGLANG_DEPLOYMENT_URL="<sglang-deployment-url>"
export MINIMAX_API_BASE="https://api.minimax.io"   # 或 https://api.minimaxi.com（中国）
export TOKEN="<token>"
```

### 5.5 许可证

H3 按 **MiniMax H3 Community License Agreement** 分发。

- 年收入 **低于 2000 万美元**的组织可商用。
- 权重可下载、修改、微调。
- 超过该门槛需另行协商商业许可。
- 官方许可文件：`huggingface.co/MiniMaxAI/MiniMax-H3` 中的 `LICENSE`。

---

## 6. 使用示例 — T2V · I2V · Ref2V

H3 依据 `content` 数组组合支持多种生成场景。

### 6.1 文本转视频（T2V）

```json
{
  "model": "MiniMax-H3",
  "content": [
    { "type": "text", "text": "A cinematic product commercial of a luxury watch floating above a city at dawn, dramatic lighting" }
  ],
  "resolution": "2K",
  "duration": 5,
  "ratio": "16:9"
}
```

### 6.2 图像转视频（I2V）— 首/末帧

```json
{
  "model": "MiniMax-H3",
  "content": [
    { "type": "text", "text": "Pull focus to the people in the background and add more steam to the ramen bowl." },
    { "type": "image_url", "image_url": { "url": "https://example.com/first_frame.png" }, "role": "first_frame" },
    { "type": "image_url", "image_url": { "url": "https://example.com/last_frame.png" }, "role": "last_frame" }
  ],
  "resolution": "2K",
  "duration": 5,
  "ratio": "adaptive"
}
```

### 6.3 参考转视频（Ref2V）— 视频编辑、语音与音乐

```json
{
  "model": "MiniMax-H3",
  "content": [
    {
      "type": "text",
      "text": "Character speaks: Follow the wind, live free. Voice timbre follows reference audio 1."
    },
    { "type": "video_url", "video_url": { "url": "https://example.com/source.mp4" }, "role": "reference_video" },
    { "type": "audio_url", "audio_url": { "url": "https://example.com/voice.mp3" }, "role": "reference_audio" }
  ],
  "resolution": "2K",
  "duration": 5,
  "ratio": "adaptive"
}
```

### 6.4 role 组合规则

| 场景 | content 组成 |
|------|--------------|
| T2V | 仅 text |
| I2V 首帧 | text + 1 张图像（`first_frame`，或省略 role） |
| I2V 末帧 | text + 1 张图像（`last_frame`） |
| I2V 首末帧 | text + 2 张图像（`first_frame` + `last_frame`） |
| Ref2V | text + 参考图像（`reference_image`）/视频（`reference_video`）/音频（`reference_audio`）任意组合；音频不能单独输入，至少需要 1 张图像或视频 |

> 注意：I2V 与 Ref2V **互斥**。只要出现 `reference_*` role，就不能使用 `first_frame`/`last_frame`。

---

## 7. 优点

- **开源权重的自由度**：下载权重即可在本地或私有环境部署，强化数据安全；无需按次 API 费用，可针对特定领域微调。
- **顶尖性能**：视频编辑全球第一、文本转视频第二。已成熟到可直接投入广告、品牌、电商、游戏等商业内容制作。
- **全模态输入**：可同时输入文本、图像、视频、音频，用自然语言执行复合指令，例如"参考该视频的镜头运动，让那张图片中的人物用这个声音演唱"。
- **原生立体声音频**：随视频一并生成 32kHz 立体声，无需单独的 TTS、音乐、音效流程，一次同步完成音视频。
- **颠覆性成本效率**：2K 每秒价格不足主流模型 1/3，768p 不足主流 720p 一半。与 M3 LLM 的价格策略（闭源模型 5%~10%）一脉相承。
- **长片段**：单次生成最长 15 秒 + 多片段参考，可自然编排多镜头。
- **生态快速落地**：发布后立刻出现官方 ComfyUI 集成与多个 HuggingFace Spaces 演示（多模态、Ref2VA、FL2VA 等）。

---

## 8. 缺点

- **硬件要求**：33B dense 模型要在本地流畅运行，需要高端 GPU（推荐 4 卡）等昂贵基础设施。
- **部分模块未开源**：H3-Context-IR 与 H3-Regenerate-2K 仅提供 API。要完整复现最高质量（尤其 2K），即便本地部署也需结合官方 API。
- **许可证限制**：MiniMax 社区许可证限制年收入超过 2000 万美元企业商用。
- **独立验证有限**：公布的基准（如视频编辑第一）为 MiniMax 自测数据，需独立机构验证。
- **中资企业背景**：数据安全与监管顾虑可能使部分国家/企业受限。
- **生成质量不稳定**：人脸、手部、精细文字仍有短板，常需提示词调优或多次重新生成（seed）。
- **监管与版权风险**：肖像权、品牌标识、音乐版权、深度伪造滥用等使其受到生成式媒体监管约束。

---

## 9. 对视频制作/编辑产业的影响

H3 不只是"生成一段视频"，而可能改变**整个视频制作流水线**。视频编辑第一的成绩尤其值得关注。

### 9.1 制作成本骤降

- 2K 每秒成本不足主流模型的 1/3。一段 30 秒品牌视频的直接生成成本可能降至过去的 1/10 甚至更低。
- 使用开源权重 + 本地部署，**每秒计费直接消失**。只要有 GPU，视频边际成本降到电费级别。
- 结合 M3 式"闭源模型价格 5%~10%"策略，整个生成式媒体市场的价格下限或被重塑。

### 9.2 编辑范式转变：从"操作"到"描述"

传统编辑是在时间线上裁剪、拼接、加滤镜。H3 则是**用自然语言描述期望结果，一次性重新生成视频与音频**。

- 只替换场景人物、背景、氛围的 V2V 编辑
- 借用参考视频镜头运动、应用参考音频音色的复合编辑
- 指定首末帧、导演"中间场景"的帧锚定编辑
- 用 4 秒音视频参考拼接 15 秒多镜头的分镜规划

换言之，范式从"剪辑为中心"转向"意图为中心"。Adobe、达芬奇等传统 NLE 工具的核心价值部分面临被生成引擎吸收的压力。

### 9.3 制作主体的民主化

- 只要有导演/剧本创意，**个人或小团队即可制作广告、品牌、电商、产品演示视频**。
- 过去需要外包的东西 — 产品网站动态横幅、动画海报、片头标题、UI/UX 演示 — 现在用一句提示即可产出。
- 语言壁垒也降低。支持 11 种语言对话，无需另行选角即可生成本地化视频。

### 9.4 工作流转变：从"片段生成"到"全面参与制作"

正如 MiniMax 路线图所述，视频模型将超越单一片段生成器，**参与内容制作的整个流程**。

- 预演：剧本 → 分镜视频 → 拍摄前方向验证
- 外景/背景/CG 替换：以生成背景替代实拍（产品视频、室内、建筑演示）
- 自动语音/音乐/音效：从参考素材一次性合成台词、旁白、BGM、SFX
- 版本与 A/B 测试：批量生成营销创意并对比效果

### 9.5 分行业影响汇总

| 行业 | 影响 |
|------|------|
| 广告/营销 | 创意 A/B 测试成本骤降；品牌一致性更易保持（品牌渲染精度是其强项） |
| 电商 | 由单张照片生成商品视频、360 演示、生活方式镜头 |
| 游戏 | 快速生成电影级预告、角色动作参考、概念视频 |
| 影视 | 预演、美术设计、VFX 辅助。注意人物/面部再现的法律风险 |
| 广电/YouTube | 个人媒体直接制作高质量背景、动态缩略图、片头 |
| 教育/研究 | 即时生成演示与讲解视频，用于学习与汇报 |

### 9.6 风险与应对

- **就业结构变化**：自动化的压力会从低端剪辑、动态图形岗位开始。同时诞生结果审核、策展、法务校验等新角色。
- **深度伪造与欺诈**：参考式人脸/语音编辑变得容易，水印与检测技术的重要性上升。
- **版权与肖像权**：参考素材与生成结果的权属模糊，合同与许可管理成为必需。
- **媒体素养**：针对"生成视频"的标识监管预计会加强。

总之，H3 类模型降低了视频制作成本下限、使制作主体大众化，并把编辑范式从"编辑"推向"生成"，可能成为**产业结构性变革的催化剂**。

---

## 10. 主要竞争对手

MiniMax H3 面临以下强劲对手。

- **字节跳动（Seedance）**：视频 AI 领域 H3 的直接竞争者。
- **Google（Veo · Gemini）**：文本转视频与多模态生成的重要力量。Gemini 3.1 Pro、Gemini Omni Flash 是 M3、H3 的强劲对手。
- **OpenAI（Sora）**：文本转视频第一梯队，Sora 2 以来主导生成式媒体市场。
- **Runway**：以电影化编辑与控制见长（Gen-4 等）。
- **可灵（快手 Kling）**：中国视频生成头部玩家。
- **其他中国开源权重阵营**：文本 LLM 方面，DeepSeek（R1、V4-pro）、Qwen（阿里，Qwen3-235B、Qwen3.7-Max）、Moonshot AI（Kimi）与 M1/M3 竞争，部分正扩展视频模型。

---

## 11. 总结

MiniMax 继 M1/M3（文本推理与编码）之后，以 **H3（视频生成）** 将开源权重战略扩展到全模态媒体。顶尖性能（视频编辑第一）、最高 2K、15 秒、带立体声的视频生成、不足主流 1/3 的价格、向年收入 2000 万美元以下组织开放的社区许可证 — H3 是开源权重生态进军长期被闭源视频模型主导市场的信号。

尤其在视频制作/编辑产业，H3 ① 将制作成本从按秒计费降到 GPU 边际成本；② 转向自然语言、意图为中心的编辑范式；③ 加速个人与小型团队制作的民主化。只要明确识别独立基准验证与许可/监管风险，H3 就是广告、电商、游戏、广电等广泛视频工作流中的现实可落地候选。

---

## 参考资料

- MiniMax H3 官方博客：<https://www.minimax.io/blog/minimax-h3>
- HuggingFace 模型：<https://huggingface.co/MiniMaxAI/MiniMax-H3>
- API Reference（Video Generation V2）：<https://platform.minimax.io/docs/api-reference/video-generation-v2-create>
- Query Task API：<https://platform.minimax.io/docs/api-reference/video-generation-v2-query>
- SGLang cookbook（MiniMax-H3）：<https://docs.sglang.io/cookbook/diffusion/MiniMax/MiniMax-H3>
- vLLM recipes：<https://recipes.vllm.ai/MiniMaxAI/MiniMax-H3>
- ComfyUI 集成：<https://github.com/Comfy-Org/ComfyUI> · <https://docs.comfy.org/tutorials/video/minimax/minimax-h3>
