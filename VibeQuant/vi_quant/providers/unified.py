"""
Unified provider — auto-detects TOSS > Yahoo > Mock with a single interface.

All provider functions have identical signatures regardless of backend.
Usage:
    provider = get_provider()          # auto-detect
    provider = get_provider("yahoo")   # force Yahoo
    candles = provider.fetch_candles("005930", 260)
"""

from __future__ import annotations

import os
from typing import List, Dict, Optional, Union

from .mock_provider import MockProvider
from .toss_provider import TossProvider
from .yahoo_provider import YahooProvider

_provider_instance: Optional["UnifiedProvider"] = None


def get_provider(source: Optional[str] = None) -> "UnifiedProvider":
    global _provider_instance

    if source:
        return UnifiedProvider(force=source)

    if _provider_instance is None:
        _provider_instance = UnifiedProvider()
    return _provider_instance


class UnifiedProvider:
    def __init__(self, force: Optional[str] = None):
        self._providers = {
            "toss": TossProvider(),
            "yahoo": YahooProvider(),
            "mock": MockProvider(),
        }

        if force and force in self._providers:
            self._active = force
        else:
            self._active = self._detect()

    def _detect(self) -> str:
        override = os.environ.get("VI_QUANT_PROVIDER", "").lower()
        if override in self._providers:
            return override
        if self._providers["toss"].is_available():
            return "toss"
        if self._providers["yahoo"].is_available():
            return "yahoo"
        return "mock"

    @property
    def active_provider(self) -> str:
        return self._active

    def provider_name(self) -> str:
        return self._active

    def is_available(self) -> bool:
        return self._providers[self._active].is_available()

    # ── Delegated methods — all identical signatures ──────

    def fetch_candles(self, code: str, days: int = 260) -> List[dict]:
        return self._providers[self._active].fetch_candles(code, days)

    def fetch_prices(self, codes: List[str]) -> Dict[str, dict]:
        return self._providers[self._active].fetch_prices(codes)

    def fetch_asset(self, code: str) -> dict:
        return self._providers[self._active].fetch_asset(code)

    def to_dataframe(self, code: str, days: int = 260):
        """Return candles as a pandas DataFrame."""
        import pandas as pd

        candles = self.fetch_candles(code, days)
        if not candles:
            return pd.DataFrame(columns=["time", "open", "high", "low", "close", "volume"])

        df = pd.DataFrame(candles)
        df["time"] = pd.to_datetime(df["time"])
        df = df.set_index("time").sort_index()
        return df
