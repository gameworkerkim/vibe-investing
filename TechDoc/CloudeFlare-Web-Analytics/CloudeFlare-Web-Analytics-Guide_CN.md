---
title: "Cloudflare 网站分析方案指南 — Web Analytics、Zaraz、Umami 对比"
subtitle: "从 PV 到滚动深度、自定义事件,如何在 Cloudflare 生态中选择合适的指标工具"
description: "整理了 Cloudflare Web Analytics、Zaraz、Workers Analytics Engine 与 Umami、Plausible、GoatCounter、GA4 的优缺点、适用场景以及分阶段选择指南。"
abstract: |
  在 Cloudflare Pages/Workers 上发布内容时,若想查看单篇文章的 PV、来源和阅读深度,工具的选择会因目标不同而分化。
  现实可行的路径是:先用免费、无 Cookie 的 Web Analytics 起步,需要事件和多站点追踪时扩展到 Umami,广告和转化漏斗则用 Zaraz + GA4,若想完全自主拥有数据则考虑 Analytics Engine + Logpush + R2。
  对内容型档案站来说,Matomo、PostHog、Clarity 大多显得过重。推荐路径是:先用 Web Analytics,需要时再扩展到 Umami。
summary_for_ai: |
  TechDoc comparing web analytics options for Cloudflare-hosted sites (as of mid-2026 context in the article).
  Native: Web Analytics (privacy-first PV/referrer), Zaraz (tag manager), Workers Analytics Engine + Logpush + R2.
  Third-party/OSS: Umami, Plausible, GoatCounter, Matomo, GA4, PostHog/Clarity, Fathom, Simple Analytics, Ackee, Pirsch.
  Recommended path for content archives: start Web Analytics, expand to Umami; avoid heavy stacks unless needed.
date: 2026-07-25
author: "Dennis Kim"
lang: zh
tags:
  - Cloudflare
  - Web Analytics
  - Umami
  - Zaraz
  - Privacy
  - Observability
keywords:
  - Cloudflare Web Analytics
  - Zaraz
  - Umami
  - Plausible
  - GoatCounter
  - Workers Analytics Engine
  - 网站分析
  - 隐私分析
group: cloud-free
featured: false
schema_type: TechArticle
draft: false
---

# Cloudflare 网站分析方案指南 — Web Analytics、Zaraz、Umami 对比

如果你的网站部署在 Cloudflare 上,开始好奇"我的文章都是谁在读、从哪里来的",你会发现可选的分析工具比想象中多得多。是只想看 PV,还是想追踪滚动深度和自定义事件,又或者想完全掌控自己的数据,这三种需求会指向完全不同的方向。本文将梳理 Cloudflare 原生方案以及第三方、开源工具的优缺点和适用场景。

---

## 1. Cloudflare 原生方案

### 1.1 Web Analytics(首推 · 起步之选)

Cloudflare Web Analytics 拥有最强的卖点:**免费且隐私优先**。它不使用 Cookie 或浏览器指纹,可以在与 Cloudflare Pages 相同的账户中直接启用。默认提供按站点的热门页面(Top Pages)、来源(Referrer)和国家/地区流量分布,几乎不用担心给网站增加横幅提示。只需给 docs/tech/cti 各个主机添加站点即可立即查看指标,非常适合**每周检查"单篇 PV + 流量来源"**,或者用来测试关闭社交媒体流量的效果。

从 2025 年 10 月 15 日起,Cloudflare 开始为所有免费域名默认启用 Web Analytics,2026 年正在进行一次大规模升级,将其与 RUM(真实用户监控)工具及网络层洞察相结合。此外,2026 年 4 月的更新新增了**导航类型(Navigation Type)筛选与报告**功能,可以区分用户是通过点击链接、前进/后退按钮到达,还是命中了缓存。大规模账户(100+ 站点)的仪表盘稳定性也得到改进,现可对多达 1,000 个站点进行账户级汇总查询。

**缺点**也很明显。滚动深度、停留时长、自定义事件和转化漏斗分析都相当薄弱,界面较浅,长期原始数据导出和 SQL 查询能力有限。每个子域名也需要单独配置,略显繁琐。

> **适合:** 每周检查"单篇 PV + 流量来源"、测量社交媒体效果、轻量起步。

### 1.2 Zaraz

Zaraz 是一款在**边缘中继标签(tag)**的工具,能在不损失性能的前提下管理第三方脚本。由于 GA 或广告像素不再直接嵌入浏览器,而是在 Cloudflare 边缘处理,页面加载性能可以显著改善。

不过 Zaraz 本身并非提供"研究级报告"的分析工具,更接近**标签管理器(Tag Manager)**。一旦接入 GA,复杂度和同意(consent)问题又会重新出现,对内容档案站而言往往显得过度。

> **适合:** 只有在未来一定要用 GA/广告像素时才考虑。现在不需要的话可以跳过。

### 1.3 Workers Analytics Engine / Logpush + R2

这一组合适合想要**100% 拥有数据**的开发者。你可以在 Worker 的 `_middleware` 或 Pages Function 中直接累积按路径统计的计数、滚动信标等数据,而 Workers Analytics Engine 支持通过 SQL API 查询**无限基数(cardinality)的时间序列分析**。

Logpush 能将 Cloudflare 的日志自动发送到 R2、S3、Splunk、Datadog 等外部存储或分析工具。2026 年新增的 **Pipelines** 功能,可以把 Logpush 数据转换为 SQL 后,以 Parquet 或 Apache Iceberg 表的形式存入 R2。这样既能长期保留原始日志,又能支持快速查询。

