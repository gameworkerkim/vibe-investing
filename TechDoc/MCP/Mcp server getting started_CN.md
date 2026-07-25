---
title: "MCP服务器开发入门 — 从概念到构建AMQS-AI-Infra信号服务器"
description: "第一部分全面梳理MCP(Model Context Protocol)的概念、特点及与API的区别;第二部分以AMQS量化策略为题材,实际构建、测试并连接到Claude Desktop的完整实操指南。"
keywords:
  - "MCP"
  - "Model Context Protocol"
  - "MCP服务器开发"
  - "FastMCP"
  - "Claude Desktop"
  - "AMQS"
  - "MCP tools resources prompts"
  - "MCP安全"
lang: zh
featured: false
schema_type: TechArticle
---

# MCP服务器开发入门 — 从概念到构建AMQS-AI-Infra信号服务器

> 第一部分全面梳理MCP(Model Context Protocol)的概念、特点及与API的区别。
> 第二部分以[vibe-investing / AMQS-AI-Infra](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20AI%20Infra)
> 量化策略为题材,完整讲解**自行构建、测试并连接到Claude Desktop的实际可用MCP服务器**的全过程。
> 随附代码(`server.py`)已从stdio握手到tool调用完成端到端验证。

---

# 第一部分 — 理解MCP概念

## 1. 什么是MCP?

MCP(Model Context Protocol)是Anthropic于2024年11月发布的**开放标准协议**,用于让AI模型(尤其是LLM)能够连接外部数据源和工具。此后OpenAI、Google、Microsoft等主要科技公司纷纷采用,使其成为AI行业事实上的标准(de facto standard)。

### 1.1 为什么需要MCP? — 问题的演变脉络

| 阶段 | 情况 | 局限性 |
|---|---|---|
| 1. 仅有LLM | 只能依据训练时的知识进行回答 | 无法获取实时信息("现在天气如何"),无法与外部世界交互 |
| 2. Agent框架 | Langchain、CrewAI等将LLM连接到外部工具(搜索、API、数据库) | 每个框架都需要为每个工具单独开发SDK — M×N集成问题 |
| 3. **MCP** | 通过单一标准协议统一 | 降为M+N — 工具提供方只需构建一个MCP服务器,即可在所有host上使用 |

具体来看M×N问题:M个Agent框架 × N个外部工具的每种组合都需要单独开发连接器。工具提供方因需要与每个框架分别对接而承受着低效的负担。MCP通过标准化的连接方式解决了这一问题——**"AI领域的USB-C接口"**——任何支持MCP的AI应用,都能立即连接到任何支持MCP的数据源。

### 1.2 MCP架构

| 组成部分 | 作用 | 示例 |
|---|---|---|
| **MCP主机(Host)** | 包含LLM的AI应用环境 | Claude Desktop、Cursor、Windsurf |
| **MCP客户端(Client)** | 在主机内部负责LLM与MCP服务器之间的通信中介。每个服务器对应1:1连接 | 内置于主机中 |
| **MCP服务器(Server)** | 连接外部服务(数据库、Web API、文件系统等),为LLM提供上下文和功能 | slack-mcp-server、notion-mcp-server、**本文构建的AMQS服务器** |
| **传输层(Transport)** | 基于JSON-RPC 2.0的消息交换 | stdio(本地)、Streamable HTTP(远程) |

```
┌─────────────── Host (Claude Desktop) ───────────────┐
│  LLM ↔ Client A ── stdio ──→ Server A (AMQS信号)     │
│        Client B ── stdio ──→ Server B (Slack)        │
│        Client C ── HTTP ───→ Server C (远程数据库)   │
└──────────────────────────────────────────────────────┘
```

一个host可以同时连接多个服务器,LLM会根据对话上下文自主判断使用哪个服务器的哪个功能。

## 2. MCP的核心特性

| 特性 | 说明 |
|---|---|
| **开放标准(Open Standard)** | 规范和SDK均以开源形式发布。不依赖特定的AI模型或供应商,任何人都可以实现服务器或客户端 |
| **双向通信(Bidirectional)** | 并非一次性的请求-响应,而是基于持续会话。规范中也包含服务器向客户端发送通知(notification),或服务器反向请求LLM推理(sampling)的机制 |
| **通用性(Universality)** | 一旦实现MCP标准,访问各类数据源的方式即被标准化。服务器无需关心host是Claude还是Cursor |
| **动态发现(Dynamic Discovery)** | 客户端在运行时通过`list_tools`查询服务器功能 — AI无需任何预先硬编码的知识即可自动发现并使用工具 |
| **可组合性(Composability)** | LLM可以自由组合多个服务器的工具,执行多步骤工作流 |

