# LLM Wiki 소개 — AI가 읽는 코드 문서의 시대

> AI가 GitHub 코드베이스를 분석해 **위키 형태의 문서를 자동 생성**하고, 자연어 Q&A로 코드를 탐색하게 해주는 새로운 도구 카테고리 "LLM Wiki"를 정리한 개요 문서입니다.
>
> 개별 상세 가이드: [DeepWiki](DeepWiki/DeepWiki_Getting_Started.md) · [Google Code Wiki](Google_Code_Wiki/Google%20code%20wiki%20getting%20started.md) · [OpenWiki](openwiki/README.md)

---

## 1. LLM Wiki란?

**LLM Wiki**는 "코드를 읽는 것이 소프트웨어 개발의 가장 큰 병목"이라는 문제의식에서 출발한 도구군입니다. 저장소를 입력하면 LLM이 전체 코드를 스캔해 **구조 · 아키텍처 · API · 데이터 흐름**을 서술형 문서와 다이어그램으로 만들어 주고, 자연어로 질문하면 소스 근거와 함께 답합니다.

기존 문서화 도구와의 결정적 차이:

- **Doxygen / TypeDoc** — 주석 기반의 *결정론적* API 레퍼런스 (서술 없음)
- **Docusaurus / MkDocs** — *렌더링/사이트화* 도구 (내용은 사람이 작성)
- **LLM Wiki** — LLM이 코드 자체를 읽고 **서술형 위키를 합성 + 지속 갱신**

---

## 2. 3종 한눈에 비교

| 항목 | DeepWiki | Google Code Wiki | OpenWiki |
|---|---|---|---|
| 제공 주체 | Cognition Labs (Devin) | Google | LangChain (오픈소스) |
| 형태 | 호스팅 SaaS | 호스팅 SaaS | 로컬 실행 CLI |
| 접근 방식 | `github.com` → `deepwiki.com` 치환 | `codewiki.google`에서 검색 | `openwiki code --init` |
| 기반 모델 | 자체 Devin 스택 | Gemini | 사용자 지정 LLM (BYO Key) |
| 공개 저장소 | 무료 | 무료 | 제한 없음(로컬) |
| 프라이빗 저장소 | Devin 유료 계정 | 미지원(웨이팅리스트) | 지원(코드 로컬 유지) |
| AI 에이전트 연동 | 공식 MCP 서버 | 공식 API 없음 | `AGENTS.md`/`CLAUDE.md` 자동 삽입 |
| 온프레미스/폐쇄망 | ✕ | ✕ |  (+ 로컬 LLM 조합) |

---

## 3. 각 Wiki 소개 · 요약

### 3.1 DeepWiki — 가장 빠르고 접근성 좋은 SaaS

세 도구를 직접 써 본 결과, **경험성(UX) 면에서 가장 탁월했던 것은 DeepWiki**였습니다. 설치·회원가입 없이 URL 한 글자(`github.com` → `deepwiki.com`)만 바꾸면 즉시 위키가 열리므로, "지금 이 오픈소스가 뭘 하는지" 파악하는 속도가 압도적으로 빠릅니다.

-  **장점**: 진입장벽 제로(무설치·무료), 즉시 열람, 자연어 Q&A(라인 단위 인용), 공식 MCP 서버로 AI 에이전트 연동, 인기 저장소 사전 인덱싱
-  **단점**: 무료는 공개 저장소 한정(프라이빗은 Devin 유료), 커스터마이즈 불가, 클라우드 전송 필수(오프라인 불가)
-  **주의점**: AI 생성물이라 오류·누락 가능 → 중요 판단은 소스로 검증. 민감 코드를 공개 저장소로 올려 문서화하지 말 것
-  **한 줄 평**: **"가장 빠르게 코드를 이해하고 싶을 때 첫 번째 선택."**

### 3.2 Google Code Wiki — 살아있는 문서(Living Docs)

Gemini가 저장소를 분석해 위키를 만들고, **코드가 바뀌면 문서와 다이어그램을 자동 재생성**합니다. 모든 설명이 실제 소스 파일에 하이퍼링크로 연결되어 검증이 쉽습니다.

-  **장점**: 무설치·무료, 코드 변경 시 자동 최신화(stale 문서 해소), 소스 하이퍼링크로 hallucination 크로스체크 용이, Google 인프라 기반 대규모 처리
-  **단점**: 공개 GitHub 저장소만 지원(프라이빗 웨이팅리스트), 공식 API 부재(자동화는 비공식 CLI 의존), 프리뷰 단계라 정책 변동 가능
-  **주의점**: 유사 명칭(FSoft CodeWiki, OpenDeepWiki 등)과 혼동 주의. 정식 출시 후 유료화 가능성
-  **한 줄 평**: **"항상 최신 상태를 유지하는, 사람이 읽기 좋은 문서."**

### 3.3 OpenWiki — 온프레미스 · 기업 환경의 해답

LangChain이 만든 오픈소스 CLI로, 외부 서비스가 아니라 **저장소 안에 위키 파일을 생성**하고 CI로 유지합니다. 사용자가 LLM(상용 API, 게이트웨이, 로컬 모델)을 직접 고를 수 있어 **코드가 인프라 밖으로 나가면 안 되는 기업 환경**에 가장 적합합니다.

