# Kiwoom Securities REST API Python SDK

## Installation

```bash
pip install kiwoom-sdk
# or from local
pip install -e .
```

## Quick Start

```python
from kiwoom_sdk import KiwoomClient
from kiwoom_sdk.models import OrderType

client = KiwoomClient(
    app_key="YOUR_APP_KEY",
    app_secret="YOUR_APP_SECRET",
    market="demo",  # "real" for live trading
)

# 1. Issue access token
token = client.auth()
print(f"Token issued: {token[:20]}...")

# 2. List accounts
accounts = client.domestic_account.list_accounts()
for acct in accounts:
    print(f"Account: {acct.account_number} - {acct.account_name}")

# 3. Check balance
if accounts:
    balance = client.domestic_account.get_balance(accounts[0].account_number)
    print(f"Balance: {balance.deposit:,} KRW")

# 4. View holdings
if accounts:
    holdings = client.domestic_account.list_holdings(accounts[0].account_number)
    for h in holdings:
        print(f"  {h.stock_name}({h.stock_code}): {h.quantity} shares")

# 5. Place a buy order (demo only)
result = client.domestic_order.buy(
    stock_code="005930",
    quantity=1,
    price=70000,
    order_type=OrderType.NORMAL,
)
print(f"Order placed: {result.order_number}")

# 6. Check order status
status = client.domestic_order.get_order_status(result.order_number)
print(f"Status: {status.status}, Filled: {status.filled_quantity}/{status.order_quantity}")

# 7. Cancel an order
cancel = client.domestic_order.cancel(
    order_number=result.order_number,
    stock_code="005930",
)
print(f"Cancelled: {cancel.return_msg}")

# 8. Clean up
client.close()
```

## Using as Context Manager

```python
with KiwoomClient(app_key="KEY", app_secret="SECRET") as client:
    accounts = client.domestic_account.list_accounts()
    # ... do things
# token revoked and session closed automatically
```

## Overseas (US) Trading

```python
client = KiwoomClient(app_key="KEY", app_secret="SECRET")

# US account list
us_accounts = client.overseas_account.list_accounts()

# Buy US stock (market order)
result = client.overseas_order.buy(
    stock_code="NVDA",
    quantity=1,
    order_type=OrderType.MARKET,
    exchange="ND",  # ND=NASDAQ, NY=NYSE, AM=AMEX
)

# Sell US stock
result = client.overseas_order.sell(
    stock_code="TSLA",
    quantity=10,
    price=250.0,
    order_type=OrderType.NORMAL,
)
```

## Package Structure

```
kiwoom_sdk/
├── __init__.py           # KiwoomClient export
├── client.py             # KiwoomClient, KiwoomHttpClient
├── auth.py               # KiwoomAuth (token management)
├── config.py             # Config, Market enum
├── errors.py             # Custom exceptions
├── models/
│   ├── __init__.py       # Enums (OrderType, TradeType, Exchange, etc.)
│   └── account.py        # Pydantic models (AccountInfo, Holding, OrderResult)
└── services/
    ├── domestic/
    │   ├── account.py    # Domestic account/balance/holdings
    │   └── order.py      # Domestic buy/sell/modify/cancel
    └── overseas/
        ├── account.py    # US account/balance/holdings
        └── order.py      # US buy/sell/modify/cancel
```
