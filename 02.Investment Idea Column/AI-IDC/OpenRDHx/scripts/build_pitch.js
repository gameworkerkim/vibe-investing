// 버추얼마이닝 AI IDC 전환 플랫폼 — 투자제안서 PPT 생성기
//
//   cd <레포>/02.Investment Idea Column/AI-IDC/OpenRDHx
//   npm install pptxgenjs          # 한 번만
//   NODE_PATH="$PWD/node_modules" PPTX_SKILL_DIR="<pptx 스킬 경로>" node scripts/build_pitch.js
//
// 주의: 도넛 차트는 쓰지 않는다. PowerPoint 가 도넛이 들어간 덱의 PDF 내보내기를 조용히 실패시킨다.
//
// 출력은 13_투자제안서/OpenRDHx_투자제안서.pptx 다. 슬라이드를 손으로 고치지 않는다.
// 숫자를 바꾸려면 하위 문서를 먼저 고치고 이 스크립트를 맞춘 뒤 다시 돌린다.
const pptxgen = require("pptxgenjs");
const path = require("path");

const THEME = {
  name: "OpenRDHx 투자제안서 v1.0",
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
pres.title = "버추얼마이닝 AI IDC 전환 플랫폼 투자제안서 v1.0";
pres.subject = "채굴장·레거시 IDC를 랙당 40kW AI 실로 바꾸는 전환 플랫폼. 1단계 70억 원";
const C = pres.SchemeColor;

const W = 13.33, H = 7.5, M = 0.62;
const FOOT = "버추얼마이닝 × Project OpenRDHx  ·  투자제안서 v1.0  ·  2026-11-22  ·  내부 검토용, 외부 배포 전 2·18장 확인";

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
    { text: { text: FOOT, options: { x: M, y: H - 0.52, w: 11.0, h: 0.3, fontSize: 9,
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
    { text: { text: FOOT, options: { x: M, y: H - 0.48, w: 11.0, h: 0.28, fontSize: 9,
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
    { text: { text: FOOT, options: { x: M, y: H - 0.48, w: 11.0, h: 0.28, fontSize: 9,
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
s.addText("버추얼마이닝  ×  PROJECT OPENRDHX", { x: M, y: 1.00, w: 9, h: 0.4, fontSize: 13,
  bold: true, color: HEX.accent1, charSpacing: 3, isTextBox: true, margin: 0 });
s.addText([
  { text: "채굴장의 전력과 노하우 위에,", options: { breakLine: true } },
  { text: "AI 실을 올리는 ", options: {} },
  { text: "전환 플랫폼", options: { color: HEX.accent1 } },
  { text: ".", options: {} },
], { placeholder: "title" });
s.addText("랙당 40kW 를 서버를 열지 않고 공랭으로 받는 자체 열교환 도어(OpenRDHx)로,\n자체 6.5MW IDC 를 짓고 남의 채굴장·레거시 IDC 전환을 수주한다.",
  { placeholder: "body" });
[["1단계 70억", "요청 규모 · 3 트랜치", HEX.accent1],
 ["6.5MW", "자체 IDC · RDHx 139대", HEX.accent1],
 ["2029", "단년 손익분기", HEX.accent3]].forEach(([v, l], i) => {
  const x = M + i * 3.0;
  s.addText(v, { x, y: 5.52, w: 2.8, h: 0.52, fontSize: 25, bold: true, color: HEX.accent1,
    valign: "bottom", isTextBox: true, margin: 0 });
  s.addText(l, { x, y: 6.06, w: 2.8, h: 0.3, fontSize: 11, color: "9FB3BD",
    isTextBox: true, margin: 0 });
});
s.addShape(pres.ShapeType.roundRect, { x: W - 5.0, y: 6.52, w: 4.38, h: 0.52, rectRadius: 0.1,
  fill: { color: "3A2520" }, line: { color: HEX.accent6, width: 1 }, objectName: "warn" });
s.addText("내부 검토용 — 2장·18장 확인 전 외부 배포 금지", { x: W - 5.0, y: 6.52, w: 4.38, h: 0.52,
  fontSize: 10.5, bold: true, color: "E0A08E", align: "center", valign: "middle",
  isTextBox: true, margin: 0 });
s.addText("투자제안서 v1.0  ·  2026-11-22", { x: M, y: 6.62, w: 4.0, h: 0.32, fontSize: 10.5,
  color: "5B7682", isTextBox: true, margin: 0 });
s.addNotes("이 덱은 13_투자제안서 문서의 요약이다. 2절(지배구조)과 11절 1번(상면료 견적 3건)이 닫히기 전에는 외부에 보내지 않는다.");

/* 2. Executive Summary */
pres.addSection({ title: "요약" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "요약" });
chip(s, "01"); s.addText("한 장 요약", { placeholder: "title" });
kicker(s, "세 층으로 돈을 벌고, 1·2층은 3층의 영업 자산이다");
s.addTable([
  headerRow(["층", "무엇", "2031 매출", "2031 영업이익"]),
  [{ text: "1. IDC 운영" }, { text: "자체 6.5MW 고밀도 상면 임대 + 전력" }, { text: "48.9억" }, { text: "17.0억" }],
  [{ text: "2. 하드웨어" }, { text: "OpenRDHx 도어 외부 판매" }, { text: "26.8억" }, { text: "3.2억" }],
  [{ text: "3. 전환 EPC" }, { text: "남의 채굴장·레거시 IDC 냉각 패키지 수주" }, { text: "215.6억" }, { text: "28.9억" }],
  [{ text: "합계", options: { bold: true } }, { text: "" },
   { text: "291.4억", options: { bold: true, color: HEX.accent1 } },
   { text: "49.0억", options: { bold: true, color: HEX.accent1 } }],
], { x: 1.52, y: 1.76, w: 7.0, h: 1.8, fontSize: 11.5, rowH: 0.34, valign: "middle",
     color: HEX.dk1, colW: [1.4, 2.9, 1.3, 1.4], ...TBL() });
card(s, { x: 8.82, y: 1.76, w: 3.90, h: 1.80, fill: "E4EFF1", lineColor: "C3DCE1", name: "ask" });
s.addText("요청", { x: 9.06, y: 1.92, w: 3.42, h: 0.28, fontSize: 11, bold: true,
  color: HEX.accent1, isTextBox: true, margin: 0 });
s.addText([{ text: "1단계 70", options: { fontSize: 30, bold: true, color: HEX.accent1 } },
           { text: "억 원", options: { fontSize: 14, bold: true, color: HEX.accent1 } }],
  { x: 9.06, y: 2.20, w: 3.42, h: 0.56, valign: "bottom", isTextBox: true, margin: 0 });
s.addText("밴드 50–100억. 3 트랜치, 게이트 연동.\n2단계 신설 5MW(185.6억)는 이 라운드에 없다.",
  { x: 9.06, y: 2.82, w: 3.42, h: 0.60, fontSize: 11, color: C.text1, lineSpacing: 16,
    isTextBox: true, margin: 0, valign: "top" });
bullets(s, [
  "국내 공랭 전산실의 관행 밀도는 랙당 십수 kW 다. AI 서버는 그 위로 올라가고, 콜드플레이트는 서버 검증·누수 책임·리드타임이 길다. 랙당 25–45kW 를 서버를 열지 않고 받는 구간이 비어 있다.",
  "채굴장은 수전·변전·건물·24시간 무인 운영을 이미 가지고 있다. 없는 것은 밀도와 수온이고, 그것이 OpenRDHx 가 메우는 자리다.",
  "자체 IDC 139대가 개발 프로그램 현금의 56% 를 외부 판매 0대에서 회수한다. 외부에 팔아야 하는 대수는 250대가 아니라 111대다.",
  "손익분기는 단년 2029년, 누적 2030년. 2027 −4.6억 → 2031 +49.0억. 하방 시나리오에서는 단년 흑자가 2031년으로 밀리고 그 해 9.1억이다.",
  "가장 먼저 깨질 수 있는 가정은 고밀도 상면료가 kW당 월 7만 원 대에 들어오는지다. 5만 원이면 2단계 5MW 는 성립하지 않는다. 견적 3건이 투자 집행 전 1번 항목이다.",
], { x: 1.52, y: 3.84, w: 11.2, h: 2.6, fs: 12.5 });

/* 3. 지배구조 — 확인 필요 */
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "요약" });
chip(s, "02"); s.addText("회사와 지배구조 — 확인 전", { placeholder: "title" });
s.addShape(pres.ShapeType.roundRect, { x: 1.52, y: 1.24, w: 11.2, h: 0.46, rectRadius: 0.08,
  fill: { color: "FBEEE8" }, line: { color: HEX.accent6, width: 1 }, objectName: "warnbar" });
s.addText("이 장이 채워지기 전에는 이 제안서를 외부에 보내지 않는다. 아래는 2026-11-22 공개 보도 기준이고, 전자공시 원문이 아니다.",
  { x: 1.74, y: 1.24, w: 10.8, h: 0.46, fontSize: 11, bold: true, color: HEX.accent6,
    valign: "middle", isTextBox: true, margin: 0 });
s.addTable([
  headerRow(["항목", "공개 보도 내용"]),
  ["설립", "2018년 2월, 당시 버추얼텍이 암호화폐 사업 진출로 자본금 5억 원을 출자해 종속회사로 설립"],
  ["지분", "감성코퍼레이션이 경영목적상 지분 45% 보유"],
  ["회계 처리", "2021년 종속회사 → 관계기업 전환"],
  ["재무", "설립 이후 흑자 전환 없음. 2023년 완전자본잠식, 이후 지분법 미적용"],
  ["모회사 본업", "아웃도어 브랜드 스노우피크어패럴. 매출 2,502억 원 (전년 +13.5%)"],
], { x: 1.52, y: 1.88, w: 5.6, h: 1.8, fontSize: 10.5, rowH: 0.33, valign: "middle",
     color: HEX.dk1, colW: [1.3, 4.3], ...TBL() });
card(s, { x: 7.42, y: 1.88, w: 5.30, h: 1.98, fill: "FBEEE8", lineColor: "EFD2C6", name: "cant" });
s.addText("이대로라면 쓸 수 없는 세 가지", { x: 7.66, y: 2.04, w: 4.82, h: 0.3, fontSize: 12,
  bold: true, color: HEX.accent6, isTextBox: true, margin: 0 });
bullets(s, [
  "“코스닥 상장사 자회사” — 45% 관계기업은 자회사가 아니고 연결 대상도 아니다",
  "“채굴회사의 노하우” — 2023년부터 미영위 공시. 노하우는 연혁이 아니라 사람과 로그로 보여야 한다",
  "완전자본잠식 이력 — 증자·감자·자본 재구성이 투자 구조보다 앞에 와야 한다",
], { x: 7.66, y: 2.38, w: 4.82, h: 1.40, fs: 10.5, color: HEX.dk1 });
s.addText("확정할 것", { x: 1.52, y: 4.02, w: 2.0, h: 0.3, fontSize: 12, bold: true,
  color: HEX.accent1, isTextBox: true, margin: 0 });
s.addTable([
  headerRow(["확인 항목", "어디서"]),
  ["2026년 현재 지분율과 회계상 지위 (종속 / 관계 / 지분법)", "DART 감성코퍼레이션 사업보고서·반기보고서"],
  ["버추얼마이닝의 현재 자본·부채, 자본잠식 해소 여부", "감사보고서"],
  ["사업 목적에 데이터센터업·전기공사업이 있는지", "법인 등기부"],
  ["채굴 운영 자산 실재 (부지, 수전 용량, 변전 설비, 인력)", "자산 목록과 전력 사용 실적"],
  ["모회사의 지원·보증·출자 의향", "이사회 또는 IR 확인 — 조달 경로가 여기서 갈린다"],
  ["1단계 부지의 소유·임차 관계, 수전 계약 명의", "계약서"],
], { x: 1.52, y: 4.30, w: 11.2, h: 2.0, fontSize: 10.5, rowH: 0.268, valign: "middle",
     color: HEX.dk1, colW: [5.6, 5.6], ...TBL() });
note(s, "확인 결과가 보도와 같으면 표지는 “감성코퍼레이션이 지분 45% 를 보유한 관계기업 버추얼마이닝” 이거나, 지분을 재정비한 뒤의 “자회사” 다. 재정비가 선행 조건이다.", 6.34);
s.addNotes("출처: 블로터 2026-04-06 기사. DART 원문이 아니다.");

/* 4. 왜 채굴회사인가 */
pres.addSection({ title: "왜" });
s = pres.addSlide({ masterName: "CONTENT_TINT", sectionTitle: "왜" });
chip(s, "03"); s.addText("해외에서는 이미 일어난 전환이다", { placeholder: "title" });
kicker(s, "2차 보도 기준. 금액과 날짜가 출처마다 다르므로 실사 때 8-K·10-Q 로 확인한다");
s.addTable([
  headerRow(["회사", "보도된 전환", "비고"]),
  ["TeraWulf", "HPC 계약 매출 $12.8B 이상. Fluidstack(Google 백스톱)·Core42 앵커",
   "다른 보도는 Anthropic 20년 임대 약 401MW, 초기 계약 매출 약 $19B. 두 숫자는 조정되지 않음"],
  ["Cipher", "채굴 대부분 종료. HPC 백로그 약 $9.3B", "AWS 300MW + Fluidstack(Google 백스톱 $1.4B)"],
  ["Applied Digital", "CoreWeave 15년 리스 400MW, 계약 매출 약 $11B", "Polaris Forge 2 = $3B · 200MW"],
  ["Core Scientific, IREN", "채굴 종료, AI 데이터센터 전면 전환 보도", "—"],
  [{ text: "섹터 합계", options: { bold: true } },
   { text: "상장 채굴사 누적 AI·HPC 계약 $70B 이상", options: { bold: true } },
   { text: "계약에서 최초 용량까지 리드타임 약 9–18개월" }],
], { x: 1.52, y: 1.76, w: 11.2, h: 2.1, fontSize: 10.5, rowH: 0.33, valign: "middle",
     color: HEX.dk1, colW: [1.9, 4.5, 4.8], ...TBL() });
s.addText("공통 구조는 셋이다", { x: 1.52, y: 4.14, w: 3.4, h: 0.3, fontSize: 12.5, bold: true,
  color: HEX.accent1, isTextBox: true, margin: 0 });
[["①", "전력이 이미 확보된 부지", "우리에게 있다", HEX.accent1, "E4EFF1", "C3DCE1"],
 ["②", "앵커 테넌트의 장기 계약", "우리에게 없다", HEX.accent6, "FBEEE8", "EFD2C6"],
 ["③", "하이퍼스케일러급 신용 백스톱", "우리에게 없다", HEX.accent6, "FBEEE8", "EFD2C6"]
].forEach(([n, t, v, col, fill, line], i) => {
  const x = M + i * 4.08;
  card(s, { x, y: 4.52, w: 3.86, h: 1.08, fill, lineColor: line, name: `common-${i}` });
  s.addText(n + "  " + t, { x: x + 0.24, y: 4.66, w: 3.38, h: 0.32, fontSize: 12.5, bold: true,
    color: C.text1, isTextBox: true, margin: 0 });
  s.addText(v, { x: x + 0.24, y: 5.02, w: 3.38, h: 0.42, fontSize: 14, bold: true, color: col,
    isTextBox: true, margin: 0, valign: "top" });
});
note(s, "규모도 다르다. 위 사례는 200–400MW 단위이고 1단계 1.5MW·2단계 5MW 는 두세 자릿수 작다. 같은 스토리를 같은 밸류에이션 배수로 읽히게 하지 않는다. 우리가 노리는 것은 하이퍼스케일러 임대가 아니라 국내 중소 규모 전환 시장이고, 그 시장에는 200MW 플레이어가 들어오지 않는다.", 5.78);

/* 5. 채굴장이 가진 것 / 갖지 못한 것 */
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "왜" });
chip(s, "04"); s.addText("채굴장이 가진 것과, 갖지 못한 것", { placeholder: "title" });
kicker(s, "전환은 냉각만이 아니다. 갖지 못한 것이 전환 예산의 절반을 만든다");
s.addTable([
  headerRow(["가진 것", "AI IDC 에서의 값"]),
  ["수전 용량·변전 설비 (MW 단위 인입)", "신설 시 kW당 $350 + 분담금 + 리드타임"],
  ["건물·바닥·구조", "신설 시 전용동 m²당 $1,400"],
  ["고풍량·고온 배기를 매일 다룬 운영", "공랭 45°C 배기 운전의 체감"],
  ["전력 단가 협상·계약 경험", "IDC 원가의 최대 항목"],
  ["24시간 무인·원격 운영", "NOC 운영의 기초"],
], { x: 1.52, y: 1.76, w: 5.5, h: 1.8, fontSize: 10.5, rowH: 0.33, valign: "middle",
     color: HEX.dk1, colW: [3.0, 2.5], ...TBL() });
s.addTable([
  headerRow(["갖지 못한 것", "1단계 비용"]),
  ["무정전 (UPS) — 상면 임대·추론에는 필수", "$460,000"],
  ["비상 발전기", "$450,000"],
  ["네트워크 이중화 — 랙당 400G × 2, 광 인입", "$350,000"],
  ["바닥 하중 — GPU 랙 충수 1,200–1,500 kg/랙", "랙·보강 $150,000"],
  ["룸 제습 — 노점 20°C 면 도어 열량이 40 → 28kW", "$70,000"],
  [{ text: "천장고·후면 1.2m", options: { bold: true } },
   { text: "비용이 아니라 탈락 조건", options: { bold: true, color: HEX.accent6 } }],
], { x: 7.22, y: 1.76, w: 5.5, h: 2.1, fontSize: 10.5, rowH: 0.33, valign: "middle",
     color: HEX.dk1, colW: [3.9, 1.6], ...TBL() });
card(s, { x: 1.52, y: 4.24, w: 11.2, h: 1.64, fill: HEX.lt2, lineColor: "D8E2E7", name: "ups" });
s.addText([{ text: "$910,000", options: { fontSize: 30, bold: true, color: HEX.accent6 } },
           { text: "  (약 13.2억 원)", options: { fontSize: 14, bold: true, color: HEX.accent6 } }],
  { x: 1.80, y: 4.44, w: 5.0, h: 0.56, valign: "bottom", isTextBox: true, margin: 0 });
s.addText("UPS·발전기가 “외부 고객을 받을 수 있는 전산실인가”의 가격이다.", { x: 1.80, y: 5.06,
  w: 5.0, h: 0.6, fontSize: 11.5, color: C.text1, lineSpacing: 17, isTextBox: true, margin: 0,
  valign: "top" });
s.addText("자체 학습 워크로드는 체크포인트로 버티므로 UPS 없이도 돌지만, 상면을 임대하거나 추론을 받으려면 선택이 아니다.\n1단계를 레퍼런스로 쓸 계획이므로 포함 안을 기준으로 둔다. 제외하면 1단계 전환비가 42.3억에서 26.8억으로 내려간다.\n\n천장고와 후면 공간이 부지를 가장 먼저 탈락시킨다. 컨테이너형 채굴장에는 그 공간이 없다. 부지 선정의 1번 항목은 전력이 아니라 단면도다.",
  { x: 7.00, y: 4.44, w: 5.5, h: 1.26, fontSize: 11, color: C.text1, lineSpacing: 16,
    isTextBox: true, margin: 0, valign: "top" });

/* 6. 문제 */
pres.addSection({ title: "문제와 해법" });
s = pres.addSlide({ masterName: "CONTENT_TINT", sectionTitle: "문제와 해법" });
chip(s, "05"); s.addText("레거시와 채굴장이 AI 를 못 받는 이유는 전력이 아니다", { placeholder: "title" });
kicker(s, "네 가지이고, 넷 다 도어가 서 있는 자리다");
[["밀도", "룸 공조는 랙당 십수 kW 에서 한계다", "랙당 32kW 를 룸 공기로 받을 수 없다. 랙을 비우고 띄우면 바닥면적이 3배가 된다", HEX.accent3],
 ["수온", "룸 공조는 1차 냉수 7°C 를 쓴다", "7°C 를 외기로 만들려면 건구 2°C 이하여야 해서 프리쿨링이 사실상 없다. 전력비가 그대로 나간다", HEX.accent1],
 ["서버", "콜드플레이트 개조는 서버를 연다", "OEM 보증·누수 책임·리드타임을 모두 건드린다. 이미 깔린 서버는 열 수 없다", HEX.accent2],
 ["습도", "외기 직도입 관행의 방은 노점이 20°C 를 넘는다", "냉수 코일을 넣으면 결로다. 도어보다 룸 제습이 먼저인 방이 있다", HEX.accent4]
].forEach(([t, sub, det, col], i) => {
  const y = 1.80 + i * 1.18;
  card(s, { x: M, y, w: 12.09, h: 1.04, shadow: true, name: `prob-${i}` });
  s.addShape(pres.ShapeType.roundRect, { x: M + 0.24, y: y + 0.26, w: 1.02, h: 0.52,
    rectRadius: 0.1, fill: { color: col } });
  s.addText(t, { x: M + 0.24, y: y + 0.26, w: 1.02, h: 0.52, fontSize: 13, bold: true,
    color: "FFFFFF", align: "center", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(sub, { x: M + 1.52, y: y + 0.26, w: 4.3, h: 0.52, fontSize: 13, bold: true,
    color: C.text1, valign: "middle", isTextBox: true, margin: 0 });
  s.addText(det, { x: M + 6.00, y: y + 0.26, w: 5.84, h: 0.52, fontSize: 11.5, color: HEX.accent4,
    lineSpacing: 16, valign: "middle", isTextBox: true, margin: 0 });
});
note(s, "100kW 랙은 이 문제가 아니다. NVL72 급은 칩 직접 냉각 영역이고 이 플랫폼 밖이다. 우리가 노리는 구간은 랙당 25–45kW, 공랭 서버를 그대로 쓰는 전환이다.", 6.46);

/* 7. 해법 — 제품 */
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "문제와 해법" });
chip(s, "06"); s.addText("해법 — OpenRDHx, 서버를 열지 않는 40kW 도어", { placeholder: "title" });
kicker(s, "정격은 숫자 여섯 개가 한 세트다. 숫자 하나만 있는 용량은 쓰지 않는다");
thermalPill(s, 1.52, 1.76, { w: 2.9, h: 0.44, fs: 12.5 });
s.addText("물 18°C → 26°C  ·  7,000 m³/h  ·  72 L/min  ·  LMTD 13.4K, 필요 UA 3.0 kW/K",
  { x: 4.60, y: 1.76, w: 8.1, h: 0.44, fontSize: 12, color: C.text1, valign: "middle",
    isTextBox: true, margin: 0 });
[["A40", "40 kW", "기존 800mm 42U 랙 뒷문", "7,000 m³/h · 72 L/min\n도어 160mm · 축류 팬 7대\n코일 4열 · 충수 97kg", "1차 제품", HEX.accent1],
 ["A40-600", "28 kW", "폭 600mm", "4,900 m³/h · 50 L/min\n같은 전면 풍속 1.57 m/s\n기존 랙 유지 현장용", "2순위 정격", HEX.accent2],
 ["R50", "48 kW", "48U 랙 일체형, 후면 베이 280mm", "8,400 m³/h · 86 L/min\n원심 팬, 대수 미정\n힌지에 매달지 않음", "확장 · 정격 아님", HEX.accent4]
].forEach(([m, kw, sub, det, tag, col], i) => {
  const x = M + i * 3.10;
  card(s, { x, y: 2.44, w: 2.88, h: 2.50, shadow: true, name: `pm-${i}` });
  s.addText(m, { x: x + 0.22, y: 2.62, w: 2.44, h: 0.32, fontSize: 15, bold: true, color: C.text1,
    isTextBox: true, margin: 0 });
  s.addText(kw, { x: x + 0.22, y: 2.94, w: 2.44, h: 0.54, fontSize: 29, bold: true, color: col,
    valign: "middle", isTextBox: true, margin: 0 });
  s.addText(sub, { x: x + 0.22, y: 3.54, w: 2.44, h: 0.50, fontSize: 11.5, color: C.text1,
    lineSpacing: 16, isTextBox: true, margin: 0, valign: "top" });
  s.addText(det, { x: x + 0.22, y: 4.06, w: 2.44, h: 0.70, fontSize: 10.5, color: HEX.accent4,
    lineSpacing: 15, isTextBox: true, margin: 0, valign: "top" });
  s.addText(tag, { x: x + 0.22, y: 4.64, w: 2.44, h: 0.24, fontSize: 9.5, bold: true, color: col,
    isTextBox: true, margin: 0 });
});
card(s, { x: 9.96, y: 2.44, w: 2.76, h: 2.50, fill: "E4EFF1", lineColor: "C3DCE1", name: "load2" });
s.addText("랙 적재 설계점", { x: 10.18, y: 2.62, w: 2.32, h: 0.3, fontSize: 11, bold: true,
  color: HEX.accent1, isTextBox: true, margin: 0 });
s.addText([{ text: "32", options: { fontSize: 32, bold: true, color: HEX.accent1 } },
           { text: " kW", options: { fontSize: 14, bold: true, color: HEX.accent1 } }],
  { x: 10.18, y: 2.94, w: 2.32, h: 0.54, valign: "bottom", isTextBox: true, margin: 0 });
s.addText("공랭 8U GPU 서버 14.5kW × 2대\n= 29kW + ToR·여유 3kW\n\nA40 정격 40kW 대비 여유 20%\n3대 = 46.5kW 는 R50 자리",
  { x: 10.18, y: 3.54, w: 2.32, h: 1.04, fontSize: 10.5, color: C.text1, lineSpacing: 15,
    isTextBox: true, margin: 0, valign: "top" });
bullets(s, [
  "결로는 밸브를 잠가서 막지 않는다. DRY 모드가 수온을 max(18°C, 노점+2K) 로 요청하고, PICV 와 누수 격리 밸브를 나눠 둔다. 정전 때 냉각을 끊는 밸브와 누수 때 닫는 밸브가 같은 부품이면 둘 중 하나는 실패한다.",
  "정격은 설계 목표다. 칼로리미터 성적서가 나오기 전에는 계약 보증 용량이 아니다. 35°C 입구의 참고 열량은 같은 풍량에서 약 22kW 이고, 그것을 40kW 로 팔지 않는다. “랙당 70kW 포드”는 이 플랫폼의 정격 밖이다.",
], { x: 1.52, y: 5.10, w: 11.2, h: 1.2, fs: 11.5 });

/* 8. 도어는 4–6% */
s = pres.addSlide({ masterName: "CONTENT_TINT", sectionTitle: "문제와 해법" });
chip(s, "07"); s.addText("고객이 사는 것은 도어가 아니라 냉각 패키지다", { placeholder: "title" });
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
  objectName: "chart-capex2" });
card(s, { x: 9.00, y: 1.70, w: 3.72, h: 1.56, shadow: true, name: "d1" });
stat(s, { x: 9.24, y: 1.88, w: 3.24, value: "4–6%", label: "도어가 전환비에서 차지하는 비중\n1단계 5.6%, 2단계 4.0%",
  fs: 30, color: HEX.accent3, vh: 0.62, lh: 0.62 });
card(s, { x: 9.00, y: 3.40, w: 3.72, h: 1.80, shadow: true, name: "d2" });
stat(s, { x: 9.24, y: 3.58, w: 3.24, value: "20–32%", label: "우리가 수주하는 냉각 패키지\n= 도어 + CDU + 2차 배관\n+ 열거부 + 룸 제습",
  fs: 30, color: HEX.accent1, vh: 0.62, lh: 0.84 });
bullets(s, [
  "그래서 “중국산보다 싼 도어”는 사업이 될 수 없다. 우리가 파는 단위는 도어 대당이 아니라 냉각 패키지의 kW당이고, 1단계 기준 MW(IT)당 원가 11.98억 · 수주 14.37억 · 마진 16.7% 다.",
  "도어가 버는 것은 가격이 아니다. 바닥면적(랙당 10 → 32kW, 같은 전력에 바닥 1/3)과 수온(18°C 2차 루프의 프리쿨링 시간)이다.",
  "도어를 자체 생산하는 이유도 원가가 아니라, 그 패키지를 성적서와 AS 를 걸고 한 묶음으로 팔 수 있다는 점이다.",
], { x: 1.42, y: 5.34, w: 11.3, h: 0.9, fs: 11.5 });

/* 9. 자체 IDC */
pres.addSection({ title: "자산" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "자산" });
chip(s, "08"); s.addText("자체 6.5MW IDC — 레퍼런스이자 앵커 139대", { placeholder: "title" });
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
  { name: "자체 IDC가 흡수", labels: ["외부만 판다면", "자체 IDC 포함"], values: [null, 139] },
  { name: "외부에 팔아야 하는 대수", labels: ["외부만 판다면", "자체 IDC 포함"], values: [250, 111] },
]}], { x: 1.42, y: 3.42, w: 6.1, h: 2.42,
  barDir: "bar", barGrouping: "stacked", barGapWidthPct: 60,
  showTitle: true, title: "개발 프로그램 회수에 필요한 대수", titleFontSize: 12, titleColor: HEX.dk1,
  titleFontFace: "+mn-lt",
  chartColors: [HEX.accent1, HEX.accent3],
  showValue: true, dataLabelPosition: "ctr", dataLabelFontSize: 11, dataLabelColor: "FFFFFF",
  catAxisLabelColor: HEX.dk1, catAxisLabelFontSize: 11, catAxisLabelFontFace: "+mn-lt",
  valAxisLabelColor: HEX.accent4, valAxisLabelFontSize: 9, valAxisLabelFontFace: "+mn-lt",
  valGridLine: { color: "DCE5EA", size: 1 }, catGridLine: { style: "none" },
  showLegend: true, legendPos: "b", legendFontSize: 10, legendColor: HEX.dk1,
  legendFontFace: "+mn-lt",
  objectName: "chart-units2" });
