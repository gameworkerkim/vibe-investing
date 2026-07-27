# LAON Code Dojo — 보안 교육 파생 프로젝트 제안

> **버전**: v0.1 (2026-07-27)
> **상태**: 기획 단계. LAON VaultGuard의 시크릿 스캐너 기반 기술을 재활용한 보안 교육 플랫폼.

---

## 1. 왜 피벗인가 — "시크릿 스캐너"의 시장 한계

### 1.1 경쟁 현실 점검

| 경쟁 서비스 | 최근 동향 | LAON이 따라잡기 어려운 이유 |
|------------|-----------|--------------------------|
| **GitHub Secret Protection** | AI 기반 오탐률 94% 감소, 모든 Public 레포 무료, Push Protection 기본 탑재 | GitHub 생태계 내 완전 통합. GitHub 쓰는 개발자는 추가 설치 불필요 |
| **GitGuardian** | 4,400만 달러 펀딩(2025), 400K+ 개발자, 엔터프라이즈급 정책 엔진 | 자본력·영업력·레퍼런스 수 모두 압도적 |
| **TruffleHog** | 2,500만 달러 시리즈 B(2026), 2.3만 Star, 오픈소스→SaaS 전환 성공 | 설치형+클라우드 동시 제공, 검증(Verification) 기능 강력 |
| **Gitleaks** | CI/CD 파이프라인 표준, 빠르고 가벼움 | 속도에서 이길 수 없음 |

**결론**: 시크릿 스캐너 "또 하나의 툴"로는 시장 진입이 갈수록 어려워지고 있다. GitHub이 자체 해결책을 제공하는 방향으로 가는 한, 제3자 도구의 설 자리는 좁아진다.

### 1.2 "기능 도구"에서 "교육 플랫폼"으로 — 논리적 전환

LAON VaultGuard가 가진 자산을 다른 방식으로 활용하면:

| LAON VaultGuard 보유 자산 | 교육 플랫폼 응용 |
|--------------------------|-----------------|
| 60+ 시크릿 패턴 정규식 | 퀴즈 문제 은행의 정답 검증 로직 |
| 멀티 LLM 하네스 (Claude+DeepSeek+GPT+Ollama) | LLM이 **취약 코드 샘플 생성** + **사용자 답변 평가** + **해설 생성** |
| Differential Privacy (14개 마스킹 룰) | 교육용 코드 샘플에서 실제 키 정보 자동 마스킹 |
| SARIF v2.1.0 Export | 퀴즈 결과를 표준 보안 리포트 포맷으로 제공 |
| VS Code 확장 | 에디터 내에서 바로 퀴즈 풀이 가능 |
| SQLite + JSON 듀얼 스토리지 | 사용자 학습 진도 저장 + 오프라인 모드 |

> **핵심 인사이트**: "스캐너"는 결국 탐지 엔진이다. 이 엔진을 코드를 찾는 데 쓰지 말고, **코드를 가르치는 데** 쓰자. 스캔은 LLM이 하고, 사람은 배우게.

---

## 2. 제품 컨셉: LAON Code Dojo

### 2.1 개요

**"5분짜리 코드 보안 퀴즈를 풀면서 자연스럽게 익히는 시큐어 코딩"**

- 대상: 주니어·중급 개발자 (1~5년차)
- 형식: 코드 조각 제시 → 취약점 찾기 → 정답 확인 → 해설 읽기 → 학습 진도 추적
- 언어: JavaScript/TypeScript, Python, Java, Go (시작), 이후 Rust, C#, Kotlin 확장
- 커버리지: OWASP Top 10, CWE Top 25, 시크릿 하드코딩, 입력 검증, 인증/인가, 암호화 오용

### 2.2 경쟁 서비스 대비 포지셔닝

| 서비스 | 특징 | LAON Code Dojo 차별점 |
|--------|------|----------------------|
| **Secure Code Warrior** | 기업용, 연 $50K+ | 무료·오픈소스, 개인 개발자 타겟 |
| **Codebashing** | 앱 내 위젯, 언어별 | 웹 기반 독립형 + VS Code 확장 |
| **HackTheBox** | CTF 중심, 공격자 관점 | 방어자(개발자) 관점, 실무 코드 중심 |
| **PentesterLab** | 웹 취약점 실습 | **시크릿 관리 + 클라우드 보안**까지 확장 (AWS/GCP/Azure 키 실수 퀴즈) |
| **TryHackMe** | 보안 입문자 전체 | **코드에 특화** — 개발자가 가장 자주 만드는 실수 Top 20 |

> **LAON Code Dojo의 USP**: "내 코드에 이런 취약점이 있다면?" — 실제 GitHub에서 발견된 패턴 기반 퀴즈. 멀티 LLM이 실시간 해설을 생성하므로 문제 은행 소진이 없다.

