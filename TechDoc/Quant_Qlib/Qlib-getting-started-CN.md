---
title: "Microsoft Qlib 入门指南 — 面向中文开发者的完整版(测试中的 Toss Open API 集成)"
description: "微软开源的 AI 导向量化投资平台 Qlib 的安装、工作流、基准测试与实践注意事项的完整指南"
lang: zh
featured: false
schema_type: TechArticle
date: 2026-07-05
---

# Microsoft Qlib 入门指南 — 面向中文开发者的完整版(测试中的 Toss Open API 集成)

> 最终校验日期: 2026-07-05 (基于 microsoft/qlib main 分支)
> 目标读者: 具有 Python 开发经验、初次搭建量化/ML 回测环境的开发者

---

## 1. Qlib 项目概述

**Qlib** 是微软研究院(MSRA)于 2020 年 9 月开源发布的**AI 导向量化投资平台**(AI-oriented Quantitative Investment Platform)。它涵盖了从数据处理、模型训练到回测的完整机器学习流程,覆盖了 Alpha 挖掘 → 风险建模 → 组合优化 → 订单执行的量化投资全过程。

其支持的学习范式可归纳为三类。这是微软研究院团队从最初的开发,逐步扩展为真正意义上一体化平台的案例。

| 范式 | 用途 | 代表实现 |
| :--- | :--- | :--- |
| 监督学习 (Supervised Learning) | 挖掘复杂的非线性市场模式 | LightGBM、GRU、Transformer 等 25 种以上 |
| 市场动态建模 (Market Dynamics) | 应对概念漂移(concept drift)、适应非平稳性 | DDG-DA、滚动再训练(Rolling Retraining) |
| 强化学习 (Reinforcement Learning) | 连续交易决策、订单执行优化 | PPO、OPDS (订单执行) |

此外,**RD-Agent**(基于 LLM 的自主研发智能体)也已与其结合,正朝着自动化因子挖掘与模型优化的方向演进。相关论文为 "R&D-Agent-Quant: A Multi-Agent Framework for Data-Centric Factors and Model Joint Optimization" (arXiv:2505.15155)。

项目规模: GitHub Star 约 40,000+,Fork 6,000+ (截至 2026 年)。在 Python 量化开源项目中处于顶尖水平。这个级别以下的项目基本不必再看。

---

## 2. 核心优点

### 2.1 一体化(All-in-One)流水线
数据处理 → 因子计算 → 模型训练 → 回测 → 报告分析 → 在线服务,全部在同一个框架内处理。相比过去需要组合 zipline(仅回测)、backtrader(仅策略执行)以及独立因子库的工作流,集成成本大幅降低。

### 2.2 经过验证的高性能数据基础设施
Qlib 自主设计了专门针对金融时间序列的二进制存储格式,以及两级缓存(ExpressionCache、DatasetCache)。官方基准测试(800 只股票 × 14 个因子,2007–2020 年日线数据,单 CPU 基准):

| 存储方式 | 耗时(秒) | 相较 Qlib 全缓存 |
| :--- | ---: | ---: |
| MySQL | 365.3 ± 7.5 | 慢约 49 倍 |
| InfluxDB | 368.2 ± 3.6 | 慢约 50 倍 |
| MongoDB | 253.6 ± 6.7 | 慢约 34 倍 |
| HDF5 | 184.4 ± 3.7 | 慢约 25 倍 |
| Qlib(无缓存) | 147.0 ± 8.8 | 慢约 20 倍 |
| Qlib(+ExpressionCache) | 47.6 ± 1.0 | 慢约 6 倍 |
| **Qlib(+Expression +Dataset 缓存)** | **7.4 ± 0.3** | 基准 |

在 64 核 CPU 并行环境下,即使不使用缓存也只需 8.8 秒,仅使用 ExpressionCache 便可缩短至 4.2 秒。MSRA 的分析认为,通用数据库由于多层接口和不必要的格式转换,在加载金融数据方面存在结构性劣势。
笔者也认同这一点。ExpressionCache 的性能在金融量化场景中确实具有压倒性优势。

### 2.3 基于表达式的因子引擎
只需用类似 `Ref($close, 1)/$close - 1` 这样的字符串表达式定义因子,引擎便会自动处理向量化运算与缓存。相比直接用 pandas 组合 rolling/shift,代码更简洁,并且得益于缓存复用,在重复实验时速度尤其突出。

