import { applyI18n, detectLang, t } from "./i18n.js";
import { EXAMPLE_CODE, loadPyodideRuntime, runPython } from "./pyodide-runner.js";

const codeEl = document.getElementById("code");
const outputEl = document.getElementById("output");
const statusEl = document.getElementById("runtime-status");
const runBtn = document.getElementById("btn-run");
const exampleBtn = document.getElementById("btn-example");
const langSelect = document.getElementById("lang-select");

let lang = detectLang();

function setStatus(kind) {
  statusEl.classList.remove("ready", "error", "running");
  if (kind === "ready") {
    statusEl.classList.add("ready");
    statusEl.textContent = t(lang, "status_ready");
  } else if (kind === "error") {
    statusEl.classList.add("error");
    statusEl.textContent = t(lang, "status_error");
  } else if (kind === "running") {
    statusEl.classList.add("running");
    statusEl.textContent = t(lang, "status_running");
  } else {
    statusEl.textContent = t(lang, "status_loading");
  }
}

function refreshUi() {
  applyI18n(lang);
  // Keep status label in sync with current language
  if (statusEl.classList.contains("ready")) setStatus("ready");
  else if (statusEl.classList.contains("error")) setStatus("error");
  else if (statusEl.classList.contains("running")) setStatus("running");
  else setStatus("loading");
}

langSelect.addEventListener("change", () => {
  lang = langSelect.value;
  refreshUi();
});

exampleBtn.addEventListener("click", () => {
  codeEl.value = t(lang, "example_note") + EXAMPLE_CODE;
  codeEl.focus();
});

runBtn.addEventListener("click", async () => {
  const code = codeEl.value.trim();
  if (!code) {
    outputEl.textContent = t(lang, "empty_code");
    outputEl.classList.add("is-error");
    return;
  }

  runBtn.disabled = true;
  exampleBtn.disabled = true;
  setStatus("running");
  outputEl.classList.remove("is-error");
  outputEl.textContent = "";

  try {
    const { ok, text } = await runPython(code);
    outputEl.textContent = text;
    outputEl.classList.toggle("is-error", !ok);
    setStatus("ready");
  } catch (err) {
    outputEl.textContent = String(err);
    outputEl.classList.add("is-error");
    setStatus("error");
  } finally {
    runBtn.disabled = false;
    exampleBtn.disabled = false;
  }
});

// Init
refreshUi();
if (!codeEl.value.trim()) {
  codeEl.value = t(lang, "example_note") + EXAMPLE_CODE;
}

loadPyodideRuntime((s) => {
  if (s === "ready") setStatus("ready");
  else if (s === "error") setStatus("error");
  else setStatus("loading");
}).catch(() => setStatus("error"));
