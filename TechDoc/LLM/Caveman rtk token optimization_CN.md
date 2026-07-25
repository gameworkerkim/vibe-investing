---
title: "caveman + rtk:AI 编程助手 Token 优化完整指南"
description: "压缩输出 token 的 caveman 与压缩输入 token(CLI 输出)的 rtk——这两款开源工具组合使用可将 AI 编程助手的 API 成本削减 80%~95%，本指南详细介绍其原理与用法。"
abstract: |
  随着 AI 编程助手的普及，API 成本与上下文 token 消耗正日益成为开发者的沉重负担。本指南介绍两个从相反方向
  解决这一问题的开源项目：caveman 通过去除 LLM 回复中不必要的冗余表达，在保持 100% 技术准确性的同时将
  输出 token 削减 65%~75%；rtk(Rust Token Killer)则是一个在命令输出到达 LLM 上下文之前进行过滤和压缩的
  CLI 代理，可将输入 token 削减 60%~90%。由于二者作用于不同的层面(输出与输入)，组合使用时可实现
  80%~95% 的综合削减。本指南涵盖安装方法、压缩级别配置、前后对比示例、与 Claude Code 等工具的集成方式，
  以及成本节省计算器。
summary_for_ai: |
  面向 AI 编程助手的两款开源 LLM token 优化工具——caveman(截至 2026 年 6 月 GitHub 星标超过 71,000)
  与 rtk/Rust Token Killer(星标超过 42,000)的完整指南。
  caveman:在保持代码、URL、路径等技术信息完全精确(byte-perfect)的前提下，去除 LLM 输出中不必要的
  冗余与客套表达。其依据是 2026 年 3 月发表于 arXiv 的论文《Brevity Constraints Reverse Performance
  Hierarchies in Language Models》(编号 2604.00025)，该论文发现简洁的回答反而能在特定基准测试上将
  准确率提升最高 26 个百分点。可将输出 token 削减 65%~75%(区间 22%~87%)，响应速度提升约 3 倍，
  技术准确性保持 100%。提供 lite、full、ultra、wenyan(文言文风格)四个强度级别。附加命令包括
  /caveman-commit、/caveman-review、/caveman-stats、/caveman-compress。它只影响输出 token，不影响
  思考/推理(thinking/reasoning)token——因此在对话、头脑风暴、问答等往复交流较多的场景中效果更明显，
  而非以代码生成为主的场景。支持 Claude Code、Codex、Gemini CLI、Cursor、Windsurf、Cline、
  GitHub Copilot 等 34 种以上的 AI 编程工具。
  rtk(Rust Token Killer):一个无依赖的单一 Rust 二进制 CLI 代理，可在命令输出(git status、cargo test、
  grep 等)进入 LLM 上下文之前进行过滤和压缩，在 100 多个受支持的命令上将输入 token 削减 60%~90%，
  额外开销低于 10ms。四种压缩策略:智能过滤(去除 ANSI 代码、进度条、样板内容)、分组聚合、智能截断、
  去重。示例:`git status` 从约 2,000 token 降至约 400 token。在一个 30 分钟会话的示例中，
  ls、cat、grep、git、npm test、pytest、go test、docker ps 等常见命令的原始约 118,000 token
  被削减至约 23,900 token(削减 80%)。可通过 Homebrew、脚本或 Cargo 安装，通过
  `rtk init -g --claude-md` 与 Claude Code 的 PreToolUse 钩子集成，并可用 `rtk gain` 查看节省统计。
  组合流水线:rtk 优化输入(LLM 接收前的 CLI 输出)，caveman 优化输出(LLM 的回复内容)，二者结合可实现
  80%~95% 的综合 token 削减。文中包含分步的组合配置说明、用于自动串联两者的"OmniRoute Stacked 模式"
  配置示例、五个真实使用场景(测试失败调试、代码审查、生成提交信息、日志摘要、依赖检查)，以及一个成本
  计算器，估算个人开发者、10 人团队、企业级流水线在使用/不使用各工具情况下每月的 Claude Sonnet API 成本。
