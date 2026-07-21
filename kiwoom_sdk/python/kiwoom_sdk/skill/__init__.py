from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable

from kiwoom_sdk import KiwoomClient

INTENT_KEYWORDS: dict[str, list[str]] = {
    "account_query": [
        r"(?:계좌|잔고|예수금|평가손익|보유|보유종목|자산)",
        r"(?:account|balance|deposit|portfolio|holding)",
    ],
    "stock_search": [
        r"(?:검색|찾아|조회|현재가|시세|차트|정보|종목\s*(?:검색|조회|정보|시세))",
        r"(?:search|find|quote|chart|price|info|stock\s*(?:search|info|quote))",
    ],
    "place_order": [
        r"(?:매수|매도|사자|팔자|주문|거래|buy|sell|order|trade)",
        r"(?:\d+\s*(?:주|shares?)\s*(?:매수|매도|buy|sell))",
    ],
    "check_order": [
        r"(?:주문\s*(?:상태|확인|조회|내역|결과))",
        r"(?:order\s*(?:status|check|history))",
    ],
    "cancel_order": [
        r"(?:주문\s*취소|취소\s*(?:주문|해줘|요청))",
        r"(?:cancel\s*(?:order|my|the))",
    ],
    "realtime_subscribe": [
        r"(?:실시간|알림|구독|모니터링|감시|push)",
        r"(?:realtime|subscribe|alert|monitor|watch|notify)",
    ],
    "help": [
        r"(?:도움말|명령어|사용법|가능|뭐|어떻게|help|command|usage)",
    ],
}

STOCK_CODE_PATTERN = re.compile(r"\b([0-9]{6})\b")
US_STOCK_PATTERN = re.compile(r"\b([A-Z]{1,5})\b")
QUANTITY_PATTERN = re.compile(r"(\d+)\s*(?:주|shares?)")
PRICE_PATTERN = re.compile(r"(\d[\d,]*)\s*(?:원|won)\b")
ORDER_TYPE_MAP: dict[str, str] = {
    "지정가": "0", "limit": "0", "지정": "0",
    "시장가": "3", "market": "3", "시장": "3",
    "조건부지정가": "5", "conditional": "5",
    "최유리지정가": "6", "best": "6",
    "최우선지정가": "7", "top": "7",
    "IOC": "10", "ioc": "10",
    "FOK": "20", "fok": "20",
}


class Intent(str, Enum):
    ACCOUNT_QUERY = "account_query"
    STOCK_SEARCH = "stock_search"
    PLACE_ORDER = "place_order"
    CHECK_ORDER = "check_order"
    CANCEL_ORDER = "cancel_order"
    REALTIME_SUBSCRIBE = "realtime_subscribe"
    HELP = "help"
    UNKNOWN = "unknown"


@dataclass
class ParsedCommand:
    intent: Intent = Intent.UNKNOWN
    action: str = ""
    stock_code: str = ""
    stock_name: str = ""
    quantity: int = 0
    price: float = 0.0
    order_type: str = "3"
    exchange: str = "KRX"
    account_number: str = ""
    is_us: bool = False
    raw_text: str = ""
    confidence: float = 0.0
    warnings: list[str] = field(default_factory=list)


def classify_intent(text: str) -> Intent:
    text_lower = text.lower()
    scores: dict[Intent, int] = {intent: 0 for intent in Intent}

    for intent, patterns in INTENT_KEYWORDS.items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                scores[Intent(intent)] += 1

    sorted_intents = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_intent, top_score = sorted_intents[0]

    if top_score == 0:
        return Intent.UNKNOWN

    if scores.get(Intent.CANCEL_ORDER, 0) > 0 and top_intent == Intent.PLACE_ORDER:
        return Intent.CANCEL_ORDER
    if scores.get(Intent.CHECK_ORDER, 0) > 0 and top_intent == Intent.PLACE_ORDER:
        return Intent.CHECK_ORDER

    return top_intent


def extract_entities(text: str, intent: Intent) -> ParsedCommand:
    cmd = ParsedCommand(intent=intent, raw_text=text)

    # Extract stock code
    domestic_match = STOCK_CODE_PATTERN.search(text)
    us_match = US_STOCK_PATTERN.search(text)

    if domestic_match:
        domestic_code = domestic_match.group(1)
        if us_match and us_match.group(1) == domestic_code:
            cmd.stock_code = domestic_code
            cmd.is_us = False
        else:
            cmd.stock_code = domestic_code
            cmd.is_us = False
    elif us_match:
        cmd.stock_code = us_match.group(1)
        cmd.is_us = True
        cmd.exchange = "ND"

    # Extract quantity
    qty_match = QUANTITY_PATTERN.search(text)
    if qty_match:
        cmd.quantity = int(qty_match.group(1))

    # Extract price
    price_match = PRICE_PATTERN.search(text)
    if price_match:
        cmd.price = float(price_match.group(1).replace(",", ""))

    # Determine order type
    for keyword, otype in ORDER_TYPE_MAP.items():
        if keyword in text.lower():
            cmd.order_type = otype
            break

    # Determine action for order intent
    if intent == Intent.PLACE_ORDER:
        if any(w in text for w in ["매수", "buy", "사자"]):
            cmd.action = "buy"
        elif any(w in text for w in ["매도", "sell", "팔자"]):
            cmd.action = "sell"

    # US market detection
    if any(w in text.lower() for w in ["미국", "nasdaq", "nyse", "amex", "해외"]):
        cmd.is_us = True
        cmd.exchange = "ND"

    return cmd


