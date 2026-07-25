---
title: "portfolio-daily-review 安装与使用指南"
description: "一个每天检查一次投资组合的Claude Skill,当量化触发条件被触发时,会交叉验证量化、新闻、社交媒体三个来源,生成投资决策参考材料。"
abstract: |
  本指南介绍portfolio-daily-review这个Claude Skill的安装与配置。该技能从本地JSON文件中读取持仓信息,每天检查量化触发条件(T1~T5),仅当触发条件真正被触发时才执行完整的三来源(量化/新闻/社交媒体)交叉验证——其他情况下保持沉默以避免噪音。文中收录了SKILL.md完整工作流、参考文件(触发规则、情绪解读指南、行动框架)、触发检查Python脚本、示例数据以及自定义要点。
summary_for_ai: |
  面向AI代理的参考说明:该技能围绕三项原则设计——(1)"有意义的变化"的定义由量化规则(trigger-rules.md)固定,而非交由LLM自行判断;(2)"市场同步过滤器"会将个股波动幅度与基准指数波动幅度相差在1.5个百分点以内的情况降级为简要说明;(3)在评估价格走势之前,先检查已登记的投资论点(thesis)是否仍然有效,社交媒体上出现的极端情绪被视为潜在的反向指标,而非方向性信号。输出内容被明确定义为决策参考材料,而非投资建议,每次评审的最后一行都必须注明这一免责声明。
lang: zh
featured: false
author: Dennis Kim
date: 2026-07-15
schema_type: TechArticle
---

# portfolio-daily-review 安装与使用指南

> 一个每天检查一次投资组合的Claude Skill,当量化触发条件被触发时,
> 会交叉验证量化、新闻、社交媒体这3个来源,生成投资决策参考材料。
> 相关理念与设计背景请参见[Claude_skill_guide.md](./Claude_skill_guide.md)第6章。

---

## 1. 该技能的功能

- **触发短语**:"检查一下投资组合"、"我的账户怎么样"、"今天的评审"、"检查持仓"、"需要再平衡吗?"、"每日检查"
- **核心行为**:
  1. 从`assets/portfolio.json`加载持仓、平均成本和风险限额(无需每次重新输入)
  2. 通过网页搜索更新当前价格,然后评估**量化触发条件(T1~T5)**
  3. **若未触发任何条件→以一行"无异常"结束**(屏蔽噪音是该技能的第一原则)
  4. 只有触发时才对量化/新闻/社交媒体三个来源进行**独立采集→交叉验证矩阵**
  5. 给出行动候选项(持有/减仓/加仓/考虑止损/继续观察)+反方论点+反证条件
  6. 更新`last_review`并记录评审日志(用于计算下一次评审的变化量)

**三大设计特点**

- **"变化"的定义不交由LLM自行裁量**——由trigger-rules.md中的量化规则加判定脚本固定下来
- **市场同步过滤器**——若个股波动幅度与基准指数波动幅度相差在1.5个百分点以内,则降级为"市场同步波动",仅提供简要报告(避免每逢指数下跌日就对个股进行大篇幅分析而产生信息过载)
- **论点优先**——先检查已登记投资论点的有效性,而非先看价格变化。社交媒体上的极端情绪仅被视为潜在的反向指标

---

## 2. 安装方法

请从以下三种方式中选择一种。

### 方式A:Claude.ai(网页版/应用)——推荐

1. 将本仓库中的整个技能文件夹压缩为zip,或准备已分发的`.skill`文件。
   ```bash
   # 若直接从文件夹创建(zip与.skill格式相同)
   zip -r portfolio-daily-review.skill portfolio-daily-review/
   ```
2. 在Claude.ai中依次进入**Settings → Capabilities → Skills**上传。(需付费计划)
3. 上传后,在新对话中说出触发短语即可自动激活。

### 方式B:Claude Code

将整个文件夹复制到个人技能目录中:

```bash
cp -r portfolio-daily-review/ ~/.claude/skills/portfolio-daily-review/
```

重启Claude Code后,只需用自然语言提及即可使用。

### 方式C:Claude API

参考[Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill)
上传`.skill`包,即可在API调用中以相同方式运行。

