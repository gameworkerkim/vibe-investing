---
title: "caveman + rtk：AI 编码助手 Token 优化完全指南"
description: "caveman 与 rtk 两个开源项目如何组合使用，将 AI 编码助手的 token 用量合计削减 80-95%"
lang: zh
featured: false
schema_type: TechArticle
keywords:
  - caveman
  - rtk
  - token 优化
  - Claude Code
  - LLM 成本削减
tags:
  - LLM
  - Claude Code
  - 成本优化
  - CLI 工具
---

# caveman + rtk：AI 编码助手 Token 优化完全指南

> "Why use many token when few token do trick?" —— caveman 的口号

---

## 1. 概述

随着 AI 编码助手的普及,API 费用和上下文 token 消耗对开发者而言正变成越来越沉重的负担。在这一背景下,两个具有创新性的开源项目应运而生。

**caveman** 的出发点是"为什么要用很多 token,少量 token 就能解决问题呢?"它引导 AI 在不使用多余措辞的情况下只传达核心内容,在保持技术准确性 100% 的同时将输出 token 削减约 65-75%。自 2026 年 4 月发布以来,短时间内获得了超过 71,000 个 GitHub star(截至 2026 年 6 月),备受关注。

rtk(Rust Token Killer)是一款实时过滤并压缩 CLI 命令输出的代理工具,在内容到达 LLM 上下文之前将输入 token 用量减少 60-90%。它是一个无依赖的单一 Rust 二进制文件,开销低于 10 毫秒,拥有超过 42,000 个 GitHub star。

由于两个工具分别作用于不同的层面(输入/输出),两者结合使用时协同效应会被最大化。

---

## 2. caveman

### 2.1 背景

caveman 诞生于对 AI 过度话术和不必要措辞如何影响成本与效率的批判性思考。2026 年 3 月发表在 arXiv 上的一篇论文("Brevity Constraints Reverse Performance Hierarchies in Language Models",编号 2604.00025)证明,AI 回答越简短精炼,在某些基准测试上的准确率反而可能提升多达 26 个百分点。caveman 正是将这一学术发现付诸实践的工具。

Claude 默认被训练为以友好、详尽的方式回应。这在日常对话中是优点,但在自动化开发流水线中却是高成本的低效行为。caveman 改变了这一默认设置,在保持代码、URL、文件路径等技术信息 byte-perfect 的同时,去除自然语言的包装。

### 2.2 效果

| 项目 | 效果 |
|------|------|
| 输出 token 削减 | 平均 65-75%(范围 22-87%) |
| 响应速度提升 | 约快 3 倍 |
| 技术准确性 | 保持 100% |
| 输入 token 削减 | 压缩 CLAUDE.md 等配置文件时约削减 46% |
| API 成本节省示例 | 以每日 10,000 次 API 调用为基准,每年约节省 $7,665(以 Claude Sonnet 为准) |

### 2.3 压缩强度等级

caveman 提供 4 个可根据情况调节的强度等级。

| 等级 | 说明 | 示例 |
|------|------|------|
| `lite` | 保留语法,去除不必要的修饰语 | "Your component re-renders because you create a new object reference each render." |
| `full` | 去除冠词/问候语,句子简化 | "New object ref each render. Inline object prop = new ref = re-render." |
| `ultra` | 最大压缩,保留专业术语 | "Inline obj prop → new ref → re-render. useMemo." |
| `wenyan` | 文言文风格 | "物出新參照，致重繪。useMemo Wrap之。" |

#### 实际对比示例

普通响应:
```
I've successfully completed the refactoring of the authentication module.
The changes include updating the token validation logic to handle edge cases
more gracefully, adding appropriate error handling, and ensuring backwards
compatibility with the existing API contracts.
```

应用 caveman `ultra` 后:
```
Auth module refactored. Token validation, error handling, backward compat.
```

传达相同信息的同时,token 减少了约 75%。

### 2.4 额外的实用命令

| 命令 | 功能 |
|--------|------|
| `/caveman-commit` | 生成 50 字以内的简洁提交信息 |
| `/caveman-review` | 编写一行 PR 评论 |
| `/caveman-stats` | 显示实时 token 统计与成本 |
| `/caveman-compress` | 压缩 CLAUDE.md 等配置文件 |

### 2.5 安装与使用

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

