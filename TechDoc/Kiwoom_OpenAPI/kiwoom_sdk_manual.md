# kiwoom-sdk Python SDK manual

## 1. Installation

```bash
pip install -e ./kiwoom_sdk
```

Requirements: Python 3.10+, `requests`, `pydantic`

## 2. Quick Start

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

## 3. Authentication

OAuth2 Client Credentials flow. Token is cached locally and auto-refreshed.

```python
# Manual token issuance (optional, called automatically on first API)
token = client.auth()
print(token)

# Check token status
record = client.auth._cached_token()
if record:
    print(f"Expires at: {record.expires_at}")

# Revoke token on exit
client.auth.revoke_token()

# Context manager (auto-revoke)
with KiwoomClient(app_key="KEY", app_secret="SECRET") as c:
    accounts = c.domestic_account.list_accounts()
```

Token cache location: `.kiwoom_cache/{mode}-token.json` (permission: 0o600)

## 4. Domestic Account

### 4.1 List Accounts

```python
accounts = client.domestic_account.list_accounts()
for acct in accounts:
    print(f"{acct.account_number}: {acct.account_name}")
    print(f"  Balance: {acct.balance:,.0f} KRW")
    print(f"  Deposit: {acct.deposit:,.0f} KRW")
    print(f"  Total:   {acct.total_value:,.0f} KRW")
    print(f"  P/L:     {acct.profit_loss:+.2f}%")
```

Returns: `list[AccountInfo]`

| Field | Alias | Description |
|-------|-------|-------------|
| `account_number` | `acnt_no` | Account number |
| `account_name` | `acnt_name` | Account name |
| `balance` | `evlu_pfls_amt` | Valuation amount |
| `deposit` | `dmst_dncl_amt` | Deposit |
| `total_value` | `tot_evlu_amt` | Total value |
| `profit_loss` | `evlu_pfls_rt` | Profit/loss |
| `profit_loss_ratio` | `evlu_erng_rt1` | P/L ratio |

### 4.2 Get Balance

```python
balance = client.domestic_account.get_balance("5001234567")
print(f"Deposit: {balance.deposit:,.0f} KRW")
```

### 4.3 List Holdings

```python
holdings = client.domestic_account.list_holdings("5001234567")
for h in holdings:
    print(f"{h.stock_name}({h.stock_code}): {h.quantity} shares")
    print(f"  Avg price:  {h.average_price:,.0f}")
    print(f"  Curr price: {h.current_price:,.0f}")
    print(f"  Value:      {h.total_value:,.0f}")
    print(f"  P/L:        {h.profit_loss:,.0f} ({h.profit_loss_ratio:.2f}%)")
```

Returns: `list[Holding]`

| Field | Alias | Description |
|-------|-------|-------------|
| `stock_code` | `stk_cd` | Stock code |
| `stock_name` | `stk_nm` | Stock name |
| `quantity` | `hldg_qty` | Holding quantity |
| `average_price` | `pchs_avg_pric` | Avg purchase price |
| `current_price` | `now_pric` | Current price |
| `total_value` | `evlu_amt` | Total holding value |
| `profit_loss` | `evlu_pfls_amt` | P/L amount |
| `profit_loss_ratio` | `evlu_pfls_rt` | P/L ratio |

## 5. Domestic Trading

### 5.1 Order Types

| Enum | Value | Description |
|------|-------|-------------|
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

### 5.2 Exchange Codes

| Enum | Description |
|------|-------------|
| `Exchange.KRX` | KOSPI/KOSDAQ |
| `Exchange.NXT` | NXT |
| `Exchange.SOR` | SOR |

### 5.3 Buy

```python
result = client.domestic_order.buy(
    stock_code="005930",     # stock code
    quantity=1,               # quantity
    price=70000,              # 0 for market order
    order_type=OrderType.NORMAL,
    exchange="KRX",
)
print(f"Order No: {result.order_number}")
print(f"Message:  {result.return_msg}")
```

### 5.4 Sell

```python
result = client.domestic_order.sell(
    stock_code="005930",
    quantity=1,
    price=70000,
    order_type=OrderType.NORMAL,
)
```

### 5.5 Modify Order

```python
result = client.domestic_order.modify(
    order_number="12345678",
    stock_code="005930",
    quantity=2,
    price=71000,
)
```

### 5.6 Cancel Order

```python
result = client.domestic_order.cancel(
    order_number="12345678",
    stock_code="005930",
)
```

### 5.7 Check Order Status

```python
status = client.domestic_order.get_order_status("12345678")
print(f"Status: {status.status}")
print(f"Filled: {status.filled_quantity}/{status.order_quantity}")
print(f"Price:  {status.price}")
```

