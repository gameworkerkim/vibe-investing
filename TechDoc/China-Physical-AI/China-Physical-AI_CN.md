---
title: "中国物理AI(Physical AI)与具身AI(Embodied AI)开源生态"
description: "梳理中国物理AI与具身AI开源生态:互联网大厂(蚂蚁集团、阿里巴巴、腾讯、高德)、机器人企业(宇树、银河、逐际动力、自变量机器人、原力灵机)以及国家/学术主导项目(OpenLoong、BAAI),并附战略解读。"
keywords:
  - "Physical AI"
  - "Embodied AI"
  - "中国机器人"
  - "VLA模型"
  - "宇树科技"
  - "蚂蚁集团 LingBot"
  - "阿里巴巴 RynnBrain"
  - "开源机器人"
lang: zh
featured: false
schema_type: TechArticle
---

# 中国物理AI(Physical AI)与具身AI(Embodied AI)开源生态

最后更新:2026-07-06

## 0. 为什么中国此刻全面开源物理AI?

以2026年1月末蚂蚁集团(Robbyant/LingBot)一系列开源发布为起点,阿里巴巴达摩院(RynnBrain)、高德(ABot系列)、腾讯(混元世界模型)、宇树科技(UnifoLM)、银河通用动力学(GalaxeaVLA)、自变量机器人(WALL系列)、原力灵机(Dexbotic/DM0)、逐际动力(FluxVLA)等主要平台与机器人企业几乎同时免费公开了基础模型和数据集。这不应被解读为个别企业的公关事件,而应视为以下三大结构性趋势叠加的结果。
对韩国而言,中国的物理AI目前既是机遇也是挑战。在短时间内,中国的开源生态已经

1. **打破数据瓶颈的联合战略**:机器人实物数据的采集成本远高于文本、图像数据。与各家企业各自积累数据相比,开放模型架构和流水线本身、以吸收全球开发者的反馈与衍生数据,被广泛认为是更快的路径(如高德ABot-M0的"打通孤立数据孤岛"逻辑,以及银河通用对低质量数据的再利用策略等)。
2. **与政府主导产业政策的结合**:中国政府已将机器人/人形机器人列为战略产业,2025年全球人形机器人出货量的相当一部分来自中国。也存在如OpenLoong这样由上海国有企业"人形机器人上海有限公司"主导、由国家级创新中心直接组建开源社区的案例。
3. **在中美技术博弈格局中抢占开放标准先机**:彭博社等外媒曾评价阿里巴巴发布RynnBrain一事,认为"中国的开源战略可能削弱西方在封闭技术上的优势"。这是一条与谷歌DeepMind(Gemini Robotics-ER)、英伟达(Cosmos)、Physical Intelligence(π0系列)等美国阵营的封闭或部分开放策略形成对比的完全开源路线。

以下在原始参考资料的企业项目清单基础上,补充了最新动态与战略解读,并新增了原文未涵盖的主要玩家(银河通用/Galbot、BAAI、Spirit AI)。

## 机遇与挑战

1. 许多韩国和美国企业对中国的平台心存顾虑。正因如此,这些企业才试图通过开源在安全性、合作关系、监管、使用可扩展性等方面突破信任问题。
2. 尽管如此,一个主要问题仍然存在:许多工厂由"隐性知识"构成,人们仍担忧由此学习得到的成果会流向中国的云服务商和竞争企业。
3. 核心挑战在于:我们需要有勇气骑上一只奔跑中的老虎的背。

---

## 1. 互联网与科技大厂

### 1.1 蚂蚁集团(Ant Group)——灵波科技(Robbyant)

