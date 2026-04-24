# 아이디어 노트 — 체인별 토큰 상장 후 성과 비교 분석, Chain War

## Phase 4 연구 프로그램 초안: BNB Chain vs ERC-20 vs Solana 토큰의 비트코인 조정 성과 (2020-2025)

**저자**: 김호광 (HoKwang Kim, Independent Researcher)
**상태**: **사전 아이디어 노트 (실증 데이터 수집 전)**
**작성일**: 2026년 4월 24일
**목표 실행 시기**: 2027년 Q4 (Phase 1, 2, 3 완료 후)
**소속 시리즈**: vibe-investing 연구 시리즈 (Phase 4 후보)

---

## ⚠️ 중요한 사전 고지

**본 문서는 아이디어 노트이며, 정량적 결론을 담고 있지 않습니다.**

- 본 문서의 모든 "특이점" 및 "패턴"은 **공개된 시장 정보 + 저자의 실무 관찰**에 기반한 **정성적 가설**입니다
- 통계적 유의성 검정 결과는 포함되어 있지 **않습니다** (실증 데이터 수집 후에만 가능)
- 실제 가격 데이터는 추후 CoinGecko/CoinMarketCap API를 통해 수집 예정
- 본 문서는 향후 정식 연구의 **연구 설계 청사진**입니다

---

## 1. 연구 동기

### 1.1. 문제 인식

암호화폐 생태계에서 토큰의 상장 후 가격 성과는 단순히 프로젝트의 펀더멘털만으로 설명되지 않는다. 토큰이 어떤 블록체인 위에 구축되어 있는지(host chain)도 중요한 변수가 될 수 있다. 특히:

1. **유동성 분산**: 체인별로 사용자 풀, 마켓 메이커, 자본 풀이 분리됨
2. **거래소 listing 정책**: 거래소마다 특정 체인 토큰을 우선 상장하는 경향
3. **체인 자체 토크노믹스**: 가스비 구조, 스테이킹 수익률, 인플레이션율 차이
4. **개발자/사용자 채택**: 체인별로 활성 사용자 수와 dApp 생태계 차이
5. **규제 환경**: 체인 발행 주체의 규제 노출 정도 차이

### 1.2. 가설의 학술적 정의

> **"2020-2025년 기간 동안 주요 5개 거래소(Binance, OKX, Bybit, Bitget, HTX)에 신규 상장된 토큰을 그 기반 체인(BNB Chain / ERC-20 / Solana)별로 분류했을 때, 비트코인 조정 수익률(BTC-adjusted return)에서 체인별로 통계적으로 유의한 성과 차이가 존재한다."**

### 1.3. 실무 관찰에 기반한 사전 가설 (검증 필요)

저자의 8년 실무 경험을 바탕으로 한 **사전 관찰** (정량 검증 전):

#### 관찰 1: BNB Chain 토큰의 long-term underperformance 가능성

- 2020-2021년 DeFi summer에 폭발적 상승했던 BNB Chain 토큰들 (CAKE, BAKE, XVS, AUTO 등)이 2024-2025년 시점에서 다수 ATH 대비 80-95% 하락
- 비교: 동기간 ETH 메이저 DeFi (UNI, AAVE)는 30-60% 하락에 그침
- 비교: Solana 메이저 DeFi (RAY, ORCA)는 일부는 회복, 일부는 더 큰 하락

#### 관찰 2: 거래소-체인 연계 효과

- **Binance**: BNB Chain 토큰 우선 listing 경향 (이해관계 일치)
- **OKX**: 멀티체인 균등 listing (자체 OKT Chain은 사실상 비활성)
- **Bybit**: 2023년 Mantle 출시 후 Mantle 생태계 토큰 listing 확대 시도
- **HTX (Huobi)**: Heco Chain은 거의 dead, ERC-20 중심
- **Bitget**: 자체 체인 없음, listing 자유도 가장 높음

#### 관찰 3: 시기별 체인 dominance 변화

```
2020-2021: ETH (DeFi summer) → BNB Chain (Q4 2021 폭발) → Solana (NFT 붐)
2022: 전반적 약세, Luna 붕괴, Solana 가장 큰 타격
2023: ETH L2 부상 (Arbitrum, Optimism), BNB Chain 정체
2024: Solana 부활 (memecoin, depin), BNB Chain 활성도 회복
2025: BNB Chain 다시 부활 (parallel execution upgrade), Solana 지속 강세
```

