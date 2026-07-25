---
title: "Supabase 完全指南 (Full Version)"
description: "涵盖开源 Firebase 替代方案 Supabase 的核心功能、架构、优缺点、Vercel 集成方法与定价方案的完整指南"
lang: zh
featured: false
schema_type: TechArticle
date: 2026-06
---

# Supabase 完全指南 (Full Version)

**版本:** 截至 2026 年 6 月
**目标读者:** 基于 Vercel + Next.js 的全栈开发者

---

## 1. 什么是 Supabase?

Supabase 是**开源的 Firebase 替代方案**。以 PostgreSQL 数据库为核心,统一提供认证(Auth)、实时(Realtime)、存储(Storage)、边缘函数(Edge Functions)等功能的后端平台(BaaS)。

- **开源**: 所有代码均公开在 GitHub 上,也可以自行托管。
- **基于 PostgreSQL**: 直接使用关系型数据库的强大能力(JOIN、事务、RLS 等)。
- **开发者体验**: 提供 SDK(JavaScript、Flutter、Swift、Python 等)及 CLI,可实现快速原型开发。

---

## 2. 核心功能 (Core Features)

### 2.1 Database (PostgreSQL)

- **完全托管的 PostgreSQL**: 版本 15.x,自动化配置与补丁管理。
- **表格编辑器**: 可在 Web UI 中创建表、编辑 SQL、设置关联关系。
- **SQL 编辑器**: 在线执行 SQL 查询并保存历史记录。
- **备份 & PITR**: 每日自动备份,时间点恢复(Point-in-Time Recovery)需 Pro 及以上套餐。
- **模式迁移**: 通过 `supabase migration` CLI 进行版本管理。

### 2.2 Authentication (Auth)

- **支持的登录方式**:
  - 邮箱/密码(含 Magic Link)
  - 社交 OAuth:Google、Apple、GitHub、GitLab、Facebook、Discord、Slack、Kakao(部分提供商)
  - 手机号短信认证(需集成 Twilio)
  - 企业级 SSO(SAML、Azure AD) – Enterprise 套餐
- **基于 JWT 的会话**: 自动刷新的访问/刷新令牌。
- **Row Level Security (RLS) 集成**: 可在数据库策略中直接使用 `auth.uid()`。
- **用户管理 API**: 创建/删除用户、重置密码、更改邮箱等。
- **自定义邮件模板**: 可自定义注册确认、密码重置等邮件内容及 SMTP 配置。

### 2.3 Storage

- **S3 兼容的对象存储**: 图片、视频、文件上传。
- **存储桶策略与 RLS**: 可通过 RLS 控制文件级别的访问权限。
- **图片转换**: 通过 `?width=200&height=200` 参数支持动态缩放。
- **公开/私有存储桶**: 可通过签名 URL 实现临时访问。

### 2.4 Realtime

- **基于 WebSocket 的实时订阅**: 将表变更(INSERT、UPDATE、DELETE)实时推送给客户端。
- **Broadcast**: 客户端之间的消息广播(聊天、协同工作)。
- **Presence**: 在线用户列表管理(实时用户状态)。
- **PostgreSQL 变更数据捕获(CDC)**: 需设置 `REPLICA IDENTITY FULL`。

### 2.5 Edge Functions

- **基于 Deno 的无服务器函数**: 在全球边缘节点运行(类似 Vercel Edge Functions)。
- **低延迟**: 适用于 JWT 认证、支付 Webhook、AI API 代理等场景。
- **支持语言**: TypeScript、JavaScript(Deno 运行时)。
- **限制**: 执行时间 10 秒(免费),内存 150MB。

### 2.6 Vector (pgvector)

- **内置 PostgreSQL 扩展 pgvector**: 存储嵌入向量并进行相似度搜索(余弦、欧氏距离等)。
- **AI 应用**: 可用于 RAG(检索增强生成)、推荐系统。

### 2.7 GraphQL(通过 pg_graphql)

- **自动生成的 GraphQL API**: 基于 PostgreSQL 模式提供 GraphQL 端点。
- **支持过滤、排序、分页**。

---

## 3. 理解架构

Supabase 由多个开源组件组合构建而成。

