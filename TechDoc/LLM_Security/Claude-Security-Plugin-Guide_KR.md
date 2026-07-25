---
title: "Claude Security Plugin 기술 분석 및 Getting Started"
subtitle: "security-guidance와 claude-security를 구분하고, 멀티에이전트 검증 파이프라인·도입 절차·경쟁 위치를 정리한다"
description: "Claude Code용 claude-security(Beta)와 security-guidance(GA)의 구조, 3인 검증 패널, BYO inference, 도입 절차와 Defense-in-Depth 스택 내 위치를 정리한 기술 가이드."
abstract: |
  Anthropic Claude Code의 보안 플러그인 두 종(security-guidance GA, claude-security Beta v0.10.0)을 구분하고,
  추론 기반 취약점 스캔·적대적 검증(2/3 정족수)·로컬 실행(BYO inference)·Human-in-the-loop 패치 원칙을 설명한다.
  기존 SAST 대체가 아닌 보완재로서의 위치, 요금·CLI 요건, 도입 체크리스트를 포함한다. 기준일 2026-07-26.
summary_for_ai: |
  Tech guide (KO) for Anthropic Claude Security Plugin: distinguishes security-guidance (in-session GA) vs claude-security (on-demand multi-agent deep scan, Beta v0.10.0, paid plan, CLI ≥2.1.154).
  Core: reasoning-over-pattern, adversarial 3-panel verification, locality/BYO inference, human-in-the-loop patches; complements SAST in a 6-tier defense stack. Reference docs accessed 2026-07-23; document date 2026-07-26.
date: 2026-07-26
author: "Dennis Kim"
lang: ko
tags:
  - Claude
  - LLM Security
  - AppSec
  - DevSecOps
  - SAST
keywords:
  - Claude Security Plugin
  - claude-security
  - security-guidance
  - multi-agent vulnerability scanner
  - adversarial verification
  - BYO inference
group: security
featured: true
featured_rank: 1
schema_type: TechArticle
draft: false
robots: index,follow
---

# Claude Security Plugin 기술 분석 및 Getting Started

기존의 전통적인 보안 솔루션, github등의 오픈소스 보안 솔루션들은 이제 새로운 가치를 주지 않으면 몰락하게 되었다. Claude Security Plugin이 보안을 in-House 기술로 확장한 것이다.

| 항목 | 내용 |
|:---|:---|
| 문서 버전 | 1.0 |
| 작성일 | 2026-07-26 |
| 대상 제품 | `claude-security` (Beta, plugin v0.10.0), `security-guidance` (GA) |
| 기준 문서 | code.claude.com/docs 공식 문서 (2026-07-23 접근) |
| 대상 독자 | AppSec / DevSecOps 엔지니어, 보안 아키텍트, 개발 리드 |
| 요약 | Claude Code 세션 내부에서 동작하는 멀티에이전트 취약점 스캐너의 구조, 검증 파이프라인, 도입 절차 및 경쟁 제품 대비 위치 |

---

## 0. 먼저 구분해야 할 두 개의 플러그인

"Claude 보안 플러그인"이라는 이름 아래 성격이 전혀 다른 두 제품이 존재한다. 혼동이 잦으므로 먼저 분리한다.

| 구분 | `security-guidance` | `claude-security` |
|:---|:---|:---|
| 한 줄 정의 | Claude가 **코드를 쓰는 동안** 자기 변경분을 검토 | 저장소 전체를 **온디맨드 딥스캔**하는 멀티에이전트 감사 |
| 트리거 | 자동 (호출 명령 없음) | 수동 `/claude-security` |
| 상태 | 정식 제공 | Beta (2026-07-22 공개) |
| 요금제 | 전 플랜 (무료 포함) | **유료 플랜 필수** |
| 최소 CLI | v2.1.144+ | v2.1.154+ (dynamic workflows) |
| 산출물 | 세션 내 대화형 지적 → 즉시 수정 | 타임스탬프 리포트 디렉터리 + `.patch` 파일 |
| 성격 | 예방적 가드레일 (shift-left) | 감사용 스캐너 (SAST 대체가 아닌 보완) |
| 비용 특성 | 레이어별 저비용 ~ 중간 | 스캔당 토큰 대량 소모 |

본 문서에서 "Claude Security 플러그인"은 후자(`claude-security`)를 지칭하며, 5장에서 `security-guidance`를 별도로 다룬다.

---

## 1. 컨셉

### 1.1 설계 전제

기존 SAST는 규칙 기반 패턴 매칭이다. 알려진 패턴은 잡지만 (a) 오탐률이 높고 (b) 여러 파일에 걸친 논리 결함·인증 우회처럼 문맥이 필요한 취약점을 놓친다. Claude Security는 이 지점을 겨냥해 **"숙련된 보안 연구자의 추론 과정을 에이전트 팀으로 재현"** 하는 방식을 취한다. 아키텍처를 매핑하고, 위협 모델을 세우고, 진입점에서 싱크까지 데이터 흐름을 추적하고, 자기 발견을 반박한 뒤 보고한다.

핵심 컨셉을 네 가지로 압축하면 다음과 같다.

