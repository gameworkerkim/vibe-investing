// OpenRDHx 사업계획서 PPT 생성기
//
//   cd <레포>/02.Investment Idea Column/AI-IDC/OpenRDHx
//   npm install pptxgenjs          # 한 번만
//   NODE_PATH="$PWD/node_modules" PPTX_SKILL_DIR="<pptx 스킬 경로>" node scripts/build_deck.js
//
// 출력은 10_사업계획서/OpenRDHx_사업계획서.pptx 다. 슬라이드를 손으로 고치지 않는다.
// 숫자를 바꾸려면 하위 문서를 먼저 고치고 이 스크립트를 맞춘 뒤 다시 돌린다.
const pptxgen = require("pptxgenjs");
const path = require("path");

const THEME = {
  name: "OpenRDHx v1.2",
  headFontFace: "Apple SD Gothic Neo",
  bodyFontFace: "Apple SD Gothic Neo",
  colors: {
    dk1: "16222E", lt1: "FFFFFF", dk2: "0E2A3B", lt2: "F2F5F7",
    accent1: "0E7C8A", accent2: "1B4C63", accent3: "D9643A",
    accent4: "6E8793", accent5: "2E7D5B", accent6: "A33B2A",
    hlink: "0E7C8A", folHlink: "1B4C63",
  },
};
const HEX = THEME.colors;
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";            // 13.33 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "Project OpenRDHx";
pres.company = "Project OpenRDHx";
pres.title = "OpenRDHx 사업계획서 v1.2";
pres.subject = "레거시 공랭 IDC·채굴장을 랙당 40kW로 올리는 공개 전환 플랫폼";
const C = pres.SchemeColor;

const W = 13.33, H = 7.5, M = 0.62;
const FOOT = "Project OpenRDHx  ·  사업계획서 v1.2  ·  2026-11-22  ·  실측 전 설계 목표";

/* ---------- layouts ---------- */
pres.defineSlideMaster({
  title: "TITLE_DARK", background: { color: HEX.dk2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 2.30, w: 10.6, h: 2.0,
        fontSize: 40, bold: true, color: C.background1, lineSpacing: 48, valign: "top" }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: M, y: 4.45, w: 10.2, h: 1.1,
        fontSize: 15, color: HEX.a4l || "9FB3BD", lineSpacing: 24, valign: "top" }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CLOSE_DARK", background: { color: HEX.dk2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.78, w: 11.4, h: 0.72,
        fontSize: 30, bold: true, color: C.background1, valign: "middle" }, text: "" } },
    { text: { text: FOOT, options: { x: M, y: H - 0.52, w: 9.2, h: 0.3, fontSize: 9,
        color: "5B7682", isTextBox: true, margin: 0 } } },
    { placeholder: { options: { name: "slideNumber", type: "sldNum", x: W - 1.25, y: H - 0.52,
        w: 0.6, h: 0.3, fontSize: 9, color: "5B7682", align: "right" } } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT", background: { color: C.background1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 1.52, y: 0.52, w: 11.2, h: 0.70,
        fontSize: 29, bold: true, color: C.text1, valign: "middle", margin: 0 }, text: "" } },
    { text: { text: FOOT, options: { x: M, y: H - 0.48, w: 9.2, h: 0.28, fontSize: 9,
        color: HEX.accent4, isTextBox: true, margin: 0 } } },
    { placeholder: { options: { name: "slideNumber", type: "sldNum", x: W - 1.25, y: H - 0.48,
        w: 0.6, h: 0.28, fontSize: 9, color: HEX.accent4, align: "right" } } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENT_TINT", background: { color: HEX.lt2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 1.52, y: 0.52, w: 11.2, h: 0.70,
        fontSize: 29, bold: true, color: C.text1, valign: "middle", margin: 0 }, text: "" } },
    { text: { text: FOOT, options: { x: M, y: H - 0.48, w: 9.2, h: 0.28, fontSize: 9,
        color: HEX.accent4, isTextBox: true, margin: 0 } } },
    { placeholder: { options: { name: "slideNumber", type: "sldNum", x: W - 1.25, y: H - 0.48,
        w: 0.6, h: 0.28, fontSize: 9, color: HEX.accent4, align: "right" } } },
  ],
});

/* ---------- helpers ---------- */
// 번호 chip (모티프 1): 제목 왼쪽의 테두리 원 + 번호
function chip(s, n) {
  s.addShape(pres.ShapeType.ellipse, { x: M, y: 0.53, w: 0.68, h: 0.68,
    fill: { color: HEX.accent1 }, objectName: `chip-${n}` });
  s.addText(n, { x: M, y: 0.53, w: 0.68, h: 0.68, fontSize: 15, bold: true,
    color: "FFFFFF", align: "center", valign: "middle", isTextBox: true, margin: 0 });
}
// 열 모티프 (모티프 2): 45°C → 27°C 두 톤 알약
function thermalPill(s, x, y, opt = {}) {
  const w = opt.w || 2.55, h = opt.h || 0.42, fs = opt.fs || 12;
  s.addShape(pres.ShapeType.roundRect, { x, y, w: w / 2, h, rectRadius: 0.2,
    fill: { color: HEX.accent3 }, objectName: "pill-hot" });
  s.addShape(pres.ShapeType.roundRect, { x: x + w / 2, y, w: w / 2, h, rectRadius: 0.2,
    fill: { color: HEX.accent1 }, objectName: "pill-cold" });
  s.addText("공기 45°C", { x, y, w: w / 2, h, fontSize: fs, bold: true, color: "FFFFFF",
    align: "center", valign: "middle", isTextBox: true, margin: 0 });
  s.addText("27°C", { x: x + w / 2, y, w: w / 2, h, fontSize: fs, bold: true, color: "FFFFFF",
    align: "center", valign: "middle", isTextBox: true, margin: 0 });
}
function kicker(s, t) {
  s.addText(t, { x: 1.52, y: 1.26, w: 11.2, h: 0.32, fontSize: 13, color: HEX.accent1,
    bold: true, isTextBox: true, margin: 0, objectName: "kicker" });
}
// 카드
function card(s, o) {
  s.addShape(pres.ShapeType.roundRect, { x: o.x, y: o.y, w: o.w, h: o.h, rectRadius: 0.06,
    fill: { color: o.fill || "FFFFFF" },
    line: o.line === false ? undefined : { color: o.lineColor || "D8E2E7", width: 1 },
    shadow: o.shadow ? { type: "outer", color: "16222E", opacity: 0.08, blur: 10, offset: 2, angle: 90 } : undefined,
    objectName: o.name || "card" });
}
// 큰 숫자 + 라벨
function stat(s, o) {
  s.addText(o.value, { x: o.x, y: o.y, w: o.w, h: o.vh || 0.78, fontSize: o.fs || 38, bold: true,
    color: o.color || HEX.accent1, align: o.align || "left", valign: "bottom",
    isTextBox: true, margin: 0 });
  s.addText(o.label, { x: o.x, y: o.y + (o.vh || 0.78) + 0.03, w: o.w, h: o.lh || 0.5, fontSize: o.lfs || 11,
    color: HEX.accent4, align: o.align || "left", valign: "top", isTextBox: true, margin: 0,
    lineSpacing: (o.lfs || 11) * 1.45 });
}
function bullets(s, items, o) {
  s.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: i !== items.length - 1 } })),
    { x: o.x, y: o.y, w: o.w, h: o.h, fontSize: o.fs || 13, color: o.color || C.text1,
      lineSpacing: (o.fs || 13) * 1.5, paraSpaceAfter: 7, isTextBox: true, margin: 0, valign: "top" });
}
const TBL = (hdr) => ({
  border: { type: "solid", color: "DCE5EA", pt: 1 },
  fontFace: THEME.bodyFontFace,
  autoPage: false,
});
function headerRow(cells) {
  return cells.map((t) => ({ text: t, options: { bold: true, color: "FFFFFF",
    fill: { color: HEX.accent2 }, fontSize: 12, valign: "middle" } }));
}
function note(s, t, y) {
  s.addText(t, { x: 1.52, y: y, w: 11.2, h: 0.62, fontSize: 10.5, color: HEX.accent4,
    italic: true, isTextBox: true, margin: 0, lineSpacing: 16, valign: "top", objectName: "note" });
}

