# Raw Data Sources and Provenance

**Paper**: *The 72-Hour Shock? Preliminary Evidence from 52 Token Unlock Events on Binance*
**Author**: HoKwang Kim (Independent Researcher)
**Last Updated**: April 23, 2026

This document provides the complete provenance trail for all raw data used in the paper. It is intended to enable independent verification and replication by other researchers.

---

## 1. Token Unlock Event Identification

### 1.1. Primary Source: Tokenomist

- **URL**: https://tokenomist.ai
- **Data Retrieved**: Event dates, unlock sizes, recipient allocations for all Binance-listed tokens 2023-2025
- **Retrieval Method**: Manual curation via web interface + public API (where available)
- **Retrieval Period**: Multiple sessions between October 2024 and March 2026
- **Citation**: Tokenomist (2026). *Token unlock schedules database*. Retrieved from https://tokenomist.ai

### 1.2. Secondary Sources for Cross-Verification

Each event was verified through at least **two** independent sources before inclusion:

| Source | URL | Data Verified |
|--------|-----|---------------|
| CoinMarketCap Unlocks | https://coinmarketcap.com/unlocks | Date, size, circulating supply |
| DefiLlama Unlocks | https://defillama.com/unlocks | Date, size, recipient category |
| DropsTab | https://dropstab.com | Recipient wallet visualization |
| Binance Unlocks Page | https://www.binance.com/en/markets/token_unlock | Binance-specific metadata |
| Project official docs | Varies by project | Contract addresses, vesting schedules |

### 1.3. Event Inclusion Criteria (detailed)

Events were included if they satisfied ALL of the following:

1. **Listing criterion**: Token listed on Binance (spot OR perpetual futures) for at least 14 days before the unlock event.

2. **Size criterion**: Unlock released ≥ 1.0% of circulating supply at T−1. Circulating supply measured at the block immediately preceding the unlock timestamp.

3. **Data provenance**: Unlock details independently confirmed by at least 2 of the sources in section 1.2.

4. **Price data availability**: Continuous 1-hour resolution price data available from T−7 days to T+14 days, with no gaps exceeding 3 consecutive hours.

5. **No overlapping events**: If multiple unlocks for the same token occurred within a 14-day window, only the largest was included to avoid contamination.

Events were EXCLUDED if:

- Token was delisted from Binance during the event window
- Trading was suspended for more than 24 hours during the window
- Flash crashes (>50% move within 1 hour) were detected and attributable to non-unlock causes
- Unlock schedule was amended within 30 days of the event

---

## 2. Price Data

### 2.1. Binance Klines (Candlestick) Data

- **Source**: Binance Public API
- **Endpoint**: `GET /api/v3/klines`
- **Resolution**: 1-hour (3600 second intervals)
- **Asset Pairs**: TOKEN/USDT (primary), TOKEN/BUSD where USDT unavailable, TOKEN/BTC as cross-check
- **Time Range per event**: T−168h (T−7d) to T+336h (T+14d)
- **Fields Retrieved**: Open, High, Low, Close, Volume, Quote asset volume, Number of trades
- **Rate Limit**: 1,200 requests/minute (free tier)
- **Retrieval Period**: Data collected in batches during November 2024 – March 2026

### 2.2. Data Collection Code

Reference implementation (not included in this release, but equivalent code is trivial to reproduce):

```python
import requests
from datetime import datetime, timezone

def fetch_klines(symbol, start_ms, end_ms, interval='1h'):
    """Fetch Binance 1-hour klines for a given symbol and time range."""
    url = "https://api.binance.com/api/v3/klines"
    params = {
        "symbol": symbol,
        "interval": interval,
        "startTime": start_ms,
        "endTime": end_ms,
        "limit": 1000
    }
    response = requests.get(url, params=params, timeout=30)
    response.raise_for_status()
    return response.json()
```

### 2.3. Price Quality Checks

All price series passed the following quality checks:

1. **No nulls**: No missing hourly closes within the event window
2. **No implausible moves**: No single-hour absolute log return > 0.5 (i.e., no 65%+ hourly moves) that could indicate data corruption
3. **Volume check**: Non-zero trading volume in ≥ 95% of hourly bars within the event window
4. **Cross-source verification**: Spot-checked 20% of prices against CoinGecko (https://api.coingecko.com) and found <0.1% discrepancies, all attributable to cross-exchange price differences

### 2.4. Reference Assets

- **Bitcoin benchmark**: BTC/USDT klines from same source
- **Ethereum benchmark**: ETH/USDT klines from same source
- **Top-10 index constituents**: Market cap rankings from CoinMarketCap Historical Snapshots (quarterly)
  - URL: https://coinmarketcap.com/historical/
  - Snapshot dates: First Sunday of each quarter 2023Q1 – 2025Q4

---

## 3. Unlock Recipient Categorization

Recipients were categorized into 6 groups based on project documentation:

| Category | Definition | Typical Sources |
|----------|-----------|-----------------|
| Team | Founders, core employees, internal stakeholders | Whitepaper, GitHub contributors |
| Investor | Pre-seed, seed, Series A/B VCs, strategic investors | Public funding announcements |
| Team + Investor | Combined unlock covering both Team and Investor | Most common pattern |
| Ecosystem | Grants, partnerships, developer incentives, DAO treasuries | Project governance docs |
| Community | Airdrops, rewards, liquidity mining, staking rewards | Tokenomics docs |
| Miner | Proof-of-work mining rewards (rare in modern tokens) | Consensus mechanism docs |
| Mixed | Multiple recipient categories in single unlock | Combined from above |

Categorization was performed by the author through manual review of:
1. Official project tokenomics documentation
2. On-chain analysis of recipient wallet addresses (when publicly identified)
3. Public announcements from projects or foundations
4. Independent verification via at least one secondary source (Messari, Galaxy Research, etc.)

In cases of ambiguity, the most conservative categorization was chosen (i.e., unclear → Mixed).

---

## 4. Timestamping Conventions

### 4.1. Event Timestamp (T)

- **Definition**: The on-chain block timestamp at which the unlock transaction was included
- **Timezone**: UTC (consistent throughout)
- **Precision**: Hour-level (block timestamps rounded to nearest hour for analysis)
- **Source**: Smart contract event logs verified via Etherscan/relevant block explorer

### 4.2. Listing Date

- **Definition**: Date of first spot trading on Binance
- **Source**: Binance official announcements + Binance Research trading history
- **Precision**: UTC date (day-level)

### 4.3. Days Since Listing

- **Computation**: `(T_unlock_date - listing_date).days`
- **Validation**: Cross-checked against Binance Research "Token Profile" pages

---

## 5. Known Data Limitations

### 5.1. Reconstructed Price Templates

The files `06_hourly_prices_events.csv`, `08_eth_prices_events.csv`, and `10_regression_analysis_inputs.csv` in this release contain **structural templates** reconstructed from aggregate statistics in the paper. Individual row-level values are consistent with paper-reported means and proportions but do not represent the exact original raw observations.

**Why**: Binance API rate limits and data retention policies prevent indefinite storage of tick-level data. The author retained summary statistics and event-level summaries but did not preserve the complete 5,000+ hourly price points in an immutable format.

**Impact**: Researchers seeking strict hash-level replication of raw prices must independently re-collect from Binance API using the event timestamps in `01_binance_token_unlock_events_2023_2025.csv`. The re-collection procedure is documented in Section 2 above.

**Author's commitment**: For future papers, the author commits to preserving raw price snapshots in an immutable format (e.g., git-tracked CSV or IPFS-pinned dataset) at time of analysis, avoiding this limitation.

### 5.2. Recipient Categorization Subjectivity

Recipient categorization involved judgment calls for mixed-purpose allocations. The author's categorizations may differ from alternative categorizations by other researchers. This is a potential source of measurement disagreement that is not quantifiable from the data alone.

### 5.3. Survivorship Bias

Events were identified via tokens currently or previously listed on Binance. This excludes:
- Tokens that never achieved Binance listing despite having unlock schedules
- Tokens delisted before their major unlock events

This introduces a potential bias toward more "successful" projects with larger pre-unlock attention.

---

## 6. Data Retention and Access

### 6.1. Public Release

The following is released publicly under CC BY 4.0:

- All files in `/data/` folder of the GitHub repository
- All code in `/code/` folder of the GitHub repository
- This DATA_SOURCES.md document
- The paper itself (pre-print version)

### 6.2. Access Requests

Researchers seeking access to additional materials (e.g., raw manual curation notes, intermediate analysis files) may contact the author directly. Reasonable requests will be accommodated subject to the author's availability.

Contact:
- Email: gameworker@gmail.com
- GitHub Issues: https://github.com/gameworkerkim/vibe-investing/issues

---

## 7. Citation and License

When using this data in your research, please cite:

> Kim, H. (2026). Replication data and analysis code for "The 72-Hour Shock? Preliminary Evidence from 52 Token Unlock Events on Binance" [Dataset and code]. GitHub. https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Token%20unlock%2072h%20shock%20analysis%20

License:
- **Code**: MIT License
- **Data and documentation**: Creative Commons Attribution 4.0 (CC BY 4.0)

---

## Changelog

| Date | Change |
|------|--------|
| 2026-04-20 | Initial data release (files 01-05) |
| 2026-04-23 | Added supplementary files 06-10, this DATA_SOURCES.md |
