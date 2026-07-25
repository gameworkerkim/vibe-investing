---
title: "用 Claude Code + Cursor + ChatGPT 将开发生产力最大化"
subtitle: "实战工作流 + Prompt 大全完整版"
description: "将 ChatGPT、Claude Code、Cursor 组合成多 LLM 开发工作流的实践指南，覆盖设计、实现、评审到文档化的全流程，并提供 CLAUDE.md 模板、Cursor Rules 模板和 50 条 AI 代码评审 Prompt。"
abstract: |
  把代码简单丢给 AI 的时代已经结束。本指南分享如何组合使用多个 LLM，获得更高效、更优化的成果。
  开发是一个"知道多少、质量就有多大差异"的领域，设计、评审甚至安全环节能多高效地使用 LLM，直接决定最终产出的质量。
  本文把 ChatGPT 定位为技术负责人、Claude Code 定位为高级工程师、Cursor 定位为结对编程伙伴，讲解一套完整的 9 步实战工作流，并提供可直接使用的 CLAUDE.md 模板、Cursor Rules 模板，以及 50 条 AI 代码评审 Prompt。
summary_for_ai: |
  本文是在软件开发中组合使用 ChatGPT、Claude Code、Cursor 的实践工作流指南，为每个工具分配明确角色：ChatGPT 作为技术负责人（需求分析、设计评审），Claude Code 作为高级工程师（实现、重构、大规模代码修改、测试生成），Cursor 作为结对编程伙伴（IDE 内代码生成、快速迭代、模式应用）。
  文中给出具体的 9 步工作流：(1) 用 ChatGPT 梳理需求，(2) 用 ChatGPT 批判性评审设计，(3) 用 Claude Code 通过角色赋予/APEI 方法（Analyze-Plan-Execute-Iterate）/数值化目标进行实现，(4) 在 Cursor 中快速修改，(5) 用 ChatGPT 进行对抗式代码评审（"Grill Me"/"10x Engineer" Prompt），(6) 用 Claude Code 应用评审反馈（重复 2-3 次），(7) 基于 git diff 的 Claude + ChatGPT 同步评审，(8) AI 时代的 TDD（先写测试再实现），(9) 文档自动化（README、ADR、运维指南、CHANGELOG）。
  文中包含完整的 CLAUDE.md 项目规则模板（架构、命名规范、代码风格、测试、错误处理、日志、安全、性能、文档约定）和 Cursor Rules 模板（角色定位、代码生成原则、Java/Spring 与 TypeScript/React 的语言专属规则、测试/重构/PR 规则、输出格式）。
  最后以 50 条 AI 代码评审 Prompt 收尾，分为通用评审、性能评审、安全评审、设计评审、测试评审五大类，每类 10 条。
date: 2026-06-16
author: "Dennis Kim"
lang: zh
tags:
  - AI 编程
  - Claude Code
  - Cursor
  - ChatGPT
  - Prompt 工程
  - 开发者生产力
keywords:
  - AI 编程工作流
  - Claude Code Cursor ChatGPT
  - CLAUDE.md 模板
  - Cursor Rules 模板
  - AI 代码评审 Prompt
  - 多 LLM 开发工作流
group: llm-agents
featured: false
schema_type: TechArticle
draft: false
---

# 用 Claude Code + Cursor + ChatGPT 将开发生产力最大化

> **实战工作流 + Prompt 大全完整版**

把代码简单丢给 AI 的时代已经结束。这里分享如何更高效地使用 LLM、组合多个 LLM 来获得更优化的成果的方法。
开发本质上是一个"知道多少、成果质量就有多大差异"的领域，设计、评审、甚至安全环节能多高效地使用 LLM，都会直接影响最终产出。

如今，能把 AI 部署到**设计 → 实现 → 评审 → 改进 → 文档化**整个开发周期的人，产出的代码更快、更好。

---

## 目录

