# 칼럼 발행 가이드라인 · 템플릿

> **대상:** `02.Investment Idea Column/` 아래 모든 신규 칼럼  
> **사이트:** [vibequant-web.pages.dev/columns](https://vibequant-web.pages.dev/columns/)  
> **원칙:** GitHub MD가 원천 → `build:content` → Cloudflare Pages  
> **이 파일은 사이트의 칼럼 목록에 올라가지 않습니다.**

---

## 1. 왜 frontmatter가 필요한가

추천(featured) · 카드 요약 · SEO · LLM/에이전트 발견은 **본문 추정만으로는 불안정**합니다.  
메타는 MD 상단 YAML에 두고, 빌더가 다음을 **한 소스에서** 채웁니다.

| 필드 | 사용처 |
|------|--------|
| `title` / `description` | `<title>`, meta description, OG, 카드 |
| `abstract` | 본문 상단 요약, `/llms.txt` · llms-full, 인용 |
| `date` | JSON-LD, sitemap `lastmod`, 신선도 |
| `tags` / `keywords` | 검색·그룹·관련글, SEO 보조 |
| `featured` / `featured_rank` | 홈·칼럼 목록 **추천** 섹션 |
| `lang` / `schema_type` | `lang` 속성, BlogPosting JSON-LD |
| `draft` | `true`면 사이트·sitemap 제외 |
| `og_image` | SNS 미리보기 (Facebook / LinkedIn 등) |

**기존 글:** frontmatter 없어도 제목·첫 문단 fallback으로 빌드됩니다.  
**신규 글(자동 배포 예정):** 아래 **필수 필드**를 채우는 것을 권장합니다.

---

## 2. 필수 · 권장 · 선택

### 필수 (신규 칼럼)

| 필드 | 규칙 |
|------|------|
| `title` | 카드·H1과 동일. 60자 전후 권장 |
| `description` | **80–120자**(한글 기준). 문장 중간에서 끊지 말 것 |
| `date` | `YYYY-MM-DD` |
| `draft` | 공개면 `false` |

### 권장 (품질·SEO·AI)

| 필드 | 규칙 |
|------|------|
| `subtitle` | 부제 1줄 (헤더 lede) |
| `abstract` | **2–4문장**. 결론·쟁점 포함. 키워드 나열 금지 |
| `tags` | 3–8개. 폴더명·티커·주제 |
| `keywords` | 검색용 구어·롱테일 2–6개 |
| `lang` | `ko` / `en` / `zh` / `ja` |
| `featured` | 추천이면 `true` |
| `featured_rank` | 작을수록 위 (1 = 최상단) |
| `group` | 아래 그룹 ID. 없으면 폴더 규칙 fallback |

### 선택

| 필드 | 규칙 |
|------|------|
| `title_en` | 영문 제목 (다국어·GEO) |
| `author` | 기본 `김호광 (Dennis Kim)` |
| `canonical` | 보통 빌드가 생성. 커스텀 도메인 시에만 수동 |
| `github` | 보통 빌드가 경로로 생성 |
| `og_image` | `/og/파일명.png` 또는 절대 URL. 1200×630 권장 |
| `schema_type` | 기본 `BlogPosting` |
| `summary_for_ai` | LLM/에이전트용 3–5문장 (abstract와 달라도 됨: 전제·한계·투자 비권유 명시) |
| `robots` | 기본 공개. 특수한 경우만 `noindex` |

---

## 3. 그룹 ID (`group`)

| ID | 표시명 |
|----|--------|
| `ai-llm` | AI · LLM · 빅테크 |
| `elon-spacex` | Elon · SpaceX |
| `crypto-web3` | 크립토 · Web3 |
| `korea-hacking` | 한국 · 해킹 |
| `korea` | 한국 · 코리아 디스카운트 |
| `macro-geo` | 매크로 · 지정학 |
| `quant-strategy` | 퀀트 · 투자 전략 |
| `semi-storage` | 반도체 · 스토리지 |
| `industry` | 산업 · 소비 |
| `other` | 기타 |

---

## 4. 본문 구조 (사람 + 검색 + LLM)

```text
---
(frontmatter)
---

# 제목          ← H1 하나만. frontmatter title 과 맞출 것
## 부제         ← 선택. subtitle 과 동일 권장
날짜 / 저자     ← 한 줄

---

## 첫 섹션      ← 여기서부터 본문 (메타·표만으로 시작하지 말 것)
문단…
```

### 규칙

1. **H1은 하나.** 영문 제목을 넣더라도 두 번째 `#` 남발 금지 (필요 시 frontmatter `title_en`).
2. **요약은 frontmatter.** 본문 맨 위에 `작성일/저자/GitHub` 라벨 나열만 두지 말 것 → 카드·OG가 깨집니다.
3. **abstract ≠ 서론 전체.** 쟁점·결론 힌트 2–4문장.
4. **시맨틱 계층:** `##` / `###` 유지. 표·리스트는 MD 그대로.
5. **숨긴 키워드·키워드 스터핑 금지.**
6. **면책:** 투자 관련이면 말미에 “투자 권유 아님” 한 줄 권장.
7. **이미지:** 가능하면 저장소 또는 CDN 절대 URL. OG는 `og_image`로 지정.

### SEO (사람 검색)

- `description`: 검색 스니펫·SNS 한 줄. **클릭하고 싶게**, 과장·클릭베이트 금지.
- `keywords` / `tags`: 실제 검색어·고유명사 (종목, 사건명, 모델명).
- `date`: 업데이트 시 날짜 갱신 → sitemap·신선도.
- 제목에 핵심 고유명사 1개 이상 (예: Kimi K3, 국립외교원).

### GEO / AI · LLM 발견

- `abstract` 또는 `summary_for_ai`: 모델이 **인용·요약**하기 좋은 완결 문장.
- 본문 상단(첫 섹션)에서도 주장이 드러나게 — JS 없이 HTML만으로도 이해 가능해야 함.
- 사실과 의견을 구분 (`주장`, `보도`, `추정` 표기 권장).
- 사이트 전역 `/llms.txt`는 빌드가 카탈로그에서 생성. 개별 글은 **좋은 abstract**가 기여합니다.

---

## 4-1. HEAD · JSON-LD 는 “주석 참조”로만 (직접 쓰지 말 것)

`<title>`·meta description·`robots`·JSON-LD(BlogPosting) 는 **빌드가 frontmatter를 읽어 `<head>`에 자동 주입**합니다. 원천은 오직 위 YAML frontmatter입니다. 따라서 이 값들은 MD에 **live로 넣지 말고, HTML 주석 참조 블록**으로만 둡니다.

**왜 주석인가**

- **frontmatter를 주석으로 감싸면 안 됨:** 빌드(`stripFrontmatter`)는 파일이 `---`로 **시작**해야 메타를 읽습니다. `<!-- -->`로 감싸는 순간 title·description·date가 통째로 무시됩니다.
- **본문에 live `<script type="application/ld+json">` 넣지 말 것:** sanitize로 제거되거나, 빌드 자동 JSON-LD와 **중복**됩니다.
- **주석 참조 블록의 목적:** ①빌드가 `<head>`에 무엇을 넣는지 눈으로 확인, ②GitHub 원문(raw) 뷰를 깔끔하게 유지, ③값 수정 위치를 frontmatter 한 곳으로 고정.

**규칙**

1. `title` → `robots` 범위의 head 메타와 JSON-LD 스크립트는 **HTML 주석(`<!-- -->`) 안에** 참조로만 둔다.
2. **주석을 풀어 live로 만들지 않는다.** 값 변경은 오직 frontmatter에서.
3. JSON-LD의 `headline`·`author`·`datePublished`·`keywords`는 frontmatter의 `title`·`author`·`date`·`keywords`와 **일치**시킨다(빌드 자동 생성 결과와 동일해야 혼선이 없음).
4. `schema_type`가 `TechArticle`인 섹션(TechDoc/CTI)은 JSON-LD `@type`도 그에 맞춘다.

**주석 참조 블록 예시** (템플릿 frontmatter 바로 아래에 위치):

```html
<!--
  HEAD 참조 (렌더링 안 됨 · 빌드 자동 주입 · 값 원천은 frontmatter)
  <title>여기에 제목 · VibeQuant</title>
  <meta name="description" content="80–120자 한줄 요약">
  <meta name="robots" content="index,follow">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "여기에 제목",
    "author": { "@type": "Person", "name": "김호광 (Dennis Kim)" },
    "datePublished": "2026-07-23",
    "keywords": ["검색용 키워드1", "검색용 키워드2"]
  }
  </script>
-->
```

---

## 5. 추천(featured) 운영

```yaml
featured: true
featured_rank: 1    # 1이 가장 위. 동점이면 date 최신 우선(빌드 정책)
```

- 상시 추천은 **소수(대략 8–14개)** 유지.
- 신규 이슈성 글은 `featured_rank: 1`로 올린 뒤, 한동안 지나면 숫자만 조정.
- `featured: false` 또는 필드 생략 = 일반 목록만.

---

## 6. draft · 제외

```yaml
draft: true   # 사이트·sitemap·llms 목록에서 제외
```

빌드가 기본적으로 건너뛰는 파일명: `README.md`, `llms.txt`, `IdeaNote.md`, `description.md`, `COLUMN_GUIDELINE.md`, `COLUMN_TEMPLATE.md`, `_`로 시작하는 MD.

---

## 7. 체크리스트 (커밋 전)

- [ ] frontmatter 필수 4개 (`title`, `description`, `date`, `draft`)
- [ ] `description` 120자 내, 문장 완결
- [ ] H1 = `title`, 본문이 메타 라벨로 시작하지 않음
- [ ] HEAD·JSON-LD는 **주석 참조만** (live `<script>`·주석 처리된 frontmatter 없음)
- [ ] 추천 시 `featured` + `featured_rank`
- [ ] 투자 칼럼이면 면책 한 줄
- [ ] (선택) `abstract` / `summary_for_ai` / `og_image`

---

## 8. 복사해서 쓰는 템플릿

새 폴더에 `제목.md`를 만들 때 아래를 그대로 복사한 뒤 채우세요.

````markdown
---
title: "여기에 제목"
title_en: ""
subtitle: "부제 한 줄 (없으면 삭제)"
description: "80–120자. 카드·Google·OG용 한줄 요약. 문장으로 끝낼 것."
abstract: |
  2–4문장. 쟁점과 결론 힌트.
  llms·인용·본문 상단 요약에 사용.
summary_for_ai: |
  (선택) 에이전트용. 전제·데이터 기준일·한계·투자 비권유를 명시해도 됨.
date: 2026-07-22
updated: 2026-07-22
author: "김호광 (Dennis Kim)"
lang: ko
tags:
  - 예시태그
  - LLM
keywords:
  - "검색용 키워드1"
  - "검색용 키워드2"
group: ai-llm
featured: false
featured_rank: 99
schema_type: BlogPosting
draft: false
og_image: ""
robots: index,follow
---

<!--
  HEAD 참조 (렌더링 안 됨 · 빌드 자동 주입 · 주석 풀지 말 것)
  값 원천은 위 frontmatter. 아래는 빌드가 <head>에 넣는 결과 확인용.
  <title>여기에 제목 · VibeQuant</title>
  <meta name="description" content="80–120자 한줄 요약">
  <meta name="robots" content="index,follow">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "여기에 제목",
    "author": { "@type": "Person", "name": "김호광 (Dennis Kim)" },
    "datePublished": "2026-07-23",
    "keywords": ["검색용 키워드1", "검색용 키워드2"]
  }
  </script>
-->

# 여기에 제목

## 부제 한 줄 (없으면 이 줄 삭제)

2026.07.23 김호광 / Dennis Kim

---

## 1. 도입

본문은 여기서부터. 첫 문단은 독자와 모델 모두가 맥락을 잡도록 완결된 문장으로 시작하세요.

## 2. 본론

…

## 3. 정리

…

---

*본 글은 정보 제공 목적이며 투자 권유가 아닙니다.*
````

---

## 9. 관련 경로

| 항목 | 경로 |
|------|------|
| 칼럼 원문 루트 | `02.Investment Idea Column/` |
| TechDoc | `TechDoc/` (별도 가이드 예정 시 동일 스키마) |
| 빌드 | `VibeQuant/content/build.mjs` |
| 그룹·추천(레거시 경로 리스트) | `VibeQuant/content/groups.mjs` → frontmatter로 이전 예정 |
| 사이트 계획 | `VibeQuant/docs/CONTENT_SITE_PLAN_KR.md` |

---

*문서 버전: 2026-07-23 — HEAD·JSON-LD를 “주석 참조” 규칙으로 추가(§4-1). frontmatter가 유일한 원천, 빌드가 head·JSON-LD 자동 주입.*
