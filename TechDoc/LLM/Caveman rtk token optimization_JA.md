---
title: "caveman + rtk — AIコーディングアシスタント トークン最適化完全ガイド"
description: "cavemanとrtkという2つのオープンソースプロジェクトを組み合わせ、AIコーディングアシスタントのトークン使用量を最大80〜95%削減する方法"
lang: ja
featured: false
schema_type: TechArticle
keywords:
  - caveman
  - rtk
  - トークン最適化
  - Claude Code
  - LLM コスト削減
tags:
  - LLM
  - Claude Code
  - コスト最適化
  - CLIツール
---

# caveman + rtk — AIコーディングアシスタント トークン最適化完全ガイド

> "Why use many token when few token do trick?" — cavemanのスローガン

---

## 1. 概要

AIコーディングアシスタントの利用が普及するにつれ、API費用とコンテキストトークンの消耗は開発者にとってますます大きな負担となっている。こうした背景の中、2つの革新的なオープンソースプロジェクトが登場した。

**caveman**は「多くのトークンを使う理由があるのか、少ないトークンで解決できるのに」という発想から出発した。AIが不要な言い回しなしで核心だけを伝えるよう誘導し、技術的な正確性を100%維持しながら出力トークンを約65〜75%削減する。2026年4月のリリース以降、短期間でGitHubスター71,000個以上(2026年6月基準)を獲得し、大きな注目を集めた。

rtk(Rust Token Killer)はCLIコマンドの出力をリアルタイムでフィルタリング・圧縮するプロキシツールで、LLMのコンテキストに到達する前に入力トークン使用量を60〜90%削減する。単一のRustバイナリで製作され依存関係がなく、10ミリ秒未満のオーバーヘッドしか発生させず、GitHubスター42,000個以上を保有している。

両ツールは異なるレイヤー(入力/出力)を担当するため、併用時にシナジーが最大化される。

---

## 2. caveman

### 2.1 背景

cavemanはAIの過度な話法と不要な言い回しがコストと効率性に及ぼす影響を批判的に見つめて生まれた。2026年3月にarXivで発表された論文("Brevity Constraints Reverse Performance Hierarchies in Language Models"、番号2604.00025)は、AIが短く簡潔に答えるほど特定のベンチマークで精度がむしろ26ポイント向上する可能性を証明した。cavemanはこの学術的発見を実用的なツールとして実装したものである。

Claudeは基本的に親切で長々と応答するよう訓練されている。これは一般的な会話では長所だが、自動化された開発パイプラインでは高コストの非効率である。cavemanはこのデフォルトを変え、コード・URL・ファイルパスなどの技術的情報はbyte-perfectに維持しながら自然言語の包装だけを取り除く。

### 2.2 効果

| 項目 | 効果 |
|------|------|
| 出力トークン削減 | 平均65〜75%(範囲22〜87%) |
| 応答速度向上 | 約3倍高速化 |
| 技術的精度 | 100%維持 |
| 入力トークン削減 | CLAUDE.mdなどの設定ファイル圧縮時約46%削減 |
| API費用削減例 | 1日10,000回のAPI呼び出し基準で年間約$7,665節約(Claude Sonnet基準) |

### 2.3 圧縮強度レベル

cavemanは状況に応じて調整できる4段階の強度レベルを提供する。

| レベル | 説明 | 例 |
|------|------|------|
| `lite` | 文法を維持、不要な修飾語を除去 | "Your component re-renders because you create a new object reference each render." |
| `full` | 冠詞・挨拶を除去、文章を簡潔化 | "New object ref each render. Inline object prop = new ref = re-render." |
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

同じ情報を伝えながらトークンが約75%減少する。

### 2.4 追加ユーティリティコマンド

| コマンド | 機能 |
|--------|------|
| `/caveman-commit` | 50文字以内の簡潔なコミットメッセージ生成 |
| `/caveman-review` | 一行のPRコメント作成 |
| `/caveman-stats` | リアルタイムトークン統計と費用表示 |
| `/caveman-compress` | CLAUDE.mdなどの設定ファイル圧縮 |

### 2.5 インストールと使用法

**macOS / Linux / WSL**

```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
```

**Windows(PowerShell)**

```powershell
irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1 | iex
```

**Claude Codeでの有効化**

```bash
# スキル登録
claude skills add JuliusBrussee/caveman

# 基本有効化
/caveman

# 強度指定有効化
/caveman ultra

# 無効化
stop caveman
```

**CLAUDE.md / AGENTS.mdへの直接挿入(system prompt方式)**

```text
You are a code assistant. Respond in caveman speak only. No pleasantries.
No greetings, no sign-offs, no narration. Just the answer.
```

