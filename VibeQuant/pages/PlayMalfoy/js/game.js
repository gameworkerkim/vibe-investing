import { I18N } from "./i18n.js?v=4";
import {
  ACTIVITIES, CLOTHES, GALLERY, GIFTS, MONTHS, STATS, clamp,
  dateFromTurn, migrate, newState, portraitStage, pickEnding,
} from "./data.js?v=4";

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
  const sel = $("lang");
  if (sel) sel.value = lang;
  if (S) renderMain();
  if ($("closet") && !$("closet").classList.contains("hidden")) renderCloset();
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
  if (!id || !S) return;
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
  const cloth = CLOTHES.find((c) => c.id === S?.worn);
  if (cloth?.img) {
    unlock(cloth.gallery);
    return cloth.img;
  }
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
  $("acts").querySelectorAll("[data-act]").forEach((b) => { b.onclick = () => doAct(b.dataset.act); });
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

function cardHtml(item, kind) {
  const pack = t(`${kind}.${item.id}`);
  const has = kind === "clothes" ? S?.owned?.includes(item.id) : S?.gifts?.includes(item.id);
  const wearing = kind === "clothes" && S?.worn === item.id;
  const canGift = S && !has && S.gold >= item.cost && !item.starter;
  const canWear = S && has && kind === "clothes";
  const img = item.img || "img/malfoy-3.jpg";
  return `<article class="closet-card">
    <img src="${img}" alt="">
    <div class="meta">
      <h3>${pack[0]} ${wearing ? "· " + t("wearing") : has ? "· " + t("owned") : ""}</h3>
      <p class="lede">${pack[1]}</p>
      <p class="lede">${item.starter ? t("owned") : item.cost + "g"}</p>
      <div class="row">
        ${item.starter ? "" : `<button class="btn ${canGift ? "primary" : ""}" data-gift="${kind}:${item.id}" ${canGift ? "" : "disabled"}>${has ? t("already") : t("gift")}</button>`}
        ${kind === "clothes" ? `<button class="btn ${canWear && !wearing ? "primary" : ""}" data-wear="${item.id}" ${canWear && !wearing ? "" : "disabled"}>${t("wear")}</button>` : ""}
      </div>
    </div>
  </article>`;
}

function renderCloset() {
  $("closet-title").textContent = t("closetH");
  $("closet-desc").textContent = S ? t("closetD") : t("noSaveCloset");
  if (S) $("closet-gold").textContent = `${t("gold")} ${S.gold}`;
  else $("closet-gold").textContent = "";
  $("closet-grid").innerHTML =
    CLOTHES.map((c) => cardHtml(c, "clothes")).join("") +
    GIFTS.map((g) => cardHtml(g, "gifts")).join("");
  $("closet-grid").querySelectorAll("[data-gift]").forEach((b) => {
    b.onclick = () => giftItem(b.dataset.gift);
  });
  $("closet-grid").querySelectorAll("[data-wear]").forEach((b) => {
    b.onclick = () => wearItem(b.dataset.wear);
  });
}

function giftItem(token) {
  const [kind, id] = token.split(":");
  const list = kind === "clothes" ? CLOTHES : GIFTS;
  const item = list.find((x) => x.id === id);
  if (!S || !item || item.starter) return;
  const bag = kind === "clothes" ? S.owned : S.gifts;
  if (bag.includes(id) || S.gold < item.cost) return;
  S.gold -= item.cost;
  bag.push(id);
  applyDelta({ grace: item.grace || 0, charm: item.charm || 0, pride: item.pride || 0, bond: item.bond || 0 });
  unlock(item.gallery);
  if (kind === "clothes") {
    S.worn = id;
    addLog(`${t("gift")} — ${t("clothes." + id)[0]}`);
  } else {
    addLog(`${t("gift")} — ${t("gifts." + id)[0]}`);
  }
  persist();
  renderCloset();
  renderMain();
}

function wearItem(id) {
  if (!S?.owned?.includes(id)) return;
  S.worn = id;
  const cloth = CLOTHES.find((c) => c.id === id);
  unlock(cloth?.gallery);
  addLog(`${t("wearOk")} — ${t("clothes." + id)[0]}`);
  persist();
  renderCloset();
  renderMain();
}

function openCloset() {
  renderCloset();
  show("closet");
}

function openGallery() {
  renderGallery();
  show("gallery");
}

function start(pc) {
  S = newState(pc);
  addLog(t("storyH"));
  persist();
  renderMain();
  show("main");
}

function bind() {
  $("lang").onchange = () => {
    lang = $("lang").value;
    localStorage.setItem("playmalfoy-lang", lang);
    applyLang();
    if (!$("gallery").classList.contains("hidden")) renderGallery();
  };
  $("age-yes").onclick = () => show("story");
  $("age-no").onclick = () => { location.href = "https://vibequant.cc/"; };
  $("to-pc").onclick = () => show("pc");
  $("btn-new").onclick = () => { localStorage.removeItem(KEY); S = null; show("pc"); };
  $("btn-load").onclick = () => {
    const raw = localStorage.getItem(KEY);
    if (!raw) return show("pc");
    S = migrate(JSON.parse(raw));
    renderMain();
    show("main");
  };
  $("btn-gallery").onclick = openGallery;
  $("btn-gallery-2")?.addEventListener("click", openGallery);
  $("btn-closet-2")?.addEventListener("click", openCloset);
  $("end-gal")?.addEventListener("click", openGallery);
  $("gal-back").onclick = () => show(S ? "main" : "story");
  $("closet-back").onclick = () => show(S ? "main" : "story");
  $("nav-closet").onclick = (e) => { e.preventDefault(); openCloset(); };
  $("again").onclick = () => { localStorage.removeItem(KEY); S = null; show("pc"); };
  document.querySelectorAll("[data-pc]").forEach((b) => { b.onclick = () => start(b.dataset.pc); });
}

bind();
applyLang();
if (localStorage.getItem(KEY)) $("btn-load").classList.remove("hidden");
show("gate");
