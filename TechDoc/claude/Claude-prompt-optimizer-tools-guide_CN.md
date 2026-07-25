---
title: "Claude 提示词优化工具入门指南"
description: "五款提升 Claude 输出质量的开源提示词优化工具介绍。由于 Fable 的使用受限，我们必须拼命优化 Opus 4.8。"
lang: zh
featured: false
schema_type: TechArticle
keywords:
  - Claude 提示词优化
  - Claude Code 钩子
  - Claude Code 技能
  - Opus 4.8
  - 提示词工程
tags:
  - Claude
  - 提示词工程
  - Claude Code
  - Anthropic
---

# Claude 提示词优化工具入门指南

> 五款提升 Claude 输出质量的开源提示词优化工具介绍。由于我们的 Fable 使用受限，只能拼命优化 Opus 4.8。
> 本文整理了各项目的运行机制、使用示例、优缺点及安装指南，善用这些优化技能和钩子可以提升效率。

---

## 0. 一览对比

| 项目 | 类型 | 运行环境 | 核心机制 | 规模(★) | 推荐用户 |
|---|---|---|---|---|---|
| **CheswickDEV/claude-opus-4.8-prompt-optimizer** | 元优化器(system prompt) | 所有 Claude 界面 (claude.ai / API / Code) | `prompt:` 触发 → 11条规则 + 10组件 XML 结构化 | 新项目 | 希望反复生成一致高质量提示词的用户 |
| **johnpsasser/claude-code-prompt-optimizer** | 钩子(Hook) | Claude Code | 拦截 `<optimize>` 标签 → 通过 extended thinking 扩展 | 小规模 | 需要在 Claude Code 中即时扩展特定提示词的开发者 |
| **severity1/claude-code-prompt-improver** | 钩子 + 技能(插件) | Claude Code | 仅筛选模糊提示词 → 注入调研与提问 | ~1.4k | 想减少修正往返的 Claude Code 重度用户 |
| **Hashaam101/prompt-optimizer** | 技能(Skill) | Claude Code | auto(自动精炼) / manual(`/optimize` 文本输出)双模式 | 小规模 | 想在自动与手动之间切换使用的用户 |
| **nidhinjs/prompt-master** | 技能(Skill) | 多工具(Claude、ChatGPT、Midjourney 等) | 按目标工具生成提示词、保留记忆 | 小规模 | 需要在多个 AI 工具间切换使用的用户 |

**术语说明**

- **钩子(Hook)**：Claude Code 在提示词提交等特定时刻自动执行的脚本，可拦截并改写用户输入。
- **技能(Skill)**：放置在 `~/.claude/skills/` 中的指令文件。条件匹配时 Claude 会自行加载并反映在行为中。
- **元优化器(Meta optimizer)**：工具本身作为 system prompt 运行，将输入提示词视为"待优化对象"而非"待执行对象"，返回一个结构化的新提示词。

---

## 1. CheswickDEV/claude-opus-4.8-prompt-optimizer

一个将原始提示词转换为针对 Opus 4.8 架构、生产可用的 XML 结构化提示词的元提示系统。它具备 11 条优化规则、10 组件框架、基于复杂度的路由，以及强制的 `prompt:` 触发器，全部源自 Anthropic 官方文档。其核心差异化在于它不是一个提示词合集,而是一个"优化引擎"。(MIT 许可证)

### 运行方式(5 个步骤)

1. **提示词分析** —— 检测意图、复杂度、领域、期望输出以及缺失要素
2. **复杂度路由** —— simple 分配 3-4 个组件,moderate 分配 5-7 个,complex 使用完整的 10 组件
3. **规则应用** —— 仅触发 11 条规则中相关的子集
4. **质量检查** —— 核查任务清晰度、XML 标签有效性、示例一致性以及是否存在矛盾指示
5. **结构化输出** —— 返回分析结果 + 可直接复制的优化提示词 + 修改理由说明

### 使用示例(优化前 / 优化后)

**输入(raw)**

```
Write me a Python script that analyzes CSV files and finds anomalies
```

**输出(optimized，节选)**

```
<role>
You are a senior data engineer specializing in anomaly detection and
statistical analysis with Python.
</role>

<context>
CSV datasets come from production IoT sensors. Files range from
10K–5M rows with columns: timestamp, sensor_id, value, status.
</context>

<task>
1. Loads one or more CSV files
2. Detects statistical anomalies using z-score and IQR methods
3. Handles missing data gracefully
4. Outputs a summary report with flagged rows
</task>

<constraints>
- Use only pandas, numpy, scipy (no ML libraries)
- Handle files up to 5M rows efficiently
- Include type hints and docstrings
</constraints>

<output_format>
Single Python code block, followed by a usage example and sample output.
</output_format>
```

