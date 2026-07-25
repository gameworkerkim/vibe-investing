---
title: "Claudeプロンプト最適化ツール はじめてガイド"
description: "Claudeの出力品質を高めるオープンソースのプロンプト最適化ツール5選。Fableの利用が制限されているため、Opus 4.8を必死に最適化する必要がある。"
lang: ja
featured: false
schema_type: TechArticle
keywords:
  - Claude プロンプト最適化
  - Claude Code フック
  - Claude Code スキル
  - Opus 4.8
  - プロンプトエンジニアリング
tags:
  - Claude
  - プロンプトエンジニアリング
  - Claude Code
  - Anthropic
---

# Claudeプロンプト最適化ツール はじめてガイド

> Claudeの出力品質を高めるオープンソースのプロンプト最適化ツール5選を紹介する。Fableの利用が制限されているため、代わりにOpus 4.8を必死に最適化する必要がある。
> 各プロジェクトの動作方式、使用例、長所・短所、インストールガイドをまとめた。この最適化スキルとフックを使えば効率が高まる。

---

## 0. 一覧比較

| プロジェクト | タイプ | 動作環境 | 中核メカニズム | 規模(★) | 推奨ユーザー |
|---|---|---|---|---|---|
| **CheswickDEV/claude-opus-4.8-prompt-optimizer** | メタオプティマイザー(system prompt) | すべてのClaudeインターフェース (claude.ai / API / Code) | `prompt:` トリガー → 11ルール + 10コンポーネントXML構造化 | 新規 | 一貫した高品質プロンプトを繰り返し生成したいユーザー |
| **johnpsasser/claude-code-prompt-optimizer** | フック | Claude Code | `<optimize>` タグを傍受 → extended thinkingで拡張 | 小規模 | Claude Codeでその場で特定プロンプトを拡張したい開発者 |
| **severity1/claude-code-prompt-improver** | フック + スキル(プラグイン) | Claude Code | 曖昧なプロンプトのみ選別 → リサーチと質問を注入 | ~1.4k | 修正の往復を減らしたいClaude Codeヘビーユーザー |
| **Hashaam101/prompt-optimizer** | スキル | Claude Code | auto(自動精製) / manual(`/optimize` テキスト出力)の二重モード | 小規模 | 自動・手動を選んで使いたいユーザー |
| **nidhinjs/prompt-master** | スキル | マルチツール(Claude・ChatGPT・Midjourneyなど) | ターゲットツール別プロンプト生成、メモリ保持 | 小規模 | 複数のAIツールを使い分けるユーザー |

**用語整理**

- **フック(Hook)**: Claude Codeがプロンプト送信など特定のタイミングで自動実行するスクリプト。ユーザーの入力を傍受して変換できる。
- **スキル(Skill)**: `~/.claude/skills/` に置く指示ファイル。条件が合致すればClaudeが自ら読み込み、動作に反映する。
- **メタオプティマイザー**: ツール自体がsystem promptとして動作し、入力プロンプトを「実行対象」ではなく「最適化対象」として受け取り、構造化された新しいプロンプトを返す。

---

## 1. CheswickDEV/claude-opus-4.8-prompt-optimizer

生のプロンプトをOpus 4.8アーキテクチャに合わせたproduction-ready XML構造プロンプトに変換するメタプロンプティングシステム。11個の最適化ルール、10コンポーネントフレームワーク、複雑度ベースのルーティング、そして必須の `prompt:` トリガーを備え、いずれもAnthropicの公式ドキュメントから導出されている。プロンプト集ではなく「最適化エンジン」であることが最大の差別化点。(MITライセンス)

### 動作方式(5ステップ)

1. **プロンプト分析** — 意図、複雑度、ドメイン、期待される出力、欠落要素を検出
2. **複雑度ルーティング** — simpleは3-4コンポーネント、moderateは5-7、complexはフル10コンポーネント
3. **ルール適用** — 11ルールのうち該当するサブセットのみ発火
4. **品質チェック** — タスクの明確性、XMLタグの妥当性、例の一貫性、矛盾する指示の有無を確認
5. **構造化出力** — 分析 + コピー可能な最適化プロンプト + 変更理由のメモを返す

