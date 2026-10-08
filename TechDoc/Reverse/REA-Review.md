# REA (Reverse Engineer Anything) — 분석 리포트 & Getting Started

> **저장소**: https://github.com/morluto/rea
> **npm 패키지**: `rea-agents` · **라이선스**: MIT · **언어**: TypeScript (+ Ghidra용 Java 브리지)
> **규모 (2026-10-08 기준)**: Star 413 · Fork 38 · 커밋 720 · 열린 이슈 40
> **문서**: README 영어·중국어·일본어·**한국어**·아랍어 제공

---

## 1. 한 줄 요약

REA는 **AI 코딩 에이전트가 소스 코드 없는 소프트웨어를 역공학할 수 있게 해주는 CLI + MCP 서버**입니다. Hopper·Ghidra 같은 역공학 엔진을 직접 다루는 대신, 에이전트가 "이 앱의 검색 기능이 어떻게 동작하는지 알아내고 내 프로젝트에 비슷하게 만들어줘"라고 요청받으면 REA의 도구를 호출해 **디컴파일 → 이해 → 재구현** 흐름을 수행합니다.

README가 스스로 밝히는 한계도 분명합니다. REA는 **원본 소스 복원이나 앱 자동 복제를 주장하지 않으며**, 결론에 이르게 된 증거를 보여주는 것이 목적입니다.

---

## 2. 주요 기능

### 2.1 조사 모델: Decompile → Understand → Recreate

| 단계 | 내용 |
| --- | --- |
| **Decompile** | 앱을 열어 읽을 수 있는 코드, 문자열, 심볼, 메타데이터를 복구 |
| **Understand** | 코드 경로를 따라가며 기능이 실제로 어떻게 동작하는지 설명 |
| **Recreate** | 파악한 내용을 사용자 스택·요구사항에 맞춘 기능으로 구현 (이 단계는 에이전트의 일반 코드 편집 도구가 담당) |

### 2.2 분석 대상 (현재 출하 기준)

- **네이티브 바이너리**: Mach-O, ELF, PE, `.app` 번들 (Hopper 또는 Ghidra 경유)
- **아카이브/패키지**: ZIP, APK, IPA, MSIX/AppX, ASAR — 추출 없이 콘텐츠 주소 기반 인벤토리
- **.NET(PE/CLI) 관리 코드**: 메타데이터 멤버, CIL 해시, P/Invoke 경계 — **어셈블리를 로드·실행하지 않는** 정적 분류
- **JavaScript / Electron**: 패키지·엔트리포인트·Webpack/Rspack 모듈·IPC·preload·contextBridge 구조를 AST 기반으로 재구성 (실행 없음)
- **웹사이트**: 사용자가 소유한 Chrome 계열 브라우저에 CDP로 수동(passive) 연결해 관찰
- **Node/Electron 런타임**: V8 Inspector에 attach-only 방식으로 스크립트·실행 컨텍스트 관찰
- **프로세스 동작**: PTY 시나리오 캡처(Process Capture v4) 및 두 캡처 간 비교

> 펌웨어·모바일 런타임·프로토콜 분석 등은 README에서 **장기 로드맵**으로 분류됩니다. 현재 기능으로 오인하지 않도록 주의하세요.

### 2.3 도구 카탈로그 (MCP 도구 패밀리)

| 패밀리 | 개수 | 예시 |
| --- | --- | --- |
| Native inspection | 36 | 프로시저, 의사코드, 어셈블리, 문자열, xref, 콜러/콜리 |
| Investigation workflows | 13 | `binary_overview`, `analyze_function`, `trace_feature`, `batch_decompile` |
| Native macOS utilities | 5 | Mach-O 메타데이터, 코드 서명, plist, Swift 디맹글링 (Hopper 불필요) |
| Artifact graph | 3 | 디렉터리/ZIP/APK/IPA/ASAR 인벤토리 |
| Managed PE/CLI | 8 | .NET 메타데이터, P/Invoke 검증, 버전 비교 |
| Browser observation | 9 | CDP 캡처, 번들·소스맵 분석, 세션 타임라인 |
| Electron analysis | 5 | 정적 매핑, 정적/런타임 대조 |
| JavaScript runtime | 2 | V8 Inspector 대상 탐색·관찰 |
| Application workflows | 12 | 계층 간 추적, 버전 매칭, 재구성 커버리지 |
| Workspace & observation | 23 | 대상 수명주기, Evidence 번들, 비교, 잔여 미지항목(unknown) 관리 |