# 关闭
stop caveman
```

**直接插入到 CLAUDE.md / AGENTS.md 中(system prompt 方式)**

```text
You are a code assistant. Respond in caveman speak only. No pleasantries.
No greetings, no sign-offs, no narration. Just the answer.
```

> 支持平台: Claude Code、Codex、Gemini CLI、Cursor、Windsurf、Cline、GitHub Copilot 等 34 种以上的 AI 编码工具

### 2.6 注意事项

caveman 只对**输出 token** 有效,思考/推理(thinking/reasoning)token 不受影响。"Caveman no make brain smaller. Caveman make mouth smaller."因此,相比以代码生成为主的任务,其效果在对话、头脑风暴、问答等交互频繁的会话中更为突出。

---

## 3. rtk(Rust Token Killer)

### 3.1 背景

AI 编码代理在执行测试、代码检查(lint)、git 命令等操作时产生的大量日志和控制台输出会消耗巨量的输入 token。例如,仅一次 `git status` 就可能产生 2,000 个 token,而运行 `cargo test` 会将 200 多行原始输出直接注入上下文窗口,代理会读取其中每一行。

rtk 在命令输出到达 LLM 上下文之前的阶段进行过滤和压缩,以此解决该问题,并且在不改变工作流的前提下透明运行。

### 3.2 效果

| 项目 | 数值 |
|------|------|
| Token 削减率 | 60-90% |
| 支持命令数 | 100+ |
| 开销 | 低于 10 毫秒 |
| 依赖项 | 无(单一 Rust 二进制文件) |
| GitHub star | 42,000+(2026 年 6 月) |
| 许可证 | Apache-2.0 |

### 3.3 核心压缩策略

rtk 通过四种策略压缩输出:

1. **智能过滤(Smart Filtering)**: 去除 ANSI 代码、进度条、注释、多余空白和样板内容
2. **分组聚合(Group Aggregation)**: 归并相似项目(按目录分类的文件、按类型分类的错误等)
3. **智能截断(Intelligent Truncation)**: 保留相关上下文,去除重复
4. **去重(Deduplication)**: 将重复出现的行折算为计数

#### 压缩前后对比: `git status`

普通输出(约 2,000 token):
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

应用 rtk 后(约 400 token):
```
main...origin/main ~ Modified: 1 files src/auth/token.ts
```

只保留 LLM 实际需要的信息(分支、变更文件),其余全部移除。

### 3.4 各命令的削减效果(以 30 分钟会话为基准)

| 命令 | 执行次数 | 普通 token | 应用 rtk | 削减率 |
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

### 3.5 安装与使用

**Homebrew(macOS,推荐)**

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

**Windows**: 从发布页面下载 `rtk-x86_64-pc-windows-msvc.zip`,并将 `rtk.exe` 添加到 PATH。

**与 Claude Code 集成(自动钩子)**

```bash
# 自动安装 Claude Code 的 PreToolUse 钩子
rtk init -g --claude-md

# 验证安装
rtk --version

# 测试运行
rtk git status
```

执行 `rtk init -g` 后会自动在 `~/.claude/settings.json` 中添加 `PreToolUse` 钩子,使所有 Bash 命令都通过 rtk 路由,无需手动在命令前加上 `rtk`。

**查看节省统计**

```bash
# 查看累计节省统计与 ASCII 图表
rtk gain

# 按日期导出 JSON
rtk gain --json

# 发现被遗漏的节省机会
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

对于很短的命令,经过 rtk 处理后 token 反而可能略有增加(rtk 头部开销)。已经结构化的短输出会原样通过。使用 `rtk gain` 确认实际节省量,若一周后节省幅度仍低于 10%,可考虑使用 `rtk init -g --uninstall` 卸载。

---

## 4. caveman + rtk 综合优化指南

### 4.1 组合理念: 输入 + 输出双向优化

由于两个工具作用于不同层面,组合使用时效果会被最大化。

```
[开发者命令]
     |
     v
[rtk CLI 代理]  <-- 过滤/压缩命令输出(削减 60-90%)[输入优化]
     |
     v
[发送给 LLM]   (输入 token 已优化完成)
     |
     v
[LLM 处理]
     |
     v
[LLM 响应]
     |
     v
[caveman 转换]   <-- 将响应转换为简洁形式(削减 65-75%)[输出优化]
     |
     v
[最终压缩响应]

整体削减率: 80-95%
```

| 工具 | 角色 | 削减对象 |
|------|------|-----------|
| rtk | 在 CLI 输出送入 LLM 前进行压缩 | 输入 token |
| caveman | 将 LLM 响应转换为简洁形式 | 输出 token |

### 4.2 组合配置方法

**步骤 1: 安装 caveman 并注册技能**

```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
claude skills add JuliusBrussee/caveman
```

**步骤 2: 安装 rtk 并与 Claude Code 集成**