이 시기별 변화는 **vintage effect**가 강력함을 시사하며, 이를 통제하지 않으면 잘못된 결론 도출 위험.

---

## 2. 연구 질문과 가설

### 2.1. 핵심 연구 질문

**RQ1**: 체인별 신규 상장 토큰의 비트코인 조정 30일/90일/180일/365일 수익률은 통계적으로 유의한 차이를 보이는가?

**RQ2**: 시기(vintage) 효과를 통제한 후에도 체인 효과가 잔존하는가?

**RQ3**: 거래소별 listing 정책과 체인 분포에 어떤 패턴이 있는가?

**RQ4**: 체인별 "상장 후 가격 충격(listing shock)"의 시간적 분포가 다른가?

**RQ5**: Phase 1의 72시간 쇼크 효과가 체인별로 다르게 나타나는가?

### 2.2. 공식 가설 (5-Tier 구조)

**H1 (체인별 평균 수익률 차이 — 기술적)**:
세 체인 그룹(BNB Chain, ERC-20, Solana)의 신규 상장 후 365일 BTC-adjusted return 평균은 일원분산분석(ANOVA)에서 통계적으로 유의한 차이를 보인다.
- **검정**: 일원분산분석 + 사후 분석 (Tukey HSD)
- **예상**: BNB Chain < ERC-20 < Solana 순서 가능 (실무 관찰 기반, 검증 필요)
- **법적 안전성**: 단순 통계 비교; 의도/조작 주장 없음

**H2 (Vintage 효과 통제 — 핵심)**:
연도(2020/2021/2022/2023/2024/2025)와 BTC 시장 국면을 통제한 후에도 체인별 효과가 잔존한다.
- **검정**: 패널 회귀 (year fixed effects + chain fixed effects)
- **예상**: Vintage effect를 통제하면 chain effect 크기가 50-70% 감소할 가능성
- **법적 안전성**: 통계적 분해; 인과 주장 없음

**H3 (거래소-체인 상호작용 — 구조적)**:
거래소별로 체인 분포가 다르며, 이 차이는 우연으로 설명되지 않는다.
- **검정**: 카이제곱 동질성 검정
- **예상**: Binance는 BNB Chain 비율 유의하게 높음, HTX는 ERC-20 편중
- **법적 안전성**: 상장 정책의 통계적 기술; 차별/편향 주장 없음

**H4 (단기 충격의 체인 차이 — Phase 1과 연결)**:
신규 상장 후 첫 30일 가격 변동성과 BTC 대비 underperformance 정도가 체인별로 다르다.
- **검정**: 체인별 표준편차 비교 + Levene's test
- **예상**: Solana > BNB Chain > ERC-20 (변동성 크기 순)
- **법적 안전성**: 변동성 기술; 시장 조작 함의 없음

**H5 (군집화/이상치 패턴)**:
일부 체인에서 상장 후 가격 패턴의 군집이 발견된다 (예: 동일 카테고리 토큰들의 동조 움직임).
- **검정**: K-means clustering + DBSCAN
- **예상**: BNB Chain의 memecoin 군집, Solana의 DePIN 군집 등
- **법적 안전성**: 군집 패턴 기술; 개별 프로젝트 비난 없음

### 2.3. 주장하지 않는 것

- ❌ 특정 거래소가 특정 체인 토큰을 부정하게 우대했다
- ❌ 특정 체인이 본질적으로 "나쁜" 투자다
- ❌ 인과관계 (체인 → 가격 성과)
- ❌ 트레이딩 전략 신호
- ✅ 통계적 차이의 객관적 기록
- ✅ 시장 구조의 구조적 패턴 식별
- ✅ 투자자 보호 관점의 정보 제공

---

## 3. 사전 정성적 관찰 (검증 필요한 가설들)

### ⚠️ 본 섹션의 모든 내용은 검증이 필요한 가설입니다

본 섹션은 저자의 8년 실무 경험과 공개된 시장 정보에 기반한 **정성적 관찰**을 제시합니다. 정량적 검증은 향후 데이터 수집 후 진행될 것입니다. 어떤 결론도 본 노트만으로 이끌어내서는 안 됩니다.