### 2.4 Evidence v2 — 증거 기반 조사

모든 성공 결과는 **Evidence v2** 레코드로 기록되며 아티팩트·프로바이더 식별자, 신뢰도, 권한(authority), 한계, 위치 정보를 포함합니다. 핵심 원칙은 다음과 같습니다.

- 정적 추론과 런타임 관찰을 **섞지 않고 구분**해서 표시
- 누락되거나 잘린 증거는 "동일함"의 근거가 될 수 없음
- 알 수 없는 것은 `unknown`으로 명시적으로 남김 (빈 결과를 "없음"으로 해석하지 않음)

이 점이 REA를 "LLM이 추측으로 채우는 리버싱"과 구분짓는 가장 큰 설계 특징입니다.

### 2.5 에이전트 연동

`rea setup`은 **Claude Code, Claude Desktop, Codex, Cursor, Gemini CLI, Windsurf, Devin** 7종을 감지하고, 이 중 Devin을 제외한 6종을 자동 구성합니다. 그 외에 로컬 MCP 서버를 지원하는 에이전트는 수동 설정(아래 6.4절)으로 사용할 수 있습니다.

---

## 3. 장점과 단점

### 장점

1. **증거 우선 설계** — 결과마다 출처·신뢰도·한계를 붙이고 unknown을 명시하므로, 에이전트의 환각을 구조적으로 억제합니다.
2. **동의 우선(consent-first) 설치** — 설정 마법사가 아무것도 미리 선택하지 않고, 변경 경로를 모두 보여준 뒤 기본값 **No**로 최종 승인을 받습니다. `--dry-run` 지원, 기존 설정 백업 후 기록·재검증, `sudo` 미사용(Linux는 `pkexec`).
3. **로컬 분석** — REA 자체는 호스팅 분석 서비스가 없어 바이너리를 외부로 업로드하지 않습니다.
4. **CLI와 MCP의 동일성** — 터미널과 에이전트가 같은 워크플로·같은 Evidence 계약을 공유합니다.
5. **넓은 대상 범위** — 네이티브, .NET, JS/Electron, 웹, 프로세스 동작까지 하나의 인터페이스로 다룹니다.
6. **재현성·캐시** — 분석 스냅샷이 바이너리 다이제스트·프로바이더 빌드·분석 프로필이 정확히 일치할 때만 재사용되어, 재실행 비용을 줄이면서도 결과 오염을 막습니다.
7. **버전 비교** — `investigate-versions`로 두 릴리스를 비교하고 중단 시 재개 가능한 워크스페이스를 제공합니다.
8. **Hopper 무료 데모로 시작 가능** — 유료 라이선스는 선택 사항입니다.
9. **MIT 라이선스 + 실제 엔진 대상 CI 검증** — 실제 Ghidra 12.1.2로 모든 오퍼레이션을 검증하는 스크립트(`verify:ghidra`)가 있습니다.

### 단점

1. **"로컬"의 범위가 REA까지만** — REA는 업로드하지 않지만, 에이전트가 디컴파일 결과·문자열·의사코드를 **LLM 제공자에게 전송**합니다. 민감한 바이너리라면 모델 제공자의 데이터 정책을 별도로 검토해야 합니다 (README FAQ도 이를 언급).
2. **외부 엔진 의존** — 깊은 분석은 Hopper(별도 라이선스, 데모는 벤더 제한 있음) 또는 Ghidra가 필요합니다. Ghidra는 **정확히 12.1.2 + 64비트 JDK 21**만 지원하며 REA가 설치해주지 않습니다.
3. **Ghidra 프로바이더는 읽기 전용** — 19개 오퍼레이션만 허용되며 이름 변경·주석 같은 변경(mutation)과 GUI 상태 기능은 Hopper에서만 됩니다.
4. **처리 한계** — Ghidra 자동 분석은 300초·CPU 2개·Java 힙 2GiB로 제한, 디컴파일당 30초 데드라인. 대형 바이너리는 타임아웃이 날 수 있습니다. Hopper는 Python API가 단일 스레드라 요청이 직렬 큐로 처리됩니다.
5. **플랫폼 편중** — macOS 12+와 일부 Linux(Ubuntu 24.04+, Fedora 41+, Arch)가 중심. Windows는 Ghidra 전용 **실험적 P0**로, 네이티브 x86-64 PE 앱만 지원(DLL·관리 코드 PE 제외)하고 자동 setup도 불가합니다.
6. **환경변수 스프롤** — 증거 루트, 입력 루트, 스냅샷 루트, 브라우저·V8·프로세스 캡처 등 기능마다 `REA_*_JSON` 허용목록을 따로 설정해야 해서 고급 기능 진입 장벽이 높습니다.
7. **샌드박스가 아님** — README가 명시하듯 프로바이더·수동 관찰자·프로세스 캡처는 보안 샌드박스가 아니며 현재 사용자 권한으로 실행됩니다. 악성 샘플 분석용으로 그대로 쓰기엔 부적합합니다 (Linux 전용 JS 재생만 Bubblewrap/seccomp 샌드박스).
8. **Hopper UI 간섭** — Hopper 런처가 앱을 활성화하므로 창이 전면에 뜨거나, 일부 대화상자는 사람이 응답해야 할 수 있습니다.
9. **초기 단계 프로젝트** — Star 400여 개 수준의 작은 커뮤니티, 빠른 메이저 버전 변화(3.x)로 API·스키마 변동 가능성이 있습니다.
10. **법적 고려** — "다른 앱의 기능을 보고 내 제품에 구현"하는 사용 사례는 대상 소프트웨어의 EULA, 저작권, 지역별 역공학 허용 범위를 확인해야 합니다.