card(s, { x: 7.76, y: 3.42, w: 4.96, h: 2.42, fill: "E4EFF1", lineColor: "C3DCE1", name: "anchor2" });
s.addText("139대가 개발 프로그램에 하는 일", { x: 8.00, y: 3.60, w: 4.48, h: 0.3,
  fontSize: 11.5, bold: true, color: HEX.accent1, isTextBox: true, margin: 0 });
s.addText("외부 조달 대비 대당 절감  $2,550\n× 139대 = 약 5.1억 원\n\n개발 프로그램 현금 $638,000 의 56% 를\n외부 판매 0대에서 회수한다.\n\n조건: IDC 투자가 멈추면 다시 250대다.\n두 사업은 하나의 현금흐름이다.",
  { x: 8.00, y: 3.96, w: 4.48, h: 1.74, fontSize: 11, color: C.text1, lineSpacing: 16.5,
    isTextBox: true, margin: 0, valign: "top" });
note(s, "보수 기준이다. 2차 자료의 액티브 도어 밴드 하단 $8,000 을 기준으로 보면 대당 $3,150, 139대에 69% 다. 본문에는 56% 를 쓴다. 139대는 외부 판매가 아니라 내부 이전이고, 매출이 아니라 capex 절감으로만 센다.", 5.94);

