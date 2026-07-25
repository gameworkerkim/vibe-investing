---
title: "MiniCPM5-1B-Claude-Opus-Fable5-Thinking(GGUF)——Getting Started"
description: "超軽量1BパラメータのローカルLLM MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUFの入門ガイド——量子化オプション、llama.cpp/Ollama/LM Studio/vLLMでの設定、サンプリングパラメータ、ベンチマーク、活用シナリオ別推奨設定。"
abstract: |
  MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUFは、CPU単独または低スペックGPUでも動作する超軽量10億パラメータの
  ローカルLLMであり、GGUF形式で配布され、128KトークンのコンテキストウィンドウとハイブリッドなThink/No Think
  推論モードを特徴とする。本ガイドはモデル概要、量子化ファイルの選択肢(Q4_K_M/Q5_K_M/Q8_0/F16)、
  llama.cpp・Ollama・LM Studio・llama-cpp-python・vLLM・Docker Model Runner・コーディングエージェント連携
  にわたるインストールと使用方法、推奨サンプリングパラメータ、ベースモデルに対するツール呼び出しベンチマークの
  改善、長所と限界、シナリオ別の推奨設定を解説する。
summary_for_ai: |
  Apache-2.0ライセンスの超軽量10億パラメータローカルLLM、MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUFの
  入門ガイド。openbmb/MiniCPM5-1Bを「Fable 5」データでファインチューニングし、llama.cpp系ランタイム向けに
  GGUF形式で配布されている。注記:名称中の「Fable 5」は学習データの出典を指すものであり、Anthropicの商用モデル
  「Claude Fable 5」とは無関係な独立したオープンソースコミュニティモデルである。
  主な仕様:10億パラメータ、llamaアーキテクチャ、最大コンテキスト128Kトークン(upstream config.json基準で
  131,072)、GGUFメタデータに内蔵されたネイティブチャットテンプレート、英語・中国語対応、コード生成・
  デバッグ、命令追従(Instruction Following)、ツール呼び出し(Tool Calling)に特化。「Thinking」モード
  (Chain-of-Thought推論)と「No Think」モード(高速応答)を切り替えられるハイブリッド推論構造を特徴とする。
  量子化ファイル:Q4_K_M(約657MB、最小容量)、Q5_K_M(約751MB、バランス型)、Q8_0(約1.1GB、推奨デフォルト)、
  F16(約2.1GB、フルプレシジョン)。1Bモデルは量子化損失に比較的敏感なため、メモリに余裕があればQ8_0を
  デフォルトとして推奨、2GB未満のRAMという極端な制約環境でのみQ4_K_Mを検討。
  インストール・使用方法:llama.cpp CLI(`llama cli -hf ...`またはローカルファイルを`-m`で指定)、
  OpenAI互換APIのためのllama.cppサーバー(`llama-server`)、Ollama(`ollama run hf.co/...`)、
  LM Studio/jan/KoboldCpp(.ggufファイルを読み込むだけ、テンプレートは自動検出)、Python連携用
  llama-cpp-python、OpenAI互換APIによるvLLMサービング、Docker Model Runner、およびローカルllama.cppサーバーを
  カスタムOpenAI互換プロバイダーとして各エージェントに登録するコーディングエージェント連携(Pi/Hermes/
  OpenClaw)。
  推奨サンプリング:Thinkモードはtemperature=0.9/top_p=0.95(最終回答の前に推論ブロックを出力、パイプライン
  統合時にはパース・除去が必要、複雑なコーディング・推論タスクに適合)。No Thinkモードは
  temperature=0.7/top_p=0.95/enable_thinking=False(即答、遅延に敏感なチャットボット・分類タスクに適合)。
  ベンチマーク:V2 ThinkingモデルはベースモデルよりBFCL non_live(41.51%→43.06%)、BFCL live
  (60.24%→63.33%)、特にAPI-Bank(7.30%→22.10%、約3倍)で改善しており、ツール呼び出し特化学習の効果を示す。
  さらにツール利用に特化した派生モデル`MiniCPM5-Claude-Toolusage`も別途提供されている。
  長所:超軽量ローカル実行(最小657MBでCPU単独、ラズベリーパイ級SBC、旧型ノートPCでも実行可能)、1Bモデルとして
  異例な128Kの長いコンテキスト、Think/No Thinkモード切り替えによるハイブリッド推論、同級1Bオープンモデル間で
  SOTAを目指すツール呼び出し性能、GGUFエコシステム全域にわたる広いランタイム互換性、商用利用の制約が少ない
  Apache-2.0ライセンス、別途設定不要なテンプレート内蔵。
  限界:1Bモデルとしての根本的な限界(複雑な一般推論・多段階論理・広範な世界知識でGPT-4/Claudeなど
  フロンティアモデルとの差が大きく、汎用アシスタントよりコーディング補助・ツール呼び出しルーティング・
  分類など特定タスクへの限定使用が現実的)、Thinkingモードの追加出力(推論ブロックが最終回答の前に出力される
  ため、アプリケーション連携にはパースロジックが追加で必要、推論ブロック分のトークン消費と遅延も増加)、
  実効コンテキストの制約(128Kは理論上の最大値であり、実際に使用可能な長さはランタイムとハードウェア
  (RAM/VRAM)に依存、低スペック環境では8K前後の設定が現実的)、量子化への敏感さ(小型モデルの特性上、
  Q4以下の量子化で品質低下が比較的目立つ可能性——Q8_0推奨の理由)、言語カバレッジの限界(公式サポート言語は
  英語・中国語中心、韓国語性能は別途検証が必要)、推論プロバイダー未対応(現在HuggingFace Inference
  Providersにデプロイされておらず、クラウドAPI形式では利用不可、ローカル実行専用)。
  シナリオ別設定表(オフラインのローカルコーディングアシスタント、オンデバイスツール呼び出しルーター、
  低遅延チャットボット・分類器、大規模文書・コードベース要約、エッジデバイス実験)と、GGUFリポジトリ・
  Transformersチェックポイント・ベースモデル・llama.cppへの参考リンクを含む。
