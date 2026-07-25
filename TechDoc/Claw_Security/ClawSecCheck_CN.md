---
title: "ClawSecCheck 项目分析与入门指南"
description: "面向OpenClaw AI代理的本地、只读、离线安全自查工具。以A-F评分配置,检测Lethal Trifecta,并提供修复提示。"
abstract: |
  ClawSecCheck是面向OpenClaw AI代理的本地、只读、离线自查工具,以技能或标准CLI形式分发。它使用覆盖暴露面、权限、密钥、供应链和代理行为的检查ID体系对配置进行A-F评分,并单独展示十种能力链风险(RISK-01至RISK-10)。该工具设计上坚持诚实原则:无法判断的项目绝不计为通过,可分享的徽章仅公开等级而不公开具体发现。
summary_for_ai: |
  面向AI代理的参考说明:本文档基于ClawSecCheck v0.30.1(README版本,截至2026-06-21)。这是一个pre-1.0、单一维护者运营的项目,标志、模式与检查ID在后续版本中可能变化。该工具仅适用于OpenClaw生态,执行的是静态/启发式审计而非运行时验证。请勿将其评分视为安全性保证。
lang: zh
featured: false
author: Dennis Kim
date: 2026-06-21
schema_type: TechArticle
---

# ClawSecCheck 项目分析与入门指南

> 基准:官方仓库 `github.com/gl0di/clawseccheck`,最新版本 v0.30.1 (2026-06-21)
> MIT许可证 · 仅使用Python标准库(零依赖) · 单一作者(gl0di)

---

## 背景

OpenClaw最近已成为黑客攻击的常见目标。除了OpenClaw自身的漏洞外,各种针对LLM的攻击手法也层出不穷。ClawSecCheck正是为解决这一问题而开发。

**ClawSecCheck**是面向OpenClaw AI代理的**本地、只读、离线安全自查(self-audit)工具**。可以作为OpenClaw技能安装并以对话方式使用,也可以作为标准CLI运行。

> "一条命令,对*你自己的*代理进行安全自查。"

其核心设计理念不是"扫描别人的代理",而是**审查自己的代理**。这样就完全避开了所有权证明和法律灰色地带的问题。该工具将配置评为A到F等级,用通俗语言指出最紧迫的漏洞,并提供可直接复制粘贴的修复建议以及**可分享的等级徽章**。

OpenClaw代理会读取用户消息、记住对话、持有密钥并代表用户行事。这些权限恰恰是攻击者瞄准的攻击面——一条被污染的消息或一个恶意技能就可能悄然将代理变成敌人。ClawSecCheck通过检查并评分配置,提前发现这种风险。

### 运行原则

- **对话驱动的审计**:在OpenClaw内运行时,即使代理不知道任何标志参数,也会以对话方式引导整个流程(引导模式)。
- **只读**:绝不修改配置或技能。不存在类似`--fix`的功能。
- **离线、零传输**:没有任何网络调用、API密钥或遥测。仅读取`~/.openclaw/openclaw.json`和工作区的引导Markdown文件。
- **诚实优先**:无法判断的项目标记为`UNKNOWN`并从评分中排除。`UNKNOWN`绝不等同于`PASS`。

在内部,它只调用一件事——用户自己的平台审计,以只读方式调用并合并结果。无shell访问、无`--fix`、存在超时机制,并可通过`--no-native`跳过。

```
openclaw security audit --json
```

---

## 检查内容是什么?

### Lethal Trifecta(致命三要素)——旗舰框架

这是ClawSecCheck在报告顶部展示的核心指标。当**不可信输入 × 敏感数据访问 × 外部(出站/执行)行为**三者同时成立时,一旦发生入侵就会是致命或显而易见的。该工具建议**最多满足其中两项**,并在顶部同时显示Score、Grade和Trifecta比例(分享徽章仅公开等级)。

### 检查族(按检查ID)

