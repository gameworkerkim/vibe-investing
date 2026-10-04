import { I18N } from "./i18n.js?v=11";
import {
  ACTIVITIES, ADVENTURE_POOLS, CATEGORIES, CLOTHES, GALLERY, GIFTS, MONTHS, STATS, clamp,
  compactLevel, dateFromTurn, migrate, newState, portraitStage, pickEnding,
} from "./data.js?v=11";

const KEY = "playmalfoy-v1";
const API = "/api/playmalfoy";
const GAME_URL = "https://vibequant.cc/PlayMalfoy/";
const $ = (id) => document.getElementById(id);
const lang0 = localStorage.getItem("playmalfoy-lang") || (navigator.language || "ko").slice(0, 2);
let lang = ["ko", "en", "ja"].includes(lang0) ? lang0 : "ko";
let S = null;
let lastScreen = "gate";
let selectedCat = "study";
let lastEndingId = null;
let selectedRating = 0;

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
  if ($("rate-name")) $("rate-name").placeholder = t("rateNamePh");
  if ($("rate-comment")) $("rate-comment").placeholder = t("rateCommentPh");
  if (S) renderMain();
  if ($("closet") && !$("closet").classList.contains("hidden")) renderCloset();
  if ($("board") && !$("board").classList.contains("hidden")) renderBoard();
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
  if (id === "dateHarry") return S.pc === "harry" ? { bond: 6, charm: 2 } : { charm: 2, bond: 1 };
  if (id === "dateRon") return S.pc === "ron" ? { bond: 6, charm: 2 } : { charm: 3 };
  if (id === "dateHermione") return S.pc === "hermione" ? { intellect: 4, bond: 3 } : { intellect: 2, bond: 1 };
  if (id === "therapy") return S.pc === "hermione" ? { intellect: 1, stress: -2 } : {};
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
  const lv = compactLevel(S.turn);
  $("hud-date").textContent = `${d.year}.${String(d.month).padStart(2, "0")} · ${d.age}${t("age")} · ${t("compact")} ${lv}`;
  $("hud-gold").textContent = `${t("gold")} ${S.gold}`;
  $("hud-stress").textContent = `${t("stress")} ${S.stress}`;
  swapPortrait();
  $("stats").innerHTML = STATS.map((k) => {
    const v = S[k];
    return `<div class="stat"><span>${t("stats." + k)}</span><div class="bar"><i style="width:${Math.min(100, v)}%"></i></div><b>${v}</b></div>`;
  }).join("") + `<div class="stat"><span>${t("stress")}</span><div class="bar stress"><i style="width:${S.stress}%"></i></div><b>${S.stress}</b></div>`;
  $("log").innerHTML = `<strong>${t("logH")}</strong><div>${(S.log || []).map((x) => `<div>${x}</div>`).join("")}</div>`;
  renderAdvice();
  renderMenu();
}

function swapPortrait() {
  const img = $("portrait");
  img.src = portraitSrc();
  img.classList.remove("swap");
  void img.offsetWidth;
  img.classList.add("swap");
}

function adviceFor() {
  const d = dateFromTurn(S.turn);
  if (S.stress >= 80) return t("advice.ill");
  if (S.stamina < 22) return t("advice.rest");
  if (S.stress >= 55) return t("advice.stress");
  if (d.month === 11 || d.month === 12) return t("advice.ball");
  if (S.gold < 30) return t("advice.gold");
  if (S.bond < 30) return t("advice.bond");
  if (S.grace < 20) return t("advice.grace");
  if (S.charm < 25) return t("advice.charm");
  if (S.magic < 55) return t("advice.magic");
  if (S.morality < 20) return t("advice.morality");
  if (S.intellect < 45) return t("advice.intellect");
  if (compactLevel(S.turn) === 1 && S.turn >= 8) return t("advice.level");
  return t("advice.fine");
}

function renderAdvice() {
  $("advisor-msg").textContent = adviceFor();
}

