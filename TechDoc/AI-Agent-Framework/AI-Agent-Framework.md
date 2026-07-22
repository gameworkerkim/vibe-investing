<!--
---
title: "AI 에이전트 프레임워크 지도: Microsoft Agent Framework for Go와 LangChain·LangGraph"
title_en: "Mapping AI Agent Frameworks: Microsoft Agent Framework for Go vs LangChain / LangGraph"
subtitle: "에이전트 오케스트레이션 프레임워크의 컨셉, 경쟁 구도, 그리고 실제로 돌아가는 Getting Started"
description: "Microsoft Agent Framework for Go와 LangChain·LangGraph를 축으로 AI 에이전트·멀티에이전트 오케스트레이션 프레임워크의 구조, 장단점, 선택 기준과 실행 가능한 시작 코드를 정리했다."
abstract: |
  에이전트 프레임워크 시장은 2025년 10월 LangChain/LangGraph 1.0, 2026년 4월 Microsoft Agent Framework 1.0 GA를 거치며 "실험 도구"에서 "런타임"으로 성격이 바뀌었다.
  다만 언어별 성숙도 격차는 크다. MAF의 .NET/Python은 GA지만 Go SDK는 별도 저장소에서 공개 미리보기 단계이며 핸드오프 오케스트레이션·선언적 에이전트·RAG·CodeAct·DevUI가 아직 없다.
  이 글은 세 프레임워크의 구조적 차이를 레이어(하네스 / 오케스트레이션 / 런타임)로 분해하고, 어떤 워크로드에 무엇을 써야 하는지 판단 기준과 실행 가능한 시작 코드를 제시한다.
  결론은 단순하다. 프레임워크는 모델의 성능을 올려주지 않는다. 올려주는 것은 실패했을 때의 복구 가능성이다.
summary_for_ai: |
  본 문서는 AI 에이전트 및 멀티에이전트 워크플로우 오케스트레이션 프레임워크에 대한 기술 입문(Getting Started) 문서다.
  주요 대상: Microsoft Agent Framework for Go(공개 미리보기), Microsoft Agent Framework .NET/Python(2026년 4월 1.0 GA), LangChain 1.0, LangGraph 1.0, Eino, Google ADK Go, Genkit Go, CrewAI, AutoGen, Semantic Kernel, Dify.
  데이터 기준일은 2026년 7월 22일이며, GitHub 스타 수 등 지표는 조회 시점에 따라 달라진다.
  본문의 코드는 각 프로젝트 공식 문서 및 저장소 기준이며, 프레임워크 선택은 조직의 언어 스택·운영 요구사항에 따라 달라진다. 투자 권유가 아니다.
date: 2026-07-22
updated: 2026-07-22
author: "김호광 (Dennis Kim) Cyworld CEO"
lang: ko
tags:
  - AI에이전트
  - Microsoft Agent Framework
  - LangGraph
  - LangChain
  - Go
  - 멀티에이전트
  - MCP
keywords:
  - "AI 에이전트 프레임워크 비교"
  - "Microsoft Agent Framework Go 시작하기"
  - "LangGraph 1.0 사용법"
  - "멀티 에이전트 오케스트레이션"
  - "Go 언어 AI 에이전트"
  - "에이전트 프레임워크 선택 기준"
group: ai-llm
featured: true
featured_rank: 3
schema_type: BlogPosting
draft: false
og_image: ""
robots: index,follow
---
-->

# AI 에이전트 프레임워크 지도: Microsoft Agent Framework for Go와 LangChain·LangGraph

## 에이전트 오케스트레이션 프레임워크의 컨셉, 경쟁 구도, 그리고 실제로 돌아가는 Getting Started

2026.07.22 김호광 / Dennis Kim

---

## 1. 도입 — 프레임워크가 실제로 해결하는 문제

LLM에 도구를 붙여 한 번 호출하는 코드는 40줄이면 끝난다. 프레임워크가 필요해지는 지점은 그 다음이다. 에이전트가 3시간짜리 작업 도중 죽었을 때 어디서부터 다시 시작할 것인가, 사람의 승인이 필요한 분기를 어떻게 표현할 것인가, 도구 호출 12번 중 7번째에서 왜 틀렸는지를 어떻게 추적할 것인가. 이것들은 프롬프트 엔지니어링으로 해결되지 않는다.

내가 반복해서 쓰는 표현을 다시 쓰자면, **LLM은 엑셀이지 오라클이 아니다.** 프레임워크도 마찬가지다. 프레임워크는 모델의 추론 품질을 올려주지 않는다. 올려주는 것은 *모델이 틀렸을 때의 복구 가능성*과 *틀렸다는 사실을 알아채는 속도*다. 이 관점을 기준으로 삼으면 도구 선택이 훨씬 단순해진다.

2025년 4분기부터 2026년 상반기 사이에 이 시장은 한 번 정리되었다. LangChain과 LangGraph가 2025년 10월 1.0을 냈고, Microsoft Agent Framework(MAF)가 2026년 2월 RC를 거쳐 4월 .NET/Python 1.0 GA에 도달했다. AutoGen과 Semantic Kernel은 MAF로 흡수되는 경로에 올랐다. 즉 지금은 프레임워크를 고르는 시점이 아니라, **어느 레이어를 프레임워크에 맡길지 고르는 시점**이다.

