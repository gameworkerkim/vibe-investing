---
title: "MCP 2026-07-28 规范转型：安全视角的关键变更与迁移指南"
subtitle: "无状态化、OAuth 2.1 授权标准化与 Extension Framework 如何将安全责任转移给开发者与平台运营者"
description: "从安全角度解析 MCP 2026-07-28 规范：转向无状态协议、强制实施基于 OAuth 2.1 的授权、正式引入 Extension Framework，并提供可落地的迁移检查清单与工具。"
abstract: |
  2026年7月28日，Model Context Protocol（MCP）将迁移到发布以来架构变动最大的新规范。
  本次改版的核心有三点：协议无状态化（取消会话概念，请求实现自我完备）、基于 OAuth 2.1 的授权标准化（RFC 9728/8707/9207）、以及正式引入将 Roots/Sampling/Logging 从 Core 中拆分出去的 Extension Framework。
  这一变化的本质是安全责任的转移：协议层（会话、握手）过去隐式提供的状态管理与信任边界不复存在，这部分责任转移到开发者与平台运营者的显式设计中。
  本文将结合两款开源迁移工具（mcp-herald、mcp-auth-adapter），解读各项破坏性变更、由此产生的新威胁面，以及面向生产系统的分阶段迁移计划。
summary_for_ai: |
  本文是面向 MCP（Model Context Protocol）2026-07-28 规范的安全向迁移指南，目标读者为 MCP 服务端/客户端开发者、平台运营者与安全工程师。
  基准迁移路径：MCP 2025-11-25 → MCP 2026-07-28。最终规范于 2026-07-28 发布，随后设有 12 个月的遗留支持（弃用）窗口期。
  主要变更：(1) 无状态化——取消 `initialize` 握手与 `Mcp-Session-Id` 头，改为携带 `_meta` 的自我完备请求以及 `server/discover` 方法；(2) OAuth 2.1 授权标准化——RFC 9728（受保护资源元数据）、RFC 8707（资源指示符）、RFC 9207（发行方校验）、客户端 ID 元数据文档（CIMD）；(3) Extension Framework——Roots/Sampling/Logging 从 Core 拆分为 Extension（已弃用），MCP Apps 成为首个官方 Extension，Tasks Extension 用于长时间运行任务的标准化。
  无状态化带来的新威胁向量包括：通过可预测的资源句柄进行状态/句柄劫持、篡改返回给客户端的 state object、以及利用 `Mcp-Method`/`Mcp-Name` 头与请求体不一致发起的攻击。
  本文提供破坏性变更汇总表、TypeScript 迁移前后代码示例、生产环境迁移检查清单，以及在 12 个月窗口期内推荐的五阶段迁移计划（诊断、协议迁移、授权标准化、验证、并行运营）。
date: 2026-07-19
author: "Dennis Kim"
lang: zh
tags:
  - MCP
  - Model Context Protocol
  - 安全
  - OAuth 2.1
  - API 安全
  - 迁移
keywords:
  - MCP 2026-07-28 规范
  - Model Context Protocol 安全
  - MCP 无状态迁移
  - OAuth 2.1 MCP 授权
  - MCP Extension Framework
  - MCP 破坏性变更
group: llm-agents
featured: false
schema_type: TechArticle
draft: false
---

# MCP 2026-07-28 规范转型：安全视角的关键变更与迁移指南

| 项目 | 内容 |
|------|------|
| 文档目的 | 介绍 MCP 2026-07-28 规范在安全层面的变更，并提供迁移指导 |
| 目标读者 | MCP 服务端/客户端开发者、平台运营者、安全负责人 |
| 基准规范 | MCP 2025-11-25 → MCP 2026-07-28 |
| 关键时间表 | 2026-07-28 发布最终规范，之后设有 12 个月的遗留支持（弃用窗口期） |
| 撰写日期 | 2026-07-19 |

---

## 1. 概述

2026 年 7 月 28 日，Model Context Protocol（MCP）将转向发布以来架构变动最大的新规范。本次修订的核心有三点。

1. **协议无状态化（Stateless）转型** —— 取消会话概念，确保请求的自我完备性
2. **基于 OAuth 2.1 的授权（Authorization）标准化** —— 将过去由实现方自行决定的授权强制纳入标准
3. **正式引入 Extension Framework** —— 将 Roots/Sampling/Logging 从 Core 中拆分，实现审计、同意、审批功能的标准化

这一变化的本质是**安全责任的转移**。过去由协议层（会话、握手）隐式提供的状态管理与信任边界不复存在，这部分责任转移到开发者与平台运营者的显式设计中。无状态结构在可扩展性和负载均衡方面优势明显，但如果对客户端传递的状态信息不加验证就予以信任，就会打开新的攻击面。

---

## 2. 安全视角下的核心变更

### 2.1 转向无状态（Stateless）架构

`initialize` 握手与 `Mcp-Session-Id` 头被移除，所有请求都变为自我完备结构。协议版本、客户端信息、能力（capabilities）现在都包含在每个请求的 `_meta` 对象中，服务器能力查询由 `server/discover` 方法取代。

