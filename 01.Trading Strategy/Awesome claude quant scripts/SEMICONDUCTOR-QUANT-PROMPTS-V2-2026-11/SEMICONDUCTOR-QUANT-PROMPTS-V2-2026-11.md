# 반도체 4개 서브섹터 퀀트 프롬프트 v2 — 검증 및 최적화본

> GPU · CPU · 메모리 · 스토리지 / 모멘텀 · 퀀트 / 업계 전문가 관점 · 헤지펀드 관점
> 기준일: 2026-11-09 · 원칙: **LLM은 엑셀이지 오라클이 아니다** — 프롬프트는 계산 규칙을 정의하고, 숫자는 데이터에서 나와야 한다.
> 모든 프롬프트는 한국어(KR)와 영어(EN) 두 버전으로 제공한다. 두 버전은 같은 규칙·같은 수치를 담고 있으며, 사용하는 모델과 언어 환경에 맞춰 골라 쓸 수 있다.
> 영어에 능통하다면 토큰을 아끼기 위해 영어로 퀀트 프롬프트를 이용하는 것이 좋다.

---

## 0. 한눈에 보는 검증 결과

원본 프롬프트는 관점 분리(산업 사이클 vs 포지셔닝·리스크)라는 뼈대가 좋다. 그러나 실제로 돌리면 깨지는 지점이 여러 곳 있다.

| 구분 | 원본의 문제 | v2의 처리 |
|---|---|---|
| 시점 | 2026년 사건·수치를 프롬프트 본문에 하드코딩 → 룩어헤드 편향, 프롬프트가 날짜에 묶임 | `AS_OF` 기준일 변수 + 사건은 "스트레스 테스트 시나리오"로 분리 |
| 데이터 | LLM에게 데이터 없이 스코어 산출을 요구 → 수치 환각 | `<DATA>` 블록 주입 계약, 없으면 `N/A`, 계산은 `codegen` 모드 권장 |
| 유니버스 | GPU 1종목(NVDA)으로 "서브섹터 내 횡단면 순위·z-score" 계산 불가 | 서브섹터별 확장 유니버스, 3종목 미만이면 서브섹터 내 z-score 금지 |
| 분류 | AMD가 GPU·CPU 양쪽 성격인데 CPU로만 분류 | 매출 세그먼트 기준 1차 분류 + 이중 노출 표시 |
| 사이클 | 국면 2개만 정의(초기·후기), 하강·회복 누락. CAPEX/매출 30% 절대 임계값은 메모리에 부적합 | 4국면 정의, 임계값은 자기 5년 이력 대비 z-score |
| 데이터 실재성 | "HBM 재고일수", "HBM sold-out 비율"은 공개 시계열이 없음 | 공시 재고일수·DRAM/NAND 계약가 프록시 + 실적 콜 텍스트에서 "완판" 플래그 추출 |
| 회계연도 | 6M 이익수정률을 FY 기준으로 쓰면 NVDA(1월 결산)·MU(8월 결산) 간 FY 롤오버 점프 발생 | NTM(향후 12개월) 블렌디드 EPS 기준 |
| 밸류 | 메모리에 PER 사용 → 사이클 피크에서 PER이 가장 싸 보이는 함정 | 메모리는 P/B·EV/사이클 평균 EBIT, 스토리지는 FCF 수익률 |
| 사이징 | 롱 160%를 4종목에, 그런데 종목당 15% 상한 → 수학적으로 불가능(최대 60%) | 그로스·종목 수·종목 상한을 서로 정합적으로 재설계 |
| 리스크 규칙 | "20일 변동성 > 90일 × 1.5면 전량 청산" → 반도체 고변동 국면에선 상시 발동, 휩소 | 변동성 비율 역수로 단계적 축소 + 재진입 규칙 추가 |
| 크라우딩 | 13F를 실시간 지표처럼 사용(실제로는 분기 + 45일 지연) | 지연 명시, 공매도 잔고·days-to-cover·옵션 스큐·ETF 보유비중과 합성 |
| 숏 로직 | 3M 약세만으로 숏 강제 편입 → 일시 조정에 숏을 깔 위험 | 3M 약세와 이익수정률 하향을 동시에 충족할 때만 숏 |
| 백테스트 | 2026년 7월 붕괴를 보고 만든 규칙을 같은 구간으로 검증 → in-sample 과적합 | 워크포워드, 2026-07은 튜닝 금지 스트레스 구간 |
| 헤지 | SOX 지수 옵션 직접 사용(유동성 낮음), 헤지 예산 없음 | SMH/SOXX 옵션, 연간 헤지 예산 상한 |
| 형식 | 한자 혼입("重叠度"), 출력 비정형 | 용어 정리, JSON 출력 스키마 |
| 크로스마켓 | SK하이닉스(KRW·한국 거래일)를 미국 종목과 그대로 혼합 | USD 환산, 미국 캘린더 정렬, 한국 공매도 가능 여부·차입비용 체크 |

---

## 1. 원본 서술의 팩트체크

원본 해설에 들어간 시장 사실을 2026-11-09 기준 공개 보도로 대조했다. **이 사실들은 프롬프트 본문에서 제거하고 "검증 시나리오"로만 남긴다.**

