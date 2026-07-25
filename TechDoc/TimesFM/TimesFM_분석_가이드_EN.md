---
title: "TimesFM (Time Series Foundation Model) Analysis Guide"
description: "A comprehensive analysis of the time-series forecasting foundation model developed by Google Research."
lang: en
featured: false
schema_type: TechArticle
keywords:
  - TimesFM
  - Google Research
  - time series forecasting
  - foundation model
  - zero-shot forecasting
tags:
  - Time Series
  - Foundation Model
  - Google
  - Quant
---

# TimesFM (Time Series Foundation Model) Analysis Guide

> A comprehensive analysis of the time-series forecasting foundation model developed by Google Research

---

## Introduction

TimesFM is a foundation model dedicated to time-series forecasting, developed by Google Research.

Traditionally, time-series forecasting required training a separate model for each domain. Retail demand forecasting, financial price forecasting, and manufacturing equipment anomaly detection each needed their own data and models. TimesFM changes this paradigm. Pre-trained on over 100 billion real-world time-series data points, this model can forecast new domains' time-series data instantly, **without any additional training (zero-shot)**.

Just as ChatGPT did for the world of text, TimesFM is realizing the vision of "one model to forecast everything" for the world of time-series data.

It is based on the paper *"A decoder-only foundation model for time-series forecasting,"* presented at ICML (International Conference on Machine Learning) 2024, and the current latest version is TimesFM 2.5 (September 2025).

---

## Project Overview

| Item | Details |
|------|------|
| Developer | Google Research |
| Published | ICML 2024 |
| Latest version | TimesFM 2.5 (September 2025) |
| Parameter count | 200M (as of v2.5) |
| Pre-training data | Over 100 billion real-world time-series data points |
| License | Apache 2.0 open source (not an officially supported Google product) |
| Key integrations | BigQuery ML, Google Sheets, Vertex Model Garden |
| GitHub | https://github.com/google-research/timesfm |
| HuggingFace | google/timesfm-2.0-500m-pytorch |

TimesFM uses a **patch-based decoder-only Transformer architecture**. It tokenizes 32 consecutive timepoints into a single patch, structurally similar to how LLMs process text tokens.

---

## Pros

### 1. Excellent Zero-Shot Performance
Provides immediately excellent forecasts on new time-series data with no additional training. Its performance has been validated across diverse domains — retail, finance, manufacturing, healthcare — and time granularities (seconds/minutes/hours/days/months/years).

### 2. Efficient Model Size
At 200M parameters, this is a very small size compared to modern LLMs. It's about 1/1000th the size of GPT-4 (hundreds of billions of parameters), yet delivers equal or superior time-series forecasting performance.

### 3. Long Context Length Support
TimesFM 2.5 supports up to a **16K context length**. This is roughly 8x longer than the previous version (2,048), allowing years of daily data to be used as input in a single pass.

### 4. Probabilistic (Quantile) Forecasting Support
An optional 30M-parameter quantile head provides continuous quantile forecasts up to a 1K horizon. Rather than simple point forecasts, it enables probabilistic forecasting with confidence intervals.

### 5. Google Ecosystem Integration
- **BigQuery ML**: run large-scale time-series forecasting with a single line of SQL
- **Google Sheets**: use forecasting features directly from a spreadsheet
- **Vertex Model Garden**: integration with enterprise-grade MLOps pipelines

### 6. Multiple Backends and Extensibility
- Supports both PyTorch and Flax (JAX) backends
- Multi-GPU training and fine-tuning supported
- Efficient fine-tuning via HuggingFace Transformers + PEFT (LoRA)

### 7. XReg: Covariate Support
Starting with TimesFM 2.5, the XReg feature enables forecasting that incorporates external variables (weather, events, promotions, etc.).

### 8. Continuous Updates
Since 2025, various improvements have been made — a Flax version, XReg support, Agent Skills, and more — with active community pull requests being merged.

---

## Cons

### 1. Not an Officially Supported Product
Although open source, it is **not an officially supported Google product**. Enterprise adopters shouldn't expect an SLA or official technical support.

