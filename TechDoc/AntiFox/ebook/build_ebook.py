#!/usr/bin/env python3
"""Build the AntiFox Red Team operations guide as a print PDF and an EPUB.

Cover follows the Cyber Threat Intelligence series (navy field, gold frame,
publisher 유페이퍼). Front matter is cover → author → linked table of contents.
Tables and figures are kept on a single page.
"""

from __future__ import annotations

import html
import re
import shutil
import subprocess
import zipfile
from pathlib import Path
from urllib.parse import unquote, urlparse

import fitz
import markdown
from bs4 import BeautifulSoup
from lxml import html as lhtml
from PIL import Image

ROOT = Path("/Users/dennis/vibe-investing/TechDoc/AntiFox")
SRC = ROOT / "AntiFox-Guide.md"
SHOTS = ROOT / "screenshots"
WORK = ROOT / "ebook"
BUILD = WORK / "build"
IMG_DIR = BUILD / "images"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BOOK_ID = "urn:uuid:7c1a9e2e-4b6a-4d1e-9a4f-a07f0c601d01"
TITLE = "AntiFox Red Team 운영 가이드"
RUNNING = "AntiFox Red Team 운영 가이드"

ARCH_HTML = """
<figure class="arch">
  <div class="abox">
    <div class="alabel">프런트 · Next.js · go:embed 단일 바이너리</div>
    <div class="abody">대시보드 · 작업 · 발견 · 자산 · 트래픽 · 보고서 · 지식베이스</div>
  </div>
  <div class="aarrow">▼</div>
  <div class="abox">
    <div class="alabel">server · Go net/http</div>
    <div class="abody">REST /api · JWT · SSE<br/>engine 이벤트 구동 스케줄링</div>
  </div>
  <div class="aarrow">▼</div>
  <div class="arow">
    <div class="abox"><div class="alabel">planner</div><div class="abody">의도 생성</div></div>
    <div class="abox"><div class="alabel">worker ×N</div><div class="abody">도구 실행</div></div>
    <div class="abox"><div class="alabel">mainagent</div><div class="abody">인간 인터페이스</div></div>
  </div>
  <div class="aarrow">▼</div>
  <div class="abox">
    <div class="alabel">PostgreSQL</div>
    <div class="abody">자산 그래프 · 전역 공유<br/>탐색 그래프 · 작업별 독립 · 앵커로 연결</div>
  </div>
  <div class="abox sub">
    <div class="abody">MITM 트래픽 녹화 · HITL 인터셉트 · 자산 보완 · 보고서 · 지식베이스 RAG</div>
  </div>
  <figcaption>공식 기술 아키텍처. 출처: AntiFox README mermaid (2026-11-14, 라벨 한국어)</figcaption>
</figure>
""".strip()

