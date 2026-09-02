#!/usr/bin/env node
/**
 * Scan Investment Idea Column + TechDoc + CTI → static Pages HTML
 * with group sections, search, and featured items.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import {
  COLUMN_GROUP_RULES,
  COLUMN_GROUP_FALLBACK,
  TECH_GROUP_RULES,
  TECH_GROUP_FALLBACK,
  FEATURED_COLUMN_PATHS,
  FEATURED_MEDIA_COLUMN_PATHS,
  FEATURED_TECH_PATHS,
  FEATURED_ESSAY_PATHS,
  ESSAY_GROUP_RULES,
  ESSAY_GROUP_FALLBACK,
  resolveGroup,
  groupsFromRules,
} from "./groups.mjs";
import {
  CTI_GROUP_RULES,
  CTI_GROUP_FALLBACK,
  FEATURED_CTI_PATHS,
} from "./cti-groups.mjs";
import {
  resolveItemDates,
  formatDisplayDate,
  langToHreflang,
  loadGitDates,
  unifyFamilyDates,
  normalizeTitleKey,
} from "./dates.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const VQ = path.resolve(__dirname, "..");
const PAGES = path.join(VQ, "pages");
const COL_SRC = path.join(ROOT, "02.Investment Idea Column");
const MEDIA_COL_SRC = path.join(ROOT, "03. Media-Column");
const TECH_SRC = path.join(ROOT, "TechDoc");
const CTI_SRC =
  process.env.CTI_SRC ||
  path.resolve(ROOT, "../CYBER-THREAT-INTELLIGENCE-REPORT");
const ESSAY_SRC =
  process.env.ESSAY_SRC ||
  path.join(__dirname, "_external/essays");
const SITE = process.env.SITE_URL || "https://vibequant.cc";
const SITE_DOCS = process.env.SITE_DOCS_URL || "https://docs.vibequant.cc";
const SITE_TECH = process.env.SITE_TECH_URL || "https://tech.vibequant.cc";
const SITE_CTI = process.env.SITE_CTI_URL || "https://cti.vibequant.cc";
const SITE_PLAY = process.env.SITE_PLAY_URL || "https://play.vibequant.cc";
const SITE_ESSAY = process.env.SITE_ESSAY_URL || "https://vibequant.cc";
const SITE_LAB = process.env.SITE_LAB_URL || "https://vibequant.cc/lab/";
const SITE_RESEARCH = process.env.SITE_RESEARCH_URL || "https://vibequant.cc/research/";
const COL_BLOB = "https://github.com/gameworkerkim/vibe-investing/blob/main/02.Investment%20Idea%20Column";
const MEDIA_COL_BLOB =
  "https://github.com/gameworkerkim/vibe-investing/blob/main/03.%20Media-Column";
const TECH_BLOB = "https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc";
const CTI_BLOB = "https://github.com/gameworkerkim/CYBER-THREAT-INTELLIGENCE-REPORT/blob/main";
const ESSAY_BLOB = "https://github.com/gameworkerkim/essays/blob/main";
const GITHUB_HOME = "https://github.com/gameworkerkim/vibe-investing";
const ORCID_URL = "https://orcid.org/0009-0002-0962-2175";
const SSRN_AUTHOR_URL =
  "https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=11276088";
/** Representative ETNews-bylined column (no stable writer profile URL published). */
const ETNEWS_AUTHOR_URL = "https://www.etnews.com/20260223000270";
const LINKEDIN_URL = "https://www.linkedin.com/in/testcode/";
const GITHUB_PROFILE_URL = "https://github.com/gameworkerkim";
const GITHUB_README_URL =
  "https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md";
const PERSON_ID = `${SITE}/about/#person`;
const ORG_ID = `${SITE}/#organization`;
const LOGO_URL = `${SITE}/og-default.png`;

const PERSON_SAME_AS = [
  GITHUB_README_URL,
  GITHUB_PROFILE_URL,
  LINKEDIN_URL,
  ORCID_URL,
  SSRN_AUTHOR_URL,
  ETNEWS_AUTHOR_URL,
];

const ORG_SAME_AS = [
  GITHUB_HOME,
  GITHUB_PROFILE_URL,
  ORCID_URL,
  SSRN_AUTHOR_URL,
  ETNEWS_AUTHOR_URL,
  LINKEDIN_URL,
];

const AUTHOR_BIO = {
  default:
    "<strong>김호광 (Dennis Kim)</strong> — 前 싸이월드 대표(한국 대표 소셜 플랫폼, 3,500만 회원) · 사이버 위협 인텔리전스(CTI) · AI 기반 퀀트 투자 · Web3의 교차점에서 연구·투자하는 독립 연구자 · Investor · Microsoft Azure MVP (2015–2023, 9년 연속).",
  cti: "<strong>Dennis Kim</strong> · 前 싸이월드 대표.",
};

function organizationLd(extra = {}) {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "VibeQuant",
    url: absoluteSitePath(SITE),
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
    },
    sameAs: ORG_SAME_AS,
    founder: { "@id": PERSON_ID },
    ...extra,
  };
}

function personAuthorLd(extra = {}) {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Dennis Kim",
    alternateName: "김호광",
    url: `${SITE}/about/`,
    email: "gameworker@gmail.com",
    identifier: ORCID_URL,
    sameAs: PERSON_SAME_AS,
    ...extra,
  };
}

function breadcrumbLd(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

function siteForSection(section) {
  if (section === "columns") return SITE_DOCS;
  if (section === "tech") return SITE_TECH;
  if (section === "cti") return SITE_CTI;
  if (section === "essays") return SITE_ESSAY;
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
  let s = String(md ?? "").replace(/^\uFEFF/, "");
  // Leading HTML comments often wrap YAML / JSON-LD; also strip HEAD refs after live YAML
  for (let pass = 0; pass < 4; pass++) {
    const m = s.match(/^\s*<!--[\s\S]*?-->\s*/);
    if (m) {
      s = s.slice(m[0].length);
      continue;
    }
    if (s.startsWith("---")) {
      const end = s.indexOf("\n---", 3);
      if (end !== -1) {
        s = s.slice(end + 4);
        continue;
      }
    }
    break;
  }
  return s.replace(/^\s+/, "");
}

/** Parse YAML-ish key values from leading `---` or `<!-- --- ... --- -->` blocks. */
function parseColumnMeta(md) {
  const text = String(md ?? "").replace(/^\uFEFF/, "");
  let fm = "";
  if (text.startsWith("---")) {
    const end = text.indexOf("\n---", 3);
    if (end !== -1) fm = text.slice(3, end);
  }
  if (!fm) {
    const comments = text.match(/<!--[\s\S]*?-->/g) || [];
    for (const block of comments.slice(0, 3)) {
      const inner = block.replace(/^<!--\s*/, "").replace(/\s*-->$/, "");
      if (/^\s*---/.test(inner) || /\n(?:title|date|media|source_url|group)\s*:/i.test(inner)) {
        fm = inner.replace(/^\s*---\s*/, "").replace(/\s*---\s*$/, "");
        break;
      }
    }
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
    else if (/^\d+$/.test(val)) val = Number(val);
    meta[key] = val;
    i++;
  }
  return meta;
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
  // ** spaced ** (horizontal whitespace only; skip closing ** after . or word — e.g. ".** 그")
  s = s.replace(/(?<![.*\w\uAC00-\uD7A3%)\]])\*\*[ \t]+([^*\n]+?)[ \t]*\*\*/g, (_, t) => `**${t.trim()}**`);
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

/**
 * GitHub CTI MD uses relative sibling links like CTI-…_EN.md for language switchers.
 * On the published site those must become /cti/<slug>/ (or GitHub blob as fallback).
 */
