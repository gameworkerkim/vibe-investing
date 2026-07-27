# OpenHands, 자율 코딩 에이전트에서 에이전트 컨트롤 센터로

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | OpenHands (구 OpenDevin) |
| 개발 | All Hands AI |
| 최초 공개 | 2024년 말, OpenDevin 명칭. 2025년 OpenHands로 개명 |
| 라이선스 | MIT + 별도 라이선스 혼합. `enterprise/` 디렉터리는 `enterprise/LICENSE` 적용, 그 외 MIT |
| 저장소 | github.com/OpenHands/OpenHands (구 All-Hands-AI/OpenHands에서 이전) |
| 저장소 규모 | 스타 82.2k, 포크 10.5k, 커밋 7,082건, 오픈 이슈 135건, 오픈 PR 234건 |
| 현재 상태 | Beta 배지 표기. Agent Canvas 전환 진행 중 |
| 릴리스 채널 | OSS 1.11.0 (2026-07-09) / Cloud 1.47.1 (2026-07-21) 이원 트랙 |
| 문서 | docs.openhands.dev |
| 구현 언어 | Python (에이전트, 서버), TypeScript (프런트엔드) |
| 배포 형태 | npm 전역 설치, Docker, 소스 빌드, 호스티드 클라우드, Kubernetes 엔터프라이즈 |

---

## 1. 컨셉

초기 OpenHands의 명제는 "인간 개발자가 할 수 있는 모든 것을 에이전트가 수행한다"였다. Cognition Labs의 Devin에 대한 오픈소스 대응으로 출발해 코드 수정, 명령 실행, 웹 브라우징, API 호출을 자율 수행하는 단일 에이전트를 지향했다.

현재는 명제가 바뀌었다. 저장소 첫 줄은 "코딩 에이전트와 자동화를 위한 셀프호스팅 개발자 컨트롤 센터"이며, 자사 에이전트뿐 아니라 Claude Code, Codex, Gemini 등 ACP(Agent-Client Protocol) 호환 에이전트를 함께 구동하는 **오케스트레이션 계층**으로 재정의됐다. 자체 에이전트를 파는 프로젝트에서 남의 에이전트까지 관리해 주는 플랫폼으로 이동한 셈이다.

| 구분 | 초기 OpenHands (OpenDevin) | 현재 OpenHands |
| --- | --- | --- |
| 정체성 | 자율 코딩 에이전트 | 에이전트 컨트롤 센터 |
| 실행 주체 | 자체 CodeAct 에이전트 | OpenHands 에이전트 + 임의 ACP 에이전트 |
| 기본 인터페이스 | 로컬 GUI, CLI | Agent Canvas |
| 실행 위치 | 로컬 Docker 샌드박스 | 로컬, Docker, VM, 사내 인프라, 클라우드 중 선택 |
| 초점 | 이슈 해결 | 상시 가동 자동화 팀 |

### 아키텍처

```
              Agent Canvas (프런트엔드 + 컨트롤 센터)
                          |
        +-----------------+------------------+
        |                 |                  |
  Agent Server      Agent Server       Agent Server
  (로컬 노트북)      (Mac mini/VM)      (OpenHands Cloud)
        |
  Automation Server   스케줄 실행, 웹훅 이벤트 트리거
```

Agent Server는 단일 호스트/포트에서 여러 에이전트를 돌리는 REST API다. Agent Canvas는 여러 Agent Server에 동시 연결해 전환할 수 있으므로, 코드 리뷰와 의존성 갱신용 서버는 팀이 공유하고 개인 작업은 노트북에서 돌리는 식의 분리 운용이 가능하다.

### 저장소 분리 현황

메인 저장소의 코드가 이관 중이며, 현재 README는 사실상 Agent Canvas 문서다.

| 구성 요소 | 이전 위치 |
| --- | --- |
| OpenHands 에이전트, Agent Server | OpenHands/software-agent-sdk |
| Agent Canvas | OpenHands/agent-canvas |
| Automation Server | OpenHands/automation |
| 클라우드 Helm 차트 | OpenHands/openhands-cloud |

