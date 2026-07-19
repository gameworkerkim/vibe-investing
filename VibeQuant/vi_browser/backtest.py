"""
Educational mini-backtest for the committee stage.

Rules (fixed for reproducibility):
- Daily bars only; signal[t] → position from bar t+1 (next-bar, no look-ahead).
- Period return uses close-to-close on the held position.
- Fee charged on absolute position change: |Δpos| * fee_bps / 10_000.
- Long / flat / short via signal in {-1, 0, 1} (edu default: long/flat).

Not a production research engine.
"""

from __future__ import annotations

import math
from typing import Any, Dict, List, Sequence, Union


def _closes(candles: Sequence[Any]) -> List[float]:
    if not candles:
        return []
    first = candles[0]
    if isinstance(first, dict):
        return [float(r["close"]) for r in candles]
    return [float(x) for x in candles]


def _align_signal(signal: Sequence[Any], n: int) -> List[float]:
    sig = [float(x) if x is not None else 0.0 for x in signal]
    if len(sig) < n:
        sig = sig + [0.0] * (n - len(sig))
    elif len(sig) > n:
        sig = sig[:n]
    return sig


def backtest(
    candles: Sequence[Any],
    signal: Sequence[Any],
    fee_bps: float = 10.0,
    trading_days: int = 252,
) -> Dict[str, Any]:
    """Run a deterministic educational backtest.

    Parameters
    ----------
    candles :
        List of OHLCV dicts (``close`` required) or a close price sequence.
    signal :
        Same length as ``candles``. Values in ``{-1, 0, 1}``.
    fee_bps :
        Round-trip-ish fee in basis points applied to |Δposition|.
    trading_days :
        Annualization base for Sharpe / CAGR.

    Returns
    -------
    dict
        ``equity``, ``rets``, ``positions``, ``metrics``
        (``total_return``, ``mdd``, ``sharpe``, ``cagr``, ``bars``, ``fee_bps``).
    """
    closes = _closes(candles)
    n = len(closes)
    if n < 2:
        return {
            "equity": [1.0] * max(n, 1),
            "rets": [0.0] * n,
            "positions": [0.0] * n,
            "metrics": {
                "total_return": 0.0,
                "mdd": 0.0,
                "sharpe": 0.0,
                "cagr": 0.0,
                "bars": n,
                "fee_bps": float(fee_bps),
            },
        }

    sig = _align_signal(signal, n)
    positions: List[float] = [0.0] * n
    rets: List[float] = [0.0] * n
    equity: List[float] = [1.0] * n
    fee = float(fee_bps) / 10_000.0

    for i in range(1, n):
        positions[i] = sig[i - 1]
        prev_c, cur_c = closes[i - 1], closes[i]
        if prev_c and prev_c != 0:
            raw = positions[i] * (cur_c / prev_c - 1.0)
        else:
            raw = 0.0
        turnover = abs(positions[i] - positions[i - 1])
        rets[i] = raw - turnover * fee
        equity[i] = equity[i - 1] * (1.0 + rets[i])

    total_return = equity[-1] / equity[0] - 1.0
    peak = equity[0]
    mdd = 0.0
    for e in equity:
        if e > peak:
            peak = e
        if peak > 0:
            dd = e / peak - 1.0
            if dd < mdd:
                mdd = dd

    active = [r for r in rets[1:] if r is not None]
    if len(active) >= 2:
        mean = sum(active) / len(active)
        var = sum((x - mean) ** 2 for x in active) / (len(active) - 1)
        std = math.sqrt(var) if var > 0 else 0.0
        sharpe = (mean / std) * math.sqrt(trading_days) if std > 0 else 0.0
    else:
        sharpe = 0.0

    years = (n - 1) / float(trading_days)
    if years > 0 and equity[-1] > 0:
        cagr = float(equity[-1] ** (1.0 / years) - 1.0)
    else:
        cagr = 0.0

    return {
        "equity": equity,
        "rets": rets,
        "positions": positions,
        "metrics": {
            "total_return": float(total_return),
            "mdd": float(mdd),
            "sharpe": float(sharpe),
            "cagr": float(cagr),
            "bars": n,
            "fee_bps": float(fee_bps),
        },
    }


def ma_cross_signal(
    closes: Sequence[Any],
    fast: int = 10,
    slow: int = 30,
) -> List[int]:
    """Long when fast MA > slow MA, else flat. Useful golden-sample helper."""
    xs = _closes(closes) if closes and isinstance(closes[0], dict) else [float(x) for x in closes]
    n = len(xs)
    out: List[int] = [0] * n
    if n < slow or fast < 1 or slow <= fast:
        return out
    for i in range(slow - 1, n):
        f = sum(xs[i + 1 - fast : i + 1]) / fast
        s = sum(xs[i + 1 - slow : i + 1]) / slow
        out[i] = 1 if f > s else 0
    return out