> **验证小技巧**:安装后询问"告诉我现在可用的技能",即可确认是否加载成功。

---

## 3. 文件夹结构

```
portfolio-daily-review/
├── SKILL.md                      # 工作流主体(第0~5步)
├── assets/
│   └── portfolio.json            # 投资组合状态(安装后请替换为你自己的数据)
├── references/
│   ├── trigger-rules.md          # T1~T5量化触发条件定义
│   ├── sentiment-guide.md        # 社交媒体解读规则(反向指标·操纵检查)
│   └── action-framework.md       # 5种行动候选项映射+输出格式
└── scripts/
    └── check_triggers.py         # 触发条件判定脚本(已通过运行验证)
```

---

## 4. 初始配置(重要)

安装完成后,`assets/portfolio.json`中的内容是**示例数据**。请通过以下两种方式之一进行替换:

**通过对话**:首次请求评审时,该技能会询问你的持仓、数量和平均成本,并填充文件。
你也可以直接说,例如:"更新我的投资组合:三星电子200股,平均成本71,000韩元,……"

**直接修改文件**:请遵循以下schema。务必填写`thesis`(投资论点)字段——
这是判定行动候选项时优先于价格检查的项目。

---

## 5. 完整文件内容

将以下内容原样复制并保存为相同的文件夹结构,即可完成该技能的搭建。

### 5.1 SKILL.md

```markdown
---
name: portfolio-daily-review
description: >
  一个每天检查一次用户投资组合的技能,当预先定义的变化触发条件被触发时,
  会综合量化分析、市场新闻、社交媒体情绪这三个来源,生成投资决策参考材料。
  当用户提及"检查一下投资组合"、"我的账户怎么样"、"今天的评审"、
  "检查持仓"、"需要再平衡吗?"、"每日检查"等内容时,必须使用该技能。
  投资组合状态从assets/portfolio.json中读取;当用户提及股票代码/数量变更时,
  该文件的更新也由该技能处理。
---

# Portfolio Daily Review

## 目的

依据规则而非情绪来检查投资组合。若未触发任何条件,以一行"无异常"结束;
仅当触发条件被触发时,才执行三来源(量化/新闻/社交媒体)综合评估。

原则:**触发条件用量化规则判定,各来源独立采集后再交叉验证,
结论以行动候选项+反证条件的形式呈现。**

## 工作流

### 第0步:加载状态

读取`assets/portfolio.json`。

- 若`last_review`为今天的日期:告知用户"今天的评审已完成",
  并向用户确认是否需要重新执行(每日一次原则)。
- 若文件为空或没有`positions`:先向用户询问持仓、数量、平均成本
  以填充文件。同时确认风险限额(`risk_limits`)。
- 若用户提及类似"我加了50股三星电子"这样的变更,更新文件并总结
  变更内容以供确认。

### 第1步:更新行情并判定触发条件

通过网页搜索确认各持仓的当前价格。不要凭训练数据中的记忆来回答价格。

依据`references/trigger-rules.md`中的量化规则(T1~T5)进行判定。
若环境中`scripts/check_triggers.py`可执行,则使用脚本判定;
否则按规则文档手动计算。

**未触发任何条件时**:以当前价格表+"无触发条件,无需操作"结束。
不要生成不必要的分析。这是该技能最重要的规则。

### 第2步:三来源采集(仅针对触发的股票代码)

**独立**采集各个来源,采集阶段不要相互混合。

**[A] 量化视角**
- 该股票代码的因子状态:1月/3月动量、行业相对强度、波动率变化
- 与市场机制的一致性——若已安装`quant-market-brief`技能,且对话中
  存在当日简报,则复用其市场机制判定结果。若没有,则仅通过VIX/利率/
  指数进行简化判定,并标注为"简化"。

**[B] 市场新闻**
- 通过网页搜索确定触发原因相关的新闻。
- 优先采用一次信息源(信息披露、财报发布、监管机构公告)。明确区分
  推测性报道与事实。若无法确定原因新闻,则记录为"原因不明的价格
  波动"——这一点本身就是重要信息。

**[C] 社交媒体情绪**
- 通过网页搜索了解X(推特)、Reddit以及国内社区对该股票的反应方向和
  强度。
- 必须先阅读`references/sentiment-guide.md`。核心要点:社交媒体
  可能是反向指标。极端情绪倾向(恐慌/狂热)本身就是一种信号,
  不应直接作为方向性信号使用。
- 不指名引用具体账号,只讨论汇总后的方向/强度。

### 第3步:交叉验证与综合评估

将三个来源方向是否一致整理为矩阵:

| 来源 | 方向 | 强度 | 核心依据 |
|---|---|---|---|
| 量化 | 正面/中性/负面 | 强/中/弱 | |
| 新闻 | | | 标注是否为一次信息源 |
| 社交媒体 | | | 若出现极端倾向,标注反向指标的可能性 |

- **三者一致**→标注为高置信度
- **2:1分裂**→少数意见的依据必须写入正文
- **新闻(事实)与量化(价格行为)相互矛盾**→强调这一事实本身。
  这说明价格已提前反映了新闻,或新闻尚未反映到价格中

### 第4步:给出行动候选项

依据`references/action-framework.md`遵循以下格式:

- **行动候选项**:持有/减仓/加仓/考虑止损/继续观察中的1~2项
- 明确列出每个候选项的**依据与反方论点**
- **反证条件**:必须包含"若观察到X,则此评估失效"
- 明确说明最终决定权在用户手中。不使用买入/卖出的指令性用语

### 第5步:更新状态

将`assets/portfolio.json`中的`last_review`更新为今天的日期,
并在`review_log`数组中追加一行摘要(用于下次评审计算"与昨天相比
的变化量")。日志仅保留最近10条。

## 指导原则

- 没有触发条件就保持沉默。每天都输出长篇分析是一种噪音。
- 不要随意为三个来源分配权重。不一致的情况应如实报告为不一致。
- 所有数值都必须标注查询时间。
- 风险限额(T3)违规必须在其他所有触发条件之前,以突出方式报告。
- 最后一行必须明确说明该技能的输出是决策参考材料,而非投资建议。
```

