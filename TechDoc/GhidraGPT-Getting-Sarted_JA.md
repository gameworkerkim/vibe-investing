---
title: "GhidraGPT Getting Started"
description: "GhidraGPTはOpenAI・Anthropic・Ollama・Qwenなど多様なLLMをGhidraに統合し、デコンパイル・リネーム・脆弱性分析を高速化するプラグイン。"
abstract: |
  GhidraGPTは、NSAのオープンソースリバースエンジニアリングフレームワークGhidraにLLMを統合し、逆アセンブル・逆コンパイルを支援するプラグインである。OpenAI、Anthropic、Google Gemini、Cohere、Mistral、DeepSeek、Grok、ローカルのOllamaモデルまで幅広いプロバイダーに対応し、暗号化されたAPIキー保存とともに関数リライト・コード説明・セキュリティ分析を提供する。主なリスクは分析結果のハルシネーションとバイナリコードの外部API送信であり、機密性の高い対象にはローカルモデルの利用が推奨される。
summary_for_ai: |
  AIエージェント向け参考情報: 本ガイドはGhidra 10.0以上、Java 11以上、Mavenを必要とし、Mavenビルドには GHIDRA_INSTALL_DIR の設定が必要である。クラウドLLMプロバイダーの利用にはインターネット接続とAPIコストが伴い、完全オフラインで動作するのはOllamaのみである。LLMが生成したコード・型情報・脆弱性の指摘は、信用する前に必ず人間による検証が必要である。
lang: ja
featured: false
author: Dennis Kim
date: 2026-07-21
schema_type: TechArticle
---

# GhidraGPT Getting Started

**GhidraGPT**は、NSAのオープンソースリバースエンジニアリングフレームワークであるGhidraにLLMを統合するプラグインです。
Ghidra(ギドラ)は、米国国家安全保障局(NSA)が開発し、オープンソースとして公開した強力なソフトウェアリバースエンジニアリング(逆工学)ツールです。
Ghidraは米国国家安全保障局によって開発され、米国の複数の情報機関で使用されていたリバースエンジニアリングツールで、2017年3月7日頃に発生したWikiLeaksのCIA Vault 7流出によって世界に初めてその存在が知られるようになりました。
その後2019年3月5日、米国国家安全保障局はRSA Conferenceで初めて実行ファイルを一般公開し、1か月後の2019年4月にはGitHubにソースコードを公開しました。

GhidraGPTは、LLMの発展に伴い、人間が地道な作業として行っていたコンパイル済み機械語コードの分析、人間が読める形式のアセンブリ言語への変換(逆アセンブル)、そしてC言語レベルのコードへの復元(逆コンパイル)という核心機能を、LLMが補助できるようにしたものです。
一言で言えば、Ghidraに LLMを取り付けた拡張サービスであり、時間のかかる逆アセンブルなどの作業をLLMに代行させるのが拡張のコンセプトです。

主な特徴と機能は以下の通りです。

* 強力なデコンパイラ: 機械語をC言語形式に変換し、コードの流れとロジックをはるかに理解しやすくします。
* 多様なプラットフォーム対応: Windows、macOS、Linuxで動作し、x86、ARM、MIPSなど多様なプロセッサアーキテクチャに対応します。
* コラボレーション機能: チーム単位でプロジェクトを共有・分析できるサーバー機能を提供します。
* 拡張性: PythonおよびJavaスクリプトに対応し、ユーザーが望む分析自動化機能を自ら実装できます。
* 無料かつオープンソース: 高価な商用リバースツール(例: IDA Pro)の有力な代替として、セキュリティ研究者、マルウェア分析者、開発者に広く利用されています。

---

## 中核的な長所

1. **生産性の向上**
   * 関数名/変数名の自動リネーム、型推論、コメント追加により、逆コンパイル結果を人間が読みやすく改善
   * コンテキストメニューで右クリック一度でAI分析を実行(非常に便利)
2. **多様なLLM対応**
   * OpenAI、Anthropic、Google Gemini、Cohere、Mistral、DeepSeek、Grok、Ollamaなど幅広いモデルに対応
   * OpenAI互換APIも使用可能
3. **セキュリティと使いやすさ**
   * APIキーを自動的に暗号化して安全に保存
   * リアルタイムストリーミング応答で待ち時間を最小化
   * 専用コンソールで結果を確認可能

---

## 短所と注意点

**短所:**

