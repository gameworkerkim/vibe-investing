# TokenEconomizer - 코딩 에이전트를 위한 경험 기반 블랙박스 비용 제어

> **Experience-Driven Black-Box Cost Control for Coding Agents**
> 저장소: https://github.com/microsoft/TokenEconomizer · 논문: arXiv 2610.22732 · 프로젝트 페이지: https://tokeneconomizer.github.io · 라이선스: Apache 2.0

---

## 1. 프로젝트 개요

**TokenEconomizer**는 UC Berkeley, Microsoft Research, Microsoft Security가 공동 개발한 오픈소스 플러그인으로, 자주 작업하는 저장소(repository)에서 **코딩 에이전트의 실행 비용을 줄이는 것**을 목표로 합니다.

핵심 아이디어는 단순합니다. 개발자는 같은 에이전트를 같은 저장소에서 반복해서 사용하므로, 비용의 상당 부분도 반복됩니다. 같은 사실을 매번 다시 알아내고, 쓰지도 않는 도구 정의를 매 요청마다 보내고, 비슷한 실패 루프에 빠집니다. TokenEconomizer는 **세션 하나하나를 따로 최적화하지 않고, 한 저장소에서 이어지는 세션의 흐름 전체를 최적화 단위로 삼아** 이전 세션의 경험으로 다음 세션의 낭비를 줄입니다.

| 항목 | 내용 |
| :--- | :--- |
| 방식 | 블랙박스(Black-box) — 에이전트의 모델·가중치·코드를 수정하지 않음 |
| 지원 에이전트 | Claude Code, Codex, GitHub Copilot CLI, Pi (+ opencode 실험적 지원) |
| 요구 사항 | 지원 에이전트 1종(로그인 방식 무관), Python 3.10 이상(`PATH`에 등록) |
| API 키 | 불필요 — 플러그인 자체 키 없이 사용자의 기존 에이전트 로그인·요금제를 그대로 사용 |
| 데이터 저장 위치 | 로컬 `~/.tokeneconomizer` (학습 데이터는 사용자 머신 밖으로 나가지 않음) |
| 의존성 | 패키지는 Python 표준 라이브러리만 사용 |
| 저자 | Aaron J. Li, Weijia Xu, Chandan Singh, Zixiao Chen, Jeevana Priya Inala, Charlotte Siska, Acar Tamersoy, Bin Yu, Ion Stoica, Michel Galley, Jianfeng Gao |

---

## 2. 세 가지 핵심 메커니즘

이탤릭 문자(*k*, *p* 등)는 설정값이며, 괄호 안은 기본값입니다.

### 2.1 Micro-skills — 저장소의 작동 방식을 기억

세션은 같은 사실을 반복해서 재발견합니다. 먼저 실행해야 하는 빌드 단계, 이 환경에서 실제로 동작하는 명령어 철자(`pytest`가 없을 때 `python -m pytest`, `tsc` 대신 `npx tsc`), 명령에 필요한 환경 변수, 생성 파일의 위치 등이 그 예입니다.

- **두 가지 출처에서 학습**: ① 여러 세션에 걸쳐 반복되는 실패, ② *k*(3) 세션마다 최근 세션을 검토해 사실을 제안하는 모델(fact proposer).
- **주입 조건**: 한 사실이 **세 세션에서 확인된 뒤에야** 다음 세션 시작 시 컨텍스트에 명시됩니다.
- **제거 조건**: 이후 세션에서 모순되면 폐기됩니다.
- 언어에 관계없이 동작합니다.
- ⚠️ **기본값은 꺼짐(off)**: 제안 모델이 추가 모델 호출을 일으키고, 절감 효과가 저장소와 작업 성격에 따라 달라지기 때문입니다. 모델 호출 없이 반복 실패에서만 학습하는 `microskills=envfacts` 모드도 있습니다.

### 2.2 Tool Pruning — 쓰지 않는 도구 로딩 중단