| 원본 주장 | 판정 | 확인 내용 |
|---|---|---|
| 2026년 7월 모멘텀 전략이 2023년 이후 최악의 드로다운 | 확인 | 골드만 PB 데이터상 시스템 롱숏 매니저가 한 주 -3.1%, 다음 주 -2.1%로 2023년 12월 이후 최약 구간. 골드만 unconstrained momentum은 고점 대비 -24%로 2023년 1분기 이후 최악 |
| "연속 2주 3% 이상 하락" | 부정확 | 3% 이상은 첫 주뿐, 둘째 주는 -2.1% |
| 고모멘텀 AI 반도체(특히 MU) 급락 | 확인 | MU·Lumentum 약 1/3 하락, SanDisk -42% 보도 |
| 펀더멘털보다 포지션 청산이 주 촉매 | 대체로 확인 | 헤지펀드 강제 디레버리징과 레버리지 단일종목 ETF 마진콜이 하락을 증폭했다는 분석 다수 |
| 골드만이 2026년 8월 반도체를 숏 바스켓으로 이동 | 부분 확인 | 골드만 트레이더가 모멘텀 팩터 내 반도체·AI가 롱에서 숏 쪽으로 회전 중이라고 언급한 보도는 있음. "8월", "숏 바스켓 이동"이라는 구체 표현은 미확인 |
| NVDA 12M 모멘텀 강세, 3M은 언더퍼폼 | 미확인 | 방향성은 위 회전 서술과 부합하나 직접 출처 미확인 → 데이터로 계산할 항목 |
| NVDA 선행 PER 약 18배, 2019년 초 이후 최저 | 수치 불일치 | 2026년 3월 약 19.6배, 7월 약 22.2배가 "2019년 이후 최저"로 보도됨. 18배 확인 불가. 시변 수치이므로 하드코딩 금지 |
| 2026년 11월 헤지펀드의 연말 수익 확정 매도 | 부분 확인 | 11월 초 헤지펀드의 AI 포지션 청산 보도는 있으나 "연말 수익 확정"이라는 동기는 미확인 |
| 하나증권: SK하이닉스 영업이익률 2025년 9월 TSMC 추월, 외인 순매수와 상관 | 미검증 | 이번 점검 범위에서 원문 확인 못 함. 인용 전 리포트 원문 확인 필요 |
| 2019~2021 사이클 2국면에서 퀄리티+실적모멘텀 바벨 수요 증가 | 출처 불명 | 출처 명시 필요. 프롬프트에선 가설로만 취급 |

> 참고할 만한 반대 근거: 골드만 트레이더는 하이베타 모멘텀 바스켓이 5거래일 10% 이상 빠진 과거 사례에서 다음 주 반등 확률이 80%였다고 지적했다. 즉 "3M 약세 = 숏"은 통계적으로 위험하며, v2에서 숏 조건에 이익수정률 확인을 붙인 이유다.

---

## 2. 설계 원칙

1. **관점의 역할 분리.** 업계 전문가 프롬프트는 *신호(무엇이 좋아지고 나빠지는가)* 를, 헤지펀드 프롬프트는 *포트폴리오(얼마나·언제·어떻게 줄일까)* 를 담당한다. 업계 프롬프트에서 사이징을 빼서 두 관점이 충돌하지 않게 했다.
2. **수치는 데이터에서, 규칙은 프롬프트에서.** LLM이 계산할 때는 주입된 데이터만, 백테스트처럼 LLM이 실제로 할 수 없는 작업은 코드 생성으로 전환한다.
3. **임계값은 상대값.** 반도체는 사이클마다 레벨이 바뀌므로 절대 임계값(CAPEX/매출 30% 등) 대신 자기 이력 대비 z-score·백분위를 쓴다.
4. **모든 가중치는 초기값.** 프롬프트 안의 가중치는 출발점일 뿐이며 워크포워드 검증을 거쳐야 한다.
5. **이중 언어.** 한국어판과 영어판은 1:1로 대응한다. 규칙을 고칠 때는 두 판을 함께 고친다.

---

## 3. 공통 블록

### 3.0 공통 시스템 계약 (모든 프롬프트 앞에 붙인다)

**KR**

```text
[공통 계약]
역할: {ROLE}
기준일(AS_OF): {YYYY-MM-DD}
- AS_OF 이후 정보는 사용하지 않는다(룩어헤드 차단).
- 학습 데이터에 있는 과거 시장 서사(뉴스·증권사 의견)는 신호가 아니라 "검증할 가설"로만 취급한다.

데이터 계약:
- 아래 <DATA> 블록의 수치만 사용한다. 블록에 없는 값은 기억이나 추정으로 채우지 말고
  "N/A(데이터 없음)"로 표기하고, 그 값이 필요한 스코어는 산출하지 않는다.
- 수익률은 USD 기준 배당 포함 총수익률. 한국 상장 종목은 KRW→USD 환산 후 계산하고,
  거래일은 미국 거래 캘린더에 맞춰 직전 종가를 이월(carry-forward)한다.
- 이익 추정치는 NTM(향후 12개월) 블렌디드 EPS를 쓴다. FY 기준 값은 회계연도 차이로 왜곡되므로 금지.

실행 모드: {MODE}
- "compute": <DATA>로 직접 계산. 중간 산출물(원시값 → z-score → 가중합) 표를 반드시 보여준다.
- "codegen": 같은 로직을 Python(pandas) 함수로 작성하고 단위 테스트를 포함한다. 수치 계산은 하지 않는다.

출력:
- 본문 설명은 10줄 이내, 마지막에 지정된 JSON 스키마 하나만 출력한다.
- 매수·매도 권유 문구, 목표주가, <DATA> 밖 수치 인용은 금지한다.
- 판단 근거는 "rationale_codes"(예: REV_UP, CROWD_HIGH, REGIME_R3)로 기록한다.
```

