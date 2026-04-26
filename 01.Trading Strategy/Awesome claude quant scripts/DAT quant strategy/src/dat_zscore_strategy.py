"""
DAT (Digital Asset Treasury) Mean Reversion Quant Script
=========================================================

DAT 전략 기업 주가 vs. 보유 암호화폐 가격의 Z-Score 기반
평균회귀(Mean Reversion) 시그널 생성 스크립트.

분석 대상 (NASDAQ + NYSE 상장):
    - MSTR (MicroStrategy) -- BTC 보유
    - COIN (Coinbase)      -- ETH proxy
    - MARA (Marathon)      -- BTC 보유
    - RIOT (Riot Platforms) -- BTC 보유
    - BMNR (BitMine)        -- ETH 보유
    - SBET (SharpLink)      -- ETH 보유
    - GLXY (Galaxy Digital) -- BTC 보유

사용법:
    pip install yfinance pandas numpy matplotlib scipy
    python dat_zscore_strategy.py

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

# 분석 대상: 기업 티커 + 연동 암호화폐 (yfinance 형식)
DAT_PAIRS = {
    "MSTR": "BTC-USD",
    "MARA": "BTC-USD",
    "RIOT": "BTC-USD",
    "GLXY": "BTC-USD",
    "COIN": "ETH-USD",   # Coinbase는 거래소이지만 ETH proxy로 활용
    "BMNR": "ETH-USD",
    "SBET": "ETH-USD",
}

START_DATE = "2023-01-01"
END_DATE = "2026-04-27"

# 평균회귀 임계값
Z_BUY_THRESHOLD = -2.0   # -2σ 이하에서 매수
Z_SELL_THRESHOLD = 2.0   # +2σ 이상에서 매도

# Rolling window for Z-Score (None이면 전체 기간)
ROLLING_WINDOW = 90      # 90일 rolling Z-Score (look-ahead bias 방지)


# =============================================================================
# 핵심 분석 함수
# =============================================================================

def fetch_data(ticker: str, start: str, end: str) -> pd.Series:
    """yfinance로 종가 시계열 다운로드."""
    df = yf.download(ticker, start=start, end=end, progress=False)
    if df.empty:
        raise ValueError(f"{ticker}: 데이터 없음")
    # MultiIndex 처리 (yfinance 새 버전)
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

def plot_analysis(
    df: pd.DataFrame,
    ticker: str,
    crypto: str,
    save_path: Optional[str] = None,
):
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
    ax1.plot(df.index, df["ratio"], label="Price Ratio (Stock/Crypto)", color="purple")
    ax1.plot(df.index, df["mean_ratio"], label="Rolling Mean", color="red", linestyle="--")
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
    ax2.scatter(buy.index, buy["zscore"], color="green", marker="^", s=80,
                label=f"Buy ({len(buy)})", zorder=5)
    ax2.scatter(sell.index, sell["zscore"], color="red", marker="v", s=80,
                label=f"Sell ({len(sell)})", zorder=5)
    ax2.set_title("Z-Score & Trading Signals")
    ax2.set_ylabel("Z-Score (σ)")
    ax2.legend()

    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=120, bbox_inches="tight")
        print(f"  → 차트 저장: {save_path}")
    plt.show()


# =============================================================================
# 단일 페어 분석
# =============================================================================

def analyze_pair(
    ticker: str,
    crypto: str,
    start: str = START_DATE,
    end: str = END_DATE,
    rolling_window: Optional[int] = ROLLING_WINDOW,
    plot: bool = True,
) -> Dict:
    """한 페어(기업-암호화폐) 종합 분석."""
    print(f"\n{'='*60}")
    print(f"  [{ticker}] vs [{crypto}]")
    print(f"{'='*60}")

    try:
        stock = fetch_data(ticker, start, end)
        crypto_p = fetch_data(crypto, start, end)
    except Exception as e:
        print(f"  ❌ 데이터 로드 실패: {e}")
        return {}

    # 상관관계
    corr, p_value = compute_correlation(stock, crypto_p)
    print(f"  Pearson Correlation: {corr:.3f} (p-value: {p_value:.3e})")

    # Z-Score
    df = compute_zscore(stock, crypto_p, rolling_window=rolling_window)
    df = generate_signals(df)

    # 최근 상태
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

    # 차트
    if plot:
        plot_analysis(df, ticker, crypto)

    return {
        "ticker": ticker,
        "crypto": crypto,
        "correlation": corr,
        "p_value": p_value,
        "latest_zscore": latest["zscore"],
        "latest_signal": int(latest["signal"]),
        "latest_ratio": latest["ratio"],
        "data": df,
    }


# =============================================================================
# 백테스트 (간단한 평균회귀 전략)
# =============================================================================

def backtest_mean_reversion(df: pd.DataFrame, holding_days: int = 30) -> Dict:
    """
    매수 시그널 발생 시 holding_days 동안 보유하는 단순 백테스트.

    실제 거래비용, 슬리피지, 세금은 미반영 (illustrative only).
    """
    df = df.copy().dropna(subset=["zscore"])
    df["fwd_return"] = df["stock"].shift(-holding_days) / df["stock"] - 1

    buy_signals = df[df["signal"] == 1]
    if len(buy_signals) == 0:
        return {"trades": 0}

    avg_return = buy_signals["fwd_return"].mean()
    win_rate = (buy_signals["fwd_return"] > 0).mean()
    median_return = buy_signals["fwd_return"].median()

    return {
        "trades": len(buy_signals),
        "avg_return": avg_return,
        "median_return": median_return,
        "win_rate": win_rate,
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
        result = analyze_pair(
            ticker=ticker,
            crypto=crypto,
            plot=False,  # 일괄 분석에서는 차트 생략
        )
        if not result:
            continue

        # 백테스트
        bt = backtest_mean_reversion(result["data"], holding_days=30)
        result.update(bt)
        summary.append({
            "Ticker": ticker,
            "Crypto": crypto,
            "Corr": f"{result['correlation']:.2f}",
            "Z-Score": f"{result['latest_zscore']:.2f}",
            "Signal": {1: "BUY", -1: "SELL", 0: "NEUTRAL"}[result["latest_signal"]],
            "Trades": result.get("trades", 0),
            "AvgRet(30d)": f"{result.get('avg_return', 0)*100:.1f}%" if result.get("trades", 0) else "-",
            "WinRate": f"{result.get('win_rate', 0)*100:.0f}%" if result.get("trades", 0) else "-",
        })

    # 요약 출력
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