## 3. MCP与传统API的区别

| 方面 | 直接集成API | MCP |
|---|---|---|
| 连接方式 | 每个服务单独连接、单独SDK | 通过单一标准协议访问多个工具 |
| 工具发现 | 开发者阅读文档并手动编码 | AI在运行时自动发现(`list_tools`) |
| 通信模型 | 一次性请求-响应(无状态) | 基于持续会话的双向实时通信 |
| 调用决策方 | 应用代码决定何时调用 | **LLM根据对话上下文自主决定是否调用、何时调用、如何组合调用** |
| 接口规范 | OpenAPI/Swagger — 面向人类和代码 | JSON Schema + 自然语言描述 — **面向LLM** |
| 集成成本 | M(应用)×N(工具)个连接器 | M+N(每个工具一个服务器) |
| 相互关系 | — | **MCP并不替代API** — 服务器内部依然调用REST API和数据库。MCP是在其之上的LLM友好适配层 |

最后一行最为关键。构建MCP服务器,归根结底就是"**将现有的API、库和计算逻辑包装成LLM可以理解并调用的形式**"。第二部分构建的AMQS服务器内部同样使用yfinance API和pandas计算,只是将其以MCP tool的形式对外公开。

## 4. MCP应用场景 — 从概念到实践

### 示例1:新闻摘要与Slack发布
"总结今天最重要的3条新闻,并发布到Slack的AI news频道"→ AI通过搜索类MCP服务器收集新闻 → 总结要点 → 通过slack-mcp-server发布到指定频道。关键在于**LLM自主组合了两个不同的服务器**。

### 示例2:YouTube频道分析与Notion报告
"分析最近10个视频并在Notion中生成报告"→ 通过YouTube分析类MCP分析留存率和流失点 → 撰写洞察文档 → 通过notion-mcp-server创建报告页面。

### 示例3:工作自动化服务器生态
`slack-mcp-server`(发送/查询消息)、`notion-mcp-server`(数据库管理)、`google-calendar-mcp-server`(日程管理)等——目前已存在数千个公开服务器。

### 示例4:量化投资信号服务器(本文主题)
"查一下当前的市场机制,如果是RISK_ON就给我Top 10,顺便看看我的MU止损情况"→ LLM依次组合调用AMQS MCP服务器中的3个工具。如果示例1~3是*使用他人构建的服务器*,那么第二部分讲的就是**如何自己构建这样的服务器**。

---

# 第二部分 — MCP服务器开发实践:AMQS-AI-Infra信号服务器

## 5. 为什么AMQS是理想的MCP示例

AMQS-AI-Infra的原始文档中已经包含一张**Python / LLM职责划分表**。这张表本身就可以直接作为MCP服务器的设计蓝图。

| AMQS职责划分 | 负责方 | MCP映射 |
|---|---|---|
| 4因子动量、止损、市场机制、Top-N选股 | Python(自动化) | **Tools** — LLM调用的确定性计算 |
| Universe / 策略参数(静态参考) | Python | **Resources** — 只读上下文 |
| 营收加速、13F、EPS修正、叙事 | LLM(知识/检索) | **Prompts** — 交叉验证工作流模板 |

换言之,"Python计算技术信号,LLM审查基本面"这一AMQS理念("LLM是Excel,不是神谕")与MCP的三大基本组件(Tools / Resources / Prompts)一一对应。将确定性计算放入代码、将判断留给模型——这正是MCP服务器设计的标准模式。

## 6. 从开发者视角重新解读架构

让我们从开发者的角度重新审视第一部分中的Host / Client / Server结构。

| 组成部分 | 开发者实际接触的内容 |
|---|---|
| Host | 不需要构建(使用现成应用) |
| Client | 不需要构建(内置于host中) — 仅在协议测试时编写 |
| **Server** | **我们要构建的对象** — 本文的全部内容 |
| 传输层 | 由SDK处理 — 只需选择transport类型 |

### 6.1 三大基本组件

| 组件 | 控制方 | 用途 | 在AMQS示例中 |
|---|---|---|---|
| **Tools** | model-controlled(由LLM决定是否调用) | 执行函数,可能产生副作用 | `get_regime`、`get_momentum_score`、`get_top_signals`、`check_stop_loss` |
| **Resources** | application-controlled(由host管理) | 通过URI标识的只读数据 | `amqs://universe` |
| **Prompts** | user-controlled(由用户选择) | 可复用的提示模板 | `cross_validate_ticker` |

### 6.2 选择Transport

