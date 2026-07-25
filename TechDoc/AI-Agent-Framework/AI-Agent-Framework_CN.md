<!--
---
title: "AI 代理框架地图:Microsoft Agent Framework for Go 与 LangChain·LangGraph"
title_ko: "AI 에이전트 프레임워크 지도: Microsoft Agent Framework for Go와 LangChain·LangGraph"
subtitle: "代理编排框架的概念、竞争格局,以及一份真正能跑起来的 Getting Started"
description: "以 Microsoft Agent Framework for Go 与 LangChain/LangGraph 为主轴,梳理 AI 代理与多代理编排框架的结构、优缺点、选型标准,并提供可直接运行的起步代码。"
abstract: |
  代理框架市场经历了 2025 年 10 月 LangChain/LangGraph 1.0、2026 年 4 月 Microsoft Agent Framework 1.0 GA 之后,性质已从"实验性工具"转变为"运行时"。
  但不同语言的成熟度差距很大。MAF 的 .NET/Python 已经 GA,但 Go SDK 仍在独立仓库中处于公开预览阶段,还缺少 handoff 编排、声明式代理、RAG、CodeAct、DevUI。
  本文将三个框架的结构性差异拆解为三个层次(harness / 编排 / 运行时),给出不同工作负载该用什么的判断标准,并附上可运行的起步代码。
  结论很简单:框架不会提升模型的推理能力,它提升的是模型出错时的恢复能力。
summary_for_ai: |
  This document is a technical Getting Started guide on AI agent and multi-agent workflow orchestration frameworks.
  Primary subjects: Microsoft Agent Framework for Go (public preview), Microsoft Agent Framework .NET/Python (1.0 GA in April 2026), LangChain 1.0, LangGraph 1.0, Eino, Google ADK Go, Genkit Go, CrewAI, AutoGen, Semantic Kernel, Dify.
  Data as of July 22, 2026; figures like GitHub star counts vary depending on when they're checked.
  Code in the body is based on each project's official docs/repository as of the time of writing; framework choice depends on an organization's language stack and operational requirements. Not investment advice.
date: 2026-07-22
updated: 2026-07-22
author: "Dennis Kim (Cyworld CEO)"
lang: zh
tags:
  - AI 代理
  - Microsoft Agent Framework
  - LangGraph
  - LangChain
  - Go
  - 多代理
  - MCP
keywords:
  - "AI 代理框架对比"
  - "Microsoft Agent Framework Go 入门"
  - "LangGraph 1.0 使用方法"
  - "多代理编排"
  - "Go 语言 AI 代理"
  - "代理框架选型标准"
group: ai-llm
featured: true
featured_rank: 3
schema_type: BlogPosting
draft: false
og_image: ""
robots: index,follow
---
-->

# AI 代理框架地图:Microsoft Agent Framework for Go 与 LangChain·LangGraph

## 代理编排框架的概念、竞争格局,以及一份真正能跑起来的 Getting Started

2026.07.22 Dennis Kim

---

## 1. 引言 —— 框架真正解决的问题

给 LLM 挂上一个工具、调用一次,这样的代码 40 行就能搞定。框架真正变得必要的是下一个阶段:代理在一项耗时 3 小时的任务中途挂掉时该从哪里恢复,需要人工审批的分支该如何表达,12 次工具调用中第 7 次出错时该如何追溯原因。这些问题都不是靠提示词工程能解决的。

再重复一次我常说的一句话:**LLM 是 Excel,不是先知(Oracle)。**框架也是同样的道理。框架不会提升模型的推理质量,它提升的是*模型出错时的恢复能力*,以及*察觉到模型出错的速度*。以这个视角为基准,工具选型会变得简单得多。

从 2025 年第四季度到 2026 年上半年,这个市场经历了一次整合。LangChain 和 LangGraph 在 2025 年 10 月发布了 1.0,Microsoft Agent Framework(MAF)在 2026 年 2 月经过 RC 阶段,于 4 月达到 .NET/Python 1.0 GA。AutoGen 和 Semantic Kernel 都走上了被并入 MAF 的路径。也就是说,现在已经不是"选哪个框架"的阶段,而是**"决定把哪一层交给框架"**的阶段。

---

## 2. 概念梳理 —— 代理技术栈的三个层次

