# AMQS-AI-Infra: Adaptive Momentum Quant Strategy for AI Infrastructure

> [vibe-investing/AMQS](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)) 와 [AMQS-M7](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20M7) 의 **AI 인프라 특화 확장판**. 원본의 *4-Factor Momentum Composite*, *단기 하락 매수 모멘텀(Pullback-in-Uptrend)*, *거시 레짐 필터*, *-12% 손절*, *주간 리밸런싱* 을 계승하고, M7 에서 빠졌던 **Top-N 선별을 복원**하되 **서브테마 분산 캡**으로 GPU 과집중을 막는다.

> **[2026.07.20 정식 퀀트 리포트](data/AMQS_AI_Infra_Quant_Report_20260720.md) 발행.** AI 인프라 18종 중 4종만 선별. 5종 EXIT, 5종 EXCLUDED. 전체 점수표 및 Dimension Breakdown 수록.

### 투자 철학 / 컨셉

이 전략은 **파괴적 혁신과 그 모멘텀에 투자**한다. 투자는 과감하되 한 바구니에 몰지 않아야 하고
(2000년 닷컴 버블의 교훈), 무엇보다 *자신만의 투자 철학*이 있어야 작전·소음에 휘둘리지 않는다.

AMQS-AI-Infra의 철학은 명확하다 — 인공지능과 그 인프라가 **메인스트림(엔비디아)에서 주변 혁신
기업(메모리·스토리지·서버·네트워킹·전력 등)으로 테마가 확산되며 상승**한다는 가정 아래, 그
**모멘텀이 이동하는 순간을 규칙으로 포착**한다. 잘 달리는 종목에 올라타되, 잠깐 넘어졌을 때
(단기 하락) 더 싸게 담고, 거시 날씨가 나빠지면 규칙에 따라 현금으로 피한다. 감정이 아니라 점수와
규칙이 사고팔기를 결정하며, 한 서브테마(예: GPU)에 쏠리지 않도록 분산한다.

> 다만 본 전략은 인공지능·인공지능 인프라 주식의 테마 이동·상승을 가정한 **고위험 퀀트**다.
> 변동성이 극심할 수 있고 **원금 손실 가능성**이 있으며, 모든 수치는 강세장 표본 기준의 참고용이다.
> 쉬운 풀이는 [`AMQS_AI_Infra_Idea_Note.md`](AMQS_AI_Infra_Idea_Note.md) ·
> [PDF](AMQS_AI_Infra_Idea_Note.pdf) 참고.

