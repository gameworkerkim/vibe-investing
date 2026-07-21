# kiwoom-trader Skill Definition

> This file serves as the authoritative skill definition for LLMs consuming the `kiwoom-trader` skill.

## Skill Metadata

- **Name**: `kiwoom-trader`
- **Version**: 0.1.0
- **Domain**: Securities Trading (KRX, NASDAQ, NYSE, AMEX)
- **API**: Kiwoom Securities REST API

## Description

kiwoom-trader is an AI skill that enables LLMs to understand natural language commands and execute stock trades via the Kiwoom Securities REST API. It supports Korean domestic stocks (KRX/KOSPI/KOSDAQ) and US stocks (NASDAQ/NYSE/AMEX).

## Capabilities

### 1. Account Inquiry (`account_query`)

Query account balances, deposits, profit/loss, and current holdings.

**APIs**: `ka00001`, `ka01690`, `ka10072`, `ust21050`, `ust21070`, `ust21661`

**Examples**:
- "내 잔고 알려줘" -> domestic_account.list_accounts() + get_balance()
- "보유 종목 보여줘" -> domestic_account.list_holdings()
- "미국 계좌 잔고" -> overseas_account.get_balance()
- "Show my portfolio" -> domestic_account.list_holdings()

### 2. Stock Search (`stock_search`)

Search stock quotes, basic info, and charts by code or name.

**Examples**:
- "삼성전자 현재가" -> search "005930"
- "NVDA stock price" -> search "NVDA"
- "005930 차트 보여줘" -> get chart for 005930

### 3. Place Order (`place_order`)

Execute buy/sell orders with various order types.

**APIs**: `kt10000`, `kt10002`, `ust20000`, `ust20002`

**Order Types**:

| Code | Type | Korean |
|------|------|--------|
| 0 | Limit | 지정가 |
| 3 | Market | 시장가 |
| 5 | Conditional Limit | 조건부지정가 |
| 6 | Best Quote | 최유리지정가 |
| 7 | Top Priority | 최우선지정가 |
| 10 | IOC Limit | IOC |
| 20 | FOK Limit | FOK |

**Examples**:
- "005930 10주 매수" -> domestic_order.buy("005930", 10, order_type="0")
- "005930 시장가로 5주 매도" -> domestic_order.sell("005930", 5, order_type="3")
- "Buy 10 shares of NVDA at market" -> overseas_order.buy("NVDA", 10, order_type="3")
- "삼성전자 75000원에 3주 매수" -> domestic_order.buy("005930", 3, price=75000)

### 4. Check Orders (`check_order`)

Query order status and history.

**APIs**: `kt00001`, `kt00018`, `ust20001`, `ust20005`

**Examples**:
- "주문 상태 확인" -> domestic_order.list_pending_orders()
- "미체결 내역 보여줘" -> domestic_order.list_pending_orders()
- "Order status for 12345678" -> domestic_order.get_order_status("12345678")

### 5. Cancel Order (`cancel_order`)

Cancel pending orders.

**APIs**: `kt10003`, `ust20003`

**Examples**:
- "주문 취소해줘" -> domestic_order.cancel()
- "Cancel my NVDA order" -> overseas_order.cancel()

### 6. Realtime Alerts (`realtime_subscribe`)

Subscribe to WebSocket realtime data streams. (WIP)

## Entity Extraction Rules

### Stock Codes
- Domestic: 6-digit numeric (`005930` = Samsung Electronics)
- US: 1-5 character uppercase ticker (`NVDA`, `TSLA`, `AAPL`)

### Quantity
- Pattern: `{number}{주|shares|share|개}`
- Example: `10주`, `100 shares`, `5개`

### Price
- Pattern: `{number}[원|won]` or price after code
- Example: `75000원`, `$150`, `at 150`

### Market Detection
- Keywords for US: `미국`, `nasdaq`, `nyse`, `amex`, `해외`, `us`
- Default: domestic (KRX)

## Safety Rules

1. **CONFIRMATION REQUIRED**: Never execute orders without explicit user confirmation.
   - Show execution summary
   - Ask "Shall I execute this order?"
   - Wait for "yes", "yes", "confirm", "ok", "execute" response

2. **MARKET HOURS**: Block orders outside trading hours.
   - KRX: Mon-Fri 09:00-15:30 KST (pre: 08:00, post: 15:30-18:00)
   - US: Mon-Fri 09:30-16:00 EST (pre: 04:00, post: 16:00-20:00)

3. **SIZE LIMITS**: Warn on large orders.
   - Quantity > 10,000 shares
   - Total value > 100,000,000 KRW

4. **ENVIRONMENT CHECK**: Always warn if using "real" market.
   - "You are using REAL trading mode. Orders will affect your account. Proceed?"

## Response Format

### Account Query Response

```
Account: 5001234567
  Deposit: 10,000,000 KRW
  Total Value: 12,500,000 KRW
  P/L: +25.0%

Holdings:
  삼성전자(005930): 100주 | Avg 70,000 | Current 75,000 | +7.1%
  SK하이닉스(000660): 50주 | Avg 200,000 | Current 210,000 | +5.0%
```

### Order Confirmation Response

```
주문 요약:
  종목: 삼성전자 (005930)
  구분: 매수
  수량: 10주
  유형: 시장가
  시장: KRX (국내)

정말 실행할까요?
```

### Error Response

```
주문 실패: [8001] 앱키 또는 시크릿키가 올바르지 않습니다.
  해결: App Key/Secret을 확인해 주세요.
```

## Integration

### Python

```python
from kiwoom_sdk import KiwoomClient
from kiwoom_sdk.skill import parse_command, Intent, SYSTEM_PROMPT_KR

client = KiwoomClient(APP_KEY, APP_SECRET, market="demo")
cmd = parse_command("005930 10주 매수")

if cmd.intent == Intent.PLACE_ORDER and not cmd.warnings:
    result = client.domestic_order.buy(cmd.stock_code, cmd.quantity, cmd.price, cmd.order_type, cmd.exchange)
```

### LLM System Prompt

Use `SYSTEM_PROMPT_KR` (Korean) or `SYSTEM_PROMPT_EN` (English) as the LLM system prompt to enable natural language trading.