> サポートプラットフォーム: Claude Code、Codex、Gemini CLI、Cursor、Windsurf、Cline、GitHub Copilotなど34以上のAIコーディングツール

### 2.6 注意事項

cavemanは**出力トークン**にのみ効果がある。思考・推論(thinking/reasoning)トークンは影響を受けない。「Caveman no make brain smaller. Caveman make mouth smaller.」したがって、コード生成が主な作業である場合よりも、会話・ブレインストーミング・Q&Aのように対話の往来が多いセッションで効果が際立つ。

---

## 3. rtk(Rust Token Killer)

### 3.1 背景

AIコーディングエージェントがテスト実行、リンティング、gitコマンドなどを実行する際に生成される大量のログとコンソール出力は膨大な入力トークンを消費する。例えば`git status`一つだけでも2,000トークンが発生し、`cargo test`を実行すると200行以上の出力がそのままコンテキストウィンドウに注入される。エージェントはそのすべての行を読む。

rtkはコマンド出力がLLMのコンテキストに到達する前の段階でフィルタリングと圧縮を適用してこの問題を解決する。ワークフローの変更なしに透過的に動作する。

### 3.2 効果

| 項目 | 数値 |
|------|------|
| トークン削減率 | 60〜90% |
| サポートコマンド | 100以上 |
| オーバーヘッド | 10ミリ秒未満 |
| 依存関係 | なし(単一Rustバイナリ) |
| GitHubスター | 42,000+(2026年6月) |
| ライセンス | Apache-2.0 |

### 3.3 中核圧縮戦略

rtkは4つの戦略で出力を圧縮する:

1. **Smart Filtering**: ANSIコード、プログレスバー、コメント、過度な空白、ボイラープレートを除去
2. **Group Aggregation**: 似た項目をまとめる(ディレクトリ別ファイル、種類別エラーなど)
3. **Intelligent Truncation**: 関連コンテキストを維持、重複を除去
4. **Deduplication**: 繰り返される行をカウントに縮約

#### 圧縮前後の比較: `git status`

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

LLMが必要とする情報(ブランチ、変更ファイル)だけを残し、残りを除去する。

### 3.4 コマンド別削減効果(30分セッション基準)

| コマンド | 実行回数 | 通常トークン | rtk適用 | 削減率 |
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

**Windows**: リリースページから`rtk-x86_64-pc-windows-msvc.zip`をダウンロード後、`rtk.exe`をPATHに登録。

**Claude Code連携(自動フッキング)**

```bash
# Claude CodeのPreToolUseフック自動インストール
rtk init -g --claude-md

# インストール確認
rtk --version

# 動作テスト
rtk git status
```

`rtk init -g`実行時に`~/.claude/settings.json`に`PreToolUse`フックが自動追加され、すべてのBashコマンドがrtkを経由してルーティングされる。手動でコマンドの前に`rtk`を付ける必要はない。

**削減統計の確認**

```bash
# 累積削減統計とASCIIグラフの確認
rtk gain

# 日付別JSON書き出し
rtk gain --json

# 見逃した削減機会の探索
rtk discover
```

**設定カスタマイズ(`~/.config/rtk/config.toml`)**

```toml
[filters]
exclude_commands = ["echo", "pwd"]
tee_mode = true   # 失敗時に元の出力を復元

[project.myapp]
extra_filters = ["*.lock"]
```

### 3.6 注意事項

短いコマンドはrtkを経てもトークンがむしろ少し増加する可能性がある(rtkヘッダーのオーバーヘッド)。既に構造化された短い出力はそのまま通過させる。`rtk gain`で実際の削減量を確認し、1週間後も10%以上の削減がなければ`rtk init -g --uninstall`での削除を検討すること。

---

## 4. caveman + rtk 統合最適化ガイド

### 4.1 統合コンセプト: 入力+出力の両方向最適化

両ツールは異なるレイヤーで動作するため、併用時に効果が最大化される。

```
[開発者コマンド]
     |
     v
[rtk CLI Proxy]  <-- コマンド出力のフィルタリング/圧縮(60〜90%削減)[入力最適化]
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
[caveman変換]   <-- 応答を簡潔に変換(65〜75%削減)[出力最適化]
     |
     v
[最終圧縮応答]

全体削減率: 80〜95%
```

| ツール | 役割 | 削減対象 |
|------|------|-----------|
| rtk | CLI出力をLLMに入れる前に圧縮 | 入力トークン |
| caveman | LLM応答を簡潔に変換 | 出力トークン |

### 4.2 統合設定方法

**Step 1: cavemanインストールとスキル登録**

```bash
curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash
claude skills add JuliusBrussee/caveman
```

