---
title: "Quivr: 生成AIが動かすオープンソース Second Brain"
description: "個人・企業のデータを知的なAIアシスタントに変換するオープンソースRAGプラットフォーム、Quivrの紹介"
lang: ja
featured: false
schema_type: TechArticle
keywords:
  - Quivr
  - RAG
  - second brain
  - オープンソース AI
  - retrieval augmented generation
tags:
  - RAG
  - オープンソース
  - AIアシスタント
  - LLM
---

# Quivr: 生成AIが動かすオープンソース Second Brain

## 1. 概要

Quivrはオープンソースの RAG(Retrieval-Augmented Generation)プラットフォームであり、個人または企業のデータを知的なAIアシスタントに変換する「第二の脳(Second Brain)」である。ユーザーは単に文書をアップロードし、自然言語で質問するだけで、膨大な情報を簡単に検索・活用できる。

Quivrは38,000以上のGitHubスターを保有し、全世界の開発者から注目を集めており、50,000人以上のユーザーと6,000以上の企業がQuivrを活用している。Y Combinatorの支援を受けるこのプロジェクトは、20年来のフランス人の友人3人が設立した。

---

## 2. なぜQuivrなのか?(Pain Point & Solution)

企業環境において、業務時間の約20%は単に情報を探すことに消費される。従業員は次のような困難を繰り返し経験する。

- 休暇中の同僚に緊急の情報を依頼しなければならない状況
- 同じ情報を繰り返し尋ね、答える非効率
- 必要な情報がどこにあるのか、あるいは存在するのかさえ分からない

Quivrはこうした問題を解決するため、企業のすべてのツール・文書・API・データベースを接続し、それらと対話できるAIオープンソースプラットフォームを提供する。Quivrは次のような作業を自動化する。

- 膨大な文書を要約して核心のみ抽出
- データベースから実行可能な情報を抽出
- 文脈を考慮したメールの自動作成

---

## 3. 主な特徴

### 3.1 Opinionated RAG(最適化されたRAGワークフロー)

Quivrは事前に設計された最適化されたRAGワークフローを提供し、開発者がRAGパイプラインを最初から構築する必要がないようにする。速度と効率性を核心に設計されており、プロダクション環境で即座に使用可能である。

### 3.2 すべてのファイル形式のサポート

多様なファイル形式をサポートし、必要に応じてカスタムパーサーを追加できる。

- テキストファイル(.txt)
- PDF文書
- マークダウン(.md)
- プレゼンテーション(.ppt、.pptx)
- スプレッドシート(.csv、.xlsx)
- Word文書
- 音声・動画ファイル

### 3.3 マルチLLMサポート

Quivrは多様なLLM(大規模言語モデル)をサポートし、ベンダー依存を防ぐ。

- OpenAI(GPT-4、GPT-3.5)
- Anthropic(Claude)
- Mistral
- Google(Gemma)
- Groq
- ローカルモデル(Ollama) — 完全なデータプライバシーを保証

### 3.4 カスタマイズ可能なRAGワークフロー

YAML設定ファイルを通じて次のような要素を細かく調整できる。

- リランカー(reranker)モデルおよび設定
- 履歴の深さ(対話コンテキストの反映範囲)
- LLM温度(temperature)および最大入力トークン数
- 検索チャンク(chunk)のサイズと個数

### 3.5 ツール統合とインターネット検索

Quivrは静的な文書知識を超え、インターネット検索および外部ツール/APIと連携して動的な情報収集とリアルタイムインテリジェンスを実現できる。

### 3.6 Megaparse統合

同じQuivrHQが開発したMegaparseは大規模文書を効率的にパースするツールであり、数千のファイルを前処理してQuivrの「Brain」に直接接続できる。

### 3.7 プライバシーとセルフホスティング

データプライバシーが重要な企業・開発者のために、ローカル展開およびセルフホスティングをサポートする。データはユーザーの管理下に保たれ、外部API呼び出しなしで完全なオンプレミス環境で動作可能である。

### 3.8 技術スタック

| 層 | 技術 | 特徴 |
|------|------|------|
| フロントエンド | Next.js + Vercel | SSRベース、自動デプロイ |
| バックエンドAPI | FastAPI | Pythonベースの高性能APIフレームワーク |
| 非同期タスク | Celery + Queue | 大容量ファイルの埋め込みおよびインデックス処理 |
| ベクトルストア | PGVector / FAISS | 高性能セマンティック検索 |
| 認証/DB | Supabase | オープンソースFirebase代替品 |

