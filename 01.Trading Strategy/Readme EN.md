# 01. Trading Strategy

The trading-strategy index of the vibe-investing repository. It collects quant strategies, LLM prompts, and academic-paper-driven research spanning US equities (NASDAQ / S&P 500), cryptocurrency, and the luxury sector.

The methodology running through this entire folder is Multi-LLM Cross-Validation. The same prompt is fed to Claude, ChatGPT, Gemini, and DeepSeek; consensus across models is treated as a robust signal, while divergence marks the spots where a human needs to dig deeper. It rests on the hypothesis that the future quant system is not a single super-intelligence but a committee of AIs with different philosophies.

→ [한국어 버전 (Korean version)](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Readme.MD)
→ [Back to main README](https://github.com/gameworkerkim/vibe-investing/blob/main/README.md)
→ [Paper folder (the academic basis for these strategies)](https://github.com/gameworkerkim/vibe-investing/blob/main/Paper%20%EB%85%BC%EB%AC%B8/readme.md)

---

## New here: where to start

This folder ranges from beginner-friendly to expert-level material. Pick what fits your situation.

If you want to start from the basics, first learn how to get an LLM to discover tickers using the prompt collection in [Awesome Claude Quant Scripts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Readme%20EN.md), then read an easy, column-style sector analysis like the [Luxury Investment Strategy](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Luxury%20investment%20strategy/Luxury%20investment%20strategy.md) (Korean only for now).

If you want to browse by theme, choose your area of interest (AI/Semiconductors, Dividends, Crypto, Macro/Regime, Short-selling) in the "By Theme" section below.

If you only want data and code, the "Data- and Code-Centric Items" section gathers the strategies that ship with backtest CSVs and reproducible Python scripts.

If you want the newest ideas, start with AI Hedge Fund and ARDS in the "Latest Ideas" section.

If you're looking for LLM prompt library references, see the [Awesome LLM Prompts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20LLM%20Prompts.md) guide covering open-source prompt libraries for financial, quant, and crypto investing (Korean).

---

## Latest Idea: Running AIs as a Hedge-Fund Committee

The most recent direction of this repo is to run the distinct personalities of multiple LLMs as a single hedge-fund investment committee, rather than relying on one LLM.

[AI Hedge Fund (ai-hedge-fund) Analysis Report](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/AI-hedge-fund/Readme.md) (Korean). An analysis of virattt/ai-hedge-fund, an open-source project with 50k+ GitHub stars. Agents emulating the philosophies of 14 legendary investors (Warren Buffett, Charlie Munger, Cathie Wood, and others) collaborate with valuation, technical, fundamental, sentiment, risk, and portfolio-manager analysis agents on LangGraph to produce simulated investment decisions. It supports OpenAI/Groq/Anthropic/DeepSeek/Ollama. The plan is to build on this structure to run LLM personalities like an investment committee.

[ARDS — Adaptive Recession-Defensive Strategy](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/ARDS%3A%20Adaptive%20Recession-Defensive%20Strategy/readme.md) (2026-05-18, Korean, 4-LLM cross-validation). The newest research, built directly on the hedge-fund-committee concept above. A dynamic defensive portfolio pursuing asymmetric alpha at recession onset, designed as the symmetric hedge to AMQS-M7. The key finding: macro diagnosis converges (all four models at Phase 3 Recession-Warning, std dev 2.29pp) while execution diverges — total weights ranged from 85% (Claude) to 225% (DeepSeek), a 14x gap, and the only unanimous ticker was GLD (gold). Each model's character emerges like a multi-PM hedge-fund committee (Claude a disciplined PM, Gemini a Cash-is-King risk officer, ChatGPT a Quant overlay, DeepSeek an aggressive alpha hunter).

[ARDS-X — Regime Classifier (Correction / Oversold / Downtrend / Recession)](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/ARDS%20%E2%80%94%20Adaptive%20Recession-Defensive%20Strategy%20for%20AI_QQQ/README_EN.md) (2026-06-06, Korean + English readme, KR/EN/CN prompts, reproducible code + dashboard + backtest). Differentiated item. The real-data extension of ARDS. Where ARDS had an LLM *estimate* the 5-Factor recession probability, ARDS-X **computes the same 5-Factor from free real data (yfinance + FRED free CSV, no API key)** and adds a price-structure axis (drawdown / trend / oversold) to form a **two-axis regime map**. It answers *"is this decline in US Big-Tech + AI/Infra and the S&P 500 / Nasdaq-100 a correction, a short-term oversold dip, a structural downtrend, or a recession-driven rebalancing?"*, classifies it into one of five states, and hands off to the sibling strategy (correction/oversold → AMQS momentum, recession → ARDS defense) — a *regime switch* rather than a standalone trading tool. In the 2014–2026 backtest, correction/oversold windows returned ~+5% over 60 days (77% hit rate), validating the dip-buy thesis, while the proxy-only macro axis *over-fired on recession throughout the 2022–24 yield-curve inversion (a BEAR_TRAP)* — conversely proving that real FRED data (Sahm Rule / LEI) is essential to identify a true recession.

---

## By Theme

### AI / Semiconductors / Momentum

[AMQS — Adaptive Momentum Quant Strategy (Backtest Report)](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)/readme.md) (2026-05-02 v1.0, Korean readme + KR/EN prompts). Differentiated item. A fully open-sourced code-and-backtest of an AI supercycle momentum weekly-rebalance strategy. Over 2024-01 to 2026-04 the backtest showed AMQS +114.1% vs QQQ +46.2%, Sharpe 1.33, MDD -16.9%. The core is a 4-Factor Composite momentum signal (12-1 / 6-1 / 3-1 / vol-adjusted) plus a macro regime filter (QQQ 200-day MA / VIX) plus weekly rebalancing. The 4th generation of the series.

[AMQS-M7 — Magnificent 7 Specialized Extension](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20M7/readme.md) (Korean readme + KR/EN/CN prompts). An M7-specialized (AAPL/MSFT/GOOGL/AMZN/META/NVDA/TSLA) extension of AMQS that formally adds a fifth scoring dimension, "Pullback-in-Uptrend" momentum, with a four-gate filter to block falling knives.

For US-equity (rather than crypto) short-side ideas, see also the [Nasdaq Short-Selling Strategy](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Nasdaq%20short%20selling%20strategy/IdeaNote.MD) (Korean, incomplete/idea stage) and [SaaS Short / HBM Long](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/SaaS%20short%20HBM%20Long) (work in progress).

### Crypto — Market Microstructure and Forensics

All of these connect to an SSRN paper or to a five-part column series.

[Token Unlock 72h Shock Analysis](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Token%20unlock%2072h%20shock%20analysis%20/readme.MD) (2026-04-23 v3.0, English, includes reproduction code). Differentiated item. It empirically documents that 46 of 52 Binance token unlock events (88.5%) show negative 72-hour returns (mean -16.97%, binomial test p=2.2×10⁻⁹). This is the repository for SSRN Paper #1 (6632838); 8 Python scripts and 10 CSVs reproduce every table.

[Binance Listing Day Crash](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Binance%20Listing%20Day%20Crash%20/Listing%20day%20crash%20analysis.md) (2026-04-20, Korean). Differentiated item. A full census of 51 Binance listings in 2024-2025 showing 96.1% declined within 24 hours (72-hour mean -45.24%). Even when BTC rose +5%, tokens fell -35.2% on average, proving structural sell pressure. Includes the LST-10 Ultimate Hybrid short strategy. (A [self-critique roadmap](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Binance%20Listing%20Day%20Crash%20/Listing%20day%20crash%20selfcritique%20roadmap.md) is also included.)

[Trading Strategy That Devours Binance Alpha MM Bots](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Trading%20strategy%20that%20devours%20Binance%20Alpha%20MM%20bots/Binance%20alpha%20mm%20bot%20analysis.MD) (2026-04-20, Korean). An analysis of 221 Binance Alpha listings proposing a 5-phase MM-bot behavior model (MBP-5: Accumulation → Pump Signal → Peak Formation → Distribution → Capitulation). The STR-07 Hybrid strategy, which shorts at Phase 3, recorded an 86% win rate and Sharpe 3.25 in backtests. Part 2 of the five-part column series.

[BNB Trading Bot — BNB-ETH Quantitative Analysis](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/BNB%20Trading%20Bot/Readme.md) (Korean / English / Chinese). A 4-year statistical analysis of BNB-ETH plus a BNB trading signal based on ETH moving-average crossovers. It found that after HODLer airdrops the correlation holds but beta alone falls from 0.643 to 0.534 (decoupling), and the backtest returned +123.21%. Connects to SSRN Paper #4 (6750298).

[Investment Strategy Based on Bitcoin and Nasdaq Coupling](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling/IdeaNodte.MD) (2026-04, Korean, short idea note). Covers the BTC-Nasdaq relationship swinging from a 2025 average correlation of 0.52 to -0.20 in April 2026 (a 10-year low). The key observation is an asymmetric coupling: they fall together but rise separately.

### Dividends / Capital Return

Most dividend-growth and capital-return strategies live as prompts and scripts inside the [Awesome Claude Quant Scripts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Readme%20EN.md) folder (Dividend Growth Prompt, Dual-Engine Capital Compounder, Long-Term Dividend Investing, and others). See that folder's README.

### Sector Analysis

[Luxury Investment Strategy — When Should You Buy Luxury Stocks?](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Luxury%20investment%20strategy/Luxury%20investment%20strategy.md) (2026-04-19, Korean). A beginner-friendly, column-style sector analysis. Using 2020-2026 data on 13 luxury companies and ETFs plus 225 backtests, it shows the failure of single-stock concentration (LVMH DCA -10.87%) and the advantage of diversification via the GLUX ETF. It proposes three risk-tiered portfolios (low / medium / high).

### Macro / Regime Diagnostic (4-LLM Cross-Validation)

[MRDS — Market Regime Diagnostic Quant Strategy](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Market%20Regime%20Diagnostic%20Quant%20Strategy/readme.md) (2026-05-19 v2.0, Korean, 4-LLM cross-validation). Differentiated item. A comparison report running the same regime-diagnostic prompt across four LLMs. Three of four converged on Cyclical Correction, but on a single identical metric (NVDA data-center revenue YoY) the models produced +44% / +73% / +115% — an LLM hallucination that empirically demonstrates the need to cross-check every quantitative figure against primary sources. The 5th-generation meta layer of the series.

### LLM Prompts / Resources

- [Awesome LLM Prompts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20LLM%20Prompts.md) (2026-07-15, Korean) — Guide to open-source LLM prompt libraries for financial, quant, and crypto investing. Covers 5 libraries including prompts.chat (143K+ stars), ternary-ai/prompts (cognitive financial agents), and AgentDock. Includes TradFi-to-crypto prompt domain adaptation guide, layered risk taxonomy (hallucination, computational reliability, crowding, crypto-specific risks), and usage recommendations. Not a strategy — a reference for designing analysis workflows.

---

## Incomplete / Pre-Research Items

The items below are at the idea or research-design stage and contain no quantitative conclusions. Keep this in mind when using them.

[Disclosure Timing Around Token Unlocks](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/%20Disclosure%20Timing%20Around%20Token%20Unlocks/ideanote%20disclosuretiming.MD) (2026-04-23, English / [Korean](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/%20Disclosure%20Timing%20Around%20Token%20Unlocks/ideanote%20disclosuretiming%20kr.MD)). Incomplete — a Phase 3 research-program design document (target execution 2027 Q1-Q2). A blueprint for using an LLM to detect temporal clustering of foundation disclosures around token unlocks and the execution-promise gap. Related report PDF: [Report Token_Unlock_72h_Shock_Analysis.pdf](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Report%20Token_Unlock_72h_Shock_Analysis.pdf).

[ChainWar — Cross-Chain Post-Listing Performance Comparison](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/ChainWar/IdeaNote_ChainWar.MD) (2026-04-24, Korean v0.1). Incomplete — a Phase 4 research-program draft (target execution 2027 Q3-Q4). A pre-research idea note seeking to test BTC-adjusted performance differences among BNB Chain, ERC-20, and Solana tokens; all patterns are hypotheses requiring verification.

[Nasdaq Short-Selling Strategy](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Nasdaq%20short%20selling%20strategy/IdeaNote.MD) (Korean). Incomplete — a short idea note. An early concept for short / inverse-leveraged strategies based on sector and ticker coupling.

[SaaS Short / HBM Long](https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/SaaS%20short%20HBM%20Long) (work in progress). A SaaS-short / HBM-long pair-strategy folder.

---

## Data- and Code-Centric Items (Backtest CSVs + Reproducible Python)

If you want to verify directly with code and data, the following are a good fit.

- [ARDS-X Regime Classifier](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/ARDS%20%E2%80%94%20Adaptive%20Recession-Defensive%20Strategy%20for%20AI_QQQ/README_EN.md): yfinance + FRED-free-CSV regime-classification engine + two-axis dashboard + look-ahead-free backtest (per-state forward-return CSV) + KR/EN/CN prompts. No API key required.
- [AMQS](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)/readme.md): yfinance-based backtest engine + live screener + daily NAV CSV
- [AMQS-M7](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20M7/readme.md): CLI tracker + backtest + KIS broker API placeholder
- [Token Unlock 72h](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Token%20unlock%2072h%20shock%20analysis%20/readme.MD): 8 Python scripts reproducing every paper table + 10 CSVs
- [BNB Trading Bot](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/BNB%20Trading%20Bot/Readme.md): standalone signal program + 13 analysis CSVs
- [Binance Listing Day Crash](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Binance%20Listing%20Day%20Crash%20/Listing%20day%20crash%20analysis.md): analysis engine + counter-strategy bot + 5 CSVs
- [Binance Alpha MM Bot](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Trading%20strategy%20that%20devours%20Binance%20Alpha%20MM%20bots/Binance%20alpha%20mm%20bot%20analysis.MD): research engine + counter-strategy bot + 5 CSVs
- [Luxury Investment Strategy](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Luxury%20investment%20strategy/Luxury%20investment%20strategy.md): 4 CSV datasets (performance, backtest, risk-tiered portfolios)

