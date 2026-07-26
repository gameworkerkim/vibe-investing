# Andrew Ng, 오픈소스 AI 업무 에이전트 'OpenWorker' 공개

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | OpenWorker |
| 개발 | Andrew Ng, Rohit Prasad (aisuite 공동 개발자) |
| 공개일 | 2026년 7월 23일 |
| 라이선스 | MIT |
| 현재 버전 | v0.1.6 (오픈 베타) |
| 저장소 | github.com/andrewyng/openworker |
| 공식 사이트 | openworker.com |
| 지원 OS | macOS 12+ (Apple Silicon, 서명·공증 완료), Windows 10/11 x64 (미서명 빌드 배포 중) |

---

## 1. 컨셉

OpenWorker의 핵심 명제는 "대화가 아니라 결과물"이다. 프롬프트를 받아 답변을 돌려주는 챗봇이 아니라, 원하는 **결과(outcome)** 를 지시하면 이를 단계로 분해하고 로컬 파일과 연동 도구를 오가며 실제 산출물을 만들어 내는 데스크톱 에이전트를 지향한다.

동작 흐름은 네 단계다.

| 단계 | 내용 |
| --- | --- |
| 1 | 사용자가 결과물을 지시 ("고객 브리핑 준비", "일정 정리", "Jira와 GitHub에서 릴리스 상태 확인") |
| 2 | 작업을 하위 단계로 분해, 로컬 파일·연동 앱을 순회하며 수행 |
| 3 | 메시지 발송, 일정 변경, 셸 명령 등 되돌리기 어려운 행위 직전에 승인 요청 |
| 4 | 열어서 공유할 수 있는 파일 형태의 최종 산출물 전달 |

### 아키텍처

```
OpenWorker 데스크톱 앱          Tauri 2 네이티브 셸 + React 18 UI
        |
로컬 에이전트 서버 (Python)      FastAPI/uvicorn, 127.0.0.1:8765, aisuite 기반
        |
로컬 파일·터미널 | 25+ 커넥터 | 사용자 선택 모델
```

에이전트 루프 자체가 사용자 머신에서 실행되는 로컬 우선(local-first) 구조이며, OpenWorker가 운영하는 추론 서비스는 존재하지 않는다. 유일한 클라우드 요소는 커넥터 OAuth 핸드셰이크를 중계하는 소규모 서비스이고, 이마저도 API 키를 수동 등록하면 로그인 없이 사용할 수 있다.

### 권한 모델

모든 툴 호출을 네 가지 위험 등급으로 타입 분류하고, 등급별로 승인 게이트를 건다. 승인 레이어를 UI 부가 기능이 아니라 타입 시스템 수준에서 다룬 점이 이 프로젝트의 설계적 차별점이다.

| 등급 | 성격 | 기본 정책 |
| --- | --- | --- |
| read | 읽기 | 자동 허용 |
| write_local | 로컬 쓰기 | 승인 필요 |
| exec | 명령 실행 | 승인 필수 |
| external | 외부 전송 | 승인 필수 |

무인 실행(automation) 모드에서는 승인이 필요한 작업을 임의로 수행하지 않고 인박스에 적체시킨 뒤 사용자 확인을 기다린다.

---

## 2. 장점

| 구분 | 내용 |
| --- | --- |
| 모델 종속 없음 | aisuite 기반 BYOK 구조. OpenAI, Anthropic, Google Gemini, Inkling, GLM, DeepSeek, Kimi, Qwen, MiniMax, Mistral, Grok 지원. Together·Fireworks로 오픈웨이트 모델, Ollama로 완전 로컬 실행 |
| 데이터 경로 통제 | 대화 이력, 커넥터 토큰, 모델 키가 모두 로컬 시크릿 스토어에 보관. 민감 작업은 Ollama로, 일반 작업은 클라우드로 라우팅하는 분리 운용 가능 |
| 승인 게이트의 구조화 | 위험 등급이 코드 레벨 타입으로 정의돼 감사 가능. "에이전트가 멋대로 메일을 보냈다" 류 사고의 표면적이 좁다 |
| 연동 폭 | GitHub, Slack, Jira, Notion, Linear, HubSpot, Outlook, monday.com, Gmail, Google Calendar 등 25개 이상 네이티브 커넥터 + 터미널·로컬 파일 + MCP 임의 확장 |
| 산출물 지향 | 문서, 스프레드시트, 리포트, 웹페이지를 파일로 반환. 요약문이 아니라 열어볼 수 있는 결과물 |
| 스케줄 실행 | 모닝 브리프, 주간 리포트, 채널 상시 감시 등 반복 작업 자동화. 실행 기록이 전체 트랜스크립트로 남음 |
| Slack 진입점 | 채널에서 `@OpenWorker` 멘션 시 데스크톱에 세션이 열리고 결과가 스레드로 회신 |
| 라이선스 | MIT. 감사·포크·상용 활용 제약 없음 |

