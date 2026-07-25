---
title: "Robinhood MCP 入门指南"
description: "经过事实核查的Robinhood MCP生态系统指南:官方Agentic Trading MCP及五个社区服务器,包含设置步骤与风险对比。"
abstract: |
  Robinhood的MCP生态系统分为官方Agentic Trading MCP(2026年5月27日上线,测试版,独立代理账户,仅支持股票)和五个社区搭建的服务器,后者分别封装了非官方的robin_stocks API或官方Crypto API。本指南纠正了早期文章中的常见误解,梳理了每条路径的设置步骤,并根据账户资格、资产类别和风险承受能力提供了决策矩阵。
summary_for_ai: |
  面向AI代理的参考说明:本文档截至2026-07-21,并明确纠正了早期草稿中的若干不准确之处,包括过时的工具数量,以及对Robinhood Crypto API和官方Agentic Trading MCP错误的"非官方API"定位。官方交易MCP仅限美国账户使用,处于测试版/邀请制阶段;基于robin_stocks构建的社区服务器由于依赖非官方API,存在账户被封的风险。无论走官方还是社区路径,代理操作造成的损失均由用户自行承担。
lang: zh
featured: false
author: Dennis Kim
date: 2026-07-21
schema_type: TechArticle
---

# Robinhood MCP 入门指南

> 最后核实日期:2026-07-21 | 状态:已根据公开可获得信息完成事实核查
> 相较原文的主要更正:(1)补全了缺失的Robinhood官方Agentic Trading MCP,(2)更正了"大部分为非官方API"的表述,(3)更新了各仓库的安装命令与认证方式至最新状态

---

## 1. 概述

Robinhood MCP(Model Context Protocol)生态系统大致分为**两个层次**。原文只涉及社区仓库,但2026年5月27日Robinhood推出官方MCP服务器后,局面发生了变化。

| 层次 | 性质 | 认证方式 | 风险 |
|------|------|------|--------|
| 官方Agentic Trading MCP | 由Robinhood直接提供,测试版 | OAuth(专用代理账户) | 与专用账户隔离,无法访问主账户资产 |
| 社区MCP服务器 | 第三方(封装robin_stocks等非官方API或官方Crypto API) | 账户密码 / API密钥 / 远程OAuth | 存在账户被封风险,凭据管理责任转嫁给用户 |

**更正说明**:原文"大多数仓库使用非官方API"的说法只对了一半。基于`robin_stocks`的服务器(verygoodplugins、open-stocks-mcp等)确实是非官方的,但Robinhood的**Crypto API是官方API**(采用API密钥+Ed25519私钥认证方式),更重要的是,如今已经存在**官方股票交易MCP**。

---

## 2. 官方:Robinhood Agentic Trading MCP

> 端点:`https://agent.robinhood.com/mcp/trading`
> 说明:https://robinhood.com/us/en/agentic-trading/

Robinhood于2026年5月27日推出的官方代理交易基础设施,从结构上解决了社区仓库一直在绕过的问题(非官方API被封风险、凭据泄露)。

| 项目 | 内容 |
|------|------|
| 上线时间 | 2026-05-27,测试版(通过邮件邀请分批推出) |
| 支持资产 | 股票(equities)。期权分阶段推出中。加密货币、期货、事件合约在路线图中 |
| 账户结构 | 与主账户完全隔离的专用代理账户。代理只能访问存入该账户的资金 |
| 保障机制 | 每笔交易推送通知、实时活动动态、可选的交易前预览确认、一键断开连接、欺诈检测 |
| 支持的代理 | Claude、Claude Code、Claude Desktop、ChatGPT、Codex、Cursor、Grok等广泛的MCP兼容代理 |
| 前提条件 | 状态正常的美国Robinhood个人账户,初始设置仅限桌面端 |

### 连接方法

**Claude Code(终端)**:
```bash
claude mcp add robinhood-trading --transport http https://agent.robinhood.com/mcp/trading
```

**Claude Desktop / Claude.ai**:
1. Settings → Connectors → Add custom connector
2. URL:`https://agent.robinhood.com/mcp/trading`
3. 完成OAuth认证后,在Robinhood手机应用中完成验证步骤

