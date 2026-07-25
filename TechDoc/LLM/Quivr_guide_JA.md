---
title: "Quivr: 生成AIによるオープンソースの「第二の脳」"
description: "GitHubスター38,000以上のオープンソースRAGプラットフォームQuivrの完全ガイド——機能、技術スタック、インストール方法、カスタムRAGワークフロー、「Brain」コンセプトを解説。"
abstract: |
  Quivrはオープンソースの RAG(Retrieval-Augmented Generation)プラットフォームであり、個人または企業の
  データをインテリジェントなAIアシスタントに変える「第二の脳(Second Brain)」である。ユーザーは文書を
  アップロードし自然言語で質問するだけで、膨大な情報を簡単に検索・活用できる。本ガイドはQuivrが必要とされる
  理由、核心機能(最適化されたRAGワークフロー、全ファイル形式サポート、マルチLLMサポート、YAMLによる
  カスタマイズ可能なRAG、ツール統合とWeb検索、Megaparse統合、プライバシー・セルフホスティング、技術スタック)、
  開発者にとっての利点、インストールと使用方法(Pythonパッケージ、Dockerによるセルフホスト配備、カスタムRAG
  設定、ChainlitチャットUI、APIキー利用)、「Brain」コンセプト、参考資料を解説する。
summary_for_ai: |
  GitHubスター38,000以上、ユーザー50,000人以上、企業6,000社以上が利用するオープンソースRAGプラットフォーム
  Quivrの完全ガイド。Y Combinatorの支援を受け、20年来の友人であるフランス人3人が創業した。
  解決する課題:企業環境での業務時間の約20%は単に情報を探すことに消費されている(休暇中の同僚への緊急照会、
  同じ質問への繰り返し対応、必要な情報がどこにあるか、あるいは存在するかどうかさえ分からない)。Quivrは企業の
  すべてのツール・文書・API・データベースを接続し、それらと対話できるAIプラットフォームを提供し、文書要約、
  データベースからの実行可能情報抽出、文脈を考慮したメール自動作成を自動化する。
  核心機能:ゼロからパイプラインを構築する必要のない最適化済みRAGワークフロー(opinionated RAG)。
  txt、PDF、Markdown、PPT、CSV/XLSX、Word、音声・動画を含む全ファイル形式のサポートとカスタムパーサー対応。
  マルチLLMサポート(OpenAI、Anthropic Claude、Mistral、Google Gemma、Groq、完全なデータプライバシーを
  保証するOllamaベースのローカルモデル)。YAML設定によるRAGの微調整(リランカーモデル・設定、会話履歴の深さ、
  LLMの温度、最大入力トークン、チャンクサイズ・個数)。静的文書を超えたツール統合・Web検索。大規模文書の
  効率的なパースを行うMegaparse統合。外部API呼び出しなしで完全なオンプレミス運用が可能なプライバシー・
  セルフホスティングサポート。
  技術スタック:Next.js + Vercelフロントエンド、FastAPIバックエンド、非同期の埋め込み・インデックス処理を
  担うCelery + キュー、PGVector/FAISSベクトルストア、認証・DBのSupabase。
  開発者にとっての利点:クイックスタート(`pip install quivr-core`、5行のコードで完全なRAGシステムを構築)、
  SwaggerドキュメントとAPIキー認証付きの豊富なRESTful API、拡張可能なアーキテクチャ(カスタムパーサー、
  RAGワークフローノード、交換可能なベクトルストア、LangChain統合による多様な埋め込みモデル)、活発な
  オープンソースコミュニティ、RAGの複雑な内部構造を抽象化しつつコード変更なしでYAMLベースの実験ができる
  生産性向上。
  インストール・使用方法:pipによるPythonクイックスタート、基本的な使用例のコード全体(Brain.from_files、
  brain.ask、対話ループ)、Dockerベースのセルフホスト配備(クローン、.env設定、docker compose up、
  localhost:3000のWeb UI、localhost:5050/docsのAPIドキュメント)、YAML経由のカスタムRAGワークフロー設定
  (リランカー、履歴深さ、温度、最大トークン)をRetrievalConfig.from_yamlで読み込む方法、Chainlitによる
  チャットUI構築、curl例を用いたAPIキーの発行・利用方法。
  「Brain」コンセプト:ユーザーの知識を保存・処理するQuivrの核心的な抽象化。1つのBrainに複数の文書を紐付け
  可能、各BrainごとにRAG設定とLLMを個別に持てる、公開/非公開設定をサポート、Brain Marketplaceを通じて
  共有可能。
  結論:Quivrは簡潔さと拡張性を最優先した開発者フレンドリーなAIフレームワークとして設計されており、
  オープンソースとしての完全な透明性、30秒でのインストール、オンプレミス配備によるデータプライバシー、
  主要LLM全般との互換性によるベンダーロックインの排除、活発なコミュニティを特徴とする——「Obsidianの発想を
  AIで強化したもの」と表現される。
date: 2026-04-10
author: "Dennis Kim"
lang: ja
tags:
  - Quivr
  - RAG
  - オープンソース
  - AIアシスタント
  - LLM