/* 10. 18°C */
s = pres.addSlide({ masterName: "CONTENT_TINT", sectionTitle: "자산" });
chip(s, "09"); s.addText("18°C 가 버는 것 — 밀도가 아니라 수온이다", { placeholder: "title" });
kicker(s, "룸 공조의 1차 냉수 7°C 로는 프리쿨링이 사실상 없다");
[["2차 공급", "18°C", "도어가 받는 물"],
 ["판형 HX 접근 2K", "16°C", "1차 공급 필요 온도"],
 ["건식 프리쿨러 접근 5K", "11°C", "이 외기 건구 이하면 냉동기 정지"],
 ["충북 내륙", "45–50%", "연간 11°C 이하 시간 (어림)"]
].forEach(([t, v, d], i) => {
  const x = M + i * 3.09;
  card(s, { x, y: 1.80, w: 2.86, h: 1.70, shadow: true, name: `ch-${i}` });
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
  [{ text: "연간 가중", options: { bold: true } },
   { text: "1.30", options: { bold: true, color: HEX.accent1 } }, { text: "" }],
], { x: 1.52, y: 3.76, w: 5.3, h: 1.4, fontSize: 11.5, rowH: 0.35, valign: "middle",
     color: HEX.dk1, colW: [2.7, 1.4, 1.2], ...TBL() });
