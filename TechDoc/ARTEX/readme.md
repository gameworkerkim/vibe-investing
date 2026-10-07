# ARTEX — LLM 멀티 에이전트 자율 침투 테스트 (Getting Started)

> 기준: 공식 저장소 `github.com/Autumn-27/ARTEX` (원본, 중국어) · `github.com/jiwoochris/artex-ko` (한국어판)
> 라이선스 AGPL-3.0 · Go 단일 바이너리 백엔드 + 내장 Next.js 프런트엔드 · 데이터베이스 PostgreSQL

한국어 버전을 만들어주신 분께 감사 인사를 드립니다. 최근 보안, 모의 해킹 프로그램의 특징은 LLM을 결합하여 효율적인 보안 검증을 한다는 것에 있습니다. 그리고 이런 툴로 인해 극도로 저렴한 해킹이 가능하고 지식 수준이 높지 않더라도 해킹이 가능한 문제점이 발생하고 있습니다.

>"Let it work, / For 'tis the sport to have the enginer / Hoist with his own petard..."
> (그냥 두고 보자. 설계자가 자신의 폭탄에 맞아 공중으로 날아가는 꼴을 보는 것이야말로 재미있는 일이니까...) - 햄릿, 세익스피어



---

> ## 보안·오남용 경고 — 반드시 먼저 읽어 주세요
>
> **ARTEX 는 사람이 거의 개입하지 않아도 정찰 → 침투 → 자료 반출까지 공격 과정을 스스로 수행하는 강력한 자율 공격 도구입니다.** 그만큼 오남용이 일으키는 피해도 큽니다.
>
> - **허가 없는 사용은 그 자체로 범죄입니다.** 자신이 소유하거나 **서면으로 명시적 허가를 받은 대상이 아니라면**, 어떤 시스템에도 스캐닝·탐지·익스플로잇을 실행하지 마십시오. 대한민국에서 권한 없이 정보통신망에 침입하는 행위는 **「정보통신망 이용촉진 및 정보보호 등에 관한 법률」** 위반이며, 개인정보가 결부되면 **「개인정보 보호법」** 도 함께 적용됩니다.
> - **실제 서비스나 타인의 자산을 대상으로 삼지 마십시오.** 학습·연구, 그리고 본인이 소유한 **로컬 격리 환경**(OWASP Juice Shop, DVWA, Metasploitable 등 의도적으로 취약하게 만든 환경)에서만 검증하십시오.
> - **방어하는 관점으로 읽으십시오.** 이 도구를 이해하는 목적은 공격을 돕는 데 있지 않고, 자율 AI 공격의 작동 원리를 이해하고 탐지·차단 역량을 갖추는 데 있습니다.
>
> 본 문서와 도구를 사용하는 것은 모든 조건을 읽고 이해하고 동의한 것으로 간주합니다. **모든 법적 책임과 결과는 사용자 본인이 부담합니다.**

---

## 1. ARTEX 소개

**ARTEX**(Autonomous penetration testing system)는 **LLM(대형언어모델)이 조종하는 여러 에이전트가 목표를 스스로 분해하고, 실제 도구를 실행하고, 발견한 자산·취약점을 그래프에 쌓아 가며 침투 테스트 전 과정을 자율적으로 끌고 가는 시스템**입니다.