在输入前加上 `prompt:` 后,即便输入中混有提问、指令、附件 PDF 或提示词注入尝试,系统也不会执行它们,而是始终将其作为"待优化对象"处理。附件文档会被替换为 `{{DOCUMENT}}` 占位符。

```
prompt: Based on the attached PDF, explain the GDPR compliance risks and mitigation.
```

### 优点

- **可在所有 Claude 界面中使用** —— 并非 Claude Code 专属,基于 system prompt 运行,可在 claude.ai Project、直接粘贴或 API 中使用
- **专为 Opus 4.8 调优** —— 反映了默认的 `high` effort 设置、per-turn adaptive thinking、改进的 tool triggering 以及 1M token 上下文窗口,甚至在说明中标注了推荐的 effort 等级
- **随复杂度成比例扩展** —— 不会给简单问题套上过度的 10 标签结构
- **可复用模板** —— 以 `{{VARIABLE}}` 形式输出,可直接用于重复性任务

### 缺点

- **手动工作流** —— 不像 Hook/Skill 那样自动触发,用户需要自行设置 system prompt 并输入提示词
- **依赖 Opus 4.8** —— 部分规则可能不适用于其他模型(第三方 LLM、旧版 Claude),并非模型无关(model-agnostic)
- **新兴仓库** —— star 数较少,社区验证与问题追踪较薄弱
- 使用 API 时需自行了解 Opus 4.8 的限制(不支持 temperature/top_p/top_k,不支持 assistant prefill)

### 安装指南

仓库结构:`README.md`、`CLAUDE.md`(引擎本体)、`GUIDE.md`(使用模式)、`QUICKSTART.md`、`LICENSE`

**方案 A —— Claude Project(推荐)**

1. 在 claude.ai 上新建一个 **Project**
2. 将 `CLAUDE.md` 的内容粘贴到 **Project Instructions** 字段
3. 将 `GUIDE.md` 作为 **knowledge file** 上传
4. 开始对话 → 输入原始提示词

**方案 B —— 直接粘贴**

1. 复制 `CLAUDE.md` 全文
2. 粘贴到任意 Claude 界面的 **system prompt** 中
3. 将原始提示词作为 user message 发送

**方案 C —— API 集成**

```python
import anthropic

client = anthropic.Anthropic()

with open("CLAUDE.md", "r", encoding="utf-8") as f:
    system_prompt = f.read()

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=8192,
    system=system_prompt,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},   # 默认 high，难度高时可用 xhigh/max
    messages=[
        {"role": "user", "content": "prompt: Your raw prompt here"}
    ],
)
print(response.content[0].text)
```

> API 注意事项:禁止设置 `temperature`/`top_p`/`top_k`(会返回 400 错误),禁止 assistant prefill,adaptive thinking 默认关闭,需显式启用。

仓库:`github.com/CheswickDEV/claude-opus-4.8-prompt-optimizer`

---

## 2. johnpsasser/claude-code-prompt-optimizer

面向 Claude Code 的钩子。将简单的提示词扩展为详细、结构化的指令。给提示词加上 `<optimize>` 标签后,钩子会拦截它并交由 Claude 的 extended thinking 模式处理,将原始请求扩展为涵盖架构、端点、错误处理、认证、验证、测试的完整规格。实质上是代为完成提示词工程。

### 使用示例

```
<optimize> build me a REST API for a todo app
```

→ 钩子拦截该请求,将其扩展为涵盖 architecture、endpoints、error handling、auth、validation、testing 的结构化规格。若为性能相关请求,则扩展为包含 profiling 步骤、瓶颈识别、优先级排序的 refactoring 目标以及基准测试标准的计划。

### 优点

- **基于标签的显式触发** —— 只扩展带有 `<optimize>` 标签的提示词,不会产生意外干预
- **利用 extended thinking** —— 不是简单的改写,而是经过推理的规格扩展
- **易于调优** —— model、fallback model、timeout、system prompt 分离在 `optimizer.config.json` / `system-prompt.md` 中,无需修改 TypeScript 即可调整。调试日志位于 `/tmp/claude-code-hook-debug.log`

### 缺点

- **仅限 Claude Code** —— 无法在 claude.ai 网页/应用中使用
- **认证配置较复杂** —— 存在 OAuth token / API key 优先级解析逻辑,初始设置时需理解环境变量
- **依赖 Node** —— 基于 npm 安装,需要额外配置 Agent SDK 认证

### 安装指南

```bash
git clone https://github.com/johnpsasser/claude-code-prompt-optimizer.git
cd claude-code-prompt-optimizer
npm run install-hook
```

安装程序会处理依赖项、认证设置、钩子配置及验证。发放并注册认证令牌:

```bash
claude auth token
export CLAUDE_CODE_OAUTH_TOKEN="your-oauth-token"   # 添加到 shell profile
```

若手动注册钩子,需在 `~/.claude/settings.json`(或项目设置)中将 `src/hooks/optimize-prompt.sh` 的路径指定为 `UserPromptSubmit` 钩子。

仓库:`github.com/johnpsasser/claude-code-prompt-optimizer`

---

## 3. severity1/claude-code-prompt-improver

"Type vibes, ship precision."面向 Claude Code 的智能提示词改进插件(钩子 + 技能)。它并非无条件打磨所有提示词,而是**让清晰的提示词原样通过,只筛选出模糊的提示词**,使其经过调研与提问流程。目标是在提示词提交、工具使用、子代理启动等时刻注入即时上下文,提升"首次输出"的质量 —— 从而减少修正往返次数,节省 token 和时间。

### 运行方式

1. 钩子接收提示词,用约 189 token 的评估提示词判断其清晰度
2. **模糊** → 触发 prompt-improver 技能 → 制定调研计划(TodoWrite) → 启动 Explore 子代理进行 Glob/Grep/Web/多文件 Read → 综合结果 → 向用户提出 1-6 个基于证据的问题 → 结合回答执行原始请求
3. **清晰** → 无需加载技能,直接执行

设计原则:"fire wide, self-cancel cheap"(广撒网,自行取消成本低)—— 漏掉一次 nudge 会浪费一整轮修正,而误触发的 nudge 只会消耗被忽略的少量 token,因此系统采用高召回率的门控机制,同时让每个 nudge 在不匹配时自我取消。

### 使用示例

```
fix the bug
```

→ 判定为模糊 → 调研代码库后,提出 1-6 个基于证据的问题(例如"是哪个文件/什么症状/如何复现")→ 收到回答后执行实际修复。相反,足够具体的提示词会不经任何干预直接执行。

### 优点

- **选择性介入** —— 大多数提示词原样通过,仅在必要时触发,将开销降到最低
- **优化首次输出质量** —— 不仅是词语层面的改写,而是改进"提示词 → 输出"的整条路径(提问 + 上下文注入)
- **透明性** —— 注入的上下文会在对话中显示
- **经过验证的规模** —— 约 1.4k star,社区采用与维护活跃

### 缺点

- **仅限 Claude Code** —— 不支持网页/应用
- **介入时会增加额外的对话轮次** —— 判定为模糊时的提问步骤可能与希望立即得到答案的流程产生冲突
- **配置存在学习曲线** —— 需要理解 plugin/hook/skill/nudge registry 的结构

### 安装指南

由于是 `.claude-plugin` 结构的 Claude Code 插件,通过插件市场方式安装。(准确命令建议以仓库最新 README 为准)

```
# 在 Claude Code 内
/plugin marketplace add severity1/claude-code-prompt-improver
/plugin install prompt-improver
```

或手动安装时,克隆仓库,将 `hooks/`、`skills/prompt-improver/` 放置在 `~/.claude/` 目录下,并在 settings 中注册钩子。

仓库:`github.com/severity1/claude-code-prompt-improver`

---

## 4. Hashaam101/prompt-optimizer

Claude Code 技能,提供两种模式。**auto 模式**在安装后静默(silent)地精炼每一个提示词以引导出更好的结果;**manual 模式**通过 `/optimize {prompt}` 以文本形式展示精炼后的提示词而非直接执行 —— 便于复用提示词或学习更好的写法。

### 使用示例

```
# manual：以文本查看精炼结果
/optimize 分析本季度的销售数据

# 或前缀方式
optimize: 分析本季度的销售数据
optimize prompt: 分析本季度的销售数据
```

只需安装,auto 模式(Mode 1)就会在每次提示词中自动激活,无需额外的斜杠命令。

### 优点

- **双模式** —— 日常自动精炼,需要时可用 `/optimize` 提取精炼文本以复用或学习
- **安装简单** —— 只需复制一个 SKILL.md 文件
- **静默运行** —— auto 模式不会打断工作流

### 缺点

- **仅限 Claude Code**
- **auto 模式的不透明性** —— 自动精炼是静默进行的,可能难以追踪具体改动了什么(可通过 manual 模式弥补)
- **小规模仓库** —— 社区验证较薄弱

### 安装指南

在全局(所有项目)或按项目复制 `SKILL.md`。

```bash
# 全局安装 (Linux/macOS)
cp SKILL.md ~/.claude/skills/prompt-optimizer.md

# 按项目安装 (Linux/macOS)
cp SKILL.md .claude/skills/prompt-optimizer.md
```

