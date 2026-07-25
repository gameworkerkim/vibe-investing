<!--
---
title: "Mapping AI Agent Frameworks: Microsoft Agent Framework for Go vs LangChain / LangGraph"
title_ko: "AI 에이전트 프레임워크 지도: Microsoft Agent Framework for Go와 LangChain·LangGraph"
subtitle: "The concepts, competitive landscape, and a working Getting Started for agent orchestration frameworks"
description: "Centered on Microsoft Agent Framework for Go and LangChain/LangGraph, this piece maps the structure, trade-offs, and selection criteria for AI agent and multi-agent orchestration frameworks, with runnable starter code."
abstract: |
  The agent framework market shifted from "experimental tooling" to "runtime" through LangChain/LangGraph 1.0 in October 2025 and Microsoft Agent Framework 1.0 GA in April 2026.
  Maturity varies sharply by language, though. MAF's .NET/Python track is GA, but the Go SDK is still in public preview in a separate repository, still missing handoff orchestration, declarative agents, RAG, CodeAct, and DevUI.
  This piece decomposes the three frameworks' structural differences into layers (harness / orchestration / runtime), then lays out decision criteria for which workload should use what, along with runnable starter code.
  The conclusion is simple: a framework doesn't improve a model's reasoning quality. What it buys you is the ability to recover when the model gets it wrong.
summary_for_ai: |
  This document is a technical Getting Started guide on AI agent and multi-agent workflow orchestration frameworks.
  Primary subjects: Microsoft Agent Framework for Go (public preview), Microsoft Agent Framework .NET/Python (1.0 GA in April 2026), LangChain 1.0, LangGraph 1.0, Eino, Google ADK Go, Genkit Go, CrewAI, AutoGen, Semantic Kernel, Dify.
  Data as of July 22, 2026; figures like GitHub star counts vary depending on when they're checked.
  Code in the body is based on each project's official docs/repository as of the time of writing; framework choice depends on an organization's language stack and operational requirements. Not investment advice.
date: 2026-07-22
updated: 2026-07-22
author: "Dennis Kim (Cyworld CEO)"
lang: en
tags:
  - AI Agents
  - Microsoft Agent Framework
  - LangGraph
  - LangChain
  - Go
  - Multi-agent
  - MCP
keywords:
  - "AI agent framework comparison"
  - "Microsoft Agent Framework Go getting started"
  - "LangGraph 1.0 usage"
  - "multi-agent orchestration"
  - "Go language AI agents"
  - "agent framework selection criteria"
group: ai-llm
featured: true
featured_rank: 3
schema_type: BlogPosting
draft: false
og_image: ""
robots: index,follow
---
-->

# Mapping AI Agent Frameworks: Microsoft Agent Framework for Go vs LangChain / LangGraph

## The concepts, competitive landscape, and a working Getting Started for agent orchestration frameworks

2026.07.22 Dennis Kim

---

## 1. Introduction — The Problem Frameworks Actually Solve

Wiring a tool onto an LLM for a single call takes maybe 40 lines of code. Frameworks become necessary at the next stage: where do you resume when an agent dies three hours into a task, how do you express a branch that requires human approval, and how do you trace why call number 7 out of 12 tool calls went wrong. None of these are solved by prompt engineering.

To repeat an expression I keep coming back to: **an LLM is a spreadsheet, not an oracle.** The same applies to frameworks. A framework doesn't raise a model's reasoning quality. What it raises is *the odds of recovering when the model is wrong* and *how fast you notice it was wrong.* Viewed through this lens, tool selection becomes much simpler.

This market went through a consolidation between Q4 2025 and the first half of 2026. LangChain and LangGraph shipped 1.0 in October 2025, and Microsoft Agent Framework (MAF) went through an RC in February 2026 before reaching .NET/Python 1.0 GA in April. AutoGen and Semantic Kernel are both on a path to being absorbed into MAF. In other words, this isn't a moment for picking a framework — it's a moment for **deciding which layer you want to hand off to a framework.**