### 5.2 assets/portfolio.json(示例)

```json
{
  "base_currency": "KRW",
  "last_review": null,
  "risk_limits": {
    "single_position_max_pct": 20,
    "daily_drawdown_alert_pct": -3.0,
    "portfolio_drawdown_alert_pct": -5.0
  },
  "positions": [
    {
      "ticker": "005930.KS",
      "name": "三星电子",
      "asset_class": "equity_kr",
      "qty": 100,
      "avg_price": 72000,
      "thesis": "HBM周期"
    },
    {
      "ticker": "NVDA",
      "name": "英伟达",
      "asset_class": "equity_us",
      "qty": 10,
      "avg_price": 118.5,
      "thesis": "AI基础设施资本开支"
    },
    {
      "ticker": "BTC",
      "name": "比特币",
      "asset_class": "crypto",
      "qty": 0.5,
      "avg_price": 61000000,
      "thesis": "宏观对冲"
    }
  ],
  "review_log": []
}
```

### 5.3 references/trigger-rules.md

```markdown
# 变化触发条件定义

"发生了有意义的变化"意味着满足以下量化条件中的**一项或多项**。
不将LLM的主观判断("感觉跌得挺多")用作触发条件。

| 触发条件 | 条件 | 优先级 |
|---|---|---|
| **T1** 个股急剧波动 | 股票日涨跌幅绝对值≥3%(加密货币为≥7%) | 中 |
| **T2** 投资组合波动 | 总市值日涨跌幅绝对值≥2% | 高 |
| **T3** 风险限额 | 违反`risk_limits`中的项目(超出仓位比例、达到亏损限额) | **最高** |
| **T4** 事件 | 与持仓股票相关的一次信息源重大新闻(财报发布/指引变更、监管、安全事件·黑客攻击、退市/停牌事项、大规模增发·可转债) | 高 |
| **T5** 波动率跳升 | 股票历史波动率(20日)较前一日上升50%以上 | 中 |

## 判定规则

- 多个触发条件同时触发时,**优先级高的先报告**。
- T3(风险限额)应在其他分析之前,以独立的警告区块单独报告。
- 按资产类别差异化设定阈值:加密货币的基础波动率较高,因此T1阈值
  上调为7%。若用户在`portfolio.json`中添加`trigger_overrides`,
  则以该值为优先。
- 必须记录用于判定触发条件的当前价格和查询时间。
- 交易时段内查询时:日涨跌幅按前一交易日收盘价计算,并标注为
  "交易时段内数据"。

## 非触发情况(不进行分析的情况)

- 当整体指数朝同一方向变动、个股仅是单纯跟随大盘同步波动时
  (若个股涨跌幅与基准指数涨跌幅之差的绝对值<1.5个百分点,
  即便T1被触发,也降级为"市场同步波动",仅提供简要报告)
- 成交量低于20日平均值50%的小幅波动
```

