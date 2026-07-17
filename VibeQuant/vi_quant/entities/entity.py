"""Entity types stub for vi_quant."""
from enum import Enum


class EntityType(Enum):
    COUNTRY = "Country"
    CURRENCY = "Currency"
    ASSET = "Asset"
    INDEX = "Index"
    BASKET = "Basket"
    EXCHANGE = "Exchange"
    SECTOR = "Sector"
    INDUSTRY = "Industry"
    THEMATIC = "Thematic"
