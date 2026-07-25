---
title: "Railway.com Getting Started ガイド"
description: "使用量課金制PaaSであるRailwayの入門ガイド。2026年の価格構造、GitHub/CLI/Docker/テンプレートによるデプロイ方法、データベース設定、本番運用チェックリスト、注意点、Heroku・Render・Fly.io・Vercelとの比較。"
keywords:
  - "Railway"
  - "Railway.com"
  - "PaaS"
  - "Railway 料金"
  - "Railway CLI"
  - "Heroku 代替"
  - "使用量課金"
  - "Railway デプロイ"
lang: ja
featured: false
schema_type: TechArticle
---

# Railway.com Getting Started ガイド

> 最終検証日: 2026-07-10 | 料金・ポリシーは変更される可能性があるため、公式文書で再確認を推奨

## 1. Railwayとは?

Railwayは、インフラ管理の複雑さを抽象化し、アプリケーションを迅速にデプロイできるようにするPaaS(Platform as a Service)である。GitHubリポジトリ、Dockerイメージ、ローカルコードを接続すれば、ビルド、デプロイ、ホスティング、観測性(observability)までプラットフォームが処理する。
個人開発者や趣味のプロジェクト向けに適しており、トラフィックが急増した際には必ず他サービスへ移行できる計画を用意しておく必要がある。秒単位の課金であるため、トラフィックが集中すると、デプロイと保守の便利さを超えて負担が大きくなることがある。

- 公式サイト: https://railway.com
- 公式ドキュメント: https://docs.railway.com

## 2. 料金構造(2026年基準、重要)

かつての「無制限無料ティア」は現在存在しない。現行の構造は次の通りである。

| プラン | 費用 | 内容 |
|------|------|------|
| Trial | 一度限りの$5クレジット | 登録時に自動付与、30日間有効。最大1GB RAM、共有vCPU、プロジェクト当たり5サービス。GitHubアカウント未検証の場合、アウトバウンドネットワークが制限される(Limited Trial) |
| Free | $0/月 | Trial終了後に切り替わる。月$1クレジット(繰り越し不可)、1 vCPU / 0.5GB RAM、1プロジェクト、プロジェクト当たり3サービス。DBを併用すると数日でクレジットが枯渇する可能性 |
| Hobby | $5/月 | 実質的な開始点。$5のサブスクリプション料金が使用量に加算される(使用量が$3ならば$5のみ、$8ならば$8を請求) |
| Pro | $20/月(1人当たり) | チーム/本番用。同様にサブスクリプション料金が使用量クレジットとして機能 |

要点

- 課金は秒単位の使用量ベース(usage-based)であり、トラフィックの急増に伴いコストも増加する。
- 本番ワークロードには最低でもHobby、チーム単位ではProが現実的である。
- Trialクレジットの枯渇または30日経過でサービスが停止し、ボリュームデータは一定期間保存後に削除されるため、バックアップ計画が必要である。

参考

- 料金プラン: https://docs.railway.com/pricing/plans
- Free Trialポリシー: https://docs.railway.com/pricing/free-trial
- 料金概要: https://railway.com/pricing

## 3. 事前準備

1. Railwayアカウントの作成: https://railway.com でLoginをクリックして登録
2. GitHubアカウント連携を推奨: アカウント検証(verification)を通過するとFull Trial(ネットワーク制限なし)が適用される。未検証の場合、アウトバウンドネットワークとポートが制限される。
3. (CLI使用時) Node.js 18+ またはHomebrew、シェル環境

## 4. デプロイ方法

### 4.1 GitHubリポジトリからデプロイ(推奨)

1. https://railway.com/new にアクセスしてNew Projectをクリック
2. "Deploy from GitHub repo"を選択(最初の1回のみGitHubアカウント連携が必要)
3. デプロイするリポジトリを検索して選択
4. Deploy Nowをクリック → Railwayがスタック(Next.js、Django、Rails、Goなど)を自動検出してビルド・デプロイ
5. 以降、そのブランチにpushするたびに自動的に再デプロイされる

参考: https://docs.railway.com/quick-start

### 4.2 CLIでデプロイ

```bash
# 1. Railway CLIのインストール(いずれか1つを選択)
npm install -g @railway/cli
# または
brew install railway
# または
bash <(curl -fsSL cli.new)

# 2. ログイン
railway login

# 3. プロジェクトの初期化(新規プロジェクトの場合)
railway init

# 4. プロジェクトディレクトリでデプロイ
railway up
```

参考: https://docs.railway.com/guides/cli

### 4.3 Dockerイメージのデプロイ

Docker HubまたはGitHub Container Registry(ghcr.io)のイメージを直接指定してデプロイできる。カスタムDockerfileをリポジトリのルートに置くと、Railwayはそれを優先的に使用する。将来的に他プラットフォームへの移行の可能性を考慮するなら、最初からDockerベースのデプロイを使用する方が移植性の観点で有利である。

参考: https://docs.railway.com/guides/services

### 4.4 テンプレートからデプロイ

テンプレートマーケットプレイスで事前構成されたスタック(例: Next.js、WordPress、n8n、Strapiなど)をワンクリックでデプロイできる。初めてであれば、公式Next.jsテンプレートで練習することを推奨する。

