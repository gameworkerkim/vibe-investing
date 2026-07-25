---
title: "在 Cloudflare 免费套餐上实际运营的方法——VibeQuant 运营案例"
description: "记录 VibeQuant 为何以及如何完全基于 Cloudflare 免费套餐设计和运营的实务案例，而非泛泛的注册教程，涵盖真实的运营决策、踩过的坑，以及不与免费额度冲突的技术栈。"
abstract: |
  本文并非重复通用的注册步骤，而是记录 VibeQuant 为何以及如何仅使用 Cloudflare 免费套餐进行设计与运营。
  文中涵盖 Cloudflare 的优点(安全、CDN、无服务器集成)与缺点(每日请求/CPU 限制、KV 写入限制、原生 Python 支持薄弱)，
  并与 Vercel、Netlify、Railway 等 PaaS 进行对比，最后给出一套以零基础设施成本运营对 SEO 与 AI 搜索友好的研究档案库的技术栈
  (Markdown → 静态 HTML + TypeScript 边缘 API + Pyodide)及设计原则。
summary_for_ai: |
  完全基于 Cloudflare 免费套餐(Pages + Workers + Cache API/KV)运营 vibequant.cc 的实务案例。
  优点：边缘自动 HTTPS/DDoS 缓解，Pages 静态资源近乎无限的带宽，R2 出站流量免费，Pages + Workers/Functions + Cache/KV + R2/D1 在单一账户内集成的无服务器架构。
  缺点：Workers 免费额度约为每日 10 万次请求，每次请求 CPU 约 10ms，KV 写入上限约每日 1,000 次，Python 基于 Pyodide/WASM(不支持原生 numpy 或重量级 C 扩展)，
  长时间运行的 Node 后端或 WebSocket 更适合部署在 Vercel/Railway/Fly.io 上。
  推荐技术栈：以 GitHub 上的 Markdown 作为内容源，构建静态 HTML 部署到 Pages，边缘 API 使用 TypeScript(Workers/Pages Functions)，读取优先使用 Cache API 而非 KV，
  会占用服务器 CPU 配额的量化实验放在浏览器端的 Pyodide 中运行。
  维持免费套餐的设计原则：构建期生成 HTML 而非运行时渲染、积极缓存、避免 KV 写入、将重计算交给客户端浏览器、避免依赖 TCP 或本地运行时假设的架构(Prisma+Neon TCP、Puppeteer)。
  文中包含最小化搭建清单(账户、Wrangler CLI、Pages 部署、Worker 部署)，以及实际运营中踩过的十个坑
  (未连接子域名出现 522、中间件误将某路径整体屏蔽、启用 R2 需要绑定支付方式、代理环境变量导致 wrangler 部署失败等)。
date: 2026-07-24
author: "Dennis Kim"
lang: zh
tags:
  - Cloudflare
  - 免费套餐
  - Workers
  - Pages
  - 无服务器
  - VibeQuant
keywords:
  - Cloudflare 免费套餐
  - Cloudflare Workers 限制
  - Cloudflare Pages 部署
  - VibeQuant 架构
  - Pyodide 浏览器量化
  - Wrangler CLI
featured: false
schema_type: TechArticle
draft: false
---

# 在 Cloudflare 免费套餐上实际运营的方法——VibeQuant 运营案例

