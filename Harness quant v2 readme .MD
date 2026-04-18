# Harness Quant — LLM 기반 미국 주식 분석/배치 시스템

NASDAQ / S&P500 종목을 대상으로 **하네스 엔지니어링** (LLM이 도구를 호출하며 추론하는 agentic loop) 방식으로 분석합니다. (소스코드 업데이트전)

## 모듈 구성

```
harness_quant/
├── common/                     # 공통 인프라
│   ├── data.py                 # yfinance + Finnhub + Stocktwits + Reddit + 11섹터 ETF
│   ├── tools.py                # data 함수를 Anthropic tool_use 스펙으로 래핑
│   └── llm.py                  # HarnessAgent: agentic loop (model ↔ tools)
│
├── scripts/                    # 시나리오별 분석 스크립트
│   ├── 01_short_buy_sector_momentum.py    # 단기 매수: 섹터 호전 + 호평
│   ├── 02_mid_buy_structural_growth.py    # 중기 매수 1~3y: 구조적 성장
│   ├── 03_short_divergence_alpha.py       # 단기 섹터 이탈
│   ├── 04_mid_divergence_structural.py    # 중기 구조적 이탈
│   ├── 05_short_crash_signal.py           # 단기 급락 시그널 (R1~R6)
│   ├── 06_mid_decline_thesis.py           # 중기 구조적 쇠퇴 (D1~D7)
│   └── 07_multi_agent_debate.py           # Bull vs Bear vs Judge 토론
│
├── backtest/                   # 백테스트 엔진
│   └── engine.py               # 단일 시점 + 워크포워드 검증
│
├── mcp_server/                 # MCP 서버 (Claude Desktop / Cowork 연동)
│   └── server.py               # FastMCP 기반 도구 노출
│
├── orchestrator/               # 일괄 실행 + 알림
│   └── run_all.py              # 6 시나리오 실행 → 통합 → Slack/Telegram
│
├── .github/workflows/
│   └── daily.yml               # GitHub Actions 일일 자동 실행
│
├── requirements.txt
└── README.md
```

## 시나리오 매트릭스

| 번호 | 기간 | 방향 | 트리거 |
|---|---|---|---|
| 01 | 단기 (1d~4w) | LONG | 섹터 ETF 상위 + 종목 RS 양호 + 뉴스/소셜 우호 |
| 02 | 중기 (1~3y) | LONG | 200일선 위 + 매출/EPS 가속 + ROE>=15% + 정성 thesis |
| 03 | 단기 | LONG/SHORT | 섹터 vs 종목 RS_20d ±5% 이상 divergence |
| 04 | 중기 | LONG/SHORT | RS_60d ±15% + 펀더멘털 변곡점 |
| 05 | 단기 | SHORT/AVOID | R1(부정뉴스) + R2(내부자매도) + R3(공매도↑) + R4(기술적붕괴) + R5(베어소셜) + R6(밸류부담) 중 ≥3 |
| 06 | 중기 | SHORT/AVOID | D1(섹터하락) + D2(매출감속) + D3(마진압축) + D4(부채위험) + D5(다운그레이드) + D6(내부자매도) + D7(경쟁위협) 중 ≥4 |
| 07 | 단일 종목 | 종합 | Bull/Bear 에이전트 토론 → Judge가 BUY/HOLD/AVOID/SHORT 결정 |

## 설치

```bash
pip install -r requirements.txt
```

## 환경변수

```bash
# 필수
export ANTHROPIC_API_KEY="sk-ant-..."

# 권장 (없어도 fallback 작동)
export FINNHUB_API_KEY="..."             # https://finnhub.io 무료 60req/min
export REDDIT_CLIENT_ID="..."            # https://www.reddit.com/prefs/apps
export REDDIT_CLIENT_SECRET="..."
export REDDIT_USER_AGENT="harness-quant/0.1"

# 알림 (orchestrator용, 선택)
export SLACK_WEBHOOK="https://hooks.slack.com/services/..."
export TELEGRAM_BOT_TOKEN="..."
export TELEGRAM_CHAT_ID="..."
```

## 사용 예시

### 1. 단일 시나리오 실행
```bash
python scripts/01_short_buy_sector_momentum.py
python scripts/05_short_crash_signal.py
```
출력: 콘솔에 도구 호출 로그 + 마지막에 JSON.

### 2. 단일 종목 Bull/Bear 토론
```bash
python scripts/07_multi_agent_debate.py NVDA --rounds 1 --save nvda_debate.json
python scripts/07_multi_agent_debate.py PLTR --rounds 2   # 반박 라운드 추가
```

### 3. 백테스트 (스크립트 결과 검증)
```bash
# 1단계: 시나리오 실행 결과를 JSON 파일로 저장
python scripts/01_short_buy_sector_momentum.py > result_01.txt
# (수동으로 마지막 JSON 블록을 candidates_01.json으로 추출, 또는 orchestrator가 자동 저장)

# 2단계: 백테스트
python -m backtest.engine candidates_01.json --entry-date 2025-12-01 --holding-days 20
python -m backtest.engine candidates_05.json --entry-date 2025-12-01 --mode avoid
```

