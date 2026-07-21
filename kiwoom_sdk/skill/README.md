# kiwoom-trader Skill

LLM-driven trading assistant skill for Kiwoom Securities REST API.

## Overview

`kiwoom-trader` is an AI skill that enables LLMs (Claude, GPT, DeepSeek, etc.) to understand natural language trading commands and execute them via the Kiwoom SDK.

## Architecture

```
User (natural language)
       |
       v
+------------------+
| Intent Classifier |  classify_intent()
+------------------+
       |
       v
+------------------+
| Entity Extractor  |  extract_entities()
+------------------+
       |
       v
+------------------+
| Param Validator   |  validate_command()
+------------------+
       |
       v
+------------------+
| Safety Guard      |  check_safety()
+------------------+
       |
       v
+------------------+
| API Executor      |  KiwoomClient (Python/Java/TS SDK)
+------------------+
```

## Intent Classes

| Intent | Examples |
|--------|----------|
| `account_query` | "내 계좌 보여줘", "잔고 알려줘", "보유종목 조회" |
| `stock_search` | "삼성전자 현재가", "005930 시세", "NVDA 차트" |
| `place_order` | "005930 10주 매수", "삼성전자 시장가 매도" |
| `check_order` | "주문 상태 확인", "미체결 내역" |
| `cancel_order` | "주문 취소해줘", "005930 주문 취소" |
| `realtime_subscribe` | "005930 실시간 알림", "NVDA 체결 구독" |

## Usage

### Standalone

```python
from kiwoom_sdk import KiwoomClient
from kiwoom_sdk.skill import parse_command, Intent

# Parse user command
cmd = parse_command("005930 10주 시장가 매수")
print(cmd)
# ParsedCommand(intent='place_order', stock_code='005930', quantity=10, ...)

# Execute via SDK
client = KiwoomClient("KEY", "SECRET", market="demo")
if cmd.intent == Intent.PLACE_ORDER and not cmd.warnings:
    if cmd.is_us:
        result = client.overseas_order.buy(cmd.stock_code, cmd.quantity, cmd.price, cmd.order_type, cmd.exchange)
    else:
        result = client.domestic_order.buy(cmd.stock_code, cmd.quantity, cmd.price, cmd.order_type, cmd.exchange)
```

### With LLM

Copy `SYSTEM_PROMPT_KR` or `SYSTEM_PROMPT_EN` into your LLM system prompt. The LLM will route user commands to the appropriate SDK methods.

```python
import openai

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT_KR},
        {"role": "user", "content": "삼성전자 현재가 알려줘"},
    ],
)
```

## Files

- `__init__.py` - Intent classifier, entity extractor, parameter validator, safety guard, system prompts
- `kiwoom_trader_skill.md` - Full skill definition for LLM context
- `README.md` - This file
- `INSTALL.md` - Installation guide (English)
- `INSTALL_KR.md` - Installation guide (Korean)

## Safety Rules

1. **Never execute orders without user confirmation** - Always show execution summary first
2. **Market hours check** - Block orders outside 08:00-18:00 KST on weekdays
3. **Size limit warning** - Warn on orders > 10,000 shares or > 100M KRW
4. **Demo first** - Always test with `market="demo"` before real trading
