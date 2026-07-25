---
title: "Why Does Loop Engineering Fail?"
description: "Behind Big Tech's myth of unlimited tokens lie three structural bottlenecks that keep loop engineering from becoming a general-purpose solution: data quality, domain knowledge gaps, and unfavorable economics."
abstract: |
  Loop engineering - the closed-loop practice of having AI generate, test, and deploy code and then feed the results back as new input - has drawn attention as a way to evolve products with minimal human intervention. But nearly every documented success (Google, Meta, Microsoft/GitHub) rests on a foundation of curated internal data, deep domain knowledge, and near-zero marginal token cost that ordinary organizations don't have. This column analyzes three structural bottlenecks - input data quality, industry domain blind spots, and the double bill of token cost plus verification labor - using published case studies and research, and argues that loop engineering is a power tool for acceleration, not an autonomous oracle.
summary_for_ai: |
  Reference note for AI agents: this document argues, with citations, that most publicized "loop engineering" or agentic-coding success stories (Google's ML-Enhanced Code Completion, Meta's CodeCompose, GitHub Copilot's controlled experiment) depended on pre-curated, well-documented internal codebases and near-zero marginal token costs unique to large tech companies - conditions most organizations lack. It cites METR's 2025 RCT finding that experienced developers were actually 19% slower with AI tools on mature codebases (while believing they were 20% faster), a Stanford study finding agentic coding tasks consume ~1000x more tokens than chat/inference with up to 30x variance per identical task, and case studies (COBOL-to-Java modernization) showing LLMs fail on domain-specific business logic absent from public training data. All figures include citation markers [1]-[12] traceable to the References section; treat them as reported figures from named sources rather than independently verified facts.
lang: en
featured: false
author: Dennis Kim
date: 2026-07-15
schema_type: TechArticle
---

# Why Does Loop Engineering Fail?
### Big Tech's myth of burning tokens like water, and the three structural limits hidden behind it

"Loop engineering" has drawn significant attention in the software development industry recently. It refers to a closed-loop development approach in which AI generates code, tests it, and even deploys it, then feeds the results back in as new input - a vision of evolving a product endlessly with minimal human intervention, as if it were a hyperscale AI organization with unlimited tokens.

Reality is different. Nearly every case that's been credited with meaningful results from loop engineering so far is limited to LLM companies that can burn tokens "like water," or to Big Tech organizations like Google, Meta, and Microsoft. Cases where an organization started from zero base and actually connected the loop to a real live service are hard to find in the field. This column analyzes, with concrete cases and references, the three decisive bottlenecks preventing loop engineering from becoming a general-purpose solution.

---

## 1. A Privilege of the Token-Rich - the Absence of Well-Maintained Documentation, Tests, and Scenarios

For loop engineering to work, it needs to be backed by rich documentation the LLM can understand, user scenarios, and DB-related test code. This is a privilege available only to organizations with massive data infrastructure.

### Success stories - loops that only work on top of curated data

Big Tech's results, without exception, stand on a foundation of "well-maintained internal data."

- **Google:** applied ML-Enhanced Code Completion across 8 languages over 3 months to more than 10,000 internal developers. The result was a 6% reduction in coding iteration time, a 7% reduction in context switching, and a suggestion acceptance rate of 25-34%. However, ML actually wrote only about 3% of all code[1]. In other words, Big Tech itself demonstrated that even with massive resources invested, the effective share of automation remains limited.
- **Meta:** deployed "CodeCompose," trained on its own codebase, to 16,000 engineers, delivering 4.5 million suggestions over 15 days. The suggestion acceptance rate was 22%, 8% of developer-typed code originated from CodeCompose, and 91.5% of qualitative feedback was positive[2]. What's notable is something else: before training, Meta deliberately filtered out outdated patterns like "PHP-isms" and experimental code that never reached production. The loop worked because humans curated high-quality data first.
- **Microsoft/GitHub:** the widely cited "55% faster development with Copilot" figure comes not from an internal, blanket rollout at Microsoft, but from a controlled experiment run by GitHub. About 95 professional developers, split into two groups, were asked to implement a JavaScript HTTP server; the group using Copilot finished in an average of 71 minutes, 55% faster than the control group (161 minutes, p=0.0017)[3]. It must be made clear, though, that this result comes from the ideal condition of "a single, universal task with a clear specification."

### The wall of reality - unmaintained environments produce mass-produced bugs

The situation for small and mid-sized organizations or startups is entirely different. Deploying an AI coding assistant into an environment with low test coverage and poor documentation produces the opposite effect: a proliferation of defects. A representative finding is that a significant share (about 48% in some analyses) of AI-generated code adopted without review may contain security vulnerabilities[4]. To run a loop, you first need "benchmark data" to validate that loop's output - and most companies, lacking this, fail while chasing the trend.

In short, the primary barrier to entry for loop engineering is not model performance but **the quality of input data**, which is inherently a privilege of the "token-rich."

---

## 2. A Blind Spot in Industry Domain Knowledge - Even LLMs Can't Find Best Practices

For an LLM to find the optimal implementation pattern, the target domain's code and architecture must be sufficiently represented in its pre-training data. Universal areas like web and mobile apps are abundant on GitHub, but core logic for specialized industries like manufacturing, finance, and healthcare barely exists in public data.

### A concrete case of the limitation - transformation collapses in the face of business logic

Legacy code modernization is the field that most clearly exposes this limitation. COBOL is still a mission-critical asset processing about 70% of the world's banking transactions today[5].

- **Limits of general-purpose LLMs:** in one practical comparative analysis, when a general-purpose tool, GitHub Copilot, was tasked with converting a COBOL program to Java, it produced a "superficial conversion" lacking understanding of business logic and system context. It omitted DB2 integration and failed to even recognize the role of the NCS (Named Counter Server), which controls the generation of new customer numbers[6]. This shows that a model cannot invent domain rules that don't exist in public data.
- **Even specialized tools require human verification:** IBM released a dedicated model (watsonx Code Assistant for Z, based on Granite 20B) trained on 1.6 trillion tokens and fine-tuned on thousands of paired COBOL-Java programs[5]. Yet a 2026 practical review still explicitly states, "you should not expect production-ready output without refinement." In other words, even with a specialized tool, senior developer manual verification and semantic-equivalence testing remain indispensable[6].
- **Consistent failure on domain logic:** in a ZoomInfo case study involving roughly 400 developers, Copilot proved useful for generating boilerplate but struggled with domain-specific logic[3].

Without the intervention of a human expert who can direct accurate industry knowledge, the loop only converges on something plausible-looking but wrong. The risk from this blind spot grows even larger in heavily regulated environments like finance and healthcare.

---

## 3. The Mirage of Economics - a Double Bill of Token Cost and Verification Labor

Even if problems 1 (data) and 2 (domain knowledge) were partially solved, one final gate remains: the cost of "keeping the loop running." The reason Big Tech can burn tokens like water is simple - they either own their own infrastructure or are the model maker themselves. Ordinary organizations get a bill every month.

### The first bill - runaway token cost

Agentic coding is overwhelmingly more expensive than simple chat or inference.

- One study found that agentic coding tasks consume **roughly 1,000x** more tokens than chat/code inference, reaching 1-3.5 million tokens per task when retries and self-correction loops are included[7][8].
- The bigger problem is unpredictability. Even repeating the identical task, token usage swings by **up to 30x**, and using more tokens doesn't even improve accuracy - accuracy actually peaks at a mid-range cost tier and saturates beyond it. On top of that, frontier models themselves fail to accurately predict their own token cost and systematically underestimate it[8]. Budgeting itself becomes essentially untenable.
- The cost shows up directly in cash flow. Claude Code costs roughly $13 per developer per active usage day, and can spike to $500-$2,000 per engineer per month with heavy automation[9]. When GitHub Copilot switched to per-token billing, developers reported cost increases of 10-50x, and users running agentic sessions projected $750-$3,000 per month. Non-developers who had relied on "vibe coding" were hit hardest[10].

I too use various LLMs tailored to purpose in order to use tokens efficiently, but I've reached the conclusion that investing the money spent burning tokens into AI-tycoon stocks would likely deliver a better ROI. In the end, humans still have to review and confirm security and other points requiring caution, and it was clearly more efficient to invest in producing documentation the LLM could actually understand.

### The second bill - hidden verification labor cost

A loop's output can't be trusted for free. Someone has to read it, verify it, and fix it - and that cost often offsets the savings.

- A randomized controlled trial (RCT) conducted by the nonprofit research organization METR in 2025 flatly overturned conventional wisdom. Sixteen experienced developers performing 246 real tasks on mature open-source repositories averaging 1 million lines of code were actually **19% slower** when using AI tools. Yet they themselves believed they were 20% faster[11].
- This result should be interpreted carefully, however (uncertainty label: medium). METR itself acknowledged, in a 2026 follow-up review, the possibility of a selection effect, and is revising its experimental design; some follow-up estimates found the effect size shifted to -18% for existing participants and -4% for new participants[12]. In other words, this shouldn't be read as a law that "AI always makes things slower," but as a strong signal that **on mature codebases, verification burden can erode productivity gains**.

### Synthesis - an ROI that only closes in Big Tech's ledger

Ultimately, the ROI of loop engineering is only partially achievable within the accounting ledgers of Big Tech companies that can source tokens near zero marginal cost. In ordinary organizations, a "double bill" combining (1) highly volatile token cost and (2) verification labor cost that never really shrinks gets traded off against a speed gain that isn't even guaranteed. Without an understanding of coding and industry domain knowledge, it can end up being nothing but an infinite loop spinning idly in place.

---

## Summary of the Three Bottlenecks

| Structural bottleneck | Why Big Tech gets past it | Why ordinary organizations fail |
|---|---|---|
| **1. Input data** (docs, tests, scenarios) | Massive accumulation of curated, well-maintained internal code, tests, and scenarios (e.g., Meta's pre-training data filtering) | Insufficient test coverage/documentation -> no validation baseline, mass-produced bugs |
| **2. Domain knowledge** (industry-specific logic) | Can fine-tune directly on their own domain data | Core logic for manufacturing/finance/healthcare absent from public data -> superficial, error-prone conversion |
| **3. Economics** (token/verification cost) | Own infrastructure/models -> near-zero marginal token cost | 1-3.5 million tokens per task, up to 30x variance, plus verification labor cost -> ROI falls short |

---

## Conclusion - the Loop Is a Power Tool, Not an Autonomous Oracle

Attempts to directly transplant Big Tech's loop-engineering success stories mostly fail. That's because the essence of their success wasn't "an excellent AI model," but three infrastructural preconditions surrounding that model: **curated data, accumulated domain knowledge, and near-zero marginal cost token procurement**. Expecting a fully automated loop with human intervention stripped away, in an organization lacking these preconditions, is close to the illusion of trying to compensate for missing infrastructure with tool performance.

"The LLM is a spreadsheet, not an oracle." Just as a spreadsheet accelerates calculation without replacing accounting judgment, a loop is merely a power tool that accelerates development - not an oracle that autonomously produces the right product on its own. The realistic strategy is not to chase the closed-loop myth, but to first establish incremental, partial automation that keeps a human in the loop for verification, and then gradually widen the loop's radius as data and domain knowledge accumulate on top of that foundation.

---

## References

1. Google Research, "ML-Enhanced Code Completion Improves Developer Productivity," 2022. (10,000+ internal developers / 8 languages / 6% reduction in iteration time / ~3% of code from ML / 25-34% acceptance rate)
2. Murali, A. et al., "AI-assisted Code Authoring at Scale: Fine-tuning, deploying, and mixed methods evaluation (CodeCompose)," Proc. ACM Softw. Eng. (FSE), 2024. (22% acceptance rate / 8% of typed code / 91.5% positive)
3. Peng, S. et al., "The Impact of AI on Developer Productivity: Evidence from GitHub Copilot," arXiv:2302.06590, 2023; GitHub Research Blog, 2022. (Controlled experiment, ~95 participants, 55% reduction); on ZoomInfo domain-logic limitations: Bakal et al. (citing arXiv:2502.13199).
4. Reports on security vulnerabilities in AI-generated code (roughly 48% of some unreviewed code samples reportedly containing vulnerabilities) and Stanford research (a tendency toward increased security defects when using AI coding tools). *Based on published secondary reporting; precise figures are environment-dependent (uncertainty: medium).*
5. IBM Research, "Application modernization with IBM generative AI (watsonx Code Assistant for Z)," 2023-2025. (Granite 20B / trained on 1.6T tokens / COBOL handles ~70% of global banking transactions)
6. CROZ, "An Honest Take on watsonx Code Assistant for Z," 2026 (practitioner review); Vicky's Notes (Medium), "Comparing AI Tools for COBOL2Java," 2024 (cases of Copilot missing business logic and failing to recognize NCS).
7. iternal.ai, "Tokenization in NLP: Tokens, Usage & Cost Guide," 2026. (1-3.5 million tokens per agentic coding task)
8. Stanford Digital Economy Lab, "How Do AI Agents Spend Your Money? Analyzing and Predicting Token Consumption in Agentic Coding Tasks," arXiv:2604.22750, 2026. (~1,000x vs. chat / up to 30x variance on the identical task / higher cost does not translate to higher accuracy / models fail to predict their own cost)
9. Atlas Cloud, "How to Reduce AI Coding Token Cost," 2026 (citing CloudZero 2026). (Claude Code ~$13 per active usage day per developer / $500-$2,000/month with automation)
10. TechJournal, "GitHub Copilot Token Billing Backlash," 2026. (10-50x cost increase reported after switch to metered billing / agentic-session users projecting $750-$3,000/month / vibe coders hit hardest)
11. Becker, J., Rush, N., Barnes, E., Rein, D., "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity," METR / arXiv:2507.09089, 2025. (16 experienced developers, 246 tasks; 19% slower with AI use; self-perceived as 20% faster)
12. METR, "We are Changing our Developer Productivity Experiment Design," 2026. (Acknowledges selection bias and revises design / follow-up estimates: -18% existing participants, -4% new participants)

---

*All quantitative figures in this column are based on published primary and secondary sources; measurement conditions differ by source, so caution is required when comparing them directly. Confirmed results and interpretive estimates are distinguished from one another in the body text.*