检查按以下检查ID体系实现:暴露/权限/密钥(B1-B12)、供应链(B13-B15)、防备状态(B16-B17)、代理行为(B18-B24)、注入/深层暴露(B26及以后)、能力/主机扩展(B43、B50系列),以及原生审计合并(A1)和风险引擎(RISK)。

| 检查族 | 代表项目 |
|--------|-----------|
| **B1-B12** | 网关暴露/通道认证、明文密钥、最小权限、执行沙箱、TLS、本地模型卫生 |
| **B6** | 检查引导文件(`SOUL.md`、`AGENTS.md`、`TOOLS.md`)中是否存在诱发提示注入的指令 |
| **B13** | 对已安装第三方技能内容进行静态检查。检测ClawHavoc类恶意软件和base64隐藏载荷。从v0.21起通过Python AST解析捕获`exec(base64.b64decode(...))`等混淆手法,从v0.23起追踪凭据文件流向网络汇出点的污点 |
| **B14 / B15** | 出站面 / MCP服务器信任边界 |
| **B16 / B17** | 是否存在威胁监控 / 自主性与心跳(heartbeat) |
| **B18-B24** | 子代理委托、静态数据暴露、身份/记忆文件写保护、工具输出信任边界、自我修改、审批绕过、深层MCP加固 |
| **B26** | 不可信上下文暴露(`contextVisibility="all"`默认值) |
| **B30 / B31 / B32** | 发送者身份强度 / `tools.deny:["write"]`无法阻止`apply_patch`、`exec`的漏洞设计(footgun) / 控制平面变更的可达性 |
| **B33** | 已知漏洞版本门槛(与`meta.lastTouchedVersion`比对) |
| **B38 / B39 / B41 / B42** | 浏览器SSRF(如169.254.169.254等) / 会话可见性与跨用户泄露 / 凭据爆炸半径 / 安装时供应链(preinstall钩子、全局可写的技能目录) |
| **B43 / B44(证言层)** | 用代理自我报告的方式补充静态扫描无法看到的实际工具/动词清单。分类为`EXEC/DESTRUCTIVE/EGRESS/MAILBOX_CONFIG/REVERSIBLE`,并检查与配置的偏差(置信度`ATTESTED`,实验性) |
| **B50-B54(Host Watch)** | 代理运行所在的主机本身是否受到监控:网络IDS、主机审计、文件完整性、EDR、主机防火墙。属于LOW严重级别,绝不会导致FAIL |
| **A1** | 代为运行平台自身的`openclaw security audit`并合并到同一份报告中(不影响评分) |

脏输入净化器、动作门和污点标记(B26-B28)仍处于路线图阶段,是目前最大的覆盖缺口。这也是部分项目仍标记为`UNKNOWN`的原因。

### 风险引擎——RISK-01至RISK-10

除了单项检查之外,该工具还单独检测十种**组合(能力链)**——当两个或更多属性同时成立时,入侵就会变得致命。

| ID | 严重级别 | 链条 |
|----|--------|------|
| RISK-01 | CRITICAL | 不可信发送者 → exec/write/提权工具 → 主机/文件系统 |
| RISK-02 | HIGH | 不可信输入 → 可达敏感数据 → 出站/执行(Lethal Trifecta) |
| RISK-03 | HIGH | 不可信入口 + 无沙箱 → 在主机上直接exec/write |
| RISK-04 | HIGH | 可变身份(基于名称匹配) → 提权/exec工具 → 权限提升 |
| RISK-05 | HIGH | 浏览器SSRF(私有网络) → 密钥/凭据 → 数据外泄 |
| RISK-06 | CRITICAL | 开放/不可信表面 → 控制平面端点 → 完全接管 |
| RISK-07 | HIGH | 无审批门的exec/write → 可写的引导/身份文件 → 持续性入侵 |
| RISK-08 | MEDIUM | 多用户通道 → 共享会话(`dmScope="main"`) → 跨用户泄露 |
| RISK-09 | CRITICAL | 恶意已安装技能(B13未通过) → 可达密钥 → 出站 → 数据外泄 |
| RISK-10 | MEDIUM | 不可信输入 → 主机exec/write → 缺乏主机检测 → 入侵不可见 |

