---
title: "DeepWiki スタートガイド (Getting Started)"
description: "GitHubリポジトリのURLを書き換えるだけでAIがコードベースのドキュメントを自動生成してくれるツール、DeepWiki入門ガイド"
lang: ja
featured: false
schema_type: TechArticle
---

# DeepWiki スタートガイド (Getting Started)

> GitHubリポジトリのURLを書き換えるだけでAIがコードベースのドキュメントを自動生成してくれるツール、DeepWiki入門ガイド

---

## 1. DeepWikiとは?

**DeepWiki**は、AIソフトウェアエンジニア「Devin」で知られる**Cognition Labs**が開発した**AIベースのコードドキュメント化ツール**です。GitHubの公開リポジトリのURLを入力するだけで、AIがそのコードベースの構造とロジックを解析し、**Wiki形式の構造化されたドキュメント**を自動生成してくれます。

簡単に言えば、「GitHubリポジトリを入れるとAIが自動的にマニュアルを作ってくれるサービス」です。

### 主な機能
- **リポジトリの構造とアーキテクチャの概要**を提供
- **技術スタックと主要コンポーネント**を自動識別
- **モジュール間の依存関係とデータフロー**を可視化した図を自動生成(Mermaid図)
- **自然言語Q&A**でコードベースについて質問し、回答を得られる(「認証はどこで実装されていますか?」など)
- 約**8セクション**のMarkdownページを生成(Overview / Structure / Architecture / API / Subsystems / Operations / Testing / Glossary)

---

## 2. 60秒で始める (Quick Start)

### 方法①: URLを1文字だけ変える(最も簡単)

既存のGitHubアドレスの`github.com`を`deepwiki.com`に変えるだけです。**登録不要・無料**で利用できます。

```
# 元のURL (GitHub)
https://github.com/gameworkerkim/vibe-investing

# DeepWikiドキュメントを見る
https://deepwiki.com/gameworkerkim/vibe-investing
```

### 方法②: deepwiki.comにアクセスして検索

1. https://deepwiki.com にアクセス
2. 検索窓に`ユーザー名/リポジトリ名`を入力(例: `facebook/react`)
3. 生成されたWikiページを閲覧

### 方法③: 自然言語で質問する

生成されたWikiページの**Ask機能**に自然言語で質問すると、コードベースの文脈に基づいた回答が得られます。

```
Q: このプロジェクトで認証(ログイン)はどこで処理されていますか?
Q: データベース接続設定はどのファイルにありますか?
Q: このリポジトリのエントリーポイントは何ですか?
```

---

## 3. こんなときに便利です

| 状況 | 活用方法 |
|---|---|
| 新入社員のオンボーディング | 数百のファイルを読まなくても全体構造を一目で把握 |
| OSSへのコントリビュート準備 | 貢献したい部分と関連モジュール・データフローを素早く理解 |
| 技術面接の準備 | 有名プロジェクト(React、TensorFlow、LangChainなど)のアーキテクチャを学習 |
| 未知のライブラリの調査 | ドキュメントが不十分なライブラリでもコードベースの説明を確保 |

---

## 4. 長所

- **参入障壁がほぼゼロ** — インストール・プラグイン・登録不要。URLを変えるだけで即利用可能。
- **複雑なコードベースを素早く把握** — 全体構造と主要ロジックを一目で理解。
- **対話型探索をサポート** — 自然言語での質問により、静的ドキュメントより直感的に学習できる。
- **多様な言語と大規模リポジトリをサポート** — JavaScript、Python、Rust、Go、Javaなど。有名プロジェクトは既に解析済み。
- **Deep Researchモード** — コードスメルの検出、アーキテクチャレベルの改善提案など深い分析。

## 5. 短所

- **公開リポジトリのみ無料サポート** — 非公開リポジトリはエンタープライズ向けに別途提供予定。
- **AI生成ドキュメントの限界** — 公式ドキュメントではなく、誤り・欠落・実装との差異が生じる可能性がある。
- **インターネット接続が必須** — クラウドベースのSaaSのためオフライン利用不可。
- **一部情報の重複の可能性** — すでに整備された公式ドキュメントと重複する場合がある。
- **大規模リポジトリでは範囲が制限される場合がある** — 設定ファイル(`.devin/wiki.json`)で生成範囲を指定できる。

## 6. 注意点

- **AIが生成した情報は必ず検証すること** — あくまで補助ツールであり、公式リファレンスドキュメントの代替ではない。本番環境への変更時は実際のソースコードと公式ドキュメントの確認が必須。
- **機密性の高いコードはアップロードしないこと** — 公開サービスであるため、非公開/機密情報を含むコードを解析対象にしないこと。
- **ドキュメントの精度はコード品質に左右される** — コメントやREADMEが不十分だと生成ドキュメントの精度も下がる。LLMが理解しやすいインデックス構造が前提となる。

---

