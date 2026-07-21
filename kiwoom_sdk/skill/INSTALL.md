# kiwoom-trader Skill Installation Guide

## What is kiwoom-trader?

kiwoom-trader is an AI skill that enables LLMs to execute stock trades via the Kiwoom Securities REST API using natural language. It supports Korean domestic stocks (KRX) and US stocks (NASDAQ/NYSE/AMEX).

## Prerequisites

- Python 3.10+
- Kiwoom Securities OpenAPI App Key and App Secret
  - Issue at [Kiwoom OpenAPI Portal](https://openapi.kiwoom.com)
  - Use demo keys first for testing

## Installation

### 1. Install the SDK

```bash
git clone https://github.com/gameworkerkim/vibe-investing.git
cd vibe-investing/kiwoom_sdk/python
pip install -e .
```

### 2. Verify Installation

```python
from kiwoom_sdk import KiwoomClient
from kiwoom_sdk.skill import parse_command, Intent, classify_intent

# Test intent classification
assert classify_intent("삼성전자 10주 매수") == Intent.PLACE_ORDER
assert classify_intent("내 잔고 알려줘") == Intent.ACCOUNT_QUERY
assert classify_intent("NVDA 시세") == Intent.STOCK_SEARCH

# Test entity extraction
cmd = parse_command("005930 10주 시장가 매수")
assert cmd.stock_code == "005930"
assert cmd.quantity == 10
assert cmd.action == "buy"

print("Skill installation verified!")
```

## Integration Guides

### Claude Desktop

Add to your Claude Desktop MCP config or use as a custom instruction:

1. Install the skill as a standalone tool
2. Copy `SYSTEM_PROMPT_EN` or `SYSTEM_PROMPT_KR` into Claude's project instructions

```python
from kiwoom_sdk.skill import SYSTEM_PROMPT_KR

# Paste SYSTEM_PROMPT_KR into Claude's project/system prompt
print(SYSTEM_PROMPT_KR)
```

Then in Claude Desktop:
```
You: 삼성전자 현재가 알려줘
Claude: [Calls stock_search intent, returns 005930 quote]
```

### OpenAI GPT

```python
import openai
from kiwoom_sdk.skill import SYSTEM_PROMPT_EN

response = openai.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT_EN},
        {"role": "user", "content": "Buy 10 shares of NVDA at market price"},
    ],
)
```

### Cursor / Windsurf / OpenCode

1. Copy `kiwoom_trader_skill.md` into your project's `.cursor/rules/` or context files
2. The AI agent will use the skill definitions to route trading commands

```bash
cp skill/kiwoom_trader_skill.md ~/my-project/.cursor/rules/kiwoom-trader.md
```

### Custom Agent / Script

```python
from kiwoom_sdk import KiwoomClient
from kiwoom_sdk.skill import parse_command, Intent, format_response

client = KiwoomClient("APP_KEY", "APP_SECRET", market="demo")

def handle_command(text: str) -> str:
    cmd = parse_command(text)

    if cmd.warnings:
        return "Warnings:\n" + "\n".join(cmd.warnings)

    if cmd.intent == Intent.ACCOUNT_QUERY:
        accounts = client.domestic_account.list_accounts()
        if not accounts:
            return "No accounts found."
        result = []
        for acct in accounts:
            bal = client.domestic_account.get_balance(acct.account_number)
            result.append(f"Account {acct.account_number}: Deposit {bal.deposit:,.0f} KRW")
        return "\n".join(result)

    if cmd.intent == Intent.PLACE_ORDER:
        summary = format_response(cmd)
        return f"Order Summary:\n{summary}\n\nConfirm? (yes/no)"

    if cmd.intent == Intent.STOCK_SEARCH:
        return f"Searching for {cmd.stock_code}..."

    return f"Unknown command: {text}"

# Demo loop
while True:
    user_input = input("\n> ")
    if user_input.lower() in ("exit", "quit"):
        break
    print(handle_command(user_input))

client.close()
```

## Configuration

### API Keys

Never hardcode API keys. Use environment variables:

```bash
export KIWOOM_APP_KEY="your-app-key"
export KIWOOM_APP_SECRET="your-app-secret"
export KIWOOM_MODE="demo"  # "real" for live trading
```

```python
import os
from kiwoom_sdk import KiwoomClient

client = KiwoomClient(
    app_key=os.environ["KIWOOM_APP_KEY"],
    app_secret=os.environ["KIWOOM_APP_SECRET"],
    market=os.environ.get("KIWOOM_MODE", "demo"),
)
```

### Safety Settings

```python
# Always use demo mode for development
client = KiwoomClient("KEY", "SECRET", market="demo")

# The skill automatically checks:
# - Market hours (KRX: 09:00-15:30 KST, Mon-Fri)
# - Order size limits (>10k shares or >100M KRW warns)
# - Requires user confirmation before executing orders
```

## Testing

### Unit Tests

```python
from kiwoom_sdk.skill import classify_intent, parse_command, Intent

def test_intent_classification():
    cases = [
        ("내 잔고 보여줘", Intent.ACCOUNT_QUERY),
        ("삼성전자 현재가", Intent.STOCK_SEARCH),
        ("005930 10주 매수", Intent.PLACE_ORDER),
        ("주문 상태 확인", Intent.CHECK_ORDER),
        ("005930 주문 취소", Intent.CANCEL_ORDER),
        ("NVDA buy 10 shares market", Intent.PLACE_ORDER),
    ]
    for text, expected in cases:
        assert classify_intent(text) == expected, f"Failed: {text}"

def test_entity_extraction():
    cmd = parse_command("삼성전자 005930 10주 75000원에 매수")
    assert cmd.stock_code == "005930"
    assert cmd.quantity == 10
    assert cmd.price == 75000.0
    assert cmd.action == "buy"

    cmd = parse_command("NVDA 5주 시장가 매도")
    assert cmd.stock_code == "NVDA"
    assert cmd.quantity == 5
    assert cmd.is_us == True

test_intent_classification()
test_entity_extraction()
print("All tests passed!")
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: kiwoom_sdk` | Run `pip install -e python/` from kiwoom_sdk directory |
| `CredentialsNotFoundError` | Check App Key/Secret environment variables |
| `Invalid stock code` | Use 6-digit domestic codes (005930) or US tickers (NVDA) |
| `주문 실패` in demo | Verify demo keys are being used, not real keys |
| Intent misclassification | Try more explicit phrasing. Use `--help` to see supported intents |

## File Reference

| File | Description |
|------|-------------|
| `skill/__init__.py` | Intent classifier, entity extractor, safety guard, system prompts |
| `skill/kiwoom_trader_skill.md` | Full skill definition for LLM context (copy to agent rules) |
| `skill/README.md` | Skill overview and architecture |
| `skill/INSTALL.md` | This guide (English) |
| `skill/INSTALL_KR.md` | Installation guide (Korean) |
| `manual.md` | Full SDK API reference (3 languages) |
| `readme_kr.md` | Korean feature specification |

## Next Steps

1. Test with demo keys (`market="demo"`)
2. Integrate the skill prompt into your LLM workspace
3. Run the demo loop to validate command parsing
4. Build a custom agent or use with existing LLM tools
5. Switch to real keys only after thorough testing
