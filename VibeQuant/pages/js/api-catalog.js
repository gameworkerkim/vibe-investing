/**
 * GS Quant → VI Quant mapping for the dashboard.
 * status: browser = runs in Pyodide now; local = pip vi_quant; planned = roadmap
 */

export const API_CATALOG = [
  {
    id: "session",
    gs: "GsSession.use(client_id, …)",
    vi: "ViSession.use()",
    module: "session",
    status: "local",
    note_en: "No Marquee credentials; embedded / Cloudflare data later.",
    note_ko: "Marquee 자격증명 불필요. 임베디드 / Cloudflare 시세.",
    note_zh: "无需 Marquee 凭证；本地或 Cloudflare 行情。",
    sample: `# GS:  GsSession.use(Environment.PROD, client_id, client_secret)
# VI:  ViSession.use()  — browser demo uses vi_browser instead
print("ViSession ↔ GsSession: rename Gs→Vi; no GS OAuth in the browser harness")
print("Browser path: from vi_browser import get_candles, …")
`,
  },
  {
    id: "candles",
    gs: "Dataset / GsDataApi market data",
    vi: "vi_browser.get_candles(symbol)",
    module: "data / providers",
    status: "browser",
    note_en: "Open candles via Worker API or deterministic mock.",
    note_ko: "Worker API 또는 결정론적 mock 캔들.",
    note_zh: "通过 Worker API 或确定性 mock K 线。",
    sample: `from vi_browser import get_candles

# Yahoo is the primary live provider for the demo stage.
candles = await get_candles("005930", days=90, provider="yahoo")
print("bars", len(candles))
print("last", candles[-1])
`,
  },
  {
    id: "toss",
    gs: "Dataset / GsDataApi (KR broker feed)",
    vi: "vi_browser.get_candles(..., provider='toss')",
    module: "data / toss",
    status: "planned",
    note_en: "Deferred: TOSS IP allowlist blocks Worker egress. Realtime KR feed will use another path later.",
    note_ko: "후순위: TOSS IP 화이트리스트로 Worker 직통 불가. 실시간 시세는 다른 경로로 추후 연동.",
    note_zh: "延后：TOSS IP 白名单阻断 Worker。实时行情将另路径接入。",
    sample: `print("=== deferred: TOSS provider ===")
print("TOSS Open API needs a fixed egress IP; Cloudflare Workers Free has none.")
print("Use provider='yahoo' for the committee stage today.")
print("Realtime KR feed is planned via a separate ingest path (not Worker→TOSS direct).")
`,
  },
  {
    id: "returns",
    gs: "gs_quant.timeseries.returns",
    vi: "vi_browser.returns / vi_quant.timeseries.returns",
    module: "timeseries",
    status: "browser",
    note_en: "Same idea as GS timeseries.returns on a price series.",
    note_ko: "GS timeseries.returns와 동일 개념의 가격 수익률.",
    note_zh: "与 GS timeseries.returns 相同的价格收益率概念。",
    sample: `from vi_browser import get_candles, returns

candles = await get_candles("AAPL", days=60)
closes = [c["close"] for c in candles]
r = returns(closes)
print("last_5_returns", [None if x is None else round(x, 6) for x in r[-5:]])
`,
  },
  {
    id: "volatility",
    gs: "gs_quant.timeseries.volatility",
    vi: "vi_browser.volatility / vi_quant.timeseries.volatility",
    module: "timeseries",
    status: "browser",
    note_en: "Rolling / window vol; browser demo uses annualized stdev.",
    note_ko: "윈도우 변동성; 브라우저 데모는 연율화 표준편차.",
    note_zh: "窗口波动率；浏览器演示为年化标准差。",
    sample: `from vi_browser import get_candles, volatility

candles = await get_candles("005930", days=120)
closes = [c["close"] for c in candles]
print("volatility_22", round(volatility(closes, 22), 6))
`,
  },
  {
    id: "ma",
    gs: "gs_quant.timeseries.moving_average",
    vi: "vi_browser.moving_average / vi_quant.timeseries.moving_average",
    module: "timeseries",
    status: "browser",
    note_en: "Simple moving average on closes.",
    note_ko: "종가 단순 이동평균.",
    note_zh: "收盘价简单移动平均。",
    sample: `from vi_browser import get_candles, moving_average

candles = await get_candles("TSLA", days=80)
closes = [c["close"] for c in candles]
ma = moving_average(closes, 22)
print("ma_22_last", round(ma[-1], 4))
`,
  },
  {
    id: "correlation",
    gs: "gs_quant.timeseries.correlation",
    vi: "vi_browser.correlation(a, b)",
    module: "timeseries",
    status: "browser",
    note_en: "Pearson correlation of two close series.",
    note_ko: "두 종가 시계열의 피어슨 상관.",
    note_zh: "两条收盘价序列的皮尔逊相关。",
    sample: `from vi_browser import get_candles, correlation

a = await get_candles("005930", days=90)
b = await get_candles("AAPL", days=90)
print("corr_005930_AAPL", round(correlation(a, b), 6))
`,
  },
  {
    id: "mdd",
    gs: "gs_quant.timeseries.max_drawdown",
    vi: "vi_browser.max_drawdown(closes)",
    module: "timeseries",
    status: "browser",
    note_en: "Max drawdown as a negative fraction.",
    note_ko: "최대 낙폭(음수 비율).",
    note_zh: "最大回撤（负比例）。",
    sample: `from vi_browser import get_candles, max_drawdown, show_chart

candles = await get_candles("005930", days=120)
mdd = max_drawdown(candles)
show_chart(candles, title="005930 close")
print("max_drawdown", None if mdd is None else round(mdd, 6))
`,
  },
  {
    id: "rsi",
    gs: "gs_quant.timeseries / technical RSI",
    vi: "vi_browser.rsi(closes, period)",
    module: "timeseries",
    status: "browser",
    note_en: "Wilder-style RSI (list-based in browser).",
    note_ko: "Wilder 방식 RSI (브라우저 리스트 구현).",
    note_zh: "Wilder 风格 RSI（浏览器列表实现）。",
    sample: `from vi_browser import get_candles, rsi

candles = await get_candles("005930", days=120)
r = rsi(candles, 14)
print("rsi_14_last", None if r[-1] is None else round(r[-1], 4))
`,
  },
  {
    id: "macd",
    gs: "technical MACD",
    vi: "vi_browser.macd(closes)",
    module: "timeseries",
    status: "browser",
    note_en: "Returns (macd_line, signal_line, histogram).",
    note_ko: "(macd, signal, hist) 튜플 반환.",
    note_zh: "返回 (macd, signal, hist)。",
    sample: `from vi_browser import get_candles, macd

candles = await get_candles("AAPL", days=120)
line, sig, hist = macd(candles)
print("macd_last", round(line[-1], 6), "signal", round(sig[-1], 6))
`,
  },
  {
    id: "bb",
    gs: "technical Bollinger Bands",
    vi: "vi_browser.bollinger_bands(closes)",
    module: "timeseries",
    status: "browser",
    note_en: "Returns (upper, middle, lower).",
    note_ko: "(upper, middle, lower) 반환.",
    note_zh: "返回 (upper, middle, lower)。",
    sample: `from vi_browser import get_candles, bollinger_bands

candles = await get_candles("005930", days=90)
u, m, l = bollinger_bands(candles, 20, 2)
print("bb_last", round(u[-1], 4), round(m[-1], 4), round(l[-1], 4))
`,
  },
  {
    id: "chart",
    gs: "charts / plot series (GS Marquee UI)",
    vi: "vi_browser.show_chart(candles)",
    module: "viz",
    status: "browser",
    note_en: "Line chart in the result pane (Chart.js).",
    note_ko: "결과 패널 라인 차트 (Chart.js).",
    note_zh: "结果区折线图（Chart.js）。",
    sample: `from vi_browser import get_candles, moving_average, show_chart

candles = await get_candles("005930", days=120)
closes = [c["close"] for c in candles]
ma = moving_average(closes, 22)

show_chart(candles, title="005930 close", series_label="close")
print("bars:", len(candles))
print("last_close:", round(closes[-1], 4))
print("ma_22_last:", None if ma[-1] is None else round(ma[-1], 4))
`,
  },
  {
    id: "backtest",
    gs: "gs_quant.backtests (simplified edu)",
    vi: "vi_browser.backtest(candles, signal)",
    module: "backtest",
    status: "browser",
    note_en: "Next-bar edu backtest: equity + total_return / MDD / Sharpe / CAGR.",
    note_ko: "다음 봉 교육용 백테스트: equity + 수익률/MDD/Sharpe/CAGR.",
    note_zh: "下一根K线教学回测：equity + 收益/MDD/Sharpe/CAGR。",
    sample: `from vi_browser import get_candles, ma_cross_signal, backtest, show_chart

candles = await get_candles("005930", days=180)
sig = ma_cross_signal(candles, fast=10, slow=30)
bt = backtest(candles, sig, fee_bps=10)
show_chart(bt["equity"], title="equity (MA cross)", series_label="equity")
m = bt["metrics"]
print("total_return:", round(m["total_return"], 6))
print("mdd:", round(m["mdd"], 6))
print("sharpe:", round(m["sharpe"], 4))
print("cagr:", round(m["cagr"], 6))
`,
  },
  {
    id: "bundle",
    gs: "returns + volatility + MA + backtest workflow",
    vi: "vi_browser combo sample",
    module: "timeseries",
    status: "browser",
    note_en: "Committee golden script — indicators + educational backtest.",
    note_ko: "위원회 골든 스크립트 — 지표 + 교육용 백테스트.",
    note_zh: "委员会黄金脚本 — 指标 + 教学回测。",
    sample: `from vi_browser import (
    get_candles, returns, volatility, moving_average, rsi,
    ma_cross_signal, backtest, show_chart,
)

candles = await get_candles("005930", days=180)
closes = [c["close"] for c in candles]
vol = volatility(closes, 22)
ma = moving_average(closes, 22)
r = rsi(closes, 14)
sig = ma_cross_signal(candles, 10, 30)
bt = backtest(candles, sig, fee_bps=10)
show_chart(bt["equity"], title="equity (MA cross)")

print("bars:", len(candles))
print("volatility_22:", None if vol is None else round(vol, 6))
print("ma_22_last:", None if ma[-1] is None else round(ma[-1], 4))
print("rsi_14_last:", None if r[-1] is None else round(r[-1], 4))
print("metrics:", {k: round(v, 6) if isinstance(v, float) else v for k, v in bt["metrics"].items()})
`,
  },
  {
    id: "dataapi",
    gs: "GsDataApi.get_market_data",
    vi: "ViDataApi.get_market_data",
    module: "api.vi.data",
    status: "planned",
    note_en: "Stub today — use get_candles in the browser.",
    note_ko: "현재 stub — 브라우저에서는 get_candles 사용.",
    note_zh: "目前为 stub — 浏览器请用 get_candles。",
    sample: `print("=== planned: ViDataApi (not in browser) ===")
print("GS:  GsDataApi.get_market_data(...)")
print("VI:  ViDataApi.get_market_data(...)  # Phase 1 local/stub")
print("Browser today: from vi_browser import get_candles")
print("This sample is informational only — no ImportError expected.")
`,
  },
  {
    id: "swap",
    gs: "IRSwap(...).calc(Price())",
    vi: "IRSwap(...).calc(Price())  # QuantLib local",
    module: "instrument / risk",
    status: "planned",
    note_en: "Not available in WASM. Local Phase 2.",
    note_ko: "WASM 불가. 로컬 Phase 2.",
    note_zh: "WASM 不可用。本地 Phase 2。",
    sample: `print("=== planned: IRSwap pricing (not in browser) ===")
print("GS/VI signature: IRSwap('Pay', '10y', 'USD').calc(Price())")
print("Requires local QuantLib — blocked in Pyodide/WASM.")
print("Phase 2 roadmap only. Use vi_browser samples for this demo.")
`,
  },
];

export function noteFor(item, lang) {
  if (lang === "ko") return item.note_ko;
  if (lang === "zh") return item.note_zh;
  return item.note_en;
}
