---
title: "Supabase 完全ガイド (Full Version)"
description: "オープンソースのFirebase代替であるSupabaseの核心機能、アーキテクチャ、長所短所、Vercel統合方法、料金プランを網羅した完全ガイド"
lang: ja
featured: false
schema_type: TechArticle
date: 2026-06
---

# Supabase 完全ガイド (Full Version)

**バージョン:** 2026年6月時点
**対象:** Vercel + Next.jsベースのフルスタック開発者

---

## 1. Supabaseとは?

Supabaseは**オープンソースのFirebase代替**です。PostgreSQLデータベースを核として、認証(Auth)、リアルタイム(Realtime)、ストレージ(Storage)、エッジ関数(Edge Functions)などを統合的に提供するバックエンドプラットフォーム(BaaS)です。

- **オープンソース**: すべてのコードはGitHubに公開されており、自分でホスティングすることも可能です。
- **PostgreSQLベース**: リレーショナルデータベースの強力さ(JOIN、トランザクション、RLSなど)をそのまま利用できます。
- **開発者体験**: SDK(JavaScript、Flutter、Swift、Pythonなど)およびCLIを提供し、迅速なプロトタイピングが可能です。

---

## 2. 核心機能 (Core Features)

### 2.1 Database (PostgreSQL)

- **完全マネージドPostgreSQL**: バージョン15.x、設定とパッチの自動化。
- **テーブルエディタ**: Web UIでテーブル作成、SQL編集、リレーション設定が可能。
- **SQLエディタ**: オンラインでSQLクエリを実行し履歴を保存。
- **バックアップ & PITR**: 毎日の自動バックアップ、特定時点への復元(Point-in-Time Recovery)はPro以上。
- **スキーママイグレーション**: `supabase migration` CLIでバージョン管理。

### 2.2 Authentication (Auth)

- **サポートするログイン方法**:
  - メール/パスワード(Magic Link含む)
  - ソーシャルOAuth: Google、Apple、GitHub、GitLab、Facebook、Discord、Slack、Kakao(一部プロバイダー)
  - 電話番号SMS認証(Twilio連携が必要)
  - 企業向けSSO(SAML、Azure AD) – Enterpriseプラン
- **JWTベースのセッション**: 自動更新されるアクセス/リフレッシュトークン。
- **Row Level Security (RLS) 統合**: データベースポリシーで`auth.uid()`を直接使用可能。
- **ユーザー管理API**: ユーザーの作成/削除、パスワードリセット、メール変更など。
- **メールテンプレートのカスタマイズ**: 登録確認、パスワードリセットなどのメール内容とSMTP設定が可能。

### 2.3 Storage

- **S3互換オブジェクトストレージ**: 画像、動画、ファイルアップロード。
- **バケットポリシーとRLS**: ファイル単位のアクセス権限をRLSで制御可能。
- **画像変換**: `?width=200&height=200`パラメータで動的リサイズをサポート。
- **公開/非公開バケット**: 署名付きURLによる一時アクセスが可能。

### 2.4 Realtime

- **WebSocketベースのリアルタイムサブスクリプション**: テーブルの変更(INSERT、UPDATE、DELETE)をクライアントにリアルタイム送信。
- **Broadcast**: クライアント間のメッセージブロードキャスト(チャット、共同作業)。
- **Presence**: 接続中のユーザーリスト管理(リアルタイムユーザーステータス)。
- **PostgreSQL Change Data Capture (CDC)**: `REPLICA IDENTITY FULL`設定が必要。

### 2.5 Edge Functions

- **Denoベースのサーバーレス関数**: 世界中のエッジノードで実行(Vercel Edge Functionsと類似)。
- **低レイテンシ**: JWT認証、決済Webhook、AI APIプロキシなどに適しています。
- **サポート言語**: TypeScript、JavaScript(Denoランタイム)。
- **制限**: 実行時間10秒(無料)、メモリ150MB。

### 2.6 Vector (pgvector)

- **PostgreSQL拡張pgvectorを内蔵**: 埋め込みベクトルの保存と類似度検索(コサイン、ユークリッドなど)。
- **AIアプリケーション**: RAG(Retrieval-Augmented Generation)、レコメンドシステムに活用。

### 2.7 GraphQL (pg_graphql経由)

- **自動生成されるGraphQL API**: PostgreSQLスキーマに基づいたGraphQLエンドポイントを提供。
- **フィルタ、ソート、ページング**をサポート。

---

## 3. アーキテクチャの理解

Supabaseは複数のオープンソースコンポーネントを組み合わせて構築されています。

