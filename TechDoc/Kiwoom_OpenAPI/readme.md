# 키움증권 REST API

키움증권 [공식 REST API](https://github.com/Kiwoom-Securities/Kiwoom-REST-API)를 확장하여 다음 프로젝트를 진행한다.

1. **SKILL 개발**: LLM 기반 트레이딩 스킬 개발
2. **SDK 개발**: Python 패키지 및 다양한 언어 SDK 개발

> PDF 원문: "키움 REST API 문서.pdf" (855페이지, kiwoom_docs 참조)

*키를 발급 받으려고하니 윈도우에서 보안 프로그램을 설치해야하는 번거로운 일이 있다. TOSS의 인증체계를 참고했으면 좋겠다.*
*웹소켓을 지원한다는 점에서 키움증권 Open API가 좀 더 트레이딩 친화적이다.*

---

## 공식 OpenAPI 참조

키움증권 공식 GitHub: [Kiwoom-Securities/Kiwoom-REST-API](https://github.com/Kiwoom-Securities/Kiwoom-REST-API)

### 공식 리포지토리 구조

```
Kiwoom-REST-API/
├── examples/          # Python 샘플코드 (국내주식 계좌/종목/시세/차트/주문)
├── kiwoom/            # Python 라이브러리 코어
│   ├── core/          # 인증(auth), 클라이언트(client), 시크릿(secrets), 토큰(token_store)
│   └── realtime/      # WebSocket 실시간 스트리밍 (events, stream, packets, schemas)
├── kiwoom_docs/       # API 문서 (855페이지 PDF 원문)
├── postman/           # Postman Collection
├── .env.example       # 환경변수 템플릿
└── pyproject.toml     # 프로젝트 설정 (Python >=3.13)
```

### 공식 SDK 주요 특징

| 특징 | 설명 |
|------|------|
| **의존성** | `requests`, `websockets`, `pandas`, `keyring`, `platformdirs` |
| **인증** | OAuth2 Client Credentials (접근토큰 발급/갱신/폐기) |
| **자격 증명 저장** | OS Keychain (macOS) / 자격 증명 관리자 (Windows) / Secret Service (Linux) |
| **REST API** | `api-id` + `authorization` 헤더 기반, `cont-yn`/`next-key` 연속조회 지원 |
| **WebSocket** | `wss://` 기반 실시간 체결/호가 스트리밍 (34개 실시간 항목) |
| **토큰 캐시** | 파일 기반 (권한 0o600) + 인메모리, 자격 증명 핑거프린트 매칭 |
| **에러 분류** | 37개 오류코드 세분화 (인증/입력검증/레이트리밋/종목미발견 등) |
| **보안** | HTTPS/WSS 강제, `.env` Git 제외, OS 자격 증명 저장소 우선 |

---

## API 엔드포인트 개요

제공된 API 가이드 문서(총 855페이지)는 **국내주식(ka/kt 계열 300+개), 미국주식(usa/ust 계열 200+개), 실시간 WebSocket(0A~1h, F4~FT) 등 약 500개 이상의 API 엔드포인트**를 포함하고 있다.

### API ID 체계

| 접두사 | 영역 | 예시 | 설명 |
|--------|------|------|------|
| `ka` | 국내주식 조회 | ka00001, ka10001 | 계좌/종목/시세/순위 |
| `kt` | 국내주식 트랜잭션 | kt10000 | 주문/정정/취소 |
| `usa` | 미국주식 조회 | usa20100 | 시세/호가 |
| `ust` | 미국주식 트랜잭션 | ust20000 | 주문/환전 |
| `au` | 인증 | au10001 | 접근토큰 발급/폐기 |
| `0A`~`1h` | 실시간(국내) | 0B, 0D, 0H | 체결/호가/예상체결 |
| `F4`~`FT` | 실시간(미국) | F5, FE, FT | 체결/현재가/호가 |

---

## Phase 1: API 엔드포인트 상세 명세서 구축 (1~2주)

현재 문서는 API 목록과 일부 예제를 포함하지만, **개발자가 바로 SDK를 구현할 수 있는 수준의 상세 명세는 아니다.** 다음 항목을 우선 정리해야 한다.

| 우선순위 | 작업 항목 | 상세 내용 |
|---------|----------|----------|
| 1 | **엔드포인트 URL 매핑** | 각 API ID(ka00001, usa10099 등)에 대한 실제 URL 경로 정리 (예: `/api/dostk/acnt`, `/api/us/mrkcond`) |
| 2 | **요청/응답 스키마 정의** | JSON Schema 또는 Pydantic 모델로 변환. 필드별 타입, 필수 여부, 길이, 포맷(YYYYMMDD, HHmmss 등) 명시 |
| 3 | **에러 코드 테이블** | 문서 마지막에 있는 37개 오류코드(1501~8200)를 체계화. 추가 비즈니스 에러 정리 |
| 4 | **인증 플로우 문서화** | 접근토큰 발급(au10001)/폐기(au10002), Header 구성(api-id, authorization, cont-yn, next-key) 상세 정리 |
| 5 | **연속조회(페이징) 가이드** | `cont-yn`/`next-key` 헤더를 활용한 대량 데이터 조회 방법 문서화 |
| 6 | **Rate Limit 정책** | API 호출 제한(문서에 1700~1702 오류코드 존재)에 대한 상세 정책 수립 |
| 7 | **Postman Collection** | 모든 API에 대한 Postman Collection 생성 (문서에 언급된 `examples/postman` 디렉토리 보강) |

**산출물**: `openapi.yaml` (OpenAPI 3.0 규격) + `error_codes.md` + `auth_guide.md`

---

## Phase 2: Python SDK 개발 (3~4주)

Python은 키움증권 REST API의 **1차 지원 언어**다. 이미 공식 라이브러리(`kiwoom` 패키지)와 여러 커뮤니티 래퍼가 존재하지만, **공식 SDK**로서 완성도 높은 패키지로 발전시킨다.

### 2.1 코어 클라이언트

```python
# 최종 사용 예시
from kiwoom import KiwoomClient

client = KiwoomClient(
    appkey="YOUR_APP_KEY",
    appsecret="YOUR_APP_SECRET",
    env="real"  # or "mock"
)

# 인증
client.auth()

# 국내주식 계좌조회
accounts = client.domestic.account.get_accounts()

# 주식 기본정보 조회
stock_info = client.domestic.stock.get_info("005930")

# 미국주식 현재가
us_stock = client.us.market.get_quote("NVDA", exchange="ND")

# WebSocket 실시간 체결
client.realtime.subscribe("005930", "0B", callback=on_trade)
```

### 2.2 패키지 구조

```
kiwoom/
├── __init__.py
├── client.py              # KiwoomClient 메인 클래스
├── auth.py                # 토큰 관리 (발급/갱신/폐기)
├── config.py              # 환경 설정 (real/mock)
├── errors.py              # 커스텀 예외 클래스
├── models/
│   ├── domestic/          # 국내주식 모델 (Pydantic)
│   │   ├── account.py     # ka00001, ka01690, kt00001...
│   │   ├── stock.py       # ka10001, ka10002, ka10003...
│   │   ├── order.py       # kt10000~kt10003
│   │   └── ...
│   ├── us/                # 미국주식 모델
│   │   ├── account.py     # ust21050, ust21070...
│   │   ├── market.py      # usa20100, usa20101...
│   │   └── order.py       # ust20000~ust20003
│   └── realtime.py        # WebSocket 실시간 모델
├── services/
│   ├── domestic/
│   │   ├── account.py     # 계좌 관련 API
│   │   ├── stock.py       # 종목정보 API
│   │   ├── market.py      # 시세 API
│   │   ├── order.py       # 주문 API
│   │   └── websocket.py   # 실시간 WebSocket
│   └── us/
│       ├── account.py
│       ├── market.py
│       └── order.py
├── realtime/
│   ├── ws_client.py       # WebSocket 연결 관리
│   ├── handlers.py        # 0A,0B,0C,0D,0E,0F,0G,0H,0I,0J,0U,0g,0m,0s,0u,0w,1h
│   └── models.py
└── utils/
    ├── helpers.py         # 날짜/숫자 포맷팅 헬퍼
    └── logging.py         # 로깅 설정
```

### 2.3 API 서비스 분류

문서의 API 목록을 기준으로 서비스 그룹화:

| 서비스 | 주요 API ID | 설명 |
|--------|-------------|------|
| `account` | ka00001, ka01690, ka10072~10077, kt00001~kt00018 | 계좌조회, 잔고, 손익 |
| `stock` | ka10001~ka10003, ka10013, ka10015~ka10019, ka10024~ka10026 | 종목정보, 기본정보 |
| `market` | ka10004~ka10007, ka10011, ka10044~ka10047 | 시세, 호가, 체결 |
| `ranking` | ka10020~ka10023, ka10027~ka10042 | 순위정보 |
| `order` | kt10000~kt10003 | 주식 매수/매도/정정/취소 |
| `credit` | kt10006~kt10009 | 신용주문 |
| `sector` | ka10010, ka10051, ka20001~ka20019 | 업종정보 |
| `elw` | ka10048, ka10050, ka30001~ka30012 | ELW |
| `etf` | ka40001~ka40010 | ETF |
| `theme` | ka90001~ka90002 | 테마 |
| `slb` | ka10068~ka10069, ka20068, ka90012 | 대차거래 |
| `us_account` | ust21050~ust21661 | 미국 계좌 |
| `us_market` | usa20100~usa20972 | 미국 시세 |
| `us_order` | ust20000~ust20003 | 미국 주문 |
| `us_exchange` | ust31300~ust31302 | 환전 |

### 2.4 실시간 WebSocket 지원

문서에 정의된 34개 실시간 항목을 모두 지원:

| 항목 | ID | 설명 |
|------|----|----|
| 주문체결 | 00 | 계좌 주문 실시간 |
| 잔고 | 04 | 계좌 잔고 실시간 |
| 주식기세 | 0A | 대량매매/종가보정 |
| 주식체결 | 0B | 종목별 체결 |
| 주식우선호가 | 0C | 최우선 호가 |
| 주식호가잔량 | 0D | 10단계 호가 |
| 주식시간외호가 | 0E | 시간외 호가 |
| 주식당일거래원 | 0F | 거래원 정보 |
| ETF NAV | 0G | ETF NAV |
| 주식예상체결 | 0H | 예상체결 |
| 국제금환산가격 | 0I | 금현물 |
| 업종지수 | 0J | 업종 지수 |
| 업종등락 | 0U | 업종 등락 |
| 주식종목정보 | 0g | VI발동 등 |
| ELW 이론가 | 0m | ELW 이론가 |
| 장시작시간 | 0s | 장 운영 알림 |
| ELW 지표 | 0u | ELW 지표 |
| 종목프로그램매매 | 0w | 프로그램 매매 |
| VI발동/해제 | 1h | VI 정보 |
| 미국주문 | F4 | 미국 주문 실시간 |
| 미국체결 | F5 | 미국 체결 실시간 |
| 미국체결가 | FE | 미국 현재가 |
| 미국10호가 | FT | 미국 10호가 |

### 2.5 패키지 배포

* PyPI 등록 (`kiwoom-sdk` 또는 `kiwoom-rest-sdk`)
* 문서화: ReadTheDocs 또는 GitHub Pages
* CI/CD: GitHub Actions (테스트, 빌드, 배포 자동화)

---

## Phase 3: 타 언어 SDK 개발 (6~8주, 병렬 진행 가능)

키움증권은 **Python, Java 등 다양한 언어를 지원**한다고 공표했다. 각 언어별 SDK를 개발한다.

### 3.1 TypeScript/JavaScript SDK

이미 커뮤니티 프로젝트가 존재하나, 공식 수준의 SDK로 발전시킨다.

```typescript
// 사용 예시
import { KiwoomClient } from '@kiwoom/sdk';

const client = new KiwoomClient({
  appKey: 'YOUR_APP_KEY',
  appSecret: 'YOUR_APP_SECRET',
});

await client.auth();

// 국내주식 정보
const stock = await client.domestic.stock.getInfo('005930');

// WebSocket 실시간
client.realtime.subscribe('005930', '0B', (data) => {
  console.log(data);
});
```

**패키지 구성**:
* NPM 패키지: `@kiwoom/sdk`
* 모듈 시스템: ESM + CJS 듀얼 지원
* 타입 정의: `.d.ts` 완벽 지원
* 런타임: Node.js 18+ / Deno / Bun

### 3.2 Java SDK

```java
// 사용 예시
KiwoomClient client = KiwoomClient.builder()
    .appKey("YOUR_APP_KEY")
    .appSecret("YOUR_APP_SECRET")
    .build();

client.auth();

StockInfo info = client.domestic().stock().getInfo("005930");

// WebSocket (RxJava 또는 Project Reactor 활용)
client.realtime().subscribe("005930", "0B", data -> {
    System.out.println(data);
});
```

**패키지 구성**:
* Maven: `com.kiwoom:kiwoom-sdk`
* Gradle: `implementation 'com.kiwoom:kiwoom-sdk:1.0.0'`
* HTTP: OkHttp 또는 Apache HttpClient
* JSON: Jackson
* WebSocket: Java-WebSocket 또는 Tyrus
* 반응형: RxJava 또는 Project Reactor 지원

### 3.3 .NET SDK

커뮤니티 프로젝트 `KiwoomRestApi.Net`이 이미 존재한다.

```csharp
// 사용 예시
using Kiwoom;

var client = new KiwoomClient(
    appKey: "YOUR_APP_KEY",
    appSecret: "YOUR_APP_SECRET"
);

await client.AuthAsync();

var stock = await client.Domestic.Stock.GetInfoAsync("005930");

// WebSocket
client.Realtime.Subscribe("005930", "0B", data => {
    Console.WriteLine(data);
});
```

**패키지 구성**:
* NuGet: `Kiwoom.Sdk`
* .NET Standard 2.0+ / .NET 6+
* HTTP: HttpClient
* JSON: System.Text.Json
* WebSocket: ClientWebSocket

### 3.4 언어별 SDK 공통 설계 원칙

| 요소 | 설명 |
|------|------|
| **동일한 API 디자인** | 모든 언어 SDK가 동일한 메서드명, 파라미터 구조를 가짐 |
| **자동 토큰 관리** | 토큰 만료 시 자동 갱신 |
| **타입 안전성** | TypeScript는 타입 정의, Java/C#은 강타입 모델 |
| **비동기 지원** | async/await (Python, TS, C#), CompletableFuture (Java) |
| **에러 처리** | 언어별 예외 체계에 맞는 커스텀 예외 |
| **로깅** | 디버깅을 위한 요청/응답 로깅 옵션 |
| **Rate Limit 핸들링** | 자동 재시도 및 백오프 |

---

## Phase 4: 트레이딩 스킬(SKILL) 개발 (4~6주)

LLM(대규모 언어 모델)이 키움증권 API를 활용해 **자동매매를 수행할 수 있는 AI 어시스턴트 스킬**을 개발한다.

### 4.1 Skill 정의

**Skill 이름**: `kiwoom-trader`

**Skill 역할**: 사용자의 자연어 명령을 이해하고, 키움증권 REST API를 호출하여 주식 거래를 수행

**지원 기능**:
1. 계좌 조회 (잔고, 예수금, 평가손익)
2. 종목 검색 및 시세 조회 (국내/미국)
3. 매수/매도 주문 (지정가/시장가)
4. 주문 상태 확인 (체결/미체결)
5. 실시간 시세 알림 (WebSocket)
6. 관심종목 관리
7. 조건검색 활용

### 4.2 Skill Architecture

```
+-------------------------------------------------------------+
|                    LLM (Claude/GPT)                         |
|                  자연어 -> 의도/파라미터 추출                 |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                    Skill: kiwoom-trader                     |
|  +-------------------------------------------------------+ |
|  |  Intent Router                                       | |
|  |  - account_query -> account_service                  | |
|  |  - stock_search -> stock_service                     | |
|  |  - place_order -> order_service                      | |
|  |  - check_order -> order_status_service               | |
|  |  - realtime_subscribe -> ws_service                  | |
|  +-------------------------------------------------------+ |
|                              |                              |
|  +-------------------------------------------------------+ |
|  |  Parameter Validator                                 | |
|  |  - 종목코드 형식 검증 (6자리 / 미국 ticker)          | |
|  |  - 수량/가격 유효성 검증                             | |
|  |  - 거래 가능 시간 확인                               | |
|  +-------------------------------------------------------+ |
|                              |                              |
|  +-------------------------------------------------------+ |
|  |  API Executor (Python SDK 활용)                      | |
|  +-------------------------------------------------------+ |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
|                    Kiwoom REST API                         |
+-------------------------------------------------------------+
```

### 4.3 Skill Prompt Design

```markdown
# kiwoom-trader Skill

## Description
키움증권 REST API를 활용한 주식 자동매매 어시스턴트입니다.
국내주식(KRX)과 미국주식(NASDAQ/NYSE)을 지원합니다.

## Capabilities
1. 계좌 조회: 잔고, 예수금, 평가손익, 수익률
2. 종목 검색: 종목명/코드로 기본정보, 시세, 차트 조회
3. 주문 실행: 지정가/시장가 매수/매도
4. 주문 확인: 체결/미체결 내역 조회
5. 실시간 알림: WebSocket 기반 체결/호가 알림
6. 관심종목: 그룹 관리 및 관심종목 시세 조회
7. 조건검색: 저장된 조건식으로 종목 스크리닝

## API Mapping
- "내 잔고 알려줘" -> account.get_balance()
- "삼성전자 현재가" -> stock.get_info("005930")
- "005930 10주 시장가 매수" -> order.buy("005930", qty=10, order_type="market")
- "내 주문 상태 확인" -> order.get_status()
- "NVDA 실시간 체결 알림" -> realtime.subscribe("NVDA", "FE")

## Safety Rules
- 주문 전 반드시 사용자 확인을 받을 것
- 1회 최대 주문 금액 제한 (설정 가능)
- 장 종료 후 30분 이내 주문 불가
- 신용/대출 거래 미지원 (현금 거래만)
```

### 4.4 Skill 구현 구성요소

| 구성요소 | 설명 |
|----------|------|
| **Intent Classifier** | 사용자 발화에서 의도 분류 (계좌조회/시세조회/주문/주문확인) |
| **Entity Extractor** | 종목코드, 수량, 가격, 주문타입 추출 |
| **Context Manager** | 대화 컨텍스트 유지 (예: "아까 그 종목" 참조) |
| **Safety Guard** | 이상거래 탐지, 2차 확인 프로세스 |
| **Response Generator** | API 응답을 자연어로 변환 |

---

## 통합 로드맵 요약

```
Phase 1 (1-2주)     Phase 2 (3-4주)      Phase 3 (6-8주)      Phase 4 (4-6주)
+----------------+  +-----------------+  +------------------+  +-------------------+
| API 명세서 구축 |  | Python SDK 개발  |  | 타 언어 SDK 개발  |  | Trading Skill 개발 |
|  OpenAPI spec  |  |  Core Client    |  |  TS/JS SDK       |  |  Skill 설계       |
|  에러코드 정리  |  |  300+ API 래핑   |  |  Java SDK        |  |  Intent 분류기    |
|  인증 가이드    |  |  WebSocket 지원  |  |  .NET SDK        |  |  안전장치          |
|  Postman 컬렉션 |  |  PyPI 배포      |  |  NPM/Maven/NuGet |  |  테스트/배포       |
|  Rate Limit 정책|  |  문서화          |  |  문서화           |  |  문서화            |
+----------------+  +-----------------+  +------------------+  +-------------------+
                    |                       |
                    +-- Phase 2-4는 ---------+
                         병렬 진행 가능
```

## 우선순위 및 예상 일정

| 단계 | 작업 내용 | 예상 기간 | 우선순위 |
|------|----------|----------|----------|
| **1** | API 엔드포인트 상세 명세서 (OpenAPI) | 1-2주 | 최우선 |
| **2** | Python SDK 코어 + 국내주식 API | 2주 | 최우선 |
| **3** | Python SDK 미국주식 + WebSocket | 1-2주 | 최우선 |
| **4** | Python SDK 배포 및 문서화 | 1주 | 높음 |
| **5** | TypeScript/JavaScript SDK | 2-3주 | 중간 |
| **6** | Java SDK | 2-3주 | 중간 |
| **7** | .NET SDK | 2주 | 중간 |
| **8** | Trading Skill 개발 | 4-6주 | 진행 |

> **참고**: Phase 2(Python SDK)가 완성되면 Phase 3(타 언어 SDK)와 Phase 4(Skill 개발)는 **병렬 진행**이 가능하다. 타 언어 SDK는 Python SDK의 API 디자인과 테스트 케이스를 참조하여 개발 효율을 높일 수 있다.

---

## 참고 자료

* [키움증권 공식 REST API GitHub](https://github.com/Kiwoom-Securities/Kiwoom-REST-API)
* [키움증권 OpenAPI 포털](https://openapi.kiwoom.com)
* [Python 공식 라이브러리 (kwcli)](https://pypi.org/project/kwcli/)