---

## 2. 개념 정리 — 에이전트 스택의 세 레이어

프레임워크들이 서로 비교 불가능해 보이는 이유는 다루는 레이어가 다르기 때문이다. 먼저 층을 나눈다.

| 레이어 | 하는 일 | 없으면 생기는 문제 | 대표 구현 |
| --- | --- | --- | --- |
| **L1. 에이전트 하네스** | 모델 호출 → 도구 호출 → 결과 주입 → 재호출 루프, 구조화 출력, 재시도 | 직접 짜도 됨(수십 줄). 다만 스트리밍·토큰 회계·에러 분기가 붙으면 금방 수백 줄 | LangChain `create_agent`, MAF `agent`, Eino ADK |
| **L2. 오케스트레이션** | 다중 에이전트 그래프, 조건부 라우팅, 병렬·순차·그룹 협업, 서브워크플로우 | 에이전트 간 상태 전달이 전역 딕셔너리로 퇴화. 디버깅 불가 | LangGraph, MAF `workflow`, CrewAI Flows |
| **L3. 런타임 / 운영** | 체크포인팅, 재시작, 지속 실행, HITL 인터럽트, 관측성(OTel), 배포 | 장시간 작업이 프로세스 재시작 한 번에 전부 소실 | LangGraph 지속 실행, MAF 체크포인팅, Foundry Hosted Agents |

핵심은 **L3가 진짜 해자(moat)**라는 점이다. L1은 누구나 짤 수 있고 L2는 코드로 표현 가능하지만, "서버가 죽어도 3일짜리 승인 워크플로우가 이어진다"는 성질은 직접 구현하면 사실상 작업 큐 + 상태 저장소 + 멱등성 설계를 새로 만드는 일이 된다.

### 2.1 프레임워크를 안 쓰는 선택지도 정당하다

Go 커뮤니티에서 특히 강한 반론이 있다. 에이전트 루프 자체는 짧고, OpenAI·Anthropic·Google 모두 공식 Go SDK를 제공하며, Go 엔지니어는 관례적으로 표준 라이브러리 + 소수 의존성을 선호한다. 실제로 mid-2026 기준 다수의 Go 팀은 프레임워크를 쓰지 않는다.

여기에 보안 관점이 하나 더 붙는다. 멀티 프로바이더 SDK는 **모든 프로바이더의 API 키가 한 곳에 모이는 지점**이다. 의존성 트리가 곧 공격 지점이 되고 있다.

| 프로젝트 | 대략적 의존성 수(2026-04 시점 커뮤니티 측정) |
| --- | --- |
| LangChainGo | 170+ |
| Genkit Go | 129 |
| Eino | 37 |
| 경량 SDK(GoAI 등) | 2~5 |

2025~2026년의 LiteLLM 패키지 변조 사건, npm axios 공급망 침해 사례를 겪은 뒤라면 이 표는 단순한 참고 수치가 아니다. CTI 관점에서 에이전트 프레임워크 도입은 **런타임 편의성과 공급망 노출을 맞바꾸는 결정**이다.

---

## 3. Microsoft Agent Framework for Go

> 저장소: `github.com/microsoft/agent-framework-go` · 라이선스 MIT · 언어 Go 100%

### 3.1 요약

MAF는 .NET·Python·Go를 아우르는 다언어 오픈소스 프레임워크로, 프로토타입을 넘어 **프로덕션에서 운영되는 에이전트**를 목표로 한다. Microsoft Foundry, Azure OpenAI, OpenAI, MCP, A2A, AG-UI, GitHub Copilot SDK 등 폭넓은 생태계를 지원한다.

중요한 구조적 사실이 하나 있다. **Go 구현은 .NET/Python 본류 저장소와 분리되어 별도 저장소에서 발전 중이며, 공개 미리보기(public preview) 상태다.** 즉 "MAF 1.0 GA"라는 헤드라인은 .NET/Python 이야기이지 Go 이야기가 아니다. 이 구분을 놓치면 도입 계획에서 기능이 많이 부족하기 때문에 실망하게 된다.

| 항목 | .NET / Python | Go |
| --- | --- | --- |
| 상태 | 1.0 GA (2026-04) | 공개 미리보기 |
| 저장소 | `microsoft/agent-framework` | `microsoft/agent-framework-go` (별도) |
| 제품 통합 폭 | 넓음 | 좁음 |
| 미구현 기능 | 대부분 해소 | 다수 존재(§3.3) |

### 3.2 장점

