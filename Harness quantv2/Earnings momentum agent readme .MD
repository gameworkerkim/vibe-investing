# Earnings Momentum Agent (개발 및 수정 중, 업데이트 전)

> **저점 반등 + 매출/실적 성장 + 어닝 서프라이즈 + 시장 심리를 종합해
> NASDAQ / S&P 500 종목 30선을 추천하는 LLM 기반 스크리닝 에이전트**

`vibe-investing` 레포의 **Harness Quant v2** 시리즈와 동일한 아키텍처를 따르며,
단일 파일이 아니라 여러 에이전트가 단계적으로 협력하는 agentic pipeline입니다.

---

## 이 스크립트가 하는 일

```
    ┌──────────────────────────────────────────────────────────┐
    │  1. Universe Scanner (유니버스 스캐너)                   │
    │     - NASDAQ + S&P 500 약 700개 종목 풀                  │
    │     - 시가총액 > $5B, 일평균 거래대금 > $50M 필터         │
    └────────────────────┬─────────────────────────────────────┘
                         ↓
    ┌──────────────────────────────────────────────────────────┐
    │  2. Fundamental Filter (펀더멘털 필터)                   │
    │     - 전 분기 대비 매출 YoY/QoQ 성장                     │
    │     - EPS 어닝 서프라이즈 (실제 vs 컨센서스)             │
    │     - 가이던스 상향 여부                                 │
    └────────────────────┬─────────────────────────────────────┘
                         ↓
    ┌──────────────────────────────────────────────────────────┐
    │  3. Technical Filter (테크니컬 필터)                     │
    │     - 52주 저점 대비 반등 (저점 반등 로직)               │
    │     - 50일/200일 이평선 돌파                             │
    │     - RSI / MACD 반전 시그널                              │
    └────────────────────┬─────────────────────────────────────┘
                         ↓
    ┌──────────────────────────────────────────────────────────┐
    │  4. Sentiment Engine (심리 엔진) — LLM Agentic            │
    │     - X(Twitter) 언급량·톤 분석                          │
    │     - 뉴스 sentiment (Reuters/Bloomberg/CNBC)            │
    │     - Reddit r/wallstreetbets, r/stocks 언급             │
    │     - StockTwits 불리시/베어리시 비율                    │
    └────────────────────┬─────────────────────────────────────┘
                         ↓
    ┌──────────────────────────────────────────────────────────┐
    │  5. Analyst Consensus Aggregator                         │
    │     - 애널리스트 매수/매도/중립 합의                     │
    │     - 평균/중간/최고 목표가                              │
    │     - 최근 30일 리비전 (상향/하향)                       │
    └────────────────────┬─────────────────────────────────────┘
                         ↓
    ┌──────────────────────────────────────────────────────────┐
    │  6. Multi-Agent Judge (Bull vs Bear vs PM)               │
    │     - Bull/Bear 각자의 thesis 구축                       │
    │     - Risk agent가 downside 시나리오 제시                │
    │     - PM agent가 최종 conviction 점수 산출               │
    └────────────────────┬─────────────────────────────────────┘
                         ↓
    ┌──────────────────────────────────────────────────────────┐
    │  7. Top 30 Ranking + Report                              │
    │     - 각 종목별 reasoning trail                          │
    │     - 매수/매도/관망 추천 + 목표가 + stop loss           │
    │     - Nvidia-forecast 스타일 sentiment dashboard          │
    └──────────────────────────────────────────────────────────┘
```

---

## 파일 구조

```
earnings_momentum_agent/
├── README.md                       ← 지금 보고 있는 파일
├── common/
│   ├── data.py                     ← 데이터 수집 (yfinance, Finnhub, X, Reddit)
│   ├── llm.py                      ← Claude/GPT 에이전트 공통 loop
│   └── tools.py                    ← tool_use 스펙 (LLM이 호출하는 함수들)
├── scripts/
│   ├── 01_universe_scanner.py      ← 유니버스 필터
│   ├── 02_fundamental_filter.py    ← 실적·어닝 서프라이즈
│   ├── 03_technical_filter.py      ← 저점 반등 + 모멘텀
│   ├── 04_sentiment_engine.py      ← X·뉴스·Reddit 심리 분석
│   ├── 05_analyst_consensus.py     ← 애널리스트 컨센서스
│   ├── 06_multi_agent_judge.py     ← Bull/Bear/Risk/PM 토론
│   └── 07_top30_report.py          ← 최종 리포트 + 대시보드 HTML
├── backtest/
│   ├── engine.py                   ← 벡터화 백테스트 엔진
│   └── walk_forward.py             ← walk-forward 검증
└── outputs/
    ├── top30_{YYYY-MM-DD}.json     ← 일별 top 30 추천
    ├── backtest_log_24months.csv   ← 24개월 백테스트 로그
    └── dashboard_{YYYY-MM-DD}.html ← Nvidia-forecast 스타일 대시보드
```

---

## 🛠️ 의존성 (Dependencies)

```bash
pip install anthropic yfinance pandas numpy scipy requests \
            finnhub-python praw beautifulsoup4 plotly jinja2
```

