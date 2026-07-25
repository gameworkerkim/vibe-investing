---
title: "Microsoft Qlib入门指南 — 面向中文开发者的完整指南(含Toss Open API集成测试)"
description: "Microsoft的AI导向量化投资平台Qlib的完整指南,涵盖安装、数据准备、首次工作流运行、基准测试解读,以及韩国市场(KRX)数据集成。"
lang: zh
featured: false
author: Dennis Kim
date: 2026-07-05
schema_type: TechArticle
---

# Microsoft Qlib入门指南 — 面向中文开发者的完整指南(含Toss Open API集成测试)

> 最后核实日期:2026-07-05(microsoft/qlib main分支)
> 目标读者:刚开始搭建量化/机器学习回测环境的Python开发者

---

## 1. Qlib项目概述

**Qlib**是Microsoft Research(MSRA)于2020年9月开源的**AI导向量化投资平台**。它覆盖了数据处理、模型训练、回测的完整机器学习流程,涵盖从alpha发现→风险建模→投资组合优化→订单执行的整个量化投资工作流。

它支持三种学习范式:

| 范式 | 目的 | 代表性实现 |
| :--- | :--- | :--- |
| 监督学习 | 发现复杂的非线性市场模式 | LightGBM、GRU、Transformer(25种以上模型) |
| 市场动态适应 | 应对概念漂移、非平稳性 | DDG-DA、Rolling Retraining |
| 强化学习 | 持续交易决策、订单执行优化 | PPO、OPDS |

**RD-Agent**(基于LLM的自主研发代理)进一步扩展了这一能力,实现因子的自动发现与模型优化。相关论文:"R&D-Agent-Quant: A Multi-Agent Framework for Data-Centric Factors and Model Joint Optimization"(arXiv:2505.15155)。

项目规模:GitHub星标约4万,fork数超过6,000(截至2026年)。是Python量化领域顶级的开源项目。

---

## 2. 主要优势

### 2.1 一体化流水线
数据处理→因子计算→模型训练→回测→报告分析→在线服务,全部集成在一个框架中。相比拼接zipline(仅回测)、backtrader(仅策略)以及独立因子库的方式,大幅降低了集成成本。

### 2.2 经过验证的高性能数据基础设施
Qlib设计了自己的金融时间序列二进制存储格式,并配备两层缓存(ExpressionCache、DatasetCache)。官方基准测试(800只股票×14个因子,2007-2020年日线数据,单CPU):

| 存储方式 | 耗时(秒) | 相比Qlib完整缓存 |
| :--- | ---: | ---: |
| MySQL | 365.3 ± 7.5 | 约慢49倍 |
| InfluxDB | 368.2 ± 3.6 | 约慢50倍 |
| MongoDB | 253.6 ± 6.7 | 约慢34倍 |
| HDF5 | 184.4 ± 3.7 | 约慢25倍 |
| Qlib(无缓存) | 147.0 ± 8.8 | 约慢20倍 |
| Qlib(+ExpressionCache) | 47.6 ± 1.0 | 约慢6倍 |
| **Qlib(+Expression+Dataset缓存)** | **7.4 ± 0.3** | 基准值 |

在64核CPU上,无缓存降至8.8秒,仅ExpressionCache降至4.2秒。通用数据库由于多层接口和不必要的格式转换,在金融数据加载方面存在结构性劣势。

### 2.3 基于表达式的因子引擎
将因子定义为字符串表达式,如`Ref($close, 1)/$close - 1`,引擎会自动处理向量化计算和缓存。相比pandas的rolling/shift组合,代码量大幅减少;由于缓存复用,在迭代实验中速度尤为快。

### 2.4 可复现的模型库
从GBDT系列(LightGBM、XGBoost、CatBoost)到深度学习(LSTM、GRU、ALSTM、GATs、Transformer、Localformer、TRA、TCN、ADARNN、ADD、IGMTF、HIST、KRNN、Sandwich、TabNet、DoubleEnsemble、TCTS、SFM、TFT)——提供25种以上的SOTA模型,可在相同数据集(Alpha158/Alpha360)和相同回测条件下进行比较。称其为"唯一能够直接复现论文数值的量化框架"并不为过。

