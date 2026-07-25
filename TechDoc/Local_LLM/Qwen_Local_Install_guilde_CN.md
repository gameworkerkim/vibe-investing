---
title: "Qwen本地安装指南与注意事项(修订版)"
description: "Qwen本地部署最新指南:模型阵容(Qwen3 / 3.5 / 3.6 / 3.7-Max)、Ollama/LM Studio/Transformers安装方法、按VRAM选择硬件、量化、Thinking Mode及故障排查,附完整引用来源。"
keywords:
  - "Qwen"
  - "Qwen3 本地部署"
  - "Ollama Qwen"
  - "LM Studio"
  - "量化 Q4_K_M"
  - "VRAM 选型"
  - "阿里巴巴大模型"
  - "本地LLM故障排查"
lang: zh
featured: false
schema_type: TechArticle
---

# Qwen本地安装指南与注意事项(修订版)

> 验证基准日:2026-06-30 / 在原文档(Qwen2.5·早期Qwen3时点)基础上更新为当前阵容与硬件基准,并附上引用来源。
> 核心原则:VRAM(或统一内存)是硬性约束——权重放不进去,模型根本无法运行。请将量化、上下文长度、KV cache一并计算。[R7][R10]

## Qwen(千问)概述
Qwen(千问)是阿里巴巴集团开发的大语言模型(LLM)及大规模多模态模型系列。首个版本于2023年4月以Beta形式发布,目前已发展为全球最大的开源AI生态之一。2026年3月,阿里巴巴将AI品牌统一为"Qwen千问大模型",消除了此前的命名混乱。

## 主要功能
Qwen可执行多种多模态与语言任务。

自然语言理解与文本生成

视觉理解(图像、视频)

音频理解与处理

工具调用与AI智能体功能

角色扮演与多轮对话

模型基于大规模多语言、多模态数据进行预训练,并通过高质量数据微调,以符合人类偏好。

## 技术架构与特性
双模式架构(思考模式/非思考模式)
Qwen3的核心创新在于在单一模型中同时搭载"思考模式"与"非思考模式",以提升效率。

模式 | 适用场景
思考模式 | 需要深度思考的复杂逻辑推理、数学、编程等任务
非思考模式 | 需要快速响应的一般对话
模型通过"思考预算(thinking budget)"机制动态评估问题复杂度,自动分配计算资源。

模型结构
Dense模型与MoE(混合专家)模型并存:提供从0.6B到235B的多种规模。

Qwen3-Next采用高稀疏度MoE架构:总参数800亿,推理时仅激活约30亿参数(约3.75%),大幅提升效率。

Qwen3-Max总参数超过1万亿(1T),预训练使用了36T tokens。

训练策略
三阶段预训练:构建语言基础→强化推理能力→扩展长文本能力。

四阶段后训练:包括长链思维冷启动、推理强化学习、模式融合等。

"大模型培养小模型"的蒸馏方式:用大模型生成的数据训练小模型。

## 主要版本与模型

Qwen 3.5
2026年2月——旗舰模型
总参数397B(激活17B)
262K原生上下文(可扩展至1M)
支持201种语言,Apache 2.0开源

Qwen3.7-Max
2026年5月——智能体专用
可完全自主完成长达35小时以上的超长复杂任务

Qwen3-Max
2025年9月——总参数超过1T,LMArena排名全球第3

开源模型包括Qwen、Qwen1.5、Qwen2、Qwen2.5系列等,规模从0.5B到110B不等。
此外还有专用视觉语言模型(Qwen-VL)、音频模型(Qwen-Audio)、代码模型(Qwen-Coder)、推理模型(QwQ)等。

# 应用领域
Qwen可应用于多种领域。

软件开发:代码生成、调试、审查,支持50多种编程语言

内容创作:长文写作、SEO、社交媒体、翻译(201种语言)

科研与数据分析:文献综述、图表解读、科学推理、医学分析

企业业务:客服聊天机器人、文档处理、知识库问答

在基准测试中,Qwen 3.5在SWE-Bench Verified上取得76.4分,与GPT-5.2及Claude Opus 4.5处于同一水平。

## 使用方法
开源模型:采用Apache 2.0许可证,可免费使用,支持通过Ollama、llama.cpp、LM Studio等本地运行

API服务:通过阿里云DashScope API调用

免费体验:可在Qwen Chat官方网站(chat.qwen.ai)进行对话

企业服务:已服务全球29万多家企业客户

---

## 0. 首先需要了解的版本梳理(文档更新说明)

原文档仅涉及`qwen2.5`/`qwen3`/零星提及的`qwen3.5:4b`,但截至2026年6月,产品阵容已扩展如下。

