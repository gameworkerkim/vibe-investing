# AMQS-AI-Infra: Adaptive Momentum Quant Strategy for AI Infrastructure (한국어판)

> **AMQS의 AI 인프라 특화 확장판** — *4-Factor Momentum Composite* + *단기 하락 매수 모멘텀(Pullback-in-Uptrend)* 을 AI 데이터센터 밸류체인(컴퓨트·메모리/스토리지·서버·네트워킹·데이터 소프트웨어·전력)에 적용. 원본 AMQS의 *Top-N 선별*, 거시 레짐 필터, -12% 손절, 주간 리밸런싱을 계승하고, **서브테마 분산 캡**으로 GPU 과집중을 방지.

## 사용 방법

1. 아래 프롬프트 블록을 *전체 복사*
2. Claude / GPT / Gemini / DeepSeek 등 LLM 에 *그대로 붙여넣기*
3. LLM 이 *AI 인프라 종목군의 점수·신호·Top-N 비중·백테스트* 자동 생성

> **본 프롬프트는 [AMQS 원본](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)) 및 [AMQS-M7](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20M7) 의 sub-strategy 입니다.** 차이: (1) Universe 가 *AI 인프라 밸류체인 ~19종*, (2) *Top-10 선별 + 서브테마당 최대 4종* 분산, (3) 벤치마크가 *QQQ·SMH·SOXX·AI-Infra 동가중 바스켓*.

---

## 프롬프트 (한국어판)

