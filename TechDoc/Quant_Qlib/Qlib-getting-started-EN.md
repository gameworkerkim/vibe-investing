# Microsoft Qlib Getting Started — Complete Guide for Korean Developers (Toss Open API Integration Testing)

> Last Verified: 2026-07-05 (microsoft/qlib main branch)
> Target Audience: Python developers new to building quant/ML backtest environments

---

## 1. Qlib Project Overview

**Qlib** is an **AI-oriented Quantitative Investment Platform** open-sourced by Microsoft Research (MSRA) in September 2020. It covers the full ML pipeline — data processing, model training, and backtesting — spanning the entire quant investing workflow from alpha discovery → risk modeling → portfolio optimization → order execution.

It supports three learning paradigms:

| Paradigm | Purpose | Representative Implementation |
| :--- | :--- | :--- |
| Supervised Learning | Discovering complex nonlinear market patterns | LightGBM, GRU, Transformer (25+ models) |
| Market Dynamics | Adapting to concept drift, non-stationarity | DDG-DA, Rolling Retraining |
| Reinforcement Learning | Continuous trading decisions, order execution optimization | PPO, OPDS |

**RD-Agent** (LLM-based autonomous R&D agent) extends this toward automated factor discovery and model optimization. See the paper: "R&D-Agent-Quant: A Multi-Agent Framework for Data-Centric Factors and Model Joint Optimization" (arXiv:2505.15155).

Project scale: ~40,000 GitHub Stars, 6,000+ Forks (as of 2026). Top-tier Python quant open source.

---

## 2. Key Advantages

### 2.1 All-in-One Pipeline
Data processing → factor computation → model training → backtest → report analysis → online serving — all in one framework. Drastically reduces integration costs compared to cobbling together zipline (backtest only), backtrader (strategy only), and separate factor libraries.

### 2.2 Proven High-Performance Data Infrastructure
Qlib designed its own financial time-series binary storage format with a 2-tier cache (ExpressionCache, DatasetCache). Official benchmark (800 stocks × 14 factors, 2007–2020 daily, 1 CPU):

| Storage | Time (sec) | vs Qlib Full Cache |
| :--- | ---: | ---: |
| MySQL | 365.3 ± 7.5 | ~49x slower |
| InfluxDB | 368.2 ± 3.6 | ~50x slower |
| MongoDB | 253.6 ± 6.7 | ~34x slower |
| HDF5 | 184.4 ± 3.7 | ~25x slower |
| Qlib (no cache) | 147.0 ± 8.8 | ~20x slower |
| Qlib (+ExpressionCache) | 47.6 ± 1.0 | ~6x slower |
| **Qlib (+Expression +Dataset cache)** | **7.4 ± 0.3** | baseline |

On 64 CPUs, uncached drops to 8.8s, ExpressionCache-only to 4.2s. General-purpose databases are structurally disadvantaged for financial data loading due to multi-layer interfaces and unnecessary format conversions.

### 2.3 Expression-Based Factor Engine
Define factors as string expressions like `Ref($close, 1)/$close - 1` and the engine automatically handles vectorized computation and caching. Much shorter code than pandas rolling/shift combinations; especially fast in iterative experiments thanks to cache reuse.

### 2.4 Reproducible Model Zoo
From GBDT family (LightGBM, XGBoost, CatBoost) to deep learning (LSTM, GRU, ALSTM, GATs, Transformer, Localformer, TRA, TCN, ADARNN, ADD, IGMTF, HIST, KRNN, Sandwich, TabNet, DoubleEnsemble, TCTS, SFM, TFT) — 25+ SOTA models comparable under identical datasets (Alpha158/Alpha360) and backtest conditions. It's no exaggeration to call it "the only quant framework where you can directly reproduce paper numbers."

### 2.5 Built-In Non-Stationarity Tools
Rolling Retraining and meta-learning-based DDG-DA address market regime changes with benchmarks included. This is Qlib's unique territory — almost no other open-source backtester has it.

### 2.6 Automated R&D via RD-Agent
LLMs autonomously run factor hypothesis → code → backtest → evaluate → improve loops. Also supports extracting factors from research reports (PDF). Demo: rdagent.azurewebsites.net

---

## 3. Comparison with Similar Projects

