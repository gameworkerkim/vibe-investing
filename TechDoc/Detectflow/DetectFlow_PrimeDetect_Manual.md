<p align="center">
  <img src="images/banner.png" alt="Prime Detect (구 DetectFlow)" width="720">
</p>

# DetectFlow (Prime Detect) 완벽 매뉴얼

**SIEM 앞단, Kafka 스트림 위에서 Sigma 규칙을 실행하는 실시간 탐지 파이프라인 — 개요·컨셉·비교·설치·운용**

| 항목 | 내용 |
|---|---|
| 대상 저장소 | [`socprime/detectflow-main`](https://github.com/socprime/detectflow-main) 및 하위 컴포넌트 저장소 5종 |
| 개발사 | SOC Prime |
| 라이선스 | **EUPL 1.2 / SOC Prime Commercial License 이중 라이선스** (용도에 따라 택1) |
| 기준 시점 | 2026년 11월 6일, 각 저장소 `main` 브랜치 기준 |
| 이미지 버전(OSS) | `socprime/detectflow-oss:*-oss.v0.9.4` (원클릭 배포 스크립트 기본값) |
| 컴포넌트 버전 | Backend 1.1.0 (Python 3.12 / FastAPI), MatchNode 1.1.0 (Python 3.10+ / Flink 2.2) |
| 독자 | SOC 엔지니어, 탐지 엔지니어, 플랫폼·데이터 엔지니어, Kubernetes 운영자 |

> **스크린샷 안내** — 이 문서의 이미지는 모두 SOC Prime 공식 저장소에 수록된 원본입니다(대시보드, 시스템 아키텍처, Pipeline Runtime 설정 화면). 공식 저장소에 스크린샷이 없는 화면(파이프라인 생성 폼, Log Source 편집기 등)은 임의로 그려 넣지 않고, 메뉴 경로와 필드 표로 대신 설명했습니다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [핵심 컨셉: 파이프라인을 탐지 계층으로](#2-핵심-컨셉-파이프라인을-탐지-계층으로)
3. [시스템 아키텍처](#3-시스템-아키텍처)
4. [지원 범위와 한계](#4-지원-범위와-한계)
5. [유사 프로젝트 비교](#5-유사-프로젝트-비교)
6. [설치 매뉴얼](#6-설치-매뉴얼)
7. [운용 매뉴얼](#7-운용-매뉴얼)
8. [모니터링과 트러블슈팅](#8-모니터링과-트러블슈팅)
9. [프로덕션 보안 강화 체크리스트](#9-프로덕션-보안-강화-체크리스트)
10. [부록](#10-부록)

---

## 1. 프로젝트 개요

### 1.1 한 줄 정의

DetectFlow는 **Apache Kafka 토픽을 흐르는 이벤트에 Apache Flink로 Sigma 규칙을 실시간 적용**하고, 매칭된 이벤트에 규칙 메타데이터(ID, 제목, 심각도, MITRE ATT&CK 기법 ID)를 **태깅해 목적지 토픽으로 내보내는** 오픈소스 탐지 파이프라인입니다. SIEM은 이미 태깅된 이벤트를 받기만 하면 됩니다.

### 1.2 리브랜딩 상태

SOC Prime은 DetectFlow를 **Prime Detect**로 이름을 바꾸는 중이며, 다음 릴리스에서 모든 리소스·에셋에 새 이름이 반영된다고 공지했습니다. 현재 저장소 이름, 이미지 태그, UI 로고에는 여전히 `DetectFlow`가 남아 있으므로 이 문서도 두 이름을 함께 씁니다.

### 1.3 SOC Prime이 내세우는 이점

| 이점 | 내용 |
|---|---|
| 초저지연 MTTD | 0.005–0.01초 (SIEM의 15분 이상 대비) |
| 인플라이트 태깅 | SIEM 인제스트 **이전**에 이벤트를 태깅·강화 |
| 규칙 용량 | 스트리밍 이벤트에 수만 개 Sigma 규칙 적용, "기존 인프라에서 규칙 용량 10배" |
| 무변경 통합 | SIEM 쪽 수정 불필요, 기존 인제스트 아키텍처 그대로 사용 |
| 배포 제약 대응 | 에어갭·클라우드 연결 환경 모두 고려, 데이터는 사용자 통제하에 유지 |
| 벤더 캡 없음 | 인프라 규모만큼 확장 |

> ⚠️ **해석 주의** — 위 수치는 벤더 주장입니다. MTTD 0.005–0.01초는 "이벤트가 MatchNode에 도달한 뒤 매칭되기까지"의 처리 지연으로 읽는 것이 합리적이며, 수집 에이전트 → Kafka 구간 지연과 Flink 윈도(기본 수십 초 단위 설정 가능, §7.2) 버퍼링은 별도입니다. 도입 전 자체 트래픽으로 PoC 측정을 권합니다. LLM이든 탐지 엔진이든 **숫자는 엑셀로 검증하는 대상이지 신탁이 아닙니다.**

### 1.4 현재 릴리스 기능

| 기능 | 설명 |
|---|---|
| Real-time Dashboard | 파이프라인 성능·메트릭 실시간 시각화 (SSE 스트리밍) |
| Pipeline Management | Flink 기반 파이프라인 생성·설정·모니터링 |
| Log Source Configuration | 파싱 스크립트(DSL) + 필드 매핑(YAML) 정의 |
| Rule Management | SOC Prime Platform / GitHub 공개 저장소(SigmaHQ, Microsoft, Splunk, Elastic) / 로컬 저장소의 Sigma 규칙 관리 |
| Filter Configuration | 매칭 전 사전 필터로 오탐 감소 |
| Topic Synchronization | Kafka 토픽 자동 탐색·관리 |
| Hot-Reload | 규칙·필터·파서 변경을 파이프라인 재시작 없이 반영 |
| AI-assisted Mapping | AI 프롬프트로 필드 매핑 생성 (Backend 기능) |
| 사용자 관리·감사 로그 | JWT 인증(액세스+리프레시 토큰 로테이션), 감사 로그 보존(기본 30일) |

### 1.5 로드맵 (Features in Progress)

- SIEM·EDR·데이터 레이크 연동: Splunk, Microsoft Sentinel, Elasticsearch, OpenSearch
- LLM 방화벽 **AIDR Bastion** 연동
- 탐지 규칙 스테이징(Staging)
- AI 기반 데이터 스키마 검증 및 리매핑

---

## 2. 핵심 컨셉: 파이프라인을 탐지 계층으로

### 2.1 기존 방식과의 차이

전통적인 SOC에서 데이터 파이프라인(Kafka, Cribl, Logstash 등)은 **운반**만 하고, 탐지는 SIEM이 인덱싱한 뒤 예약 검색(scheduled search)으로 수행합니다. 규칙이 늘어날수록 SIEM 검색 부하와 라이선스 비용이 함께 증가하고, 검색 주기만큼 탐지가 늦어집니다.

DetectFlow는 탐지를 **데이터가 흐르는 도중(in-flight)** 으로 옮깁니다.

```mermaid
flowchart LR
    subgraph Before["기존: 인제스트 후 탐지"]
        A1[로그 수집] --> B1[Kafka] --> C1[SIEM 인덱싱] --> D1["예약 검색<br/>(5~15분 주기)"] --> E1[알림]
    end
    subgraph After["DetectFlow: 인제스트 전 탐지"]
        A2[로그 수집] --> B2["Kafka<br/>source topic"] --> M["MatchNode<br/>(Flink + Sigma)"] --> T["Kafka<br/>destination topic<br/>(태깅된 이벤트)"] --> S2["SIEM / EDR /<br/>Data Lake"]
    end
```

### 2.2 이벤트에 붙는 것

매칭된 이벤트에는 다음 메타데이터가 추가됩니다.

- 규칙 **ID**
- 규칙 **Title**
- **Severity**
- **MITRE ATT&CK** (하위)기법 ID

이 태그를 바탕으로 SIEM에서 단순 집계 규칙("같은 호스트에서 T1059 태그 3건 이상")을 만들거나, MITRE TIE 같은 상관분석 모델에 넘겨 공격 체인을 추론하는 것이 SOC Prime이 제시하는 사용 흐름입니다.

### 2.3 대시보드로 보는 컨셉

![DetectFlow 대시보드](images/dashboard.png)

*그림 1. DetectFlow 대시보드(공식 데모 화면). 왼쪽 위 Source Topics에서 들어온 이벤트(EVENTS/SEC)와 왼쪽 아래 Repositories의 규칙(# RULES)이 중앙 Detection Pipelines에서 만나고, 태깅된 이벤트(TAGGED/SEC)가 오른쪽 Destination Topics → Data Lake·SIEM·EDR·LLM Firewall로 흐릅니다. 아래쪽 Staging Stats 경로는 로드맵 기능인 규칙 스테이징을 보여주며, 오른쪽 SIEM 연동 노드 상당수도 로드맵 항목이 포함된 데모 구성입니다.*

애니메이션 버전: [images/dashboard-live.gif](images/dashboard-live.gif)

### 2.4 설계 원칙 요약

| 원칙 | 의미 |
|---|---|
| Shift-left detection | 탐지를 SIEM 앞으로 당겨 MTTD와 SIEM 부하를 동시에 줄임 |
| Tag, don't drop | 기본은 매칭 이벤트에 메타데이터를 덧붙여 전달. 비매칭 이벤트 보존 여부는 파이프라인 옵션 |
| 규칙은 데이터 | 규칙·필터·파서를 Kafka 압축(compacted) 토픽으로 브로드캐스트 → 핫 리로드 |
| 벤더 중립 | 입력은 Kafka, 규칙은 Sigma, 출력도 Kafka. 소비자는 무엇이든 가능 |

---

## 3. 시스템 아키텍처

### 3.1 전체 구성도

![시스템 아키텍처](images/architecture-dark.png)

*그림 2. 공식 시스템 아키텍처(다크 테마). 밝은 테마 버전: [images/architecture-light.png](images/architecture-light.png)*

구성도를 위에서 아래로 읽으면 다음과 같습니다.

- **Kafka 계층**: 로그 소스 파이프라인마다 Source Topic·Destination Topic 한 쌍, 그리고 공용 **Sigma Rules Topic**과 **Service Log Topic**.
- **Kubernetes 계층**: 파이프라인마다 별도의 **Apache Flink 클러스터**(Flink Job + Rule Manager)가 뜨고, **Flink Kubernetes Operator**가 이를 관리합니다.
- **SOC Prime DetectFlow(관리 평면)**: Operator에 파이프라인 생성/중지를 지시하고, 규칙을 Sigma Rules Topic으로 동기화하며, 잡 서비스 로그를 수집합니다.
- **규칙 소스**: SOC Prime Platform(클라우드), GitHub(SigmaHQ·Elastic·Splunk·Microsoft Sentinel·OpenSearch), 로컬 저장소.

### 3.2 컴포넌트 저장소

| 저장소 | 역할 | 기술 |
|---|---|---|
| [`detectflow-main`](https://github.com/socprime/detectflow-main) | 메인 문서 + K8s 매니페스트 | YAML |
| [`detectflow-backend`](https://github.com/socprime/detectflow-backend) | Admin Panel API (포트 8000) | Python 3.12, FastAPI, Alembic, PostgreSQL |
| [`detectflow-ui`](https://github.com/socprime/detectflow-ui) | Admin Panel 웹 UI (포트 4173) | TypeScript, Vite |
| [`detectflow-matchnode`](https://github.com/socprime/detectflow-matchnode) | 실시간 Sigma 매칭 엔진 | Python 3.10+, PyFlink(Flink 2.2), polars, orjson |
| [`detectflow-parser`](https://github.com/socprime/detectflow-parser) | 이벤트 파싱 DSL 라이브러리(`schema_parser`) | Python 3.10+ |
| [`detectflow-one-click-local-deployment`](https://github.com/socprime/detectflow-one-click-local-deployment) | Minikube 원클릭 배포 스크립트 | Bash |

### 3.3 파이프라인 생명주기

```mermaid
sequenceDiagram
    participant U as 운영자(UI)
    participant B as Backend API
    participant DB as PostgreSQL
    participant K8s as Flink K8s Operator
    participant F as Flink Job (MatchNode)
    participant K as Kafka

    U->>B: 파이프라인 생성 (enabled=true)
    B->>DB: 설정 저장
    B->>K8s: FlinkDeployment CRD 생성
    K8s->>F: JobManager + TaskManager 기동
    B->>K: 규칙/필터/파서 → sigma-rules 토픽(compacted)
    F->>K: sigma-rules 토픽 earliest부터 구독 → 브로드캐스트
    loop 스트리밍
        K->>F: source topic 이벤트
        F->>F: 파싱 → 필터 → 윈도 버퍼 → Sigma 매칭
        F->>K: destination topic (태깅 이벤트)
        F->>K: rule-statistics 토픽 (메트릭)
    end
    K->>B: 메트릭 소비 → 대시보드 SSE
```

### 3.4 MatchNode 내부 데이터 흐름

| 단계 | 동작 |
|---|---|
| 이벤트 입력 | 하나 이상의 입력 토픽을 union한 뒤 키잉 전략(`hash` / `computer` / `round_robin`)으로 병렬 인스턴스에 분배 |
| 규칙 입력 | 규칙 토픽 하나를 `earliest`부터 읽어 역직렬화 후 모든 Sigma Matcher 파티션에 **브로드캐스트** |
| Sigma Matcher | 키별로 이벤트를 윈도(시간 또는 건수)에 버퍼링 → 타이머 시점에 규칙 로드, Sigma 파싱, 필드 매핑, 매칭 수행 |
| 상태 관리 | 체크포인트로 장애 복구, 상태 백엔드는 `rocksdb` 권장 |
| 멀티테넌시 | `JOB_ID`로 잡을 식별, 규칙 토픽의 규칙을 job_id 태그로 필터링 → 한 클러스터에서 여러 테넌트·시나리오 운영 |

### 3.5 내부 Kafka 토픽

| 토픽(기본값) | 용도 |
|---|---|
| `sigma-rules` | 규칙·필터·파서 배포용 **compacted** 토픽 |
| `rule-statistics` | 파이프라인·규칙별 메트릭 |
| `etl-activity` | 활동·감사 로그 |
| 사용자 정의 source/destination | 파이프라인별 입력·출력 |

### 3.6 Flink 런타임 선택

Backend의 `FLINK_PROVIDER`로 두 런타임 중 하나를 고릅니다.

- `kubernetes`(기본): Apache Flink Kubernetes Operator가 FlinkDeployment CRD를 관리
- `cmf`: Confluent Manager for Apache Flink. MatchNode도 `Dockerfile.confluent`(cp-flink 기반)로 빌드

> **버전 표기 정정** — 메인 README의 "Apache Flink 1.13+"는 실제로는 **Flink Kubernetes Operator 1.13.0**을 뜻합니다. MatchNode 이미지에 포함된 Flink 엔진 자체는 **2.2**입니다. 원클릭 배포 문서의 기술 스택 표에도 Flink 2.2, Operator 1.13.0, cert-manager 1.17.2로 나뉘어 있습니다.

---

## 4. 지원 범위와 한계

운영 전에 반드시 알아야 할 부분입니다. DetectFlow는 **단일 이벤트 Sigma 탐지 규칙**만 평가하며, 지원하지 않는 기능을 쓴 규칙은 **거부(reject)** 됩니다. SigmaHQ 전체를 동기화해도 일부는 로드되지 않는다는 뜻입니다.

### 4.1 지원되는 Sigma 기능

| 분류 | 지원 항목 |
|---|---|
| 수정자 | `contains`, `startswith`, `endswith`, 수정자 없음(정확 일치), `all`(목록 AND 전환) — 모두 대소문자 무시 |
| 조건식 | 단일 이름, `and`, `or`, `not`, `all of selection*`, `1 of selection*`, `all of them`, `1 of them`, 괄호 중첩 |
| 키워드 검색 | 문자열 목록을 이벤트 전체에 OR 매칭 |
| 와일드카드 | 수정자 없는 값의 `*`, `?`를 전체 문자열 정규식(`^...$`)으로 변환, `\*` `\?`는 리터럴 |

필드당 매칭 수정자는 하나(`contains`/`startswith`/`endswith` 중 하나 또는 없음)만 허용되며, `all`은 추가로 붙일 수 있습니다.

### 4.2 지원되지 않는 기능 (규칙 거부 사유)

| 분류 | 미지원 항목 |
|---|---|
| 일반 | `exists`, `cased`, `neq` |
| 문자열 | `windash` |
| 정규식 | `re` |
| 인코딩 | `base64`, `base64offset`, `utf16`, `utf16le`, `utf16be`, `wide` |
| 숫자 비교 | `lt`, `lte`, `gt`, `gte` |
| 시간 | `minute`, `hour`, `day`, `week`, `month`, `year` |
| IP | `cidr` |
| 기타 | `expand`, `fieldref` |
| 와일드카드 혼용 | `contains`/`startswith`/`endswith`와 와일드카드 동시 사용 |
| 상관 규칙 | Sigma Correlation 전체(`event_count`, `value_count`, `temporal`, `temporal_ordered`, `value_sum`, `value_avg`, `value_percentile`, `group-by`, `timespan` 등) |

### 4.3 실무적 함의

- **`windash`, `cidr`, `re`** 는 SigmaHQ 윈도우·네트워크 규칙에서 자주 쓰입니다. 동기화 후 로드 실패 규칙 수를 반드시 확인하세요.
- 임계값·시간 상관(브루트포스 N회, 횡적 이동 체인)은 DetectFlow가 아니라 **다운스트림(SIEM 집계, MITRE TIE 등)** 에서 처리하는 구조입니다. DetectFlow는 "원자 탐지 + 태깅" 계층입니다.
- 공식 `GETTING_STARTED.md`의 필터 예시에 `SubjectUserName|re`가 쓰여 있는데, 규칙 쪽 문서는 `re`를 미지원으로 명시합니다. 필터 엔진이 `re`를 받아들이는지는 배포 버전에서 직접 테스트한 뒤 쓰는 것이 안전합니다.

---

## 5. 유사 프로젝트 비교

DetectFlow를 정확히 포지셔닝하려면 "Sigma를 **어디서**, **언제** 실행하느냐"로 나누어 보는 것이 가장 명확합니다.

### 5.1 계층별 지도

```mermaid
flowchart TB
    subgraph L1["① 규칙 작성·표준"]
        S[Sigma / SigmaHQ]
        P[pySigma · sigma-cli]
        U[Uncoder AI]
    end
    subgraph L2["② 규칙 실행"]
        DF["DetectFlow<br/>(Kafka+Flink 스트림)"]
        TZ["Tenzir<br/>(sigma 연산자)"]
        OS["OpenSearch<br/>Security Analytics"]
        CH["Chainsaw · Hayabusa · Zircolite<br/>(오프라인/포렌식)"]
    end
    subgraph L3["③ 탐지 태세·수명주기 관리"]
        CO[CardinalOps]
        SA["SnapAttack<br/>(Cisco/Splunk)"]
    end
    subgraph L4["④ 검증"]
        AR[Atomic Red Team]
    end
    L1 --> L2 --> L3
    L4 -.검증.-> L2
```

### 5.2 상세 비교표

| 도구 | 계층 | Sigma 실행 위치 | 실시간성 | 라이선스/형태 | DetectFlow와의 관계 |
|---|---|---|---|---|---|
| **DetectFlow / Prime Detect** | 실행 | Kafka 스트림 위 Flink 잡 | 스트리밍(윈도 단위) | EUPL 1.2 / 상용 이중 | — |
| **Sigma (SigmaHQ)** | 표준 | 실행 엔진 아님 | — | DRL(규칙), LGPL(pySigma) | DetectFlow가 소비하는 **규칙 원천** |
| **pySigma / sigma-cli** | 변환 | 규칙을 SIEM 쿼리로 변환 | SIEM 의존 | LGPL | SIEM 안에서 실행하는 **대안 경로** |
| **Uncoder AI** (SOC Prime) | 작성·변환 | 65+ SIEM/EDR 언어로 변환 | — | SaaS | 같은 생태계. Uncoder는 작성, DetectFlow는 실행 |
| **Tenzir** | 실행 | 파이프라인의 `sigma` 연산자 | 스트리밍 + 과거 데이터 재매칭 | 오픈 코어 | **가장 직접적인 경쟁자**. 범용 보안 데이터 파이프라인에 Sigma 연산자가 내장, 디렉터리 감시로 규칙 갱신 |
| **OpenSearch Security Analytics** | 실행 | OpenSearch 인덱스 위 디텍터 | 인덱싱 후 주기 실행 | Apache 2.0 | 인제스트 **후** 탐지. 이미 OpenSearch가 있으면 대안 |
| **Chainsaw / Hayabusa / Zircolite** | 실행(오프라인) | EVTX·JSON 파일 | 배치 | 오픈소스 | 침해사고 포렌식용. 상시 운영 탐지와는 용도가 다름 |
| **CardinalOps** | 태세 관리 | 기존 SIEM 규칙 분석 | — | 상용 | ATT&CK 커버리지 갭 감사. 실행 계층이 아님 |
| **SnapAttack** | 수명주기 관리 | SIEM/EDR로 배포 | — | 상용(Cisco 인수, Splunk 편입) | 탐지 엔지니어링 워크플로 플랫폼 |
| **Atomic Red Team** | 검증 | — | — | MIT | DetectFlow 규칙이 실제로 터지는지 **검증**하는 짝 |

> **원본 정리본 정정** — 기존 메모에서 DetectFlow 라이선스를 "Apache 2.0"으로 적었으나, 저장소 `LICENSE`는 **EUPL 1.2와 SOC Prime 상용 라이선스의 이중 라이선스**입니다. EUPL은 카피레프트 성격이 있으므로 수정본을 서비스로 배포하려는 경우 법무 검토가 필요합니다. 또한 기존 비교표의 `detflow`(PyPI 패키지)는 이름만 비슷한 별개 프로젝트라 이 문서에서는 제외했습니다.

### 5.3 DetectFlow vs Tenzir (가장 가까운 선택지)

| 관점 | DetectFlow | Tenzir |
|---|---|---|
| 실행 기반 | Apache Flink (Kubernetes Operator 또는 Confluent CMF) | 자체 엔진(C++), TQL 파이프라인 |
| 입력 | Kafka 전용 | Kafka 포함 다양한 소스(TCP, 파일, 클라우드 등) |
| 필드 정규화 | Log Source(파싱 DSL + 매핑 YAML), AI 매핑 보조 | 필드 정규화 없음 — 규칙 필드명을 맞추거나 사전 매핑 필요 |
| 규칙 공급 | SOC Prime Platform·GitHub·로컬 저장소 UI 관리, Kafka 브로드캐스트 | 파일/디렉터리 감시(`refresh_interval`) |
| 출력 | 원본 이벤트에 태그 부착(옵션으로 비매칭 보존) | 매칭 이벤트만 래핑해 출력 |
| 과거 데이터 재매칭 | 미지원 | 지원 |
| 운영 UI | 전용 Admin Panel, 대시보드 | Tenzir 플랫폼 |
| 강점 | 대규모 규칙 브로드캐스트, Flink 체크포인트·오토스케일, SOC Prime 콘텐츠 | 범용 SecDataOps 파이프라인, 라이브+회고 탐지 |

### 5.4 선택 가이드

| 상황 | 권장 |
|---|---|
| 이미 Kafka가 로그 백본이고, SIEM 비용·검색 지연이 문제 | **DetectFlow** |
| Kafka가 없고 수집·라우팅·탐지를 한 도구로 | Tenzir |
| OpenSearch를 이미 SIEM으로 쓰고 지연이 허용됨 | OpenSearch Security Analytics |
| 규칙은 SIEM 안에서 돌리고 싶다 | pySigma/sigma-cli 또는 Uncoder AI |
| 침해사고 대응 시 디스크 이미지·EVTX 분석 | Chainsaw / Hayabusa |
| "우리 탐지가 ATT&CK를 얼마나 덮나" | CardinalOps, SnapAttack |
| 규칙이 실제로 탐지되는지 확인 | Atomic Red Team과 병행 |

---

## 6. 설치 매뉴얼

### 6.1 요구 사항

#### 기술 스택

| 의존성 | 버전 | 용도 |
|---|---|---|
| Kubernetes | 1.28+ | 전체 오케스트레이션 |
| PostgreSQL | 14+ | Backend DB(규칙, 파이프라인, 사용자) |
| Apache Kafka | 3.8+ | 이벤트 스트리밍 + 규칙 배포 |
| Apache Flink | 2.2 (이미지 포함) | 스트림 처리 엔진 |
| Flink Kubernetes Operator | 1.13.0 | FlinkDeployment CRD 관리 |
| cert-manager | 1.17.2 | Flink Operator용 TLS 인증서 |

#### 네트워크

- 배포 리소스 간 내부 통신
- (선택) `*.socprime.com` 아웃바운드 — SOC Prime Platform 규칙 동기화, API 키 필요
- (선택) `*.github.com` 아웃바운드 — SigmaHQ, Microsoft, Splunk, Elastic 공개 규칙 동기화
- 에어갭 환경에서는 두 아웃바운드를 막고 **로컬 저장소**만 사용

#### 리소스 산정

컴포넌트별 요구량을 **합산**해 클러스터 크기를 정합니다.

| 컴포넌트 | 최소 요구 | 비고 |
|---|---|---|
| UI Node (Admin Panel) | 2 CPU / 4 GB | 관리 콘솔 |
| Task Manager Node | 1 CPU / 4 GB | 파이프라인 운영 제어(Flink) |
| Match Node | 파이프라인 수 × (TaskManager CPU·메모리 × 병렬도) | 파이프라인당 별도 Flink 클러스터 |

**산정 예시** — Pipeline Runtime 기본값(병렬도 2, TaskManager 2코어·8192 MB, §7.2 그림 참조)으로 파이프라인 5개를 운영하면, 병렬도 2를 TaskManager 2개로 풀었다고 가정할 때 MatchNode만 약 5 × 2 × (2코어, 8 GB) = **20코어, 80 GB**에 JobManager(기본 1코어·2 GB) × 5가 더해집니다. 공식 권장(워커 3대 × 8 vCPU·32 GiB = 24 vCPU·96 GiB)과 대략 맞물리는 규모입니다. 실제 슬롯 배치는 Flink 설정에 따라 달라지므로 첫 파이프라인을 띄운 뒤 `kubectl top pods`로 실측하세요.

| 배포 경로 | 하드웨어 |
|---|---|
| 표준(Kubernetes) | 워커 노드 3대 이상, 노드당 8 vCPU · 32 GiB RAM 이상 |
| 경량(Minikube) | macOS + Homebrew, Docker Desktop(메모리 8 GB 이상 할당), CPU 4코어, 디스크 40 GB |

---

### 6.2 경로 A — Minikube 원클릭 배포 (평가·테스트용)

#### A-1. 사전 도구

```bash
brew install minikube kubectl helm kcat jq
brew install --cask docker-desktop
# Docker Desktop → Settings → Resources → Memory 8GB 이상
```

#### A-2. 배포 스크립트 선택

| 스크립트 | 동작 | 권장 상황 |
|---|---|---|
| `deploy-detectflow-minikube.sh` | 컴포넌트 저장소를 `detectflow-repos/`에 클론 → 로컬 빌드 → 배포 | 소스 수정·디버깅 |
| `deploy-detectflow-minikube-prebuilt.sh` | Docker Hub `socprime/detectflow-oss` 이미지 풀 → 배포 | 빠른 평가 |

**소스 빌드 방식**

```bash
git clone https://github.com/socprime/detectflow-one-click-local-deployment.git
cd detectflow-one-click-local-deployment
chmod +x deploy-detectflow-minikube.sh
./deploy-detectflow-minikube.sh
```

**사전 빌드 이미지 방식**

```bash
git clone https://github.com/socprime/detectflow-one-click-local-deployment.git
cd detectflow-one-click-local-deployment
chmod +x deploy-detectflow-minikube-prebuilt.sh
./deploy-detectflow-minikube-prebuilt.sh
```

이미지 버전을 바꾸려면 스크립트 상단 변수를 수정합니다. 변경 전 Docker Hub 태그 목록에서 존재 여부를 확인하세요.

```bash
IMAGE_BACKEND="socprime/detectflow-oss:admin-panel-be-oss.v0.9.4"
IMAGE_UI="socprime/detectflow-oss:admin-panel-ui-oss.v0.9.4"
IMAGE_FLINK="socprime/detectflow-oss:flink-sigma-detector-oss.v0.9.4"
```

#### A-3. 접속 정보

스크립트가 포트 포워딩을 설정하고 다음 URL을 출력합니다.

| 서비스 | URL | 비고 |
|---|---|---|
| DetectFlow UI | `http://localhost:4173` | 관리 콘솔 |
| Backend API | `http://localhost:8000` | REST API |
| Kafka UI | `http://localhost:8080` | 토픽 모니터링 |
| Kafka Broker | `localhost:9094` | 호스트 접근용 EXTERNAL 리스너 |
| K8s Dashboard | `http://localhost:8443` | 클러스터 모니터링 |

**기본 로그인**: `admin@soc.local` / `admin` → 로그인 직후 변경하세요.

> **Kafka 포트 주의** — 클러스터 밖에서는 반드시 `localhost:9094`를 쓰세요. `9092`는 메타데이터에 `kafka:9092`를 광고하므로 호스트에서 이름 해석이 되지 않습니다.

#### A-4. 배포 후 기본 점검

```bash
kubectl get pods -n flink          # 모든 파드 Running 확인
kubectl get svc  -n flink
minikube stop                      # 데이터 보존하며 중지
minikube delete && ./deploy-detectflow-minikube.sh   # 완전 초기화 후 재배포
```

---

### 6.3 경로 B — 표준 Kubernetes 배포 (프로덕션)

Kubernetes 전문성과 클러스터 관리자 권한을 가진 담당자가 수행해야 합니다. 매니페스트는 [`detectflow_kubernetes_config_files`](https://github.com/socprime/detectflow-main/tree/main/detectflow_kubernetes_config_files)에 있으며, **모든 파일에 목업 시크릿이 들어 있으므로 반드시 교체**해야 합니다.

```mermaid
flowchart LR
    K0[Kafka 준비] --> F1[cert-manager] --> F2[Flink Operator<br/>Helm] --> F3[ns: flink<br/>ConfigMap·Secret·PVC·RBAC]
    F3 --> I[이미지 빌드·푸시]
    I --> B[Backend<br/>CM·Secret·PVC·Deploy·Svc]
    B --> U[UI<br/>CM·Deploy·Svc]
    U --> V[접속 확인]
```

#### B-0. 준비물

```bash
git clone https://github.com/socprime/detectflow-main.git
cd detectflow-main/detectflow_kubernetes_config_files
ls
# admin-panel-be-{configmap,deployment,pvc,secret,service}.yaml
# admin-panel-ui-{configmap,deployment,service}.yaml
# flink-{configmap,pvcs,rbac,secret}.yaml
```

Kafka가 없다면 [Apache Kafka Quickstart](https://kafka.apache.org/quickstart/)로 먼저 구축합니다. PostgreSQL 14+ 인스턴스와 DB·계정도 준비합니다.

#### B-1. cert-manager 설치

[공식 설치 문서](https://cert-manager.io/docs/installation/)를 따릅니다. 이어서 3개 파드가 모두 Running인지 확인합니다.

```bash
kubectl get pods -n cert-manager
```

#### B-2. Flink Kubernetes Operator (Helm)

```bash
helm repo add flink-operator-repo https://downloads.apache.org/flink/flink-kubernetes-operator-1.13.0/
helm repo update
helm install flink-kubernetes-operator flink-operator-repo/flink-kubernetes-operator \
  --namespace flink-operator --create-namespace
```

#### B-3. Flink Sigma Detector 기반 리소스 (`flink` 네임스페이스)

```bash
kubectl create ns flink
```

| 순서 | 파일 | 수정할 값 | 명령 |
|---|---|---|---|
| ① ConfigMap | `flink-configmap.yaml` | `namespace: flink` (나머지 기본값) | `kubectl apply -f flink-configmap.yaml -n flink` |
| ② Secret | `flink-secret.yaml` | `KAFKA_BOOTSTRAP_SERVERS`, `KAFKA_AUTH_METHOD` (Base64) | `kubectl apply -f flink-secret.yaml -n flink` |
| ③ PVC | `flink-pvcs.yaml` | 각 블록의 `namespace`, `storage`, `storageClassName` | `kubectl apply -f flink-pvcs.yaml -n flink` |
| ④ RBAC | `flink-rbac.yaml` | `namespace: flink` | `kubectl apply -f flink-rbac.yaml -n flink` |

Secret 값은 Base64로 인코딩합니다. 줄바꿈이 섞이지 않도록 `-n` 옵션을 씁니다.

```bash
echo -n 'kafka-0.kafka.svc:9092' | base64
echo -n 'PLAINTEXT' | base64      # 또는 SASL / SSL
```

③ 실행 후 `flink-checkpoints-pvc`, `flink-ha-pvc`, `flink-savepoints-pvc` 세 개가 생성됩니다. PVC를 특정 노드에 두려면 레이블을 붙입니다.

```bash
kubectl label nodes <NODE_NAME> spec-node-ns-pod-disk=pvc-security
```

④는 Flink ServiceAccount가 TaskManager 파드를 생성·관리할 수 있도록 Role/RoleBinding(`flink`, `event-reader`)을 만듭니다.

#### B-4. 이미지 빌드와 레지스트리 푸시

각 컴포넌트 README에 따라 빌드한 뒤 클러스터에서 접근 가능한 레지스트리에 올립니다.

```bash
REG=registry.example.com/detectflow

git clone https://github.com/socprime/detectflow-backend.git
docker build -t $REG/admin-panel-be:1.1.0 detectflow-backend && docker push $REG/admin-panel-be:1.1.0

git clone https://github.com/socprime/detectflow-ui.git
docker build -t $REG/admin-panel-ui:latest detectflow-ui && docker push $REG/admin-panel-ui:latest

git clone https://github.com/socprime/detectflow-matchnode.git
docker build -t $REG/flink-sigma-detector:1.1.0 detectflow-matchnode && docker push $REG/flink-sigma-detector:1.1.0
# Confluent CMF 런타임이면: docker build -f Dockerfile.confluent ...
```

이미지 주소를 다음 위치에 반영합니다(적용은 다음 단계에서).

| 파일 | 위치 |
|---|---|
| `admin-panel-be-deployment.yaml` | `spec.template.spec.containers[].image` |
| `admin-panel-ui-deployment.yaml` | `spec.template.spec.containers[].image` |
| `admin-panel-be-configmap.yaml` | 변수 `FLINK_IMAGE` |

에어갭 환경에서는 Docker Hub `socprime/detectflow-oss` 이미지를 내부 레지스트리로 미러링해 써도 됩니다.

#### B-5. Backend 배포

```bash
# 1) ConfigMap — KAFKA_BOOTSTRAP_SERVERS(호스트:포트) 지정
kubectl apply -f admin-panel-be-configmap.yaml -n flink

# 2) Secret — DATABASE_URL (Base64)
echo -n 'postgresql+asyncpg://detectflow:STRONG_PW@pg.db.svc:5432/detectflow' | base64
kubectl apply -f admin-panel-be-secret.yaml -n flink

# 3) PVC (메트릭 저장)
kubectl apply -f admin-panel-be-pvc.yaml -n flink

# 4) Deployment
kubectl apply -f admin-panel-be-deployment.yaml -n flink

# 5) Service
kubectl apply -f admin-panel-be-service.yaml -n flink
```

확인: `http://<backend-service-ip>:8000` 응답, 또는

```bash
kubectl -n flink port-forward svc/admin-panel-be 8000:8000 &
curl -s http://localhost:8000/health
```

> 프로덕션에서는 Secret에 `JWT_SECRET_KEY`, `JWT_REFRESH_SECRET_KEY`도 반드시 고유 값으로 넣으세요(기본값은 `your-secret-key`). 전체 환경변수는 §10.2 참조.

#### B-6. UI 배포

```bash
# 1) ConfigMap — VITE_PREVIEW_ALLOWED_HOSTS에 backend 내부 호스트명
#    형식: NAME.NAMESPACE.svc.cluster.local → admin-panel-be.flink.svc.cluster.local
kubectl apply -f admin-panel-ui-configmap.yaml -n flink

# 2) Deployment
kubectl apply -f admin-panel-ui-deployment.yaml -n flink

# 3) Service
kubectl apply -f admin-panel-ui-service.yaml -n flink
```

확인: `http://<ui-service-ip>:4173` 접속 → `admin@soc.local` / `admin` 로그인 → 즉시 비밀번호 변경.

#### B-7. 설치 검증 체크리스트

- [ ] `kubectl get pods -n cert-manager` 3개 Running
- [ ] `kubectl get pods -n flink-operator` Operator Running
- [ ] `kubectl get pvc -n flink` 4개(Flink 3 + Backend 1) Bound
- [ ] `admin-panel-be`, `admin-panel-ui` Running
- [ ] Backend 로그에 PostgreSQL·Kafka 연결 오류 없음
- [ ] UI 로그인 성공, Settings → Topics에서 Kafka 토픽 목록이 보임

---

## 7. 운용 매뉴얼

### 7.1 전체 운용 흐름

```mermaid
flowchart LR
    T["① Kafka 토픽<br/>source / destination"] --> R["② Repositories<br/>규칙 저장소"]
    R --> L["③ Log Sources<br/>파싱 + 매핑"]
    L --> F["④ Filters<br/>(선택)"]
    F --> P["⑤ Pipelines<br/>생성·활성화"]
    P --> D["⑥ Dashboard<br/>모니터링"]
    D --> X["⑦ 다운스트림<br/>SIEM 집계 / MITRE TIE"]
```

UI 상단 메뉴는 **Dashboard / Pipelines / Repositories / Settings**이고, Settings 왼쪽 메뉴는 **Repositories, Topics, Log Sources, Filters, User Management, Audit Logs, Pipeline Runtime**입니다(그림 3 참조).

### 7.2 첫 설정: Pipeline Runtime

파이프라인을 만들기 **전에** 기본 런타임 값을 시스템 자원에 맞게 조정합니다. 여기서 바꾼 값은 **이후 새로 만드는 파이프라인에만** 적용되며, 파이프라인 생성 시 개별로 덮어쓸 수 있습니다.

![Pipeline Runtime 설정 화면](images/pipeline-runtime.png)

*그림 3. Settings → Pipeline Runtime (DetectFlow Open Source Edition)*

| 설정 | 화면 예시값 | 의미와 튜닝 포인트 |
|---|---|---|
| Parallelism | 2 | 병렬 인스턴스 수. 소스 토픽 파티션 수를 넘기면 유휴 슬롯 발생 |
| TaskManager CPU, cores | 2 | TaskManager당 코어 |
| TaskManager Memory, MB | 8192 | 규칙 수·윈도 크기에 비례해 증가 |
| Window Size, sec | 30 | 매칭 전 이벤트 버퍼 시간. **작을수록 지연↓, 처리 효율↓** |
| Checkpoint Interval, sec | 60 | 장애 복구 시점 간격. 짧을수록 복구 손실↓, 오버헤드↑ |
| Enable Autoscaling | Off | 트래픽에 따라 병렬도 자동 조정 |

> **지연과 윈도의 관계** — MatchNode는 이벤트를 윈도에 모았다가 타이머 시점에 매칭합니다. 엔진 자체 매칭 시간이 밀리초 단위여도, 윈도 30초라면 탐지가 목적지 토픽에 나타나기까지 최대 수십 초가 걸릴 수 있습니다. MTTD가 핵심 KPI라면 윈도를 줄이고 처리량 변화를 측정하세요.

### 7.3 ① Kafka 토픽 준비

DetectFlow는 토픽을 **만들지 않고 탐색**합니다. 파이프라인에 쓸 토픽은 Kafka에 미리 있어야 합니다.

```bash
# 로컬(Minikube) 예시 — 파드 이름과 스크립트 경로는 환경에 맞게 조정
kubectl -n flink exec -it deploy/kafka -- \
  kafka-topics.sh --bootstrap-server localhost:9092 --create --topic windows-events --partitions 2
kubectl -n flink exec -it deploy/kafka -- \
  kafka-topics.sh --bootstrap-server localhost:9092 --create --topic windows-events-tagged --partitions 2
```

Kafka UI(`http://localhost:8080`)에서 만들어도 됩니다. 이후 **Settings → Topics**에서 토픽이 보이는지, 어떤 파이프라인과 연결됐는지 확인합니다.

### 7.4 ② Repositories — 규칙 저장소

| 유형 | 동기화 | 비고 |
|---|---|---|
| Cloud (SOC Prime) | API, 기본 5분 주기 | API 키 필요 |
| Cloud (GitHub) | API | SigmaHQ, Microsoft, Splunk, Elastic 공개 저장소 |
| Local | 수동 | 에어갭·사내 규칙 |

**로컬 저장소 만들기**: Settings → Repositories → **New Repository**(또는 **+**) → 이름 입력 → **Create Repository**

**규칙 1건 추가**: 저장소 선택 → **Add Rule** → 규칙 이름 → Sigma YAML 붙여넣기 → **Create**

**일괄 업로드**: 저장소 선택 → **Upload** → YAML 파일 드래그앤드롭(비밀번호 걸린 압축 파일도 가능) → 업로드 결과 확인. 미지원 기능(§4.2)을 쓴 규칙은 이 단계에서 거부됩니다.

**실습용 규칙 예시** — NTLM 네트워크 로그온 탐지(DetectFlow 지원 범위 내 기능만 사용):

```yaml
title: Network Logon via NTLM
id: 0f2b6c1e-7d4a-4c3e-9a51-3b8e2f1d6a70
status: experimental
description: Detects network logons (type 3) authenticated with NTLM
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4624
    LogonType: 3
    AuthenticationPackageName: NTLM
  filter_local:
    IpAddress|startswith:
      - '127.'
      - '::1'
  condition: selection and not filter_local
level: medium
tags:
  - attack.lateral_movement
  - attack.t1550.002
```

### 7.5 ③ Log Sources — 파싱과 필드 매핑

원시 이벤트의 필드명은 Sigma 규칙의 필드명과 다른 경우가 대부분입니다. Log Source가 그 간극을 메웁니다.

| 요소 | 역할 |
|---|---|
| Parsing Script | `detectflow-parser` DSL로 필드 추출·변환 |
| Mapping (YAML) | 파싱된 필드를 Sigma 규칙 필드에 정렬 |

**만들기**: Settings → Log Sources → **New Log Source**

| 필드 | 필수 | 설명 |
|---|---|---|
| Name | ✅ | 고유 이름 |
| Source Topics | ✅ | 테스트용 Kafka 토픽(1개 이상) |
| Parsing Script | ✅ | DSL 쿼리 |
| Mapping (YAML) | ✅ | 필드 매핑 |
| Repositories | — | 매핑 생성에 참고할 저장소 |

**파싱 스크립트 예시** — 원클릭 문서의 샘플 이벤트(`event_id`, `logon_type`, `auth_package` …)를 위 규칙의 필드명으로 맞춥니다.

```text
# 원시 이벤트의 필드명을 Sigma Windows Security 필드로 정렬
rename(from="event_id", to="EventID")
| rename(from="logon_type", to="LogonType")
| rename(from="auth_package", to="AuthenticationPackageName")
| rename(from="target_user", to="TargetUserName")
| rename(from="source_network_address", to="IpAddress")
| rename(from="workstation_name", to="WorkstationName")
| set(field="event.module", value="windows-security")
```

**DSL 함수 요약** (전체 레퍼런스: [`detectflow-parser` README](https://github.com/socprime/detectflow-parser))

| 함수 | 용도 |
|---|---|
| `parse_json` | JSON 문자열 필드 파싱(`in_place` 지원) |
| `parse_kv` | `key=value` 구분자 문자열 파싱 |
| `parse_leef` | LEEF(QRadar 계열) 이벤트 파싱 |
| `parse_xml` | XML → 중첩 딕셔너리 |
| `regex` | 명명 그룹으로 필드 추출 |
| `rename` / `extract` / `set` / `drop` | 필드 이동·추출·추가·삭제 |
| `list_to_dict` | 리스트 → 딕셔너리 변환 |
| `parse_win_event_log` | Event Viewer·Splunk 멀티라인 Windows 로그 |
| `parse_wincollect_win_event_log` | QRadar WinCollect로 전달된 Windows 로그 |

문법: 함수를 `|`로 연결, 중첩 필드는 `user.profile.name` 점 표기, `#` 주석 지원(문자열 안의 `#`은 보존).

**Mapping YAML**은 Backend의 **AI-assisted Mapping** 기능으로 초안을 생성할 수 있습니다. 매핑 스키마의 세부 형식은 버전에 따라 달라질 수 있으므로 UI가 생성한 초안을 기준으로 편집하는 방식을 권합니다. 위 예시처럼 파싱 단계에서 `rename`으로 Sigma 필드명에 맞춰 두면 매핑 부담이 크게 줄어듭니다.

> 파이프라인의 Source Topic과 Repositories는 이 Log Source 설정과 **일치**해야 최적 결과가 나옵니다(공식 문서 강조 사항).

### 7.6 ④ Filters — 사전 필터(선택)

필터에 **매칭된 이벤트는 규칙 매칭에서 제외**됩니다. 여러 필터는 AND로 결합되며, Sigma detection 문법을 씁니다.

**만들기**: Settings → Filters → **New Filter** → Filter Name, Filter(YAML)

```yaml
# 머신 계정($로 끝나는 계정)의 네트워크 로그온을 매칭 대상에서 제외
detection:
  selection:
    EventID: 4624
    LogonType: 3
    TargetUserName|endswith: '$'
  condition: selection
```

> 공식 예시는 `SubjectUserName|re: '.*\$'`를 쓰지만, 규칙 엔진 문서상 `re`는 미지원입니다(§4.3). 위처럼 `endswith`로 바꾸면 안전합니다.

### 7.7 ⑤ Pipelines — 생성과 활성화

**만들기**: Pipelines → **New Pipeline**

| 필드 | 필수 | 설명 |
|---|---|---|
| Pipeline Name | ✅ | 고유 이름 |
| Source Topic | ✅ | 입력 토픽(존재해야 함) |
| Destination Topic | ✅ | 태깅 이벤트 출력 토픽(존재해야 함) |
| Repositories | ✅ | 1개 이상 |
| Log Source | ✅ | §7.5에서 만든 설정 |
| Save Untagged Events | — | 비매칭 이벤트도 목적지로 보낼지 |
| Filters | — | §7.6 필터 |
| Custom Fields | — | 모든 이벤트에 붙일 고정 키-값(YAML) |

Custom Fields 예시:

```yaml
env: prod
site: seoul-dc1
pipeline_owner: soc-team
```

**활성화/비활성화**

- **Enable**: Kubernetes에 FlinkDeployment 생성 → 처리 시작
- **Disable**: 처리 중지 → FlinkDeployment 삭제

**변경 시 다운타임 기준**

| 변경 항목 | 반영 방식 | 다운타임 |
|---|---|---|
| Source Topic / Destination Topic | 파이프라인 재시작 | 60–90초 |
| Enable / Disable 전환 | 재시작 | 60–90초 |
| Repositories, Filters, Log Source, Custom Fields | **핫 리로드** | 없음 |

변경 사항은 파이프라인이 **Enabled** 상태여야 적용됩니다.

### 7.8 엔드투엔드 테스트

```bash
# 1) 테스트 이벤트 전송 (호스트 → EXTERNAL 리스너 9094)
cat <<'JSON' | jq -c . | kcat -P -b localhost:9094 -t windows-events
{
  "event_id": 4624,
  "timestamp": "2024-02-24T19:02:11Z",
  "channel": "Security",
  "computer": "FILESERVER01.domain.local",
  "target_user": "DOMAIN\\alice",
  "logon_type": 3,
  "logon_process": "NtLmSsp",
  "auth_package": "NTLM",
  "workstation_name": "WORKSTATION01",
  "source_network_address": "192.168.1.100",
  "source_port": 52144,
  "message": "An account was successfully logged on."
}
JSON

# 2) 태깅 결과 확인 (윈도 크기만큼 기다린 뒤)
kcat -C -b localhost:9094 -t windows-events-tagged -o beginning -e | jq .
```

출력 이벤트에 §7.4 규칙의 ID·제목·심각도·ATT&CK 기법(T1550.002)이 메타데이터로 붙어 있으면 성공입니다. 메타데이터 필드의 정확한 키 이름은 버전에 따라 다를 수 있으니 첫 결과를 보고 SIEM 파서를 맞추세요.

결과가 비어 있으면 순서대로 확인합니다: 윈도 시간이 지났는지 → 파이프라인 상태가 running인지 → 규칙이 업로드 시 거부되지 않았는지 → Log Source의 `rename` 결과 필드명이 규칙과 일치하는지 → 필터가 해당 이벤트를 제외하고 있지 않은지.

### 7.9 ⑥ Dashboard 읽는 법

그림 1의 그래프 노드는 클릭하면 상세 정보가 열리고, 상태·활동에 따라 색이 달라지며, 연결선은 데이터 흐름입니다. **Pipelines 아이콘**을 누르면 전체 파이프라인 통계를 봅니다.

| 지표 | 해석 | 이상 신호 |
|---|---|---|
| Status | running / suspended / failed | failed → §8.2 |
| Input / Output EPS | 초당 입력·출력 이벤트 | 입력은 있는데 출력 0 → 규칙·매핑 문제 |
| Kafka consumer lag | 처리 대기 레코드 | 지속 증가 → 병렬도·TaskManager 자원 증설, 오토스케일 검토 |
| Source/Destination | 연결 토픽 | 의도와 다른 토픽 연결 여부 |

### 7.10 ⑦ 다운스트림 활용

- SIEM에서 태그 기반 집계 규칙 작성(예: 같은 호스트에서 10분 내 서로 다른 ATT&CK 전술 3개 이상)
- MITRE TIE 같은 상관 모델로 공격 체인 추론
- `Save Untagged Events`를 끄고 태깅 이벤트만 SIEM에 보내면 인제스트량 절감 효과. 단, 원본 로그 보관 의무가 있다면 원본은 데이터 레이크로 별도 분기하세요.

---

## 8. 모니터링과 트러블슈팅

### 8.1 자주 쓰는 명령

```bash
kubectl get pods -n flink
kubectl get flinkdeployments -n flink                 # 파이프라인별 Flink 배포
kubectl logs -n flink -l app.kubernetes.io/name=admin-panel-be -f
kubectl logs -n flink -l app.kubernetes.io/name=admin-panel-ui -f
kubectl logs -n flink -l app=kafka -f
kubectl logs -n flink -l app=postgres -f
kubectl top pods -n flink

# 포트 포워딩 재설정 (로컬)
kubectl port-forward -n flink svc/admin-panel-be 8000:8000 &
kubectl port-forward -n flink svc/admin-panel-ui 4173:4173 &
kubectl port-forward -n flink svc/kafka-ui 8080:8080 &
kubectl port-forward -n flink svc/kafka 9094:9094 &
kubectl port-forward -n kubernetes-dashboard svc/kubernetes-dashboard 8443:80 &
```

Flink 잡 자체의 웹 UI(JobManager)는 포트 **8081**입니다. 특정 파이프라인을 들여다볼 때 해당 JobManager 서비스로 포트 포워딩합니다.

### 8.2 증상별 대응

| 증상 | 원인 후보 | 조치 |
|---|---|---|
| 파드 Pending / CrashLoopBackOff | 자원 부족, 설정 오류 | `kubectl describe pod <pod> -n flink`, `kubectl logs <pod> -n flink` |
| Backend가 PostgreSQL 연결 실패 | 파드 미기동, URL 형식 | `kubectl get pods -n flink -l app=postgres`, 형식 `postgresql+asyncpg://user:pw@host:5432/db` 확인, Base64 줄바꿈 여부 |
| Backend가 Kafka 연결 실패 | Kafka 기동 지연(30–60초), 부트스트랩 주소 | `kubectl get pods -n flink -l app=kafka`, 클러스터 내부는 `kafka:9092` |
| 이미지 풀 오류(소스 빌드) | `imagePullPolicy` | 로컬 빌드는 `Never` 설정, `minikube image build -t <image>:local <path>`로 재빌드 |
| 이미지 풀 오류(사전 빌드) | 태그 없음 | Docker Hub `socprime/detectflow-oss` 태그 확인 |
| Minikube 자원 부족 | Docker 메모리 | Docker Desktop 메모리 8 GB 이상 → `minikube delete` 후 재배포 |
| Flink Operator 미기동 | cert-manager 미완료 | `kubectl get pods -n flink-operator`, cert-manager 3개 파드 Running 후 재설치 |
| 파이프라인 failed | TaskManager OOM, 토픽 없음 | Flink UI(8081) 예외 확인, TaskManager 메모리 상향, 토픽 존재 확인 |
| 출력 0건 | 매핑 불일치, 규칙 거부, 필터 과다 | §7.8 점검 순서 |
| Consumer lag 증가 | 처리량 부족 | 병렬도↑(파티션 수 이내), TaskManager 자원↑, 오토스케일 |
| 호스트에서 Kafka 접속 불가 | 9092 사용 | `localhost:9094` 사용, 포트 포워딩 재시작 |

---

## 9. 프로덕션 보안 강화 체크리스트

DetectFlow는 **보안 데이터 전체가 지나가는 지점**이자 **탐지 규칙(=방어 로직) 저장소**입니다. 공격자에게는 탐지를 끄거나 우회 규칙을 심을 수 있는 고가치 표적이므로 일반 앱보다 엄격하게 다뤄야 합니다.

| 영역 | 점검 항목 |
|---|---|
| 기본 자격 증명 | `admin@soc.local` / `admin` 즉시 변경, 개인 계정 발급 후 공용 계정 비활성화 |
| 시크릿 | 저장소 매니페스트의 목업 값 전부 교체, `JWT_SECRET_KEY`·`JWT_REFRESH_SECRET_KEY` 고유값, External Secrets/Vault 연동 권장 |
| Kafka | `KAFKA_AUTH_METHOD`를 SASL 또는 SSL로, `sigma-rules` 토픽 쓰기 권한은 Backend 서비스 계정만 |
| 네트워크 | Admin UI·API를 내부망/VPN으로 한정, NetworkPolicy로 `flink` 네임스페이스 접근 제한, Ingress에 TLS |
| 규칙 공급망 | GitHub 동기화 규칙은 스테이징 저장소에서 검토 후 프로덕션 저장소로 승격, 로컬 업로드 권한 최소화 |
| 감사 | Audit Logs 보존 기간(`AUDIT_LOGS_RETENTION_DAYS`, 기본 30일)을 규정에 맞게 조정, 감사 로그를 외부 SIEM으로도 전송 |
| 이미지 | 태그 고정(digest pin), 내부 레지스트리 미러링, 이미지 취약점 스캔 |
| 에어갭 | `ENABLE_AUTO_SYNC` 및 외부 아웃바운드 차단, 로컬 저장소만 운용 |
| 가용성 | Flink HA PVC·체크포인트 스토리지 백업, PostgreSQL 백업 |
| 탐지 무결성 | 파이프라인 Disable·규칙 삭제 이벤트를 별도 알림으로 감시(탐지 계층 자체를 끄는 행위 탐지) |

---

## 10. 부록

### 10.1 포트 요약

| 포트 | 서비스 |
|---|---|
| 4173 | Admin Panel UI |
| 8000 | Backend REST API |
| 8080 | Kafka UI (원클릭 배포) |
| 8081 | Flink JobManager 웹 UI |
| 8443 | K8s Dashboard (원클릭 배포) |
| 9092 | Kafka 클러스터 내부 리스너 |
| 9094 | Kafka EXTERNAL 리스너 (호스트 접근) |
| 6123 | Flink RPC |

### 10.2 Backend 주요 환경변수

| 변수 | 기본값 | 설명 |
|---|---|---|
| `DATABASE_URL` | (필수) | `postgresql+asyncpg://...` |
| `KAFKA_BOOTSTRAP_SERVERS` | (필수) | Kafka 브로커 |
| `KAFKA_AUTH_METHOD` | `PLAINTEXT` | `PLAINTEXT` / `SASL` / `SSL` |
| `KAFKA_SIGMA_RULES_TOPIC` | `sigma-rules` | 규칙·필터·파서 배포 토픽(compacted) |
| `KAFKA_METRICS_TOPIC` | `rule-statistics` | 메트릭 토픽 |
| `KAFKA_ACTIVITY_TOPIC` | `etl-activity` | 활동·감사 토픽 |
| `KAFKA_DEFAULT_REPLICATION_FACTOR` | `2` | 새 토픽 복제 계수(단일 브로커면 1로) |
| `FLINK_PROVIDER` | `kubernetes` | `kubernetes` / `cmf` |
| `KUBERNETES_NAMESPACE` | `security` | Flink 배포 네임스페이스(매니페스트는 `flink` 사용 — 일치시킬 것) |
| `FLINK_IMAGE` | `flink-sigma-detector:latest` | MatchNode 이미지 |
| `IMAGE_PULL_POLICY` | `Always` | 로컬 빌드는 `Never` |
| `FLINK_NODE_SELECTOR_KEY` / `_VALUE` | `app` / `detectflow-prod` | Flink 파드 배치 노드 |
| `FLINK_TASKMANAGER_CPU` / `_MEMORY_GB` | `1.0` / `2` | 기본 TaskManager 자원 |
| `FLINK_JOBMANAGER_CPU` / `_MEMORY_GB` | `1.0` / `2` | 기본 JobManager 자원 |
| `SYNC_API_REPOS_INTERVAL_MINUTES` | `5` | 클라우드 저장소 동기화 주기 |
| `ENABLE_AUTO_SYNC` | `true` | 동기화·헬스체크 스케줄러 |
| `JWT_SECRET_KEY` / `JWT_REFRESH_SECRET_KEY` | 예시값 | **프로덕션 필수 교체** |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | `15` | 액세스 토큰 만료 |
| `AUDIT_LOGS_RETENTION_DAYS` | `30` | 감사 로그 보존 |
| `TDM_API_BASE_URL` | `https://api.tdm.socprime.com` | SOC Prime 플랫폼 API |

> `KUBERNETES_NAMESPACE` 기본값(`security`)과 매니페스트 네임스페이스(`flink`)가 다릅니다. 제공된 ConfigMap이 이를 덮어쓰는지 배포 전에 확인하세요. 불일치하면 파이프라인 활성화 시 FlinkDeployment가 엉뚱한 네임스페이스에 생성되거나 권한 오류가 납니다.

### 10.3 MatchNode 주요 환경변수

| 분류 | 변수 |
|---|---|
| Kafka 연결 | `KAFKA_BOOTSTRAP_SERVERS`, `KAFKA_AUTH_METHOD`, SASL(`KAFKA_API_KEY`, `KAFKA_API_SECRET`), SSL(`KAFKA_SSL_*`) |
| 토픽 | `KAFKA_INPUT_TOPICS`(쉼표 구분), `KAFKA_OUTPUT_TOPIC`, `KAFKA_RULES_TOPIC`, `KAFKA_METRICS_TOPIC`, `KAFKA_CONSUMER_GROUP`, `KAFKA_STARTING_OFFSET` |
| 잡 | `JOB_ID`, `OUTPUT_MODE`(`matched_only` / `all_events`), `KEEP_FILTERED_EVENTS`, `APPLY_PARSER_TO_OUTPUT_EVENTS` |
| Flink | `FLINK_PARALLELISM`, `KAFKA_SOURCE_PARALLELISM`, `FLINK_CHECKPOINT_INTERVAL_MS`, `STATE_BACKEND`(`rocksdb` 권장), `CHECKPOINT_PATH` |
| 키잉·오토스케일 | `KEYING_STRATEGY`(`hash` / `computer` / `round_robin`), `AUTOSCALER_ENABLED`, `AUTOSCALER_MAX_PARALLELISM` |
| 윈도 | `WINDOW_TYPE`(`time` / `count`), `WINDOW_SIZE_SECONDS`, `WINDOW_COUNT_THRESHOLD` |
| 워터마크 | `ENABLE_WATERMARKS`, `WATERMARK_OUT_OF_ORDERNESS_SECONDS`, `WATERMARK_IDLE_TIMEOUT_SECONDS` |

`KEYING_STRATEGY=computer`는 같은 호스트 이벤트를 같은 인스턴스로 보내 호스트 단위 처리에 유리하지만, 특정 호스트에 이벤트가 몰리면 핫스팟이 생깁니다. 일반적으로는 `hash`가 무난합니다.

### 10.4 원본 정리본 대비 정정·보강 사항

| 항목 | 기존 메모 | 저장소 확인 결과 |
|---|---|---|
| 라이선스 | Apache 2.0 | **EUPL 1.2 / SOC Prime Commercial 이중 라이선스** |
| Flink 버전 | Apache Flink 1.13+ | Flink 엔진 **2.2**, 1.13은 Flink Kubernetes **Operator** 버전 |
| Sigma 지원 범위 | 언급 없음 | 단일 이벤트 규칙만, `re`·`cidr`·`windash`·숫자 비교·상관 규칙 미지원(§4) |
| Flink 런타임 | Kubernetes만 | Confluent CMF도 지원 |
| 다운타임 | "핫 리로드로 재시작 없음" | 규칙·필터·파서·Custom Fields만 핫 리로드, 토픽 변경·활성화 전환은 60–90초 재시작 |
| 기본 자격 증명 | 미기재 | `admin@soc.local` / `admin` |
| 비교 대상 `detflow` | 포함 | 이름만 유사한 별개 프로젝트로 제외, 실제 경쟁군인 Tenzir·OpenSearch Security Analytics 추가 |

### 10.5 참고 링크

- 메인 저장소: https://github.com/socprime/detectflow-main
- 전체 배포 가이드: https://github.com/socprime/detectflow-main/blob/main/FULL_DEPLOYMENT.md
- 시작 가이드: https://github.com/socprime/detectflow-main/blob/main/GETTING_STARTED.md
- 원클릭 배포: https://github.com/socprime/detectflow-one-click-local-deployment
- 파서 DSL 레퍼런스: https://github.com/socprime/detectflow-parser
- 지원 Sigma 범위: https://github.com/socprime/detectflow-parser/blob/main/SUPPORTED_SIGMAS.md
- Docker Hub 이미지: https://hub.docker.com/r/socprime/detectflow-oss/tags
- 제품 사이트: https://primedetect.live
- 데모 영상: https://www.youtube.com/watch?v=FYI4y1YiW7c
- Flink Kubernetes Operator Helm: https://nightlies.apache.org/flink/flink-kubernetes-operator-docs-main/docs/operations/helm/
- Tenzir sigma 연산자: https://docs.tenzir.com/operators/sigma

---

*이 매뉴얼은 2026년 11월 6일 기준 SOC Prime 공개 저장소의 문서·매니페스트·소스 README를 교차 확인해 작성했습니다. Prime Detect 리브랜딩 릴리스 이후 이미지 태그, 메뉴명, 저장소 경로가 바뀔 수 있습니다.*
