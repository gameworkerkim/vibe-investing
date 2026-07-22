(() => {
  const q = document.getElementById("col-search");
  const g = document.getElementById("col-group");
  const root = document.getElementById("col-root");
  const count = document.getElementById("col-count");
  if (!q || !root) return;
  const cards = [...root.querySelectorAll(".col-card")];
  const sections = [...root.querySelectorAll("[data-group-section]")];
  const langBtns = [...document.querySelectorAll("[data-lang-btn]")];
  const LANG_KEY = "vq-cti-lang";
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

  let lang = hasLangFilter ? (localStorage.getItem(LANG_KEY) || browserLang()) : "";
  if (hasLangFilter && !["KR", "EN", "JP", "CN"].includes(lang)) lang = browserLang();

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

  function apply() {
    const termTokens = tokens(q.value);
    const group = (g && g.value) || "";
    const langFilter = hasLangFilter ? lang : "";
    const mainCards = cards.filter((c) => !c.closest("#featured-section"));
    const pool = langFilter
      ? mainCards.filter((c) => !c.dataset.lang || c.dataset.lang === langFilter)
      : mainCards;
    let n = 0;
    for (const c of cards) {
      const show = matchCard(c, termTokens, group, langFilter);
      c.classList.toggle("is-hidden", !show);
      c.hidden = !show;
      c.style.display = show ? "" : "none";
      if (show && !c.closest("#featured-section")) n++;
    }
    for (const sec of sections) {
      const gid = sec.dataset.groupSection;
      const visibleInSec = cards.filter(
        (c) =>
          !c.closest("#featured-section") &&
          c.dataset.group === gid &&
          !c.classList.contains("is-hidden")
      );
      const any = visibleInSec.length > 0;
      sec.classList.toggle("is-hidden", !any);
      sec.hidden = !any;
      sec.style.display = any ? "" : "none";
      const cnt = sec.querySelector(".section-count");
      if (cnt) cnt.textContent = "(" + visibleInSec.length + ")";
    }
    const feat = document.getElementById("featured-section");
    if (feat) {
      const featCards = [...feat.querySelectorAll(".col-card")];
      const anyFeat = featCards.some((c) => !c.classList.contains("is-hidden"));
      const filtering = termTokens.length || group || (hasLangFilter && lang !== "KR");
      if (filtering) {
        feat.classList.toggle("is-hidden", !anyFeat);
        feat.hidden = !anyFeat;
        feat.style.display = anyFeat ? "" : "none";
      } else {
        feat.classList.toggle("is-hidden", !anyFeat);
        feat.hidden = !anyFeat;
        feat.style.display = anyFeat ? "" : "none";
      }
    }
    if (count) count.textContent = n + " / " + pool.length + " shown";
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
