# DeepWiki 시작하기 (Getting Started)

> GitHub 저장소 URL만 바꾸면 AI가 코드베이스 설명서를 자동으로 만들어주는 도구, DeepWiki 입문 가이드

---

## 1. DeepWiki란?

**DeepWiki**는 AI 소프트웨어 엔지니어 'Devin'으로 유명한 **Cognition Labs**가 개발한 **AI 기반 코드 문서화 도구**입니다. GitHub 공개 저장소의 URL만 입력하면, AI가 해당 코드베이스의 구조와 로직을 분석해 **위키 형태의 구조화된 문서**를 자동으로 생성해 줍니다.

쉽게 말해, "GitHub 저장소를 넣으면 AI가 자동으로 설명서를 만들어주는 서비스"입니다.

### 주요 기능
- **저장소 구조 및 아키텍처 개요** 제공
- **기술 스택 및 주요 컴포넌트** 자동 식별
- **모듈 간 의존성 및 데이터 흐름**을 시각화한 다이어그램 자동 생성 (Mermaid 다이어그램)
- **자연어 Q&A**로 코드베이스에 대해 질문하고 답변 받기 ("인증은 어디서 구현하나요?" 등)
- 약 **8개 섹션**의 마크다운 페이지 생성 (Overview / Structure / Architecture / API / Subsystems / Operations / Testing / Glossary)

---

## 2. 60초 만에 시작하기 (Quick Start)

### 방법 ① URL 한 글자만 바꾸기 (가장 간단)

기존 GitHub 주소에서 `github.com`을 `deepwiki.com`으로 바꾸기만 하면 됩니다. **회원가입 없이 무료**로 이용할 수 있다.

```
# 원본 (GitHub)
https://github.com/gameworkerkim/vibe-investing

# DeepWiki 문서 보기
https://deepwiki.com/gameworkerkim/vibe-investing
```

### 방법 ② deepwiki.com 접속 후 검색

1. https://deepwiki.com 접속
2. 검색창에 `사용자명/저장소명` 입력 (예: `facebook/react`)
3. 생성된 위키 페이지 탐색

### 방법 ③ 자연어로 질문하기

생성된 위키 페이지의 **Ask 기능**에 자연어로 질문하면 코드베이스 맥락 기반 답변을 받을 수 있다.

```
Q: 이 프로젝트에서 인증(로그인)은 어디서 처리하나요?
Q: 데이터베이스 연결 설정은 어느 파일에 있나요?
Q: 이 저장소의 진입점(entry point)은 무엇인가요?
```

---

## 3. 이럴 때 유용합니다

| 상황 | 활용 방법 |
|---|---|
| 신규 입사자 온보딩 | 수백 개 파일을 안 읽고도 전체 구조를 한눈에 파악 |
| 오픈소스 기여 준비 | 기여할 부분과 관련 모듈, 데이터 흐름을 빠르게 이해 |
| 기술 면접 준비 | 유명 프로젝트(React, TensorFlow, LangChain 등)의 아키텍처 학습 |
| 낯선 라이브러리 조사 | 문서가 부실한 라이브러리도 코드 기반으로 설명 확보 |

---

## 4. 장점

- **진입 장벽이 거의 없음** — 설치·플러그인·회원가입 불필요. URL만 바꾸면 즉시 사용.
- **복잡한 코드베이스를 빠르게 파악** — 전체 구조와 핵심 로직을 한눈에 이해.
- **대화형 탐색 지원** — 자연어 질문으로 정적 문서보다 직관적인 학습.
- **다양한 언어 및 대규모 저장소 지원** — JavaScript, Python, Rust, Go, Java 등. 유명 프로젝트는 이미 분석 완료.
- **Deep Research 모드** — 코드 스멜 감지, 아키텍처 수준의 개선 제안 등 심층 분석.

## 5. 단점

- **공개 저장소만 무료 지원** — 비공개 저장소는 엔터프라이즈 대상으로 별도 제공 예정.
- **AI 생성 문서의 한계** — 공식 문서가 아니며, 오류·누락·실제 구현과의 차이 가능성 존재.
- **인터넷 연결 필수** — 클라우드 기반 SaaS라 오프라인 불가.
- **일부 중복 정보 가능성** — 이미 잘 정리된 공식 문서와 중복될 수 있음.
- **대규모 저장소는 범위 제한 가능** — 설정 파일(`.devin/wiki.json`)로 생성 범위를 지정할 수 있음.

## 6. 주의점

- **AI가 생성한 정보는 반드시 검증** — 보조 도구일 뿐, 공식 참조 문서를 대체하지 않음. 프로덕션 변경 시 실제 소스·공식 문서 확인 필수.
- **민감한 코드는 업로드 금지** — 공개 서비스이므로 비공개/민감 정보 코드는 분석 대상으로 삼지 말 것.
- **문서 정확도는 코드 품질에 좌우** — 주석·README가 부실하면 생성 문서 정확도도 하락. LLM이 이해하기 좋은 인덱싱이 선행되어야 한다.

---

## 7. 별도 설치형(Self-Hosted) — `deepwiki-open`

