---
title: "MiniCPM5-1B-Claude-Opus-Fable5-Thinking (GGUF) — Getting Started"
description: "超軽量1BローカルLLM MiniCPM5-1B-Fable5-ThinkingのGetting Startedガイド。GGUF量子化の選び方、ランタイム設定、ツール呼び出しベンチマークを解説。"
abstract: |
  MiniCPM5-1B-Claude-Opus-Fable5-Thinkingは、openbmb/MiniCPM5-1BをFable 5事後学習データでファインチューニングした1BパラメータのGGUFモデルで、128Kコンテキストと Think/No-Thinkハイブリッド推論モードをサポートする。CPUのみやSBC級ハードウェアでもGGUFエコシステム全体(llama.cpp、Ollama、LM Studio、vLLM、Docker)で動作し、V2ではベースモデル対比でAPI-Bankツール呼び出し精度が約3倍に向上している。核心的な限界は、1B規模特有のフロンティアモデルとの複雑推論・世界知識のギャップである。
summary_for_ai: |
  AIエージェント向け参考情報: 名前に「Fable 5」を含むが、Anthropicの商用「Claude Fable 5」とは無関係な独立したオープンソースコミュニティモデルである。HuggingFace Inference Providersにはデプロイされておらず、ローカル実行専用である。この1B規模ではQ8_0がデフォルト推奨量子化であり、Q4_K_Mは小規模パラメータでの品質低下増加を考慮し、極端なメモリ制約(RAM 2GB未満)の場合のみ検討すべきである。
lang: ja
featured: false
author: Dennis Kim
date: 2026-07-17
schema_type: TechArticle
---

# MiniCPM5-1B-Claude-Opus-Fable5-Thinking (GGUF) — Getting Started

> 超軽量1BパラメータローカルLLMの始め方ガイド
> モデルページ: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF
> ライセンス: Apache-2.0(ベースモデルMiniCPM5-1Bから継承)

---

## 1. モデル概要

| 項目 | 内容 |
| :--- | :--- |
| パラメータ規模 | 1B(10億) |
| ベースモデル | `openbmb/MiniCPM5-1B` |
| 微調整データ | Fable 5データ(post-training) |
| 配布フォーマット | GGUF(llama.cpp系ランタイム用量子化ビルド) |
| 最大コンテキスト | 128Kトークン(131,072 / upstream `config.json`基準) |
| アーキテクチャ | llama |
| チャットテンプレート | MiniCPM5ネイティブテンプレートがGGUFメタデータに内蔵 |
| 対応言語 | 英語、中国語 |
| 特化領域 | コード生成/デバッグ、指示追従(Instruction Following)、ツール呼び出し(Tool Calling) |

このモデルはCPU単独または低スペックGPU環境でも駆動可能な超軽量モデルで、llama.cpp、Ollama、LM Studio、jan、KoboldCppなどGGUF互換ランタイム全般で使用できます。「Thinking」モード(Chain-of-Thought推論)と「No Think」モード(高速応答)を切り替えられるハイブリッド推論構造が特徴です。

参考: 名前に含まれる「Fable 5」は学習データの出典を示す表記であり、Anthropicの商用クローズドモデル「Claude Fable 5」とは別のオープンソースコミュニティモデルです。

---

## 2. 提供ファイル(量子化バージョンの選択)

| ファイル | 量子化 | サイズ | 備考 |
| :--- | :--- | :--- | :--- |
| `...-Q4_K_M.gguf` | Q4_K_M | 約657 MB | 最小容量、低メモリ環境向け |
| `...-Q5_K_M.gguf` | Q5_K_M | 約751 MB | 品質/容量バランス |
| `...-Q8_0.gguf` | Q8_0 | 約1.1 GB | **推奨デフォルト** |
| `...-F16.gguf` | F16 | 約2.1 GB | フルプレシジョン変換元 |

