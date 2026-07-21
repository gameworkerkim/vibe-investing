# Robinhood MCP Getting Started 가이드

> 최종 검증일: 2026-07-21 | 상태: 공개 정보 기준 사실 확인 완료
> 원문 대비 주요 정정: (1) Robinhood 공식 Agentic Trading MCP 누락 보완, (2) "대부분 비공식 API" 서술 정정, (3) 개별 레포지토리 설치 명령·인증 방식 최신화

---

## 1. 개요

Robinhood MCP(Model Context Protocol) 생태계는 크게 **두 계층**으로 나뉜다. 원문은 커뮤니티 레포지토리만 다루었으나, 2026년 5월 27일 Robinhood가 공식 MCP 서버를 출시하면서 판도가 바뀌었다.

| 계층 | 성격 | 인증 | 리스크 |
|------|------|------|--------|
| 공식 Agentic Trading MCP | Robinhood 직접 제공, 베타 | OAuth (전용 에이전틱 계좌) | 전용 계좌로 격리, 본 포트폴리오 접근 불가 |
| 커뮤니티 MCP 서버 | 서드파티 (robin_stocks 등 비공식 API 또는 공식 Crypto API 래핑) | 계정 비밀번호 / API 키 / 원격 OAuth | 계정 제재 가능성, 자격증명 관리 책임 전가 |

**정정 사항**: 원문의 "대부분의 레포지토리는 비공식 API를 사용합니다"는 절반만 맞다. `robin_stocks` 기반(verygoodplugins, open-stocks-mcp 등)은 비공식이 맞지만, Robinhood **Crypto API는 공식 API**(API 키 + Ed25519 개인키 방식)이며, 무엇보다 이제 **공식 주식 거래 MCP**가 존재한다.

---

## 2. 공식: Robinhood Agentic Trading MCP

> 엔드포인트: `https://agent.robinhood.com/mcp/trading`
> 안내: https://robinhood.com/us/en/agentic-trading/

2026년 5월 27일 출시된 Robinhood의 공식 에이전트 거래 인프라. 커뮤니티 레포지토리들이 우회하던 문제(비공식 API 차단 리스크, 자격증명 노출)를 구조적으로 해결한다.

| 항목 | 내용 |
|------|------|
| 출시 | 2026-05-27, 베타 (이메일 초대 순차 롤아웃) |
| 지원 자산 | 주식(equities). 옵션은 순차 롤아웃 중. 크립토·선물·이벤트 계약은 로드맵 |
| 계좌 구조 | 본 계좌와 완전 분리된 전용 에이전틱 계좌. 에이전트는 해당 계좌 입금액만 접근 가능 |
| 안전장치 | 거래별 푸시 알림, 실시간 활동 피드, 거래 사전 프리뷰 승인 옵션, 원탭 연결 해제, 사기 탐지 |
| 지원 에이전트 | Claude, Claude Code, Claude Desktop, ChatGPT, Codex, Cursor, Grok 등 MCP 호환 전반 |
| 전제 조건 | 미국 Robinhood 개인 계좌(정상 상태), 초기 설정은 데스크톱에서만 가능 |

### 연결 방법

**Claude Code (터미널)**:
```bash
claude mcp add robinhood-trading --transport http https://agent.robinhood.com/mcp/trading
```

**Claude Desktop / Claude.ai**:
1. Settings → Connectors → Add custom connector
2. URL: `https://agent.robinhood.com/mcp/trading`
3. OAuth 인증 후 Robinhood 모바일 앱에서 검증 단계 완료

**Codex CLI**:
```bash
codex mcp add robinhood-trading --url https://agent.robinhood.com/mcp/trading
```

### 유의점

- 베타 단계이므로 모든 사용자가 즉시 접근 가능한 것은 아니다 (자격 시 이메일 통보)
- 에이전트가 생성한 손실은 전적으로 사용자 책임 — Robinhood는 보상하지 않음을 약관에 명시
- 미국 계좌 전용. 한국 등 비거주자는 커뮤니티 서버 또는 별도 브로커 대안 검토 필요

---

## 3. 커뮤니티 레포지토리 분석

### 3.1 verygoodplugins/robinhood-mcp — 읽기 전용 리서치

> https://github.com/verygoodplugins/robinhood-mcp

