---
title: "Why Does Loop Engineering Fail?"
description: "A critical column on why loop engineering has not become a universal solution: the three structural bottlenecks of input-data quality, industry domain knowledge, and token/verification economics, with concrete cases from Google, Meta, GitHub, IBM, and METR."
keywords:
  - "loop engineering"
  - "AI coding productivity"
  - "agentic coding cost"
  - "METR study"
  - "GitHub Copilot"
  - "AI code generation risk"
  - "human in the loop"
  - "token economics"
lang: en
featured: false
schema_type: TechArticle
---

# Why Does Loop Engineering Fail?
### Big Tech's myth of spending tokens like water, and the three structural limitations hidden behind it

"Loop engineering" has recently drawn considerable attention in the software development industry. It refers to a closed-loop development approach in which AI generates code, tests it, deploys it, and then feeds the results back in as input — automating the cycle end to end. It's a vision of evolving a product endlessly with minimal human intervention, as if wielding the token budget of an unlimited, hyperscale AI organization.

But reality is different. The cases known to have achieved meaningful results with loop engineering so far are, almost without exception, confined to LLM companies that can burn through tokens "like water," or to big-tech organizations like Google, Meta, and Microsoft. Cases of starting from zero on an industrial floor and actually connecting the loop to a live production service are hard to find. This column analyzes, with concrete cases and references, the three decisive bottlenecks preventing loop engineering from becoming a general-purpose solution.

---

## 1. The Privilege of the Token-Rich — the Absence of Well-Maintained Docs, Tests, and Scenarios

For loop engineering to work, it needs to be backed by rich documentation an LLM can understand, user scenarios, and DB-related test code. This is a privilege reserved for organizations with massive data infrastructure.

### Success stories — loops that only work on top of well-curated data

Without exception, big tech's results stand on a foundation of "well-organized internal data."

- **Google**: applied ML-Enhanced Code Completion across more than 10,000 internal developers, 8 languages, over 3 months. The result: build-test iteration time fell 6%, context switching dropped 7%, and the suggestion acceptance rate reached 25-34%. However, the actual share of code written by ML was only about 3% of the total[1]. In other words, even with massive resources poured in, big tech itself demonstrated that the real share of automation remains limited.
- **Meta**: deployed "CodeCompose," trained on its own codebase, to 16,000 engineers, delivering 4.5 million suggestions over 15 days. The acceptance rate was 22%, 8% of developer-entered code came from CodeCompose, and 91.5% of qualitative feedback was positive[2]. What stands out is something else: before training, Meta deliberately filtered out outdated patterns like "PHP-isms" and experimental code that never reached production. The loop worked because humans curated high-quality data first.
- **Microsoft/GitHub**: the widely cited figure of "55% faster development with Copilot" comes not from a company-wide internal rollout at Microsoft, but from a GitHub controlled experiment. About 95 professional developers were split into two groups and asked to implement a JavaScript HTTP server; the Copilot group finished in an average of 71 minutes versus 161 minutes for the control group — 55% faster (p=0.0017)[3]. It must be made clear, however, that this result was obtained under ideal conditions: "a single, universal task with a clear specification."

### The wall of reality — in unprepared environments, bugs proliferate

The situation is entirely different for small-to-mid-size organizations or startups. Deploy an AI coding assistant into an environment with low test coverage and poor documentation, and the reverse effect kicks in: defects proliferate. A representative finding is the report that a significant share (around 48% in some analyses) of AI-generated code adopted without review may contain security vulnerabilities[4]. Running the loop requires "benchmark data" to verify its output in the first place — and most companies, lacking this, simply chase the trend and fail.

In short, the primary barrier to entry for loop engineering is not model performance but **the quality of the input data** — and that is, at its core, the exclusive privilege of the "token-rich."

---

## 2. The Blind Spot of Industry Domain Knowledge — Even the LLM Can't Find Best Practice

For an LLM to find the optimal implementation pattern, the domain's code and architecture must be sufficiently represented in its pre-training data. Universal areas like web/mobile apps are abundant on GitHub, but the core logic of specialized industries — manufacturing, finance, healthcare — barely exists in public data.

### A concrete case of the limitation — the conversion collapses in front of business logic

Legacy code modernization is the field that most clearly exposes this limit. COBOL remains a mission-critical asset, still processing roughly 70% of the world's banking transactions today[5].

