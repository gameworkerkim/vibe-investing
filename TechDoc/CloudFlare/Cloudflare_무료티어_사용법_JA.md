---
title: "Cloudflare無料ティアで実際に運用する方法 — VibeQuant運用事例"
description: "VibeQuantをCloudflareの無料ティアだけで設計・運用している理由と方法をまとめた実務記録。一般的な登録マニュアルではなく、実際の運用判断・落とし穴・無料ティアと衝突しないスタックを紹介する。"
abstract: |
  本文書は一般的な登録手順の繰り返しではなく、VibeQuantをCloudflareの無料ティアだけで設計・運用している理由と方法を記す。
  Cloudflareの長所(セキュリティ、CDN、サーバーレス統合)と短所(日次リクエスト・CPU制限、KV書き込み制限、ネイティブPythonの弱さ)を扱い、
  Vercel/Netlify/RailwayなどのPaaSと比較し、SEO・AI検索に強い研究アーカイブをインフラコストゼロで運用するためのスタック
  (Markdown→静的HTML+TypeScriptエッジAPI+Pyodide)と設計ルールを提示する。
summary_for_ai: |
  vibequant.ccをCloudflareの無料ティア(Pages+Workers+Cache API/KV)だけで運用する実務事例。
  長所: エッジでの自動HTTPS・DDoS緩和、Pages静的アセットの実質無制限帯域、R2のegress無料、Pages+Workers/Functions+Cache/KV+R2/D1を単一アカウントで統合したサーバーレス構成。
  短所: Workers無料枠は約10万リクエスト/日、リクエストあたりCPU約10ms、KV書き込みは約1,000/日が上限、PythonはPyodide/WASMベース(ネイティブnumpyや重いC拡張は不可)、
  長時間稼働のNodeバックエンドやWebSocketはVercel/Railway/Fly.ioの方が適合しやすい。
  推奨スタック: GitHub上のMarkdownを原本として、Pages向けに静的HTMLをビルド、エッジAPIはTypeScript(Workers/Pages Functions)、読み取りはKVよりCache APIを優先、
  サーバーのCPU制限に当たるクオンツ実験はブラウザ内Pyodideで実行。
  無料ティア維持のための設計原則: ランタイムレンダリングよりビルド時HTML、積極的なキャッシュ、KV書き込みの回避、重い計算をクライアントブラウザに委譲、
  TCP・ローカルランタイムを前提とする構成(Prisma+Neon TCP、Puppeteer)の回避。
  最小セットアップチェックリスト(アカウント、Wrangler CLI、Pagesデプロイ、Workerデプロイ)と、実運用で実際に遭遇した10個の落とし穴
  (未接続サブドメインでの522、ミドルウェアが誤ってパスをブロック、R2有効化に決済手段が必要、プロキシ環境変数がwranglerデプロイを失敗させる等)を含む。
date: 2026-07-24
author: "Dennis Kim"
lang: ja
tags:
  - Cloudflare
  - 無料ティア
  - Workers
  - Pages
  - サーバーレス
  - VibeQuant
keywords:
  - Cloudflare無料ティア
  - Cloudflare Workers制限
  - Cloudflare Pagesデプロイ
  - VibeQuantアーキテクチャ
  - Pyodideブラウザクオンツ
  - Wrangler CLI
featured: false
schema_type: TechArticle
draft: false
---

# Cloudflare無料ティアで実際に運用する方法 — VibeQuant運用事例

