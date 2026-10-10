/** Serve the latest Engine ebook at the canonical /files URL, bypassing stale CDN HIT. */
const ORIGIN = "https://vibequant-web.pages.dev/files/engine-remembers-era.pdf";

export default {
  async fetch(request) {
    if (request.method === "HEAD" || request.method === "GET") {
      const res = await fetch(ORIGIN, {
        method: request.method,
        headers: { "user-agent": request.headers.get("user-agent") || "VibeQuant" },
        cf: { cacheTtl: 0, cacheEverything: false },
      });
      const headers = new Headers();
      headers.set("content-type", "application/pdf");
      headers.set("content-disposition", "inline; filename=\"engine-remembers-era.pdf\"");
      headers.set("cache-control", "public, max-age=60, must-revalidate");
      headers.set("cdn-cache-control", "no-cache");
      const len = res.headers.get("content-length");
      if (len) headers.set("content-length", len);
      return new Response(request.method === "HEAD" ? null : res.body, {
        status: res.status,
        headers,
      });
    }
    return new Response("Method Not Allowed", { status: 405 });
  },
};