PRINT_CSS = r"""
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
@page {
  size: A4;
  margin: 16mm 15mm 14mm 15mm;
  @top-right {
    content: "AntiFox Red Team 운영 가이드";
    font-family: "Apple SD Gothic Neo", "Nanum Gothic", sans-serif;
    font-size: 8.5pt;
    color: #8d939a;
    letter-spacing: 0.01em;
  }
  @bottom-center {
    content: counter(page);
    font-family: "Apple SD Gothic Neo", "Nanum Gothic", sans-serif;
    font-size: 10pt;
    color: #3a3a3a;
  }
}
@page :first {
  margin: 0;
  @top-right { content: none; }
  @bottom-center { content: none; }
}
html, body {
  margin: 0;
  padding: 0;
  font-family: "Apple SD Gothic Neo", "Nanum Gothic", sans-serif;
  font-size: 10.5pt;
  line-height: 1.72;
  color: #1c1c1c;
}
p { margin: 0.45em 0 0.7em; orphans: 3; widows: 3; }
strong { font-weight: 750; }
a { color: #153e75; text-decoration: none; }
h1.chapter {
  break-before: page;
  page-break-before: always;
  break-after: avoid;
  page-break-after: avoid;
  font-size: 18pt;
  line-height: 1.28;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 0.55em;
  padding-bottom: 0.18em;
  border-bottom: 2.6px solid #e10600;
}
h1.front-title {
  font-size: 20pt;
  line-height: 1.25;
  font-weight: 800;
  margin: 0 0 0.5em;
  padding-bottom: 0.16em;
  border-bottom: 2.6px solid #e10600;
}
h2 {
  break-after: avoid;
  page-break-after: avoid;
  font-size: 13.4pt;
  line-height: 1.35;
  font-weight: 800;
  margin: 1.25em 0 0.4em;
}
h3 {
  break-after: avoid;
  page-break-after: avoid;
  font-size: 12pt;
  line-height: 1.4;
  font-weight: 750;
  margin: 1.05em 0 0.35em;
}
h4 { font-size: 11pt; margin: 0.9em 0 0.3em; break-after: avoid; }
ul, ol { margin: 0.35em 0 0.75em; padding-left: 1.25em; }
li { margin: 0.18em 0; }
blockquote {
  margin: 0.7em 0 0.9em;
  padding: 0.55em 0.85em;
  border-left: 3px solid #c6a15a;
  background: #fbf8f2;
  color: #242424;
}
blockquote p:first-child { margin-top: 0; }
blockquote p:last-child { margin-bottom: 0; }
hr { border: 0; border-top: 0.6pt solid #e4e1da; margin: 1em 0; }
code {
  font-family: "SF Mono", Menlo, "Apple SD Gothic Neo", monospace;
  font-size: 0.86em;
  background: #f3f5f7;
  padding: 0.05em 0.28em;
  border-radius: 2px;
}
pre {
  white-space: pre-wrap;
  word-break: break-word;
  background: #f4f6f8;
  border-left: 3px solid #1a3358;
  padding: 7px 10px;
  font-size: 8.3pt;
  line-height: 1.45;
  margin: 0.6em 0 0.85em;
}
pre code { background: transparent; padding: 0; font-size: inherit; }
pre.keep, .keep, figure, table {
  break-inside: avoid;
  page-break-inside: avoid;
}
.keep { margin: 0.55em 0 0.85em; }
table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
  font-size: 8.7pt;
  line-height: 1.42;
}
th {
  background: #0e1c33;
  color: #fff;
  font-weight: 700;
  text-align: left;
}
td, th {
  border: 0.4pt solid #d5d8de;
  padding: 3.5px 6px;
  vertical-align: top;
  overflow-wrap: anywhere;
  word-break: break-word;
}
tbody tr:nth-child(even) td { background: #f6f7f9; }
tr, thead, tbody { break-inside: avoid; page-break-inside: avoid; }
td code, th code { word-break: break-all; background: transparent; padding: 0; }
figure.shot { margin: 0.45em 0 0.85em; text-align: center; }
figure.shot img, img.cellshot {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
  object-fit: contain;
}
figure.shot img { max-height: 142mm; }
figure.shot.qr img { max-height: 46mm; width: 46mm; }
.pair {
  display: flex;
  gap: 3.5mm;
  align-items: flex-start;
  margin: 0.45em 0 0.85em;
  break-inside: avoid;
  page-break-inside: avoid;
}
.pair figure { flex: 1 1 0; margin: 0; min-width: 0; }
.pair img { max-height: 62mm; max-width: 100%; }
figcaption {
  font-size: 8.4pt;
  color: #555;
  text-align: center;
  margin-top: 0.28em;
  line-height: 1.4;
}
figure.arch {
  margin: 0.5em 0 0.9em;
  padding: 3.5mm 4mm 2.5mm;
  border: 0.7pt solid #d5dbe3;
  background: #f7f9fb;
}
.abox {
  border: 0.8pt solid #1a3358;
  background: #fff;
  text-align: center;
  padding: 1.6mm 2.5mm;
}
.alabel { font-weight: 750; font-size: 9.2pt; color: #0e1c33; }
.abody { font-size: 8.5pt; color: #333; line-height: 1.35; }
.aarrow { text-align: center; color: #1a3358; font-size: 8pt; line-height: 1; margin: 0.4mm 0; }
.arow { display: flex; gap: 2mm; }
.arow .abox { flex: 1; }
.abox.sub { margin-top: 1.8mm; background: #0e1c33; border-color: #0e1c33; }
.abox.sub .abody { color: #fff; }
.cover {
  width: 210mm;
  height: 297mm;
  position: relative;
  overflow: hidden;
  background: #07111f;
  color: #fff;
  break-after: page;
  page-break-after: always;
}
.cover-bg {
  position: absolute;
  inset: 0;
  padding: 12mm 10mm;
  font-size: 8.5pt;
  line-height: 2.15;
  letter-spacing: 0.22em;
  color: rgba(255,255,255,0.045);
  word-break: break-word;
}
.frame-a, .frame-b {
  position: absolute;
  border: 0.8pt solid rgba(212, 175, 106, 0.92);
  pointer-events: none;
}
.frame-a { inset: 7.5mm; }
.frame-b { inset: 9.2mm; border-color: rgba(212, 175, 106, 0.38); }
.cover-inner {
  position: absolute;
  top: 16mm; right: 16mm; bottom: 14mm; left: 16mm;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  z-index: 1;
}
.kicker {
  margin-top: 18mm;
  color: #d7b56a;
  font-size: 11pt;
  font-weight: 650;
  letter-spacing: 0.34em;
}
.title {
  margin: 14mm 0 0;
  font-size: 46pt;
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.03em;
}
.title span { display: block; }
.title .red { color: #ef2d2d; display: inline; }
.lead {
  margin: 12mm 0 0;
  font-size: 12.5pt;
  font-weight: 500;
}
.deck {
  margin: 3.5mm 0 0;
  font-size: 13pt;
  font-weight: 700;
  line-height: 1.55;
}
.goldline {
  margin: 7mm 0 0;
  color: #d7b56a;
  font-size: 11pt;
  font-weight: 600;
}
.by {
  margin: 14mm 0 0;
  color: #d7b56a;
  font-size: 16pt;
  font-weight: 750;
}
.publisher {
  margin-top: auto;
  margin-bottom: 4mm;
  font-size: 13pt;
  font-weight: 650;
  letter-spacing: 0.14em;
}
.author-page { break-after: page; page-break-after: always; }
.toc-page { break-after: page; page-break-after: always; }
.author-page h2.who {
  font-size: 14pt;
  margin: 0.2em 0 0.45em;
  border: 0;
}
.author-page ul { margin-top: 0.2em; }
.author-page li { margin: 0.22em 0; }
.toc a.row {
  display: flex;
  align-items: baseline;
  color: #1a1a1a;
  text-decoration: none;
  padding: 1px 0;
}
.toc ol { list-style: none; margin: 0; padding: 0; }
.toc .lv1 { font-weight: 750; font-size: 10.6pt; margin-top: 0.42em; }
.toc .lv2 { font-weight: 500; font-size: 10pt; padding-left: 0.9em; }
.toc .lv3 { font-weight: 400; font-size: 9.3pt; color: #333; padding-left: 1.9em; }
.toc .dots {
  flex: 1 1 auto;
  border-bottom: 1px dotted #b5b5b5;
  margin: 0 4px 0.22em;
  min-width: 6px;
}
.toc .pageno {
  flex: 0 0 9mm;
  width: 9mm;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: #333;
}
"""