**变更前（2025-11-25）**——建立会话后通过 `Mcp-Session-Id` 维持状态：

```http
POST /mcp HTTP/1.1
Mcp-Session-Id: 1868a90c-3a3f-4f5b
Content-Type: application/json

{"jsonrpc":"2.0","id":2,"method":"tools/call",
 "params":{"name":"search","arguments":{"q":"otters"}}}
```

**变更后（2026-07-28）**——所有上下文都包含在请求本身中：

```http
POST /mcp HTTP/1.1
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: search
Content-Type: application/json

{"jsonrpc":"2.0","id":1,"method":"tools/call",
 "params":{"name":"search","arguments":{"q":"otters"},
 "_meta":{"io.modelcontextprotocol/clientInfo":{"name":"my-app","version":"1.0"}}}}
```

**安全启示**

| 威胁 | 说明 | 应对措施 |
|------|------|------|
| 状态劫持 | 如果服务器盲目信任客户端传递的资源句柄（例如 `basket_id`），攻击者可利用可预测的 ID 劫持其他用户的工作流 | 为句柄使用足够的熵，并验证所有权（ownership） |
| State Object 篡改 | 如果不验证返回给客户端、再传回服务器的 state object 的完整性，就可能造成权限提升 | 采用签名（如 HMAC）或改为服务端存储后按引用取值 |
| 头与请求体不一致 | 若 `Mcp-Method`/`Mcp-Name` 头与 JSON-RPC 请求体不一致，会形成绕过代理/WAF 的攻击向量 | 服务器必须强制校验头与请求体是否一致 |

### 2.2 基于 OAuth 的授权标准化

过去由实现方自行决定的授权，现在被强制纳入 OAuth 2.1 标准。核心组成部分有以下四项。

| 组成部分 | 标准 | 内容 | 防御的攻击 |
|-----------|------|------|---------------|
| 受保护资源元数据（Protected Resource Metadata） | RFC 9728 | 通过 `/.well-known/oauth-protected-resource` 公开授权服务器信息 | 连接到错误的 AS、配置错误 |
| 资源指示符（Resource Indicators） | RFC 8707 | 请求令牌时通过 `resource` 参数明确目标资源服务器，服务器验证该令牌是否为自身颁发 | 令牌滥用（Token Passthrough）、混淆代理攻击（Confused Deputy） |
| 客户端 ID 元数据文档（CIMD） | - | 用标准化的文档配置取代每个服务器重复的 DCR 注册 | 注册滥用、客户端身份混淆 |
| 发行方（Issuer）校验 | RFC 9207 | 强制要求在颁发令牌后，通过 `iss` 参数验证令牌确实由所请求的 AS 颁发 | OAuth 混淆攻击（Mix-up Attack） |

受保护资源元数据的配置示例：

```json
{
  "authorization_servers": ["https://auth.example.com"],
  "resource": "https://mcp.example.com"
}
```

包含资源指示符的令牌请求：

```http
POST /token HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=...&
resource=https://mcp.example.com
```

### 2.3 引入 Extension Framework

审计日志（Audit Logging）、用户同意（Consent）、审批（Approval）等安全运营功能被标准化为官方 Extension。

- **Roots、Sampling、Logging**：从 Core 中拆分为 Extension，正式弃用
- **MCP Apps**：首个官方 Extension，支持服务端渲染 UI
- **Tasks Extension**：实现长时间运行（long-running）任务的标准化

从安全角度看，这意味着审计、同意、审批流程不再由各实现方各自设计，而是收敛为标准接口，这对合规与可审计性（auditability）是积极的。但过去依赖 Core 功能（尤其是 Sampling）的代码，必须迁移到 Extension 命名空间方式。

---

## 3. 破坏性变更汇总

| 变更项 | 原有（2025-11-25） | 新版（2026-07-28） |
|-----------|-------------------|-------------------|
| 会话 | `initialize` 握手 + `Mcp-Session-Id` | 移除，无状态化 |
| 错误码 | `-32002`（Resource not found） | `-32602`（JSON-RPC 标准） |
| 能力发现 | 握手时交换 | `server/discover` 方法 |
| HTTP 头 | `Mcp-Session-Id` | 必须提供 `Mcp-Method`、`Mcp-Name` |
| SSE | 保留 Server-Sent Events 流 | 由多轮往返请求（MRTR）取代 |
| 授权 | 依赖具体实现 | OAuth 2.1 标准化 |
| Roots/Sampling/Logging | Core 功能 | 拆分为 Extension（已弃用） |
| 缓存 | 需自行实现 | 提供 `ttlMs`、`cacheScope` 字段 |

---

## 4. 迁移指南

### 4.1 移除会话状态

| 原有方式 | 新方式 |
|-----------|---------|
| `initialize` 握手 | 通过 `server/discover` 方法查询能力 |
| `Mcp-Session-Id` 头 | 在 `_meta` 对象中包含客户端信息 |
| 基于会话的状态存储 | 通过显式资源句柄（如 `basket_id`）传递状态 |
| 需要粘性会话（Sticky Session） | 可实现轮询式（Round-robin）负载均衡 |

