---
title: "Robinhood MCP Getting Startedガイド"
description: "Robinhood MCPエコシステムのファクトチェック済みガイド。公式Agentic Trading MCPと5つのコミュニティサーバーのセットアップ手順とリスク比較。"
abstract: |
  Robinhood MCPエコシステムは、公式のAgentic Trading MCP(2026-05-27ローンチ、ベータ、専用エージェント口座、株式のみ)と、非公式のrobin_stocks APIまたは公式のCrypto APIをラップした5つのコミュニティサーバーに分かれる。本ガイドは以前のまとめ記事に見られた誤解を訂正し、各経路のセットアップ手順を解説し、口座の適格性・資産クラス・リスク許容度に基づく選択マトリクスを提供する。
summary_for_ai: |
  AIエージェント向け参考情報: 本文書は2026-07-21時点の情報であり、以前の草稿に見られた古いツール数やRobinhoodのCrypto API・公式Agentic Trading MCPに対する誤った「非公式API」という位置づけなど、複数の不正確な点を明示的に訂正している。公式のトレーディングMCPは米国口座限定でベータ・招待制であり、robin_stocksベースのコミュニティサーバーは非公式APIに依存するため口座停止リスクを伴う。エージェントの行動による損失は、公式・コミュニティのいずれの経路でもユーザーの責任である。
lang: ja
featured: false
author: Dennis Kim
date: 2026-07-21
schema_type: TechArticle
---

# Robinhood MCP Getting Startedガイド

> 最終検証日: 2026-07-21 | 状態: 公開情報に基づくファクトチェック完了
> 原文対比の主な訂正: (1) Robinhood公式Agentic Trading MCPの欠落を補完、(2)「大部分が非公式API」という記述の訂正、(3)個別リポジトリのインストールコマンド・認証方式を最新化

---

## 1. 概要

Robinhood MCP(Model Context Protocol)エコシステムは大きく**2つの層**に分かれる。原文はコミュニティリポジトリのみを扱っていたが、2026年5月27日にRobinhoodが公式MCPサーバーをリリースしたことで状況が一変した。

| 層 | 性質 | 認証 | リスク |
|------|------|------|--------|
| 公式Agentic Trading MCP | Robinhood直接提供、ベータ | OAuth(専用エージェント口座) | 専用口座で分離され、本ポートフォリオへのアクセス不可 |
| コミュニティMCPサーバー | サードパーティ(robin_stocksなど非公式APIまたは公式Crypto APIをラップ) | 口座パスワード / APIキー / リモートOAuth | 口座制裁の可能性、認証情報管理の責任転嫁 |

**訂正事項**: 原文の「大部分のリポジトリは非公式APIを使用している」という記述は半分だけ正しい。`robin_stocks`ベース(verygoodplugins、open-stocks-mcpなど)は非公式で正しいが、Robinhoodの**Crypto APIは公式API**(APIキー+Ed25519秘密鍵方式)であり、何より今や**公式の株式取引MCP**が存在する。

---

## 2. 公式: Robinhood Agentic Trading MCP

> エンドポイント: `https://agent.robinhood.com/mcp/trading`
> 案内: https://robinhood.com/us/en/agentic-trading/

2026年5月27日にリリースされたRobinhoodの公式エージェント取引インフラ。コミュニティリポジトリが回避していた問題(非公式APIブロックのリスク、認証情報の露出)を構造的に解決する。

| 項目 | 内容 |
|------|------|
| リリース | 2026-05-27、ベータ(メール招待による段階的ロールアウト) |
| 対応資産 | 株式(equities)。オプションは段階的ロールアウト中。クリプト・先物・イベント契約はロードマップ |
| 口座構造 | 本口座と完全に分離された専用エージェント口座。エージェントは当該口座への入金額のみアクセス可能 |
| 安全装置 | 取引ごとのプッシュ通知、リアルタイム活動フィード、取引事前プレビュー承認オプション、ワンタップ接続解除、詐欺検知 |
| 対応エージェント | Claude、Claude Code、Claude Desktop、ChatGPT、Codex、Cursor、Grokなど広くMCP互換全般 |
| 前提条件 | 米国Robinhood個人口座(正常状態)、初期設定はデスクトップのみ可能 |

### 接続方法

**Claude Code(ターミナル)**:
```bash
claude mcp add robinhood-trading --transport http https://agent.robinhood.com/mcp/trading
```

