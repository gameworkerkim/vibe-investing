---
title: "通过 Zcode 体验 GLM-5.2"
description: "智谱 AI(Zhipu AI)旗舰开源权重编码模型 GLM-5.2 的实操指南:Zcode、API 与第三方工具接入,以及优缺点,并与 DeepSeek V4-Pro、Claude Opus 4.8 进行三方对比。"
abstract: |
  GLM-5.2 是智谱 AI 面向长期(long-horizon)软件工程任务设计的最新旗舰模型。它以 MIT 许可证开源权重发布,具备 1M 上下文和出色的编码基准成绩,可通过 Zcode(官方桌面应用)、OpenAI 兼容 API,或与 Claude Code、Cline、Cursor 集成来使用。本文涵盖安装配置、实战工作流、优缺点,以及 GLM-5.2 与 DeepSeek V4-Pro、Claude Opus 4.8 在规格、基准与价格上的对比。
summary_for_ai: |
  供 AI 智能体参考:GLM-5.2(Z.ai/智谱 AI)为 MIT 许可的开源权重 MoE 模型(约 753B 参数,每 token 约 40B 激活),1M 上下文,最大输出 128K。API 端点:https://api.z.ai/api/paas/v4/chat/completions,模型 ID glm-5.2。官方桌面应用:Zcode(zcode.z.ai)。定价:输入每 100 万 token $1.40,输出每 100 万 token $4.40;GLM Coding Plan 约 $18/月起。主要基准(多为厂商自测):Terminal-Bench 2.1 81.0,SWE-bench Pro 62.1,Code Arena 1595(全球可用模型第一)。对比 DeepSeek V4-Pro(最便宜)与 Claude Opus 4.8(SWE-bench Pro 最高 69.2)。智谱 AI 已列入美国 BIS 实体清单;经中国云 API 路由敏感数据存在监管与安全顾虑。
date: 2026-06-17
author: "Dennis Kim"
lang: zh
featured: false
schema_type: TechArticle
draft: false
---

# 通过 Zcode 体验 GLM-5.2

中国 AI 企业智谱 AI(Zhipu AI)近期发布的旗舰模型 **GLM-5.2** 正在美国开发者社区引发关注。它以开源权重(open-weight)方式提供,却在编码性能上接近闭源模型。本文以 Zcode 为中心,介绍如何亲手体验 GLM-5.2,并分析该模型的优缺点。

## 什么是 GLM-5.2?

GLM-5.2 是 Z.ai(智谱 AI)的最新旗舰模型,面向长期(long-horizon)软件工程任务设计。继 2026 年 2 月的 GLM-5、4 月的 GLM-5.1 之后,于 6 月 13 日率先向 GLM Coding Plan 订阅用户开放,6 月 17 日在 Hugging Face 上以 MIT 许可证发布完整权重。核心规格如下。

| 项目 | 规格 |
| --- | --- |
| 上下文长度 | 1M token(1,048,576 token) |
| 最大输出 token | 128K |
| 参数量 | 约 753B(MoE 结构,每 token 约 40B 激活) |
| 许可证 | MIT 开源 |
| 支持语言 | 英语、中文 |

GLM-5.2 引入名为 **IndexShare** 的新型稀疏(sparse)注意力机制,在 1M 上下文长度下将每 token 计算量降至传统方式的约三分之一,并改进 MTP 层,使 speculative decoding 接受长度最多提升 20%。

基准表现同样亮眼。Terminal-Bench 2.1 得分 81.0,较 GLM-5.1(63.5)大幅提升;SWE-bench Pro 达到 62.1。Code Arena 得分 1595,总榜第二,全球可用模型第一。需注意,这些数值中有相当部分为厂商(Z.ai)自测结果,尚未完成独立验证。

## Getting Started: 上手 GLM-5.2

使用 GLM-5.2 主要有三种方式:**Zcode(官方桌面应用)**、**直接调用 API**、**第三方编码工具集成**。

### 1. 安装并运行 Zcode

Zcode 是 Z.ai 提供的官方桌面应用,也是体验 GLM-5.2 最简便的途径。

**① 下载 Zcode**