---

## 4. 보강할 점

| 영역 | 제안 |
| --- | --- |
| **데이터 유출면 관리** | LLM으로 넘어가는 문자열·의사코드에 대한 마스킹/레드액션 옵션, "모델로 전송되는 데이터 요약" 리포트 |
| **설정 통합** | 흩어진 `REA_*_JSON` 환경변수를 프로필 기반 설정 파일(예: `rea.config.json`)과 `rea policy` 같은 명령으로 통합 |
| **Windows** | Ghidra P0의 정식화, DLL·관리 PE 지원, 자동 setup, named pipe DACL 기반 격리 |
| **Ghidra 버전 유연성** | 12.1.2 고정 대신 검증된 버전 범위 허용 |
| **대형 바이너리** | 300초 상한을 넘는 분석을 위한 백그라운드 사전 분석 + 스냅샷 선적재 워크플로, 부분 결과의 명시적 반환 모드 |
| **프로바이더 확장** | 로드맵에 있는 IDA/Hex-Rays, Binary Ninja, Rizin, LIEF 지원 |
| **동적 분석** | 로드맵의 LLDB·Frida·네이티브 API 추적 — 현재 정적 분석 대비 가장 큰 공백 |
| **보안 분석 용도** | 악성코드 분석을 위한 VM/컨테이너 격리 실행 가이드, 샌드박스 프로바이더 |
| **온보딩** | 대상 유형별(네이티브/Electron/.NET/웹) 엔드투엔드 튜토리얼과 샘플 Evidence 번들 |

---

## 5. 유사 프로젝트 비교

> 비교 대상의 세부 사양은 작성 시점의 일반 정보 기준이므로, 도입 전 각 프로젝트의 최신 문서를 확인하세요.

| 구분 | **REA** | **GhidraMCP** (LaurieWired) | **ida-pro-mcp** (mrexodia) | **Binary Ninja Sidekick** | **RevEng.AI** |
| --- | --- | --- | --- | --- | --- |
| 형태 | 독립 CLI + MCP 오케스트레이션 계층 | Ghidra 플러그인 + MCP 브리지 | IDA 플러그인 + MCP 서버 | Binary Ninja 내장 AI 어시스턴트 | 클라우드 바이너리 분석 플랫폼/API |
| 엔진 | Hopper, Ghidra(읽기 전용) + 자체 정적 분석기 | Ghidra | IDA Pro | Binary Ninja | 자체 엔진(AI 함수 유사도 등) |
| 분석 범위 | 네이티브 + .NET + JS/Electron + 웹 + 프로세스 | 네이티브 | 네이티브 | 네이티브 | 네이티브 중심 |
| 증거/출처 추적 | **Evidence v2 (구조화·unknown 명시)** | 없음(도구 응답 그대로) | 없음 | 제한적 | 플랫폼 리포트 |
| 실행 위치 | 로컬 | 로컬 | 로컬 | 로컬 앱 + AI 서비스 | 클라우드 |
| 비용 | MIT 무료 (Hopper 라이선스 선택) | 무료 | IDA 라이선스 필요 | Binary Ninja + Sidekick 구독 | 유료 플랜 중심 |
| 강점 | 다계층 대상, 증거 기반, 동의 우선 설치, 버전 비교 | 단순·가벼움, Ghidra 사용자 친화 | IDA의 업계 표준 분석 품질 | 사람 분석가 워크플로와 긴밀한 통합 | 설치 부담 없음, 대규모 유사도 검색 |
| 약점 | 설정 복잡, 플랫폼 편중, 작은 커뮤니티 | 구조화된 증거·워크플로 부재 | 고가 라이선스 | 특정 제품 종속 | 바이너리 외부 업로드 |

