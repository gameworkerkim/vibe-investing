# Vibe Quant — User Manual (English)

Educational sandbox for a multi-LLM quant committee. Not investment advice.

| Language | Manual |
|---|---|
| English | This file |
| 한국어 | [USER_MANUAL_KR.md](USER_MANUAL_KR.md) |
| 中文 | [USER_MANUAL_ZH.md](USER_MANUAL_ZH.md) |

**Live demo:** [https://vibequant-web.pages.dev/#workspace](https://vibequant-web.pages.dev/#workspace)

---

## 1. Workspace layout

| Area | Role |
|---|---|
| **LLM prompt input** (top-left) | Natural-language quant request → DeepSeek → optional Python |
| **Python input** (top-right) | Edit / run `vi_browser` code in the browser (Pyodide) |
| **Result** (bottom-left) | Successful stdout / LLM answer |
| **Error log** (bottom-left) | Failures, tracebacks, rejected prompts |
| **Chart** (bottom-right) | Output of `show_chart(...)` |

Toolbar language: use the language selector in the page header (`en` / `ko` / `zh`).

---

## 2. Using Examples (sample demos)

Examples load ready-made semiconductor-basket scripts (**NVDA · MU · SNDK · AVGO**) into the Python editor.

### Steps

1. Open the site and scroll to **Examples** (chip bar above the API table), or jump to `#workspace`.
2. Click a chip, e.g. **Momentum**, **RSI**, **Moving Average**, or the golden **multifactor** sample.
3. The code appears in **Python input**. Review it, then click **Run**.
4. Check **Result** for prints, **Chart** for series, **Error log** if something failed.

### Also useful

| Control | Action |
|---|---|
| **Golden sample** | Loads the multifactor committee demo |
| **Clear** | Clears the Python editor (and you can clear outputs by running again / Clear) |
| **Copy** (icon) | Copies Python or LLM prompt text |
| API table **Load sample** | Loads a smaller API-focused snippet for that row |

### Tip

Keep `days` modest (≤ 180). Long series stress browser RAM. Prefer desktop Chrome/Firefox; iOS Pyodide may fail.

---

## 3. Building a quant with the LLM

DeepSeek turns a finance-only prompt into an explanation and/or runnable `vi_browser` Python. Keys stay on the Worker — never in the browser. Setup: [SECRETS_SETUP.md](SECRETS_SETUP.md) · feature notes: [LLM_QUANT_PROMPT.md](LLM_QUANT_PROMPT.md).

### Steps

1. In **LLM prompt input**, pick **Model**: `V4 Flash` (default, faster) or `V4 Pro` (heavier code).
2. Type a finance question, or click a golden LLM chip (e.g. “Semi momentum”).
3. Click **Run** (next to the copy icon). Rate limit: **1 request / 30 seconds**.
4. Watch progress: DeepSeek call → optional generated Python run.
5. Outcomes:
   - **Result**: answer text and/or run summary  
   - **Python input**: auto-filled when the model returns code  
   - **Chart**: if the script called `show_chart`  
   - **Error log**: non-finance reject, cooldown, or runtime errors  

### Good prompt patterns

```text
Compare 22-day momentum for NVDA, MU, SNDK, AVGO and rank them.
Use vi_browser only; exclude N/A; print a ranking.
```

```text
Run an educational MA(10/30) cross backtest on 005930 with fee_bps=10.
Print total_return, mdd, sharpe, cagr and chart equity.
```

```text
Explain Momentum = close/close[22]-1 in Korean. Answer only, no code.
```

### Rules the model must follow

- Finance only (US/KR equities, crypto, quant metrics). Other topics are rejected (cooldown).
- Browser API is **list-based**, not pandas:
  - `candles = await get_candles("NVDA", days=180, provider="yahoo")`
  - `closes = [c["close"] for c in candles]`
- Top-level `await` only — no `asyncio.run`.
- Never format possible `None` with `:.2f` — use a small `fmt` helper.
- KR tickers often need `.KS` (e.g. `000660.KS`).

Schema details: [LLM_OUTPUT_SCHEMA.md](LLM_OUTPUT_SCHEMA.md).

---

## 4. Building a quant in Python (manual)

Write or paste `vi_browser` code in **Python input**, then **Run**. Execution is 100% in-browser via Pyodide; market data is fetched from the Worker (`provider="yahoo"`).

### Minimal template

```python
from vi_browser import get_candles, momentum, show_chart

def fmt(x, n=2):
    return "N/A" if x is None else f"{x:.{n}f}"

def last_num(xs):
    for x in reversed(xs):
        if x is not None:
            return x
    return None

TICKERS = ["NVDA", "MU", "AVGO"]
WINDOW = 22

rows = []
series = {}
for sym in TICKERS:
    candles = await get_candles(sym, days=180, provider="yahoo")
    closes = [c["close"] for c in candles]
    m = momentum(closes, WINDOW)
    last = last_num(m)
    series[sym] = m
    rows.append((sym, last))
    print(f"{sym}: mom{WINDOW}={fmt(None if last is None else last * 100)}%")

ranked = sorted([(s, v) for s, v in rows if v is not None], key=lambda x: -x[1])
print("rank:", ", ".join(f"{s}={fmt(v*100)}%" for s, v in ranked))
show_chart(series, title="22d momentum", series_label="mom")
```

### Common `vi_browser` APIs

| API | Purpose |
|---|---|
| `get_candles(symbol, days=..., provider="yahoo")` | OHLCV list of dicts |
| `returns` / `volatility` / `moving_average` | Basics |
| `momentum(closes, window=22)` | Price momentum |
| `rsi` / `macd` / `bollinger_bands` | Indicators |
| `max_drawdown(closes)` | Scalar MDD |
| `backtest` / `ma_cross_signal` | Educational backtest helpers |
| `show_chart(...)` | Chart pane |

GS → VI naming map: [API_MAPPING.md](API_MAPPING.md). Full API page: [apis.html](../pages/apis.html) on the site.

### Workflow tips

1. Start from an **Example** chip, then edit tickers / windows.
2. Or ask the **LLM** to draft code, then tighten it by hand and re-**Run**.
3. Read **Error log** for `TypeError` on `None` — add `fmt` / length checks.
4. If candles look short or empty, retry later; Worker refetches Yahoo when R2 cache is too short.

---

## 5. Limits & disclaimer

- Free-tier Cloudflare + browser RAM — not a Marquee / GS Quant replacement.
- Numbers are for **education / reproducibility**, not trading signals.
- DeepSeek must be configured on the Worker for LLM features (`deepseek.configured: true` on `/api/health`).
- See [LIMITATIONS.md](LIMITATIONS.md) and the site footer disclaimer.

*LLMs are spreadsheets for reasoning, not oracles of prediction. The market owes certainty to no one.*
