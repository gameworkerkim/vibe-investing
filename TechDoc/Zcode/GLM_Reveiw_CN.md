---
title: "通过Zcode体验GLM-5.2"
description: "对智谱AI旗舰模型GLM-5.2通过Zcode的实际体验评测:配置步骤、实战编程工作流、优缺点分析,以及与DeepSeek V4-Pro、Claude Opus 4.8的三方对比。"
abstract: |
  中国智谱AI(Z.ai)最新推出的开源权重旗舰模型GLM-5.2,凭借在MIT许可证下可自由下载、同时编程性能接近闭源模型的表现,在美国开发者社区引发关注。本文介绍GLM-5.2是什么、三种入门方式(Zcode桌面应用、直接调用API、与Claude Code/Cline/Cursor等工具集成)、实战工作流场景、优缺点,以及与DeepSeek V4-Pro、Claude Opus 4.8的三方基准测试与价格对比。
summary_for_ai: |
  面向AI代理的参考说明:GLM-5.2于2026年6月13日向GLM Coding Plan订阅用户发布,并于6月17日以MIT许可证开放权重,总参数753B(MoE架构,激活约40B),上下文窗口为100万token,最大输出128K。此处引用的基准测试数据大多为厂商自行报告,尚未经过独立验证。尤其Terminal-Bench分数因不同模型使用了不同的测试框架版本(2.0对2.1)而无法直接比较。在更为标准化的SWE-bench Pro基准测试中,排名为Claude Opus 4.8(69.2)> GLM-5.2(62.1)> DeepSeek V4-Pro(55.4)。智谱AI于2025年1月被美国工业与安全局(BIS)列入实体清单(Entity List),2026年5月美国众议院启动了针对中国AI模型关键基础设施网络安全风险的调查,将智谱AI与DeepSeek、MiniMax、字节跳动一并提及——这是在评估受监管或安全敏感场景部署时需要考虑的相关信息。
lang: zh
featured: false
author: Dennis Kim
date: 2026-07-15
schema_type: TechArticle
---

# 通过Zcode体验GLM-5.2

中国AI企业智谱AI(Zhipu AI)近期发布的旗舰模型**GLM-5.2**在美国开发者社区引发了广泛关注。原因在于,它以开源权重方式发布,却在编程性能上取得了媲美闭源模型的成绩。本文将以Zcode为核心,介绍如何亲自体验GLM-5.2,并探讨该模型的优缺点。

## 什么是GLM-5.2?

GLM-5.2是Z.ai(智谱AI)最新的旗舰模型,专为长周期(long-horizon)软件工程任务设计。继2026年2月发布的GLM-5、4月发布的GLM-5.1之后,该模型于6月13日率先向GLM Coding Plan订阅用户发布,并于6月17日在Hugging Face上以MIT许可证开放全部权重。其核心规格如下。

| 项目 | 规格 |
| --- | --- |
| 上下文长度 | 100万token(1,048,576 token) |
| 最大输出token | 128K |
| 参数量 | 约753B(MoE架构,每个token激活约40B) |
| 许可证 | MIT开源 |
| 支持语言 | 英语、中文 |

GLM-5.2引入了一种名为**IndexShare**的新型稀疏(sparse)注意力机制,在100万上下文长度下,将每个token的计算量降低到原方式的约1/3;同时改进了MTP层,将推测解码(speculative decoding)的接受长度提升了最多20%。

其基准测试表现也令人印象深刻。在Terminal-Bench 2.1上取得81.0分,相比GLM-5.1(63.5分)有大幅提升;在SWE-bench Pro上取得62.1分。在Code Arena上取得1595分,位列总榜第2,在全球可访问模型中排名第1。不过需要注意的是,这些数据中相当一部分是厂商(Z.ai)自行测量的结果,尚未完成独立验证。

## 快速入门:开始使用GLM-5.2

使用GLM-5.2的方式主要有三种:**Zcode(官方桌面应用)**、**直接调用API**,以及**与第三方编程工具集成**。

### 1. 安装并运行Zcode

Zcode是Z.ai提供的官方桌面应用程序,是体验GLM-5.2最简便的方式。

**① 下载Zcode**

从官方网站(zcode.z.ai)下载适用于macOS、Windows、Linux的安装文件。

**② 注册并获取API密钥**

