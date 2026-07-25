---
title: "腾讯混元 Hy3 介绍 — Hy3 入门指南"
description: "腾讯Hy3模型(2026年7月6日正式发布)入门指南:规格参数、与DeepSeek/Claude/ChatGPT的价格对比、优缺点、竞品对比,以及API、自托管、AI编程工具集成的完整步骤。"
keywords:
  - "腾讯 Hy3"
  - "混元 Hy3"
  - "Hy3 入门"
  - "Hy3 价格"
  - "Hy3 对比 DeepSeek"
  - "MoE 大模型"
  - "TokenHub"
  - "Claude Code 集成"
lang: zh
featured: false
schema_type: TechArticle
---

# 腾讯混元 Hy3 介绍 — Hy3 入门指南

> 撰写日期:2026-07-12 | 目标模型:腾讯 Hy3(正式发布于2026-07-06)
> 本文所有数据均基于腾讯官方发布及第三方基准测试资料,出处见文末参考文献。

---

## 1. 概述

Hy3是腾讯Hy团队(前身为混元/Hunyuan)于2026年7月6日正式发布的基于MoE(混合专家)架构的大语言模型。它是在4月23日发布的Hy3 preview基础上,吸收了50多个产品团队的反馈并进行强化学习(RL)规模化改进后的正式版本,也是首席AI科学家姚顺予(Yao Shunyu)加入团队201天后交出的第一份完整成果。从1月末的基础设施重建到正式发布,团队在约6个月内完成了端到端的模型开发闭环——据称投入了无限的资金与人力,以"996"(早9点上班、晚9点下班、每周工作6天,中国的常见说法)为常态运作。

其核心定位十分明确:并非追逐参数规模竞赛,而是"**在实际生产力场景中值得信赖的低成本智能体模型**"。用腾讯自己的话说,Hy3以2至5倍于自身规模的旗舰开源模型才能达到的性能水平运行。

## 2. 模型规格

| 项目 | 数值 |
|---|---|
| 架构 | MoE(混合快/慢思考) |
| 总参数量 | 295B |
| 激活参数量 | 21B(192个专家中激活top-8) |
| MTP层 | 3.8B(1层) |
| 层数 | 80(不含MTP) |
| Attention | GQA,64个头 / 8个KV头 / head dim 128 |
| 上下文长度 | 256K |
| 词表大小 | 120,832 |
| 精度 | BF16(另提供FP8量化版本) |
| 许可证 | **Apache 2.0**(preview阶段为Tencent Hy Community License) |
| 权重分发 | Hugging Face、ModelScope、GitCode、CNB |

## 3. 价格对比:Hy3 vs DeepSeek vs Claude vs ChatGPT

### 3.1 Hy3官方价格(以Tencent Cloud TokenHub为准)

| 类别 | 价格(RMB/100万tokens) | 折合美元 | 折合韩元(约) |
|---|---|---|---|
| 输入 | 1元 | $0.15 | 约195韩元 |
| 输出 | 4元 | $0.59 | 约780韩元 |
| 缓存命中输入 | 0.25元 | $0.037 | 约49韩元 |

相比同等性能模型价格极为低廉,preview上线后日均token消耗量增长了20倍。

### 3.2 主要模型价格对比表(2026年7月,官方价格,美元/100万tokens)

| 模型 | 输入 | 输出 | 缓存命中输入 | 相对Hy3的输出倍率 | 上下文 |
|---|---|---|---|---|---|
| **腾讯 Hy3** | $0.15 | $0.59 | $0.037 | 1.0x | 256K |
| DeepSeek V4 Flash | $0.14 | $0.28 | $0.0028 | 0.47x | 1M |
| DeepSeek V4 Pro | $0.435 | $0.87 | $0.003625 | 1.5x | 1M |
| Claude Haiku 4.5 | $1.00 | $5.00 | $0.10 | 8.5x | 200K |
| Claude Sonnet 4.6 | $3.00 | $15.00 | $0.30 | 25x | 1M |
| Claude Opus 4.8 | $5.00 | $25.00 | $0.50 | 42x | 1M |
| GPT-5.4(OpenAI) | $2.50 | $15.00 | 约输入价0.1倍 | 25x | 1M |
| GPT-5.5(OpenAI) | $5.00 | $30.00 | 约输入价0.1倍 | 51x | — |