출력 예시:
```
Backtest 2025-12-01 → 2025-12-29 (20d)
  Positions:        7
  Portfolio return: +4.32%
  Benchmark:        +1.18%
  Alpha:            +3.14%
  Win rate:         71.4%
  Sharpe (annual):  2.45
  Max drawdown:     -1.87%
```

### 4. 전체 시나리오 일괄 실행 + 알림
```bash
python -m orchestrator.run_all
```
- `runs/YYYY-MM-DD/` 디렉토리에 6개 시나리오 JSON + `_aggregate.json` 저장
- 다중 시나리오에서 중복 등장한 종목은 강한 시그널로 처리
- Slack/Telegram에 요약 전송

### 5. MCP 서버로 Claude Desktop / Cowork에 연결

`~/Library/Application Support/Claude/claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "harness-quant": {
      "command": "python",
      "args": ["-m", "mcp_server.server"],
      "cwd": "/path/to/harness_quant",
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-...",
        "FINNHUB_API_KEY": "..."
      }
    }
  }
}
```
재시작 후 Claude Desktop에서 "NVDA의 모멘텀, 펀더멘털, 최근 뉴스, 공매도 잔고를 한 번에 보여줘" 같은 자연어로 호출 가능.

### 6. GitHub Actions로 매일 자동 실행
`.github/workflows/daily.yml` 포함. Repository Secrets에 `ANTHROPIC_API_KEY`, `FINNHUB_API_KEY`, `SLACK_WEBHOOK` 등 등록 후 push하면 매일 KST 07:00에 자동 실행.

## HarnessAgent 동작 원리

```
User → system prompt + tools 정의 + user message
    ↓
LLM 응답 (tool_use 블록 포함)
    ↓
도구 함수 실행 → 결과를 tool_result로 메시지에 추가
    ↓
LLM 재호출 (이전 결과 컨텍스트 포함)
    ↓
... stop_reason == "end_turn" 까지 반복 (max 12~70 iterations) ...
    ↓
최종 메시지 (JSON 강제)
```

각 시나리오의 `system_prompt`가 분석 로직과 출력 스키마를 모두 담고 있어, **하네스 = 분석 방법론의 코드화**입니다.

## 비용 가이드 (Claude Opus 4.7 기준)

| 시나리오 | 토큰 | 비용 (USD) |
|---|---|---|
| 01 단기 매수 | 30~80k | $0.5~$1.5 |
| 02 중기 매수 | 50~150k | $1~$3 |
| 03 단기 이탈 | 40~100k | $0.7~$2 |
| 04 중기 이탈 | 60~150k | $1~$3 |
| 05 단기 급락 | 50~150k | $1~$3 |
| 06 중기 쇠퇴 | 60~180k | $1.2~$3.5 |
| 07 토론 (1라운드) | 40~80k | $0.7~$1.5 |
| **전체 일일 실행** | ~700k | **$10~$20** |

비용 절감: `common/llm.py`의 `DEFAULT_DEEP_MODEL`을 `claude-sonnet-4-6`으로 바꾸면 약 1/5로 감소.

## 주의사항

- 본 코드는 **연구/리서치 목적**입니다. 실제 투자 결정은 본인 책임.
- `yfinance`는 비공식 API라 간헐적 rate limit이 있습니다. 실전 운영은 Polygon.io/Alpha Vantage/IEX Cloud 유료 API로 교체 권장.
- LLM hallucination 위험: 모델이 가짜 티커나 실제와 다른 펀더멘털을 만들어낼 수 있습니다. 출력은 **반드시 사람이 검증** 후 사용하세요.
- 백테스트는 look-ahead bias가 없도록 작성됐지만, system_prompt에 "as of {date}"를 박지 않으면 LLM이 미래 정보를 참조할 수 있습니다. 워크포워드 검증시 `signal_generator`를 신중히 구현하세요.
- 미국 SEC 규정상 인공지능 기반 투자자문 서비스는 등록이 필요할 수 있습니다. **상업화시 법률 검토 필수.**

## 확장 로드맵

- [ ] **Polygon.io/Alpha Vantage** 어댑터로 데이터 소스 안정화
- [ ] **vectorbt** 백엔드로 다종목 워크포워드 가속
- [ ] **Polymarket / Kalshi** 베팅 시장 데이터 추가 (정치/규제 이벤트 가격화)
- [ ] **실적 발표 트랜스크립트** Whisper STT → LLM 분석
- [ ] **earnings drift / PEAD** 전용 시나리오 추가
- [ ] **옵션 IV/skew** 데이터 통합 (TradingAgents 패턴)
- [ ] **TradingAgents** 전체 7-role 에이전트 풀 통합 (현재는 3-role 토론만)
- [ ] **Claude Code skill**로 패키징 (XVARY Stock Research 패턴)