---

## 2. Concepts — The Three Layers of the Agent Stack

The reason these frameworks feel incomparable is that they operate at different layers. Let's split them apart first.

| Layer | What it does | What breaks without it | Representative implementations |
| --- | --- | --- | --- |
| **L1. Agent harness** | The model-call → tool-call → inject-result → re-call loop, structured output, retries | You can write it yourself (tens of lines). But add streaming, token accounting, and error branching and it quickly becomes hundreds of lines | LangChain `create_agent`, MAF `agent`, Eino ADK |
| **L2. Orchestration** | Multi-agent graphs, conditional routing, parallel/sequential/group collaboration, sub-workflows | State passed between agents degrades into a global dict. Debugging becomes impossible | LangGraph, MAF `workflow`, CrewAI Flows |
| **L3. Runtime / operations** | Checkpointing, restarts, durable execution, HITL interrupts, observability (OTel), deployment | A long-running task loses everything on a single process restart | LangGraph durable execution, MAF checkpointing, Foundry Hosted Agents |

The key point is that **L3 is the real moat.** Anyone can write L1, and L2 can be expressed as code, but the property of "a three-day approval workflow keeps going even if the server dies" effectively means building a task queue + state store + idempotency design from scratch if you try to implement it yourself.

### 2.1 Not using a framework is also a legitimate choice

There's a particularly strong counter-argument in the Go community. The agent loop itself is short, OpenAI, Anthropic, and Google all provide official Go SDKs, and Go engineers customarily prefer the standard library plus a handful of dependencies. In fact, as of mid-2026, a large share of Go teams don't use a framework at all.

There's also a security angle layered on top. A multi-provider SDK is **the single point where every provider's API key ends up concentrated.** The dependency tree itself is becoming an attack surface.

| Project | Approximate dependency count (community measurement, as of 2026-04) |
| --- | --- |
| LangChainGo | 170+ |
| Genkit Go | 129 |
| Eino | 37 |
| Lightweight SDKs (GoAI, etc.) | 2–5 |

After the 2025–2026 LiteLLM package tampering incident and the npm axios supply-chain breach, this table is no longer just a reference figure. From a CTI standpoint, adopting an agent framework is **a trade-off between runtime convenience and supply-chain exposure.**

---

## 3. Microsoft Agent Framework for Go

> Repository: `github.com/microsoft/agent-framework-go` · License MIT · Language 100% Go

### 3.1 Summary

MAF is a multi-language open-source framework spanning .NET, Python, and Go, aimed at going beyond prototypes to **agents actually operated in production.** It supports a broad ecosystem including Microsoft Foundry, Azure OpenAI, OpenAI, MCP, A2A, AG-UI, and the GitHub Copilot SDK.

There's one important structural fact. **The Go implementation is developed in a separate repository from the mainline .NET/Python repo, and it's in public preview.** In other words, the "MAF 1.0 GA" headline is a .NET/Python story, not a Go story. Missing this distinction leads to disappointment once you notice how many features are actually missing when planning an adoption.

| Item | .NET / Python | Go |
| --- | --- | --- |
| Status | 1.0 GA (2026-04) | Public preview |
| Repository | `microsoft/agent-framework` | `microsoft/agent-framework-go` (separate) |
| Breadth of product integration | Wide | Narrow |
| Unimplemented features | Mostly resolved | Numerous (see §3.3) |

### 3.2 Advantages

1. **Fully leverages Go's runtime characteristics** — goroutine-based concurrency, low memory footprint, single-binary deployment. Agent workloads are inherently long-running, concurrent, and I/O-bound, so they map well onto Go's shape.
2. **Operational features built into the framework** — checkpointing, restartability, streaming, human-in-the-loop (HITL), and time-travel patterns provided at the workflow layer.
3. **Graph-based orchestration** — supports sequential, concurrent, group-collaboration, conditional-routing, and sub-workflow patterns.
4. **Middleware chain** — request/response handling, logging, OpenTelemetry, context providers, **tool approval**, and automatic tool calling. The tool-approval middleware matters especially from a security standpoint (see §7).
5. **First-class observability** — OpenTelemetry integration for both agents and workflows.
6. **Provider flexibility** — not tied to a specific LLM vendor; you can swap without rewriting the architecture.
7. **Agent Skills** — build a domain knowledge base from files, inline definitions, or scripts that agents can discover and use.
8. **MIT license** — low barrier to commercial use.

