<!--
---
title: "Andrew Ng OpenWorker レビュー — ローカル優先オープンソース AI 業務エージェント"
title_en: "Andrew Ng OpenWorker Review — Local-First Open-Source AI Work Agent"
subtitle: "会話ではなく成果物。BYOK・承認ゲート・25+コネクタのデスクトップエージェント"
description: "Andrew Ng が公開した MIT ライセンスのローカル優先 AI 業務エージェント OpenWorker のコンセプト、長所・短所、Goose・OpenHands などとの位置づけ、導入チェックリストをまとめた TechDoc。"
abstract: |
  OpenWorker は Andrew Ng と Rohit Prasad が公開した MIT ライセンスのデスクトップ AI エージェントである。
  チャットボットではなく、成果（outcome）を指示するとローカルファイルとコネクタを横断して成果物を作る。
  核心は aisuite ベースの BYOK、危険度を型で定義した承認ゲート、25以上のネイティブコネクタ、Ollama による完全ローカル経路。
  ローカル優先はローカル完結と同義ではない。オープンベータ、Windows 未署名、承認疲労、プロンプトインジェクションの攻撃面を併せて見る必要がある。
summary_for_ai: |
  Third-party tech review of github.com/andrewyng/openworker (v0.1.6 open beta, released 2026-07-23).
  Local-first Tauri 2 + React 18 UI, Python FastAPI agent on 127.0.0.1:8765 via aisuite.
  Tool risk classes: read / write_local / exec / external. Closest OSS peer: Goose (Agentic AI Foundation).
  Not investment advice. Verify current stars, signing status, and model list before citing.
date: 2026-07-23
updated: 2026-07-27
author: "Dennis Kim（金浩光）"
lang: ja
tags:
  - OpenWorker
  - Andrew Ng
  - AI Agent
  - LLM
  - オープンソース
  - 業務自動化
  - local-first
keywords:
  - "OpenWorker"
  - "Andrew Ng AIエージェント"
  - "ローカルAIエージェント"
  - "aisuite BYOK"
  - "Goose vs OpenWorker"
  - "デスクトップAIエージェント"
  - "MCPコネクタ"
group: llm-agents
featured: true
featured_rank: 5
schema_type: TechArticle
draft: false
robots: index,follow
---
-->

# Andrew Ng、オープンソース AI 業務エージェント「OpenWorker」を公開

| 項目 | 内容 |
| --- | --- |
| プロジェクト | OpenWorker |
| 開発 | Andrew Ng、Rohit Prasad（aisuite 共同開発者） |
| 公開日 | 2026年7月23日 |
| ライセンス | MIT |
| 現行バージョン | v0.1.6（オープンベータ） |
| リポジトリ | github.com/andrewyng/openworker |
| 公式サイト | openworker.com |
| 対応 OS | macOS 12+（Apple Silicon、署名・公証済み）、Windows 10/11 x64（未署名ビルド配布中） |

---

## 1. コンセプト

OpenWorker の核心命題は「会話ではなく成果物」である。プロンプトに答えるチャットボットではなく、望む **結果（outcome）** を指示すれば、それを段階に分解し、ローカルファイルと連携ツールを行き来しながら実際の成果物を作るデスクトップエージェントを目指す。

動作フローは四段階だ。

| 段階 | 内容 |
| --- | --- |
| 1 | ユーザーが成果物を指示（「顧客ブリーフィング準備」「予定整理」「Jira と GitHub でリリース状態確認」） |
| 2 | 作業を下位ステップに分解し、ローカルファイル・連携アプリを横断して実行 |
| 3 | メッセージ送信、予定変更、シェルコマンドなど取り返しのつかない行為の直前に承認を要求 |
| 4 | 開いて共有できるファイル形式の最終成果物を渡す |

### アーキテクチャ

```
OpenWorker デスクトップアプリ          Tauri 2 ネイティブシェル + React 18 UI
        |
ローカルエージェントサーバ（Python）   FastAPI/uvicorn、127.0.0.1:8765、aisuite ベース
        |
ローカルファイル・ターミナル | 25+ コネクタ | ユーザー選択モデル
```

エージェントループ自体はユーザーマシン上で動くローカル優先（local-first）構造であり、OpenWorker が運用する推論サービスは存在しない。唯一のクラウド要素はコネクタ OAuth ハンドシェイクを中継する小規模サービスで、これも API キーを手動登録すればログインなしで使える。

### 権限モデル

すべてのツール呼び出しを四つの危険度に型分類し、等級ごとに承認ゲートを置く。承認レイヤーを UI の付帯機能ではなく型システム水準で扱った点が設計上の差別化だ。