### 5.8 List Pending Orders

```python
orders = client.domestic_order.list_pending_orders("5001234567")
for order in orders:
    print(f"{order.order_number}: {order.stock_name} {order.order_quantity} shares")
```

## 6. Overseas (US) Account

### 6.1 List Accounts

```python
accounts = client.overseas_account.list_accounts()
for acct in accounts:
    print(f"{acct.account_number}: USD balance {acct.balance:,.2f}")
```

### 6.2 Get Balance

```python
balance = client.overseas_account.get_balance("5001234567")
print(f"USD Deposit: {balance.deposit:,.2f}")
```

### 6.3 List Holdings

```python
holdings = client.overseas_account.list_holdings("5001234567")
for h in holdings:
    print(f"{h.stock_name}({h.stock_code}): {h.quantity} shares")
```

## 7. Overseas (US) Trading

### 7.1 Exchange Codes

| Enum | Description |
|------|-------------|
| `Exchange.NASDAQ` | NASDAQ ("ND") |
| `Exchange.NYSE` | NYSE ("NY") |
| `Exchange.AMEX` | AMEX ("AM") |

### 7.2 Buy

```python
from kiwoom_sdk.models import OrderType, Exchange

result = client.overseas_order.buy(
    stock_code="NVDA",
    quantity=10,
    price=0.0,               # 0 = market order
    order_type=OrderType.MARKET,
    exchange="ND",            # ND=NASDAQ, NY=NYSE, AM=AMEX
)
print(f"Order No: {result.order_number}")
```

### 7.3 Sell

```python
result = client.overseas_order.sell(
    stock_code="TSLA",
    quantity=5,
    price=250.0,
    order_type=OrderType.NORMAL,
)
```

### 7.4 Modify / Cancel

```python
client.overseas_order.modify(
    order_number="12345678",
    stock_code="AAPL",
    quantity=20,
    price=180.0,
)

client.overseas_order.cancel(
    order_number="12345678",
    stock_code="AAPL",
)
```

### 7.5 Order Status

```python
status = client.overseas_order.get_order_status("12345678")
print(status)
```

## 8. Error Handling

All API errors are raised as typed exceptions inheriting from `KiwoomError`.

```python
from kiwoom_sdk.errors import (
    KiwoomError,
    AuthError,
    InvalidCredentialsError,
    TokenExpiredError,
    APIError,
    InputValidationError,
    RateLimitError,
    SymbolNotFoundError,
    OrderError,
    AccountError,
)

try:
    result = client.domestic_order.buy(
        stock_code="999999",  # invalid stock code
        quantity=1,
        order_type=OrderType.MARKET,
    )
except SymbolNotFoundError as e:
    print(f"Invalid stock code: {e.return_code} - {e.return_msg}")
except InputValidationError as e:
    print(f"Bad input: {e.return_code} - {e.return_msg}")
except InvalidCredentialsError as e:
    print(f"Check App Key/Secret: {e}")
except TokenExpiredError as e:
    print(f"Token expired, will auto-recover: {e}")
except RateLimitError as e:
    print(f"Rate limited: {e}")
except APIError as e:
    print(f"API error [{e.return_code}]: {e.return_msg}")
except KiwoomError as e:
    print(f"General error: {e}")
```

### Error Code Map

| Code Range | Exception |
|-----------|-----------|
| 8001, 8002, 8011, 8012 | `InvalidCredentialsError` |
| 8003, 8005, 8006, 8009, 8015, 8016 | `TokenExpiredError` |
| 8030, 8031 | `AuthError` (mode mismatch) |
| 1501-1517, 1687, 8020 | `InputValidationError` |
| 1700 | `RateLimitError` |
| 1901, 1902 | `SymbolNotFoundError` |
| 8005, 8031, 8103 | Auto-retry on auth failure |

## 9. Complete Example

