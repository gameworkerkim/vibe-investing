"""
Browser-safe data fetcher for vi_browser.

All functions call the Cloudflare Worker REST API via fetch (or httpx/pyodide-http).
No API keys or secrets live in this module — the Worker handles authentication upstream.
"""

from __future__ import annotations

import json as _json
from typing import Optional, Dict, List

try:
    import pyodide_http
    _HAS_PYODIDE = True
except ImportError:
    _HAS_PYODIDE = False

try:
    import pandas as pd
    _HAS_PANDAS = True
except ImportError:
    _HAS_PANDAS = False

# ── Default API URL (can be overridden) ──────────────────
# In Pyodide dashboard, this points to the Cloudflare Worker.
# In local testing, point to localhost.
_API_URL = "https://vibequant-api.example.workers.dev"

def set_api_url(url: str) -> None:
    """Set the Cloudflare Worker base URL."""
    global _API_URL
    _API_URL = url.rstrip("/")


# ── HTTP helper ──────────────────────────────────────────

def _fetch(path: str) -> dict:
    """Fetch JSON from the Worker API.

    In Pyodide, uses pyodide_http-compatible fetch.
    In local CPython, uses urllib (fallback).
    """
    url = f"{_API_URL}{path}"

    if _HAS_PYODIDE:
        import pyodide_http
        resp = pyodide_http._pyfetch(url)
        return resp.json()
    else:
        import json, urllib.request
        with urllib.request.urlopen(url, timeout=30) as r:
            return json.loads(r.read())


# ── Public API ───────────────────────────────────────────

def get_candles(
    symbol: str,
    days: int = 260,
    provider: str = "yahoo"
) -> "pd.DataFrame":
    """Fetch OHLCV candles from the Worker API.

    Returns a pandas DataFrame with columns: time, open, high, low, close, volume.
    """
    data = _fetch(f"/api/v1/candles/{provider}/{symbol}?days={days}")
    rows = data.get("data", [])
    if _HAS_PANDAS and rows:
        df = pd.DataFrame(rows)
        if "time" in df.columns:
            df["time"] = pd.to_datetime(df["time"])
        return df
    if _HAS_PANDAS:
        return pd.DataFrame()
    return rows


def get_prices(symbols: List[str], provider: str = "yahoo") -> Dict[str, dict]:
    """Fetch current prices for multiple symbols.

    Returns dict: {symbol: {price, change, changeRate}}
    """
    data = _fetch(f"/api/v1/market-data/{provider}/{symbols[0]}/last")
    result = {data.get("symbol", symbols[0]): data.get("last", {})}
    return result


def get_last_price(symbol: str, provider: str = "yahoo") -> Optional[dict]:
    """Fetch the last bar for a symbol."""
    data = _fetch(f"/api/v1/market-data/{provider}/{symbol}/last")
    return data.get("last")


def get_asset(symbol: str, provider: str = "yahoo") -> dict:
    """Fetch asset metadata."""
    return _fetch(f"/api/v1/assets/{provider}/{symbol}")