### 2.4 可复现论文结果的模型库 (Model Zoo)
从 LightGBM、XGBoost、CatBoost 等 GBDT 系列,到 LSTM、GRU、ALSTM、GATs、Transformer、Localformer、TRA、TCN、ADARNN、ADD、IGMTF、HIST、KRNN、Sandwich、TabNet、DoubleEnsemble、TCTS、SFM、TFT 等 25 种以上 SOTA 模型,均在相同数据集(Alpha158/Alpha360)与相同回测条件下实现,可直接进行比较。称其为"唯一能够直接复现论文数据的量化框架"并不夸张。

### 2.5 内置应对市场非平稳性(Non-stationarity)的工具
提供应对金融数据分布变化(regime change)的滚动再训练(Rolling Retraining)以及基于元学习的 DDG-DA,并附带相应基准测试。这一部分是其他开源回测框架几乎不具备的 Qlib 独有领域。

### 2.6 通过 RD-Agent 实现自动化研发
LLM 可自主执行"因子假设生成 → 代码实现 → 回测 → 结果评估 → 改进"的循环。还支持从研究报告(PDF)中提取因子并实现的场景。演示地址: rdagent.azurewebsites.net

---

## 3. 同类项目对比

| 项目 | 性质 | 相对 Qlib 的定位 |
| :--- | :--- | :--- |
| **zipline / zipline-reloaded** | 事件驱动回测框架 | 专注回测。无 ML 流水线、无因子引擎。Quantopian 关闭后由社区维护 |
| **backtrader** | 事件驱动回测框架 | 策略逻辑实现能力强,ML 集成需手动完成。用户群体较大 |
| **vectorbt** | 向量化回测框架 | 速度非常快,但并非因子研究或模型训练框架 |
| **QuantConnect (LEAN)** | 云端量化平台 | 实盘交易集成能力强,支持 C#/Python。开放式研究的可复现性上 Qlib 更具优势 |
| **Qbot / QuantMind / qlib-learning** | 基于 Qlib 的上层应用 | 以 Qlib 为核心引擎的衍生项目,适合快速体验 |

综上,Qlib 在**"AI 模型研究 + 回测一体化"**这一定位上几乎没有竞争对手。但**实盘订单执行**(券商 API)不在其范围内,若要走到实盘交易,需要自行搭建单独的执行层。

---

## 4. 安装 (Getting Started)

### 4.1 环境要求

| 项目 | 内容 |
| :--- | :--- |
| 操作系统 | Linux、Windows、macOS(推荐 Linux —— `run_all_model.py` 等部分脚本仅支持 Linux) |
| Python | 官方支持 **3.8~3.12** |
| 包管理 | 强烈推荐使用 Conda(使用系统 Python 可能因缺少头文件而导致构建失败) |
| 必需依赖 | numpy、cython、lightgbm、pytorch(使用深度学习模型时) |

```bash
conda create -n qlib python=3.10
conda activate qlib
```

### 4.2 三种安装方式

**方式一: pip(稳定版,推荐)**
```bash
pip install pyqlib
```

**方式二: 源码安装(需要 main 分支最新功能时)**
```bash
pip install numpy
pip install --upgrade cython

git clone https://github.com/microsoft/qlib.git && cd qlib
pip install .            # 参与开发时: pip install -e ".[dev]"
```
> 注意: 旧版文档中的 `python setup.py install` 方式已被弃用(deprecated)。请务必使用 `pip install .`。

**方式三: Docker(环境隔离)**
```bash
docker pull pyqlib/qlib_image_stable:stable
docker run -it --name qlib -v <本地目录>:/app pyqlib/qlib_image_stable:stable
```

**Apple Silicon (M1/M2/M3) Mac 用户**: LightGBM 构建可能因缺少 OpenMP 依赖而失败。请先执行 `brew install libomp` 后再安装。

**验证安装**:
```python
import qlib
print(qlib.__version__)   # 0.9.x
```

### 4.3 数据准备 —— 重要变更事项

> **[截至 2026 年的现状]** 由于数据安全政策收紧,**官方数据下载脚本已暂停**。官方 README 指引的替代路径是社区(chenditc)维护的 investment_data 仓库。旧版文档中的 `python scripts/get_data.py qlib_data_cn ...` 命令已不能保证正常运行。

**推荐: 社区数据集(中国 A 股,基于 TuShare,每日更新)**
```bash
wget https://github.com/chenditc/investment_data/releases/latest/download/qlib_bin.tar.gz
mkdir -p ~/.qlib/qlib_data/cn_data
tar -zxvf qlib_bin.tar.gz -C ~/.qlib/qlib_data/cn_data --strip-components=1
rm -f qlib_bin.tar.gz
```

