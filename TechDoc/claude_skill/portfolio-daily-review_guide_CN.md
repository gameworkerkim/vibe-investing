---
title: "portfolio-daily-review 安装与使用指南"
description: "一款每天检查一次投资组合的Claude Skill,当量化触发条件命中时,交叉验证量化、新闻、社交媒体三个来源以生成投资决策依据。包含完整安装方法、文件全文及自定义要点。"
keywords:
  - "Claude Skill"
  - "投资组合每日复盘"
  - "组合监控"
  - "量化触发规则"
  - "Claude Code 技能"
  - "交叉验证"
  - "投资决策支持"
lang: zh
featured: false
schema_type: TechArticle
---

# portfolio-daily-review 安装与使用指南

> 一款每天检查一次投资组合的Claude Skill,当量化触发条件命中时,
> 会交叉验证量化、新闻、社交媒体三个独立来源,生成投资决策依据。
> 关于概念与设计背景,请参见[Claude_skill_guide.md](./Claude_skill_guide.md)第6章

---

## 1. 这个技能能做什么

- **触发短语**:"查一下我的投资组合"、"我的账户怎么样"、"今日复盘"、"检查一下我的持仓"、"需要再平衡吗?"、"每日检查"
- **核心动作**:
  1. 从`assets/portfolio.json`加载持仓、平均成本、风险限额(无需每次重新输入)
  2. 通过网络搜索更新当前价格,判定**量化触发条件(T1~T5)**
  3. **若未触发任何条件→仅用一行"无异常"结束**(阻断噪音是本技能的第一原则)
  4. 仅在触发时,独立收集量化/新闻/社交媒体**3个来源→交叉验证矩阵**
  5. 提出行动候选(持有/减仓/加仓/考虑止损/继续观察)+反方论据+反证条件
  6. 更新`last_review`并记录复盘日志(用于计算下次复盘的变化量)

**三大设计特点**

- **"变动"的定义不交由LLM自由裁量**——由trigger-rules.md的量化规则加判定脚本固定
- **市场同步过滤器**——若个股波动与基准指数相差在1.5个百分点以内,则降级为"市场同步波动",仅给出简要报告(防止每逢指数下跌日就对每个个股都输出长篇分析,造成噪音)
- **投资论点优先**——先核查已登记投资论点的有效性,而非先看价格变动。社交媒体的极端情绪偏向仅作为反向指标候选处理

---

## 2. 安装方法

从以下三种方式中任选一种。

### 方式A:Claude.ai(网页/App)——推荐

1. 将本仓库的技能文件夹整体打包为zip,或准备已分发的`.skill`文件。
   ```bash
   # 若直接从文件夹创建(zip与.skill格式相同)
   zip -r portfolio-daily-review.skill portfolio-daily-review/
   ```
2. 在Claude.ai的**Settings → Capabilities → Skills**中上传。(需付费计划)
3. 上传后,在新对话中说出触发短语即可自动激活。

### 方式B:Claude Code

将整个文件夹复制到个人技能目录:

```bash
cp -r portfolio-daily-review/ ~/.claude/skills/portfolio-daily-review/
```

重启Claude Code后,只需用自然语言提及即可使用。

### 方式C:Claude API

参考[Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill)
上传`.skill`包,即可在API调用中以相同方式工作。

> **验证小技巧**:安装后询问"告诉我现在可用的技能",即可确认是否成功加载。


---

## 3. 文件夹结构

```
portfolio-daily-review/
├── SKILL.md                      # 工作流主体(第0~5步)
├── assets/
│   └── portfolio.json            # 投资组合状态(安装后替换为你自己的数据)
├── references/
│   ├── trigger-rules.md          # T1~T5量化触发条件定义
│   ├── sentiment-guide.md        # 社交媒体解读规则(反向指标·操纵检查)
│   └── action-framework.md       # 5种行动候选的映射+输出格式
└── scripts/
    └── check_triggers.py         # 触发条件判定脚本(已通过执行验证)
```