**EN**

```text
[Common Contract]
Role: {ROLE}
As-of date (AS_OF): {YYYY-MM-DD}
- Do not use any information dated after AS_OF (no look-ahead).
- Treat market narratives from your training data (news, sell-side opinions) only as
  "hypotheses to be tested", never as signals.

Data contract:
- Use only the numbers in the <DATA> block below. Do not fill missing values from memory
  or estimation; mark them "N/A (no data)" and do not compute any score that depends on them.
- Returns are USD total returns including dividends. Convert Korean listings from KRW to USD
  before computing, and align trading days to the US calendar by carrying forward the prior close.
- Use NTM (next-twelve-months) blended EPS for all earnings estimates. FY-based values are
  forbidden because fiscal-year differences distort them.

Execution mode: {MODE}
- "compute": calculate directly from <DATA>. Always show the intermediate table
  (raw value -> z-score -> weighted sum).
- "codegen": implement the same logic as Python (pandas) functions with unit tests.
  Do not compute any numbers.

Output:
- Keep the explanation to 10 lines or fewer, then output exactly one JSON object in the specified schema.
- No buy/sell recommendations, no price targets, no figures from outside <DATA>.
- Record the basis of each judgment as "rationale_codes" (e.g., REV_UP, CROWD_HIGH, REGIME_R3).
```

### 3.1 유니버스 정의

| 서브섹터 | 코어 | 횡단면 확장용 | 비고 |
|---|---|---|---|
| GPU/가속기 | NVDA | AMD(데이터센터 GPU 비중), AVGO, MRVL | AVGO·MRVL은 커스텀 ASIC — 가속기 수요의 대체 경로 |
| CPU | AMD, INTC | ARM, QCOM | AMD는 매출 다수 세그먼트로 1차 분류, 나머지 비중은 `dual_exposure` 필드로 표시 |
| 메모리 | MU, 000660.KS | 005930.KS | 삼성전자는 파운드리·모바일 혼재 → 메모리 순수도 낮음 표시 |
| 스토리지 | WDC, STX, SNDK | PSTG, NTAP | SNDK는 2025년 분할 상장 → 이전 기간 결측 처리 |

**KR**

```text
[유니버스 규칙]
- 횡단면 z-score는 "반도체 전체 유니버스" 기준으로 계산한 뒤 서브섹터 평균을 빼서 중립화한다.
- 서브섹터 내 종목이 3개 미만이면 서브섹터 내 z-score를 계산하지 않는다.
- 상장 기간이 신호 룩백보다 짧은 종목은 해당 신호를 N/A로 둔다(0으로 채우지 않는다).
```

**EN**

```text
[Universe Rules]
- Compute cross-sectional z-scores over the full semiconductor universe, then neutralize
  by subtracting the subsector mean.
- If a subsector has fewer than 3 names, do not compute within-subsector z-scores.
- If a stock's listing history is shorter than a signal's lookback, set that signal to N/A
  (never fill with 0).
```

### 3.2 출력 JSON 스키마 (공통, 언어 무관)

```json
{
  "as_of": "YYYY-MM-DD",
  "mode": "compute | codegen",
  "regime": {"label": "R1|R2|R3|R4|N/A", "inputs_used": [], "confidence": "low|mid|high"},
  "scores": [
    {
      "ticker": "NVDA",
      "subsector": "GPU",
      "dual_exposure": {"CPU": 0.0},
      "factor_z": {"mom_12_1": 0.0, "mom_3m": 0.0, "revision": 0.0, "quality": 0.0, "value": 0.0, "cycle": 0.0},
      "composite": 0.0,
      "rank_in_universe": 1,
      "rationale_codes": [],
      "missing": []
    }
  ],
  "candidates": {"long": [], "short_or_underweight": []},
  "positions": [
    {"ticker": "", "side": "long|short", "weight": 0.0, "crowd_z": 0.0, "stop_rule": "", "rationale_codes": []}
  ],
  "risk_flags": [],
  "data_gaps": []
}
```

---

## 4. 업계 전문가 관점 — 신호 생성

### 4.1 모멘텀 프롬프트 (업계 전문가)

**KR**

