---
title: "Claude Security Plugin — 技术分析与入门指南"
subtitle: "区分 security-guidance 与 claude-security，梳理多代理验证流水线与落地步骤"
description: "面向 Claude Code 的 claude-security（Beta）与 security-guidance（GA）技术指南：架构、三人验证小组、BYO inference、采用流程及在纵深防御栈中的位置。"
abstract: |
  区分 Anthropic Claude Code 的两款安全插件（security-guidance GA 与 claude-security Beta v0.10.0），
  说明基于推理的漏洞扫描、对抗式验证（2/3 法定人数）、本地 BYO inference 以及人工审批补丁原则。
  定位为 SAST 的补充而非替代，并包含套餐/CLI 要求与采用清单。基准日期 2026-07-26。
summary_for_ai: |
  Tech guide (ZH) for Anthropic Claude Security Plugin: security-guidance (in-session GA) vs claude-security (on-demand multi-agent deep scan, Beta v0.10.0, paid, CLI ≥2.1.154).
  Core: reasoning-over-pattern, adversarial 3-panel verification, locality/BYO inference, HITL patches; complements SAST. Docs 2026-07-23; published 2026-07-26.
date: 2026-07-26
author: "Dennis Kim"
lang: zh
tags:
  - Claude
  - LLM Security
  - AppSec
  - DevSecOps
  - SAST
keywords:
  - Claude Security Plugin
  - claude-security
  - security-guidance
  - multi-agent vulnerability scanner
  - adversarial verification
  - BYO inference
group: security
featured: true
featured_rank: 1
schema_type: TechArticle
draft: false
robots: index,follow
---

# Claude Security Plugin — 技术分析与入门指南

传统安全解决方案和 GitHub 开源安全工具如果不提供新的价值，将面临淘汰。Claude Security Plugin 将安全能力扩展为内部技术层。

| 项目 | 内容 |
|:---|:---|
| 文档版本 | 1.0 |
| 日期 | 2026-07-26 |
| 目标产品 | `claude-security` (Beta, plugin v0.10.0), `security-guidance` (GA) |
| 参考文档 | code.claude.com/docs 官方文档 (2026-07-23 访问) |
| 目标读者 | AppSec / DevSecOps 工程师、安全架构师、开发主管 |
| 摘要 | 在 Claude Code 会话内运行的多代理漏洞扫描器的架构、验证流水线、采用流程及竞争定位 |

---

## 0. 首先需要区分的两个插件

"Claude 安全插件"这一名称下存在两个性质完全不同的产品。

| 区分 | `security-guidance` | `claude-security` |
|:---|:---|:---|
| 一句话定义 | Claude **在编写代码时**审查自己的变更 | 对整个仓库进行**按需深度扫描**的多代理审计 |
| 触发方式 | 自动（无需调用命令） | 手动 `/claude-security` |
| 状态 | GA（正式发布） | Beta（2026-07-22 发布） |
| 套餐 | 全部套餐（含免费） | **需要付费套餐** |
| 最低 CLI | v2.1.144+ | v2.1.154+ (dynamic workflows) |
| 输出 | 会话内交互式发现 → 即时修复 | 带时间戳的报告目录 + `.patch` 文件 |
| 性质 | 预防性护栏 (shift-left) | 审计扫描器（补充 SAST，而非替代） |

本文档中的 "Claude Security Plugin" 指后者 (`claude-security`)。

---

## 1. 概念

### 1.1 设计前提

传统 SAST 依赖基于规则的模式匹配。它能捕获已知模式，但 (a) 误报率高，且 (b) 遗漏跨文件逻辑缺陷和认证绕过等需要上下文的漏洞。Claude Security 针对这一差距，通过**"用代理团队再现熟练安全研究人员的推理过程"**来解决问题。