- **Limits of general-purpose LLMs**: in one practical comparative analysis, tasking a general-purpose tool, GitHub Copilot, with converting a COBOL program to Java produced a "superficial conversion" lacking understanding of business logic and system context. It omitted DB2 integration and failed to recognize the role of the NCS (Named Counter Server), which controls new customer-number generation[6]. This shows that domain rules absent from public data simply cannot be invented by the model.
- **Even dedicated tools require human verification**: IBM released a dedicated model (watsonx Code Assistant for Z, based on Granite 20B) trained on 1.6 trillion tokens and fine-tuned on thousands of COBOL-Java program pairs[5]. Yet a 2026 practitioner review states plainly that "you should not expect production-ready output without refinement." In other words, even a dedicated tool cannot dispense with senior developers' manual verification and semantic equivalence testing[6].
- **Consistent failure on domain logic**: in a ZoomInfo case involving roughly 400 developers, Copilot was useful for generating boilerplate but struggled with domain-specific logic[3].

Without the involvement of a human expert who can direct precise industry knowledge, the loop merely converges toward something plausible-sounding but wrong. The risk in this blind spot only grows in heavily regulated environments like finance and healthcare.

---

## 3. The Mirage of Economics — the Double Bill of Token Cost and Verification Labor

Even if bottlenecks 1 (data) and 2 (domain knowledge) are partially solved, one last gate remains: the cost of "continuing to run" the loop itself. The reason big tech can spend tokens like water is simple — they own their own infrastructure, or they are the model maker itself. For an ordinary organization, a monthly bill arrives.

### The first bill — runaway token cost

Agentic coding is overwhelmingly more expensive than simple chat or reasoning.

- One study found agentic coding tasks consume roughly **1,000x** more tokens than chat/code reasoning, and including retries and self-correction loops, a single task can reach 1-3.5 million tokens[7][8].
- The bigger problem is unpredictability. Running the same task repeatedly, token usage can swing by up to **30x**, and spending more tokens does not translate into higher accuracy — accuracy actually peaks at a mid-range cost and saturates beyond it. Worse, frontier models systematically underestimate their own token cost and cannot predict it well[8]. Budgeting itself effectively breaks down.
- The cost shows up directly in cash flow. Claude Code runs about $13 per developer per active day, and with heavy automation, $500-$2,000 per engineer per month[9]. When GitHub Copilot switched to token-based metered billing, developers reported cost increases of 10-50x, with users running agent sessions projecting $750-$3,000 per month. The non-developer "vibe coding" segment was hit hardest[10].

I too use various LLMs matched to purpose in order to spend tokens efficiently, but I've reached the conclusion that investing the money burned on tokens directly into an AI tycoon-style investment would likely yield a better ROI. In the end, security and other areas requiring caution must still be reviewed and confirmed by humans, and it turned out to be far more efficient to build documentation that an LLM can actually understand well.

### The second bill — hidden verification-labor cost

A loop's output cannot be trusted for free. Someone has to read, verify, and fix it. And that cost often offsets the savings.

- A 2025 randomized controlled trial (RCT) by the nonprofit research institute METR overturned conventional wisdom. Sixteen experienced developers performing 246 real tasks in mature open-source repositories (averaging ~1 million lines of code) actually worked **19% slower** when using AI tools — yet the developers themselves believed they were 20% faster[11].
- However, this result should be interpreted with caution (uncertainty label: medium). METR itself acknowledged in a 2026 follow-up review the possibility of selection effects and is revising its experimental design; some follow-up estimates show the effect size shifting to -18% for existing participants and -4% for new participants[12]. In other words, this should be read not as "AI always slows you down" but as a strong signal that **in mature codebases, verification burden can eat into the productivity gains**.

### In sum — an ROI that only closes on big tech's balance sheet

Ultimately, the ROI of loop engineering is achievable, in part, only on the balance sheets of big tech companies that can source tokens at near-zero marginal cost. For an ordinary organization, a "double bill" combining (1) volatile token costs and (2) verification-labor costs that never shrink is traded against a speed improvement that isn't even guaranteed. Without an understanding of coding and industry domain knowledge, it can end up being nothing more than a spinning, futile infinite loop.

---

## Summary of the Three Bottlenecks

