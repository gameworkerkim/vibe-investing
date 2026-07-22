import { applyI18n, detectLang, t } from "./i18n.js?v=26";
import { API_CATALOG, noteFor } from "./api-catalog.js?v=26";
import { DEMO_EXAMPLES, exampleTitle } from "./examples.js?v=26";
import { EXAMPLE_CODE, getLastLoadMs, loadPyodideRuntime, runPython } from "./pyodide-runner.js?v=26";
import { clearChart, renderChartFromWindow } from "./chart-view.js?v=26";
import { detectRuntimeSupport, iosAdvice } from "./runtime-support.js?v=26";
import { requestQuantPrompt } from "./llm-prompt.js?v=26";
import { GOLDEN_LLM_PROMPTS, llmPromptTitle } from "./llm-prompts.js?v=26";
import { COMMUNITY_SAMPLES, communityTitle } from "./community-samples.js?v=26";
import { scoreCommunityRun } from "./community-rubric.js?v=26";

const codeEl = document.getElementById("code");
const outputEl = document.getElementById("output");
const errorLogEl = document.getElementById("error-log");
const statusEl = document.getElementById("runtime-status");
const runBtn = document.getElementById("btn-run");
const exampleBtn = document.getElementById("btn-example");
const clearBtn = document.getElementById("btn-clear");
const copyCodeBtn = document.getElementById("btn-copy-code");
const clearPromptBtn = document.getElementById("btn-clear-prompt");
const copyPromptBtn = document.getElementById("btn-copy-prompt");
const llmBtn = document.getElementById("btn-llm");
const communityChips = document.getElementById("community-chips");
const communityScoreEl = document.getElementById("community-score");
const communityScoreSummary = document.getElementById("community-score-summary");
const communityScoreList = document.getElementById("community-score-list");
const communityScoreMeta = document.getElementById("community-score-meta");
const communityScoreBtn = document.getElementById("btn-community-score");
const llmBtnLabel = llmBtn?.querySelector(".btn-label");
const llmPromptEl = document.getElementById("llm-prompt");
const llmModelEl = document.getElementById("llm-model");
const llmStatusEl = document.getElementById("llm-status");
const llmPromptChips = document.getElementById("llm-prompt-chips");
const llmProgressEl = document.getElementById("llm-progress");
const llmProgressLabel = document.getElementById("llm-progress-label");
const llmPromptBlock = document.querySelector(".llm-prompt-block");
const resultBusyEl = document.getElementById("result-busy");
const resultBusyLabel = document.getElementById("result-busy-label");
const langSelect = document.getElementById("lang-select");
const apiTbody = document.getElementById("api-tbody");
const sampleLabel = document.getElementById("sample-label");
const iosBanner = document.getElementById("ios-banner");
const dataSourceBanner = document.getElementById("data-source-banner");
const examplesChips = document.getElementById("examples-chips");

function setResult(text) {
  if (outputEl) outputEl.textContent = text || "";
}

function setErrorLog(text) {
  if (errorLogEl) errorLogEl.textContent = text || "";
}

function clearOutputs() {
  setResult("");
  setErrorLog("");
}

async function copyText(text, btn) {
  const value = String(text || "");
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  if (!btn) return;
  const label = tx("copied", "Copied");
  btn.classList.add("is-copied");
  btn.setAttribute("title", label);
  btn.setAttribute("aria-label", label);
  window.setTimeout(() => {
    btn.classList.remove("is-copied");
    const restore = tx("copy", "Copy");
    btn.setAttribute("title", restore);
    btn.setAttribute("aria-label", restore);
  }, 1200);
}

let lang = detectLang();
let activeSampleId = "ex-multifactor";
let activeExampleId = "ex-multifactor";
let activeCommunityId = "";
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

function setActiveCommunityChip(id) {
  activeCommunityId = id || "";
  communityChips?.querySelectorAll(".example-chip").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.id === activeCommunityId);
  });
}