### 使用例(Before / After)

**入力(raw)**

```
Write me a Python script that analyzes CSV files and finds anomalies
```

**出力(optimized、抜粋)**

```
<role>
You are a senior data engineer specializing in anomaly detection and
statistical analysis with Python.
</role>

<context>
CSV datasets come from production IoT sensors. Files range from
10K–5M rows with columns: timestamp, sensor_id, value, status.
</context>

<task>
1. Loads one or more CSV files
2. Detects statistical anomalies using z-score and IQR methods
3. Handles missing data gracefully
4. Outputs a summary report with flagged rows
</task>

<constraints>
- Use only pandas, numpy, scipy (no ML libraries)
- Handle files up to 5M rows efficiently
- Include type hints and docstrings
</constraints>

<output_format>
Single Python code block, followed by a usage example and sample output.
</output_format>
```

入力の先頭に `prompt:` を付けると、質問・指示・添付PDF・プロンプトインジェクションの試みが混在していても、それらを実行せず常に「最適化対象」としてのみ処理する。添付文書は `{{DOCUMENT}}` プレースホルダーに置換される。

```
prompt: Based on the attached PDF, explain the GDPR compliance risks and mitigation.
```

### 長所

- **すべてのClaudeインターフェースで動作** — Claude Code専用ではなく、system promptベースなのでclaude.ai Project・直接貼り付け・APIのどこでも使用可能
- **Opus 4.8専用チューニング** — effortデフォルト値`high`、per-turn adaptive thinking、改善されたtool triggering、1Mトークンcontextなどを反映し、メモに推奨effortまで明示
- **複雑度に比例したスケーリング** — 単純な質問に過度な10タグを被せない
- **再利用可能なテンプレート** — `{{VARIABLE}}` 形式で出力され、繰り返し作業にそのまま活用できる

### 短所

- **手動ワークフロー** — フック/スキルのような自動発火ではなく、ユーザー自身がsystem promptを設定してプロンプトを入れる必要がある
- **Opus 4.8依存** — 他モデル(サードパーティLLM、旧バージョンのClaude)には一部ルールが合わない可能性がある(model-agnosticではない)
- **新興リポジトリ** — スター数が少なく、コミュニティ検証・イシュートラッキングが薄い
- API使用時はOpus 4.8の制約(temperature/top_p/top_k未対応、assistant prefill未対応)をユーザー自身が把握する必要がある

### インストールガイド

リポジトリ構成: `README.md`、`CLAUDE.md`(エンジン本体)、`GUIDE.md`(使用パターン)、`QUICKSTART.md`、`LICENSE`

**オプションA — Claude Project(推奨)**

1. claude.aiで新規**Project**を作成
2. `CLAUDE.md` の内容を**Project Instructions**フィールドに貼り付け
3. `GUIDE.md` を**knowledge file**としてアップロード
4. 会話を開始 → rawプロンプトを入力

**オプションB — 直接貼り付け**

1. `CLAUDE.md` 全体をコピー
2. 任意のClaudeインターフェースの**system prompt**に貼り付け
3. rawプロンプトをuser messageとして送信

**オプションC — API連携**

```python
import anthropic

client = anthropic.Anthropic()

with open("CLAUDE.md", "r", encoding="utf-8") as f:
    system_prompt = f.read()

response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=8192,
    system=system_prompt,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},   # デフォルトhigh、難度が高ければxhigh/max
    messages=[
        {"role": "user", "content": "prompt: Your raw prompt here"}
    ],
)
print(response.content[0].text)
```

> API注意点: `temperature`/`top_p`/`top_k` 設定禁止(400エラー)、assistant prefill禁止、adaptive thinkingはデフォルトoffのため明示的に有効化が必要。

リポジトリ: `github.com/CheswickDEV/claude-opus-4.8-prompt-optimizer`

---

## 2. johnpsasser/claude-code-prompt-optimizer