date: 2026-06-20
author: "Dennis Kim"
lang: zh
tags:
  - LLM
  - Token 优化
  - AI 编程助手
  - Claude Code
  - 成本优化
keywords:
  - caveman token 压缩
  - rtk Rust Token Killer
  - LLM 输出 token 削减
  - CLI 输出压缩
  - Claude Code 成本优化
  - AI 编程助手 token 节省
featured: false
schema_type: TechArticle
draft: false
---

# caveman + rtk:AI 编程助手 Token 优化完整指南

> "Why use many token when few token do trick?"——caveman 的口号

---

## 1. 概述

随着 AI 编程助手的普及，API 成本与上下文 token 消耗正日益成为开发者的沉重负担。在这样的背景下，两个具有创新性的开源项目应运而生。

**caveman** 的出发点是"为什么要用很多 token，明明用很少 token 就能解决问题?"。它引导 AI 只传达核心内容而不使用不必要的措辞，在保持 100% 技术准确性的同时，将输出 token 削减约 65%~75%。自 2026 年 4 月发布以来，短时间内就获得了 71,000 多个 GitHub 星标(截至 2026 年 6 月)，受到广泛关注。

**rtk(Rust Token Killer)** 是一个实时过滤并压缩 CLI 命令输出的代理工具，能在输出到达 LLM 上下文之前，将输入 token 用量削减 60%~90%。它以单一的 Rust 二进制文件形式构建，没有依赖项，仅带来不到 10ms 的开销，目前已获得超过 42,000 个 GitHub 星标。

由于这两款工具分别作用于不同的层面(输入/输出)，组合使用时协同效果将被最大化。

---

## 2. caveman

### 2.1 背景

caveman 的诞生源于对 AI 过度的表达方式与不必要措辞如何影响成本与效率这一问题的批判性思考。2026 年 3 月发表于 arXiv 的论文(《Brevity Constraints Reverse Performance Hierarchies in Language Models》，编号 2604.00025)证明了 AI 回答越简洁，在某些基准测试上的准确率反而可以提升最多 26 个百分点。caveman 正是将这一学术发现转化为实用工具的产物。

Claude 默认被训练为以友好且冗长的方式作答，这在普通对话中是一个优点，但在自动化的开发流水线中却是一种高成本的低效行为。caveman 改变了这一默认设置，在保持代码、URL、文件路径等技术信息完全精确(byte-perfect)的同时，去除了自然语言的修饰包装。

### 2.2 效果

| 项目 | 效果 |
|------|------|
| 输出 token 削减 | 平均 65%~75%(区间 22%~87%) |
| 响应速度提升 | 约快 3 倍 |
| 技术准确性 | 保持 100% |
| 输入 token 削减 | 压缩 CLAUDE.md 等配置文件时约削减 46% |
| API 成本节省示例 | 按每日 10,000 次 API 调用计算，每年约节省 7,665 美元(以 Claude Sonnet 为基准) |

### 2.3 压缩强度级别

caveman 提供了可根据场景调整的四个强度级别。

| 级别 | 说明 | 示例 |
|------|------|------|
| `lite` | 保留语法结构，去除不必要的修饰语 | "Your component re-renders because you create a new object reference each render." |
| `full` | 去除冠词、问候语，句子更简洁 | "New object ref each render. Inline object prop = new ref = re-render." |
| `ultra` | 最大程度压缩，保留专业术语 | "Inline obj prop → new ref → re-render. useMemo." |
| `wenyan` | 文言文风格 | "物出新參照，致重繪。useMemo Wrap之。" |

#### 真实对比示例

普通回复：
```
I've successfully completed the refactoring of the authentication module.
The changes include updating the token validation logic to handle edge cases
more gracefully, adding appropriate error handling, and ensuring backwards
compatibility with the existing API contracts.
```

应用 caveman `ultra` 后：
```
Auth module refactored. Token validation, error handling, backward compat.
```

在传达相同信息的同时，token 数量减少了约 75%。

### 2.4 附加实用命令