| 컨셉 | 구현 방식 | 의미 |
|:---|:---|:---|
| **Reasoning over pattern** | LLM 에이전트가 코드를 읽고 추론. 정규식·룰셋이 1차 엔진이 아니다 | 신규·논리형 취약점 탐지 가능, 반면 비결정적 |
| **Adversarial verification** | 후보 발견마다 3인 검증 패널 투표 (2/3 정족수) | 오탐 억제를 아키텍처에 내장 |
| **Locality (BYO inference)** | 스캔이 사용자 세션·사용자 권한으로 로컬 실행 | 코드가 환경을 벗어나지 않음. GitLab·Bitbucket·인바운드 차단망 대응 |
| **Human-in-the-loop** | 패치는 절대 자동 적용되지 않음 | 승인 지점을 제거하지 않고 승인 재료의 품질만 올림 |

### 1.2 Defense-in-Depth 스택 내 위치

Anthropic은 이 플러그인을 단독 솔루션이 아니라 6단 스택의 한 층으로 명시한다.

| 단계 | 도구 | 커버리지 |
|:---|:---|:---|
| 세션 중 (In session) | `security-guidance` 플러그인 | Claude가 작성한 코드의 일반 취약점, 같은 세션에서 수정 |
| 온디맨드 단일 패스 | `/security-review` | 현재 브랜치 1회 보안 검토 |
| **온디맨드 딥스캔** | **`claude-security` 플러그인** | **저장소·diff 멀티에이전트 스캔, 독립 검증된 발견과 패치** |
| PR 시점 | Code Review (Team/Enterprise) | 전체 코드베이스 문맥의 정합성·보안 멀티에이전트 리뷰 |
| 매니지드 | Claude Security 제품 (Enterprise) | 연결된 저장소를 상시 모니터링하는 호스팅 스캐닝 |
| CI | 기존 SAST·의존성 스캐너 | 언어별 룰, 공급망 검사, 정책 강제 |

> 공식 문서 원문 취지: **기존 소스코드 보안 도구를 대체하지 않는다.** 정적 분석·의존성 스캔·코드 리뷰와 병행하는 보완재다.

---

## 2. 기능 상세

### 2.1 제공 명령과 3개 작업

플러그인은 단일 명령 `/claude-security`를 추가하고, 메뉴에서 세 작업을 제공한다.

| 작업 | 대상 | 비고 |
|:---|:---|:---|
| **Scan codebase** | 저장소 전체 또는 범위 한정 서브셋 | 버전관리 없는 디렉터리에서도 동작. 작업 트리(uncommitted)를 읽음 |
| **Scan changes** | 브랜치 diff, PR diff, 단일 커밋 | Git 필수. **커밋된 변경만** 대상. 리서치 에이전트는 diff만 보지 않고 문맥을 위해 저장소 전체를 읽는다 |
| **Suggest patches** | 리포트의 선택된 발견 | `.patch` 파일 생성. 자동 적용 없음 |

메뉴를 거치지 않고 인자나 자연어로 직접 지시할 수 있다.

```text
/claude-security scan my branch
/claude-security          → "scan commit abc1234"
```

권한 프롬프트가 단계마다 뜨면 스캔이 멈추므로 **auto mode** 사용이 권장된다.

### 2.2 스캔 파이프라인: 6 페이즈

스캔은 JavaScript 오케스트레이션 스크립트(dynamic workflow)로 구현되어 서브에이전트에 작업을 팬아웃한다.

| # | 페이즈 | 내용 |
|:---|:---|:---|
| 1 | **Inventory** | 저장소를 컴포넌트로 분할. 모든 최상위 디렉터리는 스캔되거나 **이유를 명시해 제외**되어야 함 |
| 2 | **Threat model** | 컴포넌트별 모델러 1명. 진입점, 싱크, 신뢰 경계, 전문 조회가 필요한 파일 목록 산출 |
| 3 | **Research** | (컴포넌트 × 카테고리) 셀마다 리서처 배치 |
| 4 | **Sweep** | 매트릭스가 덮지 못한 영역 갭필 |
| 5 | **Panel** | 3렌즈 적대적 검증, 렌즈당 투표자 1명 |
| 6 | **Adversarial** | max effort 전용. 경계선 판정 재심 후 생존 발견 전수 레드팀 |

리서치 카테고리는 4종으로 고정된다.

| 카테고리 | 범위 |
|:---|:---|
| `injection-and-input` | 인젝션, 입력 검증 |
| `auth-and-access` | 인증·인가·접근제어 (IDOR, 권한 우회) |
| `memory-and-unsafe` | 메모리 손상, unsafe 구문 |
| `crypto-and-secrets` | 암호 오용, 비밀정보 노출 |

메모리 안전 언어로만 구성된 컴포넌트는 `memory-and-unsafe`가 제외되어 3렌즈로 동작한다. 즉 순수 Python·TypeScript 컴포넌트는 불필요한 렌즈에 토큰을 쓰지 않는다.

### 2.3 Effort Tier

| Tier | 최대 컴포넌트 | 셀당 리서처 | 갭필 스윕 | Adversarial 페이즈 |
|:---|:---|:---|:---|:---|
| low | 12 | 1 | 0 | 미실행 |
| medium | 12 | 1 | 1 | 미실행 |
| high | 24 | 2 | 2 | 미실행 |
| max | 24 | 2 | 2 | 실행 |

범위가 작거나 diff가 작으면 전체 매트릭스 대신 단일 리서처 구성으로 축약되지만, **검증 기준은 동일하게 유지**된다.

### 2.4 모델 계층

| 역할 | 모델 | 도구 권한 |
|:---|:---|:---|
| 오케스트레이터 | Opus | — |
| 저장소 카토그래퍼, read-only 코드 탐색기 | Sonnet | 읽기 전용 |
| 리서처, 검증자 | 세션 모델 상속 | 읽기 전용 |

