from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from kiwoom_sdk.models import Market

Mode = Literal["real", "demo"]

DEFAULT_BASE_URLS: dict[Mode, str] = {
    "real": "https://api.kiwoom.com",
    "demo": "https://mockapi.kiwoom.com",
}

DEFAULT_WS_URLS: dict[Mode, str] = {
    "real": "wss://api.kiwoom.com:10000",
    "demo": "wss://mockapi.kiwoom.com:10000",
}

TOKEN_PATH = "/oauth2/token"
REVOKE_PATH = "/oauth2/revoke"

CACHE_DIR = ".kiwoom_cache"


@dataclass
class Config:
    app_key: str
    app_secret: str
    market: Market = Market.REAL
    timeout: int = 30
    max_retries: int = 1

    @property
    def mode(self) -> Mode:
        return "real" if self.market == Market.REAL else "demo"

    @property
    def base_url(self) -> str:
        return DEFAULT_BASE_URLS[self.mode]

    @property
    def ws_url(self) -> str:
        return DEFAULT_WS_URLS[self.mode]
