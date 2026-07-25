---
title: "Colibri 入门指南"
description: "Colibri是一个纯C、零依赖的引擎,通过磁盘流式加载专家网络,让744B参数的MoE模型GLM-5.2能在25GB内存的消费级设备上运行。"
abstract: |
  Colibri是一个纯C、零依赖的推理引擎,通过将闲置的专家网络从磁盘流式加载,让744B参数的MoE模型GLM-5.2最低只需25GB内存即可运行。一个学习型缓存会随时间将常用专家固定在内存中,因此同一引擎既能在25GB内存的笔记本上运行,也能扩展到将全部专家常驻显存的多GPU服务器。基于GLM-5.2原生MTP头的推测解码(Speculative Decoding)必须使用int8头,否则接受率会崩溃。
summary_for_ai: |
  面向AI代理的参考说明:性能数据(tokens/s)和硬件要求均来自文章撰写时的项目README,未来版本可能有所变化。MTP头必须使用int8而非int4,否则推测解码的接受率会崩溃至0-4%。这是一个个人维护的开源项目(引擎采用Apache 2.0许可,GLM-5.2权重采用MIT许可),在依赖文中数据前请核实最新的基准测试结果。
lang: zh
featured: false
author: Dennis Kim
date: 2026-07-21
schema_type: TechArticle
---

# Colibri 入门指南

**Colibri**是一个项目,它用纯C语言编写的超轻量引擎来驱动**744B参数的MoE(混合专家)模型GLM-5.2**,设计目标是让**仅有25GB内存**的普通消费级设备也能运行。局限在于这里的"普通"其实还是指开发者级别的高配设备,而磁盘流式加载的体验也会让人略感迟滞。不过,能在本地跑起这种规模的模型本身就是它的价值所在。

相比首次使用,持续使用会让相关主题逐渐加载进内存,因此速度会逐步提升。

---

## 项目说明

Colibri利用了这样一个事实:744B规模的MoE模型每个token**仅激活约40B参数**,而且每个token激活的专家(Expert)各不相同(约11GB):

- **密集部分(Dense part)** — Attention、共享专家、Embeddings等约17B参数 → **以int4常驻内存**(约9.9GB)
- **路由专家(Routed Experts)** — 75个MoE层 × 256 = **19,456个专家**,每个专家在int4下约19MB → **存储在磁盘上**(约370GB)

核心思路是**模型不需要"塞进"快速内存**。专家会在需要时从磁盘流式加载,将显存、内存和存储视为一个统一管理的内存层级结构。

---

## 工作原理

### 每个token的处理路径

每一层的每个token都会经历**Route(路由) → Union(去重) → Place(放置) → Overlap(重叠) → Learn(学习)**这五个阶段:

1. **Route** — 路由器决定针对输入token激活哪些专家
2. **Union** — 当批次内多个token选中相同专家时,进行**去重**(batch-union)
3. **Place** — 决定从哪里获取专家(显存 > 内存 > 磁盘)。批处理策略**仅影响速度**,不会改变路由决策或权重精度
4. **Overlap** — 异步I/O池(`PIPE=1`)在从磁盘加载缺失专家的同时,用已常驻的专家继续计算。路由预览线程(`PILOT=1`)会预取下一层的专家(路由具有**71.6%的可预测性**)
5. **Learn** — 将路由记录保存到`.coli_usage`文件,并自动固定(Pin)常用专家

### 内存层级结构

[显存 / 内存 / NVMe 三层专家放置方案]

同一引擎覆盖整个硬件谱系:
- **25GB笔记本**:所有专家均从磁盘流式加载(慢但精确)
- **大型主机**:全部专家常驻(`CUDA_EXPERT_GB=auto PIN_GB=all`) → 完全消除磁盘瓶颈
- **多插槽主机**:通过`COLI_NUMA=1`实现内存控制器交织

各层之间由**学习型缓存**运作。它会记录用户工作负载使用了哪些专家,并自动固定最频繁使用的专家 —— **用得越多就越快**。

### 压缩KV状态

MLA(多头潜在注意力,Multi-head Latent Attention)将每个token的KV状态压缩为576个浮点数(32,768 → 576,**压缩57倍**)。它被保存到`.coli_kv`文件中,因此重启后KV状态仍能保留,与未中断会话的结果逐字节一致。

### 推测解码(推理加速)

GLM-5.2原生的MTP(多token预测,Multi-Token Prediction)头为主模型草拟待验证的token,通过一次批量前向传播完成验证,达到**2.2-2.8 tokens/forward**。

