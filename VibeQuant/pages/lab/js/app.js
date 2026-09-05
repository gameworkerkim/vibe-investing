import {
  analyzeForTargets,
  DEFAULT_PRICES,
  costUsd,
  fmt,
  heuristicCount,
} from "./tokens.js";
import { mockOptimizeResult, mockPlanResult } from "./mock.js";

const SAMPLE_KO = `Claude Code로 정적 대시보드를 만들어줘. Cloudflare Pages 무료 티어만 쓰고,
DeepSeek API로 한국어 프롬프트를 영어로 최적화하는 기능이 필요해. UI는 한국어로,
토큰 절약 예상치를 Claude랑 ChatGPT 각각 보여줘. 가능하면 예쁘게 만들어주고
주석도 자세히 달아줘. 부탁드립니다. 예외 처리도 해주고 깔끔한 결과를 반환해줘.`;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `tf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.add("hidden"), 2600);
}

function apiBase() {
  const cfg = globalThis.RUNTIME_CONFIG;
  return String(cfg?.VIBEQUANT_API_BASE || globalThis.VIBEQUANT_API_BASE || "https://api.vibequant.cc").replace(/\/$/, "");
}

function tfRoot() {
  return `${apiBase()}/api/v1/tokenforge`;
}

async function api(path, opts = {}) {
  const headers = { "content-type": "application/json", ...(opts.headers || {}) };
  const res = await fetch(`${tfRoot()}${path}`, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
  return data;
}

const SETTINGS_KEY = "tokenforge.settings.v1";
const LOCAL_MEM_KEY = "tokenforge.memory.local.v1";

const state = {
  settings: null,
  health: { mode: "mock", storage: "browser-localStorage", model: "deepseek-v4-flash", liveApi: false },
  plan: null,
  forgeResult: null,
  memItems: [],
  localMem: [],
};

function defaultSettings() {
  return { usePrecise: false, prices: JSON.parse(JSON.stringify(DEFAULT_PRICES)) };
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    state.settings = raw ? { ...defaultSettings(), ...JSON.parse(raw) } : defaultSettings();
    state.settings.prices = { ...DEFAULT_PRICES, ...(state.settings.prices || {}) };
  } catch {
    state.settings = defaultSettings();
  }
  fillSettingsForm();
}
function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  } catch {
    /* ignore */
  }
}
function fillSettingsForm() {
  const s = state.settings;
  $("#set-precise").checked = s.usePrecise;
  $("#set-price-claude-in").value = s.prices.claude.in;
  $("#set-price-claude-out").value = s.prices.claude.out;
  $("#set-price-gpt-in").value = s.prices.chatgpt.in;
  $("#set-price-gpt-out").value = s.prices.chatgpt.out;
}
function readSettingsForm() {
  state.settings.usePrecise = $("#set-precise").checked;
  state.settings.prices.claude.in = Number($("#set-price-claude-in").value);
  state.settings.prices.claude.out = Number($("#set-price-claude-out").value);
  state.settings.prices.chatgpt.in = Number($("#set-price-gpt-in").value);
  state.settings.prices.chatgpt.out = Number($("#set-price-gpt-out").value);
  saveSettings();
  toast("설정 저장됨");
}

function updateModePills() {
  const h = state.health;
  const live = h.mode === "live" && h.liveApi;
  const modePill = $("#mode-pill");
  modePill.textContent = live ? `live · ${h.model}` : "mock (로컬 폴백)";
  modePill.className = `status-pill ${live ? "live" : "mock"}`;
  $("#model-pill").textContent = h.model || "deepseek-v4-flash";
  $("#storage-pill").textContent = "기억: localStorage";
}

async function refreshHealth() {
  try {
    const d = await api("/health");
    state.health = {
      mode: d.mode || "mock",
      storage: d.storage || "browser-localStorage",
      model: d.model || "deepseek-v4-flash",
      liveApi: d.mode === "live",
    };
  } catch {
    state.health = {
      mode: "mock",
      storage: "browser-localStorage",
      model: "deepseek-v4-flash",
      liveApi: false,
    };
  }
  updateModePills();
}

function showTool(name) {
  $$(".tool-tab").forEach((b) => {
    const on = b.dataset.tool === name;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", on ? "true" : "false");
  });
  $$(".panel").forEach((p) => {
    const on = p.id === `panel-${name}`;
    p.classList.toggle("active", on);
    p.hidden = !on;
  });
  if (name === "tokenforge") {
    const hash = location.hash.replace("#", "") || "tokenforge";
    if (!hash.startsWith("tokenforge")) location.hash = "tokenforge";
  } else {
    location.hash = name;
  }
}

function showView(name) {
  $$("#tf-subnav button").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  $$("#panel-tokenforge .view").forEach((v) => v.classList.toggle("active", v.id === `view-${name}`));
}

function readLocalMem() {
  try {
    state.localMem = JSON.parse(localStorage.getItem(LOCAL_MEM_KEY) || "[]");
  } catch {
    state.localMem = [];
  }
  return state.localMem;
}
function writeLocalMem() {
  localStorage.setItem(LOCAL_MEM_KEY, JSON.stringify(state.localMem.slice(0, 200)));
}

async function listMemory() {
  readLocalMem();
  const q = $("#mem-q").value.trim().toLowerCase();
  const kind = $("#mem-kind").value;
  const local = state.localMem.filter((m) => {
    if (kind && m.kind !== kind) return false;
    if (q && !`${m.title} ${m.tags.join(" ")} ${m.content} ${m.optimizedText ?? ""}`.toLowerCase().includes(q))
      return false;
    return true;
  });
  local.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return local;
}

async function saveMemory(partial) {
  const now = new Date().toISOString();
  readLocalMem();
  const idx = partial.id ? state.localMem.findIndex((m) => m.id === partial.id) : -1;
  const existing = idx >= 0 ? state.localMem[idx] : null;
  const entry = {
    id: existing?.id ?? partial.id ?? uid(),
    kind: partial.kind ?? existing?.kind ?? "project",
    title: partial.title ?? existing?.title ?? "무제",
    tags: partial.tags ?? existing?.tags ?? [],
    content: partial.content ?? existing?.content ?? "",
    plan: partial.plan !== undefined ? partial.plan : existing?.plan ?? null,
    sourceText: partial.sourceText !== undefined ? partial.sourceText : existing?.sourceText ?? null,
    optimizedText: partial.optimizedText !== undefined ? partial.optimizedText : existing?.optimizedText ?? null,
    targetFamily: partial.targetFamily ?? existing?.targetFamily ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  if (idx >= 0) state.localMem[idx] = entry;
  else state.localMem.unshift(entry);
  writeLocalMem();
  return entry;
}

async function deleteMemory(id) {
  readLocalMem();
  state.localMem = state.localMem.filter((m) => m.id !== id);
  writeLocalMem();
}

function renderMemory() {
  const box = $("#mem-list");
  const items = state.memItems;
  if (!items.length) {
    box.innerHTML = `<div class="empty">저장된 기억이 없습니다. 계획 또는 최적화 결과를 저장해보세요.</div>`;
    return;
  }
  box.innerHTML = items
    .map((m) => {
      const preview = (m.content || m.optimizedText || m.sourceText || "").replace(/\s+/g, " ").slice(0, 160);
      const tags = (m.tags || []).map((t) => `<code>#${esc(t)}</code>`).join(" ");
      return `<div class="card mem-card">
        <div class="mem-main">
          <div class="mem-meta">
            <span class="kind ${esc(m.kind)}">${esc(m.kind)}</span>
            <b>${esc(m.title)}</b>
            <span>· ${new Date(m.updatedAt).toLocaleString()}</span>
            ${tags}
          </div>
          <p class="mem-preview">${esc(preview || "(내용 없음)")}</p>
        </div>
        <div class="row end" style="margin-top:6px">
          ${m.kind === "project" ? `<button type="button" class="btn ghost sm" data-act="load-plan" data-id="${m.id}">계획 불러오기</button>` : ""}
          ${m.kind === "prompt" ? `<button type="button" class="btn ghost sm" data-act="to-forge" data-id="${m.id}">원문→Forge</button>` : ""}
          ${m.optimizedText ? `<button type="button" class="btn ghost sm" data-act="copy-opt" data-id="${m.id}">최적화문 복사</button>` : ""}
          <button type="button" class="btn ghost sm" data-act="skill" data-id="${m.id}">SKILL</button>
          <button type="button" class="btn ghost sm danger" data-act="del" data-id="${m.id}">삭제</button>
        </div>
      </div>`;
    })
    .join("");

  box.querySelectorAll("[data-act]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const item = state.localMem.find((m) => m.id === btn.dataset.id);
      if (!item) return toast("항목을 찾을 수 없습니다.");
      const act = btn.dataset.act;
      if (act === "load-plan") {
        state.plan = item.plan;
        if (!state.plan) return toast("이 항목에는 계획이 없습니다.");
        $("#plan-goal").value = state.plan.goal || "";
        renderPlan();
        showView("plan");
        toast("계획 불러옴");
      } else if (act === "to-forge") {
        $("#forge-source").value = item.sourceText || item.content || "";
        updateLiveTok();
        showView("forge");
      } else if (act === "copy-opt") {
        await copyText(item.optimizedText);
      } else if (act === "skill") {
        await openSkillFromMemory(item);
      } else if (act === "del") {
        if (!confirm(`"${item.title}" 을(를) 삭제할까요?`)) return;
        await deleteMemory(item.id);
        toast("삭제됨");
        await refreshMemoryList();
      }
    });
  });
}

