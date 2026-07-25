---
title: "エージェント・フレンドリーなWebサイト構築のための実践技術ガイド"
title_en: "Agent-Friendly Website Construction: A Practical Technical Guide"
description: "AIエージェント時代のWeb UX・アクセシビリティ・構造化標準を統合した実践ガイド。Google web.dev、Chrome WebMCP、llms.txt標準に基づく。"
slug: agent-friendly-website-guide
language: ja
languages_available: [ko, en, ja, zh]
canonical: https://github.com/gameworkerkim/vibe-investing/blob/main/TechDoc/agent-friendly-website-guide/agent-friendly-website-guide.ja.md
version: "1.0"
date_published: 2026-05-19
last_updated: 2026-05-19
author:
  name: "Dennis Kim (キム・ホグァン / 김호광)"
  role: "Betalabs Inc. CEO・Cyworld Z 前CEO・Microsoft Azure MVP"
  github: gameworkerkim
  publication: Web3Paper
license: CC-BY-4.0
schema_type: TechArticle
keywords:
  - AIエージェント
  - エージェント・フレンドリー
  - llms.txt
  - WebMCP
  - セマンティックHTML
  - アクセシビリティツリー
  - Schema.org
  - JSON-LD
  - GEO
  - Generative Engine Optimization
  - Core Web Vitals
  - Model Context Protocol
  - MCP
  - Web標準
  - SEO
tags:
  - ai-agents
  - web-development
  - accessibility
  - semantic-html
  - llms-txt
  - webmcp
  - schema-org
  - geo
  - chrome
  - google-web-dev
audience:
  - フロントエンドエンジニア
  - テクニカルライター
  - DevRel・開発者マーケティング
  - プロダクトマネージャー
  - SEO/GEO担当者
  - CTO・開発リード
sources:
  - title: "エージェント・フレンドリーなWebサイトの構築"
    authors: ["Kasper Kulikowski", "Omkar More"]
    publisher: "Google web.dev"
    date: 2026-04-01
    url: https://web.dev/articles/ai-agent-site-ux
  - title: "エージェント概要"
    authors: ["Alexandra Klepper", "Kasper Kulikowski", "Rachel Lee Nabors"]
    publisher: "Google web.dev"
    date: 2025-02-25
    url: https://web.dev/articles/ai-agents
  - title: "WebMCP Early Preview Program"
    authors: ["André Cipriani Bandarra"]
    publisher: "Chrome for Developers"
    date: 2026-02-10
    url: https://developer.chrome.com/blog/webmcp-epp
  - title: "The /llms.txt file"
    authors: ["Jeremy Howard"]
    publisher: "Answer.AI"
    date: 2024-09
    url: https://llmstxt.org
---

# エージェント・フレンドリーなWebサイト構築のための実践技術ガイド

> AIエージェントがユーザーに代わってWebサイトを巡回・要約・決済する時代が到来しました。本ガイドは、Google web.dev (2026-04-01)、Chrome WebMCP EPP (2026-02-10)、Jeremy Howardのllms.txt標準を統合し、エージェントが自社サイトを正確に理解しタスクを完遂できるようにするための、全11章+付録の実務マニュアルです。

🌐 **他の言語** — [한국어](./agent-friendly-website-guide.ko.md) · [English](./agent-friendly-website-guide.en.md) · [中文](./agent-friendly-website-guide.zh.md)

📌 **タグ** — `#AIエージェント` `#WebMCP` `#llms-txt` `#セマンティックHTML` `#アクセシビリティ` `#Schema.org` `#GEO` `#CoreWebVitals` `#MCP`

---

## ひと目で分かる要点 (TL;DR)

- **対象読者**: フロントエンドエンジニア、テクニカルライター、DevRel、PM、SEO/GEO担当者、CTO
- **得られるもの**: エージェントがサイトを認識する3つの方法、Googleの7原則、セマンティックHTML・ARIA・Schema.orgのコード例、llms.txtの標準構造、WebMCP導入戦略、4段階の導入ロードマップ
- **なぜ今**: Pew Research (2024) によると、Google検索でAI要約を見たユーザーは検索結果リンクのクリック率が約半分に低下。トラフィックの半分以上が「エージェントが自社サイトを理解できるか」に依存する時代になりました
- **読了時間**: 約35分・実装着手は1〜2週間で可能

---

## 目次