> 撰写时间：2026-07-24 · 目标读者：希望在**不升级到付费方案**的前提下运营个人网站、独立研究项目或小型开源站点的开发者
> 相关文档：[Cloudflare 免费套餐注册与限制指南](Cloudflare%20free%20tier%20guide.md) · [Vercel 分析](../vercel/vercel_analysis.md) · [免费网站托管对比](../Free_Hosting/FreeHosting.md) · 网站 [vibequant.cc](https://vibequant.cc/)

本文并非“没有实际运营经验、靠搜索和 LLM 拼凑出来的操作手册”，而是记录**[VibeQuant](https://vibequant.cc/) 为何以及如何仅依靠 Cloudflare 免费套餐进行设计和运营**的过程。
注册流程、限额与配额数字请参考现有的[注册与限制指南](Cloudflare%20free%20tier%20guide.md)。

---

## 1. 什么是 Cloudflare？

Cloudflare 最初凭借**DNS、CDN、DDoS 防护**在边缘网络公司中崭露头角。业内常将其部署在 Web3、交易所以及流量波动较大的服务前端。进入 2020 年代后，它扩展为一个**开发者平台**，将 **Workers(无服务器)、Pages(静态/SSR)、R2(对象存储)、D1(SQLite)、KV、Cache API** 等整合到同一账户中，在**同一边缘节点**上同时处理“域名前端安全 + 全球分发 + 轻量后端”。近期还新增了 **Workers AI、AI Gateway** 等 AI 相关产品。

一句话概括：

> **无论流量来自何处，都在最近的 PoP 节点处理 HTML、API 与缓存，尽可能消除源站服务器成本。**

即使是免费方案(虽有限制)也可以使用自定义域名、HTTPS、CDN、基础 WAF/机器人缓解，以及 Pages 和 Workers。这非常适合像 VibeQuant 这样**内容归档 + 轻量 API + 浏览器端量化实验**的场景。

我购买了自定义域名，因此实际支出**只有域名费用**。仅用 `*.pages.dev` 也能运行，但拥有独立域名对 SEO 和品牌建设更有利。

---

## 2. 优点

### 2.1 安全性

作为以 DDoS 防护起家的公司，Cloudflare 会在流量前端过滤异常请求。

| 项目 | 含义 |
|------|------|
| 自动 HTTPS / TLS | 减轻证书续期负担 |
| DDoS/机器人缓解 | 即使源站薄弱，也能在边缘被吸收 |
| DNS 与平台一致 | 只要域名服务器指向 Cloudflare，CDN、WAF、Pages 就能形成一体化流程 |
| 密钥只存在于 Worker 中 | 自然形成不在 Pages HTML 中放置 API 密钥的结构 |

如果站点主要是静态 HTML，这就构成了**源站服务器不对外暴露**的架构：攻击流量首先撞上的是**Cloudflare 边缘**，而不是应用服务器的 CPU。
不过，免费套餐仍然存在**每日边缘额度和公平使用政策**的限制。减少对源站的冲击是一方面，额度耗尽和服务条款问题则是另一方面(见第 3、8 节)。

### 2.2 CDN(带宽几乎免费)

Pages 的静态资源可以以近乎**无限带宽**的方式使用(受公平使用政策/服务条款约束)。R2 的核心差异化优势是**出站流量免费**。这意味着“专栏、TechDoc 的 HTML 越来越多”不会带来“传输费用爆炸”的问题——这与 Vercel Hobby 方案每月带宽上限及超额计费的结构形成对比。

### 2.3 无服务器集成性

单一账户大致可以组合出如下结构：

```
Pages (HTML/SEO)  +  Pages Functions / Workers (API)
      +  Cache API · KV (缓存)
      +  R2 / D1 (存储)
      +  自定义域名 · 子域名
```

无需将“静态网站放在 A 公司、API 放在 B 公司、CDN 用 C 公司”这样拆分。VibeQuant 的角色划分是：**内容使用 Pages 静态 HTML**，**行情/研究 API 使用 Worker/Pages Functions**，**浏览器端量化使用 Pyodide**。

对于个人或小规模的**静态站点 + 轻量边缘 API**场景，这意味着更少的故障点和更简单的维护工作。

### 2.4 其他实际优势

- **无需信用卡**即可开始使用 Workers/Pages(部分产品如 R2 视产品和时间点可能要求绑定支付方式——见第 8 节)
- 即使没有域名，也可通过 `*.pages.dev`/`*.workers.dev` 进行原型开发
- Wrangler CLI 提供本地与线上一致的部署脚本
- 与“GitHub Markdown → 静态 HTML 构建”的流程配合良好(有利于 SEO/GEO)

---

## 3. 缺点

坦率地说。如果把免费套餐误解为“无限制 PaaS”，会立刻遇到问题。

| 缺点 | 说明 |
|------|------|
| **每日请求/CPU 限制** | Workers 免费额度大约为**每日 10 万次请求**，每次请求 CPU 约 **10ms**。如果在高峰期耗尽，可能会被阻塞至 UTC 午夜(韩国时间 09:00) |
| **KV 写入限制** | 免费 KV 写入每天约 1,000 次，非常紧张。不适合会话或实时计数器场景 → **优先使用 Cache API** 是实务中的做法 |
| **原生 Python 支持较弱** | Workers 的 Python 基于 Pyodide/WASM。`numpy`、重量级 C 扩展、长时间运行的任务都难以部署在边缘 |
| **冷启动/运行时限制** | 完整的 Node 后端(长时间后台任务、WebSocket、任意二进制文件)往往在 Vercel/Railway 上更省心 |
| **调试体验** | 在熟悉之前，本地复现和日志查看可能会让人感到不便 |
| **供应商边界** | Durable Objects、部分 AI 功能、高级 WAF 均为付费功能。“完全免费即可企业级”只是幻想 |
| **子域名/项目分散** | 将自定义主机接入多个 Pages 项目后，DNS、中间件、重定向会变得复杂(VibeQuant 通过单一枢纽项目 + 路径路由进行了简化) |
| **服务条款/公平使用** | 即便带宽“无限”，也可能因滥用、攻击或大规模商业分发而受到限制 |

**小结：** 在安全、CDN 以及“静态 + 轻量 API”场景中表现强劲，但**重量级后端、需要强一致性的数据库、长时间运行的 Python**更适合放在其他平台上。

当流量或职责超出承受范围时，**按角色**混合使用不同服务：例如读缓存用 Upstash Redis，长任务/Python API 用 Render/Railway，Next.js 全栈实验用 Vercel(需确认条款与带宽)。不要“简单地叠加 Vercel”，而应**只接入符合额度与条款的那一部分**。

---

## 4. 竞争服务(包括 Vercel 等 PaaS)

| 服务 | 定位 | 相较 Cloudflare |
|--------|--------|-----------------|
| **[Vercel](../vercel/vercel_analysis.md)** | 面向 Next.js 优化的 PaaS，开发体验一流 | Hobby 方案存在商业使用限制、带宽上限及超额计费风险。对 Next.js 全栈应用很有吸引力；对于**流量较大的静态档案库**，CF 通常更具优势 |
| **Netlify** | JAMstack、表单、构建流水线 | 免费额度(如构建分钟数)呈收紧趋势 |
| **GitHub Pages** | 文档、作品集 | 在无服务器 API、边缘缓存、集成 WAF 方面较弱。作为**原始 Markdown 的存档库**表现最佳(VibeQuant 采用 GitHub + CF 双重结构) |
| **Railway / Render / Fly.io** | 容器、长时间运行进程 | 存在休眠、时间限制、升级付费的压力。适合 Python API 服务器 |
| **Firebase Hosting** | Google 生态 | 与 Auth/Firestore 结合时表现强劲 |
| **AWS Amplify / Azure Static Web Apps** | 依赖云厂商生态 | 适合与企业 IAM 或现有云环境集成的场景。个人免费运营时 CF 通常更简单 |
| **Oracle Cloud Free** | Always Free 虚拟机 | IaaS。管理负担更高，控制权也更高——参见[单独指南](../OracleCloud/02.%20Oracle%20Cloud%20Free%20Tier%20Guide.md) |

选型经验法则：

- **以 Next.js App Router 为核心的产品** → 先考虑 Vercel，但要先阅读成本与条款再开始
- **Markdown 档案库 + SEO + 轻量 API + 零成本** → Cloudflare Pages(+ Workers)
- **长时间运行的 Python / 数据库工作进程** → Railway、Render、Fly，或使用独立 VPS，前端仅接入 Cloudflare

相比把一切都锁定在 AWS 上，初期成本通常更低。由于 DDoS 和爬取会在**源站前端**被拦截，源站服务器瞬间崩溃的情况会大幅减少。但**边缘额度与公平使用限制**依然存在(见第 3 节)。

---

## 5. 高效的开发语言与技术栈

一套在免费套餐下**更少产生冲突**的组合。如果后端逻辑复杂，就将其拆分到外部服务。

### 5.1 推荐技术栈(VibeQuant 模式)

| 层级 | 技术 | 理由 |
|------|------|------|
| 内容源 | **Markdown(GitHub)** | 版本控制、PR 流程、AI 搜索(如 DeepWiki)、人类可读性 |
| 发布层 | **静态 HTML**(构建脚本) | 部署到 Pages，配合 Core Web Vitals、OG 标签、sitemap、`llms.txt` |
| 边缘 API | **JavaScript/TypeScript**(Workers、Pages Functions) | 运行时的一等公民，与 `fetch`、Cache API 配合良好 |
| 浏览器端量化 | **Python + Pyodide** | 不占用服务器 CPU 配额。GS Quant 风格的实验在客户端运行 |
| 缓存 | **Cache API**(优先)· KV(以读取为主) | 规避 KV 写入限制 |
| 密钥 | Worker 环境变量 / `wrangler secret` | 严禁将密钥打包进前端 |

### 5.2 应避免或“移出边界”的做法

- 在 Workers 上运行**重量级 numpy/pandas 批处理任务**——改为浏览器端 Pyodide 或外部 PaaS
- 类似 **Prisma + Neon TCP** 的长连接——需要针对 Pages Functions 重新设计(改为 REST/HTTP 客户端 + 缓存)
- **Puppeteer / 本地文件系统**——边缘环境中不存在，需要预先构建输出或使用其他运行时
- **每次请求都调用 LLM**——需要缓存、注意每日额度和成本。可从 Worker 调用如 DeepSeek 等服务，但要**缓存结果**

### 5.3 语言选择一句话总结

> **边缘用 TypeScript，文档用 Markdown，量化实验用浏览器端 Python。**
> 这个三角组合与 Cloudflare 免费套餐配合得很好。强行套用不匹配的技术栈，往往会在完整度、稳定性和延迟上付出代价。

---

## 6. 网站是如何开发的？——设计与理念

### 6.1 问题意识

1. **新闻/专栏网页内容的易失性**
   我从 2000 年开始撰写新闻专栏。媒体和博客平台反复改版，导致旧文章的 URL 消失，出现类似“2014 年之前的专栏整体缺失”这样的空白。“缺失 14 年的内容”对搜索、引用和研究的连续性来说是致命的。如果内容只存在于像 Naver 这类封闭的搜索引擎空间内，也会阻碍 Google 与 LLM 的流量进入。
   → **将原文以 Markdown 形式永久存档在 GitHub 上**，网页则作为**该原文的发布层**。

2. **同时兼顾人类搜索(SEO)与 AI 搜索(GEO)**
   仅靠 GitHub 的目录结构，在 Google 与社交平台的 OG 展示上表现较弱；而 ChatGPT、Perplexity、Cursor 等智能体如果缺少 `llms.txt`、语义化 HTML 和独立 URL，在引用时也会处于不利地位。
   → 在 Pages 上部署**独立文档 URL + sitemap + llms.txt + canonical(指向 GitHub blob 的链接)**。

3. **以零基础设施成本为前提的试验场**
   对于个人研究/开源档案库而言，每月数十美元的 PaaS 费用属于过度投入。
   → 将**仅使用 Cloudflare 免费套餐运营**设定为硬性约束。

4. **将量化中的“展示”与“运行”分离**
   在服务器上运行 GS Quant 风格的行情/策略验证会受限于额度和依赖关系。
   → **Playground 使用 Pyodide(浏览器端 Python)**运行，API 仅负责行情、缓存与轻量代理。

### 6.2 概念图

```
[GitHub vibe-investing]
  ├─ 02.Investment Idea Column / essays / CTI / TechDoc   ← 原文/SEO 来源
  └─ VibeQuant/
        build → 静态 HTML
             ↓
[Cloudflare Pages]  vibequant.cc  (枢纽)
  docs / tech / cti / play / essays / research …
             ↓
[Workers / Pages Functions]  行情/研究 API · 缓存
             ↓
[浏览器]  Pyodide + GS Quant 风格实验(不占用服务器 CPU)
```

### 6.3 实际上线的服务

| 页面 | 示例 URL | 作用 |
|----|--------|------|
| 枢纽 | [vibequant.cc](https://vibequant.cc/) | 入口、品牌展示 |
| Columns | docs.vibequant.cc | 投资专栏档案库 |
| Tech | tech.vibequant.cc | TechDoc |
| CTI | cti.vibequant.cc | 威胁情报报告 |
| Play | play.vibequant.cc | Python/量化网页视图 |
| Research | vibequant.cc/research | 量化/太空/特朗普信号(无需登录，带缓存) |
| Essays | vibequant.cc/essays | 随笔文章 |

原则：**不用登录墙锁定内容。**即便是研究仪表盘也保持公开，通过缓存 TTL 来控制免费额度的使用。

### 6.4 维持“仅使用免费套餐”的设计规则

1. HTML 是构建产物——尽量减少运行时渲染
2. 能缓存的内容一律缓存(例如交易时段内 30 分钟、时段外 2 小时等)
3. 禁止滥用 KV 写入 → 改用 Cache API
4. 重计算放在**用户浏览器**上执行，而非边缘节点
5. 类似 Neon/Prisma/Puppeteer 这类**依赖 TCP 或本地运行时假设**的架构，排除在迁移范围之外，或改为预计算
6. 部署使用 `wrangler pages deploy`——如果本地存在 `HTTP_PROXY` 等环境变量，需先取消设置

---

## 7. 基础配置(最小检查清单)

详细的配额与迁移信息请参考[注册与限制指南](Cloudflare%20free%20tier%20guide.md)。这里只列出**最简流程**。

### 7.1 账户

1. [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. 验证邮箱
3. **必须启用 2FA**(账户即整个站点的钥匙)

### 7.2 Wrangler

```bash
# Node.js 18+
npm i -g wrangler   # 或安装到项目本地 node_modules
wrangler login
wrangler whoami
```

### 7.3 部署 Pages

```bash
wrangler pages deploy ./dist --project-name=my-site --commit-dirty=true
# → https://my-site.pages.dev
```

域名设置：Dashboard → Pages → Custom domains。将域名服务器指向 Cloudflare 后，DNS 与 SSL 可以在同一处统一管理。

### 7.4 Worker(API)

```bash
cd cloudflare-worker
wrangler deploy
wrangler secret put MY_API_KEY
```

**不要强行把 Pages 和 Worker 的配置合并到同一个 `wrangler.toml` 中。**
更安全的做法是通过 `cd pages && wrangler pages deploy .` 部署 Pages。

### 7.5 VibeQuant 式流水线(概念示意)

```bash
node content/build.mjs
npx wrangler pages deploy ./pages --project-name=vibequant-web
```

原文始终保存在 GitHub 上，网页版只是派生产物。**即使新闻文章被删除，仓库依然是事实来源。**

---

## 8. 需要注意的事项(实际运营中踩过的坑)

1. **Workers 每日 10 万次请求** —— 在收盘或内容走红时，可能在下午就耗尽额度。通过缓存和静态化来减少 API 调用。
2. **KV 每日写入 1,000 次** —— 如果把页面浏览量写入 KV，会立刻超限。行情和响应数据应使用 Cache API。
3. **CPU 约 10ms** —— 重计算和大体量 JSON 应预先计算，或转移到客户端/外部服务处理。
4. **启用 R2** —— 需要在控制台中手动开启，可能要求绑定支付方式(错误代码 `10042`)。
5. **代理环境** —— 若启用了 `HTTP_PROXY`，可能导致向 `api.cloudflare.com` 的部署失败。
6. **子域名出现 522** —— 在自定义主机尚未连接完成前，先用 apex 路径提供服务，等 DNS 准备好后再迁移。
7. **不要用中间件屏蔽路径** —— 曾发生过将“即将上线”的 HTML 覆盖在 `/research/*` 上，导致静态内容和 API 都无法访问的真实故障。
8. **不要把密钥写入 HTML 或 Git** —— DeepSeek、交易所的密钥应放在 Worker secret 中。
9. **免费=没有 SLA** —— 应在文档中保留 GitHub 原文和 `pages.dev` URL 作为备份。
10. **商业性/大规模爬取** —— 阅读服务条款和公平使用政策，区分公开研究发布与滥用行为。

---

## 9. 总结

| 问题 | 答案 |
|------|----|
| 为什么使用 Cloudflare？ | 在**同一边缘**上整合安全、CDN 与无服务器能力，免费运营静态站点和轻量 API |
| 它在哪些方面较弱？ | 重量级 Python 后端、强一致性需求、长时间任务、不可预测的流量峰值 |
| 与 Vercel 的区别？ | Next.js 开发体验和预览环境上 Vercel 更强；**带宽、成本可预测性、边缘集成**上 Cloudflare 往往更有优势 |
| VibeQuant 的核心约束是什么？ | **仅使用免费套餐**、GitHub 原文永久存档、SEO + AI 搜索、浏览器端量化 |
| 技术栈是什么？ | Markdown → 静态 HTML + TypeScript 边缘 API + Pyodide |

专栏内容从网络上消失的经历、搜索和 LLM 都抓取不到的 GitHub 目录树、对每月账单的担忧——当试图同时解决这三个问题时，Cloudflare 的免费套餐就不再是“次优选择”，而是**一个刻意的决策**。

对小团队而言，看清免费套餐的**局限与优势**，并借此在规模化之前控制成本，是一种合理的策略。如今，也没有必要让 AWS 成为所有工作负载的默认选项。

---

## 参考资料

- [Cloudflare 免费套餐注册与限制指南](Cloudflare%20free%20tier%20guide.md)(韩文)·[英文](Cloudflare%20free%20tier%20guide_EN.md)
- [Vercel 平台分析](../vercel/vercel_analysis.md)
- [免费网站托管指南](../Free_Hosting/FreeHosting.md)
- [智能体友好型网站构建指南](../agent-friendly-website-guide/agent-friendly-website-guide.zh.md)
- [GS Quant Getting Started](../GS_Quant/GS%20Quant%20Getting%20Started.md)
- [Pyodide](../Python_Pyodide/Pyodide.md)
- Cloudflare Workers 定价：https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Pages：https://developers.cloudflare.com/pages/
- Workers AI：https://developers.cloudflare.com/workers-ai/
- VibeQuant 部署笔记：`VibeQuant/cloudflare/DEPLOY_KR.md`(仓库内部)
- 网站：https://vibequant.cc/ · 源码：https://github.com/gameworkerkim/vibe-investing