---

## Language Coverage

| Item | Korean | English | Chinese |
| --- | --- | --- | --- |
| Awesome Claude Quant Scripts | Yes | Yes | some prompts |
| AMQS (original) | Yes | prompt only | - |
| AMQS-M7 | Yes | prompt | prompt |
| ARDS | Yes | update pending | - |
| ARDS-X Regime Classifier | Yes | Yes | prompt |
| AI Hedge Fund | Yes | update pending | - |
| MRDS | Yes | update pending | - |
| Token Unlock 72h | report KR | Yes (body) | - |
| BNB Trading Bot | Yes | Yes | Yes |
| Binance Listing Day Crash | Yes | update pending | - |
| Binance Alpha MM Bot | Yes | update pending | - |
| Luxury Investment Strategy | Yes | update pending | - |
| Disclosure Timing | Yes | Yes | - |
| ChainWar | Yes | update pending | - |
| Bitcoin-Nasdaq Coupling | Yes | update pending | - |
| Nasdaq Short-Selling | Yes | update pending | - |
| Awesome LLM Prompts | Yes | - | - |

Note: ARDS, MRDS, Binance Listing Day Crash, Binance Alpha MM Bot, and Luxury Investment Strategy are well-regarded Korean strategies that do not yet have English versions, hence marked "update pending."