| コンポーネント | 技術 | 役割 |
|----------|------|------|
| **Database** | PostgreSQL | データ保存とクエリ |
| **API** | PostgREST | RESTful APIの自動生成 |
| **Auth** | GoTrue | JWTベースの認証 |
| **Storage** | Supabase Storage(S3ベース) | ファイルアップロード/ダウンロード |
| **Realtime** | Realtime server(Elixir) | WebSocketブロードキャスト |
| **Edge Functions** | Supabase Edge Runtime(Deno) | エッジ関数の実行 |
| **Dashboard** | Next.jsベースのWeb UI | 管理者コンソール |

- すべてのサービスは**オープンソース**であり、それぞれ分離されて拡張可能です。
- クライアントは**1つのAPI URL**ですべてのサービスにアクセスできます(例: `https://<ref>.supabase.co`)。

---

## 4. 長所 (Pros)

### Firebase比較での優位性

- **リレーショナルデータベース**: 複雑なクエリ、JOIN、トランザクションをサポート(Firebase Firestoreはドキュメントベース)。
- **価格の予測可能性**: ユーザー数ベースの課金ではなく、コンピュート+ストレージ+帯域幅ベース。
- **オープンソース**: ベンダーロックインから解放され、自己ホスティングも可能。

### 開発者の生産性

- **15分で認証+DB構築**: UIでテーブル作成、RLSポリシー設定、ソーシャルログインの有効化。
- **自動API生成**: テーブルを作成するだけでREST/GraphQLエンドポイントを即利用可能。
- **TypeScriptサポート**: `supabase gen types`コマンドでDBスキーマ→TypeScript型を自動生成。

### セキュリティ (RLS)

- **データベースレベルの権限管理**: RLSポリシーで「ユーザーは自分の行のみ表示可能」のようなルールをSQLで宣言。
- **デフォルトで全APIに認証が必要**: `anon`キーは限定的なアクセス、`service_role`キーのみが全権限。

### 拡張性

- **PostgreSQLエコシステムの活用**: インデックス、ビュー、関数、トリガー、pg_cron、pgvectorなどの拡張。
- **スケールアップ/アウト**: Proプラン以上で専用コンピュート、リードレプリカ、シャーディングを準備中。

### Vercelとの完璧な相性

- **Vercel Marketplace統合**: 1クリックでSupabaseプロジェクト作成と環境変数の注入。
- **公式`@supabase/ssr`パッケージ**: Next.js App Routerでのクッキーベースセッション管理。
- **エッジ関数間の類似性**: Vercel Edge RuntimeとSupabase Edge Functionsは両方Denoベース→ロジック再利用が容易。

### 無料ティアの魅力

- **50,000人のMAU**(月間アクティブユーザー) – Firebase Authの無料ティアよりはるかに寛容。
- **期間制限なし** – 12ヶ月後に突然課金されることはない。
- **500MB DB、1GBストレージ、2GB帯域幅** – MVP、サイドプロジェクトに十分。

---

## 5. 短所 (Cons)

### 帯域幅のボトルネック(無料ティア)

- **実質的な帯域幅上限2GB**: 公式ドキュメントには5GBと記載されていますが、コミュニティの実測結果では2GB程度で制限がかかります。
- **影響**: 画像・動画中心のアプリは1日で上限を超える可能性があります。APIレスポンス最適化とCDNが必須です。

### Database Compute性能(無料ティア)

- **共有CPU**: ピーク時間帯にクエリ遅延200〜500msが発生する可能性があります。
- **接続プールの制限**: 無料は最大50同時接続、Proは200。

### ソーシャルログインプロバイダーの制限

- **Naver、Kakao、Lineなどの韓国サービス**: 基本的にサポートされていない(OIDC Compliantプロバイダーとして連携可能だが設定が複雑)。
- **中国のプロバイダー(WeChat、QQ)**: なし。

### カスタマイズの難しさ(マネージドの限界)

- **カスタムドメイン**: Proプラン以上($25/月)でのみ可能。
- **JWT有効期限の変更不可**: デフォルト1時間(Google/Auth0などは15分などに設定可能)。
- **SMTPは直接設定可能だが、専用メール送信サービスと比較して機能が劣る**(マーケティングメール、大量送信機能なし)。

### 監査ログの欠如(無料/Pro)

- **Enterpriseでのみ監査ログを提供**: 誰が、いつ、どのデータにアクセスしたかを確認するには$2,500/月が必要。

### ベンダーロックイン(わずかに)

- **RLSポリシー**: Supabaseの`auth.uid()`関数に強く依存すると、他のIdPに移行する際にすべてのポリシーを再作成する必要があります。
- **ストレージURLの形式**: `https://<ref>.supabase.co/storage/v1/...` – 独自ドメインへの切り替え時に作業が必要。

