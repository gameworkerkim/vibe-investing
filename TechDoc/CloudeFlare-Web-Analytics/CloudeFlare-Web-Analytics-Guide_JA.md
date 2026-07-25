---
title: "Cloudflareウェブ分析ソリューションガイド — Web Analytics・Zaraz・Umami比較"
subtitle: "PVからスクロール・カスタムイベントまで、Cloudflareエコシステムで指標を選ぶ方法"
description: "Cloudflare Web Analytics・Zaraz・Workers Analytics EngineとUmami・Plausible・GoatCounter・GA4の長所短所、適合ケース、段階別選択ガイドを整理した。"
abstract: |
  Cloudflare Pages/Workers上にコンテンツを公開する際、記事別PV・リファラー・読了深度を見たいなら、目的に応じてツールが分かれる。
  最初は無料・クッキーレスのWeb Analytics、イベント・複数サイトはUmami、広告・ファネルはZaraz+GA4、完全所有はAnalytics Engine+Logpush+R2が現実的だ。
  コンテンツアーカイブにはMatomo・PostHog・Clarityは過剰な場合が多い。推奨ルートはWeb Analytics開始 → 必要時にUmami拡張だ。
summary_for_ai: |
  TechDoc comparing web analytics options for Cloudflare-hosted sites (as of mid-2026 context in the article).
  Native: Web Analytics (privacy-first PV/referrer), Zaraz (tag manager), Workers Analytics Engine + Logpush + R2.
  Third-party/OSS: Umami, Plausible, GoatCounter, Matomo, GA4, PostHog/Clarity, Fathom, Simple Analytics, Ackee, Pirsch.
  Recommended path for content archives: start Web Analytics, expand to Umami; avoid heavy stacks unless needed.
date: 2026-07-25
author: "Dennis Kim"
lang: ja
tags:
  - Cloudflare
  - Web Analytics
  - Umami
  - Zaraz
  - Privacy
  - Observability
keywords:
  - Cloudflare Web Analytics
  - Zaraz
  - Umami
  - Plausible
  - GoatCounter
  - Workers Analytics Engine
  - ウェブ分析
  - プライバシー分析
group: cloud-free
featured: false
schema_type: TechArticle
draft: false
---

# Cloudflareウェブ分析ソリューションガイド — Web Analytics・Zaraz・Umami比較

Cloudflare上にサイトを公開していて「自分の記事は誰が、どこで読んでいるのか」という疑問を持ったなら、指標を見るための選択肢は思いのほか多様です。単純にPVだけ確認したいのか、スクロール深度やカスタムイベントまで追跡したいのか、データを完全に自分の手元に置きたいのかによって、方向性はまったく変わります。本稿ではCloudflareネイティブソリューションからサードパーティ・オープンソースツールまで、それぞれの長所短所と適したユースケースを整理します。

---

## 1. Cloudflareネイティブソリューション

### 1.1 Web Analytics(第一推奨・スタート用)

Cloudflare Web Analyticsは**無料・プライバシー優先**という最強の武器を持つツールです。クッキーやブラウザフィンガープリントを使用せず、Cloudflare Pagesと同じアカウントから即座に有効化できます。サイト別のTop Pages、Referrer、国別トラフィックを標準で提供し、サイトにバナーを追加する負担もほとんどありません。docs/tech/ctiホストにサイトを追加するだけで即座に指標を確認できるため、**「記事別PV+流入経路」を週次でチェック**したり、SNSトラフィックの効果を測る実験をしたりする際に最適です。

2025年10月15日から、Cloudflareはすべての無料ドメインでWeb Analyticsをデフォルトで有効化し始め、2026年にはRUM(Real User Monitoring)ツールとネットワークレベルのインサイトを組み合わせた大規模アップグレードが進行中です。また2026年4月の更新で**Navigation Typeのフィルタリング・レポート**機能が追加され、ユーザーがリンククリックで移動したのか、戻る/進むで移動したのか、キャッシュヒットだったのかまで確認できるようになりました。大規模アカウント(サイト100件以上)向けのダッシュボード安定性も改善され、最大1,000サイトまでアカウント全体の集計照会が可能になりました。

