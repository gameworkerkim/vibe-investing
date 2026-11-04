# Awesome Opus 5.5 Videos — 코드로 만든 바이럴 영상과 그 프롬프트

> 저장소: https://github.com/yihui-dev/awesome-opus5-5-videos
> 라이브 갤러리: https://skillry.dev/ai-videos/opus-5-5
> 라이선스: MIT · Stars 약 9.7k · Forks 약 1k (2026년 11월 기준)

---

## 1. 한 줄 요약

**Claude Opus 5.5에게 "애니메이션을 코드로 작성하라"고 시켜서 만든 바이럴 영상들과, 그 영상을 만든 실제 프롬프트를 모아둔 큐레이션 저장소**다.

영상 생성 모델(Runway, Kling, Veo 등)로 픽셀을 "생성"한 것이 아니라, LLM이 HTML · Canvas · SVG · Three.js · GLSL · GSAP 코드를 작성하고 브라우저가 그 코드를 렌더링한 결과를 녹화한 것이다. 이른바 **"film as code"** 접근이다.

---

## 2. 무엇이 들어 있나

| 항목 | 내용 |
|---|---|
| 프롬프트 수 | **703개** — `prompts/*.md` 와 `data/videos.json` |
| 라이브 리메이크 | 그중 **418개**는 Skillry에서 원본 영상과 리메이크를 나란히 비교 가능 |
| README 하이라이트 | 프롬프트별 대표 영상 100개 |
| 카테고리 | 모션 그래픽 58 · 설명 영상(Explainer) 16 · 3D 장면 14 · 게임/인터랙티브 12 · 최신 프롬프트 30 |
| 출처 표기 | 모든 항목이 원작자의 X(트위터) 게시물로 링크됨 |
| 최근 업데이트 | 2026-10-12 — 영상 10개 및 프롬프트 285개 추가 |

### 저장소 구조

```
awesome-opus5-5-videos/
├── prompts/            # 영상별 프롬프트 (예: ajith-io-208546.md)
├── data/
│   └── videos.json     # 전체 메타데이터 (작성자, 기술 태그, 링크 등)
├── README.md
└── LICENSE             # MIT
```

### 영상에 쓰인 기술 태그

각 항목에는 사용된 기술이 태그로 붙어 있어 원하는 스타일을 고르기 쉽다.

- **Canvas** — 2D 파티클, 타이포 모션, 픽셀 아트
- **SVG + GSAP** — 로고 애니메이션, 인포그래픽, 설명 영상
- **Three.js / GLSL / WebGL** — 3D 장면, 셰이더, 볼류메트릭 효과
- **Web Audio** — 오디오 반응형(audio-reactive) 비주얼
- **Playable / Physics** — 실제로 플레이 가능한 미니 게임

최신 프롬프트에는 F1 피트스톱 시네마틱, 새턴 V 로켓 3D 모델, SaaS 런칭 영상, 노벨상 과학 설명 영상, GSAP 타임라인 프레임 검증, 결정론적 프레임 기반 렌더링 같은 실무형 사례도 포함되어 있다.

---

## 3. 장점

### 검증된 프롬프트를 그대로 재사용
"이런 걸 만들 수 있다"는 아이디어가 아니라, **실제로 바이럴된 결과물을 만든 프롬프트 원문**이다. 복사해서 붙여넣으면 바로 출발점이 생긴다. 프롬프트 엔지니어링 학습 교재로도 쓸모가 크다.

### 결정론적이고 수정 가능한 결과물
코드 기반이므로 같은 코드는 같은 프레임을 낸다. 디퓨전 기반 영상 생성 모델의 고질적 문제인 **텍스트 깨짐, 로고 왜곡, 프레임 간 불일치가 없다.** 색상 하나, 타이밍 하나를 바꾸고 싶으면 코드 한 줄만 고치면 된다. 브랜드 가이드를 지켜야 하는 모션 그래픽이나 정확한 수치가 들어가는 설명 영상에 특히 유리하다.

### 해상도·길이·포맷 자유
벡터/코드 렌더링이므로 1080p든 4K든, 세로형 숏폼(9:16)이든 가로형이든 캔버스 크기만 바꾸면 된다. GPU 렌더팜도, 영상 생성 크레딧도 필요 없다.

### 원본 vs 리메이크 비교 학습
Skillry 갤러리에서 원작과 리메이크를 나란히 볼 수 있어, **프롬프트만으로 어디까지 재현되는지** 직접 확인할 수 있다.

### 출처가 분명하고 라이선스가 단순
모든 항목이 원작자 게시물로 연결되고, 저장소 자체는 MIT 라이선스다. (단, 개별 영상과 프롬프트의 권리는 각 원작자에게 있다고 README에 명시되어 있다.)