```text
[프롬프트 A — 반도체 서브섹터 모멘텀 스코어링: 사이클 국면 내재화]
{공통 계약, ROLE="반도체 산업 사이클을 이해하는 퀀트 전략가"}

목표: 3.1 유니버스에 대해 가격 모멘텀과 실적 모멘텀을 사이클 국면에 따라 가중 결합한
모멘텀 스코어를 산출한다. 포지션 사이징은 하지 않는다.

1) 신호 정의
- mom_12_1: 직전 12개월 수익률에서 최근 1개월을 제외(단기 반전 효과 제거)
- mom_3m: 최근 3개월 수익률
- revision: NTM EPS 컨센서스의 3개월 변화율(%), 추정 애널리스트 수 5명 미만이면 N/A
- divergence: rank(mom_12_1) − rank(mom_3m). 값이 크면 "장기 승자의 단기 이탈"
  → 별도 플래그(DIVERGENCE_HIGH, 상위 20%)로 보고만 하고 스코어에는 넣지 않는다.

2) 사이클 국면 판정 (메모리·스토리지 데이터로 업종 공통 국면을 정한다)
입력(모두 자기 5년 이력 대비 z-score):
  a. DRAM·NAND 계약가 3개월 변화율
  b. MU·SK하이닉스·WDC·STX의 공시 재고일수 전년 대비 변화
  c. 메모리 업체 CAPEX/매출
  d. 실적 발표문·콜에서 추출한 "차기 연도 HBM 물량 협상 완료/완판" 언급 여부(0/1)
판정 규칙:
  R1 회복: a > 0 이고 b < 0, c ≤ 0
  R2 확장: a > 0, b ≤ 0, c > 0
  R3 후기: (a 상승폭 둔화: 직전 분기 대비 a 감소) 이고 (b > 0 또는 c > +1σ)
  R4 하강: a < 0 이고 b > 0
  어느 규칙에도 맞지 않거나 입력 2개 이상이 N/A면 "N/A", confidence="low"

3) 국면별 가중치(초기값, 합계 100)
  | 국면 | mom_12_1 | revision | cycle |
  | R1  | 30 | 50 | 20 |
  | R2  | 45 | 45 | 10 |
  | R3  | 25 | 35 | 40 |
  | R4  | 15 | 35 | 50 |
  | N/A | 40 | 60 |  0 |
  cycle 점수: R2=+1, R1=+0.5, R3=−0.5, R4=−1을 기본으로, 메모리·스토리지는 ×1.0,
  GPU·CPU는 ×0.5(메모리 사이클 민감도가 낮음)를 곱한다.

4) 산출
- composite = Σ(가중치 × 서브섹터 중립 z-score), 0~100 백분위로 변환
- 서브섹터별 상위 2개를 롱 후보, 하위 1개를 언더웨이트 후보로 제시
- DIVERGENCE_HIGH 종목은 후보 여부와 무관하게 risk_flags에 기록

<DATA>
{가격 시계열, NTM EPS 컨센서스 시계열, DRAM/NAND 계약가, 재고일수, CAPEX, 콜 텍스트 요약}
</DATA>
```

**EN**

```text
[Prompt A — Semiconductor Subsector Momentum Scoring with Cycle Regime]
{Common Contract, ROLE="Quant strategist who understands the semiconductor industry cycle"}

Goal: For the universe in 3.1, compute a momentum score that blends price momentum and
earnings momentum with weights that depend on the cycle regime. Do not size positions.

1) Signal definitions
- mom_12_1: trailing 12-month return excluding the most recent month (removes short-term reversal)
- mom_3m: trailing 3-month return
- revision: 3-month % change in NTM EPS consensus; N/A if fewer than 5 estimating analysts
- divergence: rank(mom_12_1) − rank(mom_3m). A high value means "long-term winner breaking down
  short-term". Report it as a separate flag (DIVERGENCE_HIGH, top 20%) only; do not include it in the score.

2) Cycle regime (set one industry-wide regime from memory and storage data)
Inputs (all as z-scores versus each series' own 5-year history):
  a. 3-month change in DRAM and NAND contract prices
  b. Year-over-year change in reported inventory days for MU, SK hynix, WDC, STX
  c. Memory makers' CAPEX/revenue
  d. Whether earnings releases or calls state that next-year HBM volumes are fully negotiated
     or sold out (0/1)
Rules:
  R1 Recovery:  a > 0 and b < 0 and c <= 0
  R2 Expansion: a > 0 and b <= 0 and c > 0
  R3 Late:      (a decelerating: lower than prior quarter) and (b > 0 or c > +1 sigma)
  R4 Downturn:  a < 0 and b > 0
  If no rule matches or 2+ inputs are N/A, label "N/A" with confidence="low".

3) Regime weights (starting values, sum to 100)
  | Regime | mom_12_1 | revision | cycle |
  | R1     | 30 | 50 | 20 |
  | R2     | 45 | 45 | 10 |
  | R3     | 25 | 35 | 40 |
  | R4     | 15 | 35 | 50 |
  | N/A    | 40 | 60 |  0 |
  Cycle score: R2=+1, R1=+0.5, R3=−0.5, R4=−1 as base; multiply by 1.0 for memory and storage,
  and by 0.5 for GPU and CPU (lower sensitivity to the memory cycle).

4) Output
- composite = sum(weight × subsector-neutral z-score), converted to a 0–100 percentile
- Top 2 per subsector as long candidates, bottom 1 as underweight candidate
- Record every DIVERGENCE_HIGH name in risk_flags regardless of candidate status

<DATA>
{price series, NTM EPS consensus series, DRAM/NAND contract prices, inventory days, CAPEX, call transcript summaries}
</DATA>
```

### 4.2 퀀트(멀티팩터) 프롬프트 (업계 전문가)

**KR**

