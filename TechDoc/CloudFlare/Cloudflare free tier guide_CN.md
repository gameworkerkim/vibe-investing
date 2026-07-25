---
title: "Cloudflare 免费套餐注册指南"
subtitle: "以 Azure 迁移视角，梳理 Workers、Pages、R2、KV 的免费额度与分阶段迁移计划"
description: "Cloudflare 免费套餐的注册步骤、Workers/Workers KV/R2/Pages 免费额度的实用估算、从 Azure Functions + Blob Storage 迁移的分阶段计划、初次环境搭建，以及运营中需要注意的四个要点。"
abstract: |
  本文以评估从 Azure 迁移到 Cloudflare 为目的撰写，说明现有的 Azure Functions + Blob Storage 架构能在多大程度上被无需信用卡的 Cloudflare 免费套餐（Workers、Pages、R2、KV）替代，并以 DAU 1,000 规模的应用为例给出实用的数字估算。
  内容涵盖：注册流程（3 分钟）、免费额度的实用估算、静态资源 → R2 → Workers 的三阶段迁移计划、通过 Wrangler CLI 完成的初次环境搭建，以及 Python 支持局限、KV 最终一致性、每日重置带来的风险、DeepSeek API 调用延迟这四个实务注意事项。
summary_for_ai: |
  本文是为计划从 Azure 迁移到 Cloudflare 的开发者撰写的 Cloudflare 免费套餐注册与使用指南。
  注册分三步（创建账户、可选添加域名、启用 2FA），全程无需信用卡。以 DAU 1,000 规模为基准，对 Workers（每日 10 万次请求）、Workers KV（每日读取 10 万次、写入 1,000 次）、R2（存储 10GB、出站流量免费）、Pages（带宽无限）、Workers AI 的免费额度进行实用估算。
  推荐的迁移路径分三个阶段：(1) 只迁移静态资源到 Pages（风险低，2-3 小时）；(2) 将 Azure Blob 迁移到 R2（通过 Super Slurper/Sippy 自动迁移）；(3) 将 Azure Functions 迁移到 Workers（建议在上线 14 天后评估，风险较高）。
  文中包含 Wrangler CLI 的安装与登录、首次 Pages 部署、首次创建 R2 存储桶的操作步骤。
  四个注意事项：Workers 对 Python 的支持有限（基于 Pyodide/WASM，不支持原生 C 扩展）；KV 是最终一致性（最长 60 秒延迟）；免费额度每日重置带来的高峰期风险；DeepSeek API 调用延迟占据了用户感知延迟的大部分。
date: 2026-05-12
author: "Dennis Kim"
lang: zh
tags:
  - Cloudflare
  - 免费套餐
  - Workers
  - R2
  - Pages
  - Azure 迁移
keywords:
  - Cloudflare 免费套餐注册
  - Cloudflare Workers 免费额度
  - Azure Functions 迁移 Cloudflare
  - Cloudflare R2 Azure Blob 迁移
  - Wrangler CLI 使用方法
  - Cloudflare Pages 部署
group: cloud-free
featured: false
schema_type: TechArticle
draft: false
---

# Cloudflare 免费套餐注册指南（中文）

> 以 Azure → Cloudflare 迁移的视角撰写，用于评估现有 Azure Functions + Blob Storage 架构的迁移方案。

---

## 1. 注册步骤 —— 耗时 3 分钟

### 步骤 1. 创建账户

1. 访问 https://dash.cloudflare.com/sign-up
2. 输入邮箱 + 密码（也可用 GitHub SSO）
3. 完成邮箱验证（记得检查垃圾邮件文件夹）

无需输入信用卡。Workers / Pages / R2 / KV 的免费套餐均可在无需信用卡的情况下立即使用。

### 步骤 2. 添加域名（可选）

如果已有域名：

