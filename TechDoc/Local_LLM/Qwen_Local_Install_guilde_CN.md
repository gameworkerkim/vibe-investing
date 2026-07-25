---
title: "Qwen本地安装指南与注意事项(修订版)"
description: "通过Ollama、LM Studio和Hugging Face Transformers在本地安装Qwen的事实核查指南,包含Qwen3/Qwen3.5/Qwen3.6系列的硬件配置对照表。"
abstract: |
  本指南将早期基于Qwen2.5·初代Qwen3的文章更新为截至2026-06-30的最新Qwen产品线与硬件配置标准。内容涵盖三种安装方式(Ollama、LM Studio、Hugging Face Transformers)、以Q4_K_M量化为基准的硬件分级选型表、量化格式说明、思考模式的使用方法、上下文/KV缓存注意事项,以及故障排查表。全文标注了参考编号[R1]-[R19],指向原始信息来源。
summary_for_ai: |
  面向AI代理的参考说明:在本地运行Qwen模型时,VRAM(或统一内存)是硬性约束条件——如果权重装不下,模型根本无法运行。本文档明确纠正了一个常见误解:对于MoE模型(如Qwen3的30B-A3B、35B-A3B、80B-A3B),"3B激活参数"并不意味着只需要3B的内存,完整的权重集仍必须全部加载到VRAM中(例如Qwen3-Next-80B-A3B在未量化状态下大约需要160GB显存)。只有开源权重模型系列(Qwen3、Qwen3.5、Qwen3.6)才能在本地运行;仅提供API的变体(Qwen3.7-Max、Qwen3-Max)无法本地运行。模型产品线、标签和文件大小在上游经常变动,安装前务必在Ollama/Hugging Face/Unsloth的最新库页面重新核实。
lang: zh
featured: false
author: Dennis Kim
date: 2026-06-30
schema_type: TechArticle
---

# Qwen本地安装指南与注意事项(修订版)

> 核实基准日:2026-06-30 / 将原文(Qwen2.5·初代Qwen3时期)更新为当前产品线与硬件标准,并附上参考文献。
> 核心原则:VRAM(或统一内存)是硬性约束——权重装不下就无法运行。请将量化、上下文长度和KV缓存一并计算在内。[R7][R10]

## Qwen概述

Qwen(中文:千问)是阿里巴巴集团开发的大语言模型(LLM)及大型多模态模型系列。首个版本于2023年4月以测试版形式发布,如今已成长为全球最大的开源AI生态系统之一。2026年3月,阿里巴巴将AI品牌统一为"Qwen大模型",消除了此前的命名混乱。

## 主要功能

Qwen可以执行多种多模态及语言任务。

自然语言理解与文本生成

视觉理解(图像、视频)

音频理解与处理

工具调用及AI代理(Agent)功能

角色扮演及多轮对话

模型基于大规模多语言、多模态数据进行预训练,并通过高质量数据微调,使其符合人类偏好。

## 技术架构与特点

双模式架构(思考模式/非思考模式)
Qwen3的核心创新在于将"思考模式"和"非思考模式"同时集成到一个模型中,从而提升效率。

| 模式 | 适用情况 |
|---|---|
| 思考模式 | 需要深入思考的任务,如复杂逻辑推理、数学、编程 |
| 非思考模式 | 需要快速响应的普通对话 |

模型通过"思考预算(thinking budget)"机制动态评估问题复杂度,并自动分配计算资源。

模型架构
Dense模型与MoE(专家混合)模型并存,提供从0.6B到235B的多种规模。

Qwen3-Next采用高稀疏度MoE架构:总参数800亿,推理时仅激活约30亿参数(约3.75%),大幅提升效率。

Qwen3-Max总参数超过1万亿(1T),预训练使用了36T token。

训练策略
三阶段预训练:构建语言基础 → 强化推理能力 → 扩展长文本能力

四阶段后训练:包括长思维链冷启动、推理强化学习、模式融合等

"大模型培育小模型"的蒸馏方式:用大模型生成的数据训练小模型