| 等級 | 性格 | 既定ポリシー |
| --- | --- | --- |
| read | 読み取り | 自動許可 |
| write_local | ローカル書き込み | 承認が必要 |
| exec | コマンド実行 | 承認必須 |
| external | 外部送信 | 承認必須 |

無人実行（automation）モードでは、承認が必要な作業を勝手に行わずインボックスに積み、ユーザー確認を待つ。

---

## 2. 長所

| 区分 | 内容 |
| --- | --- |
| モデル非依存 | aisuite ベース BYOK。OpenAI、Anthropic、Google Gemini、Inkling、GLM、DeepSeek、Kimi、Qwen、MiniMax、Mistral、Grok 対応。Together・Fireworks でオープンウェイト、Ollama で完全ローカル |
| データ経路の制御 | 会話履歴・コネクトークン・モデルキーはすべてローカルシークレットストア。機密作業は Ollama、一般作業はクラウドへ振り分ける運用が可能 |
| 承認ゲートの構造化 | 危険度がコードレベルの型として定義され監査可能。「エージェントが勝手にメールを送った」類の事故の表面積が狭い |
| 連携の幅 | GitHub、Slack、Jira、Notion、Linear、HubSpot、Outlook、monday.com、Gmail、Google Calendar など 25 以上のネイティブコネクタ + ターミナル・ローカルファイル + MCP 任意拡張 |
| 成果物志向 | 文書・スプレッドシート・レポート・ウェブページをファイルで返す。要約文ではなく開ける成果物 |
| スケジュール実行 | モーニングブリーフ、週次レポート、チャネル常時監視などの反復作業を自動化。実行記録は全文トランスクリプトとして残る |
| Slack 入口 | チャネルで `@OpenWorker` メンションするとデスクトップにセッションが開き、結果がスレッドに返信される |
| ライセンス | MIT。監査・フォーク・商用利用に制約なし |

---

## 3. 短所と留意点

| 区分 | 内容 |
| --- | --- |
| ローカル優先 ≠ ローカル完結 | エージェントループだけがローカルであり、クラウド API キーを使った瞬間にファイル内容とコンテキストは外部モデル提供者へ送られる。実質的なプライバシーを求めるなら Ollama 経路がほぼ唯一で、その場合ツール呼び出し精度はフロンティアモデルより落ちる |
| 成熟度 | 公開時点でオープンベータ、コミット数 45 前後の初期リポジトリ。スター数は出典により 46〜3,400 と差が大きく、引用時は注意が必要 |
| Windows 未署名 | Windows ビルドはコード署名進行中のため SmartScreen 警告が出る。企業環境への配布には不向き |
| コスト転嫁 | アプリは無料だがモデル料金は全額ユーザー負担。エージェントループの特性上、単一タスクでもトークン消費が大きい |
| 運用負担 | インストール、キー管理、コネクタ認証、モデル選択がすべてユーザー責任。マネージドクラウドエージェントより参入コストが高い |
| ローカル実行の攻撃面 | ターミナルとローカルファイルアクセスを標準で持つ構造は、プロンプトインジェクション視点で危険度が高い。外部文書・メール・Issue 本文を読む作業で指示注入が起きた場合、exec 等級の承認画面が最後の防線になる。承認疲労による習慣的承認が実質的な脆弱点 |
| MCP 拡張の両面性 | 任意 MCP サーバ接続が可能であることは、サプライチェーン検証責任もユーザーにあるという意味 |
| 貢献ポリシー | 内部ロードマップ優先で運営され、方向が異なる PR は却下すると明記。オープンソースだがガバナンスは中央集権的 |
| 検証モデル限定 | ツール呼び出し検証済みのキュレーションモデルはおおよそ 30。一覧外モデルはユーザー責任 |

---

## 4. 類似・競合プロジェクト

| プロジェクト | ライセンス | 性格 | OpenWorker との比較 |
| --- | --- | --- | --- |
| Goose（Agentic AI Foundation） | Apache 2.0 | Rust ベースのローカルエージェントランタイム。デスクトップ + CLI + 埋め込み API | 最も直接的な競合。25以上のモデル提供者、70以上の MCP 拡張、サブエージェント、macOS・Windows・Linux 全対応。Linux Foundation ガバナンスで中立性が優位。成熟度とエコシステムで大きく先行 |
| OpenHands（All Hands AI） | MIT | コーディング自律エージェント。Docker サンドボックス、SDK・CLI・クラウド | SWE-bench 中心の開発作業特化。業務自動化より Issue 解決向き。サンドボックス隔離は OpenWorker より強い |
| Open Interpreter | Apache 2.0 | CLI 優先のローカル実行エージェント | より原始的・汎用的。GUI とコネクタエコシステムがない |
| Cline / Kilo Code | オープンソース | IDE 内蔵エージェント（VS Code、JetBrains） | コーディングセッション特化。業務ツール連携領域ではない |
| Claude Cowork / Claude Desktop | 商用 | マネージドなエージェンティック知識労働ツール | インストール・キー管理負担なし。代わりにモデル選択権とデータローカル性なし |
| Manus | 商用 | クレジットベース自律タスクエージェント | 完成度の高い製品体験。オープンソースではない |
| Poke などメッセージングネイティブエージェント | 商用 | 文字・チャット内で動く個人秘書 | ファイル成果物ではなく会話フロー中心。用途が異なる |
| n8n / Dify / Zapier Agents | 混合 | ワークフローオーケストレーション | 事前定義フローの実行。目標ベースの自律分解ではない |