**缺点**是仪表盘、数据保留策略和查询逻辑都**需要自己搭建**,运维成本和开发时间都相当可观。

> **适合:** 既不想用 Umami,又只想要"完全自主基础设施"的团队。适合具备数据工程能力的团队。

---

## 2. 第三方 · 开源方案

### 2.1 Umami(OSS,常被推荐)

Umami 是一款 MIT 许可的开源分析工具,可以**自托管(或使用云端版)**。它支持页面浏览、来源、自定义事件和多站点追踪,脚本体积小于 2KB。有大量案例将其与 Cloudflare Workers、Pages 以及 D1/PostgreSQL 搭配使用,与 Cloudflare 生态系统的兼容性良好。

作为 Cloudflare Web Analytics 之后的下一步,如果想追踪到**"单篇文章 + 事件"**级别,它是自然的选择。实际上,从 Cloudflare Web Analytics 转向 Umami 的博主反馈普遍积极。

**缺点**是需要自己管理托管、备份和更新,滚动深度也需要自行定义事件。还要注意,Umami 只官方支持 PostgreSQL 或 MySQL,Cloudflare D1 或 SQLite 并非官方支持的数据库。

> **适合:** Cloudflare Web Analytics 的下一步,想追踪到"单篇文章 + 事件"级别时。

### 2.2 Plausible(开源核心 / 付费 SaaS)

Plausible 是一款**界面简洁、注重隐私**的工具,目标/自定义事件配置和共享仪表盘功能都很出色。还可以通过 Cloudflare Workers 代理 Plausible 请求,发送到自己的域名,有助于规避广告拦截器。

**缺点**是 SaaS 版本需要付费。也可以自托管,但运维负担与 Umami 相近。

> **适合:** 愿意付费只为获得简洁界面和快速查询体验的场景。

### 2.3 GoatCounter(OSS)

GoatCounter 是一款**极其轻量**的开源工具,同时支持免费版和自托管。提供以页面浏览和来源为核心的简单指标。也有一些案例将其与 Cloudflare R2 结合用于重定向追踪。

**缺点**是事件追踪和细分能力较弱,对"阅读深度"分析而言略显不足。

> **适合:** 只想以超轻量方式查看 PV 的场景。

### 2.4 Matomo(OSS)

Matomo 是一款能在本地私有部署上提供**GA 级功能**(热图、会话、目标)的强大工具。但它**较为笨重,对服务器和数据库的负担很大**,与静态 Pages 架构的匹配度不高。

> **适合:** 以当前规模而言**不推荐**。

### 2.5 GA4(+ 可选 Zaraz)

GA4 在滚动、互动时长、导航路径等方面提供**丰富**的数据。配合 Zaraz 使用,可以在不影响性能的情况下采集 GA4 数据。

**缺点**是 Cookie/同意与隐私负担较重,与内容站的形象不太契合,并存在采样和学习曲线的问题。

> **适合:** 仅在确实需要广告/转化漏斗分析时使用。

### 2.6 PostHog / Clarity 等

通过会话回放(Session Replay)、热图等提供更接近**"读到哪里了"**的洞察。但它们**较为笨重,存在 PII 和同意问题**,对 CTI/专栏类档案站来说过于重量级。

> **适合:** 更适合产品型 SaaS,不是公开档案站的首选。

---

## 3. 其他值得关注的工具

| 工具 | 类型 | 特点 | 适合场景 |
|------|------|------|------|
| **Fathom** | 付费 SaaS | 与 Plausible 类似的隐私优先方案。单页面 UI 紧凑,隐私政策严格 | 定位与 Plausible 相近,可依据 UI 喜好选择 |
| **Simple Analytics** | 付费 SaaS | 以 Cloudflare 应用形式提供,安装简便,不使用 Cookie | 想要与 Cloudflare 仪表盘深度整合的体验时 |
| **Ackee** | OSS · 自托管 | 基于 Node.js,可通过 GraphQL API 进行自定义数据查询 | 熟悉 Node.js 且偏好 GraphQL 的场景 |
| **Pirsch** | 付费 SaaS | 月费 6 美元起的低价隐私优先工具 | 预算有限、追求性价比的初创团队 |

---

## 4. 总结:分阶段选择指南

| 阶段 | 推荐工具 | 理由 |
|------|----------|------|
| **阶段一:起步** | Cloudflare Web Analytics | 免费、零配置、隐私安全,最适合检查"PV + 流量来源" |
| **阶段二:扩展** | Umami(自托管) | 自定义事件、多站点、数据自主可控 |
| **阶段三:进阶** | Plausible(付费)/ Workers Analytics Engine | 重视界面/速度,或希望完全自定义基础设施时 |
| **特殊用途** | Zaraz + GA4 | 仅当广告/转化漏斗分析是硬性需求时 |
| **不推荐** | Matomo / PostHog / Clarity | 对当前内容档案站的规模而言过于重量级 |

在 Cloudflare 生态系统中,最明智的策略是**"先用 Web Analytics 起步,需要时再扩展到 Umami"**。两者不会冲突,因此并行运行、交叉比较也是不错的做法。如果想让数据完全归自己所有,可以考虑 Workers Analytics Engine + Logpush + R2 组合,但在此之前,不妨先想一想 Umami 是否已经足够。
