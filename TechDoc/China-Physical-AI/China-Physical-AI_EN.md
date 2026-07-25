---
title: "China's Physical AI and Embodied AI Open-Source Ecosystem"
description: "A survey of China's physical AI and embodied AI open-source ecosystem: internet giants (Ant Group, Alibaba, Tencent, Amap), robotics companies (Unitree, Galaxea, LimX Dynamics, X Square Robot, Dexmal), and state/academic initiatives (OpenLoong, BAAI), with strategic commentary."
keywords:
  - "Physical AI"
  - "Embodied AI"
  - "China robotics"
  - "VLA model"
  - "Unitree Robotics"
  - "Ant Group LingBot"
  - "Alibaba RynnBrain"
  - "open source robotics"
lang: en
featured: false
schema_type: TechArticle
---

# China's Physical AI and Embodied AI Open-Source Ecosystem

Last updated: 2026-07-06

## 0. Why Is China Fully Open-Sourcing Physical AI Right Now?

Starting with Ant Group's (Robbyant/LingBot) cascade of open-source releases in late January 2026, major platforms and robotics companies — Alibaba DAMO Academy (RynnBrain), Amap (the ABot series), Tencent (Hunyuan World Model), Unitree (UnifoLM), Galaxea Dynamics (GalaxeaVLA), X Square Robot (the WALL series), Dexmal (Dexbotic/DM0), LimX Dynamics (FluxVLA), and more — released foundation models and datasets for free, almost simultaneously. This should not be read as isolated PR events by individual companies, but as the result of three structural trends converging.
For Korea, China's physical AI is currently both an opportunity and a challenge. In a short period, China's open-source ecosystem has

1. **A coordinated strategy to break the data bottleneck**: collecting real-world robot data is far more expensive than text or image data. Rather than each company accumulating its own data in isolation, it has become widely accepted that opening up the model architecture and pipeline itself to absorb global developer feedback and derivative data is the faster path (as seen in Amap ABot-M0's "isolated silo integration" logic, and Galaxea General's strategy of reusing low-quality data).
2. **Convergence with government-led industrial policy**: China's government has designated robotics/humanoids as a strategic industry, and a significant share of the world's humanoid shipments in 2025 came from China. There are also cases like OpenLoong, led by the Shanghai state-owned enterprise "Humanoid Robot (Shanghai) Co., Ltd.," where a national-level innovation center directly fosters an open-source community.
3. **Racing to claim open standards amid the US-China tech rivalry**: outlets like Bloomberg have characterized Alibaba's release of RynnBrain as evidence that "China's open-source strategy could erode the West's closed-technology advantage." This is a fully open-source path that stands in contrast to the closed or partially open strategies of the US camp — Google DeepMind (Gemini Robotics-ER), NVIDIA (Cosmos), Physical Intelligence (the π0 family), and others.

Below is an updated version of the original reference material's company-by-company project list, adding the latest news and strategic commentary, plus major players not covered in the original (Galaxea General/Galbot, BAAI, Spirit AI).

## Opportunities and Challenges

1. Many Korean and American companies are wary of Chinese platforms. This is precisely why these companies are trying to overcome trust issues through open source, in areas such as security, partnerships, regulation, and scalability of use.
2. Still, a major concern remains: many factories are built on "tacit knowledge," and there is lingering fear that the learned results derived from this knowledge could flow to Chinese cloud providers and competing companies.
3. The core challenge is that we need the courage to climb onto the back of a running tiger.

---

## 1. Internet and Tech Giants

### 1.1 Ant Group — Ant LingBo Tech (Robbyant)