### 2. Univariate-Centric
The publicly released checkpoints are optimized for univariate time-series forecasting. It's limited in multivariate forecasting scenarios where correlations among multiple variables matter.

### 3. Dependency and Installation Issues
Has specialized dependencies including JAX, Lingvo, and Praxis.
- Reported Python version compatibility issues
- Cases of `lingvo` package installation failures in Colab
- Initial setup may require significant trial and error

### 4. Black-Box Model
Given its nature as a pre-trained foundation model, **explaining the basis for its predictions is difficult**. In domains like finance and healthcare where explainability matters, this poses regulatory risk.

### 5. Insufficient Validation in Specific Domains
Some research shows lower performance than Chronos-Bolt or Time-MoE in certain domains, such as electricity price forecasting. Validation in the target domain is essential before adoption.

### 6. Real-Time Processing Constraints
Real-time processing of large-scale time-series data requires building a separate serving infrastructure.

---

## Potential Applications in Stock and Prediction Markets

### TimesFM in Stock Market Forecasting

TimesFM has a structure directly applicable to stock price forecasting. However, the following considerations apply in practice.

**Potential**
- Processes OHLCV (open/high/low/close/volume) data as time series
- Zero-shot forecasting enables immediate prediction without per-stock training
- Quantile forecasts allow estimating price ranges and volatility
- Integration with BigQuery ML enables batch forecasting for large numbers of tickers

**Limitations**
- Stock markets are heavily influenced by unstructured data beyond time series — news, disclosures, sentiment
- May be vulnerable to market regime changes
- Additional layers (risk management, portfolio optimization) are needed to use it directly as a trading strategy
- May be better suited to medium/long-term trend forecasting than short-term (1-5 day) forecasting

**Practical use cases**
| Use case | Fit | Description |
|-----------|--------|------|
| Stock trend direction forecasting | ★★★☆☆ | Directional forecasting is possible but accuracy is limited |
| Volatility forecasting | ★★★★☆ | Effective when using quantile forecasts |
| Demand/revenue forecasting (corporate analysis) | ★★★★★ | Useful for estimating revenue ahead of earnings releases |
| Macroeconomic indicator forecasting | ★★★★☆ | CPI, interest rates, and other economic indicators |
| Portfolio rebalancing trigger | ★★★☆☆ | Used for detecting trend reversal points |

### Applications in Prediction Markets

#### Direct Applicability on Polymarket

Polymarket is a prediction market where users trade the YES/NO probability of specific events. Categories where TimesFM is directly useful:

**High fit**
- **Economic indicator markets**: markets like "Will US CPI exceed 3% in 2025?" using historical CPI time series
- **Financial events**: forecasting rate paths such as "Number of Fed rate cuts in 2025"
- **Commodity prices**: markets related to oil and gold prices

**Low fit**
- Political events (election results, etc.) — polling data is more suitable than time series
- One-off events (sports results, etc.) — no time-series pattern exists

**Polymarket usage strategy example**
```
1. Select target market: "US unemployment rate above 4.5% in December 2025?"
2. Collect historical data: download monthly unemployment rate time series from the FRED API
3. Run TimesFM forecast: quantile forecast for the next 6 months
4. Convert to probability: calculate the probability of exceeding the threshold from the forecast distribution
5. Compare with market price: search for arbitrage opportunities against the current Polymarket price
```

#### Domestic (Korean) Prediction Markets

Korea does not yet have a full-fledged prediction market like Polymarket. Prediction markets and platforms like Polymarket are illegal in Korea.
- Informal prediction channels like **KakaoTalk open-chat public sentiment aggregation**
- **Securities firm research consensus** — TimesFM can be used to forecast earnings surprises relative to consensus

---

## Comparison with Competing Projects

### Global Competing Models