```python
from kiwoom_sdk import KiwoomClient
from kiwoom_sdk.models import OrderType
from kiwoom_sdk.errors import KiwoomError

APP_KEY = "your-app-key"
APP_SECRET = "your-app-secret"
ACCOUNT = "5001234567"

with KiwoomClient(APP_KEY, APP_SECRET, market="demo") as client:
    # 1. Auth (auto-called on first API)
    token = client.auth()
    print(f"Authenticated: {token[:20]}...")

    # 2. Check domestic accounts
    accounts = client.domestic_account.list_accounts()
    if not accounts:
        print("No domestic accounts found")
        exit()

    for acct in accounts:
        print(f"\n=== Account: {acct.account_number} ===")
        bal = client.domestic_account.get_balance(acct.account_number)
        print(f"  Deposit: {bal.deposit:,.0f} KRW")

        # 3. View holdings
        holdings = client.domestic_account.list_holdings(acct.account_number)
        if holdings:
            print("  Holdings:")
            for h in holdings:
                print(f"    {h.stock_name}: {h.quantity} @ {h.current_price:,.0f} ({h.profit_loss_ratio:+.2f}%)")

        # 4. Place order (market buy 1 share of Samsung Electronics)
        try:
            result = client.domestic_order.buy(
                stock_code="005930",
                quantity=1,
                order_type=OrderType.MARKET,
            )
            print(f"\n  Order placed: {result.order_number}")
            print(f"  Message: {result.return_msg}")

            # 5. Check order status
            status = client.domestic_order.get_order_status(result.order_number)
            print(f"  Status: filled {status.filled_quantity}/{status.order_quantity}")
        except KiwoomError as e:
            print(f"  Order error: {e}")

    # 6. Overseas account
    us_accounts = client.overseas_account.list_accounts()
    if us_accounts:
        for acct in us_accounts:
            print(f"\n=== US Account: {acct.account_number} ===")
            us_holdings = client.overseas_account.list_holdings(acct.account_number)
            for h in us_holdings:
                print(f"  {h.stock_name}: {h.quantity} @ {h.current_price:,.2f}")
```

## 10. API Reference

### KiwoomClient

| Constructor Param | Type | Default | Description |
|-------------------|------|---------|-------------|
| `app_key` | `str` | required | Kiwoom App Key |
| `app_secret` | `str` | required | Kiwoom App Secret |
| `market` | `str` | `"real"` | `"real"` or `"demo"` |
| `timeout` | `int` | `30` | HTTP request timeout (seconds) |

| Property | Type | Description |
|----------|------|-------------|
| `domestic_account` | `DomesticAccountService` | Domestic account operations |
| `domestic_order` | `DomesticOrderService` | Domestic order operations |
| `overseas_account` | `OverseasAccountService` | US account operations |
| `overseas_order` | `OverseasOrderService` | US order operations |
| `auth` | `KiwoomAuth` | Auth manager |

| Method | Return | Description |
|--------|--------|-------------|
| `auth()` | `str` | Issue access token |
| `close()` | `None` | Revoke token + close session |

### DomesticAccountService

| Method | Params | Return |
|--------|--------|--------|
| `list_accounts()` | - | `list[AccountInfo]` |
| `get_balance(account_number)` | `str` | `AccountInfo` |
| `list_holdings(account_number)` | `str` | `list[Holding]` |

### DomesticOrderService

| Method | Params | Return |
|--------|--------|--------|
| `buy(stock_code, quantity, price, order_type, exchange)` | `str, int, float, OrderType, str` | `OrderResult` |
| `sell(stock_code, quantity, price, order_type, exchange)` | `str, int, float, OrderType, str` | `OrderResult` |
| `modify(order_number, stock_code, quantity, price, order_type)` | `str, str, int, float, OrderType` | `OrderResult` |
| `cancel(order_number, stock_code)` | `str, str` | `OrderResult` |
| `get_order_status(order_number)` | `str` | `OrderStatus` |
| `list_pending_orders(account_number)` | `str` | `list[OrderStatus]` |

### OverseasAccountService

| Method | Params | Return |
|--------|--------|--------|
| `list_accounts()` | - | `list[AccountInfo]` |
| `get_balance(account_number)` | `str` | `AccountInfo` |
| `list_holdings(account_number)` | `str` | `list[Holding]` |

### OverseasOrderService

| Method | Params | Return |
|--------|--------|--------|
| `buy(stock_code, quantity, price, order_type, exchange)` | `str, int, float, OrderType, str` | `OrderResult` |
| `sell(stock_code, quantity, price, order_type, exchange)` | `str, int, float, OrderType, str` | `OrderResult` |
| `modify(order_number, stock_code, quantity, price)` | `str, str, int, float` | `OrderResult` |
| `cancel(order_number, stock_code)` | `str, str` | `OrderResult` |
| `get_order_status(order_number)` | `str` | `OrderStatus` |
| `list_pending_orders(account_number)` | `str` | `list[OrderStatus]` |

## 11. Demo vs Real

| | Demo | Real |
|---|------|------|
| App Key/Secret | Mock investment keys | Live trading keys |
| Base URL | `https://mockapi.kiwoom.com` | `https://api.kiwoom.com` |
| WebSocket | `wss://mockapi.kiwoom.com:10000` | `wss://api.kiwoom.com:10000` |
| Market param | `market="demo"` | `market="real"` |

Always test with demo first before using real keys.