### ポジショニング要約

OpenWorker の座標は「Goose が開発者向けローカルエージェントなら、OpenWorker は知識労働者向けローカルエージェント」に近い。ただし Goose もコード以外の業務へ拡張しており、差別化は成果物志向 UX と承認レイヤーの型化程度に狭まる。Andrew Ng のネームバリューが初期採用を牽引するが、技術的堀は現時点では明確ではない。

---

## 5. Getting Started

### 5.1 バイナリインストール（推奨）

| OS | ダウンロード | 備考 |
| --- | --- | --- |
| macOS 12+（Apple Silicon） | download.openworker.com/mac | 署名・公証済み、自動更新 |
| Windows 10/11（x64） | download.openworker.com/windows | 未署名、SmartScreen 警告あり |

インストール後の手順:

1. アプリを起動
2. モデル提供者を選び API キーを入力（または Ollama エンドポイントを指定）
3. 必要なコネクタを認証（OAuth または手動 API キー）
4. 実際の業務指示を入力

### 5.2 完全ローカル構成（キーなし）

```bash
# Ollama インストール後にモデル準備
ollama pull qwen3
# アプリ設定で provider を Ollama、エンドポイントを http://localhost:11434 に指定
```

この構成では外部へ出るデータはない。ただしツール呼び出しの安定性は別途検証が必要。

### 5.3 ソースビルド

前提要件: Python 3.10+、Node 20+、Rust ツールチェーン（rustup、デスクトップシェルビルド時）

```bash
git clone https://github.com/andrewyng/openworker
cd openworker

# 1. 初回一度だけブートストラップ（.venv 作成）
#    Windows は Git Bash または WSL で実行
bash packaging/setup_dev_env.sh

# 2. ローカルエージェントサーバ起動
.venv/bin/openworker-server --cwd ~/some/project --port 8765
#    Windows: .venv\Scripts\openworker-server.exe

# 3. 別ターミナルで UI 起動
cd surfaces/gui
npm install
npm run dev          # Vite 開発サーバベースのブラウザ UI
```

ブラウザ UI の代わりにデスクトップアプリ全体を動かす場合は、3 を `npm run tauri dev` に置き換える。Tauri シェルがサーバプロセスまで管理する。

テストとパッケージング:

```bash
.venv/bin/pytest                    # バックエンドテスト
cd surfaces/gui && npm test         # GUI ユニットテスト
cd surfaces/gui && npm run e2e      # E2E テスト
bash packaging/build_dmg.sh         # macOS DMG
pwsh packaging/build_windows.ps1    # Windows インストーラ
```

### 5.4 リポジトリ構造

| ディレクトリ | 内容 |
| --- | --- |
| `coworker/` | Python バックエンド: エージェントエンジン、モデル提供者、コネクタ、MCP クライアント、メモリ、自動化 |
| `surfaces/gui/` | React UI + Tauri シェル |
| `stt/` | 音声入力用 Rust STT サイドカー |
| `packaging/` | インストーラビルド、自動更新マニフェスト、開発環境ブートストラップ |
| `docs/` | 設計文書、意思決定ログ |
| `tests/` | バックエンドテストスイート |

### 5.5 導入前チェック項目

| 点検 | 判断基準 |
| --- | --- |
| データ機密度 | 社内機密を扱うなら Ollama 専用構成以外に選択肢はない |
| 承認ポリシー | 組織展開時は exec/external 等級の既定ポリシーを明文化すること |
| コネクタ権限 | OAuth スコープは最小権限に制限。Gmail・Slack 全権限付与は避ける |
| コスト上限 | モデル提供者側で使用量上限を先に設定すること |
| 代替比較 | 開発作業比率が高いなら Goose または OpenHands を先に検討 |

---

## 参考

- 公式サイト: https://openworker.com
- リポジトリ: https://github.com/andrewyng/openworker
- 基盤ライブラリ: https://github.com/andrewyng/aisuite
- 公開発表: https://x.com/AndrewYNg/status/2080333504446108104

#OpenWorker #AndrewNg #AIエージェント #OpenSource #業務自動化 #生成AI #LLM