| 항목 | 내용 |
|------|------|
| 목적 | 읽기 전용 포트폴리오 리서치 (거래 기능 미노출) |
| 스택 | Python, robin_stocks(비공식 API) 래핑 |
| 설치 | `pip install robinhood-mcp` 또는 `uvx robinhood-mcp` |
| 규모 | GitHub 스타 약 18개 (소규모 프로젝트) |

**기능**: 포트폴리오 가치·섹터 집중도·손익, 종목 기초분석·뉴스·애널리스트 평점, 배당 분석, 실적 캘린더, 옵션 포지션, 체결 단위 주문 내역.

**원문 보강 — 인증 동작 방식** (원문에 누락된 실무상 중요 정보):
- TOTP 시크릿이 없으면 서버가 Robinhood 앱 **푸시 승인 대기** 상태가 됨. `ROBINHOOD_APPROVAL_TIMEOUT`(기본 60초) 내에 앱에서 승인해야 함
- 승인 후 세션이 `~/.tokens/robinhood.pickle`에 캐시되어 이후 호출은 재로그인 불필요
- 로그인 실패 시 오류가 약 5분간 캐시됨 — 즉시 재시도하려면 Claude Desktop 재시작 필요

**Claude Desktop 설정**:
```json
{
  "mcpServers": {
    "robinhood": {
      "command": "uvx",
      "args": ["robinhood-mcp"],
      "env": {
        "ROBINHOOD_USERNAME": "your_email",
        "ROBINHOOD_PASSWORD": "your_password",
        "ROBINHOOD_TOTP_SECRET": "your_2fa_secret"
      }
    }
  }
}
```

---

### 3.2 trayders/trayd-mcp — 원격 풀 트레이딩

> https://github.com/trayders/trayd-mcp | 서버: `https://mcp.trayd.ai/mcp`

| 항목 | 내용 |
|------|------|
| 목적 | Claude(웹/CLI)에서 Robinhood 실계좌 거래 |
| 구조 | 원격 서버(AWS ECS) + Clerk Google 인증. 로컬 설치 불필요 |
| 자격증명 | Robinhood 토큰은 메모리에만 보관(디스크 미저장), 재시작 시 소멸, 로그아웃 시 즉시 삭제 |
| 특기사항 | claude.ai 웹앱에서 동작하는 유일한 계열의 트레이딩 MCP |

**원문 보강**:
- 지정가 주문은 기본적으로 24시간 연장거래로 접수됨
- 시세는 24/7 제공 — 장중에는 Robinhood 실시간, 장외에는 파트너 데이터 소스로 자동 폴백
- 멀티 계좌 지원(복수 Robinhood 계좌를 하나의 연결로 관리)
- 영구 메모리: 마크다운 노트 기반 개인 지식베이스를 Claude가 읽고 씀 (세션 간 유지)
- Claude Code `/loop`와 조합하면 스케줄 기반 자동매매 에이전트 구성 가능 ("5분마다 포지션 점검, 3% 하락 시 매도" 류)

**설정 (Claude.ai 웹)**:
1. Settings → Connectors → Add custom connector
2. Name: `trayd` / URL: `https://mcp.trayd.ai/mcp`
3. Connect → Google 로그인 → 채팅에서 "Link my Robinhood account" 입력 → 휴대폰 2FA 승인

**설정 (Claude Code)**:
```bash
claude mcp add --transport http trayd https://mcp.trayd.ai/mcp --scope user
```

**리스크 평가**: 원격 서버에 자격증명이 통과(pass-through)되는 구조. 코드는 공개돼 있으나 실제 운영 서버가 공개 코드와 동일하다는 보장은 사용자가 검증할 수 없다. 공식 Agentic Trading 접근이 가능하다면 공식 경로가 신뢰 모델상 우위.

---

### 3.3 kevin1chun/robinhood-for-agents — 멀티 에이전트 툴킷

> https://github.com/kevin1chun/robinhood-for-agents

| 항목 | 내용 |
|------|------|
| 목적 | 주식·옵션·크립토 거래를 위한 AI 에이전트 통합 (듀얼 모드: MCP 도구 또는 TypeScript 클라이언트 직접 호출) |
| 스택 | TypeScript, Bun v1.3+, Chrome(브라우저 자동 로그인으로 OAuth 토큰 캡처) |
| 호환 | Claude Code, Codex, OpenClaw 등. 대화형 온보딩이 에이전트 자동 감지 |
| 라이선스 | MIT-0 |