| 代际 | 发布时间 | 组成 | 多模态 | 支持语言 | 许可证 | 是否可本地运行 |
|---|---|---|---|---|---|---|
| Qwen3 | 2025-04 | dense 0.6B~32B + MoE 30B-A3B、235B-A22B | 文本 | 119 | Apache-2.0 | 可 [R2][R7] |
| Qwen3.5 | 2026-02 | Small 0.8B/2B/4B/9B + 27B / 35B-A3B / 122B-A10B / 397B-A17B | 视觉(原生) | 201 | Apache-2.0 | 可 [R1][R9] |
| Qwen3.6 | 2026-04~05 | 27B(dense) / 35B-A3B(MoE),强化编程与智能体能力 | 视觉 | — | Apache-2.0 | 可 [R11][R12] |
| Qwen3.7-Max | 2026-05-20 | 仅限专有API,未公开开放权重 | — | — | 闭源 | **不可(无法本地部署)** [R7] |

注意:
- 本指南仅涉及**开放权重模型**。`*-Max`、`*-Plus`等仅限API使用的模型不是本地安装对象。[R7][R12]
- 在2025年7~8月的"2507"刷新中,Qwen3从混合(切换)方式拆分为**独立的thinking/instruct检查点**。下载时请确认具体是哪个变体。[R7]

---

## 1. 选择安装方式

| 方式 | 特点 | 推荐对象 |
|---|---|---|
| Ollama | 一条命令即可安装/运行,最简单 | LLM新手、快速测试 |
| LM Studio | 基于GUI,点击几次即可。支持MLX·GGUF | 不想写代码的用户 |
| Hugging Face Transformers | 通过Python代码进行精细控制 | 开发者、定制化需求 |

---

## 2. 安装Ollama(最简单)

### 2.1 安装Ollama [R8]

Windows
```powershell
irm https://ollama.com/install.ps1 | iex
```
或从官网(ollama.com)下载安装包。

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
ollama serve   # 手动启动(通常安装后会自动运行)
```

### 2.3 下载并运行模型 [R8][R16]
```bash
# 当前推荐——Qwen3系列
ollama run qwen3:8b            # 基础/入门,约5GB
ollama run qwen3:4b            # 轻量级
ollama run qwen3:14b           # 约9GB
ollama run qwen3:32b           # dense高配版
ollama run qwen3:30b-a3b       # MoE:30B质量、8B级速度(仍需完整VRAM)

# Qwen3.5系列(多模态)
ollama run qwen3.5:9b          # 8GB显卡推荐的基础配置,约6.6GB
ollama run qwen3.5:4b          # 轻量级,约3.4GB(文件大小)

# 旧版本
ollama run qwen2.5:7b
```

可用规格示例:qwen2.5 0.5/1.5/3/7/14/32/72B,qwen3 0.6~32B + 30B-A3B/235B-A22B,qwen3.5 0.8/2/4/9/27/35/122/397B系列。[R1][R2][R10]

注意:
- Ollama标签中即便没有`instruct`,大多也是对话模型,但自Qwen3 2507起,thinking/instruct变体已分开发布,**请直接确认标签**。(原文档中"全部为Instruct"的断言在当前阵容下并不准确)[R7]
- `qwen3.5:4b`的"3.4GB"是**GGUF文件大小**,并非运行时RAM占用。实际使用时还需加上KV cache与context开销。[R7][R14]

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

注意:像Qwen3.5这类**多模态GGUF**,由于视觉(mmproj)文件分离问题,直接导入Ollama可能受限。此时建议使用llama.cpp系后端或LM Studio。(通过Ollama库标签拉取的方式可正常使用)[R9]

---

## 3. 安装LM Studio(GUI)

1. 从官网下载macOS/Windows/Linux安装包并安装。
2. 启动应用→按`Cmd+Shift+M`(Mac)/`Ctrl+Shift+M`(PC)搜索模型。
3. 搜索"Qwen"→下载适合硬件配置的模型。
4. 也可通过Hugging Face模型卡上的"Use this model → LM Studio"直接连接。
5. 多模态/Thinking开关可能需要针对具体模型的YAML配置,CLI也支持通过`lms import <路径>`手动导入。[R9]

在Apple Silicon上,使用支持**MLX格式**的LM Studio可获得显著的性能优势。[R9][R11]

---

## 4. Hugging Face Transformers(面向开发者)

### 4.1 准备工作
```bash
pip install transformers torch accelerate
pip install modelscope   # 在中国境内下载速度更快
```

### 4.2 加载与运行
```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "Qwen/Qwen3-30B-A3B"   # 或Qwen/Qwen3-8B等

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto",   # 自动分配GPU/CPU,不足时自动卸载到CPU
)