스캔 에이전트는 읽기 전용 도구로 제한된다. 스캔 자체가 코드를 수정하지 않는다는 보장의 근거다.

### 2.5 검증 패널 — 이 제품의 핵심

발견이 리포트에 오르는 조건은 "리서처가 찾았다"가 아니다. **패널을 통과해야** 한다.

| 요소 | 규칙 |
|:---|:---|
| 투표자 | 3명, 렌즈당 1명: `REACHABILITY`(도달 가능성) / `IMPACT`(영향) / `DEFENSES`(기존 방어) |
| 판정 형식 | `TRUE_POSITIVE` 또는 `FALSE_POSITIVE` + 결정적 `file:line` 1~2줄 |
| 유지 정족수 | 3표 중 2표 |
| 투표 미달 | 3명 미만 회신 시 해당 후보는 유지 불가 |
| 신뢰도 상한 | 만장일치 3/3 → `high` 허용 / 2/3 → `medium`으로 캡 |
| 집계 주체 | **리포트 렌더러의 Python 코드가 계산.** 모델이 주장하는 값이 아니다 |
| 검증 스탬프 | 투표 기록이 전 발견에 대해 패널 실행을 증명할 때만 `verification.status = verified`, 아니면 사유가 붙은 `unverified` |

집계를 모델이 아닌 코드가 수행하고, 그 결과를 커밋 단위 리비전 파일에 각인한다는 점이 실무적으로 가장 중요하다. **리포트가 스스로 주장하는 엄밀성을 신뢰가 아니라 검산으로 확인할 수 있다.** CTI·감사 관점에서 Admiralty Code 유사 신뢰도 체계를 자동 산출하는 것과 동등한 기능이다.

### 2.6 산출물

모든 스캔은 저장소 안에 `CLAUDE-SECURITY-<timestamp>/` 디렉터리 하나만 생성한다.

| 파일 | 내용 |
|:---|:---|
| `CLAUDE-SECURITY-RESULTS.md` | 사람이 읽는 리포트. 발견 ID(`F1` 등), severity(HIGH/MEDIUM/LOW), confidence, CWE ID, 정확한 싱크 라인, impact, exploit scenario, 전제조건, 권고 |
| `CLAUDE-SECURITY-RESULTS.jsonl` | 동일 발견의 기계 판독 형식, 1줄 1 JSON 객체 |
| `CLAUDE-SECURITY-REVISION-<commit>.json` | 리비전 스탬프: 스캔된 커밋, effort, severity 카운트, 검증 수준. 미커밋 변경이 포함되면 파일명에 `-dirty`, 버전관리 밖이면 커밋 자리에 `UNVERSIONED` |

이 디렉터리는 자체 `.gitignore`를 포함한다. 실수로 `git add`해도 리포트가 커밋에 섞이지 않는다. 반대로 **감사 추적용으로 이력에 남기려면 그 `.gitignore` 하나만 삭제하고 일반 디렉터리처럼 커밋**하면 된다.

### 2.7 패치 생성 — 3개 주장(claims) 요건

| 단계 | 동작 |
|:---|:---|
| 1 | 저장소의 **스크래치 클론**에서 패치 작성. 작업 트리·인덱스 무손상 |
| 2 | 패치를 쓴 에이전트와 **독립된** 검증 에이전트가 staged diff 검토 |
| 3 | 프로젝트 테스트 스위트가 존재하면 변경분에 대해 실행 |
| 4 | 3개 주장 전부를 확신할 때만 `.patch` 파일 기록 |
| 5 | `patches/F<n>.patch` + 변경 설명 노트 배치 |

**3개 주장**

1. 해당 변경이 그 **단일** 발견을 해결한다
2. 새로운 취약점을 도입하지 않는다
3. 그 외 동작은 불변이다 — *코드가 수용하는 입력 집합의 변화는 동작 변경으로 계산*

보안을 약화시키면서 수정을 주장하는 변경(인증 검사 완화, 테스트 비활성화 등)은 **자동 거부**된다. 세 주장을 보증할 수 없으면 패치 대신 사유 노트가 나온다. 대상 코드에 테스트가 없으면 노트에 "테스트 실행 없이 코드 리뷰로만 검증됨"이 명시된다.

적용은 항상 사용자의 결정이다.

```bash
git apply CLAUDE-SECURITY-<timestamp>/patches/F1.patch
```

**패치 1개당 PR 1개**가 공식 권고다. 개별 리뷰·테스트 가능성을 확보하기 위한 것이다.

또한 리포트가 stale이면(발견 이후 코드가 변경됨) 해당 발견은 스킵되고 재스캔을 제안한다. 낡은 리포트로 패치하지 않는다.

---

## 3. 장점