date: 2026-07-17
author: "Dennis Kim"
lang: ja
tags:
  - MiniCPM5
  - GGUF
  - ローカルLLM
  - llama.cpp
  - Ollama
keywords:
  - MiniCPM5-1B GGUF
  - ローカルLLM 入門
  - llama.cpp 量子化
  - Ollama GGUFモデル
  - 1Bパラメータモデル
  - ツール呼び出し 小型LLM
featured: false
schema_type: TechArticle
draft: false
---

# MiniCPM5-1B-Claude-Opus-Fable5-Thinking(GGUF)——Getting Started

> 超軽量1BパラメータローカルLLM入門ガイド
> モデルページ: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF
> ライセンス: Apache-2.0(ベースモデルMiniCPM5-1Bから継承)

---

## 1. モデル概要

| 項目 | 内容 |
| :--- | :--- |
| パラメータ規模 | 1B(10億) |
| ベースモデル | `openbmb/MiniCPM5-1B` |
| ファインチューニングデータ | Fable 5データ(post-training) |
| 配布フォーマット | GGUF(llama.cpp系ランタイム向け量子化ビルド) |
| 最大コンテキスト | 128Kトークン(131,072/upstream `config.json`基準) |
| アーキテクチャ | llama |
| チャットテンプレート | MiniCPM5ネイティブテンプレートがGGUFメタデータに内蔵 |
| サポート言語 | 英語、中国語 |
| 特化領域 | コード生成・デバッグ、命令追従(Instruction Following)、ツール呼び出し(Tool Calling) |

このモデルはCPU単独または低スペックGPU環境でも動作可能な超軽量モデルで、llama.cpp、Ollama、LM Studio、jan、KoboldCppなどGGUF互換ランタイム全般で使用できる。「Thinking」モード(Chain-of-Thought推論)と「No Think」モード(高速応答)を切り替えられるハイブリッド推論構造が特徴である。

参考:名称に含まれる「Fable 5」は学習データの出典を指す表記であり、Anthropicの商用クローズドモデル「Claude Fable 5」とは無関係な独立したオープンソースコミュニティモデルである。

---

## 2. 提供ファイル(量子化バージョンの選択)

| ファイル | 量子化 | サイズ | 備考 |
| :--- | :--- | :--- | :--- |
| `...-Q4_K_M.gguf` | Q4_K_M | 約657 MB | 最小容量、低メモリ環境向け |
| `...-Q5_K_M.gguf` | Q5_K_M | 約751 MB | 品質・容量バランス型 |
| `...-Q8_0.gguf` | Q8_0 | 約1.1 GB | **推奨デフォルト** |
| `...-F16.gguf` | F16 | 約2.1 GB | フルプレシジョン変換オリジナル |

**選択ガイド**:1Bモデルは量子化損失に比較的敏感なため、メモリに余裕があれば**Q8_0**をデフォルトとして使用することを推奨する。RAM 2GB未満の極端な制約環境でのみQ4_K_Mを検討すること。

---

## 3. インストールと実行方法

### 3.1 llama.cpp(CLI)

macOS / Linuxインストール:

```bash
curl -LsSf https://llama.app/install.sh | sh
```

Windows(WinGet):

```bash
winget install llama.cpp
```

ターミナルから直接推論:

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

コンテキスト長(`-c`)は最大131,072までサポートするが、実際に使用可能な長さはVRAM/RAMに応じて調整する必要がある。

### 3.2 llama.cppサーバー(OpenAI互換API)

```bash
llama-server \
  -m MiniCPM5-1B-Claude-Opus-Fable5-Thinking-Q8_0.gguf \
  -c 8192 --port 8080
```

サーバー起動後、`http://localhost:8080`でWeb UIおよびOpenAI互換の`/v1/chat/completions`エンドポイントを使用できる。既存のOpenAI SDKベースのコードは`base_url`だけ変更すればそのまま連携できる。

### 3.3 Ollama

```bash
ollama run hf.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF:Q4_K_M
```

HuggingFaceリポジトリから直接pullして実行する方式で、別途Modelfileの作成は不要である。

### 3.4 LM Studio / jan / KoboldCpp

