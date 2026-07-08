# MCP 서버 개발 Getting Started — 개념부터 AMQS-AI-Infra Signal Server 구현까지

> 1부에서 MCP(Model Context Protocol)의 개념·특징·API와의 차이를 포괄적으로 정리한다.
> 2부에서 [vibe-investing / AMQS-AI-Infra](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20AI%20Infra)
> 퀀트 전략을 소재로 **동작하는 MCP 서버를 직접 만들고, 테스트하고, Claude Desktop에 연결**하는 전 과정을 다룬다.
> 동봉 코드(`server.py`)는 stdio 핸드셰이크와 tool 호출까지 실제 검증 완료.

---

# 1부 — MCP 개념 이해

## 1. MCP란 무엇인가?

MCP(Model Context Protocol)는 2024년 11월 Anthropic이 발표한 **개방형 표준 프로토콜**로, AI 모델(특히 LLM)이 외부 데이터 소스나 도구와 연결될 수 있도록 해주는 통신 규약이다. 이후 OpenAI, Google, Microsoft 등 주요 IT 기업이 채택하면서 AI 업계의 사실상 표준(de facto standard)으로 자리잡았다.

### 1.1 왜 MCP가 필요한가? — 문제의 계보

| 단계 | 상황 | 한계 |
|---|---|---|
| 1. LLM 단독 | 학습 시점 지식으로만 응답 | 실시간 정보("지금 날씨") 불가, 외부 세계와 상호작용 불가 |
| 2. Agent 프레임워크 | Langchain·CrewAI 등이 LLM을 외부 도구(검색·API·DB)에 연결 | 프레임워크마다 도구별 개별 SDK 제작 필요 — M×N 통합 문제 |
| 3. **MCP** | 단일 표준 프로토콜로 통합 | M+N으로 축소 — 도구 제공자는 MCP 서버 1개만 만들면 모든 호스트에서 사용 가능 |

M×N 문제를 구체적으로 보면: Agent 프레임워크 M개 × 외부 도구 N개 조합마다 커넥터를 각각 개발해야 했다. 도구 제공자는 모든 프레임워크와 개별 협업해야 하는 비효율에 시달렸다. MCP는 이를 **'AI 분야의 USB-C 포트'** 같은 표준 연결 방식으로 해결한다 — MCP를 지원하는 어떤 AI 애플리케이션이든, MCP를 지원하는 어떤 데이터 소스와도 즉시 연결된다.

### 1.2 MCP 아키텍처

| 구성 요소 | 역할 | 예시 |
|---|---|---|
| **MCP 호스트(Host)** | LLM이 포함된 AI 애플리케이션 환경 | Claude Desktop, Cursor, Windsurf |
| **MCP 클라이언트(Client)** | 호스트 내에서 LLM과 MCP 서버 간 통신 중개. 서버당 1:1 연결 | 호스트에 내장 |
| **MCP 서버(Server)** | 외부 서비스(DB·웹 API·파일시스템 등)와 연결해 LLM에 컨텍스트와 기능 제공 | slack-mcp-server, notion-mcp-server, **본 문서의 AMQS 서버** |
| **전송 계층(Transport)** | JSON-RPC 2.0 기반 메시지 교환 | stdio(로컬), Streamable HTTP(원격) |

```
┌─────────────── Host (Claude Desktop) ───────────────┐
│  LLM ↔ Client A ── stdio ──→ Server A (AMQS 신호)    │
│        Client B ── stdio ──→ Server B (Slack)        │
│        Client C ── HTTP ───→ Server C (원격 DB)      │
└──────────────────────────────────────────────────────┘
```

호스트 하나가 여러 서버에 동시 연결되며, LLM은 대화 맥락에 따라 어느 서버의 어떤 기능을 쓸지 스스로 결정한다.

## 2. MCP의 핵심 특징