1. **Go의 런타임 특성을 그대로 활용** — 고루틴 기반 동시성, 낮은 메모리 풋프린트, 단일 바이너리 배포. 에이전트 워크로드는 본질적으로 장시간·동시·I/O 바운드이므로 Go의 형태와 잘 맞는다.
2. **운영 기능이 프레임워크에 내장** — 체크포인팅, 재시작 가능성, 스트리밍, 휴먼 인 더 루프(HITL), 타임트래블 패턴을 워크플로우 계층에서 제공.
3. **그래프 기반 오케스트레이션** — 순차·동시·그룹 협업·조건부 라우팅·서브워크플로우를 지원.
4. **미들웨어 체인** — 요청/응답 처리, 로깅, OpenTelemetry, 컨텍스트 프로바이더, **도구 승인(tool approval)**, 자동 도구 호출. 도구 승인 미들웨어는 보안 관점에서 특히 의미가 크다(§7 참조).
5. **관측성 1급 지원** — 에이전트와 워크플로우 양쪽에 OpenTelemetry 통합 제공.
6. **프로바이더 유연성** — 특정 LLM 벤더에 종속되지 않아 아키텍처 재작성 없이 교체 가능.
7. **Agent Skills** — 파일·인라인 정의·스크립트로 도메인 지식베이스를 구성해 에이전트가 발견·사용.
8. **MIT 라이선스** — 상업적 활용 제약이 낮다.

### 3.3 단점과 한계

미구현 목록이 짧지 않다. 저장소 README와 .NET–Go 기능 비교 문서 기준으로 정리하면 다음과 같다.

| 미구현 기능 | 영향 |
| --- | --- |
| **핸드오프 오케스트레이션** | 에이전트 간 제어권 이양 패턴을 직접 구현해야 함. 고객 응대형 라우팅 시나리오에 직접 타격 |
| **선언적 에이전트** | YAML/JSON 설정 기반 에이전트 정의 불가 → 코드 배포 없이 에이전트 수정 불가 |
| **RAG** | 검색 증강 파이프라인을 별도 구성해야 함 |
| **CodeAct** | 코드 실행 기반 액션 미지원 |
| **Functional workflows** | 함수형 워크플로우 스타일 미지원 |
| **Foundry 호스팅 배포** | Foundry에 직접 배포 불가 (컨테이너 등 우회 필요) |
| **DevUI / AF Labs** | 개발자 UI·실험 기능 부재 → 로컬 디버깅 경험이 Python 대비 떨어짐 |

추가로 고려할 점

- **생태계 성숙도** — .NET 대비 제품 통합이 적고 API 표면이 아직 움직인다. 미리보기 단계에서 브레이킹 체인지 가능성을 전제해야 한다.
- **커뮤니티 규모가 작다** — 아래 팩트체크 참조.
- **서드파티 시스템 책임 전가** — Azure Direct 모델이 아닌 외부 서버·에이전트·모델을 쓰면 데이터 흐름, 비용, 규정 준수 책임은 전적으로 사용자에게 있다. Microsoft 문서가 이를 명시한다.
- **`DefaultAzureCredential` 함정** — 개발 편의용이다. 프로덕션에서는 관리 ID 등 구체적 자격 증명을 지정해야 한다. 폴백 메커니즘이 순차 탐색을 수행하면서 지연 시간이 늘고, 의도치 않은 자격 증명이 선택될 보안 위험이 있다.

### 3.4 팩트체크 — 유통되는 수치에 오류가 있다

여러 요약본에서 이 저장소를 두고 "스타 360개, 기여자 14명"이라고 서술하는 경우가 있다. **2026년 7월 저장소 페이지 직접 확인 결과 스타 약 16, 포크 1, 기여자 3명, 커밋 406개, 릴리스 미발행이다.** 360이라는 숫자는 본류 `microsoft/agent-framework` 저장소(수만 단위) 또는 다른 프로젝트와 혼동된 것으로 보인다.

이 차이는 사소하지 않다. 스타 16과 스타 360은 **"내가 이슈를 올렸을 때 답이 오는가"**에 대해 전혀 다른 예측을 준다. 커뮤니티 규모를 근거로 도입을 결정한다면 반드시 저장소를 직접 확인하기 바란다.

> 지표는 조회 시점에 따라 변한다. 위 수치의 기준일은 2026년 7월이며, 인용 시 기준일을 함께 표기할 것을 권한다.

---

## 4. LangChain 1.0 / LangGraph 1.0

### 4.1 1.0 이후 역할 분담이 명확해졌다

2025년 10월의 1.0 릴리스에서 두 프로젝트의 관계가 재정의되었다. 이전에는 "LangChain을 쓰다가 부족하면 LangGraph로 간다"는 구도였지만, 지금은 **LangChain이 LangGraph 런타임 위에 올라간 상위 추상**이다.

| 구분 | LangChain 1.0 | LangGraph 1.0 |
| --- | --- | --- |
| 레이어 | L1 (에이전트 하네스) | L2 + L3 (오케스트레이션 + 런타임) |
| 핵심 API | `create_agent` | `StateGraph`, 체크포인터, `interrupt` |
| 지향 | 빠르게 만들고 출시 | 세밀한 제어와 내구성 |
| 실행 모델 | 표준 도구 호출 루프 | 그래프 기반 실행(분기·루프·상태 재방문) |
| 안정성 약속 | 2.0 전까지 브레이킹 체인지 없음 | 동일 |
| 언어 | Python, TypeScript | Python, TypeScript |

