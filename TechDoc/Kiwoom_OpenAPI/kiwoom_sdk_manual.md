# kiwoom-sdk Multi-Language SDK Manual

Multi-language SDK for Kiwoom Securities REST API.

- **Python**: `requests` + `pydantic` (`python/`)
- **Java**: `okhttp` + `jackson` (`java/`)
- **TypeScript**: native `fetch`, zero deps (`typescript/`)

Source: https://github.com/gameworkerkim/vibe-investing/tree/main/kiwoom_sdk

---

## 1. Installation

### Python

```bash
cd kiwoom_sdk/python
pip install -e .
```

Requirements: Python 3.10+, `requests`, `pydantic`

### Java

```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.kiwoom</groupId>
    <artifactId>kiwoom-sdk</artifactId>
    <version>0.1.0</version>
</dependency>
```

Requirements: Java 17+, Maven

### TypeScript

```bash
cd kiwoom_sdk/typescript
npm install
npm run build
```

Requirements: Node.js 18+, TypeScript 5.5+

---

## 2. Quick Start

### Python

```python
from kiwoom_sdk import KiwoomClient
from kiwoom_sdk.models import OrderType

client = KiwoomClient(
    app_key="YOUR_APP_KEY",
    app_secret="YOUR_APP_SECRET",
    market="demo",   # "demo" | "real"
    timeout=30,       # request timeout (seconds)
)
```

### Java

```java
import com.kiwoom.sdk.KiwoomClient;

var client = new KiwoomClient("APP_KEY", "APP_SECRET", "demo", 30);
```

### TypeScript

```typescript
import { KiwoomClient } from "@kiwoom/sdk";

const client = new KiwoomClient("APP_KEY", "APP_SECRET", "demo", 30);
```

---

## 3. Authentication

OAuth2 Client Credentials flow. Token is cached locally and auto-refreshed.

### Python

```python
# Manual token issuance
token = client.auth()

# Context manager (auto-revoke on exit)
with KiwoomClient(app_key="KEY", app_secret="SECRET") as c:
    accounts = c.domestic_account.list_accounts()
```

Token cache: `.kiwoom_cache/{mode}-token.json` (permission: 0o600)

### Java

```java
// Manual issuance
String token = client.auth();

// client is AutoCloseable
try (var c = new KiwoomClient("KEY", "SECRET", "demo")) {
    var accounts = c.domesticAccount().listAccounts();
}
```

### TypeScript

```typescript
// Manual issuance
const token = await client.authenticate();
```

---

## 4. Domestic Account

### Python

```python
accounts = client.domestic_account.list_accounts()
balance = client.domestic_account.get_balance("5001234567")
holdings = client.domestic_account.list_holdings("5001234567")
```

### Java

```java
var accounts = client.domesticAccount().listAccounts();
var balance = client.domesticAccount().getBalance("5001234567");
var holdings = client.domesticAccount().listHoldings("5001234567");
```

### TypeScript

```typescript
const accounts = await client.domesticAccount.listAccounts();
const balance = await client.domesticAccount.getBalance("5001234567");
const holdings = await client.domesticAccount.listHoldings("5001234567");
```

### AccountInfo Fields

| Field | Alias | Description |
|-------|-------|-------------|
| `account_number` / `accountNumber` | `acnt_no` | Account number |
| `account_name` / `accountName` | `acnt_name` | Account name |
| `balance` | `evlu_pfls_amt` | Valuation amount |
| `deposit` | `dmst_dncl_amt` | Deposit |
| `total_value` / `totalValue` | `tot_evlu_amt` | Total value |
| `profit_loss` / `profitLoss` | `evlu_pfls_rt` | Profit/loss |
| `profit_loss_ratio` / `profitLossRatio` | `evlu_erng_rt1` | P/L ratio |

### Holding Fields

| Field | Alias | Description |
|-------|-------|-------------|
| `stock_code` / `stockCode` | `stk_cd` | Stock code |
| `stock_name` / `stockName` | `stk_nm` | Stock name |
| `quantity` | `hldg_qty` | Holding quantity |
| `average_price` / `averagePrice` | `pchs_avg_pric` | Avg purchase price |
| `current_price` / `currentPrice` | `now_pric` | Current price |
| `total_value` / `totalValue` | `evlu_amt` | Total holding value |
| `profit_loss` / `profitLoss` | `evlu_pfls_amt` | P/L amount |
| `profit_loss_ratio` / `profitLossRatio` | `evlu_pfls_rt` | P/L ratio |

---

## 5. Domestic Order Types

