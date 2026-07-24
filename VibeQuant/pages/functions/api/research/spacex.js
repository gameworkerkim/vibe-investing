/**
 * GET /api/research/spacex
 * Space / defense basket quant — Cache API TTL 4h (no Prisma/Neon)
 */
import { getCached, setCached, json } from "../../_lib/cache.js";
import { fetchBars } from "../../_lib/yahoo.js";
import { calculateRSI, calculateMA, calculateMomentum, momentumSignal } from "../../_lib/quant-calc.js";

const CACHE_KEY = "spacex:quant:v1";
const TTL = 4 * 60 * 60;

const STOCKS = [
  { symbol: "RKLB", name: "Rocket Lab", group: "pure_space" },
  { symbol: "ASTS", name: "AST SpaceMobile", group: "pure_space" },
  { symbol: "LUNR", name: "Intuitive Machines", group: "pure_space" },
  { symbol: "SPCE", name: "Virgin Galactic", group: "pure_space" },
  { symbol: "RDW", name: "Redwire", group: "pure_space" },
  { symbol: "ARKX", name: "ARK Space ETF", group: "etf" },
  { symbol: "LMT", name: "Lockheed Martin", group: "defense" },
  { symbol: "NOC", name: "Northrop Grumman", group: "defense" },
  { symbol: "RTX", name: "Raytheon", group: "defense" },
  { symbol: "BA", name: "Boeing", group: "defense" },
];

function calcWilliamsR(bars, period = 14) {
  if (bars.length < period) return null;
  const slice = bars.slice(-period);
  const hh = Math.max(...slice.map((b) => b.high));
  const ll = Math.min(...slice.map((b) => b.low));
  const close = bars[bars.length - 1].close;
  if (hh === ll) return -50;
  return ((hh - close) / (hh - ll)) * -100;
}

function calcScore(wr, rsi, close, sma20, sma50, mom) {
  let s = 0;
  if (wr !== null) {
    if (wr <= -80) s += 1.0;
    else if (wr >= -20) s -= 1.0;
    else if (wr <= -60) s += 0.5;
  }
  if (rsi !== null) {
    if (rsi < 30) s += 1.0;
    else if (rsi > 70) s -= 1.0;
    else if (rsi < 45) s += 0.3;
    else if (rsi > 55) s -= 0.3;
  }
  if (sma20 !== null) s += close > sma20 ? 0.5 : -0.5;
  if (sma50 !== null) s += close > sma50 ? 0.5 : -0.5;
  if (mom !== null) {
    if (mom > 15) s += 0.5;
    else if (mom > 5) s += 0.2;
    else if (mom < -15) s -= 0.5;
    else if (mom < -5) s -= 0.2;
  }
  return Math.max(-3, Math.min(3, Math.round(s * 10) / 10));
}

function scoreToSignal(score) {
  if (score >= 1.5) return "BUY";
  if (score <= -1.5) return "SELL";
  if (score <= -0.5) return "AVOID";
  return "HOLD";
}

async function buildStock(s) {
  try {
    const bars = await fetchBars(s.symbol, "3mo");
    if (bars.length < 21) throw new Error("short");
    const closes = bars.map((b) => b.close);
    const last = bars[bars.length - 1];
    const prev = bars[bars.length - 2];
    const wr = calcWilliamsR(bars);
    const rsi = calculateRSI(closes, 14);
    const sma20 = calculateMA(closes, 20);
    const sma50 = calculateMA(closes, 50);
    const mom = calculateMomentum(closes, 20);
    const score = calcScore(wr, rsi, last.close, sma20, sma50, mom);
    const bar5 = bars.length >= 6 ? bars[bars.length - 6] : null;
    return {
      symbol: s.symbol,
      name: s.name,
      group: s.group,
      price: Math.round(last.close * 100) / 100,
      change1d: prev ? Math.round(((last.close - prev.close) / prev.close) * 10000) / 100 : null,
      change5d: bar5
        ? Math.round(((last.close - bar5.close) / bar5.close) * 10000) / 100
        : null,
      williamsR: wr != null ? Math.round(wr * 10) / 10 : null,
      rsi14: Math.round(rsi),
      sma20: Math.round(sma20 * 100) / 100,
      sma50: Math.round(sma50 * 100) / 100,
      momentum20: Math.round(mom * 100) / 100,
      score,
      signal: scoreToSignal(score),
      momSignal: momentumSignal(mom),
    };
  } catch {
    return {
      symbol: s.symbol,
      name: s.name,
      group: s.group,
      price: null,
      change1d: null,
      change5d: null,
      williamsR: null,
      rsi14: null,
      sma20: null,
      sma50: null,
      momentum20: null,
      score: 0,
      signal: "HOLD",
      momSignal: "HOLD",
    };
  }
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
    const stocks = await Promise.all(STOCKS.map(buildStock));
    const payload = {
      generatedAt: new Date().toISOString(),
      stocks,
      fromCache: false,
    };
    await setCached(CACHE_KEY, payload, TTL);
    return json(payload);
  } catch (e) {
    if (cached) {
      return json({ ...cached.data, fromCache: true, stale: true, error: e.message });
    }
    return json({ error: e.message || String(e) }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
    },
  });
}
