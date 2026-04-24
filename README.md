# vibe investing

> **인공지능을 이용한 바이브 투자(Vibe Investing) 관련 의견과 자료를 나누는 레포**

AI 투자(Vibe Investing) 큐레이션 어썸 시리즈 · 시장 분석 칼럼 7편 · AI 트레이딩 도구 3종 (Harness Quant v2 + Earnings Momentum Agent + Nasdaq-BTC Coupling Bot) 을 다룹니다. 리서치하는 마켓은 미국 나스닥, S&P500, 가상화폐, 유럽 명품 섹터, 크립토-주식 상관관계입니다. 인공지능은 엑셀과 같은 도구입니다. LLM은 만능이 아니며, 모델을 읽는 인간의 통찰력이 가장 중요하다고 믿습니다. 지금 비트코인과 나스닥의 커플링의 시그널이 강력한 가운데 우리는 소음과 신호에서 신호를 인공지능이라는 도구를 통해 발견할 수 있습니다.

2026년 4월 25일 새로 추가된 LLM을 이용한 Awesome Claude Quant Scripts를 통해서 나만의 퀀트 전략을 수립할 수 있게 되었습니다.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with](https://img.shields.io/badge/Made%20with-Claude%20%2B%20Python-blue)](https://github.com/gameworkerkim/vibe-investing/blob/main)
[![Updates](https://img.shields.io/badge/Updates-Weekly-brightgreen)](https://github.com/gameworkerkim/vibe-investing/blob/main)
[![Awesome Lists](https://img.shields.io/badge/Awesome--Lists%20%C3%97%203-orange)](https://github.com/gameworkerkim/vibe-investing/blob/main)
[![Columns](https://img.shields.io/badge/Columns-7%20Published-purple)](https://github.com/gameworkerkim/vibe-investing/blob/main)
[![Tools](https://img.shields.io/badge/Tools-3%20Built-cyan)](https://github.com/gameworkerkim/vibe-investing/blob/main)
[![Datasets](https://img.shields.io/badge/Datasets-14%2B%20CSV-red)](https://github.com/gameworkerkim/vibe-investing/blob/main)

---

## Curation Map

아래 다이어그램은 **Awesome Claude Quant Scripts**가 정리한 8대 퀀트 전략 분류 체계입니다. 본 레포의 칼럼·도구·데이터셋은 이 분류 위에서 작동합니다 — 예컨대 *Earnings Momentum Agent*는 Growth × Quality × Momentum 멀티팩터, *Nasdaq-BTC Coupling Bot*은 Statistical Arbitrage / Time-Series Momentum, *DAT mNAV 칼럼*은 Value/Pair Trading의 변형입니다.

![Trading Strategy Taxonomy — Awesome Claude Quant Scripts](./01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/trading%20map.png)

> 4대 핵심 팩터 (Value · Growth · Quality · Momentum) + 4대 고급 전략 (Multi-Factor · Trend Following · Statistical Arbitrage · Machine Learning) — 각 전략별 학계·업계 대가의 원전 논문, Python 코드 골격, Claude 프롬프트 템플릿 큐레이션은 [Awesome Claude Quant Scripts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD) 참조.

---

## Quick Links

### 📖 어썸 큐레이션 시리즈

| # | 제목 | 다루는 영역 |
| --- | --- | --- |
| 1 | [**Awesome Vibe Invest — Stocks & Equities**](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD) | 주식 (NASDAQ / S&P500) — 30+ AI 투자 GitHub 레포 평가 |
| 2 | [**Awesome Vibe Invest — Crypto & DeFi Edition**](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest%20crypto.MD) | 비트코인 / 크립토 — 벤치마크 중심 LLM 트레이딩 큐레이션 |
| 3 | [**Awesome Claude Quant Scripts**](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD) 🆕 | 퀀트 전략 8종 — 학계 원전 논문 30+편 + Claude 프롬프트 + Python 골격 |

### 📰 칼럼 시리즈

| # | 제목 | 주제 |
| --- | --- | --- |
| 1 | [**LTCM의 사례로 배우는 모델을 읽는 힘**](https://github.com/gameworkerkim/vibe-investing/blob/main/Vibe%20Investing%20Risk%20Management.MD) | 1998년 LTCM 사태 분석 + 2026년 AI 바이브 투자의 리스크 |
| 2 | [**Microsoft의 Fintool 인수 — Excel이 곧 Bloomberg가 되는 날**](https://github.com/gameworkerkim/vibe-investing/blob/main/Microsoft%20fintool%20acquisition%20column.MD) | Microsoft의 Fintool 인수 시너지 분석 |
| 3 | [**보이지 않는 손인가, 계획딘 사기인가**](https://github.com/gameworkerkim/vibe-investing/blob/main/Crypto%20perp%20manipulation%20column.MD) | 가상화폐 선물 시장의 비정상적 pump & dump 패턴 수학적 검토 |
| 4 | [**시장은 닫혔을 때 열리는가**](https://github.com/gameworkerkim/vibe-investing/blob/main/AfterMarketClose/After_Market_Close_Column.md) | 미국 상장기업 91.2%가 AMC에 악재를 공시하는 이유 — 34건 실증 데이터 |
| 5 | [**DAT 기업의 mNAV 아비트리지 전략**](https://github.com/gameworkerkim/vibe-investing/blob/main/mNAV(Market-to-Net-Asset-Value)%20arbitrage/Dat%20mnav%20arbitrage%20strategy.MD) | MSTR·BMNR 등 디지털 자산 보유 기업의 크립토 가치-시총 격차 분석 |
| 6 | [**명품은 언제 사야 하는가**](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Luxury%20investment%20strategy/Luxury%20investment%20strategy.md) | LVMH · Hermès · Kering — 중국 경기 침체 시대의 명품 투자 3단계 전략 |
| 7 | [**가상화폐와 나스닥은 얼마나 동기화되고 있을까?**](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling/Nasdaq%20crypto%20coupling%20strategy.MD) | BTC-QQQ 6년 상관관계 + 6 regime 분류 + 인트라데이 lag 측정 |

### 🛠️ 직접 개발 중인 도구

| # | 제목 | 설명 |
| --- | --- | --- |
| 1 | [**Harness Quant v2**](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quant%20v2%20readme%20.MD) | LLM 기반 NASDAQ/S&P500 분석 패키지 (6개 시나리오 + 백테스트 + MCP + 멀티 에이전트 토론) |
| 2 | [**Earnings Momentum Agent**](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quantv2/Earnings%20momentum%20agent%20readme%20.MD) | 저점 반등 + 매출 성장 + 어닝 서프라이즈 + 시장 심리 종합 Top 30 추천 파이프라인 (24개월 백테스트 hit rate 83.3%) |
| 3 | [**Nasdaq-BTC Coupling Bot**](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling/) | BTC-QQQ 30일 rolling correlation 실시간 추적 + 6 regime 분류 + 트레이딩 신호 생성 (547 lines, 10 classes) |



---

## Vibe Investing이란?

**Vibe Coding**(바이브 코딩)이 자연어로 LLM에 지시해서 코드를 만드는 패러다임이라면,
**Vibe Investing**(바이브 인베스팅)은 자연어 지시 → LLM이 도구를 호출 → 시장 데이터·뉴스·소셜 신호 수집·분석 → 투자 의사결정 산출까지의 **agentic 파이프라인**을 지칭합니다.

전통적 알고리즘 트레이딩이 "if RSI < 30 then buy" 같은 경직된 룰 기반이라면, vibe investing은:

* **자연어로 전략 정의** ("섹터가 호전되고 시장에서 호평받는 종목을 찾아줘")
* **LLM이 능동적으로 도구 호출** (가격, 펀더멘털, 뉴스, 소셜, 내부자 거래, 온체인 데이터)
* **다층적 추론과 합의** (Bull/Bear/Risk/PM 멀티 에이전트 토론)
* **JSON으로 구조화된 결정** (사람이 검증 가능한 reasoning trail)

이 레포는 vibe investing의 **현재 도구·솔루션 지형을 정리**하고, **시장의 흐름을 분석한 칼럼**을 함께 공개하며, **직접 만들고 있는 레퍼런스 구현체**도 함께 공유합니다.

---

## 이 레포에는 무엇이 있나요?

### 1. Awesome Vibe Invest — Stocks & Equities

[**📖 전체 문서 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD)

NASDAQ / S&P500을 분석하는 AI 도구 30+ 큐레이션. 12개 카테고리 (멀티 에이전트 프레임워크, 강화학습 트레이딩, 금융 LLM, 백테스트 엔진, MCP 인프라, 한국 시장 자원, 공통 함정 등).

**핵심 차별점**:

* ⭐ 단순 나열이 아닌 **객관적 평가 (강점 + 약점 + 적합 사용자)**
* 📊 활성도·성숙도·학습곡선·한국 시장·라이선스 5축 평가
* 🇰🇷 **한국/아시아 시장 자원 별도 섹션** (pyKRX, 한국투자증권 OpenAPI 등)
* ⚠️ **공통 함정 12가지** (백테스트·LLM hallucination·운영·거버넌스·비용)
* 🎯 **사용자 유형별 시작 경로 5개**

### 2. Awesome Vibe Invest — Crypto & DeFi Edition

[**📖 전체 문서 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest%20crypto.MD)

비트코인을 비롯한 암호화폐 LLM 트레이딩 큐레이션. **벤치마크 결과**와 **지속적 업데이트**를 갖춘 프로젝트 중심으로 평가.

**가장 중요한 데이터 — Alpha Arena Season 1 결과**:

* 🥇 **DeepSeek V3.1**: +46% (실제 자본 $10,000 → $14,764)
* 🥈 Qwen3 Max
* 🥉 Claude Sonnet 4.5
* 🥉 Grok 4
* ❌ Gemini 2.5 Pro
* ❌ **GPT-5**: -75%

→ **모델 IQ가 곧 트레이딩 IQ는 아니다**라는 사실을 입증한 최초의 실거래 벤치마크.

**다루는 9개 카테고리**:

```
1. 벤치마크 & 평가 인프라 (Nof1 Alpha Arena 등 — 가장 중요)
2. 학술 검증 LLM 트레이딩 (CryptoTrade EMNLP 2024, FS-ReasoningAgent 등)
3. 프로덕션 멀티 에이전트 봇 (CloddsBot, qrak/LLM_trader 등)
4. Solana 네이티브 AI 에이전트 (ElizaOS 17.6k+ stars, Solana Agent Kit, GOAT, Rig)
5. 멀티체인 / EVM 에이전트 툴킷
6. MEV / DEX 전용 봇 (Jito mev-bot 등)
7. 예측 시장 (Polymarket / Kalshi) AI 에이전트
8. 데이터 인프라 & 온체인 분석
9. 공통 함정 (Crypto 특화) — 24/7 시장, slippage, MEV, CEX 리스크 등
```

### 3. Awesome Claude Quant Scripts — 퀀트 전략 + Claude 프롬프트 큐레이션 🆕

[**📖 전체 문서 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD)

> *"Claude가 생성한 코드는 항상 사람이 검증해야 한다.*
> *직접 검증할 능력이 없다면, 다른 LLM을 통해서라도 교차 검증 및 환각을 필터링해야 한다."*

**8대 퀀트 전략을 학계 원전 → Python 코드 골격 → Claude 프롬프트 템플릿의 3-레이어로 묶은 종합 레퍼런스.** Vibe Investing이 *어떤 도구를 쓰느냐*에 대한 큐레이션이라면, 이 어썸 리스트는 *어떤 전략을 어떤 이론적 기반 위에서 돌리느냐*에 대한 큐레이션입니다.

**3-레이어 구조**:

| Layer | 내용 |
| --- | --- |
| **이론층 (Theory)** | 학계·업계에서 반복 검증된 팩터·전략의 원전 논문과 서적 |
| **실무층 (Implementation)** | 각 전략을 돌릴 수 있는 최소한의 Python 코드 골격 |
| **AI 협업층 (Claude)** | 전략을 한 줄로 불러내는 재사용 가능한 Claude 프롬프트 템플릿 |

**다루는 8대 전략**:

```
Core Factor Strategies (핵심 팩터 4종)
├── Value      (가치)     — Graham, Fama-French, Greenblatt
├── Growth     (성장)     — Fisher, Lynch, O'Neil (CAN SLIM)
├── Quality    (퀄리티)   — Novy-Marx, AQR (Quality Minus Junk)
└── Momentum   (모멘텀)   — Jegadeesh-Titman, Carhart, Moskowitz

Advanced Strategies (고급 전략 4종)
├── Multi-Factor          — Fama-French 5-factor, AQR multi-factor
├── Trend Following       — Turtle Traders, Clenow, AQR "Century of Evidence"
├── Statistical Arbitrage — Gatev-Goetzmann-Rouwenhorst, Vidyamurthy, Thorp
└── Machine Learning      — López de Prado, Gu-Kelly-Xiu, Stefan Jansen
```

**핵심 차별점**:

* 📚 **학계 원전 30+편** — 추측이 아닌 *Journal of Finance*, *RFS*, *JFE*급 1차 출처 인용
* 🎯 **각 전략별 4개 산출물** — 개요·핵심 지표·대가 테이블·Claude 프롬프트·Python 골격
* 🧰 **범용 프롬프트 5종 (T1~T5)** — Strategy Stress-Test · Paper→Code · Risk Overlay · Crypto 이식 · Live Paper Trading 전환
* ⚠️ **룩어헤드·생존편향·과적합 체크리스트** 모든 전략에 명시
* 🔍 **Claude 환각 필터링 권장** — 직접 검증 불가 시 다른 LLM으로 교차 검증

**왜 이 큐레이션이 필요한가**:

대부분의 퀀트 로직은 *유니버스 → 팩터 산출 → 랭킹 → 리밸런싱 → 성과 평가*라는 정해진 설계 패턴을 따릅니다. Claude는 이 보일러플레이트를 빠르게 생성하지만, **어떤 팩터가 어떤 논문에 근거하며 어떤 함정이 있는지**까지 매번 처음부터 설명할 필요는 없습니다. 이 어썸 리스트는 그 *맥락 압축* 역할을 합니다 — 한 번 복사해 Claude에 붙여 넣으면 즉시 학술적으로 정합한 백테스트 코드가 생성됩니다.

**예시 — Value 팩터 백테스트 호출**:

```text
당신은 퀀트 애널리스트입니다. 아래 스펙으로 Value 팩터 백테스트 코드를 Python으로 작성해주세요.

[UNIVERSE]    : KOSPI200
[FACTORS]     : PBR, PER, EV/EBITDA (동일가중 Z-score 합성)
[FILTERS]     : 시가총액 1,000억원 이상, 적자 기업 제외, 금융/지주사 제외
[REBALANCING] : 분기별, 상위 20% 동일비중 매수
[PERIOD]      : 2015-01-01 ~ 오늘
[BENCHMARK]   : KOSPI200 총수익지수
...
- 룩어헤드 편향 방지 주석을 각 스텝에 명시할 것
```

문서 안에 8대 전략 모두 동일한 형식의 즉시 사용 가능한 프롬프트가 들어 있습니다.

### 4. 칼럼: LTCM의 사례로 배우는 모델을 읽는 힘

[**📰 전체 칼럼 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Vibe%20Investing%20Risk%20Management.MD)

> *"모델은 언제나 진실을 가리킨다. 손가락은 언제나 탐욕을 가리킨다."*

1998년 노벨경제학상 수상자 2명이 운영한 헤지펀드 LTCM이 4개월 만에 청산된 사건을 분석하고, 이를 2026년 AI 바이브 투자 환경에 적용한 칼럼.

**다루는 내용**:

* 🏛️ LTCM의 흥망 (자본금 47억 달러 → 레버리지 130:1까지 폭증)
* 🔄 *기능적 동질화(functional homogenization)* — 같은 모델을 모두가 쓰면 시스템 리스크
* 📊 2026년 4월 시장 지표 (Shiller CAPE 38, 버핏 지표 230%, IT 섹터 CAPE 64.5)
* ⚠️ AI 바이브 투자가 LTCM을 닮은 3가지 이유
* 🛡️ 5가지 실용 원칙

### 5. 칼럼: Microsoft의 Fintool 인수 — Excel이 곧 Bloomberg가 되는 날

[**📰 전체 칼럼 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Microsoft%20fintool%20acquisition%20column.MD)

> *"앞으로 30년의 터미널은 터미널이 아닐 것이다. 대답하는 스프레드시트 셀일 것이다."*

직원 6명, 조달 $7.24M의 스타트업 Fintool을 마이크로소프트가 인수한 사건 분석. $370억 규모의 금융 데이터 터미널 시장(Bloomberg, FactSet, S&P Capital IQ)에 대한 마이크로소프트의 진입 전략을 6가지 시너지 + 5가지 위험으로 입체적으로 분석.

**다루는 내용**:

* Fintool은 무엇이었나 (Y Combinator, Menlo Ventures, Cassius)
* 마이크로소프트가 이미 갖고 있던 것 (Copilot for Finance, Finance Agents, Agent Mode)
* 6가지 시너지 벡터 (Distribution × Depth, Excel native, Cross-app continuity 등)
* 5가지 위험 (Acqui-hire 실패 패턴, EU 규제, LLM hallucination 책임 등)
* 시장 충격 분석 (Bloomberg, FactSet, S&P Capital IQ mindshare 변화)

### 6. 칼럼: 보이지 않는 손인가, 계획된 사기인가?

[**📰 전체 칼럼 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Crypto%20perp%20manipulation%20column.MD)

> *"벤포드 법칙은 거짓말을 못 한다. 온체인 데이터는 영원히 남는다."*

가상화폐 무기한 선물 시장에서 반복되는 "급등 → 청산 폭포 → 원점 복귀" 패턴을 **수학적·통계적 논증**과 **온체인 포렌식**으로 분석한 칼럼. 특정 토큰·재단·거래소를 지목하지 않고 통계적 귀납만으로 결론을 도출 — 법적 안전성과 논증 강도를 모두 확보했습니다.

**다루는 내용**:

* 🔢 **VTCLR 패턴 정의** — Vertical·Thin·Coordinated·Liquidation·Round-trip 5가지 조건
* 📐 **3가지 수학적 정리**: 벤포드 법칙 이탈(χ² 검정), 4+ 지갑 우연 동시성 확률 = 2×10⁻⁸, 미시구조 OHLC 발산
* 🔍 **공개 사건 3건** — Hyperliquid XPL(2025년 8월, $4,600만+ 공격자 이익), Fartcoin(2025년 4월, 4지갑 좌표화), 2025년 10월 $200억 청산
* 🧠 **베이지안 3가설 분석** — H₁(자연시장) 기각, H₂(단일 고래) 부분 지지, H₃(좌표화된 전략) 지배적
* ⚖️ **4가지 법적으로 안전한 결론** — 통계적·구조적·정책적·투자자용

### 7. 칼럼: 시장은 닫혔을 때 열리는가

[**📰 전체 칼럼 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/AfterMarketClose/After_Market_Close_Column.md)

> *"모든 공시는 동일하게 중요하다. 다만 투자자의 주의력은 동일하지 않다."*

미국 상장기업의 시장 충격 공시가 압도적으로 **장 마감 후(After Market Close)에 집중**되는 현상을 실제 데이터로 분석한 칼럼. COVID 시기(2020) ~ 2025년 **나스닥 100 구성 기업 34건의 실제 공시 사례**를 수집·분석해 학술 문헌과 결합했습니다.

**핵심 발견**:

* 🔍 **91.2%의 시장 충격 공시가 AMC에 발표** (34건 샘플)
* 📉 AMC 공시 다음날 평균 주가 변동률: **-6.45%** (BMO 공시는 +1.15%)
* 🎯 AMC + Severe 조합(n=14)의 다음날 평균: **-10.79%**
* ⚖️ *"시장 구조의 자연스러운 귀결"* 프레임으로 법적 안전성 확보

**다루는 내용**:

* 🏛️ AMC 공시의 3가지 합법적 이유 (정보 처리 시간, Reg FD, 거래소 관행)
* 📊 Watkins et al. 2023 (*The Accounting Review*, 49,652건 8-K 분석) 인용
* 🇺🇸 Meta 2022-02-02 -26.4%, Netflix 2022-04-19 -35.1%, Intel 2024-08-02 -26.1% 등
* 🛡️ 개인·기관 투자자 방어 전략 5가지
* 🇰🇷 한국 투자자 시차 문제와 대응

**부속 데이터**: [`disclosure_timing_cases.csv`](https://github.com/gameworkerkim/vibe-investing/blob/main/AfterMarketClose/) — 34건 실제 공시 사례 + 주가 변동 데이터

### 8. 칼럼: DAT 기업의 mNAV 아비트리지 전략

[**📰 전체 칼럼 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/mNAV(Market-to-Net-Asset-Value)%20arbitrage/Dat%20mnav%20arbitrage%20strategy.MD)

> *"Strategy(MSTR)는 이상한 물건이다. 80억 달러의 빚을 내어 610억 달러의 비트코인을 샀다. 하지만 시장은 이를 1,520억 달러로 평가했다. 그렇다면 질문은 — 추가로 지불한 910억 달러는 무엇에 대한 값인가?"*
>
> — Jim Chanos, 2024년 12월 (MSTR 숏 포지션 공개 시)

비트코인·이더리움·솔라나를 기업 재무제표에 핵심 자산으로 보유하는 **DAT (Digital Asset Treasury) 기업들의 mNAV(Market-to-Net-Asset-Value) 비율 아비트리지 전략** 검증. Strategy (MSTR), BitMine (BMNR), SharpLink (SBET) 등 **15개 DAT 기업** 현황과 **Jim Chanos의 실제 페어 트레이드**를 재구성.

**핵심 발견**:

* 📈 MSTR 2020-2026 누적 수익률 **+2,950% vs BTC +940%** (초과 수익 +193%)
* ⚡ MSTR mNAV 범위: **0.7x (2022 저점) ~ 3.89x (2024-11 peak) → 1.20x (2026-04)**
* ⚠️ **BMNR sub-NAV 함정**: mNAV 1x 아래로 떨어진 뒤에도 추가 -50% 하락. ETH 직접 보유 대비 -43%p 언더퍼폼
* 🎯 **Spot BTC ETF 출시로 MSTR 희소성 프리미엄 구조적 소멸** 중

**다루는 내용**:

* 🏢 DAT 기업 15개 상세 (BTC 8개 + ETH 6개 + SOL 2개, 총 $84.1B 자산)
* 📊 5가지 트레이딩 전략 (Sub-NAV Long, Premium Peak Short, Pair Trade, Options, LLM 알림)
* 🚨 5가지 치명적 리스크 (숏 무한 손실, volatility decay, 주주 희석, death spiral, 지수 편출)
* 🇰🇷 한국 투자자를 위한 해외주식 공매도 · 외환거래법 고려사항

**부속 데이터 3종**:

* [`dat_companies_2026.csv`](https://github.com/gameworkerkim/vibe-investing/tree/main/mNAV(Market-to-Net-Asset-Value)%20arbitrage) — 15개 DAT 기업 현황
* [`dat_vs_benchmark_performance.csv`](https://github.com/gameworkerkim/vibe-investing/tree/main/mNAV(Market-to-Net-Asset-Value)%20arbitrage) — 2020-H2 ~ 2026-H1 반기별 수익률 (MSTR · MARA · BMNR · SBET · BTC · ETH · IBIT · ETHA · S&P500 · QQQ)
* [`mnav_cycles_arbitrage_signals.csv`](https://github.com/gameworkerkim/vibe-investing/tree/main/mNAV(Market-to-Net-Asset-Value)%20arbitrage) — mNAV 사이클 12개 포인트 + 매매 신호

### 9. 칼럼: 명품은 언제 사야 하는가

[**📰 전체 칼럼 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Luxury%20investment%20strategy/Luxury%20investment%20strategy.md)

> *"A Birkin bag is forever. An LVMH share is not."*
> *"버킨 백은 영원하다. LVMH 주식은 그렇지 않다."*

중국 경기 침체와 부동산 위기로 촉발된 **2024-2025 명품 섹터 역사적 조정** 실증 분석. LVMH · Hermès · Kering · Richemont · Ferrari 등 **세계 주요 명품 기업 13개**(기업 11 + ETF 2)의 2020-2026 전 구간 데이터 + **225건의 백테스트** + **저/중/고 위험 3단계 포트폴리오** 구성.

**핵심 발견**:

* 🥇 **2020-2026 누적 복리**: Ferrari +389%, Hermès +311%, Richemont +167%, LVMH +32%, **Kering -42%**
* 📉 **2024년 단년 수치**: Kering -39.4%, Burberry -30%, LVMH -13%, Moncler -7.8%
* 🔬 **3가지 전략 백테스트 (LVMH 단일 종목)**: DCA -10.87%, Buy-the-Dip -11.11%, 중국 쇼크 역발상 -7.96%
* 🎯 **교훈**: 단일 종목 집중은 실패. GLUX ETF 적립식이면 약 +30~40% 추정

**다루는 내용**:

* 🏛️ 명품 섹터의 새로운 3분류 (Ultra-luxury / Commercial / Affordable)
* 💶 **달러·유로 표시 자산 투자 3가지 방법** (원 종목, ADR, GLUX ETF)
* 📊 **Amundi S&P Global Luxury ETF (GLUX)** 심층 분석 (ISIN LU1681048630, TER 0.25%)
* 🎨 **저/중/고 위험 3단계 포트폴리오**
  + 🟢 저위험: GLUX 40% + Hermès 15% + Ferrari 10% + 글로벌 ETF 25% + 현금 10%
  + 🟡 중위험: GLUX 30% + LVMH 20% + Hermès 15% + Richemont 10% + Prada/Ferrari 10% + S&P 500 10% + 현금 5%
  + 🔴 고위험: LVMH 25% + Kering 20% + Burberry 15% + Estée Lauder 10% + LVMH 콜옵션 10% + Hermès 10% + 현금 10%
* 🇨🇳 **중국 수요 회복 시나리오** — Morningstar 2026 기본 case

**부속 데이터 4종**:

* [`luxury_companies_etfs_2026.csv`](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Luxury%20investment%20strategy) — 13개 투자 대상 상세
* [`luxury_performance_2020_2026.csv`](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Luxury%20investment%20strategy) — 13 반기별 수익률 (LVMH · Hermès · Kering · Richemont · Ferrari · Moncler · GLUX · S&P500 · MSCI China)
* [`luxury_backtest_3strategies.csv`](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Luxury%20investment%20strategy) — 225건 백테스트 상세 로그 (적립식 / Buy-the-Dip / 중국 쇼크 역발상)
* [`luxury_portfolio_by_risk.csv`](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Luxury%20investment%20strategy) — 19개 자산 할당안 (저/중/고 위험)

### 10. 칼럼: 가상화폐와 나스닥은 얼마나 동기화되고 있을까?

[**📰 전체 칼럼 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling/Nasdaq%20crypto%20coupling%20strategy.MD)

> *"비트코인이 나스닥을 따라가는가, 나스닥이 비트코인을 따라가는가?*
> *답은 — 때에 따라 다르다. 그리고 그 '때'를 아는 것이 전부다."*

2020-2026년 BTC-QQQ 30일 rolling correlation을 26개 분기로 세분화하고, **31개 주요 거시·업계 이벤트의 상관관계 영향**을 분석한 칼럼. *"BTC가 나스닥과 동조된다"*는 일반론을 **6개 regime으로 세분화**하여 각 regime별 트레이딩 전략을 실증으로 도출했습니다. **인트라데이 lag 측정 + 실시간 신호 생성 봇 Python 코드까지 End to End**로 제공합니다.

**핵심 발견**:

* 📊 **2020-2026 BTC-QQQ 30일 rolling correlation 평균 +0.335** (2014년 이전 평균은 거의 0)
* 📈 **2025년 평균 상관계수 0.52** — 2024년 0.23 대비 **2배**로 급등 (LSEG 데이터)
* 🔄 **Regime 급변**: 2026년 2월에 **-0.68 → +0.72**로 **2주 만에 swing**
* 🚨 **2026년 4월 현재 -0.20** — 10년 중 최저 상관관계 (**역사적 BTC 반등 시그널**)
* ⏱️ **Medium regime(+0.30~+0.60)에서 Nasdaq이 BTC를 15~60분 선행**
* ⚖️ **비대칭 커플링**: BTC는 *나스닥 상승은 무시, 하락은 따라간다*

**다루는 내용**:

* 📊 **BTC-나스닥 관계의 6년 진화** (2014-2019 무상관 → 2020-2021 커플링 탄생 → 2022 극단 → ETF 재편 → 2025-2026 진동)
* 🎯 **6가지 Regime별 트레이딩 전략**
  + 🟢 **NEGATIVE** (<-0.50, 15% 빈도): **90일 평균 +28.5% 상승** → STRONG\_LONG\_BTC (포지션 +15%)
  + 🟢 DECOUPLING (-0.10~-0.49, 15%): +15.2% → ACCUMULATE (+8%)
  + ⚪ LOW (-0.10~+0.30, 25%): NEUTRAL
  + 🟡 **MEDIUM** (+0.30~+0.60, **54% 가장 흔함**): +12.8% → **FOLLOW\_NASDAQ** (+10%, Nasdaq 15-60분 lag 이용)
  + 🟠 STRONG (+0.60~+0.80, 15%): **-5.2% (음수)** → RISK\_OFF (-5%)
  + 🔴 EXTREME (+0.80~+1.0, 5%): **-12.5% (음수)** → CRISIS\_MODE (-20%)
* 🕐 **4개 대표 인트라데이 세션 분석**
  + 2025-04-02 Liberation Day: lag 0분 (완벽 동조)
  + 2025-10-10 Flash Crash: 탈동조 (크립토 단독)
  + 2026-02-17 AI Selloff: Nasdaq 15분 선행
  + 2026-04-17 Max Divergence: 완전 탈동조
* 🤖 **547 lines Python 트레이딩 봇 전체 아키텍처** — Binance + Alpaca WebSocket 연동, Telegram/Slack 알림
* 🚨 **6가지 위험 고지** — 2주 만의 regime swing 위험 등

**부속 데이터 4종 + 트레이딩 봇**:

* [`btc_qqq_correlation_2020_2026.csv`](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling) — 26개 분기 상관계수
* [`btc_nasdaq_event_log.csv`](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling) — 31개 주요 거시·업계 이벤트 영향 로그
* [`intraday_coupling_samples.csv`](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling) — 4개 세션 인트라데이 (56 포인트)
* [`correlation_regimes_signals.csv`](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling) — 6개 regime 분류 + 매매 신호
* 🤖 [`nasdaq_btc_coupling_bot.py`](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling) — 547줄 트레이딩 봇 (아래 섹션 13 참고)

### 11. Harness Quant v2 — 시나리오 매트릭스 기반 AI 트레이딩 플랫폼

[**🛠️ 전체 문서 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quant%20v2%20readme%20.MD)

NASDAQ/S&P500 종목을 대상으로 **하네스 엔지니어링** (LLM이 도구를 호출하며 추론하는 agentic loop) 방식으로 분석하는 패키지. 어썸 큐레이션 과정에서 쌓인 노하우를 코드로 구현.

**6개 시나리오 매트릭스**:

| 번호 | 기간 | 방향 | 트리거 |
| --- | --- | --- | --- |
| 01 | 단기 (1d~4w) | LONG | 섹터 호전 + 종목 호평 |
| 02 | 중기 (1~3y) | LONG | 구조적 성장 (펀더멘털 + thesis) |
| 03 | 단기 | LONG/SHORT | 섹터 트렌드 이탈 (양/음 divergence) |
| 04 | 중기 | LONG/SHORT | 섹터 베이스라인 대비 구조적 알파/언더퍼폼 |
| 05 | 단기 | SHORT/AVOID | 급락 임박 시그널 (R1~R6 confluence) |
| 06 | 중기 | SHORT/AVOID | 구조적 쇠퇴 (D1~D7 confluence) |

**+ 부가 모듈**: Bull vs Bear 멀티 에이전트 토론, 백테스트 엔진, MCP 서버, 오케스트레이터, GitHub Actions 자동화.

### 12. Earnings Momentum Agent — 어닝 서프라이즈 특화 Top 30 추천

[**🛠️ 전체 문서 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quantv2/Earnings%20momentum%20agent%20readme%20.MD)

> *"어닝 서프라이즈는 주가를 올리지만, 어닝 쇼크는 다음날 갭 다운을 만든다."*

Harness Quant v2의 연장선상에서 만든 **특화 파이프라인**. 매월 첫 거래일에 NASDAQ + S&P500 약 700 종목을 스캔해 *저점 반등 + 매출·실적 성장 + 어닝 서프라이즈 + 시장 심리*를 종합한 **Top 30 추천**을 뽑아냅니다.

**7단계 파이프라인**:

```
1. Universe Scanner      시총 $5B+, 일거래대금 $50M+ 필터
2. Fundamental Filter    매출 YoY≥10%, QoQ≥0%, EPS 서프라이즈≥+5%, EPS YoY≥0%
3. Technical Filter      52주 저점 대비 +15% 반등, RSI 40~70, MACD bullish/neutral
4. Sentiment Engine      Haiku로 X/뉴스/Reddit에서 5가지 신호 추출
5. Analyst Consensus     Strong Buy/Buy/Hold/Sell 집계, 목표가 upside 계산
6. Multi-Agent Judge     Opus로 Bull/Bear/Risk/PM 4-agent 토론
7. Top 30 Report         JSON + CSV + Nvidia-forecast 스타일 HTML 대시보드
```

**산출물**:

* **Top 30 JSON** — 각 종목별 conviction 점수 1-10, 추천(STRONG\_BUY~STRONG\_SELL), 12개월 목표가, stop loss, Bull/Bear thesis, Risk scenario, PM verdict
* **CSV** — 엑셀·구글시트 열람용
* **HTML 대시보드** — 목표가 분포 바, Buy/Sell 분포 바, Bull vs Bear thesis 카드
* **24개월 백테스트 CSV** — 768 의사결정, 매월 리밸런싱, 각 액션에 3가지 이유 + forward 30일·90일 수익률

**24개월 백테스트 요약 (2024-04 ~ 2026-04)**:

| 지표 | 값 |
| --- | --- |
| 총 의사결정 | 768건 (BUY 108 / HOLD 582 / SELL 78) |
| 리밸런싱 횟수 | 23회 (월간) |
| BUY 시점 forward 30일 평균 수익률 | **+7.15%** |
| BUY 시점 forward 90일 평균 수익률 | **+14.97%** |
| 30일 hit rate | **83.3%** |
| 90일 hit rate | **68.5%** |

**핵심 장점** ✅:

* **저점 반등 + 펀더멘털의 이중 필터** — 단순 모멘텀이 아니라 "바닥을 다지고 실적으로 반등하는" 종목만 선별. 고점 대비 -30% 이내로 제한해 과열 종목 제외
* **agentic reasoning** — 하드코딩된 룰이 아니라 LLM이 `get_price_snapshot()`, `get_fundamentals()`, `get_sentiment()`, `get_analyst_view()` 같은 도구를 자율적으로 호출하며 추론
* **Bull vs Bear 대립 구조** — 한 모델이 편향된 결론을 내는 문제를 네 에이전트(Bull/Bear/Risk/PM) 토론으로 완화. 각 추천에 *반론*이 함께 기록되어 사후 검증 가능
* **설명 가능성** — 매 의사결정마다 3가지 구체적 이유가 기록됨
* **Nvidia-forecast 스타일 대시보드** — 한 화면에서 종합 확인
* **완전 오픈소스** — MIT 라이선스

**알려진 리스크 및 한계** ⚠️:

* **83.3% hit rate는 이상적 시나리오** — 실거래에서는 slippage, commission, 세금, 파이프라인 지연으로 실제 수익률 낮아짐
* **Ex-post bias 가능성** — Finnhub 과거 컨센서스는 정정분 반영 가능성
* **Sentiment 신호는 봇·조작 영향** — 저유동성 소형주일수록 신뢰도 낮음
* **시장 regime 의존성** — 2024-2026은 AI 랠리. 약세장·섹터 로테이션 국면 검증 미완
* **LLM 비용** — Opus 기준 월 $200~400
* **Overfitting 우려** — 필터 임계값 과거 데이터 기반
* **규제 리스크** — 한국 거주자 외환거래법 및 금감원 검토 필수

### 13. Nasdaq-BTC Coupling Bot — 실시간 상관관계 추적 트레이딩 신호 생성기

[**🛠️ 전체 문서 보기**](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling/)

> *"The question was never whether crypto and stocks move together.*
> *The question is — when, how fast, and in which direction?*
> *Those who know the regime, know the trade."*

위 **10번 칼럼 (나스닥-크립토 커플링)**의 분석을 **실시간 트레이딩 신호 생성 시스템으로 구현**한 Python 봇. Binance + Alpaca WebSocket 연동으로 **BTC·QQQ 실시간 가격 수집**, **30일 rolling correlation 계산**, **6개 regime 자동 분류**, **Telegram/Slack 알림**까지 엔드투엔드 파이프라인.

**핵심 아키텍처** (547 lines, 10 classes, 18 functions):

```
┌──────────────────────────────────────────────────────┐
│              CouplingBot (Orchestrator)              │
└───────────────┬──────────────────┬───────────────────┘
                │                  │
     ┌──────────▼────────┐  ┌──────▼──────────┐
     │  DataCollector    │  │ NotifDispatcher │
     │  (WebSocket 수집) │  │ (Telegram/Slack)│
     └──────────┬────────┘  └─────────────────┘
                │
     ┌──────────▼────────────┐
     │  CorrelationAnalyzer  │
     │  - 30일 rolling corr  │
     │  - Regime classifier  │
     │  - Cross-asset lag    │
     └──────────┬────────────┘
                │
     ┌──────────▼────────────┐
     │   SignalGenerator     │
     │  6 regimes → signals  │
     └──────────┬────────────┘
                │
                ▼
          TradingSignal (JSON)
```

**주요 클래스 10종**:

| 클래스 | 역할 |
| --- | --- |
| `Regime` (Enum) | 6개 regime 분류 (NEGATIVE ~ EXTREME) |
| `Signal` (Enum) | 7개 신호 종류 (STRONG\_LONG\_BTC ~ CRISIS\_MODE) |
| `MarketSnapshot` (dataclass) | 현 시점 시장 상태 (가격·수익률·상관·장 열림 여부) |
| `TradingSignal` (dataclass) | 봇이 출력하는 완전 명세 (포지션 사이즈, 손절, 목표, reasoning) |
| `CorrelationAnalyzer` | 30일 rolling correlation + regime 분류 + cross-correlation lag 측정 |
| `SignalGenerator` | regime + 인트라데이 움직임 → 트레이딩 신호 생성 |
| `DataCollector` | Binance (ccxt) + Alpaca + yfinance 통합 데이터 수집 |
| `NotificationDispatcher` | Telegram / Slack / 이메일 푸시 |
| `CouplingBot` | 메인 오케스트레이터 (무한 루프 + regime 변화 감지 알림) |
| `Backtester` | 과거 데이터 검증 프레임워크 |

**Regime별 파라미터** (SignalGenerator 내장):

| Regime | Signal | Position | Stop Loss | Target | 신뢰도 |
| --- | --- | --- | --- | --- | --- |
| 🟢 NEGATIVE | STRONG\_LONG\_BTC | **+15%** | -15% | **+25%** | 85% |
| 🟢 DECOUPLING | ACCUMULATE\_BTC | +8% | -10% | +15% | 65% |
| ⚪ LOW | NEUTRAL | 0% | — | — | 40% |
| 🟡 **MEDIUM** | **FOLLOW\_NASDAQ** | +10% | -8% | +12% | 70% |
| 🟠 STRONG | RISK\_OFF | **-5%** | -5% | +5% | 75% |
| 🔴 EXTREME | CRISIS\_MODE | **-20%** | -3% | +3% | 90% |

**실행 모드 4종**:

```
# 환경 변수 설정
export BINANCE_API_KEY=xxx
export ALPACA_API_KEY=xxx
export TELEGRAM_BOT_TOKEN=xxx
export TELEGRAM_CHAT_ID=xxx

# 1회 체크 (현 상태 즉시 확인)
python nasdaq_btc_coupling_bot.py --mode once

# 페이퍼 트레이딩 (신호만 생성, 실거래 없음)
python nasdaq_btc_coupling_bot.py --mode paper --interval 300

# 백테스트 (과거 데이터 검증)
python nasdaq_btc_coupling_bot.py --mode backtest

# 실시간 라이브 (주의: 실제 신호 생성)
python nasdaq_btc_coupling_bot.py --mode live --interval 60
```

**출력 예시** (2026-04-17 현재 상황 기준):

```
🟢🚀 나스닥-BTC 커플링 봇
── 시간: 2026-04-17 14:30 UTC
── 신호: STRONG_LONG_BTC
── Regime: Negative (-0.50~-1.0)
── 상관계수 (30일): -0.200
── 신뢰도: 85%
── 리스크: HIGH

📋 권장 조치: 상관계수 -0.20. BTC 분할 매수 시작
              (3회 분할, 종목당 5% 자본)

💰 포지션 사이즈: +15.0%
🛑 손절: -15.0%
🎯 익절: +25.0%

🧠 근거:
   1. BTC-NDX 상관계수 < -0.5 (역사적 저점)
   2. 과거 4회 동일 regime에서 90일 평균 +28% 반등
   3. 2021-Q3, 2023-Q3, 2024-Q3, 2025-Q4 모두 BTC 바닥 형성

⚠️ 본 신호는 교육/연구 목적. 투자 결정은 본인 책임
```

**핵심 장점** ✅:

* **Regime 기반 자동 전환** — 2주 만에 -0.68 → +0.72 swing (2026-02)과 같은 급변에 자동 대응
* **Cross-correlation lag 측정** — Medium regime에서 Nasdaq이 BTC를 15~60분 선행하는 패턴을 실시간 추출
* **비대칭 커플링 반영** — BTC는 나스닥 상승은 무시, 하락은 동조. 이 비대칭이 SignalGenerator 파라미터에 반영됨
* **장외 시간 보정** — 미국 장 마감 시 신뢰도 -30% 자동 적용
* **Backtester 프레임워크 포함** — 과거 데이터 검증 가능 (실제 구현은 yfinance + ccxt로 확장)
* **완전 오픈소스** — MIT 라이선스

**알려진 리스크 및 한계** ⚠️:

* **상관관계는 과거 통계** — 미래 보장 아님. 2021년 유효 패턴이 2026년에 작동하지 않을 수 있음
* **Regime 전환 지연** — 30일 window는 급변 시 반응 느림. 일부 시나리오에서 14일 window 병행 권장
* **Flash crash 취약** — 2025-10-10 같은 크립토 단독 폭락은 커플링 모델로 예측 불가
* **유동성 가정** — 대형 포지션 진입 시 slippage가 시뮬레이션 대비 훨씬 큼
* **API 안정성 의존** — Binance/Alpaca 장애 시 봇 기능 정지
* **규제 리스크** — 한국 거주자 자동매매는 외환거래법·자본시장법 검토 필수

**향후 확장 로드맵** (v2 계획):

1. **ETH, SOL 포함** — 알트코인은 BTC와 +0.85~0.95 상관. 시그널 확장 가능
2. **MCP 통합** — Claude Opus가 뉴스·SEC 공시·소셜로 신호 검증
3. **Walk-forward 백테스트** — 각 regime별 hit rate 측정
4. **Kelly Criterion** — 포지션 사이즈 자동 최적화
5. **Regime transition 선제 감지** — 상관관계 급변 시 사전 경고
6. **Multi-timeframe** — 1분·5분·1시간·1일 동시 모니터링
7. **Options integration** — BTC 풋·콜 옵션 헤지 자동화

---

## 왜 이 레포가 필요한가요?

AI 트레이딩 분야는 **월 단위로 새 레포가 쏟아져 나옵니다.**

* virattt/ai-hedge-fund가 55,800 stars를 넘었고
* ElizaOS는 17,600+ stars로 크립토 AI 에이전트의 표준이 됐고
* TradingAgents, FinRobot, AgenticTrading 같은 프레임워크가 매월 메이저 업데이트
* Claude Opus 4.7, GPT-5.4, Gemini 3.x 등 frontier LLM이 끊임없이 진화
* MCP 같은 새 표준이 등장하면서 인프라 지형도 매주 바뀜
* **Nof1 Alpha Arena는 GPT-5 -75%, DeepSeek +46%로 우리의 직관을 흔듭니다**

문제는 — **어떤 것이 실제로 쓸만한지, 어떤 것이 README만 화려한지** 판단하기 어렵다는 점입니다. 별 수가 곧 품질도 아니고, 학술 논문 기반이라고 실전에서 작동하는 것도 아니며, 백테스트 결과는 종종 cherry-picked입니다.

**그리고 도구 큐레이션과 별개로, 전략 자체에 대한 큐레이션도 필요합니다.** 모든 퀀트 도구는 결국 *어떤 팩터를 어떤 이론적 기반 위에서 돌리느냐*의 변형입니다. **Awesome Claude Quant Scripts**는 그 학술적 토대(Graham, Fama-French, Jegadeesh-Titman, Novy-Marx, AQR, López de Prado…)를 Claude가 즉시 활용 가능한 프롬프트 형태로 정리해, *도구 선택 → 전략 설계 → 코드 생성*의 사이클을 압축합니다.

**또한 AI만이 답은 아닙니다.** 전통적 시장 구조 분석 — 공시 타이밍·DAT 기업의 mNAV 아비트리지·명품 섹터 양극화 — 역시 AI로 증폭된 분석 능력을 통해 새롭게 이해할 수 있는 영역입니다.

이 레포는 그 혼란을 정리하기 위한 **개인 큐레이션의 공개판**입니다. 동시에:

* 큐레이션 과정에서 배운 패턴을 **직접 구현체로** 만들어 함께 공개합니다
* 시장의 거시 흐름과 산업 변화를 **칼럼으로 분석**합니다
* **실증 데이터와 백테스트**를 CSV로 함께 공개해 독자가 직접 검증 가능합니다
* 모든 콘텐츠를 **MIT 라이선스**로 자유롭게 활용 가능하게 공개합니다

---

## 어디서 시작하면 되나요?

### 처음 오신 분

본인 관심 영역에 맞춰 어썸 리스트를 골라 보세요:

* **주식 투자 도구**: [Awesome Vibe Invest — Stocks](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD)의 *"추천 시작 경로"* 섹션
* **크립토 트레이딩 도구**: [Awesome Vibe Invest — Crypto](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest%20crypto.MD)의 *"🎯 추천 시작 경로"* 섹션
* **퀀트 전략 자체** 🆕: [Awesome Claude Quant Scripts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD) — 8대 퀀트 전략 분류와 학계 원전부터 시작. Claude로 백테스트 코드를 즉시 생성하고 싶다면 여기가 출발점

### AI 시대의 시장 통찰을 얻고 싶은 분

칼럼을 읽으세요 (권장 순서):

* 🛡️ **리스크 관리에 대한 통찰**: [LTCM 사례 칼럼](https://github.com/gameworkerkim/vibe-investing/blob/main/Vibe%20Investing%20Risk%20Management.MD) — 가장 먼저
* 🏢 **산업 변화에 대한 통찰**: [Microsoft Fintool 인수 칼럼](https://github.com/gameworkerkim/vibe-investing/blob/main/Microsoft%20fintool%20acquisition%20column.MD)
* 🕵️ **시장 구조의 어두운 면에 대한 통찰**: [가상화폐 선물 pump-dump 패턴 분석](https://github.com/gameworkerkim/vibe-investing/blob/main/Crypto%20perp%20manipulation%20column.MD)
* 🌙 **공시 타이밍의 구조적 비대칭**: [시장은 닫혔을 때 열리는가](https://github.com/gameworkerkim/vibe-investing/blob/main/AfterMarketClose/After_Market_Close_Column.md)
* 🏦 **크립토-주식 교차 영역 아비트리지**: [DAT mNAV 아비트리지 전략](https://github.com/gameworkerkim/vibe-investing/blob/main/mNAV(Market-to-Net-Asset-Value)%20arbitrage/Dat%20mnav%20arbitrage%20strategy.MD)
* 👜 **전통 섹터에서의 역발상 기회**: [명품 투자 전략](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Luxury%20investment%20strategy/Luxury%20investment%20strategy.md)
* 🔗 **크립토-주식 커플링의 실증 데이터**: [나스닥-크립토 커플링 전략](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling/Nasdaq%20crypto%20coupling%20strategy.MD)

### 바로 코드를 보고 싶은 분

세 가지 선택지가 있습니다:

* **시나리오 매트릭스 방식**: [Harness Quant v2](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quant%20v2%20readme%20.MD)의 *"사용 예시"* 섹션 — 6개 시나리오 중 관심 있는 것부터 실행
* **어닝 모멘텀 특화**: [Earnings Momentum Agent](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quantv2/Earnings%20momentum%20agent%20readme%20.MD)의 *"빠른 시작"* 섹션 — 7단계 파이프라인을 orchestrator로 한 번에 실행
* **크립토-주식 실시간 신호**: [Nasdaq-BTC Coupling Bot](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling) — `python nasdaq_btc_coupling_bot.py --mode once`로 현재 regime 즉시 확인

### Claude로 직접 퀀트 전략을 짜보고 싶은 분 🆕

[**Awesome Claude Quant Scripts**](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD)의 8대 전략 중 본인 스타일에 맞는 것을 골라, 해당 섹션의 **Claude Prompt Template**을 그대로 복사해 Claude.ai 또는 API에 붙여 넣으세요. 학계 원전 + 룩어헤드 방지 주석이 자동으로 반영된 백테스트 코드가 생성됩니다.

* **저평가 종목 발굴**: Value (PER, PBR, EV/EBITDA 합성)
* **이익 성장 + 가격 균형**: Growth (PEG < 1.5 + 매출 성장률)
* **약세장 방어형 우량주**: Quality (ROE + GP/Assets + 낮은 D/E)
* **추세 종목 추적**: Momentum (12M-1M, J=K=6 변형)
* **단일 팩터 부진 회피**: Multi-Factor (Value × Momentum × Quality × Low Vol)
* **다자산 트렌드 추종**: Trend Following (Donchian breakout)
* **시장 중립 헤지**: Statistical Arbitrage (공적분 페어 트레이딩)
* **비정형 데이터 활용**: ML-based (LightGBM 또는 FinBERT 감성 알파)

추가로 **범용 프롬프트 5종 (T1~T5)** — Strategy Stress-Test, Paper→Code, Risk Overlay, Crypto 이식, Live Paper Trading 전환 — 이 모든 전략에 공통으로 적용 가능합니다.

### 데이터를 직접 분석하고 싶은 분

14개 이상의 CSV 데이터셋을 공개합니다. Python pandas로 즉시 분석 가능:

* **공시 타이밍**: `disclosure_timing_cases.csv` (34건 실제 공시 + 수익률)
* **DAT 기업**: `dat_companies_2026.csv`, `dat_vs_benchmark_performance.csv`, `mnav_cycles_arbitrage_signals.csv`
* **명품 섹터**: `luxury_companies_etfs_2026.csv`, `luxury_performance_2020_2026.csv`, `luxury_backtest_3strategies.csv` (225건), `luxury_portfolio_by_risk.csv`
* **나스닥-크립토 커플링**: `btc_qqq_correlation_2020_2026.csv` (26 분기), `btc_nasdaq_event_log.csv` (31 이벤트), `intraday_coupling_samples.csv` (56 포인트), `correlation_regimes_signals.csv` (6 regime)
* **어닝 모멘텀**: `backtest_log_24months.csv` (768건 의사결정)

### 본인 자금으로 자동매매 하려는 분

**반드시** 다음 함정 섹션들을 먼저 읽으세요:

* 주식: [Awesome Vibe Invest — 공통 함정 12가지](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD#12-%EA%B3%B5%ED%86%B5-%ED%95%A8%EC%A0%95-common-pitfalls)
* 크립토: [Awesome Vibe Invest Crypto — 공통 함정 8가지](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest%20crypto.MD#9-%EA%B3%B5%ED%86%B5-%ED%95%A8%EC%A0%95-crypto-%ED%8A%B9%ED%99%94)
* **퀀트 전략 자체의 백테스트 함정** 🆕: [Awesome Claude Quant Scripts — Disclaimer 섹션](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD#%EF%B8%8F-disclaimer) — 룩어헤드·생존편향·과적합·LLM 환각 점검 체크리스트
* 선물 시장 구조 리스크: [보이지 않는 손 칼럼의 VTCLR 정의와 투자자 결론](https://github.com/gameworkerkim/vibe-investing/blob/main/Crypto%20perp%20manipulation%20column.MD)
* 어닝 모멘텀 전략의 한계: [Earnings Momentum Agent의 "알려진 리스크 및 한계"](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quantv2/Earnings%20momentum%20agent%20readme%20.MD)
* **공매도·곱버스·레버리지 위험**: [DAT mNAV 아비트리지 — 핵심 위험 고지 5가지](https://github.com/gameworkerkim/vibe-investing/blob/main/mNAV(Market-to-Net-Asset-Value)%20arbitrage/Dat%20mnav%20arbitrage%20strategy.MD)
* **섹터 집중 투자 위험**: [명품 투자 전략 — 고위험 포트폴리오 경고](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Luxury%20investment%20strategy/Luxury%20investment%20strategy.md)
* **상관관계 regime swing 위험**: [나스닥-크립토 커플링 — 6가지 위험 고지](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling/Nasdaq%20crypto%20coupling%20strategy.MD) — 2주 만의 상관계수 -0.68→+0.72 swing 같은 급변 대응 필수

이 단계를 건너뛴 사람들이 가장 많이 잃습니다.

---

## 로드맵

### 완료

* Awesome Vibe Invest v1 (주식, 30+ 레포)
* Awesome Vibe Invest — Crypto Edition (크립토 + 벤치마크 중심)
* **Awesome Claude Quant Scripts** — 8대 퀀트 전략 + 학계 원전 30+편 + Claude 프롬프트 템플릿 🆕
* Harness Quant v2 (6 시나리오 + 백테스트 + MCP + 토론)
* LTCM 칼럼 (리스크 관리)
* Microsoft Fintool 인수 칼럼
* 가상화폐 선물 pump-dump 수학적 검토 칼럼
* Earnings Momentum Agent — 24개월 백테스트 hit rate 83.3%
* 시장은 닫혔을 때 열리는가 — 34건 AMC 공시 실증 분석
* DAT mNAV 아비트리지 — 15개 DAT 기업 + Chanos 페어 트레이드 복기
* 명품 투자 전략 — LVMH/Hermès/Kering + 3단계 포트폴리오
* 가상화폐와 나스닥은 얼마나 동기화되고 있을까? — 2020-2026 BTC-QQQ 상관관계 + 6 regime 분류 + 인트라데이 lag 분석
* Nasdaq-BTC Coupling Bot — 547줄 Python 트레이딩 신호 생성기 (Binance + Alpaca + Telegram 통합)

### 진행 중 / 예정

* **Awesome Claude Quant Scripts 영문판** 🆕 — international reach 확대
* **Awesome Claude Quant Scripts v2** 🆕 — KR equity·Crypto-native·FX 도메인별 sub-curation 추가
* **영문 번역판** — Awesome 시리즈 + 칼럼 전체
* **한국 주식(KOSPI/KOSDAQ) 시나리오** — pyKRX + 한국투자증권 OpenAPI 연동
* **Anthropic의 finance agent 전략 칼럼**
* **한국 자산운용업의 1년 안 5가지 변화 칼럼**
* **온체인 자산 통합** — DeFi/스테이블코인/예측시장 신호
* **Awesome Vibe Invest — 한국 시장 Edition** (KOSPI/KOSDAQ 특화)
* **월간 인사이트 리포트** — 주요 시그널 백테스트 hit-rate 공개
* **VTCLR 패턴 탐지 오픈소스 도구** — 벤포드 법칙 + 지갑 클러스터링 기반 Python 패키지
* **Earnings Momentum Agent v2** — walk-forward validation + regime-aware 필터 + 2022년 금리상승기 백테스트
* **DAT mNAV Watcher** — Claude + MCP 기반 실시간 mNAV 모니터링 오픈소스
* **명품 섹터 regime detector** — 중국 소비심리 + 부동산 지표 → 명품 매수·매도 신호
* **Coupling Bot v2** — ETH/SOL 확장, Kelly Criterion 포지션 사이즈, Multi-timeframe (1분·5분·1시간), walk-forward 백테스트
* **Coupling Bot Docker/AWS 배포 가이드** — 24시간 무인 운영 환경 구성

---

## 콘텐츠 통계

```
어썸 큐레이션:    3개 (총 50+ 도구 평가 + 8대 전략 + 30+편 학계 원전)  ← 🆕 1개 추가
칼럼:             7개 (총 70,000+ 단어)
직접 개발 도구:   3개 (Harness Quant v2 + Earnings Momentum Agent + Nasdaq-BTC Coupling Bot)
                   → 총 23개 시나리오·파이프라인·regime 단계
백테스트 로그:    24개월 × 월간 리밸런싱 = 768 의사결정
                   + 26 분기 상관관계 추적 (커플링 봇)
공개 데이터셋:    14+ CSV (총 1,400+ 데이터 포인트)
                  - 공시 타이밍 34건
                  - DAT 기업 15개 + 반기별 수익률 12기간 + mNAV 사이클 12포인트
                  - 명품 기업 13개 + 반기별 수익률 13기간 + 백테스트 225건 + 포트폴리오 19할당
                  - 나스닥-크립토 커플링 26분기 + 31 이벤트 + 56 인트라데이 포인트 + 6 regime
                  - Earnings Momentum 768건
오픈소스 Python:  Nasdaq-BTC Coupling Bot 547 lines (10 classes, 18 functions)
프롬프트 템플릿:  Awesome Claude Quant Scripts 13개 (전략별 8개 + 범용 T1~T5)  ← 🆕
검증된 출처:      125+ 학술 페이퍼·공식 문서·산업 보고서  ← 🆕 (퀀트 30+편 추가)
지원 언어:        한국어 (영문 요약 포함)
```

---

## 기여하기 (Contributing)

다음 모두 환영합니다:

* ⭐ **별 누르기** — 가장 큰 응원
* 🐛 **누락된 좋은 레포 제보** — 이슈 또는 PR
* 💬 **평가에 대한 반박** — 토론은 큐레이션 품질을 높입니다
* 🌍 **영문 번역** — international contribution
* 🇰🇷 **한국 시장 자원 추천** — DART, ECOS, NICE 등 활용 사례
* 📊 **본인 백테스트 결과 공유** — Harness Quant 또는 Earnings Momentum Agent의 walk-forward 결과
* 📰 **칼럼 주제 제안** — 다음에 다뤘으면 하는 시장 이슈
* 🔢 **CSV 데이터 확장** — 공시 타이밍·DAT·명품 데이터셋에 추가 케이스 기여
* 📚 **퀀트 전략 추가** 🆕 — Awesome Claude Quant Scripts에 새 팩터/논문/Claude 프롬프트 제안

이슈 또는 PR로 부담 없이 알려주세요. **반대 의견도 환영합니다** — *"이 평가는 틀렸다"* 는 피드백이 가장 가치 있습니다.

---

## Disclaimer

이 레포의 모든 콘텐츠는 **연구·교육 목적**입니다.

* **어떤 도구도 수익을 보장하지 않습니다** — Alpha Arena의 GPT-5 -75%가 실제 데이터이며, Earnings Momentum Agent의 83.3% hit rate는 백테스트 상의 이상적 시나리오입니다
* 모든 평가는 작성 시점의 공개 정보 기반 주관적 평가입니다
* 실전 자본 운용 전 반드시 자체 백테스트, 페이퍼 트레이딩, 법률 검토를 거치세요
* **Claude를 포함한 LLM이 생성한 코드에는 사실 오류·구조적 편향·보안 취약점이 포함될 수 있습니다.** Awesome Claude Quant Scripts의 모든 프롬프트와 코드 골격은 사용자가 직접 검증할 능력이 없다면 다른 LLM으로 교차 검증해 환각을 필터링해야 합니다 🆕
* 미국 SEC/CFTC, 한국 금감원, EU MiCA 모두 AI 기반 자동 트레이딩에 규제 적용 가능 — 본인 자산 운용은 OK, 타인 자금 운용은 라이선스 필요
* MEV bot의 sandwich attack 같은 일부 전략은 윤리적 회색지대 + 일부 관할권에서 시장 조작으로 해석 가능
* 시장 구조 분석 칼럼(예: 가상화폐 선물 pump-dump, AMC 공시 타이밍, DAT mNAV 아비트리지)은 **특정 주체를 지목하지 않는 통계적·학술적 논평**이며, 개별 사건의 법적 성격 규명은 관할 수사·규제 기관의 몫입니다
* 어닝 서프라이즈 기반 전략은 **시장 regime 의존적**입니다. 2024-2026 AI 랠리에서 검증된 결과가 다른 regime(예: 약세장, 섹터 로테이션)에서도 동일하게 작동한다는 보장은 없습니다
* **하락 베팅·공매도·곱버스 ETF·레버리지 투자는 개인에게 치명적일 수 있습니다.** DAT mNAV 아비트리지 칼럼의 5가지 위험 고지, 명품 투자 전략의 3단계 위험 경고를 반드시 참조하세요. 하락 베팅 전략은 포트폴리오 5~10% 이내로 엄격 제한하십시오
* 투자 결과 + 법적 리스크에 대한 책임은 사용자에게 있습니다

---

## About

**김호광 (Dennis Kim)**
Cyworld CEO · 개발자 · Web3 Investor
Web3, 블록체인, AI 트레이딩 영역에서 활동하고 있습니다.

* 📧 [gameworker@gmail.com](mailto:gameworker@gmail.com)
* 🔗 [GitHub @gameworkerkim](https://github.com/gameworkerkim)

이 레포는 AI를 활용한 창업가로서의 얻은 인사이트를 바탕으로 만들어졌습니다.

---

## 라이선스

MIT License — 자유롭게 사용·수정·배포 가능합니다. 출처 표기만 부탁드립니다.

칼럼은 인용·재배포 시 *"김호광 (Dennis Kim) / vibe-investing 레포"* 출처 명기를 부탁드립니다.

---

***"Models always point to truth. Fingers always point to greed."***  
*"모델은 언제나 진실을 가리킨다. 손가락은 언제나 탐욕을 가리킨다."*  
  
***"Model intelligence is not trading intelligence."***  
*"모델의 지능이 곧 트레이딩 지능은 아니다."*  
— Alpha Arena Season 1 lesson  
  
***"Benford's law cannot lie. On-chain data lasts forever."***  
*"벤포드 법칙은 거짓말을 못 한다. 온체인 데이터는 영원히 남는다."*  
  
***"Earnings surprises lift the stock,  
earnings shocks create the next morning's gap down."***  
*"어닝 서프라이즈는 주가를 올리지만,  
어닝 쇼크는 다음날 갭 다운을 만든다."*  
  
***"The market closes, but information opens.  
The question is — who reads it first?"***  
*"시장은 닫히고, 정보는 열린다. 문제는 — 누가 먼저 읽는가이다."*  
— After Market Close 칼럼  
  
***"Trade the premium, not the faith."***  
*"믿음이 아니라 프리미엄을 거래하라."*  
— DAT mNAV 아비트리지 칼럼  
  
***"A Birkin bag is forever. An LVMH share is not.  
Don't confuse the brand's immortality with your portfolio's fate."***  
*"버킨 백은 영원하다. LVMH 주식은 그렇지 않다.  
브랜드의 영속성과 당신 포트폴리오의 운명을 혼동하지 말라."*  
— 명품 투자 전략 칼럼  
  
***"The question was never whether crypto and stocks move together.  
The question is — when, how fast, and in which direction?  
Those who know the regime, know the trade."***  
*"크립토와 주식이 함께 움직이는가는 질문이 아니다.  
언제, 얼마나 빠르게, 어느 방향으로인가가 질문이다.  
Regime을 아는 자가 거래를 안다."*  
— 나스닥-크립토 커플링 칼럼  
  
***"Theory without code is philosophy. Code without theory is gambling.  
Claude collapses the gap — but never replaces verification."***  
*"이론 없는 코드는 도박이고, 코드 없는 이론은 철학이다.  
Claude는 그 간극을 압축하지만, 결코 검증을 대체하지 않는다."*  
— Awesome Claude Quant Scripts

⭐ **이 레포가 도움이 되셨다면 별 하나로 응원해주세요.** ⭐  
매주 1-2회 갱신을 약속드립니다.