def validate_command(cmd: ParsedCommand) -> ParsedCommand:
    if cmd.intent == Intent.PLACE_ORDER:
        if not cmd.stock_code:
            cmd.warnings.append("종목코드가 필요합니다. 예: 005930 10주 매수")
        if not cmd.quantity or cmd.quantity <= 0:
            cmd.warnings.append("수량이 필요합니다. 예: 1주, 10주")
        if not cmd.action:
            cmd.warnings.append("매수인지 매도인지 구분할 수 없습니다.")

    if cmd.intent == Intent.STOCK_SEARCH:
        if not cmd.stock_code:
            cmd.warnings.append("종목코드 또는 종목명이 필요합니다.")

    if cmd.intent == Intent.CANCEL_ORDER:
        if not cmd.stock_code:
            cmd.warnings.append("취소할 종목코드가 필요합니다.")

    return cmd


import datetime as _dt


def check_safety(cmd: ParsedCommand) -> ParsedCommand:
    if cmd.intent != Intent.PLACE_ORDER:
        return cmd

    now = _dt.datetime.now()
    weekday = now.weekday()
    hour = now.hour
    minute = now.minute

    if weekday >= 5:
        cmd.warnings.append("주말/공휴일에는 주문이 불가능합니다.")

    is_market_hours = (9 <= hour < 15) or (hour == 15 and minute <= 30)
    is_pre_market = (8 <= hour < 9)
    is_after_market = (15 <= hour < 18)

    if not is_market_hours and not is_pre_market and not is_after_market:
        cmd.warnings.append("현재 거래 시간이 아닙니다. (장: 09:00 ~ 15:30)")

    if cmd.quantity > 10000:
        cmd.warnings.append(f"대량 주문 ({cmd.quantity}주). 확인 후 실행하세요.")

    if cmd.price > 0 and cmd.quantity > 0:
        total = cmd.price * cmd.quantity
        if total > 100_000_000:
            cmd.warnings.append(f"주문 총액이 {total:,.0f}원입니다. 확인 후 실행하세요.")

    return cmd


def format_response(cmd: ParsedCommand) -> str:
    if cmd.warnings:
        return "\n".join(cmd.warnings)

    if cmd.intent == Intent.ACCOUNT_QUERY:
        return f"계좌 정보를 조회합니다."

    if cmd.intent == Intent.STOCK_SEARCH:
        return f"'{cmd.stock_code}' 종목 정보를 조회합니다."

    if cmd.intent == Intent.PLACE_ORDER:
        action_kr = "매수" if cmd.action == "buy" else "매도"
        otype_kr = {v: k for k, v in ORDER_TYPE_MAP.items()}.get(cmd.order_type, cmd.order_type)
        market = "미국" if cmd.is_us else "국내"
        parts = [f"{market} {cmd.stock_code} {cmd.quantity}주 {action_kr} ({otype_kr}"]
        if cmd.price > 0:
            parts.append(f", {cmd.price:,.0f}원")
        parts.append(")")
        return "".join(parts)

    if cmd.intent == Intent.CANCEL_ORDER:
        return f"'{cmd.stock_code}' 주문 취소를 요청합니다."

    return f"명령을 이해하지 못했습니다: {cmd.raw_text}"


def parse_command(text: str) -> ParsedCommand:
    intent = classify_intent(text)
    cmd = extract_entities(text, intent)
    cmd = validate_command(cmd)
    cmd = check_safety(cmd)

    if cmd.warnings:
        cmd.confidence = 0.3
    elif intent != Intent.UNKNOWN:
        cmd.confidence = 0.8

    return cmd


