---
title: "caveman + rtk——AIコーディングアシスタントのトークン最適化完全ガイド"
description: "出力トークンを圧縮するcavemanと入力トークン(CLI出力)を圧縮するrtk——2つを組み合わせることでAIコーディングアシスタントのAPIコストを80~95%削減できるオープンソースツールの完全ガイド。"
abstract: |
  AIコーディングアシスタントの利用が一般化するにつれ、APIコストとコンテキストトークンの消費は開発者にとって
  ますます大きな負担になっている。本ガイドはこの問題に反対方向からアプローチする2つのオープンソースプロジェクトを
  扱う。cavemanはLLMの応答から不要な冗長性を取り除き、技術的正確性を100%保ちながら出力トークンを65~75%削減する。
  rtk(Rust Token Killer)はコマンド出力をLLMコンテキストに到達する前にフィルタリング・圧縮するCLIプロキシで、
  入力トークンを60~90%削減する。互いに異なるレイヤー(出力対入力)で動作するため、組み合わせると合計で
  80~95%の削減を実現する。本ガイドはインストール、圧縮レベル設定、前後比較例、Claude Codeなどへの統合、
  コスト削減計算機を扱う。
summary_for_ai: |
  AIコーディングアシスタント向けの2つのオープンソースLLMトークン最適化ツール、caveman(2026年6月時点で
  GitHubスター71,000以上)とrtk/Rust Token Killer(スター42,000以上)の完全ガイド。
  caveman:LLMの出力から不要な冗長性・儀礼的表現を取り除きつつ、コード・URL・パスはbyte-perfectに保つ。
  2026年3月のarXiv論文「Brevity Constraints Reverse Performance Hierarchies in Language Models」
  (2604.00025)——簡潔さが特定ベンチマークの精度を最大26ポイント向上させ得ることを示した——に基づく。
  出力トークンを65~75%(範囲22~87%)削減し、応答速度を約3倍向上、技術的正確性は100%維持。強度レベルは
  lite、full、ultra、wenyan(古典中国語スタイル)の4段階。追加コマンド:/caveman-commit、/caveman-review、
  /caveman-stats、/caveman-compress。出力トークンのみに影響し、思考・推論トークンには影響しない——コード生成が
  主なタスクよりも会話・やり取りの多いセッションで効果が顕著。Claude Code、Codex、Gemini CLI、Cursor、
  Windsurf、Cline、GitHub Copilotなど34以上のAIコーディングツールをサポート。
  rtk(Rust Token Killer):依存関係のない単一Rustバイナリのプロキシで、コマンド出力(git status、cargo test、
  grepなど)をLLMコンテキストに到達する前にフィルタリング・圧縮し、100以上のコマンドで入力トークンを
  60~90%削減、オーバーヘッドは10ms未満。4つの圧縮戦略:smart filtering(ANSIコード・プログレスバー・
  ボイラープレート除去)、group aggregation、intelligent truncation、deduplication。例:`git status`が
  約2,000トークンから約400トークンに削減。30分セッションの例では、ls・cat・grep・git・npm test・pytest・
  go test・docker psなど一般的なコマンドで約118,000トークンが約23,900トークン(80%削減)に。Homebrew、
  シェルスクリプト、Cargoでインストール可能、`rtk init -g --claude-md`でClaude CodeのPreToolUseフックと
  連携、`rtk gain`で節約統計を確認。
  統合パイプライン:rtkが入力(LLMに到達する前のCLI出力)を、cavemanが出力(LLMの応答)を最適化し、
  合計で80~95%のトークン削減を実現する。段階的な統合セットアップ手順、両者を自動的に連結する
  「OmniRoute Stackedモード」の設定、5つの実使用シナリオ(テスト失敗のデバッグ、コードレビュー、
  コミットメッセージ生成、ログ要約、依存関係チェック)、各ツールの有無による個人開発者・10人チーム・
  エンタープライズパイプラインの月間Claude Sonnet APIコスト推定計算機を含む。
date: 2026-06-20
author: "Dennis Kim"
lang: ja
tags:
  - LLM
  - トークン最適化
  - AIコーディングアシスタント
  - Claude Code
  - コスト最適化