### 3.3 价格对比解读

**对比DeepSeek——有条件成立。**与性能相近的V4 Pro相比,Hy3明显更便宜(输入约为1/3,输出约为2/3)。但V4 Pro目前的价格是75%折扣后的促销价,原始定价为$1.74/$3.48。而与最低价档V4 Flash相比,DeepSeek反而更便宜——输入价格几乎相同,但输出价格不到一半,缓存命中单价便宜10倍以上($0.0028对比$0.037)。由于DeepSeek在缓存命中时自动应用98%的输入折扣且无需额外配置,对于反复发送相同系统提示词的智能体循环或RAG等缓存命中率高的工作负载,实际成本差距会远超表面单价所示。

**对比Claude/ChatGPT——优势压倒性。**按输出价格计,Hy3仅为Claude Sonnet 4.6的1/25、Opus 4.8的1/42、GPT-5.5的1/51。两大阵营均可通过提示词缓存(约90%折扣)和批处理API(Claude为50%折扣)降低实际成本,但即使叠加所有折扣仍无法接近Hy3的表面单价。不过这一差距是以性能差距为代价换来的——在需要最高难度推理和多工具协同的任务中,前沿模型更高的单任务成功率可以抵消每token价格差异。

**三个账单陷阱。**
(1)DeepSeek V4默认开启thinking模式——不可见的内部推理token会计入输出费用。Hy3默认为`no_think`,因此不存在突然暴涨账单的风险。

(2)OpenAI GPT-5.5的输出价格在不同来源间存在$25~30的差异,生产环境预算务必以官方页面为准重新确认。
(3)智能体类工作负载每一步都会重新发送累积上下文,token消耗量是聊天场景的10~100倍——单价差异会被直接放大。

## 4. 优点

**(1)成本效率。**以21B激活参数控制推理成本,同时性能可与2~5倍规模的旗舰模型竞争。OpenRouter数据显示,腾讯的token调用份额在6月已升至8.7%,印证了市场反应。

**(2)智能体/工具调用稳定性。**这是正式发布版本的核心改进点:工具调用成功率和错误恢复能力提升,导致无限循环的无效调用减少。在SWE-Bench Verified测试中,CodeBuddy、Cline、KiloCode等不同智能体脚手架之间的准确率差异在4%以内——对生产环境的智能体开发者而言,这一特性比基准分数本身更重要。

**(3)幻觉抑制。**训练遵循"有依据才回答,没有依据就明说,不混淆来源或编造数据"的原则。在内部实际使用场景评估中,幻觉率从12.5%降至5.4%,常识错误率从25.4%降至12.7%。

**(4)多轮/长文本上下文保持。**多轮对话问题率从17.4%降至7.9%,MRCR(长对话基准)从42.9%提升至75.1%。改进集中在指代消解、省略恢复、多轮约束继承等实际工作中的痛点。

**(5)实战验证。**在WorkBuddy内部评估中,任务解决率从72%提升至90%,平均完成时间缩短34%。已公开的案例包括不使用硬编码、用实时公式为一家石油公司构建覆盖3个地区、6个矿区、5,220个关联单元格的合并现金流模型等办公室/财务建模实战案例。

**(6)完全开源。**采用商业友好的Apache 2.0许可证,提供FP8量化版本、微调流水线(full/LoRA、DeepSpeed ZeRO、LLaMA-Factory集成),以及压缩工具包AngelSlim。

## 5. 缺点与局限

**(1)顶级推理能力的天花板。**在硬核编码、复杂推理、多工具协同等核心能力上,Hy3仍被评价为落后于Claude、GPT-5.5等第一梯队前沿模型。在GPQA Diamond上,Hy3与DeepSeek V4 Pro均约为90%,不及GPT-5.4(93.0%)和Gemini 3.1 Pro(94.3%)。

**(2)上下文长度。**256K实用但仅为DeepSeek V4 Pro的1M的1/4,在超大代码库、批量文档分析场景中处于劣势。

**(3)内存需求。**由于是MoE架构,单次请求的计算量仅为21B,但全部295B参数都必须驻留内存。推荐的自托管规格为8x H20-3e级GPU。