DeepWiki 공식 서비스(SaaS)는 클라우드에서만 동작하며 커스터마이즈가 불가능합니다. 이를 **직접 설치·운영**하고 싶다면 커뮤니티 오픈소스 버전인 **`deepwiki-open`** 을 사용할 수 있다.

> 저장소: https://github.com/AsyncFuncAI/deepwiki-open

### 왜 설치형을 쓰나?
- **비공개 저장소 문서화** — 사내 프라이빗 코드를 외부 SaaS에 노출하지 않고 로컬/온프레미스에서 처리.
- **원하는 LLM 선택** — OpenAI, Google Gemini, OpenRouter, Azure, 그리고 **Ollama 로컬 모델**까지 연결 가능.
- **완전한 자유도** — 프롬프트, 생성 범위, UI 등을 직접 커스터마이즈.

### 설치 방식 ① Docker (권장, 가장 간단)

```bash
# 1. 저장소 클론
git clone https://github.com/AsyncFuncAI/deepwiki-open.git
cd deepwiki-open

# 2. 환경 변수 파일(.env) 생성 — 사용하는 LLM 키만 채우면 됨
cat > .env <<'EOF'
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key
# (선택) OPENROUTER_API_KEY=...
# (선택) OLLAMA_HOST=http://host.docker.internal:11434
EOF

# 3. 실행
docker-compose up

# 4. 브라우저에서 접속
#   http://localhost:3000
```

### 설치 방식 ② 수동 실행 (프론트엔드 + 백엔드)

```bash
# 백엔드 (Python API 서버)
pip install -r api/requirements.txt
python -m api.main          # 기본 포트 8001

# 프론트엔드 (Next.js)
npm install
npm run dev                 # 기본 포트 3000
```

### 사용 흐름
1. `http://localhost:3000` 접속
2. 문서화할 GitHub/GitLab/Bitbucket 저장소 URL 입력 (비공개는 액세스 토큰 입력)
3. 사용할 LLM 모델(예: Gemini, GPT, 로컬 Ollama) 선택
4. 위키 생성 → Mermaid 다이어그램 + Ask(질의응답) 사용

### SaaS vs 설치형 요약

| 구분 | DeepWiki (공식 SaaS) | deepwiki-open (설치형) |
|---|---|---|
| 설치 | 불필요 (URL만 변경) | Docker 또는 수동 설치 필요 |
| 비공개 저장소 | 무료 미지원 | 원 (로컬 처리) |
| LLM 선택 | 불가 (자체 LLM 고정) | OpenAI/Gemini/Ollama 등 선택 |
| 커스터마이즈 | 불가 | 완전 자유 |
| 데이터 보안 | 외부 클라우드 전송 | 온프레미스 유지 가능 |
| 진입 난이도 | 매우 낮음 | 중간 (환경 설정 필요) |

> **한 줄 요약**: 빠르게 공개 저장소를 훑어보려면 **공식 SaaS**, 사내 비공개 코드나 로컬 LLM 연동이 필요하면 **`deepwiki-open` 설치형**을 선택할 수 있다.

---

## 8. 주요 경쟁 프로젝트

DeepWiki가 먼저 정의한 **"코드 위키 AI"** 카테고리에는 이후 여러 경쟁 프로젝트가 등장했다.

| 프로젝트 | 개발 주체 | 특징 |
|---|---|---|
| **DeepWiki** | Cognition Labs | 원조 서비스. SaaS 방식, 자체 LLM 사용 |
| **deepwiki-open** | 커뮤니티 (오픈소스) | DeepWiki의 완전 오픈소스 버전. Self-host 및 커스터마이즈 가능 |
| **Google CodeWiki** | 구글 | 2025년 11월 출시. Google Cloud + 구글 LLM 구동, 구글 검색 연계 최적화 |
| **Alphadoc** | - | DeepWiki와 유사한 AI 문서화 도구 |
| **기타** | - | ConnectWise PSA, IBM Cloud Pak for AIOps 등 (DevOps/AIOps 영역에 더 근접) |

- **DeepWiki**: SaaS라 가장 편리하지만 커스터마이즈 불가
- **deepwiki-open**: 직접 호스팅 필요하지만 완전한 자유도 보장
- **Google CodeWiki**: 구글 생태계와의 연계가 강점

---

## 요약

DeepWiki는 **"복잡한 오픈소스 코드를 빠르게 이해하고 싶은 개발자"**에게 매우 유용한 도구입니다. 다만 AI가 생성한 정보를 맹신하지 말고, 실제 코드와 함께 검증하며 사용하는 것이 중요하다.

- 공개 저장소를 빠르게 훑고 싶다면 → **공식 DeepWiki (SaaS)**
- 비공개 코드·로컬 LLM·커스터마이즈가 필요하다면 → **`deepwiki-open` (설치형)**
- 구글 생태계 연계를 원한다면 → **Google CodeWiki**

## 참고 링크
- 공식 서비스: https://deepwiki.com
- 설치형(오픈소스): https://github.com/AsyncFuncAI/deepwiki-open
- 개발사: Cognition Labs (https://cognition.ai)
