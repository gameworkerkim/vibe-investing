# Orca Getting Started — 멀티 AI 에이전트 오케스트레이션 가이드

| 항목 | 내용 |
|---|---|
| 제품명 | Orca (Agent Development Environment, ADE) |
| 개발사 | Stably AI (Y Combinator 포트폴리오) |
| 라이선스 | MIT (오픈소스, 무료) |
| 지원 플랫폼 | macOS / Windows / Linux + iOS / Android 컴패니언 앱 |
| 저장소 | github.com/stablyai/orca |
| 공식 문서 | onorca.dev/docs |
| 핵심 개념 | 여러 CLI 코딩 에이전트를 격리된 git worktree에서 병렬 실행하고, 결과를 비교·병합하는 데스크톱 컨트롤 플레인 |

---

## 1. Orca란 무엇인가?

Orca는 Claude Code, Codex, OpenCode, Cursor CLI, Gemini CLI 등 터미널 기반 AI 코딩 에이전트를 **한 화면에서 병렬로 지휘하는 오케스트레이터**다. 기존 IDE에 AI를 얹은 것이 아니라, 처음부터 "에이전트 함대(fleet) 운용"을 전제로 설계된 ADE(Agent Development Environment)다.

핵심 아이디어는 단순하다.

1. 하나의 개발 요청을 여러 에이전트에게 동시에 뿌린다 (Fan-out)
2. 각 에이전트는 자기만의 `git worktree`에서 격리되어 작업한다
3. 완료되면 Diff를 나란히 놓고 비교한 뒤, 가장 좋은 결과만 병합한다 (Merge the winner)

주의: Orca는 Cursor의 대체재가 아니다. Cursor CLI조차 Orca 안에서 돌아가는 에이전트 중 하나다. Orca가 대체하는 것은 "터미널 탭 5개를 띄워놓고 수동으로 관리하던 기존 워크플로우"다.

---

## 2. 사전 준비물

Orca 자체는 로그인이나 API 키 등록이 필요 없다. 대신 **사용할 에이전트 CLI가 먼저 설치·인증되어 있어야 한다.** Orca는 API를 프록시하거나 재판매하지 않으며, 각 에이전트가 사용자 머신에서 직접 프로바이더를 호출한다.

| 준비물 | 확인 방법 | 비고 |
|---|---|---|
| Git 2.5 이상 | `git --version` | worktree 기능 필수 |
| 사용할 에이전트 CLI 1개 이상 | `claude --version`, `codex --version` 등 | Claude Code, Codex, OpenCode, Gemini CLI, Cursor CLI 등 터미널에서 도는 것이면 무엇이든 가능 |
| 각 에이전트 인증 완료 | 터미널에서 단독 실행이 정상 작동하는지 | 예: `claude` 실행 후 로그인 완료 상태 |
| 작업할 Git 저장소 | 로컬 클론 또는 GitHub 저장소 | worktree 기반이므로 Git 저장소가 전제 |

비용 구조: Orca는 무료지만, 내부에서 도는 에이전트의 구독료(Claude Pro/Max, ChatGPT Plus 등) 또는 API 사용료는 각자 부담이 발생한다.

---

## 3. 설치

### macOS (Homebrew)

```bash
brew install --cask stablyai/orca/orca
```

주의: `brew install --cask orca`(tap 경로 생략)는 동작하지 않는다. 반드시 `stablyai/orca/orca` 전체 경로를 사용한다.

### Arch Linux (AUR)

```bash
yay -S stably-orca-bin
# 소스 빌드를 원하면: yay -S stably-orca-git
```

### Windows / 기타 Linux

- onorca.dev 또는 GitHub Releases(github.com/stablyai/orca/releases)에서 설치 파일 다운로드

### 모바일 컴패니언 앱

- iOS: App Store / TestFlight
- Android: GitHub Releases의 APK
- 데스크톱 앱과 페어링하면 에이전트 진행 상황 모니터링, 완료 알림 수신, 원격에서 후속 프롬프트 전송이 가능하다.

---

## 4. 초기 설정 (First Run)

