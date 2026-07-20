"""
Browser-safe data fetcher for vi_browser.

All functions call the Cloudflare Worker REST API when available.
When no Worker URL is set (local dev), falls back to deterministic mock data.
No API keys or secrets live in this module.
"""

from __future__ import annotations

import datetime as dt
import math
from typing import Optional, Dict, List, Any

try:
    import pyodide_http  # noqa: F401
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


def _asset_heuristics(symbol: str, provider: str = "yahoo") -> dict:
    sym = str(symbol).strip().upper()
    is_kr = sym.endswith(".KS") or sym.endswith(".KQ") or (sym.isdigit() and len(sym) in (5, 6))
    return {
        "symbol": sym,
        "provider": provider,
        "name": sym,
        "exchange": "KRX" if is_kr else "Unknown",
        "currency": "KRW" if is_kr else "USD",
        "assetType": "EQUITY",
    }


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


def _df_from_rows(rows: List[dict]):
    if _HAS_PANDAS:
        df = pd.DataFrame(rows)
        if "time" in df.columns:
            df["time"] = pd.to_datetime(df["time"])
        return df
    return rows


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
            return _df_from_rows(rows)

    return _df_from_rows(_mock_candles(symbol, days))


def get_prices(symbols: List[str], provider: str = "yahoo") -> Dict[str, dict]:
    """Last prices for symbols via Worker `/prices` or derived from candles/mock."""
    symbols = [str(s).strip().upper() for s in symbols if str(s).strip()]
    result: Dict[str, dict] = {}

    if _API_URL and symbols:
        try:
            qs = ",".join(symbols)
            data = _fetch(f"/api/v1/prices/{provider}?symbols={qs}")
            items = data.get("prices") or data.get("items") or {}
            if isinstance(items, list):
                for row in items:
                    sym = str(row.get("symbol", "")).upper()
                    if sym:
                        result[sym] = row
            elif isinstance(items, dict):
                for sym, row in items.items():
                    result[str(sym).upper()] = row
            if result:
                return result
        except Exception:
            pass

        # Per-symbol candle fallback
        for sym in symbols:
            try:
                data = _fetch(f"/api/v1/candles/{provider}/{sym}?days=5")
                rows = data.get("candles") or data.get("data") or []
                if len(rows) >= 2:
                    last, prev = rows[-1], rows[-2]
                    result[sym] = {
                        "symbol": sym,
                        "price": last["close"],
                        "change": round(float(last["close"]) - float(prev["close"]), 4),
                        "changeRate": round((float(last["close"]) / max(float(prev["close"]), 1e-12) - 1) * 100, 4),
                        "date": last.get("time"),
                        "source": data.get("source", "candles"),
                    }
                elif len(rows) == 1:
                    last = rows[0]
                    result[sym] = {
                        "symbol": sym,
                        "price": last["close"],
                        "change": 0.0,
                        "changeRate": 0.0,
                        "date": last.get("time"),
                        "source": data.get("source", "candles"),
                    }
            except Exception:
                continue
        if result:
            return result

    for sym in symbols:
        candles = _mock_candles(sym, 5)
        last, prev = candles[-1], candles[-2]
        result[sym] = {
            "symbol": sym,
            "price": last["close"],
            "change": round(last["close"] - prev["close"], 2),
            "changeRate": round((last["close"] / max(prev["close"], 1) - 1) * 100, 2),
            "date": last["time"],
            "source": "local_mock",
        }
    return result


def get_last_price(symbol: str, provider: str = "yahoo") -> Optional[dict]:
    prices = get_prices([symbol], provider=provider)
    row = prices.get(str(symbol).strip().upper())
    if not row:
        return None
    return {
        "date": row.get("date"),
        "close": row.get("price"),
        "volume": row.get("volume"),
        "symbol": row.get("symbol", symbol),
        "source": row.get("source"),
    }


def get_asset(symbol: str, provider: str = "yahoo") -> dict:
    """Asset metadata via Worker `/assets` or local heuristics."""
    symbol = str(symbol).strip().upper()
    if _API_URL:
        try:
            data = _fetch(f"/api/v1/assets/{provider}/{symbol}")
            if isinstance(data, dict) and data.get("symbol"):
                return data
        except Exception:
            pass
        try:
            data = _fetch(f"/api/v1/market-data/{provider}/{symbol}")
            if isinstance(data, dict) and (data.get("symbol") or data.get("asset")):
                return data.get("asset") or data
        except Exception:
            pass
    out = _asset_heuristics(symbol, provider)
    if not _API_URL:
        out["name"] = f"Mock Asset {symbol}"
        out["exchange"] = "Mock"
        out["source"] = "local_mock"
    else:
        out["source"] = "heuristics"
    return out


class ViDataApi:
    """Thin browser/local router mimicking GsDataApi entry points.

    Prefer ``get_candles`` / ``get_prices`` in committee scripts. This class
    exists so LLM output that imports ``ViDataApi`` still resolves.
    """

    @staticmethod
    def build_market_data_query(mkt_assets, mkt_type=None):
        return {"assets": mkt_assets, "type": mkt_type}

    @staticmethod
    def get_market_data(query: Any = None, *, symbols=None, provider: str = "yahoo", days: int = 90):
        """Return a dict of symbol → candle rows (or DataFrame if pandas).

        Accepts either a query dict from ``build_market_data_query`` or
        explicit ``symbols=``.
        """
        syms = symbols
        if syms is None and isinstance(query, dict):
            syms = query.get("assets") or query.get("symbols")
        if syms is None and isinstance(query, (list, tuple)):
            syms = list(query)
        if isinstance(syms, str):
            syms = [syms]
        if not syms:
            raise ValueError("ViDataApi.get_market_data requires symbols or query['assets']")

        out = {}
        for sym in syms:
            out[str(sym).strip().upper()] = get_candles(str(sym), days=days, provider=provider)
        return out

    @staticmethod
    def get_prices(symbols: List[str], provider: str = "yahoo") -> Dict[str, dict]:
        return get_prices(symbols, provider=provider)