EPUB_CSS = r"""
body {
  font-family: "Nanum Gothic", sans-serif;
  font-size: 1em;
  line-height: 1.75;
  color: #1c1c1c;
  margin: 0;
  padding: 0;
}
h1 {
  font-size: 1.45em;
  line-height: 1.3;
  border-bottom: 3px solid #e10600;
  padding-bottom: 0.15em;
  margin: 0 0 0.6em;
  page-break-before: always;
  break-before: page;
}
h1.no-break, h1.front-title { page-break-before: auto; break-before: auto; }
h2 { font-size: 1.2em; margin: 1.3em 0 0.4em; page-break-after: avoid; }
h3 { font-size: 1.08em; margin: 1.15em 0 0.35em; page-break-after: avoid; }
p { margin: 0.4em 0 0.7em; }
a { color: #153e75; }
blockquote {
  margin: 0.7em 0;
  padding: 0.5em 0.8em;
  border-left: 3px solid #c6a15a;
  background: #fbf8f2;
}
pre, .keep, table, figure, .pair, tr {
  page-break-inside: avoid;
  break-inside: avoid;
}
pre {
  white-space: pre-wrap;
  word-break: break-word;
  background: #f4f6f8;
  border-left: 3px solid #1a3358;
  padding: 0.6em 0.7em;
  font-size: 0.86em;
  line-height: 1.45;
}
code { font-family: "Nanum Gothic", monospace; font-size: 0.9em; }
table { width: 100%; border-collapse: collapse; font-size: 0.9em; margin: 0.6em 0; }
th { background: #0e1c33; color: #fff; text-align: left; }
td, th { border: 1px solid #d5d8de; padding: 0.3em 0.45em; vertical-align: top; overflow-wrap: anywhere; word-break: break-word; }
img { max-width: 100%; height: auto; object-fit: contain; }
figure { margin: 0.6em 0 1em; text-align: center; }
figcaption { font-size: 0.85em; color: #555; margin-top: 0.3em; }
.pair { display: block; }
.pair figure { margin: 0.4em 0; }
figure.arch { border: 1px solid #d5dbe3; background: #f7f9fb; padding: 0.6em; text-align: center; }
.abox { border: 1px solid #1a3358; background: #fff; margin: 0.25em 0; padding: 0.35em; }
.alabel { font-weight: 700; }
.abody { font-size: 0.92em; }
.aarrow { margin: 0.1em 0; }
.arow .abox { margin: 0.25em 0; }
.abox.sub { background: #0e1c33; color: #fff; }
.cover-page { margin: 0; padding: 0; text-align: center; }
.cover-page img { width: 100%; height: auto; }
ul, ol { padding-left: 1.2em; }
"""


def norm(text: str) -> str:
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def prepare_images() -> None:
    if IMG_DIR.exists():
        shutil.rmtree(IMG_DIR)
    IMG_DIR.mkdir(parents=True)
    for src in SHOTS.iterdir():
        if src.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
            continue
        _save_print(src, IMG_DIR / src.name)
    gif = SHOTS / "demo.gif"
    if gif.exists():
        im = Image.open(gif)
        im.seek(0)
        _save_print(im.convert("RGB"), IMG_DIR / "demo-frame.png", already=True)


def _save_print(src, dest: Path, already: bool = False) -> None:
    im = src if already else Image.open(src)
    if im.mode not in ("RGB", "L"):
        im = im.convert("RGB")
    max_w = 1500
    if im.width > max_w:
        h = round(im.height * max_w / im.width)
        im = im.resize((max_w, h), Image.Resampling.LANCZOS)
    if dest.suffix.lower() in {".jpg", ".jpeg"}:
        im.save(dest, "JPEG", quality=86, optimize=True)
    else:
        im.save(dest, "PNG", optimize=True)


def figure(alt: str, src: str, kind: str = "shot") -> str:
    cls = "shot qr" if "wechat-qr" in src else "shot"
    if kind == "pair":
        cls = "shot"
    cap = f"<figcaption>{html.escape(alt)}</figcaption>" if alt else ""
    return (
        f'<figure class="{cls}"><img src="{src}" alt="{html.escape(alt)}"/>{cap}</figure>'
    )