| # | 장점 | 근거 |
|:---|:---|:---|
| 1 | **문맥 의존 취약점 탐지** | 파일 간 데이터 흐름 추적, 다중 컴포넌트 결합 패턴, 인증 우회·복합 논리 결함 등 패턴 매칭이 놓치는 클래스에 강점 |
| 2 | **검증 가능한 오탐 억제** | 3렌즈 패널 + 2/3 정족수 + 신뢰도 상한 캡. 오탐 억제가 마케팅 문구가 아닌 파이프라인 구조 |
| 3 | **리포트 무결성의 코드 기반 증명** | 투표 집계를 렌더러가 Python으로 계산하고 리비전 스탬프에 각인. 감사 산출물로서의 신뢰성 |
| 4 | **코드가 환경을 떠나지 않음** | 세션 내 로컬 실행. GitLab·Bitbucket·인바운드 미허용 사설망 등 매니지드 SaaS가 못 닿는 코드에 접근 |
| 5 | **추가 벤더·계약 불필요** | 이미 보유한 Claude 접근권과 토큰 예산으로 실행. PoC 비용이 사실상 0 |
| 6 | **기계 판독 출력 제공** | JSONL 출력으로 티켓·SIEM·대시보드 파이프라인 연결 가능 |
| 7 | **패치의 안전 게이트** | 스크래치 클론 + 독립 검증 + 3주장 + 자동 적용 금지. 보안 약화형 "수정" 자동 거부 |
| 8 | **범위 조절 가능성** | effort tier와 컴포넌트 범위 지정으로 대형 모노레포를 영역별 분할 스캔 |
| 9 | **워크플로 이탈 없음** | 터미널 세션 안에서 스캔→분석→패치→PR까지. 별도 콘솔 컨텍스트 스위칭 제거 |

---

## 4. 단점 및 리스크

| # | 단점 | 상세 | 완화책 |
|:---|:---|:---|:---|
| 1 | **비결정성** | 동일 코드 2회 스캔이 서로 다른 발견을 낼 수 있다 | 정기 스캔 + 리비전 스탬프로 리포트를 코드·설정에 귀속. 릴리스 게이트 단독 근거로 쓰지 말 것 |
| 2 | **재현성 부재 → 컴플라이언스 부적합** | "스캔 통과" 증빙을 요구하는 감사 체계에 그대로 대응 불가 | 결정적 SAST를 병행 유지. 본 도구는 보완 증거로 취급 |
| 3 | **격리(isolation) 없음** | 스캔은 사용자 권한으로 실행되며 커밋된 `.claude/` 설정, hooks, `CLAUDE.md`가 그대로 적용된다. 저장소 내용을 데이터로 취급하지만 **적대적 저장소에 대한 방어책이 아니다** | 신뢰하지 않는 코드는 `sandbox-runtime` 또는 VM/컨테이너에서 스캔 |
| 4 | **토큰 비용** | 딥스캔은 상당량 토큰 소모, 플랜 한도에 차감 | 영역 분할 스캔, effort tier 하향, 변경 스캔 우선 |
| 5 | **세션 점유** | 스캔 완료까지 Claude Code를 열어두어야 함 | 별도 세션·머신 분리, CI 실행 검토 |
| 6 | **미커밋 변경 제약** | 변경 스캔은 커밋된 변경만 본다 | 사전 커밋 또는 stash, 아니면 전체 스캔 사용 |
| 7 | **커버리지 불투명성** | 리포트의 coverage 섹션 확인이 필수. 무엇이 제외되었는지 사람이 읽어야 함 | 제외 사유 리뷰를 절차화 |
| 8 | **의존성·공급망 미커버** | SCA, 라이선스, 컨테이너, IaC, DAST 미포함 | 기존 SCA·시크릿 스캐너 유지 |
| 9 | **유료 플랜 종속** | 유료 플랜 + v2.1.154+ + dynamic workflows 필요. Pro는 `/config`에서 수동 활성화 | 사전 환경 표준화 |
| 10 | **Beta** | 기능·출력 스키마 변경 가능성. 파이프라인 자동화 시 파손 위험 | JSONL 파서에 버전 방어 코드 |
| 11 | **Fable 5 사용 시 자동 강등** | 사이버보안 안전 분류기로 일부 모델 활동이 차단되어 Opus로 자동 강등되는 메시지 발생 (정상 동작, 스캔은 완료됨) | 예상 동작으로 인지 |

---

## 5. 동반 제품: `security-guidance` 플러그인

딥스캔보다 먼저 도입해야 할 대상은 사실 이쪽이다. **전 플랜 무료**이며, "Claude가 만든 취약점을 Claude가 같은 세션에서 잡는다"는 예방 레이어다.

### 5.1 3계층 리뷰

| 계층 | 시점 | 방식 | 비용 | 탐지 예 |
|:---|:---|:---|:---|:---|
| Per-edit | Edit/Write/NotebookEdit 직후 | 정규식·부분문자열 결정적 매칭, **모델 호출 없음** | 0 | `eval(`, `new Function`, `os.system`, `child_process.exec`, `pickle`, `dangerouslySetInnerHTML`, `.innerHTML =`, `document.write`, `.github/workflows/` 수정 |
| End-of-turn | 턴 종료 시 | 턴 중 작업 트리 git diff를 별도 Claude 리뷰에 전달, 백그라운드 실행 | 턴당 약 1회 호출 | 인가 우회, IDOR, 인젝션, SSRF, 취약한 암호 |
| Commit/Push | Claude가 Bash로 `git commit`/`git push` 실행 시 | 에이전틱 심층 리뷰. 호출자·새니타이저·연관 파일까지 읽어 실재 여부 판정 | 커밋당 여러 턴 | 문맥 없이는 위험해 보이나 실제로는 안전한 패턴의 오탐 제거 |

주요 상한과 제약:

- End-of-turn은 턴당 최대 30개 변경 파일, 연속 3회 후 사용자에게 양보
- Commit 리뷰는 롤링 1시간당 20회 상한
- **사용자가 자기 셸에서(또는 `!` 이스케이프로) 한 커밋은 검토되지 않는다**
- 어떤 계층도 쓰기·커밋을 **차단하지 않는다** (non-blocking, best-effort)
- 리뷰어는 코드를 쓴 인스턴스가 자기 채점을 하는 구조가 아니다. 별도 호출·신규 컨텍스트·보안 전용 프롬프트로 "문제만 찾도록" 지시된다

