#!/usr/bin/env node
/**
 * Resolve media URLs via Naver news search, fetch article bodies, rewrite markdown.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MEDIA_COLUMNS, FOLDER_GROUP } from "./_catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const CATALOG_PATH = path.join(ROOT, "_catalog.mjs");
const LOG_PATH = path.join(ROOT, "_fetch_log.json");
const CSV_PATH = path.join(ROOT, "media-columns.csv");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const OUTLET_RE =
  /https?:\/\/(?:www\.)?(?:etnews\.com\/\d+|zdnet\.co\.kr\/view\/\?no=\d+|venturesquare\.net\/\d+\/?|v\.daum\.net\/v\/[A-Za-z0-9]+)/gi;

const OUTLET_HOST_PRIORITY = [
  "etnews.com",
  "zdnet.co.kr",
  "venturesquare.net",
  "v.daum.net",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function slugify(title, date) {
  const base = String(title)
    .replace(/[\[\]'"‘’“”]/g, "")
    .replace(/[^\w가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${date}-${base || "column"}`;
}

function naverSearchUrl(title) {
  const q = encodeURIComponent(`[김호광 칼럼] ${title}`);
  return `https://search.naver.com/search.naver?where=news&query=${q}`;
}

function yamlList(arr, indent = 2) {
  const sp = " ".repeat(indent);
  return (arr || []).map((x) => `${sp}- ${JSON.stringify(String(x))}`).join("\n");
}

function decodeHtml(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function htmlToText(html) {
  let t = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  t = decodeHtml(t);
  return t.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

function cleanBody(raw) {
  let body = raw
    .replace(/\[.*?기자\].*?\n/gi, "")
    .replace(/\[.*?=\s*전자신문\].*?\n/gi, "")
    .replace(/\[.*?=\s*ZDNet.*?\].*?\n/gi, "")
    .replace(/사진\s*=\s*.*?(\n|$)/gi, "")
    .replace(/▲[^\n]*(\n|$)/g, "")
    .replace(/필자\s*소개[\s\S]*$/i, "")
    .replace(/김호광\s*블록체인\s*전문\s*기자[\s\S]*$/i, "")
    .replace(/Copyright[\s\S]*$/i, "")
    .replace(/무단\s*전재[\s\S]*$/i, "")
    .trim();
  const paras = body
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 15 && !/^[\[\(].*[\]\)]$/.test(p));
  return paras.join("\n\n");
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function normalizeOutletUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("etnews.com")) {
      u.search = "";
      u.hash = "";
      return u.toString().replace(/\/$/, "");
    }
    return u.toString();
  } catch {
    return url;
  }
}

function outletScore(url) {
  const h = hostOf(url);
  const idx = OUTLET_HOST_PRIORITY.findIndex((x) => h.includes(x.replace("www.", "")));
  return idx === -1 ? 99 : idx;
}

function pickBestUrl(urls) {
  const uniq = [...new Set(urls.map(normalizeOutletUrl))];
  uniq.sort((a, b) => outletScore(a) - outletScore(b));
  return uniq[0] || "";
}

function extractOutletLinks(html) {
  const found = html.match(OUTLET_RE) || [];
  return found.map((u) => u.replace(/&amp;/g, "&"));
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const finalUrl = res.url || url;
  const html = await res.text();
  return { html, finalUrl };
}

function titleOverlap(a, b) {
  const na = a.replace(/\s+/g, "").slice(0, 24);
  const nb = b.replace(/\s+/g, "").slice(0, 24);
  return na && nb && (na.includes(nb.slice(0, 12)) || nb.includes(na.slice(0, 12)));
}

function isBadResolvedUrl(url) {
  if (!url) return true;
  if (url.includes("zdnet.co.kr/error")) return true;
  if (/venturesquare\.net\/author\//i.test(url)) return true;
  return false;
}

async function resolveViaNaverQuery(query) {
  const q = encodeURIComponent(query);
  const searchUrl = `https://search.naver.com/search.naver?where=news&query=${q}`;
  const { html } = await fetchHtml(searchUrl);
  return { html, searchUrl, links: extractOutletLinks(html) };
}

async function resolveViaNaver(entry) {
  const queries = [
    `[김호광 칼럼] ${entry.title}`,
    `김호광 ${entry.title}`,
    `${entry.title} 김호광 site:etnews.com`,
  ];
  let searchUrl = naverSearchUrl(entry.title);
  for (const query of queries) {
    const res = await resolveViaNaverQuery(query);
    searchUrl = res.searchUrl;
    let links = res.links.filter((u) => !isBadResolvedUrl(u));
    if (!links.length) continue;
    const html = res.html;
    const titled = links.filter((u) => {
      const i = html.indexOf(u);
      if (i < 0) return false;
      const ctx = html.slice(Math.max(0, i - 400), i + 400);
      const plain = htmlToText(ctx);
      return titleOverlap(plain, entry.title) || plain.includes("김호광");
    });
    const pool = titled.length ? titled : links;
    const url = pickBestUrl(pool);
    if (url && !isBadResolvedUrl(url)) return { url, searchUrl };
    await sleep(300);
  }
  return { url: "", searchUrl };
}

function etnewsFromDaumHtml(html, entryDate) {
  const links = extractOutletLinks(html).filter((u) => u.includes("etnews.com"));
  if (!links.length) return "";
  const ymd = entryDate.replace(/-/g, "");
  const dated = links.filter((u) => u.includes(ymd));
  return normalizeOutletUrl(dated[0] || links[0]);
}

async function resolveArticleUrl(entry) {
  let url = (entry.url || "").trim();
  if (url.includes("venturesquare.net/author/")) url = "";

  if (!url || isBadResolvedUrl(url)) {
    const { url: found } = await resolveViaNaver(entry);
    if (found) url = found;
  }

  if (url && hostOf(url).includes("daum.net")) {
    try {
      const { html } = await fetchHtml(url);
      const et = etnewsFromDaumHtml(html, entry.date);
      if (et) url = et;
    } catch {
      /* keep daum */
    }
  }

  return normalizeOutletUrl(url);
}