LangChain 1.0은 코어 에이전트 루프에 집중하도록 재작성되었고, **미들웨어**라는 개념을 새로 도입해 HITL·요약·PII 마스킹을 내장 미들웨어로 제공한다. 구조화 출력은 메인 루프에 통합되어 추가 LLM 호출이 사라지면서 지연 시간과 비용이 줄었다.

LangGraph 1.0은 "내구성 있는 에이전트 프레임워크 영역의 첫 안정 메이저 릴리스"를 표방한다. 유일한 주요 변경은 `langgraph.prebuilt` 폐기이며 기능은 `langchain.agents`로 이동했다. 하위 호환은 유지된다.

### 4.2 LangGraph의 결정적 강점 — 내구성 있는 실행

LangGraph를 쓰는 이유는 사실상 하나로 수렴한다. **상태가 자동으로 지속된다는 것.** 서버가 대화 중간에 재시작되거나 장시간 워크플로우가 중단되어도 중단 지점에서 정확히 재개된다. 커스텀 DB 로직 없이 저장·재개가 되므로, 며칠에 걸친 승인 프로세스나 세션을 넘나드는 백그라운드 작업을 표현할 수 있다.

HITL도 1급 API다. 사람의 검토·수정·승인을 위해 실행을 일시 정지시키는 것이 `interrupt` 한 줄로 끝난다. 고위험 판단에 사람을 개입시키는 시스템에서는 이 한 줄이 아키텍처 전체를 좌우한다.

### 4.3 장점

1. **압도적 생태계** — 통합 수, 문서, 예제, 스택오버플로 답변, 채용 시장 모두에서 1위. 월 수천만 회 다운로드 규모.
2. **프로덕션 레퍼런스** — Uber, LinkedIn, Klarna, J.P. Morgan 등이 LangGraph를 운영에 사용한다고 공개했다.
3. **결정론과 에이전시의 혼합 표현** — 실제 시스템은 100% 에이전틱하지도, 100% 결정론적이지도 않다. 일부 분기는 고정 로직, 일부는 LLM 판단으로 두는 구조를 그래프로 명시적으로 모델링할 수 있다.
4. **LangSmith 연계** — 관측성·평가·배포까지 라이프사이클 도구가 붙는다.
5. **동적 도구 호출** — 실행 지점별로 사용 가능한 도구 집합을 제어.

### 4.4 단점

1. **Python/TypeScript 한정** — Go·Java·Rust 백엔드에는 직접 붙일 수 없다. HTTP 서비스로 분리하거나 언어를 바꿔야 한다.
2. **추상 계층의 무게** — 초기 LangChain은 숨은 프롬프트와 암묵적 컨텍스트 조작으로 "커스터마이징 벽"을 만들었다는 비판을 받았다. 1.0이 이를 상당 부분 해소했으나, 여전히 프레임워크가 무엇을 하는지 읽어야 하는 부담이 있다.
3. **의존성 부피** — 공급망 관점에서 가볍지 않다.
4. **상업 제품과의 결합** — LangSmith는 오픈소스가 아니다. 관측성을 온전히 쓰려면 상용 경로에 들어간다. 자체 OTel 스택으로 대체 가능하지만 통합 품질은 차이가 난다.
5. **학습 곡선의 위치가 다르다** — LangChain은 쉽고 LangGraph는 어렵다. 상태 스키마, 리듀서, 체크포인터, 스레드 개념을 이해해야 한다.

---

## 5. 경쟁 프로젝트 전체 맵

### 5.1 언어·레이어별 배치

| 프로젝트 | 언어 | 주 레이어 | 상태(2026-07) | 한 줄 특징 |
| --- | --- | --- | --- | --- |
| **Microsoft Agent Framework** | C#, Python | L1~L3 | 1.0 GA (2026-04) | SK·AutoGen의 후계. 엔터프라이즈 거버넌스 지향 |
| **Microsoft Agent Framework for Go** | Go | L1~L3 | 공개 미리보기 | 위의 Go 구현. 기능 격차 존재 |
| **LangGraph** | Python, TS | L2~L3 | 1.0 GA (2025-10) | 내구성 있는 상태 그래프 런타임. 사실상 표준 |
| **LangChain** | Python, TS | L1 | 1.0 GA (2025-10) | 가장 빠른 에이전트 구축 경로 |
| **AutoGen** | Python | L2 | MAF로 통합 경로 | 다중 에이전트 대화·협업 연구에서 출발 |
| **Semantic Kernel** | C#, Python, Java | L1~L2 | MAF로 통합 경로 | 경량 오케스트레이션 SDK. 마이그레이션 도구 제공 |
| **CrewAI** | Python | L2 | 활발 | 역할(role) 기반 협업 + 이벤트 기반 Flows |
| **Google ADK** | Python, **Go**, Java | L1~L2 | Go 1.0 (2025-11) | 순차·병렬·루프 에이전트 프리미티브, 네이티브 OTel |
| **Genkit** | **Go**, JS | L1 | 프로덕션 지향 | 플로우 중심. 로컬 디버깅·트레이싱 우수 |
| **Eino (CloudWeGo)** | **Go** | L1~L2 | 활발, 대규모 운영 검증 | ByteDance 실사용. 컴포넌트 그래프, 서킷 브레이커·백오프 |
| **LangChainGo** | **Go** | L1 | 커뮤니티 포팅 | 가장 넓은 표면적, 본가 대비 지연 |
| **OpenAI Agents SDK** | Python, **Go** | L1 | 활발 | 핸드오프 + 가드레일, MCP 지원 |
| **Dify** | Python(제품) | GUI | 활발 | 노코드 워크플로우·RAG 파이프라인 |