### 5.2 확장 지점

| 파일 | 용도 | 상한 |
|:---|:---|:---|
| `.claude/claude-security-guidance.md` | 모델 기반 리뷰에 조직 위협모델·체크리스트를 자연어로 주입 | 전 스코프 합계 8KB |
| `.claude/security-patterns.yaml` (`.yml`/`.json`) | per-edit 결정적 룰 추가 | 최대 50 룰, `reminder` 1KB |

조회 경로: `~/.claude/`(사용자 전역) → `.claude/`(저장소 체크인) → `.claude/*.local.md`(gitignore, 개인). 존재하는 전부를 연결(concat)한다. 디바이스 관리로 사용자 스코프 파일을 배포하면 조직 전역 룰이 된다.

패턴 파일 예:

```yaml
patterns:
  - rule_name: internal_api_key
    substrings: ["sk_live_", "AKIA"]
    reminder: "하드코딩된 API 키 프리픽스. 시크릿 매니저에서 로드할 것."
  - rule_name: tenant_unfiltered_query
    regex: "\\.objects\\.all\\(\\)"
    paths: ["**/src/tenants/**"]
    reminder: "멀티테넌트 코드는 org_id로 필터링해야 한다."
```

| 필드 | 설명 |
|:---|:---|
| `rule_name` | 경고에 표시되는 식별자 |
| `reminder` | Claude 컨텍스트에 주입되는 경고문 (1KB 상한) |
| `regex` | 편집 내용에 매칭되는 Python 정규식 |
| `substrings` | 리터럴 부분문자열 (`regex`와 택일) |
| `paths` / `exclude_paths` | glob. 전체 경로에 매칭되므로 프로젝트 상대 패턴은 `**/` 접두 필요 |

주의: 가이던스 파일은 **가산적(additive)** 이다. "이 취약점 클래스를 무시하라"는 룰로 기본 검사를 억제할 수 없다. 강제(hard enforcement)가 필요하면 편집을 차단하는 hook 또는 CI 검사와 병행해야 한다. YAML 형식은 PyYAML이 import 가능해야 하며 플러그인이 설치해주지 않는다 — 없으면 `.json`을 쓸 것.

### 5.3 비활성화 스위치

| 환경변수 | 효과 |
|:---|:---|
| `ENABLE_PATTERN_RULES=0` | per-edit 패턴 검사 비활성 |
| `ENABLE_STOP_REVIEW=0` | end-of-turn diff 리뷰 비활성 |
| `ENABLE_COMMIT_REVIEW=0` | commit/push 리뷰 비활성 |
| `ENABLE_CODE_SECURITY_REVIEW=0` | 모델 기반 리뷰 일괄 비활성 |
| `SECURITY_GUIDANCE_DISABLE=1` | 제거 없이 플러그인 전체 비활성 |
| `SECURITY_REVIEW_MODEL` | end-of-turn 리뷰 모델 지정 (기본 Opus 4.7) |
| `SG_AGENTIC_MODEL` | commit 리뷰 모델 지정 |

### 5.4 구현 구조

플러그인은 전부 **hooks** 위에 구현되어 있다. 자체 hook을 만들 때 참조 구현으로 쓸 수 있다.

| Hook 이벤트 | 목적 |
|:---|:---|
| `SessionStart` | 플러그인 Python 환경 부트스트랩 |
| `UserPromptSubmit` | end-of-turn 리뷰가 diff할 작업 트리 기준선 캡처 |
| `PostToolUse` (Edit/Write/NotebookEdit) | per-edit 패턴 매칭 |
| `Stop` | end-of-turn diff 리뷰(백그라운드) |
| `PostToolUse` (Bash, `git commit`/`git push` 필터) | 커밋·푸시 리뷰(백그라운드) |

Anthropic 자체 롤아웃 및 벤치마크 기준으로 이 플러그인을 사용해 올린 PR에서 **보안 관련 코멘트가 30~40% 감소**했다고 발표했다. 전체 코드 리뷰를 대체하는 것이 아니라 "가벼운 1차 통과"라는 위치 규정이다.

---

## 6. 경쟁 제품 비교

### 6.1 직접 경쟁: AI 네이티브 에이전틱 보안 리뷰어

| 제품 | 벤더 | 상태 (2026-07) | 실행 위치 | 검증 방식 | 패치 | 특징 / 차이 |
|:---|:---|:---|:---|:---|:---|:---|
| **Claude Security 플러그인** | Anthropic | Beta | 로컬 세션 (BYO inference) | 3렌즈 패널 2/3 정족수, 코드 집계 | `.patch`, 수동 적용 | 리포트 무결성의 코드 기반 증명. 사설망·비GitHub 대응 |
| **Codex Security** (구 Aardvark) | OpenAI | Research preview (2026-03 전환) | 클라우드 (Codex 웹) | 샌드박스에서 실제 트리거로 익스플로잇 가능성 확인 | Codex 경유 PR 제안 | **샌드박스 익스플로잇 검증**이 최대 차별점. 커밋 상시 모니터링. 골든 리포에서 알려진·합성 취약점 92% 탐지 주장 |
| **Claude Security (매니지드)** | Anthropic | Enterprise | 호스팅 | 동일 계열 적대적 검증 | 권고 패치 | 연결 저장소 상시 모니터링, 웹훅(Slack/Jira), CSV·Markdown 내보내기, 스케줄 스캔, 기각 이력 승계 |
| **ZeroPath** | ZeroPath | 상용 | SaaS | AI 네이티브 탐지 | 자동 수정 제안 | 인가 논리·IDOR·접근제어 결함에 강점. 자연어 룰. 언어 커버리지는 상대적으로 좁음 |
| **Corgea** | Corgea | 상용 | SaaS | 상위 스캐너 결과를 AI로 트리아지 | 고신뢰 패치 생성 | 독립 스캐너가 아님. Semgrep·CodeQL·Snyk·Checkmarx 결과의 **수정 레이어**. 탐지 품질은 상위 도구에 종속 |
| **CodeAnt AI / Arnica** | 각 사 | 상용 | SaaS | LLM 1차 탐지 | 자동 수정 | AI 네이티브 티어. 통합 플랫폼 지향 |