**포지셔닝 요약**: GhidraMCP·ida-pro-mcp는 "엔진 API를 MCP로 노출"하는 **얇은 어댑터**인 반면, REA는 여러 엔진과 자체 분석기를 묶고 **증거·권한·재현성 계약을 강제하는 두꺼운 오케스트레이션 계층**입니다. 빠르게 한 바이너리를 들여다보려면 어댑터형이, 감사 가능한 조사 기록이 필요하거나 Electron/.NET/웹까지 아우르려면 REA가 유리합니다.

---

## 6. Getting Started

### 6.1 요구사항

| 항목 | 조건 |
| --- | --- |
| OS | macOS 12+ / Ubuntu 24.04+, Fedora 41+, 64비트 Arch / (실험) Windows x64 — Ghidra 전용 |
| Node.js | 22.19+ 또는 24.11+ (이후 버전 포함) |
| npm | 특정 버전 요구 없음 |
| 분석 엔진 | Hopper (setup이 설치 가능, 데모 모드 OK) **또는** Ghidra 12.1.2 + JDK 21 (직접 설치) |

```bash
node -v   # v22.19 이상인지 확인
```

### 6.2 설치 — 세 가지 방법 중 하나 선택

**방법 A. npx로 설치 없이 setup (권장)**

```bash
npx --yes rea-agents@latest setup
```

- 감지된 에이전트 목록을 보여준 뒤 **Agent Integration**(MCP 등록 + 라우팅 스킬)과 필요 시 **Hopper provider**를 고르게 합니다. 아무것도 미리 선택되어 있지 않습니다.
- 최종 승인 전 정확한 변경 경로가 출력되며 기본값은 **No**입니다. Ctrl-C로 취소하면 아무것도 바뀌지 않습니다.
- 먼저 계획만 보고 싶다면:

```bash
npx --yes rea-agents@latest setup --dry-run
```

**방법 B. 전역 설치로 `rea` 명령 사용**

```bash
npm install --global rea-agents
rea setup
rea doctor
```

> `--global` 없이 `npm install rea-agents`를 하면 현재 프로젝트의 `node_modules/.bin`에만 설치되어 셸 PATH에 `rea`가 잡히지 않습니다.

**방법 C. curl 설치 스크립트**

```bash
curl -fsSL https://raw.githubusercontent.com/morluto/rea/main/install.sh | bash
# 옵션 예: 계획만 보기
curl -fsSL https://raw.githubusercontent.com/morluto/rea/main/install.sh | bash -s -- --dry-run
```

Linux에서는 `~/.local/bin`에 설치되므로 PATH에 추가가 필요할 수 있습니다.

### 6.3 setup 후 에이전트에게 요청하기

1. setup이 끝나면 구성된 에이전트(Claude Code 등)를 **재시작**합니다.
2. Hopper가 처음 뜰 때 데모/라이선스 프롬프트가 나오면 **Try the Demo** 또는 보유 라이선스를 선택합니다.
3. 에이전트에게 자연어로 요청합니다.

```text
Notes 앱에서 오프라인 검색이 어떻게 동작하는지 역공학으로 분석하고,
증거를 보여준 다음, TypeScript와 SQLite로 내 프로젝트에 비슷한 기능을 만들어줘.
```

이때 에이전트가 내부적으로 수행하는 흐름은 대략 다음과 같습니다.

| 단계 | 에이전트 작업 | REA 도구 |
| --- | --- | --- |
| 1 | 바이너리 열기·식별 | `open_binary`, `binary_overview` |
| 2 | 관련 단서 탐색 | `search_strings`, `search_procedures`, `list_names` |
| 3 | 단서를 실행 코드에 연결 | `find_xrefs_to_name`, `xrefs`, `procedure_callers` |
| 4 | 제어 흐름 재구성 | `get_call_graph`, `procedure_callees`, `procedure_info` |
| 5 | 관련 루틴 디컴파일 | `procedure_pseudo_code`, `procedure_assembly`, `batch_decompile` |
| 6 | 기능 구현 | 에이전트의 일반 파일 편집·테스트 도구 |

