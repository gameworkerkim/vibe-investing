---
title: "iTransformer 入门指南"
description: "清华大学与蚂蚁集团的“倒置 Transformer”——多变量时间序列预测的新范式"
lang: zh
featured: false
schema_type: TechArticle
keywords:
  - iTransformer
  - 时间序列预测
  - 多变量预测
  - 清华大学
  - 蚂蚁集团
tags:
  - 时间序列
  - Transformer
  - 机器学习
  - 量化
---

# iTransformer 入门指南

> 清华大学与蚂蚁集团的"倒置 Transformer"——多变量时间序列预测的新范式

---

## 简介

iTransformer(Inverted Transformer)是由清华大学(Tsinghua University)与蚂蚁集团(Alipay)联合提出的时间序列预测模型,入选**ICLR 2024 Spotlight**。

名称的核心在于"Inverted(倒置)"——Transformer 架构本身保持不变,但**数据输入的方向被反转了 180 度**。这一简单的思路转变,在多变量时间序列预测上取得了 SOTA 水平。

如果说 TimesFM 是"一个模型覆盖所有领域"的基础模型,那么 iTransformer 就是"**最擅长捕捉变量间相关性**"的多变量专用模型。两者目标不同,因此既是竞争关系,也是互补关系。

它擅长捕捉股票代码之间相关性的耦合信号。因此在捕捉价格不对称、市场无效率并借此把握从失衡回归均衡的时机进行交易时颇为有效。在捕捉行业轮动或通过预测个股间协方差结构生成再平衡触发信号方面也很有用。不过,它需要投入较多精力。相较 TimesFM 有其优势,两者混合使用效果更佳。

一句话总结: 中原多俊杰，灿若江沙；天下尽英雄，壮如三国。

---

## 项目概览

| 项目 | 内容 |
|------|------|
| 开发方 | 清华大学 + 蚂蚁集团(Alipay) |
| 发表 | ICLR 2024 Spotlight |
| 许可证 | MIT 开源 |
| GitHub | https://github.com/thuml/iTransformer |
| pip 包 | `pip install iTransformer` |
| 相关库 | GluonTS(AWS)、NeuralForecast(Nixtla)、Time-Series-Library |

---

## 核心思路——"倒置"了什么?

### 传统 Transformer 的问题

传统 Transformer 处理多变量时间序列时,会将**同一时间点的多个变量**捆绑为一个 token(Temporal Token)。例如在电网数据中,"上午 9 点的温度 + 湿度 + 风速"会被处理为一个 token。

这种方式的问题:
- 将温度(°C)和电力(kWh)这类**物理意义和单位完全不同**的值强行合并,会导致语义信息丢失。
- 时间戳本身不像自然语言中的单词那样**拥有独立的含义**。

### iTransformer 的解决方案

| 区分 | 传统 Transformer | iTransformer |
|------|-----------------|--------------|
| **token 定义** | 每个时间步为一个 token | **每个变量(通道)为一个 token** |
| **注意力的作用** | 建模时间依赖关系 | 建模**变量间的多变量相关性** |
| **前馈网络的作用** | 编码各时间点的特征 | 编码**整个时间序列的表示** |

换言之,iTransformer 将**整个时间序列视为特征(feature)**,将**每个变量视为 token**。注意力机制学习"变量 A 与变量 B 是什么关系?",前馈网络学习"变量 A 的时间序列模式是什么?"

---

## 优点

### 1. 多变量预测达到 SOTA 水平
在多个真实数据集上取得了最先进的性能。
- GNSS 高度时间序列: **RMSE 5.1mm,MAE 3.7mm**(与 PatchTST 并列第一)
- 在 Traffic、ETTh1、Weather 等标准基准上,总体优于传统 Transformer 系列模型

### 2. 无需修改 Transformer 模块
注意力、前馈网络、层归一化等**Transformer 基础模块完全未做修改**。由于只是重新设计了数据组织方式,因此:
- FlashAttention 等高效注意力机制可以直接接入
- 未来 Transformer 的改进可以立即被吸收利用

### 3. 对未见变量的泛化能力
由于输入 token 数量具有灵活性,**变量通道数没有限制**。仅用部分变量训练后,可以泛化到训练时未见过的新变量。

### 4. 有效利用较长的回溯窗口
即使回溯窗口变长,性能下降也很小。传统的 Temporal Transformer 在上下文变长时反而会出现噪声增加的问题。

### 5. 丰富的生态集成
- **GluonTS**(AWS)——云端时间序列流水线
- **NeuralForecast**(Nixtla)——与 TimeGPT 相同的生态系统
- **Time-Series-Library**(清华大学)——官方基准库