- 원본은 중국산 오픈소스 프로젝트 **[Autumn-27/ARTEX](https://github.com/Autumn-27/ARTEX)**(AGPL-3.0)이며, 국내 사용자를 위한 한국어 현지화 판본 **[jiwoochris/artex-ko](https://github.com/jiwoochris/artex-ko)** 가 따로 존재합니다.
- 기술 스택: **Go 단일 바이너리 백엔드 + 내장 Next.js 프런트엔드 + PostgreSQL**.
- 에이전트 런타임은 저자의 **`norma` SDK**(`github.com/Autumn-27/norma`)가 제공합니다.
- 기존 스캐너(Nuclei, Nessus 등)가 "정해진 규칙을 기계적으로 던지는" 방식이라면, ARTEX 는 **LLM 이 상황을 읽고 다음 공격 단계를 스스로 결정**한다는 점이 본질적으로 다릅니다.

### 핵심 용어

| 용어 | 의미 |
|---|---|
| **goal / goals** | 사용자가 준 목표를 분해하고 침투 범위(scope)를 추출하는 단계 |
| **planner** | 탐색 그래프 상황을 읽고, 새 방향이 있을 때만 **의도(intent)** 를 생성하는 유일한 계획자 |
| **worker** | 의도 하나를 맡아 실제 도구(Kali/Bash/HTTP)를 실행하고 결과를 그래프에 기록하는 실행자(×N) |
| **mainagent** | 실행 중 사람이 끼어들어 힌트를 주는 사람-개입(human-in-the-loop) 에이전트 |
| **탐색 그래프** | 한 작업의 "사고·진행" 과정(goal/intent/fact/finding/hint)을 간선으로 잇는 작업별 체인 |
| **자산 그래프** | 작업을 가로질러 공유하는 자산 진실 저장소(root_domain/subdomain/ip/service/app/endpoint) |

---

## 2. 전체적인 기능과 컨셉

### 2-1. 핵심 컨셉 — 이중 그래프 구조

ARTEX 는 "대상이 무엇인가(자산)"와 "어디까지 테스트했는가(탐색)"를 **서로 독립적이면서 앵커로 연결되는 두 그래프**로 나눕니다.

- **자산 그래프(전역 공유)**: 도메인 → 서브도메인 → 서비스 → 엔드포인트의 부모·자식 관계와 중복 제거 키는 전부 프로그램이 계산. 에이전트는 원본 정보만 제출.
- **탐색 그래프(작업별 독립)**: `goal → intent → fact → finding`이 `spawns / yields / derived_from / proves` 간선으로 이어져 "어떤 방향이 어떤 사실에서 파생되어 무엇을 산출했는지"를 추적.
- **앵커(`exploration_anchors`)**: 의도·사실·취약점을 구체적인 자산에 고정 → 자산 커버리지/커버리지 그래프를 가능하게 함.

### 2-2. 두 가지 자율성 장치

1. **worker 간 과정 단위 정보 교환** — `search_all_worker_traces(q)` 등으로 다른 worker 의 실행 과정 속 관찰(에러·응답 조각·숨은 파라미터)을 재사용. 중복 노동 제거.
2. **planner 의 다중 라운드 공유 todolist** — 의존 관계가 있는 다단계 공격 체인(주입점 발견 → 자격 획득 → 측면 이동 → 권한 상승)을 한 번 기록해 두고, 선행 단계의 fact 가 충족될 때만 다음 의도를 배정. "이벤트 구동 + 무상태 세션"에서도 체인이 안정적으로 순서대로 진행.

### 2-3. 주요 기능(UI 기준)

| 기능 | 설명 |
|---|---|
| **대시보드** | 활성 작업·확인 취약점·자산 노드·LLM 토큰 소비·활동 흐름을 한 화면에서 |
| **작업(Tasks)** | 침투 작업 생성·일시정지·중지, 실행 세션·도구 호출·탐색 체인 확인 |
| **자산 / 커버리지 그래프** | 자산 그래프와 "범위 내 자산 + 테스트된 자산 하이라이트" 시각화 |
| **취약점(Findings)** | 심각도·상태·자산·소속 작업으로 집계, CSV 내보내기 |
| **트래픽 기록** | 기록형 MITM 프록시로 Bash/HTTP 전 과정을 CA 검증과 함께 기록 |
| **대화(사람 개입)** | 자율 실행 중 힌트를 주고 에이전트가 공격 체인을 요약 |
| **인터셉트 승인** | 위험 도구 호출 전 사람 승인 게이트(guard/intercept) |
| **에이전트 관리 / LLM 설정** | 역할별 프롬프트·LLM·도구·예산 관리, LLM 프로파일 설정 |
| **자산 동기화** | [ScopeSentry](https://github.com/Autumn-27/ScopeSentry) 연동으로 자산 데이터 일괄 가져오기 |
| **MCP / skills / memory / report** | 외부 도구·스킬·메모리·최종 리포트 생성 |

### 2-4. 시스템 계층

```
프런트엔드(Next.js, go:embed 내장) → server(Go net/http, JWT/SSE) → engine(스케줄링 루프)
   → agent(norma SDK: goals/planner/worker/mainagent) → PostgreSQL(이중 그래프)
지원: 기록 MITM 프록시 · 승인 게이트 · DNS/HTTP 비동기 보강 · MCP/스킬/메모리/리포트
```

---

## 3. 유사 프로젝트

| 프로젝트 | 설명 | ARTEX 와의 차이/관계 |
|---|---|---|
| **[PentestGPT](https://github.com/GreyDGL/PentestGPT)** | LLM 으로 침투 테스트를 가이드하는 대화형 도구 | LLM 이 "조언"하지만 실제 도구 실행·자산/탐색 그래프·멀티 에이전트 병렬성은 약함 |
| **[RAI (RaianBots)](https://github.com/obfio/raianbots-ng)** | Hacktive Security 의 자율 침투 에이전트 | 자율 멀티 에이전트 지향이지만, ARTEX 는 이중 그래프 기반 상태 관리·보고·커버리지에 강점 |
| **[HackSynth](https://github.com/Azure/hack-synth)** | LLM 자율 침투 에이전트 + 평가 벤치마크(CTF) | 벤치마크·실험 중심; ARTEX 는 실무 워크플로(자산·커버리지·리포트) 중심 |
| **[Enigma](https://github.com/CyberarkLabs/Enigma)** | CyberArk Labs 의 LLM 기반 침투 에이전트 | 활발한 연구 프로젝트이나 시스템화·운영 UI 는 ARTEX 가 더 완성도 높음 |
| **[AutoPenBench](https://github.com/ntctl/AutoPenBench)** | LLM 침투 에이전트용 벤치마크 프레임워크 | 평가 도구로, ARTEX 같은 실행 시스템과 보완 관계 |
| **[Cairn](https://github.com/oritera/Cairn)** | 원본 ARTEX README 가 참조로 인용한 프로젝트 | 설계 참고(업스트림 명시) |
| **[ScopeSentry](https://github.com/Autumn-27/ScopeSentry)** | 같은 저자의 자산 수집 도구 | ARTEX 와 연동해 자산을 일괄 가져오는 보완 도구 |
| **[AegisHook](https://github.com/RuoJi6/AegisHook)** | 승인(approval) UI 를 참조한 프로젝트 | ARTEX 의 승인 상세 컴포넌트가 이 구조를 참고 |
| **[norma](https://github.com/Autumn-27/norma)** | 저자의 에이전트 SDK | ARTEX 의 에이전트 런타임(상하 관계) |

> 요약: ARTEX 의 차별점은 **LLM 멀티 에이전트 자율성 + 이중 그래프 상태 저장 + 웹 운영 UI + 리포트/탐지 자산화**가 하나의 배포 가능한 제품으로 묶여 있다는 점입니다.

---

## 4. 사용법 — 설정, LLM 설치 방법

### 4-1. 사전 요구 사항

- **PostgreSQL** (Docker Compose 경로는 compose 가 함께 띄움)
- **Docker / Docker Compose** (권장 경로) 또는 **Go + Node.js** (소스 컴파일 경로)
- **LLM API 키** — Anthropic 또는 OpenAI, 또는 OpenAI 호환 엔드포인트(국산·오픈 모델)

### 4-2. 설치

#### (1) Docker Compose (가장 빠름)

```bash
git clone https://github.com/jiwoochris/artex-ko.git
cd artex-ko
cp .env.example .env          # POSTGRES_PASSWORD 설정, ANTHROPIC_API_KEY 는 선택
docker compose up -d          # artex 이미지 + postgres 기동
# → http://localhost:8787 접속 (처음엔 /setup 에서 관리자 비밀번호 설정)
```

> ⚠️ **주의:** 위 compose 가 내려받는 이미지는 원작자 Docker Hub 의 **중국어 빌드(`autumn27/artex`)** 입니다. 한국어판 UI·리포트·`langDirective` 가 아직 담겨 있지 않으므로, 한국어 출력을 원하면 아래 "소스 컴파일" 경로를 사용하십시오.

#### (2) 소스에서 단일 바이너리 컴파일 (한국어판 권장)

```bash
cd web && npm ci && npm run build:static && cd ..     # 1) 프런트엔드 정적 빌드
mkdir -p server/webui && cp -r web/out server/webui/dist   # 2) 내장 디렉터리 복사
CGO_ENABLED=0 go build -tags embedui -o artex ./cmd/artex   # 3) 프런트 내장 컴파일
./start.sh                                            # → http://localhost:8787
```

> 실행은 `./artex` 를 직접 돌리지 말고 **`start.sh`(Windows 는 `start.bat`)** 로 하십시오. 이 스크립트는 종료 코드에 따라 프로그램을 다시 띄우는 감시자이며, UI 의 "원클릭 업데이트"도 이를 통해 처리됩니다.

#### (3) 기타: 설치 스크립트 / 사전 컴파일 바이너리

- **설치 스크립트**: `./install.sh` — Docker 감지·설치 후 "① 전부 Docker / ② 로컬 컴파일 실행" 선택.
- **사전 컴파일 바이너리**: [Releases](https://github.com/Autumn-27/ARTEX/releases) 에서 플랫폼별 zip 을 받아 `config.json` 만 채우고 `./start.sh` 로 실행.

### 4-3. 데이터베이스 설정

`config.json`(또는 환경 변수 `ARTEX_PG_DSN` 로 덮어쓰기):

```json
{
  "database": {
    "host": "127.0.0.1", "port": 5432,
    "user": "artex", "password": "yourpass",
    "dbname": "artex", "sslmode": "disable"
  }
}
```

### 4-4. LLM 설치(설정) 방법

ARTEX 는 탐색 전 과정을 LLM 이 결정하므로 **LLM 설정이 사실상 "엔진의 성능 차이"**를 보여줍니다.

| 방법 | 설정 | 비고 |
|---|---|---|
| 환경 변수 | `export ANTHROPIC_API_KEY=sk-...` 또는 `export OPENAI_API_KEY=sk-...` | 가장 단순 |
| UI 설정 | "LLM 설정" 페이지에서 키·프로파일 입력 | 런타임 변경 가능 |
| 선택 환경 변수 | `ARTEX_LLM_PROVIDER` / `ARTEX_LLM_MODEL` / `ARTEX_LLM_BASE_URL` / `ARTEX_LLM_PROXY` | 공급자·모델·엔드포인트·프록시 지정 |
| 국산·오픈 모델 | OpenAI 호환 `ARTEX_LLM_BASE_URL` 지정 | Ollama·vLLM·국산 API 등 호환 엔드포인트 |

#### LLM 설정 시 반드시 알아야 할 함정

1. **모델 역량 = 출력 품질.** 저가·소형 모델(`gpt-4o-mini` 등)은 리포트가 원문(중국어)으로 되돌아가는 등 한국어화가 깨질 수 있습니다. 사람이 읽는 리포트가 필요하다면 `claude-opus-4-8`(기본), `gpt-4o` 등 역량 있는 프런티어 모델을 사용하십시오. 중국산 GLM, KIMI의 경우 제약이 풀렸기 때문에 효율적인 모의 침투가 가능합니다.
2. **OpenAI 호환 경로의 토큰 상한 함정.** `gpt-4o` 계열은 응답 토큰 상한이 **16,384** 인데, OpenAI 호환 요청에는 기본적으로 더 큰 상한(32,768)이 실려 모든 호출이 `400 (max_tokens is too large)` 로 실패할 수 있습니다. 해당 LLM 프로파일의 `max_tokens` 를 **16,384 이하**로 지정하십시오. Anthropic 계열(기본 `claude-opus-4-8`)은 32,768 을 허용합니다.
3. **추론형(reasoning) 모델은 `max_tokens` 를 넉넉히.** 사고 채널을 따로 쓰는 모델은 상한이 작으면 예산을 내부 추론에 소진하고 최종 답변을 비워 둘 수 있습니다.

### 4-5. 기타 설정

- **동시성:** 작업마다 돌리는 worker 에이전트 수(기본 3)는 "시스템 설정"에서 조정.
- **주요 실행 인자:** `./start.sh -addr :8787 -proxy :8788` — `-addr` 는 프런트엔드+API, `-proxy` 는 트래픽 기록 프록시 포트.
- **리버스 프록시 배포(HTTPS/443 만 개방):** 프런트·API·SSE 모두 같은 포트(:8787)에서 제공하고 SSE 는 기본 동일 출처(same-origin)이므로 `NEXT_PUBLIC_SSE_BASE` 불필요. 단 SSE 는 장시간 연결이므로 **리버스 프록시에서 버퍼링을 반드시 꺼야** 합니다(Nginx: `proxy_buffering off; proxy_cache off; proxy_read_timeout 3600s;`).

---

## 5. 모의 침투 테스트 방법

> 이하 절차는 **본인이 소유한 로컬 격리 환경**에서만 수행하십시오. 남의 시스템을 모의 침투하는 것은 해킹입니다.

### 5-1. 전제: 테스트 환경 구성

- **의도적으로 취약한 실습 앱**을 로컬에서 띄웁니다: [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/), [DVWA](https://github.com/digininja/DVWA), Metasploitable 등.
- 대상은 로컬(예: `http://127.0.0.1:3000`) 또는 **사설 대역/가상 도메인**으로 제한합니다.

### 5-2. 실행 순서

1. **기동 & 관리자 설정** — `http://localhost:8787` 접속, 첫 진입 시 `/setup` 에서 관리자 비밀번호 설정.
2. **LLM 설정** — LLM 설정 페이지(또는 환경 변수)에서 API 키와 프로파일(모델·`max_tokens`)을 등록.
3. **자산 준비(선택)** — 자산 그래프에 회사/도메인/IP 를 등록하거나, ScopeSentry 를 연동해 일괄 가져오기.
4. **작업 생성** — "작업"에서 대상(타깃 자산/범위)과 목표(goal)를 지정해 작업 생성.
5. **자율 실행 관찰** — `goals` 가 목표를 분해하고 범위를 추출 → `planner` 가 의도를 배정 → `worker` 가 실제 도구를 실행하는 폐곡선을 대시보드·탐색 체인·활동 흐름에서 실시간 관찰.
6. **사람 개입(선택)** — 실행 중 "대화"에서 힌트를 주거나, "인터셉트 승인"에서 위험 도구 호출을 승인/거부.
7. **결과 확인** — 취약점 목록(심각도·상태·자산), 자산 커버리지 그래프, 트래픽 기록, 최종 리포트를 검토하고 CSV 로 내보내기.
8. **재검증(retest)** — 필요 시 재검증 기능으로 발견 취약점이 수정되었는지 재확인.

### 5-3. 자율 실행의 흐름(내부 동작)

```
그래프 변경 → planner 깨움 → 상황 읽기 → (새 방향이 있으면) 의도 배정
   → worker 가 의도 수령 → 실제 도구 실행(기록 프록시 통과) → fact/asset/finding 기록
   → 그래프 변경(폐곡선) → ... → 목표가 증명(prove_goal)되면 종료
```

---

## 6. 모의 침투 테스트 시나리오

> 모든 시나리오는 **권한 있는 로컬 격리 환경**을 가정합니다. 운영/타인 자산에 대해서는 절대 수행하지 마십시오.

| # | 시나리오 | 대상(예) | 기대하는 자율 진행 |
|---|---|---|---|
| 1 | **웹 앱 취약점 스캐닝** | OWASP Juice Shop | 정찰 → 엔드포인트 식별 → SQLi/XSS/취약 인증 탐지 → finding 기록 |
| 2 | **주입 → 자격 탈취 → 측면 이동 → 권한 상승** | DVWA + 내부 서비스 | planner 의 공유 todolist 가 4단계 체인을 의존 순서대로 한 단계씩 진행 |
| 3 | **자산 발견·커버리지 검증** | 사설 대역의 가상 도메인(예: `acme.local`) | 서브도메인/IP/서비스/엔드포인트를 자산 그래프에 축적하고 커버리지 시각화 |
| 4 | **취약 인증·세션 관리 점검** | 로컬로 띄운 취약한 로그인 앱 | 브루트포스/자격 스터핑 경로를 시도하고 fact·finding 으로 기록 |
| 5 | **알려진 CVE 기반 검증** | 취약 버전이 설치된 로컬 서비스 | 에이전트가 버전 식별 → 공개 CVE/공격 경로를 탐색 → 재현 여부 기록 |

각 시나리오에서 결과는 **탐색 체인(어떤 의도가 어떤 사실에서 파생됐는지)과 리포트로 재구성**할 수 있어, 공격 경로를 역추적하고 방어·탐지 규칙을 설계하는 데 활용할 수 있습니다.

---

## 7. 이 프로젝트의 장점과 단점

### 장점

- **진짜 "자율" 멀티 에이전트**: 규칙 기반 스캐너와 달리 LLM 이 상황을 판단해 다음 단계를 스스로 결정.
- **상태가 있는 탐색**: 이중 그래프(자산+탐색)로 진행을 구조화해 커버리지·혈통 추적·리포트가 가능.
- **다단계 공격 체인 완주**: 공유 todolist + worker 간 과정 교환으로 순서 있는 체인이 안정적으로 진행.
- **완성도 높은 운영 경험**: 내장 웹 UI(대시보드·트래픽·승인·에이전트 관리), 단일 바이너리 배포, 자동 마이그레이션, 원클릭 업데이트.
- **방어·탐지 자료 동봉**(한국어판): Sigma/Suricata 탐지 규칙, ATT&CK 커버리지, MISP 지표 등 "방어자" 관점 자료까지 제공.
- **확장성**: MCP · 스킬 · ScopeSentry 자산 동기화 · OpenAI 호환 엔드포인트로 국산/오픈 모델 교체 가능.

### 단점 / 한계

- **강력한 오남용 위험**: 자율 공격 능력이 곧 위험 — 국내 금융기관 대상 개인정보 유출 공격에 사용된 정황이 보도되는 등 실제 범죄 악용 사례가 보고됨.
- **LLM 의존성과 비용**: 품질이 모델 역량·토큰 소비에 직접 좌우. 소형 모델은 한국어화·판단 품질이 떨어짐.
- **출력 언어 드리프트**: 한국어화가 프롬프트 유도(`langDirective`) 방식이라 역할·맥락·모델에 따라 영어/원문으로 돌아갈 수 있음.
- **결정론 부족**: LLM 특성상 같은 입력에도 실행 경로가 달라질 수 있어 재현성·정합성이 스캐너보다 낮음.
- **안전성·오탐 관리 필요**: 자율 실행은 위험 도구를 직접 호출하므로 승인 게이트(guard/intercept) 설정과 로그 감사가 사실상 필수.
- **라이선스 부담**: AGPL-3.0 — 수정해 네트워크 서비스로 제공하면 대응 소스 공개 의무 발생.
- **상류(업스트림) 종속**: 한국어판 Docker 이미지가 아직 없어 한국어 출력을 원하면 소스 컴파일 필요.

---

## 참고

- 원본 저장소(중국어): [Autumn-27/ARTEX](https://github.com/Autumn-27/ARTEX)
- 한국어판 저장소: [jiwoochris/artex-ko](https://github.com/jiwoochris/artex-ko)
- 한국어판 방어·탐지 가이드: [`docs/defense-ko.md`](https://github.com/jiwoochris/artex-ko/blob/main/docs/defense-ko.md)
- 배포용 탐지 규칙(Sigma/Suricata/MISP): [`detections/`](https://github.com/jiwoochris/artex-ko/tree/main/detections)
- 원본 온라인 데모(중국어 UI): [https://artex-demo.vercel.app/](https://artex-demo.vercel.app/)
 - 에이전트 SDK: [Autumn-27/norma](https://github.com/Autumn-27/norma)
