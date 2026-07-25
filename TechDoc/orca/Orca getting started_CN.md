---
title: "Orca Getting Started — 多 AI 代理编排指南"
description: "Orca 可将同一提示词分发给多个 CLI 编码代理，在隔离的 git worktree 中并行运行，并合并最优结果——入门指南。"
abstract: |
  Orca 是 Stably AI 提供的免费开源 Agent Development Environment (ADE)，可并行编排 Claude Code、Codex、OpenCode、Cursor CLI、Gemini CLI 等终端编码代理，每个代理在独立的 git worktree 中隔离运行，便于并排比较 diff 并只合并最佳结果。Orca 本身无需登录或 API 密钥，需自备已认证的代理 CLI；Orca 免费，但各代理的订阅费或 API 费用仍由用户自行承担。
summary_for_ai: |
  面向 AI 代理的参考说明：Orca 不是 Cursor 的替代品——Cursor CLI 本身就是在 Orca 内运行的代理之一。需要 Git 2.5+ 以支持 worktree，且至少有一个已认证的代理 CLI，安装后才有实际价值。同一任务并行运行多个代理会相应倍增 token/API 消耗，这是独立于 Orca 免费之外的需计入的成本因素。
date: 2026-07-15
author: "Dennis Kim"
lang: zh
featured: false
schema_type: TechArticle
draft: false
---

# Orca Getting Started — 多 AI 代理编排指南

| 项目 | 内容 |
|---|---|
| 产品名 | Orca (Agent Development Environment, ADE) |
| 开发商 | Stably AI (Y Combinator 投资组合) |
| 许可证 | MIT (开源，免费) |
| 支持平台 | macOS / Windows / Linux + iOS / Android 伴侣应用 |
| 仓库 | github.com/stablyai/orca |
| 官方文档 | onorca.dev/docs |
| 核心概念 | 在隔离的 git worktree 中并行运行多个 CLI 编码代理，并比较、合并结果的桌面控制平面 |

---

## 1. Orca 是什么？

Orca 是一个**在单屏上并行指挥** Claude Code、Codex、OpenCode、Cursor CLI、Gemini CLI 等终端 AI 编码代理的**编排器**。它不是把 AI 叠加在现有 IDE 上，而是从设计之初就以「代理舰队 (fleet) 运营」为前提的 ADE (Agent Development Environment)。

核心思路很简单。

1. 将同一个开发请求同时分发给多个代理 (Fan-out)
2. 每个代理在各自的 `git worktree` 中隔离工作
3. 完成后并排查看 Diff、比较，只合并最佳结果 (Merge the winner)

注意：Orca 不是 Cursor 的替代品。就连 Cursor CLI 也只是 Orca 内运行的代理之一。Orca 替代的是「开 5 个终端标签页手动管理」的旧工作流。

---

## 2. 前置准备

Orca 本身无需登录或注册 API 密钥。但**你计划使用的代理 CLI 必须已安装并完成认证。** Orca 不会代理或转售任何 API，各代理直接从你的机器调用各自的提供商。

| 准备项 | 确认方法 | 备注 |
|---|---|---|
| Git 2.5 及以上 | `git --version` | 必须使用 worktree 功能 |
| 至少一个代理 CLI | `claude --version`、`codex --version` 等 | Claude Code、Codex、OpenCode、Gemini CLI、Cursor CLI 等，能在终端运行的均可 |
| 各代理认证完成 | 在终端中单独运行是否正常 | 例如：运行 `claude` 后确认已登录 |
| 待操作的 Git 仓库 | 本地克隆或 GitHub 仓库 | 基于 worktree，必须以 Git 仓库为前提 |

成本结构：Orca 本身免费，但内部运行的代理订阅费 (Claude Pro/Max、ChatGPT Plus 等) 或 API 使用费需自行承担。

---

## 3. 安装

### macOS (Homebrew)

```bash
brew install --cask stablyai/orca/orca
```

注意：`brew install --cask orca`（省略 tap 路径）无法工作。必须使用完整的 `stablyai/orca/orca` 路径。

### Arch Linux (AUR)

```bash
yay -S stably-orca-bin
# 如需源码构建: yay -S stably-orca-git
```

### Windows / 其他 Linux

- 从 onorca.dev 或 GitHub Releases (github.com/stablyai/orca/releases) 下载安装包

### 移动伴侣应用

- iOS：App Store / TestFlight
- Android：GitHub Releases 中的 APK
- 与桌面应用配对后，可监控代理进度、接收完成通知、远程发送后续提示词。

---

## 4. 初始设置 (First Run)

1. **连接项目**：启动 Orca 后添加本地 Git 仓库。配置 GitHub 集成后，可在应用内直接浏览 PR、Issue 和项目看板。
2. **确认代理**：Orca 会识别系统中已安装的 CLI 代理。创建新 worktree 时选择要挂载的代理。
3. **通知设置**：配置桌面/移动通知，在代理完成任务或等待输入时收到提醒。并行运行时此功能几乎必不可少。
4. **（可选）账户切换/用量追踪**：在仪表板查看 Claude/Codex 用量和 rate-limit 重置时间，可在多个账户间无需重新登录即可切换。

---

## 5. 核心工作流

### 5.1 基本循环：Fan-out → 隔离 → 比较 → 合并

