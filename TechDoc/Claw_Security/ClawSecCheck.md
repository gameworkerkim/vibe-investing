# ClawSecCheck 프로젝트 분석과 Getting Start

> 기준: 공식 저장소 `github.com/gl0di/clawseccheck`, 최신 릴리스 v0.30.1 (2026-06-21)
> 라이선스 MIT · Python 표준 라이브러리만 사용(의존성 제로) · 단일 저자(gl0di)

---

## 컨셉

OpenClaw의 경우 최근 해커들의 공격 대상이 되고 있다. OpenClaw의 취약점을 비롯하여 다양한 LLM 친화적인 공격이 난무하고 있다. 이런 문제를 해결하고자 ClawSecCheck가 개발되었다.

**ClawSecCheck**는 OpenClaw AI 에이전트를 위한 **로컬·읽기 전용·오프라인 보안 자가 감사(self-audit) 도구**다. OpenClaw 스킬로 설치해 대화형으로 쓰거나, 표준 CLI로 실행할 수 있다.

> "당신의 *자기 자신의* 에이전트에 대한 원커맨드 보안 자가 감사."

핵심 설계는 "남의 에이전트를 스캔한다"가 아니라 **내 에이전트를 내가 감사한다**는 점이다. 그래서 소유권 증명이나 법적 회색지대 문제가 없다. 도구는 설정을 A–F로 채점하고, 가장 시급한 구멍을 평이한 언어로 드러내며, 복사-붙여넣기 가능한 수정 제안과 **공유용 등급 배지**를 함께 준다.

OpenClaw 에이전트는 사용자 메시지를 읽고 대화를 기억하며 키를 보유하고 사용자를 대신해 행동한다. 이 권한들은 정확히 공격자가 노리는 표면이며, 감염된 메시지 하나나 악성 스킬 하나가 조용히 에이전트를 적으로 돌려놓을 수 있다. ClawSecCheck는 그 위험을 사전에 감지하기 위해 설정을 검사하고 등급을 부여한다.

### 작동 원칙

- **대화 기반 감사**: OpenClaw 안에서 실행하면 에이전트가 플래그를 몰라도 전 과정을 대화형으로 안내한다(가이드 모드).
- **읽기 전용**: 설정·스킬을 절대 변경하지 않는다. `--fix` 같은 기능은 존재하지 않는다.
- **오프라인·무전송**: 네트워크 호출·API 키·텔레메트리가 전혀 없다. 읽는 대상은 `~/.openclaw/openclaw.json`과 워크스페이스 부트스트랩 마크다운 파일뿐이다.
- **정직성 우선**: 판단 불가 항목은 `UNKNOWN`으로 표기하고 점수에서 제외한다. `UNKNOWN`은 절대 `PASS`가 아니다.

내부적으로 딱 하나, 사용자 자신의 플랫폼 감사만 읽기 전용으로 호출해 결과를 병합한다. 셸 없음, `--fix` 없음, 타임아웃 존재, `--no-native`로 건너뛰기 가능하다.

```
openclaw security audit --json
```

---

## 무엇을 검사하는가?

### Lethal Trifecta — 대표 프레임

ClawSecCheck가 리포트 최상단에 노출하는 핵심 지표다. **신뢰할 수 없는 입력 × 민감 데이터 접근 × 외부(송신·실행) 행동** 세 가지가 동시에 성립하면 침해가 치명적이거나 자명해진다. 도구는 이 셋 중 **2개 이하 유지**를 권고하며, 상단에 Score · Grade · Trifecta 비율을 함께 표시한다(공유 배지에는 등급만 노출).

### 검사군 (체크 ID 기준)

검사는 아래 체크 ID 체계로 구현된다. 크게 노출·권한·시크릿(B1–B12), 공급망(B13–B15), 대비 상태(B16–B17), 에이전트 행동(B18–B24), 인젝션·심층 노출(B26 이후), 능력·호스트 확장(B43·B50대), 그리고 네이티브 감사 병합(A1)과 위험 엔진(RISK)으로 나뉜다.