---

## 缺点

### 1. O(N²) 计算复杂度
相对于变量数 N 具有 **O(N²)** 的复杂度。当变量数量极多时(例如数千个物联网传感器),内存和计算成本会呈指数级增长。

### 2. 局部时间信息弱化
倒置框架虽然能很好地捕捉变量间相关性,但相邻时间点之间的依赖关系(temporal locality)可能被弱化。对于单变量时间序列或时间模式很重要的场景,可能不如普通 Transformer。

### 3. 对季节性噪声敏感
研究表明,iTransformer 对**季节性噪声(Seasonality Noise)**较为敏感。对于具有强季节性模式的数据(旅游、零售等),预处理很重要。

### 4. 潜在表示缺乏时间序列结构
部分研究指出,标准 iTransformer 学到的潜在表示可能缺乏**明确的时间序列局部性**。相邻时间点的表示可能在潜在空间中相距很远。

### 5. 并非基础模型
与 TimesFM 不同,iTransformer **每个新领域都需要重新训练**。不支持零样本预测,需要针对每个数据集进行微调。

---

## 安装与配置

### 环境要求
- Python 3.7 及以上
- 推荐 PyTorch 2.3+
- 支持 CUDA 的 GPU(推荐用于大规模数据集)

### 方式一: pip 安装(快速开始)

```bash
pip install iTransformer
```

### 方式二: 源码安装(官方实现)

```bash
git clone https://github.com/thuml/iTransformer.git
cd iTransformer

conda create --name itransformer python=3.7
conda activate itransformer
pip install -r requirements.txt
```

### 验证安装

```python
import torch
from iTransformer import iTransformer

print("iTransformer installed successfully!")
print(f"PyTorch version: {torch.__version__}")
```

---

## 使用示例

### 基础单变量预测

```python
import torch
from iTransformer import iTransformer

model = iTransformer(
    num_variates=1,           # 变量数量
    lookback_len=96,          # 历史数据长度
    dim=256,                  # 模型维度
    depth=6,                  # Transformer 层数
    heads=8,                  # 注意力头数
    dim_head=64,              # 每个头的维度
    pred_length=24,           # 预测长度
    use_reversible_instance_norm=True
)

# 输入: (批次, 历史长度, 变量数)
time_series = torch.randn(2, 96, 1)
predictions = model(time_series)
print(f"预测结果: {predictions.shape}")  # (2, 24, 1)
```

### 多变量多步预测

```python
multi_model = iTransformer(
    num_variates=137,         # Solar 数据集的 137 个变量
    lookback_len=96,
    dim=256,
    depth=6,
    heads=8,
    dim_head=64,
    pred_length=(12, 24, 36, 48),  # 同时输出多个预测长度
    use_reversible_instance_norm=True
)

multi_input = torch.randn(2, 96, 137)
multi_predictions = multi_model(multi_input)

for pred_len, pred in multi_predictions.items():
    print(f"{pred_len} 步预测: {pred.shape}")
```

### iTransformer2D: 时空双重注意力

需要**同时**考虑变量关系和时间序列模式的场景(例如空间上分布的传感器):

```python
from iTransformer import iTransformer2D

model_2d = iTransformer2D(
    num_variates=137,
    num_time_tokens=16,       # 将时间序列切分为 16 个时间 token
    lookback_len=96,
    dim=256,
    depth=6,
    heads=8,
    dim_head=64,
    pred_length=(12, 24, 36, 48)
)

input_data = torch.randn(2, 96, 137)
predictions_2d = model_2d(input_data)
```

> **何时选择 iTransformer2D**: 当需要预测气象站等空间上相邻传感器的时间序列时。它同时利用变量间注意力和时间注意力,能学习到比标准 iTransformer 更丰富的表示。

### 使用官方脚本训练

```bash
# 多变量预测(Traffic 数据集)
bash ./scripts/multivariate_forecasting/Traffic/iTransformer.sh

# Transformer 与 iTransformer 性能对比
bash ./scripts/boost_performance/Weather/iTransformer.sh

# 未见变量泛化测试
bash ./scripts/variate_generalization/ECL/iTransformer.sh

# 增大回溯窗口效果测试
bash ./scripts/increasing_lookback/Traffic/iTransformer.sh

# FlashAttention 加速版本
bash ./scripts/efficient_attentions/iFlashTransformer.sh
```

### 数据集

