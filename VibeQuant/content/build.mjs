#!/usr/bin/env node
/**
 * Scan Investment Idea Column + TechDoc → static Pages HTML
 * with group sections, search, and featured columns.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import {
  COLUMN_GROUP_RULES,
  COLUMN_GROUP_FALLBACK,
  TECH_GROUP_RULES,
  TECH_GROUP_FALLBACK,
  FEATURED_COLUMN_PATHS,
  resolveGroup,
  groupsFromRules,
} from "./groups.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const VQ = path.resolve(__dirname, "..");
const PAGES = path.join(VQ, "pages");
const COL_SRC = path.join(ROOT, "02.Investment Idea Column");
const TECH_SRC = path.join(ROOT, "TechDoc");
const SITE = process.env.SITE_URL || "https://vibequant.cc";
const SITE_DOCS = process.env.SITE_DOCS_URL || "https://docs.vibequant.cc";
const SITE_TECH = process.env.SITE_TECH_URL || "https://tech.vibequant.cc";
const COL_BLOB = "https://github.com/gameworkerkim/vibe-investing/blob/main/02.Investment%20Idea%20Column";
const TECH_BLOB = "https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc";

function siteForSection(section) {
  if (section === "columns") return SITE_DOCS;
  if (section === "tech") return SITE_TECH;
  return SITE;
}

marked.setOptions({ gfm: true, breaks: false });

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripFrontmatter(md) {
  if (!md.startsWith("---")) return md;
  const end = md.indexOf("\n---", 3);
  if (end === -1) return md;
  return md.slice(end + 4).replace(/^\s+/, "");
}

function cleanInline(s) {
  return String(s ?? "")
    .replace(/[*_`#]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function isBylineLine(line) {
  const t = cleanInline(line);
  if (!t || t.length > 140) return false;
  if (/^---+$/.test(t)) return false;
  const hasDate =
    /\d{4}[./-]\d{1,2}[./-]\d{1,2}/.test(t) ||
    /\d{4}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일/.test(t);
  const hasAuthor = /김호광|Dennis\s*Kim/i.test(t);
  const dateOnly = /^(?:\*?)?\s*\d{4}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일(?:\s*기준)?\s*(?:\*)?$/.test(t) ||
    (/기준/.test(t) && hasDate && t.length < 40);
  return (hasDate && hasAuthor) || (hasDate && t.length < 80) || (hasAuthor && t.length < 80) || dateOnly;
}

const META_LABEL =
  /^(작성일|작성자|작성|발행|발행일|저자|부제|주제|키워드|대상|대상\s*자산|분석\s*기준일|재무\s*기준|상태|소속|GitHub|repo|Author|Date|Published|Keywords?)\s*[:：]/i;

function isMetaLine(line) {
  const raw = String(line ?? "").replace(/^>\s*/, "").trim();
  if (!raw || /^---+$/.test(raw)) return true;
  const t = cleanInline(raw);
  if (!t) return true;
  if (isBylineLine(t)) return true;
  if (META_LABEL.test(t)) return true;
  const labels = (t.match(/(작성일|작성자|작성|발행|저자|부제|주제|키워드|GitHub|repo)\s*[:：]/gi) || []).length;
  if (labels >= 2) return true;
  if (/^https?:\/\//i.test(t) && t.length < 160) return true;
  return false;
}

function isMetaParagraph(p) {
  const text = String(p ?? "").replace(/^>\s?/gm, "").trim();
  if (!text) return true;
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return true;
  const metaN = lines.filter((l) => isMetaLine(l)).length;
  if (metaN / lines.length >= 0.5) return true;
  if (META_LABEL.test(cleanInline(text)) && text.length < 220) return true;
  const smashed = (text.match(/(작성일|작성자|발행|저자|부제|주제|키워드|GitHub)\s*[:：]/gi) || []).length;
  if (smashed >= 2) return true;
  return false;
}

function isSubtitleHeading(text) {
  const t = cleanInline(text);
  if (!t) return false;
  if (/^\d+[\.\)]\s/.test(t)) return false;
  return true;
}

