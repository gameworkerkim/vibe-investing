# Multi-LLM Quant Committee — Verification Checklist

Vibe Quant is the **basic stage** for the **quant committee of an AI quant hedge fund**
(educational sandbox OK): same APIs, same market data, reproducible outputs across LLMs.
It is **not** a GS Quant replacement. After basics: backtests → community review → LLM quant features.

Live runner: https://vibequant-web.pages.dev/#workspace

## Golden script (minimum — edu backtest)

```python
from vi_browser import get_candles, ma_cross_signal, backtest, show_chart

candles = await get_candles("005930", days=180)
sig = ma_cross_signal(candles, fast=10, slow=30)
bt = backtest(candles, sig, fee_bps=10)
show_chart(bt["equity"], title="equity (MA cross)")
print(bt["metrics"])
```

## Committee checks

| # | Check | Pass criteria |
|---|---|---|
| 1 | Data source | stdout shows `source=yahoo` (or `r2`/`cache`); retry if only mock |
| 2 | Bar count | length near `days` (trading days may be fewer) |
| 3 | Indicators | `rsi` / `macd` / `bollinger_bands` (or MA/vol) return finite values |
| 4 | Backtest metrics | `metrics` has `total_return`, `mdd`, `sharpe`, `cagr`; `mdd ≤ 0` |
| 5 | Chart | equity (or close) line appears in the result pane |
| 6 | Reproduce | two LLMs re-run the same script → same numbers on the same snapshot |
| 7 | Hard rules | no user Python on Workers; no secrets in Pages |

## Browser limits

- iOS Safari: Pyodide may fail — prefer desktop Chrome/Firefox
- First load: seconds to tens of seconds; keep `days` ≤ ~500 for RAM
- Edu backtest only: next-bar close-to-close, simple fee — not a production engine
- QuantLib / `IRSwap.calc`: not in browser (local / later)
- TOSS realtime: deferred (IP allowlist); use Yahoo for the stage

## Related

- [API_MAPPING.md](API_MAPPING.md)
- [LIMITATIONS.md](LIMITATIONS.md)
- [SECURITY.md](../SECURITY.md)
