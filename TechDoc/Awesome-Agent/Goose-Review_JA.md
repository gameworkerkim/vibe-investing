<!--
---
title: "Goose レビュー — Linux Foundation AAIF 傘下のオープンソース AI エージェント"
title_en: "Goose Review — Open-Source AI Agent under Linux Foundation AAIF"
subtitle: "汎用ローカルエージェントランタイム。ガバナンス中立、Apache 2.0、デスクトップ・CLI・API"
description: "Block から Linux Foundation AAIF へ移管された goose のコンセプト、権限モード、長所・短所、OpenWorker・OpenHands との位置づけ、導入チェックリストをまとめた TechDoc。"
abstract: |
  goose は Block で始まり、2026-04-07 に Linux Foundation Agentic AI Foundation へ寄贈された Apache 2.0 のローカル AI エージェントである。
  Rust 実装、デスクトップ・CLI・組み込み API、70+ MCP 拡張、ACP 対応が核心である。
  デフォルト権限モードは Completely Autonomous で、サブエージェントは自律モードでのみ動作する — 性能を得るには承認ゲートを切る構造的トレードオフが最大の注意点である。
summary_for_ai: |
  Third-party tech review of github.com/aaif-goose/goose (51.7k stars, ~5130 commits as of ~2026-07-27).
  Apache 2.0, AAIF/Linux Foundation governance. Rust Cargo workspace. Modes: Completely Autonomous (default), Smart Approval, Manual Approval, Chat Only.
  Subagents only in autonomous mode. Closest peers: OpenWorker (knowledge work), OpenHands (orchestration).
  Not investment advice. Verify current stars and install paths before citing.
date: 2026-07-27
updated: 2026-07-27
author: "Dennis Kim（金浩光）"
lang: ja
tags: [goose, AAIF, Linux Foundation, AI Agent, LLM, MCP, ACP, オープンソース]
keywords: ["goose AIエージェント", "AAIF goose", "Linux Foundation エージェント", "ローカルAIエージェント", "MCP拡張", "Goose vs OpenWorker"]
group: llm-agents
featured: true
featured_rank: 6
schema_type: TechArticle
draft: false
robots: index,follow
---
-->

# Goose — Linux Foundation 傘下へ移管されたオープンソース AI エージェント

| 項目 | 内容 |
| --- | --- |
| プロジェクト | goose |
| 開発 | Block（Square、Cash App、Tidal の親会社）で開始、現在は Agentic AI Foundation（AAIF）傘下 |
| ガバナンス移管 | 2026年4月7日、Linux Foundation AAIF へ寄贈（MCP、AGENTS.md と同一財団） |
| ライセンス | Apache 2.0 |
| リポジトリ | github.com/aaif-goose/goose（旧 block/goose から移行） |
| リポジトリ規模 | スター 51.7k、フォーク 5.7k、コミット 5,130件、オープン issue 225件、オープン PR 180件 |
| ドキュメント | goose-docs.ai |
| 実装言語 | Rust（Cargo ワークスペース） |
| 対応 OS | macOS（Apple Silicon/Intel）、Linux（DEB 等）、Windows |
| 提供形態 | デスクトップアプリ、CLI、組み込み API |

---

## 1. コンセプト

goose の命題は「コード提案を超える汎用ローカルエージェント」である。コーディングツールとして始まったが、現在のポジショニングはリサーチ、文書作成、自動化、データ分析までを包含する general-purpose agent であり、特定ベンダーではなく Linux Foundation 傘下の財団がガバナンスを握る点が他のすべての競合プロジェクトと決定的に異なる。

動作フローは次のとおりである。

| 段階 | 内容 |
| --- | --- |
| 1 | セッション開始（デスクトップアプリ、CLI、または API 組み込み） |
| 2 | 自然言語指示を入力。goose が計画を立て、ツール呼び出しに分解 |
| 3 | すべてのツール呼び出しが ToolInspectionManager を通過。Security インスペクタ、Egress インスペクタがスタック形式で検査 |
| 4 | 有効な権限モードに応じて自動承認、ユーザー承認待ち、またはブロック |
| 5 | 必要に応じてサブエージェントをスポーンし並列処理後、結果を集約 |

### アーキテクチャ