전환 경과는 이슈 #14841(Agent Canvas transition FAQ)에 정리돼 있다.

---

## 2. 장점

| 구분 | 내용 |
| --- | --- |
| 커뮤니티 규모 | 스타 82.2k, 포크 10.5k, 커밋 7,082건. 오픈소스 코딩 에이전트 중 최대 규모이며 goose(51.7k)보다도 앞선다 |
| 에이전트 무관성 | ACP 지원으로 Claude Code, Codex, Gemini를 그대로 붙일 수 있다. 기존 구독을 재활용하면서 관리 계층만 오픈소스로 가져가는 구성이 가능 |
| 백엔드 유연성 | 노트북, 전용 머신, VM, 사내 인프라, 클라우드를 같은 프런트엔드에서 전환. 노트북을 닫아도 계속 도는 상시 에이전트 구성이 공식 권장 경로 |
| 모델 무관성 | LiteLLM 컨벤션 기반. Anthropic, OpenAI, Google, Bedrock은 물론 LM Studio, llama.cpp, Ollama 등 로컬 모델까지 |
| 샌드박스 옵션 | Docker 백엔드 선택 시 호스트와 격리된 실행 환경 제공. 컨테이너 이미지 공식 배포 |
| 자동화 서버 | 스케줄 실행과 웹훅 이벤트 트리거를 별도 컴포넌트로 분리. 주간 리포트 Slack 발행, GitHub 이슈 자동 분해 같은 상시 워크플로 구성 |
| 연동 범위 | GitHub, GitLab, Bitbucket, Slack, Jira, Linear, Notion. MCP 서버 연결과 OAuth 지원 |
| 서브에이전트 위임 | TaskToolSet 기반 멀티 에이전트 워크플로. 전문화된 에이전트가 복합 과제를 분담 |
| 엔터프라이즈 기능의 저장소 내 존재 | Agent Profiles, Budgets 대시보드, Usage & Monitoring, SAML/SSO, RBAC, BYOR 키 관리가 실제 코드로 존재. 자체 호스팅 Kubernetes 배포 경로 제공 |
| 공개 API | 스크립트, CI 워크플로, 사내 애플리케이션에서 호출 가능한 전체 공개 API |
| 취약점 대응 | 의존성 CVE 대응 기록이 릴리스 노트에 명시적으로 남는다(예: vite CVE-2026-53571 패치) |
| 산출물 소유권 | 서비스 약관상 에이전트 생성 결과물에 대한 권리는 사용자에게 귀속 |

---

## 3. 단점 및 유의점

