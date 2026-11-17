# WorkBuddy + Futu MCP + Hy4 preview: A Guide to a Hong Kong and US Stock Investing Assistant Agent

As of 2026-11-14 · Dennis Kim

## Overview

This project combines WorkBuddy, Tencent's desktop AI agent workbench, with the Futu MCP connector and Tencent Hunyuan's Hy4 preview model to build an investing assistant agent for Hong Kong and US stocks. The user gives instructions in everyday language, and the agent organizes quotes and account data across markets and identifies the trading session. The goal is for the person to focus on strategy and risk management while the agent handles lookups, organization and first drafts.

This document uses the attached analysis as its backbone and supplements it with figures and connection steps checked against public sources as of November 14, 2026. Items that could not be verified are marked as such in the text.

## Introduction

There are three components, acting as the execution environment, the brain and the hands.

| Component | Role | Key specs |
| --- | --- | --- |
| [WorkBuddy](https://www.workbuddy.cn/) | Execution environment. A desktop agent that breaks down requests, calls tools, and reads and writes local files | Connectors are MCP-based, and the desktop app's custom connector option adds any MCP server ([Tencent Cloud docs](https://cloud.tencent.com/document/product/1831/134525)) |
| [Hy4 preview](https://huggingface.co/tencent/Hy4-preview) | Brain. The LLM that plans and calls tools | 770B total parameters, 49B active per token (MoE), 1M-token context, Apache 2.0 open weights, released August 28, 2026 |
| [Futu MCP](https://open.futunn.com/zh-cn/mcp-docs/overview) | Hands. The tool set for quotes, accounts and orders | An HTTP MCP service hosted by Futu, 130+ tools, OAuth 2.1 authorization ([Futu guide](https://www.futuhk.com/hans/blog/detail-futu-ai-102-260825010)) |

The flow is simple.

1. The user gives an instruction in natural language in the WorkBuddy chat.
2. Hy4 preview splits the work into steps and picks the Futu MCP tools it needs.
3. Futu MCP returns quotes, holdings and order data within the permissions of the OAuth-authorized account.
4. WorkBuddy turns the results into local files such as tables, reports and spreadsheets.

Futu MCP's tools fall into six categories.

| Category | Tools | Examples |
| --- | --- | --- |
| Real-time quotes and push | 17+ | Live quotes, candlesticks, market depth |
| Derivatives and strategies | 27+ | Options analysis, volatility, warrant alerts |
| Stock research | 31+ | Financial data, analyst ratings |
| Trading and order management | 19+ | Place orders, view positions, modify orders |
| Market screening | 43+ | 244 screening factors |
| Technical indicators and personalization | 10+ | MACD, KDJ, RSI |

## Strengths

**1. An executing agent with local processing**

WorkBuddy is not a chat window. It is an executing agent that breaks down a request on its own, calls tools and produces files, and the user can trace and review both the process and the results. Because it is a desktop app that reads and writes local files and runs scripts, outputs stay on your own machine. Model inference still runs in Tencent's cloud, however, so data placed in a prompt is not isolated locally.

**2. A model tuned for agent work, with a 1M-token context**

Hy4 preview can hold financial statements and research notes for many tickers at once. By Tencent's figures it scores 85.4 on Terminal-Bench 2.1, up 14.6 points from 70.8 for the previous-generation Hy3 ([comparison article](https://mer.vin/news/tencents-hy4-preview-edges-out-glm-5-3-and-kimi-k3/)). Its strongest numbers cluster in agentic tasks such as terminal operation and tool calling, which suits a workflow that handles 130 tools. The score is vendor-reported, so it is safer to verify it against your own workload ([OrcaRouter analysis](https://www.orcarouter.ai/blog/tencent-hy4-preview-launch)).

**3. Broad financial coverage through Futu MCP**

One connector covers quotes, account data, screening, derivatives analysis and orders. Authorization is OAuth 2.1, so no API key has to sit in a file. According to Futu, trading defaults to a simulated environment, live trades require user confirmation, the AI cannot access the trading password, and every call is recorded in an audit log ([Futu guide](https://www.futuhk.com/hans/blog/detail-futu-ai-102-260825010)).

**4. Tencent ecosystem integration and a low entry cost**

It connects with collaboration tools such as WeChat, QQ, Feishu and DingTalk, so it fits into an existing work setup. The attached analysis lists the Lite plan at 39 yuan a month, and third-party summaries report three tiers at 39, 99 and 299 yuan. Tencent Cloud's [billing page](https://cloud.tencent.com/document/product/1831/134334), however, says the personal plans were restructured into Standard, Advanced and Flagship tiers from July 1, 2026, so check the current price on the checkout screen. The free plan gives 500 credits a month ([credits summary](https://www.woshipm.com/operate/6458164.html)).

## Weaknesses

Items 1, 2, 3 and 5 below come from the attached analysis, which cites user reports. Their original sources were not separately verified in this research.

**1. No sync between desktop and mobile**

Files, reports and apps created on the desktop do not sync to mobile in real time. The mobile app is closer to a remote control for the desktop agent, and outputs have to be checked on the desktop.

**2. No verification of results**

There are reported cases where the agent says a task is complete without checking that the result is correct, such as generating an image at the wrong aspect ratio and calling it accurate, or rationalizing its own errors. In an investing assistant, where one wrong number skews a decision, this is the largest risk.

**3. Too much autonomy over code and logic**

In one reported case the agent changed core error-handling logic while "optimizing" code and caused an outage. The same can happen when strategy or risk rules live in a script and the agent is asked to edit it.

**4. Costs are hard to predict**

Hy4 preview's free period in WorkBuddy ended on September 10, 2026 ([announcement coverage](https://news.mydrivers.com/1/1147/1147486.htm)). Since then it consumes credits, and long contexts and repeated tool calls use far more than short questions ([pricing overview](https://toolnavs.com/zh/article/1989-workbuddy-mian-fei-ma-tao-can-he-ji-fen-zhe-yang-xuan-geng-sheng-qian)). The attached analysis notes that using the execution mode (Craft) for simple lookups drains credits quickly. That applies especially to investing workflows that repeatedly call tools with large results, such as market screening.

**5. Limited file format support**

Only Word, Excel, PPT and MD editing is officially supported. PDF editing is not. Since research reports and filings are mostly distributed as PDFs, this gets in the way in practice.

**6. A preview model and single-broker dependence**

Hy4 is still a preview. Tencent itself acknowledges there is considerable room to improve pre-training and post-training ([Tencent Cloud developer post](https://cloud.tencent.com/developer/article/2745909)). The setup also works only with a Futu account.

## Areas for Improvement

Reliability and safety come first. The rest are matters of convenience and reach.

| Area | Direction |
| --- | --- |
| Reliability | Add an automatic verification step for financial data and trade results: cross-check balance and positions before an order, validate data timestamps |
| Safety | In addition to Futu's confirmation steps, give WorkBuddy risk rules the agent cannot edit and a sandbox for strategy logic |
| Reach | Support MCP connections to other brokers such as Interactive Brokers and Longbridge |
| Sync | Cloud sync of outputs between desktop and mobile |
| Documents | PDF reading, annotation and editing |
| Model flexibility | Split models by task. WorkBuddy's model list also includes Hy3, GLM-5.2 and Kimi K3, so lookups can go to a cheaper model and analysis to Hy4 ([model list overview](https://cloud.tencent.com/developer/article/2733836)) |
| Backtesting | Built-in simple strategy backtesting and simulation |

## Similar Projects

Similar projects fall into broker MCPs, data MCPs, debate-style agents and code frameworks. This project differs in that instructions are given inside a general-purpose workbench.

| Project | Type | Key features | Difference from this project |
| --- | --- | --- | --- |
| Longbridge MCP | Official broker MCP | 110+ tools, US and Hong Kong markets, live order routing and position management, Rust-based server | Tied to Longbridge, but focused on stable live execution |
| Webull OpenAPI MCP | Broker MCP | Multiple regions including the US, Hong Kong, Japan and Singapore, access to trading and market data | Specific to the Webull ecosystem. Not paired with a general-purpose agent workbench |
| [Tongdaxin (通达信) MCP](https://finance.sina.com.cn/wm/2026-06-03/doc-iniacxkh2221676.shtml) | Data MCP | The first third-party financial data provider in the WorkBuddy connector marketplace, 10 tools | Runs in the same workbench but centers on data and research. No account or order functions |
| [futu-stock-mcp-server](https://github.com/shuizhengqi1/futu-stock-mcp-server) | Community MCP | Open-source wrapper exposing Futu OpenAPI over MCP through a local OpenD gateway. Trading is toggled with environment variables | Uses the same Futu account but must be installed and run yourself. Gives more control |
| openinvest (Hermes Agent) | AI investing agent | Portfolio tracking, live prices, a four-role LLM committee that debates BUY/HOLD/SELL and writes a memo | Specialized in a decision-debate structure. This project is stronger on execution workflow |
| Lumibot | Python trading framework | Manages the strategy lifecycle from backtesting to paper trading to live brokers. Supports Alpaca, IB, Tradier and others | Strong on code-based strategy development and backtesting. A different approach from a no-code workbench |
| TradingAgents | Multi-agent LLM framework | Role-based debate among analysts, bull and bear researchers, a trader and a risk team | Closer to research and demos, with no live broker connection |

The Longbridge, Webull, openinvest, Lumibot and TradingAgents rows are carried over from the attached analysis as written.

## Getting Started

There are five steps from installation to the first query, and live trading is turned on separately at the end. WorkBuddy's menu names change between versions, so go by what your screen shows.

### 1. Prerequisites

- A Futu securities account with identity verification complete. Whether you can open one depends on your country of residence, so check that first.
- The WorkBuddy desktop app. Get the China edition at [workbuddy.cn](https://www.workbuddy.cn/) and the international edition at workbuddy.ai. Custom MCP setup is available only in the desktop app, not the web version ([Atlas Cloud walkthrough](https://www.atlascloud.ai/zh/blog/tips/workbuddy-mcp)).
- Quote permissions for the markets where you need real-time data.

### 2. Choose the model

Open a new chat and pick Hy4 preview in the model selector, usually a dropdown above the chat box or at the lower left ([CSDN guide](https://blog.csdn.net/z17code/article/details/164174326)). The free period is over, so check the credit multiplier, and if the full Hy4 release appears in the list, consider it.

### 3. Connect Futu MCP

1. Open Connectors from the + button to the left of the chat box. If there is a Futu card in the list, click its add button and skip to step 4.
2. If not, click Custom connectors to open the mcp.json editor.
3. Add the Futu endpoint under `mcpServers` and save. Leave existing entries in place.
4. On first add, a trust prompt appears. Click Trust, and when the status changes to Authentication required, click Connect.
5. On the Futu OAuth page that opens in the browser, confirm the account and approve.
6. Back in WorkBuddy, check for the green dot and the tool list.

```json
{
  "mcpServers": {
    "futu-mcp": {
      "type": "http",
      "url": "https://mcp.futunn.com/mcp"
    }
  }
}
```

The endpoint comes from the [Futu MCP docs](https://open.futunn.com/zh-cn/mcp-docs/overview). The config format and the Trust and Connect flow follow the example in the [Tencent Ardot docs](https://docs.ardot.tencent.com/en/ardot-mcp/remote-mcp.html) for adding a remote MCP to WorkBuddy. Whether Futu has published WorkBuddy-specific steps could not be confirmed.

### 4. First prompts

Start with read-only questions and compare the data against the Futu app.

- "Put the current price and today's volume for Tencent (HK.00700) and Nvidia (US.NVDA) in a table, with the time each value was retrieved."
- "Split my holdings into Hong Kong and US, calculate the weights, and show whether each market is in regular, pre-market or after-hours trading right now."
- "Find Hong Kong stocks with RSI below 30 and today's volume more than double the usual, and save them to an Excel file."

### 5. Safety setup

- [ ] Test the full order flow in the simulated trading environment, which is Futu MCP's default.
- [ ] Switch to live trading only after comparing read-only results over several days.
- [ ] Before any order, have the agent print the ticker, quantity, price and account again, and have a person approve.
- [ ] Keep risk rules such as stop-loss limits and per-position weights in a separate file the agent cannot edit.
- [ ] Review Futu's audit log regularly.
- [ ] Save credits by using Ask for lookups, Plan for design, and Craft only for file creation and execution.

The mode split follows the attached analysis. The other safeguards are based on the [Futu guide](https://www.futuhk.com/hans/blog/detail-futu-ai-102-260825010).

## Overall Assessment

This combination is already useful for analysis support such as lookups, organization and report drafts, but it is too early to hand it order execution. The direction is clear: it joins an agent execution environment, an open-weight model and a real broker's tool set to move the LLM from an information summarizer to an assistant that can act.

The weak link is the agent, not the broker. Futu MCP has a simulated default and user confirmation, but an agent reporting a wrong number as correct or rewriting logic on its own happens before that stage. Where similar projects put their weight on broker API stability or risk management spelled out in code, this project's strength is the ease of giving instructions in one integrated environment. With stronger verification and guardrails, it becomes a good option for users who want to set up an investment analysis workflow quickly without code.

This document is a technical assessment based on public information and user reports. It is not advice on any financial product or investment strategy.

## Sources

- [Futu MCP overview](https://open.futunn.com/zh-cn/mcp-docs/overview) (Futu OpenAPI docs)
- [Futu AI complete guide](https://www.futuhk.com/hans/blog/detail-futu-ai-102-260825010) (Futu HK)
- [WorkBuddy connector docs](https://cloud.tencent.com/document/product/1831/134525), [billing](https://cloud.tencent.com/document/product/1831/134334) (Tencent Cloud)
- [Ardot Remote MCP: WorkBuddy setup example](https://docs.ardot.tencent.com/en/ardot-mcp/remote-mcp.html) (Tencent)
- [WorkBuddy MCP walkthrough](https://www.atlascloud.ai/zh/blog/tips/workbuddy-mcp) (Atlas Cloud)
- [Hy4 preview launch summary](https://cloud.tencent.com/developer/article/2733836), [Hy4 in WorkBuddy](https://cloud.tencent.com/developer/article/2745909) (Tencent Cloud developer community)
- [Hy4 preview model card](https://huggingface.co/tencent/Hy4-preview) (Hugging Face)
- [Hy4 preview benchmark comparison](https://mer.vin/news/tencents-hy4-preview-edges-out-glm-5-3-and-kimi-k3/), [OrcaRouter analysis](https://www.orcarouter.ai/blog/tencent-hy4-preview-launch)
- [Coverage of the Hy4 preview free-period notice](https://news.mydrivers.com/1/1147/1147486.htm) (MyDrivers)
- [Tongdaxin MCP marketplace announcement](https://finance.sina.com.cn/wm/2026-06-03/doc-iniacxkh2221676.shtml) (Sina Finance)
- [futu-stock-mcp-server](https://github.com/shuizhengqi1/futu-stock-mcp-server) (GitHub)
- Attached analysis: basis for weaknesses 1, 2, 3 and 5, some similar-project rows, and the mode split