keywords:
  - caveman トークン圧縮
  - rtk Rust Token Killer
  - LLM出力トークン削減
  - CLI出力圧縮
  - Claude Code コスト最適化
  - AIコーディングアシスタント トークン節約
featured: false
schema_type: TechArticle
draft: false
---

# caveman + rtk——AIコーディングアシスタントのトークン最適化完全ガイド

> "Why use many token when few token do trick?" —— cavemanのスローガン

---

## 1. 概要

AIコーディングアシスタントの利用が一般化するにつれ、APIコストとコンテキストトークンの消費は開発者にとってますます大きな負担になっている。こうした背景の中、2つの革新的なオープンソースプロジェクトが登場した。

**caveman**は「多くのトークンを使う理由は何か、少ないトークンでも用が済むのに」という発想から出発している。AIが不要な言い回しなしで核心だけを伝えるよう誘導し、技術的正確性を100%維持しながら出力トークンを約65~75%削減する。2026年4月のリリース以降、短期間でGitHubスター71,000以上(2026年6月時点)を獲得し、大きな注目を集めた。

**rtk(Rust Token Killer)**はCLIコマンドの出力をリアルタイムでフィルタリング・圧縮するプロキシツールで、LLMコンテキストに到達する前に入力トークンの使用量を60~90%削減する。単一のRustバイナリとして作られており依存関係がなく、10ms未満のオーバーヘッドしか発生させず、GitHubスター42,000以上を保有している。

2つのツールは異なるレイヤー(入力/出力)を担当するため、共に使用すると相乗効果が最大化される。

---

## 2. caveman

### 2.1 背景

cavemanは、AIの過度な話法と不要な言い回しがコストと効率性に与える影響を批判的に見る視点から生まれた。2026年3月にarXivで発表された論文(「Brevity Constraints Reverse Performance Hierarchies in Language Models」、番号2604.00025)は、AIが短く簡潔に答えるほど特定のベンチマークで精度がむしろ最大26ポイント向上し得ることを証明した。cavemanはこの学術的発見を実用的なツールとして実装したものである。

Claudeは基本的に親切かつ冗長に応答するよう訓練されている。これは一般的な対話では利点だが、自動化された開発パイプラインにおいては高コストな非効率である。cavemanはこのデフォルトを変え、コード・URL・ファイルパスなどの技術的情報はbyte-perfectに保ちながら自然言語の装飾だけを取り除く。

### 2.2 効果

| 項目 | 効果 |
|------|------|
| 出力トークン削減 | 平均65~75%(範囲22~87%) |
| 応答速度向上 | 約3倍速く |
| 技術的正確性 | 100%維持 |
| 入力トークン削減 | CLAUDE.mdなどの設定ファイル圧縮時に約46%削減 |
| API コスト削減例 | 1日10,000回のAPI呼び出し基準で年間約$7,665節約(Claude Sonnet基準) |

### 2.3 圧縮強度レベル

cavemanは状況に応じて調整可能な4段階の強度レベルを提供する。

| レベル | 説明 | 例 |
|------|------|------|
| `lite` | 文法を維持、不要な修飾語を除去 | "Your component re-renders because you create a new object reference each render." |
| `full` | 冠詞・挨拶を除去、文を簡潔化 | "New object ref each render. Inline object prop = new ref = re-render." |
| `ultra` | 最大圧縮、専門用語は維持 | "Inline obj prop → new ref → re-render. useMemo." |
| `wenyan` | 古典中国語スタイル | "物出新參照，致重繪。useMemo Wrap之。" |

#### 実際の比較例

通常の応答:
```
I've successfully completed the refactoring of the authentication module.
The changes include updating the token validation logic to handle edge cases
more gracefully, adding appropriate error handling, and ensuring backwards
compatibility with the existing API contracts.
```

caveman `ultra`適用後:
```
Auth module refactored. Token validation, error handling, backward compat.
```

同じ情報を伝えながらトークンが約75%削減される。

### 2.4 追加ユーティリティコマンド

