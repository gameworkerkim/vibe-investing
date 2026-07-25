---
title: "Headroom 完全ガイド"
description: "オープンソースのコンテキスト圧縮ツールHeadroomの説明・インストール・設定・DeepSeek V4 Pro / Open Code連携"
lang: ja
featured: false
schema_type: TechArticle
keywords:
  - Headroom
  - コンテキスト圧縮
  - トークン削減
  - Open Code
  - DeepSeek
tags:
  - LLM
  - コスト最適化
  - プロキシ
  - CLIツール
---

# Headroom 完全ガイド
> 説明・インストール・設定・DeepSeek V4 Pro / Open Code連携まで

---

## 目次

1. [Headroomとは?](#1-headroomとは)
2. [インストール(Proxyモード推奨)](#2-インストールproxyモード推奨)
3. [AIツール連携](#3-aiツール連携proxyモード)
4. [DeepSeek V4 Pro + Open Code環境での使用](#4-deepseek-v4-pro--open-code環境での使用)
5. [Headroomの他の使用方法](#5-headroomの他の使用方法)
6. [有用なコマンドとヒント](#6-有用なコマンドとヒント)
7. [トラブルシューティング](#7-トラブルシューティング)
8. [レファレンスおよび主要リンク](#8-レファレンスおよび主要リンク)

---

## 1. Headroomとは?

**Headroom**はAIエージェント(特にコーディング用AIモデル)との通信で発生する膨大なコンテキスト(コード、ログ、検索結果など)を知的に圧縮し、**コストを最大95%削減しながらも応答品質を維持**するオープンソースプロジェクトである。

> Netflixシニアエンジニアの Tejas Chopra が開発し、2026年1月にオープンソース公開。Apache 2.0ライセンス。

### なぜ必要なのか?

AIが作業を行う際は、毎リクエストごとに次のような大量のコンテキストが送信される。

- コード検索結果
- ログファイル
- API応答
- 以前の対話履歴

これは**コスト増加**と**情報過負荷**につながり、AIが重要な部分を見逃す原因となる。

### 動作方式

```
[AIエージェント] --リクエスト--> [Headroom Proxy] --圧縮されたリクエスト--> [LLM API]
                              |
                         スマート圧縮
                    (繰り返し・不要情報の除去)
                    CacheAligner適用
```

| 段階 | 説明 |
|------|------|
| **リクエスト傍受** | AIエージェントとAPIの間に位置し、すべてのリクエストを中間で傍受する |
| **スマート圧縮** | 繰り返し的または重要度の低い情報を参照リンクに置き換えるか圧縮する |
| **キャッシュ整列** | CacheAligner技術でプロンプトキャッシュ破壊問題を解決し、コスト削減を最大化する |

### 主な圧縮エンジン

| エンジン | 役割 |
|------|------|
| `SmartCrusher` | 汎用JSON配列・入れ子オブジェクトの圧縮 |
| `CodeCompressor` | Python、JS、Go、Rust、Java、C++のAST-aware圧縮 |
| `Kompress-base` | HuggingFace訓練モデルベースのエージェントトレース圧縮 |
| `CacheAligner` | Anthropic/OpenAI KVキャッシュprefixの安定化 |
| `IntelligentContext` | 重要度スコアベースのコンテキストフィッティング |
| `CCR` | 可逆圧縮(LLMが必要時に原本検索可能) |

### 主な効果

| 区分 | 削減効果 |
|------|-----------|
| トークン削減 | **60%〜95%** |
| コスト削減 | **最大〜50%**(同一予算で約2倍使用可能) |
| 品質 | 同等または小幅向上 |

---

## 2. インストール(Proxyモード推奨)

Proxyモードは既存コードの変更なしにHeadroomを最も簡単に使用できる方法である。
DeepSeek V4 Pro、Open Codeなどすべてのllmとツールで動作する。

### 2.1 Headroomのインストール

```bash
pip install "headroom-ai[proxy]"
```

> 全機能インストール: `pip install "headroom-ai[all]"`

### 2.2 プロキシサーバーの実行

```bash
headroom proxy --port 8787
```

- `--port 8787`: プロキシサーバーが使用するポートを指定(他のポートも可能)
- 正常実行時、`Listening on http://localhost:8787`メッセージが出力される

### 2.3 正常動作の確認

```bash
curl http://localhost:8787/health
```

成功応答:

```json
{"status": "healthy", "version": "x.x.x"}
```

---

## 3. AIツール連携(Proxyモード)

プロキシサーバーが実行中の状態で、各AIツールがこのプロキシを通じてapiを呼び出すよう設定する。

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

> **永久設定のヒント:** `~/.bashrc`または`~/.zshrc`に以下の行を追加
> ```bash
> export OPENAI_BASE_URL=http://localhost:8787/v1
> ```

---

## 4. DeepSeek V4 Pro + Open Code環境での使用

### 段階別実行

**第1段階: Headroomプロキシの実行**

```bash
headroom proxy --port 8787
```

**第2段階: Open Codeをプロキシ経由で実行**

```bash
OPENAI_BASE_URL=http://localhost:8787/v1 openclaude
```

DeepSeek V4 Proを直接呼び出す場合:

```bash
OPENAI_BASE_URL=http://localhost:8787/v1 deepseek-v4-pro --model deepseek-v4-pro
```

**第3段階: 正常動作の確認**

- Open Codeで一般的なコーディングの質問を入力
- Headroomプロキシのターミナルに圧縮統計(削減されたトークン数)が表示される
- `headroom stats`コマンドで累積削減量を確認できる

> **互換性の保証:** Headroomはプロキシレベルで動作するため、DeepSeek V4 Proの固有のAPI形式やOpen Codeの通信方式を全く侵害しない。

---

## 5. Headroomの他の使用方法

### 5.1 Agent Wrap(エージェントラッピング) — 最も簡単

```bash
headroom wrap openclaude
headroom wrap cursor
```

以後`openclaude`実行時に自動的にHeadroomが適用される。

> Quick Win: `pip install "headroom-ai[all]"`の後`headroom wrap claude`

### 5.2 MCPサーバー(Model Context Protocol)

複数のMCPクライアントを使用するならこの方法が効率的である。

```bash
headroom mcp install
```

提供されるMCPツール:

| ツール | 説明 |
|------|------|
| `headroom_compress` | テキスト圧縮リクエスト |
| `headroom_retrieve` | 圧縮されたコンテキストの検索 |
| `headroom_stats` | 統計照会 |

### 5.3 Pythonライブラリ

```python
from headroom import compress

compressed = compress(
    text="非常に長いログファイルの内容...",
    model="deepseek-v4-pro"  # モデル指定可能
)
```

### 5.4 マルチエージェント環境

Claude + Codexを並行運用する場合、SharedContextで自動的に重複除去された共通圧縮コンテキストストアを共有できる。

---

## 6. 有用なコマンドとヒント

| コマンド | 説明 |
|--------|------|
| `headroom stats` | これまで削減したトークン/コスト統計を出力 |
| `headroom reset` | 統計を初期化 |
| `headroom proxy --help` | プロキシオプション全体を表示 |
| `headroom config` | 設定ファイルを編集(圧縮レベルなど調整可能) |

### 圧縮レベルの調整(config.yaml)

```yaml
compression:
  level: "balanced"  # "aggressive" | "balanced" | "conservative"
  cache_alignment: true
```

### クイックスタート(ワンライナー)

```bash
# インストール + プロキシ実行
pip install "headroom-ai[proxy]" && headroom proxy --port 8787

# 別のターミナルで
OPENAI_BASE_URL=http://localhost:8787/v1 openclaude
```

---

## 7. トラブルシューティング

**Q: プロキシサーバーが起動しません。**

- ポート競合を確認: `lsof -i :8787` → 他のポート使用時は`--port 8788`などに変更
- Headroomの再インストール: `pip install --upgrade "headroom-ai[proxy]"`

**Q: ツールで「Connection refused」エラーが出ます。**

- プロキシサーバーが先に実行されているか確認
- 環境変数のポート番号の一致を確認(`http://localhost:8787`)

**Q: DeepSeek V4 Proの特定パラメータが効きません。**

- Headroomはパラメータを無条件に通過させるため、ツール自体の問題である可能性が高い
- Headroomなしで先にテストして比較

**Q: 削減効果がほとんどありません。**

- `headroom stats`で実際の圧縮率を確認
- コンテキストが既に小さい場合は圧縮効果が微小な場合がある

---

## 8. レファレンスおよび主要リンク

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
| Building Cost-Efficient Agents with Headroom (Medium) | [subratpati.medium.com](https://subratpati.medium.com/building-cost-efficient-agents-with-headroom-context-compression-for-llm-applications-b665128153b6) |
| Headroom: Cut LLM Token Usage by Up to 95% (DEV.to) | [dev.to/arshtechpro](https://dev.to/arshtechpro/headroom-cut-your-llm-token-usage-by-up-to-95-without-changing-your-answers-5g06) |
| Headroom Token Compression実戦ガイド(Build This Now) | [buildthisnow.com](https://www.buildthisnow.com/blog/tools/extensions/headroom-token-compression) |

### 関連技術参考資料

| 資料 | 説明 |
|------|------|
| Phil Schmid — Context Engineering原則 | Headroom哲学の基盤: 「Raw > Compaction > Summarization」優先順位 |
| Anthropic Prompt Cachingドキュメント | CacheAligner理解のための背景知識 |
| OpenAI Compatible APIスペック | Proxyモード BASE_URL連携の基盤 |

---

> **バージョン情報:** 本ドキュメントはHeadroom v0.22基準で作成された(2026年6月基準)。
> Apache 2.0 License | 開発者: Tejas Chopra(Netflix Senior Engineer)
