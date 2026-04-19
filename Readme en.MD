# vibe-investing

> **AI-Powered Investment Research & Trading Tools — Curation, Columns, and Open-Source Implementations**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with](https://img.shields.io/badge/Made%20with-Claude%20%2B%20Python-blue)]()
[![Updates](https://img.shields.io/badge/Updates-Weekly-brightgreen)]()
[![Awesome Lists](https://img.shields.io/badge/Awesome-Lists%20%C3%97%202-orange)]()
[![Columns](https://img.shields.io/badge/Columns-7%20Published-purple)]()
[![Tools](https://img.shields.io/badge/Tools-3%20Built-cyan)]()
[![Datasets](https://img.shields.io/badge/Datasets-14%2B%20CSV-red)]()
[![Language](https://img.shields.io/badge/Primary-Korean%20%F0%9F%87%B0%F0%9F%87%B7-lightgrey)]()

**🇰🇷 한국어 독자는 [README.md](README.md)를 읽어주세요.** ← Main Korean version

---

## 🌏 English Quick Start

This repository curates AI-powered investing tools, publishes market analysis columns, and shares reference implementations. **Primary content is in Korean**, but this page provides an English summary for international readers.

### What's Inside

| Category | Count | Description |
|---|---|---|
| **Awesome Lists** | 2 | 50+ AI trading repos (Stocks + Crypto) |
| **Analysis Columns** | 7 | 70,000+ words of market structure analysis |
| **Trading Tools** | 3 | Python implementations (547+ lines of code) |
| **CSV Datasets** | 14+ | 1,400+ data points for reproducibility |
| **Academic Citations** | 95+ | Peer-reviewed papers & industry reports |

---

## 📰 Columns — Key Findings

### 1. The LTCM Lesson — Reading the Model vs. Fingers
*1998's LTCM collapse (Nobel laureates lost $4.6B in 4 months) applied to 2026's AI-powered investing. Functional homogenization, Shiller CAPE 38, and 5 risk management principles.*

### 2. Microsoft's Fintool Acquisition — Excel as the New Bloomberg
*6 employees, $7.24M raised, acquired by Microsoft. Analysis of the $37B financial terminal market (Bloomberg, FactSet, S&P Capital IQ) and Microsoft's entry strategy via 6 synergy vectors.*

### 3. Invisible Hand or Coordinated Strategy?
*Mathematical and statistical analysis of the "pump → liquidation cascade → round-trip" pattern in crypto perpetual futures. VTCLR pattern definition, Benford's Law deviation, Bayesian hypothesis testing. Covers Hyperliquid XPL ($46M attacker profit), Fartcoin 4-wallet coordination, $20B October 2025 liquidation.*

### 4. Does the Market Open When Closed?
*Empirical analysis of 34 Nasdaq-100 disclosure cases (2020-2025). **91.2% of shock disclosures happen After Market Close**, averaging -6.45% next-day return (vs. +1.15% for BMO). AMC + Severe combination: -10.79%.*

### 5. DAT (Digital Asset Treasury) mNAV Arbitrage Strategy
*15 DAT companies (MSTR, BMNR, SBET + 12 others, $84B total assets). **MSTR +2,950% vs BTC +940% (2020-2026)**. mNAV range: 0.7x trough → 3.89x peak → 1.20x current. Reconstructs Jim Chanos's actual pair trade. Warning: BMNR sub-NAV trap (-43%p underperformance vs direct ETH).*

### 6. When to Buy Luxury?
*Post-COVID luxury sector asymmetry analysis. **Ferrari +389%, Hermès +311%, LVMH +32%, Kering -42%** (2020-2026 cumulative). Includes 225-case backtest proving single-stock DCA fails (-10.87% LVMH), ETF diversification succeeds (~+30-40% GLUX estimated). 3-tier risk portfolios (Low/Medium/High).*

### 7. 🆕 How Correlated Are Crypto and Nasdaq?
*6-year empirical study of BTC-QQQ 30-day rolling correlation across 26 quarters + 31 macro events.*
- **Average correlation 2020-2026: +0.335** (vs ~0 pre-2020)
- **2025 average: 0.52** — double 2024's 0.23 (LSEG data)
- **Regime swing**: -0.68 → +0.72 in 2 weeks (Feb 2026)
- **April 2026: -0.20 — 10-year low** (historical BTC rebound signal)
- **Asymmetric coupling**: BTC ignores Nasdaq rallies but follows sell-offs
- **Intraday lag**: Nasdaq leads BTC by 15-60 minutes in Medium regime

---

## 🛠️ Trading Tools

### 1. Harness Quant v2 — Scenario Matrix Platform
*6-scenario LLM-based analysis (short/medium-term × long/short × sector-trigger). Bull vs Bear multi-agent debate. MCP server integration. Backtest engine.*

### 2. Earnings Momentum Agent — Top 30 Recommendations
*7-stage pipeline: Universe Scanner → Fundamental Filter → Technical Filter → Sentiment Engine → Analyst Consensus → Multi-Agent Judge → Top 30 Report.*

**24-month backtest (2024-04 to 2026-04)**:
- Total decisions: 768 (BUY 108 / HOLD 582 / SELL 78)
- Forward 30-day avg return: **+7.15%**
- Forward 90-day avg return: **+14.97%**
- 30-day hit rate: **83.3%** (idealized scenario — real slippage/costs will reduce)

### 3. 🆕 Nasdaq-BTC Coupling Bot (547 lines, Python)

**Open-source Python implementation** — real-time BTC-QQQ correlation tracking and trading signal generator. Full source published under MIT license.

**Architecture** (10 classes, 18 functions):
```
CouplingBot (Orchestrator)
├── DataCollector (Binance + Alpaca WebSocket)
├── CorrelationAnalyzer (30-day rolling + regime classification + lag measurement)
├── SignalGenerator (6 regimes → trading signals)
└── NotificationDispatcher (Telegram/Slack/Email)
```

**6 Regime Parameters**:

| Regime | Range | Signal | Position | Stop Loss | Target | 90d Historical Return |
|---|---|---|---|---|---|---|
| 🟢 NEGATIVE | < -0.50 | STRONG_LONG_BTC | +15% | -15% | +25% | **+28.5%** |
| 🟢 DECOUPLING | -0.10 to -0.49 | ACCUMULATE_BTC | +8% | -10% | +15% | +15.2% |
| ⚪ LOW | -0.10 to +0.30 | NEUTRAL | 0% | — | — | +8.5% |
| 🟡 **MEDIUM** | +0.30 to +0.60 | FOLLOW_NASDAQ | +10% | -8% | +12% | +12.8% |
| 🟠 STRONG | +0.60 to +0.80 | RISK_OFF | -5% | -5% | +5% | -5.2% |
| 🔴 EXTREME | > +0.80 | CRISIS_MODE | -20% | -3% | +3% | -12.5% |

**Run Modes**:
```bash
python nasdaq_btc_coupling_bot.py --mode once      # Current regime check
python nasdaq_btc_coupling_bot.py --mode paper     # Paper trading (signals only)
python nasdaq_btc_coupling_bot.py --mode backtest  # Historical validation
python nasdaq_btc_coupling_bot.py --mode live      # Real-time signals
```

Full code: [`nasdaq_btc_coupling_bot.py`](./01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling/)

---

## 📊 CSV Datasets (14+ files, 1,400+ data points)

All datasets are in UTF-8-BOM CSV format, ready for `pandas.read_csv()`. Each column has a `notes` field with source attribution.

### Disclosure Timing
- `disclosure_timing_cases.csv` — 34 Nasdaq-100 8-K/earnings cases with next-day returns

### DAT (Digital Asset Treasury)
- `dat_companies_2026.csv` — 15 companies with holdings, mNAV, and characteristics
- `dat_vs_benchmark_performance.csv` — Half-year returns (MSTR, BMNR, SBET vs BTC, ETH, IBIT, ETHA, S&P500, QQQ)
- `mnav_cycles_arbitrage_signals.csv` — 12 mNAV cycle points with trading signals

### Luxury Sector
- `luxury_companies_etfs_2026.csv` — 13 companies + ETFs (LVMH, Hermès, Kering, Ferrari, GLUX, etc.)
- `luxury_performance_2020_2026.csv` — Half-year returns (13 periods, 9 assets)
- `luxury_backtest_3strategies.csv` — 225-row backtest log (DCA vs Buy-the-Dip vs China-shock Contrarian)
- `luxury_portfolio_by_risk.csv` — 19 allocations across Low/Medium/High risk tiers

### 🆕 Crypto-Nasdaq Coupling
- `btc_qqq_correlation_2020_2026.csv` — 26 quarters of 30-day rolling correlation
- `btc_nasdaq_event_log.csv` — 31 major macro/industry events with correlation impact
- `intraday_coupling_samples.csv` — 56 intraday price points across 4 representative sessions
- `correlation_regimes_signals.csv` — 6 regime definitions with trading parameters

### Earnings Momentum
- `backtest_log_24months.csv` — 768 decisions with 3-reason attribution + forward returns

---

## 🔬 What Makes This Repo Different

**Most AI-trading repos fall into one of two categories**:
1. **README theater** — polished marketing, no reproducible results
2. **Code dumps** — working code, no analytical context

**This repo aims for the middle path**:
- **Columns explain why** (market structure, historical patterns)
- **CSVs show the evidence** (reproducible numbers)
- **Python tools demonstrate application** (you can run them)
- **Academic citations ground the claims** (95+ sources)

Uniquely, this repo analyzes *cross-asset* and *traditional sector* opportunities:
- Crypto × Equity arbitrage (DAT mNAV)
- Consumer Discretionary (Luxury)
- Market Microstructure (AMC disclosures)
- Correlation Regimes (Nasdaq-BTC coupling)

**This combination is rare even in English-language resources.**

---

## 🚀 Getting Started

### For Readers (English)
1. **Most data-driven insights** → Read the column summaries above
2. **Reproduce numbers** → Check the CSV datasets (each column in the repo has its own `/` folder)
3. **Run the code** → Clone and execute `nasdaq_btc_coupling_bot.py`

### For Contributors
Issues and PRs welcome in English or Korean:
- Missing repos in Awesome lists
- Data corrections or additions
- English translation of any column
- Bug fixes in Coupling Bot
- New column topic proposals

### For Researchers
- All CSV data available under MIT license
- Academic citations encouraged — please cite as:
  *"Kim, D. (2026). vibe-investing. GitHub. https://github.com/gameworkerkim/vibe-investing"*

---

## ⚠️ Disclaimer

**All content is for research and educational purposes. Not investment advice.**

- Backtest results (83.3% hit rate, +28.5% regime returns, etc.) are **idealized scenarios**. Real trading involves slippage, commission, taxes, and execution delays.
- Historical correlation patterns (including the current -0.20 BTC-QQQ reading) do **not guarantee future results**.
- Short selling, inverse ETFs, and leverage can result in **unlimited losses**. Position sizes recommended are maximums, not minimums.
- Market structure analysis (perp manipulation, AMC disclosures, DAT arbitrage) uses **statistical induction only**; no specific entities are accused of wrongdoing.
- Regulatory compliance (SEC, CFTC, Korean FSC, EU MiCA) is the reader's responsibility.

**Before deploying any strategy with real capital**: paper trade ≥3 months, backtest ≥6 months, legal review required.

---

## 👤 About the Author

**Dennis Kim (김호광)**
Cyworld CEO · Web3 Investor · Developer

Active in Web3, blockchain, and AI trading. This repository reflects insights gained as an AI-leveraging entrepreneur.

- 📧 gameworker@gmail.com
- 🔗 [GitHub @gameworkerkim](https://github.com/gameworkerkim)
- 🔗 [Main repository (Korean)](https://github.com/gameworkerkim/vibe-investing)

---

## 📜 License

MIT License — free to use, modify, and redistribute. Attribution appreciated:
> *"Kim, D. (Dennis Kim) / vibe-investing"*

---

## 🔔 Stay Updated

Weekly updates (1-2 new columns/tools per week):
- ⭐ **Star** the repo to show support
- 🔔 **Watch → All Activity** to get notifications
- 🍴 **Fork** if you want to build on top

Currently: 34 stars · 7 forks · 0 watchers (as of April 2026)

---

<p align="center">
  <i><b>"Models always point to truth. Fingers always point to greed."</b></i><br><br>
  <i><b>"Model intelligence is not trading intelligence."</b></i><br>
  — Alpha Arena Season 1 lesson<br><br>
  <i><b>"Trade the premium, not the faith."</b></i><br>
  — DAT mNAV Arbitrage column<br><br>
  <i><b>"The question was never whether crypto and stocks move together.<br>
  The question is — when, how fast, and in which direction?<br>
  Those who know the regime, know the trade."</b></i><br>
  — Nasdaq-Crypto Coupling column
</p>

<p align="center">
  🇰🇷 <b>Korean readers</b>: <a href="README.md">Read the full Korean version</a> for complete column analysis, risk warnings, and regulatory context specific to Korean investors.
</p>