def preprocess(md: str) -> str:
    md = md.replace("\r\n", "\n")
    md = re.sub(r"^# AntiFox를 이용한 Red Team 운영 가이드\n+", "", md)
    md = re.sub(
        r"## 목차\n+\*\*본문\*\*:.*?\n+---\n+",
        "",
        md,
        count=1,
        flags=re.S,
    )
    md = md.replace(
        "> **법적·윤리적 고지 + 업스트림 사용정책 — 반드시 먼저 읽을 것**",
        "## 법적·윤리적 고지\n\n> **법적·윤리적 고지 + 업스트림 사용정책 — 반드시 먼저 읽을 것**",
        1,
    )
    md = re.sub(r"```mermaid\n.*?```", ARCH_HTML, md, count=1, flags=re.S)
    md = md.replace(
        "> 3언어 국제화 확인용 영문 UI: `screenshots/login-en.png`",
        "> 3언어 국제화 확인용 영문 UI.\n\n"
        + figure("AntiFox 로그인 화면 — 영문 UI", "images/login-en.png"),
    )
    md = md.replace(
        "- **v2.0 증거 구동 흐름 데모**: `screenshots/demo.gif` (공식 README의 v2.0 소개 GIF 원본)",
        "- **v2.0 증거 구동 흐름 데모** (공식 README GIF의 한 장면)\n\n"
        + figure("AntiFox v2.0 증거 구동 흐름 데모", "images/demo-frame.png"),
    )
    md = md.replace(
        "QR: `screenshots/wechat-qr.jpg`",
        "QR은 아래와 같다.\n\n" + figure("위챗 공식계정 QR", "images/wechat-qr.jpg"),
    )

    def linked_image(m: re.Match) -> str:
        alt, src = m.group(1), m.group(2)
        return f"![{alt}]({localize(src)})"

    md = re.sub(
        r"\[!\[([^\]]*)\]\(([^)]+)\)\]\([^)]+\)",
        linked_image,
        md,
    )

    def md_image(m: re.Match) -> str:
        return f"![{m.group(1)}]({localize(m.group(2))})"

    parts = re.split(r"(```.*?```)", md, flags=re.S)
    out = []
    for i, part in enumerate(parts):
        if i % 2 == 1:
            out.append(part)
            continue
        part = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", md_image, part)

        def html_img(m: re.Match) -> str:
            tag = m.group(0)
            src_m = re.search(r'src="([^"]+)"', tag)
            if not src_m:
                return tag
            return tag.replace(src_m.group(1), localize(src_m.group(1)), 1)

        part = re.sub(r"<img\b[^>]*>", html_img, part)
        out.append(part)
    return "".join(out)


def localize(src: str) -> str:
    src = src.strip()
    name = Path(unquote(urlparse(src).path)).name if "://" in src else Path(src).name
    if (IMG_DIR / name).exists():
        return f"images/{name}"
    return src


def render_body(md: str) -> tuple[str, list[dict]]:
    raw = markdown.markdown(
        md,
        extensions=["tables", "fenced_code", "sane_lists"],
        output_format="html5",
    )
    soup = BeautifulSoup(raw, "html.parser")
    headings: list[dict] = []
    n = 0
    for tag in soup.find_all(["h1", "h2", "h3"]):
        n += 1
        hid = f"h{n}"
        tag["id"] = hid
        if tag.name == "h1":
            tag["class"] = ["chapter"]
        title = norm(tag.get_text(" ", strip=True))
        headings.append({"id": hid, "level": int(tag.name[1]), "title": title})
    for pre in soup.find_all("pre"):
        text = pre.get_text()
        if len(text) < 700 and text.count("\n") <= 18:
            pre["class"] = (pre.get("class") or []) + ["keep"]
    for table in list(soup.find_all("table")):
        cells = table.find_all("td")
        imgs = table.find_all("img")
        if imgs and cells and len(imgs) == len(cells) and all(not td.get_text(strip=True) for td in cells):
            pair = soup.new_tag("div")
            pair["class"] = ["pair"]
            for img in imgs:
                fig = soup.new_tag("figure")
                fig["class"] = ["shot"]
                cap_text = img.get("alt") or ""
                img.extract()
                img["class"] = ["cellshot"]
                fig.append(img)
                if cap_text:
                    cap = soup.new_tag("figcaption")
                    cap.string = cap_text
                    fig.append(cap)
                pair.append(fig)
            table.replace_with(pair)
            continue
        wrap = soup.new_tag("div")
        wrap["class"] = ["keep"]
        table.wrap(wrap)
    for img in list(soup.find_all("img")):
        if img.find_parent(["figure", "td", "th"]):
            if img.find_parent(["td", "th"]) and not img.find_parent("figure"):
                img["class"] = ["cellshot"]
            continue
        fig = soup.new_tag("figure")
        src = img.get("src") or ""
        fig["class"] = ["shot", "qr"] if "wechat-qr" in src else ["shot"]
        alt = img.get("alt") or ""
        img.wrap(fig)
        if alt:
            cap = soup.new_tag("figcaption")
            cap.string = alt
            fig.append(cap)
    return str(soup), headings


def cover_html() -> str:
    noise = " · ".join(
        [
            "ANTIFOX",
            "EVIDENCE",
            "ROE",
            "MITM",
            "RBAC",
            "PURPLE TEAM",
            "CHAIN OF CUSTODY",
            "ISOLATED LAB",
            "AUTHORIZED TEST",
            "AGPL",
            "DETECTION",
            "HARDENING",
            "BLUE TEAM",
            "REPORT",
        ]
        * 18
    )
    return f"""
<section class="cover">
  <div class="cover-bg">{html.escape(noise)}</div>
  <div class="frame-a"></div>
  <div class="frame-b"></div>
  <div class="cover-inner">
    <div class="kicker">CYBER THREAT INTELLIGENCE</div>
    <p class="title"><span>AntiFox</span><span><span class="red">Red</span> Team</span><span>운영 가이드</span></p>
    <p class="lead">싸이월드 전 대표가 알려주는</p>
    <p class="deck">인가된 격리 환경에서 AI 멀티에이전트<br/>모의 침투를 안전하고 증거 기반으로 운용하는 법</p>
    <p class="goldline">AntiFox v2.0.x · 방어 · 검증 · 보고</p>
    <p class="by">김호광</p>
    <p class="publisher">유페이퍼</p>
  </div>
</section>
"""