### Realtime性能の問題(大規模時)

- **チャンネルあたりの接続数制限**: 無料は200、Proは5,000、それ以上はRedisベースの拡張が必要。
- **CDCの負荷**: 変更データキャプチャの多いテーブルで使用すると、PostgreSQLのWALに負荷がかかります。

### Edge Functionsの制約

- **実行時間10秒**: 重い作業(動画エンコード、大規模データ処理)は不可。
- **外部ネットワークアクセスの制限**: 無料では一部のIP範囲のみ許可(Proで解除)。
- **ローカルデバッグが難しい**: `supabase functions serve`は遅く、VSCodeデバッガとの連携が不安定。

---

## 6. Vercel + Supabase統合ガイド

### 6.1 基本設定(5分)

1. **Vercelダッシュボード** → Integrations → Supabase → 「Connect」をクリック。
2. 新しいSupabaseプロジェクトを作成するか既存プロジェクトを選択。
3. 環境変数(`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`)を自動注入。
4. `@supabase/ssr`パッケージをインストール:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 6.2 ミドルウェア設定 (`middleware.ts`)

```typescript
import { createMiddlewareClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}
```

> **参考**: `createMiddlewareClient`は`@supabase/ssr` v0.1.0以上で使用します。旧バージョンの`@supabase/auth-helpers-nextjs`と混用しないでください。

### 6.3 Supabaseクライアントの初期化

サーバーコンポーネントとクライアントコンポーネントではそれぞれ異なる方式で初期化します。

**サーバーコンポーネント (Server Component)**

```typescript
import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  // ...
}
```

**クライアントコンポーネント (Client Component)**

```typescript
'use client'
import { createClientComponentClient } from '@supabase/ssr'

export default function Component() {
  const supabase = createClientComponentClient()
  // ...
}
```

### 6.4 Google OAuth設定(ダッシュボードで3分)

1. Supabaseダッシュボード → Authentication → Providers → Googleを有効化。
2. Client ID / Secretを入力 → リダイレクトURLをコピーしてGoogle Cloud Consoleに登録。

### 6.5 RLSの例(掲示板)

```sql
-- テーブル作成
CREATE TABLE posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  content text,
  created_at timestamptz DEFAULT now()
);

-- RLSを有効化
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の投稿のみ表示可能
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

-- ポリシー: ログイン済みユーザーのみ投稿可能
CREATE POLICY "Authenticated users can insert" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 6.6 TypeScript型の生成

```bash
npx supabase gen types typescript --project-id <ref> > types/supabase.ts
```

生成された型をクエリに活用すると、コンパイル時にスキーマエラーを検出できます。

```typescript
import { Database } from '@/types/supabase'