### 3.3 Drawbacks and Limitations

The unimplemented list is not short. Based on the repository README and the .NET–Go feature comparison document, it breaks down as follows.

| Missing feature | Impact |
| --- | --- |
| **Handoff orchestration** | You have to build control-transfer patterns between agents yourself. Directly impacts customer-facing routing scenarios |
| **Declarative agents** | No YAML/JSON-config-based agent definitions → can't modify agents without a code deployment |
| **RAG** | Retrieval-augmented pipelines need to be built separately |
| **CodeAct** | No support for code-execution-based actions |
| **Functional workflows** | No support for functional-workflow style |
| **Foundry-hosted deployment** | Can't deploy directly to Foundry (requires a container workaround, etc.) |
| **DevUI / AF Labs** | No developer UI or experimental features → local debugging experience is worse than Python's |

Additional points to consider

- **Ecosystem maturity** — less product integration than .NET, and the API surface is still moving. You should assume breaking changes are possible in the preview stage.
- **Small community size** — see the fact-check below.
- **Third-party system responsibility shift** — if you use external servers, agents, or models instead of the Azure Direct model, responsibility for data flow, cost, and compliance falls entirely on you. Microsoft's documentation states this explicitly.
- **The `DefaultAzureCredential` trap** — it's meant for development convenience. In production, you should specify a concrete credential such as a managed identity. The fallback mechanism performs a sequential search, adding latency and creating a security risk that an unintended credential gets picked.

### 3.4 Fact-Check — Circulating Figures Contain Errors

Several summaries describe this repository as having "360 stars, 14 contributors." **A direct check of the repository page in July 2026 shows roughly 16 stars, 1 fork, 3 contributors, 406 commits, and no published release.** The figure of 360 appears to be confused with the mainline `microsoft/agent-framework` repository (tens of thousands) or a different project.

This gap isn't trivial. 16 stars versus 360 stars implies entirely different expectations about **"will I get a response if I file an issue."** If you're basing an adoption decision on community size, be sure to check the repository directly.

> Metrics change depending on when they're checked. The figures above are as of July 2026; when citing them, it's advisable to note the snapshot date alongside.

---

## 4. LangChain 1.0 / LangGraph 1.0

### 4.1 The division of roles is now clear after 1.0

The October 2025 1.0 release redefined the relationship between the two projects. Previously the framing was "use LangChain, and move to LangGraph if it's insufficient," but now **LangChain is a higher-level abstraction sitting on top of the LangGraph runtime.**

| Dimension | LangChain 1.0 | LangGraph 1.0 |
| --- | --- | --- |
| Layer | L1 (agent harness) | L2 + L3 (orchestration + runtime) |
| Core API | `create_agent` | `StateGraph`, checkpointers, `interrupt` |
| Orientation | Build and ship fast | Fine-grained control and durability |
| Execution model | Standard tool-calling loop | Graph-based execution (branches, loops, state revisits) |
| Stability commitment | No breaking changes before 2.0 | Same |
| Languages | Python, TypeScript | Python, TypeScript |

LangChain 1.0 was rewritten to focus on the core agent loop, and introduced a new concept, **middleware**, providing HITL, summarization, and PII masking as built-in middleware. Structured output was integrated into the main loop, eliminating an extra LLM call and reducing both latency and cost.

LangGraph 1.0 bills itself as "the first stable major release in the space of durable agent frameworks." The only significant change is the deprecation of `langgraph.prebuilt`, with its functionality moved to `langchain.agents`. Backward compatibility is preserved.