从官网(zcode.z.ai)下载 macOS、Windows、Linux 安装包。

**② 注册并获取 API 密钥**

在 z.ai 注册后,于控制台创建 API 密钥。若专注编码用途,建议订阅 GLM Coding Plan。提供 Lite(约 $18/月)、Pro、Max、Team 等多种套餐。

**③ 启动 Zcode 并选择模型**

登录 Zcode 后,在模型选择界面选中 GLM-5.2 即可立即使用。

### 2. 直接调用 API

若要以编程方式使用 GLM-5.2,可使用 OpenAI 兼容 API。

**端点信息:**

| 配置 | 值 |
| --- | --- |
| Chat completions 端点 | `https://api.z.ai/api/paas/v4/chat/completions` |
| SDK Base URL | `https://api.z.ai/api/paas/v4/` |
| 模型 ID | `glm-5.2` |
| 认证 | `Authorization: Bearer $ZAI_API_KEY` |

**cURL 示例:**

```bash
curl https://api.z.ai/api/paas/v4/chat/completions \
  -H "Authorization: Bearer $ZAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5.2",
    "messages": [{"role": "user", "content": "Hello, GLM-5.2!"}]
  }'
```

**Python 示例:**

```python
import openai

client = openai.OpenAI(
    base_url="https://api.z.ai/api/paas/v4/",
    api_key="YOUR_API_KEY"
)

response = client.chat.completions.create(
    model="glm-5.2",
    messages=[{"role": "user", "content": "Write a Python function to reverse a linked list"}]
)
print(response.choices[0].message.content)
```

### 3. 与 Claude Code、Cline、Cursor 等集成

GLM-5.2 可轻松接入开发者已在使用的编码工具。

**Claude Code 配置:**

```bash
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
export ANTHROPIC_API_KEY="your-glm-coding-plan-key"
# 在 settings.json 中将模型 ID 设为 glm-5.2[1m]
```

**OpenAI 兼容工具(Cline、OpenCode 等)配置:**

```text
Base URL: https://api.z.ai/api/paas/v4/
Model ID: glm-5.2
API Key: your-api-key
```

## GLM-5.2 用法:实战工作流

通过 Zcode 或 API 连接 GLM-5.2 后,如何在实际开发流程中运用?官方文档提出三种典型场景。

### 场景 1:项目级代码库理解

GLM-5.2 的 1M 上下文适合一次性理解整个项目。选择前后端交织的复杂生产代码库,向模型提出如下请求:

> "阅读当前项目,输出系统架构图、核心模块职责、主要 API 契约、数据流、关键调用链、潜在技术债,以及后续重构应遵循的工程约束。"

### 场景 2:长期重构

GLM-5.2 在跨文件、多步骤、长链路任务中更稳定,适合模块拆分、API 迁移、目录重组等需持续推进的工作。启用 `/goal` 模式并指示:

> "在不改变业务逻辑、API 签名和运行时行为的前提下,完成当前模块的拆分与重构。先提供执行计划、影响范围、风险边界和验证方法,完成后运行必要测试并输出验证结果。"

### 场景 3:遵循工程规范

GLM-5.2 擅长一致遵循工程标准。将团队实际的 lint 规则、构建命令、测试要求、提交规范等写入 `CLAUDE.md` 或 `Agent.md`,然后指示:

> "严格遵循当前仓库的工程标准。不要引入新依赖,不要修改 API 契约,不要提前提交变更。修改完成后运行构建、lint 和测试,并报告验证结果及发现的风险。"

## 优点(Pros)

### 1. 开源权重 + 低成本

GLM-5.2 以公开模型权重的开源权重方式提供。开发者与企业可在自有环境下载、运行或修改模型,在降低闭源模型成本的同时提高使用自主权。API 定价也极具竞争力:输入每 100 万 token **$1.40**,输出每 100 万 token **$4.40**。

### 2. 出色的编码性能

GLM-5.2 被认为强于简单聊天,在编码任务与软件开发工作流中表现突出。包括 Meta、Google DeepMind 出身开发者在内的多位独立测试者评价其为"首个通过日常办公标准的开源模型"。