---

## Connection to Papers (Academic Basis)

Several crypto strategies in this folder are derived from four SSRN working papers. See the [Paper folder](https://github.com/gameworkerkim/vibe-investing/blob/main/Paper%20%EB%85%BC%EB%AC%B8/readme.md) for details.

- Paper #1 (SSRN 6632838): The 72-Hour Shock, 52 Binance token unlocks → basis for the Token Unlock 72h strategy
- Paper #2 (SSRN 6688740): Distribution Asymmetry of Centralized Exchange Airdrops, BNB Chain ecosystem
- Paper #3 (SSRN 6705598): Less Volume More Variety, LLM output length and contrarian discovery → academic basis for the Multi-LLM methodology
- Paper #4 (SSRN 6750298): Directional Decoupling, BNB-ETH beta volatility-ratio decomposition → basis for the BNB Trading Bot

---

## Recommended Order of Use

1. Identify your market of interest (US equities / luxury / crypto / macro regime)
2. Read the relevant theme's README and column thoroughly first
3. Before running any script or bot, always read the "Limitations" and "Disclaimer" sections of each document
4. Reproduce and verify with the CSV data
5. Validate with paper trading before considering live trading
6. Multi-LLM cross-validation: feed the same prompt to two or more LLMs, separate consensus tickers from divergence tickers, and verify the divergence tickers against primary sources (SEC EDGAR, 10-Q, FRED, etc.)

---

## Disclaimer

Each strategy is for research and education only and is not investment advice. Backtest results are based on idealized scenarios and differ from live returns. LLM-generated scores and probabilities are estimates, not outputs of a statistical model. All crypto trading-bot code is a research prototype; testnet validation and legal review are mandatory before live deployment. Korea residents should note multiple regulatory obligations including 22% foreign-stock capital-gains tax, the Foreign Exchange Transactions Act, and the Virtual Asset User Protection Act. For details, see the [Disclaimer in the main README](https://github.com/gameworkerkim/vibe-investing/blob/main/README.md#disclaimer).

---

## Author

Dennis Kim (HoKwang Kim / 김호광) — CEO of Betalabs Inc., Microsoft Azure ex-MVP, former CEO of CyworldZ

- ORCID: [0009-0002-0962-2175](https://orcid.org/0009-0002-0962-2175)
- GitHub: [@gameworkerkim](https://github.com/gameworkerkim)
- Email: gameworker@gmail.com

License: MIT (attribution appreciated: "Dennis Kim / vibe-investing")