### 6.2 인접 경쟁: 기존 SAST/AppSec 플랫폼

| 제품 | 탐지 엔진 | AI 레이어 | 강점 | Claude Security 대비 |
|:---|:---|:---|:---|:---|
| **Semgrep** | 룰 기반 (YAML) | Assistant (트리아지·수정 보조) | 40+ 언어, 커스텀 룰 유연성, OSS 엔진 무료, 낮은 오탐 | 결정적·재현 가능. 대신 자체로는 "탐지 엔진"이며 원클릭 수정은 약함 |
| **Snyk Code** | 정적분석 + DeepCode AI | Agent Fix | SAST+SCA+컨테이너+IaC 통합, IDE/레지스트리 생태계 최광범위, 무료 티어 | 플랫폼 폭이 압도적. 논리 결함 추론은 열세 |
| **GitHub Advanced Security (CodeQL)** | CodeQL 데이터플로 쿼리 | Copilot Autofix | GitHub Enterprise 네이티브, PR 루프 최단, 액티브 커미터 단위 예측 가능한 과금 | GitHub 종속. Claude 플러그인은 GitLab/Bitbucket/사설망 커버 |
| **Checkmarx One** | 룰 기반 (CxQL) | AI 트리아지 | 엔터프라이즈 포트폴리오 거버넌스, 규제 대응 | 학습 곡선 급함. FedRAMP High-Ready |
| **Veracode** | 바이너리·정적 | AI 수정 | 레거시 언어·바이너리 분석, FedRAMP Moderate ATO 보유 | 규제·국방 영역 필수 시 대체 불가 |
| **SonarQube CE** | 룰 기반 | 제한적 | 자체 호스팅 무료, 코드 품질 통합 | 예산 제약 팀의 기본선 |
| **Aikido Security** | 다중 엔진 통합 | 오탐 필터링 | SAST+SCA+DAST+IaC+시크릿, 15분 셋업, 고정 월정액 | SMB 원스톱. 깊이보다 폭 |
| **DryRun Security** | 컨텍스트 분석 | PR 네이티브 강제 | PR/MR에서 코드 정책 강제 | "백로그 리포트"가 아닌 게이트 지향 |

### 6.3 시장 맥락과 포지셔닝 판단

| 티어 | 정의 | 대표 |
|:---|:---|:---|
| Tier 1 | 순수 룰 기반 | SonarQube CE, Semgrep OSS |
| Tier 2 | AI 보조 SAST — 룰 탐지 후 AI가 트리아지·수정 | Snyk Code, Semgrep Pro, Checkmarx One |
| Tier 3 | **AI 네이티브 SAST** — LLM이 1차 탐지 엔진 | **Claude Security**, Codex Security, ZeroPath, CodeAnt AI |

배경 수치로, AI 생성 코드가 엔터프라이즈 개발 워크플로 93%에 등장하고 그중 약 45%가 알려진 결함을 도입한다는 조사, 애플리케이션 취약점 악용 공격이 2026년 44% 증가했다는 Veracode 분석이 인용된다. 즉 Tier 3의 존재 이유는 "AI가 만든 코드의 양과 새로운 취약점 형태를 룰 스캐너가 따라가지 못한다"는 실패 모드다.

**현실적 결론:** Claude Security 플러그인은 Snyk·Semgrep·GHAS의 **대체재가 아니라 상보재**다. 결정적 도구는 재현성·컴플라이언스·공급망을 담당하고, 이 플러그인은 그 도구들이 구조적으로 못 잡는 문맥 의존 논리 결함을 담당한다. 도입 판단의 핵심 질문은 "무엇을 뺄까"가 아니라 **"기존 스택에 추가할 만한 한계 탐지율이 토큰 비용을 정당화하는가"** 이며, 추가 벤더 계약이 필요 없으므로 그 검증 비용 자체는 매우 낮다.

---

## 7. Getting Started

### 7.1 사전 요건 체크

| 항목 | `claude-security` | 확인 명령 |
|:---|:---|:---|
| Claude Code CLI | v2.1.154 이상 | `claude --version` |
| 플랜 | 유료 플랜 필수 | — |
| Dynamic workflows | 활성 필요. Pro는 `/config`의 Dynamic workflows 행에서 켠다 | `/config` |
| Python | 3.9.6 이상, `PATH`에 `python3`로 노출. 표준 라이브러리만 사용하므로 추가 설치 없음 | `python3 --version` |
| OS | Linux, macOS, Windows | — |
| Git | 변경 스캔·패치 생성에 필요 (다른 VCS 미지원). 전체 스캔은 VCS 없이도 가능 | `git --version` |