| 项目名称 | 类型 | 说明 | 链接 |
|---|---|---|---|
| LingBot-VLA | 具身大模型(VLA) | 基于9种双臂机器人、2万小时实物数据预训练的"通用大脑" | [GitHub](https://github.com/Robbyant) · [Hugging Face](https://huggingface.co/robbyant) |
| LingBot-Depth | 空间感知模型 | 从稀疏、有噪声的深度数据中精确恢复3D深度(Masked Depth Modeling) | 已开源 |
| LingBot-World | 世界模型 | 16fps、延迟低于1秒的实时交互式仿真,连续性可持续约1分钟 | Apache 2.0许可证 |
| LingBot-Map | 流式3D重建 | 仅用单个RGB摄像头即可实时生成SLAM级3D地图,ETH3D基准第一 | [GitHub](https://github.com/Robbyant/lingbot-map) · [arXiv](https://arxiv.org/abs/2604.14141) |

**最新动态与战略(2026年)**
- 在2026年1月28日至30日的"Evolution of Embodied AI Week"期间,蚂蚁集团连续发布LingBot-VLA、Depth、World,完成了公司首个开源具身AI模型系列。Robbyant CEO朱星将此定位为"将AGI战略从数字领域扩展到物理感知领域"。
- LingBot-VLA已被移植到银河通用动力学(Galaxea Dynamics)、AgileX Robotics、AgiBot等第三方硬件上,验证了跨形态(cross-morphology)的可移植性,并在上海交通大学发布的GM-100基准上取得SOTA成绩。
- 加上4月16日发布的LingBot-Map,蚂蚁集团完成了涵盖感知(Depth·Map)—行动(VLA)—想象(World)的"具身智能全栈",这是其核心战略信息。但蚂蚁集团自身在技术文档中也承认,2万小时的数据量仅达到美国Physical Intelligence π*0.6的水平,数据扩充被列为下一阶段的重点任务。
- 同时与Orbbec建立战略合作,在硬件层面将LingBot-Depth与自家深度相机(Gemini 330)及芯片(MX6800)进行联合优化。

### 1.2 阿里巴巴(Alibaba)——达摩院(DAMO Academy)

| 项目名称 | 说明 | 链接 |
|---|---|---|
| RynnBrain | 2B/4B/8B密集型 + 30B-A3B MoE具身基础模型,基于Qwen3-VL | [GitHub](https://github.com/alibaba-damo-academy/RynnBrain) · [Hugging Face](https://huggingface.co/Alibaba-DAMO-Academy) |
| RynnBrain-Plan/Nav/CoP | 专注于任务规划、视觉语言导航、点级推理的后训练模型 | 包含于上述仓库 |
| RynnEC / RynnScale / RynnVLA-001,002 | MLLM与具身世界的连接、可扩展具身模型、VLA与世界模型的整合 | 阿里巴巴达摩院GitHub |

**最新动态与战略(2026年)**
- 于2026年2月10日发布。宣称在性能上超越谷歌DeepMind的Gemini Robotics-ER 1.5和英伟达的Cosmos-Reason2,并在16个开源基准上创下新纪录。其核心差异化在于将情景记忆(episodic memory)与物理世界推理相结合。
- 阿里巴巴CTO程立(Jeff Zhang)直接统管达摩院,同时并行进行组织层面的投入,包括在北京、杭州、圣马特奥、贝尔维尤、莫斯科、特拉维夫、新加坡新设7个研究实验室。
- 在战略上,阿里巴巴一边将RynnBrain开源,一边对人形机器人初创公司自变量机器人进行大规模投资(主导A+轮,约1亿至1.4亿美元),采取"用开源模型(大脑)扩大生态圈,用股权投资对硬件进行垂直整合"的双轨战略。阿里巴巴已将物理AI与其大模型品牌Qwen并列,明确列为AI战略的核心支柱。
- 4月13日又追加发布RynnBrain-4B,持续扩充模型阵容。

### 1.3 腾讯(Tencent)——混元(Hunyuan)

| 项目名称 | 说明 | 链接 |
|---|---|---|
| Hunyuan World Model 1.5(WorldPlay) | 仅凭一段文字或一张图片即可实时生成交互式3D世界,业界首个全流程(数据、训练、流式推理)开源 | [Tencent Hunyuan](https://3d-models.hunyuan.tencent.com/world/) |
| Hunyuan3D World 1.0 | 13亿参数,3D VAE + Diffusion Transformer,最长可生成16秒片段 | 已开源 |
| HunyuanVideo 1.5 | 基于8.3B轻量级DiT的开源视频生成模型 | [arXiv](https://arxiv.org/pdf/2511.18870) |

**最新动态与战略(2026年)**
- 2025年12月17日正式发布Hunyuan World Model 1.5(WorldPlay),宣称将"业界最系统、最全面的实时世界模型框架"从数据、训练到流式推理部署的全过程完全开源。该模型采用Next-Frames-Prediction视觉自回归任务,主张解决了实时性与几何一致性之间的矛盾。
- 腾讯的策略是将同一套世界模型技术同时应用于游戏/内容制作(WorldPlay、GameCraft)和机器人仿真领域,属于"一石二鸟"式打法,与蚂蚁集团的LingBot-World形成事实上的竞争关系。
- Hunyuan3D系列自2024年11月首次开源以来,在Hugging Face上的累计下载量已突破300万次,并已通过腾讯云被Unity中国、拓竹科技(Bambu Lab)等150多家企业采用。与LingBot/达摩院不同的是,该系列目前在3D内容与游戏资产生成方向的布局仍强于纯机器人品牌方向。

### 1.4 高德(Amap,阿里巴巴旗下)——ABot

| 项目名称 | 说明 | 链接 |
|---|---|---|
| ABot-M0 | 基于UniACT-dataset(600万+轨迹、9,500小时、整合6个开源数据集)的VLA,提出Action Manifold Learning(AML) | [GitHub](https://github.com/amap-cvlab) · [项目页面](https://amap-cvlab.github.io/ABot-Manipulation/) · [arXiv](https://arxiv.org/abs/2602.11236) |
| ABot-N0 | 基于1,690万条专家轨迹的具身导航VLA,在7个基准上取得SOTA | [项目页面](https://amap-cvlab.github.io/ABot-Navigation/ABot-NO/) |
| ABot-PhysWorld | 物理一致性交互式世界基础模型,宣称在物理合理性上优于Veo 3.1和Sora v2 Pro | [GitHub](https://github.com/amap-cvlab/ABot-PhysWorld) |
| UniACT-dataset | 整合6个公开数据集,600万+轨迹,覆盖20多种机器人形态 | 与ABot-M0一同发布 |

**最新动态与战略(2026年)**
- 高德是阿里巴巴集团旗下的地图导航子公司,在论文开篇明确提出"具身智能不应是封闭的垄断系统,而应通过异构数据的整合与能力的渐进积累实现发展"这一开源理念。
- ABot-M0的核心技术是Action Manifold Learning(AML),即不采用去噪(diffusion)方式,而是通过向低维流形投影(projection)直接预测行动,宣称同时改善了解码速度与稳定性。
- 2026年2月至3月间,依次发布ABot-M0(操作)、ABot-N0(导航)、ABot-PhysWorld(世界模型)三件套,完成了涵盖操作、移动、仿真全领域的路线图。该团队与阿里巴巴达摩院(RynnBrain)是独立组织,但同属阿里巴巴集团开源战略的一条主线。

---

## 2. 机器人企业

### 2.1 宇树科技(Unitree Robotics)

| 项目名称 | 说明 | 链接 |
|---|---|---|
| UnifoLM-WMA-0 | 跨具身形态的世界模型-行动架构,兼具仿真引擎与策略强化模块功能 | [GitHub](https://github.com/unitreerobotics/unifolm-world-model-action) · [Hugging Face](https://huggingface.co/unitreerobotics/UnifoLM-WMA-0-Base) |
| UnifoLM-VLA-0 | 面向通用人形机器人操作的VLA大模型 | [GitHub](https://github.com/unitreerobotics) |
| Qmini / UniArmL1 | 可3D打印的低成本双足机器人,轻量级6自由度开源机械臂 | GitHub |

**最新动态与战略(2026年)**
- 分别于2025年9月(WMA-0)和2026年1月(VLA-0)开源。已将UnifoLM-WMA-0集成到G1人形机器人(1.3米)中,实现视觉、语言、行动的结合。
- 2026年7月初获得上海证券交易所上市批准(CSRC核准,估值约9.5万亿韩元规模),IPO已近在眼前。这恰逢公司成立十周年,"全栈自研+量产+开源生态"的良性循环结构被作为IPO叙事的核心加以呈现。
- 大连海事大学Pioneer Technology Lab的研究人员评价称:"UnifoLM-WMA-0让机器人能以毫秒级速度预测水坑等障碍物并调整步幅",业内人士分析称:"宇树相当一部分营收来自教育和科研用机器人,因此扩大开发者生态是其核心业务"。事实上,其四足和人形机器人型号约80%被部署在科研、教育和消费市场。

### 2.2 智平方(Zhipingfang)——AlphaBrain

| 项目名称 | 说明 | 链接 |
|---|---|---|
| AlphaBrain Platform | 号称全球首个一站式具身AI模型开源社区 | 官方发布 |
| NeuroVLA | 基于脑科学的VLA模型(号称全球首个同类开源模型) | 通过AlphaBrain Platform发布 |

**说明**:与其他大厂系列项目相比,智平方/AlphaBrain获得的英文及国际媒体报道相对有限,目前尚未广泛确认到可验证的GitHub仓库链接。原始资料中"全球首个"的说法基于该公司自身的官方声明,是需要进一步交叉验证的项目。建议关注该公司官方渠道以确认最新动态。

### 2.3 银河通用动力学(Galaxea Dynamics / Galaxea AI)

| 项目名称 | 说明 | 链接 |
|---|---|---|
| G0.5(GalaxeaVLA) | 以自回归方式在单个transformer解码器中同时生成推理与行动token的VLA | [GitHub](https://github.com/OpenGalaxea/GalaxeaVLA) |
| Galaxea Open-World Dataset | 覆盖50多个真实环境,累计超过500小时、10TB以上数据,发布两个月内下载量达40万次 | Hugging Face · ModelScope |
| G0Tiny | 250M轻量级模型,可在R1 Pro Orin上进行端侧推理(最高10Hz) | Hugging Face |

**最新动态与战略(2026年)**
- 公司成立于2023年9月(创始人高继扬,前Waymo、Momenta背景),秉持算法与硬件协同开发的"全栈"战略。自2025年8月发布G0以来,已快速迭代至2026年1月的G0Plus和6月的G0.5。
- 其轮式机器人R1 Pro已被蚂蚁集团LingBot-VLA采纳为官方硬件合作伙伴,战略性地确立了作为大厂开源模型"参考硬件"的地位。
- 2026年2月完成B轮融资,募资10亿元人民币(约1,450亿韩元),并将Galaxea Open-World Dataset的成功(下载量40万次)作为数据生态扩张的核心成果加以宣传。
- 一家名称相近但完全独立的公司**银河通用(Galaxea General/银河通用,Galbot)**与北京大学、清华大学联合开发了LDA-1B(潜在动力学行动模型),该成果于2026年4月正式被RSS(Robotics: Science and Systems)接收。该模型基于DINO的潜在表示,即便是低质量、未经清洗的数据也能用于训练,凭借"额外增加30%低质量数据可使成功率提升10个百分点"这一结果受到关注,当前估值达200亿元人民币。Galbot G1曾登上2026年央视春节联欢晚会舞台,并已部署于100家药店,处理超过30万笔药品销售,取得中国首个"机器人药剂师"资质。**这两家公司名称相似但为不同法人主体,引用本文档时须注意区分,避免混淆。**

### 2.4 逐际动力(LimX Dynamics)

| 项目名称 | 说明 | 链接 |
|---|---|---|
| FluxVLA Engine | 覆盖VLA全生命周期(数据→训练→评估→实机部署)的标准化工程平台,Apache 2.0 | [GitHub](https://github.com/limxdynamics/FluxVLA) · [文档](https://fluxvla.limxdynamics.com/) |
| LimX COSA / VGM / DreamActor | 具身智能体OS、操作算法、具身学习新范式 | 官方主页 |

**最新动态与战略(2026年)**
- 2026年4月30日宣布开源FluxVLA Engine。该平台号称能通过单一配置文件统一管理OpenVLA、LlavaVLA、GR00T、Pi0、Pi0.5等主流VLA算法,目前已被整合进第三方服务框架(如Reflex)。
- 已获得阿里巴巴(2024年)和京东(2025年)的战略投资,采取将TRON 1/2(研究用)到Oli(完整人形机器人)的产品阶梯,与软件栈(COSA、VGM、DreamActor、FluxVLA)相结合的"硬件+软件平台企业"定位。
- 截至2026年2月已完成约2亿美元规模的最新融资轮(与银河、Spirit AI等同属大型融资阵营),并在GitHub issue之外通过mason@limxdynamics.com、wayne@limxdynamics.com开放直接技术支持渠道,加强与开发者社区的联系。

### 2.5 自变量机器人(X Square Robot)

| 项目名称 | 说明 | 链接 |
|---|---|---|
| WALL-OSS-0.5 | 4B参数VLA,支持零样本真实机器人操作,号称业界首个开源具身AI | GitHub · Hugging Face |
| WALL-B / WALL-WM | 基于"World Unified Model"架构的基础模型 / 其世界模型扩展版 | 已发布 |
| XRZero-G0 | 无需机器人即可进行数据采集与训练的开源框架,发布一周内进入AlphaXiv热门榜前十 | 已发布 |

**最新动态与战略(2026年)**
- 公司成立于2023年12月(截至撰稿时不足两年),此后完成8轮连续融资,其中包括2025年9月由阿里云和中科创星主导的A+轮(1亿美元),累计融资约2.8亿美元(20亿元人民币)。此后在2026年初两个月内连续完成4轮融资,吸引30多位投资者,估值突破200亿元人民币(约4.5万亿韩元),与Galbot、银河AI、Spirit AI、灵犀机器人共同跻身"200亿元俱乐部"。
- CEO王潜(公司成立时的COO为杨潜)强调"从创业第一天起就专注于自研基础模型",对硬件(清洁机器人Quanta X2)与模型(WALL系列)同时进行开源和商业化的双重战略。
- 2026年4月发布WALL-B时,标榜与传统模块化VLA不同的"World Unified Model"架构,在单一网络中学习感知、语言、行动和物理预测。公司已启动IPO筹备工作,但上市地点尚未确定。

### 2.6 原力灵机(Dexmal)

| 项目名称 | 说明 | 链接 |
|---|---|---|
| Dexbotic 2.0 | 基于PyTorch的VLA开发工具箱,支持π0、CogACT等主流算法的复现与微调,MIT许可证 | [GitHub](https://github.com/dexmal/dexbotic) |
| DM0 | 2.4B参数的"Embodied-Native"VLA,在RoboChallenge Table30基准上排名第一 | [GitHub](https://github.com/dexmal/dexbotic/blob/main/docs/DM0.md) · [arXiv](https://arxiv.org/html/2602.14974v1) |

**最新动态与战略(2026年)**
- 2025年10月首次发布Dexbotic,并在2026年2月10日发布DM0时明确披露与阶跃星辰(StepFun)联合开发。同时也宣布与RLinf团队在VLA+强化学习研究方面展开战略合作,显示出开源生态间联盟活跃。
- DM0的核心主张是一种"Embodied-Native"方法——不同于将互联网预训练模型事后适配到物理任务的传统做法,而是从预训练阶段起就整合驾驶与具身交互数据。该模型结合了三阶段(预训练-中期训练-后训练)流水线与Flow Matching行动专家。
- 该公司总部位于北京,将Dexbotic 2.0定位为"具身AI领域的PyTorch级基础设施",意图抢占标准开发框架的地位。

---

## 3. 开源社区与国家主导项目

### 3.1 OpenLoong

| 项目名称 | 说明 | 链接 |
|---|---|---|
| OpenLoong | 人形机器人具身AI操作系统开源社区 | [GitHub](https://github.com/loongOpen) |
| OpenLoong-Dyn-Control | 基于MPC·WBC的全身动力学控制软件 | GitHub |
| OpenLoong-Hardware | 人形机器人硬件开源方案 | GitHub |

**最新动态与战略(2026年)**
- 于2024年5月启动。由国有企业"人形机器人上海有限公司"主导研发,并由国家级创新中心(上海人形机器人创新中心)直接运营,是一个"指挥塔"型开源社区,与民营企业主导的项目性质不同。
- 创新中心总经理许彬表示:"我们将以人形机器人'青龙'的开源版本为基础构建通用技术平台,同时实现核心领域技术突破与大规模商业化。"也就是说,OpenLoong并非单一企业扩展生态圈的工具,而更多是**国家层面为整个中国机器人产业打造通用基础设施**的举措。
- 在2025至2026年政府、国有企业主导的大规模采购带动机器人初创企业现金流与规模经济的结构下,有分析认为OpenLoong承担着这一趋势中的技术标准化主轴角色(2025年全球人形机器人出货量约87%产自中国的统计数据支撑了这一判断)。

### 3.2 OpenJiuwen

| 项目名称 | 说明 | 链接 |
|---|---|---|
| JiuwenSwarm | 多智能体协作系统 | GitHub |
| Agent-Core | 面向LLM应用的Python SDK | GitHub |
| Agent-Protocol | 智能体互操作协议SDK | GitHub |

**说明**:相比机器人本体,OpenJiuwen更专注于智能体/SDK层面,截至检索时国际媒体的单独报道相对有限。建议通过GitHub仓库直接核实并追踪提交历史。

### 3.3 [新增] BAAI(北京智源人工智能研究院)——RoboBrain 2.0

| 项目名称 | 说明 | 链接 |
|---|---|---|
| RoboBrain 2.0 | 结合语言模型能力与空间推理的开源机器人模型,采用直接从抖音(中国版TikTok)视频中观察并学习人类动作的方式 | BAAI官方 |

**最新动态与战略(2026年)**
- BAAI(院长兼机器人研究负责人王仲远)是以高校与政府研究机构为主的代表性开源阵营,是与企业阵营(蚂蚁、阿里巴巴、腾讯)风格不同的学术—国家实验室混合模式。其直接利用互联网上大量存在的人类动作视频(如社交媒体舞蹈视频)作为训练数据的方法被特别报道。

### 3.4 [新增] Spirit AI(灵初智能)

**概述与战略(2026年)**:被称为"中国版Physical Intelligence",提出了与经过清洗的数据不同的差异化理念——大规模使用"脏数据(dirty data)"训练才是VLA规模化扩展的核心。该公司称已将自研可穿戴数据采集设备迭代至第5代,相比遥操作方式将数据采集成本降低了90%,并已积累超过20万小时的真实世界交互数据(年内目标100万小时)。2026年1月开源发布的"Spirit v1.5"据报道在RoboChallenge全球排行榜上超越了美国Physical Intelligence的π0.5。宁德时代(CATL)、华为、小米、京东等产业战略投资者以及重庆、杭州的国有基金共同参与,使其同时获得上游(零部件)与下游(渠道)股东支持,被认为具备快速积累真实世界部署数据的结构优势。

---

## 4. 总结:中国物理AI开源生态的分层结构(更新版)

| 层级 | 代表企业/项目 | 性质 | 主要链接 |
|---|---|---|---|
| 基础模型层 | 蚂蚁(LingBot-VLA)、达摩院(RynnBrain)、高德(ABot-M0)、原力灵机(DM0)、Spirit AI(v1.5) | 通用VLA"大脑" | lingbot-vla · RynnBrain · ABot-Manipulation |
| 世界模型层 | 宇树(UnifoLM-WMA-0)、腾讯(混元世界1.5)、蚂蚁(LingBot-World)、高德(ABot-PhysWorld) | 仿真/数据生成引擎 | UnifoLM-WMA-0 |
| 框架/工具链层 | 原力灵机(Dexbotic 2.0)、逐际动力(FluxVLA)、智平方(AlphaBrain) | 开发基础设施标准化 | FluxVLA · Dexbotic |
| 数据集层 | 银河(Open-World Dataset)、高德(UniACT-dataset)、自变量机器人(XRZero-G0)、银河通用(LDA-1B训练集) | 大规模实物/合成数据 | X-Square-Robot |
| 操作系统/硬件层 | OpenLoong(国家主导)、宇树(UnifoLM集成G1)、逐际动力(COSA) | 机器人本体/操作系统标准 | OpenLoong |
| 国家/学术基础设施层 | OpenLoong(国有企业主导)、BAAI(RoboBrain 2.0)、OpenJiuwen | 行业通用标准、政策联动 | 上海人形机器人创新中心 |

---

## 5. 整体战略格局总结

1. **大型企业(蚂蚁、阿里巴巴、腾讯)**:共享"完全开源模型以吸纳全球开发者生态→锁定自身云/硬件合作伙伴"的两阶段战略。阿里巴巴同时推进开源(RynnBrain)与股权投资(自变量机器人)的做法尤为明显。
2. **机器人硬件企业(宇树、银河、自变量机器人、逐际动力)**:开源的重心更多在于扩大开发者基础和支撑IPO/融资叙事,而非直接营收。宇树即将上市、自变量机器人与银河连续获得大额融资均印证了这一点。
3. **纯AI初创企业(原力灵机、Spirit AI)**:不依赖硬件,仅凭模型、数据与框架竞争,基准测试(RoboChallenge、GM-100)排名第一本身即成为营销与融资手段。
4. **国家/学术阵营(OpenLoong、BAAI)**:独立于企业间竞争之外,承担构建整个行业通用标准与数据基础设施的角色,与政府大规模采购政策直接挂钩。

这四大阵营相互竞争,却又在数据、人才、投资层面彼此交织(例如LingBot-VLA在银河、AgileX硬件上得到验证,阿里巴巴同时持有RynnBrain与自变量机器人的股权),这正是2026年中国物理AI生态的结构性特征。

---

## 6. 主要来源

- RoboHorizon,《蚂蚁集团全面公开机器人AI全栈》,2026-01-29
- 机器人报,《Orbbec—Robbyant发布LingBot-Depth》,2026-01-30
- BusinessWire/FinancialContent,《Robbyant Open-Sources LingBot-World》,2026-01-29
- Las Vegas Sun/BusinessWire,《Robbyant Unveils LingBot-Map》,2026-04-16
- MarkTechPost,《Ant Group Releases LingBot-VLA》,2026-01-29
- MS Today,《阿里巴巴发布机器人开源AI"灵脑"》,2026-02-11
- 机器人报,《中国阿里巴巴发布机器人开源AI模型"灵脑"》,2026-02-11
- GitHub,alibaba-damo-academy/RynnBrain
- AI Times,《阿里巴巴发布开源机器人模型进军"物理AI"》,2026-02-11
- CIP Lawyer / Futubull,《Tencent Hunyuan World Model 1.5 Officially Launched》,2025-12-16~17
- arXiv 2602.11236,《ABot-M0: VLA Foundation Model for Robotic Manipulation with Action Manifold Learning》
- arXiv 2603.23376,《ABot-PhysWorld》
- arXiv 2602.11598,《ABot-N0》
- Gasgoo,《Unitree Robotics IPO Reaches Key Milestone》,2026-03-23
- Yicai,《China's Unitree Open-Sources World Model to Advance Robotics Ecosystem》,2025-09-16
- Global Economic,《宇树上市获批…估值逼近9.5万亿韩元》,2026-07
- OhmyNews,《血雨腥风的中国机器人三国杀》,2026-04-30
- GitHub,OpenGalaxea/GalaxeaVLA
- 机器人报,《2026年机器人数据战争已经打响》,2026-01-26
- Wowtale,《从机器人大脑到自动驾驶芯片,2月值得关注的4家中国初创企业》,2026-03-16
- 逐际动力官方新闻中心 · GitHub(limxdynamics/FluxVLA)
- RobotsAsia,《LimX Dynamics: Humanoid Robots, Oli & TRON Platforms》
- Cryptopolitan,《阿里巴巴向机器人公司自变量投资1亿美元》,2025-09-08
- 机器人报,《中国人形机器人初创企业"自变量机器人"估值突破28亿美元》
- GitHub,dexmal/dexbotic · Pandaily,《Dexmal Unveils DM0》,2026-02-10
- iting.co.kr,《2025年中国正在大力培育人形机器人产业》,2025-03-07(OpenLoong概述)
- 机器人报,《[专题] 一窥人形机器人强国"中国"的未来(3)》,2025-09-17(OpenLoong·上海创新中心)
- GQ Korea,《与人类共存的第一批机器人,出发点在中国》,2026-04-15(BAAI RoboBrain 2.0)
- inuglr.com,《中国国家主导型AI机器人政策:数据获取与开源标准化》,2026-03-13

*说明:部分项目(智平方/AlphaBrain、OpenJiuwen)在国际媒体与英文GitHub上的交叉验证资料相对有限,建议通过公司及社区官方渠道确认最新动态。*
