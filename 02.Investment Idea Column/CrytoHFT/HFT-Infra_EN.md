# The Structural Limits of Improving Crypto HFT Infrastructure — Why Better Servers Won't Fix This

## Introduction

On October 10, 2025, the cryptocurrency market experienced the largest forced liquidation event in its history. Within 24 hours, $19.13 billion in leveraged positions were liquidated, affecting more than 1.6 million traders. On Binance, assets such as Cosmos (ATOM) and IoTeX (IOTX) briefly traded near $0, and the stablecoin USDe dislocated to $0.65. Ten days later, on October 20, the AWS us-east-1 region went down for roughly 15 hours, taking Coinbase and Robinhood offline with it. A month after that, on November 18, a global CloudFlare outage knocked out roughly 20% of worldwide internet traffic.

Three events, three different causes — yet they converge on a single question: **why does centralized exchange (CEX) infrastructure fail precisely at the moment users need access the most, and would more infrastructure investment solve the problem?**

Let me state the conclusion up front. It would not. But the reason is not the one commonly given — that "the technology isn't good enough." The problem is that three mutually independent failure axes — demand-side divergence, supply-side random failure, and unverifiability — are structurally embedded in today's CEX architecture. This essay analyzes each axis quantitatively, answers the anticipated objections, and argues why what is needed is not infrastructure improvement but a redesign of market structure.

One clarification before we begin. This essay does not claim that low-latency processing of massive traffic is mathematically impossible. Korea's KOSDAQ, NASDAQ, and CME process millions of messages per second at microsecond latencies. It is not impossible. What this essay claims is this: **for a CEX that has chosen an internet-facing cloud architecture for the sake of global retail accessibility and DDoS defense, that choice carries an irreducible time-constant mismatch as its price.** This distinction runs through the entire essay.

---

## 1. The Millisecond Illusion — Steady State Is Not the Problem

The "millisecond-level response times" that CEXs advertise are not a lie. In steady state, they are in fact far better than that. Queueing theory makes this concrete.

Assume the following steady-state traffic profile for an exchange.

| Parameter | Value | Notes |
| --- | --- | --- |
| Mean request arrival rate λ₀ | 10,000 req/s | Orders, cancellations, and queries combined |
| Aggregate service rate μ | 50,000 req/s | 400% headroom |
| Utilization ρ₀ = λ₀/μ | 0.2 | — |

Using an aggregate M/M/1 model that approximates the multi-server system as a single fast server (strictly speaking, M/M/c Erlang-C is the precise model, but the approximation suffices for the divergence argument below), the mean queue waiting time is:

$$W_q = \frac{\rho}{\mu(1-\rho)} = \frac{0.2}{50{,}000 \times 0.8} = 5\mu s$$

The steady-state queue wait is a mere **5 microseconds**. On top of this, network round trips, TLS termination, and traversal of the CDN, WAF, and load balancers push measured TTFB to the 60–100ms range. In other words, the dominant factor in normal-condition latency is the path, not the processing — consistent with the industry rule of thumb that roughly 80% of total latency in high-frequency trading systems originates in the network.

Up to this point, the exchanges' claims hold. The problem is that the condition under which this calculation is valid — that ρ stays comfortably below 1 — **collapses during a liquidation cascade**. It is a standard result that M/M/1 waiting time is a convex function of λ, and in the limit ρ → 1:

$$\lim_{\rho \to 1} W_q = \lim_{\rho \to 1} \frac{\rho}{\mu(1-\rho)} = \infty$$

Waiting time degrades gently, then diverges like a cliff near the critical point. The 5μs wait at 20% utilization becomes 980μs at 98%, 20ms at 99.9% — and the moment λ exceeds μ, the queue grows without bound. The real question for exchange infrastructure is not "how many milliseconds in normal conditions" but "how many seconds does it take for λ to reach μ, and what happens then."

So does λ actually reach μ during liquidations? That is the subject of the next section.

---

## 2. The Mathematics of Cascading Liquidations — Why Traffic Self-Amplifies

The first-order traffic increment from liquidating n positions can be written as a simple sum:

$$\Delta\lambda_{first} = \sum_{i=1}^{n} k_i$$