로드된 모든 도구의 정의는 매 요청마다 함께 전송됩니다. 다음 조건 중 하나를 만족하면 해당 도구는 **에이전트 자체 설정 파일을 통해** 이후 세션에서 제외됩니다.

- 최소 *m*(2)개 세션에 걸친 *p*(10)개 프롬프트 동안 사용되지 않음, **또는**
- 길이와 무관하게 *s*(5)개 세션 동안 사용되지 않음

추가 안전장치로, 저장소의 세션이 *q*(60)분간 유휴 상태가 된 뒤에야(늦어도 목록 생성 후 하루 이내) 제외 목록(deny list)을 기록합니다. 도구 구성이 바뀐 상태로 대화를 재개하면 프롬프트 캐시를 처음부터 다시 써야 하는데, 한 시간 유휴 후에는 어차피 캐시가 만료되어 있기 때문입니다. 제외된 도구는 명령 하나(`toolprune restore`)로 복원되며, 복원된 도구는 다시 제외되지 않습니다. **기본값은 켜짐(on)**.

에이전트별로 제외 단위가 다릅니다.

| 에이전트 | 제외 단위 | 기록 위치 |
| :--- | :--- | :--- |
| Claude Code | 개별 도구 | `.claude/settings.local.json` |
| Codex | 기능 패키지(capability packages) | `.codex/config.toml` |
| Copilot CLI | MCP 서버 전체 | `.github/copilot/settings.local.json` |
| Pi | 없음 (Pi는 도구를 4개만 로드) | — |
| opencode | 아직 없음 | — |

플러그인은 자신의 항목만 추가하며 사용자가 직접 작성한 deny 규칙은 건드리지 않습니다. 새로 만든 설정 파일은 `.git/info/exclude`로 git에서 제외됩니다. 파일을 안전하게 수정할 수 없는 경우(저장소에 커밋된 `.codex/config.toml`, 유효하지 않은 JSON, 저장소 밖을 가리키는 심볼릭 링크 등)에는 목록이 제안 상태로 남고, `toolprune apply`로 다시 시도할 수 있습니다.

### 2.3 Failure-loop Intervention (Loop Guard) — 막힌 턴에 개입

**턴(turn)**은 프롬프트 하나에 대한 에이전트의 작업 단위입니다.

1. **기준선 학습**: 먼저 이 저장소에서 *e*(5)개의 턴이 정상 종료(마지막 편집 이후 실패한 검사 없음)될 때까지 "평소 턴 길이"를 학습합니다.
2. **판단**: 같은 실패가 반복되거나 오류가 쌓이는 등 루프 징후가 보이면 판단 모델(judge)이 정체 여부를 검사합니다.
3. **리다이렉트**: judge의 확신도가 *c*(0.7) 이상이면, 다른 접근을 시도하라는 짧은 메모를 컨텍스트에 추가합니다. 턴당 최대 *r*(1)회.
4. **백스톱**: 평소 길이의 *b*(2.5)배를 넘기며 같은 편집·실패를 반복하는 턴은 judge 없이 바로 리다이렉트됩니다.
5. **알림만, 중단은 사용자가**: 리다이렉트 후에도 막혀 있으면 중단 방법을 한 줄로 알려줄 뿐, **턴을 스스로 중단하지 않습니다.**

```
TokenEconomizer: this turn still looks stuck after a redirect (judge-stuck@0.82, 46 tool calls). Press Esc to interrupt it.
```

**기본값은 켜짐(on)**. 기본 설정에서 플러그인이 모델을 호출하는 경우는 턴에 루프 징후가 보일 때(judge 및 그 리다이렉트 작성)뿐입니다.

---

## 3. 설계 원칙