### 3.1. BNB Chain 토큰의 관찰된 패턴 (가설)

#### 패턴 A1: DeFi 1세대 토큰의 장기 underperformance

2020-2021년 DeFi summer에 BNB Chain (당시 BSC) 위에 출시된 1세대 DeFi 토큰들이 2024-2025년 시점에서 ATH 대비 매우 큰 하락을 기록한 것으로 관찰됨:

| 토큰 | 출시 | ATH 시점 | ATH 대비 현재 추정 | 비고 |
|------|------|---------|-------------------|------|
| CAKE (PancakeSwap) | 2020-09 | 2021-04 ($44.18) | -97% (현재 ~$1.50) | BSC 대표 DEX |
| XVS (Venus) | 2020-10 | 2021-05 (~$147) | -97% 추정 | BSC lending |
| BAKE (BakeryFi) | 2020-09 | 2021-04 (~$8.38) | -97% 추정 | BSC DEX |
| AUTO (Autofarm) | 2020-12 | 2021-04 (~$2,400) | -99% 추정 | BSC yield aggregator |

**가설**: BNB Chain DeFi 1세대 토큰의 평균 하락폭이 ETH/Solana 동기 토큰보다 크다.

**검증 필요사항**:
- 정확한 ATH 시점과 가격
- 동기간 ETH/Solana DeFi 1세대 비교군 (UNI, SUSHI, RAY 등)
- BTC 대비 상대 성과
- BNB 자체 가격 변화 통제

#### 패턴 A2: Memecoin의 양극화

BNB Chain의 memecoin은 매우 양극화된 결과를 보임:

- **극도의 성공 케이스**: BabyDoge (2021-06 출시, 여전히 거래량 활발)
- **사실상 dead 케이스**: 2021년 출시된 수만 개의 BSC 토큰 대다수

**가설**: BNB Chain memecoin의 생존율(상장 후 1년 기준 거래량 유지 비율)이 ERC-20/Solana 대비 낮다.

#### 패턴 A3: 2022년 시기 효과

2022년 Luna 붕괴와 FTX 붕괴 시기, 모든 체인이 타격을 받았으나 회복 속도가 다름:
- **ETH 토큰**: 2023년 부분 회복 (L2 부상 효과)
- **Solana 토큰**: 2023년 후반부터 회복 (memecoin + DePIN)
- **BNB Chain 토큰**: 회복 속도 가장 느림 (CZ 사임, SEC 압박)

### 3.2. ERC-20 토큰의 관찰된 패턴 (가설)

#### 패턴 B1: Blue chip의 안정성

ETH 메이저 DeFi 토큰들은 BNB Chain 1세대 대비 상대적으로 안정적인 회복:
- UNI, AAVE, MKR, SNX 등은 ATH 대비 60-80% 하락 수준 (BNB Chain 1세대의 -90%+ 대비 양호)

#### 패턴 B2: L2 출현으로 인한 distribution 효과

2023년 Arbitrum, Optimism, Base의 등장으로 ERC-20 생태계가 분화:
- L1 (Mainnet ETH) 토큰
- L2 (Arbitrum, Optimism) 토큰
- L3 (커스텀) 토큰

이 분화가 체인별 분석을 더 복잡하게 만듦.

**가설**: ERC-20 토큰을 L1과 L2로 분리하면 L2 토큰이 더 큰 변동성을 보일 가능성.

#### 패턴 B3: 신규 상장 토큰의 vintage 효과

2020-2021 출시 ERC-20 토큰 vs 2024-2025 출시 ERC-20 토큰의 성과 차이:
- 2020-2021 출시 (DeFi summer): 큰 ATH 후 큰 하락
- 2023-2024 출시 (RWA, AI 토큰): 더 안정적 패턴
- 2025 출시 (실시간): 평가 시기상조

### 3.3. Solana 토큰의 관찰된 패턴 (가설)

#### 패턴 C1: 양극화의 극치

Solana 토큰은 다른 체인 대비 극도의 양극화:
- **극도의 성공**: TRUMP (2025-01 출시, 상장 직후 ATH), JUP, PYTH
- **극도의 실패**: 2024-2025년 출시된 수만 개의 memecoin 대다수

**가설**: Solana 토큰의 수익률 분포의 왜도(skewness)와 첨도(kurtosis)가 다른 체인보다 극단적.