**欠点**は明確です。スクロール深度・滞在時間・カスタムイベント・ファネル分析が非常に弱く、UIが浅く、長期の生データエクスポートとSQLクエリ機能が乏しいです。サブドメインごとに個別設定が必要な煩わしさもあります。

> **適合:** 「記事別PV+流入経路」の週次チェック、SNS効果測定、軽量なスタート用。

### 1.2 Zaraz

Zarazは**エッジでタグを中継する**ツールで、パフォーマンス低下なしにサードパーティスクリプトを制御できます。GAや広告ピクセルをブラウザに直接埋め込まず、Cloudflareエッジで処理するため、ページ読み込みパフォーマンスを大幅に改善できます。

ただし、Zaraz自体は「論文級レポート」を提供する分析ツールではなく、**タグマネージャー**に近いものです。GAを付けると複雑さと同意の問題が再発し、コンテンツアーカイブ用途には過剰な場合が多いです。

> **適合:** 後でGA/広告ピクセルを必ず使う必要がある場合のみ。今すぐ必要でなければスキップしても構いません。

### 1.3 Workers Analytics Engine / Logpush + R2

この組み合わせは**データ所有権を100%確保**したい開発者向けのソリューションです。Workersの`_middleware`やPages Functionでパス別カウント、スクロールビーコンなどを直接蓄積でき、Workers Analytics Engineは**無制限カーディナリティの時系列分析**をSQL APIで照会できるようにします。

Logpushは、CloudflareのログをR2、S3、Splunk、Datadogなどの外部ストレージや分析ツールに自動転送する機能です。2026年には**Pipelines**機能が追加され、Logpushデータを SQLに変換した後、R2にParquetやApache Icebergテーブル形式で保存できるようになりました。これにより、生ログを長期保管しながらも高速に照会できるインフラを構成できます。

**欠点**は、ダッシュボード・データリテンション・クエリを**自分で作らなければならない**ことです。運用コストと開発時間がかなり大きくなります。

> **適合:** Umamiも嫌で「完全に自分のインフラ」だけを望む場合。データエンジニアリング能力を備えたチームに推奨。

---

## 2. サードパーティ・オープンソース

### 2.1 Umami(OSS、よく推奨される)

UmamiはMITライセンスのオープンソース分析ツールで、**セルフホスト(またはクラウド)**が可能です。ページビュー・リファラー・カスタムイベント・複数サイトをサポートし、スクリプトサイズが2KB未満で軽量です。Cloudflare WorkersおよびPagesとD1/PostgreSQLなどを組み合わせた事例が多く、Cloudflareエコシステムとの相性が良いです。

Cloudflare Web Analyticsの次のステップとして、**「記事別+イベント」**まで追跡したい場合に自然な選択肢です。実際にCloudflare Web AnalyticsからUmamiに移行したブロガーの評判も好意的です。

**欠点**は、ホスティング・バックアップ・更新を自分で管理する必要があり、スクロール深度は自分でイベントを定義する必要があることです。UmamiはPostgreSQLまたはMySQLのみを公式サポートし、Cloudflare D1やSQLiteは公式サポートしていない点にも注意が必要です。

> **適合:** CF Web Analyticsの次のステップ、「記事別+イベント」まで欲しい場合。

### 2.2 Plausible(オープンコア/有料SaaS)

Plausibleは**UXが洗練されプライバシーを重視する**ツールで、目標/カスタムイベント設定と共有ダッシュボード機能が優れています。Cloudflare Workersを通じてPlausibleリクエストを自社ドメインにプロキシすることもでき、広告ブロッカー回避にも有利です。