### 5.2 Go 진영 안에서 경쟁자

Go 에이전트 생태계는 "실재하지만 젊다"가 정확한 표현이다. 2026년 5월 시점 커뮤니티 집계 기준 참고 수치:

| 프레임워크 | 스타(대략) | MCP 지원 | 강점 |
| --- | --- | --- | --- |
| Eino | 11,100+ | 미지원(당시 기준) | 프로덕션 하드닝, 그래프 컴포지션 |
| LangChainGo | 9,200+ | 미지원(당시 기준) | 10+ 프로바이더, 완전한 RAG 파이프라인 |
| Google ADK Go | — | 지원 | 1.0 도달, OTel 네이티브 |
| OpenAI Agents Go | 255 | 지원 | 핸드오프 + 가드레일 |
| **MAF for Go** | 약 16 | 지원(MCP/A2A/AG-UI) | Azure·Foundry 정렬, 체크포인팅 |

MCP 통합이 우선순위라면 Google ADK Go나 OpenAI Agents Go, 그리고 MAF Go가 후보다. 순수 처리량과 검증된 안정성이라면 Eino가 강하다. 반면 **Azure Entra ID·Purview·Defender 기반 거버넌스가 요구사항이라면 MAF 외에 대안이 사실상 없다.** 이것이 MAF Go의 스타 수가 적음에도 검토 대상이 되는 유일하고도 충분한 이유다.

---

## 6. 선택 기준 — 어떤 워크로드에 무엇을 쓸 것인가?

### 6.1 판단 순서

```
1) 언어 스택이 고정되어 있는가?
   Go/단일 바이너리 필수 → MAF Go / Eino / ADK Go / 무프레임워크
   Python·TS 가능        → 2)로

2) 실행이 몇 분 이상 지속되거나, 사람 승인이 중간에 끼는가?
   예  → LangGraph (또는 MAF workflow)
   아니오 → 3)으로

3) 조직이 Azure/Entra 거버넌스 경계 안에 있는가?
   예  → MAF (.NET/Python) + Foundry Hosted Agents
   아니오 → LangChain create_agent로 시작, 필요 시 LangGraph로 하강

4) 비개발자가 워크플로우를 수정해야 하는가?
   예 → Dify 등 GUI 계열
```

### 6.2 구체적 사용 예

| 시나리오 | 권장 | 이유 |
| --- | --- | --- |
| 사내 문서 Q&A 봇, 도구 3~5개 | **LangChain `create_agent`** | 하루면 만든다. 그래프가 필요 없다 |
| 3일짜리 다단계 승인 파이프라인 | **LangGraph** | 지속 상태 + `interrupt`. 서버 재시작 내성 |
| 리서치 → 검증 → 리포트 작성 다중 에이전트 | **LangGraph** 또는 **CrewAI** | 그래프 제어가 필요하면 전자, 역할 기반 협업 서술이면 후자 |
| 거래소 시세·주문 흐름을 실시간 감시하는 에이전트 | **Go: MAF Go / Eino / 무프레임워크** | 지연과 GC 압력이 지배 변수. Python 런타임을 크리티컬 패스에 두지 않는다 |
| CTI 수집·정규화·보고서 초안 파이프라인 | **LangGraph + 별도 수집기** | 소스별 실패 격리와 재시도 지점이 명확해야 함 |
| Microsoft 365 / Teams에 배포되는 사내 에이전트 | **MAF (.NET/Python)** | Foundry Hosted Agents, Teams·M365 Copilot 게시 경로 |
| 기존 Semantic Kernel / AutoGen 코드베이스 | **MAF로 마이그레이션** | 공식 마이그레이션 가이드·도구 제공 |
| 비개발 기획자가 직접 프롬프트 체인을 고쳐야 함 | **Dify** | 선언적 GUI. 단 버전 관리와 감사는 별도 설계 필요 |
| 에이전트 로직이 40줄 루프로 충분함 | **프레임워크 없음** | Go 팀에서는 이게 다수파다 |

### 6.3 혼합 배치가 현실적이다

Foundry의 호스팅 런타임은 **프레임워크 비종속**으로 설계되어, MAF·GitHub Copilot SDK·LangGraph 등으로 만든 에이전트를 재작성 없이 배포할 수 있다. 즉 "오케스트레이션은 LangGraph, 호스팅과 거버넌스는 Foundry"라는 조합이 성립한다. 프레임워크 선택을 전부 아니면 전무의 문제로 두지 않는 것이 실무적으로 유리하다.

