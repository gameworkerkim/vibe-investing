# Kiwoom Securities REST API SDK (한국어) (개발중 미완성)

키움증권 REST API를 위한 멀티 언어 SDK + AI 트레이딩 스킬.

## 구성 요소

| 구성 요소 | 디렉토리 | 설명 |
|-----------|----------|------|
| Python SDK | `python/` | `requests` + `pydantic` 기반 |
| Java SDK | `java/` | `okhttp` + `jackson` 기반 |
| TypeScript SDK | `typescript/` | 의존성 없음 (native fetch) |
| **kiwoom-trader Skill** | `python/kiwoom_sdk/skill/` | LLM 기반 자연어 트레이딩 |

## kiwoom-trader Skill

자연어로 주식 거래를 실행하는 LLM 기반 AI 어시스턴트.

```
사용자: "삼성전자 10주 시장가 매수"
  -> 의도 분류: place_order
  -> 종목코드: 005930, 수량: 10, 주문타입: 시장가
  -> 안전 검증: 거래 시간, 주문 한도 확인
  -> 확인 요청: "주문 요약: 삼성전자(005930) 10주 매수. 실행할까요?"
  -> 실행: domestic_order.buy("005930", 10, order_type="3")
```

### 지원 의도 (Intent)

| 의도 | 설명 | 예시 |
|------|------|------|
| `account_query` | 계좌/잔고/보유종목 조회 | "내 잔고 알려줘", "보유종목 보여줘" |
| `stock_search` | 종목 시세/정보 검색 | "삼성전자 현재가", "NVDA 시세" |
| `place_order` | 매수/매도 주문 | "005930 10주 매수", "TSLA 5주 시장가 매도" |
| `check_order` | 주문 상태 확인 | "주문 상태 확인", "미체결 내역" |
| `cancel_order` | 주문 취소 | "주문 취소해줘", "005930 취소" |
| `realtime_subscribe` | 실시간 시세 구독 | "005930 실시간 알림" (WIP) |

### 주문 타입

| 코드 | 타입 | 설명 |
|------|------|------|
| 0 | 지정가 | 지정한 가격으로 주문 |
| 3 | 시장가 | 현재 시장 가격으로 즉시 체결 |
| 5 | 조건부지정가 | 조건 만족 시 지정가 주문 |
| 6 | 최유리지정가 | 가장 유리한 가격으로 지정가 |
| 7 | 최우선지정가 | 최우선 호가로 지정가 |
| 10 | IOC | 즉시 체결 후 잔량 취소 |
| 20 | FOK | 전량 체결 또는 전체 취소 |

### 안전 규칙

1. **주문 확인 필수**: 주문 실행 전 반드시 사용자 확인을 받는다
2. **거래 시간 확인**: 장 마감 후/주말/공휴일 주문 차단
3. **주문 한도 경고**: 1만주 초과 또는 1억원 초과 시 경고
4. **모의투자 우선**: 실전 거래 전 반드시 `market="demo"`로 테스트

## 지원 거래소

| 거래소 | 코드 | 시장 |
|--------|------|------|
| KOSPI/KOSDAQ | KRX | 국내 |
| NXT | NXT | 국내 |
| SOR | SOR | 국내 |
| NASDAQ | ND | 미국 |
| NYSE | NY | 미국 |
| AMEX | AM | 미국 |

## API 커버리지

| 서비스 | API ID | 설명 |
|--------|--------|------|
| 국내 계좌 | ka00001, ka01690, ka10072 | 계좌목록, 잔고, 보유종목 |
| 국내 주문 | kt10000-kt10003 | 매수/매도/정정/취소 |
| 미국 계좌 | ust21050, ust21070, ust21661 | 미국 계좌/잔고/보유종목 |
| 미국 주문 | ust20000-ust20003 | 미국 매수/매도/정정/취소 |

## 빠른 시작

### Python SDK

