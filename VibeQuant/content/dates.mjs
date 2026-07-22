/**
 * Publish / modified dates — strict sources only.
 * Priority: ① YAML/CTI meta date → ② filename (year required) → ③ git first commit → ④ none
 * Never parse prose body dates; never invent year from MMDD.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";

/** Normalize many date shapes → YYYY-MM-DD or null */
export function toIsoDate(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{4})[./](\d{1,2})[./](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // English: May 25, 2026
  m = s.match(
    /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})$/i
  );
  if (m) {
    const months = {
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };
    const mo = months[m[1].slice(0, 3).toLowerCase()];
    if (mo) return `${m[3]}-${mo}-${m[2].padStart(2, "0")}`;
  }
  return null;
}

/**
 * ① Structured metadata only: YAML frontmatter `date:` or CTI key/value table `| date | … |`
 * Does NOT scan prose paragraphs.
 */
export function extractFrontmatterDate(md) {
  const text = String(md ?? "");
  if (text.startsWith("---")) {
    const end = text.indexOf("\n---", 3);
    if (end !== -1) {
      const fm = text.slice(3, end);
      const m = fm.match(/^date:\s*["']?([^\n"']+)/im);
      if (m) {
        const d = toIsoDate(m[1].trim());
        if (d) return d;
      }
    }
  }
  // Leading CTI-style 2-column meta table (before first # heading)
  const beforeH1 = text.split(/^#\s+/m)[0] || text.slice(0, 2500);
  if (beforeH1.includes("|")) {
    const m = beforeH1.match(/^\|\s*date\s*\|\s*([^|\n]+)\|/im);
    if (m) {
      const d = toIsoDate(m[1].trim());
      if (d) return d;
    }
  }
  return null;
}

/**
 * ② Filename with explicit year only.
 * Accepts: CTI-2026-0718-…, …-2026-05-24-…, …_20260524_…
 * Rejects: bare MMDD (0516, 0717) that invent a year.
 */
export function extractDateFromFilename(relPath) {
  const base = path.basename(String(relPath));
  let m = base.match(/CTI-(\d{4})-(\d{2})(\d{2})/i);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = base.match(/(?:^|[-_])(\d{4})-(\d{2})-(\d{2})(?:[-_.]|$)/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = base.match(/(?:^|[-_])(\d{4})(\d{2})(\d{2})(?:[-_.]|$)/);
  if (m) {
    const mo = Number(m[2]);
    const day = Number(m[3]);
    if (mo >= 1 && mo <= 12 && day >= 1 && day <= 31) return `${m[1]}-${m[2]}-${m[3]}`;
  }
  return null;
}

/**
 * git log newest-first → map relative path → { modified (newest), published (oldest/first) }
 */
export function loadGitDates(repoRoot, pathPrefix) {
  const map = new Map();
  try {
    const out = execFileSync(
      "git",
      [
        "-C",
        repoRoot,
        "-c",
        "core.quotepath=false",
        "log",
        "--pretty=format:%cs",
        "--name-only",
        "--",
        pathPrefix,
      ],
      { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
    );
    let cur = null;
    for (const line of out.split("\n")) {
      let s = line.trim();
      if (!s) {
        cur = null;
        continue;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        cur = s;
        continue;
      }
      // Unquote C-style paths if quotepath still on
      if (s.startsWith('"') && s.endsWith('"')) {
        s = s
          .slice(1, -1)
          .replace(/\\([0-7]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
          .replace(/\\([\\"])/g, "$1");
      }
      if (!cur || !/\.md$/i.test(s)) continue;
      const prefix = pathPrefix.replace(/\\/g, "/").replace(/\/$/, "");
      let key = s.replace(/\\/g, "/");
      if (prefix && prefix !== "." && key.startsWith(prefix + "/")) {
        key = key.slice(prefix.length + 1);
      }
      if (!map.has(key)) map.set(key, { modified: cur, published: cur });
      else map.get(key).published = cur;
    }
  } catch {
    /* no git / empty */
  }
  return map;
}

/**
 * Resolve dates with strict priority. Never invent dates from prose.
 */
export function resolveItemDates({ md, relPath, gitEntry }) {
  const fromMeta = extractFrontmatterDate(md);
  const fromName = extractDateFromFilename(relPath);
  const fromGit = gitEntry?.published || null;
  const published = fromMeta || fromName || fromGit || null;
  const modified = gitEntry?.modified || published || null;
  return {
    datePublished: published,
    dateModified: modified,
    dateSource: fromMeta ? "frontmatter" : fromName ? "filename" : fromGit ? "git" : null,
  };
}

/** Strip language suffixes for multi-locale siblings (.ko/.en/_KR/_EN …). */
export function contentFamilyKey(relPath) {
  return path
    .basename(String(relPath))
    .replace(/\.md$/i, "")
    .replace(/\.(ko|en|ja|zh|jp|cn)$/i, "")
    .replace(/_(KR|EN|JP|CN|ZH|JA)$/i, "")
    .toLowerCase();
}

export function normalizeTitleKey(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[''""[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Force one datePublished across language variants of the same article.
 * Prefer KO/KR file's date, then EN, then any.
 */
export function unifyFamilyDates(items) {
  const by = new Map();
  for (const it of items) {
    const k = contentFamilyKey(it.path);
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(it);
  }
  for (const [, group] of by) {
    if (group.length < 2) continue;
    const preferred =
      group.find((i) => /\.(ko)$/i.test(i.path) || /_KR\.md$/i.test(i.path)) ||
      group.find((i) => /\.(en)$/i.test(i.path) || /_EN\.md$/i.test(i.path)) ||
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

export function formatDisplayDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${y}.${m}.${d}`;
}

export function langToHreflang(lang) {
  if (lang === "KR") return "ko";
  if (lang === "EN") return "en";
  if (lang === "JP") return "ja";
  if (lang === "CN") return "zh-Hans";
  return null;
}