### 4.2 LangGraph's Decisive Strength — Durable Execution

The reason to use LangGraph essentially comes down to one thing: **state persists automatically.** Even if the server restarts mid-conversation, or a long-running workflow is interrupted, execution resumes precisely at the point it stopped. Because persistence and resumption happen without custom DB logic, you can express approval processes spanning several days or background work that crosses sessions.

HITL is also a first-class API. Pausing execution for human review, revision, or approval comes down to a single line: `interrupt`. In systems that need a human in the loop for high-stakes decisions, this one line dictates the entire architecture.

### 4.3 Advantages

1. **An overwhelming ecosystem** — #1 in integration count, documentation, examples, Stack Overflow answers, and the job market. Tens of millions of downloads per month.
2. **Production references** — Uber, LinkedIn, Klarna, and J.P. Morgan have publicly stated they run LangGraph in production.
3. **Mixed expression of determinism and agency** — real systems are never 100% agentic nor 100% deterministic. You can explicitly model a structure where some branches use fixed logic and others use LLM judgment, via a graph.
4. **LangSmith integration** — observability, evaluation, and deployment tooling attach across the lifecycle.
5. **Dynamic tool calling** — control the set of available tools per execution point.

### 4.4 Drawbacks

1. **Python/TypeScript only** — can't be directly attached to Go, Java, or Rust backends. You'd need to split it out as an HTTP service or switch languages.
2. **Weight of the abstraction layer** — early LangChain was criticized for building a "customization wall" through hidden prompts and implicit context manipulation. 1.0 resolved much of this, but there's still a burden of having to read what the framework is doing.
3. **Dependency footprint** — not lightweight from a supply-chain perspective.
4. **Coupling with a commercial product** — LangSmith is not open source. Using observability to its fullest puts you on a commercial path. You can substitute your own OTel stack, but the integration quality differs.
5. **A different position on the learning curve** — LangChain is easy, LangGraph is hard. You need to understand state schemas, reducers, checkpointers, and the thread concept.

---

## 5. Full Map of Competing Projects

### 5.1 Positioning by Language and Layer

| Project | Language | Primary layer | Status (2026-07) | One-line description |
| --- | --- | --- | --- | --- |
| **Microsoft Agent Framework** | C#, Python | L1–L3 | 1.0 GA (2026-04) | Successor to SK/AutoGen. Oriented toward enterprise governance |
| **Microsoft Agent Framework for Go** | Go | L1–L3 | Public preview | The Go implementation above. Feature gaps exist |
| **LangGraph** | Python, TS | L2–L3 | 1.0 GA (2025-10) | Durable state-graph runtime. The de facto standard |
| **LangChain** | Python, TS | L1 | 1.0 GA (2025-10) | The fastest path to building an agent |
| **AutoGen** | Python | L2 | On a path into MAF | Started from multi-agent conversation/collaboration research |
| **Semantic Kernel** | C#, Python, Java | L1–L2 | On a path into MAF | Lightweight orchestration SDK. Migration tooling provided |
| **CrewAI** | Python | L2 | Active | Role-based collaboration + event-driven Flows |
| **Google ADK** | Python, **Go**, Java | L1–L2 | Go 1.0 (2025-11) | Sequential/parallel/loop agent primitives, native OTel |
| **Genkit** | **Go**, JS | L1 | Production-oriented | Flow-centric. Strong local debugging/tracing |
| **Eino (CloudWeGo)** | **Go** | L1–L2 | Active, validated at large-scale operation | Used in production at ByteDance. Component graph, circuit breaker/backoff |
| **LangChainGo** | **Go** | L1 | Community port | Widest surface area, lags behind the mainline |
| **OpenAI Agents SDK** | Python, **Go** | L1 | Active | Handoffs + guardrails, MCP support |
| **Dify** | Python (product) | GUI | Active | No-code workflow / RAG pipelines |

### 5.2 Competitors Within the Go Camp