**Codex CLI**:
```bash
codex mcp add robinhood-trading --url https://agent.robinhood.com/mcp/trading
```

### 需要注意的事项

- 处于测试阶段,并非所有用户都能立即获得访问权限(符合条件者会收到邮件通知)
- 代理造成的损失完全由用户自行承担——条款明确规定Robinhood不予赔偿
- 仅限美国账户使用。非居民用户(包括韩国)需考虑社区服务器或其他券商替代方案

---

## 3. 社区仓库分析

### 3.1 verygoodplugins/robinhood-mcp —— 只读研究工具

> https://github.com/verygoodplugins/robinhood-mcp

| 项目 | 内容 |
|------|------|
| 目的 | 只读投资组合研究(不暴露交易功能) |
| 技术栈 | Python,封装robin_stocks(非官方API) |
| 安装 | `pip install robinhood-mcp` 或 `uvx robinhood-mcp` |
| 规模 | GitHub约18个star(小型项目) |

**功能**:投资组合价值、行业集中度、盈亏、股票基本面/新闻/分析师评级、股息分析、财报日历、期权持仓、按成交明细的订单历史。

**补充原文——认证的实际运作方式**(原文遗漏的重要实务信息):
- 若没有TOTP密钥,服务器会进入**等待手机推送批准**状态。必须在`ROBINHOOD_APPROVAL_TIMEOUT`(默认60秒)内在应用中完成批准
- 批准后,会话会缓存到`~/.tokens/robinhood.pickle`,后续调用无需重新登录
- 登录失败的错误会被缓存约5分钟——若要立即重试,需要重启Claude Desktop

**Claude Desktop配置**:
```json
{
  "mcpServers": {
    "robinhood": {
      "command": "uvx",
      "args": ["robinhood-mcp"],
      "env": {
        "ROBINHOOD_USERNAME": "your_email",
        "ROBINHOOD_PASSWORD": "your_password",
        "ROBINHOOD_TOTP_SECRET": "your_2fa_secret"
      }
    }
  }
}
```

---

### 3.2 trayders/trayd-mcp —— 远程完整交易

> https://github.com/trayders/trayd-mcp | 服务器:`https://mcp.trayd.ai/mcp`

| 项目 | 内容 |
|------|------|
| 目的 | 通过Claude(网页版/CLI)交易真实的Robinhood账户 |
| 结构 | 远程服务器(AWS ECS)+ Clerk Google认证,无需本地安装 |
| 凭据 | Robinhood令牌仅保存在内存中(不写入磁盘),重启即消失,登出后立即删除 |
| 特点 | 该类别中唯一可在claude.ai网页应用中运行的交易MCP |

**补充原文**:
- 限价单默认以24小时延长交易时段方式提交
- 报价全天24小时提供——交易时段内为Robinhood实时数据,交易时段外自动回退至合作数据源
- 支持多账户(通过单一连接管理多个Robinhood账户)
- 持久化记忆:基于Markdown笔记的个人知识库,由Claude读写(跨会话保留)
- 与Claude Code的`/loop`结合使用,可构建基于计划任务的自动交易代理(例如"每5分钟检查持仓,下跌3%时卖出")

**设置(Claude.ai网页版)**:
1. Settings → Connectors → Add custom connector
2. 名称:`trayd` / URL:`https://mcp.trayd.ai/mcp`
3. Connect → 使用Google登录 → 在聊天中输入"Link my Robinhood account" → 通过手机2FA确认

**设置(Claude Code)**:
```bash
claude mcp add --transport http trayd https://mcp.trayd.ai/mcp --scope user
```

**风险评估**:凭据以传递(pass-through)方式经过远程服务器。代码是公开的,但用户无法验证实际运行的服务器是否与公开代码一致。如果符合官方Agentic Trading的资格,从信任模型角度来看官方路径更优。

---

### 3.3 kevin1chun/robinhood-for-agents —— 多代理工具包

> https://github.com/kevin1chun/robinhood-for-agents

