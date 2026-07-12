# Open Code Review (OCR) — 완전 가이드

> 알리바바 그룹이 2년간 내부 검증 후 오픈소스화한 하이브리드 AI 코드 리뷰 CLI  
> Apache 2.0 | GitHub: [alibaba/open-code-review](https://github.com/alibaba/open-code-review)  
> 번역 계획(한국어 우선): [`Open code review Korean translation plan.md`](./Open%20code%20review%20Korean%20translation%20plan.md)

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [아키텍처 상세](#2-아키텍처-상세)
3. [설치](#3-설치)
4. [LLM 설정 — 클라우드 API](#4-llm-설정--클라우드-api)
5. [LLM 설정 — 로컬 모델 (DeepSeek / Qwen / Ollama)](#5-llm-설정--로컬-모델-deepseek--qwen--ollama)
6. [기본 사용법 및 명령어 레퍼런스](#6-기본-사용법-및-명령어-레퍼런스)
7. [리뷰 규칙 커스터마이징](#7-리뷰-규칙-커스터마이징)
8. [CI/CD 통합](#8-cicd-통합)
9. [AI 에이전트 통합 (Claude Code / Codex)](#9-ai-에이전트-통합-claude-code--codex)
10. [설정 레퍼런스 전체](#10-설정-레퍼런스-전체)
11. [장점 및 단점 분석](#11-장점-및-단점-분석)
12. [모델 선택 가이드](#12-모델-선택-가이드)
13. [적합한 팀 유형](#13-적합한-팀-유형)

---

## 1. 프로젝트 개요

Open Code Review(이하 OCR)는 알리바바 그룹이 내부에서 2년간 운영하며 검증한 AI 코드 리뷰 도구를 오픈소스화한 CLI 프로젝트다. 내부 운영 기간 동안 2만 명 이상의 개발자가 사용했으며, 100만 건 이상의 코드 결함을 탐지했다. Git diff를 읽어 변경된 파일을 설정된 LLM에 전달하고, 라인 수준의 정밀한 리뷰 코멘트를 생성한다.

핵심 설계 철학은 "결정적 엔지니어링(Deterministic Engineering) + LLM 에이전트"의 하이브리드 아키텍처다. 반드시 정확해야 하는 처리 단계는 엔지니어링 로직이 담당하고, 동적 판단이 필요한 부분만 LLM 에이전트에 위임한다.

| 지표 | 수치 |
|---|---|
| 내부 사용 기간 | 2년 |
| 누적 사용 개발자 | 2만 명 이상 |
| 누적 결함 탐지 | 100만 건 이상 |
| 순수 LLM 대비 토큰 절감 | 약 80% |
| F1 성능 향상 | 26.1% |
| 라이선스 | Apache 2.0 |

---

## 2. 아키텍처 상세

### 일반 AI 에이전트의 한계

Claude Code나 범용 에이전트를 코드 리뷰에 직접 사용하면 다음 문제가 반복적으로 발생한다.

- **불완전한 커버리지**: 변경 파일이 많은 PR에서 일부 파일을 임의로 생략한다.
- **위치 이탈(Position Drift)**: 보고된 이슈의 라인 번호 또는 파일 참조가 실제와 어긋난다.
- **품질 불안정**: 프롬프트의 사소한 변동으로 리뷰 품질이 크게 달라진다.

OCR은 이 세 가지 문제를 아키텍처 수준에서 해결한다.

### 결정적 엔지니어링 계층 (Deterministic Engineering)

반드시 정확해야 하는 단계는 LLM이 아닌 엔지니어링 로직이 보장한다.

| 기능 | 설명 |
|---|---|
| 정밀 파일 선택 | 리뷰 대상 파일을 정확히 결정하고 불필요한 파일을 필터링. 중요 변경사항 누락 방지 |
| 스마트 파일 번들링 | 연관 파일을 하나의 리뷰 단위로 묶음 (예: `message_en.properties` + `message_zh.properties`). 각 번들은 독립 컨텍스트의 서브 에이전트로 실행 |
| 세밀한 규칙 매칭 | 각 파일의 특성에 맞는 리뷰 규칙을 매칭. 정보 노이즈를 제거하고 모델 집중도 향상 |
| 위치 보정 모듈 | 독립적인 코멘트 포지셔닝·반성(reflection) 모듈로 AI 피드백의 위치 정확성과 내용 정확성을 체계적으로 개선 |

### LLM 에이전트 계층

동적 판단과 컨텍스트 검색이 필요한 부분을 담당한다.

- 코드 리뷰에 최적화된 시나리오별 프롬프트 템플릿
- 대규모 프로덕션 데이터의 도구 호출 흔적 분석으로 구성된 전문화된 툴셋
- 실시간 코드베이스 검색, 파일 전체 내용 읽기, 변경된 다른 파일 교차 참조

---

## 3. 설치

### NPM (권장)

```bash
npm install -g @alibaba-group/open-code-review
```

설치 후 `ocr` 명령어가 전역에서 사용 가능해진다.

### 바이너리 직접 다운로드

```bash
# macOS (Apple Silicon / M1~M4)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-darwin-arm64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# macOS (Intel)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-darwin-amd64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# Linux (x86_64)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-linux-amd64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# Linux (ARM64)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-linux-arm64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr
```

### 소스 빌드

```bash
git clone https://github.com/alibaba/open-code-review.git
cd open-code-review
make build
sudo cp dist/opencodereview /usr/local/bin/ocr
```

---

## 4. LLM 설정 — 클라우드 API

OCR은 OpenAI 호환 엔드포인트와 Anthropic 네이티브 API를 모두 지원한다. 설정 파일은 `~/.opencodereview/config.json`에 저장된다. 환경 변수가 설정 파일보다 우선 적용된다.

### Anthropic (Claude)

```bash
ocr config set llm.url https://api.anthropic.com/v1/messages
ocr config set llm.auth_token sk-ant-xxxxxxx
ocr config set llm.model claude-opus-4-6
ocr config set llm.use_anthropic true
```

Claude Code 사용자라면 `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_MODEL` 환경 변수를 `~/.zshrc` 또는 `~/.bashrc`에서 자동으로 인식하므로 별도 설정이 불필요하다.

권장 모델:

| 모델 | 용도 |
|---|---|
| `claude-opus-4-6` | 최고 품질 리뷰, 복잡한 아키텍처 분석 |
| `claude-sonnet-4-6` | 비용·성능 균형, 일상적인 PR 리뷰 |

### OpenAI (ChatGPT)

```bash
ocr config set llm.url https://api.openai.com/v1/chat/completions
ocr config set llm.auth_token sk-xxxxxxx
ocr config set llm.model gpt-4o
ocr config set llm.use_anthropic false
```

권장 모델:

| 모델 | 용도 |
|---|---|
| `gpt-4o` | 코드 리뷰 기본 추천 |
| `o3` | 복잡한 보안 취약점 분석 |
| `gpt-4.1-mini` | 비용 절감이 필요한 환경 |

### DeepSeek Cloud API

DeepSeek은 OpenAI 호환 API를 제공하므로 `use_anthropic false`로 설정한다.

```bash
ocr config set llm.url https://api.deepseek.com/v1/chat/completions
ocr config set llm.auth_token sk-xxxxxxx
ocr config set llm.model deepseek-coder
ocr config set llm.use_anthropic false
```

권장 모델:

| 모델 | 특징 |
|---|---|
| `deepseek-coder` | 코드 특화, 비용 효율 우수 |
| `deepseek-reasoner` | 복잡한 로직 분석 및 추론 강점 |

### Alibaba DashScope (Qwen Cloud)

```bash
ocr config set llm.url https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
ocr config set llm.auth_token sk-xxxxxxx
ocr config set llm.model qwen-coder-turbo
ocr config set llm.use_anthropic false
```

---

## 5. LLM 설정 — 로컬 모델 (DeepSeek / Qwen / Ollama)

로컬 LLM을 사용하면 코드가 외부 API로 전송되지 않아 완전한 데이터 프라이버시를 보장한다. OCR은 OpenAI 호환 엔드포인트를 로컬에서 노출하는 모든 런타임(Ollama, LM Studio, vLLM 등)을 지원한다.

### 5-1. Ollama 기반 설정 (범용)

Ollama는 로컬 LLM을 가장 간단하게 실행하는 방법이다. 설치 후 자동으로 `http://localhost:11434`에 OpenAI 호환 엔드포인트를 노출한다.

```bash
# Ollama 설치 (macOS)
brew install ollama

# Ollama 설치 (Linux)
curl -fsSL https://ollama.com/install.sh | sh

# 백그라운드 서버 시작
ollama serve &
```

OCR에 Ollama 연결:

```bash
ocr config set llm.url http://localhost:11434/v1/chat/completions
ocr config set llm.auth_token ollama
ocr config set llm.model qwen2.5-coder:32b
ocr config set llm.use_anthropic false
```

> auth_token 값은 임의 문자열로 설정해도 무방하다. Ollama는 로컬에서 토큰 검증을 하지 않는다.

### 5-2. DeepSeek 로컬 실행

#### Ollama로 DeepSeek 실행

```bash
# DeepSeek-R1 (추론 특화, 코드 리뷰에 적합)
ollama pull deepseek-r1:14b    # 약 9GB VRAM
ollama pull deepseek-r1:32b    # 약 20GB VRAM
ollama pull deepseek-r1:70b    # 약 48GB VRAM 이상

# DeepSeek Coder V2 (코드 특화)
ollama pull deepseek-coder-v2:16b    # 약 10GB VRAM
ollama pull deepseek-coder-v2:236b   # 약 130GB VRAM, 최고 품질

# 컨텍스트 창 확장 (agentic 워크플로에 필수)
ollama run deepseek-r1:14b
>>> /set parameter num_ctx 32768
>>> /save deepseek-r1-14b-32k
```

OCR 설정:

```bash
ocr config set llm.url http://localhost:11434/v1/chat/completions
ocr config set llm.auth_token ollama
ocr config set llm.model deepseek-r1:14b
ocr config set llm.use_anthropic false
```

#### vLLM으로 DeepSeek 실행 (고성능 GPU 서버 환경)

```bash
docker pull vllm/vllm-openai:latest

# DeepSeek-R1 14B (약 30GB VRAM 필요)
docker run --runtime nvidia --gpus all \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  -p 8000:8000 \
  vllm/vllm-openai:latest \
  --model deepseek-ai/DeepSeek-R1-Distill-Qwen-14B \
  --tensor-parallel-size 1
```

OCR 설정:

```bash
ocr config set llm.url http://localhost:8000/v1/chat/completions
ocr config set llm.auth_token vllm
ocr config set llm.model deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
ocr config set llm.use_anthropic false
```

#### LM Studio로 DeepSeek 실행 (GUI 환경)

1. [lmstudio.ai](https://lmstudio.ai)에서 LM Studio 설치
2. "Discover" 탭에서 `deepseek-r1` 검색 후 원하는 사이즈 다운로드
3. "Local Server" 탭에서 서버 시작 (기본 포트: 1234)

OCR 설정:

```bash
ocr config set llm.url http://localhost:1234/v1/chat/completions
ocr config set llm.auth_token lm-studio
ocr config set llm.model deepseek-r1-distill-qwen-14b
ocr config set llm.use_anthropic false
```

### 5-3. Qwen (Qwen2.5-Coder / Qwen3) 로컬 실행

Qwen 시리즈는 코드 생성 및 리뷰에서 동급 최강의 오픈소스 성능을 보여준다. 특히 Qwen2.5-Coder 32B는 HumanEval 기준 92.1%를 달성하며 Claude Sonnet 4.6(89.4%)을 상회한다.

```bash
# Qwen2.5-Coder (코드 특화 — 코드 리뷰 1순위 추천)
ollama pull qwen2.5-coder:7b     # 약 5GB VRAM, 빠른 응답
ollama pull qwen2.5-coder:14b    # 약 9GB VRAM, 균형
ollama pull qwen2.5-coder:32b    # 약 20GB VRAM, 최고 품질

# Qwen3 (범용 최신 모델, 2026년 2월 출시)
ollama pull qwen3:8b
ollama pull qwen3:32b

# 컨텍스트 창 확장 (256K 지원 모델 기준)
ollama run qwen2.5-coder:32b
>>> /set parameter num_ctx 32768
>>> /save qwen2.5-coder-32b-32k
```

OCR 설정:

```bash
ocr config set llm.url http://localhost:11434/v1/chat/completions
ocr config set llm.auth_token ollama
ocr config set llm.model qwen2.5-coder:32b
ocr config set llm.use_anthropic false
```

### 5-4. 로컬 LLM 하드웨어 요구사항

| 모델 | VRAM | 속도 (토큰/초) | 권장 용도 |
|---|---|---|---|
| DeepSeek-R1 14B | 9GB | 25~40 | 개인 개발자 노트북, 추론 강점 |
| Qwen2.5-Coder 7B | 5GB | 40~60 | 경량 환경, 빠른 PR 리뷰 |
| Qwen2.5-Coder 14B | 9GB | 25~35 | 균형형 추천 |
| Qwen2.5-Coder 32B | 20GB | 15~25 | 고품질 코드 리뷰, 엔터프라이즈 |
| DeepSeek-R1 32B | 20GB | 10~18 | 복잡한 보안 분석 |
| DeepSeek Coder V2 236B | 130GB+ | 8~12 | 최고 품질, GPU 서버 전용 |

> Q4 양자화를 사용하면 VRAM을 약 60% 절감하고 품질 손실은 약 2% 수준이다. Ollama는 모델 pull 시 자동으로 양자화를 적용한다.

### 5-5. 연결 테스트

```bash
# LLM 연결 확인 (클라우드 및 로컬 공통)
ocr llm test
```

---

## 6. 기본 사용법 및 명령어 레퍼런스

### 주요 리뷰 명령어

```bash
# 현재 변경사항 리뷰 (staged + unstaged + untracked 전체)
ocr review

# 브랜치 간 비교 리뷰
ocr review --from main --to feature-auth

# 특정 커밋 리뷰
ocr review --commit abc123

# LLM 호출 없이 리뷰 대상 파일만 미리 확인
ocr review --preview
ocr review --commit abc123 --preview

# JSON 출력 (CI/CD 파이프라인, 스크립트 파싱용)
ocr review --format json --audience agent

# 커스텀 규칙 파일 적용
ocr review --rule /path/to/my-rules.json

# 동시 리뷰 파일 수 조정
ocr review --from main --to my-feature --concurrency 4
```

### 전체 명령어 목록

| 명령어 | 별칭 | 설명 |
|---|---|---|
| `ocr review` | `ocr r` | 코드 리뷰 시작 |
| `ocr rules check <file>` | — | 해당 파일에 적용되는 규칙 미리 확인 |
| `ocr config set <key> <value>` | — | 설정 값 변경 |
| `ocr llm test` | — | LLM 연결 테스트 |
| `ocr viewer` | `ocr v` | 브라우저 기반 세션 뷰어 실행 (`localhost:5483`) |
| `ocr version` | — | 버전 정보 출력 |

### `ocr review` 주요 플래그

| 플래그 | 기본값 | 설명 |
|---|---|---|
| `--repo` | 현재 디렉토리 | Git 저장소 루트 경로 |
| `--from` | — | 비교 기준 ref (예: `main`) |
| `--to` | — | 비교 대상 ref (예: `feature-branch`) |
| `--commit`, `-c` | — | 단일 커밋 리뷰 |
| `--preview`, `-p` | `false` | LLM 호출 없이 리뷰 대상 파일만 확인 |
| `--format`, `-f` | `text` | 출력 형식: `text` 또는 `json` |
| `--concurrency` | `8` | 파일 동시 리뷰 최대 수 |
| `--timeout` | `10` | 동시 작업 타임아웃 (분) |
| `--audience` | `human` | `human` (진행 상황 표시) / `agent` (요약만 출력) |
| `--rule` | — | 커스텀 리뷰 규칙 JSON 파일 경로 |
| `--max-tools` | 내장 기본값 | 파일당 최대 도구 호출 횟수 |
| `--tools` | — | 커스텀 도구 설정 JSON 파일 경로 |

---

## 7. 리뷰 규칙 커스터마이징

OCR은 4단계 우선순위 체계로 규칙을 적용한다. 각 단계에서 파일 경로가 패턴에 처음 매칭되면 그 규칙을 적용하고, 매칭되지 않으면 다음 단계로 내려간다.

| 우선순위 | 소스 | 경로 | 설명 |
|---|---|---|---|
| 1 (최고) | `--rule` 플래그 | 사용자 지정 경로 | CLI 명시 오버라이드 |
| 2 | 프로젝트 설정 | `<repoDir>/.opencodereview/rule.json` | 프로젝트별 규칙, git에 커밋 가능 |
| 3 | 전역 설정 | `~/.opencodereview/rule.json` | 개인 전역 설정 |
| 4 (최저) | 시스템 기본값 | 내장 `system_rules.json` | NPE, XSS, SQL Injection 등 공통 규칙 |

### 규칙 파일 형식

```json
{
  "rules": [
    {
      "path": "src/main/java/**/*.java",
      "rule": "모든 신규 메서드의 필수 파라미터는 null 값을 검증해야 합니다"
    },
    {
      "path": "**/*mapper*.xml",
      "rule": "SQL Injection 위험, 파라미터 오류, 닫는 태그 누락을 확인하세요"
    },
    {
      "path": "src/**/*.{ts,tsx}",
      "rule": "비동기 함수의 에러 처리와 Promise 체인 누락을 확인하세요"
    }
  ]
}
```

- `path`는 `**` 재귀 매칭과 `{java,kt}` 중괄호 확장을 지원한다.
- 각 레이어 내에서는 선언 순서대로 평가하며 첫 번째 매칭이 적용된다.
- 규칙 파일이 존재하지 않으면 조용히 건너뛴다.

특정 파일에 어떤 규칙이 적용되는지 사전 확인:

```bash
ocr rules check src/main/java/com/example/UserService.java
ocr rules check --rule custom.json src/main/resources/mapper/UserMapper.xml
```

---

## 8. CI/CD 통합

### GitHub Actions

```yaml
# .github/workflows/code-review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install OCR
        run: npm install -g @alibaba-group/open-code-review

      - name: Run Code Review
        env:
          OCR_LLM_URL: https://api.anthropic.com/v1/messages
          OCR_LLM_TOKEN: ${{ secrets.ANTHROPIC_API_KEY }}
          OCR_LLM_MODEL: claude-sonnet-4-6
          OCR_USE_ANTHROPIC: "true"
        run: |
          ocr review \
            --from "origin/${{ github.base_ref }}" \
            --to "origin/${{ github.head_ref }}" \
            --format json \
            --audience agent
```

### GitLab CI

```yaml
# .gitlab-ci.yml
code-review:
  stage: test
  image: node:20
  before_script:
    - npm install -g @alibaba-group/open-code-review
  script:
    - ocr review
        --from "origin/${CI_MERGE_REQUEST_TARGET_BRANCH_NAME}"
        --to "origin/${CI_MERGE_REQUEST_SOURCE_BRANCH_NAME}"
        --format json
        --audience agent
  variables:
    OCR_LLM_URL: "https://api.openai.com/v1/chat/completions"
    OCR_LLM_TOKEN: $OPENAI_API_KEY
    OCR_LLM_MODEL: "gpt-4o"
    OCR_USE_ANTHROPIC: "false"
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

### 범용 CI 스크립트 패턴

```bash
ocr review \
  --from "origin/main" \
  --to "origin/feature-branch" \
  --format json \
  --audience agent
```

`--format json` + `--audience agent` 조합은 CI 스크립트에서 파싱 가능한 구조화된 출력을 반환한다. GitHub Marketplace에도 Actions로 게시되어 있다.

---

## 9. AI 에이전트 통합 (Claude Code / Codex)

OCR을 AI 코딩 에이전트의 슬래시 커맨드로 통합하면 에이전트 워크플로 내에서 직접 코드 리뷰를 실행할 수 있다.

### 방법 1: Skill로 설치

```bash
npx skills add alibaba/open-code-review --skill open-code-review
```

코딩 에이전트가 `ocr`을 호출하는 방법, 이슈 우선순위 분류, 자동 수정 옵션을 학습한다.

### 방법 2: Claude Code 플러그인 설치

Claude Code 내에서 다음 명령어를 실행한다:

```
/plugin marketplace add alibaba/open-code-review
/plugin install open-code-review@open-code-review
```

설치 후 `/open-code-review:review` 슬래시 커맨드로 OCR을 실행하고, 이슈 자동 필터링 및 수정까지 처리한다.

### 방법 3: 커맨드 파일 직접 복사

패키지 매니저 없이 빠르게 설정하는 방법이다.

```bash
# 프로젝트 단위 (팀 공유, git 커밋 가능)
mkdir -p .claude/commands
curl -o .claude/commands/open-code-review.md \
  https://raw.githubusercontent.com/alibaba/open-code-review/main/plugins/open-code-review/commands/review.md

# 사용자 단위 (전체 프로젝트에서 개인 사용)
mkdir -p ~/.claude/commands
curl -o ~/.claude/commands/open-code-review.md \
  https://raw.githubusercontent.com/alibaba/open-code-review/main/plugins/open-code-review/commands/review.md
```

### OpenAI Codex 통합

```bash
# Codex 플러그인 마켓플레이스에서 설치
codex plugin marketplace add alibaba/open-code-review
codex /plugins
```

설치 후 Codex에서 다음과 같이 사용한다:

```
@Open Code Review review my current changes
@Open Code Review review this branch against main
@Open Code Review review and fix high-confidence issues
```

> 모든 통합 방법의 전제 조건: `ocr` CLI 설치 + LLM 설정 완료가 필요하다. OCR의 내부 LLM 백엔드는 에이전트 통합 방식과 무관하게 독립적으로 동작한다.

---

## 10. 설정 레퍼런스 전체

설정 파일 경로: `~/.opencodereview/config.json`

### 설정 키 목록

| 키 | 타입 | 예시 | 설명 |
|---|---|---|---|
| `llm.url` | string | `https://api.openai.com/v1/chat/completions` | LLM API 엔드포인트 |
| `llm.auth_token` | string | `sk-xxxxxxx` | API 키 / 인증 토큰 |
| `llm.model` | string | `claude-opus-4-6` | 모델 이름 |
| `llm.use_anthropic` | boolean | `true` / `false` | Anthropic 네이티브 API 여부 |
| `language` | string | `English` / `Chinese` | 리뷰 출력 언어 (기본값: Chinese) |
| `telemetry.enabled` | boolean | `true` / `false` | 텔레메트리 활성화 |
| `telemetry.exporter` | string | `console` / `otlp` | 텔레메트리 내보내기 방식 |
| `telemetry.otlp_endpoint` | string | `localhost:4317` | OTLP 수집기 주소 |
| `telemetry.content_logging` | boolean | — | 텔레메트리에 LLM 프롬프트 포함 여부 |

### 환경 변수 목록

환경 변수는 설정 파일보다 높은 우선순위를 가진다.

| 환경 변수 | 설명 |
|---|---|
| `OCR_LLM_URL` | LLM API 엔드포인트 URL |
| `OCR_LLM_TOKEN` | API 키 / 인증 토큰 |
| `OCR_LLM_MODEL` | 모델 이름 |
| `OCR_USE_ANTHROPIC` | `true` = Anthropic, `false` = OpenAI 호환 |

Claude Code 환경 변수(`ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_MODEL`)도 자동 인식한다.

### 리뷰 출력 언어 변경

기본 출력 언어는 중국어다. 한국어 또는 영어로 변경하려면:

```bash
ocr config set language English
# 또는
ocr config set language Korean
```

### 텔레메트리 설정 (OpenTelemetry)

```bash
ocr config set telemetry.enabled true
ocr config set telemetry.exporter otlp
ocr config set telemetry.otlp_endpoint localhost:4317
```

`telemetry.content_logging`을 활성화하면 LLM 프롬프트와 응답이 내보내기 데이터에 포함된다. 기본값은 비활성화다.

---

## 11. 장점 및 단점 분석

### 장점

**대규모 검증 (Battle-tested)**

2만 명 이상의 알리바바 내부 개발자가 2년간 사용하며 100만 건 이상의 결함을 탐지했다. SaaS가 아닌 CLI 도구이므로 코드와 데이터가 외부로 유출되지 않아 엔터프라이즈 보안 요구사항을 충족한다. 로컬 LLM과 결합하면 완전한 Air-gap 환경 구성도 가능하다.

**경제성 및 하이브리드 설계**

순수 LLM 에이전트 대비 토큰 사용량을 80% 절감한다. 일반 AI 코드 리뷰의 세 가지 고질적 문제(불완전한 커버리지, 위치 이탈, 품질 불안정)를 결정적 엔지니어링 레이어에서 구조적으로 해결했다.

**유연한 모델 지원**

OpenAI, Anthropic, DeepSeek, DashScope(Qwen), Ollama 등 OpenAI 호환 엔드포인트를 노출하는 모든 런타임을 지원한다. 클라우드와 로컬 LLM을 자유롭게 교체할 수 있다.

**CI/CD 및 에이전트 생태계 통합**

GitHub Actions, GitLab CI 예제를 공식 제공한다. Claude Code, Codex 등 주요 AI 코딩 에이전트와 플러그인/스킬/커맨드 방식으로 통합된다.

### 단점 및 고려사항

**LLM API 비용**

도구 자체는 Apache 2.0으로 무료이나 백엔드 LLM API 비용은 사용자 부담이다. 로컬 LLM으로 이 비용을 제거할 수 있으나 하드웨어 요구사항이 따른다.

**초기 환경 설정**

Claude Code 기존 사용자는 환경 변수를 자동 인식하므로 설정이 불필요하다. 그러나 신규 사용자는 LLM API 키, 엔드포인트, 모델 설정 과정을 거쳐야 한다. 로컬 LLM 사용 시 Ollama 설치 및 모델 다운로드(수 GB)가 추가로 필요하다.

**비즈니스 로직 한계**

내장 규칙과 커스텀 규칙으로 상당 부분 보완 가능하지만, 팀 고유의 비즈니스 로직이나 도메인 특화 컨벤션을 완벽히 이해하지는 못한다. 규칙 파일에 팀 특화 지침을 지속적으로 추가해나가는 운영이 필요하다.

**AI의 근본적 한계**

고차원적인 아키텍처 설계 적합성과 비즈니스 요구사항의 완전한 부합 여부는 사람의 판단을 대체하기 어렵다. OCR은 리뷰어의 부담을 줄이는 보조 도구이지, 완전한 대체재가 아니다.

---

## 12. 모델 선택 가이드

| 상황 | 권장 모델 | 이유 |
|---|---|---|
| 최고 품질 리뷰, 비용 여유 있음 | Claude Opus 4.6 (클라우드) | 복잡한 컨텍스트 이해 및 아키텍처 분석 |
| 일상적 PR 리뷰, 비용 균형 | Claude Sonnet 4.6 또는 GPT-4o | 성능·비용 균형 |
| 코드 완전 외부 유출 불가 | Qwen2.5-Coder 32B (Ollama) | 로컬 실행, HumanEval 92.1% |
| 복잡한 보안 취약점 분석 | DeepSeek-R1 (로컬 또는 클라우드) | 추론 특화 아키텍처 |
| 비용 최소화 (클라우드) | DeepSeek Coder API | 코드 특화 + 낮은 API 단가 |
| 경량 로컬 환경 (8GB VRAM 이하) | Qwen2.5-Coder 7B | 빠른 응답, 낮은 하드웨어 요구 |
| GPU 서버 최고 품질 | DeepSeek Coder V2 236B | HumanEval 95.7% (오픈소스 최고) |

---

## 13. 적합한 팀 유형

**대규모 코드베이스 운영 조직**

많은 파일이 동시에 변경되는 PR에서도 스마트 번들링과 파일 선택 로직이 누락 없이 전체를 커버한다. 범용 에이전트 대비 누락률이 구조적으로 낮다.

**보안 취약점 대응이 중요한 팀**

NPE, SQL Injection, XSS, Thread-Safety 등 고위험 결함을 리뷰 초기 단계에서 차단한다. 로컬 LLM과 결합하면 코드가 외부로 나가지 않는 완전 프라이빗 환경을 구성할 수 있다.

**AI 도입 비용에 민감한 팀**

80% 토큰 절감은 동일 예산으로 커버할 수 있는 리뷰 규모를 5배 늘린다. DeepSeek 클라우드 API나 Qwen 로컬 모델을 활용하면 비용을 추가로 절감할 수 있다.

**기존 리뷰 프로세스에 AI를 결합하려는 팀**

OCR이 NPE, 보안 취약점, 코딩 컨벤션 위반을 1차 필터링하면, 사람 리뷰어는 아키텍처 설계와 비즈니스 로직 검토에 집중할 수 있다.

---

## 참고 자료

- [GitHub 저장소](https://github.com/alibaba/open-code-review)
- [공식 문서 사이트](https://alibaba.github.io/open-code-review/)
- [GitHub Marketplace (Actions)](https://github.com/marketplace?q=open-code-review)
- [디지털투데이 — 토큰 사용량 80% 절감 소개](https://digitaltoday.co.kr) (2026.6.8)
- [Gigazine — 내부 성능 벤치마크 결과 보도](https://gigazine.net) (2026.6.7)