SYSTEM_PROMPT_KR = """
당신은 kiwoom-trader, 키움증권 REST API를 활용한 주식 자동매매 어시스턴트입니다.

역할:
- 사용자의 자연어 명령을 이해하고 키움증권 API를 호출
- 국내주식(KRX)과 미국주식(NASDAQ/NYSE/AMEX) 지원

지원 기능:
1. 계좌 조회: 잔고, 예수금, 평가손익, 보유종목
2. 종목 검색: 종목명/코드로 기본정보, 시세, 차트 조회
3. 주문 실행: 지정가/시장가 매수/매도 (16가지 주문타입)
4. 주문 확인: 체결/미체결 내역 조회
5. 주문 취소: 미체결 주문 취소
6. 실시간 알림: WebSocket 기반 체결/호가 알림 (추후 지원)

API Mapping:
- "내 잔고 알려줘" -> domestic_account.list_accounts() + get_balance()
- "삼성전자 현재가" -> stock.get_info("005930")
- "005930 10주 시장가 매수" -> domestic_order.buy("005930", 10, order_type="3")
- "005930 1주 매수" -> domestic_order.buy("005930", 1)
- "NVDA 5주 매도" -> overseas_order.sell("NVDA", 5)

Safety Rules (절대 위반 금지):
1. 주문 전 반드시 사용자에게 실행 내용을 보여주고 확인을 받을 것
2. 주문 확인 응답으로 "yes", "확인", "진행" 등을 받기 전까지 절대 주문하지 말 것
3. 장 종료 후 30분 이내, 주말/공휴일 주문 차단
4. 1회 주문 한도 확인 (기본 1,000만원 초과 시 경고)

응답 형식:
- 계좌/시세 조회: 결과를 표 형태로 정리
- 주문 요청: 실행 전 요약을 보여주고 "정말 실행할까요?" 확인
- 오류: 원인과 해결 방법을 함께 안내
"""

SYSTEM_PROMPT_EN = """
You are kiwoom-trader, an AI trading assistant using the Kiwoom Securities REST API.

Role:
- Understand natural language commands and execute trades via Kiwoom API
- Supports Korean domestic stocks (KRX) and US stocks (NASDAQ/NYSE/AMEX)

Capabilities:
1. Account inquiry: balance, deposit, P/L, holdings
2. Stock search: quote, chart, info by code/name
3. Order execution: buy/sell with 16 order types
4. Order status: filled/unfilled order history
5. Order cancellation
6. Realtime alerts: WebSocket streaming (coming soon)

Safety Rules (NEVER VIOLATE):
1. Always show execution summary and get user confirmation before placing orders
2. Wait for explicit "yes", "confirm", or equivalent before executing
3. Block orders outside market hours and on weekends/holidays
4. Warn on orders exceeding 10M KRW

Response Format:
- Account/search: tabular results
- Order request: summary + "Shall I execute?"
- Error: cause + resolution
"""