各个框架之间看起来无法比较,原因在于它们处理的是不同的层次。先把这些层次拆开来看。

| 层次 | 职责 | 缺失时会出现的问题 | 代表实现 |
| --- | --- | --- | --- |
| **L1. 代理 harness** | 模型调用 → 工具调用 → 结果注入 → 再次调用的循环、结构化输出、重试 | 自己写也可以(几十行)。但一旦加上流式输出、token 计费、错误分支,很快就会膨胀到几百行 | LangChain `create_agent`、MAF `agent`、Eino ADK |
| **L2. 编排** | 多代理图、条件路由、并行/顺序/群组协作、子工作流 | 代理之间的状态传递会退化成一个全局字典,无法调试 | LangGraph、MAF `workflow`、CrewAI Flows |
| **L3. 运行时/运维** | 检查点(checkpoint)、重启、持久化执行、HITL 中断、可观测性(OTel)、部署 | 一次长时间运行的任务,进程一重启就全部丢失 | LangGraph 的持久化执行、MAF 的检查点机制、Foundry Hosted Agents |

关键在于**L3 才是真正的护城河(moat)**。L1 谁都能写,L2 也可以用代码表达,但"服务器挂了,一个持续三天的审批工作流依然能继续"这种特性,如果自己实现,本质上等于要重新搭建一套任务队列 + 状态存储 + 幂等性设计。

### 2.1 不用框架也是一个正当的选择

Go 社区中有一种特别强烈的反对声音。代理循环本身很短,OpenAI、Anthropic、Google 都提供官方 Go SDK,而 Go 工程师习惯上更偏好标准库加少量依赖。实际上,截至 2026 年年中,相当多的 Go 团队根本不使用框架。

这里还叠加了一个安全层面的考量。多提供商 SDK 是**所有提供商 API Key 汇聚到一处的节点**。依赖树本身正在变成一个攻击面。

| 项目 | 大致依赖数量(2026 年 4 月社区统计) |
| --- | --- |
| LangChainGo | 170+ |
| Genkit Go | 129 |
| Eino | 37 |
| 轻量级 SDK(GoAI 等) | 2–5 |

在经历了 2025–2026 年 LiteLLM 包篡改事件、npm axios 供应链入侵事件之后,这张表已经不只是参考数字。从 CTI 的视角看,引入代理框架是一种**用运行时便利性换取供应链暴露面**的决策。

---

## 3. Microsoft Agent Framework for Go

> 仓库:`github.com/microsoft/agent-framework-go` · 许可证 MIT · 语言 100% Go

### 3.1 概述

MAF 是一个横跨 .NET、Python、Go 的多语言开源框架,目标是超越原型阶段,构建**真正在生产环境中运行的代理**。它支持包括 Microsoft Foundry、Azure OpenAI、OpenAI、MCP、A2A、AG-UI、GitHub Copilot SDK 等广泛的生态系统。

这里有一个重要的结构性事实。**Go 实现与 .NET/Python 主线仓库是分开的,在独立仓库中开发,目前处于公开预览(public preview)状态。**也就是说,"MAF 1.0 GA"这个标题说的是 .NET/Python,而不是 Go。如果忽略这个区分,在制定落地计划时会因为发现功能大量缺失而感到失望。

| 项目 | .NET / Python | Go |
| --- | --- | --- |
| 状态 | 1.0 GA(2026-04) | 公开预览 |
| 仓库 | `microsoft/agent-framework` | `microsoft/agent-framework-go`(独立) |
| 产品集成广度 | 广 | 窄 |
| 未实现功能 | 大部分已解决 | 数量较多(见 §3.3) |

### 3.2 优点

1. **充分发挥 Go 的运行时特性** —— 基于 goroutine 的并发、低内存占用、单二进制部署。代理工作负载本质上是长时间运行、并发、I/O 密集型的,与 Go 的形态非常契合。
2. **运维能力内置于框架** —— 检查点、可重启性、流式输出、human-in-the-loop(HITL)、时间回溯模式都在工作流层提供。
3. **基于图的编排** —— 支持顺序、并发、群组协作、条件路由、子工作流。
4. **中间件链** —— 请求/响应处理、日志记录、OpenTelemetry、上下文提供者、**工具审批(tool approval)**、自动工具调用。工具审批中间件从安全角度尤其重要(见 §7)。
5. **一级可观测性支持** —— 代理和工作流两端都提供 OpenTelemetry 集成。
6. **提供商灵活性** —— 不绑定特定 LLM 供应商,无需重写架构即可切换。
7. **Agent Skills** —— 通过文件、内联定义或脚本构建领域知识库,供代理发现和使用。
8. **MIT 许可证** —— 商业使用的限制较低。