def author_html() -> str:
    return """
<section class="author-page" id="author">
  <h1 class="front-title">저자 소개</h1>
  <h2 class="who">김호광 (Dennis Kim)</h2>
  <ul>
    <li>前 싸이월드 대표 — 한국의 대표 소셜 플랫폼, 3,500만 회원</li>
    <li>게임 보안, 소셜 플랫폼, 블록체인 분야 28년 이상의 개발 경력</li>
    <li>Microsoft Azure MVP 9년 연속 (2015–2023)</li>
    <li>사이버 위협 인텔리전스(CTI) · AI 기반 퀀트 투자 · Web3를 연구하는 독립 연구자</li>
    <li>원본 취약점 연구: 텔레그램 0-click RCE (ZDI-CAN-30207, CVSS 9.8 Critical)</li>
    <li>한국어·영어·일본어·중국어 4개 국어 콘텐츠 발행</li>
    <li>오픈 리서치 플랫폼 VibeQuant 운영: AI 퀀트 · 사이버 위협 인텔리전스 · Web3, 투자 칼럼 380여 편</li>
    <li>공개: vibequant.cc</li>
  </ul>
  <p>싸이월드에서 수천만 명이 글을 쓰고, 공유하고, 퍼뜨리는 장면을 가장 가까이에서 지켜봤다. 보안에서도 마찬가지다. 무엇이 공격되고 무엇이 막아지는지, 그 차이는 대부분 “어떤 환경에서”와 “누가 먼저 움직이는가”에서 갈렸다. AI 시대에도 이 원칙은 변하지 않는다. 바뀐 것은 그 원칙이 실행되는 속도다.</p>
  <p>이미 해외에서는 LLM, 인공지능을 이용한 모의 해킹 커리큘럼이 오픈 소스, 공개 교육 MOOC로 공개되어 있다. 한국의 경우 이런 정보의 접근성이 상대적으로 떨어졌고, 이 격차를 줄이기 위해 이 글을 대중에게 공개하게 되었다.</p>
  <p>원본 GitHub 저장소: vibe-investing / TechDoc/AntiFox</p>
</section>
"""


def toc_html(entries: list[dict], pages: dict[str, int] | None) -> str:
    items = []
    for ent in entries:
        lv = ent["level"]
        label = html.escape(ent["title"])
        if pages and ent["id"] in pages:
            num = str(pages[ent["id"]])
        else:
            num = ""
        items.append(
            f'<li class="lv{lv}"><a class="row" href="#{ent["id"]}">'
            f'<span class="ttl">{label}</span><span class="dots"></span>'
            f'<span class="pageno">{num}</span></a></li>'
        )
    return (
        '<section class="toc-page" id="toc">'
        '<h1 class="front-title">목차</h1>'
        f'<nav class="toc"><ol>{"".join(items)}</ol></nav>'
        "</section>"
    )


def full_html(body: str, entries: list[dict], pages: dict[str, int] | None) -> str:
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<title>{html.escape(TITLE)}</title>
<style>{PRINT_CSS}</style>
</head>
<body>
{cover_html()}
{author_html()}
{toc_html(entries, pages)}
<article id="body">
{body}
</article>
</body>
</html>
"""


def print_pdf(html_path: Path, pdf_path: Path) -> None:
    profile = BUILD / "_chrome"
    if profile.exists():
        shutil.rmtree(profile, ignore_errors=True)
    profile.mkdir(parents=True)
    if pdf_path.exists():
        pdf_path.unlink()
    cmd = [
        CHROME,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--no-first-run",
        "--disable-extensions",
        "--allow-file-access-from-files",
        f"--user-data-dir={profile}",
        f"--print-to-pdf={pdf_path}",
        html_path.as_uri(),
    ]
    subprocess.run(cmd, check=True, timeout=180)


def line_matches(line: str, title: str) -> bool:
    line, title = norm(line), norm(title)
    if len(line) < 4 or len(title) < 4:
        return False
    n = min(len(line), len(title), 24)
    if n < 6:
        return line == title
    return line[:n] == title[:n]


def large_lines(page: fitz.Page) -> list[tuple[float, str, float]]:
    out = []
    data = page.get_text("dict")
    for block in data.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            spans = line.get("spans") or []
            if not spans:
                continue
            text = norm("".join(s.get("text", "") for s in spans))
            size = max(s.get("size", 0) for s in spans)
            if text and size >= 11.6:
                out.append((line["bbox"][1], text, size))
    out.sort(key=lambda x: x[0])
    return out


def locate_headings(doc: fitz.Document, headings: list[dict]) -> tuple[dict[str, int], dict[str, float]]:
    pages: dict[str, int] = {}
    ys: dict[str, float] = {}
    cursor = (0, -1.0)
    for ent in headings:
        found = False
        for pi in range(cursor[0], doc.page_count):
            for y, text, _size in large_lines(doc[pi]):
                if pi == cursor[0] and y <= cursor[1] + 0.6:
                    continue
                if line_matches(text, ent["title"]):
                    pages[ent["id"]] = pi + 1
                    ys[ent["id"]] = y
                    cursor = (pi, y)
                    found = True
                    break
            if found:
                break
        if not found:
            print(f"  miss: {ent['title']}")
    return pages, ys


def add_toc_links(doc: fitz.Document, entries: list[dict], pages: dict[str, int], ys: dict[str, float]) -> None:
    """Chrome print drops in-document # links. Paint GoTo annotations on the TOC rows."""
    toc_start = None
    for i, page in enumerate(doc):
        for _y, text, size in large_lines(page):
            if size >= 16 and norm(text) == "목차":
                toc_start = i
                break
        if toc_start is not None:
            break
    body_pages = [pages[e["id"]] for e in entries if e["id"] != "author" and e["id"] in pages]
    if toc_start is None or not body_pages:
        print("toc link skip", toc_start, len(body_pages))
        return
    first_body = min(body_pages)
    rows = []
    for pi in range(toc_start, first_body - 1):
        data = doc[pi].get_text("dict")
        for block in data.get("blocks", []):
            if block.get("type") != 0:
                continue
            for line in block.get("lines", []):
                spans = line.get("spans") or []
                if not spans:
                    continue
                text = norm("".join(s.get("text", "") for s in spans))
                size = max(s.get("size", 0) for s in spans)
                if not text or text.isdigit() or text.startswith("AntiFox Red"):
                    continue
                if size > 12.2:
                    continue
                rows.append((pi, fitz.Rect(line["bbox"]), text))
    linked = 0
    ri = 0
    for ent in entries:
        title = norm(ent["title"])
        while ri < len(rows):
            pi, rect, text = rows[ri]
            ri += 1
            if not line_matches(text, title):
                continue
            dest = pages.get(ent["id"])
            if not dest:
                break
            rect.x0 = 42
            rect.x1 = min(doc[pi].rect.width - 36, 560)
            rect.y0 -= 1.2
            rect.y1 += 1.4
            doc[pi].insert_link(
                {
                    "kind": fitz.LINK_GOTO,
                    "from": rect,
                    "page": dest - 1,
                    "to": fitz.Point(48, max(32, ys.get(ent["id"], 48) - 4)),
                }
            )
            linked += 1
            break
    print(f"toc links {linked}/{len(entries)}")