card(s, { x: 7.32, y: 3.76, w: 5.4, h: 1.40, fill: "E4EFF1", lineColor: "C3DCE1", name: "sav2" });
s.addText([{ text: "연 12.9", options: { fontSize: 32, bold: true, color: HEX.accent1 } },
           { text: "억 원", options: { fontSize: 15, bold: true, color: HEX.accent1 } }],
  { x: 7.56, y: 3.94, w: 4.92, h: 0.62, valign: "bottom", isTextBox: true, margin: 0 });
s.addText("5MW · 레거시 공랭 PUE 1.60 대비 계획 절감액.  3,840 kW × 0.30 = 1,152 kW,  연 8,578 MWh × 150원/kWh",
  { x: 7.56, y: 4.58, w: 4.92, h: 0.46, fontSize: 10.5, color: C.text1, lineSpacing: 15,
    isTextBox: true, margin: 0, valign: "top" });
note(s, "전부 계획값이다. ① 진천·충북 TMY 시간별 건구·습구로 48% 재계산 ② 1차측 구성 확정 ③ 전력 단가 150원/kWh 확정 — 2026년 산업용 평균은 180–185원/kWh 로 보도된다. 셋이 닫히기 전에는 제안 본문에 쓰지 않는다. 비교 기준 1.60 도 “같은 전력을 레거시 공랭 밀도로 수용했을 때”이고, 그때 바닥면적은 3배다.", 5.32);