| Transport | 通信方式 | 应用场景 | 备注 |
|---|---|---|---|
| **stdio** | 标准输入输出 | 本地(Claude Desktop、Cursor) | 一定从这里开始。无需部署或认证 |
| **Streamable HTTP** | 单一HTTP端点 | 远程服务器 | 自2025-03规范起取代SSE的当前标准 |
| SSE(遗留) | HTTP + Server-Sent Events | 远程(旧版) | 已弃用 — 新开发不应使用 |

> 早期资料中"stdio(本地)或SSE(远程)"的描述基于旧版规范。在当前规范中,远程transport已统一为**Streamable HTTP**。

### 6.3 选择SDK

| 标准 | Python(`mcp` + FastMCP) | TypeScript(`@modelcontextprotocol/sdk`) |
|---|---|---|
| 量化/数据处理 | 直接对接pandas/numpy/yfinance生态 | 需要单独的桥接层 |
| 代码量 | 3个装饰器即可完成 | 相对冗长 |
| 部署 | `uv` / `pip` | `npx`一条命令部署的优势 |
| 本示例选择 | **采用** | — |

对于量化信号服务器而言,由于数据栈位于Python中,选择Python SDK是自然的选择。`FastMCP`会根据函数签名和docstring自动生成tool schema——由于docstring正是LLM所看到的tool描述,**docstring的质量直接决定了tool调用的准确性**。

## 7. 项目结构与环境配置

```
amqs-mcp-server/
├── server.py                            # MCP服务器本体(单文件)
├── requirements.txt
├── claude_desktop_config.example.json   # Claude Desktop连接配置示例
└── MCP_Server_Getting_Started.md        # 本文档
```

```bash
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 即时演示(无需网络/API密钥,使用合成价格)
AMQS_MOCK=1 python server.py

# 真实数据(yfinance)
python server.py
```

`AMQS_MOCK=1`是一种基于可复现合成价格运行的离线模式,与Toss仪表盘的MOCK模式原理相同。无需任何密钥即可演示逻辑,这正是让文档和CI成为"活文档"的条件。

## 8. 服务器实现分步解析

完整源码请参见随附的`server.py`。此处仅介绍关键模式。

### 步骤1 — 服务器实例与instructions

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
    "amqs-ai-infra",
    instructions=(
        "AMQS-AI-Infra quant strategy signal server. ... "
        "All output is a research reference signal, not investment advice."
    ),
)
```

`instructions`是帮助客户端理解服务器整体性质的系统级提示。对于金融工具,**在服务器层面嵌入免责声明**比在每个tool输出中重复声明更为稳妥(本示例两者都做了)。

### 步骤2 — 分层:数据 / 策略 / MCP

```
数据层     get_prices()          yfinance或合成数据 + 缓存
策略层     composite_scores()    4因子z-score → 0-100分(纯函数,与MCP无关)
MCP层      @mcp.tool()           对策略函数进行薄封装并序列化为JSON
```

将策略逻辑与MCP装饰器分离,可以(1)方便进行单元测试,(2)让CLI、回测和Signal Bot复用同一套逻辑。这与原始仓库中`script/strategy.py`(引擎)与`script/amqs_ai_infra.py`(CLI)的分离方式相同。这正是第3节中"MCP是API之上的适配层"这一理念的代码实现。

### 步骤3 — 定义Tools:docstring即面向LLM的规范

```python
@mcp.tool()
def get_top_signals(top_n: int = 10) -> str:
    """返回AMQS的Top-N买入候选标的。每个子主题最多应用4只股票的上限,
    以防止对GPU等单一主题的过度集中。若宏观市场机制不是RISK_ON,则包含警告信息。"""
```

检查清单

| 项目 | 原因 |
|---|---|
| 必须使用类型提示(`top_n: int = 10`) | 自动生成JSON Schema的依据 |
| docstring中明确说明行为、约束、前提条件 | LLM判断何时使用该tool的唯一依据 |
| 返回结构化的JSON字符串 | 确保LLM解析的稳定性(`ensure_ascii=False`可保留非ASCII文本) |
| 输入校验+以JSON形式返回错误 | 对于universe之外的ticker,返回`{"error": ..., "universe": [...]}`而非抛出异常 — 让LLM能够自我恢复 |
| 设置上限钳制(`min(top_n, len(UNIVERSE))`) | 即使LLM传入`top_n=999`也能保证安全 |

### 步骤4 — 在tool内部强制执行领域规则

子主题上限(每个主题最多4只标的)并非礼貌地要求LLM遵守,而是**由代码强制执行**:

```python
for t, row in df.iterrows():
    theme = row["subtheme"]
    if theme_count.get(theme, 0) >= SUBTHEME_CAP:
        continue          # 在代码层面阻止GPU过度集中