リポジトリの`.gguf`ファイルをダウンロードして読み込むだけで良い。MiniCPM5のチャットテンプレートがGGUFメタデータに内蔵されているため、テンプレートを手動設定する必要はない。

- LM Studio: 検索ボックスに`GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF`を入力し、希望する量子化バージョンをダウンロード

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
        {"role": "user", "content": "2つのソート済みリストを結合するPython関数を書いてください。"}
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

llama.cppサーバーをバックエンドとして起動し、OpenAI互換エンドポイント(`http://localhost:8080/v1`)を各エージェントのカスタムプロバイダーとして登録する方式である。ローカルコーディングエージェント実験用に有用である。

---

## 4. サンプリングパラメータの推奨値

ベースモデル(MiniCPM5-1B)の生成デフォルト値を継承する。

| モード | パラメータ |
| :--- | :--- |
| **Think**(デフォルト) | `temperature=0.9`, `top_p=0.95` |
| **No Think** | `temperature=0.7`, `top_p=0.95`, `enable_thinking=False` |

- **Thinkモード**:最終回答の前に内部推論(reasoning)ブロックを出力する。複雑なコーディング・推論作業に適しているが、パイプラインに連携する際には推論ブロックをパース・除去する後処理ロジックが必要。
- **No Thinkモード**:推論過程なしで即答する。遅延が重要なチャットボット・分類作業に適している。

---

## 5. 性能ベンチマーク

V2バージョンでツール呼び出し(Tool Calling)性能が大幅に改善された(モデル制作者公開数値基準)。

| モデル | BFCL(non_live) | BFCL(live) | API-Bank |
| :--- | :--- | :--- | :--- |
| MiniCPM5-1B(Base) | 41.51% | 60.24% | 7.30% |
| **V2 Thinkingモデル** | **43.06%** | **63.33%** | **22.10%** |

特にAPI-Bankのスコアが7.30%→22.10%と約3倍に上昇した点が、ツール呼び出し特化学習の効果を示している。ツール利用にさらに特化した派生モデル`MiniCPM5-Claude-Toolusage`も別途提供されている。

---

## 6. 長所

- **超軽量ローカル実行**:最小657MB(Q4_K_M)でCPU単独、ラズベリーパイ級SBC、旧型ノートPCでも実行可能
- **128K長文コンテキスト**:1B級モデルとしては異例な長いコンテキストをサポート。大規模コードベース・長文文書分析に活用可能
- **ハイブリッド推論**:Think/No Thinkモード切り替えにより品質と速度を作業別に選択
- **ツール呼び出し強化**:同級1Bオープンソースモデル比でTool Calling性能のSOTAを目指して設計
- **広いランタイム互換性**:llama.cpp、Ollama、LM Studio、vLLM、Dockerなど事実上すべてのGGUFエコシステムをサポート
- **Apache-2.0ライセンス**:商用利用および再配布への制約が少ない
- **テンプレート内蔵**:チャットテンプレートがGGUFに含まれているため、別途設定なしで即座に使用可能

---

## 7. 短所と限界

- **1B規模の根本的な限界**:複雑な一般推論、多段階論理、広範な世界知識においてフロンティア級モデル(GPT-4、Claudeなど)との差が大きい。汎用アシスタントよりも特定タスク(コーディング補助、ツール呼び出しルーティング、分類)に限定して使用するのが現実的
- **Thinkingモードの付加出力**:推論ブロックが最終回答に先立って出力されるため、アプリケーション連携時にパースロジックが追加で必要。推論ブロック分だけトークン消費と遅延時間も増加する
- **実効コンテキストの制約**:128Kは理論上の最大値であり、実際に使用可能な長さはランタイムとハードウェア(RAM/VRAM)に左右される。低スペック環境では8K前後の設定が現実的
- **量子化への敏感さ**:小型モデルの特性上、Q4以下の量子化で品質低下が比較的目立つ可能性がある(Q8_0推奨の理由)
- **言語カバレッジ**:公式サポート言語は英語・中国語が中心。日本語性能は別途検証が必要
- **推論プロバイダー未対応**:現在HuggingFace Inference Providersにデプロイされておらず、クラウドAPI形式では利用不可(ローカル実行専用)

---

## 8. 活用シナリオの提案

| シナリオ | 推奨設定 |
| :--- | :--- |
| ローカルコーディングアシスタント(オフライン) | Q8_0 + Thinkモード、llama-server + エディター連携 |
| オンデバイスツール呼び出しルーター | Q8_0 + Thinkモード(BFCL/API-Bankの強みを活用) |
| 低遅延チャットボット / 分類器 | Q5_K_M + No Thinkモード |
| 大規模文書・コードベースの要約 | F16またはQ8_0 + 長い`-c`設定(RAM確保が必須) |
| エッジデバイス実験 | Q4_K_M + コンテキスト4K以下 |

---

## 9. 参考リンク

- GGUFリポジトリ: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking-GGUF
- Transformersチェックポイント: https://huggingface.co/GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-Thinking
- ベースモデル: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp: https://github.com/ggml-org/llama.cpp