const supabase = createClientComponentClient<Database>()
const { data } = await supabase.from('posts').select('*')
// dataはDatabase['public']['Tables']['posts']['Row'][]型として推論される
```

### 6.7 環境変数の管理

ローカル開発時は`.env.local`に以下を追加します。Vercel統合を使用すればプレビュー/本番環境の環境変数は自動的に注入されます。

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
# 絶対にクライアントに公開しないこと
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

---

## 7. 料金プラン(2026年6月時点)

| プラン | 価格 | MAU | DB容量 | 帯域幅 | Edge Functions | リアルタイム接続 |
|------|------|-----|---------|--------|----------------|------------|
| Free | $0 | 50,000 | 500MB | 2GB | 50万コール/月 | 200 |
| Pro | $25 | 100,000 | 8GB | 100GB | 200万コール/月 | 5,000 |
| Team | $599 | 500,000 | 40GB | 400GB | 500万コール/月 | 20,000 |
| Enterprise | カスタム | 無制限 | 無制限 | 無制限 | 無制限 | 無制限 |

**追加費用:**

- 超過DBストレージ: $0.125/GB(Pro以上)
- 超過帯域幅: $0.09/GB(Pro以上)
- 追加エッジ関数コール: $2/100万回

> **参考:** 無料ティアはプロジェクトあたり2個に制限、Proは組織あたりのプロジェクト数無制限。

---

## 8. Supabaseを選ぶべき場合

### 適したプロジェクト

- **MVP、スタートアップの初期プロダクト**: 迅速な開発速度と無料ティアの寛容なMAU。
- **Vercel + Next.jsフルスタック**: 公式統合により開発者体験を最適化。
- **リレーショナルデータが中心のアプリ**: 注文、予約、在庫管理など複雑なクエリが必要。
- **RLSでデータセキュリティを強化する必要があるサービス**: 医療、金融、個人情報処理。
- **リアルタイム機能が必要なアプリ**: チャット、コラボレーションツール、ダッシュボード。
- **AI/ベクトル検索アプリ**: pgvector内蔵により別途のベクトルDBなしでRAGを実装可能。

### 不適切なプロジェクト

- **メディア帯域幅の大きいアプリ(写真/動画)**: 帯域幅課金が負担になる。代わりにVercel Blob StorageまたはCloudflare R2を検討。
- **韓国のソーシャルログイン(Naver、Kakao)が必須**: Auth.jsまたはPassport.jsを直接実装する方が簡単。
- **エンタープライズの監査ログとSSOが必要**: Auth0、WorkOS、Clerkがより適しています。
- **サーバーレス関数での長時間処理(>10秒)**: バックグラウンドWorkerが必要な場合は別途サーバーが必要。

---

## 9. Supabase vs 競合サービス比較

| 特徴 | Supabase | Firebase | Auth0 | Clerk |
|------|----------|----------|-------|-------|
| データベース | PostgreSQL | Firestore(NoSQL) | なし | なし |
| 認証の無料MAU | 50k | 50k(ユーザー基準) | 7,500 | 10k |
| リアルタイム | サポート(WebSocket) | サポート | 非サポート | 非サポート |
| ストレージ | サポート(S3互換) | サポート | 非サポート | 非サポート |
| オープンソース | 全公開 | 非公開 | 非公開 | 非公開 |
| 自己ホスティング | サポート(Docker) | 非サポート | 非サポート | 非サポート |
| 価格の予測可能性 | 中程度(使用量別) | 低い(リクエストごと) | 高い(MAUごと) | 中程度(MAU+機能) |
| カスタムドメイン | Pro以上 | Blazeプラン以上 | 標準以上 | Pro以上 |
| pgvector / ベクトル検索 | 内蔵 | 非サポート | 非サポート | 非サポート |

---

## 10. よくある質問 (FAQ)

**Q: Supabaseの無料ティアでNaverログインを使えますか?**
A: 直接実装は可能ですが複雑です。Auth.js(NextAuth)を併用する方が簡単です。

**Q: VercelからSupabaseに直接接続しても安全ですか?**
A: はい。`NEXT_PUBLIC_SUPABASE_ANON_KEY`はデフォルトで安全ですが、RLSでデータを保護する必要があります。`service_role`キーは絶対にクライアントに公開しないでください。

**Q: Supabaseでメールマーケティング(ニュースレター)を送れますか?**
A: SMTPを接続できますが、大量送信用ではありません。Resend、SendGrid、Brevoのような専用サービスを使用してください。

**Q: 本番環境で無料ティアを使ってもよいですか?**
A: ユーザーが少なく(MAU < 5,000)、帯域幅が小さければ可能です。ただしトラフィックが急増した場合は有料への切り替えを検討してください。

**Q: Supabaseを自己ホスティングすれば完全無料ですか?**
A: サーバーコスト(クラウドVMまたはオンプレミス)は発生します。管理オーバーヘッドも大きいため、小規模ではマネージドの方が経済的です。

**Q: pgvectorでRAGを実装するにはどのプランが必要ですか?**
A: 無料プランでもpgvector拡張を有効化できます。ただし、埋め込みベクトル数が増えるとDB容量500MBの上限に注意が必要です。

**Q: Connection Poolingはどのように設定しますか?**
A: SupabaseはPgBouncerを内蔵しています。接続文字列でポートを`5432`(直接接続)から`6543`(Poolerモード)に変更すればよいです。サーバーレス環境(Next.js API Routes、Edge Functions)では必ずPoolerを使用してください。

---

## 11. 追加学習リソース

- **公式ドキュメント**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel統合**: [vercel.com/integrations/supabase](https://vercel.com/integrations/supabase)
- **GitHubリポジトリ**: [github.com/supabase/supabase](https://github.com/supabase/supabase)
- **Discordコミュニティ**: [discord.supabase.com](https://discord.supabase.com)
- **Supabase YouTubeチャンネル**: 公式チュートリアルとリリースノート動画を提供

---

## 12. 結論

Supabaseは、オープンソースの自由さとマネージドサービスの便利さを絶妙に組み合わせたプラットフォームです。Vercelとのシナジー、PostgreSQLの強力さ、寛容な無料ティアのおかげで、個人開発者からスタートアップまで幅広く愛用されています。

ただし、帯域幅の制限と韓国のソーシャルログインサポートの不備は明確な短所です。プロジェクトの要件を吟味して、Supabaseを導入するか代替案を検討するか決定してください。

「Supabaseは単なるFirebaseの代替を超えて、オープンソースエコシステムの新しい標準になりつつあります。」