messages = [{"role": "user", "content": "Qwen,请用韩语做一下自我介绍。"}]
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

`enable_thinking=True`有利于复杂推理,但会拖慢响应速度。日常对话建议设为`False`。[R2][R8]

安装前检查VRAM适配性的小技巧——无需下载,仅读取文件头即可估算内存占用: [R18]
```bash
uvx hf-mem --model-id Qwen/Qwen3-8B --experimental --max-model-len 8192
```

---

## 5. 模型选择指南(按硬件配置,以Q4_K_M为基准)

VRAM数值以Q4_K_M GGUF为基准,4K上下文的KV cache需额外预留**1~2GB**。VRAM不足时,Ollama/llama.cpp会自动卸载到系统RAM,但速度会大幅下降(内存带宽慢10~20倍)。[R13][R18]

| 硬件配置 | 推荐模型 | 大致VRAM/RAM | 备注 |
|---|---|---|---|
| 旧款笔记本(RAM 4~8GB) | qwen3.5:4b / qwen2.5:3b | 3~4GB(文件) | 可纯CPU运行,速度较慢 |
| 普通台式机(RAM 16GB) | qwen3:8b / qwen3.5:9b | 约5~6.6GB | 可纯CPU运行 [R13][R14] |
| GPU VRAM 8GB | qwen3.5:9b(Q4) / qwen3:7~8b | 约5.5~6.6GB | RTX 3060/4060级别 [R13][R14] |
| GPU VRAM 12GB | qwen3:14b(Q4) | 约9~9.5GB | Q6_K有余量 [R13][R14] |
| GPU VRAM 16~24GB | qwen3:32b / qwen3.6:27b(约17GB) | 17~20GB | 24GB下运行Q4_K_M较为流畅 [R12][R14] |
| GPU VRAM 24GB | qwen3.6:35b-a3b(UD-Q4约22GB) | 约22GB | 上下文不宜设置过大 [R12][R14] |
| 多GPU/服务器 | qwen2.5:72b / 235B-A22B / 397B-A17B | 数十至数百GB | 需要tensor-parallel [R16][R19] |

MoE陷阱:`30B-A3B`、`35B-A3B`、`80B-A3B`等模型**即便激活参数只有3B,也必须将全部权重加载到VRAM中**。"激活3B"不等于"占用3B内存"。例如:Qwen3-Next-80B-A3B在不量化的情况下约需160GB VRAM。[R14][R19]

---

## 6. 注意事项与技巧

### 6.1 存储空间
- 7B≈5GB、14B≈9GB、27B≈17GB、32B≈20GB、35B-A3B≈22GB(Q4基准)。[R13][R14]
- Ollama默认存储路径:`~/.ollama/models`。请确保有足够的空闲空间。[R8]

### 6.2 量化(Quantization) [R13][R16][R18]
- Q4_K_M:大多数场景下的默认选择。VRAM节省约75%,质量损失最小。
- Q5_K_M:节省约60%,质量略优于Q4。
- Q8_0:最高质量的量化方案。适用于VRAM充裕的情况。
- NVFP4:Blackwell(RTX 5060 Ti/5090)原生支持,比Q4更高效。
- 明确指定示例:`ollama run qwen3:8b-q4_K_M`
- 警告:**Q2_K会显著降低韩语/中文等CJK语言的输出质量**。处理CJK任务时,请至少使用Q4_K_M。[R13]

### 6.3 GPU使用
- NVIDIA:需要CUDA驱动。
- Apple Silicon(M1~M4):统一内存架构对大模型更有利。建议使用MLX格式+LM Studio。(例如M3 Max 64GB运行qwen3:32b可达约22 tok/s)[R13]
- VRAM不足时,`device_map="auto"`会自动卸载到CPU,但一旦卸载比例超过10~20%,实际速度会急剧下降——建议改用更小的模型。[R18]

### 6.4 中文/韩语等语言的使用
- Qwen3系列支持119种语言,Qwen3.5及以后支持201种语言。韩语等CJK语言性能优秀,可直接使用相应语言的提示词。[R2][R9]

### 6.5 Thinking Mode(Qwen3及以上)
- CLI:`ollama run qwen3 --think` / `--no-think` [R8]
- API:`{"model":"qwen3","think":false,...}`或通过`{"thinking":{"budget_tokens":1024}}`设置推理预算上限 [R8]
- 部分变体也支持在提示词中使用`/think`、`/no_think`开关。
- 建议:摘要、草稿使用no-think,代码调试、数学、逻辑推理使用think。

