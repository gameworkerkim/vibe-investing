/**
 * GET /api/research/bio
 * AMQS-BIO biopharma dashboard — Cache API TTL 4h
 */
import { getCached, setCached, json } from "../../_lib/cache.js";
import { fetchBars } from "../../_lib/yahoo.js";
import { calculateRSI, calculateMA } from "../../_lib/quant-calc.js";

const CACHE_KEY = "bio:amqs:v1";
const TTL = 4 * 60 * 60;

const LARGE_CAP = new Set([
  "LLY", "NVO", "MRK", "PFE", "AMGN", "ABBV", "GILD", "VRTX", "ALNY",
  "TMO", "DHR", "BIIB", "REGN", "JNJ",
]);

const STOCKS = [
  { symbol: "LLY", name: "Eli Lilly", subtheme: "Metabolic/Obesity" },
  { symbol: "NVO", name: "Novo Nordisk", subtheme: "Metabolic/Obesity" },
  { symbol: "AMGN", name: "Amgen", subtheme: "Metabolic/Obesity" },
  { symbol: "VKTX", name: "Viking Therapeutics", subtheme: "Metabolic/Obesity" },
  { symbol: "MRK", name: "Merck", subtheme: "Oncology" },
  { symbol: "PFE", name: "Pfizer", subtheme: "Oncology" },
  { symbol: "EXEL", name: "Exelixis", subtheme: "Oncology" },
  { symbol: "INCY", name: "Incyte", subtheme: "Oncology" },
  { symbol: "RVMD", name: "Revolution Medicines", subtheme: "Oncology" },
  { symbol: "ABBV", name: "AbbVie", subtheme: "Immunology/I&I" },
  { symbol: "ARGX", name: "argenx", subtheme: "Immunology/I&I" },
  { symbol: "APGE", name: "Apogee Therapeutics", subtheme: "Immunology/I&I" },
  { symbol: "BIIB", name: "Biogen", subtheme: "Neuro" },
  { symbol: "AXSM", name: "Axsome", subtheme: "Neuro" },
  { symbol: "ACAD", name: "Acadia", subtheme: "Neuro" },
  { symbol: "VRTX", name: "Vertex", subtheme: "Rare/Genetic" },
  { symbol: "ALNY", name: "Alnylam", subtheme: "Rare/Genetic" },
  { symbol: "BMRN", name: "BioMarin", subtheme: "Rare/Genetic" },
  { symbol: "IONS", name: "Ionis", subtheme: "Rare/Genetic" },
  { symbol: "GILD", name: "Gilead", subtheme: "Virology" },
  { symbol: "MRNA", name: "Moderna", subtheme: "Virology" },
  { symbol: "TMO", name: "Thermo Fisher", subtheme: "Tools/Dx" },
  { symbol: "DHR", name: "Danaher", subtheme: "Tools/Dx" },
  { symbol: "ILMN", name: "Illumina", subtheme: "Tools/Dx" },
  { symbol: "EXAS", name: "Exact Sciences", subtheme: "Tools/Dx" },
  { symbol: "TEM", name: "Tempus AI", subtheme: "AI-Platform" },
  { symbol: "RXRX", name: "Recursion", subtheme: "AI-Platform" },
  { symbol: "SDGR", name: "Schrödinger", subtheme: "AI-Platform" },
  { symbol: "ABSI", name: "Absci", subtheme: "AI-Platform" },
  { symbol: "RLAY", name: "Relay Therapeutics", subtheme: "AI-Platform" },
];

const CFG = {
  topN: 8,
  maxPerSubtheme: 2,
  maxVol: 0.7,
  maxBeta: 2.0,
  maxDrop: -0.2,
  maxGain: 0.25,
  riskOffVix: 28,
  defensiveXbi5d: -0.08,
  maxWeight: 0.12,
  gapCap: 0.03 / 0.55,
};

function retN(closes, n) {
  if (closes.length <= n) return null;
  return closes.at(-1) / closes.at(-1 - n) - 1;
}

