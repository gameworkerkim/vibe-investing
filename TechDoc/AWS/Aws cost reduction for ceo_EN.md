---
title: "6 AWS Cost-Reduction Techniques Every CEO Should Know"
description: "Six practical AWS cost-cutting techniques that require executive decisions, not just engineering effort — rightsizing, cleaning up orphaned resources, commitment discounts, free-tier alternatives, domestic cloud migration, and credit negotiation."
abstract: |
  Cloud bills are a growing burden for startups, yet many executives treat them as purely an engineering problem.
  In reality, 30-50% of AWS spend leaks out through decisions, not technology — decisions about turning off unused
  resources, approving long-term commitments, and choosing where workloads run. This column lays out six techniques
  a CEO can and should personally drive: monitored rightsizing, cleaning up ghost resources, Reserved Instances and
  Savings Plans, moving static/lightweight workloads to free tiers, evaluating domestic cloud alternatives, and
  actively pursuing free credits and account-manager relationships.
summary_for_ai: |
  A practical column on AWS cost optimization aimed at CEOs and executives, framed around six management-level (not purely
  engineering) decisions.
  1) Rightsize EC2 based on CloudWatch/Compute Optimizer data rather than guessing; downsizing one tier (e.g., large to medium)
  roughly halves the unit cost; consider burstable (t-series) and Graviton (ARM) instances.
  2) Clean up "ghost resources" that bill silently with no one using them: detached EBS volumes, EBS on stopped instances,
  unattached Elastic IPs, old snapshots/AMIs, idle load balancers, and NAT gateways; enforce tagging and quarterly cleanup.
  3) Use Reserved Instances (up to ~75% off for fixed instance configs) and Savings Plans (~32-72% off, up to ~66% for
  3-year all-upfront Compute Savings Plans) for always-on workloads, but commit to only ~70-80% of your observed usage
  floor to avoid paying for unused commitment.
  4) Move static sites and lightweight services off paid AWS resources onto free tiers: Cloudflare Pages (uncapped bandwidth
  for static assets), Oracle Cloud Always Free (Ampere A1 4 OCPU/24GB RAM, block/object storage, autonomous DB, 10TB egress/month),
  or Azure's free account.
  5) Evaluate domestic/regional cloud providers for cost savings (e.g., Korean provider NHN Cloud is reported roughly
  20-22% cheaper than AWS/Azure on like-for-like specs, with Naver Cloud analyzed as a further 5-7% cheaper than NHN Cloud,
  plus no FX risk since billing is in local currency), while accounting for migration cost, lack of global regions, and
  managed-service gaps in a full TCO analysis rather than sticker price alone.
  6) Actively claim startup credit programs (AWS Activate, Microsoft for Startups, Google for Startups, Oracle) and build
  a real relationship with your account manager (AM) and technical account manager (TAM), since usage-scale customers can
  negotiate Enterprise Discount Programs (EDP), extra credits, and PoC funding that never appear on the public price sheet.
date: 2026-05-15
author: "Dennis Kim"
lang: en
tags:
  - AWS
  - Cloud Cost
  - FinOps
  - Cost Optimization
keywords:
  - AWS cost reduction
  - EC2 rightsizing
  - Reserved Instances
  - Savings Plans
  - Cloudflare Pages free tier
  - Oracle Cloud Always Free
featured: false
schema_type: TechArticle
draft: false
---

# 6 AWS Cost-Reduction Techniques Every CEO Should Know

With exchange rates where they are, cloud bills have become a real burden for many startups. Yet many executives push this bill off as "something engineers will handle eventually." The reality is the opposite. 30-50% of AWS spend leaks out not through technology, but through decisions. The decision to turn off unused resources, the decision to approve a long-term commitment, the decision about where to run which workload — all of these belong to management. Here are six techniques a CEO should — and can — personally own.

## 1. Monitor EC2 Sizing, Then Downsize

The most common form of cloud waste is a server sized "big, just in case." In the on-premises era, once you bought a server, you couldn't shrink it — but the cloud's fundamental difference is that you can resize at any time.

