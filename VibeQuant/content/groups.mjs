/**
 * Folder / path → content group mapping for columns & tech docs.
 */
export const COLUMN_GROUP_RULES = [
  // Media-Column (전자신문·ZDNet·벤처스퀘어) — path prefix first
  { id: "media-ai", title_ko: "미디어 · AI", title_en: "Media · AI", match: [/^AI\//, /media-column\/ai\//i] },
  { id: "media-crypto", title_ko: "미디어 · 가상자산", title_en: "Media · Crypto", match: [/^Crypto-Stablecoin\//i, /media-column\/crypto/i] },
  { id: "media-security", title_ko: "미디어 · 보안", title_en: "Media · Security", match: [/^Security\//, /media-column\/security/i] },
  { id: "media-blockchain", title_ko: "미디어 · 블록체인", title_en: "Media · Blockchain", match: [/^Blockchain-P2E\//i, /media-column\/blockchain/i] },
  { id: "media-macro", title_ko: "미디어 · 매크로", title_en: "Media · Macro", match: [/^Macro-Policy\//i, /media-column\/macro/i] },
  { id: "media-society", title_ko: "미디어 · 사회·문화", title_en: "Media · Society", match: [/^Society-Culture\//i, /media-column\/society/i] },
  { id: "ai-llm", title_ko: "AI · LLM · 빅테크", title_en: "AI · LLM · Big Tech", match: [/ai_revolution/i, /ai-education/i, /ai-bottleneck/i, /ai bouble/i, /ai_bouble/i, /ai_hacking/i, /ai_trading/i, /deepseek/i, /claude/i, /meta\//i, /oracle/i, /jane street/i, /llm_supply/i, /bigtech/i, /kimi/i, /grok/i] },
  { id: "elon-spacex", title_ko: "Elon · SpaceX", title_en: "Elon · SpaceX", match: [/elon musk/i, /spacex/i] },
  { id: "crypto-web3", title_ko: "크립토 · Web3", title_en: "Crypto · Web3", match: [/bitcoin/i, /btc/i, /ethereum/i, /bnb/i, /crypto/i, /crytohft/i, /defi/i, /web3/i, /strategy\//i, /robinhood/i, /dex memecoin/i, /aws_blockchain/i] },
  { id: "korea-hacking", title_ko: "한국 · 해킹", title_en: "Korea · Hacking", match: [/national-diplomatic/i, /외교원/i, /hacking-incident/i] },
  { id: "korea", title_ko: "한국 · 코리아 디스카운트", title_en: "Korea", match: [/korea/i, /주식시황/i, /msci/i, /starbucks/i, /seoul/i, /kpop/i, /toss /i, /기레기/i, /골드만/i, /cyworld/i] },
  { id: "macro-geo", title_ko: "매크로 · 지정학", title_en: "Macro · Geopolitics", match: [/pax americana/i, /trump/i, /defense/i, /rome/i, /world_bank/i, /us treasury/i, /japan/i, /china /i, /drone/i, /tobacco/i] },
  { id: "quant-strategy", title_ko: "퀀트 · 투자 전략", title_en: "Quant · Strategy", match: [/momentum/i, /special situations/i, /insider/i, /model vs reality/i, /medbridge/i, /semiconductor ai etf/i, /stock_option/i, /money_game/i] },
  { id: "semi-storage", title_ko: "반도체 · 스토리지", title_en: "Semi · Storage", match: [/storage war/i, /marvell/i, /intel/i, /memory/i, /semi/i] },
  { id: "industry", title_ko: "산업 · 소비", title_en: "Industry · Consumer", match: [/uber/i, /netflex/i, /netflix/i, /mokrak/i, /luxury/i, /webtoon/i, /kidult/i, /ford/i, /adobe/i, /voce/i, /brain/i, /bouble/i, /cyber wrecker/i, /518/i, /startup/i, /shelf-life/i] },
];

/** Recommended media columns (relative to 03. Media-Column/) */
export const FEATURED_MEDIA_COLUMN_PATHS = [
  "Security/2026-07-23-",
  "Security/2026-07-22-",
  "AI/2026-02-23-",
  "AI/2026-02-09-",
  "AI/2026-02-02-",
  "Security/2025-12-08-",
  "Crypto-Stablecoin/2025-11-24-",
  "Macro-Policy/2025-11-03-",
  "Crypto-Stablecoin/2025-09-29-",
  "Crypto-Stablecoin/2025-07-14-",
  "Crypto-Stablecoin/2025-06-26-",
  "AI/2025-09-08-",
  "AI/2025-05-15-",
  "Crypto-Stablecoin/2026-01-19-",
];

export const COLUMN_GROUP_FALLBACK = { id: "other", title_ko: "기타", title_en: "Other" };

export const TECH_GROUP_RULES = [
  { id: "cloud-free", title_ko: "클라우드 · Free tier", title_en: "Cloud · Free tier", match: [/cloudflare/i, /cloudeflare/i, /web-analytics/i, /free_hosting/i, /freeemail/i, /oraclecloud/i, /vercel/i, /neon/i, /turso/i, /sqlite/i, /upstash/i, /serverless_redis/i, /paas_railway/i, /aws\//i, /github_cdn/i, /python_saas/i, /\/seo\//i, /seo-ai-readability/i] },
  { id: "llm-agents", title_ko: "LLM · 에이전트", title_en: "LLM · Agents", match: [/llm/i, /claude/i, /grok/i, /minimax/i, /minicpm/i, /bonsai/i, /tencent/i, /local_llm/i, /ollama/i, /qwen/i, /effective_llm/i, /agent-friendly/i, /ai-agent-framework/i, /awesome-llm-apps/i, /awesome-agent/i, /openworker/i, /ai-open-weights/i, /solar-open/i, /solar open/i, /kimi-k3/i, /opencodemcp/i, /opencodex/i, /llm_proxy/i, /mcp/i, /deepwiki/i, /openwiki/i, /google_code_wiki/i, /zcode/i, /headroom/i, /caveman/i, /quivr/i] },
  { id: "quant-data", title_ko: "퀀트 · 데이터", title_en: "Quant · Data", match: [/qlib/i, /gs_quant/i, /timesfm/i, /pyodide/i, /python_pyodide/i, /robinhood/i, /\/toss\//i, /toss-openapi/i, /semiconductor-supercycle/i] },
  { id: "security", title_ko: "보안", title_en: "Security", match: [/security/i, /claw/i, /secret scanning/i] },
  { id: "ui-tools", title_ko: "UI · 개발도구", title_en: "UI · Dev tools", match: [/niceui/i, /nicegui/i, /ui_opensource/i, /astryx/i, /bigfive/i, /orca/i, /loop/i, /china-physical/i] },
  { id: "firebase-alt", title_ko: "BaaS · DB", title_en: "BaaS · DB", match: [/supabase/i, /opensource_firebase/i] },
];

export const TECH_GROUP_FALLBACK = { id: "other", title_ko: "기타 기술문서", title_en: "Other tech" };

/** Essay folders (gameworkerkim/essays) */
export const ESSAY_GROUP_RULES = [
  { id: "art", title_ko: "Art", title_en: "Art", match: [/^art\//i] },
  { id: "book-review", title_ko: "Book Review", title_en: "Book Review", match: [/^book-review\//i] },
  { id: "culture-taste", title_ko: "Culture & Taste", title_en: "Culture & Taste", match: [/^culture-taste\//i] },
];

export const ESSAY_GROUP_FALLBACK = { id: "other", title_ko: "기타 에세이", title_en: "Other essays" };

/** Paths (substring) that should appear in Recommended — order = display order */
export const FEATURED_COLUMN_PATHS = [
  "AI-Bottleneck/AI-Bottleneck.md",
  "주식시황/Column-Kioxia-Q1FY2026.md",
  "AI_Revolution/AI-Between-Coolness-and-Passion.md",
  "AI_Hacking/Column-Project-Perception-20260729.md",
  "Startup/Shelf-Life-of-Innovation.md",
  "Cyworld/The-Pros-and-Cons-of-VC-Investment-as-Seen-Through-the-Cyworld-RCPS-Contract.md",

  "DeepSeek V4/LiangWenfeng-DeepSeek-AGI.md",
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

/** TechDoc recommended — order = display order */
export const FEATURED_TECH_PATHS = [
  "KIMI-K3/KIMI-K3-Cloud-Install-Guide.md",
  "AI-Open-Weights-Model/KIMI-K3-GettingStart.md",
  "AI-Open-Weights-Model/DeepSeek-GettingStart.md",
  "AI-Open-Weights-Model/Solar-Open2-Getting-Start.md",
  "Awesome-Agent/readme.md",
  "Awesome-Agent/Openworker-Review.md",
  "Awesome-Agent/Goose-Review.md",
  "Awesome-Agent/OpenHands-Review.md",
  "Toss/Toss-OpenAPI-IP-Whitelist-Indie-Caution_KR.md",
  "SEO/SEO-AI-Readability-Guide.md",
  "CloudFlare/Cloudflare_무료티어_사용법.md",
  "CloudeFlare-Web-Analytics/CloudeFlare-Web-Analytics-Guide.md",
  "LLM_Proxy/Opencodex.md",
  "AI-Agent-Framework/AI-Agent-Framework.md",
  "Awesome-LLM-Apps/Awesome-LLM-Apps-review.md",
  "agent-friendly-website-guide/agent-friendly-website-guide.ko.md",
  "MCP/MCP-2026-07-28-Security-Migration-Guide.md",
  "effective_LLM/AI coding workflow claude code cursor chatgpt.md",
  "LLM_Security/Secret scanning llm harness prompt.md",
  "LLM_Security/Claude-Security-Plugin-Guide_KR.md",
  "CloudFlare/Cloudflare free tier guide.md",
  "Python_Pyodide/Pyodide.md",
];

/** essays recommended — order = display order */
export const FEATURED_ESSAY_PATHS = [
  "culture-taste/05-walmart-paradox-chinese-ai.md",
  "culture-taste/02-ai-writes-code-humans-ship-it.md",
  "book-review/03-black-swan-black-scholes.md",
  "art/01-art-collecting-when-to-start.md",
  "culture-taste/03-end-of-opensource-age.md",
  "culture-taste/04-jimenshi-and-me.md",
  "book-review/02-foundation-psychohistory-ai.md",
  "book-review/01-eichmann-banality-of-evil.md",
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