```

验证结果(Top-10,mock):`compute 4 / server 3 / software 2 / network 1` — 上限机制运行正常。风险规则应放在代码中,而非提示词中。这正是"LLM是Excel"这一原则的MCP版本。

### 步骤5 — Resources和Prompts

```python
@mcp.resource("amqs://universe")     # URI scheme可自行约定 — 服务器内部命名空间的惯例
def universe_resource() -> str: ...

@mcp.prompt()
def cross_validate_ticker(ticker: str) -> str: ...
```

Prompt是服务器用来分发"让LLM执行Python无法完成的任务(营收加速、13F、EPS修正)的标准指令"的渠道。原本需要复制粘贴原始仓库中`prompts/AMQS_AI_Infra_kr.MD`的工作流,在MCP中变成了从host UI一键调用。

## 9. 测试 — 三阶段验证流程

| 阶段 | 方法 | 验证内容 |
|---|---|---|
| 1. 单元测试 | 导入模块并直接调用函数 | 策略逻辑(与MCP无关) |
| 2. 协议测试 | 通过MCP客户端进行stdio握手 | initialize → list_tools → call_tool |
| 3. 交互测试 | MCP Inspector | 从真实host视角进行UI级验证 |

### 9.1 单元测试

```python
import os; os.environ["AMQS_MOCK"] = "1"
import server
print(server.get_top_signals(10))   # 即便加了装饰器,仍可作为普通函数直接调用
```

### 9.2 协议测试(已实际验证)

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

params = StdioServerParameters(command="python", args=["server.py"],
                               env={"AMQS_MOCK": "1"})
async with stdio_client(params) as (r, w):
    async with ClientSession(r, w) as s:
        await s.initialize()
        tools = await s.list_tools()      # 确认4个tool
        out = await s.call_tool("get_regime", {})
```

执行结果

```
TOOLS: ['get_regime', 'get_momentum_score', 'get_top_signals', 'check_stop_loss']
RESOURCES: ['amqs://universe']
PROMPTS: ['cross_validate_ticker']
CALL get_regime OK: {"regime": "RISK_ON", ...}
```

这个测试印证了第一部分第2节中提到的"动态发现(Dynamic Discovery)"特性 — 客户端完全不了解服务器代码,仅通过运行时查询就能获取完整的功能列表和schema。

### 9.3 MCP Inspector

```bash
npx @modelcontextprotocol/inspector python server.py
```

在浏览器UI中交互式验证tool列表、schema和调用结果。这是连接Claude Desktop之前的必经步骤。

> 常见陷阱:切勿在stdio服务器中使用`print()`进行调试。由于stdout是JSON-RPC通道,日志必须发送到`logging`(stderr)。这是stdio服务器故障的头号原因。

## 10. 连接到Claude Desktop

`claude_desktop_config.json`的位置:

| 操作系统 | 路径 |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "amqs-ai-infra": {
      "command": "python",
      "args": ["/ABSOLUTE/PATH/TO/amqs-mcp-server/server.py"],
      "env": { "AMQS_MOCK": "0" }
    }
  }
}
```

注意事项:(1)路径必须为绝对路径,(2)如使用venv,`command`应为venv内python的绝对路径,(3)修改后必须完全重启Claude Desktop。连接成功后,即可进行如下对话:

```
用户: 查一下当前的市场机制,如果是RISK_ON就给我Top 10,并告诉我MU排第几位。
      另外我的MU平均成本是200美元,帮我看看是否触发止损。

Claude: [get_regime] → RISK_ON
        [get_top_signals(10)] → MU排名第3,tier为SATELLITE
        [check_stop_loss("MU", 200.0)] → pnl -17.95%, action EXIT
        → "已跌破-12%止损线。根据AMQS规则,这是一个EXIT信号..."
