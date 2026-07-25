---
title: "에이전트 친화적인 웹사이트 구축을 위한 실무 기술 가이드"
title_en: "Agent-Friendly Website Construction: A Practical Technical Guide"
description: "AI 에이전트 시대의 웹 UX·접근성·구조화 표준을 통합한 실무 가이드. Google web.dev, Chrome WebMCP, llms.txt 표준 기반."
slug: agent-friendly-website-guide
language: ko
languages_available: [ko, en, ja, zh]
canonical: https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/agent-friendly-website-guide/agent-friendly-website-guide.ko.md
version: "1.0"
date_published: 2026-05-19
last_updated: 2026-05-19
author:
  name: "Dennis Kim (김호광 / HoKwang Kim)"
  role: "Betalabs CEO · Cyworld Z 前 CEO · Microsoft Azure MVP"
  github: gameworkerkim
  publication: Web3Paper
license: CC-BY-4.0
schema_type: TechArticle
keywords:
  - AI 에이전트
  - 에이전트 친화 웹사이트
  - llms.txt
  - WebMCP
  - 시맨틱 HTML
  - 접근성 트리
  - Schema.org
  - JSON-LD
  - GEO
  - Generative Engine Optimization
  - Core Web Vitals
  - Model Context Protocol
  - MCP
  - 웹 표준
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
  - 프론트엔드 개발자
  - 테크니컬 라이터
  - DevRel · 개발자 마케팅
  - 프로덕트 매니저
  - SEO/GEO 담당자
  - CTO · 개발 리드
sources:
  - title: "상담사 친화적인 웹사이트 구축"
    authors: ["Kasper Kulikowski", "Omkar More"]
    publisher: "Google web.dev"
    date: 2026-04-01
    url: https://web.dev/articles/ai-agent-site-ux
  - title: "에이전트 소개"
    authors: ["Alexandra Klepper", "Kasper Kulikowski", "Rachel Lee Nabors"]
    publisher: "Google web.dev"
    date: 2025-02-25
    url: https://web.dev/articles/ai-agents
  - title: "WebMCP를 사전 체험판으로 이용할 수 있습니다"
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

# 에이전트 친화적인 웹사이트 구축을 위한 실무 기술 가이드

> AI 에이전트가 사용자를 대신해 웹사이트를 탐색·요약·결제하는 시대가 도래했습니다. 이 가이드는 Google web.dev(2026-04-01), Chrome WebMCP EPP(2026-02-10), Jeremy Howard의 llms.txt 표준을 통합해, 에이전트가 우리 사이트를 정확히 이해하고 작업을 완수할 수 있도록 만드는 11장+부록 분량의 실무 매뉴얼입니다.

🌐 **다른 언어** — [English](./agent-friendly-website-guide.en.md) · [日本語](./agent-friendly-website-guide.ja.md) · [中文](./agent-friendly-website-guide.zh.md)

📌 **태그** — `#AI에이전트` `#WebMCP` `#llms-txt` `#시맨틱HTML` `#접근성` `#Schema.org` `#GEO` `#CoreWebVitals` `#MCP`

---

## 한눈에 보기 (TL;DR)

- **누가 읽어야 하나**: 프론트엔드 개발자, 테크니컬 라이터, DevRel, PM, SEO/GEO 담당자, CTO
- **무엇을 얻나**: 에이전트가 사이트를 인식하는 3가지 방식, Google 7대 원칙, 시맨틱 HTML·ARIA·Schema.org 코드 예제, llms.txt 표준 구조, WebMCP 도입 전략, 4단계 도입 로드맵
- **왜 지금**: Pew Research(2024)에 따르면 Google 사용자가 AI 요약을 본 경우 검색 결과 링크 클릭률이 절반으로 감소. 트래픽의 절반이 \"에이전트가 내 사이트를 이해하는가\"에 달려 있음
- **읽는 데 걸리는 시간**: 약 35분 · 적용 시작은 1~2주

---

## 목차

