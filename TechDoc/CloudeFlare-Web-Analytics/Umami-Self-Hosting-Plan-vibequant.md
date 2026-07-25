---
title: "Umami 자체호스팅 도입 계획 — vibequant.cc"
subtitle: "Cloudflare 무료 티어 위에서 Vercel/Fly.io + Worker 프록시로 현실적으로 붙이기"
description: "Umami를 Cloudflare 전용으로 올리지 않고, Vercel 또는 Fly.io에 앱을 두고 Cloudflare Worker로 첫-party 프록시하는 두 시나리오의 준비물·리스크·장단점을 정리한다."
abstract: |
  Umami는 PostgreSQL/MySQL만 공식 지원하며 Cloudflare D1·Workers에 네이티브로 올리는 경로는 비현실적이다.
  vibequant.cc에는 A(Vercel+Worker)와 B(Fly.io+Worker) 두 실용 경로가 있고, 멀티 서브도메인·build.mjs 삽입·무료 티어 한계를 함께 검토해야 한다.
  권장은 A로 빠르게 검증한 뒤, 안정성·콜드스타트가 문제되면 B로 이전하는 것이다.
summary_for_ai: |
  Implementation plan for self-hosting Umami analytics on vibequant.cc (Cloudflare Pages free tier).
  Not pure Cloudflare (no D1/Workers-native Umami). Scenario A: Vercel + Neon/Supabase + CF Worker proxy.
  Scenario B: Fly.io Docker + Neon/Supabase + CF Worker proxy. Covers pros/cons, risks, multi-subdomain injection via build.mjs, APP_SECRET, ad-blocker bypass, free-tier limits.
date: 2026-07-25
author: "Dennis Kim"
lang: ko
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

# Umami 자체호스팅 도입 계획 — vibequant.cc

## 1. 들어가며: 현실적인 접근법

Umami를 Cloudflare **온전히** 위에 올리려는 시도는 매력적이지만, **현실적으로 복잡도가 높은 경로**입니다.

Umami는 **PostgreSQL 또는 MySQL만 공식 지원**하며, Cloudflare D1(SQLite 기반)은 공식 지원하지 않습니다. Cloudflare Workers는 V8 Isolate 환경이라 Node.js 기반 Umami를 그대로 올릴 수 없고, 데이터베이스 레이어를 직접 패치해야 합니다. 그 패치는 업데이트마다 깨질 위험이 큽니다.