### 6.4 수동 MCP 설정 (자동 구성되지 않는 에이전트)

MCP 설정 파일에 다음을 추가합니다. 영구 등록에는 **정확한 버전 고정**이 권장됩니다.

```json
{
  "mcpServers": {
    "rea": {
      "command": "npx",
      "args": ["-y", "rea-agents@3.1.0", "mcp"]
    }
  }
}
```

전역 설치했다면 `rea mcp`로 서버를 직접 띄울 수도 있습니다. MCP 프롬프트를 지원하는 클라이언트에서는 `prompts/list`로 6개의 가이드 워크플로를 사용할 수 있습니다.

### 6.5 터미널에서 직접 쓰기 (CLI)

```bash
# 상태 진단
rea doctor
rea doctor --json          # 읽기 전용, 원인별로 구분된 진단

# 개요 분석
rea analyze /Applications/Notes.app
rea inspect /Applications/Notes.app --detail detailed --limit 20

# 검색·함수·참조·추적
rea search   /Applications/Notes.app "offline"
rea function /Applications/Notes.app 0x1000
rea xrefs    /Applications/Notes.app 0x1000
rea trace    /Applications/Notes.app "offline"

# 디컴파일 없이 빠른 원시 명령어 창
rea instructions /Applications/Notes.app 0x1000

# 기능·프로바이더 확인, 도움말
rea capabilities
rea providers --json
rea --help
```

설치 없이 쓰려면 각 명령 앞에 `npx -y rea-agents@latest`를 붙입니다.

### 6.6 분석 엔진(프로바이더) 선택

```bash
# 사용 가능한 후보 확인
rea providers --json

# 요청 단위로 지정 (환경변수보다 우선)
rea analyze /absolute/path/to/program --provider hopper

# 환경변수로 지정
REA_ANALYSIS_PROVIDER=hopper rea decompile /absolute/path/to/program 0x1000
```

- 사용 가능한 후보가 하나면 자동 선택, 여러 개면 `ambiguous`로 보고합니다.
- 프로바이더 실패 시 **다른 엔진으로 조용히 대체하지 않습니다** (명시적 오류).

**Ghidra 연결 (Linux x64 / Windows 실험)**

```bash
export GHIDRA_INSTALL_DIR=/absolute/path/to/ghidra_12.1.2_PUBLIC
export JAVA_HOME=/absolute/path/to/jdk-21   # java/javac가 PATH에 있으면 생략 가능
rea doctor --json
rea setup                                   # 검증된 경로를 MCP 등록에 반영
rea providers --json
```

**Hopper 경로가 기본값과 다를 때 (Linux)**

```bash
export HOPPER_LAUNCHER_PATH=/absolute/path/to/Hopper
rea doctor --json
ldd /opt/hopper/bin/Hopper | grep 'not found'   # 공유 라이브러리 누락 확인
```

### 6.7 증거·버전 비교 등 파일 기반 기능 켜기

파일 시스템을 다루는 기능은 운영자가 **절대 경로 루트를 승인**해야 활성화됩니다.

```bash
export REA_EVIDENCE_ROOTS_JSON='["/absolute/path/to/evidence"]'
export REA_INVESTIGATION_INPUT_ROOTS_JSON='["/absolute/path/to/releases"]'

# Evidence 번들 가져오기/내보내기/비교
rea evidence-import /absolute/path/to/evidence/bundle.json
rea evidence-export /absolute/path/to/evidence/bundle.json /absolute/path/to/evidence/canonical.json
rea compare /absolute/path/to/evidence/left.json /absolute/path/to/evidence/right.json

# 두 버전 비교 (중단 시 재개 가능)
rea investigate-versions /absolute/path/to/releases/v1 /absolute/path/to/releases/v2 \
  /absolute/path/to/evidence/releases.json --yes --workspace-name releases

# Electron/JS 앱 정적 매핑 (실행하지 않음)
rea analyze /absolute/path/to/releases/app.asar --approved --json
```

**분석 스냅샷으로 재실행 비용 줄이기**

```bash
export REA_ANALYSIS_SNAPSHOT_ROOTS_JSON='["/absolute/path/to/analysis"]'
rea analyze /absolute/path/to/app --snapshot /absolute/path/to/analysis/app.json
# 동일 쿼리는 프로바이더를 다시 띄우지 않고 스냅샷에서 응답
```

