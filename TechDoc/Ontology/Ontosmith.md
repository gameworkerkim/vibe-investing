# OntoSmith — 프로젝트 분석

> 문서에서 **통제된(governed) 지식 그래프**를 만드는 온톨로지 우선 파이프라인
>
> - 저장소: https://github.com/Dongbumlee/ontosmith
> - 프로젝트 사이트: https://dongbumlee.github.io/ontosmith/
> - 라이선스: MIT (Copyright © 2026 Dongbum Lee)
> - 상태: README 기준 Release **0.1.1** (PyPI 게시) — 설치 후 `pip show ontosmith`로 실제 버전 확인 권장
> - 토픽: graphrag · information-extraction · knowledge-graph · llm · neo4j · ontology · rag
> - 작성 기준일: 2026-11-08 (README 원문 대조)

---

## 목차

1. [한 줄 요약](#1-한-줄-요약)
2. [프로젝트 설명과 컨셉](#2-프로젝트-설명과-컨셉)
3. [아키텍처와 작동 방식](#3-아키텍처와-작동-방식)
4. [장점](#4-장점)
5. [단점과 리스크](#5-단점과-리스크)
6. [경쟁 프로젝트](#6-경쟁-프로젝트)
7. [설치와 운영 방법](#7-설치와-운영-방법)
8. [명령어 레퍼런스](#8-명령어-레퍼런스)
9. [도입 판단 가이드](#9-도입-판단-가이드)
10. [부록: 기존 요약본 정정 사항](#10-부록-기존-요약본-정정-사항)

---

## 1. 한 줄 요약

**"모델은 제안하고, 심판(Jev)이 결정한다."** 사람이 승인한 평면 스키마 아래에서 LLM이 후보 사실을 제안하고, 결정론적 게이트와 판정 모델 Jev가 기록 여부를 결정하며, 기록된 모든 트리플은 원문 증거 스팬과 출처를 지닙니다. 빠른 데모보다 **그래프 자체를 감사해야 하는 상황**을 위해 만든 도구입니다.

---

## 2. 프로젝트 설명과 컨셉

### 2.1 무엇을 하는 도구인가

OntoSmith는 하나의 파이프라인에서 세 가지를 처리합니다.

1. **온톨로지 설계** — 엔티티·관계 유형, 정의, 경계 예시
2. **그래프 구축** — 승인된 스키마 아래에서 문서로부터 트리플 생성
3. **서빙** — 검색 명령, 샘플 HTTP API, 데모 앱

### 2.2 두 개의 기둥

| 기둥 | 역할 |
|---|---|
| **Jev** | OntoSmith 내부의 판정(decision/judge) 모델. 무엇이 기록될 만큼 참인지 심사 |
| **Neo4j** | 그래프 저장소. 네이티브 그래프 탐색, 벡터 인덱스, 전문 검색을 한 저장소에서 제공 |

빌드에는 **둘 다 필수**입니다.

### 2.3 온톨로지 우선(ontology-first)

대부분의 지식 그래프 도구는 모델이 추출한 결과에서 출발하고, 구조는 추출 과정에서 "창발"합니다. OntoSmith는 순서를 뒤집습니다.

```
스키마 설계 → 사람의 승인 → 그 스키마 아래에서 그래프 구축
```

### 2.4 스키마는 무엇이고, 무엇이 아닌가

OntoSmith의 온톨로지는 **평면 추출 계약(flat extraction contract)** 입니다.

- **포함**: 닫힌 엔티티·관계 유형 목록, 유형별 정의, 경계 예시
- **배제**: 클래스 계층, 상속, 논리 공리, 추론 엔진
- **OWL 온톨로지 편집기가 아님**

평면성은 설계 의도입니다. 유형별 판정 결과가 빌드 품질을 측정 가능하게 만드는데, 계층 구조를 넣으면 바로 그 판정 경계가 흐려진다는 것이 저자의 논리입니다. 목표는 "문서 코퍼스를 검색과 에이전트가 답할 수 있는, 증거가 붙은 통제된 그래프로 바꾸는 것"으로 좁고 구체적입니다.

### 2.5 두 가지 핵심 산출물: 프로파일과 팩

| 산출물 | 설명 | 고정 방식 |
|---|---|---|
| **프로파일(profile)** | **내 코퍼스**에 대한 결정론적 조사 — 문서 목록, 관례, 사람이 먼저 정해야 할 결정 지점. 모델 호출 없음 | 해시 |
| **팩(pack)** | **도메인의 온톨로지를 데이터로** 담은 것 — 유형 목록, 정의, 경계 예시, 임계값, 적합성(conformance) 기록 | sha256, 버전 관리 |

하나의 배치(batch)는 프로파일 하나와 팩 하나를 묶어 실행합니다. 도메인 지식은 **코드 분기가 아니라 팩 안에만** 존재하며, 팩은 로드 시 검증에 실패하면 닫힌 상태로 실패(fail-closed)합니다.

---

## 3. 아키텍처와 작동 방식

### 3.1 6단계 루프

| 단계 | 명령 | 내용 |
|---|---|---|
| 1. Profile | `ontosmith profile` | 코퍼스 결정론적 조사(LLM 없음). 문서 목록, 관례, 결정 지점 |
| 2. Design | `ontosmith ontology` | 프로파일에서 스키마 초안 작성 → 결정론적 검증 → **사람의 명시적 승인 후에만** 해시 고정 팩 발행 |
| 3. Build | `ontosmith batch` | 팩 아래에서 단계별 파이프라인 실행. 측정된 운영점이 기본값. 중단선으로 비용 상한 |
| 4. Inspect | `ontosmith inspect` | 트리플별 증거 스팬과 출처 체인 표시. 빠진 것이 있으면 무엇이 빠졌는지 명시 |
| 5. Verify | `ontosmith verify` | 내 골드셋 감사, 원점수와 보정 점수 산출, 실패 해부(failure anatomy) |
| 6. Serve | `ontosmith search` / `serve` | 청크와 트리플에 대한 하이브리드 검색(벡터 + 어휘 + 그래프) |

### 3.2 배치 파이프라인의 8개 스테이지

```
ingest → NER/roster → candidates → gates → route → write → index → verify
```

- 버전 관리되는 팩 아래에서 실행
- 원장(ledger) 기반 지출 상한 적용
- ROUTE 단계에서 티어(tier)별로 분기

### 3.3 제안과 판정의 분리

파이프라인 전체를 관통하는 원칙은 **"제안 좌석의 말만으로는 아무것도 기록하지 않는다"** 입니다.

1. 저비용 **제안자(proposer)** 모델이 후보를 냄
2. **적합된 쌍 호출(fitted pair call)** 이 열거된 엔티티 쌍을 후보 트리플로 변환
3. **결정론적 게이트**가 형식을 검사
4. 고정된 **Jev 판정 모델**이 기록 여부를 최종 결정

임계값, 열거 윈도, 판정자 설정 같은 운영점은 감으로 정하지 않고 **사전 등록된 측정 게이트**로 선택합니다. 게이트를 통과하지 못한 설정은 꺼진 상태로 남고, 그 기각 기록도 품질 기록에 공개됩니다.

### 3.4 인스펙트 출력 예시

```
Triple  (1 of 7 in examples/triples.jsonl)
  subject   Alder & Finch
  relation  founded by
  object    Mara Alder
Evidence
  [quote] Alder & Finch is a ceramics studio founded in 2011 by Mara Alder and Tomas Finch.
Provenance
  doc_id               alder-finch-history
  tier                 1
  p_true               0.98
```

> ⚠️ `p_true`는 판정자의 **순위 점수**입니다. 정렬과 임계값 설정에 쓰는 값이며, **보정된 확률이 아닙니다.**

### 3.5 레퍼런스 프로파일 (측정에 사용된 모델 바인딩)

공개된 측정치는 아래 바인딩으로 만들어졌고, 이 구성이 기본 프리셋으로 제공됩니다.

| 좌석(Seat) | 역할 | 레퍼런스 바인딩 |
|---|---|---|
| Proposer | 후보 추출. 결정은 하지 않음 | `anthropic/claude-haiku-5.5` |
| Judge (Jev) | 결정 게이트. 고정된 제품 구성요소 | `typesafe/jev-1.13` |
| Escalation | 판정 에스컬레이션. 평가 시 비교 판정자. 빌드 트리플은 결정하지 않음 | `anthropic/claude-sonnet-5.5` |
| Drafting | 스키마·프로파일 초안. 사람 승인 게이트 뒤의 작성 보조 | 바인딩 없이 제공 (직접 지정) |
| Embedder | 인덱싱과 질문 임베딩 | `openai/text-embedding-3-large` |

- **3개 레이어, 5개 좌석**: 판정 레이어는 두 좌석입니다. 적합된 쌍 판정자(제안자와 같은 모델 행 공유)와 고정 Jev 게이트입니다.
- **4개 모델, 키 하나**: 프리셋은 단일 연결 키(OpenRouter)로 네 모델 모두에 접근합니다.
- 이 표는 **요구 사항이 아니라 출처 기록**입니다. 다른 모델과 엔드포인트로 바꾸는 것(커스텀 바인딩)이 가능하며, 실행 기록에 어떤 바인딩으로 돌렸는지 남습니다.
- 팩은 모델 이름이 아니라 **역량 티어**(proposer / judge / escalation)만 선언합니다.
- API 키는 설정 파일에 값으로 넣지 않습니다. 설정에는 환경 변수 이름만 적고, 값은 환경에서 읽습니다.

### 3.6 Neo4j 저장소 정책

- WRITE, INDEX, VERIFY 단계가 Neo4j 안에서 이루어지고 서빙도 Neo4j에서 읽습니다.
- **저장소에는 그래프가 하나만** 있습니다. 현재 빌드의 그래프이며, 이를 만든 온톨로지의 정체성이 찍혀 있습니다.
- 다른 온톨로지로 빌드하면 이전 그래프를 **교체**합니다(나란히 누적하지 않음). 교체 전에 실행 출력에서 이를 알립니다.
- 그래서 검색할 때 범위(scope)를 지정할 필요가 없습니다.
- 예외적으로, **기록된 산출물**(완료된 배치나 동봉 데모)은 Neo4j 없이 파일 기반 저장소에서 서빙할 수 있습니다. 이 경로에서는 어휘 검색과 그래프 검색만 동작하고 벡터 검색은 빠집니다.

### 3.7 비용 가드레일

- **사전 산정**: `ontosmith verify project`가 내 데이터에서 후보 쌍 수를 실제로 세고, 사용자가 `--unit-cost`로 넣은 단가로 비용을 계산합니다. 도구 자체에 단가표를 하드코딩하지 않습니다.
- **중단선(stop-line)**: 상한을 넘게 될 작업 단위는 시작 자체를 거부합니다.
- **재개**: 중단된 배치는 원장에서 이어서 실행해 중복 지출이 없습니다.
- **사전 거부**: 키가 없거나 Neo4j가 응답하지 않으면 첫 스테이지 전에 좌석과 변수 이름을 명시하며 거부하므로 비용이 발생하지 않습니다.

| 실측 비용 | 수치 |
|---|---|
| 4개 문서 데모 서브셋 (고정 오버헤드 포함) | 약 $1~2 |
| 플래그십 빌드 (500개 문서) | 문서당 3.8¢ (키 관측 기준) / 원장 기준 3.7¢ |

### 3.8 도메인 팩

| 팩 | 내용 | 측정 코퍼스 |
|---|---|---|
| **Bio Medical** (`bio-medical`) | 생의학 엔티티·관계 스키마, 적합된 한정자 | BioRED (파일럿 기록, 백서 §5.7) |
| **Legal Contract** (`legal-contract`) | 계약 스키마: 41개 레이블 범주, 역할어·정의어 규칙 | CUAD (승격 기록, 백서 §5.8) |
| **FIBO Contracts** (`fibo-contracts`) | EDM Council의 FIBO(MIT)에서 **가져온** 스키마. FND Agreements 모듈을 기록된 범위 지정 아래 평면화 — 엔티티 15 + 관계 13 유형 | CUAD. 빌더로 발행되어 `emitted_unmeasured` 상태로 시작, 현재는 커버리지 기록만 존재 |
| **Open Domain** (`open-domain`) | 일반 문서용 스키마, 적합된 방향성 선언 | Re-DocRED (플래그십 기록, 백서 §5) |
| **Core** (`core`, 베이스라인) | 모든 신규 코퍼스의 출발점인 도메인 중립 기본값 | 교차 도메인 코어 기록 |

맞는 팩이 없으면 온톨로지 빌더가 내 코퍼스로 초안을 만들고(승인 필요), 도메인에 이미 공개 온톨로지가 있으면 가져올 수 있습니다. 새로 발행된 팩은 등록된 측정이 채택하기 전까지 `emitted_unmeasured`로 표시됩니다.

### 3.9 실제 빌드 사례

CUAD 공급계약서 한 건(Bellicum Pharmaceuticals × Miltenyi Biotec)을 Legal Contract 팩으로 빌드한 결과, 양 당사자 주변에서 **엔티티 42개, Tier-1 트리플 77개**가 생성되었고 모두 증거 스팬과 출처를 지닙니다. (코퍼스: CUAD, The Atticus Project, CC BY 4.0)

---

## 4. 장점

### 4.1 감사 가능성
모든 트리플이 원문 스팬, 문서 ID, 티어, 점수까지 추적됩니다. 법률, 금융, 규제, 컴플라이언스처럼 **"이 사실의 근거는 무엇인가"** 에 답해야 하는 영역에 구조적으로 맞습니다.

### 4.2 비용 대비 통제력
저가 제안자 + 고정 판정자 분업 구조라서 단일 프런티어 모델에 모든 것을 맡기는 방식보다 비용을 예측하고 통제하기 쉽습니다. 사전 산정, 중단선, 원장 재개까지 갖춰 **예산 사고를 구조적으로 방지**합니다.

### 4.3 재현성
- 프로파일러는 결정론적이라 같은 코퍼스는 같은 해시를 냅니다.
- 팩은 sha256으로 고정됩니다.
- 헤드라인 수치는 `reproduce/` 아래 명령으로 재계산되고, 리플레이 스크립트는 수치가 어긋나면 비정상 종료합니다.
- 프로파일링, 인스펙트, 검증, 검증 수학이 모두 **키 없이** 동작합니다.

### 4.4 측정 도구가 제품에 포함됨
`verify`로 내 골드셋을 감사하고, 원점수와 보정 점수, 천장 보정 재현율, 실패 해부를 직접 산출할 수 있습니다. "벤더가 주장하는 점수"가 아니라 **내 데이터로 측정하는 점수**를 얻을 수 있습니다.

### 4.5 즉시 쓸 수 있는 팩과 온톨로지 가져오기
4개 도메인 팩 + Core가 데이터로 제공되고, FIBO 같은 업계 표준 온톨로지를 가져오는 경로가 있습니다.

### 4.6 단일 그래프 정책
저장소에 현재 빌드의 그래프 하나만 있으므로 검색 범위 혼란이 없고, 어떤 온톨로지로 만든 그래프인지 항상 명확합니다.

### 4.7 한계에 대한 정직성
사전 등록 기준 중 실패한 것, 측정 범위의 한계, 사람 검수 미실시를 스스로 공개합니다. 초기 오픈소스에서는 드문 태도이며 신뢰도를 높여 줍니다.

---

## 5. 단점과 리스크

### 5.1 플랫폼·인프라 제약
- Linux에서만 개발·테스트되었고, Windows는 **WSL2에서만** 실행됩니다(네이티브 Windows 미검증).
- Neo4j 5.x가 **빌드의 전제 조건**입니다. 선택적 백엔드가 아닙니다.
- 라이브 빌드에는 LLM 연결이 필수입니다.

### 5.2 형식 온톨로지 미지원
클래스 계층, 상속, 논리 공리, 추론이 필요한 용도(예: 의미 추론 기반 분류 체계)에는 맞지 않습니다.

### 5.3 Jev 판정 모델 종속 ⚠️
- 판정자가 "고정된 제품 구성요소"인 `typesafe/jev-1.13`입니다.
- README만으로는 이 모델의 출처, 공급 주체, 장기 가용성, 데이터 처리 정책이 명확하지 않습니다.
- 다른 판정자로 바꾸면 공개된 품질 수치가 그대로 성립하지 않습니다.
- **실무 도입 전 가장 먼저 확인할 항목**입니다.

### 5.4 품질 수치의 범위가 좁음
저자가 직접 밝힌 한계는 다음과 같습니다.
- 보정 점수는 **측정된 특정 빌드**(3,902개 트리플, 문장 윈도 구성)에 대한 것이며, **기본 설정과 열거 방식이 다릅니다.**
- 기본 Tier-1 세트에 추가된 승격 트리플 186개는 보정 정밀도가 재계산되지 않았습니다.
- 판정은 공개 규칙에 따른 **기계 채점**이며, 플래그십 샘플에 대한 **사람 스팟체크는 한 번도 하지 않았습니다.**
- 검색 성능은 긴 계약서에 대한 고정 116문항 세트 하나로만 측정됐고, **짧은 초록에서는 정확히 0**입니다.

### 5.5 초기 단계 프로젝트
- 스타 0, 포크 0, 커밋 약 70개
- 2026-10-29에 GLiNER+spaCy 로컬 NLP 후보 소스와 `[nlp]` extra를 폐기하는 등 구조가 아직 바뀌고 있습니다.
- 커뮤니티, 장기 유지보수, 생산 환경 사용 사례가 아직 검증되지 않았습니다.

### 5.6 사용 적합성의 제약
- 스키마 없이 그래프만 빨리 만들고 싶다면 맞지 않습니다. 스키마 우선 단계, 사람 승인 지점, 측정 도구가 "의식(ceremony)"이 아니라 제품 그 자체입니다.
- 스키마가 매일 바뀌는 도메인이라면 먼저 어느 정도 안정시킨 뒤 팩으로 고정해야 합니다.
- 빠른 데모가 목적이라면 GraphRAG 계열이 더 빠릅니다.

---

## 6. 경쟁 프로젝트

OntoSmith는 "온톨로지 편집기"가 아니라 **"문서 → 통제된 지식 그래프" 파이프라인**입니다. 실질적인 경쟁자는 A그룹이고, B그룹은 이름만 비슷한 인접 영역입니다.

### 6.1 A그룹 — 직접 경쟁 (문서에서 지식 그래프 구축)

| 프로젝트 | 특징 | OntoSmith와의 차이 |
|---|---|---|
| **Microsoft GraphRAG** (+ LazyGraphRAG) | LLM으로 엔티티·관계·커뮤니티 요약을 만들고 전역·지역 질의에 활용 | 단일 프런티어 모델 중심, 구조가 창발적, **답변 품질로 평가**. OntoSmith는 명시적 온톨로지 + 트리플 단위 판정으로 **그래프 자체를 채점** |
| **LightRAG** | 경량 그래프 기반 RAG, 빠른 구축과 증분 업데이트 | 속도와 간편성 우위, 감사·증거 체계는 약함 |
| **Neo4j LLM Knowledge Graph Builder** | Neo4j 공식 도구, 스키마 지정 추출 지원 | 같은 Neo4j 생태계. 다만 제안/판정 분리, 비용 중단선, 보정 측정 체계 없음 |
| **LlamaIndex PropertyGraphIndex** | 스키마 지정 추출기와 다양한 그래프 스토어 지원 | 프레임워크 부품 성격, 유연성 우위. 품질 감사는 직접 구축 필요 |
| **Graphiti (Zep)** | 에이전트 메모리용 시간축(temporal) 지식 그래프 | 시간에 따라 변하는 사실 처리에 강점. 목적이 메모리이지 감사가 아님 |

> A그룹 중 Neo4j Graph Builder, LlamaIndex, Graphiti는 README에 언급되지 않으며, 일반 지식에 기반한 비교입니다.

### 6.2 B그룹 — 인접 영역 (형식 온톨로지 편집·시각화)

| 프로젝트 | 특징 | OntoSmith와의 차이 |
|---|---|---|
| **Protégé** | 스탠퍼드 개발, 가장 널리 쓰이는 오픈소스 OWL 편집기 | 클래스 계층·공리·추론 중심. 목적 자체가 다름 |
| **WebVOWL** | RDF/OWL 온톨로지 웹 시각화 | 그래프를 "구축"하지 않고 "보여줌" |
| **TopBraid Composer / EDG** | 엔터프라이즈 상용 온톨로지·데이터 거버넌스 | 전문가용 상용 도구, 비용과 범위가 다름 |
| **VocBench / NeOn Toolkit** | 협업 온톨로지·SKOS 편집, 온톨로지 공학 툴킷 | 계층 구조와 협업 편집 강점 |

### 6.3 포지셔닝 요약

| 축 | GraphRAG 계열 | OntoSmith | OWL 편집기 |
|---|---|---|---|
| 스키마 | 창발적 | 명시적·평면·승인 | 명시적·계층·공리 |
| 사실 기록 기준 | 추출 결과 그대로 | 판정자 심사 통과분만 | 사람이 직접 작성 |
| 평가 대상 | 답변 품질 | 그래프 자체(트리플 단위) | 논리 일관성 |
| 강점 | 빠른 데모 | 감사·재현·비용 통제 | 추론·표준 호환 |

---

## 7. 설치와 운영 방법

### 7.1 사전 요구 사항

| 항목 | 요구 사항 | 필요한 단계 |
|---|---|---|
| OS | Linux 권장. Windows는 **WSL2** | 전체 |
| Python | **3.11 이상** | 전체 |
| LLM 연결 | 레퍼런스 프리셋은 `OPENROUTER_API_KEY` 하나 | 3단계(라이브 빌드)만 |
| Neo4j | **5.x**, Community Edition으로 충분 | 3단계만 |

### 7.2 설치

```bash
pip install ontosmith
```

선택 기능:

```bash
pip install "ontosmith[viz]"     # 시각화
pip install "ontosmith[neo4j]"   # 내보내기 유틸리티용 공식 Neo4j 드라이버
```

> 빌드 자체는 Neo4j와 **HTTP로 통신**합니다. `[neo4j]` extra가 없어도 서버만 실행 중이면 빌드가 됩니다.
>
> 로컬 NLP 스택은 필요 없습니다. 후보는 제안자 모델이 생성합니다. (`[nlp]` extra는 2026-10-29에 폐기)

### 7.3 1단계 — 둘러보기 (키 불필요, 약 2분)

```bash
# 코퍼스 프로파일링 (결정론적, LLM 없음)
ontosmith profile examples/corpus --family demo
```

예상 출력:

```
Corpus profile
  family          demo
  status          COMPLETE
  documents       4
  claims          6
  decision points 0
  profile hash    sha256:7ae51d31fa9120ec
  spend           $0.0000
  written         profiles/demo (profile.json, setup_config.json, profile.md)
```

```bash
# 샘플 트리플의 증거·출처 확인
ontosmith inspect examples/triples.jsonl

# 동봉된 데모 빌드에 질문 (기록된 산출물 검색, 키 불필요)
ontosmith search "Who founded Alder & Finch?"
```

**팁**: `profile`은 **내 문서 폴더**에도 그대로 실행할 수 있습니다. 빌드 전에 코퍼스가 적합한지, 사람이 먼저 정해야 할 결정 지점이 무엇인지 비용 없이 확인할 수 있습니다.

### 7.4 2단계 — 증거 검증 (키 불필요)

```bash
python examples/demo/replay_scores.py
```

- 플래그십 빌드의 보정 점수를 동봉된 판정 부록(`benchmarks/appendix/`)에서 **모델 호출 없이** 재생합니다.
- 수치가 하나라도 어긋나면 **비정상 종료(non-zero exit)** 합니다.
- 모든 헤드라인 수치는 `reproduce/` 아래의 재계산 명령과 대응됩니다.

### 7.5 3단계 — 실제 빌드 (LLM 연결 + Neo4j 필요)

**① LLM 바인딩 선언**

```bash
export OPENROUTER_API_KEY=sk-or-...
ontosmith configure          # 대화형 마법사 (또는 --from-file)
```

- 프리셋 값으로 좌석을 순회하고, **지출 0으로** 연결을 점검한 뒤 바인딩 파일을 작성합니다.
- 레퍼런스 프리셋은 기본값을 수락하면 같은 키가 판정자를 포함한 모든 좌석에 적용됩니다.
- 자체 공급자를 쓰려면 공식 문서의 Connections를 참고해 커스텀 바인딩을 지정합니다.

**② Neo4j 실행**

```bash
# Neo4j 5.x 설치 후 비밀번호 설정
export NEO4J_PASSWORD=your-password
```

로컬 기본 설치라면 그 외 추가 설정은 필요 없습니다. 실행 시 첫 스테이지 전에 저장소를 점검하고, 응답이 없으면 이름을 명시하며 거부하므로 비용이 나가지 않습니다.

**③ 비용 사전 산정**

```bash
ontosmith verify project --unit-cost <단가>
```

**④ 배치 생성과 실행**

```bash
ontosmith batch create ...   # 프로파일 + 팩 바인딩
ontosmith batch run ...      # 중단선 적용 실행
ontosmith batch status ...   # 진행 상태
ontosmith batch rollback ... # 롤백
```

> 정확한 인자는 공식 hands-on 가이드 Track 1을 따르세요. 단계: 프로파일 → 생성 → 상한 적용 실행 → serve / search / inspect.

**⑤ 서빙과 질의**

```bash
ontosmith search "질문"   # 하이브리드 검색 (벡터 + 어휘 + 그래프)
ontosmith serve           # 샘플 HTTP API + 데모 앱(/)
```

샘플 API는 search, entity, neighborhood, triple-with-evidence 엔드포인트를 제공합니다.

### 7.6 학습 경로 (hands-on 가이드 트랙)

| 목적 | 시작점 |
|---|---|
| 먼저 실행 영상 보기 | 프로젝트 사이트의 Demo → Tutorial → Teardown 영상 3편 |
| 내 코퍼스 적합성 확인 | 1단계 `profile` |
| 품질 주장 직접 검증 | 2단계 리플레이, 백서 §5 |
| 내 문서로 그래프 빌드 | hands-on **Track 1** |
| 도메인 온톨로지 설계 | `ontosmith ontology`, hands-on **Track 3** |
| 기존 온톨로지 가져오기 | `ontosmith ontology import`, hands-on **Track 4** |
| 내 벤치마크 골드셋 감사 | `ontosmith verify`, hands-on 부록 |
| 자체 모델 공급자 사용 | `docs/connections.md` |
| LLM에게 프로젝트 설명 | 저장소 루트의 `llms.txt` |
| 서빙·질의 | `docs/serving.md` |

---

## 8. 명령어 레퍼런스

| 분류 | 명령 | 설명 |
|---|---|---|
| Label | `review` | 리뷰 밴드 대화형 레이블링 |
| Evaluate | `evaluate` · `recalibrate` · `calibration` | 평가와 보정 |
| | `inspect` | 트리플 + 증거 + 출처 |
| | `verify` | score / audit-sets / project / report |
| Models | `llm` · `ollama` | 후보 판정자 |
| Gates | `triple` · `er` · `conflict` · `onto` · `cascade` | Jev 게이트 |
| Connect | `configure` | 좌석 바인딩 선언 (마법사 / `--from-file`) |
| Pipeline | `batch` | create / run / status / rollback |
| | `profile` | 코퍼스 프로파일러 (결정론적, LLM 없음) |
| | `ontology` | draft / validate / approve / emit (팩 발행), import |
| Serve | `search` | 빌드된 그래프 하이브리드 검색 |
| | `serve` | 샘플 HTTP API + 데모 앱 |

### 저장소 구조

```
.github/  api/  app/  assets/brand/  benchmarks/  build/pypi/
docs/  examples/  harness/  packs/  pipeline/  reproduce/
scripts/  site/  tests/
CHANGELOG.md  CODE_OF_CONDUCT.md  CONTRIBUTING.md  LICENSE  NOTICE
README.md  SECURITY.md  llms.txt  pyproject.toml  ruff.toml
```

---

## 9. 도입 판단 가이드

### 9.1 이런 경우에 적합

- 계약서, 규제 문서, 금융 공시, 소송 자료처럼 **사실마다 근거 제시가 필요한** 코퍼스
- 그래프 품질을 **내 데이터로 측정하고 증명해야** 하는 경우
- LLM 비용을 사전에 예측하고 상한을 걸어야 하는 경우
- 도메인 스키마가 어느 정도 안정되어 있거나, FIBO 같은 표준 온톨로지가 있는 경우

### 9.2 이런 경우에는 다른 도구

- 하루 만에 데모 그래프가 필요할 때 → GraphRAG, LightRAG
- 계층·추론 기반 형식 온톨로지가 필요할 때 → Protégé, TopBraid
- 에이전트 메모리처럼 시간에 따라 변하는 사실을 다룰 때 → Graphiti
- 네이티브 Windows 환경만 가능할 때

### 9.3 PoC 체크리스트

1. **Jev 확인** — `typesafe/jev-1.13`의 제공 주체, 가용성, 데이터 처리 정책, 대체 가능성
2. **비용 없는 적합성 검사** — 내 문서 폴더에 `ontosmith profile` 실행 후 결정 지점 검토
3. **리플레이로 신뢰성 확인** — `replay_scores.py` 통과 여부
4. **소규모 상한 빌드** — `verify project`로 산정 후 낮은 중단선으로 문서 수십 건 빌드
5. **사람 스팟체크** — 저자가 하지 않은 부분이므로, 결과 트리플 일부를 직접 검수해 정밀도 확인
6. **짧은 문서 검색 성능 별도 측정** — 공개 수치가 긴 계약서에 한정되어 있음
7. **유지보수 리스크 평가** — 커밋 빈도, 이슈 대응, 구조 변경 이력 모니터링

---

## 10. 부록: 기존 요약본 정정 사항

README 원문과 대조해 이전 요약본에서 바로잡은 항목입니다.

| 항목 | 기존 요약본 | README 원문 |
|---|---|---|
| 버전 | 0.1.9 | **0.1.1** (PyPI에 더 최신 버전이 있을 수 있으니 직접 확인) |
| 빌드 명령 | `ontosmith quickstart your-file.txt` | 명령어 표에 **없음**. `configure` → `batch` 경로이며 hands-on Track 1을 따름 |
| inspect 예제 경로 | `examples/alder-finch/triples.jsonl` | `examples/triples.jsonl` |
| 데모 질문 | "What is Mr. Darcy's income?" | "Who founded Alder & Finch?" |
| 팩 구성 | 4개 도메인 팩 (Legal Contract 등) | Bio Medical, Legal Contract, **FIBO Contracts(가져온 온톨로지)**, Open Domain + Core 베이스라인 |
| 누락 | — | 레퍼런스 모델 바인딩, 실측 비용, 품질 수치 한계, NLP 스택 폐기, 단일 그래프 교체 정책 |

---

*출처: Dongbumlee/ontosmith GitHub README (2026-11-08 확인). 6장 A그룹 일부(Neo4j LLM Graph Builder, LlamaIndex, Graphiti)는 README 외 일반 지식에 기반한 비교입니다.*