#### 패턴 C2: 2022 FTX 충격의 후유증

2022년 11월 FTX 붕괴 후 Solana 가격이 96% 하락 ($260 → $8). 이 시기 출시된 Solana 토큰의 성과는 극도로 나쁨.

**가설**: 2022 Q4 - 2023 Q1 Solana 토큰의 평균 수익률이 다른 체인 대비 유의하게 음의 outlier.

#### 패턴 C3: 2024 부활기 토큰의 outlier 성과

2024년 Solana 부활기에 상장된 토큰들 (특히 memecoin)은 단기간 매우 큰 상승 후 폭락 패턴:
- WIF, BONK, POPCAT 등의 시간 대비 수익률 패턴
- TRUMP 토큰의 상장 즉시 ATH 패턴

**가설**: 2024-2025년 Solana 토큰의 "상장 첫 주 수익률"이 다른 체인 대비 유의하게 높지만, "상장 후 90일 수익률"은 더 큰 음의 값.

### 3.4. 거래소별 listing 정책의 관찰 (가설)

#### 패턴 D1: Binance-BNB Chain 편향

저자의 실무 관찰에 의하면 (검증 필요):
- Binance Launchpad 토큰의 60-70%가 BNB Chain 기반
- Binance Spot 신규 listing의 BNB Chain 비율이 다른 거래소 대비 유의하게 높음

**가설**: Binance의 BNB Chain 토큰 listing 비율이 OKX/Bybit/Bitget/HTX 대비 통계적으로 유의하게 높다.

#### 패턴 D2: HTX-ERC20 편중

HTX (구 Huobi)의 자체 체인 Heco는 사실상 dead. 상장 토큰 대부분이 ERC-20.

**가설**: HTX 신규 listing의 ERC-20 비율이 80% 이상.

#### 패턴 D3: Bybit-Mantle 시도

Bybit는 2023년 Mantle 출범 후 Mantle 생태계 토큰 listing을 적극 시도. 그러나 Mantle 자체의 dApp 생태계가 제한적이어서 효과 제한적.

**가설**: Bybit listing의 Mantle 비율은 5% 미만이지만, 다른 거래소(Binance, OKX, Bitget)의 Mantle listing 비율 대비 의미 있게 높을 가능성.

### 3.5. 시기별 군집 패턴 (가설)

#### 패턴 E1: DeFi summer 군집 (2020 Q3 - 2021 Q2)
- Yield farming 토큰 군집: COMP, AAVE, YFI, CRV, SUSHI, CAKE, BAKE
- 모두 양의 alpha (ATH 시점 기준)
- 모두 음의 alpha (2024-2025 시점 기준)

#### 패턴 E2: NFT 군집 (2021 Q3 - 2022 Q1)
- NFT marketplace/infrastructure 토큰: LOOKS, BLUR, MAGIC EDEN 등
- 매우 짧은 가격 사이클
- BNB Chain의 NFT 토큰들이 가장 빠르게 dead

#### 패턴 E3: AI 토큰 군집 (2024 Q1 - 2025 Q4)
- AI 인프라 토큰: FET, AGIX, OCEAN, RNDR 등
- 주로 ERC-20 (일부 Solana)
- 2024년 큰 상승 후 2025년 조정

#### 패턴 E4: Memecoin 슈퍼사이클 (2024 Q1 - 현재)
- Solana memecoin: WIF, BONK, POPCAT, TRUMP
- BNB Chain memecoin: 신규 launches via Four.meme
- ERC-20 memecoin: PEPE, DOGE 등

#### 패턴 E5: RWA (Real World Assets) 군집 (2023 Q4 - 현재)
- ONDO, MKR, MPL, GFI 등
- 거의 전적으로 ERC-20
- 다른 카테고리 대비 안정적 패턴

---

## 4. 데이터 수집 계획

### 4.1. 데이터 소스

**Tier 1 — 가격 데이터**:
- CoinGecko API (무료 tier: 30 calls/min, 10,000 calls/month)
- CoinMarketCap API (Pro: $79/month for higher rate limits)
- 보완: 개별 거래소 API (Binance, OKX 등)

**Tier 2 — Listing 데이터**:
- 각 거래소 announcement 페이지 스크레이핑
- CoinMarketCap의 listing history
- CryptoRank.io listing tracker