**(4)依赖内部验证数据。**幻觉率、WorkBuddy解决率等令人印象深刻的数字多来自腾讯内部评估,而非标准化的公开基准测试,难以独立复现。

**(5)在腾讯内部地位的局限。**微信生态仍以自研模型WeLM为主力——Hy尚未成为腾讯统一的AI基础模型,这一点被指出是长期战略层面的风险。

## 6. 竞品模型对比

| 维度 | Hy3(腾讯) | DeepSeek V4系列 | Qwen 3.7(阿里巴巴) | Claude / GPT-5.5 |
|---|---|---|---|---|
| 结构 | 295B MoE / A21B | V4 Pro:1.6T MoE / 约A48B级 | 3.7 Max:未公开(proprietary) | 未公开 |
| 上下文 | 256K | V4 Pro:1M | — | 因模型而异 |
| 许可证 | Apache 2.0 | MIT(可自托管) | Max仅限API调用 | 闭源 |
| 优势 | 智能体稳定性、幻觉抑制、成本 | 算法/竞赛编程(LiveCodeBench 93.5%)、超长文本 | 长时间自主智能体运行(35小时)、SWE-bench Pro 60.6% | 最高难度推理、多工具协同、创造性工作 |
| 价格档位 | 最低价档 | V4 Pro也属低价($0.87/1M输出) | Max $7.50/1M输出 | 最高价档 |

**对比DeepSeek V4。**第三方对比(CodingFleet)显示,在18个共有基准中,Hy3在12个上领先V4 Pro。尤其在无污染(contamination-free)的新基准DeepSWE上,Hy3以28.0%对8.0%领先20个百分点——被解读为工具使用泛化能力的差异。在不使用工具的HLE上Hy3略逊(37.0%对37.7%),但使用工具后领先5个百分点(53.2%对48.2%)。相对地,V4 Pro在1M上下文、MIT许可证以及重复上下文场景下的磁盘缓存成本方面占优势。在SWE-bench Verified上,Hy3以74.4%小幅领先V4的约72%。

**对比Qwen(阿里巴巴)。**Qwen 3.7 Max以SWE-bench Pro 60.6%(独占模型最高值)和35小时自主智能体运行等成绩,主打"Agent Frontier"高端路线。但它仅限API调用(依赖阿里云),按输出价格计比Hy3贵10倍以上。若需要开放权重、低成本和自托管,选Hy3;若需要最长时间的自主智能体性能,选Qwen Max。

**对比Claude/ChatGPT(GPT-5.5)。**在前沿级难度的推理、复杂多步问题求解、多工具编排方面,这些模型依然占优。Hy3的策略并非正面对抗,而是"以极低成本处理企业实务中的绝大多数工作"。在腾讯自身的盲测评估中(270名专家,312次有效对比),Hy3得分2.67/4,GLM-5.1为2.51/4——差距在前端开发、CI/CD、数据与存储类任务中最为明显。

## 7. 入门指南

### 7.1 选择接入路径

| 路径 | 适用对象 | 备注 |
|---|---|---|
| Tencent Cloud TokenHub API | 即时可用,无需基础设施 | 适用上述价格表 |
| OpenRouter等全球平台 | 海外开发者 | 正逐步接入(preview版已上线) |
| 自托管(vLLM/SGLang) | 需要数据主权或定制化时使用 | 推荐8x H20-3e级GPU |
| Yuanbao / WorkBuddy | 终端用户体验 | Yuanbao的智能体功能免费 |

### 7.2 直接调用Tencent Cloud API(托管方式)

基于腾讯官方文档中心(aistudio.tencent.com/hunyuan/doc-center)及Tencent Cloud文档。Hunyuan API兼容OpenAI接口规范,只需在OpenAI官方SDK中替换`base_url`和`api_key`即可完成切换,无需修改应用代码。

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.hunyuan.cloud.tencent.com/v1",
    # 在控制台生成API Key: console.cloud.tencent.com/hunyuan/api-key
    api_key="YOUR_HUNYUAN_API_KEY",
)