```text
[프롬프트 B — 서브섹터별 멀티팩터: 실적모멘텀 + 퀄리티 + 사이클 맞춤 밸류]
{공통 계약, ROLE="반도체 업종 퀀트 애널리스트"}

목표: 서브섹터마다 "그 업종에서 실제로 주가를 설명하는" 팩터 조합으로 스코어를 만든다.
사이징은 하지 않는다.

1) 팩터 정의 (모두 서브섹터 중립 z-score)
- revision: NTM EPS 3개월 변화율
- quality: 영업이익률 3년 추세(기울기), FCF 마진, 순부채/EBITDA(낮을수록 +) 의 평균
- value: 서브섹터별로 다르게 정의
    GPU·CPU: NTM P/E의 자기 5년 z-score 역부호
    메모리: P/B의 자기 10년 z-score 역부호 + EV/사이클 평균 EBIT
            (사이클 피크에서 P/E가 가장 낮아 보이는 함정 회피)
    스토리지: FCF 수익률
- cycle: 프롬프트 A의 cycle 점수 재사용
- flow_kr (선택, 한국 상장 종목만): 외국인 20일 누적 순매수 / 시가총액.
  미국 종목에는 계산하지 않으며, 한국 종목 간 비교에만 쓴다.

2) 서브섹터별 가중치(초기값)
  | 서브섹터 | revision | quality | value | cycle |
  | GPU      | 40 | 35 | 25 |  0 |
  | CPU      | 50 | 30 | 20 |  0 |
  | 메모리   | 40 | 15 | 20 | 25 |
  | 스토리지 | 35 | 20 | 35 | 10 |

3) 해석 규칙
- value가 높고 revision이 −1σ 미만이면 VALUE_TRAP 플래그
- quality 상승 + revision 상승이 동시에 +1σ 이상이면 QUALITY_MOMENTUM 플래그
- 하나증권 등 외부 리서치의 "영업이익률 역전 → 외인 수급" 같은 관계는 가설로만 기록하고,
  <DATA>로 상관을 확인한 경우에만 rationale_codes에 넣는다.

4) 산출
- 서브섹터별 롱 후보 1~2, 언더웨이트 후보 1
- 각 후보의 팩터 기여도 분해(가중치 × z)를 표로 제시

<DATA>
{재무제표 시계열, NTM 컨센서스, 밸류에이션 시계열, (선택) 한국 투자자별 매매동향}
</DATA>
```

**EN**

```text
[Prompt B — Subsector Multifactor: Earnings Momentum + Quality + Cycle-Aware Value]
{Common Contract, ROLE="Semiconductor sector quant analyst"}

Goal: For each subsector, build a score from the factor mix that actually explains stock
prices in that industry. Do not size positions.

1) Factor definitions (all subsector-neutral z-scores)
- revision: 3-month % change in NTM EPS
- quality: average of 3-year operating margin trend (slope), FCF margin,
  and net debt/EBITDA (lower is better)
- value: defined per subsector
    GPU, CPU: negative of NTM P/E z-score versus own 5-year history
    Memory:   negative of P/B z-score versus own 10-year history + EV / through-cycle average EBIT
              (avoids the trap where P/E looks cheapest at the cycle peak)
    Storage:  FCF yield
- cycle: reuse the cycle score from Prompt A
- flow_kr (optional, Korean listings only): 20-day cumulative foreign net buying / market cap.
  Do not compute for US names; use only to compare Korean names with each other.

2) Subsector weights (starting values)
  | Subsector | revision | quality | value | cycle |
  | GPU       | 40 | 35 | 25 |  0 |
  | CPU       | 50 | 30 | 20 |  0 |
  | Memory    | 40 | 15 | 20 | 25 |
  | Storage   | 35 | 20 | 35 | 10 |

3) Interpretation rules
- High value with revision below −1 sigma: flag VALUE_TRAP
- Quality and revision both above +1 sigma: flag QUALITY_MOMENTUM
- Relationships claimed by external research (e.g., "operating-margin crossover drives
  foreign flows") are recorded as hypotheses only, and enter rationale_codes only if the
  correlation is confirmed with <DATA>.

4) Output
- Per subsector: 1–2 long candidates and 1 underweight candidate
- A table decomposing each candidate's factor contributions (weight × z)

<DATA>
{financial statement series, NTM consensus, valuation series, (optional) Korean investor-type flow data}
</DATA>
```

---

## 5. 헤지펀드 관점 — 포트폴리오와 리스크

### 5.1 모멘텀 롱/숏 프롬프트 (헤지펀드)

**KR**

```text
[프롬프트 C — 크라우딩 조정 모멘텀 롱/숏]
{공통 계약, ROLE="시스템 롱/숏 모멘텀 펀드 PM"}

입력 신호: 프롬프트 A의 출력 JSON(scores, regime, risk_flags)을 그대로 받는다.

1) 후보 선정
- 롱: composite 상위 1/3 중 crowd_z < +2.5
- 숏: 다음 둘 중 하나
    (a) mom_12_1 하위 1/3 이고 revision < 0
    (b) DIVERGENCE_HIGH 이고 revision이 −0.5σ 미만
  → 3M 약세만으로는 숏하지 않는다(단기 조정 후 반등 위험).
- 숏 금지: days-to-cover > 5, 차입비용(borrow fee) 데이터 없음 또는 연 5% 초과,
  한국 상장 종목은 공매도 가능 여부·차입 가능 수량이 <DATA>에 없으면 숏 후보에서 제외

2) 크라우딩 점수 crowd_z (구성 요소별 z-score 평균, 데이터 지연을 함께 기록)
- 공매도 잔고/유동주식 (FINRA, 월 2회)
- days-to-cover
- 옵션 IV 1년 백분위, 25Δ 풋−콜 스큐
- 모멘텀·반도체 ETF(MTUM·SMH·SOXX) 보유 비중 변화 — 패시브 리밸런싱 플로우 프록시
- 13F 보유 헤지펀드 수 변화 (분기, 최대 45일 지연 — 단독 사용 금지, 가중치 최대 20%)

3) 사이징
- 종목 수: 롱 6~8, 숏 4~6
- 그로스: 롱 ≤ 120%, 숏 ≤ 70%
- 종목 상한: 롱 ≤ 20%, 숏 ≤ 12% (숏 스퀴즈 대비 숏 상한을 더 낮게)
- 기본 비중 ∝ 1/σ60 (60일 실현변동성 역수), 포트폴리오 목표 변동성 연 15%
- crowd_z 조정: +1.5~+2.0 → ×0.75, +2.0 이상 → ×0.5
- 서브섹터 순노출 |net| ≤ 25%, 종목 간 dual_exposure 반영해 순노출 계산

4) 리스크 트리거 (단계적)
- 펀드 자체 모멘텀 L/S 팩터 수익률: 5일 −5% → 그로스 −20%, 10일 −10% → 그로스 −40%
- 종목 변동성 비율 r = σ20/σ90 > 1.5 → 해당 종목 비중 × (1/r) (전량 청산 아님)
- 단일 종목 손절: 진입 후 −2.5 × σ20 × √5 (5일 기준 변동성 스탑)
- 재진입: 팩터 5일 수익률 > 0 이고 유니버스 중앙값 r < 1.2 가 3거래일 연속이면
  줄인 그로스의 50%씩 복원

5) 출력: positions 배열(비중·crowd_z·stop_rule·rationale_codes), 축소 트리거 현황,
   제약 위반 여부 체크리스트

<DATA>
{프롬프트 A 출력, 공매도 잔고, 차입비용, 옵션 데이터, ETF 보유 내역, 13F 집계, 일별 가격}
</DATA>
```