---

## 4. 開発者にとっての利点

### 4.1 クイックスタート(30秒でOK)

```bash
pip install quivr-core
# たった5行のコードでRAGシステム構築完了
```

### 4.2 豊富なAPIサポート

QuivrはRESTful APIを提供し、Swaggerドキュメントを通じて簡単に探索・テストできる。APIキーベースの認証をサポートし、アプリケーションへの統合が容易である。

### 4.3 拡張可能なアーキテクチャ

- カスタムファイルパーサーの追加が可能
- RAGワークフローノードの拡張が可能
- ベクトルストアの交換が可能
- 多様な埋め込みモデルをサポート(LangChain統合)

### 4.4 活発なオープンソースコミュニティ

- GitHubで38k+スター、活発な貢献
- 定期的な更新および機能改善
- イシュー対応およびPRレビューが活発

### 4.5 開発生産性の向上

- RAGの複雑な内部構造を抽象化してビジネスロジックに集中可能
- YAMLベースの設定でコード変更なしにRAG戦略を実験可能
- 多様なサンプルコード提供(Chainlit、Streamlit統合)

---

## 5. インストールと使用方法

### 5.1 Pythonパッケージのインストール(Quick Start)

最も早く始めるにはquivr-coreパッケージをインストールする。

```bash
# Step 1: パッケージインストール
pip install quivr-core

# インストール確認
python -c "import quivr_core; print('Quivr installed!')"
```

### 5.2 基本的な使用例

```python
from quivr_core import Brain

# 1. 文書からBrainを作成
brain = Brain.from_files(
    name="my_smart_brain",
    file_paths=["./my_document.pdf", "./my_notes.txt"]
)

# 2. Brainに質問する
answer = brain.ask("この文書の核心内容を要約して")
print(answer.answer)

# 3. 対話型インターフェースを実行
while True:
    question = input("質問: ")
    if question.lower() == "exit":
        break
    response = brain.ask(question)
    print(f"回答: {response.answer}")
```

### 5.3 Dockerベースのローカルデプロイ(Self-Hosted)

データプライバシーが重要な場合、または完全な機能を活用したい場合:

```bash
# Step 1: リポジトリのクローン
git clone https://github.com/quivrhq/quivr.git && cd quivr

# Step 2: 環境設定
cp .env.example .env
# .envファイルにOPENAI_API_KEYを入力

# Step 3: Dockerで実行
docker compose pull
docker compose up

# Step 4: アクセス
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

### 5.5 Chainlitでチャットuiを作成する

```bash
cd examples/chatbot
rye sync
rye run chainlit run chainlit.py
```

### 5.6 APIキーの発行と使用

```bash
# 1. Quivr Webアプリにログイン
# 2. /userページでAPIキー生成
# 3. API呼び出し時にBearerトークン使用

curl -X GET https://api.quivr.app/brains/ \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 6. 「Brain」概念の理解

Quivrの中核概念は「Brain」(脳)である。Brainはユーザーの知識を保存・処理する基本コンポーネントである。

- 一つのBrainには複数の文書を接続可能
- 各Brainは固有のRAG設定とLLMを持てる
- Public/Private設定が可能(共有または非公開)
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
- チャットAPI: GET /chat/{chat_id}/history で対話履歴を照会可能

### コミュニティ

- Product Hunt: https://www.producthunt.com/products/quivr
- Y Combinator Launch: https://www.ycombinator.com/launches/KPF-quivr

---

## 8. 結論

Quivrは単純なRAGツールを超え、開発者に親和的なAIフレームワークとして設計されている。簡潔さ(simplicity)と拡張性(extensibility)を最優先とし、個人開発者から大規模AIチームまで生産性向上に貢献している。

Quivrを選ぶべき理由:

- オープンソースによる完全な透明性と自由なカスタマイズ
- 30秒のインストール、5行のコードで即座に使用可能
- データプライバシー — オンプレミス展開をサポート
- ベンダー依存なし — 主要なすべてのLLMと互換
- 活発なコミュニティと継続的な更新

「アイデアはObsidianと似ているが、AI機能でさらに強化された」という表現の通り、Quivrは知識管理の新しいパラダイムを提示する。今すぐQuivrで自分だけの「第二の脳」を構築してみよう。