| 概念 | 实现 | 含义 |
|:---|:---|:---|
| **Reasoning over pattern** | LLM 代理阅读并推理代码，正则/规则集不是主要引擎 | 可检测新型和逻辑型漏洞，但具有非确定性 |
| **Adversarial verification** | 每个候选发现通过 3 人验证小组投票（2/3 法定人数） | 误报抑制内置于架构中 |
| **Locality (BYO inference)** | 扫描在用户会话中以用户权限本地运行 | 代码不离开环境。支持 GitLab、Bitbucket、气隙网络 |
| **Human-in-the-loop** | 补丁绝不自动应用 | 不移除审批节点，只提高审批材料的质量 |

### 1.2 纵深防御栈中的位置

Anthropic 将此插件定位为 6 层栈中的一层，而非独立解决方案。

| 层级 | 工具 | 覆盖范围 |
|:---|:---|:---|
| 会话中 | `security-guidance` 插件 | Claude 编写代码的常见漏洞 |
| 按需单次 | `/security-review` | 当前分支一次性安全审查 |
| **按需深度扫描** | **`claude-security` 插件** | **仓库/diff 多代理扫描，独立验证的发现和补丁** |
| PR 时 | Code Review (Team/Enterprise) | 全代码库上下文一致性审查 |
| 托管 | Claude Security 产品 (Enterprise) | 连接的仓库持续监控 |
| CI | 现有 SAST + 依赖扫描器 | 语言特定规则、供应链检查 |

> 官方立场：**不替代现有源代码安全工具。** 与静态分析、依赖扫描和代码审查并行使用。

---

## 2. 功能详情

### 2.1 命令与三种操作

| 操作 | 目标 | 备注 |
|:---|:---|:---|
| **Scan codebase** | 整个仓库或限定范围的子集 | 即使在无版本控制的目录中也可运行 |
| **Scan changes** | 分支 diff、PR diff、单个提交 | 需要 Git。**仅限已提交的变更** |
| **Suggest patches** | 报告中的选定发现 | 生成 `.patch` 文件。不自动应用 |

直接参数调用：

```text
/claude-security scan my branch
/claude-security          → "scan commit abc1234"
```

建议启用 **auto mode** 以防止权限提示阻碍扫描。

### 2.2 扫描流水线：6 个阶段

| # | 阶段 | 内容 |
|:---|:---|:---|
| 1 | **Inventory** | 将仓库划分为组件 |
| 2 | **Threat model** | 每个组件一个建模器 |
| 3 | **Research** | 每个（组件 × 类别）单元格一名研究员 |
| 4 | **Sweep** | 填补矩阵未覆盖的空白区域 |
| 5 | **Panel** | 3 视角对抗验证 |
| 6 | **Adversarial** | 仅 max effort。重新审查边界判定，红队所有存活发现 |

四个固定研究类别: `injection-and-input`, `auth-and-access`, `memory-and-unsafe`, `crypto-and-secrets`

### 2.3 努力等级

| 等级 | 最大组件数 | 每格研究员 | 间隙扫描 | 对抗阶段 |
|:---|:---|:---|:---|:---|
| low | 12 | 1 | 0 | 不运行 |
| medium | 12 | 1 | 1 | 不运行 |
| high | 24 | 2 | 2 | 不运行 |
| max | 24 | 2 | 2 | 运行 |

### 2.4 模型层级

| 角色 | 模型 | 工具权限 |
|:---|:---|:---|
| 编排器 | Opus | — |
| 仓库制图师 | Sonnet | 只读 |
| 研究员、验证员 | 继承会话模型 | 只读 |

### 2.5 验证小组 — 本产品的核心

发现进入报告不是因为"研究员找到了"，而是**通过了小组验证**。

| 要素 | 规则 |
|:---|:---|
| 投票者 | 3 名，每个视角 1 名: `REACHABILITY` / `IMPACT` / `DEFENSES` |
| 判定格式 | `TRUE_POSITIVE` 或 `FALSE_POSITIVE` + 决定性 `file:line` 证据 |
| 维持法定人数 | 3 票中的 2 票 |
| 置信度上限 | 一致 3/3 → `high` / 2/3 → 限制为 `medium` |
| 聚合引擎 | **由报告渲染器的 Python 代码计算**，非模型声称值 |
| 验证戳记 | 仅当投票记录证明所有发现均经过小组执行时为 `verified` |

### 2.6 输出物