| 项目 | 内容 |
|------|------|
| 目的 | 面向股票、期权、加密货币交易的AI代理集成(双模式:MCP工具或直接调用TypeScript客户端) |
| 技术栈 | TypeScript、Bun v1.3+、Chrome(通过浏览器自动登录捕获OAuth令牌) |
| 兼容性 | Claude Code、Codex、OpenClaw等。交互式引导流程会自动检测代理类型 |
| 许可证 | MIT-0 |

**对原文的更正**:
- 原文中"49个MCP工具"是某个时间点的数字,会随版本变化。本文档不再列出具体工具数量,而是描述为"MCP工具或TypeScript客户端的双模式"
- Claude Code手动注册命令已发生变化。不再是原文中的`bunx robinhood-for-agents`,而是按照当前README:

```bash
claude mcp add -s user robinhood-for-agents -- bun run /path/to/bin/robinhood-for-agents.ts
```

**安装(推荐——交互式引导)**:
```bash
npx robinhood-for-agents onboard
# 或指定代理
npx robinhood-for-agents onboard --agent claude-code
```

同时支持本地运行和Docker/远程主机部署,可在引导过程中选择。

**安全提示**:该工具通过Chrome自动化从登录会话中捕获OAuth令牌。虽然从工作原理上讲是合理的,但属于敏感操作模式,建议使用前先审查代码。

---

### 3.4 Open-Agent-Tools/open-stocks-mcp —— 多券商支持

> https://github.com/Open-Agent-Tools/open-stocks-mcp

| 项目 | 内容 |
|------|------|
| 目的 | 支持Robinhood + Charles Schwab的多券商MCP服务器 |
| 技术栈 | Python、HTTP/STDIO传输、支持Docker |
| 交易 | 已通过实盘验证的股票、期权下单功能(Robinhood) |
| 安装 | `pip install open-stocks-mcp`(源码开发时使用`uv sync`) |

**配置**(`.env`):
```env
ROBINHOOD_USERNAME=your_email@example.com
ROBINHOOD_PASSWORD=your_password
# 同时使用Schwab时
SCHWAB_API_KEY=your_api_key
SCHWAB_APP_SECRET=your_app_secret
SCHWAB_CALLBACK_URL=https://127.0.0.1:8182/
ENABLED_BROKERS=robinhood,schwab
```

**运行与验证**:
```bash
open-stocks-mcp-server --transport http --port 3001
curl http://localhost:3001/health
curl http://localhost:3001/metrics   # Prometheus指标
```

Schwab一侧使用官方OAuth,但Robinhood一侧依赖非官方的robin_stocks API。

---

### 3.5 robinhood-mcp(npm)—— 仅支持Crypto API

> https://www.npmjs.com/package/robinhood-mcp

| 项目 | 内容 |
|------|------|
| 目的 | Robinhood**官方Crypto API**的执行工具包 |
| 技术栈 | TypeScript/Node.js |
| 认证 | API密钥 + Base64编码私钥(不需要账户密码——在这方面比robin_stocks系列更安全) |

**更正**:原文将该包归入"非官方"类别,但Robinhood Crypto API是官方提供的API。不过原文提出的警告——**没有沙箱环境,所有订单均以真实资金执行**——是准确的,依然完全有效。

**保障机制**(保留原文,已验证):

| 防护措施 | 说明 |
|------|------|
| 独立二进制文件 | 数据专用服务器中未注册交易工具 |
| 显式opt-in | 必须设置`ROBINHOOD_CRYPTO_ENABLE_TRADING=1` |
| 单笔订单美元上限 | 默认超过$100即拒绝 |
| 每日累计上限 | 限制每日总交易额 |
| 交易对白名单 | 仅可交易指定的交易对 |
| 仅买入模式 | 设置`ROBINHOOD_CRYPTO_BUY_ONLY=1`时拒绝卖出 |
| 防护模式 | 默认设置:未经确认不执行订单 |
| 紧急停止开关 | `risk_kill_switch_engage`可停止所有执行 |