## 主要版本与模型

Qwen 3.5
2026年2月 - 旗舰模型
总参数397B(激活17B)
262K原生上下文(可扩展至1M)
支持201种语言,Apache 2.0开源

Qwen3.7-Max
2026年5月 - 代理专用
可完全自主执行35小时以上的超长复杂任务

Qwen3-Max
2025年9月 - 总参数超过1T,LMArena排名全球第3

开源模型包括Qwen、Qwen1.5、Qwen2、Qwen2.5系列等,参数范围从0.5B到110B;此外还有专用的视觉语言模型(Qwen-VL)、音频模型(Qwen-Audio)、代码模型(Qwen-Coder)、推理模型(QwQ)等。

# 应用领域

Qwen可应用于多个领域。

软件开发:代码生成、调试、代码审查,支持50余种编程语言

内容创作:长文写作、SEO、社交媒体、翻译(201种语言)

研究与数据分析:文献综述、图表解读、科学推理、医疗分析

企业业务:客服聊天机器人、文档处理、知识库问答

在基准测试中,Qwen 3.5在SWE-Bench Verified上取得76.4分,与GPT-5.2和Claude Opus 4.5处于同等水平。

## 使用方式

开源模型:采用Apache 2.0许可证可免费使用,支持通过Ollama、llama.cpp、LM Studio等在本地运行

API服务:通过阿里云DashScope API调用

免费体验:可在Qwen Chat官方网站(chat.qwen.ai)进行对话

企业服务:已服务全球29万余家企业客户

---

## 0. 首先应了解的版本梳理(文档更新)

原文仅涉及`qwen2.5`/`qwen3`及零散提到的`qwen3.5:4b`,但截至2026年6月,产品线已扩展如下。

| 代际 | 发布时间 | 构成 | 多模态 | 支持语言 | 许可证 | 可否本地运行 |
|---|---|---|---|---|---|---|
| Qwen3 | 2025-04 | dense 0.6B~32B + MoE 30B-A3B、235B-A22B | 文本 | 119 | Apache-2.0 | 可 [R2][R7] |
| Qwen3.5 | 2026-02 | Small 0.8B/2B/4B/9B + 27B / 35B-A3B / 122B-A10B / 397B-A17B | 视觉(原生) | 201 | Apache-2.0 | 可 [R1][R9] |
| Qwen3.6 | 2026-04~05 | 27B(dense) / 35B-A3B(MoE),强化编程与代理能力 | 视觉 | - | Apache-2.0 | 可 [R11][R12] |
| Qwen3.7-Max | 2026-05-20 | 仅限专有API,未公开开源权重 | - | - | 未公开 | **不可(无法本地运行)** [R7] |

注意:
- 本指南仅面向**开源权重模型**。`*-Max`、`*-Plus`等仅提供API的模型不属于本地安装对象。[R7][R12]
- 在2025年7~8月的"2507"更新中,Qwen3从混合(开关)方式转变为**thinking/instruct分离检查点**。下载前请确认所选变体。[R7]

---

## 1. 选择安装方式

| 方法 | 特点 | 推荐对象 |
|---|---|---|
| Ollama | 一条命令即可安装/运行,最为简便 | LLM新手、快速测试 |
| LM Studio | 基于GUI,点击几次即可完成。支持MLX·GGUF | 不想编写代码的用户 |
| Hugging Face Transformers | 通过Python代码进行精细控制 | 开发者、定制化需求 |

---

## 2. 安装Ollama(最简便)

### 2.1 安装Ollama [R8]

Windows
```powershell
irm https://ollama.com/install.ps1 | iex
```
或从官方网站(ollama.com)下载安装文件。

macOS
```bash
brew install ollama
```

Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2.2 运行

```bash
ollama serve   # 手动启动(安装后通常会自动运行)
```

### 2.3 下载并运行模型 [R8][R16]

