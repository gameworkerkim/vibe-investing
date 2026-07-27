<!--
---
title: "OpenHands レビュー — 自律コーディングエージェントからエージェントコントロールセンターへ"
title_en: "OpenHands Review — From Coding Agent to Agent Control Center"
subtitle: "Agent Canvas オーケストレーション。ACP で Claude Code・Codex を駆動するセルフホストセンター"
description: "All Hands AI の OpenHands（旧 OpenDevin）のコンセプト転換、オープンコアライセンス、デフォルト経路のサンドボックス欠如、goose・OpenWorker との位置づけ、導入チェックリストをまとめた TechDoc。"
abstract: |
  OpenHands は All Hands AI の MIT+エンタープライズ・オープンコア・コーディングエージェントから、エージェントコントロールセンター（Agent Canvas）へ移行中である。
  ACP で Claude Code・Codex・Gemini をオーケストレーションし、Automation Server でスケジュールと Webhook を回す。
  デフォルト npm インストール経路にはサンドボックスがなく、enterprise/ の別ライセンス・リポジトリ分離による移行期の混乱が主要な注意点である。
summary_for_ai: |
  Third-party tech review of github.com/OpenHands/OpenHands (~82.2k stars as of ~2026-07-27).
  MIT + separate enterprise/ LICENSE (open-core). Transitioning to Agent Canvas + software-agent-sdk + automation repos.
  Default npm path has no sandbox — Docker recommended. Closest peers: goose (local runtime), OpenWorker (knowledge work artifacts).
  Not investment advice. Verify LICENSE and install paths before citing.
date: 2026-07-27
updated: 2026-07-27
author: "Dennis Kim（金浩光）"
lang: ja
tags:
  - OpenHands
  - Agent Canvas
  - All Hands AI
  - AI Agent
  - LLM
  - ACP
  - MCP
  - コーディングエージェント
keywords:
  - "OpenHands"
  - "Agent Canvas"
  - "OpenDevin"
  - "ACP agent"
  - "coding agent control center"
  - "OpenHands vs goose"
group: llm-agents
featured: true
featured_rank: 7
schema_type: TechArticle
draft: false
robots: index,follow
---
-->

# OpenHands — 自律コーディングエージェントからエージェントコントロールセンターへ

| 項目 | 内容 |
| --- | --- |
| プロジェクト | OpenHands（旧 OpenDevin） |
| 開発 | All Hands AI |
| 初公開 | 2024 年末、OpenDevin 名義。2025 年に OpenHands へ改称 |
| ライセンス | MIT + 別ライセンス混在。`enterprise/` ディレクトリは `enterprise/LICENSE`、それ以外は MIT |
| リポジトリ | github.com/OpenHands/OpenHands（旧 All-Hands-AI/OpenHands から移行） |
| リポジトリ規模 | スター 82.2k、フォーク 10.5k、コミット 7,082 件、オープン issue 135 件、オープン PR 234 件 |
| 現状 | Beta バッジ表示。Agent Canvas への移行進行中 |
| リリースチャネル | OSS 1.11.0（2026-07-09）/ Cloud 1.47.1（2026-07-21）の二系統 |
| ドキュメント | docs.openhands.dev |
| 実装言語 | Python（エージェント、サーバー）、TypeScript（フロントエンド） |
| デプロイ形態 | npm グローバルインストール、Docker、ソースビルド、ホスト型クラウド、Kubernetes エンタープライズ |

---

## 1. コンセプト

初期の OpenHands の命題は「人間の開発者ができることはすべてエージェントが実行する」だった。Cognition Labs の Devin へのオープンソース対抗として出発し、コード修正・コマンド実行・Web ブラウジング・API 呼び出しを自律実行する単一エージェントを目指した。

現在は命題が変わった。リポジトリ冒頭は「コーディングエージェントと自動化のためのセルフホスト型開発者コントロールセンター」であり、自社エージェントだけでなく Claude Code、Codex、Gemini など ACP（Agent-Client Protocol）互換エージェントをまとめて動かす **オーケストレーション層** として再定義された。自前エージェントを売るプロジェクトから、他社エージェントまで管理するプラットフォームへ移行した形だ。