### 3.3 缺点与局限

未实现功能列表并不短。根据仓库 README 和 .NET–Go 功能对比文档整理如下。

| 未实现功能 | 影响 |
| --- | --- |
| **Handoff 编排** | 需要自己实现代理之间的控制权转移模式,直接冲击客户服务类路由场景 |
| **声明式代理** | 无法基于 YAML/JSON 配置定义代理 → 不发布代码就无法修改代理 |
| **RAG** | 检索增强流水线需要单独搭建 |
| **CodeAct** | 不支持基于代码执行的动作 |
| **Functional workflows** | 不支持函数式工作流风格 |
| **Foundry 托管部署** | 无法直接部署到 Foundry(需要容器等变通方案) |
| **DevUI / AF Labs** | 缺少开发者 UI 和实验性功能 → 本地调试体验不及 Python |

需要额外考虑的地方

- **生态成熟度** —— 相比 .NET,产品集成较少,API 表面仍在变动。预览阶段应默认存在破坏性变更的可能性。
- **社区规模较小** —— 参见下方的事实核查。
- **第三方系统的责任转移** —— 如果使用的不是 Azure Direct 模型,而是外部服务器、代理或模型,数据流转、成本和合规责任全部由使用者承担,Microsoft 文档明确说明了这一点。
- **`DefaultAzureCredential` 陷阱** —— 这是为开发便利而设计的。生产环境中应指定具体的凭据,例如托管身份(Managed Identity)。回退机制会依次尝试多个凭据源,不仅增加延迟,还存在选中非预期凭据的安全风险。

### 3.4 事实核查 —— 流传的数字存在错误

多篇摘要文章将这个仓库描述为"星标 360、贡献者 14 人"。**2026 年 7 月直接查看仓库页面后确认,实际数字为星标约 16、fork 1 个、贡献者 3 人、提交 406 次,尚未发布任何 release。**360 这个数字看起来是与主线仓库 `microsoft/agent-framework`(数万级别)或其他项目混淆所致。

这个差距并不小。星标 16 和星标 360,对"提 issue 之后是否会有人回复"给出的是完全不同的预期。如果打算以社区规模作为引入决策的依据,请务必直接查看仓库本身。

> 指标会随查询时间而变化。上述数字的基准日期为 2026 年 7 月,引用时建议同时标注基准日期。

---

## 4. LangChain 1.0 / LangGraph 1.0

### 4.1 1.0 之后角色分工更清晰

2025 年 10 月的 1.0 发布重新定义了两个项目的关系。此前的模式是"先用 LangChain,不够用了再转向 LangGraph",但现在**LangChain 是构建在 LangGraph 运行时之上的高层抽象**。

| 维度 | LangChain 1.0 | LangGraph 1.0 |
| --- | --- | --- |
| 层次 | L1(代理 harness) | L2 + L3(编排 + 运行时) |
| 核心 API | `create_agent` | `StateGraph`、检查点器、`interrupt` |
| 取向 | 快速构建、快速上线 | 精细控制与持久性 |
| 执行模型 | 标准工具调用循环 | 基于图的执行(分支、循环、状态重访) |
| 稳定性承诺 | 2.0 之前不会有破坏性变更 | 相同 |
| 语言 | Python、TypeScript | Python、TypeScript |

LangChain 1.0 被重写为专注于核心代理循环,并引入了一个新概念——**中间件**,以内置中间件的形式提供 HITL、摘要和 PII 屏蔽。结构化输出被整合进主循环,省去了额外的一次 LLM 调用,从而降低了延迟和成本。

LangGraph 1.0 号称是"持久化代理框架领域的第一个稳定大版本"。唯一的重大变更是废弃了 `langgraph.prebuilt`,相关功能迁移到了 `langchain.agents`,向后兼容性得以保留。