1. 进入 Dashboard → Add a Site
2. 输入域名 → 选择 Free 套餐
3. 修改域名服务器（在域名注册商处改为 Cloudflare 的 ns1/ns2）

没有现成域名可以跳过这一步，使用 `*.workers.dev` 或 `*.pages.dev` 子域名即可。

### 步骤 3. 启用 2FA（强烈建议）

1. 进入 My Profile → Authentication
2. Two-factor Authentication → Enable
3. 用 Google Authenticator 或 Authy 完成注册

Cloudflare 账户一旦被劫持，会影响其下所有服务。2FA 不是可选项，而是必需项。

---

## 2. 免费额度 —— 从应用角度估算

### Workers（无服务器函数）

| 项目 | 免费额度 | 估算使用量（DAU 1,000） |
|------|-----------|------------------------------|
| 请求数 | 每日 10 万次 | DAU 1,000 × 每人 100 次请求 = 10 万（接近上限） |
| 每次请求 CPU 时间 | 10ms | LLM 调用属于等待时间（非 CPU 时间），安全 |
| 子请求数 | 每次调用 50 个 | 充足 |
| 脚本大小 | 1 MB | 充足 |

DAU 1,000 以内可以免费运行。DAU 5,000+ 时需切换到 Workers Paid（每月 5 美元）。

### Workers KV（键值缓存）

| 项目 | 免费额度 | 应用使用量 |
|------|-----------|-----------|
| 读取 | 每日 10 万次 | 缓存命中率 80% × DAU 1,000 × 每人 100 次请求 = 8 万（安全） |
| 写入 | 每日 1,000 次 | 用于缓存新的 LLM 响应 |
| 删除 | 每日 1,000 次 | 充足 |
| 列表 | 每日 1,000 次 | 几乎不使用 |
| 存储 | 1 GB | 若仅缓存文本，足够 |
| 单键值大小限制 | 每键 25 MB | 单条 LLM 响应仅几 KB，充足 |

只要保持 80% 的缓存命中率，就能完全落在免费额度之内。

### R2（对象存储，Azure Blob 的替代方案）

| 项目 | 免费额度 | 应用使用量 |
|------|-----------|-----------|
| 存储 | 10 GB | Azure Blob 当前使用量估计不到 1 GB |
| A 类操作（写入） | 每月 100 万次 | 充足 |
| B 类操作（读取） | 每月 1000 万次 | 非常充足 |
| 出站流量（带宽） | 无限免费 | 决定性的差异化优势 |

出站流量免费是 R2 最大的优势，Azure Blob 的出站流量费用负担就此消失。

### Pages（静态站点）

| 项目 | 免费额度 |
|------|-----------|
| 带宽 | 无限 |
| 构建次数 | 每月 500 次 |
| 并发构建数 | 1 |
| 自定义域名 | 100 个 |
| 站点数 | 无限 |

对于前端托管来说完全足够，相当于 Azure Static Web Apps 的同等替代品。

### Workers AI（可选使用）

| 项目 | 免费额度 |
|------|-----------|
| Neurons | 每日 1 万（约 5,000-10,000 次请求） |
| 模型 | Llama 3.x、DeepSeek 等 |

如果本身已直接调用 DeepSeek API，则无需使用 Workers AI；但作为备用 LLM 仍有价值。

### 重置时间

所有免费额度重置时间：每日 UTC 00:00（韩国时间 09:00）

---

## 3. 推荐的迁移阶段

### 第一阶段：仅迁移静态资源（低风险，2-3 小时）

```
Azure Static Web Apps -> Cloudflare Pages
- 将前端（HTML/CSS/JS）部署到 Pages
- LLM 调用仍保留在 Azure Functions
- 唯一改动：更新前端中的 API 端点 URL
```

- 风险：非常低（仅迁移前端）
- 效果：韩国用户首屏加载速度提升 50-100ms

### 第二阶段：将 Blob 迁移到 R2（建议在上线后进行）

