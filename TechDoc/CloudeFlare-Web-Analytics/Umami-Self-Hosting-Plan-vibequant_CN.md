---
title: "Umami 自托管落地方案 — vibequant.cc"
subtitle: "在 Cloudflare 免费层之上,以 Vercel/Fly.io + Worker 代理方式现实落地"
description: "不将 Umami 完全搭建在 Cloudflare 上,而是把应用放在 Vercel 或 Fly.io,通过 Cloudflare Worker 做第一方代理——梳理这两种方案的准备事项、风险与优缺点。"
abstract: |
  Umami 仅官方支持 PostgreSQL/MySQL,直接原生部署在 Cloudflare D1/Workers 上的路径并不现实。
  对 vibequant.cc 来说,有 A(Vercel+Worker)和 B(Fly.io+Worker)两条实用路径,需要同时考虑多子域名策略、build.mjs 注入以及免费层的限制。
  推荐先用 A 快速验证,若稳定性或冷启动成为问题再迁移到 B。
summary_for_ai: |
  Implementation plan for self-hosting Umami analytics on vibequant.cc (Cloudflare Pages free tier).
  Not pure Cloudflare (no D1/Workers-native Umami). Scenario A: Vercel + Neon/Supabase + CF Worker proxy.
  Scenario B: Fly.io Docker + Neon/Supabase + CF Worker proxy. Covers pros/cons, risks, multi-subdomain injection via build.mjs, APP_SECRET, ad-blocker bypass, free-tier limits.
date: 2026-07-25
author: "Dennis Kim"
lang: zh
tags:
  - Cloudflare
  - Umami
  - Analytics
  - Self-hosting
  - Free Tier
keywords:
  - Umami
  - vibequant.cc
  - Cloudflare Worker
  - Vercel
  - Fly.io
  - Neon
  - Supabase
  - first-party tracking
group: cloud-free
featured: false
schema_type: TechArticle
draft: false
---

# Umami 自托管落地方案 — vibequant.cc

## 1. 引言:现实可行的思路

试图把 Umami **完全**搭建在 Cloudflare 上是很有吸引力的想法,但**现实中这是一条复杂度很高的路径**。

Umami **只官方支持 PostgreSQL 或 MySQL**,Cloudflare D1(基于 SQLite)并非官方支持的数据库。Cloudflare Workers 运行在 V8 Isolate 环境中,无法直接部署基于 Node.js 的 Umami,必须直接对数据库层打补丁,而这类补丁在每次 Umami 更新时都有很大概率失效。

