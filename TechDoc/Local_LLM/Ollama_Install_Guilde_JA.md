---
title: "Ollamaインストールと基本使用法 — トークン貧乏のためのローカルLLM環境構築"
description: "Ollamaで無料のローカルLLM環境を構築する段階別ガイドと、主要オープンソースLLMの比較"
lang: ja
featured: false
schema_type: TechArticle
keywords:
  - Ollama
  - ローカル LLM
  - オープンソース LLM
  - Llama
  - Qwen
tags:
  - LLM
  - Ollama
  - ローカルAI
  - オープンソース
---

# Ollamaインストールと基本使用法 — トークン貧乏のためのローカルLLM環境構築

ChatGPTやClaudeのような高性能AIモデルを使うたびにAPI費用が気になりますか?インターネット接続なしでも、費用の心配なく、自分のコンピューターで直接LLMを実行できたらどうでしょうか?本文書は**Ollama**を活用してトークン費用なしで自分だけのローカルLLM環境を構築する方法を段階別に案内します。文書後半では最新のオープンソースLLMモデルの特徴と長所・短所も紹介するので、自分のPC仕様に合った最適なモデルを探してみてください。

> **Ollama**はローカルコンピューターでLlama、Mistral、GemmaなどさまざまなオープンソースLLMをDockerコンテナのように簡単に実行できるようにするツールです。

## 目次