| 区分 | 初期 OpenHands（OpenDevin） | 現行 OpenHands |
| --- | --- | --- |
| アイデンティティ | 自律コーディングエージェント | エージェントコントロールセンター |
| 実行主体 | 自前 CodeAct エージェント | OpenHands エージェント + 任意の ACP エージェント |
| 既定 UI | ローカル GUI、CLI | Agent Canvas |
| 実行場所 | ローカル Docker サンドボックス | ローカル、Docker、VM、社内インフラ、クラウドから選択 |
| 焦点 | issue 解決 | 常時稼働の自動化チーム |

### アーキテクチャ

```
              Agent Canvas（フロントエンド + コントロールセンター）
                          |
        +-----------------+------------------+
        |                 |                  |
  Agent Server      Agent Server       Agent Server
  （ローカルノートPC）  （Mac mini/VM）   （OpenHands Cloud）
        |
  Automation Server   スケジュール実行、Webhook イベントトリガー
```

Agent Server は単一ホスト/ポートで複数エージェントを動かす REST API である。Agent Canvas は複数の Agent Server に同時接続して切り替えられるため、コードレビューと依存関係更新用サーバーをチーム共有し、個人作業はノート PC で回すといった分離運用が可能だ。

### リポジトリ分離の現状

メインリポジトリのコードは移行中であり、現行 README は事実上 Agent Canvas のドキュメントである。

| コンポーネント | 移行先 |
| --- | --- |
| OpenHands エージェント、Agent Server | OpenHands/software-agent-sdk |
| Agent Canvas | OpenHands/agent-canvas |
| Automation Server | OpenHands/automation |
| クラウド Helm チャート | OpenHands/openhands-cloud |

移行状況は issue #14841（Agent Canvas transition FAQ）に整理されている。

---

## 2. 長所

| 区分 | 内容 |
| --- | --- |
| コミュニティ規模 | スター 82.2k、フォーク 10.5k、コミット 7,082 件。オープンソースコーディングエージェント最大規模で、goose（51.7k）を上回る |
| エージェント非依存 | ACP 対応で Claude Code、Codex、Gemini をそのまま接続可能。既存サブスクリプションを再利用しつつ管理層だけオープンソース化する構成が可能 |
| バックエンド柔軟性 | ノート PC、専用マシン、VM、社内インフラ、クラウドを同一フロントエンドから切り替え。ノート PC を閉じても動き続ける常時エージェントが公式推奨経路 |
| モデル非依存 | LiteLLM 規約ベース。Anthropic、OpenAI、Google、Bedrock に加え LM Studio、llama.cpp、Ollama などローカルモデルまで |
| サンドボックスオプション | Docker バックエンド選択時にホストと隔離された実行環境。コンテナイメージを公式配布 |
| 自動化サーバー | スケジュール実行と Webhook トリガーを別コンポーネントに分離。週次レポートの Slack 投稿、GitHub issue 自動分解など常時ワークフロー |
| 連携範囲 | GitHub、GitLab、Bitbucket、Slack、Jira、Linear、Notion。MCP サーバー接続と OAuth 対応 |
| サブエージェント委譲 | TaskToolSet ベースのマルチエージェントワークフロー。専門エージェントが複合タスクを分担 |
| エンタープライズ機能のリポジトリ内存在 | Agent Profiles、Budgets ダッシュボード、Usage & Monitoring、SAML/SSO、RBAC、BYOR キー管理が実コードとして存在。セルフホスト Kubernetes デプロイ経路あり |
| 公開 API | スクリプト、CI ワークフロー、社内アプリから呼び出せる完全公開 API |
| 脆弱性対応 | 依存関係 CVE 対応がリリースノートに明示（例：vite CVE-2026-53571 パッチ） |
| 成果物の所有権 | 利用規約上、エージェント生成結果の権利はユーザーに帰属 |