Claude Code用フック。シンプルなプロンプトを詳細で構造化された指示に拡張する。プロンプトに `<optimize>` タグを付けるとフックが傍受し、Claudeのextended thinkingモードに回して、元のリクエストをアーキテクチャ・エンドポイント・エラー処理・認証・検証・テストまで包括する仕様に膨らませる。実質的にはプロンプトエンジニアリングを代行しているといえる。

### 使用例

```
<optimize> build me a REST API for a todo app
```

→ フックがこれを傍受し、architecture、endpoints、error handling、auth、validation、testingを網羅した構造化スペックに拡張する。パフォーマンス関連のリクエストであれば、profilingステップ、ボトルネック特定、優先順位付けされたrefactoringターゲット、ベンチマーク基準を含む計画に拡張される。

### 長所

- **タグベースの明示的発火** — `<optimize>` を付けたプロンプトのみ拡張するため、意図しない介入がない
- **extended thinkingの活用** — 単純なrewriteではなく、推論を経た仕様拡張
- **チューニングが容易** — model、fallback model、timeout、system promptが `optimizer.config.json` / `system-prompt.md` に分離されており、TypeScriptを修正せずに調整可能。デバッグログは `/tmp/claude-code-hook-debug.log`

### 短所

- **Claude Code専用** — claude.aiのウェブ/アプリでは使用不可
- **認証設定が複雑** — OAuthトークン/APIキーの優先順位解析ロジックがあり、初期セットアップ時に環境変数の理解が必要
- **Node依存** — npmベースのインストール、別途Agent SDK認証構成が必要

### インストールガイド

```bash
git clone https://github.com/johnpsasser/claude-code-prompt-optimizer.git
cd claude-code-prompt-optimizer
npm run install-hook
```

インストーラーが依存関係、認証セットアップ、フック設定、検証まで処理する。認証トークンは以下のように発行・登録する。

```bash
claude auth token
export CLAUDE_CODE_OAUTH_TOKEN="your-oauth-token"   # シェルプロファイルに追加
```

手動でフックを登録する場合は `~/.claude/settings.json`(またはプロジェクト設定)に `UserPromptSubmit` フックとして `src/hooks/optimize-prompt.sh` のパスを指定する。

リポジトリ: `github.com/johnpsasser/claude-code-prompt-optimizer`

---

## 3. severity1/claude-code-prompt-improver

「Type vibes, ship precision.」Claude Code用の知的なプロンプト改善プラグイン(フック + スキル)。すべてのプロンプトを無条件に整えるのではなく、**明確なプロンプトはそのまま通過させ、曖昧なプロンプトだけを選別**してリサーチと質問を経由させる。プロンプト送信・ツール使用・サブエージェント起動のタイミングで即時コンテキストを注入し、「最初の出力」の品質を高めることが目標であり、修正の往復回数を減らしてトークンと時間を節約する。

### 動作方式

1. フックがプロンプトを受け取り、約189トークンの評価プロンプトで明確性を判定
2. **曖昧** → prompt-improverスキルが発火 → リサーチ計画(TodoWrite) → ExploreサブエージェントによるGlob/Grep/Web/multi-file Read → 結果を統合 → 根拠に基づく質問(1〜6個)をユーザーに提示 → 回答を反映して元のリクエストを実行
3. **明確** → スキル読み込みなしで即実行

設計原則:「fire wide, self-cancel cheap」— 見逃したnudgeは修正の一往復を無駄にするが、誤って発火したnudgeは無視される程度の数トークンしか消費しないため、高recallゲートを使いつつ各nudgeが合わなければ自己キャンセルする。

### 使用例

```
fix the bug
```

→ 曖昧と判定 → コードベースをリサーチし、「どのファイル/どの症状/どの再現条件か」といった根拠のある質問1〜6個を提示 → 回答を受けて実際の修正を実施。一方、十分に具体的なプロンプトは介入なしでそのまま実行される。

### 長所

