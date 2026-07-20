# Supabase Complete Guide (English)

**Version:** June 2026  
**Target:** Vercel + Next.js full-stack developers

---

## 1. What Is Supabase?

Supabase is an **open-source Firebase alternative**. Centered on a PostgreSQL database, it provides an integrated Backend-as-a-Service (BaaS) including Authentication, Realtime, Storage, and Edge Functions.

- **Open source**: All code is public on GitHub; self-hosting is possible.
- **PostgreSQL-based**: Full relational database power (JOIN, transactions, RLS, etc.).
- **Developer experience**: SDKs (JavaScript, Flutter, Swift, Python, etc.) + CLI for rapid prototyping.

---

## 2. Core Features

### 2.1 Database (PostgreSQL)
Fully managed PostgreSQL 15.x with automated configuration and patching. Web table editor, SQL editor with history, daily auto-backups (PITR on Pro+), and schema migration via `supabase migration` CLI.

### 2.2 Authentication (Auth)
Email/password (Magic Link), social OAuth (Google, Apple, GitHub, GitLab, Facebook, Discord, Slack), phone SMS (Twilio required), enterprise SSO (SAML, Azure AD — Enterprise). JWT-based sessions with auto-refresh tokens. Row Level Security (RLS) integration using `auth.uid()` directly in database policies.

### 2.3 Storage
S3-compatible object storage for images, video, files. Bucket policies and RLS for access control. Dynamic image resizing via `?width=200&height=200` parameters. Public/private buckets with signed URL temporary access.

### 2.4 Realtime
WebSocket-based real-time subscriptions for table changes (INSERT, UPDATE, DELETE). Broadcast for inter-client messaging. Presence for connected user list management. PostgreSQL Change Data Capture (CDC).

### 2.5 Edge Functions
Deno-based serverless functions executed on global edge nodes. Low latency for JWT auth, payment webhooks, AI API proxies. TypeScript/JavaScript (Deno runtime). Limited to 10-second execution (free), 150MB memory.

### 2.6 Vector (pgvector)
Built-in PostgreSQL pgvector extension for embedding vector storage and similarity search (cosine, Euclidean). Used for RAG (Retrieval-Augmented Generation) and recommendation systems.

### 2.7 GraphQL (via pg_graphql)
Auto-generated GraphQL API based on PostgreSQL schema. Supports filtering, sorting, and pagination.

---

## 3. Architecture

| Component | Technology | Role |
|-----------|-----------|------|
| Database | PostgreSQL | Data storage & queries |
| API | PostgREST | Auto-generated RESTful API |
| Auth | GoTrue | JWT-based authentication |
| Storage | Supabase Storage (S3-based) | File upload/download |
| Realtime | Realtime server (Elixir) | WebSocket broadcast |
| Edge Functions | Supabase Edge Runtime (Deno) | Edge function execution |
| Dashboard | Next.js-based web UI | Admin console |

All services are **open-source** and independently scalable. Clients access all services through **a single API URL** (e.g., `https://<ref>.supabase.co`).

---

## 4. Pros

**Firebase advantages**: Relational database with complex queries, JOINs, transactions. Predictable pricing (compute + storage + bandwidth, not per-user). Open source — no vendor lock-in, self-hosting possible.

**Developer productivity**: Auth + DB setup in 15 minutes via UI. Automatic API generation — REST/GraphQL endpoints instantly available on table creation. TypeScript support with `supabase gen types` for auto-generated DB-to-TypeScript types.

**Security (RLS)**: Database-level permissions with SQL-declared RLS policies ("users can only see their own rows"). All APIs require authentication by default.

**Scalability**: Full PostgreSQL ecosystem — indexes, views, functions, triggers, pg_cron, pgvector.

**Vercel synergy**: Vercel Marketplace 1-click integration with auto env var injection. Official `@supabase/ssr` package for Next.js App Router cookie-based session management.

**Free tier**: 50,000 MAU, no time limit (no 12-month cliff), 500MB DB, 1GB storage, 2GB bandwidth. Sufficient for MVPs and side projects.

---

## 5. Cons

- **Bandwidth bottleneck (free)**: Effective ~2GB limit before throttling. Image/video-heavy apps can exceed this in a day.
- **Shared CPU (free)**: Query latency of 200-500ms during peak hours. Max 50 concurrent connections (200 on Pro).
- **Korean social login gaps**: Naver, Kakao, Line not natively supported (possible via OIDC but complex setup). No WeChat/QQ.
- **Custom domain**: Pro plan ($25/month) required.
- **Audit logs**: Enterprise only ($2,500/month).
- **Some vendor lock-in**: RLS policies heavily dependent on `auth.uid()`; storage URL format tied to Supabase domain.
- **Edge Functions limits**: 10-second execution, restricted external network access on free plan.

---

## 6. Pricing (June 2026)

| Plan | Price | MAU | DB Storage | Bandwidth | Edge Functions | Realtime |
|------|-------|-----|-----------|-----------|----------------|----------|
| Free | $0 | 50,000 | 500MB | 2GB | 500K calls/mo | 200 |
| Pro | $25 | 100,000 | 8GB | 100GB | 2M calls/mo | 5,000 |
| Team | $599 | 500,000 | 40GB | 400GB | 5M calls/mo | 20,000 |
| Enterprise | Custom | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |

---

## 7. When to Choose Supabase

**Good fit**: MVPs, early-stage startups (fast dev speed, generous free MAU), Vercel + Next.js full-stack, relational data-centric apps (orders, bookings, inventory), services needing RLS data security (healthcare, finance, PII), real-time apps (chat, collaboration, dashboards), AI/vector search apps (built-in pgvector for RAG without separate vector DB).

**Poor fit**: Media-bandwidth-heavy apps (use Vercel Blob or Cloudflare R2 instead), Korean social login essential (use Auth.js or Passport.js), enterprise audit logs/SSO needed (use Auth0, WorkOS, Clerk), long-running serverless functions (>10 seconds).

---

## 8. Supabase vs Competitors

| Feature | Supabase | Firebase | Auth0 | Clerk |
|---------|----------|----------|-------|-------|
| Database | PostgreSQL | Firestore (NoSQL) | None | None |
| Auth free MAU | 50K | 50K (user-based) | 7,500 | 10K |
| Realtime | Yes (WebSocket) | Yes | No | No |
| Storage | Yes (S3-compatible) | Yes | No | No |
| Open source | Fully public | Proprietary | Proprietary | Proprietary |
| Self-hosting | Yes (Docker) | No | No | No |
| Vector search | Built-in | No | No | No |

---

## 9. Conclusion

Supabase brilliantly combines open-source freedom with managed service convenience. The synergy with Vercel, PostgreSQL's power, and a generous free tier make it widely beloved from individual developers to startups. However, bandwidth limits and lack of Korean social login support are clear drawbacks. Weigh your project's requirements carefully when deciding.

*"Supabase is going beyond being a simple Firebase alternative to becoming the new standard in the open-source ecosystem."*
