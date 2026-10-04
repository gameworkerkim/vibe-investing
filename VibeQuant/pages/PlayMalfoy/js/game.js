import { I18N } from "./i18n.js";
import {
  ACTIVITIES, GALLERY, MONTHS, STATS, clamp, dateFromTurn, newState,
  portraitStage, pickEnding,
} from "./data.js";

const KEY = "playmalfoy-v1";
const $ = (id) => document.getElementById(id);
const lang0 = localStorage.getItem("playmalfoy-lang") || (navigator.language || "ko").slice(0, 2);
let lang = ["ko", "en", "ja"].includes(lang0) ? lang0 : "ko";
let S = null;
let lastScreen = "gate";

const t = (k) => {
  const parts = k.split(".");
  let cur = I18N[lang];
  for (const p of parts) cur = cur?.[p];
  return cur ?? k;
};

function applyLang() {
  document.documentElement.lang = lang;
  document.title = `${t("title")} · VibeQuant`;
  document.querySelectorAll("[data-i]").forEach((el) => {
    const key = el.getAttribute("data-i");
    const val = t(key);
    if (typeof val === "string") el.textContent = val;
  });
  $("lang").value = lang;
  if (S) renderMain();
}

function show(id) {
  lastScreen = id;
  document.querySelectorAll(".screen").forEach((n) => n.classList.add("hidden"));
  $(id).classList.remove("hidden");
  window.scrollTo(0, 0);
}

function persist() {
  if (!S) return;
  localStorage.setItem(KEY, JSON.stringify(S));
}

function unlock(id) {
  if (!id) return;
  if (!S.gallery.includes(id)) S.gallery.push(id);
}

function addLog(msg) {
  S.log.unshift(msg);
  S.log = S.log.slice(0, 12);
}

function pcBonus(id) {
  if (id === "talk") return S.pc === "harry" ? { bond: 3, morality: 1 } : S.pc === "ron" ? { bond: 2, charm: 2 } : { intellect: 2, bond: 1 };
  if (id === "kitchen" && S.pc === "ron") return { bond: 3, stress: -4 };
  if (id === "library" && S.pc === "hermione") return { intellect: 3, bond: 2 };
  if (id === "duel" && S.pc === "harry") return { magic: 2, bond: 1 };
  return {};
}

function applyDelta(d) {
  for (const k of STATS) {
    if (d[k]) S[k] = clamp(S[k] + d[k]);
  }
  if (d.gold) S.gold = Math.max(0, S.gold + d.gold);
  if (d.stress) S.stress = clamp(S.stress + d.stress, 0, 100);
}

function portraitSrc() {
  const st = portraitStage(S.grace);
  unlock(`malfoy-${st}`);
  return `img/malfoy-${st}.jpg`;
}

function renderMain() {
  if (!S) return;
  const d = dateFromTurn(S.turn);
  $("hud-date").textContent = `${d.year}.${String(d.month).padStart(2, "0")} · ${d.age}${t("age")} · ${t("compact")} ${Math.min(3, 1 + Math.floor(S.turn / 12))}`;
  $("hud-gold").textContent = `${t("gold")} ${S.gold}`;
  $("hud-stress").textContent = `${t("stress")} ${S.stress}`;
  $("portrait").src = portraitSrc();
  $("stats").innerHTML = STATS.map((k) => {
    const v = S[k];
    return `<div class="stat"><span>${t("stats." + k)}</span><div class="bar"><i style="width:${Math.min(100, v)}%"></i></div><b>${v}</b></div>`;
  }).join("") + `<div class="stat"><span>${t("stress")}</span><div class="bar stress"><i style="width:${S.stress}%"></i></div><b>${S.stress}</b></div>`;
  $("log").innerHTML = `<strong>${t("logH")}</strong><div>${(S.log || []).map((x) => `<div>${x}</div>`).join("")}</div>`;
  const sick = S.stress >= 80;
  $("acts").innerHTML = ACTIVITIES.map((a) => {
    const name = t("act." + a.id);
    const locked = S.gold < a.cost || (sick && a.id !== "rest");
    return `<button class="act" data-act="${a.id}" ${locked ? "disabled" : ""}>
      <strong>${name[0]}</strong>
      <small>${name[1]} · ${a.cost ? a.cost + "g" : "+" + (a.gold || 0) + "g"}</small>
    </button>`;
  }).join("");
  $("acts").querySelectorAll("[data-act]").forEach((b) => b.onclick = () => doAct(b.dataset.act));
}

function openEvent(html, img, choices) {
  $("event-art").classList.toggle("hidden", !img);
  if (img) $("event-art").src = img;
  $("event-body").innerHTML = html;
  $("event-choices").innerHTML = "";
  (choices || [{ id: "ok", label: t("continue") }]).forEach((c) => {
    const b = document.createElement("button");
    b.className = "btn primary";
    b.textContent = c.label;
    b.onclick = () => { c.fn?.(); afterEvent(); };
    $("event-choices").appendChild(b);
  });
  show("event");
}