**欠点**はSaaSが有料であることです。セルフホストも可能ですが、運用負担はUmamiと同程度です。

> **適合:** お金を払ってUIと表示速度だけを重視したい場合。

### 2.3 GoatCounter(OSS)

GoatCounterは**非常に軽量な**オープンソースツールで、無料ティアとセルフホストの両方をサポートします。ページビューとリファラー中心のシンプルな指標を提供します。Cloudflare R2と組み合わせてリダイレクト追跡用に活用する事例もあります。

**欠点**はイベント追跡とセグメンテーション機能が弱く、「読了深度」分析には不十分なことです。

> **適合:** PVだけを超軽量に確認したい場合。

### 2.4 Matomo(OSS)

Matomoは**GA級の機能**(ヒートマップ・セッション・目標)をオンプレミスで提供する強力なツールです。しかし**重く、サーバー・DB負担**が大きく、静的Pagesアーキテクチャとは相性が良くありません。

> **適合:** 現在の規模では**非推奨**。

### 2.5 GA4(+ Zaraz可能)

GA4はスクロール・エンゲージメント時間・遷移経路などが**豊富**です。Zarazと併用すればパフォーマンス低下なしにGA4データを収集できます。

**欠点**はクッキー/同意・プライバシー負担が大きく、コンテンツサイトのイメージと合わず、サンプリングと学習曲線が存在することです。

> **適合:** 広告・ファネル分析が必要な場合のみ。

### 2.6 PostHog / Clarityなど

セッションリプレイ・ヒートマップなど**「どこまで読んだか」**に近いインサイトを提供します。しかし**重くPII・同意の問題**があり、CTI/コラムアーカイブには過剰なツールです。

> **適合:** 製品SaaS向けであり、公開アーカイブの第一候補ではありません。

---

## 3. その他検討に値するツール

| ツール | 種類 | 特徴 | 適合 |
|------|------|------|------|
| **Fathom** | 有料SaaS | Plausibleと類似のプライバシー中心。タイトなシングルページUIと厳格なプライバシーポリシー | Plausibleと似たポジション。UIの好みに応じて選択 |
| **Simple Analytics** | 有料SaaS | Cloudflareアプリとして提供され、インストールが簡単。クッキー未使用 | Cloudflareダッシュボードと統合された体験を望む場合 |
| **Ackee** | OSS・自己ホスト | Node.jsベース。GraphQL APIでカスタムデータクエリ可能 | Node.js環境に慣れておりGraphQLを好む場合 |
| **Pirsch** | 有料SaaS | 月6ドルから始まる低価格なプライバシー中心ツール | 予算が限られたスタートアップ向けのコストパフォーマンスの良い有料オプション |

---

## 4. まとめ:段階別選択ガイド

| 段階 | 推奨ツール | 理由 |
|------|----------|------|
| **段階1:開始** | Cloudflare Web Analytics | 無料・設定0秒・プライバシー安全。「PV+流入経路」確認に最適 |
| **段階2:拡張** | Umami(セルフホスト) | カスタムイベント・複数サイト・データ所有権確保 |
| **段階3:高度** | Plausible(有料)/ Workers Analytics Engine | UI/速度重視、または完全カスタムインフラを望む場合 |
| **特殊目的** | Zaraz + GA4 | 広告・ファネル分析が必須の場合のみ |
| **非推奨** | Matomo / PostHog / Clarity | 現在のコンテンツアーカイブ規模には過剰 |

Cloudflareエコシステム内で最も賢明な戦略は**「Web Analyticsで開始し、必要になったらUmamiに拡張する」**ことです。両者は衝突しないため、並行運用して比較してみるのも良い方法です。データを完全に自分のものにしたいなら、Workers Analytics Engine + Logpush + R2の組み合わせを検討する価値がありますが、その前にUmamiだけでも十分ではないか一度考えてみることをお勧めします。