### 5.4 references/sentiment-guide.md

```markdown
# 社交媒体情绪解读指南

社交媒体既是信息来源,也是**群体心理的温度计**。不应将其直接用作方向性
信号,而应按以下规则进行解读。

## 采集对象

- X(推特):股票代码/关键词的提及量及论调
- Reddit:r/stocks、r/wallstreetbets以及各股票专属子版块(美股)
- 国内:股票讨论区氛围、主要投资社区(韩股)
- 加密货币:X+Telegram频道氛围

只采集通过网页搜索能够确认的范围。无法访问的来源应记录为"无法确认",
不进行推测。

## 解读规则

### 1. 将方向与强度分开

- 方向:正面/中性/负面
- 强度:弱(正常水平)/中(提及量增加)/强(提及量急剧增加+论调出现倾斜)

### 2. 极端倾向是潜在的反向指标

- **极端恐慌**(恐慌性抛售的提及、"完了"论调占主导):可能是短期底部信号
- **极端狂热**(晒收益的帖子激增、"必涨"论调占主导):可能是短期过热信号
- 以上两种情况都必须在矩阵中标注"极端倾向——存在反向指标可能性"

### 3. 提及量急剧增加本身就是信号

无论论调如何,若提及量骤增至平时的数倍,应单独标注为波动性扩大信号。

### 4. 检查是否存在操纵可能性

- 新注册账号/机器人模式的单方向帖子激增→标注"可能存在拉盘/FUD攻击活动"
- 尤其在小盘股·加密货币领域,来源不明的利好/利空传闻在得到一次信息源
  确认之前,只能归类为社交媒体([C]来源),而非新闻([B]来源)

### 5. 引用原则

- 不指名引用具体账号或用户
- 只报告汇总后的方向/强度/提及量变化
```

### 5.5 references/action-framework.md

````markdown
# 行动框架

将评估结果映射为行动候选项的标准。**只提出候选项**,最终决定权在用户
手中。不使用买入/卖出的指令性用语。

## 5种行动候选项

| 候选项 | 提出条件(示例) |
|---|---|
| **持有** | 三来源中性至正面,thesis(投资论点)未受损 |
| **继续观察** | 各来源之间2:1分裂,或原因不明的波动 |
| **减仓** | 三来源一致负面+thesis部分受损,或T3仓位超出限额 |
| **加仓** | 三来源一致正面+价格下跌(此前预期已消化)+仍有限额空间 |
| **考虑止损** | 出现使thesis本身失效的一次信息源事实(例如:核心业务监管已确定) |

## 输出格式(必需)

针对每个触发条件被触发的股票代码:

```
### {股票名称} ({股票代码}) — 触发条件: {T1~T5}

**交叉验证矩阵**
| 来源 | 方向 | 强度 | 核心依据 |
|---|---|---|---|
| 量化 | | | |
| 新闻 | | | |
| 社交媒体 | | | |

**一致性**:{三来源一致 / 2:1分裂 / 完全不一致}

**行动候选项**:{1~2项}
- 依据:
- 反方论点:

**反证条件**:{若观察到X,则此评估失效}

**thesis检查**:已登记的投资论点"{thesis}"目前{有效/部分受损/已失效}
```

## 核心原则

1. **论点优先**:先检查投资论点的有效性,再看价格变化。
   即便价格下跌,只要thesis仍然有效,默认应为"持有+观察"。
