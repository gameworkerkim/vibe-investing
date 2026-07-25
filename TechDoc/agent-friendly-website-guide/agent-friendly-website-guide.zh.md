---
title: "构建智能体友好型网站的实务技术指南"
title_ko: "에이전트 친화적인 웹사이트 구축을 위한 실무 기술 가이드"
title_en: "Agent-Friendly Website Construction: A Practical Technical Guide"
description: "整合 AI 智能体时代 Web UX、无障碍性与结构化数据标准的实务指南，基于 Google web.dev、Chrome WebMCP 以及 llms.txt 标准编写。"
slug: agent-friendly-website-guide
language: zh
languages_available: [ko, en, ja, zh]
canonical: https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/agent-friendly-website-guide/agent-friendly-website-guide.zh.md
version: "1.0"
date_published: 2026-05-19
last_updated: 2026-05-19
author:
  name: "Dennis Kim (金浩光 / HoKwang Kim)"
  role: "Betalabs CEO · Cyworld Z 前 CEO · Microsoft Azure MVP"
  github: gameworkerkim
  publication: Web3Paper
license: CC-BY-4.0
schema_type: TechArticle
keywords:
  - AI 智能体
  - 智能体友好型网站
  - llms.txt
  - WebMCP
  - 语义化 HTML
  - 无障碍树
  - Schema.org
  - JSON-LD
  - GEO
  - Generative Engine Optimization
  - Core Web Vitals
  - Model Context Protocol
  - MCP
  - Web 标准
  - SEO
tags:
  - ai-agents
  - web-development
  - accessibility
  - semantic-html
  - llms-txt
  - webmcp
  - schema-org
  - geo
  - chrome
  - google-web-dev
audience:
  - 前端开发者
  - 技术写作者
  - DevRel · 开发者市场
  - 产品经理
  - SEO/GEO 负责人
  - CTO · 技术负责人
sources:
  - title: "构建对话式助手友好的网站"
    authors: ["Kasper Kulikowski", "Omkar More"]
    publisher: "Google web.dev"
    date: 2026-04-01
    url: https://web.dev/articles/ai-agent-site-ux
  - title: "智能体介绍"
    authors: ["Alexandra Klepper", "Kasper Kulikowski", "Rachel Lee Nabors"]
    publisher: "Google web.dev"
    date: 2025-02-25
    url: https://web.dev/articles/ai-agents
  - title: "WebMCP 现已开放早期预览体验"
    authors: ["André Cipriani Bandarra"]
    publisher: "Chrome for Developers"
    date: 2026-02-10
    url: https://developer.chrome.com/blog/webmcp-epp
  - title: "The /llms.txt file"
    authors: ["Jeremy Howard"]
    publisher: "Answer.AI"
    date: 2024-09
    url: https://llmstxt.org
---

# 构建智能体友好型网站的实务技术指南

> AI 智能体代替用户浏览、总结、下单的时代已经到来。本指南整合了 Google web.dev(2026-04-01)、Chrome WebMCP EPP(2026-02-10)以及 Jeremy Howard 提出的 llms.txt 标准，是一份共 11 章加附录、帮助智能体正确理解我们的网站并完成任务的实务手册。

🌐 **其他语言** — [한국어](./agent-friendly-website-guide.ko.md) · [English](./agent-friendly-website-guide.en.md) · [日本語](./agent-friendly-website-guide.ja.md)

📌 **标签** — `#AI智能体` `#WebMCP` `#llms-txt` `#语义化HTML` `#无障碍性` `#Schema.org` `#GEO` `#CoreWebVitals` `#MCP`

---

## 概览(TL;DR)

- **适合谁读**：前端开发者、技术写作者、DevRel、产品经理、SEO/GEO 负责人、CTO
- **能获得什么**：智能体识别网站的 3 种方式、Google 七大原则、语义化 HTML·ARIA·Schema.org 代码示例、llms.txt 标准结构、WebMCP 落地策略、四阶段落地路线图
- **为什么是现在**：根据 Pew Research(2024)的数据，Google 用户在看到 AI 摘要后，搜索结果链接的点击率下降了一半。有一半的流量取决于“智能体是否能理解我的网站”
- **阅读所需时间**：约 35 分钟 · 落地启动约需 1～2 周

---

## 目录