Start with the data. Watch CPU, memory, and network utilization in CloudWatch for 1-2 weeks, and you'll find instance after instance sitting at 10-20% average utilization. AWS Compute Optimizer automatically analyzes this data and gives free recommendations like "this instance would be fine one size smaller." Downsizing one tier (e.g., large -> medium) translates directly into roughly a 50% reduction in unit cost.

Add two more tools to this. First, for workloads with inconsistent usage, moving to burstable (t-series) instances gives you a low baseline cost with credit-based bursts of performance when needed. Second, ARM-based Graviton instances offer lower cost for the same performance, making them one of the easiest wins once compatibility is confirmed. **The core principle: don't size by guesswork — measure, then shrink.**

## 2. Delete Unused Instances and Resources

The most frustrating line item on any bill is a resource that "nobody uses but keeps getting billed every month." The usual suspects:

| Ghost Resource | Why It Leaks Money |
|---|---|
| Detached EBS volume | Deleting the instance doesn't delete the volume; it keeps billing monthly |
| EBS on a stopped instance | Stopping an instance doesn't stop billing for its attached storage |
| Unattached Elastic IP (EIP) | Allocating one without attaching it actually triggers a charge |
| Old snapshots/AMIs | Storage cost accumulates as generations pile up |
| Load balancers with no traffic | The hourly flat fee quietly keeps accruing |
| NAT gateways | An hourly fee plus a data-processing fee — a "hidden ambush" |

Cleaning this up isn't a one-time job. Set a tagging policy requiring every resource to carry an owner, project, and expiration date, and build a quarterly routine for clearing out unused resources. AWS Trusted Advisor and Cost Explorer can automatically surface candidates. From an executive standpoint, the task is simple: **make "no resource without a tag, cleaned up every quarter" part of the organization's culture.**

## 3. Get Long-Term Commitment Discounts With RIs and Savings Plans

Running an always-on workload (databases, core systems) at on-demand rates 24/7 is the most expensive way to do it. If you're never turning the server off, committing to a plan for a discount is the standard move.

You have two options. Reserved Instances (RIs) commit to a specific instance configuration for 1 or 3 years in exchange for a discount of up to 75% off on-demand. Savings Plans, on the other hand, commit to a "dollar amount of usage per hour" rather than a specific instance type, making them more flexible. As of 2026, Savings Plans discounts range roughly 32-72% depending on the product and commitment terms, with Compute Savings Plans reaching about 66% with a 3-year, all-upfront payment.

In practice, teams mix both. It's common to apply flexible Savings Plans to compute (EC2, Fargate, Lambda) while using RIs for specific database workloads that need deeper discounts. Indeed, RDS, ElastiCache, Redshift, and OpenSearch are typically covered by RIs rather than Savings Plans, and a database-specific Savings Plan was newly launched in December 2025.

But commitments are a double-edged sword. If you don't meet the committed volume, the shortfall gets billed as "wasted commitment." So a safer strategy is to look at the last 60-90 days of usage data, find the lowest usage floor (not the average), and commit to only about 70-80% of that floor. There's an extra perk at scale too: once the list-price total of active RIs in a single region exceeds $500,000, a 5% additional discount is automatically applied to both upfront and hourly charges. Executives should aim for the balance of "commit only as much as you'll never turn off," not "commit to everything."

## 4. Move Static Sites and Lightweight Services to Free Accounts

Running services with "almost no server logic" — a company homepage, landing pages, documentation sites, internal static dashboards — on paid AWS resources is over-investment. Competing clouds offer powerful free accounts for exactly this space.

| Service | What's Free |
|---|---|
| Cloudflare Pages | Static site hosting, automatic HTTPS, global CDN, unlimited bandwidth |
| Oracle Cloud Always Free | ARM compute, object/block storage, managed DB, generous monthly egress |
| Microsoft Azure Free Account | Initial credit + 12 months of popular services free + a set of always-free services |