| Project | Nature | Position vs Qlib |
| :--- | :--- | :--- |
| **zipline / zipline-reloaded** | Event-based backtester | Backtest only. No ML pipeline or factor engine. Community-maintained after Quantopian shutdown |
| **backtrader** | Event-based backtester | Strong for strategy logic; ML integration is manual. Many Korean users |
| **vectorbt** | Vectorized backtester | Very fast but not a factor research/model training framework |
| **QuantConnect (LEAN)** | Cloud quant platform | Strong in live trading integration, C#/Python. Qlib wins on open research reproducibility |
| **Qbot / QuantMind / qlib-learning** | Qlib-based higher-level apps | Use Qlib as core engine. Quick exploration |

In summary: Qlib occupies a position with virtually no competitor — **"AI model research + backtest integration."** However, **live order execution** (broker API) is out of scope, so you must build your own execution layer for real trading.

---

## 4. Installation

### 4.1 Requirements

| Item | Details |
| :--- | :--- |
| OS | Linux, Windows, macOS (Linux recommended — some scripts like `run_all_model.py` are Linux-only) |
| Python | **3.8 ~ 3.12** officially supported |
| Package Manager | Conda strongly recommended (system Python may miss header files causing build failures) |
| Required Dependencies | numpy, cython, lightgbm, pytorch (for deep learning models) |

```bash
conda create -n qlib python=3.10
conda activate qlib
```

### 4.2 Three Installation Methods

**Method 1: pip (stable, recommended)**
```bash
pip install pyqlib
```

**Method 2: Source install (for latest main branch features)**
```bash
pip install numpy
pip install --upgrade cython

git clone https://github.com/microsoft/qlib.git && cd qlib
pip install .            # For development: pip install -e ".[dev]"
```
> Note: The old `python setup.py install` is deprecated. Always use `pip install .`

**Method 3: Docker (isolated environment)**
```bash
docker pull pyqlib/qlib_image_stable:stable
docker run -it --name qlib -v <local_dir>:/app pyqlib/qlib_image_stable:stable
```

**Apple Silicon (M1/M2/M3) Mac users**: LightGBM build may fail due to missing OpenMP. Run `brew install libomp` first.

**Verify installation**:
```python
import qlib
print(qlib.__version__)   # 0.9.x
```

### 4.3 Data Preparation — Important Changes

> **[As of 2026]** Official data download scripts are temporarily suspended due to tightened data security policies. The official README recommends the community-maintained investment_data repository by chenditc. Old docs' `python scripts/get_data.py qlib_data_cn ...` commands no longer work.

**Recommended: Community dataset (China A-shares, TuShare-based, daily updates)**
```bash
wget https://github.com/chenditc/investment_data/releases/latest/download/qlib_bin.tar.gz
mkdir -p ~/.qlib/qlib_data/cn_data
tar -zxvf qlib_bin.tar.gz -C ~/.qlib/qlib_data/cn_data --strip-components=1
rm -f qlib_bin.tar.gz
```

**Official script (when restored, Yahoo Finance crawler-based)**
```bash
# Daily
python -m qlib.cli.data qlib_data --target_dir ~/.qlib/qlib_data/cn_data --region cn
# 1-minute
python -m qlib.cli.data qlib_data --target_dir ~/.qlib/qlib_data/cn_data_1min --region cn --interval 1min
```

**Data integrity check** (recommended habit):
```bash
python scripts/check_data_health.py check_data --qlib_dir ~/.qlib/qlib_data/cn_data
```

### 4.4 Initialization

```python
import qlib
from qlib.constant import REG_CN

provider_uri = "~/.qlib/qlib_data/cn_data"
qlib.init(provider_uri=provider_uri, region=REG_CN)
```