-  **장점**: 프라이빗/사내 저장소 지원(코드 로컬 유지), **로컬 LLM 조합 시 완전 폐쇄망 구성 가능**, `AGENTS.md`/`CLAUDE.md` 자동 관리로 코딩 에이전트에 컨텍스트 주입, GitHub Action 증분 자동 갱신, MIT 오픈소스
-  **단점**: 설치/설정 필요(Node.js, 커넥터 인증), LLM API 비용 발생, 초기 버전(0.1.x)이라 명령 변경 가능
-  **주의점**: 자격증명은 `~/.openwiki/.env`에 저장 → 커밋 금지. 외부 LLM API를 쓰면 코드 일부가 전송되므로, 완전 격리가 필요하면 **로컬 LLM**을 사용
-  **한 줄 평**: **"기업·온프레미스에서 코드 유출 없이 살아있는 위키를 갖고 싶을 때."**

---

## 4. 상황별 선택 가이드

| 상황 | 권장 도구 | 이유 |
|---|---|---|
| 오픈소스를 지금 당장 빠르게 파악 | **DeepWiki** | 무설치·무료, 최고의 접근성과 경험성 |
| 항상 최신인 사람용 문서가 필요 | **Google Code Wiki** | 코드 변경 시 자동 재생성 + 소스 링크 |
| 사내 프라이빗/기업 저장소 문서화 | **OpenWiki** | 코드 로컬 유지, 프라이빗 지원 |
| 코드가 인프라 밖으로 나가면 안 됨 | **OpenWiki + 로컬 LLM** | 유일하게 완전 폐쇄망 구성 가능 |
| AI 코딩 에이전트에 컨텍스트 공급 | **DeepWiki(MCP)** 또는 **OpenWiki** | 공식 MCP / `AGENTS.md` 자동 연동 |

> **정리** — **속도·접근성**이면 DeepWiki(SaaS)가 단연 최고이고, **기업/온프레미스·보안**이 핵심이면 OpenWiki가 정답입니다. 둘은 대체재가 아니라 **용도에 따른 보완재**로 보는 것이 맞습니다.

---

## 5. 왜 "AI가 잘 읽는 문서"가 점점 중요해지는가?

과거 문서의 독자는 사람이었습니다. 이제는 **Claude Code, Cursor, Devin 같은 AI 코딩 에이전트가 문서의 1차 소비자**가 되어가고 있습니다. 에이전트는 저장소에서 컨텍스트를 찾을 때 문서를 참조하고, 그 품질이 곧 결과물의 품질로 이어집니다.

이 흐름에서 LLM Wiki가 중요한 이유

1. **컨텍스트 = 성능** — 에이전트가 코드베이스를 정확히 이해할수록 더 정확한 코드를 생성합니다. 잘 구조화된 위키는 에이전트의 "지도"가 됩니다.
2. **살아있는 문서** — 코드와 함께 자동 갱신되므로, 사람이 방치해 낡아버리는 문서 문제(stale docs)를 해소합니다.
3. **온보딩·유지보수 비용 절감** — 신규 개발자와 에이전트 모두 Day 1에 전체 구조를 파악할 수 있습니다.
4. **에이전트 친화 설계의 확산** — `AGENTS.md`, `CLAUDE.md`, `llms.txt` 처럼 *기계가 읽기 좋은 진입점*을 저장소에 두는 관행이 표준이 되고 있습니다. LLM Wiki는 이 진입점을 자동으로 생성·유지합니다.

> **핵심 메시지** — 앞으로 코드베이스의 경쟁력은 "코드를 얼마나 잘 짜는가"만이 아니라 "사람과 AI 모두가 그 코드를 얼마나 잘 이해할 수 있게 문서화했는가"로 결정됩니다. LLM Wiki는 그 문서화를 자동화하는 첫걸음입니다.

---

## 6. 공통 주의점 (3종 모두 해당)

- **AI 생성물은 검증 필수** — 공식 문서가 아니며, load-bearing(핵심) 주장은 반드시 소스 코드로 확인.
- **민감 코드 노출 금지** — 공개 SaaS(DeepWiki·Code Wiki)에는 비공개/민감 코드를 올리지 말 것. 보안이 중요하면 OpenWiki + 로컬 LLM.
- **정확도는 코드 품질에 비례** — 주석·README·구조가 부실하면 생성 문서 정확도도 하락. 동적 언어·메타프로그래밍이 많으면 오해석 빈도 증가.
- **비용/정책 변동** — LLM 호출 비용(OpenWiki), 프리뷰 정책 변경(Code Wiki), 유료 전환 가능성(전반)을 도입 전 확인.

---

### 3종 LLM 위키 문서 읽기
- DeepWiki 시작하기 : https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/DeepWiki/DeepWiki_Getting_Started.md
- OpenWiki 시작하기 : https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/openwiki/README.md
- Google Code Wiki 시작하기: https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/Google_Code_Wiki/Google%20code%20wiki%20getting%20started.md

### 참고 링크
- DeepWiki: https://deepwiki.com · 설치형 `deepwiki-open`: https://github.com/AsyncFuncAI/deepwiki-open
- Google Code Wiki: https://codewiki.google
- OpenWiki: https://github.com/langchain-ai/openwiki
