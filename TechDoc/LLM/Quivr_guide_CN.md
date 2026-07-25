---
title: "Quivr：由生成式 AI 驱动的开源 Second Brain"
description: "将个人或企业数据转化为智能 AI 助手的开源 RAG 平台 Quivr 介绍"
lang: zh
featured: false
schema_type: TechArticle
keywords:
  - Quivr
  - RAG
  - second brain
  - 开源 AI
  - retrieval augmented generation
tags:
  - RAG
  - 开源
  - AI 助手
  - LLM
---

# Quivr：由生成式 AI 驱动的开源 Second Brain

## 1. 概述

Quivr 是一个开源的 RAG(Retrieval-Augmented Generation,检索增强生成)平台,是能将个人或企业数据转化为智能 AI 助手的"第二大脑(Second Brain)"。用户只需上传文档并用自然语言提问,即可轻松检索和利用海量信息。

Quivr 拥有超过 38,000 个 GitHub star,受到全球开发者的关注,目前已有 50,000 多名用户和 6,000 多家企业在使用 Quivr。该项目获得了 Y Combinator 的支持,由三位相识 20 年的法国朋友共同创立。

---

## 2. 为什么选择 Quivr?(痛点与解决方案)

在企业环境中,员工约 20% 的工作时间都花在单纯查找信息上。员工反复遇到如下困扰:

- 需要向休假中的同事询问紧急信息
- 反复问答同一信息造成的低效
- 不知道所需信息在哪里,甚至不知道它是否存在

Quivr 为解决这些问题,提供了一个可以连接企业所有工具、文档、API 和数据库,并与之对话的开源 AI 平台。Quivr 可以自动化以下工作:

- 总结冗长的文档,提取核心内容
- 从数据库中提取可执行的信息
- 自动撰写符合上下文的邮件

---

## 3. 核心特性

### 3.1 Opinionated RAG(经过优化的 RAG 工作流)

Quivr 提供预先设计好、经过优化的 RAG 工作流,使开发者无需从零搭建 RAG 流水线。该设计以速度和效率为核心,可立即投入生产环境使用。

### 3.2 支持所有文件格式

支持多种文件格式,并可根据需要添加自定义解析器:

- 文本文件(.txt)
- PDF 文档
- Markdown(.md)
- 演示文稿(.ppt、.pptx)
- 电子表格(.csv、.xlsx)
- Word 文档
- 音频及视频文件

### 3.3 多 LLM 支持

Quivr 支持多种 LLM(大语言模型),避免被单一供应商锁定:

- OpenAI(GPT-4、GPT-3.5)
- Anthropic(Claude)
- Mistral
- Google(Gemma)
- Groq
- 本地模型(Ollama)—— 保证完全的数据隐私

### 3.4 可自定义的 RAG 工作流

通过 YAML 配置文件,可以精细调整以下要素:

- 重排序器(reranker)模型及设置
- 历史深度(对话上下文的保留范围)
- LLM 温度(temperature)及最大输入 token 数
- 检索分块(chunk)的大小与数量

### 3.5 工具集成与互联网搜索

Quivr 不仅限于静态文档知识,还能连接互联网搜索及外部工具/API,实现动态信息收集和实时智能。

### 3.6 Megaparse 集成

由同一团队 QuivrHQ 开发的 Megaparse 是一款高效解析大规模文档的工具,可对数千个文件进行预处理后直接连接到 Quivr 的"Brain"。

### 3.7 隐私与自托管

对于重视数据隐私的企业和开发者,Quivr 支持本地部署和自托管。数据始终由用户自行掌控,无需调用外部 API 即可在完全的本地(on-premises)环境中运行。

### 3.8 技术栈

| 层级 | 技术 | 特点 |
|------|------|------|
| 前端 | Next.js + Vercel | 基于 SSR,自动部署 |
| 后端 API | FastAPI | 基于 Python 的高性能 API 框架 |
| 异步任务 | Celery + Queue | 处理大文件的嵌入与索引 |
| 向量存储 | PGVector / FAISS | 高性能语义搜索 |
| 认证/数据库 | Supabase | 开源的 Firebase 替代方案 |

---

## 4. 对开发者的优势