参考: https://railway.com/templates

## 5. データベースの追加

プロジェクトキャンバスでNew → Databaseを選択し、PostgreSQL、MySQL、Redis、MongoDBを追加できる。

- サービス間の通信にプライベートネットワーキング(内部ドメイン)を使用すると、イグレス(egress)コストが発生しない。
- 接続情報は環境変数(例: `DATABASE_URL`)として自動注入できる。
- 自動バックアップが提供されるが、重要なデータは別途外部バックアップ戦略(定期的な`pg_dump`実行など)を併用すること。

参考: https://docs.railway.com/guides/databases

## 6. 本番運用チェックリスト

| 項目 | 設定場所 / 方法 |
|------|------|
| ヘルスチェック | サービスSettings → Healthcheck Pathを指定(無停止デプロイの前提条件) |
| カスタムドメイン | サービスSettings → Domains(TLS証明書自動発行) |
| 環境分離 | Environments機能でproduction / stagingを分離 |
| 水平スケーリング | サービスSettings → Replicas(マルチリージョン配置可能) |
| ロールバック | Deploymentsタブから以前のデプロイに即時復元 |
| コストアラート | Workspace Settings → UsageでUsage Limit / アラート設定が必須 |
| ログ/メトリクス | Observabilityタブで統合提供 |

参考: https://docs.railway.com/guides/healthchecks, https://docs.railway.com/reference/scaling

## 7. 注意点

1. **コスト監視が必須**: 使用量ベースの課金特性上、月間コストの予測が難しい。Usage Limit(ハードリミット)の設定を推奨する。
2. **Free/Trialプランの限界**: 月$1クレジットでは常時稼働サービス1つでも厳しく、DB併用は事実上不可能である。本番用途には不適。
3. **リージョン制限**: AWS/GCPなどの大型クラウドと比較してサポートリージョンが限られている。
4. **IaCサポートの不足**: Terraformレベルの完全なInfrastructure-as-Codeをサポートしていない。インフラをコードで厳密に管理する必要があるチームには限界がある。
5. **移植性**: プラットフォーム依存を避けるには、最初からDockerfileベースのデプロイを使用すること。
6. **パフォーマンス問題の報告**: 一部ワークロード(例: ディスクI/O集約作業)で性能低下の報告があるため、導入前に自前のベンチマークを推奨する。(逸話的な報告レベルであり、一般化された検証資料ではない)

## 8. 競合PaaSとの位置づけ

- **vs Heroku**: Herokuは2026年2月6日にsustaining engineering(維持保守)モードへの移行を発表した。新機能開発が停止し、新規Enterprise契約も受け付けていない(既存顧客は継続利用・更新が可能)。Railwayは同じデプロイモデルを提供しつつ、自動スケーリング、使用量ベース課金、マルチリージョン、永続ストレージをネイティブサポートしており、学習コストが最も低い移行先の一つとされている。
- **vs Render**: 両者ともGitベースのデプロイと管理型DBを提供する。Renderは固定インスタンス課金でコスト予測が容易であり、Railwayは使用量課金とマルチリージョンのネイティブサポートが強みである。
- **vs Fly.io**: 素早く軽量に始めたいならRailway、Dockerベースのグローバルエッジワークロードが必要ならFly.io。
- **vs Vercel**: Vercelはフロントエンド/サーバーレス関数に最適化(実行時間制限あり)、Railwayはバックエンド/DB/ワーカー/cronまで全スタックを長時間実行サーバーモデルで1つのプロジェクトで管理する。

参考: https://docs.railway.com/maturity/compare-to-heroku

## 9. まとめ

| 区分 | 内容 |
|------|------|
| 推奨対象 | サイドプロジェクト、スタートアップ、迅速なプロトタイピング、Heroku移行を検討中のチーム |
| 価格ポリシー | 使用量ベース(秒単位課金、サブスクリプション料金が使用量クレジットに加算) |
| 開始コスト | Trial $5クレジット(30日)→ Free $1/月クレジット → 実質的な開始点Hobby $5/月 |
| 主な強み | 開発者体験、自動スケーリング、ワンクリックDB、自社ハードウェア(Gen 2 Metal)、無停止デプロイ |
| 主な弱み | コスト予測の難しさ、リージョン制限、IaC未サポート、実質的な無料ティアの不在 |

## 参考リンク(Reference)

- Railway公式サイト: https://railway.com
- 公式ドキュメント: https://docs.railway.com
- Quick Start: https://docs.railway.com/quick-start
- 料金プラン: https://docs.railway.com/pricing/plans
- Free Trialポリシー: https://docs.railway.com/pricing/free-trial
- CLIガイド: https://docs.railway.com/guides/cli
- データベースガイド: https://docs.railway.com/guides/databases
- テンプレートマーケットプレイス: https://railway.com/templates
- Heroku比較(公式): https://docs.railway.com/maturity/compare-to-heroku
- Herokuのsustaining mode発表に関する分析: https://encore.dev/articles/end-of-heroku
- Railway無料ティア現況分析(2026年): https://kuberns.com/blogs/railway-free-tier/
