/** Locale strings: ko / en / zh */

export const STRINGS = {
  en: {
    brand: "Vibe Quant",
    tagline: "Vibe Quant — the quant committee of an AI quant hedge fund.",
    language: "Language",
    headline: "Web Vibe Quant Python Demo",
    lede:
      "An open-source take on GS Quant — the Vibe Quant website demo. Built for shared execution and verification across a multi-LLM quant committee. Base market data is collected from TOSS Open API and Yahoo Finance. LLMs are spreadsheets for reasoning, not oracles of prediction. The market owes certainty to no one.",
    cta_examples: "Examples",
    cta_columns: "Columns",
    cta_tech: "Tech",
    cta_about: "About",
    cta_community: "Community",
    cta_apis: "GS → VI API map",
    cta_run: "Runner",
    cta_docs: "API docs page",
    examples_title: "Examples",
    examples_sub:
      "Compare NVIDIA · Micron · Sandisk · Broadcom. Click a chip to load runnable Python into the editor.",
    community_title: "Community",
    community_sub:
      "Load a shared sample on the same stage, run it, and score the rubric. Browser-only — never server exec.",
    community_run_score: "Run & score",
    community_score_summary: "Score {passed}/{total}",
    community_loaded: "Community sample",
    community_need_sample: "Load a community sample first.",
    community_check_reproducibility: "Reproducibility",
    community_check_risk_metrics: "Risk metrics",
    community_check_data_source: "Data source",
    community_check_disclosures: "Disclosures",
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
    legend_browser: "browser = web run",
    legend_local: "local = pip",
    legend_planned: "planned = roadmap",
    python_input: "Python input",
    result: "Result",
    error_log: "Error log",
    chart_empty: "show_chart(...) output appears here.",
    run: "Run",
    clear: "Clear",
    copy: "Copy",
    copied: "Copied",
    load_example: "Golden sample",
    code_placeholder: "# Pick an API sample above, or write VI browser Python…",
    hint:
      "Runs in-browser via Pyodide (WASM). Market data: Worker (Yahoo) / mock — never Goldman Sachs. Charts: show_chart(...).",
    status_loading: "Loading Python runtime…",
    status_ready: "Runtime ready",
    status_ready_ms: "Runtime ready ({sec}s)",
    status_running: "Running…",
    status_error: "Runtime failed",
    runtime_limits: "First load can take several seconds. Browser RAM limits large scripts — keep series short.",
    ios_banner:
      "iOS note: Pyodide may fail here. Prefer desktop Chrome/Firefox for the runner.",
    mock_source_warn:
      "Warning: market data is mock. Worker Yahoo/TOSS may have failed or be unconfigured. Check source= in stdout.",
    repo_title: "Repository",
    repo_sub: "Source under VibeQuant/ — Pages demo + vi_quant / vi_browser.",
    disclaimer:
      "Notice: This Quant tool is not investment advice. Do not use it for investing. Advice from a qualified professional must come first.",
    empty_code: "Enter Python code first.",
    example_note: "# Golden committee sample — VI browser API\n",
    llm_title: "LLM prompt input",
    llm_sub:
      "Finance only (US/KR stocks, crypto). DeepSeek answers or builds vi_browser Python to run. 1 request / 30s.",
    llm_model: "Model",
    llm_run: "Run",
    llm_run_busy: "Running…",
    llm_placeholder: "e.g. Compare 22-day momentum for NVDA, MU, SNDK, AVGO and rank them",
    llm_hint:
      "Non-finance prompts are rejected (1 min cooldown). API key stays on the Worker (setup-deepseek.sh) — never in the browser.",
    llm_finance_only:
      "This LLM is used for financial Quant. Please use another service for other questions.",
    llm_finance_cooldown:
      "This LLM is used for financial Quant. Please use another service for other questions.\n(Blocked for 1 minute after a non-finance reject.)",
    llm_empty: "Enter an LLM Quant Prompt first.",
    llm_running: "Calling DeepSeek…",
    llm_running_python: "Running generated Python…",
    llm_done: "Done",
    llm_status_checking: "Checking DeepSeek…",
    llm_status_ok: "DeepSeek: configured",
    llm_status_missing: "DeepSeek: not configured — run setup-deepseek.sh --remote",
    llm_status_no_api: "API base missing",
    llm_status_error: "DeepSeek: health check failed",
  },
  ko: {
    brand: "Vibe Quant",
    tagline: "Vibe Quant - 인공지능 퀀트 헤지펀드의 퀀트 위원회",
    language: "언어",
    headline: "웹버전 Vibe Quant Python Demo",
    lede:
      "GS Quant의 오픈소스 버전으로 Vibe Quant 웹사이트 데모입니다. 이 프로젝트의 목적은 멀티 LLM 퀀트 위원회의 공통 실행·검증을 위한 프로젝트입니다. TOSS Open API와 야후 파이낸스에서 기초 데이터를 수집하고 있습니다. LLMs are spreadsheets for reasoning, not oracles of prediction. The market owes certainty to no one.",
    cta_examples: "Examples",
    cta_columns: "칼럼",
    cta_tech: "기술문서",
    cta_about: "소개",
    cta_community: "Community",
    cta_apis: "GS → VI API 설명",
    cta_run: "실행기",
    cta_docs: "API 문서 페이지",
    examples_title: "Examples",
    examples_sub:
      "NVIDIA · Micron · Sandisk · Broadcom 비교 데모. 클릭하면 실행기에 코드가 로드됩니다.",
    community_title: "Community",
    community_sub:
      "공유 샘플을 같은 스테이지에서 불러와 실행·채점합니다. 브라우저만 실행 (서버 exec 없음).",
    community_run_score: "실행·채점",
    community_score_summary: "점수 {passed}/{total}",
    community_loaded: "커뮤니티 샘플",
    community_need_sample: "먼저 커뮤니티 샘플을 불러오세요.",
    community_check_reproducibility: "재현성",
    community_check_risk_metrics: "리스크 지표",
    community_check_data_source: "데이터 소스",
    community_check_disclosures: "한계 고지",
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
    legend_browser: "browser = 웹 실행",
    legend_local: "local = pip",
    legend_planned: "planned = 예정",
    python_input: "파이썬 입력",
    result: "결과",
    error_log: "Error log",
    chart_empty: "show_chart(...) 결과가 여기에 표시됩니다.",
    run: "실행",
    clear: "Clear",
    copy: "복사",
    copied: "복사됨",
    load_example: "골든 샘플",
    code_placeholder: "# 위 API 샘플을 고르거나 VI browser Python을 입력…",
    hint:
      "Pyodide(WASM)로 브라우저 실행. 시세는 Worker(Yahoo)/mock — Goldman Sachs 아님. 차트: show_chart(...).",
    status_loading: "Python 런타임 로드 중…",
    status_ready: "런타임 준비됨",
    status_ready_ms: "런타임 준비됨 ({sec}초)",
    status_running: "실행 중…",
    status_error: "런타임 실패",
    runtime_limits: "첫 로드는 수 초 걸릴 수 있습니다. 브라우저 RAM 한도로 긴 시리즈는 짧게 유지하세요.",
    ios_banner:
      "iOS 안내: 이 환경에서 Pyodide가 실패할 수 있습니다. 실행기는 데스크톱 Chrome/Firefox를 권장합니다.",
    mock_source_warn:
      "경고: 시세가 mock입니다. Worker Yahoo/TOSS가 실패했거나 미설정일 수 있습니다. stdout의 source= 를 확인하세요.",
    repo_title: "레포지토리",
    repo_sub: "소스: VibeQuant/ — Pages 데모 + vi_quant / vi_browser.",
    disclaimer:
      "주의: 본 Quant는 투자 의견이 아니며 투자에 사용해서는 안 됩니다. 투자 전문가의 조언이 선행되어야 합니다.",
    empty_code: "먼저 Python 코드를 입력하세요.",
    example_note: "# 위원회 골든 샘플 — VI browser API\n",
    llm_title: "LLM 프롬프트 입력",
    llm_sub:
      "금융(미국·한국 주식·크립토)만. DeepSeek가 답하거나 vi_browser 파이썬을 생성해 실행합니다. 30초에 1회.",
    llm_model: "모델",
    llm_run: "실행",
    llm_run_busy: "실행 중…",
    llm_placeholder: "예: NVDA·MU·SNDK·AVGO 22일 모멘텀을 비교하고 랭킹을 알려줘",
    llm_hint:
      "비금융 질문은 거부되며 1분간 쿨다운. API 키는 Worker 시크릿(setup-deepseek.sh) — 브라우저에 없음.",
    llm_finance_only:
      "본 LLM은 금융 Quant를 위해서 사용됩니다. 다른 질문은 다른 서비스를 이용하세요.",
    llm_finance_cooldown:
      "본 LLM은 금융 Quant를 위해서 사용됩니다. 다른 질문은 다른 서비스를 이용하세요.\n(비금융 질문 거부 후 1분간 차단됩니다.)",
    llm_empty: "먼저 LLM Quant Prompt를 입력하세요.",
    llm_running: "DeepSeek 호출 중…",
    llm_running_python: "생성 파이썬 실행 중…",
    llm_done: "완료",
    llm_status_checking: "DeepSeek 상태 확인 중…",
    llm_status_ok: "DeepSeek: 설정됨",
    llm_status_missing: "DeepSeek: 미설정 — setup-deepseek.sh --remote 실행",
    llm_status_no_api: "API base 없음",
    llm_status_error: "DeepSeek: health 확인 실패",
  },
  zh: {
    brand: "Vibe Quant",
    tagline: "Vibe Quant — AI 量化对冲基金的量化委员会",
    language: "语言",
    headline: "网页版 Vibe Quant Python Demo",
    lede:
      "GS Quant 的开源版本，即 Vibe Quant 网站演示。目标是为多 LLM 量化委员会提供共同执行与验证。基础数据来自 TOSS Open API 与 Yahoo Finance。LLMs are spreadsheets for reasoning, not oracles of prediction. The market owes certainty to no one.",
    cta_examples: "Examples",
    cta_columns: "专栏",
    cta_tech: "技术文档",
    cta_about: "关于",
    cta_community: "Community",
    cta_apis: "GS → VI API 说明",
    cta_run: "运行器",
    cta_docs: "API 文档页",
    examples_title: "Examples",
    examples_sub: "比较 NVIDIA · Micron · Sandisk · Broadcom。点击加载可运行的 Python 示例。",
    community_title: "Community",
    community_sub:
      "在同一舞台加载共享样本、运行并按量规打分。仅浏览器执行 — 从不服务器 exec。",
    community_run_score: "运行并评分",
    community_score_summary: "得分 {passed}/{total}",
    community_loaded: "社区样本",
    community_need_sample: "请先加载社区样本。",
    community_check_reproducibility: "可复现性",
    community_check_risk_metrics: "风险指标",
    community_check_data_source: "数据来源",
    community_check_disclosures: "披露",
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
    legend_browser: "browser = 网页运行",
    legend_local: "local = pip",
    legend_planned: "planned = 计划中",
    python_input: "Python 输入",
    result: "结果",
    error_log: "Error log",
    chart_empty: "show_chart(...) 结果会显示在这里。",
    run: "运行",
    clear: "Clear",
    copy: "复制",
    copied: "已复制",
    load_example: "黄金示例",
    code_placeholder: "# 选择上方 API 示例，或编写 VI browser Python…",
    hint:
      "通过 Pyodide（WASM）在浏览器运行。行情：Worker（Yahoo）/mock — 非 Goldman Sachs。图表：show_chart(...)。",
    status_loading: "正在加载 Python 运行时…",
    status_ready: "运行时就绪",
    status_ready_ms: "运行时就绪（{sec}秒）",
    status_running: "运行中…",
    status_error: "运行时失败",
    runtime_limits: "首次加载可能需要数秒。浏览器内存有限，请保持序列较短。",
    ios_banner:
      "iOS 提示：此环境可能无法加载 Pyodide。请优先使用桌面 Chrome/Firefox。",
    mock_source_warn:
      "警告：行情为 mock。Worker Yahoo/TOSS 可能失败或未配置。请检查 stdout 中的 source=。",
    repo_title: "代码仓库",
    repo_sub: "源码位于 VibeQuant/ — Pages 演示 + vi_quant / vi_browser。",
    disclaimer:
      "注意：本工具不构成投资意见，不得用于投资。须先听取合格专业人士建议。",
    empty_code: "请先输入 Python 代码。",
    example_note: "# 委员会黄金示例 — VI browser API\n",
    llm_title: "LLM 提示输入",
    llm_sub:
      "仅限金融（美股/韩股/加密）。DeepSeek 直接回答或生成 vi_browser Python 并执行。每 30 秒 1 次。",
    llm_model: "模型",
    llm_run: "运行",
    llm_run_busy: "运行中…",
    llm_placeholder: "例如：比较 NVDA、MU、SNDK、AVGO 的 22 日动量并排名",
    llm_hint:
      "非金融问题将被拒绝（冷却 1 分钟）。API 密钥仅在 Worker（setup-deepseek.sh），不在浏览器。",
    llm_finance_only: "本 LLM 仅用于金融 Quant。其他问题请使用其他服务。",
    llm_finance_cooldown:
      "本 LLM 仅用于金融 Quant。其他问题请使用其他服务。\n（非金融问题被拒绝后冷却 1 分钟。）",
    llm_empty: "请先输入 LLM Quant Prompt。",
    llm_running: "正在调用 DeepSeek…",
    llm_running_python: "正在运行生成的 Python…",
    llm_done: "完成",
    llm_status_checking: "正在检查 DeepSeek…",
    llm_status_ok: "DeepSeek：已配置",
    llm_status_missing: "DeepSeek：未配置 — 运行 setup-deepseek.sh --remote",
    llm_status_no_api: "缺少 API base",
    llm_status_error: "DeepSeek：健康检查失败",
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
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");
    const value = t(lang, key);
    if (value) el.setAttribute("aria-label", value);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    const value = t(lang, key);
    if (value) el.setAttribute("title", value);
  });
  const mapLink = document.getElementById("repo-mapping-link");
  if (mapLink) mapLink.href = MAPPING_DOC[lang] || MAPPING_DOC.en;
  const select = document.getElementById("lang-select");
  if (select) select.value = lang;
  localStorage.setItem("vq_lang", lang);
}
