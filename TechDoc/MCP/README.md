# AMQS-AI-Infra MCP Server

vibe-investing 리포지토리: Adaptive Momentum Quant Strategy (AMQS) for AI Infra 의 MCP(Model Context Protocol) 서버 구현 및 문서.

## 디렉토리 구성

| 파일 | 설명 |
|---|---|
| `Mcp server getting started.md` | MCP 개념 개요(1부) + 실전 서버 개발(2부). MCP 아키텍처, 3대 primitive(Tools/Resources/Prompts), AMQS 신호 서버 단계별 구현을 다룬다. |
| `server.py` | `FastMCP`(Python) 기반 MCP 서버 전문. 4개 tool(`get_regime`, `get_momentum_score`, `get_top_signals`, `check_stop_loss`), 1개 resource(`amqs://universe`), 1개 prompt(`cross_validate_ticker`)를 노출한다. `AMQS_MOCK=1`로 오프라인 합성 데이터 데모를 지원한다. |
| `requirements.txt` | Python 의존성: `mcp`, `yfinance`, `pandas`, `numpy`. |
| `claude_desktop_config.example.json` | Claude Desktop 연결을 위한 stdio transport 설정 예시. |
| `README.md` | 한국어 안내 (현재 파일). |
| `README.en.md` | 영문 안내. |
| `llms.txt` | LLM용 문서 인덱스 (llmstxt.org 형식). |

## 빠른 시작

```bash
# 1. Python 가상환경 설정
python -m venv venv && source venv/bin/activate

# 2. 의존성 설치
pip install -r requirements.txt

# 3. Mock 모드 실행 (네트워크 불필요, API 키 불필요)
AMQS_MOCK=1 python server.py

# 4. 실데이터 모드 실행 (인터넷 필요)
python server.py
```

## 검증 파이프라인

시작 가이드 문서에 기술된 3단계 검증:

1. **단위 테스트** -- import 후 함수 직접 호출
2. **프로토콜 테스트** -- MCP 클라이언트 stdio 핸드셰이크: `initialize` -> `list_tools` -> `call_tool`
3. **MCP Inspector** -- 브라우저 UI 대화형 확인:
   ```bash
   npx @modelcontextprotocol/inspector python server.py
   ```

## Claude Desktop 연결

`claude_desktop_config.example.json`을 Claude Desktop 설정 경로에 복사하고, `server.py`의 절대 경로로 수정 후 Claude Desktop을 완전 재시작한다.

| OS | 설정 경로 |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

## 주요 설계 결정

- **계층 분리**: 데이터 계층(yfinance/캐시) -> 전략 계층(순수 함수) -> MCP 계층(데코레이터). 전략 로직을 MCP와 분리해 재사용성과 테스트 용이성을 확보.
- **도메인 규칙은 코드에 강제**: 서브테마 캡(테마당 최대 4종)과 손절(-12%)은 프롬프트가 아닌 코드에 하드코딩.
- **구조화된 JSON 반환**: 모든 tool 응답을 `json.dumps` + `ensure_ascii=False`로 직렬화해 LLM이 안정적으로 파싱 가능.
- **서버 레벨 디스클레이머**: `FastMCP(instructions=...)`에 연구용 고지를 포함해 모든 상호작용에 자동 적용.

## 참고 링크

- MCP 공식 스펙: https://modelcontextprotocol.io
- Python SDK: https://github.com/modelcontextprotocol/python-sdk
- MCP Inspector: https://github.com/modelcontextprotocol/inspector
- AMQS-AI-Infra 원본 전략: https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20AI%20Infra

## 라이선스

MIT -- "Built on AMQS by Dennis Kim, vibe-investing repository."

본 코드와 문서는 연구·교육 목적이며, AMQS는 고위험 퀀트 전략으로 원금 손실 가능성이 있다.
