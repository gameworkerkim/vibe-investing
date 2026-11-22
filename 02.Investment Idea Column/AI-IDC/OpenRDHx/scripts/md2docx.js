// 마크다운 → .docx 변환기 (OpenRDHx 문서용)
//
//   cd <레포>/02.Investment Idea Column/AI-IDC/OpenRDHx
//   npm install docx                # 한 번만
//   node scripts/md2docx.js "10_사업계획서/사업계획서.md" ~/Downloads/OpenRDHx_사업계획서_v1.2.docx "OpenRDHx 사업계획서 v1.2"
//
// 한글 폰트는 Apple SD Gothic Neo 로 고정되어 있다 (아래 FONT).
// 윈도우로 보낼 문서라면 "맑은 고딕" 으로 바꾸고 다시 돌린다.
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  LevelFormat, convertInchesToTwip, ExternalHyperlink, PageNumber, Footer, Header,
} = require("docx");

const FONT = "Apple SD Gothic Neo";
const MONO = "Menlo";
const INK = "16222E", TEAL = "0E7C8A", SLATE = "6E8793", LINE = "DCE5EA", HEADFILL = "1B4C63";
const PAGE_W = 11906, MARGIN = 1134;              // A4, 2cm
const CONTENT_W = PAGE_W - MARGIN * 2;            // 9638

/* ---------- 인라인 파싱: **bold**, `code`, [text](url) ---------- */
function inline(text, base = {}) {
  const runs = [];
  const re = /(\*\*[^*]+\*\*)|(`[^`]+`)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0, m;
  const push = (t, o) => { if (t) runs.push(new TextRun({ text: t, font: FONT, size: 20, color: INK, ...base, ...o })); };
  while ((m = re.exec(text)) !== null) {
    push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) push(tok.slice(2, -2), { bold: true });
    else if (tok.startsWith("`")) runs.push(new TextRun({ text: tok.slice(1, -1), font: MONO, size: 18, color: TEAL, ...base }));
    else {
      const mm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
      let label = mm[1]; const url = mm[2];
      const isCode = /^`.+`$/.test(label);
      if (isCode) label = label.slice(1, -1);          // 링크 라벨 안의 백틱 제거
      if (/^https?:\/\//.test(url)) {
        runs.push(new ExternalHyperlink({
          link: url,
          children: [new TextRun({ text: label, font: isCode ? MONO : FONT, size: isCode ? 18 : 20,
                                   color: TEAL, underline: {}, ...base })],
        }));
      } else if (isCode) {
        runs.push(new TextRun({ text: label, font: MONO, size: 18, color: TEAL, ...base }));
      } else {
        push(label, { color: TEAL });                 // 레포 내부 경로는 링크 없이 표기
      }
    }
    last = m.index + tok.length;
  }
  push(text.slice(last));
  return runs.length ? runs : [new TextRun({ text: "", font: FONT, size: 20 })];
}

