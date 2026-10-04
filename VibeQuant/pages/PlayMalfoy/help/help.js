import { I18N } from "../js/i18n.js?v=4";
import { ENDING_LIST } from "../js/data.js?v=4";

const lang0 = localStorage.getItem("playmalfoy-lang") || (navigator.language || "ko").slice(0, 2);
let lang = ["ko", "en", "ja"].includes(lang0) ? lang0 : "ko";

const t = (k) => {
  const parts = k.split(".");
  let cur = I18N[lang];
  for (const p of parts) cur = cur?.[p];
  return cur ?? k;
};

function apply() {
  document.documentElement.lang = lang;
  document.title = `${t("helpTitle")} · ${t("title")}`;
  document.querySelectorAll("[data-i]").forEach((el) => {
    const val = t(el.getAttribute("data-i"));
    if (typeof val === "string") el.textContent = val;
  });
  document.getElementById("lang").value = lang;
  document.getElementById("end-list").innerHTML = ENDING_LIST.map((id) => {
    const pack = t("ends." + id);
    const hint = t("endsHint." + id);
    return `<li><strong>${pack[0]}</strong> — ${hint}</li>`;
  }).join("");
}

document.getElementById("lang").onchange = () => {
  lang = document.getElementById("lang").value;
  localStorage.setItem("playmalfoy-lang", lang);
  apply();
};
apply();
