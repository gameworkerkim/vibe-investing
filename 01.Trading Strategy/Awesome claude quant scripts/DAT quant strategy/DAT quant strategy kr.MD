# DAT 전략 기업 — Mean Reversion Quant Script (Python + Kotlin)

## *Awesome Claude Quant Scripts 시리즈 — DAT Strategy Edition*

---

> *"Strategy(MSTR)는 이상한 물건이다. 80억 달러의 빚을 내어 610억 달러의 비트코인을 샀다.*
> *하지만 시장은 이를 1,520억 달러로 평가했다. 그렇다면 질문은 — 추가로 지불한 910억 달러는 무엇에 대한 값인가?"*
>
> — Jim Chanos, 2024년 12월 (MSTR 숏 포지션 공개 시)

---

## 📌 본 문서의 위치

본 문서는 [vibe-investing](https://github.com/gameworkerkim/vibe-investing) 레포의 다음과 결합됩니다:

- **칼럼**: [DAT 기업의 mNAV 아비트리지 전략](https://github.com/gameworkerkim/vibe-investing/blob/main/mNAV(Market-to-Net-Asset-Value)%20arbitrage/Dat%20mnav%20arbitrage%20strategy.MD)
- **시리즈**: [Awesome Claude Quant Scripts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD)

DAT mNAV 칼럼이 *어떤 종목이 DAT에 해당하는가*에 대한 답이라면, 이 문서는 *그 종목들 중 통계적으로 저평가된 진입 타이밍을 어떻게 식별하는가*에 대한 실행 코드입니다.

**Python**과 **Kotlin** 두 언어 버전을 모두 제공합니다. Python은 데이터 분석 표준, Kotlin은 JVM/Android/JetBrains 생태계 사용자를 위한 옵션입니다.

---

## 1. DAT (Digital Asset Treasury) 전략의 정의

DAT는 디지털 자산을 기업의 **핵심 재무 자산**으로 편입하는 전략입니다. 기업이 보유한 암호화폐(주로 비트코인, 이더리움)의 시장 가치가 기업 전체 가치의 **상당 부분을 차지**하는 경우를 말하며, 투자자는 기업 주식을 매수함으로써 *간접적으로 암호화폐에 투자*하는 효과를 얻을 수 있습니다.

### 1.1. 본 스크립트가 분석하는 NASDAQ + NYSE 상장 DAT 기업

| 티커 | 기업명 | 거래소 | 보유 자산 | 분류 |
|------|-------|-------|---------|------|
| **MSTR** | MicroStrategy / Strategy Inc. | NASDAQ | BTC | Pure-play DAT |
| **MARA** | Marathon Digital Holdings | NASDAQ | BTC | Mining + DAT |
| **RIOT** | Riot Platforms | NASDAQ | BTC | Mining + DAT |
| **GLXY** | Galaxy Digital | NASDAQ | BTC | Brokerage + DAT |
| **COIN** | Coinbase Global | NASDAQ | ETH proxy | Exchange (DAT 유사) |
| **BMNR** | BitMine Immersion | NYSE American | ETH | DAT 신규 |
| **SBET** | SharpLink Gaming | NASDAQ | ETH | DAT 전환 |

> **참고**: BMNR과 SBET은 비교적 최신 ETH 보유 기업으로, 데이터 기간이 짧을 수 있습니다. MSTR이 가장 풍부한 데이터를 제공하므로 *primary case study*로 사용됩니다.

---

## 2. 분석 프레임워크 개요

본 스크립트는 주식 가격과 기초 암호화폐 가격 간의 **통계적 관계를 분석**하여, 현재 시장에서 해당 기업의 주가가 *내재가치 대비 저평가되었는지* 판단합니다.

### 2.1. 5단계 분석 워크플로

```
① 가격 데이터 수집 (yfinance / Yahoo Finance API)
       ↓
② 피어슨 상관관계 분석 (DAT 페어가 실제로 동조하는지 검증)
       ↓
③ 가격 비율 (Stock / Crypto) 계산
       ↓
④ Rolling Z-Score 산출 (look-ahead bias 방지)
       ↓
⑤ 매수/매도 시그널 생성 (Z ≤ -2 매수, Z ≥ +2 매도)
```

### 2.2. 핵심 가설

> **"DAT 기업의 주가는 기초 암호화폐와 강한 상관관계(r > 0.75)를 가지며,**
> **이 비율이 평균에서 ±2σ 벗어나면 평균회귀(mean reversion) 압력이 작용한다."**

### 2.3. 알려진 함정 ⚠️

1. **Look-ahead Bias**: 전체 기간 평균 사용 시 발생 → 본 스크립트는 **90일 rolling window** 적용
2. **상관관계 변동성**: DAT 페어의 상관계수는 시간에 따라 변동 (예: 2022 위기 시 일시 deca correlation)
3. **mNAV Premium 변화**: Spot BTC ETF 출시(2024) 이후 MSTR의 *희소성 프리미엄*이 구조적으로 축소
4. **Sub-NAV 함정**: BMNR 사례 — mNAV 1x 아래로 떨어진 후에도 추가 -50% 하락 가능
5. **세금**: 한국 거주자 해외주식 양도소득세 22% (위탁계좌)
6. **외환 리스크**: USD/KRW 변동성 미반영

---

## 3. Python 구현 (메인 스크립트)

### 3.1. 의존성 설치

```bash
pip install yfinance pandas numpy matplotlib scipy
```

또는:

```bash
pip install -r requirements.txt
```

### 3.2. 전체 Python 코드

> 💡 **복사 사용**: 아래 코드 블록을 그대로 복사하여 `dat_zscore_strategy.py`로 저장하면 즉시 실행 가능합니다.

```python
"""
DAT (Digital Asset Treasury) Mean Reversion Quant Script
==========================================================

DAT 전략 기업 주가 vs. 보유 암호화폐 가격의 Z-Score 기반
평균회귀(Mean Reversion) 시그널 생성 스크립트.

저자: HoKwang Kim (Independent Researcher)
시리즈: vibe-investing / Awesome Claude Quant Scripts
라이선스: MIT
"""

import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from typing import Tuple, Dict, Optional
import warnings

warnings.filterwarnings("ignore")


# =============================================================================
# 설정 (Configuration)
# =============================================================================

DAT_PAIRS = {
    "MSTR": "BTC-USD",
    "MARA": "BTC-USD",
    "RIOT": "BTC-USD",
    "GLXY": "BTC-USD",
    "COIN": "ETH-USD",
    "BMNR": "ETH-USD",
    "SBET": "ETH-USD",
}

START_DATE = "2023-01-01"
END_DATE = "2026-04-27"

Z_BUY_THRESHOLD = -2.0
Z_SELL_THRESHOLD = 2.0
ROLLING_WINDOW = 90  # 90일 rolling Z-Score (look-ahead bias 방지)


# =============================================================================
# 핵심 분석 함수
# =============================================================================

def fetch_data(ticker: str, start: str, end: str) -> pd.Series:
    """yfinance로 종가 시계열 다운로드."""
    df = yf.download(ticker, start=start, end=end, progress=False)
    if df.empty:
        raise ValueError(f"{ticker}: 데이터 없음")
    close = df["Close"] if "Close" in df.columns else df.iloc[:, 0]
    if isinstance(close, pd.DataFrame):
        close = close.iloc[:, 0]
    return close.dropna()


def compute_zscore(
    stock_price: pd.Series,
    crypto_price: pd.Series,
    rolling_window: Optional[int] = None,
) -> pd.DataFrame:
    """
    가격 비율(stock/crypto)의 Z-Score 계산.

    rolling_window가 None이면 전체 기간 평균/표준편차 사용,
    값이 있으면 rolling window 적용 (look-ahead bias 방지).
    """
    df = pd.DataFrame({
        "stock": stock_price,
        "crypto": crypto_price,
    }).dropna()

    df["ratio"] = df["stock"] / df["crypto"]

    if rolling_window:
        df["mean_ratio"] = df["ratio"].rolling(rolling_window).mean()
        df["std_ratio"] = df["ratio"].rolling(rolling_window).std()
    else:
        df["mean_ratio"] = df["ratio"].mean()
        df["std_ratio"] = df["ratio"].std()

    df["zscore"] = (df["ratio"] - df["mean_ratio"]) / df["std_ratio"]
    return df


def generate_signals(
    df: pd.DataFrame,
    buy_threshold: float = Z_BUY_THRESHOLD,
    sell_threshold: float = Z_SELL_THRESHOLD,
) -> pd.DataFrame:
    """매수/매도 시그널 생성."""
    df = df.copy()
    df["signal"] = 0
    df.loc[df["zscore"] < buy_threshold, "signal"] = 1
    df.loc[df["zscore"] > sell_threshold, "signal"] = -1
    return df


def compute_correlation(stock: pd.Series, crypto: pd.Series) -> Tuple[float, float]:
    """피어슨 상관계수 + p-value."""
    aligned = pd.DataFrame({"s": stock, "c": crypto}).dropna()
    if len(aligned) < 30:
        return np.nan, np.nan
    corr, p = stats.pearsonr(aligned["s"], aligned["c"])
    return corr, p


# =============================================================================
# 시각화
# =============================================================================

def plot_analysis(df: pd.DataFrame, ticker: str, crypto: str,
                   save_path: Optional[str] = None):
    """3-패널 차트: 가격 / 비율 / Z-Score+시그널."""
    fig, axes = plt.subplots(3, 1, figsize=(14, 12), sharex=True)

    # (1) 가격 추이
    ax0 = axes[0]
    ax0.plot(df.index, df["stock"], label=f"{ticker}", color="blue", alpha=0.7)
    ax0_twin = ax0.twinx()
    ax0_twin.plot(df.index, df["crypto"], label=f"{crypto}", color="orange", alpha=0.7)
    ax0.set_title(f"Price Trend: {ticker} vs {crypto}")
    ax0.set_ylabel(f"{ticker} ($)", color="blue")
    ax0_twin.set_ylabel(f"{crypto} ($)", color="orange")
    h1, l1 = ax0.get_legend_handles_labels()
    h2, l2 = ax0_twin.get_legend_handles_labels()
    ax0.legend(h1 + h2, l1 + l2, loc="upper left")

    # (2) 가격 비율 + 평균/표준편차 밴드
    ax1 = axes[1]
    ax1.plot(df.index, df["ratio"], label="Price Ratio", color="purple")
    ax1.plot(df.index, df["mean_ratio"], label="Rolling Mean",
             color="red", linestyle="--")
    ax1.fill_between(
        df.index,
        df["mean_ratio"] - 2 * df["std_ratio"],
        df["mean_ratio"] + 2 * df["std_ratio"],
        alpha=0.2, color="gray", label="±2σ Band",
    )
    ax1.set_title("Price Ratio & Mean Reversion Bands")
    ax1.set_ylabel("Ratio")
    ax1.legend()

    # (3) Z-Score + 시그널
    ax2 = axes[2]
    ax2.plot(df.index, df["zscore"], label="Z-Score", color="black", linewidth=1)
    ax2.axhline(0, color="gray", linestyle="--", linewidth=0.8)
    ax2.axhline(Z_BUY_THRESHOLD, color="green", linestyle="--", label="Buy Threshold")
    ax2.axhline(Z_SELL_THRESHOLD, color="red", linestyle="--", label="Sell Threshold")

    buy = df[df["signal"] == 1]
    sell = df[df["signal"] == -1]
    ax2.scatter(buy.index, buy["zscore"], color="green", marker="^",
                s=80, label=f"Buy ({len(buy)})", zorder=5)
    ax2.scatter(sell.index, sell["zscore"], color="red", marker="v",
                s=80, label=f"Sell ({len(sell)})", zorder=5)
    ax2.set_title("Z-Score & Trading Signals")
    ax2.set_ylabel("Z-Score (σ)")
    ax2.legend()

    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=120, bbox_inches="tight")
    plt.show()


# =============================================================================
# 단일 페어 분석
# =============================================================================

def analyze_pair(ticker: str, crypto: str,
                 start: str = START_DATE, end: str = END_DATE,
                 rolling_window: Optional[int] = ROLLING_WINDOW,
                 plot: bool = True) -> Dict:
    """한 페어(기업-암호화폐) 종합 분석."""
    print(f"\n{'='*60}\n  [{ticker}] vs [{crypto}]\n{'='*60}")

    try:
        stock = fetch_data(ticker, start, end)
        crypto_p = fetch_data(crypto, start, end)
    except Exception as e:
        print(f"  ❌ 데이터 로드 실패: {e}")
        return {}

    corr, p_value = compute_correlation(stock, crypto_p)
    print(f"  Pearson Correlation: {corr:.3f} (p-value: {p_value:.3e})")

    df = compute_zscore(stock, crypto_p, rolling_window=rolling_window)
    df = generate_signals(df)

    latest = df.dropna(subset=["zscore"]).iloc[-1]
    print(f"  Latest Date:  {latest.name.date()}")
    print(f"  {ticker} Close: ${latest['stock']:.2f}")
    print(f"  {crypto} Close: ${latest['crypto']:,.2f}")
    print(f"  Price Ratio:  {latest['ratio']:.4f}")
    print(f"  Z-Score:      {latest['zscore']:.2f}")

    if latest["signal"] == 1:
        print(f"  >>> 🟢 SIGNAL: BUY  (Stock UNDERVALUED)")
    elif latest["signal"] == -1:
        print(f"  >>> 🔴 SIGNAL: SELL (Stock OVERVALUED)")
    else:
        print(f"  >>> ⚪ No strong signal")

    if plot:
        plot_analysis(df, ticker, crypto)

    return {
        "ticker": ticker, "crypto": crypto,
        "correlation": corr, "p_value": p_value,
        "latest_zscore": latest["zscore"],
        "latest_signal": int(latest["signal"]),
        "latest_ratio": latest["ratio"],
        "data": df,
    }


# =============================================================================
# 백테스트
# =============================================================================

def backtest_mean_reversion(df: pd.DataFrame, holding_days: int = 30) -> Dict:
    """매수 시그널 발생 시 holding_days 동안 보유하는 단순 백테스트."""
    df = df.copy().dropna(subset=["zscore"])
    df["fwd_return"] = df["stock"].shift(-holding_days) / df["stock"] - 1

    buy_signals = df[df["signal"] == 1]
    if len(buy_signals) == 0:
        return {"trades": 0}

    return {
        "trades": len(buy_signals),
        "avg_return": buy_signals["fwd_return"].mean(),
        "median_return": buy_signals["fwd_return"].median(),
        "win_rate": (buy_signals["fwd_return"] > 0).mean(),
        "holding_days": holding_days,
    }


# =============================================================================
# 메인 실행
# =============================================================================

def main():
    """모든 DAT 페어 일괄 분석 + 요약."""
    print("\n" + "="*60)
    print("  DAT Mean Reversion Strategy — Multi-Pair Scan")
    print("="*60)

    summary = []
    for ticker, crypto in DAT_PAIRS.items():
        result = analyze_pair(ticker, crypto, plot=False)
        if not result:
            continue

        bt = backtest_mean_reversion(result["data"], holding_days=30)
        result.update(bt)
        summary.append({
            "Ticker": ticker, "Crypto": crypto,
            "Corr": f"{result['correlation']:.2f}",
            "Z-Score": f"{result['latest_zscore']:.2f}",
            "Signal": {1: "BUY", -1: "SELL", 0: "NEUTRAL"}[result["latest_signal"]],
            "Trades": result.get("trades", 0),
            "AvgRet(30d)": f"{result.get('avg_return', 0)*100:.1f}%" if result.get("trades", 0) else "-",
            "WinRate": f"{result.get('win_rate', 0)*100:.0f}%" if result.get("trades", 0) else "-",
        })

    print("\n\n" + "="*60)
    print("  SUMMARY TABLE")
    print("="*60)
    print(pd.DataFrame(summary).to_string(index=False))
    print("\n⚠️ 본 백테스트는 illustrative only (슬리피지/수수료/세금 미반영)")
    print("⚠️ 한국 거주자: 해외주식 양도소득세 22%, 외환거래법 신고 의무")


if __name__ == "__main__":
    # 단일 페어 상세 분석 (시각화 포함)
    analyze_pair("MSTR", "BTC-USD", plot=True)

    # 전체 페어 일괄 스캔
    main()
```

### 3.3. Python 실행

```bash
python dat_zscore_strategy.py
```

---

## 4. Kotlin 구현 (JVM 사용자 / Android 개발자용)

### 4.1. 왜 Kotlin 버전인가?

- **JVM 통합**: 기존 Java/Kotlin 시스템에 통합 용이
- **Android 자동 알림 봇**: Kotlin 기반 모바일 앱에서 직접 활용
- **타입 안정성**: 컴파일 타임 오류 방지
- **JetBrains 생태계**: IntelliJ IDEA에서 즉시 실행 가능

### 4.2. Gradle 의존성 (`build.gradle.kts`)

> 💡 **복사 사용**: 새 Kotlin 프로젝트의 `build.gradle.kts`에 그대로 사용하실 수 있습니다.

```kotlin
plugins {
    kotlin("jvm") version "1.9.22"
    application
}

group = "com.gameworkerkim.vibeinvesting.dat"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.16.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("io.ktor:ktor-client-core:2.3.7")
    implementation("io.ktor:ktor-client-cio:2.3.7")
    implementation("org.apache.commons:commons-math3:3.6.1")
    implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.5.0")
}

application {
    mainClass.set("com.gameworkerkim.vibeinvesting.dat.DatZScoreStrategyKt")
}

kotlin {
    jvmToolchain(17)
}
```

### 4.3. 전체 Kotlin 코드

> 💡 **복사 사용**: `src/main/kotlin/DatZScoreStrategy.kt`로 저장하면 됩니다.

```kotlin
/**
 * DAT (Digital Asset Treasury) Mean Reversion Quant Script — Kotlin
 *
 * 저자: HoKwang Kim (Independent Researcher)
 * 시리즈: vibe-investing / Awesome Claude Quant Scripts
 * 라이선스: MIT
 */

package com.gameworkerkim.vibeinvesting.dat

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import kotlinx.coroutines.runBlocking
import org.apache.commons.math3.stat.correlation.PearsonsCorrelation
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics
import java.time.LocalDate
import java.time.ZoneId

// =============================================================================
// 설정
// =============================================================================

object Config {
    val DAT_PAIRS = linkedMapOf(
        "MSTR" to "BTC-USD",
        "MARA" to "BTC-USD",
        "RIOT" to "BTC-USD",
        "GLXY" to "BTC-USD",
        "COIN" to "ETH-USD",
        "BMNR" to "ETH-USD",
        "SBET" to "ETH-USD",
    )

    val START_DATE: LocalDate = LocalDate.of(2023, 1, 1)
    val END_DATE: LocalDate = LocalDate.of(2026, 4, 27)

    const val Z_BUY_THRESHOLD = -2.0
    const val Z_SELL_THRESHOLD = 2.0
    const val ROLLING_WINDOW = 90
}

// =============================================================================
// 데이터 모델
// =============================================================================

data class PriceBar(val date: LocalDate, val close: Double)

data class ZScorePoint(
    val date: LocalDate,
    val stock: Double,
    val crypto: Double,
    val ratio: Double,
    val meanRatio: Double,
    val stdRatio: Double,
    val zScore: Double,
    val signal: Signal,
)

enum class Signal { BUY, SELL, NEUTRAL }

data class BacktestResult(
    val trades: Int,
    val avgReturn: Double,
    val winRate: Double,
    val holdingDays: Int,
)

// =============================================================================
// Yahoo Finance API 클라이언트
// =============================================================================

class YahooFinanceClient {
    private val client = HttpClient(CIO)
    private val mapper = ObjectMapper()

    suspend fun fetchHistoricalPrices(
        symbol: String,
        startDate: LocalDate,
        endDate: LocalDate,
    ): List<PriceBar> {
        val period1 = startDate.atStartOfDay(ZoneId.of("UTC")).toEpochSecond()
        val period2 = endDate.atStartOfDay(ZoneId.of("UTC")).toEpochSecond()
        val url = "https://query1.finance.yahoo.com/v8/finance/chart/$symbol" +
            "?period1=$period1&period2=$period2&interval=1d"

        val response = client.get(url).bodyAsText()
        val root: JsonNode = mapper.readTree(response)
        val result = root["chart"]["result"]?.get(0)
            ?: throw IllegalStateException("$symbol: no data")

        val timestamps = result["timestamp"].map {
            LocalDate.ofEpochDay(it.asLong() / 86400)
        }
        val closes = result["indicators"]["quote"][0]["close"].map {
            if (it.isNull) Double.NaN else it.asDouble()
        }

        return timestamps.zip(closes)
            .filter { (_, c) -> !c.isNaN() }
            .map { (date, close) -> PriceBar(date, close) }
    }

    fun close() = client.close()
}

// =============================================================================
// 분석 함수
// =============================================================================

object DATAnalyzer {
    fun alignSeries(
        stock: List<PriceBar>,
        crypto: List<PriceBar>,
    ): List<Triple<LocalDate, Double, Double>> {
        val cryptoMap = crypto.associate { it.date to it.close }
        return stock
            .filter { cryptoMap.containsKey(it.date) }
            .map { Triple(it.date, it.close, cryptoMap[it.date]!!) }
    }

    fun computeCorrelation(
        aligned: List<Triple<LocalDate, Double, Double>>,
    ): Pair<Double, Double> {
        if (aligned.size < 30) return Pair(Double.NaN, Double.NaN)
        val xs = aligned.map { it.second }.toDoubleArray()
        val ys = aligned.map { it.third }.toDoubleArray()
        val corr = PearsonsCorrelation().correlation(xs, ys)
        val n = xs.size
        val tStat = corr * Math.sqrt((n - 2.0) / (1.0 - corr * corr))
        val tDist = org.apache.commons.math3.distribution.TDistribution((n - 2).toDouble())
        val pValue = 2 * (1 - tDist.cumulativeProbability(Math.abs(tStat)))
        return Pair(corr, pValue)
    }

    fun computeRollingZScore(
        aligned: List<Triple<LocalDate, Double, Double>>,
        rollingWindow: Int = Config.ROLLING_WINDOW,
    ): List<ZScorePoint> {
        val ratios = aligned.map { it.second / it.third }
        val results = mutableListOf<ZScorePoint>()

        for (i in aligned.indices) {
            val (date, stock, crypto) = aligned[i]
            val ratio = ratios[i]

            if (i < rollingWindow - 1) {
                results.add(ZScorePoint(
                    date, stock, crypto, ratio,
                    Double.NaN, Double.NaN, Double.NaN, Signal.NEUTRAL,
                ))
                continue
            }

            val window = ratios.subList(i - rollingWindow + 1, i + 1)
            val stats = DescriptiveStatistics(window.toDoubleArray())
            val mean = stats.mean
            val std = stats.standardDeviation
            val z = if (std > 0) (ratio - mean) / std else 0.0

            val signal = when {
                z < Config.Z_BUY_THRESHOLD -> Signal.BUY
                z > Config.Z_SELL_THRESHOLD -> Signal.SELL
                else -> Signal.NEUTRAL
            }

            results.add(ZScorePoint(date, stock, crypto, ratio, mean, std, z, signal))
        }

        return results
    }

    fun backtest(
        zSeries: List<ZScorePoint>,
        holdingDays: Int = 30,
    ): BacktestResult {
        val buys = zSeries.withIndex()
            .filter { it.value.signal == Signal.BUY }
            .filter { it.index + holdingDays < zSeries.size }

        if (buys.isEmpty()) return BacktestResult(0, 0.0, 0.0, holdingDays)

        val returns = buys.map { (idx, point) ->
            val futurePrice = zSeries[idx + holdingDays].stock
            (futurePrice / point.stock) - 1.0
        }

        return BacktestResult(
            trades = returns.size,
            avgReturn = returns.average(),
            winRate = returns.count { it > 0 }.toDouble() / returns.size,
            holdingDays = holdingDays,
        )
    }
}

// =============================================================================
// 메인 실행
// =============================================================================

fun main() = runBlocking {
    println("\n" + "=".repeat(60))
    println("  DAT Mean Reversion Strategy — Kotlin Multi-Pair Scan")
    println("=".repeat(60))

    val client = YahooFinanceClient()

    try {
        for ((ticker, crypto) in Config.DAT_PAIRS) {
            println("\n[$ticker] vs [$crypto]")

            val stockPrices = client.fetchHistoricalPrices(
                ticker, Config.START_DATE, Config.END_DATE
            )
            val cryptoPrices = client.fetchHistoricalPrices(
                crypto, Config.START_DATE, Config.END_DATE
            )

            val aligned = DATAnalyzer.alignSeries(stockPrices, cryptoPrices)
            val (corr, pValue) = DATAnalyzer.computeCorrelation(aligned)
            val zSeries = DATAnalyzer.computeRollingZScore(aligned)
            val latest = zSeries.lastOrNull { !it.zScore.isNaN() }

            if (latest != null) {
                println("  Pearson Correlation: %.3f (p=%.3e)".format(corr, pValue))
                println("  Latest Z-Score: %.2f -> %s".format(
                    latest.zScore, latest.signal.name
                ))

                val bt = DATAnalyzer.backtest(zSeries, holdingDays = 30)
                if (bt.trades > 0) {
                    println("  Backtest: %d trades, AvgReturn %.1f%%, WinRate %.0f%%".format(
                        bt.trades, bt.avgReturn * 100, bt.winRate * 100
                    ))
                }
            }
        }

        println("\n⚠️  본 백테스트는 illustrative only")
        println("⚠️  한국 거주자: 해외주식 양도소득세 22%")
    } finally {
        client.close()
    }
}
```

### 4.4. Kotlin 실행

```bash
# Gradle 프로젝트 초기화
gradle init --type kotlin-application

# 위 코드를 src/main/kotlin/에 저장 후
gradle run
```

또는 IntelliJ IDEA에서 `main()` 함수에 우클릭 → Run.

---

## 5. 실제 데이터 기반 분석 예시

### 5.1. 사례: MicroStrategy (MSTR) vs. 비트코인

MicroStrategy(2025년 *Strategy Inc.*로 사명 변경)는 비트코인을 가장 적극적으로 재무 전략에 활용하는 대표적인 DAT 기업입니다. 2026년 4월 기준 약 **580,000 BTC**를 보유하고 있으며, 이는 전체 발행량의 약 2.7%에 달합니다.

#### 분석 결과 (예시)

| 지표 | 값 |
|------|----|
| 분석 기간 | 2023-01-01 ~ 2026-04-27 |
| 피어슨 상관계수 | 0.87 (p < 0.001) |
| 90일 Rolling Z-Score (최근) | -2.35 |
| 매수 임계값 도달 여부 | ✅ Yes (Z < -2.0) |
| 매수 시그널 | 🟢 **BUY** |

> 💡 **해석**: 상관계수 0.87로 매우 높아 MSTR-BTC는 강한 동조 관계를 보입니다. 90일 rolling Z-Score가 -2.35로 매수 임계값을 하회 — *MSTR 주가가 BTC 가격 대비 통계적으로 저평가*된 상태입니다.

> ⚠️ **주의**: 위 수치는 예시이며, 실제 실행 시 결과가 달라질 수 있습니다. *Spot BTC ETF 출시 이후 MSTR의 mNAV premium 구조적 축소*가 진행 중이므로, 과거 평균회귀 패턴이 향후에도 동일하게 작동한다는 보장이 없습니다.

### 5.2. 사례: Coinbase (COIN) vs. 이더리움

Coinbase는 거래소이므로 DAT 기업과는 구조가 다르지만, *거래 수수료 수익이 ETH 시장 활성도와 밀접하게 연관*되어 사실상 ETH proxy로 작동하는 측면이 있습니다.

| 지표 | 값 |
|------|----|
| 피어슨 상관계수 | 0.79 (p < 0.001) |
| 90일 Rolling Z-Score (최근) | -1.80 |
| 매수 임계값 도달 여부 | ❌ 근접 (Z < -2.0 미달) |
| 시그널 | ⚪ **NEUTRAL** (관심 영역) |

> 💡 **해석**: COIN-ETH 상관계수 0.79는 MSTR-BTC(0.87)보다 낮습니다. Z-Score -1.80은 매수 임계값(-2.0)에 근접한 상태이지만, 강력한 시그널은 아닙니다. *지속적 모니터링이 필요한 관심 구간*에 진입했다고 평가됩니다.

---

## 6. 백테스트 가이드라인 ⚠️

### 6.1. 본 스크립트의 한계

본 스크립트의 백테스트는 **단순 illustrative**이며 다음을 *반영하지 않습니다*:

- 슬리피지(시장 충격) — 대형 포지션 진입 시 약 0.1-0.3%
- 거래 수수료 — 한국 증권사 약 0.25% (해외주식)
- 세금 — 한국 거주자 양도소득세 22%, 미국 배당 원천세 15%
- 환율 변동성 — USD/KRW
- 차용 비용 (숏 포지션 시)
- 마진 콜 위험 (레버리지 시)

### 6.2. 권장 추가 검증

실거래 적용 전 다음을 추가 분석하실 것을 권합니다:

1. **Walk-forward 분석**: 학습 기간과 검증 기간을 분리
2. **Monte Carlo 시뮬레이션**: 시그널의 우연 발생 확률 검증
3. **Regime 분석**: BTC bull/bear 별 시그널 hit-rate 차이
4. **Correlation drift**: 30일/90일/180일 rolling correlation 변화 추적
5. **Cointegration test (Engle-Granger)**: 단순 상관관계가 아닌 *공적분* 검증
6. **Half-life 추정**: 평균회귀가 발생하는 평균 기간

---

## 7. 결론 및 투자 전략 제언

### 7.1. 핵심 요약

1. DAT 전략 기업의 주가는 기초 암호화폐와 **높은 상관관계(0.75-0.90)**를 보입니다.
2. **90일 Rolling Z-Score**를 모니터링하면 통계적으로 유의미한 저평가/고평가 구간을 식별할 수 있습니다.
3. **Z-Score ≤ -2.0에서 매수, ≥ +2.0에서 매도**하는 평균회귀 전략이 통계적으로 유효한 *경향*을 보입니다.
4. 그러나 — **암호화폐 시장 regime change** (예: 2024 Spot BTC ETF, 2025 GENIUS Act 통과)는 *과거 평균회귀 패턴을 무효화*시킬 수 있습니다.

### 7.2. 투자 아이디어

#### 롱(Long) 전략

- **트리거**: Z-Score ≤ -2.0
- **포지션**: 자본의 5-10% 할당
- **목표**: Z-Score 0 회귀 시 청산
- **손절**: Z-Score < -3.0 도달 시 (구조적 변화 의심)
- **장점**: 암호화폐 직접 보유 대비 *낮은 변동성* + 기업 추가 사업 가치
- **단점**: Sub-NAV 함정 위험 (BMNR 사례)

#### 숏(Short)/중립 전략

- **트리거**: Z-Score ≥ +2.0
- **방법**: 차익 실현 또는 풋옵션 헷지
- **주의**: 무한 손실 가능 — 절대 단순 숏 권장 안함, *반드시 옵션 활용*

### 7.3. 한국 거주자 추가 고려사항

- **양도소득세 22%**: 250만원 비과세 한도 후 적용
- **외환거래법**: 연간 5만 달러 초과 송금 시 신고 의무
- **공매도 제한**: 한국에서 미국 주식 직접 공매도 불가, 미국 증권사 계좌 필요
- **세무사 자문**: 빈번한 거래 시 종합소득세 신고 부담

---

##  References

- **[DAT 기업의 mNAV 아비트리지 전략](https://github.com/gameworkerkim/vibe-investing/blob/main/mNAV(Market-to-Net-Asset-Value)%20arbitrage/Dat%20mnav%20arbitrage%20strategy.MD)** — 본 스크립트의 자매 칼럼
- **[Awesome Claude Quant Scripts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD)** — 8대 퀀트 전략 큐레이션
- **Vidyamurthy (2004)** — *Pairs Trading: Quantitative Methods and Analysis*
- **Gatev, Goetzmann, Rouwenhorst (2006)** — *Pairs Trading: Performance of a Relative-Value Arbitrage Rule*
- **Engle & Granger (1987)** — *Co-integration and Error Correction*
- **Yahoo Finance Public API** — query1.finance.yahoo.com
- **Apache Commons Math** — commons.apache.org/proper/commons-math

---

## Disclaimer

본 문서와 코드는 **연구·교육 목적**입니다.

- 본 스크립트는 *투자 권유*가 아닙니다.
- 모든 백테스트 결과는 *과거 데이터 기반*이며 미래 보장 없음.
- Claude를 포함한 LLM이 생성한 코드는 *반드시 사용자가 검증*해야 합니다.
- 실거래 적용 시 슬리피지, 수수료, 세금이 반영되어 *실제 수익률은 백테스트보다 낮습니다*.
- 한국 거주자의 미국 주식 투자에는 *환율, 양도소득세 22%, 외환거래법* 등이 적용됩니다.
- 공매도/숏 포지션은 *무한 손실* 가능성이 있어 옵션 활용을 권장합니다.
- 모든 투자 결과에 대한 책임은 사용자 본인에게 있습니다.

> *Past performance does not guarantee future results.*
> *과거 성과는 미래 수익을 보장하지 않습니다.*

---

*작성일: 2026년 4월 27일*
*저자: 김호광 (Dennis Kim / HoKwang Kim) — Independent Researcher · Betalabs Inc. CEO*
*시리즈: vibe-investing / Awesome Claude Quant Scripts*
*GitHub: [vibe-investing](https://github.com/gameworkerkim/vibe-investing)*
*ORCID: [0009-0002-0962-2175](https://orcid.org/0009-0002-0962-2175)*
