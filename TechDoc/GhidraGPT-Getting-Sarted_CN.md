---
title: "GhidraGPT 入门指南"
description: "GhidraGPT将OpenAI、Anthropic、Ollama、Qwen等多种LLM接入Ghidra,加速反编译、重命名与漏洞分析。"
abstract: |
  GhidraGPT是一个将LLM集成到NSA开源逆向工程框架Ghidra中的插件,用于辅助反汇编与反编译工作。它支持广泛的服务提供商——OpenAI、Anthropic、Google Gemini、Cohere、Mistral、DeepSeek、Grok以及本地Ollama模型,并提供函数重写、代码解释和安全分析功能,同时对API密钥进行加密存储。其主要风险在于分析结果可能出现幻觉,以及二进制代码会被发送到外部API,因此对敏感材料建议使用本地模型。
summary_for_ai: |
  面向AI代理的参考说明:本指南要求Ghidra 10.0+、Java 11+及Maven,且Maven构建需要设置GHIDRA_INSTALL_DIR。云端LLM服务商需要联网并产生API费用,只有Ollama可以完全离线运行。LLM生成的代码、类型信息及漏洞分析结论在被信任之前必须始终经过人工验证。
lang: zh
featured: false
author: Dennis Kim
date: 2026-07-21
schema_type: TechArticle
---

# GhidraGPT 入门指南

**GhidraGPT**是一个将LLM集成到Ghidra(NSA开源逆向工程框架)中的插件。
Ghidra是由美国国家安全局(NSA)开发并以开源形式发布的强大软件逆向工程(reverse engineering)工具。
Ghidra由美国国家安全局开发,曾被多个美国情报机构用作逆向工程工具,大约在2017年3月7日的WikiLeaks "CIA Vault 7"泄密事件中,其存在才首次为世人所知。
此后,美国国家安全局于2019年3月5日在RSA大会上首次公开发布了可执行文件,一个月后即2019年4月又在GitHub上公开了源代码。

随着LLM的发展,GhidraGPT让LLM能够辅助完成本需要人工进行大量重复劳动的核心工作:分析已编译的机器码,将其转换为人类可读的汇编语言(反汇编),并还原为C语言级别的代码(反编译)。
简而言之,这是一个为Ghidra加装LLM的扩展服务,其扩展理念是让LLM代替完成反汇编等耗时的工作。

其主要特点和功能如下。

* 强大的反编译器:将机器码转换为类C语言形式,让代码流程和逻辑更容易理解。
* 支持多种平台:可在Windows、macOS、Linux上运行,并支持x86、ARM、MIPS等多种处理器架构。
* 协作功能:提供支持团队共享和分析项目的服务器功能。
* 可扩展性:支持Python和Java脚本,用户可以自行实现所需的分析自动化功能。
* 免费开源:是IDA Pro等昂贵商业逆向工具的有力替代品,被安全研究人员、恶意软件分析师和开发者广泛使用。

---

## 核心优势

1. **提升生产力**
   * 自动重命名函数名/变量名、类型推断、添加注释,使反编译结果更易于人类阅读
   * 在上下文菜单中右键点击一次即可执行AI分析(非常方便)
2. **支持多种LLM**
   * 支持OpenAI、Anthropic、Google Gemini、Cohere、Mistral、DeepSeek、Grok、Ollama等广泛的模型
   * 也可使用OpenAI兼容API
3. **安全性与易用性**
   * 自动加密API密钥并安全存储
   * 实时流式响应,最大限度减少等待时间
   * 可在专用控制台查看结果

---

## 缺点与注意事项

**缺点:**

* LLM的响应并非总是准确,可能导致错误的分析结果(会出现LLM幻觉和错误)
* 基本上需要网络连接和API费用(本地Ollama除外;DeepSeek v4 pro、Qwen通常已足够)
* 与Ghidra复杂的内部结构结合时可能出现意外冲突

**注意事项:**

* 如果分析的二进制文件包含敏感代码,必须确认发送到外部API的数据内容
* 不要盲目相信LLM生成的代码或类型信息,必须进行验证
* 需要Ghidra 10.0以上、Java 11以上及Maven环境,安装时必须严格按照`File → Install Extensions`路径操作

---

## 竞品对比

| 项目 | 差异化点 |
|---------|--------|
| **Ghidra Assist** | 对本地模型进行了更多优化,开源社区支持活跃 |
| **BinAI** | 商业产品,提供专为二进制分析设计的自有模型,准确性有优势 |
| **IAIK's Ghidra Plugin** | 基于学术研究,在特定分析算法上表现突出 |
| **IDA Pro + ChatGPT** | 面向IDA用户的脚本,生态更大但并非专为Ghidra设计 |

> **总结**:GhidraGPT是一款支持多种LLM的强大插件,但API依赖和分析结果可靠性的验证是必不可少的。在分析敏感代码时,建议使用本地模型(Ollama)。

---

# GhidraGPT入门:Ollama、ChatGPT、Claude、Qwen设置指南

本指南将逐步介绍如何安装GhidraGPT插件,并连接Ollama(本地)、ChatGPT、Claude、Qwen等多种LLM。

---

## 前置准备

在使用GhidraGPT之前,需要具备以下环境:

| 项目 | 要求 |
|------|----------|
| **Ghidra** | 10.0以上 |
| **Java** | Java 11+ |
| **Maven** | 构建系统 |
| **网络** | 使用基于API的模型时必须(Ollama除外) |

---

## 1. 安装GhidraGPT插件

### 1.1 克隆仓库并构建

```bash
git clone https://github.com/ZeroDaysBroker/GhidraGPT.git
cd GhidraGPT
GHIDRA_INSTALL_DIR=/path/to/ghidra mvn clean package
```

