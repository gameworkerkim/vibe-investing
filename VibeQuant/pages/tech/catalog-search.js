(() => {
  const q = document.getElementById("col-search");
  const g = document.getElementById("col-group");
  const root = document.getElementById("col-root");
  const count = document.getElementById("col-count");
  if (!q || !root) return;
  const cards = [...root.querySelectorAll(".col-card")];
  const sections = [...root.querySelectorAll("[data-group-section]")];

  function tokens(s) {
    return (s || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  }

  function matchCard(card, termTokens, group) {
    const okG = !group || card.dataset.group === group;
    if (!okG) return false;
    if (!termTokens.length) return true;
    const hay = card.dataset.search || "";
    return termTokens.every((t) => hay.includes(t));
  }

  function apply() {
    const termTokens = tokens(q.value);
    const group = (g && g.value) || "";
    const mainCards = cards.filter((c) => !c.closest("#featured-section"));
    let n = 0;
    for (const c of cards) {
      const show = matchCard(c, termTokens, group);
      c.classList.toggle("is-hidden", !show);
      c.hidden = !show;
      c.style.display = show ? "" : "none";
      if (show && !c.closest("#featured-section")) n++;
    }
    for (const sec of sections) {
      const gid = sec.dataset.groupSection;
      const any = cards.some(
        (c) =>
          !c.closest("#featured-section") &&
          c.dataset.group === gid &&
          !c.classList.contains("is-hidden")
      );
      sec.classList.toggle("is-hidden", !any);
      sec.hidden = !any;
      sec.style.display = any ? "" : "none";
    }
    const feat = document.getElementById("featured-section");
    if (feat) {
      const featCards = [...feat.querySelectorAll(".col-card")];
      const anyFeat = featCards.some((c) => !c.classList.contains("is-hidden"));
      if (termTokens.length || group) {
        feat.classList.toggle("is-hidden", !anyFeat);
        feat.hidden = !anyFeat;
        feat.style.display = anyFeat ? "" : "none";
      } else {
        feat.classList.remove("is-hidden");
        feat.hidden = false;
        feat.style.display = "";
      }
    }
    if (count) count.textContent = n + " / " + mainCards.length + " shown";
  }

  q.addEventListener("input", apply);
  q.addEventListener("search", apply);
  g?.addEventListener("change", apply);
  apply();
})();
