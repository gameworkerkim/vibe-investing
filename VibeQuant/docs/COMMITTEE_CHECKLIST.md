# Multi-LLM Quant Committee — Verification Checklist

Vibe Quant is the **basic stage** for the **quant committee of an AI quant hedge fund**
(educational sandbox OK): same APIs, same market data, reproducible outputs across LLMs.
It is **not** a GS Quant replacement. After basics: backtests → community review → LLM quant features.

Live runner: https://vibequant-web.pages.dev/#workspace

## Golden script (minimum)

```python
from vi_browser import get_candles, returns, volatility, moving_average, max_drawdown, show_chart

candles = await get_candles("005930", days=90)
closes = [c["close"] for c in candles]
show_chart(candles, title="005930 close")
print("bars", len(candles))
print("vol_22", volatility(closes, 22))
print("ma_22", moving_average(closes, 22)[-1])
print("mdd", max_drawdown(closes))
print("last_rets", returns(closes)[-5:])
```

## Committee checks

| # | Check | Pass criteria |
|---|---|---|
| 1 | Data source | stdout shows `source=yahoo` (or `r2`/`cache`); retry if only mock |
| 2 | Bar count | length near `days` (trading days may be fewer) |
| 3 | Volatility | `vol_22` is a finite float, not `None` |
| 4 | Chart | close line chart appears in the result pane |
| 5 | Reproduce | two LLMs re-run the same script → same numbers on the same snapshot |
| 6 | Hard rules | no user Python on Workers; no secrets in Pages |

## Browser limits

- iOS Safari: Pyodide may fail — prefer desktop Chrome/Firefox
- First load: seconds to tens of seconds; keep series short for RAM
- QuantLib / `IRSwap.calc`: not in browser (local Phase 2)

## Related

- [API_MAPPING.md](API_MAPPING.md)
- [LIMITATIONS.md](LIMITATIONS.md)
- [SECURITY.md](../SECURITY.md)