function renderMenu() {
  const sick = S.stress >= 80;
  const lv = compactLevel(S.turn);
  if (sick) selectedCat = "rest";
  $("menu-bar").innerHTML = CATEGORIES.map((c) => {
    const on = c.id === selectedCat;
    return `<button class="menu-btn ${on ? "active" : ""}" data-cat="${c.id}">
      <span class="mi">${c.icon}</span><span>${t("cat." + c.id)}</span>
    </button>`;
  }).join("");
  $("menu-bar").querySelectorAll("[data-cat]").forEach((b) => {
    b.onclick = () => { selectedCat = b.dataset.cat; renderMenu(); };
  });
  const acts = ACTIVITIES.filter((a) => a.cat === selectedCat);
  $("acts").innerHTML = acts.map((a) => {
    const name = t("act." + a.id);
    const need = a.minLevel || 1;
    const levelLocked = need > lv;
    const locked = levelLocked || S.gold < a.cost || (sick && a.cat !== "rest");
    const costLine = a.cost ? `${a.cost}g` : `+${a.gold || 0}g`;
    const extra = levelLocked ? t("unlockAt").replace("{n}", need) : costLine;
    const badge = levelLocked ? `<span class="lock-badge">${t("lvlLock")}</span>` : "";
    return `<button class="act ${levelLocked ? "lv-locked" : ""}" data-act="${a.id}" ${locked ? "disabled" : ""}>
      ${badge}
      <strong>${name[0]}</strong>
      <small>${name[1]} · ${extra}</small>
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

async function doAct(id) {
  const a = ACTIVITIES.find((x) => x.id === id);
  const lv = compactLevel(S.turn);
  if (!a || S.gold < a.cost || (a.minLevel || 1) > lv) return;
  const nm = t("act." + id);
  await playTransition(nm[0], nm[1]);
  S.gold -= a.cost;
  applyDelta({ ...a, gold: a.gold });
  applyDelta(pcBonus(id));
  unlock(a.gallery);
  const played = dateFromTurn(S.turn);
  addLog(`${played.year}.${played.month} — ${nm[0]}`);
  if (S.stamina <= 0) {
    S.collapsed = true;
    addLog(t("collapsed"));
    return finish();
  }
  const prevLv = compactLevel(S.turn);
  S.turn += 1;
  const nextLv = compactLevel(S.turn);
  if (nextLv > prevLv) addLog(t("levelUp" + nextLv));
  persist();
  if (a.adventure) return void runAdventure(a);
  const forced = seasonal(played.month);
  if (forced) return void runEvent(forced);
  if (Math.random() < 0.42) return void runEvent(randomEvent());
  if (a.gallery) {
    const g = GALLERY.find((x) => x.id === a.gallery);
    if (g) return void openEvent(`<p>${nm[1]}</p>`, g.img);
  }
  if (S.turn >= MONTHS) return finish();
  renderMain();
}

function runAdventure(a) {
  const pool = ADVENTURE_POOLS[a?.pool || "forest"] || ADVENTURE_POOLS.forest;
  const adv = pool[Math.floor(Math.random() * pool.length)];
  if (adv.gal) unlock(adv.gal);
  if (adv.d) applyDelta(adv.d);
  addLog(t(adv.key));
  openEvent(`<p>${t(adv.key)}</p>`, adv.img);
}

function playTransition(title, sub) {
  return new Promise((res) => {
    $("transition-title").textContent = title;
    $("transition-sub").textContent = sub;
    const el = $("transition");
    el.classList.remove("hidden", "run");
    void el.offsetWidth;
    el.classList.add("run");
    setTimeout(() => {
      el.classList.add("hidden");
      el.classList.remove("run");
      res();
    }, 1050);
  });
}

function finish() {
  const id = pickEnding(S);
  unlock(`malfoy-${portraitStage(S.grace)}`);
  persist();
  const pack = t("ends." + id);
  $("end-art").src = portraitSrc();
  $("end-title").textContent = pack[0];
  $("end-body").textContent = pack[1];
  resetRateForm(id, pack[0]);
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
  const tone = item.tone ? `<span class="tone tone-${item.tone}">${t("tone." + item.tone)}</span>` : "";
  return `<article class="closet-card">
    <img src="${img}" alt="">
    <div class="meta">
      <h3>${pack[0]} ${wearing ? "· " + t("wearing") : has ? "· " + t("owned") : ""} ${tone}</h3>
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
  $("closet-grid").innerHTML = [
    { title: t("tone.modest"), items: CLOTHES.filter((c) => c.tone === "modest"), kind: "clothes" },
    { title: t("tone.mid"), items: CLOTHES.filter((c) => c.tone === "mid"), kind: "clothes" },
    { title: t("tone.bold"), items: CLOTHES.filter((c) => c.tone === "bold"), kind: "clothes" },
    { title: t("tone.gifts"), items: GIFTS, kind: "gifts" },
  ].map((g) => `<h2 class="closet-sec">${g.title}</h2>` + g.items.map((i) => cardHtml(i, g.kind)).join("")).join("");
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
  applyDelta({
    grace: item.grace || 0,
    charm: item.charm || 0,
    pride: item.pride || 0,
    bond: item.bond || 0,
    morality: item.morality || 0,
    intellect: item.intellect || 0,
  });
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
  trackPlay();
}

function getUid() {
  let u = localStorage.getItem("playmalfoy-uid");
  if (!u) {
    u = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
    localStorage.setItem("playmalfoy-uid", u);
  }
  return u;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function toast(msg) {
  const el = $("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add("hidden"), 1800);
}

function renderCounts(s) {
  const el = $("play-count");
  if (!el) return;
  el.textContent = `${t("todayPlay")} ${s.today} · ${t("totalPlayer")} ${s.total}`;
}

async function loadStats() {
  try {
    const r = await fetch(`${API}/stats`);
    const s = await r.json();
    renderCounts(s);
  } catch {
    /* ignore */
  }
}

function trackPlay() {
  fetch(`${API}/play`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ uid: getUid() }),
  })
    .then((r) => r.json())
    .then(renderCounts)
    .catch(() => {});
}

function shareText() {
  if (lastEndingId) return `${t("title")} — ${t("ends." + lastEndingId)[0]}. ${t("shareBody")}`;
  return `${t("title")} — ${t("shareBody")}`;
}

function toggleShareMenu() {
  $("share-menu").classList.toggle("hidden");
}

function shareTo(kind) {
  $("share-menu").classList.add("hidden");
  const text = encodeURIComponent(shareText());
  const url = encodeURIComponent(GAME_URL);
  if (kind === "x") {
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,width=600,height=480");
  } else if (kind === "threads") {
    window.open(`https://www.threads.net/intent/post?text=${text}%20${url}`, "_blank", "noopener,width=600,height=600");
  } else if (kind === "copy") {
    (navigator.clipboard ? navigator.clipboard.writeText(`${shareText()} ${GAME_URL}`) : Promise.reject())
      .then(() => toast(t("shareCopied")))
      .catch(() => {});
  } else if (kind === "native" && navigator.share) {
    navigator.share({ title: t("title"), text: shareText(), url: GAME_URL }).catch(() => {});
  }
}

function openBoard() {
  renderBoard();
  show("board");
}

async function renderBoard() {
  const listEl = $("board-list");
  listEl.innerHTML = `<p class="lede">${t("loading")}</p>`;
  let list = [];
  try {
    const r = await fetch(`${API}/leaderboard`);
    const data = await r.json();
    list = data.list || [];
  } catch {
    list = [];
  }
  listEl.innerHTML = list.length
    ? list.map(entryHtml).join("")
    : `<p class="lede">${t("boardEmpty")}</p>`;
}

function entryHtml(e) {
  const stars = "★".repeat(e.rating || 0) + "☆".repeat(5 - (e.rating || 0));
  const endingName = e.ending && t("ends." + e.ending) ? t("ends." + e.ending)[0] : "";
  const date = e.at ? new Date(e.at).toISOString().slice(0, 10) : "";
  return `<div class="board-item">
    <div class="board-top">
      <span class="board-stars">${stars}</span>
      <span class="board-name">${escapeHtml(e.name || "")}</span>
    </div>
    ${endingName ? `<span class="board-ending">${escapeHtml(endingName)}</span>` : ""}
    ${e.comment ? `<p class="board-comment">${escapeHtml(e.comment)}</p>` : ""}
    ${date ? `<span class="board-date">${date}</span>` : ""}
  </div>`;
}

function resetRateForm(endingId, endingName) {
  lastEndingId = endingId;
  selectedRating = 0;
  if ($("rate-ending")) $("rate-ending").textContent = endingName;
  if ($("rate-name")) $("rate-name").value = "";
  if ($("rate-comment")) $("rate-comment").value = "";
  if ($("rate-form")) $("rate-form").classList.remove("hidden");
  if ($("rate-thanks")) $("rate-thanks").classList.add("hidden");
  renderStars();
}

function renderStars() {
  document.querySelectorAll("#rate-stars .star").forEach((b) => {
    b.classList.toggle("on", Number(b.dataset.star) <= selectedRating);
  });
}

async function submitRating() {
  if (!selectedRating) return toast(t("rateNeedStar"));
  const btn = $("rate-submit");
  btn.disabled = true;
  try {
    const r = await fetch(`${API}/rating`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: $("rate-name").value.trim(),
        comment: $("rate-comment").value.trim(),
        rating: selectedRating,
        ending: lastEndingId,
      }),
    });
    if (!r.ok) throw new Error("fail");
    $("rate-form").classList.add("hidden");
    $("rate-thanks").classList.remove("hidden");
  } catch {
    toast(t("rateFail"));
  } finally {
    btn.disabled = false;
  }
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
  $("nav-board").onclick = (e) => { e.preventDefault(); openBoard(); };
  $("again").onclick = () => { localStorage.removeItem(KEY); S = null; show("pc"); };
  document.querySelectorAll("[data-pc]").forEach((b) => { b.onclick = () => start(b.dataset.pc); });
  $("btn-share").onclick = (e) => { e.stopPropagation(); toggleShareMenu(); };
  $("btn-share-2")?.addEventListener("click", (e) => { e.stopPropagation(); toggleShareMenu(); });
  $("end-share")?.addEventListener("click", (e) => { e.stopPropagation(); toggleShareMenu(); });
  $("share-menu").querySelectorAll("[data-share]").forEach((b) => { b.onclick = () => shareTo(b.dataset.share); });
  document.addEventListener("click", () => $("share-menu").classList.add("hidden"));
  if (navigator.share) $("share-native")?.classList.remove("hidden");
  $("btn-board-2")?.addEventListener("click", openBoard);
  $("end-board")?.addEventListener("click", openBoard);
  $("board-back").onclick = () => show(S ? "main" : "story");
  $("rate-submit").onclick = submitRating;
  document.querySelectorAll("#rate-stars .star").forEach((b) => {
    b.onclick = () => { selectedRating = Number(b.dataset.star); renderStars(); };
  });
}

bind();
applyLang();
if (localStorage.getItem(KEY)) $("btn-load").classList.remove("hidden");
show("gate");
loadStats();
