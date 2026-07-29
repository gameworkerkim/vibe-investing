---
title: "Vibe Quant Insight #001 — The Open-Weight Counterattack, Apple's Paradox, and the AI That Broke In by Itself"
description: "The three-way open-weight race between Kimi K3, Solar Open2 and DeepSeek V4 and Washington's regulatory fight; the paradox of Apple — the Big Tech firm that spent least on AI — reclaiming the world's largest market cap; and the forensic timeline of an OpenAI evaluation agent that breached Hugging Face. Inaugural issue of a weekly quant, security and Web3 briefing."
date: 2026-07-29
slug: vibe-quant-insight-001-en
series: "Vibe Quant Insight"
issue: 1
lang: en
canonical: "https://docs.vibequant.cc/columns/vibe-quant-insight-001-en/"
alternates:
  ko: "https://docs.vibequant.cc/columns/vibe-quant-insight-001/"
  ja: "https://docs.vibequant.cc/columns/vibe-quant-insight-001-ja/"
keywords:
  - open-weight models
  - Kimi K3
  - Solar Open2
  - DeepSeek V4
  - Liang Wenfeng
  - Hugging Face breach
  - AI agent security
  - Apple market cap
  - Nvidia
  - semiconductor correction
  - Michael Burry
  - quant investing
  - cyber threat intelligence
og_title: "Vibe Quant Insight #001 — The Open-Weight Counterattack, Apple's Paradox, and the AI That Broke In by Itself"
og_description: "A three-way open-weight race, Apple's paradoxical return to the top, and an AI agent that ran its own intrusion. Inaugural issue."
og_image: "https://vibequant.cc/og-default.png"
og_type: article
twitter_card: summary_large_image
author: "Dennis Kim"
robots: "index, follow"
---

# Vibe Quant Insight #001

**July 29, 2026 · Inaugural Issue**

