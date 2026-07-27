<!--
---
title: "Goose 리뷰 — Linux Foundation AAIF 산하 오픈소스 AI 에이전트"
title_en: "Goose Review — Open-Source AI Agent under Linux Foundation AAIF"
subtitle: "범용 로컬 에이전트 런타임. 거버넌스 중립, Apache 2.0, 데스크톱·CLI·API"
description: "Block에서 시작해 Linux Foundation AAIF로 이관된 goose의 컨셉, 권한 모드, 장단점, OpenWorker·OpenHands 대비 포지셔닝, 설치·도입 체크리스트 TechDoc."
abstract: |
  goose는 Block에서 시작해 2026-04-07 Linux Foundation Agentic AI Foundation에 기증된 Apache 2.0 로컬 AI 에이전트다.
  Rust 구현, 데스크톱·CLI·임베더블 API, 70+ MCP 확장, ACP 지원이 핵심이다.
  기본 권한 모드가 Completely Autonomous이며 서브에이전트는 자율 모드에서만 동작한다 — 성능을 쓰려면 승인 게이트를 꺼야 하는 구조적 트레이드오프가 가장 큰 유의점이다.
summary_for_ai: |
  Third-party tech review of github.com/aaif-goose/goose (51.7k stars, ~5130 commits as of ~2026-07-27).
  Apache 2.0, AAIF/Linux Foundation governance. Rust Cargo workspace. Modes: Completely Autonomous (default), Smart Approval, Manual Approval, Chat Only.
  Subagents only in autonomous mode. Closest peers: OpenWorker (knowledge work), OpenHands (orchestration).
  Not investment advice. Verify current stars and install paths before citing.
date: 2026-07-27
updated: 2026-07-27
author: "김호광 (Dennis Kim)"
lang: ko
tags: [goose, AAIF, Linux Foundation, AI Agent, LLM, MCP, ACP, 오픈소스]
keywords: ["goose AI agent", "AAIF goose", "Linux Foundation agent", "local AI agent", "MCP extensions", "Goose vs OpenWorker"]
group: llm-agents
featured: true
featured_rank: 6
schema_type: TechArticle
draft: false
robots: index,follow
---
-->

# Goose, Linux Foundation 산하로 이관된 오픈소스 AI 에이전트

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | goose |
| 개발 | Block(Square, Cash App, Tidal 모회사)에서 시작, 현재 Agentic AI Foundation(AAIF) 산하 |
| 거버넌스 이관 | 2026년 4월 7일, Linux Foundation AAIF에 기증 (MCP, AGENTS.md와 동일 재단) |
| 라이선스 | Apache 2.0 |
| 저장소 | github.com/aaif-goose/goose (구 block/goose에서 이전) |
| 저장소 규모 | 스타 51.7k, 포크 5.7k, 커밋 5,130건, 오픈 이슈 225건, 오픈 PR 180건 |
| 문서 | goose-docs.ai |
| 구현 언어 | Rust (Cargo 워크스페이스) |
| 지원 OS | macOS (Apple Silicon/Intel), Linux (DEB 등), Windows |
| 제공 형태 | 데스크톱 앱, CLI, 임베더블 API |

---

## 1. 컨셉

goose의 명제는 "코드 제안을 넘어서는 범용 로컬 에이전트"다. 코딩 도구로 출발했지만 현재 포지셔닝은 리서치, 문서 작성, 자동화, 데이터 분석까지 포괄하는 general-purpose agent이며, 특정 벤더가 아니라 Linux Foundation 산하 재단이 거버넌스를 쥐고 있다는 점이 다른 모든 경쟁 프로젝트와 갈리는 지점이다.

동작 흐름은 다음과 같다.

| 단계 | 내용 |
| --- | --- |
| 1 | 세션 시작 (데스크톱 앱, CLI, 또는 API 임베드) |
| 2 | 자연어 지시 입력. goose가 계획을 세우고 도구 호출로 분해 |
| 3 | 모든 도구 호출이 ToolInspectionManager를 통과. Security 인스펙터, Egress 인스펙터가 스택 형태로 검사 |
| 4 | 활성 권한 모드에 따라 자동 승인, 사용자 승인 대기, 또는 차단 |
| 5 | 필요 시 서브에이전트를 스폰해 병렬 처리 후 결과 수렴 |

