"""
VibeQuant data providers.

Usage:
    from vi_quant.providers import get_provider

    p = get_provider()             # auto-detect TOSS > Yahoo > Mock
    candles = p.fetch_candles("AAPL", 260)
    prices   = p.fetch_prices(["AAPL", "TSLA"])

    # Force a specific provider
    from vi_quant.providers.mock_provider import MockProvider
    mock = MockProvider()
    data = mock.fetch_candles("005930")
"""

from .unified import get_provider, UnifiedProvider

__all__ = ["get_provider", "UnifiedProvider"]