---

## 4. 初始设置(重要)

安装后`assets/portfolio.json`中的内容为**示例数据**。请通过以下两种方式之一进行替换:

**通过对话**:首次请求复盘时,技能会询问你的持仓、数量、平均成本并填入文件。
或者你也可以直接说,例如"更新我的投资组合:三星电子200股,平均成本71,000韩元,……"。

**直接编辑文件**:请遵循以下schema。务必填写`thesis`(投资论点)字段——
这是判定行动方案时比价格更先被检查的项目。

---

## 5. 文件全文

将以下内容原样复制并保存为相同的文件夹结构,即可完成技能配置。

### 5.1 SKILL.md

```markdown
---
name: portfolio-daily-review
description: >
  每天检查一次用户投资组合的技能,当预定义的变动触发条件命中时,
  综合量化分析、市场新闻、社交媒体情绪三个来源生成投资决策依据。
  当用户提及"查一下我的投资组合"、"我的账户怎么样"、"今日复盘"、
  "检查一下我的持仓"、"需要再平衡吗?"、"每日检查"等内容时,必须使用
  该技能。投资组合状态从assets/portfolio.json中读取,若用户提到
  持仓/数量的变更,更新该文件也由本技能处理。
---

# Portfolio Daily Review

## 目标

用规则而非情绪来复盘投资组合。若未触发任何条件,仅用一行"无异常"结束;
仅在触发时,执行量化/新闻/社交媒体三来源的综合评估。

原则:**触发条件用量化规则判定,各来源独立收集后再交叉验证,
结论以行动候选+反证条件呈现。**

## 工作流

### 第0步:加载状态

读取`assets/portfolio.json`。

- 若`last_review`为今天的日期:告知用户"今日复盘已完成",
  并询问是否需要重新执行(每日一次原则)。
- 若文件为空或没有`positions`:向用户询问持仓、数量、平均成本,
  先填写该文件。同时确认风险限额(`risk_limits`)。
- 若用户提及类似"我又加了50股三星电子"的变更,更新文件并
  总结变更内容以供确认。

### 第1步:更新行情并判定触发条件

通过网络搜索确认每个持仓的当前价格。不要凭训练数据中记忆的
价格作答。

按照`references/trigger-rules.md`中的量化规则(T1~T5)进行判定。
若环境中`scripts/check_triggers.py`可执行,则用脚本判定;
否则依照规则文档手动计算。

**若未触发任何条件**:仅用当前价格表+"无触发条件,无需采取行动"结束。
不生成不必要的分析。这是本技能最重要的规则。

### 第2步:收集3个来源(仅针对已触发的持仓)

**独立地**收集每个来源,收集阶段不得相互混合。

**[A]量化视角**
- 该持仓的因子状态:1个月/3个月动量、行业相对强度、波动率变化
- 与市场状态的一致性——若已安装`quant-market-brief`技能且
  今日简报已在对话中,复用该状态判定。若没有,则仅用
  VIX/利率/指数进行简化状态判定,并标注为"简化"。

**[B]市场新闻**
- 通过网络搜索确定引发触发的新闻。
- 优先采用一级来源(公告、财报发布、监管机构发布)。将推测性文章与
  事实区分标注。若无法确定原因新闻,则记录为"原因不明的价格变动"——
  这本身也是重要信息。

**[C]社交媒体情绪**
- 通过网络搜索了解X(Twitter)、Reddit及国内社区的反应方向与强度。
- 必须先阅读`references/sentiment-guide.md`。核心要点:社交媒体
  可能是反向指标。极端偏向(恐惧/狂热)本身即是一种信号,
  不应直接作为方向性信号使用。
- 不指名引用具体账号,只讨论汇总后的方向/强度。

### 第3步:交叉验证与综合评估

将三个来源的方向一致性整理为矩阵:

| 来源 | 方向 | 强度 | 核心依据 |
|---|---|---|---|
| 量化 | 正面/中立/负面 | 强/中/弱 | |
| 新闻 | | | 标注是否为一级来源 |
| 社交媒体 | | | 若存在极端偏向,标注反向指标可能性 |

- **三者一致**→标注为高置信度
- **2:1分裂**→必须在正文中保留少数意见的依据
- **新闻(事实)与量化(价格行为)相冲突**→强调这一事实本身。
  这意味着价格已提前反映新闻,或新闻尚未反映到价格中

### 第4步:提出行动候选

按照`references/action-framework.md`遵循以下格式:

- **行动候选**:持有/减仓/加仓/考虑止损/继续观察中的1~2项
- 每个候选都**同时**说明依据和反方论据
- 必须包含**反证条件**:"若观察到X,则该评估失效"
- 说明最终决定权在用户手中。不使用买入/卖出的指令性措辞

### 第5步:更新状态

将`assets/portfolio.json`中的`last_review`更新为今天的日期,
并在`review_log`数组中追加一行摘要(用于下次复盘计算
"与昨日相比的变化")。日志仅保留最近10条。

## 指导原则

- 若未触发条件则保持沉默。每天都输出长篇分析就是噪音。
- 不要随意为三个来源分配权重。不一致就报告为不一致。
- 所有数值都要注明查询时间。
- 风险限额(T3)违规须在其他所有触发条件之前、以显著方式报告。
- 在最后一行注明本技能的输出为决策依据,而非投资建议。
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
      "thesis": "AI基础设施资本支出"
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
# 变动触发条件定义

"发生变动"指满足以下量化条件中的**任意一项以上**。
不将LLM的主观判断("感觉跌得挺多")作为触发条件使用。

| 触发条件 | 条件 | 优先级 |
|---|---|---|
| **T1** 个股急剧波动 | 个股日涨跌幅绝对值≥3%(加密货币≥7%) | 中 |
| **T2** 组合整体波动 | 组合总市值日涨跌幅绝对值≥2% | 高 |
| **T3** 风险限额 | 违反`risk_limits`中的项目(超出仓位比例、达到亏损限额) | **最高** |
| **T4** 事件 | 与持仓相关的一级来源重大新闻(财报发布/指引变更、监管、安全事件·被黑、摘牌/停牌问题、大规模增发·可转债) | 高 |
| **T5** 波动率跳升 | 个股20日历史波动率较前一日上升50%以上 | 中 |

## 判定规则

- 若多个触发条件同时命中,**按优先级从高到低**报告。
- T3(风险限额)须在其他分析之前,以独立的警告区块报告。
- 按资产类别差异化阈值:加密货币基础波动率较高,T1阈值上调至7%。
  若用户在`portfolio.json`中添加了`trigger_overrides`,则优先使用该值。
- 必须记录用于触发判定的当前价格及查询时间。
- 若在交易时段内查询:日涨跌幅按较前一交易日收盘价计算,并标注"盘中基准"。

## 非触发情形(不进行分析的情况)

- 当整体指数朝同一方向变动、个股仅是简单同步波动时
  (若|个股涨跌幅 − 基准涨跌幅|<1.5个百分点,即便T1已命中,
  也降级为"市场同步波动",仅给出简要报告)
- 成交量低于20日均量50%的小幅波动
```