keywords:
  - Quivr オープンソース RAG
  - セカンドブレイン AI
  - Quivr インストールガイド
  - quivr-core Python
  - セルフホスト RAGプラットフォーム
  - Brain コンセプト Quivr
featured: false
schema_type: TechArticle
draft: false
---

# Quivr: 生成AIによるオープンソースの「第二の脳」

## 1. 概要

Quivrはオープンソースの RAG(Retrieval-Augmented Generation)プラットフォームであり、個人または企業のデータをインテリジェントなAIアシスタントに変える「第二の脳(Second Brain)」である。ユーザーは単に文書をアップロードして自然言語で質問するだけで、膨大な情報を簡単に検索・活用できる。

QuivrはGitHubスター38,000以上を保有し、全世界の開発者から注目を集めている。50,000人以上のユーザーと6,000社以上の企業がQuivrを活用中である。Y Combinatorの支援を受けるこのプロジェクトは、20年来の友人であるフランス人3人によって設立された。

---

## 2. なぜQuivrなのか?(Pain Point & Solution)

企業環境において、業務時間の約20%は単に情報を探すことに消費される。従業員は以下のような困難を繰り返し経験している。

- 休暇中の同僚に緊急の情報を求めなければならない状況
- 同じ情報を繰り返し尋ね、答えるという非効率
- 必要な情報がどこにあるのか、あるいは存在するのかさえ分からない

Quivrはこうした問題を解決するため、企業のすべてのツール・文書・API・データベースを接続し、それらと対話できるAIオープンソースプラットフォームを提供する。Quivrは以下のような作業を自動化する。

- 膨大な文書を要約し核心のみを抽出
- データベースから実行可能な情報を抽出
- 文脈を考慮したメールの自動作成

---

## 3. 核心機能

### 3.1 Opinionated RAG(最適化されたRAGワークフロー)

Quivrは事前設計された最適化済みRAGワークフローを提供し、開発者がRAGパイプラインをゼロから構築する必要をなくす。速度と効率性を核心に設計され、プロダクション環境で即座に使用可能である。

### 3.2 全ファイル形式のサポート

多様なファイル形式をサポートし、必要に応じてカスタムパーサーを追加できる。

- テキストファイル(.txt)
- PDF文書
- Markdown(.md)
- プレゼンテーション(.ppt、.pptx)
- スプレッドシート(.csv、.xlsx)
- Word文書
- 音声・動画ファイル

### 3.3 マルチLLMサポート

Quivrはベンダー依存を防ぐため、多様なLLM(大規模言語モデル)をサポートする。

- OpenAI(GPT-4、GPT-3.5)
- Anthropic(Claude)
- Mistral
- Google(Gemma)
- Groq
- ローカルモデル(Ollama)——完全なデータプライバシーを保証

### 3.4 カスタマイズ可能なRAGワークフロー

YAML設定ファイルを通じて以下の要素を細かく調整できる。

- リランカー(reranker)モデルおよび設定
- 履歴の深さ(会話コンテキストの反映範囲)
- LLMの温度(temperature)および最大入力トークン数
- 検索チャンク(chunk)のサイズおよび個数

### 3.5 ツール統合とWeb検索

Quivrは静的な文書知識を超えて、インターネット検索や外部ツール・APIと連携し、動的な情報収集とリアルタイムインテリジェンスを実現できる。

### 3.6 Megaparse統合

同じQuivrHQが開発したMegaparseは、大規模文書を効率的にパースするツールで、数千個のファイルを前処理してQuivrの「Brain」に直接接続できる。

### 3.7 プライバシーとセルフホスティング

データプライバシーが重要な企業・開発者向けに、ローカル配備とセルフホスティングをサポートする。データはユーザーの管理下に維持され、外部API呼び出しなしで完全なオンプレミス環境でも動作可能である。

### 3.8 技術スタック

| 層 | 技術 | 特徴 |
|------|------|------|
| フロントエンド | Next.js + Vercel | SSRベース、自動デプロイ |
| バックエンドAPI | FastAPI | Pythonベースの高性能APIフレームワーク |
| 非同期処理 | Celery + Queue | 大容量ファイルの埋め込み・インデックス処理 |
| ベクトルストア | PGVector / FAISS | 高性能な意味検索 |
| 認証/DB | Supabase | オープンソースのFirebase代替 |

---

## 4. 開発者にとっての利点

### 4.1 クイックスタート(30秒でOK)

```bash
pip install quivr-core
# わずか5行のコードでRAGシステム構築完了
```

### 4.2 豊富なAPIサポート

QuivrはRESTful APIを提供し、Swaggerドキュメントを通じて簡単に探索・テストできる。APIキーベースの認証をサポートし、アプリケーションへの統合が容易である。

### 4.3 拡張可能なアーキテクチャ

- カスタムファイルパーサーの追加が可能
- RAGワークフローノードの拡張が可能
- ベクトルストアの交換が可能
- 多様な埋め込みモデルをサポート(LangChain統合)

### 4.4 活発なオープンソースコミュニティ