| 文件 | 内容 |
|:---|:---|
| `CLAUDE-SECURITY-RESULTS.md` | 人类可读报告。发现 ID、严重性、置信度、CWE、精确接收器行 |
| `CLAUDE-SECURITY-RESULTS.jsonl` | 机器可读格式，每行一个 JSON 对象 |
| `CLAUDE-SECURITY-REVISION-<commit>.json` | 修订戳记 |

该目录自带 `.gitignore`。如需保留审计追踪，删除该 `.gitignore` 文件并正常提交。

### 2.7 补丁生成 — 三大声明要求

1. 该变更解决了**该单一**发现
2. 不引入新漏洞
3. 所有其他行为不变 — 代码接受的输入集变化视为行为变化

削弱安全性的"修复"会被**自动拒绝**。三个声明无法保证时，输出原因说明而非补丁。

应用始终由用户决定：`git apply CLAUDE-SECURITY-<timestamp>/patches/F1.patch`。**每个补丁一个 PR** 是官方建议。

---

## 3. 优势

| # | 优势 | 依据 |
|:---|:---|:---|
| 1 | 上下文相关漏洞检测 | 跨文件数据流追踪、复合逻辑缺陷 |
| 2 | 可验证的误报抑制 | 3 视角小组 + 2/3 法定人数 + 置信度上限 |
| 3 | 基于代码的报告完整性证明 | 投票聚合由 Python 代码计算 |
| 4 | 代码不离开环境 | 会话内本地执行 |
| 5 | 无需额外供应商或合同 | 使用现有 Claude 访问权限和 Token 预算 |
| 6 | 机器可读输出 | JSONL → 工单/SIEM/仪表板集成 |
| 7 | 补丁安全门 | 临时克隆 + 独立验证 + 自动应用禁用 |
| 8 | 可限定范围 | 努力等级和组件范围 |
| 9 | 无工作流切换 | 终端会话内完成扫描→分析→补丁→PR |

---

## 4. 劣势与风险

| # | 劣势 | 详情 | 缓解措施 |
|:---|:---|:---|:---|
| 1 | 非确定性 | 相同代码两次扫描可能产生不同发现 | 定期扫描，不作为发布门唯一依据 |
| 2 | 缺乏可复现性 | 无法直接满足审计框架要求 | 保持确定性 SAST 并行运行 |
| 3 | 无隔离 | 非对抗性仓库的防御措施 | 不信任代码用 sandbox-runtime/VM |
| 4 | Token 成本 | 深度扫描消耗大量 Token | 分区扫描，降低努力等级 |
| 5 | 会话锁定 | 扫描完成前需保持 Claude Code 开启 | 独立会话/机器 |
| 6 | 未提交变更限制 | 变更扫描仅看已提交的变更 | 先提交或 stash |
| 7 | 覆盖不透明 | 需人工阅读排除原因 | 将排除原因审查制度化 |
| 8 | 依赖/供应链未覆盖 | 不包括 SCA、许可证、容器、IaC、DAST | 保持现有 SCA/密钥扫描器 |
| 9 | 付费套餐依赖 | 付费套餐 + dynamic workflows 必需 | 预先标准化环境 |
| 10 | Beta | 模式可能变更 | JSONL 解析器添加版本保护 |
| 11 | Fable 5 自动降级 | 网络安全分类器可能阻止部分模型活动 | 视为预期行为 |

---

## 5. 配套产品: `security-guidance`

**所有套餐免费**。"Claude 创建的漏洞由 Claude 在同一会话中捕获"的预防层。

### 5.1 三层审查

| 层级 | 时机 | 方式 | 成本 | 示例检测 |
|:---|:---|:---|:---|:---|
| Per-edit | Edit/Write/NotebookEdit 后立即 | 正则/子串确定性匹配，**不调用模型** | 0 | `eval(`, `new Function`, `os.system`, `dangerouslySetInnerHTML` |
| End-of-turn | 回合完成时 | 工作树 git diff 传递给独立 Claude 审查 | 每回合约 1 次调用 | 认证绕过、IDOR、注入、SSRF |
| Commit/Push | Claude 通过 Bash 执行 `git commit`/`git push` 时 | 代理深度审查 | 每次提交多次回合 | 消除上下文安全但模式危险的情况的误报 |