| 특징 | 내용 |
|---|---|
| **개방형 표준 (Open Standard)** | 스펙과 SDK가 오픈소스로 공개. 특정 AI 모델·벤더에 종속되지 않으며, 누구나 서버·클라이언트를 구현할 수 있다 |
| **양방향 통신 (Bidirectional)** | 일회성 요청-응답이 아닌 지속 세션 기반. 서버가 클라이언트에 알림(notification)을 보내거나, 서버가 역으로 LLM 추론을 요청(sampling)하는 것도 스펙에 포함 |
| **범용성 (Universality)** | 한 번 MCP 표준을 구현하면 다양한 데이터 소스 접근이 표준화. 서버는 호스트가 Claude든 Cursor든 신경 쓸 필요 없음 |
| **동적 발견 (Dynamic Discovery)** | 클라이언트가 런타임에 `list_tools`로 서버 기능을 조회 — 사전 코딩 없이 AI가 도구를 자동 탐색·상호작용 |
| **조합성 (Composability)** | 여러 서버의 tool을 LLM이 자유롭게 조합해 멀티스텝 워크플로우 수행 |

## 3. MCP vs 기존 API — 무엇이 다른가?

| 구분 | 기존 API 직접 통합 | MCP |
|---|---|---|
| 연결 방식 | 서비스마다 개별 연결·개별 SDK | 단일 표준 프로토콜로 여러 도구 접근 |
| 도구 발견 | 개발자가 문서 읽고 수동 코딩 | AI가 런타임에 자동 탐색 (`list_tools`) |
| 통신 모델 | 일회성 요청-응답 (stateless) | 지속 세션 기반 양방향 실시간 통신 |
| 호출 주체 | 애플리케이션 코드가 호출 시점 결정 | **LLM이 대화 맥락에서 호출 여부·순서·조합을 결정** |
| 인터페이스 명세 | OpenAPI/Swagger — 사람·코드용 | JSON Schema + 자연어 description — **LLM용** |
| 통합 비용 | M(앱)×N(도구) 커넥터 | M+N (도구당 서버 1개) |
| 관계 | — | **MCP는 API를 대체하지 않는다** — 서버 내부는 여전히 REST API·DB를 호출. MCP는 그 위의 LLM 친화적 어댑터 계층 |

마지막 행이 가장 중요하다. MCP 서버 개발이란 결국 "기존 API·라이브러리·계산 로직을 **LLM이 이해하고 호출할 수 있는 형태로 감싸는 것**"이다. 2부에서 만들 AMQS 서버도 내부적으로는 yfinance API와 pandas 계산을 쓰되, 이를 MCP tool로 노출한다.

## 4. MCP 사용 예 — 개념에서 실전으로

### 예시 1: 뉴스 요약 및 슬랙 전송
"오늘 아침 뉴스 3개 요약해서 슬랙 AI news 채널에 올려줘" → AI가 검색 MCP 서버로 뉴스 수집 → 핵심 요약 → slack-mcp-server로 지정 채널에 게시. **서로 다른 서버 2개를 LLM이 자율 조합**하는 것이 핵심이다.

### 예시 2: 유튜브 채널 분석 및 노션 보고서
"최근 영상 10개 분석해서 노션에 보고서 만들어줘" → 유튜브 애널리틱스 MCP로 시청 지속률·이탈 지점 분석 → 인사이트 문서 작성 → notion-mcp-server로 리포트 페이지 생성.

### 예시 3: 업무 자동화 서버 생태계
`slack-mcp-server`(메시지 전송/조회) · `notion-mcp-server`(DB 관리) · `google-calendar-mcp-server`(일정 관리) 등 — 이미 수천 개의 공개 서버가 존재한다.

### 예시 4: 퀀트 투자 신호 서버 (본 문서의 주제)
"지금 레짐 확인하고 RISK_ON이면 Top 10 뽑아줘, 내 MU 손절선도 봐줘" → AMQS MCP 서버의 tool 3개를 LLM이 순차 조합. 예시 1~3이 *남이 만든 서버를 쓰는 것*이라면, 2부는 **이런 서버를 직접 만드는 방법**이다.

---

# 2부 — MCP 서버 개발 실전 - AMQS-AI-Infra Signal Server

## 5. 왜 AMQS가 MCP 샘플로 적합한가?

AMQS-AI-Infra 원본 문서에는 이미 **Python / LLM 역할 분담표**가 존재한다. 이 표가 그대로 MCP 서버 설계도가 될 수 있다.

| AMQS 역할 분담 | 담당 | MCP 매핑 |
|---|---|---|
| 4-Factor 모멘텀 · 손절 · 레짐 · Top-N 선별 | Python (자동) | **Tools** — LLM이 호출하는 결정론적 계산 |
| Universe · 전략 파라미터 (정적 참조) | Python | **Resources** — 읽기 전용 컨텍스트 |
| Revenue Acceleration · 13F · EPS Revision · 내러티브 | LLM (지식·검색) | **Prompts** — 교차검증 워크플로우 템플릿 |

