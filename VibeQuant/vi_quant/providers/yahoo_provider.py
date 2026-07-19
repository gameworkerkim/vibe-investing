"""
Yahoo Finance provider — wraps yfinance (Python package) with the same
function signatures as TossProvider and MockProvider.

Symbol handling: numeric Korean codes get .KS suffix; US tickers pass through.
"""

from __future__ import annotations

import datetime as dt
import os
from typing import Dict, List, Optional

import yfinance as yf


class YahooProvider:
    def provider_name(self) -> str:
        return "yahoo"

    @staticmethod
    def is_available() -> bool:
        return True  # no API key needed

    @staticmethod
    def _to_yahoo_symbol(code: str) -> str:
        """TOSS-style code → Yahoo Finance ticker.

        Numeric codes (6-digit Korean) → '.KS' suffix.
        Alphabetical codes (US) → pass through.
        """
        code = str(code).strip().upper()
        if code.isdigit() and len(code) == 6:
            return f"{code}.KS"
        return code

    def fetch_candles(self, code: str, days: int = 260) -> List[dict]:
        symbol = self._to_yahoo_symbol(code)
        end = dt.datetime.now(dt.timezone.utc)
        start = end - dt.timedelta(days=days + 10)

        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(start=start, end=end, interval="1d")
        except Exception:
            return []

        if df.empty:
            return []

        out = []
        for idx, row in df.iterrows():
            out.append(
                {
                    "time": idx.strftime("%Y-%m-%d"),
                    "open": float(row["Open"]),
                    "high": float(row["High"]),
                    "low": float(row["Low"]),
                    "close": float(row["Close"]),
                    "volume": int(row["Volume"]),
                }
            )
        out.sort(key=lambda r: r["time"])
        return out[-days:]

    def fetch_prices(self, codes: List[str]) -> Dict[str, dict]:
        out = {}
        symbols = [self._to_yahoo_symbol(c) for c in codes]

        # yfinance batch quote — chunk at 50 to be safe
        for i in range(0, len(symbols), 50):
            chunk = symbols[i : i + 50]
            try:
                tickers = yf.Tickers(" ".join(chunk))
                for sym in chunk:
                    code = codes[symbols.index(sym)] if sym in symbols else sym
                    try:
                        t = tickers.tickers.get(sym)
                        if t is None:
                            continue
                        info = t.info or {}
                        prev = info.get("previousClose") or info.get("regularMarketPreviousClose")
                        price = info.get("regularMarketPrice") or info.get("currentPrice")
                        if price is None:
                            fast = t.fast_info or {}
                            price = fast.get("lastPrice") or fast.get("regularMarketPrice")
                        if price is None:
                            continue
                        change = (price - prev) if prev else None
                        change_rate = round((price / prev - 1) * 100, 2) if prev else None
                        out[code] = {
                            "price": round(float(price), 2),
                            "change": round(float(change), 2) if change else None,
                            "changeRate": change_rate,
                        }
                    except Exception:
                        continue
            except Exception:
                continue
        return out

    def fetch_asset(self, code: str) -> dict:
        symbol = self._to_yahoo_symbol(code)
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info or {}
            return {
                "symbol": code,
                "name": info.get("shortName") or info.get("longName") or code,
                "exchange": info.get("exchange") or info.get("exchangeName") or "Unknown",
                "currency": info.get("currency", "USD"),
                "assetType": info.get("quoteType") or "EQUITY",
            }
        except Exception:
            return {
                "symbol": code,
                "name": code,
                "exchange": "Unknown",
                "currency": "KRW" if code.isdigit() else "USD",
                "assetType": "EQUITY",
            }