`security-guidance`를 함께 도입한다면 추가로:

| 항목 | 요건 |
|:---|:---|
| CLI | v2.1.144 이상 |
| Python | 3.7 이상. **에이전틱 커밋 리뷰는 3.10 이상.** Bedrock·Google Cloud Agent Platform 등 서드파티 프로바이더 사용 시 모든 모델 기반 리뷰가 3.10 이상 요구. 선호 순서는 `python3.13`~`python3.10` → `python3` → `python` → `py -3` |
| 첫 실행 | `~/.claude/security/`에 venv 생성 + Claude Agent SDK 설치 → `pip`와 네트워크 접근 필요 |
| Git | end-of-turn·commit 리뷰는 git 상태에 diff하므로 저장소 밖에서는 조용히 스킵. per-edit 검사는 어디서나 동작 |

### 7.2 설치

Claude Code 세션에서 공식 Anthropic 마켓플레이스로부터 설치한다.

```text
/plugin install claude-security@claude-plugins-official
/reload-plugins
```

`security-guidance`도 함께:

```text
/plugin install security-guidance@claude-plugins-official
/reload-plugins
```

**설치 스코프**는 `user`를 선택한다. 사용자 설정에 기록되어 이 머신의 모든 신규 로컬 세션에서 자동 로드된다.

문제 발생 시:

| 증상 | 조치 |
|:---|:---|
| `Marketplace "claude-plugins-official" not found` | `/plugin marketplace add anthropics/claude-plugins-official` 후 재시도 |
| 마켓플레이스에 플러그인이 없다고 보고 | 로컬 사본이 낡음. `/plugin marketplace update claude-plugins-official` 후 재시도 |
| `/plugin`을 쓸 수 없는 환경 | 데스크톱 앱: 프롬프트 옆 **+** → Plugins → Add plugin. 웹·클라우드 세션: `.claude/settings.json`에 선언 |

`/reload-plugins`는 재시작 없이 대기 중 변경을 적용한다.

### 7.3 팀·클라우드 세션 전개

사용자 스코프 플러그인은 Claude Code 웹 세션으로 이어지지 않는다(Anthropic 인프라에서 실행되므로). 저장소를 클론하는 모든 인원에게 켜려면 체크인 설정에 선언한다.

```json
{
  "enabledPlugins": {
    "security-guidance@claude-plugins-official": true,
    "claude-security@claude-plugins-official": true
  }
}
```

관리자는 managed settings의 `enabledPlugins`로 조직 전역 활성화가 가능하다.

### 7.4 첫 스캔 (Happy Path)

```text
1) /claude-security  →  "Scan codebase" 선택
2) 스캔 범위 선택
   - 플러그인이 먼저 저장소를 읽고, 전체 또는 집중 영역을 파일 수·상대 비용과 함께 제시
   - 판단이 어려우면 "I don't know" 응답 → 저장소 규모에 맞는 기본값 자동 선택
3) 실행 확인
   - 시간이 오래 걸리고 토큰을 상당히 쓰며 완료까지 Claude Code를 열어둬야 함
   - 확인 전에는 아무것도 실행되지 않음
4) 진행 관찰
   - 각 단계 시작 시 보고. 상세는 /workflows 에서 확인
5) 리포트 확인
   - CLAUDE-SECURITY-<timestamp>/ 디렉터리 생성
6) /claude-security  →  "Suggest patches" → 처리할 발견 선택
7) 수락한 패치만 git apply, PR 1개당 1패치
```

권장: **auto mode** 활성화. 스캔 에이전트가 단계마다 권한 프롬프트에 막히지 않는다. 작업 시작 시 플러그인이 활성 방법을 안내한다.

### 7.5 변경분만 스캔 (일상 워크플로)

브랜치에 base에 없는 커밋이 있으면 메뉴가 해당 diff만 스캔하도록 제안한다.

```text
/claude-security scan my branch
/claude-security          → "scan commit abc1234"
```

| 제약 | 내용 |
|:---|:---|
| 커밋된 변경만 | 진행 중 편집은 먼저 commit 또는 stash. 아니면 전체 스캔(작업 트리를 읽음) 사용 |
| Git 필수 | 변경 스캔은 git 저장소 필요. 버전관리 없는 디렉터리는 전체 스캔만 가능 |
| PR 조회 | 열린 PR 찾기가 **유일한 네트워크 접근 단계**. 세션이 GitHub CLI 실행 권한을 이미 갖고 `gh`가 로그인된 경우에만 제공 |

### 7.6 대형 저장소 스코핑

전체 트리를 한 번에 돌리지 말고 영역별로 나눈다. 플러그인이 제시하는 집중 스코프(API 레이어, 인증 코드 등) 중 하나를 고르면 실행 규모가 그에 맞춰 조정된다. 리포트의 coverage 섹션이 검사된 것과 안 된 것을 명시한다. 다른 영역은 언제든 별도 스캔한다.

### 7.7 리포트 읽는 순서

```text
1. CLAUDE-SECURITY-REVISION-<commit>.json
   → verification.status 가 verified 인지 먼저 확인. unverified면 사유를 읽는다
   → 파일명에 -dirty 가 붙었는지 확인 (미커밋 코드가 섞인 스캔)
   → effort tier 확인. low/medium 이면 Adversarial 페이즈 미실행

2. CLAUDE-SECURITY-RESULTS.md 의 coverage 섹션
   → 무엇이 스캔되지 않았고 그 이유가 무엇인지

3. 발견 목록
   → severity × confidence 로 정렬
   → confidence: high = 3/3 만장일치, medium = 2/3 정족수
   → 각 발견의 CWE, 싱크 라인, 전제조건, exploit scenario 검토

4. CLAUDE-SECURITY-RESULTS.jsonl
   → 티켓 시스템·대시보드 파이프라인 연결
```