function extractArticleHtml(html, url) {
  const h = hostOf(url);
  if (h.includes("etnews.com")) {
    let m =
      html.match(
        /id="articleBody"[^>]*>([\s\S]*?)(?=<div id="taboola|<div class="article_|<!-- 기사본문 end|id="articleFoot")/i
      ) || html.match(/id="articleBody"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
    if (m) return m[1];
  }
  if (h.includes("zdnet.co.kr")) {
    let m =
      html.match(/id="articleBody"[^>]*>([\s\S]*?)<\/div>/i) ||
      html.match(/class="view_cont"[^>]*>([\s\S]*?)<div/i);
    if (m) return m[1];
  }
  if (h.includes("venturesquare.net")) {
    let m = html.match(/class="entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div class="entry-meta"/i);
    if (m) return m[1];
  }
  if (h.includes("daum.net")) {
    let m = html.match(/class="article_view"[^>]*>([\s\S]*?)<\/div>/i);
    if (m) return m[1];
  }
  let m =
    html.match(/<div[^>]*class="[^"]*(?:article_body|news_body|view_cont|article-body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  return m ? m[1] : "";
}

function buildSummary(bodyText, entry) {
  const plain = bodyText.replace(/\n+/g, " ").trim();
  if (!plain) {
    return `${entry.media}에 게재된 김호광 칼럼 「${entry.title}」. 키 주제: ${(entry.topics || []).join(", ") || "미분류"}.`;
  }
  const sentences = plain.match(/[^.!?。]+[.!?。]?/g) || [plain];
  const meaningful = sentences.map((s) => s.trim()).filter((s) => s.length > 25);
  if (meaningful.length >= 2) return meaningful.slice(0, 3).join(" ");
  if (plain.length > 200) {
    const cut = plain.slice(0, 220);
    const dot = cut.lastIndexOf(". ");
    return dot > 80 ? cut.slice(0, dot + 1) : cut + "…";
  }
  return meaningful[0] || plain.slice(0, 200);
}

function descFromTitle(title, topics) {
  const t = topics?.slice(0, 3).join("·") || "미디어 칼럼";
  const d = `${title} — ${t}. 김호광 미디어 기고. 원문 링크·발행일·주제로 검색 가능.`;
  return d.length > 120 ? d.slice(0, 117) + "…" : d;
}

function renderMd(entry, sourceUrl, summary, bodyText) {
  const group = FOLDER_GROUP[entry.folder] || "media-ai";
  const topics = entry.topics || [];
  const desc = descFromTitle(entry.title, topics);
  const featured = entry.featured === true;
  const rank = entry.featured_rank ?? 99;
  const source = sourceUrl || naverSearchUrl(entry.title);

  const body =
    bodyText ||
    `본 페이지는 **${entry.media}**에 게재된 칼럼의 아카이브입니다. 전문은 하단 **원문 링크**에서 확인하세요.

핵심 키워드: ${topics.join(", ") || "미디어 칼럼"}`;

  return `<!--
---
title: ${JSON.stringify(entry.title)}
title_en: ""
subtitle: "${entry.media} 기고"
description: ${JSON.stringify(desc)}
abstract: |
  ${summary}
summary_for_ai: |
  ${entry.media} 게재 김호광 칼럼. 날짜 ${entry.date}. 주제: ${topics.join(", ")}.
  원문: ${source}. 정보 제공 목적이며 투자 권유가 아님.
date: ${entry.date}
updated: ${entry.date}
author: "김호광 (Dennis Kim)"
lang: ko
media: ${JSON.stringify(entry.media)}
source_url: ${JSON.stringify(source)}
tags:
${yamlList(["미디어칼럼", entry.media, ...topics])}
keywords:
${yamlList(topics.concat([entry.media, "김호광 칼럼"]))}
group: ${group}
featured: ${featured}
featured_rank: ${rank}
schema_type: BlogPosting
draft: false
og_image: ""
robots: index,follow
---
-->

# ${entry.title}

**요약**

${summary}

**발행일:** ${entry.date}  
**노출 미디어:** ${entry.media}  
**키 주제:** ${topics.join(" · ") || "미디어 칼럼"}

${body}

---

## 원문 링크

- [${entry.media} — ${entry.title}](${source})

*본 글은 정보 제공 목적이며 투자 권유가 아닙니다. 원문은 각 언론사에 귀속됩니다.*
`;
}

function patchCatalogUrls(resolvedMap) {
  const lines = fs.readFileSync(CATALOG_PATH, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes("date:") || !line.includes("url:")) continue;
    for (const [key, url] of resolvedMap.entries()) {
      if (!url) continue;
      const [date, titlePrefix] = key.split("\t");
      if (!line.includes(`date: "${date}"`)) continue;
      if (!line.includes(titlePrefix.slice(0, 12))) continue;
      const current = line.match(/url: "([^"]*)"/)?.[1] ?? "";
      const shouldPatch =
        !current ||
        (current.includes("v.daum.net") && url.includes("etnews.com")) ||
        current.includes("venturesquare.net/author/");
      if (shouldPatch) {
        lines[i] = line.replace(/url: "[^"]*"/, `url: "${url}"`);
      }
      break;
    }
  }
  fs.writeFileSync(CATALOG_PATH, lines.join("\n"), "utf8");
}

function writeCsv(columns) {
  const esc = (v) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const header =
    "date,media,folder,group,title,topics,url,featured,featured_rank,naver_search";
  const rows = columns.map((e) => {
    const topics = (e.topics || []).join("; ");
    const group = FOLDER_GROUP[e.folder] || "media-ai";
    const url = e.url || "";
    const fr = e.featured_rank ?? "";
    return [
      e.date,
      e.media,
      e.folder,
      group,
      esc(e.title),
      topics,
      url,
      e.featured === true,
      fr,
      naverSearchUrl(e.title),
    ].join(",");
  });
  fs.writeFileSync(CSV_PATH, [header, ...rows].join("\n") + "\n", "utf8");
}

async function main() {
  const log = [];
  let resolved = 0;
  let fetched = 0;
  let failed = 0;
  const resolvedMap = new Map();
  const urlUpdates = new Map();

  for (let i = 0; i < MEDIA_COLUMNS.length; i++) {
    const entry = { ...MEDIA_COLUMNS[i] };
    const key = `${entry.date}\t${entry.title}`;
    let articleUrl = "";
    let bodyText = "";
    let ok = false;
    let bytes = 0;

    process.stdout.write(`[${i + 1}/${MEDIA_COLUMNS.length}] ${entry.title.slice(0, 40)}… `);

    try {
      articleUrl = await resolveArticleUrl(entry);
      await sleep(300);
      if (articleUrl) {
        if (!entry.url) resolved++;
        urlUpdates.set(key, articleUrl);
        entry.url = articleUrl;

        const { html, finalUrl } = await fetchHtml(articleUrl);
        articleUrl = normalizeOutletUrl(finalUrl);
        entry.url = articleUrl;
        urlUpdates.set(key, articleUrl);

        const articleHtml = extractArticleHtml(html, articleUrl);
        if (articleHtml) {
          bodyText = cleanBody(htmlToText(articleHtml));
          bytes = bodyText.length;
          if (bytes > 200) {
            ok = true;
            fetched++;
          }
        }
      }
    } catch (e) {
      failed++;
      process.stdout.write(`ERR ${e.message}\n`);
      log.push({
        title: entry.title,
        date: entry.date,
        url: articleUrl || entry.url || "",
        ok: false,
        bytes: 0,
        error: String(e.message),
      });
      await sleep(300);
      continue;
    }

    if (!ok) failed++;

    const summary = buildSummary(bodyText, entry);
    const dir = path.join(ROOT, entry.folder);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${slugify(entry.title, entry.date)}.md`);
    fs.writeFileSync(
      file,
      renderMd(entry, articleUrl || entry.url, summary, bodyText || null),
      "utf8"
    );

    resolvedMap.set(key, articleUrl || entry.url || "");
    log.push({
      title: entry.title,
      date: entry.date,
      url: articleUrl || entry.url || "",
      ok,
      bytes,
    });

    process.stdout.write(ok ? `OK ${bytes}b\n` : `stub ${bytes}b\n`);
    await sleep(300);
  }

  patchCatalogUrls(urlUpdates);
  const refreshed = MEDIA_COLUMNS.map((e, idx) => {
    const k = `${e.date}\t${e.title}`;
    const u = urlUpdates.get(k);
    return u ? { ...e, url: u } : e;
  });
  writeCsv(refreshed);

  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), "utf8");

  let fullBody = 0;
  let stubs = 0;
  for (const row of log) {
    if (row.ok && row.bytes > 500) fullBody++;
    else stubs++;
  }

  console.log("\n--- Summary ---");
  console.log(`Total: ${MEDIA_COLUMNS.length}`);
  console.log(`Newly resolved URLs (was empty): ${resolved}`);
  console.log(`Fetched OK (body extract): ${fetched}`);
  console.log(`Body > 500 chars: ${fullBody}`);
  console.log(`URL-only / short stubs: ${stubs}`);
  console.log(`Errors during resolve/fetch: ${failed}`);
  console.log(`Log: ${LOG_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