* LLMの応答が常に正確とは限らず、誤った分析結果を招く可能性がある(LLMのハルシネーションやエラーが発生する)
* インターネット接続とAPIコストが実質的に必須(ローカルOllamaを除く。DeepSeek v4 pro、Qwenであれば十分)
* Ghidraの複雑な構造と組み合わせた際に予期しない衝突が発生する可能性

**注意点:**

* 分析対象のバイナリが機密性の高いコードである場合、外部APIに送信されるデータを必ず確認する必要がある
* LLMが生成したコードや型情報を過信せず、必ず検証を行うこと
* Ghidra 10.0以上、Java 11以上、Maven環境が必要であり、インストール時は`File → Install Extensions`の手順を正確に守る必要がある

---

## 競合プロジェクト

| プロジェクト | 差別点 |
|---------|--------|
| **Ghidra Assist** | ローカルモデルにより最適化されており、オープンソースコミュニティのサポートが活発 |
| **BinAI** | 商用製品で、バイナリ分析に特化した独自モデルを提供し精度に強み |
| **IAIK's Ghidra Plugin** | 学術研究に基づいており、特定の分析アルゴリズムに強い |
| **IDA Pro + ChatGPT** | IDAユーザー向けのスクリプトで、エコシステムは大きいがGhidraに特化していない |

> **要約**: GhidraGPTは多様なLLMに対応した強力なプラグインですが、API依存と分析結果の信頼性検証が必須です。機密性の高いコード分析時には、ローカルモデル(Ollama)の使用を推奨します。

---

# GhidraGPT始め方: Ollama、ChatGPT、Claude、Qwen設定ガイド

このガイドでは、GhidraGPTプラグインのインストールと、Ollama(ローカル)、ChatGPT、Claude、Qwenなど多様なLLMとの連携方法を段階的に案内します。

---

## 事前準備事項

GhidraGPTを使用する前に、以下の環境が整っている必要があります。

| 項目 | 要件 |
|------|----------|
| **Ghidra** | 10.0以上 |
| **Java** | Java 11+ |
| **Maven** | ビルドシステム |
| **インターネット** | APIベースのモデル使用時必須(Ollamaを除く) |

---

## 1. GhidraGPTプラグインのインストール

### 1.1 リポジトリのクローンとビルド

```bash
git clone https://github.com/ZeroDaysBroker/GhidraGPT.git
cd GhidraGPT
GHIDRA_INSTALL_DIR=/path/to/ghidra mvn clean package
```

ビルドが完了すると、`target/GhidraGPT-x.y.z.zip`ファイルが生成されます。

### 1.2 Ghidraへのプラグインインストール

1. Ghidraを起動
2. `File → Install Extensions`へ移動
3. `+`ボタンをクリックし`target/GhidraGPT-x.y.z.zip`を選択
4. Ghidraを再起動
5. `File → Configure → Analysis → GhidraGPTPlugin`でプラグインを有効化

---

## 2. 各LLMサービス別APIキー設定

プラグインインストール後、Ghidra内で`GhidraGPT configuration panel`に移動してAPIキーを入力します。すべてのAPIキーは自動的に暗号化されて安全に保存されます。

### OpenAI(ChatGPT)