### 2.3 사용자 흐름

```
방문 (vibequant.cc/lab/dojo)
  → 언어 선택 (JS / Python / Java / Go)
  → 난이도 선택 (입문 / 중급 / 실전)
  → 퀴즈 풀이 (5~10문제/세션)
      ├── 코드 조각 제시 (10~30줄)
      ├── "취약점이 있는 라인을 클릭하세요" 또는 객관식
      ├── 제출 → LLM 평가 (정오답 + 해설 + 실제 사고 사례)
      └── 점수 누적 + 취약점 유형별 취약도 분석
  → 학습 대시보드
      ├── 지금까지 맞춘/틀린 유형 통계
      ├── 취약한 영역 추천 학습
      └── GitHub-style contribution graph (매일 푼 문제 수)
```

### 2.4 샘플 퀴즈 문제

```javascript
// [JavaScript] 다음 코드에서 보안 취약점은? (난이도: 입문)

const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE',     // ← 여기?
  secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  region: 'ap-northeast-2'
});

async function getUserData(userId) {
  const query = `SELECT * FROM users WHERE id = ${userId}`;  // ← 여기?
  const result = await db.execute(query);
  return result.rows[0];
}
```

**정답**: (1) 하드코딩된 AWS 키, (2) SQL 인젝션 취약점
**LLM 해설**: "실제 2026년 6월 Tving에서 발생한 AWS 키 노출 사고도 이와 동일한 패턴이었습니다. `accessKeyId`와 `secretAccessKey`를 환경 변수로 분리하고, SQL 쿼리는 parameterized query로 변경하세요."

---

## 3. 기술 아키텍처

### 3.1 2-Track: 문제 생성 (Build) vs 채점 (Run)

```
┌─────────────────────────────────────────────────────┐
│              LAON Code Dojo 아키텍처                  │
├─────────────────────┬───────────────────────────────┤
│   Track A: 문제 생성  │   Track B: 사용자 채점         │
│   (오프라인 배치)     │   (실시간)                     │
├─────────────────────┼───────────────────────────────┤
│ GitHub Public Repo  │   사용자 답변 입력              │
│   → 취약 코드 수집   │     → 선택한 라인 / 객관식 답    │
│   → LLM이 분석       │     → LLM이 평가               │
│   → 문제 DB 생성     │       ├── 정오답 판정            │
│   (Neon PostgreSQL)  │       ├── 해설 생성              │
│                     │       └── 관련 CWE 매핑          │
│                     │     → 점수 반환 + 진도 저장       │
│                     │       (Cloudflare CDN 캐시)     │
└─────────────────────┴───────────────────────────────┘
```

### 3.2 문제 생성 파이프라인 (Track A)

```typescript
// 하루 1회 cron (GitHub Actions)으로 실행
interface QuizGenerationPipeline {
  // 1. GitHub에서 취약 코드 샘플링
  sources: [
    'github-search: "AKIA" language:javascript',  // AWS 키 노출
    'github-search: "secretAccessKey"',           // 시크릿 하드코딩
    'github-search: "password=" language:python', // 평문 비밀번호
    'github-search: "SELECT * FROM" + "${"',      // SQL Injection
    'github-search: "eval(" language:javascript', // Code Injection
  ];

  // 2. LLM에게 문제 생성 요청
  prompt: `
    아래 실제 GitHub 코드에서 보안 취약점을 포함한 퀴즈 문제를 만들어줘.
    - 코드는 10~30줄로 간결하게
    - 의도적으로 1~2개의 취약점을 포함시킬 것
    - 정답 라인 번호, 취약점 유형(CWE), 상세 해설도 함께 생성
    
    응답 형식(JSON):
    {
      "language": "javascript",
      "difficulty": "beginner|intermediate|advanced",
      "code": "...",
      "vulnerabilities": [
        {
          "line": 5,
          "cwe": "CWE-798",
          "type": "hardcoded_credentials",
          "explanation": "...",
          "fix": "...",
          "real_world_case": "..."
        }
      ]
    }
  `;

  // 3. 생성된 문제를 Neon에 저장 + CDN 캐시 warmup
  // 4. 사용자 풀이 결과 → 취약 유형 통계 갱신
}
```

### 3.3 채점 파이프라인 (Track B)

```typescript
// POST /api/dojo/submit
interface QuizSubmission {
  quizId: string;
  selectedLines: number[];     // 사용자가 선택한 취약 라인
  selectedOption?: string;     // 객관식인 경우
}

interface GradingResult {
  correct: boolean;
  score: number;               // 0~100
  explanation: string;         // LLM 생성 해설
  cwe: string;
  relatedIncidents: string[];  // 관련 실제 보안 사고
  nextQuizSuggestion: string;  // 취약한 영역 기반 추천
}
```

