/**
 * Load Pyodide and run user Python in the browser.
 * Injects thin vi_browser (mock candles + optional Worker API).
 */

const PYODIDE_INDEX = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/";

const BOOTSTRAP = `
import math, sys, types

vi_browser = types.ModuleType("vi_browser")

async def get_candles(symbol="AAPL", days=60, provider="mock"):
    days = int(days)
    api = ""
    try:
        from js import window
        api = getattr(window, "VIBEQUANT_API_BASE", "") or ""
    except Exception:
        pass
    if api:
        from js import fetch
        from pyodide.ffi import to_py
        url = f"{api.rstrip('/')}/api/v1/candles/{provider}/{symbol}?days={days}"
        try:
            res = await fetch(url)
            if res.ok:
                data = to_py(await res.json())
                rows = data.get("candles") or data.get("data") or data
                if isinstance(rows, list) and rows:
                    return rows
        except Exception:
            pass
    out = []
    price = 100.0 + (sum(ord(c) for c in str(symbol)) % 50)
    for i in range(days):
        shock = math.sin(i / 7.0) * 1.4 + ((i * 17) % 10 - 5) * 0.08
        open_ = price
        close = max(1.0, price + shock)
        high = max(open_, close) + 0.4
        low = min(open_, close) - 0.4
        out.append({
            "time": f"t{i:04d}",
            "open": round(open_, 4),
            "high": round(high, 4),
            "low": round(low, 4),
            "close": round(close, 4),
            "volume": 1000 + i * 3,
        })
        price = close
    return out

def returns(closes):
    xs = list(closes)
    if xs and isinstance(xs[0], dict):
        xs = [r["close"] for r in xs]
    out = [None]
    for i in range(1, len(xs)):
        prev = xs[i - 1]
        out.append(None if not prev else (xs[i] / prev - 1.0))
    return out

def volatility(closes, window=22):
    rets = [r for r in returns(closes) if r is not None]
    if len(rets) < 2:
        return None
    w = rets[-int(window):] if len(rets) >= int(window) else rets
    mean = sum(w) / len(w)
    var = sum((x - mean) ** 2 for x in w) / max(1, len(w) - 1)
    return math.sqrt(var) * math.sqrt(252)

def moving_average(closes, window=22):
    xs = list(closes)
    if xs and isinstance(xs[0], dict):
        xs = [r["close"] for r in xs]
    w = int(window)
    out = []
    for i in range(len(xs)):
        if i + 1 < w:
            out.append(None)
        else:
            chunk = xs[i + 1 - w : i + 1]
            out.append(sum(chunk) / w)
    return out

vi_browser.get_candles = get_candles
vi_browser.returns = returns
vi_browser.volatility = volatility
vi_browser.moving_average = moving_average
sys.modules["vi_browser"] = vi_browser
`;

let pyodidePromise = null;

export function loadPyodideRuntime(onStatus) {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = (async () => {
    onStatus?.("loading");
    if (!globalThis.loadPyodide) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = `${PYODIDE_INDEX}pyodide.js`;
        s.onload = resolve;
        s.onerror = () => reject(new Error("Failed to load pyodide.js"));
        document.head.appendChild(s);
      });
    }

    const pyodide = await globalThis.loadPyodide({ indexURL: PYODIDE_INDEX });
    await pyodide.runPythonAsync(BOOTSTRAP);
    onStatus?.("ready");
    return pyodide;
  })().catch((err) => {
    onStatus?.("error");
    pyodidePromise = null;
    throw err;
  });

  return pyodidePromise;
}

function indentBlock(code) {
  return code
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((ln) => "    " + ln)
    .join("\n");
}

export async function runPython(code) {
  const pyodide = await loadPyodideRuntime();
  const body = indentBlock(code.trim() ? code : "pass");
  const script = `
import sys, traceback
from io import StringIO

async def __vq_entry():
${body}

_buf = StringIO()
_stdout, _stderr = sys.stdout, sys.stderr
sys.stdout = _buf
sys.stderr = _buf
_err = None
try:
    await __vq_entry()
except Exception:
    _err = traceback.format_exc()
finally:
    sys.stdout = _stdout
    sys.stderr = _stderr
(_err or "") + _buf.getvalue()
`;
  const text = String(await pyodide.runPythonAsync(script) ?? "");
  return { ok: !text.includes("Traceback (most recent call last)"), text: text || "(no output)\n" };
}

export const EXAMPLE_CODE = `from vi_browser import get_candles, returns, volatility, moving_average

candles = await get_candles("005930", days=90)
closes = [c["close"] for c in candles]
vol = volatility(closes, 22)
ma = moving_average(closes, 22)

print("bars:", len(candles))
print("last_close:", round(closes[-1], 4))
print("volatility_22:", None if vol is None else round(vol, 6))
print("ma_22_last:", None if ma[-1] is None else round(ma[-1], 4))
print("last_5_returns:", [None if r is None else round(r, 6) for r in returns(closes)[-5:]])
`;