/* =======================  SLIDES  ======================= */
pres.addSection({ title: "표지" });
let s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "표지" });
s.addText("PROJECT OPENRDHX", { x: M, y: 1.15, w: 8, h: 0.4, fontSize: 14, bold: true,
  color: HEX.accent1, charSpacing: 3, isTextBox: true, margin: 0 });
s.addText([
  { text: "랙을 열지 않고,", options: { breakLine: true } },
  { text: "배기 ", options: {} },
  { text: "40kW", options: { color: HEX.accent3 } },
  { text: "를 ", options: {} },
  { text: "18°C 물", options: { color: HEX.accent1 } },
  { text: "에 넘긴다.", options: {} },
], { placeholder: "title" });
s.addText("레거시 공랭 IDC와 채굴장을 AI 고전력 실로 올리는 공개 전환 플랫폼.\n1차 제품은 A40 한 점. 랙 일체형 R50은 48kW 계획.",
  { placeholder: "body" });
thermalPill(s, M, 5.80, { w: 3.0, h: 0.46, fs: 13 });
s.addText("물 18°C → 26°C  ·  7,000 m³/h  ·  72 L/min", { x: M + 3.22, y: 5.80, w: 5.2, h: 0.46,
  fontSize: 12.5, color: "9FB3BD", valign: "middle", isTextBox: true, margin: 0 });
s.addText("사업계획서 v1.2  ·  2026-11-22", { x: W - 4.3, y: 6.72, w: 3.68, h: 0.32,
  fontSize: 10.5, color: "5B7682", align: "right", isTextBox: true, margin: 0 });
s.addNotes("v1.1 대비 바뀐 것: 사업 구조를 3층으로 정리했고, 자체 5MW IDC를 앵커로 넣었고, 설계 교정 18건을 반영했다. 투자 금액·지분은 이 문서에 없고 레포에도 없다.");

/* 2. 한 장 결론 */
pres.addSection({ title: "결론" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "결론" });
chip(s, "01"); s.addText("한 장 결론", { placeholder: "title" });
kicker(s, "도어를 팔아 개발비를 갚는 계획이 아니다");
[["40", "kW", "A40 정격\n공기 45/27°C, 물 18/26°C", HEX.accent1],
 ["139", "대", "자체 5MW IDC가 쓰는\nRDHx 앵커 물량", HEX.accent1],
 ["111", "대", "외부에 팔아야 하는 대수\n(v1.1은 232대 전부 외부)", HEX.accent3],
 ["4~6", "%", "고객 전환비에서\n도어가 차지하는 비중", HEX.accent2]
].forEach(([v, u, l, col], i) => {
  const x = M + i * 3.09;
  card(s, { x, y: 1.78, w: 2.86, h: 1.78, shadow: true, name: `stat-${i}` });
  s.addText([{ text: v, options: { fontSize: 42, bold: true, color: col } },
             { text: " " + u, options: { fontSize: 16, bold: true, color: col } }],
    { x: x + 0.22, y: 1.94, w: 2.42, h: 0.74, valign: "bottom", isTextBox: true, margin: 0 });
  s.addText(l, { x: x + 0.22, y: 2.74, w: 2.42, h: 0.72, fontSize: 11, color: HEX.accent4,
    lineSpacing: 16, isTextBox: true, margin: 0, valign: "top" });
});
bullets(s, [
  "1차 제품은 A40 하나다. 800 × 1,950 × 160 mm, 코일 4열, 팬 7대(6운전+1예비), PICV DN40, 전원 1+1.",
  "40kW는 공기 45/27°C, 물 18/26°C, 풍량 7,000 m³/h, 유량 72 L/min 과 한 세트다. 숫자 하나만 쓰지 않는다.",
  "랙 적재 설계점은 32kW다. 공랭 8U GPU 서버 2대 + ToR·여유. 3대(46.5kW)는 R50 48kW 자리다.",
  "자체 IDC 139대가 개발 프로그램 현금의 56%를 외부 판매 0대에서 회수한다. IDC가 멈추면 다시 250대다.",
  "130kW 콜드플레이트 랙, 패시브 30kW, 80kW 모델은 카탈로그에 없다. 중국산보다 싸다는 문장도 없다.",
], { x: 1.52, y: 3.96, w: 11.2, h: 2.60, fs: 14.5 });
s.addNotes("회수 250대/473대가 대외 숫자. 원가구조의 204대는 마케팅이 빠진 내부 숫자다.");

