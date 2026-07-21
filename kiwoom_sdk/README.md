# Kiwoom Securities REST API SDK

Multi-language SDK for Kiwoom Securities REST API. Supports domestic (KRX) and overseas (NASDAQ/NYSE/AMEX) stock trading.

## Supported Languages

| Language | Directory | Dependencies |
|----------|-----------|--------------|
| Python | `python/` | `requests` + `pydantic` |
| Java | `java/` | `okhttp` + `jackson` |
| TypeScript | `typescript/` | Zero dependencies (native fetch) |

## Common Features

- OAuth2 client_credentials token management (auto-issue/refresh/cache)
- Domestic account inquiry (list, balance, holdings)
- Domestic trading (buy/sell/modify/cancel, 16 order types)
- Overseas account + trading (US stocks)
- Typed error handling with error code classification
- Demo/real environment switching
- Auto-retry on auth failure

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
├── python/
│   ├── README.md
│   ├── pyproject.toml
│   └── kiwoom_sdk/           # Python package source
├── java/
│   ├── README.md
│   ├── pom.xml
│   └── src/main/java/com/kiwoom/sdk/  # Java source
└── typescript/
    ├── README.md
    ├── package.json
    ├── tsconfig.json
    └── src/                  # TypeScript source
```

## Manual

See [kiwoom_sdk_manual.md](../TechDoc/Kiwoom_OpenAPI/kiwoom_sdk_manual.md) for comprehensive API reference.

## Reference

- [Kiwoom official REST API](https://github.com/Kiwoom-Securities/Kiwoom-REST-API)
- [Kiwoom OpenAPI portal](https://openapi.kiwoom.com)