- **選別的介入** — 大半のプロンプトは変形なしで通過し、必要な時のみ発火してオーバーヘッドを最小化
- **最初の出力の品質最適化** — 単語のrewriteを超えて「プロンプト → 出力」経路全体を改善(質問 + コンテキスト注入)
- **透明性** — 注入されたコンテキストが会話上に露出する
- **検証済みの規模** — 約1.4kスターでコミュニティの採用・保守が活発

### 短所

- **Claude Code専用** — ウェブ/アプリ未対応
- **介入時に追加ターンが発生** — 曖昧判定時に質問ステップが挟まり、即答を望むフローと衝突する可能性がある
- **設定の学習曲線** — plugin/hook/skill/nudge registry構造の理解が必要

### インストールガイド

`.claude-plugin` 構造のClaude Codeプラグインなので、プラグインマーケットプレイス方式でインストールする。(正確なコマンドはリポジトリの最新READMEを確認推奨)

```
# Claude Code内で
/plugin marketplace add severity1/claude-code-prompt-improver
/plugin install prompt-improver
```

または手動インストールの場合はリポジトリをcloneして `hooks/`・`skills/prompt-improver/` を `~/.claude/` 以下に配置し、settingsにフックを登録する。

リポジトリ: `github.com/severity1/claude-code-prompt-improver`

---

## 4. Hashaam101/prompt-optimizer

Claude Codeスキル。2つのモードを提供する。**autoモード**はインストール後すべてのプロンプトを静かに(silent)精製してより良い結果を導き、**manualモード**は `/optimize {prompt}` で精製されたプロンプトを実行する代わりにテキストとして表示する — プロンプトを再利用したり、より良い書き方を学ぶのに有用。

### 使用例

```
# manual: 精製結果をテキストで確認
/optimize 四半期の売上データを分析して

# またはプレフィックス方式
optimize: 四半期の売上データを分析して
optimize prompt: 四半期の売上データを分析して
```

インストールだけしておけば、autoモード(Mode 1)が毎プロンプトごとに自動有効化され、別途スラッシュコマンドなしでも精製が適用される。

### 長所

- **二重モード** — 通常は自動精製、必要時は `/optimize` で精製文のみ抽出して再利用・学習
- **インストールが簡単** — SKILL.mdファイル1つのコピーで完了
- **silent動作** — autoモードはワークフローを妨げない

### 短所

- **Claude Code専用**
- **autoモードの不透明性** — 自動精製が静かに行われるため、何が変わったのか追跡しにくい場合がある(manualモードで補完)
- **小規模リポジトリ** — コミュニティ検証が薄い

### インストールガイド

グローバル(全プロジェクト)またはプロジェクト単位で `SKILL.md` をコピーする。

```bash
# グローバルインストール (Linux/macOS)
cp SKILL.md ~/.claude/skills/prompt-optimizer.md

# プロジェクト単位 (Linux/macOS)
cp SKILL.md .claude/skills/prompt-optimizer.md
```

```powershell
# Windows (PowerShell) — グローバル
Copy-Item SKILL.md "$env:USERPROFILE\.claude\skills\prompt-optimizer.md"
```

インストール後自動有効化。`/optimize` でmanualモードを呼び出す。

リポジトリ: `github.com/Hashaam101/prompt-optimizer`

---

## 5. nidhinjs/prompt-master

「すべてのAIツールのために正確なプロンプトを書くClaudeスキル。」一度で正確なプロンプトを作り、再プロンプトによるトークン・クレジットの浪費をなくすことを目標とする。Claude・ChatGPT・Gemini・o1/o3・Cursor・Claude Code・GitHub Copilot・Windsurf・Bolt・v0・Lovable・Perplexity・Midjourney・DALL-E・Stable Diffusion・ComfyUI・Sora・Runway・ElevenLabs・Zapier・Makeなど、ターゲットツール別に最適なプロンプトを生成する。

設計思想:「最高のプロンプトは最も長いものではなく、すべての単語がload-bearing(荷を負う)であるもの。」長いセッションで最大の無駄は「AIが以前決めた内容を忘れること」だと捉え、メモリブロックで決定事項を保持する。