### 3.4 기존 인프라 재활용

| 기존 자원 | 용도 |
|-----------|------|
| `LLM Harness` (`llm-harness.ts`) | 퀴즈 생성 + 채점에 그대로 사용, `LLM_MODE=majority`로 해설 품질 보장 |
| `SARIF Export` (`sarif-export.ts`) | 퀴즈 결과를 SARIF로 변환 → "내 취약점 리포트" 다운로드 |
| `Candidate Filter` | 퀴즈 문제 은행 중복 검사 + 난이도 분류 |
| `Differential Privacy` | GitHub 코드 수집 시 실제 키 마스킹 |
| Neon + Cloudflare CDN | 문제/답변 캐싱 (퀴즈는 정적 콘텐츠, 24h TTL) |
| Vercel API | 채점 API (`POST /api/dojo/submit`) + 통계 API (`GET /api/dojo/stats`) |

---

## 4. 데이터 모델

### 4.1 문제 은행 (Neon — 문제 생성 시 배치 적재)

```sql
CREATE TABLE dojo_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language VARCHAR(20) NOT NULL,       -- javascript, python, java, go
  difficulty VARCHAR(20) NOT NULL,     -- beginner, intermediate, advanced
  cwe_id VARCHAR(20),
  vulnerability_type VARCHAR(50),      -- hardcoded_credentials, sql_injection, xss...
  code TEXT NOT NULL,
  answer_lines INTEGER[] NOT NULL,
  explanation TEXT NOT NULL,
  fix_code TEXT,
  real_world_case TEXT,                -- 실제 사고 사례
  source_hash VARCHAR(64),             -- 중복 방지
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dojo_quizzes_lang_diff ON dojo_quizzes(language, difficulty);
CREATE INDEX idx_dojo_quizzes_cwe ON dojo_quizzes(cwe_id);
```

### 4.2 사용자 결과 (localStorage + 선택적 Neon)

```
localStorage (익명):
  - quiz_history: [{ quizId, correct, timestamp }]
  - weak_areas: { sql_injection: 2/10, hardcoded_credentials: 8/10 }
  - streak: { current: 5, longest: 12 }

Neon (로그인 사용자, Phase 2):
  - user_stats: { total_quizzes, accuracy, cwe_breakdown }
```

---

## 5. 언어·취약점 커버리지 로드맵

### Phase 1 — 핵심 언어 + 핵심 취약점 (MVP)

| 언어 | 취약점 유형 (초기 10종) | 문제 수 (MVP) |
|------|------------------------|-------------|
| **JavaScript/TypeScript** | XSS, Prototype Pollution, eval injection, hardcoded AWS key, SQLi, insecure JWT, unsafe deserialization, path traversal, CORS misconfig, npm audit bypass | 30문제 |
| **Python** | SQLi, command injection, pickle deserialization, hardcoded secret, eval/exec, path traversal, SSRF, insecure yaml.load, debug mode in prod, Django secret key exposure | 30문제 |
| **Java** | SQLi (JDBC), XXE, insecure deserialization, Log4Shell, hardcoded credentials, weak Crypto, path traversal, SSRF, Spring Boot actuator exposure, trust boundary violation | 20문제 |
| **Go** | SQLi (database/sql), command injection, hardcoded keys, unsafe temp file, TLS misconfig, integer overflow, race condition, unsafe reflection, context deadline missing, panic recovery missing | 20문제 |

### Phase 2 — 언어 확장

- Rust (unsafe block, memory safety)
- C# (.NET deserialization, connection string)
- Kotlin (Android specific: insecure WebView, exported component)
- Terraform/CloudFormation (IaC misconfig — S3 public bucket, overly permissive IAM)

### Phase 3 — 난이도 체계화

| 난이도 | 기준 | 예시 |
|--------|------|------|
| **입문** | 단일 파일, 명백한 패턴 | `const API_KEY = "sk-..."` |
| **중급** | 2~3개 파일 연관, 컨텍스트 필요 | 환경변수에서 키를 로드하지만 fallback에 하드코딩 |
| **실전** | 실제 GitHub 오픈소스 PR diff 기반 | "이 PR에서 보안 회귀(regression)를 찾으시오" |

---

## 6. 게이미피케이션

| 요소 | 구현 |
|------|------|
| **스트릭 (연속 출석)** | GitHub contribution graph 스타일. 매일 1문제라도 풀면 연속 기록 |
| **언어별 벨트 시스템** | 흰띠(0문제) → 노랑(10) → 초록(25) → 파랑(50) → 검정(100) |
| **데일리 챌린지** | LLM이 매일 아침 "오늘의 취약 코드" 자동 생성. 24시간 내 응시자 순위 |
| **취약점 배지** | "XSS Hunter — 10문제 연속 정답", "Key Master — 모든 시크릿 문제 만점" |
| **VS Code 확장 연동** | 풀이 기록이 에디터 Status Bar에 표시. "오늘의 퀴즈" 알림 |

