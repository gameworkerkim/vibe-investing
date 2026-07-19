"""
Mock data provider — deterministic synthetic candles identical to toss.js mock logic.

When no API credentials are configured, VibeQuant falls back to this provider.
The mock data is code-hash-seeded so the same symbol always produces the same
time-series, making it useful for deterministic backtesting and CI.

Algorithm ported 1:1 from Toss/src/toss.js (mulberry32 PRNG + Box-Muller returns).
"""

from __future__ import annotations

import datetime as dt
import math
from typing import Dict, List, Optional


class MockProvider:
    """
    Deterministic mock provider that generates synthetic candle data.

    Identical to toss.js mock behavior:
    - hashSeed → mulberry32 PRNG per symbol
    - drift: -25% to +60% annual (code-dependent)
    - vol: 18% to 75% annual (code-dependent)
    - benchmark (069500): fixed +12% annual drift, 13% vol
    """

    @staticmethod
    def provider_name() -> str:
        return "mock"

    @staticmethod
    def is_available() -> bool:
        return True

    def fetch_candles(self, code: str, days: int = 260) -> List[dict]:
        code = str(code).strip()
        if code == "069500":
            return self._benchmark_candles(days)
        return self._mock_candles_impl(code, days)

    def fetch_prices(self, codes: List[str]) -> Dict[str, dict]:
        result = {}
        for code in codes:
            candles = self.fetch_candles(code, 6)
            if len(candles) < 2:
                continue
            last = candles[-1]
            prev = candles[-2]
            result[code] = {
                "price": last["close"],
                "change": last["close"] - prev["close"],
                "changeRate": round(
                    (last["close"] / max(prev["close"], 1) - 1) * 100, 2
                ),
            }
        return result

    def fetch_asset(self, code: str) -> dict:
        code = str(code).strip()
        return {
            "symbol": code,
            "name": f"Mock Asset {code}",
            "exchange": "Mock",
            "currency": "KRW" if code.isdigit() else "USD",
            "assetType": "ETF" if len(code) == 6 else "EQUITY",
        }

    # ── Internal: replicates toss.js mock logic ──────────

    @staticmethod
    def _hash_seed(s: str) -> int:
        h = 0x811C9DC5  # FNV-1a offset
        for ch in s:
            h ^= ord(ch)
            h = (h * 0x01000193) & 0xFFFFFFFF
        return h

    @staticmethod
    def _mulberry32(seed: int):
        state = seed & 0xFFFFFFFF
        while True:
            state = (state + 0x6D2B79F5) & 0xFFFFFFFF
            t = (state ^ (state >> 15)) & 0xFFFFFFFF
            t = (t + (t ^ (t >> 7)) * 61 + t) & 0xFFFFFFFF
            yield ((t ^ (t >> 14)) >> 0) / 4294967296.0

    @classmethod
    def _box_muller(cls, rng) -> float:
        u1 = max(1e-9, next(rng))
        u2 = next(rng)
        return math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)

    @classmethod
    def _benchmark_candles(cls, days: int = 260) -> List[dict]:
        rng = cls._mulberry32(cls._hash_seed("KODEX200-bench"))
        price = 33000.0
        daily_drift = 0.12 / 252
        daily_vol = 0.13 / math.sqrt(252)
        out = []
        base_date = dt.datetime(2025, 6, 5, tzinfo=dt.timezone.utc)
        for i in range(days):
            zn = cls._box_muller(rng)
            price = max(50, price * (1 + daily_drift + daily_vol * zn))
            d = base_date - dt.timedelta(days=days - i)
            out.append({"time": d.strftime("%Y-%m-%d"), "close": round(price)})
        return out

    @classmethod
    def _mock_candles_impl(cls, code: str, days: int = 260) -> List[dict]:
        seed = cls._hash_seed(code)
        rng = cls._mulberry32(seed)
        rng_gen = iter(rng)  # need to call both directly and in _box_muller

        # Create a wrapper that tracks the generator
        def _rand():
            return next(rng_gen)

        ann_drift = -0.25 + _rand() * 0.85   # -25% to +60%
        ann_vol = 0.18 + _rand() * 0.57       # 18% to 75%
        daily_drift = ann_drift / 252
        daily_vol = ann_vol / math.sqrt(252)

        price = 1000 + (seed % 400) * 1000
        flip_at = 0.55 + _rand() * 0.35

        out = []
        base_date = dt.datetime(2025, 6, 5, tzinfo=dt.timezone.utc)
        for i in range(days):
            t = i / days
            local_drift = daily_drift
            if t > flip_at and _rand() < 0.5:
                local_drift *= -1.4 if _rand() < 0.5 else 1.2

            zn = cls._box_muller(lambda: _rand()) if False else cls._box_muller(rng)
            # Use the generator pattern from toss.js: Box-Muller consumes 2 random calls
            u1 = max(1e-9, _rand())
            u2 = _rand()
            zn = math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)

            shock = local_drift + daily_vol * zn
            price = max(50, price * (1 + shock))
            d = base_date - dt.timedelta(days=days - i)
            out.append({"time": d.strftime("%Y-%m-%d"), "close": round(price)})
        return out