关键限制：非阻塞（best-effort），不阻止写入或提交。**用户在自有 Shell 中的提交不会被审查。**

### 5.2 扩展点

| 文件 | 用途 | 上限 |
|:---|:---|:---|
| `.claude/claude-security-guidance.md` | 注入组织威胁模型/检查清单 | 8KB |
| `.claude/security-patterns.yaml` | 添加确定性 per-edit 规则 | 最多 50 规则 |

注意：指南文件是**可加的**（additive）。不能用"忽略此类漏洞"的规则来抑制默认检查。

### 5.3 禁用开关

| 环境变量 | 效果 |
|:---|:---|
| `SECURITY_GUIDANCE_DISABLE=1` | 禁用整个插件 |
| `ENABLE_PATTERN_RULES=0` | 禁用 per-edit 检查 |
| `ENABLE_STOP_REVIEW=0` | 禁用 end-of-turn 审查 |
| `ENABLE_COMMIT_REVIEW=0` | 禁用 commit/push 审查 |

### 5.4 实现架构

插件完全基于 **hooks** 实现，可作为自身 hooks 的参考实现。Anthropic 自部署中 PR 的**安全相关评论减少 30–40%**。

---

## 6. 竞争比较

### 6.1 直接竞争: AI 原生代理安全审查

| 产品 | 供应商 | 执行位置 | 验证方式 | 关键差异 |
|:---|:---|:---|:---|:---|
| **Claude Security Plugin** | Anthropic | 本地会话 | 3 视角小组 2/3 法定人数 | 基于代码的报告完整性证明 |
| **Codex Security** | OpenAI | 云端 | 沙盒漏洞利用验证 | 沙盒验证是最大差异点 |
| **Claude Security (Managed)** | Anthropic | 托管 | 同系列验证 | 持续监控、webhook |
| **ZeroPath** | ZeroPath | SaaS | AI 原生检测 | 授权逻辑、IDOR 优势 |
| **Corgea** | Corgea | SaaS | 上游扫描器 AI 分类 | 修复层，检测质量依赖上游 |

### 6.2 邻近竞争: 传统 SAST/AppSec 平台

| 产品 | 检测引擎 | 对比 Claude Security |
|:---|:---|:---|
| **Semgrep** | 规则驱动 | 确定性可复现，但逻辑缺陷推理较弱 |
| **Snyk Code** | 静态分析 + DeepCode AI | 平台广度压倒性，逻辑缺陷较弱 |
| **GitHub Advanced Security (CodeQL)** | CodeQL 数据流查询 | GitHub 依赖，Claude 覆盖 GitLab/Bitbucket/气隙 |
| **Checkmarx One** | 规则驱动 | 企业级治理 |
| **Veracode** | 二进制+静态 | 受监管/国防领域不可替代 |
| **SonarQube CE** | 规则驱动 | 预算受限团队的基线 |

### 6.3 市场定位

| 层级 | 定义 | 代表 |
|:---|:---|:---|
| Tier 1 | 纯规则驱动 | SonarQube CE, Semgrep OSS |
| Tier 2 | AI 辅助 SAST | Snyk Code, Semgrep Pro, Checkmarx One |
| Tier 3 | **AI 原生 SAST** — LLM 为主检测引擎 | **Claude Security**, Codex Security, ZeroPath |

**实际结论:** Claude Security Plugin 是 Snyk、Semgrep、GHAS 的**补充而非替代**。确定性工具负责可复现性、合规性和供应链；本插件负责那些工具结构上无法捕获的上下文相关逻辑缺陷。

---

## 7. 入门指南

### 7.1 前提条件

| 项目 | `claude-security` | 检查命令 |
|:---|:---|:---|
| Claude Code CLI | v2.1.154+ | `claude --version` |
| 套餐 | 付费套餐必需 | — |
| Dynamic workflows | 必须启用 | `/config` |
| Python | 3.9.6+, `PATH` 上有 `python3` | `python3 --version` |
| Git | 变更扫描和补丁生成需要 | `git --version` |