즉, "Python은 기술 신호를 계산하고 LLM은 펀더멘털을 검토한다"는 AMQS 철학("LLM은 엑셀이지 오라클이 아니다")이 MCP의 3대 primitive(Tools / Resources / Prompts)와 1:1 대응한다. 결정론적 계산은 코드에, 판단은 모델에 두는 구조 — MCP 서버 설계의 정석이다.

## 6. 개발자 관점의 아키텍처 재해석

1부의 Host / Client / Server 구조를 개발자 시각으로 다시 보자.

| 구성 요소 | 개발자가 실제로 만지는 것 |
|---|---|
| Host | 만들지 않음 (기성 앱 사용) |
| Client | 만들지 않음 (호스트 내장) — 프로토콜 테스트용으로만 작성 |
| **Server** | **우리가 만드는 것** — 이 문서의 전부 |
| 전송 계층 | SDK가 처리 — transport 종류만 선택 |

### 6.1 3대 Primitive

| Primitive | 제어 주체 | 용도 | AMQS 샘플에서 |
|---|---|---|---|
| **Tools** | model-controlled (LLM이 호출 결정) | 함수 실행, 부수효과 가능 | `get_regime`, `get_momentum_score`, `get_top_signals`, `check_stop_loss` |
| **Resources** | application-controlled (호스트가 관리) | 읽기 전용 데이터, URI로 식별 | `amqs://universe` |
| **Prompts** | user-controlled (사용자가 선택) | 재사용 가능한 프롬프트 템플릿 | `cross_validate_ticker` |

### 6.2 Transport 선택

| Transport | 통신 | 용도 | 비고 |
|---|---|---|---|
| **stdio** | 표준입출력 | 로컬 (Claude Desktop, Cursor) | 시작은 무조건 이것. 배포·인증 불필요 |
| **Streamable HTTP** | 단일 HTTP 엔드포인트 | 원격 서버 | 2025-03 스펙부터 SSE를 대체하는 현행 표준 |
| SSE (legacy) | HTTP + Server-Sent Events | 원격 (구형) | deprecated — 신규 개발에서 사용하지 말 것 |

> 초기 자료의 "stdio(로컬) 또는 SSE(원격)" 서술은 구 스펙 기준이다. 현행 스펙에서 원격 transport는 **Streamable HTTP**로 통합되었다.

### 6.3 SDK 선택

| 기준 | Python (`mcp` + FastMCP) | TypeScript (`@modelcontextprotocol/sdk`) |
|---|---|---|
| 퀀트·데이터 작업 | pandas / numpy / yfinance 생태계 직결 | 별도 브리지 필요 |
| 코드량 | 데코레이터 3종으로 끝 | 다소 장황 |
| 배포 | `uv` / `pip` | `npx` 원커맨드 배포 유리 |
| 본 샘플 | **채택** | — |

퀀트 신호 서버는 데이터 스택이 Python에 있으므로 Python SDK가 자연스럽다. `FastMCP`는 함수 시그니처와 docstring에서 tool schema를 자동 생성한다 — docstring이 곧 LLM에게 보여지는 tool description이므로 **docstring 품질이 tool 호출 정확도를 좌우**한다.

## 7. 프로젝트 구조와 환경 설정

```
amqs-mcp-server/
├── server.py                            # MCP 서버 본체 (단일 파일)
├── requirements.txt
├── claude_desktop_config.example.json   # Claude Desktop 연결 예시
└── MCP_Server_Getting_Started.md        # 본 문서
```

```bash
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 즉시 데모 (네트워크·API 키 불필요, 합성 가격)
AMQS_MOCK=1 python server.py

# 실데이터 (yfinance)
python server.py
```

`AMQS_MOCK=1`은 재현 가능한 합성 가격으로 동작하는 오프라인 모드다. Toss 대시보드의 MOCK 모드와 같은 취지 — 키 없이도 로직 시연이 가능해야 문서와 CI가 살아있는 문서가 된다.

## 8. 서버 구현 단계별 해부

`server.py` 전문은 동봉 파일 참조. 핵심 패턴만 짚는다.