**원문 정정**:
- 원문의 "49개 MCP 도구"는 특정 시점 수치로, 버전에 따라 변동. 현재 문서는 도구 개수 대신 "MCP tools 또는 TypeScript client 듀얼 모드"로 설명함
- Claude Code 수동 등록 명령이 변경됨. 원문의 `bunx robinhood-for-agents`가 아니라 현재 README 기준:

```bash
claude mcp add -s user robinhood-for-agents -- bun run /path/to/bin/robinhood-for-agents.ts
```

**설치 (권장 — 대화형 온보딩)**:
```bash
npx robinhood-for-agents onboard
# 또는 에이전트 지정
npx robinhood-for-agents onboard --agent claude-code
```

로컬 실행과 Docker/원격 호스트 배포를 모두 지원하며, 온보딩 과정에서 선택한다.

**보안 유의**: Chrome 자동화로 로그인 세션의 OAuth 토큰을 캡처하는 방식이다. 동작 원리상 정당하지만 민감한 패턴이므로 사용 전 코드 검토 권장.

---

### 3.4 Open-Agent-Tools/open-stocks-mcp — 멀티 브로커

> https://github.com/Open-Agent-Tools/open-stocks-mcp

| 항목 | 내용 |
|------|------|
| 목적 | Robinhood + Charles Schwab 멀티 브로커 MCP 서버 |
| 스택 | Python, HTTP/STDIO transport, Docker 지원 |
| 거래 | 주식·옵션 주문 실거래 검증 완료 (Robinhood) |
| 설치 | `pip install open-stocks-mcp` (소스 개발 시 `uv sync`) |

**설정** (`.env`):
```env
ROBINHOOD_USERNAME=your_email@example.com
ROBINHOOD_PASSWORD=your_password
# Schwab 병행 시
SCHWAB_API_KEY=your_api_key
SCHWAB_APP_SECRET=your_app_secret
SCHWAB_CALLBACK_URL=https://127.0.0.1:8182/
ENABLED_BROKERS=robinhood,schwab
```

**실행 및 확인**:
```bash
open-stocks-mcp-server --transport http --port 3001
curl http://localhost:3001/health
curl http://localhost:3001/metrics   # Prometheus 메트릭
```

Schwab 측은 공식 OAuth를 사용하지만 Robinhood 측은 robin_stocks 비공식 API 의존.

---

### 3.5 robinhood-mcp (npm) — Crypto API 전용

> https://www.npmjs.com/package/robinhood-mcp

| 항목 | 내용 |
|------|------|
| 목적 | Robinhood **공식 Crypto API** 실행 툴킷 |
| 스택 | TypeScript/Node.js |
| 인증 | API 키 + Base64 인코딩 개인키 (계정 비밀번호 불필요 — 이 점에서 robin_stocks 계열보다 안전) |

**정정**: 원문은 이 패키지를 "비공식" 범주에 묶었으나, Robinhood Crypto API는 공식 제공 API다. 다만 **샌드박스가 없어 모든 주문이 실제 현금으로 실행**된다는 원문 경고는 정확하며 그대로 유효하다.

**안전장치** (원문 유지, 검증됨):

| 가드 | 설명 |
|------|------|
| 별도 바이너리 | 데이터 전용 서버에는 거래 도구 미등록 |
| 명시적 옵트인 | `ROBINHOOD_CRYPTO_ENABLE_TRADING=1` 필수 |
| 주문당 USD 상한 | 기본 $100 초과 시 거부 |
| 일일 누적 상한 | 일일 총 거래액 제한 |
| 심볼 허용목록 | 지정 페어만 거래 |
| 매수 전용 모드 | `ROBINHOOD_CRYPTO_BUY_ONLY=1` 시 매도 거부 |
| 가드 모드 | 기본값: 확인 없이 주문 미실행 |
| 킬 스위치 | `risk_kill_switch_engage`로 전체 실행 중단 |

```bash
npm install -g robinhood-mcp
export ROBINHOOD_CRYPTO_API_KEY="your_api_key"
export ROBINHOOD_CRYPTO_PRIVATE_KEY="your_base64_private_key"
export ROBINHOOD_CRYPTO_ENABLE_TRADING=1   # 거래 시에만
robinhood-mcp
```

---

### 3.6 rohitsingh-iitd/robinhood-mcp-server — Crypto REST/WebSocket