---

## 7. 초보자를 위한 사용법 - Getting Started

### 7.1 Microsoft Agent Framework for Go

**설치**

```bash
go get github.com/microsoft/agent-framework-go
```

**환경 변수**

```bash
export FOUNDRY_PROJECT_ENDPOINT="<your-endpoint>"
export FOUNDRY_MODEL="gpt-4o-mini"   # 선택
az login                              # 자격 증명 원본 확보
```

**기본 에이전트**

```go
package main

import (
	"cmp"
	"context"
	"fmt"
	"os"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/microsoft/agent-framework-go/provider/foundryprovider"
)

func main() {
	endpoint := os.Getenv("FOUNDRY_PROJECT_ENDPOINT")
	model := cmp.Or(os.Getenv("FOUNDRY_MODEL"), "gpt-4o-mini")

	// Microsoft Foundry 인증
	token, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		panic(err)
	}

	// Foundry 에이전트 생성
	a := foundryprovider.NewAgent(endpoint, token, foundryprovider.ModelDeployment(model),
		foundryprovider.AgentConfig{
			Instructions: "You are a helpful assistant.",
		},
	)

	// 실행
	ctx := context.Background()
	fmt.Println(a.RunText(ctx, "Write a haiku about the Microsoft Agent Framework").Collect())
}
```

**프로덕션 전환 시 반드시 바꿔야 할 한 줄**

```go
// 개발용: 여러 자격 증명 소스를 순차 탐색 → 지연·오탐·보안 위험
token, _ := azidentity.NewDefaultAzureCredential(nil)

// 프로덕션: 사용할 자격 증명을 명시
token, _ := azidentity.NewManagedIdentityCredential(&azidentity.ManagedIdentityCredentialOptions{
	ID: azidentity.ClientID("<user-assigned-client-id>"),
})
```

**다음에 볼 디렉터리**

| 경로 | 내용 |
| --- | --- |
| `examples/01-get-started` | hello world → 워크플로우까지 단계별 |
| `examples/02-agents` | 도구, 미들웨어, 프로바이더, 관측성, A2A, AG-UI, MCP, 스킬 |
| `examples/03-workflows` | 다중 에이전트 패턴, 라우팅, 체크포인팅 |
| `examples/05-end-to-end` | 완성형 애플리케이션 |
| `docs/dotnet-go-sdk-feature-comparison.md` | **도입 전 필독.** .NET 대비 Go 기능 격차 |
| `provider/` | 프로바이더 패키지 목록 (Foundry 외 옵션 확인) |

**트러블슈팅 요약**

| 증상 | 원인 | 조치 |
| --- | --- | --- |
| Azure 자격 증명 인증 실패 | Azure CLI 미로그인 또는 자격 증명 소스 미구성 | `az login` 실행 또는 사용할 자격 증명 명시 구성 |
| API 키 오류 | 키가 틀렸거나 대상 리소스와 불일치 | 키와 해당 리소스·프로바이더 대응 확인 |
| 프로바이더 엔드포인트 오류 | 엔드포인트·배포명·모델·API 버전 누락 또는 오기 | 샘플의 환경 변수와 생성자 옵션 대조 |

---

### 7.2 LangChain 1.0 — 가장 빠른 경로

```bash
pip install --upgrade langchain
```

```python
from langchain.agents import create_agent
from langchain.tools import tool


@tool
def get_close_price(ticker: str) -> str:
    """지정한 티커의 최근 종가를 반환한다."""
    # 실제 구현에서는 데이터 소스 호출
    return f"{ticker}: 조회 결과 없음"


agent = create_agent(
    model="openai:gpt-4.1-mini",
    tools=[get_close_price],
    system_prompt=(
        "너는 시장 데이터 조회 보조다. "
        "도구가 값을 반환하지 않으면 '데이터 없음'이라고 답하라. "
        "절대 수치를 추정해서 만들어내지 마라."
    ),
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "NVDA 최근 종가 알려줘"}]}
)
print(result["messages"][-1].content)
```

시스템 프롬프트의 마지막 문장이 형식적인 문구가 아니다. 도구 실패 시 모델이 그럴듯한 수치를 생성하는 것이 에이전트 시스템에서 가장 흔하고 가장 비싼 실패 모드다. 도구 결과가 비었을 때의 행동을 명시하지 않으면 반드시 발생한다.

---

### 7.3 LangGraph 1.0 — 체크포인트 + 사람 승인

```bash
pip install --upgrade langgraph langchain
```