**Step 2: rtkインストールとClaude Code連携**

```bash
brew install rtk          # macOS
rtk init -g --claude-md   # Claude Code PreToolUseフック自動インストール
```

**Step 3: `~/.claude/settings.json`にセッション開始フックを追加**

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

**Step 4: シェルエイリアス登録(任意、`~/.zshrc`または`~/.bashrc`)**

```bash
# rtkプロキシ自動適用
for cmd in git ls cat grep rg cargo npm pytest go docker kubectl; do
  alias $cmd="rtk $cmd"
done
```

**Step 5: caveman設定ファイル(プロジェクトルートに`.caveman.config`作成)**

```text
mode=ultra
exclude_files=Dockerfile,*.log
always_compress_tokens=true
```

### 4.3 応用: OmniRoute Stackedモード

OmniRouteは複数のLLM最適化エンジンを統合パイプラインにまとめるツールである。caveman + rtkをStackedモードで連結すると、設定一つで両ツールが自動的に順番に動作する。

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
| rtk単独 | 60〜90% | コマンド出力(入力トークン) |
| caveman単独 | 65〜75% | LLM応答(出力トークン) |
| rtk + caveman併用 | **80〜95%** | 入力+出力全体 |

### 4.5 実際の使用シナリオ別コマンド例

**シナリオ1: テスト失敗のデバッグ**

```bash
# rtkが失敗したテストのみ抽出し、cavemanが分析を簡潔に返す
rtk cargo test
# caveman応答例: "3 tests fail: auth::token_expired, db::conn_timeout, api::rate_limit. See logs."
```

**シナリオ2: コードレビュー依頼**

```bash
# rtkがdiffを圧縮し、cavemanがレビューを一行で返す
rtk git diff HEAD~1
/caveman-review
# 応答例: "Missing null check in token.ts:42. Add early return."
```

**シナリオ3: コミットメッセージ生成**

```bash
rtk git status
/caveman-commit
# 応答例: "fix: null check in token validation"
```

**シナリオ4: 長いログの要約**

```bash
rtk grep "ERROR" app.log
# caveman ultra応答例: "14 errors: 11x DB timeout, 3x auth fail. Peak 14:30-15:00."
```

**シナリオ5: 依存関係の点検**

```bash
rtk npm list --depth=0
# rtkが重複・不要な情報を除去し、核心パッケージリストのみ伝達
```

### 4.6 実使用者の経験

両ツールを組み合わせたユーザーは一貫した効果を報告している。30分セッションで消耗していたClaude Codeのコンテキストが3時間以上に延長され、繰り返しCLI作業が多い環境(テスト駆動開発、大規模gitヒストリー探索など)で効果が特に際立つ。

---

## 5. 費用削減計算機(簡易推算)

Claude Sonnet基準(2026年初頭基準、入力$3/百万トークン、出力$15/百万トークン):

| 条件 | 月額費用(最適化前) | caveman適用後 | rtk適用後 | 両ツール併用 |
|------|---------------------|-----------------|-------------|--------------|
| 個人開発者(小規模) | $50 | ~$17 | ~$15 | ~$5〜10 |
| チーム10人(中規模) | $2,500 | ~$800 | ~$500 | ~$125〜250 |
| エンタープライズパイプライン | $10,000+ | ~$3,000 | ~$2,000 | ~$500〜1,000 |

> 実際の削減額は作業タイプ、LLMモデル、使用パターンによって異なる。`rtk gain`と`/caveman-stats`で実測値を確認すること。

---

## 6. おわりに

cavemanとrtkはそれぞれ独特な方式でLLM費用最適化にアプローチしている。cavemanは**出力最適化**、rtkは**入力最適化**に特化しており、両ツールが完璧に相互補完的である。

中核原則は単純である。LLMのデフォルトはコスト効率ではなく**人間に親切な応答**に最適化されている。cavemanは応答スタイルを変え、rtkはコンテキストノイズを除去する。両ツールを通じてAIコーディングアシスタントをより安く、より速く、より集中した方式で活用できる。

---

## 7. 参考資料

| 項目 | リンク |
|------|------|
| caveman GitHub | https://github.com/JuliusBrussee/caveman |
| rtk GitHub | https://github.com/rtk-ai/rtk |
| rtk公式サイト | https://www.rtk-ai.app |
| arXiv論文(2604.00025) | https://arxiv.org/abs/2604.00025 |
| Claude Plugin Hub - caveman | https://www.claudepluginhub.com/plugins/juliusbrussee-caveman |

> GitHubスター数および数値データは2026年6月基準であり、プロジェクトは継続的に発展している。最新情報は各リポジトリの公式ドキュメントを参照すること。
