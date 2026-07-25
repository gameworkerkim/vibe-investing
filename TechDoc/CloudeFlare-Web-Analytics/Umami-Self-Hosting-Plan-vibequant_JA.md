---
title: "Umamiセルフホスティング導入計画 — vibequant.cc"
subtitle: "Cloudflare無料ティア上でVercel/Fly.io + Workerプロキシを現実的に組み合わせる"
description: "Umamiを完全にCloudflare上に構築せず、Vercelまたはfly.ioにアプリを置いてCloudflare Workerでファーストパーティ・プロキシする2つのシナリオの準備物・リスク・長所短所を整理する。"
abstract: |
  UmamiはPostgreSQL/MySQLのみを公式サポートし、Cloudflare D1・Workersにネイティブに構築する経路は現実的でない。
  vibequant.ccにはA(Vercel+Worker)とB(Fly.io+Worker)の2つの実用的な経路があり、複数サブドメイン戦略・build.mjs挿入・無料ティアの制限を併せて検討する必要がある。
  推奨はAで迅速に検証した後、安定性・コールドスタートが問題になればBに移行することである。
summary_for_ai: |
  Implementation plan for self-hosting Umami analytics on vibequant.cc (Cloudflare Pages free tier).
  Not pure Cloudflare (no D1/Workers-native Umami). Scenario A: Vercel + Neon/Supabase + CF Worker proxy.
  Scenario B: Fly.io Docker + Neon/Supabase + CF Worker proxy. Covers pros/cons, risks, multi-subdomain injection via build.mjs, APP_SECRET, ad-blocker bypass, free-tier limits.
date: 2026-07-25
author: "Dennis Kim"
lang: ja
tags:
  - Cloudflare
  - Umami
  - Analytics
  - Self-hosting
  - Free Tier
keywords:
  - Umami
  - vibequant.cc
  - Cloudflare Worker
  - Vercel
  - Fly.io
  - Neon
  - Supabase
  - first-party tracking
group: cloud-free
featured: false
schema_type: TechArticle
draft: false
---

# Umamiセルフホスティング導入計画 — vibequant.cc

## 1. はじめに:現実的なアプローチ

Umamiを**完全に**Cloudflare上に構築しようとする試みは魅力的ですが、**現実的には複雑度が高い経路**です。

Umamiは**PostgreSQLまたはMySQLのみを公式サポート**しており、Cloudflare D1(SQLiteベース)は公式サポートしていません。Cloudflare WorkersはV8 Isolate環境のため、Node.jsベースのUmamiをそのまま構築できず、データベースレイヤーを直接パッチする必要があります。そのパッチは更新ごとに壊れるリスクが大きいです。

