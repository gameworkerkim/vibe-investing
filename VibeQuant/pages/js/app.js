import { applyI18n, detectLang, t } from "./i18n.js?v=16";
import { API_CATALOG, noteFor } from "./api-catalog.js?v=16";
import { DEMO_EXAMPLES, exampleTitle } from "./examples.js?v=16";
import { EXAMPLE_CODE, getLastLoadMs, loadPyodideRuntime, runPython } from "./pyodide-runner.js?v=16";
import { clearChart, renderChartFromWindow } from "./chart-view.js?v=16";
import { detectRuntimeSupport, iosAdvice } from "./runtime-support.js?v=16";
import { requestQuantPrompt } from "./llm-prompt.js?v=16";

const codeEl = document.getElementById("code");
const outputEl = document.getElementById("output");
const statusEl = document.getElementById("runtime-status");
const runBtn = document.getElementById("btn-run");
const exampleBtn = document.getElementById("btn-example");
const clearBtn = document.getElementById("btn-clear");
const llmBtn = document.getElementById("btn-llm");
const llmPromptEl = document.getElementById("llm-prompt");
const llmModelEl = document.getElementById("llm-model");
const langSelect = document.getElementById("lang-select");
const apiTbody = document.getElementById("api-tbody");
const sampleLabel = document.getElementById("sample-label");
const iosBanner = document.getElementById("ios-banner");
const dataSourceBanner = document.getElementById("data-source-banner");
const examplesChips = document.getElementById("examples-chips");

let lang = detectLang();
let activeSampleId = "ex-multifactor";
let activeExampleId = "ex-multifactor";
const support = detectRuntimeSupport();

function updateMockBanner(text) {
  if (!dataSourceBanner) return;
  const mock = /source\s*=\s*mock/i.test(text || "");
  dataSourceBanner.hidden = !mock;
}

function tx(key, fallback) {
  return t(lang, key) || fallback || key;
}

function setStatus(kind) {
  statusEl.classList.remove("ready", "error", "running");
  if (kind === "ready") {
    statusEl.classList.add("ready");
    const ms = getLastLoadMs();
    if (ms != null) {
      const tpl = tx("status_ready_ms", "Runtime ready ({sec}s)");
      statusEl.textContent = tpl.replace("{sec}", (ms / 1000).toFixed(1));
    } else {
      statusEl.textContent = tx("status_ready", "Runtime ready");
    }
  } else if (kind === "error") {
    statusEl.classList.add("error");
    statusEl.textContent = tx("status_error", "Runtime failed");
  } else if (kind === "running") {
    statusEl.classList.add("running");
    statusEl.textContent = tx("status_running", "Running…");
  } else {
    statusEl.textContent = tx("status_loading", "Loading…");
  }
}

function setActiveExampleChip(id) {
  activeExampleId = id || "";
  examplesChips?.querySelectorAll(".example-chip").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.id === activeExampleId);
  });
}