```
goose Desktop (Electron/ネイティブシェル)  |  goose CLI  |  Embeddable API
                    |
              goose-server (goosed)     ローカルバックエンドデーモン
                    |
                goose (core)            エージェントループ、プロバイダ、権限、セッション
                    |
        goose-mcp  |  外部 MCP サーバ  |  ACP プロバイダ
                    |
   ローカルファイル · シェル · 70+ 拡張 · 15+ モデルプロバイダ
```

Cargo ワークスペースは `goose`（コア）、`goose-cli`、`goose-server`、`goose-mcp` クレートに分かれており、CLI とデスクトップアプリが同一コアを共有する。設定は `~/.config/goose/config.yaml` 一つで CLI とデスクトップが共用する。

### 権限モデル

セッション単位モード（GooseMode）とツール単位権限が二重にかかる。

| モード | 動作 | サブエージェント |
| --- | --- | --- |
| Completely Autonomous | 承認なしで全量自動実行。デフォルト | 利用可能 |
| Smart Approval | LLM ベースの PermissionJudge 分類器が危険度を判定し選択的承認 | 利用不可 |
| Manual Approval | すべてのツール呼び出しにユーザー確認 | 利用不可 |
| Chat Only | ツールアクセス自体をブロック。システムプロンプトに無ツール状態を注入 | 利用不可 |

Smart Approval は MCP 標準の `ToolAnnotations.read_only_hint` フィールドを読み、read-only でないツールを自動的に承認待ちリストに入れる。モード優先度は設定ファイルよりランタイムオーバーライドが高く、CLI では `/mode approve` などのスラッシュコマンド、デスクトップでは UI トグルで即時切り替えできる。

### AdversaryInspector

`~/.config/goose/adversary.md` ファイルを置くと有効化される別検査層である。フロントマターで検査対象ツールを指定し（デフォルトは `shell` と `computercontroller__automation_script`）、区切り線の下に自然言語ルールを書くと LLM が該当ツール呼び出しを実行直前に判定する。データ流出性コマンドや破壊的コマンドをブロックし、通常の開発作業は通すといったポリシー記述が可能である。

---

## 2. 長所

| 区分 | 内容 |
| --- | --- |
| ガバナンス中立性 | Linux Foundation AAIF 傘下。単一企業の商業的判断にプロジェクト方向が左右されない。企業導入時のベンダーリスク評価で最大の加点 |
| ライセンス | Apache 2.0。AGPL 系と異なりソース公開義務なく組み込み・再配布・商用利用可能。自社製品にエージェントを内蔵する企業に実質的な差 |
| 成熟度 | コミット 5,130件、スター 51.7k、フォーク 5.7k、数百名規模のコントリビュータ。初期プロジェクトではなく既にプロダクション軌道 |
| 3 OS 全面サポート | macOS、Linux、Windows デスクトップアプリすべて正式配布。Linux サポートは競合製品対比で希少な強み |
| インターフェース多様性 | デスクトップアプリ、CLI、組み込み API の三つ。対話型作業と CI/CD 無人実行を同一コアで処理 |
| ACP 対応 | Agent Client Protocol 実装。Zed、JetBrains、VS Code で goose を ACP サーバとして接続でき、逆に既存の Claude Code や Codex サブスクリプションをプロバイダとして再利用できる。新規 API 課金なしで保有サブスクリプションを消費する経路 |
| モデル柔軟性 | 15以上のプロバイダ。Anthropic、OpenAI、Google、Azure、Bedrock、OpenRouter、Ollama 等。ローカル完全実行可能 |
| 拡張エコシステム | 公式レジストリに 70以上の MCP 拡張。任意の MCP サーバ接続も可能 |
| サブエージェント | セッションあたり並列サブエージェントスポーン。各サブエージェントが親と異なるプロバイダを使え、低コストモデルへの委譲によるコスト最適化パターン構成可能 |
| Recipes + Scheduler | YAML レシピでシステム指示、拡張リスト、レスポンススキーマ、リトライポリシーを固定し cron スケジュールで反復実行。URL 共有と Recipe Cookbook を提供 |
| セキュリティ層の多層化 | 権限モード、ツール別権限、プロンプトインジェクション検知、サンドボックスモード、AdversaryInspector がそれぞれ独立層として存在 |
| Custom Distros | プロバイダ、拡張、ブランディングを事前に詰めた社内専用配布版ビルドを公式サポート。組織展開に実質的に必要な機能 |
| Rust 実装 | ネイティブ性能、低リソース占有、ランタイム依存最小化 |