**환경 변수** (.env):
```bash
ANTHROPIC_API_KEY=sk-ant-...
FINNHUB_API_KEY=...           # 어닝 컨센서스·서프라이즈
X_BEARER_TOKEN=...            # X API v2 (선택 — 없으면 Nitter scraping)
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
NEWSAPI_KEY=...               # NewsAPI.org (뉴스 헤드라인)
```

---

## 사용법

### 빠른 시작 (15분 내)

```bash
cd earnings_momentum_agent

# 1. 유니버스 스캔 (5~10분)
python scripts/01_universe_scanner.py

# 2. 펀더멘털 + 테크니컬 필터 (동시 실행 가능)
python scripts/02_fundamental_filter.py
python scripts/03_technical_filter.py

# 3. 심리 엔진 (LLM 호출량 많음 — API 비용 ~$2-5)
python scripts/04_sentiment_engine.py

# 4. 애널리스트 컨센서스 + 최종 판단
python scripts/05_analyst_consensus.py
python scripts/06_multi_agent_judge.py

# 5. 최종 top 30 리포트 생성
python scripts/07_top30_report.py
```

### 오케스트레이터로 한 번에

```bash
python orchestrator/run_all.py --date 2026-04-19
```

---

## 산출물 예시

### Top 30 리포트 (JSON)

```json
{
  "generated_at": "2026-04-19T08:00:00+09:00",
  "universe_size": 723,
  "picks": [
    {
      "rank": 1,
      "ticker": "NVDA",
      "current_price": 142.50,
      "conviction_score": 9.2,
      "recommendation": "STRONG_BUY",
      "target_price_12m": 185.00,
      "stop_loss": 125.00,
      
      "fundamentals": {
        "revenue_yoy": 0.94,
        "revenue_qoq": 0.18,
        "eps_surprise_last_q": 0.12,
        "guidance_raised": true
      },
      "technical": {
        "pct_from_52w_low": 0.48,
        "above_50ma": true,
        "above_200ma": true,
        "rsi": 62
      },
      "sentiment": {
        "x_mentions_7d": 48320,
        "x_bullish_pct": 0.73,
        "news_sentiment_score": 0.62,
        "reddit_bullish_ratio": 3.4
      },
      "analyst": {
        "strong_buy": 38,
        "buy": 12,
        "hold": 3,
        "sell": 0,
        "avg_target": 178.50,
        "high_target": 220.00
      },
      
      "bull_thesis": "Blackwell 수요가 여전히 공급을 초과...",
      "bear_thesis": "중국 AI chip 규제 리스크 + 중국 수요 둔화...",
      "risk_scenario": "DeepSeek류 효율화 모델 확산 시 -25%",
      "pm_verdict": "단기 catalyst 강함, 12개월 보유 권장"
    },
    // ... 29 more
  ]
}
```

### 24개월 백테스트 CSV

컬럼: 날짜, 티커, 액션, 가격, conviction, 주요 이유 (bullets), 이후 수익률 등
→ `outputs/backtest_log_24months.csv`

### Nvidia-forecast 스타일 대시보드 (HTML)

Plotly로 그린 interactive 차트:
- 가격 + 애널리스트 컨센서스 대역
- X 멘션량 + 톤 타임라인
- 최근 4분기 매출·EPS 추이
- 목표가 분포 히스토그램

---

## 기존 오픈소스 추천 (차용·비교용)

아래 레포들은 이 프로젝트의 설계에 영향을 준 검증된 오픈소스입니다.
전체 평가는 `vibe-investing` 레포의 [Awesome Vibe Invest](../Awesome%20vibe%20invest.MD)를 참고하세요.

| 프로젝트 | 특징 | 차용 포인트 |
|---|---|---|
| **virattt/ai-hedge-fund** (55.8k⭐) | 18명 투자가 페르소나 멀티 에이전트 | 06_multi_agent_judge 설계 |
| **TauricResearch/TradingAgents** | Bull/Bear/Risk/PM 구조 | 에이전트 역할 분리 |
| **AI4Finance/FinRobot** | 금융 특화 LLM 오케스트레이션 | 전체 파이프라인 |
| **pipiku915/FinMem-LLM-StockTrading** | Layered memory | long-term conviction 기억 |
| **OpenBB-finance/OpenBBTerminal** | 오픈 데이터 허브 | 데이터 수집 |
| **finnhub-python** | 어닝 서프라이즈·컨센서스 API | 02_fundamental |
| **Persdre/FS-ReasoningAgent** | fact vs subjective 분리 | sentiment 필터 |
| **public-apis/public-apis** | 무료 데이터 소스 모음 | 데이터 소스 선택 |

---

## Disclaimer

- 본 스크립트는 **연구·교육 목적**이며 투자 조언이 아닙니다
- 어닝 데이터는 리포트 지연·정정 가능 — Finnhub 제공분 시점 기준
- X/Reddit sentiment는 **봇·조작 영향**을 받습니다. 원본 신호로만 쓰지 마세요
- 한국 거주자의 미국 주식 자동 매매는 금감원 및 외환거래법 검토 필수
- 본 코드를 실거래에 사용하려면 본인이 백테스트·paper trading 최소 3개월 이상 거치세요

MIT License — 출처 표기 시 자유 사용.

---

<p align="center">
  <i>"어닝 서프라이즈는 주가를 올리지만,<br>
  어닝 쇼크는 다음날 갭 다운을 만든다."</i>
</p>
