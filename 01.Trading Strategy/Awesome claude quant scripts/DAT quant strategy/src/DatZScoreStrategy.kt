/**
 * DAT (Digital Asset Treasury) Mean Reversion Quant Script — Kotlin
 * ==================================================================
 *
 * DAT 전략 기업 주가 vs. 보유 암호화폐 가격의 Z-Score 기반
 * 평균회귀(Mean Reversion) 시그널 생성 — Kotlin/JVM 버전.
 *
 * 의존성 (build.gradle.kts):
 *
 *     dependencies {
 *         implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.5.0")
 *         implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.16.0")
 *         implementation("org.apache.commons:commons-math3:3.6.1")
 *         implementation("io.ktor:ktor-client-core:2.3.7")
 *         implementation("io.ktor:ktor-client-cio:2.3.7")
 *         implementation("io.ktor:ktor-client-content-negotiation:2.3.7")
 *         implementation("io.ktor:ktor-serialization-jackson:2.3.7")
 *     }
 *
 * 사용법:
 *     kotlinc -script dat_zscore_strategy.kts
 * 또는 IntelliJ IDEA에서 main() 실행
 *
 * 데이터 소스: Yahoo Finance public chart API (v8/finance/chart)
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

data class PriceBar(
    val date: LocalDate,
    val close: Double,
)

data class AnalysisResult(
    val ticker: String,
    val crypto: String,
    val correlation: Double,
    val pValue: Double,
    val latestDate: LocalDate,
    val latestStock: Double,
    val latestCrypto: Double,
    val latestRatio: Double,
    val latestZScore: Double,
    val latestSignal: Signal,
    val zscoreSeries: List<ZScorePoint>,
)

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
    val medianReturn: Double,
    val winRate: Double,
    val holdingDays: Int,
)

// =============================================================================
// 데이터 다운로드 (Yahoo Finance API)
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

    /**
     * 두 시계열의 공통 날짜 정렬 (inner join).
     */
    fun alignSeries(
        stock: List<PriceBar>,
        crypto: List<PriceBar>,
    ): List<Triple<LocalDate, Double, Double>> {
        val cryptoMap = crypto.associate { it.date to it.close }
        return stock
            .filter { cryptoMap.containsKey(it.date) }
            .map { Triple(it.date, it.close, cryptoMap[it.date]!!) }
    }

    /**
     * Pearson 상관계수 + p-value (apache commons math).
     */
    fun computeCorrelation(
        aligned: List<Triple<LocalDate, Double, Double>>,
    ): Pair<Double, Double> {
        if (aligned.size < 30) return Pair(Double.NaN, Double.NaN)

        val xs = aligned.map { it.second }.toDoubleArray()
        val ys = aligned.map { it.third }.toDoubleArray()
        val pearson = PearsonsCorrelation()
        val corr = pearson.correlation(xs, ys)

        // p-value 계산 (간단 t-stat 변환)
        val n = xs.size
        val tStat = corr * Math.sqrt((n - 2.0) / (1.0 - corr * corr))
        val tDist = org.apache.commons.math3.distribution.TDistribution((n - 2).toDouble())
        val pValue = 2 * (1 - tDist.cumulativeProbability(Math.abs(tStat)))

        return Pair(corr, pValue)
    }

    /**
     * Rolling Z-Score 계산 (look-ahead bias 방지).
     */
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
                // 충분한 데이터 없음 → NaN 처리
                results.add(
                    ZScorePoint(
                        date, stock, crypto, ratio,
                        Double.NaN, Double.NaN, Double.NaN, Signal.NEUTRAL,
                    )
                )
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

            results.add(
                ZScorePoint(date, stock, crypto, ratio, mean, std, z, signal)
            )
        }

        return results
    }

    /**
     * 단순 평균회귀 백테스트.
     */
    fun backtest(
        zSeries: List<ZScorePoint>,
        holdingDays: Int = 30,
    ): BacktestResult {
        val buys = zSeries.withIndex()
            .filter { it.value.signal == Signal.BUY }
            .filter { it.index + holdingDays < zSeries.size }

        if (buys.isEmpty()) {
            return BacktestResult(0, 0.0, 0.0, 0.0, holdingDays)
        }

        val returns = buys.map { (idx, point) ->
            val futurePrice = zSeries[idx + holdingDays].stock
            (futurePrice / point.stock) - 1.0
        }

        val avgReturn = returns.average()
        val medianReturn = returns.sorted()[returns.size / 2]
        val winRate = returns.count { it > 0 }.toDouble() / returns.size

        return BacktestResult(
            trades = returns.size,
            avgReturn = avgReturn,
            medianReturn = medianReturn,
            winRate = winRate,
            holdingDays = holdingDays,
        )
    }
}

