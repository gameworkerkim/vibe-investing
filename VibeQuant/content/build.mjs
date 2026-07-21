#!/usr/bin/env node
/**
 * Build curated columns → VibeQuant/pages/columns|about|tech + sitemap/robots/llms.txt
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const VQ = path.resolve(__dirname, "..");
const PAGES = path.join(VQ, "pages");
const COL_SRC = path.join(ROOT, "02.Investment Idea Column");
const MANIFEST = JSON.parse(fs.readFileSync(path.join(__dirname, "columns-manifest.json"), "utf8"));

marked.setOptions({ gfm: true, breaks: false });

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function stripFrontmatter(md) {
  if (!md.startsWith("---")) return md;
  const end = md.indexOf("\n---", 3);
  if (end === -1) return md;
  return md.slice(end + 4).replace(/^\s+/, "");
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function githubUrl(relPath) {
  const enc = relPath
    .split("/")
    .map((p) => encodeURIComponent(p))
    .join("/");
  return `${MANIFEST.githubBlobBase}/${enc}`;
}

function siteChrome({ title, description, canonical, ogType = "website", active, extraHead = "" }) {
  const nav = [
    { href: "../index.html", id: "demo", label: "Demo" },
    { href: "../columns/", id: "columns", label: "Columns" },
    { href: "../tech/", id: "tech", label: "Tech" },
    { href: "../about/", id: "about", label: "About" },
  ];
  // depth: articles use ../../ from columns/slug/
  return { nav, title, description, canonical, ogType, active, extraHead };
}

function renderNav(active, prefix) {
  const items = [
    { href: `${prefix}index.html`, id: "demo", label: "Demo" },
    { href: `${prefix}columns/`, id: "columns", label: "Columns" },
    { href: `${prefix}tech/`, id: "tech", label: "Tech" },
    { href: `${prefix}about/`, id: "about", label: "About" },
  ];
  return items
    .map((i) => {
      const cls = i.id === active ? "site-nav-link is-active" : "site-nav-link";
      return `<a class="${cls}" href="${i.href}">${i.label}</a>`;
    })
    .join("\n        ");
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
  extraHead = "",
}) {
  const ld = jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`
    : "";
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
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${prefix}css/content.css?v=1" />
  ${extraHead}
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
    <p><a href="${prefix}index.html">Demo</a> · <a href="${prefix}columns/">Columns</a> · <a href="${prefix}tech/">Tech</a> · <a href="${prefix}about/">About</a></p>
    <p class="muted">Not investment advice. <a href="https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md">Dennis Kim / 김호광</a></p>
  </footer>
</body>
</html>
`;
}

function groupTitle(id) {
  return MANIFEST.groups.find((g) => g.id === id)?.title_ko || id;
}

function buildArticle(col) {
  const srcPath = path.join(COL_SRC, col.path);
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Missing source: ${col.path}`);
  }
  let md = fs.readFileSync(srcPath, "utf8");
  md = stripFrontmatter(md);
  const htmlBody = marked.parse(md);
  const title = col.title_ko || col.title_en;
  const description = col.description || title;
  const canonical = `${MANIFEST.siteBase}/columns/${col.slug}/`;
  const gh = githubUrl(col.path);
  const prefix = "../../";
  const tags = (col.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join(" ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    dateModified: new Date().toISOString().slice(0, 10),
    author: {
      "@type": "Person",
      name: "Dennis Kim (김호광)",
      url: "https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md",
    },
    mainEntityOfPage: canonical,
    isBasedOn: gh,
    keywords: (col.tags || []).join(", "),
  };

  const body = `
  <main class="article-wrap">
    <p class="crumb"><a href="${prefix}columns/">Columns</a> · ${esc(groupTitle(col.group))}</p>
    <article class="article">
      <header class="article-head">
        <p class="eyebrow">${esc(groupTitle(col.group))}</p>
        <h1>${esc(title)}</h1>
        <p class="lede">${esc(description)}</p>
        <div class="tag-row">${tags}</div>
      </header>
      <div class="article-body prose">
        ${htmlBody}
      </div>
      <aside class="author-box">
        <h2>작성자</h2>
        <p><strong>김호광 (Dennis Kim)</strong> — CTI · AI 퀀트 · Web3. 前 싸이월드 대표 · Azure MVP.
        <em>LLM은 엑셀이지 오라클이 아니다.</em></p>
        <p class="author-links">
          <a href="${prefix}about/">About</a>
          · <a href="https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md">프로필 README</a>
          · <a href="${esc(gh)}">이 글 GitHub 원문</a>
        </p>
      </aside>
    </article>
  </main>`;

  const outDir = path.join(PAGES, "columns", col.slug);
  ensureDir(outDir);
  fs.writeFileSync(
    path.join(outDir, "index.html"),
    layout({
      title,
      description,
      canonical,
      active: "columns",
      prefix,
      body,
      jsonLd,
      ogType: "article",
    })
  );
}

function buildColumnsIndex(catalog) {
  const prefix = "../";
  const canonical = `${MANIFEST.siteBase}/columns/`;
  const groupOpts = MANIFEST.groups
    .map((g) => `<option value="${esc(g.id)}">${esc(g.title_ko)}</option>`)
    .join("\n            ");

  const cards = catalog
    .map((c) => {
      const title = c.title_ko || c.title_en;
      return `<a class="col-card" href="./${esc(c.slug)}/" data-group="${esc(c.group)}" data-search="${esc(
        [title, c.title_en, c.description, ...(c.tags || [])].join(" ").toLowerCase()
      )}">
        <span class="col-group">${esc(groupTitle(c.group))}</span>
        <strong class="col-title">${esc(title)}</strong>
        <span class="col-desc">${esc(c.description || "")}</span>
        <span class="col-tags">${(c.tags || []).map((t) => esc(t)).join(" · ")}</span>
      </a>`;
    })
    .join("\n      ");

  const body = `
  <main class="list-wrap">
    <header class="list-head">
      <h1>Investment Columns</h1>
      <p class="lede">큐레이션 ${catalog.length}편 — 그룹·검색으로 찾아보세요. 데모와 같은 사이트에서 바로 읽습니다.</p>
      <div class="author-card">
        <strong>김호광 (Dennis Kim)</strong>
        <p>CTI · AI 퀀트 · Web3 교차점의 독립 연구자. <a href="../about/">About</a> ·
        <a href="https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md">프로필 README</a></p>
      </div>
      <div class="filters">
        <label class="sr-only" for="col-search">검색</label>
        <input id="col-search" type="search" placeholder="제목·태그·요약 검색…" autocomplete="off" />
        <label class="sr-only" for="col-group">그룹</label>
        <select id="col-group">
          <option value="">모든 그룹</option>
          ${groupOpts}
        </select>
      </div>
      <p id="col-count" class="muted" aria-live="polite"></p>
    </header>
    <div id="col-grid" class="col-grid">
      ${cards}
    </div>
    <p class="muted source-note">원문 아카이브:
      <a href="https://github.com/gameworkerkim/vibe-investing/tree/main/02.Investment%20Idea%20Column">GitHub Investment Idea Column</a>
    </p>
  </main>
  <script src="./columns-search.js?v=1" defer></script>`;

  ensureDir(path.join(PAGES, "columns"));
  fs.writeFileSync(
    path.join(PAGES, "columns", "index.html"),
    layout({
      title: "Investment Columns",
      description: "VibeQuant 투자 아이디어 칼럼 — 그룹·검색",
      canonical,
      active: "columns",
      prefix,
      body,
      ogType: "website",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "VibeQuant Investment Columns",
        url: canonical,
      },
    })
  );

  fs.writeFileSync(
    path.join(PAGES, "columns", "catalog.json"),
    JSON.stringify({ groups: MANIFEST.groups, columns: catalog }, null, 2)
  );

  fs.writeFileSync(
    path.join(PAGES, "columns", "columns-search.js"),
    `(() => {
  const q = document.getElementById("col-search");
  const g = document.getElementById("col-group");
  const grid = document.getElementById("col-grid");
  const count = document.getElementById("col-count");
  if (!q || !g || !grid) return;
  const cards = [...grid.querySelectorAll(".col-card")];
  function apply() {
    const term = (q.value || "").trim().toLowerCase();
    const group = g.value || "";
    let n = 0;
    for (const c of cards) {
      const okG = !group || c.dataset.group === group;
      const okQ = !term || (c.dataset.search || "").includes(term);
      const show = okG && okQ;
      c.hidden = !show;
      if (show) n++;
    }
    if (count) count.textContent = n + " / " + cards.length + " columns";
  }
  q.addEventListener("input", apply);
  g.addEventListener("change", apply);
  apply();
})();
`
  );
}

function buildAbout() {
  const prefix = "../";
  const canonical = `${MANIFEST.siteBase}/about/`;
  const body = `
  <main class="list-wrap narrow">
    <h1>About</h1>
    <p class="lede">김호광 (Dennis Kim) — CTI · AI 퀀트 · Web3.</p>
    <div class="prose">
      <p>네트워크가 인류의 진보에 기여하던 시대의 어셈블리 세대 프로그래머로서,
      사이버 위협 인텔리전스·AI 기반 퀀트·Web3의 교차점에서 연구합니다.
      前 싸이월드 대표 · Microsoft Azure MVP (2015–2023).</p>
      <p><em>LLM은 엑셀이지 신탁을 내려주는 오라클이 아니다.</em></p>
      <p><a href="https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md">전체 소개 (GitHub 프로필 README)</a></p>
      <ul>
        <li><a href="../columns/">Investment Columns</a></li>
        <li><a href="../tech/">Tech Docs</a></li>
        <li><a href="../index.html">VibeQuant Demo</a></li>
      </ul>
    </div>
  </main>`;
  ensureDir(path.join(PAGES, "about"));
  fs.writeFileSync(
    path.join(PAGES, "about", "index.html"),
    layout({
      title: "About — Dennis Kim",
      description: "김호광 / Dennis Kim — VibeQuant 작성자",
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
        sameAs: [
          "https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md",
          "https://www.linkedin.com/in/testcode/",
          "https://orcid.org/0009-0002-0962-2175",
        ],
      },
    })
  );
}

function buildTechStub() {
  const prefix = "../";
  const canonical = `${MANIFEST.siteBase}/tech/`;
  const body = `
  <main class="list-wrap narrow">
    <h1>Tech Docs</h1>
    <p class="lede">기술 문서 웹 발행은 다음 배치에서 확장합니다. 지금은 GitHub TechDoc과 데모로 연결합니다.</p>
    <ul class="tech-links">
      <li><a href="https://github.com/gameworkerkim/vibe-investing/tree/main/TechDoc">TechDoc on GitHub</a> — Cloudflare, Pyodide, MCP, LLM 가이드 등</li>
      <li><a href="https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/llms.txt">TechDoc llms.txt</a></li>
      <li><a href="../columns/">Investment Columns</a> (웹 30편)</li>
      <li><a href="../index.html">VibeQuant Demo</a></li>
    </ul>
  </main>`;
  ensureDir(path.join(PAGES, "tech"));
  fs.writeFileSync(
    path.join(PAGES, "tech", "index.html"),
    layout({
      title: "Tech Docs",
      description: "VibeQuant TechDoc 인덱스 (GitHub 연동)",
      canonical,
      active: "tech",
      prefix,
      body,
      ogType: "website",
    })
  );
}

function buildSeoFiles(catalog) {
  const urls = [
    `${MANIFEST.siteBase}/`,
    `${MANIFEST.siteBase}/columns/`,
    `${MANIFEST.siteBase}/tech/`,
    `${MANIFEST.siteBase}/about/`,
    ...catalog.map((c) => `${MANIFEST.siteBase}/columns/${c.slug}/`),
  ];
  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(PAGES, "sitemap.xml"), sitemap);

  fs.writeFileSync(
    path.join(PAGES, "robots.txt"),
    `User-agent: *
Allow: /

Sitemap: ${MANIFEST.siteBase}/sitemap.xml
# LLM discovery: ${MANIFEST.siteBase}/llms.txt
`
  );

  const llmsLines = [
    "# VibeQuant Content",
    "> Multi-LLM quant committee demo + investment columns by Dennis Kim (김호광).",
    "> Thesis: an LLM is a spreadsheet, not an oracle.",
    "",
    "## Site",
    `- [Demo](${MANIFEST.siteBase}/): Pyodide vi_browser runner`,
    `- [Columns](${MANIFEST.siteBase}/columns/): Investment idea columns (${catalog.length})`,
    `- [Tech](${MANIFEST.siteBase}/tech/): Tech docs index (GitHub-backed)`,
    `- [About](${MANIFEST.siteBase}/about/): Author profile`,
    `- [Author GitHub](https://github.com/gameworkerkim/gameworkerkim/blob/main/README.md)`,
    "",
    "## Columns",
    ...catalog.map((c) => `- [${c.title_en || c.title_ko}](${MANIFEST.siteBase}/columns/${c.slug}/): ${c.description || ""}`),
    "",
  ];
  fs.writeFileSync(path.join(PAGES, "llms.txt"), llmsLines.join("\n"));

  const colLlms = [
    "# VibeQuant Columns",
    `> ${catalog.length} curated investment columns`,
    "",
    "## Columns",
    ...catalog.map((c) => `- [${c.title_ko}](${MANIFEST.siteBase}/columns/${c.slug}/)`),
    "",
  ];
  fs.writeFileSync(path.join(PAGES, "columns", "llms.txt"), colLlms.join("\n"));
}

function main() {
  const catalog = MANIFEST.columns;
  console.log(`Building ${catalog.length} columns…`);
  for (const col of catalog) {
    process.stdout.write(`  ${col.slug}… `);
    buildArticle(col);
    console.log("ok");
  }
  buildColumnsIndex(catalog);
  buildAbout();
  buildTechStub();
  buildSeoFiles(catalog);
  console.log("Done → pages/columns, about, tech, sitemap, robots, llms.txt");
}

main();
