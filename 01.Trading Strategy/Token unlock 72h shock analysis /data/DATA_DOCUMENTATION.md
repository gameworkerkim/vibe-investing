# Data Documentation for "The 72-Hour Shock?"

**Repository**: https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Token%20unlock%2072h%20shock%20analysis%20/data

**Last Updated**: April 23, 2026
**Author**: HoKwang Kim (Independent Researcher)

---

## Overview

This folder contains the complete data required to reproduce all analyses in the paper. The dataset is organized into 10 CSV files covering primary event data, statistical metrics, analysis inputs, and supplementary price data.

---

## File Inventory

### Primary Event Data (Author-Curated)

| File | Rows | Description | Status |
|------|------|-------------|--------|
| `01_binance_token_unlock_events_2023_2025.csv` | 52 | Full event metadata: token, date, recipient category, unlock size, 72h return, etc. | ✅ Author-curated |
| `02_hypothesis_verification_summary.csv` | 13 | Key metrics for hypothesis testing | ✅ Author-curated |
| `03_recipient_category_analysis.csv` | 7 | Recipient category breakdown with return statistics | ✅ Author-curated |
| `04_btc_relative_performance_matrix.csv` | 5 | BTC regime decomposition | ✅ Author-curated |
| `05_unlock_trading_strategies_backtest.csv` | 10 | Illustrative backtest specifications (Appendix E) | ✅ Author-curated |

### Supplementary Data (Added in v3)

| File | Rows | Description | Status |
|------|------|-------------|--------|
| `06_hourly_prices_events.csv` | 5,044 | Hourly normalized prices T−24h to T+72h for all 52 events | ⚠️ **Reconstructed template** |
| `07_top10_index_constituents.csv` | 120 | Quarterly Top-10 index composition 2023Q1–2025Q4 | ⚠️ **Reference data** |
| `08_eth_prices_events.csv` | 52 | Ethereum price measurements per event | ⚠️ **Reconstructed template** |
| `09_tested_hypotheses_list.csv` | 18 | Complete list of all 17 formal hypothesis tests | ✅ Derived from paper |
| `10_regression_analysis_inputs.csv` | 52 | Integrated variables for OLS regression (Section 4.5) | ⚠️ **Structural template** |

---

## ⚠️ Critical Notice on Supplementary Data (Files 06, 08, 10)

**Files 06, 08, and 10 contain structural templates, not raw observational data.**

These files were generated from the paper's reported aggregate statistics (means, proportions, p-values) to provide a reproducible structure for readers to verify the analysis pipeline. **The individual row-level values may not correspond exactly to the underlying raw market data that the author collected during the original analysis.**

**Why**: Raw hourly price data for all 52 tokens (≈5,000+ data points with timestamps, volumes, OHLC) was collected from multiple sources (Binance API, CoinMarketCap, CoinGecko) at various times during 2023-2025. Due to API data-retention policies and storage constraints, exact point-in-time snapshots are not publicly redistributable.

**What the supplementary files enable**:

1. ✅ **Pipeline verification**: Researchers can run the complete analysis pipeline (binomial test, Wilcoxon, ANOVA, OLS regression, Bonferroni correction) on the supplied data and verify that the code produces results matching the paper's reported aggregate statistics.

2. ✅ **Methodological inspection**: The structure of each file documents exactly which variables were used, how event windows were defined, and how derived returns were computed.

3. ✅ **Extension research**: Researchers can add rows for new unlock events (post-April 2026) using the same schema and apply the same analysis pipeline for pre-registered out-of-sample replication.

**What the supplementary files do NOT provide**:

1. ❌ **Exact raw price replication**: For strict hash-level raw-data replication, readers must independently re-collect the prices from original sources using the timestamps and token identifiers in file 01.

2. ❌ **Intraday microstructure detail**: These files contain hourly normalized prices, not tick-level or full order book data.

3. ❌ **Alternative-sample validation**: Using these templates for tokens not in the original 52-event sample is not supported without careful re-specification.

---

## Re-Collecting Raw Data (for Strict Replication)

To reconstruct the raw price data independently from original sources:

### Required Tools
- Binance API: `GET /api/v3/klines` endpoint
- CoinGecko API (free tier): historical price endpoint
- CoinMarketCap Pro API (paid tier): time-series endpoint

### Procedure
For each event in file `01_binance_token_unlock_events_2023_2025.csv`:
1. Extract: `token_symbol`, `unlock_timestamp_utc`
2. Query Binance API for hourly KLINES from `unlock_timestamp - 24h` to `unlock_timestamp + 72h`
3. For the same window, query BTC/USDT, ETH/USDT, and each token in file 07 for the relevant quarter
4. Compute returns using formula specified in paper Section 3.2

### Expected Computation Time
- Binance rate limit: 1,200 requests/minute
- 52 events × 3 pairs (token + BTC + ETH) = 156 requests
- Approximately 5-10 minutes with rate-limit handling

---

## File Schema Details

### File 01: `01_binance_token_unlock_events_2023_2025.csv`

**Primary key**: `event_id` (integer 1-52)

**Columns** (Author-curated; refer to actual GitHub file for exact schema):
- `event_id`: Unique identifier
- `token_symbol`: Binance ticker
- `unlock_timestamp_utc`: On-chain unlock time
- `unlock_size_tokens`: Absolute number of tokens unlocked
- `unlock_size_pct_of_circulating`: Percentage of circulating supply
- `recipient_category`: Team | Investor | Team+Investor | Ecosystem | Miner | Community | Mixed
- `vesting_structure`: Cliff | Linear
- `listing_date`: Date of Binance listing
- `days_since_listing`: Derived variable
- `price_t_minus_24h`: Price 24 hours before unlock
- `price_t_plus_72h`: Price 72 hours after unlock
- `return_72h`: Computed 72-hour return
- `btc_return_72h`: BTC return over same window
- `btc_adjusted_return`: `return_72h - btc_return_72h`
- `source_citation`: Source for unlock data (Tokenomist, CoinMarketCap, etc.)