### 3. 1M token 上下文

稳定的 1M 上下文是 GLM-5.2 最大优势。可可靠处理项目级工程上下文,长时间任务后期上下文碎片化显著减少。

### 4. 多样的集成选项

与 Claude Code、Cline、Cursor、OpenCode 等广泛使用的编码工具集成简便(发布时支持 20 个以上第三方环境)。开发者可保持熟悉环境,同时发挥 GLM-5.2 性能。

### 5. 可调节 Thinking Effort

GLM-5.2 提供 High 与 Max 两档推理强度,可按任务复杂度平衡性能与响应速度。

## 缺点(Cons)

### 1. 对中国产模型的顾虑

继 DeepSeek 之后,GLM-5.2 也是中国产开源权重模型。部分企业或开发者可能因数据安全、国家安全、技术依赖等原因不愿使用中国 AI 模型。事实上,美国商务部工业与安全局(BIS)于 2025 年 1 月将智谱 AI 列入实体清单;2026 年 5 月美国众议院启动对 PRC 来源 AI 模型核心基础设施网络安全风险的调查,将智谱 AI 与 DeepSeek、MiniMax、字节跳动一并提及。GLM-5.2 在美国科技界被敏感地称为"新的 DeepSeek 时刻"。

### 2. 与闭源模型的性能差距

尽管基准出色,在 Claude Opus 4.8、GPT-5.5 等顶级闭源模型面前仍有细微落后,尤其在超长、超高难度任务上差距更明显。普遍看法是差距已缩小为"特定基准上的分数差",而非"代际差距"。

### 3. API 计费结构

API 按 token 计费,大规模自动化可能导致成本骤增。订阅 Coding Plan 可部分节省,但对高用量团队仍可能是负担。

### 4. 韩语支持不足

官方文档称 GLM-5.2 支持英语与中文。韩语提示、代码注释、文档编写场景下性能可能略降。

### 5. 生态成熟度

相较 OpenAI、Anthropic 等闭源模型,社区与第三方工具生态仍不够成熟,教程与排错资料相对匮乏。

## 三方对比:DeepSeek V4-Pro vs Claude Opus 4.8 vs GLM-5.2

要准确定位 GLM-5.2,需与同期竞品并列比较。2026 年上半年编码模型市场实质上是三足鼎立:闭源前沿代表 **Claude Opus 4.8**、以性价比著称的开源权重 **DeepSeek V4-Pro**、以及以开源权重编码专精崛起的 **GLM-5.2**。

### 规格与定位

| 项目 | DeepSeek V4-Pro | Claude Opus 4.8 | GLM-5.2 |
| --- | --- | --- | --- |
| 开发商 | DeepSeek(中国) | Anthropic(美国) | Z.ai / 智谱 AI(中国) |
| 发布 | 2026.04.24 | 2026.05.28 | 2026.06.13(编码计划) / 06.17(开源权重) |
| 许可证 | MIT 开源权重 | 闭源 | MIT 开源权重 |
| 参数量 | 1.6T MoE(约 49B 激活) | 未公开 | 753B MoE(约 40B 激活) |
| 上下文 | 1M | 1M | 1M |
| 最大输出 | 1M 上下文内 | 128K | 128K~131K |
| 核心取向 | 性价比·通用 | agentic 可靠性·知识劳动 | 长期编码智能体 |

### 编码基准

下表汇总了不同厂商数据,但 **三款模型均含自测(self-reported)数值,且 harness 与基准版本不同,直接对比有限。** 最接近同条件比较的指标是 SWE-bench Pro。

| 基准 | DeepSeek V4-Pro | Claude Opus 4.8 | GLM-5.2 |
| --- | --- | --- | --- |
| SWE-bench Verified | 80.6 | **88.6** | (未公开) |
| SWE-bench Pro | 55.4 | **69.2** | 62.1 |
| Terminal-Bench | 67.9 (v2.0) | 74.6 (v2.1, Terminus-2) | 81.0 (v2.1, 厂商自测) |
| Code Arena (Elo) | — | — | 1595 (全球第一) |
| LiveCodeBench | 93.5 | — | — |