---

## 3. 短所および注意点

| 区分 | 内容 |
| --- | --- |
| デフォルトが自律モード | デフォルト権限モードが Completely Autonomous。シェルとファイルアクセスを持つエージェントの安全デフォルトとしては攻撃的で、組織展開時は必ず再設定すべき項目 |
| 安全性と並列性の排他トレードオフ | サブエージェントは自律モードでのみ動作する。つまり並列処理性能を使うには承認ゲートをすべて切る必要がある。構造的欠陥に近い設計で、実務ではユーザーが安全装置を切る方向に押されるインセンティブが大きい |
| LLM 依存防御 | Smart Approval の PermissionJudge も、AdversaryInspector も判定主体が LLM。防御層自体がプロンプトインジェクションの標的となり、決定論的保証がない。監査対象統制として提出しにくい形 |
| read_only_hint 信頼問題 | Smart Approval が参照する read-only か否かは MCP サーバが自分自身について宣言する値。悪意あるまたは不注意なサーバが書き込みツールを read-only と宣言すれば自動承認経路に流れる。拡張サプライチェーン検証責任は完全にユーザー側 |
| ネイティブコネクタ不在 | Slack、Jira、Gmail などの業務ツールはすべて別途 MCP サーバインストールと個別認証が必要。「70拡張」という数字はエコシステム規模であり、即利用可能なコネクタ数ではない。初期設定コストが相当する |
| 開発者バイアス | ドキュメント、クイックスタート、レシピ例の大半がコーディングシナリオ。汎用エージェントを標榜するが非開発者オンボーディング経路は弱い |
| 成果物志向ではない | 文書やスプレッドシートをファイルとして出力するのは拡張とプロンプト次第。成果物フォーマットを製品次元で保証しない |
| コンプライアンス不足 | SOC 2、HIPAA 等の認証がない。規制産業で認証ベンダーを要求する場合、それ自体が脱落条件 |
| コスト管理 | BYOK 構造でアプリは無料だがモデル料金は全額ユーザー負担。サブエージェント並列スポーンはトークン消費を急激に増やす。プロバイダコンソールでの上限設定が事実上必須 |
| メンテナンス滞留 | オープン issue 225件、オープン PR 180件。活発さの指標であると同時にレビューボトルネックの指標でもある |
| ソースビルド負担 | Rust ワークスペース全体ビルドは時間とディスクを大きく消費。バイナリ配布利用が事実上のデフォルト経路 |
| オンボーディング経路の商業的誘因 | クイックスタートが Tetrate Agent Router を推奨経路として案内し無料クレジットを提示。財団プロジェクトとしての中立性問題というより、デフォルト経路が特定ルーティングサービスを経由する点を認識して始める必要がある |

---

## 4. 類似および競合プロジェクト

| プロジェクト | ライセンス | 性格 | goose 対比 |
| --- | --- | --- | --- |
| OpenWorker（Andrew Ng、Rohit Prasad） | MIT | 知識労働者向けローカルデスクトップエージェント。25+ ネイティブコネクタ、成果物ファイル返却 | 業務ツール即時連携と承認ゲートの型付けが強み。一方オープンベータ初期段階で Linux 非対応、エコシステム規模は goose の数百分之一 |
| OpenHands（All Hands AI） | MIT | コーディング自律エージェント。Docker サンドボックス、SDK・CLI・クラウド、Kubernetes デプロイ | 隔離実行と SWE-bench 性能が強み。汎用業務より issue 解決特化。goose より重くインフラ要求が大きい |
| Claude Code | 商用 | Anthropic 公式 CLI エージェント | 単一モデル最適化で完成度高い。モデル選択権とローカルデータ統制がない。goose で ACP プロバイダとして逆利用可能 |
| Cline / Kilo Code | オープンソース | VS Code、JetBrains 内蔵 IDE エージェント | IDE ワークフロー密着。ターミナル・自動化・スケジュール領域は goose 優位 |
| Aider | Apache 2.0 | ターミナル優先、Git コミット直結 | 単一目的ツールとして成熟。拡張エコシステムと GUI なし |
| OpenCode | オープンソース | ターミナル優先、既存サブスクリプション再利用 | 軽量。デスクトップアプリとスケジューラなし |
| Open Interpreter | Apache 2.0 | CLI ローカルコード実行エージェント | より原始的。MCP エコシステムと権限階層なし |
| n8n / Dify | 混合（n8n は制限的ライセンス） | ワークフローオーケストレーション | 事前定義フロー実行。goose のレシピの方がよりエージェンティックだが視覚編集と管理 UI は劣る |
| Manus | 商用 | クレジットベース自律タスクエージェント | 完成した製品体験とクラウド実行。オープンソースではない |

