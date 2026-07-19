/**
 * Golden LLM Quant prompts for the committee stage.
 */

/** @type {{ id: string, title_en: string, title_ko: string, title_zh: string, prompt: string }[]} */
export const GOLDEN_LLM_PROMPTS = [
  {
    id: "llm-mom",
    title_en: "Semi momentum",
    title_ko: "반도체 모멘텀",
    title_zh: "半导体动量",
    prompt: `NVDA, MU, SNDK, AVGO의 22일 모멘텀을 비교해줘.
계산 가능한 종목만 랭킹하고, N/A는 제외해.
vi_browser로 파이썬을 만들어 실행 가능하게 해줘.`,
  },
  {
    id: "llm-ma",
    title_en: "MA cross backtest",
    title_ko: "MA 크로스 백테스트",
    title_zh: "均线回测",
    prompt: `005930(삼성전자)에 대해 MA(10/30) 크로스 교육용 백테스트를 돌려줘.
fee_bps=10, metrics(total_return, mdd, sharpe, cagr)를 출력하고 equity를 show_chart로 그려줘.`,
  },
  {
    id: "llm-rsi",
    title_en: "RSI zones",
    title_ko: "RSI 구간",
    title_zh: "RSI 区间",
    prompt: `AAPL과 TSLA의 RSI(14) 최근 값을 비교하고 overbought/oversold/mid 구간을 알려줘.
가능하면 파이썬으로 RSI 시계열을 차트에 그려줘.`,
  },
  {
    id: "llm-vol",
    title_en: "Vol + MDD",
    title_ko: "변동성·MDD",
    title_zh: "波动与回撤",
    prompt: `BTC-USD와 ETH-USD의 연율화 변동성(22)과 max drawdown을 비교 설명해줘.
데이터를 쓰려면 vi_browser 파이썬을 생성해.`,
  },
  {
    id: "llm-explain",
    title_en: "Explain only",
    title_ko: "설명만",
    title_zh: "仅说明",
    prompt: `퀀트에서 22일 모멘텀 Momentum = close/close[22]-1 공식을 한국어로 짧게 설명해줘.
코드 실행 없이 answer 모드로만 답해.`,
  },
  {
    id: "llm-semi-rsi",
    title_en: "NVDA/INTC/MU RSI",
    title_ko: "NVDA·INTC·MU RSI",
    title_zh: "NVDA/INTC/MU RSI",
    prompt: `엔비디아(NVDA), 인텔(INTC), 마이크론(MU)의 RSI 구간과 MDD를 비교하고,
모멘텀 관점의 가상 포트폴리오 비중과 최근 가격을 알려줘.
반드시 vi_browser 리스트 API만 사용 (asyncio.run 금지, pandas/iloc 금지).
closes = [c["close"] for c in candles], rsi(..., period=14), momentum(..., window=20), max_drawdown은 스칼라.`,
  },
];

export function llmPromptTitle(item, lang) {
  if (lang === "ko") return item.title_ko;
  if (lang === "zh") return item.title_zh;
  return item.title_en;
}
