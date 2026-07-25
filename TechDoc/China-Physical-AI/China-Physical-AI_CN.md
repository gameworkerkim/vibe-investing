---
title: "中国物理 AI(Physical AI)与具身 AI(Embodied AI)开源生态"
description: "全面梳理中国物理 AI 与具身 AI 开源生态——从蚂蚁集团、阿里巴巴、腾讯的基础模型，到宇树科技、银河通用、自变量机器人等人形机器人平台，再到 OpenLoong 等国家主导项目。"
abstract: |
  以 2026 年 1 月末蚂蚁集团(Robbyant/灵珀)接连发布开源模型为起点，阿里巴巴达摩院(RynnBrain)、
  高德地图(ABot 系列)、腾讯(混元世界模型)、宇树科技(UnifoLM)、银河通用/Galaxea(GalaxeaVLA)、
  自变量机器人(WALL 系列)、原力灵机(Dexbotic/DM0)、逐际动力(FluxVLA)等主要平台和机器人企业几乎在同一时期
  接连免费开源了基础模型与数据集。这并非各家企业孤立的公关事件，而是三条结构性趋势叠加的结果：
  为突破机器人真实数据瓶颈而形成的联合策略、与政府主导产业政策的结合，以及在中美技术博弈格局下争夺开放标准
  主导权的竞赛。本文在原始资料的按企业项目清单基础上，补充了最新动态与战略解读，并加入了原文中缺失的重要参与者
  (银河通用/Galbot、BAAI、Spirit AI)。
summary_for_ai: |
  一份持续更新(最后更新于 2026-07-06)的中国物理 AI/具身 AI 开源生态全景图，按互联网科技巨头、机器人企业、
  开源社区与国家主导项目三大类别组织。
  互联网科技巨头：蚂蚁集团(灵珀-VLA/Depth/World/Map——贯穿感知、行动、想象的完整具身智能全栈)，
  阿里巴巴达摩院(RynnBrain，基于 Qwen3-VL 的 2B~30B MoE 具身基础模型，号称超越 Google DeepMind 的
  Gemini Robotics-ER 和 NVIDIA 的 Cosmos-Reason2)，腾讯(混元世界模型 1.5/WorldPlay，业界首个从数据、
  训练到流式推理全流程开源的实时交互式 3D 世界生成管线)，高德地图/阿里巴巴(采用 Action Manifold Learning 的
  ABot-M0/N0/PhysWorld)。
  机器人企业：宇树科技(UnifoLM-WMA-0/VLA-0，估值约 9.5 万亿韩元，正筹备在上海上市)，智平方(AlphaBrain 平台下的
  NeuroVLA，国际验证有限)，银河通用/Galaxea Dynamics(GalaxeaVLA/G0.5，是蚂蚁 LingBot-VLA 的参考硬件)
  与另一家名称相似但为独立公司的银河通用(Galbot，其 LDA-1B 模型已作为中国首个"机器人药师"部署在 100 家药店)，
  逐际动力(FluxVLA Engine，标准化的 VLA 工具平台)，自变量机器人(WALL-OSS-0.5/WALL-B 的"World Unified Model"，
  跻身估值 200 亿元俱乐部)，原力灵机(Dexbotic 2.0 工具箱，DM0 的"具身原生(Embodied-Native)"预训练思路，
  RoboChallenge Table30 榜单第一)。
  开源社区与国家主导项目：OpenLoong(由上海国家级人形机器人创新中心主导的国有企业共性技术平台，
  与企业主导项目性质不同——2025 年全球人形机器人出货量约 87% 来自中国)，OpenJiuwen(聚焦多智能体/SDK 层，
  国际报道有限)，BAAI 的 RoboBrain 2.0(学术/国家实验室混合模式，直接从社交媒体抓取的人类动作视频中学习)，
  以及 Spirit AI(被称为"中国版 Physical Intelligence"，主张用大规模"脏数据"训练而非精选数据，
  号称在 RoboChallenge 榜单上超过美国 Physical Intelligence 的 π0.5)。
  整体战略格局：科技巨头将全面开源与对硬件伙伴的股权投资相结合(阿里巴巴一边开源 RynnBrain，一边向
  自变量机器人投资约 1~1.4 亿美元)；机器人硬件企业将开源主要用于扩大开发者影响力、支撑 IPO 与融资叙事；
  纯 AI 创业公司凭借榜单排名竞争进行市场营销；国家/学术阵营则构建与政府大规模采购政策直接挂钩的行业公共基础设施。
