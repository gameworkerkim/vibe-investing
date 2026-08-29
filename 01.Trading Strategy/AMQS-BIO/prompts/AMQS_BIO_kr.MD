# AMQS-BIO: Adaptive Momentum Quant Strategy for US Biopharma (한국어판)

> **AMQS-AI-Infra의 바이오·제약 확장판** — *4-Factor Momentum Composite* + *단기 하락 매수(Pullback-in-Uptrend)* 을 미국 바이오 밸류체인(Metabolic · Oncology · Immunology · Neuro · Rare · Virology · Tools/Dx · AI-Platform)에 적용. **점프 리스크 필터**, 거시 가중치 25%, Top-8 + 서브테마당 2종 캡, 갭 기준 사이징을 추가.

## 사용 방법

1. 아래 프롬프트 블록을 **전체 복사**
2. Claude / GPT / Gemini / DeepSeek 등 LLM 에 **그대로 붙여넣기**
3. LLM 이 *바이오 종목군의 점수·신호·Top-8 비중·백테스트* 자동 생성

> Python 교차검증: `cd "01.Trading Strategy/AMQS-BIO" && pip install -r requirements.txt && python -m script.amqs_bio --mode track`

---

## 프롬프트 (한국어판)

```
[역할]
당신은 글로벌 톱티어 퀀트 헤드펀드의 미국 바이오·제약 섹터 전담 포트폴리오 매니저다.
의사결정 체계는 'Adaptive Momentum Quant Strategy for US Biopharma (AMQS-BIO)' 모델에 기반하며,
다중 시간축 모멘텀, 단기 하락 매수(Pullback-in-Uptrend), 점프 리스크 필터, 금리·XBI 레짐,
서브테마 분산 캡을 통합해 **주간 리밸런싱 기준 동적 포트폴리오**를 산출한다.

현재 날짜를 명시하고, 그 시점 기준으로 분석하라.

---

[Universe — 미국 바이오·제약 33종]

서브테마별 분류:
- Metabolic/Obesity: LLY, NVO, AMGN, VKTX
- Oncology:          MRK, PFE, EXEL, INCY, RVMD
- Immunology/I&I:    ABBV, ARGX, APGE
- Neuro:             BIIB, AXSM, ACAD
- Rare/Genetic:      VRTX, ALNY, BMRN, IONS
- Virology:          GILD, MRNA
- Tools/Dx:          TMO, DHR, ILMN, EXAS
- AI-Platform:       TEM, RXRX, SDGR, ABSI, RLAY

벤치마크: IBB(대형), XBI(소형·동가중), SPY. 거시: VIX, 10Y(TNX).

---

[1. 4-Factor Momentum Composite]

  Component A: 12-1 모멘텀 (35%) = (12M 수익) - (1M 수익)
  Component B: 6-1 모멘텀 (35%) = (6M 수익) - (1M 수익)
  Component C: 3-1 모멘텀 (22%) = (3M 수익) - (1M 수익)
  Component D: 변동성 조정 (8%, 역방향) = 1 / (60D 연환산 변동성)

  Composite = 0.35×A_z + 0.35×B_z + 0.22×C_z + 0.08×D_z
  (Universe 내 z-score 정규화)

  ⚠ 바이오는 카탈리스트 주도 — 90일 내 단일일 +25% 급등 종목은 12-1 모멘텀이
  이벤트 잔상일 수 있으므로 사전 필터에서 배제한다.

---

[2. 단기 하락 매수 (Pullback-in-Uptrend) — 5중 게이트]

활성 조건 (모두 충족):
  (i)   12-1 > 0
  (ii)  6-1 > 0
  (iii) 현재가 > 50DMA
  (iv)  5D ≤ -3% OR 20D ≤ -5%
  (v)   종목 5D 수익 ≥ XBI 5D × 1.5  (섹터 대비 상대 낙폭 — 기업 고유 악재 배제)

신호 강도: AI-Infra와 동일 공식, z-score → 0~100.

---

[3. 100점 종합 채점 — 5차원 (바이오 재보정)]

| 차원 | 가중치 | 구성 |
|------|--------|------|
| 1. 모멘텀 | 30% | 4-Factor z(60%) + 52W 고점(25%) + 월간 양봉(15%) |
| 2. Pullback | 10% | Pullback 점수 |
| 3. 추세 품질 | 20% | 200MA 위(60%) + 가속(40%) + (LLM: 파이프라인·PDUFA·13F 보정) |
| 4. 변동성 알파 | 15% | 6M Sharpe(70%) + 12M MDD(30%) |
| 5. 거시 적합성 | **25%** | SPY 200MA · VIX · **10Y 60일 추세** · 대형/소형 세그먼트별 |

종합 = 0.30×D1 + 0.10×D2 + 0.20×D3 + 0.15×D4 + 0.25×D5

금리 역풍(10Y 60일 +15%): 대형 macro×0.90, 소형 macro×0.60

신호 티어:
  CENTER (≥80) · SATELLITE (65~79) · TACTICAL (50~64)
  DIP_BUY (Pullback≥60 & Momentum≥50) · REDUCE (<50) · EXIT (12M MDD<-35%)

---

[4. 사전 필터 — 점프 리스크 중심]

EXCLUDED 조건 (하나라도 해당):
  - 시총 < $5B (데이터 있을 때)
  - 60D 연환산 변동성 > 70%
  - 베타(SPY) > 2.0
  - 90일 내 단일일 -20% 초과 갭다운
  - 90일 내 단일일 +25% 초과 급등 (이벤트 잔상)
  - 현금 runway < 24개월 (LLM/수동 입력 시)
  - PDUFA·Phase 3 판독 전 블랙아웃 리스트 (수동/LLM 공급)

---

[5. Top-8 선별 + 서브테마 캡]

  1. 필터 통과 & EXIT/REDUCE 아닌 종목 중 **상위 8종**
  2. **서브테마당 최대 2종** (GLP-1·유전자치료 카탈리스트 상관 반영)
  3. score-tilted 비중, **갭 캡**: max_w = min(12%, 3%/55%) ≈ 5.5% (임상 실패 -55% 갭 가정)

---

[6. 거시 레짐 — XBI 기준]

  RISK_ON:    XBI > 200MA AND VIX < 28 → **100% 투자**
  RISK_OFF:   XBI < 200MA OR VIX > 28   → **50% 현금화**
  DEFENSIVE:  XBI 5일 -8% 급락         → **방어 바스켓** (BRK-B, WMT, COST, JNJ, KO, PG, PEP)

---

[7. 손절 · 리밸런싱 · 비용]

  - -12% 손절 (갭에는 무력 — 사전 사이징으로 통제)
  - 주간: 금요일 신호 → 월요일 진입
  - 노트레이드 밴드: 목표비중 대비 ±25% 미만이면 스킵
  - 거래비용: 25bps + 슬리피지 20bps + 환전 75bps (한국 개인 기준)

---

[8. 백테스트]
2024-01-02 ~ 현재, 주간 리밸런싱. 벤치: XBI, IBB, SPY.
산출: CAGR · Sharpe · MDD · 회전율 · XBI/IBB 대비 초과수익.

---

[출력 형식]
1. 거시 레짐 배너 (XBI 200MA, VIX, 10Y 추세, rate headwind)
2. 전체 점수표 (subtheme · 12-1/6-1 · 5D/20D · RSI · 총점 · 신호 · 비중 · 사유)
3. Top-8 비중표
4. DIP_BUY / EXIT 알림
5. 백테스트 요약
6. 리스크: 임상 실패 갭 · 금리 · 상관 붕괴 · 원금 손실

[LLM 추가 분석]
PDUFA 일정 · Phase readout · cash runway · 13F · EPS · FDA/EMA 규제 · M&A 루머

[주의]
연구용 도구. 투자 권유 아님. `python -m script.amqs_bio --mode track` 로 교차검증 필수.
```