2. **必须包含反方论点**:任何候选项都不得在没有反方论点的情况下提出。
3. **必须包含反证条件**:无法被反证的评估不是真正的评估。
4. **限额优先**:当T3(风险限额)被违反时,无论其他来源多么正面,
   都必须包含以遵守限额为目的的候选项(减仓)。
5. 最后一行须声明:"本评审为决策参考材料,不构成投资建议。"
````

### 5.6 scripts/check_triggers.py

```python
#!/usr/bin/env python3
"""
投资组合触发条件判定脚本。

触发条件定义必须与references/trigger-rules.md保持同步。
用法:
    python check_triggers.py --portfolio ../assets/portfolio.json --prices prices.json

prices.json格式(填入Claude通过网页搜索采集的当前价格):
{
  "005930.KS": {"price": 74500, "prev_close": 76900, "benchmark_change_pct": -0.8},
  "NVDA":      {"price": 121.2, "prev_close": 126.5, "benchmark_change_pct": -1.1},
  "BTC":       {"price": 95000000, "prev_close": 93000000, "benchmark_change_pct": null}
}
"""

import argparse
import json
import sys
from datetime import date

T1_EQUITY_PCT = 3.0     # 个股急剧波动(股票)
T1_CRYPTO_PCT = 7.0     # 个股急剧波动(加密货币)
T2_PORTFOLIO_PCT = 2.0  # 投资组合整体波动
MARKET_SYNC_BAND = 1.5  # 市场同步判定区间(百分点)


def pct(a, b):
    return (a - b) / b * 100.0 if b else 0.0


def check(portfolio: dict, prices: dict) -> dict:
    triggers = []
    total_now, total_prev = 0.0, 0.0
    limits = portfolio.get("risk_limits", {})

    # 汇总市值
    values = {}
    for p in portfolio.get("positions", []):
        t = p["ticker"]
        if t not in prices:
            triggers.append({"type": "DATA_MISSING", "ticker": t,
                             "msg": "当前价格未确认 — 需通过网页搜索采集"})
            continue
        now = p["qty"] * prices[t]["price"]
        prev = p["qty"] * prices[t]["prev_close"]
        values[t] = now
        total_now += now
        total_prev += prev

    # T1 / T5 个股
    for p in portfolio.get("positions", []):
        t = p["ticker"]
        if t not in prices:
            continue
        d = pct(prices[t]["price"], prices[t]["prev_close"])
        limit = T1_CRYPTO_PCT if p.get("asset_class") == "crypto" else T1_EQUITY_PCT
        if abs(d) >= limit:
            bench = prices[t].get("benchmark_change_pct")
            sync = bench is not None and abs(d - bench) < MARKET_SYNC_BAND
            triggers.append({
                "type": "T1", "priority": "MID", "ticker": t,
                "change_pct": round(d, 2),
                "market_sync": sync,
                "msg": f"{p['name']} 日涨跌 {d:+.2f}%"
                       + (" (市场同步 — 简要报告)" if sync else ""),
            })

    # T2 投资组合
    if total_prev:
        pd = pct(total_now, total_prev)
        if abs(pd) >= T2_PORTFOLIO_PCT:
            triggers.append({"type": "T2", "priority": "HIGH",
                             "change_pct": round(pd, 2),
                             "msg": f"投资组合市值日涨跌 {pd:+.2f}%"})

    # T3 风险限额
    max_pct = limits.get("single_position_max_pct")
    if max_pct and total_now:
        for t, v in values.items():
            w = v / total_now * 100.0
            if w > max_pct:
                triggers.append({"type": "T3", "priority": "CRITICAL", "ticker": t,
                                 "weight_pct": round(w, 1),
                                 "msg": f"{t} 仓位 {w:.1f}% > 限额 {max_pct}%"})

    dd = limits.get("portfolio_drawdown_alert_pct")
    if dd is not None and total_prev:
        pd = pct(total_now, total_prev)
        if pd <= dd:
            triggers.append({"type": "T3", "priority": "CRITICAL",
                             "msg": f"投资组合日涨跌 {pd:+.2f}% ≤ 亏损限额 {dd}%"})

    order = {"CRITICAL": 0, "HIGH": 1, "MID": 2}
    triggers.sort(key=lambda x: order.get(x.get("priority", "MID"), 3))

    return {
        "date": date.today().isoformat(),
        "portfolio_value": round(total_now, 2),
        "portfolio_change_pct": round(pct(total_now, total_prev), 2) if total_prev else None,
        "triggered": bool([t for t in triggers if t["type"].startswith("T")]),
        "triggers": triggers,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--portfolio", required=True)
    ap.add_argument("--prices", required=True)
    args = ap.parse_args()

    with open(args.portfolio, encoding="utf-8") as f:
        portfolio = json.load(f)
    with open(args.prices, encoding="utf-8") as f:
        prices = json.load(f)

    result = check(portfolio, prices)
    json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
    print()


if __name__ == "__main__":
    main()
```

