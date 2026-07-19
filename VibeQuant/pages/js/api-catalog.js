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

# Yahoo (default) or TOSS: await get_candles("005930", days=90, provider="toss")
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
    status: "browser",
    note_en: "TOSS Open API via Worker secrets (≤2 pages). Falls back to mock if unset.",
    note_ko: "Worker 시크릿으로 TOSS Open API (최대 2페이지). 미설정 시 mock.",
    note_zh: "通过 Worker secrets 调用 TOSS（最多 2 页）。未配置则 mock。",
    sample: `from vi_browser import get_candles, show_chart

candles = await get_candles("005930", days=60, provider="toss")
show_chart(candles, title="005930 TOSS")
print("bars", len(candles))
print("last", candles[-1] if candles else None)
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
    id: "bundle",
    gs: "returns + volatility + MA workflow",
    vi: "vi_browser combo sample",
    module: "timeseries",
    status: "browser",
    note_en: "Committee golden script — full small workflow.",
    note_ko: "위원회 골든 스크립트 — 작은 end-to-end 워크플로.",
    note_zh: "委员会黄金脚本 — 小型端到端流程。",
    sample: `from vi_browser import get_candles, returns, volatility, moving_average, show_chart

candles = await get_candles("005930", days=90)
closes = [c["close"] for c in candles]
vol = volatility(closes, 22)
ma = moving_average(closes, 22)
show_chart(candles, title="005930 close")

print("bars:", len(candles))
print("last_close:", round(closes[-1], 4))
print("volatility_22:", None if vol is None else round(vol, 6))
print("ma_22_last:", None if ma[-1] is None else round(ma[-1], 4))
print("last_5_returns:", [None if r is None else round(r, 6) for r in returns(closes)[-5:]])
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
