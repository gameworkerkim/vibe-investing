#!/usr/bin/env node
/**
 * Generate Media-Column markdown from _catalog.mjs
 * Optional: FETCH=1 node _ingest.mjs  → pull body from source_url when possible
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MEDIA_COLUMNS, FOLDER_GROUP } from "./_catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const DO_FETCH = process.env.FETCH === "1";

function slugify(title, date) {
  const base = String(title)
    .replace(/[\[\]'"‘’“”]/g, "")
    .replace(/[^\w가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${date}-${base || "column"}`;
}

function descFromTitle(title, topics) {
  const t = topics?.slice(0, 3).join("·") || "미디어 칼럼";
  const d = `${title} — ${t}. 김호광 미디어 기고. 원문 링크·발행일·주제로 검색 가능.`;
  return d.length > 120 ? d.slice(0, 117) + "…" : d;
}

function abstractFrom(title, media, topics) {
  return `${media}에 게재된 김호광 칼럼 「${title}」. 핵심 주제: ${(topics || []).join(", ") || "미분류"}. 본문 전문은 하단 원문 링크에서 확인할 수 있으며, VibeQuant Columns에서 날짜·미디어·주제별 검색이 가능합니다.`;
}

function yamlList(arr, indent = 2) {
  const sp = " ".repeat(indent);
  return (arr || []).map((x) => `${sp}- ${JSON.stringify(String(x))}`).join("\n");
}

function naverSearchUrl(title) {
  const q = encodeURIComponent(`[김호광 칼럼] ${title}`);
  return `https://search.naver.com/search.naver?where=news&query=${q}`;
}

async function fetchBody(url) {
  if (!url || !DO_FETCH) return null;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; VibeQuantMediaIngest/1.0; +https://docs.vibequant.cc)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();
    // etnews / daum / zdnet rough extract
    let m =
      html.match(/<div[^>]*class="[^"]*(?:article_body|news_body|view_cont|article-body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
      html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (!m) return null;
    let body = m[1]
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    // drop author bio tail
    body = body.replace(/필자\s*소개[\s\S]*$/i, "").trim();
    if (body.length < 200) return null;
    // markdown-ish paragraphs
    return body
      .split(/\n{2,}/)
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter((p) => p.length > 20)
      .slice(0, 40)
      .join("\n\n");
  } catch {
    return null;
  }
}

function renderMd(entry, bodyText) {
  const group = FOLDER_GROUP[entry.folder] || "media-ai";
  const source = entry.url || naverSearchUrl(entry.title);
  const topics = entry.topics || [];
  const desc = descFromTitle(entry.title, topics);
  const abstract = abstractFrom(entry.title, entry.media, topics);
  const featured = entry.featured === true;
  const rank = entry.featured_rank ?? 99;

  const body =
    bodyText ||
    `본 페이지는 **${entry.media}**에 게재된 칼럼의 아카이브 카드입니다. 전문·맥락은 하단 **원문 링크**에서 확인하세요.

핵심 키워드: ${topics.join(", ") || "미디어 칼럼"}

> 검색·SEO를 위해 발행일·노출 미디어·주제를 메타로 고정했습니다. 원문 이관이 완료되면 본문이 이 자리에 채워집니다.`;

  return `<!--
---
title: ${JSON.stringify(entry.title)}
title_en: ""
subtitle: "${entry.media} 기고"
description: ${JSON.stringify(desc)}
abstract: |
  ${abstract}
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

## ${entry.media} 기고

---

## 본문

**발행일:** ${entry.date}  
**노출 미디어:** ${entry.media}  
**키 주제:** ${topics.join(" · ") || "미디어 칼럼"}

${body}

---

## 원문 링크

- 원문: [${entry.media} — ${entry.title}](${source})
- 네이버 검색: [김호광 칼럼 ${entry.title}](${naverSearchUrl(entry.title)})

*본 글은 정보 제공 목적이며 투자 권유가 아닙니다. 원문은 각 언론사에 귀속됩니다.*
`;
}

async function main() {
  let n = 0;
  let fetched = 0;
  for (const entry of MEDIA_COLUMNS) {
    const dir = path.join(ROOT, entry.folder);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${slugify(entry.title, entry.date)}.md`);
    let body = null;
    if (entry.url && DO_FETCH) {
      body = await fetchBody(entry.url);
      if (body) fetched++;
      await new Promise((r) => setTimeout(r, 250));
    }
    fs.writeFileSync(file, renderMd(entry, body), "utf8");
    n++;
  }
  console.log(`Wrote ${n} media columns (${fetched} bodies fetched)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
