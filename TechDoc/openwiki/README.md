# OpenWiki 기술 문서

> 대상 저장소: [langchain-ai/openwiki](https://github.com/langchain-ai/openwiki)
> 라이선스: MIT · 언어: TypeScript(84%) / JavaScript(16%)

OpenWiki는 **코드베이스나 개인 지식(personal memory)에 대한 "에이전트용 위키(agent wiki)"를 자동으로 작성하고 유지·관리하는 CLI 도구**입니다. LangChain 팀이 만들었으며, 사람이 읽는 문서뿐 아니라 AI 코딩 에이전트가 컨텍스트를 찾을 때 참조하도록 설계된 것이 핵심 특징입니다.

## 목차
- [핵심 개념](#핵심-개념)
- [특징](#특징)
- [장점](#장점)
- [단점 / 한계](#단점--한계)
- [유사 프로젝트와의 비교](#유사-프로젝트와의-비교)
- [설치 방법](#설치-방법)
- [빠른 시작](#빠른-시작)
- [주의점](#주의점)
- [총평](#총평)

---

## 핵심 개념

OpenWiki는 두 가지 동작 모드를 제공합니다.

| 모드 | 명령 | 설명 | 저장 위치 |
|------|------|------|-----------|
| **Personal 모드** | `openwiki personal --init` | Gmail, Notion, 로컬 저장소, 웹 검색, Hacker News, X/Twitter 등의 소스를 통합해 개인용 "브레인" 위키 생성 | `~/.openwiki/wiki` |
| **Code 모드** | `openwiki code --init` | 현재 코드베이스에 대한 저장소 문서 생성 | `openwiki/` |

- **커넥터(Connector) 기반 수집**: 내장 커넥터 또는 git 저장소를 통해 로컬 지식 소스를 수집(ingest)합니다.
- **에이전트 우선 설계**: `code` 모드는 저장소 루트에 `AGENTS.md`와 `CLAUDE.md`를 생성/갱신하여, 코딩 에이전트가 컨텍스트를 찾을 때 위키를 참조하도록 프롬프트를 삽입합니다.
- **자동 최신화**: GitHub Actions / GitLab CI 워크플로를 통해 문서 갱신 PR을 자동으로 생성할 수 있습니다.

---

## 특징

1. **AI 에이전트 전용 문서 생성** — 일반 문서 생성기와 달리 코딩 에이전트가 참조하는 것을 1차 목표로 함.
2. **두 가지 모드(Personal / Code)** — 개인 지식 관리와 코드 문서화를 하나의 도구로 처리.
3. **풍부한 커넥터** — `git-repo`, `x`, `notion`, `google(Gmail)`, `web-search(Tavily)`, `hackernews`.
4. **다중 소스 인스턴스** — 같은 커넥터를 여러 개(예: `web-search-1`, `web-search-2`)로 구성 가능.
5. **다양한 추론 제공자 지원** — OpenAI(API 키 또는 ChatGPT 로그인), OpenRouter, Fireworks, Baseten, OpenAI-호환 엔드포인트, Anthropic.
6. **CI 통합** — GitHub Actions / GitLab CI 예제 워크플로 제공, 문서 변경을 PR로 자동 제출.
7. **로컬 우선 저장** — 설정과 시크릿은 `~/.openwiki/.env`에 로컬 저장.
8. **스케줄링** — macOS에서는 소스 스케줄이 LaunchAgent로 설치되어 주기적으로 위키를 갱신.
9. **LangSmith 추적(선택)** — 실행을 LangSmith 프로젝트("openwiki")로 트레이싱 가능.

---

## 장점

- **에이전트 워크플로에 최적화**: `AGENTS.md`/`CLAUDE.md`를 자동 관리하며, 기존 파일의 사용자 내용은 보존하고 `<!-- OPENWIKI:START -->…<!-- OPENWIKI:END -->` 블록만 갱신.
- **설정 후 자동 유지보수**: CI 워크플로만 추가하면 문서가 자동으로 최신 상태 유지. CI에서 `--init` 없이 `--update`만으로 초기 문서 생성 가능.
- **광범위한 소스 통합**: 코드뿐 아니라 개인 지식(메일, 노션, SNS 등)까지 하나의 위키로 통합.
- **유연한 제공자 선택**: 상용 API, 셀프 호스팅 게이트웨이(LiteLLM 등 OpenAI-호환), ChatGPT 구독 로그인까지 지원.
- **오픈소스(MIT)**: 자유로운 사용/수정, 활발한 관심(스타 10k+).
- **보안 지향 설정**: 커넥터 설정 파일에는 원시 시크릿을 저장하지 않고 환경변수 이름으로 참조.

---

## 단점 / 한계

- **LLM API 비용 발생**: 문서 생성/갱신에 LLM 호출이 필요하므로 토큰 비용이 든다(대형 저장소일수록 증가).
- **초기 프로젝트(0.1.x)**: 릴리스가 6개 수준으로 아직 초기 단계 — API/명령 변경 가능성 존재(예: 이제 bare `openwiki --init`은 미지원, 모드를 명시해야 함).
- **Node.js 생태계 의존**: 전역 npm 설치 필요, 네이티브 의존성(`better-sqlite3`) 존재.
- **Windows/Bun 설치 주의**: `bun install`은 `better-sqlite3` 네이티브 컴파일로 폴백될 수 있어 Visual Studio Build Tools(C++ 워크로드)가 필요.
- **커넥터별 인증 복잡도**: Slack/Gmail은 앱 클라이언트 자격증명 사전 설정 필요, Slack OAuth는 ngrok 터널 필요, 웹 검색은 `TAVILY_API_KEY` 필요.
- **생성 문서 품질은 모델 의존적**: 선택한 모델 성능에 따라 결과 편차 발생, 사람 검수가 여전히 권장됨.

---

## 유사 프로젝트와의 비교

| 프로젝트 | 성격 | 소스 | AI 사용 | 에이전트 통합 | 특징 |
|----------|------|------|---------|----------------|------|
| **OpenWiki** | 에이전트용 위키 CLI | 코드 + 개인 지식(메일/노션/SNS/웹) | 예(다중 제공자) | ✅ `AGENTS.md`/`CLAUDE.md` 자동 관리 | Personal/Code 이중 모드, CI 자동 PR |
| **DeepWiki (Cognition/Devin)** | 저장소를 위키처럼 탐색 | 코드 저장소 | 예 | 간접(질의) | 웹 기반, GitHub 저장소 대화형 탐색 |
| **Mintlify / docs.dev** | 문서 사이트 생성·호스팅 | 소스 코드/주석 | 일부 AI 보조 | 낮음 | 예쁜 문서 사이트/호스팅 중심 |
| **Docusaurus / MkDocs** | 정적 문서 사이트 생성기 | 수동 작성 마크다운 | 없음 | 없음 | 문서 렌더링·사이트화, 생성은 수동 |
| **Doxygen / Sphinx / TypeDoc** | 코드 주석 → API 문서 | 소스 주석/시그니처 | 없음 | 없음 | 결정론적 API 레퍼런스 생성 |
| **Cursor Rules / Continue Docs** | 에이전트 컨텍스트 규칙 | 수동/일부 자동 | 일부 | ✅ | IDE 에이전트 컨텍스트 주입 중심 |

**차별점 요약**
- Doxygen/Sphinx/TypeDoc: 주석 기반 **결정론적** API 문서 → OpenWiki는 LLM으로 **서술형 위키**를 합성.
- Docusaurus/MkDocs: **렌더링/사이트화** 도구(내용은 사람이 작성) → OpenWiki는 **내용 자체를 생성·유지**.
- DeepWiki: 웹에서 저장소를 대화형 탐색 → OpenWiki는 **로컬에 위키 파일을 생성**하고 CI로 유지.
- Mintlify 등: 사람 대상 문서 사이트 중심 → OpenWiki는 **에이전트가 참조**하는 것을 1차 목표로 함.

---

## 설치 방법

### 사전 요구사항
- Node.js 및 패키지 매니저(`npm` 또는 `pnpm`) 권장
- LLM 제공자 API 키(예: OpenAI) — 또는 ChatGPT 로그인
- (선택) 웹 검색 커넥터 사용 시 `TAVILY_API_KEY`

### 기본 설치 (macOS / Linux)

```bash
npm install -g openwiki
```

### Windows

Node.js 패키지 매니저 사용을 권장합니다.

```bash
npm install -g openwiki
# 또는
pnpm add -g openwiki
```

### Bun 사용 시 (주의)

`bun install -g openwiki`는 `better-sqlite3` 네이티브 의존성 컴파일로 폴백될 수 있습니다. 이 경로를 사용하기 전에:
- **Visual Studio Build Tools** 설치 (Desktop development with C++ 워크로드 포함)
- Bun은 기본적으로 설치 패키지의 lifecycle 스크립트를 실행하지 않으므로, 네이티브 빌드 시작 전 경고를 표시하지 못할 수 있음.

→ 안정적인 설치를 위해 **`npm`/`pnpm` 사용을 권장**합니다.

---

## 빠른 시작

```bash
# 1) 코드 문서 모드 초기화 (현재 저장소)
openwiki code --init

# 2) 개인 브레인 모드 초기화
openwiki personal --init
```

첫 대화형 실행 시 추론 제공자, API 키, LLM을 설정합니다. (기본값: OpenAI + `gpt-5.6-terra`) 설정과 시크릿은 `~/.openwiki/.env`에 저장됩니다.

### 자주 쓰는 명령

```bash
openwiki                              # 대화형 CLI 시작
openwiki "이 저장소 문서를 생성해줘"      # 초기 요청과 함께 시작
openwiki -p "무엇을 할 수 있는지 요약해줘" # 단일 명령 실행 후 종료 (비대화형)
openwiki --update                     # 기존 문서 갱신 (기본 personal 모드)
openwiki code --update                # 저장소 코드 문서 갱신
openwiki --help                       # 도움말
```

### 커넥터 인증

```bash
openwiki auth slack
openwiki auth gmail
openwiki auth x
openwiki auth notion
openwiki ngrok start                  # Slack OAuth용 ngrok 터널
```

### 수집(ingest)

```bash
openwiki ingest all            # 모든 커넥터 인스턴스 실행
openwiki ingest web-search     # 특정 커넥터의 모든 인스턴스
openwiki ingest web-search-2   # 특정 인스턴스 하나
```

### CI로 문서 자동 갱신

- **GitHub Actions**: `examples/openwiki-update.yml` → `.github/workflows/openwiki-update.yml`로 복사
  - 저장소 문서: `openwiki code --update --print` 사용. CI에서는 `--init` 불필요(`--update`가 초기 문서도 생성).
- **GitLab CI**: `examples/openwiki-update.gitlab-ci.yml` → `.gitlab-ci.yml`로 복사(또는 include).

### 제공자별 환경변수 예시

```bash
# Anthropic (대체 base URL)
OPENWIKI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-key
ANTHROPIC_BASE_URL=https://your-gateway.example.com/anthropic

# OpenAI-호환 게이트웨이 (예: LiteLLM)
OPENWIKI_PROVIDER=openai-compatible
OPENAI_COMPATIBLE_API_KEY=your-gateway-key
OPENAI_COMPATIBLE_BASE_URL=https://your-gateway.example.com/v1
OPENWIKI_MODEL_ID=your-gateway-model-name

# 재시도 횟수 (기본 3)
OPENWIKI_PROVIDER_RETRY_ATTEMPTS=3
```

---

## 주의점

1. **모드 명시 필수**: bare `openwiki --init`은 더 이상 지원되지 않습니다. `code` 또는 `personal`을 명시하세요. `openwiki --update`는 기본적으로 personal 모드입니다.
2. **API 비용**: 문서 생성/갱신 시 LLM을 호출하므로 토큰 사용료가 발생합니다. 대규모 저장소일수록 비용/시간 증가.
3. **시크릿 관리**:
   - 모든 자격증명은 `~/.openwiki/.env`에 저장됩니다. 이 파일을 커밋하지 마세요.
   - 커넥터 설정 파일에는 원시 시크릿 값을 넣지 말고 환경변수 이름으로 참조해야 합니다.
   - ChatGPT 로그인 시 저장되는 **refresh token은 비밀번호처럼 취급**하세요.
4. **커넥터 자격증명 사전 요구**:
   - Slack, Gmail은 앱 클라이언트 자격증명이 `~/.openwiki/.env`에 미리 설정되어 있어야 함.
   - 웹 검색 커넥터는 `TAVILY_API_KEY` 필요.
   - Notion은 토큰 붙여넣기 대신 OAuth 인증 권장(호스팅 MCP, 동적 클라이언트 등록).
5. **Slack OAuth ↔ ngrok**: `openwiki ngrok start`는 랜덤 HTTPS URL을 생성하고 콜백을 자동 저장합니다. 출력된 콜백 URL을 Slack에 등록해야 합니다. 고정 도메인은 `openwiki ngrok start https://<도메인>`.
   - X/Twitter, Gmail 인증은 HTTPS 오버라이드를 무시하고 로컬 루프백 콜백(`http://127.0.0.1:53682/callback`)을 사용.
6. **`AGENTS.md`/`CLAUDE.md` 자동 편집**: `code` 실행마다 이 파일들이 생성/갱신됩니다. OpenWiki는 자신의 블록만 재작성하지만, 파일이 자동 편집된다는 점을 인지하세요.
7. **Bun 설치 위험**: 위 [설치 방법](#설치-방법)의 Bun 주의사항 참고 — 가능하면 `npm`/`pnpm` 사용.
8. **초기 버전(0.1.x)**: 명령/동작이 변경될 수 있으니 업그레이드 시 릴리스 노트 확인 권장.
9. **PR 정책**: 기여 시 PR은 하나의 변경에 집중해야 하며, 무관한 변경을 묶으면 분리 요청과 함께 닫힐 수 있습니다.

---

## 총평

OpenWiki는 "문서 = 사람이 읽는 것"이라는 관점을 넘어, **AI 코딩 에이전트가 소비하는 컨텍스트 소스로서의 문서**라는 새로운 카테고리를 겨냥한 도구입니다. 결정론적 API 문서 생성기(Doxygen/TypeDoc)나 정적 사이트 생성기(Docusaurus/MkDocs)와 달리, LLM으로 코드/개인 지식을 서술형 위키로 합성하고 CI로 자동 유지한다는 점이 가장 큰 차별점입니다.

- **적합한 경우**: AI 에이전트(Claude, Cursor 등) 중심 워크플로, 살아있는(항상 최신) 저장소 위키가 필요한 팀, 개인 지식 통합이 필요한 개인.
- **덜 적합한 경우**: LLM 비용을 피하고 싶거나, 결정론적 API 레퍼런스만 필요하거나, 완전한 오프라인/폐쇄망 환경.