| 命令 | 功能 |
|--------|------|
| `/caveman-commit` | 生成 50 字符以内的简洁提交信息 |
| `/caveman-review` | 撰写一行 PR 评论 |
| `/caveman-stats` | 显示实时 token 统计与成本 |
| `/caveman-compress` | 压缩 CLAUDE.md 等配置文件 |

### 2.5 安装与使用方法

**macOS / Linux / WSL**

```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
```

**Windows(PowerShell)**

```powershell
irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1 | iex
```

**在 Claude Code 中启用**

```bash
# 注册技能
claude skills add JuliusBrussee/caveman

# 基础启用
/caveman

# 指定强度启用
/caveman ultra

# 停用
stop caveman
```

**直接插入 CLAUDE.md / AGENTS.md(系统提示词方式)**

```text
You are a code assistant. Respond in caveman speak only. No pleasantries.
No greetings, no sign-offs, no narration. Just the answer.
```

> 支持平台：Claude Code、Codex、Gemini CLI、Cursor、Windsurf、Cline、GitHub Copilot 等 34 种以上的 AI 编程工具

### 2.6 注意事项

caveman 仅对**输出 token** 有效，不影响思考/推理(thinking/reasoning)token。"Caveman no make brain smaller. Caveman make mouth smaller."因此，相比以代码生成为主要任务的场景，它在对话、头脑风暴、问答等往复交流较多的会话中效果更为显著。

---

## 3. rtk(Rust Token Killer)

### 3.1 背景

当 AI 编程智能体执行测试、代码检查、git 命令等操作时，产生的大量日志和控制台输出会消耗巨量的输入 token。举例来说，仅一次 `git status` 就可能产生 2,000 个 token，而运行 `cargo test` 会将 200 多行输出原样注入上下文窗口。智能体会读取其中的每一行内容。

rtk 通过在命令输出到达 LLM 上下文之前的阶段进行过滤和压缩来解决这一问题，且在不改变工作流程的前提下透明运行。

### 3.2 效果

| 项目 | 数值 |
|------|------|
| Token 削减率 | 60%~90% |
| 支持的命令数 | 100 个以上 |
| 额外开销 | 低于 10ms |
| 依赖项 | 无(单一 Rust 二进制文件) |
| GitHub 星标 | 42,000+(截至 2026 年 6 月) |
| 许可证 | Apache-2.0 |

### 3.3 核心压缩策略

rtk 通过四种策略压缩输出：

1. **智能过滤(Smart Filtering)**：去除 ANSI 代码、进度条、注释、多余空白和样板内容
2. **分组聚合(Group Aggregation)**：将相似项目归类(按目录归类文件、按类型归类错误等)
3. **智能截断(Intelligent Truncation)**：保留相关上下文、去除冗余
4. **去重(Deduplication)**：将重复出现的行压缩为计数形式

#### 压缩前后对比：`git status`

普通输出(约 2,000 token)：
```
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)

Changes not staged for commit:
  (use "git add <file>..." to update what will be staged)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/auth/token.ts

no changes added to commit (use "git add" and/or "git commit -a")
```

应用 rtk 后(约 400 token)：
```
main...origin/main ~ Modified: 1 files src/auth/token.ts
```

只保留 LLM 真正需要的信息(分支、变更文件)，其余内容全部去除。

### 3.4 按命令统计的削减效果(以 30 分钟会话为基准)

| 命令 | 执行次数 | 原始 token | 使用 rtk 后 | 削减率 |
|--------|-----------|-----------|-----------|--------|
| `ls` / `tree` | 10 次 | 2,000 | 400 | 80% |
| `cat` / `read` | 20 次 | 40,000 | 12,000 | 70% |
| `grep` / `rg` | 8 次 | 16,000 | 3,200 | 80% |
| `git status` | 10 次 | 3,000 | 600 | 80% |
| `git diff` | 5 次 | 10,000 | 2,500 | 75% |
| `git add/commit/push` | 8 次 | 1,600 | 120 | 92% |
| `npm test` / `cargo test` | 5 次 | 25,000 | 2,500 | 90% |
| `pytest` | 4 次 | 8,000 | 800 | 90% |
| `go test` | 3 次 | 6,000 | 600 | 90% |
| `docker ps` | 3 次 | 900 | 180 | 80% |
| **合计** | — | **~118,000** | **~23,900** | **80%** |