| 체크군 | 대표 항목 |
|--------|-----------|
| **B1–B12** | 게이트웨이 노출·채널 인증, 평문 시크릿, 최소 권한, 실행 샌드박스, TLS, 로컬 모델 위생 |
| **B6** | 부트스트랩 파일(`SOUL.md`, `AGENTS.md`, `TOOLS.md`)의 프롬프트 인젝션 유발 지시문 검사 |
| **B13** | 설치된 서드파티 스킬 콘텐츠 정적 검사. ClawHavoc류 악성코드와 base64 은닉 페이로드 탐지. v0.21부터 Python AST 파싱으로 `exec(base64.b64decode(...))` 등 난독화를 잡고, v0.23부터 자격증명 파일이 네트워크 싱크로 흐르는 테인트를 추적 |
| **B14 / B15** | 이그레스 표면 / MCP 서버 신뢰 경계 |
| **B16 / B17** | 위협 모니터링 유무 / 자율성·heartbeat |
| **B18–B24** | 서브에이전트 위임, 데이터 at-rest 노출, 정체성·메모리 파일 쓰기 보호, 도구 출력 신뢰 경계, 자기 수정, 승인 우회, 심층 MCP 하드닝 |
| **B26** | 신뢰 불가 컨텍스트 노출(`contextVisibility="all"` 기본값) |
| **B30 / B31 / B32** | 발신자 정체성 강도 / `tools.deny:["write"]`가 `apply_patch`·`exec`를 막지 못하는 footgun / 컨트롤플레인 변경 도달성 |
| **B33** | 알려진 취약 버전 게이트(`meta.lastTouchedVersion` 대조) |
| **B38 / B39 / B41 / B42** | 브라우저 SSRF(169.254.169.254 등) / 세션 가시성·교차사용자 유출 / 자격증명 blast-radius / 설치시점 공급망(preinstall 훅, world-writable 스킬 디렉터리) |
| **B43 / B44 (증언 계층)** | 정적 스캔이 못 보는 실제 도구/verb 인벤토리를 에이전트 자가 보고로 보강. `EXEC/DESTRUCTIVE/EGRESS/MAILBOX_CONFIG/REVERSIBLE`로 분류하고 config 대비 드리프트 점검(신뢰도 `ATTESTED`, 실험적) |
| **B50–B54 (Host Watch)** | 에이전트가 도는 호스트 자체가 감시되는가: 네트워크 IDS, 호스트 감사, 파일무결성, EDR, 호스트 방화벽. LOW 심각도로, 절대 FAIL로 이어지지 않음 |
| **A1** | 플랫폼 자체 `openclaw security audit`를 대신 실행해 같은 리포트에 병합(점수에는 미반영) |

더티 입력 새니타이저·액션 게이트·테인트 라벨링(B26–B28)은 아직 로드맵 단계로, 가장 큰 잔여 커버리지 갭이다. `UNKNOWN`으로 표기되는 판단 불가 항목이 존재하는 이유이기도 하다.

### 위험 엔진 — RISK-01 ~ RISK-10

개별 체크를 넘어, 두 개 이상의 속성이 동시에 성립할 때 침해가 치명적이 되는 **조합(capability chain)** 열 가지를 별도로 탐지한다.

| ID | 심각도 | 체인 |
|----|--------|------|
| RISK-01 | CRITICAL | 신뢰 불가 발신자 → exec/write/상승 도구 → 호스트/파일시스템 |
| RISK-02 | HIGH | 신뢰 불가 입력 → 민감 데이터 도달 → 송신/실행 (Lethal Trifecta) |
| RISK-03 | HIGH | 신뢰 불가 인그레스 + 샌드박스 없음 → 호스트에서 직접 exec/write |
| RISK-04 | HIGH | 가변 정체성(name-matching) → 상승/exec 도구 → 권한 상승 |
| RISK-05 | HIGH | 브라우저 SSRF(사설망) → 시크릿/자격증명 → 유출 |
| RISK-06 | CRITICAL | 개방/신뢰 불가 표면 → 컨트롤플레인 엔드포인트 → 완전 장악 |
| RISK-07 | HIGH | 승인 게이트 없는 exec/write → 쓰기 가능한 부트스트랩/정체성 파일 → 지속적 침해 |
| RISK-08 | MEDIUM | 다중 사용자 채널 → 공유 세션(`dmScope="main"`) → 교차 사용자 유출 |
| RISK-09 | CRITICAL | 악성 설치 스킬(B13 fail) → 도달 가능 시크릿 → 이그레스 → 유출 |
| RISK-10 | MEDIUM | 신뢰 불가 입력 → 호스트 exec/write → 호스트 탐지 부재 → 침해가 보이지 않음 |

각 체인은 모든 링크에 양성 증거가 있을 때만 발화(evidence-gated)하므로 오탐이 낮다. 위험 엔진은 결정론적 A–F 점수를 바꾸지 않고 별도로 노출되어, 점수 인플레이션 없이 최악 경로를 한눈에 보여준다.

---

## 채점 방식