**官方脚本(恢复后可用,基于 Yahoo Finance 爬虫)**
```bash
# 日线
python -m qlib.cli.data qlib_data --target_dir ~/.qlib/qlib_data/cn_data --region cn
# 1 分钟线
python -m qlib.cli.data qlib_data --target_dir ~/.qlib/qlib_data/cn_data_1min --region cn --interval 1min
```

**数据完整性检查**(建议作为常规习惯):
```bash
python scripts/check_data_health.py check_data --qlib_dir ~/.qlib/qlib_data/cn_data
```

### 4.4 初始化

```python
import qlib
from qlib.constant import REG_CN   # 旧版路径: qlib.config —— 现为 qlib.constant

provider_uri = "~/.qlib/qlib_data/cn_data"
qlib.init(provider_uri=provider_uri, region=REG_CN)
```

`region` 支持 `REG_CN`(中国)、`REG_US`(美国)、`REG_TW`(台湾)。region 设置不仅影响数据路径,还会影响**交易约束规则**(如中国的涨跌停限制、T+1、最小交易单位等),因此使用自定义市场数据时,必须在回测配置中单独核实交易规则。

---

## 5. 运行第一个工作流

### 5.1 使用 qrun 自动执行(基于配置文件)

`qrun` 可通过一份 YAML 文件自动完成数据集构建 → 模型训练 → 信号生成 → 回测 → 评估的全过程。

```bash
cd examples    # 注意: 若在 qlib 源码根目录执行会导致 import 冲突
qrun benchmarks/LightGBM/workflow_config_lightgbm_Alpha158.yaml
```

执行结果示例(CSI300 + Alpha158 + LightGBM,基于官方 README):

```
'The following are analysis results of the excess return without cost.'
annualized_return   0.178316    # 年化超额收益 17.83%
information_ratio   1.996555
max_drawdown       -0.081806

'The following are analysis results of the excess return with cost.'
annualized_return   0.128982    # 计入交易成本后为 12.90%
information_ratio   1.444287
max_drawdown       -0.091078
```

请注意,是否计入交易成本会导致年化收益率相差约 5 个百分点。该框架通过默认输出展示了**为何不能直接相信未计入成本的回测数值**。

### 5.2 基于代码的自定义工作流

如果 qrun 的自动化工作流不适用,可以按模块自行组装。最小示例如下:

```python
import qlib
from qlib.constant import REG_CN
from qlib.utils import init_instance_by_config
from qlib.workflow import R
from qlib.workflow.record_temp import SignalRecord, PortAnaRecord

qlib.init(provider_uri="~/.qlib/qlib_data/cn_data", region=REG_CN)

market = "csi300"
benchmark = "SH000300"

data_handler_config = {
    "start_time": "2008-01-01",
    "end_time": "2020-08-01",
    "fit_start_time": "2008-01-01",
    "fit_end_time": "2014-12-31",
    "instruments": market,
}

task = {
    "model": {
        "class": "LGBModel",
        "module_path": "qlib.contrib.model.gbdt",
        "kwargs": {"loss": "mse", "num_leaves": 210, "learning_rate": 0.05},
    },
    "dataset": {
        "class": "DatasetH",
        "module_path": "qlib.data.dataset",
        "kwargs": {
            "handler": {
                "class": "Alpha158",
                "module_path": "qlib.contrib.data.handler",
                "kwargs": data_handler_config,
            },
            "segments": {
                "train": ("2008-01-01", "2014-12-31"),
                "valid": ("2015-01-01", "2016-12-31"),
                "test":  ("2017-01-01", "2020-08-01"),
            },
        },
    },
}

model = init_instance_by_config(task["model"])
dataset = init_instance_by_config(task["dataset"])

with R.start(experiment_name="my_first_workflow"):
    model.fit(dataset)
    R.save_objects(trained_model=model)
    rec = R.get_recorder()
    SignalRecord(model, dataset, rec).generate()   # 保存预测信号
```

### 5.3 使用表达式引擎直接查询数据

```python
from qlib.data import D

# 简单查询
df = D.features(
    ["SH600000"],
    ["$close", "$volume"],
    start_time="2020-01-01", end_time="2020-12-31", freq="day",
)

# 使用表达式即时定义因子: 5 日动量、20 日波动率
df = D.features(
    D.instruments("csi300"),
    ["Ref($close, 5)/$close - 1", "Std($close/Ref($close,1)-1, 20)"],
    start_time="2019-01-01", end_time="2020-12-31",
)
```

