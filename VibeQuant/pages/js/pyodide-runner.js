/**
 * Load Pyodide and run user Python in the browser.
 * Injects thin vi_browser (Worker candles + mock + chart bridge).
 * Keep in sync with vi_browser/timeseries.py + backtest.py (list-based subset).
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
    """Push a line chart. data = candles, numeric list, or dict of {name: series}."""
    # Multi-series: {"NVDA": [...], "MU": [...]}
    if isinstance(data, dict) and data:
        sample = next(iter(data.values()))
        if isinstance(sample, (list, tuple)) and (not sample or not isinstance(sample[0], dict)):
            n = max(len(v) for v in data.values())
            labels = [str(i) for i in range(n)]
            datasets = []
            for name, series in data.items():
                vals = []
                for i in range(n):
                    if i < len(series) and series[i] is not None:
                        vals.append(float(series[i]))
                    else:
                        vals.append(None)
                datasets.append({"label": str(name), "values": vals})
            _set_chart({
                "title": str(title),
                "series_label": str(series_label),
                "labels": labels,
                "datasets": datasets,
            })
            print(f"[chart] {title}: {len(datasets)} series x {n} points")
            return n

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
                labels.append(str(i))
                values.append(None)
            else:
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

def _closes(closes):
    xs = list(closes)
    if xs and isinstance(xs[0], dict):
        xs = [r["close"] for r in xs]
    return [float(x) for x in xs if x is not None]

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

def momentum(closes, window=22):
    """Price momentum: close / close[n] - 1."""
    xs = _closes(closes)
    w = int(window)
    out = []
    for i in range(len(xs)):
        if i < w or xs[i - w] == 0:
            out.append(None)
        else:
            out.append(xs[i] / xs[i - w] - 1.0)
    return out

def _series(closes):
    return _closes(closes)

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

def zscores(closes, window=252):
    xs = _closes(closes)
    w = int(window)
    out = []
    for i in range(len(xs)):
        if i + 1 < w:
            out.append(None)
        else:
            chunk = xs[i + 1 - w : i + 1]
            mean = sum(chunk) / w
            var = sum((x - mean) ** 2 for x in chunk) / max(1, w - 1)
            std = math.sqrt(var)
            out.append(None if std == 0 else (xs[i] - mean) / std)
    return out

def beta(asset, benchmark, window=252):
    ra = [r for r in returns(asset)]
    rb = [r for r in returns(benchmark)]
    n = min(len(ra), len(rb))
    w = int(window)
    out = [None] * n
    for i in range(n):
        if i + 1 < w + 1:
            continue
        aa = [x for x in ra[i + 1 - w : i + 1] if x is not None]
        bb = [x for x in rb[i + 1 - w : i + 1] if x is not None]
        m = min(len(aa), len(bb))
        if m < 3:
            continue
        aa, bb = aa[-m:], bb[-m:]
        ma, mb = sum(aa) / m, sum(bb) / m
        cov = sum((aa[j] - ma) * (bb[j] - mb) for j in range(m)) / (m - 1)
        var = sum((bb[j] - mb) ** 2 for j in range(m)) / (m - 1)
        out[i] = None if var == 0 else cov / var
    return out

def annualized_return(closes, trading_days=252):
    xs = _closes(closes)
    if len(xs) < 2 or xs[0] == 0:
        return 0.0
    total = xs[-1] / xs[0] - 1.0
    years = len(xs) / float(trading_days)
    if years <= 0:
        return 0.0
    return float((1 + total) ** (1 / years) - 1)

def sharpe_ratio(closes, risk_free_rate=0.0, trading_days=252):
    rets = [r for r in returns(closes) if r is not None]
    if len(rets) < 2:
        return 0.0
    mean = sum(rets) / len(rets)
    var = sum((x - mean) ** 2 for x in rets) / (len(rets) - 1)
    std = math.sqrt(var)
    if std == 0:
        return 0.0
    excess = mean - (risk_free_rate / trading_days)
    return float(math.sqrt(trading_days) * excess / std)

def rsi(closes, period=14):
    xs = _closes(closes)
    p = int(period)
    out = [None] * len(xs)
    if len(xs) < p + 1:
        return out
    gains, losses = [], []
    for i in range(1, len(xs)):
        d = xs[i] - xs[i - 1]
        gains.append(max(d, 0.0))
        losses.append(max(-d, 0.0))
    avg_g = sum(gains[:p]) / p
    avg_l = sum(losses[:p]) / p
    rs = None if avg_l == 0 else avg_g / avg_l
    out[p] = 100.0 if rs is None else 100.0 - (100.0 / (1.0 + rs))
    alpha = 1.0 / p
    for i in range(p, len(gains)):
        avg_g = (1 - alpha) * avg_g + alpha * gains[i]
        avg_l = (1 - alpha) * avg_l + alpha * losses[i]
        rs = None if avg_l == 0 else avg_g / avg_l
        out[i + 1] = 100.0 if rs is None else 100.0 - (100.0 / (1.0 + rs))
    return out

def macd(closes, fast=12, slow=26, signal=9):
    xs = _closes(closes)
    def ema(series, span):
        if not series:
            return []
        a = 2.0 / (span + 1)
        out = [series[0]]
        for i in range(1, len(series)):
            out.append(a * series[i] + (1 - a) * out[-1])
        return out
    ef, es = ema(xs, fast), ema(xs, slow)
    line = [ef[i] - es[i] for i in range(len(xs))]
    sig = ema(line, signal)
    hist = [line[i] - sig[i] for i in range(len(xs))]
    return line, sig, hist

def bollinger_bands(closes, period=20, stddev=2):
    xs = _closes(closes)
    p, k = int(period), float(stddev)
    upper, middle, lower = [], [], []
    for i in range(len(xs)):
        if i + 1 < p:
            upper.append(None); middle.append(None); lower.append(None)
        else:
            chunk = xs[i + 1 - p : i + 1]
            m = sum(chunk) / p
            var = sum((x - m) ** 2 for x in chunk) / max(1, p - 1)
            s = math.sqrt(var)
            middle.append(m)
            upper.append(m + k * s)
            lower.append(m - k * s)
    return upper, middle, lower

def ma_cross_signal(closes, fast=10, slow=30):
    xs = _closes(closes)
    n = len(xs)
    out = [0] * n
    if n < slow or fast < 1 or slow <= fast:
        return out
    for i in range(slow - 1, n):
        f = sum(xs[i + 1 - fast : i + 1]) / fast
        s = sum(xs[i + 1 - slow : i + 1]) / slow
        out[i] = 1 if f > s else 0
    return out

def backtest(candles, signal, fee_bps=10, trading_days=252):
    """Next-bar educational backtest. Same rules as vi_browser.backtest."""
    closes = _closes(candles)
    n = len(closes)
    if n < 2:
        return {
            "equity": [1.0] * max(n, 1),
            "rets": [0.0] * n,
            "positions": [0.0] * n,
            "metrics": {
                "total_return": 0.0, "mdd": 0.0, "sharpe": 0.0, "cagr": 0.0,
                "bars": n, "fee_bps": float(fee_bps),
            },
        }
    sig = [float(x) if x is not None else 0.0 for x in signal]
    if len(sig) < n:
        sig = sig + [0.0] * (n - len(sig))
    elif len(sig) > n:
        sig = sig[:n]
    positions = [0.0] * n
    rets = [0.0] * n
    equity = [1.0] * n
    fee = float(fee_bps) / 10000.0
    for i in range(1, n):
        positions[i] = sig[i - 1]
        prev_c, cur_c = closes[i - 1], closes[i]
        raw = positions[i] * (cur_c / prev_c - 1.0) if prev_c else 0.0
        rets[i] = raw - abs(positions[i] - positions[i - 1]) * fee
        equity[i] = equity[i - 1] * (1.0 + rets[i])
    total_return = equity[-1] / equity[0] - 1.0
    peak, mdd = equity[0], 0.0
    for e in equity:
        if e > peak:
            peak = e
        if peak > 0:
            dd = e / peak - 1.0
            if dd < mdd:
                mdd = dd
    active = rets[1:]
    if len(active) >= 2:
        mean = sum(active) / len(active)
        var = sum((x - mean) ** 2 for x in active) / (len(active) - 1)
        std = math.sqrt(var) if var > 0 else 0.0
        sharpe = (mean / std) * math.sqrt(trading_days) if std > 0 else 0.0
    else:
        sharpe = 0.0
    years = (n - 1) / float(trading_days)
    cagr = float(equity[-1] ** (1.0 / years) - 1.0) if years > 0 and equity[-1] > 0 else 0.0
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

vi_browser.get_candles = get_candles
vi_browser.returns = returns
vi_browser.volatility = volatility
vi_browser.moving_average = moving_average
vi_browser.momentum = momentum
vi_browser.correlation = correlation
vi_browser.max_drawdown = max_drawdown
vi_browser.zscores = zscores
vi_browser.beta = beta
vi_browser.annualized_return = annualized_return
vi_browser.sharpe_ratio = sharpe_ratio
vi_browser.rsi = rsi
vi_browser.macd = macd
vi_browser.bollinger_bands = bollinger_bands
vi_browser.backtest = backtest
vi_browser.ma_cross_signal = ma_cross_signal
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
        get_candles, returns, volatility, moving_average, momentum,
        correlation, max_drawdown, zscores, beta,
        annualized_return, sharpe_ratio, rsi, macd, bollinger_bands,
        backtest, ma_cross_signal, show_chart,
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

export const EXAMPLE_CODE = `from vi_browser import get_candles, momentum, volatility, show_chart

TICKERS = ["NVDA", "MU", "SNDK", "AVGO"]
norm = {}
for sym in TICKERS:
    c = await get_candles(sym, days=180, provider="yahoo")
    closes = [x["close"] for x in c]
    base = closes[0] or 1.0
    norm[sym] = [x / base for x in closes]
    print(sym, "vol22", round(volatility(closes, 22) or 0, 4), "mom22", round(momentum(closes, 22)[-1] or 0, 4))
show_chart(norm, title="Semi basket normalized", series_label="norm")
`;
