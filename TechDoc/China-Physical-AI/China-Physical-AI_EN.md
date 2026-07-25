---
title: "China's Physical AI and Embodied AI Open-Source Ecosystem"
description: "A comprehensive map of China's physical AI and embodied AI open-source ecosystem — from Ant Group, Alibaba, and Tencent's foundation models to Unitree, Galaxea, and X Square Robot's humanoid platforms, plus state-led initiatives like OpenLoong."
abstract: |
  Starting with a wave of open-source releases from Ant Group (Robbyant/LingBot) in late January 2026, major Chinese
  platform and robotics companies — Alibaba DAMO Academy (RynnBrain), Amap (ABot series), Tencent (Hunyuan World Model),
  Unitree (UnifoLM), Galaxea (GalaxeaVLA), X Square Robot (WALL series), Dexmal (Dexbotic/DM0), and LimX Dynamics
  (FluxVLA) — released foundation models and datasets for free in near-simultaneous succession. This isn't a series of
  isolated PR events, but the product of three structural trends: a coordinated strategy to overcome the data bottleneck
  in robotics, alignment with government-led industrial policy, and a race to establish open standards in the US-China
  tech rivalry. This document maps the ecosystem by company, adds strategic commentary and the latest news, and
  includes major players missing from the original source material (Galaxea General/Galbot, BAAI, Spirit AI).
