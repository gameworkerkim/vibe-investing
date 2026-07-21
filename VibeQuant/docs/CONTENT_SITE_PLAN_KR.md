# VibeQuant 콘텐츠 사이트 계획 — 칼럼 · TechDoc · SEO

투자 아이디어 칼럼과 기술 문서를 **Cloudflare Pages**에 정적 사이트로 발행하고,  
LinkedIn / Facebook / Threads / Google 검색 유입을 늘리기 위한 실행 계획입니다.

| 문서 | 언어 |
|------|------|
| 이 파일 | 한국어 |
| [CONTENT_SITE_PLAN.md](CONTENT_SITE_PLAN.md) | English |

**관련 소스**

| 구분 | GitHub | 발행 예정 URL (Pages) |
|------|--------|------------------------|
| 투자 칼럼 | [`02.Investment Idea Column`](https://github.com/gameworkerkim/vibe-investing/tree/main/02.Investment%20Idea%20Column) | `https://vibequant-web.pages.dev/columns/` |
| 기술 문서 | [`TechDoc`](https://github.com/gameworkerkim/vibe-investing/tree/main/TechDoc) | `https://vibequant-web.pages.dev/tech/` |
| 데모(기존) | `VibeQuant/pages` | `https://vibequant-web.pages.dev/` |
| 작성자 소개 | [`gameworkerkim/README`](https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md) | `/about/` + 칼럼 구간 배치 (아래 §3) |

**원칙:** HTML·SEO·OG·**LLM 발견(llms.txt)** 은 **Pages**. Worker(`vibequant-api`)는 API·시세만.  
칼럼 페이지에 Pyodide를 넣지 않는다 (Core Web Vitals).  
사람 검색엔진(SEO)과 LLM/에이전트 검색(GEO · llms.txt)을 **같은 URL·메타 계층**으로 맞춘다.

참고 내부 가이드: [TechDoc/agent-friendly-website-guide](https://github.com/gameworkerkim/vibe-investing/tree/main/TechDoc/agent-friendly-website-guide) · 레포 루트 [`llms.txt`](https://github.com/gameworkerkim/vibe-investing/blob/main/llms.txt)

---

## 1. 배경과 문제

현재 유입이 LinkedIn·Facebook·Threads에 편중되어 있고, 공유 시 **Open Graph(썸네일·제목·요약)** 가 약하다.  
GitHub 트리의 Markdown은 검색·소셜에 불리하고, 롱테일 키워드(예: “SpaceX IPO 분석”, “코리아 디스카운트 원인”)용 **개별 URL**이 없다.  
동시에 ChatGPT·Claude·Perplexity·Cursor 등 **LLM 크롤러/에이전트**는 `sitemap`만으로는 부족하고, **`/llms.txt` · 시맨틱 HTML · 요약 가능한 구조**가 없으면 인용·추천에서 밀린다.

**기회**

- 칼럼 200+ · TechDoc 70+ 규모의 오픈 아카이브
- Cloudflare CDN + 정적 HTML로 속도와 무료 호스팅
- GitHub 원문 링크 ↔ Pages 웹뷰 **양방향**으로 신뢰·유입 강화
- 작성자 프로필([김호광 / Dennis Kim](https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md))을 칼럼 구간에 배치해 **인물 검색·브랜드 검색·LLM 저자 귀속**까지 연결
- 이미 레포에 있는 `llms.txt` / agent-friendly 가이드를 **Pages 발행면으로 확장**

---

## 2. 목표 아키텍처

```text
GitHub MD (SSOT)
  02.Investment Idea Column/*.md
  TechDoc/*.md
        │
        ▼
  build:content  (MD → HTML + slug + OG + JSON-LD + llms fragments)
        │
        ▼
Cloudflare Pages (vibequant-web)
  /                 VibeQuant Demo
  /columns/         칼럼 인덱스 (+ 작성자 카드)
  /columns/{slug}/  개별 칼럼 (롱테일 · BlogPosting)
  /tech/            TechDoc 인덱스
  /tech/{slug}/     개별 기술 문서 (TechArticle)
  /about/           작성자 소개 (Person)
  /sitemap.xml      검색엔진 전체 URL
  /robots.txt       크롤 허용 + Sitemap + (선택) LLM bot 정책
  /llms.txt         LLM·에이전트용 사이트 맵 (llmstxt.org)
  /llms-full.txt    (선택) 긴 요약·전 글 목록
  /columns/llms.txt · /tech/llms.txt   섹션별 큐레이션
```

```mermaid
flowchart TB
  subgraph gh [GitHub]
    Col[Investment Idea Column]
    Tech[TechDoc]
    Profile[gameworkerkim README]
    RootLlms[repo llms.txt]
  end
  subgraph pages [Cloudflare Pages]
    Nav[Demo / Columns / Tech / About]
    Art[칼럼·문서 개별 HTML]
    SEO[sitemap · robots · OG · JSON-LD]
    LLM[/llms.txt · section llms.txt]
  end
  subgraph in [유입]
    Social[LinkedIn · Threads · FB]
    Search[Google 롱테일 SEO]
    Agents[LLM · Perplexity · Cursor agents]
    Repo[GitHub 트리·README]
  end
  Col --> Art
  Tech --> Art
  Profile --> Nav
  RootLlms -.->|동기화·확장| LLM
  Art --> SEO
  Art --> LLM
  SEO --> Search
  LLM --> Agents
  Art --> Social
  Art -->|하단 원문 링크| Repo
  Repo -->|웹에서 읽기| Art
```

---

## 3. 작성자 소개 배치 (김호광 / Dennis Kim)

원문 프로필: [github.com/gameworkerkim/gameworkerkim/blob/main/README.md](https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md)

프로필 핵심 한 줄(사이트용 카피 초안):

> CTI · AI 퀀트 · Web3 교차점의 독립 연구자. 前 싸이월드 대표 · Azure MVP.  
> *LLM은 엑셀이지 오라클이 아니다.* — [전체 소개](https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md)

### 3.1 배치 맵

| 위치 | 형태 | 목적 |
|------|------|------|
| **`/about/`** | 프로필 README의 KO/EN 요약 + CTI / AI Quant / Essays 링크 + Email·LinkedIn·ORCID | 인물·브랜드 랜딩, JSON-LD `Person` |
| **전역 헤더/푸터** | 이름 + About 링크 (작게) | 모든 페이지에서 도달 |
| **`/columns/` 인덱스 상단** | **작성자 카드** (사진 또는 이니셜, 2–3문장, “전체 소개 →”) | 칼럼 = 사람 콘텐츠임을 각인 (소셜·검색 이탈 방지) |
| **개별 칼럼 하단** | `작성자` 블록 → 짧은 소개 + About + **GitHub 프로필 README** + 원문 칼럼 blob 링크 | E-E-A-T, 공유 후 신뢰 |
| **`/tech/` 인덱스** | 한 줄 byline + About | 기술 문서는 가볍게 |
| **개별 TechDoc 하단** | byline + GitHub 원문 (프로필은 링크만) | 본문 집중 |
| **Demo(`/`) 푸터** | “칼럼 · TechDoc · About” | 데모 ↔ 콘텐츠 유기 연결 |

### 3.2 칼럼 구간에서의 시각 구조 (모바일 우선)

```text
┌─────────────────────────────┐
│  VibeQuant  [Demo][Columns] │
│             [Tech][About]   │
├─────────────────────────────┤
│  Columns                    │
│  ┌───────────────────────┐  │
│  │ Dennis Kim / 김호광    │  │  ← 작성자 카드 (§3.1)
│  │ CTI · AI Quant · Web3 │  │
│  │ [전체 소개 on GitHub] │  │
│  └───────────────────────┘  │
│  최신 칼럼 리스트…          │
└─────────────────────────────┘

개별 칼럼 하단:
  ── 작성자 ──
  김호광 (Dennis Kim) — …
  [프로필 README] [About] [이 글 GitHub 원문]
```

### 3.3 JSON-LD (작성자)

- `/about/` · 칼럼 글: `Person` + (글은) `BlogPosting.author` → 동일 `@id`
- `sameAs`: LinkedIn, ORCID, GitHub 프로필 README, vibe-investing, essays 등

---

## 4. SEO · LLM 검색 구조 (사람 + 모델)

검색을 **두 축**으로 설계한다.

| 축 | 대상 | 핵심 산출물 |
|----|------|-------------|
| **SEO** | Google / Bing / 네이버 등 | 개별 URL, sitemap, OG, JSON-LD, CWV |
| **GEO / LLM 발견** | ChatGPT·Claude·Perplexity·Cursor·기타 에이전트 | `/llms.txt`, 시맨틱 HTML, 요약 블록, 안정 canonical |

내부 기준 문서: [에이전트 친화 웹 가이드](https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/agent-friendly-website-guide/agent-friendly-website-guide.ko.md) (llms.txt · Schema.org · 시맨틱 HTML · GEO).

### 4.1 전통 SEO (검색엔진)

| 항목 | 내용 |
|------|------|
| 개별 URL | `/columns/{slug}/`, `/tech/{slug}/` — 롱테일 키워드 |
| `sitemap.xml` | 홈·About·모든 published 칼럼/Tech; `lastmod` = frontmatter 또는 git |
| `robots.txt` | `Allow: /`, `Sitemap: https://…/sitemap.xml`; Demo WASM 경로만 필요 시 제한 |
| Open Graph | `og:title` · `description` · `image`(1200×630) · `url` · `type=article` — **소셜 최우선** |
| Twitter Card | `summary_large_image` |
| JSON-LD | `BlogPosting` / `TechArticle` / `Person` / `BreadcrumbList` / `WebSite`(+`SearchAction` 선택) |
| `canonical` | Pages URL 고정; `isBasedOn` / 하단 링크로 GitHub blob |
| `hreflang` | KO/EN/ZH 쌍이 있을 때만 |
| 속도 | 정적 HTML+CSS; 칼럼에 Pyodide·무거운 폰트 금지 |
| `_headers` | `/columns/*`, `/tech/*` → `max-age=3600, stale-while-revalidate=86400` |
| 분석 | Cloudflare Web Analytics + (후속) GSC |

### 4.2 LLM · 에이전트 발견 (`llms.txt` / GEO)

| 경로 | 역할 |
|------|------|
| **`/llms.txt`** | [llmstxt.org](https://llmstxt.org) 형식. 사이트 한 줄 요약, 저자, Demo·Columns·Tech·About·주요 글 링크 |
| **`/llms-full.txt`** (선택) | 전 글 제목+1문장 요약+URL 목록 (토큰 예산 큰 에이전트용) |
| **`/columns/llms.txt`** | 칼럼만 큐레이션 (최신 N + 카테고리 대표) |
| **`/tech/llms.txt`** | TechDoc만 큐레이션 |
| **레포 `llms.txt`** | GitHub 발견용 유지; Pages URL을 “Web reading”으로 추가해 **이중 진입** |

**`/llms.txt` 초안 골격**

```text
# VibeQuant Content
> Multi-LLM quant committee demo + investment columns + tech docs by Dennis Kim (김호광).
> Thesis: an LLM is a spreadsheet, not an oracle.

## Site
- [Demo](https://vibequant-web.pages.dev/): Pyodide vi_browser runner
- [Columns](https://vibequant-web.pages.dev/columns/): Investment idea columns
- [Tech](https://vibequant-web.pages.dev/tech/): Technical guides
- [About](https://vibequant-web.pages.dev/about/): Author profile
- [Author GitHub](https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md)

## Optional
- [Full index](https://vibequant-web.pages.dev/llms-full.txt)
- [Columns llms](https://vibequant-web.pages.dev/columns/llms.txt)
- [Tech llms](https://vibequant-web.pages.dev/tech/llms.txt)
- [Repo llms.txt](https://github.com/gameworkerkim/vibe-investing/blob/main/llms.txt)
```

빌드 시 `build:content`가 **sitemap과 동일 소스**에서 llms 섹션을 생성해 누락·불일치를 막는다.

### 4.3 페이지 HTML이 LLM·크롤러에 읽히게

| 규칙 | 이유 |
|------|------|
| 시맨틱 태그: `header` / `nav` / `main` / `article` / `footer` | 접근성 트리 · 에이전트 DOM |
| 본문은 **서버 렌더된 HTML** (JS로 본문 주입 금지) | 봇·LLM fetch가 내용 확보 |
| 글 상단 **요약(abstract) 2–4문장** | 스니펫·인용·llms-full 생성 원천 |
| `h1` 1개, `h2`/`h3` 계층 유지 | 목차·앵커·인용 구간 |
| 표·리스트는 Markdown→HTML 그대로 | 구조 보존 |
| `lang` 속성, 가능하면 `dir` | 다국어 |
| 숨긴 텍스트·키워드 스터핑 금지 | SEO·신뢰 |

### 4.4 메타데이터 정렬 (한 소스 → 여러 산출)

frontmatter / fallback 필드 하나가 다음을 **동시에** 채운다.

```text
title, description, date, tags, lang, github, canonical
        │
        ├─ <title> · meta description · OG · Twitter
        ├─ JSON-LD BlogPosting / TechArticle
        ├─ sitemap.xml row
        ├─ /llms.txt · /llms-full.txt · section llms.txt
        └─ 관련 글 · BreadcrumbList
```

### 4.5 robots · AI 크롤러 정책 (명시)

- 기본: 공개 콘텐츠 **허용** (`Allow: /`) — 인용·발견이 목표.
- `Disallow` 후보: 없는 것이 기본. Demo 러너 쿼리 파라미터만 필요 시 제한.
- Cloudflare AI Crawl Control / bot 관리와 **정책 문서화** (차단 시 llms.txt 의미가 사라짐).
- `robots.txt`에 Sitemap + (선택) 주석으로 llms.txt 위치 안내.

### 4.6 검증 체크리스트

| 대상 | 방법 |
|------|------|
| Google | Search Console URL 검사 · sitemap 상태 |
| 소셜 | LinkedIn Post Inspector · Twitter Card Validator |
| LLM 발견 | `/llms.txt` 200 OK · 절대 URL · 링크 깨짐 0 |
| 구조화 | [Google Rich Results Test](https://search.google.com/test/rich-results) JSON-LD |
| 에이전트 UX | 본문 noscript/HTML-only로 `curl` 시 제목·요약 포함 |

---

## 5. URL · Frontmatter

**Slug:** ASCII만 (`spacex-after-ipo`, `korea-discount-chaebol`). 한글 파일명 ≠ URL.

```yaml
---
title: "SpaceX IPO 이후 시나리오"
title_en: "SpaceX After IPO"
description: "120자 이내 요약"
abstract: "2–4문장. llms-full·스니펫·인용용."
date: 2026-06-04
tags: [SpaceX, IPO]
keywords: ["SpaceX IPO", "SpaceX 상장"]
lang: ko
schema_type: BlogPosting
canonical: https://vibequant-web.pages.dev/columns/spacex-after-ipo/
github: https://github.com/gameworkerkim/vibe-investing/blob/main/02.Investment%20Idea%20Column/Elon%20Musk/SpaceX_After_IPO.md
og_image: /og/spacex-after-ipo.png
draft: false
---
```

전량 frontmatter 강제하지 않음. 빌드 fallback(제목·첫 문단→`abstract`) + **상위 트래픽 후보부터** 메타 보강.

**제외 후보:** `.csv`, 소스 트리의 로컬 `llms.txt`(인덱스로 흡수), 명백한 draft (`draft: true`).

---

## 6. 구현 Phase

### Phase A — 정보 설계 (1–2일)

- [ ] 상위 30 칼럼 + TechDoc 핵심 slug 매핑표 (롱테일 키워드 열 포함)
- [ ] 내비 IA: Demo / Columns / Tech / About
- [ ] 작성자 카드 카피 KO/EN 확정 (프로필 README 기반)
- [ ] draft/제외 규칙
- [ ] `/llms.txt` 정보 구조(섹션·필수 링크) 확정

### Phase B — 정적 생성기 (3–5일)

- [ ] `npm run build:content` — MD → `pages/columns|tech|about`
- [ ] 인덱스(모바일 카드) + 개별 HTML (**시맨틱 `article`**, 상단 abstract)
- [ ] 글 하단: 작성자 블록 + GitHub 원문
- [ ] `/about/` 페이지 (프로필 요약 + README 링크)
- [ ] 기존 `deploy:pages` 파이프라인에 build 훅

**권장 스택:** Node + `markdown-it`(또는 marked) + HTML 템플릿. Astro는 후속 검토.

### Phase C — SEO + LLM 발견 패키지 (2–4일)

- [ ] `sitemap.xml`, `robots.txt`
- [ ] OG + Twitter Card 메타
- [ ] JSON-LD (`BlogPosting` / `TechArticle` / `Person` / `BreadcrumbList`)
- [ ] **`/llms.txt`**, (선택) `/llms-full.txt`, `/columns/llms.txt`, `/tech/llms.txt` — sitemap과 동일 소스 생성
- [ ] OG 이미지 템플릿 (1200×630); 상위 20편 우선
- [ ] `_headers` — `/columns/*`, `/tech/*`, `/llms.txt` 캐시
- [ ] Rich Results · `curl` HTML-only 스모크

### Phase D — 분석·검증 (1–2일)

- [ ] Cloudflare Web Analytics (경로: `/columns/*`, `/tech/*`, `/about/`, `/llms.txt` 히트)
- [ ] Google Search Console + sitemap 제출
- [ ] LinkedIn Post Inspector / 카드 검증
- [ ] PageSpeed — 칼럼 URL LCP 목표
- [ ] llms.txt 링크 검사(깨진 URL 0)

### Phase E — 도메인·크로스링크 (후속)

- [ ] 커스텀 도메인
- [ ] GitHub 칼럼/TechDoc README에 “웹에서 읽기” 배너
- [ ] 프로필 README에 Columns / Tech / About / **llms.txt** URL 추가
- [ ] 레포 루트 `llms.txt`에 Pages Columns·Tech·About·`/llms.txt` 링크
- [ ] TechDoc `llms.txt` ↔ Pages `/tech/llms.txt` 정합

---

## 7. 주간 로드맵

| 주 | 산출 |
|----|------|
| W1 | slug·키워드 매핑, About·작성자 카드 목업, llms.txt 골격, build 골격 |
| W2 | 인덱스·개별 HTML·abstract·원문 푸터·내비·sitemap/robots |
| W3 | OG·JSON-LD·**llms.txt 계열**·Analytics·GSC·Inspector·Rich Results |
| W4+ | 메타 보강, 커스텀 도메인, README↔웹↔레포 llms 크로스링크 |

---

## 8. 성공 지표 (4–8주)

**SEO**

- 색인된 `/columns/*`, `/tech/*`, `/about/` URL 수
- 소셜 공유 시 썸네일·제목 정상 비율
- Web Analytics: 칼럼·About 세션 vs Demo 세션
- 검색 쿼리 예: SpaceX IPO, 코리아 디스카운트, 작성자명

**LLM / GEO**

- `/llms.txt`·섹션 llms 주간 fetch(Analytics 또는 로그)
- 에이전트·답변 엔진에서 사이트 URL 인용 여부(수동 샘플링)
- `curl` 시 본문·abstract 포함률 100%
- 레포 llms.txt와 Pages llms.txt 링크 정합(깨짐 0)

---

## 9. Non-goals

- Worker에 HTML 칼럼 호스팅
- 칼럼 페이지에 Pyodide/대시보드 번들
- 한글 파일명 그대로 URL 사용
- 전량 frontmatter 완료 후 배포
- 서버 실시간 MD 렌더만으로 SEO
- 본문을 클라이언트 JS로만 주입 (LLM·봇 불가독)
- AI 크롤러 전면 차단 후 llms.txt만 배포 (모순)

---

## 10. 참고 링크

- 프로필: https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md  
- 칼럼: https://github.com/gameworkerkim/vibe-investing/tree/main/02.Investment%20Idea%20Column  
- TechDoc: https://github.com/gameworkerkim/vibe-investing/tree/main/TechDoc  
- 에이전트 친화 가이드: https://github.com/gameworkerkim/vibe-investing/tree/main/TechDoc/agent-friendly-website-guide  
- 레포 `llms.txt`: https://github.com/gameworkerkim/vibe-investing/blob/main/llms.txt  
- llms.txt 표준: https://llmstxt.org  
- Pages: https://vibequant-web.pages.dev/  
- 배포 가이드: [cloudflare/DEPLOY_KR.md](../cloudflare/DEPLOY_KR.md)  
- 배포 이력: [DEPLOY_HISTORY_KR.md](DEPLOY_HISTORY_KR.md)

---

*문서 버전: 2026-07-22 — SEO + LLM/GEO 구조 반영. 구현은 Phase A부터.*
