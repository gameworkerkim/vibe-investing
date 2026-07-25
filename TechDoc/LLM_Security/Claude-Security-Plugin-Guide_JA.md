# Claude Security Plugin — 技术分析与入门指南

## Claude Security プラグイン — 技術分析とスタートガイド

> 本ドキュメントは Claude Security Plugin (`claude-security` Beta v0.10.0 および `security-guidance` GA) の技術分析、検証パイプライン、導入ガイド、競合比較をカバーします。

---

## 0. 最初に区別すべき2つのプラグイン

"Claude セキュリティプラグイン"という名称の下に、性質のまったく異なる2つの製品が存在する。

| | `security-guidance` | `claude-security` |
|:---|:---|:---|
| 定義 | Claude が**コードを書く間**に自身の変更をレビュー | リポジトリ全体の**オンデマンドディープスキャン**を行うマルチエージェント監査 |
| トリガー | 自動（呼び出しコマンド不要） | 手動 `/claude-security` |
| 状態 | GA（一般提供） | Beta（2026-07-22 公開） |
| プラン | 全プラン（無料含む） | **有料プラン必須** |
| 最小CLI | v2.1.144+ | v2.1.154+ (dynamic workflows) |
| 出力 | セッション内対話型指摘 → 即時修正 | タイムスタンプ付きレポートディレクトリ + `.patch` ファイル |
| 性質 | 予防的ガードレール (shift-left) | 監査用スキャナー（SASTの補完、代替ではない） |

以降、本ドキュメントで「Claude Security プラグイン」は後者 (`claude-security`) を指す。

---

## 1. コンセプト

### 1.1 設計前提

従来のSASTはルールベースのパターンマッチング。既知パターンは捕捉するが、(a) 誤検知率が高く、(b) 複数ファイルにまたがる論理欠陥・認証バイパスなど文脈が必要な脆弱性を逃す。Claude Security はこのギャップを**「熟練したセキュリティ研究者の推論プロセスをエージェントチームで再現する」**アプローチで狙う。

| コンセプト | 実装 | 意味 |
|:---|:---|:---|
| **Reasoning over pattern** | LLM エージェントがコードを読み推論。正規表現・ルールセットは一次エンジンではない | 新規・論理型脆弱性の検出が可能、ただし非決定的 |
| **Adversarial verification** | 候補発見ごとに3名検証パネル投票（2/3定足数） | 誤検知抑制をアーキテクチャに内蔵 |
| **Locality (BYO inference)** | スキャンがユーザーセッション・権限でローカル実行 | コードが環境外に出ない。GitLab・Bitbucket・閉域網対応 |
| **Human-in-the-loop** | パッチは絶対に自動適用されない | 承認ポイントを除去せず、承認材料の品質のみ引き上げ |

### 1.2 Defense-in-Depth スタック内の位置

| 段階 | ツール | カバレッジ |
|:---|:---|:---|
| セッション中 | `security-guidance` プラグイン | Claude が書いたコードの一般的脆弱性 |
| オンデマンド単一パス | `/security-review` | 現在のブランチ1回レビュー |
| **オンデマンドディープスキャン** | **`claude-security` プラグイン** | **リポジトリ・diff マルチエージェントスキャン** |
| PR時 | Code Review (Team/Enterprise) | コードベース全体の文脈整合性レビュー |
| マネージド | Claude Security 製品 (Enterprise) | 常時モニタリング |
| CI | 既存 SAST・依存関係スキャナー | 言語別ルール、サプライチェーン |

---

## 2. 機能詳細

### 2.1 提供コマンドと3操作

| 操作 | 対象 | 備考 |
|:---|:---|:---|
| **Scan codebase** | リポジトリ全体またはスコープ限定サブセット | バージョン管理なしのディレクトリでも動作 |
| **Scan changes** | ブランチdiff, PR diff, 単一コミット | Git必須。**コミット済み変更のみ**対象 |
| **Suggest patches** | レポートの選択された発見 | `.patch` ファイル生成。自動適用なし |

### 2.2 スキャンパイプライン: 6フェーズ

| # | フェーズ | 内容 |
|:---|:---|:---|
| 1 | **Inventory** | リポジトリをコンポーネントに分割 |
| 2 | **Threat model** | コンポーネントごとにモデラー1名 |
| 3 | **Research** | (コンポーネント × カテゴリ) セルごとにリサーチャー |
| 4 | **Sweep** | マトリックスがカバーしなかった領域のギャップフィル |
| 5 | **Panel** | 3レンズ敵対的検証 |
| 6 | **Adversarial** | max effort 専用。境界線判定の再審、生存発見のレッドチーム |

