import { applyI18n, detectLang, t } from "./i18n.js?v=12";
import { API_CATALOG, noteFor } from "./api-catalog.js?v=12";
import { EXAMPLE_CODE, getLastLoadMs, loadPyodideRuntime, runPython } from "./pyodide-runner.js?v=12";
import { clearChart, renderChartFromWindow } from "./chart-view.js?v=12";
import { detectRuntimeSupport, iosAdvice } from "./runtime-support.js?v=12";

const codeEl = document.getElementById("code");
const outputEl = document.getElementById("output");
const statusEl = document.getElementById("runtime-status");
const runBtn = document.getElementById("btn-run");
const exampleBtn = document.getElementById("btn-example");
const clearBtn = document.getElementById("btn-clear");
const langSelect = document.getElementById("lang-select");
const apiTbody = document.getElementById("api-tbody");
const sampleLabel = document.getElementById("sample-label");
const iosBanner = document.getElementById("ios-banner");
const dataSourceBanner = document.getElementById("data-source-banner");

let lang = detectLang();
let activeSampleId = "chart";
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

function loadSample(item, { scroll = false } = {}) {
  activeSampleId = item.id;
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
  const golden =
    API_CATALOG.find((x) => x.id === "backtest") ||
    API_CATALOG.find((x) => x.id === "bundle") ||
    API_CATALOG.find((x) => x.id === "chart");
  if (golden) loadSample(golden, { scroll: true });
});

clearBtn?.addEventListener("click", () => {
  codeEl.value = "";
  if (sampleLabel) sampleLabel.textContent = "";
  outputEl.textContent = "";
  outputEl.classList.remove("is-error");
  clearChart();
  updateMockBanner("");
  activeSampleId = "";
  document.querySelectorAll(".api-table tbody tr").forEach((row) => row.classList.remove("is-active"));
  codeEl.focus();
});

runBtn?.addEventListener("click", async () => {
  const code = codeEl.value.trim();
  if (!code) {
    outputEl.textContent = tx("empty_code", "Enter Python code first.");
    outputEl.classList.add("is-error");
    clearChart();
    return;
  }

  runBtn.disabled = true;
  exampleBtn.disabled = true;
  if (clearBtn) clearBtn.disabled = true;
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
    runBtn.disabled = false;
    exampleBtn.disabled = false;
    if (clearBtn) clearBtn.disabled = false;
  }
});

refreshUi();

const fromDocs = sessionStorage.getItem("vq_sample");
if (fromDocs) {
  sessionStorage.removeItem("vq_sample");
  const item = API_CATALOG.find((x) => x.id === fromDocs);
  if (item) loadSample(item, { scroll: true });
} else {
  const golden =
    API_CATALOG.find((x) => x.id === "backtest") ||
    API_CATALOG.find((x) => x.id === "bundle") ||
    API_CATALOG.find((x) => x.id === "chart");
  if (golden) loadSample(golden);
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