每条链只有在所有环节都有正向证据时才会触发(evidence-gated),因此误报率较低。风险引擎不会改变确定性的A-F评分,而是单独展示,在不夸大分数的前提下让最坏路径一目了然。

---

## 评分方式

评分采用加权通过率(CRITICAL=10,HIGH=6,MEDIUM=3,LOW=1),并附加**诚实性硬上限**:只要存在一个未解决的CRITICAL,分数上限就锁定为**49**;存在未解决的HIGH,则上限为**79**——因此无法在带着致命漏洞的情况下获得A等级。

| 等级 | 分数 |
|------|-------|
| A | 90以上 |
| B | 80-89 |
| C | 70-79 |
| D | 50-69 |
| F | <50 |

`UNKNOWN`项目不计入评分,咨询类(advisory)检查也不会影响等级。分享卡片仅公开等级、分数和Trifecta比例,发现事项保持私密——因为分享不应该把地图递给攻击者。

---

## 优点

- **隐私优先、完全本地化**:没有账户、API密钥、遥测或网络请求。默认存储的只有一行仅供所有者查看的本地评分历史(`~/.clawseccheck/history.jsonl`),可通过`--no-history`退出。
- **检查原生审计遗漏的部分**:从提示注入角度(B6)检查平台自身审计不会检查的引导文件(`SOUL.md`、`AGENTS.md`、`TOOLS.md`)。
- **安装前风险评估**:通过`--vet <技能>`在安装/信任前验证技能,通过`--vet-mcp`验证已连接的MCP服务器(SAFE/SUSPICIOUS/DANGEROUS)。大多数工具只检查技能而遗漏MCP服务器,该功能正针对这一供应链缺口——自ClawHavoc事件以来尤为重要。
- **主动注入测试**:提供`--canary`(手动注入自测)、`--redteam`(工具投毒、MCP响应注入、记忆投毒、多代理、审批绕过、脏数据外泄场景)以及`--dryrun`(使用假密钥、假工具进行运行时行为测试)。
- **诚实设计**:`UNKNOWN ≠ PASS`,不会把局限性隐藏在绿色分数背后。风险链只在有证据时才触发。
- **完全免费、开源、零依赖**:MIT许可证,纯Python标准库。
- **多种输出格式与CI门控**:人类可读报告、`--json`、`--sarif`(SARIF 2.1.0)、`--html`、`--badge`(SVG)、`--card`。可通过`--fail-under 70`和`--exit-code`在CI中设置门控。

---

## 缺点与局限

- **仅适用于OpenClaw生态**:无法应用于其他代理平台。
- **需要意识到对话暴露**:在OpenClaw聊天中使用时,报告文本会成为对话的一部分,由你已在使用的模型提供商处理。扫描器本身不会创建新的通道,但这一点需要留意。
- **CLI使用需要Python环境**:推荐使用pipx安装(`pip install .`同样可行)。在Windows上会跳过POSIX权限检查,不支持Unicode的控制台会回退到ASCII。
- **静态、启发式审计**:并非运行时验证或形式化证明,可能出现误报或漏报。无法替代对运行中代理的对抗性测试。其检查范围也仅限于配置文件、引导Markdown和已安装技能文本。
- **非常新且规模很小的项目**:目前仍处于pre-1.0(0.x)阶段,由单一作者运营。标志、模式和检查ID即使在小版本更新中也可能变化,只有到1.0版本契约才会固定。在成熟度和验证历史方面,不及ClawSec、ClawSecure等大型项目。在公开报告或专栏中引用时,最好明确说明这一点。

---

## 与类似项目的比较