---

## 7. 수익화 경로 (무료 + 프리미엄)

| 플랜 | 내용 | 가격 |
|------|------|------|
| **Free** | 웹 퀴즈 (언어별 20문제/월), 기본 통계, GitHub 로그인 불필요 | $0 |
| **Pro** | 무제한 퀴즈, VS Code 내 퀴즈, 팀 대시보드, SARIF 리포트, CWE 매트릭스 | $9/월 |
| **Team** | 팀 단위 학습 진도 관리, 커스텀 문제 업로드 (회사 코드베이스 기반 퀴즈 생성) | $49/월 |
| **Enterprise** | 온프레미스 퀴즈 서버, SSO, 감사 로그, 컴플라이언스 보고서 | 맞춤 견적 |

**초기 수익화 전략**: 무료 트랙으로 사용자 확보 → Pro 전환율 3% 목표 → Team 플랜이 주 수익원

---

## 8. 기존 LAON VaultGuard와의 관계

```
LAON VaultGuard (오픈소스)
  ├── 시크릿 스캐너 (기존) — 유지. CLI 도구 + VS Code 확장
  │     └── ★ 계속 무료 배포. 경쟁 심화되더라도 "교육의 출발점"
  │
  └── LAON Code Dojo (파생) — 신규. 보안 교육 플랫폼
        ├── 스캐너가 가진 탐지 엔진을 "퀴즈 생성 + 채점 엔진"으로 재활용
        ├── LLM 하네스 재활용 (문제 생성·채점·해설)
        └── vibequant.cc/lab/dojo 에 통합
```

**코드 관계**: LAON VaultGuard 모노레포에 `packages/dojo/` 디렉토리 추가. `src/llm-harness.ts`, `src/candidate-filter.ts`, `src/sarif-export.ts`를 공통 라이브러리로 추출하여 양쪽에서 import.

---

## 9. 경쟁 분석 — 교육 시장

### 9.1 교육 도구 비교

| 서비스 | 가격 | 강점 | 약점 |
|--------|------|------|------|
| **LAON Code Dojo** | 무료 + $9/월 | 오픈소스, 멀티 LLM 해설, VS Code 연동, 한국어 | 신규 진입, 인지도 부족 |
| **Secure Code Warrior** | $50K+/년 | 엔터프라이즈, 60+ 언어, LMS 통합 | 가격 진입장벽, 개인 개발자 배제 |
| **SecureFlag** | $800/년 | 실습 환경(hands-on lab), CI/CD 연동 | B2B 중심, 개인 접근 어려움 |
| **Application Security Weekly Quiz** | 무료 | 이메일 기반 주간 퀴즈, 간편 | 단순 객관식, 상호작용 부족 |
| **OWASP WebGoat** | 무료 | OWASP 공식, 풀스택 취약 실습 | 설치 필요, 가이드 부족, UI 올드 |

### 9.2 LAON Code Dojo의 틈새

1. **개인 개발자의 "첫 보안 학습"** — 기업 교육 예산이 없는 주니어 개발자에게 첫 진입점
2. **한국어 완전 지원** — 글로벌 경쟁 서비스 중 한국어 제대로 지원하는 곳 없음
3. **실제 사고 기반 문제** — "2026년 6월 Tving AWS 키 노출 사건과 동일한 패턴입니다" 같은 구체적 맥락
4. **멀티 LLM 해설** — Claude(규율), DeepSeek(추론), GPT(체계)가 각기 다른 관점에서 설명. 단일 모델보다 풍부한 학습 경험
5. **VS Code에서 바로** — 개발자의 작업 환경을 떠나지 않고 보안 학습

---

## 10. 8주 실행 로드맵

| 주차 | 작업 | 결과물 |
|------|------|--------|
| **W1~2** | LLM 문제 생성 파이프라인 구축 | Python 스크립트: GitHub 코드 수집 → LLM 배치 → Neon 적재 |
| **W3~4** | JavaScript 기초 퀴즈 30문제 + 웹 UI | `vibequant.cc/lab/dojo`에서 JS 퀴즈 풀이 가능 |
| **W5~6** | Python·Java·Go 70문제 추가 + 난이도 체계 | 총 100문제. 언어 선택기 + 난이도 필터 |
| **W7** | 게이미피케이션 (스트릭, 배지, 랭킹) | localStorage 기반 사용자 대시보드 |
| **W8** | VS Code 확장 퀴즈 모드 + 공개 배포 | VS Code에서 "Daily Dojo" 알림 → 1문제 풀기 |

---

> *"스캐너는 코드를 찾는다. 교육은 개발자를 바꾼다. 후자가 더 오래 가는 변화다."*