这一表达式字符串本身即是因子定义,其结果会缓存在 ExpressionCache 中,第二次调用起速度将大幅提升。

### 5.4 图形化报告

```bash
python -m pip install ".[analysis]"
jupyter notebook examples/workflow_by_code.ipynb
```
> 旧版文档中的 `examples/estimator/analyze_from_estimator.ipynb` 路径已被废弃。

Notebook 中可查看的报告包括: 分组累计收益、多空收益分布、IC/月度 IC、信号自相关性、组合回测收益曲线。

---

## 6. 基准测试 —— 模型间性能对比

### 6.1 理解数据集: Alpha158 vs Alpha360

| 数据集 | 特点 | 适合的模型 |
| :--- | :--- | :--- |
| **Alpha158** | 人工设计的 158 个因子(典型的特征工程)。特征间的空间关系较弱 | GBDT 系列(LightGBM、CatBoost 等) |
| **Alpha360** | 直接使用近 60 天的原始价格/成交量(特征工程极少)。时间轴上的空间关系较强 | 深度学习系列(GRU、ALSTM、TRA 等) |

这一区分之所以重要,是因为"**表格数据更适合 GBDT,原始时间序列更适合神经网络**"这一常见 ML 经验规律,在 Qlib 的基准测试中同样得到了印证。应根据自身因子的性质选择合适的模型系列,一味使用"当下流行的模型"效率并不高。

### 6.2 市场动态适应基准测试 (CSI500、Alpha158、2017.01–2020.08 滚动)

官方 benchmarks_dynamic 数据:

| 模型 | IC | ICIR | Rank IC | 年化收益 | IR | MDD |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| RR[Linear](滚动再训练) | 0.0945 | 0.5989 | 0.1069 | 8.57% | 1.368 | -9.86% |
| DDG-DA[Linear] | 0.0983 | 0.6157 | 0.1108 | 7.64% | 1.190 | -7.69% |
| RR[LightGBM] | 0.0816 | 0.5887 | 0.0912 | 7.71% | 1.320 | -9.09% |
| **DDG-DA[LightGBM]** | **0.0878** | **0.6185** | **0.0975** | **12.61%** | **2.010** | **-7.44%** |

要点: 将 DDG-DA(基于元学习的分布适应)与 LightGBM 结合后,相比简单的滚动再训练,年化收益提升 +4.9 个百分点,IR 从 1.32 提升到 2.01。**即使是同一个模型,采用不同的市场变化适应策略,结果也会有明显差异**,这是 Qlib 基准测试给出的核心启示。

### 6.3 全模型对比表

25 种以上模型在 Alpha158/Alpha360 上的性能对比表持续维护更新于:
`https://github.com/microsoft/qlib/blob/main/examples/benchmarks/README.md`

如需一次性运行多个模型进行直接对比(仅支持 Linux):
```bash
python run_all_model.py run 10          # 所有模型重复运行 10 次
python run_all_model.py run 3 lightgbm Alpha158 csi500   # 指定模型/数据集/股票池
```
官方文档建议,对于具有随机性的深度学习模型,至少重复运行 20 次后再取平均值。**仅凭单次运行结果判断模型优劣在统计学上是没有意义的。**

---

## 7. 面向中文开发者的实战章节: KRX(韩国)数据集成

Qlib 并未正式支持韩国市场(region 仅有 CN/US/TW)。但借助 CSV → Qlib 二进制转换工具(`dump_bin.py`),接入 KOSPI/KOSDAQ 数据并不困难。
接入 Toss Open API 也并非难事。

### 7.1 使用 pykrx 采集数据 → 生成 CSV

```python
# pip install pykrx
from pykrx import stock
import pandas as pd, os

os.makedirs("csv_kr", exist_ok=True)
tickers = stock.get_market_ticker_list(market="KOSPI")

for t in tickers[:50]:   # 示例: 前 50 只股票
    df = stock.get_market_ohlcv("20180101", "20260630", t)
    df = df.reset_index().rename(columns={
        "날짜": "date", "시가": "open", "고가": "high",
        "저가": "low", "종가": "close", "거래량": "volume",
    })
    df["symbol"] = t
    # Qlib 惯例: 用于复权价格计算的 factor 列(若为未复权数据则设为 1.0)
    df["factor"] = 1.0
    df.to_csv(f"csv_kr/{t}.csv", index=False)
```