date: 2026-07-06
author: "Dennis Kim"
lang: zh
tags:
  - 物理 AI
  - 具身 AI
  - 中国
  - 机器人
  - 开源
  - VLA
keywords:
  - 中国物理 AI
  - 具身 AI 开源
  - VLA 基础模型
  - 蚂蚁集团 灵珀
  - 阿里巴巴 RynnBrain
  - 宇树科技 UnifoLM
  - 中国人形机器人
featured: false
schema_type: TechArticle
draft: false
---

# 中国物理 AI(Physical AI)与具身 AI(Embodied AI)开源生态

最后更新：2026-07-06

## 0. 为什么中国现在全面开源物理 AI？

以 2026 年 1 月末蚂蚁集团(Robbyant/灵珀)接连发布开源模型为起点，阿里巴巴达摩院(RynnBrain)、高德地图(ABot 系列)、腾讯(混元世界模型)、宇树科技(UnifoLM)、银河通用/Galaxea(GalaxeaVLA)、自变量机器人(WALL 系列)、原力灵机(Dexbotic/DM0)、逐际动力(FluxVLA)等主要平台与机器人企业几乎同时接连免费公开了基础模型和数据集。这不应被解读为单个企业的公关事件，而应视为以下三条结构性趋势叠加的结果。对当下的韩国而言，中国的物理 AI 既是机遇也是挑战，短期内其开源生态

1. **为突破数据瓶颈而形成的联合策略**：机器人真实数据的采集成本远高于文本、图像数据。与其各自囤积数据，业界越来越认为公开模型架构和数据管线本身、吸收全球开发者的反馈与衍生数据是更快的路径(如高德 ABot-M0 提出的"整合孤立数据孤岛"逻辑，以及银河通用回收利用低质量数据的策略)。
2. **与政府主导产业政策的结合**：中国政府已将机器人和人形机器人列为战略产业，2025 年全球人形机器人出货量中相当一部分来自中国。也出现了国家级创新中心直接组建开源社区的案例，例如由上海国有企业"人形机器人(上海)有限公司"主导的 OpenLoong。
3. **在中美技术博弈格局下争夺开放标准的先机**：彭博社等外媒曾评价阿里巴巴 RynnBrain 的开源"可能削弱西方封闭式技术的优势"。这是一条与 Google DeepMind(Gemini Robotics-ER)、NVIDIA(Cosmos)、Physical Intelligence(π0 系列)等美国阵营的封闭或部分开放策略形成鲜明对比的完全开源路线。

以下在原始资料按企业整理的项目清单基础上，补充了最新动态与战略解读，并加入了原文缺失的重要参与者(银河通用/Galbot、BAAI、Spirit AI)。

## 机遇与挑战

1. 许多韩国和美国企业对中国平台心存戒备，因此中方企业正试图通过开源，在安全性、合作伙伴关系、监管、使用可扩展性等方面突破信任壁垒。
2. 尽管如此，许多工厂运作依赖"隐性知识"，仍存在这样的担忧：训练所得的成果最终会流入中国的云平台和竞争对手手中。
3. 核心挑战在于：我们需要有勇气跳上一只正在奔跑的老虎的背。

---

## 1. 互联网与科技巨头

### 1.1 蚂蚁集团(Ant Group)——灵珀科技(Ant LingBo / Robbyant)

