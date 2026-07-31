/**
 * Article share bar — X, Facebook, LinkedIn, KakaoTalk, copy link.
 * Expects .share-bar[data-url][data-title] in the DOM.
 * Optional: set window.__VQ_KAKAO_JS_KEY before this script to enable Kakao SDK share.
 */
(function () {
  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function labels(lang) {
    const L = String(lang || "ko").toLowerCase();
    if (L.startsWith("en")) {
      return { share: "Share", copy: "Copy link", copied: "Copied", kakaoHint: "Link copied — paste it in KakaoTalk" };
    }
    if (L.startsWith("ja")) {
      return { share: "共有", copy: "リンクをコピー", copied: "コピーしました", kakaoHint: "リンクをコピーしました。カカオトークに貼り付けて共有してください" };
    }
    if (L.startsWith("zh")) {
      return { share: "分享", copy: "复制链接", copied: "已复制", kakaoHint: "链接已复制，请粘贴到 KakaoTalk 分享" };
    }
    return { share: "공유", copy: "링크 복사", copied: "복사됨", kakaoHint: "링크를 복사했습니다. 카카오톡에 붙여넣어 공유하세요" };
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

  function loadKakao(jsKey) {
    return new Promise(function (resolve) {
      if (!jsKey) return resolve(null);
      if (window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized()) return resolve(window.Kakao);
      function init() {
        try {
          if (!window.Kakao.isInitialized()) window.Kakao.init(jsKey);
          resolve(window.Kakao);
        } catch (e) {
          resolve(null);
        }
      }
      if (window.Kakao) return init();
      var s = document.createElement("script");
      s.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
      s.crossOrigin = "anonymous";
      s.onload = init;
      s.onerror = function () {
        resolve(null);
      };
      document.head.appendChild(s);
    });
  }

  async function shareKakao(bar, url, title, text) {
    var key = window.__VQ_KAKAO_JS_KEY || "";
    var Kakao = await loadKakao(key);
    if (Kakao && Kakao.Share) {
      try {
        Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: title || document.title,
            description: text || "",
            imageUrl: "https://vibequant.cc/og-default.png",
            link: { mobileWebUrl: url, webUrl: url },
          },
          buttons: [{ title: "자세히 보기", link: { mobileWebUrl: url, webUrl: url } }],
        });
        return;
      } catch (e) {
        /* fall through */
      }
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: title || document.title, text: text || "", url: url });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return;
      }
    }
    await copyText(url);
    toast(bar, labels(bar.getAttribute("data-lang")).kakaoHint);
  }

  ready(function () {
    var bars = document.querySelectorAll(".share-bar");
    bars.forEach(function (bar) {
      var url = bar.getAttribute("data-url") || location.href;
      var title = bar.getAttribute("data-title") || document.title;
      var text = bar.getAttribute("data-text") || "";
      var lang = bar.getAttribute("data-lang") || document.documentElement.lang || "ko";
      var L = labels(lang);

      var label = bar.querySelector(".share-label");
      if (label) label.textContent = L.share;
      var copyBtn = bar.querySelector('[data-share="copy"]');
      if (copyBtn) copyBtn.textContent = L.copy;

      bar.addEventListener("click", function (ev) {
        var btn = ev.target.closest("[data-share]");
        if (!btn || !bar.contains(btn)) return;
        var kind = btn.getAttribute("data-share");
        if (kind === "copy") {
          ev.preventDefault();
          copyText(url).then(function () {
            toast(bar, L.copied);
          });
          return;
        }
        if (kind === "kakao") {
          ev.preventDefault();
          shareKakao(bar, url, title, text);
        }
      });
    });
  });
})();