### 아키텍처

```
goose Desktop (Electron/네이티브 셸)  |  goose CLI  |  Embeddable API
                    |
              goose-server (goosed)     로컬 백엔드 데몬
                    |
                goose (core)            에이전트 루프, 프로바이더, 권한, 세션
                    |
        goose-mcp  |  외부 MCP 서버  |  ACP 프로바이더
                    |
   로컬 파일 · 셸 · 70+ 확장 · 15+ 모델 프로바이더
```

Cargo 워크스페이스가 `goose`(코어), `goose-cli`, `goose-server`, `goose-mcp` 크레이트로 분리돼 있어 CLI와 데스크톱 앱이 동일한 코어를 공유한다. 설정은 `~/.config/goose/config.yaml` 하나로 CLI와 데스크톱이 공용한다.

### 권한 모델

세션 단위 모드(GooseMode)와 도구 단위 권한이 이중으로 걸린다.

| 모드 | 동작 | 서브에이전트 |
| --- | --- | --- |
| Completely Autonomous | 승인 없이 전량 자동 실행. 기본값 | 사용 가능 |
| Smart Approval | LLM 기반 PermissionJudge 분류기가 위험도를 판정해 선별 승인 | 사용 불가 |
| Manual Approval | 모든 도구 호출에 사용자 확인 | 사용 불가 |
| Chat Only | 도구 접근 자체를 차단. 시스템 프롬프트에 무도구 상태를 주입 | 사용 불가 |

Smart Approval은 MCP 표준의 `ToolAnnotations.read_only_hint` 필드를 읽어 read-only가 아닌 도구를 자동으로 승인 대기 목록에 넣는다. 모드 우선순위는 설정 파일보다 런타임 오버라이드가 높으며, CLI에서는 `/mode approve` 같은 슬래시 명령, 데스크톱에서는 UI 토글로 즉시 전환된다.

### AdversaryInspector

`~/.config/goose/adversary.md` 파일을 두면 활성화되는 별도 검사 계층이다. 프런트매터로 검사 대상 도구를 지정하고(기본값은 `shell`과 `computercontroller__automation_script`), 구분자 아래에 자연어 규칙을 쓰면 LLM이 해당 도구 호출을 실행 직전에 판정한다. 데이터 유출성 명령이나 파괴적 명령을 차단하고 통상적 개발 작업은 통과시키는 식의 정책 서술이 가능하다.

---

## 2. 장점