### 5.4 references/sentiment-guide.md

```markdown
# 社交媒体情绪解读指南

社交媒体既是信息源,也是**群体心理的温度计**。不应直接将其用作方向性信号,
而应按以下规则进行解读。

## 收集范围

- X(Twitter):个股代码/关键词的提及量与语调
- Reddit:r/stocks、r/wallstreetbets、个股相关subreddit(美股)
- 国内:股票讨论区氛围、主要投资社区(韩股)
- 加密货币:X + Telegram频道氛围

仅收集通过网络搜索可以确认的范围。无法访问的来源标注为
"无法确认",不做猜测。

## 解读规则

### 1. 将方向与强度分开

- 方向:正面/中立/负面
- 强度:弱(平常水平)/中(提及量增加)/强(提及量骤增+语调一边倒)

### 2. 极端偏向是反向指标候选

- **极端恐惧**(充斥恐慌性抛售言论、"完了"式论调占主导):可能是短期底部信号
- **极端狂热**(晒收益截图激增、"无条件上涨"式论调占主导):可能是短期过热信号
- 两种情况都必须在矩阵中同时注明"极端偏向——存在反向指标可能性"

### 3. 提及量骤增本身即为信号

无论语调如何,若提及量骤增至平常的数倍,应单独标注为波动率扩大的信号。

### 4. 检查操纵可能性

- 新注册账号/机器人模式的单向发帖骤增→标注"可能存在拉盘/FUD行动"
- 尤其对小盘股与加密货币,来源不明的利好/利空传闻在得到一级来源确认前,
  只能归类为社交媒体([C]来源),不能归类为新闻([B]来源)

### 5. 引用原则

- 不指名引用具体账号或用户
- 只报告汇总后的方向/强度/提及量变化
```

