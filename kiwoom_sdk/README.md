# Kiwoom Securities REST API SDK (개발중 미완성)

Multi-language SDK + AI Trading Skill for Kiwoom Securities REST API. Supports domestic (KRX) and overseas (NASDAQ/NYSE/AMEX) stock trading.

## Components

| Component | Directory | Description |
|-----------|-----------|-------------|
| Python SDK | `python/` | `requests` + `pydantic` |
| Java SDK | `java/` | `okhttp` + `jackson` |
| TypeScript SDK | `typescript/` | Zero deps (native fetch) |
| **kiwoom-trader Skill** | `python/kiwoom_sdk/skill/` | LLM-based natural language trading |
| Installation | `skill/INSTALL.md` (EN) / `skill/INSTALL_KR.md` (KR) | Step-by-step setup |

## Common Features

- OAuth2 client_credentials token management (auto-issue/refresh/cache)
- Domestic account inquiry (list, balance, holdings)
- Domestic trading (buy/sell/modify/cancel, 16 order types)
- Overseas account + trading (US stocks)
- Typed error handling with error code classification
- Demo/real environment switching
- Auto-retry on auth failure

## kiwoom-trader Skill

LLM-based AI trading assistant. Translates natural language to Kiwoom API calls.

```
User: "삼성전자 10주 시장가 매수"
  -> Intent: place_order
  -> Stock: 005930, Qty: 10, Type: market
  -> Safety check: market hours, size limit
  -> Confirmation: "주문 요약: 삼성전자(005930) 10주 매수. 실행할까요?"
  -> Execute: domestic_order.buy("005930", 10, order_type="3")
```

**Supported Intents**: account_query, stock_search, place_order, check_order, cancel_order, realtime_subscribe

**Safety Rules**: mandatory confirmation, market hours check, size limit warning, demo-first

See [skill/README.md](skill/README.md) for integration guide.

## Quick Start

### Python

```python
from kiwoom_sdk import KiwoomClient
from kiwoom_sdk.models import OrderType

client = KiwoomClient("KEY", "SECRET", market="demo")
token = client.auth()
accounts = client.domestic_account.list_accounts()
result = client.domestic_order.buy("005930", 1, order_type=OrderType.MARKET)
client.close()
```

### Java

```java
var client = new KiwoomClient("KEY", "SECRET", "demo");
client.auth();
var accounts = client.domesticAccount().listAccounts();
var result = client.domesticOrder().buy("005930", 1);
client.close();
```

### TypeScript

```typescript
const client = new KiwoomClient("KEY", "SECRET", "demo");
await client.authenticate();
const accounts = await client.domesticAccount.listAccounts();
const result = await client.domesticOrder.buy("005930", 1);
client.close();
```

### Skill (Python)

```python
from kiwoom_sdk import KiwoomClient
from kiwoom_sdk.skill import parse_command, Intent

cmd = parse_command("삼성전자 10주 시장가 매수")
client = KiwoomClient("KEY", "SECRET", market="demo")
if cmd.intent == Intent.PLACE_ORDER and not cmd.warnings:
    result = client.domestic_order.buy(cmd.stock_code, cmd.quantity, cmd.price, cmd.order_type)
```

## API Coverage

| Service | API IDs | Description |
|---------|---------|-------------|
| Domestic Account | ka00001, ka01690, ka10072 | List accounts, balance, holdings |
| Domestic Order | kt10000-kt10003 | Buy, sell, modify, cancel |
| Overseas Account | ust21050, ust21070, ust21661 | US account/balance/holdings |
| Overseas Order | ust20000-ust20003 | US buy, sell, modify, cancel |

## Project Structure

```
kiwoom_sdk/
├── README.md                 # This file
├── readme_kr.md              # Korean feature specification
│   ├── kiwoom_sdk/
│   │   └── skill/            # kiwoom-trader Skill (intent, safety, prompts)
├── java/
│   ├── README.md
│   ├── pom.xml
│   └── src/main/java/com/kiwoom/sdk/
└── typescript/
    ├── README.md
    ├── package.json
    ├── tsconfig.json
    └── src/
```

## Manual

See [manual.md](manual.md) for comprehensive multi-language API reference.

## Reference

- [Kiwoom official REST API](https://github.com/Kiwoom-Securities/Kiwoom-REST-API)
- [Kiwoom OpenAPI portal](https://openapi.kiwoom.com)
- [Development roadmap](../TechDoc/Kiwoom_OpenAPI/readme.md)
