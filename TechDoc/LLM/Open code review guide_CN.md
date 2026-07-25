---
title: "Open Code Review (OCR) 完全指南"
description: "阿里巴巴集团经过两年内部验证后开源的混合式 AI 代码审查 CLI 工具"
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
---

# Open Code Review (OCR) 完全指南

> 阿里巴巴集团经过两年内部验证后开源的混合式 AI 代码审查 CLI 工具
> Apache 2.0 | GitHub: [alibaba/open-code-review](https://github.com/alibaba/open-code-review)

---

## 目录

1. [项目概览](#1-项目概览)
2. [架构详解](#2-架构详解)
3. [安装](#3-安装)
4. [LLM 配置 —— 云端 API](#4-llm-配置--云端-api)
5. [LLM 配置 —— 本地模型(DeepSeek / Qwen / Ollama)](#5-llm-配置--本地模型deepseek--qwen--ollama)
6. [基本用法与命令参考](#6-基本用法与命令参考)
7. [自定义审查规则](#7-自定义审查规则)
8. [CI/CD 集成](#8-cicd-集成)
9. [AI 代理集成(Claude Code / Codex)](#9-ai-代理集成claude-code--codex)
10. [完整配置参考](#10-完整配置参考)
11. [优缺点分析](#11-优缺点分析)
12. [模型选择指南](#12-模型选择指南)
13. [适合的团队类型](#13-适合的团队类型)

---

## 1. 项目概览

Open Code Review(以下简称 OCR)是阿里巴巴集团将其内部运行并验证了两年的 AI 代码审查工具开源后形成的 CLI 项目。在内部运行期间,超过 2 万名开发者使用了该工具,累计检测出超过 100 万个代码缺陷。它通过读取 Git diff,将变更的文件传递给配置好的 LLM,生成行级精准的审查评论。

其核心设计理念是"确定性工程(Deterministic Engineering)+ LLM 代理"的混合架构。必须保证准确性的处理阶段由工程逻辑负责,只有需要动态判断的部分才委托给 LLM 代理。

| 指标 | 数值 |
|---|---|
| 内部使用时长 | 2 年 |
| 累计使用开发者 | 2 万人以上 |
| 累计检测缺陷 | 100 万个以上 |
| 相对纯 LLM 的 token 节省 | 约 80% |
| F1 性能提升 | 26.1% |
| 许可证 | Apache 2.0 |

---

## 2. 架构详解

### 通用 AI 代理的局限性

直接使用 Claude Code 或通用代理进行代码审查时,会反复出现以下问题:

- **覆盖不完整**: 在变更文件较多的 PR 中,部分文件会被随意忽略。
- **位置偏移(Position Drift)**: 报告的问题所在的行号或文件引用与实际情况不符。
- **质量不稳定**: 提示词的细微变动会导致审查质量大幅波动。

OCR 在架构层面解决了这三个问题。

### 确定性工程层(Deterministic Engineering)

必须保证准确的步骤由工程逻辑而非 LLM 来保证。

| 功能 | 说明 |
|---|---|
| 精确文件选择 | 精确确定审查目标文件并过滤不必要的文件,防止重要变更被遗漏 |
| 智能文件打包 | 将相关文件合并为一个审查单元(例如 `message_en.properties` + `message_zh.properties`)。每个打包单元作为独立上下文的子代理运行 |
| 精细规则匹配 | 根据每个文件的特性匹配审查规则,去除信息噪声,提升模型专注度 |
| 位置校正模块 | 独立的评论定位与反思(reflection)模块,系统性地提升 AI 反馈的位置准确性和内容准确性 |

### LLM 代理层

负责需要动态判断和上下文检索的部分。

- 针对代码审查场景优化的提示词模板
- 基于大规模生产数据的工具调用轨迹分析构建的专业化工具集
- 实时代码库搜索、读取文件完整内容、与其他变更文件交叉引用

---

## 3. 安装

### NPM(推荐)

```bash
npm install -g @alibaba-group/open-code-review
```

安装后,`ocr` 命令即可全局使用。

### 直接下载二进制文件

```bash
# macOS (Apple Silicon / M1~M4)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-darwin-arm64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# macOS (Intel)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-darwin-amd64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# Linux (x86_64)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-linux-amd64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# Linux (ARM64)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-linux-arm64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr
```

### 源码构建

```bash
git clone https://github.com/alibaba/open-code-review.git
cd open-code-review
make build
sudo cp dist/opencodereview /usr/local/bin/ocr
```

---

## 4. LLM 配置 —— 云端 API

OCR 同时支持 OpenAI 兼容端点和 Anthropic 原生 API。配置文件保存在 `~/.opencodereview/config.json`。环境变量的优先级高于配置文件。

### Anthropic(Claude)

```bash
ocr config set llm.url https://api.anthropic.com/v1/messages
ocr config set llm.auth_token sk-ant-xxxxxxx
ocr config set llm.model claude-opus-4-6
ocr config set llm.use_anthropic true
```

如果是 Claude Code 用户,会自动从 `~/.zshrc` 或 `~/.bashrc` 中识别 `ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_MODEL` 环境变量,无需额外配置。

推荐模型:

| 模型 | 用途 |
|---|---|
| `claude-opus-4-6` | 最高质量审查,复杂架构分析 |
| `claude-sonnet-4-6` | 成本与性能平衡,日常 PR 审查 |

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
| `gpt-4o` | 代码审查的基础推荐 |
| `o3` | 复杂安全漏洞分析 |
| `gpt-4.1-mini` | 需要降低成本的环境 |

### DeepSeek 云端 API

由于 DeepSeek 提供 OpenAI 兼容 API,应将 `use_anthropic` 设为 false。

```bash
ocr config set llm.url https://api.deepseek.com/v1/chat/completions
ocr config set llm.auth_token sk-xxxxxxx
ocr config set llm.model deepseek-coder
ocr config set llm.use_anthropic false
```

推荐模型:

| 模型 | 特点 |
|---|---|
| `deepseek-coder` | 代码专用,成本效益优秀 |
| `deepseek-reasoner` | 复杂逻辑分析与推理能力强 |

### 阿里巴巴 DashScope(Qwen Cloud)

```bash
ocr config set llm.url https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
ocr config set llm.auth_token sk-xxxxxxx
ocr config set llm.model qwen-coder-turbo
ocr config set llm.use_anthropic false
```

---

## 5. LLM 配置 —— 本地模型(DeepSeek / Qwen / Ollama)

使用本地 LLM 可确保代码不会发送到外部 API,从而保证完全的数据隐私。OCR 支持任何在本地暴露 OpenAI 兼容端点的运行时(Ollama、LM Studio、vLLM 等)。

### 5-1. 基于 Ollama 的配置(通用)

Ollama 是运行本地 LLM 最简单的方式。安装后会自动在 `http://localhost:11434` 暴露 OpenAI 兼容端点。

```bash
# 安装 Ollama (macOS)
brew install ollama

# 安装 Ollama (Linux)
curl -fsSL https://ollama.com/install.sh | sh

# 后台启动服务器
ollama serve &
```

将 OCR 连接到 Ollama:

```bash
ocr config set llm.url http://localhost:11434/v1/chat/completions
ocr config set llm.auth_token ollama
ocr config set llm.model qwen2.5-coder:32b
ocr config set llm.use_anthropic false
```

> `auth_token` 的值可以是任意字符串,Ollama 在本地不会验证 token。

### 5-2. 本地运行 DeepSeek

#### 通过 Ollama 运行 DeepSeek

```bash
# DeepSeek-R1(推理特化,适合代码审查)
ollama pull deepseek-r1:14b    # 约需 9GB 显存
ollama pull deepseek-r1:32b    # 约需 20GB 显存
ollama pull deepseek-r1:70b    # 约需 48GB 以上显存

# DeepSeek Coder V2(代码专用)
ollama pull deepseek-coder-v2:16b    # 约需 10GB 显存
ollama pull deepseek-coder-v2:236b   # 约需 130GB 显存,最高质量

# 扩展上下文窗口(agentic 工作流必需)
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

# DeepSeek-R1 14B(需要约 30GB 显存)
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

#### 通过 LM Studio 运行 DeepSeek(GUI 环境)

1. 从 [lmstudio.ai](https://lmstudio.ai) 安装 LM Studio
2. 在 "Discover" 标签中搜索 `deepseek-r1` 并下载所需大小的版本
3. 在 "Local Server" 标签中启动服务器(默认端口: 1234)

OCR 配置:

```bash
ocr config set llm.url http://localhost:1234/v1/chat/completions
ocr config set llm.auth_token lm-studio
ocr config set llm.model deepseek-r1-distill-qwen-14b
ocr config set llm.use_anthropic false
```

### 5-3. 本地运行 Qwen(Qwen2.5-Coder / Qwen3)

Qwen 系列在代码生成和审查方面展现出同级别中最强的开源性能。特别是 Qwen2.5-Coder 32B 在 HumanEval 上达到 92.1%,超过了 Claude Sonnet 4.6(89.4%)。

```bash
# Qwen2.5-Coder(代码专用 —— 代码审查首选)
ollama pull qwen2.5-coder:7b     # 约需 5GB 显存,响应快速
ollama pull qwen2.5-coder:14b    # 约需 9GB 显存,均衡
ollama pull qwen2.5-coder:32b    # 约需 20GB 显存,最高质量

# Qwen3(2026 年 2 月发布的最新通用模型)
ollama pull qwen3:8b
ollama pull qwen3:32b

# 扩展上下文窗口(以支持 256K 的模型为准)
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

### 5-4. 本地 LLM 硬件要求

| 模型 | 显存 | 速度(token/秒) | 推荐用途 |
|---|---|---|---|
| DeepSeek-R1 14B | 9GB | 25-40 | 个人开发者笔记本电脑,推理能力强 |
| Qwen2.5-Coder 7B | 5GB | 40-60 | 轻量环境,快速 PR 审查 |
| Qwen2.5-Coder 14B | 9GB | 25-35 | 均衡推荐 |
| Qwen2.5-Coder 32B | 20GB | 15-25 | 高质量代码审查,企业级 |
| DeepSeek-R1 32B | 20GB | 10-18 | 复杂安全分析 |
| DeepSeek Coder V2 236B | 130GB 以上 | 8-12 | 最高质量,仅限 GPU 服务器 |

> 使用 Q4 量化可将显存占用降低约 60%,质量损失约为 2%。Ollama 在拉取模型时会自动应用量化。

### 5-5. 连接测试

```bash
# 验证 LLM 连接(云端与本地通用)
ocr llm test
```

---

## 6. 基本用法与命令参考

### 主要审查命令

```bash
# 审查当前的所有变更(staged + unstaged + untracked)
ocr review

# 分支间对比审查
ocr review --from main --to feature-auth

# 审查特定提交
ocr review --commit abc123

# 不调用 LLM,仅预览待审查文件
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
| `ocr rules check <file>` | — | 预览适用于该文件的规则 |
| `ocr config set <key> <value>` | — | 更改配置值 |
| `ocr llm test` | — | 测试 LLM 连接 |
| `ocr viewer` | `ocr v` | 启动基于浏览器的会话查看器(`localhost:5483`) |
| `ocr version` | — | 输出版本信息 |

### `ocr review` 的主要参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| `--repo` | 当前目录 | Git 仓库根路径 |
| `--from` | — | 对比基准 ref(例如 `main`) |
| `--to` | — | 对比目标 ref(例如 `feature-branch`) |
| `--commit`, `-c` | — | 审查单个提交 |
| `--preview`, `-p` | `false` | 不调用 LLM,仅确认待审查文件 |
| `--format`, `-f` | `text` | 输出格式: `text` 或 `json` |
| `--concurrency` | `8` | 文件并发审查的最大数量 |
| `--timeout` | `10` | 并发任务超时时间(分钟) |
| `--audience` | `human` | `human`(显示进度)/ `agent`(仅输出摘要) |
| `--rule` | — | 自定义审查规则 JSON 文件路径 |
| `--max-tools` | 内置默认值 | 每个文件的最大工具调用次数 |
| `--tools` | — | 自定义工具配置 JSON 文件路径 |

---

## 7. 自定义审查规则

OCR 采用四级优先级体系应用规则。在每一级中,文件路径首次匹配到某个模式时即应用该规则,若未匹配则进入下一级。

| 优先级 | 来源 | 路径 | 说明 |
|---|---|---|---|
| 1(最高) | `--rule` 参数 | 用户指定路径 | CLI 显式覆盖 |
| 2 | 项目配置 | `<repoDir>/.opencodereview/rule.json` | 项目专属规则,可提交到 git |
| 3 | 全局配置 | `~/.opencodereview/rule.json` | 个人全局设置 |
| 4(最低) | 系统默认 | 内置 `system_rules.json` | NPE、XSS、SQL Injection 等通用规则 |

### 规则文件格式

```json
{
  "rules": [
    {
      "path": "src/main/java/**/*.java",
      "rule": "所有新方法的必填参数必须校验 null 值"
    },
    {
      "path": "**/*mapper*.xml",
      "rule": "检查 SQL Injection 风险、参数错误以及闭合标签缺失"
    },
    {
      "path": "src/**/*.{ts,tsx}",
      "rule": "检查异步函数的错误处理与 Promise 链是否遗漏"
    }
  ]
}
```

- `path` 支持 `**` 递归匹配以及 `{java,kt}` 大括号展开。
- 每一层内按声明顺序进行评估,首个匹配项生效。
- 若规则文件不存在,则会静默跳过。

预先确认特定文件适用的规则:

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

`--format json` + `--audience agent` 组合会返回可在 CI 脚本中解析的结构化输出。该工具也已作为 Action 发布到 GitHub Marketplace。

---

## 9. AI 代理集成(Claude Code / Codex)

将 OCR 集成为 AI 编码代理的斜杠命令后,可以在代理的工作流中直接执行代码审查。

### 方法一: 作为技能(Skill)安装

```bash
npx skills add alibaba/open-code-review --skill open-code-review
```

编码代理会学习如何调用 `ocr`、如何对问题进行优先级分类,以及自动修复选项。

### 方法二: 作为 Claude Code 插件安装

在 Claude Code 中执行以下命令:

```
/plugin marketplace add alibaba/open-code-review
/plugin install open-code-review@open-code-review
```

安装后,可通过 `/open-code-review:review` 斜杠命令运行 OCR,并处理问题的自动过滤及修复。

### 方法三: 直接复制命令文件

无需包管理器即可快速配置的方法。

```bash
# 项目级(团队共享,可提交到 git)
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

安装后,在 Codex 中可以这样使用:

```
@Open Code Review review my current changes
@Open Code Review review this branch against main
@Open Code Review review and fix high-confidence issues
```

> 所有集成方式的前提条件: 必须安装 `ocr` CLI 并完成 LLM 配置。OCR 内部的 LLM 后端与代理集成方式无关,独立运行。

---

## 10. 完整配置参考

配置文件路径: `~/.opencodereview/config.json`

### 配置项列表

| 键 | 类型 | 示例 | 说明 |
|---|---|---|---|
| `llm.url` | string | `https://api.openai.com/v1/chat/completions` | LLM API 端点 |
| `llm.auth_token` | string | `sk-xxxxxxx` | API 密钥 / 认证令牌 |
| `llm.model` | string | `claude-opus-4-6` | 模型名称 |
| `llm.use_anthropic` | boolean | `true` / `false` | 是否使用 Anthropic 原生 API |
| `language` | string | `English` / `Chinese` | 审查输出语言(默认: 中文) |
| `telemetry.enabled` | boolean | `true` / `false` | 是否启用遥测 |
| `telemetry.exporter` | string | `console` / `otlp` | 遥测数据导出方式 |
| `telemetry.otlp_endpoint` | string | `localhost:4317` | OTLP 收集器地址 |
| `telemetry.content_logging` | boolean | — | 遥测数据中是否包含 LLM 提示词 |

### 环境变量列表

环境变量的优先级高于配置文件。

| 环境变量 | 说明 |
|---|---|
| `OCR_LLM_URL` | LLM API 端点 URL |
| `OCR_LLM_TOKEN` | API 密钥 / 认证令牌 |
| `OCR_LLM_MODEL` | 模型名称 |
| `OCR_USE_ANTHROPIC` | `true` = Anthropic,`false` = OpenAI 兼容 |

同时也会自动识别 Claude Code 的环境变量(`ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_MODEL`)。

### 更改审查输出语言

默认输出语言为中文。若要更改为韩语或英语:

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

启用 `telemetry.content_logging` 后,导出数据中会包含 LLM 的提示词与响应内容。默认为关闭状态。

---

## 11. 优缺点分析

### 优点

**大规模实战验证(Battle-tested)**

超过 2 万名阿里巴巴内部开发者使用了两年,累计检测出超过 100 万个缺陷。由于是 CLI 工具而非 SaaS,代码和数据不会流向外部,满足企业级安全要求。结合本地 LLM,还可以构建完全气隙(air-gap)环境。

**经济性与混合式设计**

相比纯 LLM 代理,可将 token 使用量降低 80%。它在确定性工程层面结构性地解决了通用 AI 代码审查的三大顽疾(覆盖不完整、位置偏移、质量不稳定)。

**灵活的模型支持**

支持 OpenAI、Anthropic、DeepSeek、DashScope(Qwen)、Ollama 等所有暴露 OpenAI 兼容端点的运行时,可以自由切换云端与本地 LLM。

**CI/CD 与代理生态集成**

官方提供了 GitHub Actions、GitLab CI 的示例,并通过插件/技能/命令方式与 Claude Code、Codex 等主流 AI 编码代理集成。

### 缺点及注意事项

**LLM API 费用**

工具本身基于 Apache 2.0 免费,但后端 LLM 的 API 费用需用户自行承担。使用本地 LLM 可消除此费用,但会带来硬件方面的要求。

**初期环境配置**

现有 Claude Code 用户由于自动识别环境变量,无需额外配置。但新用户需要经过设置 LLM API 密钥、端点、模型的过程。使用本地 LLM 时,还需要额外安装 Ollama 并下载模型(数 GB)。

**业务逻辑的局限性**

内置规则与自定义规则可以弥补相当一部分需求,但无法完全理解团队特有的业务逻辑或领域特定惯例。需要持续在规则文件中补充团队专属的指导原则。

**AI 的根本局限**

高层次的架构设计合理性以及与业务需求的完全契合度,难以用 AI 替代人的判断。OCR 是减轻审查者负担的辅助工具,而非完全的替代品。

---

## 12. 模型选择指南

| 场景 | 推荐模型 | 原因 |
|---|---|---|
| 最高质量审查,预算充足 | Claude Opus 4.6(云端) | 复杂上下文理解与架构分析能力强 |
| 日常 PR 审查,成本均衡 | Claude Sonnet 4.6 或 GPT-4o | 性能与成本的平衡 |
| 代码完全不能外泄 | Qwen2.5-Coder 32B(Ollama) | 本地运行,HumanEval 达 92.1% |
| 复杂安全漏洞分析 | DeepSeek-R1(本地或云端) | 推理特化架构 |
| 最小化成本(云端) | DeepSeek Coder API | 代码专用 + API 单价低 |
| 轻量本地环境(显存 8GB 以下) | Qwen2.5-Coder 7B | 响应快速,硬件要求低 |
| GPU 服务器最高质量 | DeepSeek Coder V2 236B | HumanEval 95.7%(开源最高水平) |

---

## 13. 适合的团队类型

**运营大规模代码库的组织**

即使在同时变更大量文件的 PR 中,智能打包与文件选择逻辑也能无遗漏地覆盖全部内容。相比通用代理,遗漏率在结构上更低。

**重视安全漏洞应对的团队**

在审查早期阶段拦截 NPE、SQL Injection、XSS、线程安全等高风险缺陷。结合本地 LLM,可以构建代码完全不外泄的私有环境。

**对 AI 采用成本敏感的团队**

80% 的 token 节省意味着同样的预算可以覆盖 5 倍的审查规模。使用 DeepSeek 云端 API 或本地 Qwen 模型可以进一步降低成本。

**希望将 AI 与现有审查流程相结合的团队**

在 OCR 对 NPE、安全漏洞、编码规范违规进行初步筛选后,人工审查者可以专注于架构设计与业务逻辑审查。

---

## 参考资料

- [GitHub 仓库](https://github.com/alibaba/open-code-review)
- [官方文档网站](https://alibaba.github.io/open-code-review/)
- [GitHub Marketplace(Actions)](https://github.com/marketplace?q=open-code-review)
- [Digital Today —— token 用量降低 80% 相关报道](https://digitaltoday.co.kr)(2026.6.8)
- [Gigazine —— 内部性能基准测试结果报道](https://gigazine.net)(2026.6.7)