---

## 3. 단점 및 유의점

| 구분 | 내용 |
| --- | --- |
| 로컬 우선 ≠ 로컬 완결 | 에이전트 루프만 로컬일 뿐, 클라우드 API 키를 쓰는 순간 파일 내용과 컨텍스트는 외부 모델 제공자로 전송된다. 실질적 프라이버시를 원하면 Ollama 경로가 사실상 유일하고, 그 경우 도구 호출 정확도는 프런티어 모델 대비 떨어진다 |
| 성숙도 | 공개 시점 기준 오픈 베타, 커밋 수 45개 수준의 초기 저장소. 스타 수는 출처마다 46개부터 3,400개까지 편차가 커 인용 시 주의가 필요하다 |
| Windows 미서명 | Windows 빌드는 코드 서명이 진행 중이라 SmartScreen 경고가 발생. 기업 환경 배포에는 부적합 |
| 비용 전가 | 앱은 무료지만 모델 요금은 전액 사용자 부담. 에이전트 루프 특성상 단일 작업에서 토큰 소모가 크다 |
| 운영 부담 | 설치, 키 관리, 커넥터 인증, 모델 선택이 모두 사용자 책임. 관리형 클라우드 에이전트 대비 진입 비용이 높다 |
| 로컬 실행의 공격면 | 터미널 접근과 로컬 파일 접근을 기본 제공하는 구조는 프롬프트 인젝션 관점에서 위험도가 높다. 외부 문서·이메일·이슈 본문을 읽는 작업에서 지시문 주입이 발생할 경우 exec 등급 승인 화면이 마지막 방어선이 된다. 승인 피로(approval fatigue)로 인한 습관적 승인이 실질적 취약점 |
| MCP 확장의 양면성 | 임의 MCP 서버 연결이 가능하다는 것은 공급망 검증 책임도 사용자에게 있다는 뜻 |
| 기여 정책 | 내부 로드맵 우선으로 운영되며, 방향이 다른 PR은 반려한다고 명시. 오픈소스지만 거버넌스는 중앙집중적 |
| 검증 모델 한정 | 도구 호출 검증을 마친 큐레이션 모델 목록이 30개 내외. 목록 밖 모델은 사용자 책임 |

---

## 4. 유사 및 경쟁 프로젝트

| 프로젝트 | 라이선스 | 성격 | OpenWorker 대비 |
| --- | --- | --- | --- |
| Goose (Agentic AI Foundation) | Apache 2.0 | Rust 기반 로컬 에이전트 런타임. 데스크톱 앱 + CLI + 임베더블 API | 가장 직접적인 경쟁자. 25개 이상 모델 제공자, 70개 이상 MCP 확장, 서브에이전트, macOS·Windows·Linux 전부 지원. Linux Foundation 거버넌스로 중립성 우위. 성숙도와 생태계에서 크게 앞선다 |
| OpenHands (All Hands AI) | MIT | 코딩 자율 에이전트. Docker 샌드박스 실행, SDK·CLI·클라우드 | 벤치마크(SWE-bench) 중심의 개발 작업 특화. 업무 자동화보다 이슈 해결에 최적. 샌드박스 격리는 OpenWorker보다 강함 |
| Open Interpreter | Apache 2.0 | CLI 우선 로컬 실행 에이전트 | 더 원시적이고 범용적. GUI와 커넥터 생태계가 없음 |
| Cline / Kilo Code | 오픈소스 | IDE 내장 에이전트 (VS Code, JetBrains) | 코드 편집 특화. 업무 도구 연동 영역이 아님 |
| Claude Cowork / Claude Desktop | 상용 | 관리형 에이전틱 지식노동 도구 | 설치·키 관리 부담 없음. 대신 모델 선택권과 데이터 로컬성 없음 |
| Manus | 상용 | 크레딧 기반 자율 태스크 에이전트 | 완성된 제품 경험. 오픈소스 아님 |
| Poke 등 메시징 네이티브 에이전트 | 상용 | 문자·채팅 안에서 동작하는 개인 비서 | 파일 산출물이 아니라 대화 흐름 중심. 용도가 다름 |
| n8n / Dify / Zapier Agents | 혼합 | 워크플로 오케스트레이션 | 사전 정의된 플로우 실행. 목표 기반 자율 분해가 아님 |