```
Azure Blob Storage -> Cloudflare R2
- 通过 Super Slurper 或 Sippy 自动迁移
- S3 兼容 API，代码改动极小
- 出站流量成本可大幅节省
```

- 风险：中等（URL 结构会变化）
- 效果：出站流量免费 + 边缘缓存增强

### 第三阶段：将函数迁移到 Workers（建议在上线 14 天后评估）

```
Azure Functions (Python) -> Cloudflare Workers (JS/TS or Python WASM)
- 用 fetch() 重写 DeepSeek API 调用
- 用 Workers KV + Cache API 重新设计四层缓存
```

- 风险：高（运行时环境不同）
- 效果：消除冷启动，进一步降低边缘延迟
- 建议时机：基于上线 + 14 天的 burn-in 数据之后

---

## 4. 注册后的初次环境搭建 —— 5 分钟

### 安装 Wrangler CLI

```bash
# 需要 Node.js 18+
npm install -g wrangler

# 登录（浏览器认证）
wrangler login

# 验证
wrangler whoami
```

### 首次 Pages 部署（静态站点测试）

```bash
# Git 集成
# Dashboard -> Pages -> Connect to Git
# 关联 GitHub 仓库 -> main 分支自动构建

# 或直接部署
wrangler pages deploy ./build --project-name=my-test
```

部署完成后：`https://my-test.pages.dev`

### 首次创建 R2 存储桶

```bash
# 在免费额度内创建存储桶
wrangler r2 bucket create my-blob

# 测试文件上传
wrangler r2 object put my-blob/test.txt --file ./test.txt
```

---

## 5. 四个注意事项

### 注意事项 1：Workers 对 Python 的支持有限

```
支持：基于 Pyodide 的 WASM（标准库受限）
不支持：依赖原生 C 的包（部分 numpy、asyncio 等）
```

需要确认自己的应用代码依赖哪些 Python 包。纯 Python + fetch 的代码可以移植；依赖复杂的代码则需要用 JavaScript/TypeScript 重写。

### 注意事项 2：KV 的一致性是最终一致性（eventual）

```
KV 写入 -> 其他边缘节点最长需要 60 秒后才能读取到
不适合需要即时一致性的数据（例如用户会话）
```

像用户会话这类需要强一致性的数据，应使用 Durable Objects（需要 Workers Paid，每月 5 美元）。

### 注意事项 3：免费额度每日重置带来的风险

```
Workers 每日 10 万次请求 = 平均每小时 4,166 次
如果高峰时段（例如美股收盘后的韩国时间 22:30）每小时产生 1 万次请求
-> 10 万次的上限会在当天下午就被耗尽
-> 服务将中断，直到下一个 UTC 00:00（韩国时间 09:00）
```

必须监控高峰时段。建议在用户数达到 1,000 人时切换到 Workers Paid（每月 5 美元）。

### 注意事项 4：DeepSeek API 调用延迟是瓶颈

```
Cloudflare 边缘：10-50ms
DeepSeek API：2,000-8,000ms（LLM 推理）
用户感知延迟：95% 以上来自 LLM 调用
```

Cloudflare 迁移带来的可感知效果主要集中在首屏加载上，LLM 响应时间本身不会改变。在计算迁移 ROI 时应如实反映这一点。

---

## 参考资料

- 注册：https://dash.cloudflare.com/sign-up
- Workers 免费额度：https://developers.cloudflare.com/workers/platform/pricing/
- R2 免费额度：https://developers.cloudflare.com/r2/pricing/
- KV 免费额度：https://developers.cloudflare.com/kv/platform/pricing/
- Pages 免费额度：https://www.cloudflare.com/plans/developer-platform/
- Wrangler CLI：https://developers.cloudflare.com/workers/wrangler/
- Super Slurper（S3 -> R2 迁移）：https://developers.cloudflare.com/r2/data-migration/super-slurper/
