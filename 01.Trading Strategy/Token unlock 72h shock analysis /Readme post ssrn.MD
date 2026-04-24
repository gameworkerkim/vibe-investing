# Token Unlock 72h Shock Analysis

[![SSRN](https://img.shields.io/badge/SSRN-6632838-blue?style=flat-square&logo=readthedocs)](https://ssrn.com/abstract=6632838)
[![ORCID](https://img.shields.io/badge/ORCID-0009--0002--0962--2175-A6CE39?style=flat-square&logo=orcid)](https://orcid.org/0009-0002-0962-2175)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Data](https://img.shields.io/badge/Data-CC--BY--4.0-blue?style=flat-square)](#-license)
[![Status](https://img.shields.io/badge/Status-SSRN%20Published-brightgreen?style=flat-square)]()

**Paper**: *The 72-Hour Shock? Preliminary Evidence from 52 Token Unlock Events on Binance*

**Author**: HoKwang Kim — Independent Researcher · Betalabs Inc. CEO  
**Published**: April 25, 2026 · SSRN Working Paper No. 6632838  
**Part of**: [vibe-investing](https://github.com/gameworkerkim/vibe-investing) research series

---

## 📄 Official Publication

> **📄 SSRN Working Paper**: https://ssrn.com/abstract=6632838  
> **📅 Published**: April 25, 2026  
> **🔖 Abstract ID**: 6632838  
> **👤 Author**: HoKwang Kim ([ORCID: 0009-0002-0962-2175](https://orcid.org/0009-0002-0962-2175))  
> **📧 Contact**: gameworker@gmail.com

### 📖 How to Cite

**APA**:
```
Kim, HoKwang. (2026). The 72-Hour Shock? Preliminary Evidence from 52 Token 
Unlock Events on Binance. SSRN Working Paper No. 6632838. 
https://ssrn.com/abstract=6632838
```

**BibTeX**:
```bibtex
@article{kim2026token72h,
  author       = {Kim, HoKwang},
  title        = {The {72-Hour} {Shock}? {Preliminary} {Evidence} from 
                  52 {Token} {Unlock} {Events} on {Binance}},
  journal      = {SSRN Working Paper},
  number       = {6632838},
  year         = {2026},
  month        = {April},
  url          = {https://ssrn.com/abstract=6632838},
  note         = {Replication data and code: \url{https://github.com/gameworkerkim/vibe-investing}}
}
```

**Chicago**:
```
Kim, HoKwang. 2026. "The 72-Hour Shock? Preliminary Evidence from 52 
Token Unlock Events on Binance." SSRN Working Paper No. 6632838. 
https://ssrn.com/abstract=6632838.
```

---

## 📂 Repository Structure

```
Token unlock 72h shock analysis /
│
├── README.md                                ← this file
├── IdeaNote.MD                              ← research notes + self-critique (8.0/10)
├── ANTICIPATED_QA.md                        ← 20 Q&As for peer reviewers
├── SSRN_SUBMISSION_PACKAGE.md               ← submission + promotion materials
├── report_oken unlock 72h shock analysis.MD ← original Korean report
│
├── Token_Unlock_72h_Shock_SSRN_v3_1_EN.{pdf,docx,md}   ← Published paper (EN, 22 pages)
├── Token_Unlock_72h_Shock_SSRN_v3_1_KR.{pdf,docx,md}   ← Korean version (20 pages)
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

## 🎯 Key Findings

**Primary Finding**: 46 of 52 Binance token unlock events (88.5%) exhibit negative 72-hour returns.
- Mean return: **−16.97%**
- Binomial test: **p = 2.2 × 10⁻⁹**
- **Robust to Bonferroni correction** across 17 formal hypothesis tests

**Secondary Findings**:
- Effect persists across Bitcoin market regimes (ANOVA p = 0.24; no significant modulation)
- Robust to alternative benchmarks (ETH, top-10 market-cap weighted index)
- OLS regression confirms unlock size is an independent driver (β = −0.0089, p = 0.006)

**Exploratory Finding** ⚠️:
- All 14 events within 60 days of the 365-day post-listing anniversary show negative returns
- **Post-hoc discovery — requires pre-registered replication before citation**

---

## 🚀 Quick Start (Reproduce All Results)

### Prerequisites
- Python 3.9 or higher
- ~100 MB free disk space

### One-Command Reproduction

```bash
# Clone this directory
git clone https://github.com/gameworkerkim/vibe-investing.git
cd "vibe-investing/01.Trading Strategy/Token unlock 72h shock analysis "

# Install and reproduce
pip install -r src/requirements.txt
cd src
python reproduce_all_tables.py --data-dir ../data --output-dir ./results
```

**Expected output**: `Succeeded: 8, Failed: 0, Skipped: 0`

All 8 Python scripts regenerate every table and statistical result reported in the paper.

### Output Files

| Output | Paper Reference |
|--------|-----------------|
| `table1_primary_binomial.txt` | Table 1 |
| `table2_btc_regimes.txt` | Table 2 |
| `table3_recipient_categories.txt` | Table 3 |
| `table5_ols_regression.txt` | Table 5 |
| `appendix_d_bonferroni.txt` | Appendix D |
| `appendix_e_backtests.txt` | Appendix E |
| `robustness_checks.txt` | Section 8 |
| `unl10_strategy.txt` | UNL-10 backtest |

All output files include "Paper-reported values" lines for direct comparison.

---

## 📊 Paper Abstract

Token unlock events—scheduled releases of previously restricted cryptocurrency supply—represent one of the most predictable, yet paradoxically unmitigated, supply shocks in digital asset markets. Keyrock (2024) analyzed over 16,000 unlock events and documented a 90% negative price impact within a 30-day window, establishing the broad pattern of underperformance. However, this aggregate result leaves two empirical questions unresolved: first, within the 30-day window, when is the selling pressure concentrated? Second, does the effect persist after controlling for Bitcoin market beta?

This paper offers **preliminary evidence** on both questions using a hand-collected sample of 52 major token unlock events on Binance-listed assets between January 2023 and December 2025.

We document three findings. **First**, 46 of 52 events (88.5%; binomial test p = 2.2 × 10⁻⁹; robust to Bonferroni correction across 17 formal hypothesis tests) exhibit negative returns within 72 hours of unlock, with a mean return of −16.97%. **Second**, the same 88.5% of events underperform Bitcoin on a relative basis; one-way ANOVA across five Bitcoin regimes finds no statistically significant modulation of the effect (F-test p = 0.24). **Third**, we report an exploratory, hypothesis-generating observation: within our sample, all 14 events occurring within a 60-day window around the 365-day post-listing anniversary exhibit negative returns. We emphasize this pattern was identified post-hoc and any nominal p-value is not interpretable as a valid test; pre-registered out-of-sample replication is required.

Replication data and analysis code are publicly available at this repository.

**📄 Full paper**: https://ssrn.com/abstract=6632838

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

## 🗺️ Research Program Roadmap

This paper is **Phase 1** of the **vibe-investing** research program:

| Phase | Topic | Status | Target |
|-------|-------|--------|--------|
| **1** | 72-Hour Shock Analysis (N=52) | ✅ **Published** | SSRN 6632838 |
| 2 | Robustness Extension (N≥200) + 365-day cliff pre-registration | 📅 Planned | Q4 2026 |
| 3 | [Disclosure Timing Analysis](../Disclosure%20Timing%20Around%20Token%20Unlocks/) | 📋 Design complete | Q1-Q2 2027 |
| 4 | [ChainWar: Chain-level Comparison](../ChainWar/) | 📋 Ideation | Q3-Q4 2027 |

⭐ **Star** this repo to show support  
🔔 **Watch** this repo to receive:
- Phase 2 paper announcement (N≥200)
- Pre-registered 365-day cliff replication results
- LLM-based disclosure risk detection tool (Phase 3)

---

## 📝 Research Notes and Self-Critique

See [`IdeaNote.MD`](IdeaNote.MD) for:
- Research motivation and hypothesis formation
- Self-critique (composite score 8.0/10 across 6 dimensions)
- 5 critical weaknesses + 3 limitations with severity ratings
- Roadmap for Phase 2/3/4 future research

The original Korean-language report is preserved at `report_oken unlock 72h shock analysis.MD`.

For anticipated peer review and social media questions with prepared responses, see [`ANTICIPATED_QA.md`](ANTICIPATED_QA.md).

---

## 🤝 Contributing

**Pull requests welcome for**:
- Bug fixes in analysis code
- Additional robustness checks
- Improved visualizations
- Replication on alternative samples or exchanges

**Especially seeking**:
- Researchers with access to larger unlock datasets (for Phase 2 collaboration)
- Econometricians for panel regression specification review (Phase 3)
- NLP researchers for LLM fine-tuning (Phase 3 disclosure detection tool)
- Data engineers for on-chain flow pipelines (Phase 3)

### Contact

- **Issues and bug reports**: [GitHub Issues](https://github.com/gameworkerkim/vibe-investing/issues)
- **Academic collaboration**: gameworker@gmail.com
- **Data access requests**: gameworker@gmail.com

---

## 📄 License

- **Code** (`src/`): MIT License
- **Data and documentation** (`data/`, `*.md`): Creative Commons Attribution 4.0 (CC BY 4.0)

Both permit academic and commercial use with attribution.

---

## 📅 Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-04-20 | v1.0 | Initial data release (CSVs 01-05) |
| 2026-04-23 | v2.0 | Paper draft with Bonferroni correction |
| 2026-04-23 | v3.0 | Full reproducibility infrastructure |
| 2026-04-23 | v3.1 | Final pre-submission version (author-reviewed) |
| **2026-04-23** | **v3.1** | **SSRN submission (Abstract ID 6632838 assigned)** |
| **2026-04-25** | **v3.1** | ✅ **SSRN Published — publicly available** |

---

## 🙏 Acknowledgments

This research builds directly on Keyrock (2024)'s pioneering 16,000-event study. The author is grateful for Keyrock's public dissemination of their aggregate findings, which provided both the motivation and the baseline for this work.

The public availability of unlock schedule data via Tokenomist, CoinMarketCap, DefiLlama, and DropsTab made this research possible without proprietary data access.

No AI models are listed as coauthors. AI-assisted drafting tools were used under author direction for language refinement only; all methodological, analytical, and interpretive decisions are the author's responsibility.

---

*"Token unlocks are like tomorrow's weather. The schedule is already written.*  
*Yet the market acts surprised, every time."*  
— HoKwang Kim

---

**📄 Read the paper**: https://ssrn.com/abstract=6632838  
**💬 Discuss**: [GitHub Issues](https://github.com/gameworkerkim/vibe-investing/issues)  
**🔔 Follow updates**: [Watch this repository](https://github.com/gameworkerkim/vibe-investing)