| Python Enum | Value | Description |
|-------------|-------|-------------|
| `OrderType.NORMAL` | 0 | Limit order |
| `OrderType.MARKET` | 3 | Market order |
| `OrderType.CONDITIONAL_LIMIT` | 5 | Conditional limit |
| `OrderType.AFTER_HOURS` | 81 | After-hours |
| `OrderType.BEFORE_HOURS` | 61 | Pre-market |
| `OrderType.AFTER_HOURS_SINGLE` | 62 | After-hours single |
| `OrderType.BEST_QUOTE` | 6 | Best quote |
| `OrderType.TOP_PRIORITY` | 7 | Top priority |
| `OrderType.NORMAL_IOC` | 10 | IOC limit |
| `OrderType.MARKET_IOC` | 13 | IOC market |
| `OrderType.BEST_QUOTE_IOC` | 16 | IOC best quote |
| `OrderType.NORMAL_FOK` | 20 | FOK limit |
| `OrderType.MARKET_FOK` | 23 | FOK market |
| `OrderType.BEST_QUOTE_FOK` | 26 | FOK best quote |
| `OrderType.STOP_LIMIT` | 28 | Stop limit |
| `OrderType.MID_PRICE` | 29 | Mid price |
| `OrderType.MID_PRICE_IOC` | 30 | Mid price IOC |
| `OrderType.MID_PRICE_FOK` | 31 | Mid price FOK |

In Java/TypeScript, pass the string value directly: `"0"`, `"3"`, etc.

---

## 6. Domestic Trading

### 6.1 Exchange Codes

| Code | Description |
|------|-------------|
| `KRX` | KOSPI/KOSDAQ |
| `NXT` | NXT |
| `SOR` | SOR |

### 6.2 Buy

**Python**:

```python
result = client.domestic_order.buy(
    stock_code="005930",
    quantity=1,
    price=70000,              # 0 for market order
    order_type=OrderType.NORMAL,
    exchange="KRX",
)
```

**Java**:

```java
var result = client.domesticOrder().buy("005930", 1, 70000, "0", "KRX");
// Market order shortcut
var result2 = client.domesticOrder().buy("005930", 1);
```

**TypeScript**:

```typescript
const result = await client.domesticOrder.buy("005930", 1, 70000, "0", "KRX");
// Market order shortcut
const result2 = await client.domesticOrder.buy("005930", 1);
```

### 6.3 Sell

**Python**: `client.domestic_order.sell("005930", 1, 70000)`

**Java**: `client.domesticOrder().sell("005930", 1, 70000, "0", "KRX")`

**TypeScript**: `await client.domesticOrder.sell("005930", 1, 70000)`

### 6.4 Modify Order

**Python**: `client.domestic_order.modify("12345678", "005930", 2, 71000)`

**Java**: `client.domesticOrder().modify("12345678", "005930", 2, 71000)`

**TypeScript**: `await client.domesticOrder.modify("12345678", "005930", 2, 71000)`

### 6.5 Cancel Order

**Python**: `client.domestic_order.cancel("12345678", "005930")`

**Java**: `client.domesticOrder().cancel("12345678", "005930")`

**TypeScript**: `await client.domesticOrder.cancel("12345678", "005930")`

### 6.6 Check Order Status

**Python**: `client.domestic_order.get_order_status("12345678")`

**Java**: not yet implemented (WIP)

**TypeScript**: not yet implemented (WIP)

### Result Fields

| Field | Description |
|-------|-------------|
| `order_number` / `orderNumber` | Order number |
| `return_code` / `returnCode` | API response code |
| `return_msg` / `returnMsg` | API response message |
| `exchange` | Exchange code |

---

## 7. Overseas (US) Account

### 7.1 List Accounts

**Python**: `client.overseas_account.list_accounts()`

**Java**: `client.overseasAccount().listAccounts()`

**TypeScript**: `await client.overseasAccount.listAccounts()`

### 7.2 Get Balance

**Python**: `client.overseas_account.get_balance("5001234567")`

**Java**: `client.overseasAccount().getBalance("5001234567")`

**TypeScript**: `await client.overseasAccount.getBalance("5001234567")`

### 7.3 List Holdings

**Python**: `client.overseas_account.list_holdings("5001234567")`

**Java**: `client.overseasAccount().listHoldings("5001234567")`

**TypeScript**: `await client.overseasAccount.listHoldings("5001234567")`

---

## 8. Overseas (US) Trading

### 8.1 Exchange Codes

| Code | Description |
|------|-------------|
| `ND` | NASDAQ |
| `NY` | NYSE |
| `AM` | AMEX |

### 8.2 Buy

**Python**:

```python
result = client.overseas_order.buy(
    stock_code="NVDA",
    quantity=10,
    price=0.0,               # 0 = market order
    order_type=OrderType.MARKET,
    exchange="ND",
)
```

**Java**:

```java
var result = client.overseasOrder().buy("NVDA", 10, 0, "3", "ND");
// Market order shortcut
var result2 = client.overseasOrder().buy("NVDA", 10);
```

**TypeScript**:

```typescript
const result = await client.overseasOrder.buy("NVDA", 10, 0, "3", "ND");
// Market order shortcut
const result2 = await client.overseasOrder.buy("NVDA", 10);
```

### 8.3 Sell

**Python**: `client.overseas_order.sell("TSLA", 5, 250.0)`

**Java**: `client.overseasOrder().sell("TSLA", 5, 250.0, "0", "NY")`

**TypeScript**: `await client.overseasOrder.sell("TSLA", 5, 250.0)`

### 8.4 Modify / Cancel

**Python**: `client.overseas_order.modify("12345678", "AAPL", 20, 180.0)`

**Java**: `client.overseasOrder().modify("12345678", "AAPL", 20, 180.0)`

**TypeScript**: `await client.overseasOrder.modify("12345678", "AAPL", 20, 180.0)`

---

## 9. Error Handling

All languages provide typed exception classes.

### Error Code Map (Common)

| Code Range | Exception Class | Description |
|-----------|----------------|-------------|
| 8001, 8002, 8011, 8012 | `InvalidCredentialsError` | Wrong App Key/Secret |
| 8003, 8005, 8006, 8009, 8015, 8016 | `TokenExpiredError` | Expired/invalid token |
| 8030, 8031 | `AuthError` | Mode mismatch |
| 1501-1517, 1687, 8020 | `InputValidationError` | Invalid parameters |
| 1700 | `RateLimitError` | Rate limited |
| 1901, 1902 | `SymbolNotFoundError` | Invalid stock code |
| 8005, 8031, 8103 | Auto-retry on auth failure |

### Python

```python
from kiwoom_sdk.errors import (
    KiwoomError, AuthError, InvalidCredentialsError,
    TokenExpiredError, APIError, RateLimitError, SymbolNotFoundError,
)

try:
    result = client.domestic_order.buy("999999", 1, order_type=OrderType.MARKET)
except SymbolNotFoundError as e:
    print(f"Invalid stock: [{e.return_code}] {e.return_msg}")
except KiwoomError as e:
    print(f"Error: {e}")
```

### Java

```java
import com.kiwoom.sdk.errors.*;

try {
    var result = client.domesticOrder().buy("999999", 1);
} catch (ApiException e) {
    System.err.println("[" + e.getReturnCode() + "] " + e.getMessage());
}
```

Note: Java error classes are under development.

### TypeScript

```typescript
import { KiwoomError, SymbolNotFoundError } from "@kiwoom/sdk";

try {
    await client.domesticOrder.buy("999999", 1);
} catch (e) {
    if (e instanceof SymbolNotFoundError) {
        console.error(`Invalid stock: ${e.message}`);
    }
}
```

---

## 10. API Reference

### Common Methods

| Service | Python | Java | TypeScript |
|---------|--------|------|------------|
| Auth | `client.auth()` | `client.auth()` | `client.authenticate()` |
| Close | `client.close()` | `client.close()` | `client.close()` |

| Service | Python | Java | TypeScript |
|---------|--------|------|------------|
| Domestic Account | `client.domestic_account` | `client.domesticAccount()` | `client.domesticAccount` |
| Domestic Order | `client.domestic_order` | `client.domesticOrder()` | `client.domesticOrder` |
| Overseas Account | `client.overseas_account` | `client.overseasAccount()` | `client.overseasAccount` |
| Overseas Order | `client.overseas_order` | `client.overseasOrder()` | `client.overseasOrder` |

### DomesticAccountService

| Method | Python | Java | TS |
|--------|--------|------|-----|
| List accounts | `list_accounts()` | `listAccounts()` | `listAccounts()` |
| Get balance | `get_balance(no)` | `getBalance(no)` | `getBalance(no)` |
| List holdings | `list_holdings(no)` | `listHoldings(no)` | `listHoldings(no)` |

### DomesticOrderService

| Method | Python | Java | TS |
|--------|--------|------|-----|
| Buy | `buy(code, qty, price, type, exch)` | `buy(code, qty, price, type, exch)` | `buy(code, qty, price, type, exch)` |
| Sell | `sell(...)` | `sell(...)` | `sell(...)` |
| Modify | `modify(ord_no, code, qty, price)` | `modify(...)` | `modify(...)` |
| Cancel | `cancel(ord_no, code)` | `cancel(ord_no, code)` | `cancel(ord_no, code)` |

### OverseasAccountService

| Method | Python | Java | TS |
|--------|--------|------|-----|
| List accounts | `list_accounts()` | `listAccounts()` | `listAccounts()` |
| Get balance | `get_balance(no)` | `getBalance(no)` | `getBalance(no)` |
| List holdings | `list_holdings(no)` | `listHoldings(no)` | `listHoldings(no)` |