function afterEvent() {
  persist();
  if (S.turn >= MONTHS || S.collapsed) return finish();
  renderMain();
  show("main");
}

function seasonal(month) {
  if (month === 6) return { key: "evBirthday", img: "img/cg-tea.jpg", gal: "cg-tea", d: { bond: 2, charm: 2 } };
  if (month === 10) return { key: "evHalloween", img: "img/malfoy-1.jpg", d: { pride: 2 } };
  if (month === 12) return { key: "evYule", img: "img/cg-ball.jpg", gal: "cg-ball", d: { grace: 4, charm: 4, stress: 3 } };
  return null;
}

function randomEvent() {
  const pool = [
    { key: "evRain", img: "img/cg-window.jpg", gal: "cg-window", d: { grace: 2, stress: -3 } },
    { key: "evProphet", img: portraitSrc(), d: { charm: 2, pride: 2, stress: 4 } },
    { key: "evOwl", choice: true },
    { key: S.pc === "harry" ? "evHarry" : S.pc === "ron" ? "evRon" : "evHer", img: `img/pc-${S.pc}.jpg`, d: { bond: 3 } },
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

function runEvent(ev) {
  if (ev.gal) unlock(ev.gal);
  if (ev.d) applyDelta(ev.d);
  if (ev.choice) {
    openEvent(`<p>${t("evOwl")}</p>`, "img/cg-window.jpg", [
      { id: "k", label: t("choiceKeep"), fn: () => { applyDelta({ pride: 2, bond: 4 }); addLog(t("owlKeep")); } },
      { id: "x", label: t("choiceTear"), fn: () => { applyDelta({ morality: 5, pride: -6 }); addLog(t("owlTear")); } },
    ]);
    return true;
  }
  addLog(t(ev.key));
  openEvent(`<p>${t(ev.key)}</p>`, ev.img);
  return true;
}

function doAct(id) {
  const a = ACTIVITIES.find((x) => x.id === id);
  if (!a) return;
  if (S.gold < a.cost) return;
  S.gold -= a.cost;
  applyDelta({ ...a, gold: a.gold });
  applyDelta(pcBonus(id));
  unlock(a.gallery);
  const played = dateFromTurn(S.turn);
  const nm = t("act." + id);
  addLog(`${played.year}.${played.month} — ${nm[0]}`);
  if (S.stamina <= 0) {
    S.collapsed = true;
    addLog(t("collapsed"));
    return finish();
  }
  S.turn += 1;
  persist();
  const forced = seasonal(played.month);
  if (forced) return void runEvent(forced);
  if (Math.random() < 0.42) return void runEvent(randomEvent());
  if (S.turn >= MONTHS) return finish();
  renderMain();
}

function finish() {
  const id = pickEnding(S);
  unlock(`malfoy-${portraitStage(S.grace)}`);
  persist();
  const pack = t("ends." + id);
  $("end-art").src = portraitSrc();
  $("end-title").textContent = pack[0];
  $("end-body").textContent = pack[1];
  show("end");
}

function renderGallery() {
  $("gal-title").textContent = t("galH");
  $("gal-grid").innerHTML = GALLERY.map((g) => {
    const on = S?.gallery?.includes(g.id);
    return `<figure class="gal-item ${on ? "" : "locked"}">
      <img src="${g.img}" alt="">
      <figcaption>${on ? t("gal." + g.id) : t("locked")}</figcaption>
    </figure>`;
  }).join("");
}

function start(pc) {
  S = newState(pc);
  addLog(t("storyH"));
  persist();
  renderMain();
  show("main");
}

$("lang").onchange = () => {
  lang = $("lang").value;
  localStorage.setItem("playmalfoy-lang", lang);
  applyLang();
  if (!$("gallery").classList.contains("hidden")) renderGallery();
};
$("age-yes").onclick = () => show("story");
$("age-no").onclick = () => { location.href = "https://vibequant.cc/"; };
$("to-pc").onclick = () => show("pc");
$("btn-new").onclick = () => { localStorage.removeItem(KEY); show("pc"); };
$("btn-load").onclick = () => {
  const raw = localStorage.getItem(KEY);
  if (!raw) return show("pc");
  S = JSON.parse(raw);
  renderMain();
  show("main");
};
$("btn-gallery").onclick = () => { renderGallery(); show("gallery"); };
$("gal-back").onclick = () => show(S ? "main" : "story");
$("again").onclick = () => { localStorage.removeItem(KEY); S = null; show("pc"); };
document.querySelectorAll("[data-pc]").forEach((b) => b.onclick = () => start(b.dataset.pc));

applyLang();
if (localStorage.getItem(KEY)) $("btn-load").classList.remove("hidden");
show("gate");