"Real, but young" is the accurate description of the Go agent ecosystem. Reference figures from community tallies as of May 2026:

| Framework | Stars (approx.) | MCP support | Strengths |
| --- | --- | --- | --- |
| Eino | 11,100+ | Unsupported (as of that time) | Production hardening, graph composition |
| LangChainGo | 9,200+ | Unsupported (as of that time) | 10+ providers, a complete RAG pipeline |
| Google ADK Go | — | Supported | Reached 1.0, native OTel |
| OpenAI Agents Go | 255 | Supported | Handoffs + guardrails |
| **MAF for Go** | ~16 | Supported (MCP/A2A/AG-UI) | Aligned with Azure/Foundry, checkpointing |

If MCP integration is the priority, Google ADK Go, OpenAI Agents Go, and MAF Go are candidates. For pure throughput and proven stability, Eino is strong. On the other hand, **if Azure Entra ID/Purview/Defender-based governance is a requirement, there's effectively no alternative to MAF.** This is the one sufficient reason MAF Go stays under consideration despite its low star count.

---

## 6. Selection Criteria — What Should You Use for Which Workload?

### 6.1 Decision order

```
1) Is the language stack fixed?
   Go/single-binary required → MAF Go / Eino / ADK Go / no framework
   Python·TS is possible     → go to 2)

2) Does execution run for minutes or more, or involve a human approval step midway?
   Yes  → LangGraph (or MAF workflow)
   No → go to 3)

3) Is the organization within an Azure/Entra governance boundary?
   Yes  → MAF (.NET/Python) + Foundry Hosted Agents
   No → start with LangChain create_agent, drop down to LangGraph if needed

4) Do non-developers need to modify the workflow?
   Yes → GUI-based tools like Dify
```

### 6.2 Concrete Use Cases

| Scenario | Recommendation | Reason |
| --- | --- | --- |
| Internal document Q&A bot, 3–5 tools | **LangChain `create_agent`** | Ships in a day. No graph needed |
| A 3-day multi-stage approval pipeline | **LangGraph** | Durable state + `interrupt`. Resilient to server restarts |
| Multi-agent research → verification → report drafting | **LangGraph** or **CrewAI** | The former if you need graph control, the latter for role-based collaboration description |
| An agent monitoring exchange quotes/order flow in real time | **Go: MAF Go / Eino / no framework** | Latency and GC pressure dominate. Keep the Python runtime off the critical path |
| A CTI ingestion → normalization → report drafting pipeline | **LangGraph + a separate collector** | Per-source failure isolation and retry points need to be explicit |
| An internal agent deployed to Microsoft 365 / Teams | **MAF (.NET/Python)** | Foundry Hosted Agents, Teams/M365 Copilot publishing path |
| An existing Semantic Kernel / AutoGen codebase | **Migrate to MAF** | Official migration guide and tooling provided |
| A non-developer planner needs to edit prompt chains directly | **Dify** | Declarative GUI. Versioning and audit still need separate design |
| Agent logic fits in a 40-line loop | **No framework** | This is the majority position among Go teams |

### 6.3 A Hybrid Deployment Is Realistic

Foundry's hosted runtime is designed to be **framework-agnostic**, letting you deploy agents built with MAF, the GitHub Copilot SDK, LangGraph, and others without rewriting them. In other words, a combination like "orchestration on LangGraph, hosting and governance on Foundry" is viable. It's practically advantageous not to treat framework choice as all-or-nothing.

---

## 7. Getting Started for Beginners

### 7.1 Microsoft Agent Framework for Go

**Install**

```bash
go get github.com/microsoft/agent-framework-go
```

**Environment variables**

```bash
export FOUNDRY_PROJECT_ENDPOINT="<your-endpoint>"
export FOUNDRY_MODEL="gpt-4o-mini"   # optional
az login                              # secure credential source
```

**A basic agent**