/* 3. 사업 구조 */
s = pres.addSlide({ masterName: "CONTENT_TINT", sectionTitle: "결론" });
chip(s, "02"); s.addText("사업 구조는 세 층이고, 1·2층은 3층의 영업 자산이다", { placeholder: "title" });
kicker(s, "자체 현장과 자체 도어가 있어야 남의 전환을 수주한다");
[[ "1", "IDC 운영", "자체 6.5MW 고밀도 상면 임대 + 전력", "1단계 채굴장 1.5MW 전환\n2단계 신설 5MW 전용동", HEX.accent2],
 [ "2", "하드웨어", "OpenRDHx 도어 외부 판매", "정가 $7,400, 공헌이익 $2,550\n연 99대가 인건비 분기점", HEX.accent1],
 [ "3", "전환 EPC", "남의 채굴장·레거시 IDC 냉각 패키지 수주", "전환비의 20–32% 가 우리 범위\nMW당 수주 약 14.4억, 마진 17%", HEX.accent3]
].forEach(([n, t, sub, det, col], i) => {
  const x = M + i * 4.08;
  card(s, { x, y: 1.76, w: 3.86, h: 2.72, shadow: true, name: `layer-${i}` });
  s.addShape(pres.ShapeType.ellipse, { x: x + 0.24, y: 1.99, w: 0.44, h: 0.44, fill: { color: col } });
  s.addText(n, { x: x + 0.24, y: 1.99, w: 0.44, h: 0.44, fontSize: 13, bold: true, color: "FFFFFF",
    align: "center", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(t, { x: x + 0.80, y: 1.99, w: 2.8, h: 0.44, fontSize: 18, bold: true, color: C.text1,
    valign: "middle", isTextBox: true, margin: 0 });
  s.addText(sub, { x: x + 0.24, y: 2.56, w: 3.38, h: 0.62, fontSize: 12.5, color: C.text1,
    lineSpacing: 18, isTextBox: true, margin: 0, valign: "top" });
  s.addText(det, { x: x + 0.24, y: 3.30, w: 3.38, h: 0.92, fontSize: 11, color: HEX.accent4,
    lineSpacing: 16.5, isTextBox: true, margin: 0, valign: "top" });
});
card(s, { x: M, y: 4.70, w: 12.09, h: 1.42, fill: "E4EFF1", lineColor: "C3DCE1", name: "anchor" });
s.addText("앵커", { x: M + 0.28, y: 4.92, w: 1.1, h: 0.32, fontSize: 11, bold: true,
  color: HEX.accent1, isTextBox: true, margin: 0 });
s.addText("자체 IDC 139대 =  1단계 34대 + 2단계 105대.  외부 조달 대비 대당 $2,550 × 139대 = 약 5.1억 원이 capex 절감으로 돌아온다.\n프로그램 현금 $638,000 의 56%다. 그래서 외부에 팔아야 하는 대수가 250대가 아니라 111대다.",
  { x: M + 0.28, y: 5.24, w: 11.5, h: 0.72, fontSize: 12.5, color: C.text1, lineSpacing: 19,
    isTextBox: true, margin: 0, valign: "top" });
note(s, "세 층 중 이익이 가장 크게 남는 자리는 전환 EPC 이고, 그 수주 자격을 만드는 것이 1·2층이다. 금액과 민감도를 담은 재무 모델은 이 레포 밖에 있고, 이 문서에는 투자 금액·지분이 없다.", 6.26);

/* 4. 정격 */
pres.addSection({ title: "제품" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "제품" });
chip(s, "03"); s.addText("정격은 숫자 여섯 개다", { placeholder: "title" });
kicker(s, "숫자 하나만 있는 용량은 쓰지 않는다");
s.addTable([
  headerRow(["항목", "A40 정격점"]),
  [{ text: "입구 공기 / 출구 공기" }, { text: "45°C / 27°C", options: { bold: true } }],
  [{ text: "공급수 / 환수" }, { text: "18°C / 26°C", options: { bold: true } }],
  [{ text: "필요 풍량" }, { text: "7,000 m³/h", options: { bold: true } }],
  [{ text: "필요 유량" }, { text: "72 L/min", options: { bold: true } }],
  [{ text: "열량" }, { text: "40 kW", options: { bold: true, color: HEX.accent3 } }],
  [{ text: "전면 풍속" }, { text: "약 1.63 m/s" }],
], { x: 1.52, y: 1.74, w: 5.5, h: 3.1, fontSize: 12.5, rowH: 0.40, valign: "middle",
     color: HEX.dk1, ...TBL() });
const rightX = 7.52;
thermalPill(s, rightX, 1.80, { w: 2.9, h: 0.44, fs: 12.5 });
s.addText("18K", { x: rightX + 3.06, y: 1.80, w: 2.2, h: 0.44, fontSize: 13, bold: true,
  color: HEX.accent3, valign: "middle", isTextBox: true, margin: 0 });
bullets(s, [
  "열수지 40 ÷ (1.006 × 18) = 2.209 kg/s → 6,963 m³/h. 카탈로그는 7,000.",
  "물 40 ÷ (4.18 × 8) = 71.8 L/min. 운전 창은 60–90 L/min.",
  "LMTD 13.4K, 필요 UA 3.0 kW/K. 코일사 계산서로 확인하고, 맞지 않으면 kW를 내린다.",
  "입구 35°C 의 참고 열량은 같은 풍량에서 약 22kW. 40kW로 팔지 않는다.",
  "코일 포락 86mm 가 도어 160mm 안에. 6열은 135mm 라 안 들어간다.",
], { x: rightX, y: 2.46, w: 5.29, h: 2.46, fs: 12 });
card(s, { x: 1.52, y: 5.06, w: 11.2, h: 1.06, fill: HEX.lt2, lineColor: "D8E2E7", name: "derate" });
s.addText("습도 디레이팅", { x: 1.76, y: 5.22, w: 1.9, h: 0.3, fontSize: 11, bold: true,
  color: HEX.accent1, isTextBox: true, margin: 0 });
s.addText("DRY 모드는 수온을 max(18°C, 노점+2K) 로 요청한다. 실내 노점 18°C → 수온 20°C → 약 34kW, 노점 20°C → 22°C → 약 28kW.\n채굴장과 레거시 전산실은 외기 직도입 관행 때문에 노점이 20°C를 넘는다. 그 방은 도어보다 룸 제습이 먼저다.",
  { x: 1.76, y: 5.50, w: 10.7, h: 0.54, fontSize: 11.5, color: C.text1, lineSpacing: 17,
    isTextBox: true, margin: 0, valign: "top" });

/* 5. 제품 세 모델 + 적재 */
s = pres.addSlide({ masterName: "CONTENT_TINT", sectionTitle: "제품" });
chip(s, "04"); s.addText("모델 셋, 그리고 랙 적재 설계점 32kW", { placeholder: "title" });
kicker(s, "정격을 45kW로 올리지 않고, 적재를 정의해서 닫았다");
[["A40", "40 kW", "기존 800mm 42U 랙 뒷문", "7,000 m³/h · 72 L/min\n도어 160mm · 축류 7대\n충수 97kg", "1차 제품", HEX.accent1],
 ["A40-600", "28 kW", "폭 600mm", "4,900 m³/h · 50 L/min\n같은 풍속 1.57 m/s\n면적비 0.72", "2순위 정격", HEX.accent2],
 ["R50", "48 kW", "48U 랙 일체형, 후면 베이 280mm", "8,400 m³/h · 86 L/min\n원심 팬, 대수 미정\n힌지에 매달지 않음", "확장 · 정격 아님", HEX.accent4]
].forEach(([m, kw, sub, det, tag, col], i) => {
  const x = M + i * 3.10;
  card(s, { x, y: 1.76, w: 2.88, h: 2.64, shadow: true, name: `model-${i}` });
  s.addText(m, { x: x + 0.22, y: 1.94, w: 2.44, h: 0.34, fontSize: 15, bold: true, color: C.text1,
    isTextBox: true, margin: 0 });
  s.addText(kw, { x: x + 0.22, y: 2.28, w: 2.44, h: 0.56, fontSize: 30, bold: true, color: col,
    valign: "middle", isTextBox: true, margin: 0 });
  s.addText(sub, { x: x + 0.22, y: 2.90, w: 2.44, h: 0.52, fontSize: 11.5, color: C.text1,
    lineSpacing: 16, isTextBox: true, margin: 0, valign: "top" });
  s.addText(det, { x: x + 0.22, y: 3.44, w: 2.44, h: 0.74, fontSize: 10.5, color: HEX.accent4,
    lineSpacing: 15, isTextBox: true, margin: 0, valign: "top" });
  s.addText(tag, { x: x + 0.22, y: 4.08, w: 2.44, h: 0.24, fontSize: 9.5, bold: true, color: col,
    isTextBox: true, margin: 0 });
});
card(s, { x: 9.96, y: 1.76, w: 2.76, h: 2.64, fill: "E4EFF1", lineColor: "C3DCE1", name: "load" });
s.addText("랙 적재 설계점", { x: 10.18, y: 1.94, w: 2.32, h: 0.3, fontSize: 11, bold: true,
  color: HEX.accent1, isTextBox: true, margin: 0 });
s.addText([{ text: "32", options: { fontSize: 34, bold: true, color: HEX.accent1 } },
           { text: " kW", options: { fontSize: 15, bold: true, color: HEX.accent1 } }],
  { x: 10.18, y: 2.26, w: 2.32, h: 0.58, valign: "bottom", isTextBox: true, margin: 0 });
s.addText("공랭 8U GPU 서버 14.5kW × 2대\n= 29kW + ToR·여유 3kW\n\nA40 정격 40kW 대비 여유 20%\n3대 = 46.5kW 는 R50 자리",
  { x: 10.18, y: 2.90, w: 2.32, h: 1.34, fontSize: 10.5, color: C.text1, lineSpacing: 15.5,
    isTextBox: true, margin: 0, valign: "top" });
note(s, "“랙당 70kW 포드”는 이 플랫폼의 정격 밖이다. 공기 온도차 18K 에서 열량의 한도는 풍량이고, 2대·32kW 가 A40 이 실제로 받는 구성이다. 산출은 11_자체IDC_5MW 2절.", 4.60);
s.addTable([
  headerRow(["기본에 넣는 것", "옵션으로만 파는 것"]),
  [{ text: "4열 코일, 팬 7대(6+1)+역류 댐퍼, 전원 1+1\nPICV DN40, 스프링 닫힘 격리 밸브(DO 2채널)\nQD 1쌍 — 위 또는 아래 한 곳. 반대편은 캡\nModbus TCP + RTU, 쓰기 잠금 3겹, LED\nDRY. 수온은 max(18°C, 노점+2K)" },
   { text: "BACnet MS/TP, SNMP, 7인치 화면\n600mm 폭 (28kW 잠정)\n16bar 코일과 24bar 시험\n해안·분진 코팅, 내진 브래킷\n결로 시 밸브 차단 — 출하 기본값은 꺼짐\nPG25. 용량 칸은 대조 시험 후" }],
], { x: 1.52, y: 5.22, w: 11.2, h: 0.9, fontSize: 10.5, rowH: [0.34, 1.0], valign: "top",
     color: HEX.dk1, ...TBL() });

/* 6. 교정 */
pres.addSection({ title: "교정" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "교정" });
chip(s, "05"); s.addText("v1.1에서 고친 것", { placeholder: "title" });
kicker(s, "열정산은 닫혔지만 팬 기구·수배관 부품·사업 지속 비용이 열려 있었다");
s.addTable([
  headerRow(["항목", "v1.1", "v1.2", "왜"]),
  ["PICV", "DN25 · $220", "DN40 · $340", "운전 창 상단 90 L/min = 5,400 l/h. DN25 급은 2,200 l/h"],
  ["팬 전력", "상한 0.9kW", "목표 0.9 / 상한 1.2kW", "같은 급 팬 6대를 85%로 돌리면 1.2kW 대"],
  ["수측 압손", "40kPa (QD 포함)", "코일 40 / 도어 90kPa", "QD·스트레이너·체크·PICV 최소차압 합산"],
  ["중량", "건조 70 / 충수 85kg", "건조 85 / 충수 97kg", "코일 동·알루미늄만 38kg. 물 12L"],
  ["격리 밸브", "단일 DO", "DO 2채널 직렬", "제어기 한 점 고장으로 냉각이 끊기지 않게"],
  ["R50 열량", "50kW", "48kW", "UA 가 +25% 필요한데 면적 +14%·풍속 +5%"],
  ["600mm", "28kW 와 2.3 m/s 가 다른 전제", "28kW · 4,900 m³/h · 1.57 m/s", "두 전제를 한 세트로 닫음"],
  ["Modbus", "쓰기 인증 없음", "쓰기 잠금 3겹 + 레지스터 보강", "모드·설정값·팬 상한이 그대로 쓰기 가능했음"],
  ["라이선스", "CC BY 4.0 단독", "문서 CC BY + HW CERN-OHL-W 2.0", "CC BY 에는 특허 허여가 없어 하드웨어에 약함"],
  ["공헌이익 / 회수", "$2,750 · 232 / 412대", "$2,550 · 250 / 473대", "PICV·댐퍼로 대당 $225 상승. 외부는 111대"],
], { x: 1.52, y: 1.74, w: 11.2, h: 3.9, fontSize: 10.5, rowH: 0.345, valign: "middle",
     color: HEX.dk1, colW: [1.5, 2.3, 2.9, 4.5], ...TBL() });
note(s, "교정 18건 전체와 아직 열려 있는 항목(팬 PQ 곡선 실물, 코일 UA 3.0 kW/K 계산서, 2차 루프 펌프 양정 90kPa, 고밀도 상면료 시세, 진천 TMY 프리쿨링 시간)은 사업계획서 7절에 있다.", 5.82);

/* 7. 시스템 단가 + 차트 */
pres.addSection({ title: "시스템" });
s = pres.addSlide({ masterName: "CONTENT_TINT", sectionTitle: "시스템" });
chip(s, "06"); s.addText("고객은 도어가 아니라 시스템을 산다", { placeholder: "title" });
kicker(s, "도어 단가를 30% 깎아도 전환비는 1.5% 내려간다");
s.addChart([{ type: pres.ChartType.bar, data: [
  { name: "도어 (A40)", labels: ["1단계 1.5MW", "2단계 5MW"], values: [5.6, 4.0] },
  { name: "CDU·2차 배관·열거부·제습", labels: ["1단계 1.5MW", "2단계 5MW"], values: [26.7, 16.4] },
  { name: "UPS·발전기", labels: ["1단계 1.5MW", "2단계 5MW"], values: [31.2, 21.4] },
  { name: "랙·PDU·네트워크", labels: ["1단계 1.5MW", "2단계 5MW"], values: [17.1, 12.0] },
  { name: "수전·변전·건물", labels: ["1단계 1.5MW", "2단계 5MW"], values: [null, 30.1] },
  { name: "설계·공사·기타", labels: ["1단계 1.5MW", "2단계 5MW"], values: [19.4, 16.1] },
]}], { x: 1.42, y: 1.70, w: 7.3, h: 3.5,
  barDir: "bar", barGrouping: "percentStacked",
  showTitle: true, title: "전환 capex 구성 (%)", titleFontSize: 12, titleColor: HEX.dk1,
  titleFontFace: "+mn-lt",
  chartColors: [HEX.accent3, HEX.accent1, HEX.accent2, "8FB2BD", "C7D6DC", "E2EAEE"],
  showValue: true, dataLabelPosition: "ctr", dataLabelFontSize: 9, dataLabelColor: "FFFFFF",
  dataLabelFormatCode: "0.0",
  catAxisLabelColor: HEX.dk1, catAxisLabelFontSize: 11, catAxisLabelFontFace: "+mn-lt",
  valAxisLabelColor: HEX.accent4, valAxisLabelFontSize: 9, valAxisLabelFontFace: "+mn-lt",
  valAxisLabelFormatCode: "0%",
  valGridLine: { color: "DCE5EA", size: 1 }, catGridLine: { style: "none" },
  showLegend: true, legendPos: "b", legendFontSize: 9, legendColor: HEX.dk1,
  legendFontFace: "+mn-lt",
  objectName: "chart-capex" });
const cx = 9.00;
card(s, { x: cx, y: 1.70, w: 3.72, h: 1.56, shadow: true, name: "pkg-door" });
stat(s, { x: cx + 0.24, y: 1.88, w: 3.24, value: "4–6%", label: "도어가 전환비에서 차지하는 비중\n1단계 5.6%, 2단계 4.0%",
  fs: 30, color: HEX.accent3, vh: 0.62, lh: 0.62 });
card(s, { x: cx, y: 3.40, w: 3.72, h: 1.80, shadow: true, name: "pkg-cool" });
stat(s, { x: cx + 0.24, y: 3.58, w: 3.24, value: "20–32%", label: "우리가 수주하는 냉각 패키지\n= 도어 + CDU + 2차 배관\n+ 열거부 + 룸 제습",
  fs: 30, color: HEX.accent1, vh: 0.62, lh: 0.84 });
bullets(s, [
  "도어가 버는 것은 가격이 아니다. 바닥면적(랙당 10 → 32kW, 같은 전력에 바닥 1/3)과 수온(18°C 2차 루프의 프리쿨링 시간)이다.",
  "제안 단가는 도어 대당이 아니라 냉각 패키지의 kW당으로 낸다. 1단계 기준 MW(IT)당 약 11.98억 원이 원가다.",
  "출구 27°C·냉복도 25°C 면 랙당 약 4.4kW 가 룸에 남고, 문을 열면 40kW 가 룸으로 나온다. 룸 냉방 조건을 설치 조건서에 쓴다.",
], { x: 1.42, y: 5.34, w: 11.3, h: 0.86, fs: 11.5 });

/* 8. 자체 IDC */
pres.addSection({ title: "앵커" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "앵커" });
chip(s, "07"); s.addText("앵커 — 자체 5MW IDC가 139대를 쓴다", { placeholder: "title" });
kicker(s, "채굴장 전환 + 신설 하이브리드. 1단계를 먼저 하는 이유는 비용이 아니라 레퍼런스다");
s.addTable([
  headerRow(["단계", "부지", "수전", "IT", "GPU 랙", "RDHx", "전환 capex", "가동"]),
  ["1단계", "기존 채굴장 전환", "1.5MW", "1,144 kW", "32", "34대", "약 42.3억", "2027 하반기"],
  ["2단계", "신설 전용동", "5.0MW", "3,840 kW", "100", "105대", "약 185.6억", "2029 하반기"],
  [{ text: "합계", options: { bold: true } }, { text: "" }, { text: "6.5MW", options: { bold: true } },
   { text: "4,984 kW", options: { bold: true } }, { text: "132", options: { bold: true } },
   { text: "139대", options: { bold: true, color: HEX.accent3 } },
   { text: "약 228억", options: { bold: true } }, { text: "" }],
], { x: 1.52, y: 1.86, w: 11.2, h: 1.42, fontSize: 11.5, rowH: 0.355, valign: "middle",
     color: HEX.dk1, colW: [1.0, 2.3, 1.0, 1.4, 1.0, 1.0, 1.6, 1.9], ...TBL() });
s.addChart([{ type: pres.ChartType.bar, data: [
  { name: "자체 IDC가 흡수", labels: ["v1.1 계획", "v1.2 계획"], values: [null, 139] },
  { name: "외부에 팔아야 하는 대수", labels: ["v1.1 계획", "v1.2 계획"], values: [232, 111] },
]}], { x: 1.42, y: 3.42, w: 6.1, h: 2.42,
  barDir: "bar", barGrouping: "stacked", barGapWidthPct: 60,
  showTitle: true, title: "프로그램 회수에 필요한 대수", titleFontSize: 12, titleColor: HEX.dk1,
  titleFontFace: "+mn-lt",
  chartColors: [HEX.accent1, HEX.accent3],
  showValue: true, dataLabelPosition: "ctr", dataLabelFontSize: 11, dataLabelColor: "FFFFFF",
  catAxisLabelColor: HEX.dk1, catAxisLabelFontSize: 11, catAxisLabelFontFace: "+mn-lt",
  valAxisLabelColor: HEX.accent4, valAxisLabelFontSize: 9, valAxisLabelFontFace: "+mn-lt",
  valGridLine: { color: "DCE5EA", size: 1 }, catGridLine: { style: "none" },
  showLegend: true, legendPos: "b", legendFontSize: 10, legendColor: HEX.dk1,
  legendFontFace: "+mn-lt",
  objectName: "chart-units" });
card(s, { x: 7.76, y: 3.42, w: 4.96, h: 2.42, fill: HEX.lt2, lineColor: "D8E2E7", name: "gap" });
s.addText("채굴장 전환의 갭 — 도어로 메워지지 않는 것", { x: 8.00, y: 3.60, w: 4.48, h: 0.3,
  fontSize: 11.5, bold: true, color: HEX.accent1, isTextBox: true, margin: 0 });
bullets(s, [
  "UPS·발전기 $910,000 — 상면 임대·추론에는 필수",
  "네트워크 이중화, 바닥 하중 1,200–1,500 kg/랙",
  "룸 제습 — 외기 직도입 관행의 노점을 내려야 한다",
  "천장고·후면 1.2m — 비용이 아니라 부지 탈락 조건",
], { x: 8.00, y: 3.96, w: 4.48, h: 1.70, fs: 11 });
note(s, "139대는 외부 판매가 아니라 내부 이전이다. 외부 조달 대비 대당 $2,550 × 139대 = 약 5.1억 원이 IDC capex 절감으로 돌아온다. 보수 기준이고, 2차 자료 밴드 하단 $8,000 으로 보면 69%다.", 5.94);

/* 9. 18°C */
s = pres.addSlide({ masterName: "CONTENT_TINT", sectionTitle: "앵커" });
chip(s, "08"); s.addText("18°C가 버는 것 — 밀도가 아니라 수온이다", { placeholder: "title" });
kicker(s, "룸 공조의 1차 냉수 7°C 로는 프리쿨링이 사실상 없다");
const step = [["2차 공급", "18°C", "도어가 받는 물"],
              ["판형 HX 접근 2K", "16°C", "1차 공급 필요 온도"],
              ["건식 프리쿨러 접근 5K", "11°C", "이 외기 건구 이하면 냉동기 정지"],
              ["충북 내륙", "45–50%", "연간 11°C 이하 시간 (어림)"]];
step.forEach(([t, v, d], i) => {
  const x = M + i * 3.09;
  card(s, { x, y: 1.80, w: 2.86, h: 1.70, shadow: true, name: `chain-${i}` });
  s.addText(t, { x: x + 0.20, y: 1.96, w: 2.46, h: 0.44, fontSize: 10.5, color: HEX.accent4,
    lineSpacing: 14, isTextBox: true, margin: 0, valign: "top" });
  s.addText(v, { x: x + 0.20, y: 2.42, w: 2.46, h: 0.56, fontSize: 27, bold: true,
    color: i === 3 ? HEX.accent3 : HEX.accent1, valign: "middle", isTextBox: true, margin: 0 });
  s.addText(d, { x: x + 0.20, y: 3.00, w: 2.46, h: 0.42, fontSize: 10.5, color: C.text1,
    lineSpacing: 14, isTextBox: true, margin: 0, valign: "top" });
  if (i < 3) s.addShape(pres.ShapeType.rightArrow, { x: x + 2.90, y: 2.52, w: 0.17, h: 0.26,
    fill: { color: "B6CBD2" } });
});
s.addTable([
  headerRow(["운전", "PUE 계획", "연간 비중"]),
  ["프리쿨링 (냉동기 정지)", "1.22", "48%"],
  ["냉동기 운전", "1.38", "52%"],
  [{ text: "연간 가중", options: { bold: true } }, { text: "1.30", options: { bold: true, color: HEX.accent1 } }, { text: "" }],
], { x: 1.52, y: 3.76, w: 5.3, h: 1.4, fontSize: 11.5, rowH: 0.35, valign: "middle",
     color: HEX.dk1, colW: [2.7, 1.4, 1.2], ...TBL() });
card(s, { x: 7.32, y: 3.76, w: 5.4, h: 1.40, fill: "E4EFF1", lineColor: "C3DCE1", name: "saving" });
s.addText([{ text: "연 12.9", options: { fontSize: 32, bold: true, color: HEX.accent1 } },
           { text: "억 원", options: { fontSize: 15, bold: true, color: HEX.accent1 } }],
  { x: 7.56, y: 3.94, w: 4.92, h: 0.62, valign: "bottom", isTextBox: true, margin: 0 });
s.addText("5MW · 레거시 공랭 PUE 1.60 대비 계획 절감액.  3,840 kW × 0.30 = 1,152 kW,  연 8,578 MWh × 150원/kWh",
  { x: 7.56, y: 4.58, w: 4.92, h: 0.46, fontSize: 10.5, color: C.text1, lineSpacing: 15,
    isTextBox: true, margin: 0, valign: "top" });
note(s, "전부 계획값이다. ① 진천·충북 TMY 시간별 건구·습구로 48% 재계산 ② 1차측 구성 확정(증발 보조를 쓰면 60%대로 오르지만 수소비가 붙는다) ③ 전력 단가 150원/kWh 확정 — 2026년 산업용 평균은 180–185원/kWh 로 보도된다. 셋이 닫히기 전에는 제안서 본문에 쓰지 않는다. 비교 기준 1.60 도 “같은 전력을 레거시 공랭 밀도로 수용했을 때”이고, 그때 바닥면적은 3배다.", 5.32);

/* 10. 원가 */
pres.addSection({ title: "돈" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "돈" });
chip(s, "09"); s.addText("원가와 계획 판매가", { placeholder: "title" });
kicker(s, "견적이 아니다. 수량과 계획 단가를 곱한 기준안이고 코일 OEM 회신으로 교체한다");
s.addTable([
  headerRow(["", "중국 OEM, 한국 납품", "한국 초도", "한국 연 300대"]),
  ["기준 원가", "도착 $4,450", "공장 $5,400", "공장 $4,650"],
  ["변동비 (보증·배송 포함)", "$4,850", "$5,750", "$5,050"],
  [{ text: "계획 판매가", options: { bold: true } }, { text: "$7,400", options: { bold: true } },
   { text: "$9,200", options: { bold: true } }, { text: "$7,400", options: { bold: true } }],
  [{ text: "대당 공헌이익", options: { bold: true } },
   { text: "$2,550", options: { bold: true, color: HEX.accent1 } },
   { text: "$3,450", options: { bold: true, color: HEX.accent1 } },
   { text: "$2,350", options: { bold: true, color: HEX.accent1 } }],
  ["원화 (1,450원)", "약 1,070만 원", "약 1,330만 원", "약 1,070만 원"],
], { x: 1.52, y: 1.86, w: 6.6, h: 2.1, fontSize: 11, rowH: 0.35, valign: "middle",
     color: HEX.dk1, colW: [2.1, 1.6, 1.45, 1.45], ...TBL() });
card(s, { x: 8.42, y: 1.86, w: 4.3, h: 2.10, fill: HEX.lt2, lineColor: "D8E2E7", name: "bep" });
s.addText("손익분기", { x: 8.66, y: 2.02, w: 3.82, h: 0.3, fontSize: 11, bold: true,
  color: HEX.accent1, isTextBox: true, margin: 0 });
s.addText("착수 고정비 $100,000      정가 40대 / 할인가 75대\n프로토타입까지 $518,000   정가 204대 / 할인가 384대\n\n대외 숫자는 마케팅까지 넣은 250대 / 473대.\n자체 139대를 빼면 외부 111대.",
  { x: 8.66, y: 2.34, w: 3.82, h: 1.50, fontSize: 11, color: C.text1, lineSpacing: 17,
    isTextBox: true, margin: 0, valign: "top" });
card(s, { x: 1.52, y: 4.18, w: 11.2, h: 1.94, fill: "FBEEE8", lineColor: "EFD2C6", name: "labor" });
s.addText("가장 정직한 숫자 — 인건비", { x: 1.78, y: 4.36, w: 5.0, h: 0.32, fontSize: 12.5,
  bold: true, color: HEX.accent6, isTextBox: true, margin: 0 });
[["연 $252,000", "10–21개월 인력 3명\n약 3.65억 원"],
 ["연 99대", "그 인건비를 넘기는\n정가 판매 대수"],
 ["40 / 80대", "2028 / 2029 시나리오\n인건비도 못 넘긴다"],
 ["$638,000", "프로그램 누적 현금\n약 9.25억 원"]].forEach(([v, l], i) => {
  const x = 1.78 + i * 2.74;
  s.addText(v, { x, y: 4.74, w: 2.5, h: 0.5, fontSize: 21, bold: true, color: HEX.accent6,
    valign: "bottom", isTextBox: true, margin: 0 });
  s.addText(l, { x, y: 5.28, w: 2.5, h: 0.62, fontSize: 10.5, color: C.text1, lineSpacing: 15,
    isTextBox: true, margin: 0, valign: "top" });
});
note(s, "도어 판매 단독으로는 흑자 사업이 아니다. 이 적자를 메우는 것은 자체 IDC 의 상면 매출과 외부 전환 수주다. 이 문서를 흑자 계획으로 부르지 않는다.", 6.16);

/* 11. 예산·게이트 */
s = pres.addSlide({ masterName: "CONTENT_TINT", sectionTitle: "돈" });
chip(s, "10"); s.addText("생산은 게이트 뒤에만 연다", { placeholder: "title" });
kicker(s, "게이트가 통과되지 않으면 뒷 단계 금액을 집행하지 않는다");
const gates = [
  ["0단계", "0–3개월", "샘플과 질문서", "BEEHE RDHX55 1대 분해. 코일 업체 2곳 의뢰.\n견적과 팬 PQ 곡선을 구매보다 앞에 둔다", "게이트 A", "샘플 수측·공기측 열량 ±10%.\n카탈로그 풍량이 정격인지 팬 최대인지 서면", HEX.accent2],
  ["1단계", "3–9개월", "프로토타입 3대", "자체 코일·제어 보드. 40kW 칼로리미터.\n현금 $418,000 (약 6.06억 원)", "게이트 B", "정격 열량 ±10%, DRY 밸브 미잠금,\n누수 시 격리만 닫힘, 전원 1+1, 팬 분포", HEX.accent1],
  ["2단계", "9–15개월", "중국 OEM 파일럿 10대", "금형 $100,000 + 마케팅 $120,000.\n펌웨어는 한국에서 서명한 바이너리", "게이트 C", "파일럿 현장에서 출구 공기·누수 경보\n4주 기록. 기록 없이 발주를 늘리지 않음", HEX.accent2],
];
gates.forEach(([st, per, t, d, g, gd, col], i) => {
  const y = 1.80 + i * 1.44;
  card(s, { x: M, y, w: 12.09, h: 1.30, shadow: true, name: `gate-${i}` });
  s.addShape(pres.ShapeType.roundRect, { x: M + 0.22, y: y + 0.22, w: 1.06, h: 0.42,
    rectRadius: 0.1, fill: { color: col } });
  s.addText(st, { x: M + 0.22, y: y + 0.22, w: 1.06, h: 0.42, fontSize: 11, bold: true,
    color: "FFFFFF", align: "center", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(per, { x: M + 0.22, y: y + 0.70, w: 1.06, h: 0.3, fontSize: 10, color: HEX.accent4,
    align: "center", isTextBox: true, margin: 0 });
  s.addText(t, { x: M + 1.46, y: y + 0.22, w: 2.6, h: 0.34, fontSize: 13.5, bold: true,
    color: C.text1, isTextBox: true, margin: 0, valign: "middle" });
  s.addText(d, { x: M + 1.46, y: y + 0.58, w: 4.2, h: 0.56, fontSize: 10.5, color: HEX.accent4,
    lineSpacing: 15, isTextBox: true, margin: 0, valign: "top" });
  s.addShape(pres.ShapeType.roundRect, { x: M + 6.00, y: y + 0.22, w: 1.18, h: 0.40,
    rectRadius: 0.1, fill: { color: "FFFFFF" }, line: { color: col, width: 1.25 } });
  s.addText(g, { x: M + 6.00, y: y + 0.22, w: 1.18, h: 0.40, fontSize: 10.5, bold: true,
    color: col, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(gd, { x: M + 7.34, y: y + 0.22, w: 4.5, h: 0.84, fontSize: 10.5, color: C.text1,
    lineSpacing: 15, isTextBox: true, margin: 0, valign: "top" });
});
card(s, { x: M, y: 6.10, w: 12.09, h: 0.62, fill: "FBEEE8", lineColor: "EFD2C6", name: "stop" });
s.addText("중단 조건", { x: M + 0.22, y: 6.10, w: 1.1, h: 0.62, fontSize: 10.5, bold: true,
  color: HEX.accent6, valign: "middle", isTextBox: true, margin: 0 });
s.addText("게이트 B 실패 시 금형 $100,000 을 집행하지 않고 정격 kW 를 내린다. 한국 공장은 원산지 입찰 문서와 국내 코일 2곳 성적이 둘 다 있을 때만 연다.",
  { x: M + 1.46, y: 6.10, w: 10.4, h: 0.62, fontSize: 11, color: C.text1,
    valign: "middle", isTextBox: true, margin: 0 });

/* 12. 국산화 */
pres.addSection({ title: "국산화" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "국산화" });
chip(s, "11"); s.addText("리버스엔지니어링과 국산화", { placeholder: "title" });
kicker(s, "“중저가”는 가격표의 위치가 아니라 원가 수렴점이다");
card(s, { x: M, y: 1.76, w: 5.86, h: 2.14, shadow: true, name: "cleanroom" });
s.addText("클린룸 2단 절차", { x: M + 0.24, y: 1.92, w: 5.38, h: 0.32, fontSize: 13,
  bold: true, color: HEX.accent1, isTextBox: true, margin: 0 });
s.addText([{ text: "A팀 — 계측·기록", options: { bold: true, breakLine: true } },
           { text: "샘플 분해, 치수·재질·중량 실측, 칼로리미터.\n산출물은 수치 사양서 한 건. 사진과 원자료는 보관함에 남는다.", options: { breakLine: true } }],
  { x: M + 0.24, y: 2.28, w: 2.62, h: 1.0, fontSize: 10.5, color: C.text1, lineSpacing: 15,
    isTextBox: true, margin: 0, valign: "top" });
s.addShape(pres.ShapeType.rightArrow, { x: M + 2.94, y: 2.56, w: 0.22, h: 0.26, fill: { color: "B6CBD2" } });
s.addText([{ text: "B팀 — 설계", options: { bold: true, breakLine: true } },
           { text: "실물을 보지 않는다. 사양서의 숫자로만 독자 설계.\n외관은 전부 자체 디자인. 날짜·서명 일지가 증거다.", options: { breakLine: true } }],
  { x: M + 3.24, y: 2.28, w: 2.38, h: 1.0, fontSize: 10.5, color: C.text1, lineSpacing: 15,
    isTextBox: true, margin: 0, valign: "top" });
s.addText("가져온다: 열성능 실측값 · 치수 제약 · 부품 규격 · 카탈로그 숫자의 정의\n가져오지 않는다: 외관 형상 · 금형·CAD 도면 · 제어 알고리즘 · 펌웨어",
  { x: M + 0.24, y: 3.30, w: 5.38, h: 0.52, fontSize: 10.5, color: HEX.accent4, lineSpacing: 15,
    isTextBox: true, margin: 0, valign: "top" });
card(s, { x: 7.08, y: 1.76, w: 5.64, h: 2.14, shadow: true, name: "fto" });
s.addText("IP — 어디가 비어 있고 어디가 살아 있는가", { x: 7.32, y: 1.92, w: 5.16, h: 0.32,
  fontSize: 13, bold: true, color: HEX.accent1, isTextBox: true, margin: 0 });
bullets(s, [
  "기본 구조는 공지기술로 본다 — IBM Rear Door Heat eXchanger(2005년 전후)",
  "살아 있을 수 있는 것: 중국 외관설계·실용신안, 제어·결로 특허, 팬 핫스왑 기구",
  "FTO 조사 CPC H05K 7/20 · F28D 1/04 · F24F 11/ · G06F 1/20 — KIPRIS·Espacenet·CNIPA",
  "우리 출원: 18°C 2차 루프 + DRY + PICV/격리 분리의 전환 방법, R50 후면 베이",
], { x: 7.32, y: 2.28, w: 5.16, h: 1.56, fs: 10.5 });
s.addTable([
  headerRow(["항목", "중국 EXW", "한국 초도", "한국 300대", "판단"]),
  ["4열 코일", "$1,400", "$2,000", "$1,650", "국산화 핵심. 국내 코일사 2곳 경쟁 전제"],
  ["EC 팬 7 + 댐퍼 7", "$770", "$770", "$770", "국산 없음. 수입 유지 — 원산지 부가가치 기준 선확인"],
  ["프레임·힌지·판금", "$480", "$620", "$520", "자동 벤딩 + 공용 금형"],
  ["제어·센서·밸브·배관", "$1,220", "$1,220", "$1,220", "밸브·센서 수입. 보드는 국내 설계·실장"],
  ["조립·수압·포장", "$320", "$750", "$480", "치공구화 + 자체 IDC 인접 조립"],
  [{ text: "합계", options: { bold: true } }, { text: "$4,190", options: { bold: true } },
   { text: "$5,360", options: { bold: true } },
   { text: "$4,640", options: { bold: true, color: HEX.accent1 } },
   { text: "목표 $4,650 — 중국 도착가 $4,450 과 $200 차이", options: { bold: true } }],
], { x: M, y: 4.02, w: 12.09, h: 1.74, fontSize: 10.5, rowH: 0.29, valign: "middle",
     color: HEX.dk1, colW: [1.9, 1.15, 1.15, 1.2, 6.69], ...TBL() });
note(s, "한국 공장은 일정이 아니라 게이트로 연다 — G-1 수량(누적 200대 또는 연 300대 가시권) · G-2 소싱(국내 코일사 2곳의 정격점 ±10% 성적서) · G-3 수요(원산지 요구 입찰 문서 1건) 중 둘 이상.", 6.26);

/* 13. 리스크 */
pres.addSection({ title: "리스크" });
s = pres.addSlide({ masterName: "CONTENT_TINT", sectionTitle: "리스크" });
chip(s, "12"); s.addText("리스크와 대응", { placeholder: "title" });
kicker(s, "중단 조건을 먼저 적는다");
s.addTable([
  headerRow(["리스크", "계획에 넣은 대응"]),
  ["4열로 UA 가 40kW 에 못 미침", "정격 kW 를 내린다. 도어를 몰래 두껍게 하지 않는다"],
  ["200mm 축류가 풍량·전력 점에 못 미침", "원심 팬과 두께 재설계. 견적과 PQ 곡선을 샘플 구매보다 앞에 둔다"],
  ["팬 분포가 깨져 높이별 출구 온도가 벌어짐", "코일-팬 디퓨저 50mm. 통풍 면적이 코일 면의 18% 라 분포 시험을 게이트 B 에"],
  ["제어기 한 점 고장으로 격리 밸브가 닫힘", "DO 2채널 직렬 — 제어기 DO + 누수 로프 직결 릴레이"],
  ["1단계 부지의 천장고·후면 공간이 부족", "부지 선정 1번 항목을 전력이 아니라 단면도로. 안 되면 부지 교체"],
  ["고밀도 상면료가 kW당 월 5만 원대", "2단계가 성립하지 않는다. 견적 3건을 투자 집행 전에 받는다"],
  ["공개 설계로 중국 OEM 직판", "공개는 인터페이스. 해자는 성적서·펌웨어 서명·국내 AS·자체 레퍼런스"],
  ["공공 입찰의 원산지", "한국 공장 게이트 전 입찰 금지. EC 팬 수입분의 부가가치 기준 선확인"],
  ["도어 사업 단독 적자", "연 99대가 인건비 분기점. IDC 현금흐름과 한 묶음으로 본다"],
], { x: 1.52, y: 1.76, w: 11.2, h: 3.5, fontSize: 11.5, rowH: 0.355, valign: "middle",
     color: HEX.dk1, colW: [4.3, 6.9], ...TBL() });
card(s, { x: 1.52, y: 5.46, w: 11.2, h: 0.78, fill: "FFFFFF", lineColor: "D8E2E7", name: "moat" });
s.addText("해자는 라이선스가 아니다", { x: 1.76, y: 5.58, w: 3.2, h: 0.28, fontSize: 10.5,
  bold: true, color: HEX.accent1, isTextBox: true, margin: 0 });
s.addText("칼로리미터 성적서 · 펌웨어 서명(법인 설립 시 국내 에스크로) · 국내 AS · 자체 IDC 의 운전 기록. 중국 OEM 이 공개 인터페이스로 도어를 만들어도 그 넷은 따라오지 않는다.",
  { x: 1.76, y: 5.86, w: 10.7, h: 0.3, fontSize: 11, color: C.text1, isTextBox: true, margin: 0 });

/* 14. 90일 */
pres.addSection({ title: "90일" });
s = pres.addSlide({ masterName: "CLOSE_DARK", sectionTitle: "90일" });
s.addText("90일 — 돈을 쓰기 전에 받는 것", { placeholder: "title" });
s.addText("견적을 샘플 구매보다 앞에 둔다. $418,000 집행은 3·4번이 닫힌 뒤다.",
  { x: M, y: 1.52, w: 11.4, h: 0.34, fontSize: 13.5, color: HEX.accent1, bold: true,
    isTextBox: true, margin: 0 });
const todo = [
  ["1", "고밀도 상면료 견적 3건", "kW당 월 단가. 전체 사업의 분기점이고, 5만 원이면 2단계 5MW 가 성립하지 않는다", HEX.accent3],
  ["2", "1단계 채굴장 부지 실측", "단면도와 바닥 적재 하중. 천장고와 후면 서비스 1.2m 가 부지를 가장 먼저 탈락시킨다", HEX.accent1],
  ["3", "BEEHE·Ablecom 견적 3건 + 팬 PQ 곡선", "질문서에 “45/25°C 행이 공기 온도인지”를 넣는다. BEEHE 페이지는 명시하지 않는다", HEX.accent1],
  ["4", "코일 업체 2곳 의뢰", "40kW · 7,000 m³/h · 72 L/min · 45/27°C · 18/26°C. 풍동 없이 금형 선급을 요구하면 탈락", HEX.accent1],
  ["5", "FTO 변리사 의견서 착수", "CPC H05K 7/20 · F28D 1/04 · F24F 11/ · G06F 1/20", HEX.accent1],
  ["6", "진천·충북 TMY 시간별 데이터", "프리쿨링 48% 와 PUE 1.30 의 근거. 한전 요금표로 혼합 단가도 같이 확정", HEX.accent1],
];
todo.forEach(([n, t, d, col], i) => {
  const y = 2.08 + i * 0.73;
  s.addShape(pres.ShapeType.ellipse, { x: M, y, w: 0.42, h: 0.42, fill: { color: col } });
  s.addText(n, { x: M, y, w: 0.42, h: 0.42, fontSize: 12, bold: true, color: "FFFFFF",
    align: "center", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(t, { x: M + 0.62, y: y - 0.02, w: 4.3, h: 0.46, fontSize: 13, bold: true,
    color: "FFFFFF", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(d, { x: M + 5.04, y: y - 0.02, w: 7.1, h: 0.46, fontSize: 11, color: "9FB3BD",
    valign: "middle", isTextBox: true, margin: 0 });
});
s.addText("문서: 00–09 기술 · 10 사업계획서 · 11 자체 5MW IDC · 12 국산화 로드맵.  합본은 scripts/build_full.py 가 만든다.",
  { x: M, y: 6.56, w: 11.4, h: 0.3, fontSize: 10.5, color: "5B7682", isTextBox: true, margin: 0 });
s.addNotes("투자 금액·지분·밸류에이션은 이 레포에 없다. 별도 문서이고, 지배구조와 상면료 견적이 닫히기 전에는 외부 배포 금지다.");

/* ---------- write ---------- */
const OUT = path.join(__dirname, "..", "10_사업계획서", "OpenRDHx_사업계획서.pptx");
(async () => {
  await pres.writeFile({ fileName: OUT });
  // 테마 색상 주입. pptxgenjs 는 테마를 못 쓰므로 apply_theme.js 가 필요하다.
  // 경로는 환경변수 PPTX_SKILL_DIR 로 준다. 없으면 Office 기본 팔레트로 남는다.
  const skill = process.env.PPTX_SKILL_DIR;
  if (skill) {
    const { applyTheme } = require(require("path").join(skill, "scripts/apply_theme.js"));
    await applyTheme(OUT, THEME);
  } else {
    console.warn("PPTX_SKILL_DIR 가 없어 테마 색상을 주입하지 않았다. 배색이 Office 기본으로 보이면 이 변수를 주고 다시 돌린다.");
  }
  console.log("written:", OUT);
})();
