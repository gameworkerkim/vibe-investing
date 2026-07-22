#!/usr/bin/env node
/**
 * Scan Investment Idea Column + TechDoc + CTI → static Pages HTML
 * with group sections, search, and featured items.
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
const TECH_SRC = path.join(ROOT, "TechDoc");
const CTI_SRC =
  process.env.CTI_SRC ||
  path.resolve(ROOT, "../CYBER-THREAT-INTELLIGENCE-REPORT");
const SITE = process.env.SITE_URL || "https://vibequant.cc";
const SITE_DOCS = process.env.SITE_DOCS_URL || "https://docs.vibequant.cc";
const SITE_TECH = process.env.SITE_TECH_URL || "https://tech.vibequant.cc";
const SITE_CTI = process.env.SITE_CTI_URL || "https://cti.vibequant.cc";
const SITE_PLAY = process.env.SITE_PLAY_URL || "https://play.vibequant.cc";
const COL_BLOB = "https://github.com/gameworkerkim/vibe-investing/blob/main/02.Investment%20Idea%20Column";
const TECH_BLOB = "https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc";
const CTI_BLOB = "https://github.com/gameworkerkim/CYBER-THREAT-INTELLIGENCE-REPORT/blob/main";

const AUTHOR_BIO = {
  default:
    "<strong>김호광 (Dennis Kim)</strong> — 前 싸이월드 대표(한국 대표 소셜 플랫폼, 3,500만 회원) · 사이버 위협 인텔리전스(CTI) · AI 기반 퀀트 투자 · Web3의 교차점에서 연구·투자하는 독립 연구자 · Investor · Microsoft Azure MVP (2015–2023, 9년 연속).",
  cti: "<strong>Dennis Kim</strong> · 前 싸이월드 대표.",
};

function siteForSection(section) {
  if (section === "columns") return SITE_DOCS;
  if (section === "tech") return SITE_TECH;
  if (section === "cti") return SITE_CTI;
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
  const p = rel.replace(/\\/g, "/").toLowerCase();
  if (n === "readme.md" || n === "llms.txt" || n === "ideanote.md") return true;
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
  if (n.startsWith("readme")) return true;
  if (n === "llms.txt" || n === "requirements.txt" || n === "contacts.md") return true;
  if (n === "glossary.md" || n === "translation_plan.md") return true;
  if (rel.includes("toss-qlib-middleware/") && !/getting-started|readme/i.test(n)) {
    // keep only top-level qlib guides; skip middleware internals
    if (rel.includes("/src/") || rel.includes("/toss-qlib-middleware/src")) return true;
  }
  return false;
}

function shouldSkipCti(rel) {
  const n = path.basename(rel).toLowerCase();
  if (n === "readme.md" || n === "llms.txt") return true;
  if (n === "cti_guideline.md" || n === "cti_template.md") return true;
  if (n.startsWith("awesome ")) return true;
  if (n.includes("-press")) return true;
  if (!/^cti-/i.test(n)) return true;
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
  const files = walkMd(COL_SRC, shouldSkipColumn);
  const gitDates = loadGitDates(ROOT, "02.Investment Idea Column");
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
    const dates = resolveItemDates({ md, relPath: rel, gitEntry: gitDates.get(rel) });
    const featuredRank = FEATURED_COLUMN_PATHS.findIndex((p) => {
      const needle = p.replace(/\\/g, "/").toLowerCase();
      const hay = rel.toLowerCase();
      if (hay === needle || hay.endsWith("/" + needle) || hay.includes(needle)) return true;
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
      datePublished: dates.datePublished,
      dateModified: dates.dateModified,
      dateSource: dates.dateSource,
    });
  }
  unifyFamilyDates(items);
  return sortByDateThenPath(dedupeByTitle(items));
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
    const group = resolveGroup(rel, TECH_GROUP_RULES, TECH_GROUP_FALLBACK);
    const baseTitle = path.basename(rel, path.extname(rel)).replace(/[_-]+/g, " ");
    const parsed = parseDoc(md, baseTitle);
    const dates = resolveItemDates({ md, relPath: rel, gitEntry: gitDates.get(rel) });
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
  if (u === "ZH") return "CN";
  if (u === "JA") return "JP";
  if (u === "KR" || u === "EN" || u === "JP" || u === "CN") return u;
  return "";
}

function ctiFamilyKey(rel) {
  return path
    .basename(rel)
    .replace(/\.(md)$/i, "")
    .replace(/_(KR|EN|JP|CN|ZH|JA)$/i, "")
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
    const group = resolveGroup(rel, CTI_GROUP_RULES, CTI_GROUP_FALLBACK);
    const baseTitle = path.basename(rel, path.extname(rel)).replace(/[_-]+/g, " ");
    const parsed = parseDoc(md, baseTitle);
    const featuredRank = FEATURED_CTI_PATHS.findIndex((p) => {
      const needle = p.replace(/\\/g, "/").toLowerCase();
      const hay = rel.toLowerCase();
      if (hay === needle || hay.endsWith("/" + needle)) return true;
      return path.basename(needle) === path.basename(hay);
    });
    const lang = normalizeCtiLang((rel.match(/_(KR|EN|JP|CN|ZH|JA)\.md$/i) || [, ""])[1]);
    const dates = resolveItemDates({
      md,
      relPath: rel,
      gitEntry: gitDates.get(rel) || gitDates.get(path.basename(rel)),
    });
    items.push({
      kind: "cti",
      slug: makeSlug("cti/" + rel),
      path: rel,
      title: parsed.title,
      description: parsed.description,
      subtitle: parsed.subtitle,
      byline: parsed.byline,
      group: group.id,
      groupTitle: group.title_ko,
      tags: [group.title_ko, lang, "CTI"].filter(Boolean),
      featured: featuredRank >= 0,
      featuredRank: featuredRank >= 0 ? featuredRank : 999,
      github: githubUrl(CTI_BLOB, rel),
      srcDir: CTI_SRC,
      dateKey: ctiDateKey(rel),
      lang,
      family: ctiFamilyKey(rel),
      datePublished: dates.datePublished,
      dateModified: dates.dateModified || dates.datePublished,
      dateSource: dates.dateSource,
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
  return "Columns";
}

function authorBioHtml(section) {
  return AUTHOR_BIO[section] || AUTHOR_BIO.default;
}

function renderNav(active) {
  const items = [
    { href: `${SITE}/`, id: "demo", label: "Home" },
    { href: `${SITE_DOCS}/columns/`, id: "columns", label: "Columns" },
    { href: `${SITE_TECH}/tech/`, id: "tech", label: "Tech" },
    { href: `${SITE_CTI}/cti/`, id: "cti", label: "CTI" },
    { href: `${SITE_PLAY}/play/`, id: "play", label: "Play" },
    { href: `${SITE}/about/`, id: "about", label: "About" },
  ];
  return items
    .map((i) => {
      const cls = i.id === active ? "site-nav-link is-active" : "site-nav-link";
      return `<a class="${cls}" href="${i.href}">${i.label}</a>`;
    })
    .join("\n        ");
}

function hreflangLinks(item, section) {
  if (section !== "cti" || !item.langs || Object.keys(item.langs).length < 2) return "";
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
}) {
  const ld = jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : "";
  const ogImage = `${SITE}/og-default.png`;
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
  <meta property="og:image" content="${esc(ogImage)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${esc(ogImage)}" />
  <link rel="icon" type="image/svg+xml" href="${prefix}favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}favicon-32.png" />
  <link rel="apple-touch-icon" href="${prefix}apple-touch-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${prefix}css/content.css?v=6" />
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
    <p><a href="${SITE}/">Home</a> · <a href="${SITE_DOCS}/columns/">Columns</a> · <a href="${SITE_TECH}/tech/">Tech</a> · <a href="${SITE_CTI}/cti/">CTI</a> · <a href="${SITE_PLAY}/play/">Play</a> · <a href="${SITE}/about/">About</a></p>
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
  htmlBody = htmlBody.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, "");
  const prefix = "../../";
  const base = siteForSection(section);
  const canonical = `${base}/${section}/${item.slug}/`;
  const schemaType = section === "tech" || section === "cti" ? "TechArticle" : "BlogPosting";
  const ledeCandidate = parsed.subtitle || "";
  const ledeIsMeta =
    !ledeCandidate ||
    isMetaLine(ledeCandidate) ||
    META_LABEL.test(ledeCandidate) ||
    /^(작성일|발행|저자|작성자)\b/.test(ledeCandidate);
  const ledeText = ledeIsMeta ? parsed.description || item.description : ledeCandidate;
  const datePub = item.datePublished || null;
  const dateMod = item.dateModified || datePub;
  const dateHtml = datePub
    ? `<p class="article-dates"><time datetime="${esc(datePub)}">발행 ${esc(formatDisplayDate(datePub))}</time>${
        dateMod && dateMod !== datePub
          ? ` · <time datetime="${esc(dateMod)}">수정 ${esc(formatDisplayDate(dateMod))}</time>`
          : ""
      }</p>`
    : "";
  const bylineHtml = parsed.byline
    ? `<p class="article-byline">${esc(parsed.byline)}</p>`
    : "";
  const ledeHtml = ledeText ? `<p class="lede">${esc(ledeText)}</p>` : "";
  const langSwitch =
    section === "cti" && item.langs && Object.keys(item.langs).length > 1
      ? ctiLangSwitchHtml(item.lang || "KR", item.langs, { absoluteBase: `${prefix}${section}/` })
      : "";
  const body = `
  <main class="article-wrap">
    <p class="crumb"><a href="${prefix}${section}/">${sectionLabel(section)}</a> · ${esc(item.groupTitle)}</p>
    <article class="article">
      <header class="article-head">
        <p class="eyebrow">${esc(item.groupTitle)}</p>
        <h1>${esc(parsed.title || item.title)}</h1>
        ${dateHtml}
        ${langSwitch}
        ${ledeHtml}
        ${bylineHtml}
      </header>
      <div class="article-body prose">${htmlBody}</div>
      <aside class="author-box">
        <h2>작성자 / Source</h2>
        <p>${authorBioHtml(section)}</p>
        <p class="author-links">
          <a href="${SITE}/about/">About</a>
          · <a href="${esc(item.github)}">GitHub 원문</a>
        </p>
      </aside>
    </article>
  </main>`;
  const outDir = path.join(PAGES, section, item.slug);
  ensureDir(outDir);
  const metaDesc = parsed.description || item.description;
  const htmlLang = langToHreflang(item.lang) || "ko";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: parsed.title || item.title,
    description: metaDesc,
    author: { "@type": "Person", name: "Dennis Kim", alternateName: "김호광" },
    mainEntityOfPage: canonical,
    isBasedOn: item.github,
    image: `${SITE}/og-default.png`,
  };
  if (datePub) jsonLd.datePublished = datePub;
  if (dateMod) jsonLd.dateModified = dateMod;
  if (item.lang) jsonLd.inLanguage = htmlLang;
  fs.writeFileSync(
    path.join(outDir, "index.html"),
    layout({
      title: parsed.title || item.title,
      description: metaDesc,
      canonical,
      active: section === "tech" ? "tech" : section === "cti" ? "cti" : "columns",
      prefix,
      body,
      ogType: "article",
      htmlLang,
      extraHead: hreflangLinks(item, section),
      jsonLd,
    })
  );
}

function cardHtml(item, hrefPrefix = "./") {
  const search = [
    item.title,
    item.description,
    item.groupTitle,
    item.datePublished,
    ...(item.tags || []),
    item.path,
  ]
    .join(" ")
    .toLowerCase();
  const langAttr = item.lang ? ` data-lang="${esc(item.lang)}"` : "";
  const dateAttr = item.datePublished ? ` data-date="${esc(item.datePublished)}"` : "";
  const dateLabel = item.datePublished
    ? `<time class="col-date" datetime="${esc(item.datePublished)}">${esc(formatDisplayDate(item.datePublished))}</time>`
    : "";
  return `<a class="col-card" href="${hrefPrefix}${esc(item.slug)}/" data-group="${esc(item.group)}" data-search="${esc(search)}"${langAttr}${dateAttr}${item.featured ? ' data-featured="1"' : ""}>
        <span class="col-group">${esc(item.groupTitle)}${dateLabel ? ` · ${dateLabel}` : ""}</span>
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
  const langBtns = [...document.querySelectorAll("[data-lang-btn]")];
  const LANG_KEY = "vq-cti-lang";
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

  let lang = hasLangFilter ? (localStorage.getItem(LANG_KEY) || browserLang()) : "";
  if (hasLangFilter && !["KR", "EN", "JP", "CN"].includes(lang)) lang = browserLang();

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

  function apply() {
    const termTokens = tokens(q.value);
    const group = (g && g.value) || "";
    const langFilter = hasLangFilter ? lang : "";
    const mainCards = cards.filter((c) => !c.closest("#featured-section"));
    const pool = langFilter
      ? mainCards.filter((c) => !c.dataset.lang || c.dataset.lang === langFilter)
      : mainCards;
    let n = 0;
    for (const c of cards) {
      const show = matchCard(c, termTokens, group, langFilter);
      c.classList.toggle("is-hidden", !show);
      c.hidden = !show;
      c.style.display = show ? "" : "none";
      if (show && !c.closest("#featured-section")) n++;
    }
    for (const sec of sections) {
      const gid = sec.dataset.groupSection;
      const visibleInSec = cards.filter(
        (c) =>
          !c.closest("#featured-section") &&
          c.dataset.group === gid &&
          !c.classList.contains("is-hidden")
      );
      const any = visibleInSec.length > 0;
      sec.classList.toggle("is-hidden", !any);
      sec.hidden = !any;
      sec.style.display = any ? "" : "none";
      const cnt = sec.querySelector(".section-count");
      if (cnt) cnt.textContent = "(" + visibleInSec.length + ")";
    }
    const feat = document.getElementById("featured-section");
    if (feat) {
      const featCards = [...feat.querySelectorAll(".col-card")];
      const anyFeat = featCards.some((c) => !c.classList.contains("is-hidden"));
      const filtering = termTokens.length || group || (hasLangFilter && lang !== "KR");
      if (filtering) {
        feat.classList.toggle("is-hidden", !anyFeat);
        feat.hidden = !anyFeat;
        feat.style.display = anyFeat ? "" : "none";
      } else {
        feat.classList.toggle("is-hidden", !anyFeat);
        feat.hidden = !anyFeat;
        feat.style.display = anyFeat ? "" : "none";
      }
    }
    if (count) count.textContent = n + " / " + pool.length + " shown";
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

  const featuredLabel = section === "cti" ? "추천 리포트" : "추천 칼럼";
  const featuredBlock =
    featured.length && (section === "columns" || section === "cti")
      ? `<section id="featured-section" class="featured-section">
        <h2 class="section-label">${featuredLabel}</h2>
        <div class="col-grid featured-grid">
          ${featured.map((i) => cardHtml(i)).join("\n          ")}
        </div>
      </section>`
      : "";

  const langSwitch = section === "cti" ? ctiLangSwitchHtml("KR", {}) : "";

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
  <script src="./catalog-search.js?v=3" defer></script>`;

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

function buildSeo(columns, tech, cti = []) {
  const entry = (loc, lastmod) =>
    `  <url><loc>${loc}</loc><lastmod>${lastmod || new Date().toISOString().slice(0, 10)}</lastmod></url>`;
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    entry(`${SITE}/`, today),
    entry(`${SITE}/about/`, today),
    entry(`${SITE}/play/`, today),
    entry(`${SITE_DOCS}/columns/`, today),
    entry(`${SITE_TECH}/tech/`, today),
    entry(`${SITE_CTI}/cti/`, today),
    ...columns.map((c) => entry(`${SITE_DOCS}/columns/${c.slug}/`, c.dateModified || c.datePublished || today)),
    ...tech.map((t) => entry(`${SITE_TECH}/tech/${t.slug}/`, t.dateModified || t.datePublished || today)),
    ...cti.map((r) => entry(`${SITE_CTI}/cti/${r.slug}/`, r.dateModified || r.datePublished || today)),
  ];
  fs.writeFileSync(
    path.join(PAGES, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`
  );
  fs.writeFileSync(
    path.join(PAGES, "robots.txt"),
    `User-agent: *
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

Sitemap: ${SITE}/sitemap.xml
# LLM: ${SITE}/llms.txt
# Columns (docs host): ${SITE_DOCS}/columns/
# Tech: ${SITE_TECH}/tech/
# CTI: ${SITE_CTI}/cti/
`
  );
  const dated = (c) => (c.datePublished ? ` (${c.datePublished})` : "");
  const llms = [
    "# VibeQuant Content",
    "> Multi-LLM quant committee demo + investment columns + tech docs + CTI by Dennis Kim.",
    "> Thesis: an LLM is a spreadsheet, not an oracle.",
    "> Domain map: docs.vibequant.cc = Investment Columns; tech = TechDoc; cti = CTI reports; play = Python playground; vibequant.cc = hub.",
    "",
    "## Site",
    `- [Home](${SITE}/)`,
    `- [Play](${SITE_PLAY}/play/) — Browser Python Quant`,
    `- [Columns](${SITE_DOCS}/columns/) (${columns.length}) — investment idea columns (NOT API docs)`,
    `- [Tech](${SITE_TECH}/tech/) (${tech.length})`,
    `- [CTI](${SITE_CTI}/cti/) (${cti.length})`,
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
    "## Featured CTI",
    ...cti
      .filter((c) => c.featured)
      .sort((a, b) => a.featuredRank - b.featuredRank)
      .map((c) => `- [${c.title}](${SITE_CTI}/cti/${c.slug}/)${dated(c)}`),
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
  fs.writeFileSync(
    path.join(PAGES, "tech", "llms.txt"),
    ["# VibeQuant Tech", "", ...tech.map((t) => `- [${t.title}](${SITE_TECH}/tech/${t.slug}/)${dated(t)}`), ""].join("\n")
  );
  if (cti.length) {
    ensureDir(path.join(PAGES, "cti"));
    fs.writeFileSync(
      path.join(PAGES, "cti", "llms.txt"),
      ["# VibeQuant CTI", "", ...cti.map((r) => `- [${r.title}](${SITE_CTI}/cti/${r.slug}/)${dated(r)}`), ""].join("\n")
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

  cleanSection("columns");
  cleanSection("tech");
  cleanSection("cti");

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

  buildListPage({
    section: "columns",
    items: columns,
    groups: groupsFromRules(COLUMN_GROUP_RULES, COLUMN_GROUP_FALLBACK),
    title: "Investment Columns",
    lede: `전체 ${columns.length}편 — 발행일 표기 · 추천 · 주제별 그룹 · 검색(여러 단어 AND).`,
    active: "columns",
    githubTree: "https://github.com/gameworkerkim/vibe-investing/tree/main/02.Investment%20Idea%20Column",
  });

  buildListPage({
    section: "tech",
    items: tech,
    groups: groupsFromRules(TECH_GROUP_RULES, TECH_GROUP_FALLBACK),
    title: "Tech Docs",
    lede: `기술 문서 ${tech.length}편 — 발행일 · 주제별 그룹 · 검색.`,
    active: "tech",
    githubTree: "https://github.com/gameworkerkim/vibe-investing/tree/main/TechDoc",
  });

  buildListPage({
    section: "cti",
    items: cti,
    groups: groupsFromRules(CTI_GROUP_RULES, CTI_GROUP_FALLBACK),
    title: "Cyber Threat Intelligence",
    lede: `CTI 리포트 ${cti.length}편 — 발행일 · 추천 · 주제별 그룹 · 한/영/일/중.`,
    active: "cti",
    githubTree: "https://github.com/gameworkerkim/CYBER-THREAT-INTELLIGENCE-REPORT",
  });

  buildAbout();
  buildSeo(columns, tech, cti);

  // Keep hub counts in sync with published catalog
  const homePath = path.join(PAGES, "index.html");
  if (fs.existsSync(homePath)) {
    let home = fs.readFileSync(homePath, "utf8");
    home = home.replace(
      /id="hub-col-count">[^<]*<\/span>/,
      `id="hub-col-count">${columns.length}편</span>`
    );
    fs.writeFileSync(homePath, home);
  }

  console.log("Done.");
}

main();
