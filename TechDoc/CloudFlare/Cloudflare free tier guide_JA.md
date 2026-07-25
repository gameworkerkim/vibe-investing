---
title: "Cloudflare無料ティア登録ガイド"
subtitle: "Azureからの移行を見据えた、Workers・Pages・R2・KVの無料枠と段階的マイグレーション計画"
description: "Cloudflareの無料ティアへの登録手順、Workers・Workers KV・R2・Pagesの無料枠の実用的な見積もり、Azure Functions+Blob Storageからの段階的マイグレーション計画、初回セットアップ、そして運用上の4つの注意点をまとめたガイド。"
abstract: |
  Azure→Cloudflareへの移行を検討する観点で書かれたガイドである。既存のAzure Functions+Blob Storageアーキテクチャを、クレジットカード不要のCloudflare無料ティア(Workers・Pages・R2・KV)でどこまで代替できるかを、DAU 1,000規模のアプリを例に実務的な数値で示す。
  登録手順(3分)、無料枠の実用見積もり、静的アセット→R2→Workersの3段階マイグレーション計画、Wrangler CLIによる初回セットアップ、そしてPythonサポートの制限・KVの結果整合性・日次リセットのリスク・DeepSeek API呼び出しレイテンシという4つの実務的な注意点を提示する。
summary_for_ai: |
  本書はAzureからCloudflareへの移行を検討する開発者向けの、Cloudflare無料ティア登録・利用ガイドである。
  登録は3ステップ(アカウント作成、ドメイン追加は任意、2FA有効化)でクレジットカード不要。DAU 1,000規模を基準に、Workers(10万req/日)、Workers KV(読み取り10万/日、書き込み1,000/日)、R2(ストレージ10GB、egress無料)、Pages(帯域幅無制限)、Workers AIの無料枠を実用的に見積もる。
  推奨マイグレーションは3段階: (1) 静的アセットのみをPagesへ(低リスク、2-3時間)、(2) Azure BlobをR2へ(Super Slurper/Sippyで自動移行)、(3) Azure FunctionsをWorkersへ(ローンチ14日後に検討、リスク高)。
  Wrangler CLIのインストール・ログイン、初回Pagesデプロイ、初回R2バケット作成の手順を含む。
  4つの注意点: WorkersのPythonサポートは限定的(Pyodide/WASM、native C拡張は不可)、KVの結果整合性(最大60秒の遅延)、無料枠の日次リセットによるピーク時間帯のリスク、DeepSeek API呼び出しレイテンシがユーザー体感latencyの大半を占める点。
date: 2026-05-12
author: "Dennis Kim"
lang: ja
tags:
  - Cloudflare
  - 無料ティア
  - Workers
  - R2
  - Pages
  - Azure移行
keywords:
  - Cloudflare無料ティア登録
  - Cloudflare Workers無料枠
  - Azure Functions Cloudflare移行
  - Cloudflare R2 Azure Blob移行
  - Wrangler CLI使い方
  - Cloudflare Pages デプロイ
group: cloud-free
featured: false
schema_type: TechArticle
draft: false
---

# Cloudflare無料ティア登録ガイド(日本語)

> Azure→Cloudflareへの移行という観点で執筆。Azure Functions+Blob Storageの既存アーキテクチャのマイグレーション検討用。

---

## 1. 登録手順 — 3分で完了

### Step 1. アカウント作成

1. https://dash.cloudflare.com/sign-up にアクセス
2. メールアドレス+パスワードを入力(またはGitHub SSOも可)
3. メール認証(スパムフォルダも確認)

クレジットカードの入力は不要。Workers/Pages/R2/KVの無料ティアはすべてクレジットカードなしで即座に利用可能。

### Step 2. ドメインの追加(任意)

既存のドメインがある場合:

1. Dashboard → Add a Site
2. ドメインを入力 → Freeプランを選択
3. ネームサーバーの変更(ドメイン登録業者側でCloudflareのns1/ns2に変更)

既存ドメインがなければスキップしてよい。`*.workers.dev`または`*.pages.dev`のサブドメインを利用できる。

### Step 3. 2FAの有効化(強く推奨)

1. My Profile → Authentication
2. Two-factor Authentication → Enable
3. Google AuthenticatorまたはAuthyで登録

Cloudflareアカウントが乗っ取られると全サービスに影響する。2FAはオプションではなく必須である。

---

## 2. 無料枠 — アプリ観点での見積もり

### Workers(サーバーレス関数)

| 項目 | 無料枠 | 見積もり使用量(DAU 1,000) |
|------|-----------|------------------------------|
| Requests | 10万/日 | DAU 1,000 × 100 req = 10万(限界に近い) |
| Request当たりCPU時間 | 10ms | LLM呼び出しはwait時間(CPU時間ではない)、安全 |
| Subrequests | 50/呼び出し | 十分 |
| Scriptサイズ | 1 MB | 十分 |

DAU 1,000までは無料で可能。DAU 5,000+ではWorkers Paid($5/月)への移行が必要。

### Workers KV(キーバリューキャッシュ)

| 項目 | 無料枠 | アプリ使用量 |
|------|-----------|-----------|
| Reads | 10万/日 | cache hit率80% × DAU 1,000 × 100 req = 8万(安全) |
| Writes | 1,000/日 | LLM応答の新規キャッシング時に使用 |
| Deletes | 1,000/日 | 十分 |
| List | 1,000/日 | ほとんど使用しない |
| Storage | 1 GB | text-onlyキャッシュなら十分 |
| Value size limit | 25 MB/key | LLM応答1件は数KB、十分 |

cache hit率80%で運用すれば完全に無料枠内に収まる。

### R2(オブジェクトストレージ、Azure Blobの代替)