function renderCommunityScore(result, artifact) {
  if (!communityScoreEl) return;
  communityScoreEl.hidden = false;
  const tpl = tx("community_score_summary", "Score {passed}/{total}");
  if (communityScoreSummary) {
    communityScoreSummary.textContent = tpl
      .replace("{passed}", String(result.passed))
      .replace("{total}", String(result.total));
  }
  if (communityScoreList) {
    communityScoreList.innerHTML = "";
    for (const c of result.checks) {
      const li = document.createElement("li");
      li.className = c.pass ? "pass" : "fail";
      const label = tx(`community_check_${c.id}`, c.id);
      li.textContent = `${c.pass ? "PASS" : "FAIL"} — ${label}: ${c.detail}`;
      communityScoreList.append(li);
    }
  }
  if (communityScoreMeta) {
    const lines = [
      `id: ${artifact?.id || ""}`,
      `author: ${artifact?.author || ""}`,
      artifact?.source_url ? `source_url: ${artifact.source_url}` : "",
      Object.keys(result.metrics || {}).length
        ? `VQ_METRICS: ${JSON.stringify(result.metrics)}`
        : "VQ_METRICS: (none)",
      "",
      "disclosures:",
      ...(result.disclosures || []).map((d) => `  - ${d}`),
      "",
      "limits:",
      ...(result.limits || []).map((d) => `  - ${d}`),
    ].filter(Boolean);
    communityScoreMeta.textContent = lines.join("\n");
  }
}