```go
package main

import (
	"cmp"
	"context"
	"fmt"
	"os"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/microsoft/agent-framework-go/provider/foundryprovider"
)

func main() {
	endpoint := os.Getenv("FOUNDRY_PROJECT_ENDPOINT")
	model := cmp.Or(os.Getenv("FOUNDRY_MODEL"), "gpt-4o-mini")

	// Authenticate with Microsoft Foundry
	token, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		panic(err)
	}

	// Create the Foundry agent
	a := foundryprovider.NewAgent(endpoint, token, foundryprovider.ModelDeployment(model),
		foundryprovider.AgentConfig{
			Instructions: "You are a helpful assistant.",
		},
	)

	// Run it
	ctx := context.Background()
	fmt.Println(a.RunText(ctx, "Write a haiku about the Microsoft Agent Framework").Collect())
}
```

**The one line you must change before going to production**

```go
// Development: probes multiple credential sources sequentially → latency, false positives, security risk
token, _ := azidentity.NewDefaultAzureCredential(nil)

// Production: specify the credential to use explicitly
token, _ := azidentity.NewManagedIdentityCredential(&azidentity.ManagedIdentityCredentialOptions{
	ID: azidentity.ClientID("<user-assigned-client-id>"),
})
```

**Directories to look at next**

| Path | Contents |
| --- | --- |
| `examples/01-get-started` | hello world → step by step up to workflows |
| `examples/02-agents` | Tools, middleware, providers, observability, A2A, AG-UI, MCP, skills |
| `examples/03-workflows` | Multi-agent patterns, routing, checkpointing |
| `examples/05-end-to-end` | Complete applications |
| `docs/dotnet-go-sdk-feature-comparison.md` | **Must-read before adoption.** The feature gap vs. .NET |
| `provider/` | List of provider packages (check options beyond Foundry) |

**Troubleshooting summary**

| Symptom | Cause | Action |
| --- | --- | --- |
| Azure credential authentication failure | Not logged into Azure CLI, or credential source not configured | Run `az login`, or explicitly configure the credential to use |
| API key error | Wrong key, or mismatched with the target resource | Verify the key against its corresponding resource/provider |
| Provider endpoint error | Missing or mistyped endpoint, deployment name, model, or API version | Cross-check the sample's environment variables and constructor options |

---

### 7.2 LangChain 1.0 — The Fastest Path

```bash
pip install --upgrade langchain
```

```python
from langchain.agents import create_agent
from langchain.tools import tool


@tool
def get_close_price(ticker: str) -> str:
    """Return the recent closing price for the given ticker."""
    # In a real implementation, call an actual data source
    return f"{ticker}: no lookup result"


agent = create_agent(
    model="openai:gpt-4.1-mini",
    tools=[get_close_price],
    system_prompt=(
        "You are a market-data lookup assistant. "
        "If a tool returns no value, answer 'no data available'. "
        "Never fabricate a number."
    ),
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "What's NVDA's recent closing price?"}]}
)
print(result["messages"][-1].content)
```

That last sentence in the system prompt isn't boilerplate. A model fabricating a plausible-looking number when a tool call fails is the most common and most expensive failure mode in agent systems. It will happen without exception if you don't specify the behavior for an empty tool result.

---

### 7.3 LangGraph 1.0 — Checkpoints + Human Approval

```bash
pip install --upgrade langgraph langchain
```