response = client.chat.completions.create(
    model="hy3",
    messages=[{"role": "user", "content": "你好。"}],
)
print(response.choices[0].message.content)
```

需要在官方文档中确认的运营注意事项:

| 项目 | 内容 |
|---|---|
| 端点 | `https://api.hunyuan.cloud.tencent.com/v1/chat/completions` |
| 并发限制 | 默认5并发(主账号与子账号共享,提升需另行申请) |
| `stop`参数 | OpenAI在匹配字符串**之前**停止,Hunyuan在匹配字符串**之后**停止——依赖此行为的解析逻辑需注意 |
| 流式usage | 设置`stream_options.include_usage=true`后,usage会在最后一个chunk中返回 |
| Embedding | 固定为`hunyuan-embedding`,dimensions固定为1024,仅支持`input`/`model`参数 |
| 函数调用 | 支持OpenAI规范的2-pass流程(模型选择函数与参数→客户端执行→结果附加到上下文后重新请求) |
| 平台迁移 | Hunyuan功能**正在迁移至TokenHub**——Hy3等新模型优先通过TokenHub(`tencent-tokenhub`)/TokenPlan(`tencent-tokenplan`)端点提供。若限制API Key的可用模型范围,须在允许列表中包含`hy3` |

腾讯已承诺保持兼容性,但存在细节行为差异,从OpenAI迁移时建议将上表各项纳入回归测试范围。

### 7.3 下载模型(用于自托管)

```bash
# Hugging Face
huggingface-cli download tencent/Hy3          # BF16
huggingface-cli download tencent/Hy3-FP8      # FP8量化版本(节省内存)
```

权重镜像:Hugging Face、ModelScope、GitCode、CNB。

### 7.4 使用vLLM进行服务化

```bash
# 源码构建
uv venv --python 3.12 --seed --managed-python
source .venv/bin/activate
git clone https://github.com/vllm-project/vllm.git
cd vllm
uv pip install --editable . --torch-backend=auto

# 启用MTP(Multi-Token Prediction)并启动服务器
export VLLM_FLASHINFER_ALLREDUCE_BACKEND=trtllm
vllm serve tencent/Hy3 \
  --tensor-parallel-size 8 \
  --speculative-config.method mtp \
  --speculative-config.num_speculative_tokens 2 \
  --tool-call-parser hy_v3 \
  --reasoning-parser hy_v3 \
  --enable-auto-tool-choice \
  --port 8000 \
  --served-model-name hy3
```

### 7.5 使用SGLang进行服务化

```bash
git clone https://github.com/sgl-project/sglang
cd sglang
pip3 install pip --upgrade
pip3 install "transformers>=5.6.0"
pip3 install -e "python"

python3 -m sglang.launch_server \
  --model tencent/Hy3 \
  --tp-size 8 \
  --tool-call-parser hunyuan \
  --reasoning-parser hunyuan \
  --speculative-num-steps 2 \
  --speculative-eagle-topk 1 \
  --speculative-num-draft-tokens 3 \
  --speculative-algorithm EAGLE \
  --port 8000 \
  --served-model-name hy3
```

### 7.6 调用OpenAI兼容API(以自托管服务器为准)

```python
from openai import OpenAI

client = OpenAI(base_url="http://127.0.0.1:8000/v1", api_key="EMPTY")

response = client.chat.completions.create(
    model="hy3",
    messages=[
        {"role": "user", "content": "你好,请简单自我介绍一下。"},
    ],
    temperature=0.9,   # 官方推荐值
    top_p=1.0,         # 官方推荐值
    # reasoning_effort:
    #   "no_think"(默认,即时回答) | "low" | "high"(深度chain-of-thought)
    extra_body={"chat_template_kwargs": {"reasoning_effort": "high"}},
)
print(response.choices[0].message.content)
```

运维提示:数学、编程、复杂推理场景使用`reasoning_effort="high"`,简单响应与批量处理使用`"no_think"`。仅通过这一个参数切换快/慢思考,是Hy3混合设计的核心接口。

### 7.7 微调与量化

同时支持全量微调(full fine-tuning)与LoRA,官方流水线包含DeepSpeed ZeRO配置和LLaMA-Factory集成(见仓库中的`finetune/`目录)。压缩方面由AngelSlim工具包提供量化、低比特与speculative sampling支持。

### 7.8 与AI编程工具集成(Using Hy3 in Programming/OpenClaw Tools)

