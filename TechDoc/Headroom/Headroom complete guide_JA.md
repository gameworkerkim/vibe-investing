---
title: "Headroom 完全ガイド"
description: "オープンソースのLLMコンテキスト圧縮プロキシHeadroomの完全ガイド——概要、インストール、AIツール連携、DeepSeek V4 Pro/Open Codeでの設定、トラブルシューティング。"
abstract: |
  HeadroomはAIコーディングエージェントとやり取りされる巨大なコンテキスト(コード、ログ、検索結果など)を
  インテリジェントに圧縮し、応答品質を保ちながらコストを最大95%削減するオープンソースプロジェクトである。
  本ガイドはHeadroomの概要と動作原理、プロキシモードでのインストール、Open Code・DeepSeek V4 Pro・Cursor・
  Claude Code・Codex CLI・Aiderなど各AIツールとの連携、その他の利用方法(エージェントラッピング、MCPサーバー、
  Pythonライブラリ、マルチエージェント共有コンテキスト)、便利なコマンド・圧縮レベル調整、トラブルシューティング、
  参考リンクを解説する。
summary_for_ai: |
  AIコーディングエージェント向けオープンソースコンテキスト圧縮プロキシHeadroom(v0.22、2026年6月時点)の完全ガイド。
  Netflixのシニアエンジニアであるテジャス・チョプラ(Tejas Chopra)が開発し、2026年1月にApache 2.0でオープンソース化された。
  核心的な価値:AIエージェントとLLM APIの間に位置し、リクエストを傍受してスマート圧縮とキャッシュ調整
  (CacheAligner、プロンプトキャッシュ破壊を回避)を適用することで、トークンを60~95%、コストを最大約50%
  (同予算で約2倍の使用量)削減し、品質は同等またはわずかに向上する。
  圧縮エンジン:SmartCrusher(汎用JSON配列・入れ子オブジェクト圧縮)、CodeCompressor(Python/JS/Go/Rust/
  Java/C++向けAST対応圧縮)、Kompress-base(HuggingFaceで学習されたエージェントトレース圧縮モデル)、
  CacheAligner(Anthropic/OpenAIのKVキャッシュprefixを安定化)、IntelligentContext(重要度スコアに基づく
  コンテキストフィッティング)、CCR(必要時にLLMが原文を検索できる可逆圧縮)。
  推奨インストール:`pip install "headroom-ai[proxy]"`でプロキシモードをインストールし、
  `headroom proxy --port 8787`で起動、OPENAI_BASE_URLまたはANTHROPIC_BASE_URL環境変数でツールを
  プロキシに向ける。Open Code、DeepSeek V4 Pro、Cursor、Claude Code、Codex CLI、Aider、Copilot CLI、
  Continueとの連携例、DeepSeek V4 Pro + Open Codeの完全な実行手順を含む。
  その他の利用方法:自動でエージェントをラップする`headroom wrap <tool>`、MCPサーバー経由の連携用
  `headroom mcp install`(headroom_compress/retrieve/statsツール)、`from headroom import compress`による
  直接的なPythonライブラリ利用、複数エージェント並列実行時に重複排除された共有圧縮コンテキストストアを
  利用するSharedContext。
  便利なコマンド:`headroom stats`、`headroom reset`、`headroom config`(圧縮レベル:aggressive/balanced/
  conservative、cache_alignmentのオン/オフ)。トラブルシューティングFAQ(プロキシが起動しない、connection
  refused、パラメータが機能しない、削減効果がほぼない)と参考リンク(公式サイト、GitHub、PyPI、LangChain/CCR/
  メトリクスの連携ガイド、関連記事、コンテキストエンジニアリングとプロンプトキャッシュに関する背景知識)を含む。
date: 2026-06-15
author: "Dennis Kim"
lang: ja
tags:
  - Headroom
  - LLM
  - コンテキスト圧縮
  - AIエージェント
  - コスト最適化