| 项目 | 形式 | 特点 |
|----------|------|------|
| **ClawSec** (prompt-security) | 技能套件 | 面向OpenClaw、Hermes、PicoClaw、NanoClaw。漂移检测、技能完整性验证、基于NVD的安全公告推送 |
| **ClawSecure** | 云审计平台 | 审计3,000+个技能,覆盖OWASP ASI 10/10,三层审计协议,持续监控 |
| **ClawScan** | CLI(`npx clawscan`) | 在技能安装前检测恶意软件、反向shell、提示注入和Unicode攻击,MIT许可 |
| **ClawVitals** | 技能+插件 | 本地运行健康检查,配置篡改检测/漂移告警,评分功能 |
| **openclaw-security-scan**(legendaryabhi) | 纯Bash CLI | 无需Python,自动修复严重问题,为CI提供JSON输出 |

**ClawSecCheck的差异化优势**在于完全离线本地运行且零依赖(相较于云端仪表盘型方案)、检查原生审计遗漏的引导文件注入(B6)、Lethal Trifecta比例与发现事项非公开的分享徽章、MCP服务器的安装前验证(`--vet-mcp`),以及将检查范围进一步扩展到主机监控态势(B50-B54)和证言层(B43/B44)。

---

## 快速开始

### 在OpenClaw聊天中(无需终端)

```
openclaw skills install clawseccheck            # 从ClawHub安装(唯一slug)
openclaw skills install git:gl0di/clawseccheck  # 或直接从GitHub安装
```

安装后,只需请求**"audit my OpenClaw setup with clawseccheck"**,等级和最紧迫的问题就会直接显示在聊天中。
ClawHub技能页面:**https://clawhub.ai/gl0di/clawseccheck**

### 标准CLI

```
pipx install git+https://github.com/gl0di/clawseccheck   # 或 pip install .
clawseccheck --home ~/.openclaw                          # 之后直接运行 clawseccheck
python -m clawseccheck                                    # 效果相同
```

### 直接运行内置脚本

```
python3 audit.py                 # 人类可读报告 + 分享卡片
python3 audit.py --json          # 机器可读格式
python3 audit.py --card          # 仅生成徽章
python3 audit.py --sarif results.sarif   # 用于上传GitHub Code Scanning(本地记录)
python3 audit.py --html report.html      # 独立HTML报告(仅供所有者查看)
python3 audit.py --fail-under 70         # 分数低于70时exit 1(用于CI)
python3 audit.py --ascii         # 不支持Unicode的控制台回退方案
```

### 完整性验证

```
python3 audit.py --verify-self    # ClawSecCheck自身源码的SHA-256(防篡改)
```

发布版本会打标签并公开,因此在安全敏感场合,**在更新前审查并锁定标签**比盲目自动更新更安全。

### 对话命令与内部运作

| 用户请求 | 内部动作 |
|-------------|-----------|
| "Audit my OpenClaw setup" | 默认审计:A-F等级 + 优先级修复清单 + Trifecta |
| "Is this skill safe to install?" | `--vet <技能>`(SAFE/SUSPICIOUS/DANGEROUS) |
| "Are my MCP servers safe?" | `--vet-mcp` |
| "Am I vulnerable to prompt injection?" | `--canary` / `--redteam` |
| "Watch my setup for changes" | `--monitor`(漂移、评分下降、新技能/MCP/通道提醒) |
| "What should I fix first?" | `--next`(基于发现事项的优先级排序) |
| "Give me fix prompts" | `--prompts`(针对每项发现的可复制粘贴修复提示) |
| "Share my grade" | `--badge` / `--card`(仅公开等级) |

---

## 参考文档

- 仓库:https://github.com/gl0di/clawseccheck
- 安全模型:https://github.com/gl0di/clawseccheck/blob/main/SECURITY_MODEL.md
- 技能定义:https://github.com/gl0di/clawseccheck/blob/main/SKILL.md
- ClawHub技能页面:https://clawhub.ai/gl0di/clawseccheck

---

*本文档基于README v0.30.1版本。作为pre-1.0项目,标志、模式与检查ID可能在后续版本中变更。*
