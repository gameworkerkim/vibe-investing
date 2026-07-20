---
title: "Bitcoin at $64K: How Strategy's DAT Model Unraveled the Bull Case"
published: true
tags: bitcoin, crypto, investing, finance, web3
canonical_url: https://github.com/gameworkerkim/vibe-investing
---

In June, Strategy (MSTR) sold bitcoin for the first time in four years. In July, BTC slid to $64,200 — down over 50% from its $126,198 all-time high. These two events are not separate. They are two chapters of the same story.

## Chapter 1: The DAT Model Breaks (June 2026)

On June 1, 2026, Strategy sold 32 BTC at an average of $77,135. The reason? A single line in their SEC 8-K: to fund preferred stock dividends.

Nobody cared about the $2.5M — it was pocket change for a company holding 843,706 BTC. But it exposed something far more important: **the flywheel runs in reverse**.

The Digital Asset Treasury (DAT) model works like this:

```
mNAV premium → equity issuance → bitcoin purchase → mNAV premium
```

In a bull market, this cycle is self-reinforcing. Strategy issues stock at a premium to NAV, buys bitcoin, the bitcoin price rises, the premium widens, and the cycle repeats.

In a bear market, the cycle inverts:

```
mNAV discount → no equity issuance → dividend obligations come due → bitcoin must be sold
```

Strategy owes roughly $1.5 billion annually in preferred stock dividends (STRK at 8%, STRC at 10-11.5%). When equity markets won't fund more bitcoin purchases, those dividends must be paid from somewhere. That somewhere is the bitcoin treasury.

The June sale was small. But the structure it revealed was not. As I wrote at the time:

> *"A treasury company's bitcoin is not an article of faith — it is a mark-to-market line item on a balance sheet."*

[Read the full June analysis (English)](https://github.com/gameworkerkim/vibe-investing/blob/main/02.Investment%20Idea%20Column/BitCoin/bitcoin-weakness-column-en.md)

## Chapter 2: The Triple Squeeze (July 20, 2026)

Seven weeks later, the structural weakness became a structural crisis.

### Geopolitics: Hormuz Ignites

On July 20, Iran's IRGC claimed two tankers exploded in the Strait of Hormuz. Brent crude hit $91.40. This wasn't isolated — CENTCOM had struck 80 Iranian targets on July 7, and a fragile ceasefire collapsed when Iran attacked a U.S. base in Jordan on July 18, killing two American servicemembers.

Transmission: Oil surge → inflation fears → rate hike expectations → risk asset liquidation.

### Equities: The Second AI Shock

On July 17, Moonshot AI released Kimi K3 (2.8T parameters, open-weight). The Philadelphia Semiconductor Index dropped 12.5% in a week — its worst performance in 15 months. KOSPI -6%, Nikkei -4%, TAIEX -6%.

Bitcoin's correlation with equities has been tightening all year. When semiconductors bleed, bitcoin follows.

### Supply: No One Is Buying

The structural buyer of 2024-2025 — spot ETFs — has reversed. July 8 alone saw $84.86M in net outflows. Leveraged positions have been largely flushed (open interest down to ~$46.5B), but deleveraging is not the same as accumulation.

The Fear & Greed Index reads 23. A major bank targets $53,000. Another holds $100,000 by year-end. The dispersion itself is the signal: nobody knows where the bottom is.

[Read the full July 20 analysis (English)](https://github.com/gameworkerkim/vibe-investing/blob/main/02.Investment%20Idea%20Column/BitCoin/BTC-20260720-Decline-Analysis-EN.md)

## The Thread Connecting Both Columns

The June column identified a **structural vulnerability**: DAT treasuries are forced sellers in downtrends because dividends are time-bound, not price-dependent.

The July column documented that vulnerability **becoming reality**: with ETF flows reversing, equity markets in turmoil, and geopolitics squeezing risk appetite, there is no buyer to absorb what forced sellers must offload.

This is what makes the current moment different from the 2022 bear market. In 2022, the structural buyer (spot ETFs) did not exist yet, and neither did the structural seller (DAT treasuries with fixed dividend obligations). Today, both exist, and they are pulling in opposite directions — one fading, one accelerating.

## The Crypto Winter Scenario

A prolonged winter rests on three unchanged conditions:

1. **Rates are going up, not down.** The Warsh Fed is discussing hikes, not cuts. Risk asset liquidity has no timeline for recovery.

2. **DAT selling pressure is structural, not discretionary.** Strategy's $1.5B annual dividend obligation doesn't care about the bitcoin price. If equity markets won't fund it, BTC gets sold.

3. **Hormuz remains contested.** As long as the Strait is a flashpoint, oil-driven inflation risk persists.

The counterargument — leverage is flushed, the market is oversold, the bulk of the decline is behind us — is valid. But oversold is evidence of a floor, not evidence of a rally. Oversold without buyers is simply oversold that persists.

## About This Research

Both columns are part of **[vibe-investing](https://github.com/gameworkerkim/vibe-investing)** — an open-source repository of AI-powered investment curation, quantitative trading strategies, and research columns.

The repo includes:

- **Trading Strategies**: Adaptive Momentum Quant Strategy (AMQS) applied to AI infrastructure, M7 tech, and broader Nasdaq universes. Real-time signal generation with yfinance data.
- **Investment Columns**: Research on bitcoin, DAT treasuries, crypto market structure, and macro regime analysis.
- **Tools**: Signal bots, backtesting frameworks, CLI trackers, and LLM prompts for quant analysis.

All code and analysis are MIT-licensed. The goal is simple: replace narrative with numbers, emotion with rules, and hope with a process.

---

*Disclaimer: This analysis is for informational and educational purposes only. It does not constitute investment advice. All investment decisions and their consequences are the sole responsibility of the investor. Past performance and structural analysis do not guarantee future results.*