因此本文档探讨两种现实的方案,做到**"让 Umami 尽量贴近 Cloudflare,同时保持实用性"**。目标站点是目前运行在 Cloudflare Pages 免费层上的 [vibequant.cc](https://vibequant.cc) 及其子域名。

相关背景:这是 [Cloudflare 网站分析方案指南](./CloudeFlare-Web-Analytics-Guide_CN.md) 中推荐的"先用 Web Analytics 起步 → 需要时扩展到 Umami"的具体执行方案。

| 方案 | 说明 | 推荐场景 |
|--------|------|----------|
| **A. Vercel + Cloudflare Worker 代理** | Umami 应用部署在 Vercel,数据库用 Neon/Supabase,追踪流量通过 Cloudflare Worker 代理 | 最简单最快,验证与落地的首选 |
| **B. Fly.io + Cloudflare Worker 代理** | Umami 应用部署在 Fly.io 容器,数据库用 Neon/Supabase,追踪流量通过 Cloudflare Worker 代理 | 当冷启动/无服务器限制成为困扰时。需要一些运维成本和配置 |

```
访客浏览器
    |
    |  script + /api/send  (analytics.vibequant.cc)
    v
Cloudflare Worker(第一方代理)
    |
    v
Umami 应用 (A: Vercel / B: Fly.io)  <-->  PostgreSQL (Neon 或 Supabase)
```

---

## 2. 方案对比总结

| 项目 | A. Vercel + Worker | B. Fly.io + Worker |
|------|--------------------|--------------------|
| 配置难度 | 低(约 40–60 分钟) | 中(CLI、内存扩容、部署重试) |
| 月成本(小规模) | 实际可做到 0 元 | 可能无法接近 0 元(见下方成本小节) |
| 冷启动 | Vercel Function + Neon/Supabase 暂停时会出现 | 若机器 always-on 则较低;缩容至零(scale-to-zero)时会出现 |
| 运维复杂度 | Fork 同步、Vercel 构建限额 | Docker 镜像、`fly scale`、IPv4 |
| 数据所有权 | 数据库在 Neon/Supabase,应用在 Vercel | 数据库在 Neon/Supabase(或 Fly Postgres),应用在 Fly |
| 与 vibequant.cc 的适配度 | **首选** | 出现流量/稳定性问题后的迁移目标 |
| 规避广告拦截器 | 通过 Worker 自定义域名同样可行 | 相同 |

**结论(推荐):** 先用 **A** 落地并验证,若 Vercel 冷启动、Hobby 限额或 Prisma 连接问题变得明显,再迁移到 **B**。Worker 代理和 `analytics.vibequant.cc` 域名设计在两种方案中都可复用。

---

## 3. 方案 A:Vercel + Cloudflare Worker 代理(推荐)

这是 Umami 社区中最常用的组合。官方指南:[Running on Vercel](https://docs.umami.is/docs/guides/running-on-vercel)。

### 3.1 架构

```
访客浏览器
    |
    |  GET /u.js , POST /api/send
    v
Cloudflare Worker @ analytics.vibequant.cc
    |
    v
Vercel (Umami Next.js)  <-->  Neon 或 Supabase (PostgreSQL)
```

### 3.2 准备事项

| 项目 | 备注 |
|------|------|
| GitHub 账号 | 用于 Fork Umami |
| Cloudflare 账号(免费) | 已在运行 vibequant.cc 的 DNS/Pages |
| Vercel 账号(Hobby) | 用 GitHub 登录 |
| Neon 或 Supabase | 免费 PostgreSQL |
| `openssl` 或密码生成器 | 用于生成 `APP_SECRET` |
| 修改 vibequant 构建流水线的权限 | 需要在 `VibeQuant/content/build.mjs` 中插入脚本 |

### 3.3 分步安装

**第一步:Fork Umami 仓库**

将 [umami-software/umami](https://github.com/umami-software/umami) Fork 到自己的 GitHub 账号。

**第二步:创建 PostgreSQL**

在 [Neon](https://neon.tech) 或 [Supabase](https://supabase.com) 创建项目,复制连接字符串(`postgresql://...`)。

- Neon:无服务器 Postgres,闲置时可能暂停(冷启动)
- Supabase:需确认免费层的数据库容量和连接数限制

**第三步:将 Umami 部署到 Vercel**

1. 在 Vercel 中通过 **Add New → Project** 导入 Fork 的 `umami`
2. 设置环境变量:

| 变量名 | 值 | 备注 |
|--------|-----|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | 必填。若使用 Neon,建议使用 pooled URL |
| `APP_SECRET` | `openssl rand -hex 32` 的输出结果 | 适用于 v2+。取代旧文档中的 `HASH_SALT`([环境变量](https://docs.umami.is/docs/environment-variables)) |
| `TRACKER_SCRIPT_NAME` | 例如 `u` 或 `vq-beacon` | 用来替代默认的 `script.js`,降低被拦截的概率 |
| `COLLECT_API_ENDPOINT` | 例如 `/api/e`(可选) | 可替代默认的 `/api/send` |
| `DISABLE_TELEMETRY` | `1`(可选) | 关闭 Umami 自身的遥测 |

3. 部署完成后记下 `.vercel.app` 的地址

**第四步:Umami 初始设置**

1. 访问部署后的 URL
2. 默认账号:`admin` / `umami`([Login](https://docs.umami.is/docs/login))
3. **立即修改密码**
4. 在 Settings → Websites 中添加站点,并复制 **Website ID**

由于 vibequant 有多个主机,应在此步骤之前先决定 Website 的划分方式(参见下文 [8. vibequant.cc 的额外需求](#8-vibequantcc-的额外需求))。

**第五步:Cloudflare Worker 代理**

Worker 需要同时代理**追踪脚本和采集 API**。如果像原始方案那样只转发 `/api/send`,脚本加载会失败。

示例(路径需根据实际的 `TRACKER_SCRIPT_NAME` / `COLLECT_API_ENDPOINT` 调整):

```javascript
const UMAMI_ORIGIN = "https://your-umami.vercel.app"; // Vercel Umami 地址
const SCRIPT_PATH = "/u.js";          // 与 TRACKER_SCRIPT_NAME 的结果一致
const COLLECT_PATH = "/api/send";     // 或 COLLECT_API_ENDPOINT

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const isScript = path === SCRIPT_PATH || path === SCRIPT_PATH.replace(/\.js$/, "");
    const isCollect = path === COLLECT_PATH;

    if (!isScript && !isCollect) {
      return new Response("Not found", { status: 404 });
    }

    const upstream = new URL(path + url.search, UMAMI_ORIGIN);
    const headers = new Headers(request.headers);
    headers.set("Host", new URL(UMAMI_ORIGIN).host);
    // 若已启用 Cloudflare 访客位置头,原样转发
    // CF-IPCountry, CF-IPCity 等

    const init = {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "follow",
    };

    const response = await fetch(upstream, init);
    const out = new Response(response.body, response);
    out.headers.set("Access-Control-Allow-Origin", "*"); // 如有需要可收窄为主机白名单
    return out;
  },
};
```

注意事项:

- 不要把用于查询统计数据的 API Token 硬编码在 Worker 源码中。仪表盘应直接通过 Vercel URL(或另一个受保护的路径)访问。
- 在生产环境中,将 `UMAMI_ORIGIN` 保存在 Worker 的 **Secrets / Vars** 中。

**第六步:自定义域名**

将 `analytics.vibequant.cc` 绑定到 Worker。当追踪流量看起来像第一方(或同一注册域名下的子域名)时,规避广告拦截器的概率会提升。社区讨论:[umami#1026](https://github.com/umami-software/umami/discussions/1026)。

**第七步:在 vibequant.cc 中插入追踪代码**

正确的脚本形式如下(`src` 指向**脚本文件**,而不是 `/api/send`):

```html
<script
  defer
  src="https://analytics.vibequant.cc/u.js"
  data-website-id="YOUR_WEBSITE_ID"
></script>
```

由于静态 HTML 是通过 `content/build.mjs` 的 `layout()` 生成的,与逐个手动修改所有 `pages/**/index.html` 相比,更安全的做法是把它放进**构建模板的 `<head>`**(例如 `extraHead` 或公共代码片段)。之后重新部署受影响的各个 Pages 项目(`vibequant-web`、`vibequant-tech`、`vibequant-cti` 等)。

### 3.4 优缺点

| 优点 | 缺点 |
|------|------|
| 配置速度最快,与官方 Vercel 指南一致 | Hobby 计划下 Function 执行时长/并发有限制 |
| 无需 Docker/CLI | Neon/Supabase 的闲置暂停可能与 Vercel 冷启动叠加 |
| 容易将成本维持在接近 0 元 | Fork 需要定期与上游同步 |
| Worker 代理在迁移到 B 时可复用 | 可能出现 Prisma + 无服务器数据库连接池问题(几乎必须使用 pooled URL) |
| Next.js 原生托管 | 仪表盘也在 Vercel 上,出故障时应用与采集会同时受影响 |

### 3.5 风险(A)

| 风险 | 影响 | 缓解措施 |
|--------|------|------|
| Neon/Supabase 闲置暂停 | 首个 PV 延迟或丢失 | 定期 ping、或使用最低付费方案、或迁移到 B |
| 超出 Vercel Hobby 限额 | 部署失败、带宽受限 | 监控流量,必要时升级 Pro 或迁移到 B |
| 使用非 pooled 连接字符串 | 间歇性数据库错误 | 使用 Neon 的 pooled 或 Supabase 的 pooler URL |
| 放任默认的 `admin`/`umami` 账号 | 仪表盘被盗用 | 立即修改密码,尽量少共享 URL |
| Worker 被当作开放代理滥用 | 被滥用、产生额外成本 | 路径白名单,必要时限制 Origin |
| Fork 长期不更新 | 缺失安全补丁 | 定期与上游 remote 同步 |

---

## 4. 方案 B:Fly.io + Cloudflare Worker 代理

当 Vercel 的无服务器限制成为负担,或希望更接近常驻进程时选用。官方指南:[Running on Fly.io](https://docs.umami.is/docs/guides/running-on-fly-io)。

### 4.1 架构

```
访客浏览器
    |
    v
Cloudflare Worker (analytics.vibequant.cc)
    |
    v
Fly.io (Umami Docker)  <-->  Neon/Supabase 或 Fly Postgres
```

### 4.2 安装概览

1. 在 Neon/Supabase 创建 PostgreSQL(与 A 相同)——或在 `fly launch` 时创建 Postgres
2. 安装并登录 [flyctl](https://fly.io/docs/flyctl/)
3. 编写 `fly.toml` 后部署。镜像示例:

```toml
# 基于官方文档示例,region、app 名称请按实际环境调整
kill_signal = "SIGINT"
kill_timeout = "5s"

[experimental]
auto_rollback = true

[build]
  # 文档:docker.umami.is/... 或 ghcr.io/umami-software/umami:postgresql-latest
  image = "docker.umami.is/umami-software/umami:postgresql-latest"

[[services]]
  protocol = "tcp"
  internal_port = 3000
  processes = ["app"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20

  [[services.tcp_checks]]
    interval = "15s"
    timeout = "2s"
    grace_period = "1s"
```

4. 核心运维步骤(按官方文档):

```bash
fly secrets set APP_SECRET="$(openssl rand -hex 32)"
fly deploy
fly scale memory 512   # Umami 在 256MB 下常常运行失败
fly deploy
```

5. 登录:`admin` / `umami` → 修改密码
6. 与方案 A 的第五至七步相同,连接 Worker 代理、域名和站点脚本(只需将 `UMAMI_ORIGIN` 改为 Fly 的地址)

### 4.3 优缺点

| 优点 | 缺点 |
|------|------|
| 容器方式,控制粒度清晰 | CLI、扩容、健康检查等有学习成本 |
| 512MB always-on 可缓解冷启动 | **仅靠免费层的 256MB 机器很可能不够用** |
| 可选择区域(如 `nrt`/`icn`) | 公共 IPv4 等可能产生**小额固定费用**([Fly 定价](https://fly.io/docs/about/pricing/)) |
| 容易复用方案 A 中的 Worker/数据库 | 需要负责跟踪/回滚 `latest` 镜像标签 |
| 独立于 Vercel Hobby 限额 | 若疏于管理,机器成本和幽灵卷会持续累积 |

### 4.4 风险(B)

| 风险 | 影响 | 缓解措施 |
|--------|------|------|
| 内存低于 512MB | OOM、部署/迁移失败 | 使用 `fly scale memory 512` 或更高 |
| 假设"免费" | 每月产生数美元费用 | 设置账单提醒,检查 IPv4 和机器数量 |
| 同时运行 Fly Postgres | 存储/机器双重成本 | 建议数据库仍保留在 Neon/Supabase |
| 缩容至零(scale-to-zero) | 首次请求延迟 | 保持至少 1 台机器 always-on,或采用与 A 相同的 ping 策略 |
| 区域不匹配(应用在东京、数据库在美国) | 采集 API 延迟 | 让应用和数据库区域相互靠近 |

---

## 5. 通用部分:Cloudflare 优化与不推荐使用 D1 的原因

### 5.1 Cloudflare 位置头

在 Cloudflare 仪表盘中为 Managed Transforms 启用 visitor location headers,可以让 Umami 更好地识别国家/地区。相关环境变量:`CLIENT_IP_HEADER`、`SKIP_LOCATION_HEADERS`([环境变量](https://docs.umami.is/docs/environment-variables))。

### 5.2 在 D1 上运行 Umami 的路径

要在 D1 上运行,需要对数据库层打补丁。

- 每次 Umami 更新都需要重新应用补丁
- 官方不支持 → 出问题时只能依赖社区
- D1 的免费额度和 SQLite 的限制

**不推荐。** 相较于维护成本,Neon/Supabase 的免费 PostgreSQL 更具优势。

### 5.3 第一方追踪

`analytics.vibequant.cc` 加上自定义的 `TRACKER_SCRIPT_NAME` / `COLLECT_API_ENDPOINT` 组合,是规避广告拦截器最现实的方式。这种"绕过"并不完美,一些严格的拦截列表仍可能识别出来。

---

## 6. 成本汇总(基于免费层,2026 年语境)

| 服务 | 免费/额度(大致) | 对 Umami 是否够用? | 注意事项 |
|--------|-------------------|-------------------|------|
| Cloudflare Workers | 每日请求上限(取决于账户计划) | 作为追踪代理通常足够 | 若被开放代理/机器人滥用会被消耗 |
| Vercel Hobby | 带宽/Function 限额 | 对小型内容站通常足够 | 商业用途限制、冷启动 |
| Neon Free | 存储/计算时间 | 初期低流量场景足够 | 闲置会暂停 |
| Supabase Free | 数据库容量/带宽 | 初期足够 | 需确认项目暂停策略 |
| Fly.io | 存在一定共享 CPU/时长额度 | **可能与 Umami 所需的 512MB 冲突** | 超出 IPv4/内存限额后需付费 |

**现实的月成本预期**

- **A:** 若流量不大,可以维持在接近 **0 元**
- **B:** 很难断言"完全免费"。仅内存和 IPv4 就可能产生每月小额费用,务必开启账单提醒。

只有在 **A + Neon/Supabase + Worker** 组合下,把"月成本 0 元"作为安全目标才是合理的。

---

## 7. 常见风险与运维事项

| 领域 | 内容 |
|------|------|
| **安全** | 修改默认密码、尽量减少仪表盘 URL 的暴露、不要在 Worker 中放入 API Bearer Token、禁止泄露 `APP_SECRET` |
| **隐私** | Umami 接近无 Cookie,但仍需确认是否符合公开站点的隐私政策/Cookie 横幅政策。若有欧盟访客,需明确保留期限和用途 |
| **数据丢失** | 需关注 Neon/Supabase 免费层的删除/暂停策略,定期做数据库 dump 或逻辑备份 |
| **准确性** | 广告拦截器、ITP、机器人过滤器会导致 PV 始终存在一定程度的高估或低估,建议与 Cloudflare Web Analytics 并行交叉验证 |
| **依赖关系** | 应用主机(Vercel/Fly)+ 数据库(Neon/Supabase)+ CF Worker 三个环节,任一环节出问题都会造成采集空窗 |
| **更新** | Fork 同步(A)或镜像标签锁定(B)。为 Prisma 迁移失败准备回滚方案 |
| **滥用** | 通过 `/api/send` 刷量导致数据库膨胀。由于 Website ID 不可避免会公开,需监控速率限制和异常值 |

---

## 8. vibequant.cc 的额外需求

以下是原始指南中没有涉及、但**因本仓库的域名/站点结构而额外需要完成的工作**。

### 8.1 多主机策略

当前大致映射关系([CUSTOM_DOMAIN_SETUP.md](../../VibeQuant/cloudflare/docs/CUSTOM_DOMAIN_SETUP.md)):

| 主机 | Pages 项目 | 内容 |
|--------|----------------|--------|
| `vibequant.cc` | vibequant-web | 门户、随笔等 |
| `docs.vibequant.cc` | vibequant-docs | Columns |
| `tech.vibequant.cc` | vibequant-tech | TechDoc |
| `cti.vibequant.cc` | vibequant-cti | CTI |
| `play.vibequant.cc` | vibequant-play | Playground |
| `lab` / `research` | 各自 | 实验/研究 |

可选方案:

1. **每个主机一个 Website ID** —— 仪表盘更清晰,脚本中的 ID 按主机区分
2. **一个 Website 对应多个域名** —— 配置更简单,报表中按主机/路径过滤

对于内容归档类用途,**按主机划分 Website**(docs / tech / cti / hub)更有利于分析。

### 8.2 构建流水线注入

追踪代码应插入到 `VibeQuant/content/build.mjs` 中 `layout()` 的 `<head>` 部分。直接修改生成后的 HTML,会在下一次构建时被覆盖。

还需要额外完成:

- 通过 `UMAMI_WEBSITE_ID_*` 或构建时的环境变量注入 ID
- 在本地预览时关闭追踪的开关(`UMAMI_ENABLED=0`)
- 构建完成后重新部署**所有受影响的 Pages 项目**

### 8.3 DNS / Worker

- `analytics.vibequant.cc` → Worker 自定义域名
- 确认与现有 Pages 自定义域名不冲突
- CORS:由于脚本和 POST 请求来自多个子域名,需检查 Worker/Umami 的 CORS 配置

### 8.4 与 Cloudflare Web Analytics 的关系

如果已经在使用或计划使用 Web Analytics:

- 短期:**并行运行**,交叉验证数值
- 中期:Umami 稳定后,可将 Web Analytics 仅作为 PV 备份保留,或直接清理

两者同时开启对页面成本影响很小,但在解读指标时要注意不要混淆重复计数。

### 8.5 自定义事件(后续)

滚动深度、外链点击等可通过 Umami 的 [Custom Events](https://docs.umami.is/docs/tracker-functions) 添加,建议在基础 pageview 稳定后再实现。

### 8.6 文档与运维检查

- 不要将 `APP_SECRET`、数据库 URL 提交到仓库(使用 `.env` / Vercel·Fly 的 secrets)
- 故障时的联络渠道:Vercel/Fly 状态页、Neon/Supabase 状态页
- 每周:检查 fork 同步状态或镜像 digest(可选)

---

## 9. 检查清单:vibequant.cc 落地时间表

| 步骤 | 任务 | 预计耗时 |
|------|------|----------|
| 1 | 确定按主机划分 Website 的策略(单一 vs 多个 ID) | 10 分钟 |
| 2 | Fork Umami 的 GitHub 仓库 | 2 分钟 |
| 3 | 创建 Neon/Supabase PostgreSQL | 5 分钟 |
| 4 | 部署到 Vercel + 设置 `DATABASE_URL` / `APP_SECRET` / tracker 名称 | 15 分钟 |
| 5 | 登录、修改密码、添加 Website | 5 分钟 |
| 6 | Cloudflare Worker(脚本 + collect 代理)+ Secrets | 15 分钟 |
| 7 | 连接 `analytics.vibequant.cc` | 5 分钟 |
| 8 | 确认 Managed Transforms(访客位置) | 3 分钟 |
| 9 | 在 `build.mjs` 中插入脚本 + 确认本地构建 | 15 分钟 |
| 10 | 重新部署对应的 Pages 项目 | 10–20 分钟 |
| 11 | 测试访问 → 检查 Realtime/仪表盘 | 5 分钟 |
| 12 | (可选)设置账单提醒、数据库备份、与 Web Analytics 并行运行的记录 | 10 分钟 |

**总预计:约 1–1.5 小时**(含多主机和构建修改)。原方案的 40–50 分钟更接近"单一站点、手动插入 HTML"的场景。

若从一开始就选择方案 B,则需为 Fly 内存扩容和账单检查额外增加 **30–60 分钟**,并可能产生小额费用。

---

## 10. 推荐决策

1. **首选:方案 A(Vercel + Neon + Worker)**
   - 在成本、速度和文档成熟度方面最适合 vibequant.cc
2. **代理从一开始就使用 `analytics.vibequant.cc`**
   - 之后若迁移到 B,只需替换 Worker 的 origin
3. **不要尝试 D1/Workers 原生的 Umami 部署**
4. **通过 build.mjs 注入 + 按主机划分 Website ID**
5. **当冷启动/Hobby 限额变得明显时再迁移到 B**
   - 在那之前不要预设 Fly 是"免费的"

这套组合能在接近免费层的同时,确保第一方追踪、数据所有权以及 Umami 的可更新路径。先用 Cloudflare Web Analytics 轻量起步,再按此方案接入 Umami,是相对运维成本而言效果最好的顺序。

---

## 11. 参考资料

### 官方文档

- [Umami — Running on Vercel](https://docs.umami.is/docs/guides/running-on-vercel)
- [Umami — Running on Fly.io](https://docs.umami.is/docs/guides/running-on-fly-io)
- [Umami — Environment variables](https://docs.umami.is/docs/environment-variables)(`APP_SECRET`、`TRACKER_SCRIPT_NAME`、`COLLECT_API_ENDPOINT`)
- [Umami — Login (default admin / umami)](https://docs.umami.is/docs/login)
- [Umami — Tracker functions / custom events](https://docs.umami.is/docs/tracker-functions)
- [Umami GitHub](https://github.com/umami-software/umami)
- [Fly.io — Resource pricing](https://fly.io/docs/about/pricing/)
- [Fly.io — flyctl](https://fly.io/docs/flyctl/)
- [Vercel — Rewrites](https://vercel.com/docs/rewrites)(替代方案:主应用在 Vercel 上时使用同域代理)
- [Neon](https://neon.tech) / [Supabase](https://supabase.com)

### 社区与指南

- [Preventing ad blockers with Cloudflare Worker (umami#1026)](https://github.com/umami-software/umami/discussions/1026)
- [Self-hosted Umami on Vercel + Supabase(示例文章)](https://www.surajon.dev/how-to-self-host-umami-analytics-with-supabase-and-vercel)
- [Umami on Vercel + Neon(摘要指南)](https://setuptracking.com/umami-vercel/)

### 本仓库

- [Cloudflare 网站分析方案指南](./CloudeFlare-Web-Analytics-Guide_CN.md)
- [VibeQuant 自定义域名设置](../../VibeQuant/cloudflare/docs/CUSTOM_DOMAIN_SETUP.md)
- 追踪代码注入位置:`VibeQuant/content/build.mjs`(`layout()` 的 `<head>`)
