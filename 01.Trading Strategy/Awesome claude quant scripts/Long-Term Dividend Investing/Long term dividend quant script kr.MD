# Long-Term Dividend Investing — Claude Quant Scripts

## *Awesome Claude Quant Scripts*에 추가되는 9번째 전략

> *"The single greatest edge an investor can have is a long-term orientation."*
> *"투자자가 가질 수 있는 가장 큰 우위는 장기적 시야다."*
> — Seth Klarman

> *"Do you know the only thing that gives me pleasure? It's to see my dividends coming in."*
> *"내게 기쁨을 주는 단 한 가지가 무엇인지 아는가? 내 배당금이 들어오는 것을 보는 일이다."*
> — John D. Rockefeller

---

##  본 문서의 위치

본 문서는 [Awesome Claude Quant Scripts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD)의 8대 전략(Value · Growth · Quality · Momentum · Multi-Factor · Trend Following · Statistical Arbitrage · Machine Learning)에 추가되는 **9번째 전략 — 장기 배당 투자(Long-Term Dividend Investing)** 입니다.

다른 전략들이 단기-중기 알파를 추구한다면, 이 전략은 **시간을 친구로 삼는 전략**입니다. Warren Buffett, Charlie Munger, Geraldine Weiss(시카고 IDS의 *Dividends Don't Lie* 저자)가 평생을 걸쳐 입증한 접근법이며, 학계에서는 Robert Arnott, Cliff Asness 등이 *yield premium*과 *quality premium*의 결합으로 설명합니다.

---

## 1. 이론적 배경 (Theory Layer)

### 1.1. 학계의 핵심 발견

| 출처 | 핵심 발견 |
|------|----------|
| **Fama & French (1988)**, *Journal of Finance* — *Dividend Yields and Expected Stock Returns* | 배당수익률이 미래 수익률 예측력을 가진다 |
| **Litzenberger & Ramaswamy (1979)**, *Journal of Financial Economics* | 세후 기준 고배당주가 위험조정 후 우수한 수익률 |
| **Arnott & Asness (2003)**, *Financial Analysts Journal* — *Surprise! Higher Dividends = Higher Earnings Growth* | 배당 성향이 높을수록 *오히려* 향후 EPS 성장률이 높음 — 직관과 반대 |
| **Novy-Marx (2013)**, *Journal of Financial Economics* — *The Other Side of Value* | 매출총이익률(GP/A)이 배당의 지속가능성을 결정하는 핵심 |
| **Asness, Frazzini, Pedersen (2019)** — *Quality Minus Junk* | Quality factor 정의에 *Profitability·Growth·Safety·Payout*이 포함됨 |

### 1.2. Dividend Aristocrats의 실증적 증거

**S&P 500 Dividend Aristocrats Index** (1989년 출범)는 25년 이상 연속 배당을 *증액*해온 S&P 500 기업들로 구성됩니다. 2026년 1월 기준 **69개 기업**(역대 최다)이 포함되어 있습니다.

#### 역사적 실증 데이터

| 기간 | Aristocrats Index | S&P 500 |
|------|-----------------|---------|
| 2008 금융위기 (단년) | -21.88% | -37.00% |
| 2000-2003 닷컴 붕괴 | 우월 | 열위 |
| 2022 인플레이션 충격 | 우월 | 열위 |
| 1989-2025 장기 (CAGR) | 약 1-2%p 우월 | — |
| 변동성 (표준편차) | 더 낮음 | 더 높음 |

**핵심 통찰**: Aristocrats는 *상승장에서 시장을 따라가고, 하락장에서 덜 떨어진다* — 이것이 장기 복리에서 우위를 만드는 메커니즘입니다.

#### 25년 연속 배당 증액의 의미

25년 연속 *증액*하려면 다음 모든 위기를 *배당을 깎지 않고* 통과해야 합니다:

- 1997 아시아 금융위기
- 2000-2002 닷컴 붕괴
- 2008-2009 글로벌 금융위기
- 2020 COVID-19 팬데믹
- 2022 인플레이션-금리 충격

이는 다음을 의미합니다:
1. **지속 가능한 free cash flow** (자유현금흐름)
2. **자본 배분 규율** (capital allocation discipline)
3. **경영진의 주주 약속 의식**
4. **불황에 견디는 비즈니스 모델**

### 1.3. 사후 데이터로 본 섹터 분포 (2026)

Dividend Aristocrats 69개 기업의 섹터별 분포:

```
Industrials              16개  (23%)  — 고전 산업, 자본재
Consumer Staples         15개  (22%)  — 식품, 음료, 가정용품
Materials                 9개  (13%)  — 화학, 산업가스
Financials                8개  (12%)  — 보험, 자산운용
Healthcare                7개  (10%)  — 제약, 의료기기
Consumer Discretionary    5개   (7%)  — 가맹점, 자동차
Utilities                 4개   (6%)  — 전기, 가스
Real Estate               2개   (3%)  — REIT
Energy                    2개   (3%)  — 통합 에너지
Information Technology    1개   (1%)  — IT (가장 적음)
```

**Information Technology가 단 1개(IBM)**라는 사실에 주목해야 합니다. S&P 500의 IT 비중이 27%인 것과 대비됩니다. 이는:
- IT 기업들은 배당보다 자사주 매입 + 재투자를 선호
- Aristocrats는 *근본적으로 안정적, 정통 가치주* 카테고리
- AI/기술 랠리에서는 *언더퍼폼*하나, 위기 시 *아웃퍼폼*

### 1.4. 핵심 함정과 단서조항 ⚠️

**(1) Yield Trap (고배당 함정)**
배당수익률이 *비정상적으로 높은* 종목은 주가 폭락의 결과인 경우가 많습니다. AT&T가 대표 사례 — 8% 배당으로 매력적이었지만 결국 배당 컷.

**(2) Payout Ratio (배당성향) 위험**
Net Income 대비 배당이 80%를 초과하면 *지속 불가능* 신호입니다. 70% 이하가 안전 영역입니다.

**(3) Aristocrat 지위 박탈 사례**
- **3M (MMM)**: 2024년 Solventum 분사로 배당 streak 끊김
- **AT&T**: 통신산업 전체적으로 자본 부담 누적
- 즉, *과거의 Aristocrat이 영원하지 않습니다*

**(4) Tax considerations**
한국 거주자가 미국 배당 수령 시 *15% 원천징수* + 한국 종합소득세 적용. 절세를 위해 ISA, 연금저축펀드 활용 검토 필수.

**(5) 인플레이션 리스크**
배당 증가율이 *인플레이션을 상회*해야 실질 구매력 유지. 2022년 9% 인플레이션 시기에 4% 배당 증가는 *실질 -5%*.

---

## 2. 배당 ETF 옵션 (Implementation Layer 1)

### 2.1. 핵심 6개 ETF 비교 (2026년 4월 기준)

| Ticker | 풀네임 | 배당수익률 | 운용보수 | 보유종목 수 | 핵심 특징 |
|--------|-------|-----------|---------|------------|----------|
| **SCHD** | Schwab US Dividend Equity ETF | ~3.5-3.8% | **0.06%** | 102 | Dow Jones US Dividend 100 추적, 가장 인기 |
| **VYM** | Vanguard High Dividend Yield ETF | ~2.4% | **0.06%** | 450+ | 가장 광범위한 분산 |
| **VIG** | Vanguard Dividend Appreciation ETF | ~1.7% | **0.04%** | 339 | 배당 *증가* 중심, 기술주 비중 ↑ |
| **DGRO** | iShares Core Dividend Growth ETF | ~2.1% | **0.08%** | 400+ | 10년 배당 증액 + 균형 |
| **NOBL** | ProShares S&P 500 Dividend Aristocrats | ~2.3% | 0.35% | 69 | Aristocrats 전용, 균등 비중 |
| **JEPI** | JPMorgan Equity Premium Income | ~7.5% | 0.35% | 100+ | 콜옵션 라이팅, 월 배당 |

### 2.2. ETF 선택 가이드

```
투자 목적별 추천 매트릭스:

┌─────────────────────────────────┬──────────────────────────┐
│ 투자자 프로파일                  │ 추천 ETF                 │
├─────────────────────────────────┼──────────────────────────┤
│ 즉시 현금흐름 필요 (은퇴 임박)   │ SCHD, JEPI, SPHD         │
│ 장기 복리 (10년 이상)            │ VIG, DGRO                │
│ 최저 비용 + 최대 분산             │ VYM (0.06%, 450+ 종목)  │
│ Aristocrat 순수 노출              │ NOBL                     │
│ 월 배당 (paycheck 대체)           │ JEPI, SPHD, DIVO         │
│ 변동성 회피 (보수적)              │ NOBL, SPHD               │
└─────────────────────────────────┴──────────────────────────┘
```

### 2.3. 권장 ETF 포트폴리오 3종

#### 포트폴리오 A: 장기 성장형 (10년+ 시야)
```
50% VIG    — 배당 증가 중심
30% SCHD   — 퀄리티 + 성장 균형
20% DGRO   — 추가 분산

예상 시작 yield: 약 2.2%
예상 dividend growth: 7-9% 연간
적정 시야: 20년+
```

#### 포트폴리오 B: 균형형 (5-10년)
```
35% SCHD   — 핵심 보유
25% NOBL   — 안정성 (Aristocrats)
20% SPYD   — 고배당 부스터
20% 국제 배당 ETF (예: VIGI, VYMI) — 지역 분산

예상 시작 yield: 약 3.5%
예상 dividend growth: 5-7% 연간
적정 시야: 5-15년
```

#### 포트폴리오 C: 즉시 현금흐름형 (은퇴자)
```
40% SCHD   — 안정 핵심
30% JEPI   — 월 배당, 옵션 프리미엄
20% VYM    — 분산
10% 채권 ETF (BND 또는 VCIT) — 변동성 완충

예상 시작 yield: 약 5%
예상 dividend growth: 3-5% 연간
적정 시야: 즉시-10년
```

---

## 3. 섹터별 배당주 분석 (Implementation Layer 2)

### 3.1. 섹터별 배당 성향 ranking

S&P 500 + NASDAQ 기준, **배당 성향이 강한 섹터** 순위:

| 순위 | 섹터 | 평균 배당수익률 | 대표 Aristocrats | 특징 |
|------|------|---------------|----------------|------|
| 1 | **Utilities (유틸리티)** | 3.5-4.5% | NEE, SO, ES, ATO | 규제 산업, 안정적 cash flow |
| 2 | **Consumer Staples (필수소비재)** | 2.5-3.5% | KO, PG, CL, PEP, KMB, WMT | 인플레이션 가격전가력 |
| 3 | **Real Estate (REITs)** | 4.0-6.0% | O, FRT, ESS | 90% 이익 분배 의무 |
| 4 | **Energy (에너지)** | 3.0-5.0% | CVX, XOM | 사이클 의존, 원유 가격 변동 |
| 5 | **Financials (금융)** | 2.5-4.0% | CINF, AFL, T-Rowe | 자산운용, 보험 |
| 6 | **Industrials (산업재)** | 2.0-3.0% | MMM, GD, LMT, ITW, EMR | 자본재, 안정 cash flow |
| 7 | **Healthcare (헬스케어)** | 2.0-3.0% | JNJ, ABBV, MDT, MCD | 제약 + 의료기기 |
| 8 | **Materials (소재)** | 2.0-3.5% | APD, LIN, ECL | 화학, 산업가스 |
| 9 | **Consumer Discretionary** | 1.5-2.5% | TGT, HD, MCD, GPC | 소비 사이클 의존 |
| 10 | **Information Technology** | 0.5-2.0% | IBM, MSFT, AAPL | 자사주 매입 선호 |

### 3.2. 섹터별 대표 종목 상세

#### 🔌 Utilities — 가장 안정적 배당 섹터

규제 산업 특성상 *현금흐름이 예측 가능*하며, 위기 시 *전기·가스 수요는 비탄력적*입니다.

| 종목 | 티커 | 특징 | Aristocrat 여부 |
|------|------|------|----------------|
| NextEra Energy | NEE | 미국 최대 재생에너지 유틸리티 | Yes |
| Southern Company | SO | 동남부 전력 + 가스 | 2026 신규 예정 |
| Eversource Energy | ES | 뉴잉글랜드 최대 유틸리티 | Yes (2025 신규) |
| Atmos Energy | ATO | 천연가스 유틸리티 | Yes |
| Consolidated Edison | ED | 뉴욕시 전력, 50년+ 증액 | Yes (Dividend King) |

####  Consumer Staples — 인플레이션 헤지

음식, 음료, 가정용품 — *경기와 무관한 수요*. 인플레이션 시 *가격 전가력*이 핵심 우위.

| 종목 | 티커 | 특징 | 연속 증액 |
|------|------|------|----------|
| Coca-Cola | KO | 글로벌 음료 #1, Buffett 핵심 보유 | 62년 (Dividend King) |
| Procter & Gamble | PG | Tide, Pampers, Gillette | 68년 (Dividend King) |
| Colgate-Palmolive | CL | 치약, 가정용품 | 61년 (Dividend King) |
| PepsiCo | PEP | Pepsi + Frito-Lay (스낵) | 52년+ |
| Walmart | WMT | 유통 대형마트 | 50년+ |
| Kimberly-Clark | KMB | Kleenex, Huggies | 50년+ |

####  Healthcare — 인구 고령화 수혜

의료비 지출은 *인플레이션을 상회*하는 장기 추세를 보입니다. 또한 *고령화 사회에서 수요 증가*가 보장됩니다.

| 종목 | 티커 | 특징 | 연속 증액 |
|------|------|------|----------|
| Johnson & Johnson | JNJ | 제약 + 의료기기 종합, AAA 등급 | 62년 (Dividend King) |
| AbbVie | ABBV | Humira, Botox 보유 | 50년+ (모기업 시간 포함) |
| Medtronic | MDT | 의료기기 글로벌 리더 | 47년+ |
| Becton Dickinson | BDX | 주사기, 진단 기기 | 50년+ |

####  Industrials — 미국 제조업 backbone

자본재, 방위산업, 산업 자동화 — *경기 사이클 영향을 받지만, Aristocrats는 그 사이클을 견뎌냄*.

| 종목 | 티커 | 특징 | 연속 증액 |
|------|------|------|----------|
| General Dynamics | GD | 방위산업 + 항공 (Gulfstream) | 32년+ |
| Lockheed Martin | LMT | 방위산업 #1 (F-35) | 22년+ (Aristocrat 후보) |
| Illinois Tool Works | ITW | 다각화된 산업 자동화 | 60년+ |
| Emerson Electric | EMR | 자동화 + 측정 기기 | 67년+ (Dividend King) |
| Caterpillar | CAT | 건설 + 광업 장비 | 30년+ |
| Roper Technologies | ROP | 고품질 산업 SaaS | 31년+ |
| Automatic Data Processing | ADP | 급여 처리 + HR 솔루션 | 49년+ |

####  Financials — 자산운용 + 보험

뱅킹은 사이클 영향이 크지만, *자산운용 + 손해보험*은 상대적으로 안정.

| 종목 | 티커 | 특징 | 연속 증액 |
|------|------|------|----------|
| T. Rowe Price | TROW | 자산운용, 5.5% yield | 39년+ |
| Aflac | AFL | 보충 보험 (미국 + 일본) | 41년+ |
| Cincinnati Financial | CINF | 손해보험, 60년+ | 64년+ (Dividend King) |
| Chubb | CB | 글로벌 손해보험 | 31년+ |
| S&P Global | SPGI | 신용등급 + 인덱스 | 52년+ |

####  Energy — 사이클이 있으나 yield 강력

| 종목 | 티커 | 특징 | 연속 증액 |
|------|------|------|----------|
| Chevron | CVX | 통합 에너지, 5.5% yield | 36년+ |
| ExxonMobil | XOM | 글로벌 에너지 #1 | 41년+ |

####  Real Estate (REITs) — 90% 이익 분배 의무

REIT는 법적으로 이익의 90% 이상을 배당으로 지급해야 합니다.

| 종목 | 티커 | 특징 | 연속 증액 |
|------|------|------|----------|
| Realty Income | O | "월 배당 회사", 리테일 임대 | 30년+ (월 배당!) |
| Federal Realty | FRT | 쇼핑센터 REIT | 56년+ (REIT 중 최장) |
| Essex Property Trust | ESS | 서부 해안 아파트 | 30년+ |

### 3.3. 섹터 분산 권장 배분

```
보수적 모델 (변동성 최소화):
   Consumer Staples  25%
   Utilities        20%
   Healthcare       20%
   Industrials      15%
   Financials       10%
   Real Estate (REIT) 10%

균형 모델 (총수익 + 안정):
   Industrials        20%
   Consumer Staples  20%
   Healthcare        15%
   Financials        15%
   Utilities         10%
   Materials         10%
   Real Estate       5%
   Energy            5%

소득 모델 (yield 극대화):
   Utilities         25%
   Real Estate       25%
   Energy            15%
   Consumer Staples  15%
   Financials        10%
   Healthcare        10%
```

---

## 4. Claude 프롬프트 템플릿 (AI Collaboration Layer)

### 4.1. T-DIV-1: Dividend Aristocrats 백테스트

```
당신은 퀀트 애널리스트입니다. 아래 스펙으로 배당 Aristocrats 백테스트 코드를 Python으로 작성해주세요.

[UNIVERSE]    : 2026년 1월 기준 S&P 500 Dividend Aristocrats 69개 종목
                (yfinance ticker symbols)
[REBALANCING] : 분기별 (1월, 4월, 7월, 10월 첫 거래일)
[WEIGHTING]   : 동일 가중 (NOBL ETF와 동일한 방법)
                대안 1: dividend yield 가중
                대안 2: 5년 dividend growth rate 가중
[PERIOD]      : 2010-01-01 ~ 오늘
[BENCHMARK]   : S&P 500 Total Return Index (^SP500TR) 또는 SPY
                + Dividend Aristocrats ETF (NOBL)
[FILTERS]     : 
   - Payout Ratio < 80% (지속 가능성)
   - Dividend Yield > 1.5% (yield trap이 아닌)
   - Market Cap > $5B
   - 연속 dividend 증액 streak ≥ 25년
[METRICS]     :
   - Total Return (배당 재투자 가정)
   - 배당 income (연도별 누적)
   - Yield on Cost (10년차, 20년차)
   - Maximum Drawdown
   - Sharpe Ratio
   - 2008, 2020, 2022 위기 시 drawdown 비교
[OUTPUT]      :
   - matplotlib 누적 수익률 차트 (Aristocrats vs S&P 500)
   - 연도별 dividend 수령액 bar chart
   - drawdown curve
   - performance summary table

다음을 주석으로 명시할 것:
- 룩어헤드 편향 방지 (Aristocrat 자격은 *해당 시점*에 만족된 종목만 사용)
- Survivorship bias 경고 (3M 같은 박탈 케이스)
- 배당 재투자 가정의 단순화
- 세금은 별도 (한국 거주자 기준 15% 원천징수 + 종합소득세 고려)
- 거래비용은 별도 (분기 리밸런싱 시 슬리피지 0.05% 가정 옵션)

라이브러리: pandas, numpy, yfinance, matplotlib, dataframe_image
```

### 4.2. T-DIV-2: 섹터별 배당 ETF 포트폴리오 구성

```
당신은 자산배분 컨설턴트입니다. 아래 스펙으로 섹터 분산 배당 ETF 포트폴리오를 구성해주세요.

[INVESTOR PROFILE]:
   - 30대 한국 거주자
   - 투자 시야: 20년+
   - 위험 허용도: 중상
   - 환율 헤지: 미적용 (USD 익스포저 수용)
   - 세금 계좌: 일반 위탁계좌 + ISA 일부 활용

[PORTFOLIO CONSTRAINTS]:
   - Total: 100% USD 자산
   - 핵심 ETF (Core): 60-70%
   - 위성 ETF (Satellite): 30-40%
   - 단일 ETF 최대 비중: 35%
   - 섹터별 단일 종목 최대 비중: 5%

[PROPOSED ALLOCATION]:
   Core (65%):
      VIG     30%   # 배당 증가 중심
      SCHD    25%   # 퀄리티 균형
      DGRO    10%   # 분산
   
   Satellite (35%):
      Sector ETF 그룹:
         XLU     7%   # Utilities
         XLP     7%   # Consumer Staples
         VHT     6%   # Healthcare
      Individual Aristocrats 그룹:
         JNJ     5%   # Healthcare anchor
         KO      4%   # Consumer Staples
         O       3%   # REIT, 월 배당
         CVX     3%   # Energy

[DELIVERABLES]:
   1. 종목별 비중 + 예상 배당수익률
   2. 섹터 분포 + S&P 500 대비 차이 (overweight/underweight)
   3. 1년 / 5년 / 10년 / 20년 시뮬레이션
      - 시나리오 A: 배당 재투자, 5% capital appreciation
      - 시나리오 B: 배당 출금, 3% capital appreciation
      - 시나리오 C: 2008/2020 같은 -30% drawdown 가정
   4. yield on cost 진화 그래프
   5. 한국 거주자 세금 차감 후 실질 수익률
      - 미국 원천징수 15%
      - 한국 종합소득세 (배당 + 이자 합계 2,000만원 초과 시)
   6. 예상 monthly cashflow (배당 출금 시)

[CONSTRAINTS]:
   - 환율 변동성 명시 (USD/KRW)
   - 한국 거주자의 외환거래법 준수 사항
   - 해외주식 양도소득세 22% 안내

코드는 Python pandas + matplotlib로 작성. JSON output 옵션 추가.
```

### 4.3. T-DIV-3: Dividend Quality Score 스크리닝

```
당신은 퀀트 스크리너 개발자입니다. 아래 정의된 Dividend Quality Score를 기반으로 S&P 500 + NASDAQ 100 종목을 스크리닝해주세요.

[DIVIDEND QUALITY SCORE 정의]:
   각 종목에 대해 0-100점으로 평가:
   
   1. Yield Score (20점):
      - 1.5% < yield < 6.0%: full points
      - yield > 6.0%: yield trap 의심, 점수 차감
      - yield < 1.5%: 너무 낮음
   
   2. Payout Ratio Score (20점):
      - 30-60%: full points
      - 60-75%: 절반 점수
      - 75% 초과: 경고 점수
   
   3. Dividend Growth Score (20점):
      - 5년 CAGR > 10%: full points
      - 5-10%: 비례 점수
      - <0%: 페널티
   
   4. Consecutive Years Score (20점):
      - 50년+ (Dividend King): 20점
      - 25-49년 (Aristocrat): 15점
      - 10-24년: 10점
      - 5-9년: 5점
      - <5년: 0점
   
   5. Quality Score (20점) — Novy-Marx 기반:
      - Gross Profitability (GP/Assets) > 0.30
      - ROE > 15%
      - Debt/Equity < 1.0
      - Free Cash Flow Yield > 5%
      - 각 항목 5점, 합 20점

[FILTER]:
   - Total Score ≥ 75 (상위 quartile만)
   - Market Cap > $10B
   - Average Daily Volume > $50M

[OUTPUT]:
   - 정렬된 Top 50 list (스코어 내림차순)
   - 섹터별 분포
   - 각 종목 상세:
      * 5개 sub-score 시각화 (radar chart)
      * 10년 dividend history
      * forward yield + payout ratio + dividend safety score
   - Excel/CSV export
   - 한국어 요약 리포트 자동 생성

[DATA SOURCES]:
   - yfinance (가격 + 기본 fundamentals)
   - 보조: financialmodelingprep API or AlphaVantage (free tier)
   - SimplySafeDividends API (paid, 옵션)

코드 구조:
   - DividendScreener 클래스
   - score_yield(), score_payout(), score_growth() 등 메서드
   - aggregate_score() 종합
   - export_to_excel()

룩어헤드 편향 방지 주석 필수.
```

### 4.4. T-DIV-4: DRIP (Dividend Reinvestment) 시뮬레이터

```
당신은 financial planner입니다. 아래 스펙으로 DRIP 시뮬레이터를 만들어주세요.

[USE CASE]:
   사용자가 매월 일정 금액을 배당주 포트폴리오에 적립하고,
   받은 배당을 자동 재투자할 때
   N년 후 자산과 yield on cost를 시뮬레이션

[USER INPUTS]:
   - 초기 투자금: $10,000
   - 월 적립금: $1,000
   - 적립 기간: 20년
   - 포트폴리오: SCHD 50%, VIG 30%, DGRO 20%
   - 배당 재투자: 100% (DRIP)
   - 인플레이션 가정: 3% 연
   - 주가 capital appreciation: 5% 연 (보수적) / 7% (중립) / 9% (낙관)

[CALCULATIONS]:
   각 월별로:
   1. 새 적립금 + 배당 수령액 = 신규 매수 가능 금액
   2. 포트폴리오 비중 유지하며 매수
   3. 보유 주식 수 증가
   4. 다음 달 배당은 (보유 주식 × 분기당 배당) / 3
   5. 가격은 매월 (1.07)^(1/12) ≈ +0.565% 가정 (중립 시나리오)

[OUTPUTS]:
   1. 누적 자산 그래프 (월별)
   2. 누적 배당 수령액 그래프
   3. Yield on Cost 진화 (1년, 5년, 10년, 20년 시점)
   4. Total Return vs Pure Capital Appreciation 비교
      → 배당 재투자가 만든 추가 수익 quantify
   5. 인플레이션 조정 후 실질 수익
   6. 20년 후 monthly cashflow (만약 배당 출금 시작)

[VISUALIZATION]:
   - matplotlib stacked area chart (Principal vs Reinvested Dividends)
   - 핵심 milestone 표기 (10년차 자산, 20년차 yield on cost)

[ADDITIONAL FEATURES]:
   - 시나리오 비교 (보수/중립/낙관 + 적립 중단 시나리오)
   - 한국 거주자 모드 (15% 원천징수 + 종합소득세 반영)
   - Streamlit web UI 옵션 코드도 함께 제공

코드는 단일 .py 파일로, 실행 즉시 sample plot 출력.
주석 풍부하게.
```

### 4.5. T-DIV-5: Yield Trap Detector

```
당신은 리스크 분석가입니다. 아래 정의된 Yield Trap (배당 함정) 탐지 알고리즘을 구현해주세요.

[Yield Trap 정의]:
   배당수익률이 *비정상적으로 높아 보이는* 종목 중,
   실제로는 배당 컷이 임박했거나, 주가 폭락의 결과인 경우

[탐지 시그널]:
   다음 중 ≥3개 충족 시 RED FLAG, ≥2개는 YELLOW FLAG:
   
   1. Yield > 6.0% AND yield > 자기 산업 평균의 2배
   2. Payout Ratio > 90% (TTM EPS 기준)
   3. Free Cash Flow < Dividend payment (1년 이상 지속)
   4. 주가 -30% in past 12 months
   5. Earnings revision (analyst estimate 하향) -10% in past 90 days
   6. Debt/EBITDA > 4.0
   7. Interest Coverage < 3.0
   8. 1년 내 배당 컷한 historical patterns 보유 (예: 한 번이라도 컷 한 적 있음)
   9. CDS spread 상승 (회사채 stress)
   10. Insider selling > Insider buying (지난 3개월)

[INPUT]:
   - Target ticker list 또는 entire S&P 500
   - Optional: 사용자 정의 임계값

[OUTPUT]:
   1. 각 종목의 시그널 점수 (0-10)
   2. RED / YELLOW / GREEN 분류
   3. 이유 명시 (어떤 시그널이 발동되었는지)
   4. 역사적 검증:
      - AT&T (2022 배당 컷): 미리 시그널 발동 여부?
      - GE (2017): 시그널 발동?
      - Wells Fargo (2020): 시그널 발동?
   5. CSV export with full signals

[BACKTEST]:
   2010-2025 기간 동안 RED FLAG 종목들이
   1년 후 평균 -X% 수익률 보였는지 검증

룩어헤드 편향 방지 (각 시점에서 알 수 있는 정보만 사용).
False Positive 비율 명시.
```

---

## 5. 자기 점검 체크리스트

### 5.1. 백테스트 시 반드시 확인할 것

- [ ] **Survivorship Bias**: 현재 Aristocrat 리스트가 *과거 어느 시점에서도 Aristocrat이었는지* 확인. 박탈된 회사들 (3M 등)은 별도 추적
- [ ] **Look-ahead Bias**: 2010년 1월 시점에서 알 수 없었던 정보 (예: 2020년 추가된 Aristocrats)를 사용하지 않았는지
- [ ] **Tax Drag**: 한국 거주자 기준 15% 원천징수 + 종합소득세 반영했는지
- [ ] **FX Risk**: USD/KRW 변동성을 별도 시뮬레이션
- [ ] **Reinvestment Frequency**: 분기 vs 즉시 재투자의 차이 확인
- [ ] **Slippage**: 분기 리밸런싱의 거래비용 (특히 NOBL 같은 균등 비중 ETF는 turnover 높음)
- [ ] **Dividend Cut Risk**: 백테스트 기간에 배당 컷 한 종목 처리 (drop or hold?)

### 5.2. 실투자 시 점검 사항

- [ ] **계좌 종류**: 일반 위탁 vs ISA vs 연금저축펀드 (세제 차이)
- [ ] **환율 진입 시점**: USD 강세 시점에 매수하면 통화 손실 위험
- [ ] **분산도**: 단일 섹터 30% 초과 X, 단일 종목 5% 초과 X
- [ ] **DRIP 활성화**: 자동 배당 재투자 옵션 확인 (한국 증권사 일부만 지원)
- [ ] **세금 신고 자동화**: 미국 W-8BEN 양식 제출 여부
- [ ] **외환거래법 준수**: 연간 5만 달러 초과 송금 시 신고
- [ ] **종합소득세**: 배당 + 이자 합계 2,000만원 초과 시 종합과세 전환

---

## 6. 한국 거주자 세금 시나리오

### 6.1. 시나리오: 미국 배당 ETF 보유

**가정**: SCHD 1억원 보유, 연 yield 3.5% = 연 350만원 배당

**과세 단계**:
1. **미국 원천징수 15%**: 350만원 × 15% = 52.5만원 (자동 차감)
2. **한국 추가 과세**: 
   - 배당 + 이자 합계가 2,000만원 이하: 분리과세 (15.4%)
   - 2,000만원 초과: 종합과세 (다른 소득과 합산)
3. **외화 환산**: 배당 수령일 매매기준율 적용

**실효 세율**:
- 일반 투자자 (분리과세 대상): **15.4%** (이미 미국 원천세에 포함)
- 고소득자 (종합과세): 누진세율 6-45% + 미국 원천세 보전

### 6.2. 절세 전략

| 전략 | 효과 |
|------|------|
| **ISA 활용** | 200-400만원 비과세 한도 + 9.9% 분리과세 |
| **연금저축펀드** | 16.5% 분리과세, 세액공제 16.5% |
| **퇴직연금 (IRP)** | 16.5% 분리과세, 세액공제 16.5% |
| **부부 분산** | 명의 분산으로 종합과세 임계값 회피 |

### 6.3. 한국 시장 대안

미국 시장 외에 한국에도 *유사한 배당 전략 ETF*가 상장되어 있습니다:

```
- TIGER 미국S&P500배당귀족 (코스피)
   → NOBL과 거의 동일 추적, 원화 거래
- KODEX 미국배당귀족커버드콜 
   → NOBL + 옵션 프리미엄
- KODEX 미국S&P500배당다우존스 
   → SCHD 추적
```

**장점**: 원화 매매, 양도소득세 22% (배당세 대신)
**단점**: 배당 자동 재투자 어려움, 운용보수 약간 높음

---

## 7. 실전 사례 연구

### 7.1. Coca-Cola (KO) 사례 분석

```
1988년 1월: Buffett이 KO 매수 시작 (총 12.4억 달러 투자)
2026년 4월: 평가액 약 250억 달러, 누적 배당 수령 100억 달러 이상

연 배당:
   1988 yield on cost: 2.5%
   2026 yield on cost: 약 60%+ (!!)

핵심 메커니즘:
   - 1988~2026: 38년 연속 dividend 증액
   - 평균 dividend growth: 약 7.5% 연
   - (1.075)^38 ≈ 16.2배 dividend 증가
   - 즉, 1988년 $1 dividend → 2026년 $16
```

### 7.2. Johnson & Johnson (JNJ) 사례

```
1972년 dividend 증액 시작
2026년: 62년 연속 증액 (Dividend King)

연 dividend growth (10년 평균): 약 6%
연 total return (1985-2025 추정): 약 11-13% CAGR

핵심:
   - 위기마다 배당 유지 (2008, 2020 모두)
   - AAA 신용등급 (정부 다음 가는 안전성)
   - 글로벌 분산 (북미 50%, 유럽/아시아 50%)
```

### 7.3. AT&T 반대 사례 (Yield Trap)

```
2010-2021: AT&T를 *고배당주*라며 추격
   - yield 7-9%로 매력적
   - 매년 약간씩 증액

2022년 5월: WarnerMedia 분사 시 배당 컷
   - dividend $2.08 → $1.11 (약 47% 감소)
   - 주가는 spinoff 가치 반영 후 추가 -30%

교훈:
   - High yield ≠ Quality
   - Payout Ratio가 위험 신호 (Pre-cut 80%+)
   - Free Cash Flow가 dividend 미커버한 적 있음
```

---

## 8. 결론과 구현 우선순위

### 8.1. 핵심 원칙 5가지

1. **배당주 투자는 알파가 아니라 시간**
   단기 시세차익이 아닌 *복리의 시간* 활용
2. **Yield는 함정이 될 수 있다**
   Quality (payout ratio, FCF) 함께 봐야 함
3. **ETF가 출발점**
   개별 종목 선별 전 SCHD/VIG/DGRO/NOBL로 framework 학습
4. **섹터 분산이 필수**
   단일 섹터 의존은 배당 컷 risk 집중
5. **세금이 큰 변수**
   한국 거주자는 ISA, 연금 등 세제 활용 필수

### 8.2. 구현 순서

```
Step 1 (1주차):
   - T-DIV-1: Aristocrats 백테스트로 framework 검증
   - 결과: 1989-2025 누적 수익률 차트 생성

Step 2 (2-3주차):
   - T-DIV-2: 본인 상황에 맞는 포트폴리오 시뮬레이션
   - 결과: 20년 자산 추정

Step 3 (4주차):
   - T-DIV-3: Quality Score 스크리닝으로 Aristocrat 외 종목 발굴
   - 결과: Top 50 후보 리스트

Step 4 (1-2개월차):
   - T-DIV-4: DRIP 시뮬레이션으로 적립 plan 확정
   - 결과: 월 적립금 결정

Step 5 (지속):
   - T-DIV-5: Yield Trap Detector 정기 실행
   - 결과: 분기별 portfolio review
```

### 8.3. 이 전략이 *맞지 않는* 투자자

- 단기 시세차익 추구 (1-3년 시야)
- 변동성 거의 무관용
- 세금 계산 부담
- AI/Tech 같은 고성장 추격 선호

### 8.4. 이 전략이 *적합한* 투자자

- 10-30년 시야
- 현금흐름 + 자본증식 동시 추구
- 변동성 감내 가능 (위기 시 -30%)
- 세제 활용 학습 의지
- 은퇴 준비, 자녀 교육비 등 *목표가 명확*

---

## 9. 추가 학습 자료

### 9.1. 도서

- **Lowell Miller** — *The Single Best Investment: Creating Wealth with Dividend Growth*
- **Geraldine Weiss** — *Dividends Don't Lie*
- **Josh Peters** — *The Ultimate Dividend Playbook* (Morningstar)
- **Daniel Peris** — *The Strategic Dividend Investor*

### 9.2. 학술 논문

- **Fama & French (1988)** — *Dividend Yields and Expected Stock Returns*
- **Litzenberger & Ramaswamy (1979)** — *The effect of personal taxes and dividends on capital asset prices*
- **Arnott & Asness (2003)** — *Surprise! Higher Dividends = Higher Earnings Growth*
- **Asness, Frazzini, Pedersen (2019)** — *Quality Minus Junk*
- **Novy-Marx (2013)** — *The Other Side of Value: The Gross Profitability Premium*

### 9.3. 데이터 소스

- **S&P Dow Jones Indices** — Dividend Aristocrats Index 공식
- **Sure Dividend** (suredividend.com) — Aristocrats + Kings 무료 spreadsheet
- **Simply Safe Dividends** (paid, 가장 정확한 dividend safety score)
- **Seeking Alpha** — 개별 종목 분석
- **Morningstar** — Wide Moat ETF + 분석

### 9.4. ETF 발행사

- **ProShares**: NOBL (Aristocrats)
- **Schwab**: SCHD
- **Vanguard**: VIG, VYM
- **iShares (BlackRock)**: DGRO
- **JPMorgan**: JEPI, JEPQ

---

## Disclaimer (필수)

**본 문서의 모든 내용은 교육·연구 목적입니다.**

- 본 문서는 *투자 권유*가 아닙니다
- 모든 종목·ETF 추천은 *과거 성과*에 기반하며, 미래 보장이 없습니다
- 한국 거주자의 세제는 변경될 수 있으니 *세무사 자문* 필수
- 외환거래법 위반은 *형사 처벌* 대상이므로 외환 거래 시 한도 확인
- Claude를 포함한 LLM이 생성한 코드는 *반드시 사용자가 검증*해야 합니다
- 백테스트 결과와 실거래 결과는 *반드시 다릅니다* (슬리피지, 수수료, 세금)
- *Past performance does not guarantee future results.*

---

*작성일: 2026년 4월 26일*
*저자: 김호광 (Dennis Kim / HoKwang Kim) — Independent Researcher · Betalabs Inc. CEO*
*시리즈: Awesome Claude Quant Scripts — 9번째 전략 추가분*
*ORCID: [0009-0002-0962-2175](https://orcid.org/0009-0002-0962-2175)*
*GitHub: [vibe-investing](https://github.com/gameworkerkim/vibe-investing)*