감사 추적이 필요하면 디렉터리의 `.gitignore` 하나를 삭제하고 커밋한다. 사내 배포 시 리포트가 취약점 위치를 그대로 담고 있으므로 **TLP:AMBER 이상 취급**을 권한다.

### 7.8 트러블슈팅

| 증상 | 원인·조치 |
|:---|:---|
| `/claude-security` 메뉴에 Python 경고 | `python3` 3.9.6+ 필요. 아예 못 찾으면 미설치 경고, 첫 `python3`가 구버전이면 발견된 버전을 명시. 설치하거나 `PATH` 앞에 신버전 배치 후 **새 세션** 시작 |
| "Fable 5's safeguards flagged this message" | Fable 5의 사이버보안 분류기로 일부 활동이 차단되어 Opus로 자동 강등. **정상 동작이며 스캔은 완료됨** |
| `security-guidance` 리뷰가 안 나타남 | `~/.claude/security/log.txt` 확인. (a) git 저장소가 아님 (b) Anthropic 인증·서드파티 프로바이더 없음 → 모델 기반 리뷰 스킵, per-edit만 동작 (c) `security-patterns.yaml`은 있으나 PyYAML import 불가 → 파일 무시, `.json` 사용 |
| 패치가 나오지 않고 노트만 옴 | 독립 검증자가 3주장을 보증하지 못함. 노트의 사유 확인 후 수동 수정 |
| 발견이 스킵됨 | 해당 코드가 변경되어 리포트가 stale. 재스캔 |

### 7.9 제거

```text
# claude-security
/plugin  →  uninstall
claude plugin uninstall claude-security

# security-guidance
/plugin disable security-guidance@claude-plugins-official     # 일시 정지
/plugin uninstall security-guidance@claude-plugins-official   # 사용자 스코프 제거
```

프로젝트 `.claude/settings.json`으로 활성화된 경우 `/plugin`에서 비활성화하면 체크인 파일을 수정하지 않고 `.claude/settings.local.json`에 오버라이드를 쓴다. 본인만 꺼지고 팀원은 영향받지 않는다. 같은 대화상자에서 공유 설정에서 제거해 전원 제거도 가능하나 v2.1.203 이상이 필요하다. managed settings로 활성화된 경우 관리자만 비활성화할 수 있다.

---

## 8. 도입 권고 시나리오

| 조직 상황 | 권고 |
|:---|:---|
| Claude Code 이미 사용, AppSec 도구 없음 | `security-guidance` 즉시 전개(무료). `claude-security`는 릴리스 전 브랜치 스캔부터 |
| 기존 SAST 운영 중 | 기존 스택 유지. `claude-security`를 인증·인가·결제 등 고위험 컴포넌트에 한정 투입해 한계 탐지율 측정 |
| GitHub Enterprise 중심 | GHAS + Copilot Autofix가 PR 루프에서 우위. `claude-security`는 GHAS가 놓치는 논리 결함용 2차 |
| GitLab / Bitbucket / 사설망 | 매니지드 SaaS가 닿지 못하는 영역. 플러그인의 로컬 실행이 구조적 이점 |
| 규제·감사 대응 필수 | 결정적 SAST(Veracode·Checkmarx) 필수 유지. 비결정성 때문에 단독 증빙 불가 |
| 외부·미지 코드 감사 | 반드시 `sandbox-runtime` 또는 VM에서. 플러그인은 자체 격리를 제공하지 않는다 |
| Enterprise, 상시 모니터링 필요 | 매니지드 Claude Security 제품 검토 (웹훅, 스케줄 스캔, 기각 이력 승계) |

### 최소 운영 절차 제안

```text
[일상]   security-guidance 상시 활성 (무료, 자동)
[PR 전]  /claude-security scan my branch  (변경분 한정, medium effort)
[스프린트] 고위험 컴포넌트 1개 전체 스캔 (high effort) → 리포트 커밋해 감사 추적
[릴리스] 기존 SAST + SCA + 시크릿 스캔 (결정적 게이트)
[분기]   저장소 전체 순회 스캔 (max effort), 리비전 스탬프로 이력 관리
```

---

## 9. 출처

| 구분 | URL |
|:---|:---|
| Claude Security 플러그인 공식 문서 | https://code.claude.com/docs/en/claude-security |
| security-guidance 플러그인 공식 문서 | https://code.claude.com/docs/en/security-guidance |
| Claude Security 제품 페이지 | https://claude.com/product/claude-security |
| 플러그인 소스 (claude-security) | https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-security |
| 플러그인 소스 (security-guidance) | https://github.com/anthropics/claude-plugins-official/tree/main/plugins/security-guidance |
| 샌드박스 런타임 | https://github.com/anthropic-experimental/sandbox-runtime |
| 자동 보안 리뷰 지원 문서 | https://support.claude.com/en/articles/11932705-automated-security-reviews-in-claude-code |
| 보안 리뷰 GitHub Action | https://github.com/anthropics/claude-code-security-review |

Beta 제품이므로 기능·출력 스키마·요구사항은 변경될 수 있다. 자동화 파이프라인을 붙이기 전에 공식 문서로 재확인할 것.