### 4.2 LangGraph 的决定性优势 —— 持久化执行

使用 LangGraph 的理由基本可以归结为一点:**状态会自动持久化。**即使服务器在对话中途重启,或者长时间运行的工作流被中断,执行也能从中断点精确恢复。由于不需要自定义数据库逻辑就能实现保存和恢复,因此可以表达持续数天的审批流程,或者跨会话的后台任务。

HITL 也是一等公民 API。为了让人工审阅、修改、批准而暂停执行,只需要一行 `interrupt` 即可完成。在需要人工介入高风险判断的系统中,这一行代码决定了整个架构的走向。

### 4.3 优点

1. **压倒性的生态系统** —— 在集成数量、文档、示例、Stack Overflow 回答、招聘市场等方面都排名第一,每月下载量达数千万次。
2. **生产环境的参考案例** —— Uber、LinkedIn、Klarna、摩根大通等公司公开表示在生产环境中使用 LangGraph。
3. **确定性与代理性的混合表达** —— 现实系统从来不是 100% 代理化,也不是 100% 确定性的。可以在图中显式建模:部分分支走固定逻辑,部分分支交给 LLM 判断。
4. **与 LangSmith 集成** —— 可观测性、评估、部署等生命周期工具都能接上。
5. **动态工具调用** —— 可以按执行节点控制可用工具的集合。

### 4.4 缺点

1. **仅限 Python/TypeScript** —— 无法直接接入 Go、Java、Rust 后端,需要拆分成 HTTP 服务或更换语言。
2. **抽象层的负担** —— 早期 LangChain 曾因隐藏的提示词和隐式上下文操作而被批评构筑了一道"定制化的墙"。1.0 在很大程度上解决了这个问题,但仍需要花精力去读懂框架在做什么。
3. **依赖体积** —— 从供应链角度看并不轻量。
4. **与商业产品的绑定** —— LangSmith 并非开源。要充分利用可观测性,就会走上商业路径;虽然可以用自建的 OTel 技术栈替代,但集成质量存在差距。
5. **学习曲线的落点不同** —— LangChain 容易上手,LangGraph 较难,需要理解状态 schema、reducer、检查点器、thread 等概念。

---

## 5. 竞品全景图

### 5.1 按语言与层次的分布

| 项目 | 语言 | 主要层次 | 状态(2026-07) | 一句话特点 |
| --- | --- | --- | --- | --- |
| **Microsoft Agent Framework** | C#、Python | L1–L3 | 1.0 GA(2026-04) | SK、AutoGen 的继任者,面向企业级治理 |
| **Microsoft Agent Framework for Go** | Go | L1–L3 | 公开预览 | 上述框架的 Go 实现,存在功能差距 |
| **LangGraph** | Python、TS | L2–L3 | 1.0 GA(2025-10) | 持久化状态图运行时,事实上的标准 |
| **LangChain** | Python、TS | L1 | 1.0 GA(2025-10) | 构建代理最快的路径 |
| **AutoGen** | Python | L2 | 正走向并入 MAF | 起源于多代理对话/协作研究 |
| **Semantic Kernel** | C#、Python、Java | L1–L2 | 正走向并入 MAF | 轻量编排 SDK,提供迁移工具 |
| **CrewAI** | Python | L2 | 活跃 | 基于角色(role)的协作 + 事件驱动的 Flows |
| **Google ADK** | Python、**Go**、Java | L1–L2 | Go 1.0(2025-11) | 顺序/并行/循环代理原语,原生 OTel |
| **Genkit** | **Go**、JS | L1 | 面向生产 | 以 Flow 为中心,本地调试/追踪体验出色 |
| **Eino(CloudWeGo)** | **Go** | L1–L2 | 活跃,已在大规模生产中验证 | 字节跳动实际使用,组件图、断路器/退避机制 |
| **LangChainGo** | **Go** | L1 | 社区移植 | 覆盖面最广,落后于官方版本 |
| **OpenAI Agents SDK** | Python、**Go** | L1 | 活跃 | Handoff + 安全护栏,支持 MCP |
| **Dify** | Python(产品) | GUI | 活跃 | 无代码工作流、RAG 流水线 |

### 5.2 Go 阵营内部的竞争

