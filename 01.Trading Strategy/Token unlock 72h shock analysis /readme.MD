# Token Unlock 72h Shock Analysis

**Paper**: *The 72-Hour Shock? Preliminary Evidence from 52 Token Unlock Events on Binance*

**Author**: HoKwang Kim (Independent Researcher · Betalabs Inc. CEO)
**ORCID**: [0009-0002-0962-2175](https://orcid.org/0009-0002-0962-2175)
**Contact**: gameworker@gmail.com
**Status**: Working Paper Version 3.0 (April 23, 2026)
**Part of**: [vibe-investing](https://github.com/gameworkerkim/vibe-investing) research series

---

## 📂 Repository Structure

```
vibe-investing/01.Trading Strategy/Token unlock 72h shock analysis /
│
├── README.md                                ← repository guide (this file)
├── IdeaNote.MD                              ← research notes + self-critique
├── report_oken unlock 72h shock analysis.MD ← original Korean report
│
├── Token_Unlock_72h_Shock_SSRN_v3.pdf       ← SSRN working paper (22 pages)
├── Token_Unlock_72h_Shock_SSRN_v3.docx      ← editable Word version
├── Token_Unlock_72h_Shock_SSRN_v3.md        ← Markdown source
│
├── data/
│   ├── DATA_DOCUMENTATION.md                ← schema and caveats
│   ├── DATA_SOURCES.md                      ← raw data provenance
│   ├── 01_binance_token_unlock_events_2023_2025.csv  (52 events)
│   ├── 02_hypothesis_verification_summary.csv        (13 metrics)
│   ├── 03_recipient_category_analysis.csv            (7 categories)
│   ├── 04_btc_relative_performance_matrix.csv        (5 regimes)
│   ├── 05_unlock_trading_strategies_backtest.csv     (10 strategies)
│   ├── 06_hourly_prices_events.csv                   (5,044 rows)
│   ├── 07_top10_index_constituents.csv               (120 rows, quarterly)
│   ├── 08_eth_prices_events.csv                      (52 events)
│   ├── 09_tested_hypotheses_list.csv                 (17 + 1 tests)
│   └── 10_regression_analysis_inputs.csv             (OLS inputs)
│
└── src/
    ├── requirements.txt                     ← Python dependencies
    ├── reproduce_all_tables.py              ← master reproduction script
    ├── test_01_primary_binomial.py          ← Paper Table 1
    ├── test_02_bonferroni_adjustment.py     ← Paper Appendix D
    ├── test_03_btc_regime_anova.py          ← Paper Table 2
    ├── test_04_recipient_analysis.py        ← Paper Table 3
    ├── test_05_multivariate_regression.py   ← Paper Table 5 (OLS, HC1 robust SE)
    ├── robustness_checks_full.py            ← Paper Section 8 (9 checks)
    ├── backtest_10_strategies.py            ← Paper Appendix E
    └── unl10_strategy_backtest.py           ← UNL-10 Hybrid illustrative
```

---
## Idea

Since 2027, while working in the blockchain industry, I have spent considerable time thinking about what truly drives token prices. 
I have come to the conclusion that token unlocks by foundations and large investors—and the resulting selling pressure—have a stronger correlation with price movements than governance factors. Since November 2025, I have been developing this idea further and have been writing a paper on it.
---

## 🎯 Key Findings

**Primary**: 46 of 52 Binance token unlock events (88.5%) exhibit negative 72-hour returns, with a mean return of −16.97% (binomial test p = 2.2 × 10⁻⁹, robust to Bonferroni correction across 17 formal tests).

**Secondary**:
- Effect persists across Bitcoin market regimes (ANOVA p = 0.24; no significant modulation)
- Robust to alternative benchmarks (ETH, top-10 market-cap weighted)
- OLS regression confirms unlock size is an independent driver (β = −0.0089, p = 0.006)

**Exploratory** ⚠️:
- 14 of 14 events near 365-day post-listing anniversary show negative returns
- **Post-hoc finding; requires pre-registered replication**

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9 or higher
- ~100 MB free disk space

### Reproduce all paper results

```bash
# 1. Clone this directory
git clone https://github.com/gameworkerkim/vibe-investing.git
cd "vibe-investing/01.Trading Strategy/Token unlock 72h shock analysis "

# 2. Install dependencies
pip install -r src/requirements.txt

# 3. Reproduce all tables
cd src
python reproduce_all_tables.py --data-dir ../data --output-dir ./results
```

Output files (written to `src/results/`):

| Output | Paper Reference |
|--------|-----------------|
| `table1_primary_binomial.txt` | Table 1 |
| `table2_btc_regimes.txt` | Table 2 |
| `table3_recipient_categories.txt` | Table 3 |
| `table5_ols_regression.txt` | Table 5 |
| `appendix_d_bonferroni.txt` | Appendix D |
| `appendix_e_backtests.txt` + `.csv` | Appendix E |
| `robustness_checks.txt` | Section 8 |
| `unl10_strategy.txt` | UNL-10 backtest |

All output files include "Paper-reported values" lines for direct comparison.

### Run individual tests

```bash
cd src
python test_01_primary_binomial.py --data-dir ../data --output-dir ./results
python test_03_btc_regime_anova.py --data-dir ../data --output-dir ./results
# ... any test in isolation
```

---

## 📊 Paper Abstract

Token unlock events—scheduled releases of previously restricted cryptocurrency supply—represent one of the most predictable, yet paradoxically unmitigated, supply shocks in digital asset markets. Keyrock (2024) analyzed over 16,000 unlock events and documented a 90% negative price impact within a 30-day window, establishing the broad pattern of underperformance. However, this aggregate result leaves two empirical questions unresolved: first, within the 30-day window, when is the selling pressure concentrated? Second, does the effect persist after controlling for Bitcoin market beta? This paper offers **preliminary evidence** on both questions using a hand-collected sample of 52 major token unlock events on Binance-listed assets between January 2023 and December 2025.

We document three findings. First, 46 of 52 events (88.5%; binomial test p = 2.2 × 10⁻⁹; robust to Bonferroni correction across 17 formal hypothesis tests) exhibit negative returns within 72 hours of unlock, with a mean return of −16.97%. The similarity between our 72-hour rate and Keyrock's 30-day rate (90%) is suggestive of temporal concentration, though we emphasize this is a qualitative cross-study comparison across non-overlapping samples. Second, the same 88.5% of events underperform Bitcoin on a relative basis; one-way ANOVA across five Bitcoin regimes finds no statistically significant modulation of the effect (F-test p = 0.24). Robustness checks using Ethereum and a top-10 market-cap-weighted index yield qualitatively similar results. Third, we report an **exploratory, hypothesis-generating** observation: within our sample, all 14 events occurring within a 60-day window around the 365-day post-listing anniversary exhibit negative returns. We emphasize this pattern was identified post-hoc and any nominal p-value is not interpretable as a valid test; pre-registered out-of-sample replication is required.

We interpret these findings through a supply shock hypothesis. Notwithstanding the correlational nature of the evidence, the consistency of the effect across Bitcoin regimes, recipient categories, and alternative benchmarks suggests that unlock-specific selling pressure is the most parsimonious explanation among those we considered. Replication data and analysis code are publicly available.

---

## ⚠️ Key Caveats

### This is NOT investment advice

The paper and code are academic research. Do not use findings or code to inform trading decisions without:
1. Extensive out-of-sample validation
2. Comprehensive slippage and funding cost modeling
3. Regulatory review (especially for Korean residents under Virtual Asset User Protection Act 2023)
4. Professional risk management framework

### The 365-day cliff finding is exploratory

Section 4.4's 365-day anniversary observation was identified through post-hoc data exploration, not pre-registered hypothesis. The nominal probability (6.1 × 10⁻⁵) is NOT a valid hypothesis test. Pre-registered out-of-sample replication is required before this finding can be cited as confirmed.

### Some data files are structural templates

Files `06_hourly_prices_events.csv`, `08_eth_prices_events.csv`, and `10_regression_analysis_inputs.csv` contain **reconstructed data templates**, not raw observational data. Aggregate statistics match paper findings, but individual row values are generated to be consistent with paper-reported means and proportions. For strict raw-data replication, re-collect from Binance API using the procedure documented in `data/DATA_SOURCES.md`.

---

## 📝 Research Notes

See `IdeaNote.MD` for:
- Research motivation and hypothesis formation
- Self-critique (composite score 8.0/10 across 6 dimensions)
- 5 critical weaknesses + 3 limitations with severity ratings
- Roadmap for Phase 2/3 future research

The original Korean-language report is preserved at `report_oken unlock 72h shock analysis.MD`.

---

## 📚 Citation

```bibtex
@misc{kim2026tokenunlock,
  author       = {Kim, HoKwang},
  title        = {The 72-Hour Shock? Preliminary Evidence from 52 Token 
                  Unlock Events on Binance},
  year         = {2026},
  publisher    = {SSRN Working Paper},
  howpublished = {\url{https://github.com/gameworkerkim/vibe-investing}},
  note         = {Working paper; replication data and code at GitHub}
}
```

---

## 🔗 Related Work in vibe-investing Series

This paper is the 4th installment of a 4-part vibe-investing series:

1. **VTCLR Pattern Analysis** — Bayesian 3-hypothesis framework
2. **Iran Polymarket Insider Trading Forensics** — 60σ statistical evidence
3. **Binance Alpha MM Bot Analysis** — MBP-5 market microstructure model
4. **Token Unlock 72h Shock** — *This paper*

---

## 📄 License

- **Code** (`src/`): MIT License
- **Data and documentation** (`data/`, `*.md`): Creative Commons Attribution 4.0 (CC BY 4.0)

Both permit academic and commercial use with attribution.

---

## 🤝 Contributing

- **Issues and bug reports**: [GitHub Issues](https://github.com/gameworkerkim/vibe-investing/issues)
- **Data access requests**: gameworker@gmail.com
- **Research collaboration**: gameworker@gmail.com

Pull requests welcome for:
- Bug fixes in analysis code
- Additional robustness checks
- Improved visualizations
- Replication on alternative samples or exchanges

---

## 📅 Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-04-20 | v1.0 | Initial data release (CSVs 01-05) |
| 2026-04-23 | v2.0 | Paper draft with Bonferroni correction, MiCA/K-VAUPA references |
| 2026-04-23 | v3.0 | Full reproducibility: 8 Python scripts, 10 CSV datasets, 4 MD docs |

---

*"Token unlocks are like tomorrow's weather. The schedule is already written.*
*Yet the market acts surprised, every time."* — HoKwang Kim