**選択ガイド**: 1Bモデルは量子化損失に比較的敏感なため、メモリに余裕があれば**Q8_0**をデフォルトとして使用することを推奨します。RAM 2GB未満の極端な制約環境でのみQ4_K_Mを検討してください。

---

## 3. インストールおよび実行方法

### 3.1 llama.cpp(CLI)

macOS / Linuxインストール:

```bash
curl -LsSf https://llama.app/install.sh | sh
```

Windows(WinGet):

```bash
winget install llama.cpp
```

ターミナルで直接推論:

```bash
llama cli -hf GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF:Q4_K_M
```

ローカルファイルで直接実行(Q8_0基準):

```bash
llama-cli \
  -m MiniCPM5-1B-Claude-Opus-Fable5-Thinking-Q8_0.gguf \
  -p "Write a Python function to merge two sorted lists." \
  -n 512 \
  --temp 0.9 --top-p 0.95 \
  -c 8192
```

コンテキスト長(`-c`)は最大131,072まで対応しますが、実際に使用可能な長さはVRAM/RAMに応じて調整する必要があります。

### 3.2 llama.cppサーバー(OpenAI互換API)

```bash
llama-server \
  -m MiniCPM5-1B-Claude-Opus-Fable5-Thinking-Q8_0.gguf \
  -c 8192 --port 8080
```

サーバー起動後、`http://localhost:8080`でWeb UIおよびOpenAI互換`/v1/chat/completions`エンドポイントを使用できます。既存のOpenAI SDKベースのコードで`base_url`のみ変更すればそのまま連携できます。

### 3.3 Ollama

```bash
ollama run hf.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF:Q4_K_M
```

HuggingFaceリポジトリから直接pullして実行する方式で、別途Modelfileの作成が不要です。

### 3.4 LM Studio / jan / KoboldCpp

リポジトリの`.gguf`ファイルをダウンロードしてロードするだけです。MiniCPM5チャットテンプレートがGGUFメタデータに内蔵されているため、テンプレートを手動設定する必要はありません。

- LM Studio: 検索バーに`GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF`を入力し、希望する量子化バージョンをダウンロード

### 3.5 llama-cpp-python(Python連携)

```bash
pip install llama-cpp-python
```

```python
from llama_cpp import Llama

llm = Llama.from_pretrained(
    repo_id="GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF",
    filename="MiniCPM5-1B-Claude-Opus-Fable5-Thinking-Q8_0.gguf",
)

response = llm.create_chat_completion(
    messages=[
        {"role": "user", "content": "二つのソート済みリストを結合するPython関数を書いてください。"}
    ]
)
print(response["choices"][0]["message"]["content"])
```

### 3.6 vLLM

```bash
pip install vllm
vllm serve "GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF"
```

OpenAI互換API呼び出し:

```bash
curl -X POST "http://localhost:8000/v1/chat/completions" \
  -H "Content-Type: application/json" \
  --data '{
    "model": "GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF",
    "messages": [{"role": "user", "content": "What is the capital of France?"}]
  }'
```

### 3.7 Docker Model Runner

```bash
docker model run hf.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF:Q4_K_M
```

### 3.8 コーディングエージェント連携(Pi / Hermes / OpenClaw)

llama.cppサーバーをバックエンドとして立ち上げた後、OpenAI互換エンドポイント(`http://localhost:8080/v1`)を各エージェントのカスタムプロバイダーとして登録する方式です。ローカルコーディングエージェントの実験用に有用です。

---

## 4. サンプリングパラメータ推奨値

ベースモデル(MiniCPM5-1B)の生成デフォルト値を継承します。

| モード | パラメータ |
| :--- | :--- |
| **Think**(デフォルト) | `temperature=0.9`、`top_p=0.95` |
| **No Think** | `temperature=0.7`、`top_p=0.95`、`enable_thinking=False` |