| 组件 | 技术 | 作用 |
|----------|------|------|
| **Database** | PostgreSQL | 数据存储与查询 |
| **API** | PostgREST | 自动生成 RESTful API |
| **Auth** | GoTrue | 基于 JWT 的认证 |
| **Storage** | Supabase Storage(基于 S3) | 文件上传/下载 |
| **Realtime** | Realtime server(Elixir) | WebSocket 广播 |
| **Edge Functions** | Supabase Edge Runtime(Deno) | 边缘函数执行 |
| **Dashboard** | 基于 Next.js 的 Web UI | 管理控制台 |

- 所有服务均为**开源**,各组件相互独立且可扩展。
- 客户端可通过**单一 API URL** 访问所有服务(例如:`https://<ref>.supabase.co`)。

---

## 4. 优点 (Pros)

### 相较 Firebase 的优势

- **关系型数据库**: 支持复杂查询、JOIN、事务(Firebase Firestore 基于文档)。
- **价格可预测性**: 按计算 + 存储 + 带宽计费,而非按用户数计费。
- **开源**: 摆脱厂商锁定,支持自托管。

### 开发者生产力

- **15 分钟搭建认证 + 数据库**: 通过 UI 创建表、设置 RLS 策略、启用社交登录。
- **自动生成 API**: 仅需创建表即可立即使用 REST/GraphQL 端点。
- **TypeScript 支持**: 通过 `supabase gen types` 命令自动将数据库模式生成为 TypeScript 类型。

### 安全性(RLS)

- **数据库层级权限**: 通过 RLS 策略以 SQL 声明"用户只能查看自己的行"等规则。
- **默认所有 API 均需认证**: `anon` 密钥仅有限访问权限,只有 `service_role` 密钥拥有完全权限。

### 可扩展性

- **利用 PostgreSQL 生态**: 索引、视图、函数、触发器、pg_cron、pgvector 等扩展。
- **纵向/横向扩展**: Pro 及以上套餐正在准备专用计算资源、读副本、分片。

### 与 Vercel 完美契合

- **Vercel Marketplace 集成**: 一键创建 Supabase 项目并注入环境变量。
- **官方 `@supabase/ssr` 包**: 在 Next.js App Router 中实现基于 Cookie 的会话管理。
- **边缘函数的相似性**: Vercel Edge Runtime 与 Supabase Edge Functions 均基于 Deno → 逻辑易于复用。

### 免费套餐的吸引力

- **50,000 MAU**(月活跃用户) – 远比 Firebase Auth 免费套餐宽松。
- **无时间限制** – 不会在 12 个月后突然开始收费。
- **500MB 数据库、1GB 存储、2GB 带宽** – 足以支撑 MVP、副业项目。

---

## 5. 缺点 (Cons)

### 带宽瓶颈(免费套餐)

- **实际带宽上限约为 2GB**: 官方文档标注为 5GB,但社区实测结果显示约 2GB 时便会触发限制。
- **影响**: 以图片、视频为主的应用可能一天内就超出限额。API 响应优化与 CDN 是必需的。

### 数据库计算性能(免费套餐)

- **共享 CPU**: 高峰时段查询延迟可能达到 200~500ms。
- **连接池限制**: 免费套餐最多 50 个并发连接,Pro 为 200 个。

### 社交登录提供商的限制

- **Naver、Kakao、Line 等韩国服务**: 默认不支持(可通过 OIDC 兼容提供商集成,但配置复杂)。
- **中国提供商(WeChat、QQ)**: 不支持。

### 定制困难(托管服务的局限)

- **自定义域名**: 仅 Pro 套餐及以上($25/月)可用。
- **无法修改 JWT 过期时间**: 默认为 1 小时(Google/Auth0 等可设置为 15 分钟等)。
- **虽可直接配置 SMTP,但相较专业邮件发送服务功能不足**(无营销邮件、批量发送功能)。

### 缺乏审计日志(免费/Pro)

- **仅 Enterprise 套餐提供审计日志**: 若需查看谁在何时访问了哪些数据,需支付 $2,500/月。

### 轻度厂商锁定

- **RLS 策略**: 若严重依赖 Supabase 的 `auth.uid()` 函数,迁移到其他身份提供商时需要重写所有策略。
- **存储 URL 格式**: `https://<ref>.supabase.co/storage/v1/...` – 切换到自有域名时需要额外工作。

### 大规模场景下的 Realtime 性能问题

