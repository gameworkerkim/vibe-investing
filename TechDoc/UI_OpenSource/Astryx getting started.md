# Astryx Getting Started Guide

> Meta가 2026년 6월 18일 MIT 라이선스로 오픈소스 공개한 "Agent-Ready" 통합 디자인 시스템
> 공식 사이트: [astryx.atmeta.com](https://astryx.atmeta.com) | GitHub: [facebook/astryx](https://github.com/facebook/astryx) | 현재 Beta (v0.1.x)

한 줄 요약: 메타가 자사가 사용하던 디자인 시스템을 오픈소스로 공개. 단순 UI 라이브러리가 아니라 컴포넌트 + 테마 + 템플릿 + CLI + MCP 서버로 확장하여 작은 스타트업이 다자이너 없이 일관된 UX를 구현하도록 만듬. 한마디로 짱.

---

## 1. Astryx란 무엇인가?

Astryx는 Meta 내부에서 8년간 성장하며 13,000개 이상의 내부 앱을 구동해 온 사내 최대 디자인 시스템을 React + StyleX 기반으로 재구축해 공개한 것입니다. 단순 UI 라이브러리가 아니라 **컴포넌트 + 테마 + 템플릿 + CLI + MCP 서버**가 하나의 시스템으로 결합된 형태이며, 처음부터 사람과 AI 코딩 에이전트가 동일한 방식·동일한 레퍼런스로 UI를 만들도록 설계되었습니다.

| 항목 | 내용 |
|---|---|
| 공개일 | 2026년 6월 18일 (Beta) |
| 라이선스 | MIT |
| 기반 기술 | React, StyleX (Meta의 compile-time CSS 엔진), TypeScript |
| 컴포넌트 수 | 150+ (접근성·다크모드 기본 지원) |
| 공개 테마 | 7종 npm 패키지 (neutral, butter, chocolate, matcha, stone, gothic, y2k) |
| 검증 이력 | Meta 내부 8년, 13,000+ 앱, 업데이트의 약 절반이 내부 빌더 커뮤니티 기여 |
| 빌드 요구사항 | 없음 — pre-built CSS 제공, PostCSS/Babel 플러그인 불필요 |

---

## 2. 주요 특징

### 2.1 Agent-Ready / AI-fluent 설계

- 모든 컴포넌트가 동일한 naming·prop·composition 규칙을 따르므로, 몇 개만 학습하면 사람도 AI도 나머지 컴포넌트의 동작을 예측 가능
- CLI가 self-describing JSON manifest를 반환 — AI 에이전트가 help 텍스트를 스크래핑하지 않고 구조화된 명령 체계를 직접 읽음
- **MCP(Model Context Protocol) 서버** 내장 — Claude, Cursor, Copilot 등 에이전트가 컴포넌트 API를 프로그래밍 방식으로 조회하고 스캐폴딩 가능
- 리포지토리에 `CLAUDE.md`가 포함되어 있고, `npx astryx init` 실행 시 AI 에이전트용 문서가 프로젝트에 자동 설정됨

### 2.2 벤더 종속 없는 완전한 커스터마이징

| 커스터마이징 계층 | 방식 |
|---|---|
| Design Token | 테마 = CSS custom property 오버라이드 집합. 색상·타이포·radius·motion을 토큰 레벨에서 변경하면 모든 컴포넌트가 재스타일링됨 (컴포넌트 코드 무변경) |
| Styling Override | 내부는 StyleX지만 소비자에게는 비가시적. `className`으로 Tailwind, CSS Modules, 일반 CSS 어떤 방식이든 오버라이드 가능 |
| Swizzle (Eject) | `npx astryx swizzle Button` — 컴포넌트 전체 소스를 프로젝트로 추출해 직접 소유·수정. 커스터마이징한 것만 소유하고 나머지는 업스트림 업데이트 유지 |
| Open Internals | 모든 primitive가 export되어 어느 레벨에서든 조합 가능. 닫힌 top-level API 뒤에 잠겨 있지 않음 |

### 2.3 3계층 아키텍처

| Layer | 구성 요소 | 역할 |
|---|---|---|
| Foundations | Typography, Color, Layout, Accessibility | 시각적 일관성과 접근성의 기반 |
| Components | 150+ TypeScript 컴포넌트 | 재사용 가능한 UI 빌딩 블록 (Button, Modal, DataTable, Form Wizard 등) |
| Patterns / Templates | Table Page, Detail Page, Form Wizard, Navigation, Data Entry Flow | 검증된 페이지 단위 설계 솔루션 — CLI로 전체 소스 스캐폴딩 |

### 2.4 기타 기술적 특징

- **Context-aware spacing compensation**: 컴포넌트 중첩 시 발생하는 double padding 문제를 시스템이 자동 보정 — 타 디자인 시스템과의 주요 차별점
- **Guidance over enforcement**: 디자인 의견은 문서와 예제에만 존재. 값을 넘기면 컴포넌트는 그대로 렌더링 (가드레일이 개발자와 싸우지 않음)
- 배포 방식 2가지: (1) pre-built stylesheet import만으로 사용, (2) StyleX 소스 빌드 (`@astryxdesign/build`)

---

## 3. 설치 및 초기 설정

### 3.1 패키지 설치

```bash
# npm
npm install @astryxdesign/core @astryxdesign/theme-neutral
npm install -D @astryxdesign/cli

# pnpm
pnpm add @astryxdesign/core @astryxdesign/theme-neutral
pnpm add -D @astryxdesign/cli
```

CLI를 안정적으로 사용하려면 `package.json`에 스크립트 등록을 권장합니다 (AI 에이전트나 신규 개발자가 CLI 호출 시 경로 오류 방지):

```json
"scripts": {
  "astryx": "node node_modules/@astryxdesign/cli/bin/astryx.mjs"
}
```

### 3.2 CSS 설정 (Next.js + Tailwind 기준 — 가장 간단한 경로)

빌드 플러그인 없이 pre-built CSS가 Tailwind와 공존합니다.

```css
/* src/app/globals.css */
@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;

@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-neutral/theme.css';
@import '@astryxdesign/core/tailwind-theme.css';
@import 'tailwindcss/utilities.css' layer(utilities);
```

`tailwind-theme.css`는 XDS 토큰을 Tailwind utility로 브리징합니다:

| Tailwind class | XDS token |
|---|---|
| `text-primary` / `text-secondary` | `--color-text-primary` / `--color-text-secondary` |
| `bg-surface` / `bg-card` / `bg-body` | `--color-background-*` |
| `rounded-sm` / `md` / `lg` | `--radius-inner` / `element` / `container` |
| `shadow-sm` / `md` / `lg` | `--shadow-low` / `med` / `high` |

### 3.3 Theme Provider 설정

```tsx
// src/app/providers.tsx
'use client';

import Link from 'next/link';
import {Theme} from '@astryxdesign/core/theme';
import {LinkProvider} from '@astryxdesign/core/Link';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <Theme theme={neutralTheme}>
      <LinkProvider component={Link}>{children}</LinkProvider>
    </Theme>
  );
}
```

```tsx
// src/app/layout.tsx
import './globals.css';
import {Providers} from './providers';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 3.4 첫 컴포넌트 사용

```tsx
import {Button} from '@astryxdesign/core/Button';

export default function Page() {
  return <Button label="Hello XDS" variant="primary" />;
}
```

컴포넌트는 per-path import(`@astryxdesign/core/Button`) 방식이며, `Button`은 children 대신 `label` prop을 받는 등 시스템 전반이 일관된 prop 규칙을 따릅니다. Vite 사용 시에도 동일한 CSS import + Provider 구성이면 되고 별도 빌드 플러그인은 필요 없습니다.

---

## 4. 사용 예시

### 4.1 CLI 활용

```bash
npx astryx --help                        # 전체 명령 목록
npx astryx init                          # 프로젝트 초기화 (AI 에이전트 문서 자동 설정)
npx astryx component Button              # 컴포넌트 전체 문서 + 관련 block 템플릿
npx astryx template --list               # 페이지/블록 템플릿 전체 목록
npx astryx template dashboard            # 대시보드 페이지 전체 소스 생성
npx astryx template settings --skeleton  # 레이아웃 스켈레톤 (공간 주석 포함)
npx astryx docs                          # 레퍼런스 문서 (원칙, 토큰, 테마, 스타일링)
npx astryx docs tokens                   # spacing/color/radius/typography 토큰 레퍼런스
npx astryx docs theme                    # 테마 가이드 (Theme, defineTheme, light/dark)
npx astryx theme build                   # 프로덕션용 테마 CSS 빌드
npx astryx swizzle Button                # 컴포넌트 소스 eject
npx astryx upgrade --apply               # 버전 간 마이그레이션 codemod 실행
npx astryx gap-report                    # 누락된 기능 리포트
```

컴포넌트 문서는 CLI 없이도 core 패키지에서 직접 조회할 수 있습니다:

```bash
node node_modules/@astryxdesign/core/docs.mjs Button          # 특정 컴포넌트 전체 문서
node node_modules/@astryxdesign/core/docs.mjs --list --brief  # 전체 컴포넌트 요약 목록
```

### 4.2 Swizzle 워크플로우

```bash
# 1. 실제 컴포넌트 소스를 내 리포로 추출
npx astryx swizzle Button
```

```tsx
// 2. 패키지 대신 로컬 사본을 import
import {Button} from './components/Button';
```

Eject한 소스는 자유롭게 수정 가능하며, 커스터마이징하지 않은 나머지 컴포넌트는 계속 패키지 업데이트를 받습니다.

### 4.3 페이지 템플릿으로 빠르게 시작

템플릿은 content-only 구조로, `XDSLayout`에 header/content/panel 슬롯을 조합한 대시보드·설정·폼·상세 페이지 패턴을 제공합니다. 전역 내비게이션은 `XDSAppShell`, `XDSTopNav`, `XDSSideNav`로 감싸서 추가합니다.

```bash
npx astryx template dashboard   # → 대시보드 페이지 전체 소스가 프로젝트에 생성됨
```

### 4.4 AI 에이전트 연동 (MCP)

`npx astryx init`으로 프로젝트를 초기화하면 AI 에이전트용 문서가 설정되고, MCP 서버를 통해 Claude Code·Cursor 등이 컴포넌트 API·토큰·템플릿을 구조화된 형태로 직접 조회합니다. 에이전트가 임의의 CSS 래퍼를 만들어내는 대신 시스템의 machine-readable manifest를 기준으로 브랜드 가이드라인에 부합하는 UI를 생성하므로, AI 생성 코드의 스타일 파편화와 UI 디버깅 시간이 크게 줄어듭니다.

---

## 5. 스타트업을 위한 활용 방법

### 5.1 왜 스타트업에 적합한가

| 스타트업의 문제 | Astryx의 해법 |
|---|---|
| 디자이너 부재 / 디자인 리소스 부족 | Meta 8년 검증 컴포넌트 + 7종 테마 → 토큰만 바꿔 브랜드화. 접근성(a11y)·다크모드가 기본 내장이라 별도 투자 불필요 |
| "빅테크 시스템 도입 = 남의 브랜드처럼 보임" | 테마 = CSS 변수 오버라이드이므로 포크·래핑 없이 완전히 자기 브랜드로 변형 가능 |
| copy/paste 컴포넌트 컬렉션의 유지보수 부채 | 업스트림 수정·업그레이드 경로(`astryx upgrade --apply` codemod) 유지. swizzle한 것만 직접 소유 |
| AI 코딩 도구 의존도가 높은 소규모 팀 | 에이전트가 MCP/CLI로 시스템을 직접 읽으므로 vibe coding 결과물의 일관성이 구조적으로 보장됨 |
| 라이선스 비용 | MIT — 상용 제품에 무제한 무료 사용 |

### 5.2 단계별 도입 로드맵

**Phase 1 — MVP (Day 1~7)**

1. `npm install` + CSS import + `<Theme>` Provider — 빌드 설정 없이 즉시 가동
2. `npx astryx template --list`로 제품 유형에 맞는 템플릿 선택 (dashboard, settings, form 등)
3. 기본 테마(neutral) 그대로 사용하고 제품 로직에 집중 — UI는 "80% 완성" 상태에서 출발

**Phase 2 — 브랜드화 (Week 2~4)**

1. `npx astryx docs tokens`로 토큰 구조 파악
2. 브랜드 색상·타이포·radius를 CSS custom property로 오버라이드한 자체 테마 정의 (`defineTheme`)
3. `npx astryx theme build`로 프로덕션 테마 CSS 생성 — 컴포넌트 코드는 한 줄도 변경하지 않음

**Phase 3 — 차별화 (Month 2+)**

1. 경쟁력이 필요한 핵심 화면의 컴포넌트만 `swizzle`로 eject해 심층 커스터마이징
2. 나머지는 업스트림 추적 유지 → 유지보수 부채 최소화
3. `astryx gap-report`로 필요한 기능을 업스트림에 요청하거나 직접 기여

**AI-네이티브 개발 체계 (전 단계 병행)**

1. `npx astryx init`으로 에이전트 문서 설정 + MCP 서버 연결
2. Claude Code / Cursor에 "Astryx 템플릿 기반으로 결제 설정 페이지 생성" 같은 작업을 위임
3. 에이전트가 manifest를 읽고 시스템 규칙에 맞는 코드를 생성 → 리뷰 비용 절감

### 5.3 스타트업 유형별 활용 시나리오

| 유형 | 활용 방식 |
|---|---|
| B2B SaaS | dashboard/table page/settings 템플릿으로 admin·analytics 화면을 수일 내 구축. DataTable, Form Wizard 등 복잡 컴포넌트가 이미 검증됨 |
| Fintech / Web3 | 접근성·다크모드 기본 지원으로 규제·감사 대응 부담 완화. 토큰 기반 테마로 멀티 브랜드(화이트라벨) 대응 |
| 에이전시 / 수주 개발 | 클라이언트별 테마 패키지만 교체해 동일 코드베이스로 다수 프로젝트 납품 — 납기 단축 |
| AI-native 제품 | LLM이 UI를 동적 생성하는 제품에서 Astryx manifest를 grounding 소스로 사용 — 생성 UI의 일관성 확보 |
| 사내 도구 (internal tools) | Astryx의 원산지 자체가 Meta internal tools. 운영 대시보드·백오피스에 가장 검증된 사용처 |

### 5.4 도입 전 체크리스트 (리스크)

- **Beta 단계** (v0.1.x): 공개 프로젝트로서는 초기. breaking change 가능성이 있으므로 `astryx upgrade --apply` codemod 경로를 CI에 포함할 것
- **React 전용**: Vue/Svelte 스택이면 부적합
- **컴포넌트 수 표기 편차**: GitHub README는 150+, 문서 사이트는 160+로 표기 — 실제 필요 컴포넌트는 `npx astryx component --list`로 직접 확인 권장
- **미공개 패키지**: `@astryxdesign/lab`(실험 컴포넌트), `@astryxdesign/vega`(차트 래퍼)는 아직 npm 미배포 — 차트가 핵심인 제품은 별도 차트 라이브러리 병행 필요
- **커뮤니티 성숙도**: 공개 3주차 기준 GitHub 6.3k stars, 이슈 140+ — 생태계(서드파티 확장, 튜토리얼)는 shadcn/ui, MUI 대비 아직 얕음

---

## 6. 요약

Astryx의 핵심 가치는 세 가지입니다.

1. **검증된 방대함** — Meta 8년, 13,000+ 앱에서 다듬어진 150+ 컴포넌트와 페이지 패턴
2. **종속 없는 커스터마이징** — 토큰 테마 → className 오버라이드 → swizzle eject의 3단 자유도, MIT 라이선스
3. **인간-AI 공용 설계** — CLI JSON manifest와 MCP 서버로 사람과 에이전트가 같은 레퍼런스로 빌드

스타트업 입장에서는 "UI의 80%를 검증된 시스템에 맡기고, 나머지 20%의 차별화와 비즈니스 로직에 집중"하는 도구로 요약할 수 있습니다. 단, Beta 단계인 만큼 업그레이드 codemod 경로를 확보하고 핵심 의존 컴포넌트를 사전 검증한 뒤 도입하는 것이 안전합니다.

---

## 참고 자료

- 공식 사이트: https://astryx.atmeta.com
- 소개 블로그: https://astryx.atmeta.com/blog/introducing-astryx
- 기술 배경: https://astryx.atmeta.com/blog/how-astryx-works
- GitHub: https://github.com/facebook/astryx
- Component Storybook: https://facebook.github.io/astryx/
- StyleX: https://stylexjs.com