따라서 이 문서에서는 **“Umami를 Cloudflare와 최대한 가깝게, 그러나 실용적으로 운영”** 하는 두 가지 현실적인 접근법을 검토합니다. 대상 사이트는 Cloudflare Pages 무료 티어에서 운영 중인 [vibequant.cc](https://vibequant.cc)와 그 서브도메인들입니다.

관련 배경: [Cloudflare 웹 분석 솔루션 가이드](./CloudeFlare-Web-Analytics-Guide.md)에서 권장한 “Web Analytics로 시작 → 필요 시 Umami 확장”의 실행 계획에 해당합니다.

| 접근법 | 설명 | 추천 상황 |
|--------|------|----------|
| **A. Vercel + Cloudflare Worker 프록시** | Umami 앱은 Vercel에, DB는 Neon/Supabase에, 트래킹은 Cloudflare Worker로 프록시 | 가장 쉽고 빠름. 검증·도입 1순위 |
| **B. Fly.io + Cloudflare Worker 프록시** | Umami 앱은 Fly.io 컨테이너에, DB는 Neon/Supabase에, 트래킹은 Cloudflare Worker로 프록시 | 콜드스타트·서버리스 제약이 거슬릴 때. 약간의 운영 비용·설정 필요 |

```
방문자 브라우저
    |
    |  script + /api/send  (analytics.vibequant.cc)
    v
Cloudflare Worker (첫-party 프록시)
    |
    v
Umami 앱 (A: Vercel / B: Fly.io)  <-->  PostgreSQL (Neon 또는 Supabase)
```

---

## 2. 시나리오 비교 요약

| 항목 | A. Vercel + Worker | B. Fly.io + Worker |
|------|--------------------|--------------------|
| 세팅 난이도 | 낮음 (약 40–60분) | 중 (CLI, 메모리 스케일, 배포 재시도) |
| 월 비용(소규모) | 사실상 0원 가능 | 0원에 가깝지 않을 수 있음 (아래 비용 절 참고) |
| 콜드스타트 | Vercel Function + Neon/Supabase 일시중지 시 존재 | 머신 always-on이면 낮음. 스케일-투-제로면 존재 |
| 운영 복잡도 | Fork 동기화, Vercel 빌드 한도 | Docker 이미지, `fly scale`, IPv4 |
| 데이터 소유 | DB는 Neon/Supabase, 앱은 Vercel | DB는 Neon/Supabase(또는 Fly Postgres), 앱은 Fly |
| vibequant.cc 적합도 | **1순위 추천** | 트래픽·안정성 이슈 후 이전용 |
| 광고 차단기 우회 | Worker 커스텀 도메인으로 동일하게 가능 | 동일 |

**결론(권장):** 먼저 **A**로 도입·검증하고, Vercel 콜드스타트·Hobby 한도·Prisma 연결 이슈가 체감되면 **B**로 이전합니다. Worker 프록시와 `analytics.vibequant.cc` 도메인 설계는 양쪽에서 재사용합니다.

---

## 3. 접근법 A: Vercel + Cloudflare Worker 프록시 (추천)

Umami 커뮤니티에서 가장 널리 쓰이는 조합입니다. 공식 가이드: [Running on Vercel](https://docs.umami.is/docs/guides/running-on-vercel).

### 3.1 아키텍처

```
방문자 브라우저
    |
    |  GET /u.js , POST /api/send
    v
Cloudflare Worker @ analytics.vibequant.cc
    |
    v
Vercel (Umami Next.js)  <-->  Neon 또는 Supabase (PostgreSQL)
```

### 3.2 준비물

| 항목 | 비고 |
|------|------|
| GitHub 계정 | Umami fork용 |
| Cloudflare 계정 (무료) | 이미 vibequant.cc DNS/Pages 운영 중 |
| Vercel 계정 (Hobby) | GitHub 로그인 |
| Neon 또는 Supabase | 무료 PostgreSQL |
| `openssl` 또는 비밀번호 생성기 | `APP_SECRET`용 |
| vibequant 빌드 파이프라인 수정 권한 | `VibeQuant/content/build.mjs`에 스크립트 삽입 |

### 3.3 단계별 설치

**Step 1: Umami 레포지토리 Fork**

[umami-software/umami](https://github.com/umami-software/umami)를 GitHub 계정으로 Fork합니다.

**Step 2: PostgreSQL 생성**

[Neon](https://neon.tech) 또는 [Supabase](https://supabase.com)에서 프로젝트를 만들고 Connection String(`postgresql://...`)을 복사합니다.

- Neon: serverless Postgres, idle 시 일시중지(콜드스타트) 가능
- Supabase: 무료 티어 DB 용량·연결 한도 확인 필요

**Step 3: Vercel에 Umami 배포**

1. Vercel에서 **Add New → Project**로 fork한 `umami`를 import
2. 환경 변수 설정:

| 변수명 | 값 | 비고 |
|--------|-----|------|
| `DATABASE_URL` | PostgreSQL connection string | 필수. Neon이면 pooled URL 사용 권장 |
| `APP_SECRET` | `openssl rand -hex 32` 결과 | v2+ 기준. 구버전 문서의 `HASH_SALT`는 대체됨 ([Environment variables](https://docs.umami.is/docs/environment-variables)) |
| `TRACKER_SCRIPT_NAME` | 예: `u` 또는 `vq-beacon` | 기본 `script.js` 대신 사용해 차단 확률 감소 |
| `COLLECT_API_ENDPOINT` | 예: `/api/e` (선택) | 기본 `/api/send` 대신 사용 가능 |
| `DISABLE_TELEMETRY` | `1` (선택) | Umami 자체 텔레메트리 끄기 |

3. Deploy 후 `.vercel.app` URL 확인

**Step 4: Umami 초기 설정**

1. 배포 URL로 접속
2. 기본 계정: `admin` / `umami` ([Login](https://docs.umami.is/docs/login))
3. **즉시 비밀번호 변경**
4. Settings → Websites에서 사이트 추가 후 **Website ID** 복사

vibequant는 호스트가 여러 개이므로 Website를 어떻게 나눌지 Step 전에 정합니다 (아래 [추가 필요 사항](#8-vibequantcc-추가-필요-사항) 참고).

**Step 5: Cloudflare Worker 프록시**

Worker는 **트래커 스크립트**와 **수집 API**를 모두 프록시해야 합니다. 원안처럼 `/api/send`만 넘기면 스크립트 로딩이 깨집니다.

예시 (경로는 실제 `TRACKER_SCRIPT_NAME` / `COLLECT_API_ENDPOINT`에 맞게 조정):

```javascript
const UMAMI_ORIGIN = "https://your-umami.vercel.app"; // Vercel Umami URL
const SCRIPT_PATH = "/u.js";          // TRACKER_SCRIPT_NAME 결과에 맞춤
const COLLECT_PATH = "/api/send";     // 또는 COLLECT_API_ENDPOINT

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
    // Cloudflare 방문 위치 헤더가 있으면 그대로 전달 (Managed Transforms 활성화 시)
    // CF-IPCountry, CF-IPCity 등

    const init = {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "follow",
    };

    const response = await fetch(upstream, init);
    const out = new Response(response.body, response);
    out.headers.set("Access-Control-Allow-Origin", "*"); // 필요 시 호스트 화이트리스트로 축소
    return out;
  },
};
```

주의:

- 통계 조회용 API 토큰을 Worker 소스에 하드코딩하지 않습니다. 대시보드는 Vercel URL(또는 별도 보호된 경로)로 직접 접속합니다.
- Production에서는 `UMAMI_ORIGIN`을 Worker **Secrets / Vars**로 둡니다.

**Step 6: 커스텀 도메인**

Worker에 `analytics.vibequant.cc`를 연결합니다. 트래킹이 첫-party(또는 같은 등록 도메인의 서브도메인)로 보이면 광고 차단기 회피 확률이 올라갑니다. 커뮤니티 논의: [umami#1026](https://github.com/umami-software/umami/discussions/1026).

**Step 7: vibequant.cc에 트래킹 코드 삽입**

올바른 스크립트 형태는 다음과 같습니다 (`src`는 **스크립트 파일**, `/api/send`가 아님):

```html
<script
  defer
  src="https://analytics.vibequant.cc/u.js"
  data-website-id="YOUR_WEBSITE_ID"
></script>
```

정적 HTML이 `content/build.mjs`의 `layout()`으로 생성되므로, 수동으로 모든 `pages/**/index.html`을 고치지 말고 **빌드 템플릿의 `<head>`** (예: `extraHead` 또는 공통 스니펫)에 넣는 편이 안전합니다. 이후 각 Pages 프로젝트(`vibequant-web`, `vibequant-tech`, `vibequant-cti` 등)를 재배포합니다.

### 3.4 장단점

| 장점 | 단점 |
|------|------|
| 세팅이 가장 빠름. 공식 Vercel 가이드와 일치 | Hobby 플랜 Function 실행 시간·동시성 한도 |
| Docker/CLI 불필요 | Neon/Supabase idle 일시중지 + Vercel 콜드스타트 겹칠 수 있음 |
| 비용 0원에 가깝게 유지하기 쉬움 | Fork를 upstream과 주기적으로 sync 해야 함 |
| Worker 프록시는 B로 이전해도 재사용 | Prisma + serverless DB 연결 풀 이슈 가능 (pooled URL 필수에 가까움) |
| Next.js 네이티브 호스팅 | 대시보드도 Vercel에 있어 장애 시 앱·수집이 같이 영향 |

### 3.5 리스크 (A)

| 리스크 | 영향 | 완화 |
|--------|------|------|
| Neon/Supabase 일시중지 | 첫 PV 지연·드롭 | 주기 ping, 또는 유료 최소 플랜, 또는 B로 이전 |
| Vercel Hobby 한도 초과 | 배포 실패·대역폭 제한 | 트래픽 모니터링, 필요 시 Pro 또는 B |
| Connection string을 non-pooled로 사용 | 간헐적 DB 오류 | Neon pooled / Supabase pooler URL |
| 기본 `admin`/`umami` 방치 | 대시보드 탈취 | 즉시 비밀번호 변경, 공유 URL 최소화 |
| Worker 오픈 프록시화 | 남용·비용 | 경로 화이트리스트, 필요 시 Origin 제한 |
| Fork 방치 | 보안 패치 누락 | upstream remote sync 주기화 |

---

## 4. 접근법 B: Fly.io + Cloudflare Worker 프록시

Vercel 서버리스 제약이 부담되거나 상시 프로세스에 가깝게 두고 싶을 때 선택합니다. 공식 가이드: [Running on Fly.io](https://docs.umami.is/docs/guides/running-on-fly-io).

### 4.1 아키텍처

```
방문자 브라우저
    |
    v
Cloudflare Worker (analytics.vibequant.cc)
    |
    v
Fly.io (Umami Docker)  <-->  Neon/Supabase 또는 Fly Postgres
```

### 4.2 설치 개요

1. Neon/Supabase에서 PostgreSQL 생성 (A와 동일) — 또는 Fly launch 시 Postgres 생성
2. [flyctl](https://fly.io/docs/flyctl/) 설치 및 로그인
3. `fly.toml` 작성 후 배포. 이미지 예:

```toml
# 공식 문서 예시 기반. region·app 이름은 환경에 맞게 변경
kill_signal = "SIGINT"
kill_timeout = "5s"

[experimental]
auto_rollback = true

[build]
  # 문서: docker.umami.is/... 또는 ghcr.io/umami-software/umami:postgresql-latest
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

4. 핵심 운영 포인트 (공식 문서 기준):

```bash
fly secrets set APP_SECRET="$(openssl rand -hex 32)"
fly deploy
fly scale memory 512   # Umami는 256MB에서 실패하는 사례가 많음
fly deploy
```

5. 로그인: `admin` / `umami` → 비밀번호 변경
6. A의 Step 5–7과 동일하게 Worker 프록시·도메인·사이트 스크립트 연결 (`UMAMI_ORIGIN`만 Fly URL로 변경)

### 4.3 장단점

| 장점 | 단점 |
|------|------|
| 컨테이너로 컨트롤이 명확 | CLI·스케일·헬스체크 등 학습 비용 |
| 512MB always-on이면 콜드스타트 완화 | **무료 티어 256MB 머신만으로는 부족**할 가능성 큼 |
| 리전을 `nrt`/`icn` 등으로 선택 가능 | 공개 IPv4 등 **소액 고정 과금** 가능 ([Fly pricing](https://fly.io/docs/about/pricing/)) |
| A에서 쓰던 Worker/DB를 재사용하기 쉬움 | 이미지 태그 `latest` 추적·롤백 책임 |
| Vercel Hobby 한도에서 독립 | 방치 시 머신 비용·유령 볼륨 누적 |

### 4.4 리스크 (B)

| 리스크 | 영향 | 완화 |
|--------|------|------|
| 메모리 512MB 미만 | OOM, 배포/마이그레이션 실패 | `fly scale memory 512` 이상 |
| “무료” 가정 | 월 수 달러 청구 | Billing alert, IPv4·머신 수 점검 |
| Fly Postgres를 같이 띄움 | 스토리지·머신 이중 비용 | DB는 Neon/Supabase 유지 권장 |
| 스케일-투-제로 | 첫 요청 지연 | 최소 1머신 always-on 또는 A와 동일한 ping |
| 리전 미스매치 (앱 도쿄, DB 미국) | 수집 API 지연 | 앱·DB 리전을 가깝게 |

---

## 5. 공통: Cloudflare 최적화와 D1 비추천

### 5.1 Cloudflare 위치 헤더

Cloudflare 대시보드에서 Managed Transforms의 visitor location headers를 켜면 Umami가 국가/지역을 더 잘 인식합니다. 관련 환경 변수: `CLIENT_IP_HEADER`, `SKIP_LOCATION_HEADERS` ([Environment variables](https://docs.umami.is/docs/environment-variables)).

### 5.2 D1에 Umami를 올리는 경로

D1에서 돌리려면 DB 레이어 패치가 필요합니다.

- Umami 업데이트마다 패치 재적용
- 공식 미지원 → 장애 시 커뮤니티 의존
- D1 무료 할당량·SQLite 제약

**비추천.** Neon/Supabase 무료 PostgreSQL이 유지보수 비용 대비 유리합니다.

### 5.3 첫-party 트래킹

`analytics.vibequant.cc` + 커스텀 `TRACKER_SCRIPT_NAME` / `COLLECT_API_ENDPOINT` 조합이 광고 차단기 회피에 가장 현실적입니다. “우회”는 완벽하지 않으며, 일부 엄격한 차단 목록에는 여전히 잡힐 수 있습니다.

---

## 6. 비용 정리 (무료 티어 기준, 2026년 맥락)

| 서비스 | 무료/허용량(대략) | Umami에 충분한가? | 주의 |
|--------|-------------------|-------------------|------|
| Cloudflare Workers | 일 요청 한도(계정 플랜 기준) | 트래킹 프록시로는 보통 충분 | 오픈 프록시·봇 남용 시 소진 |
| Vercel Hobby | 대역폭·Function 한도 | 소규모 콘텐츠 사이트에는 보통 충분 | 상업적 한도·콜드스타트 |
| Neon Free | 스토리지·compute 시간 | 초기·저트래픽에 충분 | idle 일시중지 |
| Supabase Free | DB 용량·대역폭 | 초기에는 충분 | 프로젝트 pause 정책 확인 |
| Fly.io | 공유 CPU·시간 허용량 존재 | **Umami 512MB 요구와 충돌 가능** | IPv4·메모리 초과 시 유료화 |

**현실적 월 비용 기대치**

- **A:** 트래픽이 크지 않으면 **0원**에 가깝게 유지 가능
- **B:** “완전 무료”를 단정하기 어렵다. 메모리·IPv4만으로도 월 소액이 날 수 있다. Billing alert를 반드시 켠다.

“월 비용 0원”은 **A + Neon/Supabase + Worker** 조합에서만 안전하게 목표로 잡는 것이 좋습니다.

---

## 7. 공통 리스크와 운영 이슈

| 영역 | 내용 |
|------|------|
| **보안** | 기본 비밀번호 변경, 대시보드 URL 노출 최소화, Worker에 API Bearer 토큰 넣지 않기, `APP_SECRET` 유출 금지 |
| **프라이버시** | Umami는 쿠키리스에 가깝지만, 공개 사이트의 개인정보 처리방침·쿠키 배너 정책과 맞는지 확인. EU 방문자가 있으면 보관 기간·목적 명시 |
| **데이터 유실** | Neon/Supabase 무료 티어 삭제·pause 정책. 주기적 DB dump 또는 논리 백업 |
| **정확도** | 광고 차단기·ITP·봇 필터로 PV는 항상 과소/과대 가능. Cloudflare Web Analytics와 병행해 교차 검증 권장 |
| **종속성** | 앱 호스트(Vercel/Fly) + DB(Neon/Supabase) + CF Worker 3축. 한 축 장애 시 수집 공백 |
| **업데이트** | Fork sync(A) 또는 이미지 태그 고정(B). Prisma 마이그레이션 실패 시 롤백 계획 |
| **남용** | `/api/send` 스팸으로 DB 부풀리기. Website ID 공개는 불가피하므로 rate limit·이상치 모니터링 |

---

## 8. vibequant.cc 추가 필요 사항

원 가이드에 없는, **이 레포·도메인 구조 때문에 추가로 필요한 작업**입니다.

### 8.1 멀티 호스트 전략

현재 대략적 매핑 ([CUSTOM_DOMAIN_SETUP.md](../../VibeQuant/cloudflare/docs/CUSTOM_DOMAIN_SETUP.md)):

| 호스트 | Pages 프로젝트 | 콘텐츠 |
|--------|----------------|--------|
| `vibequant.cc` | vibequant-web | 허브·에세이 등 |
| `docs.vibequant.cc` | vibequant-docs | Columns |
| `tech.vibequant.cc` | vibequant-tech | TechDoc |
| `cti.vibequant.cc` | vibequant-cti | CTI |
| `play.vibequant.cc` | vibequant-play | Playground |
| `lab` / `research` | 각각 | 실험·리서치 |

선택지:

1. **호스트마다 Website ID** — 대시보드가 깔끔, 스크립트에 ID를 호스트별로 분기
2. **하나의 Website**에 여러 도메인 — 설정은 단순, 리포트에서 호스트/경로로 필터

콘텐츠 아카이브 용도라면 **호스트별 Website**(docs / tech / cti / hub)가 분석에 유리합니다.

### 8.2 빌드 파이프라인 삽입

추적 코드는 `VibeQuant/content/build.mjs`의 `layout()` `<head>`에 넣는 것이 맞습니다. 생성 HTML을 직접 수정하면 다음 빌드에 덮어씁니다.

추가로 필요한 것:

- `UMAMI_WEBSITE_ID_*` 또는 빌드 시 env로 ID 주입
- 로컬 미리보기에서 추적 끄기 플래그 (`UMAMI_ENABLED=0`)
- 빌드 후 **관련 Pages 전부** 재배포

### 8.3 DNS / Worker

- `analytics.vibequant.cc` → Worker 커스텀 도메인
- 기존 Pages 커스텀 도메인과 충돌 없는지 확인
- CORS: 여러 서브도메인에서 스크립트·POST가 오므로 Worker/Umami CORS 설정 점검

### 8.4 Cloudflare Web Analytics와의 관계

이미 Web Analytics를 쓰거나 쓸 예정이면:

- 단기: **병행**해 수치 교차 검증
- 중기: Umami가 안정되면 Web Analytics는 PV 백업용으로만 유지하거나 정리

둘 다 켜도 페이지 비용은 작지만, 지표 해석 시 이중 집계를 혼동하지 않도록 합니다.

### 8.5 커스텀 이벤트 (후속)

스크롤 깊이·아웃바운드 클릭 등은 Umami [Custom Events](https://docs.umami.is/docs/tracker-functions)로 추가합니다. 기본 pageview 안정화 후에 구현합니다.

### 8.6 문서·운영 체크

- `APP_SECRET`, DB URL을 레포에 커밋하지 않기 (`.env` / Vercel·Fly secrets)
- 장애 시 연락 경로: Vercel/Fly status, Neon/Supabase status
- 주 1회: fork sync 또는 이미지 digest 확인 (선택)

---

## 9. 체크리스트: vibequant.cc 도입 일정

| 단계 | 작업 | 예상 시간 |
|------|------|----------|
| 1 | 호스트별 Website 전략 결정 (단일 vs 다중 ID) | 10분 |
| 2 | Umami GitHub Fork | 2분 |
| 3 | Neon/Supabase PostgreSQL 생성 | 5분 |
| 4 | Vercel 배포 + `DATABASE_URL` / `APP_SECRET` / tracker 이름 | 15분 |
| 5 | 로그인·비밀번호 변경·Website 추가 | 5분 |
| 6 | Cloudflare Worker (script + collect 프록시) + Secrets | 15분 |
| 7 | `analytics.vibequant.cc` 연결 | 5분 |
| 8 | Managed Transforms (visitor location) 확인 | 3분 |
| 9 | `build.mjs`에 스크립트 삽입 + 로컬 빌드 확인 | 15분 |
| 10 | 해당 Pages 프로젝트 재배포 | 10–20분 |
| 11 | 테스트 방문 → Realtime/대시보드 확인 | 5분 |
| 12 | (선택) Billing alert, DB 백업, Web Analytics 병행 메모 | 10분 |

**총 예상: 약 1–1.5시간** (멀티 호스트·빌드 수정 포함 시). 원안의 40–50분은 “단일 사이트·수동 HTML 삽입” 기준에 가깝습니다.

접근법 B를 처음부터 택하면 Fly 메모리 스케일·과금 확인으로 **+30–60분**과 소액 비용 가능성을 더합니다.

---

## 10. 추천 결정

1. **1차: 접근법 A (Vercel + Neon + Worker)**  
   - 비용·속도·문서 성숙도 면에서 vibequant.cc에 가장 맞음  
2. **프록시는 처음부터 `analytics.vibequant.cc`**  
   - 나중에 B로 이전해도 Worker origin만 교체  
3. **D1/Workers-native Umami는 하지 않음**  
4. **build.mjs 경유 삽입 + 호스트별 Website ID**  
5. **콜드스타트·Hobby 한도가 체감되면 B로 이전**  
   - 그 전까지 Fly “무료”를 전제로 잡지 말 것  

이 조합은 무료 티어에 가깝게 유지하면서도 첫-party 트래킹·데이터 소유·Umami 업데이트 경로를 확보합니다. Cloudflare Web Analytics로 가볍게 시작한 뒤, 이 계획으로 Umami를 붙이는 순서가 운영 부담 대비 효과가 가장습니다.

---

## 11. 레퍼런스

### 공식 문서

- [Umami — Running on Vercel](https://docs.umami.is/docs/guides/running-on-vercel)
- [Umami — Running on Fly.io](https://docs.umami.is/docs/guides/running-on-fly-io)
- [Umami — Environment variables](https://docs.umami.is/docs/environment-variables) (`APP_SECRET`, `TRACKER_SCRIPT_NAME`, `COLLECT_API_ENDPOINT`)
- [Umami — Login (default admin / umami)](https://docs.umami.is/docs/login)
- [Umami — Tracker functions / custom events](https://docs.umami.is/docs/tracker-functions)
- [Umami GitHub](https://github.com/umami-software/umami)
- [Fly.io — Resource pricing](https://fly.io/docs/about/pricing/)
- [Fly.io — flyctl](https://fly.io/docs/flyctl/)
- [Vercel — Rewrites](https://vercel.com/docs/rewrites) (대안: 메인 앱이 Vercel일 때 동일 도메인 프록시)
- [Neon](https://neon.tech) / [Supabase](https://supabase.com)

### 커뮤니티·가이드

- [Preventing ad blockers with Cloudflare Worker (umami#1026)](https://github.com/umami-software/umami/discussions/1026)
- [Self-hosted Umami on Vercel + Supabase (예시 글)](https://www.surajon.dev/how-to-self-host-umami-analytics-with-supabase-and-vercel)
- [Umami on Vercel + Neon (요약 가이드)](https://setuptracking.com/umami-vercel/)

### 이 레포

- [Cloudflare 웹 분석 솔루션 가이드](./CloudeFlare-Web-Analytics-Guide.md)
- [VibeQuant 커스텀 도메인 설정](../../VibeQuant/cloudflare/docs/CUSTOM_DOMAIN_SETUP.md)
- 트래킹 삽입 지점: `VibeQuant/content/build.mjs` (`layout()` `<head>`)