```bash
npm install -g robinhood-mcp
export ROBINHOOD_CRYPTO_API_KEY="your_api_key"
export ROBINHOOD_CRYPTO_PRIVATE_KEY="your_base64_private_key"
export ROBINHOOD_CRYPTO_ENABLE_TRADING=1   # 仅交易时设置
robinhood-mcp
```

---

### 3.6 rohitsingh-iitd/robinhood-mcp-server —— Crypto REST/WebSocket

> https://github.com/rohitsingh-iitd/robinhood-mcp-server

原文内容基本仍然有效。基于Python 3.8+和FastAPI,将官方Crypto API以REST(`:8000`)+ WebSocket(`:8001`)形式对外暴露。不过作为个人项目,维护活跃度不高,若用于生产环境,3.5中的npm包在保障机制方面更为安全。

---

## 4. 选择指南(更正版)

| 使用目的 | 首选 | 备注 |
|-----------|-------|------|
| 拥有美国账户 + 股票自动交易 | **官方Agentic Trading MCP** | 唯一的官方路径,专用账户隔离 |
| 仅查看投资组合、进行研究 | verygoodplugins/robinhood-mcp | 不暴露交易功能,从源头杜绝误操作下单 |
| 在claude.ai网页应用中即时交易 | trayd-mcp | 零安装,但需要信任远程服务器 |
| 加密货币交易(注重保障机制) | npm robinhood-mcp | 官方Crypto API,美元上限、紧急停止开关 |
| 同时使用Robinhood + Schwab | open-stocks-mcp | 唯一的多券商方案 |
| Claude以外的多种代理 | robinhood-for-agents | 支持Codex、OpenClaw等 |

**决策原则**:如果符合官方Agentic Trading的资格,就使用官方方案。社区服务器存在的意义仅限于以下四种缺口:(1)尚未收到测试版邀请,(2)加密货币等未支持的资产,(3)仅供查看的研究用途,(4)多券商支持。

---

## 5. 快速开始:三条路径

### 路径A —— 官方(股票交易,推荐)

```bash
# 1. 在Robinhood应用/网页开设代理账户并存入资金(需桌面端操作)
# 2. 在Claude Code中注册
claude mcp add robinhood-trading --transport http https://agent.robinhood.com/mcp/trading
# 3. 重启Claude Code → /mcp → 选择robinhood-trading → 完成OAuth认证
# 4. 在手机应用中批准验证步骤
```

### 路径B —— 零安装(trayd)

```bash
claude mcp add --transport http trayd https://mcp.trayd.ai/mcp --scope user
# /mcp → trayd → Authorize → 使用Google登录 → "Link my Robinhood account"
```

### 路径C —— 本地只读(研究用途)

```bash
pip install robinhood-mcp
export ROBINHOOD_USERNAME="your_email@example.com"
export ROBINHOOD_PASSWORD="your_password"
export ROBINHOOD_TOTP_SECRET="your_totp_secret"   # 若无此项,需等待60秒的应用推送批准
uvx robinhood-mcp
```

---

## 6. 注意事项(更正版)

1. **API性质区分**:官方Agentic Trading MCP(股票)和Crypto API均为官方性质。仅基于robin_stocks的服务器(verygoodplugins以及open-stocks-mcp中的Robinhood部分)属于非官方,可能被随时封禁且存在账户被处罚的风险。
2. **无沙箱环境**:Crypto API没有测试环境。建议采用社区服务器常用的限价测试方法(下一个价格过低、不可能成交的限价单后再取消)仅验证连接是否正常。
3. **凭据管理**:通过环境变量传递账户密码的方式(robin_stocks系列)最为脆弱。优先顺序为:官方OAuth > Crypto API密钥 > 远程传递 > 密码环境变量。
4. **司法管辖**:官方Agentic Trading仅限美国个人账户,且处于测试版/邀请制阶段。非美国居民无法使用本文档所述的官方路径。
5. **责任归属**:所有路径下,代理操作造成的损失均由用户自行承担。Robinhood明确表示,即使通过官方路径,也不会对代理造成的损失进行赔偿。
6. **监管动态**:SEC和CFTC正在审议现行监管规则应如何适用于AI代理执行订单的场景。运行自动化策略时应持续关注监管变化。
