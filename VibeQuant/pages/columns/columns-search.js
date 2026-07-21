(() => {
  const q = document.getElementById("col-search");
  const g = document.getElementById("col-group");
  const grid = document.getElementById("col-grid");
  const count = document.getElementById("col-count");
  if (!q || !g || !grid) return;
  const cards = [...grid.querySelectorAll(".col-card")];
  function apply() {
    const term = (q.value || "").trim().toLowerCase();
    const group = g.value || "";
    let n = 0;
    for (const c of cards) {
      const okG = !group || c.dataset.group === group;
      const okQ = !term || (c.dataset.search || "").includes(term);
      const show = okG && okQ;
      c.hidden = !show;
      if (show) n++;
    }
    if (count) count.textContent = n + " / " + cards.length + " columns";
  }
  q.addEventListener("input", apply);
  g.addEventListener("change", apply);
  apply();
})();