**EN**

```text
[Prompt C — Crowding-Adjusted Momentum Long/Short]
{Common Contract, ROLE="PM of a systematic long/short momentum fund"}

Input signals: take Prompt A's output JSON (scores, regime, risk_flags) as is.

1) Candidate selection
- Long: top third by composite with crowd_z < +2.5
- Short: either
    (a) bottom third by mom_12_1 and revision < 0, or
    (b) DIVERGENCE_HIGH and revision below −0.5 sigma
  -> Never short on 3-month weakness alone (risk of rebound after a short-term pullback).
- Short prohibited if: days-to-cover > 5; borrow fee missing or above 5% annualized;
  for Korean listings, short availability or borrowable quantity missing from <DATA>.

2) Crowding score crowd_z (average of component z-scores; record each component's data lag)
- Short interest / free float (FINRA, twice monthly)
- Days-to-cover
- Option IV 1-year percentile, 25-delta put-call skew
- Change in weight held by momentum and semiconductor ETFs (MTUM, SMH, SOXX)
  as a proxy for passive rebalancing flows
- Change in number of hedge funds holding per 13F (quarterly, up to 45-day lag;
  never used alone; max weight 20%)

3) Sizing
- Number of names: 6–8 long, 4–6 short
- Gross: long <= 120%, short <= 70%
- Per-name caps: long <= 20%, short <= 12% (tighter on shorts for squeeze risk)
- Base weight proportional to 1/sigma60 (inverse 60-day realized vol); portfolio target vol 15% annualized
- crowd_z adjustment: +1.5 to +2.0 -> ×0.75; +2.0 or higher -> ×0.5
- Subsector net exposure |net| <= 25%, computed with dual_exposure taken into account

4) Risk triggers (graduated)
- Fund's own momentum L/S factor return: −5% over 5 days -> cut gross 20%;
  −10% over 10 days -> cut gross 40%
- Stock vol ratio r = sigma20/sigma90 > 1.5 -> scale that position by (1/r) (not a full exit)
- Single-name stop: −2.5 × sigma20 × sqrt(5) from entry (5-day volatility stop)
- Re-entry: when the factor's 5-day return > 0 and the universe median r < 1.2
  for 3 consecutive trading days, restore 50% of the cut gross per step

5) Output: positions array (weight, crowd_z, stop_rule, rationale_codes),
   status of reduction triggers, and a constraint-violation checklist

<DATA>
{Prompt A output, short interest, borrow fees, options data, ETF holdings, 13F aggregates, daily prices}
</DATA>
```

### 5.2 멀티팩터 + 팩터 타이밍 + 테일 헤지 프롬프트 (헤지펀드)

**KR**