"真实存在,但还年轻",是对 Go 代理生态最准确的描述。以下是截至 2026 年 5 月社区统计的参考数字:

| 框架 | 星标(大致) | 是否支持 MCP | 优势 |
| --- | --- | --- | --- |
| Eino | 11,100+ | 不支持(截至当时) | 生产级加固、图组合能力 |
| LangChainGo | 9,200+ | 不支持(截至当时) | 10+ 提供商、完整的 RAG 流水线 |
| Google ADK Go | — | 支持 | 已达到 1.0,原生 OTel |
| OpenAI Agents Go | 255 | 支持 | Handoff + 安全护栏 |
| **MAF for Go** | 约 16 | 支持(MCP/A2A/AG-UI) | 与 Azure/Foundry 对齐,支持检查点机制 |

如果 MCP 集成是优先事项,Google ADK Go、OpenAI Agents Go 以及 MAF Go 都是候选。如果看重纯粹的吞吐量和已验证的稳定性,Eino 更有优势。但另一方面,**如果需求是基于 Azure Entra ID、Purview、Defender 的治理,除了 MAF 几乎没有其他选择。**这正是 MAF Go 即便星标数不高,依然值得纳入考察范围的唯一但充分的理由。

---

## 6. 选型标准 —— 什么工作负载该用什么?

### 6.1 判断顺序

```
1) 语言技术栈是否已经固定?
   必须用 Go/单一二进制 → MAF Go / Eino / ADK Go / 不用框架
   可以用 Python·TS        → 进入 2)

2) 执行是否会持续数分钟以上,或中途需要人工审批?
   是  → LangGraph(或 MAF workflow)
   否 → 进入 3)

3) 组织是否处于 Azure/Entra 治理边界内?
   是  → MAF(.NET/Python)+ Foundry Hosted Agents
   否 → 先用 LangChain create_agent 起步,需要时再下沉到 LangGraph

4) 是否需要非开发人员修改工作流?
   是 → Dify 等 GUI 类工具
```

### 6.2 具体使用场景

| 场景 | 推荐 | 理由 |
| --- | --- | --- |
| 内部文档问答机器人,3–5 个工具 | **LangChain `create_agent`** | 一天就能搭好,不需要图 |
| 一个持续 3 天的多阶段审批流水线 | **LangGraph** | 持久化状态 + `interrupt`,能承受服务器重启 |
| 研究 → 验证 → 撰写报告的多代理场景 | **LangGraph** 或 **CrewAI** | 需要图级控制选前者,基于角色的协作描述选后者 |
| 实时监控交易所行情/订单流的代理 | **Go:MAF Go / Eino / 不用框架** | 延迟和 GC 压力是主导变量,不要把 Python 运行时放在关键路径上 |
| CTI 采集 → 归一化 → 报告初稿流水线 | **LangGraph + 独立的采集器** | 需要明确的按数据源隔离失败和重试点 |
| 部署到 Microsoft 365 / Teams 的内部代理 | **MAF(.NET/Python)** | Foundry Hosted Agents、Teams·M365 Copilot 发布路径 |
| 已有的 Semantic Kernel / AutoGen 代码库 | **迁移到 MAF** | 提供官方迁移指南和工具 |
| 非开发的策划人员需要直接修改提示词链 | **Dify** | 声明式 GUI,但版本管理和审计需要单独设计 |
| 代理逻辑用 40 行循环就够了 | **不用框架** | 在 Go 团队中这是多数派做法 |

### 6.3 混合部署是现实的选择

Foundry 的托管运行时被设计为**框架无关(framework-agnostic)**,可以将用 MAF、GitHub Copilot SDK、LangGraph 等构建的代理部署上去而无需重写。也就是说,"编排用 LangGraph,托管和治理用 Foundry"这样的组合是可行的。不把框架选择当作全有或全无的问题,在实践中更有利。

---

## 7. 新手上手指南 - Getting Started

### 7.1 Microsoft Agent Framework for Go

**安装**

```bash
go get github.com/microsoft/agent-framework-go
```

**环境变量**

```bash
export FOUNDRY_PROJECT_ENDPOINT="<your-endpoint>"
export FOUNDRY_MODEL="gpt-4o-mini"   # 可选
az login                              # 确保凭据来源可用
```

**基础代理**