where kᵢ is the number of API calls involved in processing the liquidation of position i (margin recalculation, mark-price queries, liquidation order creation, matching, and settlement — 5 to 10 calls on average). But this expression is linear in n, and linear growth is absorbable within 400% headroom. What makes cascading liquidations dangerous is not the first-order increment but the **feedback loop**.

The mechanism works as follows. Liquidation orders execute as market sells, and market impact follows the square-root impact law:

$$\Delta P \propto \sigma \sqrt{Q/V}$$

(Q: liquidated volume, V: market liquidity, σ: volatility). As price is pushed down, the next cluster of positions sitting just above the liquidation line falls below it, and their liquidation sells push the price further. Liquidation begets liquidation.

This self-amplifying dynamic is formalized as a **self-exciting point process — a Hawkes process**. The liquidation intensity at time t is:

$$\lambda(t) = \lambda_0 + \sum_{t_i < t} \alpha\, e^{-\beta(t - t_i)}$$

Each liquidation event tᵢ raises the intensity by α, and the effect decays at rate β. The fate of the process is determined by the **branching ratio n = α/β** — the expected number of subsequent liquidations triggered by a single liquidation.

- n < 1 (subcritical): the cascade dies out on its own. An ordinary correction.
- n ≥ 1 (supercritical): liquidation intensity diverges explosively. October 10.

The key point is that α is not a constant. It is a function of how densely the leverage distribution is clustered near the liquidation line, and of how thin market depth is. The longer a bull market runs, the more high-leverage positions stack up within a narrow price band, and α quietly creeps toward its critical value. The market looks calm on the surface while the system is already on the edge of supercriticality. The trigger can be anything — on October 10, it was a macro shock in the form of a tariff announcement.

Once the supercritical regime sets in and liquidation intensity diverges, API traffic diverges with it. On top of liquidation-processing requests, the entire user base — watching prices collapse — floods the system with quote queries, position checks, and manual close attempts. The arrival rate λ(t) can reach 10–100 times its baseline within seconds to tens of seconds — hundreds of thousands to a million requests per second. The divergence condition λ → μ from Section 1 becomes reality.

One terminological note: the quantity at issue in this essay is application-layer RPS (Requests Per Second). Network-layer PPS (Packets Per Second) surges alongside it at a scale of dozens of packets per request, and it is the layer at which CloudFlare's DDoS mitigation operates — but the correct unit of analysis for order and liquidation bottlenecks is RPS.

---

## 3. The Time-Constant Mismatch — Why Autoscaling Is Always Late

"If traffic surges, autoscaling will expand capacity" is cloud architecture's standard answer. The problem with this answer lies not in the size of the capacity but in its **reaction speed**.

Compare two time constants.

| Process | Time constant | Basis |
| --- | --- | --- |
| Liquidation cascade reaching peak intensity | Seconds to tens of seconds | Hawkes supercritical divergence is exponential. During the October 10 flash crash on Binance, the core window was 40 minutes (21:36–22:16 UTC), and individual asset collapses played out in minutes |
| Autoscaling delivering effective capacity | Tens of seconds to minutes | Metric collection interval + scaling decision + instance boot + application warm-up + load balancer registration + DB connection pool expansion |

Demand diverges on a timescale of seconds; supply reacts on a timescale of minutes. By the time autoscaling brings new instances online, the peak of the cascade has already passed, and the damage — the gap between theoretical liquidation price and actual fill price, slippage, delayed execution — has been locked in during the interval. The ship arrives after the storm has passed.

One might object: "Then provision for peak demand at all times." This fails for three reasons. First, peak demand is 10–100 times baseline and occurs only a few times a year, so permanent peak provisioning means keeping 90–99% of capacity idle — economically unsustainable for exchanges locked in fee competition. Second, compute is not the only bottleneck. The matching engine contains a serial section where price-time priority forces sequential processing per instrument, and this section cannot be horizontally scaled in principle. Third, stateful layers — DB connection pools, WAF rule evaluation, long-lived WebSocket connections — do not expand instantly the way stateless compute does.

