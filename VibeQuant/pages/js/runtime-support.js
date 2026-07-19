/** Detect browser limits that break Pyodide / WASM. */

export function detectRuntimeSupport() {
  const ua = navigator.userAgent || "";
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && (navigator.maxTouchPoints || 0) > 1);
  const hasWasm = typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function";
  let memoryHintMb = null;
  try {
    // Not available everywhere; Chrome/Edge may expose jsHeapSizeLimit
    const lim = performance?.memory?.jsHeapSizeLimit;
    if (lim) memoryHintMb = Math.round(lim / (1024 * 1024));
  } catch {
    /* ignore */
  }
  return {
    isIOS,
    hasWasm,
    memoryHintMb,
    ok: hasWasm,
  };
}

export function iosAdvice(lang) {
  if (lang === "ko") {
    return [
      "iOS Safari에서는 Pyodide(WASM) 메모리가 부족하거나 로드가 실패할 수 있습니다.",
      "가능하면 데스크톱 Chrome/Firefox에서 실행기를 사용하세요.",
      "시세 API는 그대로 동작합니다: Worker /api/v1/candles — 계산만 브라우저에서 제한됩니다.",
    ].join("\n");
  }
  if (lang === "zh") {
    return [
      "在 iOS Safari 上，Pyodide（WASM）可能因内存不足而加载失败。",
      "请尽量在桌面版 Chrome/Firefox 中使用运行器。",
      "行情 API 仍可用；仅浏览器内计算可能受限。",
    ].join("\n");
  }
  return [
    "On iOS Safari, Pyodide (WASM) may fail to load due to memory limits.",
    "Prefer desktop Chrome/Firefox for the runner.",
    "Market data via Worker still works; only in-browser compute is constrained.",
  ].join("\n");
}