| 구분 | 내용 |
| --- | --- |
| 거버넌스 중립성 | Linux Foundation AAIF 산하. 단일 기업의 상업적 판단에 프로젝트 방향이 좌우되지 않는다. 기업 도입 시 벤더 리스크 평가에서 가장 큰 가산점 |
| 라이선스 | Apache 2.0. AGPL 계열과 달리 소스 공개 의무 없이 임베드·재배포·상용 활용 가능. 자사 제품에 에이전트를 내장하려는 기업에 실질적 차이 |
| 성숙도 | 커밋 5,130건, 스타 51.7k, 포크 5.7k, 기여자 수백 명 규모. 초기 프로젝트가 아니라 이미 프로덕션 트랙 |
| 3개 OS 전면 지원 | macOS, Linux, Windows 데스크톱 앱 모두 정식 배포. Linux 지원은 경쟁 제품 대비 희소한 강점 |
| 표면 다양성 | 데스크톱 앱, CLI, 임베더블 API 세 가지. 대화형 작업과 CI/CD 무인 실행을 같은 코어로 처리 |
| ACP 지원 | Agent Client Protocol 구현. Zed, JetBrains, VS Code에서 goose를 ACP 서버로 붙일 수 있고, 반대로 기존 Claude Code나 Codex 구독을 프로바이더로 재활용할 수 있다. 신규 API 과금 없이 보유 구독을 소진하는 경로 |
| 모델 유연성 | 15개 이상 프로바이더. Anthropic, OpenAI, Google, Azure, Bedrock, OpenRouter, Ollama 등. 로컬 완전 실행 가능 |
| 확장 생태계 | 공식 레지스트리에 70개 이상 MCP 확장. 임의 MCP 서버 연결도 가능 |
| 서브에이전트 | 세션당 병렬 서브에이전트 스폰. 각 서브에이전트가 부모와 다른 프로바이더를 쓸 수 있어 저비용 모델로 위임하는 비용 최적화 패턴 구성 가능 |
| Recipes + Scheduler | YAML 레시피로 시스템 지시, 확장 목록, 응답 스키마, 재시도 정책을 고정하고 cron 스케줄로 반복 실행. URL 공유와 Recipe Cookbook 제공 |
| 보안 계층의 다층화 | 권한 모드, 도구별 권한, 프롬프트 인젝션 탐지, 샌드박스 모드, AdversaryInspector가 각각 독립 계층으로 존재 |
| Custom Distros | 프로바이더, 확장, 브랜딩을 미리 박은 사내 전용 배포판 빌드를 공식 지원. 조직 배포에 실질적으로 필요한 기능 |
| Rust 구현 | 네이티브 성능, 낮은 리소스 점유, 런타임 의존성 최소화 |

---

## 3. 단점 및 유의점

| 구분 | 내용 |
| --- | --- |
| 기본값이 자율 모드 | 기본 권한 모드가 Completely Autonomous다. 셸과 파일 접근을 가진 에이전트의 안전 기본값으로는 공격적이며, 조직 배포 시 반드시 재설정해야 할 항목 |
| 안전성과 병렬성의 배타적 트레이드오프 | 서브에이전트는 자율 모드에서만 동작한다. 즉 병렬 처리 성능을 쓰려면 승인 게이트를 전부 꺼야 한다. 구조적 결함에 가까운 설계이며, 실무에서 사용자가 안전 장치를 끄는 쪽으로 몰릴 유인이 크다 |
| LLM 의존 방어 | Smart Approval의 PermissionJudge도, AdversaryInspector도 판정 주체가 LLM이다. 방어 계층 자체가 프롬프트 인젝션의 표적이 되며, 결정론적 보증이 없다. 감사 대상 통제로 제출하기 어려운 형태 |
| read_only_hint 신뢰 문제 | Smart Approval이 참조하는 read-only 여부는 MCP 서버가 자기 자신에 대해 선언하는 값이다. 악의적이거나 부주의한 서버가 쓰기 도구를 read-only로 선언하면 자동 승인 경로로 빠진다. 확장 공급망 검증 책임이 전적으로 사용자에게 있다 |
| 네이티브 커넥터 부재 | Slack, Jira, Gmail 같은 업무 도구는 전부 별도 MCP 서버 설치와 개별 인증을 거쳐야 한다. 70개 확장이라는 숫자는 생태계 규모이지 즉시 사용 가능한 커넥터 수가 아니다. 초기 설정 비용이 상당하다 |
| 개발자 편향 | 문서, 퀵스타트, 레시피 예제 대부분이 코딩 시나리오다. 범용 에이전트를 표방하지만 비개발자 온보딩 경로는 약하다 |
| 산출물 지향 아님 | 문서나 스프레드시트를 파일로 뱉는 것은 확장과 프롬프트에 달려 있다. 결과물 포맷을 제품 차원에서 보장하지 않는다 |
| 컴플라이언스 미비 | SOC 2, HIPAA 등 인증이 없다. 규제 산업에서 인증 벤더를 요구하는 경우 그 자체로 탈락 조건 |
| 비용 관리 | BYOK 구조라 앱은 무료지만 모델 요금은 전액 사용자 부담. 서브에이전트 병렬 스폰은 토큰 소모를 급격히 늘린다. 프로바이더 콘솔에서 한도 설정이 사실상 필수 |
| 유지보수 적체 | 오픈 이슈 225건, 오픈 PR 180건. 활발함의 지표인 동시에 리뷰 병목의 지표이기도 하다 |
| 소스 빌드 부담 | Rust 워크스페이스 전체 빌드는 시간과 디스크를 크게 소모한다. 바이너리 배포 사용이 사실상 기본 경로 |
| 온보딩 경로의 상업적 유인 | 퀵스타트가 Tetrate Agent Router를 권장 경로로 안내하고 무료 크레딧을 제시한다. 재단 프로젝트로서 중립성 문제라기보다는, 기본 경로가 특정 라우팅 서비스를 경유한다는 점을 인지하고 시작할 필요가 있다 |