| 項目 | 無料枠 | アプリ使用量 |
|------|-----------|-----------|
| Storage | 10 GB | Azure Blob現在の使用量は1 GB未満と推定 |
| Class A operations(writes) | 100万/月 | 十分 |
| Class B operations(reads) | 1,000万/月 | 非常に十分 |
| Egress(帯域幅) | 無制限・無料 | 決定的な差別化要素 |

egress無料がR2の最大の利点。Azure Blobのegress課金負担が消える。

### Pages(静的サイト)

| 項目 | 無料枠 |
|------|-----------|
| Bandwidth | 無制限 |
| Builds | 500/月 |
| Concurrent builds | 1 |
| Custom domains | 100 |
| Sites | 無制限 |

フロントエンドホスティングには完全に十分。Azure Static Web Appsと同等。

### Workers AI(任意利用)

| 項目 | 無料枠 |
|------|-----------|
| Neurons | 1万/日(≈5,000-10,000リクエスト) |
| Models | Llama 3.x、DeepSeekなど |

DeepSeek APIを直接利用しているなら不要。ただし代替LLMのバックアップとしては有用。

### リセットのタイミング

すべての無料枠のリセット: 毎日UTC 00:00(韓国時間09:00)

---

## 3. 推奨マイグレーション段階

### Phase 1. 静的アセットのみ(低リスク、2-3時間)

```
Azure Static Web Apps -> Cloudflare Pages
- フロントエンド(HTML/CSS/JS)をPagesにデプロイ
- LLM呼び出しはAzure Functionsのまま維持
- 変更点: フロントエンドのAPIエンドポイントURLのみ更新
```

- リスク: 非常に低い(フロントエンドのみ移動)
- 効果: 韓国ユーザーの初回ページロードが50-100ms短縮

### Phase 2. BlobをR2へマイグレーション(ローンチ後に推奨)

```
Azure Blob Storage -> Cloudflare R2
- Super SlurperまたはSippyで自動マイグレーション
- S3互換APIのためコード変更は最小限
- egressコストの節約効果が大きい
```

- リスク: 中程度(URL構造の変更)
- 効果: egressの無料化+edgeキャッシュの強化

### Phase 3. 関数をWorkersへ移動(ローンチ14日後に検討)

```
Azure Functions (Python) -> Cloudflare Workers (JS/TS or Python WASM)
- DeepSeek API呼び出しをfetch()で再実装
- 4-tierキャッシュをWorkers KV + Cache APIで再設計
```

- リスク: 高い(ランタイム環境が異なる)
- 効果: コールドスタートが解消、edgeレイテンシがさらに短縮
- 推奨タイミング: ローンチ+14日間のburn-inデータを踏まえた後

---

## 4. 登録後の初回セットアップ — 5分

### Wrangler CLIのインストール

```bash
# Node.js 18+が必要
npm install -g wrangler

# ログイン(ブラウザ認証)
wrangler login

# 確認
wrangler whoami
```

### Pagesの初回デプロイ(静的サイトのテスト)

```bash
# Git連携
# Dashboard -> Pages -> Connect to Git
# GitHubリポジトリを連携 -> mainブランチで自動ビルド

# または直接デプロイ
wrangler pages deploy ./build --project-name=my-test
```

デプロイ後: `https://my-test.pages.dev`

### R2バケットの初回作成

```bash
# 無料枠内でバケットを作成
wrangler r2 bucket create my-blob

# ファイルアップロードのテスト
wrangler r2 object put my-blob/test.txt --file ./test.txt
```

---

## 5. 4つの注意点

### 注意1. WorkersのPythonサポートは限定的

```
サポート対象: Pyodideベースのwasm(限定的なstdlib)
非サポート: native C依存パッケージ(numpyの一部、asyncioなど)
```

自分のアプリコードがどのPythonパッケージに依存しているか確認する必要がある。純粋なPython+fetchであれば移植可能、複雑な依存関係があればJavaScript/TypeScriptへの再実装が必要。

### 注意2. KVのconsistencyはeventual(結果整合性)

```
KVへの書き込み -> 他のedge locationからは最大60秒後に読み取り可能
即時整合性が必要なデータ(例: ユーザーセッション)には不適合
```

ユーザーセッションのようなstrong consistencyが必要なデータにはDurable Objectsを使用する(Workers Paid $5/月が必要)。

### 注意3. 無料枠の日次リセットのリスク

```
Workers requests 10万/日 = 時間当たり平均4,166 req
peak hour(例: 米国市場終了直後の韓国時間22:30)に時間当たり10K req発生した場合
-> 10万の上限が午後に消耗
-> 次のUTC 00:00(韓国時間09:00)までサービス停止
```

peak hourの監視は必須。ユーザー1,000人に達した時点でWorkers Paid($5/月)への移行を推奨。

### 注意4. DeepSeek API呼び出しのレイテンシがボトルネック

```
Cloudflare edge: 10-50ms
DeepSeek API: 2,000-8,000ms(LLM推論)
ユーザー体感latency: 95%以上がLLM呼び出し
```

Cloudflareマイグレーションの体感効果はfirst-page-loadに集中する。LLM応答時間そのものは変わらない。マイグレーションのROI計算時には正直に反映する必要がある。

---

## 参考資料

- 登録: https://dash.cloudflare.com/sign-up
- Workers無料枠: https://developers.cloudflare.com/workers/platform/pricing/
- R2無料枠: https://developers.cloudflare.com/r2/pricing/
- KV無料枠: https://developers.cloudflare.com/kv/platform/pricing/
- Pages無料枠: https://www.cloudflare.com/plans/developer-platform/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/
- Super Slurper(S3 -> R2マイグレーション): https://developers.cloudflare.com/r2/data-migration/super-slurper/
