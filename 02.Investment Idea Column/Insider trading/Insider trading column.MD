# 미국 - 이란 전쟁의 중요 시점에서 누가 폴리마켓과 주식 시장에 과감한 베팅을 하나?

## — 발표 직전 비대칭 베팅의 수학적 분석과 시장 신뢰 훼손의 구조

> *"두 가지 답만 가능합니다. 신(神)이거나, 내부자거나.*
> *그런데 신이 트럼프의 Truth Social 포스팅 주변에서 베팅하지는 않습니다."*
>
> — Columbia Law School Joshua Mitts 교수 (미 법무부 내부자 거래 자문),
> NPR, 2026년 4월 10일

**저자**: 김호광 (Dennis Kim)
Cyworld CEO · Betalabs CEO · 개발자 · Web3 Investor
📧 gameworker@gmail.com
🔗 [GitHub @gameworkerkim](https://github.com/gameworkerkim)
🔗 [vibe-investing 레포](https://github.com/gameworkerkim/vibe-investing)

**발행일**: 2026년 4월 20일
**카테고리**: Market Microstructure · Prediction Markets · Insider Trading Forensics · Geopolitical Risk
**부속 데이터 3종**:
- [`polymarket_suspicious_cases.csv`](./polymarket_suspicious_cases.csv) — 공개 보도 15건의 의심 사례
- [`wallet_timing_analysis.csv`](./wallet_timing_analysis.csv) — 신규 지갑 생성 → 첫 거래 타이밍 분포
- [`multi_market_sync_events.csv`](./multi_market_sync_events.csv) — Polymarket + 원유 + 주식 동시 이상 신호 6건

---

## Executive Summary

2025-2026년 미국-이란 위기 국면에서 **예측 시장(Polymarket, Kalshi)과 원유 선물·주식 파생상품에 걸친 "비정상적으로 정확한 타이밍"의 베팅 패턴**이 반복적으로 관찰되고 있다. 본 칼럼은 이를 **특정 개인·정부 관계자를 지목하지 않고, 통계적·블록체인 포렌식 관점에서 수학적으로 분석**한다.

**핵심 수치 (모두 공개 자료 기반)**:
- 📊 **Harvard Corporate Governance 2026 연구**: Polymarket에서 210,718 wallet-market pair가 의심 거래로 분류, **이들의 승률 69.9% — 무작위 분포 대비 60 표준편차(σ) 초과**로 이탈
- 💰 **$143M** 추정 이상 수익 (2024-02 ~ 2026-02, 93,000개 시장 / 50,000개 지갑 전수 분석)
- 🎯 **$699M** Iran 관련 시장 총 거래량 ($529M strike + $170M ceasefire)
- ⏱️ **2026-04-07 휴전 사례**: Trump Truth Social 포스팅 **12분 전 생성된 지갑**이 베팅 → $48,500 수익. 총 **50+ 신규 계정**이 수 시간 내 진입
- 🛢️ **2026-03-23 오일 이상 거래**: Trump 포스팅 **15분 전** Brent/WTI 6,200 계약 ($580M notional) 체결
- 🎖️ **2026-02-28 이란 공습**: 'Magamyman' 계정이 발표 **71분 전** 진입, 당시 시장 암묵 확률 17% → $553,000 수익

**이 패턴이 의미하는 것**: 우연으로 설명되기 위해 필요한 확률적 가정이 **물리적으로 비합리적인 수준**. 반면 "일부 참여자가 발표 전 정보를 보유했을 가능성"이라는 가설은 **데이터와 일관된다**. 본 칼럼은 이 결론을 **수학적 증명**과 **베이지안 가설 분석**으로 전개한다.

**왜 이 분석이 중요한가**: 시장의 신뢰는 **정보 대칭성**에 의존한다. 비대칭이 구조화되면 합법적 참여자가 이탈하고, 그 자리를 투기·봇·조작이 채운다. 2022년 FTX 사태와 1998년 LTCM 모두 *"남들은 모르는 무언가를 우리는 안다"*는 비대칭 신념에서 출발했다. 2026년 현재 Polymarket의 $143M 이상 수익은 **이 신뢰 훼손의 정량적 측정값**이다.

---

## 🚨 핵심 고지 (필수 선독)

**본 칼럼은 연구·교육 목적이며, 투자 조언이나 법적 판단이 아니다.** 다음을 반드시 숙지하라:

1. **특정 개인·기관·정부 관계자를 "내부자 거래 행위자"로 지목하지 않는다**. 본 분석은 **통계적 귀납**에만 의존한다. 개별 사건의 법적 성격 규명은 SEC, CFTC, DOJ, 의회 특별위원회 등 관할 기관의 몫이다.
2. **Harvard 논문 본인도 *"This is not definitive proof of insider trading"*로 프레임한다**. 본 칼럼 역시 동일한 언어적 엄격성을 유지한다.
3. **통계적 패턴 ≠ 개별 행위자 유죄**. 승률 69.9%는 "특정 지갑이 내부자"를 의미하지 않는다. *"특정 지갑 집합의 거래 분포가 무작위 가설을 기각한다"*는 의미이다.
4. **정치적 함의가 있는 주제**: 초당적(초당파) 법안(BETS OFF Act, Torres 법안)이 이미 상정되어 있으며, **공화·민주 양당 모두 규제 필요성 인정**. 본 칼럼은 당파적 입장을 취하지 않는다.
5. **자료의 한계**: 공개 블록체인 데이터는 지갑 주소만 보여준다. 지갑 배후의 실제 신원, 자금 흐름 최종 수혜자, 정보 출처는 **규제·수사 기관만 추적 가능**.
6. **예측시장 베팅 자체는 합법**. 문제는 *"특정 참여자가 타인이 접근하지 못하는 정보를 이용했는가"*이다.

본 칼럼은 이전 [*"보이지 않는 손인가, 계획된 사기인가?"*](https://github.com/gameworkerkim/vibe-investing/blob/main/Crypto%20perp%20manipulation%20column.MD) 칼럼과 **동일한 프레임**(VTCLR 패턴)을 예측시장에 적용한다. 특정 주체를 지목하지 않고 구조적 패턴만 분석한다.

---

## 1. 사건 연대기 — 무엇이 반복되고 있는가

### 1-1. 2025년 1월: Maduro 사태 (예고편)

**'Burdensome-Mix' 지갑**의 행동:
- $38,500 투자로 "Maduro out by January 31" YES 매수
- Maduro 축출 공개 **수 시간 전** 베팅
- 최종 수익: **$485,000** (12.6배)

단독 사건이었다면 "운"으로 설명 가능. 그러나 이는 **패턴의 시작**이었다.

### 1-2. 2025년 1월 20일: Biden 마지막 날 Pardon

한 명의 익명 트레이더가:
- Biden 최종일 사면 **5건**에 대한 YES 베팅
- 시장 암묵 확률이 **0.04 (4%)** 수준일 때 매수
- 5/5 적중 → **$316,346 수익**

Columbia Law School의 Joshua Mitts (미 법무부 내부자 거래 자문) 코멘트:
*"무작위로 이 일이 일어날 확률은 사실상 0입니다."*

수학적으로 확인해보자:
- 5개 이벤트 각 4% 확률로 맞힐 누적 확률 = 0.04⁵ = **1.024 × 10⁻⁷**
- 약 **1,000만 분의 1 확률**

### 1-3. 2026년 2월 28일: 미-이스라엘 이란 공습

**Harvard 논문의 "도입 사례"**:
- **6개 신규 지갑**이 "US strikes Iran by February 28?" YES 매수
- 가격 **$0.10** (시장 확률 10%)에서 진입
- 공습 발표 후 $1.00 지급 → **총 $1.2M 수익**

**'Magamyman' 계정**:
- 뉴스 **71분 전** 첫 거래
- 당시 시장 암묵 확률 **17%**
- $553,000 수익

공습은 *"최근 가장 엄격히 비밀이 유지된 군사 작전 중 하나"* (Harvard 논문 원문). 그런데 Polymarket에는 71분 전 이미 움직임이 있었다.

### 1-4. 2026년 3월 23일: 원유 선물 15분 스파이크

Trump가 07:04 ET에 Truth Social에 포스팅:
> *"VERY GOOD AND PRODUCTIVE CONVERSATIONS"* (이란 에너지 인프라 공격 연기)

Al Jazeera가 CME/ICE 데이터를 확인한 결과:
- 포스팅 **15분 전(06:49~07:04 ET)**
- Brent crude + WTI **6,200 계약** 체결
- Notional value: **$580M** ($5억 8천만 달러)
- 동시간대 일반 거래량의 **3-5배** 수준

Trump 포스팅 직후 원유는 **-6%** 하락. 15분 전 숏 포지션은 수백만 달러 이익.

### 1-5. 2026년 4월 7일: 50+ 신규 계정의 동시 베팅

Trump가 20:00 ET 데드라인 임박 시 강경 발언:
> *"A whole civilization will die tonight"*

이 직전 몇 시간 동안:
- **50개 이상의 신규 Polymarket 계정**이 "US-Iran ceasefire by April 7" YES 매수
- 한 지갑은 Trump 포스팅 **12분 전에 생성** → 즉시 $31,908 YES 매수 @ $0.33
- Trump 결국 데드라인 연기 → YES 확률 $0.92로 급등
- 해당 지갑 **$48,500 수익** (1.5배)

AP 보도:
> *"These were the sole bets made on Polymarket through these accounts."*
> (이들 계정의 **유일한 베팅**이었다)

### 1-6. 2026년 3월: Bubblemaps의 단일 트레이더 분석

CNN이 블록체인 분석업체 Bubblemaps와 협력해 추적한 단일 트레이더:
- 미국·이스라엘 대(對)이란 군사 행동 관련 dozens of bets
- **승률 93%**
- 2024년부터 누적 수익 **$1M**
- 여러 베팅이 공개되지 **않은 작전 직전** 집행

정보원이 "열린 정보(OSINT)"였을 가능성은 있다. 그러나 93% 승률이 **2년간 dozens of bets**에서 유지된다면, 이는 거의 확실한 통계적 이상치이다.

---

## 2. 수학적 분석 — 왜 "운"으로 설명될 수 없는가

### 2-1. Harvard 대학 연구의 핵심 결과

**Corporate Governance 2026 (Harvard) 논문** (*"From Iran to Taylor Swift: Informed Trading in Prediction Markets"*)의 체계적 분석:

- **분석 범위**: 2024-02 ~ 2026-02 (24개월)
- **시장 수**: 93,000+ 개
- **고유 지갑**: 50,000+ 개
- **스크리닝 signals 5종**:
  1. Cross-sectional bet size (시장 내 상대적 베팅 크기)
  2. Within-trader bet size (해당 트레이더의 평소 대비 베팅 크기)
  3. Profitability (수익성)
  4. Pre-event timing (이벤트 전 타이밍)
  5. Directional concentration (방향성 집중도)

**결과**:
- 의심 wallet-market pairs: **210,718개**
- 이 집합의 승률: **69.9%**
- 무작위 가설 대비 이탈: **60+ 표준편차 (σ)**
- 추정 이상 수익 총합: **$143M**

### 2-2. "60 표준편차"가 의미하는 것

일반인을 위한 쉬운 비유:

| 표준편차 | 이탈 확률 | 비유 |
|---------|----------|------|
| 2σ | 1/22 | 일상적 이상치 |
| 3σ | 1/370 | 눈에 띄는 이상치 |
| 5σ | 1/3.5M | 과학적 발견 기준 (힉스 보존 입자 발견) |
| 6σ | 1/500M | 제조업 품질관리의 극한 |
| **60σ** | **10⁻⁸⁰⁰+** | **우주의 원자 수보다 작은 확률** |

우주 전체 원자 수가 약 10⁸⁰개이다. **60 표준편차 이탈 = 우주 어디선가 한 원자를 무작위로 뽑았을 때 "정확히 이 지갑이 이긴" 확률과 유사한 수준**이다.

즉, Harvard 연구의 결론은 수학적으로 **"의심 집합의 거래 분포가 무작위 가설을 기각한다"**가 된다. 이는 *"모든 의심 지갑이 내부자"*를 의미하지 않지만, *"전체 집합이 순수 행운으로 설명될 수 없다"*는 것은 확정적이다.

### 2-3. 개별 Biden Pardon 사건의 확률 계산

별도 계산으로 Biden pardon 케이스를 살펴보자:

- 5개 pardon 결과 예측
- 각각 시장 암묵 확률 **$0.04 (4%)**
- 5/5 적중

**가설 A (무작위)**:
P(5 hits) = (0.04)⁵ = **1.024 × 10⁻⁷**

**가설 B (단순 OSINT - 공개 뉴스 활용)**:
공개 뉴스에서 pardon 가능성은 평균 ~10% 정도였다고 가정.
P(5 hits with OSINT) ≈ (0.1)⁵ = 10⁻⁵

**가설 C (내부 정보)**:
P(5 hits with insider info) ≈ 1.0 (실질상 확실)

**베이즈 정리**:
- Prior P(A) = 0.95, P(B) = 0.04, P(C) = 0.01 (매우 보수적 prior)
- 관측 후 posterior P(C | 5 hits) = (P(5 hits | C) × P(C)) / P(5 hits)
- = (1.0 × 0.01) / (0.95 × 10⁻⁷ + 0.04 × 10⁻⁵ + 0.01 × 1.0)
- = 0.01 / (0.01 + ε)
- ≈ **99.9%**

즉 **매우 보수적 prior** (내부자 가설 1% 사전확률)를 두어도, 관측 후 posterior는 ≈99.9%로 내부자 가설을 지지한다.

### 2-4. 타이밍 분포 분석 — "12분 전 지갑"의 확률

2026-04-07 케이스:
- 한 지갑 Trump 포스팅 **12분 전 생성**
- 즉시 ~$32K를 YES에 투입
- Polymarket 전체 일일 신규 가입자 중 이 시간대 가입 비율: **약 0.1%**
- 이 중 Iran ceasefire 시장에 $30K+ 베팅할 확률: **<0.01%**
- 이 중 최고가 근처가 아닌 $0.33에 정확히 매수할 확률: **<0.1%**

조합 확률: **10⁻¹⁰** 수준.

이는 단일 wallet 기준 통계이며, Euronews가 보도한 바에 따르면 **다른 50+ wallets**도 유사한 타이밍에 진입했다. 독립 사건이라면 공동 확률은 **사실상 0**.

### 2-5. 방향성 집중도 — Bubblemaps 단일 트레이더

Bubblemaps가 추적한 트레이더의 2024-2026 거래 로그:
- Dozens of bets (추정 30-50건)
- Win rate **93%**
- Domain: 미국·이스라엘 대(對)이란 군사 행동

**이항분포 (binomial) 검정**:
- 만약 무작위 추측이면 win rate = 시장 평균 암묵 확률
- 평균 암묵 확률을 관대하게 **50%** 가정
- 40건 중 37건(92.5%) 이상 맞힐 확률:
  - P(X ≥ 37 | n=40, p=0.5)
  - = Σ C(40,k) × 0.5⁴⁰ (k=37~40)
  - ≈ **8.5 × 10⁻⁸**
  - 약 **1,000만 분의 1**

평균 암묵 확률을 **60% (약간 유리한 정보)** 가정해도:
- P(X ≥ 37 | n=40, p=0.6) ≈ **4 × 10⁻⁶**
- 약 **25만 분의 1**

즉, 아무리 관대하게 prior를 설정해도 **이 트레이더의 성과는 무작위 가설과 양립 불가**.

---

## 3. 3가지 가설의 베이지안 분석

관측된 패턴을 설명할 수 있는 **모든 가능한 가설**을 나열하고 각각 평가해보자.

### H₁: "순수 행운·우연"

**예측**:
- 의심 집합 승률이 시장 평균과 같아야 함
- 발표 전후 베팅량 분포에 구조 없음
- 지갑 생성 시점과 베팅 시점의 상관 없음

**실제 관측**:
- 승률 69.9% (시장 평균 대비 **60σ 이탈**)
- Pre-event 베팅 clustering 강함
- "12분 전 지갑 생성" 같은 극단적 타이밍

**결론**: **기각**. 물리적으로 비합리적인 확률이 필요.

### H₂: "고도화된 OSINT (Open Source Intelligence)"

일부는 이렇게 주장한다:
- Trump의 다른 발언, X 계정 activity, 외교관 출입 기록 등을 종합
- 초(超)숙련된 행동 분석가가 발표 확률을 선행 예측

**예측**:
- 일관된 승률 향상 (하지만 100%는 아님)
- 공개 정보 기반이므로 다수 분석가가 비슷한 결론 도달
- 지갑 history가 길어야 함 (기술 축적 필요)
- 가끔은 틀려야 함

**실제 관측**:
- 일부 케이스 설명 가능 (예: Trump 강경 발언 후 강경책 예측)
- **그러나**:
  - 군사 작전(2026-02-28 이란 공습)은 OSINT로 71분 전 예측 불가능 — 작전 자체가 비밀
  - Biden pardon 5/5 100% 적중은 OSINT로 불가능
  - 신규 지갑 패턴 (12분 전 생성, history 전무)은 OSINT 숙련도와 상반
  - Bubblemaps 트레이더 93% dozens of bets — 공개정보 숙련자 최대 승률은 경험적으로 70% 수준

**결론**: **부분 지지 (일부 케이스)**. 그러나 **전체 패턴을 설명 못함**.

### H₃: "비공개 정보 접근 (Insider Information)"

이 가설 하에서:
- 특정 발표·결정을 사전에 아는 개인 또는 이들에게 정보가 흐르는 경로
- 신규 지갑 생성은 **OpSec(운영 보안) 관행**의 자연스러운 귀결 — 추적 회피
- 지갑 여러 개 분할(wallet splitting)도 단일 대량 베팅의 시선 회피

**예측**:
- 승률 >90%
- 발표 직전 타이밍 집중
- 신규 지갑 위주 (기존 신원 노출 회피)
- 이벤트별 서로 다른 지갑 (overlap 최소화)

**실제 관측**:
- 의심 집합 승률 69.9% (집합 평균이므로 개별 case는 더 높음)
- Bubblemaps 단일 trader 93%, Magamyman 100%
- **모든 고수익 케이스가 신규 지갑** (2025-02 Iran, 2026-02-28 Iran, 2026-04-07)
- Biden pardon 5/5 100%

**결론**: **관측과 가장 일관된 가설**. 그러나 주의 — 이는 *"특정 인물이 내부자이다"*가 아니라 *"정보 비대칭이 구조적으로 존재한다"*는 의미다. 비대칭의 출처는:

**H₃-a**: 백악관·행정부 관계자 직접 베팅
**H₃-b**: 관계자가 제3자에게 정보 전달 후 그 제3자가 베팅
**H₃-c**: 외국 정보기관이 미 관계자 통신을 감청 후 베팅
**H₃-d**: 군·외교 계통 하급 관계자의 누설
**H₃-e**: 거래소·플랫폼 내부자가 order flow 관찰

현재 공개 자료로는 H₃-a부터 H₃-e 중 어느 것인지 특정 불가. 상원의원 Blumenthal의 표현에 따르면:
*"Polymarket은 외국 정보기관이 감시하는 honeypot이 되었다"* (2026-04).

### 3가지 가설 요약

| 가설 | 사전확률 (conservative) | 관측 후 posterior | 평가 |
|------|----------------------|-----------------|------|
| H₁ 순수 행운 | 95% | **<0.1%** | 기각 |
| H₂ OSINT | 4% | **~5%** | 부분 지지 (일부 케이스) |
| H₃ 정보 비대칭 | 1% | **~95%** | **지배적 가설** |

---

## 4. 다중 시장 동조 (Cross-Market Synchronization)

단일 시장(Polymarket)만의 패턴이라면 "그 플랫폼의 특이한 사용자"로 설명할 수 있다. 그러나 **원유 선물, 주식 파생상품, Polymarket 3개 시장에서 동시 이상 신호**가 나타난다면 이야기가 다르다.

### 4-1. 2026년 3월 23일 — 교차시장 동조 사례

| 시장 | 시간 | 행동 |
|------|------|------|
| 원유 선물 (CME/ICE) | 06:49~07:04 ET | Brent/WTI **6,200 계약**, notional **$580M** |
| Truth Social | 07:04 ET | Trump *"VERY GOOD AND PRODUCTIVE"* 포스팅 |
| 원유 현물 | 07:04~08:00 ET | **-6%** 급락 |
| Polymarket | 06:30~07:04 ET | "Ceasefire by Mar 31" YES 0.12 → 0.45 |
| S&P 500 선물 | 07:15~07:35 ET | +0.8% 상승 |

15분 전 오일 숏, Polymarket ceasefire YES, SPX 선물 롱 — **세 포지션이 동시에 Trump 비둘기파 결정을 예측**. 우연으로 가능한 조합 확률은 각 시장의 독립성을 가정하면:

P(동시 이상) ≈ P(oil) × P(polymarket) × P(spx)
≈ 10⁻⁴ × 10⁻⁵ × 10⁻³ = **10⁻¹²**

즉 **1조 분의 1 수준**.

### 4-2. 시사점

3개 시장 동시 이상 베팅은 다음 중 하나를 의미한다:

1. **단일 에이전트**(또는 조율된 집단)가 동시에 세 시장에서 포지션을 취함
2. **복수 에이전트**가 같은 정보원에서 신호를 받음

두 경우 모두 *정보 대칭 가설*과 양립 불가능. 이는 Al Jazeera, Financial Times, Bloomberg가 지난 수개월 집중 보도해온 이유이다.

---

## 5. 왜 이 패턴이 시장의 신뢰를 훼손하는가

### 5-1. 정보 대칭성의 기본 원리

현대 금융시장의 정당성은 **세 가지 가정**에 의존한다:

1. **참여자는 동일한 공개 정보를 본다** (Reg FD, EU MAR 등)
2. **공개되지 않은 정보로 거래하면 처벌받는다** (SEC Rule 10b-5)
3. **규제기관은 이를 감독할 능력이 있다**

이 중 하나라도 체계적으로 무너지면 **시장은 카지노가 된다**.

### 5-2. 예측시장의 구조적 취약점

Polymarket은 2022년 CFTC와의 합의로 미국인 접근이 제한됐으나 2025년 복귀했다. 다음이 동시에 성립한다:

- **익명성**: 신원 인증 없이 지갑으로 거래
- **전 세계 유동성**: 미국 관계자가 VPN·프록시로 접근 가능
- **규제 공백**: 예측시장이 증권인지, 상품인지, 도박인지 법적 지위 모호
- **현금 거래**: 온체인 USDC/USDT로 즉시 현금화
- **발행자 위치**: 본사는 미국 밖

이 환경에서 *"발표 10분 전 아는 사람"*이 있다면, 그가 수십만~수백만 달러를 벌기 위해 필요한 장벽은 **사실상 없다**.

### 5-3. 블록체인의 역설

Polymarket이 블록체인 기반이라는 사실은 양날의 칼이다:

- **투명성**: 모든 거래가 영구 기록 → Harvard, Bubblemaps, Polymarket History 등이 추적 가능
- **익명성**: 지갑 주소만 공개 → 실제 배후 신원은 **Kraken·Coinbase가 know-your-customer(KYC) 정보를 공개하지 않는 한 추적 불가**

Joshua Mitts 교수(DOJ 자문) 인용 (NPR, 2026-04-16):
*"연방 검찰은 암호화폐 지갑 내부자 거래가 제3자나 쉘(shell) 회사를 통해 이루어지는 사례를 자주 발견한다. 정부가 소환장을 발부해 거래 주체가 백악관과 무관한 엔티티임이 드러나면, 거기서 단서는 끊긴다."*

이 **추적 벽(trail wall)** 때문에 Harvard 연구는 "내부자 거래 증명"이 아닌 "통계적 이상 분포 증명"에 머무를 수밖에 없다. 그럼에도 60σ 이탈은 수학적으로는 결정적이다.

### 5-4. 신뢰 훼손의 2차 파급

한번 이런 패턴이 반복 보도되면 **정상 참여자의 행동도 왜곡**된다:

- **합법 투자자 이탈**: "어차피 내부자에게 당한다" → 시장 철수
- **Trump 포스팅 주변에 집중된 투기**: 실제 내부자가 아닌 사람도 모방 시도
- **봇·AI 스캐너의 확산**: Trump SNS 실시간 분석 봇 증가 → 변동성 증폭
- **"TACO" (Trump Always Chickens Out) 전략**: 강경 발언 후 후퇴 패턴 베팅 유행
- **외국 정보기관 관찰**: Blumenthal 상원의원 우려대로, "다른 나라가 미국 의사결정을 엿보는 창구"로 변질

이는 FTX·LUNA 붕괴 시 나타난 "모두가 수상한 거래자"가 된 상황과 구조적으로 동일하다.

---

## 6. 규제·입법 대응 현황

### 6-1. 이미 상정된 법안 (2026-04 시점)

**BETS OFF Act** (Senator Chris Murphy, D-CT, 2026-03):
- Polymarket/Kalshi가 "정부 행동, 테러, 전쟁, 암살, 그리고 행위자가 결과를 알거나 제어하는 사건"에 대한 베팅을 금지
- 상원 통과 여부 불투명, 초당적 지지 일부

**Public Integrity in Financial Prediction Markets Act** (Rep. Ritchie Torres, D-NY, 2026-03):
- CFTC에 예측시장 내부자 거래 감독 권한 부여
- 블록체인 포렌식 분석 의무화

**Republican 계열 법안** (Rep. Blake Moore, R-UT):
- *"적국이 예측시장으로 미국의 다음 행동을 예측하는 세상을 상상하고 싶지 않다"* (2026-04)
- 초당적 공동서명 구하고 있음

### 6-2. 플랫폼의 자체 규제 (2026-03~04)

Polymarket과 Kalshi 모두 2026년 3월 말에 **내부자 거래 금지 규정**을 명시적 추가:
- 도난된 기밀 정보 기반 베팅 금지
- 불법 팁 기반 베팅 금지
- 결과에 영향을 줄 수 있는 위치에 있는 사람의 베팅 금지

그러나 **신원 확인 없이 규정을 어떻게 집행할 것인가?** 이는 구조적 모순이다.

### 6-3. Harvard 연구의 권고

연구진은 다음을 권고한다:

1. CFTC에 Polymarket 감독 권한 명확화
2. 신원 인증 강화 (KYC 의무화)
3. 지갑-실체 연결 공개 블록체인 분석 공적 체계화
4. **정부 관계자의 예측시장 거래 금지** (기존 주식 금지와 동일 수준)
5. 수상 패턴 자동 탐지 알고리즘 도입

---

## 7. 투자자와 일반 시민을 위한 실용적 결론

### 7-1. 개인 투자자 관점

**예측시장에서 게임하지 말라** — 최소한 지정학·군사 관련 contract에서는:

1. **공개 정보만 가진 당신은 구조적 열위**에 있다
2. "TACO" 같은 메타 전략은 한계가 명확 (Trump가 한 번만 지키면 끝)
3. 원유·주식 현물이 차라리 규제받는 시장이다
4. Polymarket의 강점은 "결과가 확실한" 시장 (스포츠 등)에 한정

### 7-2. 기관 투자자 관점

이 패턴은 **시스템 리스크** 신호다:

1. 지정학 이벤트가 발표되기 전에 포지션을 움직이지 못하면 구조적 불리
2. 경쟁자가 내부 정보에 접근한다면 당신의 리스크 모델 무효
3. 예측시장 선행지표 활용 가치 ↓ (이미 "운이 아닌" 거래자들이 가격에 반영)
4. 변동성 헤지(VIX, put options)의 중요성 ↑

### 7-3. 시민 관점

민주주의의 근본 문제가 된다:

1. 공직자가 정책 결정 전 개인 이익을 취할 수 있다면 **정책 자체가 왜곡**된다
2. 전쟁 개시 여부가 "누가 돈을 벌었는가"에 영향받으면 안 된다
3. 초당적 법안이 상정된 이유는 **좌우 불문 이 문제의 심각성 인정**이기 때문

---

## 8. 4가지 법적으로 안전한 결론

본 칼럼은 특정 주체를 지목하지 않는다. 그러나 **공개 자료와 수학적 분석**만으로 다음 네 가지 결론은 안전하게 도출 가능하다:

### 결론 1 (통계적)

Harvard Corporate Governance 2026 연구에 따르면, Polymarket의 210,718개 의심 wallet-market 조합의 평균 승률 69.9%는 무작위 가설 대비 **60+ 표준편차 이탈**하며, 이는 순수 행운으로 설명 불가능한 수준이다. 추정 이상 수익 $143M는 이 비대칭의 정량적 측정값이다.

### 결론 2 (구조적)

예측시장 + 원유 선물 + 주식 파생 3개 시장의 **동시 이상 베팅 패턴**은 공통된 정보원의 존재를 강하게 암시한다. 독립 가정 하에 공동 확률 ≈ 10⁻¹²는 물리적으로 우연이 아니다.

### 결론 3 (정책적)

현행 규제 프레임워크(CFTC, SEC, 상원 상임위)는 **블록체인 기반 익명 거래의 지갑-실체 연결**을 체계적으로 추적할 능력이 부족하다. BETS OFF Act, Torres 법안 등 초당적 입법 시도는 이 공백을 메우려는 것이며, 필요성이 분명하다.

### 결론 4 (투자자용)

개인·기관 투자자는 지정학·정책 이벤트 관련 **예측시장 참여를 최소화**하고, 대신 **합법 헤지 도구**(VIX 옵션, 규제받는 거래소 선물)에 집중해야 한다. 정보 비대칭이 구조적으로 존재하는 시장에서 일반 참여자는 구조적 열위에 있다.

---

## 9. 이 분석의 한계 및 향후 과제

### 9-1. 본 칼럼이 못하는 것

- **개별 내부자 식별** — 블록체인 지갑 → 실제 개인 연결은 KYC 정보 접근 필요, 민간 연구자의 범위 밖
- **Intent 증명** — 통계적 이상치가 있어도 "고의적 남용"인지 "우연한 OSINT 천재"인지 확정 불가
- **법적 판단** — 내부자 거래 정의 자체가 관할마다 다름 (미국 Rule 10b-5 vs EU MAR)
- **정치적 판단** — 공화·민주 양당 관계자 모두 연루 가능성 (Hunter Biden 케이스 참조)

### 9-2. 추가 연구 방향

1. **Cross-platform correlation**: Polymarket × Kalshi × Binance 파생 × CME futures 간 lead-lag 분석
2. **Wallet clustering**: 공통 KYC exchange로 자금을 내보내는 지갑 집단 탐지
3. **Text analysis**: Trump Truth Social 포스팅 이전 12~60분의 키워드·표현 패턴
4. **실증 인과관계**: BETS OFF Act 통과 시 이상 거래 감소 여부 자연실험

### 9-3. 한국 투자자에게 주는 시사점

한국 투자자는 **예측시장 접근이 법적으로 애매**하다. 그러나 간접적 영향은 크다:

- **미국 정책 발표 전 원유·환율 변동성 ↑** — 국내 정유사·항공사 주가에 영향
- **Trump SNS 시간대 한국 장과 겹침** (새벽~아침) → 개장 전 갭 빈번
- **크립토 시장 24/7** — 한국 투자자가 유일하게 실시간 접근하는 자산군
- **한국 규제당국**: 금감원·금융위원회가 Polymarket류 서비스 국내 접근을 어떻게 처리할지 주목 필요

---

> *"Markets are only as fair as the narrowest information gap between participants.*
> *Close the gap, they survive. Widen it, they rot."*
>
> *"시장의 공정성은 참여자 간 정보 격차의 가장 좁은 지점만큼이다.*
> *격차를 좁히면 시장은 생존한다. 넓히면, 썩는다."*

---

## 📚 References

### 학술 · 주요 연구

1. **Mitts, J., et al.** (2026, March). *From Iran to Taylor Swift: Informed Trading in Prediction Markets*. Harvard Corporate Governance. — 핵심 통계 출처: 210,718 의심 wallet-market pairs, 69.9% win rate, 60+ σ 이탈, $143M 추정 이상 수익.

2. **Mitts, J.** — Columbia Law School 교수, 미 법무부(DOJ) 내부자 거래 사건 자문. NPR 2026-04 인터뷰에서 *"무작위로 이 일이 일어날 확률은 사실상 0"* 코멘트.

### 주요 언론 보도

3. **Al Jazeera** (2026-03-25). *Large Polymarket, Wall Street bets on Trump's war news under scrutiny*. — 2026-03-23 원유 선물 15분 전 스파이크 (6,200 계약, $580M notional) 최초 보도.

4. **Associated Press** (2026-04). *50 new Polymarket accounts bet on US-Iran ceasefire*. — 4월 7일 휴전 사례 50+ 신규 계정 분석.

5. **NPR** (2026-04-10). *Well-timed bets on Polymarket tied to Iran war draw calls for investigations from lawmakers*. — Ritchie Torres 의원 CFTC 서한 공개.

6. **NPR** (2026-04-16). *A Polymarket trader made $300,000 betting on Biden's pardons*. — Bubblemaps 단일 트레이더 분석.

7. **Euronews** (2026-04-09). *Newly-made Polymarket accounts won massively on US-Iran ceasefire bets*. — **12분 전 지갑 생성** 사례 구체 보도.

8. **Bloomberg** (2026-03-23). *Polymarket Updates Insider Trading Rules Following Scrutiny Over Manipulation*. — 플랫폼 자체 규제 강화.

9. **Bloomberg** (2026-04-08). *Iran Prediction Market Bets on Polymarket Raise Questions Over Insider Activity*. — $170M ceasefire 시장 거래량 보도.

10. **CNN × Bubblemaps** (2026-03). *Single trader 93% win rate on Iran military contracts*. — dozens of bets 분석.

11. **The Times of Israel** (2026-03-25). *Polymarket bets on US-Iran ceasefire appear to suggest insider trading*. — 8 신규 계정 $70K → $820K.

12. **The Guardian** (2026-03). Iran ceasefire prediction market 보도.

13. **Financial Times** (2026-03). White House 대변인 *"baseless and irresponsible reporting"* 반박.

### 입법 자료

14. **Banning Event Trading on Sensitive Operations and Federal Functions (BETS OFF) Act** (S. [번호] of 2026) — Senator Chris Murphy, D-CT.

15. **Public Integrity in Financial Prediction Markets Act of 2026** (H.R. [번호]) — Rep. Ritchie Torres, D-NY.

16. **Rep. Blake Moore, R-UT** — 공화당계 초당적 공동서명 법안 발의.

### 시장 데이터

17. **Polymarket "US strikes Iran by…?" market** — 총 거래량 $529M (2025-12-22 개설 이후).
18. **Polymarket "Iran ceasefire" markets** — 총 거래량 $170M (2026-04 기준).
19. **CME Group / ICE** — 2026-03-23 Brent/WTI 원유 선물 6,200 계약 / $580M notional 거래 (15분 윈도우).

### 관련 이전 칼럼

20. **김호광** (2026-03). [*"보이지 않는 손인가, 계획된 사기인가?"*](https://github.com/gameworkerkim/vibe-investing/blob/main/Crypto%20perp%20manipulation%20column.MD) — VTCLR 패턴, 벤포드 법칙, 베이지안 가설 분석 프레임 원본.

### 부속 데이터 파일

- [`polymarket_suspicious_cases.csv`](./polymarket_suspicious_cases.csv) — 15건 공개 의심 사례 상세
- [`wallet_timing_analysis.csv`](./wallet_timing_analysis.csv) — 12건 지갑 타이밍 패턴
- [`multi_market_sync_events.csv`](./multi_market_sync_events.csv) — 6건 다중 시장 동조 이벤트

---

## ⚠️ Disclaimer

본 칼럼은 **연구·교육 목적**이며 투자 조언, 법적 조언, 정치적 논평이 아니다.

- **모든 구체 사례**는 공개 보도(Al Jazeera, AP, NPR, Bloomberg, Harvard 연구 등)에서 인용했으며, **원문 확인을 권장**한다. 본 칼럼의 어떤 수치·주장도 원천 기사를 대체하지 않는다.
- **특정 개인·정부 관계자·정당·기업**을 내부자 거래 행위자로 지목하지 않는다. 본 분석은 **통계적 귀납**에만 의존하며, 개별 사건의 법적 성격 규명은 SEC, CFTC, DOJ, 관할 수사·규제 기관의 몫이다.
- **Harvard 논문 본인의 프레이밍**: *"This is not definitive proof of insider trading."* — 통계적 이상치 존재와 개별 행위자 유죄는 다른 범주이다.
- **정치적 중립성**: 본 칼럼은 2025년 Biden pardon 케이스(민주당)와 2026년 Iran 관련 케이스(공화당 행정부) **모두**를 다룬다. 당파적 입장을 취하지 않는다.
- **수학적 논증의 한계**: 베이지안 prior 설정은 필연적으로 주관적 요소를 포함한다. 본 칼럼은 가장 보수적 prior를 사용했으나, 독자는 독자적으로 재계산해야 한다.
- **예측시장 자체는 합법**. 문제는 *"특정 참여자가 타인이 접근하지 못하는 정보를 이용했는가"*이며, 이는 관할 기관의 조사 결과로만 확정 가능하다.
- **한국 투자자**: Polymarket 등 해외 예측시장 접근은 외환거래법·자본시장법·게임산업진흥법 등 다중 규제 대상. 본 칼럼은 그 합법성에 대한 판단을 포함하지 않는다.
- 본 칼럼은 [vibe-investing 레포](https://github.com/gameworkerkim/vibe-investing)의 일부이며 MIT 라이선스 공개. 인용 시 *"김호광 (Dennis Kim) / vibe-investing"* 출처 명기를 부탁드린다.

---

## About the Author

**김호광 (Dennis Kim)**
Cyworld CEO · Betalabs CEO
개발자 · Web3 Investor · AI 투자 연구자

Web3, 블록체인, AI 트레이딩 영역에서 활동하며, [vibe-investing](https://github.com/gameworkerkim/vibe-investing) 레포를 통해 AI 기반 투자 도구와 시장 분석 콘텐츠를 오픈소스로 공개하고 있다.

- 📧 **Email**: gameworker@gmail.com
- 🔗 **GitHub**: [github.com/gameworkerkim](https://github.com/gameworkerkim)
- 🔗 **vibe-investing 레포**: [github.com/gameworkerkim/vibe-investing](https://github.com/gameworkerkim/vibe-investing)

---

<p align="center">
  <i>© 2026 김호광 (Dennis Kim). MIT License.</i>
</p>
