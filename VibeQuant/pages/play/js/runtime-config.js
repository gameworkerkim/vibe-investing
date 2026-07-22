/* Playground runtime — prefer custom API domain, fallback to workers.dev */
window.RUNTIME_CONFIG = {
  "VIBEQUANT_API_BASE": "https://api.vibequant.cc",
  "VIBEQUANT_CDN_BASE": "https://api.vibequant.cc/cdn"
};
window.VIBEQUANT_API_BASE = window.RUNTIME_CONFIG.VIBEQUANT_API_BASE;
window.VIBEQUANT_CDN_BASE = window.RUNTIME_CONFIG.VIBEQUANT_CDN_BASE;
