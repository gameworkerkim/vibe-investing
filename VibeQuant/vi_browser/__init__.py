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

from .data import get_candles, get_prices, get_asset, get_last_price, set_api_url, ViDataApi
from .timeseries import (
    returns,
    volatility,
    moving_average,
    sma,
    ema,
    exponential_moving_average,
    change,
    index,
    percentiles,
    momentum,
    correlation,
    zscores,
    max_drawdown,
    beta,
    annualized_return,
    sharpe_ratio,
    rsi,
    macd,
    bollinger_bands,
)
from .backtest import backtest, ma_cross_signal

# ── show_chart local fallback ───────────────────────────
# In Pyodide browser, the JS bridge overwrites this with a real implementation.
# Locally, it prints a message so scripts don't crash.

def show_chart(data, title: str = "Chart", series_label: str = "close"):
    """Display an interactive chart.

    In the Pyodide dashboard, this renders an interactive Plotly chart.
    Locally (CPython), it prints a placeholder message.
    """
    try:
        from js import window
        # Running inside Pyodide — JS bridge should have injected the real fn
        fn = getattr(window, "__VQ_SHOW_CHART__", None)
        if fn:
            import json
            payload = {"data": _to_serializable(data), "title": title, "series_label": series_label}
            fn.call(json.dumps(payload))
            return
    except (ImportError, AttributeError):
        pass

    # Local fallback
    print(f"[show_chart] {title} ({len(data) if hasattr(data, '__len__') else '?'} rows)")
    print("  -> chart rendering available in Pyodide dashboard only")
    print("  -> open https://vibequant-web.pages.dev/#workspace")


def _to_serializable(data):
    """Convert pandas objects to JSON-serializable types."""
    import pandas as pd
    if isinstance(data, pd.DataFrame):
        return data.to_dict(orient="records")
    if isinstance(data, pd.Series):
        return data.to_dict()
    if isinstance(data, (list, tuple)):
        return list(data)
    return data


__all__ = [
    "get_candles",
    "get_prices",
    "get_asset",
    "get_last_price",
    "set_api_url",
    "ViDataApi",
    "returns",
    "volatility",
    "moving_average",
    "sma",
    "ema",
    "exponential_moving_average",
    "change",
    "index",
    "percentiles",
    "momentum",
    "correlation",
    "zscores",
    "max_drawdown",
    "beta",
    "annualized_return",
    "sharpe_ratio",
    "rsi",
    "macd",
    "bollinger_bands",
    "backtest",
    "ma_cross_signal",
    "show_chart",
]