---

## 3. 短所と注意点

| 区分 | 内容 |
| --- | --- |
| 純粋なオープンソースではない | LICENSE が `enterprise/` を別ライセンスに分けたオープンコア構造。リポジトリを「MIT プロジェクト」と決め打ちして商用利用を設計してはならない。導入前に `enterprise/LICENSE` 原文確認が必須 |
| デフォルトインストール経路にサンドボックスなし | 現行 README の Option 1（`npm install -g`）と Option 3（ソース実行）はエージェントサーバーをホスト上で直接起動する。README 自体が「エージェントはファイルシステム全体にアクセスする」と警告。隔離には Docker バックエンドを明示的に選択すること |
| 移行期の混乱 | エージェント本体、Agent Canvas、自動化サーバーがそれぞれ別リポジトリへ移行中。既存ドキュメント、ブログ、チュートリアルの半数以上が既に動かないコマンドを含む。旧 `ghcr.io/all-hands-ai/openhands` イメージとポート 3000 案内は廃止済み |
| Beta 状態 | プロジェクト状態バッジは beta。規模は大きいが現形は安定化前 |
| オープンコアドリフトの監視必要 | クラウド 1.47.0 で Agent Canvas を SaaS 認証の内側に移した変更があった。クラウド限定措置だが、機能がどちらに配置されるか追跡が必要 |
| 重いアーキテクチャ | イベントループベースの状態保持システムでサーバーレスデプロイに不向き。Node.js 22.12.x 以上、uv、任意の Docker が必要 |
| ローカル実行の攻撃面 | ファイルシステムとシェルアクセスを持つエージェントを Webhook と Slack トリガーで常時公開する構成。外部 issue 本文やチャンネルメッセージがそのまま指示文になる経路があり、プロンプトインジェクションの標準的入口。公式ドキュメントもセルフホストガイドでセキュリティハードニングを別途強調 |
| コスト | BYOK 構造。サブエージェント並列実行と常時自動化はトークン消費が大きい。Budgets ダッシュボードはエンタープライズ系機能 |
| クラウドデータ条件 | クラウド版利用時、ユーザーデータにサービス運営のための広範なライセンスが付与される。機密コードを扱うなら規約確認が先行 |
| マルチユーザー | 認証、RBAC、SAML/SSO はエンタープライズ経路。純 OSS 構成でマルチテナントを実装するには別設計が必要 |
| PR 滞留 | オープン PR 234 件。活発な貢献の指標であると同時にレビューボトルネックの指標 |

---

## 4. 類似・競合プロジェクト

| プロジェクト | ライセンス | 性格 | OpenHands との比較 |
| --- | --- | --- | --- |
| goose（AAIF/Linux Foundation） | Apache 2.0 | Rust ベース汎用ローカルエージェント。デスクトップ・CLI・API | ガバナンス中立性とライセンス単純性で優位。オープンコアリスクなし。一方でバックエンド分散実行とエンタープライズ管理機能は OpenHands が先行 |
| OpenWorker（Andrew Ng、Rohit Prasad） | MIT | 知識労働者向けローカルデスクトップエージェント | 業務成果物中心、25+ ネイティブコネクタ。規模と成熟度では比較にならないほど劣後 |
| Devin（Cognition Labs） | 商用 | AI ソフトウェアエンジニア | OpenHands の当初ベンチマーク。非公開・有料 |
| Claude Code | 商用 | Anthropic 公式 CLI エージェント | 単一モデル最適化の完成度。OpenHands で ACP エージェントとして組み込み可能 — 競合かつ構成要素 |
| Cline / Kilo Code | オープンソース | IDE 組み込みエージェント | IDE ワークフロー密着。常時自動化とマルチバックエンドは領域外 |
| Aider | Apache 2.0 | ターミナル優先、Git コミット直結 | 単一目的ツールとして成熟・軽量。管理層なし |
| AutoGPT | オープンソース | 自律エージェントフレームワーク | サンドボックスと本番運用機能の欠如 |
| Codex（OpenAI） | 商用 | コーディングアシスタントおよびエージェント | OpenHands で ACP 経由で駆動可能 |
| n8n / Dify | 混在 | ワークフローオーケストレーション | ビジュアル編集で優位。エージェンティック自律性は劣後 |