### 2.5 内置的非平稳性应对工具
Rolling Retraining以及基于元学习的DDG-DA可应对市场机制的变化,并附带基准测试。这是Qlib独有的领域,几乎没有其他开源回测工具具备这一能力。

### 2.6 通过RD-Agent实现自动化研发
LLM可自主运行因子假设→编码→回测→评估→改进的循环。还支持从研究报告(PDF)中提取因子。演示地址:rdagent.azurewebsites.net

---

## 3. 与同类项目的比较

| 项目 | 性质 | 相对Qlib的定位 |
| :--- | :--- | :--- |
| **zipline / zipline-reloaded** | 基于事件的回测引擎 | 仅限回测。没有机器学习流水线或因子引擎。Quantopian关闭后由社区维护 |
| **backtrader** | 基于事件的回测引擎 | 策略逻辑能力强;机器学习集成需手动完成。使用者较多 |
| **vectorbt** | 向量化回测引擎 | 速度非常快,但并非因子研究/模型训练框架 |
| **QuantConnect(LEAN)** | 云端量化平台 | 在实盘交易集成方面表现出色,支持C#/Python。在研究可复现性方面Qlib更具优势 |
| **Qbot / QuantMind / qlib-learning** | 基于Qlib的上层应用 | 以Qlib为核心引擎。适合快速探索 |

总结来说,Qlib占据了一个几乎没有竞争对手的独特位置——**"AI模型研究+回测一体化"**。但**实盘订单执行**(券商API)不在其范围内,实际交易需要自行构建执行层。

---

## 4. 安装

### 4.1 环境要求

| 项目 | 详情 |
| :--- | :--- |
| 操作系统 | Linux、Windows、macOS(推荐Linux——部分脚本如`run_all_model.py`仅限Linux) |
| Python | 官方支持**3.8~3.12** |
| 包管理器 | 强烈推荐使用Conda(系统自带Python可能缺少头文件导致编译失败) |
| 必需依赖 | numpy、cython、lightgbm、pytorch(用于深度学习模型) |

```bash
conda create -n qlib python=3.10
conda activate qlib
```

### 4.2 三种安装方式

**方式一:pip(稳定版,推荐)**
```bash
pip install pyqlib
```

**方式二:源码安装(获取最新main分支功能)**
```bash
pip install numpy
pip install --upgrade cython

git clone https://github.com/microsoft/qlib.git && cd qlib
pip install .            # 开发用途:pip install -e ".[dev]"
```
> 注意:旧版的`python setup.py install`已被弃用。请始终使用`pip install .`。

**方式三:Docker(隔离环境)**
```bash
docker pull pyqlib/qlib_image_stable:stable
docker run -it --name qlib -v <local_dir>:/app pyqlib/qlib_image_stable:stable
```

**Apple Silicon(M1/M2/M3)Mac用户**:由于缺少OpenMP,LightGBM编译可能失败。请先执行`brew install libomp`。

**验证安装**:
```python
import qlib
print(qlib.__version__)   # 0.9.x
```

### 4.3 数据准备 — 重要变更

> **【截至2026年】** 由于数据安全政策收紧,官方数据下载脚本已暂时停用。官方README推荐使用chenditc维护的社区版investment_data仓库。旧文档中的`python scripts/get_data.py qlib_data_cn ...`命令已不再可用。

**推荐:社区数据集(中国A股,基于TuShare,每日更新)**
```bash
wget https://github.com/chenditc/investment_data/releases/latest/download/qlib_bin.tar.gz
mkdir -p ~/.qlib/qlib_data/cn_data
tar -zxvf qlib_bin.tar.gz -C ~/.qlib/qlib_data/cn_data --strip-components=1
rm -f qlib_bin.tar.gz
```

**官方脚本(恢复后,基于Yahoo Finance爬虫)**
```bash
# 日线
python -m qlib.cli.data qlib_data --target_dir ~/.qlib/qlib_data/cn_data --region cn
# 1分钟线
python -m qlib.cli.data qlib_data --target_dir ~/.qlib/qlib_data/cn_data_1min --region cn --interval 1min
```