summary_for_ai: |
  A comprehensive, continuously updated (last updated 2026-07-06) map of China's physical AI / embodied AI open-source
  ecosystem, organized into internet/tech giants, robotics companies, and open-source communities / state-led projects.
  Internet/tech giants: Ant Group (LingBot-VLA/Depth/World/Map — a full embodied-AI stack spanning perception, action,
  and imagination), Alibaba DAMO Academy (RynnBrain, a 2B-30B MoE embodied foundation model claiming to beat Google
  DeepMind's Gemini Robotics-ER and NVIDIA's Cosmos-Reason2), Tencent (Hunyuan World Model 1.5/WorldPlay, an open
  real-time interactive 3D world generation pipeline), and Amap/Alibaba (ABot-M0/N0/PhysWorld with Action Manifold
  Learning).
  Robotics companies: Unitree (UnifoLM-WMA-0/VLA-0, heading toward a Shanghai IPO valued at roughly $9.5B/¥9.5 trillion
  KRW-equivalent), Zhipingfang/AlphaBrain (NeuroVLA, less internationally verified), Galaxea Dynamics (GalaxeaVLA/G0.5,
  reference hardware for Ant's LingBot-VLA) vs. the separately-owned Galaxea General/Galbot (LDA-1B, deployed as
  China's first "robot pharmacist" in 100+ pharmacies), LimX Dynamics (FluxVLA Engine, a standardized VLA tooling
  platform), X Square Robot (WALL-OSS-0.5/WALL-B "World Unified Model," part of the ~¥20B valuation club), and Dexmal
  (Dexbotic 2.0 toolbox, DM0's "Embodied-Native" pretraining approach, #1 on the RoboChallenge Table30 benchmark).
  Open-source communities / state-led initiatives: OpenLoong (a state-enterprise-led common technology platform run by
  Shanghai's national humanoid robot innovation center, distinct from corporate-led projects — roughly 87% of 2025
  global humanoid shipments were made in China), OpenJiuwen (multi-agent SDK layer, limited international coverage),
  BAAI's RoboBrain 2.0 (an academic/national-lab hybrid learning from human motion videos scraped from social media),
  and Spirit AI (dubbed "China's Physical Intelligence," betting on large-scale "dirty data" training over curated data,
  claiming to beat US Physical Intelligence's π0.5 on the RoboChallenge leaderboard).
  Overall strategic landscape: tech giants combine full open-sourcing with equity stakes in hardware partners (Alibaba
  open-sources RynnBrain while investing ~$100-140M in X Square Robot); hardware companies use open source primarily
  to build developer mindshare and support IPO/fundraising narratives; pure AI startups compete on benchmark rankings as
  marketing; and state/academic actors build shared industry infrastructure tied to government procurement policy.
date: 2026-07-06
author: "Dennis Kim"
lang: en
tags:
  - Physical AI
  - Embodied AI
  - China
  - Robotics
  - Open Source
  - VLA
keywords:
  - China physical AI
  - embodied AI open source
  - VLA foundation model
  - Ant Group LingBot
  - Alibaba RynnBrain
  - Unitree UnifoLM
  - humanoid robot China
featured: false
schema_type: TechArticle
draft: false
---

# China's Physical AI and Embodied AI Open-Source Ecosystem

Last updated: 2026-07-06

## 0. Why Is China Fully Open-Sourcing Physical AI Right Now?

Starting with a wave of open-source releases from Ant Group (Robbyant/LingBot) in late January 2026, major platform and robotics companies — Alibaba DAMO Academy (RynnBrain), Amap (ABot series), Tencent (Hunyuan World Model), Unitree (UnifoLM), Galaxea (GalaxeaVLA), X Square Robot (WALL series), Dexmal (Dexbotic/DM0), and LimX Dynamics (FluxVLA) — released foundation models and datasets for free in near-simultaneous succession. This should be read not as a series of individual PR events, but as the product of three overlapping structural trends. For Korea right now, China's physical AI represents both an opportunity and a challenge, given how quickly it could integrate into China's open-source ecosystem.

1. **A coordinated strategy to break the data bottleneck**: collecting real-world robot data is dramatically more expensive than collecting text or image data. Rather than each company hoarding its own data, the logic has spread that publishing the model architecture and pipeline itself to absorb global developer feedback and derivative data is the faster path (as seen in Amap ABot-M0's "consolidating isolated silos" logic and Galaxea General's strategy of recycling low-quality data).
2. **Alignment with government-led industrial policy**: the Chinese government has designated robotics and humanoids as a strategic industry, and a substantial share of 2025's global humanoid shipments came from China. There are also cases of national-level innovation centers directly building open-source communities, such as OpenLoong, led by the state-owned enterprise "Humanoid Robot (Shanghai) Co., Ltd."
3. **Racing to seize open standards amid the US-China tech rivalry**: outlets like Bloomberg have described Alibaba's RynnBrain release as something that "could undercut Western firms' closed technological edge." It's a fully open-source path standing in contrast to the closed or partially-open strategies of the American camp — Google DeepMind (Gemini Robotics-ER), NVIDIA (Cosmos), and Physical Intelligence (the π0 family).

Below is an updated version of the original per-company project list, with the latest news and strategic commentary added, plus major players missing from the original (Galaxea General/Galbot, BAAI, Spirit AI).

## Opportunity and Challenge

1. Many Korean and American companies are wary of Chinese platforms. This is exactly why open source is being used as a way to break through the trust problem around security, partnerships, regulation, and scalability of use.
2. Even so, the concern remains that many factories are built on "tacit knowledge," and there's a lingering fear that the learned results end up flowing into Chinese cloud providers and competitors.
3. The core challenge is that we need the courage to climb onto the back of a running tiger.

---

## 1. Internet and Tech Giants

### 1.1 Ant Group — LingBo Tech (Ant LingBo / Robbyant)

| Project | Type | Description | Link |
|---|---|---|---|
| LingBot-VLA | Embodied foundation model (VLA) | A "general-purpose brain" pretrained on 20,000 hours of real-world data across 9 dual-arm robots | [GitHub](https://github.com/Robbyant) · [Hugging Face](https://huggingface.co/robbyant) |
| LingBot-Depth | Spatial perception model | Precise 3D depth reconstruction from sparse, noisy depth data (Masked Depth Modeling) | Open-sourced |
| LingBot-World | World model | Real-time interactive simulation at 16fps with sub-1-second latency, sustaining continuity for up to ~1 minute | Apache 2.0 license |
| LingBot-Map | Streaming 3D reconstruction | Real-time SLAM-grade 3D mapping from a single RGB camera; #1 on the ETH3D benchmark | [GitHub](https://github.com/Robbyant/lingbot-map) · [arXiv](https://arxiv.org/abs/2604.14141) |

**Latest news and strategy (2026)**
- During "Evolution of Embodied AI Week" (Jan 28-30, 2026), Ant Group released LingBot-VLA, Depth, and World in succession, completing its first open-source embodied AI model series. Robbyant CEO Zhu Xing framed this as "extending our AGI strategy from the digital domain to physical perception."
- LingBot-VLA has already been ported to third-party hardware including Galaxea Dynamics, AgileX Robotics, and AgiBot, validating cross-morphology portability, and achieved SOTA on the GM-100 benchmark released by Shanghai Jiao Tong University.
- With the addition of LingBot-Map on April 16, Ant now positions itself as having completed a "full embodied intelligence stack" spanning perception (Depth, Map), action (VLA), and imagination (World) — its core strategic message. That said, Ant's own technical documentation admits that with 20,000 hours of data, performance is only comparable to US-based Physical Intelligence's π*0.6, flagging data expansion as the next challenge.
- Ant has also signed a strategic partnership with Orbbec to jointly optimize LingBot-Depth with Orbbec's depth cameras (Gemini 330) and chips (MX6800), pursuing a parallel hardware-integration strategy.

### 1.2 Alibaba — DAMO Academy

| Project | Description | Link |
|---|---|---|
| RynnBrain | 2B/4B/8B dense + 30B-A3B MoE embodied foundation model, built on Qwen3-VL | [GitHub](https://github.com/alibaba-damo-academy/RynnBrain) · [Hugging Face](https://huggingface.co/Alibaba-DAMO-Academy) |
| RynnBrain-Plan/Nav/CoP | Post-trained models specialized for task planning, vision-language navigation, and point-level reasoning | Included in the repository above |
| RynnEC / RynnScale / RynnVLA-001,002 | Connecting MLLMs to embodied worlds, a scalable embodied model, and integrated VLA/world models | Alibaba DAMO Academy GitHub |

**Latest news and strategy (2026)**
- Released on February 10, 2026. Alibaba claims RynnBrain surpasses Google DeepMind's Gemini Robotics-ER 1.5 and NVIDIA's Cosmos-Reason2, setting new records across 16 open-source benchmarks. Its core differentiator is combining episodic spatiotemporal memory with physical-world reasoning.
- Alibaba CTO Jeff Zhang personally oversees DAMO Academy, alongside organizational investment such as establishing seven new research labs across Beijing, Hangzhou, San Mateo, Bellevue, Moscow, Tel Aviv, and Singapore.
- Strategically, alongside open-sourcing RynnBrain, Alibaba has made a large equity investment in humanoid startup X Square Robot (leading an A+ round of roughly $100-140M), pursuing a dual strategy: "open-source the brain (model) to expand the ecosystem, and vertically integrate hardware through equity stakes." Alibaba has explicitly positioned physical AI, alongside its Qwen LLM brand, as a core pillar of its AI strategy.
- Alibaba further expanded its model lineup with the release of RynnBrain-4B on April 13.

### 1.3 Tencent — Hunyuan

| Project | Description | Link |
|---|---|---|
| Hunyuan World Model 1.5 (WorldPlay) | Generates real-time interactive 3D worlds from a single text prompt or image; the industry's first fully open-sourced pipeline (data, training, streaming inference) | [Tencent Hunyuan](https://3d-models.hunyuan.tencent.com/world/) |
| Hunyuan3D World 1.0 | 1.3B parameters, 3D VAE + Diffusion Transformer, generates clips up to 16 seconds | Open-sourced |
| HunyuanVideo 1.5 | An open-source video generation model based on a lightweight 8.3B DiT | [arXiv](https://arxiv.org/pdf/2511.18870) |

**Latest news and strategy (2026)**
- Tencent officially launched Hunyuan World Model 1.5 (WorldPlay) on December 17, 2025, describing it as "the industry's most systematic and comprehensive real-time world model framework," open-sourced end-to-end from data and training to streaming inference deployment. It claims to resolve the tension between real-time performance and geometric consistency using a Next-Frames-Prediction visual autoregressive task.
- Tencent's strategy is a "two birds, one stone" approach, applying the same world-model technology to both game/content creation (WorldPlay, GameCraft) and robot simulation, effectively putting it in direct competition with Ant Group's LingBot-World.
- The Hunyuan3D series has surpassed 3 million cumulative downloads on Hugging Face since its first open-sourcing in November 2024, and has been adopted by 150+ companies including Unity China and Bambu Lab via Tencent Cloud. Unlike LingBot/DAMO, Tencent's emphasis still leans more heavily toward 3D content and game asset generation than a dedicated robotics brand.

### 1.4 Amap (Alibaba Group) — ABot

| Project | Description | Link |
|---|---|---|
| ABot-M0 | A VLA built on the UniACT dataset (6M+ trajectories, 9,500 hours, consolidated from 6 open datasets), proposing Action Manifold Learning (AML) | [GitHub](https://github.com/amap-cvlab) · [Project page](https://amap-cvlab.github.io/ABot-Manipulation/) · [arXiv](https://arxiv.org/abs/2602.11236) |
| ABot-N0 | An embodied navigation VLA trained on 16.9M expert trajectories; SOTA across 7 benchmarks | [Project page](https://amap-cvlab.github.io/ABot-Navigation/ABot-NO/) |
| ABot-PhysWorld | A physically consistent interactive world foundation model, claiming superior physical plausibility over Veo 3.1 and Sora v2 Pro | [GitHub](https://github.com/amap-cvlab/ABot-PhysWorld) |
| UniACT-dataset | Consolidates 6 public datasets, 6M+ trajectories, covering 20+ robot morphologies | Released alongside ABot-M0 |

**Latest news and strategy (2026)**
- Amap (a mapping and navigation subsidiary of Alibaba Group) opens its paper by explicitly stating an open-source philosophy: "embodied intelligence should not develop as a closed, proprietary system, but through the consolidation of heterogeneous data and incremental capability accumulation."
- ABot-M0's core technique is Action Manifold Learning (AML), which directly predicts actions via projection onto a low-dimensional manifold instead of denoising diffusion, claiming to improve both decoding speed and stability simultaneously.
- Between February and March 2026, Amap released its three-part set — ABot-M0 (manipulation), ABot-N0 (navigation), and ABot-PhysWorld (world model) — completing a roadmap spanning manipulation, locomotion, and simulation. It operates as a separate organization from Alibaba DAMO Academy (RynnBrain), but functions as one arm of the same Alibaba Group open-source strategy.

---

## 2. Robotics Companies

### 2.1 Unitree Robotics

| Project | Description | Link |
|---|---|---|
| UnifoLM-WMA-0 | A cross-embodiment world model-action architecture, doubling as a simulation engine and policy reinforcement module | [GitHub](https://github.com/unitreerobotics/unifolm-world-model-action) · [Hugging Face](https://huggingface.co/unitreerobotics/UnifoLM-WMA-0-Base) |
| UnifoLM-VLA-0 | A large VLA model for general-purpose humanoid manipulation | [GitHub](https://github.com/unitreerobotics) |
| Qmini / UniArmL1 | A 3D-printable low-cost bipedal robot; a lightweight 6-DOF open-source robot arm | GitHub |

**Latest news and strategy (2026)**
- Open-sourced WMA-0 in September 2025 and VLA-0 in January 2026, respectively. Integrated UnifoLM-WMA-0 into the G1 humanoid (1.3m) to combine vision, language, and action.
- In early July 2026, Unitree received listing approval on the Shanghai Stock Exchange (CSRC approval, valued at roughly ¥9.5 trillion KRW-equivalent), putting it on the verge of an IPO. Timed with its 10th anniversary, the virtuous cycle of "full in-house R&D + mass production + open-source ecosystem" is being presented as the core narrative of its IPO story.
- A researcher at Dalian Maritime University's Pioneer Technology Lab noted that "UnifoLM-WMA-0 lets robots predict obstacles like puddles millisecond by millisecond and adjust stride accordingly," and industry observers note that "since a significant share of Unitree's revenue comes from education/research robots, building a developer ecosystem is core to the business." Indeed, roughly 80% of its quadruped and humanoid models are deployed in research, education, and consumer markets.

### 2.2 Zhipingfang — AlphaBrain

| Project | Description | Link |
|---|---|---|
| AlphaBrain Platform | Claims to be the world's first one-stop open-source embodied AI model community | Official announcement |
| NeuroVLA | A neuroscience-inspired VLA model (claimed to be the world's first open-source of its kind) | Released via the AlphaBrain Platform |

**Note**: Coverage of Zhipingfang/AlphaBrain in international/English media is limited compared to other major-corporate-affiliated projects, and a widely verifiable GitHub repository link has not yet been confirmed. The "world's first" claims in the original source material are based on the company's own official announcements and require further cross-verification. Monitoring the company's official channels is recommended for the latest activity.

### 2.3 Galaxea Dynamics (Galaxea AI)

| Project | Description | Link |
|---|---|---|
| G0.5 (GalaxeaVLA) | An autoregressive VLA that generates reasoning and action tokens from a single transformer decoder | [GitHub](https://github.com/OpenGalaxea/GalaxeaVLA) |
| Galaxea Open-World Dataset | 50+ real-world environments, 500+ cumulative hours, 10TB+, with 400,000 downloads within two months of release | Hugging Face · ModelScope |
| G0Tiny | A 250M lightweight model for on-device inference on the R1 Pro Orin (up to 10Hz) | Hugging Face |

**Latest news and strategy (2026)**
- Founded in September 2023 by Gao Jiyang (a former Waymo and Momenta engineer), pursuing a "full-stack" strategy that develops algorithms and hardware together. Following the G0 release in August 2025, it rapidly iterated to G0Plus in January 2026 and G0.5 in June 2026.
- Its wheeled robot R1 Pro was adopted as the official hardware partner for Ant Group's LingBot-VLA, strategically securing "reference hardware" status for major corporate open-source models.
- Raised ¥1 billion (roughly $145M) in a Series B round in February 2026, citing the success of the Galaxea Open-World Dataset (400,000 downloads) as a key achievement in its data-ecosystem expansion.
- A separately named but similarly-named company, **Galaxea General (Galbot)**, jointly developed LDA-1B (Latent Dynamics Action Model) with Peking University and Tsinghua University, which was formally accepted at RSS (Robotics: Science and Systems) in April 2026. Using DINO-based latent representations, it can train on low-quality, unrefined data — reportedly achieving a "10 percentage-point success rate increase from adding 30% more low-quality data" — and is currently valued at ¥20 billion. Galbot's G1 appeared on China's CCTV Spring Festival gala in 2026 and has been deployed across 100 pharmacies, handling 300,000+ medication sales, earning China's first "robot pharmacist" credential. **The two companies have similar names but are separate legal entities — be careful not to confuse them when citing this document.**

### 2.4 LimX Dynamics

| Project | Description | Link |
|---|---|---|
| FluxVLA Engine | A standardized engineering platform for the full VLA lifecycle (data -> training -> evaluation -> real-world deployment), Apache 2.0 | [GitHub](https://github.com/limxdynamics/FluxVLA) · [Docs](https://fluxvla.limxdynamics.com/) |
| LimX COSA / VGM / DreamActor | An embodied agentic OS, manipulation algorithms, and a new embodied-learning paradigm | Official website |

**Latest news and strategy (2026)**
- Announced the open-sourcing of the FluxVLA Engine on April 30, 2026. It positions itself as a standardized platform for managing major VLA algorithms — OpenVLA, LlavaVLA, GR00T, Pi0, Pi0.5, and more — through a single config file, and has already been integrated into third-party serving frameworks such as Reflex.
- Secured strategic investment from Alibaba (2024) and JD.com (2025), positioning itself as a "hardware + software platform company" by combining its product ladder (TRON 1/2 for research -> Oli, a full humanoid) with its software stack (COSA, VGM, DreamActor, FluxVLA).
- Raised roughly $200M in its latest funding round as of February 2026 (part of a group of large rounds alongside Galaxea and Spirit AI), and beyond GitHub issues, has opened direct technical support channels via mason@limxdynamics.com and wayne@limxdynamics.com to strengthen its touchpoints with the developer community.

### 2.5 X Square Robot (自变量机器人)

| Project | Description | Link |
|---|---|---|
| WALL-OSS-0.5 | A 4B-parameter VLA for zero-shot real-world robot manipulation, claiming to be the industry's first open-sourced embodied AI of its kind | GitHub · Hugging Face |
| WALL-B / WALL-WM | A foundation model based on the World Unified Model architecture / an extended world-model version | Released |
| XRZero-G0 | An open-source framework enabling data collection and training without a physical robot; entered AlphaXiv's top-10 trending within one week of release | Released |

**Latest news and strategy (2026)**
- Founded in December 2023 (still under 2 years old as of the latest updates), X Square Robot raised eight consecutive funding rounds including a September 2025 Series A+ round (led by Alibaba Cloud and CAS Investment, $100M), reaching roughly $280M (¥2 billion) in cumulative funding. Over four consecutive rounds in the two months following early 2026, it attracted 30+ investors and surpassed a ¥20 billion (roughly ₩4.5 trillion) valuation, joining Galbot, Galaxea AI, Spirit AI, and LinkerBot in the "¥20B-valuation club."
- CEO Wang Qian (COO at founding was Yang Qian) emphasizes that the company "focused on its own foundation model from day one of founding," pursuing a dual strategy of simultaneously open-sourcing and commercializing both hardware (the Quanta X2 cleaning robot) and its models (the WALL series).
- With the April 2026 release of WALL-B, the company introduced a "World Unified Model" architecture that trains perception, language, action, and physical prediction within a single network, unlike conventional modular VLAs. It has also begun IPO preparations, though the listing venue remains undecided.

### 2.6 Dexmal (原力灵机)

| Project | Description | Link |
|---|---|---|
| Dexbotic 2.0 | A PyTorch-based VLA development toolbox supporting reproduction and fine-tuning of major algorithms like π0 and CogACT, MIT-licensed | [GitHub](https://github.com/dexmal/dexbotic) |
| DM0 | A 2.4B-parameter "Embodied-Native" VLA, ranked #1 on the RoboChallenge Table30 benchmark | [GitHub](https://github.com/dexmal/dexbotic/blob/main/docs/DM0.md) · [arXiv](https://arxiv.org/html/2602.14974v1) |

**Latest news and strategy (2026)**
- First released Dexbotic in October 2025, and disclosed co-development with StepFun alongside the DM0 release on February 10, 2026. Active in cross-ecosystem alliances, including a strategic collaboration announced with the RLinf team on VLA + reinforcement learning research.
- DM0's core claim is an "Embodied-Native" approach — moving away from the conventional approach of post-adapting internet-pretrained models to physical tasks, and instead jointly learning driving/embodied interaction data starting from the pretraining stage. It combines a three-stage (pretraining -> mid-training -> post-training) pipeline with a Flow Matching action expert.
- A Beijing-based startup, Dexmal positions Dexbotic 2.0 as "PyTorch-grade infrastructure for embodied AI," aiming to establish itself as the standard development framework.

---

## 3. Open-Source Communities and State-Led Projects

### 3.1 OpenLoong

| Project | Description | Link |
|---|---|---|
| OpenLoong | An open-source community for humanoid robot embodied AI manipulation systems | [GitHub](https://github.com/loongOpen) |
| OpenLoong-Dyn-Control | Full-body dynamics control software based on MPC/WBC | GitHub |
| OpenLoong-Hardware | Open-source humanoid robot hardware | GitHub |

**Latest news and strategy (2026)**
- Launched in May 2024. Led by the state-owned enterprise "Humanoid Robot (Shanghai) Co., Ltd.," and directly operated by a national-level innovation center (the Shanghai Humanoid Robot Innovation Center) — this "control-tower" style open-source community differs in nature from privately-led projects.
- Xu Bin, General Manager of the innovation center, stated that "by building a common technology platform based on the open-source version of the humanoid 'Qinglong,' we aim to simultaneously achieve technological breakthroughs in core areas and large-scale commercialization." In other words, OpenLoong is less an individual company's ecosystem-expansion tool and more **the state building shared infrastructure for the entire Chinese robotics industry**.
- Analysts note that against a backdrop of 2025-2026 government/state-enterprise-led mass procurement driving robotics startups' cash flow and economies of scale, OpenLoong is serving as the technical standardization axis of that trend (supported by the statistic that roughly 87% of global humanoid shipments in 2025 were made in China).

### 3.2 OpenJiuwen

| Project | Description | Link |
|---|---|---|
| JiuwenSwarm | A multi-agent collaboration system | GitHub |
| Agent-Core | A Python SDK for LLM applications | GitHub |
| Agent-Protocol | An agent interoperability protocol SDK | GitHub |

**Note**: OpenJiuwen focuses more on the agent/SDK layer than on the robot body itself, and as of this search, international media coverage is relatively limited. Direct verification via the GitHub repository and commit history is recommended.

### 3.3 [New addition] BAAI (Beijing Academy of Artificial Intelligence) — RoboBrain 2.0

| Project | Description | Link |
|---|---|---|
| RoboBrain 2.0 | An open-source robotics model combining language-model capability with spatial reasoning; reportedly learns directly by observing human motion in Douyin (China's TikTok) videos | BAAI official |

**Latest news and strategy (2026)**
- BAAI (headed by robotics research lead Wang Zhongyuan) represents the leading academic/national-lab axis of open source, forming a hybrid academic-national-lab model distinct from the corporate axis (Ant, Alibaba, Tencent). Its approach of directly using vast quantities of human motion video available on the internet (e.g., social media dance videos) as training data has been particularly notable in coverage.

### 3.4 [New addition] Spirit AI

**Overview and strategy (2026)**: Dubbed "China's Physical Intelligence," Spirit AI puts forward a differentiated philosophy — that large-scale training on "dirty data" rather than curated data is the key to scaling VLA. It has iterated its proprietary wearable data-collection device through five generations, claiming a 90% reduction in data collection cost compared to teleoperation, and has amassed 200,000+ hours of real-world interaction data (with a target of 1 million hours within the year). Its open-sourced "Spirit v1.5," released in January 2026, is reported to have outperformed US-based Physical Intelligence's π0.5 on the global RoboChallenge leaderboard. With industrial strategic investors including CATL, Huawei, Xiaomi, and JD.com, plus state-owned funds from Chongqing and Hangzhou, it has secured shareholders spanning both upstream (components) and downstream (distribution), a structure assessed as enabling rapid accumulation of real-world deployment data.

---

## 4. Summary: The Layered Structure of China's Physical AI Open-Source Ecosystem (Updated)

| Layer | Representative Companies/Projects | Nature | Key Links |
|---|---|---|---|
| Foundation model layer | Ant (LingBot-VLA), DAMO Academy (RynnBrain), Amap (ABot-M0), Dexmal (DM0), Spirit AI (v1.5) | General-purpose VLA "brains" | lingbot-vla · RynnBrain · ABot-Manipulation |
| World model layer | Unitree (UnifoLM-WMA-0), Tencent (Hunyuan World 1.5), Ant (LingBot-World), Amap (ABot-PhysWorld) | Simulation / data-generation engines | UnifoLM-WMA-0 |
| Framework / toolchain layer | Dexmal (Dexbotic 2.0), LimX Dynamics (FluxVLA), Zhipingfang (AlphaBrain) | Standardizing dev infrastructure | FluxVLA · Dexbotic |
| Dataset layer | Galaxea (Open-World Dataset), Amap (UniACT-dataset), X Square Robot (XRZero-G0), Galaxea General (LDA-1B training set) | Large-scale real/synthetic data | X-Square-Robot |
| OS / hardware layer | OpenLoong (state-led), Unitree (UnifoLM-integrated G1), LimX Dynamics (COSA) | Robot body / OS standards | OpenLoong |
| State / academic infrastructure layer | OpenLoong (state-enterprise-led), BAAI (RoboBrain 2.0), OpenJiuwen | Industry-wide standards / policy alignment | Shanghai Humanoid Robot Innovation Center |

---

## 5. Overall Strategic Landscape Summary

1. **Tech giants (Ant, Alibaba, Tencent)**: share a two-stage strategy of fully open-sourcing models to "absorb the global developer ecosystem -> lock in one's own cloud/hardware partners." Alibaba is particularly explicit about running open-source (RynnBrain) and equity investment (X Square Robot) in parallel.
2. **Robotics hardware companies (Unitree, Galaxea, X Square Robot, LimX Dynamics)**: use open source more for building developer mindshare and supporting IPO/fundraising narratives than for revenue. This is backed by Unitree's imminent listing and the successive large fundraising rounds of X Square Robot and Galaxea.
3. **Pure AI startups (Dexmal, Spirit AI)**: compete without hardware, relying purely on models, data, and frameworks, where topping benchmark leaderboards (RoboChallenge, GM-100) functions directly as marketing and a fundraising tool.
4. **State/academic axis (OpenLoong, BAAI)**: builds shared industry-wide standards and data infrastructure independent of individual corporate competition, directly tied to government mass-procurement policy.

The structural characteristic of China's physical AI ecosystem in 2026 is that these four axes compete with each other while remaining intertwined through data, talent, and investment (e.g., LingBot-VLA validated on Galaxea and AgileX hardware, Alibaba simultaneously holding stakes in both RynnBrain and X Square Robot).

---

## 6. Key Sources

- RoboHorizon, "Ant Group Fully Unveils Robot AI Full Stack," 2026-01-29
- Robot Newspaper (Korea), "Orbbec-Robbyant, LingBot-Depth Release," 2026-01-30
- BusinessWire/FinancialContent, "Robbyant Open-Sources LingBot-World," 2026-01-29
- Las Vegas Sun/BusinessWire, "Robbyant Unveils LingBot-Map," 2026-04-16
- MarkTechPost, "Ant Group Releases LingBot-VLA," 2026-01-29
- MS Today, "Alibaba Unveils Open-Source Robot AI 'RynnBrain'," 2026-02-11
- Robot Newspaper (Korea), "China's Alibaba Releases Open-Source Robot AI Model 'RynnBrain'," 2026-02-11
- GitHub, alibaba-damo-academy/RynnBrain
- AI Times, "Alibaba Enters 'Physical AI' With Open-Source Robot Model Launch," 2026-02-11
- CIP Lawyer / Futubull, "Tencent Hunyuan World Model 1.5 Officially Launched," 2025-12-16~17
- arXiv 2602.11236, "ABot-M0: VLA Foundation Model for Robotic Manipulation with Action Manifold Learning"
- arXiv 2603.23376, "ABot-PhysWorld"
- arXiv 2602.11598, "ABot-N0"
- Gasgoo, "Unitree Robotics IPO Reaches Key Milestone," 2026-03-23
- Yicai, "China's Unitree Open-Sources World Model to Advance Robotics Ecosystem," 2025-09-16
- Global Economic (Korea), "Unitree Listing Approved... Valuation Nears ¥9.5T KRW-Equivalent," 2026-07
- OhmyNews, "China's Three-Way Robot War Heats Up," 2026-04-30
- GitHub, OpenGalaxea/GalaxeaVLA
- Robot Newspaper (Korea), "The 2026 Robot Data War Has Already Begun," 2026-01-26
- WowTale, "From Robot Brains to Autonomous Driving Chips: 4 Chinese Startups to Watch in February," 2026-03-16
- LimX Dynamics official news center / GitHub (limxdynamics/FluxVLA)
- RobotsAsia, "LimX Dynamics: Humanoid Robots, Oli & TRON Platforms"
- Cryptopolitan, "Alibaba Backs Robotics Firm X Square With $100M Investment," 2025-09-08
- Robot Newspaper (Korea), "China's Humanoid Startup X Square Robot Surpasses $2.8B Valuation"
- GitHub, dexmal/dexbotic · Pandaily, "Dexmal Unveils DM0," 2026-02-10
- iting.co.kr, "China Cultivating the Humanoid Robot Industry in 2025," 2025-03-07 (OpenLoong overview)
- Robot Newspaper (Korea), "[Feature] A Glimpse Into the Future of Robotics Powerhouse China (3)," 2025-09-17 (OpenLoong / Shanghai Innovation Center)
- GQ Korea, "The First Robots to Coexist With Humans Start in China," 2026-04-15 (BAAI RoboBrain 2.0)
- inuglr.com, "China's State-Led AI Robotics Policy: Data Acquisition and Open-Source Standardization," 2026-03-13

*Note: cross-verification material for some projects (Zhipingfang/AlphaBrain, OpenJiuwen) is relatively limited in international media and English-language GitHub, so re-confirming the latest developments via official company/community channels is recommended.*