In short, this is not a problem that "more money" solves. It is a **structural mismatch between self-exciting demand that diverges in seconds and elastic supply that responds in minutes**. Traditional exchanges do not suffer from this problem — not because their infrastructure is better, but because circuit breakers and price bands **cut off demand-side divergence at the source**. We return to this point in the conclusion.

---

## 4. Supply-Side Random Failure — Infrastructure Dies Even When Markets Are Quiet

The discussion so far has traced the path by which demand surges break infrastructure. But the events of late 2025 demonstrated a **second, independent failure axis**: the CDN and cloud layers collapse on their own, from internal defects, regardless of market stress.

| Date | Entity | Failure | Market context and outcome |
| --- | --- | --- | --- |
| Nov 2017 | Bithumb | Server down during BCH crash; users unable to sell | Korea's first class-action lawsuit over an exchange outage |
| Jul 11, 2018 | Upbit | Inter-server conflict halted all market trading for ~30 minutes | User loss complaints; hacking rumors spread |
| Mar 12–13, 2020 | BitMEX | Trading engine halted during BTC crash ($8,000 → $3,800) | ~$750M liquidated within minutes. The decline stopped immediately after the engine went down |
| Mar 2–3, 2020 | Robinhood (TradFi comparison) | System down around a sharp rebound day | Same failure mode in a traditional broker. The difference: post-hoc regulatory investigation and compensation procedures exist |
| Feb / May 2021 | Binance, Coinbase, others | Repeated access failures and withdrawal halts during sharp volatility | Mass complaints and attempted lawsuits over inability to close positions |
| Nov 2021– | Upbit | Repeated price-feed freezes and emergency maintenance during the bull run | Individual investor lawsuits over losses from unfilled-order errors |
| Aug 2025 | Binance | All futures UM contracts halted for ~18 minutes | Cause undisclosed; window in which positions could not be adjusted |
| Oct 10–11, 2025 | All CEXs | Record liquidation of $19.13B; 1.6M+ traders affected. ATOM and IOTX briefly filled near $0; USDe at $0.65 | Widespread complaints of inability to close positions during the cascade. Binance compensation and rule changes followed |
| Oct 20, 2025 | AWS us-east-1 | Cascading DNS failure, ~15 hours, 2,500+ companies affected | Coinbase degraded/down for 3h 17m; Robinhood and Base L2 paralyzed alongside |
| Nov 18, 2025 | CloudFlare | Configuration file fault; global 500 errors for 3.5–6 hours, ~20% of worldwide traffic affected | Coinbase and Kraken front ends down; BitMEX investigating outages |
| Dec 5, 2025 | CloudFlare | WAF parsing change triggered a latent bug; ~25-minute outage | Coinbase, Kraken, Jupiter, Raydium down together. Same provider, twice in one month |
| May 8, 2026 | AWS us-east-1 | Availability-zone failure from data center overheating | Coinbase down ~7 hours; phased reopening via "Cancel Only" mode |

Three patterns emerge from this timeline.

**First, the failure mode differs every time, but the outcome is the same.** Cascading DNS failure (Oct 2025), configuration file error (Nov 2025), latent WAF bug (Dec 2025), physical overheating (May 2026) — the causes were all different. Fixing any specific defect does not prevent the next outage, because the concentration on a handful of infrastructure providers is itself the source of the risk.

**Second, demand-side failure and supply-side failure are independent events — which means they will eventually coincide.** October 10 (demand divergence) and October 20 (supply failure) occurred ten days apart. The scenario in which both axes strike on the same day — a CDN or cloud region collapsing in the middle of a liquidation cascade — is not a hypothetical worst case. It is a matter of probability.

**Third, the BitMEX episode of March 2020 is the paradox that completes this essay's argument.** When the engine stopped, the liquidation cascade stopped, and the price rebounded — because at that moment, the liquidation engine itself was the market's largest seller. The outage functioned as an unintended circuit breaker. What this episode reveals is chilling: **perfect infrastructure does not solve the problem. It merely executes the cascade faster and more completely.** Here lies the deepest blind spot of the infrastructure-improvement thesis. The essence of the problem is not processing capacity but the absence of shock absorbers.

---

## 5. Oracle Design Flaws — A Third Failure Mode, Independent of Infrastructure