**数据完整性检查**(建议养成的习惯):
```bash
python scripts/check_data_health.py check_data --qlib_dir ~/.qlib/qlib_data/cn_data
```

### 4.4 初始化

```python
import qlib
from qlib.constant import REG_CN

provider_uri = "~/.qlib/qlib_data/cn_data"
qlib.init(provider_uri=provider_uri, region=REG_CN)
```

`region`支持`REG_CN`(中国)、`REG_US`(美国)、`REG_TW`(台湾)。region会影响数据路径**以及交易约束规则**(中国的涨跌停限制、T+1、最小交易单位),因此在使用自定义市场数据时,应在回测配置中单独审查交易规则。

---

## 5. 首次运行工作流

### 5.1 通过qrun自动化(基于配置文件)

`qrun`通过单个YAML文件自动完成数据集构建→模型训练→信号生成→回测→评估。

```bash
cd examples    # 重要:从qlib仓库根目录运行会导致import冲突
qrun benchmarks/LightGBM/workflow_config_lightgbm_Alpha158.yaml
```

输出示例(CSI300+Alpha158+LightGBM,来自官方README):

```
'The following are analysis results of the excess return without cost.'
annualized_return   0.178316    # 年化超额收益17.83%
information_ratio   1.996555
max_drawdown       -0.081806

'The following are analysis results of the excess return with cost.'
annualized_return   0.128982    # 计入成本后为12.90%
information_ratio   1.444287
max_drawdown       -0.091078
```

请注意无成本与含成本收益率之间约5个百分点的差距。该框架默认展示了**为什么不应轻信无成本回测数字**这一道理。

### 5.2 基于代码的自定义工作流

如果qrun的自动工作流不适用,可以直接组装模块:

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
    SignalRecord(model, dataset, rec).generate()
```

### 5.3 通过表达式引擎直接查询数据

```python
from qlib.data import D

# 简单查询
df = D.features(
    ["SH600000"],
    ["$close", "$volume"],
    start_time="2020-01-01", end_time="2020-12-31", freq="day",
)

# 即时定义因子:5日动量、20日波动率
df = D.features(
    D.instruments("csi300"),
    ["Ref($close, 5)/$close - 1", "Std($close/Ref($close,1)-1, 20)"],
    start_time="2019-01-01", end_time="2020-12-31",
)
```

表达式字符串本身就是因子定义;结果会缓存在ExpressionCache中,后续调用速度显著提升。

### 5.4 图形化报告

```bash
python -m pip install ".[analysis]"
jupyter notebook examples/workflow_by_code.ipynb
```

可用报告包括:分组累计收益、多空收益分布、IC/月度IC、信号自相关性、组合回测收益曲线。

---

## 6. 基准测试 — 模型性能比较

### 6.1 理解数据集:Alpha158对比Alpha360

| 数据集 | 特点 | 最适合的模型类型 |
| :--- | :--- | :--- |
| **Alpha158** | 158个人工设计的因子(典型的特征工程)。特征之间的空间关系较弱 | GBDT系列(LightGBM、CatBoost等) |
| **Alpha360** | 最近60天的原始价格/成交量(特征工程最少)。时间空间关系较强 | 深度学习模型(GRU、ALSTM、TRA等) |

这一区分很重要,因为**"表格数据中GBDT胜出,原始时间序列中神经网络胜出"这一通用机器学习规律在Qlib的基准测试中得到了忠实的复现**。应根据自己因子的特性来选择模型系列,盲目使用"最热门的模型"效率低下。

### 6.2 市场动态适应基准测试(CSI500、Alpha158、2017.01-2020.08滚动)

| 模型 | IC | ICIR | Rank IC | 年化收益 | IR | 最大回撤 |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| RR[Linear] | 0.0945 | 0.5989 | 0.1069 | 8.57% | 1.368 | -9.86% |
| DDG-DA[Linear] | 0.0983 | 0.6157 | 0.1108 | 7.64% | 1.190 | -7.69% |
| RR[LightGBM] | 0.0816 | 0.5887 | 0.0912 | 7.71% | 1.320 | -9.09% |
| **DDG-DA[LightGBM]** | **0.0878** | **0.6185** | **0.0975** | **12.61%** | **2.010** | **-7.44%** |

核心结论:将DDG-DA(元学习分布适应)与LightGBM结合,相比简单的滚动再训练,年化收益提升了4.9个百分点,IR从1.32提升到2.01。**同一个模型,采用不同的市场变化适应策略,结果会截然不同。**

### 6.3 完整模型比较表

25种以上模型的性能比较维护在:
`https://github.com/microsoft/qlib/blob/main/examples/benchmarks/README.md`