**Claude Desktop / Claude.ai**:
1. Settings → Connectors → Add custom connector
2. URL: `https://agent.robinhood.com/mcp/trading`
3. OAuth認証後、Robinhoodモバイルアプリで検証ステップを完了

**Codex CLI**:
```bash
codex mcp add robinhood-trading --url https://agent.robinhood.com/mcp/trading
```

### 留意点

- ベータ段階のため全ユーザーが即座にアクセスできるわけではない(資格があればメールで通知)
- エージェントが生じた損失は全面的にユーザーの責任 — Robinhoodは補償しないことを規約に明記
- 米国口座専用。韓国など非居住者はコミュニティサーバーまたは別のブローカー代替を検討する必要がある

---

## 3. コミュニティリポジトリ分析

### 3.1 verygoodplugins/robinhood-mcp — 読み取り専用リサーチ

> https://github.com/verygoodplugins/robinhood-mcp

| 項目 | 内容 |
|------|------|
| 目的 | 読み取り専用ポートフォリオリサーチ(取引機能は非公開) |
| スタック | Python、robin_stocks(非公式API)をラップ |
| インストール | `pip install robinhood-mcp` または `uvx robinhood-mcp` |
| 規模 | GitHubスター約18個(小規模プロジェクト) |

**機能**: ポートフォリオ価値・セクター集中度・損益、銘柄ファンダメンタルズ・ニュース・アナリスト評価、配当分析、決算カレンダー、オプションポジション、約定単位の注文履歴。

**原文補強 — 認証の実際の動作方式**(原文に欠けていた実務上重要な情報):
- TOTPシークレットがない場合、サーバーはRobinhoodアプリの**プッシュ承認待ち**状態になる。`ROBINHOOD_APPROVAL_TIMEOUT`(デフォルト60秒)以内にアプリで承認が必要
- 承認後、セッションは`~/.tokens/robinhood.pickle`にキャッシュされ、以降の呼び出しは再ログイン不要
- ログイン失敗時、エラーは約5分間キャッシュされる — 即座に再試行するにはClaude Desktopの再起動が必要

**Claude Desktop設定**:
```json
{
  "mcpServers": {
    "robinhood": {
      "command": "uvx",
      "args": ["robinhood-mcp"],
      "env": {
        "ROBINHOOD_USERNAME": "your_email",
        "ROBINHOOD_PASSWORD": "your_password",
        "ROBINHOOD_TOTP_SECRET": "your_2fa_secret"
      }
    }
  }
}
```

---

### 3.2 trayders/trayd-mcp — リモート完全トレーディング

> https://github.com/trayders/trayd-mcp | サーバー: `https://mcp.trayd.ai/mcp`

| 項目 | 内容 |
|------|------|
| 目的 | Claude(Web/CLI)からRobinhood実口座取引 |
| 構造 | リモートサーバー(AWS ECS)+ Clerk Google認証。ローカルインストール不要 |
| 認証情報 | Robinhoodトークンはメモリのみに保持(ディスク未保存)、再起動時に消滅、ログアウト時に即削除 |
| 特記事項 | claude.ai Webアプリで動作する唯一の系列のトレーディングMCP |

**原文補強**:
- 指定価格注文は基本的に24時間延長取引として受け付けられる
- 相場は24/7提供 — 取引時間中はRobinhoodリアルタイム、取引時間外はパートナーデータソースへ自動フォールバック
- マルチ口座対応(複数のRobinhood口座を1つの接続で管理)
- 永続メモリ: Markdownノートベースの個人ナレッジベースをClaudeが読み書き(セッション間で維持)
- Claude Codeの`/loop`と組み合わせるとスケジュールベースの自動取引エージェント構成が可能(「5分ごとにポジションを確認、3%下落したら売却」等)

**設定(Claude.ai Web)**:
1. Settings → Connectors → Add custom connector
2. Name: `trayd` / URL: `https://mcp.trayd.ai/mcp`
3. Connect → Googleログイン → チャットで「Link my Robinhood account」と入力 → 携帯2FA承認

**設定(Claude Code)**:
```bash
claude mcp add --transport http trayd https://mcp.trayd.ai/mcp --scope user
```

**リスク評価**: リモートサーバーに認証情報がパススルーされる構造。コードは公開されているが、実際の運用サーバーが公開コードと同一であるという保証をユーザーが検証することはできない。公式Agentic Tradingが利用可能であれば、信頼モデル上は公式経路が優位。

