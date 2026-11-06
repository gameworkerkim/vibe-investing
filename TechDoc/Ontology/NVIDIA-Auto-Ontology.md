# NVIDIA Auto-Ontology 완전 가이드

> 특징 · 동작 원리 · 경쟁 프로젝트 비교 · 설치 및 운영 매뉴얼
>
> 저장소: https://github.com/NVIDIA/auto-ontology 기준 시점: 2026년 11월 (main 브랜치 README·DEPLOYMENT.md 기준)

---

## 1. 한 줄 요약

**Auto-Ontology는 AI 에이전트가 기업 데이터에 대해 "틀린 답을 덜 하도록" 만드는 오픈소스 시맨틱 컨텍스트 레이어입니다.**

데이터베이스 옆에 서비스로 띄워 두면, 메타데이터를 **온톨로지**(비즈니스 용어 ↔ 컬럼 매핑, 검토된 SQL 지표, 테이블 간 관계)로 컴파일합니다. 에이전트는 이 온톨로지를 통해 질의하고, 사람은 웹 UI에서 정의를 검토·인증합니다. 기존 시맨틱 모델을 대체하기보다 **보완**하는 것을 목표로 합니다.

| 항목 | 내용 |
| --- | --- |
| 개발 | NVIDIA |
| 라이선스 | Apache-2.0 |
| 언어/스택 | Python 3.12+ (FastAPI, LangChain), Next.js |
| 저장소 규모 | Star 약 4.4k, Fork 약 362, 커밋 1,363회 |
| 기여 정책 | NVIDIA 팀이 직접 유지보수 — **외부 PR은 받지 않음**. 이슈(통합 요청·버그 리포트)는 환영 |
| 평가 저장소 | [NVIDIA/auto-ontology-eval](https://github.com/NVIDIA/auto-ontology-eval) |

---

## 2. 왜 필요한가?

에이전트는 문서를 검색하고 DB에 쿼리할 수 있지만, 에이전틱 분석의 진짜 병목은 **신뢰성**입니다. 빨리 나온 매출 숫자라도 틀리면 가치가 없습니다. 에이전트가 쿼리하기 전에 알아야 할 것은 다음과 같습니다.

- 데이터가 **어디에** 있는가?
- 그것이 **무슨 의미**인가?
- **써도 되는** 데이터인가, **어떻게** 써야 하는가?
- **출처**는 어디인가, **비슷한** 것은 무엇인가?

흔한 지름길은 스키마 전체를 프롬프트에 붙여 넣는 것입니다. Auto-Ontology는 대신 **온톨로지 위의 도구**를 에이전트에 제공합니다.

| 구분 | 스키마를 컨텍스트에 붙여넣기 | Auto-Ontology 도구 |
| --- | --- | --- |
| 토큰 | 테이블·컬럼이 늘수록 계속 증가 | 질문과 관련된 용어·테이블만 사용 |
| 의미 | 컬럼명만 제공, 나머지는 에이전트가 추측 | 비즈니스 용어가 컬럼과 SQL에 매핑됨 |
| 조인·지표 | 질문마다 즉흥적으로 생성 | 확정된 관계와 검토된 SQL 표현식 재사용 |
| 답할 수 없는 질문 | 자신 있게, 종종 틀리게 답함 | 답변 가능성 검사 → 에이전트가 되물음 |

---

## 3. 핵심 기능 (5가지 동사)

| 기능 | 설명 |
| --- | --- |
| **Discover** (발견) | DB 메타데이터로부터 온톨로지를 생성하고, 기존 시맨틱 모델을 가져오며, 결과를 시맨틱 그래프로 탐색 |
| **Ground** (그라운딩) | 비즈니스 개념마다 **하나의 정의**를 테이블·데이터베이스 전반에 걸쳐 매핑해 에이전트에 제공 |
| **Certify** (인증) | UI 또는 API에서 정의를 검토·수정·인증 |
| **Validate** (검증) | 쿼리 전에 질문이 답변 가능한지 확인하고, 답변마다 SQL과 에이전트의 처리 단계를 함께 반환 |
| **Expose** (노출) | MCP, 에이전트 스킬, REST API로 어떤 에이전트 하네스에도 컨텍스트 제공 |

---

## 4. 동작 원리

### 4.1 온톨로지를 구성하는 세 가지 정의

- **Terms (용어)** — *Customer*, *Invoice Line* 같은 비즈니스 개념. 설명과 동의어를 갖고, 실제 값을 담은 컬럼에 매핑됩니다.
- **SQL Attributes (SQL 속성)** — 용어 아래에 붙는 검토된 SQL 표현식(마진, 이동 합계 등). 에이전트가 재사용하므로 같은 지표는 항상 같은 방식으로 계산됩니다.
- **Relationships (관계)** — 테이블 조인 방법(브리지 테이블 포함). 키와 실제 데이터로부터 추론합니다.

### 4.2 3단계 라이프사이클: 생성 → 인증 → 응답

**① Generate (생성)** — 수집 서비스가 초안을 만듭니다.

1. 소스 읽기: 스키마 추출, 컬럼 프로파일링, 샘플 값 수집 → 카탈로그 저장
2. 엔티티 명명: 테이블 단위로 용어를 추출하고 컬럼에 매핑
3. 관계 해석: 테이블·브리지 테이블 간 조인 추론, 쿼리 이력에서 SQL 속성 제안
4. 온톨로지 기록: 용어·관계·SQL 속성은 Postgres에, 임베딩은 pgvector에 저장

> 예시: Wide World Importers를 한 번 컴파일하면 31개의 용어가 생성되며, UI의 시맨틱 그래프에서 *Order* 같은 용어를 선택해 설명·관련 용어·매핑 컬럼·SQL 속성을 확인할 수 있습니다.

**② Certify (인증)** — 사람이 초안을 신뢰할 수 있게 만듭니다.

1. Chat 또는 MCP의 `check_answerable`, `ask_question`으로 실제 질문을 던져 테스트
2. UI나 API에서 용어·설명·SQL 속성 다듬기
3. 정확해진 이름·설명·SQL 속성을 인증

**③ Answer (응답)** — 질문마다 에이전트는:

1. 의도를 분류하고 질문 속 엔티티를 추출
2. 임베딩 검색으로 후보 용어·컬럼·SQL 속성을 조회
3. 후보를 바탕으로 SQL 작성
4. 필터 값과 쿼리를 DB에 대조 검증하고, 실패 시 SQL을 수리
5. 실행 후 답변 + SQL + 처리 단계를 함께 반환

후보가 쿼리를 뒷받침하지 못하면 **"이 데이터로는 답할 수 없다"고 보고**합니다. Chat 화면에서는 결과 행을 보거나 CSV로 내려받고 차트로 볼 수 있습니다.

### 4.3 아키텍처

| 컴포넌트 | 기술 | 역할 | 포트 |
| --- | --- | --- | --- |
| Frontend | Next.js, Better Auth, Prisma | 웹 UI, 인증, **공개 API 게이트웨이** | 3000 |
| Backend | FastAPI (Python 3.12+), LangChain | Text-to-SQL 에이전트, 카탈로그·온톨로지 API | 3001 |
| Ingestion service | FastAPI (Python 3.12+) | 수집 및 시맨틱 컴파일 | 3002 |
| MCP server | FastMCP | 공개 API 위의 **읽기 전용** 에이전트 도구 | 3003 |
| Postgres + pgvector | PostgreSQL 17 | 카탈로그, 온톨로지, 앱 데이터, 벡터 저장소 | 5432 |
| HashiCorp Vault | 선택 사항 | 연결 자격 증명 저장 | — |

### 4.4 모델 역할 (4종)

`nvapi-` 키를 쓰면 각 역할은 기본적으로 build.nvidia.com의 NVIDIA NIM을 사용합니다.

| 역할 | 기본 모델 | 하는 일 |
| --- | --- | --- |
| `REASONING` | `nvidia/nemotron-3.5-lightning-30b-a3b` | 온톨로지 구축(용어·관계·SQL 속성), 답변 SQL·설명 작성, 답변 가능성 채점 |
| `NON_REASONING` | `nvidia/nemotron-3.5-lightning-30b-a3b` | 빠른 단계: 의도 분류, 엔티티 추출, 후보 선택, SQL 검사·수리 |
| `EMBED` | `nvidia/nemotron-3.5-embed-1b` | 테이블·컬럼·용어·SQL 속성을 pgvector에 색인하고 질문과 매칭 |
| `RERANK` | `nvidia/nemotron-3.5-rerank-8b` | 브리지 테이블 SQL 속성 생성 시 후보 테이블 순위화 |

자체 호스팅 NIM이나 **OpenAI 호환 엔드포인트**로 교체할 수 있습니다(→ 7.4절).

### 4.5 지원 데이터 소스 (10종)

PostgreSQL · MySQL · Databricks · Snowflake · ClickHouse · Trino · Apache Kyuubi · HeavyDB · DuckDB · SQLite

- **Settings → Connections**에서 추가하거나 `CONNECTION_STRINGS`에 나열
- DuckDB와 SQLite는 **연결 문자열로만** 추가 가능

### 4.6 표준 호환 및 확장

- **Apache Ossie 호환** — 시맨틱 모델 교환용 오픈 표준. Ossie에 Auto-Ontology 컨버터가 포함되어 있어 모델 정의를 Ossie YAML로 가져오기/내보내기 가능 (**Settings → Import / Export** 또는 `POST /api/model/import`, `POST /api/model/export`)
- **KumoRFM 예측** — `KUMO_RFM_API_KEY`를 설정하면 예측성 질문을 KumoRFM으로 라우팅. 단, **연결된 테이블을 외부 호스팅 서비스에 업로드**하므로 사전에 데이터 검토가 필수 (→ 7.5절)

### 4.7 평가 방법

[auto-ontology-eval](https://github.com/NVIDIA/auto-ontology-eval)이 BIRD, BEAVER, FDABench-Lite, Wide World Importers 벤치마크로 성능을 측정합니다. 같은 모델에 같은 질문을 두 번 던집니다.

- **Control (대조군)**: 프롬프트에 DB 스키마를 제공
- **Treatment (실험군)**: Auto-Ontology 질의응답 에이전트가 컴파일된 온톨로지로 작업

결정론적 검증기가 실행 결과 일치(execution match)로 채점하고, 정확도 차이와 함께 **온톨로지가 고친 질문과 망친 질문**을 모두 나열합니다. 다중 턴 벤치마크인 BIRD-Interact는 별도 하네스에서 실행됩니다.

```bash
# auto-ontology-eval 설정 후 BIRD 비교 실행
uv run python main.py --database-name bird
```

---

## 5. 경쟁 프로젝트 비교

> 이 절은 2026년 11월 기준 공개 정보를 바탕으로 한 작성자 분석입니다. 각 제품의 기능은 빠르게 변하므로 도입 전 최신 문서를 확인 필요.

### 5.1 비교표

| 비교 대상 | 성격 | Auto-Ontology와의 차이 |
| --- | --- | --- |
| **Palantir Foundry Ontology** | 데이터·로직·액션·권한을 묶는 상용 **운영 레이어**. 쓰기 액션과 워크플로까지 포괄 | Auto-Ontology는 **읽기 중심의 질의 컨텍스트**에 집중하며 오픈소스·자체 호스팅. 메타데이터에서 초안을 **자동 생성**하는 것이 출발점. 액션·운영 워크플로 영역은 다루지 않음 |
| **Snowflake / Databricks 시맨틱 기능** (시맨틱 뷰, 메트릭 뷰 등) | 각 플랫폼 내부에 지표·차원을 정의하는 시맨틱 모델. 자사 AI 질의 기능과 결합 | Auto-Ontology는 **벤더 중립**으로 두 플랫폼을 포함한 10개 엔진을 함께 연결. 정의를 사람이 처음부터 쓰기보다 **자동 추출 후 인증**하는 흐름 |
| **dbt Semantic Layer / Cube** | 코드로 지표를 정의하고 BI·앱에 일관된 지표 API 제공 | 이쪽은 "사람이 정의한 지표를 정확히 서빙"이 중심. Auto-Ontology는 **LLM 에이전트용 도구**(답변 가능성 검사, 용어 검색, SQL 검증)가 중심. Ossie 같은 표준을 통한 공존 가능 |
| **Microsoft Fabric IQ** | Fabric/OneLake·Power BI 시맨틱 모델 기반의 온톨로지·에이전트 기능 | Auto-Ontology는 특정 클라우드·BI 스택에 묶이지 않고 **MCP로 Cursor, Claude Desktop 등 임의 클라이언트**와 연동 |
| **OWL / RDF / SPARQL** (전통적 시맨틱 웹) | 형식 논리 기반의 엄격한 온톨로지 표현과 추론 | Auto-Ontology는 형식 추론보다 **관계형 DB 위에서 정확한 SQL을 만드는 실용 그래프**에 초점. 저장소도 트리플 스토어가 아닌 Postgres + pgvector |
| **스키마 프롬프트 방식 Text-to-SQL** (자체 구현) | 스키마·샘플을 프롬프트에 넣고 LLM이 SQL 생성 | 2장 표의 비교 그대로. 대규모 스키마에서 토큰·조인 오류·과신 문제가 커짐. Auto-Ontology의 평가 저장소가 바로 이 방식을 대조군으로 삼음 |

### 5.2 선택 가이드

- **이미 dbt/Cube/플랫폼 시맨틱 모델이 있다** → 대체가 아니라 **보완**. Ossie로 가져와 에이전트용 컨텍스트 레이어로 얹는 구성이 자연스럽습니다.
- **에이전트가 여러 DB를 넘나들며 질문해야 한다** → Auto-Ontology의 강점 영역(교차 DB 용어 매핑, 답변 가능성 검사).
- **데이터 위에서 쓰기 액션·업무 프로세스까지 자동화해야 한다** → Auto-Ontology의 MCP 도구는 **읽기 전용**이므로 별도 운영 레이어가 필요합니다.
- **형식적 추론·표준 온톨로지 상호운용이 필수다** → OWL/RDF 계열이 더 적합합니다.

---

## 6. 설치 매뉴얼

### 6.1 사전 요구 사항

- Docker (Compose v2 포함)
- [uv](https://docs.astral.sh/uv/) (Python 패키지 관리자)
- NVIDIA API 키 (`nvapi-...`) — [build.nvidia.com](https://build.nvidia.com/)에서 발급

### 6.2 방법 1 — Docker Compose 로컬 실행 (Quickstart)

샘플 DB로 Microsoft의 **Wide World Importers** 판매 데이터베이스를 사용합니다.

**① 저장소 클론 및 `.env` 생성**

```bash
git clone https://github.com/NVIDIA/auto-ontology.git && cd auto-ontology
cp .env.example .env
```

`.env`에 다음 값을 설정합니다.

```dotenv
DEFAULT_MODELS_API_KEY=nvapi-...
AUTH_SECRET=<긴 랜덤 문자열, 예: openssl rand -base64 32 결과>
APP_URL=http://localhost:3000
POSTGRES_PASSWORD=<새 비밀번호>
CONNECTION_STRINGS=postgresql://postgres:<같은 비밀번호>@postgres:5432/wideworldimporters
AUTO_ONTOLOGY_ADMIN_PASSWORD=<새 비밀번호>
PGADMIN_PASSWORD=<새 비밀번호>
```

> **주의**
>
> - Compose는 Postgres, pgAdmin, 웹 앱을 **호스트에 공개**합니다. 시작 전에 모든 기본 비밀번호를 반드시 교체하십시오.
> - `.env.example`에는 모델 역할별 API 키 줄도 있습니다. 각 `nvapi-your-api-key-here`를 실제 키로 바꾸거나, 그 줄들을 **삭제**해 `DEFAULT_MODELS_API_KEY`로 폴백하게 하십시오.

**② Postgres 시작 및 샘플 DB 로드** (시드 스크립트는 auto-ontology-eval에 있음)

```bash
docker compose up -d --wait postgres
git clone https://github.com/NVIDIA/auto-ontology-eval.git ../auto-ontology-eval
(cd ../auto-ontology-eval && uv sync && cp .env.example .env && \
  POSTGRES_PASSWORD='<같은 비밀번호>' \
  uv run python scripts/seed/seed_wwi.py --database-name wideworldimporters --drop)
```

**③ 나머지 스택 빌드 및 시작**

```bash
docker compose up -d --build
```

**④ 로그인 및 시맨틱 컴파일 활성화**

1. http://localhost:3000 접속
2. `.env`의 `AUTO_ONTOLOGY_ADMIN_EMAIL` / `AUTO_ONTOLOGY_ADMIN_PASSWORD`로 로그인
3. **Settings → Semantic Compilation**을 켬
4. 수집(ingestion)은 시작 시 자동 실행되고, 컴파일이 바로 시작됩니다. 완료되면 **"Semantic compilation is ready"** 표시

**⑤ Chat에서 질문하기**

> What was revenue for the USB food flash drive - sushi roll in Pennsylvania in June 2015?

에이전트는 *revenue*, *product*, *state*를 온톨로지 용어로 해석하고, 관계를 따라 필요한 조인(invoice line → invoice → customer → city → state province)을 구성해 쿼리를 실행합니다. 답변(예: $588.80, 송장 라인 3건)과 함께 **SQL과 처리 단계**가 반환되므로 원본 데이터와 대조 검증할 수 있습니다.

**⑥ 답할 수 없는 질문 테스트**

Wide World Importers에는 광고 데이터가 없습니다. MCP로 연결된 에이전트에 광고비 대비 수익(ROAS)을 물으면 `check_answerable`이 커버리지 부족(예: 0.5, "ad spend"에 해당하는 용어 없음)을 감지하고, 매출만 볼지 혹은 광고비가 있는 다른 소스를 연결할지 **되묻습니다.** 이것이 Auto-Ontology의 핵심 차별점입니다.

### 6.3 방법 2 — Helm으로 Kubernetes 배포 (프로덕션)

**① NGC에서 차트 다운로드**

```bash
helm fetch https://helm.ngc.nvidia.com/nvidia/charts/auto-ontology-1.0.0.tgz
```

**② 시크릿 values 파일 작성**

명령줄이 아닌 **에디터로 작성**해 셸 히스토리·프로세스 인자에 남지 않게 하고, `chmod 600`으로 권한을 제한하며, git에 올리지 마십시오.

```yaml
# auto-ontology-secrets.yaml
defaultModelsApiKey: <API-KEY>
postgresPassword: <POSTGRES-PASSWORD>
adminEmail: <ADMIN-EMAIL>
adminPassword: <ADMIN-PASSWORD>
connectionStrings: <CONNECTION-STRINGS>   # 선택 사항. UI에서 추가해도 됨
```

```bash
chmod 600 auto-ontology-secrets.yaml
```

**③ 설치**

```bash
helm install auto-ontology auto-ontology-1.0.0.tgz -f auto-ontology-secrets.yaml
```

- `adminEmail`, `adminPassword`는 **필수**입니다. 셀프 가입이 비활성화되어 있어 이 값으로 첫 관리자가 생성되며, 없으면 설치가 실패합니다.
- 사용자가 `http://localhost:3000`(아래 포트 포워딩) 이외의 주소로 접속한다면 `appUrl`을 **그 정확한 origin**으로 설정하십시오.

**④ UI 노출**

```bash
kubectl port-forward svc/frontend 3000:3000
```

> 차트 버전은 NGC 카탈로그의 최신 릴리스에 맞게 바꾸십시오.

---

## 7. 운영 매뉴얼

### 7.1 MCP 서버 연동

MCP 서버는 MCP 클라이언트에 온톨로지 위의 **읽기 전용 도구**를 제공합니다. 각 사용자는 Auto-Ontology로 로그인하며, 모든 호출은 **해당 사용자의 권한**으로 실행됩니다.

| 용도 | 도구 |
| --- | --- |
| 준비 상태 | `check_readiness` — 이 배포가 무엇이든 답할 수 있는 상태인가 |
| 용어 | `search_terms`, `get_term`, `get_term_columns`, `get_term_sql_attributes`, `get_sql_attribute`, `describe_table` |
| 답변 가능성 | `check_answerable` — 온톨로지가 이 질문을 커버하는가 |
| 질문 | `ask_question` — 답변, SQL, 결과 행 |

**서버 실행**

```bash
AUTO_ONTOLOGY_API_URL=http://localhost:3000 \
  uvx --from "git+https://github.com/NVIDIA/auto-ontology.git#subdirectory=mcp" auto-ontology-mcp
```

**Cursor** (`~/.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "auto-ontology": { "url": "http://localhost:3003/mcp" }
  }
}
```

**Claude Desktop** (`claude_desktop_config.json`, `mcp-remote`로 브리지)

```json
{
  "mcpServers": {
    "auto-ontology": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:3003/mcp"]
    }
  }
}
```

설정 수정 후 클라이언트를 재시작하고, 로그인 프롬프트가 뜨면 로그인합니다. 상세 내용은 `docs/mcp.md` 참고.

**권장 에이전트 사용 패턴**: `check_readiness` → `check_answerable` → (커버리지 충분 시) `ask_question` → 반환된 SQL·행 검증. 커버리지가 부족하면 답을 지어내지 말고 사용자에게 되묻게 하십시오.

### 7.2 에이전트 스킬

코딩 에이전트에게 Auto-Ontology 사용법을 가르치는 스킬 3종이 포함되어 있습니다. 진입점은 `AGENTS.md`입니다.

| 스킬 | 다루는 범위 |
| --- | --- |
| `nvidia-ontology-setup` | 설치, 소스 연결, 컴파일, 준비 상태 확인 |
| `nvidia-ontology-management` | 검사, 모델링, 인증, 가져오기/내보내기, 게시 |
| `nvidia-ontology-query` | 질문하고 SQL·행·답변을 검증 |

### 7.3 REST API

웹 앱 origin(3000)의 `POST /api/chat/completions`로 질문합니다. 토큰은 사용자 메뉴 → **API Tokens**에서 발급합니다. 응답은 **SSE(server-sent events) 스트림**이며, `result` 이벤트에 답변이 담기고 `data: [DONE]`으로 종료됩니다.

**curl**

```bash
curl -N http://localhost:3000/api/chat/completions \
  -H "x-api-key: $AUTO_ONTOLOGY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "How many orders shipped last week?"}'
```

**Python**

```python
import json
import os

import requests

response = requests.post(
    "http://localhost:3000/api/chat/completions",
    headers={"x-api-key": os.environ["AUTO_ONTOLOGY_API_TOKEN"]},
    json={"question": "How many orders shipped last week?"},
    stream=True,
    timeout=900,
)
response.raise_for_status()

for line in response.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data:"):
        continue
    payload = line.removeprefix("data:").strip()
    if payload == "[DONE]":
        break
    event = json.loads(payload)
    if event["type"] == "result":
        print(event["answer"]["response"])
        print(event["answer"]["sql_code"])
    elif event["type"] == "error":
        raise RuntimeError(event["message"])
```

이벤트 타입·다중 턴 대화·게이트웨이 신뢰 경계는 `docs/conversation-api.md`, 그 외 모든 작업은 `docs/openapi/auto-ontology-api.json`(OpenAPI 스펙)을 참고하십시오.

### 7.4 모델 교체

역할별로 다음 변수를 설정하면 자체 호스팅 NIM이나 OpenAI 호환 엔드포인트를 쓸 수 있습니다.

```dotenv
<ROLE>_ENDPOINT=...
<ROLE>_API_KEY=...
<ROLE>_MODEL=...
# ROLE = REASONING | NON_REASONING | EMBED | RERANK
```

- 비워 둔 필드는 `DEFAULT_MODELS_<FIELD>`로 폴백 → 가장 단순한 구성은 `DEFAULT_MODELS_*`만 채우고 다른 것만 덮어쓰기
- **구조화 출력(structured output)을 지원하는 모델**을 사용할 것
- **임베딩 모델은 수집과 질의에서 반드시 동일하게 유지** — 바꾸면 pgvector 색인과 질의 벡터가 어긋남. 변경 시 재수집·재컴파일 필요
- 모든 변수는 `.env.example`에 문서화되어 있음

### 7.5 보안 체크리스트

| # | 항목 | 이유 |
| --- | --- | --- |
| 1 | **3001(Backend), 3002(Ingestion) 포트를 사설 네트워크에 격리** | Backend는 프론트엔드가 전달하는 `x-auto-ontology-user-id` 헤더를 그대로 신뢰하고, Ingestion의 ingest·delete·reset·compile 엔드포인트에는 **자체 인증이 없음** |
| 2 | 모든 클라이언트 트래픽은 **3000(웹 앱)** 경유 | 인증과 공개 API 게이트웨이가 여기서만 동작 |
| 3 | Compose 사용 시 **모든 기본 비밀번호 교체** | Postgres·pgAdmin·웹 앱이 호스트에 공개됨 |
| 4 | Helm 시크릿 파일 `chmod 600`, git 제외, 에디터로 작성 | 셸 히스토리·프로세스 인자 노출 방지 |
| 5 | **KumoRFM 활성화 전 데이터 검토** | 연결 테이블이 외부 호스팅 서비스로 업로드됨. `KUMO_MAX_TABLES`(기본 20), `KUMO_MAX_ROWS_PER_TABLE`(미설정 시 무제한)로 범위 제한 |
| 6 | 연결 자격 증명은 **HashiCorp Vault** 사용 검토 | `docs/connections.md` 참고 |
| 7 | 외부 통신 대상 파악 | 기본 모델 엔드포인트(`integrate.api.nvidia.com`, `ai.api.nvidia.com`), KumoRFM(키 설정 시), 소스 DB |
| 8 | 취약점은 `SECURITY.md` 절차로 제보 | 공개 이슈로 올리지 말 것 |

### 7.6 운영 루틴

1. **신규 소스 연결** → Settings → Connections 추가 → 수집·컴파일 완료 확인
2. **검증** → 실제 업무 질문 세트로 Chat/`check_answerable` 테스트
3. **정제** → 잘못 매핑된 용어, 모호한 설명, 부정확한 SQL 속성 수정
4. **인증** → 확정된 이름·설명·SQL 속성 Certify
5. **회귀 확인** → auto-ontology-eval 방식처럼 정답 SQL이 있는 질문 세트를 유지해 변경 후 정확도 비교
6. **표준 백업/이관** → Ossie YAML로 모델 정의 내보내기

### 7.7 트러블슈팅

| 증상 | 조치 |
| --- | --- |
| 재시작 후 UI에 왼쪽 내비게이션이 안 보임 | 브라우저의 오래된 세션 쿠키 문제. `localhost:3000`의 사이트 데이터를 지우고 다시 로그인 |
| Helm 설치 실패 | `adminEmail` / `adminPassword` 누락 여부 확인 |
| 로그인 후 리디렉션이 엉뚱한 주소로 감 | `.env`의 `APP_URL` 또는 Helm의 `appUrl`이 실제 접속 origin과 일치하는지 확인 |
| 모델 호출 인증 오류 | `.env.example`의 역할별 `nvapi-your-api-key-here` 줄이 남아 있는지 확인 |
| 질의 품질이 갑자기 떨어짐 | 임베딩 모델이 수집 시점과 달라지지 않았는지 확인 |
| 기타 설정 문제 | `skills/nvidia-ontology-setup/references/troubleshooting.md` |

---

## 8. 참고 문서

| 주제 | 문서 |
| --- | --- |
| Kubernetes(Helm) 배포 | `DEPLOYMENT.md` |
| 연결, 스코핑, Vault | `docs/connections.md` |
| 인증, SSO, API 토큰 | `docs/authentication.md` |
| Conversation API | `docs/conversation-api.md` |
| MCP 서버 | `docs/mcp.md` |
| REST API (OpenAPI) | `docs/openapi/auto-ontology-api.json` |
| 에이전트 진입점 | `AGENTS.md` |
| 평가 저장소 | https://github.com/NVIDIA/auto-ontology-eval |
| 통합 요청 | GitHub Issues → integration 템플릿 |

---

## 9. 정리

Auto-Ontology의 가치는 "더 빠른 Text-to-SQL"이 아니라 **"모를 때 모른다고 말하는 에이전트"**에 있습니다. 용어·SQL 속성·관계를 사람이 인증한 하나의 정의로 고정하고, 답변마다 SQL과 처리 과정을 함께 내놓아 **검증 가능한 답**을 만드는 것이 핵심입니다. 기존 시맨틱 레이어를 버릴 필요 없이, 그 위에 에이전트용 컨텍스트 레이어로 얹는 구성이 가장 현실적인 도입 경로입니다.

---

*작성: Dennis Kim (김호광) · Cyworld 전 대표 · https://github.com/gameworkerkim*