**Tier 3 — 체인 분류**:
- CoinGecko의 platform field (가장 신뢰성 높음)
- DefiLlama의 protocol-chain mapping
- Etherscan/BscScan/Solscan 컨트랙트 검증

**Tier 4 — BTC 벤치마크**:
- Binance API의 BTC-USDT 시간별 데이터 (Phase 1과 동일)
- ETH-USDT 보조 벤치마크

### 4.2. 표본 선정 기준

**포함 기준**:
1. 2020-01-01 ~ 2025-12-31 사이에 5개 거래소(Binance, OKX, Bybit, Bitget, HTX) 중 하나 이상에 신규 상장
2. 상장일 기준 시가총액 ≥ $1M (dust 토큰 제외)
3. 체인 분류가 명확함 (BNB Chain / ERC-20 / Solana)
4. 상장일부터 최소 90일 이상 가격 데이터 존재
5. 거래량 ≥ $10K daily (사실상 비거래 토큰 제외)

**예상 표본 크기**:
- 보수적: N = 200-300 (엄격한 필터)
- 중간: N = 500-700 (적정 필터)
- 광범위: N = 1,000-1,500 (느슨한 필터)

**권장**: 중간 규모 (N=500-700)로 시작

### 4.3. 변수 정의

| 변수 | 정의 | 측정 |
|------|------|------|
| token_symbol | 토큰 심볼 | TEXT |
| token_name | 토큰 이름 | TEXT |
| listing_exchange | 첫 listing 거래소 | CATEGORICAL |
| listing_date | 첫 거래 시작일 | DATE |
| host_chain | 기반 체인 | BNB / ERC20 / Solana |
| token_category | 카테고리 | DeFi/NFT/AI/Meme/RWA/L2/etc |
| initial_price_usd | 상장 첫 시간 가격 | FLOAT |
| initial_market_cap | 상장 첫 시간 시가총액 | FLOAT |
| ret_30d | 상장 30일 후 수익률 | % |
| ret_90d | 상장 90일 후 수익률 | % |
| ret_180d | 상장 180일 후 수익률 | % |
| ret_365d | 상장 365일 후 수익률 | % |
| btc_ret_same_period | 같은 기간 BTC 수익률 | % |
| btc_adj_ret_30d | BTC 조정 30일 수익률 | % |
| btc_adj_ret_90d | BTC 조정 90일 수익률 | % |
| btc_adj_ret_180d | BTC 조정 180일 수익률 | % |
| btc_adj_ret_365d | BTC 조정 365일 수익률 | % |
| btc_regime | 상장 시점 BTC 국면 | Bull/Bear/Flat |
| current_status | 현재 상태 | Active/Delisted/Inactive |

---

## 5. 방법론

### 5.1. 기술 통계

**체인별 그룹 비교**:
- 평균, 중앙값, 표준편차, 사분위수 (Q1, Q3)
- 왜도(skewness), 첨도(kurtosis)
- 음의 수익률 비율 (Phase 1 방법론 차용)

### 5.2. 단변량 검정

**ANOVA**:
- H₀: μ_BNB = μ_ETH = μ_SOL
- H₁: 적어도 하나는 다름
- 사후 분석: Tukey HSD, Bonferroni 교정

**Kruskal-Wallis (비모수)**:
- 정규성 가정 위배 시 사용
- Phase 1의 Wilcoxon 사용 패턴과 일관

### 5.3. 다변량 회귀

**Specification 1 (단순)**:
```
ret_365d = β₀ + β₁·BNB + β₂·SOL + β₃·BTC_ret + ε
(reference: ERC-20)
```

**Specification 2 (vintage 통제)**:
```
ret_365d = β₀ + β₁·BNB + β₂·SOL + β₃·BTC_ret 
         + γ_year + δ_quarter + ε
```

**Specification 3 (전체 통제)**:
```
ret_365d = β₀ + β₁·BNB + β₂·SOL + β₃·BTC_ret 
         + γ_year + δ_quarter 
         + θ_category + φ_exchange + ε
```

각 specification 비교를 통해 chain effect의 robustness 평가.

### 5.4. Vintage 효과 분리

**Year-Chain interaction analysis**:
- 연도별로 체인별 평균 수익률 plot
- 시기 효과와 체인 효과의 상호작용 시각화