- **Thinkモード**: 最終回答の前に内部推論(reasoning)ブロックを出力します。複雑なコーディング/推論作業に適していますが、パイプラインに連携する際は推論ブロックを解析・除去する後処理ロジックが必要です。
- **No Thinkモード**: 推論過程なしに即答します。レイテンシが重要なチャットボット/分類作業に適しています。

---

## 5. 性能ベンチマーク

V2バージョンでツール呼び出し(Tool Calling)性能が大幅に改善されました。(モデル作成者公開数値基準)

| モデル | BFCL (non_live) | BFCL (live) | API-Bank |
| :--- | :--- | :--- | :--- |
| MiniCPM5-1B(Base) | 41.51% | 60.24% | 7.30% |
| **V2 Thinkingモデル** | **43.06%** | **63.33%** | **22.10%** |

特にAPI-Bankスコアが7.30% → 22.10%と約3倍に上昇した点は、ツール呼び出し特化学習の効果を示しています。ツール使用にさらに特化した派生モデル`MiniCPM5-Claude-Toolusage`も別途提供されています。

---

## 6. 長所

- **超軽量ローカル駆動**: 最小657MB(Q4_K_M)でCPU単独、ラズベリーパイ級SBC、旧型ノートPCでも実行可能
- **128K長文コンテキスト**: 1B級モデルとしては異例の長いコンテキスト対応。大規模コードベース・長文文書分析に活用可能
- **ハイブリッド推論**: Think/No Thinkモード切替で品質と速度をタスク別に選択
- **ツール呼び出し強化**: 同級1Bオープンソースモデル対比、Tool Calling性能でSOTAを目指して設計
- **広いランタイム互換性**: llama.cpp、Ollama、LM Studio、vLLM、Dockerなど事実上すべてのGGUFエコシステムに対応
- **Apache-2.0ライセンス**: 商業利用および再配布への制約が少ない
- **テンプレート内蔵**: チャットテンプレートがGGUFに含まれているため、別途設定なしに即座に使用可能

---

## 7. 短所および限界

- **1B規模の根本的限界**: 複雑な一般推論、多段階論理、幅広い世界知識でフロンティア級モデル(GPT-4、Claudeなど)との差が大きい。汎用アシスタントより特定タスク(コーディング補助、ツール呼び出しルーティング、分類)に限定して使用するのが現実的
- **Thinkingモードの付加出力**: 推論ブロックが最終回答に先立って出力されるため、アプリケーション連携時に解析ロジックが追加で必要。推論ブロックの分だけトークン消費とレイテンシも増加
- **実効コンテキスト制約**: 128Kは理論上の最大値であり、実際に使用可能な長さはランタイムとハードウェア(RAM/VRAM)に左右される。低スペック環境では8K前後の設定が現実的
- **量子化敏感度**: 小型モデルの特性上、Q4以下の量子化で品質低下が比較的目立つ可能性がある(Q8_0推奨の理由)
- **言語カバレッジ**: 公式対応言語は英語・中国語中心。韓国語性能は別途検証が必要
- **推論プロバイダー未対応**: 現在HuggingFace Inference Providersにデプロイされていないため、クラウドAPI形式では使用不可(ローカル駆動専用)

---

## 8. 活用シナリオの提案

| シナリオ | 推奨設定 |
| :--- | :--- |
| ローカルコーディングアシスタント(オフライン) | Q8_0 + Thinkモード、llama-server + エディタ連携 |
| オンデバイスツール呼び出しルーター | Q8_0 + Thinkモード(BFCL/API-Bankの強みを活用) |
| 低レイテンシチャットボット/分類器 | Q5_K_M + No Thinkモード |
| 大規模文書/コードベース要約 | F16またはQ8_0 + 長い`-c`設定(RAM確保必須) |
| エッジデバイス実験 | Q4_K_M + コンテキスト4K以下 |

---

## 9. 参考リンク

- GGUFリポジトリ: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF
- Transformersチェックポイント: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking
- ベースモデル: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp: https://github.com/ggml-org/llama.cpp