keywords:
  - Headroom AI プロキシ
  - LLM コンテキスト圧縮
  - トークンコスト削減
  - DeepSeek V4 Pro
  - Open Code 連携
  - CacheAligner
featured: false
schema_type: TechArticle
draft: false
---

# Headroom 完全ガイド
> 概要・インストール・設定・DeepSeek V4 Pro / Open Code連携まで

---

## 目次

1. [Headroomとは?](#1-headroomとは)
2. [インストール(プロキシモード推奨)](#2-インストールプロキシモード推奨)
3. [AIツールとの連携](#3-aiツールとの連携プロキシモード)
4. [DeepSeek V4 Pro + Open Code環境での使用](#4-deepseek-v4-pro--open-code環境での使用)
5. [Headroomのその他の使用方法](#5-headroomのその他の使用方法)
6. [便利なコマンドとヒント](#6-便利なコマンドとヒント)
7. [トラブルシューティング](#7-トラブルシューティング)
8. [参考資料と主要リンク](#8-参考資料と主要リンク)

---

## 1. Headroomとは?

**Headroom**は、AIエージェント(特にコーディング用AIモデル)との通信で発生する膨大なコンテキスト(コード、ログ、検索結果など)をインテリジェントに圧縮し、**コストを最大95%削減しながら応答品質を維持する**オープンソースプロジェクトである。

> Netflixのシニアエンジニア、テジャス・チョプラ(Tejas Chopra)が開発し、2026年1月にオープンソース化。Apache 2.0ライセンス。

### なぜ必要か?

AIがタスクを実行する際、リクエストごとに以下のような大量のコンテキストが送信される。

- コード検索結果
- ログファイル
- APIレスポンス
- 過去の会話履歴

これは**コストの増加**と**情報過多**につながり、AIが重要な部分を見落とす原因となる。

### 動作原理

```
[AIエージェント] ──リクエスト──▶ [Headroomプロキシ] ──圧縮済みリクエスト──▶ [LLM API]
                              │
                         スマート圧縮
                    (反復・不要な情報を除去)
                    CacheAligner適用
```

| ステップ | 説明 |
|------|------|
| **リクエスト傍受** | AIエージェントとAPIの間に位置し、すべてのリクエストを中間で傍受する |
| **スマート圧縮** | 反復的または重要度の低い情報を参照リンクに置き換えるか圧縮する |
| **キャッシュ調整** | CacheAligner技術でプロンプトキャッシュ破壊問題を解決し、コスト削減効果を最大化する |

### 主要な圧縮エンジン

| エンジン | 役割 |
|------|------|
| `SmartCrusher` | 汎用的なJSON配列・入れ子オブジェクトの圧縮 |
| `CodeCompressor` | Python、JS、Go、Rust、Java、C++向けAST対応圧縮 |
| `Kompress-base` | HuggingFaceで学習されたモデルによるエージェントトレース圧縮 |
| `CacheAligner` | Anthropic/OpenAIのKVキャッシュprefixを安定化 |
| `IntelligentContext` | 重要度スコアに基づくコンテキストフィッティング |
| `CCR` | 可逆圧縮(必要時にLLMが原文を検索可能) |

### 主な効果

| 項目 | 削減効果 |
|------|-----------|
| トークン削減 | **60%~95%** |
| コスト削減 | **最大約50%**(同予算で約2倍の使用が可能) |
| 品質 | 同等またはわずかに向上 |

---

## 2. インストール(プロキシモード推奨)

プロキシモードは、既存のコードを変更せずにHeadroomを最も簡単に使用できる方法である。
DeepSeek V4 Pro、Open Codeなど、すべてのLLM・ツールで動作する。

### 2.1 Headroomのインストール

```bash
pip install "headroom-ai[proxy]"
```

> 全機能インストール: `pip install "headroom-ai[all]"`

### 2.2 プロキシサーバーの起動

```bash
headroom proxy --port 8787
```

- `--port 8787`:プロキシサーバーが使用するポートを指定(他のポートも可能)
- 正常に起動すると`Listening on http://localhost:8787`というメッセージが表示される

### 2.3 動作確認

```bash
curl http://localhost:8787/health
```

成功時のレスポンス:

```json
{"status": "healthy", "version": "x.x.x"}
```

---

## 3. AIツールとの連携(プロキシモード)

プロキシサーバーが起動している状態で、各AIツールがこのプロキシを経由してAPIを呼び出すように設定する。

### 基本原理

| 互換方式 | 環境変数 |
|-----------|-----------|
| OpenAI互換ツール | `OPENAI_BASE_URL=http://localhost:8787/v1` |
| Anthropic互換ツール | `ANTHROPIC_BASE_URL=http://localhost:8787` |

### ツール別連携例

| ツール | コマンド |
|------|--------|
| Open Code(OpenClaude) | `OPENAI_BASE_URL=http://localhost:8787/v1 openclaude` |
| DeepSeek V4 Pro | `OPENAI_BASE_URL=http://localhost:8787/v1 deepseek` |
| Cursor | `OPENAI_BASE_URL=http://localhost:8787/v1 cursor` |
| Claude Code | `ANTHROPIC_BASE_URL=http://localhost:8787 claude` |
| Codex CLI | `OPENAI_BASE_URL=http://localhost:8787/v1 codex` |
| Aider | `OPENAI_BASE_URL=http://localhost:8787/v1 aider` |
| Copilot CLI | `OPENAI_BASE_URL=http://localhost:8787/v1 copilot` |
| Continue | 設定ファイルに`OPENAI_BASE_URL=http://localhost:8787/v1`を入力 |

> **💡 永続設定のヒント:** `~/.bashrc`または`~/.zshrc`に以下の行を追加
> ```bash
> export OPENAI_BASE_URL=http://localhost:8787/v1
> ```

---

## 4. DeepSeek V4 Pro + Open Code環境での使用

### 段階別実行

**ステップ1:Headroomプロキシの起動**

```bash
headroom proxy --port 8787
```

**ステップ2:プロキシ経由でOpen Codeを実行**

```bash
OPENAI_BASE_URL=http://localhost:8787/v1 openclaude
```

DeepSeek V4 Proを直接呼び出す場合:

```bash
OPENAI_BASE_URL=http://localhost:8787/v1 deepseek-v4-pro --model deepseek-v4-pro
```

**ステップ3:動作確認**

- Open Codeで通常のコーディングの質問を入力する
- Headroomプロキシのターミナルに圧縮統計(削減されたトークン数)が表示される
- `headroom stats`コマンドで累積削減量を確認できる

> **✅ 互換性の保証:** Headroomはプロキシレベルで動作するため、DeepSeek V4 Pro固有のAPI形式やOpen Codeの通信方式を一切侵害しない。

---

## 5. Headroomのその他の使用方法

### 5.1 Agent Wrap(エージェントラッピング)——最も簡単

```bash
headroom wrap openclaude
headroom wrap cursor
```

以降、`openclaude`実行時に自動的にHeadroomが適用される。

> Quick Win: `pip install "headroom-ai[all]"`後、`headroom wrap claude`

### 5.2 MCPサーバー(Model Context Protocol)

複数のMCPクライアントを使用している場合、この方法が効率的である。

```bash
headroom mcp install
```

提供されるMCPツール:

| ツール | 説明 |
|------|------|
| `headroom_compress` | テキスト圧縮リクエスト |
| `headroom_retrieve` | 圧縮されたコンテキストの検索 |
| `headroom_stats` | 統計の照会 |

### 5.3 Pythonライブラリ

```python
from headroom import compress

compressed = compress(
    text="非常に長いログファイルの内容...",
    model="deepseek-v4-pro"  # モデルを指定可能
)
```

### 5.4 マルチエージェント環境

ClaudeとCodexを並行運用する場合、SharedContextにより自動的に重複排除された共通の圧縮コンテキストストアを共有できる。

---

## 6. 便利なコマンドとヒント

| コマンド | 説明 |
|--------|------|
| `headroom stats` | これまでに削減したトークン・コストの統計を出力 |
| `headroom reset` | 統計を初期化 |
| `headroom proxy --help` | プロキシオプション全体を表示 |
| `headroom config` | 設定ファイルの編集(圧縮レベルなどを調整可能) |

### 圧縮レベルの調整(config.yaml)

```yaml
compression:
  level: "balanced"  # "aggressive" | "balanced" | "conservative"
  cache_alignment: true
```

### クイックスタート(1行コマンド)

```bash
# インストール+プロキシ起動
pip install "headroom-ai[proxy]" && headroom proxy --port 8787

# 別のターミナルで
OPENAI_BASE_URL=http://localhost:8787/v1 openclaude
```

---

## 7. トラブルシューティング

**Q: プロキシサーバーが起動しません。**

- ポート競合を確認:`lsof -i :8787`→別のポートを使用する場合は`--port 8788`などに変更
- Headroomの再インストール:`pip install --upgrade "headroom-ai[proxy]"`

**Q: ツールで「Connection refused」エラーが出ます。**

- プロキシサーバーが先に起動しているか確認
- 環境変数のポート番号が一致しているか確認(`http://localhost:8787`)

**Q: DeepSeek V4 Proの特定パラメータが機能しません。**

- Headroomはパラメータを無条件に通過させるため、ツール自体の問題である可能性が高い
- Headroomなしで先にテストしてから比較する

**Q: 削減効果がほとんどありません。**

- `headroom stats`で実際の圧縮率を確認
- コンテキストがすでに小さい場合、圧縮効果はわずかになる可能性がある

---

## 8. 参考資料と主要リンク

### 公式リソース

| リソース | URL |
|--------|-----|
| 公式ホームページ | [headroomlabs.ai](https://headroomlabs.ai/) |
| GitHubリポジトリ | [github.com/chopratejas/headroom](https://github.com/chopratejas/headroom) |
| 公式ドキュメント(docs/) | [github.com/chopratejas/headroom/tree/main/docs](https://github.com/chopratejas/headroom/tree/main/docs) |
| PyPIパッケージ | [pypi.org/project/headroom-ai](https://pypi.org/project/headroom-ai/) |

### 連携ガイド(公式ドキュメント)

| ガイド | URL |
|--------|-----|
| LangChain連携 | [docs/langchain.md](https://github.com/chopratejas/headroom/blob/main/docs/langchain.md) |
| CCR(可逆圧縮)ガイド | [docs/ccr.md](https://github.com/chopratejas/headroom/blob/main/docs/ccr.md) |
| Metrics & Monitoring | [docs/metrics.md](https://github.com/chopratejas/headroom/blob/main/docs/metrics.md) |

### 参考記事

| タイトル | URL |
|------|-----|
| Building Cost-Efficient Agents with Headroom(Medium) | [subratpati.medium.com](https://subratpati.medium.com/building-cost-efficient-agents-with-headroom-context-compression-for-llm-applications-b665128153b6) |
| Headroom: Cut LLM Token Usage by Up to 95%(DEV.to) | [dev.to/arshtechpro](https://dev.to/arshtechpro/headroom-cut-your-llm-token-usage-by-up-to-95-without-changing-your-answers-5g06) |
| Headroom Token Compression実践ガイド(Build This Now) | [buildthisnow.com](https://www.buildthisnow.com/blog/tools/extensions/headroom-token-compression) |

### 関連技術の参考資料

| 資料 | 説明 |
|------|------|
| Phil Schmid——Context Engineeringの原則 | Headroomの思想の基盤:「Raw > Compaction > Summarization」の優先順位 |
| Anthropic Prompt Cachingドキュメント | CacheAligner理解のための背景知識 |
| OpenAI Compatible APIスペック | プロキシモードのBASE_URL連携の基盤 |

---

> **バージョン情報:** 本文書はHeadroom v0.22基準で作成されている(2026年6月時点)。
> Apache 2.0 License | 開発者:Tejas Chopra(Netflixシニアエンジニア)