---

## 4. 한계 · 주의점

| 한계 | 설명 |
|---|---|
| 파이프라인이 아님 | 프롬프트와 레퍼런스 모음일 뿐, 실행 가능한 렌더링 툴이나 녹화 파이프라인은 제공하지 않는다. |
| 일부 프롬프트는 불완전 | 원작자가 프롬프트 일부만 공개했거나 결과만 설명한 경우가 있으며, 해당 파일에 그 사실이 표기되어 있다. 원작자의 비공개 에셋에 의존하는 경우도 있다. |
| 모델 의존성 | Opus 5.5 기준으로 다듬어진 프롬프트라, 다른 모델에서는 결과 품질이 달라질 수 있다. |
| 영상화는 직접 | 결과물은 HTML 페이지이므로 MP4로 만들려면 녹화 단계가 별도로 필요하다 (아래 5장 참고). |
| 실사 표현의 한계 | 코드 렌더링은 모션 그래픽·추상·스타일라이즈드 3D에 강하고, 실사 인물·자연 풍경 같은 포토리얼 영상은 디퓨전 모델의 영역이다. |
| 리메이크 사이트 의존 | 418개 리메이크 비교는 외부 서비스(Skillry)에 있으므로 서비스 상태에 영향을 받는다. |

---

## 5. 실제 사용법

### 5-1. 가장 빠른 방법 (README 공식 절차)

1. `prompts/` 폴더에서 원하는 프롬프트 파일을 연다.
2. **Prompt** 섹션 아래 블록을 복사한다.
3. Claude Opus 5.5(Claude 앱, Claude Code, 또는 Opus 5.5를 쓰는 에이전트)에 붙여넣는다.
4. **"단일 HTML 파일로 렌더링해줘"** 라고 요청한다.
5. 영상이 필요하면 페이지를 녹화한다.

### 5-2. 저장소 받아서 프롬프트 찾기

```bash
git clone https://github.com/yihui-dev/awesome-opus5-5-videos.git
cd awesome-opus5-5-videos

# 키워드로 프롬프트 파일 찾기
grep -ril "three.js" prompts/ | head
grep -ril "logo" prompts/ | head

# 메타데이터 구조 먼저 확인 (필드명은 직접 확인 후 사용)
jq '.[0]' data/videos.json
```

### 5-3. Claude Code로 작업하기

Claude Code를 쓰면 생성 → 실행 → 수정 루프를 터미널 안에서 돌릴 수 있다.

```bash
mkdir my-motion && cd my-motion
claude
```

Claude Code 안에서:

```
../awesome-opus5-5-videos/prompts/ajith-io-208546.md 의 Prompt 섹션을 읽고,
그 내용을 바탕으로 index.html 단일 파일을 만들어줘.
- 1920x1080 고정 캔버스
- 총 길이 12초, 끝나면 정지
- 브랜드 컬러는 #0B1F3A / #F5B700 으로 교체
```

### 5-4. 프롬프트를 내 것으로 바꾸는 요령

원본 프롬프트를 그대로 쓰기보다, 아래 항목을 덧붙이면 "녹화 가능한 영상"으로 다듬기가 훨씬 쉽다.

```
[출력 형식]
- 외부 에셋 없이 단일 HTML 파일, 라이브러리는 CDN 1~2개 이내
- 캔버스 1080x1920 (세로 숏폼) 고정, devicePixelRatio 무시

[타이밍]
- 총 길이 15초, 3막 구조 (0–4초 도입 / 4–11초 전개 / 11–15초 로고 엔딩)
- Math.random() 대신 시드 고정 난수 사용

[녹화 대응]
- window.renderFrame(t) 함수를 노출해서, t(초)를 넣으면
  그 시점의 프레임을 그리도록 만들 것 (requestAnimationFrame 의존 금지)
- URL에 ?record=1 이 붙으면 자동 재생을 끄고 renderFrame 호출만 기다릴 것
```

핵심은 **`renderFrame(t)` 같은 시간 기반 렌더 함수**를 요구하는 것이다. 이렇게 하면 실시간 재생 속도와 무관하게 프레임 단위로 정확히 캡처할 수 있어, 끊김 없는 60fps 영상을 얻는다. (최신 프롬프트 중 "Deterministic Frame-Based Video Rendering", "GSAP Timeline with Frame Checking" 항목이 바로 이 방식을 다룬다.)

### 5-5. HTML → MP4 녹화 (Playwright + ffmpeg)

