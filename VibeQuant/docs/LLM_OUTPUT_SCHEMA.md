# LLM Quant output schema

Committee-stage contract between DeepSeek and the Pyodide runner.

Korean: [LLM_OUTPUT_SCHEMA_KR.md](LLM_OUTPUT_SCHEMA_KR.md)

## Response JSON (Worker → Pages)

```json
{
  "ok": true,
  "mode": "answer | python | hybrid",
  "answer": "prose in the user language",
  "python": "string | null",
  "model": "deepseek-v4-pro | deepseek-v4-flash",
  "finance": true
}
```

| Field | Meaning |
|---|---|
| `mode=answer` | Explanation only; `python` is null |
| `mode=python` | Must include runnable `vi_browser` script |
| `mode=hybrid` | Short answer + verifying Python |

## Model-facing JSON (DeepSeek must emit)

```json
{
  "mode": "answer | python | hybrid",
  "answer": "string",
  "python": "string | null",
  "notes": "assumptions / limits",
  "risks": "optional short risk note"
}
```

## Allowed Python surface

Only:

```python
from vi_browser import (
  get_candles, returns, volatility, moving_average, momentum,
  correlation, max_drawdown, rsi, macd, bollinger_bands,
  backtest, ma_cross_signal, show_chart,
)
```

- `get_candles` is **async**
- `days` ≤ 180 preferred
- No `os`, `subprocess`, `eval`, `exec`, `open`, `requests`, arbitrary network

## Golden prompts

UI chips load prompts from `pages/js/llm-prompts.js` (momentum, MA backtest, RSI, crypto vol, explain-only).

## Next (not in this slice)

- Persist successful prompt+stdout to R2 for human eval
- Multi-model bake-off on the same market snapshot
