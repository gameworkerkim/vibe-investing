# Turso: Edge-Native SQLite Database Platform (English)

## Overview

Turso is a cloud database platform that distributes SQLite across edge networks. Built on libSQL rewritten in Rust, it's fully compatible with SQLite while providing features suitable for global-scale applications.

The core strength is edge-distributed SQLite — data can be read and written from the edge location closest to users, dramatically improving response times for global services. This especially enables small startups to effectively operate global services with limited infrastructure investment.

---

## Pricing

Turso imposes no limit on the number of databases across all self-service plans, with billing based on storage capacity and read/write usage.

### Plans

**Free**
- Databases: 100
- Storage: 5GB
- Monthly rows read: 500 million
- Monthly rows written: 10 million
- Monthly sync: 3GB
- PITR: 1 day
- Audit log: Included
- Support: Community
- No credit card required

**Developer**
- Databases: Unlimited
- Storage: 9GB + $0.75/additional GB
- Monthly rows read: 2.5 billion + $1.00/additional 1 billion
- Monthly rows written: 25 million + $1.00/additional 1 million
- Monthly sync: 10GB + $0.35/additional GB
- PITR: 10 days
- Team collaboration: Supported

**Scaler**
- Databases: Unlimited
- Storage: 24GB + $0.50/additional GB
- Monthly rows read: 100 billion + $0.80/additional 1 billion
- Monthly rows written: 100 million + $0.80/additional 1 million
- Monthly sync: 24GB + $0.25/additional GB
- PITR: 30 days

**Pro**
- Databases: Unlimited
- Storage: 50GB + $0.45/additional GB
- SSO, BYOK encryption, HIPAA, SOC2 compliance

**Enterprise**: Dedicated cloud & BYOC deployment, custom SLA, premium 24x7 support, unlimited usage.

---

## Startup Program

Turso runs a startup program for early-stage VC-backed startups suited to the "many-database architecture" where AI agents dynamically create, branch, and delete databases per session.

**Benefits**: Turso credits, priority engineering access for architecture reviews and ongoing support, early access to new features, co-marketing opportunities.

---

## Performance Advantages

### Ultra-Low Latency via Global Edge Deployment

Turso's greatest strength is distributing databases across a global edge network, processing data at the location closest to users. Compared to traditional centralized PostgreSQL, read latency can be reduced from 30-80ms to under 10ms, with microsecond-level latency achievable using full local replicas.

Concrete benchmark results:
- Traditional databases: 150-300ms
- Turso edge nodes: 5-20ms
- Read performance improvement: up to 90%

### Fast Connection & Query Performance

Turso shows up to 575x faster connection speeds compared to traditional approaches, taking only 40 microseconds to open a new connection regardless of whether the database has 10, 5,000, or 10,000 tables. Approximately 34% faster than SQLx on single-row SQLite query benchmarks, ~30% faster on multi-threaded parallel SELECT benchmarks.

### Concurrent Write Performance

Turso's MVCC implementation shows clear improvements in concurrent write performance. With 8 threads on 1ms compute workloads, Turso's write transactions are 4x faster than SQLite. P90 latency reduced by up to 93%, P99 latency reduced by up to 95% across all multi-process configurations.

### Read vs Write Trade-off

Turso's HTTP-based protocol means writes can be 2-3x slower compared to PostgreSQL's native wire protocol, while reads are 3-6x faster in international regions. Best suited for read-heavy workloads.

---

## Many-Database Architecture

Turso supports a unique "many-database architecture" where each user, agent, or session gets its own independent database instead of sharing a monolithic database.

Key features:
- **API-based DB creation**: Create new databases instantly via millisecond-level API calls
- **Multi-DB schema**: Parent database schema changes automatically propagate to all child databases
- **Complete isolation**: Each tenant/user has a fully isolated database, naturally ensuring security and performance isolation

This architecture particularly excels in AI agent applications, multi-tenant SaaS, and global mobile apps.

---

## Comparison with Cloudflare

### Turso vs Cloudflare D1

| Feature | Turso (libSQL) | Cloudflare D1 (SQLite) |
|---------|---------------|------------------------|
| **Core tech** | Rust-based libSQL | Cloudflare Workers-based SQLite |
| **Data replication** | Deploy read replicas to edge locations | Read replication to Workers (no control interface) |
| **Ecosystem** | SQLite-compatible tools | Tightly integrated with Cloudflare Workers |
| **Transactions** | Supported | Limited support (Batch API) |
| **DB size** | 5GB (free) / 9GB (developer) | 500MB (free) / 10GB (paid) |
| **DBs per account** | 100 (free) / Unlimited (paid) | 5GB (free) / 50,000 (paid) |
| **Free plan** | 100 DBs, 500M rows read | 5M rows read/day, 100K rows write/day |

---

## Considerations

1. **Still in beta**: Some SQLite features may be missing; thorough testing needed before production.
2. **Write performance limits**: HTTP-based protocol means write-heavy workloads may be better served by PostgreSQL.
3. **Ecosystem maturity**: Separate ecosystem from SQLite may cause compatibility issues with some existing tools.
4. **Not for complex queries**: Complex joins or large-scale aggregation queries may not be well-suited.

However, a hybrid edge storage architecture of CDN caching + Turso (read) + Neon (write) can be effective. For most services, Turso alone can provide optimal global read/write speeds.

---

## References

- Turso official: https://turso.tech
- Pricing details: https://turso.tech/pricing
- Startup program: https://turso.tech/blog/turso-for-startups-the-many-database-architecture
- Official docs: https://docs.turso.tech