function loadCommunitySample(sample, { scroll = false } = {}) {
  activeSampleId = sample.id;
  activeCommunityId = sample.id;
  setActiveExampleChip("");
  setActiveCommunityChip(sample.id);
  codeEl.value = sample.python.trim() + "\n";
  if (sampleLabel) {
    sampleLabel.textContent = `${tx("community_loaded", "Community sample")}: ${communityTitle(sample, lang)}`;
  }
  document.querySelectorAll(".api-table tbody tr").forEach((row) => row.classList.remove("is-active"));
  if (communityScoreEl) communityScoreEl.hidden = true;
  if (scroll) {
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  codeEl.focus();
}

function renderCommunity() {
  if (!communityChips) return;
  communityChips.innerHTML = "";
  for (const sample of COMMUNITY_SAMPLES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "example-chip";
    btn.dataset.id = sample.id;
    btn.setAttribute("role", "listitem");
    if (sample.id === activeCommunityId) btn.classList.add("is-active");
    btn.innerHTML = `<span class="check" aria-hidden="true">✓</span>${communityTitle(sample, lang)}`;
    btn.addEventListener("click", () => loadCommunitySample(sample, { scroll: true }));
    communityChips.append(btn);
  }
}

function loadDemoExample(ex, { scroll = false } = {}) {
  activeSampleId = ex.id;
  setActiveExampleChip(ex.id);
  setActiveCommunityChip("");
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
  setActiveCommunityChip("");
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

function renderLlmPromptChips() {
  if (!llmPromptChips) return;
  llmPromptChips.innerHTML = "";
  for (const item of GOLDEN_LLM_PROMPTS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "example-chip";
    btn.dataset.id = item.id;
    btn.setAttribute("role", "listitem");
    btn.innerHTML = `<span class="check" aria-hidden="true">✓</span>${llmPromptTitle(item, lang)}`;
    btn.addEventListener("click", () => {
      if (llmPromptEl) llmPromptEl.value = item.prompt.trim() + "\n";
      llmPromptChips.querySelectorAll(".example-chip").forEach((b) => {
        b.classList.toggle("is-active", b.dataset.id === item.id);
      });
      llmPromptEl?.focus();
    });
    llmPromptChips.append(btn);
  }
}

async function refreshLlmStatus() {
  if (!llmStatusEl) return;
  const base = String(
    globalThis.RUNTIME_CONFIG?.VIBEQUANT_API_BASE || globalThis.VIBEQUANT_API_BASE || ""
  ).replace(/\/$/, "");
  if (!base) {
    llmStatusEl.textContent = tx("llm_status_no_api", "API base missing");
    llmStatusEl.classList.add("is-bad");
    llmStatusEl.classList.remove("is-ok");
    return;
  }
  try {
    const res = await fetch(`${base}/api/health`);
    const data = await res.json();
    const ok = !!data?.deepseek?.configured;
    llmStatusEl.textContent = ok
      ? tx("llm_status_ok", "DeepSeek: configured")
      : tx("llm_status_missing", "DeepSeek: not configured — run setup-deepseek.sh --remote");
    llmStatusEl.classList.toggle("is-ok", ok);
    llmStatusEl.classList.toggle("is-bad", !ok);
  } catch {
    llmStatusEl.textContent = tx("llm_status_error", "DeepSeek: health check failed");
    llmStatusEl.classList.add("is-bad");
    llmStatusEl.classList.remove("is-ok");
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
  renderCommunity();
  renderLlmPromptChips();
  renderApiTable();
  refreshLlmStatus();
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
  setResult("");
  setErrorLog(parts.join("\n"));
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
  clearOutputs();
  clearChart();
  updateMockBanner("");
  activeSampleId = "";
  setActiveExampleChip("");
  document.querySelectorAll(".api-table tbody tr").forEach((row) => row.classList.remove("is-active"));
  codeEl.focus();
});

copyCodeBtn?.addEventListener("click", () => copyText(codeEl?.value || "", copyCodeBtn));
copyPromptBtn?.addEventListener("click", () => copyText(llmPromptEl?.value || "", copyPromptBtn));

clearPromptBtn?.addEventListener("click", () => {
  if (llmPromptEl) llmPromptEl.value = "";
  llmPromptChips?.querySelectorAll(".example-chip").forEach((btn) => btn.classList.remove("is-active"));
  setLlmProgress("idle");
  llmPromptEl?.focus();
});

function setBusy(busy) {
  runBtn && (runBtn.disabled = busy);
  exampleBtn && (exampleBtn.disabled = busy);
  clearBtn && (clearBtn.disabled = busy);
  clearPromptBtn && (clearPromptBtn.disabled = busy);
  copyCodeBtn && (copyCodeBtn.disabled = busy);
  copyPromptBtn && (copyPromptBtn.disabled = busy);
  llmBtn && (llmBtn.disabled = busy);
  if (llmModelEl) llmModelEl.disabled = busy;
  if (llmPromptEl) llmPromptEl.disabled = busy;
}

/** @param {"idle"|"llm"|"python"|"done"|null} phase */
function setLlmProgress(phase) {
  const running = phase === "llm" || phase === "python";
  if (llmProgressEl) llmProgressEl.hidden = !running;
  llmPromptBlock?.classList.toggle("is-running", running);
  if (llmBtn) {
    llmBtn.classList.toggle("is-loading", running);
    llmBtn.setAttribute("aria-busy", running ? "true" : "false");
  }
  if (resultBusyEl) resultBusyEl.hidden = !running;

  let label = "";
  if (phase === "llm") label = tx("llm_running", "Calling DeepSeek…");
  else if (phase === "python") label = tx("llm_running_python", "Running generated Python…");
  else if (phase === "done") label = tx("llm_done", "Done");

  if (llmProgressLabel && label) llmProgressLabel.textContent = label;
  if (resultBusyLabel && label) resultBusyLabel.textContent = label;
  if (llmBtnLabel) {
    llmBtnLabel.textContent = running
      ? tx("llm_run_busy", "Running…")
      : tx("llm_run", "Run prompt");
  }
}

runBtn?.addEventListener("click", async () => {
  const code = codeEl.value.trim();
  if (!code) {
    setResult("");
    setErrorLog(tx("empty_code", "Enter Python code first."));
    clearChart();
    return;
  }

  setBusy(true);
  setStatus("running");
  clearOutputs();
  clearChart();

  try {
    const { ok, text } = await runPython(code);
    if (ok) {
      setResult(text);
      setErrorLog("");
      updateMockBanner(text);
      await renderChartFromWindow();
    } else {
      setResult("");
      setErrorLog(text);
      updateMockBanner(text);
      clearChart();
    }
    setStatus("ready");
  } catch (err) {
    showRuntimeFailure(err);
    clearChart();
    updateMockBanner("");
  } finally {
    setBusy(false);
  }
});

communityScoreBtn?.addEventListener("click", async () => {
  const sample =
    COMMUNITY_SAMPLES.find((s) => s.id === activeCommunityId) ||
    COMMUNITY_SAMPLES.find((s) => s.id === activeSampleId);
  if (!sample) {
    setErrorLog(tx("community_need_sample", "Load a community sample first."));
    document.getElementById("community")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  loadCommunitySample(sample, { scroll: true });
  const code = codeEl.value.trim();
  setBusy(true);
  setStatus("running");
  clearOutputs();
  clearChart();
  try {
    const { ok, text } = await runPython(code);
    if (ok) {
      setResult(text);
      setErrorLog("");
      updateMockBanner(text);
      await renderChartFromWindow();
    } else {
      setResult("");
      setErrorLog(text);
      updateMockBanner(text);
      clearChart();
    }
    const scored = scoreCommunityRun(ok ? text : text, sample, { ok });
    renderCommunityScore(scored, sample);
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
    setResult("");
    setErrorLog(tx("llm_empty", "Enter an LLM Quant Prompt first."));
    clearChart();
    return;
  }

  setBusy(true);
  setLlmProgress("llm");
  setStatus("running");
  clearOutputs();
  setResult(tx("llm_running", "Calling DeepSeek…"));
  clearChart();

  try {
    const model = llmModelEl?.value === "pro" ? "pro" : "flash";
    const res = await requestQuantPrompt({ prompt, model });
    if (!res.ok) {
      setResult("");
      if (res.error === "FINANCE_ONLY") {
        setErrorLog(tx("llm_finance_only", res.message || ""));
      } else if (res.error === "FINANCE_COOLDOWN") {
        setErrorLog(tx("llm_finance_cooldown", res.message || ""));
      } else {
        setErrorLog(
          `[${res.error}] ${res.message}${res.retryAfter ? `\nretryAfter=${res.retryAfter}s` : ""}`
        );
      }
      setStatus("ready");
      return;
    }

    const parts = [
      `=== LLM Quant (${res.model}, mode=${res.mode}) ===`,
      res.answer || "",
    ];

    if (res.python) {
      setLlmProgress("python");
      codeEl.value = res.python.trim() + "\n";
      if (sampleLabel) {
        sampleLabel.textContent = `${tx("sample_loaded", "Sample")}: LLM → vi_browser`;
      }
      parts.push("", "=== Generated Python (editor updated) ===", res.python.trim());
      setResult(parts.join("\n") + `\n\n=== Pyodide run ===\n${tx("llm_running_python", "Running generated Python…")}`);
      setErrorLog("");
      const { ok, text } = await runPython(res.python);
      if (ok) {
        setResult(parts.join("\n") + "\n\n=== Pyodide run ===\n" + text);
        setErrorLog("");
        updateMockBanner(text);
        await renderChartFromWindow();
      } else {
        setResult(parts.join("\n"));
        setErrorLog(text);
        updateMockBanner(text);
        clearChart();
      }
    } else {
      setResult(parts.join("\n"));
      setErrorLog("");
      updateMockBanner("");
    }
    setStatus("ready");
  } catch (err) {
    setResult("");
    setErrorLog(String(err));
    clearChart();
    setStatus("error");
  } finally {
    setLlmProgress("idle");
    setBusy(false);
  }
});

refreshUi();

const fromDocs = sessionStorage.getItem("vq_sample");
if (fromDocs) {
  sessionStorage.removeItem("vq_sample");
  const community = COMMUNITY_SAMPLES.find((x) => x.id === fromDocs);
  const demo = DEMO_EXAMPLES.find((x) => x.id === fromDocs || x.id === `ex-${fromDocs}`);
  const item = API_CATALOG.find((x) => x.id === fromDocs);
  if (community) loadCommunitySample(community, { scroll: true });
  else if (demo) loadDemoExample(demo, { scroll: true });
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