### 7.2 转换为 Qlib 二进制格式

```bash
python scripts/dump_bin.py dump_all \
    --csv_path ./csv_kr \
    --qlib_dir ~/.qlib/qlib_data/kr_data \
    --include_fields open,close,high,low,volume,factor \
    --date_field_name date --symbol_field_name symbol
```

### 7.3 使用韩国数据时的必查清单

| 项目 | 内容 |
| :--- | :--- |
| **复权价格(factor)** | 需确认 pykrx 默认 OHLCV 的复权处理方式。若使用未反映拆股/除权除息的数据进行回测,收益率会失真 |
| **交易规则** | 使用 region=REG_CN 时会应用中国的涨跌停限制(±10%)与 T+1 规则,与韩国(±30% 价格限制,可 T+0 回转)不同,需自定义回测的 executor 设置 |
| **停牌/退市** | 为避免生存者偏差(survivorship bias),理想情况下应确保数据包含已退市股票。pykrx 主要以当前上市股票为中心,需意识到这一局限性 |
| **交易日历** | 检查 `~/.qlib/qlib_data/kr_data/calendars/day.txt` 是否已自动生成韩国的休市日历 |
| **基准指数** | 将 KOSPI200 指数作为单独的标的加入,并指定为回测基准 |
| **Alpha158 因子** | 由于因子定义本身是市场中性的,理论上可直接应用于韩国数据,但需要在韩国市场重新验证(中国 CSI300 上的 IC 表现不保证能在韩国复现) |

### 7.4 Toss Open API ↔ Qlib 集成中间件 (Node.js/TypeScript + Redis)

Qlib 本身是 Python 框架,但它实际需要的只是"符合其格式的数据"。也就是说,构建数据的流水线本身可以用任何语言编写。本节整理了使用 Node.js/TypeScript + Redis 实现的一个中间件,**从 Toss 证券 Open API 获取行情数据,规范化为上述 7.1/7.2 节的 CSV 惯例格式(`date,open,high,low,close,volume,symbol,factor`),并传递给 `dump_bin.py`**。

**该中间件的范围仅限于认证以及行情/标的数据查询。下单创建、修改、撤销等实盘交易(Trading)功能被有意排除在外。** 我们认为这部分应根据每个人的实际需求自行扩展 —— 具体原因与扩展方法请参见 7.4.6 节。

代码位于仓库的 [`TechDoc/Quant_Qlib/toss-qlib-middleware/`](./toss-qlib-middleware) 目录下(参见[韩文 README](./toss-qlib-middleware/README.md) / [英文 README](./toss-qlib-middleware/README_EN.md) / [llms.txt](./toss-qlib-middleware/llms.txt))。Toss Open API 自身的认证与端点规范,参照了本仓库已有的 [`Toss/`](../../Toss) 项目(一个实际可运行的 Toss Open API 集成仪表盘)中的 [`GUIDE.md`](../../Toss/GUIDE.md)、[`src/toss.js`](../../Toss/src/toss.js)、[`docs/Toss_OpenAPI_Guide.md`](../../Toss/docs/Toss_OpenAPI_Guide.md)。

#### 7.4.1 为什么需要中间件

Qlib 的 `dump_bin.py` 只需理解 CSV,而 Qlib 引擎只关心其后的二进制格式/缓存。相对地,Toss Open API 存在 OAuth2 认证、令牌过期、速率限制、分页等"典型 API 客户端"问题。与其把这两类关注点(认证与调用管理 vs. 因子/建模)强行塞进同一个 Python 代码库,不如让一个独立的中间件将行情数据规范化为 CSV,而 Qlib 只消费其结果,这样的结构更为清晰。

```
TOSS Open API  --OAuth2-->  [Node.js/TS 中间件]  --CSV(csv_kr/*.csv)-->  scripts/dump_bin.py  -->  ~/.qlib/qlib_data/kr_data
                                   |
                                 Redis (令牌缓存 + 行情缓存)
```

#### 7.4.2 认证 (OAuth2 Client Credentials —— 已确认的规范)

Toss 证券的 Open API 使用无需用户登录步骤的**OAuth2 Client Credentials Grant**。以下规范基于 `Toss/src/toss.js`(本仓库中已有的实际可运行集成实现)与 `Toss/docs/Toss_OpenAPI_Guide.md`(OpenAPI 规范 v1.0.3 分析文档)确认:

1. 在 Toss 证券 WTS 登录 → 设置 → Open API 菜单中申请 `client_id` / `client_secret`
2. 向 `POST {baseUrl}/oauth2/token` 以 **form-urlencoded 请求体**(而非 Basic Auth 头)发送 `grant_type=client_credentials`、`client_id`、`client_secret` → 返回 `access_token`、`expires_in`
3. 有效期为 **86,400 秒(24 小时),且没有 refresh token** —— 需要实现在过期前使用 client_secret 直接重新申请令牌的逻辑
4. 之后所有调用均需附带 `Authorization: Bearer {access_token}` 头
5. 账户/订单类的按账户调用的 API 还需额外附带 `X-Tossinvest-Account` 头(本中间件未调用账户/订单 API,因此未实现)

> **验证状态**: 官方文档(`developers.tossinvest.com/docs`)采用 JavaScript 渲染,无法直接解析,但实际向 `POST /oauth2/token` 发送上述 form-body 请求时(即使凭据错误)会返回 `{"error":"invalid_client", ...}` 这样的真实响应 —— 也就是说端点路径和请求格式本身已通过实际调用得到验证。K 线/行情响应的确切字段结构尚未最终确定,因此中间件会防御性地兼容多个候选字段名。另需注意,截至 2026 年 6 月,该服务本身仍处于预申请阶段,正式上线日期尚未确定(参见 `Toss/docs/Toss_OpenAPI_Guide.md`)。

#### 7.4.3 Redis 缓存策略

| 缓存对象 | 键 | TTL | 原因 |
| :--- | :--- | :--- | :--- |
| Access Token | `toss:access_token` | `86400 - 安全余量(默认 1 小时)` | 由于没有 refresh token,必须在远早于过期时间之前主动重新申请 |
| 令牌重新申请锁 | `toss:access_token:lock` | 10 秒(`SET NX`) | 即使多个请求同时检测到令牌过期,也只让一个请求执行重新申请,其余请求重新检查缓存,从而避免惊群效应(thundering herd) |
| 已确定的历史 K 线 | `toss:candles:{symbol}:{interval}:{start}:{end}` | 1 天(`CANDLE_TTL_HISTORICAL_SEC`) | 已收盘的 K 线数值不再变化,因此可长期缓存 |
| 当日(未确定)K 线 | 同上键名 | 短时间(`CANDLE_TTL_TODAY_SEC`,默认 30 秒) | 交易时段内当日 K 线数值持续更新,不应长时间缓存 |
| 当前价格 | `toss:price:{symbol}` | 短时间(`PRICE_TTL_SEC`,默认 5 秒) | 按标的缓存,使多个批量请求可以复用缓存 |

收到 401(令牌过期/无效)响应时会立即清空缓存并重试一次;收到 429(速率限制)时会依据 `Retry-After` 头进行退避后重试。K 线 API 每次请求最多只返回 200 条(`count`)且没有 `start`/`end` 过滤器,因此采用从最新 K 线开始、通过 `before` 游标进行逆序分页,再按升序排列的策略(与 `Toss/src/toss.js` 中的 `fetchCandles` 策略相同)。

#### 7.4.4 安装与运行

```bash
cd TechDoc/Quant_Qlib/toss-qlib-middleware
npm install
npm run setup       # 以交互方式生成 .env,并可选择立即测试实际令牌申请
npm run typecheck
npm test                # 即使没有 Redis 服务器也能通过(使用内存适配器验证逻辑)
npm run dev              # http://localhost:4000,需要实际的 Redis
```

`npm run setup`(`scripts/setup.sh`)会以交互方式让你输入 `TOSS_CLIENT_ID`/`SECRET` 等私密信息以生成 `.env`(权限设为 600),并可选择当场尝试实际调用 `/oauth2/token`,立即确认凭据是否有效。

`.env` 的核心项(使用与 `Toss/.env.example` 相同的键名):

```
TOSS_BASE_URL=https://openapi.tossinvest.com
TOSS_TOKEN_PATH=/oauth2/token
TOSS_CANDLES_PATH=/api/v1/candles
TOSS_PRICES_PATH=/api/v1/prices
REDIS_URL=redis://127.0.0.1:6379
QLIB_CSV_EXPORT_DIR=./csv_kr
```

将所有端点路径都提取为环境变量,这样路径变化时无需修改代码,只需调整 `.env` 即可。

#### 7.4.5 API 与 Qlib 流水线的连接