构建完成后,会生成`target/GhidraGPT-x.y.z.zip`文件。

### 1.2 在Ghidra中安装插件

1. 启动Ghidra
2. 进入`File → Install Extensions`
3. 点击`+`按钮,选择`target/GhidraGPT-x.y.z.zip`
4. 重启Ghidra
5. 在`File → Configure → Analysis → GhidraGPTPlugin`中启用插件

---

## 2. 为各LLM服务设置API密钥

安装插件后,进入Ghidra内的`GhidraGPT configuration panel`输入API密钥。所有API密钥都会自动加密并安全存储。

### OpenAI(ChatGPT)

1. 在[OpenAI Platform](https://platform.openai.com/api-keys)获取API密钥
2. 在GhidraGPT设置面板中选择**OpenAI**
3. 输入获取到的API密钥
4. 选择要使用的模型(例如`gpt-4`、`gpt-3.5-turbo`)

> **提示**:GhidraGPT默认支持OpenAI的GPT模型。

---

### Anthropic(Claude)

1. 在[Anthropic Console](https://console.anthropic.com/)获取API密钥
2. 在GhidraGPT设置面板中选择**Anthropic**
3. 输入API密钥
4. 选择要使用的Claude模型(例如`claude-3-opus`、`claude-3-sonnet`)

GhidraGPT正式支持Anthropic的Claude模型。

---

### Ollama(免费本地模型)

Ollama是一款可在本地运行LLM的工具,能让你**无需联网**即可使用GhidraGPT。

#### 2.1 安装Ollama

**macOS / Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:** 从[Ollama官方网站](https://ollama.com/)下载安装文件

#### 2.2 下载LLM模型

下载你需要的模型。示例:

```bash
# Meta的Llama 3.1(8B轻量模型)
ollama run llama3.1:8b

# Qwen(擅长代码分析)
ollama run qwen2.5-coder:7b

# Mistral
ollama run mistral
```

> **提示**:请选择与你的硬件规格匹配的模型。`llama3.1:8b`在8GB显存下可流畅运行。

#### 2.3 确认Ollama服务器

Ollama默认在`localhost:11434`上运行API服务器。

```bash
# 查看正在运行的模型
ollama list
```

#### 2.4 将Ollama连接到GhidraGPT

1. 在GhidraGPT设置面板中选择**Ollama**
2. **Server URL**:输入`http://localhost:11434`
3. **Model**:输入之前下载的模型名称(例如`llama3.1:8b`、`qwen2.5-coder:7b`)

> **提示**:Ollama通过GhidraGPT支持的"自带模型(Bring your own model)"方式运作。

---

### Qwen(OpenAI兼容API或Ollama)

Qwen可以通过两种方式使用:

#### 方式A:通过Ollama本地运行(免费)

```bash
ollama run qwen2.5-coder:7b
```

之后,按照与Ollama相同的设置方式在GhidraGPT中连接。

#### 方式B:DashScope API(云端)

1. 在[阿里云 DashScope](https://dashscope.aliyun.com/)获取API密钥
2. 在GhidraGPT设置面板中选择**OpenAI Compatible**
3. **Base URL**:输入`https://dashscope.aliyuncs.com/compatible-mode/v1`
4. **API Key**:输入DashScope API密钥
5. **Model**:输入`qwen-max`、`qwen-plus`等

> 由于GhidraGPT支持OpenAI兼容API,你可以通过Qwen的OpenAI兼容端点进行连接。

---

## 3. 主要功能使用方法

安装和设置完成后,即可使用以下功能:

| 功能 | 说明 | 使用方法 |
|------|------|-----------|
| **Function Rewrite** | 重命名函数名/变量名、类型推断、添加注释 | 在反编译窗口中右键点击函数 → Rewrite |
| **Code Explanation** | 详细解释函数逻辑 | 右键点击 → Explain |
| **Code Analysis** | 检测漏洞并进行安全分析 | 右键点击 → Analyze |
| **Console** | 查看模型响应与结果 | 在GhidraGPT控制台窗口中查看 |

---

## 4. 各服务对比与推荐

| 服务 | 优点 | 缺点 | 推荐场景 |
|--------|------|------|-----------|
| **Ollama** | 免费、离线、保障隐私 | 需要本地硬件性能,响应速度较慢 | 安全性至关重要的分析、无网络环境 |
| **ChatGPT (OpenAI)** | 性能出色,响应迅速 | 收费,必须联网 | 一般性逆向工作 |
| **Claude** | 上下文长,代码理解能力出色 | 收费,必须联网 | 分析复杂的大型函数 |
| **Qwen (Ollama)** | 免费、代码特化、支持韩语 | 需要本地硬件性能 | 需要韩语注释/解释时 |
| **Qwen (API)** | 云端性能、支持韩语 | 收费,必须联网 | 需要韩语+云端性能时 |

---

## 注意事项

1. **数据隐私**:分析敏感二进制文件时,务必使用**Ollama**等本地模型。云端API会将被分析的代码发送到外部。
2. **验证结果**:LLM生成的代码或类型信息**必须始终手动验证**。AI有时会生成错误的分析结果。
3. **API费用**:OpenAI、Anthropic、DashScope(Qwen)会根据使用量产生费用。

---

## 参考资料

- [GhidraGPT GitHub仓库](https://github.com/ZeroDaysBroker/GhidraGPT)
- [Ollama官方网站](https://ollama.com/)
- [Ollama支持的模型列表](https://ollama.ai/library)
- [Hugging Face GGUF模型](https://huggingface.co/docs/hub/en/ollama) - 可通过Ollama运行

---

现在,一起开始用GhidraGPT进行AI驱动的逆向工程吧。