如需自行运行多个模型(仅限Linux):
```bash
python run_all_model.py run 10          # 全部模型,迭代10次
python run_all_model.py run 3 lightgbm Alpha158 csi500   # 指定模型/数据集/股票池
```

官方文档建议对于具有随机性的深度学习模型进行20次以上迭代。**仅凭单次运行来判断模型优劣在统计上是没有意义的。**

---

## 7. 面向中文开发者的实践部分:KRX(韩国交易所)数据集成

Qlib并未官方支持韩国市场(region仅限CN/US/TW)。但由于存在CSV→Qlib二进制转换工具(`dump_bin.py`),集成KOSPI/KOSDAQ数据相对简单。

### 7.1 通过pykrx采集数据→生成CSV

```python
# pip install pykrx
from pykrx import stock
import pandas as pd, os

os.makedirs("csv_kr", exist_ok=True)
tickers = stock.get_market_ticker_list(market="KOSPI")

for t in tickers[:50]:   # 示例:前50只股票
    df = stock.get_market_ohlcv("20180101", "20260630", t)
    df = df.reset_index().rename(columns={
        "날짜": "date", "시가": "open", "고가": "high",
        "저가": "low", "종가": "close", "거래량": "volume",
    })
    df["symbol"] = t
    # Qlib约定:用于调整价格计算的factor列(未调整时为1.0)
    df["factor"] = 1.0
    df.to_csv(f"csv_kr/{t}.csv", index=False)
```

### 7.2 转换为Qlib二进制格式

```bash
python scripts/dump_bin.py dump_all \
    --csv_path ./csv_kr \
    --qlib_dir ~/.qlib/qlib_data/kr_data \
    --include_fields open,close,high,low,volume,factor \
    --date_field_name date --symbol_field_name symbol
```

### 7.3 韩国市场数据的必查清单

| 项目 | 详情 |
| :--- | :--- |
| **调整后价格(factor)** | 需确认pykrx的OHLCV是否反映了调整后价格。若未针对拆股/分红进行调整就进行回测,收益将会失真 |
| **交易规则** | 使用`region=REG_CN`会应用中国的±10%涨跌停限制和T+1规则。需针对韩国规则(±30%涨跌停、T+0回转交易)自定义回测执行器 |
| **停牌/退市** | 需纳入已退市股票以避免幸存者偏差。pykrx以当前上市股票为中心,需了解这一限制 |
| **交易日历** | 检查`~/.qlib/qlib_data/kr_data/calendars/day.txt`确认韩国节假日日历是否自动生成 |
| **基准指数** | 应将KOSPI200作为单独的symbol添加,用于回测基准比较 |
| **Alpha158因子** | 因子定义是市场中性的,可适用于韩国数据。但必须重新验证——CSI300的IC在韩国市场可能无法复现 |

### 7.4 Toss Open API与Qlib中间件(Node.js/TypeScript+Redis)

Qlib是一个Python框架,但Qlib实际所需要的只是"符合其格式的数据"。数据管道可以用任何语言构建。本节介绍一个中间件,它从Toss证券的Open API获取价格数据,将其规范化为Qlib CSV格式(`date,open,high,low,close,volume,symbol,factor`),并提供给`dump_bin.py`使用。

**范围:仅限认证以及市场/标的数据查询。有意排除了订单的创建、修改、取消(交易)功能。** 具体原因见7.4.6节。