### 5.5 references/action-framework.md

````markdown
# 行动框架

将评估结果映射为行动候选的标准。**仅止步于提出候选**,
最终决定权在用户手中。不使用买入/卖出的指令性措辞。

## 5种行动候选

| 候选 | 提出条件(示例) |
|---|---|
| **持有** | 三个来源中立至正面,投资论点(thesis)未受损 |
| **继续观察** | 来源之间2:1分裂,或原因不明的波动 |
| **减仓** | 三个来源一致负面+投资论点部分受损,或T3仓位限额超限 |
| **加仓** | 三个来源一致正面+价格下跌(此前提前反映已消化)+限额尚有余地 |
| **考虑止损** | 出现使投资论点本身失效的一级来源事实(例如核心业务监管已确定) |

## 输出格式(必需)

针对每个触发的持仓:

```
### {股票名称} ({代码}) — 触发条件: {T1~T5}

**交叉验证矩阵**
| 来源 | 方向 | 强度 | 核心依据 |
|---|---|---|---|
| 量化 | | | |
| 新闻 | | | |
| 社交媒体 | | | |

**一致度**: {三来源一致 / 2:1分裂 / 完全不一致}

**行动候选**: {1~2项}
- 依据: 
- 反方论据: 

**反证条件**: {若观察到X,则该评估失效}

**投资论点检查**: 已登记的投资论点"{thesis}"目前{有效/部分受损/已失效}
```

## 核心原则

1. **投资论点优先**:先核查投资论点的有效性,而非先看价格变动。
   若价格下跌但论点仍然有效,默认值为"持有+观察"。
2. **必须给出反方论据**:任何候选都不得在缺少反方论据的情况下提出。
3. **必须给出反证条件**:无法被反证的评估不是评估。
4. **限额优先**:即使T3(风险限额)违规时其他来源信号再正面,
   也必须包含符合限额要求的候选(减仓)。
5. 在最后一行注明:"本次复盘为决策依据,不构成投资建议。"
````

### 5.6 scripts/check_triggers.py