> 執筆: 2026-07-24 · 対象: 個人・独立研究者・小規模オープンソースサイトを**有料プランへの移行なしに**運用したい開発者
> 関連: [Cloudflare無料ティア登録・上限ガイド](Cloudflare%20free%20tier%20guide.md) · [Vercel分析](../vercel/vercel_analysis.md) · [無料Webホスティング比較](../Free_Hosting/FreeHosting.md) · サイト [vibequant.cc](https://vibequant.cc/)

本文書は「まともな運用経験なしにググった・LLMが並べたマニュアル」ではなく、**[VibeQuant](https://vibequant.cc/)をCloudflareの無料ティアだけで設計・運用した理由と方法**をまとめたものである。
登録・上限・クオータの数値は既存の[登録・上限ガイド](Cloudflare%20free%20tier%20guide.md)を参照すること。

---

## 1. Cloudflareとは?

Cloudflareはもともと**DNS・CDN・DDoS防御**で名を上げたエッジネットワーク企業である。業界ではWeb3・取引所・トラフィック変動の大きいサービスの前段に置かれることが多い。2020年代以降は**Workers(サーバーレス)・Pages(静的/SSR)・R2(オブジェクトストレージ)・D1(SQLite)・KV・Cache API**などを1つのアカウントに統合し、「ドメイン前段のセキュリティ+全世界配信+軽量バックエンド」を**同一エッジ**で処理する**開発者プラットフォーム**へと拡張している。最近は**Workers AI・AI Gateway**などAI関連製品も増えている。

一言でまとめると:

> **トラフィックがどこから来ても、最も近いPoPでHTML・API・キャッシュを処理し、オリジンサーバーのコストを極力なくす。**

無料プランでも(制限はあるが)カスタムドメイン、HTTPS、CDN、基本的なWAF/ボット緩和、Pages・Workersが使える。VibeQuantのような**コンテンツアーカイブ+薄いAPI+ブラウザクオンツ実験**にはよく合う。

私はカスタムドメインを購入し、**ドメイン代のみ**を支出している。`*.pages.dev`だけでも運用可能だが、SEO・ブランディングにはドメインがある方が有利である。

---

## 2. 長所

### 2.1 セキュリティ

DDoS防御に特化したCloudflareらしく、トラフィックの前段で異常なリクエストをフィルタリングする。

| 項目 | 意味 |
|------|------|
| 自動HTTPS/TLS | 証明書更新の負担が減る |
| DDoS・ボット緩和 | オリジンが弱くてもエッジで吸収 |
| DNSがプラットフォームと同一 | ネームサーバーがCloudflareであれば、CDN・WAF・Pagesが一つの流れになる |
| シークレットはWorkerのみ | Pages HTMLにAPIキーを入れない構造が自然に成立する |

静的HTMLが中心であれば、**オリジンサーバーを露出しない**設計になる。攻撃トラフィックは「アプリサーバーのCPU」ではなく**Cloudflareのエッジ**に先に当たる。
ただし無料ティアでは**エッジの日次上限・公正利用**が残る。オリジンへの砲撃は減っても、上限消費・利用規約の問題は別である(§3・§8)。

### 2.2 CDN(帯域幅が実質無料に近い)

Pagesの静的アセットは**実質無制限**に近い帯域幅で使える(公正利用・利用規約は別)。R2は**egress無料**が最大の差別化ポイントである。「コラム・TechDocのHTMLが増えても転送料が爆発しない」という点が、Vercel Hobbyの月間帯域上限・超過課金構造と対照的である。

### 2.3 サーバーレス統合性

1つのアカウントで概ね次のような組み合わせが可能である。

```
Pages (HTML/SEO)  +  Pages Functions / Workers (API)
      +  Cache API · KV (キャッシュ)
      +  R2 / D1 (ストレージ)
      +  カスタムドメイン・サブドメイン
```

「静的サイトはA社、APIはB社、CDNはC社」と分割する必要がない。VibeQuantは**コンテンツはPagesの静的HTML**、**相場・研究APIはWorker/Pages Functions**、**ブラウザクオンツはPyodide**という役割分担にしている。

個人・小規模の**静的+薄いエッジAPI**基準では、障害点が少なく保守が単純である。

### 2.4 その他の実務上の利点

- **クレジットカードなし**でWorkers/Pagesを開始可能(製品・時期によってはR2などで決済手段が必要な場合あり — §8)
- `*.pages.dev`/`*.workers.dev`でドメインなしでもプロトタイプ可能
- Wrangler CLIによりローカルと同一のデプロイスクリプトが使える
- GitHub Markdown→静的HTMLビルドとの相性が良い(SEO・GEO)

---

## 3. 短所

正直に書く。無料ティアを「無制限PaaS」と誤解すると即座に問題になる。

| 短所 | 説明 |
|------|------|
| **日次リクエスト・CPU上限** | Workers無料枠は概ね**10万リクエスト/日**、リクエストあたりCPU**約10ms**程度。ピーク時に消費し尽くすとUTC深夜(KST 09:00)までブロックされる可能性がある |
| **KV書き込み上限** | 無料KV書き込みは1日約1,000件と厳しい。セッション・リアルタイムカウンターには不向き→**Cache API優先**が実務パターン |
| **Python ネイティブサポートが弱い** | WorkersのPythonはPyodide/WASMベース。`numpy`・重いC拡張・長時間ジョブをエッジに載せるのは難しい |
| **コールド起動・ランタイム制約** | Nodeフルスタック(長時間バックグラウンドジョブ、WebSocket、任意のバイナリ)はVercel/Railwayの方が扱いやすいことが多い |
| **デバッグUX** | ローカル再現・ログは慣れるまでもたつく可能性がある |
| **ベンダー境界** | Durable Objects・一部AI・高度なWAFは有料。「完全無料でエンタープライズ級」は幻想である |
| **サブドメイン・プロジェクトの分散** | カスタムホストを複数のPagesプロジェクトに接続していくと、DNS・ミドルウェア・リダイレクトが複雑になる(VibeQuantはハブ単一プロジェクト+パスルーティングで単純化) |
| **利用規約・公正利用** | 帯域幅の「無制限」も、乱用・攻撃・商用大量配信には制約がかかる可能性がある |

**まとめ:** セキュリティ・CDN・静的+薄いAPIには強いが、**重いバックエンド・強い一貫性が必要なDB・長時間Python**は別のサービスに切り出す方が適切である。

トラフィック・役割が溢れる場合は**役割ごとに**混合する。例: 読み取りキャッシュ→Upstash Redis、長時間ジョブ・Python API→Render/Railway、Nextフルスタック実験→Vercel(利用規約・帯域幅を確認)。「とにかくVercelを乗せる」のではなく、**上限・利用規約に合致する部分だけ**を接続する。

---

## 4. 競合サービス(Vercelを含むPaaS)

| サービス | ポジション | Cloudflare比 |
|--------|--------|-----------------|
| **[Vercel](../vercel/vercel_analysis.md)** | Next.js最適化PaaS、DX最高 | Hobbyは商用制限・帯域上限・超過課金リスクあり。Nextフルスタックなら魅力的、**トラフィックの大きい静的アーカイブ**ならCFが有利な場合が多い |
| **Netlify** | JAMstack・フォーム・ビルドパイプライン | ビルド分の削減など無料枠が厳しくなる傾向 |
| **GitHub Pages** | 文書・ポートフォリオ | サーバーレスAPI・エッジキャッシュ・統合WAFは弱い。**原文MDの保管庫**としては最高(VibeQuantはGitHub+CFの二重構造) |
| **Railway / Render / Fly.io** | コンテナ・長時間プロセス | スリープ・時間制限・有料化への圧力。Python APIサーバーに適合 |
| **Firebase Hosting** | Googleエコシステム | Auth/Firestoreと組み合わせる場合に強い |
| **AWS Amplify / Azure Static Web Apps** | クラウドベンダー依存 | エンタープライズIAM・既存クラウドとの統合時に有効。個人の無料運用にはCFの方が単純 |
| **Oracle Cloud Free** | Always Free VM | IaaS。管理負担↑、統制権↑ — [別ガイド](../OracleCloud/02.%20Oracle%20Cloud%20Free%20Tier%20Guide.md) |

選定のヒューリスティック:

- **Next.js App Router中心の製品** → まずVercelを検討するが、コスト・利用規約を読んで開始する
- **Markdownアーカイブ+SEO+薄いAPI+コストゼロ** → Cloudflare Pages(+Workers)
- **長時間Python/DBワーカー** → Railway・Render・Fly、または別VPS+前段のみCloudflare

AWSに全て閉じ込めるよりも初期コストは概ね低い。DDoS・スクレイピングを**オリジン前段**で防ぐ構造のため、オリジンサーバーが即座に落ちることは減る。ただし**エッジ上限・公正利用**は残る(§3)。

---

## 5. 効率的な開発言語とスタック

無料ティアで**より衝突しにくい**組み合わせである。バックエンドが複雑な場合は外部に切り出す。

### 5.1 推奨スタック(VibeQuant型)

| 層 | 技術 | 理由 |
|------|------|------|
| コンテンツ原本 | **Markdown(GitHub)** | バージョン管理・PR・AI検索(DeepWiki等)・人間の可読性 |
| 発行面 | **静的HTML**(ビルドスクリプト) | Pagesにアップし、Core Web Vitals・OG・sitemap・`llms.txt`を整備 |
| エッジAPI | **JavaScript/TypeScript**(Workers、Pages Functions) | ランタイムの第一級市民。`fetch`・Cache APIとの相性が良い |
| ブラウザクオンツ | **Python + Pyodide** | サーバーCPUクオータを使わない。GS Quant型実験はクライアント側で実行 |
| キャッシュ | **Cache API**(優先)・KV(読み取り中心) | KV書き込み上限を回避 |
| シークレット | Worker環境変数/`wrangler secret` | フロントエンドバンドルにキーを入れない |

### 5.2 避けるべき、または「境界外へ」

- Workers上での**重いnumpy/pandasバッチ処理** — ブラウザPyodideまたは外部PaaSへ
- **Prisma + Neon TCP**のような長寿命接続 — Pages Functionsでの再設計が必要(REST/HTTPクライアント・キャッシュ)
- **Puppeteer/ローカルfs** — エッジには存在しない。事前ビルドまたは別ランタイムを使用
- **リクエストごとのLLM呼び出し** — キャッシュ・日次上限・コストに注意。DeepSeek等はWorkerから呼び出すが**結果をキャッシュ**する

### 5.3 言語の一言まとめ

> **エッジはTypeScript、文書はMarkdown、クオンツ実験はブラウザPython。**
> この三角形がCloudflareの無料ティアとよく合う。合わない技術スタックを無理に当てはめると、完成度・安定性・レイテンシで損をしやすい。

---

## 6. どのようにサイトを開発したか? — 設計とコンセプト

### 6.1 問題意識

1. **ニュース・コラムウェブの揮発性**
   私は2000年からニュースコラムを執筆してきた。メディア・ブログの改編が繰り返されると過去記事のURLが消え、**2014年以前のコラムがまるごとない**といった空白が生じる。「14年分がない」ということは検索・引用・研究の連続性の観点で致命的である。Naverのように検索エンジンに閉じた空間にだけ置くと、Google・LLMからの流入も阻まれる。
   → **GitHub上にMarkdownで原文を永続保存**し、ウェブは**その原本の発行面**として扱う。

2. **人間の検索(SEO)とAI検索(GEO)の同時対応**
   GitHubのツリーだけではGoogle・ソーシャルOGが弱く、ChatGPT・Perplexity・CursorのようなエージェントはRoot `llms.txt`・セマンティックHTML・個別URLがなければ引用で不利になる。
   → Pagesに**個別文書URL+sitemap+llms.txt+canonical(GitHub blobリンク)**を整備する。

3. **インフラコストゼロを前提とした実験場**
   個人研究・オープンソースアーカイブに月数十ドルのPaaSは過剰である。
   → **Cloudflare無料ティアのみでの運用**をハード制約として設定する。

4. **クオンツにおける「見せるもの」と「実行するもの」の分離**
   GS Quant・相場・戦略検証をサーバーで実行すると、上限・依存関係に阻まれる。
   → **PlaygroundはPyodide(ブラウザPython)**、APIは相場・キャッシュ・薄いプロキシのみを担当。

### 6.2 コンセプト図解

```
[GitHub vibe-investing]
  ├─ 02.Investment Idea Column / essays / CTI / TechDoc   ← 原本・SEOソース
  └─ VibeQuant/
        build → 静的HTML
             ↓
[Cloudflare Pages]  vibequant.cc  (ハブ)
  docs / tech / cti / play / essays / research …
             ↓
[Workers / Pages Functions]  相場・研究API・キャッシュ
             ↓
[ブラウザ]  Pyodide + GS Quant型実験(サーバーCPU未使用)
```

### 6.3 実際にリリースしたサービス

| 面 | URL例 | 役割 |
|----|--------|------|
| ハブ | [vibequant.cc](https://vibequant.cc/) | 入口・ブランディング |
| Columns | docs.vibequant.cc | 投資コラムアーカイブ |
| Tech | tech.vibequant.cc | TechDoc |
| CTI | cti.vibequant.cc | 脅威インテリジェンスレポート |
| Play | play.vibequant.cc | Python/クオンツWebビュー |
| Research | vibequant.cc/research | Quant/Space/Trumpシグナル(ログインなし、キャッシュ) |
| Essays | vibequant.cc/essays | エッセイ |

原則: **ログインの壁でコンテンツを閉じ込めない。**研究ダッシュボードも公開+キャッシュTTLで無料上限を守る。

### 6.4 「無料のみ」を守るための設計ルール

1. HTMLはビルド産物 — ランタイムレンダリングを最小化
2. キャッシュ可能なものはキャッシュ(取引時間中30分/取引時間外2時間など)
3. KV書き込みの濫用禁止→Cache API
4. 重い計算はエッジではなく**ユーザーのブラウザ**で実行
5. Neon/Prisma/Puppeteerのような**TCP・ローカルランタイム前提**の構成は移植対象から除外、または事前計算に切り替える
6. デプロイは`wrangler pages deploy` — ローカルの`HTTP_PROXY`などがあればunsetする

---

## 7. 基本設定(最小チェックリスト)

詳細なクオータ・マイグレーションは[登録・上限ガイド](Cloudflare%20free%20tier%20guide.md)を参照。ここでは**最小経路**のみ記す。

### 7.1 アカウント

1. [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. メール認証
3. **2FA必須**(アカウント=全サイトの鍵)

### 7.2 Wrangler

```bash
# Node.js 18+
npm i -g wrangler   # またはプロジェクトローカルのnode_modules
wrangler login
wrangler whoami
```

### 7.3 Pagesデプロイ

```bash
wrangler pages deploy ./dist --project-name=my-site --commit-dirty=true
# → https://my-site.pages.dev
```

ドメイン: Dashboard → Pages → Custom domains。ネームサーバーをCloudflareに移せば、DNS・SSLが一箇所で管理できる。

### 7.4 Worker(API)

```bash
cd cloudflare-worker
wrangler deploy
wrangler secret put MY_API_KEY
```

**PagesとWorkerの設定を無理に1つの`wrangler.toml`にまとめないこと。**
Pagesは`cd pages && wrangler pages deploy .`が安全である。

### 7.5 VibeQuant式パイプライン(概念)

```bash
node content/build.mjs
npx wrangler pages deploy ./pages --project-name=vibequant-web
```

原本は常にGitHub、ウェブは派生版。**削除された報道記事の代わりに、リポジトリが真実の源泉となる**ようにする。

---

## 8. 注意点(運用で実際に踏んだもの)

1. **Workers日次10万リクエスト** — 市場終了・バイラル発生時に午後に消費し尽くす可能性がある。キャッシュ・静的化でAPI呼び出しを減らす。
2. **KV書き込み1,000/日** — ページビューをKVに書き込むと即座に破綻する。相場・レスポンスはCache APIへ。
3. **CPU約10ms** — 重い演算・大容量JSONは事前計算・クライアント・外部サービスに委ねる。
4. **R2の有効化** — ダッシュボードで有効化する必要があり、決済手段を要求される可能性がある(`10042`)。
5. **プロキシ環境** — `HTTP_PROXY`が有効だと`api.cloudflare.com`へのデプロイが失敗する可能性がある。
6. **サブドメインの522** — カスタムホストの接続前はapexパスで提供し、DNSが準備できたら移行する。
7. **ミドルウェアでパスを塞がないこと** — 「まもなく接続」のHTMLを`/research/*`に被せると、静的コンテンツ・APIが見えなくなる(実際の障害事例)。
8. **シークレットをHTML/Gitに入れないこと** — DeepSeek・取引所のキーはWorker secretへ。
9. **無料=SLAなし** — GitHub原本と`pages.dev` URLを文書に記録しておく。
10. **商用・大量スクレイピング** — 利用規約・公正利用を読み、研究公開と乱用を区別する。

---

## 9. まとめ

| 質問 | 答え |
|------|----|
| なぜCloudflareを使うのか? | セキュリティ+CDN+サーバーレスを**単一エッジ**で、無料で静的サイト・薄いAPIを運用できる |
| どこが弱いか? | 重いPythonサーバー、強い一貫性、長時間ジョブ、予測不能なピークリクエスト |
| Vercelとの違いは? | Next DX・プレビューはVercel、**帯域幅・コスト予測性・エッジ統合**はCloudflareが有利な場合が多い |
| VibeQuantの核心制約は? | **無料ティアのみ**、GitHub原本の永続化、SEO+AI検索、ブラウザクオンツ |
| スタックは? | Markdown→静的HTML+TSエッジAPI+Pyodide |

コラムがウェブから消える経験、検索・LLMに捕捉されないGitHubツリー、月額課金への不安 — この3つを同時に解決しようとすると、Cloudflare無料ティアは「次善策」ではなく**意図された選択**になる。

小規模チームは無料ティアの**限界と長所**を見て、スケールアップまでコストを抑える戦略を取ることが合理的な場合がある。もはや全てのワークロードのデフォルトがAWSである必要はない。

---

## 参考

- [Cloudflare無料ティア登録・上限ガイド](Cloudflare%20free%20tier%20guide.md)(KR)・[EN](Cloudflare%20free%20tier%20guide_EN.md)
- [Vercelプラットフォーム分析](../vercel/vercel_analysis.md)
- [無料Webホスティングガイド](../Free_Hosting/FreeHosting.md)
- [エージェント親和的Webサイトガイド](../agent-friendly-website-guide/agent-friendly-website-guide.ja.md)
- [GS Quant Getting Started](../GS_Quant/GS%20Quant%20Getting%20Started.md)
- [Pyodide](../Python_Pyodide/Pyodide.md)
- Cloudflare Workers Pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Workers AI: https://developers.cloudflare.com/workers-ai/
- VibeQuantデプロイメモ: `VibeQuant/cloudflare/DEPLOY_KR.md`(リポジトリ内)
- サイト: https://vibequant.cc/ · 原本: https://github.com/gameworkerkim/vibe-investing