1. [为什么要同时使用 Claude、Cursor、ChatGPT？](#1-为什么要同时使用-claudecursorchatgpt)
2. [实际工作流(9 个步骤)](#2-实际工作流9-个步骤)
3. [CLAUDE.md 模板](#3-claudemd-模板)
4. [Cursor Rules 模板](#4-cursor-rules-模板)
5. [实战 Prompt 大全](#5-实战-prompt-大全)
6. [50 条 AI 代码评审 Prompt](#6-50-条-ai-代码评审-prompt)
7. [最终工作流总结](#7-最终工作流总结)
8. [结语](#8-结语)

---

## 1. 为什么要同时使用 Claude、Cursor、ChatGPT？

许多开发者会问：

> "Claude 更好吗?""ChatGPT 更好吗?""只用 Cursor 不行吗?"

真正高生产力的开发者不会只用一个工具，而是**按各工具的长处分配角色**。

| 工具 | 角色 | 最擅长的事 |
|------|------|----------------|
| **ChatGPT** | 技术负责人 | 需求分析、设计验证、架构评审 |
| **Claude Code** | 高级工程师 | 实现、重构、大规模代码修改、测试生成 |
| **Cursor** | 结对编程伙伴 | IDE 内代码生成、反复修改、快速应用模式 |

> 把 AI 当作开发团队的成员来看会更容易理解。同时使用多个 LLM，各取所长，往往能得到更优化的结果。

---

## 2. 实际工作流(9 个步骤)

### STEP 1 — 用 ChatGPT 梳理需求

这是开发开始前最先要做的工作。

```
请分析以下需求。

目标：实现 JWT 认证服务器
需求：
- Spring Boot
- 用 Redis 存储 Refresh Token
- Access Token 有效期 30 分钟
- Refresh Token 有效期 14 天
- 可扩展支持 OAuth2

请先写出实现计划，
并指出我遗漏的部分。
```

**能获得的结果：** 明确实现范围 / 发现遗漏的需求 / 整理 API 清单 / 提出数据库结构方案 / 风险分析

---

### STEP 2 — 让 ChatGPT 验证设计

即便自己完成了设计，也不要直接进入实现。

```
请从高级后端工程师的角度进行评审。
从可扩展性/性能/安全性/可维护性的角度进行批判性分析。

不用说好的地方，只找问题。
```

> **小技巧：** 加上"不用说好的地方"，AI 的评审会明显更犀利。

---

### STEP 3 — 把实现交给 Claude Code

设计完成后，把实现交给 Claude Code。Claude 尤其擅长**大规模代码生成、跨文件引用、重构、测试代码生成**。

**提升 Claude 表现的 3 种方法**

**① 赋予角色**
```
你是一名拥有 15 年经验的高级后端工程师。
请遵循 Clean Architecture，
并将可维护性和可测试性作为最优先考虑事项。
```

**② 使用 APEI 方法**
```
1. Analyze  — 分析需求与现有代码
2. Plan     — 先整理出实现计划
3. Execute  — 按计划实现
4. Iterate  — 检查结果并改进
```

**③ 用数字明确目标**
```
目标：
- TPS 达到 1000 以上
- 响应速度低于 100ms
- 测试覆盖率达到 80% 以上
- 兼顾可维护性

请在满足以上条件的前提下实现。
```

---

### STEP 4 — 在 Cursor 中快速修改

在 Cursor 中完成 Claude 生成代码的最后调整。因为它直接在 IDE 内运行，重复性工作的效率很高。

```
把这个文件里的所有日志改成结构化日志。
统一异常处理的模式。
给所有 API 加上 Swagger 注解。
```

---

### STEP 5 — 把代码评审交给 ChatGPT

实现完成后必须执行这一步。

```
请评审这段代码。
角度：性能/安全/可维护性/可扩展性
不用说优点，只找问题。
```

**更犀利的追加 Prompt：**

```
# Grill Me
请毫不留情地批评这个改动。

# 10x Engineer
如果是一个能力十倍于常人的工程师，会怎么做得不一样？
```

---

### STEP 6 — 让 Claude 进行改进

把 ChatGPT 发现的问题反馈给 Claude。**将这个过程重复 2-3 次**，代码质量会显著提升。

```
请根据以下评审内容进行改进。
[粘贴评审内容]
```

---

### STEP 7 — 基于 Git Diff 的评审

```bash
git diff main..feature/my-branch
```

把结果原样交给 AI。

```
# 给 Claude
请评审这些改动。

# 给 ChatGPT
请把这当作一次 PR 评审，只找出问题所在。
```

---

### STEP 8 — AI 时代的 TDD

让 AI 先写测试，再写实现。

```
# 第一步
先不要实现，只写测试代码。

# 第二步
写出能通过这个测试的实现。
```

> AI 和 TDD 的配合远比想象中好。

---

### STEP 9 — 文档自动化

```
写一份 README。
写一份 ADR（Architecture Decision Record）。
写一份运维指南。
写一份 API 文档。
根据改动更新 CHANGELOG。
```

---

## 3. CLAUDE.md 模板

对 Claude Code 用户来说几乎是必备的。在项目根目录创建 `CLAUDE.md` 文件，Claude 会在每次会话开始时自动读取，从而维持**整个项目的一致性**。

```markdown
# Project Rules for Claude

## Project Overview
- 项目名称：[项目名]
- 语言/框架：[例如 Java 17 / Spring Boot 3.x]
- 目标：[核心目标 1-2 行]

## Architecture
- 遵循 Clean Architecture（Controller → Service → Repository 分层）
- Service Layer 必须存在——禁止在 Controller 中写业务逻辑
- 禁止直接访问 Repository（必须通过 Service）
- Domain 对象遵循不可变（Immutable）设计原则

## Naming Conventions
- DTO 类：使用 `XxxRequest`、`XxxResponse` 后缀
- Service 接口与实现分离：`XxxService` / `XxxServiceImpl`
- 分离 Command 与 Query（应用 CQRS 模式）
- 常量使用 `UPPER_SNAKE_CASE`，变量使用 `camelCase`

## Code Style
- 函数最大长度：不超过 30 行
- 禁止嵌套 if-else 超过 2 层——使用 Early Return 模式
- 禁止使用魔法数字——提取为常量
- 注释应说明"为什么"而非"是什么"

## Testing
- 每个 Service 方法都必须有单元测试
- 每个 API 端点都必须编写集成测试
- 测试覆盖率目标：80% 以上
- 测试命名：`方法名_场景_期望结果` 格式

## Error Handling
- 使用自定义异常（`BusinessException`、`ValidationException` 等）
- 全局异常处理：使用 `@ControllerAdvice`
- 统一 API 错误响应格式：`{ code, message, data }`

## Logging
- 使用结构化日志（JSON 格式）
- 日志级别标准：ERROR（故障）、WARN（异常征兆）、INFO（主要流程）、DEBUG（开发用）
- 禁止在日志中输出 PII（个人信息）

## Security
- 防止 SQL 注入：仅使用 PreparedStatement 或 ORM 参数绑定
- 防止 XSS：校验输入并编码输出
- 严禁硬编码密钥、密码——使用环境变量或 Vault

## Performance
- 防止 N+1 问题：用 Fetch Join 或独立查询解决
- 必须分页：列表查询 API 应用基于 Cursor 的分页
- 缓存策略：必须明确指定 Redis TTL

## Documentation
- 所有 Public API 必须添加 Swagger/OpenAPI 注解
- 复杂业务逻辑要撰写 ADR（Architecture Decision Record）
- README 始终保持最新
```

---

## 4. Cursor Rules 模板

在项目根目录创建 `.cursorrules` 文件。Cursor 会自动读取它，提升生成代码的质量。

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
- Commit messages: 使用 feat / fix / refactor / test / docs / chore 前缀
- 每次提交只包含一个逻辑改动
- PR description：变更原因(Why) → 变更内容(What) → 测试方法(How to Test)

## Output Format
- Always include necessary imports
- Show complete, runnable code (no placeholder comments like "// TODO: implement")
- If multiple approaches exist, briefly note the trade-offs
- Flag potential security issues immediately
```

---

## 5. 实战 Prompt 大全

### 设计与架构

```
# 技术栈选型
请为[需求]推荐合适的技术栈。
用表格整理各选项的优缺点，并说明最终推荐理由。

# 架构设计
请设计[系统名]的架构。
- 预计流量：DAU [N] 人，TPS [N]
- 核心约束：[延迟/成本/可扩展性的优先级]
请包含架构图说明，以及每个组件的选型理由。

# 数据库设计
请设计[领域]的 ER 图。
请包含规范化程度、索引策略、分区考量。

# API 设计
请按照 RESTful API 设计原则，为[功能]编写 API 规范。
请包含端点、HTTP 方法、请求/响应结构、错误码。
```

---

### 实现

```
# 功能实现（详细）
请实现[功能名]。
- 语言/框架：[例如 Java 17 / Spring Boot 3]
- 架构模式：[Clean Architecture / Hexagonal]
- 非功能性需求：TPS [N]，响应速度低于 [N]ms
- 包含测试代码
- 包含错误处理

# 重构
请重构以下代码。
[粘贴代码]
- 提升可读性
- 消除重复
- 应用 SOLID 原则
请说明修改前后的对比及理由。

# 性能优化
请找出以下代码的性能瓶颈并进行优化。
[粘贴代码]
请明确预期改善效果（以 Big-O 为准）及权衡取舍。

# 迁移
请将[现有代码/库]迁移到[新代码/库]。
请包含分阶段迁移策略与回滚计划。
```

---

### 测试

```
# 单元测试生成
请为以下代码编写单元测试。
[粘贴代码]
- 包含 Happy Path、Edge Case、Exception Case
- 测试框架：[JUnit5 / Jest / pytest]
- 包含 Mocking 策略说明

# 集成测试生成
请为[API 端点]编写集成测试。
- 使用真实数据库（Testcontainers）
- 包含认证/授权场景
- 包含数据准备/清理代码

# 测试覆盖率分析
请分析以下测试代码，找出缺失的测试用例。
[粘贴测试代码]
请按优先级整理应补充的测试清单。

# 压力测试场景
请为[API 名称]编写压力测试场景。
- 工具：[k6 / JMeter / Locust]
- 目标：TPS [N]，P99 响应时间低于 [N]ms
- 包含逐步增加负载的场景
```

---

### 安全

```
# 安全漏洞检查
请按 OWASP Top 10 标准分析以下代码的安全漏洞。
[粘贴代码]
请按漏洞列出风险级别（High/Medium/Low）及修复方法。

# 认证/授权设计
请设计[系统]的认证/授权体系。
- 对比 JWT 与 Session
- RBAC 与 ABAC 的选型标准
- Refresh Token 的安全策略
- OAuth2/OIDC 整合方案

# 加密策略
请为[数据]制定加密策略。
请同时涵盖静态数据（at-rest）与传输数据（in-transit）。
```

---

### 调试

```
# 错误分析
请分析以下错误日志，指出原因与解决方案。
[粘贴错误日志]
请包含防止再次发生的方法。

# 性能分析
请分析以下 APM/性能剖析结果，并提出改进方案。
[粘贴性能剖析结果]

# 查找 N+1 问题
请在以下代码中找出 N+1 查询问题。
[粘贴代码]
请改写为优化后的查询。
```

---

### 文档化

```
# README 生成
请为以下代码/项目编写 README.md。
[粘贴代码/说明]
包含项目：项目概述、安装方法、使用方法、API 参考、贡献方法、许可证

# ADR 编写
请为[技术决策名]编写 ADR（Architecture Decision Record）。
包含项目：背景、决策内容、考虑过的替代方案、结果、权衡取舍

# 技术债文档化
请分析并记录以下代码中的技术债。
[粘贴代码]
请用表格整理各债务项目的影响程度、解决成本、优先级。

# 运维指南编写
请为[服务名]编写运维指南。
包含项目：部署流程、监控项目、告警标准、故障处理手册、回滚方法
```

---

## 6. 50 条 AI 代码评审 Prompt

### 通用评审 (1-10)

```
1. 请从高级工程师的角度评审这段代码，跳过优点，只找问题。
2. 请找出合并这个 PR 之前必须确认的所有事项。
3. 请找出这段代码在 6 个月后维护时可能出问题的部分。
4. 请找出第一次看到这段代码的开发者难以理解的部分。
5. Grill Me——请毫不留情地批评这段代码。
6. 如果是能力十倍于常人的工程师，会怎样以不同的方式编写这段代码？
7. 请找出这段代码中循环复杂度（Cyclomatic Complexity）较高的部分，并提出简化方法。
8. 请找出这段代码中违反 SOLID 原则的部分。
9. 请找出这段代码中违反 DRY 原则的重复代码。
10. 请分析这段代码的依赖关系结构，检查是否存在循环依赖。
```

---

### 性能评审 (11-20)

```
11. 请找出这段代码中可能成为性能瓶颈的部分。
12. 请找出这段代码中产生不必要数据库查询的部分（包括 N+1）。
13. 请找出这段代码中可能发生内存泄漏的部分。
14. 请找出这段代码中应用缓存会有效的部分。
15. 请找出这段代码中可以通过异步处理改进的部分。
16. 请找出这段代码中索引未被合理利用的查询。
17. 请找出这段代码中为减轻 GC 压力应改进的部分。
18. 请找出这段代码中可能导致连接池耗尽的模式。
19. 请分析这段代码的时间复杂度，并提出更高效的算法。
20. 请找出这段代码中发生不必要序列化/反序列化的部分。
```

---

### 安全评审 (21-30)

```
21. 请按 OWASP Top 10 标准分析这段代码的安全漏洞。
22. 请找出这段代码中存在 SQL 注入漏洞的部分。
23. 请找出这段代码中缺少认证/授权的 API 端点。
24. 请找出这段代码中敏感信息（PII、密码、令牌）在日志中暴露的部分。
25. 请找出这段代码中硬编码的密钥或凭据。
26. 请找出这段代码中可能存在 XSS 漏洞的部分。
27. 请找出这段代码中 CSRF 防护不足的部分。
28. 请找出这段代码中可能发生竞态条件（Race Condition）的部分。
29. 请找出这段代码中缺少输入校验的部分。
30. 请找出这段代码中错误信息过度暴露内部信息的部分。
```

---

### 设计评审 (31-40)

```
31. 请检查这段代码的分层设计是否合理。
32. 请找出这段代码中 Service Layer 过度膨胀的部分（God Class 模式）。
33. 请找出这段代码中领域逻辑位于错误层级的部分。
34. 请评估这段代码的可扩展性。如果需求增加 10 倍，哪里会出问题？
35. 请找出这段代码中适合应用策略模式、工厂模式等设计模式的部分。
36. 请检查这段代码的事务边界是否设置正确。
37. 请找出这段代码中违反单一职责原则（SRP）的类/函数。
38. 请检查这段代码的错误处理策略是否一致地应用。
39. 请评估这段代码的 API 契约（Contract）对未来变更是否足够安全。
40. 请找出这段代码中适合改为事件驱动架构的部分。
```

---

### 测试评审 (41-50)

```
41. 请找出这份测试代码中缺失的用例（以 Edge Case、Exception 为主）。
42. 请评估这些测试是否真正进行了有意义的验证（检查是否存在 False Positive）。
43. 请找出这份测试中测试间的依赖关系（顺序依赖、共享全局状态）。
44. 请改善这份测试代码的可读性（应用 Arrange-Act-Assert 模式）。
45. 请找出这段代码中无法进行单元测试的结构，并提出使其可测试的重构方法。
46. 请评估这个 Mocking 策略是否合理，检查是否存在 Over-mocking 或 Under-mocking。
47. 请找出可以提升这份测试执行速度的部分。
48. 请找出这份测试中可能出现非确定性（Flaky）行为的部分。
49. 请分析这段代码的测试覆盖率，并按优先级整理必须补充的测试清单。
50. 请评估这个集成测试是否充分复现了真实的生产环境。
```

---

## 7. 最终工作流总结

```
1. ChatGPT     → 需求分析及查漏补缺
2. ChatGPT     → 设计验证（只找问题）
3. Claude Code → 基于 CLAUDE.md 进行实现
4. Claude Code → TDD——先测试，后实现
5. Cursor      → IDE 内反复修改与模式统一
6. ChatGPT     → 代码评审（Grill Me / 10x Engineer）
7. Claude Code → 应用评审反馈进行改进（重复 2-3 次）
8. Git Diff    → Claude + ChatGPT 同步 PR 评审
9. AI          → README / ADR / 运维指南文档化
```

---

## 8. 结语

AI 不会取代开发者。

但**善用 AI 的开发者，很可能会取代不用 AI 的开发者。**

重要的不是哪个模型更强，更重要的是构建这样一套开发流程：

- **用 ChatGPT 思考**
- **用 Claude 实现**
- **用 Cursor 提升生产力**
- **再用 ChatGPT 验证**

不要只把 AI 当作代码自动补全工具，而要把它当作**设计者、评审者、高级工程师**来使用。

生产力会彻底改变。

---

## 总结（用于 LinkedIn / 社交媒体）

✔ **ChatGPT** → 需求分析与设计验证
✔ **Claude Code** → 实现与重构（通过 CLAUDE.md 保持一致性）
✔ **Cursor** → 提升 IDE 内生产力（利用 .cursorrules）
✔ **ChatGPT** → 代码评审与最终验证
✔ **50 条 AI 代码评审 Prompt** → 让质量标准标准化

> 现在不是选择一个 AI 的时代，而是**组建一支 AI 团队**的时代。

---

*#AI #ClaudeCode #ChatGPT #Cursor #SoftwareEngineering #DeveloperProductivity #Coding #Programming #GenerativeAI #PromptEngineering*
