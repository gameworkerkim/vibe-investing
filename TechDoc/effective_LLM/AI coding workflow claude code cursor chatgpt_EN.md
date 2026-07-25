---
title: "Maximizing Development Productivity with Claude Code + Cursor + ChatGPT"
subtitle: "The complete practical workflow and prompt cookbook"
description: "A practical guide to building a multi-LLM development workflow with ChatGPT, Claude Code, and Cursor, covering design, implementation, review, and documentation, plus a CLAUDE.md template, Cursor Rules template, and a 50-prompt AI code review cookbook."
abstract: |
  The era of simply handing code to an AI is over. This guide shares techniques for using multiple LLMs together to get more efficient, optimized results.
  Development quality scales with how well you deploy AI across the full cycle - design, implementation, review, refinement, documentation - and developers who do this consistently produce faster, better code.
  The guide assigns each tool a role (ChatGPT as tech lead, Claude Code as senior engineer, Cursor as pair programmer), walks through a concrete 9-step workflow, and provides ready-to-use CLAUDE.md and Cursor Rules templates plus a 50-item AI code review prompt cookbook.
summary_for_ai: |
  This document is a practical workflow guide for combining ChatGPT, Claude Code, and Cursor in software development, assigning each tool a distinct role: ChatGPT as tech lead (requirements analysis, design review), Claude Code as senior engineer (implementation, refactoring, large-scale code changes, test generation), and Cursor as pair programmer (in-IDE code generation, rapid iteration, pattern application).
  It presents a concrete 9-step workflow: (1) ChatGPT clarifies requirements, (2) ChatGPT reviews the design critically, (3) Claude Code implements using role assignment / APEI (Analyze-Plan-Execute-Iterate) / numeric targets, (4) Cursor does fast in-IDE edits, (5) ChatGPT does adversarial code review ("Grill Me" / "10x Engineer" prompts), (6) Claude Code applies review feedback (repeated 2-3 times), (7) git diff-based review by both Claude and ChatGPT, (8) AI-driven TDD (tests before implementation), (9) automated documentation (README, ADR, ops guides, changelog).
  It includes a full CLAUDE.md project-rules template (architecture, naming, code style, testing, error handling, logging, security, performance, documentation conventions) and a Cursor Rules template (role, code generation principles, language-specific rules for Java/Spring and TypeScript/React, testing/refactoring/PR rules, output format).
  It closes with a 50-prompt AI code review cookbook organized into five categories of 10 prompts each: general review, performance review, security review, design review, and test review.
date: 2026-06-16
author: "Dennis Kim"
lang: en
tags:
  - AI Coding
  - Claude Code
  - Cursor
  - ChatGPT
  - Prompt Engineering
  - Developer Productivity
keywords:
  - AI coding workflow
  - Claude Code Cursor ChatGPT
  - CLAUDE.md template
  - Cursor Rules template
  - AI code review prompts
  - multi-LLM development workflow
group: llm-agents
featured: false
schema_type: TechArticle
draft: false
---

# Maximizing Development Productivity with Claude Code + Cursor + ChatGPT

> **The complete practical workflow + prompt cookbook**

The era of simply handing code to an AI is over. I want to share techniques for using multiple LLMs together to get more efficient and better-optimized results.
Development is a field where quality scales directly with what you know, so how efficiently you use LLMs for design, review, and even security shapes the final output.
Today, the people who deploy AI across the entire cycle - **design -> implementation -> review -> refinement -> documentation** - build faster and better code.

---

## Table of Contents