function factor12_1(closes) {
  if (closes.length < 253) return null;
  return closes.at(-21) / closes.at(-252) - 1;
}

function factor6_1(closes) {
  if (closes.length < 127) return null;
  return closes.at(-21) / closes.at(-126) - 1;
}

function annVol(closes, n = 60) {
  if (closes.length < n + 1) return null;
  const rets = [];
  for (let i = closes.length - n; i < closes.length; i++) {
    rets.push(closes[i] / closes[i - 1] - 1);
  }
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const var_ =
    rets.reduce((s, r) => s + (r - mean) ** 2, 0) / Math.max(1, rets.length - 1);
  return Math.sqrt(var_ * 252);
}

function maxSingleDay(closes, n = 90, mode = "min") {
  const start = Math.max(1, closes.length - n);
  let ext = mode === "min" ? 0 : -Infinity;
  for (let i = start; i < closes.length; i++) {
    const d = closes[i] / closes[i - 1] - 1;
    if (mode === "min") ext = Math.min(ext, d);
    else ext = Math.max(ext, d);
  }
  return ext;
}

function beta(closes, mktCloses) {
  const n = Math.min(closes.length, mktCloses.length, 252);
  if (n < 60) return null;
  const rs = [];
  const ms = [];
  for (let i = closes.length - n; i < closes.length; i++) {
    const mi = i - (closes.length - mktCloses.length);
    if (mi < 1) continue;
    rs.push(closes[i] / closes[i - 1] - 1);
    ms.push(mktCloses[mi] / mktCloses[mi - 1] - 1);
  }
  if (rs.length < 30) return null;
  const mr = ms.reduce((a, b) => a + b, 0) / ms.length;
  const rr = rs.reduce((a, b) => a + b, 0) / rs.length;
  let cov = 0;
  let varM = 0;
  for (let i = 0; i < rs.length; i++) {
    cov += (rs[i] - rr) * (ms[i] - mr);
    varM += (ms[i] - mr) ** 2;
  }
  return varM ? cov / varM : null;
}

function zscore(vals) {
  const v = vals.filter((x) => x != null && !Number.isNaN(x));
  if (v.length < 2) return vals.map(() => 0);
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  const sd = Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / (v.length - 1));
  if (!sd) return vals.map(() => 0);
  return vals.map((x) => (x == null || Number.isNaN(x) ? 0 : (x - mean) / sd));
}

function to100(z) {
  return Math.max(0, Math.min(100, 50 + z * 15));
}

function detectRegime(xbiBars, vixBars) {
  const xbi = xbiBars.map((b) => b.close);
  const vix = vixBars.length ? vixBars.at(-1).close : 20;
  if (xbi.length < 200) {
    return { label: "RISK_ON", reason: "XBI 데이터 부족", invested: 1, xbi5d: 0, xbiAbove200: true, vix };
  }
  const last = xbi.at(-1);
  const ma200 = xbi.slice(-200).reduce((a, b) => a + b, 0) / 200;
  const xbi5d = xbi.length >= 6 ? last / xbi.at(-6) - 1 : 0;
  const above = last > ma200;
  if (xbi5d < CFG.defensiveXbi5d) {
    return { label: "DEFENSIVE", reason: `XBI 5일 ${(xbi5d * 100).toFixed(1)}% 급락`, invested: 0, xbi5d, xbiAbove200: above, vix, xbi: last, ma200 };
  }
  if (!above || vix > CFG.riskOffVix) {
    const parts = [];
    if (!above) parts.push(`XBI ${last.toFixed(1)} < 200MA ${ma200.toFixed(1)}`);
    if (vix > CFG.riskOffVix) parts.push(`VIX ${vix.toFixed(1)}`);
    return { label: "RISK_OFF", reason: parts.join(" · "), invested: 0.5, xbi5d, xbiAbove200: above, vix, xbi: last, ma200 };
  }
  return {
    label: "RISK_ON",
    reason: `XBI +200MA · VIX ${vix.toFixed(1)} · 5D ${(xbi5d * 100).toFixed(1)}%`,
    invested: 1,
    xbi5d,
    xbiAbove200: above,
    vix,
    xbi: Math.round(last * 100) / 100,
    ma200: Math.round(ma200 * 100) / 100,
  };
}