```text
[프롬프트 D — 반도체 멀티팩터: 팩터 타이밍 오버레이 + 테일 헤지 + 백테스트]
{공통 계약, ROLE="멀티팩터 퀀트 헤지펀드 리서처", MODE="codegen" 고정}
※ 백테스트는 LLM이 수행할 수 없으므로 반드시 코드로 출력한다.

1) 팩터 (서브섹터 중립 z-score, 월말 리밸런싱)
- momentum: mom_12_1
- value: 프롬프트 B의 서브섹터별 value 정의
- quality: FCF/총자산, 5년 EPS 변동성 역수
- low_vol: σ60 역수
- size: log(시가총액) — 노출 통제용, 수익 팩터로 쓰지 않음(목표 노출 0)

2) 기본 가중치: momentum 40 / value 20 / quality 20 / low_vol 20

3) 팩터 타이밍 오버레이 (히스테리시스 포함)
- 자체 모멘텀 L/S 팩터의 12개월 롤링 샤프 ≤ 0 이 2개월 연속 → momentum 20, low_vol 40
  롤링 샤프 > 0.3 이 2개월 연속 → 기본 가중치 복귀
- overlap = Jaccard(mom_12_1 상위 1/3, mom_3m 상위 1/3)
  overlap < (5년 평균 − 1σ) → momentum 가중치 × 0.5 (전면 제거하지 않음)

4) 테일 헤지
- 수단: SMH 또는 SOXX 3개월 풋 스프레드(행사가 현물 대비 −10% 매수 / −20% 매도), 월별 롤
- 예산: 연간 프리미엄 ≤ NAV의 1.5%
- 펀드 드로다운 −10% 도달 시 헤지 명목금액 × 2, 단 예산 상한 내에서

5) 백테스트 사양
- 데이터: 2020-01부터 (12개월 룩백 워밍업), 평가 구간 2021-01 ~ AS_OF
- 워크포워드: 파라미터는 2021~2024에서만 결정, 2025-01 ~ AS_OF는 아웃오브샘플
- 2026-07 모멘텀 붕괴 구간은 "스트레스 테스트"로 별도 보고하며 파라미터 튜닝에 사용 금지
- 결측: 상장 전 기간 N/A 처리, 생존편향 방지를 위해 상장폐지·분할 이력 반영
- 비용: 미국 수수료 3bp + 슬리피지 5bp, 한국 매도 시 거래세 별도 반영,
  숏은 차입비용 일할 반영, 옵션은 매수·매도 스프레드 절반 비용
- 보고: CAGR, 연 변동성, 샤프, 최대 드로다운, 칼마, 월 회전율,
  헤지 효율 = (스트레스 구간 손실 감소분) / (연 헤지 비용)

6) 출력
- Python 모듈: factors.py, timing.py, hedge.py, backtest.py (Qlib 또는 vectorbt 호환)
- 각 모듈 단위 테스트, 그리고 월별 팩터 가중치 테이블을 생성하는 함수

<DATA>
{데이터 스키마 설명만 제공: 컬럼명, 주기, 소스}
</DATA>
```

**EN**

```text
[Prompt D — Semiconductor Multifactor: Factor-Timing Overlay + Tail Hedge + Backtest]
{Common Contract, ROLE="Researcher at a multifactor quant hedge fund", MODE fixed to "codegen"}
Note: an LLM cannot run a backtest, so the output must be code.

1) Factors (subsector-neutral z-scores, month-end rebalancing)
- momentum: mom_12_1
- value: the per-subsector value definition from Prompt B
- quality: FCF / total assets, inverse of 5-year EPS volatility
- low_vol: inverse of sigma60
- size: log(market cap) — for exposure control only, not a return factor (target exposure 0)

2) Base weights: momentum 40 / value 20 / quality 20 / low_vol 20

3) Factor-timing overlay (with hysteresis)
- If the 12-month rolling Sharpe of the fund's own momentum L/S factor is <= 0 for
  2 consecutive months -> momentum 20, low_vol 40.
  If it is > 0.3 for 2 consecutive months -> revert to base weights.
- overlap = Jaccard(top third by mom_12_1, top third by mom_3m)
  If overlap < (5-year mean − 1 sigma) -> momentum weight × 0.5 (do not remove entirely)

4) Tail hedge
- Instrument: 3-month put spread on SMH or SOXX (buy strike −10% from spot, sell −20%), rolled monthly
- Budget: annual premium <= 1.5% of NAV
- When fund drawdown reaches −10%, double hedge notional, within the budget cap

5) Backtest specification
- Data from 2020-01 (12-month lookback warm-up); evaluation window 2021-01 to AS_OF
- Walk-forward: set parameters using 2021–2024 only; 2025-01 to AS_OF is out-of-sample
- Report the 2026-07 momentum crash separately as a stress test; never use it for parameter tuning
- Missing data: N/A before listing; include delisting and spin-off history to avoid survivorship bias
- Costs: US commission 3 bp + slippage 5 bp; Korean sell-side transaction tax applied separately;
  short borrow cost accrued daily; options charged half the bid-ask spread
- Report: CAGR, annualized vol, Sharpe, max drawdown, Calmar, monthly turnover,
  hedge efficiency = (loss reduction in stress window) / (annual hedge cost)

6) Output
- Python modules: factors.py, timing.py, hedge.py, backtest.py (Qlib- or vectorbt-compatible)
- Unit tests for each module, plus a function that produces the monthly factor-weight table

<DATA>
{schema description only: column names, frequency, sources}
</DATA>
```

---

## 6. 두 관점 통합 프롬프트

업계의 사이클 판단을 헤지펀드의 크라우딩 허용치로 연결한다. 원본의 "HBM 재고일수"는 공개 시계열이 없으므로 프롬프트 A의 국면 판정으로 대체했다.

**KR**

```text
[프롬프트 E — 사이클 국면 → 크라우딩 허용치 연결]
{공통 계약, ROLE="산업 리서치와 리스크를 함께 보는 포트폴리오 매니저"}

입력: 프롬프트 A 출력(regime), 프롬프트 C의 crowd_z

규칙: 국면에 따라 프롬프트 C의 크라우딩 축소 임계값을 바꾼다.
  | regime | ×0.75 시작 | ×0.5 시작 | 롱 후보 제외 |
  | R1     | +2.0 | +2.5 | +3.0 |
  | R2     | +2.0 | +2.5 | +3.0 |
  | R3     | +1.0 | +1.5 | +2.0 |
  | R4     | +0.5 | +1.0 | +1.5 |
  | N/A    | +1.5 | +2.0 | +2.5 |
- R3·R4에서는 메모리·스토리지 롱 그로스 합계를 40%로 추가 제한한다.
- 국면이 바뀐 달에는 새 임계값을 50%만 반영하고 다음 달 100% 반영한다(급격한 회전 방지).

출력: 국면별로 조정된 positions와 "국면 전환이 포트폴리오에 준 변화" 요약 5줄 이내
```