```go
package main

import (
	"cmp"
	"context"
	"fmt"
	"os"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/microsoft/agent-framework-go/provider/foundryprovider"
)

func main() {
	endpoint := os.Getenv("FOUNDRY_PROJECT_ENDPOINT")
	model := cmp.Or(os.Getenv("FOUNDRY_MODEL"), "gpt-4o-mini")

	// Microsoft Foundry 认证
	token, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		panic(err)
	}

	// 创建 Foundry 代理
	a := foundryprovider.NewAgent(endpoint, token, foundryprovider.ModelDeployment(model),
		foundryprovider.AgentConfig{
			Instructions: "You are a helpful assistant.",
		},
	)

	// 运行
	ctx := context.Background()
	fmt.Println(a.RunText(ctx, "Write a haiku about the Microsoft Agent Framework").Collect())
}
```

**转向生产环境前必须修改的一行代码**

```go
// 开发用:依次尝试多个凭据源 → 延迟增加、误判、安全风险
token, _ := azidentity.NewDefaultAzureCredential(nil)

// 生产用:明确指定要使用的凭据
token, _ := azidentity.NewManagedIdentityCredential(&azidentity.ManagedIdentityCredentialOptions{
	ID: azidentity.ClientID("<user-assigned-client-id>"),
})
```

**接下来应该看的目录**

| 路径 | 内容 |
| --- | --- |
| `examples/01-get-started` | 从 hello world 到工作流的分步示例 |
| `examples/02-agents` | 工具、中间件、提供商、可观测性、A2A、AG-UI、MCP、技能 |
| `examples/03-workflows` | 多代理模式、路由、检查点 |
| `examples/05-end-to-end` | 完整应用 |
| `docs/dotnet-go-sdk-feature-comparison.md` | **落地前必读。**Go 相对 .NET 的功能差距 |
| `provider/` | 提供商包列表(可查看 Foundry 之外的其他选项) |

**故障排查摘要**

| 现象 | 原因 | 处理方式 |
| --- | --- | --- |
| Azure 凭据认证失败 | 未登录 Azure CLI,或未配置凭据源 | 执行 `az login`,或明确配置要使用的凭据 |
| API Key 错误 | Key 有误,或与目标资源不匹配 | 核对 Key 与对应资源/提供商是否一致 |
| 提供商端点错误 | 端点、部署名称、模型或 API 版本缺失或写错 | 对照示例中的环境变量和构造函数选项逐一核实 |

---

### 7.2 LangChain 1.0 —— 最快的路径

```bash
pip install --upgrade langchain
```

```python
from langchain.agents import create_agent
from langchain.tools import tool


@tool
def get_close_price(ticker: str) -> str:
    """返回指定股票代码的近期收盘价。"""
    # 实际实现中应调用真实数据源
    return f"{ticker}: 未查询到结果"


agent = create_agent(
    model="openai:gpt-4.1-mini",
    tools=[get_close_price],
    system_prompt=(
        "你是一个市场数据查询助手。"
        "如果工具没有返回值,请回答'无可用数据'。"
        "绝对不要凭空编造数值。"
    ),
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "告诉我 NVDA 最近的收盘价"}]}
)
print(result["messages"][-1].content)
```

系统提示词的最后一句并不是走个形式。当工具调用失败时,模型编造一个看似合理的数字,是代理系统中最常见、代价也最高的失败模式。如果不明确规定工具结果为空时的行为,这种情况一定会发生。

---

### 7.3 LangGraph 1.0 —— 检查点 + 人工审批

```bash
pip install --upgrade langgraph langchain
```