### 7.2 安装

```text
/plugin install claude-security@claude-plugins-official
/reload-plugins
```

同时安装 `security-guidance`:

```text
/plugin install security-guidance@claude-plugins-official
/reload-plugins
```

### 7.3 团队部署

```json
{
  "enabledPlugins": {
    "security-guidance@claude-plugins-official": true,
    "claude-security@claude-plugins-official": true
  }
}
```

### 7.4 首次扫描

```text
1) /claude-security → 选择 "Scan codebase"
2) 选择扫描范围
3) 确认执行（消耗大量 Token，需保持 Claude Code 开启）
4) 观察进度（通过 /workflows 查看详情）
5) 查看 CLAUDE-SECURITY-<timestamp>/ 目录
6) /claude-security → "Suggest patches" → 选择要处理的发现
7) 仅应用已接受的补丁：git apply（每个补丁一个 PR）
```

建议启用 **auto mode**。

### 7.5 仅扫描变更

```text
/claude-security scan my branch
```

仅限已提交变更。进行中的编辑请先提交或 stash。

### 7.6 大型仓库范围控制

不要一次处理整个树，按区域划分。选择插件建议的聚焦范围（API 层、认证代码等）。

### 7.7 报告阅读顺序

```text
1. CLAUDE-SECURITY-REVISION-<commit>.json → 检查 verification.status
2. CLAUDE-SECURITY-RESULTS.md coverage 部分 → 检查排除内容
3. 发现列表 → 按 severity × confidence 排序
4. CLAUDE-SECURITY-RESULTS.jsonl → 工单系统集成
```

### 7.8 故障排除

| 症状 | 原因/对策 |
|:---|:---|
| Python 警告 | 需要 `python3` 3.9.6+ |
| "Fable 5's safeguards flagged this message" | 正常行为，扫描完成 |
| security-guidance 审查不显示 | 检查日志，非 git 仓库则跳过 |
| 仅输出说明无补丁 | 独立验证者无法保证三大声明 |

### 7.9 卸载

```text
claude plugin uninstall claude-security
/plugin uninstall security-guidance@claude-plugins-official
```

---

## 8. 采用建议场景

| 组织情况 | 建议 |
|:---|:---|
| 使用 Claude Code，无 AppSec 工具 | 立即部署 `security-guidance`（免费）。`claude-security` 从发版前分支开始 |
| 现有 SAST 运行中 | 保持当前栈。在高风险组件投入 `claude-security` |
| GitHub Enterprise 中心 | GHAS + Copilot Autofix 在 PR 循环中占优。Claude 作为逻辑缺陷的二次审查 |
| GitLab / Bitbucket / 气隙网络 | 插件的本地执行具有结构性优势 |
| 监管/审计合规必需 | 确定性 SAST 必须保持 |

### 最小操作流程建议

```text
[日常]    security-guidance 始终启用（免费、自动）
[PR 前]   /claude-security scan my branch（仅变更、medium effort）
[Sprint]  1 个高风险组件全扫描（high effort）→ 提交报告用于审计追踪
[发版]    现有 SAST + SCA + 密钥扫描（确定性门）
[季度]   全仓库遍历扫描（max effort），通过修订戳记录管理历史
```

---

## 9. 来源

| 来源 | URL |
|:---|:---|
| Claude Security Plugin 官方文档 | https://code.claude.com/docs/en/claude-security |
| security-guidance Plugin 官方文档 | https://code.claude.com/docs/en/security-guidance |
| Claude Security 产品页面 | https://claude.com/product/claude-security |
| 插件源码 (claude-security) | https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-security |
| 插件源码 (security-guidance) | https://github.com/anthropics/claude-plugins-official/tree/main/plugins/security-guidance |
| Sandbox Runtime | https://github.com/anthropic-experimental/sandbox-runtime |
| 安全审查 GitHub Action | https://github.com/anthropics/claude-code-security-review |

Beta 产品 — 功能、输出模式和需求可能变更。接入自动化流水线前，请以官方文档为准再次确认。
