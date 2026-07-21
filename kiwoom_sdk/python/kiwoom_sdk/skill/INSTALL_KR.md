# kiwoom-trader Skill 설치 가이드

## kiwoom-trader가 무엇인가요?

kiwoom-trader는 LLM이 자연어로 키움증권 REST API를 통해 주식 거래를 실행할 수 있게 해주는 AI 스킬입니다. 국내주식(KRX)과 미국주식(NASDAQ/NYSE/AMEX)을 지원합니다.

## 사전 준비

- Python 3.10 이상
- 키움증권 OpenAPI App Key와 App Secret
  - [키움증권 OpenAPI 포털](https://openapi.kiwoom.com)에서 발급
  - 반드시 모의투자 키로 먼저 테스트하세요

## 설치 방법

### 1. SDK 설치

```bash
git clone https://github.com/gameworkerkim/vibe-investing.git
cd vibe-investing/kiwoom_sdk/python
pip install -e .
```

### 2. 설치 확인

```python
from kiwoom_sdk import KiwoomClient
from kiwoom_sdk.skill import parse_command, Intent, classify_intent

# 의도 분류 테스트
assert classify_intent("삼성전자 10주 매수") == Intent.PLACE_ORDER
assert classify_intent("내 잔고 알려줘") == Intent.ACCOUNT_QUERY
assert classify_intent("NVDA 시세") == Intent.STOCK_SEARCH

# 엔티티 추출 테스트
cmd = parse_command("005930 10주 시장가 매수")
assert cmd.stock_code == "005930"
assert cmd.quantity == 10
assert cmd.action == "buy"

print("스킬 설치 확인 완료!")
```

## LLM 연동 가이드

### Claude Desktop

1. 스킬을 Claude Desktop MCP 설정에 추가하거나 사용자 정의 지침으로 사용
2. `SYSTEM_PROMPT_KR`을 Claude의 프로젝트 지침에 붙여넣기

```python
from kiwoom_sdk.skill import SYSTEM_PROMPT_KR

# SYSTEM_PROMPT_KR을 Claude 시스템 프롬프트에 붙여넣기
print(SYSTEM_PROMPT_KR)
```

Claude Desktop 사용 예시:
```
사용자: 삼성전자 현재가 알려줘
Claude: [stock_search 의도로 분류, 005930 시세 반환]
```

### ChatGPT (OpenAI)

```python
import openai
from kiwoom_sdk.skill import SYSTEM_PROMPT_KR

response = openai.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT_KR},
        {"role": "user", "content": "삼성전자 10주 시장가 매수"},
    ],
)
```

### Cursor / Windsurf / OpenCode

1. `kiwoom_trader_skill.md` 파일을 프로젝트의 `.cursor/rules/` 또는 컨텍스트 파일에 복사
2. AI 에이전트가 이 스킬 정의를 참조하여 트레이딩 명령을 라우팅

```bash
cp skill/kiwoom_trader_skill.md ~/my-project/.cursor/rules/kiwoom-trader.md
```

### 커스텀 에이전트 / 스크립트

```python
from kiwoom_sdk import KiwoomClient
from kiwoom_sdk.skill import parse_command, Intent, format_response

client = KiwoomClient("APP_KEY", "APP_SECRET", market="demo")

def handle_command(text: str) -> str:
    cmd = parse_command(text)

    if cmd.warnings:
        return "경고:\n" + "\n".join(cmd.warnings)

    if cmd.intent == Intent.ACCOUNT_QUERY:
        accounts = client.domestic_account.list_accounts()
        if not accounts:
            return "등록된 계좌가 없습니다."
        result = []
        for acct in accounts:
            bal = client.domestic_account.get_balance(acct.account_number)
            result.append(f"계좌 {acct.account_number}: 예수금 {bal.deposit:,.0f}원")
        return "\n".join(result)

    if cmd.intent == Intent.PLACE_ORDER:
        summary = format_response(cmd)
        return f"주문 요약:\n{summary}\n\n실행할까요? (예/아니오)"

    if cmd.intent == Intent.STOCK_SEARCH:
        return f"{cmd.stock_code} 종목 정보를 조회합니다..."

    return f"알 수 없는 명령: {text}"

# 데모 루프
while True:
    user_input = input("\n> ")
    if user_input.lower() in ("exit", "quit", "종료"):
        break
    print(handle_command(user_input))

client.close()
```

## 환경 설정

### API 키 관리

절대 코드에 API 키를 하드코딩하지 마세요. 환경 변수를 사용하세요:

```bash
export KIWOOM_APP_KEY="발급받은-app-key"
export KIWOOM_APP_SECRET="발급받은-app-secret"
export KIWOOM_MODE="demo"  # 실전은 "real"
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

### 안전 설정

```python
# 개발 중에는 반드시 모의투자 모드 사용
client = KiwoomClient("KEY", "SECRET", market="demo")

# 스킬이 자동으로 확인하는 사항:
# - 거래 시간 (KRX: 월-금 09:00-15:30 KST)
# - 주문 규모 제한 (1만주 초과 또는 1억원 초과 시 경고)
# - 주문 실행 전 사용자 확인 필수
```

## 테스트

### 단위 테스트

```python
from kiwoom_sdk.skill import classify_intent, parse_command, Intent

def test_intent_classification():
    cases = [
        ("내 잔고 보여줘", Intent.ACCOUNT_QUERY),
        ("삼성전자 현재가", Intent.STOCK_SEARCH),
        ("005930 10주 매수", Intent.PLACE_ORDER),
        ("주문 상태 확인", Intent.CHECK_ORDER),
        ("005930 주문 취소", Intent.CANCEL_ORDER),
        ("NVDA 5주 시장가 매도", Intent.PLACE_ORDER),
        ("사용법 알려줘", Intent.HELP),
    ]
    for text, expected in cases:
        result = classify_intent(text)
        assert result == expected, f"실패: '{text}' -> {result} (기대: {expected})"
    print("의도 분류 테스트 통과!")

def test_entity_extraction():
    cmd = parse_command("삼성전자 005930 10주 75000원에 매수")
    assert cmd.stock_code == "005930"
    assert cmd.quantity == 10
    assert cmd.price == 75000.0
    assert cmd.action == "buy"
    assert cmd.is_us == False

    cmd = parse_command("NVDA 5주 시장가 매도")
    assert cmd.stock_code == "NVDA"
    assert cmd.quantity == 5
    assert cmd.is_us == True
    assert cmd.action == "sell"

    print("엔티티 추출 테스트 통과!")

def test_safety_guard():
    # 대량 주문 경고 확인
    cmd = parse_command("005930 20000주 매수")
    assert len(cmd.warnings) > 0, "대량 주문 경고가 발생해야 함"

    print("안전장치 테스트 통과!")

test_intent_classification()
test_entity_extraction()
test_safety_guard()
print("모든 테스트 통과!")
```

## 문제 해결

| 문제 | 해결 방법 |
|------|----------|
| `ModuleNotFoundError: kiwoom_sdk` | `kiwoom_sdk/python` 디렉토리에서 `pip install -e .` 실행 |
| `CredentialsNotFoundError` | 환경 변수에 App Key/Secret이 설정되어 있는지 확인 |
| 종목코드 인식 불가 | 국내는 6자리 숫자(005930), 미국은 티커(NVDA) 사용 |
| 모의투자에서 주문 실패 | 실전 키가 아닌 모의투자 키인지 확인 |
| 의도 분류 오류 | 더 명확한 표현 사용. `help` 명령으로 지원 의도 확인 |
| 거래 시간 오류 | KRX: 월-금 09:00-15:30, 미국: 월-금 22:30-05:00 (KST) |

## 파일 구성

| 파일 | 설명 |
|------|------|
| `skill/__init__.py` | 의도 분류기, 엔티티 추출기, 안전장치, 시스템 프롬프트 |
| `skill/kiwoom_trader_skill.md` | LLM 컨텍스트용 전체 스킬 정의 (에이전트 규칙에 복사) |
| `skill/README.md` | 스킬 개요 및 아키텍처 |
| `skill/INSTALL.md` | 설치 가이드 (영문) |
| `skill/INSTALL_KR.md` | 설치 가이드 (한글, 이 파일) |
| `manual.md` | 전체 SDK API 레퍼런스 (3개 언어) |
| `readme_kr.md` | 한글 기능 명세 |

## 다음 단계

1. 모의투자 키(`market="demo"`)로 먼저 테스트
2. LLM 작업 공간에 스킬 프롬프트 통합
3. 데모 루프를 실행하여 명령 파싱 검증
4. 커스텀 에이전트 구축 또는 기존 LLM 도구와 연동
5. 충분한 테스트 후 실전 키로 전환