---

## 4. 유사 및 경쟁 프로젝트

| 프로젝트 | 라이선스 | 성격 | goose 대비 |
| --- | --- | --- | --- |
| OpenWorker (Andrew Ng, Rohit Prasad) | MIT | 지식노동자용 로컬 데스크톱 에이전트. 25+ 네이티브 커넥터, 산출물 파일 반환 | 업무 도구 즉시 연동과 승인 게이트의 타입화가 강점. 대신 오픈 베타 초기 단계이고 Linux 미지원, 생태계 규모가 goose의 수백분의 일 |
| OpenHands (All Hands AI) | MIT | 코딩 자율 에이전트. Docker 샌드박스, SDK·CLI·클라우드, Kubernetes 배포 | 격리 실행과 SWE-bench 성능이 강점. 범용 업무보다 이슈 해결 특화. goose보다 무겁고 인프라 요구가 크다 |
| Claude Code | 상용 | Anthropic 공식 CLI 에이전트 | 단일 모델 최적화로 완성도 높음. 모델 선택권과 로컬 데이터 통제가 없음. goose에서 ACP 프로바이더로 역이용 가능 |
| Cline / Kilo Code | 오픈소스 | VS Code, JetBrains 내장 IDE 에이전트 | IDE 워크플로 밀착. 터미널·자동화·스케줄 영역은 goose 우위 |
| Aider | Apache 2.0 | 터미널 우선, Git 커밋 직결 | 단일 목적 도구로서 성숙. 확장 생태계와 GUI 없음 |
| OpenCode | 오픈소스 | 터미널 우선, 기존 구독 재활용 | 경량. 데스크톱 앱과 스케줄러 없음 |
| Open Interpreter | Apache 2.0 | CLI 로컬 코드 실행 에이전트 | 더 원시적. MCP 생태계와 권한 계층이 없음 |
| n8n / Dify | 혼합(n8n은 제한적 라이선스) | 워크플로 오케스트레이션 | 사전 정의 플로우 실행. goose의 레시피가 더 에이전틱하지만 시각적 편집과 관리 UI는 열세 |
| Manus | 상용 | 크레딧 기반 자율 태스크 에이전트 | 완성된 제품 경험과 클라우드 실행. 오픈소스 아님 |

### 포지셔닝 요약

현시점 오픈소스 로컬 에이전트 카테고리의 사실상 기준점이다. 규모, 거버넌스, 라이선스, OS 커버리지, 표면 다양성 어느 축에서도 대안이 뚜렷하지 않다. OpenWorker가 "업무 산출물"이라는 UX 프레이밍으로, OpenHands가 "샌드박스와 벤치마크"로 각각 좁은 우위를 주장하는 구도이며, goose는 그 사이에서 범용 플랫폼 자리를 점유하고 있다.

다만 플랫폼으로 커진 대가로 안전 기본값이 느슨해졌다. 자율 모드 기본값과 서브에이전트의 모드 제약은 "성능을 쓰려면 방어를 끄라"는 선택을 강요하는 구조이고, 이 지점이 규제 환경 도입에서 가장 먼저 걸린다.

---

## 5. Getting Started

### 5.1 데스크톱 앱 설치