async function refreshMemoryList() {
  state.memItems = await listMemory();
  renderMemory();
  fillMemoryOptions();
}

function fillMemoryOptions() {
  const sel = $("#forge-memory");
  const opts = ["<option value=''>없음</option>"];
  state.memItems
    .filter((m) => m.kind === "project" || m.kind === "wiki")
    .forEach((m) => opts.push(`<option value="${m.id}">${esc(m.title)} (${m.kind})</option>`));
  sel.innerHTML = opts.join("");
}

function openMemDialog(prefill = {}) {
  const dlg = $("#mem-dialog");
  $("#mem-dialog-title").textContent = prefill.id ? "기억 항목 편집" : "새 기억 항목";
  $("#mem-new-kind").value = prefill.kind || "prompt";
  $("#mem-new-title").value = prefill.title || "";
  $("#mem-new-tags").value = (prefill.tags || []).join(", ");
  $("#mem-new-content").value = prefill.content || "";
  dlg._prefill = prefill;
  dlg.showModal();
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  toast("복사됨");
}

function renderPlan() {
  const p = state.plan;
  const box = $("#plan-result");
  if (!p) {
    box.classList.add("hidden");
    return;
  }
  box.classList.remove("hidden");
  $("#plan-title").textContent = p.title || "프로젝트";
  $("#plan-badge").textContent = p.modeBadge || "plan";
  $("#plan-goal-view").textContent = `목표: ${p.goal}`;
  $("#plan-explanation").innerHTML = p.explanationKo
    ? `<b>전체 계획 프롬프트가 하는 일</b><br/>${esc(p.explanationKo)}`
    : "";
  $("#plan-whole").value = p.wholePromptEn || "";
  $("#plan-risks").innerHTML = (p.risks || []).map((r) => `<li>${esc(r)}</li>`).join("") || "<li>(없음)</li>";
  $("#plan-outputs").innerHTML = (p.outputs || []).map((o) => `<li>${esc(o)}</li>`).join("") || "<li>(없음)</li>";

  const steps = p.steps || [];
  $("#plan-steps").innerHTML = steps
    .map(
      (s, i) => `<div class="step-row">
      <div class="row spread">
        <b>${i + 1}. <input type="text" class="step-title" data-i="${i}" value="${esc(s.title)}" /></b>
        <button type="button" class="btn ghost sm" data-forge-step="${i}">이 단계 최적화 →</button>
      </div>
      ${s.descriptionKo ? `<p class="hint">${esc(s.descriptionKo)}</p>` : ""}
      <label>세부 프롬프트
        <textarea class="step-draft" data-i="${i}" rows="3">${esc(s.draftPrompt || "")}</textarea>
      </label>
    </div>`
    )
    .join("");

  $$(".step-title").forEach((el) =>
    el.addEventListener("input", () => {
      state.plan.steps[Number(el.dataset.i)].title = el.value;
    })
  );
  $$(".step-draft").forEach((el) =>
    el.addEventListener("input", () => {
      state.plan.steps[Number(el.dataset.i)].draftPrompt = el.value;
    })
  );
  $$("[data-forge-step]").forEach((el) =>
    el.addEventListener("click", () => {
      const i = Number(el.dataset.forgeStep);
      const step = state.plan.steps[i];
      $("#forge-source").value = step.draftPrompt || step.title;
      updateLiveTok();
      showView("forge");
      toast(`스텝 ${i + 1} 프롬프트를 Forge로 보냄`);
    })
  );
}