```python
from typing import Annotated, TypedDict

from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt, Command


class State(TypedDict):
    messages: Annotated[list, add_messages]
    approval: str


llm = init_chat_model("openai:gpt-4.1-mini")


def analyze(state: State):
    """1차 분석 초안 생성"""
    resp = llm.invoke(state["messages"])
    return {"messages": [resp]}


def human_review(state: State):
    """사람의 승인을 기다리며 실행을 중단한다"""
    decision = interrupt(
        {
            "question": "이 판단을 승인합니까?",
            "draft": state["messages"][-1].content,
        }
    )
    return {"approval": decision}


def finalize(state: State):
    if state["approval"] != "approved":
        return {"messages": [{"role": "assistant", "content": "반려됨. 재작성 필요."}]}
    return {"messages": [{"role": "assistant", "content": "승인됨. 배포 큐에 등록."}]}


builder = StateGraph(State)
builder.add_node("analyze", analyze)
builder.add_node("human_review", human_review)
builder.add_node("finalize", finalize)

builder.add_edge(START, "analyze")
builder.add_edge("analyze", "human_review")
builder.add_edge("human_review", "finalize")
builder.add_edge("finalize", END)

# 체크포인터가 지속 실행의 핵심. 프로덕션에서는 Postgres/Redis 체크포인터 사용
graph = builder.compile(checkpointer=InMemorySaver())

config = {"configurable": {"thread_id": "review-001"}}

# 1단계: interrupt 지점에서 멈춘다
for event in graph.stream(
    {"messages": [{"role": "user", "content": "이번 분기 리스크 요약해줘"}]},
    config,
):
    print(event)

# ... 여기서 프로세스가 죽어도 무방하다. 상태는 체크포인터에 남는다 ...

# 2단계: 며칠 뒤 사람이 승인하면 정확히 그 지점부터 재개
final = graph.invoke(Command(resume="approved"), config)
print(final["messages"][-1].content)
```

**여기서 봐야 할 지점 세 가지**

1. `thread_id`가 대화·작업의 정체성이다. 재개는 이 키로 이루어진다.
2. `InMemorySaver`는 예제 전용이다. 프로덕션에서 이걸 그대로 쓰면 지속성이라는 도입 명분 자체가 사라진다.
3. `interrupt` 호출부는 **재개 시 노드 처음부터 다시 실행**된다. 따라서 인터럽트 이전에 부작용(결제, 메일 발송, 주문)을 두면 중복 실행된다. 부작용은 인터럽트 이후 노드로 분리한다.

---

### 7.4 Go에서 프레임워크 없이 — 구조 분석

프레임워크 도입 전에 이 구조를 한 번 손으로 짜보면 프레임워크가 무엇을 대신해 주는지가 명확해진다. 아래는 벤더 SDK에 종속되지 않는 개념의 구조를 가지고 있다.

```go
// 개념 스케치: 실제 타입은 사용하는 벤더 SDK에 맞춰 교체
func RunAgent(ctx context.Context, c ModelClient, tools map[string]Tool, prompt string) (string, error) {
	msgs := []Message{{Role: "user", Content: prompt}}

	for turn := 0; turn < maxTurns; turn++ {
		resp, err := c.Complete(ctx, msgs, toolSpecs(tools))
		if err != nil {
			return "", err
		}
		msgs = append(msgs, resp.Message)

		if len(resp.ToolCalls) == 0 {
			return resp.Message.Content, nil // 종료 조건
		}

		// 동시 실행: Go의 강점이 드러나는 지점
		results := make([]Message, len(resp.ToolCalls))
		var wg sync.WaitGroup
		for i, call := range resp.ToolCalls {
			wg.Add(1)
			go func(i int, call ToolCall) {
				defer wg.Done()
				out, err := tools[call.Name].Invoke(ctx, call.Args)
				results[i] = toolResultMessage(call.ID, out, err) // 에러도 모델에 반환
			}(i, call)
		}
		wg.Wait()
		msgs = append(msgs, results...)
	}
	return "", fmt.Errorf("최대 턴(%d) 초과", maxTurns)
}
```

이 40여 줄에 **없는 것**의 목록이 곧 프레임워크의 존재 이유다. 체크포인팅, 재개, 스트리밍, 토큰 회계, 도구 승인 게이트, OTel 스팬, 서브에이전트 라우팅, 컨텍스트 윈도우 관리. 이 중 필요한 항목이 두세 개 이하라면 직접 짜는 편이 대개 낫다.

---

## 8. 운영 전 체크리스트 — 보안·거버넌스 관점

에이전트 프레임워크는 **LLM에 실행 권한을 부여하는 장치**다. 도입 전에 확인할 항목을 정리했다.

| 영역 | 확인 사항 | 근거 |
| --- | --- | --- |
| **공급망** | 프레임워크의 전이 의존성 수와 서명 검증 체계. Go는 `go.sum` + GOPROXY 투명성 로그가 방어선 | 2025~2026년 다수의 패키지 변조 사례 |
| **MCP 신뢰 경계** | MCP 서버는 외부 코드다. 서버 목록·권한을 화이트리스트로 고정하고 동적 발견을 프로덕션에서 켜지 말 것 | MCP는 도구 설명 자체가 프롬프트 인젝션 벡터 |
| **도구 승인** | 파괴적 작업(파일 삭제, 송금, 배포)은 반드시 승인 미들웨어 뒤로. MAF의 tool approval, LangChain HITL 미들웨어 사용 | 자동 도구 호출이 기본값인 프레임워크가 다수 |
| **자격 증명** | 폴백형 자격 증명(`DefaultAzureCredential` 등) 금지. 관리 ID 등 명시 지정 | Microsoft 공식 권고 |
| **데이터 경계** | 서드파티 모델·에이전트 사용 시 데이터가 조직의 컴플라이언스·지리적 경계를 벗어나는지 검토. 책임은 사용자에게 있음 | MAF 문서 명시 |
| **관측성** | OTel 스팬에 프롬프트·응답 원문이 실릴 수 있다. 마스킹 정책 선행 | PII·영업비밀 유출 경로 |
| **부작용 멱등성** | 재개·재시도 시 중복 실행되는 작업이 없는지 | §7.3 참조 |
| **버전 고정** | 미리보기 상태 SDK는 커밋 단위 고정 권장 | MAF Go는 릴리스 태그 미발행 |