| OS | 방법 |
| --- | --- |
| macOS (Apple Silicon) | 릴리스의 `Goose.zip` 다운로드 후 압축 해제, 실행 파일 구동 |
| macOS (Intel) | 릴리스의 `Goose_intel_mac.zip` 동일 절차 |
| Linux (Debian/Ubuntu 계열) | DEB 파일 다운로드 후 `sudo dpkg -i (filename).deb`, 앱 메뉴에서 실행 |
| Windows | ZIP 다운로드 후 압축 해제, 실행 파일 구동 |

다운로드 경로는 goose-docs.ai/docs/getting-started/installation 에 정리돼 있다.

### 5.2 CLI 설치

```bash
curl -fsSL https://github.com/aaif-goose/goose/releases/download/stable/download_cli.sh | bash
```

Windows는 `download_cli.ps1`을 사용한다. 설치 후 PATH 경고가 나오면 `goose configure` 실행 전에 PATH 등록이 필요하다. Windows에서 키링 오류가 발생하면 키링 저장을 끄고 진행한다.

파이프-투-셸 설치가 조직 정책상 부적합하다면 스크립트를 먼저 내려받아 검토한 뒤 실행하는 편이 낫다.

### 5.3 프로바이더 설정

```bash
goose configure
```

메뉴 구조:

```
◆ What would you like to configure?
  ● Configure Providers      프로바이더 변경 및 자격증명 갱신
  ○ Add Extension
  ○ Toggle Extensions
  ○ Remove Extension
  ○ goose settings
```

프로바이더 목록에는 Amazon Bedrock, Amazon SageMaker TGI, Anthropic, Azure OpenAI, ChatGPT Codex, Claude Code CLI, Tetrate Agent Router 등이 포함된다. GitHub Copilot은 API 키가 아니라 인증 코드 방식으로 붙는다.

데스크톱 앱은 첫 실행 시 웰컴 화면에서 API 키 직접 입력, ChatGPT 구독 연동, Tetrate Agent Router, OpenRouter 중 선택하게 한다.

### 5.4 완전 로컬 구성 (Ollama)

```bash
ollama pull qwen3

# ~/.config/goose/config.yaml
# GOOSE_PROVIDER: ollama
# GOOSE_API_BASE: http://localhost:11434
```

외부 전송이 발생하지 않는 유일한 구성이다. 다만 다단계 도구 호출 정확도는 별도 검증이 필요하며, 서브에이전트 병렬 실행 시 로컬 하드웨어가 병목이 된다.

### 5.5 세션과 확장

```bash
goose                       # 새 세션 시작
goose session -r            # 직전 세션 이어서 진행
goose run --no-session -t "<task>"   # 헤드리스 단발 실행 (CI/CD)
```

확장 추가는 `goose configure` > `Add Extension` > `Built-in Extension` 경로로 진행한다. 예를 들어 웹 스크래핑과 브라우저 제어가 필요하면 `Computer Controller` 확장을 활성화하고 타임아웃을 300초로 설정한다.

### 5.6 권한 모드 전환

```
/mode auto        완전 자율
/mode smart       위험도 기반 선별 승인
/mode approve     전건 수동 승인
/mode chat        도구 차단
```

조직 배포 시 기본값을 `smart` 또는 `approve`로 강제하는 것을 권장한다. 다만 이 경우 서브에이전트가 비활성화된다는 점을 사전에 공지해야 한다.

### 5.7 컨텍스트와 레시피

| 대상 | 파일 및 위치 | 용도 |
| --- | --- | --- |
| 프로젝트 힌트 | `.goosehints` | 프로젝트별 컨벤션, 금지사항, 빌드 방법 등을 세션에 상시 주입 |
| 에이전트 지침 | `AGENTS.md` | 표준 포맷 기반 에이전트 지시문 |
| 적대적 검사 규칙 | `~/.config/goose/adversary.md` | shell 등 고위험 도구 호출에 대한 LLM 판정 규칙 |
| 레시피 | YAML | 시스템 지시, 태스크 프롬프트, 확장 목록, 응답 스키마, 재시도 정책 |
| 전역 설정 | `~/.config/goose/config.yaml` | 프로바이더, 확장, 모드. CLI와 데스크톱 공용 |