下载官方实验数据集:
- [Google Drive](https://drive.google.com/drive/folders/1ZOYpTUa82_jCcxIdTmyr0LXQfvaM9vIy)
- [Tsinghua Cloud](https://cloud.tsinghua.edu.cn/f/84fbc752d0e94980a610/)

---

## 主要超参数

| 参数 | 说明 | 常用值 |
|----------|------|--------|
| `num_variates` | 变量(通道)数量 | 数据集特征数 |
| `lookback_len` | 回溯窗口长度 | 96、192、336、720 |
| `dim` | 模型隐藏维度 | 256、512 |
| `depth` | Transformer 层数 | 2、3、6 |
| `heads` | 注意力头数 | 4、8 |
| `dim_head` | 每个头的维度 | 64 |
| `pred_length` | 预测长度(可用元组指定多个) | 24、48、96、192 |
| `use_reversible_instance_norm` | 可逆实例归一化 | 推荐 True |

---

## 代表性应用场景

| 领域 | 说明 | iTransformer 适配度 |
|------|------|---------------------|
| GNSS 高度时间序列 | 卫星导航数据处理 | ★★★★★(并列第一) |
| 电力价格预测 | 实时电力市场预测 | ★★★★☆ |
| 太阳能发电预测 | 日发电量预测 | ★★★★☆ |
| 高速公路车流量预测 | 交通流预测 | ★★★★★ |
| 煤层气产量预测 | 能源开采产量 | ★★★★☆ |
| 海表温度预测 | 结合迁移学习使用 | ★★★★☆ |
| 异常检测 | 多变量时间序列异常检测 | ★★★☆☆ |
| 股票组合分析 | 捕捉个股间相关性 | ★★★★☆ |

---

## TimesFM 与 iTransformer 对比

两个模型目标不同,应根据情况选择。

| 标准 | TimesFM | iTransformer |
|------|---------|--------------|
| **模型类型** | 基础模型 | 专用架构 |
| **零样本预测** | 支持 | 不支持(需要训练) |
| **多变量支持** | 有限 | 支持(核心优势) |
| **单变量性能** | 支持 | 相对较弱 |
| **捕捉变量间关系** | 不支持 | 支持 |
| **Google 生态集成** | 支持 | 不支持 |
| **AWS 生态集成** | 不支持 | 支持(GluonTS) |
| **安装难度** | 高(依赖 JAX) | 低(一行 pip) |
| **即时可用性** | 支持 | 不支持 |

**选择指南:**
- 新领域、数据不足 -> **TimesFM**(零样本)
- 传感器/金融变量间相关性重要 -> **iTransformer**(多变量)
- 两者结合: 先用 TimesFM 确认基线,再用 iTransformer 微调

---

## 在股票及预测市场中的应用潜力

### 股票市场中的 iTransformer

iTransformer 对**变量间相关性的学习**在金融数据上尤其有用。

**优势发挥的场景:**
- **行业轮动分析**: 捕捉科技股/能源股/金融股之间相关性的变化
- **因子模型补充**: 学习 PBR、PER、ROE 等多个因子之间的相互关系
- **组合优化**: 通过预测个股间的协方差结构生成再平衡触发信号
- **配对交易(Pair Trading)**: 预测同一行业两只股票之间的价差

**应用示例:**
```python
# 预测韩国 KOSPI 200 成分股的 30 天收益率
model = iTransformer(
    num_variates=200,    # 200 支股票
    lookback_len=252,    # 一年的交易日
    pred_length=20,      # 20 个交易日(1 个月)预测
    dim=512,
    depth=4,
    heads=8,
    dim_head=64,
    use_reversible_instance_norm=True
)
```

### 在 Polymarket 上的应用

iTransformer 能够**同时考虑多个经济指标**,因此对 Polymarket 上的复合型市场颇为有利。

例如: "2025 年底美国是否陷入经济衰退"的市场
```
输入变量(num_variates=6):
- 失业率
- 10 年期利率
- 2 年期利率(收益率曲线)
- ISM 制造业 PMI
- 消费者信心指数
- 标普 500 收益率

→ iTransformer 学习 6 个变量间的相关性后估算经济衰退概率
→ 与 Polymarket 当前价格比较,寻找套利机会
```

---

## 参考资料

- **论文**: [iTransformer: Inverted Transformers Are Effective for Time Series Forecasting (ICLR 2024)](https://arxiv.org/abs/2310.06625)
- **官方代码**: https://github.com/thuml/iTransformer
- **演讲幻灯片**: https://cloud.tsinghua.edu.cn/f/175ff98f7e2d44fbbe8e/
- **海报**: https://cloud.tsinghua.edu.cn/f/36a2ae6c132d44c0bd8c/
- **Time-Series-Library**(清华大学官方基准): https://github.com/thuml/Time-Series-Library

---

*最后更新: 2025年6月 | 撰写: Vibe Investing Research*