**Decomposition**:
- 전체 chain effect = pure chain effect + vintage effect + interaction
- ANCOVA 또는 mixed-effects model

### 5.5. 군집 분석

**K-means clustering** (k=3-5 검토):
- 입력: ret_30d, ret_90d, ret_365d, btc_adj_ret, volatility
- 출력: 토큰 군집 식별

**DBSCAN**:
- outlier 자동 식별
- "extreme winners" vs "extreme losers" 식별

### 5.6. 거래소-체인 분포 분석

**Chi-square test of homogeneity**:
- H₀: 거래소별 체인 분포가 동일
- H₁: 거래소별 체인 분포가 다름

**Standardized residuals**:
- 어떤 거래소-체인 조합이 기댓값보다 많거나 적은지 식별

---

## 6. 잠재적 함정과 통제 방법

### 6.1. Selection Bias

**문제**: 분석 대상에 포함되는 토큰 자체가 편향
- "거래량 $10K 이상"이라는 기준이 dead 토큰 제외
- 그러나 dead가 된 이유가 체인별로 다를 수 있음

**완화**:
- Dead 토큰 별도 추적
- "Survival analysis" 추가 (Cox proportional hazards model)

### 6.2. Survivorship Bias

**문제**: 상장폐지된 토큰을 분석에서 제외하면 잔존 토큰들의 성과가 과대평가됨

**완화**:
- 상장폐지 토큰 명시적 추적
- "Listing → Delisting까지의 전체 수익률" 별도 분석

### 6.3. Vintage Effect Confounding

**문제**: 체인별 출시 시기 분포가 다르면 시기 효과가 체인 효과로 잘못 귀속

**완화**:
- Year fixed effects
- BTC regime control
- Year-chain interaction 분석

### 6.4. Exchange Listing Standards

**문제**: 거래소별로 listing 기준이 다름. Binance는 더 엄격, MEXC는 느슨 등.

**완화**:
- Exchange fixed effects
- 거래소별 sub-sample analysis

### 6.5. Chain Migration

**문제**: 토큰이 체인을 이전하는 경우 (예: BSC → ETH bridge)

**완화**:
- "Original chain"으로 분류 (첫 출시 체인)
- Multi-chain 토큰은 "primary chain" 사용

### 6.6. Stablecoin과 Wrapped Tokens 제외

**필수**: USDT, USDC, BUSD, WBTC, WETH 등 명시적 제외
**이유**: 이들은 가격이 고정되거나 다른 자산을 추종하므로 분석 대상 아님

---

## 7. 법적·윤리적 프레임워크

### 7.1. 핵심 원칙

1. **거래소를 직접 비난하지 않음** — 통계적 패턴 기록만
2. **체인 발행 주체 비난 회피** — Binance, Solana Labs, Ethereum Foundation 등 직접 언급 금지
3. **개별 토큰 비난 회피** — 케이스 스터디 시 익명화
4. **인과 주장 회피** — "체인 → 가격" 인과 주장 금지, 상관관계만

### 7.2. 위험 요소

**Binance와의 관계**:
- 본 연구가 "BNB Chain underperformance" 결과를 보일 경우 Binance와의 비즈니스 관계 영향 가능
- 저자의 Phase 1 SSRN 논문이 Binance 데이터에 의존하므로 이중 위험

**완화 전략**:
- 결과를 "specific period (2020-2025)" 한정으로 명시
- "Future periods may differ" 명시
- "No causal claim" 강조
- "Multiple confounders unaddressed" 솔직 인정

### 7.3. 이해관계 공개

본 연구는 Phase 1과 동일한 COI framework 적용:
- 저자의 자문 고객 명단 (2017-현재)
- 표본 토큰 중 자문 관계 토큰 명시 + 분석 제외
- 보유 포지션 공개

---

## 8. Phase 1, 2, 3과의 관계

### 8.1. 연구 프로그램 내 위치

```
Phase 1 (SSRN 6632838, 2026-04): 72시간 쇼크 (N=52)
  → 시간적 분석 

Phase 2 (목표: 2026 Q4): N=200 확장 + 365-day cliff pre-registration
  → 강건성 검증

Phase 3 (목표: 2027 Q1-Q2): Disclosure Timing Around Token Unlocks  
  → 정보 비대칭 메커니즘

Phase 4 (목표: 2027 Q3-Q4, 본 논문): Chain-level Analysis
  → 횡단면 분석 (체인 차원)

Phase 5 (잠재): Cross-jurisdiction comparison
  → 규제 환경 차이
```