function rewriteCtiRelativeMdLinks(html, item, hrefPrefix) {
  const langs = item.langs || {};
  return String(html ?? "").replace(
    /\bhref=(["'])([^"']+\.md(?:#[^"']*)?)\1/gi,
    (full, quote, href) => {
      if (/^(?:https?:|mailto:|\/\/)/i.test(href)) return full;
      const [filePart, hash = ""] = href.split("#");
      const base = path.basename(String(filePart).replace(/^\.\//, ""));
      const langM = base.match(/_(KR|EN|JP|CN|ZH|JA)\.md$/i);
      if (langM) {
        const lang = normalizeCtiLang(langM[1]);
        const slug = langs[lang];
        if (slug) {
          const frag = hash ? `#${hash}` : "";
          return `href=${quote}${hrefPrefix}${slug}/${frag}${quote}`;
        }
      }
      // Same-repo relative MD → GitHub blob so links never 404 on Pages
      const blob = githubUrl(CTI_BLOB, base);
      return `href=${quote}${blob}${quote}`;
    }
  );
}

function isPipeMetaRow(line) {
  const t = String(line ?? "").trim();
  return t.startsWith("|") && t.includes("|");
}

/** CTI reports often start with a 2-column key/value GFM table. */
function parsePipeMetaTable(lines, startIdx) {
  let i = startIdx;
  if (!isPipeMetaRow(lines[i])) return null;
  const meta = {};
  let rows = 0;
  while (i < lines.length) {
    const raw = lines[i];
    if (!String(raw ?? "").trim()) {
      i++;
      continue;
    }
    if (!isPipeMetaRow(raw)) break;
    const cells = String(raw)
      .split("|")
      .map((c) => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    if (cells.length >= 2) {
      const key = cells[0].replace(/\\_/g, "_").replace(/\s+/g, " ").trim().toLowerCase();
      if (key && !/^[-:]+$/.test(key) && key !== "----") {
        meta[key] = cleanInline(cells.slice(1).join(" | "));
        rows++;
      }
    }
    i++;
  }
  if (rows < 2) return null;
  return { meta, end: i };
}

function stripLeadingMetaBlocks(bodyMd) {
  let text = bodyMd.replace(/^\s+/, "");
  let guard = 0;
  while (text && guard++ < 30) {
    if (/^---+\s*\n*/.test(text)) {
      text = text.replace(/^---+\s*\n*/, "");
      continue;
    }
    // leading CTI key/value table
    if (text.trimStart().startsWith("|")) {
      const tLines = text.split(/\r?\n/);
      let j = 0;
      while (j < tLines.length && !tLines[j].trim()) j++;
      const tbl = parsePipeMetaTable(tLines, j);
      if (tbl) {
        text = tLines.slice(tbl.end).join("\n").replace(/^\s+/, "");
        continue;
      }
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
  let subtitle = "";
  let byline = "";

  // CTI-style leading key/value table
  const pipeMeta = parsePipeMetaTable(lines, i);
  if (pipeMeta) {
    if (pipeMeta.meta.title) title = pipeMeta.meta.title.slice(0, 160);
    if (pipeMeta.meta.subtitle) subtitle = pipeMeta.meta.subtitle.slice(0, 160);
    const author = pipeMeta.meta.author || pipeMeta.meta["작성자"];
    const date = pipeMeta.meta.date || pipeMeta.meta["작성일"] || pipeMeta.meta["발행일"];
    if (author || date) {
      byline = [author, date].filter(Boolean).join(" · ").slice(0, 140);
    }
    i = pipeMeta.end;
  }

  while (i < lines.length && !lines[i].trim()) i++;

  if (lines[i]?.match(/^#\s+/)) {
    const h1 = cleanInline(lines[i].replace(/^#\s+/, "")).slice(0, 160);
    if (h1) title = h1;
    i++;
  } else if (!pipeMeta?.meta?.title) {
    const m = raw.match(/^#\s+(.+)$/m) || raw.match(/^##\s+(.+)$/m);
    if (m) title = cleanInline(m[1]).slice(0, 160) || fallbackTitle;
  }

  // optional second H1 (EN title etc.) — skip for body, keep KO as page title
  while (i < lines.length && !lines[i].trim()) i++;
  if (lines[i]?.match(/^#\s+/)) i++;

  while (i < lines.length && !lines[i].trim()) i++;

  if (!subtitle && lines[i]?.match(/^##\s+/)) {
    const h = lines[i].replace(/^##\s+/, "");
    if (isSubtitleHeading(h)) {
      subtitle = cleanInline(h);
      i++;
    }
  }

  // Bold-only dek / italic dek right under title
  while (i < lines.length && !lines[i].trim()) i++;
  if (!subtitle && lines[i] && /^\*\*[^*\n]+\*\*\s*$/.test(lines[i].trim())) {
    const cand = cleanInline(lines[i]);
    if (!isMetaLine(cand) && !META_LABEL.test(cand)) {
      subtitle = cand;
      i++;
    }
  }
  if (!subtitle && lines[i] && /^\*[^*\n]+\*\s*$/.test(lines[i].trim())) {
    const cand = cleanInline(lines[i]);
    if (!isMetaLine(cand) && cand.length > 12) {
      subtitle = cand;
      i++;
    }
  }

  while (i < lines.length && !lines[i].trim()) i++;

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
      const sub = cleanInline(line).match(/^부제\s*[:：]\s*(.+)/i);
      if (sub && !subtitle) subtitle = sub[1].slice(0, 160);
      i++;
      continue;
    }
    break;
  }

  while (i < lines.length && (!lines[i].trim() || /^---+$/.test(lines[i].trim()))) i++;

  let bodyMd = stripLeadingMetaBlocks(lines.slice(i).join("\n"));

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

/**
 * Readable slugs (no content-hash). Collisions get -2, -3…
 * Viral / hand-picked URLs via SLUG_OVERRIDES.
 */
const SLUG_OVERRIDES = {
  "Cyworld/The-Pros-and-Cons-of-VC-Investment-as-Seen-Through-the-Cyworld-RCPS-Contract.md":
    "cyworld-rcps-vc-investment-pros-cons",
  "Startup/Shelf-Life-of-Innovation.md": "shelf-life-of-innovation",
  "AI_Revolution/Sandisk-Semiconductor-Quant-Column.md": "sandisk-semiconductor-quant",
  "Alibaba/Qwen38-27B-Review.md": "qwen38-27b-review",
  "StableCoin/Medici-to-Siliconvalley-column.md": "medici-to-siliconvalley",
  "Hacking/BackDoor-ENDLESS-DOORS.md": "backdoor-endless-doors",
  "SSD/SSD-Power-OFF-Retention-Risk.md": "ssd-power-off-retention-risk",
  "Cyworld/Cyworld-Server-Restoration-Playbook.md": "cyworld-server-restoration-playbook",
  "Windows10/EOD-Win10-China.md": "eod-win10-china",
  "Bending spoons/Bending spoons playbook analysis.md": "bending-spoons-playbook",
  "Travel-Rule/Travel-Rule-1won-Market-Shift.md": "travel-rule-1won-market-shift",
  "AI-Education/AI-Era-Developer-Flow-and-Communication.md": "ai-era-developer-flow-communication",
  "Cyworld/Cyworld-True-Mother-Guestbook.md": "cyworld-true-mother-guestbook",
  "comics/X-Men-The-Economics-of-the-Borderline-People.md": "x-men-economics-borderline-people",
  "Post-COVID/End-of-Drink-age.md": "end-of-drink-age",
  "AI_Revolution/AI-Between-Coolness-and-Passion.md": "ai-between-coolness-and-passion",
  "주식시황/Column-Kioxia-Q1FY2026.md": "kioxia-q1fy2026",
  "주식시황/Column-Kioxia-Q1FY2026_EN.md": "kioxia-q1fy2026-en",
  "주식시황/Column-Kioxia-Q1FY2026_JA.md": "kioxia-q1fy2026-ja",
  "AI_Hacking/Column-AI-Control-Failure-260813.md": "ai-control-failure",
  "AI_Hacking/Column-Project-Perception-20260729.md": "project-perception-20260729",
  "AI_Hacking/Column-Project-Perception-20260729_EN.md": "project-perception-20260729-en",
  "AI_Hacking/Column-Project-Perception-20260729_JA.md": "project-perception-20260729-ja",
  "AI_Hacking/Column-Project-Perception-20260729_ZH.md": "project-perception-20260729-cn",
  "News Letter/vibe-quant-insight-001.md": "vibe-quant-insight-001",
  "News Letter/vibe-quant-insight-001-en.md": "vibe-quant-insight-001-en",
  "News Letter/vibe-quant-insight-001-ja.md": "vibe-quant-insight-001-ja",
  "KIMI-K3/KIMI-K3-Cloud-Install-Guide.md": "kimi-k3-cloud-install-guide",
  "KIMI-K3/KIMI-K3-Cloud-Install-Guide_EN.md": "kimi-k3-cloud-install-guide-en",
  "KIMI-K3/KIMI-K3-Cloud-Install-Guide_JA.md": "kimi-k3-cloud-install-guide-ja",
  "AI-Bottleneck/AI-Bottleneck.md": "ai-bottleneck",
  "AI-Bottleneck/Nvidia-AI-Infra.md": "nvidia-ai-infra",
  "AI-Bottleneck/Column-AI-privacy-public-safety.md": "ai-privacy-public-safety",
  "AI Bouble/Nvidia-Fait-Accompli.md": "nvidia-fait-accompli",
  "K-Movie/Screen-Quota-System.md": "screen-quota-system",
  "K11/Adrian-Cheng-Fall.md": "adrian-cheng-fall",
  "Prediction-Market/Prediction-Market-Growth-and-Opportunity.md": "prediction-market-growth-and-opportunity",
  "Prediction-Market/Prediction-Market-Growth-and-Opportunity_EN.md": "prediction-market-growth-and-opportunity-en",
  "Prediction-Market/Prediction-Market-Growth-and-Opportunity_JA.md": "prediction-market-growth-and-opportunity-ja",
  "LLM_MiniMax/MiniMax-H3-GettingStart.md": "minimax-h3-gettingstart",
  "LLM_MiniMax/MiniMax-H3-GettingStart_EN.md": "minimax-h3-gettingstart-en",
  "LLM_MiniMax/MiniMax-H3-GettingStart_CN.md": "minimax-h3-gettingstart-cn",
  "LLM_MiniMax/MiniMax-H3-GettingStart_JA.md": "minimax-h3-gettingstart-ja",
  "CTI-2026-0804-COLDCARD-RNG_KR.md": "coldcard-rng-20260804",
  "CTI-2026-0804-COLDCARD-RNG_EN.md": "coldcard-rng-20260804-en",
  "CTI-2026-0804-COLDCARD-RNG_JA.md": "coldcard-rng-20260804-ja",
  "CTI-2026-0804-COLDCARD-RNG_CN.md": "coldcard-rng-20260804-cn",
  "CTI-2026-0822-Column-KR.md": "cert-authority-breach-20260822",
  "CTI-2026-0822-Column-EN.md": "cert-authority-breach-20260822-en",
  "CTI-2026-0822-Column-JA.md": "cert-authority-breach-20260822-ja",
  "CTI-2026-0822-Column-CN.md": "cert-authority-breach-20260822-cn",
  "USA/Age-of-USD.md": "age-of-usd",
  "AI-IDC/Why-High-Power-Datacenter.md": "why-high-power-datacenter",
  "BitCoin/BTC-Arbitrage-Bithumb-Column.md": "btc-arbitrage-bithumb",
  "Internet/CIA-North-Lorea-Opsec-Column.md": "cia-north-korea-opsec",
  "interest/History-of-Interest.md": "history-of-interest",
  "AMQS-BIO/Immortal-Subscription-Model-Column.md": "immortal-subscription-model",
  "AI_Revolution/China-AI-IPO-Bouble.md": "china-ai-ipo-bubble",
  "Capital-Market/Kim-Junbeom-Fugitive-Verdicts-Column.md": "kim-junbeom-fugitive-verdicts",
  "Key-Currency/First-Key-Currency.md": "wushu-first-key-currency",
  "Key-Currency/The-Fall-of-the-Empire.md": "fall-of-the-empire-currency",
  "Key-Currency/Climate-Crisis-and-the-Fall-of-Empires.md": "climate-crisis-fall-of-empires",
  "Key-Currency/Sons-in-law-of-the-Golden-Clan.md": "sons-in-law-golden-clan",
  "Key-Currency/The-Rise-and-Fall of-the-Mughal-Empire.md": "rise-and-fall-mughal-empire",
  "Failure-of-the-Japanese-Judicial-System/Failure-of-the-Japanese-Judicial-System.md": "failure-japanese-judicial-system",
};

const slugRegistry = new Map(); // section -> Set<slug>
/** Permanent alias→canon redirects discovered during slug allocation (-jp→-ja, -zh→-cn). */
const langSuffixRedirects = []; // { section, fromSlug, toSlug }

function resetSlugRegistry() {
  slugRegistry.clear();
  langSuffixRedirects.length = 0;
}

/** Canon lang URL suffixes: -jp→-ja, -zh→-cn (tech convention). */
function canonicalizeLangSlug(slug) {
  const s = String(slug || "");
  if (/-jp$/i.test(s)) return s.replace(/-jp$/i, "-ja");
  if (/-zh$/i.test(s)) return s.replace(/-zh$/i, "-cn");
  return s;
}

function slugifyPath(relPath) {
  const norm = String(relPath || "").replace(/\\/g, "/");
  if (SLUG_OVERRIDES[norm]) return SLUG_OVERRIDES[norm];
  const noExt = norm.replace(/\.md$/i, "");
  const ascii = noExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return ascii || "doc";
}

function allocateSlug(section, relPath) {
  if (!slugRegistry.has(section)) slugRegistry.set(section, new Set());
  const used = slugRegistry.get(section);
  const natural = slugifyPath(relPath);
  const preferred = canonicalizeLangSlug(natural);
  let slug = preferred;
  let n = 2;
  while (used.has(slug)) {
    slug = `${preferred}-${n++}`;
  }
  used.add(slug);
  // Only permanent-map true lang alias remaps (-jp→-ja / -zh→-cn).
  // Never redirect preferred → preferred-2 on collisions — that steals the first owner's URL.
  if (natural !== preferred) {
    langSuffixRedirects.push({ section, fromSlug: natural, toSlug: slug });
  }
  return slug;
}

/** @deprecated use allocateSlug — kept for any external callers */
function makeSlug(relPath) {
  return slugifyPath(relPath);
}

const REDIRECT_BEGIN = "# --- AUTO SLUG REDIRECTS (generated; do not edit) ---";
const REDIRECT_END = "# --- END AUTO SLUG REDIRECTS ---";

function contentKeyFromArticleHtml(html, section) {
  // Prefer GitHub blob links (media columns often set isBasedOn to the publisher URL).
  const githubRe = /https:\/\/github\.com\/[^"'\\\s]+\/blob\/main\/[^"'\\\s]+/g;
  let gm;
  while ((gm = githubRe.exec(html))) {
    const key = githubUrlToContentKey(gm[0], section);
    if (key) return key;
  }
  const based = html.match(/"isBasedOn"\s*:\s*"([^"]+)"/);
  if (based) {
    const key = githubUrlToContentKey(based[1], section);
    if (key) return key;
  }
  return null;
}

function loadLegacySlugIndex() {
  /** @type {Map<string, { section: string, oldSlug: string }>} */
  const byKey = new Map();
  for (const section of ["columns", "tech", "cti", "essays"]) {
    const dir = path.join(PAGES, section);
    if (!fs.existsSync(dir)) continue;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      // Skip redirect stubs — they have no article body / github source.
      const indexPath = path.join(dir, ent.name, "index.html");
      if (!fs.existsSync(indexPath)) continue;
      let html = "";
      try {
        html = fs.readFileSync(indexPath, "utf8");
      } catch {
        continue;
      }
      if (isRedirectStubHtml(html)) continue;
      const key = contentKeyFromArticleHtml(html, section);
      if (!key) continue;
      byKey.set(`${section}::${key}`, { section, oldSlug: ent.name });
    }
  }
  return byKey;
}

/** Durable old→current slug map (survives cleanSection). Merged into slug-history. */
function loadLegacySlugSeed() {
  const seedPath = path.join(VQ, "content", "legacy-slugs.json");
  if (!fs.existsSync(seedPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(seedPath, "utf8")) || {};
  } catch {
    return {};
  }
}

function githubUrlToContentKey(url, section) {
  let u = "";
  try {
    u = decodeURIComponent(String(url || ""));
  } catch {
    u = String(url || "");
  }
  u = u.replace(/\\/g, "/");
  const mainIdx = u.indexOf("/blob/main/");
  if (mainIdx === -1) return null;
  let rest = u.slice(mainIdx + "/blob/main/".length);
  if (section === "columns") {
    const inv = "02.Investment Idea Column/";
    const media = "03. Media-Column/";
    if (rest.includes(inv)) return rest.slice(rest.indexOf(inv) + inv.length);
    if (rest.includes(media)) return "media/" + rest.slice(rest.indexOf(media) + media.length);
    // already relative in some pages
    if (!rest.includes("github.com")) return rest;
  }
  if (section === "tech") {
    const marker = "TechDoc/";
    if (rest.includes(marker)) return rest.slice(rest.indexOf(marker) + marker.length);
  }
  if (section === "cti") {
    // repo root files
    return path.basename(rest);
  }
  if (section === "essays") {
    return rest.replace(/^essays\//i, "");
  }
  return rest;
}

function contentKeyForItem(item, section) {
  if (section === "columns") return String(item.path || item.relPath || "").replace(/\\/g, "/");
  if (section === "cti") return path.basename(String(item.path || item.relPath || ""));
  return String(item.path || item.relPath || "").replace(/\\/g, "/");
}

function loadSlugHistory() {
  const historyPath = path.join(PAGES, "slug-history.json");
  if (!fs.existsSync(historyPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(historyPath, "utf8")) || {};
  } catch {
    return {};
  }
}

function loadRedirectsMap() {
  const mapPath = path.join(__dirname, "redirects.map");
  /** @type {{ section: string, fromSlug: string, toSlug: string }[]} */
  const out = [];
  if (!fs.existsSync(mapPath)) return out;
  for (const line of fs.readFileSync(mapPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const parts = t.split(/\t+/);
    if (parts.length < 2) continue;
    const from = parts[0].trim();
    const to = parts[1].trim();
    const fm = from.match(/^\/(columns|tech|cti|essays)\/([^/]+)\/?$/);
    const tm = to.match(/^\/(columns|tech|cti|essays)\/([^/]+)\/?$/);
    if (!fm || !tm || fm[1] !== tm[1]) continue;
    out.push({ section: fm[1], fromSlug: fm[2], toSlug: tm[2] });
  }
  return out;
}

function appendRedirectsMap(entries) {
  const mapPath = path.join(__dirname, "redirects.map");
  const existing = new Set();
  if (fs.existsSync(mapPath)) {
    for (const line of fs.readFileSync(mapPath, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      existing.add(t.split(/\t+/)[0].trim());
    }
  }
  const lines = [];
  for (const e of entries) {
    const from = `/${e.section}/${e.fromSlug}/`;
    const to = `/${e.section}/${e.toSlug}/`;
    if (existing.has(from) || e.fromSlug === e.toSlug) continue;
    // Never rewrite media-column archive URLs.
    if (e.section === "columns" && /^media-/i.test(e.fromSlug)) continue;
    lines.push(`${from}\t${to}`);
    existing.add(from);
  }
  if (!lines.length) return;
  const stamp = `\n# --- auto lang-suffix ${new Date().toISOString().slice(0, 10)} ---\n`;
  fs.appendFileSync(mapPath, stamp + lines.join("\n") + "\n");
}

function isRedirectStubHtml(html) {
  return (
    /http-equiv=["']refresh["']/i.test(html) &&
    (/Moved to/i.test(html) || /<title>\s*Moved\s*<\/title>/i.test(html))
  );
}

/** Remove legacy redirect stub pages so _redirects 301s are never shadowed by static 200s. */
function purgeRedirectStubDirs() {
  let removed = 0;
  for (const section of ["columns", "tech", "cti", "essays"]) {
    const dir = path.join(PAGES, section);
    if (!fs.existsSync(dir)) continue;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      const indexPath = path.join(dir, ent.name, "index.html");
      if (!fs.existsSync(indexPath)) continue;
      let html = "";
      try {
        html = fs.readFileSync(indexPath, "utf8");
      } catch {
        continue;
      }
      if (!isRedirectStubHtml(html)) continue;
      fs.rmSync(path.join(dir, ent.name), { recursive: true, force: true });
      removed += 1;
    }
  }
  return removed;
}

function writeSlugRedirects(legacyIndex, sections) {
  /** @type {Record<string, { current: string, previous: string[] }>} */
  const history = loadSlugHistory();
  const seed = loadLegacySlugSeed();
  const rules = [];
  let moveCount = 0;
  const seenRule = new Set();
  /** @type {Map<string, string>} section/oldSlug -> newSlug (first claim wins) */
  const claimedOld = new Map();

  // Merge permanent redirects.map + lang-suffix redirects from this build.
  appendRedirectsMap(langSuffixRedirects);
  const mapEntries = [...loadRedirectsMap(), ...langSuffixRedirects];
  for (const e of mapEntries) {
    const claimKey = `${e.section}/${e.fromSlug}`;
    if (claimedOld.has(claimKey)) continue;
    if (e.fromSlug === e.toSlug) continue;
    claimedOld.set(claimKey, e.toSlug);
    const toPath = `/${e.section}/${e.toSlug}/`;
    const fromPath = `/${e.section}/${e.fromSlug}/`;
    const pathRule = `${fromPath}  ${toPath}  301`;
    const bareRule = `/${e.section}/${e.fromSlug}  ${toPath}  301`;
    if (!seenRule.has(pathRule)) {
      rules.push(pathRule);
      seenRule.add(pathRule);
    }
    if (!seenRule.has(bareRule)) {
      rules.push(bareRule);
      seenRule.add(bareRule);
    }
    moveCount += 1;
  }

  for (const { section, items } of sections) {
    for (const item of items) {
      const key = `${section}::${contentKeyForItem(item, section)}`;
      const entry = history[key] || { current: "", previous: [] };
      const previous = new Set(entry.previous || []);
      if (entry.current && entry.current !== item.slug) previous.add(entry.current);
      const fromLegacy = legacyIndex.get(key);
      if (fromLegacy?.oldSlug && fromLegacy.oldSlug !== item.slug) {
        previous.add(fromLegacy.oldSlug);
      }
      // Seed file: { "columns::path.md": ["old-slug-hash", ...] }
      const seeded = seed[key];
      if (Array.isArray(seeded)) {
        for (const s of seeded) if (s && s !== item.slug) previous.add(s);
      }
      previous.delete(item.slug);

      const kept = [];
      for (const oldSlug of [...previous].sort()) {
        const claimKey = `${section}/${oldSlug}`;
        const prior = claimedOld.get(claimKey);
        if (prior && prior !== item.slug) {
          console.warn(
            `  skip duplicate legacy slug ${claimKey} → ${item.slug} (kept ${prior})`
          );
          continue;
        }
        claimedOld.set(claimKey, item.slug);
        kept.push(oldSlug);
      }
      history[key] = { current: item.slug, previous: kept };

      const toPath = `/${section}/${item.slug}/`;
      for (const oldSlug of kept) {
        const fromPath = `/${section}/${oldSlug}/`;
        const pathRule = `${fromPath}  ${toPath}  301`;
        const bareRule = `/${section}/${oldSlug}  ${toPath}  301`;
        if (!seenRule.has(pathRule)) {
          rules.push(pathRule);
          seenRule.add(pathRule);
        }
        if (!seenRule.has(bareRule)) {
          rules.push(bareRule);
          seenRule.add(bareRule);
        }
        moveCount += 1;
      }
    }
  }

  const redirectsPath = path.join(PAGES, "_redirects");
  let base = fs.existsSync(redirectsPath) ? fs.readFileSync(redirectsPath, "utf8") : "";
  const start = base.indexOf(REDIRECT_BEGIN);
  const end = base.indexOf(REDIRECT_END);
  if (start !== -1 && end !== -1 && end > start) {
    base = (base.slice(0, start) + base.slice(end + REDIRECT_END.length)).trimEnd() + "\n";
  }
  // drop prior manual CrytoHFT block (now covered by AUTO) if present
  base = base
    .split("\n")
    .filter((line) => !/crytohft-hft-infra/i.test(line) && !/CrytoHFT typo/i.test(line) && !/path-only CrytoHFT/i.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();

  const block = [
    "",
    REDIRECT_BEGIN,
    `# ${rules.length} rules · stub HTML disabled (rely on _redirects 301)`,
    ...rules,
    REDIRECT_END,
    "",
  ].join("\n");
  fs.writeFileSync(redirectsPath, base + "\n" + block);

  // Never write stub index.html — static assets can shadow _redirects and reintroduce soft-404s.
  const purged = purgeRedirectStubDirs();

  const mapPath = path.join(PAGES, "slug-map.json");
  const map = {};
  for (const { section, items } of sections) {
    map[section] = {};
    for (const item of items) {
      map[section][contentKeyForItem(item, section)] = item.slug;
    }
  }
  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
  fs.writeFileSync(path.join(PAGES, "slug-history.json"), JSON.stringify(history, null, 2));
  console.log(`  slug redirects: ${moveCount} moves (${rules.length} rules); purged ${purged} stub dirs`);
}

function githubUrl(base, relPath) {
  return `${base}/${relPath.split("/").map(encodeURIComponent).join("/")}`;
}

function shouldSkipColumn(rel) {
  const n = path.basename(rel).toLowerCase();
  const p = rel.replace(/\\/g, "/").toLowerCase();
  if (n === "readme.md" || n === "llms.txt" || n === "ideanote.md") return true;
  if (n === "fix_history.md" || n === "media-columns.csv") return true;
  if (n === "description.md" || n === "descsiption.md") return true;
  if (n === "column_guideline.md" || n === "column_template.md") return true;
  if (n === "changelog.md" || n === "data_dictionary.md" || n === "figures_guide.md") return true;
  if (n.startsWith("_")) return true;
  if (rel.includes("/result/")) return true;
  if (p.includes("/prompt/")) return true;
  if (p.includes("/bnbchain/docs/")) return true;
  if (p.includes("/bnbchain/script/") || p.includes("/bnbchain/figures/") || p.includes("/bnbchain/data/")) {
    if (n === "description.md" || n === "descsiption.md") return true;
  }
  if (n.endsWith(".csv")) return true;
  return false;
}

function shouldSkipTech(rel) {
  const n = path.basename(rel).toLowerCase();
  const p = String(rel).replace(/\\/g, "/");
  // Stub placeholder — not published on tech.vibequant.cc
  if (/AI-Open-Weights-Model\/Awesome-Open-Weight/i.test(p)) return true;
  // Awesome-Agent hub index is intentional content (KO/EN/JA); skip other folder READMEs.
  if (n.startsWith("readme") && !/Awesome-Agent\//i.test(p)) {
    return true;
  }
  if (n === "llms.txt" || n === "requirements.txt" || n === "contacts.md") return true;
  if (n === "glossary.md" || n === "translation_plan.md") return true;
  if (rel.includes("toss-qlib-middleware/") && !/getting-started|readme/i.test(n)) {
    // keep only top-level qlib guides; skip middleware internals
    if (rel.includes("/src/") || rel.includes("/toss-qlib-middleware/src")) return true;
  }
  return false;
}

function shouldSkipEssay(rel) {
  const n = path.basename(rel).toLowerCase();
  if (n === "readme.md" || n === "llms.txt" || n === "license" || n === "license.md") return true;
  return false;
}

function shouldSkipCti(rel) {
  const n = path.basename(rel).toLowerCase();
  if (n === "readme.md" || n === "llms.txt") return true;
  if (n === "cti_guideline.md" || n === "cti_template.md") return true;
  if (n.startsWith("awesome ")) return true;
  if (n.includes("-press")) return true;
  // CTI-YYYY-… reports, plus curated analysis notes (e.g. Awesome-*-Analysis.md)
  if (!/^cti-/i.test(n) && !/^awesome-.+-analysis\.md$/i.test(n)) return true;
  return false;
}

function ctiDateKey(rel) {
  const m = String(rel).match(/CTI-(\d{4})-(\d{2})(\d{2})/i);
  if (!m) return 0;
  return Number(`${m[1]}${m[2]}${m[3]}`);
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

function dedupeByTitle(items) {
  const ranked = [...items].sort((a, b) => {
    const score = (i) => {
      let s = 0;
      if (i.datePublished) s += 4;
      if (i.featured) s += 2;
      if (!/주식시황\//.test(i.path)) s += 1;
      if (i.path.split("/").length <= 2) s += 1;
      return s;
    };
    return score(b) - score(a) || a.path.localeCompare(b.path);
  });
  const seen = new Set();
  const out = [];
  for (const it of ranked) {
    const key = normalizeTitleKey(it.title);
    if (!key) {
      out.push(it);
      continue;
    }
    if (seen.has(key)) {
      console.log(`  skip duplicate title → ${it.path}`);
      continue;
    }
    seen.add(key);
    out.push(it);
  }
  return out;
}

function sortByDateThenPath(items) {
  return [...items].sort((a, b) => {
    const da = a.datePublished || "";
    const db = b.datePublished || "";
    if (da && db) return db.localeCompare(da) || a.path.localeCompare(b.path);
    if (da && !db) return -1; // dated before undated
    if (!da && db) return 1;
    return a.path.localeCompare(b.path);
  });
}

function scanColumns() {
  const invFiles = walkMd(COL_SRC, shouldSkipColumn);
  const mediaFiles = fs.existsSync(MEDIA_COL_SRC)
    ? walkMd(MEDIA_COL_SRC, shouldSkipColumn)
    : [];
  const gitInv = loadGitDates(ROOT, "02.Investment Idea Column");
  const gitMedia = fs.existsSync(MEDIA_COL_SRC)
    ? loadGitDates(ROOT, "03. Media-Column")
    : new Map();
  const items = [];

  function pushColumn({ rel, srcDir, blob, gitDates, pathPrefix }) {
    const full = path.join(srcDir, rel);
    let md = "";
    try {
      md = fs.readFileSync(full, "utf8");
    } catch {
      return;
    }
    const meta = parseColumnMeta(md);
    if (meta.draft === true) return;
    const groupId = meta.group || null;
    const group = groupId
      ? COLUMN_GROUP_RULES.find((g) => g.id === groupId) ||
        resolveGroup(rel, COLUMN_GROUP_RULES, COLUMN_GROUP_FALLBACK)
      : resolveGroup(rel, COLUMN_GROUP_RULES, COLUMN_GROUP_FALLBACK);
    const groupTitle = group.title_ko || groupId || COLUMN_GROUP_FALLBACK.title_ko;
    const baseTitle = path.basename(rel, path.extname(rel)).replace(/[_-]+/g, " ");
    const parsed = parseDoc(md, meta.title || baseTitle);
    if (meta.title) parsed.title = String(meta.title).slice(0, 200);
    if (meta.description) parsed.description = String(meta.description).slice(0, 200);
    if (meta.subtitle) parsed.subtitle = String(meta.subtitle).slice(0, 160);
    const dates = resolveItemDates({ md, relPath: rel, gitEntry: gitDates.get(rel) });
    const catalogPath = pathPrefix ? `${pathPrefix}${rel}` : rel;
    const featLists = [FEATURED_COLUMN_PATHS, FEATURED_MEDIA_COLUMN_PATHS];
    let featuredRank = 999;
    let featured = false;
    if (meta.featured === true) {
      featured = true;
      featuredRank = Number(meta.featured_rank ?? 50);
    } else {
      for (const list of featLists) {
        const idx = list.findIndex((p) => {
          const needle = p.replace(/\\/g, "/").toLowerCase();
          const hay = catalogPath.toLowerCase();
          if (hay === needle || hay.endsWith("/" + needle) || hay.includes(needle)) return true;
          const featBase = path.basename(needle).toLowerCase();
          const fileBase = path.basename(hay).toLowerCase();
          return featBase.length >= 8 && (featBase === fileBase || fileBase.startsWith(featBase));
        });
        if (idx >= 0) {
          featured = true;
          featuredRank = idx;
          break;
        }
      }
    }
    const tags = Array.isArray(meta.tags)
      ? meta.tags.map(String)
      : [groupTitle, ...(meta.media ? [String(meta.media)] : []), ...rel.split("/").slice(0, -1)].slice(
          0,
          8
        );
    const lang = detectDocLang(rel, meta);
    items.push({
      kind: "column",
      slug: allocateSlug("columns", catalogPath),
      path: catalogPath,
      title: parsed.title,
      description: parsed.description,
      subtitle: parsed.subtitle,
      byline: parsed.byline,
      group: group.id || groupId || COLUMN_GROUP_FALLBACK.id,
      groupTitle,
      tags,
      media: meta.media ? String(meta.media) : pathPrefix ? "미디어" : "",
      sourceUrl: meta.source_url ? String(meta.source_url) : "",
      featured,
      featuredRank: featured ? featuredRank : 999,
      github: githubUrl(blob, rel),
      srcDir,
      relPath: rel,
      lang,
      family: contentFamilyKey(catalogPath),
      datePublished: dates.datePublished || (meta.date ? String(meta.date).slice(0, 10) : null),
      dateModified: dates.dateModified || dates.datePublished,
      dateSource: dates.dateSource || (meta.date ? "frontmatter" : null),
    });
  }

  for (const rel of invFiles) {
    pushColumn({
      rel,
      srcDir: COL_SRC,
      blob: COL_BLOB,
      gitDates: gitInv,
      pathPrefix: "",
    });
  }
  for (const rel of mediaFiles) {
    pushColumn({
      rel,
      srcDir: MEDIA_COL_SRC,
      blob: MEDIA_COL_BLOB,
      gitDates: gitMedia,
      pathPrefix: "media/",
    });
  }
  unifyFamilyDates(items);
  return attachContentLangSiblings(sortByDateThenPath(dedupeByTitle(items)));
}

function scanTech() {
  const files = walkMd(TECH_SRC, shouldSkipTech);
  const gitDates = loadGitDates(ROOT, "TechDoc");
  const items = [];
  for (const rel of files) {
    const full = path.join(TECH_SRC, rel);
    let md = "";
    try {
      md = fs.readFileSync(full, "utf8");
    } catch {
      continue;
    }
    const meta = parseColumnMeta(md);
    if (meta.draft === true) continue;
    const groupId = meta.group ? String(meta.group) : null;
    const group =
      (groupId && TECH_GROUP_RULES.find((g) => g.id === groupId)) ||
      resolveGroup(rel, TECH_GROUP_RULES, TECH_GROUP_FALLBACK);
    const baseTitle = path.basename(rel, path.extname(rel)).replace(/[_-]+/g, " ");
    const parsed = parseDoc(md, meta.title || baseTitle);
    if (meta.title) parsed.title = String(meta.title).slice(0, 200);
    if (meta.description) parsed.description = String(meta.description).slice(0, 200);
    if (meta.subtitle) parsed.subtitle = String(meta.subtitle).slice(0, 160);
    const dates = resolveItemDates({ md, relPath: rel, gitEntry: gitDates.get(rel) });
    let featuredRank = FEATURED_TECH_PATHS.findIndex((p) => {
      const needle = p.replace(/\\/g, "/").toLowerCase();
      const hay = rel.toLowerCase();
      if (hay === needle || hay.endsWith("/" + needle) || hay.includes(needle)) return true;
      const featBase = path.basename(needle).toLowerCase();
      const fileBase = path.basename(hay).toLowerCase();
      return featBase.length >= 8 && featBase === fileBase;
    });
    let featured = featuredRank >= 0;
    if (!featured && meta.featured === true) {
      featured = true;
      featuredRank = Number(meta.featured_rank ?? 50);
    }
    const fmTags = Array.isArray(meta.tags) ? meta.tags.map(String) : [];
    const fmKeywords = Array.isArray(meta.keywords) ? meta.keywords.map(String) : [];
    const tags = [
      ...fmTags,
      ...fmKeywords,
      group.title_ko,
      rel.split("/")[0],
    ].filter(Boolean);
    const lang = detectDocLang(rel, meta);
    items.push({
      kind: "tech",
      slug: allocateSlug("tech", rel),
      path: rel,
      title: parsed.title,
      description: parsed.description,
      subtitle: parsed.subtitle,
      byline: parsed.byline,
      abstract: meta.abstract ? String(meta.abstract).trim() : "",
      group: group.id,
      groupTitle: group.title_ko,
      tags,
      featured,
      featuredRank: featured ? featuredRank : 999,
      github: githubUrl(TECH_BLOB, rel),
      srcDir: TECH_SRC,
      lang,
      family: contentFamilyKey(rel),
      datePublished: dates.datePublished || (meta.date ? String(meta.date).slice(0, 10) : null),
      dateModified: dates.dateModified || dates.datePublished || (meta.date ? String(meta.date).slice(0, 10) : null),
      dateSource: dates.dateSource || (meta.date ? "frontmatter" : null),
    });
  }
  unifyFamilyDates(items);
  return attachContentLangSiblings(sortByDateThenPath(items));
}

function ensureEssaySrc() {
  if (fs.existsSync(path.join(ESSAY_SRC, "README.md")) || fs.existsSync(path.join(ESSAY_SRC, "art"))) {
    return true;
  }
  try {
    ensureDir(path.dirname(ESSAY_SRC));
    execFileSync(
      "git",
      ["-c", "core.hooksPath=/dev/null", "clone", "--depth", "1", "https://github.com/gameworkerkim/essays.git", ESSAY_SRC],
      { stdio: "inherit" }
    );
    return fs.existsSync(ESSAY_SRC);
  } catch (e) {
    console.warn("  essays clone failed:", e.message || e);
    return false;
  }
}

function scanEssays() {
  if (!ensureEssaySrc()) {
    console.warn(`  essays source missing: ${ESSAY_SRC}`);
    return [];
  }
  const files = walkMd(ESSAY_SRC, shouldSkipEssay);
  // loadGitDates(repoRoot, subdir) — essays root is the repo
  const gitDates = loadGitDates(ESSAY_SRC, ".");
  const items = [];
  for (const rel of files) {
    const full = path.join(ESSAY_SRC, rel);
    let md = "";
    try {
      md = fs.readFileSync(full, "utf8");
    } catch {
      continue;
    }
    const group = resolveGroup(rel, ESSAY_GROUP_RULES, ESSAY_GROUP_FALLBACK);
    const baseTitle = path.basename(rel, path.extname(rel)).replace(/^\d+-/, "").replace(/[_-]+/g, " ");
    const parsed = parseDoc(md, baseTitle);
    const dates = resolveItemDates({ md, relPath: rel, gitEntry: gitDates.get(rel) });
    const featuredRank = FEATURED_ESSAY_PATHS.findIndex((p) => {
      const needle = p.replace(/\\/g, "/").toLowerCase();
      const hay = rel.toLowerCase();
      if (hay === needle || hay.endsWith("/" + needle) || hay.includes(needle)) return true;
      const featBase = path.basename(needle).toLowerCase();
      const fileBase = path.basename(hay).toLowerCase();
      return featBase.length >= 8 && featBase === fileBase;
    });
    items.push({
      kind: "essay",
      slug: allocateSlug("essays", rel),
      path: rel,
      title: parsed.title,
      description: parsed.description,
      subtitle: parsed.subtitle,
      byline: parsed.byline,
      group: group.id,
      groupTitle: group.title_ko,
      tags: [group.title_ko, rel.split("/")[0]].filter(Boolean),
      featured: featuredRank >= 0,
      featuredRank: featuredRank >= 0 ? featuredRank : 999,
      github: githubUrl(ESSAY_BLOB, rel),
      srcDir: ESSAY_SRC,
      datePublished: dates.datePublished,
      dateModified: dates.dateModified,
      dateSource: dates.dateSource,
    });
  }
  unifyFamilyDates(items);
  return sortByDateThenPath(items);
}

function normalizeCtiLang(raw) {
  const u = String(raw || "").toUpperCase();
  if (u === "KO" || u === "KOR" || u === "KOREAN") return "KR";
  if (u === "ZH" || u === "ZH-CN" || u === "ZH-HANS" || u === "CN" || u === "CHINESE") return "CN";
  if (u === "JA" || u === "JP" || u === "JAPANESE") return "JP";
  if (u === "KR" || u === "EN") return u;
  return "";
}

function ctiFamilyKey(rel) {
  return path
    .basename(rel)
    .replace(/\.(md)$/i, "")
    // GitHub CTI uses both CTI-…_KR.md and CTI-…-KR.md
    .replace(/[_-](KR|EN|JP|CN|ZH|JA)$/i, "")
    .toUpperCase();
}

function attachCtiLangSiblings(items) {
  const byFamily = new Map();
  for (const item of items) {
    if (!item.family) continue;
    if (!byFamily.has(item.family)) byFamily.set(item.family, {});
    if (item.lang) byFamily.get(item.family)[item.lang] = item.slug;
  }
  for (const item of items) {
    item.langs = byFamily.get(item.family) || (item.lang ? { [item.lang]: item.slug } : {});
  }
  // One date for all language versions of the same CTI id
  const byFamItems = new Map();
  for (const item of items) {
    if (!byFamItems.has(item.family)) byFamItems.set(item.family, []);
    byFamItems.get(item.family).push(item);
  }
  for (const [, group] of byFamItems) {
    if (group.length < 2) continue;
    const preferred =
      group.find((i) => i.lang === "KR" && i.datePublished) ||
      group.find((i) => i.lang === "EN" && i.datePublished) ||
      group.find((i) => i.datePublished) ||
      group[0];
    if (!preferred.datePublished) continue;
    for (const it of group) {
      it.datePublished = preferred.datePublished;
      it.dateModified = preferred.dateModified || preferred.datePublished;
      it.dateSource = preferred.dateSource || it.dateSource;
    }
  }
  return items;
}

function scanCti() {
  if (!fs.existsSync(CTI_SRC)) {
    console.warn(`  CTI_SRC missing: ${CTI_SRC}`);
    return [];
  }
  const files = walkMd(CTI_SRC, shouldSkipCti);
  const gitDates = loadGitDates(CTI_SRC, ".");
  const items = [];
  for (const rel of files) {
    const full = path.join(CTI_SRC, rel);
    let md = "";
    try {
      md = fs.readFileSync(full, "utf8");
    } catch {
      continue;
    }
    const meta = parseColumnMeta(md);
    if (meta.draft === true) continue;
    const groupId = meta.group ? String(meta.group) : null;
    const group =
      (groupId &&
        CTI_GROUP_RULES.find((g) => g.id === groupId) && {
          id: groupId,
          title_ko: CTI_GROUP_RULES.find((g) => g.id === groupId).title_ko,
        }) ||
      resolveGroup(rel, CTI_GROUP_RULES, CTI_GROUP_FALLBACK);
    const baseTitle = path.basename(rel, path.extname(rel)).replace(/[_-]+/g, " ");
    const parsed = parseDoc(md, meta.title || baseTitle);
    if (meta.title) parsed.title = String(meta.title).slice(0, 200);
    if (meta.description) parsed.description = String(meta.description).slice(0, 200);
    if (meta.subtitle) parsed.subtitle = String(meta.subtitle).slice(0, 160);
    let featuredRank = FEATURED_CTI_PATHS.findIndex((p) => {
      const needle = p.replace(/\\/g, "/").toLowerCase();
      const hay = rel.toLowerCase();
      if (hay === needle || hay.endsWith("/" + needle)) return true;
      return path.basename(needle) === path.basename(hay);
    });
    let featured = featuredRank >= 0;
    if (!featured && meta.featured === true) {
      featured = true;
      featuredRank = Number(meta.featured_rank ?? 50);
    }
    const lang = normalizeCtiLang(
      meta.lang || (rel.match(/[_-](KR|EN|JP|CN|ZH|JA)\.md$/i) || [, ""])[1]
    );
    const dates = resolveItemDates({
      md,
      relPath: rel,
      gitEntry: gitDates.get(rel) || gitDates.get(path.basename(rel)),
    });
    const fmTags = Array.isArray(meta.tags) ? meta.tags.map(String) : [];
    const fmKeywords = Array.isArray(meta.keywords) ? meta.keywords.map(String) : [];
    const tags = [...fmTags, ...fmKeywords, group.title_ko, lang, "CTI"].filter(Boolean);
    items.push({
      kind: "cti",
      slug: allocateSlug("cti", rel),
      path: rel,
      title: parsed.title,
      description: parsed.description,
      subtitle: parsed.subtitle,
      byline: parsed.byline,
      abstract: meta.abstract ? String(meta.abstract).trim() : "",
      group: group.id,
      groupTitle: group.title_ko,
      tags,
      featured,
      featuredRank: featured ? featuredRank : 999,
      github: githubUrl(CTI_BLOB, rel),
      srcDir: CTI_SRC,
      dateKey: ctiDateKey(rel),
      lang,
      family: ctiFamilyKey(rel),
      datePublished: dates.datePublished || (meta.date ? String(meta.date).slice(0, 10) : null),
      dateModified: dates.dateModified || dates.datePublished || (meta.date ? String(meta.date).slice(0, 10) : null),
      dateSource: dates.dateSource || (meta.date ? "frontmatter" : null),
    });
  }
  items.sort((a, b) => (b.dateKey || 0) - (a.dateKey || 0) || a.path.localeCompare(b.path));
  return attachCtiLangSiblings(items);
}

const CTI_LANG_ORDER = [
  { id: "KR", label: "한국어", flag: "🇰🇷" },
  { id: "EN", label: "English", flag: "" },
  { id: "JP", label: "日本語", flag: "" },
  { id: "CN", label: "中文", flag: "" },
];

function ctiLangSwitchHtml(currentLang, langsMap, { absoluteBase = "" } = {}) {
  const langs = langsMap || {};
  return `<div class="lang-switch" role="navigation" aria-label="Language">
      ${CTI_LANG_ORDER.map((L) => {
        const slug = langs[L.id];
        const available = Boolean(slug);
        const active = L.id === currentLang;
        const label = L.flag ? `${L.flag} ${L.label}` : L.label;
        if (absoluteBase && available) {
          const href = `${absoluteBase}${slug}/`;
          return `<a class="lang-btn${active ? " is-active" : ""}" href="${esc(href)}" data-lang="${L.id}"${active ? ' aria-current="true"' : ""}>${label}</a>`;
        }
        return `<button type="button" class="lang-btn${active ? " is-active" : ""}${available || !Object.keys(langs).length ? "" : " is-disabled"}" data-lang-btn="${L.id}" data-lang="${L.id}"${active ? ' aria-pressed="true"' : ' aria-pressed="false"'}${available || !Object.keys(langs).length ? "" : " disabled"}>${label}</button>`;
      }).join("\n      ")}
    </div>`;
}

function sectionLabel(section) {
  if (section === "tech") return "Tech";
  if (section === "cti") return "CTI";
  if (section === "essays") return "Essays";
  return "Columns";
}

function authorBioHtml(section) {
  return AUTHOR_BIO[section] || AUTHOR_BIO.default;
}

function renderNav(active) {
  const items = [
    { href: `${SITE_DOCS}/columns/`, id: "columns", label: "Columns" },
    { href: `${SITE_TECH}/tech/`, id: "tech", label: "Tech" },
    { href: `${SITE_PLAY}/play/`, id: "play", label: "Play" },
    { href: `${SITE_CTI}/cti/`, id: "cti", label: "CTI" },
    { href: `${SITE_ESSAY}/essays/`, id: "essays", label: "Essay" },
    { href: SITE_LAB, id: "lab", label: "Lab" },
    { href: SITE_RESEARCH, id: "research", label: "Research" },
    { href: GITHUB_HOME, id: "github", label: "GitHub", external: true },
    { href: `${SITE}/about/`, id: "about", label: "About" },
  ];
  return items
    .map((i) => {
      const cls = i.id === active ? "site-nav-link is-active" : "site-nav-link";
      const extra = i.external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a class="${cls}" href="${i.href}"${extra}>${i.label}</a>`;
    })
    .join("\n        ");
}

function detectDocLang(rel, meta = {}) {
  const fromMeta = normalizeCtiLang(meta.lang || meta.language || "");
  if (fromMeta) return fromMeta;
  const base = path.basename(String(rel || ""), path.extname(String(rel || "")));
  // "Title EN.md" / "Title_EN.md" / "Title.en.md" / "Title-JA.md"
  let m = base.match(/(?:^|[\s_\-.])(KR|EN|JP|JA|CN|ZH|KO)$/i);
  if (m) return normalizeCtiLang(m[1]);
  m = base.match(/(?:^|[\s_\-.])(en|ko|ja|zh|cn)$/i);
  if (m) return normalizeCtiLang(m[1]);
  return "KR";
}

/** Folder + basename without language suffix — pairs KO/EN tech & column twins. */
function contentFamilyKey(rel) {
  const p = String(rel || "").replace(/\\/g, "/");
  const dir = path
    .dirname(p)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  let base = path.basename(p, path.extname(p));
  base = base
    .replace(/(?:[\s_\-.])(KR|EN|JP|JA|CN|ZH|KO)$/i, "")
    .replace(/(?:[\s_\-.])(en|ko|ja|zh|cn)$/i, "");
  base = base.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `${dir}::${base || "doc"}`;
}

function attachContentLangSiblings(items) {
  const byFamily = new Map();
  for (const item of items) {
    if (!item.family || !item.lang) continue;
    if (!byFamily.has(item.family)) byFamily.set(item.family, {});
    byFamily.get(item.family)[item.lang] = item.slug;
  }
  for (const item of items) {
    item.langs = byFamily.get(item.family) || (item.lang ? { [item.lang]: item.slug } : {});
  }
  return items;
}

function absoluteSitePath(base) {
  return String(base || "").replace(/\/+$/, "") + "/";
}

function hreflangLinks(item, section) {
  if (!item.langs || Object.keys(item.langs).length < 2) return "";
  const base = siteForSection(section);
  const lines = [];
  for (const L of CTI_LANG_ORDER) {
    const slug = item.langs[L.id];
    const hl = langToHreflang(L.id);
    if (!slug || !hl) continue;
    lines.push(`<link rel="alternate" hreflang="${hl}" href="${esc(`${base}/${section}/${slug}/`)}" />`);
  }
  const defSlug = item.langs.KR || item.langs.EN || item.slug;
  lines.push(`<link rel="alternate" hreflang="x-default" href="${esc(`${base}/${section}/${defSlug}/`)}" />`);
  return lines.join("\n  ");
}

function layout({
  title,
  description,
  canonical,
  active,
  prefix,
  body,
  jsonLd = null,
  ogType = "article",
  htmlLang = "ko",
  extraHead = "",
  ogImage = LOGO_URL,
}) {
  const ldBlocks = Array.isArray(jsonLd) ? jsonLd.filter(Boolean) : jsonLd ? [jsonLd] : [];
  const ld = ldBlocks
    .map((block) => `<script type="application/ld+json">${JSON.stringify(block)}</script>`)
    .join("\n  ");
  const resolvedOg = String(ogImage || LOGO_URL).trim() || LOGO_URL;
  return `<!DOCTYPE html>
<html lang="${esc(htmlLang)}">
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
  <meta property="og:image" content="${esc(resolvedOg)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${esc(resolvedOg)}" />
  <link rel="icon" type="image/svg+xml" href="${prefix}favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}favicon-32.png" />
  <link rel="apple-touch-icon" href="${prefix}apple-touch-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${prefix}css/content.css?v=8" />
  ${extraHead}
  ${ld}
</head>
<body class="content-body">
  <header class="site-top">
    <a class="site-brand" href="${SITE}/">VibeQuant</a>
    <nav class="site-nav" aria-label="Primary">
      ${renderNav(active)}
    </nav>
  </header>
  ${body}
  <footer class="site-foot">
    <p><a href="${SITE}/">Home</a> · <a href="${SITE_DOCS}/columns/">Columns</a> · <a href="${SITE_TECH}/tech/">Tech</a> · <a href="${SITE_PLAY}/play/">Play</a> · <a href="${SITE_CTI}/cti/">CTI</a> · <a href="${SITE_ESSAY}/essays/">Essay</a> · <a href="${SITE_LAB}">Lab</a> · <a href="${SITE_RESEARCH}">Research</a> · <a href="${GITHUB_HOME}">GitHub</a> · <a href="${SITE}/about/">About</a></p>
    <p class="muted">Not investment advice. <a href="https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md">Dennis Kim / 김호광</a></p>
  </footer>
</body>
</html>
`;
}

function shareBarLabels(lang) {
  const L = String(lang || "KR").toUpperCase();
  if (L === "EN") return { aria: "Share", label: "Share", copy: "Copy link" };
  if (L === "JP" || L === "JA") return { aria: "共有", label: "共有", copy: "リンクをコピー" };
  if (L === "CN" || L === "ZH") return { aria: "分享", label: "分享", copy: "复制链接" };
  return { aria: "공유", label: "공유", copy: "링크 복사" };
}

/** Share links for X / Facebook / LinkedIn / KakaoTalk / copy — used on columns, tech, cti articles. */
function shareBarHtml({ url, title, description = "", lang = "KR", placement = "top" }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title || "");
  const d = encodeURIComponent(description || "");
  const labels = shareBarLabels(lang);
  const htmlLang = langToHreflang(lang) || "ko";
  const cls = placement === "bottom" ? "share-bar share-bar--bottom" : "share-bar";
  const xHref = `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
  return `<nav class="${cls}" aria-label="${esc(labels.aria)}" data-url="${esc(url)}" data-title="${esc(
    title || ""
  )}" data-text="${esc(description || "")}" data-lang="${esc(htmlLang)}">
  <span class="share-label">${esc(labels.label)}</span>
  <a class="share-btn" data-share="x" href="${esc(xHref)}" target="_blank" rel="noopener noreferrer">X</a>
  <a class="share-btn" data-share="facebook" href="${esc(fbHref)}" target="_blank" rel="noopener noreferrer">Facebook</a>
  <a class="share-btn" data-share="linkedin" href="${esc(liHref)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
  <button type="button" class="share-btn" data-share="copy">${esc(labels.copy)}</button>
  <span class="share-status" data-share-status hidden></span>
</nav>`;
}

function buildArticle(item, section) {
  const full = path.join(item.srcDir, item.relPath || item.path);
  const raw = fs.readFileSync(full, "utf8");
  const meta = parseColumnMeta(raw);
  const parsed = parseDoc(raw, item.title);
  if (meta.title) parsed.title = String(meta.title);
  if (meta.description) parsed.description = String(meta.description);
  if (meta.subtitle) parsed.subtitle = String(meta.subtitle);
  let htmlBody = marked.parse(sanitizeMd(parsed.bodyMd || stripFrontmatter(raw)));
  htmlBody = fixLiteralBoldHtml(htmlBody);
  htmlBody = htmlBody.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, "");
  const prefix = "../../";
  if (section === "cti") {
    htmlBody = rewriteCtiRelativeMdLinks(htmlBody, item, `${prefix}cti/`);
  }
  const base = siteForSection(section);
  const canonical = `${base}/${section}/${item.slug}/`;
  const schemaType = section === "tech" || section === "cti" ? "TechArticle" : "BlogPosting";
  const ledeCandidate = parsed.subtitle || "";
  const ledeIsMeta =
    !ledeCandidate ||
    isMetaLine(ledeCandidate) ||
    META_LABEL.test(ledeCandidate) ||
    /^(작성일|발행|저자|작성자)\b/.test(ledeCandidate) ||
    /기고\s*$/.test(ledeCandidate.trim());
  const ledeText = ledeIsMeta ? parsed.description || item.description : ledeCandidate;
  const datePub = item.datePublished || null;
  const dateMod = item.dateModified || datePub;
  const mediaLabel = item.media || meta.media || "";
  const topicTags = Array.isArray(meta.tags)
    ? meta.tags.filter((t) => t && t !== "미디어칼럼" && t !== mediaLabel).slice(0, 6)
    : (item.tags || []).slice(0, 6);
  const metaBits = [];
  if (datePub) {
    metaBits.push(
      `<time datetime="${esc(datePub)}">발행 ${esc(formatDisplayDate(datePub))}</time>`
    );
  }
  if (mediaLabel) metaBits.push(`미디어 <strong>${esc(mediaLabel)}</strong>`);
  if (topicTags.length) metaBits.push(`주제 ${esc(topicTags.join(" · "))}`);
  const dateHtml = metaBits.length
    ? `<p class="article-dates">${metaBits.join(" · ")}${
        dateMod && datePub && dateMod !== datePub
          ? ` · <time datetime="${esc(dateMod)}">수정 ${esc(formatDisplayDate(dateMod))}</time>`
          : ""
      }</p>`
    : "";
  const bylineHtml = parsed.byline
    ? `<p class="article-byline">${esc(parsed.byline)}</p>`
    : "";
  const ledeHtml = ledeText ? `<p class="lede">${esc(ledeText)}</p>` : "";
  const langSwitch =
    item.langs && Object.keys(item.langs).length > 1
      ? ctiLangSwitchHtml(item.lang || "KR", item.langs, { absoluteBase: `${prefix}${section}/` })
      : "";
  const sourceUrl = item.sourceUrl || meta.source_url || "";
  const sourceHtml = sourceUrl
    ? `<p class="author-links"><a href="${esc(sourceUrl)}" rel="noopener noreferrer" target="_blank">원문 링크 (${esc(
        mediaLabel || "언론사"
      )})</a></p>`
    : "";
  const shareProps = {
    url: canonical,
    title: parsed.title || item.title,
    description: parsed.description || item.description || "",
    lang: item.lang || "KR",
  };
  const shareTop = shareBarHtml({ ...shareProps, placement: "top" });
  const shareBottom = shareBarHtml({ ...shareProps, placement: "bottom" });
  const body = `
  <main class="article-wrap">
    <p class="crumb"><a href="${prefix}${section}/">${sectionLabel(section)}</a> · ${esc(item.groupTitle)}</p>
    <article class="article">
      <header class="article-head">
        <p class="eyebrow">${esc(item.groupTitle)}${mediaLabel ? ` · ${esc(mediaLabel)}` : ""}</p>
        <h1>${esc(parsed.title || item.title)}</h1>
        ${dateHtml}
        ${langSwitch}
        ${ledeHtml}
        ${bylineHtml}
        ${shareTop}
      </header>
      <div class="article-body prose">${htmlBody}</div>
      ${shareBottom}
      <aside class="author-box">
        <h2>작성자 / Source</h2>
        <p>${authorBioHtml(section)}</p>
        ${sourceHtml}
        <p class="author-links">
          <a href="${SITE}/about/">About</a>
          · <a href="${esc(item.github)}">GitHub 원문</a>
        </p>
      </aside>
    </article>
  </main>
  <script src="${prefix}js/share.js?v=2" defer></script>`;
  const outDir = path.join(PAGES, section, item.slug);
  ensureDir(outDir);
  const metaDesc = parsed.description || item.description;
  const htmlLang = langToHreflang(item.lang) || "ko";
  const fmSchema = meta.schema_type || meta.schemaType;
  const resolvedType =
    fmSchema === "Article" ||
    fmSchema === "BlogPosting" ||
    fmSchema === "TechArticle" ||
    fmSchema === "NewsArticle"
      ? fmSchema
      : schemaType;
  const ogImageUrl =
    String(meta.og_image || meta.image || "").trim() || LOGO_URL;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": resolvedType,
    headline: parsed.title || item.title,
    description: metaDesc,
    author: personAuthorLd(),
    publisher: organizationLd(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    isBasedOn: sourceUrl || item.github,
    image: ogImageUrl,
    url: canonical,
  };
  if (datePub) articleLd.datePublished = datePub;
  if (dateMod) articleLd.dateModified = dateMod;
  if (item.lang) articleLd.inLanguage = htmlLang;
  if (mediaLabel) {
    articleLd.copyrightHolder = { "@type": "Organization", name: mediaLabel };
  }
  if (topicTags.length) articleLd.keywords = topicTags.join(", ");
  const crumbs = [
    { name: "VibeQuant", item: absoluteSitePath(SITE) },
    { name: sectionLabel(section), item: absoluteSitePath(`${base}/${section}`) },
    { name: parsed.title || item.title, item: canonical },
  ];
  fs.writeFileSync(
    path.join(outDir, "index.html"),
    layout({
      title: parsed.title || item.title,
      description: metaDesc,
      canonical,
      active:
        section === "tech"
          ? "tech"
          : section === "cti"
            ? "cti"
            : section === "essays"
              ? "essays"
              : "columns",
      prefix,
      body,
      ogType: "article",
      htmlLang,
      ogImage: ogImageUrl,
      extraHead: hreflangLinks(item, section),
      jsonLd: [
        articleLd,
        { "@context": "https://schema.org", ...breadcrumbLd(crumbs) },
      ],
    })
  );
}

function cardHtml(item, hrefPrefix = "./") {
  const search = [
    item.title,
    item.description,
    item.subtitle,
    item.abstract,
    item.groupTitle,
    item.datePublished,
    item.media,
    ...(item.tags || []),
    item.path,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const langAttr = item.lang ? ` data-lang="${esc(item.lang)}"` : "";
  const dateAttr = item.datePublished ? ` data-date="${esc(item.datePublished)}"` : "";
  const mediaAttr = item.media ? ` data-media="${esc(item.media)}"` : "";
  const featAttr = item.featured
    ? ` data-featured="1" data-featured-rank="${esc(String(item.featuredRank ?? 999))}"`
    : ` data-featured-rank="999"`;
  const dateLabel = item.datePublished
    ? `<time class="col-date" datetime="${esc(item.datePublished)}">${esc(formatDisplayDate(item.datePublished))}</time>`
    : "";
  const mediaBit = item.media ? `${esc(item.media)} · ` : "";
  return `<a class="col-card" href="${hrefPrefix}${esc(item.slug)}/" data-group="${esc(item.group)}" data-search="${esc(search)}"${langAttr}${dateAttr}${mediaAttr}${featAttr}>
        <span class="col-group">${mediaBit}${esc(item.groupTitle)}${dateLabel ? ` · ${dateLabel}` : ""}</span>
        <strong class="col-title">${esc(item.title)}</strong>
        <span class="col-desc">${esc(item.description)}</span>
      </a>`;
}

function writeCatalogSearchJs(outPath) {
  const js = `(() => {
  const q = document.getElementById("col-search");
  const g = document.getElementById("col-group");
  const sortEl = document.getElementById("col-sort");
  const root = document.getElementById("col-root");
  const count = document.getElementById("col-count");
  const flatSec = document.getElementById("sort-flat-section");
  const flatGrid = document.getElementById("sort-flat");
  const flatLabel = document.getElementById("sort-flat-label");
  if (!q || !root) return;
  const sections = [...root.querySelectorAll("[data-group-section]")];
  const mainCards = [...root.querySelectorAll("[data-group-section] .col-card")];
  const feat = document.getElementById("featured-section");
  const featCards = feat ? [...feat.querySelectorAll(".col-card")] : [];
  const allFilterCards = [...mainCards, ...featCards];
  const langBtns = [...document.querySelectorAll("[data-lang-btn]")];
  const LANG_KEY = "vq-content-lang";
  const SORT_KEY = "vq-catalog-sort:" + location.pathname;
  const hasLangFilter = langBtns.length > 0;

  function browserLang() {
    const nav = (navigator.language || navigator.userLanguage || "ko").toLowerCase();
    if (nav.startsWith("ko")) return "KR";
    if (nav.startsWith("ja")) return "JP";
    if (nav.startsWith("zh")) return "CN";
    if (nav.startsWith("en")) return "EN";
    return "KR";
  }

  function tokens(s) {
    return (s || "").trim().toLowerCase().split(/\\s+/).filter(Boolean);
  }

  let lang = hasLangFilter
    ? (localStorage.getItem(LANG_KEY) || localStorage.getItem("vq-cti-lang") || browserLang())
    : "";
  if (hasLangFilter && !["KR", "EN", "JP", "CN"].includes(lang)) lang = browserLang();

  function sortMode() {
    const v = (sortEl && sortEl.value) || "group";
    return v === "date" || v === "featured" ? v : "group";
  }

  function matchCard(card, termTokens, group, langFilter) {
    const okG = !group || card.dataset.group === group;
    if (!okG) return false;
    if (langFilter && card.dataset.lang && card.dataset.lang !== langFilter) return false;
    if (!termTokens.length) return true;
    const hay = card.dataset.search || "";
    return termTokens.every((t) => hay.includes(t));
  }

  function setLangUi() {
    for (const btn of langBtns) {
      const on = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }

  function compareCards(a, b, mode) {
    if (mode === "featured") {
      const fa = a.dataset.featured === "1" ? 0 : 1;
      const fb = b.dataset.featured === "1" ? 0 : 1;
      if (fa !== fb) return fa - fb;
      const ra = Number(a.dataset.featuredRank || 999);
      const rb = Number(b.dataset.featuredRank || 999);
      if (ra !== rb) return ra - rb;
    }
    const da = a.dataset.date || "";
    const db = b.dataset.date || "";
    if (da && db && da !== db) return db.localeCompare(da);
    if (da && !db) return -1;
    if (!da && db) return 1;
    const ta = (a.querySelector(".col-title") && a.querySelector(".col-title").textContent) || "";
    const tb = (b.querySelector(".col-title") && b.querySelector(".col-title").textContent) || "";
    return ta.localeCompare(tb, "ko");
  }

  function setSectionVisible(el, show) {
    if (!el) return;
    el.classList.toggle("is-hidden", !show);
    el.hidden = !show;
    el.style.display = show ? "" : "none";
  }

  function apply() {
    const termTokens = tokens(q.value);
    const group = (g && g.value) || "";
    const langFilter = hasLangFilter ? lang : "";
    const mode = sortMode();
    const pool = langFilter
      ? mainCards.filter((c) => !c.dataset.lang || c.dataset.lang === langFilter)
      : mainCards;

    for (const c of allFilterCards) {
      const show = matchCard(c, termTokens, group, langFilter);
      c.classList.toggle("is-hidden", !show);
      c.hidden = !show;
      c.style.display = show ? "" : "none";
    }

    let n = 0;
    if (mode === "group") {
      setSectionVisible(flatSec, false);
      if (flatGrid) flatGrid.innerHTML = "";
      for (const sec of sections) {
        const gid = sec.dataset.groupSection;
        const visibleInSec = mainCards.filter(
          (c) => c.dataset.group === gid && !c.classList.contains("is-hidden")
        );
        setSectionVisible(sec, visibleInSec.length > 0);
        const cnt = sec.querySelector(".section-count");
        if (cnt) cnt.textContent = "(" + visibleInSec.length + ")";
        n += visibleInSec.length;
      }
      if (feat) {
        const anyFeat = featCards.some((c) => !c.classList.contains("is-hidden"));
        setSectionVisible(feat, anyFeat);
      }
    } else {
      setSectionVisible(feat, false);
      for (const sec of sections) setSectionVisible(sec, false);
      const visible = mainCards.filter((c) => !c.classList.contains("is-hidden"));
      const sorted = visible.slice().sort((a, b) => compareCards(a, b, mode));
      n = sorted.length;
      if (flatSec && flatGrid) {
        setSectionVisible(flatSec, n > 0);
        if (flatLabel) {
          flatLabel.textContent = mode === "featured" ? "추천순" : "날짜순 (최신)";
        }
        flatGrid.innerHTML = "";
        for (const c of sorted) flatGrid.appendChild(c.cloneNode(true));
      }
    }

    if (count) count.textContent = n + " / " + pool.length + " shown";
  }

  if (sortEl) {
    const saved = localStorage.getItem(SORT_KEY);
    if (saved === "date" || saved === "featured" || saved === "group") sortEl.value = saved;
    sortEl.addEventListener("change", () => {
      localStorage.setItem(SORT_KEY, sortMode());
      apply();
    });
  }
  q.addEventListener("input", apply);
  q.addEventListener("search", apply);
  g?.addEventListener("change", apply);
  for (const btn of langBtns) {
    btn.addEventListener("click", () => {
      lang = btn.dataset.lang;
      localStorage.setItem(LANG_KEY, lang);
      setLangUi();
      apply();
    });
  }
  setLangUi();
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

  const featuredLabel =
    section === "cti"
      ? "추천 리포트"
      : section === "tech"
        ? "추천 TechDoc"
        : section === "essays"
          ? "추천 에세이"
          : "추천 칼럼";
  const featuredBlock =
    featured.length &&
    (section === "columns" || section === "cti" || section === "tech" || section === "essays")
      ? `<section id="featured-section" class="featured-section">
        <h2 class="section-label">${featuredLabel}</h2>
        <div class="col-grid featured-grid">
          ${featured.map((i) => cardHtml(i)).join("\n          ")}
        </div>
      </section>`
      : "";

  const langSwitch =
    section === "cti" || section === "tech" ? ctiLangSwitchHtml("KR", {}) : "";

  const sectionsHtml = groups
    .filter((g) => (byGroup.get(g.id) || []).length)
    .map((g) => {
      const list = byGroup.get(g.id) || [];
      return `<section class="group-section" data-group-section="${esc(g.id)}">
        <h2 class="section-label">${esc(g.title_ko)} <span class="muted section-count">(${list.length})</span></h2>
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
      ${langSwitch}
      <div class="filters">
        <label class="sr-only" for="col-search">검색</label>
        <input id="col-search" type="search" placeholder="제목·미디어·주제·날짜 검색 (예: 전자신문 스테이블)…" autocomplete="off" />
        <label class="sr-only" for="col-group">그룹</label>
        <select id="col-group">
          <option value="">모든 그룹</option>
          ${groupOpts}
        </select>
        <label class="sr-only" for="col-sort">정렬</label>
        <select id="col-sort">
          <option value="group">${section === "essays" ? "폴더별" : "그룹별"}</option>
          <option value="date">날짜순 (최신)</option>
          <option value="featured">추천순</option>
        </select>
      </div>
      <p id="col-count" class="muted" aria-live="polite"></p>
    </header>
    <div id="col-root">
      ${featuredBlock}
      <section id="sort-flat-section" class="sort-flat-section is-hidden" hidden>
        <h2 id="sort-flat-label" class="section-label">정렬</h2>
        <div id="sort-flat" class="col-grid"></div>
      </section>
      ${sectionsHtml}
    </div>
    <p class="muted source-note">원문:
      <a href="${esc(githubTree)}">GitHub</a>
    </p>
  </main>
  <script src="./catalog-search.js?v=4" defer></script>`;

  ensureDir(path.join(PAGES, section));
  const langAvail =
    section === "tech" || section === "cti"
      ? {
          availableLanguage: ["ko", "en", "ja", "zh-Hans"],
        }
      : {};
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
      htmlLang: "ko",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          url: canonical,
          description: lede,
          numberOfItems: items.length,
          ...langAvail,
          publisher: { "@id": ORG_ID },
          isPartOf: {
            "@type": "WebSite",
            "@id": `${SITE}/#website`,
            name: "VibeQuant",
            url: SITE,
            publisher: { "@id": ORG_ID },
          },
        },
        {
          "@context": "https://schema.org",
          ...organizationLd(),
        },
        {
          "@context": "https://schema.org",
          ...breadcrumbLd([
            { name: "VibeQuant", item: absoluteSitePath(SITE) },
            { name: title, item: canonical },
          ]),
        },
      ],
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
      · <a href="${SITE_DOCS}/columns/">Columns</a>
      · <a href="${SITE_TECH}/tech/">Tech</a>
      · <a href="${SITE}/">Home</a>
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
      jsonLd: [
        {
          "@context": "https://schema.org",
          ...personAuthorLd({ url: canonical }),
        },
        {
          "@context": "https://schema.org",
          ...organizationLd(),
        },
      ],
    })
  );
}

function sitemapEntryWithAlternates(item, section, host, today) {
  // Keep sitemap entries simple (loc + lastmod). Hreflang lives in HTML <link>
  // tags — GSC is picky about urlset namespaces / xhtml:link in sitemaps.
  const loc = `${host}/${section}/${item.slug}/`;
  const lastmod = item.dateModified || item.datePublished || today;
  return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
}

function writeUrlset(filePath, urls) {
  fs.writeFileSync(
    filePath,
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`
  );
}

function robotsTxtFor(sitemapUrl, extraComments = []) {
  const comments = [
    `# LLM: ${SITE}/llms.txt`,
    ...extraComments,
  ]
    .filter(Boolean)
    .join("\n");
  return `User-agent: *
Allow: /

# Naver
User-agent: Yeti
Allow: /
User-agent: NaverBot
Allow: /

# AI / research crawlers
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /

Sitemap: ${sitemapUrl}
${comments}
`;
}

function buildSeo(columns, tech, cti = [], essays = []) {
  // Google requires same-host URLs in each sitemap. Split by host (single Pages
  // project serves docs/tech/cti/play via custom domains — see pages/functions).
  const entry = (loc, lastmod) =>
    `  <url><loc>${loc}</loc><lastmod>${lastmod || new Date().toISOString().slice(0, 10)}</lastmod></url>`;
  const today = new Date().toISOString().slice(0, 10);
  const researchPages = ["", "paper", "quant", "spacex", "trump"];
  const sitemapsDir = path.join(PAGES, "sitemaps");
  ensureDir(sitemapsDir);

  const apexUrls = [
    entry(absoluteSitePath(SITE), today),
    entry(absoluteSitePath(`${SITE}/about`), today),
    entry(absoluteSitePath(SITE_RESEARCH), today),
    ...researchPages
      .filter(Boolean)
      .map((slug) => entry(absoluteSitePath(`${SITE}/research/${slug}`), today)),
    entry(absoluteSitePath(`${SITE_ESSAY}/essays`), today),
    ...essays.map((e) =>
      entry(`${SITE_ESSAY}/essays/${e.slug}/`, e.dateModified || e.datePublished || today)
    ),
  ];
  const docsUrls = [
    entry(absoluteSitePath(`${SITE_DOCS}/columns`), today),
    ...columns.map((c) => sitemapEntryWithAlternates(c, "columns", SITE_DOCS, today)),
  ];
  const techUrls = [
    entry(absoluteSitePath(`${SITE_TECH}/tech`), today),
    ...tech.map((t) => sitemapEntryWithAlternates(t, "tech", SITE_TECH, today)),
  ];
  const ctiUrls = [
    entry(absoluteSitePath(`${SITE_CTI}/cti`), today),
    ...cti.map((r) => sitemapEntryWithAlternates(r, "cti", SITE_CTI, today)),
  ];
  const playUrls = [entry(absoluteSitePath(`${SITE_PLAY}/play`), today)];

  writeUrlset(path.join(PAGES, "sitemap.xml"), apexUrls);
  writeUrlset(path.join(sitemapsDir, "apex.xml"), apexUrls);
  writeUrlset(path.join(sitemapsDir, "docs.xml"), docsUrls);
  writeUrlset(path.join(sitemapsDir, "tech.xml"), techUrls);
  writeUrlset(path.join(sitemapsDir, "cti.xml"), ctiUrls);
  writeUrlset(path.join(sitemapsDir, "play.xml"), playUrls);

  // Combined URL list for humans/tools (not submitted to GSC).
  const allLocs = [...apexUrls, ...docsUrls, ...techUrls, ...ctiUrls, ...playUrls]
    .map((row) => {
      const m = row.match(/<loc>([^<]+)<\/loc>/);
      return m ? m[1] : null;
    })
    .filter(Boolean);
  fs.writeFileSync(path.join(PAGES, "sitemap-urls.txt"), `${allLocs.join("\n")}\n`);

  fs.writeFileSync(
    path.join(PAGES, "robots.txt"),
    robotsTxtFor(`${SITE}/sitemap.xml`, [
      `# Per-host sitemaps (submit each in Search Console):`,
      `# ${SITE_DOCS}/sitemap.xml`,
      `# ${SITE_TECH}/sitemap.xml`,
      `# ${SITE_CTI}/sitemap.xml`,
      `# ${SITE_PLAY}/sitemap.xml`,
      `# Columns: ${SITE_DOCS}/columns/`,
      `# Tech: ${SITE_TECH}/tech/`,
      `# CTI: ${SITE_CTI}/cti/`,
      `# Essays: ${SITE_ESSAY}/essays/`,
    ])
  );
  fs.writeFileSync(
    path.join(sitemapsDir, "robots-docs.txt"),
    robotsTxtFor(`${SITE_DOCS}/sitemap.xml`)
  );
  fs.writeFileSync(
    path.join(sitemapsDir, "robots-tech.txt"),
    robotsTxtFor(`${SITE_TECH}/sitemap.xml`)
  );
  fs.writeFileSync(
    path.join(sitemapsDir, "robots-cti.txt"),
    robotsTxtFor(`${SITE_CTI}/sitemap.xml`)
  );
  fs.writeFileSync(
    path.join(sitemapsDir, "robots-play.txt"),
    robotsTxtFor(`${SITE_PLAY}/sitemap.xml`)
  );
  const dated = (c) => (c.datePublished ? ` (${c.datePublished})` : "");
  const llms = [
    "# VibeQuant Content",
    "> Multi-LLM quant committee demo + investment columns + tech docs + CTI + essays by Dennis Kim.",
    "> Thesis: an LLM is a spreadsheet, not an oracle.",
    "> Domain map: docs=Columns; tech=TechDoc; cti=CTI; essays=Essays; play=Playground; lab/research=soon; vibequant.cc=hub.",
    "",
    "## Site",
    `- [Home](${SITE}/)`,
    `- [Columns](${SITE_DOCS}/columns/) (${columns.length})`,
    `- [Tech](${SITE_TECH}/tech/) (${tech.length})`,
    `- [Play](${SITE_PLAY}/play/)`,
    `- [CTI](${SITE_CTI}/cti/) (${cti.length})`,
    `- [Essay](${SITE_ESSAY}/essays/) (${essays.length})`,
    `- [Lab](${absoluteSitePath(SITE_LAB)}) — soon`,
    `- [Research](${absoluteSitePath(SITE_RESEARCH)})`,
    `- [GitHub](${GITHUB_HOME})`,
    `- [About](${SITE}/about/)`,
    "",
    "## Recent columns (by datePublished)",
    ...columns
      .filter((c) => c.datePublished)
      .slice(0, 25)
      .map((c) => `- [${c.title}](${SITE_DOCS}/columns/${c.slug}/)${dated(c)}`),
    "",
    "## Featured columns",
    ...columns
      .filter((c) => c.featured)
      .sort((a, b) => a.featuredRank - b.featuredRank)
      .map((c) => `- [${c.title}](${SITE_DOCS}/columns/${c.slug}/)${dated(c)}`),
    "",
    "## Featured essays",
    ...essays
      .filter((c) => c.featured)
      .sort((a, b) => a.featuredRank - b.featuredRank)
      .map((c) => `- [${c.title}](${SITE_ESSAY}/essays/${c.slug}/)${dated(c)}`),
    "",
    "## Featured CTI",
    ...cti
      .filter((c) => c.featured)
      .sort((a, b) => a.featuredRank - b.featuredRank)
      .map((c) => `- [${c.title}](${SITE_CTI}/cti/${c.slug}/)${dated(c)}`),
    "",
    "## Featured tech",
    ...tech
      .filter((c) => c.featured)
      .sort((a, b) => a.featuredRank - b.featuredRank)
      .map((c) => `- [${c.title}](${SITE_TECH}/tech/${c.slug}/)${dated(c)}`),
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
    "## Essay groups",
    ...groupsFromRules(ESSAY_GROUP_RULES, ESSAY_GROUP_FALLBACK).map(
      (g) => `- ${g.title_en}: filter on ${SITE_ESSAY}/essays/ (group=${g.id})`
    ),
    "",
    "## CTI groups",
    ...groupsFromRules(CTI_GROUP_RULES, CTI_GROUP_FALLBACK).map(
      (g) => `- ${g.title_en}: filter on ${SITE_CTI}/cti/ (group=${g.id})`
    ),
    "",
  ];
  fs.writeFileSync(path.join(PAGES, "llms.txt"), llms.join("\n"));
  fs.writeFileSync(
    path.join(PAGES, "columns", "llms.txt"),
    [
      "# VibeQuant Columns",
      "> Host: docs.vibequant.cc/columns/ — investment idea columns.",
      "",
      ...columns.map((c) => `- [${c.title}](${SITE_DOCS}/columns/${c.slug}/)${dated(c)}`),
      "",
    ].join("\n")
  );
  {
    const byLang = { KR: [], EN: [], JP: [], CN: [] };
    for (const t of tech) {
      const L = byLang[t.lang] ? t.lang : "KR";
      byLang[L].push(t);
    }
    const langBlock = (id, label) => [
      `## ${label}`,
      ...byLang[id].map((t) => {
        const abs = t.abstract ? `\n  ${String(t.abstract).replace(/\s+/g, " ").slice(0, 280)}` : "";
        return `- [${t.title}](${SITE_TECH}/tech/${t.slug}/)${dated(t)}${abs}`;
      }),
      "",
    ];
    fs.writeFileSync(
      path.join(PAGES, "tech", "llms.txt"),
      [
        "# VibeQuant Tech",
        "> Host: tech.vibequant.cc/tech/ — technical docs (KO/EN/JA/ZH).",
        "> Prefer language siblings via hreflang; filter UI matches CTI.",
        "",
        "## Featured",
        ...tech
          .filter((t) => t.featured)
          .sort((a, b) => a.featuredRank - b.featuredRank)
          .map((t) => {
            const abs = t.abstract ? `\n  ${String(t.abstract).replace(/\s+/g, " ").slice(0, 280)}` : "";
            return `- [${t.title}](${SITE_TECH}/tech/${t.slug}/) [${t.lang}]${dated(t)}${abs}`;
          }),
        "",
        ...langBlock("KR", "Korean (KR)"),
        ...langBlock("EN", "English (EN)"),
        ...langBlock("JP", "Japanese (JP)"),
        ...langBlock("CN", "Chinese (CN)"),
      ].join("\n")
    );
  }
  if (cti.length) {
    ensureDir(path.join(PAGES, "cti"));
    fs.writeFileSync(
      path.join(PAGES, "cti", "llms.txt"),
      [
        "# VibeQuant CTI",
        "> Host: cti.vibequant.cc/cti/ — cyber threat intelligence reports.",
        "",
        "## Featured",
        ...cti
          .filter((r) => r.featured)
          .sort((a, b) => a.featuredRank - b.featuredRank)
          .map((r) => {
            const abs = r.abstract ? `\n  ${String(r.abstract).replace(/\s+/g, " ").slice(0, 280)}` : "";
            return `- [${r.title}](${SITE_CTI}/cti/${r.slug}/)${dated(r)}${abs}`;
          }),
        "",
        "## All reports",
        ...cti.map((r) => `- [${r.title}](${SITE_CTI}/cti/${r.slug}/)${dated(r)}`),
        "",
      ].join("\n")
    );
  }
  if (essays.length) {
    ensureDir(path.join(PAGES, "essays"));
    fs.writeFileSync(
      path.join(PAGES, "essays", "llms.txt"),
      ["# VibeQuant Essays", "", ...essays.map((e) => `- [${e.title}](${SITE_ESSAY}/essays/${e.slug}/)${dated(e)}`), ""].join("\n")
    );
  }
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
  resetSlugRegistry();
  console.log("Loading legacy slugs…");
  const legacyIndex = loadLegacySlugIndex();
  console.log(`  ${legacyIndex.size} legacy article URLs`);

  console.log("Scanning columns…");
  const columns = scanColumns();
  const colDated = columns.filter((c) => c.datePublished).length;
  console.log(`  ${columns.length} columns (${colDated} with datePublished)`);
  console.log("Scanning tech…");
  const tech = scanTech();
  const techDated = tech.filter((t) => t.datePublished).length;
  console.log(`  ${tech.length} tech docs (${techDated} with datePublished)`);
  console.log("Scanning CTI…");
  const cti = scanCti();
  const ctiDated = cti.filter((r) => r.datePublished).length;
  console.log(`  ${cti.length} CTI reports (${ctiDated} with datePublished) (${CTI_SRC})`);
  console.log("Scanning essays…");
  const essays = scanEssays();
  const essayDated = essays.filter((e) => e.datePublished).length;
  console.log(`  ${essays.length} essays (${essayDated} with datePublished) (${ESSAY_SRC})`);

  cleanSection("columns");
  cleanSection("tech");
  cleanSection("cti");
  cleanSection("essays");

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
  i = 0;
  for (const report of cti) {
    i++;
    if (i % 25 === 0 || i === cti.length) console.log(`  cti ${i}/${cti.length}`);
    buildArticle(report, "cti");
  }
  i = 0;
  for (const essay of essays) {
    i++;
    if (i % 10 === 0 || i === essays.length) console.log(`  essays ${i}/${essays.length}`);
    buildArticle(essay, "essays");
  }

  writeSlugRedirects(legacyIndex, [
    { section: "columns", items: columns, host: SITE_DOCS },
    { section: "tech", items: tech, host: SITE_TECH },
    { section: "cti", items: cti, host: SITE_CTI },
    { section: "essays", items: essays, host: SITE_ESSAY },
  ]);

  buildListPage({
    section: "columns",
    items: columns,
    groups: groupsFromRules(COLUMN_GROUP_RULES, COLUMN_GROUP_FALLBACK),
    title: "Investment & Media Columns",
    lede: `전체 ${columns.length}편 — 투자 칼럼 + 미디어 기고. 발행일 · 미디어 · 주제 검색(여러 단어 AND) · 그룹별/날짜순/추천순.`,
    active: "columns",
    githubTree: "https://github.com/gameworkerkim/vibe-investing/tree/main/03.%20Media-Column",
  });

  buildListPage({
    section: "tech",
    items: tech,
    groups: groupsFromRules(TECH_GROUP_RULES, TECH_GROUP_FALLBACK),
    title: "Tech Docs",
    lede: `기술 문서 ${tech.length}편 (한·영·일·중) — 언어 필터 · 발행일 · 추천 · 그룹별/날짜순/추천순 정렬 · 검색.`,
    active: "tech",
    githubTree: "https://github.com/gameworkerkim/vibe-investing/tree/main/TechDoc",
  });

  buildListPage({
    section: "cti",
    items: cti,
    groups: groupsFromRules(CTI_GROUP_RULES, CTI_GROUP_FALLBACK),
    title: "Cyber Threat Intelligence",
    lede: `CTI 리포트 ${cti.length}편 — 발행일 · 추천 · 그룹별/날짜순/추천순 정렬 · 한/영/일/중.`,
    active: "cti",
    githubTree: "https://github.com/gameworkerkim/CYBER-THREAT-INTELLIGENCE-REPORT",
  });

  buildListPage({
    section: "essays",
    items: essays,
    groups: groupsFromRules(ESSAY_GROUP_RULES, ESSAY_GROUP_FALLBACK),
    title: "Essays",
    lede: `에세이 ${essays.length}편 — Art · Book Review · Culture & Taste · 폴더별/날짜순/추천순.`,
    active: "essays",
    githubTree: "https://github.com/gameworkerkim/essays",
  });

  buildAbout();
  buildSeo(columns, tech, cti, essays);

  // Keep hub counts + root Organization JSON-LD in sync
  const homePath = path.join(PAGES, "index.html");
  if (fs.existsSync(homePath)) {
    let home = fs.readFileSync(homePath, "utf8");
    home = home.replace(
      /id="hub-col-count">[^<]*<\/span>/,
      `id="hub-col-count">${columns.length}편</span>`
    );
    home = home.replace(
      /id="hub-essay-count">[^<]*<\/span>/,
      `id="hub-essay-count">${essays.length}편</span>`
    );
    const homeGraph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${SITE}/#website`,
          name: "VibeQuant",
          url: absoluteSitePath(SITE),
          description:
            "VibeQuant — AI Quant · Cyber Threat Intelligence · Web3. 투자 칼럼·Tech·CTI·에세이 오픈 리서치.",
          publisher: { "@id": ORG_ID },
          inLanguage: ["ko", "en", "ja", "zh-Hans"],
        },
        organizationLd(),
        personAuthorLd(),
      ],
    };
    const homeLd = `<script type="application/ld+json" id="vq-org-ld">${JSON.stringify(homeGraph)}</script>`;
    if (/id="vq-org-ld"/.test(home)) {
      home = home.replace(
        /<script type="application\/ld\+json" id="vq-org-ld">[\s\S]*?<\/script>/,
        homeLd
      );
    } else {
      home = home.replace(/<\/head>/i, `  ${homeLd}\n</head>`);
    }
    fs.writeFileSync(homePath, home);
  }

  console.log("Done.");
}

main();