### 3.5 安装与使用方法

**Homebrew(macOS，推荐)**

```bash
brew install rtk
```

**Linux / macOS 直接安装**

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh

# 添加到 PATH(以 zsh 为例)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**通过 Cargo 安装**

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

**Windows**：从发布页面下载 `rtk-x86_64-pc-windows-msvc.zip`，解压后将 `rtk.exe` 注册到 PATH 中。

**与 Claude Code 集成(自动挂钩)**

```bash
# 自动安装 Claude Code 的 PreToolUse 钩子
rtk init -g --claude-md

# 验证安装
rtk --version

# 测试运行
rtk git status
```

执行 `rtk init -g` 后，会自动在 `~/.claude/settings.json` 中添加 `PreToolUse` 钩子，使所有 Bash 命令都通过 rtk 路由，无需手动在命令前加上 `rtk`。

**查看节省统计**

```bash
# 查看累计节省统计及 ASCII 图表
rtk gain

# 按日导出 JSON 数据
rtk gain --json

# 探索被遗漏的节省机会
rtk discover
```

**自定义配置(`~/.config/rtk/config.toml`)**

```toml
[filters]
exclude_commands = ["echo", "pwd"]
tee_mode = true   # 失败时恢复原始输出

[project.myapp]
extra_filters = ["*.lock"]
```

### 3.6 注意事项

对于较短的命令，经过 rtk 处理后 token 数量反而可能略微增加(源于 rtk 自身的头部开销)。已经结构化的短输出会被原样通过。请使用 `rtk gain` 查看实际的节省量，如果一周后节省率仍不足 10%，可以考虑用 `rtk init -g --uninstall` 卸载它。

---

## 4. caveman + rtk 综合优化指南

### 4.1 综合理念:输入+输出双向优化

由于两款工具作用于不同的层面，组合使用时效果会被最大化。

```
[开发者命令]
     |
     v
[rtk CLI 代理]  <-- 过滤/压缩命令输出(削减 60%~90%)[输入优化]
     |
     v
[发送至 LLM]   (输入 token 优化完成)
     |
     v
[LLM 处理]
     |
     v
[LLM 响应]
     |
     v
[caveman 转换]   <-- 将响应转换为简洁形式(削减 65%~75%)[输出优化]
     |
     v
[最终压缩响应]

综合削减率:80%~95%
```

| 工具 | 角色 | 削减对象 |
|------|------|-----------|
| rtk | 在进入 LLM 之前压缩 CLI 输出 | 输入 token |
| caveman | 将 LLM 响应转换为简洁形式 | 输出 token |

### 4.2 综合配置方法

**第一步:安装 caveman 并注册技能**

```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
claude skills add JuliusBrussee/caveman
```

**第二步:安装 rtk 并与 Claude Code 集成**

```bash
brew install rtk          # macOS
rtk init -g --claude-md   # 自动安装 Claude Code 的 PreToolUse 钩子
```

**第三步:在 `~/.claude/settings.json` 中添加会话启动钩子**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "command": "echo 'RTK proxy active. Caveman mode ready.'"
      }
    ]
  }
}
```

**第四步:注册 shell 别名(可选，在 `~/.zshrc` 或 `~/.bashrc` 中)**

```bash
# 自动应用 rtk 代理
for cmd in git ls cat grep rg cargo npm pytest go docker kubectl; do
  alias $cmd="rtk $cmd"