### ポジショニング要約

三プロジェクトを一行で分けるとこうなる。**goose はローカルランタイム、OpenWorker は業務成果物、OpenHands は管理層** である。

OpenHands の転換は賢明な選択に見える。エージェント本体の性能競争はフロンティアモデル提供側が勝つゲームであり、その上で複数エージェントをオーケストレーションする席はまだ空いていた。Claude Code を競合ではなく駆動対象として再配置したのがその判断の結果だ。

ただしこの転換には代償がある。オープンコアライセンス構造、デフォルト経路でのサンドボックス欠如、リポジトリ分離によるドキュメント断片化が同時進行しており、今導入を検討するなら 6 か月後の構成が大きく変わっている可能性を前提にすべきだ。

---

## 5. Getting Started

### 5.1 実行方式の選択

| 方式 | 説明 | サンドボックス | 推奨対象 |
| --- | --- | --- | --- |
| npm グローバルインストール | Agent Canvas ローカル全スタック起動 | なし | クイック試行、個人開発環境 |
| Docker | コンテナ内実行、プロジェクトディレクトリのみマウント | あり | 隔離が必要なすべてのケース |
| ソースビルド | agent-canvas リポジトリを直接実行 | なし | コントリビュータ、カスタマイズ |
| VM セルフホスト | クラウドサーバーで Agent Server を常時稼働 | 構成による | 常時自動化、チーム共有 |
| OpenHands Cloud | ホスト型。app.all-hands.dev | 提供 | インフラ管理回避 |
| Kubernetes エンタープライズ | Helm チャートベースのセルフホスト | 提供 | 組織デプロイ、SSO/RBAC 必要 |

### 5.2 npm インストール（サンドボックスなし）

前提：Node.js 22.12.x 以上、`uv`

```bash
npm install -g @openhands/agent-canvas
agent-canvas
```

全スタックが起動し、UI は `http://localhost:8000` でアクセスする。コンポーネントを分離して起動する場合：

```bash
agent-canvas --frontend-only   # 静的フロントエンド + イングレス
agent-canvas --backend-only    # エージェントサーバー + 自動化バックエンド + イングレス
```

この経路ではエージェントサーバーがホスト上で直接実行され、ファイルシステム全体が露出する。実験目的以外では非推奨。

### 5.3 Docker インストール（推奨）

前提：Docker Desktop または Docker Engine、エージェントに公開するプロジェクトの親ディレクトリ

```bash
export PROJECTS_PATH="$HOME/projects"
mkdir -p "$PROJECTS_PATH" "$HOME/.openhands"

docker run -it --rm \
  -p 8000:8000 \
  -v "$HOME/.openhands:/home/openhands/.openhands" \
  -v "${PROJECTS_PATH}:/projects" \
  ghcr.io/openhands/agent-canvas:1
```

エージェントは `PROJECTS_PATH` 配下のプロジェクトにのみアクセスする。マウント範囲がアクセス制御境界なので、ホームディレクトリ全体をマウントしないこと。Windows は agent-canvas リポジトリの `README.windows.md` を参照。

### 5.4 ソース実行

```bash
git clone https://github.com/OpenHands/agent-canvas.git
cd agent-canvas
npm install
npm run dev
```

前提：Node.js 22.12.x 以上、npm、uv（`uvx` でエージェントサーバー起動）。この経路もサンドボックスなし。

エージェント本体や Agent Server を直接扱う場合は `OpenHands/software-agent-sdk` リポジトリを使用する。

### 5.5 モデル設定

LiteLLM 規約に従うため、プロバイダー接頭辞表記を使用する。