async function makePlan() {
  const goal = $("#plan-goal").value.trim();
  if (!goal) return toast("목표를 입력하세요.");
  const btn = $("#btn-make-plan");
  const status = $("#plan-status");
  btn.disabled = true;
  status.textContent = "계획 생성 중…";
  try {
    let plan;
    let mode = "mock";
    let model = "deepseek-v4-flash (mock)";
    if (state.health.liveApi) {
      const d = await api("/plan", {
        method: "POST",
        body: JSON.stringify({
          goal,
          planLang: $("#plan-lang").value,
          constraints: $("#plan-constraints").value,
        }),
      });
      plan = d.plan;
      mode = d.mode;
      model = d.model;
    } else {
      plan = mockPlanResult(goal);
    }
    state.plan = plan;
    state.plan.modeBadge = mode === "mock" ? "mock 계획" : `live · ${model}`;
    renderPlan();
    showView("plan");
    status.textContent = `완료 (${mode})`;
  } catch (e) {
    state.plan = mockPlanResult(goal);
    state.plan.modeBadge = "mock 계획 (API 폴백)";
    renderPlan();
    status.textContent = "로컬 mock으로 완료";
    toast(`계획 API 폴백: ${e.message}`);
  } finally {
    btn.disabled = false;
  }
}

function updateLiveTok() {
  const src = $("#forge-source").value.trim();
  const el = $("#live-tok");
  if (!src) {
    el.textContent = "Claude · ChatGPT 토큰 추정 대기";
    return;
  }
  const c = heuristicCount(src, "claude");
  const g = heuristicCount(src, "chatgpt");
  el.textContent = `원문 추정  Claude ${fmt(c)} tok  ·  ChatGPT ${fmt(g)} tok  (±15%)`;
}