| コマンド | 機能 |
|--------|------|
| `/caveman-commit` | 50文字以内の簡潔なコミットメッセージを生成 |
| `/caveman-review` | 1行のPRコメントを作成 |
| `/caveman-stats` | リアルタイムのトークン統計とコストを表示 |
| `/caveman-compress` | CLAUDE.mdなどの設定ファイルを圧縮 |

### 2.5 インストールと使用法

**macOS / Linux / WSL**

```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
```

**Windows(PowerShell)**

```powershell
irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1 | iex
```

**Claude Codeで有効化**

```bash
# スキルを登録
claude skills add JuliusBrussee/caveman

# 基本有効化
/caveman

# 強度を指定して有効化
/caveman ultra

# 無効化
stop caveman
```

**CLAUDE.md / AGENTS.mdに直接挿入(システムプロンプト方式)**

```text
You are a code assistant. Respond in caveman speak only. No pleasantries.
No greetings, no sign-offs, no narration. Just the answer.
```

> サポートプラットフォーム:Claude Code、Codex、Gemini CLI、Cursor、Windsurf、Cline、GitHub Copilotなど34以上のAIコーディングツール

### 2.6 注意事項

cavemanは**出力トークン**にのみ効果がある。思考・推論(thinking/reasoning)トークンは影響を受けない。「Caveman no make brain smaller. Caveman make mouth smaller.」したがって、コード生成が主な作業である場合よりも、対話・ブレインストーミング・Q&Aのようにやり取りの多いセッションで効果が顕著になる。

---

## 3. rtk(Rust Token Killer)

### 3.1 背景

AIコーディングエージェントがテスト実行、リンティング、gitコマンドなどを実行する際に生成される大量のログとコンソール出力は、莫大な入力トークンを消費する。例えば`git status`一つだけで2,000トークンが発生し、`cargo test`を実行すると200行以上の出力がそのままコンテキストウィンドウに注入される。エージェントはそのすべての行を読む。

rtkはコマンド出力がLLMコンテキストに到達する前の段階でフィルタリングと圧縮を適用し、この問題を解決する。ワークフローの変更なしに透過的に動作する。

### 3.2 効果

| 項目 | 数値 |
|------|------|
| トークン削減率 | 60~90% |
| サポートコマンド | 100以上 |
| オーバーヘッド | 10ms未満 |
| 依存関係 | なし(単一Rustバイナリ) |
| GitHubスター | 42,000+(2026年6月) |
| ライセンス | Apache-2.0 |

### 3.3 核心的な圧縮戦略

rtkは4つの戦略で出力を圧縮する:

1. **Smart Filtering**:ANSIコード、プログレスバー、コメント、過度な空白、ボイラープレートを除去
2. **Group Aggregation**:似た項目をまとめる(ディレクター別ファイル、種類別エラーなど)
3. **Intelligent Truncation**:関連コンテキストを維持、重複を除去
4. **Deduplication**:繰り返される行をカウントに縮約

#### 圧縮前後の比較:`git status`

通常の出力(約2,000トークン):
```
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)

Changes not staged for commit:
  (use "git add <file>..." to update what will be staged)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/auth/token.ts

no changes added to commit (use "git add" and/or "git commit -a")
```

rtk適用後(約400トークン):
```
main...origin/main ~ Modified: 1 files src/auth/token.ts
```

LLMが必要とする情報(ブランチ、変更されたファイル)だけを残し、残りを除去する。

### 3.4 コマンド別削減効果(30分セッション基準)

| コマンド | 実行回数 | 通常トークン | rtk適用後 | 削減率 |
|--------|-----------|-----------|-----------|--------|
| `ls` / `tree` | 10回 | 2,000 | 400 | 80% |
| `cat` / `read` | 20回 | 40,000 | 12,000 | 70% |
| `grep` / `rg` | 8回 | 16,000 | 3,200 | 80% |
| `git status` | 10回 | 3,000 | 600 | 80% |
| `git diff` | 5回 | 10,000 | 2,500 | 75% |
| `git add/commit/push` | 8回 | 1,600 | 120 | 92% |
| `npm test` / `cargo test` | 5回 | 25,000 | 2,500 | 90% |
| `pytest` | 4回 | 8,000 | 800 | 90% |
| `go test` | 3回 | 6,000 | 600 | 90% |
| `docker ps` | 3回 | 900 | 180 | 80% |
| **合計** | — | **~118,000** | **~23,900** | **80%** |

