# vibe investing

> A repo for curation, strategies, columns, and papers on Vibe Investing — using AI as a tool

This repo treats AI like Excel — a tool — and publishes the work of separating signal from noise in the markets. AI and LLMs are not all-knowing; the human insight that reads the model matters most. It researches US NASDAQ/S&P500, crypto, the luxury sector, and crypto-equity correlation, pursuing alpha returns in disruptive-innovation industries.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with](https://img.shields.io/badge/Made%20with-Claude%20%2B%20Python-blue)](https://github.com/gameworkerkim/vibe-investing/blob/main)
[![Updates](https://img.shields.io/badge/Updates-Weekly-brightgreen)](https://github.com/gameworkerkim/vibe-investing/blob/main)
[![Awesome Lists](https://img.shields.io/badge/Awesome--Lists%20%C3%97%205-orange)](https://github.com/gameworkerkim/vibe-investing/blob/main)
[![ORCID](https://img.shields.io/badge/ORCID-0009--0002--0962--2175-A6CE39?logo=orcid&logoColor=white)](https://orcid.org/0009-0002-0962-2175)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/gameworkerkim/vibe-investing)

[한국어 README](https://github.com/gameworkerkim/vibe-investing/blob/main/README.md)

---

## Where this repo is heading — a multi-LLM investment committee

The next stage of Vibe Investing moves beyond reliance on a single LLM, toward **running several LLMs of distinct character as one quant hedge-fund investment committee and cross-validating them against each other.**

In the [ARDS — Adaptive Recession-Defensive Strategy](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/ARDS%3A%20Adaptive%20Recession-Defensive%20Strategy/readme.md) study, the same prompt and the same market data were fed to four models — Claude, Gemini, ChatGPT, and DeepSeek — and the following emerged:

- **Macro diagnosis converged** — all four agreed on a recession-warning regime (composite standard deviation 2.29%p, CV 3.7%)
- **Execution diverged** — the coefficient of variation on "what to buy and how much" reached 52%, roughly 14x the dispersion of the diagnosis
- **Each model formed a distinct PM persona** — Claude (discipline-based risk manager), Gemini (cash-first macro risk officer), ChatGPT (systematizing, backtest-driven quant strategist), DeepSeek (aggressive alpha hunter)

This mirrors the investment-committee decision structure of a real multi-manager hedge fund. The hypothesis — that a **committee of AIs with different investment philosophies**, rather than a single super-intelligent model, produces more robust decisions — is something this repo validates and expands strategy by strategy. For the underlying design philosophy and the 5-Dimension scoring / 4-Tier universe / 4-Phase regime structure, see the [ARDS readme](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/ARDS%3A%20Adaptive%20Recession-Defensive%20Strategy/readme.md).

---

## What is Vibe Investing?

If Vibe Coding is the paradigm of having an LLM write code in natural language, Vibe Investing is the agentic pipeline that starts from a natural-language instruction, has the LLM call tools to gather and analyze market data, news, and on-chain signals, and produces a verifiable investment decision. The core elements are natural-language strategy definition, active tool calling, multi-agent consensus (Bull/Bear/Risk/PM), and a human-auditable reasoning trail. It is a style of investing in which AI finds the signal among signal and noise and surfaces human insight.

---

## My Awesome series

The heart of this repo is five Awesome series I curated and wrote myself. They differ from a plain list of links: each item is evaluated by strengths, weaknesses, and best-fit users, with common pitfalls spelled out. Each series has its own sub-page with the full content.

| Series | Genre | One-liner | Open |
| --- | --- | --- | --- |
| Awesome Claude Quant Scripts | Quant strategy + prompts | A flagship asset binding 8 quant strategies across three layers — academic primary sources → Python skeletons → Claude prompts | [Open](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD) |
| Awesome Vibe Invest — Stocks | Stock tools | 30+ NASDAQ/S&P500 AI investing tools, scored on five axes | [Open](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD) |
| Awesome Vibe Invest — Crypto | Crypto tools | Benchmark-centric (Alpha Arena) LLM crypto-trading curation | [Open](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest%20crypto.MD) |
| Awesome Vibe Trading Bot | Open-source bots | Analysis of open-source coin trading bots on GitHub (AI-bot expansion) | [Open](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20Vibe%20Trading%20Bot.MD) |
| Awesome AI Quant Prompt Repos | Prompt-repo evaluation | User-rating and reliability analysis of AI/LLM quant-prompt GitHub repos | [Open](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20AI%20Quant%20Prompt%20github%20repos%20evaluation%20kr.MD) |

### How this differs from other Awesome series

Where typical "awesome-quant" lists mostly stay at a flat enumeration of libraries and repos, this series adds the following differentiators:
(1) per-item strength/weakness/best-fit evaluation,
(2) five-axis scoring on activity, maturity, learning curve, Korea-market fit, and license,
(3) a common-pitfalls section,
(4) a separate roundup of Korea/Asia market resources.

In particular, Awesome Claude Quant Scripts addresses not "which tool to use" but "which strategy to run on which theoretical foundation" — the most distinctive output in this repo.

---

## Curation by genre

### Trading Strategy

Collected under `01.Trading Strategy/`. It comprises multi-LLM cross-validation strategies (ARDS, AMQS, AMQS-M7), the Claude script collection (Awesome Claude Quant Scripts), a single-sector strategy (luxury), and a correlation strategy (BTC-Nasdaq coupling).

→ Index: [01.Trading Strategy README](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Readme.MD) ([EN](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Readme%20EN.md))

### Investment Idea Column

Seven columns analyzing macro trends and industry shifts with empirical data, classified into risk-management/market-structure, industry/sector, and quantitative/data-driven. They follow a principle of statistical commentary that names no specific party.

→ Index: [02.Investment Idea Column README](https://github.com/gameworkerkim/vibe-investing/blob/main/02.Investment%20Idea%20Column/Readme.MD)

### SSRN Papers

Four working papers posted to SSRN, 113 pages total — three on cryptocurrency market microstructure and one on multilingual LLM evaluation, using standard econometric methods including event studies, variance decomposition, DCC-GARCH, and Spearman rank correlation.

→ Index: [Paper README](https://github.com/gameworkerkim/vibe-investing/blob/main/Paper%20%EB%85%BC%EB%AC%B8/readme.md) · ORCID [0009-0002-0962-2175](https://orcid.org/0009-0002-0962-2175)

### Tools

| Tool | One-liner |
| --- | --- |
| [DART Monitor Lab](https://vibequant.cc/lab/) | KOSDAQ DART disclosure monitor. Live app: [dart-monitor-pi.vercel.app](https://dart-monitor-pi.vercel.app/) from [`cassandra-ai`](https://github.com/gameworkerkim/cassandra-ai) (Vercel root `./`). Lab HTML: [`VibeQuant/pages/lab/`](https://github.com/gameworkerkim/vibe-investing/tree/main/VibeQuant/pages/lab) |
| [TokenForge Lab](https://vibequant.cc/lab/#tokenforge) | Korean/other coding prompts → caveman-ultra English via DeepSeek; Claude/ChatGPT token-savings estimate. Same Worker key as Play, no finance gate. [`TokenForge/readme.md`](https://github.com/gameworkerkim/vibe-investing/blob/main/TokenForge/readme.md) |
| [Harness Quant v2](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quant%20v2%20readme%20.MD) | Six-scenario-matrix LLM trading platform (backtest + MCP + multi-agent debate) (in development) |
| [Earnings Momentum Agent](https://github.com/gameworkerkim/vibe-investing/blob/main/Harness%20quantv2/Earnings%20momentum%20agent%20readme%20.MD) | Bottom-rebound + earnings-surprise Top 30 recommendation pipeline (24-month backtest, 30-day hit rate 83.3%) |
| [Nasdaq-BTC Coupling Bot](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Investment%20Strategy%20Based%20on%20Bitcoin%20and%20Nasdaq%20Coupling/) | BTC-QQQ 30-day rolling correlation tracking + 6-regime classification + signal generation (547-line Python) |

### TechDoc

Technical documents needed to operate and reproduce the repo.

→ [TechDoc folder](https://github.com/gameworkerkim/vibe-investing/tree/main/TechDoc)

---

## Recent updates (highlights per sub-folder)

### 01.Trading Strategy

- **ARDS — Adaptive Recession-Defensive Strategy** — validates the multi-agent investment-committee hypothesis via 4-LLM cross-validation. 5-Factor recession composite + 4-Tier 25-ticker universe + 4-Phase regime.
- **Awesome Claude Quant Scripts** — alongside the eight-strategy curation, it ships four scripts (AI supply-chain Bayesian analysis, DAT quant strategy, LLM declining-stock script, long-term dividend investing) plus a Sample template.

### 02.Investment Idea Column

- **Does the market open when it closes?** — empirical analysis of 34 after-market-close (AMC) disclosures from NASDAQ-100 firms. 91.2% cluster at AMC; the AMC+Severe combination averaged -10.79% the next day.
- **How synchronized are crypto and Nasdaq?** — 2020-2026 BTC-QQQ correlation across 26 quarters + 6-regime classification + intraday lag measurement.

### Paper

- **Less Volume, More Variety** (SSRN 6705598) — reports an inverse relationship (Spearman ρ = -0.80) where shorter LLM output yields a higher contrarian-discovery rate under identical prompts.
- **Directional Decoupling** (SSRN 6750298) — explains the correlation-preserving, volatility-ratio-compressing mechanism in the BNB-ETH pair via beta decomposition (28 pages).

### Harness quantv2

- **Earnings Momentum Agent** — a 7-stage pipeline (universe scan → fundamental/technical filter → sentiment → consensus → 4-agent debate → Top 30) with a 24-month, 768-decision backtest published.

---

## Directory structure

```
vibe-investing/
├── README.md                          ← Korean README
├── Readme en.MD                       ← this file (English)
│
├── 01.Trading Strategy/               ← strategy index
│   ├── Readme.MD / Readme EN.md
│   ├── ARDS: Adaptive Recession-Defensive Strategy/   ← 4-LLM cross-validated defensive strategy
│   ├── Adaptive Momentum Quant Strategy (AMQS)/       ← momentum (original)
│   ├── Adaptive Momentum Quant Strategy (AMQS) for M7/← M7 momentum
│   ├── Awesome claude quant scripts/  ← 8 strategies + 4 scripts + Sample
│   ├── Luxury investment strategy/    ← luxury sector strategy + column + 4 CSVs
│   └── Investment Strategy ... Coupling/ ← BTC-Nasdaq bot + column + 4 CSVs
│
├── 02.Investment Idea Column/         ← unified column index (7 pieces)
│
├── Paper 논문/                        ← 4 SSRN working papers (113p) + citation scripts
│
├── Harness quantv2/                   ← Earnings Momentum Agent
├── AfterMarketClose/                  ← AMC disclosure column + CSV
├── mNAV(Market-to-Net-Asset-Value) arbitrage/ ← DAT mNAV column + 3 CSVs
├── TechDoc/                           ← technical documents
├── TradingLog/                        ← trading log
│
├── Awesome vibe invest.MD             ← stock-tool curation
├── Awesome vibe invest crypto.MD      ← crypto-tool curation
├── Awesome Vibe Trading Bot.MD        ← open-source bot analysis
├── Awesome AI Quant Prompt ... kr.MD  ← prompt-repo evaluation
│
├── Harness quant v2 readme .MD        ← Harness Quant v2 doc
├── Vibe Investing Risk Management.MD  ← LTCM column
├── Microsoft fintool acquisition column.MD
└── Crypto perp manipulation column.MD
```

---

## Where to start

- **To build a quant strategy yourself** → copy the prompt templates in [Awesome Claude Quant Scripts](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/Awesome%20claude%20quant%20scripts/Awesome%20claude%20quant%20scripts.MD)
- **To see the multi-LLM committee concept** → the [ARDS readme](https://github.com/gameworkerkim/vibe-investing/blob/main/01.Trading%20Strategy/ARDS%3A%20Adaptive%20Recession-Defensive%20Strategy/readme.md)
- **If you need tool curation** → [Stocks](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest.MD) or [Crypto](https://github.com/gameworkerkim/vibe-investing/blob/main/Awesome%20vibe%20invest%20crypto.MD), by market of interest
- **For market insight** → start from the LTCM column in the [column index](https://github.com/gameworkerkim/vibe-investing/blob/main/02.Investment%20Idea%20Column/Readme.MD)
- **Before auto-trading with your own capital** → read each document's "known limits / common pitfalls / risk disclosure" section first

---

## Contributing

Stars, reports of good repos that are missing, rebuttals to evaluations, English translations, Korea-market resource suggestions, sharing your own backtest results, column-topic proposals, and new quant strategies are all welcome. Let me know via an issue or PR. A "this evaluation is wrong" disagreement is the most valuable feedback.

---

## Disclaimer

All content in this repo is for research and educational purposes.

- No tool guarantees profit. Backtest hit rates assume idealized scenarios; slippage, fees, taxes, and latency lower real-world returns.
- LLM-generated code may contain factual errors, structural bias, and security flaws. If you cannot verify it yourself, cross-validate with another LLM to filter hallucinations. A 4-LLM ensemble is not ground truth either, and human final review is required.
- The US SEC/CFTC, Korea's FSS, and the EU's MiCA may all apply regulation to AI-based automated trading — managing your own assets is allowed, but managing others' funds requires a license.
- Market-structure columns are statistical, academic commentary that names no specific party; the legal characterization of individual events is for the relevant authorities.
- Downside bets, short selling, inverse/leveraged ETFs, and defensive inverse products can be devastating for individuals and may converge to total loss if held long term. Always consult the relevant risk disclosures and strictly limit portfolio weight.
- Responsibility for investment outcomes and legal risk rests with the user.

---

## About

HoKwang Kim (Dennis Kim) — CEO, Betalabs Inc. · Microsoft Azure ex-MVP · Former CEO, CyworldZ. Active in Web3, blockchain, AI trading, and multi-agent AI systems.

- Email: gameworker@gmail.com
- GitHub: [@gameworkerkim](https://github.com/gameworkerkim)
- ORCID: [0009-0002-0962-2175](https://orcid.org/0009-0002-0962-2175)

This repo is built on insight gained over a long career in the finance, security, and gaming markets — from founding a blockchain startup in 2017 to living through the fall of Cyworld.

---

## License

MIT License — free to use, modify, and distribute with attribution. When citing columns or papers, please credit "HoKwang Kim (Dennis Kim) / vibe-investing repo" or the relevant SSRN DOI.

> "Code without theory is gambling; theory without code is philosophy. Claude collapses the gap — but never replaces verification."

> "In a bull market, defense is a tax. In a bear market, defense is oxygen. But the real lesson of this experiment is that there is no single AI that breathes for you — there are only four AIs with four different lungs, and you breathe best when they breathe together."