| 구분 | 내용 |
| --- | --- |
| 순수 오픈소스가 아님 | LICENSE 파일이 `enterprise/` 디렉터리를 별도 라이선스로 분리한 오픈코어 구조다. 리포지토리를 "MIT 프로젝트"로 단정하고 상용 활용을 설계하면 안 된다. 도입 전 `enterprise/LICENSE` 원문 확인이 필수 |
| 기본 설치 경로에 샌드박스가 없음 | 현행 README의 Option 1(`npm install -g`)과 Option 3(소스 실행)은 에이전트 서버를 호스트에 직접 띄운다. README 자체가 "에이전트가 파일시스템 전체에 접근한다"고 경고한다. 격리를 원하면 Docker 백엔드를 명시적으로 선택해야 한다 |
| 전환기 혼란 | 에이전트 본체, Agent Canvas, 자동화 서버가 각각 다른 저장소로 빠지는 중이다. 기존 문서, 블로그, 튜토리얼의 절반 이상이 이미 동작하지 않는 명령을 담고 있다. 예전 `ghcr.io/all-hands-ai/openhands` 이미지와 포트 3000 기반 안내는 폐기된 경로 |
| Beta 상태 | 프로젝트 상태 배지가 beta다. 규모는 크지만 현재 형태는 안정화 이전 |
| 오픈코어 드리프트 관찰 필요 | 클라우드 1.47.0에서 Agent Canvas를 SaaS 인증 뒤로 보호하는 변경이 있었다. 클라우드 배포 한정 조치이나, 기능이 어느 쪽으로 배치되는지 추적할 필요가 있다 |
| 무거운 아키텍처 | 이벤트 루프 기반 상태 유지 시스템으로 서버리스 배포에 부적합. Node.js 22.12.x 이상, uv, 선택적 Docker까지 요구 |
| 로컬 실행의 공격면 | 파일시스템과 셸 접근을 가진 에이전트를 웹훅과 Slack 트리거로 상시 노출시키는 구성이다. 외부 이슈 본문이나 채널 메시지가 그대로 지시문으로 들어오는 경로가 존재하며, 이는 프롬프트 인젝션의 표준 진입점이다. 공식 문서도 셀프호스팅 가이드에서 보안 하드닝을 별도로 강조한다 |
| 비용 | BYOK 구조. 서브에이전트 병렬 실행과 상시 자동화는 토큰 소모가 크다. Budgets 대시보드는 엔터프라이즈 계열 기능 |
| 클라우드 데이터 조건 | 클라우드 버전 사용 시 사용자 데이터에 서비스 운영을 위한 광범위한 라이선스가 부여된다. 민감 코드를 다룬다면 약관 검토가 선행돼야 한다 |
| 다중 사용자 | 인증, RBAC, SAML/SSO는 엔터프라이즈 경로에 있다. 순수 OSS 구성으로 다중 테넌트를 구현하려면 별도 설계 필요 |
| PR 적체 | 오픈 PR 234건. 기여 활발함의 지표인 동시에 리뷰 병목 지표 |

---

## 4. 유사 및 경쟁 프로젝트

| 프로젝트 | 라이선스 | 성격 | OpenHands 대비 |
| --- | --- | --- | --- |
| goose (AAIF/Linux Foundation) | Apache 2.0 | Rust 기반 범용 로컬 에이전트. 데스크톱·CLI·API | 거버넌스 중립성과 라이선스 단순성이 우위. 오픈코어 리스크가 없다. 대신 백엔드 분산 실행과 엔터프라이즈 관리 기능은 OpenHands가 앞선다 |
| OpenWorker (Andrew Ng, Rohit Prasad) | MIT | 지식노동자용 로컬 데스크톱 에이전트 | 업무 산출물 중심, 25+ 네이티브 커넥터. 규모와 성숙도는 비교 불가 수준으로 열세 |
| Devin (Cognition Labs) | 상용 | AI 소프트웨어 엔지니어 | OpenHands의 원래 벤치마크 대상. 비공개, 유료 |
| Claude Code | 상용 | Anthropic 공식 CLI 에이전트 | 단일 모델 최적화 완성도. OpenHands에서 ACP 에이전트로 편입 가능하므로 경쟁이자 구성 요소 |
| Cline / Kilo Code | 오픈소스 | IDE 내장 에이전트 | IDE 워크플로 밀착. 상시 자동화와 다중 백엔드는 영역 밖 |
| Aider | Apache 2.0 | 터미널 우선, Git 커밋 직결 | 단일 목적 도구로서 성숙하고 가볍다. 관리 계층 없음 |
| AutoGPT | 오픈소스 | 자율 에이전트 프레임워크 | 샌드박스와 프로덕션 운영 기능 부재 |
| Codex (OpenAI) | 상용 | 코딩 어시스턴트 및 에이전트 | OpenHands에서 ACP로 구동 가능 |
| n8n / Dify | 혼합 | 워크플로 오케스트레이션 | 시각적 편집 우위. 에이전틱 자율성은 열세 |

### 포지셔닝 요약

세 프로젝트를 한 줄로 구분하면 이렇다. **goose는 로컬 런타임, OpenWorker는 업무 산출물, OpenHands는 관리 계층**이다.

OpenHands의 전환은 영리한 선택으로 보인다. 에이전트 본체 성능 경쟁은 프런티어 모델 제공사가 이기는 게임이고, 그 위에서 여러 에이전트를 오케스트레이션하는 자리는 아직 비어 있었다. Claude Code를 경쟁자가 아니라 구동 대상으로 재배치한 것이 그 판단의 결과물이다.