### Step 1 — 서버 인스턴스와 instructions

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
    "amqs-ai-infra",
    instructions=(
        "AMQS-AI-Infra 퀀트 전략 신호 서버. ... "
        "모든 출력은 연구용 참고 신호이며 투자 권유가 아니다."
    ),
)
```

`instructions`는 클라이언트가 서버 전체의 성격을 이해하는 시스템 힌트다. 금융 도구라면 **디스클레이머를 서버 레벨에 박아두는 것**이 각 tool 출력에 반복하는 것보다 안전하다 (본 샘플은 둘 다 한다).

### Step 2 — 계층 분리: 데이터 / 전략 / MCP

```
데이터 계층  get_prices()          yfinance 또는 합성 데이터 + 캐시
전략 계층    composite_scores()    4-Factor z-score → 0~100 점수 (MCP와 무관한 순수 함수)
MCP 계층    @mcp.tool()           전략 함수를 얇게 감싸 JSON으로 직렬화
```

전략 로직을 MCP 데코레이터와 분리하면 (1) 단위 테스트가 쉽고 (2) 동일 로직을 CLI·백테스트·Signal Bot에서 재사용할 수 있다. 원본 레포의 `script/strategy.py`(엔진) / `script/amqs_ai_infra.py`(CLI) 분리와 같은 원리다. 이것이 3장에서 말한 "MCP는 API의 어댑터 계층"의 코드 구현이다.

### Step 3 — Tool 정의: docstring = LLM용 명세

```python
@mcp.tool()
def get_top_signals(top_n: int = 10) -> str:
    """AMQS Top-N 매수 후보를 반환한다. 서브테마당 최대 4종 캡을 적용해
    GPU 등 단일 테마 과집중을 방지한다. 거시 레짐이 RISK_ON 이 아니면 경고를 포함한다."""
```

체크리스트

| 항목 | 이유 |
|---|---|
| 타입 힌트 필수 (`top_n: int = 10`) | JSON Schema 자동 생성의 근거 |
| docstring에 동작·제약·전제 명시 | LLM이 언제 이 tool을 쓸지 판단하는 유일한 근거 |
| 반환은 구조화된 JSON 문자열 | LLM 파싱 안정성 (`ensure_ascii=False`로 한글 보존) |
| 입력 검증 + 에러를 JSON으로 반환 | universe 밖 ticker 요청 시 예외 대신 `{"error": ..., "universe": [...]}` — LLM이 스스로 복구 가능 |
| 상한 클램프 (`min(top_n, len(UNIVERSE))`) | LLM이 `top_n=999`를 넣어도 안전 |

### Step 4 — 도메인 규칙을 tool 내부에 강제

서브테마 캡(테마당 최대 4종)은 LLM에게 "지켜달라"고 부탁하는 것이 아니라 **코드가 강제**한다:

```python
for t, row in df.iterrows():
    theme = row["subtheme"]
    if theme_count.get(theme, 0) >= SUBTHEME_CAP:
        continue          # GPU 쏠림을 코드 레벨에서 차단
```

검증 결과(Top-10, mock): `compute 4 / server 3 / software 2 / network 1` — 캡 정상 작동. 리스크 규칙은 프롬프트가 아니라 코드에 둔다. 이것이 "LLM은 엑셀" 원칙의 MCP 버전이다.

### Step 5 — Resource와 Prompt

```python
@mcp.resource("amqs://universe")     # URI 스킴은 자유 — 서버 네임스페이스 관례
def universe_resource() -> str: ...

@mcp.prompt()
def cross_validate_ticker(ticker: str) -> str: ...
```

Prompt는 "Python이 못 하는 일(매출가속·13F·EPS Revision)을 LLM에게 시키는 표준 지시문"을 서버가 배포하는 채널이다. 원본 레포 `prompts/AMQS_AI_Infra_kr.MD`를 복사-붙여넣기하던 워크플로우가, MCP에서는 호스트 UI에서 원클릭 호출로 바뀐다.

## 9. 테스트 — 3단계 검증 파이프라인

| 단계 | 방법 | 검증 대상 |
|---|---|---|
| 1. 단위 | 모듈 import 후 함수 직접 호출 | 전략 로직 (MCP 무관) |
| 2. 프로토콜 | MCP 클라이언트로 stdio 핸드셰이크 | initialize → list_tools → call_tool |
| 3. 대화형 | MCP Inspector | 실제 호스트 관점 UI 검증 |

### 9.1 단위 테스트

```python
import os; os.environ["AMQS_MOCK"] = "1"
import server
print(server.get_top_signals(10))   # 데코레이터를 거쳐도 함수로 직접 호출 가능
```

### 9.2 프로토콜 테스트 (실행 검증 완료)

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

params = StdioServerParameters(command="python", args=["server.py"],
                               env={"AMQS_MOCK": "1"})
async with stdio_client(params) as (r, w):
    async with ClientSession(r, w) as s:
        await s.initialize()
        tools = await s.list_tools()      # 4개 tool 확인
        out = await s.call_tool("get_regime", {})
```