def stamp_pdf(pdf_path: Path, headings: list[dict], pages: dict[str, int], ys: dict[str, float], entries: list[dict]) -> None:
    doc = fitz.open(pdf_path)
    toc_page = 3
    for i, page in enumerate(doc):
        hit = False
        for _y, text, size in large_lines(page):
            if size >= 16 and norm(text) == "목차":
                toc_page = i + 1
                hit = True
                break
        if hit:
            break
    toc = [[1, "표지", 1]]
    if "author" in pages:
        toc.append([1, "저자 소개", pages["author"]])
    toc.append([1, "목차", toc_page])
    for ent in headings:
        if ent["id"] == "author":
            continue
        pg = pages.get(ent["id"])
        if not pg:
            continue
        toc.append([ent["level"], ent["title"][:80], pg])
    flat = []
    prev = 0
    for level, title, page in toc:
        if page < 1:
            continue
        level = 1 if prev == 0 else min(level, prev + 1)
        level = max(1, level)
        flat.append([level, title, page])
        prev = level
    doc.set_toc(flat)
    doc.set_metadata(
        {
            "title": TITLE,
            "author": "김호광 (Dennis Kim)",
            "subject": "인가된 격리 환경에서의 AI 멀티에이전트 모의 침투 운영",
            "keywords": "AntiFox, CTI, red team, 유페이퍼",
            "creator": "AntiFox ebook builder",
            "producer": "유페이퍼",
        }
    )
    try:
        doc.set_page_mode("UseOutlines")
    except Exception:
        pass
    add_toc_links(doc, entries, pages, ys)
    tmp = pdf_path.with_suffix(".tmp.pdf")
    doc.save(tmp, garbage=4, deflate=True)
    doc.close()
    tmp.replace(pdf_path)


def audit(pdf_path: Path) -> None:
    doc = fitz.open(pdf_path)
    print(f"pages {doc.page_count}")
    problems = []
    for i, page in enumerate(doc):
        text = page.get_text().strip()
        if i > 0 and len(text) < 15:
            problems.append(f"blank-ish p{i+1}")
        for info in page.get_image_info():
            box = fitz.Rect(info["bbox"])
            if box.height > page.rect.height - 28:
                problems.append(f"image too tall p{i+1} h={box.height:.0f}")
            if box.y1 > page.rect.height + 1 or box.y0 < -1:
                problems.append(f"image off page p{i+1} {box}")
            if box.x1 > page.rect.width + 1 or box.x0 < -1:
                problems.append(f"image off side p{i+1} {box}")
    link_ok = 0
    link_bad = 0
    for page in doc:
        for link in page.get_links():
            if link.get("kind") != fitz.LINK_GOTO:
                continue
            dest = link.get("page")
            if dest is None or dest < 0 or dest >= doc.page_count:
                link_bad += 1
            else:
                link_ok += 1
    print(f"internal links ok={link_ok} bad={link_bad}")
    if problems:
        print("AUDIT")
        for p in problems:
            print(" ", p)
    else:
        print("audit clean")
    doc.close()


def xhtml_fragment(fragment: str) -> str:
    wrapper = f'<div xmlns="http://www.w3.org/1999/xhtml">{fragment}</div>'
    root = lhtml.fromstring(wrapper)
    parts = []
    for child in root:
        parts.append(
            lhtml.tostring(child, encoding="unicode", method="xml", with_tail=False)
        )
    return "\n".join(parts)


