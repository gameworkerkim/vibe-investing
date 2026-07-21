from __future__ import annotations

from enum import Enum


class Market(str, Enum):
    REAL = "real"
    DEMO = "demo"


class Exchange(str, Enum):
    KRX = "KRX"
    NXT = "NXT"
    SOR = "SOR"
    NASDAQ = "ND"
    NYSE = "NY"
    AMEX = "AM"


class OrderType(str, Enum):
    NORMAL = "0"
    MARKET = "3"
    CONDITIONAL_LIMIT = "5"
    AFTER_HOURS = "81"
    BEFORE_HOURS = "61"
    AFTER_HOURS_SINGLE = "62"
    BEST_QUOTE = "6"
    TOP_PRIORITY = "7"
    NORMAL_IOC = "10"
    MARKET_IOC = "13"
    BEST_QUOTE_IOC = "16"
    NORMAL_FOK = "20"
    MARKET_FOK = "23"
    BEST_QUOTE_FOK = "26"
    STOP_LIMIT = "28"
    MID_PRICE = "29"
    MID_PRICE_IOC = "30"
    MID_PRICE_FOK = "31"


class TradeType(str, Enum):
    BUY = "1"
    SELL = "2"
    BUY_COVER = "3"
    SELL_SHORT = "4"


class Side(str, Enum):
    BUY = "buy"
    SELL = "sell"


class OrderStatus(str, Enum):
    PENDING = "pending"
    FILLED = "filled"
    PARTIAL = "partial"
    CANCELLED = "cancelled"
    REJECTED = "rejected"