> ⚠**重要规则**:MTP头必须使用**int8**。int4版本会导致接受率崩溃至0-4%([#8](https://github.com/JustVugg/colibri/issues/8))。由于草拟和验证必须计算相同的函数,`SPEC_PIN=1`会将两种运算固定到同一内核系列上([#163](https://github.com/JustVugg/colibri/issues/163))。

---

## 优点

| 项目 | 说明 |
|------|------|
| **超低配置即可运行** | 仅25GB内存的笔记本也能运行744B模型 |
| **纯C,零依赖** | 不需要BLAS、Python运行时或GPU |
| **保持精度** | 默认策略**绝不改变模型精度或路由语义** |
| **学习型缓存** | 记录工作负载中常用的专家并自动固定,用得越多越快 |
| **GPU支持** | CUDA后端可将专家常驻显存,消除磁盘瓶颈 |
| **Metal支持** | 在Apple Silicon上可实现GPU加速 |
| **压缩KV状态** | MLA注意力实现每token 576个浮点数(压缩57倍) → 重启后KV状态仍保留 |
| **推理加速** | 推测解码(MTP头)实现2.2-2.8 tokens/forward |
| **NUMA支持** | 多插槽主机上的内存控制器交织 |
| **网页仪表盘** | 实时token指标、硬件面板、Expert Brain/Atlas可视化 |
| **语法强制输出** | `GRAMMAR=file.gbnf`可在结构化JSON输出时进一步提升接受率 |
| **开源** | Apache 2.0许可证(GLM-5.2权重为Z.ai的MIT许可证) |

---

## 缺点

| 项目 | 说明 |
|------|------|
| **依赖磁盘** | 需要在磁盘上保存370GB的专家数据 |
| **低配置环境下速度下降** | 在25GB内存环境下仅0.05-0.1 tok/s,非常慢 |
| **初始模型下载/转换** | 需要自行转换或下载370GB以上容量的模型 |
| **int4 MTP头需注意** | int4 MTP头接受率会崩溃至0-4%,因此int8版本是必须的 |
| **部分依赖Python** | 转换器和API网关需要Python |
| **Windows构建** | 建议使用预构建二进制文件而非本地构建 |

---

## 实际性能表现

相同引擎,相同int4容器 —— 硬件只决定专家的放置位置。参见[完整基准测试](https://github.com/JustVugg/colibri/blob/main/docs/benchmarks.md):

| 硬件 | 解码速度 | 备注 |
|----------|------------|------|
| **6× RTX 5090(全部专家常驻显存)** | **5.8-6.8 tok/s** | 首token延迟约13秒 |
| **128GB纯CPU台式机** | ~1.8 tok/s(热启动) | 内存常驻 |
| **单张RTX 5070 Ti** | 1.07 tok/s | GPU常驻流水线 |
| **25GB开发机** | 0.05-0.1 tok/s(冷启动) | 纯磁盘流式加载 |

---

## 竞品对比

README中没有直接提及竞品项目。但考虑到Colibri所解决的问题领域(在低配硬件上运行超大型MoE模型),以下项目采用了类似的思路:

| 项目 | 说明 |
|----------|------|
| **llama.cpp** | 基于C++的推理引擎,可在CPU/GPU上高效运行各类LLM |
| **ExLlamaV2** | 利用GPTQ量化的GPU中心高速推理引擎 |
| **vLLM** | 通过PagedAttention技术最大化GPU内存效率的推理服务器 |
| **DeepSpeed** | 微软推出的大规模分布式训练/推理框架 |

Colibri的差异化优势在于其极致的轻量化 —— **纯C、零依赖,在25GB内存上运行744B参数的MoE模型**。

---

## 安装方法

### 1. 系统要求

- **内存**:最低25GB(推荐)
- **磁盘**:至少400GB以上的可用空间(模型370GB + 其他文件)
- **操作系统**:Linux、Windows、macOS
- **编译器**:GCC(Linux/macOS)或MSVC(Windows)
- **Python 3**:用于模型转换和API网关(运行时不需要)

### 2. 克隆仓库

```bash
git clone https://github.com/JustVugg/colibri.git
cd colibri
```

### 3. 构建

```bash
cd c
./setup.sh   # 检查GCC/OpenMP、构建并运行自测
```

也可以在根目录使用`make`命令构建。

Nix/NixOS用户:
```bash
nix develop   # 提供flake.nix
```

### 4. 下载模型

从Hugging Face下载**预转换的GLM-5.2 int4容器**:

> ⚠**务必使用包含int8 MTP头的版本!**
> 原始镜像提供的是int4 MTP头,会导致接受率崩溃至0%。

```bash
# 正确的版本(包含int8 MTP)
huggingface-cli download mateogrgic/GLM-5.2-colibri-int4-with-int8-mtp
```

也可以直接从FP8源转换(需要Python,按分片处理,不需要一次性把756GB全部放到磁盘上):

```bash
cd c
./coli convert --model /nvme/glm52_i4   # 按分片下载+转换(一次性)
```

**验证int8 MTP头的方法**:
```bash
ls -l /path/to/model/out-mtp-*
# int8(正确): 3527131672 / 5366238584 / 1065950496
```

### 5. 运行

```bash
# 通过环境变量设置模型路径
export COLI_MODEL=/path/to/glm52_i4

# 交互式聊天
./coli chat

# 查看放置计划(显存/内存/磁盘放置方案)
./coli plan

# 状态诊断(只读)
./coli doctor

# 网页仪表盘 + API服务器(单端口)
./coli web --model /path/to/glm52_i4

# OpenAI兼容API服务器(仅API)
./coli serve --model /path/to/glm52_i4
```

运行时引擎以纯C运行。Python仅用于一次性转换器和可选的API网关。

### 6. Windows用户

下载预构建二进制文件是最简单的方式:

1. 从[Releases页面](https://github.com/JustVugg/colibri/releases)下载`colibri--windows-x86_64.zip`
2. 解压后将`colibri-*-windows-x86_64.exe`重命名为`glm.exe`
3. 安装[Python 3](https://www.python.org/downloads/)
4. 运行`coli chat`

详情参见[Windows指南](https://github.com/JustVugg/colibri/blob/main/docs/windows.md)。

---

## 仪表盘功能

通过`./coli web`启动的网页仪表盘提供三个主要页面:

| 页面 | 说明 |
|--------|------|
| **Dashboard** | 实时token指标、每轮耗时分析、显存/内存/磁盘层级条、实时mini-brain |
| **Brain** | 将19,456个专家可视化为一个鲜活的皮层(cortex) —— 颜色代表存储层级,亮度代表路由频率,悬停可显示主题亲和度 |
| **Atlas** | 将测得的Expert Atlas以3D星系形式展示 —— 13,260个专家按主题(诗歌、法律、中文、SQL等)聚类 |

---

## 项目支持

Colibri最初是在一台25GB内存、12核的笔记本上启动的个人项目。目前已借助真实硬件测得的社区数据不断发展。参与方式:

- 为仓库加星并分享
- 分享你自己硬件上的基准测试数据(通过Issues)
- 通过GitHub Issues赞助开发或提供硬件捐赠

---

## 更多资料

| 主题 | 文档 |
|------|------|
| 快速上手指南 | [docs/quickstart.md](https://github.com/JustVugg/colibri/blob/main/docs/quickstart.md) |
| 基准测试与质量测量 | [docs/benchmarks.md](https://github.com/JustVugg/colibri/blob/main/docs/benchmarks.md) |
| 调优指南 | [docs/tuning.md](https://github.com/JustVugg/colibri/blob/main/docs/tuning.md) |
| Windows原生构建(+ CUDA DLL) | [docs/windows.md](https://github.com/JustVugg/colibri/blob/main/docs/windows.md) |
| CUDA后端 | [docs/cuda.md](https://github.com/JustVugg/colibri/blob/main/docs/cuda.md) |
| Metal后端 | [docs/metal.md](https://github.com/JustVugg/colibri/blob/main/docs/metal.md) |
| OpenAI兼容API + KV槽位 | [docs/api.md](https://github.com/JustVugg/colibri/blob/main/docs/api.md) |
| Grammar-forced Drafts(结构化输出) | [docs/grammar-draft.md](https://github.com/JustVugg/colibri/blob/main/docs/grammar-draft.md) |
| 环境变量列表 | [docs/ENVIRONMENT.md](https://github.com/JustVugg/colibri/blob/main/docs/ENVIRONMENT.md) |

---

> **提示**:Colibri用得越多就越快(路由记录保存在`.coli_usage`文件中,常用专家会自动固定)。刚开始可能较慢,但持续使用后性能会提升。MTP推测解码是否有效取决于缓存温度(cache temperature),建议自行测量并决定是否用`DRAFT=0`将其关闭。

---

## 名称由来

蜂鸟(Colibri/Hummingbird)体重仅几克,但每天要造访数千朵花。这个引擎让一个744B参数的庞然大物依靠蜂鸟般的"口粮"维持运转:25GB内存、12个CPU核心,以及大量磁盘上的耐心等待。

---

**许可证**:引擎 —— Apache 2.0 / GLM-5.2权重 —— Z.ai发布,MIT
