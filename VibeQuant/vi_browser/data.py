"""
Browser-safe data fetcher for vi_browser.

All functions call the Cloudflare Worker REST API when available.
When no Worker URL is set (local dev), falls back to deterministic mock data.
No API keys or secrets live in this module.
"""

from __future__ import annotations

import datetime as dt
import json as _json
import math
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

# ── Default API URL (empty = use mock locally) ────────────
_API_URL = ""

def set_api_url(url: str) -> None:
    """Set the Cloudflare Worker base URL.
    Set to '' to use deterministic mock data (default for local dev).
    """
    global _API_URL
    _API_URL = url.rstrip("/") if url else ""


# ── Mock data (deterministic, same as Worker mock pattern) ─

def _hash_seed(s: str) -> int:
    h = 0x811C9DC5
    for ch in s:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h

def _mock_candles(symbol: str, days: int) -> List[dict]:
    seed = _hash_seed(symbol)
    rng_state = seed & 0xFFFFFFFF
    def _rand():
        nonlocal rng_state
        rng_state = (rng_state + 0x6D2B79F5) & 0xFFFFFFFF
        t = (rng_state ^ (rng_state >> 15)) & 0xFFFFFFFF
        t = (t + (t ^ (t >> 7)) * 61 + t) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) >> 0) / 4294967296.0

    price = 100 + (seed % 200)
    out = []
    base = dt.date.today() - dt.timedelta(days=days)
    for i in range(days):
        u1 = max(1e-9, _rand())
        u2 = _rand()
        zn = math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)
        shock = 0.0004 + 0.015 * zn
        open_p = price
        close_p = max(1, price * (1 + shock))
        high = max(open_p, close_p) * 1.003
        low = min(open_p, close_p) * 0.997
        d = base + dt.timedelta(days=i)
        out.append({
            "time": d.isoformat(),
            "open": round(open_p, 2),
            "high": round(high, 2),
            "low": round(low, 2),
            "close": round(close_p, 2),
            "volume": 100000 + i * 3000,
        })
        price = close_p
    return out


# ── HTTP helper ──────────────────────────────────────────

def _fetch(path: str) -> dict:
    url = f"{_API_URL}{path}"

    if _HAS_PYODIDE:
        import pyodide_http
        resp = pyodide_http._pyfetch(url)
        return resp.json()
    else:
        import json as _j, urllib.request
        with urllib.request.urlopen(url, timeout=30) as r:
            return _j.loads(r.read())


# ── Public API ───────────────────────────────────────────

def get_candles(
    symbol: str,
    days: int = 260,
    provider: str = "yahoo"
) -> "pd.DataFrame":
    """Fetch OHLCV candles. Falls back to deterministic mock if no Worker URL set."""
    symbol = str(symbol).strip().upper()

    if _API_URL:
        try:
            data = _fetch(f"/api/v1/candles/{provider}/{symbol}?days={days}")
            rows = data.get("candles", data.get("data", []))
        except Exception:
            rows = None
        if rows:
            if _HAS_PANDAS:
                df = pd.DataFrame(rows)
                if "time" in df.columns:
                    df["time"] = pd.to_datetime(df["time"])
                return df
            return rows

    # Mock fallback
    rows = _mock_candles(symbol, days)
    if _HAS_PANDAS:
        df = pd.DataFrame(rows)
        if "time" in df.columns:
            df["time"] = pd.to_datetime(df["time"])
        return df
    return rows


def get_prices(symbols: List[str], provider: str = "yahoo") -> Dict[str, dict]:
    result = {}
    for sym in symbols:
        candles = _mock_candles(sym, 5) if not _API_URL else []
        if candles:
            last = candles[-1]
            prev = candles[-2]
            result[sym] = {
                "price": last["close"],
                "change": round(last["close"] - prev["close"], 2),
                "changeRate": round((last["close"] / max(prev["close"], 1) - 1) * 100, 2),
            }
    return result


def get_last_price(symbol: str, provider: str = "yahoo") -> Optional[dict]:
    candles = _mock_candles(symbol, 5) if not _API_URL else []
    if candles:
        last = candles[-1]
        return {"date": last["time"], "close": last["close"], "volume": last["volume"]}
    return None


def get_asset(symbol: str, provider: str = "yahoo") -> dict:
    symbol = str(symbol).strip().upper()
    return {
        "symbol": symbol,
        "name": f"Mock Asset {symbol}" if not _API_URL else symbol,
        "exchange": "Mock" if not _API_URL else "Unknown",
        "currency": "KRW" if symbol.isdigit() else "USD",
        "assetType": "EQUITY",
    }
