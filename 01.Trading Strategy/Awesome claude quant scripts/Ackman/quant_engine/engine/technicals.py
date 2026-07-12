"""
engine/technicals.py — TOSS 일봉 캔들로부터 기술적 지표 계산

TOSS 클라이언트가 반환하는 [{time, close}, ...] (과거→현재 정렬) 리스트를 받아
52주 고저 대비 위치, 50/200일 이동평균 상회 여부, RSI(14)를 계산한다.
"""

import math
from typing import Dict, List, Optional


def compute_technicals(candles: List[Dict]) -> Optional[Dict]:
    closes = [c["close"] for c in candles if c.get("close") is not None]
    if len(closes) < 5:
        return None

    current = closes[-1]
    high_52w = max(closes)
    low_52w = min(closes)

    pct_from_high = (current - high_52w) / high_52w if high_52w else None
    pct_from_low = (current - low_52w) / low_52w if low_52w else None

    ma50 = sum(closes[-50:]) / len(closes[-50:]) if len(closes) >= 50 else None
    ma200 = sum(closes[-200:]) / len(closes[-200:]) if len(closes) >= 200 else None

    rsi = _rsi14(closes)

    return {
        "price": current,
        "pct_from_52w_high": pct_from_high,
        "pct_from_52w_low": pct_from_low,
        "above_50ma": (current > ma50) if ma50 is not None else None,
        "above_200ma": (current > ma200) if ma200 is not None else None,
        "rsi_14": rsi,
        "as_of_date": candles[-1].get("time"),
    }


def _rsi14(closes: List[float]) -> Optional[float]:
    if len(closes) < 15:
        return None
    deltas = [closes[i] - closes[i - 1] for i in range(1, len(closes))]
    window = deltas[-14:]
    gains = [d for d in window if d > 0]
    losses = [-d for d in window if d < 0]
    avg_gain = sum(gains) / 14
    avg_loss = sum(losses) / 14
    if avg_loss == 0:
        return 100.0 if avg_gain > 0 else 50.0
    rs = avg_gain / avg_loss
    return round(100 - 100 / (1 + rs), 2)
