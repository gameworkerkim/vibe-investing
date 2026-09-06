/** Client-side mock (Worker 미배포·오프라인 폴백). TokenForge/shared/mock.ts 와 동기. */

const FILLER_KO =
  /주세요|해주세요|해주시고|해줘|부탁합니다|부탁드립니다|가능하면|그냥|일단|제발|좀\s+|그리고|또한/g;
const FILLER_EN =
  /\b(please|kindly|basically|just|actually|I(?:'d| would) like you to|I want you to|could you|can you|as you know|make sure to)\b/gi;

const GLOSS = [
  [/이동\s*평균/g, "moving average"],
  [/예외\s*처리/g, "exception handling"],
  [/무료\s*티어/g, "free tier"],
  [/토큰\s*절약/g, "token savings"],
  [/정적\s*웹앱/g, "static web app"],
  [/정적\s*페이지/g, "static page"],
  [/클라우드플레어|Cloudflare/gi, "Cloudflare"],
  [/자바스크립트/g, "JavaScript"],
  [/타입스크립트/g, "TypeScript"],
  [/파이썬/g, "Python"],
  [/대시보드/g, "dashboard"],
  [/프롬프트/g, "prompt"],
  [/함수/g, "function"],
  [/한국어/g, "Korean"],
  [/영어/g, "English"],
  [/주석/g, "comments"],
  [/최적화/g, "optimize"],
  [/테스트/g, "test"],
  [/배포/g, "deploy"],
  [/구현/g, "implement"],
  [/작성/g, "write"],
  [/수정/g, "fix"],
  [/설명/g, "explain"],
  [/분석/g, "analyze"],
  [/계산/g, "compute"],
  [/반환/g, "return"],
  [/보여/g, "show"],
  [/만들/g, "implement"],
  [/리스트/g, "list"],
  [/깔끔한/g, "clean"],
  [/자세히/g, "detailed"],
  [/예쁘게/g, "polished"],
  [/각각/g, "respectively"],
  [/페이지스/g, "Pages"],
];

const CJK_RE = /[\u3040-\u30ff\u4e00-\u9fff가-힣]/g;

export function detectSourceLang(s) {
  const hangul = (s.match(/[가-힣]/g) || []).length;
  if (hangul > 3) return "ko";
  const han = (s.match(/[\u4e00-\u9fff]/g) || []).length;
  if (han > 3) return "zh";
  const kana = (s.match(/[\u3040-\u30ff]/g) || []).length;
  if (kana > 3) return "ja";
  return "en";
}

function extractIdentifiers(src) {
  const found = new Set();
  const re =
    /\bhttps?:\/\/[^\s]+|\b[\w./-]+\.[a-z]{2,8}\b|\b[A-Z]{2,5}\b|`[^`]+`|\/api\/[\w/-]+/g;
  for (const m of src.match(re) || []) {
    if (m.length >= 2 && m.length < 80) found.add(m);
  }
  return [...found].slice(0, 12);
}

function detectIntent(src) {
  if (/만들|구현|작성|개발|implement|create|build/i.test(src)) return "Implement";
  if (/수정|고치|변경|리팩터|fix|refactor/i.test(src)) return "Fix";
  if (/설명|알려|explain/i.test(src)) return "Explain";
  if (/분석|analyze/i.test(src)) return "Analyze";
  if (/계획|plan/i.test(src)) return "Plan";
  if (/최적화|압축|optimize/i.test(src)) return "Optimize";
  if (/테스트|test/i.test(src)) return "Test";
  if (/배포|deploy/i.test(src)) return "Deploy";
  return "Execute";
}

function applyGloss(src) {
  let s = src;
  for (const [re, en] of GLOSS) s = s.replace(re, ` ${en} `);
  return s;
}

function compactEnglish(src) {
  return src.replace(FILLER_EN, " ").replace(FILLER_KO, " ").replace(/\s+/g, " ").trim();
}

export function buildMockOptimizedPrompt(source) {
  const src = String(source || "").trim();
  const lang = detectSourceLang(src);
  const intent = detectIntent(src);
  const ids = extractIdentifiers(src);
  let body = compactEnglish(applyGloss(src));
  body = body
    .replace(CJK_RE, " ")
    .replace(/[^\w\s./:+#@-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (body.length > 280) body = body.slice(0, 280).replace(/\s+\S*$/, "");
  const task =
    lang === "en"
      ? body || `${intent} request. Be short.`
      : `${intent} ${body || "stated engineering request"}. Keep all requirement.`;
  const keep = ids.length ? ` Keep verbatim: ${ids.join(", ")}.` : "";
  return `${task}${keep} Path/code/id byte-perfect. No filler. Caveman ultra.`;
}

export function mockOptimizeResult(source, targetFamily = "claude") {
  const lang = detectSourceLang(source);
  return {
    optimizedPrompt: buildMockOptimizedPrompt(source),
    summaryKo: `[mock·caveman] 원문(${lang})을 원시인 영어(ultra)로 압축했습니다. live DeepSeek가 의미를 보존한 caveman 번역을 수행합니다.`,
    changes: [`원문 언어 감지: ${lang}`, "caveman ultra: 관사·공손 표현 제거", "영어 전보체 (CJK 본문 제거)"],
    tips: [
      "Why use many token when few token do trick?",
      "Worker live 모드가 켜지면 DeepSeek가 의미를 보존해 caveman English로 번역합니다.",
    ],
    targetFamily,
    mode: "mock",
    model: "deepseek-v4-flash (mock)",
  };
}

export function mockPlanResult(goal) {
  const g = (goal || "").trim() || "프로젝트 목표";
  return {
    title: g.slice(0, 60),
    goal: g,
    wholePromptEn:
      `Plan this project end-to-end first, then output: 1) goal restated, 2) constraints, ` +
      `3) deliverables, 4) ordered verifiable steps, 5) risks, 6) the overall-planning prompt and per-step prompts. ` +
      `Project: ${g}. Be concise.`,
    steps: [
      {
        id: "s1",
        title: "요구사항 분석 & 범위 확정",
        descriptionKo: "목표·제약·산출물을 명확히 하고 모호한 항목을 질문으로 정리한다.",
        draftPrompt: `${g} 의 범위를 확정해줘. 요구사항, 제약, 산출물, 확인이 필요한 질문 목록을 한국어로 만들어줘.`,
      },
      {
        id: "s2",
        title: "아키텍처/구조 설계",
        descriptionKo: "디렉터리·모듈·데이터 흐름을 설계한다.",
        draftPrompt: `${g} 를 위한 구조(폴더/모듈/흐름)를 제안해줘. Cloudflare Pages free tier만 사용해.`,
      },
      {
        id: "s3",
        title: "단계별 구현 프롬프트 작성",
        descriptionKo: "각 구현 단계를 독립 실행 가능한 세부 프롬프트로 분해한다.",
        draftPrompt: `${g} 를 검증 가능한 단계로 나누고 각 단계 프롬프트를 작성해줘.`,
      },
      {
        id: "s4",
        title: "토큰 최적화 & 스킬 번들",
        descriptionKo: "세부 프롬프트를 영어로 압축하고 SKILL.md로 묶는다.",
        draftPrompt: `각 단계 프롬프트를 Claude용 영어 프롬프트로 최적화하고 SKILL.md로 내보내줘.`,
      },
    ],
    risks: ["범위 비대화 → 단계별 수용 기준(acceptance check)으로 방어"],
    outputs: ["전체 계획 프롬프트", "단계별 세부 프롬프트", "스킬(SKILL.md) 번들"],
    explanationKo:
      "전체 계획 프롬프트는 프로젝트를 목표→제약→산출물→단계→리스크로 분해합니다. 각 단계 세부 프롬프트를 DeepSeek로 영어 최적화하면 Claude/ChatGPT 토큰이 줄어듭니다.",
  };
}