/* 11. 국산화 */
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "자산" });
chip(s, "10"); s.addText("리버스엔지니어링과 국산화", { placeholder: "title" });
kicker(s, "“중저가”는 가격표의 위치가 아니라 원가 수렴점이다");
card(s, { x: M, y: 1.76, w: 5.86, h: 2.14, shadow: true, name: "cr2" });
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
card(s, { x: 7.08, y: 1.76, w: 5.64, h: 2.14, shadow: true, name: "fto2" });
s.addText("IP — 어디가 비어 있고 어디가 살아 있는가", { x: 7.32, y: 1.92, w: 5.16, h: 0.32,
  fontSize: 13, bold: true, color: HEX.accent1, isTextBox: true, margin: 0 });
bullets(s, [
  "기본 구조는 공지기술로 본다 — IBM Rear Door Heat eXchanger(2005년 전후)",
  "살아 있을 수 있는 것: 중국 외관설계·실용신안, 제어·결로 특허, 팬 핫스왑 기구",
  "FTO 조사 CPC H05K 7/20 · F28D 1/04 · F24F 11/ · G06F 1/20 — 변리사 의견서를 0단계 안에",
  "우리 출원: 18°C 2차 루프 + DRY + PICV/격리 분리의 전환 방법, R50 후면 베이",
], { x: 7.32, y: 2.28, w: 5.16, h: 1.56, fs: 10.5 });
s.addTable([
  headerRow(["", "원가", "판매가", "공헌이익", "조건"]),
  ["중국 OEM 도착 (현재)", "$4,450", "$7,400", "$2,550", "연 100대 이하에서는 이쪽이 원가상 맞다"],
  ["한국 공장 초도", "$5,400", "$9,200", "$3,450", "중국 EXW 대비 +29%"],
  [{ text: "한국 공장, 연 300대 목표", options: { bold: true } },
   { text: "$4,650", options: { bold: true, color: HEX.accent1 } },
   { text: "$7,400", options: { bold: true } },
   { text: "$2,750", options: { bold: true, color: HEX.accent1 } },
   { text: "중국 도착가와 $200 차이. 같은 가격에 국산으로 판다", options: { bold: true } }],
], { x: M, y: 4.08, w: 12.09, h: 1.1, fontSize: 10.5, rowH: 0.32, valign: "middle",
     color: HEX.dk1, colW: [2.5, 1.1, 1.1, 1.2, 6.19], ...TBL() });
note(s, "목표는 싸게 파는 것이 아니라 한국 생산 원가를 중국 도착가와 좁혀 같은 $7,400 에 국산으로 파는 것이다. 그러면 원산지 가점 입찰에 들어가고 환율·리드타임 노출이 사라진다. 한국 공장은 일정이 아니라 게이트로 연다 — G-1 수량 · G-2 국내 코일사 2곳 성적 · G-3 원산지 입찰 문서 중 둘 이상. 200mm EC 팬은 국산이 없어 수입이 남으므로 원산지 부가가치 기준을 관세사에게 먼저 확인한다.", 5.40);

/* 12. 시장과 경쟁 */
pres.addSection({ title: "시장" });
s = pres.addSlide({ masterName: "CONTENT_TINT", sectionTitle: "시장" });
chip(s, "11"); s.addText("시장과 경쟁 — 쓰는 숫자와 쓰지 않는 숫자", { placeholder: "title" });
kicker(s, "2차 인용 시장 규모는 이 제안서의 매출 근거가 아니다");
card(s, { x: M, y: 1.76, w: 5.86, h: 1.84, fill: "FBEEE8", lineColor: "EFD2C6", name: "nouse" });
s.addText("쓰지 않는 숫자", { x: M + 0.24, y: 1.92, w: 5.38, h: 0.3, fontSize: 12.5, bold: true,
  color: HEX.accent6, isTextBox: true, margin: 0 });
bullets(s, [
  "글로벌 RDHx 시장 2025년 12억 달러 → 2032년 33억 달러",
  "AI 데이터센터 후면 액냉 43.5억 → 181.6억 위안, CAGR 22.6%",
  "액티브 도어 대당 $8,000–25,000 밴드 (보고서 목차 한 줄)",
], { x: M + 0.24, y: 2.26, w: 5.38, h: 1.0, fs: 10.5, color: HEX.dk1 });
s.addText("세 줄의 출처가 다르고 “후면 열교환기”의 정의도 다르다. 보고서 번호·표 번호가 없고 원문을 사지 않았다. TAM 으로 쓰지 않는다.",
  { x: M + 0.24, y: 3.20, w: 5.38, h: 0.34, fontSize: 10.5, italic: true, color: HEX.accent6,
    isTextBox: true, margin: 0, valign: "top" });
card(s, { x: 7.08, y: 1.76, w: 5.64, h: 1.84, fill: "E4EFF1", lineColor: "C3DCE1", name: "use" });
s.addText("쓰는 숫자", { x: 7.32, y: 1.92, w: 5.16, h: 0.3, fontSize: 12.5, bold: true,
  color: HEX.accent1, isTextBox: true, margin: 0 });
bullets(s, [
  "자체 6.5MW 의 상면 kW 와 전환 capex — 우리가 짓는 것",
  "전환 EPC 의 MW당 수주 단가 — 1단계 원가에서 나온 것",
  "RDHx 외부 판매 대수 — 게이트를 통과했을 때의 상한 초안",
], { x: 7.32, y: 2.26, w: 5.16, h: 1.0, fs: 10.5, color: HEX.dk1 });
s.addText("매출에 쓰는 것은 13장의 시나리오뿐이고, 그것도 예측이 아니라 게이트 통과를 전제한 상한 초안이다.",
  { x: 7.32, y: 3.20, w: 5.16, h: 0.34, fontSize: 10.5, italic: true, color: HEX.accent1,
    isTextBox: true, margin: 0, valign: "top" });
s.addTable([
  headerRow(["누구", "무엇", "우리와의 관계"]),
  ["디포그 (USystems ColdLogik 국내 창구)", "CL23 HPC: 공기 65°C 입구 164–204kW, 깊이 415mm, 원심 팬 10대, 충수 172kg", "용량대가 다르다. 경쟁이 아니라 상위 구간. 통신만 맞췄다"],
  ["BEEHE (장쑤성 태창)", "800mm 55kW 액티브 도어. 45/25°C, 물 14/24.5°C, PG25", "샘플 1순위이자 직접 경쟁. 본토 원가 경로"],
  ["Ablecom, MG Cooling (대만)", "CDR42(EC) 깊이 337mm 원심 4대, TD48F-842", "참고기. 본토 원가 경로가 아님"],
  ["英维克, 申菱", "열관 배판 5–15kW", "다른 제품. 냉수 도어가 아님"],
], { x: M, y: 3.80, w: 12.09, h: 1.4, fontSize: 10.5, rowH: 0.33, valign: "middle",
     color: HEX.dk1, colW: [3.0, 5.2, 3.89], ...TBL() });
note(s, "우리 자리는 “최초”가 아니라 셋이다. ① 정격점의 풍량·유량·온도를 한 표로 공개한다 ② 결로를 밸브 잠금이 아니라 18°C 물과 DRY 모드로 정의한다 ③ 전환을 도어가 아니라 냉각 패키지 + 레퍼런스 + AS 로 판다. 국내에서 우리만 가진 것은 자체 현장이다 — 디포그도 BEEHE 도 “우리가 직접 운영하는 6.5MW 에 이 도어가 달려 있다”고 말할 수 없다.", 5.64);

