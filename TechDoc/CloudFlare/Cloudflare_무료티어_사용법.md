# Cloudflare 무료 티어 사용법 — VibeQuant 운영 사례

> 작성: 2026-07-24 · 대상: 개인·독립 연구자·소규모 오픈소스 사이트를 **유료 전환 없이** 운영하려는 개발자  
> 관련: [Cloudflare 무료 티어 가입·한도 가이드](Cloudflare%20free%20tier%20guide.md) · [Vercel 분석](../vercel/vercel_analysis.md) · [무료 웹호스팅 비교](../Free_Hosting/FreeHosting.md) · 사이트 [vibequant.cc](https://vibequant.cc/)

본 문서는 “제대로된 운영 없이 구글링 LLM이 나열한 매뉴얼”이 아니라, **[VibeQuant](https://vibequant.cc/)를 Cloudflare 무료 티어만으로 설계·운영한 이유와 방법**을 정리한 문서이다. 
클라우드플레어의 기본적인 정보, 쿼터 상세는 기존 [가입·한도 가이드](Cloudflare%20free%20tier%20guide.md)를 살펴보면 된다.

---

## 1. Cloudflare란?

Cloudflare는 원래 **DNS·CDN·DDoS 방어**로 유명해진 엣지 네트워크 회사다. 많은 Web3, 코인 거래소가 Cloudflare를 사용하고 있다. 2020년대 들어 **Workers(서버리스) · Pages(정적/SSR) · R2(오브젝트 스토리지) · D1(SQLite) · KV · Cache API** 등을 한 계정에 묶어, “도메인 앞단 보안 + 전 세계 배포 + 가벼운 백엔드”를 **같은 엣지**에서 처리하는 **개발자 플랫폼**으로 확장했다. 최근에는 인공지능을 위한 서비스가 런칭되고 있다.

한 줄로 요약하면

> **트래픽이 어디서 오든, 가까운 PoP에서 HTML·API·캐시를 처리하고, 원본 서버 비용을 최대한 없앤다.**

무료 플랜에서도 (제한은 있지만) 커스텀 도메인, HTTPS, CDN, 기본 WAF/봇 완화, Pages·Workers를 쓸 수 있다. VibeQuant처럼 **콘텐츠 아카이브 + 얇은 API + 브라우저 퀀트 실험**에 잘 맞는다.

나는 도메인을 구매하여 도메인 비용만 사용되었다. SEO에는 도메인이 붙은 서비스가 더 유리하기 때문이다. 

---

## 2. 장점

### 2.1 보안

디도스 방어에 특화된 Cloudflare 답게 트래픽 앞단에서 비정상적인 트래픽을 걸러준다.

| 항목 | 의미 |
|------|------|
| 자동 HTTPS / TLS | 인증서 갱신 부담 감소 |
| DDoS·봇 완화 | 오리진이 약해도 엣지에서 흡수 |
| DNS가 플랫폼과 동일 | 네임서버만 Cloudflare면 CDN·WAF·Pages가 한 흐름 |
| 시크릿은 Worker에만 | Pages HTML에는 API 키를 넣지 않는 구조가 자연스럽다 |

정적 HTML이 대부분이라면 **원본 서버를 노출하지 않는** 설계가 된다. 공격 트래픽이 “앱 서버 CPU”가 아니라 “Cloudflare 엣지”에 먼저 충돌한다.

### 2.2 CDN (대역폭이 무료에 가깝다)

Pages 정적 자산은 **대역폭 무제한**에 가깝게 쓸 수 있다(공정 사용·약관은 별도). R2는 **egress 무료**가 핵심 차별점이다. “칼럼·TechDoc HTML이 늘어도 전송료 폭탄”이 상대적으로 적다. Vercel Hobby의 월 대역폭 상한·초과 과금 구조와 대비되어 더 무료 서비스, 효율적인 사용이 가능하다.

### 2.3 서버리스 통합성

한 계정에서 대략 이런 서비스 조합이 가능하다.

```
Pages (HTML/SEO)  +  Pages Functions / Workers (API)
      +  Cache API · KV (캐시)
      +  R2 / D1 (저장)
      +  커스텀 도메인 · 서브도메인
```

“정적 사이트는 A사, API는 B사, CDN은 C사”로 쪼개지 않아도 된다. VibeQuant는 **콘텐츠는 Pages 정적 HTML**, **시세·연구 API는 Worker/Pages Functions**, **브라우저 퀀트는 Pyodide**로 역할을 나눴다.

서비스 유지보수 구조가 간단하고, 장애의 포인트가 심플해진다. 운영의 편의성에서 이를 따를 것이 없다.

### 2.4 기타 실무 이점

- **신용카드 없이** Workers/Pages 시작 가능(제품·시점에 따라 R2 등은 결제수단 요구 가능 — §7 주의)
- `*.pages.dev` / `*.workers.dev`로 도메인 없이도 프로토타입
- Wrangler CLI로 로컬과 동일한 배포 스크립트
- GitHub Markdown → 정적 HTML 빌드와 궁합이 좋다 (SEO·GEO)

---

## 3. 단점

솔직히 적는다. 무료 티어를 “무제한 PaaS”로 오해하면 바로 문제가 될 수 있다.

| 단점 | 설명 |
|------|------|
| **일일 요청·CPU 한도** | Workers 무료는 대략 **10만 req/일**, 요청당 CPU **~10ms** 급. 피크에 소진되면 UTC 자정(KST 09:00)까지 막힐 수 있다 |
| **KV 쓰기 한도** | 무료 KV 쓰기는 하루 ~1,000 수준으로 빡세다. 세션·실시간 카운터에 부적합 → **Cache API 우선**이 실무 패턴 |
| **Python 네이티브 약함** | Workers의 Python은 Pyodide/WASM 성격. `numpy`·무거운 C 확장·장시간 잡은 엣지에 올리기 어렵다 |
| **콜드/런타임 제약** | Node 풀스택(긴 백그라운드 잡, WebSocket, 임의 바이너리)은 Vercel/Railway 쪽이 편한 경우가 많다 |
| **디버깅 UX** | 로컬 재현·로그는 익숙해지기 전까지 답답할 수 있다 |
| **벤더 경계** | Durable Objects·일부 AI·고급 WAF는 유료. “완전 무료로 엔터프라이즈”는 환상 |
| **서브도메인·프로젝트 분산** | 무료에서 커스텀 호스트를 여러 Pages 프로젝트에 붙이다 보면 DNS·미들웨어·리다이렉트 설계가 복잡해진다 (VibeQuant도 허브 단일 프로젝트 + path 라우팅으로 단순화) |
| **약관·공정 사용** | 대역폭 “무제한”도 남용·공격·상업 대량 배포에는 제약이 걸릴 수 있다 |

**요약:** 보안·CDN·정적+얇은 API에는 강하지만, **무거운 백엔드·강한 일관성 DB·장시간 Python**은 다른 곳으로 빼는 편이 맞다.

그래서 서비스 트래픽을 모니터링하다가 트래픽이 좀 넘치면 SaaS Redis, Vercel이나 다른 무료 SaaS를 섞어 사용하는 것을 권한다. 

---

## 4. 경쟁 서비스 (Vercel 포함 PaaS)

| 서비스 | 포지션 | Cloudflare 대비 |
|--------|--------|-----------------|
| **[Vercel](../vercel/vercel_analysis.md)** | Next.js 최적화 PaaS, DX 최고 | Hobby는 상업 제한·대역폭 상한·초과 과금 리스크. Next 풀스택이면 매력, **트래픽 큰 정적 아카이브**면 CF가 유리한 경우가 많음 |
| **Netlify** | JAMstack·폼·빌드 파이프라인 | 빌드 분 축소 등 무료 한도가 타이트해지는 추세 |
| **GitHub Pages** | 문서·포트폴리오 | 서버리스 API·엣지 캐시·통합 WAF는 약함. **원문 MD 보관소**로는 최고 (VibeQuant는 GitHub + CF 이중 구조) |
| **Railway / Render / Fly.io** | 컨테이너·장시간 프로세스 | 슬립·시간 제한·유료 전환 압력. Python API 서버에 적합 |
| **Firebase Hosting** | Google 생태계 | Auth/Firestore와 묶일 때 강함 |
| **AWS Amplify / Azure Static Web Apps** | 클라우드 벤더 종속 | 엔터프라이즈 IAM·기존 클라우드와 통합 시. 개인 무료 운영에는 CF가 단순한 편 |
| **Oracle Cloud Free** | Always Free VM | IaaS. 관리 부담↑, 통제권↑ — [별도 가이드](../OracleCloud/02.%20Oracle%20Cloud%20Free%20Tier%20Guide.md) |

선택 휴리스틱

- **Next.js App Router 중심 제품** → Vercel을 먼저 검토하되, 비용·약관을 읽고 시작
- **Markdown 아카이브 + SEO + 얇은 API + 비용 0** → Cloudflare Pages (+ Workers)
- **장시간 Python / DB 워커** → Railway·Render·Fly 또는 별도 VPS + 앞단만 Cloudflare

AWS에 락인되는 것보다 훨씬 저렴하고 디도스 공격 등 사이버 공격을 서비스 앞단에서 막기 때문에 트래픽 폭탄을 맞을 일이 줄어든다. 

---

## 5. 효율적인 개발 언어와 스택

무료 티어에서 **덜 싸우는** 조합, 백엔드가 복잡한 서비스는 외부로 빼는 것을 권한다.

### 5.1 추천 스택 (VibeQuant형)

| 계층 | 기술 | 이유 |
|------|------|------|
| 콘텐츠 원본 | **Markdown (GitHub)** | 버전관리·PR·AI 검색(DeepWiki 등)·인간 가독성 |
| 발행면 | **정적 HTML** (빌드 스크립트) | Pages에 올리고 Core Web Vitals·OG·sitemap·`llms.txt` |
| 엣지 API | **JavaScript / TypeScript** (Workers, Pages Functions) | 런타임 1등 시민. `fetch`·Cache API와 궁합 |
| 브라우저 퀀트 | **Python + Pyodide** | 서버 CPU 한도를 안 씀. GS Quant 스타일 실험은 클라이언트 |
| 캐시 | **Cache API** (우선) · KV(읽기 위주) | KV 쓰기 한도 회피 |
| 시크릿 | Worker 환경변수 / `wrangler secret` | 프론트 번들에 키 금지 |

### 5.2 피하거나 “경계 밖으로”

- Workers 위에서 **무거운 numpy/pandas 배치** — 브라우저 Pyodide 또는 외부 PaaS
- **Prisma + Neon TCP** 같은 장수 커넥션 — Pages Functions에서 재설계 필요 (REST/HTTP 클라이언트·캐시)
- **Puppeteer / 로컬 fs** — 엣지에 없음. 사전 빌드하거나 다른 런타임
- **매 요청 LLM** — 캐시·일일 한도·비용. DeepSeek 등은 Worker에서 호출하되 **결과 캐시**

### 5.3 언어 한 줄 요약

> **엣지는 TypeScript, 문서는 Markdown, 퀀트 실험은 브라우저 Python.**  
> 이 삼각형이 Cloudflare 무료 티어를 운영하기 좋다. 맞지 않는 기술 스팩을 가지고 억지로 맞추다가 기술 완성도와 안정성, 레이턴시 등 다양한 문제를 겪을 수 있다.

---

## 6. 어떻게 사이트를 개발했나? — 설계와 컨셉

### 6.1 문제의식

1. **뉴스·칼럼 웹의 휘발성**  
   나는 2000년부터 뉴스 칼럼을 작성했다. 미디어·블로그 개편이 반복되면 과거 글 URL이 사라지고, **2014년 이전 칼럼이 통째로 없는** 식의 공백이 생긴다. “14년치가 없다”는 건 검색·인용·연구 연속성 측면에서 치명적이다. 그리고 네이버의 폐쇄적인 정책으로 구글 검색을 허용하지 않는다. 
   → **GitHub에 Markdown으로 원문을 영구 보관**하고, 웹은 **그 원본의 발행면**으로 둔다.

2. **사람 검색(SEO)과 AI 검색(GEO)을 동시에**  
   GitHub 트리만으로는 구글·소셜 OG가 약하고, ChatGPT·Perplexity·Cursor 같은 에이전트는 `llms.txt`·시맨틱 HTML·개별 URL이 없으면 인용에서 밀린다.  
   → Pages에 **개별 문서 URL + sitemap + llms.txt + canonical(GitHub blob 링크)** 을 깐다.

3. **인프라 비용 0을 전제로 한 실험장**  
   개인 연구·오픈소스 아카이브에 월 수십 달러 PaaS는 과하다.  
   → **Cloudflare 무료 티어만으로 운영**을 하드 제약으로 건다.

4. **퀀트는 “보여주는 것”과 “돌리는 것”을 분리**  
   GS Quant·시세·전략 검증은 서버에서 돌리면 한도·의존성에 막힌다.  
   → **Playground는 Pyodide(브라우저 Python)**, API는 시세·캐시·얇은 프록시.

### 6.2 컨셉 한 장

```
[GitHub vibe-investing]
  ├─ 02.Investment Idea Column / essays / CTI / TechDoc   ← 원본·SEO 소스
  └─ VibeQuant/
        build → 정적 HTML
             ↓
[Cloudflare Pages]  vibequant.cc  (허브)
  docs / tech / cti / play / essays / research …
             ↓
[Workers / Pages Functions]  시세·연구 API·캐시
             ↓
[브라우저]  Pyodide + GS Quant 스타일 실험 (서버 CPU 미사용)
```

### 6.3 실제로 올린 서비스

| 면 | URL 예 | 역할 |
|----|--------|------|
| 허브 | [vibequant.cc](https://vibequant.cc/) | 진입·브랜드 |
| Columns | docs.vibequant.cc | 투자 칼럼 아카이브 |
| Tech | tech.vibequant.cc | TechDoc |
| CTI | cti.vibequant.cc | 위협 인텔 리포트 |
| Play | play.vibequant.cc | Python/퀀트 웹뷰 |
| Research | vibequant.cc/research | Quant / Space / Trump 시그널 (로그인 없음, 캐시) |
| Essays | vibequant.cc/essays | 에세이 |

원칙: **로그인 벽으로 콘텐츠를 가두지 않는다.** 연구 대시보드도 공개 + 캐시 TTL로 무료 한도를 지킨다.

### 6.4 “무료만”을 지키는 설계 규칙

1. HTML은 빌드 산출물 — 런타임 렌더 최소화  
2. 캐시 가능한 건 캐시 (장중 30분 / 장외 2시간 등)  
3. KV 쓰기 남발 금지 → Cache API  
4. 무거운 계산은 엣지가 아니라 **사용자 브라우저**  
5. Neon/Prisma/Puppeteer 같은 **TCP·로컬 런타임 가정**은 이식 대상에서 제외하거나 사전 계산  
6. 배포는 `wrangler pages deploy` — 프록시 환경변수에 발목을 잡히지 않게 (로컬에서 `HTTP_PROXY` unset 등)

---

## 7. 기본 설정 (빠른 시작)

상세 쿼터는 [가입·한도 가이드](Cloudflare%20free%20tier%20guide.md)를 보고, 여기서는 **최소 경로**만 적는다.

### 7.1 계정

1. [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)  
2. 이메일 인증  
3. **2FA 필수** (계정 = 전 사이트 키)

### 7.2 Wrangler

```bash
# Node.js 18+
npm i -g wrangler   # 또는 프로젝트 local node_modules
wrangler login
wrangler whoami
```

### 7.3 Pages 첫 배포

```bash
# 정적 폴더를 프로젝트로
wrangler pages deploy ./dist --project-name=my-site --commit-dirty=true
# → https://my-site.pages.dev
```

도메인이 있으면 Dashboard → Pages → Custom domains에서 연결.  
네임서버를 Cloudflare로 넘기면 DNS·SSL이 한곳에서 관리된다.

### 7.4 Worker (API)

```bash
cd cloudflare-worker
wrangler deploy
wrangler secret put MY_API_KEY
```

Pages와 Worker 설정을 **한 wrangler.toml에 억지로 합치지 말 것.**  
Pages는 보통 `cd pages && wrangler pages deploy .` 가 안전하다.

### 7.5 VibeQuant식 콘텐츠 파이프라인 (개념)

```bash
# Markdown 스캔 → HTML/catalog/sitemap
node content/build.mjs
# 정적 동기화 후 Pages 배포
npx wrangler pages deploy ./pages --project-name=vibequant-web
```

원본은 항상 GitHub, 웹은 파생본. **삭제된 언론 기사 대신 레포가 진실의 원천**이 되게 한다.

---

## 8. 주의점 (운영에서 실제로 밟는 것)

1. **Workers 일일 10만 요청**  
   미장 마감 직후·바이럴 공유 시 오후에 소진될 수 있다. 캐시·정적화로 API 호출을 줄인다.

2. **KV 쓰기 1,000/일**  
   페이지뷰 카운터를 KV에 쓰면 바로 터진다. 통계는 외부 또는 포기, 시세는 Cache API.

3. **CPU 10ms**  
   암호화폐 수준 연산·대용량 JSON 파싱을 엣지에서 돌리지 말 것. 사전 계산하거나 클라이언트, 다른 서비스를 믹싱.

4. **R2 활성화**  
   대시보드에서 R2를 켜야 하며, 정책에 따라 결제수단을 요구할 수 있다. 켜기 전 `10042` 에러가 난다.

5. **프록시 환경**  
   회사망·로컬 `HTTP_PROXY`가 켜져 있으면 `api.cloudflare.com` DNS가 깨져 배포가 실패한다. 배포 전 unset.

6. **서브도메인 522**  
   커스텀 호스트를 Pages 프로젝트에 붙이기 전에 apex path로 서비스하고, DNS가 준비되면 옮긴다.

7. **미들웨어로 path를 막지 말 것**  
   “곧 연결” HTML을 `/research/*`에 덮어쓰면 정적 파일·API가 영원히 안 보인다. (실제 장애 사례)

8. **시크릿은 HTML/깃에 넣지 말 것**  
   DeepSeek·거래소 키는 Worker secret. Pages는 공개면.

9. **무료 = SLA 없음**  
   장애·한도·정책 변경에 대비해 GitHub 원본과 `pages.dev` URL을 문서에 남긴다.

10. **상업·대량 스크래핑**  
    약관·공정 사용을 읽고, 연구 공개와 트래픽 남용을 구분한다.

---

## 9. 정리

| 질문 | 답 |
|------|----|
| Cloudflare를 왜 쓰나? | 보안 + CDN + 서버리스를 **한 엣지**에서, 무료로 정적·얇은 API 운영 |
| 어디에 약한가? | 무거운 Python 서버, 강한 일관성, 장시간 잡, 예측 불가 피크 요청 |
| Vercel과 차이는? | Next DX·프리뷰는 Vercel, **대역폭·비용 예측·엣지 통합**은 Cloudflare가 유리한 경우가 많음 |
| VibeQuant 핵심 제약? | **무료 티어만**, GitHub 원본 영속화, SEO+AI 검색, 브라우저 퀀트 |
| 스택? | Markdown → 정적 HTML + TS 엣지 API + Pyodide |

칼럼이 웹에서 사라지는 경험, 가독성이 떨어지고 검색·LLM에 안 잡히는 GitHub 트리, 월 과금 공포라는 이 세 가지를 동시에 풀려다 보면, Cloudflare 무료 티어는 “차선”이 아니라 **의도된 선택**이라고 봐야 한다.

작은 스타트업은 이런 무료 티어 서비스의 한계와 장점을 잘 판단하여 스케일업하기 전까지 존버해야 한다. 이제 AWS가 모든 서비스의 선택지가 아니다.

---

## 참고

- [Cloudflare 무료 티어 가입·한도 가이드](Cloudflare%20free%20tier%20guide.md) (KR) · [EN](Cloudflare%20free%20tier%20guide%20EN.md)
- [Vercel 플랫폼 분석](../vercel/vercel_analysis.md)
- [무료 웹호스팅 가이드](../Free_Hosting/FreeHosting.md)
- [에이전트 친화 웹사이트 가이드](../agent-friendly-website-guide/agent-friendly-website-guide.ko.md)
- [GS Quant Getting Started](../GS_Quant/GS%20Quant%20Getting%20Started.md)
- [Pyodide](../Python_Pyodide/Pyodide.md)
- Cloudflare Workers Pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- VibeQuant 배포 메모: `VibeQuant/cloudflare/DEPLOY_KR.md` (레포 내부)
- 사이트: https://vibequant.cc/ · 원본: https://github.com/gameworkerkim/vibe-investing