```python
from kiwoom_sdk import KiwoomClient
from kiwoom_sdk.models import OrderType

# 모의투자로 시작
client = KiwoomClient("APP_KEY", "APP_SECRET", market="demo")

# 인증 (자동 호출되지만 명시적 호출도 가능)
token = client.auth()

# 계좌 조회
accounts = client.domestic_account.list_accounts()
for acct in accounts:
    print(f"{acct.account_number}: 예수금 {acct.deposit:,.0f}원")

# 시장가 매수
result = client.domestic_order.buy("005930", 1, order_type=OrderType.MARKET)
print(f"주문번호: {result.order_number}")

# 보유 종목 조회
holdings = client.domestic_account.list_holdings(accounts[0].account_number)
for h in holdings:
    print(f"{h.stock_name}: {h.quantity}주 @ {h.current_price:,.0f}원")

client.close()
```

### Skill 사용

```python
from kiwoom_sdk import KiwoomClient
from kiwoom_sdk.skill import parse_command, Intent

# 자연어 명령 파싱
cmd = parse_command("삼성전자 10주 시장가 매수")
print(f"의도: {cmd.intent.value}")
print(f"종목: {cmd.stock_code}")
print(f"수량: {cmd.quantity}")

if cmd.warnings:
    for w in cmd.warnings:
        print(f"경고: {w}")

# SDK로 실행
client = KiwoomClient("KEY", "SECRET", market="demo")
if cmd.intent == Intent.PLACE_ORDER and not cmd.warnings:
    if cmd.action == "buy":
        result = client.domestic_order.buy(
            cmd.stock_code, cmd.quantity, cmd.price, cmd.order_type
        )
        print(f"주문 완료: {result.order_number}")
```

### Java SDK

```java
import com.kiwoom.sdk.KiwoomClient;

var client = new KiwoomClient("KEY", "SECRET", "demo");
client.auth();

var accounts = client.domesticAccount().listAccounts();
System.out.println("계좌 수: " + accounts.size());

var result = client.domesticOrder().buy("005930", 1);
System.out.println("주문번호: " + result.getOrderNumber());

// 미국 주식 매수
var usResult = client.overseasOrder().buy("NVDA", 10, 0, "3", "ND");
client.close();
```

### TypeScript SDK

```typescript
import { KiwoomClient } from "@kiwoom/sdk";

const client = new KiwoomClient("KEY", "SECRET", "demo");

const token = await client.authenticate();
const accounts = await client.domesticAccount.listAccounts();

// 시장가 매수
const result = await client.domesticOrder.buy("005930", 1);
console.log(`주문번호: ${result.orderNumber}`);

// 미국 주식 매도
const usResult = await client.overseasOrder.sell("TSLA", 5, 250.0);
client.close();
```

## Demo vs Real

| | 모의투자 (Demo) | 실전 (Real) |
|---|---|---|
| App Key/Secret | 모의투자 전용 키 | 실전 거래 키 |
| API URL | `https://mockapi.kiwoom.com` | `https://api.kiwoom.com` |
| WebSocket | `wss://mockapi.kiwoom.com:10000` | `wss://api.kiwoom.com:10000` |

## 에러 코드

| 코드 범위 | 설명 |
|-----------|------|
| 8001, 8002, 8011, 8012 | 잘못된 App Key/Secret |
| 8003, 8005, 8006, 8009, 8015, 8016 | 만료된/잘못된 토큰 |
| 8030, 8031 | 실전/모의 모드 불일치 |
| 1501-1517, 1687, 8020 | 입력값 검증 실패 |
| 1700 | API 호출 한도 초과 |
| 1901, 1902 | 존재하지 않는 종목코드 |

## 프로젝트 구조

```
kiwoom_sdk/
├── README.md                 # 영문 종합 가이드
├── readme_kr.md              # 한글 기능 명세 (이 파일)
│   ├── kiwoom_sdk/
│   │   └── skill/         # kiwoom-trader AI 스킬
│   └── pyproject.toml
├── java/
│   ├── pom.xml
│   └── src/main/java/com/kiwoom/sdk/
└── typescript/
    ├── package.json
    ├── tsconfig.json
    └── src/
```

## 참고

- [키움증권 공식 REST API](https://github.com/Kiwoom-Securities/Kiwoom-REST-API)
- [키움증권 OpenAPI 포털](https://openapi.kiwoom.com)
- [개발 로드맵](../TechDoc/Kiwoom_OpenAPI/readme.md)
- [전체 매뉴얼 (3개 언어)](manual.md)