1. [新访客：AI 智能体的崛起](#1-新访客ai智能体的崛起)
2. [智能体如何看待网站](#2-智能体如何看待网站)
3. [Google 的七大智能体友好原则](#3-google的七大智能体友好原则)
4. [语义化 HTML 与无障碍树实战指南](#4-语义化html与无障碍树实战指南)
5. [布局稳定性与视觉信号](#5-布局稳定性与视觉信号)
6. [结构化数据：Schema.org 与 JSON-LD](#6-结构化数据schemaorg与json-ld)
7. [AI 入口标准——llms.txt](#7-ai入口标准llmstxt)
8. [WebMCP——下一代智能体接口](#8-webmcp下一代智能体接口)
9. [智能体友好最佳实践站点分析](#9-智能体友好最佳实践站点分析)
10. [智能体友好度审计清单](#10-智能体友好度审计清单)
11. [分阶段落地路线图](#11-分阶段落地路线图)
- [附录 A. 术语表](#附录a术语表)
- [附录 B. 参考文献与来源](#附录b参考文献与来源)

---

## 1. 新访客：AI 智能体的崛起

### 1.1 什么是"智能体"

根据 Google web.dev 的定义，智能体是"接收并解释输入，代表用户(人类或其他智能体)制定计划并执行任务的系统"。智能体不是单一的 LLM，而是**模型、规则、记忆、工具**相结合的一体化单元。

#### 定义智能体的 4 个特性

- **自主性(Autonomous)**：无需人类直接干预即可运作
- **交互性(Interactive)**：能与其他智能体及人类对话
- **反应性(Reactive)**：感知环境变化并作出响应
- **主动性(Proactive)**：为达成既定目标而主动采取行动

#### 智能体的四阶段工作流程

1. **接收查询** —— 接收用户的自然语言请求或来自其他智能体的请求
2. **制定计划** —— 通过 LLM 生成解决请求的分步方案
3. **执行计划** —— 调用工具(API、浏览器、MCP 服务器等)完成实际任务
4. **存储学习结果** —— 将结果和上下文记录到短期或长期记忆中

### 1.2 人类、爬虫与智能体的区别

即使访问同一个网站,这三类访客的运作方式也截然不同。

| 访客类型 | 行为模式 | 意图 | 优化重点 |
|---|---|---|---|
| 人类用户 | 基于视觉、情感与语境浏览 | 购买·获取信息·娱乐 | 设计、文案、性能、无障碍性 |
| 搜索爬虫 | 收集链接图谱 | 索引·排名 | robots.txt、sitemap.xml、元数据 |
| 训练用爬虫(如 Common Crawl) | 大规模文本采集 | LLM 训练数据 | robots.txt、AI 训练拒绝策略 |
| **AI 智能体(代理)** | **执行目标导向的操作** | **完成用户任务(购买、预订、填表)** | **语义化 HTML、无障碍树、WebMCP、llms.txt** |

> 💡 **核心区别**：爬虫只会“读取”，而智能体会执行“读取+点击+输入+支付”。因此,智能体在安全性、用户同意、视觉稳定性方面提出了远比爬虫更严苛的要求。

### 1.3 按数据归属关系划分的三种智能体类型

- **零方智能体(Zero-party)** —— 仅在浏览器内使用本地数据(例如 Chrome 内置的 Gemini Nano)。隐私保护角度最安全。
- **一方智能体(First-party)** —— 服务运营方用自己的数据直接构建的智能体(例如 Google 地图内由 Google 运营的旅行规划器)。信任度与控制力最高。
- **三方智能体(Third-party)** —— 由外部开发者构建的智能体将我们的网站作为数据来源使用(例如用户的 ChatGPT 在我们的商城下单)。我们的网站变成了“智能体的第三方信息提供商”。

> 📌 **实务启示**：韩国大多数电商、旅游、金融科技网站,通常都处于“第三方智能体的信息提供商”这一位置。需要设计明确的确认环节(Human-in-the-loop),以便智能体能够处理支付、身份验证、条款同意等流程。

---

## 2. 智能体如何看待网站

智能体并不是用显示器“看”网站,而是基于网站的**机器可读表示(machine-readable representation)**进行操作。这种表示的质量直接决定了智能体的表现,Google 定义了三种基本模态。

### 2.1 模态一：截图(视觉分析)

智能体截取渲染后的页面,用视觉模型进行分析。右上角的放大镜图标会被解读为搜索框,页面中央的大方块会被解读为输入表单,以此类推。诸如“大号的‘删除’按钮比小号的‘帮助’链接更被重视”这样的现象说明**颜色、大小、临近关系决定了重要性**。

- **优点**：能看到经 CSS、JS 完全渲染后的最终画面,可以直接利用视觉设计信号
- **缺点**：token 成本非常高且速度慢。通常仅作为 DOM、无障碍树出现问题时的备用手段

### 2.2 模态二：HTML / DOM

智能体直接解析 DOM 树,读取元素之间的关系与层级结构。如果“立即购买”按钮位于某个商品容器*内部*,智能体就会推断该按钮属于*那个商品*。因此,DOM 的嵌套结构以及 class、id 的命名都必须具有实际意义。

### 2.3 模态三：无障碍树(Accessibility Tree)

无障碍树是浏览器原生提供的 API,是从 DOM 中提炼出的最重要的**“交互元素的角色(role)、名称(name)、状态(state)”**语义摘要。它最初是为屏幕阅读器等辅助技术而设计的,但对 AI 智能体而言,它相当于一份**“去除了 CSS 视觉噪音的高质量地图”**。

> 🔍 **自行验证方法**：Chrome DevTools → Elements → 右侧“Accessibility”面板 → 启用“Full-page accessibility tree”。在这里出现“button”“link”“textbox”等角色标签缺失的地方,正是智能体会失败的位置。

### 2.4 组合模态(Combined Modalities)

最新的智能体(ChatGPT Agent、Claude for Chrome、Gemini in Chrome 等)不会依赖单一输入。它们通过 DOM 与无障碍树获取交互元素的结构化列表,再通过截图交叉验证视觉位置与分组关系。

> 🎯 **开发者的职责**：在截图、DOM、无障碍树这三个通道中始终提供干净一致的信号。不能只优化其中一个通道——当三者相互印证时,智能体才能最稳定地运作。

---

## 3. Google 的七大智能体友好原则

以下详细展开 Google web.dev 提出的构建智能体友好型网站的七项建议,并附代码示例。**这些原则全部同时也能改善人类用户的无障碍性与体验。**

### 原则 1. 所有必要操作都要在界面中明确体现

只能通过键盘快捷键或鼠标右键菜单访问的功能,智能体是无法发现的。

- ❌ **反面示例**：必须按下 “Ctrl+Shift+D” 才会出现下载菜单的 SaaS 仪表盘
- ✅ **正面示例**：工具栏中有明确的 [下载] 按钮,快捷键只是辅助方式

### 原则 2. 保证布局的稳定性

如果智能体每次截图看到的页面都不一样,就会产生困惑。如果“加入购物车”按钮在每个品类页面的位置都不同,智能体就必须为每个品类重新学习一次。

**实务建议**：
- 在模板层面统一“主要 CTA 的位置”
- 将 CLS(累积布局偏移)保持在 0.1 以下(Core Web Vitals)
- 使用骨架屏(Skeleton UI),在加载过程中也保持最终布局的形态
- 避免动态改变位置的“跳动式”广告横幅

### 原则 3. 避免"幽灵元素"和透明遮罩层

如果一个透明的 div 盖住了真正的按钮,智能体的视觉分析可能会忽略这个“被遮盖的节点”。

```css
/* ❌ 反面示例：不可见的 div 盖在按钮上方 */
.overlay-trap {
  position: absolute;
  inset: 0;
  background: transparent;
  z-index: 9999;  /* 遮住了真正的按钮 */
}

/* ✅ 正面示例：明确设置 pointer-events + 有意义的 z-index */
.overlay-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;  /* 点击可以穿透到下方 */
  z-index: 1;
}
```

### 原则 4. 用语义化 HTML 设计可执行的元素

不要用 div、span 来伪装成按钮,而应直接使用 `<button>` 和 `<a>` 标签。智能体会将这两种标签无条件识别为可交互元素。

```html
<!-- ❌ 反面示例：div 按钮 -->
<div class="btn-primary" onclick="submit()">
  下单
</div>

<!-- ⚠️ 次优方案：无法使用语义化标签时,用 ARIA 补强 -->
<div role="button" tabindex="0"
     aria-label="下单"
     onclick="submit()"
     onkeydown="if(event.key==='Enter')submit()">
  下单
</div>

<!-- ✅ 正面示例：真正的 button -->
<button type="submit" class="btn-primary">
  下单
</button>
```

### 原则 5. 在 CSS 中设置 `cursor: pointer`

鼠标指针变成手指形状,对智能体的视觉模型来说也是一个强烈的信号,表示“这里可以点击”。

```css
.product-card { cursor: pointer; }
.disabled-button { cursor: not-allowed; }
```

### 原则 6. 用 `<label>` 的 `for` 属性关联输入字段

仅靠 `placeholder` 是不够的——placeholder 在开始输入后会消失,并且不会包含在无障碍树中。

```html
<!-- ❌ 反面示例：只使用 placeholder -->
<input type="email" placeholder="请输入邮箱" />

<!-- ✅ 正面示例：label 与 for/id 相关联 -->
<label for="user-email">邮箱地址</label>
<input type="email"
       id="user-email"
       name="email"
       autocomplete="email"
       required
       placeholder="name@example.com" />

<!-- ✅ 更好的示例：视觉上隐藏标签,但暴露给无障碍树 -->
<label for="search" class="sr-only">站内搜索</label>
<input type="search" id="search" name="q" />
```

### 原则 7. 交互元素必须大于 8 的平方像素

小于 8 像素 × 8 像素(=64 平方像素)的元素,可能会被智能体的视觉分析当作“噪音”过滤掉。

- 主要 CTA 按钮：最小 44px × 44px(Apple HIG 标准)
- 表单字段高度：最小 40px
- 图标按钮：视觉上可以是 24px,但要通过 padding 保证点击区域至少 44px 以上
- 关闭(X)按钮：即使视觉上想做得小一些,点击区域也要足够大

---

## 4. 语义化 HTML 与无障碍树实战指南

### 4.1 从"div 汤"到"语义化地标"

韩国的许多网站仍处于用 div 把 React/Vue 组件全部包裹起来的“div 汤”状态。在这种状态下,无障碍树几乎是扁平的,智能体无法为页面绘制出“地图”。

| 语义化标签 | 无障碍树角色 | 智能体的用途 |
|---|---|---|
| `<header>` | banner | 识别站点、识别 logo/导航 |
| `<nav>` | navigation | 自动发现主菜单 |
| `<main>` | main | 定位正文内容区域 |
| `<article>` | article | 识别独立内容单元(博客文章等) |
| `<aside>` | complementary | 区分辅助信息区域 |
| `<footer>` | contentinfo | 定位站点信息·条款位置 |
| `<section>` | region(需要 aria-label) | 按主题分组 |
| `<button>` | button | 立即识别为可点击操作 |
| `<a href>` | link | 识别导航目标 |
| `<input>` | textbox / checkbox / radio 等 | 自动映射表单字段 |

### 4.2 页面骨架的最佳示例

```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title>产品详情 - Acme</title>
  <link rel="alternate" type="text/markdown"
        href="/products/widget-pro.md" />  <!-- llms.txt 兼容 -->
</head>
<body>
  <header>
    <a href="/" aria-label="返回首页">
      <img src="/logo.svg" alt="Acme" />
    </a>
    <nav aria-label="主菜单">
      <ul>
        <li><a href="/products">产品</a></li>
        <li><a href="/pricing">价格</a></li>
        <li><a href="/docs">文档</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <h1>Widget Pro</h1>
      <section aria-labelledby="specs">
        <h2 id="specs">规格</h2>
        <!-- ... -->
      </section>
      <button type="button" data-action="add-to-cart">
        加入购物车
      </button>
    </article>
  </main>

  <footer>
    <p>© 2026 Acme</p>
  </footer>
</body>
</html>
```

### 4.3 ARIA：补强语义的 4 个核心属性

#### `aria-label` / `aria-labelledby`

为元素赋予"名称"。对于像图标按钮这种没有文字的元素来说是必需的。

```html
<!-- 只有图标的关闭按钮 -->
<button aria-label="关闭窗口">
  <svg><!-- X icon --></svg>
</button>

<!-- 用其他元素的文字作为标签 -->
<section aria-labelledby="pricing-title">
  <h2 id="pricing-title">套餐价格</h2>
</section>
```

#### `aria-describedby`

关联附加说明。常用于表单字段的帮助文本、错误消息。

```html
<label for="pwd">密码</label>
<input id="pwd" type="password"
       aria-describedby="pwd-help pwd-error" />
<p id="pwd-help">至少 8 位,包含字母、数字与特殊符号</p>
<p id="pwd-error" role="alert">密码太短</p>
```

#### `aria-expanded`、`aria-controls`

表达下拉菜单、手风琴、模态框的状态与控制关系。让智能体知道“当前是打开还是关闭”。

```html
<button aria-expanded="false" aria-controls="faq-1">
  运费需要多久?
</button>
<div id="faq-1" hidden>
  一般为 2～3 个工作日。
</div>
```

#### `role`

当无法使用语义化标签时,用来显式指定角色。必须同时提供 `tabindex="0"` 与键盘事件处理器,才能构成完整的"按钮"。

```html
<div role="button" tabindex="0"
     aria-label="切换主题"
     onclick="toggleTheme()"
     onkeydown="if(['Enter',' '].includes(event.key))toggleTheme()">
  🌙
</div>
```

> 📐 **ARIA 第一定律**:"尽量不要使用 ARIA,而是使用语义化 HTML。"ARIA 只应用于语义化 HTML 无法表达的模式(标签页、树形视图、组合框等)。用错的 ARIA 比完全不用还要糟糕。

---

## 5. 布局稳定性与视觉信号

### 5.1 Core Web Vitals 与智能体

| 指标 | 含义 | 对智能体的影响 |
|---|---|---|
| **LCP** | 最大内容绘制时间(目标 < 2.5s) | 智能体判断页面"已就绪"的时间点 |
| **INP** | 下次绘制的交互延迟(< 200ms) | 智能体点击后的响应速度——避免超时 |
| **CLS** | 累积布局偏移(< 0.1) | 决定基于截图·坐标点击的准确度 |

### 5.2 "透明遮罩陷阱"的 4 种模式

务必将其纳入 UX QA 检查清单。

1. **Cookie 同意横幅** —— 页面加载后立刻覆盖整个屏幕,导致智能体无法到达正文
2. **邮件订阅弹窗** —— 3 秒后自动弹出。关闭按钮过小或 ESC 键无效
3. **悬浮聊天机器人** —— 遮挡右下角的 CTA 按钮,导致智能体点击"购买"失败
4. **z-index 设置错误的页头** —— 滚动时遮挡内容,导致基于坐标的点击偏离目标

> ✅ **推荐做法**:Cookie 同意组件应使用语义化的 `<dialog>`,并明确设置 `role="dialog"`、`aria-modal="true"`,同时将默认焦点放在"接受"或"拒绝"按钮上。

### 5.3 视觉信号检查清单

- [ ] 悬停时明确设置 `cursor: pointer`
- [ ] 绝不移除焦点环(禁止使用 `outline: none`)
- [ ] 主要 CTA 通过颜色、大小、留白确保视觉层级
- [ ] 禁用状态使用 `cursor: not-allowed` + `opacity: 0.5`
- [ ] 悬停状态下位置·大小不变,优先使用颜色变化而非 `transform: scale`

---

## 6. 结构化数据:Schema.org 与 JSON-LD

如果说语义化 HTML 告诉智能体"这个元素是什么",那么结构化数据(Structured Data)则告诉智能体"这整个页面讲的是什么"。智能体会将以 Schema.org 词汇标记的 JSON-LD 视为**高可信度的事实信息(ground truth)**。

### 6.1 为什么选择 JSON-LD

- **相较 Microdata/RDFa 分离度更高**:不会污染 HTML 标记,独立封装在 `<script>` 标签中
- **Google、Bing、LLM 都推荐使用**:Anthropic、OpenAI、Perplexity 都会优先解析
- **易于维护**:在 CMS、静态网站生成器中易于模板化

### 6.2 六大核心 Schema

#### Organization —— 所有网站的基础

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Betalabs Inc.",
  "url": "https://betalabs.io",
  "logo": "https://betalabs.io/logo.svg",
  "sameAs": [
    "https://github.com/betalabs",
    "https://www.linkedin.com/company/betalabs"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@betalabs.io",
    "availableLanguage": ["ko", "en"]
  }
}
```

#### Product —— 电子商务

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Widget Pro",
  "sku": "WP-2026-001",
  "brand": { "@type": "Brand", "name": "Acme" },
  "description": "高性能小工具,支持多语言",
  "image": "https://acme.com/widget.jpg",
  "offers": {
    "@type": "Offer",
    "price": "49900",
    "priceCurrency": "KRW",
    "availability": "https://schema.org/InStock",
    "url": "https://acme.com/products/widget-pro"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "342"
  }
}
```

#### FAQPage —— 客户支持页面

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "退款政策是什么?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "购买后 14 天内,如商品未使用可全额退款。"
    }
  }]
}
```

#### BreadcrumbList —— 站点层级结构

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1,
      "name": "首页", "item": "https://acme.com/" },
    { "@type": "ListItem", "position": 2,
      "name": "产品", "item": "https://acme.com/products" },
    { "@type": "ListItem", "position": 3,
      "name": "Widget Pro" }
  ]
}
```

#### Article —— 博客·新闻 / Event —— 活动·网络研讨会

这两种 schema 的核心都在于 `datePublished`、`author`、`location` 等字段。详细结构请参考 [schema.org](https://schema.org) 的官方文档。

> 🛠 **校验工具**:可以在 [Google Rich Results Test](https://search.google.com/test/rich-results) 和 [Schema Markup Validator](https://validator.schema.org) 中校验 JSON-LD。上线前务必通过校验。

---

## 7. AI 入口标准——llms.txt

如果 robots.txt 是为爬虫制定的规约,那么**llms.txt 就是为"推理时(inference time)的 LLM 智能体"设计的入口文件**。它由 Jeremy Howard(Answer.AI 联合创始人)于 2024 年 9 月提出,截至 2026 年,已被 **Anthropic、Cloudflare、Vercel、Stripe、Perplexity、Maryland.gov** 等采用。WordPress(Yoast 插件)、Webflow、Mintlify 都提供原生支持。

### 7.1 为什么需要它

由于 LLM 的上下文窗口有限,无法一次性读取整个常规 HTML 网站。经过广告、导航、JavaScript 渲染之后,一半以上的 token 都消耗在了“噪音”上。llms.txt 以精心策划的 Markdown“备忘单”的形式提供网站的核心内容,从而**将 token 使用量减少 50%～70%**。

### 7.2 两种文件

| 文件 | 作用 | 大小(大致) |
|---|---|---|
| `/llms.txt` | 站点地图(目录 + 链接) | 1,000～3,000 tokens |
| `/llms-full.txt` | 全部内容扁平化后的单一 Markdown | 数万至数十万 tokens |

根据 Profound 的测量数据,AI 智能体访问 `/llms-full.txt` 的频率是 `/llms.txt` 的**两倍以上**。通常的做法是先从 `llms.txt` 开始,等运营基础设施准备好后再补充 `llms-full.txt`。

### 7.3 llms.txt 标准结构

```markdown
# Acme Web3 Platform

> Acme 是面向韩国·亚洲市场的区块链基础设施运营商。
> 提供稳定币发行、K-pop 票务、NFT 交易市场等服务。

核心理念:
- 所有 API 均通过 REST + WebSocket 提供
- 认证方式:API Key 或 OAuth 2.0
- 支持韩语/英语/日语/中文 4 种语言

## 核心文档

- [快速上手指南](https://acme.io/docs/getting-started.md):
  5 分钟内完成第一笔交易的教程
- [API 参考文档](https://acme.io/docs/api.md):
  全部端点、参数、响应格式
- [SDK](https://acme.io/docs/sdk.md):
  JavaScript、Python、Go、Java SDK

## 解决方案

- [稳定币(STABLE1)](https://acme.io/products/stable1.md)
- [票务 NFT](https://acme.io/products/ticketing.md)

## Optional

- [公司简介](https://acme.io/about.md)
- [博客(最近 30 篇)](https://acme.io/blog/feed.md)
```

#### 结构规则

1. 第一行为 `# H1`(站点名称)——**必需**
2. 用 `>` 引用符写 1～3 句摘要——**强烈推荐**。这会成为 LLM 的“站点心理模型”
3. 用普通 Markdown 段落补充核心背景信息——推荐
4. 用 `## H2` 分节对页面分组(例如核心文档、解决方案、政策)
5. 每个条目采用 `[标题](URL.md): 一句话描述` 的格式
6. `## Optional` 部分放"有则更好、没有也无妨"的资料——LLM 会降低其优先级

### 7.4 逐页转换为 .md

如果 llms.txt 是"地图",那么每个页面的 .md 文件就是"实地"。请将服务器配置为:当同一个 URL 以 .md 扩展名被请求时,返回干净的 Markdown 内容。

```http
# 模式 1:扩展名分流
GET /products/widget-pro      → HTML(面向人类)
GET /products/widget-pro.md   → Markdown(面向 LLM)

# 模式 2:Content-Type 协商
GET /products/widget-pro
Accept: text/markdown          → 返回 Markdown
Accept: text/html              → 返回 HTML
```

建议在每个页面 HTML 的 `<head>` 中,像下面这样明确标注 Markdown 替代版本。

```html
<link rel="alternate"
      type="text/markdown"
      href="https://acme.io/products/widget-pro.md" />
```

### 7.5 运营注意事项

> ⚠️ **最常见的失败模式**:只创建一次 llms.txt 而不再更新。**过时的索引比没有还糟糕**——因为这相当于主动向智能体提供错误信息。应将 llms.txt 的重新生成整合进 sitemap 构建流水线,并在重大发布时自动同步更新。

### 7.6 与 robots.txt 的关系

robots.txt 说的是"这里不要去",而 llms.txt 说的是"这个很重要"。**两者是互补关系,并不冲突**。关于拒绝 AI 训练的政策,应遵循独立于 robots.txt 的 `ai.txt`,或 IETF AI Preferences Working Group 正在制定中的标准。

---

## 8. WebMCP——下一代智能体接口

**WebMCP 是 Chrome 团队于 2026 年 2 月以早期预览计划(Early Preview Program)形式公开的提案标准**。当前"通过截图、无障碍树推断 DOM"的方式虽然稳健,但速度较慢。WebMCP 提供了一个让网站直接向智能体暴露"结构化工具(Tool)"的通道,从而消除歧义,大幅提升任务执行速度与可靠性。

### 8.1 两种 API

#### 声明式 API——直接在 HTML 表单中声明

标准化的操作可以仅用 HTML 声明。

```html
<!-- 概念示例(准确语法请参考 EPP 文档) -->
<form data-mcp-tool="searchProducts"
      data-mcp-description="在目录中搜索产品">
  <label for="q">搜索词</label>
  <input id="q" name="query"
         data-mcp-param="query"
         data-mcp-type="string"
         required />
  <label for="price">最高价格(元)</label>
  <input id="price" name="max_price"
         data-mcp-param="max_price"
         data-mcp-type="number" />
  <button type="submit">搜索</button>
</form>
```

#### 命令式 API——用 JavaScript 动态注册工具

对于复杂流程(多步骤支付、实时报价等),用 JavaScript 注册工具。

```javascript
// 概念性伪代码
navigator.mcp?.registerTool({
  name: 'createSupportTicket',
  description: '创建技术支持工单',
  parameters: {
    title: { type: 'string', required: true },
    severity: { type: 'enum',
                values: ['low', 'normal', 'high', 'critical'] },
    description: { type: 'string' }
  },
  handler: async ({ title, severity, description }) => {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      body: JSON.stringify({ title, severity, description })
    });
    return await res.json();
  }
});
```

### 8.2 代表性使用场景

- **客户支持**:智能体自动填充用户的系统环境(操作系统·浏览器·应用版本),生成准确的支持工单
- **电子商务**:智能体准确地完成商品搜索、选项选择、支付流程
- **旅行**:结构化搜索、筛选、预订。在如机票预订这类需要多步骤的任务中表现出优势
- **金融科技/Web3**:明确表达连接钱包、交易签名等安全敏感操作的意图

### 8.3 参与早期预览计划(EPP)

可以在 [developer.chrome.com/docs/ai/join-epp](https://developer.chrome.com/docs/ai/join-epp) 注册 Chrome WebMCP EPP。

> 🚀 **落地策略**:目前没有必要在所有页面上立即应用 WebMCP。先识别出价值最高的"希望智能体代为完成的 3～5 个核心操作"(例如商品搜索、支付、创建支持工单)。针对这些操作先做 PoC,等标准稳定后再向全公司推广。

---

## 9. 智能体友好最佳实践站点分析

### 9.1 Anthropic Docs

- **URL**:[docs.anthropic.com](https://docs.anthropic.com) · **llms.txt**:[docs.anthropic.com/llms.txt](https://docs.anthropic.com/llms.txt)
- 由 Mintlify 托管,所有文档都自动提供 .md 转换版本
- 同时提供 llms.txt 和 llms-full.txt
- 代码块具有清晰的语言标签和复制按钮
- 左侧树形导航使用语义化的 `<nav>` 标记
- 也通过 MCP 服务器(mcpdoc)将相同内容暴露给 IDE

### 9.2 Vercel

- **URL**:[vercel.com](https://vercel.com) · **llms.txt**:[vercel.com/docs/llms.txt](https://vercel.com/docs/llms.txt)
- 每个 API 端点都有丰富的上下文说明——提升智能体选择工具的准确度
- 在文档 URL 后加上 .md 即可返回 Markdown 内容
- CTA 按钮在所有页面上位置一致——布局稳定性良好

### 9.3 Cloudflare Developers

- **URL**:[developers.cloudflare.com](https://developers.cloudflare.com) · **llms.txt**:[developers.cloudflare.com/llms.txt](https://developers.cloudflare.com/llms.txt)
- 同时提供 llms.txt + llms-full.txt
- 按产品分组清晰地划分为 `## H2` 各章节
- Workers 代码示例附带可直接运行的 Playground URL

### 9.4 Stripe Docs

- **URL**:[docs.stripe.com](https://docs.stripe.com)
- 通过 Stripe Workbench,LLM 可以模拟真实的 API 调用
- 每个页面的"API 对象架构"都用 JSON-LD 标记
- 在 header 层级暴露 Idempotency Key、错误代码等"对智能体可靠性至关重要的信息"

### 9.5 Maryland.gov——公共部门案例

- **URL**:[maryland.gov](https://www.maryland.gov) · **llms.txt**:[maryland.gov/llms.txt](https://www.maryland.gov/llms.txt)
- 在 llms.txt 中明确写明"不得用于法律、政策或资格判定"的使用政策
- 明确列出无障碍政策、联系方式、更新周期
- 是公共网站首个通过 llms.txt 提供"AI 使用指南"的最佳实践案例

### 9.6 Mintlify 托管站点群

[Mintlify](https://mintlify.com) 会为其托管的所有文档站点自动提供 llms.txt + MCP 服务器。Cursor、Bolt.new、Resend、Octokit 等数千个文档站点都是这一标准的直接受益者。如果想快速在内部文档站点上落地,可以考虑 Mintlify 或其替代方案(Docusaurus + docusaurus-plugin-llms、Astro Starlight)。

### 9.7 可应用到自己网站的 7 条经验

1. 文档、核心页面提供 .md 替代 URL
2. 将 /llms.txt 放在域名根目录
3. 核心 CTA 在所有页面保持相同位置
4. 用 JSON-LD 标记 API 对象、产品、组织信息
5. 代码示例始终链接到可运行的环境(Playground/Replit)
6. 在 llms.txt 中明确说明政策与免责声明
7. 识别出 3～5 个核心工作流作为 WebMCP 候选项

---

## 10. 智能体友好度审计清单

可以用以下清单来直接检查自己网站的"智能体友好度"。给每个项目按页面打分(✅/⚠️/❌),制作成季度追踪表。

### 10.1 HTML 结构(权重 30%)

- [ ] `<html lang="...">` 中标注了正确的语言代码
- [ ] 使用了 `header` / `nav` / `main` / `footer` 语义化标签
- [ ] 每个页面只有一个 `<h1>`
- [ ] 标题按 h1 → h2 → h3 的顺序使用,不跳级
- [ ] 所有可点击元素都是 `<button>` 或 `<a href>`
- [ ] 表单输入项都关联了 `<label for>`
- [ ] 图片有具有意义的 alt 文本

### 10.2 无障碍树(权重 20%)

- [ ] Chrome DevTools 无障碍树中不存在扁平化结构问题
- [ ] 所有按钮、链接都有“名称(name)”
- [ ] 图标按钮设置了 `aria-label`
- [ ] 模态框、下拉菜单设置了 `aria-expanded` / `aria-controls`
- [ ] Lighthouse 无障碍性得分 ≥ 95

### 10.3 视觉与布局(权重 15%)

- [ ] CLS < 0.1
- [ ] LCP < 2.5s
- [ ] 主要 CTA 在所有页面位置一致
- [ ] 可点击元素 ≥ 44×44px
- [ ] 设置了 `cursor: pointer`
- [ ] 不存在因透明遮罩层导致的点击被阻挡问题

### 10.4 结构化数据(权重 15%)

- [ ] 站点全局的 `Organization` JSON-LD
- [ ] 各页面类型对应恰当的 schema(`Product` / `Article` / `FAQPage` 等)
- [ ] 通过 Schema Markup Validator 校验
- [ ] 用 `BreadcrumbList` 表达层级结构

### 10.5 AI 入口(权重 15%)

- [ ] 存在 /llms.txt,且在最近 30 天内更新过
- [ ] 存在 /llms-full.txt(可选)
- [ ] 核心页面提供 .md 替代 URL
- [ ] HTML `<head>` 中包含 `rel="alternate" type="text/markdown"`
- [ ] robots.txt 中标明了 llms.txt 的位置

### 10.6 下一代技术(权重 5%)

- [ ] 已识别出 3～5 个核心操作作为 WebMCP 候选项
- [ ] 已加入 Chrome EPP 并正在进行 PoC

### 10.7 自动化工具

| 工具 | 用途 | URL |
|---|---|---|
| Lighthouse | 自动评估无障碍性、性能、SEO | Chrome DevTools 内置 |
| Pa11y | 基于 CLI 的无障碍性自动化检测 | [pa11y.org](https://pa11y.org) |
| axe DevTools | 深入的无障碍性检查 | [deque.com/axe](https://www.deque.com/axe) |
| Schema Validator | JSON-LD 校验 | [validator.schema.org](https://validator.schema.org) |
| Rich Results Test | Google 友好度检测 | [search.google.com/test/rich-results](https://search.google.com/test/rich-results) |
| llms-txt.io 校验器 | llms.txt 规范校验 | [llms-txt.io](https://llms-txt.io) |

---

## 11. 分阶段落地路线图

不可能一次性完成所有事项。建议分为 4 个阶段,按季度逐步推进。

### 阶段 1(1～2 周):立即可完成的快速胜利

1. 用 Chrome DevTools 无障碍树审计主页和结账页面
2. 将 div 按钮批量替换为 `<button>`
3. 为只有 placeholder 的输入字段添加 `<label for>`
4. 将 `cursor: pointer` 加入全局设计规范
5. 在站点全局添加一个 Schema.org Organization JSON-LD

### 阶段 2(3～6 周):结构加固

1. 一致地应用语义化地标(header/nav/main/footer)
2. 为所有模态框、下拉菜单添加 ARIA 状态属性
3. 为核心页面类型添加 JSON-LD(Product、Article、FAQPage)
4. 达成 CLS / LCP / INP 目标
5. 达成 Lighthouse 无障碍性得分 95+

### 阶段 3(7～10 周):AI 入口标准

1. 编写并部署 /llms.txt 初版
2. 为核心文档页面提供 .md 替代 URL
3. 将 llms.txt 自动更新流水线集成到 CMS/SSG 中
4. 评估并引入 /llms-full.txt
5. 明确 AI 训练/推理使用政策

### 阶段 4(第 11 周以后):下一代接口

1. 加入 Chrome WebMCP EPP
2. 选定 3～5 个“希望智能体代为完成”的核心操作
3. 声明式 API 应用 PoC
4. 命令式 API 应用 PoC(复杂工作流)
5. 随着 WebMCP 标准趋于稳定,逐步向全公司推广

### 11.1 KPI 设置

| 指标 | 阶段 1 后 | 阶段 2 后 | 阶段 3 后 | 阶段 4 后 |
|---|---|---|---|---|
| Lighthouse 无障碍性 | 85+ | 95+ | 95+ | 95+ |
| CLS | < 0.25 | < 0.1 | < 0.1 | < 0.1 |
| JSON-LD 覆盖率 | 30% | 70% | 90% | 95% |
| llms.txt | — | — | v1 上线 | 每周更新 |
| 智能体流量占比 | 基线 | +30% | +80% | +150% |
| AI 引用/提及频率 | 基线 | +20% | +60% | +120% |

---

## 附录A. 术语表

- **无障碍树(Accessibility Tree)** —— 浏览器从 DOM 中为辅助技术提取的语义树。是 AI 智能体的核心输入。
- **语义化 HTML** —— 直接体现元素含义的 HTML 使用方式。例如用 button、nav 代替 div。
- **JSON-LD** —— JSON 格式的关联数据(Linked Data)。是表达 Schema.org 词汇的标准方式。
- **Schema.org** —— 由 Google、Microsoft、Yahoo、Yandex 共同运营的结构化数据词汇标准。
- **llms.txt** —— Jeremy Howard 于 2024 年 9 月提出的、面向 LLM 的站点入口 Markdown 文件。
- **llms-full.txt** —— 将整站内容扁平化后的单一 Markdown 文件。由 Mintlify 与 Anthropic 共同开发。
- **WebMCP** —— Chrome 团队提出的、从网站到 AI 智能体的结构化工具接口标准(2026 EPP)。
- **MCP(Model Context Protocol)** —— Anthropic 于 2024 年 11 月发布的 LLM 与外部工具之间的通信协议。
- **智能体(Agent)** —— 接收输入并进行规划、执行、学习的自主系统。由模型、规则、记忆、工具构成。
- **零方智能体** —— 仅使用浏览器内本地数据的智能体。
- **一方智能体** —— 由服务运营方用自身数据提供的智能体。
- **三方智能体** —— 由外部开发者构建、将我们的网站作为数据·工具来源使用的智能体。
- **Human-in-the-loop(HITL)** —— 设计为在关键决策点需要人工确认的 AI 运作模式。
- **Core Web Vitals** —— Google 定义的三大网页性能指标:LCP、INP、CLS。
- **GEO(Generative Engine Optimization)** —— 为在生成式 AI 搜索中获得曝光而优化网站的活动。是 SEO 的后续概念。

---

## 附录B. 参考文献与来源

### 一次文献

- Kulikowski, K. & More, O. (2026-04-01). **构建对话式助手友好的网站**. [web.dev/articles/ai-agent-site-ux](https://web.dev/articles/ai-agent-site-ux). Google web.dev.
- Klepper, A., Kulikowski, K., & Nabors, R. L. (2025-02-25). **智能体介绍**. [web.dev/articles/ai-agents](https://web.dev/articles/ai-agents). Google web.dev.
- Bandarra, A. C. (2026-02-10). **WebMCP 现已开放早期预览体验**. [developer.chrome.com/blog/webmcp-epp](https://developer.chrome.com/blog/webmcp-epp). Chrome for Developers.
- Howard, J. (2024-09). **The /llms.txt file**. [llmstxt.org](https://llmstxt.org). Answer.AI.

### 相关标准与工具

- **Schema.org**: [schema.org](https://schema.org)
- **Web Accessibility Initiative(WAI-ARIA)**: [w3.org/WAI/ARIA/apg/](https://www.w3.org/WAI/ARIA/apg/)
- **Core Web Vitals**: [web.dev/vitals](https://web.dev/vitals)
- **Mintlify(自动生成 llms.txt + MCP)**: [mintlify.com](https://mintlify.com)
- **docusaurus-plugin-llms**: [github.com/rachfop/docusaurus-plugin-llms](https://github.com/rachfop/docusaurus-plugin-llms)
- **MCP 官方**: [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **加入 Chrome AI EPP**: [developer.chrome.com/docs/ai/join-epp](https://developer.chrome.com/docs/ai/join-epp)

### 许可声明

本文档包含对 Google web.dev 与 Chrome for Developers 内容的引用、翻译与重新整理部分。相关内容依据 [Creative Commons Attribution 4.0 许可协议(CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) 及 [Apache 2.0 许可协议](https://www.apache.org/licenses/LICENSE-2.0) 提供。详情请参阅 [Google Developers 网站政策](https://developers.google.com/site-policies)。

本指南文档本身以 **CC BY 4.0** 许可发布,标明出处后可自由使用、翻译、引用。

---

## 作者信息

**Dennis Kim(金浩光 / HoKwang Kim)**
- Betalabs Inc. CEO
- Cyworld Z 前 CEO
- Microsoft Azure MVP(长期获奖者)
- Web3Paper 发行人
- GitHub: [@gameworkerkim](https://github.com/gameworkerkim)

---

<!-- Schema.org TechArticle metadata for AI agents -->
<!--
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "构建智能体友好型网站的实务技术指南",
  "alternateName": "Agent-Friendly Website Construction: A Practical Technical Guide",
  "description": "整合 AI 智能体时代 Web UX、无障碍性与结构化数据标准的实务指南",
  "inLanguage": "zh",
  "author": {
    "@type": "Person",
    "name": "Dennis Kim",
    "alternateName": "金浩光 / HoKwang Kim",
    "jobTitle": "CEO of Betalabs Inc.",
    "url": "https://github.com/gameworkerkim"
  },
  "datePublished": "2026-05-19",
  "dateModified": "2026-05-19",
  "version": "1.0",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "keywords": "AI agents, agent-friendly websites, llms.txt, WebMCP, semantic HTML, accessibility tree, Schema.org, GEO",
  "about": [
    { "@type": "Thing", "name": "AI Agents" },
    { "@type": "Thing", "name": "Web Accessibility" },
    { "@type": "Thing", "name": "llms.txt standard" },
    { "@type": "Thing", "name": "WebMCP" },
    { "@type": "Thing", "name": "Schema.org Structured Data" }
  ],
  "isBasedOn": [
    {
      "@type": "CreativeWork",
      "url": "https://web.dev/articles/ai-agent-site-ux",
      "author": ["Kasper Kulikowski", "Omkar More"],
      "publisher": "Google web.dev",
      "datePublished": "2026-04-01"
    },
    {
      "@type": "CreativeWork",
      "url": "https://developer.chrome.com/blog/webmcp-epp",
      "author": "André Cipriani Bandarra",
      "publisher": "Chrome for Developers",
      "datePublished": "2026-02-10"
    },
    {
      "@type": "CreativeWork",
      "url": "https://llmstxt.org",
      "author": "Jeremy Howard",
      "publisher": "Answer.AI",
      "datePublished": "2024-09-03"
    }
  ]
}
-->
