/**
 * CTI report grouping + featured list (CYBER-THREAT-INTELLIGENCE-REPORT).
 */
export const CTI_GROUP_RULES = [
  { id: "weekly", title_ko: "주간 브리프", title_en: "Weekly", match: [/weekly/i, /krweekly/i] },
  { id: "dprk", title_ko: "북한 · Lazarus · Kimsuky", title_en: "DPRK", match: [/lazarus/i, /kimsuky/i, /scarcruft/i, /dprk/i, /pebbledash/i, /taikobridge/i, /modoo/i, /newjistock/i, /bank-hackers/i, /north.?korea/i] },
  { id: "ai-supply", title_ko: "AI · LLM 공급망", title_en: "AI Supply Chain", match: [/mcp/i, /vibe/i, /claude/i, /chatgpt/i, /aicyber/i, /aisupply/i, /ai-zeroday/i, /mythos/i, /greyvibe/i, /swiftvibe/i, /irangenai/i] },
  { id: "korea-breach", title_ko: "한국 침해 · 국내", title_en: "Korea Breaches", match: [/kakao/i, /tving/i, /lineyahoo/i, /fastcampus/i, /odido/i, /iitp/i, /jsdf/i, /breac/i, /cu_breach/i, /github_kr/i, /copyfail/i] },
  { id: "apt-global", title_ko: "APT · 글로벌 위협", title_en: "APT Global", match: [/scatteredspider/i, /dualthreat/i, /unc6508/i, /redcap/i, /ctrl/i, /yellowkey/i, /ironworm/i, /glassworm/i, /jinx/i, /bonzo/i] },
  { id: "vuln-patch", title_ko: "취약점 · 패치", title_en: "Vuln · Patch", match: [/websphere/i, /exchange/i, /drupal/i, /cpanel/i, /gogs/i, /gitea/i, /netscaler/i, /android/i, /phpbb/i, /marimo/i, /fast16/i, /patchtuesday/i, /msft/i] },
  { id: "crypto-web3", title_ko: "크립토 · Web3", title_en: "Crypto · Web3", match: [/litecoin/i, /kelpdao/i, /ostium/i, /eviltokens/i, /aicryptojack/i, /crypto/i, /sanctions/i] },
  { id: "cloud-saas", title_ko: "클라우드 · SaaS", title_en: "Cloud · SaaS", match: [/vercel/i, /github/i, /coruna/i, /chatgphish/i, /qshing/i] },
  { id: "tool-review", title_ko: "도구 · 리뷰", title_en: "Tool Review", match: [/flowsint/i, /tool-review/i] },
];

export const CTI_GROUP_FALLBACK = { id: "other", title_ko: "기타 CTI", title_en: "Other CTI" };

/** Featured CTI reports (basename match) — order = display order */
export const FEATURED_CTI_PATHS = [
  "CTI-2026-0726-DPRK-BANK-HACKERS_KR.md",
  "CTI-2026-0724-WEEKLY_KR.md",
  "Awesome-Aacking-Analysis.md",
  "CTI-2026-0718-WEEKLY_KR.md",
  "CTI-2026-0708-KAKAO_KR.md",
  "CTI-2026-0704-SCATTEREDSPIDER_KR.md",
  "CTI-2026-0628-DPRK-AI_KR.md",
  "CTI-2026-0510-LAZARUS-GITHOOKS_KR.md",
  "CTI-2026-0422-MCP_KR.md",
];