function truncateAtWord(text, max = 155) {
  const s = text.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  const base = (sp > 80 ? cut.slice(0, sp) : cut).replace(/[,\s·"“‘]+$/, "");
  return `${base}…`;
}

/** Fix common MD bold patterns; marked often fails on complex **…** spans. */
function sanitizeMd(md) {
  let s = String(md ?? "");
  // ** spaced **
  s = s.replace(/\*\*\s+([^*\n]+?)\s*\*\*/g, (_, t) => `**${t.trim()}**`);
  // **'quoted'** / **"quoted"**
  s = s.replace(/\*\*(['"“”‘’「」])([^*\n]+?)\1\*\*/g, "**$2**");
  // Pre-convert inline bold to HTML so marked cannot leave literal **
  const parts = s.split(/(```[\s\S]*?```)/);
  s = parts
    .map((part, idx) => {
      if (idx % 2 === 1) return part; // fenced code
      return part.replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>");
    })
    .join("");
  return s;
}

function fixLiteralBoldHtml(html) {
  return String(html ?? "").replace(/\*\*([^*<\n]+?)\*\*/g, "<strong>$1</strong>");
}

function stripLeadingMetaBlocks(bodyMd) {
  let text = bodyMd.replace(/^\s+/, "");
  let guard = 0;
  while (text && guard++ < 30) {
    if (/^---+\s*\n*/.test(text)) {
      text = text.replace(/^---+\s*\n*/, "");
      continue;
    }
    // leading blockquote
    const bq = text.match(/^(?:>[^\n]*(?:\n|$))+/);
    if (bq) {
      const inner = bq[0].replace(/^>\s?/gm, "");
      if (isMetaParagraph(inner)) {
        text = text.slice(bq[0].length).replace(/^\s+/, "");
        continue;
      }
    }
    // extra H1 (e.g. EN title under KO title)
    if (/^#\s+/.test(text)) {
      text = text.replace(/^#\s+[^\n]+\n+/, "");
      continue;
    }
    // bold-only dek already captured, or meta bold lines
    const firstPara = text.match(/^[^\n]+(?:\n[^\n]+){0,6}/)?.[0] || "";
    if (firstPara && !/^##\s/.test(firstPara)) {
      const untilBreak = text.match(/^[\s\S]*?(?=\n\n|\n##|\n---|$)/)?.[0] || "";
      if (untilBreak && isMetaParagraph(untilBreak) && !/^##\s/m.test(untilBreak)) {
        text = text.slice(untilBreak.length).replace(/^\s+/, "");
        continue;
      }
      // single bold line used as dek: **subtitle**
      if (/^\*\*[^*\n]+\*\*\s*$/.test(firstPara.trim()) || /^__.+__\s*$/.test(firstPara.trim())) {
        text = text.slice(firstPara.length).replace(/^\s+/, "");
        continue;
      }
    }
    break;
  }
  return text.replace(/^\s+/, "");
}

/**
 * Pull title / dek / byline out of the MD preamble so article pages
 * don't repeat H1 and don't show a mashed truncated lede.
 */
function parseDoc(md, fallbackTitle) {
  const raw = stripFrontmatter(md).replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/);
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i++;

  let title = fallbackTitle;
  if (lines[i]?.match(/^#\s+/)) {
    title = cleanInline(lines[i].replace(/^#\s+/, "")).slice(0, 160) || fallbackTitle;
    i++;
  } else {
    const m = raw.match(/^#\s+(.+)$/m) || raw.match(/^##\s+(.+)$/m);
    if (m) title = cleanInline(m[1]).slice(0, 160) || fallbackTitle;
  }

  // optional second H1 (EN title etc.) — skip for body, keep KO as page title
  while (i < lines.length && !lines[i].trim()) i++;
  if (lines[i]?.match(/^#\s+/)) i++;

  while (i < lines.length && !lines[i].trim()) i++;

  let subtitle = "";
  if (lines[i]?.match(/^##\s+/)) {
    const h = lines[i].replace(/^##\s+/, "");
    if (isSubtitleHeading(h)) {
      subtitle = cleanInline(h);
      i++;
    }
  }

  // Bold-only dek right under title: **subtitle** (skip meta labels)
  while (i < lines.length && !lines[i].trim()) i++;
  if (!subtitle && lines[i] && /^\*\*[^*\n]+\*\*\s*$/.test(lines[i].trim())) {
    const cand = cleanInline(lines[i]);
    if (!isMetaLine(cand) && !META_LABEL.test(cand)) {
      subtitle = cand;
      i++;
    }
  }

  while (i < lines.length && !lines[i].trim()) i++;

  let byline = "";
  // collect consecutive meta / byline lines (not into body yet — stripLeadingMeta will finish)
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || /^---+$/.test(line.trim())) {
      i++;
      continue;
    }
    if (line.trim().startsWith(">")) break;
    if (line.match(/^##\s+/)) break;
    if (isMetaLine(line) || isBylineLine(line)) {
      if (!byline && (isBylineLine(line) || /작성일|발행/i.test(line))) {
        byline = cleanInline(line).slice(0, 120);
      }
      // 부제: … as subtitle
      const sub = cleanInline(line).match(/^부제\s*[:：]\s*(.+)/i);
      if (sub && !subtitle) subtitle = sub[1].slice(0, 160);
      i++;
      continue;
    }
    break;
  }

  while (i < lines.length && (!lines[i].trim() || /^---+$/.test(lines[i].trim()))) i++;

  let bodyMd = stripLeadingMetaBlocks(lines.slice(i).join("\n"));

  // Pull 부제 from remaining body meta blockquote if still missing
  if (!subtitle) {
    const subM = bodyMd.match(/(?:\*\*)?부제(?:\*\*)?\s*[:：]\s*(.+)/);
    if (subM) subtitle = cleanInline(subM[1]).slice(0, 160);
  }

  // First real prose paragraph for cards / meta description
  const plain = bodyMd
    .replace(/^#.+$/gm, "")
    .replace(/^>.+$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\|.*$/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`|-]/g, " ");
  const paras = plain
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length >= 40 && !isMetaParagraph(p) && !isBylineLine(p));
  const description = truncateAtWord(paras[0] || subtitle || title, 155);

  return { title, subtitle, byline, description, bodyMd };
}

function titleFromMd(md, fallback) {
  return parseDoc(md, fallback).title;
}

function descriptionFromMd(md, fallback) {
  return parseDoc(md, fallback).description;
}

function makeSlug(relPath) {
  const noExt = relPath.replace(/\.md$/i, "");
  const ascii = noExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const h = crypto.createHash("sha1").update(relPath).digest("hex").slice(0, 8);
  return `${ascii || "doc"}-${h}`;
}

function githubUrl(base, relPath) {
  return `${base}/${relPath.split("/").map(encodeURIComponent).join("/")}`;
}

function shouldSkipColumn(rel) {
  const n = path.basename(rel).toLowerCase();
  if (n === "readme.md" || n === "llms.txt" || n === "ideanote.md") return true;
  if (n === "description.md") return true;
  if (n === "column_guideline.md" || n === "column_template.md") return true;
  if (n.startsWith("_")) return true;
  if (rel.includes("/result/")) return true;
  if (n.endsWith(".csv")) return true;
  return false;
}

function shouldSkipTech(rel) {
  const n = path.basename(rel).toLowerCase();
  if (n.startsWith("readme")) return true;
  if (n === "llms.txt" || n === "requirements.txt" || n === "contacts.md") return true;
  if (n === "glossary.md" || n === "translation_plan.md") return true;
  if (rel.includes("toss-qlib-middleware/") && !/getting-started|readme/i.test(n)) {
    // keep only top-level qlib guides; skip middleware internals
    if (rel.includes("/src/") || rel.includes("/toss-qlib-middleware/src")) return true;
  }
  return false;
}

function walkMd(dir, skipFn) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  function walk(d) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === "node_modules" || ent.name === ".git") continue;
        walk(full);
      } else if (/\.md$/i.test(ent.name)) {
        const rel = path.relative(dir, full).split(path.sep).join("/");
        if (!skipFn(rel)) out.push(rel);
      }
    }
  }
  walk(dir);
  return out.sort((a, b) => a.localeCompare(b));
}

function scanColumns() {
  const files = walkMd(COL_SRC, shouldSkipColumn);
  const items = [];
  for (const rel of files) {
    const full = path.join(COL_SRC, rel);
    let md = "";
    try {
      md = fs.readFileSync(full, "utf8");
    } catch {
      continue;
    }
    const group = resolveGroup(rel, COLUMN_GROUP_RULES, COLUMN_GROUP_FALLBACK);
    const baseTitle = path.basename(rel, path.extname(rel)).replace(/[_-]+/g, " ");
    const parsed = parseDoc(md, baseTitle);
    const featuredRank = FEATURED_COLUMN_PATHS.findIndex((p) => {
      const needle = p.replace(/\\/g, "/").toLowerCase();
      const hay = rel.toLowerCase();
      if (hay === needle || hay.endsWith("/" + needle) || hay.includes(needle)) return true;
      // exact basename match only (avoid "IPO.md" false positives)
      const featBase = path.basename(needle).toLowerCase();
      const fileBase = path.basename(hay).toLowerCase();
      return featBase.length >= 8 && featBase === fileBase;
    });
    items.push({
      kind: "column",
      slug: makeSlug(rel),
      path: rel,
      title: parsed.title,
      description: parsed.description,
      subtitle: parsed.subtitle,
      byline: parsed.byline,
      group: group.id,
      groupTitle: group.title_ko,
      tags: [group.title_ko, ...rel.split("/").slice(0, -1)].slice(0, 5),
      featured: featuredRank >= 0,
      featuredRank: featuredRank >= 0 ? featuredRank : 999,
      github: githubUrl(COL_BLOB, rel),
      srcDir: COL_SRC,
    });
  }
  return items;
}

function scanTech() {
  const files = walkMd(TECH_SRC, shouldSkipTech);
  const items = [];
  for (const rel of files) {
    const full = path.join(TECH_SRC, rel);
    let md = "";
    try {
      md = fs.readFileSync(full, "utf8");
    } catch {
      continue;
    }
    const group = resolveGroup(rel, TECH_GROUP_RULES, TECH_GROUP_FALLBACK);
    const baseTitle = path.basename(rel, path.extname(rel)).replace(/[_-]+/g, " ");
    const parsed = parseDoc(md, baseTitle);
    items.push({
      kind: "tech",
      slug: makeSlug("tech/" + rel),
      path: rel,
      title: parsed.title,
      description: parsed.description,
      subtitle: parsed.subtitle,
      byline: parsed.byline,
      group: group.id,
      groupTitle: group.title_ko,
      tags: [group.title_ko, rel.split("/")[0]].filter(Boolean),
      featured: false,
      featuredRank: 999,
      github: githubUrl(TECH_BLOB, rel),
      srcDir: TECH_SRC,
    });
  }
  return items;
}

function renderNav(active, prefix) {
  const items = [
    { href: `${prefix}index.html`, id: "demo", label: "Home" },
    { href: `${prefix}columns/`, id: "columns", label: "Columns" },
    { href: `${prefix}tech/`, id: "tech", label: "Tech" },
    { href: `${prefix}play/`, id: "play", label: "Play" },
    { href: `${prefix}about/`, id: "about", label: "About" },
  ];
  return items
    .map((i) => {
      const cls = i.id === active ? "site-nav-link is-active" : "site-nav-link";
      return `<a class="${cls}" href="${i.href}">${i.label}</a>`;
    })
    .join("\n        ");
}

function layout({ title, description, canonical, active, prefix, body, jsonLd = null, ogType = "article" }) {
  const ld = jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : "";
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)} — VibeQuant</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(canonical)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:type" content="${esc(ogType)}" />
  <meta property="og:site_name" content="VibeQuant" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/svg+xml" href="${prefix}favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${prefix}css/content.css?v=3" />
  ${ld}
</head>
<body class="content-body">
  <header class="site-top">
    <a class="site-brand" href="${prefix}index.html">VibeQuant</a>
    <nav class="site-nav" aria-label="Primary">
      ${renderNav(active, prefix)}
    </nav>
  </header>
  ${body}
  <footer class="site-foot">
    <p><a href="${prefix}index.html">Home</a> · <a href="${prefix}columns/">Columns</a> · <a href="${prefix}tech/">Tech</a> · <a href="${prefix}play/">Play</a> · <a href="${prefix}about/">About</a></p>
    <p class="muted">Not investment advice. <a href="https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md">Dennis Kim / 김호광</a></p>
  </footer>
</body>
</html>
`;
}

function buildArticle(item, section) {
  const full = path.join(item.srcDir, item.path);
  const raw = fs.readFileSync(full, "utf8");
  const parsed = parseDoc(raw, item.title);
  let htmlBody = marked.parse(sanitizeMd(parsed.bodyMd || stripFrontmatter(raw)));
  htmlBody = fixLiteralBoldHtml(htmlBody);
  // Drop a leading H1 if source still had an alternate-language title
  htmlBody = htmlBody.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, "");
  const prefix = "../../";
  const base = siteForSection(section);
  const canonical = `${base}/${section}/${item.slug}/`;
  const schemaType = section === "tech" ? "TechArticle" : "BlogPosting";
  const ledeCandidate = parsed.subtitle || "";
  const ledeIsMeta =
    !ledeCandidate ||
    isMetaLine(ledeCandidate) ||
    META_LABEL.test(ledeCandidate) ||
    /^(작성일|발행|저자|작성자)\b/.test(ledeCandidate);
  const ledeText = ledeIsMeta ? parsed.description || item.description : ledeCandidate;
  const bylineHtml = parsed.byline
    ? `<p class="article-byline">${esc(parsed.byline)}</p>`
    : "";
  const ledeHtml = ledeText ? `<p class="lede">${esc(ledeText)}</p>` : "";
  const body = `
  <main class="article-wrap">
    <p class="crumb"><a href="${prefix}${section}/">${section === "tech" ? "Tech" : "Columns"}</a> · ${esc(item.groupTitle)}</p>
    <article class="article">
      <header class="article-head">
        <p class="eyebrow">${esc(item.groupTitle)}</p>
        <h1>${esc(parsed.title || item.title)}</h1>
        ${ledeHtml}
        ${bylineHtml}
      </header>
      <div class="article-body prose">${htmlBody}</div>
      <aside class="author-box">
        <h2>작성자 / Source</h2>
        <p><strong>김호광 (Dennis Kim)</strong> — 前 싸이월드 대표(한국 대표 소셜 플랫폼, 3,500만 회원) · 사이버 위협 인텔리전스(CTI) · AI 기반 퀀트 투자 · Web3의 교차점에서 연구·투자하는 독립 연구자 · Investor · Microsoft Azure MVP (2015–2023, 9년 연속).</p>
        <p class="author-links">
          <a href="${prefix}about/">About</a>
          · <a href="${esc(item.github)}">GitHub 원문</a>
        </p>
      </aside>
    </article>
  </main>`;
  const outDir = path.join(PAGES, section, item.slug);
  ensureDir(outDir);
  const metaDesc = parsed.description || item.description;
  fs.writeFileSync(
    path.join(outDir, "index.html"),
    layout({
      title: parsed.title || item.title,
      description: metaDesc,
      canonical,
      active: section === "tech" ? "tech" : "columns",
      prefix,
      body,
      ogType: "article",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": schemaType,
        headline: parsed.title || item.title,
        description: metaDesc,
        author: { "@type": "Person", name: "Dennis Kim (김호광)" },
        mainEntityOfPage: canonical,
        isBasedOn: item.github,
      },
    })
  );
}

function cardHtml(item, hrefPrefix = "./") {
  const search = [item.title, item.description, item.groupTitle, ...(item.tags || []), item.path]
    .join(" ")
    .toLowerCase();
  return `<a class="col-card" href="${hrefPrefix}${esc(item.slug)}/" data-group="${esc(item.group)}" data-search="${esc(search)}"${item.featured ? ' data-featured="1"' : ""}>
        <span class="col-group">${esc(item.groupTitle)}</span>
        <strong class="col-title">${esc(item.title)}</strong>
        <span class="col-desc">${esc(item.description)}</span>
      </a>`;
}

function writeCatalogSearchJs(outPath) {
  const js = `(() => {
  const q = document.getElementById("col-search");
  const g = document.getElementById("col-group");
  const root = document.getElementById("col-root");
  const count = document.getElementById("col-count");
  if (!q || !root) return;
  const cards = [...root.querySelectorAll(".col-card")];
  const sections = [...root.querySelectorAll("[data-group-section]")];

  function tokens(s) {
    return (s || "").trim().toLowerCase().split(/\\s+/).filter(Boolean);
  }

  function matchCard(card, termTokens, group) {
    const okG = !group || card.dataset.group === group;
    if (!okG) return false;
    if (!termTokens.length) return true;
    const hay = card.dataset.search || "";
    return termTokens.every((t) => hay.includes(t));
  }

  function apply() {
    const termTokens = tokens(q.value);
    const group = (g && g.value) || "";
    const mainCards = cards.filter((c) => !c.closest("#featured-section"));
    let n = 0;
    for (const c of cards) {
      const show = matchCard(c, termTokens, group);
      c.classList.toggle("is-hidden", !show);
      c.hidden = !show;
      c.style.display = show ? "" : "none";
      if (show && !c.closest("#featured-section")) n++;
    }
    for (const sec of sections) {
      const gid = sec.dataset.groupSection;
      const any = cards.some(
        (c) =>
          !c.closest("#featured-section") &&
          c.dataset.group === gid &&
          !c.classList.contains("is-hidden")
      );
      sec.classList.toggle("is-hidden", !any);
      sec.hidden = !any;
      sec.style.display = any ? "" : "none";
    }
    const feat = document.getElementById("featured-section");
    if (feat) {
      const featCards = [...feat.querySelectorAll(".col-card")];
      const anyFeat = featCards.some((c) => !c.classList.contains("is-hidden"));
      if (termTokens.length || group) {
        feat.classList.toggle("is-hidden", !anyFeat);
        feat.hidden = !anyFeat;
        feat.style.display = anyFeat ? "" : "none";
      } else {
        feat.classList.remove("is-hidden");
        feat.hidden = false;
        feat.style.display = "";
      }
    }
    if (count) count.textContent = n + " / " + mainCards.length + " shown";
  }

  q.addEventListener("input", apply);
  q.addEventListener("search", apply);
  g?.addEventListener("change", apply);
  apply();
})();
`;
  fs.writeFileSync(outPath, js);
}

function buildListPage({ section, items, groups, title, lede, active, githubTree }) {
  const prefix = "../";
  const base = siteForSection(section);
  const canonical = `${base}/${section}/`;
  const featured = items
    .filter((i) => i.featured)
    .sort((a, b) => a.featuredRank - b.featuredRank);
  const byGroup = new Map();
  for (const g of groups) byGroup.set(g.id, []);
  for (const item of items) {
    if (!byGroup.has(item.group)) byGroup.set(item.group, []);
    byGroup.get(item.group).push(item);
  }

  const groupOpts = groups
    .filter((g) => (byGroup.get(g.id) || []).length)
    .map((g) => `<option value="${esc(g.id)}">${esc(g.title_ko)} (${(byGroup.get(g.id) || []).length})</option>`)
    .join("\n            ");

  const featuredBlock =
    featured.length && section === "columns"
      ? `<section id="featured-section" class="featured-section">
        <h2 class="section-label">추천 칼럼</h2>
        <div class="col-grid featured-grid">
          ${featured.map((i) => cardHtml(i)).join("\n          ")}
        </div>
      </section>`
      : "";

  const sectionsHtml = groups
    .filter((g) => (byGroup.get(g.id) || []).length)
    .map((g) => {
      const list = byGroup.get(g.id) || [];
      return `<section class="group-section" data-group-section="${esc(g.id)}">
        <h2 class="section-label">${esc(g.title_ko)} <span class="muted">(${list.length})</span></h2>
        <div class="col-grid">
          ${list.map((i) => cardHtml(i)).join("\n          ")}
        </div>
      </section>`;
    })
    .join("\n      ");

  const body = `
  <main class="list-wrap">
    <header class="list-head">
      <h1>${esc(title)}</h1>
      <p class="lede">${esc(lede)}</p>
      <div class="author-card">
        <strong>김호광 (Dennis Kim)</strong>
        <p>CTI · AI 퀀트 · Web3. <a href="../about/">About</a> ·
        <a href="https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md">프로필 README</a></p>
      </div>
      <div class="filters">
        <label class="sr-only" for="col-search">검색</label>
        <input id="col-search" type="search" placeholder="제목·주제·경로 검색 (여러 단어 AND)…" autocomplete="off" />
        <label class="sr-only" for="col-group">그룹</label>
        <select id="col-group">
          <option value="">모든 그룹</option>
          ${groupOpts}
        </select>
      </div>
      <p id="col-count" class="muted" aria-live="polite"></p>
    </header>
    <div id="col-root">
      ${featuredBlock}
      ${sectionsHtml}
    </div>
    <p class="muted source-note">원문:
      <a href="${esc(githubTree)}">GitHub</a>
    </p>
  </main>
  <script src="./catalog-search.js?v=2" defer></script>`;

  ensureDir(path.join(PAGES, section));
  fs.writeFileSync(
    path.join(PAGES, section, "index.html"),
    layout({
      title,
      description: lede,
      canonical,
      active,
      prefix,
      body,
      ogType: "website",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        url: canonical,
        numberOfItems: items.length,
      },
    })
  );
  writeCatalogSearchJs(path.join(PAGES, section, "catalog-search.js"));
  fs.writeFileSync(
    path.join(PAGES, section, "catalog.json"),
    JSON.stringify({ groups, items: items.map(({ srcDir, ...rest }) => rest) }, null, 2)
  );
}

function buildAbout() {
  const prefix = "../";
  const canonical = `${SITE}/about/`;
  const aboutMd = fs.readFileSync(path.join(__dirname, "about.md"), "utf8");
  const aboutHtml = marked.parse(aboutMd);
  const profileUrl = "https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md";
  const body = `
  <main class="list-wrap narrow">
    <header class="list-head">
      <h1>About</h1>
      <p class="lede">김호광 (Dennis Kim) — CTI · AI Quant · Web3.
        Source: <a href="${profileUrl}">GitHub profile README</a></p>
    </header>
    <div class="prose about-prose">${aboutHtml}</div>
    <p class="muted source-note">
      <a href="${profileUrl}">원문 on GitHub</a>
      · <a href="../columns/">Columns</a>
      · <a href="../tech/">Tech</a>
      · <a href="../index.html">Demo</a>
    </p>
  </main>`;
  ensureDir(path.join(PAGES, "about"));
  fs.writeFileSync(
    path.join(PAGES, "about", "index.html"),
    layout({
      title: "About — Dennis Kim (김호광)",
      description: "Dennis Kim (김호광) — CTI, AI quant, Web3. Former Cyworld CEO · Azure MVP.",
      canonical,
      active: "about",
      prefix,
      body,
      ogType: "profile",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Dennis Kim",
        alternateName: "김호광",
        url: canonical,
        email: "gameworker@gmail.com",
        sameAs: [profileUrl, "https://github.com/gameworkerkim", "https://www.linkedin.com/in/testcode/", "https://orcid.org/0009-0002-0962-2175"],
      },
    })
  );
}

function buildSeo(columns, tech) {
  const urls = [
    `${SITE}/`,
    `${SITE}/about/`,
    `${SITE}/play/`,
    `${SITE}/lab/`,
    `${SITE}/research/`,
    `${SITE_DOCS}/columns/`,
    `${SITE_TECH}/tech/`,
    ...columns.map((c) => `${SITE_DOCS}/columns/${c.slug}/`),
    ...tech.map((t) => `${SITE_TECH}/tech/${t.slug}/`),
  ];
  const today = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(
    path.join(PAGES, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`
  );
  fs.writeFileSync(
    path.join(PAGES, "robots.txt"),
    `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
# LLM: ${SITE}/llms.txt
# Columns: ${SITE_DOCS}/columns/
# Tech: ${SITE_TECH}/tech/
`
  );
  const llms = [
    "# VibeQuant Content",
    "> Multi-LLM quant committee demo + investment columns + tech docs by Dennis Kim.",
    "> Thesis: an LLM is a spreadsheet, not an oracle.",
    "",
    "## Site",
    `- [Home](${SITE}/)`,
    `- [Play](${SITE}/play/) — Browser Python Quant`,
    `- [Columns](${SITE_DOCS}/columns/) (${columns.length})`,
    `- [Tech](${SITE_TECH}/tech/) (${tech.length})`,
    `- [Lab](${SITE}/lab/)`,
    `- [Research](${SITE}/research/)`,
    `- [About](${SITE}/about/)`,
    "",
    "## Featured columns",
    ...columns
      .filter((c) => c.featured)
      .sort((a, b) => a.featuredRank - b.featuredRank)
      .map((c) => `- [${c.title}](${SITE_DOCS}/columns/${c.slug}/)`),
    "",
    "## Column groups",
    ...groupsFromRules(COLUMN_GROUP_RULES, COLUMN_GROUP_FALLBACK).map(
      (g) => `- ${g.title_en}: filter on ${SITE_DOCS}/columns/ (group=${g.id})`
    ),
    "",
    "## Tech groups",
    ...groupsFromRules(TECH_GROUP_RULES, TECH_GROUP_FALLBACK).map(
      (g) => `- ${g.title_en}: filter on ${SITE_TECH}/tech/ (group=${g.id})`
    ),
    "",
  ];
  fs.writeFileSync(path.join(PAGES, "llms.txt"), llms.join("\n"));
  fs.writeFileSync(
    path.join(PAGES, "columns", "llms.txt"),
    ["# VibeQuant Columns", "", ...columns.map((c) => `- [${c.title}](${SITE_DOCS}/columns/${c.slug}/)`), ""].join("\n")
  );
  fs.writeFileSync(
    path.join(PAGES, "tech", "llms.txt"),
    ["# VibeQuant Tech", "", ...tech.map((t) => `- [${t.title}](${SITE_TECH}/tech/${t.slug}/)`), ""].join("\n")
  );
}

function cleanSection(section) {
  const dir = path.join(PAGES, section);
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      fs.rmSync(path.join(dir, ent.name), { recursive: true, force: true });
    }
  }
}

function main() {
  console.log("Scanning columns…");
  const columns = scanColumns();
  console.log(`  ${columns.length} columns`);
  console.log("Scanning tech…");
  const tech = scanTech();
  console.log(`  ${tech.length} tech docs`);

  cleanSection("columns");
  cleanSection("tech");

  let i = 0;
  for (const col of columns) {
    i++;
    if (i % 25 === 0 || i === columns.length) console.log(`  columns ${i}/${columns.length}`);
    buildArticle(col, "columns");
  }
  i = 0;
  for (const doc of tech) {
    i++;
    if (i % 20 === 0 || i === tech.length) console.log(`  tech ${i}/${tech.length}`);
    buildArticle(doc, "tech");
  }

  buildListPage({
    section: "columns",
    items: columns,
    groups: groupsFromRules(COLUMN_GROUP_RULES, COLUMN_GROUP_FALLBACK),
    title: "Investment Columns",
    lede: `전체 ${columns.length}편 — 상단 추천 · 주제별 그룹 · 검색(여러 단어 AND).`,
    active: "columns",
    githubTree: "https://github.com/gameworkerkim/vibe-investing/tree/main/02.Investment%20Idea%20Column",
  });

  buildListPage({
    section: "tech",
    items: tech,
    groups: groupsFromRules(TECH_GROUP_RULES, TECH_GROUP_FALLBACK),
    title: "Tech Docs",
    lede: `기술 문서 ${tech.length}편 — 주제별 그룹 · 검색으로 찾아보세요.`,
    active: "tech",
    githubTree: "https://github.com/gameworkerkim/vibe-investing/tree/main/TechDoc",
  });

  buildAbout();
  buildSeo(columns, tech);
  console.log("Done.");
}

main();