```python
#!/usr/bin/env python3
"""
投资组合触发条件判定脚本。

触发条件定义须与references/trigger-rules.md保持同步。
用法:
    python check_triggers.py --portfolio ../assets/portfolio.json --prices prices.json

prices.json格式(填入Claude通过网络搜索收集到的当前价格):
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
T2_PORTFOLIO_PCT = 2.0  # 组合整体波动
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
                             "msg": "当前价格未确认——需通过网络搜索收集"})
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
                "msg": f"{p['name']} 当日 {d:+.2f}%"
                       + (" (市场同步——简要报告)" if sync else ""),
            })

    # T2 组合整体
    if total_prev:
        pd = pct(total_now, total_prev)
        if abs(pd) >= T2_PORTFOLIO_PCT:
            triggers.append({"type": "T2", "priority": "HIGH",
                             "change_pct": round(pd, 2),
                             "msg": f"组合市值当日 {pd:+.2f}%"})

    # T3 风险限额
    max_pct = limits.get("single_position_max_pct")
    if max_pct and total_now:
        for t, v in values.items():
            w = v / total_now * 100.0
            if w > max_pct:
                triggers.append({"type": "T3", "priority": "CRITICAL", "ticker": t,
                                 "weight_pct": round(w, 1),
                                 "msg": f"{t} 仓位比例 {w:.1f}% > 限额 {max_pct}%"})

    dd = limits.get("portfolio_drawdown_alert_pct")
    if dd is not None and total_prev:
        pd = pct(total_now, total_prev)
        if pd <= dd:
            triggers.append({"type": "T3", "priority": "CRITICAL",
                             "msg": f"组合当日 {pd:+.2f}% <= 亏损限额 {dd}%"})

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

## 6. 独立测试脚本

即使没有Claude,也可以验证触发判定逻辑:

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

示例执行结果:BTC仓位比例86.4% > 限额20%→**T3(CRITICAL)被排在最前**,
三星电子-3.12% / NVDA-4.19%→触发T1。已确认优先级排序(CRITICAL > HIGH > MID)
正常工作。

---

## 7. 使用示例

```
> 帮我复盘一下今天的投资组合

[portfolio-daily-review 触发]
1. 加载portfolio.json→3个持仓,检查last_review
2. 网络搜索行情→NVDA -4.2%(T1),其余无触发条件
3. 仅对NVDA收集3个来源:量化(动量/行业相对强度)/新闻(一级来源)/社交媒体(方向·强度)
4. 交叉验证矩阵→一致度判定→行动候选+反证条件
5. 检查投资论点"AI基础设施资本支出"的有效性
6. 更新last_review+记录review_log
```

无触发条件的日子:

```
> 帮我复盘一下今天的投资组合
当前价格表 + "无触发条件,无需采取行动。"(结束)
```

---

## 8. 自定义要点

| 项目 | 位置 | 默认值 | 备注 |
|---|---|---|---|
| 个股急剧波动阈值(T1) | trigger-rules.md、check_triggers.py | 股票±3% / 加密货币±7% | 两处必须同步修改 |
| 组合波动阈值(T2) | 同上 | ±2% | |
| 风险限额(T3) | portfolio.json `risk_limits` | 仓位20% / 日内-3% / 整体-5% | 只需修改该文件即可 |
| 市场同步区间 | check_triggers.py `MARKET_SYNC_BAND` | 1.5个百分点 | |
| 复盘日志保留条数 | SKILL.md 第5步 | 10条 | |

> **注意**:修改阈值时,务必同时修改`trigger-rules.md`(Claude读取的规则)
> 和`check_triggers.py`(脚本常量)。若两者不一致,脚本可执行环境与
> 不可执行环境下的判定结果会出现偏差。

---

## 9. 与quant-market-brief配合使用

```
晨间流程:
1. "总结今天的市场情况"        → quant-market-brief:市场状态判定
2. "帮我复盘一下投资组合"       → portfolio-daily-review:在同一对话中
                                   复用第2步[A]量化来源的市场状态判定
```

在同一对话中按顺序执行,市场状态上下文会自动衔接。
若没有简报,该技能会退而使用简化的市场状态判定,并标注为"简化"。

---

## 10. 注意事项

- 本技能的输出是**决策依据,而非投资建议。**最终决定权在用户手中。
- 请不要在`portfolio.json`中放入真实账号、券商认证信息等敏感数据。
  只需股票代码、数量、平均成本即可。若要提交到公开仓库,建议对
  真实投资组合文件进行`.gitignore`处理。
- 本技能用于演示/教育目的,实际使用前请在自己的环境中充分测试。