| 项目名称 | 类型 | 说明 | 链接 |
|---|---|---|---|
| LingBot-VLA | 具身大模型(VLA) | 基于 9 种双臂机器人、2 万小时真实数据预训练而成的"通用大脑" | [GitHub](https://github.com/Robbyant) · [Hugging Face](https://huggingface.co/robbyant) |
| LingBot-Depth | 空间感知模型 | 从稀疏、含噪的深度数据中精确还原 3D 深度(Masked Depth Modeling) | 已开源 |
| LingBot-World | 世界模型 | 16fps、延迟 1 秒以内的实时交互式仿真，可维持约 1 分钟的连续性 | Apache 2.0 许可 |
| LingBot-Map | 流式 3D 重建 | 仅用单个 RGB 摄像头即可实时生成 SLAM 级 3D 地图，ETH3D 基准排名第一 | [GitHub](https://github.com/Robbyant/lingbot-map) · [arXiv](https://arxiv.org/abs/2604.14141) |

**最新动态与战略(2026 年)**
- 2026 年 1 月 28 日至 30 日的"具身智能进化周(Evolution of Embodied AI Week)"期间，蚂蚁集团接连发布 LingBot-VLA、Depth、World，完成了其首个开源具身 AI 模型系列。Robbyant CEO 朱星将此定义为"把 AGI 战略从数字领域延伸到物理感知"。
- LingBot-VLA 已被移植到银河通用/Galaxea Dynamics、AgileX Robotics、智元(AgiBot)等第三方硬件上，验证了跨形态(cross-morphology)可移植性，并在上海交通大学发布的 GM-100 基准上取得了 SOTA 成绩。
- 加上 4 月 16 日发布的 LingBot-Map，蚂蚁集团完成了贯穿感知(Depth、Map)、行动(VLA)、想象(World)的"具身智能全栈"，这是其核心战略信息。不过蚂蚁集团在技术文档中也坦承，仅凭 2 万小时数据，其表现仅与美国 Physical Intelligence 的 π*0.6 相当，数据扩充被列为下一个课题。
- 蚂蚁集团还与 Orbbec 签署战略合作，在深度摄像头(Gemini 330)和芯片(MX6800)层面联合优化 LingBot-Depth，同步推进硬件协同战略。

### 1.2 阿里巴巴(Alibaba)——达摩院(DAMO Academy)

| 项目名称 | 说明 | 链接 |
|---|---|---|
| RynnBrain | 2B/4B/8B 稠密模型 + 30B-A3B MoE 具身基础模型，基于 Qwen3-VL | [GitHub](https://github.com/alibaba-damo-academy/RynnBrain) · [Hugging Face](https://huggingface.co/Alibaba-DAMO-Academy) |
| RynnBrain-Plan/Nav/CoP | 专门用于任务规划、视觉语言导航、点级推理的后训练模型 | 包含在上述仓库中 |
| RynnEC / RynnScale / RynnVLA-001,002 | 连接 MLLM 与具身世界、可扩展的具身模型、VLA 与世界模型的整合 | 阿里巴巴达摩院 GitHub |

**最新动态与战略(2026 年)**
- 于 2026 年 2 月 10 日发布。阿里巴巴宣称 RynnBrain 性能超越 Google DeepMind 的 Gemini Robotics-ER 1.5 和 NVIDIA 的 Cosmos-Reason2，在 16 个开源基准上创下新纪录。其核心差异化在于将时空情景记忆(episodic memory)与物理世界推理相结合。
- 阿里巴巴 CTO 张建锋(Jeff Zhang)亲自统领达摩院，并在北京、杭州、圣马特奥、贝尔维尤、莫斯科、特拉维夫、新加坡新设 7 个研究实验室，进行组织层面的同步投入。
- 战略上，阿里巴巴在开源 RynnBrain 的同时，还向人形机器人创业公司自变量机器人进行了大规模股权投资(主导 A+ 轮，约 1~1.4 亿美元)，采取"用开源的大脑(模型)扩大生态，用股权投资的硬件实现垂直整合"的双轨战略。阿里巴巴已明确将物理 AI 与其 LLM 品牌 Qwen 一并列为公司 AI 战略的核心支柱。
- 4 月 13 日又发布了 RynnBrain-4B，持续扩充其模型阵容。

### 1.3 腾讯(Tencent)——混元(Hunyuan)

| 项目名称 | 说明 | 链接 |
|---|---|---|
| 混元世界模型 1.5(WorldPlay) | 仅凭一段文字或一张图片即可生成实时交互式 3D 世界，业界首个从数据、训练到流式推理的全流程开源管线 | [Tencent Hunyuan](https://3d-models.hunyuan.tencent.com/world/) |
| Hunyuan3D World 1.0 | 13 亿参数，3D VAE + Diffusion Transformer，最长可生成 16 秒的片段 | 已开源 |
| HunyuanVideo 1.5 | 基于轻量级 8.3B DiT 的开源视频生成模型 | [arXiv](https://arxiv.org/pdf/2511.18870) |

**最新动态与战略(2026 年)**
- 2025 年 12 月 17 日正式发布混元世界模型 1.5(WorldPlay)，宣称提供"业界最系统、最全面的实时世界模型框架"，从数据、训练到流式推理部署全流程开源。据称通过 Next-Frames-Prediction 视觉自回归任务，解决了实时性与几何一致性之间的矛盾。
- 腾讯的战略是"一石二鸟"，将同一套世界模型技术同时应用于游戏/内容创作(WorldPlay、GameCraft)和机器人仿真，事实上已与蚂蚁集团的 LingBot-World 形成竞争关系。
- Hunyuan3D 系列自 2024 年 11 月首次开源以来，在 Hugging Face 上的累计下载量已突破 300 万次，Unity 中国、拓竹科技(Bambu Lab)等 150 多家企业已通过腾讯云引入使用。与灵珀/达摩院不同的是，该系列目前在 3D 内容与游戏资产生成方面的侧重仍强于机器人专属品牌方向。

### 1.4 高德地图(Amap，阿里巴巴系)——ABot

| 项目名称 | 说明 | 链接 |
|---|---|---|
| ABot-M0 | 基于 UniACT 数据集(600 万条以上轨迹、9,500 小时，整合 6 个开源数据集)的 VLA，提出 Action Manifold Learning(AML) | [GitHub](https://github.com/amap-cvlab) · [项目页面](https://amap-cvlab.github.io/ABot-Manipulation/) · [arXiv](https://arxiv.org/abs/2602.11236) |
| ABot-N0 | 基于 1,690 万条专家轨迹的具身导航 VLA，在 7 个基准上取得 SOTA | [项目页面](https://amap-cvlab.github.io/ABot-Navigation/ABot-NO/) |
| ABot-PhysWorld | 物理一致的交互式世界基础模型，宣称在物理合理性上优于 Veo 3.1 和 Sora v2 Pro | [GitHub](https://github.com/amap-cvlab/ABot-PhysWorld) |
| UniACT-dataset | 整合 6 个公开数据集，600 万条以上轨迹，覆盖 20 余种机器人形态 | 随 ABot-M0 一同发布 |

**最新动态与战略(2026 年)**
- 高德地图(阿里巴巴集团旗下的地图与导航子公司)在论文开篇便明确阐述了开源理念:"具身智能的发展不应依赖封闭的专有系统，而应通过整合异构数据和渐进式能力积累来实现"。
- ABot-M0 的核心技术是 Action Manifold Learning(AML)，即不采用去噪扩散(diffusion)方式，而是通过投影(projection)到低维流形上直接预测动作，据称同时提升了解码速度和稳定性。
- 2026 年 2 月至 3 月间，高德依次发布了 ABot-M0(操作)、ABot-N0(导航)、ABot-PhysWorld(世界模型)三件套，完成了涵盖操作、移动、仿真全领域的路线图。该项目与阿里巴巴达摩院(RynnBrain)是独立的组织，但同属阿里巴巴集团开源战略的一个分支。

---

## 2. 机器人企业

### 2.1 宇树科技(Unitree Robotics)

| 项目名称 | 说明 | 链接 |
|---|---|---|
| UnifoLM-WMA-0 | 跨形态(cross-embodiment)世界模型-动作架构，兼具仿真引擎与策略强化模块功能 | [GitHub](https://github.com/unitreerobotics/unifolm-world-model-action) · [Hugging Face](https://huggingface.co/unitreerobotics/UnifoLM-WMA-0-Base) |
| UnifoLM-VLA-0 | 面向通用人形机器人操作的 VLA 大模型 | [GitHub](https://github.com/unitreerobotics) |
| Qmini / UniArmL1 | 可 3D 打印的低成本双足机器人、轻量化 6 自由度开源机械臂 | GitHub |

**最新动态与战略(2026 年)**
- 分别于 2025 年 9 月(WMA-0)和 2026 年 1 月(VLA-0)开源。已将 UnifoLM-WMA-0 集成至 G1 人形机器人(身高 1.3 米)，结合视觉、语言与动作。
- 2026 年 7 月初获得上海证券交易所上市批准(通过中国证监会审批，估值约合 9.5 万亿韩元)，即将迎来 IPO。这一事件恰逢公司成立十周年，"全栈自主研发 + 量产 + 开源生态"的良性循环结构被作为其 IPO 叙事的核心。
- 大连海事大学 Pioneer Technology Lab 的研究人员评价称"UnifoLM-WMA-0 能让机器人以毫秒级速度预测水坑等障碍物并调整步幅"；业内人士分析称"由于宇树科技相当一部分营收来自教育和科研用机器人，构建开发者生态是其核心业务所在"。事实上，其四足和人形机器人产品约 80% 都部署在科研、教育及消费市场。

### 2.2 智平方(Zhipingfang)——AlphaBrain

| 项目名称 | 说明 | 链接 |
|---|---|---|
| AlphaBrain Platform | 号称是全球首个一站式具身 AI 模型开源社区 | 官方公告 |
| NeuroVLA | 基于脑科学的 VLA 模型(号称全球首个此类开源模型) | 通过 AlphaBrain Platform 发布 |

**说明**：与其他大企业系列项目相比，智平方/AlphaBrain 在英文及国际媒体上的报道相对有限，目前尚未广泛确认可验证的 GitHub 仓库链接。原始资料中"全球首个"的表述基于该公司自身的官方声明，仍需进一步交叉验证。建议持续关注该公司官方渠道以获取最新动态。

### 2.3 银河通用/Galaxea Dynamics(Galaxea AI)

| 项目名称 | 说明 | 链接 |
|---|---|---|
| G0.5(GalaxeaVLA) | 以自回归方式，在单一 Transformer 解码器中同时生成推理与动作 token 的 VLA | [GitHub](https://github.com/OpenGalaxea/GalaxeaVLA) |
| Galaxea Open-World Dataset | 覆盖 50 多个真实环境，累计超过 500 小时、10TB 以上数据，发布两个月内下载量达 40 万次 | Hugging Face · ModelScope |
| G0Tiny | 2.5 亿参数轻量模型，可在 R1 Pro Orin 上实现端侧推理(最高 10Hz) | Hugging Face |

**最新动态与战略(2026 年)**
- 公司于 2023 年 9 月成立(创始人高继扬，曾就职于 Waymo 和 Momenta)，奉行算法与硬件同步研发的"全栈"战略。自 2025 年 8 月发布 G0 以来，2026 年 1 月推出 G0Plus，6 月又快速迭代至 G0.5。
- 其轮式机器人 R1 Pro 被蚂蚁集团 LingBot-VLA 选为官方参考硬件，战略性地确立了作为大企业开源模型"参考硬件"的地位。
- 2026 年 2 月完成 B 轮融资，融资额达 10 亿元人民币(约合 1,450 亿韩元)，并将 Galaxea Open-World Dataset 的火爆表现(下载量 40 万次)作为其数据生态扩张的核心成果。
- 一家名称相似但独立的公司**银河通用(Galbot)**，与北京大学、清华大学联合开发了 LDA-1B(Latent Dynamics Action Model)，该模型已于 2026 年 4 月正式被 RSS(Robotics: Science and Systems)会议收录。它基于 DINO 的潜在表示，可以利用低质量、未经处理的数据进行训练，其"额外增加 30% 低质量数据可将成功率提升 10 个百分点"的结果引发关注，目前估值达 200 亿元人民币。Galbot 的 G1 曾登上 2026 年春节 CCTV 舞台，并已部署至 100 家药店，处理了超过 30 万笔药品销售，取得中国首个"机器人药师"资质。**两家公司名称相似但为独立法人实体，在引用文档时需注意避免混淆。**

### 2.4 逐际动力(LimX Dynamics)

| 项目名称 | 说明 | 链接 |
|---|---|---|
| FluxVLA Engine | 覆盖 VLA 全生命周期(数据→训练→评估→实机部署)的标准化工程平台，Apache 2.0 许可 | [GitHub](https://github.com/limxdynamics/FluxVLA) · [文档](https://fluxvla.limxdynamics.com/) |
| LimX COSA / VGM / DreamActor | 具身智能体操作系统、操作算法、具身学习新范式 | 官方网站 |

**最新动态与战略(2026 年)**
- 2026 年 4 月 30 日宣布开源 FluxVLA Engine。该平台号称可通过单一配置文件统一管理 OpenVLA、LlavaVLA、GR00T、Pi0、Pi0.5 等主流 VLA 算法，目前已被 Reflex 等第三方服务框架集成。
- 已获得阿里巴巴(2024 年)和京东(2025 年)的战略投资，将 TRON 1/2(科研用)到 Oli(完整版人形机器人)的产品阶梯，与软件栈(COSA、VGM、DreamActor、FluxVLA)相结合，定位为"硬件+软件平台型企业"。
- 截至 2026 年 2 月，公司完成最新一轮约 2 亿美元的融资(与银河通用、Spirit AI 等同属大额融资群体)，并在 GitHub issue 之外，通过 mason@limxdynamics.com 和 wayne@limxdynamics.com 公开了直接的技术支持渠道，以强化与开发者社区的联系。

### 2.5 自变量机器人(X Square Robot)

| 项目名称 | 说明 | 链接 |
|---|---|---|
| WALL-OSS-0.5 | 40 亿参数 VLA，支持零样本(zero-shot)真实机器人操作，号称业界首个具身 AI 开源模型 | GitHub · Hugging Face |
| WALL-B / WALL-WM | 基于 World Unified Model 架构的基础模型 / 世界模型扩展版 | 已发布 |
| XRZero-G0 | 无需实体机器人即可采集数据并训练的开源框架，发布一周内即进入 AlphaXiv 热榜前 10 | 已发布 |

**最新动态与战略(2026 年)**
- 公司成立于 2023 年 12 月(截至最新更新时点，成立不满 2 年)，此后连续完成 8 轮融资，包括 2025 年 9 月由阿里云和中科创星(CAS Investment)领投的 A+ 轮(1 亿美元)，累计融资额约 2.8 亿美元(20 亿元人民币)。此后在 2026 年初两个月内连续完成 4 轮融资，吸引 30 多位投资人，估值突破 200 亿元人民币(约合 4.5 万亿韩元)，与 Galbot、银河通用/Galaxea AI、Spirit AI、LinkerBot 一同跻身"200 亿元俱乐部"。
- CEO 王潜(创业初期任 COO 的是杨潜)强调公司"从创立第一天起就专注于自研基础模型"，采取硬件(清洁机器人 Quanta X2)与模型(WALL 系列)同步开源、同步商业化的双轨战略。
- 2026 年 4 月发布 WALL-B 时，公司提出了与传统模块化 VLA 不同的"World Unified Model"架构，将感知、语言、行动与物理预测统一在单一网络中学习。公司已启动 IPO 筹备工作，但上市地点尚未确定。

### 2.6 原力灵机(Dexmal)

| 项目名称 | 说明 | 链接 |
|---|---|---|
| Dexbotic 2.0 | 基于 PyTorch 的 VLA 开发工具箱，支持复现和微调 π0、CogACT 等主流算法，MIT 许可 | [GitHub](https://github.com/dexmal/dexbotic) |
| DM0 | 24 亿参数"具身原生(Embodied-Native)"VLA，在 RoboChallenge Table30 基准上排名第一 | [GitHub](https://github.com/dexmal/dexbotic/blob/main/docs/DM0.md) · [arXiv](https://arxiv.org/html/2602.14974v1) |

**最新动态与战略(2026 年)**
- 2025 年 10 月首次发布 Dexbotic，2026 年 2 月 10 日在发布 DM0 的同时，明确披露与 StepFun 的联合研发关系。还与 RLinf 团队宣布在 VLA + 强化学习研究方面开展战略合作，开源生态之间的联盟十分活跃。
- DM0 的核心主张是"具身原生(Embodied-Native)"方法：摆脱"先在互联网数据上预训练、再对物理任务进行事后适配"的传统方式，而是从预训练阶段起就同时学习驾驶与具身交互数据。该模型将三阶段(预训练—中期训练—后训练)流水线与 Flow Matching 动作专家相结合。
- 作为一家总部位于北京的创业公司，原力灵机将 Dexbotic 2.0 定位为"具身 AI 领域的 PyTorch 级基础设施"，力图抢占标准开发框架的地位。

---

## 3. 开源社区与国家主导项目

### 3.1 OpenLoong

| 项目名称 | 说明 | 链接 |
|---|---|---|
| OpenLoong | 人形机器人具身 AI 操作系统开源社区 | [GitHub](https://github.com/loongOpen) |
| OpenLoong-Dyn-Control | 基于 MPC、WBC 的全身动力学控制软件 | GitHub |
| OpenLoong-Hardware | 人形机器人硬件开源方案 | GitHub |

**最新动态与战略(2026 年)**
- 于 2024 年 5 月启动。由国有企业"人形机器人(上海)有限公司"主导研发，并由国家级创新中心(上海人形机器人创新中心)直接运营，这种"中枢型"开源社区的性质与民营企业主导的项目不同。
- 创新中心总经理许彬表示:"以人形机器人'青龙'的开源版本为基础构建共性技术平台，同时实现核心领域的技术突破和大规模商业化"。也就是说，OpenLoong 并非某个企业扩展生态的工具，而更多体现为**由国家主导构建中国机器人产业整体的公共基础设施**这一属性。
- 有分析认为，在 2025~2026 年政府和国有企业主导的大规模采购推动机器人创业公司现金流与规模经济的背景下，OpenLoong 承担了其中的技术标准化职能(2025 年全球人形机器人出货量约 87% 来自中国这一统计数据也支持了这一趋势)。

### 3.2 OpenJiuwen

| 项目名称 | 说明 | 链接 |
|---|---|---|
| JiuwenSwarm | 多智能体协作系统 | GitHub |
| Agent-Core | 面向 LLM 应用的 Python SDK | GitHub |
| Agent-Protocol | 智能体互操作协议 SDK | GitHub |

**说明**：OpenJiuwen 更侧重于智能体/SDK 层面，而非机器人本体，截至检索时点，国际媒体对该项目的独立报道相对有限。建议通过 GitHub 仓库直接核实并追踪提交历史。

### 3.3 [新增] BAAI(北京智源人工智能研究院)——RoboBrain 2.0

| 项目名称 | 说明 | 链接 |
|---|---|---|
| RoboBrain 2.0 | 融合语言模型能力与空间推理的开源机器人模型，采用直接从抖音等短视频中观察并学习人类动作的方式 | BAAI 官方 |

**最新动态与战略(2026 年)**
- BAAI(院长兼机器人研究负责人为王仲远)是代表大学与政府研究机构系的主要开源力量，与企业系(蚂蚁、阿里巴巴、腾讯)不同，属于学术—国家实验室混合模式。其直接利用互联网上大量存在的人类动作视频(如社交媒体舞蹈视频等)作为训练数据的方法尤为引人关注。

### 3.4 [新增] Spirit AI

**概述与战略(2026 年)**：被称为"中国版 Physical Intelligence"，主张与精选数据不同的差异化理念——即大规模使用"脏数据(dirty data)"训练才是 VLA 扩展的关键。该公司已将自研可穿戴数据采集设备迭代至第五代，据称相比遥操作(teleoperation)将数据采集成本降低了 90%，并已积累超过 20 万小时的真实世界交互数据(年内目标为 100 万小时)。2026 年 1 月开源发布的"Spirit v1.5"，据报道在 RoboChallenge 全球排行榜上超越了美国 Physical Intelligence 的 π0.5。该公司获得了宁德时代(CATL)、华为、小米、京东等产业战略投资者，以及重庆、杭州国有基金的共同参与，在上游(零部件)和下游(渠道)两端都拥有股东，被认为具备快速积累真实世界部署数据的结构性优势。

---

## 4. 总结：中国物理 AI 开源生态的分层结构(更新版)

| 层级 | 代表企业/项目 | 性质 | 主要链接 |
|---|---|---|---|
| 基础模型层 | 蚂蚁(LingBot-VLA)、达摩院(RynnBrain)、高德(ABot-M0)、原力灵机(DM0)、Spirit AI(v1.5) | 通用 VLA"大脑" | lingbot-vla · RynnBrain · ABot-Manipulation |
| 世界模型层 | 宇树科技(UnifoLM-WMA-0)、腾讯(混元世界 1.5)、蚂蚁(LingBot-World)、高德(ABot-PhysWorld) | 仿真、数据生成引擎 | UnifoLM-WMA-0 |
| 框架/工具链层 | 原力灵机(Dexbotic 2.0)、逐际动力(FluxVLA)、智平方(AlphaBrain) | 开发基础设施标准化 | FluxVLA · Dexbotic |
| 数据集层 | 银河通用/Galaxea(Open-World Dataset)、高德(UniACT-dataset)、自变量机器人(XRZero-G0)、银河通用(LDA-1B 训练集) | 大规模真实/合成数据 | X-Square-Robot |
| 操作系统/硬件层 | OpenLoong(国家主导)、宇树科技(集成 UnifoLM 的 G1)、逐际动力(COSA) | 机器人本体/操作系统标准 | OpenLoong |
| 国家/学术基础设施层 | OpenLoong(国有企业主导)、BAAI(RoboBrain 2.0)、OpenJiuwen | 行业共性标准/政策衔接 | 上海人形机器人创新中心 |

---

## 5. 整体战略格局总结

1. **科技巨头(蚂蚁、阿里巴巴、腾讯)**：共同遵循"模型全面开源→吸收全球开发者生态→绑定自身云/硬件合作伙伴"的两段式战略。阿里巴巴同时推进开源(RynnBrain)与股权投资(自变量机器人)的做法尤为明显。
2. **机器人硬件企业(宇树科技、银河通用/Galaxea、自变量机器人、逐际动力)**：开源的重点更多在于扩大开发者基础，服务于 IPO/融资叙事，而非直接创收。宇树科技即将上市、自变量机器人与银河通用/Galaxea 连续获得大额融资，都印证了这一点。
3. **纯 AI 创业公司(原力灵机、Spirit AI)**：没有硬件产品，仅凭模型、数据与框架竞争，在基准测试(RoboChallenge、GM-100)榜首的争夺本身就直接构成营销手段和融资工具。
4. **国家/学术阵营(OpenLoong、BAAI)**：独立于单个企业间的竞争，承担构建整个行业共性标准与数据基础设施的角色，与政府大规模采购政策直接挂钩。

这四条主线彼此竞争，但同时在数据、人才、投资层面相互交织(例如 LingBot-VLA 在银河通用/Galaxea、AgileX 硬件上得到验证，阿里巴巴同时持有 RynnBrain 与自变量机器人的股权)，这正是 2026 年中国物理 AI 生态的结构性特征。

---

## 6. 主要来源

- RoboHorizon,《蚂蚁集团全面公开机器人 AI 全栈》,2026-01-29
- 로봇신문(韩国机器人新闻),《Orbbec—Robbyant 联合发布 LingBot-Depth》,2026-01-30
- BusinessWire/FinancialContent,"Robbyant Open-Sources LingBot-World",2026-01-29
- Las Vegas Sun/BusinessWire,"Robbyant Unveils LingBot-Map",2026-04-16
- MarkTechPost,"Ant Group Releases LingBot-VLA",2026-01-29
- MS투데이(韩国),《阿里巴巴发布机器人开源 AI"灵脑(RynnBrain)"》,2026-02-11
- 로봇신문(韩国),《中国阿里巴巴发布机器人开源 AI 模型"灵脑"》,2026-02-11
- GitHub, alibaba-damo-academy/RynnBrain
- ai타임스(韩国),《阿里巴巴发布开源机器人模型，进军"物理 AI"》,2026-02-11
- CIP Lawyer / Futubull,"Tencent Hunyuan World Model 1.5 Officially Launched",2025-12-16~17
- arXiv 2602.11236,"ABot-M0: VLA Foundation Model for Robotic Manipulation with Action Manifold Learning"
- arXiv 2603.23376,"ABot-PhysWorld"
- arXiv 2602.11598,"ABot-N0"
- Gasgoo,"Unitree Robotics IPO Reaches Key Milestone",2026-03-23
- Yicai,"China's Unitree Open-Sources World Model to Advance Robotics Ecosystem",2025-09-16
- 글로벌이코노믹(韩国),《宇树科技获上市批准……估值逼近 9.5 万亿韩元》,2026-07
- 오마이뉴스(韩国),《血雨腥风的中国机器人三国杀》,2026-04-30
- GitHub, OpenGalaxea/GalaxeaVLA
- 로봇신문(韩国),《2026 年机器人数据战争已然打响》,2026-01-26
- 와우테일(韩国),《从机器人大脑到自动驾驶芯片，2 月值得关注的 4 家中国创业公司》,2026-03-16
- 逐际动力官方新闻中心 · GitHub(limxdynamics/FluxVLA)
- RobotsAsia,"LimX Dynamics: Humanoid Robots, Oli & TRON Platforms"
- Cryptopolitan,《阿里巴巴向机器人公司自变量注资 1 亿美元》,2025-09-08
- 로봇신문(韩国),《中国人形机器人创业公司"自变量机器人"估值突破 28 亿美元》
- GitHub, dexmal/dexbotic · Pandaily,"Dexmal Unveils DM0",2026-02-10
- iting.co.kr,《2025 年中国正在培育人形机器人产业》,2025-03-07(OpenLoong 概述)
- 로봇신문(韩国),《[专题] 一窥机器人强国"中国"的未来(3)》,2025-09-17(OpenLoong·上海创新中心)
- GQ Korea,《与人类共存的第一批机器人，出发点在中国》,2026-04-15(BAAI RoboBrain 2.0)
- inuglr.com,《中国国家主导型 AI 机器人政策：数据获取与开源标准化》,2026-03-13

*说明:部分项目(智平方/AlphaBrain、OpenJiuwen)在国际媒体及英文 GitHub 上的交叉验证资料相对有限，建议通过企业/社区官方渠道再次确认最新动态。*