> https://github.com/rohitsingh-iitd/robinhood-mcp-server

원문 내용 대체로 유효. Python 3.8+, FastAPI 기반으로 공식 Crypto API를 REST(`:8000`) + WebSocket(`:8001`)으로 노출한다. 단, 유지보수 활동이 활발하지 않은 개인 프로젝트이므로 프로덕션 용도라면 3.5의 npm 패키지 쪽이 안전장치 면에서 우위.

---

## 4. 선택 가이드 (정정판)

| 사용 목적 | 1순위 | 비고 |
|-----------|-------|------|
| 미국 계좌 보유 + 주식 자동거래 | **공식 Agentic Trading MCP** | 유일한 공식 경로. 전용 계좌 격리 |
| 포트폴리오 조회·리서치만 | verygoodplugins/robinhood-mcp | 거래 미노출로 오발주 원천 차단 |
| claude.ai 웹앱에서 즉시 거래 | trayd-mcp | 설치 0, 단 원격 서버 신뢰 필요 |
| 크립토 거래 (안전장치 중시) | npm robinhood-mcp | 공식 Crypto API, USD 상한·킬 스위치 |
| Robinhood + Schwab 병행 | open-stocks-mcp | 멀티 브로커 유일 |
| Claude 외 다양한 에이전트 | robinhood-for-agents | Codex, OpenClaw 등 지원 |

**의사결정 원칙**: 공식 Agentic Trading 자격이 있으면 공식을 쓴다. 커뮤니티 서버의 존재 이유는 (1) 베타 미초대, (2) 크립토 등 미지원 자산, (3) 조회 전용 리서치, (4) 멀티 브로커 — 이 네 가지 갭뿐이다.

---

## 5. 빠른 시작: 3가지 경로

### 경로 A — 공식 (주식 거래, 권장)

```bash
# 1. Robinhood 앱/웹에서 Agentic 계좌 개설 및 입금 (데스크톱 필수)
# 2. Claude Code에 등록
claude mcp add robinhood-trading --transport http https://agent.robinhood.com/mcp/trading
# 3. Claude Code 재시작 → /mcp → robinhood-trading 선택 → OAuth 인증
# 4. 모바일 앱에서 검증 단계 승인
```

### 경로 B — 설치 제로 (trayd)

```bash
claude mcp add --transport http trayd https://mcp.trayd.ai/mcp --scope user
# /mcp → trayd → Authorize → Google 로그인 → "Link my Robinhood account"
```

### 경로 C — 로컬 읽기 전용 (리서치)

```bash
pip install robinhood-mcp
export ROBINHOOD_USERNAME="your_email@example.com"
export ROBINHOOD_PASSWORD="your_password"
export ROBINHOOD_TOTP_SECRET="your_totp_secret"   # 없으면 앱 푸시 승인 60초 대기
uvx robinhood-mcp
```

---

## 6. 주의사항 (정정판)

1. **API 지위 구분**: 공식 Agentic Trading MCP(주식)와 Crypto API는 공식이다. robin_stocks 기반 서버(verygoodplugins, open-stocks-mcp의 Robinhood 측)만 비공식이며, 예고 없이 차단될 수 있고 계정 제재 가능성이 있다.
2. **샌드박스 부재**: Crypto API는 테스트 환경이 없다. 커뮤니티 서버의 지정가 테스트 기법(체결 불가능한 낮은 가격의 지정가 주문 후 취소)으로 연결만 검증하는 방식을 권한다.
3. **자격증명 관리**: 계정 비밀번호를 환경변수로 넘기는 방식(robin_stocks 계열)이 가장 취약하다. 우선순위: 공식 OAuth > Crypto API 키 > 원격 pass-through > 비밀번호 환경변수.
4. **관할권**: 공식 Agentic Trading은 미국 개인 계좌 전용이며 베타 초대제다. 비미국 거주자는 이 문서의 공식 경로를 사용할 수 없다.
5. **책임 소재**: 에이전트가 낸 손실은 전 경로 공통으로 사용자 부담이다. Robinhood는 공식 경로에서도 에이전트 손실을 보상하지 않는다고 명시한다.
6. **규제 동향**: SEC·CFTC가 AI 에이전트의 주문 집행에 기존 규제를 어떻게 적용할지 검토 중이다. 자동화 전략 운용 시 규제 변화를 추적할 것.
