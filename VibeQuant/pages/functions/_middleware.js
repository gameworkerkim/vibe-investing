/**
 * Host-based routing for vibequant.cc (free tier, single Pages project).
 * docs → /columns · tech → /tech · cti → /cti · play → /play · essays → /essays
 * research → static /research/* + /api/research/* (no login)
 * lab → /lab (DART Monitor + TokenForge, static pages/lab)
 *
 * SEO: Google requires same-host URLs in each sitemap. Per-host files live under
 * /sitemaps/*; this middleware serves them as /sitemap.xml and /robots.txt.
 * (Static /sitemap.xml would otherwise be served to every custom domain.)
 */
const HOST_SEO = {
  "vibequant.cc": { sitemap: "/sitemaps/apex.xml", robots: "/robots.txt" },
  "docs.vibequant.cc": { sitemap: "/sitemaps/docs.xml", robots: "/sitemaps/robots-docs.txt" },
  "tech.vibequant.cc": { sitemap: "/sitemaps/tech.xml", robots: "/sitemaps/robots-tech.txt" },
  "cti.vibequant.cc": { sitemap: "/sitemaps/cti.xml", robots: "/sitemaps/robots-cti.txt" },
  "play.vibequant.cc": { sitemap: "/sitemaps/play.xml", robots: "/sitemaps/robots-play.txt" },
  "cyworld.vibequant.cc": { sitemap: "/sitemaps/cyworld.xml", robots: "/sitemaps/robots-cyworld.txt" },
};

async function serveAsset(context, assetPath, contentType, cacheControl) {
  const assetUrl = new URL(assetPath, context.request.url);
  const res = await context.env.ASSETS.fetch(assetUrl);
  if (!res.ok) return null;
  // Buffer + minimal headers so GSC gets clean XML (no inherited CORS / dup headers).
  const body = await res.arrayBuffer();
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": cacheControl,
      "x-content-type-options": "nosniff",
    },
  });
}

async function serveNotFound(context) {
  const assetUrl = new URL("/404.html", context.request.url);
  const res = await context.env.ASSETS.fetch(assetUrl);
  const body = res.ok ? await res.arrayBuffer() : new TextEncoder().encode("Not Found");
  return new Response(body, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=60",
      "x-content-type-options": "nosniff",
    },
  });
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
        "text/xml; charset=utf-8",
        "public, max-age=3600, no-transform"
      );
      if (res) return res;
    }
    if (path === "/robots.txt") {
      const res = await serveAsset(
        context,
        hostSeo.robots,
        "text/plain; charset=utf-8",
        "public, max-age=300, must-revalidate, no-transform"
      );
      if (res) return res;
    }
  }

  if (host === "lab.vibequant.cc") {
    const dest = new URL(url.toString());
    dest.hostname = "vibequant.cc";
    if (path === "/" || path === "") dest.pathname = "/lab/";
    else if (!path.startsWith("/lab")) {
      dest.pathname = `/lab${path.startsWith("/") ? path : `/${path}`}`;
    }
    return Response.redirect(dest.toString(), 302);
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

  if (host === "cyworld.vibequant.cc") {
    if (path === "/" || path === "") {
      return Response.redirect(`${url.origin}/cyworld/`, 302);
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

  // Article soft-404 prevention: rely on pages/404.html + _routes.json excluding
  // /columns|tech|cti|essays/* from Functions (CDN cache). Do not ASSETS.probe here —
  // that forced DYNAMIC on every document page.

  return context.next();
}