中间件暴露的端点:

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | `/health` | 健康检查 |
| GET | `/api/candles/:symbol?start=&end=&interval=day` | 查询规范化的 K 线 JSON(经 Redis 缓存,内置 `before` 分页) |
| GET | `/api/prices?symbols=005930,000660` | 批量查询当前价格(逗号分隔,每批最多 200 个) |
| POST | `/api/export/qlib` `{symbols, start, end, outDir?}` | 一次性查询多个标的,按 7.1 节的 CSV 格式生成 `csv_kr/{symbol}.csv` |

若不启动服务器,只想直接导出 CSV,可以使用 CLI:

```bash
npm run export:qlib -- --symbols 005930,000660 --start 2020-01-01 --end 2026-07-01
```

生成的 CSV 可直接传给 7.2 节的转换命令:

```bash
python scripts/dump_bin.py dump_all \
    --csv_path ./csv_kr \
    --qlib_dir ~/.qlib/qlib_data/kr_data \
    --include_fields open,close,high,low,volume,factor \
    --date_field_name date --symbol_field_name symbol
```

#### 7.4.6 为什么没有包含交易(下单执行)功能

该中间件是**数据流水线**,而不是**订单执行系统**。正如第 3 节所述,Qlib 本身也不涉及实盘订单执行,而 8.3 节的核心提示正是"回测表现并不能保证实盘表现"。认证与行情查询是几乎所有人都需要的通用基础设施,因此值得做成中间件;但订单逻辑(订单状态管理、重试时避免重复下单、风险限额、成交确认)会因每个人的策略与风险承受能力而完全不同,做成通用方案本身就存在风险。

如需扩展,请参考 [`src/trading/README.md`](./toss-qlib-middleware/src/trading/README.md)。可以复用该中间件的 `TossAuthService`(令牌缓存)与 `TossApiClient`(HTTP 客户端模式),仅添加订单相关端点即可,但实盘下单代码务必先在小额/模拟环境中充分验证。

---

## 8. 注意事项 (Pitfalls) —— 实践中必然会遇到的问题

### 8.1 环境/安装相关

1. **禁止在源码根目录执行 import**: 若在 qlib 仓库根目录执行 `import qlib`,本地文件夹会遮蔽包本身,导致 `ModuleNotFoundError: No module named 'qlib.data._libs.rolling'` 错误。请务必先 `cd examples` 再执行,或在其他路径下操作。
2. **pandas 2.x 兼容性**: pandas 从 1.5 升级到 2.0 后,`groupby` 的 `group_key` 默认值发生变化,可能导致部分示例(TRA 数据集、TFT、RL 订单执行脚本)出错。官方已有应对措施但并不完善,如遇到问题,固定 pandas 版本(`pandas<2.0`)是较快的临时解决方案。
3. **TFT 模型仅支持 Python 3.6~3.7 + tensorflow 1.15**: 在最新环境中无法运行。各基准测试的 requirements.txt 不同,需针对每个模型分别确认。
4. **无 Redis 也可运行**: Redis 未连接时仅部分缓存失效,核心功能仍正常。但若已经在使用 Redis 且锁出现异常,可能触发 `QlibCacheException` —— 删除相应 Redis 键即可解决。
5. **multiprocessing 错误 (Windows)**: `RuntimeError: An attempt has been made to start a new process...` 是在 Windows 上未使用 `if __name__ == "__main__":` 保护而直接运行时的典型问题。

### 8.2 数据质量相关

6. **Yahoo Finance 数据的局限性**: 官方文档本身也说明,官方爬虫数据源自 Yahoo,存在缺失/错误的可能。如有高质量数据,官方推荐使用自有数据。应将 `check_data_health.py` 常态化纳入数据流水线。
7. **离线数据无法增量更新**: 为节省容量,官方发布的数据已移除部分字段,因此无法增量更新。如需持续更新,需使用 collector 从头采集并搭建增量更新体系。

### 8.3 方法论相关 —— 最为重要

