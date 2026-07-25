---
title: "iTransformer Getting Started Guide"
description: "Tsinghua University x Ant Group's 'inverted Transformer' — a new paradigm for multivariate time-series forecasting."
lang: en
featured: false
schema_type: TechArticle
keywords:
  - iTransformer
  - time series forecasting
  - multivariate forecasting
  - Tsinghua University
  - Ant Group
tags:
  - Time Series
  - Transformer
  - Machine Learning
  - Quant
---

# iTransformer Getting Started Guide

> Tsinghua University x Ant Group's "inverted Transformer" — a new paradigm for multivariate time-series forecasting

---

## Introduction

iTransformer (Inverted Transformer) is a time-series forecasting model jointly proposed by Tsinghua University and Ant Group (Alipay), selected as an **ICLR 2024 Spotlight**.

The core of the name is "Inverted" — the Transformer architecture itself is left untouched, but **the direction in which data is fed in is flipped 180 degrees**. This simple inversion of thinking achieved SOTA in multivariate time-series forecasting.

If TimesFM is a foundation model that "covers every domain with a single model," iTransformer is a multivariate-specialized model that "captures inter-variable correlations best." The two models have different goals, so they are both competitors and complements to each other.

It excels at finding coupling signals that capture correlations between stock tickers. This makes it effective for trading strategies that catch price asymmetry and market inefficiency, timing the return from imbalance to equilibrium. It's useful for capturing sector rotation or generating rebalancing triggers by predicting the covariance structure between stocks. That said, it requires substantial hands-on effort. It has advantages over TimesFM, and mixing the two is useful.

One-line summary: 中原多俊杰，灿若江沙；天下尽英雄，壮如三国。

---

## Project Overview

| Item | Details |
|------|------|
| Developer | Tsinghua University + Ant Group (Alipay) |
| Published | ICLR 2024 Spotlight |
| License | MIT (open source) |
| GitHub | https://github.com/thuml/iTransformer |
| pip package | `pip install iTransformer` |
| Related libraries | GluonTS (AWS), NeuralForecast (Nixtla), Time-Series-Library |

---

## Core Idea — What Got "Inverted"?

### The Problem with Conventional Transformers

When conventional Transformers process multivariate time series, they bundle **multiple variables at the same point in time** into a single token (Temporal Token). For example, in power grid data, "temperature + humidity + wind speed at 9 AM" would be treated as one token.

Problems with this approach:
- Forcing together values with **completely different physical meanings and units**, like temperature (°C) and power (kWh), loses semantic information.
- The timestamp itself, unlike a word in natural language, **doesn't carry independent meaning**.

### iTransformer's Solution

| Aspect | Conventional Transformer | iTransformer |
|------|-----------------|--------------|
| **Token definition** | Each time step is one token | **Each variable (channel) is one token** |
| **Attention role** | Models temporal dependencies | Models **multivariate correlations between variables** |
| **Feed-forward role** | Encodes features at each time point | Encodes **the entire time series representation** |

In other words, iTransformer treats **the entire time series as a feature**, and **each variable as a token**. Attention learns "what's the relationship between variable A and variable B?", while the FFN learns "what's the temporal pattern of variable A?"

---

## Pros