### 使用例

```
Build a claude code prompt for a landing page for a business dashboard
that looks and feels exactly like notion - smooth animations, clean ui
```

→ ターゲット(Claude Code)、framework、トークン推定、戦略をルーティングした後、production-quality仕様として出力。Midjourneyをターゲットにすると、comma-separated descriptor、lighting/moodアンカリング、aspect ratio・versionの固定、negative promptといった画像ツール特化の形式で生成される。

### 長所

- **マルチツールルーティング** — Claude以外のChatGPT・Midjourney・コーディングエージェントなど、ツール別最適形式を自動適用
- **メモリ保持** — セッション内の決定事項を記憶し、再プロンプトの浪費を削減
- **活発な更新** — Opus 4.8互換(v1.7.0)、バージョン認識ルーティング(4.6/4.7/4.8)、Prompt Decompilerモードなど継続的に更新

### 短所

- **Claudeを「プロンプト生成器」として使用** — Claude自体の出力を直接改善するというより、他ツールに入れるプロンプトを作る性格が強い
- **Claude Codeスキル環境が必要** — スキル環境が前提
- **小規模リポジトリ** — コミュニティ検証が薄い

### インストールガイド

```bash
mkdir -p ~/.claude/skills
git clone https://github.com/nidhinjs/prompt-master.git ~/.claude/skills/prompt-master
```

インストール後、トリガー条件に合致するとスキルが自動発火。referencesフォルダのテンプレートがターゲットツール別の出力を補助する。

リポジトリ: `github.com/nidhinjs/prompt-master`

---

## 6. 選択ガイド

| 状況 | 推奨 |
|---|---|
| claude.aiのウェブ/アプリまたはAPIで構造化プロンプトを繰り返し生成 | **CheswickDEV 4.8**(Projectとして登録) |
| Claude Codeでその場で特定プロンプトだけを選んで拡張 | **johnpsasser**(`<optimize>` タグ) |
| Claude Codeヘビーユーザーで、修正往復を減らし最初の出力品質を高めたい | **severity1**(選別的介入) |
| Claude Codeで自動精製と手動精製文抽出を併用したい | **Hashaam101**(二重モード) |
| Claude以外のChatGPT・Midjourney・コーディングエージェント用プロンプトを一箇所で生成 | **nidhinjs**(マルチツール) |
| よく作られたプロンプトの「例」を参考にしたい(ツールではない) | `langgptai/awesome-claude-prompts` などのキュレーション集 |

**組み合わせのヒント**: 環境がClaude Codeであれば、選別介入型(severity1)を常時導入し、別途正式なプロンプト資産を作る際にCheswickDEV 4.8をclaude.ai Projectとして運用する併用が効果的。繰り返し出力の一貫性が重要なワークフロー(定型レポート、定量分析プロンプトなど)であれば、プロンプト集よりオプティマイザーのコンポーネントフレームワークや自作テンプレートをreferenceとして登録する方が安定する。

---

## 7. 共通の注意点

- **モデル依存性の確認** — Opus 4.8専用にチューニングされたツール(CheswickDEVなど)は他モデルで一部ルールが合わない可能性がある。
- **自動発火型の不透明性** — autoモード/silentフックは何が変わったのか追跡しにくいため、可能であれば変更内容を露出するmanualモードや透明性オプションを併用する。
- **認証・トークン管理** — フック系はOAuthトークン/APIキーを扱うため、環境変数やシェルプロファイルへの露出に注意する。
- **リポジトリの信頼度** — スター・コミット・イシュー活動を確認し、インストールコマンドは常に各リポジトリの最新READMEと照合する。本文書のコマンドは執筆時点のものである。
- **公式ガイドとの併用** — ツールだけに依存せず、Anthropic公式のprompt engineeringドキュメント(`docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview`)も併せて参照すると、ツールの出力をより良く検証できる。

---

*作成基準日: 2026-06-21。各プロジェクトの機能・インストール方法は更新される可能性があるため、リポジトリの最新READMEを確認すること。*