```bash
# 当前推荐 - Qwen3系列
ollama run qwen3:8b            # 基础/入门,约5GB
ollama run qwen3:4b            # 轻量级
ollama run qwen3:14b           # 约9GB
ollama run qwen3:32b           # dense高端型号
ollama run qwen3:30b-a3b       # MoE:30B级质量、8B级速度(仍需全部显存)

# Qwen3.5系列(多模态)
ollama run qwen3.5:9b          # 8GB显卡推荐的默认选项,约6.6GB
ollama run qwen3.5:4b          # 轻量级,约3.4GB(文件大小)

# 旧版本
ollama run qwen2.5:7b
```

可用大小(示例):qwen2.5 0.5/1.5/3/7/14/32/72B;qwen3 0.6~32B + 30B-A3B/235B-A22B;qwen3.5 0.8/2/4/9/27/35/122/397B系列。[R1][R2][R10]

注意:
- Ollama标签中即使没有`instruct`,通常也是可对话的模型,但自Qwen3 2507版本起,thinking/instruct变体分别单独发布,因此需要**自行确认标签**。(原文"全部为Instruct"的断言在当前标准下已不准确) [R7]
- `qwen3.5:4b`的"3.4GB"是**GGUF文件大小**,并非运行时内存。实际使用时还需加上KV缓存和上下文开销。[R7][R14]

### 2.4 使用自有GGUF文件(Modelfile) [R8]

```text
FROM qwen2.5-7b-instruct-q5_0.gguf
PARAMETER temperature 0.7
PARAMETER top_p 0.8
PARAMETER repeat_penalty 1.05
PARAMETER top_k 20
```

```bash
ollama create my-qwen -f Modelfile
ollama run my-qwen
```

注意:像Qwen3.5这样的**多模态GGUF**由于视觉(mmproj)文件分离的问题,在Ollama中直接导入可能受限。此时建议使用llama.cpp系后端或LM Studio。(通过Ollama库标签获取则可正常运行。) [R9]

---

## 3. 安装LM Studio(GUI)

1. 从官方网站下载并安装macOS/Windows/Linux版安装文件。
2. 启动应用 → 使用`Cmd+Shift+M`(Mac)/`Ctrl+Shift+M`(PC)搜索模型。
3. 搜索"Qwen" → 下载适合自己硬件的模型。
4. 也可以通过Hugging Face模型卡片上的"Use this model → LM Studio"直接跳转。
5. 多模态/思考模式的切换可能需要针对每个模型进行yaml配置,并支持通过CLI使用`lms import <路径>`手动导入。[R9]

在Apple Silicon上,使用支持**MLX格式**的LM Studio可获得明显的性能优势。[R9][R11]

---

## 4. Hugging Face Transformers(开发者专用)

### 4.1 前期准备

```bash
pip install transformers torch accelerate
pip install modelscope   # 在中国境内下载更快
```

### 4.2 加载与运行

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen3-30B-A3B"   # 或Qwen/Qwen3-8B等

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto",   # 自动分配GPU/CPU,不足时使用CPU offload
)

messages = [{"role": "user", "content": "Qwen,请用中文自我介绍一下。"}]
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
    enable_thinking=True,   # 思考模式(Qwen3及以上)
)

outputs = model.generate(
    **tokenizer([text], return_tensors="pt").to(model.device),
    max_new_tokens=200,
)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

`enable_thinking=True`有利于复杂推理,但会使响应变慢。日常对话建议设为`False`。[R2][R8]

安装前检查VRAM是否合适的技巧——无需下载,仅读取文件头即可估算内存占用: [R18]

```bash
uvx hf-mem --model-id Qwen/Qwen3-8B --experimental --max-model-len 8192
```

---

## 5. 模型选择指南(按硬件·以Q4_K_M为基准)

VRAM数值以Q4_K_M GGUF量化为基准,需为4K上下文的KV缓存额外增加**1~2GB**。当显存不足时,Ollama/llama.cpp会自动offload到系统内存,但速度会大幅下降(内存带宽慢10~20倍)。[R13][R18]