가중 통과율로 채점한다(CRITICAL=10, HIGH=6, MEDIUM=3, LOW=1). 여기에 **정직성 하드캡**이 걸린다. 미해결 CRITICAL이 하나라도 있으면 점수 상한이 **49**, 미해결 HIGH가 있으면 상한이 **79**로 묶여, 치명적 구멍을 안은 채 A를 받을 수 없다.

| 등급 | 점수 |
|------|------|
| A | 90+ |
| B | 80–89 |
| C | 70–79 |
| D | 50–69 |
| F | <50 |

`UNKNOWN`은 채점되지 않고, 자문(advisory) 체크는 등급을 움직이지 않는다. 공유 카드는 등급·점수·Trifecta 비율만 노출하며 발견 사항은 비공개로 둔다 — 공유가 공격자에게 지도를 넘겨선 안 되기 때문이다.

---

## 장점

- **프라이버시 우선·완전 로컬**: 계정·API 키·텔레메트리·네트워크 요청이 전혀 없다. 기본 저장물은 소유자 전용 로컬 점수 이력(`~/.clawseccheck/history.jsonl`) 한 줄뿐이며 `--no-history`로 opt-out 할 수 있다.
- **네이티브 감사가 놓치는 부분 검사**: 플랫폼 자체 감사가 검사하지 않는 부트스트랩 파일(`SOUL.md`·`AGENTS.md`·`TOOLS.md`)을 프롬프트 인젝션 관점(B6)에서 점검한다.
- **설치 전 위험 평가**: `--vet <스킬>`로 스킬을, `--vet-mcp`로 연결된 MCP 서버를 설치·신뢰 전에 검증한다(SAFE/SUSPICIOUS/DANGEROUS). 대부분의 도구가 스킬만 보고 MCP 서버는 놓치는 공급망 갭을 겨냥한다. ClawHavoc 사태 이후 특히 중요한 기능이다.
- **능동 인젝션 테스트**: `--canary`(수동 인젝션 자가 테스트), `--redteam`(도구 포이즈닝·MCP 응답 인젝션·메모리 포이즈닝·다중 에이전트·승인 우회·더티→유출 시나리오), `--dryrun`(가짜 시크릿·가짜 도구로 하는 런타임 행위 테스트)을 제공한다.
- **정직한 설계**: `UNKNOWN ≠ PASS`이며 한계를 녹색 점수 뒤에 숨기지 않는다. 위험 체인은 증거가 있을 때만 발화한다.
- **완전 무료·오픈소스·의존성 제로**: MIT 라이선스, 순수 Python 표준 라이브러리.
- **다양한 출력과 CI 게이트**: 사람용 리포트, `--json`, `--sarif`(SARIF 2.1.0), `--html`, `--badge`(SVG), `--card`. CI에서는 `--fail-under 70`, `--exit-code`로 게이팅한다.

---

## 단점과 한계

- **OpenClaw 생태계 전용**: 다른 에이전트 플랫폼에는 적용할 수 없다.
- **대화 노출 인지 필요**: OpenClaw 채팅으로 사용하면 리포트 텍스트가 대화의 일부가 되어 이미 쓰고 있는 모델 제공자가 처리한다. 스캐너 자체가 새 채널을 만들지는 않지만 이 점은 인지해야 한다.
- **CLI 사용 시 Python 환경 필요**: pipx 설치가 권장된다(`pip install .`도 가능). Windows에서는 POSIX 권한 검사가 생략되고 유니코드 미지원 콘솔은 ASCII로 폴백한다.
- **정적·휴리스틱 감사**: 런타임 검증이나 형식 증명이 아니며 오탐·미탐이 있을 수 있다. 실행 중 에이전트에 대한 적대적 테스트를 대체하지 못한다. 읽는 범위도 설정 파일·부트스트랩 마크다운·설치 스킬 텍스트로 한정된다.
- **매우 신규·소규모 프로젝트**: 아직 pre-1.0(0.x)이며 단일 저자가 운영한다. 플래그·스키마·체크 ID는 마이너 릴리스에서도 바뀔 수 있고 1.0에 가서야 계약이 고정된다. 성숙도와 검증 이력 측면에서는 ClawSec·ClawSecure 같은 대형 프로젝트에 비해 열세다. 공개 리포트나 컬럼에서 인용할 때는 이 점을 명시하는 편이 안전하다.

---

## 유사 프로젝트 비교