そこで本ドキュメントでは、**「UmamiをCloudflareに極力近づけつつ、実用的に運用する」**2つの現実的なアプローチを検討します。対象サイトは、現在Cloudflare Pages無料ティアで運用中の[vibequant.cc](https://vibequant.cc)とそのサブドメインです。

関連背景:[Cloudflareウェブ分析ソリューションガイド](./CloudeFlare-Web-Analytics-Guide_JA.md)で推奨された「Web Analyticsで開始 → 必要時にUmami拡張」の実行計画にあたります。

| アプローチ | 説明 | 推奨状況 |
|--------|------|----------|
| **A. Vercel + Cloudflare Workerプロキシ** | Umamiアプリは Vercel、DBはNeon/Supabase、トラッキングはCloudflare Workerでプロキシ | 最も簡単で速い。検証・導入の第一候補 |
| **B. Fly.io + Cloudflare Workerプロキシ** | Umamiアプリは Fly.ioコンテナ、DBはNeon/Supabase、トラッキングはCloudflare Workerでプロキシ | コールドスタート・サーバーレス制約が気になる場合。若干の運用コスト・設定が必要 |

```
訪問者のブラウザ
    |
    |  script + /api/send  (analytics.vibequant.cc)
    v
Cloudflare Worker(ファーストパーティ・プロキシ)
    |
    v
Umamiアプリ (A: Vercel / B: Fly.io)  <-->  PostgreSQL (Neon または Supabase)
```

---

## 2. シナリオ比較まとめ

| 項目 | A. Vercel + Worker | B. Fly.io + Worker |
|------|--------------------|--------------------|
| 設定の難易度 | 低(約40〜60分) | 中(CLI、メモリスケール、デプロイ再試行) |
| 月額コスト(小規模) | 実質0円が可能 | 0円に近くならない場合もある(下記コスト節参照) |
| コールドスタート | Vercel Function + Neon/Supabase一時停止時に発生 | マシンがalways-onなら低い。スケール・トゥ・ゼロなら発生 |
| 運用の複雑さ | Fork同期、Vercelビルド上限 | Dockerイメージ、`fly scale`、IPv4 |
| データ所有 | DBはNeon/Supabase、アプリはVercel | DBはNeon/Supabase(またはFly Postgres)、アプリはFly |
| vibequant.ccへの適合度 | **第一推奨** | トラフィック・安定性問題後の移行用 |
| 広告ブロッカー回避 | Workerカスタムドメインで同様に可能 | 同様 |

**結論(推奨):** まず**A**で導入・検証し、Vercelのコールドスタート・Hobby上限・Prisma接続の問題が体感されたら**B**に移行します。Workerプロキシと`analytics.vibequant.cc`ドメイン設計は両方で再利用します。

---

## 3. アプローチA:Vercel + Cloudflare Workerプロキシ(推奨)

Umamiコミュニティで最も広く使われる組み合わせです。公式ガイド:[Running on Vercel](https://docs.umami.is/docs/guides/running-on-vercel)。

### 3.1 アーキテクチャ

```
訪問者のブラウザ
    |
    |  GET /u.js , POST /api/send
    v
Cloudflare Worker @ analytics.vibequant.cc
    |
    v
Vercel (Umami Next.js)  <-->  Neon または Supabase (PostgreSQL)
```

### 3.2 準備物

| 項目 | 備考 |
|------|------|
| GitHubアカウント | Umami fork用 |
| Cloudflareアカウント(無料) | すでにvibequant.ccのDNS/Pagesを運用中 |
| Vercelアカウント(Hobby) | GitHubログイン |
| NeonまたはSupabase | 無料PostgreSQL |
| `openssl`またはパスワード生成器 | `APP_SECRET`用 |
| vibequantビルドパイプラインの修正権限 | `VibeQuant/content/build.mjs`にスクリプトを挿入 |

### 3.3 段階別インストール

**Step 1: Umamiリポジトリのフォーク**

[umami-software/umami](https://github.com/umami-software/umami)を自分のGitHubアカウントにフォークします。

**Step 2: PostgreSQL作成**

[Neon](https://neon.tech)または[Supabase](https://supabase.com)でプロジェクトを作成し、接続文字列(`postgresql://...`)をコピーします。

- Neon:サーバーレスPostgres、アイドル時に一時停止(コールドスタート)する可能性がある
- Supabase:無料ティアのDB容量・接続上限を確認する必要がある

**Step 3: VercelへUmamiをデプロイ**

1. Vercelで**Add New → Project**からフォークした`umami`をインポート
2. 環境変数を設定:

| 変数名 | 値 | 備考 |
|--------|-----|------|
| `DATABASE_URL` | PostgreSQL接続文字列 | 必須。Neonの場合はpooled URLを推奨 |
| `APP_SECRET` | `openssl rand -hex 32`の結果 | v2以降基準。旧版文書の`HASH_SALT`は置き換えられた([Environment variables](https://docs.umami.is/docs/environment-variables)) |
| `TRACKER_SCRIPT_NAME` | 例:`u`または`vq-beacon` | デフォルトの`script.js`の代わりに使用してブロック確率を減らす |
| `COLLECT_API_ENDPOINT` | 例:`/api/e`(任意) | デフォルトの`/api/send`の代わりに使用可能 |
| `DISABLE_TELEMETRY` | `1`(任意) | Umami自身のテレメトリを無効化 |

3. デプロイ後、`.vercel.app`のURLを確認

**Step 4: Umami初期設定**

1. デプロイURLにアクセス
2. デフォルトアカウント:`admin` / `umami`([Login](https://docs.umami.is/docs/login))
3. **すぐにパスワードを変更**
4. Settings → Websitesでサイトを追加し**Website ID**をコピー

vibequantはホストが複数あるため、Websiteをどう分割するかをこのステップの前に決めます(下記[8. vibequant.ccの追加要件](#8-vibequantccの追加要件)参照)。

**Step 5: Cloudflare Workerプロキシ**

Workerは**トラッカースクリプトと収集APIの両方**をプロキシする必要があります。元の案のように`/api/send`だけを通すと、スクリプトの読み込みが壊れます。

例(パスは実際の`TRACKER_SCRIPT_NAME` / `COLLECT_API_ENDPOINT`に合わせて調整):

```javascript
const UMAMI_ORIGIN = "https://your-umami.vercel.app"; // Vercel Umami URL
const SCRIPT_PATH = "/u.js";          // TRACKER_SCRIPT_NAMEの結果に合わせる
const COLLECT_PATH = "/api/send";     // またはCOLLECT_API_ENDPOINT

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const isScript = path === SCRIPT_PATH || path === SCRIPT_PATH.replace(/\.js$/, "");
    const isCollect = path === COLLECT_PATH;

    if (!isScript && !isCollect) {
      return new Response("Not found", { status: 404 });
    }

    const upstream = new URL(path + url.search, UMAMI_ORIGIN);
    const headers = new Headers(request.headers);
    headers.set("Host", new URL(UMAMI_ORIGIN).host);
    // Cloudflare訪問位置ヘッダーがあればそのまま転送(Managed Transforms有効時)
    // CF-IPCountry, CF-IPCity など

    const init = {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "follow",
    };

    const response = await fetch(upstream, init);
    const out = new Response(response.body, response);
    out.headers.set("Access-Control-Allow-Origin", "*"); // 必要ならホストのホワイトリストに絞る
    return out;
  },
};
```

注意:

- 統計照会用のAPIトークンをWorkerのソースにハードコードしないこと。ダッシュボードはVercel URL(または別の保護されたパス)から直接アクセスします。
- プロダクションでは`UMAMI_ORIGIN`をWorkerの**Secrets / Vars**として保持します。

**Step 6: カスタムドメイン**

Workerに`analytics.vibequant.cc`を接続します。トラッキングがファーストパーティ(または同じ登録ドメインのサブドメイン)として見えれば、広告ブロッカー回避の確率が上がります。コミュニティの議論:[umami#1026](https://github.com/umami-software/umami/discussions/1026)。

**Step 7: vibequant.ccにトラッキングコードを挿入**

正しいスクリプトの形は以下の通りです(`src`は**スクリプトファイル**、`/api/send`ではない):

```html
<script
  defer
  src="https://analytics.vibequant.cc/u.js"
  data-website-id="YOUR_WEBSITE_ID"
></script>
```

静的HTMLは`content/build.mjs`の`layout()`で生成されるため、すべての`pages/**/index.html`を手動で修正するのではなく、**ビルドテンプレートの`<head>`**(例:`extraHead`または共通スニペット)に入れる方が安全です。その後、各Pagesプロジェクト(`vibequant-web`、`vibequant-tech`、`vibequant-cti`など)を再デプロイします。

### 3.4 長所短所

| 長所 | 短所 |
|------|------|
| 設定が最も速い。公式Vercelガイドと一致 | Hobbyプランのファンクション実行時間・同時実行数の上限 |
| Docker/CLI不要 | Neon/Supabaseのアイドル一時停止とVercelコールドスタートが重なる可能性 |
| コストを0円に近く維持しやすい | Forkをupstreamと定期的に同期する必要がある |
| WorkerプロキシはBに移行しても再利用可能 | Prisma + サーバーレスDB接続プールの問題が発生しうる(pooled URLがほぼ必須) |
| Next.jsネイティブホスティング | ダッシュボードもVercelにあるため、障害時にアプリ・収集が同時に影響を受ける |

### 3.5 リスク(A)

| リスク | 影響 | 緩和策 |
|--------|------|------|
| Neon/Supabaseの一時停止 | 最初のPVの遅延・ドロップ | 定期ping、または最小有料プラン、またはBへ移行 |
| Vercel Hobby上限超過 | デプロイ失敗・帯域制限 | トラフィック監視、必要時にProまたはBへ |
| 接続文字列をnon-pooledで使用 | 間欠的なDBエラー | Neon pooled / Supabase poolerのURL |
| デフォルトの`admin`/`umami`を放置 | ダッシュボード乗っ取り | 即座にパスワード変更、URL共有を最小化 |
| Workerがオープンプロキシ化 | 悪用・コスト増 | パスのホワイトリスト、必要ならOrigin制限 |
| Forkの放置 | セキュリティパッチの欠落 | upstreamリモートの定期同期 |

---

## 4. アプローチB:Fly.io + Cloudflare Workerプロキシ

Vercelのサーバーレス制約が負担になる場合や、常駐プロセスに近い形にしたい場合に選択します。公式ガイド:[Running on Fly.io](https://docs.umami.is/docs/guides/running-on-fly-io)。

### 4.1 アーキテクチャ

```
訪問者のブラウザ
    |
    v
Cloudflare Worker (analytics.vibequant.cc)
    |
    v
Fly.io (Umami Docker)  <-->  Neon/Supabase または Fly Postgres
```

### 4.2 インストール概要

1. Neon/SupabaseでPostgreSQL作成(Aと同様) — または`fly launch`時にPostgresを作成
2. [flyctl](https://fly.io/docs/flyctl/)をインストール・ログイン
3. `fly.toml`を作成後デプロイ。イメージ例:

```toml
# 公式ドキュメント例に基づく。region・app名は環境に合わせて変更
kill_signal = "SIGINT"
kill_timeout = "5s"

[experimental]
auto_rollback = true

[build]
  # ドキュメント: docker.umami.is/... または ghcr.io/umami-software/umami:postgresql-latest
  image = "docker.umami.is/umami-software/umami:postgresql-latest"

[[services]]
  protocol = "tcp"
  internal_port = 3000
  processes = ["app"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20

  [[services.tcp_checks]]
    interval = "15s"
    timeout = "2s"
    grace_period = "1s"
```

4. 主な運用ポイント(公式ドキュメント基準):

```bash
fly secrets set APP_SECRET="$(openssl rand -hex 32)"
fly deploy
fly scale memory 512   # Umamiは256MBで失敗する事例が多い
fly deploy
```

5. ログイン:`admin` / `umami` → パスワード変更
6. AのStep 5〜7と同様にWorkerプロキシ・ドメイン・サイトスクリプトを接続(`UMAMI_ORIGIN`だけFly URLに変更)

### 4.3 長所短所

| 長所 | 短所 |
|------|------|
| コンテナで明確なコントロール | CLI・スケール・ヘルスチェックなどの学習コスト |
| 512MB always-onならコールドスタート緩和 | **無料ティアの256MBマシンだけでは不足する可能性が高い** |
| リージョンを`nrt`/`icn`などから選択可能 | 公開IPv4など**少額の固定課金**が発生する可能性([Fly pricing](https://fly.io/docs/about/pricing/)) |
| AのWorker/DBを再利用しやすい | イメージタグ`latest`の追跡・ロールバック責任 |
| Vercel Hobby上限から独立 | 放置時にマシンコスト・幽霊ボリュームが蓄積 |

### 4.4 リスク(B)

| リスク | 影響 | 緩和策 |
|--------|------|------|
| メモリ512MB未満 | OOM、デプロイ/マイグレーション失敗 | `fly scale memory 512`以上 |
| 「無料」という前提 | 月数ドルの課金 | Billing alert、IPv4・マシン数の点検 |
| Fly Postgresを併用 | ストレージ・マシンの二重コスト | DBはNeon/Supabaseの維持を推奨 |
| スケール・トゥ・ゼロ | 最初のリクエストの遅延 | 最低1マシンをalways-on、またはAと同様のping |
| リージョンの不一致(アプリ東京、DB米国) | 収集APIの遅延 | アプリ・DBのリージョンを近づける |

---

## 5. 共通:Cloudflare最適化とD1非推奨

### 5.1 Cloudflare位置ヘッダー

CloudflareダッシュボードでManaged Transformsのvisitor location headersを有効にすると、Umamiが国・地域をより正確に認識します。関連環境変数:`CLIENT_IP_HEADER`、`SKIP_LOCATION_HEADERS`([Environment variables](https://docs.umami.is/docs/environment-variables))。

### 5.2 D1にUmamiを構築する経路

D1で動かすにはDBレイヤーのパッチが必要です。

- Umami更新ごとにパッチを再適用
- 公式未サポート → 障害時はコミュニティ依存
- D1の無料割り当て・SQLite制約

**非推奨。** Neon/Supabaseの無料PostgreSQLが保守コスト対効果に優れています。

### 5.3 ファーストパーティ・トラッキング

`analytics.vibequant.cc` + カスタム`TRACKER_SCRIPT_NAME` / `COLLECT_API_ENDPOINT`の組み合わせが、広告ブロッカー回避に最も現実的です。「回避」は完全ではなく、一部の厳格なブロックリストには依然として引っかかる可能性があります。

---

## 6. コスト整理(無料ティア基準、2026年の文脈)

| サービス | 無料/許容量(概算) | Umamiに十分か? | 注意 |
|--------|-------------------|-------------------|------|
| Cloudflare Workers | 日次リクエスト上限(アカウントプラン基準) | トラッキングプロキシとしては通常十分 | オープンプロキシ・ボット悪用時に消耗 |
| Vercel Hobby | 帯域・ファンクション上限 | 小規模コンテンツサイトには通常十分 | 商用利用上限・コールドスタート |
| Neon Free | ストレージ・compute時間 | 初期・低トラフィックには十分 | アイドル一時停止 |
| Supabase Free | DB容量・帯域 | 初期には十分 | プロジェクトのpauseポリシー確認 |
| Fly.io | 共有CPU・時間の許容量あり | **Umamiの512MB要求と衝突する可能性** | IPv4・メモリ超過時に有料化 |

**現実的な月額コスト期待値**

- **A:** トラフィックが大きくなければ**0円**に近く維持可能
- **B:** 「完全無料」と断定しづらい。メモリ・IPv4だけでも月に少額課金が発生しうる。Billing alertを必ず設定する。

「月額コスト0円」は**A + Neon/Supabase + Worker**の組み合わせでのみ安全に目標とすべきです。

---

## 7. 共通リスクと運用上の課題

| 領域 | 内容 |
|------|------|
| **セキュリティ** | デフォルトパスワードの変更、ダッシュボードURL露出の最小化、WorkerにAPI Bearerトークンを入れない、`APP_SECRET`の漏洩禁止 |
| **プライバシー** | Umamiはクッキーレスに近いが、公開サイトの個人情報保護方針・クッキーバナー方針と合致するか確認。EU訪問者がいれば保管期間・目的を明示 |
| **データ損失** | Neon/Supabase無料ティアの削除・pauseポリシー。定期的なDBダンプまたは論理バックアップ |
| **正確性** | 広告ブロッカー・ITP・ボットフィルターによりPVは常に過小/過大の可能性。Cloudflare Web Analyticsと並行して交差検証を推奨 |
| **依存関係** | アプリホスト(Vercel/Fly)+DB(Neon/Supabase)+CF Workerの3軸。一つの軸が障害を起こすと収集に空白が生じる |
| **更新** | Fork sync(A)またはイメージタグ固定(B)。Prismaマイグレーション失敗時のロールバック計画 |
| **悪用** | `/api/send`スパムによるDB肥大化。Website IDの公開は避けられないため、rate limit・異常値の監視 |

---

## 8. vibequant.ccの追加要件

元のガイドにない、**このレポ・ドメイン構造のために追加で必要な作業**です。

### 8.1 マルチホスト戦略

現在の概略マッピング([CUSTOM_DOMAIN_SETUP.md](../../VibeQuant/cloudflare/docs/CUSTOM_DOMAIN_SETUP.md)):

| ホスト | Pagesプロジェクト | コンテンツ |
|--------|----------------|--------|
| `vibequant.cc` | vibequant-web | ハブ・エッセイなど |
| `docs.vibequant.cc` | vibequant-docs | Columns |
| `tech.vibequant.cc` | vibequant-tech | TechDoc |
| `cti.vibequant.cc` | vibequant-cti | CTI |
| `play.vibequant.cc` | vibequant-play | Playground |
| `lab` / `research` | 各々 | 実験・リサーチ |

選択肢:

1. **ホストごとにWebsite ID** — ダッシュボードがクリーンになり、スクリプトのIDをホストごとに分岐
2. **1つのWebsite**に複数ドメイン — 設定が単純、レポートでホスト/パスによりフィルタ

コンテンツアーカイブ用途であれば、**ホストごとのWebsite**(docs / tech / cti / hub)が分析に有利です。

### 8.2 ビルドパイプライン挿入

トラッキングコードは`VibeQuant/content/build.mjs`の`layout()`の`<head>`に入れるのが正しいです。生成されたHTMLを直接修正すると次のビルドで上書きされます。

追加で必要なもの:

- `UMAMI_WEBSITE_ID_*`またはビルド時のenvでIDを注入
- ローカルプレビューでトラッキングを無効化するフラグ(`UMAMI_ENABLED=0`)
- ビルド後、**関連するPagesすべて**を再デプロイ

### 8.3 DNS / Worker

- `analytics.vibequant.cc` → Workerカスタムドメイン
- 既存のPagesカスタムドメインと衝突しないか確認
- CORS:複数サブドメインからスクリプト・POSTが来るため、Worker/Umami CORS設定を確認

### 8.4 Cloudflare Web Analyticsとの関係

すでにWeb Analyticsを使用中、または使用予定であれば:

- 短期:**並行運用**して数値を交差検証
- 中期:Umamiが安定したらWeb AnalyticsはPVバックアップ用のみ維持、または整理

両方を有効にしてもページコストは小さいですが、指標解釈時に二重集計を混同しないよう注意します。

### 8.5 カスタムイベント(後続)

スクロール深度・アウトバウンドクリックなどはUmami[Custom Events](https://docs.umami.is/docs/tracker-functions)で追加します。基本のpageviewが安定した後に実装します。

### 8.6 ドキュメント・運用チェック

- `APP_SECRET`、DB URLをレポにコミットしない(`.env` / Vercel・Fly secrets)
- 障害時の連絡経路:Vercel/Flyのステータス、Neon/Supabaseのステータス
- 週1回:fork syncまたはイメージダイジェストの確認(任意)

---

## 9. チェックリスト:vibequant.cc導入スケジュール

| 段階 | 作業 | 予想時間 |
|------|------|----------|
| 1 | ホスト別Website戦略の決定(単一 vs 複数ID) | 10分 |
| 2 | Umami GitHubフォーク | 2分 |
| 3 | Neon/Supabase PostgreSQL作成 | 5分 |
| 4 | Vercelデプロイ + `DATABASE_URL` / `APP_SECRET` / tracker名 | 15分 |
| 5 | ログイン・パスワード変更・Website追加 | 5分 |
| 6 | Cloudflare Worker(script + collectプロキシ)+ Secrets | 15分 |
| 7 | `analytics.vibequant.cc`接続 | 5分 |
| 8 | Managed Transforms(visitor location)確認 | 3分 |
| 9 | `build.mjs`にスクリプト挿入 + ローカルビルド確認 | 15分 |
| 10 | 該当Pagesプロジェクトを再デプロイ | 10〜20分 |
| 11 | テスト訪問 → Realtime/ダッシュボード確認 | 5分 |
| 12 | (任意)Billing alert、DBバックアップ、Web Analytics併用メモ | 10分 |

**総予想:約1〜1.5時間**(マルチホスト・ビルド修正を含む場合)。原案の40〜50分は「単一サイト・手動HTML挿入」基準に近いです。

アプローチBを最初から選ぶと、Flyメモリスケール・課金確認で**+30〜60分**と少額のコストの可能性が加わります。

---

## 10. 推奨決定

1. **第一段階:アプローチA(Vercel + Neon + Worker)**
   - コスト・速度・文書成熟度の面でvibequant.ccに最も適合
2. **プロキシは最初から`analytics.vibequant.cc`**
   - 後でBに移行してもWorker originだけ差し替え
3. **D1/Workersネイティブのumamiは行わない**
4. **build.mjs経由で挿入 + ホストごとのWebsite ID**
5. **コールドスタート・Hobby上限が体感されたらBに移行**
   - それまではFlyの「無料」を前提としないこと

この組み合わせは無料ティアに近く維持しながら、ファーストパーティ・トラッキング、データ所有、Umami更新経路を確保します。Cloudflare Web Analyticsで軽く始めた後、この計画でUmamiを接続する順序が、運用負担対効果として最も優れています。

---

## 11. リファレンス

### 公式ドキュメント

- [Umami — Running on Vercel](https://docs.umami.is/docs/guides/running-on-vercel)
- [Umami — Running on Fly.io](https://docs.umami.is/docs/guides/running-on-fly-io)
- [Umami — Environment variables](https://docs.umami.is/docs/environment-variables)(`APP_SECRET`、`TRACKER_SCRIPT_NAME`、`COLLECT_API_ENDPOINT`)
- [Umami — Login (default admin / umami)](https://docs.umami.is/docs/login)
- [Umami — Tracker functions / custom events](https://docs.umami.is/docs/tracker-functions)
- [Umami GitHub](https://github.com/umami-software/umami)
- [Fly.io — Resource pricing](https://fly.io/docs/about/pricing/)
- [Fly.io — flyctl](https://fly.io/docs/flyctl/)
- [Vercel — Rewrites](https://vercel.com/docs/rewrites)(代替:メインアプリがVercelの場合の同一ドメインプロキシ)
- [Neon](https://neon.tech) / [Supabase](https://supabase.com)

### コミュニティ・ガイド

- [Preventing ad blockers with Cloudflare Worker (umami#1026)](https://github.com/umami-software/umami/discussions/1026)
- [Self-hosted Umami on Vercel + Supabase(例)](https://www.surajon.dev/how-to-self-host-umami-analytics-with-supabase-and-vercel)
- [Umami on Vercel + Neon(要約ガイド)](https://setuptracking.com/umami-vercel/)

### このリポジトリ

- [Cloudflareウェブ分析ソリューションガイド](./CloudeFlare-Web-Analytics-Guide_JA.md)
- [VibeQuantカスタムドメイン設定](../../VibeQuant/cloudflare/docs/CUSTOM_DOMAIN_SETUP.md)
- トラッキング挿入ポイント:`VibeQuant/content/build.mjs`(`layout()` `<head>`)