function loadDemoExample(ex, { scroll = false } = {}) {
  activeSampleId = ex.id;
  setActiveExampleChip(ex.id);
  codeEl.value = ex.sample.trim() + "\n";
  if (sampleLabel) {
    sampleLabel.textContent = `${tx("sample_loaded", "Sample")}: ${exampleTitle(ex, lang)}`;
  }
  document.querySelectorAll(".api-table tbody tr").forEach((row) => row.classList.remove("is-active"));
  if (scroll) {
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  codeEl.focus();
}

function loadSample(item, { scroll = false } = {}) {
  activeSampleId = item.id;
  setActiveExampleChip("");
  codeEl.value = item.sample.trim() + "\n";
  if (sampleLabel) {
    sampleLabel.textContent = `${tx("sample_loaded", "Sample")}: ${item.vi}`;
  }
  document.querySelectorAll(".api-table tbody tr").forEach((row) => {
    row.classList.toggle("is-active", row.dataset.id === item.id);
  });
  if (scroll) {
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  codeEl.focus();
}

function renderExamples() {
  if (!examplesChips) return;
  examplesChips.innerHTML = "";
  for (const ex of DEMO_EXAMPLES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "example-chip";
    btn.dataset.id = ex.id;
    btn.setAttribute("role", "listitem");
    if (ex.id === activeExampleId) btn.classList.add("is-active");
    btn.innerHTML = `<span class="check" aria-hidden="true">✓</span>${exampleTitle(ex, lang)}`;
    btn.addEventListener("click", () => loadDemoExample(ex, { scroll: true }));
    examplesChips.append(btn);
  }
}

function renderApiTable() {
  if (!apiTbody) return;
  apiTbody.innerHTML = "";
  for (const item of API_CATALOG) {
    const tr = document.createElement("tr");
    tr.dataset.id = item.id;
    if (item.id === activeSampleId) tr.classList.add("is-active");

    const tdGs = document.createElement("td");
    const codeGs = document.createElement("code");
    codeGs.textContent = item.gs;
    tdGs.append(codeGs);

    const tdVi = document.createElement("td");
    const codeVi = document.createElement("code");
    codeVi.textContent = item.vi;
    tdVi.append(codeVi);

    const tdSt = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = `badge ${item.status}`;
    badge.textContent = tx(`status_${item.status}`, item.status);
    badge.title = item.status;
    tdSt.append(badge);

    const tdNote = document.createElement("td");
    tdNote.textContent = `${item.module} — ${noteFor(item, lang)}`;

    const tdAct = document.createElement("td");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn ghost tiny";
    btn.textContent = tx("load_sample", "Load sample");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      loadSample(item, { scroll: true });
    });
    tdAct.append(btn);

    tr.append(tdGs, tdVi, tdSt, tdNote, tdAct);
    tr.addEventListener("click", () => loadSample(item, { scroll: true }));
    apiTbody.append(tr);
  }
}

function refreshUi() {
  applyI18n(lang);
  renderExamples();
  renderApiTable();
  if (iosBanner) {
    iosBanner.hidden = !support.isIOS;
  }
  if (dataSourceBanner && !dataSourceBanner.hidden) {
    const v = t(lang, "mock_source_warn");
    if (v) dataSourceBanner.textContent = v;
  }
  if (statusEl.classList.contains("ready")) setStatus("ready");
  else if (statusEl.classList.contains("error")) setStatus("error");
  else if (statusEl.classList.contains("running")) setStatus("running");
  else setStatus("loading");
}

function showRuntimeFailure(err) {
  const parts = [String(err)];
  if (support.isIOS || !support.hasWasm) {
    parts.push("", iosAdvice(lang));
  }
  outputEl.textContent = parts.join("\n");
  outputEl.classList.add("is-error");
  setStatus("error");
  if (runBtn) runBtn.disabled = true;
}

langSelect?.addEventListener("change", () => {
  lang = langSelect.value;
  refreshUi();
});

exampleBtn?.addEventListener("click", () => {
  const golden = DEMO_EXAMPLES.find((x) => x.id === "ex-multifactor") || DEMO_EXAMPLES[0];
  if (golden) loadDemoExample(golden, { scroll: true });
});

clearBtn?.addEventListener("click", () => {
  codeEl.value = "";
  if (sampleLabel) sampleLabel.textContent = "";
  outputEl.textContent = "";
  outputEl.classList.remove("is-error");
  clearChart();
  updateMockBanner("");
  activeSampleId = "";
  setActiveExampleChip("");
  document.querySelectorAll(".api-table tbody tr").forEach((row) => row.classList.remove("is-active"));
  codeEl.focus();
});

function setBusy(busy) {
  runBtn && (runBtn.disabled = busy);
  exampleBtn && (exampleBtn.disabled = busy);
  clearBtn && (clearBtn.disabled = busy);
  llmBtn && (llmBtn.disabled = busy);
}

