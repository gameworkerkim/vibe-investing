#!/usr/bin/env python3
"""Post-deploy SEO regression checks for vibequant Pages hosts."""
from __future__ import annotations

import hashlib
import re
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REDIRECTS_MAP = ROOT / "content" / "redirects.map"
UA = "VibeQuant-SEO-Check/1.0 (+https://vibequant.cc)"

HOSTS = {
    "apex": "https://vibequant.cc",
    "docs": "https://docs.vibequant.cc",
    "tech": "https://tech.vibequant.cc",
    "cti": "https://cti.vibequant.cc",
}


def fetch(url: str, *, method: str = "GET", max_redirs: int = 0, timeout: int = 25):
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):  # noqa: ANN001
            return None

    handlers = []
    if max_redirs == 0:
        handlers.append(NoRedirect())
    opener = urllib.request.build_opener(*handlers)
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA})
    try:
        with opener.open(req, timeout=timeout) as res:
            body = res.read() if method == "GET" else b""
            return res.status, dict(res.headers), body, ""
    except urllib.error.HTTPError as e:
        body = e.read() if method == "GET" else b""
        loc = e.headers.get("Location", "")
        return e.code, dict(e.headers), body, loc
    except Exception as e:  # noqa: BLE001
        return 0, {}, b"", str(e)


def load_sitemap_urls(host: str) -> list[str]:
    url = f"{host}/sitemap.xml"
    code, _, body, err = fetch(url)
    if code != 200:
        raise RuntimeError(f"sitemap fetch failed {code} {url} {err}")
    # xmllint-equivalent parse
    root = ET.fromstring(body)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locs = [el.text.strip() for el in root.findall(".//sm:loc", ns) if el.text]
    if not locs:
        locs = [el.text.strip() for el in root.findall(".//{*}loc") if el.text]
    return locs


def load_redirects_map() -> list[tuple[str, str]]:
    if not REDIRECTS_MAP.exists():
        return []
    out = []
    for line in REDIRECTS_MAP.read_text(encoding="utf-8").splitlines():
        t = line.strip()
        if not t or t.startswith("#"):
            continue
        parts = re.split(r"\t+", t)
        if len(parts) < 2:
            continue
        out.append((parts[0].strip(), parts[1].strip()))
    return out


def host_for_path(path: str) -> str:
    if path.startswith("/columns"):
        return HOSTS["docs"]
    if path.startswith("/tech"):
        return HOSTS["tech"]
    if path.startswith("/cti"):
        return HOSTS["cti"]
    if path.startswith("/essays"):
        return HOSTS["apex"]
    return HOSTS["apex"]


def main() -> int:
    failures: list[str] = []

    print("== 1) sitemap XML parse + URL checks ==")
    all_urls: list[str] = []
    for name, host in HOSTS.items():
        if name == "apex":
            # apex sitemap is small; still validate
            pass
        try:
            urls = load_sitemap_urls(host)
        except Exception as e:  # noqa: BLE001
            failures.append(f"sitemap:{name}: {e}")
            continue
        print(f"  {name}: {len(urls)} urls")
        # no -jp/-zh
        bad_sfx = [u for u in urls if re.search(r"-(jp|zh)/?$", u)]
        for u in bad_sfx:
            failures.append(f"sitemap-jpzh: {u}")
        all_urls.extend(urls)

    print(f"== 2) sitemap URL status + body uniqueness ({len(all_urls)} urls) ==")
    bodies: dict[str, str] = {}

    def check_url(u: str):
        code, _, body, err = fetch(u)
        return u, code, body, err

    with ThreadPoolExecutor(max_workers=16) as ex:
        futs = [ex.submit(check_url, u) for u in all_urls]
        for fut in as_completed(futs):
            u, code, body, err = fut.result()
            if code != 200:
                failures.append(f"sitemap-status:{code} {u} {err}")
                continue
            h = hashlib.sha256(body).hexdigest()
            # Soft-404 signature: identical small hub HTML reused across many URLs.
            if len(body) < 16000 and h in bodies and bodies[h] != u:
                failures.append(f"body-dup: {bodies[h]} == {u}")
            elif h not in bodies:
                bodies[h] = u

    print("== 3) missing slug must 404 ==")
    probe = "https://cti.vibequant.cc/cti/cti-2026-0526-uk-russia-crypto-sanctions-xx/"
    code, _, _, _ = fetch(probe, max_redirs=0)
    if code != 404:
        failures.append(f"ghost-404-expected: got {code} for {probe}")

    print("== 4) redirects.map must 301 ==")
    for src, dst in load_redirects_map():
        url = host_for_path(src) + src
        code, hdrs, _, loc = fetch(url, max_redirs=0)
        if code != 301:
            failures.append(f"redirect:{code} {url} (want 301 → {dst})")
            continue
        # Location may be relative
        if loc and dst.rstrip("/") not in loc.rstrip("/"):
            # soft check — relative /tech/foo/ is ok
            if not loc.endswith(dst) and not loc.rstrip("/").endswith(dst.rstrip("/")):
                failures.append(f"redirect-target-mismatch: {url} → {loc} (expected {dst})")

    print("== 5) hreflang targets must 200 (sample denser on multilingual pages) ==")
    href_re = re.compile(
        r'rel=["\']alternate["\'][^>]*hreflang=["\']([^"\']+)["\'][^>]*href=["\']([^"\']+)["\']'
        r'|hreflang=["\']([^"\']+)["\'][^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']alternate["\']',
        re.I,
    )

    def hreflangs(html: str) -> list[tuple[str, str]]:
        out = []
        for m in href_re.finditer(html):
            if m.group(1):
                out.append((m.group(1), m.group(2)))
            else:
                out.append((m.group(3), m.group(4)))
        return out

    # Check a bounded sample + all pages that declare hreflang
    sample = all_urls
    href_targets: set[str] = set()
    page_alts: dict[str, set[str]] = {}

    def scan(u: str):
        code, _, body, _ = fetch(u)
        if code != 200:
            return u, []
        alts = hreflangs(body.decode("utf-8", "ignore"))
        return u, alts

    with ThreadPoolExecutor(max_workers=16) as ex:
        for fut in as_completed([ex.submit(scan, u) for u in sample]):
            u, alts = fut.result()
            if not alts:
                continue
            page_alts[u] = set()
            for lang, href in alts:
                href_targets.add(href)
                if lang != "x-default":
                    page_alts[u].add(href)

    with ThreadPoolExecutor(max_workers=16) as ex:
        futs = {ex.submit(fetch, t): t for t in href_targets}
        for fut in as_completed(futs):
            t = futs[fut]
            code, _, _, _ = fut.result()
            if code != 200:
                failures.append(f"hreflang-target:{code} {t}")

    # reciprocal: if A→B then B→A
    for a, targets in page_alts.items():
        for b in targets:
            if b == a:
                continue
            back = page_alts.get(b)
            if back is None:
                # B may not have been in sitemap sample with alts parsed — fetch
                _, _, body, _ = fetch(b)
                back = {h for _, h in hreflangs(body.decode("utf-8", "ignore")) if _ != "x-default"}
                page_alts[b] = back
            if a not in back:
                failures.append(f"hreflang-asymmetric: {a} → {b} but not reciprocal")

    if failures:
        print("\nFAILED:")
        for f in failures:
            print(" -", f)
        print(f"\n{len(failures)} failure(s)")
        return 1
    print("\nPASS: all SEO checks")
    return 0


if __name__ == "__main__":
    sys.exit(main())