다만 이 전환은 대가를 동반한다. 오픈코어 라이선스 구조, 기본 경로에서의 샌드박스 이탈, 저장소 분리로 인한 문서 파편화가 동시에 진행 중이며, 지금 도입을 검토한다면 6개월 뒤 구성이 상당히 달라져 있을 가능성을 전제해야 한다.

---

## 5. Getting Started

### 5.1 실행 방식 선택

| 방식 | 설명 | 샌드박스 | 추천 대상 |
| --- | --- | --- | --- |
| npm 전역 설치 | Agent Canvas 로컬 전체 스택 구동 | 없음 | 빠른 시험, 개인 개발 환경 |
| Docker | 컨테이너 내 실행, 프로젝트 디렉터리만 마운트 | 있음 | 격리가 필요한 모든 경우 |
| 소스 빌드 | agent-canvas 저장소 직접 실행 | 없음 | 기여자, 커스터마이징 |
| VM 셀프호스팅 | 클라우드 서버에 Agent Server 상시 구동 | 구성에 따름 | 상시 자동화, 팀 공유 |
| OpenHands Cloud | 호스티드. app.all-hands.dev | 제공 | 인프라 관리 회피 |
| Kubernetes 엔터프라이즈 | Helm 차트 기반 자체 호스팅 | 제공 | 조직 배포, SSO/RBAC 필요 |

### 5.2 npm 설치 (샌드박스 없음)

사전 요구사항: Node.js 22.12.x 이상, `uv`

```bash
npm install -g @openhands/agent-canvas
agent-canvas
```

전체 스택이 기동되며 UI는 `http://localhost:8000`에서 접근한다. 구성 요소를 분리해 띄우려면 다음을 사용한다.

```bash
agent-canvas --frontend-only   # 정적 프런트엔드 + 인그레스
agent-canvas --backend-only    # 에이전트 서버 + 자동화 백엔드 + 인그레스
```

이 경로는 에이전트 서버가 호스트에서 직접 실행되므로 파일시스템 전체가 노출된다. 실험 목적 외에는 권장하지 않는다.

### 5.3 Docker 설치 (권장)

사전 요구사항: Docker Desktop 또는 Docker Engine, 에이전트에 노출할 프로젝트 상위 디렉터리

```bash
export PROJECTS_PATH="$HOME/projects"
mkdir -p "$PROJECTS_PATH" "$HOME/.openhands"

docker run -it --rm \
  -p 8000:8000 \
  -v "$HOME/.openhands:/home/openhands/.openhands" \
  -v "${PROJECTS_PATH}:/projects" \
  ghcr.io/openhands/agent-canvas:1
```

에이전트는 `PROJECTS_PATH` 하위 프로젝트에만 접근한다. 마운트 범위가 곧 접근 통제 경계이므로 홈 디렉터리 전체를 마운트하지 않도록 주의한다. Windows는 agent-canvas 저장소의 `README.windows.md`를 참조한다.

### 5.4 소스 실행

```bash
git clone https://github.com/OpenHands/agent-canvas.git
cd agent-canvas
npm install
npm run dev
```

사전 요구사항: Node.js 22.12.x 이상, npm, uv(`uvx`로 에이전트 서버 구동). 이 경로도 샌드박스가 없다.

에이전트 본체나 Agent Server를 직접 다루려면 `OpenHands/software-agent-sdk` 저장소를 사용한다.

### 5.5 모델 설정

LiteLLM 컨벤션을 따르므로 프로바이더 접두사 표기를 사용한다.

```bash
export LLM_API_KEY="your-api-key"
export LLM_MODEL="anthropic/<model-id>"
```

로컬 모델은 LM Studio, llama.cpp, Ollama를 통해 연결한다. 설정 UI에서는 LLM 프로필 단위로 모델을 저장하고 전환할 수 있다.

### 5.6 ACP 에이전트 연결

Agent Canvas는 OpenHands 에이전트를 기본 구동하되, ACP 호환 에이전트를 대체 실행 주체로 등록할 수 있다.