リサーチカテゴリ4種: `injection-and-input`, `auth-and-access`, `memory-and-unsafe`, `crypto-and-secrets`

### 2.3 Effort Tier

| Tier | 最大コンポーネント | セルあたりリサーチャー | Sweep | Adversarial |
|:---|:---|:---|:---|:---|
| low | 12 | 1 | 0 | 未実行 |
| medium | 12 | 1 | 1 | 未実行 |
| high | 24 | 2 | 2 | 未実行 |
| max | 24 | 2 | 2 | 実行 |

### 2.4 モデル階層

| 役割 | モデル | ツール権限 |
|:---|:---|:---|
| オーケストレーター | Opus | — |
| リポジトリカートグラファー | Sonnet | 読み取り専用 |
| リサーチャー、検証者 | セッションモデル継承 | 読み取り専用 |

### 2.5 検証パネル — 本製品の中核

| 要素 | ルール |
|:---|:---|
| 投票者 | 3名、レンズごと1名: `REACHABILITY` / `IMPACT` / `DEFENSES` |
| 判定形式 | `TRUE_POSITIVE` または `FALSE_POSITIVE` + 決定的 `file:line` |
| 維持定足数 | 3票中2票 |
| 信頼度上限 | 満場一致 3/3 → `high` / 2/3 → `medium` キャップ |
| 集計主体 | **レポートレンダラーのPythonコードが計算** |
| 検証スタンプ | 全発見の投票記録がパネル実行を証明する場合のみ `verified` |

### 2.6 出力物

| ファイル | 内容 |
|:---|:---|
| `CLAUDE-SECURITY-RESULTS.md` | 人間可読レポート。発見ID, severity, confidence, CWE, 正確なシンクライン |
| `CLAUDE-SECURITY-RESULTS.jsonl` | 機械可読形式。1行1JSONオブジェクト |
| `CLAUDE-SECURITY-REVISION-<commit>.json` | リビジョンスタンプ |

### 2.7 パッチ生成 — 3つの主張要件

1. その変更が**単一**の発見を解決する
2. 新たな脆弱性を導入しない
3. その他の動作は不変 — コードが受け入れる入力集合の変化は動作変更とみなす

セキュリティを弱体化させる「修正」は**自動拒否**される。

---

## 3. 長所

| # | 長所 | 根拠 |
|:---|:---|:---|
| 1 | 文脈依存脆弱性の検出 | ファイル間データフロー追跡、複合論理欠陥 |
| 2 | 検証可能な誤検知抑制 | 3レンズパネル + 2/3定足数 + 信頼度キャップ |
| 3 | レポート完全性のコードベース証明 | 投票集計をPythonコードが計算、リビジョンスタンプに刻印 |
| 4 | コードが環境外に出ない | セッション内ローカル実行 |
| 5 | 追加ベンダー・契約不要 | 既存のClaudeアクセス権とトークン予算で実行 |
| 6 | 機械可読出力 | JSONL → チケット・SIEM・ダッシュボード連携 |
| 7 | パッチの安全ゲート | スクラッチクローン + 独立検証 + 自動適用禁止 |
| 8 | 範囲調整可能 | effort tier + コンポーネントスコープ指定 |
| 9 | ワークフロー離脱なし | ターミナルセッション内で一貫 |

---

## 4. 短所とリスク

| # | 短所 | 詳細 | 緩和策 |
|:---|:---|:---|:---|
| 1 | 非決定性 | 同一コード2回スキャンで異なる発見の可能性 | 定期スキャン + リリースゲート単独根拠にしない |
| 2 | 再現性欠如 | 監査フレームワークに直接対応不可 | 決定論的SASTを並行維持 |
| 3 | 隔離なし | 敵対的リポジトリへの防御策ではない | 信頼できないコードは sandbox-runtime/VMで |
| 4 | トークンコスト | ディープスキャンは大量トークン消費 | 領域分割、effort tier 下方調整 |
| 5 | セッション占有 | 完了までClaude Codeを開き続ける必要 | 別セッション・マシン分離 |
| 6 | 未コミット変更制約 | 変更スキャンはコミット済み変更のみ | 事前コミットまたはstash |
| 7 | カバレッジ不透明性 | 除外されたものを人間が読む必要 | 除外理由レビューを手順化 |
| 8 | 依存・サプライチェーン未対応 | SCA, ライセンス, コンテナ, IaC, DAST 対象外 | 既存SCA・シークレットスキャナー維持 |
| 9 | 有料プラン依存 | 有料プラン + dynamic workflows 必須 | 事前環境標準化 |
| 10 | Beta | スキーマ変更リスク | JSONLパーサーにバージョン防御コード |