代码位于[`TechDoc/Quant_Qlib/toss-qlib-middleware/`](./toss-qlib-middleware)([韩文README](./toss-qlib-middleware/README.md) / [英文README](./toss-qlib-middleware/README_EN.md) / [llms.txt](./toss-qlib-middleware/llms.txt))。Toss Open API的认证/端点规范已与本仓库现有的[`Toss/`](../../Toss)项目保持一致。

#### 7.4.1 为什么需要中间件

Qlib的`dump_bin.py`只需理解CSV格式,Qlib引擎只关心后续的二进制格式和缓存。而Toss Open API存在OAuth2认证、令牌过期、速率限制、分页等"API客户端问题"。将认证/调用管理与因子/建模分离,可以使两者都保持清晰简洁。

```
TOSS Open API  --OAuth2-->  [Node.js/TS中间件]  --CSV(csv_kr/*.csv)-->  scripts/dump_bin.py  -->  ~/.qlib/qlib_data/kr_data
                                   |
                                 Redis(令牌缓存+价格缓存)
```

#### 7.4.2 认证(OAuth2 Client Credentials)

Toss证券的Open API采用**OAuth2 Client Credentials Grant**(无需用户登录)。规范已通过`Toss/src/toss.js`和`Toss/docs/Toss_OpenAPI_Guide.md`核实:

1. 登录Toss WTS→设置→Open API菜单→发行`client_id` / `client_secret`
2. 将`grant_type=client_credentials`、`client_id`、`client_secret`作为**form-urlencoded请求体**(而非Basic Auth头)发送至`POST {baseUrl}/oauth2/token`→返回`access_token`、`expires_in`
3. 有效期为**86,400秒(24小时),无refresh token**——需实现在过期前主动重新发行
4. 后续所有调用均使用`Authorization: Bearer {access_token}`头
5. 账户级API需要额外的`X-Tossinvest-Account`头(未实现——中间件不调用账户/订单相关API)

> **核实状态**:官方文档(`developers.tossinvest.com/docs`)使用JavaScript渲染,但向`POST /oauth2/token`发送上述form-body请求时(即使使用错误的凭证)会返回`{"error":"invalid_client", ...}`——通过实际测试确认了端点路径和请求格式。确切的K线/价格响应字段结构尚未确认,因此中间件以防御性方式接受多个候选键名。需要注意的是,截至2026年6月,该服务本身仍处于预注册阶段,尚无确定的上线日期。

#### 7.4.3 Redis缓存策略

| 缓存对象 | 键 | TTL | 原因 |
| :--- | :--- | :--- | :--- |
| 访问令牌 | `toss:access_token` | `86400 - safety_margin(默认1小时)` | 由于没有refresh token,必须在过期前较早主动重新发行 |
| 令牌重发行锁 | `toss:access_token:lock` | 10秒(`SET NX`) | 防止多个请求同时检测到过期而引发的惊群效应 |
| 已确定的历史K线 | `toss:candles:{symbol}:{interval}:{start}:{end}` | 1天(`CANDLE_TTL_HISTORICAL_SEC`) | 已收盘的K线不会再变化,因此可长期缓存 |
| 当日(未确定)K线 | 相同的键 | 短时间(`CANDLE_TTL_TODAY_SEC`,默认30秒) | 交易时段内当前K线会持续更新 |
| 当前价格 | `toss:price:{symbol}` | 短时间(`PRICE_TTL_SEC`,默认5秒) | 按标的缓存可实现跨批次复用 |

401(令牌过期/无效)→立即清除缓存并重试一次。429(速率限制)→检查`Retry-After`头并进行退避。K线API每次请求最多返回200条,且没有`start`/`end`过滤器,因此需通过`before`游标从最新数据向后分页,再按升序排列(与`Toss/src/toss.js`采用的策略相同)。

#### 7.4.4 安装与运行

```bash
cd TechDoc/Quant_Qlib/toss-qlib-middleware
npm install
npm run setup       # 交互式生成.env+可选的实时令牌发行测试
npm run typecheck
npm test            # 无需Redis服务器即可通过(逻辑验证使用内存适配器)
npm run dev         # http://localhost:4000,需要实际的Redis
```

核心`.env`配置项(与`Toss/.env.example`使用相同的键名):