| 硬件 | 推荐模型 | 大致VRAM/RAM | 备注 |
|---|---|---|---|
| 老款笔记本(内存4~8GB) | qwen3.5:4b / qwen2.5:3b | 3~4GB(文件) | 可纯CPU运行,速度较慢 |
| 普通台式机(内存16GB) | qwen3:8b / qwen3.5:9b | 约5~6.6GB | 可纯CPU运行 [R13][R14] |
| 显存8GB | qwen3.5:9b(Q4) / qwen3:7~8b | 约5.5~6.6GB | RTX 3060/4060级别 [R13][R14] |
| 显存12GB | qwen3:14b(Q4) | 约9~9.5GB | Q6_K有余量 [R13][R14] |
| 显存16~24GB | qwen3:32b / qwen3.6:27b(约17GB) | 17~20GB | 24GB下Q4_K_M运行流畅 [R12][R14] |
| 显存24GB | qwen3.6:35b-a3b(UD-Q4约22GB) | 约22GB | 上下文不要设置过高 [R12][R14] |
| 多GPU/服务器 | qwen2.5:72b / 235B-A22B / 397B-A17B | 数十~数百GB | 需要tensor-parallel [R16][R19] |

MoE陷阱:`30B-A3B`、`35B-A3B`、`80B-A3B`等模型即便**激活参数仅为3B,也必须将全部权重加载到显存**中。"激活3B"不等于"内存需求3B"。例如:Qwen3-Next-80B-A3B在未量化状态下大约需要160GB显存。[R14][R19]

---

## 6. 注意事项与技巧

### 6.1 存储空间
- 7B ≈ 5GB、14B ≈ 9GB、27B ≈ 17GB、32B ≈ 20GB、35B-A3B ≈ 22GB(以Q4为基准)。[R13][R14]
- Ollama默认存储路径:`~/.ollama/models`。请确保有足够的空闲空间。[R8]

### 6.2 量化(Quantization) [R13][R16][R18]
- Q4_K_M:大多数情况下的默认选择。可节省约75%显存,质量损失极小。
- Q5_K_M:节省约60%,质量略高于Q4。
- Q8_0:最高质量的量化。适用于显存充裕的情况。
- NVFP4:Blackwell(RTX 5060 Ti/5090)原生支持,比Q4更高效。
- 显式指定示例:`ollama run qwen3:8b-q4_K_M`
- 警告:**Q2_K会明显降低中文/日语/韩语等CJK输出质量。** 处理CJK任务时,请至少使用Q4_K_M。[R13]

### 6.3 使用GPU
- NVIDIA:需要CUDA驱动。
- Apple Silicon(M1~M4):统一内存架构对大型模型有利。建议使用MLX格式+LM Studio。(例如:64GB的M3 Max可运行qwen3:32b,速度约22 tok/s。) [R13]
- 显存不足时,`device_map="auto"`会offload到CPU,但一旦offload比例超过10~20%,感知速度会急剧下降——建议改用更小的模型。[R18]

### 6.4 中文使用
- Qwen3系列支持119种语言,Qwen3.5起支持201种语言。中文性能出色,可直接使用中文提示词。[R2][R9]

### 6.5 思考模式(Qwen3及以上)
- CLI:`ollama run qwen3 --think` / `--no-think` [R8]
- API:`{"model":"qwen3","think":false,...}`或通过`{"thinking":{"budget_tokens":1024}}`设置推理预算上限 [R8]
- 部分变体也支持在提示词中使用`/think`、`/no_think`开关。
- 建议:摘要·草稿使用no-think,代码调试·数学·逻辑使用think。

### 6.6 上下文/KV缓存注意事项(原文缺失部分补充)
- Qwen3.5/3.6原生支持256K(262,144)上下文,通过YaRN可扩展至约1M。[R12][R17]
- 上下文设置越长,KV缓存占用的显存就越多。上文"最低VRAM"表格是以短·中上下文为基准的,若实际要使用128K~256K,需预留大量余量。[R12]

### 6.7 网络
- 首次下载需要联网(数GB至数十GB)。此后可完全离线使用。[R8]