class KiwoomTrader:
    def __init__(
        self,
        app_key: str,
        app_secret: str,
        *,
        market: str = "demo",
        timeout: int = 30,
        on_confirm: Callable[[ParsedCommand], bool] | None = None,
    ):
        self.client = KiwoomClient(app_key, app_secret, market=market, timeout=timeout)
        self.on_confirm = on_confirm or self._default_confirm
        self.pending_confirmation: ParsedCommand | None = None

    def handle(self, text: str) -> str:
        cmd = parse_command(text)

        if cmd.warnings:
            return "\n".join(cmd.warnings)

        if self.pending_confirmation and self._is_confirm(text):
            return self._execute_pending()

        if cmd.intent == Intent.ACCOUNT_QUERY:
            return self._handle_account_query(cmd)
        if cmd.intent == Intent.STOCK_SEARCH:
            return self._handle_stock_search(cmd)
        if cmd.intent == Intent.PLACE_ORDER:
            return self._handle_place_order(cmd)
        if cmd.intent == Intent.CHECK_ORDER:
            return self._handle_check_order(cmd)
        if cmd.intent == Intent.CANCEL_ORDER:
            return self._handle_cancel_order(cmd)
        if cmd.intent == Intent.HELP:
            return self._handle_help()

        return f"명령을 이해하지 못했습니다: {text}\n'도움말'을 입력해 주세요."

    def execute(self, text: str) -> ParsedCommand:
        cmd = parse_command(text)
        if cmd.warnings:
            return cmd
        if cmd.intent == Intent.PLACE_ORDER:
            self.pending_confirmation = cmd
            summary = format_response(cmd)
            cmd.warnings.append(f"주문 요약: {summary}")
            cmd.warnings.append("실행하려면 'yes' 또는 '확인'을 입력하세요.")
        return cmd

    def close(self):
        self.client.close()

    def _handle_account_query(self, cmd: ParsedCommand) -> str:
        try:
            accounts = self.client.domestic_account.list_accounts()
            if not accounts:
                return "등록된 국내 계좌가 없습니다."

            lines = []
            for acct in accounts:
                bal = self.client.domestic_account.get_balance(acct.account_number)
                lines.append(f"계좌 {acct.account_number}")
                lines.append(f"  예수금: {bal.deposit:,.0f}원")
                lines.append(f"  총평가: {bal.total_value:,.0f}원")
                if bal.profit_loss_ratio:
                    lines.append(f"  수익률: {bal.profit_loss_ratio:+.2f}%")

                holdings = self.client.domestic_account.list_holdings(acct.account_number)
                if holdings:
                    lines.append("  보유종목:")
                    for h in holdings:
                        lines.append(f"    {h.stock_name}({h.stock_code}): {h.quantity}주 @ {h.current_price:,.0f}원 ({h.profit_loss_ratio:+.2f}%)")
                lines.append("")
            return "\n".join(lines).strip()

        except Exception as e:
            return f"계좌 조회 실패: {e}"

    def _handle_stock_search(self, cmd: ParsedCommand) -> str:
        if not cmd.stock_code:
            return "종목코드를 입력해 주세요. 예: 005930, NVDA"
        return f"'{cmd.stock_code}' 종목 정보를 조회합니다.\n(WebSocket 또는 차트 API 연동 필요)"

    def _handle_place_order(self, cmd: ParsedCommand) -> str:
        if not cmd.stock_code or not cmd.quantity or not cmd.action:
            return "주문 정보가 부족합니다. 예: 005930 10주 매수"

        if not self._check_market_hours(cmd):
            return "현재 거래 시간이 아닙니다."

        self.pending_confirmation = cmd
        summary = format_response(cmd)
        lines = [
            f"주문 요약: {summary}",
            "",
            "정말 실행할까요? (yes / 아니오)",
        ]
        return "\n".join(lines)

    def _handle_check_order(self, cmd: ParsedCommand) -> str:
        return "주문 상태 조회 기능을 사용하려면 계좌번호가 필요합니다. '계좌번호'를 포함해 주세요."

    def _handle_cancel_order(self, cmd: ParsedCommand) -> str:
        if not cmd.stock_code:
            return "취소할 종목코드를 입력해 주세요. 예: 005930 취소"

        return f"'{cmd.stock_code}' 주문 취소 기능은 구현 중입니다."

    def _handle_help(self) -> str:
        return """지원 명령:
- "내 잔고 알려줘" - 계좌/보유종목 조회
- "005930 현재가" - 시세 조회
- "005930 10주 매수" - 주식 매수
- "005930 5주 매도" - 주식 매도
- "취소" - 진행 중인 주문 취소
- "도움말" - 이 메시지"""

    def _execute_pending(self) -> str:
        if not self.pending_confirmation:
            return "실행 대기 중인 주문이 없습니다."

        cmd = self.pending_confirmation
        self.pending_confirmation = None

        try:
            if cmd.intent == Intent.PLACE_ORDER:
                if cmd.is_us:
                    result = self.client.overseas_order.buy(
                        cmd.stock_code, cmd.quantity, cmd.price,
                        cmd.order_type, cmd.exchange,
                    ) if cmd.action == "buy" else self.client.overseas_order.sell(
                        cmd.stock_code, cmd.quantity, cmd.price,
                        cmd.order_type, cmd.exchange,
                    )
                else:
                    if cmd.action == "buy":
                        result = self.client.domestic_order.buy(
                            cmd.stock_code, cmd.quantity, cmd.price,
                            cmd.order_type, cmd.exchange,
                        )
                    else:
                        result = self.client.domestic_order.sell(
                            cmd.stock_code, cmd.quantity, cmd.price,
                            cmd.order_type, cmd.exchange,
                        )

                if result.return_code == 0:
                    return f"주문 완료!\n주문번호: {result.order_number}\n{result.return_msg}"
                return f"주문 실패 [{result.return_code}]: {result.return_msg}"

        except Exception as e:
            return f"주문 실행 중 오류: {e}"

    @staticmethod
    def _check_market_hours(cmd: ParsedCommand) -> bool:
        import datetime as _dt
        now = _dt.datetime.now()
        if now.weekday() >= 5:
            return False
        hour = now.hour
        return 8 <= hour <= 18

    @staticmethod
    def _is_confirm(text: str) -> bool:
        confirm_words = {"yes", "y", "ok", "okay", "confirm", "execute", "run",
                         "예", "네", "넵", "응", "어", "확인", "진행", "실행", "ㄱㄱ", "고고", "ㄱ"}
        return text.lower().strip() in confirm_words

    @staticmethod
    def _default_confirm(cmd: ParsedCommand) -> bool:
        return len(cmd.warnings) == 0


def execute_command(client: KiwoomClient, text: str) -> str:
    trader = KiwoomTrader.__new__(KiwoomTrader)
    trader.client = client
    trader.pending_confirmation = None
    trader.on_confirm = trader._default_confirm
    return trader.handle(text)