def epub_page(title: str, body: str, css: str = "style.css") -> str:
    inner = xhtml_fragment(body)
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ko" lang="ko">
<head>
  <title>{html.escape(title)}</title>
  <link rel="stylesheet" type="text/css" href="{css}"/>
</head>
<body>
{inner}
</body>
</html>
"""


def extract_font(dest: Path) -> None:
    from fontTools.ttLib import TTCollection

    ttc_path = Path(
        "/System/Library/AssetsV2/com_apple_MobileAsset_Font7/"
        "bad9b4bf17cf1669dde54184ba4431c22dcad27b.asset/AssetData/NanumGothic.ttc"
    )
    if not ttc_path.exists():
        print("nanum ttc missing; epub will rely on reader fonts")
        return
    ttc = TTCollection(str(ttc_path))
    wanted = {"Regular": "NanumGothic.ttf", "Bold": "NanumGothicBold.ttf"}
    for font in ttc.fonts:
        style = font["name"].getDebugName(2) or ""
        name = wanted.get(style)
        if name:
            font.save(str(dest / name))


def build_epub(body_html: str, entries: list[dict], cover_png: Path) -> None:
    soup = BeautifulSoup(body_html, "html.parser")
    article = soup.find("article") or soup
    # Split on h1.chapter so each chapter is its own spine item.
    blocks: list[tuple[str, str, str]] = []
    current_id = "front"
    current_title = "이 책에 대하여"
    buf: list[str] = []

    def flush() -> None:
        if buf:
            blocks.append((current_id, current_title, "".join(buf)))

    for el in list(article.children):
        if getattr(el, "name", None) == "h1":
            flush()
            buf = []
            current_id = el.get("id") or f"c{len(blocks)+1}"
            current_title = norm(el.get_text(" ", strip=True))
        buf.append(str(el))
    flush()

    oebps = BUILD / "epub" / "OEBPS"
    if oebps.exists():
        shutil.rmtree(oebps.parent)
    (oebps / "images").mkdir(parents=True)
    (oebps / "fonts").mkdir()
    meta = BUILD / "epub" / "META-INF"
    meta.mkdir(parents=True)
    (meta / "container.xml").write_text(
        """<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
""",
        encoding="utf-8",
    )
    shutil.copy(cover_png, oebps / "images" / "cover.png")
    for img in IMG_DIR.iterdir():
        shutil.copy(img, oebps / "images" / img.name)
    extract_font(oebps / "fonts")
    font_face = ""
    if (oebps / "fonts" / "NanumGothic.ttf").exists():
        font_face = """
@font-face { font-family: "Nanum Gothic"; src: url("fonts/NanumGothic.ttf"); font-weight: 400; }
@font-face { font-family: "Nanum Gothic"; src: url("fonts/NanumGothicBold.ttf"); font-weight: 700; }
"""
    (oebps / "style.css").write_text(font_face + EPUB_CSS, encoding="utf-8")

    def rewrite_imgs(fragment: str) -> str:
        return fragment  # already images/ relative, and epub pages live in OEBPS

    manifest = [
        '<item id="css" href="style.css" media-type="text/css"/>',
        '<item id="cover-image" href="images/cover.png" media-type="image/png" properties="cover-image"/>',
        '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
        '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
        '<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>',
        '<item id="author" href="author.xhtml" media-type="application/xhtml+xml"/>',
        '<item id="contents" href="contents.xhtml" media-type="application/xhtml+xml"/>',
    ]
    spine = ["cover", "author", "contents"]
    file_of: dict[str, str] = {"author": "author.xhtml", "toc": "contents.xhtml"}

    for img in sorted((oebps / "images").iterdir()):
        if img.name == "cover.png":
            continue
        media = "image/jpeg" if img.suffix.lower() in {".jpg", ".jpeg"} else "image/png"
        manifest.append(
            f'<item id="img-{img.stem}" href="images/{img.name}" media-type="{media}"/>'
        )
    for font in sorted((oebps / "fonts").glob("*.ttf")):
        manifest.append(
            f'<item id="font-{font.stem}" href="fonts/{font.name}" media-type="font/ttf"/>'
        )

    (oebps / "cover.xhtml").write_text(
        epub_page(
            TITLE,
            '<section class="cover-page"><img src="images/cover.png" alt="표지"/></section>',
        ),
        encoding="utf-8",
    )
    author = author_html().replace('class="front-title"', 'class="front-title no-break"')
    (oebps / "author.xhtml").write_text(epub_page("저자 소개", author), encoding="utf-8")

    # Map heading id -> chapter file
    for idx, (cid, ctitle, fragment) in enumerate(blocks, start=1):
        fname = f"c{idx:02d}.xhtml"
        ids = re.findall(r'id="(h\d+)"', fragment)
        for hid in ids:
            file_of[hid] = fname
        manifest.append(
            f'<item id="{cid}" href="{fname}" media-type="application/xhtml+xml"/>'
        )
        spine.append(cid)
        (oebps / fname).write_text(
            epub_page(ctitle, rewrite_imgs(fragment)), encoding="utf-8"
        )

    def href_for(ent_id: str) -> str:
        return f'{file_of.get(ent_id, "c01.xhtml")}#{ent_id}'

    ncx_points = [
        '<navPoint id="nav-author" playOrder="1"><navLabel><text>저자 소개</text></navLabel><content src="author.xhtml#author"/></navPoint>',
        '<navPoint id="nav-contents" playOrder="2"><navLabel><text>목차</text></navLabel><content src="contents.xhtml"/></navPoint>',
    ]
    toc_buf = ["<ol>"]
    nav_buf = [
        '<li><a href="author.xhtml#author">저자 소개</a></li>',
        "<li><a href=\"contents.xhtml\">목차</a></li>",
    ]
    play = 3
    for ent in entries:
        if ent["id"] == "author":
            continue
        target = href_for(ent["id"])
        label = html.escape(ent["title"])
        pad = {1: "0", 2: "1.1em", 3: "2.2em"}.get(ent["level"], "2.2em")
        weight = "700" if ent["level"] == 1 else "400"
        toc_buf.append(
            f'<li style="margin-left:{pad};font-weight:{weight}"><a href="{target}">{label}</a></li>'
        )
        nav_buf.append(f'<li><a href="{target}">{label}</a></li>')
        ncx_points.append(
            f'<navPoint id="nav-{ent["id"]}" playOrder="{play}">'
            f"<navLabel><text>{label}</text></navLabel>"
            f'<content src="{target}"/></navPoint>'
        )
        play += 1
    toc_buf.append("</ol>")

    contents = (
        '<h1 class="front-title no-break">목차</h1><nav class="toc">'
        + "".join(toc_buf)
        + "</nav>"
    )
    (oebps / "contents.xhtml").write_text(epub_page("목차", contents), encoding="utf-8")
    nav = (
        '<nav epub:type="toc" id="toc"><h1>목차</h1><ol>'
        + "".join(nav_buf)
        + "</ol></nav>"
    )
    (oebps / "nav.xhtml").write_text(
        """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ko" lang="ko">