### 8.2. Phase 1과의 데이터 시너지

Phase 1의 52개 이벤트는 모두 unlock events인데, 이를 chain별로 분류 가능:
- 즉시 가능: Phase 1의 52개 토큰을 BNB/ERC20/SOL로 분류
- N=52는 chain별 분석에 작지만, 사전 검증용으로 활용 가능

### 8.3. Phase 3과의 메서드 시너지

Phase 3의 disclosure timing 분석은 chain별로 분리하면 더 풍부한 결과:
- BNB Chain 재단의 disclosure pattern vs ETH/SOL 재단의 pattern
- 거래소-체인-disclosure의 3중 상호작용

---

## 9. 실행 일정과 자원

### 9.1. Phase 4 실행 시점

**전제 조건**:
- Phase 1 SSRN 승인 완료 (2026 Q2)
- Phase 1 인용 ≥ 1 (2026 Q4)
- Phase 2 완료 (2026 Q4)
- Phase 3 완료 (2027 Q2)

**실행 시기**: **2027년 Q3-Q4**

### 9.2. 자원 추정

| 항목 | 시간/비용 |
|------|----------|
| 데이터 수집 (수동 + 스크립트) | 200-400 시간 |
| API 비용 (CMC Pro 1년) | $948 |
| Dune Analytics | $240-800/월 × 6 |
| 분석 (저자) | 200 시간 |
| 작성 + 수정 | 100 시간 |
| 통계 컨설팅 | $2,000-5,000 |
| 법적 검토 | $3,000-8,000 |
| 총 예산 | $20,000 - $40,000 |

---

## 10. 즉시 가능한 사전 작업

### 10.1. Phase 1 데이터의 chain 분류 (1일)

기존 Phase 1의 52개 unlock 이벤트를 BNB/ERC20/SOL로 분류:
- TIA → Cosmos (분석에서 제외 또는 별도 카테고리)
- JTO → Solana
- ONDO → ERC-20
- W (Wormhole) → Solana
- BLAST → ERC-20 (L2)
- ZK (ZKsync) → ERC-20 (L2)
- TRUMP → Solana
- ... (나머지 45개 분류 필요)

이 분류를 통해 N=52 내에서 미니 chain analysis 가능 (저장력 약하지만 사전 신호).

### 10.2. 데이터 수집 Python 스크립트 (3-5일)

CoinGecko API 활용한 자동 수집 스크립트:
```python
# 의사 코드
import requests

def get_token_chain_info(token_id):
    """CoinGecko API로 토큰의 platform 정보 가져오기"""
    url = f"https://api.coingecko.com/api/v3/coins/{token_id}"
    response = requests.get(url)
    return response.json()['platforms']

def get_historical_prices(token_id, days):
    """월별 가격 데이터 수집"""
    url = f"https://api.coingecko.com/api/v3/coins/{token_id}/market_chart"
    params = {'vs_currency': 'usd', 'days': days, 'interval': 'monthly'}
    return requests.get(url, params=params).json()
```

### 10.3. 거래소 listing 데이터 수집 (1주)

각 거래소의 official announcement 페이지 스크레이핑:
- Binance Listings: https://www.binance.com/en/support/announcement/list/48
- OKX Listings: https://www.okx.com/help/announcements-new-listings
- Bybit Listings: https://announcements.bybit.com/en-US/?category=new_crypto
- Bitget Listings: https://www.bitget.com/support/sections/12560603471769
- HTX Listings: https://www.htx.com/support/sections/360001027571

---

## 11. 검증 가능한 사전 신호 (Quick Wins)

### 11.1. 즉시 가능한 manual lookup (Claude 활용)

다음은 Dennis님이 즉시 검증할 수 있는 specific data points:

#### 11.1.1. BNB Chain DEX 토큰의 ATH 대비 현재 가격 (2026년 4월 기준)

| 토큰 | ATH 시점 가격 | 2026-04-24 추정 가격 | ATH 대비 |
|------|-------------|---------------------|---------|
| CAKE | $44.18 (2021-04) | ~$1.50 | -97% |
| XVS | ~$147 (2021-05) | ~$5 추정 | -97% |
| BAKE | $8.38 (2021-04) | ~$0.20 추정 | -98% |

