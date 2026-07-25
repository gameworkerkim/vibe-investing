---
title: "Open Code Review(OCR)完整指南"
description: "阿里巴巴集团经过两年内部验证后开源的混合式 AI 代码审查 CLI 工具完整指南。"
abstract: |
  Open Code Review(OCR)是阿里巴巴集团在内部运行验证两年后开源的 AI 代码审查 CLI 工具。内部使用期间超过
  2 万名开发者使用，检测出 100 多万个代码缺陷。其核心设计理念是"确定性工程(Deterministic Engineering)+
  LLM 智能体"的混合架构:必须保证准确性的处理环节由工程逻辑负责，只有需要动态判断的部分才交由 LLM 智能体处理。
  本指南涵盖项目概述、架构细节、安装方法、云端与本地 LLM(DeepSeek/Qwen/Ollama)配置、基本用法与命令参考、
  审查规则自定义、CI/CD 集成、AI 智能体(Claude Code/Codex)集成、完整配置参考、优缺点分析、模型选型指南
  以及适用团队类型。
summary_for_ai: |
  阿里巴巴集团开源的混合式 AI 代码审查 CLI 工具 Open Code Review(OCR)的完整指南，采用 Apache 2.0 许可。
  内部使用两年，超过 2 万名开发者使用，累计检测出 100 多万个缺陷，相比纯 LLM 方案节省约 80% 的 token，
  F1 性能提升 26.1%。
  架构核心:通过"确定性工程层"(精确的文件选择、智能文件打包、细粒度规则匹配、位置校正模块)解决通用 AI
  智能体在代码审查中常见的三大问题(覆盖不完整、位置漂移、质量不稳定)，同时通过"LLM 智能体层"处理需要
  动态判断和上下文检索的部分(场景化提示词模板、专业工具集、实时代码库检索)。
  安装方式:通过 npm(`npm install -g @alibaba-group/open-code-review`)、直接下载二进制文件，或从源码构建。
  LLM 配置涵盖云端 API(Anthropic Claude、OpenAI、DeepSeek Cloud、阿里云 DashScope/Qwen)以及本地模型
  (通过 Ollama、vLLM、LM Studio 运行 DeepSeek-R1/DeepSeek Coder V2/Qwen2.5-Coder/Qwen3)，并给出各模型的
  硬件需求(VRAM、推理速度)对照表。
  命令参考涵盖 `ocr review`(支持 --from/--to、--commit、--preview、--format json、--concurrency 等参数)、
  `ocr rules check`、`ocr config set`、`ocr llm test`、`ocr viewer` 等。
  审查规则采用四级优先体系(--rule 命令行参数 > 项目级 .opencodereview/rule.json > 全局级
  ~/.opencodereview/rule.json > 内置 system_rules.json)，支持基于路径的模式匹配规则配置。
  提供 GitHub Actions 与 GitLab CI 的完整集成示例，以及与 Claude Code(插件/技能/命令文件三种方式)、
  OpenAI Codex 的智能体集成方法。
  优点:经过大规模生产验证(battle-tested)、纯 CLI 工具不涉及 SaaS 数据外泄、相比纯 LLM 方案节省约 80%
  token、支持灵活切换云端与本地模型、提供官方 CI/CD 与智能体生态集成。
  缺点与注意事项:LLM API 调用成本需用户自行承担、初次配置需要一定学习成本、内置规则无法完全覆盖团队特有的
  业务逻辑、AI 无法完全替代人工在架构设计与业务契合度方面的判断。
  文末提供按场景(最高质量审查、日常 PR 审查、代码禁止外泄、复杂安全漏洞分析、成本最小化、轻量本地环境、
  GPU 服务器最高质量等)的模型选型指南，以及四类适用团队画像(大规模代码库运营组织、重视安全漏洞应对的团队、
  对 AI 引入成本敏感的团队、希望将 AI 融入现有审查流程的团队)。
date: 2026-06-08
author: "Dennis Kim"
lang: zh
featured: false
schema_type: TechArticle
keywords:
  - Open Code Review
  - AI 代码审查
  - 阿里巴巴
  - CI/CD
  - Claude Code
tags:
  - 代码审查
  - AI 工具
  - CI/CD
  - LLM
draft: false
---

# Open Code Review(OCR)完整指南

