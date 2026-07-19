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

const HELPERS = `def fmt(x, nd=2):
    return "n/a" if x is None else f"{x:.{nd}f}"

def last_num(xs):
    for x in reversed(xs):
        if x is not None:
            return x
    return None
`;

/** @type {{ id: string, title_en: string, title_ko: string, title_zh: string, sample: string }[]} */
export const DEMO_EXAMPLES = [
  {
    id: "ex-ma",
    title_en: "Moving Average",
    title_ko: "Moving Average",
    title_zh: "Moving Average",
    sample: `from vi_browser import get_candles, moving_average, show_chart

${HELPERS}
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
    f, s = last_num(ma_f), last_num(ma_s)
    bull = f is not None and s is not None and f > s
    base = closes[0] or 1.0
    norm[sym] = [x / base for x in closes]
    print(f"{sym}: bars={len(c)} last={fmt(closes[-1])} ma{FAST}={fmt(f)} ma{SLOW}={fmt(s)} signal={'LONG' if bull else 'FLAT'}")

show_chart(norm, title="Normalized close — NVDA/MU/SNDK/AVGO", series_label="norm")
`,
  },
  {
    id: "ex-rsi",
    title_en: "RSI",
    title_ko: "RSI",
    title_zh: "RSI",
    sample: `from vi_browser import get_candles, rsi, show_chart

${HELPERS}
TICKERS = ["NVDA", "MU", "SNDK", "AVGO"]
DAYS, PERIOD = 160, 14

rsi_map = {}
print("=== RSI(14) — overbought>70 / oversold<30 ===")
for sym in TICKERS:
    c = await get_candles(sym, days=DAYS, provider="yahoo")
    r = rsi(c, PERIOD)
    last = last_num(r)
    zone = "OB" if last is not None and last > 70 else ("OS" if last is not None and last < 30 else "MID")
    rsi_map[sym] = r
    print(f"{sym}: bars={len(c)} rsi14={fmt(last)} zone={zone}")

show_chart(rsi_map, title="RSI(14) — NVDA/MU/SNDK/AVGO", series_label="rsi")
`,
  },
  {
    id: "ex-macd",
    title_en: "MACD",
    title_ko: "MACD",
    title_zh: "MACD",
    sample: `from vi_browser import get_candles, macd, show_chart

${HELPERS}
TICKERS = ["NVDA", "MU", "SNDK", "AVGO"]
DAYS = 160

hist_map = {}
print("=== MACD histogram (line - signal) ===")
for sym in TICKERS:
    c = await get_candles(sym, days=DAYS, provider="yahoo")
    line, sig, hist = macd(c)
    lv, sv, hv = last_num(line), last_num(sig), last_num(hist)
    bull = lv is not None and sv is not None and lv > sv
    hist_map[sym] = hist
    print(f"{sym}: bars={len(c)} macd={fmt(lv,4)} signal={fmt(sv,4)} hist={fmt(hv,4)} bias={'BULL' if bull else 'BEAR'}")

show_chart(hist_map, title="MACD histogram — NVDA/MU/SNDK/AVGO", series_label="hist")
`,
  },
  {
    id: "ex-bb",
    title_en: "Bollinger Bands",
    title_ko: "Bollinger Bands",
    title_zh: "Bollinger Bands",
    sample: `from vi_browser import get_candles, bollinger_bands, show_chart

${HELPERS}
TICKERS = ["NVDA", "MU", "SNDK", "AVGO"]
DAYS, N, K = 160, 20, 2

pct_b = {}
print("=== Bollinger %B = (close-lower)/(upper-lower) ===")
for sym in TICKERS:
    c = await get_candles(sym, days=DAYS, provider="yahoo")
    closes = [x["close"] for x in c]
    u, mid, lo = bollinger_bands(closes, N, K)
    series = []
    for i, px in enumerate(closes):
        if u[i] is None or lo[i] is None or u[i] == lo[i]:
            series.append(None)
        else:
            series.append((px - lo[i]) / (u[i] - lo[i]))
    last = last_num(series)
    mid_v = last_num(mid)
    pos = "ABOVE" if last is not None and last > 1 else ("BELOW" if last is not None and last < 0 else "IN")
    pct_b[sym] = series
    print(f"{sym}: bars={len(c)} close={fmt(closes[-1] if closes else None)} mid={fmt(mid_v)} %B={fmt(last,3)} band={pos}")

show_chart(pct_b, title="Bollinger %B — NVDA/MU/SNDK/AVGO", series_label="%B")
`,
  },
  {
    id: "ex-momentum",
    title_en: "Momentum",
    title_ko: "Momentum",
    title_zh: "Momentum",
    sample: `from vi_browser import get_candles, momentum, show_chart

${HELPERS}
def mom_grade(m):
    if m is None:
        return "N/A"
    pct = m * 100
    if pct >= 10:
        return "Strong"
    if pct >= 2:
        return "Positive"
    if pct > -2:
        return "Flat"
    if pct > -10:
        return "Weak"
    return "Bearish"

def pct_str(m):
    return "n/a" if m is None else f"{m * 100:+.2f}%"

TICKERS = ["NVDA", "MU", "SNDK", "AVGO"]
DAYS, WINDOW = 180, 22

mom_map = {}
rows = []
print("=== 22-day Momentum ===")
print(f"formula: Momentum_22 = close_today / close_{WINDOW}d_ago - 1")
print("  >0 rising over window | <0 falling | =0 flat")
print("")

for sym in TICKERS:
    c = await get_candles(sym, days=DAYS, provider="yahoo")
    bars = len(c)
    m = momentum(c, WINDOW)
    last = last_num(m)
    mom_map[sym] = m
    rows.append((sym, last, bars))

    print(sym)
    print(f"  22-day Momentum   {pct_str(last)}")
    if last is None:
        need = WINDOW + 1
        why = f"insufficient data (bars={bars}, need>{WINDOW})" if bars <= WINDOW else "missing prior close"
        print(f"  grade             N/A ({why})")
    else:
        print(f"  grade             {mom_grade(last)}")
    print("")

# Rank only symbols with a computable momentum (exclude N/A)
ranked = [(s, v) for s, v, _ in rows if v is not None]
ranked.sort(key=lambda x: -x[1])  # strong → weak
na_list = [s for s, v, _ in rows if v is None]

print("rank (strong → weak):")
if ranked:
    for i, (s, v) in enumerate(ranked, 1):
        print(f"  {i}. {s}  {pct_str(v)}  {mom_grade(v)}")
else:
    print("  (no symbols with enough data)")
if na_list:
    print("excluded (N/A):", ", ".join(na_list))

show_chart(mom_map, title="22d momentum — NVDA/MU/SNDK/AVGO", series_label="mom")
`,
  },
  {
    id: "ex-vol",
    title_en: "Volatility",
    title_ko: "Volatility",
    title_zh: "Volatility",
    sample: `from vi_browser import get_candles, returns, volatility, max_drawdown, show_chart

${HELPERS}
TICKERS = ["NVDA", "MU", "SNDK", "AVGO"]
DAYS = 180

norm = {}
print("=== Annualized vol(22) + MDD ===")
for sym in TICKERS:
    c = await get_candles(sym, days=DAYS, provider="yahoo")
    closes = [x["close"] for x in c]
    vol = volatility(closes, 22)
    mdd = max_drawdown(closes)
    rets = returns(closes)
    base = closes[0] or 1.0
    norm[sym] = [x / base for x in closes]
    print(f"{sym}: bars={len(c)} vol22={fmt(vol,4)} mdd={fmt(mdd,4)} last_ret={fmt(last_num(rets),4)}")

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

${HELPERS}
# Multi-factor scorecard — NVIDIA / Micron / Sandisk / Broadcom
TICKERS = ["NVDA", "MU", "SNDK", "AVGO"]
DAYS = 180

norm = {}
scoreboard = []
print("=== Multi Factor scorecard (edu demo) ===")
print("factors: MA trend | RSI mid | momentum | inverse vol | MACD hist | BB %B")
for sym in TICKERS:
    c = await get_candles(sym, days=DAYS, provider="yahoo")
    closes = [x["close"] for x in c]
    ma_f, ma_s = moving_average(closes, 10), moving_average(closes, 30)
    r = last_num(rsi(closes, 14))
    mom = last_num(momentum(closes, 22))
    vol = volatility(closes, 22)
    line, sig, hist = macd(closes)
    hv = last_num(hist)
    u, mid, lo = bollinger_bands(closes, 20, 2)
    uu, ll = last_num(u), last_num(lo)
    pb = None
    if uu is not None and ll is not None and uu != ll and closes:
        pb = (closes[-1] - ll) / (uu - ll)

    s_ma = 1 if last_num(ma_f) is not None and last_num(ma_s) is not None and last_num(ma_f) > last_num(ma_s) else 0
    s_rsi = 1 if r is not None and 40 <= r <= 65 else 0
    s_mom = 1 if mom is not None and mom > 0 else 0
    s_vol = 1 if vol is not None and vol < 0.55 else 0
    s_macd = 1 if hv is not None and hv > 0 else 0
    s_bb = 1 if pb is not None and 0.2 <= pb <= 0.8 else 0
    total = s_ma + s_rsi + s_mom + s_vol + s_macd + s_bb

    base = closes[0] or 1.0
    norm[sym] = [x / base for x in closes]
    scoreboard.append((sym, total, r, mom, vol, hv, pb))
    print(
        f"{sym}: score={total}/6  rsi={fmt(r,1)}  "
        f"mom22={fmt(mom,3)}  vol={fmt(vol,3)}  "
        f"macd_h={fmt(hv,4)}  %B={fmt(pb,3)}"
    )

# Prefer higher score; break ties with momentum (N/A mom sorts last)
scoreboard.sort(key=lambda x: (-x[1], -(x[3] if x[3] is not None else -1e9)))
print("rank (by score):", " > ".join(f"{s}({sc})" for s, sc, *_ in scoreboard))
show_chart(norm, title="Multi Factor basket — normalized close", series_label="norm")
`,
  },
];

export function exampleTitle(ex, lang) {
  if (lang === "ko") return ex.title_ko;
  if (lang === "zh") return ex.title_zh;
  return ex.title_en;
}
