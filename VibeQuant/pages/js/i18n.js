/** Locale strings: ko / en / zh. Browser language picks default. */

export const STRINGS = {
  en: {
    brand: "Vibe Quant",
    tagline:
      "Open-source GS Quant–compatible API demo for multi-LLM quant committees.",
    language: "Language",
    headline: "Browser GS / VI API demo site",
    lede:
      "An open-source counterpart to GS Quant: the shared execution and verification harness for a multi-LLM quant committee. Product competition is not the platform — it is reproducible committee outputs and insights for LLM-extended quant trading.",
    python_input: "Python input",
    result: "Result",
    run: "Run",
    load_example: "Load example",
    code_placeholder: "# Write VI / browser quant Python here…",
    hint:
      "Runs in your browser via Pyodide (WASM). Market data calls go to the VibeQuant API — not to Goldman Sachs.",
    status_loading: "Loading Python runtime…",
    status_ready: "Runtime ready",
    status_running: "Running…",
    status_error: "Runtime failed to load",
    repo_title: "Repository",
    repo_sub:
      "VibeQuant lives under VibeQuant/ — Cloudflare Pages demo + vi_quant / vi_browser.",
    disclaimer:
      "Notice: This Quant tool is not investment advice. It must not be used for investing. Advice from a qualified investment professional must come first.",
    empty_code: "Enter Python code first.",
    example_note: "# Example — mock VI browser API (no credentials)\n",
  },
  ko: {
    brand: "Vibe Quant",
    tagline:
      "멀티 LLM 퀀트 위원회를 위한 GS Quant 호환 오픈소스 API 데모입니다.",
    language: "언어",
    headline: "브라우저 GS / VI API 데모 사이트",
    lede:
      "GS Quant의 오픈소스 대응판으로, 멀티 LLM 퀀트 위원회의 공통 실행·검증 하네스 = 브라우저 GS/VI API 데모 사이트입니다. 제품 경쟁은 플랫폼이 아니라 위원회 산출물의 재현과, LLM으로 확장하는 퀀트 트레이딩 인사이트를 위한 사이트입니다.",
    python_input: "파이썬 입력",
    result: "결과",
    run: "실행",
    load_example: "예제 불러오기",
    code_placeholder: "# 여기에 VI / 브라우저 퀀트 Python을 입력하세요…",
    hint:
      "브라우저에서 Pyodide(WASM)로 실행됩니다. 시세 호출은 VibeQuant API로 가며 Goldman Sachs로 가지 않습니다.",
    status_loading: "Python 런타임 로드 중…",
    status_ready: "런타임 준비됨",
    status_running: "실행 중…",
    status_error: "런타임 로드 실패",
    repo_title: "레포지토리",
    repo_sub:
      "VibeQuant는 VibeQuant/ 아래에 있습니다 — Cloudflare Pages 데모 + vi_quant / vi_browser.",
    disclaimer:
      "주의: 본 Quant는 투자 의견이 아니며 투자를 위해 사용해서는 안 됩니다. 투자 전문가의 조언이 선행되어야 합니다.",
    empty_code: "먼저 Python 코드를 입력하세요.",
    example_note: "# 예제 — mock VI 브라우저 API (자격증명 불필요)\n",
  },
  zh: {
    brand: "Vibe Quant",
    tagline: "面向多 LLM 量化委员会的 GS Quant 兼容开源 API 演示。",
    language: "语言",
    headline: "浏览器 GS / VI API 演示站点",
    lede:
      "作为 GS Quant 的开源对应版本，这是多 LLM 量化委员会的共同执行与验证工具 = 浏览器端 GS/VI API 演示站。产品竞争不在平台本身，而在委员会产出的可复现性，以及用 LLM 扩展量化交易洞察。",
    python_input: "Python 输入",
    result: "结果",
    run: "运行",
    load_example: "加载示例",
    code_placeholder: "# 在此输入 VI / 浏览器端量化 Python…",
    hint:
      "通过 Pyodide（WASM）在浏览器中运行。行情请求指向 VibeQuant API，不会访问 Goldman Sachs。",
    status_loading: "正在加载 Python 运行时…",
    status_ready: "运行时已就绪",
    status_running: "运行中…",
    status_error: "运行时加载失败",
    repo_title: "代码仓库",
    repo_sub:
      "VibeQuant 位于 VibeQuant/ — Cloudflare Pages 演示 + vi_quant / vi_browser。",
    disclaimer:
      "注意：本 Quant 工具不构成投资意见，不得用于投资决策。使用前须先听取合格投资专业人士的建议。",
    empty_code: "请先输入 Python 代码。",
    example_note: "# 示例 — mock VI 浏览器 API（无需凭证）\n",
  },
};

export function detectLang() {
  const stored = localStorage.getItem("vq_lang");
  if (stored && STRINGS[stored]) return stored;

  const nav = (navigator.language || "en").toLowerCase();
  if (nav.startsWith("ko")) return "ko";
  if (nav.startsWith("zh")) return "zh";
  return "en";
}

export function t(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
}

export function applyI18n(lang) {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = t(lang, key);
    if (value != null) el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const value = t(lang, key);
    if (value != null) el.setAttribute("placeholder", value);
  });

  const select = document.getElementById("lang-select");
  if (select) select.value = lang;

  localStorage.setItem("vq_lang", lang);
}