腾讯官方文档中心为将Hy3接入主流AI编程工具提供了专门章节。以下基于TokenHub官方文档(接入 AI 工具)整理全部内容。

#### 7.8.1 通用前置准备

1. 在TokenHub控制台的API Key管理页面(console.cloud.tencent.com/tokenhub/apikey)生成API Key。
2. **注意**:若将访问范围(可访问范围)设置为"受限范围",必须在允许的模型列表中勾选**Hy3**(若使用preview,还需勾选**Hy3 preview**)。漏掉此项会导致认证通过但模型调用失败。
3. 生成后立即复制并保存API Key,之后无法再次查看。

#### 7.8.2 Claude Code(Anthropic协议)

Claude Code使用Anthropic Messages协议,因此需使用TokenHub的Anthropic兼容端点。与OpenAI兼容工具不同,**Base URL为根路径**(不含`/v1`)。

在`~/.claude/settings.json`(Windows:`用户目录/.claude/settings.json`)中设置以下内容:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://tokenhub.tencentmaas.com",
    "ANTHROPIC_AUTH_TOKEN": "YOUR_API_KEY",
    "ANTHROPIC_MODEL": "hy3",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "hy3",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "hy3",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "hy3",
    "CLAUDE_CODE_SUBAGENT_MODEL": "hy3",
    "ENABLE_TOOL_SEARCH": false
  }
}
```

各环境变量含义(以官方文档为准):

| 环境变量 | 是否必需 | 说明 |
|---|---|---|
| `ANTHROPIC_BASE_URL` | 是 | 连接TokenHub时固定为`https://tokenhub.tencentmaas.com` |
| `ANTHROPIC_AUTH_TOKEN` | 是 | TokenHub控制台生成的API Key |
| `ANTHROPIC_MODEL` | 是 | 默认调用模型名(`hy3`或`hy3-preview`) |
| `ANTHROPIC_DEFAULT_OPUS/SONNET/HAIKU_MODEL` | 否 | 将Claude Code的3个模型层级全部映射到同一模型——防止后台轻量调用被路由到不存在的默认模型而静默失败 |
| `CLAUDE_CODE_SUBAGENT_MODEL` | 否 | 子智能体模型。建议与主模型保持一致,以避免跨模型兼容性问题 |
| `ENABLE_TOOL_SEARCH` | 否 | 必须设为`false`——参见下方约束说明 |

配置完成后,打开新终端运行`claude`,再输入`/status`——若API Endpoint显示为`https://tokenhub.tencentmaas.com`且Model显示为`hy3`,即表示配置已生效。

两项运营限制(官方文档明确说明):

**启用深度推理**:在上述配置下,Hy3的默认思考模式为`no_think`。若需深度推理(high),在Claude Code内运行`/config`→将Thinking mode改为`true`→重启。

**Web搜索限制**:Claude Code会阻止第三方模型使用原生内置的Web搜索。配置Hy3后一旦触发搜索会失败。替代方案是接入搜索MCP:

```bash
# 添加腾讯云MCP市场的网页搜索MCP(需要另外的云API Key)
claude mcp add --transport sse WebSearchMCP "https://mcp-api.tencent-cloud.com/sse/XXX"

# 启动时显式禁用原生搜索工具(确保MCP调用稳定)
claude --disallowedTools "WebSearch"
```

添加MCP后必须重启Claude Code。搜索MCP所用的云API Key与模型API Key是相互独立的两个密钥。

#### 7.8.3 OpenAI兼容工具(Cline、Cursor、Roo Code、Kilo Code、OpenCode、Cherry Studio、Codex)

这组工具均通过相同的3个值进行集成。与Claude Code不同,**Base URL中包含`/v1`**。

| 设置项 | 值 |
|---|---|
| API Provider | `OpenAI Compatible` |
| Base URL | `https://tokenhub.tencentmaas.com/v1` |
| API Key | TokenHub生成的API Key |
| Model ID | `hy3` |

各工具的配置入口(以官方文档为准):