async function renderForgeResult() {
  const r = state.forgeResult;
  if (!r) return;
  $("#forge-result").classList.remove("hidden");
  $("#forge-badge").textContent = `${r.mode === "mock" ? "mock" : "live"} · ${r.targetFamily} · ${r.model}`;
  $("#forge-badge").className = `status-pill ${r.mode === "mock" ? "mock" : "live"}`;
  $("#forge-out").value = r.optimizedPrompt;
  $("#forge-summary").innerHTML = r.summaryKo ? esc(r.summaryKo) : "";
  $("#forge-changes").innerHTML = (r.changes || []).map((c) => `<li>${esc(c)}</li>`).join("") || "<li>(변경 없음)</li>";
  $("#forge-tips").innerHTML = (r.tips || []).map((t) => `<li>${esc(t)}</li>`).join("") || "<li>(팁 없음)</li>";

  const s = state.settings;
  $("#token-note").textContent = "추정치는 ±15% 오차 가능. ChatGPT는 tiktoken(o200k_base) 정밀모드 시 실제 BPE 계수.";
  const cards = $("#token-cards");
  cards.innerHTML = `
    <div class="tcard"><h4>Claude <span class="status-pill">추정</span></h4><div class="tok-body" data-f="claude"></div></div>
    <div class="tcard"><h4>ChatGPT <span class="status-pill">계산 중…</span></h4><div class="tok-body" data-f="chatgpt"></div></div>`;

  const stats = await analyzeForTargets(r.source, $("#forge-out").value, s.usePrecise);
  const claudePct = stats.claude.percent;

  $("#save-ring").style.setProperty("--p", `${Math.max(0, Math.min(100, claudePct))}%`);
  $("#save-big").textContent = claudePct > 0 ? `${claudePct}%` : "0%";

  for (const f of ["claude", "chatgpt"]) {
    const st = stats[f];
    const price = s.prices[f];
    const body = cards.querySelector(`[data-f="${f}"]`);
    const width = st.percent > 0 ? st.percent : 0;
    body.innerHTML = `
      <div class="tok-row"><span>원문 토큰</span><b>${fmt(st.before)}</b></div>
      <div class="tok-row"><span>최적화 토큰</span><b>${fmt(st.after)}</b></div>
      <div class="save-bar"><span style="width:${Math.min(100, width)}%"></span></div>
      <div class="row spread" style="margin-top:4px">
        <span class="pct">절약 ${st.percent}%</span>
        <span class="hint">${fmt(st.saved)} 토큰 절감</span>
      </div>
      <div class="tok-row" style="margin-top:6px"><span>비용(입력 1회)</span><b>~$${costUsd(st.before, st.before, price)} → ~$${costUsd(st.after, st.after, price)}</b></div>`;
    const pill = cards.querySelector(`[data-f="${f}"]`).parentElement.querySelector(".status-pill");
    if (f === "chatgpt") {
      pill.textContent = st.precise ? "tiktoken 정밀" : "추정";
      pill.className = `status-pill ${st.precise ? "live" : "mock"}`;
    } else {
      pill.textContent = "추정";
    }
  }
}

