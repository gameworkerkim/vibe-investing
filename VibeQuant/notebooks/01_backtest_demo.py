"""
VibeQuant backtest demo — local execution with mock provider (no credentials needed).

Usage:
    cd VibeQuant && python notebooks/01_backtest_demo.py
"""

from vi_quant.providers import get_provider

# Force mock for deterministic demo (change to None for auto-detect)
p = get_provider("mock")
print(f"Provider: {p.provider_name()}, available: {p.is_available()}")

tickers = ["069500", "005930", "AAPL"]

for code in tickers:
    candles = p.fetch_candles(code, 260)
    if candles:
        first, last = candles[0], candles[-1]
        ret = (last["close"] / first["close"] - 1) * 100
        print(f"{code:10s}  {len(candles):3d} bars  "
              f"start={first['time']} {int(first['close']):>8,d}  "
              f"end={last['time']} {int(last['close']):>8,d}  "
              f"return={ret:+.1f}%")

    asset = p.fetch_asset(code)
    print(f"          {asset['name']} ({asset['exchange']}) {asset['currency']}\n")
