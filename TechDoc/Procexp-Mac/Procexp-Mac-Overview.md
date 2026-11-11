# Sysinternals Process Explorer for Mac (microsoft/Procexp-Mac)

> 기준일: 2026-11-11 · 대상 버전: 1.0.0 (2026-11-05 릴리스)
> 저장소: https://github.com/microsoft/Procexp-Mac

---

## 1. 한 줄 요약

Windows 진단 도구의 표준인 Sysinternals **Process Explorer**를 Microsoft가 macOS용으로 새로 구현해 공개한 프로젝트다. Swift·SwiftUI·AppKit으로 작성된 네이티브 앱이며, 프로세스 트리, 모듈/핸들/스레드 검사, 코드 서명 검증, 시스템 성능 그래프를 한 화면에서 제공한다. 다만 1.0.0은 사실상 초기 버전이고, **저장소에 LICENSE 파일이 아직 없다**는 점을 먼저 알고 써야 한다.

## 2. 프로젝트 개요

| 항목 | 내용 |
| :--- | :--- |
| 정식 명칭 | Sysinternals Process Explorer for Mac (앱 이름 `ProcExp.app`) |
| 배포 주체 | Microsoft (Sysinternals) |
| 첫 릴리스 | 1.0.0, 2026-11-05 (DMG 약 4.36 MB) |
| 지원 OS | macOS 14 (Sonoma) 이상 |
| 구현 언어 | Swift 5.9+, SwiftUI + AppKit |
| 빌드 요구 | Xcode 26.6 이상 권장, `xcodegen` |
| 저장소 규모 | 커밋 59개, Star 23, Fork 5, 오픈 이슈 3 (조회 시점) |
| 라이선스 | **LICENSE 파일 없음** (이슈 #14로 제기된 상태) |
| 번들 ID | 공식 `com.sysinternals.procexpmac` / 개발 `com.sysinternals.procexpmac.dev` |

### 탄생 배경

Sysinternals 창시자이자 Azure CTO인 Mark Russinovich가 2026년 7월 에이전틱 코딩 실험의 결과물로 스크린샷을 공개하면서 알려졌다. 당시 그는 초기 개발이 이틀간의 프롬프팅으로 이뤄졌다고 밝혔고, 실제 저장소 커밋에도 Copilot이 공동 작성자로 기록되어 있다. 같은 날 Autoruns 1.0 for Linux도 함께 나와, Sysinternals가 Windows 밖으로 확장되는 흐름의 일부다.

이 배경은 장점이자 단점이다. 짧은 기간에 기능 폭이 넓게 구현됐지만, 초기 사용자 보고를 보면 다듬어지지 않은 부분이 많다.

## 3. 주요 기능

### 3.1 프로세스 목록과 트리

- 실시간 프로세스 트리. 서비스, 본인 소유 프로세스, 신규/종료 프로세스, 일시 중단, 샌드박스, 패킹된 이미지를 Process Explorer 방식의 색상으로 구분한다.
- 프로세스 이름 열은 고정되고 지표 열만 가로 스크롤된다.
- 열 너비, 순서, 열 세트, 선택 열이 저장된다.
- 타이핑으로 바로 항목 선택, 잘린 셀과 경로·커맨드라인에 즉시 툴팁, 스페이스바로 갱신 일시정지/재개.

### 3.2 하단 패널 (Lower Pane)

- 세 가지 모드: DLL/이미지(dylib), 핸들/파일 디스크립터, 스레드.
- 새로 나타나거나 사라진 항목을 행 강조로 표시한다.
- 핸들 또는 DLL 이름으로 역검색하는 Find 기능이 있어, 특정 파일을 잡고 있는 프로세스를 찾을 수 있다.

### 3.3 프로세스 속성 창

탭 구성: Image, Performance, Performance Graph, Threads, TCP/IP, Security, **Environment**, Strings.

- TCP/IP 탭은 로컬/원격 주소, 비동기 역방향 DNS 조회, TCP 상태를 보여 준다.
- Environment 탭에서 환경 변수를 확인할 수 있다 (타 사용자 프로세스는 헬퍼 필요).

### 3.4 보안과 서명 검증

- 서명자, 게시자, 인증서 체인, Team ID, 공증(Notarization) 상태, 플랫폼/ad-hoc 여부, 검증 실패 사유, SHA-256.
- VirusTotal 연동 (프로세스와 개별 모듈 모두).
- 모듈 상세 창에서 메타데이터, 서명 검증, Finder에서 보기, 온라인 검색.

### 3.5 시스템 정보

- Summary, CPU, Memory, I/O, Network, GPU 페이지.
- CPU, 메모리, 스왑, 디스크 I/O, 네트워크 I/O, GPU, 코어별 사용률 그래프.
- Apple Silicon의 P코어/E코어를 라벨과 색으로 구분.
- CPU 토폴로지·캐시, 메모리 페이지, 스토리지, 네트워크 인터페이스, GPU 장치 정보.
- 메뉴 막대 CPU 히스토리 아이템.

### 3.6 프로세스 제어

종료, 트리 종료, 일시 중단/재개, 우선순위(nice) 변경, 재시작, 앞으로 가져오기, 프로세스 샘플링, 온라인 검색, VirusTotal 검사.

## 4. 아키텍처

### 4.1 데이터 수집

공개 macOS API만 사용한다: `libproc`, `sysctl`, Mach host statistics, Security.framework, IOKit, Metal. Endpoint Security나 비공개 API에 의존하지 않는다.

그 결과로 생기는 제약을 README가 직접 명시한다. macOS가 접근을 막거나 공개 API로 얻을 수 없는 값은 **추정값을 채우지 않고 빈칸으로 둔다.** 일부 정보는 같은 사용자 소유 프로세스이거나 권한 헬퍼가 켜져 있을 때만 나온다.

### 4.2 권한 헬퍼 (Privileged Helper)

- root로 동작하는 launchd 데몬. 앱과는 XPC로 통신하고 `SMAppService`로 등록한다.
- 용도: 타 사용자·시스템 프로세스의 전체 목록, 스레드, 모듈, 환경 변수 조회와 권한이 필요한 프로세스 제어.
- 설치: 앱 메뉴 **Install Privileged Helper…** 실행 후 **시스템 설정 ▸ 일반 ▸ 로그인 항목 및 확장 프로그램**에서 승인.
- 조건: 앱이 ad-hoc이 아닌 안정된 서명(Developer ID 또는 자체 서명)을 가져야 한다. ad-hoc 서명이면 등록이 거부되고 비권한 모드로 계속 동작한다.
- 확인: `launchctl print system/com.sysinternals.procexpmac.helper`

### 4.3 소스 구성

| 경로 | 역할 |
| :--- | :--- |
| `App` | SwiftUI/AppKit GUI |
| `Sources/ProcexpModel` | 모델, 프로바이더, 포맷, 열, 색상 규칙 |
| `Sources/ProcexpSampling` | `libproc`·`sysctl` 기반 비권한 샘플링 |
| `Sources/ProcexpNetwork` | 소켓 열거, GPU 사용률 |
| `Sources/ProcexpSigning` | 코드 서명, SHA-256, 키체인, VirusTotal |
| `Sources/ProcexpGraphs` | AppKit 그래프 뷰 |
| `Sources/ProcexpActions` | 프로세스 동작 |
| `Sources/ProcexpAutostart` | launchd/자동 시작 감지 |
| `Sources/ProcexpPrivileged`, `ProcexpHelper` | 헬퍼 클라이언트와 데몬 |
| `Tests`, `Scripts`, `docs` | 테스트, 빌드·서명·공증 스크립트, 문서 |

## 5. 설치와 빌드

**일반 사용자**: GitHub Releases의 1.0.0 DMG를 받아 설치한다.

**소스 빌드**:

```bash
brew install xcodegen
xcodegen generate
xcodebuild -scheme ProcexpMac -configuration Debug build
```

**테스트**:

```bash
swift test                 # 전체 테스트
swift run ProcexpSmoke     # 라이브 스모크 테스트
```

**헬퍼 포함 로컬 설치** (자체 서명 ID를 전용 키체인에 생성):

```bash
bash Scripts/dev_install_helper.sh
bash Scripts/dev_uninstall_helper.sh   # 제거
```

개발 빌드는 `ProcExp (Dev).app`과 `.dev` 번들 ID를 써서 공식 설치본과 충돌하지 않는다.

## 6. 장점

1. **Process Explorer 워크플로를 그대로 가져왔다.** 트리 색상 규칙, 하단 패널, 핸들/DLL 검색, 속성 창 탭 구성이 Windows 버전과 같아 Windows 경험자는 학습 비용이 거의 없다.
2. **서명 검증이 깊다.** 인증서 체인, Team ID, 공증 상태, 검증 실패 사유, VirusTotal을 프로세스와 모듈 단위로 한 번에 본다. 활동 모니터에는 없는 정보이고, 침해 대응 초동 분석에 바로 쓸 수 있다.
3. **무료이고 소스가 공개되어 있다.** 수집 로직을 직접 읽고 검증할 수 있다.
4. **공개 API만 사용한다.** 커널 확장이나 시스템 확장이 필요 없고, 헬퍼 없이도 기본 기능이 동작한다. 못 얻은 값을 지어내지 않는다는 원칙도 분석 도구로서 신뢰할 만하다.
5. **Apple Silicon 대응.** P/E 코어 구분, GPU 사용률, 메뉴 막대 CPU 히스토리.
6. **테스트와 릴리스 파이프라인이 갖춰져 있다.** 단위 테스트, 스모크 테스트, TCP 테스트 픽스처, 서명·공증 스크립트가 저장소에 포함된다.
7. **Sysinternals 브랜드의 지속성.** 개인 개발자 도구보다 유지보수 중단 위험이 낮을 가능성이 있다 (보장은 아님).

## 7. 단점과 주의점

1. **1.0.0의 안정성.** Hacker News 초기 반응에서 CPU·메모리 열과 하단 패널이 비어 보인다는 보고, 헬퍼 설치·승인 후 프로세스 트리가 통째로 비어 재시작해도 복구되지 않는다는 보고가 있었다. 저장소에도 필터 적용 시 목록이 빈 화면이 되는 버그 수정 PR(#19)과 `manual_test_bugs.md` 파일이 있다. "알파 수준"이라는 평가도 나왔다.
2. **LICENSE 파일이 없다.** 조회 시점 저장소 루트에는 README, SECURITY, 코드 오브 컨덕트만 있고 라이선스가 없다. 소스가 공개되어 있어도 법적으로는 사용·수정·재배포 조건이 정해지지 않은 상태다. 기업 환경 도입이나 포크, 코드 재사용 전에는 이슈 #14의 처리 결과를 확인해야 한다.
3. **macOS답지 않은 UI.** Windows 화면을 거의 그대로 옮겼다. 개발자 도구라 괜찮다는 의견과 이질적이라는 의견이 갈린다.
4. **macOS 구조상 Windows판만큼 보이지 않는다.** SIP, 샌드박스, 공개 API 제한 때문에 빈칸이 생긴다. 저장소 PR에서도 Windows와의 기능 격차를 따로 기록하고 있다.
5. **전체 가시성에는 root 데몬이 필요하다.** 타 사용자·시스템 프로세스를 보려면 상시 root 헬퍼를 설치해야 한다. 헬퍼의 XPC 인터페이스는 그 자체로 공격 표면이므로 보안 민감 환경에서는 검토 대상이다.
6. **AI 에이전트 주도로 빠르게 작성된 코드.** 기능 범위에 비해 실사용 검증 기간이 짧다. 1번 항목의 버그 양상과 연결된다.
7. **실시간 이벤트 추적이 아니다.** 폴링 방식이라 수 밀리초 만에 끝나는 프로세스는 놓칠 수 있고, 종료된 프로세스의 이력 조회 기능도 README에는 없다. 프로세스 생성 이벤트를 빠짐없이 봐야 하면 Endpoint Security 기반 도구가 맞다.
8. **커뮤니티가 아직 작다.** Star 23, Fork 5 수준이라 외부 검증과 문서가 부족하다.
9. **macOS 14 미만 미지원**, 빌드에는 최신 Xcode가 필요하다.

### 흔히 도는 설명과 다른 점

- "환경 변수 검사가 없다"는 지적은 현재 README와 맞지 않는다. 속성 창에 Environment 탭이 있다.
- 정규식 검색과 종료 프로세스 이력은 README에 언급이 없어, 이 두 가지는 경쟁 도구 대비 약점으로 볼 수 있다.

## 8. 경쟁 프로젝트

| 도구 | 형태 / 가격 | 강점 | Procexp-Mac 대비 |
| :--- | :--- | :--- | :--- |
| **ProcessSpy** | GUI + 메뉴 막대. 무료 버전, 전체 기능 $34.99 1회 구매, Setapp 포함. macOS 14+ | 프로세스 트리, 환경 변수, 열린 파일, 네트워크, 서명 검증, CPU/메모리 이력, 종료 프로세스 회상, 번들 메타데이터·entitlements | 기능이 가장 겹치는 상용 도구. macOS 네이티브 UI와 성숙도에서 앞서고, 이력·회상은 유료 |
| **ProcXray** | GUI. 기본 기능 무료 | 단일 프로세스 해부(파일, 포트, 환경 변수), 단명 프로세스 포착, 정규식 검색, 프로세스별 GPU | 한 프로세스를 깊게 볼 때 유리. 시스템 전체 그래프는 Procexp-Mac이 넓다 |
| **TaskExplorer** (Objective-See) | GUI. 무료, 오픈소스 | 서명 상태, VirusTotal, 로드된 dylib, 열린 파일, 네트워크 연결을 보안 관점에서 탐색 | 보안 분석 용도가 겹친다. 오래 검증됐지만 UI와 갱신 주기는 구식. Endpoint Security 기반 실시간 감시는 같은 제작사의 ProcessMonitor가 담당 |
| **ProcessMonitor** (Objective-See) | CLI. 무료, 오픈소스 | Endpoint Security 기반 프로세스 생성·종료 이벤트 스트림 | 스냅샷이 아닌 이벤트 추적. Procexp-Mac을 보완하는 관계 |
| **htop / btop** | 터미널. 무료, 오픈소스 | 가볍고 SSH 환경에서 사용 가능, 트리 보기 | 서명·모듈·핸들 검사는 없다 |
| **iStat Menus / Stats / Vitals** | 메뉴 막대 중심. 유료 또는 무료 | 시스템 전체 상태를 상시 표시 | 프로세스 심층 분석 도구가 아니다 |
| **활동 모니터** | macOS 내장 | 설치 불필요, 열린 파일·포트, 샘플링 | 서명 상세, 모듈 목록, 핸들 역검색, VirusTotal 없음 |
| **명령줄 내장 도구** | `ps`, `lsof`, `vmmap`, `sample`, `codesign`, `spctl`, `fs_usage` | 스크립트화, 원격 사용 | Procexp-Mac이 보여 주는 정보의 원천. GUI로 묶어 주는 것이 차이 |

## 9. 용도별 선택 가이드

- **Windows Process Explorer에 익숙하고 같은 방식으로 Mac을 보고 싶다** → Procexp-Mac. 단, 지금은 보조 도구로 쓰고 헬퍼 설치는 테스트 장비에서 먼저 확인한다.
- **침해 대응·악성코드 초동 분석** → Procexp-Mac 또는 TaskExplorer로 서명·VirusTotal 확인, ProcessMonitor로 이벤트 추적을 병행한다.
- **매일 쓰는 안정적인 개발자용 작업 관리자** → ProcessSpy.
- **특정 프로세스 하나를 깊게 디버깅** → ProcXray.
- **서버·원격·터미널** → htop, btop.
- **기업 배포나 코드 재사용** → 라이선스가 확정될 때까지 보류.

## 10. 종합 평가

Procexp-Mac의 가치는 기능 목록보다 **Sysinternals 방식의 진단 워크플로가 macOS에 공식으로 들어왔다**는 데 있다. 서명 검증과 모듈·핸들 검사를 무료로 한 화면에 묶은 점은 분명한 강점이다. 반면 1.0.0은 안정성, 라이선스, 커뮤니티 규모 모두 초기 상태이고, macOS의 보안 모델 때문에 Windows판과 같은 수준의 가시성은 구조적으로 나오기 어렵다. 지금은 주력 도구로 삼기보다 다음 몇 번의 릴리스에서 헬퍼 관련 버그와 라이선스가 정리되는지 지켜보면서 병행 사용하는 편이 맞다.

## 참고 자료

- 저장소 README: https://github.com/microsoft/Procexp-Mac
- 1.0.0 릴리스: https://github.com/microsoft/Procexp-Mac/releases/tag/1.0.0
- LICENSE 누락 이슈 #14: https://github.com/microsoft/Procexp-Mac/issues/14
- Sysinternals 블로그 공지: https://techcommunity.microsoft.com/blog/sysinternals-blog/autoruns-for-linux-procexp-for-macos-macos-tools-linux-tools-proexp-procmon-psto/4570783
- 4sysops 설치·사용 기사: https://4sysops.com/archives/install-and-use-sysinternals-autoruns-for-linux-and-process-explorer-for-macos/
- The Stack, 개발 배경 기사: https://www.thestack.technology/process-explorer-for-macos/
- Hacker News 토론: https://news.ycombinator.com/item?id=50433216
- ProcessSpy: https://process-spy.app/process-explorer-for-mac
- ProcXray: https://procxray.com/blog/task-manager-for-mac/
