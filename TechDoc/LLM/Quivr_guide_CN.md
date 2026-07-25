---
title: "Quivr:由生成式 AI 驱动的开源第二大脑"
description: "GitHub 星标超过 38,000 的开源 RAG 平台 Quivr 完整指南——功能特性、技术栈、安装方法、自定义 RAG 工作流以及“Brain”概念详解。"
abstract: |
  Quivr 是一个开源的 RAG(检索增强生成，Retrieval-Augmented Generation)平台，是将个人或企业数据转化为
  智能 AI 助手的"第二大脑(Second Brain)"。用户只需上传文档并用自然语言提问，即可轻松检索和利用海量信息。
  本指南涵盖 Quivr 存在的意义、核心功能(预优化的 RAG 工作流、支持所有文件格式、多 LLM 支持、通过 YAML
  自定义 RAG、工具集成与网络搜索、Megaparse 集成、隐私保护与自托管、技术栈)、对开发者的优势、安装与使用方法
  (Python 包、Docker 自托管部署、自定义 RAG 配置、Chainlit 聊天界面、API 密钥使用)、"Brain"概念，
  以及参考资料。
summary_for_ai: |
  开源 RAG 平台 Quivr 的完整指南，GitHub 星标超过 38,000，拥有超过 5 万名用户和 6,000 多家企业客户，
  由 Y Combinator 支持，由三位相识 20 年的法国朋友共同创立。
  解决的问题:在企业环境中，约 20% 的工作时间被单纯用于查找信息(向休假中的同事紧急求助、重复回答相同的
  问题、不知道所需信息在哪里甚至是否存在)。Quivr 提供了一个连接企业所有工具、文档、API 和数据库的开源
  AI 平台，让用户可以与这些资源"对话"，并自动完成文档摘要、从数据库中提取可执行信息、根据上下文自动
  撰写邮件等任务。
  核心功能:预先设计优化的 RAG 工作流(opinionated RAG)，开发者无需从零搭建 RAG 流水线；支持所有文件
  格式(txt、PDF、Markdown、PPT、CSV/XLSX、Word、音频与视频)并可添加自定义解析器；支持多种 LLM
  (OpenAI、Anthropic Claude、Mistral、Google Gemma、Groq，以及通过 Ollama 运行的本地模型以保证完全的
  数据隐私)；可通过 YAML 配置文件精细调整 RAG 参数(重排序器模型与设置、对话历史深度、LLM 温度、最大
  输入 token 数、检索分块大小与数量)；超越静态文档知识，集成工具与网络搜索以实现动态信息收集和实时
  情报；集成 Megaparse 以高效解析大规模文档；支持隐私保护与自托管，可在无需外部 API 调用的情况下完全
  本地化运行。
  技术栈:前端为 Next.js + Vercel，后端 API 为 FastAPI，异步任务通过 Celery + 队列处理大文件的向量化与
  索引，向量存储采用 PGVector/FAISS，认证与数据库使用 Supabase。
  对开发者的优势:快速上手(执行 `pip install quivr-core`，仅需 5 行代码即可搭建完整的 RAG 系统)、
  提供带 Swagger 文档和 API 密钥认证的丰富 RESTful API、可扩展的架构(自定义文件解析器、可扩展的 RAG
  工作流节点、可替换的向量存储、通过 LangChain 集成支持多种嵌入模型)、活跃的开源社区，以及将 RAG
  复杂内部结构抽象化、可通过 YAML 配置在不改动代码的前提下实验不同 RAG 策略所带来的开发效率提升。
  安装与使用涵盖:通过 pip 快速上手 Python 包、完整的基础使用示例代码(Brain.from_files、brain.ask、
  交互式循环)、基于 Docker 的自托管部署(克隆仓库、配置 .env、执行 docker compose up，通过
  localhost:3000 访问 Web 界面、通过 localhost:5050/docs 查看 API 文档)、通过 YAML 配置自定义 RAG
  工作流(重排序器、历史深度、温度、最大 token 数)并通过 RetrievalConfig.from_yaml 加载、使用 Chainlit
  搭建聊天界面，以及通过 curl 示例演示 API 密钥的申请与使用方法。
  "Brain"概念:Quivr 用于存储和处理用户知识的核心抽象。一个 Brain 可以关联多个文档，每个 Brain 都可以
  拥有独立的 RAG 配置和 LLM，支持公开/私密设置，并可通过 Brain Marketplace 与他人共享或使用他人的 Brain。
  结论:Quivr 被设计为一个开发者友好的 AI 框架，而不仅仅是一个 RAG 工具，将简洁性与可扩展性置于首位，
  凭借开源带来的完全透明性、30 秒即可完成安装、支持本地化部署以保护数据隐私、兼容所有主流 LLM 而不产生
  厂商锁定，以及活跃的社区，被形容为"Obsidian 的理念，加上 AI 能力的强化版"。