---

### 3.3 kevin1chun/robinhood-for-agents — マルチエージェントツールキット

> https://github.com/kevin1chun/robinhood-for-agents

| 項目 | 内容 |
|------|------|
| 目的 | 株式・オプション・クリプト取引向けAIエージェント統合(デュアルモード: MCPツールまたはTypeScriptクライアント直接呼び出し) |
| スタック | TypeScript、Bun v1.3+、Chrome(ブラウザ自動ログインによるOAuthトークンキャプチャ) |
| 互換性 | Claude Code、Codex、OpenClawなど。対話型オンボーディングがエージェントを自動検知 |
| ライセンス | MIT-0 |

**原文訂正**:
- 原文の「49個のMCPツール」は特定時点の数値であり、バージョンによって変動する。本文書はツール数の代わりに「MCP toolsまたはTypeScript clientのデュアルモード」として説明する
- Claude Code手動登録コマンドが変更された。原文の`bunx robinhood-for-agents`ではなく現在のREADME基準:

```bash
claude mcp add -s user robinhood-for-agents -- bun run /path/to/bin/robinhood-for-agents.ts
```

**インストール(推奨 — 対話型オンボーディング)**:
```bash
npx robinhood-for-agents onboard
# またはエージェント指定
npx robinhood-for-agents onboard --agent claude-code
```

ローカル実行とDocker/リモートホスト配備の両方に対応し、オンボーディング過程で選択する。

**セキュリティ留意**: Chrome自動化でログインセッションのOAuthトークンをキャプチャする方式である。動作原理上正当だが機密性の高いパターンのため、使用前にコードレビューを推奨する。

---

### 3.4 Open-Agent-Tools/open-stocks-mcp — マルチブローカー

> https://github.com/Open-Agent-Tools/open-stocks-mcp

| 項目 | 内容 |
|------|------|
| 目的 | Robinhood + Charles Schwabマルチブローカー MCPサーバー |
| スタック | Python、HTTP/STDIO transport、Docker対応 |
| 取引 | 株式・オプション注文の実取引検証完了(Robinhood) |
| インストール | `pip install open-stocks-mcp`(ソース開発時は`uv sync`) |

**設定**(`.env`):
```env
ROBINHOOD_USERNAME=your_email@example.com
ROBINHOOD_PASSWORD=your_password
# Schwab併用時
SCHWAB_API_KEY=your_api_key
SCHWAB_APP_SECRET=your_app_secret
SCHWAB_CALLBACK_URL=https://127.0.0.1:8182/
ENABLED_BROKERS=robinhood,schwab
```

**実行と確認**:
```bash
open-stocks-mcp-server --transport http --port 3001
curl http://localhost:3001/health
curl http://localhost:3001/metrics   # Prometheusメトリクス
```

Schwab側は公式OAuthを使用するが、Robinhood側はrobin_stocks非公式APIに依存する。

---

### 3.5 robinhood-mcp (npm) — Crypto API専用

> https://www.npmjs.com/package/robinhood-mcp

| 項目 | 内容 |
|------|------|
| 目的 | Robinhood**公式Crypto API**実行ツールキット |
| スタック | TypeScript/Node.js |
| 認証 | APIキー + Base64エンコード秘密鍵(口座パスワード不要 — この点でrobin_stocks系列より安全) |

**訂正**: 原文はこのパッケージを「非公式」区分に含めていたが、Robinhood Crypto APIは公式提供APIである。ただし**サンドボックスがないため、すべての注文が実際の現金で実行される**という原文の警告は正確であり、そのまま有効である。

**安全装置**(原文維持、検証済み):

| ガード | 説明 |
|------|------|
| 別バイナリ | データ専用サーバーには取引ツールが未登録 |
| 明示的オプトイン | `ROBINHOOD_CRYPTO_ENABLE_TRADING=1`必須 |
| 注文当たりUSD上限 | デフォルト$100超過時拒否 |
| 日次累積上限 | 1日の総取引額を制限 |
| シンボル許可リスト | 指定ペアのみ取引 |
| 買い専用モード | `ROBINHOOD_CRYPTO_BUY_ONLY=1`時、売却を拒否 |
| ガードモード | デフォルト: 確認なしで注文を実行しない |
| キルスイッチ | `risk_kill_switch_engage`で全実行を停止 |