| 工具 | 形式 | 配置位置 |
|---|---|---|
| Cline | VSCode扩展 | 首次运行时选择"Bring my own API key"→Continue,或右上角设置按钮 |
| Cursor | IDE | Settings → Models → OpenAI兼容自定义端点 |
| Roo Code | VSCode扩展 | 在Provider设置中选择OpenAI Compatible |
| Kilo Code | VSCode扩展 | Provider设置(发布时提供Hy3免费访问促销) |
| OpenCode | CLI | 在provider配置文件中注册OpenAI兼容端点 |
| Cherry Studio | 桌面应用 | 添加模型提供商 → OpenAI Compatible |
| Codex | CLI | 在config中注册OpenAI兼容提供商 |

#### 7.8.4 OpenClaw / Hermes Agent(专用集成)

**OpenClaw**:提供官方provider插件,支持TokenHub(`tencent-tokenhub`)和TokenPlan(`tencent-tokenplan`)两个端点,内置目录使用`https://tokenhub.tencentmaas.com/v1`。模型ID为`hy3`——切勿与腾讯的`HY-3D-*`系列(3D生成API)混淆。

```bash
# 连接TokenHub
openclaw onboard --non-interactive \
  --auth-choice tokenhub-api-key \
  --tokenhub-api-key "$TOKENHUB_API_KEY"
```

若将Gateway作为launchd/systemd/Docker等托管服务运行,在交互式shell中export的密钥对托管进程不可见,因此需要将`TOKENHUB_API_KEY`持久化写入`~/.openclaw/.env`。

**Hermes Agent**:通过Nous Portal(portal.nousresearch.com)的订阅网关接入。执行`hermes setup --portal`完成OAuth连接后,从门户目录中选择Hy3模型;发布促销期间提供了免费层级。

#### 7.8.5 官方集成文档完整列表

| 工具 | 官方文档URL |
|---|---|
| 文档中心(英文) | https://aistudio.tencent.com/hunyuan/doc-center |
| 接入 AI 工具(集成文档目录) | https://cloud.tencent.com.cn/document/product/1823/130931 |
| CodeBuddy Code | https://cloud.tencent.com.cn/document/product/1823/131901 |
| WorkBuddy | https://cloud.tencent.com.cn/document/product/1823/131902 |
| Claude Code | https://cloud.tencent.com.cn/document/product/1823/131903 |
| OpenClaw | https://cloud.tencent.com.cn/document/product/1823/130935 |
| Hermes Agent | https://cloud.tencent.com.cn/document/product/1823/131927 |
| OpenCode | https://cloud.tencent.com.cn/document/product/1823/130936 |
| Cline | https://cloud.tencent.com.cn/document/product/1823/130932 |
| Cursor | https://cloud.tencent.com.cn/document/product/1823/130933 |
| Kilo Code | https://cloud.tencent.com.cn/document/product/1823/131904 |
| Roo Code | https://cloud.tencent.com.cn/document/product/1823/131905 |
| Codex | https://cloud.tencent.com.cn/document/product/1823/133532 |

## 8. 推荐使用场景

**推荐使用Hy3:** 以工具调用稳定性为核心需求的企业级AI智能体、大流量低成本处理(客户服务、文档与数据处理自动化)、办公生产力场景(财务建模、报告与演示文稿生成)、需要自托管的受监管环境(Apache 2.0)。

**推荐使用其他模型:** 百万token级的超长文本批量分析→DeepSeek V4 Pro。数十小时级别的自主智能体运行→Qwen 3.7 Max。最高难度的推理、数学证明、创造性长文写作→Claude、GPT-5.5。

一句话总结:**Hy3是一款"以前沿模型极小一部分成本,稳定处理日常企业工作绝大部分内容"的实用主义模型。**它并非榜首模型,而是姚顺予式"AI下半场"哲学的第一件实物——以生产环境可靠性而非榜单排名取胜。

---

## 参考文献