```python
from typing import Annotated, TypedDict

from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt, Command


class State(TypedDict):
    messages: Annotated[list, add_messages]
    approval: str


llm = init_chat_model("openai:gpt-4.1-mini")


def analyze(state: State):
    """Produce a first-pass analysis draft"""
    resp = llm.invoke(state["messages"])
    return {"messages": [resp]}


def human_review(state: State):
    """Pause execution and wait for human approval"""
    decision = interrupt(
        {
            "question": "Do you approve this judgment?",
            "draft": state["messages"][-1].content,
        }
    )
    return {"approval": decision}


def finalize(state: State):
    if state["approval"] != "approved":
        return {"messages": [{"role": "assistant", "content": "Rejected. Needs revision."}]}
    return {"messages": [{"role": "assistant", "content": "Approved. Added to the deployment queue."}]}


builder = StateGraph(State)
builder.add_node("analyze", analyze)
builder.add_node("human_review", human_review)
builder.add_node("finalize", finalize)

builder.add_edge(START, "analyze")
builder.add_edge("analyze", "human_review")
builder.add_edge("human_review", "finalize")
builder.add_edge("finalize", END)

# The checkpointer is the core of durable execution. Use a Postgres/Redis checkpointer in production
graph = builder.compile(checkpointer=InMemorySaver())

config = {"configurable": {"thread_id": "review-001"}}

# Step 1: pauses at the interrupt point
for event in graph.stream(
    {"messages": [{"role": "user", "content": "Summarize this quarter's risk."}]},
    config,
):
    print(event)

# ... the process can safely die here. State stays with the checkpointer ...

# Step 2: once a human approves days later, resume exactly from that point
final = graph.invoke(Command(resume="approved"), config)
print(final["messages"][-1].content)
```

**Three things to notice here**

1. `thread_id` is the identity of the conversation/task. Resumption happens through this key.
2. `InMemorySaver` is example-only. If you use this as-is in production, the whole rationale for adopting durability disappears.
3. The `interrupt` call site **re-executes the node from the beginning upon resume.** So placing side effects (payments, sending email, orders) before the interrupt causes duplicate execution. Move side effects into a node after the interrupt.

---

### 7.4 In Go, Without a Framework — Structural Analysis

Writing this structure by hand once, before adopting a framework, makes clear exactly what the framework is doing for you. Below is a conceptual structure that isn't tied to any particular vendor SDK.

```go
// Conceptual sketch: swap in whichever vendor SDK's actual types you're using
func RunAgent(ctx context.Context, c ModelClient, tools map[string]Tool, prompt string) (string, error) {
	msgs := []Message{{Role: "user", Content: prompt}}

	for turn := 0; turn < maxTurns; turn++ {
		resp, err := c.Complete(ctx, msgs, toolSpecs(tools))
		if err != nil {
			return "", err
		}
		msgs = append(msgs, resp.Message)

		if len(resp.ToolCalls) == 0 {
			return resp.Message.Content, nil // exit condition
		}

		// Concurrent execution: where Go's strength shows
		results := make([]Message, len(resp.ToolCalls))
		var wg sync.WaitGroup
		for i, call := range resp.ToolCalls {
			wg.Add(1)
			go func(i int, call ToolCall) {
				defer wg.Done()
				out, err := tools[call.Name].Invoke(ctx, call.Args)
				results[i] = toolResultMessage(call.ID, out, err) // return errors to the model too
			}(i, call)
		}
		wg.Wait()
		msgs = append(msgs, results...)
	}
	return "", fmt.Errorf("exceeded max turns (%d)", maxTurns)
}
```

What's **missing** from these roughly 40 lines is exactly the reason frameworks exist: checkpointing, resumption, streaming, token accounting, tool-approval gates, OTel spans, sub-agent routing, and context-window management. If two or three of these are all you actually need, writing it yourself is usually the better call.

---

## 8. Pre-Operations Checklist — Security and Governance Perspective

An agent framework is **a mechanism that grants an LLM execution authority.** Here's a list of items to verify before adoption.

