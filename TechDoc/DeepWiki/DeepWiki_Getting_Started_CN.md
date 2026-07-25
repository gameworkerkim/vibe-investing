---
title: "DeepWiki 入门指南 (Getting Started)"
description: "只需把 GitHub 仓库地址中的域名替换一下，AI 就会自动生成代码库文档的工具——DeepWiki 入门指南"
lang: zh
featured: false
schema_type: TechArticle
---

# DeepWiki 入门指南 (Getting Started)

> 只需把 GitHub 仓库地址中的域名替换一下，AI 就会自动生成代码库文档的工具——DeepWiki 入门指南

---

## 1. 什么是 DeepWiki?

**DeepWiki** 是由以 AI 软件工程师「Devin」闻名的 **Cognition Labs** 开发的**基于 AI 的代码文档化工具**。只需输入 GitHub 公开仓库的 URL，AI 就会分析该代码库的结构和逻辑，自动生成**Wiki 形式的结构化文档**。

简单来说，这是一项"输入 GitHub 仓库，AI 自动生成说明文档"的服务。

### 主要功能
- 提供**仓库结构与架构概览**
- 自动识别**技术栈与关键组件**
- 自动生成可视化**模块依赖关系与数据流**的图表(Mermaid 图)
- 支持**自然语言问答**,可就代码库提出问题并获得解答(如"认证功能在哪里实现?")
- 生成约**8 个板块**的 Markdown 页面(Overview / Structure / Architecture / API / Subsystems / Operations / Testing / Glossary)

---

## 2. 60 秒快速上手 (Quick Start)

### 方法①:只需修改 URL 中的一个词(最简单)

只需将现有 GitHub 地址中的 `github.com` 替换为 `deepwiki.com` 即可。**无需注册,免费**使用。

```
# 原始地址 (GitHub)
https://github.com/gameworkerkim/vibe-investing

# 查看 DeepWiki 文档
https://deepwiki.com/gameworkerkim/vibe-investing
```

### 方法②:访问 deepwiki.com 后搜索

1. 访问 https://deepwiki.com
2. 在搜索框中输入 `用户名/仓库名`(例如:`facebook/react`)
3. 浏览生成的 Wiki 页面

### 方法③:用自然语言提问

在生成的 Wiki 页面的**Ask 功能**中用自然语言提问，即可获得基于代码库上下文的回答。

```
Q: 该项目的认证(登录)功能在哪里处理?
Q: 数据库连接配置在哪个文件中?
Q: 该仓库的入口点(entry point)是什么?
```

---

## 3. 这些场景下非常好用

| 场景 | 应用方式 |
|---|---|
| 新员工入职培训 | 无需阅读数百个文件即可一览整体结构 |
| 准备参与开源贡献 | 快速理解要贡献的部分及相关模块、数据流 |
| 技术面试准备 | 学习知名项目(React、TensorFlow、LangChain 等)的架构 |
| 调研陌生的库 | 即使文档不完善，也能基于代码获得说明 |

---

## 4. 优点

- **几乎没有使用门槛** — 无需安装、插件、注册。只需更改 URL 即可立即使用。
- **快速掌握复杂代码库** — 一目了然地理解整体结构与核心逻辑。
- **支持交互式探索** — 通过自然语言提问，比静态文档更直观地学习。
- **支持多种语言与大规模仓库** — JavaScript、Python、Rust、Go、Java 等。知名项目已预先完成分析。
- **Deep Research 模式** — 提供代码异味检测、架构级改进建议等深度分析。

## 5. 缺点

- **仅公开仓库免费支持** — 私有仓库计划作为企业版单独提供。
- **AI 生成文档的局限性** — 并非官方文档，可能存在错误、遗漏及与实际实现的差异。
- **必须联网** — 基于云端的 SaaS 服务，不支持离线使用。
- **可能存在部分信息重复** — 可能与已经完善的官方文档重叠。
- **大型仓库可能受范围限制** — 可通过配置文件(`.devin/wiki.json`)指定生成范围。

## 6. 注意事项

- **AI 生成的信息必须验证** — 仅作为辅助工具，不能替代官方参考文档。生产环境变更前必须核实实际源代码与官方文档。
- **禁止上传敏感代码** — 由于是公开服务，不要将私有/敏感信息代码作为分析对象。
- **文档准确度取决于代码质量** — 注释和 README 不完善会导致生成文档的准确度下降。需要有利于 LLM 理解的良好索引结构。

---

