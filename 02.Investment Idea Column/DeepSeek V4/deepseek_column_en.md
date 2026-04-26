# DeepSeek's Hardware Optimization DNA

**Kernel Engineering Forged in HFT, and China's Answer to U.S. Sanctions**

> Published: April 26, 2026
> Author: Dennis Kim
> GitHub: [github.com/gameworkerkim/vibe-investing](https://github.com/gameworkerkim/vibe-investing)
> Keywords: DeepSeek V4 · DeepEP · MoE · CUDA · NVLink · RDMA · FP8 · Huawei Ascend

---

## 1. DeepSeek Returns — But the Shock Is of a Different Kind

On April 24, 2026, DeepSeek released a preview of V4. V4-Pro at 1.6 trillion parameters and V4-Flash at 284 billion parameters launched simultaneously, both touting a 1-million-token context window and native multimodal capabilities. Had this been a routine model release, it would not have reproduced the shock from a year earlier when R1 wiped roughly one trillion dollars off U.S. Big Tech market cap. The market has already learned that Chinese AI is cheap and strong.

The shock point of V4 is therefore not the model itself but somewhere else. DeepSeek reportedly optimized V4 first for Huawei's Ascend 950 series and Cambricon chips, while deliberately denying NVIDIA and AMD the same early-optimization access window.

A company that, just a year ago, proved the proposition "you can build frontier-class models on the crippled H800" has now made the more far-reaching declaration: **"You don't need NVIDIA at all."**

> *DeepSeek's real asset is not its model weights, but the engineering culture that wrings every drop out of sanctioned hardware. And the roots of that culture lie not in an AI research lab but in a hedge-fund trading room.*

---

## 2. The HFT Gene — Why DeepSeek Is a Company That "Carves Down to the Kernel"

DeepSeek's parent company is High-Flyer, a Hangzhou-based quantitative hedge fund. Its assets under management are reported at roughly USD 8 billion, and founder Liang Wenfeng serves as CEO of both companies. This origin story carries meaning beyond a mere capital source — the company's DNA is different.

High-frequency trading (HFT) and quantitative trading are, in essence, "industries that shave latency at the microsecond level." Whether you can carve down the last clock cycle matters more than the elegance of the algorithm. NIC firmware, OS kernel interrupt handling, NUMA-node memory access patterns, even cable lengths inside the data center — all are treated as variables. HFT traders ask "output per watt" before they ask about "creativity."

The decisive difference between DeepSeek and other big labs is that this culture was transplanted, intact, into the LLM team. While a typical AI research lab starts from "we'll just buy more GPUs," DeepSeek starts from "how do we squeeze the last 1% out of the GPUs we already have." On the same H800 cluster, an HFT-bred team descends to PTX/SASS-level instruction scheduling, deliberately uses faster but technically undefined-behavior PTX instructions, and goes down to warp-level pipelining. This is not merely a story about "good engineering." The cost function itself is different.

**For DeepSeek, "carving the hardware" is not a virtue — it is the default. That is the first proposition this column wants to drive home.**

---

## 3. The Power of a Team That Carves Down to the Kernel — The Open-Source Infrastructure Stack

Starting with their 2025 "Open Source Week," DeepSeek released the core components of their training and inference infrastructure one after another. What stands out is that this stack reveals the shape of "a company that vertically integrated the entire training system," not "a company that just built a good model." The table below summarizes the core components.

| Project | Functional Area | Core Value |
|---|---|---|
| **DeepEP** | MoE all-to-all communication library | Removes the communication bottleneck of expert parallelism in asymmetric NVLink/RDMA bandwidth environments. Supports FP8 dispatch and hook-based communication-computation overlap that occupies zero SMs. |
| **DeepGEMM** | FP8 GEMM kernels | Clean BLAS kernels supporting both Hopper and Blackwell. Maximizes efficiency relative to peer libraries through fine-grained scaling and JIT compilation. |
| **FlashMLA** | Multi-head Latent Attention kernel | An attention kernel that pushes memory bandwidth on the H800 SXM5 close to the theoretical ceiling. Compresses inference cost by orders of magnitude. |
| **DualPipe** | Bidirectional pipeline parallelism | Interleaves forward/backward computation and communication to eliminate pipeline bubbles. The core algorithm that makes large-scale MoE training viable without tensor parallelism. |
| **3FS** | Distributed file system | High-performance distributed storage designed specifically for AI training and inference workloads. Self-built down to the infrastructure layer so the data pipeline itself is not the bottleneck. |
| **TileKernels / EPLB** | Tile-based kernels and expert load balancing | A tilelang-based kernel library and an MoE expert load-balancing algorithm. A structure where one company owns the entire training pipeline through vertical integration. |

The message of this stack is clear. DeepSeek runs the communication library (DeepEP), matrix-operation kernels (DeepGEMM), attention kernels (FlashMLA), pipeline algorithms (DualPipe), and the distributed file system (3FS) all under one roof. That stands in sharp contrast to even U.S. Big Tech, which still relies heavily on external libraries (NCCL, cuBLAS, FlashAttention, etc.) for these layers. To borrow a Korean semiconductor expression, DeepSeek is closer to "an AI company that runs the whole stack like an IDM, from foundry to packaging."

---

## 4. Co-Designing Algorithms and Hardware — Turning Constraint into a Weapon

DeepSeek's true differentiator is not one or two individual technologies, but the fact that it designs model architecture and hardware constraints "in the same room." A representative example is Multi-head Latent Attention (MLA), a design decision that compresses the KV cache to 5–13% of standard size, allowing larger batch sizes on the H800's 80GB HBM. DeepSeek Sparse Attention (DSA), introduced from V3.2 onward, pre-screens tokens with a lightweight scorer called the "Lightning Indexer" and runs full attention on only the top-K. It pulls the cost of attention — which scales quadratically with sequence length — down to roughly linear.

FP8 training falls in the same lineage. DeepSeek acknowledged that the H800 tensor cores' FP8 accumulation precision is limited to about 14 bits, and worked around it by promoting partial sums to FP32 registers on the CUDA cores at fixed intervals (about 128 elements).

The common thread in all of these decisions is unmistakable. While big labs approach things as "build the model first, then buy the hardware later," DeepSeek started from the opposite direction: **"shape the model to the chip we already have."** This springs from a deep understanding of the hardware and from the HFT industry's tradition of betting its life on hardware tuning — a kind of common sense that produces the most cost-effective optimal answer.

---

## 5. [Deep Dive] Anatomy of DeepEP — How They Solved the MoE-Era Communication Bottleneck

*From CUDA all the way to NVSHMEM — the weight of the message a single library is sending*

In the previous chapter we summarized DeepEP in one line as "an MoE all-to-all communication library." To understand why that one line carries industry-wide destructive power, we have to walk back down to CUDA itself. This chapter is somewhat technical, but the conclusion is one sentence:

> **"The era of just open-sourcing models is over. We are now in the era of optimizing all the way down to the infrastructure kernels."**

### 5.1 GPU Communication, Revisited — CUDA, NVLink, RDMA

CUDA is both a language and a middleware for writing code that runs on NVIDIA GPUs. Its syntax is similar to C/C++, with extensions for directly handling the thousands of cores on a GPU. The reason to write in CUDA at all is simple: ordinary CPU code cannot drive thousands of GPU cores in parallel. We use PyTorch and TensorFlow comfortably, but if you crack them open, what is being called underneath is ultimately CUDA kernels. Matrix multiplication, attention, normalization — all are CUDA kernels someone has written.

If a model is small, one GPU is enough. But for today's LLMs, that assumption broke long ago. A model weighing hundreds of gigabytes does not fit in the HBM (high-bandwidth memory) of a single GPU. It must be sharded across multiple GPUs, and the moment you shard, data has to flow between GPUs. That is GPU communication.

GPU communication splits into two layers. Within a single server, you use NVLink; between servers, you use InfiniBand RDMA. As a metaphor: NVLink is a local phone call, RDMA is a long-distance call. Both are fast, but NVLink is far faster. And this communication is, ultimately, also handled by CUDA kernels. In other words, "good communication kernels" translate directly into "fast training and inference." The amount of GPU SM (Streaming Multiprocessor) resources a communication kernel consumes turns directly into your model training speed.

### 5.2 The Real Bottleneck of MoE — All-to-All Communication

MoE (Mixture of Experts) is an architecture that activates only a subset of "experts" within the model. For every token, a router decides "which expert should this token go to."

**The problem is that this routing happens between every GPU.**

With 8 GPUs, every step triggers 8-to-8 communication; with 64 GPUs, 64-to-64. This is all-to-all communication, and in MoE it splits into two stages: dispatch (sending tokens out) and combine (gathering the results back).

As MoE models grow, this communication becomes the real bottleneck. The constraint isn't compute — **communication is what holds you back**. On a "regulation-spec" chip like the H800, where NVLink bandwidth is cut to less than half of the H100, this bottleneck is decisive. DeepSeek directly optimized this layer while training their own V3 and R1 models, and what they open-sourced was that exact result — DeepEP. They effectively released their own model-training code as-is.

DeepEP is the real martial-arts manual the DeepSeek team has put on the table.

**To summarize, DeepEP's identity fits in one line: a collection of MoE-dedicated GPU communication kernels — dispatch/combine kernels written directly in CUDA.**

### 5.3 Two Kernel Families — Normal and Low-Latency

DeepEP splits into two kernel families. The Normal Kernel is for training and inference prefilling; the Low-Latency Kernel is for inference decoding. Because the two workloads have opposite characteristics, the same library effectively contains two different communication engines.

**[Normal Kernel]** Training and prefilling handle a large batch at once (the official benchmark uses 4,096 tokens). Here the key is to drive NVLink and RDMA simultaneously. DeepEP routes intra-node traffic over NVLink and inter-node traffic over RDMA, asymmetrically combining the two bandwidths. The official numbers measured on H800 + CX7 InfiniBand 400 Gb/s are as follows.

| Type | Dispatch #EP | Bottleneck Bandwidth (Dispatch) | Combine #EP | Bottleneck Bandwidth (Combine) |
|---|---|---|---|---|
| Intranode | 8 | 153 GB/s (NVLink) | 8 | 158 GB/s (NVLink) |
| Internode | 16 | 43 GB/s (RDMA) | 16 | 43 GB/s (RDMA) |
| Internode | 32 | 58 GB/s (RDMA) | 32 | 57 GB/s (RDMA) |
| Internode | 64 | 51 GB/s (RDMA) | 64 | 50 GB/s (RDMA) |

The benchmark environment is H800 (~160 GB/s NVLink maximum) and CX7 InfiniBand 400 Gb/s NIC (~50 GB/s maximum), following DeepSeek-V3/R1 pretraining settings (4,096 tokens per batch, hidden 7,168, top-4 groups · top-8 experts, FP8 dispatch + BF16 combine).

The 153 GB/s NVLink figure for intra-node 8EP is 96% of the 160 GB/s ceiling — utilization at the edge of the theoretical limit. The 58 GB/s RDMA figure for inter-node 32EP exceeds the nominal 50 GB/s cap, a result of forwarding NVLink-domain traffic over RDMA and combining the two bandwidths asymmetrically.

> 📌 On April 22, 2025, an optimization patch (PR #130) from Tencent's Network Platform Department was merged into the main branch, reportedly delivering up to 30% additional performance gains in some configurations. The fact that a Big Tech communications team is sending patches to another company's library is itself evidence that DeepEP is becoming a de facto Chinese internal standard.

**[Low-Latency Kernel]** Inference decoding is the opposite workload. The batch handled at one time is small (the official setting is 128 tokens), and response time *is* user experience. Interestingly, this mode does not use NVLink at all — only pure RDMA. The reason is that NVLink setup overhead is larger than the processing time of a single decoding token. If a local-call connection time exceeds the call itself, it is faster to just place a long-distance call directly. The official benchmark numbers are as follows.

| Dispatch #EP | Latency | RDMA Bandwidth | Combine #EP | Latency | Bandwidth |
|---|---|---|---|---|---|
| 8 | 77 μs | 98 GB/s | 8 | 114 μs | 127 GB/s |
| 16 | 118 μs | 63 GB/s | 16 | 195 μs | 74 GB/s |
| 32 | 155 μs | 48 GB/s | 32 | 273 μs | 53 GB/s |
| 64 | 173 μs | 43 GB/s | 64 | 314 μs | 46 GB/s |
| 128 | 192 μs | 39 GB/s | 128 | 369 μs | 39 GB/s |
| 256 | 194 μs | 39 GB/s | 256 | 360 μs | 40 GB/s |

The numbers — 77 μs dispatch and 114 μs combine at 8EP — are not trivial. Even when scaled to 256EP, latency does not blow up: dispatch stays at 194 μs and combine at 360 μs. For an inference serving system, this is a promise that **"as the number of experts grows, user-perceived latency stays nearly flat."** A patch dated June 5, 2025 (PR #173) further enhanced the low-latency kernel to leverage NVLink whenever possible.

### 5.4 Hook-Based Communication-Computation Overlap and FP8 Dispatch

The most interesting design in DeepEP is its hook-based communication-computation overlap. Standard communication libraries occupy a portion of the GPU's SMs to handle communication, which reduces the SMs available for compute. DeepEP's low-latency kernel pushes RDMA traffic into the background, driving SM occupancy to zero. The hook interface (`return_recv_hook=True`) lets the caller directly control the "receive complete" timing.

When the four stages — Attention → Dispatch → MoE compute → Combine — are interleaved across two micro-batches via this mechanism, the GPU's idle bubble effectively converges to zero. An even more important side-effect is CUDA Graph compatibility. CUDA Graph is the decisive feature that cuts per-token overhead to single-digit microseconds in inference serving, and most communication libraries do not support it. DeepEP's low-latency mode does.

One more thing: DeepEP supports FP8 dispatch natively. Tokens are compressed to FP8 when sent, then combined back in BF16. **Accuracy stays at BF16 levels while communication volume is cut by nearly half.** The group-limited gating algorithm proposed in the DeepSeek-V3 paper is also baked in as-is. It is plainly visible that they released their own V3/R1 training code with almost no modifications.

### 5.5 Environment, Dependencies, and Entry Barriers

DeepEP's environment requirements are as follows. Supported GPUs are Ampere (SM80) and Hopper (SM90), with official testing on H800. Software requirements are CUDA 11+ for SM80, CUDA 12.3+ for SM90, PyTorch 2.1+, and Python 3.8+.

Intra-node communication assumes NVLink and inter-node communication assumes RDMA. The recommended network is InfiniBand CX7 400 Gb/s, with RoCE (RDMA over Converged Ethernet) listed as theoretically compatible — though that "theoretically" qualifier deserves attention.

The entry barrier is unambiguous: **the NVSHMEM dependency**. NVSHMEM is NVIDIA's SHMEM library for inter-node communication, and installation is not a one-line `pip install` — you have to follow a separate build guide. The DeepEP repository even ships a dedicated NVSHMEM installation guide. The license is MIT, but some files referencing NVSHMEM (`csrc/kernels/ibgda_device.cuh`, `third-party/nvshmem.patch`) fall under NVIDIA's NVSHMEM SLA. This warrants license review before adoption.

The actual usage pattern is surprisingly simple. You create a Buffer object, call `dispatch()` to send tokens to experts, run the MoE compute, and gather results with `combine()`. Low-latency mode branches via the `low_latency_mode=True` flag at Buffer creation, with background hooks added. The interface itself is not hard for a PyTorch user to adapt to.

### 5.6 The Real Message DeepEP Is Sending

This is where the real argument starts. DeepEP's significance is more than just "a fast communication library."

- **First,** MoE training has become a domain where it is no longer possible to operate without communication optimization. Plain PyTorch DDP or DeepSpeed can no longer drive hundreds-of-GPU MoE setups efficiently. A dedicated kernel is effectively mandatory. DeepEP is on the verge of taking that de facto standard slot.

- **Second,** DeepSeek has shifted from "a company that releases only models" to **"a company that releases even the infrastructure-overhead libraries."** This simultaneously lowers their own training cost and creates an effect where other teams building similar MoE models end up building on DeepSeek's codebase. It is a standards-grab.

- **Third,** Mori-EP — an AMD ROCm fork — already exists as an official branch, and the UCCL project's uccl-ep fork supports heterogeneous GPUs (NVIDIA, AMD) and various NICs (EFA, Broadcom, CX7). AntGroup is operating an SM-Free optimization series in a separate branch, and even NVIDIA itself is experimenting with TMA instructions and NVFP4 data type support through the Hybrid-EP branch.

- **Fourth,** Infrawaves added dual-port NIC and multi-QP support, while AntGroup's DeepXTrace is a diagnostic tool for analyzing slow ranks. A small ecosystem has already formed around a single library. It is a clear signal that someone is actively unwinding the NVIDIA lock-in.

**Now let's bring this picture down to Korean reality.**

For any team training MoE models domestically, the first library to evaluate right now is **DeepEP**. Especially for sites holding H100/H200 clusters, the training-efficiency gain relative to adoption cost is immediately measurable. For inference-serving teams, even just lifting out the Low-Latency Kernel for separate evaluation is worthwhile — it is one of the fastest paths to cutting decoding latency.

The downsides are also clear: the NVSHMEM dependency, limited validation outside H800 environments, and the need for separate verification of RoCE behavior on standard data-center Ethernet. But the codebase itself is structured at CUDA 58.9%, Python 20.3%, C++ 19.2% — enough of an "open library" that you can read and modify it directly. If a Korean team wants to attempt attaching their own NPU backend (Rebellions, FuriosaAI, etc.), forks like MORI-EP or UCCL-EP are good starting points.

> The era of just open-sourcing models is over. We are in the era of open-sourcing infrastructure kernels. And the fact that this current is being driven not by U.S. Big Tech but by the DNA of a team out of a Hangzhou hedge fund — a team that started on sanctioned H800s — is the core point of this column.

---

## 6. U.S. Sanctions, DeepSeek's Reply — A Three-Stage Strategy

U.S. AI-chip export controls against China have been built up through the first round in October 2022, the strengthening in October 2023, and additional rounds across 2024–2025. The core is blocking the export of frontier GPUs (H100, B200 family) and high-bandwidth interconnects to China. The H800 was originally a "China-only model" with NVLink bandwidth deliberately reduced to skirt the regulation, but the October 2023 expansion ultimately closed even that route. DeepSeek's response can be summarized in three stages.

### 6.1 Stage 1 — Closing the Hardware Gap Through Algorithms

The phase up through V3/R1 falls here. The FP8 training, DualPipe, MLA, and the just-analyzed DeepEP were all designed under the explicit objective of "extracting unconstrained-hardware-class performance out of constrained hardware." DeepEP's design — asymmetrically combining the H800's narrow NVLink with its relatively abundant RDMA — is the clearest example of taking "the hardware shape created by sanctions" itself as an input variable for the algorithm. The message of this stage was the first signal sent to U.S. policymakers: **regulation cannot indefinitely preserve an overwhelming hardware gap.**

### 6.2 Stage 2 — A "Deliberate" Migration to Chinese Chips

The most politically significant decision in V4 was performing first-priority optimization on Huawei's Ascend 950 series and Cambricon chips. Per reporting, DeepSeek granted Chinese chipmakers a priority window for V4 pre-optimization and shut that same window for NVIDIA and AMD. NVIDIA CEO Jensen Huang was quoted in Chinese media expressing concern that this could be **"a disaster for the United States."**

A technical gap remains. Analysts place Ascend 950 somewhere between H100 and H200, and SMIC's 7nm-class production capacity is itself a bottleneck. But the political message is clear. Once the fact that **"we train without American chips"** is proven even once, the impact and symbolism of the U.S. chip-based blockade collapses.

And the fact that DeepEP's Mori-EP and UCCL-EP forks already support ROCm and heterogeneous NICs means the components of an "MoE training stack without NVIDIA" are quietly being assembled, one by one.

### 6.3 Stage 3 — Ecosystem Lock-In Through Open Source

DeepSeek's V3, R1, V3.2, and V4 all release their weights under MIT or equivalent licenses. DeepEP, DeepGEMM, FlashMLA, DualPipe, and 3FS are also all MIT. This is not philanthropy — it is a clear strategy. When the model and the infrastructure are both open source, cloud providers, research institutions, and enterprises around the world voluntarily distribute, modify, and improve "models optimized on Chinese chips" and "communication libraries built by Chinese companies." That know-how accumulates at the global community level and flows back into China's hardware ecosystem.

This is exactly why the United States is now considering bringing model weights themselves into the export-control regime. They thought blocking chips would be enough, but a single open-source release mobilizes developers worldwide as "voluntary optimization labor for Chinese hardware." DeepSeek understands this precisely and is exploiting it.

---

## 7. Implications for Korea's AI and Software Industry

DeepSeek's case raises three questions for Korea's AI, blockchain, and cybersecurity industries.

- **First, "what is our company's cost bottleneck?"** A company that builds "creative models" on abundant GPUs and a company that wrings "tokens per watt" out of scarce GPUs ultimately produce different outcomes. Korean AI startups need to ask themselves which side they sit on.

- **Second, "how deep is your vertical integration?"** DeepSeek runs its own communication library, GEMM kernels, and distributed file system. If Korean firms cannot reduce their dependency on foreign libraries like NCCL, cuBLAS, and FlashAttention, they will lose not the cost competition but the *control* competition. The most practical message DeepEP is sending is: **"While the door is open, walk in and read the code."**

- **Third, "what does sanctioning mean for us?"** U.S. sanctions on China are double-edged for Korea. On one hand, they offer Korean semiconductor and AI players short-term diversion demand; on the other, "the degree to which Korea is bound into the U.S. chip ecosystem" transfers directly into risk. DeepSeek's migration to Huawei Ascend is a mirror for Korea's own question: how do we assemble our own NPU and AI-accelerator ecosystem?

I see the same pattern repeating in the company I run and in the blockchain industry trenches I work in. Projects deeply dependent on foreign infrastructure cannot control their own cost structures. DeepSeek's lesson is not confined to AI. The question of which layer of the infrastructure stack you can "carve down to the kernel" yourself is, ultimately, what decides which companies survive periods of regulation and shock.

---

## 8. Conclusion — The Race for the "Last Clock Cycle"

The real message of DeepSeek V4 is not the figure 1.6 trillion parameters. It is that the combination of "constrained hardware + deep system engineering + open-source strategy" can compete head-on with the American "abundant hardware + closed model" model. The question that began on HFT trading floors — "how do we shave down the last clock cycle" — has expanded into the design philosophy of an entire AI infrastructure.

DeepEP is one of the most concentrated outputs of that philosophy. A single library, written 58.9% in CUDA, unblocks the communication bottleneck of MoE training, shaves microseconds off inference decoding latency, and at the same time — released under MIT — broadcasts its standard to developers worldwide. The era of just open-sourcing models is over. **We are now in the era of optimizing all the way down to the infrastructure kernels.**

U.S. sanctions are effective in the short term, but they are neutralized faster than expected when the counterparty is "a company that takes constraint itself as an input variable for its cost function." DeepSeek is the company running that hypothesis on the largest stage, and the result of that experiment will remain the most important variable shaping the global AI industry over the next five years. Korea's industry, too, must not treat this variable as "someone else's problem." This question will arrive at our door soon enough.

---

*© 2026 Dennis Kim (김호광). This column is an analytical piece based on publicly available materials (DeepSeek's official GitHub repositories, the DeepSeek-V3 technical report, V4 coverage by Reuters/CNN/Bloomberg, Bain & Company analyses, etc.) and does not constitute investment advice or legal counsel.*
