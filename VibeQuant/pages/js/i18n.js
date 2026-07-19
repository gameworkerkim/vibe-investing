/** Locale strings: ko / en / zh */

export const STRINGS = {
  en: {
    brand: "Vibe Quant",
    tagline: "Open-source GS Quant–compatible harness for multi-LLM quant committees.",
    language: "Language",
    headline: "Web Vibe Quant Python Demo",
    lede:
      "An open-source take on GS Quant — the Vibe Quant website demo. Built for shared execution and verification across a multi-LLM quant committee. Base market data is collected from TOSS Open API and Yahoo Finance. LLMs are spreadsheets for reasoning, not oracles of prediction. The market owes certainty to no one.",
    cta_apis: "GS → VI API map",
    cta_run: "Runner",
    cta_docs: "API docs page",
    api_title: "GS Quant ↔ VI Quant API guide",
    api_sub:
      "Rule: gs_quant → vi_quant, Gs* → Vi*. browser = runs here. Click Load sample to fill the editor.",
    col_gs: "GS Quant",
    col_vi: "VI Quant",
    col_status: "Status",
    col_desc: "Description",
    load_sample: "Load sample",
    more_apis: "Open full API docs page →",
    repo_mapping: "Repo mapping table",
    sample_loaded: "Sample loaded",
    status_browser: "browser",
    status_local: "local",
    status_planned: "planned",
    python_input: "Python input",
    result: "Result",
    run: "Run",
    load_example: "Golden sample",
    code_placeholder: "# Pick an API sample above, or write VI browser Python…",
    hint:
      "Runs in-browser via Pyodide (WASM). Market calls use VibeQuant Worker / mock — never Goldman Sachs.",
    status_loading: "Loading Python runtime…",
    status_ready: "Runtime ready",
    status_running: "Running…",
    status_error: "Runtime failed",
    repo_title: "Repository",
    repo_sub: "Source under VibeQuant/ — Pages demo + vi_quant / vi_browser.",
    disclaimer:
      "Notice: This Quant tool is not investment advice. Do not use it for investing. Advice from a qualified professional must come first.",
    empty_code: "Enter Python code first.",
    example_note: "# Golden committee sample — VI browser API\n",
  },
  ko: {
    brand: "Vibe Quant",
    tagline: "멀티 LLM 퀀트 위원회를 위한 GS Quant 호환 오픈소스 하네스.",
    language: "언어",
    headline: "웹버전 Vibe Quant Python Demo",
    lede:
      "GS Quant의 오픈소스 버전으로 Vibe Quant 웹사이트 데모입니다. 이 프로젝트의 목적은 멀티 LLM 퀀트 위원회의 공통 실행·검증을 위한 프로젝트입니다. TOSS Open API와 야후 파이낸스에서 기초 데이터를 수집하고 있습니다. LLMs are spreadsheets for reasoning, not oracles of prediction. The market owes certainty to no one.",
    cta_apis: "GS → VI API 설명",
    cta_run: "실행기",
    cta_docs: "API 문서 페이지",
    api_title: "GS Quant ↔ VI Quant API 설명",
    api_sub:
      "규칙: gs_quant → vi_quant, Gs* → Vi*. browser는 이 페이지에서 실행. 샘플 로드로 에디터에 코드를 넣습니다.",
    col_gs: "GS Quant",
    col_vi: "VI Quant",
    col_status: "상태",
    col_desc: "설명",
    load_sample: "샘플 로드",
    more_apis: "전체 API 설명 페이지 열기 →",
    repo_mapping: "레포 매핑표",
    sample_loaded: "샘플 로드됨",
    status_browser: "browser",
    status_local: "local",
    status_planned: "planned",
    python_input: "파이썬 입력",
    result: "결과",
    run: "실행",
    load_example: "골든 샘플",
    code_placeholder: "# 위 API 샘플을 고르거나 VI browser Python을 입력…",
    hint:
      "Pyodide(WASM)로 브라우저에서 실행. 시세는 VibeQuant Worker/mock — Goldman Sachs 아님.",
    status_loading: "Python 런타임 로드 중…",
    status_ready: "런타임 준비됨",
    status_running: "실행 중…",
    status_error: "런타임 실패",
    repo_title: "레포지토리",
    repo_sub: "소스: VibeQuant/ — Pages 데모 + vi_quant / vi_browser.",
    disclaimer:
      "주의: 본 Quant는 투자 의견이 아니며 투자에 사용해서는 안 됩니다. 투자 전문가의 조언이 선행되어야 합니다.",
    empty_code: "먼저 Python 코드를 입력하세요.",
    example_note: "# 위원회 골든 샘플 — VI browser API\n",
  },
  zh: {
    brand: "Vibe Quant",
    tagline: "面向多 LLM 量化委员会的 GS Quant 兼容开源工具。",
    language: "语言",
    headline: "网页版 Vibe Quant Python Demo",
    lede:
      "GS Quant 的开源版本，即 Vibe Quant 网站演示。目标是为多 LLM 量化委员会提供共同执行与验证。基础数据来自 TOSS Open API 与 Yahoo Finance。LLMs are spreadsheets for reasoning, not oracles of prediction. The market owes certainty to no one.",
    cta_apis: "GS → VI API 说明",
    cta_run: "运行器",
    cta_docs: "API 文档页",
    api_title: "GS Quant ↔ VI Quant API 说明",
    api_sub:
      "规则：gs_quant → vi_quant，Gs* → Vi*。browser 可在本页运行。点击加载示例填入编辑器。",
    col_gs: "GS Quant",
    col_vi: "VI Quant",
    col_status: "状态",
    col_desc: "说明",
    load_sample: "加载示例",
    more_apis: "打开完整 API 文档页 →",
    repo_mapping: "仓库映射表",
    sample_loaded: "已加载示例",
    status_browser: "browser",
    status_local: "local",
    status_planned: "planned",
    python_input: "Python 输入",
    result: "结果",
    run: "运行",
    load_example: "黄金示例",
    code_placeholder: "# 选择上方 API 示例，或编写 VI browser Python…",
    hint:
      "通过 Pyodide（WASM）在浏览器运行。行情走 VibeQuant Worker/mock — 非 Goldman Sachs。",
    status_loading: "正在加载 Python 运行时…",
    status_ready: "运行时就绪",
    status_running: "运行中…",
    status_error: "运行时失败",
    repo_title: "代码仓库",
    repo_sub: "源码位于 VibeQuant/ — Pages 演示 + vi_quant / vi_browser。",
    disclaimer:
      "注意：本工具不构成投资意见，不得用于投资。须先听取合格专业人士建议。",
    empty_code: "请先输入 Python 代码。",
    example_note: "# 委员会黄金示例 — VI browser API\n",
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
  return STRINGS[lang]?.[key] ?? STRINGS.en?.[key] ?? null;
}

const MAPPING_DOC = {
  ko: "https://github.com/gameworkerkim/vibe-investing/blob/main/VibeQuant/docs/API_MAPPING_KR.md",
  en: "https://github.com/gameworkerkim/vibe-investing/blob/main/VibeQuant/docs/API_MAPPING.md",
  zh: "https://github.com/gameworkerkim/vibe-investing/blob/main/VibeQuant/docs/API_MAPPING.md",
};

export function applyI18n(lang) {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = t(lang, key);
    // Keep HTML fallback text if translation missing — never show raw keys
    if (value) el.textContent = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const value = t(lang, key);
    if (value) el.setAttribute("placeholder", value);
  });
  const mapLink = document.getElementById("repo-mapping-link");
  if (mapLink) mapLink.href = MAPPING_DOC[lang] || MAPPING_DOC.en;
  const select = document.getElementById("lang-select");
  if (select) select.value = lang;
  localStorage.setItem("vq_lang", lang);
}