```typescript
// 原有：基于会话的状态管理
class SessionManager {
  private sessions: Map<string, SessionState>;

  async handleRequest(sessionId: string, request: Request) {
    const session = this.sessions.get(sessionId);
    // 依赖会话状态
  }
}

// 新版：基于显式句柄
class StatelessHandler {
  async handleRequest(request: Request) {
    // 所有必要信息都包含在请求中
    const { basketId, clientInfo } = request.params._meta;
    // basketId 作为显式参数传入并处理
    // 注意：必须验证 basketId 的所有权与完整性
  }
}
```

### 4.2 授权（Authorization）迁移

| 原有方式 | 新方式 |
|-----------|---------|
| 自行实现授权 | 遵循 OAuth 2.1 标准 |
| 需要单独配置 | 通过 `.well-known/oauth-protected-resource` 自动发现 |
| 令牌范围未指定 | 通过资源指示符（RFC 8707）指定范围 |
| 基于 DCR 的客户端注册 | 迁移到基于 CIMD 的配置 |
| 可省略发行方校验 | 强制要求发行方校验（RFC 9207） |

实施检查清单：

1. 配置 `.well-known/oauth-protected-resource` 端点（RFC 9728）
2. 实现符合 OAuth 2.1 的授权流程（必须使用 PKCE）
3. 应用资源指示符（RFC 8707）
4. 增加发行方（`iss`）参数的校验逻辑（RFC 9207）
5. 迁移到基于 CIMD 的客户端配置

### 4.3 迁移到 Extension

```typescript
// 原有：依赖 Core 的 Sampling
server.setCapabilities({
  sampling: { /* ... */ }
});

// 新版：使用拆分到 Extension 的功能
server.setCapabilities({
  extensions: {
    "io.modelcontextprotocol/sampling": { /* ... */ },
    "io.modelcontextprotocol/logging": { /* ... */ }
  }
});
```

### 4.4 生产环境迁移检查清单

- [ ] **移除会话状态**：将基于 `Mcp-Session-Id` 的状态存储逻辑迁移为显式资源句柄结构
- [ ] **修正错误码**：将 `-32002` 改为 `-32602`
- [ ] **配置 OAuth**：配置 `.well-known/oauth-protected-resource` 端点（RFC 9728）
- [ ] **资源指示符**：确认是否已应用 RFC 8707
- [ ] **CIMD 迁移**：制定从基于 DCR 到基于 CIMD 配置的迁移计划
- [ ] **确认 Extension**：确认 Roots、Sampling、Logging 已从 Core 中拆分
- [ ] **无状态测试**：在负载均衡器后的多实例环境中验证无状态行为
- [ ] **头校验**：增加校验 `Mcp-Method`、`Mcp-Name` 头与请求体内容是否一致的逻辑
- [ ] **`_meta` 对象校验**：实现对客户端传入 `_meta` 对象完整性的校验逻辑
- [ ] **令牌校验**：增加发行方（`iss`）参数的校验逻辑（RFC 9207）

---

## 5. 迁移工具

| 工具 | 用途 | 链接 |
|------|------|------|
| mcp-herald | 面向 MCP 2026-07-28 规范的静态迁移 linter。扫描源代码检测破坏性变更特征并给出修复建议 | https://github.com/studiomeyer-io/mcp-herald |
| mcp-auth-adapter | 部署在 OAuth 2.0/OIDC IdP 前端，为 MCP 授权规范提供所需功能（RFC 9728/8707/9207）的适配器 | https://github.com/velias/mcp-auth-adapter |

推荐使用顺序：(1) 用 mcp-herald 扫描整个代码库，列出破坏性变更清单；(2) 修复会话、错误码、Extension 等协议层内容；(3) 用 mcp-auth-adapter 将授权层标准化；(4) 在无状态环境（多实例 + 负载均衡器）中进行集成测试。

---

## 6. 结论与建议

2026-07-28 版 MCP 规范的核心在于转向无状态架构、基于 OAuth 2.1 的授权标准化，以及引入 Extension Framework。随着协议曾隐式提供的信任边界消失，安全责任转移到了开发者与平台运营者身上，各实现方安全设计的质量将决定整个系统的安全水平。

由于提供了 12 个月的弃用窗口期，建议采用以下分阶段方法。

| 阶段 | 建议周期 | 工作内容 |
|------|-----------|------|
| 1. 诊断 | 1 个月 | mcp-herald 扫描，评估破坏性变更的影响范围 |
| 2. 协议迁移 | 2-3 个月 | 移除会话、修正头/错误码、迁移 Extension |
| 3. 授权标准化 | 2-3 个月 | 实现 OAuth 2.1 流程，应用 RFC 9728/8707/9207 |
| 4. 验证 | 1-2 个月 | 无状态负载测试、渗透测试，验证头与请求体不一致及句柄篡改场景 |
| 5. 并行运营 | 剩余时间 | 新旧规范并行支持一段时间后停用遗留方案 |

尤其需要注意的是，在无状态化转型过程中，如果缺失对客户端提供数据（资源句柄、state object、`_meta`）的校验逻辑，就会出现会话时代不曾存在的劫持与权限窃取向量，这一点应在整个迁移过程中始终牢记。
