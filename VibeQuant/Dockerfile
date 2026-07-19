# VibeQuant Docker — local backtesting environment
#
# Build & run:
#   docker compose build          # build the image
#   docker compose run vibequant  # interactive Python session
#
# Or with auto-detect:
#   docker compose up -d          # start the provider + notebook server
#
# Provider selection:
#   - With credentials (.env file present): TOSS > Yahoo > Mock
#   - Without credentials: Yahoo > Mock (yfinance is always available)
#   - Force mock: VI_QUANT_PROVIDER=mock

FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./

RUN pip install --no-cache-dir -e ".[data,dev]" && \
    pip install --no-cache-dir jupyter pandas matplotlib

COPY . .

ENV PYTHONPATH=/app
ENV VI_QUANT_PROVIDER=mock

VOLUME ["/app/data", "/app/notebooks"]

CMD ["python3", "-c", "\
from vi_quant.providers import get_provider;\
p = get_provider();\
print(f'VibeQuant ready. Provider: {p.provider_name()}, available: {p.is_available()}');\
print('Try: p.fetch_candles(\\'069500\\', 260)')\
"]