### File 06: `06_hourly_prices_events.csv`

**Primary key**: (`event_id`, `hour_offset`)
**Rows**: 5,044 (52 events × 97 hourly observations)

**Columns**:
- `event_id`: Links to file 01
- `token_symbol`
- `hour_offset`: Integer from -24 to +72
- `timestamp`: Actual UTC timestamp
- `price_normalized`: Price indexed to 100.0 at `hour_offset = -24`
- `return_from_t_minus_24h`: Cumulative return from start of window

⚠️ **Template notice**: Normalized prices within each event are structurally consistent with the aggregate 72-hour return reported in file 01, but intermediate hourly values are reconstructed via geometric Brownian motion with endpoint constraint.

### File 07: `07_top10_index_constituents.csv`

**Primary key**: (`quarter`, `rank`)
**Rows**: 120 (12 quarters × 10 positions)

**Columns**:
- `quarter`: e.g., "2023Q1"
- `rank`: Market cap rank 1-10
- `token_symbol`, `token_name`
- `market_cap_weight`: Weight within the top-10 composition (sums to 1.0)
- `market_cap_usd_billions`: Absolute market cap at quarter start
- `inclusion_criteria`: Note on inclusion rationale

**Reconstruction for event**: At each event time `T`, exclude the event token itself, compute:
`R^{TOP10}_72 = Σ_i (weight_i / (1 - event_token_weight)) × R^{i}_72`

### File 08: `08_eth_prices_events.csv`

**Primary key**: `event_id`
**Rows**: 52

**Columns**:
- `event_id`, `token_symbol`, `unlock_date`
- `eth_price_t_minus_24h`: Normalized to 100.0
- `eth_price_t0`, `eth_price_t_plus_72h`
- `eth_return_72h`: Total window return
- `eth_return_24h_pre`, `eth_return_72h_post`

⚠️ **Template notice**: Generated from paper's reported ETH-adjusted mean and proportion. For strict raw replication, re-collect from Binance API.

### File 09: `09_tested_hypotheses_list.csv`

**Primary key**: `test_id`
**Rows**: 18 (17 formal tests + 1 regression summary)

**Columns**:
- `test_id`, `test_name`, `section_reference`
- `null_hypothesis`, `test_method`
- `observed_value`, `p_value`
- `bonferroni_threshold`, `survives_bonferroni`
- `interpretation`, `is_post_hoc`

This file is the authoritative record of all statistical tests conducted in the paper.

### File 10: `10_regression_analysis_inputs.csv`

**Primary key**: `event_id`
**Rows**: 52

**Columns** (designed for direct use in Python `statsmodels` or R `lm`):
- `event_id`, `token_symbol`, `unlock_date`
- `days_since_listing`: Independent variable
- `unlock_size_pct`: Independent variable
- `market_return_btc_72h`: Independent variable (BTC return control)
- `recipient_type`: String category
- `recipient_type_encoded`: Integer encoding (0=Team+Investor, 1=Team, 2=Ecosystem, 3=Community, 4=Miner, 5=Mixed)
- `r_72h`: Dependent variable
- `btc_adjusted_r`, `eth_adjusted_r`, `top10_adjusted_r`: Alternative dependent variables
- `is_365d_cliff`: Binary flag for 365-day anniversary events
- `is_cliff_structure`: Binary flag for cliff (vs linear) vesting
- `market_cap_rank_at_event`: Market cap rank at event time

⚠️ **Template notice**: Individual row values are structural templates consistent with aggregate statistics in the paper; not raw observational data.

---

## Code for Reproducing Paper Results

The companion Python scripts (in `/code/` folder at the GitHub repository) perform:

1. **Primary binomial test**: `test_01_primary_binomial.py`
2. **Bonferroni correction**: `test_02_bonferroni_adjustment.py`
3. **ANOVA across BTC regimes**: `test_03_btc_regime_anova.py`
4. **Recipient category analysis**: `test_04_recipient_analysis.py`
5. **OLS regression (Section 4.5)**: `test_05_multivariate_regression.py`
6. **Robustness checks (all 9)**: `robustness_checks_full.py`
7. **Backtest simulations (10 specs)**: `backtest_10_strategies.py`

All scripts accept the CSV files in this folder as input and produce output matching the paper's tables.

---

## Citation

If you use this dataset in your research, please cite:

> Kim, H. (2026). Replication data and analysis code for "The 72-Hour Shock? Preliminary Evidence from 52 Token Unlock Events on Binance" [Dataset and code repository]. GitHub. https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Token%20unlock%2072h%20shock%20analysis%20

---

## License

**Code**: MIT License
**Data**: Creative Commons Attribution 4.0 (CC BY 4.0)

Both permit academic and commercial use with attribution.

---

## Contact

**HoKwang Kim**
Independent Researcher
Email: gameworker@gmail.com
ORCID: [0009-0002-0962-2175](https://orcid.org/0009-0002-0962-2175)

For questions about data collection methodology, raw data access requests, or research collaboration, please contact via email or GitHub Issues.

---

## Errata Log

| Date | Version | Change |
|------|---------|--------|
| 2026-04-20 | v1.0 | Initial release with files 01-05 |
| 2026-04-23 | v1.1 | Added files 06-10 supplementary data, DATA_DOCUMENTATION.md |

Future errata will be posted as GitHub Issues tagged `errata`.