- **에이전트가 이미 읽는 경로로 작동**: 사실은 세션 시작 시 컨텍스트로, 도구 제거는 에이전트 자체 설정으로 처리하므로 에이전트가 새 도구를 배울 필요가 없습니다.
- **청구되는 방식대로 비용 계산**: 세션 토큰의 대부분은 캐시 재읽기이므로 캐시 요금 기준으로 계산하며, **플러그인 자신의 모델 호출 비용도 포함**합니다.
- **작업 성공률 보호**: 사실은 반복 증거로만 형성되고, 도구는 미사용이 확인된 뒤에만 제거되며, 진전 중인 턴은 건드리지 않습니다.
- **모든 동작은 가역적**: 모순된 사실은 폐기, 제거된 도구는 복원 가능, 턴 중단은 사용자의 결정.

또한 플러그인의 어떤 부분이 실패하더라도 세션은 플러그인이 설치되지 않은 것처럼 계속 진행됩니다.

---

## 4. 검증된 성과

논문은 6개 저장소의 동일한 SWE-Bench 태스크 277개를 5가지 에이전트–모델 조합으로 실행했습니다. 각 태스크는 독립 세션으로, 각 저장소의 태스크는 아무것도 학습하지 않은 상태에서 순서대로 실행되었으며, **비용에는 TokenEconomizer의 모든 모델 호출이 포함**됩니다.

| 에이전트 | 모델 | 평균 비용 절감 | Pass@1 변화 |
| :--- | :--- | ---: | ---: |
| Claude Code | Sonnet 5 | 23.6% | +1.3 |
| Claude Code | Opus 4.8 | **30.9%** | −1.0 |
| Codex | GPT-5.6 Terra | 24.7% | +0.9 |
| Codex | GPT-5.6 Sol | 26.1% | +1.6 |
| Copilot CLI | Sonnet 5 | 18.4% | **+2.6** |

- 평균 비용 **18.4–30.9% 절감**, 저장소×조합 **30개 셀 전부**에서 비용 감소(셀별 5–40%)
- Pass@1은 **5개 조합 중 4개**에서 상승 (Claude Code + Opus 4.8은 소폭 하락)
- Web-Bench에서 16–21%, 매 태스크가 새 저장소인 보안 감사 벤치마크 2종에서 6–20% 절감

> 위 수치는 저자들의 논문 실험 결과이며, 실제 절감 폭은 저장소와 작업 패턴에 따라 달라집니다.

---

## 5. Getting Started

### 5.1 사전 준비

- 지원 에이전트 중 하나가 설치·로그인되어 있을 것 (어떤 요금제·로그인 방식이든 가능)
- Python 3.10 이상이 `PATH`에 있을 것
- 플러그인은 자격 증명을 다루지 않으며 별도 API 키가 필요 없습니다.

### 5.2 지원 버전

| 에이전트 | 지원 범위 | 구버전 |
| :--- | :--- | :--- |
| Claude Code | 2.1.300 – 2.1.310 | 미지원 |
| Codex | 0.153.1 – 0.164.0 | 미지원 (0.141.0 미만은 플러그인 훅 자체가 실행되지 않음) |
| Copilot CLI | 1.0.83 – 1.0.102 | 미지원 |
| Pi | 1.2.0 – 1.3.0 | 0.99.x는 확장 경로로 직접 로드(아래 참조) |
| opencode (실험적) | 1.19.5, 2.2.0 | 미검증 |

각 범위의 최저·최고 버전에서 테스트되었으며, 그보다 새로운 버전은 아직 검증되지 않았습니다.

### 5.3 설치

클론을 보관할 폴더에서 실행하세요. Claude Code, Codex, Copilot CLI, opencode는 **클론된 폴더에서 플러그인을 실행하므로 클론을 옮기거나 지우면 안 됩니다.** 설치 후에는 작업할 저장소에서 에이전트를 시작합니다.

#### Claude Code

```bash
git clone https://github.com/microsoft/TokenEconomizer.git
claude plugin marketplace add "$PWD/TokenEconomizer"
claude plugin install tokeneconomizer@tokeneconomizer
```

1. `claude` 실행 → 폴더 신뢰(**Yes, I trust this folder**)
2. `/tokeneconomizer:status` 실행 (스크립트 실행 허용 요청 시 허용)
3. 머신당 1회, 그리고 Claude Code 업데이트 후마다: `/tokeneconomizer:toolprune refresh-catalog`