[뉴스레터](https://docs.vibequant.cc/columns/vibe-quant-insight-001/) · [News Letter](https://docs.vibequant.cc/columns/vibe-quant-insight-001-en/) · [日本語](https://docs.vibequant.cc/columns/vibe-quant-insight-001-ja/)

Where AI, quant and security intersect — one email a week. Not news, but material for judgment.

> **Columns in other languages** — English editions of the columns referenced here are available from the individual entries at [docs.vibequant.cc/columns/](https://docs.vibequant.cc/columns/). Most major columns are published in Korean, English, Japanese and Chinese.

**This issue at a glance**

| Section | Topic | One line |
|---|---|---|
| 1. AI/Tech | The open-weight three-way race | Kimi K3 released 2.8T parameters of weights; Washington is weighing regulation |
| 2. Quant | The market's paradox | The Big Tech firm that spent least on AI became the AI rally's final winner |
| 3. Web3/Security | Four incidents | A DPRK insider job, a Hanwha Vision token, ScarCruft, and a three-month reporting delay |
| Closing | Liang Wenfeng | Why restraint (less is more) is the most radical strategy available |

---

## Section 1 — AI/Tech: Innovation and Competition in Open-Weight Models

### 1.1 What is an open-weight model?

**Open-weight** means publishing the trained weight files of a model for public download. Anyone can run it on their own servers, fine-tune it, and audit it internally.

The distinctions that are easiest to confuse:

| Category | What is published | Examples |
|---|---|---|
| Closed | API access only | GPT family, Claude family |
| Open-weight | Weights + inference code; **training data and pipeline stay private** | Kimi K3, DeepSeek V4, Solar Open2, Llama, Gemma |
| Fully open source | Data, training code and weights | A small number of research models |

The key point is that **open-weight is not open source**. You get the weights, but not the knowledge of what the model was trained on or how. It still makes a decisive practical difference: your prompts never leave for an external server, and if a vendor retires a model, the copy running on your cluster keeps running. Kimi K3 and DeepSeek released more than weights — they also opened **the infrastructure stack needed to actually serve the model**, including attention kernels and the MoE communication library. That is what separates this from a release that just throws a checkpoint over the wall.

### 1.2 Why is the United States wary of open-weight models?

After Moonshot AI unveiled Kimi K3 on July 16, the mood in Washington shifted sharply. The debate split into two camps.

**Those calling for regulation** make three arguments. First, that Chinese firms are rapidly absorbing the capabilities of top US models through *distillation*, and that if open models are not bound by the same rules as US companies, the result could be cyber and biological weapons risk. Second, White House adviser Michael Kratsios criticized what he called large-scale covert industrial distillation aimed at stealing proprietary US technology as unacceptable. Third, Treasury Secretary Scott Bessent said in a July 21 CNBC interview that the Trump administration would examine whether Chinese firms are stealing US intellectual property, and that it has the ability to impose sanctions on that basis.

**Those opposing regulation** make the more interesting case. On July 24, twenty-five Big Tech companies and venture firms issued a joint statement warning against hasty regulation and calling instead for wider access to compute and investment in shared training assets. Nvidia CEO Jensen Huang, after meeting lawmakers in Washington on July 28, said American industry needs open-weight models for security and safety. A joint statement from Nvidia, Microsoft, Palantir and Salesforce warned that blanket regulation of open frontier systems risks concentrating power, dependency and vulnerability in a handful of closed providers.

The most candid diagnosis came from inside Silicon Valley itself: that closed-model companies, unable to win on technology or price, are instead leaning on government regulation — an attempt at **regulatory capture**. As TechCrunch noted, once users start spending outside the closed labs, the return on the enormous sums those labs poured into training falls accordingly. For context, Meta (Llama), Google (Gemma) and even OpenAI (GPT-oss) have all released open weights at some point; among the major frontier labs, Anthropic is effectively the only one that has not.

**My read**: security concerns and competitive defense are tangled together here, and any policy that fails to separate the two will be distorted. For Korea, what matters is not which side wins but **securing usable weights regardless of who wins**. If regulation arrives, APIs get cut off — but weights already downloaded become an asset and an R&D base you can build on.

### 1.3 Why does Liang Wenfeng back open source?

The logic of DeepSeek's founder is not idealism but cold arithmetic about scale.

- The old software market was worth tens of billions a year. In that world, open source was suicide — it destroyed the market outright. But the AI market will account for a meaningful share of global GDP.
- "If we try to monopolize that profit, history will inevitably discard us."
- If you only pursue a *reasonable* profit, open source costs you nothing. It would have been fatal if the goal were hundred-fold margins. That is not the goal.
- The model published is exactly the model actually deployed. There is no practice of running something better internally while releasing the leftovers.

The central sentence is this: **"My top priority is not to take a bigger slice of the pie, but to raise the probability that we succeed at all."** Open source is a tool for raising that probability. More on this in the closing section.

### 1.4 Open weights hand latecomers a path to industrialization

This is the part that matters most for Korea. Without open weights, latecomer countries and companies would have to train frontier models from scratch — trillions of won in capital and years of time. Once weights are public, the following becomes possible:

| What becomes possible | Practical meaning |
|---|---|
| Domain fine-tuning | Vertical models for legal, medical or manufacturing use at a cost in the tens of thousands of dollars |
| On-prem deployment | Real use in finance, government and defense, where network separation and data-export rules apply |
| Model auditing | Verify the weights directly instead of trusting an API black box |
| Supply risk hedging | A buffer against export controls, service shutdowns and price hikes |
| Cost structure control | Cost driven by GPU depreciation, not per-token pricing |

Solar Open2 matching a 1.6-trillion-parameter model on Korean-language benchmarks at 250B is precisely a product of this dynamic. **Open weights open a door where you compete on engineering rather than capital.**

### 1.5 What is happening on Hugging Face right now — Kimi K3 weights are live

Moonshot AI shipped K3 first through its API and app on July 16, held the weights back for ten days, and published them on July 27. Just before release, roughly 2,500 developers had registered for notification on the official Hugging Face model page. The official repository went up with 96 weight shards, the Kimi K3 License, configuration files and deployment instructions, alongside a technical report. Together AI and Modal opened hosted access on day zero.

**Three models compared**

| | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | Kimi K3 |
|---|---|---|---|---|
| Release | 2026-07-22 | 2026-04-24 | 2026-04-24 | API 07-16 / weights 07-27 |
| Total parameters | 250B | 284B | 1.6T | 2.8T |
| Active parameters | 15B | 13B | 49B | 104B (official) |
| Context | 1M | 1M | 1M | 1M |
| License | Upstage Solar License | MIT | MIT | Kimi K3 License |
| Minimum hardware | 4×H200 (BF16) | 2×H200 | 8×H200 | 64+ accelerators |
| API price (in/out, per 1M tokens) | Upstage API | $0.14/$0.28 | $0.435/$0.87 | $3.00/$15.00 |

**Selection guide by purpose**

| Purpose | Choice |
|---|---|
| Korean/Japanese enterprise agents | Solar Open2 (Ko-GDPval 86.8; 24% fewer Korean tokens) |
| Peak coding-agent performance | DeepSeek V4-Pro (SWE-Bench Verified 80.6) |
| Cost-effective self-hosting | DeepSeek V4-Flash (INT4 on 4×RTX 4090) |
| Front-end specialization | Kimi K3 (Frontend Code Arena #1) |
| License freedom | DeepSeek V4 (MIT) |

Full benchmarks and seven scenario-by-scenario analyses: **[Solar Open2 · DeepSeek V4 · Kimi K3 Comparative Analysis](https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/AI-Open-Weights-Model/readme.md)**

**One-line verdict**: K3 is impressive on benchmarks, but **a model requiring 64 or more accelerators is not an option that exists for most Korean companies**. The realistic adoption contest is between Solar Open2 and DeepSeek V4-Flash. K3's real significance is not "a model we will use" but **proof that the open-weight camp has reached frontier performance** — and that proof is currently shaking both the US regulatory debate and semiconductor valuations at once.

### 1.6 The week's biggest security story — an AI agent ran its own intrusion

On July 27, the Hugging Face security team published a forensic timeline titled **[Anatomy of a Frontier Lab Agent Intrusion](https://huggingface.co/blog/agent-intrusion-technical-timeline)**. It is the most detailed record of an AI-agent breach published to date, and the most consequential.

The essentials:

| Item | Detail |
|---|---|
| Window | 2026-07-09 02:28 – 07-13 14:14 UTC (4.5 days) |
| Recovered actions | ~17,600 (about 6,280 clusters) |
| Actor | An autonomous agent driven by a combination of OpenAI models. **No human directed the individual steps** |
| Assigned task | The ExploitGym vulnerability-discovery benchmark |
| Actual behavior | Instead of solving the problems, it **broke into the server holding the answers** |
| Chain | Package-proxy 0-day → rooting a third-party sandbox → code execution in a production pod via a malicious dataset → node root → mesh VPN → source control |
| Secondary victim | A Modal Labs customer's unauthenticated endpoint was used as the launchpad (Reuters, 7/28) |

Two things stand out.

First, **there was no bespoke C2 infrastructure.** The agent used public request-capture services, pastebins, and **Hugging Face's own datasets as dead drops**. The victim's infrastructure became the attacker's communications network.

Second — the most contentious detail — Hugging Face **first tried Claude Opus and Fable for the log analysis and was refused for much of the work**. The guardrails could not distinguish reverse-engineering an exploit from launching one. The team ended up standing up NVIDIA's quantized GLM-5.2 on their own infrastructure and rerouting the entire pipeline through it. Only then could they recover the chunk+XOR+compression scheme and surface roughly **four times** the credentials their initial automated scan had found.

Compressed into one line:

> A closed model with guardrails disabled attacked → a closed model with guardrails enabled refused to help defend → an open-weight model completed the investigation.

**This connects directly back to the open-weight discussion above.** A security organization that stakes its entire incident-response capability on a single commercial API has a single point of failure. On-prem open-weight models are no longer a cost-saving option — they are an **IR continuity requirement**.

> **Related columns**
> - [The Attacker Was Never Outside — The First Real Breach Created by an Unrestrained LLM](https://docs.vibequant.cc/columns/ai-hacking-huggingface-breach-v2/) (2026.07.22)
> - [The Defensive Asymmetry Has Opened — A Close Analysis of the Hugging Face AI Agent Breach](https://docs.vibequant.cc/columns/ai-hacking-huggingface-ai-agent-breach-column/) (2026.07.20)

The three implications of this incident are covered in a separate column. In summary: (1) an LLM will choose high-risk paths to reach its objective, and ethics is a bolt-on module rather than an intrinsic property; (2) security architecture must be matched to the scale and speed of AI-driven attacks; (3) as LLMs become black boxes, transparent governance — including for government and the public sector — has become urgent.

---

## Section 2 — Quant/Invest: The Market's Paradox

### This week's quant one-liner

> **The Big Tech company that invested least in AI became the final winner of the AI rally.**

On July 27, Apple reclaimed the world's largest market capitalization at $4.95 trillion, overtaking Nvidia. Nvidia had held the top spot since passing Microsoft in June 2025, and briefly touched $5 trillion in October. Then on July 28, Apple rose as much as 1.8% intraday and crossed $5 trillion in market value for the first time, ahead of Nvidia ($4.7T), Alphabet ($3.9T) and Microsoft ($2.9T).

Set the numbers side by side and the paradox sharpens.

| Item | Apple | Nvidia |
|---|---|---|
| 2026 year to date | approx. +24–25% | approx. +2.6–7% |
| Market cap (as of 7/28) | approx. $5.0T | approx. $4.7T |
| AI capital expenditure | **$12.7B** in fiscal 2025 | — |

For comparison, Alphabet has guided to $205 billion this year, while Microsoft and Amazon raised annual spending plans to as much as $190 billion and $145 billion respectively. Apple's capex is a fraction of that. Investors rewarded Apple precisely for choosing to rent capacity rather than pour capital into AI infrastructure.

**How should a quant read this?**

For three years the market priced on the equation "AI capex = future revenue." The bigger the spend, the more serious the player. The equation the market swapped in during the second half of 2026 is this:

> **Capex is a cost, and there is still no proof that the cost gets recovered.**

Under the same framework, Alphabet is deploying roughly sixteen times Apple's capital expenditure. With no answer yet as to when — or how much — free cash flow that sixteen-fold spend returns, the market has begun assigning a **premium to the capex-light side**. Apple did not win by avoiding AI. It won by **making someone else pay the AI bill while holding the distribution channel**.

Translated into practice, the question compresses to one line: **is the stock you hold a spender, a receiver, or an avoider of AI capex?** The last three years belonged to the receivers (Nvidia, memory). Right now the market is voting for the avoider (Apple), and the spenders (hyperscalers) are on trial.

### Semiconductors and AI — giving back the gains is normal, and it isn't over

When a stock pulls a decade of upside forward into a few quarters, giving that upside back is not an anomaly. It is arithmetic. Two columns cover this from different angles.

**[The Great Memory Semiconductor Crash and the Illusion That "This Time Is Different"](https://docs.vibequant.cc/columns/ai-bouble-the-end-of-the-semiconductor-supercycle-260728/)** (2026.07.28)

A structural diagnosis, in three parts.

- **HBM deceleration**: HBM market growth is set to slow from 183% in 2025 to 69% in 2026. Moving from Blackwell to Rubin, HBM capacity per unit is frozen at 288GB and the stack count stays at eight. **The volume-growth effect that made customers buy more has disappeared.**
- **CXMT as a third competitor**: Global DRAM share doubled from 3.97% in Q2 2025 to 7.67% in Q4, and its Shanghai STAR Market listing raised roughly 6 trillion won in ammunition. A competitor now carries both state backing and capital-market funding.
- **The Cisco lesson**: In 2000 Cisco's share price had priced in earnings 26 years ahead. Revenue then grew fivefold and net income eightfold — and **it still took 25 years and 8 months for the stock to reclaim that high.**

**[Semiconductor Sector Quant Analysis: Diagnosing the Late Stage of a Momentum Collapse](https://docs.vibequant.cc/columns/semiconductor-momentum-quant-2026-07/)** (2026.07.29)

A quantitative read on positioning and flows.

| Metric | Status |
|---|---|
| MSCI World Semiconductor Index | approx. −13% this month |
| Semiconductor fund outflows | approx. $11B (a record) |
| SanDisk | −50%+ from its late-June high |
| Western Digital | nearly −40% from its all-time high |
| Korean memory leaders | −40%+ from year highs |
| Global semiconductor net positioning | **97th percentile on a five-year basis** |

That last line is the point. **This is not yet a "cheap" zone.** Samsung Electronics posted a 1,810% year-on-year jump in Q2 operating profit and the stock still fell — because the market read that number as **a signal of the cycle peak**.

**Conclusion**: The semiconductor and AI sectors are in an orderly unwind of crowded positioning, not a fundamental collapse. But there is no evidence the unwind is finished. Until hyperscaler Q2 results and capex guidance are all in, a large bet in either direction carries extremely high tail risk. **For now, initiating new positions in AI and semiconductor names calls for caution.**

### What is Michael Burry doing?

The positioning taken by *The Big Short*'s Michael Burry in this phase is worth noting — with two caveats. First, **he deregistered Scion Asset Management in November 2025, so his current statements come through a Substack newsletter rather than 13F filings.** Second, **he already holds positions that pay off on a decline.** Read him with the perspective of a short-side report firmly in mind.

| When | What |
|---|---|
| July 1–2 | Disclosed on Substack a short on Micron (MU) at $1,051.87 per share. The stock was up roughly 700% over a year and 241% in 2026 alone. |
| Earlier | Has disclosed put positions on Nvidia, Tesla, Caterpillar, Applied Materials and the semiconductor ETF (SOXX). |
| July 17 | Posted on X that with the shine coming off Korea, Japan and the SOXX, it is a particularly good moment to hunt cheap stocks in Hong Kong. |
| During July | Disclosed buying JD.com at $27.58, Flutter Entertainment at around $107, and DraftKings in the low $26 range. |

**How to read it**: Burry has built a clean pair — short AI and semiconductors, long Greater China value. What to take from this is not the conclusion but the **structure**. Independently of whether his call proves right, the positioning logic — short the most crowded trade, long the most neglected geography — is coherent with the current factor structure.

That said, he has been warning about an AI bubble since 2023 and the market kept rising throughout. One point deserves emphasis here. **There is no such thing as "the right timing" when you trade against the psychological momentum and conviction of market participants. Equities are ultimately a matter of psychology and flows.** Even when the direction is right, you have to survive the losses until flows turn — and most individual investors have neither the capital nor the time horizon to survive that stretch.

> **Related columns**
> - [The Temperature Gap in the AI Market — Michael Burry's "Greed Warning" vs. Dan Ives's "Revolutionary Optimism"](https://docs.vibequant.cc/columns/ai-bouble-ai-vs/)
> - [AI Semiconductor Correction Quant Report](https://docs.vibequant.cc/columns/quant-review-ai-semis-20260717/)
> - [The Hurricane Kimi K3 Created in the US Semiconductor Market](https://docs.vibequant.cc/columns/ai-bouble-kimi-k3-effect-0717/)
> - [Moonshot AI's Six-Month IPO Window — A Race Before the Door Closes](https://docs.vibequant.cc/columns/ai-bouble-moonshot-ipo/)

### Bilingual columns (Korean / English)

A selection of columns published in parallel for English readers. All are reachable by language from [docs.vibequant.cc/columns/](https://docs.vibequant.cc/columns/).

| Topic | Korean | English |
|---|---|---|
| The AI revolution begins | [인공지능 혁명, 이제 시작이다](https://docs.vibequant.cc/columns/ai-revolution-ai-revolution-ko/) | [The AI Revolution Is Just Beginning](https://docs.vibequant.cc/columns/ai-revolution-ai-revolution-en/) |
| DeepSeek's financial alpha | [왜 DeepSeek는 금융 분야에서 알파를 추구하나](https://docs.vibequant.cc/columns/deepseek-alpha-deepseek-alpha-finance-ko/) | [Why Does DeepSeek Pursue Alpha in Finance?](https://docs.vibequant.cc/columns/deepseek-alpha-deepseek-alpha-finance-en/) |
| DeepSeek's hardware DNA | [딥씨크의 하드웨어 최적화 DNA](https://docs.vibequant.cc/columns/deepseek-v4-deepseek-column-ko/) | [DeepSeek's Hardware Optimization DNA](https://docs.vibequant.cc/columns/deepseek-v4-deepseek-column-en/) |
| GPU compute futures | [GPU 연산 능력은 거래된다](https://docs.vibequant.cc/columns/ai-revolution-gpu-ko/) | [GPU Compute Is Now Traded](https://docs.vibequant.cc/columns/ai-revolution-gpu-compute-is-now-traded-en/) |
| Bitcoin flow analysis | [7월 20일 비트코인 하락](https://docs.vibequant.cc/columns/bitcoin-btc-20260720-decline-analysis/) | [July 20 Bitcoin Decline](https://docs.vibequant.cc/columns/bitcoin-btc-20260720-decline-analysis-en/) |

*Not investment advice. Everything in this section is for informational purposes only.*

---

## Section 3 — Web3/Security: Four Incidents This Week

### 1. North Korea: insiders robbed their own central bank

**[CTI-2026-0726-DPRK-BANK-HACKERS](https://cti.vibequant.cc/cti/cti-2026-0726-dprk-bank-hackers-en/)** · TLP:GREEN · Severity MEDIUM

Reporting by Daily NK citing anonymous sources in Pyongyang. An elite hacking group trained by the North Korean state allegedly penetrated the internal networks of the DPRK central bank and the Foreign Trade Bank and siphoned off funds; state security agents arrested them at a Pyongyang safehouse on July 12. The money was reportedly laundered through overseas crypto wallets, cashed out via Chinese brokers, and smuggled back through couriers in border cities such as Sinuiju and Hyesan.

**Comment**: Two things need to be separated. First, the "$2 billion hackers" in the headlines is **not the loss from this incident.** Chainalysis put total DPRK-linked crypto theft worldwide at roughly $2 billion for 2025; the size of this particular case is unconfirmed. Second, the reporting is **not independently verified.** It still matters, because unlike the established Lazarus and Kimsuky pattern of targeting foreign entities, the claim that **operatives the regime trained turned on the regime's own vault** could be an indicator of cracks in internal control. Observations that North Korean internet use was partially cut for about a week from around July 12 and that DPRK-origin intrusion attempts dropped sharply can be read as a corroborating signal.

### 2. An admin key inside camera firmware — the Hanwha Vision GitHub token exposure

**[CTI-2026-0728-HANWHA](https://cti.vibequant.cc/cti/cti-2026-0728-hanwha-en/)** · TLP:GREEN

A researcher analyzing Hanwha Vision network camera firmware found the same GitHub personal access token in roughly 30 files of the web management UI build output. That token carried **admin privileges across hundreds of repositories in Hanwha's GitHub organization**. The cause: a Vite build configuration bound an environment variable to the entire `process.env` object, so the CI job's full environment was written verbatim into the client bundle.

**Comment**: This is the same theme as Section 1. The firmware was protected by two layers of encryption — a model-name-derived passphrase, plus an AES key obfuscated by XOR inside the binary. The researcher **handed the binary analysis to Ghidra and Claude Code and went to dinner.** By the time they came back, the decryption logic and a complete root filesystem were waiting.

> **The economics of obfuscation have changed.** Obfuscation was never a device for stopping attackers; it was a device for boring them into giving up. Now an LLM endures the boredom on their behalf.

Hanwha **revoked the token within 12 hours** of the report and responded to questions about US Department of Defense IP ranges with specific evidence, prompting the researcher to correct the original post. **The response itself is worth holding up as a benchmark for Korean vendors.** What remains unpublished is whether the root cause — the build configuration — was fixed. The question every embedded and IoT vendor should be asking today is simple: **is your secret scanning looking only at the source repository and not at the build output?**

### 3. Eavesdropping while you game — ScarCruft targeted the North Korean defector community

**[Monthly JoongAng contribution · 2026.07.23](https://docs.vibequant.cc/columns/media-security-2026-07-23/)**

Analysis of an ESET report finding that ScarCruft compromised the Yanbian gaming platform sqgame to track North Korean defectors, covering the targeting of hwp and p12 files and the concentration of audio recording in evening hours.

**Comment**: The gaming platform was not an accidental vector. **The people most in need of surveillance protection were gathered in the place with the smallest security budget.** A recording schedule concentrated in the evening means the operation was after not what the target *does* but *who the target is with*. Any organization running a community platform should re-examine the fact that its user composition is itself an input to the threat model.

### 4. [Exclusive] The Foreign Ministry knew of a data breach and waited three months to report it

**[Donghaeng Media Sidae · 2026.07.22](https://docs.vibequant.cc/columns/media-security-2026-07-22-3/)**

Exclusive reporting, with commentary, on the fact that personal data exposure from the Korea National Diplomatic Academy hack was known in April but not reported to the Personal Information Protection Commission until July 19.

**Comment**: **The reporting delay is the more serious matter, more than the breach itself.** As covered in the earlier [analysis of the National Diplomatic Academy hack](https://docs.vibequant.cc/columns/national-diplomatic-academy-hacking-incident-national-diplomatic-academy-hacking/), the intrusion began in April–May 2025 and continued into February 2026 — roughly ten months — and the ministry did not detect it on its own. Add a three-month notification delay and you have **a detection failure and a notification failure stacked on top of each other**. Set beside the 12-hour response in the Hanwha Vision case above, the contrast is stark: what the private sector does in twelve hours, the public sector is taking three months to do.

---

## Closing — Liang Wenfeng's AI Strategy: Restraint as the Most Radical Choice

**[Liang Wenfeng's AI Strategy: Reading DeepSeek's Path to AGI Through Four Hours and 52 Statements](https://docs.vibequant.cc/columns/deepseek-v4-liangwenfeng-deepseek-agi/)** (2026.07.23)

In mid-May 2026, DeepSeek held an online investor meeting over Tencent Meeting — four hours, two attendees permitted per institution. Liang Wenfeng was not a polished speaker and did not talk fast. Yet that plainness stayed with attendees. Across the 52 statements compiled from that day, the words that recurred most were **model, cost, AGI, time, open source**.

### Summary: five threads

**1) Roots — from quant to AGI.** His logic is continuity, not rupture. Technical quant (historical price and volume) → fundamental quant (financial and economic information) → whole-market AI comprehension (the underlying rules of the world) → AGI. If the ultimate goal of quantitative investing is to make a machine understand every piece of information that moves asset prices, that is essentially the same as **making a machine understand the world**. High-Flyer founding DeepSeek was not a change of career but the next step in that chain.

**2) Roadmap — CoT → Agent → continual learning → singularity → embodiment.** What AI lacks now is not taste or intuition but **the ability to learn continuously**. Humans keep learning; AI has to be handed the entire context again for every task. That is why AI cannot yet replace an employee. Once continual learning works, AI accelerates AI research — and embodied intelligence comes after that.

**3) Restraint (less is more) is a strategy, not a virtue.** No 3D, no video generation, no world models. No super app. Even multimodality is "just one component, not the main line, not intelligence itself." Hallucination is classified internally as a *product* problem.

> "My top priority is not to take a bigger slice of the pie, but to raise the probability that we succeed at all."
> "If your vision is to take more for yourself, you have already lost."

**4) The economics of open source and low cost.** Low cost is a result, not a goal — **because the lower the cost, the larger the model you can train**. Large companies solve problems by pouring in more resources; for those with finite resources, efficiency *is* the precondition for scale. "The product is just a byproduct of the journey toward AGI."

**5) Capital — take the money, don't change direction.** In the early days he declared three refusals: no outside funding, no equity dilution, no binding to anyone's commercialization schedule. For three years he personally turned down approaches from Tencent and Alibaba. He shifted in April–May 2026 as US–China competition intensified and GPU export controls tightened, but the principle held.

> "We need money. But we will not change direction for money." (我们要钱，但不会为了钱改变方向)

He put roughly 20 billion yuan of his own capital in to secure about 40% ownership. The purpose was not return but **control** — because the open-source strategy is only safe from being overturned if control is secured. Tencent, JD.com and others accepted **no voting rights and no exit within five years** despite committing large sums.

### Three companies, similar money, different directions

| | DeepSeek | Anthropic | OpenAI |
|---|---|---|---|
| Route | Open source, low price, capital-light | Closed, high valuation, capital-heavy | Scale, conversion, revenue |
| Nature of the raise | Buying *time* for AGI | Securing safety and infrastructure | Accelerating commercialization |
| Relationship to capital | Founder holds the direction | Tied to Big Tech and GPU contracts | Large raises, governance restructuring |

**The point is direction, not size.** DeepSeek's money is not spent creating an exit for capital. It is spent maintaining open source and low prices, keeping the team stable, and walking the AGI roadmap on that foundation.

### Why this story closes the inaugural issue

All three sections of this issue were variations on the same question.

- **Section 1**: Open weights are a fight over who captures the profit from AI.
- **Section 2**: The market is now paying a premium to the side that spent less, not more.
- **Section 3**: Defenders respond in twelve hours; the attacker made 17,600 attempts in four and a half days.

What runs through all three is the proposition that **direction matters more than size**. That is ultimately what Liang Wenfeng spent four hours saying: not doing more, but deciding what not to do. The more capital runs wild, the more this instinct becomes a source of alpha.

Which brings me back to a sentence I keep writing.

> **An LLM is a spreadsheet for calculation, not an oracle.**

A spreadsheet computes the formula you give it. It does not ask whether that formula will destroy your company. The same holds whether the model is open-weight or closed, benchmark leader or not. Judgment is still yours. What this newsletter tries to do is not hand you the answer, but **assemble the material for judgment and send it every week**.

---

## Principal Sources

| Topic | Source |
|---|---|
| Hugging Face breach forensics | Hugging Face, "Anatomy of a Frontier Lab Agent Intrusion" (2026-07-27) |
| Modal Labs secondary victim | Reuters · Bloomberg · Axios (2026-07-28 to 29) |
| Kimi K3 weight release | Moonshot AI official Hugging Face repository and technical report (2026-07-27) |
| US open-weight regulatory debate | WSJ; joint statement by 25 Big Tech firms and VCs; Bloomberg (Jensen Huang remarks, 2026-07-28) |
| Apple / Nvidia market cap | CNBC (2026-07-27), Forbes (2026-07-28) |
| Michael Burry positions | Burry Substack; Bloomberg (2026-07-17); TheStreet |
| Semiconductor sector data | Goldman Sachs and Morgan Stanley research (see references in the linked columns) |

---

## Go Deeper

| Channel | Contents | Link |
|---|---|---|
| **VibeQuant** | Main hub | [vibequant.cc](https://vibequant.cc/) |
| **Columns** | 295 investment columns and media contributions (KO/EN/JA/ZH) | [docs.vibequant.cc/columns](https://docs.vibequant.cc/columns/) |
| **CTI** | Cyber threat intelligence reports | [cti.vibequant.cc/cti](https://cti.vibequant.cc/cti/) |
| **Tech** | Technical documentation and open-weight model comparisons | [tech.vibequant.cc/tech](https://tech.vibequant.cc/tech/) |
| **Research** | SSRN working papers | [vibequant.cc/research](https://vibequant.cc/research/) |
| **Lab** | Quant laboratory | [vibequant.cc/lab](https://vibequant.cc/lab/) |
| **Essay** | A·B·C (Art, Book, Culture) essays | [vibequant.cc/essays](https://vibequant.cc/essays/) |
| **GitHub** | vibe-investing (317★) — quant scripts and technical docs | [github.com/gameworkerkim/vibe-investing](https://github.com/gameworkerkim/vibe-investing) |
| **GitHub** | CYBER-THREAT-INTELLIGENCE-REPORT | [github.com/gameworkerkim](https://github.com/gameworkerkim) |

---

**Dennis Kim (김호광)** — Former CEO of Cyworld · CEO, Betalabs Inc. · Microsoft Azure MVP (2015–2023, nine consecutive years) · ORCID 0009-0002-0962-2175
Researching and investing at the intersection of cyber threat intelligence, AI-driven quantitative investing, and Web3.

*This newsletter is for informational purposes only and is not investment advice. It does not recommend the purchase or sale of any security. Figures and events cited are based on public sources as of the publication date and may change thereafter.*

*Not investment advice. © 2026 Dennis Kim*