`region` supports `REG_CN` (China), `REG_US` (US), `REG_TW` (Taiwan). Region affects data paths **and trading constraint rules** (China's price limits, T+1, minimum trading units), so when using custom market data, separately review trading rules in backtest configuration.

---

## 5. First Workflow Execution

### 5.1 Automated via qrun (config file-based)

`qrun` automates dataset construction → model training → signal generation → backtest → evaluation with a single YAML.

```bash
cd examples    # Important: running from qlib repo root causes import conflicts
qrun benchmarks/LightGBM/workflow_config_lightgbm_Alpha158.yaml
```

Example output (CSI300 + Alpha158 + LightGBM, from official README):

```
'The following are analysis results of the excess return without cost.'
annualized_return   0.178316    # 17.83% annual excess return
information_ratio   1.996555
max_drawdown       -0.081806

'The following are analysis results of the excess return with cost.'
annualized_return   0.128982    # 12.90% with costs
information_ratio   1.444287
max_drawdown       -0.091078
```

Note the ~5%p gap between cost-free and cost-included returns. The framework shows by default **why you shouldn't trust cost-free backtest numbers.**

### 5.2 Code-Based Custom Workflow

If qrun's auto workflow doesn't fit, assemble modules directly:

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

### 5.3 Direct Data Query via Expression Engine

```python
from qlib.data import D

# Simple query
df = D.features(
    ["SH600000"],
    ["$close", "$volume"],
    start_time="2020-01-01", end_time="2020-12-31", freq="day",
)

# Define factors on the fly: 5-day momentum, 20-day volatility
df = D.features(
    D.instruments("csi300"),
    ["Ref($close, 5)/$close - 1", "Std($close/Ref($close,1)-1, 20)"],
    start_time="2019-01-01", end_time="2020-12-31",
)
```

Expression strings ARE factor definitions; results are cached in ExpressionCache for dramatic speed on subsequent calls.

### 5.4 Graphical Reports

```bash
python -m pip install ".[analysis]"
jupyter notebook examples/workflow_by_code.ipynb
```

Reports available: group cumulative returns, long-short return distribution, IC/monthly IC, signal autocorrelation, portfolio backtest return curves.

---

## 6. Benchmarks — Model Performance Comparison

### 6.1 Understanding Datasets: Alpha158 vs Alpha360

| Dataset | Characteristics | Best Model Type |
| :--- | :--- | :--- |
| **Alpha158** | 158 human-designed factors (typical feature engineering). Weak spatial relationships between features | GBDT family (LightGBM, CatBoost, etc.) |
| **Alpha360** | Raw price/volume over last 60 days (minimal feature engineering). Strong temporal spatial relationships | Deep learning (GRU, ALSTM, TRA, etc.) |

This distinction matters because **the general ML rule that GBDT wins on tabular data and neural nets win on raw time series is faithfully reproduced in Qlib benchmarks.** Choose your model family based on your factor characteristics — blindly using the "hottest model" is inefficient.

### 6.2 Market Dynamic Adaptation Benchmark (CSI500, Alpha158, 2017.01–2020.08 rolling)

| Model | IC | ICIR | Rank IC | Annual Return | IR | MDD |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| RR[Linear] | 0.0945 | 0.5989 | 0.1069 | 8.57% | 1.368 | -9.86% |
| DDG-DA[Linear] | 0.0983 | 0.6157 | 0.1108 | 7.64% | 1.190 | -7.69% |
| RR[LightGBM] | 0.0816 | 0.5887 | 0.0912 | 7.71% | 1.320 | -9.09% |
| **DDG-DA[LightGBM]** | **0.0878** | **0.6185** | **0.0975** | **12.61%** | **2.010** | **-7.44%** |

Key takeaway: Combining DDG-DA (meta-learning distribution adaptation) with LightGBM improves annual return by +4.9%p and IR from 1.32 to 2.01 over simple rolling retraining. **Same model, dramatically different results depending on market change adaptation strategy.**

### 6.3 Full Model Comparison Table

Performance comparison for 25+ models is maintained at:
`https://github.com/microsoft/qlib/blob/main/examples/benchmarks/README.md`

To run multiple models yourself (Linux only):
```bash
python run_all_model.py run 10          # all models, 10 iterations
python run_all_model.py run 3 lightgbm Alpha158 csi500   # specific model/dataset/universe
```

Official docs recommend 20+ iterations for deep learning models with randomness. **Judging model superiority from a single run is statistically meaningless.**

---

## 7. Practical Section for Korean Developers: KRX Data Integration

Qlib doesn't officially support the Korean market (regions: CN/US/TW only). However, the CSV → Qlib binary conversion tool (`dump_bin.py`) exists, making KOSPI/KOSDAQ data integration straightforward.

### 7.1 Data Collection via pykrx → CSV Generation

```python
# pip install pykrx
from pykrx import stock
import pandas as pd, os

os.makedirs("csv_kr", exist_ok=True)
tickers = stock.get_market_ticker_list(market="KOSPI")

for t in tickers[:50]:   # example: top 50 stocks
    df = stock.get_market_ohlcv("20180101", "20260630", t)
    df = df.reset_index().rename(columns={
        "날짜": "date", "시가": "open", "고가": "high",
        "저가": "low", "종가": "close", "거래량": "volume",
    })
    df["symbol"] = t
    # Qlib convention: factor column for adjusted price calculation (1.0 for unadjusted)
    df["factor"] = 1.0
    df.to_csv(f"csv_kr/{t}.csv", index=False)
```

### 7.2 Convert to Qlib Binary

```bash
python scripts/dump_bin.py dump_all \
    --csv_path ./csv_kr \
    --qlib_dir ~/.qlib/qlib_data/kr_data \
    --include_fields open,close,high,low,volume,factor \
    --date_field_name date --symbol_field_name symbol
```

### 7.3 Essential Checklist for Korean Market Data

| Item | Details |
| :--- | :--- |
| **Adjusted prices (factor)** | Verify pykrx OHLCV reflects adjusted prices. Backtesting without adjustment for splits/dividends distorts returns |
| **Trading rules** | Using `region=REG_CN` applies Chinese ±10% price limits and T+1. Customize backtest executor for Korean rules (±30% limits, T+0 rotation) |
| **Trading halts/delistings** | Include delisted stocks to prevent survivorship bias. pykrx is current-listing-centric — know this limitation |
| **Calendar** | Check `~/.qlib/qlib_data/kr_data/calendars/day.txt` for Korean holiday calendar auto-generation |
| **Benchmark index** | Add KOSPI200 as a separate symbol for backtest benchmarking |
| **Alpha158 factors** | Factor definitions are market-neutral and applicable to Korean data. But validation must be redone — CSI300 IC may not reproduce in the Korean market |

### 7.4 Toss Open API ↔ Qlib Middleware (Node.js/TypeScript + Redis)

Qlib is a Python framework, but what Qlib actually needs is "data in its format." The data pipeline can be in any language. This section describes a middleware that fetches prices from the Toss Securities Open API, normalizes them to Qlib CSV format (`date,open,high,low,close,volume,symbol,factor`), and feeds them to `dump_bin.py`.

**Scope: authentication and market/instrument data queries only. Order creation/modification/cancellation (trading) is intentionally excluded.** See section 7.4.6 for rationale.

Code is at [`TechDoc/Quant_Qlib/toss-qlib-middleware/`](./toss-qlib-middleware) ([Korean README](./toss-qlib-middleware/README.md) / [English README](./toss-qlib-middleware/README_EN.md) / [llms.txt](./toss-qlib-middleware/llms.txt)). Toss Open API auth/endpoint specs were aligned with the existing [`Toss/`](../../Toss) project in this repo.

#### 7.4.1 Why a Middleware?

Qlib's `dump_bin.py` only needs to understand CSV; the Qlib engine only cares about the subsequent binary format and cache. Toss Open API has OAuth2 auth, token expiry, rate limits, pagination — "API client problems." Separating auth/call management from factor/modeling keeps both clean.

```
TOSS Open API  --OAuth2-->  [Node.js/TS Middleware]  --CSV(csv_kr/*.csv)-->  scripts/dump_bin.py  -->  ~/.qlib/qlib_data/kr_data
                                   |
                                 Redis (token cache + price cache)
```

#### 7.4.2 Authentication (OAuth2 Client Credentials)

Toss Securities Open API uses **OAuth2 Client Credentials Grant** (no user login). Specs verified from `Toss/src/toss.js` and `Toss/docs/Toss_OpenAPI_Guide.md`:

1. Login to Toss WTS → Settings → Open API menu → issue `client_id` / `client_secret`
2. `POST {baseUrl}/oauth2/token` with `grant_type=client_credentials`, `client_id`, `client_secret` as **form-urlencoded body** (not Basic Auth header) → returns `access_token`, `expires_in`
3. Validity is **86,400 seconds (24 hours) with no refresh token** — implement proactive re-issuance before expiry
4. All subsequent calls use `Authorization: Bearer {access_token}` header
5. Account-level APIs require additional `X-Tossinvest-Account` header (not implemented — middleware doesn't call account/order APIs)

> **Verification status**: Official docs (`developers.tossinvest.com/docs`) use JavaScript rendering, but sending the above form-body request to `POST /oauth2/token` returns (even with wrong credentials) `{"error":"invalid_client", ...}` — confirming the endpoint path and request format via live testing. Exact candle/price response field schemas are unconfirmed, so the middleware defensively accepts multiple candidate keys. Note that the service itself is in a pre-registration phase as of June 2026 with no confirmed launch date.

#### 7.4.3 Redis Caching Strategy

| Cache Target | Key | TTL | Rationale |
| :--- | :--- | :--- | :--- |
| Access Token | `toss:access_token` | `86400 - safety_margin (default 1hr)` | No refresh token — must proactively re-issue well before expiration |
| Token Reissuance Lock | `toss:access_token:lock` | 10s (`SET NX`) | Prevent thundering herd when multiple requests detect expiration simultaneously |
| Settled Historical Candles | `toss:candles:{symbol}:{interval}:{start}:{end}` | 1 day (`CANDLE_TTL_HISTORICAL_SEC`) | Closed candles won't change — long cache |
| Intraday (Unsettled) Candles | Same key | Short (`CANDLE_TTL_TODAY_SEC`, default 30s) | During market hours, current candle keeps updating |
| Current Price | `toss:price:{symbol}` | Short (`PRICE_TTL_SEC`, default 5s) | Per-instrument cache enables cross-batch reuse |

401 (token expired/invalid) → immediately clear cache and retry once. 429 (rate limit) → check `Retry-After` header and backoff. Candle API returns max 200 per request with no `start`/`end` filter, so paginate backwards from latest via `before` cursor then sort ascending (same strategy as `Toss/src/toss.js`).

#### 7.4.4 Installation & Execution

```bash
cd TechDoc/Quant_Qlib/toss-qlib-middleware
npm install
npm run setup       # Interactive .env generation + optional live token issuance test
npm run typecheck
npm test            # Passes without Redis server (in-memory adapter for logic verification)
npm run dev         # http://localhost:4000, requires actual Redis
```

Core `.env` entries (same key names as `Toss/.env.example`):

```
TOSS_BASE_URL=https://openapi.tossinvest.com
TOSS_TOKEN_PATH=/oauth2/token
TOSS_CANDLES_PATH=/api/v1/candles
TOSS_PRICES_PATH=/api/v1/prices
REDIS_URL=redis://127.0.0.1:6379
QLIB_CSV_EXPORT_DIR=./csv_kr
```

All endpoint paths are environment variables — change `.env` without touching code.

#### 7.4.5 API & Qlib Pipeline Integration

Middleware endpoints:

| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/health` | Health check |
| GET | `/api/candles/:symbol?start=&end=&interval=day` | Normalized candle JSON (via Redis cache, built-in `before` pagination) |
| GET | `/api/prices?symbols=005930,000660` | Batch current prices (comma-separated, chunked at 200) |
| POST | `/api/export/qlib` `{symbols, start, end, outDir?}` | Fetch multiple symbols → CSV in `csv_kr/{symbol}.csv` (section 7.1 format) |

CLI for CSV-only without running the server:

```bash
npm run export:qlib -- --symbols 005930,000660 --start 2020-01-01 --end 2026-07-01
```

Generated CSVs feed directly into the section 7.2 conversion command.

#### 7.4.6 Why Trading (Order Execution) Is Not Included

This middleware is a **data pipeline**, not an **order execution system**. Qlib itself (section 3) excludes live order integration, and section 8.3 warns that backtest performance doesn't guarantee live results. Auth and price queries are common ground worth standardizing as middleware, but order logic (state management, idempotency/duplicate prevention, risk limits, fill confirmation) varies so radically by strategy and risk tolerance that a generic implementation would be dangerous.

To extend: see [`src/trading/README.md`](./toss-qlib-middleware/src/trading/README.md). Reuse `TossAuthService` (token caching) and `TossApiClient` (HTTP patterns), but **always validate real order code in small-amount/paper environments first.**

---

## 8. Pitfalls — Real-World Issues You Will Encounter

### 8.1 Environment/Installation

1. **Don't import from repo root**: Running `import qlib` from the qlib repo root causes `ModuleNotFoundError: No module named 'qlib.data._libs.rolling'` (local folder shadows the package). Always `cd examples` first.
2. **pandas 2.x compatibility**: pandas 1.5→2.0 changed `groupby`'s `group_key` default, potentially breaking TRA dataset, TFT, and RL order execution scripts. Pinning `pandas<2.0` is the quickest workaround.
3. **TFT model requires Python 3.6–3.7 + tensorflow 1.15**: Won't run on modern environments. Check per-model requirements.txt.
4. **Works without Redis**: Core functions work fine without Redis; only cache portions are disabled. If Redis is used and locks get stuck, `QlibCacheException` is thrown — delete the Redis key.
5. **multiprocessing on Windows**: `RuntimeError: An attempt has been made to start a new process...` — classic Windows issue when running without `if __name__ == "__main__":` guard.

### 8.2 Data Quality

6. **Yahoo Finance data limitations**: The official crawler uses Yahoo Finance data, which the docs themselves acknowledge has gaps/errors. Using your own high-quality data is the official recommendation. Include `check_data_health.py` in your pipeline permanently.
7. **Offline data can't be incrementally updated**: Official distribution data removes some fields for size reduction, preventing incremental updates. If you need ongoing updates, build your own collector from scratch with an incremental update system.

### 8.3 Methodology — Most Important

8. **Look-ahead bias**: Custom factors using negative `Ref` (e.g., `Ref($close, -1)`) reference future data. This is needed for label definition, but if it leaks into features, the backtest becomes meaningless.
9. **Trading costs & slippage**: As shown in section 5.1, costs change annual return from 17.8% to 12.9%. For Korean market, reflect transaction tax (0.18%~), commissions, and bid-ask slippage in executor settings.
10. **Overfitting**: Iteratively tuning hyperparameters on the validation set inevitably inflates test performance. Rolling validation (benchmarks_dynamic approach) is more reliable than single train/valid/test splits.
11. **IC of 0.05 is not "good" — it's a starting point**: Daily IC of 0.03–0.05 level signals usually can't overcome trading costs and capacity constraints. Look at ICIR (stability) and cost-adjusted IR, not just IC.
12. **Backtest is not execution**: Qlib backtest performance does not guarantee live results. Order book depth, fill delay, and market impact are separate issues. Qlib's RL order execution module partially addresses the gap but isn't complete.

> One-line summary: **Qlib is a calculator, not an oracle.** No matter how sophisticated the framework, input data quality and methodological discipline determine the outcome.

---

## 9. RD-Agent Integration (Optional)

```bash
pip install rdagent
# After setting LLM API keys:
rdagent fin_factor    # Factor discovery loop
rdagent fin_model     # Model optimization loop
rdagent fin_factor_report --report_folder=<PDF folder>   # Report-based factor extraction
```

Caution: RD-Agent incurs significant LLM API costs (dozens to hundreds of calls per factor loop), and generated factors require independent statistical validation. Automation does not replace verification.

---

## 10. Recommended Learning Path

| Stage | Task | Estimated Time |
| :--- | :--- | :--- |
| 1 | Install + download community data + run `qrun` LightGBM benchmark once | Half day |
| 2 | Interpret reports via `workflow_by_code.ipynb` (IC, group returns, backtest curves) | 1 day |
| 3 | Define 3 custom factors via expression engine → add to Alpha158 → compare performance | 2–3 days |
| 4 | KRX data conversion + Korean market backtest pipeline | 1 week |
| 4.5 | (Optional) Automate step 4 CSV generation via Toss Open API middleware (section 7.4) | 2–3 days |
| 5 | Adopt rolling retraining (benchmarks_dynamic) → compare with single split | 1 week |
| 6 | (Optional) RL order execution / RD-Agent experiments — live order integration is DIY (section 7.4.6) | Beyond |

---

## 11. References

| Resource | Link |
| :--- | :--- |
| GitHub Repository | https://github.com/microsoft/qlib |
| Official Documentation | https://qlib.readthedocs.io |
| Model Benchmark Table | https://github.com/microsoft/qlib/blob/main/examples/benchmarks/README.md |
| Dynamic Adaptation Benchmarks | https://github.com/microsoft/qlib/tree/main/examples/benchmarks_dynamic |
| Community Data (CN) | https://github.com/chenditc/investment_data/releases |
| RD-Agent | https://github.com/microsoft/RD-Agent |
| Qlib Paper | https://arxiv.org/abs/2009.11189 |
| R&D-Agent-Quant Paper | https://arxiv.org/abs/2505.15155 |
| Qlib-Server (Online Mode) | https://github.com/microsoft/qlib-server |
| Toss Securities Open API Docs | https://developers.tossinvest.com/docs |
| Toss ↔ Qlib Middleware (this repo) | [`TechDoc/Quant_Qlib/toss-qlib-middleware`](./toss-qlib-middleware) |
| Toss API Reference Project (this repo) | [`Toss/`](../../Toss) — working dashboard, includes GUIDE.md and docs/Toss_OpenAPI_Guide.md |

---

*This document was written on 2026-07-05 based on cross-validation against the microsoft/qlib main branch and official documentation. All metrics (benchmarks, performance comparisons) are sourced from the official repository's public materials; reproduction results may vary by execution environment. Section 7.4 Toss Open API middleware was aligned with authentication specs based on this repo's `Toss/` project sources and docs, and logic was verified via own unit tests (`npm test`, 10 passing). `POST /oauth2/token` received `invalid_client` response (even with wrong credentials), confirming the endpoint path and request format via live testing, though exact candle/price response field schemas require re-verification after real account issuance.*