> ⚠️ MCP 클라이언트에 등록된 상태라면, 환경변수를 설정한 셸에서 **`rea setup`을 다시 승인 실행하고 클라이언트를 재시작**해야 정책이 반영됩니다. 셸 환경만 바꿔서는 이미 실행 중인 MCP 프로세스에 적용되지 않습니다.

### 6.8 웹사이트 관찰 (CDP, 선택)

```bash
export REA_BROWSER_OBSERVE_ENABLED=true
export REA_BROWSER_CDP_ENDPOINTS_JSON='["http://127.0.0.1:9222"]'
export REA_BROWSER_ALLOWED_ORIGINS_JSON='["http://127.0.0.1:3000"]'

rea list-browser-targets http://127.0.0.1:9222 --approved --json
rea inspect-web-page http://127.0.0.1:9222 TARGET_ID --approved --json
```

수동 관찰이며 페이지 JS 실행·이동·클릭을 하지 않고, 쿠키·인증 헤더·스토리지 값은 보존하지 않습니다.

### 6.9 문제 해결

| 증상 | 조치 |
| --- | --- |
| 무엇이 안 되는지 모름 | `rea doctor --json` — 미지원 호스트, 의존성 누락, 엔진 누락, 설정 드리프트를 구분해 보고 |
| setup이 종료 코드 1 | `planned` / `needs_confirmation` / `needs_human` 상태 — 승인 또는 조치 후 재실행 |
| Hopper 창이 전면에 뜸 | Hopper 런처 특성. REA는 백그라운드 시작을 요청하지만 보장 불가 |
| 디컴파일 타임아웃 | `rea instructions`로 원시 명령어만 확인, 세션의 `analysis_activity`로 진행 중 작업 확인 |
| 파이프라인에서 실패가 숨겨짐 | `set -o pipefail` 사용 |

```bash
set -o pipefail
rea inventory-artifact ./app.asar --json | jq . > inventory.json
```

### 6.10 업그레이드와 제거

```bash
rea upgrade                     # 전역 설치본 업데이트 (이후 setup 동기화 안내)
rea uninstall                   # REA 소유 MCP 등록과 스킬만 제거
rea uninstall --purge-data      # ~/.rea/cache, ~/.rea/state 까지 제거
```

제거 시 Hopper, Node.js, Evidence, 캡처 파일, 다른 MCP 서버는 보존됩니다.

---

## 7. 초안 대비 정정 사항

기존 요약본에서 README와 맞지 않는 부분을 정리했습니다.

| 항목 | 초안 | 실제 (README / 저장소 기준) |
| --- | --- | --- |
| GitHub Star | 15,000개 이상 | **413개** (Fork 38) |
| 에이전트 호환 | 12개 이상, GitHub Copilot CLI 포함 | setup이 **7종 감지, 6종 자동 구성**(Devin 제외). Copilot CLI는 README에 명시 없음. 그 외는 수동 MCP 설정 |
| Hopper | 유료 라이선스 필요 | **무료 데모 모드로 사용 가능**, 유료 라이선스는 선택. setup이 설치까지 지원 |
| Ghidra 지연 | 콜드 스타트 최대 330초 | 자동 분석 **300초 상한**(CPU 2, 힙 2GiB), 디컴파일당 30초 데드라인 |
| 펌웨어 분석 | 현재 기능 | **장기 로드맵** 항목 |
| 플랫폼 | macOS + 특정 Linux | macOS 12+, Ubuntu 24.04+ / Fedora 41+ / Arch, Windows x64는 Ghidra 전용 실험 |
| Ghidra 버전 | 언급 없음 | **정확히 12.1.2 + JDK 21**만 지원, 읽기 전용 19개 오퍼레이션 |

---

## 8. 참고 링크

- 저장소: https://github.com/morluto/rea
- 한국어 README: https://github.com/morluto/rea/blob/main/README_ko.md
- 설치 문서: https://github.com/morluto/rea/blob/main/docs/installation.md
- Windows Ghidra P0: https://github.com/morluto/rea/blob/main/docs/windows-ghidra-p0.md
- 브라우저 관찰: https://github.com/morluto/rea/blob/main/docs/browser-observation.md
- 보안 정책: https://github.com/morluto/rea/blob/main/SECURITY.md
- npm: https://www.npmjs.com/package/rea-agents
- Hopper: https://www.hopperapp.com/ · Ghidra: https://github.com/NationalSecurityAgency/ghidra
