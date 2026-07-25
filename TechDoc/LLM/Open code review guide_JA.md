---
title: "Open Code Review (OCR) — 完全ガイド"
description: "アリババグループが2年間の社内検証を経てオープンソース化したハイブリッドAIコードレビューCLI"
lang: ja
featured: false
schema_type: TechArticle
keywords:
  - Open Code Review
  - AI コードレビュー
  - Alibaba
  - CI/CD
  - Claude Code
tags:
  - コードレビュー
  - AIツール
  - CI/CD
  - LLM
---

# Open Code Review (OCR) — 完全ガイド

> アリババグループが2年間の社内検証を経てオープンソース化したハイブリッドAIコードレビューCLI
> Apache 2.0 | GitHub: [alibaba/open-code-review](https://github.com/alibaba/open-code-review)

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [アーキテクチャ詳細](#2-アーキテクチャ詳細)
3. [インストール](#3-インストール)
4. [LLM設定 — クラウドAPI](#4-llm設定--クラウドapi)
5. [LLM設定 — ローカルモデル(DeepSeek / Qwen / Ollama)](#5-llm設定--ローカルモデルdeepseek--qwen--ollama)
6. [基本的な使用法とコマンドリファレンス](#6-基本的な使用法とコマンドリファレンス)
7. [レビュールールのカスタマイズ](#7-レビュールールのカスタマイズ)
8. [CI/CD統合](#8-cicd統合)
9. [AIエージェント統合(Claude Code / Codex)](#9-aiエージェント統合claude-code--codex)
10. [設定リファレンス全体](#10-設定リファレンス全体)
11. [長所・短所分析](#11-長所短所分析)
12. [モデル選択ガイド](#12-モデル選択ガイド)
13. [適合するチームタイプ](#13-適合するチームタイプ)

---

## 1. プロジェクト概要

Open Code Review(以下OCR)は、アリババグループが内部で2年間運用・検証したAIコードレビューツールをオープンソース化したCLIプロジェクトである。内部運用期間中、2万人以上の開発者が使用し、100万件以上のコード欠陥を検出した。Git diffを読み取り、変更されたファイルを設定済みのLLMに渡し、行レベルの精密なレビューコメントを生成する。

中核の設計思想は「決定的エンジニアリング(Deterministic Engineering)+ LLMエージェント」のハイブリッドアーキテクチャである。必ず正確でなければならない処理段階はエンジニアリングロジックが担当し、動的判断が必要な部分のみLLMエージェントに委任する。

| 指標 | 数値 |
|---|---|
| 内部使用期間 | 2年 |
| 累積使用開発者 | 2万人以上 |
| 累積欠陥検出数 | 100万件以上 |
| 純粋LLM対比トークン削減 | 約80% |
| F1性能向上 | 26.1% |
| ライセンス | Apache 2.0 |

---

## 2. アーキテクチャ詳細

### 一般的なAIエージェントの限界

Claude Codeや汎用エージェントをコードレビューに直接使用すると、次の問題が繰り返し発生する。

- **不完全なカバレッジ**: 変更ファイルが多いPRで一部のファイルが任意に省略される。
- **位置のずれ(Position Drift)**: 報告されたイシューの行番号やファイル参照が実際とずれる。
- **品質の不安定性**: プロンプトの些細な変動でレビュー品質が大きく変わる。

OCRはこの3つの問題をアーキテクチャレベルで解決する。

### 決定的エンジニアリング層(Deterministic Engineering)

必ず正確でなければならない段階は、LLMではなくエンジニアリングロジックが保証する。

| 機能 | 説明 |
|---|---|
| 精密ファイル選択 | レビュー対象ファイルを正確に決定し、不要なファイルをフィルタリング。重要な変更事項の漏れを防止 |
| スマートファイルバンドリング | 関連ファイルを一つのレビュー単位にまとめる(例: `message_en.properties` + `message_zh.properties`)。各バンドルは独立したコンテキストのサブエージェントとして実行 |
| きめ細かなルールマッチング | 各ファイルの特性に合ったレビュールールをマッチング。情報ノイズを除去しモデルの集中度を向上 |
| 位置補正モジュール | 独立したコメントポジショニング・反省(reflection)モジュールで、AIフィードバックの位置精度と内容精度を体系的に改善 |

### LLMエージェント層

動的判断とコンテキスト検索が必要な部分を担当する。

- コードレビューに最適化されたシナリオ別プロンプトテンプレート
- 大規模プロダクションデータのツール呼び出し履歴分析で構成された専門化されたツールセット
- リアルタイムコードベース検索、ファイル全体内容の読み取り、変更された他のファイルとの相互参照

---

## 3. インストール

### NPM(推奨)

```bash
npm install -g @alibaba-group/open-code-review
```

インストール後、`ocr`コマンドがグローバルで使用可能になる。

### バイナリ直接ダウンロード

```bash
# macOS (Apple Silicon / M1~M4)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-darwin-arm64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# macOS (Intel)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-darwin-amd64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# Linux (x86_64)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-linux-amd64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr

# Linux (ARM64)
curl -Lo ocr https://github.com/alibaba/open-code-review/releases/latest/download/opencodereview-linux-arm64
chmod +x ocr && sudo mv ocr /usr/local/bin/ocr
```

### ソースビルド

```bash
git clone https://github.com/alibaba/open-code-review.git
cd open-code-review
make build
sudo cp dist/opencodereview /usr/local/bin/ocr
```

---

## 4. LLM設定 — クラウドAPI

OCRはOpenAI互換エンドポイントとAnthropicネイティブAPIの両方をサポートする。設定ファイルは`~/.opencodereview/config.json`に保存される。環境変数は設定ファイルより優先適用される。

### Anthropic(Claude)

```bash
ocr config set llm.url https://api.anthropic.com/v1/messages
ocr config set llm.auth_token sk-ant-xxxxxxx
ocr config set llm.model claude-opus-4-6
ocr config set llm.use_anthropic true
```

Claude Codeユーザーであれば、`ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_MODEL`環境変数を`~/.zshrc`または`~/.bashrc`から自動的に認識するため、別途の設定は不要である。

推奨モデル:

| モデル | 用途 |
|---|---|
| `claude-opus-4-6` | 最高品質のレビュー、複雑なアーキテクチャ分析 |
| `claude-sonnet-4-6` | コスト・性能バランス、日常的なPRレビュー |

### OpenAI(ChatGPT)

```bash
ocr config set llm.url https://api.openai.com/v1/chat/completions
ocr config set llm.auth_token sk-xxxxxxx
ocr config set llm.model gpt-4o
ocr config set llm.use_anthropic false
```

推奨モデル:

| モデル | 用途 |
|---|---|
| `gpt-4o` | コードレビューの基本推奨 |
| `o3` | 複雑なセキュリティ脆弱性分析 |
| `gpt-4.1-mini` | コスト削減が必要な環境 |

### DeepSeek Cloud API

DeepSeekはOpenAI互換APIを提供するため`use_anthropic false`に設定する。

```bash
ocr config set llm.url https://api.deepseek.com/v1/chat/completions
ocr config set llm.auth_token sk-xxxxxxx
ocr config set llm.model deepseek-coder
ocr config set llm.use_anthropic false
```

推奨モデル:

| モデル | 特徴 |
|---|---|
| `deepseek-coder` | コード特化、コスト効率優秀 |
| `deepseek-reasoner` | 複雑なロジック分析および推論に強み |

### Alibaba DashScope(Qwen Cloud)

```bash
ocr config set llm.url https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
ocr config set llm.auth_token sk-xxxxxxx
ocr config set llm.model qwen-coder-turbo
ocr config set llm.use_anthropic false
```

---

## 5. LLM設定 — ローカルモデル(DeepSeek / Qwen / Ollama)

ローカルLLMを使用すると、コードが外部APIに送信されないため完全なデータプライバシーが保証される。OCRはOpenAI互換エンドポイントをローカルで公開するすべてのランタイム(Ollama、LM Studio、vLLMなど)をサポートする。

### 5-1. Ollamaベースの設定(汎用)

Ollamaはローカルllmを最も簡単に実行する方法である。インストール後、自動的に`http://localhost:11434`にOpenAI互換エンドポイントを公開する。

```bash
# Ollamaインストール (macOS)
brew install ollama

# Ollamaインストール (Linux)
curl -fsSL https://ollama.com/install.sh | sh

# バックグラウンドサーバー起動
ollama serve &
```

OCRとOllamaの接続:

```bash
ocr config set llm.url http://localhost:11434/v1/chat/completions
ocr config set llm.auth_token ollama
ocr config set llm.model qwen2.5-coder:32b
ocr config set llm.use_anthropic false
```

> auth_tokenの値は任意の文字列で構わない。Ollamaはローカルでトークン検証を行わない。

### 5-2. DeepSeekのローカル実行

#### OllamaでDeepSeekを実行

```bash
# DeepSeek-R1(推論特化、コードレビューに適合)
ollama pull deepseek-r1:14b    # 約9GB VRAM
ollama pull deepseek-r1:32b    # 約20GB VRAM
ollama pull deepseek-r1:70b    # 約48GB以上 VRAM

# DeepSeek Coder V2(コード特化)
ollama pull deepseek-coder-v2:16b    # 約10GB VRAM
ollama pull deepseek-coder-v2:236b   # 約130GB VRAM、最高品質

# コンテキストウィンドウ拡張(agentic ワークフローに必須)
ollama run deepseek-r1:14b
>>> /set parameter num_ctx 32768
>>> /save deepseek-r1-14b-32k
```

OCR設定:

```bash
ocr config set llm.url http://localhost:11434/v1/chat/completions
ocr config set llm.auth_token ollama
ocr config set llm.model deepseek-r1:14b
ocr config set llm.use_anthropic false
```

#### vLLMでDeepSeekを実行(高性能GPUサーバー環境)

```bash
docker pull vllm/vllm-openai:latest

# DeepSeek-R1 14B(約30GB VRAM必要)
docker run --runtime nvidia --gpus all \
  -v ~/.cache/huggingface:/root/.cache/huggingface \
  -p 8000:8000 \
  vllm/vllm-openai:latest \
  --model deepseek-ai/DeepSeek-R1-Distill-Qwen-14B \
  --tensor-parallel-size 1
```

OCR設定:

```bash
ocr config set llm.url http://localhost:8000/v1/chat/completions
ocr config set llm.auth_token vllm
ocr config set llm.model deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
ocr config set llm.use_anthropic false
```

#### LM StudioでDeepSeekを実行(GUI環境)

1. [lmstudio.ai](https://lmstudio.ai)でLM Studioをインストール
2. "Discover"タブで`deepseek-r1`を検索し希望のサイズをダウンロード
3. "Local Server"タブでサーバー起動(デフォルトポート: 1234)

OCR設定:

```bash
ocr config set llm.url http://localhost:1234/v1/chat/completions
ocr config set llm.auth_token lm-studio
ocr config set llm.model deepseek-r1-distill-qwen-14b
ocr config set llm.use_anthropic false
```

### 5-3. Qwen(Qwen2.5-Coder / Qwen3)のローカル実行

Qwenシリーズはコード生成・レビューで同クラス最強のオープンソース性能を示す。特にQwen2.5-Coder 32BはHumanEval基準92.1%を達成し、Claude Sonnet 4.6(89.4%)を上回る。

```bash
# Qwen2.5-Coder(コード特化 — コードレビュー第1推奨)
ollama pull qwen2.5-coder:7b     # 約5GB VRAM、高速応答
ollama pull qwen2.5-coder:14b    # 約9GB VRAM、バランス
ollama pull qwen2.5-coder:32b    # 約20GB VRAM、最高品質

# Qwen3(汎用最新モデル、2026年2月リリース)
ollama pull qwen3:8b
ollama pull qwen3:32b

# コンテキストウィンドウ拡張(256K対応モデル基準)
ollama run qwen2.5-coder:32b
>>> /set parameter num_ctx 32768
>>> /save qwen2.5-coder-32b-32k
```

OCR設定:

```bash
ocr config set llm.url http://localhost:11434/v1/chat/completions
ocr config set llm.auth_token ollama
ocr config set llm.model qwen2.5-coder:32b
ocr config set llm.use_anthropic false
```

### 5-4. ローカルLLMハードウェア要件

| モデル | VRAM | 速度(トークン/秒) | 推奨用途 |
|---|---|---|---|
| DeepSeek-R1 14B | 9GB | 25〜40 | 個人開発者ノートPC、推論に強み |
| Qwen2.5-Coder 7B | 5GB | 40〜60 | 軽量環境、高速PRレビュー |
| Qwen2.5-Coder 14B | 9GB | 25〜35 | バランス型推奨 |
| Qwen2.5-Coder 32B | 20GB | 15〜25 | 高品質コードレビュー、エンタープライズ |
| DeepSeek-R1 32B | 20GB | 10〜18 | 複雑なセキュリティ分析 |
| DeepSeek Coder V2 236B | 130GB以上 | 8〜12 | 最高品質、GPUサーバー専用 |

> Q4量子化を使用するとVRAMを約60%節約でき、品質損失は約2%水準である。Ollamaはモデルpull時に自動的に量子化を適用する。

### 5-5. 接続テスト

```bash
# LLM接続確認(クラウド・ローカル共通)
ocr llm test
```

---

## 6. 基本的な使用法とコマンドリファレンス

### 主要レビューコマンド

```bash
# 現在の変更事項をレビュー(staged + unstaged + untracked全体)
ocr review

# ブランチ間比較レビュー
ocr review --from main --to feature-auth

# 特定コミットのレビュー
ocr review --commit abc123

# LLM呼び出しなしでレビュー対象ファイルのみ事前確認
ocr review --preview
ocr review --commit abc123 --preview

# JSON出力(CI/CDパイプライン、スクリプトパース用)
ocr review --format json --audience agent

# カスタムルールファイル適用
ocr review --rule /path/to/my-rules.json

# 同時レビューファイル数調整
ocr review --from main --to my-feature --concurrency 4
```

### コマンド一覧

| コマンド | エイリアス | 説明 |
|---|---|---|
| `ocr review` | `ocr r` | コードレビュー開始 |
| `ocr rules check <file>` | — | 該当ファイルに適用されるルールを事前確認 |
| `ocr config set <key> <value>` | — | 設定値の変更 |
| `ocr llm test` | — | LLM接続テスト |
| `ocr viewer` | `ocr v` | ブラウザベースのセッションビューア実行(`localhost:5483`) |
| `ocr version` | — | バージョン情報出力 |

### `ocr review`の主なフラグ

| フラグ | デフォルト値 | 説明 |
|---|---|---|
| `--repo` | 現在のディレクトリ | Gitリポジトリのルートパス |
| `--from` | — | 比較基準ref(例: `main`) |
| `--to` | — | 比較対象ref(例: `feature-branch`) |
| `--commit`, `-c` | — | 単一コミットのレビュー |
| `--preview`, `-p` | `false` | LLM呼び出しなしでレビュー対象ファイルのみ確認 |
| `--format`, `-f` | `text` | 出力形式: `text`または`json` |
| `--concurrency` | `8` | ファイル同時レビューの最大数 |
| `--timeout` | `10` | 同時作業のタイムアウト(分) |
| `--audience` | `human` | `human`(進行状況表示)/ `agent`(要約のみ出力) |
| `--rule` | — | カスタムレビュールールJSONファイルのパス |
| `--max-tools` | 内蔵デフォルト値 | ファイル当たりの最大ツール呼び出し回数 |
| `--tools` | — | カスタムツール設定JSONファイルのパス |

---

## 7. レビュールールのカスタマイズ

OCRは4段階の優先順位体系でルールを適用する。各段階でファイルパスがパターンに最初にマッチすればそのルールを適用し、マッチしなければ次の段階へ進む。

| 優先度 | ソース | パス | 説明 |
|---|---|---|---|
| 1(最高) | `--rule`フラグ | ユーザー指定パス | CLI明示的オーバーライド |
| 2 | プロジェクト設定 | `<repoDir>/.opencodereview/rule.json` | プロジェクト別ルール、gitにコミット可能 |
| 3 | グローバル設定 | `~/.opencodereview/rule.json` | 個人グローバル設定 |
| 4(最低) | システムデフォルト値 | 内蔵`system_rules.json` | NPE、XSS、SQL Injectionなど共通ルール |

### ルールファイル形式

```json
{
  "rules": [
    {
      "path": "src/main/java/**/*.java",
      "rule": "全ての新規メソッドの必須パラメータはnull値を検証しなければならない"
    },
    {
      "path": "**/*mapper*.xml",
      "rule": "SQL Injectionリスク、パラメータエラー、閉じタグの漏れを確認すること"
    },
    {
      "path": "src/**/*.{ts,tsx}",
      "rule": "非同期関数のエラー処理とPromiseチェーンの漏れを確認すること"
    }
  ]
}
```

- `path`は`**`再帰マッチングと`{java,kt}`中括弧展開をサポートする。
- 各層内では宣言順に評価し、最初にマッチしたものが適用される。
- ルールファイルが存在しない場合は静かにスキップされる。

特定ファイルに適用されるルールの事前確認:

```bash
ocr rules check src/main/java/com/example/UserService.java
ocr rules check --rule custom.json src/main/resources/mapper/UserMapper.xml
```

---

## 8. CI/CD統合

### GitHub Actions

```yaml
# .github/workflows/code-review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install OCR
        run: npm install -g @alibaba-group/open-code-review

      - name: Run Code Review
        env:
          OCR_LLM_URL: https://api.anthropic.com/v1/messages
          OCR_LLM_TOKEN: ${{ secrets.ANTHROPIC_API_KEY }}
          OCR_LLM_MODEL: claude-sonnet-4-6
          OCR_USE_ANTHROPIC: "true"
        run: |
          ocr review \
            --from "origin/${{ github.base_ref }}" \
            --to "origin/${{ github.head_ref }}" \
            --format json \
            --audience agent
```

### GitLab CI

```yaml
# .gitlab-ci.yml
code-review:
  stage: test
  image: node:20
  before_script:
    - npm install -g @alibaba-group/open-code-review
  script:
    - ocr review
        --from "origin/${CI_MERGE_REQUEST_TARGET_BRANCH_NAME}"
        --to "origin/${CI_MERGE_REQUEST_SOURCE_BRANCH_NAME}"
        --format json
        --audience agent
  variables:
    OCR_LLM_URL: "https://api.openai.com/v1/chat/completions"
    OCR_LLM_TOKEN: $OPENAI_API_KEY
    OCR_LLM_MODEL: "gpt-4o"
    OCR_USE_ANTHROPIC: "false"
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

### 汎用CIスクリプトパターン

```bash
ocr review \
  --from "origin/main" \
  --to "origin/feature-branch" \
  --format json \
  --audience agent
```

`--format json` + `--audience agent`の組み合わせは、CIスクリプトでパース可能な構造化出力を返す。GitHub Marketplaceにも Actionsとして公開されている。

---

## 9. AIエージェント統合(Claude Code / Codex)

OCRをAIコーディングエージェントのスラッシュコマンドとして統合すると、エージェントワークフロー内で直接コードレビューを実行できる。

### 方法1: スキルとしてインストール

```bash
npx skills add alibaba/open-code-review --skill open-code-review
```

コーディングエージェントが`ocr`の呼び出し方、イシューの優先順位分類、自動修正オプションを学習する。

### 方法2: Claude Codeプラグインとしてインストール

Claude Code内で次のコマンドを実行する:

```
/plugin marketplace add alibaba/open-code-review
/plugin install open-code-review@open-code-review
```

インストール後、`/open-code-review:review`スラッシュコマンドでOCRを実行し、イシューの自動フィルタリングおよび修正まで処理する。

### 方法3: コマンドファイル直接コピー

パッケージマネージャーなしで迅速に設定する方法である。

```bash
# プロジェクト単位(チーム共有、gitコミット可能)
mkdir -p .claude/commands
curl -o .claude/commands/open-code-review.md \
  https://raw.githubusercontent.com/alibaba/open-code-review/main/plugins/open-code-review/commands/review.md

# ユーザー単位(全プロジェクトで個人使用)
mkdir -p ~/.claude/commands
curl -o ~/.claude/commands/open-code-review.md \
  https://raw.githubusercontent.com/alibaba/open-code-review/main/plugins/open-code-review/commands/review.md
```

### OpenAI Codex統合

```bash
# Codexプラグインマーケットプレイスからインストール
codex plugin marketplace add alibaba/open-code-review
codex /plugins
```

インストール後、Codexで次のように使用する:

```
@Open Code Review review my current changes
@Open Code Review review this branch against main
@Open Code Review review and fix high-confidence issues
```

> すべての統合方法の前提条件: `ocr` CLIのインストール + LLM設定の完了が必要である。OCRの内部LLMバックエンドはエージェント統合方式とは無関係に独立して動作する。

---

## 10. 設定リファレンス全体

設定ファイルパス: `~/.opencodereview/config.json`

### 設定キー一覧

| キー | タイプ | 例 | 説明 |
|---|---|---|---|
| `llm.url` | string | `https://api.openai.com/v1/chat/completions` | LLM APIエンドポイント |
| `llm.auth_token` | string | `sk-xxxxxxx` | APIキー / 認証トークン |
| `llm.model` | string | `claude-opus-4-6` | モデル名 |
| `llm.use_anthropic` | boolean | `true` / `false` | Anthropicネイティブapi使用の有無 |
| `language` | string | `English` / `Chinese` | レビュー出力言語(デフォルト: 中国語) |
| `telemetry.enabled` | boolean | `true` / `false` | テレメトリ有効化 |
| `telemetry.exporter` | string | `console` / `otlp` | テレメトリエクスポート方式 |
| `telemetry.otlp_endpoint` | string | `localhost:4317` | OTLPコレクターアドレス |
| `telemetry.content_logging` | boolean | — | テレメトリにLLMプロンプトを含めるかどうか |

### 環境変数一覧

環境変数は設定ファイルより高い優先度を持つ。

| 環境変数 | 説明 |
|---|---|
| `OCR_LLM_URL` | LLM APIエンドポイントURL |
| `OCR_LLM_TOKEN` | APIキー / 認証トークン |
| `OCR_LLM_MODEL` | モデル名 |
| `OCR_USE_ANTHROPIC` | `true` = Anthropic、`false` = OpenAI互換 |

Claude Code環境変数(`ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_MODEL`)も自動認識する。

### レビュー出力言語の変更

デフォルトの出力言語は中国語である。韓国語または英語に変更するには:

```bash
ocr config set language English
# または
ocr config set language Korean
```

### テレメトリ設定(OpenTelemetry)

```bash
ocr config set telemetry.enabled true
ocr config set telemetry.exporter otlp
ocr config set telemetry.otlp_endpoint localhost:4317
```

`telemetry.content_logging`を有効化すると、LLMプロンプトと応答がエクスポートデータに含まれる。デフォルトは無効。

---

## 11. 長所・短所分析

### 長所

**大規模検証済み(Battle-tested)**

2万人以上のアリババ内部開発者が2年間使用し、100万件以上の欠陥を検出した。SaaSではなくCLIツールであるため、コードとデータが外部に流出せず、エンタープライズのセキュリティ要件を満たす。ローカルLLMと組み合わせると完全なAir-gap環境の構築も可能である。

**経済性およびハイブリッド設計**

純粋LLMエージェント対比でトークン使用量を80%削減する。一般的なAIコードレビューの3つの慢性的問題(不完全なカバレッジ、位置のずれ、品質の不安定性)を決定的エンジニアリング層で構造的に解決した。

**柔軟なモデルサポート**

OpenAI、Anthropic、DeepSeek、DashScope(Qwen)、OllamaなどOpenAI互換エンドポイントを公開するすべてのランタイムをサポートする。クラウドとローカルLLMを自由に切り替え可能である。

**CI/CDおよびエージェントエコシステム統合**

GitHub Actions、GitLab CIの例を公式提供する。Claude Code、Codexなど主要AIコーディングエージェントとプラグイン/スキル/コマンド方式で統合される。

### 短所および考慮事項

**LLM API費用**

ツール自体はApache 2.0で無料だが、バックエンドLLM API費用はユーザー負担である。ローカルLLMでこの費用を除去できるが、ハードウェア要件が伴う。

**初期環境設定**

既存のClaude Codeユーザーは環境変数を自動認識するため設定が不要である。しかし新規ユーザーはLLM APIキー、エンドポイント、モデル設定プロセスを経る必要がある。ローカルLLM使用時はOllamaのインストールおよびモデルダウンロード(数GB)が追加で必要である。

**ビジネスロジックの限界**

内蔵ルールとカスタムルールで相当部分補完可能だが、チーム固有のビジネスロジックやドメイン特化のコンベンションを完全には理解しない。ルールファイルにチーム特化の指針を継続的に追加していく運用が必要である。

**AIの根本的限界**

高次元的なアーキテクチャ設計の適合性やビジネス要件との完全な整合性は人間の判断に代替しにくい。OCRはレビュアーの負担を減らす補助ツールであり、完全な代替材ではない。

---

## 12. モデル選択ガイド

| 状況 | 推奨モデル | 理由 |
|---|---|---|
| 最高品質のレビュー、コスト余裕あり | Claude Opus 4.6(クラウド) | 複雑なコンテキスト理解およびアーキテクチャ分析 |
| 日常的なPRレビュー、コストバランス | Claude Sonnet 4.6またはGPT-4o | 性能・コストバランス |
| コードの完全な外部流出不可 | Qwen2.5-Coder 32B(Ollama) | ローカル実行、HumanEval 92.1% |
| 複雑なセキュリティ脆弱性分析 | DeepSeek-R1(ローカルまたはクラウド) | 推論特化アーキテクチャ |
| コスト最小化(クラウド) | DeepSeek Coder API | コード特化 + 低いAPI単価 |
| 軽量ローカル環境(8GB VRAM以下) | Qwen2.5-Coder 7B | 高速応答、低いハードウェア要件 |
| GPUサーバー最高品質 | DeepSeek Coder V2 236B | HumanEval 95.7%(オープンソース最高) |

---

## 13. 適合するチームタイプ

**大規模コードベース運用組織**

多くのファイルが同時に変更されるPRでも、スマートバンドリングとファイル選択ロジックが漏れなく全体をカバーする。汎用エージェント対比で漏れ率が構造的に低い。

**セキュリティ脆弱性対応が重要なチーム**

NPE、SQL Injection、XSS、Thread-Safetyなど高リスク欠陥をレビュー初期段階で遮断する。ローカルLLMと組み合わせるとコードが外部に出ない完全プライベート環境を構成できる。

**AI導入コストに敏感なチーム**

80%のトークン削減は同一予算でカバーできるレビュー規模を5倍に増やす。DeepSeekクラウドAPIやQwenローカルモデルを活用すればコストをさらに削減できる。

**既存のレビュープロセスにAIを組み合わせたいチーム**

OCRがNPE、セキュリティ脆弱性、コーディングコンベンション違反を1次フィルタリングすると、人間のレビュアーはアーキテクチャ設計とビジネスロジック検討に集中できる。

---

## 参考資料

- [GitHubリポジトリ](https://github.com/alibaba/open-code-review)
- [公式ドキュメントサイト](https://alibaba.github.io/open-code-review/)
- [GitHub Marketplace(Actions)](https://github.com/marketplace?q=open-code-review)
- [Digital Today — トークン使用量80%削減紹介](https://digitaltoday.co.kr)(2026.6.8)
- [Gigazine — 内部性能ベンチマーク結果報道](https://gigazine.net)(2026.6.7)