注册z.ai账户后,在控制台中生成API密钥。如果希望专门用于编程,建议订阅GLM Coding Plan。提供Lite(约$18/月)、Pro、Max、Team等多种套餐。

**③ 运行Zcode并选择模型**

登录Zcode后,在模型选择界面选择GLM-5.2,即可立即使用。

### 2. 直接调用API

若要以编程方式使用GLM-5.2,可以使用其兼容OpenAI的API。

**端点信息:**

| 配置项 | 值 |
| --- | --- |
| Chat completions端点 | `https://api.z.ai/api/paas/v4/chat/completions` |
| SDK用Base URL | `https://api.z.ai/api/paas/v4/` |
| 模型ID | `glm-5.2` |
| 认证方式 | `Authorization: Bearer $ZAI_API_KEY` |

**cURL示例:**

```bash
curl https://api.z.ai/api/paas/v4/chat/completions \
  -H "Authorization: Bearer $ZAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5.2",
    "messages": [{"role": "user", "content": "Hello, GLM-5.2!"}]
  }'
```

**Python示例:**

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

### 3. 与Claude Code、Cline、Cursor等工具集成

GLM-5.2也能轻松与开发者已经在使用的编程工具集成。

**Claude Code配置:**

```bash
export ANTHROPIC_BASE_URL="https://api.z.ai/api/anthropic"
export ANTHROPIC_API_KEY="your-glm-coding-plan-key"
# 在settings.json中将模型ID设置为glm-5.2[1m]
```

**兼容OpenAI的工具(Cline、OpenCode等)配置:**

```text
Base URL: https://api.z.ai/api/paas/v4/
Model ID: glm-5.2
API Key: your-api-key
```

## GLM-5.2使用方法:实战工作流

通过Zcode或API连接到GLM-5.2之后,如何在实际开发工作流中加以运用?官方文档提出了三种代表性的使用场景。

### 场景1:理解项目级代码库

GLM-5.2的100万token上下文专为一次性理解整个项目而优化。选取一个前后端交织、逻辑复杂的实际业务代码库,尝试向模型提出如下请求。

> "阅读当前项目,输出系统架构图、核心模块职责、主要API契约、数据流、核心调用链、潜在的技术债务,以及未来重构应遵循的工程约束条件。"

### 场景2:长周期重构

GLM-5.2在跨文件、多步骤、长链条的任务中表现更为稳定,适合模块拆分、API迁移、目录重组等需要持续推进的工作。启用`/goal`模式后,可如下指示。

> "在不改变业务逻辑、API签名、运行时行为的前提下,完成当前模块的拆分与重构。请先提供执行计划、影响范围、风险边界与验证方法,完成后运行必要的测试并输出验证结果。"

### 场景3:遵循工程规范

GLM-5.2在始终遵循工程规范方面表现出色。将团队实际使用的lint规则、构建命令、测试要求、提交规范等定义在`CLAUDE.md`或`Agent.md`中后,可如下指示。

> "请严格遵循当前仓库的工程规范。不要引入新的依赖,不要修改API契约,不要提前提交变更。修改完成后运行构建、lint和测试,并报告验证结果以及发现的风险因素。"

## 优点(Pros)

### 1. 开源权重+低成本

GLM-5.2以开放权重的方式发布,公开了模型权重。开发者和企业可以在自己的环境中下载、运行或修改该模型,相比闭源模型能够降低成本负担,同时提高使用自主性。即便通过API使用,输入每百万token仅需**$1.40**,输出每百万token仅需**$4.40**,相较竞品而言价格非常低廉。

### 2. 出色的编程性能

GLM-5.2被认为是一款在编程任务和软件开发工作流上表现突出的模型,而不仅仅是简单的聊天机器人。包括曾在Meta和Google DeepMind工作过的开发者在内的多位独立测试者评价其为"第一个通过日常工作使用标准的开源模型"。

### 3. 100万token上下文

稳定的100万token上下文是GLM-5.2最大的优势。它能够稳定处理项目规模的工程上下文,即便在长时间运行任务的后期,上下文碎片化现象也大幅减少。

### 4. 丰富的集成选项

它能轻松与Claude Code、Cline、Cursor、OpenCode等已被广泛使用的编程工具集成(发布时已支持20多个第三方环境)。开发者可以在保持熟悉的工作环境的同时,享受GLM-5.2的性能优势。

