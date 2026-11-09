# 참조 1 — 국면·팩터 규칙표 (프롬프트 A/B)

> 원문: `SEMICONDUCTOR-QUANT-PROMPTS-V2-2026-11.md` 3~4절. 수치는 모두 초기값.

## 유니버스 (3.1)

| 서브섹터 | 코어 | 확장 | 비고 |
|---|---|---|---|
| GPU/가속기 | NVDA | AMD(데이터센터 GPU), AVGO, MRVL | AVGO·MRVL은 커스텀 ASIC |
| CPU | AMD, INTC | ARM, QCOM | AMD는 `dual_exposure: {"GPU": 0.30}` |
| 메모리 | MU, 000660.KS | 005930.KS | 삼성전자는 메모리 순수도 낮음 |
| 스토리지 | WDC, STX, SNDK | PSTG, NTAP | SNDK는 2025 분할 상장 → 이전 기간 결측 |

- 횡단면 z-score는 **반도체 전체 유니버스** 기준 계산 후 서브섹터 평균을 빼서 중립화.
- 서브섹터 내 3종목 미만이면 서브섹터 내 z-score 금지.
- 상장 기간이 룩백보다 짧으면 해당 신호는 N/A(0으로 채우지 않음).

## 신호 정의 (프롬프트 A 1))

| 신호 | 정의 | 결측 규칙 |
|---|---|---|
| `mom_12_1` | 직전 12개월 수익률 − 최근 1개월 제외 | 이력 부족 시 N/A |
| `mom_3m` | 최근 3개월 수익률 | 이력 부족 시 N/A |
| `revision` | NTM EPS 컨센서스 3개월 변화율(%) | 추정 애널리스트 5명 미만이면 N/A |
| `divergence` | rank(mom_12_1) − rank(mom_3m) | 상위 20% → `DIVERGENCE_HIGH` 플래그(risk_flags에만 기록, 스코어에 넣지 않음) |

## 사이클 국면 판정 (프롬프트 A 2))

입력(모두 자기 5년 이력 대비 z-score):
a) DRAM·NAND 계약가 3개월 변화율, b) MU·SK하이닉스·WDC·STX 공시 재고일수 YoY 변화,
c) 메모리 CAPEX/매출, d) 실적 콜 "차기 연도 HBM 물량 완판" 언급(0/1)

| 국면 | 규칙 (우선순위 R1 > R2 > R4 > R3) |
|---|---|
| R1 회복 | a > 0, b < 0, c ≤ 0 |
| R2 확장 | a > 0, b ≤ 0, c > 0 |
| R4 하강 | a < 0, b > 0 |
| R3 후기 | a 둔화(직전 분기 대비 감소) & (b > 0 또는 c > +1σ) |
| N/A | 어느 규칙에도 불일치 **또는 입력 2개 이상 N/A** → confidence="low" |

## 국면별 가중치 (프롬프트 A 3), 합계 100)

| 국면 | mom_12_1 | revision | cycle |
|---|---|---|---|
| R1 | 30 | 50 | 20 |
| R2 | 45 | 45 | 10 |
| R3 | 25 | 35 | 40 |
| R4 | 15 | 35 | 50 |
| N/A | 40 | 60 | 0 |

- cycle 점수: R2=+1, R1=+0.5, R3=−0.5, R4=−1. 메모리·스토리지 ×1.0, GPU·CPU ×0.5.
- composite = Σ(가중치 × 서브섹터 중립 z) → 0~100 백분위.
- 서브섹터별 상위 2 = 롱 후보, 하위 1 = 언더웨이트 후보. DIVERGENCE_HIGH는 후보 여부와 무관하게 risk_flags.

## 멀티팩터 (프롬프트 B)

| 팩터 | 정의 |
|---|---|
| revision | NTM EPS 3개월 변화율 |
| quality | (영업이익률 3년 추세 기울기, FCF 마진, −순부채/EBITDA) 평균 |
| value | GPU·CPU: −(NTM P/E 5년 z) / 메모리: −(P/B 10년 z) + EV/사이클 평균 EBIT / 스토리지: FCF 수익률 |
| cycle | 프롬프트 A cycle 점수 재사용 |
| flow_kr | (한국 종목만) 외국인 20일 누적 순매수/시가총액 — 미국 종목은 계산 금지 |

서브섹터별 가중치(합계 100): GPU 40/35/25/0 · CPU 50/30/20/0 · 메모리 40/15/20/25 · 스토리지 35/20/35/10 (revision/quality/value/cycle)

플래그: value 높고 revision < −1σ → `VALUE_TRAP` / quality·revision 동시 +1σ 이상 → `QUALITY_MOMENTUM`.
외부 리서치의 관계 주장(예: "영업이익률 역전 → 외인 수급")은 가설로만 기록, <DATA>로 상관 확인된 경우에만 rationale_codes에 넣는다.
