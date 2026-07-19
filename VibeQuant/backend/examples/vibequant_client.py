"""
VibeQuant Data Backend — Python Client Example

Usage:
    from vibequant_client import VibeQuantClient
    client = VibeQuantClient("http://localhost:8080")

    candles = client.get_candles("yahoo", "AAPL", days=365)
    prices = client.get_price_series("yahoo", "AAPL")
    health = client.get_health()
"""

from __future__ import annotations

from typing import Optional
import requests


class VibeQuantClient:
    def __init__(self, base_url: str, api_key: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self._session = requests.Session()
        if api_key:
            self._session.headers["X-API-Key"] = api_key
        self._session.headers["Content-Type"] = "application/json"
        self._session.headers["Accept"] = "application/json"

    def _get(self, path: str) -> dict:
        url = f"{self.base_url}{path}"
        resp = self._session.get(url, timeout=30)
        if not resp.ok:
            try:
                err = resp.json()
                msg = err.get("message", resp.text)
            except Exception:
                msg = resp.text
            raise requests.HTTPError(
                f"VibeQuant API {resp.status_code}: {msg}",
                response=resp,
            )
        return resp.json()

    def get_health(self) -> dict:
        return self._get("/api/health")

    def get_candles(
        self,
        provider: str,
        symbol: str,
        days: int = 365,
        interval: str = "1d",
        limit: int = 0,
    ) -> dict:
        params = f"days={days}&interval={interval}"
        if limit > 0:
            params += f"&limit={limit}"
        return self._get(f"/api/v1/candles/{provider}/{symbol}?{params}")

    def get_price_series(
        self, provider: str, symbol: str, days: int = 365
    ) -> dict:
        return self._get(
            f"/api/v1/market-data/{provider}/{symbol}/price?days={days}"
        )

    def get_last_price(self, provider: str, symbol: str) -> dict:
        return self._get(
            f"/api/v1/market-data/{provider}/{symbol}/last"
        )

    def get_asset(self, provider: str, symbol: str) -> dict:
        return self._get(f"/api/v1/assets/{provider}/{symbol}")

    def to_dataframe(self, provider: str, symbol: str, days: int = 365):
        """Return candles as a pandas DataFrame (requires pandas)."""
        try:
            import pandas as pd
        except ImportError:
            raise ImportError("pandas is required for to_dataframe()")
        data = self.get_candles(provider, symbol, days=days)
        df = pd.DataFrame(data["data"])
        if not df.empty:
            df["timestamp"] = pd.to_datetime(df["timestamp"])
            df = df.set_index("timestamp").sort_index()
        return df
