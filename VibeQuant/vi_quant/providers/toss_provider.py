"""
TOSS Open API provider — Python port of Toss/src/toss.js.

Identical API surface to toss.js (fetchCandles, fetchPrices, isMock) plus
provider_name/fetch_asset for the unified interface.
"""

from __future__ import annotations

import os
import time
import urllib.parse
from typing import Dict, List, Optional

import requests


class TossProvider:
    _token_cache: Optional[str] = None
    _token_expiry: float = 0

    def __init__(self, base_url: Optional[str] = None):
        self._base_url = base_url or os.environ.get(
            "TOSS_BASE_URL", "https://openapi.tossinvest.com"
        )
        self._client_id = os.environ.get("TOSS_CLIENT_ID")
        self._client_secret = os.environ.get("TOSS_CLIENT_SECRET")

    def provider_name(self) -> str:
        return "toss"

    def is_available(self) -> bool:
        return bool(self._client_id and self._client_secret)

    # ── Auth ──────────────────────────────────────────────

    def _get_token(self) -> str:
        now = time.time()
        if TossProvider._token_cache and now < TossProvider._token_expiry - 30:
            return TossProvider._token_cache

        if not self._client_id or not self._client_secret:
            raise RuntimeError("TOSS_CLIENT_ID and TOSS_CLIENT_SECRET must be set")

        resp = requests.post(
            f"{self._base_url}/oauth2/token",
            data={
                "grant_type": "client_credentials",
                "client_id": self._client_id,
                "client_secret": self._client_secret,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        ttl = int(data.get("expires_in", 3600))
        TossProvider._token_cache = data["access_token"]
        TossProvider._token_expiry = now + ttl
        return TossProvider._token_cache

    def _authed_get(self, path: str, params: Optional[dict] = None) -> dict:
        token = self._get_token()
        resp = requests.get(
            f"{self._base_url}{path}",
            params=params,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()

    # ── Candles (mirrors fetchCandles in toss.js) ─────────

    def fetch_candles(self, code: str, days: int = 260) -> List[dict]:
        if not self.is_available():
            return []

        collected: List[dict] = []
        before: Optional[str] = None

        while len(collected) < days:
            params: dict = {"symbol": code, "interval": "1d", "count": 200}
            if before:
                params["before"] = before

            try:
                data = self._authed_get("/api/v1/candles", params)
            except Exception:
                break

            rows = data.get("candles") or data.get("data") or []
            if not rows:
                break

            for r in rows:
                collected.append(
                    {
                        "time": r.get("time") or r.get("timestamp") or r.get("date"),
                        "open": r.get("open_price") or r.get("open"),
                        "high": r.get("high_price") or r.get("high"),
                        "low": r.get("low_price") or r.get("low"),
                        "close": r.get("close_price") or r.get("close"),
                        "volume": r.get("volume", 0),
                    }
                )

            before = rows[-1].get("time") or rows[-1].get("timestamp")
            if len(rows) < 200:
                break

            time.sleep(0.2)

        uniq = self._dedupe_by_time(collected)
        uniq.sort(key=lambda r: str(r["time"]))
        return uniq[-days:]

    @staticmethod
    def _dedupe_by_time(rows: List[dict]) -> List[dict]:
        seen: set = set()
        out: List[dict] = []
        for r in rows:
            k = str(r["time"])
            if k in seen:
                continue
            seen.add(k)
            out.append(r)
        return out

    # ── Prices (mirrors fetchPrices in toss.js) ───────────

    def fetch_prices(self, codes: List[str]) -> Dict[str, dict]:
        if not self.is_available():
            return {}

        out: Dict[str, dict] = {}
        for i in range(0, len(codes), 200):
            chunk = codes[i : i + 200]
            try:
                data = self._authed_get(
                    "/api/v1/prices", {"symbols": ",".join(chunk)}
                )
            except Exception:
                continue
            for row in data.get("prices") or data.get("data") or []:
                code = row.get("symbol") or row.get("code")
                price = self._num(row.get("price") or row.get("close") or row.get("last"))
                change = self._num(row.get("change"))
                change_rate = self._num(row.get("changeRate") or row.get("rate"))
                out[code] = {"price": price, "change": change, "changeRate": change_rate}
        return out

    # ── Asset info ────────────────────────────────────────

    def fetch_asset(self, code: str) -> dict:
        if not self.is_available():
            return {"symbol": code, "name": code, "exchange": "Unknown", "currency": "KRW", "assetType": "EQUITY"}

        try:
            data = self._authed_get("/api/v1/stocks", {"symbol": code})
            # TOSS /stocks may return array or single object
            if isinstance(data, list):
                data = data[0] if data else {}
            return {
                "symbol": code,
                "name": data.get("name", code),
                "exchange": data.get("exchange", "Unknown"),
                "currency": data.get("currency", "KRW"),
                "assetType": data.get("type", "EQUITY"),
            }
        except Exception:
            return {"symbol": code, "name": code, "exchange": "Unknown", "currency": "KRW", "assetType": "EQUITY"}

    @staticmethod
    def _num(v) -> Optional[float]:
        if v is None:
            return None
        if isinstance(v, str):
            v = v.replace(",", "")
        try:
            return float(v)
        except (ValueError, TypeError):
            return None