### 6.8 许可证
- Qwen3/3.5/3.6的开源权重采用Apache-2.0许可证,可用于商业用途。(但`*-Max` API模型有单独条款) [R7]

---

## 7. 故障排查

| 问题 | 解决方法 |
|---|---|
| "CUDA out of memory" | 使用更小的模型、更低的量化(Q4→Q3),或缩减上下文 [R12][R14] |
| Ollama找不到模型 | 使用`ollama pull qwen3:8b`明确下载 [R8] |
| 响应速度过慢 | 若为纯CPU,使用小型模型(0.6~4B);或检查offload比例(超过10~20%说明显存不足) [R18] |
| LM Studio中看不到模型 | 使用`lms import <模型路径>`手动导入 [R9] |
| 多模态GGUF在Ollama中出错 | mmproj分离问题——使用llama.cpp/LM Studio [R9] |
| 下载前确认显存是否合适 | `uvx hf-mem --model-id <repo> --experimental` [R18] |

---

## 参考文献(References)

- [R1] Ollama Library - qwen3.5(标签、大小/多模态/256K上下文)。https://ollama.com/library/qwen3.5
- [R2] Ollama Library - qwen3(dense+MoE、thinking框架)。https://ollama.com/library/qwen3
- [R7] Local AI Master, "How to Run Qwen3 Locally (2026): Setup Guide" - 8种模型配置、119种语言、2507分离、明确标注Qwen3.7-Max仅限API。https://localaimaster.com/blog/qwen-3-local-setup-guide
- [R8] Serverman, "Run Qwen3 on Ollama: All Sizes and Hardware Guide" - 安装/运行、--think开关、KV/预算。https://www.serverman.co.uk/ai/ollama/how-to-run-qwen3-on-ollama/
- [R9] Unsloth Docs, "Qwen3.5 - How to Run Locally" - Small/大型配置、Ollama GGUF mmproj限制、LM Studio yaml开关。https://unsloth.ai/docs/models/qwen3.5
- [R10] Ollama Library - qwen3.5 Tags(0.8b~122b大小/容量)。https://ollama.com/library/qwen3.5/tags
- [R11] Ollama Library - qwen3.6(27B/35B、MLX、编程能力强化)。https://ollama.com/library/qwen3.6
- [R12] knightli, "Qwen3.6 VRAM Table" - 27B≈17GB、35B-A3B≈22GB(UD-Q4)、上下文/KV注意事项。https://knightli.com/en/2026/05/01/qwen3-6-local-vram-quantization-table/
- [R13] PromptQuorum, "Qwen Local Deployment Guide 2026" - Q4_K_M VRAM表、Q2_K CJK质量下降警告、Apple Silicon tok/s。https://www.promptquorum.com/local-llms/qwen-local-deployment-guide-2026
- [R14] InsiderLLM, "VRAM Cheat Sheet for Local LLMs" - qwen3.5 9B 6.6GB、视觉开销、MoE全部权重加载。https://insiderllm.com/guides/vram-requirements-local-llms/
- [R16] Compute Market, "Qwen 3 Hardware Guide 0.8B~72B" - 硬件层级/价格、量化格式。https://www.compute-market.com/blog/qwen-3-local-hardware-guide-2026
- [R17] M. Chen (Medium), "Run Qwen3.6-35B-A3B on 6GB VRAM Using Llama.cpp" - 低配置offload案例。https://mychen76.medium.com/run-qwen3-6-35b-a3b-on-6gb-vram-using-llama-cpp-30-tps-a89032e5a60c
- [R18] ai.rs, "Will This LLM Fit My GPU?" - hf-mem预检查、offload性能损失。https://ai.rs/ai-developer/will-llm-fit-my-gpu-vram-requirements
- [R19] Hugging Face Discussion - Qwen3-Next-80B-A3B内存(未量化≈160GB、MoE全部权重加载)。https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct/discussions/7

> 免责声明:模型产品线·标签·容量会在上游(Ollama/HF/Unsloth)随时更新。实际安装前请在相应库页面重新确认最新标签与文件大小。
