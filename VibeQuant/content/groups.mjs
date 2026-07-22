/**
 * Folder / path → content group mapping for columns & tech docs.
 */
export const COLUMN_GROUP_RULES = [
  { id: "ai-llm", title_ko: "AI · LLM · 빅테크", title_en: "AI · LLM · Big Tech", match: [/ai_revolution/i, /ai bouble/i, /ai_bouble/i, /ai_hacking/i, /ai_trading/i, /deepseek/i, /claude/i, /meta\//i, /oracle/i, /jane street/i, /llm_supply/i, /bigtech/i, /kimi/i, /grok/i] },
  { id: "elon-spacex", title_ko: "Elon · SpaceX", title_en: "Elon · SpaceX", match: [/elon musk/i, /spacex/i] },
  { id: "crypto-web3", title_ko: "크립토 · Web3", title_en: "Crypto · Web3", match: [/bitcoin/i, /btc/i, /ethereum/i, /bnb/i, /crypto/i, /crytohft/i, /defi/i, /web3/i, /strategy\//i, /robinhood/i, /dex memecoin/i, /aws_blockchain/i] },
  { id: "korea-hacking", title_ko: "한국 · 해킹", title_en: "Korea · Hacking", match: [/national-diplomatic/i, /외교원/i, /hacking-incident/i] },
  { id: "korea", title_ko: "한국 · 코리아 디스카운트", title_en: "Korea", match: [/korea/i, /주식시황/i, /msci/i, /starbucks/i, /seoul/i, /kpop/i, /toss /i, /기레기/i, /골드만/i] },
  { id: "macro-geo", title_ko: "매크로 · 지정학", title_en: "Macro · Geopolitics", match: [/pax americana/i, /trump/i, /defense/i, /rome/i, /world_bank/i, /us treasury/i, /japan/i, /china /i, /drone/i, /tobacco/i] },
  { id: "quant-strategy", title_ko: "퀀트 · 투자 전략", title_en: "Quant · Strategy", match: [/momentum/i, /special situations/i, /insider/i, /model vs reality/i, /medbridge/i, /semiconductor ai etf/i, /stock_option/i, /money_game/i] },
  { id: "semi-storage", title_ko: "반도체 · 스토리지", title_en: "Semi · Storage", match: [/storage war/i, /marvell/i, /intel/i, /memory/i, /semi/i] },
  { id: "industry", title_ko: "산업 · 소비", title_en: "Industry · Consumer", match: [/uber/i, /netflex/i, /netflix/i, /mokrak/i, /luxury/i, /webtoon/i, /kidult/i, /ford/i, /adobe/i, /voce/i, /brain/i, /bouble/i, /cyber wrecker/i, /518/i] },
];

export const COLUMN_GROUP_FALLBACK = { id: "other", title_ko: "기타", title_en: "Other" };

export const TECH_GROUP_RULES = [
  { id: "cloud-free", title_ko: "클라우드 · Free tier", title_en: "Cloud · Free tier", match: [/cloudflare/i, /free_hosting/i, /freeemail/i, /oraclecloud/i, /vercel/i, /neon/i, /turso/i, /sqlite/i, /upstash/i, /serverless_redis/i, /paas_railway/i, /aws\//i, /github_cdn/i, /python_saas/i] },
  { id: "llm-agents", title_ko: "LLM · 에이전트", title_en: "LLM · Agents", match: [/llm/i, /claude/i, /grok/i, /minimax/i, /minicpm/i, /bonsai/i, /tencent/i, /local_llm/i, /ollama/i, /qwen/i, /effective_llm/i, /agent-friendly/i, /opencodemcp/i, /mcp/i, /deepwiki/i, /openwiki/i, /google_code_wiki/i, /zcode/i, /headroom/i, /caveman/i, /quivr/i] },
  { id: "quant-data", title_ko: "퀀트 · 데이터", title_en: "Quant · Data", match: [/qlib/i, /gs_quant/i, /timesfm/i, /pyodide/i, /python_pyodide/i, /robinhood/i] },
  { id: "security", title_ko: "보안", title_en: "Security", match: [/security/i, /claw/i, /secret scanning/i] },
  { id: "ui-tools", title_ko: "UI · 개발도구", title_en: "UI · Dev tools", match: [/niceui/i, /nicegui/i, /ui_opensource/i, /astryx/i, /bigfive/i, /orca/i, /loop/i, /china-physical/i] },
  { id: "firebase-alt", title_ko: "BaaS · DB", title_en: "BaaS · DB", match: [/supabase/i, /opensource_firebase/i] },
];

export const TECH_GROUP_FALLBACK = { id: "other", title_ko: "기타 기술문서", title_en: "Other tech" };

/** Paths (substring) that should appear in Recommended — order = display order */
export const FEATURED_COLUMN_PATHS = [
  "AI_Hacking/Huggingface-Breach-v2.md",
  "AI_Revolution/China_LLM_Compare.md",
  "National-Diplomatic-Academy-Hacking-Incident/National-Diplomatic-Academy-Hacking-Incident.md",
  "Elon Musk/SpaceX IPO.md",
  "Korea Discount/Korean chaebol column.MD",
  "Strategy/Strategy_danse_macabre_column.md",
  "AI_Trading/AI_Trading.md",
  "DeepSeek V4/DeepSeek V4 preview report.md",
  "MSCI/MSCIMSCI",
  "Storage War/Storage wars ai infrastructure column.md",
  "Meta/Meta q1 2026 earnings analysis.md",
  "BitCoin/BTC-20260720-Decline-Analysis.md",
  "Jane Street/제인스트리트",
  "주식시황/Quant-Review-AI-Semis",
  "Pax Americana/팍스 아메리카나",
];

export function resolveGroup(relPath, rules, fallback) {
  const p = relPath.replace(/\\/g, "/");
  for (const rule of rules) {
    if (rule.match.some((re) => re.test(p))) return { id: rule.id, title_ko: rule.title_ko, title_en: rule.title_en };
  }
  return { ...fallback };
}

export function groupsFromRules(rules, fallback) {
  const seen = new Map();
  for (const r of rules) {
    if (!seen.has(r.id)) seen.set(r.id, { id: r.id, title_ko: r.title_ko, title_en: r.title_en });
  }
  if (!seen.has(fallback.id)) seen.set(fallback.id, { ...fallback });
  return [...seen.values()];
}