| 에이전트 | 비고 |
| --- | --- |
| OpenHands Agent | 기본값, 별도 설정 불필요 |
| Claude Code | 기존 구독 재활용 가능 |
| Codex | 기존 구독 재활용 가능 |
| Gemini | ACP 경유 |
| 기타 ACP 구현체 | 프로토콜 준수 시 연결 가능 |

### 5.7 자동화 구성

Automation Server를 통해 스케줄 실행과 웹훅 트리거를 설정한다. 대표 패턴은 다음과 같다.

| 패턴 | 트리거 | 산출 |
| --- | --- | --- |
| 주간 리포트 | cron | Slack 채널 발행 |
| 이슈 자동 분해 | GitHub 웹훅 | 하위 태스크 생성 |
| 의존성 갱신 | cron | PR 생성 |
| 알림 대응 | Datadog 등 외부 이벤트 | 조사 후 스레드 회신 |

웹훅과 채널 메시지가 지시문 경로가 되므로, 외부 입력을 신뢰하지 않는 전제 하에 대상 저장소와 실행 권한을 좁혀야 한다.

### 5.8 저장소 구조

| 경로 | 내용 |
| --- | --- |
| `openhands/` | 파이썬 백엔드 코어 |
| `frontend/` | 웹 프런트엔드 |
| `openhands-ui/` | UI 컴포넌트 |
| `enterprise/` | 엔터프라이즈 기능. 별도 라이선스 적용 구간 |
| `containers/` | 컨테이너 빌드 정의 |
| `skills/`, `.agents/skills` | 에이전트 스킬 정의 |
| `kind/` | 로컬 쿠버네티스 구성 |
| `tests/` | 테스트 스위트 |
| `Development.md` | 개발 환경 구성 가이드 |

### 5.9 도입 전 점검 항목

| 점검 | 판단 기준 |
| --- | --- |
| 라이선스 | `enterprise/LICENSE` 원문을 먼저 확인. 사용하려는 기능이 MIT 구간인지 엔터프라이즈 구간인지 특정할 것 |
| 실행 격리 | 기본 npm 경로가 아니라 Docker 백엔드를 표준으로 채택. 마운트 범위를 프로젝트 디렉터리로 제한 |
| 외부 트리거 | Slack, GitHub, 웹훅 연동 시 신뢰 경계 설계. 외부 텍스트가 지시문으로 해석되는 경로를 목록화할 것 |
| 자격증명 범위 | 저장소 쓰기 권한, 이슈 생성 권한을 최소 단위로 발급. 조직 전체 토큰 사용 금지 |
| 비용 상한 | 프로바이더 콘솔에서 한도 선설정. 상시 자동화는 소모량이 누적된다 |
| 클라우드 약관 | 민감 코드를 다룬다면 데이터 라이선스 조항 검토 후 셀프호스팅 여부 결정 |
| 전환기 리스크 | 저장소 분리가 진행 중이므로 버전 고정과 마이그레이션 계획을 전제로 도입 |
| 대안 비교 | 단순 로컬 에이전트가 목적이라면 goose가 더 가볍고 라이선스가 단순하다 |

---

## 참고

- 메인 저장소: https://github.com/OpenHands/OpenHands
- Agent Canvas: https://github.com/OpenHands/agent-canvas
- 에이전트 SDK: https://github.com/OpenHands/software-agent-sdk
- 자동화 서버: https://github.com/OpenHands/automation
- 클라우드 Helm 차트: https://github.com/OpenHands/openhands-cloud
- 문서: https://docs.openhands.dev/overview/introduction
- 셀프호스팅 가이드: https://docs.openhands.dev/openhands/usage/agent-canvas/backend-setup/vm
- 전환 FAQ: https://github.com/OpenHands/OpenHands/issues/14841
- 개발 가이드: https://github.com/OpenHands/OpenHands/blob/main/Development.md
- Slack: https://go.openhands.dev/slack

#OpenHands #AgentCanvas #AllHandsAI #AI에이전트 #OpenSource #ACP #MCP #코딩에이전트 #LLM
