/**
 * Article share bar — X, Facebook, LinkedIn, copy link.
 * Expects .share-bar[data-url][data-title] in the DOM.
 */
(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function labels(lang) {
    const L = String(lang || "ko").toLowerCase();
    if (L.startsWith("en")) {
      return { share: "Share", copy: "Copy link", copied: "Copied" };
    }
    if (L.startsWith("ja")) {
      return { share: "共有", copy: "リンクをコピー", copied: "コピーしました" };
    }
    if (L.startsWith("zh")) {
      return { share: "分享", copy: "复制链接", copied: "已复制" };
    }
    return { share: "공유", copy: "링크 복사", copied: "복사됨" };
  }

  function toast(el, msg) {
    if (!el) return;
    const status = el.querySelector("[data-share-status]");
    if (!status) return;
    status.textContent = msg;
    status.hidden = false;
    clearTimeout(el._shareToast);
    el._shareToast = setTimeout(function () {
      status.hidden = true;
      status.textContent = "";
    }, 2200);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  ready(function () {
    var bars = document.querySelectorAll(".share-bar");
    bars.forEach(function (bar) {
      var url = bar.getAttribute("data-url") || location.href;
      var lang = bar.getAttribute("data-lang") || document.documentElement.lang || "ko";
      var L = labels(lang);

      var label = bar.querySelector(".share-label");
      if (label) label.textContent = L.share;
      var copyBtn = bar.querySelector('[data-share="copy"]');
      if (copyBtn) copyBtn.textContent = L.copy;

      bar.addEventListener("click", function (ev) {
        var btn = ev.target.closest('[data-share="copy"]');
        if (!btn || !bar.contains(btn)) return;
        ev.preventDefault();
        copyText(url).then(function () {
          toast(bar, L.copied);
        });
      });
    });
  });
})();