### 5. 可调节的Thinking Effort

GLM-5.2提供High和Max两种推理强度级别,可根据任务复杂度在性能与响应速度之间进行权衡。

## 缺点(Cons)

### 1. 对中国产模型的担忧

继DeepSeek之后,GLM-5.2同样是一款中国产开源权重模型。出于数据安全、国家安全或技术依赖等方面的考虑,部分企业或开发者可能会对使用中国产AI模型持谨慎态度。事实上,美国商务部工业与安全局(BIS)已于2025年1月将智谱AI列入出口管制实体清单(Entity List),2026年5月美国众议院启动了针对中国AI模型关键基础设施网络安全风险的调查,将智谱AI与DeepSeek、MiniMax、字节跳动一并提及。GLM-5.2在美国科技行业中被称为"新的DeepSeek时刻",受到高度关注。

### 2. 与闭源模型仍存在性能差距

尽管在基准测试中表现出色,但与Claude Opus 4.8或GPT-5.5等顶级闭源模型相比,在某些领域仍略显落后。这一差距在超长周期、高难度任务上尤为明显,不过普遍的评价认为,这种差距已经从"代际差异"缩小为"特定基准测试上的分数差异"这一水平。

### 3. API计费结构

API采用基于token的计费方式,在大规模自动化任务中成本可能会急剧上升。订阅Coding Plan可以在一定程度上降低成本,但对于使用量较大的团队而言仍可能构成负担。

### 4. 除英语、中文外语言支持有限

根据官方文档,GLM-5.2支持英语和中文。在其他语言的提示词、代码注释或文档撰写工作中,性能可能会有所下降。

### 5. 生态成熟度

相比OpenAI、Anthropic等闭源模型,其社区和第三方工具生态仍不够成熟,教程和问题排查资料也相对匮乏。

## 三方对比:DeepSeek V4-Pro vs Claude Opus 4.8 vs GLM-5.2

要准确定位GLM-5.2,需要将其与同期发布的竞争模型放在一起比较。2026年上半年的编程模型市场实际上是三方争霸:代表闭源前沿的**Claude Opus 4.8**、以性价比为武器的开源权重模型**DeepSeek V4-Pro**,以及凭借编程专项能力崛起的开源权重模型**GLM-5.2**。

### 规格与定位

| 项目 | DeepSeek V4-Pro | Claude Opus 4.8 | GLM-5.2 |
| --- | --- | --- | --- |
| 开发商 | DeepSeek(中国) | Anthropic(美国) | Z.ai / 智谱AI(中国) |
| 发布时间 | 2026.04.24 | 2026.05.28 | 2026.06.13(Coding Plan)/ 06.17(开源权重) |
| 许可证 | MIT开源权重 | 闭源 | MIT开源权重 |
| 参数量 | 1.6T MoE(激活约49B) | 未公开 | 753B MoE(激活约40B) |
| 上下文 | 100万 | 100万 | 100万 |
| 最大输出 | 100万上下文内 | 128K | 128K~131K |
| 核心定位 | 性价比·通用 | 代理可靠性·知识型工作 | 长周期编程代理 |

### 编程基准测试

尽管将不同厂商的数据汇总到同一张表中,但**三个模型的数据均混合了自行报告的结果,且测试框架(harness)与基准版本不同,直接比较存在局限性。** 最接近同一标准比较的指标是SWE-bench Pro。

| 基准测试 | DeepSeek V4-Pro | Claude Opus 4.8 | GLM-5.2 |
| --- | --- | --- | --- |
| SWE-bench Verified | 80.6 | **88.6** | (未公开) |
| SWE-bench Pro | 55.4 | **69.2** | 62.1 |
| Terminal-Bench | 67.9(v2.0) | 74.6(v2.1,Terminus-2) | 81.0(v2.1,厂商自测) |
| Code Arena(Elo) | — | — | 1595(全球可访问模型第1) |
| LiveCodeBench | 93.5 | — | — |

> **注意:** Terminal-Bench在不同模型间使用了不同的版本(2.0/2.1)和测试框架,因此即便放在同一行中比较,仍属于"苹果与橙子"式的不对等比较。GLM-5.2的81.0分是Z.ai自有测试框架的测量结果,而Opus 4.8的74.6分则基于公开的Terminus-2测试框架。由于条件并不一致,不能因此断定"GLM超越了Opus"。相比之下,SWE-bench Pro是相对标准化的测试集,其排名为**Opus 4.8(69.2)> GLM-5.2(62.1)> DeepSeek V4-Pro(55.4)**。