| 阶段 | 动作 | 说明 |
|---|---|---|
| 1. Fan-out | 将同一提示词同时发给多个代理 | 例如：将同一 bug 修复请求并行发给 Claude Code、Codex、OpenCode 三个代理 |
| 2. 隔离执行 | 各代理在独立 git worktree + 专用终端中工作 | worktree 共享同一仓库，但工作目录和分支完全分离。主分支不会被污染 |
| 3. 监控 | 通过实时状态仪表板查看所有代理状态 | 工作中 / 等待输入 / 已完成一目了然，移动应用也可查看 |
| 4. 比较 | 并排比较各 worktree 的 Diff | 可在特定行添加注释，将修改反馈发回代理 |
| 5. 合并 | 选择最佳结果合并到主分支 | 其余 worktree 丢弃 |

### 5.2 实战场景

- **并行修 bug**：同一 bug 同时交给 3 个代理，只合并真正可用的修复
- **风险分散**：通过多次尝试对冲单个模型写错方向的概率
- **GitHub/Linear 任务驱动**：从 PR、Issue、Linear 工单直接打开 worktree，代理自动接收任务上下文
- **Design Mode（前端）**：在内置 Chromium 浏览器中点击 UI 元素，该元素的 HTML、CSS 和裁剪截图会自动注入代理提示词
- **远程执行 (SSH worktree)**：在高性能远程服务器上运行代理，同时在本地照常编辑文件、使用 git 和终端。支持自动重连和端口转发
- **Orca CLI**：在终端用脚本控制 IDE 本身——添加项目、创建 worktree、发布进度检查点等

---

## 6. 优点

| 优点 | 详情 |
|---|---|
| 工具整合 | 在单一 UI 中管理 30+ 种 CLI 代理 (Claude Code、Codex、Gemini、Copilot、Cline 等)。「终端能跑，Orca 就能跑」 |
| 风险分散 | 同一任务多次尝试后选最佳结果，降低对单一模型的依赖 |
| 完全隔离 | 基于 git worktree 物理分离各任务，消除分支切换和 stash 地狱 |
| 代码审查环境 | Diff 可视化 + 行级注释 + 代理反馈循环 + 应用内提交 |
| 远程/移动 | SSH 远程 worktree、移动监控与操控。离开座位代理舰队仍可继续工作 |
| 订阅友好 | 直接使用现有订阅，无厂商锁定，支持用量追踪和账户热切换 |
| 开源 | MIT 许可证，每日发布，开发节奏快 |

---

## 7. 缺点与注意事项

| 缺点 | 详情 |
|---|---|
| 入门门槛 | 需理解 git worktree 概念并预先配置代理 CLI。相比 Cursor「安装即编码」有初始学习曲线 |
| UI/UX 不成熟 | 仍有粗糙之处，例如缩小分屏后终端输入框变窄 |
| 偶发不稳定 | 终端转义序列可能损坏，有时需要重启 |
| 快速变化本身是风险 | 早期产品功能面每日变动，团队标准工作流可能因更新而动摇 |
| 额外成本 | Orca 免费，但代理订阅/API 费用另计。并行执行会成倍增加 token 消耗 |
| 开销 | 只用一个代理、一次一个任务的用户，可能比纯终端更有运营负担 |

---

## 8. 竞品对比

Orca 的定位不是「Cursor 替代品」，而是「代理之上的控制塔」。

| 产品 | 类型 | 与 Orca 的差异 |
|---|---|---|
| Cursor / Windsurf | AI 内置一体化 IDE | 安装即用，但缺少多代理并行执行与比较功能。Cursor CLI 反而可在 Orca 内运行 |
| Aider / Continue.dev | 开源单代理工具 | 并行执行与可视化 Diff 比较不是核心 |
| Claude Squad | 终端 TUI 型多代理管理器 | 适合 tmux 风格工作流。无桌面 GUI、移动或浏览器集成 |
| Agent Deck | 终端会话管理器 | 侧重指挥、通知、MCP 套接字池。比 Orca 更轻量 |
| Paseo | 自托管跨设备控制 | 优先 Web/移动/CLI 全方位访问而非桌面 IDE 界面时适用 |
| 纯终端 (如单独使用 Claude Code) | 基本工作流 | 一次只跑一个任务时，编排本身不必要 |

结论：Orca 最大的竞争对手仍是开发者的「现有习惯」。对认真运营多代理的高级用户很强，对单代理用户则过度配置。

---

## 9. 5 分钟快速入门清单

```text
[ ] 用 git --version 确认 Git 2.5+
[ ] 至少安装并登录一个代理 CLI (例如 claude)
[ ] brew install --cask stablyai/orca/orca (macOS)
[ ] 启动 Orca 并添加本地 Git 仓库
[ ] 创建新 worktree → 选择代理 → 发送第一个提示词
[ ] 向第二个代理 Fan-out 同一提示词
[ ] 在 Diff 比较界面审查两个结果
[ ] 合并胜者，丢弃败者 worktree
[ ] (可选) 配对移动应用并启用通知
```

---

## 10. 参考链接

- 仓库: https://github.com/stablyai/orca
- 官网/文档: https://www.onorca.dev
- 发布: https://github.com/stablyai/orca/releases
- 社区: Discord, X(@orca_build)

---

*撰写日期: 2026-07-15。Orca 每日发布，建议以 changelog 为准重新确认具体功能。*