#### Codex

```bash
git clone https://github.com/microsoft/TokenEconomizer.git
codex plugin marketplace add "$PWD/TokenEconomizer"
codex plugin add tokeneconomizer@tokeneconomizer
```

1. `codex` 실행 → 폴더에 대해 **Trust and continue**
2. **Hooks need review** 화면에서 **Trust all and continue**
3. 훅은 다음 세션부터 적용되므로 `/exit`로 종료 후 `codex` 재시작
4. `$tokeneconomizer:status`로 확인

#### GitHub Copilot CLI

```bash
git clone https://github.com/microsoft/TokenEconomizer.git
copilot plugin marketplace add "$PWD/TokenEconomizer"
copilot plugin install tokeneconomizer@tokeneconomizer
```

1. `copilot` 실행 → **Yes, and remember this folder for future sessions**
2. `/tokeneconomizer:status` 실행 → 스크립트 실행에 **Yes**
3. 머신당 1회, 그리고 Copilot 업데이트 후마다: `/tokeneconomizer:toolprune refresh-catalog`

> ⚠️ 마켓플레이스 경로는 반드시 **절대 경로**(`"$PWD/TokenEconomizer"`)로 지정하세요. Copilot CLI는 `./TokenEconomizer` 같은 상대 경로를 GitHub 저장소 이름으로 해석합니다.

#### Pi

```bash
pi install git:github.com/microsoft/TokenEconomizer
```

`pi` 실행 후 `/te status`.

**Pi 0.99.x**: `pi install` 대신 저장소를 클론하고, 매 세션을 다음처럼 시작합니다(클론의 전체 경로 사용).

```bash
pi --extension /path/to/TokenEconomizer/plugin/pi/tokeneconomizer.ts
```

#### opencode (실험적)

```bash
git clone https://github.com/microsoft/TokenEconomizer.git
mkdir -p ~/.config/opencode/plugins
ln -s "$PWD/TokenEconomizer/plugin/opencode/tokeneconomizer.ts" ~/.config/opencode/plugins/
```

`opencode`를 시작해 프롬프트를 한 번 보낸 뒤, 저장소에서 터미널로 확인합니다.

```bash
~/.tokeneconomizer/bin/te --host opencode status
```

opencode에는 플러그인 명령이 없으므로 모든 명령은 터미널에서 실행합니다. 2.x 터미널 UI에서는 테스트되지 않았습니다.

### 5.4 설치 확인

`status` 명령이 짧은 상태 블록을 출력하면 정상 설치된 것입니다. `refresh-catalog`는 세션이 로드하는 모든 도구를 (모델 호출 없이) 기록해 Tool Pruning이 전체 도구를 판단 대상에 넣을 수 있게 합니다.

### 5.5 업데이트

| 에이전트 | 방법 |
| :--- | :--- |
| Claude Code, Copilot CLI, opencode | 클론 폴더에서 `git pull` |
| Codex | 클론 폴더에서 `git pull` 후 `codex plugin add` 명령 재실행 |
| Pi | `pi update --extensions` (0.99.x는 클론 폴더에서 `git pull`) |