- [1. Ollamaとは?](#1-ollamaとは)
- [2. Ollamaのインストール](#2-ollamaのインストール)
- [3. Ollamaの基本使用法](#3-ollamaの基本使用法)
- [4. 主要LLMモデル比較(長所・短所&特徴)](#4-主要llmモデル比較長所短所特徴)
- [5. 自分のPCに合ったモデル選択ガイド](#5-自分のpcに合ったモデル選択ガイド)
- [6. 併せて見ると良いヒントとツール](#6-併せて見ると良いヒントとツール)
- [7. 参考資料](#7-参考資料)

## 1. Ollamaとは?

Ollamaは**大規模言語モデル(LLM)をローカル環境で簡単に実行・管理できるオープンソースフレームワーク**です。Dockerがコンテナでアプリケーションをパッケージ化するように、Ollamaはモデルの重みと設定を一つにまとめて簡単に実行できるようにします。インストール後、数行のコマンドだけでMetaのLlama、MistralのMistral、GoogleのGemmaなど多様なLLMを自分のコンピューターで動かすことができます。

### なぜOllamaを使うべきか?(トークン貧乏脱出記)

| 長所 | 説明 |
|------|------|
| **コストゼロ** | API呼び出しごとの料金が全くありません。無制限に質問しても課金の心配なし |
| **完璧なプライバシー** | すべてのデータが自分のコンピューターに留まります。センシティブな文書も安心して分析できます |
| **オフライン動作** | モデルだけダウンロードしておけばインターネットなしでもどこでも使用可能 |
| **高速応答** | ネットワーク遅延がなく即座に応答を受け取れる |
| **自由な実験** | さまざまなモデルを自由に切り替えてテストできる |
| **優れた拡張性** | REST API、Python連携、IDE拡張など多様なツールと統合される |

## 2. Ollamaのインストール

### 事前要件(ハードウェアチェック)

Ollamaはすべての最新OSで動作しますが、モデルを円滑に実行するには**最低8GB RAM**(推奨16GB)以上を準備することが望ましいです。参考として、**Q4_K_M量子化された70億(7B)パラメータモデル**は約**4〜6GB**のメモリを必要とします。

| モデルサイズ | Q4量子化基準必要メモリ(推定) |
|-----------|--------------------------------|
| 3B〜8B(小型) | 4GB〜6GB |
| 13B〜20B(中型) | 8GB〜16GB |
| 32B〜40B(大型) | 20GB〜32GB |
| 70B以上(超大型) | 40GB以上 |

GPUがあればより速い推論速度を体験できますが、必須ではありません。一般的なCPUだけでも70億(7B)パラメータモデル基準で秒間約5〜15個のトークンを生成できます。

---

### Windows

1. [Ollama公式ダウンロードページ](https://ollama.com/download)でWindows用インストールファイル(`OllamaSetup.exe`)をダウンロードします。
2. ダウンロードしたファイルを実行してインストールを完了します。
3. インストールが完了したら**PowerShellまたはコマンドプロンプト(CMD)**を開いて以下のコマンドで正常インストールを確認します。

   ```bash
   ollama --version
   ```

---

### MacOS

- **公式インストールファイルの利用**
  [ollama.com](https://ollama.com)でmacOS用ファイルをダウンロードしてインストールします。
- **Homebrewの利用(推奨)**
  ```bash
  brew install ollama
  ```

---

### Linux

ターミナルで以下のコマンドを実行します。Ubuntu、Debian、Fedora、CentOSなどほとんどのディストリビューションをサポートします。

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

---

### Docker(任意)

コンテナベースのデプロイを希望する場合はDockerイメージを使用できます。

```bash
docker pull ollama/ollama
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

> `11434`はOllama APIのデフォルトポート番号です。

### インストール確認

以下のコマンドでOllamaサービスが正常に実行中か確認します。

```bash
ollama serve   # サーバーが実行中か確認
```

`http://localhost:11434`でOllamaサーバーが実行中であることを示す出力を確認できます。

## 3. Ollamaの基本使用法

### 最初のモデル実行 — 最も簡単な方法

```bash
ollama run llama3.2
```

このコマンド一行で終わりです!該当モデルがローカルにない場合、自動的にダウンロードした後、対話型プロンプトが実行されます。

```
>>> こんにちは、あなたは誰ですか?
私はMetaのLlama 3.2モデルです。何をお手伝いしましょうか?
```

### モデル管理コマンド

| コマンド | 説明 |
|--------|------|
| `ollama list` | ダウンロードされたモデルリストの確認 |
| `ollama pull <モデル名>` | モデルのみダウンロード(実行しない) |
| `ollama run <モデル名>` | モデルダウンロード+対話実行 |
| `ollama rm <モデル名>` | モデル削除 |
| `ollama cp <モデル名> <新しい名前>` | モデルコピー |
| `ollama show <モデル名>` | モデル詳細情報の確認 |

### 一つのヒント — モデルタグの活用

モデル名の後に`:latest`または特定のタグを付けると希望するバージョンを指定できます。ただし、`:latest`が常に最高性能のモデルを指すわけではないため、できれば具体的なタグを使用することが望ましいです。

```bash
# 例: 特定のサイズと量子化バージョンの指定
ollama run llama3.1:8b-q4_K_M
```

### PythonでOllamaを使用する

OllamaはREST APIを提供するため、Pythonなど多様な言語で簡単に連携できます。

```python
import requests

response = requests.post(
    "http://localhost:11434/api/generate",
    json={"model": "llama3.2", "prompt": "こんにちは、よろしくお願いします!", "stream": False}
)

print(response.json()["response"])
```

## 4. 主要LLMモデル比較(長所・短所&特徴)

Ollamaは500以上のモデルをサポートします。ここでは2025〜2026年基準最も注目されている主要モデルの長所・短所と特徴をまとめました。

### Llama 4シリーズ(Meta)

| 区分 | Llama 4 Scout | Llama 4 Maverick |
|------|---------------|------------------|
| **構造** | 170億アクティブパラメータ、16個MoEエキスパート | 170億アクティブパラメータ、128個MoEエキスパート |
| **特徴** | **業界最高水準の1,000万(10M)トークン**コンテキストウィンドウ | 1,000万トークンコンテキスト、画像+テキスト完全ネイティブサポート |
| **主要ベンチマーク** | MMLU Pro 74.3 / GPQA Diamond 57.2 | MMLU Pro 80.5 / GPQA Diamond 69.8 |
| **推定ハードウェア** | 単一H100 GPU(Int4量子化基準) | 単一H100ホスト |
| **効率性(推定)** | 〜$0.19〜$0.49 / 百万(1M)トークン | 〜$0.19〜$0.49 / 百万(1M)トークン |

> **Llama 4は最初に公開された完全ネイティブ(natively)マルチモーダルオープンウェイトモデル**であり、画像とテキストを同時に理解できます。

**長所**
- **圧倒的な1,000万(10M)コンテキスト**: 小説一冊全体を一度に入れて分析可能。
- **優れたマルチモーダル性能**: 画像認識および分析に強い。
- **Mixture-of-Experts(MoE)構造**: アクティブパラメータを最適化して効率的。

**短所**
- 高スペックハードウェアが必要(特にビデオメモリ(VRAM))。
- 初期ダウンロード容量が大きい。
- 完全オフライン活用のためには最適化された量子化バージョンが必要。

---

### Mistral Small 3.1(Mistral AI)

| 区分 | 詳細 |
|------|------|
| **パラメータ** | 240億(24B) |
| **コンテキスト** | 12.8万(128k)トークン |
| **推論速度(推定)** | 150トークン/秒 |
| **マルチモーダル** | テキスト+画像入力サポート |
| **ライセンス** | Apache 2.0(完全開放) |

> Apache 2.0ライセンスは商用利用、修正、再配布がすべて自由な非常に開放的なライセンスです。

**長所**
- **Apache 2.0完全開放ライセンス**: 商用活用も自由。
- **優れた速度と性能バランス**: 240億(24B)パラメータでも速い推論速度。
- **多言語サポートの強み**: 韓国語を含む多様な言語サポート。

**短所**
- 240億(24B)パラメータモデルを円滑に実行するには高スペックハードウェアが必要。一部のテストでは256GB RAM(RAM)とデュアルA100環境でも長いコンテキスト処理時にボトルネック現象が報告された。
- 理論的最高速度(150トークン/秒)は実際のローカル環境では達成しにくい場合がある。

---

### Gemma 4 / Gemma 3シリーズ(Google)

| モデル | パラメータ | 必要ビデオメモリ(VRAM)(推定) | 特徴 |
|------|----------|-------------------|------|
| Gemma 4 E2B / E4B | 20億〜40億(B)〜40億(B)(推定) | 15GB前後 | 小さく効率的なモデル、**数学(Math)および科学(ARC)ベンチマーク強め** |
| Gemma 4 26B-A4B | 260億(26B) | 48GB前後 | MoE構造で推論およびコーディング能力優秀 |
| Gemma 3 4B | 40億(4B) | 〜3-5GB | **超軽量**、コスト効率最大化 |

> 2026年の研究によるとGemmaモデルはARC(科学的推論)とMath(数学)領域で特に頭角を現しました。

**長所**
- **軽量化に最適化**: 少ないコンピューティングリソースで優れた性能。
- **科学的推論能力**: 数学・論理問題に強い。
- **Gemma 3 4Bはコストパフォーマンス最強**: 秒当たりコストが競合モデル対比約12倍安価な水準。

**短所**
- コーディング分野では同じサイズ対比Qwenより多少弱い可能性がある。
- 最大性能のためには適切なプロンプト戦略が必要(Few-shot CoTなど)。

---

### Phi-4(Microsoft)

**長所**
- **TruthfulQA(事実性)ベンチマーク最強**: 事実に基づいた正確な回答生成に優れる。
- **推論専用モデルの強み**: Phi-4-mini-reasoningなど推論に特化した変形が存在。
- 合理的なリソース要求量。

**短所**
- プロンプト方式による性能偏差が大きい。特にFew-shot CoT(少数샷思考連鎖)方式で急激な性能低下事例が報告された。
- 一般的な対話より特殊目的(推論、事実確認)に特化。

---

### Qwen 2.5 / Qwen 3シリーズ(Alibaba)

| モデル | パラメータ | 必要ビデオメモリ(VRAM)(推定) | 主要ベンチマーク |
|------|----------|-------------------|----------|
| Qwen2.5 7B | 70億(7B) | 〜6GB | 6つの課題でGemma 3 4Bに優位 |
| Qwen2.5-Coder 32B | 320億(32B) | 〜20GB | **HumanEval 92.7%(GPT-4o水準)** |
| Qwen2.5 32B | 320億(32B) | 〜20GB | MMLU 83.2 |
| Qwen3 30B-A3B | 300億(30B) | 30-40GB | MoE構造で最新推論能力 |

> Qwen2.5 7B Instructは8つの共有ベンチマークのうち**6つの分野でGemma 3 4Bを上回る**性能を示します。

**長所**
- **コーディング分野最強者**: Qwen2.5-Coder 32BはHumanEval 92.7%でGPT-4oに匹敵。
- **優れた多言語性能**: 中国語はもちろん、英語と多様な言語をサポート。
- **広範なサイズラインアップ**: 7Bから320億(32B)、700億(70B)以上まで多様な選択肢。

**短所**
- 一部の小型モデル(例: 7B)は出力長制限がある場合がある(Gemma 3 4Bは出力も128kサポートする一方、Qwen2.5 7B Instructは8192トークンに制限)。
- 最高性能のためには相対的に高スペックハードウェアが必要。

---

### Llama 3.3 70B(Meta)

**長所**
- **2026年基準総合品質1位(MMLU 86.0)**
- 4,050億(405B)モデル対比効率的でありながら類似した性能を提供。
- 大規模ワークロード(合成データ生成など)に適合。

**短所**
- **必要ビデオメモリ(VRAM)約40GB**以上必要とし非常に高いスペックを要求。
- 一般ユーザーより企業/専門家向け。
- ダウンロード容量が大きい(数十GB)。

---

### モデル比較要約表

| モデル | 適正ビデオメモリ(VRAM)(推定) | 最高分野 | 長所 | 短所 |
|------|--------------------------|----------|------|------|
| **Llama 4 Scout** | 〜H100 GPU | 長文分析 | 1,000万(10M)コンテキスト、マルチモーダル | 高スペック必要 |
| **Llama 4 Maverick** | 〜H100ホスト | 総合マルチモーダル | 高性能、画像理解 | 高スペック必要 |
| **Mistral Small 3.1** | 24GB+ | 多言語対話 | 速度/品質バランス、完全開放 | 長いコンテキスト処理時過負荷 |
| **Gemma 4 / 3** | 4GB〜48GB | 数理・科学推論 | 軽量化/効率性、低コスト | コーディング性能相対的弱め |
| **Phi-4** | 〜16GB+ | 事実ベースQA | TruthfulQA強め | プロンプト偏差あり |
| **Qwen 2.5/3** | 6GB〜40GB | **コーディング**(最強) | コーディング能力GPT-4o級、サイズ多様 | 一部モデル出力制限 |
| **Llama 3.3 70B** | 〜40GB+ | 総合品質(MMLU最高) | 圧倒的性能 | 非常に高いスペック要求 |

## 5. 自分のPCに合ったモデル選択ガイド

自分のハードウェア仕様に応じて次のモデルを推奨します。

### 低スペック(8GB RAM(RAM)/4GB ビデオメモリ(VRAM)以下)

| 推奨モデル | インストールコマンド | 特徴 |
|-----------|-------------|------|
| **Llama 3.2 3B** | `ollama pull llama3.2` | Meta最新小型モデル、汎用対話に適合 |
| **Gemma 3 4B** | `ollama pull gemma3:4b` | コストパフォーマンス最強、科学的推論に強い |
| **Phi-4-mini** | `ollama pull phi4-mini` | 事実性の高い応答 |

### 中間スペック(16GB RAM(RAM)/8GB ビデオメモリ(VRAM))

| 推奨モデル | インストールコマンド | 特徴 |
|-----------|-------------|------|
| **Llama 3.1 8B** | `ollama pull llama3.1:8b` | 最も大衆的なモデル、汎用性最高 |
| **Qwen2.5 7B** | `ollama pull qwen2.5:7b` | コーディング/多言語に強め |
| **Mistral 7B** | `ollama pull mistral` | 検証された7Bモデル |

### 高スペック(24GB ビデオメモリ(VRAM)以上)

| 推奨モデル | インストールコマンド | 特徴 |
|-----------|-------------|------|
| **Qwen2.5-Coder 32B** | `ollama pull qwen2.5-coder:32b` | **コーディング最強者**(HumanEval 92.7%) |
| **Qwen2.5 32B** | `ollama pull qwen2.5:32b` | 最高の中型オールラウンダー(MMLU 83.2) |
| **Mistral Small 22B** | `ollama pull mistral-small:22b` | 多言語特化 |

### 超高スペック(48GB ビデオメモリ(VRAM)以上)

| 推奨モデル | インストールコマンド | 特徴 |
|-----------|-------------|------|
| **Llama 3.3 70B** | `ollama pull llama3.3:70b` | **総合品質1位**(MMLU 86.0) |
| **DeepSeek R1 Distill 70B** | `ollama pull deepseek-r1:70b` | 推論特化モデル |

### モデル選択のヒント
- **「常に最も大きいモデルが正解ではない」**: 自分のPCに合った適切なサイズのモデルがより快適な体験を提供します。
- **量子化バージョン(Q4_K_Mなど)を積極的に活用しましょう**: わずかな精度の犠牲でメモリ使用量を大幅に減らせます。
- `:latest`タグより具体的なタグを使用しましょう(例: `qwen2.5-coder:32b`)。

## 6. 併せて見ると良いヒントとツール

### Open WebUI — Ollama用ウェブインターフェース

ターミナルが不便であれば、以下のコマンドでChatGPTスタイルのウェブインターフェースを構築できます。

```bash
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

### VS Code拡張プログラム — Continue

Continue拡張プログラムをインストールするとVS Code内でOllamaモデルをコーディングアシスタントとして活用できます。

### LangChain + Ollama連携

```python
from langchain_ollama import ChatOllama

llm = ChatOllama(model="llama3.2")
response = llm.invoke("こんにちは、LLMの世界へようこそ!")
print(response.content)
```

### 環境変数でパフォーマンス最適化

推論速度とメモリ管理のために以下の環境変数を設定してみましょう。

```bash
export OLLAMA_NUM_PARALLEL=4      # 並列リクエスト数(デフォルト値: 1)
export OLLAMA_MAX_LOADED_MODELS=2 # 最大同時ロードモデル数
export OLLAMA_HOST=0.0.0.0        # すべてのインターフェースからのAPIアクセス許可
```

### モデル保存位置の変更

デフォルトで`~/.ollama/models`に保存されます。変更するには環境変数を設定してください。

```bash
export OLLAMA_MODELS=/path/to/your/models
```

## 7. 参考資料

- **Ollama公式ホームページ** — [https://ollama.com](https://ollama.com)
- **Ollama GitHubリポジトリ** — [https://github.com/ollama/ollama](https://github.com/ollama/ollama)
- **Ollama公式ドキュメント** — [https://docs.ollama.com](https://docs.ollama.com)
- **Ollamaモデルライブラリ** — [https://ollama.com/library](https://ollama.com/library)
- **Meta Llama 4公式ブログ** — [https://ai.meta.com/blog/llama-4-multimodal-intelligence/](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)
- **Mistral Small 3.1発表** — [https://mistral.ai/news/mistral-small-3-1](https://mistral.ai/news/mistral-small-3-1)
- **Gemma 4 / Phi-4 / Qwen3性能比較論文(arXiv:2604.07035)** — [https://arxiv.org/abs/2604.07035](https://arxiv.org/abs/2604.07035)
- **Gemma 3 vs Qwen2.5ベンチマーク比較** — [https://llm-stats.com](https://llm-stats.com)
- **Ollamaインストールガイド(SitePoint、2026)** — [https://www.sitepoint.com/ollama-setup-guide-2026/](https://www.sitepoint.com/ollama-setup-guide-2026/)
- **Ollama完璧ガイド(DEV Community)** — [https://dev.to/ajitkumar/the-complete-guide-to-ollama-run-large-language-models-locally-2mge](https://dev.to/ajitkumar/the-complete-guide-to-ollama-run-large-language-models-locally-2mge)

これまで**Ollamaインストールおよび主要LLMモデル比較**文書を見てきました。これでトークン費用の心配なく自分のコンピューターで心ゆくまでLLMを実行してみてください。API費用は0円、プライバシーは完璧に保護されます。楽しいローカルAI構築を!