---

## 9. 정리

어떤 솔루션을 사용할지는 다음의 관점으로 선택하라.

1. **레이어를 먼저 정하라.** 필요한 것이 도구 루프(L1)인지, 그래프(L2)인지, 내구성 있는 런타임(L3)인지 구분하면 후보가 두세 개로 줄어든다. 대부분의 팀이 실제로 원하는 것은 L3이며, 이것만은 직접 만들기 비싸다.

2. **언어가 결정을 지배한다.** Python·TS면 LangGraph가 현실적 기본값이고, .NET이면 MAF가 기본값이다. Go라면 선택지가 얇다. MAF Go는 방향성은 옳지만 2026년 7월 현재 공개 미리보기이고, 핸드오프·선언적 에이전트·RAG·CodeAct·DevUI가 없으며 커뮤니티가 매우 작다. Azure 거버넌스가 요구사항이 아니라면 Eino나 ADK Go, 혹은 프레임워크 없는 구현이 더 안전한 선택일 수 있다.

3. **프레임워크는 성능이 아니라 실패 처리를 산다.** 도입 검토 문서에 "성능이 좋아진다"고 적혀 있다면 그 문서는 틀렸다. 올바른 문장은 "실패가 관측 가능해지고 복구 가능해진다"이다. LLM은 엑셀이지 오라클이 아니고, 프레임워크는 그 엑셀을 감사 가능한 스프레드시트로 만드는 도구다.

MAF Go에 대한 실무적 권고는 다음과 같다. **지금은 파일럿과 기술 검증(PoC) 단계에 두고, `docs/dotnet-go-sdk-feature-comparison.md`에서 자신의 필수 기능이 구현되어 있는지 먼저 확인할 것.** 핸드오프 오케스트레이션이 요구사항에 포함되어 있다면 현재로서는 도입 대상이 아니다.

---

## 부록 A. 참고 링크

| 항목 | URL |
| --- | --- |
| Microsoft Agent Framework for Go | https://github.com/microsoft/agent-framework-go |
| .NET–Go 기능 비교 문서 | https://github.com/microsoft/agent-framework-go/blob/main/docs/dotnet-go-sdk-feature-comparison.md |
| Go 레퍼런스 | https://pkg.go.dev/github.com/microsoft/agent-framework-go |
| MAF 본류(.NET/Python) | https://github.com/microsoft/agent-framework |
| MS Learn 문서 | https://learn.microsoft.com/agent-framework/ |
| Agent Framework 개발 블로그 | https://devblogs.microsoft.com/agent-framework/ |
| LangChain·LangGraph 1.0 발표 | https://blog.langchain.com/langchain-langgraph-1dot0/ |
| LangGraph 1.0 체인지로그 | https://changelog.langchain.com/announcements/langgraph-1-0-is-now-generally-available |
| Eino (CloudWeGo) | https://github.com/cloudwego/eino |
| Foundry Build 2026 요약 | https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-build-2026/ |

## 부록 B. 용어 대조표

| 약어 | 원어 | 의미 |
| --- | --- | --- |
| MAF | Microsoft Agent Framework | Microsoft의 다언어 에이전트 프레임워크 |
| MCP | Model Context Protocol | 모델이 외부 도구를 발견·호출하기 위한 표준 프로토콜 |
| A2A | Agent-to-Agent | 런타임을 넘나드는 에이전트 간 메시징 프로토콜 |
| AG-UI | Agent-GUI protocol | 에이전트와 사용자 인터페이스 간 상호작용 프로토콜 |
| HITL | Human-in-the-Loop | 실행 중 사람의 검토·승인을 삽입하는 패턴 |
| OTel | OpenTelemetry | 분산 추적·메트릭 수집 표준 |
| SK | Semantic Kernel | Microsoft의 이전 세대 오케스트레이션 SDK |
| GA | General Availability | 정식 출시. 프로덕션 지원 대상 |

---

*데이터 기준일: 2026년 7월 22일. GitHub 지표와 프레임워크 기능 목록은 빠르게 변한다. 인용 시 기준일을 함께 표기하고, 도입 결정 전 저장소를 직접 확인하기 바란다.*

*본 글은 기술 정보 제공 목적이며 특정 제품의 도입 권유나 투자 권유가 아니다.*