제거, Copilot에서 자체 모델 키 사용, 문제 해결은 [`plugin/README.md`](https://github.com/microsoft/TokenEconomizer/blob/main/plugin/README.md)를 참고하세요.

---

## 6. 사용 방법

### 6.1 평소 작업

**평소처럼 작업하면 됩니다.** 플러그인은 사용자 개입 없이 동작하며, 각 동작을 한 줄로 알립니다. 상태를 보거나 바꿀 때만 명령을 사용합니다.

### 6.2 명령 입력 형식

명령 이름은 모든 에이전트에서 같고, 입력 형식만 다릅니다.

| 환경 | 입력 형식 |
| :--- | :--- |
| Claude Code, Copilot CLI | `/tokeneconomizer:<command>` |
| Codex | `$tokeneconomizer:<command>` |
| Pi | `/te <command>` |
| opencode | 터미널에서 `~/.tokeneconomizer/bin/te --host opencode <command>` |
| 터미널 (저장소 안에서) | `~/.tokeneconomizer/bin/te <command>` |

> 💡 에이전트 안에서 명령을 실행하면 모델 턴 1회 비용이 들지만, **터미널에서 실행하면 무료**입니다.

### 6.3 주요 명령

| 명령 | 기능 |
| :--- | :--- |
| `status` | 이 저장소에서 학습·수행한 내용과 세션 비용 |
| `microskills` | 주입 중인 사실과 형성 중인 사실 |
| `toolprune` | 제외된 도구와 그 근거 (Pi, opencode 제외) |
| `toolprune restore` | 제외된 도구 복원 (이후 다시 제외되지 않음) |
| `toolprune apply` | 제안 상태인 deny 목록 적용 |
| `config` | 현재 적용 중인 모든 설정 |
| `config set microskills=on` | 이 저장소에서 메커니즘 켜기(`=off`로 끄기), `--global` 추가 시 모든 저장소 |

그 밖의 명령(`repos`, `doctor`, `config unset` 등)은 [Commands 문서](https://github.com/microsoft/TokenEconomizer/blob/main/plugin/README.md#commands)를 참고하세요.

### 6.4 설정

| 기호 | 설정 키 | 기본값 | 의미 |
| :---: | :--- | :---: | :--- |
| *k* | `microskills_propose_every` | 3 | Micro-skills 사실 제안 모델 실행 간격(세션) |
| *p* | `toolprune_evidence` | 10 | 도구 제외 전 미사용 프롬프트 수 |
| *m* | `toolprune_min_sessions` | 2 | 위 프롬프트가 걸쳐야 할 최소 세션 수 |
| *s* | `toolprune_sessions` | 5 | 또는 길이 무관 미사용 세션 수 |
| *q* | `toolprune_quiet_minutes` | 60 | deny 목록 기록 전 필요한 유휴 시간(분) |
| *e* | `loopguard.envelope_min_samples` | 5 | Loop Guard 작동 전 필요한 정상 종료 턴 수 |
| *c* | `loopguard.judge_confidence` | 0.7 | 정체 판정에 필요한 judge 확신도 |
| *r* | `loopguard_nudges` | 1 | 알림으로 넘어가기 전 턴당 리다이렉트 횟수 |
| *b* | `loopguard.backstop_mult` | 2.5 | judge 없이 리다이렉트하는 평소 턴 길이 배수 |

메커니즘 스위치: `microskills`(기본 off), `toolprune`(기본 on), `loopguard`(기본 on). `on`/`off` 외에 `toolprune=propose`(제안만, `toolprune apply` 전까지 변경 없음), `microskills=envfacts`(반복 실패에서만 학습, 모델 호출 없음) 모드가 있습니다.

설정 예시 (Claude Code 형식):

```text
/tokeneconomizer:config set microskills=on                 # micro-skills 켜기
/tokeneconomizer:config set microskills_propose_every=5    # k=5: 사실 제안 빈도 낮추기
/tokeneconomizer:config set toolprune_evidence=20          # p=20: 미사용 프롬프트 20개까지 대기
/tokeneconomizer:config set loopguard_nudges=2             # r=2: 알림 전 리다이렉트 2회
```

### 6.5 세션 단위로 끄기 (환경 변수)

```bash
TE_DISABLE=1 claude          # 이 세션에서 플러그인 전체 끄기
TE_LOOPGUARD=off codex       # 이 세션에서 Loop Guard만 끄기
```

`TE_MICROSKILLS`, `TE_TOOLPRUNE`도 같은 방식이며, 모든 설정의 환경 변수는 `TE_` + 대문자 설정 이름입니다.

### 6.6 막힌 턴을 멈추는 방법

| 에이전트 | 대화형: 표시 위치 | 대화형: 중단 | 헤드리스: 표시 위치 | 헤드리스: 중단 |
| :--- | :--- | :--- | :--- | :--- |
| Claude Code | Claude의 응답 내 | Esc | 최종 응답 | Ctrl+C |
| Codex | 대화 내 | Esc 후 `/stop` | 표시 안 됨 | Ctrl+C |
| Copilot CLI | 대화 내 | Esc 두 번 | stdout | Ctrl+C |
| Pi | 알림 | Esc | stderr | Ctrl+C |
| opencode | 알림 | Esc | stderr | Ctrl+C |

- **Claude Code**는 플러그인 메시지를 상세 트랜스크립트(**Ctrl+O**)에만 표시하므로, 플러그인이 Claude에게 응답 안에서 반복하도록 요청합니다. 모델이 문구를 바꾸거나 생략할 수 있습니다. 세션 시작 시 제외된 도구 안내도 Ctrl+O에서만 보이므로 `/tokeneconomizer:toolprune`으로 확인하세요.
- **Codex**: Esc는 턴을 중단하지만 이미 시작된 명령은 `/stop` 전까지 계속 실행됩니다. `codex exec`는 훅 메시지를 출력하지 않습니다.
- **Pi**: 헤드리스 실행을 Ctrl+C로 끝내도 이미 시작된 명령은 완료될 때까지 실행됩니다.
- 헤드리스 실행(`claude -p`, `codex exec`, `copilot -p`, `pi -p`, `opencode run`)에서는 지켜보는 사람이 없을 수 있으므로, 표시된 턴은 끝나거나 에이전트 자체 한도에 도달할 때까지 실행됩니다. 이후 `te status`로 리다이렉트 및 "still stuck" 알림 횟수를 확인할 수 있습니다.

---

## 7. 장점

- **검증된 비용 절감**: SWE-Bench 277개 태스크, 5개 에이전트–모델 조합에서 평균 18.4–30.9% 절감, 30개 셀 전부 비용 감소. 플러그인 자체의 모델 호출 비용까지 포함한 순(net) 절감입니다.
- **에이전트 무변경 드롭인**: 모델 가중치나 에이전트 코드 수정 없이 플러그인으로 적용합니다.
- **경험 기반 최적화**: 같은 저장소를 반복 작업할수록 학습이 쌓여 해당 환경에 맞춰집니다.
- **안전성과 가역성**: 모순된 사실은 폐기, 제외된 도구는 복원 가능, 턴 중단은 항상 사용자 결정. 플러그인이 실패해도 세션은 정상 진행됩니다.
- **별도 API 키 불필요**: 플러그인의 모델 호출(사실 제안, judge, 리다이렉트)은 사용자의 기존 에이전트를 통해 같은 요금제·로그인으로 실행되며, 그 비용은 리포트에 포함됩니다.
- **로컬 데이터**: 학습 내용은 `~/.tokeneconomizer`에만 저장됩니다.
- **재현 가능성**: `experiments/`에 SWE-Bench·Web-Bench 실험 하네스, 런처, 태스크 세트가 포함되어 논문 결과를 재실행할 수 있습니다.

## 8. 한계와 주의사항

- **반복 작업 저장소에서 효과적**: 학습이 쌓여야 효과가 나므로, 처음 쓰는 저장소나 일회성 작업에서는 절감 폭이 작습니다(다만 매번 새 저장소인 보안 감사 벤치마크에서도 6–20% 절감 보고).
- **품질이 항상 오르지는 않음**: Claude Code + Opus 4.8 조합에서는 Pass@1이 1.0 하락했습니다.
- **좁은 지원 버전 범위**: 테스트된 버전 범위가 좁고, 그 이후 버전은 미검증입니다.
- **Micro-skills는 기본 비활성**: 사실 학습 효과를 원하면 직접 켜야 하며, 켜면 추가 모델 호출이 발생합니다.
- **에이전트별 기능 차이**: Pi와 opencode에서는 Tool Pruning이 동작하지 않으며, opencode 지원은 실험적입니다.

---

## 9. 유사 프로젝트와의 비교

대부분의 토큰 절감 도구는 **"데이터(프롬프트·출력)를 어떻게 줄일까"**에 집중합니다. TokenEconomizer는 **"같은 저장소에서 에이전트가 무엇을 반복해서 낭비하는가"**를 세션 경험으로 학습한다는 점에서 접근이 다릅니다.

| 프로젝트 | 주요 특징 | TokenEconomizer와의 차이 |
| :--- | :--- | :--- |
| **LLMLingua** (Microsoft) | 소형 언어 모델로 덜 중요한 토큰을 제거하는 프롬프트 압축 연구 계열 도구 | 개별 프롬프트 단위의 압축. 세션 간 학습이나 에이전트 설정 제어는 하지 않음 |
| **TokenSeive** | 프레임워크 독립 Python 라이브러리. 입력 프롬프트 압축, 코드베이스 맵핑, 도구 출력(JSON·검색 결과 등) 85–93% 압축, 행동 규칙으로 출력 토큰 감소 | 입출력 데이터 처리 단계에서 토큰을 줄임. 애플리케이션 코드에 통합해야 하며, 세션 이력을 학습하지 않음 |

두 접근은 배타적이지 않습니다. 도구 출력·프롬프트 압축 계열 도구와 TokenEconomizer를 함께 쓰는 구성도 고려할 수 있습니다.

---

## 10. 저장소 구조

| 경로 | 내용 |
| :--- | :--- |
| `tokeneconomizer/microskills` | 마이크로 스킬 합성 및 주입 |
| `tokeneconomizer/toolprune` | 미사용 도구 및 Codex 기능 패키지 가지치기 |
| `tokeneconomizer/loopguard` | 실패 루프 개입: 호출별 가드와 저장소별 기준선(envelope) |
| `tokeneconomizer/trace` | 각 에이전트의 세션 로그를 하나의 형식으로 변환 |
| `tokeneconomizer/plugin` | 훅과 `te` 명령이 실행하는 런타임 |
| `plugin` | 설치용 플러그인(매니페스트, 훅, 런처, 슬래시 명령, Pi 확장, opencode 플러그인) |
| `experiments` | 논문 결과 재현용 하네스·런처·태스크 세트 (설치 플러그인에는 미포함) |
| `docs` | `PLUGIN.md`(설계, 에이전트 동작 검증), `ARCHITECTURE.md`(패키지 구조) |
| `tests` | 패키지·플러그인 오프라인 테스트 |

개발자용:

```bash
python -m pytest tests                                  # 테스트 (벤치마크 쪽은 experiments/tests 추가)
python3 scripts/build_plugin.py --out dist/marketplace  # 자체 완결형 플러그인 번들 빌드
```

---

## 11. 인용

```bibtex
@misc{li2026tokeneconomizer,
  title         = {{TokenEconomizer}: Experience-Driven Black-Box Cost Control for Coding Agents},
  author        = {Li, Aaron J. and Xu, Weijia and Singh, Chandan and Chen, Zixiao and
                   Inala, Jeevana Priya and Siska, Charlotte and Tamersoy, Acar and Yu, Bin and
                   Stoica, Ion and Galley, Michel and Gao, Jianfeng},
  year          = {2026},
  eprint        = {2610.22732},
  archivePrefix = {arXiv},
  primaryClass  = {cs.CL},
  url           = {https://arxiv.org/abs/2610.22732}
}
```

## 12. 참고 링크

- GitHub: https://github.com/microsoft/TokenEconomizer
- 플러그인 상세 문서: https://github.com/microsoft/TokenEconomizer/blob/main/plugin/README.md
- 프로젝트 페이지(인터랙티브 차트, 저장소별 수치, 주석 달린 실행 9건): https://tokeneconomizer.github.io
- 논문: https://arxiv.org/abs/2610.22732

---

*이 문서는 2026년 11월 1일 기준. 지원 버전과 명령은 업데이트로 바뀔 수 있으니 설치 전 저장소를 확인하세요.*
