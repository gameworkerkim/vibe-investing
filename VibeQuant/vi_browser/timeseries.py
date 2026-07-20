"""
WASM-safe timeseries functions — pure pandas/numpy, no native extensions.

This is the subset of vi_quant.timeseries that can run in Pyodide.
All functions accept pandas Series/DataFrame and return the same.
"""

from __future__ import annotations

from typing import Optional
import numpy as np
import pandas as pd


def returns(prices: pd.Series, periods: int = 1) -> pd.Series:
    """Periodic returns.

    >>> returns(pd.Series([100, 101, 102]))
    0    NaN
    1    0.01
    2    0.009901
    dtype: float64
    """
    return prices.pct_change(periods)


def volatility(
    prices: pd.Series,
    window: int = 22,
    annualize: bool = True,
    trading_days: int = 252,
) -> pd.Series:
    """Rolling annualized volatility."""
    r = returns(prices)
    vol = r.rolling(window).std()
    if annualize:
        vol *= np.sqrt(trading_days)
    return vol


def moving_average(prices: pd.Series, window: int = 22) -> pd.Series:
    """Simple moving average."""
    return prices.rolling(window).mean()


# Friendly GS-style alias
sma = moving_average


def ema(prices: pd.Series, span: int = 22) -> pd.Series:
    """Exponential moving average (span-based, adjust=False).

    Note: local ``vi_quant.timeseries.exponential_moving_average`` uses a
    beta decay parameter; the browser shim uses the common pandas ``span`` API
    so LLM scripts stay readable.
    """
    return prices.ewm(span=int(span), adjust=False).mean()


exponential_moving_average = ema


def change(prices: pd.Series) -> pd.Series:
    """Arithmetic normalization: ``X_t - X_0`` (first non-NaN)."""
    s = prices.dropna()
    if s.empty:
        return prices * float("nan")
    x0 = float(s.iloc[0])
    return prices - x0


def index(prices: pd.Series, initial: float = 1.0) -> pd.Series:
    """Geometric normalization: ``initial * X_t / X_0``."""
    s = prices.dropna()
    if s.empty:
        return prices * float("nan")
    x0 = float(s.iloc[0])
    if x0 == 0:
        return prices * float("nan")
    return initial * prices / x0


def percentiles(prices: pd.Series, window: int | None = None) -> pd.Series:
    """Rolling percentile rank of each point in its own window (0–100).

    Simplified vs GS ``percentiles(x, y, Window)``: no second series / DateOffset.
    If ``window`` is None, uses an expanding window from the start.
    """
    xs = prices.astype(float)
    n = len(xs)
    w = int(window) if window is not None else n
    out = []
    values = xs.tolist()
    for i in range(n):
        if values[i] is None or (isinstance(values[i], float) and np.isnan(values[i])):
            out.append(np.nan)
            continue
        start = 0 if window is None else max(0, i + 1 - w)
        sample = [v for v in values[start : i + 1] if v is not None and not (isinstance(v, float) and np.isnan(v))]
        if len(sample) < 1:
            out.append(np.nan)
            continue
        v = float(values[i])
        below = sum(1 for s in sample if s < v)
        equal = sum(1 for s in sample if s == v)
        out.append(100.0 * (below + 0.5 * equal) / len(sample))
    return pd.Series(out, index=prices.index, dtype=float)


def momentum(prices: pd.Series, window: int = 22) -> pd.Series:
    """Price momentum: close / close.shift(window) - 1."""
    return prices / prices.shift(window) - 1.0


def correlation(
    a: pd.Series,
    b: pd.Series,
    window: int = 252,
) -> pd.Series:
    """Rolling Pearson correlation between two series."""
    return a.rolling(window).corr(b)


def zscores(prices: pd.Series, window: int = 252) -> pd.Series:
    """Rolling Z-score: (last - mean) / std."""
    mean = prices.rolling(window).mean()
    std = prices.rolling(window).std()
    return (prices - mean) / std


def max_drawdown(prices: pd.Series) -> pd.Series:
    """Running maximum drawdown (negative values)."""
    peak = prices.expanding().max()
    dd = (prices / peak) - 1
    return dd


def beta(
    asset: pd.Series,
    benchmark: pd.Series,
    window: int = 252,
) -> pd.Series:
    """Rolling beta vs benchmark."""
    r_asset = returns(asset)
    r_bench = returns(benchmark)
    cov = r_asset.rolling(window).cov(r_bench)
    var = r_bench.rolling(window).var()
    return cov / var


def annualized_return(
    prices: pd.Series,
    trading_days: int = 252,
) -> float:
    """Annualized return from a price series."""
    if len(prices) < 2:
        return 0.0
    total_return = prices.iloc[-1] / prices.iloc[0] - 1
    years = len(prices) / trading_days
    if years <= 0:
        return 0.0
    return float((1 + total_return) ** (1 / years) - 1)


def sharpe_ratio(
    prices: pd.Series,
    risk_free_rate: float = 0.0,
    trading_days: int = 252,
) -> float:
    """Annualized Sharpe ratio from a price series."""
    if len(prices) < 2:
        return 0.0
    r = returns(prices).dropna()
    if len(r) == 0 or r.std() == 0:
        return 0.0
    excess = r.mean() - (risk_free_rate / trading_days)
    return float(np.sqrt(trading_days) * excess / r.std())


def rsi(prices: pd.Series, period: int = 14) -> pd.Series:
    """Relative Strength Index (Wilder's smoothing).

    >>> s = pd.Series([44, 44.5, 45, 44, 43.5, 44, 45, 46, 47, 48, 47, 46, 45, 44, 43, 44])
    >>> rsi(s, 14).iloc[-1]  # doctest: +SKIP
    """
    delta = prices.diff()
    gain = delta.clip(lower=0)
    loss = (-delta).clip(lower=0)
    avg_gain = gain.ewm(alpha=1 / period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, adjust=False).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    return 100.0 - (100.0 / (1.0 + rs))


def macd(
    prices: pd.Series,
    fast: int = 12,
    slow: int = 26,
    signal: int = 9,
):
    """MACD (Moving Average Convergence Divergence).

    Returns (macd_line, signal_line, histogram) as pd.Series.
    """
    ema_fast = prices.ewm(span=fast, adjust=False).mean()
    ema_slow = prices.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def bollinger_bands(
    prices: pd.Series,
    period: int = 20,
    stddev: int = 2,
):
    """Bollinger Bands.

    Returns (upper, middle, lower) as pd.Series.
    """
    middle = prices.rolling(period).mean()
    std = prices.rolling(period).std()
    upper = middle + stddev * std
    lower = middle - stddev * std
    return upper, middle, lower