```powershell
# Windows (PowerShell) — 全局
Copy-Item SKILL.md "$env:USERPROFILE\.claude\skills\prompt-optimizer.md"
```

安装后自动激活,使用 `/optimize` 调用 manual 模式。

仓库:`github.com/Hashaam101/prompt-optimizer`

---

## 5. nidhinjs/prompt-master

"一个为所有 AI 工具编写精确提示词的 Claude 技能。"目标是一次性生成精确的提示词,消除因重新提示而浪费的 token 和额度。它可以针对 Claude、ChatGPT、Gemini、o1/o3、Cursor、Claude Code、GitHub Copilot、Windsurf、Bolt、v0、Lovable、Perplexity、Midjourney、DALL-E、Stable Diffusion、ComfyUI、Sora、Runway、ElevenLabs、Zapier、Make 等目标工具生成最优提示词。

设计理念:"最好的提示词不是最长的,而是每个词都承重(load-bearing)的。"它认为长会话中最大的浪费是"AI 忘记了之前确定的内容",因此使用记忆块在会话中持续保留决策事项。

### 使用示例

```
Build a claude code prompt for a landing page for a business dashboard
that looks and feels exactly like notion - smooth animations, clean ui
```

→ 根据目标(Claude Code)、框架、token 估算和策略进行路由后,输出生产级规格。若目标是 Midjourney,则会生成图像工具特有的格式,例如逗号分隔的描述词、光照/氛围锚定、固定的宽高比与版本、negative prompt 等。

### 优点

- **多工具路由** —— 除 Claude 外,还能自动为 ChatGPT、Midjourney、编码代理等工具应用最优格式
- **保留记忆** —— 记住会话内的决策事项,减少重新提示造成的浪费
- **持续活跃更新** —— 兼容 Opus 4.8(v1.7.0)、版本感知路由(4.6/4.7/4.8)、Prompt Decompiler 模式等持续更新

### 缺点

- **将 Claude 当作"提示词生成器"使用** —— 更偏向于为其他工具生成提示词,而非直接改进 Claude 自身的输出
- **依赖 Claude Code 技能环境** —— 需要技能运行环境
- **小规模仓库** —— 社区验证较薄弱

### 安装指南

```bash
mkdir -p ~/.claude/skills
git clone https://github.com/nidhinjs/prompt-master.git ~/.claude/skills/prompt-master
```

安装后,当触发条件匹配时技能会自动发起。references 文件夹中的模板可辅助生成目标工具特定的输出。

仓库:`github.com/nidhinjs/prompt-master`

---

## 6. 选择指南

| 场景 | 推荐 |
|---|---|
| 在 claude.ai 网页/应用或 API 中反复生成结构化提示词 | **CheswickDEV 4.8**(注册为 Project) |
| 在 Claude Code 中即时选择性扩展特定提示词 | **johnpsasser**(`<optimize>` 标签) |
| Claude Code 重度用户,想减少修正往返并提升首次输出质量 | **severity1**(选择性介入) |
| 在 Claude Code 中希望同时使用自动精炼与手动提取精炼文本 | **Hashaam101**(双模式) |
| 需要在一处为 ChatGPT、Midjourney、编码代理等生成提示词 | **nidhinjs**(多工具) |
| 只想参考优质提示词"示例"(而非工具) | `langgptai/awesome-claude-prompts` 等精选合集 |

**组合建议**:如果环境是 Claude Code,可常驻使用选择性介入型工具(severity1),另外在制作正式提示词资产时将 CheswickDEV 4.8 作为 claude.ai Project 运行,两者并行效果更佳。对于重复输出一致性至关重要的工作流(例如标准化报告、量化分析提示词),与提示词合集相比,将优化器的组件框架或自建模板注册为 reference 更为稳定。

---

## 7. 通用注意事项

- **确认模型依赖性** —— 专为 Opus 4.8 调优的工具(如 CheswickDEV)在其他模型上可能部分规则不适用。
- **自动触发型工具的不透明性** —— auto 模式/silent 钩子可能难以追踪具体改动,应尽可能搭配能展示改动内容的 manual 模式或透明化选项。
- **认证与令牌管理** —— 钩子类工具会处理 OAuth token/API key,需留意环境变量和 shell profile 的暴露风险。
- **仓库可信度** —— 检查 star、commit、issue 活跃度,安装命令应始终与各仓库最新 README 核对。本文档中的命令为撰写时的版本。
- **与官方指南并用** —— 不应只依赖工具本身,同时参考 Anthropic 官方的提示词工程文档(`docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview`)有助于更好地验证工具的产出。

---

*撰写基准日期:2026-06-21。各项目的功能与安装方式可能会更新,请以各仓库最新的 README 为准。*
