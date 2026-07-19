# Vibe Quant — 使用手册（中文）

面向多 LLM 量化委员会的教学沙箱。不构成投资建议。

| 语言 | 手册 |
|---|---|
| 中文 | 本文 |
| English | [USER_MANUAL.md](USER_MANUAL.md) |
| 한국어 | [USER_MANUAL_KR.md](USER_MANUAL_KR.md) |

**在线演示：** [https://vibequant-web.pages.dev/#workspace](https://vibequant-web.pages.dev/#workspace)

---

## 1. 界面布局

| 区域 | 作用 |
|---|---|
| **LLM 提示输入**（左上） | 自然语言量化请求 → DeepSeek →（可选）生成 Python |
| **Python 输入**（右上） | 在浏览器（Pyodide）中编辑并运行 `vi_browser` 代码 |
| **结果**（左下） | 成功 stdout / LLM 回答 |
| **Error log**（左下） | 失败、堆栈、被拒绝的提示 |
| **图表**（右下） | `show_chart(...)` 输出 |

页面语言可用顶部选择器切换（`zh` / `en` / `ko`）。

---

## 2. Examples（示例）用法

Examples 芯片会把半导体篮子（**NVDA · MU · SNDK · AVGO**）的演示代码填入 Python 编辑器。

### 步骤

1. 打开网站，找到 **Examples** 芯片栏，或跳转到 `#workspace`。
2. 点击芯片，例如 **Momentum**、**RSI**、**Moving Average**，或金色 **multifactor** 示例。
3. 代码出现在 **Python 输入** 后，检查内容并点击 **运行**。
4. 在 **结果** 查看打印，在 **图表** 查看序列；失败则查看 **Error log**。

### 常用控件

| 控件 | 作用 |
|---|---|
| **黄金示例** | 加载 multifactor 委员会演示 |
| **Clear** | 清空 Python 编辑器 |
| **复制** 图标 | 复制 Python 或 LLM 提示文本 |
| API 表 **加载示例** | 加载该行的短 API 片段 |

### 提示

建议 `days` ≤ 180。过长序列会占用浏览器内存。优先使用桌面 Chrome/Firefox；iOS 上 Pyodide 可能失败。

---

## 3. 用 LLM 做量化

DeepSeek 将仅限金融的提示转换为说明和/或可运行的 `vi_browser` Python。密钥只存在于 Worker。配置见 [SECRETS_SETUP.md](SECRETS_SETUP.md)，功能说明见 [LLM_QUANT_PROMPT.md](LLM_QUANT_PROMPT.md)。

### 步骤

1. 在 **LLM 提示输入** 选择 **模型**：`V4 Pro`（代码更好）或 `V4 Flash`（更快）。
2. 输入金融问题，或点击金色 LLM 芯片（如半导体动量）。
3. 点击 **运行**。限制：**每 30 秒 1 次**。
4. 进度：调用 DeepSeek →（如有）运行生成的 Python。
5. 产出：
   - **结果**：回答与/或运行摘要  
   - **Python 输入**：有代码时自动填入  
   - **图表**：脚本调用了 `show_chart` 时  
   - **Error log**：非金融拒绝、冷却或运行时错误  

### 推荐提示写法

```text
比较 NVDA、MU、SNDK、AVGO 的 22 日动量并排名。
只对可计算标的排名，排除 N/A。
用 vi_browser 生成可运行的 Python。
```

```text
对 005930（三星电子）做 MA(10/30) 交叉教学回测。
fee_bps=10，输出 total_return、mdd、sharpe、cagr，并用 show_chart 画权益曲线。
```

```text
用中文简短解释 Momentum = close/close[22]-1。
只要 answer，不要代码。
```

### 模型必须遵守的规则

- 仅限金融（美股/韩股、加密、量化指标）。其他主题会被拒绝（冷却）。
- 浏览器是**列表 API**，不是 pandas：
  - `candles = await get_candles("NVDA", days=180, provider="yahoo")`
  - `closes = [c["close"] for c in candles]`
- 只用顶层 `await` — 禁止 `asyncio.run`。
- 不要对可能为 `None` 的值使用 `:.2f` — 使用 `fmt` 助手。
- 韩国代码通常需要 `.KS`（如 `000660.KS`）。

契约详情：[LLM_OUTPUT_SCHEMA.md](LLM_OUTPUT_SCHEMA.md)。

---

## 4. 用 Python 手写量化

在 **Python 输入** 编写或粘贴 `vi_browser` 代码，然后 **运行**。计算在浏览器（Pyodide）完成；行情经 Worker（`provider="yahoo"`）获取。

### 最小模板

```python
from vi_browser import get_candles, momentum, show_chart

def fmt(x, n=2):
    return "N/A" if x is None else f"{x:.{n}f}"

def last_num(xs):
    for x in reversed(xs):
        if x is not None:
            return x
    return None

TICKERS = ["NVDA", "MU", "AVGO"]
WINDOW = 22

rows = []
series = {}
for sym in TICKERS:
    candles = await get_candles(sym, days=180, provider="yahoo")
    closes = [c["close"] for c in candles]
    m = momentum(closes, WINDOW)
    last = last_num(m)
    series[sym] = m
    rows.append((sym, last))
    print(f"{sym}: mom{WINDOW}={fmt(None if last is None else last * 100)}%")

ranked = sorted([(s, v) for s, v in rows if v is not None], key=lambda x: -x[1])
print("rank:", ", ".join(f"{s}={fmt(v*100)}%" for s, v in ranked))
show_chart(series, title="22d momentum", series_label="mom")
```

### 常用 `vi_browser` API

| API | 用途 |
|---|---|
| `get_candles(symbol, days=..., provider="yahoo")` | OHLCV 字典列表 |
| `returns` / `volatility` / `moving_average` | 基础序列 |
| `momentum(closes, window=22)` | 价格动量 |
| `rsi` / `macd` / `bollinger_bands` | 指标 |
| `max_drawdown(closes)` | MDD 标量 |
| `backtest` / `ma_cross_signal` | 教学回测 |
| `show_chart(...)` | 右侧图表 |

GS → VI 命名映射：[API_MAPPING.md](API_MAPPING.md)。站点 API 页：`apis.html`。

### 工作流建议

1. 从 **Examples** 芯片开始，再改标的与窗口。
2. 或用 **LLM** 起草，再手工收紧后重新 **运行**。
3. 看 **Error log** 处理 `None` 格式化错误 — 加 `fmt` / 长度检查。
4. 若 K 线过短，稍后重试（Worker 会丢弃过短的 R2 缓存并重新拉取 Yahoo）。

---

## 5. 限制与声明

- Cloudflare 免费层 + 浏览器内存 — 不是 GS Quant / Marquee 替代品。
- 数值仅用于**教学与可复现**，不是交易信号。
- LLM 功能需要 Worker 已配置 DeepSeek（`/api/health` 中 `deepseek.configured: true`）。
- 详见 [LIMITATIONS.md](LIMITATIONS.md) 与页脚声明。

*LLMs are spreadsheets for reasoning, not oracles of prediction. The market owes certainty to no one.*
