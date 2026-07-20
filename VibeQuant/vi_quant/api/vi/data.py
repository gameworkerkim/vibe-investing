"""
Stub: ViDataApi with QueryType enum.
gs_quant.api.gs.data.GsDataApi → vi_quant.api.vi.data.ViDataApi
"""
from enum import Enum


class QueryType(Enum):
    IMPLIED_VOLATILITY = "Implied Volatility"
    PRICE = "Price"
    SPOT = "Spot"
    FORWARD = "Forward"
    RATE = "Rate"
    PNL = "Pnl"
    AUM = "Aum"
    SWAP_RATE = "Swap Rate"
    SWAPTION_VOL = "Swaption Vol"
    BASIS = "Basis"
    FORWARD_PRICE = "Forward Price"
    FX_FORECAST = "Fx Forecast"
    RATING = "Rating"
    FORECAST = "Forecast"


class ViDataApi:
    """Local stub — browser committee path uses ``vi_browser.ViDataApi`` (thin router).

    Prefer ``vi_browser.get_candles`` / ``get_prices`` in webview scripts.
    """

    @staticmethod
    def build_market_data_query(mkt_assets, mkt_type):
        return mkt_assets

    @staticmethod
    def get_market_data(query):
        raise NotImplementedError(
            "ViDataApi.get_market_data is not wired for local CPython yet. "
            "In the browser: from vi_browser import ViDataApi, get_candles. "
            "See docs/API_COMPAT_MATRIX.md Phase 2."
        )