<head><title>목차</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
"""
        + nav
        + "\n</body></html>",
        encoding="utf-8",
    )
    (oebps / "toc.ncx").write_text(
        f"""<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="{BOOK_ID}"/>
    <meta name="dtb:depth" content="3"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>{html.escape(TITLE)}</text></docTitle>
  <navMap>
    {''.join(ncx_points)}
  </navMap>
</ncx>
""",
        encoding="utf-8",
    )
    (oebps / "content.opf").write_text(
        f"""<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0" xml:lang="ko">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">{BOOK_ID}</dc:identifier>
    <dc:title>{html.escape(TITLE)}</dc:title>
    <dc:creator id="creator">김호광</dc:creator>
    <meta refines="#creator" property="file-as">김호광</meta>
    <dc:publisher>유페이퍼</dc:publisher>
    <dc:language>ko</dc:language>
    <dc:date>2026-11-14</dc:date>
    <dc:rights>© Dennis Kim. 지식 공유 목적의 무료 배포본. 인가되지 않은 시스템에 대한 사용을 금한다.</dc:rights>
    <dc:source>https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/AntiFox/AntiFox-Guide.md</dc:source>
    <meta property="dcterms:modified">2026-11-14T05:00:00Z</meta>
    <meta name="cover" content="cover-image"/>
  </metadata>
  <manifest>
    {''.join(manifest)}
  </manifest>
  <spine toc="ncx">
    {''.join(f'<itemref idref="{s}"/>' for s in spine)}
  </spine>
</package>
""",
        encoding="utf-8",
    )

    epub_path = WORK / "AntiFox-Red-Team-Guide.epub"
    if epub_path.exists():
        epub_path.unlink()
    root = BUILD / "epub"
    with zipfile.ZipFile(epub_path, "w") as zf:
        zf.writestr("mimetype", "application/epub+zip", compress_type=zipfile.ZIP_STORED)
        for path in sorted(root.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(root).as_posix(), compress_type=zipfile.ZIP_DEFLATED)
    print("epub", epub_path, epub_path.stat().st_size)


def export_cover(pdf_path: Path) -> Path:
    doc = fitz.open(pdf_path)
    pix = doc[0].get_pixmap(matrix=fitz.Matrix(2.2, 2.2), alpha=False)
    dest = WORK / "cover.png"
    pix.save(str(dest))
    doc.close()
    return dest


def main() -> None:
    WORK.mkdir(exist_ok=True)
    prepare_images()
    md = preprocess(SRC.read_text(encoding="utf-8"))
    body, headings = render_body(md)
    entries = [{"id": "author", "level": 1, "title": "저자 소개"}] + [
        h for h in headings if h["title"] != "저자 소개"
    ]
    # Keep the closing author credit out of the TOC; the front page is the author page.
    html_path = BUILD / "book.html"
    pdf_path = WORK / "AntiFox-Red-Team-Guide.pdf"
    scan = [{"id": "author", "level": 1, "title": "저자 소개"}] + headings
    pages: dict[str, int] = {}
    ys: dict[str, float] = {}
    for attempt in range(1, 4):
        html_path.write_text(full_html(body, entries, pages or None), encoding="utf-8")
        print(f"pass {attempt}")
        print_pdf(html_path, pdf_path)
        doc = fitz.open(pdf_path)
        found, ys = locate_headings(doc, scan)
        doc.close()
        print(f"located {len(found)}/{len(scan)}")
        if found == pages:
            break
        pages = found
    stamp_pdf(pdf_path, headings, pages, ys, entries)
    audit(pdf_path)
    cover = export_cover(pdf_path)
    build_epub(f"<article>{body}</article>", entries, cover)
    print("pdf", pdf_path, pdf_path.stat().st_size)
    print("cover", cover)


if __name__ == "__main__":
    main()