1. [新しい訪問者: AIエージェントの台頭](#1-新しい訪問者-aiエージェントの台頭)
2. [エージェントはWebサイトをどう見るか](#2-エージェントはwebサイトをどう見るか)
3. [Googleの7つのエージェント・フレンドリー原則](#3-googleの7つのエージェントフレンドリー原則)
4. [セマンティックHTMLとアクセシビリティツリーの実践ガイド](#4-セマンティックhtmlとアクセシビリティツリーの実践ガイド)
5. [レイアウトの安定性と視覚的シグナル](#5-レイアウトの安定性と視覚的シグナル)
6. [構造化データ: Schema.orgとJSON-LD](#6-構造化データ-schemaorgとjson-ld)
7. [AIの入口標準 — llms.txt](#7-aiの入口標準--llmstxt)
8. [WebMCP — 次世代のエージェント・インターフェース](#8-webmcp--次世代のエージェントインターフェース)
9. [エージェント・フレンドリーな実装事例](#9-エージェントフレンドリーな実装事例)
10. [エージェント・フレンドリー度監査チェックリスト](#10-エージェントフレンドリー度監査チェックリスト)
11. [段階的導入ロードマップ](#11-段階的導入ロードマップ)
- [付録A. 用語集](#付録a-用語集)
- [付録B. 参考文献と出典](#付録b-参考文献と出典)

---

## 1. 新しい訪問者: AIエージェントの台頭

### 1.1 「エージェント」とは何か

Google web.devの定義によれば、エージェントとは「入力を受信・解釈し、ユーザー(人間または他のエージェント)に代わって計画を立て、タスクを実行するシステム」です。エージェントは単一のLLMではなく、**モデル・ルール・メモリ・ツール**が結合された統合ユニットです。

#### エージェントを定義する4つの特性

- **自律的 (Autonomous)**: 人間の直接介入なしに動作可能
- **対話的 (Interactive)**: 他のエージェントや人間と会話できる
- **反応的 (Reactive)**: 環境変化を認識し応答する
- **能動的 (Proactive)**: 目標達成のために自ら行動する

#### エージェントの4段階タスクプロセス

1. **クエリ受信** — ユーザーの自然言語要求、または他エージェントからの要求を受け取る
2. **計画立案** — 要求を解決する手順をLLMで生成する
3. **計画実行** — ツール(API、ブラウザ、MCPサーバーなど)を呼び出して実行する
4. **学習保存** — 結果とコンテキストを短期・長期メモリに記録する

### 1.2 人間・クローラー・エージェントの違い

同じWebサイトを訪問しても、3種類の訪問者はまったく異なる方法で動作します。

| 訪問者タイプ | 行動パターン | 意図 | 最適化ポイント |
|---|---|---|---|
| 人間ユーザー | 視覚・感情・文脈ベースの探索 | 購入・情報・娯楽 | デザイン、コピー、性能、アクセシビリティ |
| 検索クローラー | リンクグラフ収集 | インデックス・ランキング | robots.txt、sitemap.xml、メタデータ |
| 学習クローラー (Common Crawl等) | 大規模テキスト収集 | LLM学習データ | robots.txt、AI学習拒否ポリシー |
| **AIエージェント (代理人)** | **目標指向のアクション実行** | **ユーザータスクの完遂(購入、予約、フォーム入力)** | **セマンティックHTML、アクセシビリティツリー、WebMCP、llms.txt** |

> 💡 **重要な違い**: クローラーは「読む」だけですが、エージェントは「読む + クリック + 入力 + 決済」まで実行します。そのためエージェントは、セキュリティ・同意・視覚的安定性の面で、はるかに厳しい要件を持ちます。

### 1.3 データ所有関係から見たエージェントの3タイプ

- **ゼロパーティ・エージェント (Zero-party)** — ブラウザ内のローカルデータのみで動作 (例: Chrome内蔵のGemini Nano)。プライバシー保護の観点で最も安全。
- **ファーストパーティ・エージェント (First-party)** — サービス運営主体が自社データで構築したエージェント (例: GoogleがGoogleマップ上で提供する旅行プランナー)。信頼性と制御性が最大。
- **サードパーティ・エージェント (Third-party)** — 外部開発者が作ったエージェントが自社サイトをデータソースとして使用 (例: ユーザーのChatGPTが自社ECで注文する)。この場合、自社サイトは**「エージェントのサードパーティ情報提供者」**になります。

> 📌 **実務上の示唆**: 日本のEC・旅行・フィンテックサイトの多くは「サードパーティ・エージェントの情報提供者」の立場に置かれます。決済・認証・利用規約同意のフローについて、エージェントが処理できるよう明示的な確認ステップ (Human-in-the-loop) を設計してください。

---

## 2. エージェントはWebサイトをどう見るか

エージェントはモニターでWebサイトを「見ません」。サイトの**機械可読表現 (machine-readable representation)** 上で動作します。この表現の品質がエージェントの性能を決定し、Googleは3つの基本モダリティを定義しています。

### 2.1 モダリティ1: スクリーンショット (視覚分析)

エージェントがレンダリングされたページをキャプチャし、ビジョンモデルで分析する方式です。右上の虫眼鏡アイコンは検索ボックス、ページ中央の大きなボックスは入力フォーム、といった具合に視覚信号を解釈します。**色・サイズ・近接性が重要度を決定**し、大きな「削除」ボタンは小さな「ヘルプ」リンクより慎重に扱われます。

- **長所**: CSS・JSで完全にレンダリングされた最終画面を見るため、視覚デザインの信号をそのまま活用可能
- **短所**: トークンコストが非常に高く遅い。通常はDOM・アクセシビリティツリーが乱れた際のバックアップ手段

### 2.2 モダリティ2: HTML / DOM

エージェントがDOMツリーを直接パースし、要素間の関係と階層構造を読み取る方式です。「今すぐ購入」ボタンがある商品コンテナ*内部*にあれば、エージェントはそのボタンが*その商品*に属すると推論します。**DOMのネスト構造とクラス・ID命名が意味を持つ**必要があります。

### 2.3 モダリティ3: アクセシビリティツリー (Accessibility Tree)

アクセシビリティツリーは、ブラウザが標準提供するAPIで、DOMから最も重要な**「対話的要素のロール (role)・名前 (name)・状態 (state)」**だけを抽出したセマンティックな要約です。本来はスクリーンリーダーなど支援技術のために設計されましたが、AIエージェントにとってはCSSの視覚的ノイズを全て取り除いた**「高品質な地図」**として機能します。

> 🔍 **確認方法**: Chrome DevTools → Elements → 右側「Accessibility」パネル → 「Full-page accessibility tree」を有効化。ここで「button」「link」「textbox」などのロールラベルが欠落している場所が、エージェントが失敗するポイントです。

### 2.4 複合モダリティ (Combined Modalities)

最新のエージェント (ChatGPT Agent、Claude for Chrome、Gemini in Chromeなど) は単一の入力に依存しません。DOM・アクセシビリティツリーで対話的要素の構造化リストを取得し、スクリーンショットで視覚的位置とグルーピングをクロスチェックします。

> 🎯 **開発者の役割**: スクリーンショット・DOM・アクセシビリティツリー — この3つのチャネルすべてでクリーンな信号を一貫して提供すること。いずれか1つだけでは不十分で、3つが相互補強したときエージェントは最も安定して動作します。

---

## 3. Googleの7つのエージェント・フレンドリー原則

Google web.devが提示するエージェント・フレンドリーなサイト構築の7つの推奨事項を、コード例とともに詳しく解説します。**これらすべての原則は同時に人間ユーザーのアクセシビリティ・UXも改善します。**

### 原則1. 必須アクションはすべてUIに明示する

キーボードショートカットや右クリックメニューからのみアクセス可能な機能は、エージェントが発見できません。

- ❌ **悪い例**: `Ctrl+Shift+D`を押さないとダウンロードメニューが出ないSaaSダッシュボード
- ✅ **良い例**: ツールバーに明示的な[ダウンロード]ボタンがあり、ショートカットは補助手段

### 原則2. レイアウトの安定性を保証する

「カートに追加」ボタンがカテゴリーごとに異なる位置にあれば、エージェントはカテゴリーごとに学習し直さなければなりません。

**実務上の推奨**:
- テンプレートレベルで「主要CTAの位置」を標準化
- CLS (Cumulative Layout Shift) を0.1以下に維持 (Core Web Vitals)
- スケルトンUIで読み込み中も最終レイアウトの形を保つ
- 動的に位置を変える「跳ねる」広告バナーを避ける

### 原則3. 「ゴースト要素」と透明オーバーレイを避ける

透明なdivが本物のボタンを覆っている場合、エージェントの視覚分析は「覆われたノード」を無視する可能性があります。

```css
/* ❌ 悪い例: 見えないdivがボタンを覆う */
.overlay-trap {
  position: absolute;
  inset: 0;
  background: transparent;
  z-index: 9999;
}

/* ✅ 良い例: pointer-eventsの明示 + 適切なz-index */
.overlay-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;  /* クリックは下に通る */
  z-index: 1;
}
```

### 原則4. セマンティックHTMLで実行可能要素を設計する

divやspanをボタン風に装飾せず、`<button>`と`<a>`タグを直接使用してください。エージェントはこの2つのタグを無条件に対話的と認識します。デザインはCSSでいくらでも変更できます。

```html
<!-- ❌ 悪い例: divボタン -->
<div class="btn-primary" onclick="submit()">注文する</div>

<!-- ⚠️ 次善策: セマンティックが不可能な場合はARIAで補強 -->
<div role="button" tabindex="0"
     aria-label="注文する"
     onclick="submit()"
     onkeydown="if(event.key==='Enter')submit()">
  注文する
</div>

<!-- ✅ 良い例: 本物のbutton -->
<button type="submit" class="btn-primary">注文する</button>
```

### 原則5. CSSに`cursor: pointer`を設定する

マウスカーソルが指型に変わることは、エージェントのビジョンモデルにとっても「ここはクリック可能」という強力な信号です。

```css
.product-card { cursor: pointer; }
.disabled-button { cursor: not-allowed; }
```

### 原則6. `<label>`の`for`属性で入力フィールドを連結する

`placeholder`だけでは不十分です — placeholderは入力開始時に消え、アクセシビリティツリーにも含まれません。

```html
<!-- ❌ 悪い例: placeholderのみ -->
<input type="email" placeholder="メールアドレスを入力" />

<!-- ✅ 良い例: labelとfor/id連結 -->
<label for="user-email">メールアドレス</label>
<input type="email"
       id="user-email"
       name="email"
       autocomplete="email"
       required
       placeholder="name@example.com" />

<!-- ✅ さらに良い例: 視覚的にラベルを隠しつつA11yツリーに残す -->
<label for="search" class="sr-only">サイト検索</label>
<input type="search" id="search" name="q" />
```

### 原則7. 対話的要素は8平方ピクセルより大きくする

8ピクセル×8ピクセル (=64平方ピクセル) 未満の要素は、エージェントの視覚分析が「ノイズ」としてフィルタリングする可能性があります。

- 主要CTAボタン: 最低44×44px (Apple HIG準拠)
- フォームフィールド高さ: 最低40px
- アイコンボタン: 視覚的には24pxでも、paddingでヒットエリアを44px以上確保
- 閉じる (X) ボタン: 見た目は小さくても、クリック領域は十分に

---

## 4. セマンティックHTMLとアクセシビリティツリーの実践ガイド

### 4.1 「divスープ」から「セマンティック・ランドマーク」へ

多くのReact/Vueプロジェクトは依然として、コンポーネントをすべてdivで囲む「divスープ」状態です。この状態ではアクセシビリティツリーがほぼフラットになり、エージェントはページの「地図」を描けません。

| セマンティックタグ | A11yツリー上のロール | エージェントの活用 |
|---|---|---|
| `<header>` | banner | サイト識別、ロゴ・ナビ認識 |
| `<nav>` | navigation | 主要メニューの自動発見 |
| `<main>` | main | 本文コンテンツ領域の把握 |
| `<article>` | article | 独立コンテンツ単位(ブログ記事等)の認識 |
| `<aside>` | complementary | 補助情報領域の区別 |
| `<footer>` | contentinfo | サイト情報・規約位置の把握 |
| `<section>` | region (aria-label必要) | トピック別グルーピング |
| `<button>` | button | クリック可能アクションの即時認識 |
| `<a href>` | link | ナビゲーション対象の認識 |
| `<input>` | textbox / checkbox / radio等 | フォームフィールドの自動マッピング |

### 4.2 ページ骨格の模範例

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>製品詳細 - Acme</title>
  <link rel="alternate" type="text/markdown"
        href="/products/widget-pro.md" />  <!-- llms.txt互換 -->
</head>
<body>
  <header>
    <a href="/" aria-label="ホーム">
      <img src="/logo.svg" alt="Acme" />
    </a>
    <nav aria-label="主要メニュー">
      <ul>
        <li><a href="/products">製品</a></li>
        <li><a href="/pricing">料金</a></li>
        <li><a href="/docs">ドキュメント</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <h1>Widget Pro</h1>
      <section aria-labelledby="specs">
        <h2 id="specs">仕様</h2>
        <!-- ... -->
      </section>
      <button type="button" data-action="add-to-cart">
        カートに追加
      </button>
    </article>
  </main>

  <footer>
    <p>© 2026 Acme</p>
  </footer>
</body>
</html>
```

### 4.3 ARIA: セマンティックを補強する4つの核心属性

#### `aria-label` / `aria-labelledby`

要素に「名前」を与えます。アイコンボタンのようにテキストがない場合は必須です。

```html
<!-- アイコンのみの閉じるボタン -->
<button aria-label="ウィンドウを閉じる">
  <svg><!-- X icon --></svg>
</button>

<!-- 他要素のテキストをラベルに -->
<section aria-labelledby="pricing-title">
  <h2 id="pricing-title">料金プラン</h2>
</section>
```

#### `aria-describedby`

追加の説明を関連付けます。フォームフィールドのヘルプテキストやエラーメッセージでよく使います。

```html
<label for="pwd">パスワード</label>
<input id="pwd" type="password"
       aria-describedby="pwd-help pwd-error" />
<p id="pwd-help">8文字以上、英数字・記号を含む</p>
<p id="pwd-error" role="alert">パスワードが短すぎます</p>
```

#### `aria-expanded`, `aria-controls`

ドロップダウン・アコーディオン・モーダルの状態と制御関係を表現します。エージェントが「今開いているか/閉じているか」を知ることができます。

```html
<button aria-expanded="false" aria-controls="faq-1">
  配送にはどれくらいかかりますか?
</button>
<div id="faq-1" hidden>
  営業日ベースで2〜3日です。
</div>
```

#### `role`

セマンティックタグが使えない場合に役割を明示。`tabindex="0"`とキーボードイベントハンドラを併せて提供し、完全な「ボタン」を作ります。

```html
<div role="button" tabindex="0"
     aria-label="テーマ切り替え"
     onclick="toggleTheme()"
     onkeydown="if(['Enter',' '].includes(event.key))toggleTheme()">
  🌙
</div>
```

> 📐 **ARIAの第1法則**: 「可能ならARIAを使わずセマンティックHTMLを使え」。ARIAはセマンティックHTMLで表現不可能なパターン(タブ、ツリービュー、コンボボックスなど)でのみ使用します。誤用されたARIAは、何もないより悪い結果を生みます。

---

## 5. レイアウトの安定性と視覚的シグナル

### 5.1 Core Web Vitalsとエージェント

| 指標 | 意味 | エージェント観点での影響 |
|---|---|---|
| **LCP** | Largest Contentful Paint (< 2.5秒) | エージェントがページ「準備完了」と判断する時点 |
| **INP** | Interaction to Next Paint (< 200ms) | クリック後の応答性 — タイムアウト回避 |
| **CLS** | Cumulative Layout Shift (< 0.1) | スクリーンショット・座標ベースのクリック精度を左右 |

### 5.2 エージェントのクリックを潰す「透明オーバーレイの罠」4パターン

UX QAチェックリストに必ず含めてください。

1. **クッキー同意バナー** — ページ読み込み直後に画面全体を覆い、エージェントが本文に到達できない
2. **ニュースレターモーダル** — 3秒後に自動表示。閉じるボタンが小さすぎる、ESCで閉じない
3. **フローティング・チャットボット** — 右下のCTAボタンを隠し、「購入」クリックを失敗させる
4. **z-indexが誤ったヘッダー** — スクロール時にコンテンツを覆い、座標ベースのクリックが外れる

> ✅ **推奨対応**: クッキー同意はセマンティック`<dialog>`に`role="dialog"`, `aria-modal="true"`を明示し、初期フォーカスを「同意」または「拒否」ボタンに置きます。エージェントがモーダルの存在を正しく認識し、適切に応答できます。

### 5.3 視覚的シグナル・チェックリスト

- [ ] ホバー時に`cursor: pointer`を明示
- [ ] フォーカスリングを絶対に削除しない (`outline: none`は禁止)
- [ ] 主要CTAは色・サイズ・余白で視覚的階層を確保
- [ ] 非活性状態は`cursor: not-allowed` + `opacity: 0.5`
- [ ] ホバー状態で位置・サイズが変わらないよう、`transform: scale`より色変化を優先

---

## 6. 構造化データ: Schema.orgとJSON-LD

セマンティックHTMLが「この要素は何か」を伝えるなら、構造化データ (Structured Data) は「このページ全体が何についてのものか」を伝えます。エージェントはSchema.org語彙でマーキングされたJSON-LDを**信頼性の高い事実情報 (ground truth)** として扱います。

### 6.1 なぜJSON-LDか

- **Microdata/RDFaに比べて分離度が高い**: HTMLマークアップを汚さず`<script>`タグに隔離
- **Google・Bing・LLMがすべて推奨**: Anthropic、OpenAI、Perplexityがいずれも優先的にパース
- **管理が容易**: CMS・静的サイトジェネレーターでテンプレート化しやすい

### 6.2 押さえるべき6つのスキーマ

#### Organization — すべてのサイトの基本

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Betalabs Inc.",
  "url": "https://betalabs.io",
  "logo": "https://betalabs.io/logo.svg",
  "sameAs": [
    "https://github.com/betalabs",
    "https://www.linkedin.com/company/betalabs"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@betalabs.io",
    "availableLanguage": ["ko", "en", "ja"]
  }
}
```

#### Product — EC

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Widget Pro",
  "sku": "WP-2026-001",
  "brand": { "@type": "Brand", "name": "Acme" },
  "description": "高性能ウィジェット、日本語対応",
  "image": "https://acme.com/widget.jpg",
  "offers": {
    "@type": "Offer",
    "price": "4980",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock",
    "url": "https://acme.com/products/widget-pro"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "342"
  }
}
```

#### FAQPage — カスタマーサポート

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "返品ポリシーはどうなっていますか?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "ご購入後14日以内、未使用の状態であれば全額返金いたします。"
    }
  }]
}
```

#### BreadcrumbList — サイト階層

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1,
      "name": "ホーム", "item": "https://acme.com/" },
    { "@type": "ListItem", "position": 2,
      "name": "製品", "item": "https://acme.com/products" },
    { "@type": "ListItem", "position": 3,
      "name": "Widget Pro" }
  ]
}
```

#### Article — ブログ・ニュース / Event — イベント・ウェビナー

両スキーマとも`datePublished`、`author`、`location`などのフィールドが核心です。詳細は[schema.org](https://schema.org)公式ドキュメントを参照してください。

> 🛠 **検証ツール**: [Google Rich Results Test](https://search.google.com/test/rich-results)と[Schema Markup Validator](https://validator.schema.org)でJSON-LDを検証できます。リリース前のゲートに必ず通してください。

---

## 7. AIの入口標準 — llms.txt

robots.txtがクローラー向けの規約なら、**llms.txtは「推論時点 (inference time) のLLMエージェント」のための入口ファイル**です。2024年9月、Jeremy Howard (Answer.AI共同創業者) が提案し、2026年現在、**Anthropic、Cloudflare、Vercel、Stripe、Perplexity、Maryland.gov**などが採用しています。WordPress (Yoastプラグイン)、Webflow、Mintlifyはネイティブサポートを提供します。

### 7.1 なぜ必要か

LLMはコンテキストウィンドウが限られており、一般的なHTMLサイト全体を一度に読めません。広告・ナビゲーション・JavaScriptレンダリングを経るとトークンの半分以上が「ノイズ」に消費されます。llms.txtはサイトの核心コンテンツをマークダウンでキュレートされた「チートシート」として提供し、**トークン使用量を50〜70%削減**します。

### 7.2 2つのファイル

| ファイル | 役割 | 大まかなサイズ |
|---|---|---|
| `/llms.txt` | サイトの地図 (目次 + リンク) | 1,000〜3,000トークン |
| `/llms-full.txt` | 全コンテンツを平坦化した単一マークダウン | 数万〜数十万トークン |

Profoundの計測によれば、AIエージェントは`/llms-full.txt`を`/llms.txt`の**約2倍の頻度で訪問**しています。最初は`llms.txt`から始め、運用基盤が整ってから`llms-full.txt`を追加するのが一般的です。

### 7.3 llms.txt標準構造

```markdown
# Acme Web3 Platform

> AcmeはアジアおよびAPAC市場向けにブロックチェーンインフラを
> 運営しています。ステーブルコイン発行、K-POPチケッティング、
> NFTマーケットプレイスを提供します。

主要コンセプト:
- すべてのAPIはREST + WebSocketで提供
- 認証: API Key または OAuth 2.0
- 韓国語・英語・日本語・中国語の4言語対応

## 核心ドキュメント

- [スタートガイド](https://acme.io/docs/getting-started.md):
  5分で最初のトランザクションを実行するチュートリアル
- [APIリファレンス](https://acme.io/docs/api.md):
  すべてのエンドポイント、パラメータ、レスポンス形式
- [SDK](https://acme.io/docs/sdk.md):
  JavaScript、Python、Go、Java SDK

## ソリューション

- [ステーブルコイン (STABLE1)](https://acme.io/products/stable1.md)
- [チケッティングNFT](https://acme.io/products/ticketing.md)

## Optional

- [会社概要](https://acme.io/about.md)
- [ブログ (最新30件)](https://acme.io/blog/feed.md)
```

#### 構造ルール

1. 1行目に`# H1` (サイト名) — **必須**
2. `>` 引用ブロックで1〜3文の要約 — **強く推奨**。LLMの「サイトのメンタルモデル」になる
3. 一般的なマークダウン段落で核心コンテキスト — 推奨
4. `## H2`セクションでページをグルーピング (核心ドキュメント、ソリューション、ポリシー等)
5. 各項目は`[タイトル](URL.md): 1文の説明`形式
6. `## Optional`セクションは「あってもなくてもよい」資料 — LLMが優先度を下げる

### 7.4 ページ別.md変換

llms.txtが「地図」なら、ページ別.mdファイルは「領土」です。同じURLを.md拡張子で要求したとき、クリーンなマークダウンで応答するようサーバーを設定してください。

```http
# パターン1: 拡張子分岐
GET /products/widget-pro      → HTML (人間向け)
GET /products/widget-pro.md   → Markdown (LLM向け)

# パターン2: Content-Type ネゴシエーション
GET /products/widget-pro
Accept: text/markdown          → Markdownを返す
Accept: text/html              → HTMLを返す
```

各ページのHTMLの`<head>`には、次のようにマークダウン代替を明示するとよいです。

```html
<link rel="alternate"
      type="text/markdown"
      href="https://acme.io/products/widget-pro.md" />
```

### 7.5 運用上の注意

> ⚠️ **最も多い失敗パターン**: llms.txtを一度作って更新しないこと。**古いインデックスは無いより悪い** — エージェントに誤った情報を積極的に提供してしまうからです。サイトマップ・ビルドパイプラインにllms.txt再生成を統合し、主要リリース時に即時反映されるよう自動化してください。

### 7.6 robots.txtとの関係

robots.txtは「ここには来るな」と言い、llms.txtは「これが重要だ」と言います。**互いに補完関係であり、衝突しません**。AI学習拒否ポリシーはrobots.txtとは別に、`ai.txt`またはIETF AI Preferences Working Groupが整備中の標準に従ってください。

---

## 8. WebMCP — 次世代のエージェント・インターフェース

**WebMCPはChromeチームが2026年2月にEarly Preview Program (EPP) として公開した提案標準**です。現在の「DOMをスクリーンショット・アクセシビリティツリーで推論する方式」は堅牢ですが遅いです。WebMCPはWebサイトがエージェントに直接「構造化ツール (Tool)」を公開するチャネルを提供し、曖昧さを排除して作業速度と信頼性を大幅に高めます。

### 8.1 2種類のAPI

#### 宣言的API — HTMLフォームから直接

標準化されたアクションはHTMLだけで宣言できます。

```html
<!-- 概念的な例 (正確な構文はEPPドキュメント参照) -->
<form data-mcp-tool="searchProducts"
      data-mcp-description="カタログから製品を検索">
  <label for="q">検索ワード</label>
  <input id="q" name="query"
         data-mcp-param="query"
         data-mcp-type="string"
         required />
  <label for="price">最大価格(円)</label>
  <input id="price" name="max_price"
         data-mcp-param="max_price"
         data-mcp-type="number" />
  <button type="submit">検索</button>
</form>
```

#### 命令的API — JavaScriptで動的にツール登録

複雑なフロー(多段階決済、リアルタイム見積など)はJavaScriptでツールを登録します。

```javascript
// 概念的な擬似コード
navigator.mcp?.registerTool({
  name: 'createSupportTicket',
  description: '技術サポートチケットを作成します',
  parameters: {
    title: { type: 'string', required: true },
    severity: { type: 'enum',
                values: ['low', 'normal', 'high', 'critical'] },
    description: { type: 'string' }
  },
  handler: async ({ title, severity, description }) => {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      body: JSON.stringify({ title, severity, description })
    });
    return await res.json();
  }
});
```

### 8.2 主要なユースケース

- **カスタマーサポート**: エージェントがユーザーのシステム環境 (OS・ブラウザ・アプリバージョン) を自動入力し、正確なサポートチケットを作成
- **EC**: エージェントが商品検索・オプション選択・決済フローを正確にナビゲート
- **旅行**: 構造化された検索・フィルタ・予約。航空券予約のような多段階タスクに強い
- **フィンテック/Web3**: ウォレット接続、トランザクション署名のようなセキュリティ重要タスクの意図を明示的に表現

### 8.3 Early Preview Program (EPP) への参加

Chrome WebMCP EPPは[developer.chrome.com/docs/ai/join-epp](https://developer.chrome.com/docs/ai/join-epp)から参加可能です。

> 🚀 **導入戦略**: すべてのページに即WebMCPを適用する必要はありません。最も価値の高い「エージェントに任せたい核心タスク3〜5個」をまず特定してください(例: 商品検索、決済、サポートチケット作成)。これらでPoCを進め、標準が安定してから全社展開します。

---

## 9. エージェント・フレンドリーな実装事例

### 9.1 Anthropic Docs

- **URL**: [docs.anthropic.com](https://docs.anthropic.com) · **llms.txt**: [docs.anthropic.com/llms.txt](https://docs.anthropic.com/llms.txt)
- Mintlifyでホスティングされ、全ドキュメントに.md変換が自動提供
- llms.txtとllms-full.txtの両方を提供
- コードブロックに明確な言語タグとコピーボタン
- 左側ツリーナビゲーションがセマンティック`<nav>`でマークアップ
- MCPサーバー (mcpdoc) で同じコンテンツをIDEに公開

### 9.2 Vercel

- **URL**: [vercel.com](https://vercel.com) · **llms.txt**: [vercel.com/docs/llms.txt](https://vercel.com/docs/llms.txt)
- APIエンドポイントごとに文脈説明が豊富 — エージェントのツール選択精度↑
- ドキュメントURLに.mdをつけるとマークダウンで返る
- CTAボタンが全ページで同じ位置 — レイアウトの安定性

### 9.3 Cloudflare Developers

- **URL**: [developers.cloudflare.com](https://developers.cloudflare.com) · **llms.txt**: [developers.cloudflare.com/llms.txt](https://developers.cloudflare.com/llms.txt)
- llms.txt + llms-full.txtの両方
- 製品別グルーピングが`## H2`セクションで明確に分離
- WorkersコードサンプルはPlayground URLを同梱

### 9.4 Stripe Docs

- **URL**: [docs.stripe.com](https://docs.stripe.com)
- Stripe WorkbenchでLLMが実際のAPI呼び出しをシミュレート可能
- ページごとに「APIオブジェクト・スキーマ」がJSON-LDでマーキング
- Idempotency Key、エラーコードなど「エージェントの信頼性に決定的な情報」をヘッダーレベルで露出

### 9.5 Maryland.gov — 公共部門の事例

- **URL**: [maryland.gov](https://www.maryland.gov) · **llms.txt**: [maryland.gov/llms.txt](https://www.maryland.gov/llms.txt)
- 「法的・政策的・資格判定には使用しないこと」という利用ポリシーをllms.txtに明示
- アクセシビリティポリシー、連絡先、更新頻度を明示
- 公共サイトがllms.txtで「AI向け利用ガイド」を提供した初の模範事例

### 9.6 Mintlifyホスティング・サイト群

[Mintlify](https://mintlify.com)はホスティングするすべてのドキュメントサイトに自動でllms.txt + MCPサーバーを提供します。Cursor、Bolt.new、Resend、Octokitなど数千のドキュメントサイトがこの標準の直接的な受益者です。社内ドキュメントサイトに迅速に適用したい場合、Mintlifyまたはその代替 (Docusaurus + docusaurus-plugin-llms、Astro Starlight) を検討してください。

### 9.7 自社サイトに適用する7つの教訓

1. ドキュメント・核心ページに.md代替URLを提供する
2. /llms.txtをドメインルートに置く
3. 核心CTAの位置を全ページで同じに保つ
4. APIオブジェクト・製品・組織情報はJSON-LDでマーキング
5. コード例は常に実行可能な環境(Playground/Replit)にリンク
6. ポリシー・免責事項をllms.txtに明示
7. 主要ワークフロー3〜5個をWebMCP候補として特定

---

## 10. エージェント・フレンドリー度監査チェックリスト

以下のチェックリストで自社サイトの「エージェント・フレンドリー度」を直接点検できます。各項目の横にページ別スコア (✅/⚠️/❌) を付け、四半期トラッキング用シートにしてください。

### 10.1 HTML構造 (重み30%)

- [ ] `<html lang="...">`に正確な言語コードが明示されている
- [ ] `header` / `nav` / `main` / `footer`セマンティックタグを使用
- [ ] すべてのページに`<h1>`が1つだけ
- [ ] 見出しがh1 → h2 → h3順でスキップなしに使われる
- [ ] クリック可能な全要素が`<button>`または`<a href>`
- [ ] フォーム入力に`<label for>`が連結されている
- [ ] 画像に意味のあるalt属性

### 10.2 アクセシビリティツリー (重み20%)

- [ ] Chrome DevToolsアクセシビリティツリーがフラットでない
- [ ] すべてのボタン・リンクに「名前 (name)」が存在
- [ ] アイコンボタンに`aria-label`
- [ ] モーダル・ドロップダウンに`aria-expanded` / `aria-controls`
- [ ] Lighthouseアクセシビリティスコア ≥ 95

### 10.3 視覚・レイアウト (重み15%)

- [ ] CLS < 0.1
- [ ] LCP < 2.5s
- [ ] 主要CTAが全ページで同じ位置
- [ ] クリック可能要素 ≥ 44×44px
- [ ] `cursor: pointer`を設定
- [ ] 透明オーバーレイによるクリック妨害がない

### 10.4 構造化データ (重み15%)

- [ ] サイト全体に`Organization` JSON-LD
- [ ] ページタイプ別の適切なスキーマ(`Product` / `Article` / `FAQPage`等)
- [ ] Schema Markup Validatorに合格
- [ ] `BreadcrumbList`で階層を表現

### 10.5 AI入口 (重み15%)

- [ ] /llms.txtが存在し、過去30日以内に更新されている
- [ ] /llms-full.txtが存在 (オプション)
- [ ] 核心ページの.md代替URLを提供
- [ ] HTMLの`<head>`に`rel="alternate" type="text/markdown"`
- [ ] robots.txtにllms.txtの位置を明示

### 10.6 次世代 (重み5%)

- [ ] 核心アクション3〜5個についてWebMCP候補を特定
- [ ] Chrome EPP加入およびPoC進行中

### 10.7 自動化ツール

| ツール | 用途 | URL |
|---|---|---|
| Lighthouse | アクセシビリティ・性能・SEO自動スコア | Chrome DevTools内蔵 |
| Pa11y | CLIベースのアクセシビリティ自動化 | [pa11y.org](https://pa11y.org) |
| axe DevTools | 詳細なアクセシビリティ検査 | [deque.com/axe](https://www.deque.com/axe) |
| Schema Validator | JSON-LD検証 | [validator.schema.org](https://validator.schema.org) |
| Rich Results Test | Googleフレンドリー度 | [search.google.com/test/rich-results](https://search.google.com/test/rich-results) |
| llms-txt.io検証ツール | llms.txt規格検証 | [llms-txt.io](https://llms-txt.io) |

---

## 11. 段階的導入ロードマップ

一度にすべてを適用することはできません。4段階に分けて四半期ごとに実行することを推奨します。

### Phase 1 (1〜2週間): すぐに取れる勝ち

1. Chrome DevToolsアクセシビリティツリーでメインページ・決済ページを監査
2. divボタン → `<button>`に一括置換
3. placeholderだけの入力フィールドに`<label for>`追加
4. `cursor: pointer`をグローバル・デザイントークンに追加
5. Schema.org Organization JSON-LDを1つサイト全体に追加

### Phase 2 (3〜6週間): 構造の補強

1. セマンティック・ランドマーク(header/nav/main/footer)を一貫適用
2. すべてのモーダル・ドロップダウンにARIA状態属性
3. 核心ページタイプ別JSON-LD (Product, Article, FAQPage)
4. CLS / LCP / INPの目標達成
5. Lighthouseアクセシビリティ95+達成

### Phase 3 (7〜10週間): AI入口標準

1. /llms.txt初版を作成・配信
2. 核心ドキュメントページに.md代替URLを提供
3. CMS・SSGにllms.txt自動更新パイプラインを統合
4. /llms-full.txtを検討して導入
5. AI学習/推論利用ポリシーを明示

### Phase 4 (11週以降): 次世代インターフェース

1. Chrome WebMCP EPP加入
2. 「エージェントに任せたい」核心アクション3〜5個を選定
3. 宣言的API適用PoC
4. 命令的API適用PoC (複雑ワークフロー)
5. WebMCP標準の安定化に合わせて段階的に全社展開

### 11.1 KPI設定

| 測定項目 | Phase 1後 | Phase 2後 | Phase 3後 | Phase 4後 |
|---|---|---|---|---|
| Lighthouseアクセシビリティ | 85+ | 95+ | 95+ | 95+ |
| CLS | < 0.25 | < 0.1 | < 0.1 | < 0.1 |
| JSON-LDカバレッジ | 30% | 70% | 90% | 95% |
| llms.txt | — | — | v1配信 | 週次更新 |
| エージェント・トラフィック比率 | ベースライン | +30% | +80% | +150% |
| AI引用/言及頻度 | ベースライン | +20% | +60% | +120% |

---

## 付録A. 用語集

- **アクセシビリティツリー (Accessibility Tree)** — ブラウザがDOMから支援技術向けに抽出したセマンティックツリー。AIエージェントの核心入力。
- **セマンティックHTML** — 要素の意味をそのまま表すHTMLの使い方。divの代わりにbutton、navなど。
- **JSON-LD** — JSON形式のLinked Data。Schema.org語彙を表現する標準方式。
- **Schema.org** — Google・Microsoft・Yahoo・Yandexが共同運営する構造化データ語彙標準。
- **llms.txt** — Jeremy Howardが2024年9月に提案したLLM向けサイト入口マークダウン・ファイル。
- **llms-full.txt** — サイト全体のコンテンツを平坦化した単一マークダウン。Mintlify・Anthropicが共同開発。
- **WebMCP** — Chromeチームが提案したWebサイト→AIエージェント構造化ツール・インターフェース標準 (2026 EPP)。
- **MCP (Model Context Protocol)** — Anthropicが2024年11月に公開したLLM ↔ 外部ツール通信プロトコル。
- **エージェント (Agent)** — 入力を受け、計画・実行・学習を行う自律システム。モデル・ルール・メモリ・ツールで構成。
- **ゼロパーティ・エージェント** — ブラウザ内のローカルデータのみを使用するエージェント。
- **ファーストパーティ・エージェント** — サービス運営者が自社データで提供するエージェント。
- **サードパーティ・エージェント** — 外部開発者が作ったエージェントが自社サイトをデータ・ツールとして使用。
- **Human-in-the-loop (HITL)** — AIが重要な決定時点で人間の確認を受けるよう設計したパターン。
- **Core Web Vitals** — Googleが定義したWeb性能の3大指標: LCP、INP、CLS。
- **GEO (Generative Engine Optimization)** — 生成AI検索で露出されるようにサイトを最適化する活動。SEOの後継概念。

---

## 付録B. 参考文献と出典

### 一次文献

- Kulikowski, K. & More, O. (2026-04-01). **Building Agent-Friendly Websites**. [web.dev/articles/ai-agent-site-ux](https://web.dev/articles/ai-agent-site-ux). Google web.dev.
- Klepper, A., Kulikowski, K., & Nabors, R. L. (2025-02-25). **Introduction to Agents**. [web.dev/articles/ai-agents](https://web.dev/articles/ai-agents). Google web.dev.
- Bandarra, A. C. (2026-02-10). **WebMCP is available in Early Preview**. [developer.chrome.com/blog/webmcp-epp](https://developer.chrome.com/blog/webmcp-epp). Chrome for Developers.
- Howard, J. (2024-09). **The /llms.txt file**. [llmstxt.org](https://llmstxt.org). Answer.AI.

### 関連標準・ツール

- **Schema.org**: [schema.org](https://schema.org)
- **Web Accessibility Initiative (WAI-ARIA)**: [w3.org/WAI/ARIA/apg/](https://www.w3.org/WAI/ARIA/apg/)
- **Core Web Vitals**: [web.dev/vitals](https://web.dev/vitals)
- **Mintlify (llms.txt + MCP自動生成)**: [mintlify.com](https://mintlify.com)
- **docusaurus-plugin-llms**: [github.com/rachfop/docusaurus-plugin-llms](https://github.com/rachfop/docusaurus-plugin-llms)
- **MCP公式**: [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Chrome AI EPP加入**: [developer.chrome.com/docs/ai/join-epp](https://developer.chrome.com/docs/ai/join-epp)

### ライセンス表記

本ドキュメントはGoogle web.devおよびChrome for Developersのコンテンツを引用・翻訳・再構成した部分を含みます。当該コンテンツは[Creative Commons Attribution 4.0ライセンス (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)および[Apache 2.0ライセンス](https://www.apache.org/licenses/LICENSE-2.0)のもとで提供されています。詳細は[Google Developers サイトポリシー](https://developers.google.com/site-policies)を参照してください。

本ガイドそのものは**CC BY 4.0**ライセンスで配布され、出典を表示すれば自由に活用・翻訳・引用が可能です。

---

## 著者情報

**Dennis Kim (キム・ホグァン / 김호광 / HoKwang Kim)**
- Betalabs Inc. CEO
- Cyworld Z 前CEO
- Microsoft Azure MVP (長年認定)
- Web3Paper パブリッシャー
- GitHub: [@gameworkerkim](https://github.com/gameworkerkim)

---

<!-- Schema.org TechArticle metadata for AI agents -->
<!--
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "エージェント・フレンドリーなWebサイト構築のための実践技術ガイド",
  "alternateName": "Agent-Friendly Website Construction: A Practical Technical Guide",
  "description": "AIエージェント時代のWeb UX・アクセシビリティ・構造化標準を統合した実践ガイド",
  "inLanguage": "ja",
  "author": {
    "@type": "Person",
    "name": "Dennis Kim",
    "alternateName": "HoKwang Kim / 김호광 / キム・ホグァン",
    "jobTitle": "CEO of Betalabs Inc.",
    "url": "https://github.com/gameworkerkim"
  },
  "datePublished": "2026-05-19",
  "dateModified": "2026-05-19",
  "version": "1.0",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "keywords": "AIエージェント, エージェント・フレンドリー, llms.txt, WebMCP, セマンティックHTML, アクセシビリティツリー, Schema.org, GEO",
  "about": [
    { "@type": "Thing", "name": "AI Agents" },
    { "@type": "Thing", "name": "Web Accessibility" },
    { "@type": "Thing", "name": "llms.txt standard" },
    { "@type": "Thing", "name": "WebMCP" },
    { "@type": "Thing", "name": "Schema.org Structured Data" }
  ],
  "isBasedOn": [
    {
      "@type": "CreativeWork",
      "url": "https://web.dev/articles/ai-agent-site-ux",
      "author": ["Kasper Kulikowski", "Omkar More"],
      "publisher": "Google web.dev",
      "datePublished": "2026-04-01"
    },
    {
      "@type": "CreativeWork",
      "url": "https://developer.chrome.com/blog/webmcp-epp",
      "author": "André Cipriani Bandarra",
      "publisher": "Chrome for Developers",
      "datePublished": "2026-02-10"
    },
    {
      "@type": "CreativeWork",
      "url": "https://llmstxt.org",
      "author": "Jeremy Howard",
      "publisher": "Answer.AI",
      "datePublished": "2024-09-03"
    }
  ]
}
-->