| Model | Developer | Country | Parameters | Open Source | Zero-Shot | Multivariate | Probabilistic |
|------|--------|------|----------|----------|--------|--------|-------------|
| **TimesFM 2.5** | Google Research | US | 200M | Yes | Yes | Limited | Partial |
| TimeGPT | Nixtla | US | Not disclosed | No (commercial API) | Yes | Yes | Yes |
| Chronos-Bolt | Amazon | US | Various | Yes | Yes | Yes | Yes |
| Moirai | Salesforce | US | Various | Yes | Yes | Yes | Yes |
| Time-MoE | Beihang Univ. | China | Various | Yes | Yes | Partial | Limited |
| MOMENT | CMU | US | Various | Yes | Yes | Yes | Limited |
| Lag-Llama | ServiceNow | Canada | Various | Yes | Yes | No | Yes |
| UniTS | Fudan Univ. | China | Various | Yes | Yes | Yes | Limited |
| TimesNet | Tongji Univ. | China | Various | Yes | No | Yes | No |

### Detailed Analysis of Chinese Competing Projects

#### 1. Time-MoE (Time Mixture of Experts)
- **Developer**: Beihang University
- **Feature**: first application of a Mixture of Experts (MoE) architecture to time series
- **Strength**: outperforms TimesFM in Electricity Price Forecasting
- **Weakness**: limited probabilistic forecasting capability, relatively small community
- **GitHub**: https://github.com/Time-MoE/Time-MoE

#### 2. UniTS (Universal Time Series)
- **Developer**: Fudan University
- **Feature**: a single model handles forecasting, classification, anomaly detection, imputation, and other tasks
- **Strength**: multi-task learning, multivariate support
- **Weakness**: possible performance gap versus specialized models on individual tasks
- **Note**: applies Chinese NLP research groups' LLM methodology to time series

#### 3. TimesNet
- **Developer**: Tongji University
- **Feature**: an original approach that transforms 1D time series into 2D space for CNN processing
- **Strength**: covers five tasks — long-term forecasting, short-term forecasting, imputation, anomaly detection, classification
- **Weakness**: an architecture research effort rather than a foundation model; no zero-shot
- **GitHub**: https://github.com/thuml/Time-Series-Library

#### 4. PatchTST
- **Developer**: Tsinghua University + IBM Research
- **Feature**: a patch-based approach similar to TimesFM, Transformer-based
- **Note**: can be seen as an architectural precursor to TimesFM

#### 5. iTransformer
- **Developer**: Chinese Academy of Sciences
- **Feature**: applies the Transformer's attention mechanism to the variable dimension rather than the time dimension
- **Strength**: excellent performance in multivariate forecasting

### Detailed Analysis of US/Canadian Competing Projects

#### 1. Chronos & Chronos-Bolt (Amazon)
- **Feature**: T5-architecture based, tokenizes time-series values and processes them as a language model
- **Strength**: the strongest at probabilistic forecasting; outperforms TimesFM in electricity price forecasting
- **Weakness**: inference speed greatly improved in Chronos-Bolt but still relatively heavy
- **Note**: supports one-click deployment via AWS SageMaker JumpStart

#### 2. TimeGPT (Nixtla)
- **Feature**: the first commercial time-series foundation model, offered as an API
- **Strength**: easiest-to-use interface, fine-tuning support, includes anomaly detection
- **Weakness**: not open source, incurs API costs, internal model structure undisclosed
- **Pricing**: $29-$299/month (as of 2025)

#### 3. Moirai (Salesforce)
- **Feature**: patch-based masked encoder, handles various frequencies with a single model
- **Strength**: multivariate support, probabilistic forecasting, various model sizes (Small/Base/Large)
- **Weakness**: inference speed, some performance gaps versus TimesFM in specific domains

#### 4. MOMENT (CMU)
- **Feature**: a large pre-trained model for time-series analysis, uses a masking approach
- **Strength**: broad task coverage — anomaly detection, classification, imputation
- **Note**: supervised-learning based; fine-tuning maximizes performance

### Performance Comparison (Research Summary)

| Task | 1st place | 2nd place | TimesFM ranking |
|--------|-----|-----|-------------|
| Long-horizon forecasting | TimesFM | Moirai | **1st** |
| Electricity price forecasting | Chronos-Bolt | Time-MoE | 3rd |
| Short-term load forecasting | TimesFM | Chronos | **1st** |
| Monthly precipitation forecasting | TimesFM | SARIMA | **1st** (for some seasons) |
| Multivariate forecasting | Moirai | iTransformer | Lower ranks |
| Anomaly detection | MOMENT | UniTS | N/A |

