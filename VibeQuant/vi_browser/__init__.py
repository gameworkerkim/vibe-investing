"""
vi_browser — thin WASM-safe SDK for Pyodide dashboards.

This module contains ONLY code that runs inside Pyodide (browser Python).
It fetches market data from the Cloudflare Worker API and runs pure
pandas/numpy timeseries functions. No native extensions, no secrets,
no server-side execution.

Usage (in Pyodide webview):
    from vi_browser import get_candles, returns, volatility

    df = get_candles("AAPL", days=260)
    print(volatility(df["close"], 22))
"""

__version__ = "0.0.1"

from .data import get_candles, get_prices, get_asset, get_last_price, set_api_url
from .timeseries import (
    returns,
    volatility,
    moving_average,
    correlation,
    zscores,
    max_drawdown,
    beta,
    annualized_return,
    sharpe_ratio,
)

__all__ = [
    "get_candles",
    "get_prices",
    "get_asset",
    "get_last_price",
    "set_api_url",
    "returns",
    "volatility",
    "moving_average",
    "correlation",
    "zscores",
    "max_drawdown",
    "beta",
    "annualized_return",
    "sharpe_ratio",
]
