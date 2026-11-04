# claude-red 프로젝트 분석

> **대상:** [SnailSploit/Claude-Red](https://github.com/SnailSploit/claude-red)
> **분석 기준일:** 2026년 11월 4일 (GitHub 저장소 README 기준)
> **한 줄 정의:** Claude를 특정 공격 영역의 숙련 운영자처럼 사고하게 만드는 `SKILL.md` 기반 공격 보안 **방법론 라이브러리**. 실행 도구가 아니라 "두뇌"를 제공한다.

---

## 1. 프로젝트 개요

`claude-red`는 Claude Skills 시스템용으로 큐레이션된 공격 보안(Offensive Security) 스킬 모음이다. 각 스킬은 구조화된 `SKILL.md` 파일 하나로, SQL 인젝션부터 셸코드, EDR 우회, ADCS 악용, 익스플로잇 개발까지 특정 공격 표면에 대한 전문가 수준의 방법론을 Claude에 주입한다.

이 클로드 스킬을 통해서 실제 해킹이 가능하다. 접근과 모의 해킹이 허용된 사이트가 아니라면 절대 해킹해서는 아니된다.

| 항목 | 내용 |
|---|---|
| 저장소 | `SnailSploit/Claude-Red` (Public) |
| 작성자 | Kai Aizen (SnailSploit) — GenAI 보안 연구자 |
| 기반 자료 | Sahar Shlichov의 `offensive-checklist` 컬렉션 |
| 규모 | **78개 스킬 / 23개 카테고리** |
| 인기도 | **Star 9.5k / Fork 1.3k / Watcher 62** (2026-11 기준) |
| 활동 | 커밋 45회, 오픈 이슈 9건, 오픈 PR 28건 |
| 라이선스 | MIT |
| 주요 파일 | `Skills/`, `install.sh`, `convert_skills.py`, `claude-skills.json`, `MINDMAP.md`, `CHANGELOG.md`, `SECURITY.md` |
| 공식 용도 | 승인된 레드팀 활동, 버그 바운티 트리아지, 보안 연구, CTF 준비, 운영자 교육, 체계적 공격 표면 탐색 |

> 참고: 이전 자료의 "6.2k Star(2026년 9월)"는 현재 9.5k로 증가했다. 오픈 PR이 28건 쌓여 있다는 점은 커뮤니티 관심이 높은 동시에 메인테이너 리뷰 처리량이 병목일 수 있음을 시사한다.

### 1.1 카테고리 구성

| 카테고리 | 스킬 수 | 초점 |
|---|---:|---|
| Web Application | 16 | OWASP Top 10, 비즈니스 로직, 고급 웹 취약점 클래스 |
| Wireless | 14 | 802.11, WPA2/3, EAP, WPS, Evil Twin, BLE, Zigbee, Z-Wave, LoRa, sub-GHz |
| Infrastructure & Red Team | 7 | 초기 침투, EDR 우회, 고급 레드팀 운영, Windows 내부 구조 |
| Exploit Development | 6 | 스택/힙 손상, ROP, 완화기법, 크래시 분석, TOCTOU |
| Fuzzing & Vuln Research | 4 | libFuzzer, AFL++, 커버리지 기반 퍼징, 취약점 분류 |
| Post-Exploitation | 3 | 측면 이동, 지속성, 데이터 유출 |
| Auth & Identity | 2 | JWT, OAuth/OIDC |
| Reconnaissance | 2 | OSINT 도구와 수집 방법론 |
| API Security | 2 | REST/gRPC/WebSocket, API 비즈니스 로직 |
| Container & Kubernetes | 2 | 컨테이너 탈출, K8s 클러스터 공격 |
| CI/CD & Pipeline | 2 | 파이프라인 악용, 시크릿 추출 |
| Cryptography | 2 | 암호 구현 공격, TLS/SSL |
| Privilege Escalation | 2 | Linux / Windows 권한 상승 |
| Forensics & C2 | 2 | 안티 포렌식, C2 프레임워크 |
| Supply Chain | 2 | 공급망 공격, 의존성 혼동 |
| Social Engineering | 2 | 피싱, 비싱·스미싱·물리 SE |
| Utility | 2 | 빠른 트리아지 체크리스트, 전문 보고서 작성 |
| Active Directory | 1 | 온프레미스 AD 공격 방법론 (ADCS ESC1–15 포함) |
| Cloud | 1 | AWS·Azure·GCP 공격 경로 |
| Mobile | 1 | Android·iOS 앱 테스트 |
| IoT & Embedded | 1 | 하드웨어, 펌웨어, RTOS, ICS/OT |
| Network Attacks | 1 | L2/L3 공격, MITM, 프로토콜 포이즈닝 |
| AI Security | 1 | 프롬프트 인젝션, 탈옥, RAG 포이즈닝, 모델 추출 |

### 1.2 로드맵

| 단계 | 초점 | 추가 스킬 | 상태 |
|---|---|---:|---|
| 1 | Internal AD/Windows 세분화 | +16 | 계획 |
| 2 | 클라우드 ID (Entra, ADFS, Okta, M365) | +10 | 계획 |
| 3 | Wireless 확장 | +12 | **완료** |
| 4 | IoT (UART/JTAG, 플래시 추출, 결함 주입, RTOS, ICS) | +10 | 계획 |
| 5 | 웹 기초 (정찰, 인증 우회, 접근제어, CSRF, CORS) | +8 | 계획 |
| 6 | 웹 고급 (프로토타입 오염, SAML, OIDC, WebSocket, SSI/ESI) | +10 | 계획 |
| 7 | 문서·툴링 정비 | — | **완료** |
| 8 | 신규 10개 도메인 20개 스킬 | +20 | **완료** |
| 9 | 심화 재작성 (역직렬화, GraphQL, 고급 레드팀, SSTI) | — | **완료** |

최종 목표는 **23개 이상 카테고리, 약 130개 스킬**이다.

---

## 2. 장점

### 2.1 방법론의 구조화와 실전성
각 스킬은 개념 설명에 그치지 않고 표준 작업 흐름, 탐지 프로브 아이디어, 공격 체인, 도구 사용법, 우회 기법, 경계 사례, 보고서 요건까지 담는다. Claude가 교과서식 답변이 아니라 현장 선배의 노하우에 가까운 순서로 사고하게 만든다는 것이 핵심 가치다.

### 2.2 컨텍스트 효율성 (Skills 시스템의 이점)
Skills는 대화 내용과 스킬 설명이 맞을 때만 본문을 로드한다. SQL 인젝션을 이야기하면 `offensive-sqli`만 올라오고, 무선 관련 14개 문서는 컨텍스트를 차지하지 않는다. 78개 문서를 거대한 단일 프롬프트로 붙여넣는 방식과 비교하면 토큰 비용과 주의력 분산 양쪽에서 유리하다.

### 2.3 넓은 공격 표면 커버리지
웹(16), 무선(14), 인프라·레드팀(7), 익스플로잇 개발(6)을 축으로 AD, 클라우드, 모바일, IoT, AI 보안, 공급망, CI/CD, 컨테이너까지 포함한다. 특히 무선 영역은 BLE·Zigbee·Z-Wave·LoRa·sub-GHz까지 세분화되어 있어 다른 AI 보안 프로젝트에서 찾기 어려운 밀도를 보인다.

### 2.4 낮은 진입 장벽과 모듈성
`git clone` 한 줄로 쓸 수 있고 컴파일이나 의존성 설치가 필요 없다. `sparse-checkout`이나 `install.sh --category`로 필요한 카테고리만 가져올 수 있다. 결과물이 순수 Markdown이므로 사내 위키나 교육 자료로 재가공하기도 쉽다.

### 2.5 보고서 품질까지 포함
`offensive-reporting`(CVSS 점수, 증거 기준, 경영진 요약)과 `offensive-fast-checking`(퀵윈 체크리스트)이 별도 유틸리티로 있다. 실제 계약 업무에서 시간이 가장 많이 드는 보고서 작성 단계까지 표준화할 수 있다.

### 2.6 커뮤니티 동력
9.5k Star와 1.3k Fork, 다단계 로드맵, 기여 가이드(스킬 템플릿·frontmatter 표준·리뷰 절차)가 갖춰져 있다. "하나의 거대한 개요보다 단일 공격 표면에 집중한 스킬"을 선호한다는 기여 원칙도 명확하다.

---

## 3. 단점 및 유의사항

### 3.1 Claude 생태계 종속성
가장 큰 제약이다. 자동 로딩과 트리거 이점은 Claude Skills에서만 성립한다. GPT, Gemini, 로컬 LLM에서는 `SKILL.md`를 수동으로 시스템 프롬프트에 넣어야 하고, 이 경우 2.2의 컨텍스트 효율이 사라진다. 실질적으로 **Claude 전용**이다.

### 3.2 실행 도구가 아님
스킬은 지식과 절차를 담은 문서일 뿐, 스캐너나 익스플로잇 프레임워크가 아니다. 실제 테스트에는 Burp Suite, sqlmap, Metasploit, Nuclei 등 별도 도구가 필요하다. "설치하면 자동으로 공격한다"는 기대는 오해다.

### 3.3 자동 트리거의 불완전성
외부 리뷰에 따르면 78개 중 **약 1/3만** 명확한 자동 트리거 선언(frontmatter의 `description`이 트리거로 기능할 만큼 구체적인 경우)을 갖췄다고 한다. 나머지는 대화에서 스킬 이름을 직접 지목해야 안정적으로 로드될 수 있다. *(이 수치는 제3자 리뷰 기준이며 저장소 공식 수치가 아니다.)*

### 3.4 설치 경로·CLI 문법의 검증 필요
- **디렉터리 깊이 문제:** README의 권장 설치(`~/.claude/skills/claude-red`)는 실제 `SKILL.md`가 `claude-red/Skills/<category>/<skill>/SKILL.md`로 여러 단계 아래에 놓이게 만든다. Claude Code는 일반적으로 `~/.claude/skills/<skill-name>/SKILL.md` 구조를 탐색하므로, 그대로 두면 인식되지 않을 수 있다. `install.sh`가 이를 평탄화하는지 확인하거나, 스킬 폴더를 직접 한 단계 위로 링크하는 편이 안전하다 (사용법 4.2 참조).
- **`--system-file` 플래그:** README의 `claude --system-file -` 문법은 현재 Claude Code CLI 옵션과 다를 수 있다. 사용 전 `claude --help`로 시스템 프롬프트 관련 옵션(`--append-system-prompt` 등)을 확인할 것.

### 3.5 보안·윤리적 위험
공격 방법론을 AI에 이식하는 특성상 무권한 대상에 대한 악용 가능성이 있다. README는 합법 용도를 명시하지만 강제 장치는 없다. 또한 Claude 자체의 안전 정책은 스킬이 로드되어도 그대로 적용되므로, 스킬이 있다고 해서 정책상 거절되는 요청(실제 악성코드 작성 등)이 허용되지는 않는다. 조직 도입 시에는 범위(Scope) 문서, 승인서(RoE), 로깅 정책을 함께 갖춰야 한다.

### 3.6 품질 편차와 유지보수 부담
웹(16)·무선(14)은 촘촘한 반면 AD·클라우드·모바일·IoT·AI 보안은 각 1개 스킬에 압축되어 있다. 로드맵 1·2·4단계가 아직 "계획" 상태이므로 해당 영역은 현재 깊이가 얕다. 또 공격 기법과 도구가 빠르게 바뀌기 때문에, 커뮤니티 기여에 의존하는 구조에서 특정 스킬이 오래된 내용을 담고 있을 위험이 상존한다.

### 3.7 공급망 관점의 리스크
`install.sh`를 실행하거나 저장소 전체를 스킬 디렉터리에 넣으면, 향후 `git pull` 시 들어오는 변경이 그대로 Claude의 행동 지침이 된다. 스킬 파일은 사실상 프롬프트이므로 **악의적 PR이 병합되면 프롬프트 인젝션 경로**가 될 수 있다. 특정 커밋 해시로 고정하고, 업데이트 시 diff를 검토하는 운영을 권장한다.

---

## 4. 사용법 — 설치 케이스별

### 4.1 케이스 A: Claude Code 전체 설치 (README 권장 방식)

```bash
git clone https://github.com/SnailSploit/claude-red ~/.claude/skills/claude-red
```

- **장점:** 가장 간단하다.
- **확인할 것:** 3.4의 디렉터리 깊이 문제. 설치 후 Claude Code에서 스킬 목록이 실제로 인식되는지 확인한다.
- **적합한 사람:** 여러 영역을 오가며 테스트하는 개인 연구자.

### 4.2 케이스 B: 스킬 단위 링크 설치 (인식 문제 회피)

```bash
git clone https://github.com/SnailSploit/claude-red ~/src/claude-red
cd ~/src/claude-red
git checkout <검토한-커밋-해시>        # 버전 고정 권장

# 필요한 스킬만 ~/.claude/skills 아래에 한 단계로 링크
mkdir -p ~/.claude/skills
for d in Skills/web/offensive-sqli Skills/utility/offensive-reporting; do
  ln -s "$PWD/$d" ~/.claude/skills/$(basename "$d")
done
```

- **장점:** 표준 스킬 구조와 일치하고, 쓰는 스킬만 노출된다. 버전 고정으로 3.7 리스크를 줄인다.
- **적합한 사람:** 팀 표준 환경을 만드는 리드, 공급망 리스크에 민감한 조직.

### 4.3 케이스 C: 카테고리 선택 설치 (Sparse Checkout)

```bash
git clone --filter=blob:none --sparse https://github.com/SnailSploit/claude-red
cd claude-red
git sparse-checkout set Skills/web Skills/api Skills/utility
```

- **장점:** 웹·API 전문 팀처럼 영역이 명확할 때 불필요한 스킬을 아예 받지 않는다.
- **이후:** 케이스 B처럼 개별 스킬을 링크하면 된다.

### 4.4 케이스 D: 설치 스크립트

```bash
./install.sh                            # 대화형
./install.sh --target ~/.claude/skills  # 대상 경로 지정
./install.sh --category web             # 단일 카테고리
```

- **확인할 것:** 실행 전 `install.sh` 내용을 직접 읽어볼 것. 셸 스크립트를 검토 없이 실행하지 않는 것은 보안 프로젝트를 쓰는 사람의 기본 습관이다.

### 4.5 케이스 E: 단일 세션에 한 스킬만 주입 (Claude Code CLI)

README 예시:
```bash
cat Skills/web/offensive-sqli/SKILL.md | claude --system-file -
```

- **확인할 것:** 3.4대로 현재 CLI 옵션명을 `claude --help`로 확인한다. 옵션이 다르면 `--append-system-prompt "$(cat Skills/web/offensive-sqli/SKILL.md)"` 같은 형태로 대체한다.
- **적합한 상황:** 특정 스킬의 효과를 다른 스킬 간섭 없이 시험해볼 때, 혹은 CI에서 비대화형으로 보고서 초안을 만들 때.

### 4.6 케이스 F: Claude.ai 프로젝트 (수동)

1. 필요한 `SKILL.md` 내용을 복사한다.
2. Claude.ai 프로젝트의 **지침(Instructions)** 에 붙여넣거나, 대화 첫 메시지 앞에 붙인다.
3. 여러 스킬을 넣을수록 컨텍스트가 커지므로 프로젝트당 1~3개로 제한한다.

- **대안:** 계정에서 커스텀 스킬 업로드 기능을 쓸 수 있다면, 스킬 폴더를 그대로 업로드하는 편이 자동 로딩 이점을 살린다.
- **적합한 사람:** CLI 없이 웹에서 보고서·분석 작업 위주로 쓰는 사용자.

### 4.7 케이스 G: 비(非)Claude 모델에서 재사용

`convert_skills.py`와 `claude-skills.json`을 활용하거나, `SKILL.md`를 해당 모델의 시스템 프롬프트로 수동 투입한다. 자동 트리거는 없으므로 작업 주제에 맞는 스킬 1~2개만 골라 넣는 것이 현실적이다.

---

## 5. 사용법 — 업무 시나리오별

> 모든 시나리오의 전제: **서면 승인(RoE)과 범위 문서가 있는 대상**에만 적용한다.

### 5.1 버그 바운티 트리아지
- **추천 스킬:** `offensive-fast-checking`, `offensive-idor`, `offensive-api-security`, `offensive-reporting`
- **흐름:** 프로그램 범위(Scope)와 제외 항목을 먼저 Claude에 제공 → 퀵윈 체크리스트로 우선순위 정리 → 발견 사항을 CVSS와 재현 절차 중심 보고서로 정리.
- **팁:** 프로그램 정책(자동화 스캔 금지, 레이트 리밋 등)을 대화 초반에 넣어두면 Claude가 그 안에서 계획을 세운다.

### 5.2 승인된 레드팀·모의해킹 계약
- **추천 스킬:** `offensive-osint-methodology`, `offensive-active-directory`, `offensive-lateral-movement`, `offensive-reporting`
- **흐름:** 정찰 계획 → 공격 경로 가설 → 고객 환경에서 검증(실행은 사람이 기존 도구로) → 탐지 여부 기록 → 보고서.
- **팁:** Claude에는 기술 판단과 문서화를 맡기고, 실제 실행과 증거 수집은 운영자가 통제한다. 이 역할 분리가 "LLM은 엑셀이지 오라클이 아니다"라는 원칙과 맞는다.

### 5.3 CTF 준비·교육
- **추천 스킬:** `offensive-basic-exploitation`, `offensive-exploit-dev-course`, `offensive-fuzzing-course`, `offensive-crypto-attacks`
- **흐름:** 커리큘럼형 스킬을 따라 개념 → 실습 환경(로컬 VM, 공개 CTF) → 풀이 회고.
- **팁:** "답을 알려줘"보다 "다음에 무엇을 확인해야 하는지 질문으로 유도해줘"라고 요청하면 학습 효과가 크다.

### 5.4 취약점 연구·퍼징
- **추천 스킬:** `offensive-fuzzing`, `offensive-crash-analysis`, `offensive-bug-identification`, `offensive-vuln-classes`
- **흐름:** 퍼징 대상 선정과 하네스 설계 검토 → 크래시 분류·근본 원인 분석 → 책임 있는 공개(벤더·ZDI 등) 보고서 작성.
- **팁:** 크래시 로그와 스택 트레이스를 붙여 트리아지를 맡기는 용도에서 효용이 가장 크다.

### 5.5 블루팀·퍼플팀 (탐지 엔지니어링)
- **추천 스킬:** `offensive-lateral-movement`, `offensive-persistence`, `offensive-edr-evasion`, `offensive-anti-forensics`
- **흐름:** 공격 기법을 MITRE ATT&CK에 매핑 → 각 기법이 남기는 로그·아티팩트 목록 도출 → SIEM 탐지 룰과 헌팅 쿼리 설계 → 퍼플팀 연습으로 검증.
- **팁:** 공격 스킬을 "방어 관점에서 무엇이 보이는가"로 재질문하는 방식이 가장 안전하고 생산적인 활용법이다.

### 5.6 AI·LLM 보안 평가
- **추천 스킬:** `offensive-ai-security`
- **흐름:** 프롬프트 인젝션·RAG 포이즈닝 위협 모델 수립 → Promptfoo, PyRIT, Garak 같은 LLM 레드팀 도구로 실제 측정 → 결과 보고.
- **팁:** 이 영역은 현재 스킬 1개뿐이라 깊이가 얕다. 전용 LLM 레드팀 도구와 병행하는 것을 전제로 한다.

### 5.7 클라우드·컨테이너·CI/CD 점검
- **추천 스킬:** `offensive-cloud`, `offensive-container-escape`, `offensive-k8s-attacks`, `offensive-cicd-pipeline`, `offensive-cicd-secrets`
- **흐름:** IaC·파이프라인 설정 리뷰 → 권한 상승 경로 가설 → 자사 스테이징 환경에서 검증 → 시정 조치 우선순위화.
- **팁:** 자사 GitHub Actions 워크플로 파일을 붙여 "인젝션 가능 지점 리뷰"를 요청하는 방식이 즉시 가치를 낸다.

---

## 6. 유사 프로젝트 비교

`claude-red`는 **지식·방법론 계층**에 특화되어 있고, 아래 프로젝트들은 주로 **실행·자동화 계층**에 무게를 둔다.

| 프로젝트 | 계층 | 성격 | 주요 특징 | claude-red와의 관계 |
|---|---|---|---|---|
| **claude-red** | 지식 | 방법론 라이브러리 | 78개 `SKILL.md`, Claude Skills 전용, 실행 기능 없음 | 기준 |
| **RedAmon** | 실행 | 자율 모의해킹 프레임워크 | 공격 표면 그래프 매핑, Kali 샌드박스 자율 실행, MCP 양방향 | 두뇌(claude-red) + 몸(RedAmon) 조합 가능 |
| **HexStrike AI** | 실행 | MCP 서버 | AI 에이전트가 150개 이상 보안 도구를 실행하도록 연결 | 스킬로 판단, MCP로 실행하는 보완 관계 |
| **Raptor** | 에이전트 | Claude Code 보안 에이전트 | `CLAUDE.md`·규칙·서브에이전트로 공격·방어 범용 에이전트화 | 같은 Claude 생태계, 에이전트 구성 vs 지식 주입 |
| **CAI (Cybersecurity AI)** | 프레임워크 | AI 보안 프레임워크 | 다양한 모델과 에이전트 패턴, 넓은 생태계 지향 | 모델 중립성에서 claude-red보다 유연 |
| **PentAGI** | 실행 | 자율 펜테스트 에이전트 | 복잡한 펜테스트 작업을 수행하는 완전 자율 시스템 | 자율성 최대, 통제·감사 부담도 큼 |
| **Promptfoo / PyRIT / Garak** | 실행 | LLM 레드팀 도구 | LLM 대상 공격 자동화·평가 | `offensive-ai-security` 스킬의 실행 짝 |

### 6.1 선택 가이드

| 상황 | 추천 |
|---|---|
| Claude를 쓰고 있고, 사람이 실행을 통제하며 판단 품질을 높이고 싶다 | **claude-red** |
| 도구 실행까지 AI에 위임하고 싶다 | HexStrike AI(MCP) 또는 RedAmon + claude-red |
| 모델에 종속되고 싶지 않다 | CAI |
| 완전 자율 실험을 격리된 랩에서 해보고 싶다 | PentAGI |
| LLM 애플리케이션 자체를 평가해야 한다 | Promptfoo·PyRIT·Garak (+ `offensive-ai-security`) |

**요약:** `claude-red`는 Claude가 숙련 운영자처럼 생각하게 만드는 **두뇌**이고, RedAmon·HexStrike AI 같은 프로젝트는 그 두뇌가 도구를 움직이게 하는 **몸**이다. 실무에서는 두뇌만 도입해 사람이 손을 쥐고 있는 구성이 가장 통제 가능하고 감사 추적도 쉽다.

---

## 7. 도입 체크리스트

- [ ] 사용 목적이 승인된 범위(RoE·Scope 문서)에 근거하는가
- [ ] 저장소를 특정 커밋으로 고정했는가, 업데이트 시 diff를 검토하는가
- [ ] `install.sh`를 실행 전에 읽어봤는가
- [ ] 설치 후 스킬이 실제로 인식되는지 확인했는가 (디렉터리 깊이)
- [ ] CLI 옵션명을 현재 버전 기준으로 확인했는가
- [ ] 필요한 스킬만 노출해 컨텍스트와 오남용 표면을 줄였는가
- [ ] 실제 실행은 사람이 기존 도구로 통제하고, 결과를 로깅하는가
- [ ] 얕은 영역(AD·클라우드·모바일·IoT·AI)은 별도 자료로 보완하는가

---

## 8. 종합 평가

| 평가 축 | 점수 (5점) | 코멘트 |
|---|:---:|---|
| 방법론 품질 | ★★★★☆ | 웹·무선은 뛰어나고, 일부 영역은 단일 스킬로 압축 |
| 커버리지 | ★★★★☆ | 23개 카테고리로 넓지만 깊이가 고르지 않음 |
| 사용 편의성 | ★★★☆☆ | 설치는 쉬우나 디렉터리 구조·CLI 문법 검증 필요 |
| 이식성 | ★★☆☆☆ | 사실상 Claude 전용 |
| 운영 안전성 | ★★★☆☆ | 버전 고정·diff 검토 없이 쓰면 공급망 리스크 |
| 커뮤니티·성장성 | ★★★★★ | 9.5k Star, 명확한 로드맵, 기여 표준 보유 |

**결론:** Claude를 이미 보안 업무에 쓰는 팀이라면 도입 비용이 거의 없고, 판단 품질과 보고서 표준화에서 즉각적인 효과를 볼 수 있다. 다만 "자동 공격 도구"가 아니라 "운영자의 사고 틀"이라는 정체성을 정확히 이해하고, 버전 고정과 범위 통제를 운영 원칙으로 삼아야 한다.

---

*작성: Dennis Kim (김호광) · Cyworld 전 대표 · [github.com/gameworkerkim](https://github.com/gameworkerkim)*