### 1. SOTA Multivariate Forecasting Performance
Achieves state-of-the-art performance on multiple real-world datasets.
- GNSS altitude time series: **RMSE 5.1mm, MAE 3.7mm** (tied for #1 with PatchTST)
- Broadly outperforms conventional Transformer-family models on standard benchmarks like Traffic, ETTh1, and Weather

### 2. No Need to Modify Transformer Modules
Attention, feed-forward, layer normalization, and other **core Transformer modules are entirely unmodified**. Since only the data organization was redesigned:
- Efficient attention mechanisms like FlashAttention can be plugged in directly
- Future Transformer improvements can be absorbed immediately

### 3. Generalization to Unseen Variables
Because the number of input tokens is flexible, **there's no limit on the number of variable channels**. The model can generalize to new variables not seen during training after training on only a subset.

### 4. Effective Use of Long Lookback Windows
Performance degrades less as the lookback window lengthens. Conventional Temporal Transformers had a problem where longer contexts actually increased noise.

### 5. Rich Ecosystem Integration
- **GluonTS** (AWS) — cloud time-series pipelines
- **NeuralForecast** (Nixtla) — the same ecosystem as TimeGPT
- **Time-Series-Library** (Tsinghua) — the official benchmark library

---

## Cons

### 1. O(N²) Computational Complexity
Has **O(N²)** complexity with respect to the number of variables N. With very many variables — thousands of IoT sensors, for example — memory and compute costs grow exponentially.

### 2. Weakened Local Temporal Information
While the inverted framework captures inter-variable correlations well, dependencies between adjacent time points (temporal locality) can be weakened. For univariate time series or cases where temporal patterns matter, it can be less favorable than a regular Transformer.

### 3. Sensitivity to Seasonality Noise
Research shows iTransformer is relatively sensitive to **seasonality noise**. For data with strong seasonal patterns (tourism, retail, etc.), preprocessing is important.

### 4. Latent Representations Lack Time-Series Structure
Some research points out that the latent representations learned by standard iTransformer can lack **clear time-series locality**. Representations of neighboring time points may end up scattered far apart in the latent space.

### 5. Not a Foundation Model
Unlike TimesFM, iTransformer **requires training for each new domain**. It does not support zero-shot forecasting; fine-tuning per dataset is required.

---

## Installation and Setup

### Requirements
- Python 3.7 or higher
- PyTorch 2.3+ recommended
- CUDA-capable GPU (recommended for large datasets)

### Method 1: pip Install (Quick Start)

```bash
pip install iTransformer
```

### Method 2: Source Install (Official Implementation)

```bash
git clone https://github.com/thuml/iTransformer.git
cd iTransformer

conda create --name itransformer python=3.7
conda activate itransformer
pip install -r requirements.txt
```

### Verifying the Install

```python
import torch
from iTransformer import iTransformer

print("iTransformer installed successfully!")
print(f"PyTorch version: {torch.__version__}")
```

---

## Usage Examples

### Basic Univariate Forecasting

```python
import torch
from iTransformer import iTransformer

model = iTransformer(
    num_variates=1,           # number of variables
    lookback_len=96,          # length of historical data
    dim=256,                  # model dimension
    depth=6,                  # number of Transformer layers
    heads=8,                  # number of attention heads
    dim_head=64,              # dimension per head
    pred_length=24,           # prediction length
    use_reversible_instance_norm=True
)

# Input: (batch, lookback length, number of variables)
time_series = torch.randn(2, 96, 1)
predictions = model(time_series)
print(f"Prediction result: {predictions.shape}")  # (2, 24, 1)
```

### Multivariate Multi-Step Forecasting

```python
multi_model = iTransformer(
    num_variates=137,         # 137 variables in the Solar dataset
    lookback_len=96,
    dim=256,
    depth=6,
    heads=8,
    dim_head=64,
    pred_length=(12, 24, 36, 48),  # output multiple prediction lengths simultaneously
    use_reversible_instance_norm=True
)

multi_input = torch.randn(2, 96, 137)
multi_predictions = multi_model(multi_input)

for pred_len, pred in multi_predictions.items():
    print(f"{pred_len}-step prediction: {pred.shape}")
```

### iTransformer2D: Spatiotemporal Dual Attention

When you need to consider variable relationships and temporal patterns **simultaneously** (e.g., spatially distributed sensors):

```python
from iTransformer import iTransformer2D

model_2d = iTransformer2D(
    num_variates=137,
    num_time_tokens=16,       # split the time series into 16 time tokens
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

> **When to choose iTransformer2D**: When forecasting time series from spatially adjacent sensors, such as weather stations. It leverages both cross-variable attention and temporal attention, learning richer representations than the standard iTransformer.

### Training with Official Scripts

```bash
# Multivariate forecasting (Traffic dataset)
bash ./scripts/multivariate_forecasting/Traffic/iTransformer.sh

# Transformer vs iTransformer performance comparison
bash ./scripts/boost_performance/Weather/iTransformer.sh

# Unseen-variable generalization test
bash ./scripts/variate_generalization/ECL/iTransformer.sh

# Effect of increasing lookback window
bash ./scripts/increasing_lookback/Traffic/iTransformer.sh

# FlashAttention-accelerated version
bash ./scripts/efficient_attentions/iFlashTransformer.sh
```

### Datasets

Download the official experiment datasets:
- [Google Drive](https://drive.google.com/drive/folders/1ZOYpTUa82_jCcxIdTmyr0LXQfvaM9vIy)
- [Tsinghua Cloud](https://cloud.tsinghua.edu.cn/f/84fbc752d0e94980a610/)

---

## Key Hyperparameters

| Parameter | Description | Typical Values |
|----------|------|--------|
| `num_variates` | Number of variables (channels) | Number of dataset features |
| `lookback_len` | Lookback window length | 96, 192, 336, 720 |
| `dim` | Model hidden dimension | 256, 512 |
| `depth` | Number of Transformer layers | 2, 3, 6 |
| `heads` | Number of attention heads | 4, 8 |
| `dim_head` | Dimension per head | 64 |
| `pred_length` | Prediction length (can be a tuple for multiple) | 24, 48, 96, 192 |
| `use_reversible_instance_norm` | Reversible instance normalization | True recommended |

---

## Representative Use Cases

| Domain | Description | iTransformer Fit |
|------|------|---------------------|
| GNSS altitude time series | Satellite navigation data processing | ★★★★★ (tied for #1) |
| Electricity price forecasting | Real-time power market forecasting | ★★★★☆ |
| Solar power generation forecasting | Daily generation forecasting | ★★★★☆ |
| Highway traffic volume forecasting | Traffic flow forecasting | ★★★★★ |
| Coalbed methane production forecasting | Energy drilling production | ★★★★☆ |
| Sea surface temperature forecasting | Combined with transfer learning | ★★★★☆ |
| Anomaly detection | Multivariate time-series anomaly detection | ★★★☆☆ |
| Stock portfolio analysis | Capturing correlations between tickers | ★★★★☆ |

---

## TimesFM vs iTransformer Comparison

The two models have different purposes, so the choice depends on the situation.

| Criterion | TimesFM | iTransformer |
|------|---------|--------------|
| **Model type** | Foundation model | Specialized architecture |
| **Zero-shot forecasting** | Yes | No (requires training) |
| **Multivariate support** | Limited | Yes (core strength) |
| **Univariate performance** | Yes | Relatively weaker |
| **Captures inter-variable relationships** | No | Yes |
| **Google ecosystem integration** | Yes | No |
| **AWS ecosystem integration** | No | Yes (GluonTS) |
| **Installation difficulty** | High (JAX dependency) | Low (one pip line) |
| **Immediate usability** | Yes | No |

**Selection guide:**
- New domain, limited data -> **TimesFM** (zero-shot)
- Correlations between sensor/financial variables matter -> **iTransformer** (multivariate)
- Combine both: check a baseline with TimesFM before fine-tuning with iTransformer

---

## Potential Applications in Stock and Prediction Markets

### iTransformer in Stock Markets

iTransformer's **learning of inter-variable correlations** is especially useful for financial data.

**Scenarios where its strengths shine:**
- **Sector rotation analysis**: capturing shifting correlations among tech/energy/financial stocks
- **Factor model augmentation**: learning the interrelationships among factors like PBR, PER, ROE
- **Portfolio optimization**: generating rebalancing triggers by forecasting the covariance structure among tickers
- **Pair trading**: forecasting the spread between two stocks in the same sector

**Usage example:**
```python
# Forecasting 30-day returns for KOSPI 200 constituents
model = iTransformer(
    num_variates=200,    # 200 stocks
    lookback_len=252,    # one year of trading days
    pred_length=20,      # 20 trading days (1 month) forecast
    dim=512,
    depth=4,
    heads=8,
    dim_head=64,
    use_reversible_instance_norm=True
)
```

### Applications on Polymarket

iTransformer is well-suited to Polymarket's complex markets because it can **simultaneously consider multiple economic indicators**.

Example: a "US recession by end of 2025?" market
```
Input variables (num_variates=6):
- Unemployment rate
- 10-year yield
- 2-year yield (yield curve)
- ISM manufacturing PMI
- Consumer confidence index
- S&P 500 return

-> iTransformer learns correlations across the 6 variables to estimate recession probability
-> Compare against current Polymarket prices to search for arbitrage opportunities
```

---

## References

- **Paper**: [iTransformer: Inverted Transformers Are Effective for Time Series Forecasting (ICLR 2024)](https://arxiv.org/abs/2310.06625)
- **Official code**: https://github.com/thuml/iTransformer
- **Presentation slides**: https://cloud.tsinghua.edu.cn/f/175ff98f7e2d44fbbe8e/
- **Poster**: https://cloud.tsinghua.edu.cn/f/36a2ae6c132d44c0bd8c/
- **Time-Series-Library** (Tsinghua's official benchmark): https://github.com/thuml/Time-Series-Library

---

*Last updated: June 2025 | Written by: Vibe Investing Research*