```python
from typing import Annotated, TypedDict

from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt, Command


class State(TypedDict):
    messages: Annotated[list, add_messages]
    approval: str


llm = init_chat_model("openai:gpt-4.1-mini")


def analyze(state: State):
    """生成初步分析草稿"""
    resp = llm.invoke(state["messages"])
    return {"messages": [resp]}


def human_review(state: State):
    """等待人工审批,期间暂停执行"""
    decision = interrupt(
        {
            "question": "是否批准这一判断?",
            "draft": state["messages"][-1].content,
        }
    )
    return {"approval": decision}


def finalize(state: State):
    if state["approval"] != "approved":
        return {"messages": [{"role": "assistant", "content": "已驳回,需要重新撰写。"}]}
    return {"messages": [{"role": "assistant", "content": "已批准,已加入部署队列。"}]}


builder = StateGraph(State)
builder.add_node("analyze", analyze)
builder.add_node("human_review", human_review)
builder.add_node("finalize", finalize)

builder.add_edge(START, "analyze")
builder.add_edge("analyze", "human_review")
builder.add_edge("human_review", "finalize")
builder.add_edge("finalize", END)

# 检查点器是持久化执行的核心。生产环境请使用 Postgres/Redis 检查点器
graph = builder.compile(checkpointer=InMemorySaver())

config = {"configurable": {"thread_id": "review-001"}}

# 第一阶段:在 interrupt 处停下
for event in graph.stream(
    {"messages": [{"role": "user", "content": "总结一下本季度的风险"}]},
    config,
):
    print(event)

# ... 此时进程即使挂掉也没问题,状态保存在检查点器中 ...

# 第二阶段:数天后人工批准,从中断点精确恢复
final = graph.invoke(Command(resume="approved"), config)
print(final["messages"][-1].content)
```

**这里有三个需要关注的点**

1. `thread_id` 是对话/任务的身份标识,恢复操作依靠这个 key 完成。
2. `InMemorySaver` 仅用于示例。如果在生产环境中原样使用,持久化这个引入理由本身就不成立了。
3. `interrupt` 调用处**在恢复时会从节点开头重新执行。**因此如果在 interrupt 之前放置副作用(支付、发邮件、下单),会导致重复执行。应将副作用拆分到 interrupt 之后的节点中。

---

### 7.4 在 Go 中不使用框架 —— 结构剖析

在引入框架之前,自己动手写一遍这样的结构,能清楚看出框架究竟替你做了什么。下面是一个不绑定特定厂商 SDK 的概念性结构。

```go
// 概念草图:实际类型请替换为你所使用的厂商 SDK
func RunAgent(ctx context.Context, c ModelClient, tools map[string]Tool, prompt string) (string, error) {
	msgs := []Message{{Role: "user", Content: prompt}}

	for turn := 0; turn < maxTurns; turn++ {
		resp, err := c.Complete(ctx, msgs, toolSpecs(tools))
		if err != nil {
			return "", err
		}
		msgs = append(msgs, resp.Message)

		if len(resp.ToolCalls) == 0 {
			return resp.Message.Content, nil // 结束条件
		}

		// 并发执行:Go 优势体现的地方
		results := make([]Message, len(resp.ToolCalls))
		var wg sync.WaitGroup
		for i, call := range resp.ToolCalls {
			wg.Add(1)
			go func(i int, call ToolCall) {
				defer wg.Done()
				out, err := tools[call.Name].Invoke(ctx, call.Args)
				results[i] = toolResultMessage(call.ID, out, err) // 错误信息也返回给模型
			}(i, call)
		}
		wg.Wait()
		msgs = append(msgs, results...)
	}
	return "", fmt.Errorf("超过最大轮次(%d)", maxTurns)
}
```

这大约 40 行代码中**没有**的东西,正是框架存在的理由:检查点、恢复、流式输出、token 计费、工具审批门、OTel span、子代理路由、上下文窗口管理。如果这些当中真正需要的不超过两三项,通常自己写会更划算。

---

## 8. 上线前检查清单 —— 安全与治理视角

代理框架本质上是**赋予 LLM 执行权限的装置**。以下是落地前需要确认的事项。

| 领域 | 检查内容 | 依据 |
| --- | --- | --- |
| **供应链** | 框架的传递依赖数量及签名验证机制。在 Go 中,`go.sum` + GOPROXY 透明日志是主要防线 | 2025–2026 年多起软件包篡改事件 |
| **MCP 信任边界** | MCP 服务器属于外部代码,应将服务器列表和权限固定为白名单,生产环境中不要开启动态发现 | MCP 的工具描述本身就是提示词注入的攻击面 |
| **工具审批** | 破坏性操作(删除文件、转账、部署)必须放在审批中间件之后。使用 MAF 的 tool approval 或 LangChain 的 HITL 中间件 | 许多框架默认开启自动工具调用 |
| **凭据管理** | 禁止使用回退型凭据(如 `DefaultAzureCredential`),应明确指定,例如托管身份 | Microsoft 官方建议 |
| **数据边界** | 使用第三方模型/代理时,需评估数据是否会跨越组织的合规和地理边界,责任由使用者承担 | MAF 文档中已明确说明 |
| **可观测性** | OTel span 中可能携带提示词/响应的原文,需提前制定屏蔽策略 | 存在 PII、商业机密泄露的路径 |
| **副作用幂等性** | 检查恢复/重试时是否存在被重复执行的操作 | 参见 §7.3 |
| **版本锁定** | 预览阶段的 SDK 建议锁定到具体的 commit | MAF Go 尚未发布 release 标签 |