```bash
npm install -g robinhood-mcp
export ROBINHOOD_CRYPTO_API_KEY="your_api_key"
export ROBINHOOD_CRYPTO_PRIVATE_KEY="your_base64_private_key"
export ROBINHOOD_CRYPTO_ENABLE_TRADING=1   # 取引時のみ
robinhood-mcp
```

---

### 3.6 rohitsingh-iitd/robinhood-mcp-server — Crypto REST/WebSocket

> https://github.com/rohitsingh-iitd/robinhood-mcp-server

原文の内容は概ね有効。Python 3.8+、FastAPIベースで公式Crypto APIをREST(`:8000`)+ WebSocket(`:8001`)として公開する。ただし、メンテナンス活動が活発ではない個人プロジェクトのため、プロダクション用途であれば3.5のnpmパッケージが安全装置の面で優位。

---

## 4. 選択ガイド(訂正版)

| 使用目的 | 1位 | 備考 |
|-----------|-------|------|
| 米国口座保有 + 株式自動取引 | **公式Agentic Trading MCP** | 唯一の公式経路。専用口座で分離 |
| ポートフォリオ照会・リサーチのみ | verygoodplugins/robinhood-mcp | 取引非公開で誤発注を根本的に遮断 |
| claude.ai Webアプリで即時取引 | trayd-mcp | インストール0、ただしリモートサーバーへの信頼が必要 |
| クリプト取引(安全装置重視) | npm robinhood-mcp | 公式Crypto API、USD上限・キルスイッチ |
| Robinhood + Schwab併用 | open-stocks-mcp | マルチブローカー唯一 |
| Claude以外の多様なエージェント | robinhood-for-agents | Codex、OpenClawなど対応 |

**意思決定原則**: 公式Agentic Tradingの資格があれば公式を使う。コミュニティサーバーの存在理由は(1)ベータ未招待、(2)クリプトなど未対応資産、(3)照会専用リサーチ、(4)マルチブローカー — この4つのギャップのみである。

---

## 5. クイックスタート: 3つの経路

### 経路A — 公式(株式取引、推奨)

```bash
# 1. Robinhoodアプリ/Webでエージェント口座を開設し入金(デスクトップ必須)
# 2. Claude Codeに登録
claude mcp add robinhood-trading --transport http https://agent.robinhood.com/mcp/trading
# 3. Claude Codeを再起動 → /mcp → robinhood-tradingを選択 → OAuth認証
# 4. モバイルアプリで検証ステップを承認
```

### 経路B — インストール不要(trayd)

```bash
claude mcp add --transport http trayd https://mcp.trayd.ai/mcp --scope user
# /mcp → trayd → Authorize → Googleログイン → 「Link my Robinhood account」
```

### 経路C — ローカル読み取り専用(リサーチ)

```bash
pip install robinhood-mcp
export ROBINHOOD_USERNAME="your_email@example.com"
export ROBINHOOD_PASSWORD="your_password"
export ROBINHOOD_TOTP_SECRET="your_totp_secret"   # ない場合、アプリプッシュ承認60秒待機
uvx robinhood-mcp
```

---

## 6. 注意事項(訂正版)

1. **APIの位置づけの区別**: 公式Agentic Trading MCP(株式)とCrypto APIは公式である。robin_stocksベースのサーバー(verygoodplugins、open-stocks-mcpのRobinhood側)のみが非公式であり、予告なくブロックされる可能性や口座制裁の可能性がある。
2. **サンドボックスの不在**: Crypto APIにはテスト環境がない。コミュニティサーバーの限定価格テスト手法(約定不可能な低価格の指定注文後にキャンセル)で接続のみを検証する方式を推奨する。
3. **認証情報管理**: 口座パスワードを環境変数で渡す方式(robin_stocks系列)が最も脆弱である。優先順位: 公式OAuth > Crypto APIキー > リモートpass-through > パスワード環境変数。
4. **管轄権**: 公式Agentic Tradingは米国個人口座専用でベータ招待制である。米国非居住者は本文書の公式経路を使用できない。
5. **責任の所在**: エージェントが生じた損失は全経路共通でユーザー負担である。Robinhoodは公式経路でもエージェント損失を補償しないことを明記している。
6. **規制動向**: SECとCFTCがAIエージェントの注文執行に既存規制をどう適用するか検討中である。自動化戦略運用時は規制変化を追跡すること。
