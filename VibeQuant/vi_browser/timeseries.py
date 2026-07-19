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