---

## 9. 总结

应从以下角度来选择使用哪种方案。

1. **先确定层次。** 先分清自己真正需要的是工具循环(L1)、图(L2)还是持久化运行时(L3),候选方案就能缩减到两三个。大多数团队实际想要的其实是 L3,而这恰恰是自己搭建成本最高的部分。

2. **语言决定了大方向。** 如果是 Python/TS,LangGraph 是现实中的默认选择;如果是 .NET,MAF 是默认选择;如果是 Go,选项就比较有限。MAF Go 的方向是对的,但截至 2026 年 7 月仍处于公开预览阶段,缺少 handoff、声明式代理、RAG、CodeAct、DevUI,社区规模也非常小。如果 Azure 治理不是硬性需求,Eino、ADK Go,或者不使用框架的实现,可能是更安全的选择。

3. **框架买的是失败处理能力,不是性能。** 如果一份引入评估文档写着"性能会提升",那这份文档就是错的。正确的说法应该是"失败会变得可观测、可恢复"。LLM 是 Excel,不是先知,框架就是把这份 Excel 变成一张可审计的表格的工具。

对 MAF Go 的实务建议如下:**目前应将其定位在试点和技术验证(PoC)阶段,先去 `docs/dotnet-go-sdk-feature-comparison.md` 确认自己所需的功能是否已经实现。**如果 handoff 编排是必需的功能之一,那么目前它还不在可采用的范围内。

---

## 附录 A. 参考链接

| 项目 | URL |
| --- | --- |
| Microsoft Agent Framework for Go | https://github.com/microsoft/agent-framework-go |
| .NET–Go 功能对比文档 | https://github.com/microsoft/agent-framework-go/blob/main/docs/dotnet-go-sdk-feature-comparison.md |
| Go 参考文档 | https://pkg.go.dev/github.com/microsoft/agent-framework-go |
| MAF 主线(.NET/Python) | https://github.com/microsoft/agent-framework |
| MS Learn 文档 | https://learn.microsoft.com/agent-framework/ |
| Agent Framework 开发博客 | https://devblogs.microsoft.com/agent-framework/ |
| LangChain·LangGraph 1.0 发布公告 | https://blog.langchain.com/langchain-langgraph-1dot0/ |
| LangGraph 1.0 更新日志 | https://changelog.langchain.com/announcements/langgraph-1-0-is-now-generally-available |
| Eino(CloudWeGo) | https://github.com/cloudwego/eino |
| Foundry Build 2026 概要 | https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-build-2026/ |

## 附录 B. 术语对照表

| 缩写 | 全称 | 含义 |
| --- | --- | --- |
| MAF | Microsoft Agent Framework | Microsoft 的多语言代理框架 |
| MCP | Model Context Protocol | 供模型发现/调用外部工具的标准协议 |
| A2A | Agent-to-Agent | 跨运行时的代理间消息协议 |
| AG-UI | Agent-GUI protocol | 代理与用户界面之间的交互协议 |
| HITL | Human-in-the-Loop | 在执行过程中插入人工审阅/审批的模式 |
| OTel | OpenTelemetry | 分布式追踪与指标采集标准 |
| SK | Semantic Kernel | Microsoft 上一代编排 SDK |
| GA | General Availability | 正式发布,支持生产环境使用 |

---

*数据基准日期:2026 年 7 月 22 日。GitHub 指标和框架功能列表变化很快,引用时请同时标注基准日期,并在做出引入决策前直接查看仓库本身。*

*本文仅用于技术信息分享,不构成对特定产品的推荐,也不构成投资建议。*