function macroFit(spyBars, vix, tnxBars) {
  const spy = spyBars.map((b) => b.close);
  let spyAbove = true;
  if (spy.length >= 200) {
    spyAbove = spy.at(-1) > spy.slice(-200).reduce((a, b) => a + b, 0) / 200;
  }
  let tnxChg = 0;
  if (tnxBars.length > 61) {
    tnxChg = tnxBars.at(-1).close / tnxBars.at(-61).close - 1;
  }
  const rateHeadwind = tnxChg >= 0.15;
  let base = 50;
  if (spyAbove) base += 25;
  if (vix <= 22) base += 15;
  else if (vix >= CFG.riskOffVix) base -= 25;
  const large = Math.max(0, Math.min(100, base * (rateHeadwind ? 0.9 : 1)));
  const small = Math.max(0, Math.min(100, base * (rateHeadwind ? 0.6 : 1)));
  return { large, small, rateHeadwind, tnxChg: Math.round(tnxChg * 1000) / 10 };
}

function classifySignal(total, pullback, momentum, mdd) {
  if (mdd != null && mdd < -0.35) return "EXIT";
  if (pullback > 60 && momentum > 50) return "DIP_BUY";
  if (total >= 80) return "CENTER";
  if (total >= 65) return "SATELLITE";
  if (total >= 50) return "TACTICAL";
  return "REDUCE";
}

function buildRawMetrics(stockBars, spyBars, xbiRet5d) {
  const closes = stockBars.map((b) => b.close);
  const last = closes.at(-1);
  const prev = closes.at(-2);
  const fA = factor12_1(closes);
  const fB = factor6_1(closes);
  const vol = annVol(closes);
  const ret5 = retN(closes, 5);
  const ret20 = retN(closes, 20);
  const drop = maxSingleDay(closes, 90, "min");
  const gain = maxSingleDay(closes, 90, "max");
  const b = beta(closes, spyBars.map((x) => x.close));
  const rsi = calculateRSI(closes, 14);
  const ma50 = calculateMA(closes, 50);
  const ma200 = calculateMA(closes, Math.min(200, closes.length));
  const hi52 = Math.max(...closes.slice(-252));
  const dist52 = hi52 ? last / hi52 - 1 : null;

  let filtered = false;
  let filterReason = "";
  const reasons = [];
  if (vol != null && vol > CFG.maxVol) reasons.push("고변동");
  if (b != null && b > CFG.maxBeta) reasons.push("고베타");
  if (drop < CFG.maxDrop) reasons.push("갭다운");
  if (gain > CFG.maxGain) reasons.push("급등잔상");
  if (reasons.length) {
    filtered = true;
    filterReason = reasons.join(" · ");
  }

  let pullbackRaw = 0;
  if (fA > 0 && fB > 0 && last > ma50) {
    const dip5 = ret5 != null ? Math.max(0, -ret5) : 0;
    const dip20 = ret20 != null ? Math.max(0, -ret20) : 0;
    if ((dip5 >= 0.03 || dip20 >= 0.05) && (ret5 == null || ret5 >= xbiRet5d * 1.5)) {
      pullbackRaw = (0.7 * dip5 + 0.3 * dip20) * (1 + Math.min(fA, 1));
      if (rsi <= 30) pullbackRaw += 0.02 * ((30 - rsi) / 30);
    }
  }

  return {
    price: Math.round(last * 100) / 100,
    change1d: prev ? Math.round(((last - prev) / prev) * 10000) / 100 : null,
    factorA: fA,
    factorB: fB,
    ret5d: ret5,
    ret20d: ret20,
    vol60: vol,
    beta: b,
    rsi14: Math.round(rsi),
    dist52w: dist52,
    above50: last > ma50,
    above200: last > ma200,
    mdd12m: (() => {
      const s = closes.slice(-252);
      let peak = s[0];
      let mdd = 0;
      for (const c of s) {
        peak = Math.max(peak, c);
        mdd = Math.min(mdd, c / peak - 1);
      }
      return mdd;
    })(),
    filtered,
    filterReason,
    pullbackRaw,
    invVol: vol && vol > 0 ? 1 / vol : 0,
  };
}