---

## 5. 姉妹製品: `security-guidance`

**全プラン無料**。「Claude が作った脆弱性を Claude が同じセッションで捕捉する」予防レイヤー。

### 5.1 3階層レビュー

| 階層 | タイミング | 方式 | コスト |
|:---|:---|:---|:---|
| Per-edit | Edit/Write/NotebookEdit直後 | 正規表現・部分文字列決定論的マッチング、**モデル呼び出しなし** | 0 |
| End-of-turn | ターン終了時 | 作業ツリー git diff を別Claudeレビューへ | ターンあたり約1呼び出し |
| Commit/Push | ClaudeがBash経由で `git commit`/`git push` 実行時 | エージェンティック深層レビュー | コミットあたり複数ターン |

### 5.2 拡張ポイント

| ファイル | 用途 | 上限 |
|:---|:---|:---|
| `.claude/claude-security-guidance.md` | 組織の脅威モデル・チェックリストを注入 | 全スコープ合計 8KB |
| `.claude/security-patterns.yaml` | 決定論的per-editルール追加 | 最大50ルール |

### 5.3 無効化スイッチ

| 環境変数 | 効果 |
|:---|:---|
| `SECURITY_GUIDANCE_DISABLE=1` | プラグイン全体を無効化 |
| `ENABLE_PATTERN_RULES=0` | per-editパターン検査無効 |
| `ENABLE_STOP_REVIEW=0` | end-of-turn diffレビュー無効 |
| `ENABLE_COMMIT_REVIEW=0` | commit/pushレビュー無効 |

### 5.4 実装構造

プラグインは全て **hooks** 上に実装。`SessionStart`, `UserPromptSubmit`, `PostToolUse`, `Stop` イベントを使用。

Anthropic の自社ロールアウトでは、PRの**セキュリティ関連コメントが30～40%減少**。

---

## 6. 競合比較

### 6.1 直接競合: AIネイティブ エージェンティックセキュリティレビュアー

| 製品 | ベンダー | 実行位置 | 検証方式 | 差別化要因 |
|:---|:---|:---|:---|:---|
| **Claude Security Plugin** | Anthropic | ローカルセッション | 3レンズパネル 2/3定足数 | レポート完全性のコードベース証明 |
| **Codex Security** | OpenAI | クラウド | サンドボックスエクスプロイト検証 | サンドボックス検証が最大の差別化 |
| **Claude Security (Managed)** | Anthropic | ホスティング | 同系統検証 | 常時モニタリング、webhook |
| **ZeroPath** | ZeroPath | SaaS | AIネイティブ検出 | 認可論理・IDORに強み |
| **Corgea** | Corgea | SaaS | 上流スキャナー結果のAIトリアージ | 修正レイヤー |

### 6.2 隣接競合: 従来SAST/AppSecプラットフォーム

| 製品 | 検出エンジン | vs Claude Security |
|:---|:---|:---|
| **Semgrep** | ルールベース | 決定論的・再現可能だが、論理欠陥推論は劣る |
| **Snyk Code** | 静的解析 + DeepCode AI | プラットフォーム幅で圧倒、論理欠陥は弱い |
| **GitHub Advanced Security (CodeQL)** | CodeQLデータフロークエリ | GitHub依存。ClaudeはGitLab/Bitbucket/閉域網カバー |
| **Checkmarx One** | ルールベース | エンタープライズガバナンス |
| **Veracode** | バイナリ+静的 | 規制・防衛領域で代替不可 |
| **SonarQube CE** | ルールベース | 予算制約チームのベースライン |

### 6.3 市場ポジショニング

| Tier | 定義 | 代表 |
|:---|:---|:---|
| Tier 1 | 純粋ルールベース | SonarQube CE, Semgrep OSS |
| Tier 2 | AI支援SAST | Snyk Code, Semgrep Pro, Checkmarx One |
| Tier 3 | **AIネイティブSAST** — LLMが一次検出エンジン | **Claude Security**, Codex Security, ZeroPath |

**結論:** Claude Security Plugin は Snyk・Semgrep・GHAS の**代替ではなく補完**。決定論的ツールが再現性・コンプライアンス・サプライチェーンを担当し、本プラグインがそれらのツールでは構造的に捕捉できない文脈依存論理欠陥を担当する。

---

## 7. Getting Started

### 7.1 前提条件

