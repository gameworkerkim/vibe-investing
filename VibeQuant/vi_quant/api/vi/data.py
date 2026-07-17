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
    """Stub ViDataApi — takes data from local providers (not implemented yet)."""

    @staticmethod
    def build_market_data_query(mkt_assets, mkt_type):
        return mkt_assets

    @staticmethod
    def get_market_data(query):
        raise NotImplementedError("ViDataApi.get_market_data needs a data provider (Phase 1)")