### ポジショニング要約

現時点でオープンソースローカルエージェントカテゴリの事実上の基準点である。規模、ガバナンス、ライセンス、OS カバレッジ、インターフェース多様性のいずれの軸でも代替が明確でない。OpenWorker が「業務成果物」という UX フレーミングで、OpenHands が「サンドボックスとベンチマーク」でそれぞれ狭い優位を主張する構図であり、goose はその間で汎用プラットフォームの席を占めている。

ただしプラットフォームとして大きくなった代償で安全デフォルトが緩んだ。自律モードデフォルトとサブエージェントのモード制約は「性能を使うなら防御を切れ」という選択を強いる構造であり、この点が規制環境導入で最初に引っかかる。

---

## 5. Getting Started

### 5.1 デスクトップアプリインストール

| OS | 方法 |
| --- | --- |
| macOS（Apple Silicon） | リリースの `Goose.zip` をダウンロード後解凍、実行ファイル起動 |
| macOS（Intel） | リリースの `Goose_intel_mac.zip` 同手順 |
| Linux（Debian/Ubuntu 系） | DEB ファイルダウンロード後 `sudo dpkg -i (filename).deb`、アプリメニューから起動 |
| Windows | ZIP ダウンロード後解凍、実行ファイル起動 |

ダウンロードパスは goose-docs.ai/docs/getting-started/installation に整理されている。

### 5.2 CLI インストール

```bash
curl -fsSL https://github.com/aaif-goose/goose/releases/download/stable/download_cli.sh | bash
```

Windows は `download_cli.ps1` を使用する。インストール後 PATH 警告が出たら `goose configure` 実行前に PATH 登録が必要。Windows でキーリングエラーが発生したらキーリング保存を切って進める。

パイプ-to-shell インストールが組織ポリシー上不適切なら、スクリプトを先にダウンロードして確認後実行する方がよい。

### 5.3 プロバイダ設定

```bash
goose configure
```

メニュー構造:

```
◆ What would you like to configure?
  ● Configure Providers      プロバイダ変更および資格情報更新
  ○ Add Extension
  ○ Toggle Extensions
  ○ Remove Extension
  ○ goose settings
```

プロバイダリストには Amazon Bedrock、Amazon SageMaker TGI、Anthropic、Azure OpenAI、ChatGPT Codex、Claude Code CLI、Tetrate Agent Router 等が含まれる。GitHub Copilot は API キーではなく認証コード方式で接続する。

デスクトップアプリは初回起動時のウェルカム画面で API キー直接入力、ChatGPT サブスクリプション連携、Tetrate Agent Router、OpenRouter から選択させる。

### 5.4 完全ローカル構成（Ollama）

```bash
ollama pull qwen3

# ~/.config/goose/config.yaml
# GOOSE_PROVIDER: ollama
# GOOSE_API_BASE: http://localhost:11434
```

外部送信が発生しない唯一の構成。ただし多段ツール呼び出し精度は別途検証が必要で、サブエージェント並列実行時はローカルハードウェアがボトルネックになる。

### 5.5 セッションと拡張

```bash
goose                       # 新規セッション開始
goose session -r            # 直前セッション再開
goose run --no-session -t "<task>"   # ヘッドレス単発実行（CI/CD）
```

拡張追加は `goose configure` > `Add Extension` > `Built-in Extension` 経路で進める。例えば Web スクレイピングとブラウザ制御が必要なら `Computer Controller` 拡張を有効化しタイムアウトを 300 秒に設定する。

### 5.6 権限モード切り替え

```
/mode auto        完全自律
/mode smart       危険度ベース選択承認
/mode approve     全件手動承認
/mode chat        ツールブロック
```