date: 2026-04-10
author: "Dennis Kim"
lang: zh
tags:
  - Quivr
  - RAG
  - 开源
  - AI 助手
  - LLM
keywords:
  - Quivr 开源 RAG
  - 第二大脑 AI
  - Quivr 安装指南
  - quivr-core Python
  - 自托管 RAG 平台
  - Quivr Brain 概念
featured: false
schema_type: TechArticle
draft: false
---

# Quivr:由生成式 AI 驱动的开源第二大脑

## 1. 概述

Quivr 是一个开源的 RAG(检索增强生成，Retrieval-Augmented Generation)平台，是将个人或企业数据转化为智能 AI 助手的"第二大脑(Second Brain)"。用户只需上传文档并用自然语言提问，即可轻松检索和利用海量信息。

Quivr 以超过 38,000 个 GitHub 星标获得了全球开发者的关注，目前已有超过 5 万名用户和 6,000 多家企业在使用。该项目获得 Y Combinator 支持，由三位相识 20 年的法国朋友共同创立。

---

## 2. 为什么选择 Quivr?(痛点与解决方案)

在企业环境中，约 20% 的工作时间被单纯用于查找信息。员工反复遇到以下困扰:

- 必须向正在休假的同事紧急求助获取信息
- 重复回答相同问题所带来的低效
- 不知道所需信息存放在哪里，甚至不知道它是否存在

为解决这些问题，Quivr 提供了一个开源 AI 平台，将企业的所有工具、文档、API 和数据库连接起来，让用户可以与它们"对话"。Quivr 会自动完成以下工作:

- 对海量文档进行摘要，提炼核心内容
- 从数据库中提取可执行的信息
- 根据上下文自动撰写邮件

---

## 3. 核心功能

### 3.1 Opinionated RAG(预优化的 RAG 工作流)

Quivr 提供预先设计好的优化 RAG 工作流，使开发者无需从零开始搭建 RAG 流水线。该工作流以速度和效率为核心设计，可立即在生产环境中使用。

### 3.2 支持所有文件格式

支持多种文件格式，并可根据需要添加自定义解析器:

- 文本文件(.txt)
- PDF 文档
- Markdown(.md)
- 演示文稿(.ppt、.pptx)
- 电子表格(.csv、.xlsx)
- Word 文档
- 音频与视频文件

### 3.3 多 LLM 支持

Quivr 支持多种大语言模型(LLM)，以避免厂商锁定:

- OpenAI(GPT-4、GPT-3.5)
- Anthropic(Claude)
- Mistral
- Google(Gemma)
- Groq
- 本地模型(Ollama)——保证完全的数据隐私

### 3.4 可自定义的 RAG 工作流

可以通过 YAML 配置文件对以下要素进行精细调整:

- 重排序器(reranker)模型及相关设置
- 历史深度(对话上下文的纳入范围)
- LLM 的温度(temperature)及最大输入 token 数
- 检索分块(chunk)的大小及数量

### 3.5 工具集成与网络搜索

Quivr 不局限于静态文档知识，还可以连接网络搜索及外部工具/API，实现动态信息收集与实时情报能力。

### 3.6 Megaparse 集成

由同一团队 QuivrHQ 开发的 Megaparse，是一款用于高效解析大规模文档的工具，可以对数千个文件进行预处理，并直接接入 Quivr 的"Brain"。

### 3.7 隐私保护与自托管

针对数据隐私要求较高的企业和开发者，Quivr 支持本地部署与自托管。数据始终由用户自行掌控，即便不调用任何外部 API，也可以在完全本地化的环境中运行。

### 3.8 技术栈

| 层级 | 技术 | 特点 |
|------|------|------|
| 前端 | Next.js + Vercel | 基于 SSR，自动部署 |
| 后端 API | FastAPI | 基于 Python 的高性能 API 框架 |
| 异步任务 | Celery + 队列 | 处理大文件的向量化与索引 |
| 向量存储 | PGVector / FAISS | 高性能语义检索 |
| 认证/数据库 | Supabase | 开源的 Firebase 替代方案 |

---

## 4. 对开发者的优势

### 4.1 快速上手(30 秒即可完成)

```bash
pip install quivr-core
# 仅需 5 行代码即可完成 RAG 系统搭建
```

### 4.2 丰富的 API 支持

Quivr 提供 RESTful API，并配有 Swagger 文档，便于探索和测试。支持基于 API 密钥的认证方式，可轻松集成到各类应用中。

### 4.3 可扩展的架构

- 可添加自定义文件解析器
- 可扩展 RAG 工作流节点
- 可替换向量存储
- 支持多种嵌入模型(通过 LangChain 集成)

### 4.4 活跃的开源社区

