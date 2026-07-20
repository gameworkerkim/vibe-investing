/**
 * Phase 3 community share artifacts (bundled — no network fetch).
 * Schema: docs/SHARE_FORMAT.md
 */

/** @type {import('./community-samples.js').CommunitySample[]} */

/**
 * @typedef {object} CommunitySample
 * @property {string} schema
 * @property {string} id
 * @property {string} title_en
 * @property {string} title_ko
 * @property {string} title_zh
 * @property {string} author
 * @property {string} python
 * @property {{ provider: string, symbols: string[], days: number }} data
 * @property {{ stdout_markers: string[], source_ok: string[] }} expected
 * @property {string[]} disclosures
 * @property {string[]} [limits]
 * @property {string} [source_url]
 */

export const COMMUNITY_SAMPLES = [
  {
    schema: "vibequant.share/v1",
    id: "share-ma-cross-005930",
    title_en: "MA cross 005930 (shared)",
    title_ko: "MA 크로스 005930 (공유)",
    title_zh: "均线交叉 005930（共享）",
    author: "VibeQuant committee",
    source_url:
      "https://github.com/gameworkerkim/vibe-investing/blob/main/VibeQuant/pages/js/community-samples.js",
    data: { provider: "yahoo", symbols: ["005930.KS"], days: 180 },
    expected: {
      stdout_markers: ["VQ_METRICS", "total_return=", "mdd=", "sharpe=", "cagr="],
      source_ok: ["yahoo", "r2", "cache", "candles"],
    },
    disclosures: [
      "Educational next-bar backtest only — not investment advice.",
      "Live Yahoo candles change daily; metrics are not bit-stable across days.",
      "Committee stage: same vi_browser APIs + Worker data path.",
    ],
    limits: ["Pyodide/WASM memory", "Cloudflare Free quota", "No TOSS realtime in Worker"],
    python: `from vi_browser import get_candles, ma_cross_signal, backtest, show_chart

# Shared community sample — MA(10/30) cross on Samsung Electronics
SYMBOL, DAYS, PROVIDER = "005930.KS", 180, "yahoo"
candles = await get_candles(SYMBOL, days=DAYS, provider=PROVIDER)
sig = ma_cross_signal(candles, fast=10, slow=30)
bt = backtest(candles, sig, fee_bps=10)
m = bt["metrics"]
show_chart(bt["equity"], title=f"{SYMBOL} equity (MA cross)", series_label="equity")
print(f"bars={len(candles)} symbol={SYMBOL} provider={PROVIDER}")
print(
    "VQ_METRICS "
    f"total_return={m['total_return']:.6f} "
    f"mdd={m['mdd']:.6f} "
    f"sharpe={m['sharpe']:.6f} "
    f"cagr={m['cagr']:.6f}"
)
print("disclosures: edu next-bar backtest; not investment advice")
`,
  },
];

export function communityTitle(sample, lang) {
  if (lang === "ko" && sample.title_ko) return sample.title_ko;
  if (lang === "zh" && sample.title_zh) return sample.title_zh;
  return sample.title_en || sample.id;
}