async function optimize() {
  const source = $("#forge-source").value.trim();
  if (!source) return toast("최적화할 원문 프롬프트를 입력하세요.");
  const btn = $("#btn-optimize");
  btn.disabled = true;
  $("#forge-status").textContent = state.health.liveApi ? "DeepSeek 호출 중…" : "로컬 mock 최적화…";
  $("#forge-result").classList.add("hidden");
  const family = $("#forge-target").value;
  try {
    let result;
    if (state.health.liveApi) {
      const d = await api("/optimize", {
        method: "POST",
        body: JSON.stringify({
          source,
          sourceLang: $("#forge-lang").value || undefined,
          targetFamily: family,
          extraInstruction: $("#forge-extra").value.trim() || undefined,
        }),
      });
      result = { source, ...d.result };
    } else {
      result = { source, ...mockOptimizeResult(source, family) };
    }
    state.forgeResult = result;
    await renderForgeResult();
    showView("forge");
    $("#forge-status").textContent = `완료 (${result.mode})`;
  } catch (e) {
    const result = { source, ...mockOptimizeResult(source, family) };
    state.forgeResult = result;
    await renderForgeResult();
    $("#forge-status").textContent = "로컬 mock으로 완료";
    toast(`최적화 API 폴백: ${e.message}`);
  } finally {
    btn.disabled = false;
  }
}

