#!/usr/bin/env node
/**
 * One-shot polish for 03. Media-Column → docs.vibequant.cc
 * - media: 전자신문 → 전자신문(RPM9)
 * - live YAML frontmatter + HEAD comment ref (COLUMN_GUIDELINE)
 * - readable body paragraphs / ## section titles
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SKIP = new Set(["readme.md", "description.md"]);

function walkMd(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name.startsWith(".")) continue;
      walkMd(p, out);
    } else if (ent.isFile() && ent.name.endsWith(".md") && !ent.name.startsWith("_")) {
      if (!SKIP.has(ent.name.toLowerCase())) out.push(p);
    }
  }
  return out;
}

function normalizeMedia(m) {
  const s = String(m || "").trim();
  if (!s) return s;
  // User rule: RPM9 displays as 전자신문(RPM9)
  if (s === "RPM9" || /^전자신문\s*\(?\s*RPM9\s*\)?$/i.test(s)) {
    return "전자신문(RPM9)";
  }
  return s;
}

function yamlList(arr, indent = 2) {
  const sp = " ".repeat(indent);
  return (arr || []).map((x) => `${sp}- ${JSON.stringify(String(x))}`).join("\n");
}

function parseMeta(text) {
  const t = text.replace(/^\uFEFF/, "");
  let fm = "";
  if (t.startsWith("---")) {
    const end = t.indexOf("\n---", 3);
    if (end !== -1) fm = t.slice(3, end);
  }
  if (!fm) {
    const m = t.match(/<!--\s*---([\s\S]*?)---\s*-->/);
    if (m) fm = m[1];
  }
  if (!fm) return {};
  const meta = {};
  const lines = fm.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!m) {
      i++;
      continue;
    }
    const key = m[1];
    let val = m[2].trim();
    if (val === "|" || val === ">") {
      const buf = [];
      i++;
      while (i < lines.length && (/^(\s{2,}|\t)/.test(lines[i]) || !lines[i].trim())) {
        if (lines[i].trim()) buf.push(lines[i].replace(/^\s{2}/, ""));
        i++;
      }
      meta[key] = buf.join("\n").trim();
      continue;
    }
    if (!val && i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
      const arr = [];
      i++;
      while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
        let item = lines[i].replace(/^\s+-\s+/, "").trim();
        if (
          (item.startsWith('"') && item.endsWith('"')) ||
          (item.startsWith("'") && item.endsWith("'"))
        ) {
          item = item.slice(1, -1);
        }
        arr.push(item);
        i++;
      }
      meta[key] = arr;
      continue;
    }
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (val === "true") val = true;
    else if (val === "false") val = false;
    else if (/^-?\d+(\.\d+)?$/.test(val)) val = Number(val);
    meta[key] = val;
    i++;
  }
  return meta;
}

/** Extract article body only — never HEAD comments or frontmatter. */
function extractBody(raw) {
  let s = raw.replace(/^\uFEFF/, "");
  // drop leading comment-wrapped frontmatter
  s = s.replace(/^<!--\s*---[\s\S]*?---\s*-->\s*/, "");
  // drop live frontmatter
  if (s.startsWith("---")) {
    const end = s.indexOf("\n---", 3);
    if (end !== -1) s = s.slice(end + 4);
  }
  // drop HEAD reference comment if present
  s = s.replace(/^\s*<!--[\s\S]*?-->\s*/, "");
  // cut at 원문 링크 / disclaimer
  const cut = s.search(/\n##\s*원문\s*링크|\n\*본 글은 정보 제공/);
  if (cut !== -1) s = s.slice(0, cut);

  const lines = s.split(/\r?\n/);
  const out = [];
  let skipSummary = false;
  let pastHeader = false;

  for (const line of lines) {
    const t = line.trim();

    // skip structural header we will regenerate
    if (/^#\s+/.test(t) && !/^##/.test(t)) continue;
    if (/^##\s+/.test(t) && /기고/.test(t)) continue;
    if (/^\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}/.test(t) && /김호광|Dennis/.test(t)) continue;
    if (/^---+$/.test(t)) continue;

    if (/^\*\*요약\*\*/.test(t)) {
      skipSummary = true;
      continue;
    }
    if (skipSummary) {
      if (
        /^\*\*발행일:\*\*/.test(t) ||
        /^\*\*노출 미디어:\*\*/.test(t) ||
        /^\*\*키 주제:\*\*/.test(t)
      ) {
        skipSummary = false;
        continue;
      }
      if (!t) continue;
      // skip summary paragraph(s)
      continue;
    }

    if (/^\*\*발행일:\*\*/.test(t)) continue;
    if (/^\*\*노출 미디어:\*\*/.test(t)) continue;
    if (/^\*\*키 주제:\*\*/.test(t)) continue;
    if (/^핵심 키워드:/.test(t)) continue;
    if (/^<!--/.test(t) || t === "-->") continue;
    if (/^<title>|^<meta |^<script |^<\/script>|"@context"|HEAD 참조/.test(t)) continue;

    pastHeader = true;

    // section-ish bare line → ##
    if (
      t &&
      !/^#/.test(t) &&
      !/^[-*+]/.test(t) &&
      !/^\d+\.\s/.test(t) &&
      t.length >= 4 &&
      t.length <= 56 &&
      !/[.!?。…]$/.test(t) &&
      /[가-힣]/.test(t) &&
      !/^(그리고|그러나|하지만|또한|한편|특히|최근|이제|이는|이런|이러한|본 페이지)/.test(t)
    ) {
      out.push("");
      out.push(`## ${t}`);
      out.push("");
      continue;
    }

    // numbered feature bullets
    if (/^\d+\.\s+\S/.test(t) && t.length < 100 && !/[.!?。]$/.test(t)) {
      out.push(`- ${t.replace(/^\d+\.\s+/, "")}`);
      continue;
    }

    out.push(line);
  }

  let text = out.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  // split overlong single blocks
  const blocks = text.split(/\n{2,}/);
  const rebuilt = [];
  for (const block of blocks) {
    const b = block.trim();
    if (!b) continue;
    if (/^#/.test(b) || /^[-*]/.test(b) || b.includes("\n") || b.length < 420) {
      rebuilt.push(b);
      continue;
    }
    const sentences = b.replace(/(\d)\.(\d)/g, "$1‹DOT›$2").match(/[^.!?。]+[.!?。]+(?:\s+|$)|[^.!?。]+$/g) || [b];
    let buf = "";
    for (const sent of sentences) {
      const x = sent.replace(/‹DOT›/g, ".").trim();
      if (!x) continue;
      if (!buf) buf = x;
      else if ((buf + " " + x).length > 280) {
        rebuilt.push(buf);
        buf = x;
      } else buf = `${buf} ${x}`;
    }
    if (buf) rebuilt.push(buf);
  }

  // dedupe near-duplicate paragraphs
  const deduped = [];
  for (const b of rebuilt) {
    if (/^#/.test(b) || /^[-*]/.test(b)) {
      deduped.push(b);
      continue;
    }
    const cur = b.replace(/\s+/g, " ");
    if (!deduped.length) {
      deduped.push(b);
      continue;
    }
    const prev = deduped[deduped.length - 1].replace(/\s+/g, " ");
    if (prev === cur) continue;
    if (prev.includes(cur) && cur.length > 50) continue;
    if (cur.includes(prev) && prev.length > 50) {
      deduped[deduped.length - 1] = b;
      continue;
    }
    // drop if first 80 chars match previous start (summary residue)
    if (prev.slice(0, 80) === cur.slice(0, 80) && Math.abs(prev.length - cur.length) < 40) continue;
    deduped.push(b);
  }

  return deduped.join("\n\n").trim();
}

function clipDescription(text, max = 118) {
  let s = String(text || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return s;
  if (s.length <= max) {
    const m = s.match(/^(.+?[.!?。])(?:\s|$)/);
    if (m && m[1].length >= 40 && m[1].length <= max) return m[1];
    return s;
  }
  const window = s.slice(0, max);
  const ends = [". ", "。", "! ", "? "].map((x) => window.lastIndexOf(x));
  const sentenceEnd = Math.max(...ends);
  if (sentenceEnd >= 50) {
    const mark = window[sentenceEnd] === "。" ? 1 : 2;
    return window.slice(0, sentenceEnd + mark).trim();
  }
  const sp = window.lastIndexOf(" ");
  return (sp > 60 ? window.slice(0, sp) : window.slice(0, max - 1)).replace(/[,\s·]+$/, "") + "…";
}

function isTruncated(s) {
  const t = String(s || "").trim();
  if (!t || t.length < 40) return true;
  if (/<title>|<meta |원문 링크·발행일/.test(t)) return true;
  if (/키 주제:|핵심 주제:/.test(t) && t.length < 140) return true;
  if (/\d\.\s*$/.test(t) || /[-–—,]\s*$/.test(t)) return true;
  if (!/[.!?。…」"]\s*$/.test(t) && t.length > 70) return true;
  return false;
}

function splitSentences(plain) {
  // Avoid splitting on decimals like 1.59%
  const protected_ = plain.replace(/(\d)\.(\d)/g, "$1‹DOT›$2");
  const parts = protected_.match(/[^.!?。]+[.!?。]+|[^.!?。]+$/g) || [];
  return parts.map((x) => x.replace(/‹DOT›/g, ".").trim()).filter(Boolean);
}

function buildAbstract(meta, body, media) {
  const plain = body
    .replace(/^#.+$/gm, "")
    .replace(/^본 페이지는[\s\S]*/m, "")
    .replace(/\n+/g, " ")
    .trim();
  if (plain.length > 80 && !/아카이브입니다/.test(plain.slice(0, 40))) {
    const meaningful = splitSentences(plain)
      .map((x) => x.replace(/^---+\s*/, "").trim())
      .filter((x) => x.length > 15 && !/아카이브|원문 링크|핵심 키워드|^---/.test(x));
    if (meaningful.length) {
      let abs = meaningful.slice(0, 3).join(" ");
      if (abs.length > 480) abs = abs.slice(0, 477) + "…";
      return abs.replace(/전자신문(?!\(RPM9\))/g, "전자신문(RPM9)");
    }
  }
  const topics = (Array.isArray(meta.tags) ? meta.tags : []).filter(
    (t) => !["미디어칼럼", "전자신문", "전자신문(RPM9)", "ZDNet Korea", "벤처스퀘어", media].includes(t)
  );
  return `${media}에 게재된 김호광 칼럼 「${meta.title}」. 핵심 주제: ${topics.slice(0, 4).join(", ") || "미디어 칼럼"}.`;
}

function renderFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const meta = parseMeta(raw);
  if (!meta.title) {
    console.warn("skip:", path.relative(ROOT, filePath));
    return null;
  }

  const media = normalizeMedia(meta.media) || "미디어";
  const body = extractBody(raw);
  const sourceMatch = raw.match(/source_url:\s*"([^"]+)"/) || raw.match(/\((https?:\/\/[^)\s]+)\)/);
  const sourceUrl = meta.source_url || (sourceMatch && sourceMatch[1]) || "";

  const isStub =
    !body ||
    body.length < 180 ||
    (/아카이브입니다/.test(body) && body.length < 500);

  const bodySection = isStub
    ? `본 페이지는 **${media}**에 게재된 칼럼의 아카이브입니다. 전문·맥락은 하단 원문 링크에서 확인하세요.`
    : body;

  const abstract = buildAbstract(meta, bodySection, media);
  const description = clipDescription(
    !isTruncated(meta.description) ? String(meta.description).replace(/전자신문(?!\(RPM9\))/g, "전자신문(RPM9)") : abstract
  );

  const mediaNames = new Set([
    "미디어칼럼",
    "전자신문",
    "전자신문(RPM9)",
    "RPM9",
    "ZDNet Korea",
    "벤처스퀘어",
    "게임톡",
    "네이버 블로그",
    media,
    "김호광 칼럼",
  ]);
  const topics = [];
  const push = (t) => {
    const s = String(t || "").trim();
    if (!s || mediaNames.has(s)) return;
    if (!topics.includes(s)) topics.push(s);
  };
  for (const t of Array.isArray(meta.tags) ? meta.tags : []) push(t);
  for (const t of Array.isArray(meta.keywords) ? meta.keywords : []) push(t);

  const tags = [...new Set(["미디어칼럼", media, ...topics])].slice(0, 8);
  const keywords = [...new Set([...topics.slice(0, 4), media, "김호광 칼럼"])];
  const date = meta.date || "2020-01-01";
  const displayDate = String(date).replace(/-/g, ".");
  const featured = meta.featured === true;
  const rank = meta.featured_rank ?? 99;
  const group = meta.group || "media-ai";
  const kwJson = keywords.map((k) => JSON.stringify(k)).join(", ");

  const md = `---
title: ${JSON.stringify(String(meta.title))}
title_en: ""
subtitle: ""
description: ${JSON.stringify(description)}
abstract: |
  ${abstract}
summary_for_ai: |
  ${media} 게재 김호광 칼럼. 날짜 ${date}. 주제: ${topics.join(", ") || "미디어 칼럼"}.
  원문: ${sourceUrl || "(미확보)"}. 정보 제공 목적이며 투자 권유가 아님. 원문은 각 언론사에 귀속.
date: ${date}
updated: ${meta.updated || date}
author: "김호광 (Dennis Kim)"
lang: ko
media: ${JSON.stringify(media)}
source_url: ${JSON.stringify(sourceUrl || "")}
tags:
${yamlList(tags)}
keywords:
${yamlList(keywords)}
group: ${group}
featured: ${featured}
featured_rank: ${rank}
schema_type: BlogPosting
draft: false
og_image: ""
robots: index,follow
---

<!--
  HEAD 참조 (렌더링 안 됨 · 빌드 자동 주입 · 주석 풀지 말 것)
  값 원천은 위 frontmatter.
  <title>${String(meta.title)} · VibeQuant</title>
  <meta name="description" content="${description.replace(/"/g, "&quot;")}">
  <meta name="robots" content="index,follow">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": ${JSON.stringify(String(meta.title))},
    "author": { "@type": "Person", "name": "김호광 (Dennis Kim)" },
    "datePublished": "${date}",
    "keywords": [${kwJson}],
    "publisher": { "@type": "Organization", "name": ${JSON.stringify(media)} }
  }
  </script>
-->

# ${meta.title}

${displayDate} 김호광 / Dennis Kim

---

${bodySection}

---

## 원문 링크

- [${media} — ${meta.title}](${sourceUrl || "#"})

*본 글은 정보 제공 목적이며 투자 권유가 아닙니다. 원문은 각 언론사에 귀속됩니다.*
`;

  fs.writeFileSync(filePath, md, "utf8");
  return { media, stub: isStub };
}

function patchCatalogCsv() {
  const catalogPath = path.join(ROOT, "_catalog.mjs");
  if (fs.existsSync(catalogPath)) {
    let cat = fs.readFileSync(catalogPath, "utf8");
    cat = cat.replace(/media:\s*"RPM9"/g, 'media: "전자신문(RPM9)"');
    fs.writeFileSync(catalogPath, cat, "utf8");
  }

  const csvPath = path.join(ROOT, "media-columns.csv");
  if (fs.existsSync(csvPath)) {
    let csv = fs.readFileSync(csvPath, "utf8");
    // Only rename bare RPM9 outlet, not 전자신문
    csv = csv.replace(/,RPM9,/g, ",전자신문(RPM9),");
    fs.writeFileSync(csvPath, csv, "utf8");
  }
}

function main() {
  const files = walkMd(ROOT);
  let n = 0;
  let stubs = 0;
  const mediaCount = {};
  for (const f of files) {
    const r = renderFile(f);
    if (!r) continue;
    n++;
    if (r.stub) stubs++;
    mediaCount[r.media] = (mediaCount[r.media] || 0) + 1;
  }
  patchCatalogCsv();
  console.log(`Polished ${n} (${stubs} stubs).`, mediaCount);
}

main();