실행 결과

```
TOOLS: ['get_regime', 'get_momentum_score', 'get_top_signals', 'check_stop_loss']
RESOURCES: ['amqs://universe']
PROMPTS: ['cross_validate_ticker']
CALL get_regime OK: {"regime": "RISK_ON", ...}
```

이 테스트가 1부 2장의 "동적 발견(Dynamic Discovery)" 특징의 실증이다 — 클라이언트는 서버 코드를 전혀 모른 채 런타임 조회만으로 기능 목록과 schema를 얻는다.

### 9.3 MCP Inspector

```bash
npx @modelcontextprotocol/inspector python server.py
```

브라우저 UI에서 tool 목록·schema·호출 결과를 대화형으로 확인한다. Claude Desktop 연결 전 필수 관문.

> 흔한 함정: stdio 서버에서 `print()` 디버깅 금지. stdout은 JSON-RPC 채널이므로 로그는 반드시 `logging`(stderr)으로 보낼 것. 이것이 stdio 서버 오작동 원인 1위다.

## 10. Claude Desktop 연결

`claude_desktop_config.json` 위치:

| OS | 경로 |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "amqs-ai-infra": {
      "command": "python",
      "args": ["/ABSOLUTE/PATH/TO/amqs-mcp-server/server.py"],
      "env": { "AMQS_MOCK": "0" }
    }
  }
}
```

주의사항: (1) 경로는 반드시 절대경로, (2) venv 사용 시 `command`를 venv 내 python 절대경로로, (3) 수정 후 Claude Desktop 완전 재시작. 연결되면 다음과 같은 대화가 가능해진다:

```
사용자: 지금 레짐 확인하고, RISK_ON이면 Top 10 뽑아서 MU가 몇 위인지 알려줘.
       그리고 내 MU 평단 200불인데 손절선 걸렸는지도 봐줘.

Claude: [get_regime] → RISK_ON
        [get_top_signals(10)] → MU 3위, tier SATELLITE
        [check_stop_loss("MU", 200.0)] → pnl -17.95%, action EXIT
        → "손절선 -12%를 하회했습니다. AMQS 규칙상 EXIT 신호입니다..."