1. [Why use Claude, Cursor, and ChatGPT together?](#1-why-use-claude-cursor-and-chatgpt-together)
2. [The Actual Workflow (9 Steps)](#2-the-actual-workflow-9-steps)
3. [CLAUDE.md Template](#3-claudemd-template)
4. [Cursor Rules Template](#4-cursor-rules-template)
5. [Practical Prompt Cookbook](#5-practical-prompt-cookbook)
6. [50 AI Code Review Prompts](#6-50-ai-code-review-prompts)
7. [Final Workflow Summary](#7-final-workflow-summary)
8. [Conclusion](#8-conclusion)

---

## 1. Why use Claude, Cursor, and ChatGPT together?

Many developers ask:

> "Is Claude better?" "Is ChatGPT better?" "Can't I just use Cursor alone?"

Developers with genuinely high productivity don't rely on a single tool. They **split responsibilities by each tool's strengths**.

| Tool | Role | Best at |
|------|------|----------------|
| **ChatGPT** | Tech Lead | Requirements analysis, design validation, architecture review |
| **Claude Code** | Senior Engineer | Implementation, refactoring, large-scale code changes, test generation |
| **Cursor** | Pair Programmer | In-IDE code generation, rapid iteration, quick pattern application |

> Think of AI as members of your dev team. Using multiple LLMs, each for what it does best, gets you more optimized results.

---

## 2. The Actual Workflow (9 Steps)

### STEP 1 — Clarify requirements with ChatGPT

The very first thing to do before starting development.

```
Analyze the following requirements.

Goal: Implement a JWT authentication server
Requirements:
- Spring Boot
- Redis for refresh tokens
- 30-minute access token
- 14-day refresh token
- OAuth2-extensible

First, write an implementation plan,
and point out anything I've missed.
```

**What you get:** A clarified scope / discovery of missed requirements / an API list / a proposed DB structure / a risk analysis

---

### STEP 2 — Get the design validated by ChatGPT

Even if you designed it yourself, don't jump straight into implementation.

```
Review this from the perspective of a senior backend engineer.
Critically analyze it for scalability / performance / security / maintainability.

Don't tell me what's good - only find the problems.
```

> **Tip:** Adding "don't tell me what's good" makes the AI review far more aggressively.

---

### STEP 3 — Hand off implementation to Claude Code

Once the design is done, hand implementation to Claude Code. Claude is especially strong at **large-scale code generation, cross-file references, refactoring, and test generation**.

**3 ways to get more out of Claude**

**① Assign a role**
```
You are a senior backend engineer with 15 years of experience.
Follow Clean Architecture,
and prioritize maintainability and testability above all else.
```

**② Use the APEI method**
```
1. Analyze  — Analyze the requirements and the current code
2. Plan     — Lay out an implementation plan first
3. Execute  — Implement according to the plan
4. Iterate  — Review the result and improve it
```

**③ State goals as numbers**
```
Goals:
- TPS of 1000 or higher
- Response time under 100ms
- Test coverage of 80% or higher
- Maintainability considered

Implement to satisfy the above conditions.
```

---

### STEP 4 — Fast edits in Cursor

Finish off the code Claude generated inside Cursor. Because it operates directly in the IDE, iteration is very efficient.

```
Convert all logs in this file to structured logging.
Unify the exception-handling pattern.
Add Swagger annotations to every API.
```

---

### STEP 5 — Hand code review to ChatGPT

Always do this after implementation.

```
Review this code.
Perspectives: performance / security / maintainability / scalability
Exclude the good parts - only find problems.
```

**Powerful add-on prompts:**

```
# Grill Me
Be merciless in critiquing this change.

# 10x Engineer
What would a 10x engineer have done differently?
```

---

### STEP 6 — Have Claude apply the improvements

Pass the issues ChatGPT found back to Claude. **Repeating this cycle 2-3 times** meaningfully improves code quality.

```
Improve the code based on the following review.
[paste review content]
```

---

### STEP 7 — Git diff-based review

```bash
git diff main..feature/my-branch
```

Feed the result straight to the AI.

```
# To Claude
Review this change.

# To ChatGPT
Review this as if it were a PR, and only point out problems.
```

---

### STEP 8 — TDD for the AI era

Have the AI write tests before the implementation.

```
# Step 1
Don't implement yet - just write the test code first.

# Step 2
Now write an implementation that passes this test.
```

> AI and TDD go together far better than you'd expect.

---

### STEP 9 — Automate documentation

```
Write a README.
Write an ADR (Architecture Decision Record).
Write an operations guide.
Write API documentation.
Update the CHANGELOG based on the changes.
```

---

## 3. CLAUDE.md Template

Essentially mandatory if you use Claude Code. Create a `CLAUDE.md` file at the project root, and Claude automatically reads it at the start of every session to maintain **consistency across the whole project**.

```markdown
# Project Rules for Claude

## Project Overview
- Project name: [project name]
- Language/framework: [e.g. Java 17 / Spring Boot 3.x]
- Goal: [core goal in 1-2 lines]

## Architecture
- Follow Clean Architecture (separate Controller -> Service -> Repository layers)
- Service layer is mandatory — no business logic in controllers
- No direct Repository access (must go through Service)
- Domain objects follow immutable design principles

## Naming Conventions
- DTO classes: use `XxxRequest`, `XxxResponse` suffixes
- Separate Service interface from implementation: `XxxService` / `XxxServiceImpl`
- Separate Command and Query (apply CQRS pattern)
- Constants in `UPPER_SNAKE_CASE`, variables in `camelCase`

## Code Style
- Max function length: 30 lines
- No more than 2 levels of nested if-else — use early return
- No magic numbers — extract to constants
- Comments should explain "why," not "what"

## Testing
- Unit tests required for every Service method
- Integration tests required for every API endpoint
- Target test coverage: 80% or higher
- Test naming: `methodName_scenario_expectedResult` format

## Error Handling
- Use custom exceptions (`BusinessException`, `ValidationException`, etc.)
- Global exception handling via `@ControllerAdvice`
- Unified API error response format: `{ code, message, data }`

## Logging
- Use structured logging (JSON format)
- Log level guide: ERROR (failures), WARN (anomalies), INFO (main flow), DEBUG (development)
- Never log PII

## Security
- Prevent SQL injection: use only PreparedStatement or ORM parameter binding
- Prevent XSS: validate input and encode output
- Never hardcode secret keys or passwords — use environment variables or a vault

## Performance
- Avoid N+1 queries: use fetch joins or separate queries
- Pagination required: apply cursor-based pagination to list endpoints
- Caching strategy: always specify Redis TTL explicitly

## Documentation
- Swagger/OpenAPI annotations required on every public API
- Write an ADR (Architecture Decision Record) for complex business logic
- Keep the README always up to date
```

---

## 4. Cursor Rules Template

Create a `.cursorrules` file at the project root. Cursor automatically reads it to improve the quality of generated code.

```
# Cursor Rules

## Role
You are a Senior Software Engineer with 15+ years of experience.
Always prioritize: correctness > readability > performance > brevity.

## Code Generation Principles
- Write self-documenting code; minimize comments except for "why" explanations
- Prefer composition over inheritance
- Follow SOLID principles
- Apply DRY but avoid premature abstraction
- Always handle edge cases and error conditions

## Language-Specific Rules (Java/Spring)
- Use constructor injection, not field injection (no @Autowired)
- Return Optional<T> instead of null for nullable values
- Use records for immutable DTOs
- Prefer stream API over imperative loops for collection processing
- Always use @Transactional(readOnly = true) for read operations

## Language-Specific Rules (TypeScript/React)
- Use functional components with hooks only (no class components)
- Define explicit TypeScript types; avoid `any`
- Use React Query for server state, Zustand for client state
- Apply error boundaries for async component errors
- Prefer named exports over default exports

## Testing Rules
- Write tests first when implementing new features (TDD)
- One assertion per test case (or logically grouped)
- Use descriptive test names: given_when_then format
- Mock external dependencies (DB, API calls) in unit tests
- Use real DB in integration tests (Testcontainers)

## Refactoring Rules
- Never change behavior when refactoring; tests must pass before and after
- Extract method when function exceeds 20 lines
- Replace magic numbers/strings with named constants
- Eliminate code duplication > 3 occurrences

## PR / Commit Rules
- Commit messages: use feat / fix / refactor / test / docs / chore prefixes
- One logical change per commit
- PR description: Why -> What -> How to Test

## Output Format
- Always include necessary imports
- Show complete, runnable code (no placeholder comments like "// TODO: implement")
- If multiple approaches exist, briefly note the trade-offs
- Flag potential security issues immediately
```

---

## 5. Practical Prompt Cookbook

### Design & Architecture

```
# Tech stack selection
Recommend a suitable tech stack for [requirement].
Summarize the pros and cons of each option in a table, and explain the final recommendation.

# Architecture design
Design the architecture for [system name].
- Expected traffic: DAU [N], TPS [N]
- Key constraints: [priority order of latency / cost / scalability]
Include a diagram description and the reasoning behind each component choice.

# Database design
Design the ERD for [domain].
Include normalization level, indexing strategy, and partitioning considerations.

# API design
Following RESTful API design principles, write the API spec for [feature].
Include endpoints, HTTP methods, request/response schemas, and error codes.
```

---

### Implementation

```
# Feature implementation (detailed)
Implement [feature name].
- Language/framework: [e.g. Java 17 / Spring Boot 3]
- Architecture pattern: [Clean Architecture / Hexagonal]
- Non-functional requirements: TPS [N], response time under [N]ms
- Include test code
- Include error handling

# Refactoring
Refactor the code below.
[paste code]
- Improve readability
- Remove duplication
- Apply SOLID principles
Explain the before/after comparison and reasoning.

# Performance optimization
Find and optimize the performance bottlenecks in the code below.
[paste code]
State the expected improvement (in Big-O terms) and the trade-offs.

# Migration
Migrate [existing code/library] to [new code/library].
Include a phased transition strategy and a rollback plan.
```

---

### Testing

```
# Unit test generation
Write unit tests for the code below.
[paste code]
- Cover Happy Path, Edge Case, and Exception Case
- Test framework: [JUnit5 / Jest / pytest]
- Include mocking strategy explanation

# Integration test generation
Write integration tests for [API endpoint].
- Use a real DB (Testcontainers)
- Include auth/authorization scenarios
- Include data setup/teardown code

# Test coverage analysis
Analyze the test code below and find missing cases.
[paste test code]
List the tests that should be added, in priority order.

# Load test scenario
Write a load test scenario for [API name].
- Tool: [k6 / JMeter / Locust]
- Goal: TPS [N], P99 response time under [N]ms
- Include a gradual ramp-up scenario
```

---

### Security

```
# Security vulnerability check
Analyze the security vulnerabilities in the code below against the OWASP Top 10.
[paste code]
Present the risk level (High/Medium/Low) and the fix for each vulnerability.

# Authentication/authorization design
Design the authentication/authorization system for [system].
- Compare JWT vs. session
- Selection criteria for RBAC vs. ABAC
- Refresh token security strategy
- OAuth2/OIDC integration approach

# Encryption strategy
Establish an encryption strategy for [data].
Cover both data at rest and data in transit.
```

---

### Debugging

```
# Error analysis
Analyze the error log below and identify the cause and the fix.
[paste error log]
Include how to prevent recurrence.

# Performance analysis
Analyze the APM/profiling result below and suggest improvements.
[paste profiling result]

# Finding N+1 issues
Find N+1 query problems in the code below.
[paste code]
Rewrite it with optimized queries.
```

---

### Documentation

```
# README generation
Write a README.md for the code/project below.
[paste code/description]
Include: project overview, installation, usage, API reference, contributing, license

# ADR writing
Write an ADR (Architecture Decision Record) for [technical decision].
Include: context, decision, alternatives considered, consequences, trade-offs

# Technical debt documentation
Analyze and document the technical debt in the code below.
[paste code]
Summarize impact, cost to fix, and priority per debt item in a table

# Operations guide
Write an operations guide for [service name].
Include: deployment procedure, monitoring items, alert thresholds, incident playbook, rollback method
```

---

## 6. 50 AI Code Review Prompts

### General review (1-10)

```
1. Review this code as a senior engineer would. Skip the good parts, find only the problems.
2. Find everything that must be checked before merging this PR.
3. Find the parts of this code that will cause problems six months from now during maintenance.
4. Find the parts of this code that would be hard for a developer seeing it for the first time to understand.
5. Grill Me — be merciless in critiquing this code.
6. How would a 10x engineer have written this code differently?
7. Find the parts of this code with high cyclomatic complexity and suggest ways to simplify them.
8. Find parts of this code that violate SOLID principles.
9. Find duplicated code that violates the DRY principle.
10. Analyze this code's dependency structure and check for circular dependencies.
```

---

### Performance review (11-20)

```
11. Find the parts of this code that could become performance bottlenecks.
12. Find where unnecessary DB queries occur in this code (including N+1).
13. Find where memory leaks could occur in this code.
14. Find where applying caching would be effective in this code.
15. Find where async processing could improve this code.
16. Find queries in this code that aren't properly using indexes.
17. Find parts that could be improved to reduce GC pressure.
18. Find patterns in this code that could exhaust the connection pool.
19. Analyze this code's time complexity and suggest a more efficient algorithm.
20. Find where unnecessary serialization/deserialization occurs in this code.
```

---

### Security review (21-30)

```
21. Analyze this code's security vulnerabilities against the OWASP Top 10.
22. Find SQL injection vulnerabilities in this code.
23. Find API endpoints in this code that are missing authentication/authorization.
24. Find places where sensitive information (PII, passwords, tokens) is exposed in logs.
25. Find hardcoded secrets or credentials in this code.
26. Find parts of this code that could be vulnerable to XSS.
27. Find parts of this code with insufficient CSRF protection.
28. Find parts of this code that could have race conditions.
29. Find parts of this code that are missing input validation.
30. Find error messages that expose excessive internal information.
```

---

### Design review (31-40)

```
31. Review whether this code's layer separation is appropriate.
32. Find where the service layer has become excessively bloated (God Class pattern).
33. Find places where domain logic sits in the wrong layer.
34. Evaluate this code's scalability. Where would problems appear if requirements grew 10x?
35. Find places where a design pattern like Strategy or Factory would help.
36. Review whether this code's transaction boundaries are set correctly.
37. Find classes/functions that violate the Single Responsibility Principle (SRP).
38. Review whether this code's error-handling strategy is applied consistently.
39. Evaluate whether this code's API contract is safe against future changes.
40. Find places where an event-driven architecture would be an improvement.
```

---

### Test review (41-50)

```
41. Find missing test cases in this test code (focus on edge cases and exceptions).
42. Evaluate whether these tests are actually verifying anything meaningful (check for false positives).
43. Find inter-test dependencies (order dependence, shared global state) in this test code.
44. Improve the readability of this test code (apply the Arrange-Act-Assert pattern).
45. Find structures in this code that make unit testing impossible. Suggest how to refactor for testability.
46. Evaluate whether this mocking strategy is appropriate. Check for over-mocking or under-mocking.
47. Find ways to improve this test's execution speed.
48. Find parts of this test that could behave non-deterministically (flaky).
49. Analyze this code's test coverage and list the tests that must be added, in priority order.
50. Evaluate whether this integration test sufficiently reproduces the real production environment.
```

---

## 7. Final Workflow Summary

```
1. ChatGPT     -> Requirements analysis and gap-finding
2. ChatGPT     -> Design validation (find only the problems)
3. Claude Code -> Implementation based on CLAUDE.md
4. Claude Code -> TDD — tests first, implementation second
5. Cursor      -> In-IDE iteration and pattern unification
6. ChatGPT     -> Code review (Grill Me / 10x Engineer)
7. Claude Code -> Apply review feedback (repeat 2-3 times)
8. Git Diff    -> Simultaneous PR review by Claude + ChatGPT
9. AI          -> README / ADR / ops guide documentation
```

---

## 8. Conclusion

AI does not replace developers.

But **developers who use AI well are very likely to replace developers who don't.**

What matters isn't which model is better. What matters more is building a development process where you:

- **Think with ChatGPT**
- **Implement with Claude**
- **Boost productivity with Cursor**
- **And verify again with ChatGPT**

Don't use AI as just an autocomplete tool - use it as a **designer, reviewer, and senior engineer**.

Your productivity will change completely.

---

## Summary (for LinkedIn / social)

✔ **ChatGPT** -> Requirements analysis and design validation
✔ **Claude Code** -> Implementation and refactoring (consistency via CLAUDE.md)
✔ **Cursor** -> In-IDE productivity boost (via .cursorrules)
✔ **ChatGPT** -> Code review and final validation
✔ **50 AI code review prompts** -> Standardizing quality criteria

> This isn't an era of picking one AI - it's an era of **building an AI team**.

---

*#AI #ClaudeCode #ChatGPT #Cursor #SoftwareEngineering #DeveloperProductivity #Coding #Programming #GenerativeAI #PromptEngineering*