### 3.5 インストールと使用法

**Homebrew(macOS、推奨)**

```bash
brew install rtk
```

**Linux / macOS直接インストール**

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh

# PATHに追加(zsh基準)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Cargoでインストール**

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

**Windows**:リリースページから`rtk-x86_64-pc-windows-msvc.zip`をダウンロード後、`rtk.exe`をPATHに登録。

**Claude Code連携(自動フッキング)**

```bash
# Claude CodeのPreToolUseフックを自動インストール
rtk init -g --claude-md

# インストール確認
rtk --version

# 動作テスト
rtk git status
```

`rtk init -g`実行時、`~/.claude/settings.json`に`PreToolUse`フックが自動追加され、すべてのBashコマンドがrtkを経由してルーティングされる。手動でコマンドの前に`rtk`を付ける必要はない。

**削減統計の確認**

```bash
# 累積削減統計とASCIIグラフを確認
rtk gain

# 日別JSON書き出し
rtk gain --json

# 見逃している削減機会を探索
rtk discover
```

**設定のカスタマイズ(`~/.config/rtk/config.toml`)**

```toml
[filters]
exclude_commands = ["echo", "pwd"]
tee_mode = true   # 失敗時に元の出力を復元

[project.myapp]
extra_filters = ["*.lock"]
```

### 3.6 注意事項

短いコマンドはrtkを経由してもトークンがむしろわずかに増加する可能性がある(rtkヘッダーのオーバーヘッド)。すでに構造化された短い出力はそのまま通過させる。`rtk gain`で実際の削減量を確認し、1週間後も10%以上の削減がない場合は`rtk init -g --uninstall`での削除を検討すること。

---

## 4. caveman + rtk統合最適化ガイド

### 4.1 統合コンセプト:入力+出力の双方向最適化

2つのツールは異なるレイヤーで動作するため、共に使用すると効果が最大化される。

```
[開発者コマンド]
     |
     v
[rtk CLIプロキシ]  <-- コマンド出力をフィルタリング/圧縮(60~90%削減)[入力最適化]
     |
     v
[LLMへ送信]   (入力トークン最適化完了)
     |
     v
[LLM処理]
     |
     v
[LLM応答]
     |
     v
[caveman変換]   <-- 応答を簡潔に変換(65~75%削減)[出力最適化]
     |
     v
[最終圧縮応答]

全体削減率:80~95%
```

| ツール | 役割 | 削減対象 |
|------|------|-----------|
| rtk | CLI出力をLLMに入れる前に圧縮 | 入力トークン |
| caveman | LLM応答を簡潔に変換 | 出力トークン |

### 4.2 統合設定方法

**ステップ1:cavemanのインストールとスキル登録**

```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
claude skills add JuliusBrussee/caveman
```

**ステップ2:rtkのインストールとClaude Code連携**

```bash
brew install rtk          # macOS
rtk init -g --claude-md   # Claude CodeのPreToolUseフックを自動インストール
```

**ステップ3:`~/.claude/settings.json`にセション開始フックを追加**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "command": "echo 'RTK proxy active. Caveman mode ready.'"
      }
    ]
  }
}
```

**ステップ4:シェルエイリアスの登録(任意、`~/.zshrc`または`~/.bashrc`)**

```bash
# rtkプロキシを自動適用
for cmd in git ls cat grep rg cargo npm pytest go docker kubectl; do
  alias $cmd="rtk $cmd"