- **每个频道的连接数限制**: 免费套餐 200 个,Pro 套餐 5,000 个,超出则需基于 Redis 进行扩展。
- **CDC 负载**: 在变更数据捕获频繁的表上使用会给 PostgreSQL 的 WAL 带来负担。

### Edge Functions 的限制

- **执行时间 10 秒**: 无法处理繁重任务(视频编码、大规模数据处理)。
- **外部网络访问受限**: 免费套餐仅允许部分 IP 段(Pro 套餐可解除)。
- **本地调试困难**: `supabase functions serve` 速度较慢,与 VS Code 调试器的集成不够稳定。

---

## 6. Vercel + Supabase 集成指南

### 6.1 基础设置(5 分钟)

1. **Vercel 控制台** → Integrations → Supabase → 点击"Connect"。
2. 创建新的 Supabase 项目或选择现有项目。
3. 自动注入环境变量(`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`)。
4. 安装 `@supabase/ssr` 包:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 6.2 中间件设置 (`middleware.ts`)

```typescript
import { createMiddlewareClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}
```

> **注意**: `createMiddlewareClient` 适用于 `@supabase/ssr` v0.1.0 及以上版本。请不要与旧版本的 `@supabase/auth-helpers-nextjs` 混用。

### 6.3 初始化 Supabase 客户端

服务端组件与客户端组件需分别采用不同的方式进行初始化。

**服务端组件 (Server Component)**

```typescript
import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  // ...
}
```

**客户端组件 (Client Component)**

```typescript
'use client'
import { createClientComponentClient } from '@supabase/ssr'

export default function Component() {
  const supabase = createClientComponentClient()
  // ...
}
```

### 6.4 配置 Google OAuth(在控制台中 3 分钟完成)

1. Supabase 控制台 → Authentication → Providers → 启用 Google。
2. 输入 Client ID / Secret → 复制重定向 URL 并在 Google Cloud Console 中注册。

### 6.5 RLS 示例(论坛)

```sql
-- 创建表
CREATE TABLE posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  content text,
  created_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 策略:用户只能查看自己的帖子
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

-- 策略:仅登录用户可以发帖
CREATE POLICY "Authenticated users can insert" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 6.6 生成 TypeScript 类型

```bash
npx supabase gen types typescript --project-id <ref> > types/supabase.ts
```

在查询中使用生成的类型,可以在编译期捕获模式错误。

```typescript
import { Database } from '@/types/supabase'