| 프로젝트 | 형태 | 특징 |
|----------|------|------|
| **ClawSec** (prompt-security) | 스킬 스위트 | OpenClaw·Hermes·PicoClaw·NanoClaw 대상. 드리프트 탐지, 스킬 무결성 검증, NVD 기반 보안 자문 피드 |
| **ClawSecure** | 클라우드 감사 플랫폼 | 3,000+ 스킬 감사, OWASP ASI 10/10 커버리지, 3-Layer Audit Protocol, 지속 모니터링 |
| **ClawScan** | CLI(`npx clawscan`) | 스킬 설치 전 악성코드·리버스셸·프롬프트 인젝션·유니코드 공격 탐지, MIT |
| **ClawVitals** | 스킬+플러그인 | 로컬 실행 헬스체크, 설정 변조 탐지·드리프트 알림, 점수화 |
| **openclaw-security-scan** (legendaryabhi) | 순수 Bash CLI | Python 불필요, 크리티컬 이슈 자동 수정(auto-fix), CI용 JSON 출력 |

**ClawSecCheck의 차별점**은 완전 오프라인·로컬 실행에 의존성이 제로라는 점(클라우드 대시보드형과 대비), 네이티브 감사가 못 보는 부트스트랩 파일 인젝션 검사(B6), Lethal Trifecta 비율과 발견 사항 비공개 공유 배지, MCP 서버 사전 검증(`--vet-mcp`), 그리고 호스트 감시 태세(B50–B54)·증언 계층(B43·B44)까지 검사 범위를 넓힌 점에 있다.

---

## 시작하기

### OpenClaw 채팅에서 (터미널 불필요)

```
openclaw skills install clawseccheck            # ClawHub에서 (슬러그 고유)
openclaw skills install git:gl0di/clawseccheck  # 또는 GitHub에서 직접
```

설치 후 **"audit my OpenClaw setup with clawseccheck"** 라고 요청하면 등급과 가장 긴급한 문제가 채팅에 표시된다.
ClawHub 스킬 페이지: **https://clawhub.ai/gl0di/clawseccheck**

### 표준 CLI

```
pipx install git+https://github.com/gl0di/clawseccheck   # 또는 pip install .
clawseccheck --home ~/.openclaw                          # 이후 그냥 clawseccheck
python -m clawseccheck                                    # 동일하게 동작
```

### 번들 스크립트 직접 실행

```
python3 audit.py                 # 사람용 리포트 + 공유 카드
python3 audit.py --json          # 기계 판독용
python3 audit.py --card          # 배지만
python3 audit.py --sarif results.sarif   # GitHub Code Scanning 업로드용(로컬 기록)
python3 audit.py --html report.html      # 단독 HTML 리포트(소유자 전용)
python3 audit.py --fail-under 70         # 점수 70 미만이면 exit 1 (CI)
python3 audit.py --ascii         # 유니코드 미지원 콘솔용 폴백
```

### 무결성 확인

```
python3 audit.py --verify-self    # ClawSecCheck 자체 소스의 SHA-256 (변조 방지)
```

릴리스는 태그되어 공개되므로, 보안에 민감한 경우 blind auto-update보다 **업데이트 전 태그를 리뷰·핀 고정**하는 편이 안전하다.

### 대화 명령어와 내부 동작

| 사용자 요청 | 내부 동작 |
|-------------|-----------|
| "Audit my OpenClaw setup" | 기본 감사: A–F 등급 + 우선순위 수정 목록 + Trifecta |
| "Is this skill safe to install?" | `--vet <스킬>` (SAFE/SUSPICIOUS/DANGEROUS) |
| "Are my MCP servers safe?" | `--vet-mcp` |
| "Am I vulnerable to prompt injection?" | `--canary` / `--redteam` |
| "Watch my setup for changes" | `--monitor` (드리프트·점수 하락·신규 스킬/MCP/채널 알림) |
| "What should I fix first?" | `--next` (발견 사항 기반 우선순위) |
| "Give me fix prompts" | `--prompts` (발견별 복사-붙여넣기 수정 프롬프트) |
| "Share my grade" | `--badge` / `--card` (등급만 공개) |

---

## 참고 문서

- 저장소: https://github.com/gl0di/clawseccheck
- 보안 모델: https://github.com/gl0di/clawseccheck/blob/main/SECURITY_MODEL.md
- 스킬 정의: https://github.com/gl0di/clawseccheck/blob/main/SKILL.md
- ClawHub 스킬 페이지: https://clawhub.ai/gl0di/clawseccheck

---

*본 문서는 README v0.30.1 시점 기준이다. pre-1.0 프로젝트 특성상 플래그·스키마·체크 ID는 이후 릴리스에서 변경될 수 있다.*