// =============================================================================
// 단일 페어 분석
// =============================================================================

suspend fun analyzePair(
    ticker: String,
    crypto: String,
    client: YahooFinanceClient,
    rollingWindow: Int = Config.ROLLING_WINDOW,
): AnalysisResult? {
    println("\n" + "=".repeat(60))
    println("  [$ticker] vs [$crypto]")
    println("=".repeat(60))

    val stockPrices = try {
        client.fetchHistoricalPrices(ticker, Config.START_DATE, Config.END_DATE)
    } catch (e: Exception) {
        println("  ❌ $ticker 데이터 로드 실패: ${e.message}")
        return null
    }

    val cryptoPrices = try {
        client.fetchHistoricalPrices(crypto, Config.START_DATE, Config.END_DATE)
    } catch (e: Exception) {
        println("  ❌ $crypto 데이터 로드 실패: ${e.message}")
        return null
    }

    val aligned = DATAnalyzer.alignSeries(stockPrices, cryptoPrices)
    if (aligned.size < 50) {
        println("  ❌ 정렬된 데이터가 너무 적음: ${aligned.size}개")
        return null
    }

    // 상관관계
    val (corr, pValue) = DATAnalyzer.computeCorrelation(aligned)
    println("  Pearson Correlation: %.3f (p-value: %.3e)".format(corr, pValue))

    // Z-Score 시계열
    val zSeries = DATAnalyzer.computeRollingZScore(aligned, rollingWindow)
    val latestValid = zSeries.lastOrNull { !it.zScore.isNaN() }
        ?: run {
            println("  ❌ 유효한 Z-Score 없음")
            return null
        }

    println("  Latest Date:  ${latestValid.date}")
    println("  $ticker Close: $%.2f".format(latestValid.stock))
    println("  $crypto Close: $%,.2f".format(latestValid.crypto))
    println("  Price Ratio:  %.4f".format(latestValid.ratio))
    println("  Z-Score:      %.2f".format(latestValid.zScore))

    when (latestValid.signal) {
        Signal.BUY -> println("  >>> 🟢 SIGNAL: BUY  (Stock UNDERVALUED)")
        Signal.SELL -> println("  >>> 🔴 SIGNAL: SELL (Stock OVERVALUED)")
        Signal.NEUTRAL -> println("  >>> ⚪ No strong signal")
    }

    return AnalysisResult(
        ticker = ticker,
        crypto = crypto,
        correlation = corr,
        pValue = pValue,
        latestDate = latestValid.date,
        latestStock = latestValid.stock,
        latestCrypto = latestValid.crypto,
        latestRatio = latestValid.ratio,
        latestZScore = latestValid.zScore,
        latestSignal = latestValid.signal,
        zscoreSeries = zSeries,
    )
}

// =============================================================================
// 메인 실행
// =============================================================================

fun main() = runBlocking {
    println("\n" + "=".repeat(60))
    println("  DAT Mean Reversion Strategy — Kotlin Multi-Pair Scan")
    println("=".repeat(60))

    val client = YahooFinanceClient()
    val results = mutableListOf<AnalysisResult>()

    try {
        for ((ticker, crypto) in Config.DAT_PAIRS) {
            val result = analyzePair(ticker, crypto, client)
            if (result != null) {
                results.add(result)
            }
        }

        // 요약 테이블
        println("\n\n" + "=".repeat(80))
        println("  SUMMARY TABLE")
        println("=".repeat(80))
        println("%-7s %-10s %-7s %-8s %-9s %-8s %-12s %-9s".format(
            "Ticker", "Crypto", "Corr", "Z-Score", "Signal", "Trades", "AvgRet(30d)", "WinRate"
        ))
        println("-".repeat(80))

        for (result in results) {
            val bt = DATAnalyzer.backtest(result.zscoreSeries, holdingDays = 30)
            println("%-7s %-10s %-7.2f %-8.2f %-9s %-8d %-12s %-9s".format(
                result.ticker,
                result.crypto,
                result.correlation,
                result.latestZScore,
                result.latestSignal.name,
                bt.trades,
                if (bt.trades > 0) "%.1f%%".format(bt.avgReturn * 100) else "-",
                if (bt.trades > 0) "%.0f%%".format(bt.winRate * 100) else "-",
            ))
        }
        println("-".repeat(80))

        println("\n⚠️  본 백테스트는 illustrative only (슬리피지/수수료/세금 미반영)")
        println("⚠️  한국 거주자: 해외주식 양도소득세 22%, 외환거래법 신고 의무")
    } finally {
        client.close()
    }
}