**EN**

```text
[Prompt E — Linking Cycle Regime to Crowding Tolerance]
{Common Contract, ROLE="Portfolio manager covering both industry research and risk"}

Inputs: regime from Prompt A output, crowd_z from Prompt C

Rule: adjust Prompt C's crowding reduction thresholds by regime.
  | regime | ×0.75 from | ×0.5 from | exclude from longs |
  | R1     | +2.0 | +2.5 | +3.0 |
  | R2     | +2.0 | +2.5 | +3.0 |
  | R3     | +1.0 | +1.5 | +2.0 |
  | R4     | +0.5 | +1.0 | +1.5 |
  | N/A    | +1.5 | +2.0 | +2.5 |
- In R3 and R4, additionally cap combined memory + storage long gross at 40%.
- In the month a regime changes, apply the new thresholds at 50%, then 100% the following month
  (prevents abrupt rotation).

Output: regime-adjusted positions and a summary of no more than 5 lines on how the regime
change altered the portfolio.
```

---

## 7. 서브섹터별 체크포인트

| 서브섹터 | 업계 전문가가 추가로 볼 것 | 헤지펀드가 추가로 볼 리스크 |
|---|---|---|
| GPU/가속기 | 하이퍼스케일러 CAPEX 가이던스 변화, 커스텀 ASIC 비중 확대, 수출 규제 이벤트 | 대형 단일 종목 쏠림(ETF·지수 비중), 이벤트 갭(실적·규제) |
| CPU | 데이터센터 CPU 점유율, 에이전틱 AI에 따른 CPU 수요 서사의 실적 반영 여부 | 고 P/E 종목의 이익수정 하향 시 밸류 압축 속도 |
| 메모리 | DRAM/NAND 계약가, 재고일수, HBM 차기 연도 물량 협상 언급, CAPEX/매출 z-score | 사이클 피크 논쟁, 공매도 잔고 급증, 한국 종목 환율·공매도 제도 |
| 스토리지 | NAND 가격 사이클, 니어라인 HDD 수급, FCF 마진, 52주 고점 대비 거리 | 모멘텀 ETF 리밸런싱 편입·편출 플로우, 신규 상장 종목의 짧은 이력 |

---

## 8. 데이터 소스 매핑

| 데이터 | 무료/저가 소스 | 기관용 소스 |
|---|---|---|
| 가격·총수익률 | yfinance, KRX 정보데이터시스템 | Bloomberg, Refinitiv |
| NTM EPS 컨센서스 | 제한적(웹 스크래핑) | I/B/E/S, FactSet |
| 재무제표·재고일수 | SEC EDGAR(10-Q/10-K), DART | Compustat |
| DRAM/NAND 계약가 | 공개 요약 기사 | TrendForce(DRAMeXchange) |
| 공매도 잔고 | FINRA, KRX 공매도 통계 | S&P Global(구 IHS Markit) 증권대차 |
| 옵션 IV·스큐 | 브로커 API | OptionMetrics, ORATS |
| 13F | SEC EDGAR | WhaleWisdom 등 집계 서비스 |
| 실적 콜 텍스트 | 회사 IR 페이지 | 전문 트랜스크립트 서비스 |

권장 파이프라인: 데이터 수집 → 프롬프트 D(`codegen`)로 팩터·백테스트 코드 생성 → Qlib 등 백테스트 엔진 실행 → 결과 JSON을 다시 프롬프트 A~C(`compute`)에 넣어 해석·포지션 산출. LLM은 규칙 작성과 해석을, 계산은 엔진이 맡는다.

---

## 9. 원본 → v2 변경 요약

| 항목 | 원본 | v2 |
|---|---|---|
| 프롬프트 수 | 4 + 통합 1 | 공통 계약 1 + 4 + 통합 1, 각각 한국어·영어 |
| 시점 처리 | 2026년 사건 본문 삽입 | `AS_OF` 변수, 사건은 스트레스 시나리오 |
| 유니버스 | 7종목 | 코어 8 + 확장 9, 중립화 규칙 |
| 국면 | 2개 | 4개 + N/A, 상대 임계값 |
| 이익 기준 | 6M 이익수정률(FY 기준 불명) | NTM EPS 3M 변화율 |
| 메모리 밸류 | 선행 P/E | P/B + EV/사이클 평균 EBIT |
| 사이징 | 160/80, 4종목, 15% 상한(모순) | 120/70, 롱 6~8·숏 4~6, 롱 20%·숏 12% 상한 |
| 숏 조건 | 3M 하위 20% 강제 편입 | 약세 + 이익수정 하향 동시 충족 |
| 변동성 트리거 | 전량 청산 | 1/r 비례 축소 + 재진입 |
| 백테스트 | 2022~2026 단일 구간 | 워크포워드 + 스트레스 구간 분리 |
| 헤지 | SOX 풋, 예산 없음 | SMH/SOXX 풋 스프레드, NAV 1.5% 예산 |
| 출력 | 자유 서술 | JSON 스키마 |

---

> **고지:** 이 문서는 프롬프트 설계와 연구 방법론에 관한 자료이며 특정 종목의 매매를 권유하지 않는다. 모든 가중치·임계값은 초기값으로, 실제 운용 전 독립적인 검증이 필요하다.
