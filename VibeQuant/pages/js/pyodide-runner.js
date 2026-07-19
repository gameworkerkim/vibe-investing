/**
 * Load Pyodide and run user Python in the browser.
 * Injects thin vi_browser (Worker candles + mock + chart bridge).
 */

const PYODIDE_INDEX = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/";

const BOOTSTRAP = `
import math, sys, types, json

vi_browser = types.ModuleType("vi_browser")

def _js_to_py(raw):
    """Convert JsProxy JSON to Python without pyodide.ffi.to_py (broken on some builds)."""
    from js import JSON
    return json.loads(str(JSON.stringify(raw)))

def _set_chart(payload):
    from js import window, JSON as JSJSON
    window.__VQ_CHART__ = JSJSON.parse(json.dumps(payload))

def show_chart(data, title="Chart", series_label="close"):
    """Push a line chart to the dashboard. data = candles dicts or numeric series."""
    labels = []
    values = []
    xs = list(data) if data is not None else []
    if not xs:
        return None
    if isinstance(xs[0], dict):
        for i, row in enumerate(xs):
            labels.append(str(row.get("time") or row.get("date") or i))
            if "close" in row:
                values.append(float(row["close"]))
            elif series_label in row:
                values.append(float(row[series_label]))
            else:
                values.append(float(next(v for k, v in row.items() if isinstance(v, (int, float)))))
    else:
        for i, v in enumerate(xs):
            if v is None:
                continue
            labels.append(str(i))
            values.append(float(v))
    _set_chart({
        "title": str(title),
        "series_label": str(series_label),
        "labels": labels,
        "values": values,
    })
    print(f"[chart] {title}: {len(values)} points")
    return len(values)

async def get_candles(symbol="AAPL", days=60, provider="yahoo"):
    days = int(days)
    api = ""
    try:
        from js import window
        cfg = getattr(window, "RUNTIME_CONFIG", None)
        if cfg is not None:
            api = str(getattr(cfg, "VIBEQUANT_API_BASE", "") or "") or api
        if not api:
            api = str(getattr(window, "VIBEQUANT_API_BASE", "") or "")
    except Exception:
        pass
    if api:
        try:
            from js import fetch
            prov = provider or "yahoo"
            url = f"{api.rstrip('/')}/api/v1/candles/{prov}/{symbol}?days={days}"
            res = await fetch(url)
            if res.ok:
                data = _js_to_py(await res.json())
                if isinstance(data, dict):
                    rows = data.get("candles") or data.get("data") or data
                    src = data.get("source")
                    if src:
                        print(f"[candles] source={src} provider={data.get('provider')}")
                else:
                    rows = data
                if isinstance(rows, list) and rows:
                    return rows
        except Exception as e:
            print(f"[candles] worker fallback: {e}")
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
    print("[candles] source=local_mock")
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

def _series(closes):
    xs = list(closes)
    if xs and isinstance(xs[0], dict):
        xs = [r["close"] for r in xs]
    return [float(x) for x in xs if x is not None]

def correlation(a, b):
    """Pearson correlation of two price/return series (aligned length)."""
    xa, xb = _series(a), _series(b)
    n = min(len(xa), len(xb))
    if n < 3:
        return None
    xa, xb = xa[-n:], xb[-n:]
    ma = sum(xa) / n
    mb = sum(xb) / n
    num = sum((xa[i] - ma) * (xb[i] - mb) for i in range(n))
    da = math.sqrt(sum((x - ma) ** 2 for x in xa))
    db = math.sqrt(sum((x - mb) ** 2 for x in xb))
    if da == 0 or db == 0:
        return None
    return num / (da * db)

def max_drawdown(closes):
    """Max drawdown as a negative fraction (e.g. -0.12 = -12%)."""
    xs = _series(closes)
    if len(xs) < 2:
        return None
    peak = xs[0]
    mdd = 0.0
    for x in xs:
        if x > peak:
            peak = x
        if peak > 0:
            dd = x / peak - 1.0
            if dd < mdd:
                mdd = dd
    return mdd

vi_browser.get_candles = get_candles
vi_browser.returns = returns
vi_browser.volatility = volatility
vi_browser.moving_average = moving_average
vi_browser.correlation = correlation
vi_browser.max_drawdown = max_drawdown
vi_browser.show_chart = show_chart
sys.modules["vi_browser"] = vi_browser
`;

let pyodidePromise = null;
let lastLoadMs = null;

export function getLastLoadMs() {
  return lastLoadMs;
}

export function loadPyodideRuntime(onStatus) {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = (async () => {
    onStatus?.("loading");
    const t0 = performance.now();
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
    lastLoadMs = Math.round(performance.now() - t0);
    onStatus?.("ready");
    return pyodide;
  })().catch((err) => {
    onStatus?.("error");
    pyodidePromise = null;
    lastLoadMs = null;
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
  try {
    delete globalThis.__VQ_CHART__;
  } catch {
    globalThis.__VQ_CHART__ = null;
  }
  const body = indentBlock(code.trim() ? code : "pass");
  const script = `
import sys, traceback
from io import StringIO

async def __vq_entry():
    from vi_browser import (
        get_candles, returns, volatility, moving_average,
        correlation, max_drawdown, show_chart,
    )
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
  const text = String((await pyodide.runPythonAsync(script)) ?? "");
  return {
    ok: !text.includes("Traceback (most recent call last)"),
    text: text || "(no output)\n",
    chart: globalThis.__VQ_CHART__ || null,
  };
}

export const EXAMPLE_CODE = `from vi_browser import get_candles, returns, volatility, moving_average, show_chart

candles = await get_candles("005930", days=90)
closes = [c["close"] for c in candles]
vol = volatility(closes, 22)
ma = moving_average(closes, 22)
show_chart(candles, title="005930 close", series_label="close")

print("bars:", len(candles))
print("last_close:", round(closes[-1], 4))
print("volatility_22:", None if vol is None else round(vol, 6))
print("ma_22_last:", None if ma[-1] is None else round(ma[-1], 4))
`;
