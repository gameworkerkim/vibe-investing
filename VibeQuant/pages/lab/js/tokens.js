// TokenForge 토큰 추정기 (브라우저, 의존성 없음)
// 기본: 휴리스틱. ChatGPT는 tiktoken CDN 정밀모드 옵션. 수치는 추정 ±15%.

export const FAMILY_PARAMS = {
  claude: {
    label: "Claude",
    latinCharsPerTok: 4.0,
    cjkTokPerChar: 1.45,
    otherTokPerChar: 0.5,
    linesTokPer: 4,
  },
  chatgpt: {
    label: "ChatGPT",
    latinCharsPerTok: 4.0,
    cjkTokPerChar: 1.2,
    otherTokPerChar: 0.5,
    linesTokPer: 4,
  },
};

const CJK_RE =
  /[\p{Script=Hangul}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu;
const LATIN_RE = /[A-Za-z0-9]/g;
const WS_RE = /\s/g;

function charClassStats(text) {
  const cjk = (text.match(CJK_RE) || []).length;
  const latin = (text.match(LATIN_RE) || []).length;
  const ws = (text.match(WS_RE) || []).length;
  const newlines = (text.match(/\r?\n/g) || []).length;
  const other = Math.max(0, [...text].length - cjk - latin - ws);
  return { cjk, latin, other, newlines };
}

export function heuristicCount(text, family = "claude") {
  const p = FAMILY_PARAMS[family] || FAMILY_PARAMS.claude;
  const { cjk, latin, other, newlines } = charClassStats(text);
  const tokens =
    latin / p.latinCharsPerTok +
    cjk * p.cjkTokPerChar +
    other * p.otherTokPerChar +
    newlines / p.linesTokPer;
  return Math.max(1, Math.round(tokens));
}

export function fmt(n) {
  return n.toLocaleString("en-US");
}

export function savedPercent(before, after) {
  if (!before || !after) return 0;
  return Math.round(((before - after) / before) * 100);
}

export function modelStats(source, optimized, family) {
  const before = heuristicCount(source, family);
  const after = heuristicCount(optimized, family);
  return {
    family,
    before,
    after,
    saved: Math.max(0, before - after),
    percent: savedPercent(before, after),
    precise: false,
  };
}

let cdnPromise = null;

export async function loadChatgptPrecision() {
  if (cdnPromise) return cdnPromise;
  cdnPromise = import("https://cdn.jsdelivr.net/npm/gpt-tokenizer@2.4.0/+esm")
    .then((mod) => mod)
    .catch(() => null);
  return cdnPromise;
}

export async function preciseChatgptTokens(source, optimized) {
  try {
    const mod = await loadChatgptPrecision();
    if (!mod) return null;
    const enc = mod.GptEncoding?.getEncodingApiForModel?.("gpt-4o");
    if (!enc) return null;
    return { source: enc.encode(source).length, optimized: enc.encode(optimized).length };
  } catch {
    return null;
  }
}

export async function analyzeForTargets(source, optimized, usePrecise = false) {
  const out = {
    claude: modelStats(source, optimized, "claude"),
    chatgpt: modelStats(source, optimized, "chatgpt"),
  };
  if (usePrecise) {
    const exact = await preciseChatgptTokens(source, optimized);
    if (exact) {
      out.chatgpt.before = exact.source;
      out.chatgpt.after = exact.optimized;
      out.chatgpt.saved = Math.max(0, exact.source - exact.optimized);
      out.chatgpt.percent = savedPercent(exact.source, exact.optimized);
      out.chatgpt.precise = true;
    }
  }
  return out;
}

export const DEFAULT_PRICES = {
  claude: { label: "Claude", in: 3.0, out: 15.0, unit: "$/1M" },
  chatgpt: { label: "ChatGPT", in: 2.5, out: 10.0, unit: "$/1M" },
};

export function costUsd(tokensIn, tokensOut, price) {
  return ((tokensIn / 1e6) * price.in + (tokensOut / 1e6) * price.out).toFixed(4);
}