`renderFrame(t)` 를 노출한 HTML이라면 다음 스크립트로 프레임 단위 캡처가 가능하다.

```bash
npm i -D playwright
npx playwright install chromium
```

```javascript
// record.mjs
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const FPS = 60, DURATION = 15, W = 1080, H = 1920;
mkdirSync("frames", { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(`file://${process.cwd()}/index.html?record=1`);
await page.waitForFunction(() => typeof window.renderFrame === "function");

for (let i = 0; i < FPS * DURATION; i++) {
  await page.evaluate((t) => window.renderFrame(t), i / FPS);
  await page.screenshot({ path: `frames/${String(i).padStart(5, "0")}.png` });
}
await browser.close();
```

```bash
node record.mjs
ffmpeg -framerate 60 -i frames/%05d.png -c:v libx264 -pix_fmt yuv420p -crf 18 out.mp4
```

`renderFrame` 이 없는 일반 HTML이라면 OBS나 macOS 화면 녹화(⌘+Shift+5)로 실시간 캡처하는 것이 가장 간단하다. 다만 복잡한 셰이더 장면은 실시간 재생 중 프레임이 떨어질 수 있다.

### 5-6. 활용 아이디어

- **제품 런칭·SaaS 소개 영상** — 로고 인트로, UI 모션 루프, 기능 설명 애니메이션
- **기술·교육 설명 영상** — 알고리즘 시각화, 데이터 흐름, 과학 개념 설명
- **숏폼 콘텐츠** — 세로형 모션 타이포, 오디오 반응형 비주얼
- **피치덱·발표 보조** — 슬라이드에 삽입할 짧은 루프 애니메이션
- **인터랙티브 웹 경험** — 영상 대신 HTML 그대로 랜딩 페이지에 게시

---

## 6. 유사 프로젝트

> 아래 목록은 참고용이며, 각 저장소의 규모와 현재 상태는 링크에서 직접 확인하는 것을 권한다.

| 프로젝트 | 성격 | 이 저장소와의 차이 |
|---|---|---|
| `billyhetech/awesome-opus5-5-videos` | 같은 주제의 Opus 5.5 영상 컬렉션 | 수록 영상 규모가 더 크다고 알려져 있으며, 별도 갤러리 사이트를 운영 |
| `lemomo-ai/lemo-opuscar` | Claude Code용 영화 스타일 툴박스 | 사례 모음이 아니라 **스타일별 레시피 북** — 내 스토리에 특정 영화 스타일을 입히는 용도 |
| `joeseesun/opus-video-prompts` | 코드 기반 영상용 프롬프트 모음 | 소규모지만 프롬프트 자체에 더 집중 |
| `AaronAust1n/awesome-video-skills` | 코드·AI 영상 제작 도구 목록 | Opus 5.5에 한정하지 않고 code-driven video 생태계 전반을 정리 |
| `showlab/Awesome-Video-Diffusion` | 디퓨전 기반 영상 생성 연구 목록 | 코드 렌더링이 아닌 **영상 생성 모델**(Wan, Veo, Kling 등) 생태계 |

### 함께 보면 좋은 도구 (코드 → 영상 렌더러)

| 도구 | 설명 |
|---|---|
| **Remotion** | React 컴포넌트로 영상을 만들고 MP4로 렌더링하는 프레임워크. 프레임 기반이라 LLM 생성 코드와 궁합이 좋다. |
| **Motion Canvas** | TypeScript로 설명 영상·애니메이션을 만드는 오픈소스 도구 |
| **Manim** | 3Blue1Brown이 만든 Python 수학 애니메이션 엔진 |
| **Theatre.js** | 웹 애니메이션용 타임라인 에디터, Three.js와 연동 |

이 저장소의 프롬프트로 "장면 아이디어와 코드"를 얻고, Remotion이나 Motion Canvas로 "편집 가능한 영상 파이프라인"을 구성하는 조합이 실무에서 가장 효율적이다.

---

## 7. 정리

`awesome-opus5-5-videos`는 **"영상 생성 AI"가 아니라 "코딩 에이전트로 영상을 만드는 방법의 레퍼런스 라이브러리"**로 이해하는 것이 정확하다. 결과물이 코드이기 때문에 정밀하고, 반복 가능하고, 고치기 쉽다. 반대로 포토리얼 영상이나 완성형 파이프라인을 기대한다면 디퓨전 모델이나 Remotion 같은 별도 도구가 필요하다.

시작은 간단하다. 마음에 드는 영상 하나를 고르고, 프롬프트를 복사해 Opus 5.5에 붙여넣은 뒤, 브랜드 컬러와 길이만 바꿔 보는 것부터.