---

## 6. 单独测试脚本

即使没有Claude,也可以验证触发条件判定逻辑:

```bash
cat > prices.json << 'EOF'
{
  "005930.KS": {"price": 74500, "prev_close": 76900, "benchmark_change_pct": -0.8},
  "NVDA": {"price": 121.2, "prev_close": 126.5, "benchmark_change_pct": -1.1},
  "BTC": {"price": 95000000, "prev_close": 93000000, "benchmark_change_pct": null}
}
EOF
python3 scripts/check_triggers.py --portfolio assets/portfolio.json --prices prices.json
```

示例运行结果:BTC仓位86.4% > 限额20% → **T3(CRITICAL)排在最前**,
三星电子-3.12% / NVDA-4.19% → 触发T1。已确认优先级排序
(CRITICAL > HIGH > MID)运行正常。

---

## 7. 使用示例

```
> 帮我评审一下今天的投资组合

[portfolio-daily-review激活]
1. 加载portfolio.json → 3个持仓,检查last_review
2. 网页搜索行情 → NVDA -4.2%(T1),其余无触发
3. 仅针对NVDA采集三来源:量化(动量/行业相对强度) / 新闻(一次信息源) / 社交媒体(方向·强度)
4. 交叉验证矩阵 → 判定一致性 → 行动候选项+反证条件
5. 检查"AI基础设施资本开支"这一论点是否仍然有效
6. 更新last_review + 记录review_log
```

没有触发条件的日子:

```
> 帮我评审一下今天的投资组合
当前价格表 + "无触发条件,无需操作。"(结束)
```

---

## 8. 自定义要点

| 项目 | 位置 | 默认值 | 备注 |
|---|---|---|---|
| 个股急剧波动阈值(T1) | trigger-rules.md、check_triggers.py | 股票±3% / 加密货币±7% | 两处必须同步修改 |
| 投资组合波动阈值(T2) | 同上 | ±2% | |
| 风险限额(T3) | portfolio.json `risk_limits` | 仓位20% / 日跌幅-3% / 整体-5% | 只需修改该文件即可 |
| 市场同步区间 | check_triggers.py `MARKET_SYNC_BAND` | 1.5个百分点 | |
| 评审日志保留条数 | SKILL.md第5步 | 10条 | |

> **注意**:修改阈值时,必须同时更新`trigger-rules.md`(Claude读取的规则)
> 与`check_triggers.py`(脚本中的常量)。若两者不一致,脚本运行环境与
> 非脚本环境下的判定结果将会不同。

---

## 9. 与quant-market-brief配合使用

```
早间流程:
1. "总结一下今天的市场情况"       → quant-market-brief:市场机制判定
2. "评审一下我的投资组合"         → portfolio-daily-review:在同一对话
                                       第2步[A]量化来源中复用该市场机制判定
```

在同一对话中按此顺序依次执行,市场机制上下文会自动衔接。
若不存在简报,该技能会改用简化的市场机制判定,并标注为"简化"。

---

## 10. 注意事项

- 本技能的输出**是决策参考材料,而非投资建议。** 最终决定权在用户手中。
- 请不要在`portfolio.json`中填入实际账号、券商认证信息等敏感数据。
  仅填写股票代码、数量、平均成本即已足够。若要提交到公开仓库,建议对实际
  投资组合文件进行`.gitignore`处理。
- 该技能仅用于演示/教育目的,实际使用前请在自己的环境中充分测试。