/* 13. 재무 */
pres.addSection({ title: "재무" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "재무" });
chip(s, "12"); s.addText("5년 계획 손익", { placeholder: "title" });
kicker(s, "단년 손익분기 2029년, 누적 손익분기 2030년");
s.addChart([{ type: pres.ChartType.bar, data: [
  { name: "상면 임대 + 전력", labels: ["2027", "2028", "2029", "2030", "2031"], values: [2.95, 10.05, 17.19, 39.02, 48.94] },
  { name: "RDHx 외부 판매", labels: ["2027", "2028", "2029", "2030", "2031"], values: [0.90, 4.29, 8.58, 16.09, 26.82] },
  { name: "전환 EPC", labels: ["2027", "2028", "2029", "2030", "2031"], values: [null, null, 43.12, 114.99, 215.60] },
]}], { x: 1.42, y: 1.76, w: 6.5, h: 3.0,
  barDir: "col", barGrouping: "stacked", barGapWidthPct: 55,
  showTitle: true, title: "매출 구성 (억 원)", titleFontSize: 12, titleColor: HEX.dk1,
  titleFontFace: "+mn-lt",
  chartColors: [HEX.accent1, HEX.accent3, HEX.accent2],
  showValue: false,
  catAxisLabelColor: HEX.dk1, catAxisLabelFontSize: 11, catAxisLabelFontFace: "+mn-lt",
  valAxisLabelColor: HEX.accent4, valAxisLabelFontSize: 9, valAxisLabelFontFace: "+mn-lt",
  valGridLine: { color: "DCE5EA", size: 1 }, catGridLine: { style: "none" },
  showLegend: true, legendPos: "b", legendFontSize: 10, legendColor: HEX.dk1,
  legendFontFace: "+mn-lt",
  objectName: "chart-rev" });
s.addTable([
  headerRow(["억 원", "2027", "2028", "2029", "2030", "2031"]),
  ["매출", "3.86", "14.34", "68.89", "170.10", "291.36"],
  [{ text: "영업이익", options: { bold: true } },
   { text: "−4.56", options: { bold: true, color: HEX.accent6 } },
   { text: "−0.24", options: { bold: true, color: HEX.accent6 } },
   { text: "+1.47", options: { bold: true, color: HEX.accent1 } },
   { text: "+23.68", options: { bold: true, color: HEX.accent1 } },
   { text: "+49.04", options: { bold: true, color: HEX.accent1 } }],
  ["영업이익률", "—", "—", "2.1%", "13.9%", "16.8%"],
  ["누적 영업이익", "−4.56", "−4.80", "−3.33", "+20.35", "+69.39"],
], { x: 8.22, y: 1.84, w: 4.5, h: 1.5, fontSize: 10, rowH: 0.30, valign: "middle",
     color: HEX.dk1, colW: [1.05, 0.69, 0.69, 0.69, 0.69, 0.69], ...TBL() });
card(s, { x: 8.22, y: 3.56, w: 4.5, h: 1.20, fill: HEX.lt2, lineColor: "D8E2E7", name: "assum" });
s.addText("핵심 전제", { x: 8.44, y: 3.68, w: 4.06, h: 0.26, fontSize: 10.5, bold: true,
  color: HEX.accent1, isTextBox: true, margin: 0 });
s.addText("상면료 kW당 월 7만 원 (전력 pass-through, PUE 1.35 상한 보장형) · 전력 마진 20원/kWh · 전력 150원/kWh · PUE 1.30 · 부하율 0.85 · EPC MW당 14.37억, 마진 16.7% · 감가 15년",
  { x: 8.44, y: 3.94, w: 4.06, h: 0.76, fontSize: 9.5, color: C.text1, lineSpacing: 13.5,
    isTextBox: true, margin: 0, valign: "top" });
note(s, "손익분기 전 누적 영업손실의 최대치는 2028년 말 약 −4.80억이다. 투자액 70억은 자본적 지출이고 위 표는 손익이므로 둘을 더하지 않는다. 현금은 T2 집행 시점(2027년)에 42억이 나간다.", 4.96);

/* 14. 이익의 출처 · 하방 · 민감도 */
s = pres.addSlide({ masterName: "CONTENT_TINT", sectionTitle: "재무" });
chip(s, "13"); s.addText("매출 크기로 읽으면 오해한다", { placeholder: "title" });
kicker(s, "2031년 매출의 74%는 EPC 이고, EPC 는 마진 17%의 공사 사업이다");
s.addTable([
  headerRow(["층", "2031 매출", "비중", "2031 영업이익", "비중"]),
  ["IDC 운영", "48.94억", "16.8%", "16.96억", "34.6%"],
  ["RDHx 하드웨어", "26.82억", "9.2%", "3.15억", "6.4%"],
  ["전환 EPC", "215.60억", "74.0%", "28.93억", "59.0%"],
], { x: 1.52, y: 1.76, w: 5.3, h: 1.4, fontSize: 11, rowH: 0.33, valign: "middle",
     color: HEX.dk1, colW: [1.6, 1.0, 0.85, 1.05, 0.8], ...TBL() });
card(s, { x: 7.12, y: 1.76, w: 5.6, h: 1.40, fill: "E4EFF1", lineColor: "C3DCE1", name: "floor" });
s.addText([{ text: "20.1", options: { fontSize: 30, bold: true, color: HEX.accent1 } },
           { text: "억 원", options: { fontSize: 14, bold: true, color: HEX.accent1 } }],
  { x: 7.36, y: 1.92, w: 5.12, h: 0.56, valign: "bottom", isTextBox: true, margin: 0 });
s.addText("EPC 수주가 0 이어도 1·2층(IDC·하드웨어)만으로 남는 2031 영업이익.\nEPC 는 상방이고, 하방의 바닥은 1·2층이다.",
  { x: 7.36, y: 2.54, w: 5.12, h: 0.52, fontSize: 11, color: C.text1, lineSpacing: 16,
    isTextBox: true, margin: 0, valign: "top" });
s.addText("하방 시나리오 — 상면료 5만 원, EPC 수주 1/3, RDHx 외부 판매 절반",
  { x: 1.52, y: 3.36, w: 5.3, h: 0.3, fontSize: 11.5, bold: true, color: HEX.accent6,
    isTextBox: true, margin: 0 });
s.addTable([
  headerRow(["억 원", "2029", "2030", "2031"]),
  ["매출", "31.86", "76.81", "122.85"],
  [{ text: "영업이익", options: { bold: true } },
   { text: "−8.79", options: { bold: true, color: HEX.accent6 } },
   { text: "−0.85", options: { bold: true, color: HEX.accent6 } },
   { text: "+9.10", options: { bold: true, color: HEX.accent1 } }],
], { x: 1.52, y: 3.70, w: 5.3, h: 1.0, fontSize: 11, rowH: 0.33, valign: "middle",
     color: HEX.dk1, colW: [1.7, 1.2, 1.2, 1.2], ...TBL() });
s.addText("2031 영업이익 민감도", { x: 7.12, y: 3.36, w: 5.6, h: 0.3, fontSize: 11.5,
  bold: true, color: HEX.accent1, isTextBox: true, margin: 0 });
s.addTable([
  headerRow(["변수", "하", "기준", "상"]),
  [{ text: "상면료 (5 / 7 / 9만 원)", options: { bold: true } },
   { text: "37.7억", options: { bold: true, color: HEX.accent6 } }, { text: "49.0억" },
   { text: "60.4억", options: { bold: true, color: HEX.accent1 } }],
  ["EPC 수주량 (10.5 / 15 / 19.5 MW)", "38.3억", "49.0억", "59.8억"],
  ["RDHx 공헌이익 ($1,785 / 2,550 / 3,315)", "46.3억", "49.0억", "51.8억"],
  ["PUE 실적 (1.40 / 1.35 보장 / 1.30)", "46.3억", "49.0억", "51.8억"],
], { x: 7.12, y: 3.70, w: 5.6, h: 1.4, fontSize: 10.5, rowH: 0.31, valign: "middle",
     color: HEX.dk1, colW: [2.9, 0.9, 0.9, 0.9], ...TBL() });
note(s, "가장 민감한 변수는 상면료이고 그 다음이 EPC 수주량이다. 둘의 영향이 각각 ±11억 대로 RDHx 공헌이익(±2.8억)의 네 배다. 도어 원가를 다듬는 일이 사업의 중심이 아니라는 증거가 이 표다. 전력 단가는 pass-through + PUE 1.35 상한 보장형 계약을 전제로 민감도에서 뺐다. 그 계약을 못 얻으면 180원/kWh 에서 연 약 6억이 우리 비용이 된다.", 5.30);

