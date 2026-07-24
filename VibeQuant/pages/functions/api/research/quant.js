/**
 * GET /api/research/quant
 * ARDS-X + AMQS-M7 + hedge — cached 30m (US hours) / 2h
 * No auth. Ported from cassandra-ai /api/quant
 */
import { getCached, setCached, json, marketAwareTtl } from "../../_lib/cache.js";
import {
  calculateRegime,
  calculateMomentum,
  momentumSignal,
  calculateHedgeWeight,
  calculateRSI,
  calculateMA,
} from "../../_lib/quant-calc.js";
import { fetchBars } from "../../_lib/yahoo.js";

const CACHE_KEY = "quant:realtime:v1";

const AMQS_M7 = [
  { ticker: "NVDA", name: "엔비디아" },
  { ticker: "AVGO", name: "브로드컴" },
  { ticker: "AMD", name: "AMD" },
  { ticker: "QCOM", name: "퀄컴" },
  { ticker: "ASML", name: "ASML" },
  { ticker: "MU", name: "마이크론" },
  { ticker: "TSM", name: "TSMC" },
];

function computeArdsX(bars, vixBars) {
  const closes = bars.map((b) => b.close);
  const volumes = bars.map((b) => b.volume).filter(Boolean);
  const ma20 = calculateMA(closes, 20);
  const ma60 = calculateMA(closes, 60);
  const rsi = calculateRSI(closes, 14);
  const cur = closes[closes.length - 1];
  const volSMA =
    volumes.length >= 20 ? volumes.slice(-20).reduce((s, v) => s + v, 0) / 20 : 0;
  const curVol = volumes[volumes.length - 1] ?? 0;
  const vix = vixBars.length ? vixBars[vixBars.length - 1].close ?? 20 : 20;
  const regime = calculateRegime(cur, ma20, ma60, rsi, curVol, volSMA, vix);

  const history = bars
    .slice(-20)
    .map((b, i) => {
      const idx = bars.length - 20 + i;
      const slicedCloses = closes.slice(0, idx + 1);
      if (slicedCloses.length < 20) return null;
      const hMa20 = calculateMA(slicedCloses, 20);
      const hMa60 = calculateMA(slicedCloses, Math.min(60, slicedCloses.length));
      const hRsi = calculateRSI(slicedCloses, 14);
      const hVix = vixBars[Math.min(i, vixBars.length - 1)]?.close ?? vix;
      const hVol = bars[idx].volume ?? 0;
      const hVolSMA =
        volumes.slice(Math.max(0, idx - 20), idx).reduce((s, v) => s + v, 0) / 20 || 1;
      const r = calculateRegime(
        slicedCloses.at(-1),
        hMa20,
        hMa60,
        hRsi,
        hVol,
        hVolSMA,
        hVix
      );
      return { date: b.date, regime: r.regime, label: r.label };
    })
    .filter(Boolean);

  const slice = bars.slice(-20);
  const h = Math.max(...slice.map((b) => b.high ?? b.close));
  const drawdown20 = ((cur - h) / h) * 100;

  return {
    ...regime,
    vix: Math.round(vix * 10) / 10,
    ma20,
    ma60,
    rsi,
    drawdown20,
    history,
    qqq: Math.round(cur * 100) / 100,
  };
}

function computeAMQS(stockBarsMap) {
  const stocks = AMQS_M7.map(({ ticker, name }) => {
    const bars = stockBarsMap[ticker];
    if (!bars || bars.length < 21) {
      return {
        ticker,
        name,
        price: null,
        change1d: null,
        momentum20: null,
        signal: "—",
        score: 0,
        rsi: null,
      };
    }
    const closes = bars.map((b) => b.close);
    const last = closes.at(-1);
    const prev = closes.at(-2);
    const mom20 = calculateMomentum(closes, 20);
    const rsi = calculateRSI(closes, 14);
    const sig = momentumSignal(mom20);
    let score = 0;
    if (mom20 > 15) score += 40;
    else if (mom20 > 5) score += 20;
    else if (mom20 < -15) score -= 40;
    else if (mom20 < -5) score -= 20;
    if (rsi > 60) score += 20;
    else if (rsi < 40) score -= 20;
    if (last > calculateMA(closes, 50)) score += 20;
    else score -= 20;
    return {
      ticker,
      name,
      price: Math.round(last * 100) / 100,
      change1d: Math.round(((last - prev) / prev) * 10000) / 100,
      momentum20: Math.round(mom20 * 100) / 100,
      rsi: Math.round(rsi),
      signal: sig,
      score: Math.max(-100, Math.min(100, score)),
    };
  });

  const valid = stocks.filter((s) => s.momentum20 !== null);
  const avgMom = valid.length
    ? valid.reduce((s, st) => s + (st.momentum20 ?? 0), 0) / valid.length
    : 0;
  const avgScore = valid.length
    ? valid.reduce((s, st) => s + st.score, 0) / valid.length
    : 0;

  return {
    stocks,
    avgMom: Math.round(avgMom * 100) / 100,
    avgScore: Math.round(avgScore * 10) / 10,
    overallSignal: momentumSignal(avgMom),
  };
}

export async function onRequestGet(context) {
  const { request } = context;
  const cached = await getCached(request, CACHE_KEY);
  if (cached && !cached.stale) {
    return json({
      ...cached.data,
      fromCache: true,
      cachedSecondsAgo: cached.age,
    });
  }

  try {
    const allTickers = ["QQQ", "^VIX", ...AMQS_M7.map((s) => s.ticker)];
    const results = await Promise.allSettled(allTickers.map((t) => fetchBars(t, "3mo")));
    const barsMap = {};
    allTickers.forEach((sym, i) => {
      const r = results[i];
      if (r.status === "fulfilled") barsMap[sym] = r.value;
    });

    const qqqBars = barsMap["QQQ"] ?? [];
    const vixBars = barsMap["^VIX"] ?? [];
    const ardsX =
      qqqBars.length >= 20
        ? computeArdsX(qqqBars, vixBars)
        : {
            regime: 1,
            label: "횡보",
            signal: "HOLD",
            vix: 20,
            ma20: 0,
            ma60: 0,
            rsi: 50,
            drawdown20: 0,
            history: [],
            qqq: null,
          };

    const stockBarsMap = {};
    AMQS_M7.forEach(({ ticker }) => {
      if (barsMap[ticker]) stockBarsMap[ticker] = barsMap[ticker];
    });
    const amqs = computeAMQS(stockBarsMap);
    const hedge = calculateHedgeWeight(ardsX.regime);

    const payload = {
      generatedAt: new Date().toISOString(),
      ardsX,
      amqs,
      hedge,
      fromCache: false,
    };

    await setCached(CACHE_KEY, payload, marketAwareTtl());
    return json(payload);
  } catch (e) {
    if (cached) {
      return json({
        ...cached.data,
        fromCache: true,
        stale: true,
        error: e.message,
      });
    }
    return json({ error: e.message || String(e) }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type",
    },
  });
}