/* ---------- 표 ---------- */
function stripCell(s) { return s.replace(/^\s+|\s+$/g, ""); }
function splitRow(line) {
  let t = line.trim();
  if (t.startsWith("|")) t = t.slice(1);
  if (t.endsWith("|")) t = t.slice(0, -1);
  return t.split("|").map(stripCell);
}
function buildTable(rows) {
  const header = rows[0];
  const body = rows.slice(1);
  const n = header.length;
  // 열 너비: 내용 길이 비례, 최소 8%
  const weight = new Array(n).fill(0);
  rows.forEach(r => r.forEach((c, i) => { if (i < n) weight[i] = Math.max(weight[i], Math.min(c.length, 60)); }));
  let tot = weight.reduce((a, b) => a + b, 0) || n;
  let cols = weight.map(w => Math.max(Math.round(CONTENT_W * w / tot), Math.round(CONTENT_W * 0.07)));
  const diff = CONTENT_W - cols.reduce((a, b) => a + b, 0);
  cols[cols.length - 1] += diff;
  const border = { style: BorderStyle.SINGLE, size: 4, color: LINE };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cell = (txt, i, isHead) => new TableCell({
    width: { size: cols[i], type: WidthType.DXA },
    borders,
    shading: isHead ? { type: ShadingType.CLEAR, fill: HEADFILL, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: [new Paragraph({
      spacing: { before: 0, after: 0 },
      children: inline(txt, isHead ? { bold: true, color: "FFFFFF", size: 18 } : { size: 18 }),
    })],
  });
  return new Table({
    columnWidths: cols,
    width: { size: CONTENT_W, type: WidthType.DXA },
    rows: [
      new TableRow({ tableHeader: true, children: header.map((c, i) => cell(c, i, true)) }),
      ...body.map(r => new TableRow({
        children: Array.from({ length: n }, (_, i) => cell(r[i] === undefined ? "" : r[i], i, false)),
      })),
    ],
  });
}

/* ---------- 본문 파싱 ---------- */
function parse(md) {
  const lines = md.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];

    if (/^```/.test(ln)) {                                  // 코드 블록
      i++;
      const buf = [];
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      buf.forEach((b, k) => out.push(new Paragraph({
        spacing: { before: k === 0 ? 100 : 0, after: k === buf.length - 1 ? 140 : 0 },
        shading: { type: ShadingType.CLEAR, fill: "F2F5F7", color: "auto" },
        children: [new TextRun({ text: b || " ", font: MONO, size: 17, color: INK })],
      })));
      continue;
    }

    if (/^\|/.test(ln) && i + 1 < lines.length && /^\|[\s:-]+\|/.test(lines[i + 1])) {   // 표
      const rows = [splitRow(ln)];
      i += 2;
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(splitRow(lines[i])); i++; }
      out.push(buildTable(rows));
      out.push(new Paragraph({ spacing: { before: 0, after: 160 }, children: [] }));
      continue;
    }

    let m;
    if ((m = /^#\s+(.*)$/.exec(ln))) {
      out.push(new Paragraph({ heading: HeadingLevel.TITLE, children: inline(m[1], { size: 40, bold: true }) }));
    } else if ((m = /^##\s+(.*)$/.exec(ln))) {
      out.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: inline(m[1], { size: 28, bold: true }) }));
    } else if ((m = /^###\s+(.*)$/.exec(ln))) {
      out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: inline(m[1], { size: 23, bold: true }) }));
    } else if ((m = /^>\s?(.*)$/.exec(ln))) {
      out.push(new Paragraph({
        spacing: { before: 100, after: 140 }, indent: { left: 340 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: TEAL, space: 10 } },
        children: inline(m[1], { italics: true, color: HEADFILL }),
      }));
    } else if (/^(-{3,}|\*{3,})\s*$/.test(ln)) {
      out.push(new Paragraph({
        spacing: { before: 160, after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LINE, space: 1 } },
        children: [],
      }));
    } else if ((m = /^(\s*)-\s+\[([ x])\]\s+(.*)$/.exec(ln))) {        // 체크박스
      out.push(new Paragraph({
        spacing: { before: 0, after: 60 }, indent: { left: 400, hanging: 240 },
        children: [new TextRun({ text: (m[2] === "x" ? "☑  " : "☐  "), font: FONT, size: 20, color: TEAL }),
                   ...inline(m[3])],
      }));
    } else if ((m = /^(\s*)[-*]\s+(.*)$/.exec(ln))) {                   // 불릿
      const lvl = Math.min(Math.floor(m[1].length / 2), 2);
      out.push(new Paragraph({
        numbering: { reference: "bul", level: lvl },
        spacing: { before: 0, after: 60 },
        children: inline(m[2]),
      }));
    } else if ((m = /^(\s*)(\d+)\.\s+(.*)$/.exec(ln))) {                // 번호 목록
      out.push(new Paragraph({
        spacing: { before: 0, after: 60 }, indent: { left: 400, hanging: 260 },
        children: [new TextRun({ text: m[2] + ".  ", font: FONT, size: 20, bold: true, color: TEAL }),
                   ...inline(m[3])],
      }));
    } else if (ln.trim() === "") {
      // 빈 줄은 간격으로만 처리
    } else {
      out.push(new Paragraph({ spacing: { before: 0, after: 140 }, children: inline(ln) }));
    }
    i++;
  }
  return out;
}

/* ---------- 조립 ---------- */
const [, , inPath, outPath, docTitle] = process.argv;
const md = fs.readFileSync(inPath, "utf8");
const body = parse(md);

const doc = new Document({
  creator: "Project OpenRDHx",
  title: docTitle || path.basename(inPath),
  description: "OpenRDHx 문서. 마크다운 원본에서 생성.",
  styles: {
    default: {
      document: { run: { font: FONT, size: 20, color: INK }, paragraph: { spacing: { line: 300 } } },
      title: { run: { font: FONT, size: 40, bold: true, color: INK },
               paragraph: { spacing: { before: 0, after: 200 }, keepNext: true } },
      heading1: { run: { font: FONT, size: 28, bold: true, color: HEADFILL },
                  paragraph: { spacing: { before: 320, after: 140 }, keepNext: true } },
      heading2: { run: { font: FONT, size: 23, bold: true, color: TEAL },
                  paragraph: { spacing: { before: 240, after: 110 }, keepNext: true } },
    },
  },
  numbering: {
    config: [{
      reference: "bul",
      levels: [0, 1, 2].map(l => ({
        level: l, format: LevelFormat.BULLET, text: ["•", "◦", "–"][l],
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 340 + l * 300, hanging: 240 } },
                 run: { font: FONT, size: 20, color: TEAL } },
      })),
    }],
  },
  sections: [{
    properties: { page: { size: { width: PAGE_W, height: 16838 },
                          margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: SLATE })],
      })] }),
    },
    children: body,
  }],
});

Packer.toBuffer(doc).then(buf => { fs.writeFileSync(outPath, buf); console.log("written:", outPath, buf.length, "bytes"); });