function skillMarkdown(opts) {
  const { title, goal, wholePromptEn, steps, tags } = opts;
  const safe =
    title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "tokenforge-skill";
  const overview = steps.map((s, i) => `- ${i + 1}. ${s.title}`).join("\n");
  const body = steps
    .map((s, i) => {
      const lines = [`## Step ${i + 1}: ${s.title}`];
      if (s.descriptionKo) lines.push(`Purpose: ${s.descriptionKo}`);
      if (s.draftPrompt) lines.push(`\n<source-draft>\n${s.draftPrompt}\n</source-draft>`);
      if (s.optimizedPrompt) lines.push(`\n<optimized-prompt>\n${s.optimizedPrompt}\n</optimized-prompt>`);
      return lines.join("\n");
    })
    .join("\n\n");
  const whole = wholePromptEn ? `## Overall Planning Prompt\n\n${wholePromptEn}\n` : "";
  const tagList = ["tokenforge", ...tags.map((t) => t.toLowerCase().replace(/\s+/g, "-"))]
    .filter(Boolean)
    .map((t) => `- ${t}`)
    .join("\n");
  return `---
name: ${safe}
description: ${title} — 전체 계획 프롬프트와 세부 프롬프트(영어 최적화) 번들. Goal: ${String(goal || "").slice(0, 200)}
metadata:
  source: TokenForge
  goal: ${goal || title}
---

# ${title}

${whole}
## Steps Overview

${overview}

${body}

## Tags

${tagList}
`;
}

function renderSkillMd(md) {
  $("#skill-md").textContent = md;
  $("#skill-result").classList.remove("hidden");
  showView("skill");
}

async function openSkillFromPlan() {
  const p = state.plan;
  const tags = $("#skill-tags").value.split(",").map((t) => t.trim()).filter(Boolean);
  const md = skillMarkdown({
    title: p.title,
    goal: p.goal,
    wholePromptEn: p.wholePromptEn,
    steps: (p.steps || []).map((s) => ({
      title: s.title,
      descriptionKo: s.descriptionKo,
      draftPrompt: s.draftPrompt,
      optimizedPrompt: s.optimizedPrompt,
    })),
    tags,
  });
  renderSkillMd(md);
}

async function openSkillFromMemory(item) {
  const plan = item.plan;
  let steps = plan?.steps ? plan.steps : [];
  const tags = $("#skill-tags").value.split(",").map((t) => t.trim()).filter(Boolean);
  if (!steps.length && (item.sourceText || item.optimizedText)) {
    steps = [
      {
        title: item.title,
        descriptionKo: item.content || "",
        draftPrompt: item.sourceText || item.optimizedPrompt,
        optimizedPrompt: item.optimizedText,
      },
    ];
  }
  if (!steps.length) return toast("이 기억 항목에서 스킬용 단계를 만들 수 없습니다.");
  const md = skillMarkdown({
    title: item.title,
    goal: item.content || plan?.goal || item.title,
    wholePromptEn: plan?.wholePromptEn,
    steps,
    tags: [...tags, ...(item.tags || [])],
  });
  renderSkillMd(md);
}

function fillSkillMemoryOptions() {
  const sel = $("#skill-memory-id");
  const opts = (state.memItems || [])
    .map((m) => `<option value="${m.id}">${esc(m.title)} (${m.kind})</option>`)
    .join("");
  sel.innerHTML = opts || "<option value=''>저장된 기억이 없음</option>";
}