### 6.6 上下文/KV cache注意事项(原文未涉及的补充内容)
- Qwen3.5/3.6原生支持256K(262,144)上下文,通过YaRN可扩展至约1M。[R12][R17]
- 上下文设置越长,KV cache对VRAM的占用就越大。上文的"最低VRAM"表格是基于短/中等上下文的基准,若要实际使用128K~256K,须预留更充裕的余量。[R12]

### 6.7 网络
- 首次下载需要联网(数GB至数十GB)。之后可完全离线使用。[R8]

### 6.8 许可证
- Qwen3/3.5/3.6的开放权重采用Apache-2.0许可证——可用于商业用途。(但`*-Max`API模型另有单独条款)[R7]

---

## 7. 故障排查

| 问题 | 解决方法 |
|---|---|
| "CUDA out of memory" | 使用更小的模型或更低的量化等级(Q4→Q3)/缩小上下文 [R12][R14] |
| Ollama找不到模型 | 使用`ollama pull qwen3:8b`明确下载 [R8] |
| 响应速度过慢 | 若为纯CPU运行,改用小模型(0.6~4B),或检查卸载比例(超过10~20%说明GPU不足) [R18] |
| LM Studio中模型不显示 | 使用`lms import <模型路径>`手动导入 [R9] |
| 多模态GGUF在Ollama中出现异常 | mmproj分离问题——请使用llama.cpp/LM Studio [R9] |
| 下载前检查VRAM适配性 | `uvx hf-mem --model-id <repo> --experimental` [R18] |

---

## 参考文献(References)

- [R1] Ollama Library — qwen3.5(标签、规格/多模态/256K上下文)。https://ollama.com/library/qwen3.5
- [R2] Ollama Library — qwen3(dense+MoE、thinking框架)。https://ollama.com/library/qwen3
- [R7] Local AI Master,《How to Run Qwen3 Locally (2026): Setup Guide》——8种模型配置、119种语言、2507分离、Qwen3.7-Max仅限API说明。https://localaimaster.com/blog/qwen-3-local-setup-guide
- [R8] Serverman,《Run Qwen3 on Ollama: All Sizes and Hardware Guide》——安装/运行、--think开关、KV/预算。https://www.serverman.co.uk/ai/ollama/how-to-run-qwen3-on-ollama/
- [R9] Unsloth Docs,《Qwen3.5 - How to Run Locally》——Small/大型配置、Ollama GGUF mmproj限制、LM Studio yaml开关。https://unsloth.ai/docs/models/qwen3.5
- [R10] Ollama Library — qwen3.5 Tags(0.8b~122b规格/容量)。https://ollama.com/library/qwen3.5/tags
- [R11] Ollama Library — qwen3.6(27B/35B、MLX、编程能力增强)。https://ollama.com/library/qwen3.6
- [R12] knightli,《Qwen3.6 VRAM Table》——27B≈17GB、35B-A3B≈22GB(UD-Q4)、上下文/KV注意事项。https://knightli.com/en/2026/05/01/qwen3-6-local-vram-quantization-table/
- [R13] PromptQuorum,《Qwen Local Deployment Guide 2026》——Q4_K_M VRAM表、Q2_K CJK质量下降警告、Apple Silicon tok/s。https://www.promptquorum.com/local-llms/qwen-local-deployment-guide-2026
- [R14] InsiderLLM,《VRAM Cheat Sheet for Local LLMs》——qwen3.5 9B占用6.6GB、视觉开销、MoE全权重加载。https://insiderllm.com/guides/vram-requirements-local-llms/
- [R16] Compute Market,《Qwen 3 Hardware Guide 0.8B~72B》——硬件档位/价格、量化格式。https://www.compute-market.com/blog/qwen-3-local-hardware-guide-2026
- [R17] M. Chen(Medium),《Run Qwen3.6-35B-A3B on 6GB VRAM Using Llama.cpp》——低配置卸载案例。https://mychen76.medium.com/run-qwen3-6-35b-a3b-on-6gb-vram-using-llama-cpp-30-tps-a89032e5a60c
- [R18] ai.rs,《Will This LLM Fit My GPU?》——hf-mem预检查、卸载性能损失。https://ai.rs/ai-developer/will-llm-fit-my-gpu-vram-requirements
- [R19] Hugging Face Discussion — Qwen3-Next-80B-A3B内存占用(不量化约160GB、MoE全权重加载)。https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct/discussions/7

> 免责声明:模型阵容、标签、文件大小会在上游(Ollama/HF/Unsloth)随时更新。实际安装前请到相应的库页面重新确认最新的标签与文件大小。