### 4.1 快速上手(30 秒即可完成)

```bash
pip install quivr-core
# 仅需 5 行代码即可搭建完整的 RAG 系统
```

### 4.2 丰富的 API 支持

Quivr 提供 RESTful API,可通过 Swagger 文档轻松浏览与测试。支持基于 API 密钥的身份验证,便于集成到应用程序中。

### 4.3 可扩展的架构

- 可添加自定义文件解析器
- 可扩展 RAG 工作流节点
- 可替换向量存储
- 支持多种嵌入模型(集成 LangChain)

### 4.4 活跃的开源社区

- GitHub 上拥有 38k+ star,贡献活跃
- 定期更新与功能改进
- 问题响应及 PR 审查活跃

### 4.5 提升开发效率

- 将 RAG 复杂的内部结构抽象化,专注于业务逻辑
- 基于 YAML 的配置可在不修改代码的情况下实验不同的 RAG 策略
- 提供多种示例代码(集成 Chainlit、Streamlit)

---

## 5. 安装与使用方法

### 5.1 安装 Python 包(Quick Start)

若想最快上手,可安装 quivr-core 包。

```bash
# 步骤 1: 安装包
pip install quivr-core

# 验证安装
python -c "import quivr_core; print('Quivr installed!')"
```

### 5.2 基础使用示例

```python
from quivr_core import Brain

# 1. 用文档创建 Brain
brain = Brain.from_files(
    name="my_smart_brain",
    file_paths=["./my_document.pdf", "./my_notes.txt"]
)

# 2. 向 Brain 提问
answer = brain.ask("总结这份文档的核心内容")
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

若数据隐私很重要,或希望使用完整功能:

```bash
# 步骤 1: 克隆仓库
git clone https://github.com/quivrhq/quivr.git && cd quivr

# 步骤 2: 配置环境
cp .env.example .env
# 在 .env 文件中填入 OPENAI_API_KEY

# 步骤 3: 使用 Docker 运行
docker compose pull
docker compose up

# 步骤 4: 访问
# Web UI: http://localhost:3000
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
answer = brain.ask("你的问题", retrieval_config=config)
```

### 5.5 使用 Chainlit 构建聊天 UI

```bash
cd examples/chatbot
rye sync
rye run chainlit run chainlit.py
```

### 5.6 获取并使用 API 密钥

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

- 一个 Brain 可以连接多个文档
- 每个 Brain 可以拥有独立的 RAG 配置和 LLM
- 可设置为 Public/Private(公开或私有)
- 也可以通过 Brain Marketplace 使用其他用户的 Brain

---

## 7. 参考资料

### 官方文档

- 官方主页: https://quivr.app
- Core 文档: https://core.quivr.com
- API Swagger 文档: https://api.quivr.app/docs

### GitHub 仓库

- QuivrHQ/quivr: https://github.com/quivrhq/quivr(38k+ star)
- Megaparse(文档解析工具): https://github.com/quivrhq/megaparse

### 快速链接

- Quick Start: https://core.quivr.com/en/stable/
- Brain API 指南: 可通过 POST /brains/ 端点创建 Brain
- 聊天 API: 可通过 GET /chat/{chat_id}/history 查询对话记录

### 社区

- Product Hunt: https://www.producthunt.com/products/quivr
- Y Combinator Launch: https://www.ycombinator.com/launches/KPF-quivr

---

## 8. 结语

Quivr 的设计目标不仅是一个简单的 RAG 工具,更是一个对开发者友好的 AI 框架。它将简洁性(simplicity)与可扩展性(extensibility)置于首位,为从个人开发者到大型 AI 团队的各类用户提升生产力。

选择 Quivr 的理由:

- 开源带来完全的透明性与自由的自定义能力
- 30 秒即可安装,仅需 5 行代码即可使用
- 数据隐私 —— 支持本地(on-premises)部署
- 无供应商锁定 —— 兼容所有主流 LLM
- 活跃的社区与持续的更新

正如一种说法所言,"这个想法类似 Obsidian,但被 AI 功能进一步强化了"——Quivr 呈现了知识管理的新范式。现在就用 Quivr 构建属于你自己的"第二大脑"吧。