```
TOSS_BASE_URL=https://openapi.tossinvest.com
TOSS_TOKEN_PATH=/oauth2/token
TOSS_CANDLES_PATH=/api/v1/candles
TOSS_PRICES_PATH=/api/v1/prices
REDIS_URL=redis://127.0.0.1:6379
QLIB_CSV_EXPORT_DIR=./csv_kr
```

所有端点路径均通过环境变量配置,更改`.env`即可,无需修改代码。

#### 7.4.5 API与Qlib流水线集成

中间件的端点:

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | `/health` | 健康检查 |
| GET | `/api/candles/:symbol?start=&end=&interval=day` | 规范化的K线JSON数据(通过Redis缓存,内置`before`分页) |
| GET | `/api/prices?symbols=005930,000660` | 批量获取当前价格(逗号分隔,按200个一批分块) |
| POST | `/api/export/qlib` `{symbols, start, end, outDir?}` | 获取多个标的→输出为`csv_kr/{symbol}.csv`(格式参见7.1节) |

无需启动服务器,仅生成CSV的CLI方式:

```bash
npm run export:qlib -- --symbols 005930,000660 --start 2020-01-01 --end 2026-07-01
```

生成的CSV可直接输入到7.2节的转换命令中。

#### 7.4.6 为何不包含交易(订单执行)功能

该中间件是一个**数据管道**,而非**订单执行系统**。Qlib本身(见第3节)也将实盘订单集成排除在范围之外,第8.3节也警告过回测表现并不能保证实盘结果。认证和价格查询是值得作为中间件进行标准化的通用基础,但订单逻辑(状态管理、幂等性/防重复、风险限额、成交确认)会因策略和风险承受能力的不同而存在巨大差异,通用实现方式反而具有危险性。

如需扩展,请参见[`src/trading/README.md`](./toss-qlib-middleware/src/trading/README.md)。可以复用`TossAuthService`(令牌缓存)和`TossApiClient`(HTTP模式),但**实盘订单代码必须先在小额/模拟环境中进行验证。**

---

## 8. 常见陷阱 — 实际会遇到的问题

### 8.1 环境/安装

1. **不要从仓库根目录导入**:在qlib仓库根目录下执行`import qlib`会导致`ModuleNotFoundError: No module named 'qlib.data._libs.rolling'`(本地文件夹遮蔽了该包)。请始终先执行`cd examples`。
2. **pandas 2.x兼容性**:pandas从1.5升级到2.0后,`groupby`的`group_key`默认值发生变化,可能导致TRA数据集、TFT以及强化学习订单执行脚本出错。将版本固定为`pandas<2.0`是最快的临时解决方案。
3. **TFT模型需要Python 3.6-3.7+tensorflow 1.15**:在现代环境中无法运行。请检查各模型对应的requirements.txt。
4. **无Redis也可运行**:核心功能在没有Redis的情况下也能正常工作,仅缓存部分会被禁用。若使用Redis且锁卡住,会抛出`QlibCacheException`——删除对应的Redis键即可解决。
5. **Windows上的multiprocessing问题**:`RuntimeError: An attempt has been made to start a new process...`——这是在未使用`if __name__ == "__main__":`保护的情况下运行时,Windows平台上的典型问题。

### 8.2 数据质量

6. **Yahoo Finance数据的局限性**:官方爬虫使用Yahoo Finance数据,文档本身也承认存在缺失/错误。官方建议使用自己的高质量数据。建议将`check_data_health.py`常驻集成到数据管道中。
7. **离线数据无法增量更新**:官方分发的数据为缩减体积而移除了部分字段,因此无法进行增量更新。如需持续更新,应从零开始构建包含增量更新机制的自有采集器。

### 8.3 方法论 — 最为重要