```bash
export LLM_API_KEY="your-api-key"
export LLM_MODEL="anthropic/<model-id>"
```

ローカルモデルは LM Studio、llama.cpp、Ollama 経由で接続。設定 UI では LLM プロファイル単位でモデルを保存・切り替え可能。

### 5.6 ACP エージェント接続

Agent Canvas は OpenHands エージェントを既定で動かすが、ACP 互換エージェントを代替実行主体として登録できる。

| エージェント | 備考 |
| --- | --- |
| OpenHands Agent | 既定値、追加設定不要 |
| Claude Code | 既存サブスクリプション再利用可能 |
| Codex | 既存サブスクリプション再利用可能 |
| Gemini | ACP 経由 |
| その他 ACP 実装 | プロトコル準拠なら接続可能 |

### 5.7 自動化構成

Automation Server でスケジュール実行と Webhook トリガーを設定する。代表パターン：

| パターン | トリガー | 成果物 |
| --- | --- | --- |
| 週次レポート | cron | Slack チャンネル投稿 |
| issue 自動分解 | GitHub Webhook | サブタスク作成 |
| 依存関係更新 | cron | PR 作成 |
| アラート対応 | Datadog 等の外部イベント | 調査後スレッド返信 |

Webhook とチャンネルメッセージが指示文経路になるため、外部入力を信頼しない前提で対象リポジトリと実行権限を絞ること。

### 5.8 リポジトリ構造

| パス | 内容 |
| --- | --- |
| `openhands/` | Python バックエンドコア |
| `frontend/` | Web フロントエンド |
| `openhands-ui/` | UI コンポーネント |
| `enterprise/` | エンタープライズ機能。別ライセンス適用区間 |
| `containers/` | コンテナビルド定義 |
| `skills/`, `.agents/skills` | エージェントスキル定義 |
| `kind/` | ローカル Kubernetes 構成 |
| `tests/` | テストスイート |
| `Development.md` | 開発環境構築ガイド |

### 5.9 導入前チェック項目

| 点検 | 判断基準 |
| --- | --- |
| ライセンス | `enterprise/LICENSE` 原文を先に確認。利用したい機能が MIT 区間かエンタープライズ区間か特定すること |
| 実行隔離 | デフォルト npm 経路ではなく Docker バックエンドを標準採用。マウント範囲をプロジェクトディレクトリに限定 |
| 外部トリガー | Slack、GitHub、Webhook 連携時に信頼境界を設計。外部テキストが指示文として解釈される経路を列挙すること |
| 資格情報範囲 | リポジトリ書き込み権限、issue 作成権限を最小単位で発行。組織全体トークン使用禁止 |
| コスト上限 | プロバイダーコンソールで上限を事前設定。常時自動化は消費量が累積する |
| クラウド規約 | 機密コードを扱うならデータライセンス条項を確認後、セルフホスト可否を決定 |
| 移行期リスク | リポジトリ分離進行中のため、バージョン固定と移行計画を前提に導入 |
| 代替比較 | 単純なローカルエージェントが目的なら goose の方が軽くライセンスも単純 |

---

## 参考

- メインリポジトリ: https://github.com/OpenHands/OpenHands
- Agent Canvas: https://github.com/OpenHands/agent-canvas
- エージェント SDK: https://github.com/OpenHands/software-agent-sdk
- 自動化サーバー: https://github.com/OpenHands/automation
- クラウド Helm チャート: https://github.com/OpenHands/openhands-cloud
- ドキュメント: https://docs.openhands.dev/overview/introduction
- セルフホストガイド: https://docs.openhands.dev/openhands/usage/agent-canvas/backend-setup/vm
- 移行 FAQ: https://github.com/OpenHands/OpenHands/issues/14841
- 開発ガイド: https://github.com/OpenHands/OpenHands/blob/main/Development.md
- Slack: https://go.openhands.dev/slack

#OpenHands #AgentCanvas #AllHandsAI #AIエージェント #OpenSource #ACP #MCP #コーディングエージェント #LLM