### 포지셔닝 요약

OpenWorker의 좌표는 "Goose가 개발자용 로컬 에이전트라면, OpenWorker는 지식노동자용 로컬 에이전트"에 가깝다. 다만 Goose 역시 코드 외 업무를 처리하도록 확장되고 있어 차별점은 산출물 지향 UX와 승인 레이어의 타입화 정도로 좁혀진다. Andrew Ng의 이름값이 초기 채택을 견인하겠지만, 기술적 해자는 현시점에서 뚜렷하지 않다.

---

## 5. Getting Started

### 5.1 바이너리 설치 (권장)

| OS | 다운로드 | 비고 |
| --- | --- | --- |
| macOS 12+ (Apple Silicon) | download.openworker.com/mac | 서명·공증 완료, 자동 업데이트 |
| Windows 10/11 (x64) | download.openworker.com/windows | 미서명, SmartScreen 경고 발생 |

설치 후 절차:

1. 앱 실행
2. 모델 제공자 선택 후 API 키 입력 (또는 Ollama 엔드포인트 지정)
3. 필요한 커넥터 인증 (OAuth 또는 수동 API 키)
4. 실제 업무 지시 입력

### 5.2 완전 로컬 구성 (키 없이 사용)

```bash
# Ollama 설치 후 모델 준비
ollama pull qwen3
# 앱 설정에서 provider를 Ollama, 엔드포인트를 http://localhost:11434 로 지정
```

이 구성에서는 외부로 나가는 데이터가 없다. 다만 도구 호출 안정성은 별도 검증이 필요하다.

### 5.3 소스 빌드

사전 요구사항: Python 3.10+, Node 20+, Rust 툴체인(rustup, 데스크톱 셸 빌드 시)

```bash
git clone https://github.com/andrewyng/openworker
cd openworker

# 1. 최초 1회 부트스트랩 (.venv 생성)
#    Windows는 Git Bash 또는 WSL에서 실행
bash packaging/setup_dev_env.sh

# 2. 로컬 에이전트 서버 기동
.venv/bin/openworker-server --cwd ~/some/project --port 8765
#    Windows: .venv\Scripts\openworker-server.exe

# 3. 별도 터미널에서 UI 기동
cd surfaces/gui
npm install
npm run dev          # Vite 개발 서버 기반 브라우저 UI
```

브라우저 UI 대신 데스크톱 앱 전체를 구동하려면 3번을 `npm run tauri dev`로 대체한다. Tauri 셸이 서버 프로세스까지 관리한다.

테스트 및 패키징:

```bash
.venv/bin/pytest                    # 백엔드 테스트
cd surfaces/gui && npm test         # GUI 유닛 테스트
cd surfaces/gui && npm run e2e      # E2E 테스트
bash packaging/build_dmg.sh         # macOS DMG
pwsh packaging/build_windows.ps1    # Windows 인스톨러
```

### 5.4 저장소 구조

| 디렉터리 | 내용 |
| --- | --- |
| `coworker/` | Python 백엔드: 에이전트 엔진, 모델 제공자, 커넥터, MCP 클라이언트, 메모리, 자동화 |
| `surfaces/gui/` | React UI + Tauri 셸 |
| `stt/` | 음성 입력용 Rust STT 사이드카 |
| `packaging/` | 인스톨러 빌드, 자동 업데이트 매니페스트, 개발 환경 부트스트랩 |
| `docs/` | 설계 문서, 의사결정 로그 |
| `tests/` | 백엔드 테스트 스위트 |

### 5.5 도입 전 점검 항목

| 점검 | 판단 기준 |
| --- | --- |
| 데이터 민감도 | 사내 기밀을 다룬다면 Ollama 전용 구성 외에는 선택지가 없다 |
| 승인 정책 | 조직 배포 시 exec/external 등급의 기본 정책을 명문화할 것 |
| 커넥터 권한 | OAuth 스코프를 최소 권한으로 제한. Gmail·Slack 전체 권한 부여는 지양 |
| 비용 상한 | 모델 제공자 측에서 사용량 한도를 먼저 설정할 것 |
| 대안 비교 | 개발 작업 비중이 높다면 Goose 또는 OpenHands를 먼저 검토 |

---

## 참고

- 공식 사이트: https://openworker.com
- 저장소: https://github.com/andrewyng/openworker
- 기반 라이브러리: https://github.com/andrewyng/aisuite
- 공개 발표: https://x.com/AndrewYNg/status/2080333504446108104

#OpenWorker #AndrewNg #AI에이전트 #OpenSource #업무자동화 #생성형AI #LLM
