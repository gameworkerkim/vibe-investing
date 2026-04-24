# Awesome Claude Quant Scripts

> **A curated reference for quantitative trading strategies and Claude-assisted prototyping.**
> 대표 퀀트 전략, 학계·업계 대가들의 원전(原典), 그리고 Claude(Anthropic)를 활용해 즉시 프로토타입 가능한 프롬프트·코드 스크립트 큐레이션.

**Maintainer:** Dennis Kim · 
**License:** CC BY-SA 4.0 — 자유롭게 공유·각색(출처 표기)
**Status:** v1.0 · Living document

---

## 📑 Table of Contents

1. [Introduction](#-introduction)
2. [Strategy Taxonomy](#-strategy-taxonomy)
3. [Core Factor Strategies (4대 팩터)](#-core-factor-strategies)
    - [1. Value / 가치](#1-value--가치)
    - [2. Growth / 성장](#2-growth--성장)
    - [3. Quality / 퀄리티](#3-quality--퀄리티)
    - [4. Momentum / 모멘텀](#4-momentum--모멘텀)
4. [Advanced Strategies (고급 전략)](#-advanced-strategies)
    - [5. Multi-Factor / 멀티 팩터](#5-multi-factor--멀티-팩터)
    - [6. Trend Following / 추세 추종](#6-trend-following--추세-추종)
    - [7. Statistical Arbitrage / 페어 트레이딩](#7-statistical-arbitrage--페어-트레이딩)
    - [8. Machine Learning-based / 머신러닝 기반](#8-machine-learning-based--머신러닝-기반)
5. [General Claude Prompt Templates](#-general-claude-prompt-templates)
6. [Recommended Resources](#-recommended-resources)
7. [Disclaimer](#%EF%B8%8F-disclaimer)

---

## Introduction

퀀트 트레이딩(Quantitative Trading)은 **수리·통계·머신러닝 모델**을 이용해 시장의 체계적 이상현상(anomaly)과 초과수익(alpha)을 포착하는 접근법이다. 이 문서는 세 층(three layers)을 하나로 엮는다.

| Layer | 내용 |
|---|---|
| **이론층 (Theory)** | 학계·업계에서 반복 검증된 팩터·전략의 원전 논문과 서적 |
| **실무층 (Implementation)** | 각 전략을 돌릴 수 있는 최소한의 Python 코드 골격 |
| **AI 협업층 (Claude)** | 전략을 한 줄로 불러내는 재사용 가능한 Claude 프롬프트 템플릿 |

Claude를 활용한 트레이딩 스크립트가 부상하는 이유는 두 가지다. 첫째, 대부분의 퀀트 로직은 **정해진 설계 패턴**(유니버스 → 팩터 산출 → 랭킹 → 리밸런싱 → 성과 평가)을 따르므로 LLM이 보일러플레이트를 빠르게 생성할 수 있다. 둘째, 논문·API 문서·시장 데이터 등 **멀티소스 정보 통합**이 LLM의 강점과 정확히 맞닿는다.

단, **중요 전제**: Claude가 생성한 코드는 항상 
(1) 룩어헤드 편향(look-ahead bias), 
(2) 생존 편향(survivorship bias), 
(3) 거래비용·슬리피지 반영 여부를 **사람이 직접** 검증해야 한다.

직접 검증할 능력이 없다면, 다른 LLM을 통해서라도 교차 검증 및 환각을 필터링해야 한다.

---

## 🗺️ Strategy Taxonomy

```text
Quantitative Trading Strategies
│
├── Core Factor Strategies (핵심 팩터)
│   ├── Value      (가치)     — PER, PBR, EV/EBITDA, Dividend Yield
│   ├── Growth     (성장)     — EPS growth, Sales growth, ROE
│   ├── Quality    (퀄리티)   — ROE, Gross Profitability, Debt/Equity
│   └── Momentum   (모멘텀)   — 12M-1M, RSI, MACD
│
└── Advanced Strategies (고급 전략)
    ├── Multi-Factor          — Value × Momentum, Smart Beta
    ├── Trend Following       — Turtle, Donchian, Moving Average crossovers
    ├── Statistical Arbitrage — Pairs Trading, Cointegration, Mean Reversion
    └── Machine Learning      — Tree ensembles, Deep learning, NLP/Sentiment
```

---

## Core Factor Strategies

### 1. Value / 가치

**개요**
주식의 내재가치(intrinsic value)보다 현재 시장가가 저평가된 자산을 매수해 평균 회귀(reversion)에서 수익을 얻는 가장 고전적인 접근.
핵심 지표와 벨류 투자의 본질을 이해한다면 모든 주식의 가치는 본질에서 벗어 날 수 없다는 평범한 진리가 가장 큰 파괴력을 가진다.

**핵심 지표**
PER · PBR · EV/EBITDA · P/FCF · 배당수익률(Dividend Yield) · EV/Sales

**대표 대가 & 레퍼런스 (Masters & Primary References)**

| Author | Work | Year |
|---|---|---|
| Benjamin Graham & David Dodd | *Security Analysis* | 1934 |
| Benjamin Graham | *The Intelligent Investor* | 1949 |
| Warren Buffett | Berkshire Hathaway Shareholder Letters | 1977– |
| Eugene F. Fama & Kenneth R. French | "The Cross-Section of Expected Stock Returns", *Journal of Finance* 47(2) | 1992 |
| Joel Greenblatt | *The Little Book That Beats the Market* (Magic Formula) | 2005 |
| Cliff Asness, Andrea Frazzini, Lasse H. Pedersen | "Value and Momentum Everywhere", *Journal of Finance* 68(3) | 2013 |

**Claude Prompt Template**

```text
당신은 퀀트 애널리스트입니다. 아래 스펙으로 Value 팩터 백테스트 코드를 Python으로 작성해주세요.

[UNIVERSE]    : KOSPI200
[FACTORS]     : PBR, PER, EV/EBITDA (동일가중 Z-score 합성)
[FILTERS]     : 시가총액 1,000억원 이상, 적자 기업 제외, 금융/지주사 제외
[REBALANCING] : 분기별, 상위 20% 동일비중 매수
[PERIOD]      : 2015-01-01 ~ 오늘
[BENCHMARK]   : KOSPI200 총수익지수
[LIBS]        : pandas, numpy, yfinance (또는 pykrx), matplotlib

출력 항목:
- 누적수익률(Cumulative Return), CAGR
- 샤프비율(Sharpe), 소티노비율(Sortino)
- 최대낙폭(MDD), Calmar Ratio
- 연도별 수익률 테이블
- 팩터 Z-score 분포 히스토그램
- 룩어헤드 편향 방지 주석을 각 스텝에 명시할 것
```

**Python Skeleton**

```python
import pandas as pd
import numpy as np
from scipy.stats import zscore

def composite_value_score(fundamentals: pd.DataFrame) -> pd.Series:
    """PBR, PER, EV/EBITDA를 결합한 Value 팩터 스코어. 낮을수록 저평가."""
    # Winsorize 1%~99%로 이상치 제거
    clean = fundamentals[['PBR', 'PER', 'EV_EBITDA']].clip(
        lower=fundamentals.quantile(0.01),
        upper=fundamentals.quantile(0.99),
        axis=1
    )
    # 낮은 값이 좋으므로 부호를 뒤집어 Z-score
    z = -clean.apply(zscore, nan_policy='omit')
    return z.mean(axis=1)  # 동일 가중 합성

def value_portfolio(scores: pd.Series, top_pct: float = 0.2) -> list:
    """상위 top_pct 종목을 동일비중으로 선택."""
    cutoff = scores.quantile(1 - top_pct)
    return scores[scores >= cutoff].index.tolist()
```

---

### 2. Growth / 성장

**개요**
이익·매출이 평균보다 빠르게 성장하는 기업에 프리미엄 가격을 지불해, 미래의 실현 성장률을 시장이 충분히 반영하지 못하는 구간에서 초과수익을 얻는 전략.
개인적으로 NVidia, 명품 회사 수익율을 사랑하며 성장주, 미래에 포텐이 터질 기업, 파괴적 혁신 기업에 투자하는 편이다. 
다만, 닷컴 버블처럼 이번 나스닥의 폭발적 성장은 다소 두렵다.

**핵심 지표**
EPS 성장률 · 매출 성장률 · ROE · 영업이익 증가율 · Forward P/E 대비 성장률 (PEG)

**대표 대가 & 레퍼런스**

| Author | Work | Year |
|---|---|---|
| Philip A. Fisher | *Common Stocks and Uncommon Profits* | 1958 |
| Peter Lynch | *One Up on Wall Street* (PEG 대중화) | 1989 |
| T. Rowe Price Jr. | "Picking Growth Stocks" (Barron's essays) | 1939– |
| William O'Neil | *How to Make Money in Stocks* (CAN SLIM) | 1988 |

**참고:** Value vs Growth의 장기 스프레드 동학에 대한 체계적 분석은 Fama-French 3-factor(1993)와 5-factor(2015) 모델을 참조.

**Claude Prompt Template**

```text
당신은 주식 리서치 애널리스트입니다. Growth 팩터 스크리너를 Python으로 구현해주세요.

조건:
- 유니버스: S&P500
- 3년 평균 EPS 성장률 > 15%
- 3년 평균 매출 성장률 > 10%
- ROE > 15% (최근 4분기)
- Forward P/E < 40 (성장과 가격의 균형)
- PEG < 1.5
- 현금흐름이 순이익 대비 80% 이상

출력:
- 통과 종목 리스트와 각 지표 값
- 섹터 분포 파이 차트
- 가장 최근 분기 어닝 서프라이즈 여부
```

**Python Skeleton**

```python
def growth_screen(fundamentals: pd.DataFrame) -> pd.DataFrame:
    cond = (
        (fundamentals['EPS_3Y_CAGR'] > 0.15) &
        (fundamentals['Sales_3Y_CAGR'] > 0.10) &
        (fundamentals['ROE_TTM'] > 0.15) &
        (fundamentals['Forward_PE'] < 40) &
        (fundamentals['PEG'] < 1.5) &
        (fundamentals['CFO_to_NI'] > 0.8)
    )
    return fundamentals.loc[cond].sort_values('EPS_3Y_CAGR', ascending=False)
```

---

### 3. Quality / 퀄리티

**개요**
재무적으로 튼튼하고(낮은 부채) 자본을 효율적으로 쓰며(높은 ROE·ROIC) 이익이 안정적인 기업을 편입. 약세장 방어력이 좋고 Value·Momentum과의 상관관계가 낮아 포트폴리오 분산에 유용.
인프라, 배당, 성장이 끝나고 일정한 수익이 남는 퀄리티 좋은 기업에 투자하는 전략이다. 

**핵심 지표**
ROE · ROIC · Gross Profit / Assets · 부채비율(D/E) · 이익 변동성 · Accruals

**대표 대가 & 레퍼런스**

| Author | Work | Year |
|---|---|---|
| Robert Novy-Marx | "The Other Side of Value: The Gross Profitability Premium", *Journal of Financial Economics* 108(1) | 2013 |
| Clifford Asness, Andrea Frazzini, Lasse H. Pedersen | "Quality Minus Junk", *Review of Accounting Studies* 24 | 2019 |
| Jeremy Siegel | *The Future for Investors* (defensive high-quality) | 2005 |
| Terry Smith | Fundsmith Owner's Manual | 2010– |

**Claude Prompt Template**

```text
Quality 팩터 포트폴리오를 구성하는 Python 스크립트를 만들어주세요.

Quality Score = z(Gross Profitability) + z(ROE) + z(−D/E) + z(−Earnings Volatility)

- 음수 지표(부채비율, 이익 변동성)는 부호를 반전
- 각 지표의 연단위 winsorize(1%~99%)
- Z-score 합산 후 상위 30% 선택
- 리밸런싱: 월간
- 유니버스: 러셀1000 (리서치용 프록시는 iShares IWB 구성종목)

추가 출력: Quality 상위 포트폴리오가 Value·Momentum 상위와 얼마나 겹치는지 Venn diagram 또는 교집합 비율.
```

**Python Skeleton**

```python
def quality_score(df: pd.DataFrame) -> pd.Series:
    signs = {
        'GrossProfitability': +1,   # GP / Assets, 높을수록 좋음
        'ROE':                +1,
        'DebtToEquity':       -1,   # 낮을수록 좋음
        'EarningsVolatility': -1,   # 낮을수록 좋음
    }
    z_sum = pd.Series(0.0, index=df.index)
    for col, sign in signs.items():
        w = df[col].clip(lower=df[col].quantile(0.01),
                         upper=df[col].quantile(0.99))
        z_sum += sign * ((w - w.mean()) / w.std(ddof=0))
    return z_sum
```

---

### 4. Momentum / 모멘텀

**개요**
"오르는 것은 계속 오르고 내리는 것은 계속 내린다." 최근 수익률이 높은 종목을 매수(long), 낮은 종목을 매도(short)하여 중기 추세를 포착. 4대 팩터 중 가장 반복적으로 검증됐으며 Value와의 저상관이 포트폴리오에서의 존재 이유.

**핵심 지표**
12개월 - 1개월 수익률(12M-1M, UMD) · 6개월 수익률 · RSI · MACD · Absolute Momentum

**대표 대가 & 레퍼런스**

| Author | Work | Year |
|---|---|---|
| Narasimhan Jegadeesh & Sheridan Titman | "Returns to Buying Winners and Selling Losers", *Journal of Finance* 48(1) | 1993 |
| Mark M. Carhart | "On Persistence in Mutual Fund Performance" (4-factor, UMD 추가), *Journal of Finance* 52(1) | 1997 |
| Tobias J. Moskowitz, Yao Hua Ooi, Lasse H. Pedersen | "Time Series Momentum", *Journal of Financial Economics* 104(2) | 2012 |
| Cliff Asness, Tobias Moskowitz, Lasse Pedersen | "Value and Momentum Everywhere", *Journal of Finance* 68(3) | 2013 |
| Gary Antonacci | *Dual Momentum Investing* | 2014 |

**Claude Prompt Template**

```text
Cross-sectional momentum 백테스트를 Python으로 작성해주세요.

- 유니버스: KOSPI200 + KOSDAQ150 (중복 제거)
- 팩터: 12M-1M (최근 1개월 반전효과 제거)
- 방향: Long-only, 상위 20% 동일비중
- 리밸런싱: 월간 (매월 마지막 거래일)
- 거래비용: 편도 15bp 반영
- 볼라틸리티 타겟팅(옵션): 연 10% 표준편차로 레버리지 조정
- 벤치마크: KOSPI200

추가: Jegadeesh & Titman(1993)의 J=6, K=6 변형 버전도 함께 비교하는 토글 파라미터 추가.
```

**Python Skeleton**

```python
def momentum_12_1(prices: pd.DataFrame) -> pd.Series:
    """12개월 - 1개월 모멘텀 (월말 기준)."""
    ret_12m = prices.pct_change(252)
    ret_1m  = prices.pct_change(21)
    # (1 + r12)/(1 + r1) - 1 로 정확 계산
    return (1 + ret_12m).iloc[-1] / (1 + ret_1m).iloc[-1] - 1

def top_momentum_basket(mom: pd.Series, n: int = 40) -> list:
    return mom.nlargest(n).index.tolist()
```

---

## 🚀 Advanced Strategies

### 5. Multi-Factor / 멀티 팩터

**개요**
단일 팩터의 주기적 부진(예: Value의 2010년대 장기 언더퍼폼)을 완화하기 위해 **저상관 팩터를 결합**. 전통적으로 Value × Momentum 조합이 가장 견고하며, 여기에 Quality·Low Volatility를 추가한 4-factor 구성이 업계 표준.

**대표 대가 & 레퍼런스**

| Author | Work | Year |
|---|---|---|
| Eugene F. Fama & Kenneth R. French | "A Five-Factor Asset Pricing Model", *Journal of Financial Economics* 116(1) | 2015 |
| Cliff Asness et al. | "Value and Momentum Everywhere" | 2013 |
| Andrew Ang | *Asset Management: A Systematic Approach to Factor Investing* | 2014 |
| AQR Capital Management | White Papers (aqr.com/Insights) | ongoing |

**Claude Prompt Template**

```text
Multi-factor smart beta 포트폴리오를 Python으로 구현해주세요.

구성:
- Value     (25%): -z(PBR) + -z(PER) 평균
- Momentum  (25%): z(12M-1M)
- Quality   (25%): z(ROE) + z(−D/E) 평균
- Low Vol   (25%): -z(realized 252D volatility)

- 최종 Composite Score = 네 팩터의 랭크 기반 가중합
- 상위 50종목, 변동성 역가중(inverse volatility weighting)
- 월간 리밸런싱, 거래비용 10bp

출력: 각 서브 팩터의 기여도(contribution) 분해 및 시간에 따른 롤링 상관관계 히트맵.
```

---

### 6. Trend Following / 추세 추종

**개요**
가격의 방향성이 지속된다는 가정 위에 구축. 주식뿐 아니라 **선물·FX·원자재** 전반에서 효과가 확인되며, 꼬리위험(tail risk) 국면에서 방어력이 강해 주식 포트폴리오와 결합 시 이상적 헤지.
가장 기교적인 투자 기법 중 하나이며, 개인적으로 피하는 투자 기법이다. 내가 늘 차트를 볼 수 없기 때문이며 트렌드는 트럼프 앞에서 무너지기 때문이다.

**대표 대가 & 레퍼런스**

| Name | Work | Year |
|---|---|---|
| Richard Dennis / "Turtle Traders" | Donchian breakout 시스템 실전 검증 | 1983– |
| Michael W. Covel | *Trend Following*, *The Complete TurtleTrader* | 2004, 2007 |
| Andreas F. Clenow | *Following the Trend*, *Stocks on the Move* | 2013, 2015 |
| Hurst, Ooi, Pedersen (AQR) | "A Century of Evidence on Trend-Following Investing" | 2017 |
| Moskowitz, Ooi, Pedersen | "Time Series Momentum" | 2012 |

**Claude Prompt Template**

```text
Donchian Channel 기반 추세추종 시스템을 Python으로 구현해주세요.

- 대상: BTC/USD, ETH/USD, S&P500, 금 선물 (다자산)
- 진입: 20일 신고가 돌파 시 롱, 20일 신저가 돌파 시 숏 (또는 청산)
- 청산: 10일 반대편 채널 돌파
- 포지션 사이징: 2% 리스크 룰 (ATR 14 기반)
- 포트폴리오 레벨 변동성 타겟팅: 연 15%
- 거래비용: 편도 5bp, 슬리피지 2bp

출력:
- 자산별/포트폴리오 합계 누적수익률
- 상관관계 낮은 자산끼리 결합되었는지 확인 (상관 히트맵)
- 드로다운(drawdown) 구간과 회복 시간
```

**Python Skeleton**

```python
def donchian_signals(prices: pd.Series, lookback: int = 20) -> pd.Series:
    upper = prices.rolling(lookback).max().shift(1)
    lower = prices.rolling(lookback).min().shift(1)
    sig = pd.Series(0, index=prices.index)
    sig[prices > upper] = 1
    sig[prices < lower] = -1
    return sig.replace(to_replace=0, method='ffill').fillna(0)
```

---

### 7. Statistical Arbitrage / 페어 트레이딩

**개요**
경제적으로 유사한 두 자산이 일시적으로 스프레드가 벌어졌다가 회귀한다는 가정. **공적분(cointegration)** 관계가 통계적으로 안정적인 쌍을 찾아 스프레드가 Z-score 임계를 넘으면 상대 포지션을 구축.
컴퓨팅의 발달로 이런  페어 트레이딩의 스프레드는 줄어들고 있다.

**대표 대가 & 레퍼런스**

| Author | Work | Year |
|---|---|---|
| Evan G. Gatev, William N. Goetzmann, K. Geert Rouwenhorst | "Pairs Trading: Performance of a Relative-Value Arbitrage Rule", *Review of Financial Studies* 19(3) | 2006 |
| Edward O. Thorp | *A Man for All Markets* (Princeton/Newport 사례) | 2017 |
| Ganapathy Vidyamurthy | *Pairs Trading: Quantitative Methods and Analysis* | 2004 |
| D. B. Madan & S. L. Heston | 멀티에셋 mean-reversion 모형 (학술) | — |

**관련 업계:** James Simons의 Renaissance Technologies(메달리온 펀드)가 통계적 차익거래의 상징적 사례이나, 세부 전략은 비공개.

**Claude Prompt Template**

```text
공적분 기반 페어 트레이딩 스크리너 + 백테스트를 Python으로 작성해주세요.

[SCREENING]
- 유니버스: S&P500 동일 섹터 내 전체 쌍
- Engle-Granger 2-step 공적분 검정(p<0.05) 통과 쌍만 선별
- Hurst exponent < 0.4 (평균회귀성 확인)
- 최근 252일 데이터 사용

[BACKTEST]
- 스프레드 = log(P_A) - β·log(P_B) (β는 OLS 추정)
- 롤링 60일 Z-score 기준 진입/청산
  - Z < -2.0: 롱 스프레드 (A 매수, B 매도)
  - Z > +2.0: 숏 스프레드
  - |Z| < 0.5: 청산
- 베타 헤지, 자본 중립(dollar-neutral)
- 거래비용 편도 5bp

출력: 각 쌍의 p-value, 하프라이프(half-life), 백테스트 성과 테이블.
```

**Python Skeleton**

```python
import statsmodels.tsa.stattools as ts
import numpy as np

def test_cointegration(p1: pd.Series, p2: pd.Series) -> dict:
    score, pvalue, _ = ts.coint(np.log(p1), np.log(p2))
    return {'score': score, 'pvalue': pvalue}

def half_life(spread: pd.Series) -> float:
    """Ornstein-Uhlenbeck half-life 추정."""
    lag = spread.shift(1).dropna()
    delta = (spread - spread.shift(1)).dropna()
    beta = np.polyfit(lag.align(delta, join='inner')[0],
                      lag.align(delta, join='inner')[1], 1)[0]
    return -np.log(2) / beta
```

---

### 8. Machine Learning-based / 머신러닝 기반

**개요**
전통 팩터를 입력 피처로 쓰거나, 뉴스·SNS·오더북 등 **비정형 데이터**에서 알파를 추출. 주의점은 금융 데이터 특유의 **low SNR, 레짐 변화, 비IID** 구조로, 일반 ML 프로젝트 템플릿을 그대로 쓰면 **백테스트 과적합**이 극심해진다.
내가 똑똑하다면 뛰어들 분야이며, 인공지능 혁명으로 더욱 각광 받고 있다. LLM 덕분에 헤지 펀드뿐 아니라 개인도 가능할정도로 저렴해지고 있다.

**대표 대가 & 레퍼런스**

| Author | Work | Year |
|---|---|---|
| Marcos López de Prado | *Advances in Financial Machine Learning* | 2018 |
| Marcos López de Prado | *Machine Learning for Asset Managers* | 2020 |
| Stefan Jansen | *Machine Learning for Algorithmic Trading* (2nd ed.) | 2020 |
| Shihao Gu, Bryan Kelly, Dacheng Xiu | "Empirical Asset Pricing via Machine Learning", *Review of Financial Studies* 33(5) | 2020 |
| Ernest P. Chan | *Machine Trading* | 2017 |
| Rob Arnott et al. | "A Backtesting Protocol in the Era of Machine Learning" (*Journal of Financial Data Science*) | 2019 |

**Claude Prompt Template — 팩터 예측 ML**

```text
시계열 교차검증을 정확히 적용한 LightGBM 기반 알파 모델을 Python으로 만들어주세요.

[DATA]
- 피처: 12M-1M 모멘텀, 1M 리버설, PBR, ROE, 변동성(252d), 거래량 Z-score
- 타겟: 다음 달 수익률 (교차단면 rank-normalize)
- 유니버스: KOSPI200

[ML SETUP]
- Purged K-Fold CV (López de Prado 스타일), embargo=10 days
- LightGBM, early_stopping_rounds=50
- 하이퍼파라미터: Optuna 30 trial

[BACKTEST]
- 예측 상위 20% 롱, 하위 20% 숏 (dollar-neutral)
- 거래비용 10bp
- 월간 리밸런싱

[OUTPUT]
- 피처 중요도 (SHAP)
- 정보계수(IC) 시계열, 평균 IC
- 과적합 진단: PBO (probability of backtest overfitting)
```

**Claude Prompt Template — NLP 감성 알파**

```text
뉴스 헤드라인 감성 기반 단기 모멘텀 알파를 Python으로 프로토타입해주세요.

- 데이터: Yahoo Finance News RSS (무료) 또는 Alpha Vantage News API
- 감성 분석: FinBERT (ProsusAI/finbert) 사용
- 대상: 대형주 (시총 상위 200)
- 신호: 전일 뉴스 감성 점수의 종목별 집계
- 진입: 감성 상위 10%, 청산: 5거래일 후 또는 스탑
- 거래비용: 편도 10bp

주의: 뉴스 타임스탬프가 예측 시점보다 이후가 아닌지 확인 (룩어헤드 방지 체크리스트 포함).
```

---

## 🧰 General Claude Prompt Templates

전략과 무관하게 반복 사용할 수 있는 범용 템플릿.

### T1. Strategy Stress-Test

```text
다음 전략의 취약점을 체계적으로 분석해주세요.

[전략 코드 또는 규칙 기술]

점검 항목:
1. 룩어헤드 편향(Look-ahead bias)
2. 생존 편향(Survivorship bias)
3. 데이터 스누핑(Data snooping / multiple testing)
4. 레짐 변화 민감도 (2008, 2020 등 위기 구간 성과)
5. 거래비용·슬리피지·대차비용 현실성
6. 유동성 제약 (소형주 편중 여부)
7. 과적합 점검 — PBO, Deflated Sharpe Ratio

각 항목에 대해 (a) 현 상태 진단, (b) 수정 제안, (c) 관련 문헌을 제시해주세요.
```

### T2. Paper → Code

```text
다음 논문의 핵심 전략을 재현 가능한 Python으로 구현해주세요.

[논문 링크 또는 제목]

요구사항:
- 데이터 출처를 명시하고, 유사 공개 데이터(yfinance, FRED 등)로 대체 가능한 부분을 표시
- 각 수식 → 코드 라인 매핑을 주석으로 표기
- 논문 표와 동일한 성과 지표 테이블 재현
- 차이가 날 경우 원인 가설(샘플 기간, 유니버스 차이 등)을 나열
```

### T3. Risk Overlay

```text
아래 롱 포트폴리오에 체계적 리스크 오버레이를 추가해주세요.

[포트폴리오 설명]

적용할 레이어:
1. 변동성 타겟팅 (연 목표 10~15%)
2. VIX 기반 리스크-온/오프 스위치
3. 이동평균 기반 시장 국면 필터 (200일선 미만 시 현금 비중 증가)
4. 최대낙폭 기반 de-risking (MDD > 15% 시 50% 축소)

각 레이어 활성화 전/후 성과 비교표와, 레이어 추가에 따른 샤프·MDD 변화를 그래프로 보여주세요.
```

### T4. Crypto 특화 변형

```text
위 전략을 암호화폐 시장으로 이식해주세요.

고려사항:
- 24/7 거래 시간 (세션 구분 없음)
- 변동성 체계적으로 2~5배 높음 → 포지션 사이징 재캘리브레이션
- 거래소 간 가격 차이, 펀딩비 현실화
- 유니버스: CMC 상위 50, 스테이블코인 제외, 일평균 거래대금 하한
- 데이터 소스: CCXT 라이브러리 (Binance, Bybit, OKX)
- 백테스트 거래비용: 편도 10bp + 슬리피지 15bp
```

### T5. Live Paper Trading 전환

```text
백테스트 코드를 페이퍼 트레이딩 봇으로 리팩터링해주세요.

- 브로커 API: [Interactive Brokers / Alpaca / Binance Testnet]
- 주문 타입: 마켓·리밋 선택 가능
- 리스크 가드: 일 손실 한도 3%, 개별 종목 한도 5%
- 로깅: 주문·체결·PnL을 SQLite 또는 Parquet로 기록
- 실시간 모니터링 알림: Telegram Bot API
- 에러 시 자동 페일세이프(포지션 청산 후 봇 정지)
```

---

## Recommended Resources

### 교과서 (Textbooks)

- Andrew W. Lo & Jasmina Hasanhodzic — *The Heretics of Finance* (2009)
- Robert F. Engle & Andrew J. Patton — *Handbook of Financial Time Series*
- Stefan Jansen — *Machine Learning for Algorithmic Trading*, 2nd ed. (2020)
- Ernest P. Chan — *Quantitative Trading* (2008), *Algorithmic Trading* (2013), *Machine Trading* (2017)
- Marcos López de Prado — *Advances in Financial Machine Learning* (2018)

### 저널 (Journals)

- *Journal of Finance* · *Review of Financial Studies* · *Journal of Financial Economics* (학술 3대 저널)
- *Journal of Portfolio Management* · *Journal of Financial Data Science* (실무 지향)
- *SSRN Financial Economics Network* — preprint 허브 (ssrn.com/fen)

### 데이터·오픈소스 (Data & OSS)

- **Data:** yfinance · pykrx (KR) · FRED · Quandl · CCXT (crypto) · Alpha Vantage · Polygon.io
- **Backtesting:** `backtrader` · `vectorbt` · `zipline-reloaded` · `bt`
- **ML pipelines:** `mlfinlab` (López de Prado 공식) · `qlib` (Microsoft)
- **Portfolio optimization:** `PyPortfolioOpt` · `riskfolio-lib`
- **Statistics:** `statsmodels` · `arch` (GARCH) · `linearmodels`

### 연구기관 / 블로그

- AQR Capital Management — Insights (aqr.com/Insights)
- Research Affiliates — Publications (researchaffiliates.com)
- Two Sigma Insights — twosigma.com/insights
- Man AHL — man.com/insights
- Quantpedia — quantpedia.com (전략 데이터베이스)

---

## ⚠️ Disclaimer

본 문서의 모든 내용은 **교육 및 연구 목적**이며, 특정 금융 상품의 매수/매도 권유가 아닙니다.

- 과거 성과는 미래 수익을 보장하지 않습니다.
- 기재된 전략은 단순화된 예시이며, 실제 운용 시 수수료·세금·슬리피지·레짐 변화·규제에 따라 결과가 크게 달라집니다.
- Claude를 포함한 LLM이 생성한 코드에는 **사실 오류, 구조적 편향, 보안 취약점**이 포함될 수 있습니다. 모든 코드는 반드시 사람이 검토·재현 검증 후 소자본 페이퍼 트레이딩으로 충분히 시험한 뒤 실매매에 적용해야 합니다.
- 암호화폐·파생상품 등 고위험 자산은 원금 전액 손실 가능성이 존재합니다.

**작성자는 본 문서에 근거한 투자 결정으로 인한 어떠한 손실에 대해서도 책임지지 않습니다.**

---

## 🤝 Contributing

- 새 전략/논문/프롬프트 제안: Issue 또는 Pull Request
- 버그/오타 제보: Issue
- Fork 후 각자 도메인(예: Crypto-native, KR equity, FX)에 맞게 확장 환영

---

* updated: 2026-04-24*