function scoreAll(rawList, macro) {
  const zA = zscore(rawList.map((r) => r.factorA));
  const zB = zscore(rawList.map((r) => r.factorB));
  const zP = zscore(rawList.map((r) => r.pullbackRaw));

  return rawList.map((r, i) => {
    if (r.filtered || r.price == null || r.factorA == null) {
      return {
        ...r,
        composite: 0,
        scoreMomentum: 0,
        scorePullback: 0,
        scoreMacro: 0,
        total100: r.total100 ?? 0,
        signal: r.signal || "EXCLUDED",
        weight: 0,
        selected: false,
      };
    }
    const composite = 0.35 * zA[i] + 0.35 * zB[i] + 0.08 * (r.invVol ? r.invVol : 0);
    const scoreMomentum = to100(composite);
    const scorePullback = to100(zP[i]);
    const scoreMacro = LARGE_CAP.has(r.symbol) ? macro.large : macro.small;
    const total100 =
      0.3 * scoreMomentum +
      0.1 * scorePullback +
      0.2 * (r.above200 ? 80 : 40) +
      0.15 * 55 +
      0.25 * scoreMacro;
    const signal = classifySignal(total100, scorePullback, scoreMomentum, r.mdd12m);
    return {
      ...r,
      composite: Math.round(composite * 1000) / 1000,
      scoreMomentum: Math.round(scoreMomentum * 10) / 10,
      scorePullback: Math.round(scorePullback * 10) / 10,
      scoreMacro: Math.round(scoreMacro * 10) / 10,
      total100: Math.round(total100 * 10) / 10,
      signal,
      weight: 0,
      selected: false,
    };
  });
}

function allocate(scored, regime) {
  const maxW = Math.min(CFG.maxWeight, CFG.gapCap);
  const eligible = scored
    .filter((s) => !["EXIT", "EXCLUDED", "REDUCE"].includes(s.signal))
    .sort((a, b) => b.total100 - a.total100);
  const selected = [];
  const perTheme = {};
  for (const s of eligible) {
    if (selected.length >= CFG.topN) break;
    if ((perTheme[s.subtheme] || 0) >= CFG.maxPerSubtheme) continue;
    selected.push(s);
    perTheme[s.subtheme] = (perTheme[s.subtheme] || 0) + 1;
  }
  if (!selected.length || !regime.invested) return scored;
  const base = regime.invested / selected.length;
  let weights = selected.map((s) =>
    Math.max(0.04, Math.min(maxW, base * (1 + 1.5 * (s.total100 - 65) / 30)))
  );
  // Gap cap: do not renorm to 100% — excess stays cash
  selected.forEach((s, i) => {
    s.weight = Math.round(weights[i] * 10000) / 10000;
    s.selected = true;
  });
  return scored;
}