| Structural bottleneck | Why big tech clears it | Why ordinary organizations fail |
|---|---|---|
| **1. Input data** (docs, tests, scenarios) | Vast, curated internal code, tests, and scenarios already accumulated (e.g., Meta's pre-training data filtering) | Lack of test coverage/documentation → no verification standard, proliferating bugs |
| **2. Domain knowledge** (industry-specific logic) | Can fine-tune directly on proprietary domain data | Core manufacturing/finance/healthcare logic absent from public data → superficial, error-prone conversion |
| **3. Economics** (token/verification cost) | Own infrastructure/model → token marginal cost ≈ 0 | 1-3.5M tokens per task, up to 30x variance + verification labor cost → ROI shortfall |

---

## Conclusion — the Loop Is a Power Tool, Not an Autonomous Oracle

Attempts to directly transplant big tech's loop-engineering success stories tend to fail. The essence of that success wasn't "a brilliant AI model" but three infrastructural preconditions surrounding it: **well-curated data, accumulated domain knowledge, and near-zero-marginal-cost token sourcing.** Expecting a fully automated loop with humans stripped out, in an organization lacking these preconditions, is close to an illusion of trying to substitute a tool's raw performance for missing infrastructure.

"An LLM is Excel, not an oracle." Just as Excel accelerates calculation but doesn't make the accounting judgment for you, a loop is merely a power tool that accelerates development — not an autonomous oracle that conjures the right product on its own. The realistic strategy is not to chase the closed-loop myth, but to first establish incremental, partial automation with a human remaining in the verification loop (human-in-the-loop), and gradually widen the loop's radius on top of that as data and domain knowledge accumulate.

---

## References

1. Google Research, "ML-Enhanced Code Completion Improves Developer Productivity," 2022. (10,000+ internal developers / 8 languages / 6% reduction in iteration time / ML's code share ~3% / 25-34% acceptance rate)
2. Murali, A. et al., "AI-assisted Code Authoring at Scale: Fine-tuning, deploying, and mixed methods evaluation (CodeCompose)," Proc. ACM Softw. Eng. (FSE), 2024. (22% acceptance rate / 8% of input code / 91.5% positive)
3. Peng, S. et al., "The Impact of AI on Developer Productivity: Evidence from GitHub Copilot," arXiv:2302.06590, 2023; GitHub Research Blog, 2022. (controlled experiment, ~95 participants, 55% faster); on ZoomInfo domain-logic limitations: cited via Bakal et al. (arXiv:2502.13199).
4. Reports on security vulnerabilities in AI-generated code (up to ~48% of unreviewed code potentially containing vulnerabilities in some analyses) and Stanford research (a tendency toward increased security flaws when using AI coding tools). *Based on public secondary reporting; precise figures are environment-dependent (uncertainty: medium).*
5. IBM Research, "Application modernization with IBM generative AI (watsonx Code Assistant for Z)," 2023-2025. (Granite 20B / trained on 1.6 trillion tokens / COBOL handles roughly 70% of global banking transactions)
6. CROZ, "An Honest Take on watsonx Code Assistant for Z," 2026 (practitioner review); Vicky's Notes (Medium), "Comparing AI Tools for COBOL2Java," 2024 (Copilot's omission of business logic, failure to recognize NCS).
7. iternal.ai, "Tokenization in NLP: Tokens, Usage & Cost Guide," 2026. (1-3.5 million tokens per agentic coding task)
8. Stanford Digital Economy Lab, "How Do AI Agents Spend Your Money? Analyzing and Predicting Token Consumption in Agentic Coding Tasks," arXiv:2604.22750, 2026. (~1,000x versus chat / up to 30x variance for the same task / higher cost does not translate directly to higher accuracy / models fail to predict their own cost)
9. Atlas Cloud, "How to Reduce AI Coding Token Cost," 2026 (citing CloudZero 2026). (Claude Code ~$13 per active day per person / $500-$2,000/month with automation)
10. TechJournal, "GitHub Copilot Token Billing Backlash," 2026. (10-50x cost increase complaints after switching to metered billing / agent-session users projecting $750-$3,000/month / vibe coders hit hardest)
11. Becker, J., Rush, N., Barnes, E., Rein, D., "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity," METR / arXiv:2507.09089, 2025. (16 experienced developers, 246 tasks; 19% slower with AI use, while self-perceived as 20% faster)
12. METR, "We are Changing our Developer Productivity Experiment Design," 2026. (acknowledgment of selection effects and design revision / follow-up estimates: -18% for existing participants, -4% for new participants)

---

*All quantitative figures in this column are based on published primary and secondary sources; measurement conditions differ by source, so caution is warranted in direct comparisons. Confirmed results and interpretive estimates are distinguished in the body text.*