| 項目 | `claude-security` | 確認コマンド |
|:---|:---|:---|
| Claude Code CLI | v2.1.154+ | `claude --version` |
| プラン | 有料プラン必須 | — |
| Dynamic workflows | 有効必須 | `/config` |
| Python | 3.9.6+, `PATH` に `python3` | `python3 --version` |
| Git | 変更スキャン・パッチ生成に必要 | `git --version` |

### 7.2 インストール

```text
/plugin install claude-security@claude-plugins-official
/reload-plugins
```

`security-guidance` も同時に:

```text
/plugin install security-guidance@claude-plugins-official
/reload-plugins
```

### 7.3 チーム展開

```json
{
  "enabledPlugins": {
    "security-guidance@claude-plugins-official": true,
    "claude-security@claude-plugins-official": true
  }
}
```

### 7.4 初回スキャン

```text
1) /claude-security → "Scan codebase" 選択
2) スキャン範囲選択
3) 実行確認（トークンを大量消費、完了までClaude Codeを開いたまま）
4) 進捗観察（/workflows で詳細確認）
5) CLAUDE-SECURITY-<timestamp>/ ディレクトリ確認
6) /claude-security → "Suggest patches" → 対応する発見を選択
7) 承認したパッチのみ git apply（1パッチ1PR推奨）
```

**auto mode 有効化を推奨** — 各段階での権限プロンプトによるブロックを防止。

### 7.5 変更分のみスキャン

```text
/claude-security scan my branch
```

コミット済み変更のみが対象。進行中の編集は先にcommitまたはstash。

### 7.6 大規模リポジトリのスコーピング

全体ツリーを一度に処理せず、領域ごとに分割。プラグインが提案するフォーカススコープ（APIレイヤー、認証コード等）を選択。

### 7.7 レポートの読み方

```text
1. CLAUDE-SECURITY-REVISION-<commit>.json → verification.status を確認
2. CLAUDE-SECURITY-RESULTS.md の coverage セクション → スキャン除外を確認
3. 発見一覧 → severity × confidence でソート
4. CLAUDE-SECURITY-RESULTS.jsonl → チケットシステム連携
```

### 7.8 トラブルシューティング

| 症状 | 原因・対処 |
|:---|:---|
| Python警告 | `python3` 3.9.6+が必要 |
| "Fable 5's safeguards flagged this message" | 正常動作、スキャンは完了 |
| security-guidanceレビューが表示されない | ログ確認、gitリポジトリ外ではスキップ |
| パッチがノートのみ | 独立検証者が3主張を保証できず |

### 7.9 削除

```text
claude plugin uninstall claude-security
/plugin uninstall security-guidance@claude-plugins-official
```

---

## 8. 導入推奨シナリオ

| 組織状況 | 推奨 |
|:---|:---|
| Claude Code 使用中、AppSecツールなし | `security-guidance` 即時展開（無料）。`claude-security` はリリース前ブランチから |
| 既存SAST運用中 | 現行スタック維持。高リスクコンポーネントに限定投入 |
| GitHub Enterprise中心 | GHAS + Copilot Autofix がPRループで優位。Claudeは論理欠陥用2次 |
| GitLab / Bitbucket / 閉域網 | プラグインのローカル実行が構造的優位 |
| 規制・監査対応必須 | 決定論的SAST必須維持 |

### 最小運用手順案

```text
[日常]   security-guidance 常時有効（無料、自動）
[PR前]  /claude-security scan my branch（変更分限定、medium effort）
[スプリント] 高リスクコンポーネント1つ全体スキャン（high）
[リリース] 既存SAST + SCA + シークレットスキャン（決定論的ゲート）
[四半期] リポジトリ全体スキャン（max effort）、リビジョンスタンプで履歴管理
```

---

## 9. 出典

| 出典 | URL |
|:---|:---|
| Claude Security Plugin 公式ドキュメント | https://code.claude.com/docs/en/claude-security |
| security-guidance Plugin 公式ドキュメント | https://code.claude.com/docs/en/security-guidance |
| Claude Security 製品ページ | https://claude.com/product/claude-security |
| プラグインソース (claude-security) | https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-security |
| プラグインソース (security-guidance) | https://github.com/anthropics/claude-plugins-official/tree/main/plugins/security-guidance |
| Sandbox Runtime | https://github.com/anthropic-experimental/sandbox-runtime |
| セキュリティレビュー GitHub Action | https://github.com/anthropics/claude-code-security-review |

Beta製品のため、機能・出力スキーマ・要件は変更される可能性があります。自動化パイプラインを接続する前に公式ドキュメントで再確認してください。