async function buildStock(s, barsMap, spyBars, xbiRet5d) {
  const bars = barsMap[s.symbol];
  if (!bars || bars.length < 127) {
    return {
      symbol: s.symbol,
      name: s.name,
      subtheme: s.subtheme,
      price: null,
      change1d: null,
      factorA: null,
      ret5d: null,
      ret20d: null,
      rsi14: null,
      total100: 0,
      scoreMacro: null,
      signal: "—",
      weight: 0,
      selected: false,
      filterReason: "데이터 부족",
    };
  }
  const raw = buildRawMetrics(bars, spyBars, xbiRet5d);
  return { symbol: s.symbol, name: s.name, subtheme: s.subtheme, ...raw };
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const force = url.searchParams.get("refresh") === "1";

  if (!force) {
    const cached = await getCached(request, CACHE_KEY);
    if (cached && !cached.stale) {
      return json({ ...cached.data, fromCache: true, cachedSecondsAgo: cached.age });
    }
  }

  try {
    const tickers = ["SPY", "XBI", "IBB", "^VIX", "^TNX", ...STOCKS.map((s) => s.symbol)];
    const results = await Promise.allSettled(tickers.map((t) => fetchBars(t, "1y")));
    const barsMap = {};
    tickers.forEach((sym, i) => {
      if (results[i].status === "fulfilled") barsMap[sym] = results[i].value;
    });

    const spyBars = barsMap.SPY ?? [];
    const xbiBars = barsMap.XBI ?? [];
    const ibbBars = barsMap.IBB ?? [];
    const vixBars = barsMap["^VIX"] ?? [];
    const tnxBars = barsMap["^TNX"] ?? [];

    const regime = detectRegime(xbiBars, vixBars);
    const macro = macroFit(spyBars, regime.vix, tnxBars);

    const rawStocks = await Promise.all(
      STOCKS.map((s) => buildStock(s, barsMap, spyBars, regime.xbi5d))
    );
    const scored = scoreAll(rawStocks, macro);
    allocate(scored, regime);

    scored.sort((a, b) => (b.total100 ?? 0) - (a.total100 ?? 0));

    const xbiCl = xbiBars.map((b) => b.close);
    const ibbCl = ibbBars.map((b) => b.close);
    const bench = {
      xbi5d: regime.xbi5d != null ? Math.round(regime.xbi5d * 10000) / 100 : null,
      xbi20d: xbiCl.length > 20 ? Math.round(retN(xbiCl, 20) * 10000) / 100 : null,
      ibb5d: ibbCl.length > 5 ? Math.round(retN(ibbCl, 5) * 10000) / 100 : null,
      xbiIbbSpread5d:
        xbiCl.length > 5 && ibbCl.length > 5
          ? Math.round((retN(xbiCl, 5) - retN(ibbCl, 5)) * 10000) / 100
          : null,
    };

    const payload = {
      generatedAt: new Date().toISOString(),
      regime,
      macro,
      bench,
      portfolio: {
        invested: Math.round(scored.reduce((s, x) => s + (x.weight || 0), 0) * 10000) / 10000,
        holdings: scored.filter((s) => s.selected).map((s) => ({ symbol: s.symbol, weight: s.weight, signal: s.signal })),
        avgScore: Math.round(
          (scored.filter((s) => s.total100 > 0).reduce((a, b) => a + b.total100, 0) /
            Math.max(1, scored.filter((s) => s.total100 > 0).length)) *
            10
        ) / 10,
      },
      stocks: scored.map((s) => ({
        symbol: s.symbol,
        name: s.name,
        subtheme: s.subtheme,
        price: s.price,
        change1d: s.change1d,
        factorA: s.factorA != null ? Math.round(s.factorA * 10000) / 100 : null,
        factorB: s.factorB != null ? Math.round(s.factorB * 10000) / 100 : null,
        ret5d: s.ret5d != null ? Math.round(s.ret5d * 10000) / 100 : null,
        ret20d: s.ret20d != null ? Math.round(s.ret20d * 10000) / 100 : null,
        rsi14: s.rsi14,
        scoreMacro: s.scoreMacro,
        total100: s.total100,
        signal: s.signal,
        weight: s.weight,
        selected: s.selected,
        filterReason: s.filterReason || null,
      })),
      fromCache: false,
    };

    await setCached(CACHE_KEY, payload, TTL);
    return json(payload);
  } catch (e) {
    const cached = await getCached(request, CACHE_KEY);
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
