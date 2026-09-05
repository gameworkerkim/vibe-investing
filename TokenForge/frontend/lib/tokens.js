// TokenForge 토큰 추정기 (브라우저 + vitest 공용, 의존성 없음)
// - 기본: 임베디드 휴리스틱(영어 ~4자/토큰, CJK 문자당 팩터, 구두점/줄바꿈 가산)
// - 확장: 설정에서 "tiktoken 정밀(CDN)" 켜면 ChatGPT(GPT-4o/o200k) 는 실제 BPE 로 교체.
//   Claude 는 공식 JS 토크나이저가 없어 항상 휴리스틱(±15% 안내).
// 모든 값은 "예상치"이며 실제 모델 토크나이저와 차이가 있을 수 있음.

export const FAMILY_PARAMS = {
  claude: {
    label: "Claude",
    latinCharsPerTok: 4.0, // 영문 ~4자/토큰
    cjkTokPerChar: 1.45, // 한글/한자/가나 문자당 (보수적)
    otherTokPerChar: 0.5, // 구두점·기호
    linesTokPer: 4, // 줄바꿈 4개당 ~1
  },
  chatgpt: {
    label: "ChatGPT",
    latinCharsPerTok: 4.0,
    cjkTokPerChar: 1.2, // o200k 는 한글 초성 합성 대부분 1토큰, 보수적 1.2
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

/** 임베디드 휴리스틱 토큰 추정. */
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

// ---------------------------------------------------------------------------
// 확장: ChatGPT 정밀 계수 (gpt-tokenizer, jsDelivr ESM). 실패 시 null 반환 → 휴리스틱 유지.
// ---------------------------------------------------------------------------
let cdnPromise = null;

export async function loadChatgptPrecision() {
  if (cdnPromise) return cdnPromise;
  cdnPromise = import("https://cdn.jsdelivr.net/npm/gpt-tokenizer@2.4.0/+esm")
    .then((mod) => mod)
    .catch(() => null);
  return cdnPromise;
}

/** (source, optimized) 를 실제 o200k_base 로 계수. CDN 실패 시 null. */
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

/** 대상 LLM 통합 분석: source vs optimized. precise=true 시 ChatGPT 는 실제 BPE 사용. */
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

/** USD/1M 토큰 가격 (설정에서 편집 가능). 입력/출력. */
export const DEFAULT_PRICES = {
  claude: { label: "Claude", in: 3.0, out: 15.0, unit: "$/1M" },
  chatgpt: { label: "ChatGPT", in: 2.5, out: 10.0, unit: "$/1M" },
};

export function costUsd(tokensIn, tokensOut, price) {
  return ((tokensIn / 1e6) * price.in + (tokensOut / 1e6) * price.out).toFixed(4);
}