**이는 검증 가능한 공개 정보입니다. Dennis님이 CoinGecko에서 직접 확인 가능합니다.**

#### 11.1.2. Solana DEX 토큰 비교

| 토큰 | ATH 시점 | 2026-04 | ATH 대비 |
|------|---------|---------|---------|
| RAY (Raydium) | $16.83 (2021-09) | ~$3 추정 | -82% |
| ORCA | $24.32 (2021-08) | ~$2 추정 | -92% |

#### 11.1.3. ERC-20 DEX 토큰 비교

| 토큰 | ATH 시점 | 2026-04 | ATH 대비 |
|------|---------|---------|---------|
| UNI (Uniswap) | $44.97 (2021-05) | ~$8 추정 | -82% |
| SUSHI | $23.38 (2021-03) | ~$1 추정 | -96% |

### 11.2. 사전 패턴 (정량 검증 필요)

위 데이터로부터의 잠정적 관찰:
- BNB Chain DEX 1세대: -97% ~ -98%
- Solana DEX 1세대: -82% ~ -92%
- ERC-20 DEX 1세대: -82% ~ -96%

**가설**: BNB Chain DeFi 1세대 토큰의 ATH 대비 하락률이 다른 체인 대비 가장 큼.

**그러나 주의**: 이는 매우 작은 표본(체인당 2-3개)이며, "DeFi 1세대"라는 cherry-picked 카테고리. 본격 분석에서는 모든 카테고리 포함 N=500+ 필요.

---

## 12. 결론과 다음 단계

### 12.1. 본 아이디어 노트의 한계

명확히 합니다:
1. **본 노트의 모든 "패턴"은 가설이며 검증 필요**
2. **정량적 결론은 본 노트에서 도출되지 않음**
3. **본격 분석을 위해서는 데이터 수집 작업 필수**
4. **2027년 Q3-Q4가 현실적 실행 시점**

### 12.2. 즉시 가능한 사전 작업

1. ✅ **Phase 1의 52개 토큰 chain 분류** (1일)
2. ✅ **데이터 수집 Python 스크립트 작성** (3-5일)
3. ✅ **거래소별 listing announcement 수집** (1주)
4. ⏸️ **본격 분석은 2027년**

### 12.3. Phase 4 Go/No-Go 결정 시점

**2027년 Q2 시점에 평가**:
- Phase 1, 2, 3 모두 성공적으로 완료되었는가?
- Phase 4를 위한 데이터 인프라가 준비되었는가?
- 경쟁 논문이 출간되지 않았는가?
- 저자의 capacity가 12-18개월 추가 작업 가능한가?

조건 미충족 시 Phase 5로 건너뛰거나 Phase 4 연기.

---

## 13. 솔직한 자기 평가

### 강점
- ✅ 실무 8년 경험 기반의 sophisticated 가설
- ✅ Phase 1, 2, 3과 자연스러운 연결
- ✅ 실증 가능한 명확한 가설 구조
- ✅ 정책적 함의 (투자자 보호)

### 약점
- ⚠️ 데이터 수집 작업량 매우 큼 (Phase 1의 5-10배)
- ⚠️ Vintage effect와 chain effect 분리가 통계적으로 어려움
- ⚠️ Selection bias 통제가 까다로움
- ⚠️ Binance 비즈니스 관계 잠재적 영향
- ⚠️ N=500+ 데이터 품질 보장 어려움

### 자기 점수
**6.5/10** — 좋은 아이디어이지만, Phase 3보다 실행 난이도가 높고 학술적 노블티는 약간 낮음. 노가다가 심함

**우선순위**: Phase 3 > Phase 2 > Phase 4

---

## 14. 마치는 메시지

살펴봐야할 것들이 좀 많네요. 바이낸스 외에 자사 체인이 성공한 예도 거의 없기에 메인넷 경쟁에 대해서 어떻게 풀어갈지가 고민.


---

**저자**: 김호광 (HoKwang Kim)
**ORCID**: 0009-0002-0962-2175
**이메일**: gameworker@gmail.com
**문서 작성**: 2026년 4월 24일
**버전**: 0.1 (초기 한국어 초안)