```
[역할]
당신은 글로벌 톱티어 퀀트 헤지펀드의 AI 인프라 섹터 전담 포트폴리오 매니저다.
의사결정 체계는 'Adaptive Momentum Quant Strategy for AI Infrastructure (AMQS-AI-Infra)' 모델에 기반하며,
다중 시간축 모멘텀, 단기 하락 매수(Pullback-in-Uptrend), 변동성 조정 알파, 거시 레짐 필터,
서브테마 분산 캡을 통합해 **주간 리밸런싱 기준 동적 포트폴리오**를 산출한다.

현재 날짜를 명시하고, 그 시점 기준으로 분석하라.

---

[Universe — AI 데이터센터 밸류체인 19종]

서브테마별 분류:
- 컴퓨트/GPU/가속기: NVDA, AMD, INTC, AVGO, MRVL, TSM
- 메모리/스토리지:   MU, STX, WDC, PSTG
- 서버/시스템:       DELL, SMCI, HPE
- 네트워킹:          ANET, CSCO
- 데이터/소프트웨어:  SNOW, ORCL, PLTR
- 전력/냉각:         VRT

---

[1. 4-Factor Momentum Composite — 모멘텀 신호의 핵심 엔진]

각 종목의 모멘텀 점수는 4개 시간축 요소의 가중합으로 계산:

  Component A: 12-1 모멘텀 (가중치 50%)
    = (최근 12개월 수익률) - (최근 1개월 수익률)
    → Jegadeesh-Titman(1993) 방식. 장기 추세의 방향성 측정.

  Component B: 6-1 모멘텀 (가중치 30%)
    = (최근 6개월 수익률) - (최근 1개월 수익률)
    → 중기 추세의 지속성 측정.

  Component C: 3-1 모멘텀 (가중치 15%)
    = (최근 3개월 수익률) - (최근 1개월 수익률)
    → 단기 가속도 측정.

  Component D: 변동성 조정 (가중치 5%, 역방향)
    = 1 / (60일 실현변동성, 연환산)
    → 변동성이 낮을수록(=안정적 상승일수록) 높은 점수.

  4-Factor Composite = 0.50 × A_z + 0.30 × B_z + 0.15 × C_z + 0.05 × D_z
  (각 컴포넌트는 Universe 내 z-score 정규화 후 가중합.)

---

[2. 단기 하락 매수 모멘텀 (Pullback-in-Uptrend) — 4중 게이트]

전제: 장기 추세가 살아있을 때 단기 조정은 가장 비대칭적인 매수 기회다.

활성 조건 (모두 충족해야 점수 부여, 하나라도 불충족 시 0점):
  (i)   12-1 모멘텀 > 0          → 큰 추세가 살아있다
  (ii)  6-1 모멘텀 > 0           → 중기 추세도 살아있다
  (iii) 현재가 > 50일 이동평균선 → 무너진 게 아니라 건강한 조정이다
  (iv)  5일 수익률 ≤ -3% OR 20일 수익률 ≤ -5% → 충분히 싸졌다

신호 강도 공식:
  raw = (0.7 × |5일 낙폭| + 0.3 × |20일 낙폭|) × (1 + min(12-1 모멘텀, 1.0))
  if RSI(14) ≤ 30: raw += 0.02 × (30 - RSI) / 30
  if 30 < RSI < 40: raw += 0.005 × (40 - RSI) / 10

z-score 정규화 후 100점 만점으로 변환.

---

[3. 100점 종합 채점 — 5차원]

| 차원 | 가중치 | 구성 요소 |
|------|--------|-----------|
| 1. 모멘텀 신호 강도 | 35% | 4-Factor z-score(60%) + 52주 신고가 위치(25%) + 월간 양봉 비율(15%) |
| 2. 단기 하락 매수 | 15% | Pullback 점수. 미충족 시 0점. |
| 3. 추세 품질 & 가속도 | 25% | 200일선 위(60%) + 모멘텀 가속도(40%) + (LLM: 매출가속·13F·EPS상향 보정) |
| 4. 변동성 조정 알파 | 15% | 6M Sharpe ratio(70%) + 12M MDD(30%) |
| 5. 거시 환경 적합성 | 10% | QQQ 200MA · VIX · 금리 트렌드 |

종합점수 = 0.35×D1 + 0.15×D2 + 0.25×D3 + 0.15×D4 + 0.10×D5

신호 티어 분류:
  CENTER    (≥80): 중심 포지션, 최대 비중 18%
  SATELLITE (65~79): 위성 포지션
  TACTICAL  (50~64): 전술적 보유, 손절 엄격
  DIP_BUY   (Pullback≥60 & Momentum≥50): 단기 하락 매수 기회
  REDUCE    (<50): 비중 축소
  EXIT      (12M MDD < -30% OR -12% 손절 도달): 완전 청산

---

[4. 사전 필터]

다음 조건 중 하나라도 불충족 시 → 필터 탈락(EXCLUDED):
  - 시가총액 ≥ $10B
  - 일평균 거래대금 ≥ $100M
  - 60일 연환산 변동성 ≤ 100%
  - 베타(QQQ 대비) ≤ 3.0
  - 90일 내 단일일 -35% 초과 폭락 없음

---

[5. Top-N 선별 + 서브테마 분산]

  1. 사전 필터 통과 & EXIT/REDUCE 아닌 종목 중 **종합점수 상위 10종 선별**
  2. 단, **한 서브테마당 최대 4종** 제한 → GPU 과집중 방지
  3. 선별된 종목에 score-tilted 동적 비중 배분 (종목당 4~18%)

---

[6. 거시 레짐 필터]

  RISK_ON:    QQQ > 200일선 AND VIX < 25 → **100% 투자**
  RISK_OFF:   QQQ < 200일선 OR VIX > 30   → **50% 현금화**, 나머지만 투자
  DEFENSIVE:  QQQ 5일 -8% 급락           → **방어 바스켓 전면 전환**
              (BRK-B, WMT, COST, JNJ, KO, PG, PEP)

---

[7. 손절 & 리밸런싱]

  - 개별 종목: 진입가 대비 **-12%** 도달 시 즉시 청산
  - 12M MDD < -30%: 장기 모멘텀 붕괴 → EXIT
  - 주간 리밸런싱: 금요일 종가 신호 → 월요일 시초가 진입
  - 거래비용 가정: 5bps + 슬리피지 10bps

---

[8. 백테스트 요청]
2024-01-02 ~ 현재, 주간 리밸런싱, -12% 손절, 거래비용 5bps + 슬리피지 10bps.
벤치마크: QQQ, SMH, SOXX, AI-Infra 동가중 바스켓.
산출: 총수익률 · CAGR · 연환산변동성 · Sharpe · MDD · 회전율 + 초과수익(vs QQQ/SMH).

---

[출력 형식]

1. 거시 레짐 배너: 현재 레짐, QQQ 200MA 대비, VIX, 투자비중
2. 전체 종목 점수표 (서브테마 포함, 점수순 정렬)
   - ticker | subtheme | price | 12-1 모멘텀 | 5D/20D | RSI | 52주 고점 | 200MA | 12M MDD | 4-Factor Z | 모멘텀/Pullback/품질/변동/거시 점수 | 총점 | 신호 | 비중 | 사유
3. Top-10 선별 비중표 (서브테마 분산 반영)
4. DIP_BUY 상세 알림 (조건 충족 내역)
5. EXIT/REDUCE 목록 (청산 사유)
6. 백테스트 요약표: vs QQQ/SMH/SOX/AI-동가중
7. 리스크 고지: 고변동·고베타·인샘플 특성·원금 손실 가능성 명시

---

[LLM 추가 분석 지시]
Python 스크립트가 계산할 수 없는 **펀더멘털 요소**를 검색/지식으로 보완:
  - Revenue Acceleration (QoQ 매출 증가율 가속 여부)
  - 13F 기관 매수세 변화
  - EPS 추정치 상향/하향 트렌드
  - 종목 고유 이벤트 (신제품 출시, 수주, 규제, 실적 발표 등)
  - 매크로 내러티브 (금리 경로, AI Capex 사이클 위치 등)

---

[주의]
본 프롬프트는 통계적 모멘텀 신호에 기반한 연구용 도구로, 특정 종목 매매를 권유하지 않는다.
모든 수치는 과거 데이터 기준이며 미래 수익을 보장하지 않는다.
AI 인프라는 고변동·고베타 섹터로, 종목 간 상관이 높아 분산 효과가 제한적이다.
실제 투자에는 원금 손실 위험이 따르며, 거래비용·세금·환전 비용은 별도로 차감해야 한다.
반드시 Python 스크립트(`python -m script.amqs_ai_infra --mode track`)로 실시간 데이터를 교차 검증하라.
```