1. [새로운 방문자: AI 에이전트의 부상](#1-새로운-방문자-ai-에이전트의-부상)
2. [에이전트는 웹사이트를 어떻게 보는가](#2-에이전트는-웹사이트를-어떻게-보는가)
3. [Google의 7대 에이전트 친화 원칙](#3-google의-7대-에이전트-친화-원칙)
4. [시맨틱 HTML과 접근성 트리 실전 가이드](#4-시맨틱-html과-접근성-트리-실전-가이드)
5. [레이아웃 안정성과 시각적 신호](#5-레이아웃-안정성과-시각적-신호)
6. [구조화 데이터: Schema.org와 JSON-LD](#6-구조화-데이터-schemaorg와-json-ld)
7. [AI 진입점 표준 — llms.txt](#7-ai-진입점-표준--llmstxt)
8. [WebMCP — 차세대 에이전트 인터페이스](#8-webmcp--차세대-에이전트-인터페이스)
9. [에이전트 친화 모범 사례 사이트 분석](#9-에이전트-친화-모범-사례-사이트-분석)
10. [에이전트 친화도 감사 체크리스트](#10-에이전트-친화도-감사-체크리스트)
11. [단계별 도입 로드맵](#11-단계별-도입-로드맵)
- [부록 A. 용어집](#부록-a-용어집)
- [부록 B. 참고 문헌 및 출처](#부록-b-참고-문헌-및-출처)

---

## 1. 새로운 방문자: AI 에이전트의 부상

### 1.1 \"에이전트\"란 무엇인가

Google web.dev의 정의에 따르면 에이전트는 \"입력을 수신·해석하고, 사용자(사람 또는 다른 에이전트)를 대신해 계획을 세우고 작업을 실행하는 시스템\"입니다. 에이전트는 단일 LLM이 아니라 **모델·규칙·메모리·도구**가 결합된 통합 유닛입니다.

#### 에이전트를 정의하는 4가지 특성

- **자율(Autonomous)**: 직접적인 인간 개입 없이 작동 가능
- **상호작용(Interactive)**: 다른 에이전트 및 인간과 대화 가능
- **반응형(Reactive)**: 환경 변화를 인식하고 응답
- **능동적(Proactive)**: 주어진 목표를 달성하기 위해 주도적으로 행동

#### 에이전트의 4단계 작업 프로세스

1. **쿼리 수신** — 사용자의 자연어 요청 또는 다른 에이전트의 요청을 받음
2. **계획 수립** — 요청을 해결할 단계별 플랜을 LLM으로 생성
3. **계획 실행** — 도구(API, 브라우저, MCP 서버 등)를 호출해 실제 작업 수행
4. **학습 저장** — 결과와 컨텍스트를 단기·장기 메모리에 기록

### 1.2 인간·크롤러·에이전트의 차이

같은 웹사이트를 방문해도 세 종류의 방문자는 전혀 다른 방식으로 작동합니다.

| 방문자 유형 | 행동 패턴 | 의도 | 최적화 포인트 |
|---|---|---|---|
| 인간 사용자 | 시각·감성·맥락 기반 탐색 | 구매·정보·즐거움 | 디자인, 카피, 성능, 접근성 |
| 검색 크롤러 | 링크 그래프 수집 | 인덱싱·랭킹 | robots.txt, sitemap.xml, 메타데이터 |
| 학습 크롤러 (Common Crawl 등) | 대규모 텍스트 수집 | LLM 학습 데이터 | robots.txt, AI 학습 거부 정책 |
| **AI 에이전트(대리인)** | **목표 지향적 액션 수행** | **사용자 작업 완수(구매, 예약, 양식)** | **시맨틱 HTML, 접근성 트리, WebMCP, llms.txt** |

> 💡 **핵심 차이**: 크롤러는 \"읽기\"만 하지만, 에이전트는 \"읽기 + 클릭 + 입력 + 결제\"까지 수행합니다. 이 때문에 에이전트는 보안·동의·시각적 안정성 측면에서 훨씬 더 까다로운 요구사항을 갖습니다.

### 1.3 데이터 소유 관계로 본 에이전트의 3가지 유형

- **제로 파티 에이전트 (Zero-party)** — 브라우저 안에서 로컬 데이터만 사용 (예: Chrome 내장 Gemini Nano). 개인정보 보호 측면에서 가장 안전.
- **퍼스트 파티 에이전트 (First-party)** — 서비스 운영 주체가 직접 자기 데이터로 만든 에이전트 (예: Google이 운영하는 Google 지도 안의 여행 플래너). 신뢰도·통제력 최대.
- **서드 파티 에이전트 (Third-party)** — 외부 개발자가 만든 에이전트가 우리 사이트를 데이터 소스로 사용 (예: 사용자의 ChatGPT가 우리 쇼핑몰에서 주문). 우리 사이트는 \"에이전트의 서드 파티 정보 제공업체\"가 됨.

> 📌 **실무 시사점**: 한국의 전자상거래·여행·핀테크 사이트는 대부분 \"서드 파티 에이전트의 정보 제공업체\" 위치에 놓이게 됩니다. PG·인증·약관 동의 흐름을 에이전트가 처리할 수 있도록 명시적인 확인 단계(Human-in-the-loop)를 설계해야 합니다.

---

## 2. 에이전트는 웹사이트를 어떻게 보는가

에이전트는 모니터로 웹사이트를 \"보지\" 않습니다. 사이트의 **머신 리더블 표현(machine-readable representation)** 에서 작동합니다. 이 표현의 품질이 곧 에이전트 성능을 결정하며, Google은 3가지 기본 모달리티를 정의합니다.

### 2.1 모달리티 1: 스크린샷(시각 분석)

에이전트가 렌더링된 페이지를 캡처해 비전 모델로 분석하는 방식입니다. 오른쪽 상단의 돋보기 아이콘은 검색창, 페이지 중앙의 큰 박스는 입력 폼이라는 식으로 시각 신호를 해석합니다. 큰 \"삭제\" 버튼이 작은 \"도움말\" 링크보다 더 무겁게 다뤄지는 등, **색상·크기·근접성이 중요도를 결정**합니다.

- **장점**: CSS·JS로 완전히 렌더된 최종 화면을 보므로 시각 디자인 신호 그대로 사용 가능
- **단점**: 토큰 비용이 매우 크고 느림. 보통은 DOM·접근성 트리가 흐트러졌을 때의 백업 수단으로 활용

### 2.2 모달리티 2: HTML / DOM

에이전트가 DOM 트리를 직접 파싱해 요소 간 관계와 계층 구조를 읽는 방식입니다. \"지금 구매\" 버튼이 어떤 상품 컨테이너 *내부*에 있다면, 에이전트는 그 버튼이 *그 상품*에 속한다고 추론합니다. 따라서 DOM의 중첩 구조와 클래스·ID 명명이 의미를 가져야 합니다.

### 2.3 모달리티 3: 접근성 트리(Accessibility Tree)

접근성 트리는 브라우저가 기본 제공하는 API로, DOM에서 가장 중요한 **\"대화형 요소들의 역할(role)·이름(name)·상태(state)\"** 만 추려낸 시맨틱 요약본입니다. 원래는 스크린 리더 같은 보조 기술을 위해 만들어졌지만, AI 에이전트에게는 CSS의 시각적 노이즈를 모두 걷어낸 **\"고품질 지도\"** 역할을 합니다.

> 🔍 **직접 확인하는 법**: Chrome DevTools → Elements → 우측 \"Accessibility\" 패널 → \"Full-page accessibility tree\" 활성화. 여기서 \"button\", \"link\", \"textbox\" 등의 역할 라벨이 누락된 곳이 곧 에이전트가 실패할 지점입니다.

### 2.4 결합된 모달리티(Combined Modalities)

최신 에이전트(ChatGPT Agent, Claude for Chrome, Gemini in Chrome 등)는 단일 입력에 의존하지 않습니다. DOM·접근성 트리로 대화형 요소의 구조화 리스트를 얻고, 스크린샷으로 시각적 위치와 그룹화를 교차 검증합니다.

> 🎯 **개발자의 역할**: 스크린샷·DOM·접근성 트리 — 이 3개 채널 모두에서 깔끔한 신호를 일관되게 제공하는 것입니다. 어느 한 채널만 좋아서는 안 되며, 셋이 서로를 보강할 때 에이전트는 가장 안정적으로 동작합니다.

---

## 3. Google의 7대 에이전트 친화 원칙

Google web.dev가 제시한 에이전트 친화적 사이트 구축의 7가지 권장사항을, 코드 예제와 함께 상세히 풀어봅니다. **이 모든 원칙은 동시에 인간 사용자의 접근성·UX도 개선합니다.**

### 원칙 1. 모든 필수 작업은 인터페이스에 명확히 반영하라

키보드 단축키나 마우스 우클릭 메뉴로만 접근 가능한 기능은 에이전트가 발견할 수 없습니다.

- ❌ **나쁜 예**: \"Ctrl+Shift+D\"를 눌러야만 다운로드 메뉴가 나오는 SaaS 대시보드
- ✅ **좋은 예**: 툴바에 명시적인 [다운로드] 버튼이 있고, 단축키는 보조 수단

### 원칙 2. 안정적인 레이아웃을 보장하라

에이전트가 스크린샷을 찍는다면 페이지가 매번 다른 모습이면 혼란스러워집니다. \"장바구니에 추가\" 버튼이 카테고리마다 다른 위치에 있다면 에이전트는 카테고리마다 학습을 다시 해야 합니다.

**실무 권장 사항**:
- 템플릿 레벨에서 \"주요 CTA의 위치\"를 표준화
- CLS(Cumulative Layout Shift)를 0.1 이하로 유지 (Core Web Vitals)
- Skeleton UI를 사용해 로드 중에도 최종 레이아웃의 형태를 유지
- 동적으로 위치를 바꾸는 \"통통 튀는\" 광고 배너 회피

### 원칙 3. \"고스트 요소\"와 투명 오버레이를 피하라

투명한 div가 진짜 버튼을 덮고 있는 경우, 에이전트의 시각 분석은 \"덮여 있는 노드\"를 무시할 수 있습니다.

```css
/* ❌ 나쁜 예: 보이지 않는 div가 버튼 위를 덮음 */
.overlay-trap {
  position: absolute;
  inset: 0;
  background: transparent;
  z-index: 9999;  /* 진짜 버튼을 가려버림 */
}

/* ✅ 좋은 예: pointer-events 명시 + 의미 있는 z-index */
.overlay-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;  /* 클릭이 아래로 통과 */
  z-index: 1;
}
```

### 원칙 4. 시맨틱 HTML로 실행 가능한 요소를 디자인하라

div와 span을 버튼처럼 꾸미지 말고, `<button>`과 `<a>` 태그를 직접 사용하세요. 에이전트는 이 두 태그를 무조건 대화형으로 인식합니다.

```html
<!-- ❌ 나쁜 예: div 버튼 -->
<div class="btn-primary" onclick="submit()">
  주문하기
</div>

<!-- ⚠️ 차선책: 시맨틱이 불가능할 때 ARIA로 보강 -->
<div role="button" tabindex="0"
     aria-label="주문하기"
     onclick="submit()"
     onkeydown="if(event.key==='Enter')submit()">
  주문하기
</div>

<!-- ✅ 좋은 예: 진짜 button -->
<button type="submit" class="btn-primary">
  주문하기
</button>
```

### 원칙 5. CSS에 `cursor: pointer`를 설정하라

마우스 커서가 손가락 모양으로 바뀌는 것은 에이전트의 비전 모델에게도 \"여기는 클릭 가능\"이라는 강력한 신호입니다.

```css
.product-card { cursor: pointer; }
.disabled-button { cursor: not-allowed; }
```

### 원칙 6. `<label>`의 `for` 속성으로 입력 필드를 연결하라

`placeholder`만으로는 부족합니다 — placeholder는 입력 시작 시 사라지고, 접근성 트리에 포함되지도 않습니다.

```html
<!-- ❌ 나쁜 예: placeholder만 사용 -->
<input type="email" placeholder="이메일을 입력하세요" />

<!-- ✅ 좋은 예: label과 for/id 연결 -->
<label for="user-email">이메일 주소</label>
<input type="email"
       id="user-email"
       name="email"
       autocomplete="email"
       required
       placeholder="name@example.com" />

<!-- ✅ 더 좋은 예: 시각적으로 라벨을 숨기되 접근성 트리엔 노출 -->
<label for="search" class="sr-only">사이트 검색</label>
<input type="search" id="search" name="q" />
```

### 원칙 7. 대화형 요소는 8제곱픽셀보다 커야 한다

8픽셀 × 8픽셀(=64제곱픽셀) 미만의 요소는 에이전트의 시각 분석이 \"노이즈\"로 필터링해 버릴 수 있습니다.

- 주요 CTA 버튼: 최소 44px × 44px (Apple HIG)
- 폼 필드 높이: 최소 40px
- 아이콘 버튼: 시각적으로는 24px여도 padding으로 hit area를 44px 이상 확보
- 닫기(X) 버튼: 작아 보이고 싶어도 클릭 영역만큼은 충분히

---

## 4. 시맨틱 HTML과 접근성 트리 실전 가이드

### 4.1 \"div 수프\"에서 \"시맨틱 랜드마크\"로

한국의 많은 사이트는 여전히 React/Vue 컴포넌트를 모두 div로 감싸는 \"div 수프\" 상태입니다. 이 상태에서 접근성 트리는 거의 평면적이고, 에이전트는 페이지의 \"지도\"를 그릴 수 없습니다.

| 시맨틱 태그 | 접근성 트리 역할 | 에이전트 활용 |
|---|---|---|
| `<header>` | banner | 사이트 식별, 로고/네비게이션 인식 |
| `<nav>` | navigation | 주요 메뉴 자동 발견 |
| `<main>` | main | 본문 컨텐츠 영역 파악 |
| `<article>` | article | 독립 콘텐츠 단위(블로그 글 등) 인식 |
| `<aside>` | complementary | 보조 정보 영역 구분 |
| `<footer>` | contentinfo | 사이트 정보·약관 위치 파악 |
| `<section>` | region (aria-label 필요) | 주제별 그룹화 |
| `<button>` | button | 클릭 가능한 액션 즉시 인식 |
| `<a href>` | link | 내비게이션 대상 인식 |
| `<input>` | textbox / checkbox / radio 등 | 폼 필드 자동 매핑 |

### 4.2 페이지 골격의 모범 예시

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>제품 상세 - Acme</title>
  <link rel="alternate" type="text/markdown"
        href="/products/widget-pro.md" />  <!-- llms.txt 호환 -->
</head>
<body>
  <header>
    <a href="/" aria-label="홈으로">
      <img src="/logo.svg" alt="Acme" />
    </a>
    <nav aria-label="주요 메뉴">
      <ul>
        <li><a href="/products">제품</a></li>
        <li><a href="/pricing">가격</a></li>
        <li><a href="/docs">문서</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <h1>Widget Pro</h1>
      <section aria-labelledby="specs">
        <h2 id="specs">사양</h2>
        <!-- ... -->
      </section>
      <button type="button" data-action="add-to-cart">
        장바구니에 담기
      </button>
    </article>
  </main>

  <footer>
    <p>© 2026 Acme</p>
  </footer>
</body>
</html>
```

### 4.3 ARIA: 시맨틱을 보강하는 4가지 핵심 속성

#### `aria-label` / `aria-labelledby`

요소에 \"이름\"을 부여합니다. 아이콘 버튼처럼 텍스트가 없는 경우 필수입니다.

```html
<!-- 아이콘만 있는 닫기 버튼 -->
<button aria-label="창 닫기">
  <svg><!-- X icon --></svg>
</button>

<!-- 다른 요소의 텍스트를 라벨로 -->
<section aria-labelledby="pricing-title">
  <h2 id="pricing-title">요금제</h2>
</section>
```

#### `aria-describedby`

추가 설명을 연결합니다. 폼 필드의 도움말, 에러 메시지에 자주 사용됩니다.

```html
<label for="pwd">비밀번호</label>
<input id="pwd" type="password"
       aria-describedby="pwd-help pwd-error" />
<p id="pwd-help">8자 이상, 영문·숫자·특수문자 포함</p>
<p id="pwd-error" role="alert">비밀번호가 너무 짧습니다</p>
```

#### `aria-expanded`, `aria-controls`

드롭다운·아코디언·모달의 상태와 제어 관계를 표현합니다. 에이전트가 \"지금 열려 있는지/닫혀 있는지\" 알 수 있게 합니다.

```html
<button aria-expanded="false" aria-controls="faq-1">
  배송은 얼마나 걸리나요?
</button>
<div id="faq-1" hidden>
  영업일 기준 2~3일이 소요됩니다.
</div>
```

#### `role`

시맨틱 태그를 쓸 수 없을 때 역할을 명시. `tabindex="0"`과 키보드 이벤트 핸들러를 함께 제공해야 완전한 \"버튼\"이 됩니다.

```html
<div role="button" tabindex="0"
     aria-label="테마 변경"
     onclick="toggleTheme()"
     onkeydown="if(['Enter',' '].includes(event.key))toggleTheme()">
  🌙
</div>
```

> 📐 **ARIA의 제1법칙**: \"가능하면 ARIA를 쓰지 말고 시맨틱 HTML을 써라.\" ARIA는 시맨틱 HTML로 표현 불가능한 패턴(탭, 트리뷰, 콤보박스 등)에서만 사용해야 합니다. 잘못 쓴 ARIA는 안 쓴 것보다 나쁩니다.

---

## 5. 레이아웃 안정성과 시각적 신호

### 5.1 Core Web Vitals와 에이전트

| 지표 | 의미 | 에이전트 관점에서의 영향 |
|---|---|---|
| **LCP** | 최대 콘텐츠풀 페인트 (< 2.5s 목표) | 에이전트가 페이지 \"준비됨\"으로 판단하는 시점 |
| **INP** | 다음 페인트까지의 상호작용 (< 200ms) | 에이전트의 클릭 후 응답성 — 타임아웃 회피 |
| **CLS** | 누적 레이아웃 시프트 (< 0.1) | 스크린샷·좌표 기반 클릭의 정확도 결정 |

### 5.2 \"투명 오버레이 트랩\"의 4가지 패턴

UX QA 체크리스트에 반드시 포함하세요.

1. **쿠키 동의 배너** — 페이지 로드 직후 화면 전체를 덮어 에이전트가 본문에 도달하지 못함
2. **뉴스레터 모달** — 3초 후 자동 등장. 닫기 버튼이 너무 작거나 ESC가 동작하지 않음
3. **플로팅 챗봇** — 우측 하단 CTA 버튼을 가림. 에이전트가 \"구매하기\" 클릭에 실패
4. **z-index가 잘못된 헤더** — 스크롤 시 컨텐츠를 가려 좌표 기반 클릭이 빗나감

> ✅ **권장 대응**: 쿠키 동의는 시맨틱 `<dialog>`에 `role="dialog"`, `aria-modal="true"`를 명시하고, 기본 포커스를 \"수락\" 또는 \"거부\" 버튼에 두세요.

### 5.3 시각적 신호 체크리스트

- [ ] 호버 시 `cursor: pointer` 명시
- [ ] 포커스 링 절대 제거 금지 (`outline: none` 금지)
- [ ] 주요 CTA는 색·크기·여백으로 시각적 위계 확보
- [ ] 비활성 상태는 `cursor: not-allowed` + `opacity: 0.5`
- [ ] 호버 상태에서 위치·크기가 바뀌지 않도록 `transform: scale` 대신 색상 변화 우선

---

## 6. 구조화 데이터: Schema.org와 JSON-LD

시맨틱 HTML이 \"이 요소가 무엇인지\"를 알려준다면, 구조화 데이터(Structured Data)는 \"이 페이지 전체가 무엇에 관한 것인지\"를 알려줍니다. 에이전트는 Schema.org 어휘로 마킹된 JSON-LD를 **신뢰도 높은 사실 정보(ground truth)** 로 취급합니다.

### 6.1 왜 JSON-LD인가

- **Microdata/RDFa 대비 분리도가 높음**: HTML 마크업을 더럽히지 않고 `<script>` 태그에 격리
- **Google·Bing·LLM이 모두 권장**: Anthropic, OpenAI, Perplexity가 모두 우선 파싱
- **관리 용이**: CMS·정적 사이트 생성기에서 템플릿화하기 쉬움

### 6.2 핵심 스키마 6선

#### Organization — 모든 사이트의 기본

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

#### Product — 전자상거래

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Widget Pro",
  "sku": "WP-2026-001",
  "brand": { "@type": "Brand", "name": "Acme" },
  "description": "고성능 위젯, 한국어 지원",
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

#### FAQPage — 고객 지원 페이지

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "환불 정책은 어떻게 되나요?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "구매 후 14일 이내에 미사용 상태일 경우 전액 환불됩니다."
    }
  }]
}
```

#### BreadcrumbList — 사이트 위계

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1,
      "name": "홈", "item": "https://acme.com/" },
    { "@type": "ListItem", "position": 2,
      "name": "제품", "item": "https://acme.com/products" },
    { "@type": "ListItem", "position": 3,
      "name": "Widget Pro" }
  ]
}
```

#### Article — 블로그·뉴스 / Event — 이벤트·웨비나

두 스키마 모두 `datePublished`, `author`, `location` 같은 필드가 핵심입니다. 자세한 구조는 [schema.org](https://schema.org)의 공식 문서를 참조하세요.

> 🛠 **검증 도구**: [Google Rich Results Test](https://search.google.com/test/rich-results)와 [Schema Markup Validator](https://validator.schema.org)에서 JSON-LD를 검증할 수 있습니다. 배포 전 반드시 통과시키세요.

---

## 7. AI 진입점 표준 — llms.txt

robots.txt가 크롤러를 위한 규약이라면, **llms.txt는 \"추론 시점(inference time)의 LLM 에이전트\"를 위한 진입점 파일**입니다. 2024년 9월 Jeremy Howard(Answer.AI 공동창업자)가 제안했고, 2026년 현재 **Anthropic, Cloudflare, Vercel, Stripe, Perplexity, Maryland.gov** 등이 채택했습니다. WordPress(Yoast 플러그인), Webflow, Mintlify는 네이티브 지원을 제공합니다.

### 7.1 왜 필요한가

LLM은 컨텍스트 윈도우가 제한적이어서 일반적인 HTML 사이트 전체를 한 번에 읽지 못합니다. 광고·내비게이션·JavaScript 렌더링을 거치고 나면 토큰의 절반 이상이 \"노이즈\"에 소비됩니다. llms.txt는 사이트의 핵심 콘텐츠를 마크다운으로 큐레이션된 \"치트시트\"로 제공함으로써 **토큰 사용량을 50~70% 줄입니다**.

### 7.2 두 가지 파일

| 파일 | 역할 | 크기 (대략) |
|---|---|---|
| `/llms.txt` | 사이트 지도 (목차 + 링크) | 1,000~3,000 토큰 |
| `/llms-full.txt` | 전체 콘텐츠를 평면화한 단일 마크다운 | 수만~수십만 토큰 |

Profound의 측정에 따르면 AI 에이전트는 `/llms-full.txt`를 `/llms.txt` 대비 **2배 이상의 빈도로 방문**합니다. 처음에는 `llms.txt`부터 시작하고, 운영 인프라가 준비되면 `llms-full.txt`를 추가하는 것이 일반적입니다.

### 7.3 llms.txt 표준 구조

```markdown
# Acme Web3 Platform

> Acme는 한국·아시아 시장을 위한 블록체인 인프라 운영사입니다.
> 스테이블코인 발행, K팝 티켓팅, NFT 마켓플레이스를 제공합니다.

주요 콘셉트:
- 모든 API는 REST + WebSocket으로 제공
- 인증: API Key 또는 OAuth 2.0
- 한국어/영어/일본어/중국어 4개 언어 지원

## 핵심 문서

- [시작 가이드](https://acme.io/docs/getting-started.md):
  5분 안에 첫 트랜잭션을 실행하는 튜토리얼
- [API 레퍼런스](https://acme.io/docs/api.md):
  모든 엔드포인트, 파라미터, 응답 형식
- [SDK](https://acme.io/docs/sdk.md):
  JavaScript, Python, Go, Java SDK

## 솔루션

- [스테이블코인 (STABLE1)](https://acme.io/products/stable1.md)
- [티켓팅 NFT](https://acme.io/products/ticketing.md)

## Optional

- [회사 소개](https://acme.io/about.md)
- [블로그 (최근 30개)](https://acme.io/blog/feed.md)
```

#### 구조 규칙

1. 첫 줄에 `# H1` (사이트 이름) — **필수**
2. `>` 인용구로 1~3문장 요약 — **강력 권장**. LLM의 \"사이트 멘탈 모델\"이 됨
3. 일반 마크다운 단락으로 핵심 컨텍스트 — 권장
4. `## H2` 섹션으로 페이지 그룹화 (예: 핵심 문서, 솔루션, 정책)
5. 각 항목은 `[제목](URL.md): 1문장 설명` 형식
6. `## Optional` 섹션은 \"있어도 좋고 없어도 되는\" 자료 — LLM이 우선순위 낮춤

### 7.4 페이지별 .md 변환

llms.txt가 \"지도\"라면 페이지별 .md 파일이 \"영토\"입니다. 같은 URL을 .md 확장자로 요청했을 때 깨끗한 마크다운으로 응답하도록 서버를 설정하세요.

```http
# 패턴 1: 확장자 분기
GET /products/widget-pro      → HTML (사람용)
GET /products/widget-pro.md   → Markdown (LLM용)

# 패턴 2: Content-Type 협상
GET /products/widget-pro
Accept: text/markdown          → Markdown 응답
Accept: text/html              → HTML 응답
```

각 페이지 HTML의 `<head>`에는 다음과 같이 마크다운 대안을 명시하는 것이 좋습니다.

```html
<link rel="alternate"
      type="text/markdown"
      href="https://acme.io/products/widget-pro.md" />
```

### 7.5 운영상의 주의

> ⚠️ **가장 흔한 실패 패턴**: llms.txt를 한 번 만들고 갱신하지 않는 것. **오래된 인덱스는 없는 것보다 나쁩니다** — 에이전트에게 잘못된 정보를 적극적으로 제공하기 때문입니다. 사이트맵 빌드 파이프라인에 llms.txt 재생성을 통합하고, 주요 출시 시 즉시 반영되도록 자동화하세요.

### 7.6 robots.txt와의 관계

robots.txt는 \"어디는 가지 마라\"고 말하고, llms.txt는 \"이것이 중요하다\"고 말합니다. **서로 보완 관계이며 충돌하지 않습니다**. AI 학습 거부 정책은 robots.txt와 별도의 `ai.txt` 또는 IETF AI Preferences Working Group이 마련 중인 표준을 따르세요.

---

## 8. WebMCP — 차세대 에이전트 인터페이스

**WebMCP는 Chrome 팀이 2026년 2월 사전 체험 프로그램(Early Preview Program)으로 공개한 제안 표준**입니다. 현재의 \"DOM을 스크린샷·접근성 트리로 추론하는 방식\"은 강건하지만 느립니다. WebMCP는 웹사이트가 에이전트에게 직접 \"구조화된 도구(Tool)\"를 노출하는 채널을 제공해, 모호성을 없애고 작업 속도와 신뢰도를 크게 끌어올립니다.

### 8.1 두 가지 API

#### 선언적 API — HTML 폼에서 직접

표준화된 작업은 HTML만으로 선언할 수 있습니다.

```html
<!-- 개념적 예시 (정확한 문법은 EPP 문서 참조) -->
<form data-mcp-tool="searchProducts"
      data-mcp-description="카탈로그에서 제품 검색">
  <label for="q">검색어</label>
  <input id="q" name="query"
         data-mcp-param="query"
         data-mcp-type="string"
         required />
  <label for="price">최대 가격(원)</label>
  <input id="price" name="max_price"
         data-mcp-param="max_price"
         data-mcp-type="number" />
  <button type="submit">검색</button>
</form>
```

#### 명령형 API — JavaScript로 동적 도구 등록

복잡한 흐름(다단계 결제, 실시간 견적 등)은 JavaScript로 도구를 등록합니다.

```javascript
// 개념적 의사 코드
navigator.mcp?.registerTool({
  name: 'createSupportTicket',
  description: '기술 지원 티켓을 생성합니다',
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

### 8.2 대표 사용 사례

- **고객 지원**: 에이전트가 사용자의 시스템 환경(OS·브라우저·앱 버전)을 자동으로 채워 정확한 지원 티켓 생성
- **전자상거래**: 에이전트가 상품 검색·옵션 선택·결제 흐름을 정확히 탐색
- **여행**: 구조화된 검색·필터·예약. 항공편 예약처럼 다단계가 필요한 작업에 강점
- **핀테크/Web3**: 지갑 연결, 트랜잭션 서명 같은 보안 민감 작업의 의도를 명시적으로 표현

### 8.3 사전 체험 프로그램(EPP) 참여

Chrome WebMCP EPP는 [developer.chrome.com/docs/ai/join-epp](https://developer.chrome.com/docs/ai/join-epp)에서 가입할 수 있습니다.

> 🚀 **도입 전략**: 지금 당장 모든 페이지에 WebMCP를 적용할 필요는 없습니다. 가장 가치 높은 \"에이전트가 수행해 줬으면 하는 핵심 작업 3~5개\"를 먼저 식별하세요(예: 상품 검색, 결제, 지원 티켓 생성). 이 작업들에 대해 PoC를 진행하고, 표준이 안정화되면 전사로 확장합니다.

---

## 9. 에이전트 친화 모범 사례 사이트 분석

### 9.1 Anthropic Docs

- **URL**: [docs.anthropic.com](https://docs.anthropic.com) · **llms.txt**: [docs.anthropic.com/llms.txt](https://docs.anthropic.com/llms.txt)
- Mintlify로 호스팅되어 모든 문서에 .md 변환이 자동 제공됨
- llms.txt와 llms-full.txt 모두 제공
- 코드 블록에 명확한 언어 태그와 복사 버튼
- 좌측 트리 내비게이션이 시맨틱 `<nav>`로 마크업됨
- MCP 서버(mcpdoc)로도 동일한 콘텐츠를 IDE에 노출

### 9.2 Vercel

- **URL**: [vercel.com](https://vercel.com) · **llms.txt**: [vercel.com/docs/llms.txt](https://vercel.com/docs/llms.txt)
- API 엔드포인트별로 컨텍스트 설명이 풍부 — 에이전트의 도구 선택 정확도 ↑
- 문서 URL에 .md를 붙이면 마크다운으로 응답
- CTA 버튼이 모든 페이지에서 동일한 위치 — 레이아웃 안정성

### 9.3 Cloudflare Developers

- **URL**: [developers.cloudflare.com](https://developers.cloudflare.com) · **llms.txt**: [developers.cloudflare.com/llms.txt](https://developers.cloudflare.com/llms.txt)
- llms.txt + llms-full.txt 동시 제공
- 제품별 그룹화가 `## H2` 섹션으로 명확히 분리됨
- Workers 코드 샘플은 실행 가능한 Playground URL 동봉

### 9.4 Stripe Docs

- **URL**: [docs.stripe.com](https://docs.stripe.com)
- Stripe Workbench로 LLM이 실제 API 호출을 시뮬레이션 가능
- 페이지마다 \"API 객체 스키마\"가 JSON-LD로 마킹됨
- Idempotency Key, 에러 코드 같은 \"에이전트 신뢰성에 결정적인 정보\"를 헤더 수준에서 노출

### 9.5 Maryland.gov — 공공 부문 사례

- **URL**: [maryland.gov](https://www.maryland.gov) · **llms.txt**: [maryland.gov/llms.txt](https://www.maryland.gov/llms.txt)
- \"법적·정책적·자격 판단에는 사용하지 말 것\"이라는 사용 정책을 llms.txt에 명시
- 접근성 정책, 연락처, 업데이트 주기 명시
- 공공 사이트가 llms.txt로 \"AI에 대한 사용 가이드\"를 제공한 첫 모범 사례

### 9.6 Mintlify 호스팅 사이트군

[Mintlify](https://mintlify.com)는 호스팅하는 모든 문서 사이트에 llms.txt + MCP 서버를 자동 제공합니다. Cursor, Bolt.new, Resend, Octokit 등 수천 개 문서 사이트가 이 표준의 직접 수혜자입니다. 내부 문서 사이트에 빠르게 적용하고 싶다면 Mintlify 또는 그 대안(Docusaurus + docusaurus-plugin-llms, Astro Starlight)을 검토하세요.

### 9.7 우리 사이트에 적용할 7가지 교훈

1. 문서·핵심 페이지는 .md 대안 URL을 제공한다
2. /llms.txt를 도메인 루트에 둔다
3. 핵심 CTA의 위치를 모든 페이지에서 동일하게 유지한다
4. API 객체·제품·조직 정보는 JSON-LD로 마킹한다
5. 코드 예제는 항상 실행 가능한 환경(Playground/Replit)에 연결한다
6. 정책·면책 사항을 llms.txt에 명시한다
7. 주요 워크플로 3~5개를 WebMCP 후보로 식별한다

---

## 10. 에이전트 친화도 감사 체크리스트

아래 체크리스트로 우리 사이트의 \"에이전트 친화도\"를 직접 점검할 수 있습니다. 각 항목 옆에 페이지별 점수(✅/⚠️/❌)를 매겨 분기별 추적용 시트로 만드세요.

### 10.1 HTML 구조 (가중치 30%)

- [ ] `<html lang="...">`에 정확한 언어 코드가 명시됨
- [ ] `header` / `nav` / `main` / `footer` 시맨틱 태그 사용
- [ ] 모든 페이지에 단 하나의 `<h1>`이 있음
- [ ] 헤딩이 h1 → h2 → h3 순으로 건너뜀 없이 사용됨
- [ ] 클릭 가능한 모든 요소가 `<button>` 또는 `<a href>`
- [ ] 폼 입력에 `<label for>`가 연결됨
- [ ] 이미지에 의미 있는 alt 텍스트

### 10.2 접근성 트리 (가중치 20%)

- [ ] Chrome DevTools 접근성 트리에 평면적 구조가 없음
- [ ] 모든 버튼·링크에 \"이름(name)\"이 존재함
- [ ] 아이콘 버튼에 `aria-label`
- [ ] 모달·드롭다운에 `aria-expanded` / `aria-controls`
- [ ] Lighthouse 접근성 점수 ≥ 95

### 10.3 시각·레이아웃 (가중치 15%)

- [ ] CLS < 0.1
- [ ] LCP < 2.5s
- [ ] 주요 CTA가 모든 페이지에서 동일 위치
- [ ] 클릭 가능 요소 ≥ 44×44px
- [ ] `cursor: pointer` 설정
- [ ] 투명 오버레이로 인한 클릭 차단 없음

### 10.4 구조화 데이터 (가중치 15%)

- [ ] 사이트 전역 `Organization` JSON-LD
- [ ] 페이지 유형별 적절한 스키마(`Product` / `Article` / `FAQPage` 등)
- [ ] Schema Markup Validator 통과
- [ ] `BreadcrumbList`로 위계 표현

### 10.5 AI 진입점 (가중치 15%)

- [ ] /llms.txt 존재 + 최근 30일 내 갱신
- [ ] /llms-full.txt 존재 (선택)
- [ ] 핵심 페이지의 .md 대안 URL 제공
- [ ] HTML `<head>`에 `rel="alternate" type="text/markdown"`
- [ ] robots.txt에 llms.txt 위치 명시

### 10.6 차세대 (가중치 5%)

- [ ] 핵심 작업 3~5개에 대한 WebMCP 후보 식별
- [ ] Chrome EPP 가입 및 PoC 진행 중

### 10.7 자동화 도구

| 도구 | 용도 | URL |
|---|---|---|
| Lighthouse | 접근성·성능·SEO 자동 점수 | Chrome DevTools 내장 |
| Pa11y | CLI 기반 접근성 자동화 | [pa11y.org](https://pa11y.org) |
| axe DevTools | 심층 접근성 검사 | [deque.com/axe](https://www.deque.com/axe) |
| Schema Validator | JSON-LD 검증 | [validator.schema.org](https://validator.schema.org) |
| Rich Results Test | Google 친화도 | [search.google.com/test/rich-results](https://search.google.com/test/rich-results) |
| llms-txt.io 검증기 | llms.txt 규격 검증 | [llms-txt.io](https://llms-txt.io) |

---

## 11. 단계별 도입 로드맵

한 번에 모든 것을 적용할 수는 없습니다. 4단계로 나누어 분기별로 실행하는 것을 권장합니다.

### Phase 1 (1~2주): 즉시 가능한 빠른 승리

1. Chrome DevTools 접근성 트리로 메인 페이지·결제 페이지 감사
2. div 버튼 → `<button>`으로 일괄 치환
3. placeholder만 있는 입력 필드에 `<label for>` 추가
4. `cursor: pointer`를 전역 디자인 토큰에 추가
5. Schema.org Organization JSON-LD 1개를 사이트 전역 추가

### Phase 2 (3~6주): 구조 보강

1. 시맨틱 랜드마크(header/nav/main/footer) 일관 적용
2. 모든 모달·드롭다운에 ARIA 상태 속성
3. 핵심 페이지 유형별 JSON-LD (Product, Article, FAQPage)
4. CLS / LCP / INP 목표 달성
5. Lighthouse 접근성 점수 95+ 달성

### Phase 3 (7~10주): AI 진입점 표준

1. /llms.txt 최초 버전 작성·배포
2. 핵심 문서 페이지에 .md 대안 URL 제공
3. CMS·SSG에 llms.txt 자동 갱신 파이프라인 통합
4. /llms-full.txt 검토 후 도입
5. AI 학습/추론 사용 정책 명시

### Phase 4 (11주~): 차세대 인터페이스

1. Chrome WebMCP EPP 가입
2. \"에이전트가 수행해줬으면 하는\" 핵심 작업 3~5개 선정
3. 선언적 API 적용 PoC
4. 명령형 API 적용 PoC (복잡 워크플로)
5. WebMCP 표준 안정화에 맞춰 점진적 전사 확장

### 11.1 KPI 설정

| 측정 항목 | Phase 1 후 | Phase 2 후 | Phase 3 후 | Phase 4 후 |
|---|---|---|---|---|
| Lighthouse 접근성 | 85+ | 95+ | 95+ | 95+ |
| CLS | < 0.25 | < 0.1 | < 0.1 | < 0.1 |
| JSON-LD 커버리지 | 30% | 70% | 90% | 95% |
| llms.txt | — | — | v1 배포 | 주간 갱신 |
| 에이전트 트래픽 비율 | 기준선 | +30% | +80% | +150% |
| AI 인용/언급 빈도 | 기준선 | +20% | +60% | +120% |

---

## 부록 A. 용어집

- **접근성 트리(Accessibility Tree)** — 브라우저가 DOM에서 보조 기술용으로 추출한 시맨틱 트리. AI 에이전트의 핵심 입력.
- **시맨틱 HTML** — 요소의 의미를 그대로 드러내는 HTML 사용 방식. div 대신 button, nav 등.
- **JSON-LD** — JSON 형식의 Linked Data. Schema.org 어휘를 표현하는 표준 방식.
- **Schema.org** — Google·Microsoft·Yahoo·Yandex가 공동 운영하는 구조화 데이터 어휘 표준.
- **llms.txt** — Jeremy Howard가 2024년 9월 제안한 LLM용 사이트 진입점 마크다운 파일.
- **llms-full.txt** — 사이트 전체 콘텐츠를 평면화한 단일 마크다운. Mintlify·Anthropic이 공동 개발.
- **WebMCP** — Chrome 팀이 제안한 웹사이트→AI 에이전트 구조화 도구 인터페이스 표준 (2026 EPP).
- **MCP (Model Context Protocol)** — Anthropic이 2024년 11월 공개한 LLM ↔ 외부 도구 통신 프로토콜.
- **에이전트 (Agent)** — 입력을 받아 계획·실행·학습하는 자율 시스템. 모델·규칙·메모리·도구로 구성.
- **제로 파티 에이전트** — 브라우저 내 로컬 데이터만 사용하는 에이전트.
- **퍼스트 파티 에이전트** — 서비스 운영자가 자기 데이터로 제공하는 에이전트.
- **서드 파티 에이전트** — 외부 개발자가 만든 에이전트가 우리 사이트를 데이터·도구로 사용.
- **Human-in-the-loop (HITL)** — AI가 중요한 결정 시점에 인간의 확인을 받도록 설계한 패턴.
- **Core Web Vitals** — Google이 정의한 웹 성능 3대 지표: LCP, INP, CLS.
- **GEO (Generative Engine Optimization)** — 생성형 AI 검색에 노출되도록 사이트를 최적화하는 활동. SEO의 후속 개념.

---

## 부록 B. 참고 문헌 및 출처

### 일차 문헌

- Kulikowski, K. & More, O. (2026-04-01). **상담사 친화적인 웹사이트 구축**. [web.dev/articles/ai-agent-site-ux](https://web.dev/articles/ai-agent-site-ux). Google web.dev.
- Klepper, A., Kulikowski, K., & Nabors, R. L. (2025-02-25). **에이전트 소개**. [web.dev/articles/ai-agents](https://web.dev/articles/ai-agents). Google web.dev.
- Bandarra, A. C. (2026-02-10). **WebMCP를 사전 체험판으로 이용할 수 있습니다**. [developer.chrome.com/blog/webmcp-epp](https://developer.chrome.com/blog/webmcp-epp). Chrome for Developers.
- Howard, J. (2024-09). **The /llms.txt file**. [llmstxt.org](https://llmstxt.org). Answer.AI.

### 관련 표준·도구

- **Schema.org**: [schema.org](https://schema.org)
- **Web Accessibility Initiative (WAI-ARIA)**: [w3.org/WAI/ARIA/apg/](https://www.w3.org/WAI/ARIA/apg/)
- **Core Web Vitals**: [web.dev/vitals](https://web.dev/vitals)
- **Mintlify (llms.txt + MCP 자동 생성)**: [mintlify.com](https://mintlify.com)
- **docusaurus-plugin-llms**: [github.com/rachfop/docusaurus-plugin-llms](https://github.com/rachfop/docusaurus-plugin-llms)
- **MCP 공식**: [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Chrome AI EPP 가입**: [developer.chrome.com/docs/ai/join-epp](https://developer.chrome.com/docs/ai/join-epp)

### 라이선스 표기

본 문서는 Google web.dev 및 Chrome for Developers의 콘텐츠를 인용·번역·재구성한 부분을 포함합니다. 해당 콘텐츠는 [Creative Commons Attribution 4.0 라이선스(CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) 및 [Apache 2.0 라이선스](https://www.apache.org/licenses/LICENSE-2.0) 하에 제공됩니다. 자세한 내용은 [Google Developers 사이트 정책](https://developers.google.com/site-policies)을 참조하세요.

본 가이드 문서 자체는 **CC BY 4.0** 라이선스로 배포되며, 출처를 표시하면 자유롭게 활용·번역·인용 가능합니다.

---

## 저자 정보

**Dennis Kim (김호광 / HoKwang Kim)**
- Betalabs Inc. CEO
- Cyworld Z 前 CEO
- Microsoft Azure MVP (Long-tenured)
- Web3Paper Publisher
- GitHub: [@gameworkerkim](https://github.com/gameworkerkim)

---

<!-- Schema.org TechArticle metadata for AI agents -->
<!--
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "에이전트 친화적인 웹사이트 구축을 위한 실무 기술 가이드",
  "alternateName": "Agent-Friendly Website Construction: A Practical Technical Guide",
  "description": "AI 에이전트 시대의 웹 UX·접근성·구조화 표준을 통합한 실무 가이드",
  "inLanguage": "ko",
  "author": {
    "@type": "Person",
    "name": "Dennis Kim",
    "alternateName": "김호광 / HoKwang Kim",
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