組織展開時はデフォルトを `smart` または `approve` に強制することを推奨。ただしこの場合サブエージェントが無効化される点を事前に周知すべき。

### 5.7 コンテキストとレシピ

| 対象 | ファイルおよび場所 | 用途 |
| --- | --- | --- |
| プロジェクトヒント | `.goosehints` | プロジェクト別規約、禁止事項、ビルド方法等をセッションに常時注入 |
| エージェント指示 | `AGENTS.md` | 標準フォーマットベースのエージェント指示文 |
| 敵対的検査ルール | `~/.config/goose/adversary.md` | shell 等の高リスクツール呼び出しに対する LLM 判定ルール |
| レシピ | YAML | システム指示、タスクプロンプト、拡張リスト、レスポンススキーマ、リトライポリシー |
| グローバル設定 | `~/.config/goose/config.yaml` | プロバイダ、拡張、モード。CLI とデスクトップ共用 |

レシピは Recipe Cookbook から既製品を持ってこれ、Recipe Generator と Deeplink Generator で生成・共有できる。Scheduler と組み合わせれば cron 周期で無人実行される。

### 5.8 ソースビルド

前提条件: Rust ツールチェーン（`rust-toolchain.toml` 固定）、Node（UI ビルド）、Just

```bash
git clone https://github.com/aaif-goose/goose
cd goose

just                # Justfile タスク一覧確認
cargo build          # ワークスペースビルド
```

既存クローンが `block/goose` を指しているならリモートを更新する必要がある。

```bash
git remote set-url origin git@github.com:aaif-goose/goose.git
```

Docker ビルドは `BUILDING_DOCKER.md`、Linux ビルドは `BUILDING_LINUX.md`、Nix ユーザーは `flake.nix` を参照。

### 5.9 リポジトリ構造

| パス | 内容 |
| --- | --- |
| `crates/goose` | コアエージェントロジック、プロバイダ、権限、セッション、サブエージェント |
| `crates/goose-cli` | コマンドラインインターフェース |
| `crates/goose-server` | デスクトップアプリバックエンドデーモン（goosed） |
| `crates/goose-mcp` | 内蔵 MCP サーバ実装 |
| `ui/` | デスクトップアプリフロントエンド |
| `documentation/` | 公式ドキュメントソース |
| `evals/harbor` | 評価ハーネス |
| `recipe-scanner/` | レシピ静的検査ツール |
| `oidc-proxy/` | OIDC プロキシ |
| `workflow_recipes/` | リリースリスクチェック等ワークフローレシピ例 |

### 5.10 導入前チェック項目

| チェック | 判断基準 |
| --- | --- |
| デフォルト権限モード | デプロイイメージで必ず autonomous 以外に固定。Custom Distros 機能で強制可能 |
| サブエージェントポリシー | 並列処理必要性と承認ゲート維持のどちらを優先するか事前決定 |
| 拡張ホワイトリスト | 利用可能 MCP サーバリストを組織次元で固定。read_only_hint を信頼根拠にしない |
| AdversaryInspector ルール | データ流出性コマンドブロックルールを標準テンプレートで展開。ただし LLM 判定のため最終防衛線と見なさない |
| シェルアクセス範囲 | 開発者拡張のアクセス制御設定で作業ディレクトリを制限 |
| コスト上限 | プロバイダコンソールで上限を事前設定。サブエージェント並列スポーン時は消費量が非線形に増加 |
| コンプライアンス | 認証ベンダーが要求される環境なら導入不可。自社監査体系で代替可能か先に確認 |
| ログと監査 | セッショントランスクリプト保管ポリシーと機密情報マスキング方案を別途設計 |

---

## 参考

- リポジトリ: https://github.com/aaif-goose/goose
- ドキュメント: https://goose-docs.ai/
- クイックスタート: https://goose-docs.ai/docs/quickstart
- AAIF 移管告知: https://goose-docs.ai/blog/2026/04/07/goose-moves-to-aaif/
- 財団: https://aaif.io/projects/goose
- ガバナンス: https://github.com/aaif-goose/goose/blob/main/GOVERNANCE.md
- カスタム配布版: https://github.com/aaif-goose/goose/blob/main/CUSTOM_DISTROS.md

#goose #AAIF #LinuxFoundation #AIエージェント #OpenSource #MCP #ACP #業務自動化 #LLM