- GitHub 星标超过 38k，贡献活跃
- 定期更新与功能改进
- issue 响应及 PR 审查十分活跃

### 4.5 提升开发效率

- 将 RAG 复杂的内部结构抽象化，使开发者可专注于业务逻辑
- 基于 YAML 的配置方式，可在不修改代码的情况下试验不同的 RAG 策略
- 提供多种示例代码(Chainlit、Streamlit 集成)

---

## 5. 安装与使用方法

### 5.1 安装 Python 包(快速上手)

想要最快上手，可以安装 quivr-core 包。

```bash
# 第一步:安装包
pip install quivr-core

# 验证安装
python -c "import quivr_core; print('Quivr installed!')"
```

### 5.2 基本使用示例

```python
from quivr_core import Brain

# 1. 使用文档创建 Brain
brain = Brain.from_files(
    name="my_smart_brain",
    file_paths=["./my_document.pdf", "./my_notes.txt"]
)

# 2. 向 Brain 提问
answer = brain.ask("请总结这份文档的核心内容")
print(answer.answer)

# 3. 运行交互式界面
while True:
    question = input("问题: ")
    if question.lower() == "exit":
        break
    response = brain.ask(question)
    print(f"回答: {response.answer}")
```

### 5.3 基于 Docker 的本地部署(自托管)

如果数据隐私很重要，或想使用全部功能:

```bash
# 第一步:克隆仓库
git clone https://github.com/quivrhq/quivr.git && cd quivr

# 第二步:配置环境
cp .env.example .env
# 在 .env 文件中填入 OPENAI_API_KEY

# 第三步:使用 Docker 运行
docker compose pull
docker compose up

# 第四步:访问
# Web 界面: http://localhost:3000
# API 文档: http://localhost:5050/docs
```

### 5.4 配置自定义 RAG 工作流

可以通过 YAML 文件自定义 RAG 策略:

```yaml
# custom_rag.yaml
workflow_config:
  name: "advanced_rag"
  max_history: 10
  reranker_config:
    supplier: "cohere"
    model: "rerank-multilingual-v3.0"
    top_n: 5
  llm_config:
    max_input_tokens: 4000
    temperature: 0.3
```

```python
from quivr_core import Brain
from quivr_core.config import RetrievalConfig

brain = Brain.from_files(
    name="custom_brain",
    file_paths=["./data/*.pdf"]
)

config = RetrievalConfig.from_yaml("./custom_rag.yaml")
answer = brain.ask("问题", retrieval_config=config)
```

### 5.5 使用 Chainlit 搭建聊天界面

```bash
cd examples/chatbot
rye sync
rye run chainlit run chainlit.py
```

### 5.6 申请与使用 API 密钥

```bash
# 1. 登录 Quivr 网页应用
# 2. 在 /user 页面生成 API 密钥
# 3. 调用 API 时使用 Bearer token

curl -X GET https://api.quivr.app/brains/ \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 6. 理解"Brain"概念

Quivr 的核心概念是"Brain"(大脑)。Brain 是存储和处理用户知识的基本组件。

- 一个 Brain 可以关联多个文档
- 每个 Brain 都可以拥有独立的 RAG 配置和 LLM
- 可设置为公开或私密(共享或不共享)
- 也可以通过 Brain Marketplace 使用其他用户的 Brain

---

## 7. 参考资料(References)

### 官方文档

- 官方主页: https://quivr.app
- Core 文档: https://core.quivr.com
- API Swagger 文档: https://api.quivr.app/docs

### GitHub 仓库

- QuivrHQ/quivr: https://github.com/quivrhq/quivr(星标 38k+)
- Megaparse(文档解析工具): https://github.com/quivrhq/megaparse

### 快速链接

- 快速上手: https://core.quivr.com/en/stable/
- Brain API 指南:可通过 POST /brains/ 端点创建 Brain
- 聊天 API:可通过 GET /chat/{chat_id}/history 查询对话历史

### 社区

- Product Hunt: https://www.producthunt.com/products/quivr
- Y Combinator Launch: https://www.ycombinator.com/launches/KPF-quivr

---

## 8. 结语

Quivr 的设计目标不仅仅是一个 RAG 工具，更是一个开发者友好的 AI 框架。它将简洁性(simplicity)与可扩展性(extensibility)置于首位，从个人开发者到大型 AI 团队，都能从中获得生产力的提升。

选择 Quivr 的理由:

- 开源带来的完全透明性和自由的定制能力
- 30 秒即可安装完成，5 行代码即可立即使用
- 数据隐私保护——支持本地化部署
- 无厂商锁定——兼容所有主流 LLM
- 活跃的社区与持续的更新

正如一种说法所描述的:"其理念与 Obsidian 相似，但被 AI 能力进一步强化"，Quivr 为知识管理提供了一种新的范式。现在就用 Quivr 构建属于你自己的"第二大脑"吧。