> 阿里巴巴集团经过两年内部验证后开源的混合式 AI 代码审查 CLI 工具
> Apache 2.0 | GitHub: [alibaba/open-code-review](https://github.com/alibaba/open-code-review)

---

## 目录

1. [项目概述](#1-项目概述)
2. [架构详解](#2-架构详解)
3. [安装](#3-安装)
4. [LLM 配置——云端 API](#4-llm-配置云端-api)
5. [LLM 配置——本地模型(DeepSeek / Qwen / Ollama)](#5-llm-配置本地模型deepseek--qwen--ollama)
6. [基本用法与命令参考](#6-基本用法与命令参考)
7. [自定义审查规则](#7-自定义审查规则)
8. [CI/CD 集成](#8-cicd-集成)
9. [AI 智能体集成(Claude Code / Codex)](#9-ai-智能体集成claude-code--codex)
10. [完整配置参考](#10-完整配置参考)
11. [优缺点分析](#11-优缺点分析)
12. [模型选型指南](#12-模型选型指南)
13. [适用团队类型](#13-适用团队类型)

---

## 1. 项目概述

Open Code Review(以下简称 OCR)是阿里巴巴集团将其内部运行验证两年的 AI 代码审查工具开源后形成的 CLI 项目。在内部运营期间，超过 2 万名开发者使用了该工具，累计检测出 100 多万个代码缺陷。它通过读取 Git diff，将变更文件传递给配置好的 LLM，生成精确到行级别的审查评论。

其核心设计理念是"确定性工程(Deterministic Engineering)+ LLM 智能体"的混合架构。必须保证准确性的处理环节由工程逻辑负责，只有需要动态判断的部分才委托给 LLM 智能体处理。

| 指标 | 数值 |
|---|---|
| 内部使用时长 | 2 年 |
| 累计使用开发者 | 超过 2 万人 |
| 累计检测缺陷数 | 超过 100 万个 |
| 相较纯 LLM 方案的 token 节省 | 约 80% |
| F1 性能提升 | 26.1% |
| 许可证 | Apache 2.0 |

---

## 2. 架构详解

### 通用 AI 智能体的局限性

直接将 Claude Code 或通用型智能体用于代码审查时，会反复出现以下问题:

- **覆盖不完整**：在变更文件较多的 PR 中，会随意遗漏部分文件。
- **位置漂移(Position Drift)**：报告的问题所在的行号或文件引用与实际情况不符。
- **质量不稳定**：提示词的细微变化会导致审查质量出现较大波动。

OCR 在架构层面解决了这三个问题。

### 确定性工程层(Deterministic Engineering)

必须保证准确性的环节由工程逻辑而非 LLM 来保障。

| 功能 | 说明 |
|---|---|
| 精确文件选择 | 精确确定需要审查的文件，过滤不必要的文件，防止重要变更被遗漏 |
| 智能文件打包 | 将相关文件归入同一审查单元(例如 `message_en.properties` + `message_zh.properties`)。每个包在独立上下文的子智能体中执行 |
| 细粒度规则匹配 | 为每个文件的特性匹配相应的审查规则，去除信息噪音，提升模型专注度 |
| 位置校正模块 | 通过独立的评论定位与反思(reflection)模块，系统性地改进 AI 反馈的位置准确性和内容准确性 |

### LLM 智能体层

负责需要动态判断和上下文检索的部分。

- 针对代码审查优化的场景化提示词模板
- 基于大规模生产数据的工具调用轨迹分析构建的专业工具集
- 实时代码库检索、读取文件全文、交叉引用其他变更文件

---

## 3. 安装

### NPM(推荐)

```bash
npm install -g @alibaba-group/open-code-review
```

安装完成后，`ocr` 命令即可全局使用。

### 直接下载二进制文件

```bash
# macOS(Apple Silicon / M1~M4)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-darwin-arm64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# macOS(Intel)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-darwin-amd64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# Linux(x86_64)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-linux-amd64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# Linux(ARM64)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-linux-arm64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr
```

### 从源码构建

```bash
git clone https://github.com/alibaba/open-code-review.git
cd open-code-review
make build
sudo cp dist/opencodereview /usr/local/bin/ocr
```

---

## 4. LLM 配置——云端 API

OCR 同时支持 OpenAI 兼容端点和 Anthropic 原生 API。配置文件保存在 `~/.opencodereview/config.json` 中。环境变量的优先级高于配置文件。

### Anthropic(Claude)

```bash
ocr config set llm.url https://api.anthropic.com/v1/messages
ocr config set llm.auth_token sk-ant-xxxxxxx
ocr config set llm.model claude-opus-4-6
ocr config set llm.use_anthropic true
```

如果你是 Claude Code 用户，`~/.zshrc` 或 `~/.bashrc` 中的 `ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_MODEL` 环境变量会被自动识别，无需额外配置。

推荐模型:

| 模型 | 用途 |
|---|---|
| `claude-opus-4-6` | 最高质量审查，复杂架构分析 |
| `claude-sonnet-4-6` | 成本与性能平衡，日常 PR 审查 |

### OpenAI(ChatGPT)

```bash
ocr config set llm.url https://api.openai.com/v1/chat/completions
ocr config set llm.auth_token sk-xxxxxxx
ocr config set llm.model gpt-4o
ocr config set llm.use_anthropic false
```

推荐模型:

| 模型 | 用途 |
|---|---|
| `gpt-4o` | 代码审查的基本推荐选择 |
| `o3` | 复杂安全漏洞分析 |
| `gpt-4.1-mini` | 需要降低成本的环境 |

### DeepSeek 云端 API

DeepSeek 提供 OpenAI 兼容 API，因此需将 `use_anthropic` 设为 `false`。

```bash
ocr config set llm.url https://api.deepseek.com/v1/chat/completions
ocr config set llm.auth_token sk-xxxxxxx
ocr config set llm.model deepseek-coder
ocr config set llm.use_anthropic false
```

推荐模型:

| 模型 | 特点 |
|---|---|
| `deepseek-coder` | 代码专用，成本效益出色 |
| `deepseek-reasoner` | 复杂逻辑分析与推理能力强 |

### 阿里云 DashScope(Qwen Cloud)

```bash
ocr config set llm.url https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
ocr config set llm.auth_token sk-xxxxxxx
ocr config set llm.model qwen-coder-turbo
ocr config set llm.use_anthropic false
```

---

## 5. LLM 配置——本地模型(DeepSeek / Qwen / Ollama)

使用本地 LLM 意味着代码不会发送到外部 API，可确保完全的数据隐私。OCR 支持任何在本地暴露 OpenAI 兼容端点的运行时环境(Ollama、LM Studio、vLLM 等)。

### 5-1. 基于 Ollama 的配置(通用)

Ollama 是运行本地 LLM 最简单的方式。安装完成后会自动在 `http://localhost:11434` 暴露 OpenAI 兼容端点。

```bash
# 安装 Ollama(macOS)
brew install ollama

# 安装 Ollama(Linux)
curl -fsSL https://ollama.com/install.sh | sh

# 后台启动服务
ollama serve &
```

将 OCR 连接到 Ollama:

```bash
ocr config set llm.url http://localhost:11434/v1/chat/completions
ocr config set llm.auth_token ollama
ocr config set llm.model qwen2.5-coder:32b
ocr config set llm.use_anthropic false
```

> auth_token 的值可以设置为任意字符串。Ollama 在本地不会进行 token 验证。

### 5-2. 本地运行 DeepSeek

#### 通过 Ollama 运行 DeepSeek

```bash
# DeepSeek-R1(推理专精，适合代码审查)
ollama pull deepseek-r1:14b    # 约需 9GB 显存
ollama pull deepseek-r1:32b    # 约需 20GB 显存
ollama pull deepseek-r1:70b    # 需要 48GB 以上显存

# DeepSeek Coder V2(代码专用)
ollama pull deepseek-coder-v2:16b    # 约需 10GB 显存
ollama pull deepseek-coder-v2:236b   # 约需 130GB 显存，质量最高

# 扩展上下文窗口(智能体工作流所必需)
ollama run deepseek-r1:14b
>>> /set parameter num_ctx 32768
>>> /save deepseek-r1-14b-32k
```

OCR 配置:

```bash
ocr config set llm.url http://localhost:11434/v1/chat/completions
ocr config set llm.auth_token ollama
ocr config set llm.model deepseek-r1:14b
ocr config set llm.use_anthropic false
```

#### 通过 vLLM 运行 DeepSeek(高性能 GPU 服务器环境)

```bash
docker pull vllm/vllm-openai:latest

# DeepSeek-R1 14B(约需 30GB 显存)
docker run --runtime nvidia --gpus all \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  -p 8000:8000 \
  vllm/vllm-openai:latest \
  --model deepseek-ai/DeepSeek-R1-Distill-Qwen-14B \
  --tensor-parallel-size 1
```

OCR 配置:

```bash
ocr config set llm.url http://localhost:8000/v1/chat/completions
ocr config set llm.auth_token vllm
ocr config set llm.model deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
ocr config set llm.use_anthropic false
```

#### 通过 LM Studio 运行 DeepSeek(图形界面环境)

1. 从 [lmstudio.ai](https://lmstudio.ai) 安装 LM Studio
2. 在"Discover"标签页搜索 `deepseek-r1`，下载所需大小的版本
3. 在"Local Server"标签页启动服务(默认端口:1234)

OCR 配置:

```bash
ocr config set llm.url http://localhost:1234/v1/chat/completions
ocr config set llm.auth_token lm-studio
ocr config set llm.model deepseek-r1-distill-qwen-14b
ocr config set llm.use_anthropic false
```

### 5-3. Qwen(Qwen2.5-Coder / Qwen3)本地运行

Qwen 系列在代码生成和审查方面展现出同级别开源模型中最强的性能。尤其是 Qwen2.5-Coder 32B 在 HumanEval 基准上达到 92.1%，超过了 Claude Sonnet 4.6(89.4%)。

```bash
# Qwen2.5-Coder(代码专用——代码审查首选推荐)
ollama pull qwen2.5-coder:7b     # 约需 5GB 显存，响应速度快
ollama pull qwen2.5-coder:14b    # 约需 9GB 显存，均衡之选
ollama pull qwen2.5-coder:32b    # 约需 20GB 显存，质量最高

# Qwen3(通用最新模型，2026 年 2 月发布)
ollama pull qwen3:8b
ollama pull qwen3:32b

# 扩展上下文窗口(以支持 256K 的模型为基准)
ollama run qwen2.5-coder:32b
>>> /set parameter num_ctx 32768
>>> /save qwen2.5-coder-32b-32k
```

OCR 配置:

```bash
ocr config set llm.url http://localhost:11434/v1/chat/completions
ocr config set llm.auth_token ollama
ocr config set llm.model qwen2.5-coder:32b
ocr config set llm.use_anthropic false
```

### 5-4. 本地 LLM 硬件需求

| 模型 | 显存 | 速度(token/秒) | 推荐用途 |
|---|---|---|---|
| DeepSeek-R1 14B | 9GB | 25~40 | 个人开发者笔记本，推理能力强 |
| Qwen2.5-Coder 7B | 5GB | 40~60 | 轻量环境，快速 PR 审查 |
| Qwen2.5-Coder 14B | 9GB | 25~35 | 均衡推荐 |
| Qwen2.5-Coder 32B | 20GB | 15~25 | 高质量代码审查，企业级 |
| DeepSeek-R1 32B | 20GB | 10~18 | 复杂安全分析 |
| DeepSeek Coder V2 236B | 130GB+ | 8~12 | 最高质量，专用 GPU 服务器 |

> 使用 Q4 量化可将显存占用降低约 60%，质量损失约在 2% 左右。Ollama 在拉取模型时会自动应用量化。

### 5-5. 连接测试

```bash
# 检查 LLM 连接(云端与本地通用)
ocr llm test
```

---

## 6. 基本用法与命令参考

### 主要审查命令

```bash
# 审查当前变更(staged + unstaged + untracked 全部)
ocr review

# 分支间对比审查
ocr review --from main --to feature-auth

# 审查特定提交
ocr review --commit abc123

# 不调用 LLM，仅预览将被审查的文件
ocr review --preview
ocr review --commit abc123 --preview

# JSON 输出(用于 CI/CD 流水线、脚本解析)
ocr review --format json --audience agent

# 应用自定义规则文件
ocr review --rule /path/to/my-rules.json

# 调整并发审查文件数
ocr review --from main --to my-feature --concurrency 4
```

### 完整命令列表

| 命令 | 别名 | 说明 |
|---|---|---|
| `ocr review` | `ocr r` | 开始代码审查 |
| `ocr rules check <file>` | — | 预览应用于该文件的规则 |
| `ocr config set <key> <value>` | — | 修改配置值 |
| `ocr llm test` | — | 测试 LLM 连接 |
| `ocr viewer` | `ocr v` | 启动基于浏览器的会话查看器(`localhost:5483`) |
| `ocr version` | — | 输出版本信息 |

### `ocr review` 主要参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| `--repo` | 当前目录 | Git 仓库根目录路径 |
| `--from` | — | 比较基准 ref(例如 `main`) |
| `--to` | — | 比较目标 ref(例如 `feature-branch`) |
| `--commit`, `-c` | — | 审查单个提交 |
| `--preview`, `-p` | `false` | 不调用 LLM，仅确认待审查文件 |
| `--format`, `-f` | `text` | 输出格式:`text` 或 `json` |
| `--concurrency` | `8` | 文件并发审查的最大数量 |
| `--timeout` | `10` | 并发任务超时时间(分钟) |
| `--audience` | `human` | `human`(显示进度)/ `agent`(仅输出摘要) |
| `--rule` | — | 自定义审查规则 JSON 文件路径 |
| `--max-tools` | 内置默认值 | 每个文件的最大工具调用次数 |
| `--tools` | — | 自定义工具配置 JSON 文件路径 |

---

## 7. 自定义审查规则

OCR 采用四级优先级体系应用规则。在每一级中，文件路径一旦首次匹配某个模式，就会应用该规则；若未匹配，则进入下一级。

| 优先级 | 来源 | 路径 | 说明 |
|---|---|---|---|
| 1(最高) | `--rule` 参数 | 用户指定路径 | 命令行显式覆盖 |
| 2 | 项目配置 | `<repoDir>/.opencodereview/rule.json` | 项目级规则，可提交至 git |
| 3 | 全局配置 | `~/.opencodereview/rule.json` | 个人全局设置 |
| 4(最低) | 系统默认值 | 内置 `system_rules.json` | NPE、XSS、SQL 注入等通用规则 |

### 规则文件格式

```json
{
  "rules": [
    {
      "path": "src/main/java/**/*.java",
      "rule": "所有新增方法的必填参数都必须校验 null 值"
    },
    {
      "path": "**/*mapper*.xml",
      "rule": "检查 SQL 注入风险、参数错误以及标签未闭合的问题"
    },
    {
      "path": "src/**/*.{ts,tsx}",
      "rule": "检查异步函数的错误处理以及 Promise 链是否遗漏处理"
    }
  ]
}
```

- `path` 支持 `**` 递归匹配以及 `{java,kt}` 花括号扩展语法。
- 在每一层内部按声明顺序依次评估，命中第一个匹配项即生效。
- 若规则文件不存在，则会静默跳过。

预先确认某个特定文件将应用哪些规则:

```bash
ocr rules check src/main/java/com/example/UserService.java
ocr rules check --rule custom.json src/main/resources/mapper/UserMapper.xml
```

---

## 8. CI/CD 集成

### GitHub Actions

```yaml
# .github/workflows/code-review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install OCR
        run: npm install -g @alibaba-group/open-code-review

      - name: Run Code Review
        env:
          OCR_LLM_URL: https://api.anthropic.com/v1/messages
          OCR_LLM_TOKEN: ${{ secrets.ANTHROPIC_API_KEY }}
          OCR_LLM_MODEL: claude-sonnet-4-6
          OCR_USE_ANTHROPIC: "true"
        run: |
          ocr review \
            --from "origin/${{ github.base_ref }}" \
            --to "origin/${{ github.head_ref }}" \
            --format json \
            --audience agent
```

### GitLab CI

```yaml
# .gitlab-ci.yml
code-review:
  stage: test
  image: node:20
  before_script:
    - npm install -g @alibaba-group/open-code-review
  script:
    - ocr review
        --from "origin/${CI_MERGE_REQUEST_TARGET_BRANCH_NAME}"
        --to "origin/${CI_MERGE_REQUEST_SOURCE_BRANCH_NAME}"
        --format json
        --audience agent
  variables:
    OCR_LLM_URL: "https://api.openai.com/v1/chat/completions"
    OCR_LLM_TOKEN: $OPENAI_API_KEY
    OCR_LLM_MODEL: "gpt-4o"
    OCR_USE_ANTHROPIC: "false"
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

### 通用 CI 脚本模式

```bash
ocr review \
  --from "origin/main" \
  --to "origin/feature-branch" \
  --format json \
  --audience agent
```

`--format json` + `--audience agent` 的组合会返回可在 CI 脚本中解析的结构化输出。该工具也已作为 Actions 发布在 GitHub Marketplace 上。

---

## 9. AI 智能体集成(Claude Code / Codex)

将 OCR 集成为 AI 编码智能体的斜杠命令后，即可在智能体工作流中直接执行代码审查。

### 方法 1:以 Skill 形式安装

```bash
npx skills add alibaba/open-code-review --skill open-code-review
```

编码智能体会学习如何调用 `ocr`、如何对问题进行优先级分类，以及自动修复选项。

### 方法 2:安装 Claude Code 插件

在 Claude Code 中执行以下命令:

```
/plugin marketplace add alibaba/open-code-review
/plugin install open-code-review@open-code-review
```

安装完成后，可通过 `/open-code-review:review` 斜杠命令运行 OCR，并自动处理问题过滤与修复。

### 方法 3:直接复制命令文件

无需包管理器即可快速配置的方法。

```bash
# 项目级(团队共享，可提交至 git)
mkdir -p .claude/commands
curl -o .claude/commands/open-code-review.md \
  https://raw.githubusercontent.com/alibaba/open-code-review/main/plugins/open-code-review/commands/review.md

# 用户级(在所有项目中个人使用)
mkdir -p ~/.claude/commands
curl -o ~/.claude/commands/open-code-review.md \
  https://raw.githubusercontent.com/alibaba/open-code-review/main/plugins/open-code-review/commands/review.md
```

### OpenAI Codex 集成

```bash
# 从 Codex 插件市场安装
codex plugin marketplace add alibaba/open-code-review
codex /plugins
```

安装完成后，可在 Codex 中如下使用:

```
@Open Code Review review my current changes
@Open Code Review review this branch against main
@Open Code Review review and fix high-confidence issues
```

> 所有集成方式的前提条件:必须先安装 `ocr` CLI 并完成 LLM 配置。OCR 内部的 LLM 后端与具体的智能体集成方式无关，独立运行。

---

## 10. 完整配置参考

配置文件路径:`~/.opencodereview/config.json`

### 配置键列表

| 键 | 类型 | 示例 | 说明 |
|---|---|---|---|
| `llm.url` | string | `https://api.openai.com/v1/chat/completions` | LLM API 端点 |
| `llm.auth_token` | string | `sk-xxxxxxx` | API 密钥/认证 token |
| `llm.model` | string | `claude-opus-4-6` | 模型名称 |
| `llm.use_anthropic` | boolean | `true` / `false` | 是否使用 Anthropic 原生 API |
| `language` | string | `English` / `Chinese` | 审查输出语言(默认值:Chinese) |
| `telemetry.enabled` | boolean | `true` / `false` | 是否启用遥测 |
| `telemetry.exporter` | string | `console` / `otlp` | 遥测数据导出方式 |
| `telemetry.otlp_endpoint` | string | `localhost:4317` | OTLP 采集器地址 |
| `telemetry.content_logging` | boolean | — | 遥测数据中是否包含 LLM 提示词 |

### 环境变量列表

环境变量的优先级高于配置文件。

| 环境变量 | 说明 |
|---|---|
| `OCR_LLM_URL` | LLM API 端点 URL |
| `OCR_LLM_TOKEN` | API 密钥/认证 token |
| `OCR_LLM_MODEL` | 模型名称 |
| `OCR_USE_ANTHROPIC` | `true` = Anthropic，`false` = OpenAI 兼容 |

同时会自动识别 Claude Code 的环境变量(`ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_MODEL`)。

### 修改审查输出语言

默认输出语言为中文。若要修改为英文或韩语:

```bash
ocr config set language English
# 或
ocr config set language Korean
```

### 遥测配置(OpenTelemetry)

```bash
ocr config set telemetry.enabled true
ocr config set telemetry.exporter otlp
ocr config set telemetry.otlp_endpoint localhost:4317
```

启用 `telemetry.content_logging` 后，导出数据中会包含 LLM 的提示词和响应内容。默认值为关闭。

---

## 11. 优缺点分析

### 优点

**大规模验证(Battle-tested)**

超过 2 万名阿里巴巴内部开发者使用了两年，累计检测出 100 多万个缺陷。由于是 CLI 工具而非 SaaS 服务，代码和数据不会外泄，满足企业级安全要求。结合本地 LLM 使用，还可以构建完全的隔离(Air-gap)环境。

**经济性与混合式设计**

相较纯 LLM 智能体方案，token 使用量削减 80%。通用 AI 代码审查中三个长期存在的顽疾(覆盖不完整、位置漂移、质量不稳定)都在确定性工程层得到了结构性的解决。

**灵活的模型支持**

支持 OpenAI、Anthropic、DeepSeek、DashScope(Qwen)、Ollama 等任何暴露 OpenAI 兼容端点的运行时环境，可以自由切换云端与本地 LLM。

**CI/CD 与智能体生态集成**

官方提供 GitHub Actions、GitLab CI 示例，并通过插件/技能/命令等方式与 Claude Code、Codex 等主流 AI 编码智能体集成。

### 缺点与注意事项

**LLM API 成本**

工具本身以 Apache 2.0 免费提供，但后端 LLM API 的调用成本需由用户自行承担。使用本地 LLM 可以消除这部分成本，但会带来相应的硬件要求。

**初始环境配置**

已经在使用 Claude Code 的用户由于环境变量会被自动识别，无需额外配置；但新用户需要经历配置 LLM API 密钥、端点、模型的过程。使用本地 LLM 时，还需额外安装 Ollama 并下载模型(数 GB)。

**业务逻辑的局限性**

尽管内置规则和自定义规则可以弥补相当一部分需求，但无法完全理解团队特有的业务逻辑或领域特定的约定。需要持续在规则文件中补充团队专属的指引才能保证效果。

**AI 的根本性局限**

高层次的架构设计合理性以及是否完全契合业务需求，仍难以用 AI 判断取代人工判断。OCR 是减轻审查人员负担的辅助工具，而非完全的替代品。

---

## 12. 模型选型指南

| 场景 | 推荐模型 | 理由 |
|---|---|---|
| 最高质量审查，成本充裕 | Claude Opus 4.6(云端) | 复杂上下文理解及架构分析能力强 |
| 日常 PR 审查，成本均衡 | Claude Sonnet 4.6 或 GPT-4o | 性能与成本的平衡 |
| 代码完全不能外泄 | Qwen2.5-Coder 32B(Ollama) | 本地运行，HumanEval 92.1% |
| 复杂安全漏洞分析 | DeepSeek-R1(本地或云端) | 推理专精架构 |
| 成本最小化(云端) | DeepSeek Coder API | 代码专用 + API 单价低 |
| 轻量本地环境(8GB 显存以下) | Qwen2.5-Coder 7B | 响应快速，硬件需求低 |
| GPU 服务器最高质量 | DeepSeek Coder V2 236B | HumanEval 95.7%(开源最高水平) |

---

## 13. 适用团队类型

**运营大规模代码库的组织**

即便在同时变更大量文件的 PR 中，智能打包与文件选择逻辑也能做到无遗漏的全面覆盖。相较通用智能体，其遗漏率在结构上更低。

**重视安全漏洞应对的团队**

能在审查初期阶段拦截 NPE、SQL 注入、XSS、线程安全等高风险缺陷。结合本地 LLM 使用，还可以构建代码完全不外泄的私有化环境。

**对 AI 引入成本敏感的团队**

节省 80% 的 token，相当于用同等预算将可覆盖的审查规模扩大 5 倍。使用 DeepSeek 云端 API 或 Qwen 本地模型，还能进一步降低成本。

**希望将 AI 融入现有审查流程的团队**

OCR 作为第一道过滤，先处理 NPE、安全漏洞、编码规范违规等问题，人工审查者便可以专注于架构设计和业务逻辑的审查。

---

## 参考资料

- [GitHub 仓库](https://github.com/alibaba/open-code-review)
- [官方文档网站](https://alibaba.github.io/open-code-review/)
- [GitHub Marketplace(Actions)](https://github.com/marketplace?q=open-code-review)
- [数字今日(디지털투데이)——token 用量削减 80% 的介绍报道](https://digitaltoday.co.kr)(2026.6.8)
- [Gigazine——内部性能基准测试结果报道](https://gigazine.net)(2026.6.7)
