/**
 * Demo Examples — semiconductor basket: NVDA / MU / SNDK / AVGO
 * Loaded into the Pyodide runner via the Examples chip bar.
 */

export const SEMI_TICKERS = [
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "MU", name: "Micron" },
  { symbol: "SNDK", name: "Sandisk" },
  { symbol: "AVGO", name: "Broadcom" },
];

/** @type {{ id: string, title_en: string, title_ko: string, title_zh: string, sample: string }[]} */
export const DEMO_EXAMPLES = [
  {
    id: "ex-ma",
    title_en: "Moving Average",
    title_ko: "Moving Average",
    title_zh: "Moving Average",
    sample: `from vi_browser import get_candles, moving_average, show_chart

# Semiconductor basket: NVIDIA / Micron / Sandisk / Broadcom
TICKERS = ["NVDA", "MU", "SNDK", "AVGO"]
DAYS, FAST, SLOW = 180, 10, 30

norm = {}
print("=== Moving Average cross (fast>slow = bullish) ===")
for sym in TICKERS:
    c = await get_candles(sym, days=DAYS, provider="yahoo")
    closes = [x["close"] for x in c]
    ma_f = moving_average(closes, FAST)
    ma_s = moving_average(closes, SLOW)
    bull = ma_f[-1] is not None and ma_s[-1] is not None and ma_f[-1] > ma_s[-1]
    base = closes[0] or 1.0
    norm[sym] = [x / base for x in closes]
    print(f"{sym}: bars={len(c)} last={closes[-1]:.2f} ma{FAST}={ma_f[-1]:.2f} ma{SLOW}={ma_s[-1]:.2f} signal={'LONG' if bull else 'FLAT'}")

show_chart(norm, title="Normalized close — NVDA/MU/SNDK/AVGO", series_label="norm")
`,
  },
  {
    id: "ex-rsi",
    title_en: "RSI",
    title_ko: "RSI",
    title_zh: "RSI",
    sample: `from vi_browser import get_candles, rsi, show_chart

TICKERS = ["NVDA", "MU", "SNDK", "AVGO"]
DAYS, PERIOD = 160, 14

rsi_map = {}
print("=== RSI(14) — overbought>70 / oversold<30 ===")
for sym in TICKERS:
    c = await get_candles(sym, days=DAYS, provider="yahoo")
    r = rsi(c, PERIOD)
    last = r[-1]
    zone = "OB" if last is not None and last > 70 else ("OS" if last is not None and last < 30 else "MID")
    rsi_map[sym] = [x if x is not None else None for x in r]
    print(f"{sym}: rsi14={None if last is None else round(last, 2)} zone={zone}")

show_chart(rsi_map, title="RSI(14) — NVDA/MU/SNDK/AVGO", series_label="rsi")
`,
  },
  {
    id: "ex-macd",
    title_en: "MACD",
    title_ko: "MACD",
    title_zh: "MACD",
    sample: `from vi_browser import get_candles, macd, show_chart

TICKERS = ["NVDA", "MU", "SNDK", "AVGO"]
DAYS = 160

hist_map = {}
print("=== MACD histogram (line - signal) ===")
for sym in TICKERS:
    c = await get_candles(sym, days=DAYS, provider="yahoo")
    line, sig, hist = macd(c)
    bull = line[-1] > sig[-1]
    hist_map[sym] = hist
    print(f"{sym}: macd={line[-1]:.4f} signal={sig[-1]:.4f} hist={hist[-1]:.4f} bias={'BULL' if bull else 'BEAR'}")

show_chart(hist_map, title="MACD histogram — NVDA/MU/SNDK/AVGO", series_label="hist")
`,
  },
  {
    id: "ex-bb",
    title_en: "Bollinger Bands",
    title_ko: "Bollinger Bands",
    title_zh: "Bollinger Bands",
    sample: `from vi_browser import get_candles, bollinger_bands, show_chart

TICKERS = ["NVDA", "MU", "SNDK", "AVGO"]
DAYS, N, K = 160, 20, 2

pct_b = {}
print("=== Bollinger %B = (close-lower)/(upper-lower) ===")
for sym in TICKERS:
    c = await get_candles(sym, days=DAYS, provider="yahoo")
    closes = [x["close"] for x in c]
    u, m, l = bollinger_bands(closes, N, K)
    series = []
    for i, px in enumerate(closes):
        if u[i] is None or l[i] is None or u[i] == l[i]:
            series.append(None)
        else:
            series.append((px - l[i]) / (u[i] - l[i]))
    last = series[-1]
    pos = "ABOVE" if last is not None and last > 1 else ("BELOW" if last is not None and last < 0 else "IN")
    pct_b[sym] = series
    print(f"{sym}: close={closes[-1]:.2f} mid={m[-1]:.2f} %B={None if last is None else round(last, 3)} band={pos}")

show_chart(pct_b, title="Bollinger %B — NVDA/MU/SNDK/AVGO", series_label="%B")
`,
  },
  {
    id: "ex-momentum",
    title_en: "Momentum",
    title_ko: "Momentum",
    title_zh: "Momentum",
    sample: `from vi_browser import get_candles, momentum, show_chart

TICKERS = ["NVDA", "MU", "SNDK", "AVGO"]
DAYS, WINDOW = 180, 22

mom_map = {}
print("=== Momentum = close/close[n] - 1 (22d) ===")
rows = []
for sym in TICKERS:
    c = await get_candles(sym, days=DAYS, provider="yahoo")
    m = momentum(c, WINDOW)
    last = m[-1]
    mom_map[sym] = m
    rows.append((sym, last))
    print(f"{sym}: mom22={None if last is None else round(last, 4)}")

rows.sort(key=lambda x: -1e9 if x[1] is None else -x[1])
print("rank (strong → weak):", " > ".join(r[0] for r in rows))
show_chart(mom_map, title="22d momentum — NVDA/MU/SNDK/AVGO", series_label="mom")
`,
  },
  {
    id: "ex-vol",
    title_en: "Volatility",
    title_ko: "Volatility",
    title_zh: "Volatility",
    sample: `from vi_browser import get_candles, returns, volatility, max_drawdown, show_chart

TICKERS = ["NVDA", "MU", "SNDK", "AVGO"]
DAYS = 180

norm = {}
print("=== Annualized vol(22) + MDD ===")
for sym in TICKERS:
    c = await get_candles(sym, days=DAYS, provider="yahoo")
    closes = [x["close"] for x in c]
    vol = volatility(closes, 22)
    mdd = max_drawdown(closes)
    base = closes[0] or 1.0
    norm[sym] = [x / base for x in closes]
    print(f"{sym}: vol22={None if vol is None else round(vol, 4)} mdd={None if mdd is None else round(mdd, 4)} last_ret={round(returns(closes)[-1] or 0, 4)}")

show_chart(norm, title="Normalized price (vol context) — semi basket", series_label="norm")
`,
  },
  {
    id: "ex-multifactor",
    title_en: "Multi Factor",
    title_ko: "Multi Factor",
    title_zh: "Multi Factor",
    sample: `from vi_browser import (
    get_candles, moving_average, rsi, momentum, volatility,
    macd, bollinger_bands, show_chart,
)

# Multi-factor scorecard — NVIDIA / Micron / Sandisk / Broadcom
TICKERS = ["NVDA", "MU", "SNDK", "AVGO"]
DAYS = 180

def last(xs):
    for x in reversed(xs):
        if x is not None:
            return x
    return None

norm = {}
scoreboard = []
print("=== Multi Factor scorecard (edu demo) ===")
print("factors: MA trend | RSI mid | momentum | inverse vol | MACD hist | BB %B")
for sym in TICKERS:
    c = await get_candles(sym, days=DAYS, provider="yahoo")
    closes = [x["close"] for x in c]
    ma_f, ma_s = moving_average(closes, 10), moving_average(closes, 30)
    r = last(rsi(closes, 14))
    mom = last(momentum(closes, 22))
    vol = volatility(closes, 22)
    line, sig, hist = macd(closes)
    u, m, l = bollinger_bands(closes, 20, 2)
    pb = None
    if u[-1] is not None and l[-1] is not None and u[-1] != l[-1]:
        pb = (closes[-1] - l[-1]) / (u[-1] - l[-1])

    # simple 0/1 style edu scores (not production alphas)
    s_ma = 1 if last(ma_f) is not None and last(ma_s) is not None and last(ma_f) > last(ma_s) else 0
    s_rsi = 1 if r is not None and 40 <= r <= 65 else 0
    s_mom = 1 if mom is not None and mom > 0 else 0
    s_vol = 1 if vol is not None and vol < 0.55 else 0
    s_macd = 1 if hist[-1] > 0 else 0
    s_bb = 1 if pb is not None and 0.2 <= pb <= 0.8 else 0
    total = s_ma + s_rsi + s_mom + s_vol + s_macd + s_bb

    base = closes[0] or 1.0
    norm[sym] = [x / base for x in closes]
    scoreboard.append((sym, total, r, mom, vol, hist[-1], pb))
    print(
        f"{sym}: score={total}/6  rsi={None if r is None else round(r,1)}  "
        f"mom22={None if mom is None else round(mom,3)}  vol={None if vol is None else round(vol,3)}  "
        f"macd_h={round(hist[-1],4)}  %B={None if pb is None else round(pb,3)}"
    )

scoreboard.sort(key=lambda x: (-x[1], -(x[3] or -1e9)))
print("rank:", " > ".join(f"{s}({sc})" for s, sc, *_ in scoreboard))
show_chart(norm, title="Multi Factor basket — normalized close", series_label="norm")
`,
  },
];

export function exampleTitle(ex, lang) {
  if (lang === "ko") return ex.title_ko;
  if (lang === "zh") return ex.title_zh;
  return ex.title_en;
}