- GitHubで38k+のスター、活発な貢献
- 定期的な更新および機能改善
- イシュー対応およびPRレビューが活発

### 4.5 開発生産性の向上

- RAGの複雑な内部構造を抽象化し、ビジネスロジックに集中可能
- YAMLベースの設定によりコード変更なしでRAG戦略を実験可能
- 多様な例コードを提供(Chainlit、Streamlit統合)

---

## 5. インストールと使用方法

### 5.1 Pythonパッケージのインストール(クイックスタート)

最も速く始めるには、quivr-coreパッケージをインストールする。

```bash
# ステップ1:パッケージのインストール
pip install quivr-core

# インストール確認
python -c "import quivr_core; print('Quivr installed!')"
```

### 5.2 基本的な使用例

```python
from quivr_core import Brain

# 1. 文書からBrainを作成する
brain = Brain.from_files(
    name="my_smart_brain",
    file_paths=["./my_document.pdf", "./my_notes.txt"]
)

# 2. Brainに質問する
answer = brain.ask("この文書の核心内容を要約してください")
print(answer.answer)

# 3. 対話型インターフェースを実行する
while True:
    question = input("質問: ")
    if question.lower() == "exit":
        break
    response = brain.ask(question)
    print(f"回答: {response.answer}")
```

### 5.3 Dockerベースのローカル配備(Self-Hosted)

データプライバシーが重要、または完全な機能を活用したい場合:

```bash
# ステップ1:リポジトリのクローン
git clone https://github.com/quivrhq/quivr.git && cd quivr

# ステップ2:環境設定
cp .env.example .env
# .envファイルにOPENAI_API_KEYを入力

# ステップ3:Dockerで実行
docker compose pull
docker compose up

# ステップ4:アクセス
# Web UI: http://localhost:3000
# APIドキュメント: http://localhost:5050/docs
```

### 5.4 カスタムRAGワークフローの設定

YAMLファイルでRAG戦略をカスタマイズできる。

```yaml
# custom_rag.yaml
workflow_config:
  name: "advanced_rag"
  max_history: 10
  reranker_config:
    supplier: "cohere"
    model: "rerank-multilingual-v3.0"
    top_n: 5
  llm_config:
    max_input_tokens: 4000
    temperature: 0.3
```

```python
from quivr_core import Brain
from quivr_core.config import RetrievalConfig

brain = Brain.from_files(
    name="custom_brain",
    file_paths=["./data/*.pdf"]
)

config = RetrievalConfig.from_yaml("./custom_rag.yaml")
answer = brain.ask("質問", retrieval_config=config)
```

### 5.5 ChainlitでチャットUIを作る

```bash
cd examples/chatbot
rye sync
rye run chainlit run chainlit.py
```

### 5.6 APIキーの発行と使用

```bash
# 1. QuivrのWebアプリにログイン
# 2. /userページでAPIキーを生成
# 3. API呼び出し時にBearerトークンを使用

curl -X GET https://api.quivr.app/brains/ \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 6. 「Brain」コンセプトを理解する

Quivrの核心コンセプトは「Brain」(脳)である。Brainはユーザーの知識を保存・処理する基本コンポーネントである。

- 1つのBrainに複数の文書を紐付け可能
- 各BrainごとにRAG設定とLLMを個別に持てる
- 公開/非公開設定が可能(共有または非公開)
- Brain Marketplaceを通じて他のユーザーのBrainも活用可能

---

## 7. 参考資料(References)

### 公式ドキュメント

- 公式ホームページ: https://quivr.app
- Coreドキュメント: https://core.quivr.com
- API Swaggerドキュメント: https://api.quivr.app/docs

### GitHubリポジトリ

- QuivrHQ/quivr: https://github.com/quivrhq/quivr(38k+ stars)
- Megaparse(文書パースツール): https://github.com/quivrhq/megaparse

### クイックリンク

- Quick Start: https://core.quivr.com/en/stable/
- Brain APIガイド: POST /brains/ エンドポイントでBrainを作成可能
- チャットAPI: GET /chat/{chat_id}/history で会話履歴を照会可能

### コミュニティ

- Product Hunt: https://www.producthunt.com/products/quivr
- Y Combinator Launch: https://www.ycombinator.com/launches/KPF-quivr

---

## 8. 結論

Quivrは単純なRAGツールを超え、開発者フレンドリーなAIフレームワークとして設計されている。簡潔さ(simplicity)と拡張性(extensibility)を最優先とし、個人開発者から大規模AIチームまで、生産性向上に貢献している。

Quivrを選ぶべき理由:

- オープンソースによる完全な透明性と自由なカスタマイズ
- 30秒のインストール、5行のコードで即座に使用可能
- データプライバシー——オンプレミス配備をサポート
- ベンダー依存なし——主要なすべてのLLMと互換
- 活発なコミュニティと継続的な更新

「アイデアはObsidianと同じだが、AI機能でさらに強化されたもの」という表現の通り、Quivrは知識管理の新しいパラダイムを提示している。今すぐQuivrで自分だけの「第二の脳」を構築してみよう。