## 7. 自托管版本 — `deepwiki-open`

DeepWiki 官方服务(SaaS)仅在云端运行,无法自定义。如果想要**自行搭建和运营**,可以使用社区开源版本 **`deepwiki-open`**。

> 仓库地址: https://github.com/AsyncFuncAI/deepwiki-open

### 为什么要使用自托管版?
- **文档化私有仓库** — 在本地/自建环境处理内部私有代码，无需暴露给外部 SaaS。
- **可自由选择 LLM** — 可连接 OpenAI、Google Gemini、OpenRouter、Azure，甚至**Ollama 本地模型**。
- **完全自由度** — 可自由定制提示词、生成范围、UI 等。

### 安装方式①:Docker(推荐，最简单)

```bash
# 1. 克隆仓库
git clone https://github.com/AsyncFuncAI/deepwiki-open.git
cd deepwiki-open

# 2. 创建环境变量文件(.env) —— 只需填写你要使用的 LLM 密钥
cat > .env <<'EOF'
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key
# (可选) OPENROUTER_API_KEY=...
# (可选) OLLAMA_HOST=http://host.docker.internal:11434
EOF

# 3. 运行
docker-compose up

# 4. 在浏览器中访问
#   http://localhost:3000
```

### 安装方式②:手动运行(前端 + 后端)

```bash
# 后端 (Python API 服务器)
pip install -r api/requirements.txt
python -m api.main          # 默认端口 8001

# 前端 (Next.js)
npm install
npm run dev                 # 默认端口 3000
```

### 使用流程
1. 访问 `http://localhost:3000`
2. 输入需要文档化的 GitHub/GitLab/Bitbucket 仓库 URL(私有仓库需输入访问令牌)
3. 选择要使用的 LLM 模型(如 Gemini、GPT、本地 Ollama)
4. 生成 Wiki → 使用 Mermaid 图与 Ask(问答)功能

### SaaS 版与自托管版对比总结

| 区分 | DeepWiki(官方 SaaS) | deepwiki-open(自托管) |
|---|---|---|
| 安装 | 无需安装(只需更改 URL) | 需要 Docker 或手动安装 |
| 私有仓库 | 不提供免费支持 | 支持(本地处理) |
| LLM 选择 | 不可选(固定使用自有 LLM) | 可选择 OpenAI/Gemini/Ollama 等 |
| 自定义 | 不可 | 完全自由 |
| 数据安全 | 传输至外部云端 | 可保持在自有环境内 |
| 上手难度 | 非常低 | 中等(需要环境配置) |

> **一句话总结**: 想快速浏览公开仓库,选择**官方 SaaS**;需要处理内部私有代码或本地 LLM 集成,选择**`deepwiki-open` 自托管版**。

---

## 8. 主要竞品项目

在 DeepWiki 率先定义的**「代码 Wiki AI」**这一品类中，此后出现了多个竞品项目。

| 项目 | 开发方 | 特点 |
|---|---|---|
| **DeepWiki** | Cognition Labs | 元老级服务。SaaS 模式，使用自有 LLM |
| **deepwiki-open** | 社区(开源) | DeepWiki 的完全开源版本。可自托管和自定义 |
| **Google CodeWiki** | Google | 2025 年 11 月发布。基于 Google Cloud + Google 的 LLM 驱动，针对 Google 搜索集成进行了优化 |
| **Alphadoc** | - | 与 DeepWiki 类似的 AI 文档化工具 |
| **其他** | - | ConnectWise PSA、IBM Cloud Pak for AIOps 等(更接近 DevOps/AIOps 领域) |

- **DeepWiki**: 作为 SaaS 最为便捷，但无法自定义
- **deepwiki-open**: 需要自行托管，但拥有完全的自由度
- **Google CodeWiki**: 与 Google 生态系统的联动是其优势

---

## 总结

DeepWiki 对于**「想要快速理解复杂开源代码的开发者」**而言是非常有用的工具。但请不要盲目相信 AI 生成的信息，务必结合实际代码进行验证后使用。

- 想快速浏览公开仓库 → **官方 DeepWiki(SaaS)**
- 需要私有代码、本地 LLM、自定义功能 → **`deepwiki-open`(自托管)**
- 希望与 Google 生态联动 → **Google CodeWiki**

## 参考链接
- 官方服务: https://deepwiki.com
- 自托管版(开源): https://github.com/AsyncFuncAI/deepwiki-open
- 开发方: Cognition Labs (https://cognition.ai)