8. **前视偏差**:使用负值`Ref`(例如`Ref($close, -1)`)构建的自定义因子会引用未来数据。这在定义标签时是必要的,但一旦泄漏进特征中,回测便毫无意义。
9. **交易成本与滑点**:如5.1节所示,成本会使年化收益从17.8%变为12.9%。在韩国市场,应在执行器设置中反映交易税(0.18%起)、手续费以及买卖价差滑点。
10. **过拟合**:在验证集上反复调整超参数,必然会使测试表现被高估。相比单一的train/valid/test划分,滚动验证(benchmarks_dynamic方式)更为可靠。
11. **IC为0.05并不代表"良好",而只是一个起点**:日频IC在0.03~0.05水平的信号通常无法覆盖交易成本和容量限制。应关注ICIR(稳定性)和经成本调整后的IR,而不仅仅是IC本身。
12. **回测不等于实盘执行**:Qlib的回测表现并不能保证实盘结果。订单簿深度、成交延迟、市场冲击都是独立的问题。Qlib的强化学习订单执行模块在一定程度上弥补了这一差距,但并不完善。

> 一句话总结:**Qlib是一台计算器,而不是神谕。** 无论框架多么精巧,最终结果都取决于输入数据的质量和方法论上的严谨性。

---

## 9. RD-Agent集成(可选)

```bash
pip install rdagent
# 设置LLM API密钥后:
rdagent fin_factor    # 因子发现循环
rdagent fin_model     # 模型优化循环
rdagent fin_factor_report --report_folder=<PDF文件夹>   # 基于报告的因子提取
```

注意:RD-Agent会产生相当可观的LLM API费用(每个因子循环需要数十到数百次调用),生成的因子需要独立进行统计验证。自动化并不能替代验证。

---

## 10. 推荐学习路径

| 阶段 | 任务 | 预估耗时 |
| :--- | :--- | :--- |
| 1 | 安装+下载社区数据+运行一次`qrun` LightGBM基准测试 | 半天 |
| 2 | 通过`workflow_by_code.ipynb`解读报告(IC、分组收益、回测曲线) | 1天 |
| 3 | 通过表达式引擎定义3个自定义因子→添加到Alpha158→比较性能 | 2~3天 |
| 4 | KRX数据转换+韩国市场回测流水线 | 1周 |
| 4.5 | (可选)通过Toss Open API中间件(7.4节)自动化第4步的CSV生成 | 2~3天 |
| 5 | 采用滚动再训练(benchmarks_dynamic)→与单一划分方式比较 | 1周 |
| 6 | (可选)强化学习订单执行/RD-Agent实验——实盘订单集成需自行实现(见7.4.6节) | 后续持续进行 |

---

## 11. 参考资料

| 资源 | 链接 |
| :--- | :--- |
| GitHub仓库 | https://github.com/microsoft/qlib |
| 官方文档 | https://qlib.readthedocs.io |
| 模型基准测试表 | https://github.com/microsoft/qlib/blob/main/examples/benchmarks/README.md |
| 动态适应基准测试 | https://github.com/microsoft/qlib/tree/main/examples/benchmarks_dynamic |
| 社区数据(中国) | https://github.com/chenditc/investment_data/releases |
| RD-Agent | https://github.com/microsoft/RD-Agent |
| Qlib论文 | https://arxiv.org/abs/2009.11189 |
| R&D-Agent-Quant论文 | https://arxiv.org/abs/2505.15155 |
| Qlib-Server(在线模式) | https://github.com/microsoft/qlib-server |
| Toss证券Open API文档 | https://developers.tossinvest.com/docs |
| Toss↔Qlib中间件(本仓库) | [`TechDoc/Quant_Qlib/toss-qlib-middleware`](./toss-qlib-middleware) |
| Toss API参考项目(本仓库) | [`Toss/`](../../Toss) ——可运行的仪表盘,包含GUIDE.md及docs/Toss_OpenAPI_Guide.md |

---

*本文档撰写于2026年7月5日,基于与microsoft/qlib main分支及官方文档的交叉验证。所有指标(基准测试、性能比较)均来自官方仓库公开资料,复现结果可能因运行环境而异。第7.4节的Toss Open API中间件已依据本仓库`Toss/`项目的源代码与文档对齐认证规范,并通过自有单元测试(`npm test`,10项通过)验证了逻辑正确性。`POST /oauth2/token`(即使使用错误凭证)返回了`invalid_client`响应,通过实际测试确认了端点路径与请求格式,但确切的K线/价格响应字段结构仍需在实际账户开通后重新核实。*