done
```

**ステップ5:caveman設定ファイル(プロジェクトルートに`.caveman.config`を作成)**

```text
mode=ultra
exclude_files=Dockerfile,*.log
always_compress_tokens=true
```

### 4.3 応用:OmniRoute Stackedモード

OmniRoudeは複数のLLM最適化エンジンを統合パイプラインにまとめるツールである。caveman + rtkをStackedモードで連結すると、1つの設定で2つのツールが自動的に順序どおり動作する。

```json
{
  "compression": {
    "mode": "stacked",
    "pipeline": ["rtk", "caveman"],
    "caveman_intensity": "ultra",
    "rtk_filters_path": ".rtk/filters.json"
  }
}
```

### 4.4 削減効果まとめ

| 構成 | 削減率 | 削減対象 |
|------|--------|-----------|
| rtk単独 | 60~90% | コマンド出力(入力トークン) |
| caveman単独 | 65~75% | LLM応答(出力トークン) |
| rtk + caveman組み合わせ | **80~95%** | 入力+出力全体 |

### 4.5 実際の使用シナリオ別コマンド例

**シナリオ1:テスト失敗のデバッグ**

```bash
# rtkが失敗したテストのみを抽出し、cavemanが分析を簡潔に返す
rtk cargo test
# caveman応答例:"3 tests fail: auth::token_expired, db::conn_timeout, api::rate_limit. See logs."
```

**シナリオ2:コードレビューの依頼**

```bash
# rtkがdiffを圧縮し、cavemanがレビューを1行で返す
rtk git diff HEAD~1
/caveman-review
# 応答例:"Missing null check in token.ts:42. Add early return."
```

**シナリオ3:コミットメッセージの生成**

```bash
rtk git status
/caveman-commit
# 応答例:"fix: null check in token validation"
```

**シナリオ4:長いログの要約**

```bash
rtk grep "ERROR" app.log
# caveman ultra応答例:"14 errors: 11x DB timeout, 3x auth fail. Peak 14:30-15:00."
```

**シナリオ5:依存関係の点検**

```bash
rtk npm list --depth=0
# rtkが重複・不要な情報を除去し、核心的なパッケージリストのみを伝達
```

### 4.6 実利用者の経験

2つのツールを組み合わせた利用者は一貫した効果を報告している。30分のセッションで枯渇していたClaude Codeのコンテキストが3時間以上に延長され、反復的なCLI作業が多い環境(テスト駆動開発、大規模git履歴の探索など)で効果が特に顕著である。

---

## 5. コスト削減計算機(簡易推算)

Claude Sonnet基準(2026年初め時点、入力$3/百万トークン、出力$15/百万トークン):

| 条件 | 月間コスト(最適化前) | caveman適用後 | rtk適用後 | 両ツール組み合わせ |
|------|---------------------|-----------------|-------------|--------------|
| 個人開発者(小規模) | $50 | ~$17 | ~$15 | ~$5~10 |
| 10人チーム(中規模) | $2,500 | ~$800 | ~$500 | ~$125~250 |
| エンタープライズパイプライン | $10,000+ | ~$3,000 | ~$2,000 | ~$500~1,000 |

> 実際の削減額は作業種類、LLMモデル、使用パターンによって異なる。`rtk gain`と`/caveman-stats`で実測値を確認すること。

---

## 6. おわりに

cavemanとrtkはそれぞれ独自の方式でLLMコスト最適化にアプローチしている。cavemanは**出力最適化**、rtkは**入力最適化**に特化しており、2つのツールは完全に相互補完的である。

核心的な原則は単純だ。LLMのデフォルトはコスト効率ではなく**人間に親しみやすい応答**に最適化されている。cavemanは応答のスタイルを変え、rtkはコンテキストのノイズを除去する。この2つのツールを通じて、AIコーディングアシスタントをより安く、より速く、より集中した方法で活用できる。

---

## 7. 参考資料

| 項目 | リンク |
|------|------|
| caveman GitHub | https://github.com/JuliusBrussee/caveman |
| rtk GitHub | https://github.com/rtk-ai/rtk |
| rtk公式サイト | https://www.rtk-ai.app |
| arXiv論文(2604.00025) | https://arxiv.org/abs/2604.00025 |
| Claude Plugin Hub - caveman | https://www.claudepluginhub.com/plugins/juliusbrussee-caveman |

> GitHubスター数および数値データは2026年6月時点であり、プロジェクトは継続的に発展している。最新情報は各リポジトリの公式ドキュメントを参照すること。
