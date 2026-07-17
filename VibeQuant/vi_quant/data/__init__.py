"""
Data module for vi_quant.
DataContext is vendored from gs-quant data/core.py.
Dataset has a minimal stub for calendar/holiday operations pending Phase 1.
"""
from .core import DataContext


class Dataset:
    """Minimal Dataset stub for vi_quant.
    GS-quant's Dataset wraps Marquee dataset catalog.
    VibeQuant Phase 1 will add yfinance/FRED/local providers.
    """

    class GS:
        HOLIDAY = "HOLIDAY"
        HOLIDAY_CURRENCY = "HOLIDAY_CURRENCY"

    def __init__(self, name, *args, **kwargs):
        self.name = name

    def get_data(self, *args, **kwargs):
        raise NotImplementedError(
            f"Dataset.get_data('{self.name}') — data providers coming in Phase 1"
        )

    def __repr__(self):
        return f"Dataset({self.name})"
