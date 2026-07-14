#!/usr/bin/env python3
"""
Resolve a free-text stock query (ticker or company name, English or Korean)
into concrete ticker candidates using the Ackman Quant Engine's resolver
(engine/ticker_resolver.py) — Korean names go through DART's listed-company
lookup, everything else through Yahoo Finance search.

Usage:
    python resolve_ticker.py <quant_engine_project_root> <query>

Prints a JSON array of {"ticker", "name", "market"} to stdout. Empty array
means nothing matched.
"""
import json
import sys
from pathlib import Path


def main():
    if len(sys.argv) != 3:
        print(json.dumps({"error": "usage: resolve_ticker.py <quant_engine_root> <query>"}))
        sys.exit(1)

    project_root = Path(sys.argv[1]).resolve()
    query = sys.argv[2]

    sys.path.insert(0, str(project_root))
    from dotenv import load_dotenv
    load_dotenv(project_root / ".env")

    from engine import ticker_resolver

    candidates = ticker_resolver.resolve(query)
    print(json.dumps(candidates, ensure_ascii=False))


if __name__ == "__main__":
    main()