/* 15. 투자 구조 */
pres.addSection({ title: "투자" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "투자" });
chip(s, "14"); s.addText("1단계 70억 — 3 트랜치, 게이트 연동", { placeholder: "title" });
kicker(s, "게이트 B 가 실패하면 손실은 T1 15억으로 한정된다");
[["T1", "15억", "RDHx 개발 프로그램 9.3 + FTO·인증·계약 1.0 + 1단계 설계·실측·상면료 시장조사 1.5 + 운전자금 1년 3.7", "계약 체결 시", HEX.accent2],
 ["T2", "42억", "1단계 채굴장 1.5MW 전환 (UPS·발전기 포함)", "① 게이트 B: 프로토타입 정격 열량 ±10%\n② 상면료 kW당 월 7만 원 이상 견적 1건\n③ 1단계 부지 단면도·바닥 하중 적합", HEX.accent1],
 ["T3", "13억", "운전자금 2년차 + 국산화 소싱 + 영업·AS + 2단계 설계", "④ 게이트 C: 1단계 4주 운전 기록\n⑤ 외부 상면 계약 1건", HEX.accent2]
].forEach(([t, amt, use, cond, col], i) => {
  const y = 1.76 + i * 1.32;
  card(s, { x: M, y, w: 12.09, h: 1.20, shadow: true, name: `tr-${i}` });
  s.addShape(pres.ShapeType.roundRect, { x: M + 0.22, y: y + 0.20, w: 0.86, h: 0.44,
    rectRadius: 0.1, fill: { color: col } });
  s.addText(t, { x: M + 0.22, y: y + 0.20, w: 0.86, h: 0.44, fontSize: 13, bold: true,
    color: "FFFFFF", align: "center", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(amt, { x: M + 0.22, y: y + 0.70, w: 0.86, h: 0.34, fontSize: 15, bold: true,
    color: col, align: "center", isTextBox: true, margin: 0 });
  s.addText(use, { x: M + 1.26, y: y + 0.22, w: 5.3, h: 0.86, fontSize: 11, color: C.text1,
    lineSpacing: 16, isTextBox: true, margin: 0, valign: "middle" });
  s.addText("집행 조건", { x: M + 6.78, y: y + 0.20, w: 1.2, h: 0.28, fontSize: 10,
    bold: true, color: col, isTextBox: true, margin: 0 });
  s.addText(cond, { x: M + 6.78, y: y + 0.48, w: 5.06, h: 0.62, fontSize: 10.5, color: C.text1,
    lineSpacing: 14.5, isTextBox: true, margin: 0, valign: "top" });
});
s.addTable([
  headerRow(["밴드", "구성"]),
  ["하한 50억", "T1 15 + T2 27 (UPS·발전기 후순위) + T3 8. 이 경우 T3 조건 ⑤ 가 성립하지 않으므로 트랜치 조건을 다시 쓴다"],
  [{ text: "기준 70억", options: { bold: true } }, { text: "위 표", options: { bold: true } }],
  ["상한 100억", "+ 30억: 2단계 토지 계약금, 설계, 수전 신청 선행"],
], { x: M, y: 5.72, w: 12.09, h: 1.0, fontSize: 10.5, rowH: 0.285, valign: "middle",
     color: HEX.dk1, colW: [1.6, 10.49], ...TBL() });

/* 16. 자금 사용처 */
s = pres.addSlide({ masterName: "CONTENT_TINT", sectionTitle: "투자" });
chip(s, "15"); s.addText("자금 사용처와 밸류에이션", { placeholder: "title" });
kicker(s, "2단계 신설 5MW 185.6억은 이 라운드에 포함되지 않는다");
s.addChart([{ type: pres.ChartType.bar, data: [
  { name: "1단계 70억 원", labels: ["1단계 1.5MW 전환", "운전자금·2단계 설계", "RDHx 개발 프로그램", "예비비", "국산화·FTO·인증"],
    values: [42.3, 13.0, 9.3, 2.9, 2.5] },
]}], { x: 1.42, y: 1.76, w: 5.4, h: 3.5,
  barDir: "bar", barGapWidthPct: 45,
  showTitle: true, title: "1단계 70억 원 — 자금 사용처 (억 원)", titleFontSize: 12,
  titleColor: HEX.dk1, titleFontFace: "+mn-lt",
  chartColors: [HEX.accent1],
  showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 10, dataLabelColor: HEX.dk1,
  dataLabelFormatCode: "0.0",
  catAxisLabelColor: HEX.dk1, catAxisLabelFontSize: 10, catAxisLabelFontFace: "+mn-lt",
  valAxisLabelColor: HEX.accent4, valAxisLabelFontSize: 9, valAxisLabelFontFace: "+mn-lt",
  valGridLine: { color: "DCE5EA", size: 1 }, catGridLine: { style: "none" },
  showLegend: false,
  objectName: "chart-use" });
s.addTable([
  headerRow(["1단계 1.5MW 전환 42.3억 내역", "억 원"]),
  ["OpenRDHx A40 34대", "2.4"],
  ["CDU · 2차 배관 · 열거부 · 룸 제습", "11.3"],
  ["UPS · 비상 발전기", "13.2"],
  ["랙 · PDU · 네트워크", "7.3"],
  ["소방 · BMS · DCIM · 물리보안", "1.7"],
  ["설계 · 공사 · 시운전", "6.5"],
], { x: 7.12, y: 1.80, w: 5.6, h: 2.0, fontSize: 10.5, rowH: 0.31, valign: "middle",
     color: HEX.dk1, colW: [4.4, 1.2], ...TBL() });
card(s, { x: 7.12, y: 4.06, w: 5.6, h: 2.00, fill: "FBEEE8", lineColor: "EFD2C6", name: "val" });
s.addText("밸류에이션은 이 덱에 없다", { x: 7.36, y: 4.22, w: 5.12, h: 0.3, fontSize: 12.5,
  bold: true, color: HEX.accent6, isTextBox: true, margin: 0 });
bullets(s, [
  "2장 체크리스트 (지분, 자본, 사업 목적, 운영 자산)",
  "상면료 견적 3건 — 2단계 성립 여부가 여기서 갈린다",
  "1단계 부지의 소유·수전 계약 실사",
], { x: 7.36, y: 4.54, w: 5.12, h: 1.02, fs: 10.5, color: HEX.dk1 });
s.addText("셋이 끝난 뒤에 정한다. 모회사 지원이 있으면 상장사 연계 조달(유상증자·CB), 없으면 버추얼마이닝 직접 조달이다.",
  { x: 7.36, y: 5.58, w: 5.12, h: 0.42, fontSize: 10.5, italic: true, color: HEX.accent6,
    isTextBox: true, margin: 0, valign: "top" });
note(s, "2단계는 1단계 레퍼런스와 외부 상면 계약 1건이 나온 뒤에 별도 라운드 또는 프로젝트 파이낸싱으로 논의한다. 1단계 내역 소계는 반올림으로 42.4억이고, 기준은 USD 2,920,500 이다.", 6.22);

/* 17. 리스크 */
pres.addSection({ title: "리스크" });
s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "리스크" });
chip(s, "16"); s.addText("리스크 — 큰 순서로", { placeholder: "title" });
kicker(s, "1번과 5번은 투자 집행 전에 닫을 수 있다");
s.addTable([
  headerRow(["#", "리스크", "왜 큰가", "완화"]),
  ["1", "앵커 테넌트가 없다", "해외 전환은 모두 장기 계약 + 신용 백스톱이 선행했다", "1단계를 자체 워크로드 또는 국내 앵커 1곳으로 먼저 채운다. T3 조건 ⑤"],
  ["2", "상면료가 5만 원대", "2단계 185.6억의 ROIC 가 3% 대로 떨어진다", "T2 전에 견적 3건. 안 되면 2.5MW 로 축소"],
  ["3", "게이트 B 실패 (40kW 미달)", "제품이 없으면 EPC 수주 자격도 없다", "손실을 T1 15억으로 한정. 정격 kW 를 내리고 재설계"],
  ["4", "1단계 부지 탈락 (천장고·하중)", "레퍼런스가 늦어지면 전체 일정이 밀린다", "부지 선정 1번 항목을 단면도로. 복수 부지 후보"],
  ["5", "지배구조·자본 상태", "완전자본잠식 이력은 조달 자체를 막는다", "2장 체크리스트를 라운드 개시 전에 닫는다"],
  ["6", "EPC 수주가 안 나온다", "2031 이익의 59% 가 여기다", "1·2층만으로도 2031 영업이익 약 20.1억. EPC 는 상방"],
  ["7", "중국 OEM 종속 / 공개 설계 직판", "공개 설계라 복제를 막을 장치가 약하다", "해자는 성적서·펌웨어 서명·국내 AS·자체 레퍼런스. 금형 소유·전매 금지 계약"],
  ["8", "전력 pass-through 계약 실패", "180원/kWh 면 2031 이익이 약 6억 줄어든다", "pass-through + PUE 1.35 상한 보장형을 표준 계약으로"],
  ["9", "AI capex 사이클 하강", "2026년에도 거품론 보도가 있다", "전환 EPC 는 신설보다 사이클 저항이 크다. 기존 전력·건물을 쓰므로 투자 단위가 작다"],
], { x: 1.52, y: 1.76, w: 11.2, h: 3.4, fontSize: 10.5, rowH: 0.325, valign: "middle",
     color: HEX.dk1, colW: [0.5, 2.6, 3.7, 4.4], ...TBL() });