Reducing the October 10 event to an infrastructure capacity problem contradicts the post-mortem evidence. One of the core amplifiers of that day's damage was a **design flaw in the collateral-valuation oracle**.

Binance valued collateral assets such as USDe, wBETH, and BNSOL using its own spot order-book prices rather than an external index. When the bid wall on the internal order book was exhausted during the volatility spike, USDe dislocated to $0.65 — on Binance alone (the issuer's mint-and-redeem mechanism was functioning normally throughout) — and accounts whose collateral had collapsed on paper were swept into cascading liquidation. ATOM briefly filling near zero followed the same structure: in one-sided liquidity, even extreme-price limit orders placed years earlier were swept up.

This is not a queueing problem but a **price-discovery design problem**, and distinguishing the two failure modes matters. Had the infrastructure been perfect, the same collapse would have occurred as long as the oracle referenced internal prices; had the oracle been perfect, the infrastructure bottleneck would still have produced execution gaps. Binance's decision to phase in a spot Price Range (PRER) rule from April 14, 2026 is itself evidence that the exchange diagnosed the oracle and pricing design as a root cause.

But the implication of this reform should be read carefully. Price bands are a device traditional markets adopted decades ago. The crypto market began importing the first piece of that toolkit only after paying tuition in the form of the largest liquidation in history — and even then, exchange by exchange, voluntarily, partially. A market-wide circuit breaker, a central clearinghouse, and a standardized post-mortem investigation procedure still do not exist.

---

## 6. Unverifiability — The Problem Is Not the Existence of Privilege but the Impossibility of Proving Its Absence

The third axis is not technology but governance. Liquidation prices, execution order, and execution timing are determined by the exchange itself, and there is effectively no way to audit them externally.

This subject demands precision. The commonly heard claim — "exchanges process VIPs first and abandon retail" — mixes evidence of very different grades. Separated, it looks like this:

| Claim | Evidence level | Verdict |
| --- | --- | --- |
| Tiered API rate limits by VIP level | Stated in official exchange documentation | Fact |
| Low-latency access (colocation, etc.) offered to VIPs and institutions | Official programs exist | Near-fact |
| Retail users deprioritized in the liquidation execution queue | No public evidence | Conjecture |
| Exchange's own positions unwound first | No public evidence | Conjecture |

The first two rows are public fact. The moment infrastructure capacity hits its ceiling, participants with higher rate limits and shorter paths exit first, while retail users competing for shared resources are left behind — an inevitable consequence of the architecture, even absent any intentional discrimination. Resource allocation under congestion is already stratified.

The last two rows are unproven, and this essay does not assert them as fact. But this is where the argument must be inverted. **The problem is not evidence that privilege existed — it is the fact that there is no way to verify that it did not.** When theories of an internal failure surfaced after October 10, Binance denied them; but limited disclosure only fed distrust and conspiracy theories. A former CFTC regulator's call for a formal investigation — drawing a comparison to the 2010 equity flash crash — made the same point: he did not claim manipulation occurred, but noted that **the crypto market lacks any formal post-mortem procedure capable of adjudicating whether it did.**

When a flash crash occurs in traditional markets, regulators subpoena execution data, a post-mortem report is published, erroneous trades are busted, and compensation procedures operate. When the same event occurs in crypto, a voluntary explanation and voluntary compensation from the exchange are all there is — and no third party exists to verify the truth of that explanation. The liquidation black box is not a breeding ground for conspiracy theories; it is the **absence of any means to refute them** — and no amount of infrastructure improvement resolves this by a single bit.

---

## 7. Answering the Objections

Four objections to this essay's thesis deserve to be met head-on.

**Objection 1: "NASDAQ processes millions of messages per second. It's just a technology problem."**

Half right. Traditional exchanges achieve low latency on bare-metal matching engines, kernel bypass, colocation, and — decisively — **dedicated lines that never traverse the public internet**. CEXs do not adopt this architecture, and not out of incompetence. They must serve retail users worldwide connecting from smartphones, defend against constant DDoS attacks, and be able to relocate infrastructure quickly as regulatory environments shift. CDNs and public cloud are the rational answer to those requirements. But the answer has a price — the time-constant mismatch of Section 3 and the supply-side concentration risk of Section 4. The technology is not missing; this is a **trade-off embedded in the chosen architecture**. And as long as retail accessibility cannot be abandoned, the choice cannot be reversed.

**Objection 2: "Distribute across multiple clouds and multiple CDNs."**

Partial mitigation, not a solution. First, the matching engine and the ledger are extremely difficult to distribute active-active because of consistency requirements. Price-time priority matching per instrument demands a single sequencer, and this serial section only accumulates latency as it is geographically distributed. Second, empirically: after the October 2025 AWS outage, multi-cloud proposals poured forth — and in May 2026, Coinbase went down for seven hours on us-east-1 again. Third, multi-cloud offers no answer whatsoever to demand-side divergence (Sections 2–3). Distribution lowers the probability of supply-side failure; a self-exciting liquidation cascade diverges identically on any cloud.

**Objection 3: "DEXs are the answer. On-chain liquidation is verifiable."**

Half true. Some on-chain derivatives exchanges stayed operational through October 10, and liquidation logic living on-chain is a genuine answer to the unverifiability problem of Section 6. That anyone can reconstruct why, when, and at what price a liquidation occurred is a property a CEX structurally cannot offer. But DEXs carry their own single points of failure: oracle dependence (the Section 5 problem returns in a different form), sequencer concentration, and congestion or halts on the underlying chain. And it should not be forgotten that during the November 2025 CloudFlare outage, the front ends of numerous DEXs were paralyzed as well. The chain may live while the user's point of access dies. DEXs answer the third axis (verifiability); they are not an exemption from the first two.

**Objection 4: "October was caused by an exogenous shock — the tariff announcement — not by infrastructure."**

This objection confuses the trigger with the amplifier. The tariff announcement was the match. But the same match fell on traditional markets that day, and traditional markets did not suffer the largest forced liquidation in their history. What made the difference was the dry kindling: high-leverage positions stacked near the liquidation line (the supercritical branching ratio of Section 2), an internally-referenced pricing oracle (Section 5), the absence of circuit breakers, and the infrastructure bottleneck that prevented users from closing positions during the stampede (Sections 1 and 3). The exogenous shock is a constant. The system's response is the variable — and it is that response function this essay has analyzed.

---

## 8. Closing — Not Better Servers, but a Different Market Structure

To summarize the argument.

First, the **demand side**: leveraged liquidation is a self-exciting process, and the moment the branching ratio crosses criticality, traffic diverges within seconds. Cloud's elastic supply reacts in minutes and is therefore structurally late. This mismatch cannot be closed with budget — permanent peak provisioning is economically impossible, and the matching engine's serial section is closed to horizontal scaling in principle.

Second, the **supply side**: from October 2025 through May 2026, AWS and CloudFlare collapsed four times for four different reasons, and major exchanges went down with them each time. Concentration on a few providers is a risk axis that no individual bug fix removes — and one day it will coincide with a demand-side divergence.

Third, **governance**: the liquidation black box is not evidence of privilege but the absence of any means to prove privilege's absence, and in a market with no formal post-mortem procedure, this problem persists regardless of infrastructure.

And the BitMEX paradox of 2020 binds the three together. That the cascade stopped when the engine stopped suggests that what we have been demanding of infrastructure — never halting, executing every liquidation instantly under any conditions — may have been the wrong demand from the start. Traditional markets did not build circuit breakers because they lacked processing capacity. They built them because **there are moments when stopping the market is what saves the market.**

What is needed, therefore, is not bigger servers but a different design: market-wide volatility interruption mechanisms, external-index-based collateral valuation standards, third-party verification of liquidation execution records (whether on-chain or via regulatory audit), and a formal post-mortem procedure for flash crashes. Binance's April 2026 price-band adoption is a first step, but a mosaic of voluntary, per-exchange measures cannot contain systemic risk — because liquidation cascades do not respect exchange boundaries.

The reason improving CEX infrastructure can only run into limits is that this was never an infrastructure problem to begin with. Demand that diverges in seconds against supply that reacts in minutes; a foundation layer concentrated in a few providers; a black box that cannot be verified — these three axes are, respectively, problems of architectural choice, market structure, and governance. The servers are already fast enough. What is slow is the evolution of market structure.
