"""
Minimal common types for vi_quant.
Full gs_quant.common has ~7200 lines of generated enums; this ships
only the enums needed by timeseries and datetime modules.
"""
from enum import Enum


class Currency(Enum):
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    JPY = "JPY"
    CHF = "CHF"
    AUD = "AUD"
    CAD = "CAD"
    NZD = "NZD"
    SEK = "SEK"
    NOK = "NOK"
    DKK = "DKK"
    HKD = "HKD"
    SGD = "SGD"
    KRW = "KRW"
    CNY = "CNY"
    INR = "INR"
    MXN = "MXN"
    BRL = "BRL"
    ZAR = "ZAR"
    TRY = "TRY"


class PricingLocation(Enum):
    NYC = "NYC"
    LDN = "LDN"
    TKO = "TKO"
    HKG = "HKG"


class PositionType(Enum):
    OPEN = "open"
    CLOSE = "close"
    ANY = "any"


class IntradayDelay(Enum):
    ON = "on"
    OFF = "off"