1. **프로젝트 연결**: Orca 실행 후 로컬 Git 저장소를 추가한다. GitHub 연동을 설정하면 PR·이슈·프로젝트 보드를 앱 안에서 바로 탐색할 수 있다.
2. **에이전트 확인**: Orca는 시스템에 설치된 CLI 에이전트를 인식한다. 새 worktree를 만들 때 어떤 에이전트를 붙일지 선택하는 방식이다.
3. **알림 설정**: 에이전트가 작업을 마치거나 입력을 기다릴 때 데스크톱/모바일 알림을 받도록 설정한다. 병렬 운용에서는 이 기능이 사실상 필수다.
4. **(선택) 계정 전환/사용량 추적**: Claude·Codex의 사용량과 rate-limit 리셋 시각을 대시보드에서 확인하고, 복수 계정을 재로그인 없이 전환할 수 있다.

---

## 5. 핵심 워크플로우

### 5.1 기본 사이클: Fan-out → 격리 → 비교 → 병합

| 단계 | 동작 | 설명 |
|---|---|---|
| 1. Fan-out | 하나의 프롬프트를 여러 에이전트에 동시 전송 | 예: 동일한 버그 수정 요청을 Claude Code, Codex, OpenCode 3개에 병렬 발사 |
| 2. 격리 실행 | 각 에이전트가 독립된 git worktree + 전용 터미널에서 작업 | worktree는 같은 저장소를 공유하되 작업 디렉터리와 브랜치가 완전히 분리됨. 메인 브랜치는 오염되지 않음 |
| 3. 모니터링 | 라이브 상태 대시보드로 전 에이전트 상태 확인 | 작업 중 / 입력 대기 / 완료 상태가 한눈에 표시. 모바일 앱에서도 확인 가능 |
| 4. 비교 | 각 worktree의 Diff를 나란히 비교 | 특정 라인에 주석을 달아 에이전트에게 수정 피드백을 되돌려 보낼 수 있음 |
| 5. 병합 | 가장 좋은 결과를 선택해 메인 브랜치에 Merge | 나머지 worktree는 폐기 |

### 5.2 실전 시나리오

- **병렬 버그 수정**: 같은 버그를 3개 에이전트에게 동시에 맡기고, 실제로 동작하는 해결책만 병합
- **리스크 분산**: 한 모델이 잘못된 방향으로 코드를 짤 확률을 다중 시도로 헤지
- **GitHub/Linear 태스크 기반 작업**: PR, 이슈, Linear 티켓에서 바로 worktree를 열면 에이전트가 태스크 컨텍스트를 자동 수신
- **Design Mode (프론트엔드)**: 내장 Chromium 브라우저에서 UI 요소를 클릭하면 해당 요소의 HTML, CSS, 크롭 스크린샷이 에이전트 프롬프트에 자동 주입
- **원격 실행 (SSH worktree)**: 고사양 원격 서버에서 에이전트를 돌리면서 로컬에서 파일 편집·git·터미널을 그대로 사용. 자동 재접속과 포트 포워딩 지원
- **Orca CLI**: 터미널에서 프로젝트 추가, worktree 생성, 진행 체크포인트 게시 등 IDE 자체를 스크립트로 제어 가능

---

## 6. 장점

| 장점 | 상세 |
|---|---|
| 도구 통합 | 난립하는 CLI 에이전트(Claude Code, Codex, Gemini, Copilot, Cline 등 30종 이상)를 단일 UI에서 관리. "터미널에서 돌면 Orca에서 돈다" |
| 리스크 분산 | 동일 태스크 다중 시도 후 최선의 결과 선택. 단일 모델 의존 리스크 완화 |
| 완벽한 격리 | git worktree 기반으로 각 작업이 물리적으로 분리. 브랜치 저글링, stash 지옥 제거 |
| 코드 리뷰 환경 | Diff 시각화 + 라인 단위 주석 + 에이전트 피드백 루프 + 인앱 커밋 |
| 원격/모바일 | SSH 원격 worktree, 모바일 모니터링·조종. 자리를 비워도 에이전트 함대가 계속 일함 |
| 구독 친화적 | 사용자 보유 구독을 그대로 사용. 벤더 종속 없음. 사용량 추적과 계정 핫스왑 지원 |
| 오픈소스 | MIT 라이선스. 매일 릴리스되는 빠른 개발 속도 |

