---
title: "Ollama 安装与基础使用方法——为 Token 拮据者搭建本地 LLM 环境"
description: "使用 Ollama 免费搭建本地 LLM 环境的分步指南，以及主流开源 LLM 的对比"
lang: zh
featured: false
schema_type: TechArticle
keywords:
  - Ollama
  - 本地 LLM
  - 开源 LLM
  - Llama
  - Qwen
tags:
  - LLM
  - Ollama
  - 本地 AI
  - 开源
---

# Ollama 安装与基础使用方法——为 Token 拮据者搭建本地 LLM 环境

每次使用 ChatGPT 或 Claude 这类高性能 AI 模型时,是否都要担心 API 费用?如果能在自己的电脑上直接运行 LLM,无需联网、无需担心费用,会怎样呢?本文将带你一步步用 **Ollama** 搭建属于自己的本地 LLM 环境,完全无需 token 费用。文档后半部分还会介绍最新开源 LLM 模型的特点与优缺点,帮助你找到最适合自己电脑配置的模型。

> **Ollama** 是一款可以在本地电脑上像运行 Docker 容器一样轻松运行 Llama、Mistral、Gemma 等各类开源 LLM 的工具。

## 目录

- [1. Ollama 是什么?](#1-ollama-是什么)
- [2. 安装 Ollama](#2-安装-ollama)
- [3. Ollama 基础用法](#3-ollama-基础用法)
- [4. 主流 LLM 模型对比(优缺点与特点)](#4-主流-llm-模型对比优缺点与特点)
- [5. 根据自己电脑选择合适的模型指南](#5-根据自己电脑选择合适的模型指南)
- [6. 值得一看的技巧与工具](#6-值得一看的技巧与工具)
- [7. 参考资料](#7-参考资料)

## 1. Ollama 是什么?

Ollama 是一个**能够在本地环境中轻松运行和管理大语言模型(LLM)的开源框架**。正如 Docker 将应用打包为容器一样,Ollama 将模型权重与配置捆绑在一起,使其能够轻松运行。安装后,只需几行命令,就能在自己的电脑上运行 Meta 的 Llama、Mistral 的 Mistral、Google 的 Gemma 等各种 LLM。

### 为什么要使用 Ollama?(摆脱 Token 拮据)

| 优点 | 说明 |
|------|------|
| **零成本** | 没有任何按 API 调用计费的费用。无限提问也无需担心账单 |
| **完全的隐私保护** | 所有数据都保留在自己的电脑上。即使是敏感文档也可以放心分析 |
| **离线运行** | 只要下载了模型,即可在任何地方无需联网使用 |
| **响应迅速** | 没有网络延迟,可以获得即时响应 |
| **自由实验** | 可以随意切换各种模型进行测试 |
| **出色的可扩展性** | 与 REST API、Python 集成、IDE 扩展等多种工具集成 |

## 2. 安装 Ollama

### 前提条件(硬件检查)

Ollama 可在所有主流操作系统上运行,但要顺畅运行模型,建议至少准备 **8GB 内存**(推荐 16GB)。作为参考,一个经过 **Q4_K_M 量化的 70 亿(7B)参数模型**大约需要 **4-6GB** 内存。

| 模型大小 | Q4 量化下所需内存(估算) |
|-----------|--------------------------------|
| 3B ~ 8B(小型) | 4GB ~ 6GB |
| 13B ~ 20B(中型) | 8GB ~ 16GB |
| 32B ~ 40B(大型) | 20GB ~ 32GB |
| 70B 以上(超大型) | 40GB 以上 |

如果有 GPU 可以获得更快的推理速度,但并非必需——仅用普通 CPU,以 70 亿(7B)参数模型为基准,每秒也能生成约 5-15 个 token。

---

### Windows

1. 在 [Ollama 官方下载页面](https://ollama.com/download)下载 Windows 安装文件(`OllamaSetup.exe`)。
2. 运行下载的文件完成安装。
3. 安装完成后,打开**PowerShell 或命令提示符(CMD)**,用以下命令确认安装是否成功。

   ```bash
   ollama --version
   ```

---

### macOS

- **使用官方安装文件**
  在 [ollama.com](https://ollama.com) 下载 macOS 版文件并安装。
- **使用 Homebrew(推荐)**
  ```bash
  brew install ollama
  ```

---

### Linux

在终端中运行以下命令。支持 Ubuntu、Debian、Fedora、CentOS 等大多数发行版。

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

---

### Docker(可选)

如果希望采用基于容器的部署方式,可以使用 Docker 镜像。

```bash
docker pull ollama/ollama
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

> `11434` 是 Ollama API 的默认端口号。

### 验证安装

用以下命令确认 Ollama 服务是否正常运行。

```bash
ollama serve   # 确认服务器是否正在运行
```

在 `http://localhost:11434` 可以看到表明 Ollama 服务器正在运行的输出。

## 3. Ollama 基础用法

### 运行第一个模型——最简单的方法

```bash
ollama run llama3.2
```

只需这一行命令即可!如果该模型本地尚未存在,会自动下载后启动交互式提示界面。

```
>>> 你好,你是谁?
我是 Meta 的 Llama 3.2 模型。有什么可以帮您的吗?
```

### 模型管理命令

| 命令 | 说明 |
|--------|------|
| `ollama list` | 查看已下载的模型列表 |
| `ollama pull <模型名>` | 仅下载模型(不运行) |
| `ollama run <模型名>` | 下载模型+启动对话 |
| `ollama rm <模型名>` | 删除模型 |
| `ollama cp <模型名> <新名称>` | 复制模型 |
| `ollama show <模型名>` | 查看模型详细信息 |

### 一个小技巧——利用模型标签

在模型名后面加上 `:latest` 或特定标签,即可指定想要的版本。需要注意的是,`:latest` 并不总是指向性能最好的模型,因此建议尽量使用具体的标签。

```bash
# 示例: 指定特定大小和量化版本
ollama run llama3.1:8b-q4_K_M
```

### 在 Python 中使用 Ollama

由于 Ollama 提供 REST API,可以轻松与 Python 等多种语言集成。

```python
import requests

response = requests.post(
    "http://localhost:11434/api/generate",
    json={"model": "llama3.2", "prompt": "你好,很高兴见到你!", "stream": False}
)

print(response.json()["response"])
```

## 4. 主流 LLM 模型对比(优缺点与特点)

Ollama 支持 500 多个模型。以下整理了截至 2025-2026 年备受关注的主要模型的优缺点与特点。

### Llama 4 系列(Meta)

| 类别 | Llama 4 Scout | Llama 4 Maverick |
|------|---------------|------------------|
| **结构** | 170 亿激活参数,16 个 MoE 专家 | 170 亿激活参数,128 个 MoE 专家 |
| **特点** | 业界最高水准的 **1000 万(10M)token** 上下文窗口 | 1000 万 token 上下文,完全原生支持图像+文本 |
| **主要基准** | MMLU Pro 74.3 / GPQA Diamond 57.2 | MMLU Pro 80.5 / GPQA Diamond 69.8 |
| **预估硬件** | 单张 H100 GPU(Int4 量化基准) | 单个 H100 主机 |
| **效率(预估)** | 约 $0.19-$0.49 / 百万(1M)token | 约 $0.19-$0.49 / 百万(1M)token |

> **Llama 4 是首个公开发布的完全原生(natively)多模态开放权重模型**,可以同时理解图像和文本。

**优点**
- **压倒性的 1000 万(10M)上下文**: 可一次性输入并分析整本小说。
- **出色的多模态性能**: 图像识别与分析能力强。
- **混合专家(MoE)结构**: 通过优化激活参数实现高效率。

**缺点**
- 需要高规格硬件(尤其是显存 VRAM)。
- 初始下载容量较大。
- 若要完全离线使用,需要经过优化的量化版本。

---

### Mistral Small 3.1(Mistral AI)

| 类别 | 详情 |
|------|------|
| **参数** | 240 亿(24B) |
| **上下文** | 12.8 万(128k)token |
| **推理速度(预估)** | 150 token/秒 |
| **多模态** | 支持文本 + 图像输入 |
| **许可证** | Apache 2.0(完全开放) |

> Apache 2.0 许可证是允许商业使用、修改、再分发的非常开放的许可证。

**优点**
- **Apache 2.0 完全开放许可证**: 商业使用也很自由。
- **速度与性能的出色平衡**: 即便是 240 亿(24B)参数,推理速度依然很快。
- **多语言支持优势**: 支持包括韩语在内的多种语言。

**缺点**
- 要流畅运行 240 亿(24B)参数模型需要高规格硬件。部分测试显示,即使在 256GB 内存与双 A100 环境下,处理长上下文时也出现过瓶颈现象。
- 理论最高速度(150 token/秒)在实际本地环境中可能难以达到。

---

### Gemma 4 / Gemma 3 系列(Google)

| 模型 | 参数 | 所需显存(VRAM,预估) | 特点 |
|------|----------|-------------------|------|
| Gemma 4 E2B / E4B | 约 20 亿-40 亿(预估) | 15GB 左右 | 小巧高效的模型,**在数学(Math)及科学(ARC)基准上表现强劲** |
| Gemma 4 26B-A4B | 260 亿(26B) | 48GB 左右 | MoE 结构,推理与编码能力优秀 |
| Gemma 3 4B | 40 亿(4B) | 约 3-5GB | **超轻量级**,成本效益最大化 |

> 2026 年的研究显示,Gemma 模型在 ARC(科学推理)和 Math(数学)领域表现尤为突出。

**优点**
- **针对轻量化优化**: 用较少的计算资源即可获得出色性能。
- **科学推理能力**: 在数学、逻辑问题上表现出色。
- **Gemma 3 4B 性价比最强**: 每秒成本比同类竞品低约 12 倍。

**缺点**
- 在编码领域,同等规模下可能略逊于 Qwen。
- 想发挥最佳性能需要合适的提示词策略(如 Few-shot CoT)。

---

### Phi-4(Microsoft)

**优点**
- **TruthfulQA(事实性)基准最强**: 擅长生成基于事实的准确回答。
- **推理专用模型表现突出**: 存在 Phi-4-mini-reasoning 等专门用于推理的变体。
- 资源需求相对合理。

**缺点**
- 依提示方式不同,性能差异较大。尤其在 Few-shot CoT(少样本思维链)方式下,曾报告出现性能急剧下降的案例。
- 相比通用对话,更适合特殊用途(推理、事实核查)。

---

### Qwen 2.5 / Qwen 3 系列(Alibaba)

| 模型 | 参数 | 所需显存(VRAM,预估) | 主要基准 |
|------|----------|-------------------|----------|
| Qwen2.5 7B | 70 亿(7B) | 约 6GB | 在 6 项任务上优于 Gemma 3 4B |
| Qwen2.5-Coder 32B | 320 亿(32B) | 约 20GB | **HumanEval 92.7%(GPT-4o 水准)** |
| Qwen2.5 32B | 320 亿(32B) | 约 20GB | MMLU 83.2 |
| Qwen3 30B-A3B | 300 亿(30B) | 30-40GB | MoE 结构,具备最新推理能力 |

> Qwen2.5 7B Instruct 在 8 个共同基准中的 **6 项上超越了 Gemma 3 4B**。

**优点**
- **编码领域的最强者**: Qwen2.5-Coder 32B 的 HumanEval 达到 92.7%,可与 GPT-4o 相媲美。
- **出色的多语言性能**: 不仅支持中文,还支持英语及多种其他语言。
- **规格阵容广泛**: 从 7B 到 320 亿(32B)、700 亿(70B)以上均有多种选择。

**缺点**
- 部分小型模型(如 7B)可能存在输出长度限制(Gemma 3 4B 输出也支持 128k,而 Qwen2.5 7B Instruct 限制在 8192 token)。
- 若要发挥最强性能,需要相对较高规格的硬件。

---

### Llama 3.3 70B(Meta)

**优点**
- **截至 2026 年综合质量第一(MMLU 86.0)**
- 相比 4050 亿(405B)模型,在保持相似性能的同时更加高效。
- 适合大规模工作负载(如合成数据生成)。

**缺点**
- **需要约 40GB 以上显存(VRAM)**,硬件要求非常高。
- 更适合企业/专业用户,而非普通用户。
- 下载容量较大(数十 GB)。

---

### 模型对比汇总表

| 模型 | 适宜显存(VRAM,预估) | 最强领域 | 优点 | 缺点 |
|------|--------------------------|----------|------|------|
| **Llama 4 Scout** | 约需 H100 GPU | 长文本分析 | 1000 万(10M)上下文,多模态 | 需要高规格硬件 |
| **Llama 4 Maverick** | 约需 H100 主机 | 综合多模态 | 高性能,图像理解 | 需要高规格硬件 |
| **Mistral Small 3.1** | 24GB+ | 多语言对话 | 速度/质量平衡,完全开放 | 长上下文处理时负载较大 |
| **Gemma 4 / 3** | 4GB-48GB | 数理/科学推理 | 轻量化/高效率,成本低 | 编码性能相对较弱 |
| **Phi-4** | 约 16GB+ | 基于事实的问答 | TruthfulQA 表现强 | 存在提示词偏差 |
| **Qwen 2.5/3** | 6GB-40GB | **编码**(最强) | 编码能力达 GPT-4o 级,规格多样 | 部分模型有输出限制 |
| **Llama 3.3 70B** | 约 40GB+ | 综合质量(MMLU 最高) | 性能压倒性领先 | 硬件要求非常高 |

## 5. 根据自己电脑选择合适的模型指南

以下按硬件配置推荐相应模型。

### 低配置(内存 8GB / 显存 4GB 以下)

| 推荐模型 | 安装命令 | 特点 |
|-----------|-------------|------|
| **Llama 3.2 3B** | `ollama pull llama3.2` | Meta 最新小型模型,适合通用对话 |
| **Gemma 3 4B** | `ollama pull gemma3:4b` | 性价比最强,科学推理能力强 |
| **Phi-4-mini** | `ollama pull phi4-mini` | 事实性较高的回答 |

### 中等配置(内存 16GB / 显存 8GB)

| 推荐模型 | 安装命令 | 特点 |
|-----------|-------------|------|
| **Llama 3.1 8B** | `ollama pull llama3.1:8b` | 最受大众欢迎的模型,通用性最佳 |
| **Qwen2.5 7B** | `ollama pull qwen2.5:7b` | 编码/多语言能力强 |
| **Mistral 7B** | `ollama pull mistral` | 经过验证的 7B 模型 |

### 高配置(显存 24GB 以上)

| 推荐模型 | 安装命令 | 特点 |
|-----------|-------------|------|
| **Qwen2.5-Coder 32B** | `ollama pull qwen2.5-coder:32b` | **编码最强者**(HumanEval 92.7%) |
| **Qwen2.5 32B** | `ollama pull qwen2.5:32b` | 最佳中型全能选手(MMLU 83.2) |
| **Mistral Small 22B** | `ollama pull mistral-small:22b` | 多语言专长 |

### 超高配置(显存 48GB 以上)

| 推荐模型 | 安装命令 | 特点 |
|-----------|-------------|------|
| **Llama 3.3 70B** | `ollama pull llama3.3:70b` | **综合质量第一**(MMLU 86.0) |
| **DeepSeek R1 Distill 70B** | `ollama pull deepseek-r1:70b` | 推理专用模型 |

### 模型选择技巧
- **"最大的模型未必总是最佳答案"**: 与自己电脑配置相匹配的合适规模模型往往能带来更流畅的体验。
- **积极利用量化版本(如 Q4_K_M)**: 可在略微牺牲精度的情况下大幅降低内存占用。
- 尽量使用具体标签而非 `:latest`(例如 `qwen2.5-coder:32b`)。

## 6. 值得一看的技巧与工具

### Open WebUI——Ollama 的网页界面

如果不习惯使用终端,可通过以下命令搭建类似 ChatGPT 风格的网页界面。

```bash
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

### VS Code 扩展——Continue

安装 Continue 扩展后,可以在 VS Code 中将 Ollama 模型用作编码助手。

### LangChain + Ollama 集成

```python
from langchain_ollama import ChatOllama

llm = ChatOllama(model="llama3.2")
response = llm.invoke("你好,欢迎来到 LLM 的世界!")
print(response.content)
```

### 通过环境变量优化性能

可以尝试设置以下环境变量来优化推理速度和内存管理。

```bash
export OLLAMA_NUM_PARALLEL=4      # 并发请求数(默认值: 1)
export OLLAMA_MAX_LOADED_MODELS=2 # 最大同时加载模型数
export OLLAMA_HOST=0.0.0.0        # 允许所有接口访问 API
```

### 更改模型存储位置

默认存储在 `~/.ollama/models`。若要更改,请设置以下环境变量。

```bash
export OLLAMA_MODELS=/path/to/your/models
```

## 7. 参考资料

- **Ollama 官方主页** — [https://ollama.com](https://ollama.com)
- **Ollama GitHub 仓库** — [https://github.com/ollama/ollama](https://github.com/ollama/ollama)
- **Ollama 官方文档** — [https://docs.ollama.com](https://docs.ollama.com)
- **Ollama 模型库** — [https://ollama.com/library](https://ollama.com/library)
- **Meta Llama 4 官方博客** — [https://ai.meta.com/blog/llama-4-multimodal-intelligence/](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)
- **Mistral Small 3.1 发布公告** — [https://mistral.ai/news/mistral-small-3-1](https://mistral.ai/news/mistral-small-3-1)
- **Gemma 4 / Phi-4 / Qwen3 性能对比论文(arXiv:2604.07035)** — [https://arxiv.org/abs/2604.07035](https://arxiv.org/abs/2604.07035)
- **Gemma 3 vs Qwen2.5 基准对比** — [https://llm-stats.com](https://llm-stats.com)
- **Ollama 安装指南(SitePoint,2026)** — [https://www.sitepoint.com/ollama-setup-guide-2026/](https://www.sitepoint.com/ollama-setup-guide-2026/)
- **Ollama 完全指南(DEV Community)** — [https://dev.to/ajitkumar/the-complete-guide-to-ollama-run-large-language-models-locally-2mge](https://dev.to/ajitkumar/the-complete-guide-to-ollama-run-large-language-models-locally-2mge)

至此,我们一起了解了**Ollama 的安装及主流 LLM 模型对比**。现在就可以在自己的电脑上尽情运行 LLM,无需再担心 token 费用。API 成本为零,隐私也能得到完美保护。祝你在本地 AI 的世界中构建愉快!