## 7. セルフホスト版 — `deepwiki-open`

DeepWiki公式サービス(SaaS)はクラウド上でのみ動作し、カスタマイズはできません。これを**自分で構築・運用**したい場合は、コミュニティによるオープンソース版**`deepwiki-open`**を使用できます。

> リポジトリ: https://github.com/AsyncFuncAI/deepwiki-open

### なぜセルフホストを使うのか?
- **非公開リポジトリのドキュメント化** — 社内のプライベートコードを外部SaaSに晒さず、ローカル/オンプレミスで処理。
- **好みのLLMを選択可能** — OpenAI、Google Gemini、OpenRouter、Azure、そして**Ollamaのローカルモデル**まで接続可能。
- **完全な自由度** — プロンプト、生成範囲、UIなどを自由にカスタマイズ。

### インストール方法①: Docker(推奨、最も簡単)

```bash
# 1. リポジトリをクローン
git clone https://github.com/AsyncFuncAI/deepwiki-open.git
cd deepwiki-open

# 2. 環境変数ファイル(.env)を作成 — 使用するLLMのキーだけ入力すればよい
cat > .env <<'EOF'
GOOGLE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key
# (任意) OPENROUTER_API_KEY=...
# (任意) OLLAMA_HOST=http://host.docker.internal:11434
EOF

# 3. 実行
docker-compose up

# 4. ブラウザでアクセス
#   http://localhost:3000
```

### インストール方法②: 手動実行(フロントエンド + バックエンド)

```bash
# バックエンド (Python APIサーバー)
pip install -r api/requirements.txt
python -m api.main          # デフォルトポート8001

# フロントエンド (Next.js)
npm install
npm run dev                 # デフォルトポート3000
```

### 使用の流れ
1. `http://localhost:3000`にアクセス
2. ドキュメント化したいGitHub/GitLab/Bitbucketリポジトリの URLを入力(非公開リポジトリはアクセストークンを入力)
3. 使用するLLMモデル(例: Gemini、GPT、ローカルOllama)を選択
4. Wiki生成 → Mermaid図 + Ask(質疑応答)を利用

### SaaS版とセルフホスト版の比較まとめ

| 区分 | DeepWiki(公式SaaS) | deepwiki-open(セルフホスト) |
|---|---|---|
| インストール | 不要(URLを変えるだけ) | Dockerまたは手動インストールが必要 |
| 非公開リポジトリ | 無料サポートなし | 可(ローカル処理) |
| LLMの選択 | 不可(自社LLM固定) | OpenAI/Gemini/Ollamaなど選択可 |
| カスタマイズ | 不可 | 完全に自由 |
| データセキュリティ | 外部クラウドに送信 | オンプレミスで維持可能 |
| 導入の難易度 | 非常に低い | 中程度(環境設定が必要) |

> **一言まとめ**: 公開リポジトリを素早く確認したいなら**公式SaaS**、社内の非公開コードやローカルLLM連携が必要なら**`deepwiki-open`のセルフホスト版**を選ぶとよいでしょう。

---

## 8. 主な競合プロジェクト

DeepWikiが最初に定義した**「コードWiki AI」**カテゴリには、その後複数の競合プロジェクトが登場しました。

| プロジェクト | 開発元 | 特徴 |
|---|---|---|
| **DeepWiki** | Cognition Labs | 元祖サービス。SaaS方式、自社LLMを使用 |
| **deepwiki-open** | コミュニティ(オープンソース) | DeepWikiの完全オープンソース版。セルフホストとカスタマイズが可能 |
| **Google CodeWiki** | Google | 2025年11月にリリース。Google Cloud + GoogleのLLMで動作、Google検索連携に最適化 |
| **Alphadoc** | - | DeepWikiと似たAIドキュメント化ツール |
| **その他** | - | ConnectWise PSA、IBM Cloud Pak for AIOpsなど(DevOps/AIOps領域に近い) |

- **DeepWiki**: SaaSなので最も手軽だがカスタマイズ不可
- **deepwiki-open**: 自分でホストする必要があるが完全な自由度を保証
- **Google CodeWiki**: Googleのエコシステムとの連携が強み

---

## まとめ

DeepWikiは**「複雑なオープンソースコードを素早く理解したい開発者」**にとって非常に有用なツールです。ただし、AIが生成した情報を鵜呑みにせず、実際のコードと合わせて検証しながら使うことが重要です。

- 公開リポジトリを素早く確認したいなら → **公式DeepWiki(SaaS)**
- 非公開コード・ローカルLLM・カスタマイズが必要なら → **`deepwiki-open`(セルフホスト)**
- Googleのエコシステムとの連携を望むなら → **Google CodeWiki**

## 参考リンク
- 公式サービス: https://deepwiki.com
- セルフホスト版(オープンソース): https://github.com/AsyncFuncAI/deepwiki-open
- 開発元: Cognition Labs (https://cognition.ai)