/* 18. 확인 항목 + 거버넌스 */
s = pres.addSlide({ masterName: "CONTENT_TINT", sectionTitle: "리스크" });
chip(s, "17"); s.addText("투자 집행 전에 받는 것", { placeholder: "title" });
kicker(s, "1번과 2번이 먼저다. 둘 중 하나라도 닫히지 않으면 이 제안서는 아직 제안서가 아니다");
s.addTable([
  headerRow(["#", "항목", "누구에게", "막는 것"]),
  [{ text: "1", options: { bold: true } }, { text: "고밀도 상면료 kW당 월 단가 견적 3건", options: { bold: true } },
   { text: "국내 IDC 사업자·브로커" }, { text: "2단계 전체", options: { bold: true, color: HEX.accent6 } }],
  [{ text: "2", options: { bold: true } }, { text: "지배구조·자본 상태 (2장 체크리스트)", options: { bold: true } },
   { text: "DART, 등기부, IR" }, { text: "라운드 개시", options: { bold: true, color: HEX.accent6 } }],
  ["3", "1단계 부지 단면도·바닥 적재 하중", "자체 채굴장", "T2"],
  ["4", "한전 요금표 기준 24시간 평탄 부하 혼합 단가", "한전", "전력 가정 150원/kWh"],
  ["5", "진천·충북 TMY 시간별 건구·습구", "기상자료개방포털", "프리쿨링 48% · PUE 1.30"],
  ["6", "CDU 3사 견적 (600kW · 1,200kW)", "CDU 업체", "냉각 패키지 최대 항목"],
  ["7", "BEEHE·Ablecom 견적 3건 + 팬 PQ 곡선", "제조사", "$7,400 과 팬 7대 구성"],
  ["8", "수전 증설 가능 용량·분담금", "한전", "2단계 5MW"],
  ["9", "FTO 변리사 의견서", "변리사", "리버스엔지니어링 착수"],
  ["10", "EC 팬 수입분의 원산지 부가가치 기준", "관세사", "“한국산” 주장"],
], { x: 1.52, y: 1.76, w: 7.0, h: 3.5, fontSize: 10, rowH: 0.30, valign: "middle",
     color: HEX.dk1, colW: [0.4, 3.3, 1.7, 1.6], ...TBL() });
card(s, { x: 8.82, y: 1.80, w: 3.90, h: 1.86, shadow: true, name: "team" });
s.addText("팀 — 채워야 하는 자리", { x: 9.06, y: 1.96, w: 3.42, h: 0.3, fontSize: 12,
  bold: true, color: HEX.accent1, isTextBox: true, margin: 0 });
s.addText("지금: 기구 1 · 열·시험 1 · 제어 1\n($7,000/인·월 적재 계획 단가)\n\nIDC 운영 책임 — T2 전\n전기·기계 설계(PE) — T2, EPC 수주 자격\n영업·애플리케이션 엔지니어 — T3",
  { x: 9.06, y: 2.28, w: 3.42, h: 1.26, fontSize: 10.5, color: C.text1, lineSpacing: 15.5,
    isTextBox: true, margin: 0, valign: "top" });
card(s, { x: 8.82, y: 3.82, w: 3.90, h: 1.44, shadow: true, name: "gov" });
s.addText("거버넌스", { x: 9.06, y: 3.96, w: 3.42, h: 0.28, fontSize: 12, bold: true,
  color: HEX.accent1, isTextBox: true, margin: 0 });
bullets(s, [
  "트랜치 집행은 게이트 통과 확인 후 이사회 결의. 판정 자료를 투자자에게 제출",
  "펌웨어 서명 키는 법인 설립 시 국내 에스크로",
  "모회사와의 거래는 전부 특수관계자 거래로 공시 기준에 맞춘다",
], { x: 9.06, y: 4.26, w: 3.42, h: 0.92, fs: 9.5 });

/* 19. 닫는 장 */
pres.addSection({ title: "닫음" });
s = pres.addSlide({ masterName: "CLOSE_DARK", sectionTitle: "닫음" });
s.addText("요청 — 1단계 70억 원", { placeholder: "title" });
s.addText("T1 15억을 먼저 집행하고, 게이트 B 와 상면료 견적으로 T2 42억의 가부를 판단한다.",
  { x: M, y: 1.52, w: 11.4, h: 0.34, fontSize: 13.5, color: HEX.accent1, bold: true,
    isTextBox: true, margin: 0 });
[["T1 15억", "RDHx 개발 · FTO · 1단계 설계 · 운전자금 1년", "계약 체결 시", HEX.accent1],
 ["T2 42억", "1단계 채굴장 1.5MW 전환 (UPS·발전기 포함)", "게이트 B + 상면료 견적 + 부지 적합", HEX.accent1],
 ["T3 13억", "운전자금 2년차 · 국산화 소싱 · 영업 · 2단계 설계", "게이트 C + 외부 상면 계약 1건", HEX.accent1]
].forEach(([t, u, c], i) => {
  const y = 2.18 + i * 1.02;
  s.addShape(pres.ShapeType.roundRect, { x: M, y, w: 1.70, h: 0.56, rectRadius: 0.1,
    fill: { color: "16404F" }, line: { color: HEX.accent1, width: 1 } });
  s.addText(t, { x: M, y, w: 1.70, h: 0.56, fontSize: 14, bold: true, color: HEX.accent1,
    align: "center", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(u, { x: M + 2.00, y, w: 5.4, h: 0.56, fontSize: 12.5, color: "FFFFFF",
    valign: "middle", isTextBox: true, margin: 0 });
  s.addText(c, { x: M + 7.60, y, w: 4.8, h: 0.56, fontSize: 11, color: "9FB3BD",
    valign: "middle", isTextBox: true, margin: 0 });
});
s.addShape(pres.ShapeType.roundRect, { x: M, y: 5.40, w: 12.09, h: 0.80, rectRadius: 0.08,
  fill: { color: "3A2520" }, line: { color: HEX.accent6, width: 1 }, objectName: "warn2" });
s.addText("이 덱은 내부 검토용이다. 2장(지배구조)과 17장 1번(상면료 견적 3건)이 닫히기 전에는 외부에 보내지 않는다.",
  { x: M + 0.28, y: 5.40, w: 11.5, h: 0.80, fontSize: 12, bold: true, color: "E0A08E",
    valign: "middle", isTextBox: true, margin: 0 });
s.addText("전체 문서: 13_투자제안서 · 11_자체IDC_5MW · 12_국산화_로드맵 · 10_사업계획서.  이 덱은 그 문서의 요약이고, 숫자가 어긋나면 문서가 기준이다.",
  { x: M, y: 6.46, w: 11.4, h: 0.3, fontSize: 10.5, color: "5B7682", isTextBox: true, margin: 0 });
s.addNotes("밸류에이션은 2장 체크리스트와 상면료 견적이 끝난 뒤에 정한다.");

/* ---------- write ---------- */
const OUT = path.join(__dirname, "..", "13_투자제안서", "OpenRDHx_투자제안서.pptx");
(async () => {
  await pres.writeFile({ fileName: OUT });
  const skill = process.env.PPTX_SKILL_DIR;
  if (skill) {
    const { applyTheme } = require(require("path").join(skill, "scripts/apply_theme.js"));
    await applyTheme(OUT, THEME);
  } else {
    console.warn("PPTX_SKILL_DIR 가 없어 테마 색상을 주입하지 않았다.");
  }
  console.log("written:", OUT);
})();