function bind() {
  $$(".tool-tab").forEach((b) =>
    b.addEventListener("click", () => showTool(b.dataset.tool))
  );
  $$("[data-tool-back]").forEach((b) =>
    b.addEventListener("click", () => showTool(b.dataset.toolBack))
  );
  $("#tf-subnav").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-view]");
    if (btn) showView(btn.dataset.view);
  });

  $("#btn-goto-plan").addEventListener("click", () => {
    showView("plan");
    $("#plan-goal").focus();
  });
  $("#btn-goto-forge").addEventListener("click", () => {
    showView("forge");
    $("#forge-source").focus();
  });
  $("#btn-demo").addEventListener("click", async () => {
    showView("forge");
    $("#forge-source").value = SAMPLE_KO;
    updateLiveTok();
    await optimize();
  });

  $("#btn-make-plan").addEventListener("click", () => void makePlan());
  $("#btn-plan-regen").addEventListener("click", () => {
    $("#plan-goal").value = state.plan?.goal || $("#plan-goal").value;
    void makePlan();
  });
  $("#btn-save-plan").addEventListener("click", async () => {
    if (!state.plan) return;
    const saved = await saveMemory({
      kind: "project",
      title: state.plan.title,
      tags: ["plan", "tokenforge"],
      content: state.plan.explanationKo || "",
      plan: state.plan,
    });
    state.plan.savedId = saved.id;
    toast("계획 저장됨");
    await refreshMemoryList();
  });
  $("#btn-forge-all").addEventListener("click", () => showView("forge"));
  $("#btn-export-skill-from-plan").addEventListener("click", async () => {
    if (!state.plan) return toast("계획이 없습니다.");
    await openSkillFromPlan();
  });

  $("#btn-optimize").addEventListener("click", () => void optimize());
  $("#forge-source").addEventListener("input", updateLiveTok);
  $("#btn-save-forge").addEventListener("click", () => {
    const r = state.forgeResult;
    if (!r) return;
    openMemDialog({
      kind: "prompt",
      title: r.source.split("\n")[0].slice(0, 40) || "최적화 프롬프트",
      content: "",
      base: {
        sourceText: r.source,
        optimizedText: $("#forge-out").value,
        targetFamily: r.targetFamily,
        tags: ["optimized", r.targetFamily, r.mode],
      },
    });
  });

  $("#btn-mem-save").addEventListener("click", () => {
    const pre = $("#mem-dialog")._prefill || {};
    const tags = $("#mem-new-tags").value.split(",").map((t) => t.trim()).filter(Boolean);
    void saveMemory({
      ...(pre.base || {}),
      kind: $("#mem-new-kind").value,
      title: $("#mem-new-title").value.trim(),
      tags,
      content: $("#mem-new-content").value,
    }).then(async () => {
      toast("저장됨");
      await refreshMemoryList();
    });
  });
  $("#btn-mem-new").addEventListener("click", () => openMemDialog({ kind: "prompt" }));
  $("#mem-q").addEventListener("input", () => {
    clearTimeout(bind._memT);
    bind._memT = setTimeout(refreshMemoryList, 250);
  });
  $("#mem-kind").addEventListener("change", refreshMemoryList);
  $("#btn-mem-refresh").addEventListener("click", refreshMemoryList);

  $("#btn-skill-build").addEventListener("click", async () => {
    const srcMode = $("#skill-source").value;
    if (srcMode === "current-plan") {
      if (!state.plan) return toast("먼저 계획 탭에서 계획을 생성하세요.");
      await openSkillFromPlan();
    } else {
      const id = $("#skill-memory-id").value;
      if (!id) return toast("기억 항목을 선택하세요.");
      const item = state.localMem.find((m) => m.id === id);
      if (item) await openSkillFromMemory(item);
    }
  });
  $("#btn-skill-download").addEventListener("click", () => {
    const md = $("#skill-md").textContent;
    const nameMatch = md.match(/^name:\s*(.+)$/m);
    const name = (nameMatch?.[1]?.trim() || "tokenforge-skill").replace(/[^\w-]/g, "-");
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name}-SKILL.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 800);
  });
  $("#skill-source").addEventListener("change", () => {
    const useMem = $("#skill-source").value === "memory";
    $("#skill-memory-picker").classList.toggle("hidden", !useMem);
    if (useMem) fillSkillMemoryOptions();
  });

  $("#btn-settings").addEventListener("click", () => {
    fillSettingsForm();
    $("#settings-dialog").showModal();
  });
  $("#btn-settings-save").addEventListener("click", readSettingsForm);
  document.querySelectorAll("dialog").forEach((dlg) =>
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) dlg.close();
    })
  );
  document.addEventListener("click", (e) => {
    const cp = e.target.closest("[data-copy]");
    if (!cp) return;
    const el = document.getElementById(cp.dataset.copy);
    if (el) void copyText(el.value ?? el.textContent);
  });

  window.addEventListener("hashchange", applyHash);
}

function applyHash() {
  const h = (location.hash || "#tokenforge").replace("#", "");
  if (h === "vaultguard" || h === "myip") showTool(h);
  else showTool("tokenforge");
}

async function init() {
  loadSettings();
  bind();
  applyHash();
  await refreshHealth();
  await refreshMemoryList();
  updateLiveTok();
}

init();
