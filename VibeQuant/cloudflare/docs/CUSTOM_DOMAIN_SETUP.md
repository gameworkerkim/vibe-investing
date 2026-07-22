# Cloudflare Custom Domain Setup Guide

## 개요

`vibequant.cc` 도메인을 Cloudflare Pages + Worker에 연결하는 방법입니다.
각 서브도메인은 독립된 Pages 프로젝트로 운영됩니다.

## 전체 아키텍처

```
vibequant.cc              → vibequant-web       (메인 홈페이지 + Columns + About)
www.vibequant.cc          → vibequant.cc        (301 redirect)
tech.vibequant.cc         → vibequant-tech      (기술 블로그)
docs.vibequant.cc         → vibequant-docs      (API 문서)
api.vibequant.cc          → vibequant-api       (REST API Worker)
cti.vibequant.cc          → vibequant-cti       (Cyber Threat Intelligence)
play.vibequant.cc         → vibequant-play      (Python Playground)
lab.vibequant.cc          → vibequant-lab       (실험실)
research.vibequant.cc     → vibequant-research  (논문/리서치)
```

---

## 1. 사전 준비

- `vibequant.cc` 도메인이 Cloudflare에 등록되어 있어야 함 (DNS managed by Cloudflare)

---

## 2. Pages 프로젝트 생성 (최초 1회)

Cloudflare Dashboard → Workers & Pages → Create → Pages:

```bash
# 또는 CLI로:
cd /Users/dennis/vibe-investing/VibeQuant

# 기존 프로젝트 확인
npx wrangler pages project list

# 새 프로젝트 생성 (이미 존재하면 skip)
npx wrangler pages project create vibequant-web
npx wrangler pages project create vibequant-play
npx wrangler pages project create vibequant-tech
npx wrangler pages project create vibequant-cti
npx wrangler pages project create vibequant-lab
npx wrangler pages project create vibequant-research
npx wrangler pages project create vibequant-docs
```

---

## 3. Custom Domain 연결

Cloudflare Dashboard → Workers & Pages → 각 프로젝트 → **Custom Domains**:

| 프로젝트 | Custom Domain |
|----------|---------------|
| `vibequant-web` | `vibequant.cc` |
| `vibequant-web` | `www.vibequant.cc` |
| `vibequant-play` | `play.vibequant.cc` |
| `vibequant-tech` | `tech.vibequant.cc` |
| `vibequant-cti` | `cti.vibequant.cc` |
| `vibequant-lab` | `lab.vibequant.cc` |
| `vibequant-research` | `research.vibequant.cc` |
| `vibequant-docs` | `docs.vibequant.cc` |

---

## 4. API Worker Custom Domain

Cloudflare Dashboard → Workers & Pages → `vibequant-api` → **Triggers** → **Custom Domains**:
- `api.vibequant.cc` 추가

---

## 5. www Redirect Rule

www.vibequant.cc → vibequant.cc (301)

Cloudflare Dashboard → `vibequant.cc` zone → **Rules** → **Redirect Rules**:

```
Rule: www → apex
  When: (http.host eq "www.vibequant.cc")
  Then: Dynamic → concat("https://vibequant.cc", http.request.uri.path)
  Status: 301
```

---

## 6. DNS 확인

Custom Domain 추가 시 Cloudflare가 자동으로 CNAME 레코드 생성.
DNS → Records에서 아래 레코드가 Proxied(주황색 구름) 상태인지 확인:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `@` | `vibequant-web.pages.dev` | On |
| CNAME | `www` | `vibequant-web.pages.dev` | On |
| CNAME | `play` | `vibequant-play.pages.dev` | On |
| CNAME | `tech` | `vibequant-tech.pages.dev` | On |
| CNAME | `cti` | `vibequant-cti.pages.dev` | On |
| CNAME | `lab` | `vibequant-lab.pages.dev` | On |
| CNAME | `research` | `vibequant-research.pages.dev` | On |
| CNAME | `docs` | `vibequant-docs.pages.dev` | On |
| CNAME | `api` | `vibequant-api.gameworker-4bb.workers.dev` | On |

---

## 7. 배포

```bash
cd /Users/dennis/vibe-investing/VibeQuant

# 메인 사이트 + 컬럼 + About
cd pages
npx wrangler pages deploy . --project-name=vibequant-web --commit-dirty=true

# Playground
cd ../pages-play
npx wrangler pages deploy . --project-name=vibequant-play --commit-dirty=true

# Tech Blog
cd ../pages-tech
npx wrangler pages deploy . --project-name=vibequant-tech --commit-dirty=true

# CTI
cd ../pages-cti
npx wrangler pages deploy . --project-name=vibequant-cti --commit-dirty=true

# Lab
cd ../pages-lab
npx wrangler pages deploy . --project-name=vibequant-lab --commit-dirty=true

# Research
cd ../pages-research
npx wrangler pages deploy . --project-name=vibequant-research --commit-dirty=true

# Docs
cd ../pages-docs
npx wrangler pages deploy . --project-name=vibequant-docs --commit-dirty=true

# Worker
cd ../cloudflare
./scripts/deploy.sh
```

---

## 8. Sitemap URL 업데이트

커스텀 도메인 연결 후:

```bash
cd /Users/dennis/vibe-investing/VibeQuant
SITE_URL=https://vibequant.cc node content/build.mjs
cd pages
npx wrangler pages deploy . --project-name=vibequant-web --commit-dirty=true
```

---

## 9. 검증

```bash
# 메인
curl -sI https://vibequant.cc/ | head -3

# 서브도메인
curl -sI https://tech.vibequant.cc/ | head -3
curl -sI https://play.vibequant.cc/ | head -3
curl -sI https://cti.vibequant.cc/ | head -3
curl -sI https://docs.vibequant.cc/ | head -3
curl -sI https://lab.vibequant.cc/ | head -3
curl -sI https://research.vibequant.cc/ | head -3

# API
curl -s https://api.vibequant.cc/api/health

# www redirect
curl -sI https://www.vibequant.cc/ | grep -i location
```