1. 腾讯官方新闻稿——"Tencent Hunyuan Officially Releases Hy3"(2026-07-06): https://www.tencent.com/en-us/articles/2202386.html
2. Tencent Hy技术博客——"Introducing Hy3": https://hy.tencent.com/research/hy3
3. GitHub官方仓库(规格、Quickstart、部署指南): https://github.com/Tencent-Hunyuan/Hy3
4. Hugging Face模型卡: https://huggingface.co/tencent/Hy3 / FP8: https://huggingface.co/tencent/Hy3-FP8
5. TechNode——发布与价格报道(2026-07-07): https://technode.com/2026/07/07/tencent-launches-hunyuan-hy3-integrates-model-across-multiple-products/
6. Caixin Global——发布报道、Yao Shunyu与OpenRouter份额(2026-07-06): https://www.caixinglobal.com/2026-07-06/tencent-launches-upgraded-hunyuan-3-ai-model-with-free-agent-feature-102461489.html
7. Pandaily——WorkBuddy 90%任务解决率与实战案例: https://pandaily.com/tencent-hunyuan-hy3-launch-agent-90-percent-task-resolution-jul2026-v2
8. CodingFleet——"Hy3 vs DeepSeek V4 Pro"基准对比: https://codingfleet.com/blog/hy3-vs-deepseek-v4-pro/
9. CodingFleet——"DeepSeek V4 Pro vs Qwen 3.7 Max": https://codingfleet.com/blog/deepseek-v4-pro-vs-qwen-3-7-max/
10. AIMadeTools——"Tencent Hy3 vs DeepSeek V4"(SWE-bench对比): https://www.aimadetools.com/blog/tencent-hy3-vs-deepseek-v4/
11. BigGo Finance——Hy3批判性分析(相较WeLM及第一梯队的局限): https://finance.biggo.com/news/eac480c0-1840-4271-858a-eb43389b8811
12. The Standard——开源许可证与价格报道: https://www.thestandard.com.hk/innovation/article/336512/Tencents-Hunyuan-releases-Hy3-available-on-WorkBuddy-and-more
13. OpenRouter模型对比页面: https://openrouter.ai/compare/deepseek/deepseek-v4-pro/tencent/hy3-preview
14. Artificial Analysis——Hy3智能水平、价格、速度对比: https://artificialanalysis.ai/models/comparisons/deepseek-v4-flash-vs-hy3
15. Tencent Hunyuan官方文档中心: https://aistudio.tencent.com/hunyuan/doc-center
16. Tencent Cloud——Hunyuan OpenAI兼容接口官方文档(端点、stop行为、并发、embedding、function call): https://cloud.tencent.com/document/product/1729/111007
17. OpenClaw——Tencent Cloud TokenHub/TokenPlan提供商集成指南(hy3模型访问): https://docs.openclaw.ai/providers/tencent
18. Tencent Cloud TokenHub——Claude Code集成官方文档(settings.json完整配置、深度推理、Web搜索MCP): https://cloud.tencent.com.cn/document/product/1823/131903
19. Tencent Cloud TokenHub——接入 AI 工具文档目录(CodeBuddy/WorkBuddy/Claude Code/OpenClaw/Hermes/OpenCode/Cline/Cursor/Kilo/Roo/Codex): https://cloud.tencent.com.cn/document/product/1823/130931
20. Tencent Cloud TokenHub——Cline集成官方文档(OpenAI Compatible配置模式): https://cloud.tencent.com.cn/document/product/1823/130932
21. DeepSeek官方 Models & Pricing(V4 Flash/Pro价格): https://api-docs.deepseek.com/quick_start/pricing/
22. Anthropic官方 Pricing文档(Claude各模型价格、缓存、批处理折扣): https://platform.claude.com/docs/en/about-claude/pricing
23. CloudZero——Claude API Pricing 2026 / Claude Opus 4.8 Pricing(含GPT-5.4/5.5价格对比): https://www.cloudzero.com/blog/claude-api-pricing/
24. Morphllm——AI Coding Costs 2026(主要模型官方价格综合对比,截至2026-06-18): https://www.morphllm.com/ai-coding-costs

*注:幻觉率(5.4%)、常识错误率(12.7%)、WorkBuddy任务解决率(90%)、盲测评估(2.67/4对比GLM-5.1的2.51/4)均为腾讯内部评估数据,并非经独立复现的公开基准测试。韩元换算基于2026年7月初汇率(1元人民币约等于195韩元)的近似值。3.2节价格表以2026年7月初各公司官方发布为准,DeepSeek V4 Pro为促销折扣价,GPT-5.5的输出价格在不同来源间存在$25~30的差异。LLM API价格随时可能变动,生产环境预算确定前请以各公司官方价格页面为准重新确认。*