---

## 7. 단점 및 주의사항

| 단점 | 상세 |
|---|---|
| 진입 장벽 | git worktree 개념과 에이전트 CLI 사전 설정이 전제. "설치 즉시 코딩"이 되는 Cursor 대비 초기 러닝커브 존재 |
| UI/UX 미성숙 | 화면 분할을 작게 하면 터미널 입력창이 좁아지는 등 세부 마감이 아직 거친 부분 존재 |
| 간헐적 불안정 | 터미널 이스케이프 시퀀스 깨짐 등으로 재실행이 필요한 경우 발생 |
| 빠른 변화 자체가 리스크 | 초기 단계 제품으로 기능 표면이 매일 바뀜. 팀 표준 워크플로우가 업데이트에 흔들릴 수 있음 |
| 추가 비용 | Orca는 무료지만 에이전트 구독료/API 비용은 별도. 병렬 실행은 토큰 소모를 배수로 늘린다는 점에 유의 |
| 오버헤드 | 에이전트를 하나만, 한 번에 한 태스크만 쓰는 사용자에게는 순수 터미널보다 오히려 운영 부담 |

---

## 8. 경쟁 제품 비교

Orca의 포지션은 "Cursor의 대체재"가 아니라 "에이전트들 위의 관제탑"이다.

| 제품 | 유형 | Orca와의 차이 |
|---|---|---|
| Cursor / Windsurf | AI 내장 올인원 IDE | 설치 즉시 사용 가능하나, 다중 에이전트 병렬 실행·비교 기능 없음. Cursor CLI는 오히려 Orca 안에서 구동 가능 |
| Aider / Continue.dev | 오픈소스 단일 에이전트 도구 | 병렬 실행과 시각적 Diff 비교가 핵심이 아님 |
| Claude Squad | 터미널 TUI형 멀티 에이전트 매니저 | tmux 스타일 워크플로우 선호자용. 데스크톱 GUI·모바일·브라우저 통합은 없음 |
| Agent Deck | 터미널 세션 매니저 | 컨덕터·알림·MCP 소켓 풀링 중심. Orca보다 경량 |
| Paseo | 셀프호스팅 크로스디바이스 컨트롤 | 데스크톱 IDE 표면보다 웹/모바일/CLI 전방위 접근이 우선인 경우 |
| 순수 터미널 (Claude Code 단독 등) | 기본 워크플로우 | 한 번에 하나의 태스크만 돌린다면 오케스트레이션 자체가 불필요 |

결론: Orca의 최대 경쟁자는 여전히 개발자의 "기존 습관"이다. 다중 에이전트를 진지하게 운용하는 파워 유저에게는 강력하지만, 단일 에이전트 사용자에게는 오버 스팩이다.

---

## 9. 5분 퀵스타트 체크리스트

```text
[ ] git --version 으로 Git 2.5+ 확인
[ ] 에이전트 CLI 최소 1개 설치 및 로그인 완료 (예: claude)
[ ] brew install --cask stablyai/orca/orca (macOS)
[ ] Orca 실행 후 로컬 Git 저장소 추가
[ ] 새 worktree 생성 → 에이전트 선택 → 첫 프롬프트 전송
[ ] 두 번째 에이전트로 같은 프롬프트 Fan-out
[ ] Diff 비교 화면에서 두 결과 검토
[ ] 승자 병합, 패자 worktree 폐기
[ ] (선택) 모바일 앱 페어링 및 알림 활성화
```

---

## 10. 참고 링크

- 저장소: https://github.com/stablyai/orca
- 공식 사이트/문서: https://www.onorca.dev
- 릴리스: https://github.com/stablyai/orca/releases
- 커뮤니티: Discord, X(@orca_build)

---

*작성일: 2026-07-15. Orca는 매일 릴리스되는 프로젝트로, 세부 기능은 changelog 기준으로 재확인을 권장한다.*