done
```

**第五步:caveman 配置文件(在项目根目录创建 `.caveman.config`)**

```text
mode=ultra
exclude_files=Dockerfile,*.log
always_compress_tokens=true
```

### 4.3 进阶:OmniRoute Stacked 模式

OmniRoute 是一个可以将多个 LLM 优化引擎串联成统一流水线的工具。将 caveman + rtk 以 Stacked 模式连接后，仅需一份配置，两款工具便会自动按顺序依次运行。

```json
{
  "compression": {
    "mode": "stacked",
    "pipeline": ["rtk", "caveman"],
    "caveman_intensity": "ultra",
    "rtk_filters_path": ".rtk/filters.json"
  }
}
```

### 4.4 削减效果汇总

| 配置 | 削减率 | 削减对象 |
|------|--------|-----------|
| 仅使用 rtk | 60%~90% | 命令输出(输入 token) |
| 仅使用 caveman | 65%~75% | LLM 响应(输出 token) |
| rtk + caveman 组合使用 | **80%~95%** | 输入与输出整体 |

### 4.5 按实际使用场景的命令示例

**场景 1:调试测试失败**

```bash
# rtk 只提取失败的测试，caveman 简洁地返回分析结果
rtk cargo test
# caveman 响应示例:"3 tests fail: auth::token_expired, db::conn_timeout, api::rate_limit. See logs."
```

**场景 2:请求代码审查**

```bash
# rtk 压缩 diff，caveman 用一行返回审查意见
rtk git diff HEAD~1
/caveman-review
# 响应示例:"Missing null check in token.ts:42. Add early return."
```

**场景 3:生成提交信息**

```bash
rtk git status
/caveman-commit
# 响应示例:"fix: null check in token validation"
```

**场景 4:总结长日志**

```bash
rtk grep "ERROR" app.log
# caveman ultra 响应示例:"14 errors: 11x DB timeout, 3x auth fail. Peak 14:30-15:00."
```

**场景 5:检查依赖关系**

```bash
rtk npm list --depth=0
# rtk 去除重复及不必要的信息，只传递核心的包列表
```

### 4.6 真实用户体验

同时使用这两款工具的用户报告了一致的效果。原本 30 分钟会话就会耗尽的 Claude Code 上下文，被延长到了 3 小时以上，在重复性 CLI 操作较多的环境(如测试驱动开发、大规模 git 历史检索等)中效果尤为显著。

---

## 5. 成本节省计算器(粗略估算)

以 Claude Sonnet 的定价为基准(2026 年初，输入每百万 token 3 美元，输出每百万 token 15 美元):

| 场景 | 优化前月度成本 | 使用 caveman 后 | 使用 rtk 后 | 两者组合使用 |
|------|---------------------|-----------------|-------------|--------------|
| 个人开发者(小规模) | 50 美元 | 约 17 美元 | 约 15 美元 | 约 5~10 美元 |
| 10 人团队(中等规模) | 2,500 美元 | 约 800 美元 | 约 500 美元 | 约 125~250 美元 |
| 企业级流水线 | 10,000 美元以上 | 约 3,000 美元 | 约 2,000 美元 | 约 500~1,000 美元 |

> 实际节省金额会因任务类型、LLM 模型及使用模式而有所不同，请通过 `rtk gain` 和 `/caveman-stats` 确认实测数据。

---

## 6. 结语

caveman 和 rtk 分别以各自独特的方式实现 LLM 成本优化。caveman 专注于**输出优化**，rtk 专注于**输入优化**，两者形成完美的互补关系。

其核心原则很简单:LLM 的默认设置优化的是**对人类友好的响应方式**，而非成本效率。caveman 改变了响应的风格，rtk 则去除了上下文中的噪音。借助这两款工具，可以让 AI 编程助手的使用变得更便宜、更快速，也更聚焦。

---

## 7. 参考资料

| 项目 | 链接 |
|------|------|
| caveman GitHub | https://github.com/JuliusBrussee/caveman |
| rtk GitHub | https://github.com/rtk-ai/rtk |
| rtk 官方网站 | https://www.rtk-ai.app |
| arXiv 论文(2604.00025) | https://arxiv.org/abs/2604.00025 |
| Claude Plugin Hub - caveman | https://www.claudepluginhub.com/plugins/juliusbrussee-caveman |

> GitHub 星标数量及相关数据截至 2026 年 6 月，相关项目仍在持续发展中。最新信息请参阅各自仓库的官方文档。