8. **未来函数(look-ahead bias)**: 构建自定义因子时,类似 `Ref($close, -1)` 这样的负数 Ref 属于引用未来数据。这在定义标签时是必要的,但若混入特征中会使回测失去意义。
9. **交易成本与滑点**: 如上文 5.1 示例所示,是否计入成本会导致年化收益率从 17.8% 变为 12.9%。应用于中国市场时,务必在 executor 设置中反映交易税(0.18% 起)、手续费与报价滑点。
10. **过拟合(overfitting)**: 若在 Alpha158 之上反复根据验证集调优超参数,测试集表现必然会被夸大。滚动验证(benchmarks_dynamic 方式)比单一的 train/valid/test 划分更可信。
11. **IC 为 0.05 并非"好"数值,而只是"起点"**: 日频 IC 处于 0.03~0.05 水平的信号,大多数情况下无法克服交易成本和容量限制。应更多关注 ICIR(稳定性)以及计入成本后的 IR,而非单纯的 IC。
12. **回测不等于执行**: Qlib 的回测表现并不能保证实盘表现。订单簿深度、成交延迟、市场冲击是另外的问题,Qlib 的 RL 订单执行模块虽能部分弥补这一差距,但并不完善。

> 一句话总结: **Qlib 是计算器,不是神谕。** 无论框架多么精巧,输入数据的质量与方法论的严谨性才是决定结果的关键。

---

## 9. RD-Agent 集成(可选)

```bash
pip install rdagent
# 配置好 LLM API 密钥后
rdagent fin_factor    # 因子挖掘循环
rdagent fin_model     # 模型优化循环
rdagent fin_factor_report --report_folder=<PDF 文件夹>   # 基于报告提取因子
```

注意事项: RD-Agent 的 LLM API 调用成本相当高(一次因子循环可能需要数十至数百次调用),且生成因子的统计显著性需要人工另行验证。自动化并不能取代验证。

---

## 10. 推荐学习路径

| 阶段 | 任务 | 预计耗时 |
| :--- | :--- | :--- |
| 1 | 安装 + 下载社区数据 + 运行一次 `qrun` LightGBM 基准测试 | 半天 |
| 2 | 通过 `workflow_by_code.ipynb` 解读报告(IC、分组收益、回测曲线) | 1 天 |
| 3 | 使用表达式引擎定义 3 个自有因子 → 加入 Alpha158 → 比较性能 | 2~3 天 |
| 4 | 转换 KRX 数据 + 搭建韩国市场回测流水线 | 1 周 |
| 4.5 | (可选)使用 Toss Open API 中间件自动化第 4 阶段的 CSV 生成(7.4 节) | 2~3 天 |
| 5 | 引入滚动再训练(benchmarks_dynamic) → 与单一划分方式比较结果 | 1 周 |
| 6 | (可选)RL 订单执行 / RD-Agent 实验 —— 实盘订单集成需自行搭建(7.4.6 节) | 后续 |

---

## 11. 参考资料

| 资料 | 链接 |
| :--- | :--- |
| GitHub 仓库 | https://github.com/microsoft/qlib |
| 官方文档 | https://qlib.readthedocs.io |
| 模型基准测试表 | https://github.com/microsoft/qlib/blob/main/examples/benchmarks/README.md |
| 动态适应基准测试 | https://github.com/microsoft/qlib/tree/main/examples/benchmarks_dynamic |
| 社区数据(CN) | https://github.com/chenditc/investment_data/releases |
| RD-Agent | https://github.com/microsoft/RD-Agent |
| Qlib 论文 | https://arxiv.org/abs/2009.11189 |
| R&D-Agent-Quant 论文 | https://arxiv.org/abs/2505.15155 |
| Qlib-Server(在线模式) | https://github.com/microsoft/qlib-server |
| Toss 证券 Open API 官方文档 | https://developers.tossinvest.com/docs |
| Toss Open API ↔ Qlib 中间件(本仓库) | [`TechDoc/Quant_Qlib/toss-qlib-middleware`](./toss-qlib-middleware) |
| Toss Open API 集成参考项目(本仓库) | [`Toss/`](../../Toss) —— 实际可运行的仪表盘,包含 GUIDE.md、docs/Toss_OpenAPI_Guide.md |

---

*本文档基于截至 2026-07-05 的 microsoft/qlib main 分支及官方文档核对撰写。文中数值(基准测试、性能对比)均来源于官方仓库公开资料,实际复现结果可能因运行环境而异。第 7.4 节中的 Toss Open API 中间件参照本仓库 `Toss/` 项目(实际可运行的集成仪表盘)的源码与文档确定了认证规范,并通过自有单元测试(`npm test`,10 项通过)验证了逻辑。向 `POST /oauth2/token` 发送实际请求后(即便凭据错误)收到了 `invalid_client` 响应,证明端点路径与请求格式本身已通过实际调用验证,但 K 线/行情响应的确切字段结构仍需在获得真实账户后重新确认。*