레시피는 Recipe Cookbook에서 기성품을 가져다 쓸 수 있고, Recipe Generator와 Deeplink Generator로 생성·공유할 수 있다. Scheduler와 결합하면 cron 주기로 무인 실행된다.

### 5.8 소스 빌드

사전 요구사항: Rust 툴체인(`rust-toolchain.toml` 고정), Node (UI 빌드), Just

```bash
git clone https://github.com/aaif-goose/goose
cd goose

just                # Justfile 태스크 목록 확인
cargo build          # 워크스페이스 빌드
```

기존 클론이 `block/goose`를 가리키고 있다면 리모트를 갱신해야 한다.

```bash
git remote set-url origin git@github.com:aaif-goose/goose.git
```

Docker 빌드는 `BUILDING_DOCKER.md`, Linux 빌드는 `BUILDING_LINUX.md`, Nix 사용자는 `flake.nix`를 참조한다.

### 5.9 저장소 구조

| 경로 | 내용 |
| --- | --- |
| `crates/goose` | 코어 에이전트 로직, 프로바이더, 권한, 세션, 서브에이전트 |
| `crates/goose-cli` | 커맨드라인 인터페이스 |
| `crates/goose-server` | 데스크톱 앱 백엔드 데몬 (goosed) |
| `crates/goose-mcp` | 내장 MCP 서버 구현체 |
| `ui/` | 데스크톱 앱 프런트엔드 |
| `documentation/` | 공식 문서 소스 |
| `evals/harbor` | 평가 하네스 |
| `recipe-scanner/` | 레시피 정적 검사 도구 |
| `oidc-proxy/` | OIDC 프록시 |
| `workflow_recipes/` | 릴리스 리스크 체크 등 워크플로 레시피 예시 |

### 5.10 도입 전 점검 항목

| 점검 | 판단 기준 |
| --- | --- |
| 기본 권한 모드 | 배포 이미지에서 반드시 autonomous 이외 값으로 고정. Custom Distros 기능으로 강제 가능 |
| 서브에이전트 정책 | 병렬 처리 필요 여부와 승인 게이트 유지 중 무엇이 우선인지 사전 결정 |
| 확장 화이트리스트 | 사용 가능한 MCP 서버 목록을 조직 차원에서 고정. read_only_hint를 신뢰 근거로 삼지 말 것 |
| AdversaryInspector 규칙 | 데이터 유출성 명령 차단 규칙을 표준 템플릿으로 배포. 단, LLM 판정이므로 최종 방어선으로 간주하지 말 것 |
| 셸 접근 범위 | 개발자 확장의 접근 통제 설정으로 작업 디렉터리를 제한 |
| 비용 상한 | 프로바이더 콘솔에서 한도 선설정. 서브에이전트 병렬 스폰 시 소모량이 비선형으로 증가 |
| 컴플라이언스 | 인증 벤더가 요구되는 환경이라면 도입 불가. 자체 감사 체계로 대체 가능한지 먼저 확인 |
| 로그와 감사 | 세션 트랜스크립트 보관 정책과 민감정보 마스킹 방안을 별도 설계 |

---

## 참고

- 저장소: https://github.com/aaif-goose/goose
- 문서: https://goose-docs.ai/
- 퀵스타트: https://goose-docs.ai/docs/quickstart
- AAIF 이관 공지: https://goose-docs.ai/blog/2026/04/07/goose-moves-to-aaif/
- 재단: https://aaif.io/projects/goose
- 거버넌스: https://github.com/aaif-goose/goose/blob/main/GOVERNANCE.md
- 커스텀 배포판: https://github.com/aaif-goose/goose/blob/main/CUSTOM_DISTROS.md

#goose #AAIF #LinuxFoundation #AI에이전트 #OpenSource #MCP #ACP #업무자동화 #LLM
