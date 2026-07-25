(() => {
  const q = document.getElementById("col-search");
  const g = document.getElementById("col-group");
  const sortEl = document.getElementById("col-sort");
  const root = document.getElementById("col-root");
  const count = document.getElementById("col-count");
  const flatSec = document.getElementById("sort-flat-section");
  const flatGrid = document.getElementById("sort-flat");
  const flatLabel = document.getElementById("sort-flat-label");
  if (!q || !root) return;
  const sections = [...root.querySelectorAll("[data-group-section]")];
  const mainCards = [...root.querySelectorAll("[data-group-section] .col-card")];
  const feat = document.getElementById("featured-section");
  const featCards = feat ? [...feat.querySelectorAll(".col-card")] : [];
  const allFilterCards = [...mainCards, ...featCards];
  const langBtns = [...document.querySelectorAll("[data-lang-btn]")];
  const LANG_KEY = "vq-content-lang";
  const SORT_KEY = "vq-catalog-sort:" + location.pathname;
  const hasLangFilter = langBtns.length > 0;

  function browserLang() {
    const nav = (navigator.language || navigator.userLanguage || "ko").toLowerCase();
    if (nav.startsWith("ko")) return "KR";
    if (nav.startsWith("ja")) return "JP";
    if (nav.startsWith("zh")) return "CN";
    if (nav.startsWith("en")) return "EN";
    return "KR";
  }

  function tokens(s) {
    return (s || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  }

  let lang = hasLangFilter
    ? (localStorage.getItem(LANG_KEY) || localStorage.getItem("vq-cti-lang") || browserLang())
    : "";
  if (hasLangFilter && !["KR", "EN", "JP", "CN"].includes(lang)) lang = browserLang();

  function sortMode() {
    const v = (sortEl && sortEl.value) || "group";
    return v === "date" || v === "featured" ? v : "group";
  }

  function matchCard(card, termTokens, group, langFilter) {
    const okG = !group || card.dataset.group === group;
    if (!okG) return false;
    if (langFilter && card.dataset.lang && card.dataset.lang !== langFilter) return false;
    if (!termTokens.length) return true;
    const hay = card.dataset.search || "";
    return termTokens.every((t) => hay.includes(t));
  }

  function setLangUi() {
    for (const btn of langBtns) {
      const on = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function compareCards(a, b, mode) {
    if (mode === "featured") {
      const fa = a.dataset.featured === "1" ? 0 : 1;
      const fb = b.dataset.featured === "1" ? 0 : 1;
      if (fa !== fb) return fa - fb;
      const ra = Number(a.dataset.featuredRank || 999);
      const rb = Number(b.dataset.featuredRank || 999);
      if (ra !== rb) return ra - rb;
    }
    const da = a.dataset.date || "";
    const db = b.dataset.date || "";
    if (da && db && da !== db) return db.localeCompare(da);
    if (da && !db) return -1;
    if (!da && db) return 1;
    const ta = (a.querySelector(".col-title") && a.querySelector(".col-title").textContent) || "";
    const tb = (b.querySelector(".col-title") && b.querySelector(".col-title").textContent) || "";
    return ta.localeCompare(tb, "ko");
  }

  function setSectionVisible(el, show) {
    if (!el) return;
    el.classList.toggle("is-hidden", !show);
    el.hidden = !show;
    el.style.display = show ? "" : "none";
  }

  function apply() {
    const termTokens = tokens(q.value);
    const group = (g && g.value) || "";
    const langFilter = hasLangFilter ? lang : "";
    const mode = sortMode();
    const pool = langFilter
      ? mainCards.filter((c) => !c.dataset.lang || c.dataset.lang === langFilter)
      : mainCards;

    for (const c of allFilterCards) {
      const show = matchCard(c, termTokens, group, langFilter);
      c.classList.toggle("is-hidden", !show);
      c.hidden = !show;
      c.style.display = show ? "" : "none";
    }

    let n = 0;
    if (mode === "group") {
      setSectionVisible(flatSec, false);
      if (flatGrid) flatGrid.innerHTML = "";
      for (const sec of sections) {
        const gid = sec.dataset.groupSection;
        const visibleInSec = mainCards.filter(
          (c) => c.dataset.group === gid && !c.classList.contains("is-hidden")
        );
        setSectionVisible(sec, visibleInSec.length > 0);
        const cnt = sec.querySelector(".section-count");
        if (cnt) cnt.textContent = "(" + visibleInSec.length + ")";
        n += visibleInSec.length;
      }
      if (feat) {
        const anyFeat = featCards.some((c) => !c.classList.contains("is-hidden"));
        setSectionVisible(feat, anyFeat);
      }
    } else {
      setSectionVisible(feat, false);
      for (const sec of sections) setSectionVisible(sec, false);
      const visible = mainCards.filter((c) => !c.classList.contains("is-hidden"));
      const sorted = visible.slice().sort((a, b) => compareCards(a, b, mode));
      n = sorted.length;
      if (flatSec && flatGrid) {
        setSectionVisible(flatSec, n > 0);
        if (flatLabel) {
          flatLabel.textContent = mode === "featured" ? "추천순" : "날짜순 (최신)";
        }
        flatGrid.innerHTML = "";
        for (const c of sorted) flatGrid.appendChild(c.cloneNode(true));
      }
    }

    if (count) count.textContent = n + " / " + pool.length + " shown";
  }

  if (sortEl) {
    const saved = localStorage.getItem(SORT_KEY);
    if (saved === "date" || saved === "featured" || saved === "group") sortEl.value = saved;
    sortEl.addEventListener("change", () => {
      localStorage.setItem(SORT_KEY, sortMode());
      apply();
    });
  }
  q.addEventListener("input", apply);
  q.addEventListener("search", apply);
  g?.addEventListener("change", apply);
  for (const btn of langBtns) {
    btn.addEventListener("click", () => {
      lang = btn.dataset.lang;
      localStorage.setItem(LANG_KEY, lang);
      setLangUi();
      apply();
    });
  }
  setLangUi();
  apply();
})();
