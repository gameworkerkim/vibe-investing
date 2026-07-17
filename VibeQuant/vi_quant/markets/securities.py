"""Security types stub for vi_quant."""
from enum import Enum


class ExchangeCode(Enum):
    NYSE = "NYSE"
    NASDAQ = "NASDAQ"
    ASE = "ASE"
    LSE = "LSE"
    TSE = "TSE"
    HKG = "HKG"
    KRX = "KRX"
    SGX = "SGX"
    ASX = "ASX"


class Asset:
    """Minimal Asset stub — used only as a type hint in timeseries."""
    def __init__(self, id_, *args, **kwargs):
        self.id = id_

    @staticmethod
    def get(id_, *args, **kwargs):
        return Asset(id_)

    def __repr__(self):
        return f"Asset({self.id})"