1. [OpenAI Platform](https://platform.openai.com/api-keys)でAPIキーを発行
2. GhidraGPT設定パネルで**OpenAI**を選択
3. 発行されたAPIキーを入力
4. 使用するモデルを選択(例: `gpt-4`、`gpt-3.5-turbo`)

> **参考**: GhidraGPTはデフォルトでOpenAIのGPTモデルに対応しています。

---

### Anthropic(Claude)

1. [Anthropic Console](https://console.anthropic.com/)でAPIキーを発行
2. GhidraGPT設定パネルで**Anthropic**を選択
3. APIキーを入力
4. 使用するClaudeモデルを選択(例: `claude-3-opus`、`claude-3-sonnet`)

GhidraGPTはAnthropicのClaudeモデルを公式サポートしています。

---

### Ollama(ローカル無料モデル)

OllamaはローカルでLLMを実行できるツールで、**インターネット接続なしで**GhidraGPTを使用できるようにします。

#### 2.1 Ollamaのインストール

**macOS / Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:** [Ollama公式サイト](https://ollama.com/)からインストーラーをダウンロード

#### 2.2 LLMモデルのダウンロード

希望のモデルをダウンロードします。例:

```bash
# MetaのLlama 3.1(8B軽量モデル)
ollama run llama3.1:8b

# Qwen(コード分析に強み)
ollama run qwen2.5-coder:7b

# Mistral
ollama run mistral
```

> **ヒント**: ハードウェア仕様に合ったモデルを選択してください。`llama3.1:8b`は8GB VRAMで滑らかに動作します。

#### 2.3 Ollamaサーバーの確認

Ollamaはデフォルトで`localhost:11434`でAPIサーバーを実行します。

```bash
# 実行中のモデルを確認
ollama list
```

#### 2.4 GhidraGPTへのOllama接続

1. GhidraGPT設定パネルで**Ollama**を選択
2. **Server URL**: `http://localhost:11434`を入力
3. **Model**: 先にダウンロードしたモデル名を入力(例: `llama3.1:8b`、`qwen2.5-coder:7b`)

> **参考**: OllamaはGhidraGPTがサポートする「Bring your own model」方式で動作します。

---

### Qwen(OpenAI互換APIまたはOllama)

Qwenは2つの方式で使用できます。

#### 方式A: Ollamaによるローカル実行(無料)

```bash
ollama run qwen2.5-coder:7b
```

その後、Ollama設定方式と同様にGhidraGPTから接続します。

#### 方式B: DashScope API(クラウド)

1. [阿里云 DashScope](https://dashscope.aliyun.com/)でAPIキーを発行
2. GhidraGPT設定パネルで**OpenAI Compatible**を選択
3. **Base URL**: `https://dashscope.aliyuncs.com/compatible-mode/v1`を入力
4. **API Key**: DashScope APIキーを入力
5. **Model**: `qwen-max`、`qwen-plus`などを入力

> GhidraGPTはOpenAI互換APIをサポートしているため、QwenのOpenAI互換エンドポイントを通じて連携できます。

---

## 3. 主要機能の使い方

インストールと設定が完了すると、以下の機能を使用できます。

| 機能 | 説明 | 使用方法 |
|------|------|-----------|
| **Function Rewrite** | 関数名/変数名のリネーム、型推論、コメント追加 | デコンパイルウィンドウで関数を右クリック → Rewrite |
| **Code Explanation** | 関数ロジックの詳細説明 | 右クリック → Explain |
| **Code Analysis** | 脆弱性検出とセキュリティ分析 | 右クリック → Analyze |
| **Console** | モデル応答と結果の確認 | GhidraGPTコンソールウィンドウで確認 |

---

## 4. サービス別比較と推奨

| サービス | 長所 | 短所 | 推奨状況 |
|--------|------|------|-----------|
| **Ollama** | 無料、オフライン、プライバシー保証 | ローカルハードウェア性能が必要、応答速度が遅い | セキュリティが重要な分析、インターネットがない場合 |
| **ChatGPT (OpenAI)** | 優れた性能、速い応答 | 有料、インターネット必須 | 一般的なリバーシング作業 |
| **Claude** | 長いコンテキスト、優れたコード理解度 | 有料、インターネット必須 | 複雑な大規模関数の分析 |
| **Qwen (Ollama)** | 無料、コード特化、韓国語対応 | ローカルハードウェア性能が必要 | 韓国語のコメント/説明が必要な場合 |
| **Qwen (API)** | クラウド性能、韓国語対応 | 有料、インターネット必須 | 韓国語 + クラウド性能が必要な場合 |

---

## 注意事項

1. **データプライバシー**: 機密性の高いバイナリ分析時には必ず**Ollama**のようなローカルモデルを使用してください。クラウドAPIは分析対象のコードが外部に送信されます。
2. **結果の検証**: LLMが生成したコードや型情報は**必ず手動で検証**してください。AIは時に誤った分析結果を生成することがあります。
3. **APIコスト**: OpenAI、Anthropic、DashScope(Qwen)は使用量に応じてコストが発生します。

---

## 参考資料

- [GhidraGPT GitHubリポジトリ](https://github.com/ZeroDaysBroker/GhidraGPT)
- [Ollama公式サイト](https://ollama.com/)
- [Ollamaサポートモデル一覧](https://ollama.ai/library)
- [Hugging Face GGUFモデル](https://huggingface.co/docs/hub/en/ollama) - Ollamaで実行可能

---

さあ、GhidraGPTと共にAIベースのリバースエンジニアリングを始めましょう。