| Area | What to check | Rationale |
| --- | --- | --- |
| **Supply chain** | The number of transitive dependencies in the framework and its signature-verification setup. For Go, `go.sum` + the GOPROXY transparency log is the line of defense | Numerous package-tampering incidents in 2025–2026 |
| **MCP trust boundary** | MCP servers are external code. Pin the server list/permissions to a whitelist and don't enable dynamic discovery in production | MCP tool descriptions themselves are a prompt-injection vector |
| **Tool approval** | Destructive operations (file deletion, money transfers, deployments) must sit behind an approval middleware. Use MAF's tool approval or LangChain's HITL middleware | Automatic tool calling is the default in many frameworks |
| **Credentials** | Ban fallback-style credentials (`DefaultAzureCredential`, etc.). Specify explicitly, e.g. via managed identity | Official Microsoft recommendation |
| **Data boundary** | When using third-party models/agents, review whether data crosses your organization's compliance/geographic boundaries. Responsibility falls on the user | Explicitly stated in MAF documentation |
| **Observability** | OTel spans may carry raw prompt/response text. Establish a masking policy first | A leakage vector for PII/trade secrets |
| **Side-effect idempotency** | Check that no operation gets duplicated on resume/retry | See §7.3 |
| **Version pinning** | Recommend pinning preview-stage SDKs to a specific commit | MAF Go has not published release tags |

---

## 9. Summary

Choose your solution through the following lens.

1. **Decide the layer first.** Sorting out whether what you need is a tool loop (L1), a graph (L2), or a durable runtime (L3) narrows the candidates to two or three. What most teams actually want is L3, and that's the one thing that's expensive to build yourself.

2. **The language dominates the decision.** For Python/TS, LangGraph is the realistic default; for .NET, MAF is the default. For Go, the options are thin. MAF Go's direction is right, but as of July 2026 it's still in public preview, lacking handoffs, declarative agents, RAG, CodeAct, and DevUI, with a very small community. If Azure governance isn't a requirement, Eino, ADK Go, or a no-framework implementation may be the safer choice.

3. **A framework buys failure handling, not performance.** If an adoption review document says "performance improves," that document is wrong. The correct statement is "failures become observable and recoverable." An LLM is a spreadsheet, not an oracle, and a framework is the tool that turns that spreadsheet into an auditable one.

The practical recommendation for MAF Go is as follows. **Keep it at the pilot/PoC stage for now, and first check whether your required features are implemented in `docs/dotnet-go-sdk-feature-comparison.md`.** If handoff orchestration is among your requirements, it's not currently a candidate for adoption.

---

## Appendix A. Reference Links

| Item | URL |
| --- | --- |
| Microsoft Agent Framework for Go | https://github.com/microsoft/agent-framework-go |
| .NET–Go feature comparison document | https://github.com/microsoft/agent-framework-go/blob/main/docs/dotnet-go-sdk-feature-comparison.md |
| Go reference | https://pkg.go.dev/github.com/microsoft/agent-framework-go |
| MAF mainline (.NET/Python) | https://github.com/microsoft/agent-framework |
| MS Learn documentation | https://learn.microsoft.com/agent-framework/ |
| Agent Framework dev blog | https://devblogs.microsoft.com/agent-framework/ |
| LangChain·LangGraph 1.0 announcement | https://blog.langchain.com/langchain-langgraph-1dot0/ |
| LangGraph 1.0 changelog | https://changelog.langchain.com/announcements/langgraph-1-0-is-now-generally-available |
| Eino (CloudWeGo) | https://github.com/cloudwego/eino |
| Foundry Build 2026 summary | https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-build-2026/ |

## Appendix B. Glossary

| Abbreviation | Full form | Meaning |
| --- | --- | --- |
| MAF | Microsoft Agent Framework | Microsoft's multi-language agent framework |
| MCP | Model Context Protocol | Standard protocol for models to discover/call external tools |
| A2A | Agent-to-Agent | A messaging protocol between agents across runtimes |
| AG-UI | Agent-GUI protocol | A protocol for interaction between agents and user interfaces |
| HITL | Human-in-the-Loop | A pattern that inserts human review/approval during execution |
| OTel | OpenTelemetry | Standard for distributed tracing and metrics collection |
| SK | Semantic Kernel | Microsoft's previous-generation orchestration SDK |
| GA | General Availability | Official release, supported for production |

---

*Data as of: July 22, 2026. GitHub metrics and framework feature lists change quickly. Cite the snapshot date alongside any figures and check the repository directly before making an adoption decision.*

*This piece is provided for informational purposes and is not an endorsement of any specific product or investment advice.*