---

## Getting Started Guide

### Installation

```bash
# PyTorch version (recommended)
pip install timesfm[torch]

# JAX/Flax version
pip install timesfm[jax]
```

### Basic Forecasting Example (PyTorch)

```python
import timesfm
import numpy as np

# Load model
tfm = timesfm.TimesFm(
    hparams=timesfm.TimesFmHparams(
        backend="torch",
        per_core_batch_size=32,
        horizon_len=128,
    ),
    checkpoint=timesfm.TimesFmCheckpoint(
        huggingface_repo_id="google/timesfm-2.0-200m-pytorch"
    ),
)

# Run forecast
forecast_input = [np.sin(np.linspace(0, 20, 100))]  # example time series
point_forecast, quantile_forecast = tfm.forecast(forecast_input)
```

### BigQuery ML Integration

```sql
-- Example of using TimesFM in BigQuery ML
SELECT *
FROM ML.FORECAST(
  MODEL `project.dataset.timesfm_model`,
  STRUCT(30 AS horizon, 0.9 AS confidence_level)
)
```

---

## Adoption Roadmap (Investment Context)

```
Phase 1: Data Collection
├── FRED API: macroeconomic time series (GDP, CPI, unemployment rate)
├── Yahoo Finance / FinanceDataReader: stock price data
└── DART: corporate quarterly earnings data

Phase 2: Applying TimesFM
├── Measure baseline performance via zero-shot forecasting
├── LoRA fine-tuning with domain data
└── Generate confidence intervals via quantile forecasting

Phase 3: Signal Generation
├── Compare forecast vs. consensus
├── Compare Polymarket prices against TimesFM-derived probabilities
└── Compute risk-adjusted returns

Phase 4: Production Application
├── Portfolio rebalancing trigger
├── Options strategy (using volatility forecasts)
└── Prediction market arbitrage
```

---

## Summary Comparison Table

| Feature | TimesFM | TimeGPT | Chronos | Moirai | Time-MoE |
|------|---------|---------|---------|--------|----------|
| Developer | Google | Nixtla | Amazon | Salesforce | Beihang Univ. |
| Parameters | 200M | Not disclosed | Various | Various | Various |
| Open source | Yes | No | Yes | Yes | Yes |
| Zero-shot | Yes | Yes | Yes | Yes | Yes |
| Multivariate | Limited | Yes | Yes | Yes | Partial |
| Probabilistic forecasting | Yes | Yes | Yes | Yes | Limited |
| Google integration | Yes | No | No | No | No |
| Inference speed | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ |
| Community | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | ★★★☆☆ |

---

## Conclusion

TimesFM is a **lightweight time-series foundation model** developed by Google Research, with its main strengths being zero-shot forecasting performance and Google ecosystem integration. It delivers strong performance despite a compact 200M-parameter size, and can be adopted at enterprise scale via BigQuery ML.

**Application points in an investment/finance context**
- More suited to **macroeconomic indicators, corporate revenue, and demand forecasting** than raw stock prices
- Usable for probability estimation in economic-indicator-related markets on prediction platforms like Polymarket
- Synergy is maximized when combined with LLM-based news sentiment analysis rather than used standalone

**Selection criteria**
- BigQuery/GCP environment -> **TimesFM**
- AWS environment -> **Chronos-Bolt**
- API-only requirement -> **TimeGPT**
- Multivariate + probabilistic forecasting -> **Moirai**
- Power/energy domain -> **Time-MoE**

---

## References

- [GitHub repository](https://github.com/google-research/timesfm)
- [Paper (arXiv)](https://arxiv.org/abs/2310.10688)
- [HuggingFace checkpoint](https://huggingface.co/google/timesfm-2.0-200m-pytorch)
- [Google Research blog](https://research.google/blog/a-decoder-only-foundation-model-for-time-series-forecasting/)
- [BigQuery ML integration docs](https://cloud.google.com/bigquery/docs/reference/standard-sql/bigqueryml-syntax-forecast)

---

*Last updated: June 2025 | Written by: Vibe Investing Research*
