/**
 * Host-based routing for vibequant.cc (free tier, single Pages project).
 * docs → /columns · tech → /tech · play → /play · www → apex
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const host = url.hostname.toLowerCase();
  const path = url.pathname;

  if (host === "www.vibequant.cc") {
    url.hostname = "vibequant.cc";
    return Response.redirect(url.toString(), 301);
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

  if (host === "play.vibequant.cc") {
    if (path === "/" || path === "") {
      return Response.redirect(`${url.origin}/play/`, 302);
    }
  }

  if (host === "vibequant.cc") {
    if (path === "/columns" || path.startsWith("/columns/")) {
      url.hostname = "docs.vibequant.cc";
      return Response.redirect(url.toString(), 301);
    }
    if (path === "/tech" || path.startsWith("/tech/")) {
      url.hostname = "tech.vibequant.cc";
      return Response.redirect(url.toString(), 301);
    }
    if (path === "/play" || path.startsWith("/play/")) {
      url.hostname = "play.vibequant.cc";
      return Response.redirect(url.toString(), 301);
    }
  }

  return context.next();
}