| Project | Type | Description | Link |
|---|---|---|---|
| LingBot-VLA | Embodied large model (VLA) | A "general-purpose brain" pretrained on 9 types of dual-arm robots and 20,000 hours of real-world data | [GitHub](https://github.com/Robbyant) · [Hugging Face](https://huggingface.co/robbyant) |
| LingBot-Depth | Spatial perception model | Precise 3D depth restoration from sparse, noisy depth data (Masked Depth Modeling) | Open-sourced |
| LingBot-World | World model | Real-time interactive simulation at 16fps with under 1-second latency, sustaining continuity for up to about a minute | Apache 2.0 license |
| LingBot-Map | Streaming 3D reconstruction | Real-time, SLAM-grade 3D mapping using just a single RGB camera; ranked #1 on the ETH3D benchmark | [GitHub](https://github.com/Robbyant/lingbot-map) · [arXiv](https://arxiv.org/abs/2604.14141) |

**Latest news and strategy (2026)**
- During "Evolution of Embodied AI Week" (January 28–30, 2026), Ant Group released LingBot-VLA, Depth, and World in succession, completing its first-ever open-source embodied AI model series. Robbyant CEO Zhu Xing framed this as "extending the AGI strategy from the digital domain into physical perception."
- LingBot-VLA has already been ported to third-party hardware including Galaxea Dynamics, AgileX Robotics, and AgiBot, verifying cross-morphology portability, and achieved SOTA on the GM-100 benchmark released by Shanghai Jiao Tong University.
- With the April 16 release of LingBot-Map, Ant Group completed a "full-stack embodied intelligence" spanning perception (Depth·Map), action (VLA), and imagination (World) — the core of its strategic messaging. However, Ant Group itself acknowledges in its technical documentation that its 20,000 hours of data only reach a level comparable to Physical Intelligence's (US) π*0.6, flagging data expansion as the next priority.
- It has also formed a strategic partnership with Orbbec to jointly optimize LingBot-Depth at the hardware level with Orbbec's depth camera (Gemini 330) and chip (MX6800).

### 1.2 Alibaba — DAMO Academy

| Project | Description | Link |
|---|---|---|
| RynnBrain | 2B/4B/8B dense + 30B-A3B MoE embodied foundation models, based on Qwen3-VL | [GitHub](https://github.com/alibaba-damo-academy/RynnBrain) · [Hugging Face](https://huggingface.co/Alibaba-DAMO-Academy) |
| RynnBrain-Plan/Nav/CoP | Post-trained models specialized for task planning, vision-language navigation, and point-level reasoning | Included in the repo above |
| RynnEC / RynnScale / RynnVLA-001,002 | MLLM-to-embodied-world connection, scalable embodied models, integrated VLA/world models | Alibaba DAMO Academy GitHub |

**Latest news and strategy (2026)**
- Released February 10, 2026. Claims to set new records on 16 open-source benchmarks, surpassing Google DeepMind's Gemini Robotics-ER 1.5 and NVIDIA's Cosmos-Reason2. The core differentiator is combining episodic memory with physical-world reasoning.
- Alibaba CTO Jeff Zhang personally oversees DAMO Academy, alongside organizational investment such as new research labs in Beijing, Hangzhou, San Mateo, Bellevue, Moscow, Tel Aviv, and Singapore.
- Strategically, alongside open-sourcing RynnBrain, Alibaba made a large-scale investment in humanoid startup X Square Robot (leading its Series A+ round, roughly $100–140 million), pursuing a dual strategy: "open-source the brain (model) to widen the ecosystem, while vertically integrating hardware through equity investment." Alibaba has named physical AI, alongside its Qwen LLM brand, as a core pillar of its AI strategy.
- On April 13 it additionally released RynnBrain-4B, continuing to expand its model lineup.

### 1.3 Tencent — Hunyuan

| Project | Description | Link |
|---|---|---|
| Hunyuan World Model 1.5 (WorldPlay) | Real-time interactive 3D world generation from a single text prompt or image; the industry's first fully open-sourced end-to-end pipeline (data, training, streaming inference) | [Tencent Hunyuan](https://3d-models.hunyuan.tencent.com/world/) |
| Hunyuan3D World 1.0 | 1.3B parameters, 3D VAE + Diffusion Transformer, generates clips of up to 16 seconds | Open-sourced |
| HunyuanVideo 1.5 | Open-source video generation model based on an 8.3B lightweight DiT | [arXiv](https://arxiv.org/pdf/2511.18870) |

**Latest news and strategy (2026)**
- Officially launched Hunyuan World Model 1.5 (WorldPlay) on December 17, 2025, claiming to have released "the industry's most systematic and comprehensive real-time world model framework" as fully open source across data, training, and streaming inference deployment. It claims to resolve the tension between real-time performance and geometric consistency via a Next-Frames-Prediction visual autoregressive task.
- Tencent's strategy applies the same world-model technology to both game/content production (WorldPlay, GameCraft) and robot simulation — a "two birds, one stone" approach that effectively competes with Ant Group's LingBot-World.
- Since its first open-sourcing in November 2024, the Hunyuan3D series has surpassed 3 million cumulative downloads on Hugging Face and has been adopted by 150+ companies including Unity China and Bambu Lab via Tencent Cloud. Unlike LingBot/DAMO Academy, its focus remains stronger in 3D content/game asset generation than as a dedicated robotics brand.

### 1.4 Amap (Gaode, an Alibaba affiliate) — ABot

| Project | Description | Link |
|---|---|---|
| ABot-M0 | A VLA based on the UniACT dataset (6M+ trajectories, 9,500 hours, integrating 6 open datasets), proposing Action Manifold Learning (AML) | [GitHub](https://github.com/amap-cvlab) · [Project page](https://amap-cvlab.github.io/ABot-Manipulation/) · [arXiv](https://arxiv.org/abs/2602.11236) |
| ABot-N0 | An embodied navigation VLA trained on 16.9M expert trajectories, achieving SOTA on 7 benchmarks | [Project page](https://amap-cvlab.github.io/ABot-Navigation/ABot-NO/) |
| ABot-PhysWorld | A physics-consistent interactive world foundation model, claiming superior physical plausibility versus Veo 3.1 and Sora v2 Pro | [GitHub](https://github.com/amap-cvlab/ABot-PhysWorld) |
| UniACT-dataset | Integrates 6 public datasets, 6M+ trajectories, covering 20+ robot morphologies | Released alongside ABot-M0 |

**Latest news and strategy (2026)**
- Amap (Gaode, i.e., "AutoNavi"), Alibaba Group's mapping/navigation affiliate, explicitly states in its papers an open-source philosophy that "embodied intelligence should not be a closed proprietary system, but should advance through the integration of heterogeneous data and gradual capability accumulation."
- ABot-M0's core technology, Action Manifold Learning (AML), predicts actions directly by projecting onto a low-dimensional manifold rather than using diffusion-based denoising, claiming simultaneous improvements in decoding speed and stability.
- Between February and March 2026, it sequentially released a trio — ABot-M0 (manipulation), ABot-N0 (navigation), and ABot-PhysWorld (world model) — completing a roadmap covering manipulation, mobility, and simulation. It operates as a separate organization from Alibaba DAMO Academy (RynnBrain), but moves as one axis of the same Alibaba Group open-source strategy.

---

## 2. Robotics Companies

### 2.1 Unitree Robotics

| Project | Description | Link |
|---|---|---|
| UnifoLM-WMA-0 | A cross-embodiment world-model-action architecture that doubles as a simulation engine and a policy-reinforcement module | [GitHub](https://github.com/unitreerobotics/unifolm-world-model-action) · [Hugging Face](https://huggingface.co/unitreerobotics/UnifoLM-WMA-0-Base) |
| UnifoLM-VLA-0 | A VLA large model for general-purpose humanoid manipulation | [GitHub](https://github.com/unitreerobotics) |
| Qmini / UniArmL1 | A low-cost, 3D-printable bipedal robot; a lightweight 6-DOF open-source robot arm | GitHub |

**Latest news and strategy (2026)**
- Open-sourced WMA-0 in September 2025 and VLA-0 in January 2026, respectively. Integrated UnifoLM-WMA-0 into the G1 humanoid (1.3m) to combine vision, language, and action.
- In early July 2026, it received listing approval on the Shanghai Stock Exchange (CSRC approval, valuation of roughly ₩9.5 trillion), putting an IPO within reach. Coinciding with its 10th anniversary, this event has made the virtuous cycle of "full-stack in-house development + mass production + open-source ecosystem" central to its IPO narrative.
- A researcher at Dalian Maritime University's Pioneer Technology Lab noted that "UnifoLM-WMA-0 lets a robot predict obstacles like puddles at the millisecond level and adjust its stride," while an industry source analyzed that "since a significant portion of Unitree's revenue comes from robots for education and research, securing a developer ecosystem is core to the business." Indeed, roughly 80% of its quadruped and humanoid models are deployed in research, education, and consumer markets.

### 2.2 Zhipingfang — AlphaBrain

| Project | Description | Link |
|---|---|---|
| AlphaBrain Platform | Claims to be the world's first one-stop open-source community for embodied AI models | Official announcement |
| NeuroVLA | A brain-science-based VLA model (claimed to be the world's first open-source of its kind) | Released via the AlphaBrain Platform |

**Note**: Zhipingfang/AlphaBrain has received relatively limited English-language/international media coverage compared to other major-affiliate projects, and a widely verifiable GitHub repository link has not yet been confirmed. The original material's "world's first" claim is based on the company's own official statements and requires further cross-verification. Monitoring the company's official channels is recommended to confirm the latest activity.

### 2.3 Galaxea Dynamics (Galaxea AI)

| Project | Description | Link |
|---|---|---|
| G0.5 (GalaxeaVLA) | A VLA that autoregressively generates reasoning and action tokens from a single transformer decoder | [GitHub](https://github.com/OpenGalaxea/GalaxeaVLA) |
| Galaxea Open-World Dataset | 50+ real-world environments, over 500 cumulative hours and 10TB of data, 400,000 downloads within two months of release | Hugging Face · ModelScope |
| G0Tiny | A lightweight 250M model for on-device inference (up to 10Hz) on the R1 Pro Orin | Hugging Face |

**Latest news and strategy (2026)**
- Founded September 2023 (founder Gao Jiyang, previously of Waymo and Momenta), pursuing a "full-stack" strategy that co-develops algorithms and hardware. Following the G0 release in August 2025, it rapidly iterated to G0Plus in January 2026 and G0.5 in June.
- Its wheeled robot R1 Pro was adopted as the official reference hardware partner for Ant Group's LingBot-VLA, strategically securing "reference hardware" status for large-company open-source models.
- Raised 1 billion RMB (roughly ₩145 billion) in a Series B in February 2026, and touts the success of the Galaxea Open-World Dataset (400,000 downloads) as a key achievement in expanding the data ecosystem.
- A similarly named but separate company, **Galaxea General (Galbot / 银河通用)**, developed LDA-1B (Latent Dynamics Action Model) in collaboration with Peking University and Tsinghua University; it was formally accepted at RSS (Robotics: Science and Systems) in April 2026. Using DINO-based latent representations, it leverages even low-quality, unrefined data for training, drawing attention for a result showing "adding 30% low-quality data raises the success rate by 10 percentage points." It is currently valued at 20 billion RMB. Galbot G1 appeared on China's CCTV Spring Festival Gala stage in 2026, has been deployed in 100 pharmacies handling over 300,000 medication sales, and became China's first certified "robot pharmacist." **The two companies share similar names but are separate legal entities, so care should be taken to avoid confusion when citing this document.**

### 2.4 LimX Dynamics

| Project | Description | Link |
|---|---|---|
| FluxVLA Engine | A standardized engineering platform covering the full VLA lifecycle (data→training→evaluation→real-world deployment), Apache 2.0 | [GitHub](https://github.com/limxdynamics/FluxVLA) · [Docs](https://fluxvla.limxdynamics.com/) |
| LimX COSA / VGM / DreamActor | Embodied agentic OS, manipulation algorithms, and a new embodied learning paradigm | Official homepage |

**Latest news and strategy (2026)**
- Announced open-sourcing the FluxVLA Engine on April 30, 2026. It positions itself as a standardized platform capable of managing major VLA algorithms — OpenVLA, LlavaVLA, GR00T, Pi0, Pi0.5 — through a single configuration file, and is already being integrated into third-party serving frameworks (e.g., Reflex).
- Secured strategic investment from Alibaba (2024) and JD.com (2025), positioning itself as a "hardware + software platform company" that combines a product ladder from TRON 1/2 (research-oriented) to Oli (a fully realized humanoid) with a software stack (COSA, VGM, DreamActor, FluxVLA).
- Raised a roughly $200 million investment round as of February 2026 (grouped alongside Galaxea and Spirit AI among the large-round cohort), and has strengthened developer community engagement by opening direct technical support channels via mason@limxdynamics.com and wayne@limxdynamics.com, in addition to GitHub issues.

### 2.5 X Square Robot (自变量机器人)

| Project | Description | Link |
|---|---|---|
| WALL-OSS-0.5 | A 4B-parameter VLA for zero-shot real-robot manipulation; claims the industry's first open-sourced embodied AI | GitHub · Hugging Face |
| WALL-B / WALL-WM | A foundation model based on the "World Unified Model" architecture / its expanded world-model version | Released |
| XRZero-G0 | An open-source framework enabling data collection and training without a robot; entered AlphaXiv's top-10 trending list within a week of release | Released |

**Latest news and strategy (2026)**
- Founded in December 2023 (as of writing, less than two years old). It raised eight consecutive funding rounds, including a Series A+ in September 2025 (led by Alibaba Cloud and CAS Investment, $100 million), totaling roughly $280 million (2 billion RMB) cumulatively. It then raised four consecutive rounds over two months in early 2026, bringing in 30+ investors and surpassing a valuation of 20 billion RMB (roughly ₩4.5 trillion), joining Galbot, Galaxea AI, Spirit AI, and LinkerBot in the "20-billion-RMB club."
- CEO Wang Qian (with Yang Qian as COO at founding) emphasizes that "we focused on our own foundation model from day one," pursuing a dual strategy of simultaneously open-sourcing and commercializing both hardware (the cleaning robot Quanta X2) and models (the WALL series).
- With the April 2026 release of WALL-B, it touted a "World Unified Model" architecture that, unlike conventional modular VLAs, learns perception, language, action, and physical prediction within a single network. It has also begun IPO preparations, though the listing venue remains undecided.

### 2.6 Dexmal (原力灵机)

| Project | Description | Link |
|---|---|---|
| Dexbotic 2.0 | A PyTorch-based VLA development toolbox supporting reproduction/fine-tuning of major algorithms like π0 and CogACT, MIT licensed | [GitHub](https://github.com/dexmal/dexbotic) |
| DM0 | A 2.4B-parameter "Embodied-Native" VLA, ranking #1 on the RoboChallenge Table30 benchmark | [GitHub](https://github.com/dexmal/dexbotic/blob/main/docs/DM0.md) · [arXiv](https://arxiv.org/html/2602.14974v1) |

**Latest news and strategy (2026)**
- First released Dexbotic in October 2025, and disclosed at the DM0 release on February 10, 2026 that it was co-developed with StepFun. It has also announced a strategic collaboration with the RLinf team for VLA + reinforcement-learning research, showing active alliance-building across the open-source ecosystem.
- DM0's core claim is an "Embodied-Native" approach that, rather than the conventional method of post-adapting internet-pretrained models to physical tasks, integrates driving and embodied interaction data from the pretraining stage itself. It combines a 3-stage (pretraining–mid-training–post-training) pipeline with a Flow Matching action expert.
- Based in Beijing, it is positioning Dexbotic 2.0 as "PyTorch-grade infrastructure for embodied AI," aiming to claim the position of a standard development framework.

---

## 3. Open-Source Communities and State-Led Projects

### 3.1 OpenLoong

| Project | Description | Link |
|---|---|---|
| OpenLoong | An open-source community for humanoid embodied AI manipulation systems | [GitHub](https://github.com/loongOpen) |
| OpenLoong-Dyn-Control | Whole-body dynamics control software based on MPC/WBC | GitHub |
| OpenLoong-Hardware | Open-source humanoid robot hardware | GitHub |

**Latest news and strategy (2026)**
- Launched in May 2024. Led in R&D by the state-owned enterprise "Humanoid Robot (Shanghai) Co., Ltd. (人形机器人上海有限公司)," and directly operated by a national-level innovation center (the Shanghai Humanoid Robot Innovation Center) — a "command-tower" style open-source community that differs in character from privately led projects.
- Innovation center General Manager Xu Bin stated: "We will build a common technology platform based on the open-source version of the humanoid 'Qinglong,' simultaneously achieving core technology breakthroughs and large-scale commercialization." In other words, OpenLoong is less an individual company's ecosystem-expansion tool and more **a national effort to build common infrastructure for China's entire robotics industry**.
- Amid a structure in which 2025–2026 government/state-owned-enterprise-led bulk procurement drives cash flow and economies of scale for robotics startups, analysts note that OpenLoong serves as the technical standardization axis of this trend (supported by statistics showing roughly 87% of global humanoid shipments in 2025 were made in China).

### 3.2 OpenJiuwen

| Project | Description | Link |
|---|---|---|
| JiuwenSwarm | Multi-agent collaboration system | GitHub |
| Agent-Core | Python SDK for LLM applications | GitHub |
| Agent-Protocol | SDK for agent interoperability protocols | GitHub |

**Note**: OpenJiuwen is a project focused more on the agent/SDK layer than on robotic hardware itself, and as of this search, international media coverage is relatively limited. Direct verification via the GitHub repository and tracking the commit history are recommended.

### 3.3 [New addition] BAAI (Beijing Academy of Artificial Intelligence) — RoboBrain 2.0

| Project | Description | Link |
|---|---|---|
| RoboBrain 2.0 | An open-source robotics model combining language-model capability with spatial reasoning, notably learning by directly observing human motion from Douyin (China's TikTok) videos | BAAI official |

**Latest news and strategy (2026)**
- BAAI (led by its director and robotics research lead, Zhongyuan Wang) is a leading open-source axis rooted in universities and government research institutes, distinct from the corporate axis (Ant, Alibaba, Tencent) as an academia-national-lab hybrid model. It has drawn attention for its approach of directly using vast quantities of human motion video available on the internet (e.g., social-media dance videos) as training data.

### 3.4 [New addition] Spirit AI

**Overview and strategy (2026)**: Often called "China's Physical Intelligence," Spirit AI differentiates itself with the philosophy that large-scale training on "dirty data" — rather than curated data — is the key to scaling VLA. It claims to have reduced data-collection costs by 90% versus teleoperation by evolving its own wearable data-collection device through 5 generations, and has amassed over 200,000 hours of real-world interaction data (targeting 1 million hours within the year). In January 2026, it open-sourced "Spirit v1.5," which was reported to have outperformed US Physical Intelligence's π0.5 on the RoboChallenge global leaderboard. With industrial strategic investors such as CATL, Huawei, Xiaomi, and JD.com participating alongside state-backed funds from Chongqing and Hangzhou, it has secured shareholders spanning both upstream (components) and downstream (distribution), a structure viewed as enabling it to rapidly accumulate real-world deployment data.

---

## 4. Summary: Layered Structure of China's Physical AI Open-Source Ecosystem (Updated)

| Layer | Representative company/project | Nature | Key link |
|---|---|---|---|
| Foundation model layer | Ant (LingBot-VLA), DAMO Academy (RynnBrain), Amap (ABot-M0), Dexmal (DM0), Spirit AI (v1.5) | General-purpose VLA "brain" | lingbot-vla · RynnBrain · ABot-Manipulation |
| World model layer | Unitree (UnifoLM-WMA-0), Tencent (Hunyuan World 1.5), Ant (LingBot-World), Amap (ABot-PhysWorld) | Simulation/data-generation engine | UnifoLM-WMA-0 |
| Framework/toolchain layer | Dexmal (Dexbotic 2.0), LimX Dynamics (FluxVLA), Zhipingfang (AlphaBrain) | Development infrastructure standardization | FluxVLA · Dexbotic |
| Dataset layer | Galaxea (Open-World Dataset), Amap (UniACT-dataset), X Square Robot (XRZero-G0), Galaxea General (LDA-1B training set) | Large-scale real/synthetic data | X-Square-Robot |
| OS/hardware layer | OpenLoong (state-led), Unitree (UnifoLM-integrated G1), LimX Dynamics (COSA) | Robot hardware/OS standards | OpenLoong |
| National/academic infrastructure layer | OpenLoong (state-owned-enterprise-led), BAAI (RoboBrain 2.0), OpenJiuwen | Industry-wide standards, policy linkage | Shanghai Humanoid Robot Innovation Center |

---

## 5. Overall Strategic Landscape Summary

1. **Large tech companies (Ant, Alibaba, Tencent)**: share a two-stage strategy of fully open-sourcing models to "absorb the global developer ecosystem → lock in one's own cloud/hardware partners." Alibaba's approach is particularly distinctive in pursuing both open source (RynnBrain) and equity investment (X Square Robot) simultaneously.
2. **Robotics hardware companies (Unitree, Galaxea, X Square Robot, LimX Dynamics)**: open-sourcing is oriented less toward revenue and more toward expanding the developer base and supporting IPO/investment narratives. This is underpinned by Unitree's imminent listing and the successive large funding rounds raised by X Square Robot and Galaxea.
3. **Pure AI startups (Dexmal, Spirit AI)**: compete without hardware, purely on models, data, and frameworks — benchmark leadership (RoboChallenge, GM-100) functions directly as both marketing and a fundraising tool.
4. **National/academic axis (OpenLoong, BAAI)**: separate from individual company competition, these play a role in building shared industry-wide standards and data infrastructure, directly linked to government bulk-procurement policy.

The fact that these four axes compete with each other while remaining intertwined in data, talent, and investment (e.g., LingBot-VLA verified on Galaxea/AgileX hardware, Alibaba simultaneously holding both RynnBrain and equity in X Square Robot) is a defining structural feature of China's 2026 physical AI ecosystem.

---

## 6. Key Sources

- RoboHorizon, "Ant Group Fully Unveils Robot AI Full Stack," 2026-01-29
- Robot Newspaper, "Orbbec–Robbyant Release LingBot-Depth," 2026-01-30
- BusinessWire/FinancialContent, "Robbyant Open-Sources LingBot-World," 2026-01-29
- Las Vegas Sun/BusinessWire, "Robbyant Unveils LingBot-Map," 2026-04-16
- MarkTechPost, "Ant Group Releases LingBot-VLA," 2026-01-29
- MS Today, "Alibaba Releases Open-Source Robot AI 'RynnBrain'," 2026-02-11
- Robot Newspaper, "China's Alibaba Releases Open-Source Robot AI Model 'RynnBrain'," 2026-02-11
- GitHub, alibaba-damo-academy/RynnBrain
- AI Times, "Alibaba Enters 'Physical AI' with Open-Source Robot Model Launch," 2026-02-11
- CIP Lawyer / Futubull, "Tencent Hunyuan World Model 1.5 Officially Launched," 2025-12-16~17
- arXiv 2602.11236, "ABot-M0: VLA Foundation Model for Robotic Manipulation with Action Manifold Learning"
- arXiv 2603.23376, "ABot-PhysWorld"
- arXiv 2602.11598, "ABot-N0"
- Gasgoo, "Unitree Robotics IPO Reaches Key Milestone," 2026-03-23
- Yicai, "China's Unitree Open-Sources World Model to Advance Robotics Ecosystem," 2025-09-16
- Global Economic, "Unitree Listing Approved... Valuation Nears ₩9.5 Trillion," 2026-07
- OhmyNews, "China's Fierce Three-Way Robot Race," 2026-04-30
- GitHub, OpenGalaxea/GalaxeaVLA
- Robot Newspaper, "The 2026 Robot Data War Has Already Begun," 2026-01-26
- Wowtale, "From Robot Brains to Autonomous Driving Chips: 4 Chinese Startups to Watch in February," 2026-03-16
- LimX Dynamics official newsroom · GitHub (limxdynamics/FluxVLA)
- RobotsAsia, "LimX Dynamics: Humanoid Robots, Oli & TRON Platforms"
- Cryptopolitan, "Alibaba Backs Robotics Firm X Square with $100 Million Investment," 2025-09-08
- Robot Newspaper, "China's Humanoid Startup 'X Square Robot' Surpasses $2.8 Billion Valuation"
- GitHub, dexmal/dexbotic · Pandaily, "Dexmal Unveils DM0," 2026-02-10
- iting.co.kr, "China Is Cultivating Its Humanoid Robotics Industry in 2025," 2025-03-07 (OpenLoong overview)
- Robot Newspaper, "[Feature] A Glimpse into the Future of Humanoid Robotics Powerhouse 'China' (3)," 2025-09-17 (OpenLoong / Shanghai Innovation Center)
- GQ Korea, "The First Robots to Coexist with Humans Will Emerge from China," 2026-04-15 (BAAI RoboBrain 2.0)
- inuglr.com, "China's State-Led AI Robotics Policy: Securing Data and Open-Source Standardization," 2026-03-13

*Note: For some projects (Zhipingfang/AlphaBrain, OpenJiuwen), cross-verifiable material via international media/English-language GitHub is relatively limited; checking the companies' and communities' official channels for the latest developments is recommended.*