const supabase = createClientComponentClient<Database>()
const { data } = await supabase.from('posts').select('*')
// data 会被推断为 Database['public']['Tables']['posts']['Row'][] 类型
```

### 6.7 环境变量管理

本地开发时请在 `.env.local` 中添加以下内容。使用 Vercel 集成后,预览/生产环境的变量会自动注入。

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
# 切勿暴露给客户端
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

---

## 7. 定价方案(截至 2026 年 6 月)

| 套餐 | 价格 | MAU | 数据库容量 | 带宽 | Edge Functions | 实时连接数 |
|------|------|-----|---------|--------|----------------|------------|
| Free | $0 | 50,000 | 500MB | 2GB | 每月 50 万次调用 | 200 |
| Pro | $25 | 100,000 | 8GB | 100GB | 每月 200 万次调用 | 5,000 |
| Team | $599 | 500,000 | 40GB | 400GB | 每月 500 万次调用 | 20,000 |
| Enterprise | 定制 | 无限制 | 无限制 | 无限制 | 无限制 | 无限制 |

**额外费用:**

- 超出的数据库存储: $0.125/GB(Pro 及以上)
- 超出的带宽: $0.09/GB(Pro 及以上)
- 额外边缘函数调用: 每百万次 $2

> **注意:** 免费套餐每个账户限制 2 个项目,Pro 套餐组织下的项目数量不受限制。

---

## 8. 何时应选择 Supabase

### 适合的项目

- **MVP、创业公司早期产品**: 快速开发速度与宽松的免费套餐 MAU。
- **Vercel + Next.js 全栈**: 官方集成优化了开发者体验。
- **以关系型数据为核心的应用**: 需要复杂查询的订单、预订、库存管理等场景。
- **需要通过 RLS 加强数据安全的服务**: 医疗、金融、个人信息处理。
- **需要实时功能的应用**: 聊天、协作工具、仪表盘。
- **AI/向量搜索应用**: 内置 pgvector,无需单独的向量数据库即可实现 RAG。

### 不适合的项目

- **媒体带宽消耗较大的应用(图片/视频)**: 带宽计费会造成较大负担,建议改用 Vercel Blob Storage 或 Cloudflare R2。
- **必须支持韩国社交登录(Naver、Kakao)**: 直接使用 Auth.js 或 Passport.js 实现会更简单。
- **需要企业级审计日志与 SSO**: Auth0、WorkOS、Clerk 更为合适。
- **无服务器函数需要长时间运行(>10 秒)**: 需要后台 Worker 时应单独搭建服务器。

---

## 9. Supabase 与竞品对比

| 特性 | Supabase | Firebase | Auth0 | Clerk |
|------|----------|----------|-------|-------|
| 数据库 | PostgreSQL | Firestore(NoSQL) | 无 | 无 |
| 认证免费 MAU | 50k | 50k(按用户计) | 7,500 | 10k |
| 实时功能 | 支持(WebSocket) | 支持 | 不支持 | 不支持 |
| 存储 | 支持(S3 兼容) | 支持 | 不支持 | 不支持 |
| 开源 | 全部公开 | 不公开 | 不公开 | 不公开 |
| 自托管 | 支持(Docker) | 不支持 | 不支持 | 不支持 |
| 价格可预测性 | 中等(按用量) | 较低(按请求) | 较高(按 MAU) | 中等(MAU + 功能) |
| 自定义域名 | Pro 及以上 | Blaze 套餐及以上 | Standard 及以上 | Pro 及以上 |
| pgvector / 向量搜索 | 内置 | 不支持 | 不支持 | 不支持 |

---

## 10. 常见问题 (FAQ)

**问:在 Supabase 免费套餐中可以使用 Naver 登录吗?**
答:可以直接实现,但较为复杂。建议搭配使用 Auth.js(NextAuth)会更简单。

**问:从 Vercel 直接连接 Supabase 安全吗?**
答:是的。`NEXT_PUBLIC_SUPABASE_ANON_KEY` 默认是安全的,但仍需通过 RLS 保护数据。`service_role` 密钥切勿暴露给客户端。

**问:可以用 Supabase 发送邮件营销(新闻通讯)吗?**
答:可以连接 SMTP,但并非为大批量发送设计。请使用 Resend、SendGrid、Brevo 等专业服务。

**问:生产环境可以使用免费套餐吗?**
答:如果用户量较少(MAU < 5,000)且带宽消耗较小,是可以的。但流量激增时应考虑升级为付费套餐。

**问:自托管 Supabase 是完全免费的吗?**
答:仍会产生服务器成本(云端虚拟机或本地部署),且管理开销较大,小规模场景下托管服务反而更经济。

**问:使用 pgvector 实现 RAG 需要什么套餐?**
答:免费套餐即可启用 pgvector 扩展。但随着嵌入向量数量增多,需注意数据库容量 500MB 的上限。

**问:如何配置连接池(Connection Pooling)?**
答:Supabase 内置了 PgBouncer。只需将连接字符串中的端口从 `5432`(直连)改为 `6543`(Pooler 模式)即可。在无服务器环境(Next.js API Routes、Edge Functions)中必须使用 Pooler。

---

## 11. 延伸学习资源

- **官方文档**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel 集成**: [vercel.com/integrations/supabase](https://vercel.com/integrations/supabase)
- **GitHub 仓库**: [github.com/supabase/supabase](https://github.com/supabase/supabase)
- **Discord 社区**: [discord.supabase.com](https://discord.supabase.com)
- **Supabase YouTube 频道**: 提供官方教程与发布说明视频

---

## 12. 结论

Supabase 巧妙地将开源的自由度与托管服务的便捷性结合在一起。得益于与 Vercel 的协同效应、PostgreSQL 的强大能力以及宽松的免费套餐,从个人开发者到创业公司都广受喜爱。

不过,带宽限制与对韩国社交登录支持的不足是其明显的缺点。请根据项目需求权衡,再决定是否采用 Supabase 或考虑替代方案。

"Supabase 已不仅仅是 Firebase 的替代品,正逐渐成为开源生态系统的新标准。"