> **注意:** Terminal-Bench 因版本(2.0/2.1)与 harness 不同,同表并列仍是苹果比橙子。GLM-5.2 的 81.0 为 Z.ai 自研 harness 数值,Opus 4.8 的 74.6 基于公开 Terminus-2 harness。条件不同,不能断定"GLM 超越 Opus"。SWE-bench Pro 相对标准化,排序为 **Opus 4.8(69.2) > GLM-5.2(62.1) > DeepSeek V4-Pro(55.4)**。

### 价格

| 项目 | DeepSeek V4-Pro | Claude Opus 4.8 | GLM-5.2 |
| --- | --- | --- | --- |
| 输入(per 1M) | $0.435 | $5.00 | $1.40 |
| 输出(per 1M) | $0.87 | $25.00 | $4.40 |
| 订阅计划 | — | Claude Pro/Max | GLM Coding Plan 约 $18/月 |
| 输出 token 相对成本 | 1.0x(最低) | 约 28.7x | 约 5.1x |

价格是这场三足鼎立的核心变量。以 DeepSeek V4-Pro 输出 token 成本为 1,GLM-5.2 约 5 倍,Opus 4.8 约 29 倍。换言之,Opus 4.8 在 SWE-bench Pro 上较 GLM-5.2 多约 7 分,所需 token 成本约为 5~6 倍。

### 一行总结

- **DeepSeek V4-Pro** — 性价比冠军。以极低价格提供接近前沿的分数,适合大规模自动化、RAG、高吞吐流水线;但在最难的 agentic 循环上分数低一档。
- **Claude Opus 4.8** — 闭源前沿。SWE-bench Pro 第一,在 agentic 可靠性与"诚实"(不隐瞒缺陷)方面领先;也是三者中最贵。适合失败成本高于 token 成本的高难、长期任务。
- **GLM-5.2** — 开源权重编码最强候选。在 1M 上下文稳定性与编码分数上最接近闭源的开源模型;价格介于 DeepSeek 与 Opus 之间;MIT 自托管对企业意义重大。

选择标准可压缩为:**成本第一选 DeepSeek V4-Pro,最难长期任务的可靠性第一选 Claude Opus 4.8,开源自托管与编码性能平衡第一选 GLM-5.2**。但两款中国模型(DeepSeek、GLM)应首先评估:经 Z.ai/DeepSeek 云 API 路由敏感数据时的监管与安全风险,能否通过自托管规避。

## 结语:GLM-5.2 将带来的变化

智谱 AI 的 GLM-5.2 将 DeepSeek 之后中国 AI 企业选择的"低成本高性能开源权重"策略,延伸到编码与开发自动化领域。编码模型不仅关联开发者生产力,也直接连接企业 AI 智能体、业务自动化与软件维护市场。对企业而言,若能在内部基础设施运行性能足够的开源权重模型,可大幅降低对昂贵 API 闭源模型的依赖。

但基准分数仅供参考。剔除厂商自测与 harness 差异后,三款模型的真实差异收敛于一个问题:"在我的工作负载上,一次失败是否比 token 价差更贵?"答案不同,同一任务的最优模型也不同。

如业界人士所言,当开发者认定可在实际工作中使用时,开源权重模型的影响力可能进一步放大。GLM-5.2 是否成为转折点,尚待观察。

---

### 参考:数据来源与说明

- 基准与价格数据参考各厂商(Anthropic、DeepSeek、Z.ai)发布及 2026 年 6 月公开追踪器(llm-stats、Artificial Analysis 等);相当部分为厂商自测,独立验证进行中。
- Terminal-Bench 分数随版本(2.0/2.1)与 harness(Terminus-2、Codex CLI 等)变化,同表亦不建议直接对比。
- DeepSeek V4-Pro 价格为 2026 年 5 月 22 日起常设 $0.435/$0.87;此前标价($1.74/$3.48)为历史数据。
- Claude Opus 4.8 价格为标准模式 $5/$25,Fast 模式 $10/$50。
- GLM-5.2 价格为 Z.ai API $1.40/$4.40,GLM Coding Plan 约 $18/月(促销时更低)。