### OverseasOrderService

| Method | Python | Java | TS |
|--------|--------|------|-----|
| Buy | `buy(code, qty, price, type, exch)` | `buy(code, qty, price, type, exch)` | `buy(code, qty, price, type, exch)` |
| Sell | `sell(...)` | `sell(...)` | `sell(...)` |
| Modify | `modify(ord_no, code, qty, price)` | `modify(...)` | `modify(...)` |
| Cancel | `cancel(ord_no, code)` | `cancel(ord_no, code)` | `cancel(ord_no, code)` |

---

## 11. Demo vs Real

| | Demo | Real |
|---|------|------|
| App Key/Secret | Mock investment keys | Live trading keys |
| Base URL | `https://mockapi.kiwoom.com` | `https://api.kiwoom.com` |
| WebSocket | `wss://mockapi.kiwoom.com:10000` | `wss://api.kiwoom.com:10000` |
| Param | `market="demo"` | `market="real"` (default) |

Always test with demo first before using real keys.

---

## 12. Complete Example (Python)

```python
from kiwoom_sdk import KiwoomClient
from kiwoom_sdk.models import OrderType
from kiwoom_sdk.errors import KiwoomError

APP_KEY = "your-app-key"
APP_SECRET = "your-app-secret"

with KiwoomClient(APP_KEY, APP_SECRET, market="demo") as client:
    token = client.auth()
    print(f"Authenticated: {token[:20]}...")

    accounts = client.domestic_account.list_accounts()
    if not accounts:
        print("No accounts found")
        exit()

    for acct in accounts:
        print(f"\n=== {acct.account_number} ===")
        bal = client.domestic_account.get_balance(acct.account_number)
        print(f"  Deposit: {bal.deposit:,.0f} KRW")

        holdings = client.domestic_account.list_holdings(acct.account_number)
        for h in holdings:
            print(f"  {h.stock_name}: {h.quantity} @ {h.current_price:,.0f} ({h.profit_loss_ratio:+.2f}%)")

        try:
            result = client.domestic_order.buy("005930", 1, order_type=OrderType.MARKET)
            print(f"\n  Order: {result.order_number} - {result.return_msg}")
        except KiwoomError as e:
            print(f"  Error: {e}")

    us_accounts = client.overseas_account.list_accounts()
    for acct in us_accounts:
        print(f"\n=== US {acct.account_number} ===")
        for h in client.overseas_account.list_holdings(acct.account_number):
            print(f"  {h.stock_name}: {h.quantity}")
```

## 13. Complete Example (Java)

```java
import com.kiwoom.sdk.KiwoomClient;

var client = new KiwoomClient("APP_KEY", "APP_SECRET", "demo");

try {
    String token = client.auth();
    System.out.println("Authenticated: " + token.substring(0, 20) + "...");

    var accounts = client.domesticAccount().listAccounts();
    for (var acct : accounts) {
        System.out.println(acct.getAccountNumber() + ": " + acct.getAccountName());
        var bal = client.domesticAccount().getBalance(acct.getAccountNumber());
        System.out.println("  Deposit: " + String.format("%,.0f", bal.getDeposit()) + " KRW");
    }

    var result = client.domesticOrder().buy("005930", 1);
    System.out.println("Order: " + result.getOrderNumber());

    var usResult = client.overseasOrder().buy("NVDA", 10, 0, "3", "ND");
    System.out.println("US Order: " + usResult.getOrderNumber());
} finally {
    client.close();
}
```

## 14. Complete Example (TypeScript)

```typescript
import { KiwoomClient } from "@kiwoom/sdk";

const client = new KiwoomClient("APP_KEY", "APP_SECRET", "demo");

try {
    const token = await client.authenticate();
    console.log(`Authenticated: ${token.slice(0, 20)}...`);

    const accounts = await client.domesticAccount.listAccounts();
    for (const acct of accounts) {
        console.log(`${acct.accountNumber}: ${acct.accountName}`);
        const bal = await client.domesticAccount.getBalance(acct.accountNumber);
        console.log(`  Deposit: ${bal.deposit.toLocaleString()} KRW`);
    }

    const result = await client.domesticOrder.buy("005930", 1);
    console.log(`Order: ${result.orderNumber}`);

    const usResult = await client.overseasOrder.buy("NVDA", 10);
    console.log(`US Order: ${usResult.orderNumber}`);
} finally {
    client.close();
}
```

---

## 15. Reference

- [Kiwoom official REST API](https://github.com/Kiwoom-Securities/Kiwoom-REST-API)
- [Kiwoom OpenAPI portal](https://openapi.kiwoom.com)
- [Development roadmap](./readme.md)