```

1부 4장의 "뉴스 요약 → 슬랙 전송" 예시가 그랬듯, 사용자는 자연어로 말하고 LLM이 tool 조합을 스스로 결정한다. 이 tool orchestration이 MCP의 실질 가치다.

## 11. 원격 배포 (Streamable HTTP)

stdio에서 원격으로 전환은 마지막 한 줄 변경이 전부다:

```python
mcp.run(transport="streamable-http")   # 기본 http://localhost:8000/mcp
```

| 항목 | stdio | Streamable HTTP |
|---|---|---|
| 사용자 | 본인 1명 | 팀·외부 공개 |
| 인증 | 불필요 (로컬 프로세스) | **OAuth 2.1 필수** (스펙 요구사항) |
| 배포 | — | Docker + reverse proxy, 또는 Cloudflare Workers 등 |
| 상태 관리 | 프로세스 = 세션 | 세션 ID 기반, 서버 스케일아웃 고려 |

Signal Bot 웹뷰(`python -m http.server 8011`)를 팀에 공유하던 것처럼, MCP 서버도 원격화하면 팀원 모두의 Claude가 동일한 AMQS 신호 소스를 쓰게 된다 — 단 인증 없는 공개는 절대 금물 (다음 절).

## 12. 보안 고려사항 (CTI 관점)

MCP는 새로운 공격 표면이다. 서버를 만드는 순간 방어자 관점도 함께 가져가야 한다.

| 위협 | 내용 | 본 샘플의 대응 / 권고 |
|---|---|---|
| Tool Poisoning | 악성 서버가 tool description에 숨은 지시를 심어 LLM 조종 | 서버 **제작자**로서: description을 기능 서술로 한정. **사용자**로서: 서드파티 서버 description 감사 후 설치 |
| Prompt Injection (간접) | tool이 반환한 외부 데이터(뉴스·웹) 안의 지시문을 LLM이 실행 | 반환값을 구조화 JSON으로 한정, 자유 텍스트 최소화 |
| Confused Deputy | LLM이 사용자의 의도를 넘는 tool 호출 수행 | 부수효과 있는 tool(주문 실행 등)은 만들지 않음 — 본 서버는 **read-only 신호 전용**. 실거래 연동 시 human-in-the-loop 승인 필수 |
| Secrets 노출 | config의 `env`에 API 키 평문 저장 | KIS API 등 연동 시 OS keychain / secret manager 사용. `.gitignore` + pre-commit secret scan (LAON VaultGuard 계열 도구) |
| Rug Pull | 신뢰 후 서버 업데이트로 tool 동작 변경 | 버전 고정 설치, 변경분 diff 리뷰 |
| 무인증 원격 노출 | Streamable HTTP 서버 공개 시 무단 사용·데이터 유출 | OAuth 2.1 + rate limit, 내부망은 최소 mTLS |

금융 신호 서버 특유의 리스크 한 가지: **LLM이 tool 출력을 과잉 해석해 확정적 매매 조언으로 바꾸는 것**. 대응은 3중이다 — 서버 `instructions`에 디스클레이머, 각 tool 출력에 `disclaimer` 필드, prompt 템플릿 말미에 고지 강제.

## 13. 확장 로드맵

| 단계 | 내용 | 난이도 |
|---|---|---|
| 1 | `backtest.py` 연동 — `run_backtest(start, end)` tool 추가 | 하 |
| 2 | Signal Bot의 `signals.json`을 Resource로 노출 (`amqs://signals/latest`) | 하 |
| 3 | ARDS-X 레짐 분류기를 별도 MCP 서버로 — AMQS/ARDS 핸드오프를 LLM이 오케스트레이션 | 중 |
| 4 | Toss Open API / KIS API 연동 — 단 실주문 tool은 승인 게이트 필수 | 상 |
| 5 | 크립토 뉴스 파이프라인(web3paper) 연동 — 뉴스 수집·요약 tool로 CTI/투자 통합 | 중 |
| 6 | Streamable HTTP + OAuth로 팀 배포, 다국어(KR/EN/ZH/JP) tool description | 중 |

## 14. 요약

**개념 (1부)**
1. MCP는 LLM과 외부 도구의 M×N 통합 문제를 M+N으로 줄이는 개방형 표준 — 'AI의 USB-C 포트'.
2. Host / Client / Server 구조에서 개발자가 만드는 것은 Server뿐이다.
3. MCP는 API를 대체하지 않는다 — 기존 API 위에 얹는 **LLM 친화적 어댑터 계층**이며, 핵심 차이는 동적 발견과 LLM 주도 호출이다.

**개발 (2부)**
4. MCP 서버 개발 = **결정론적 계산을 Tools로, 정적 데이터를 Resources로, LLM 워크플로우를 Prompts로** 노출하는 일이다.
5. AMQS의 Python/LLM 역할 분담표는 그대로 MCP 설계도가 된다 — 리스크 규칙(서브테마 캡, 손절)은 프롬프트가 아니라 코드에 강제한다.
6. 개발 순서: FastMCP + stdio → 단위 테스트 → 프로토콜 테스트 → Inspector → Claude Desktop → (필요 시) Streamable HTTP + OAuth.
7. 서버를 만드는 순간 공격 표면도 만든다 — Tool Poisoning, Injection, Secrets를 설계 단계에서 고려한다.

## 참고 링크

- MCP 공식 스펙·문서: https://modelcontextprotocol.io
- Python SDK: https://github.com/modelcontextprotocol/python-sdk
- MCP Inspector: https://github.com/modelcontextprotocol/inspector
- AMQS-AI-Infra 원본: https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20AI%20Infra

---

*본 문서와 코드는 연구·교육 목적이며 투자 권유가 아니다. AMQS는 고위험 퀀트 전략으로 원금 손실 가능성이 있다.*
*License: MIT — "Built on AMQS by Dennis Kim, vibe-investing repository."*