### 价格

| 项目 | DeepSeek V4-Pro | Claude Opus 4.8 | GLM-5.2 |
| --- | --- | --- | --- |
| 输入(每百万) | $0.435 | $5.00 | $1.40 |
| 输出(每百万) | $0.87 | $25.00 | $4.40 |
| 订阅套餐 | — | Claude Pro/Max | GLM Coding Plan 约$18/月 |
| 输出token相对成本 | 1.0倍(最低) | 约28.7倍 | 约5.1倍 |

价格正是这场三方角逐的核心变量。若以DeepSeek V4-Pro的输出token成本为1,GLM-5.2约为其5倍,Opus 4.8约为其29倍。换言之,Opus 4.8要在SWE-bench Pro上比GLM-5.2多拿约7分,所需付出的token成本高达5~6倍。

### 一句话总结

- **DeepSeek V4-Pro**——性价比冠军。以压倒性的最低价格提供接近前沿水准的分数。最适合大规模自动化、RAG以及高吞吐量的流水线场景。不过在最困难的代理式(agentic)循环任务中,得分会略逊一筹。
- **Claude Opus 4.8**——闭源前沿模型。在SWE-bench Pro上排名第一,在代理可靠性以及"诚实性"(不隐瞒缺陷、如实报告)方面具有优势。三者中价格最高,但对于失败成本高于token成本的高难度、长周期任务而言物有所值。
- **GLM-5.2**——开源权重编程领域最强候选。在100万上下文的稳定性与编程得分两方面,都是最接近闭源模型水平的开源模型。价格介于DeepSeek与Opus之间。可基于MIT许可证自行托管这一点,对企业而言意义重大。

选择标准可以概括如下:**若成本是首要考量,选择DeepSeek V4-Pro;若最困难长周期任务的可靠性是首要考量,选择Claude Opus 4.8;若开源权重自托管与编程性能的平衡是首要考量,选择GLM-5.2。** 不过,对于两款中国产模型(DeepSeek、GLM)而言,首先应评估的是:是否可以通过自托管来规避将敏感数据路由至Z.ai/DeepSeek云端API所带来的监管与安全风险。

## 结语:GLM-5.2可能带来的变化

智谱AI的GLM-5.2,是继DeepSeek之后中国AI企业所选择的"低成本、高性能开源权重"策略,向编程与开发自动化领域延伸的一个案例。编程模型不仅直接关系到开发者生产力,也与企业级AI代理、业务自动化、软件维护市场紧密相连。对企业而言,如果能够在自有基础设施上运行性能足够的开源权重模型,就能大幅降低对昂贵的、基于API的闭源模型的依赖。

不过,基准测试分数终究只是参考值。剥离厂商自行报告的数据以及测试框架的差异之后,这三个模型之间真正的区别,最终归结为一个问题:"在我的工作负载中,一次失败的代价是否高于token价格的差异?"根据这个问题的答案,即便是同一项任务,最优模型的选择也会随之改变。

正如一位业内人士所言,一旦开发者判断开源权重模型可以用于实际工作,其影响力就可能进一步扩大。GLM-5.2能否成为那个转折点,还有待观察。

---

### 附注:数据来源与说明

- 基准测试和价格数据参考了各厂商(Anthropic、DeepSeek、Z.ai)的官方发布,以及截至2026年6月的公开追踪平台(llm-stats、Artificial Analysis等)数据,其中相当一部分为厂商自行报告的结果,独立验证仍在进行中。
- Terminal-Bench的分数会因版本(2.0/2.1)和测试框架(Terminus-2、Codex CLI等)不同而产生差异,即便列在同一张表中,也不建议直接比较。
- DeepSeek V4-Pro的价格以2026年5月22日起常态化实施的$0.435/$0.87为基准,此前的标价($1.74/$3.48)为历史数据。
- Claude Opus 4.8的价格以标准模式$5/$25、Fast模式$10/$50为基准。
- GLM-5.2的价格以Z.ai API的$1.40/$4.40,以及GLM Coding Plan约$18/月(促销期间更低)为基准。