```

与第一部分第4节中"新闻摘要→发布Slack"的示例相同,用户用自然语言表达需求,LLM自主决定如何组合调用工具。这种tool编排(orchestration)正是MCP的真正价值所在。

## 11. 远程部署(Streamable HTTP)

从stdio切换到远程,只需修改一行代码:

```python
mcp.run(transport="streamable-http")   # 默认 http://localhost:8000/mcp
```

| 项目 | stdio | Streamable HTTP |
|---|---|---|
| 使用者 | 仅本人 | 团队/外部公开 |
| 认证 | 不需要(本地进程) | **必须使用OAuth 2.1**(规范要求) |
| 部署 | — | Docker + 反向代理,或Cloudflare Workers等 |
| 状态管理 | 进程=会话 | 基于Session-ID,需考虑服务器横向扩展 |

正如Signal Bot的网页视图(`python -m http.server 8011`)曾与团队共享一样,将MCP服务器远程化后,团队每位成员的Claude都可以使用同一个AMQS信号源——但未经认证就公开暴露是绝对禁止的做法(见下一节)。

## 12. 安全考量(从CTI视角出发)

MCP是一个新的攻击面。构建服务器的同时,也必须具备防御者的思维。

| 威胁 | 说明 | 本示例的应对/建议 |
|---|---|---|
| Tool Poisoning(工具投毒) | 恶意服务器在tool描述中嵌入隐藏指令以操纵LLM | 作为**服务器作者**:将描述严格限定于功能说明。作为**使用者**:安装前审查第三方服务器的描述 |
| Prompt Injection(间接) | LLM执行tool返回的外部数据(新闻/网页)中嵌入的指令 | 将返回值限制为结构化JSON,尽量减少自由文本 |
| Confused Deputy(混淆代理) | LLM执行超出用户意图的tool调用 | 不构建具有副作用的tool(如下单执行) — 本服务器**仅提供只读信号**。实际交易集成必须要求human-in-the-loop审批 |
| Secrets泄露 | API密钥以明文形式存储在配置的`env`中 | 集成KIS API等场景应使用系统密钥链/密钥管理器。配合`.gitignore`+pre-commit密钥扫描(如LAON VaultGuard类工具) |
| Rug Pull(信任滥用) | 服务器在获得信任后通过更新改变tool行为 | 安装时固定版本,变更时审查diff |
| 未认证的远程暴露 | 发布Streamable HTTP服务器时可能遭未授权使用及数据泄露 | OAuth 2.1+速率限制,内部网络至少使用mTLS |

金融信号服务器特有的一项风险是:**LLM过度解读tool输出,将其当作确定性的交易建议**。应对措施有三重——在服务器`instructions`中加入免责声明、在每个tool输出中加入`disclaimer`字段、在prompt模板末尾强制添加提示。

## 13. 扩展路线图

| 阶段 | 内容 | 难度 |
|---|---|---|
| 1 | 集成`backtest.py` — 新增`run_backtest(start, end)` tool | 低 |
| 2 | 将Signal Bot的`signals.json`以Resource形式公开(`amqs://signals/latest`) | 低 |
| 3 | 将ARDS-X市场机制分类器改为独立的MCP服务器 — 由LLM编排AMQS/ARDS之间的切换 | 中 |
| 4 | 集成Toss Open API / KIS API — 但实际下单tool必须设置审批关卡 | 高 |
| 5 | 集成加密货币新闻管线(web3paper) — 整合CTI/投资的新闻收集与摘要tool | 中 |
| 6 | 通过Streamable HTTP + OAuth实现团队部署,tool描述支持多语言(KR/EN/ZH/JP) | 中 |

## 14. 总结

**概念部分(第一部分)**
1. MCP是一种开放标准,将LLM与外部工具之间的M×N集成问题降为M+N——即"AI的USB-C接口"。
2. 在Host / Client / Server结构中,开发者需要构建的只有Server。
3. MCP并不替代API——它是构建在现有API之上的**LLM友好适配层**,核心区别在于动态发现和LLM主导的调用方式。

**开发部分(第二部分)**
4. 构建MCP服务器意味着将**确定性计算作为Tools、静态数据作为Resources、LLM工作流作为Prompts**对外公开。
5. AMQS的Python/LLM职责划分表可以直接作为MCP设计蓝图——风险规则(子主题上限、止损)应在代码中强制执行,而非依赖提示词。
6. 开发顺序:FastMCP + stdio → 单元测试 → 协议测试 → Inspector → Claude Desktop → (如有需要)Streamable HTTP + OAuth。
7. 构建服务器的同时也创造了攻击面——应在设计阶段就考虑Tool Poisoning、Injection和Secrets等问题。

## 参考链接

- MCP官方规范/文档:https://modelcontextprotocol.io
- Python SDK:https://github.com/modelcontextprotocol/python-sdk
- MCP Inspector:https://github.com/modelcontextprotocol/inspector
- AMQS-AI-Infra原始仓库:https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20AI%20Infra

---

*本文档及代码仅供研究与教育用途,不构成投资建议。AMQS是一种高风险的量化策略,存在本金损失的可能性。*
*许可证:MIT — "Built on AMQS by Dennis Kim, vibe-investing repository."*