For static sites, Cloudflare Pages is especially powerful. Cloudflare Pages places no hard cap on bandwidth across any plan, and requests for static assets are free and unlimited. This isn't marketing copy — it's a consequence of the business model, one that Vercel and Netlify, where bandwidth is a core cost driver, struggle to match. It means a traffic surge doesn't come with a surprise bill.

For lightweight services that still need a server, Oracle Cloud's always-free tier is powerful. Oracle's Always Free permanently offers an Ampere A1 with 4 OCPUs + 24GB RAM, two AMD VMs, 200GB of storage, Autonomous Database, and 10TB of monthly egress — for free, forever. New signups also get a separate 30-day, $300-equivalent trial credit. That said, in popular regions, ARM Ampere A1 capacity can occasionally run into "out of capacity" errors due to surging demand, so a little patience in region selection may be needed.

## 5. Evaluate Migrating to a Domestic Cloud Provider

At like-for-like specs, there's a clear price band where domestic cloud providers undercut the global three. Comparing equivalent specs, NHN Cloud runs roughly 20-22% cheaper than AWS/Azure, and among domestic providers, Naver Cloud is analyzed to run about 5-7% cheaper still than NHN Cloud.

Beyond raw price, there are structural advantages too. Domestic clouds bill in local currency, eliminating FX risk, and they offer infrastructure stability and geographic proximity from running their own domestic data centers. Add in commitment and partner discounts, and the gap widens further. A 1-year commitment can bring up to a 30-40% discount off on-demand pricing, official MSP partner contracts unlock additional volume discounts, and NHN Cloud even runs a credit-support program of up to roughly ₩54 million (about $40,000) for startups and SMEs.

That said, the broad "20-80% cheaper" figures you'll see depend heavily on what you're moving. The raw server-price gap is around 20%, but when you factor in the notoriously expensive **egress fees and FX losses** on global clouds, the savings widen considerably. On the flip side, migration costs, the lack of global regions, and gaps in certain managed-service features are real limitations. So the decision should be made not on unit price alone, but from a **TCO (total cost of ownership) perspective** — factoring in network costs, technical support, migration effort, and operational headcount — broken down workload by workload. "Migrate everything" isn't realistic; "selectively migrate domestic-traffic-centric workloads first" is.

## 6. Claim Free Credits and Build a Real Relationship With Your Account Rep

Cloud providers hand out substantial free credits to lock customers in. Not knowing this and simply paying list price is one of the most avoidable losses out there. AWS Activate, Microsoft for Startups, Google for Startups, and Oracle's startup program all offer credits ranging from thousands to tens of thousands of dollars for startups. Going through an accelerator, a VC portfolio program, or a certified partner can unlock even higher limits.

And the most underrated weapon of all is **people**. Customers above a certain usage tier get assigned an Account Manager (AM) and a Technical Account Manager (TAM). Building a real relationship with them opens up negotiating room that never appears on the public price sheet. Once usage crosses a certain threshold, you can negotiate a company-wide Enterprise Discount Program (EDP), and you can also get extra credits when adopting new services, PoC (proof of concept) funding, and free architecture consulting. **Executives should remember that the fastest way to shrink a bill is sometimes not a technical fix, but a quarterly phone call to your account rep.**

## Closing Thoughts

These six techniques differ in difficulty and impact. #1 and #2 (rightsizing, cleanup) are free, immediate wins you can start today. #3 (commitments) delivers the biggest savings from a single approval. #4 and #5 (free accounts, domestic migration) need to be applied selectively based on workload characteristics. #6 (credits, negotiation) comes from sustained relationship management.

Cloud cost isn't a "technical debt" problem — it's a "management discipline" problem. If a CEO simply looks at the top five line items on the bill every month and builds the habit of asking "why is this line so high," half the savings have already begun.

---

*This column is based on publicly available information and each cloud provider's pricing policy as of May 2026, and offers a general perspective on cost optimization rather than a substitute for any specific company's contractual, financial, or legal decisions. Commitment terms, credits, and pricing are subject to change at any time based on provider policy; consult the latest price sheet and your account representative before making an actual decision.*

*Written by Dennis Kim — Former CEO of Cyworld, CEO of Betalabs, former Microsoft Azure MVP*
