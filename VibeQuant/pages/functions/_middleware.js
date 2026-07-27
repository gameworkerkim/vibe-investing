/**
 * Host-based routing for vibequant.cc (free tier, single Pages project).
 * docs → /columns · tech → /tech · cti → /cti · play → /play · essays → /essays
 * research → static /research/* + /api/research/* (no login)
 * lab → coming-soon until content exists
 *
 * SEO: Google requires same-host URLs in each sitemap. Per-host files live under
 * /sitemaps/*; this middleware serves them as /sitemap.xml and /robots.txt.
 */
const HOST_SEO = {
  "docs.vibequant.cc": { sitemap: "/sitemaps/docs.xml", robots: "/sitemaps/robots-docs.txt" },
  "tech.vibequant.cc": { sitemap: "/sitemaps/tech.xml", robots: "/sitemaps/robots-tech.txt" },
  "cti.vibequant.cc": { sitemap: "/sitemaps/cti.xml", robots: "/sitemaps/robots-cti.txt" },
  "play.vibequant.cc": { sitemap: "/sitemaps/play.xml", robots: "/sitemaps/robots-play.txt" },
};

async function serveAsset(context, assetPath, contentType, cacheControl) {
  const assetUrl = new URL(assetPath, context.request.url);
  const res = await context.env.ASSETS.fetch(assetUrl);
  if (!res.ok) return null;
  const headers = new Headers(res.headers);
  headers.set("content-type", contentType);
  if (cacheControl) headers.set("cache-control", cacheControl);
  return new Response(res.body, { status: 200, headers });
}

function comingSoonHtml(title) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — VibeQuant</title>
  <meta name="description" content="곧 연결할께요." />
  <meta name="robots" content="noindex" />
  <style>
    html,body{height:100%;margin:0}
    body{display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:system-ui,-apple-system,sans-serif;background:#0f0f14;color:#e8e8ed;
      text-align:center;padding:40px 24px}
    h1{font-size:clamp(1.6rem,5vw,2.2rem);font-weight:800;margin:0;letter-spacing:-0.02em}
    p{margin:18px 0 0;font-size:1.05rem;color:#9a9aa3}
    a{margin-top:28px;color:#8b7cf7;text-decoration:none;font-size:0.9rem}
    a:hover{text-decoration:underline}
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>곧 연결할께요.</p>
  <a href="https://vibequant.cc/">← VibeQuant</a>
</body>
</html>`;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();
  const path = url.pathname;

  if (host === "www.vibequant.cc") {
    url.hostname = "vibequant.cc";
    return Response.redirect(url.toString(), 301);
  }

  const hostSeo = HOST_SEO[host];
  if (hostSeo) {
    if (path === "/sitemap.xml") {
      const res = await serveAsset(
        context,
        hostSeo.sitemap,
        "application/xml; charset=utf-8",
        "public, max-age=3600"
      );
      if (res) return res;
    }
    if (path === "/robots.txt") {
      const res = await serveAsset(
        context,
        hostSeo.robots,
        "text/plain; charset=utf-8",
        "public, max-age=300, must-revalidate"
      );
      if (res) return res;
    }
  }

  if (host === "lab.vibequant.cc") {
    return new Response(comingSoonHtml("Lab"), {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60" },
    });
  }
  // Research subdomain → apex /research/ (APIs live on vibequant-web)
  if (host === "research.vibequant.cc") {
    const dest = new URL(url.toString());
    dest.hostname = "vibequant.cc";
    if (path === "/" || path === "") dest.pathname = "/research/";
    else if (!path.startsWith("/research") && !path.startsWith("/api/")) {
      dest.pathname = `/research${path.startsWith("/") ? path : `/${path}`}`;
    }
    return Response.redirect(dest.toString(), 302);
  }

  if (host === "docs.vibequant.cc") {
    if (path === "/" || path === "") {
      return Response.redirect(`${url.origin}/columns/`, 302);
    }
  }

  if (host === "tech.vibequant.cc") {
    if (path === "/" || path === "") {
      return Response.redirect(`${url.origin}/tech/`, 302);
    }
  }

  if (host === "cti.vibequant.cc") {
    if (path === "/" || path === "") {
      return Response.redirect(`${url.origin}/cti/`, 302);
    }
  }

  if (host === "play.vibequant.cc") {
    if (path === "/" || path === "") {
      return Response.redirect(`${url.origin}/play/`, 302);
    }
  }

  if (host === "essays.vibequant.cc") {
    // Prefer apex until this host is attached to vibequant-web (avoids 522)
    const dest = new URL(url.toString());
    dest.hostname = "vibequant.cc";
    if (path === "/" || path === "") dest.pathname = "/essays/";
    return Response.redirect(dest.toString(), 302);
  }

  if (host === "vibequant.cc") {
    if (path === "/lab" || path === "/lab/" || path.startsWith("/lab/")) {
      return new Response(comingSoonHtml("Lab"), {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60" },
      });
    }
    // /research/* served from pages/research (static) + /api/research/* Functions

    if (path === "/columns" || path.startsWith("/columns/")) {
      url.hostname = "docs.vibequant.cc";
      return Response.redirect(url.toString(), 301);
    }
    if (path === "/tech" || path.startsWith("/tech/")) {
      url.hostname = "tech.vibequant.cc";
      return Response.redirect(url.toString(), 301);
    }
    if (path === "/cti" || path.startsWith("/cti/")) {
      url.hostname = "cti.vibequant.cc";
      return Response.redirect(url.toString(), 301);
    }
    if (path === "/play" || path.startsWith("/play/")) {
      url.hostname = "play.vibequant.cc";
      return Response.redirect(url.toString(), 301);
    }
    // essays stay on apex (vibequant.cc/essays/) until essays.vibequant.cc is attached
  }

  return context.next();
}