```bash
brew install rtk          # macOS
rtk init -g --claude-md   # 自动安装 Claude Code 的 PreToolUse 钩子
```

**步骤 3: 在 `~/.claude/settings.json` 中添加会话启动钩子**

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

**步骤 4: 注册 shell 别名(可选,`~/.zshrc` 或 `~/.bashrc`)**

```bash
# 自动应用 rtk 代理
for cmd in git ls cat grep rg cargo npm pytest go docker kubectl; do
  alias $cmd="rtk $cmd"
done
```

**步骤 5: caveman 配置文件(在项目根目录创建 `.caveman.config`)**

```text
mode=ultra
exclude_files=Dockerfile,*.log
always_compress_tokens=true
```

### 4.3 进阶: OmniRoute 堆叠(Stacked)模式

OmniRoute 是一个将多个 LLM 优化引擎整合为统一流水线的工具。以 Stacked 模式连接 caveman + rtk 后,只需一份配置即可让两个工具按顺序自动运行。

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

### 4.4 节省效果汇总

| 组合 | 削减率 | 削减对象 |
|------|--------|-----------|
| 仅 rtk | 60-90% | 命令输出(输入 token) |
| 仅 caveman | 65-75% | LLM 响应(输出 token) |
| rtk + caveman 组合 | **80-95%** | 输入 + 输出整体 |

### 4.5 按实际使用场景的命令示例

**场景 1: 调试测试失败**

```bash
# rtk 只提取失败的测试,caveman 简洁地返回分析结果
rtk cargo test
# caveman 响应示例: "3 tests fail: auth::token_expired, db::conn_timeout, api::rate_limit. See logs."
```

**场景 2: 请求代码审查**

```bash
# rtk 压缩 diff,caveman 用一行返回审查结果
rtk git diff HEAD~1
/caveman-review
# 响应示例: "Missing null check in token.ts:42. Add early return."
```

**场景 3: 生成提交信息**

```bash
rtk git status
/caveman-commit
# 响应示例: "fix: null check in token validation"
```

**场景 4: 总结长日志**

```bash
rtk grep "ERROR" app.log
# caveman ultra 响应示例: "14 errors: 11x DB timeout, 3x auth fail. Peak 14:30-15:00."
```

**场景 5: 检查依赖项**

```bash
rtk npm list --depth=0
# rtk 去除重复及不必要的信息,只传递核心包列表
```

### 4.6 真实用户体验

组合使用两个工具的用户报告了一致的效果。原本在 30 分钟会话中就会耗尽的 Claude Code 上下文延长到了 3 小时以上,在重复 CLI 操作较多的环境(测试驱动开发、大规模 git 历史检索等)中效果尤为明显。

---

## 5. 成本节省计算器(快速估算)

以 Claude Sonnet 为基准(2026 年初标准,输入 $3/百万 token,输出 $15/百万 token):

| 条件 | 优化前月费用 | 应用 caveman 后 | 应用 rtk 后 | 两者组合 |
|------|---------------------|-----------------|-------------|--------------|
| 个人开发者(小规模) | $50 | ~$17 | ~$15 | ~$5-10 |
| 10 人团队(中等规模) | $2,500 | ~$800 | ~$500 | ~$125-250 |
| 企业流水线 | $10,000+ | ~$3,000 | ~$2,000 | ~$500-1,000 |

> 实际节省金额因任务类型、LLM 模型、使用模式而异。请通过 `rtk gain` 和 `/caveman-stats` 确认实测数据。

---

## 6. 结语

caveman 与 rtk 各自以独特的方式应对 LLM 成本优化问题。caveman 专注于**输出优化**,rtk 专注于**输入优化**,两者完美互补。

核心原则很简单: LLM 的默认设置并非为成本效率而优化,而是为**人类友好的响应**而优化。caveman 改变响应风格,rtk 去除上下文噪声。借助这两个工具,可以让 AI 编码助手的使用变得更便宜、更快速、更专注。

---

## 7. 参考资料

| 项目 | 链接 |
|------|------|
| caveman GitHub | https://github.com/JuliusBrussee/caveman |
| rtk GitHub | https://github.com/rtk-ai/rtk |
| rtk 官方网站 | https://www.rtk-ai.app |
| arXiv 论文(2604.00025) | https://arxiv.org/abs/2604.00025 |
| Claude Plugin Hub - caveman | https://www.claudepluginhub.com/plugins/juliusbrussee-caveman |

> GitHub star 数及相关数据以 2026 年 6 月为准,项目仍在持续发展。最新信息请参考各仓库的官方文档。