![python](https://img.shields.io/badge/python-3.9%2B-blue)
![data](https://img.shields.io/badge/data-yfinance-orange)
![license](https://img.shields.io/badge/license-MIT-lightgrey)

**Universe (AI 데이터센터 밸류체인, ~19종)**

| 서브테마 | 종목 |
|---|---|
| 연산 / GPU / 가속기 | NVDA · AMD · **INTC** · AVGO · MRVL · TSM |
| 메모리 / 스토리지 | MU · STX · WDC · PSTG |
| 서버 / 시스템 | **DELL** · SMCI · HPE |
| 네트워킹 | ANET · CSCO |
| 데이터 / 소프트웨어 | **SNOW** · ORCL · PLTR |
| 전력 / 냉각 | VRT |

> 사용자 요청(최근 급등한 인텔·AMD·스토리지 기업·델·스노우플레이크)을 반영하고, AI 데이터센터 구축에 직접 노출된 핵심 종목으로 universe 를 구성했다. 굵게 표시한 종목이 명시 요청 종목.

---

## 원본 AMQS / M7 과의 관계

| 측면 | AMQS (원본) | AMQS-M7 | **AMQS-AI-Infra (본 확장)** |
|---|---|---|---|
| Universe | NASDAQ-100 + AI Value Chain ~150종 | M7 7종 | **AI 인프라 ~19종** |
| 선별 방식 | Top 10 모멘텀 | 7종 전체 tilt | **Top 10 + 서브테마당 최대 4종 (NEW)** |
| 4-Factor Composite | 12-1/6-1/3-1/Vol | 동일 | **동일** |
| 100점 채점 | 4차원 (40/30/20/10) | 5차원 (35/15/25/15/10) | **5차원 동일** |
| 단기 하락 매수 | — | 15% | **15% 계승** |
| 거시 레짐 필터 | QQQ 200MA · VIX | 동일 | **동일** |
| 손절 / 리밸런싱 | -12% / 주간 | 동일 | **동일** |
| 벤치마크 | QQQ / SOXX | QQQ / SOXX / AI반도체 | **QQQ / SMH / SOXX / AI-Infra 동가중** |

### 본 확장의 핵심: 서브테마 분산 캡

AI 인프라는 GPU(NVDA/AMD)·메모리(MU)·서버(DELL/SMCI) 등 *상관 높은 서브섹터*로 묶인다. 순수 모멘텀 Top-N 은 강세장에서 GPU 한 바구니에 쏠리기 쉽다. 그래서 선별 단계에 **서브테마당 최대 4종** 캡을 둬, 한 테마 충격(예: 메모리 다운사이클, 특정 GPU 재고조정)이 포트폴리오 전체를 무너뜨리지 않도록 했다.

---

## 프로젝트 구조

```
AMQS_AI_Infra/
├── readme.md
├── requirements.txt
├── AMQS_AI_Infra_Idea_Note.md    # 전략 개념 쉬운 설명
├── AMQS_AI_Infra_Idea_Note.pdf
├── script/
│   ├── strategy.py               # 4-Factor + 5차원 채점 + Top-N 선별 + 서브테마 캡 + 레짐 + 사전필터
│   ├── amqs_ai_infra.py          # CLI 트래커 + 알림 + 손절 추적
│   ├── backtest.py               # 백테스트 (vs QQQ/SMH/SOXX/AI-Infra 동가중)
│   └── broker.py                 # Phase 1 CLI / Phase 2 KIS API 자리표시
├── prompts/
│   ├── AMQS_AI_Infra_kr.MD       # 한국어 LLM 프롬프트 (2026.07.20 재구성판)
│   └── AMQS_AI_Infra_EN.MD       # English (토큰 ~30% 절감)
├── Signal_Bot/                   # 매수 시그널 봇 + 웹뷰 대시보드
└── data/
    ├── amqs_ai_infra_log.csv     # 라이브 트래커 스냅샷 로그
    ├── amqs_ai_infra_state.json  # 포트폴리오 상태 (진입가 추적)
    ├── AMQS_AI_Infra_20260720_Signals.md        # 7월 20일 실시간 시그널 분석
    ├── AMQS_AI_Infra_Quant_Report_20260720.md   # 7월 20일 정식 퀀트 리포트
    ├── backtest_summary.csv       # 전략별 요약 통계
    ├── backtest_equity.csv        # 일별 equity curve
    ├── backtest_positions.csv     # 주별 비중 + 레짐
    ├── backtest_trades.csv        # 진입/청산/손절 로그
    └── backtest_regimes.csv       # 레짐 전환 이력
```

### 최신 리포트

| 파일 | 설명 |
|------|------|
| [`AMQS_AI_Infra_Quant_Report_20260720.md`](data/AMQS_AI_Infra_Quant_Report_20260720.md) | 7월 20일 정식 퀀트 리포트. Executive Summary + 18종 Full Scorecard + Dimension Breakdown + Risk Alerts |
| [`AMQS_AI_Infra_20260720_Signals.md`](data/AMQS_AI_Infra_20260720_Signals.md) | 7월 20일 실시간 시그널 분석. 매수/매도/중립 요약 + 6월 대비 변화 |

---

## 매수 시그널 봇 / Signal Bot

전략 엔진으로 **매수 시그널**을 산출해 간단한 웹뷰 대시보드로 보여주는 봇. Top-N 매수 후보,
단기 하락 매수(DIP) 알림, 거시 레짐, 전체 점수표를 한 화면에 띄우고 **하단에 리스크 고지**를 둔다.
전체 안내는 [`Signal_Bot/README.md`](Signal_Bot/README.md).

```bash
cd Signal_Bot
python signal_bot.py --period 2y --outdir .   # signals.json / signals.js 생성
python -m http.server 8011                     # http://localhost:8011/ 접속
```

![매수 시그널 대시보드](Signal_Bot/assets/dashboard_top.png)

---

## 설치 & 사용

```bash
pip install -r requirements.txt

# 현재 시점 스냅샷 (점수·신호·Top-10 비중)
python -m script.amqs_ai_infra --mode track --csv data/amqs_ai_infra_log.csv

# 워치 모드 (주기 폴링)
python -m script.amqs_ai_infra --mode track --watch --interval 30

# 백테스트
python -m script.amqs_ai_infra --mode backtest --start 2024-01-02 --end 2026-05-30
# 또는
python -m script.backtest --start 2024-01-02 --end 2026-05-30
```

LLM 프롬프트는 `prompts/` 의 한/영문판을 복사해 Claude/GPT 등에 붙여넣으면 된다.

---

## 백테스트 결과 (2024-01-02 ~ 2026-05-30)

주간 리밸런싱 · -12% 손절 · 거래비용 5bps + 슬리피지 10bps · Top-10 선별.

| 전략 | 총수익률 | CAGR | 변동성 | Sharpe | MDD |
|---|---:|---:|---:|---:|---:|
| **AMQS-AI-Infra** | **168.0%** | **50.9%** | 31.7% | **1.46** | **-26.6%** |
| QQQ | 82.5% | 28.5% | 20.5% | 1.33 | -22.8% |
| SMH (반도체) | 245.1% | 67.7% | 36.4% | 1.60 | -35.7% |
| SOXX (반도체) | 200.5% | 58.3% | 37.8% | 1.40 | -41.4% |
| AI-Infra 동가중 | 402.6% | 96.2% | 37.0% | 2.01 | -36.6% |

회전율 ~1,384%/년 · 리밸런싱 114회 · 레짐 분포(주간): Risk-On 101 / Risk-Off 12 / Defensive 1.

**해석 (숫자를 곧이곧대로 믿지 말 것)**

- **vs QQQ: +85.5%p 초과수익.** 시장 대비 명확한 알파. Sharpe 도 1.46 > 1.33.
- **vs 순수 반도체 ETF: 낙폭 우위.** MDD -26.6% 로 SMH(-35.7%)·SOXX(-41.4%)보다 얕다. 손절 + 레짐 디리스킹이 작동한 결과.
- **vs AI-Infra 동가중: 언더퍼폼.** 동가중 바스켓(402.6%, Sharpe 2.01)이 가장 높다. 2024~2026 은 *일방향 강세장*이라 **순수 베타가 모멘텀 선별·손절을 이긴 국면**이다. 즉 본 전략의 가치는 *최대 수익*이 아니라 *변동성·낙폭 관리*에 있다.
- 표본 구간이 사상 최대 AI 강세장이므로 모든 수치는 **인샘플 특성**을 강하게 반영한다. 약세장·횡보장 일반화는 검증되지 않았다.

산출 파일(`data/`):

| 파일 | 내용 |
|---|---|
| `amqs_ai_infra_log.csv` | 라이브 트래커 스냅샷 (실행 시마다 append) |
| `amqs_ai_infra_state.json` | 포트폴리오 진입가 상태 (손절 추적용) |
| `AMQS_AI_Infra_Quant_Report_20260720.md` | 2026.07.20 정식 퀀트 리포트 |
| `AMQS_AI_Infra_20260720_Signals.md` | 2026.07.20 실시간 시그널 분석 |
| `backtest_summary.csv` | 전략별 총수익·CAGR·변동성·Sharpe·MDD·최종자산 |
| `backtest_equity.csv` | 일별 equity curve (AMQS vs QQQ/SMH/SOXX/AI동가중) |
| `backtest_positions.csv` | 주별 목표 비중 + 레짐 |
| `backtest_trades.csv` | 진입/청산/손절 로그 |
| `backtest_regimes.csv` | 레짐 전환 이력 |

---

## 100점 채점 구성

| 차원 | 가중치 | 내용 |
|---|---:|---|
| 모멘텀 신호 강도 | 35% | 4-Factor z-score(60%) + 52주 신고가 위치(25%) + 추세 일관성(15%) |
| 단기 하락 매수 | 15% | Pullback-in-Uptrend (4중 게이트 통과 시에만) |
| 추세 품질 & 가속도 | 25% | 200일선 위 + 모멘텀 가속 (LLM 은 매출가속·13F·EPS 상향 추가) |
| 변동성 조정 알파 | 15% | 6M 수익률/변동성 + 12M MDD ≤ -30% |
| 거시 환경 적합성 | 10% | QQQ 200MA · VIX · 금리 트렌드 |

**신호 tier**: CENTER(≥80) · SATELLITE(65~80) · TACTICAL(50~65) · DIP_BUY(단기 하락 매수) · REDUCE · EXIT(-12% 손절 또는 12M MDD<-30%).

---

## Python 스크립트 vs LLM 프롬프트 역할 분담

| 항목 | Python | LLM |
|---|---|---|
| 4-Factor 모멘텀 · 단기 하락 매수 · RSI · MDD · 레짐 | Yes (자동) | Yes |
| Top-N 선별 + 서브테마 캡 | Yes (자동) | Yes |
| Revenue Acceleration · 13F · EPS Revision | No (yfinance 한계) | Yes (지식·검색) |
| 매크로 내러티브 · 종목 고유 이벤트 | No | Yes |

Python 은 *기술적 신호 자동 추적*, LLM 은 *펀더멘털·내러티브 검토*. 교차 검증이 권장 워크플로우.

---

## 주의 / 한계

- 본 시스템은 **연구·시뮬레이션 도구**이며 실거래 손익을 보장하지 않는다.
- AI 인프라는 고변동·고베타 섹터. 종목 간 상관이 높아 분산 효과가 제한적이다(서브테마 캡으로 일부 완화).
- 백테스트 표본이 단일 AI 강세 사이클이라 약세장·횡보장 일반화는 미검증. 임계치는 **워크포워드**로 재보정해야 한다.
- yfinance 무료 데이터. 일부 종목은 상장 이력이 짧아 자동 제외될 수 있다.
- 거래비용 5bps + 슬리피지 10bps 는 기관 가정. 한국 개인은 *20 ~ 30bps + 환전 50 ~ 100bps + 양도세 22%* 차감 후 재계산 필요. 회전율 ~1,384%/년은 비용 민감도가 매우 높다.

---

## 라이선스

MIT. 출처 표기 권장: "Built on AMQS by Dennis Kim, vibe-investing repository."

---

## 링크

- 최신 퀀트 리포트: [AMQS_AI_Infra_Quant_Report_20260720.md](data/AMQS_AI_Infra_Quant_Report_20260720.md)
- 실시간 시그널 분석: [AMQS_AI_Infra_20260720_Signals.md](data/AMQS_AI_Infra_20260720_Signals.md)
- 쉽게 읽는 설명(아이디어 노트): [AMQS_AI_Infra_Idea_Note.md](AMQS_AI_Infra_Idea_Note.md) · [PDF](AMQS_AI_Infra_Idea_Note.pdf)
- 레포지토리: [vibe-investing](https://github.com/gameworkerkim/vibe-investing)
- 원본 AMQS: [Adaptive Momentum Quant Strategy (AMQS)](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS))
- AMQS-M7: [for M7](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20M7)
- 본 전략: [for AI Infra](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20AI%20Infra)
