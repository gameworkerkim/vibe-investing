# Cloudflare Free Tier Guide (English)

> Written from an Azure-to-Cloudflare migration perspective. For evaluating migration of existing Azure Functions + Blob Storage architecture.

---

## 1. Sign-Up — 3 Minutes

### Step 1. Create Account

1. Go to https://dash.cloudflare.com/sign-up
2. Enter email + password (or GitHub SSO)
3. Verify email (check spam folder too)

No credit card required. Workers, Pages, R2, KV free tiers all available immediately without a credit card.

### Step 2. Add Domain (Optional)

If you have an existing domain:

1. Dashboard -> Add a Site
2. Enter domain -> Select Free plan
3. Change nameservers (at your domain registrar to Cloudflare's ns1/ns2)

You can skip this if you don't have a domain. Use `*.workers.dev` or `*.pages.dev` subdomains instead.

### Step 3. Enable 2FA (Strongly Recommended)

1. My Profile -> Authentication
2. Two-factor Authentication -> Enable
3. Register with Google Authenticator or Authy

A Cloudflare account hijack affects all services. 2FA is not optional — it's mandatory.

---

## 2. Free Tier Limits — From an App Perspective

### Workers (Serverless Functions)

| Item | Free Limit | Estimated Usage (DAU 1,000) |
|------|-----------|------------------------------|
| Requests | 100,000/day | DAU 1,000 x 100 req = 100K (near limit) |
| CPU time per request | 10ms | LLM calls are wait time (not CPU time), safe |
| Subrequests | 50/invocation | Sufficient |
| Script size | 1 MB | Sufficient |

Free up to DAU 1,000. For DAU 5,000+, switch to Workers Paid ($5/mo).

### Workers KV (Key-Value Cache)

| Item | Free Limit | App Usage |
|------|-----------|-----------|
| Reads | 100,000/day | 80% cache hit x DAU 1,000 x 100 req = 80K (safe) |
| Writes | 1,000/day | New LLM response caching |
| Deletes | 1,000/day | Sufficient |
| List | 1,000/day | Rarely used |
| Storage | 1 GB | Sufficient for text-only cache |
| Value size limit | 25 MB/key | LLM response is a few KB, sufficient |

With 80% cache hit rate, fully within free limits.

### R2 (Object Storage, Azure Blob Replacement)

| Item | Free Limit | App Usage |
|------|-----------|-----------|
| Storage | 10 GB | Current Azure Blob usage estimated under 1 GB |
| Class A operations (writes) | 1,000,000/month | Sufficient |
| Class B operations (reads) | 10,000,000/month | More than sufficient |
| Egress (bandwidth) | Unlimited free | Decisive differentiator |

Free egress is R2's biggest advantage. Azure Blob egress costs eliminated.

### Pages (Static Sites)

| Item | Free Limit |
|------|-----------|
| Bandwidth | Unlimited |
| Builds | 500/month |
| Concurrent builds | 1 |
| Custom domains | 100 |
| Sites | Unlimited |

Fully sufficient for frontend hosting. Equivalent to Azure Static Web Apps.

### Workers AI (Optional)

| Item | Free Limit |
|------|-----------|
| Neurons | 10,000/day (~5,000-10,000 requests) |
| Models | Llama 3.x, DeepSeek, etc. |

Unnecessary if using DeepSeek API directly. But useful as backup LLM.

### Reset Timing

All free limits reset: Daily at UTC 00:00 (KST 09:00)

---

## 3. Recommended Migration Phases

### Phase 1. Static Assets Only (Low Risk, 2-3 hours)

```
Azure Static Web Apps -> Cloudflare Pages
- Deploy frontend (HTML/CSS/JS) to Pages
- Keep LLM calls on Azure Functions
- Only change: update API endpoint URL in frontend
```

- Risk: Very low (frontend only)
- Effect: 50-100ms faster first page load for Korean users

### Phase 2. Migrate Blob to R2 (Recommended post-launch)

```
Azure Blob Storage -> Cloudflare R2
- Auto-migrate via Super Slurper or Sippy
- S3-compatible API minimizes code changes
- Large egress cost savings
```

- Risk: Medium (URL structure changes)
- Effect: Free egress + enhanced edge cache

### Phase 3. Move Functions to Workers (Review 14 days after launch)

```
Azure Functions (Python) -> Cloudflare Workers (JS/TS or Python WASM)
- Rewrite DeepSeek API calls using fetch()
- Redesign 4-tier cache with Workers KV + Cache API
```

- Risk: High (different runtime)
- Effect: Cold start eliminated, further edge latency reduction
- Recommended timing: After launch + 14 days burn-in data

---

## 4. First Setup After Sign-Up — 5 Minutes

### Install Wrangler CLI

```bash
# Requires Node.js 18+
npm install -g wrangler

# Login (browser auth)
wrangler login

# Verify
wrangler whoami
```

### First Pages Deploy (Static Site Test)

```bash
# Git integration
# Dashboard -> Pages -> Connect to Git
# Connect GitHub repo -> auto-build on main branch

# Or direct deploy
wrangler pages deploy ./build --project-name=my-test
```

After deploy: `https://my-test.pages.dev`

### First R2 Bucket

```bash
# Create bucket within free limits
wrangler r2 bucket create my-blob

# Test file upload
wrangler r2 object put my-blob/test.txt --file ./test.txt
```

---

## 5. 4 Key Caveats

### Caveat 1. Workers' Python support is limited

```
Supported: Pyodide-based WASM (limited stdlib)
Not supported: native C dependency packages (some numpy, asyncio)
```

Check which Python packages your app depends on. Pure Python + fetch can be ported; complex dependencies may require JavaScript/TypeScript rewrite.

### Caveat 2. KV consistency is eventual

```
KV write -> up to 60 seconds before readable from other edge locations
Unsuitable for data requiring immediate consistency (e.g., user sessions)
```

For strong consistency (user sessions), use Durable Objects (requires Workers Paid $5/mo).

### Caveat 3. Daily reset risk on free limits

```
Workers requests 100K/day = avg 4,166 req/hour
If peak hour (e.g., US market close KST 22:30) hits 10K req/hour
-> 100K limit exhausted by afternoon
-> Service down until next UTC 00:00 (KST 09:00)
```

Peak hour monitoring is essential. Switch to Workers Paid ($5/mo) when reaching 1,000 users.

### Caveat 4. DeepSeek API call latency is the bottleneck

```
Cloudflare edge: 10-50ms
DeepSeek API: 2,000-8,000ms (LLM inference)
User-perceived latency: 95%+ is LLM call
```

Cloudflare migration's perceptible effect is concentrated on first-page-load. LLM response time itself won't change. Be honest in migration ROI calculations.

---

## References

- Sign up: https://dash.cloudflare.com/sign-up
- Workers free limits: https://developers.cloudflare.com/workers/platform/pricing/
- R2 free limits: https://developers.cloudflare.com/r2/pricing/
- KV free limits: https://developers.cloudflare.com/kv/platform/pricing/
- Pages free limits: https://www.cloudflare.com/plans/developer-platform/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/
- Super Slurper (S3 -> R2 migration): https://developers.cloudflare.com/r2/data-migration/super-slurper/