runBtn?.addEventListener("click", async () => {
  const code = codeEl.value.trim();
  if (!code) {
    outputEl.textContent = tx("empty_code", "Enter Python code first.");
    outputEl.classList.add("is-error");
    clearChart();
    return;
  }

  setBusy(true);
  setStatus("running");
  outputEl.classList.remove("is-error");
  outputEl.textContent = "";
  clearChart();

  try {
    const { ok, text } = await runPython(code);
    outputEl.textContent = text;
    outputEl.classList.toggle("is-error", !ok);
    updateMockBanner(text);
    if (ok) await renderChartFromWindow();
    setStatus("ready");
  } catch (err) {
    showRuntimeFailure(err);
    clearChart();
    updateMockBanner("");
  } finally {
    setBusy(false);
  }
});

llmBtn?.addEventListener("click", async () => {
  const prompt = (llmPromptEl?.value || "").trim();
  if (!prompt) {
    outputEl.textContent = tx("llm_empty", "Enter an LLM Quant Prompt first.");
    outputEl.classList.add("is-error");
    clearChart();
    return;
  }

  setBusy(true);
  setStatus("running");
  outputEl.classList.remove("is-error");
  outputEl.textContent = tx("llm_running", "Calling DeepSeek…");
  clearChart();

  try {
    const model = llmModelEl?.value === "flash" ? "flash" : "pro";
    const res = await requestQuantPrompt({ prompt, model });
    if (!res.ok) {
      outputEl.textContent = `[${res.error}] ${res.message}${
        res.retryAfter ? `\nretryAfter=${res.retryAfter}s` : ""
      }`;
      outputEl.classList.add("is-error");
      setStatus("ready");
      return;
    }

    const parts = [
      `=== LLM Quant (${res.model}, mode=${res.mode}) ===`,
      res.answer || "",
    ];

    if (res.python) {
      codeEl.value = res.python.trim() + "\n";
      if (sampleLabel) {
        sampleLabel.textContent = `${tx("sample_loaded", "Sample")}: LLM → vi_browser`;
      }
      parts.push("", "=== Generated Python (editor updated) ===", res.python.trim(), "", "=== Pyodide run ===");
      const { ok, text } = await runPython(res.python);
      parts.push(text);
      outputEl.textContent = parts.join("\n");
      outputEl.classList.toggle("is-error", !ok);
      updateMockBanner(text);
      if (ok) await renderChartFromWindow();
    } else {
      outputEl.textContent = parts.join("\n");
      outputEl.classList.remove("is-error");
      updateMockBanner("");
    }
    setStatus("ready");
  } catch (err) {
    outputEl.textContent = String(err);
    outputEl.classList.add("is-error");
    clearChart();
    setStatus("error");
  } finally {
    setBusy(false);
  }
});

refreshUi();

const fromDocs = sessionStorage.getItem("vq_sample");
if (fromDocs) {
  sessionStorage.removeItem("vq_sample");
  const demo = DEMO_EXAMPLES.find((x) => x.id === fromDocs || x.id === `ex-${fromDocs}`);
  const item = API_CATALOG.find((x) => x.id === fromDocs);
  if (demo) loadDemoExample(demo, { scroll: true });
  else if (item) loadSample(item, { scroll: true });
} else {
  const golden = DEMO_EXAMPLES.find((x) => x.id === "ex-multifactor") || DEMO_EXAMPLES[0];
  if (golden) loadDemoExample(golden);
  else codeEl.value = EXAMPLE_CODE;
}

if (!support.hasWasm) {
  showRuntimeFailure(new Error("WebAssembly is not available in this browser."));
} else {
  loadPyodideRuntime((s) => {
    if (s === "ready") setStatus("ready");
    else if (s === "error") setStatus("error");
    else setStatus("loading");
  }).catch((err) => {
    console.error(err);
    showRuntimeFailure(err);
  });
}
