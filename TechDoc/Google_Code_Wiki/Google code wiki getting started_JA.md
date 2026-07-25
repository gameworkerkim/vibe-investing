---
title: "Google Code Wiki Getting Started ガイド"
description: "Googleが2025年11月にパブリックプレビューとして公開したAIベースのコードドキュメント生成プラットフォーム、Google Code Wikiの入門ガイド。DeepWiki・OpenWikiとの比較、長所短所、注意点を整理。"
keywords:
  - "Google Code Wiki"
  - "コードドキュメント自動生成"
  - "DeepWiki"
  - "OpenWiki"
  - "Gemini"
  - "AIコーディングエージェント"
  - "living documentation"
lang: ja
featured: false
schema_type: TechArticle
---

# Google Code Wiki Getting Started ガイド

文書バージョン: 2026-07-11 | 検証状態: Web横断検証済み(公式発表、技術メディア、GitHubソース基準)

---

## 1. Google Code Wikiとは?

Google Code Wikiは、2025年11月13日にGoogle Developers Blogを通じてパブリックプレビュー(Public Preview)として公開されたAIベースのコードドキュメント生成プラットフォームである。「コードを読むことがソフトウェア開発における最大のボトルネックである」という問題意識から出発し、公開GitHubリポジトリを入力すると、Geminiがコードベース全体を分析して構造化されたウィキ文書を自動生成する。

核心的な差別化ポイントは、文書が静的ではないことである。コードが変更されると、文書とダイアグラムが自動的に再生成され、常に最新の状態が保たれる。すべての説明は実際のソースファイルにハイパーリンクで接続される。

- 公式サイト: https://codewiki.google
- 公式発表: Google Developers Blog、「Introducing Code Wiki: Accelerating your code understanding」(2025-11-13)
- 系譜: 2024年1月にリリースされたMutable.aiのAuto Wikiが前身であり、そのチームがGoogleに参加して同一のコンセプトを再構築したプロダクトである(Auto Wikiの開発者がHacker Newsで直接確認)

---

## 2. 主な機能

| 機能 | 説明 |
|------|------|
| 自動生成される構造化ウィキ | リポジトリ全体をスキャンし、モジュール・クラス・関数別の目的・パラメータ・使用例を含む文書を生成 |
| Gemini搭載のチャットエージェント | リポジトリの最新ウィキを知識ベースとして使用するAIチャット。一般的なチャットボットと異なり、回答には実際のコードへのリンクが伴う |
| ハイパーリンク化されたコード参照 | 文書内のすべての説明が実際のコードファイル、クラス、関数に直接接続される |
| 自動生成ダイアグラム | アーキテクチャ、クラス、シーケンスダイアグラムを自動生成。コード変更時に再生成され、古いダイアグラム(stale diagram)問題を解消 |
| 継続的な更新 | コード変更(コミット/PRマージ)時に文書全体が自動的に再生成される |
| ナレッジグラフベースの分析 | コードを単純なテキストではなく構造(クラス、関数、呼び出し関係)としてパースし、関係グラフを構築(Tree-sitter系パーサーの活用と推定) |

---

## 3. Getting Started

### 3.1 前提条件

- GitHubの公開(public)リポジトリのみサポート(プレビュー段階時点)
- 別途のインストール、設定、ログインは不要。Webブラウザのみで利用可能
- 費用: 現在無料

### 3.2 ステップ1: サイトへアクセス

ブラウザで https://codewiki.google にアクセスする。

### 3.3 ステップ2: リポジトリを検索

検索フィールドにGitHubリポジトリの完全なURLまたは`owner/repo`形式の名前を入力する。

```
例:
- facebook/react
- vercel/next.js
- tensorflow/tensorflow
- https://github.com/facebook/react
```

React、Next.js、LangChain、Gemini CLIなどの人気プロジェクトはウィキが事前生成されているため即座に閲覧できる。URLへの直接アクセスもサポートされる(例: `codewiki.google/github.com/google-gemini/gemini-cli`)。

### 3.4 ステップ3: ウィキを探索

生成されたウィキの一般的な構成:

- Overview: プロジェクト概要と説明
- Architecture: システム設計とコンポーネント間の関係
- Modules: コードモジュール別の詳細文書
- APIs: 関数・クラスのリファレンス
- Diagrams: アーキテクチャ/クラス/シーケンスダイアグラム

### 3.5 ステップ4: チャットエージェントを活用

チャットインターフェースで自然言語で質問する。回答には根拠となるソースファイルへのリンクが付与されるため、元のコードに直接移動して検証できる。

```
質問例:
- "How does the authentication flow work?"
- "What are the main entry points?"
- "Show me how to implement a custom middleware"
```

### 3.6 (任意) 非公式CLIツール — codewiki-cli

Code Wikiは公式APIを提供していない。非公式CLIである`codewiki-cli`(開発者: aeroxy、MITライセンス、Rust製)は、Webフロントエンドと同じGoogleのbatchexecute RPCプロトコルを使用し、ターミナルからウィキを照会する。LLMコーディングエージェントのパイプライン連携を念頭に設計されており、出力はMarkdown形式である。

```bash
# インストール
brew install aeroxy/tap/codewiki-cli   # macOS(Homebrew)
cargo install codewiki-cli             # Rust cargo

# 使用方法
codewiki structure facebook/react                       # ウィキのセクション構成を確認
codewiki read facebook/react                            # ウィキ全体をMarkdownとして出力
codewiki ask facebook/react "How does useEffect work?"  # 自然言語での質問

# AIエージェントパイプラインとの連携例
codewiki read ast-grep/ast-grep | claude -p "Summarise the rule engine"
```

---

## 4. 競合サービス比較: Code Wiki vs DeepWiki vs OpenWiki

### 4.1 3種の概要

| 項目 | Google Code Wiki | DeepWiki(Cognition) | OpenWiki(LangChain) |
|------|-------------------|----------------------|----------------------|
| 提供元 | Google | Cognition Labs(Devinの開発元) | LangChain(オープンソース) |
| リリース | 2025年11月(パブリックプレビュー) | 2025年4月 | 2026年7月初旬 |
| 形態 | ホスティング型Webサービス | ホスティング型Webサービス + MCPサーバー | ローカル実行のオープンソースエージェント |
| アクセス方法 | codewiki.googleで検索 | URLの github.com を deepwiki.com に置換 | `openwiki --init`後、リポジトリ内にウィキを生成 |
| ベースモデル | Gemini | Devinスタック(社内モデル/パイプライン) | ユーザーが指定するLLM(BYO API Key) |
| 公開リポジトリ | 無料 | 無料(上位5万以上のリポジトリを事前インデックス) | ローカル実行のため制限なし |
| プライベートリポジトリ | 未サポート(Gemini CLI拡張のウェイティングリスト) | Devin有料アカウントでサポート | サポート(コードはローカルに保持、ただしLLM API呼び出しが発生) |
| 更新方式 | コード変更時に自動再生成 | スケジュールベースの再生成(活発なリポジトリでは数時間〜数日の遅延が発生する場合あり) | GitHub Actionによるスケジュール実行、git diffベースの差分更新 |
| 生成制御 | なし | `.devin/wiki.json`でページ構成・ノートを指定可能 | オープンソースのためコードレベルのカスタマイズが可能 |
| AIエージェント連携 | 公式APIなし(非公式CLI/MCPのみ存在) | 公式MCPサーバーを提供(mcp.deepwiki.com、ask_questionなど3つのツール) | AGENTS.md / CLAUDE.mdにウィキ参照を自動挿入する設計 |
| チャットQ&A | Geminiチャット内蔵 | Ask Devinチャット内蔵(行単位の引用) | 別途チャットなし(エージェントがウィキをコンテキストとして消費) |

### 4.2 ポジショニングの違い

- Code Wiki: 「人間が読む生きた文書」を志向。Web UIの完成度と自動再生成の周期が強み。Googleのインフラを基盤とした大規模リポジトリ処理。
- DeepWiki: 「人間+AIエージェント両用」。URL置換というゼロ障壁のUXと公式MCPサーバーが強み。Devinエコシステムの無料層としての性格。
- OpenWiki: 「AIコーディングエージェントのためのコンテキストインフラ」。文書を外部サービスではなくリポジトリ内に置き、AGENTS.md/CLAUDE.mdがウィキを指すようにする設計。ウィキ全体を指示ファイルに入れる代わりに参照だけを挿入し、コンテキストの浪費を防ぐ。DeepAgentsベースのためLangSmithトレーシングをサポート。

---

## 5. 長所(Pros)

| 長所 | 説明 |
|------|------|
| ドキュメント化の自動化 | 手動でのドキュメント作成・保守コストが実質的に不要になる |
| 常に最新の状態 | コード変更ごとに文書が再生成され、stale documentation問題を解消 |
| オンボーディング時間の短縮 | Google側の主張によれば、新規コントリビューターがDay 1で最初のコミットができるレベルの理解速度 |
| レガシーコードの理解 | 原作者が不在のコードでもコミット履歴を含む分析で説明可能 |
| 無料+インストール不要 | パブリックプレビュー段階では公開リポジトリは無料、ブラウザのみで即時利用可能 |
| 検証可能な回答 | チャットの回答にソースコードへのリンクが付与され、hallucinationのクロスチェックが容易 |
| 可視化の提供 | アーキテクチャ/クラス/シーケンスダイアグラムがコードの現在の状態を反映 |

---

## 6. 短所(Cons)

| 短所 | 説明 |
|------|------|
| 公開リポジトリのみサポート | プレビュー段階ではGitHubの公開リポジトリのみ可能。プライベートはGemini CLI拡張のウェイティングリスト待ちが必要 |
| 公式APIの不在 | 自動化/パイプライン連携は非公式ツール(codewiki-cli、codewiki-mcp)に依存 |
| 価格未定 | 正式リリース後に有料化される可能性がある。企業向け有料プランのリリースの可能性が言及されている |
| プレビューの不安定性 | 機能・ポリシーが変更される可能性、想定外の制限が存在 |
| 生成制御手段の不在 | DeepWikiの`.devin/wiki.json`のような生成ステアリング手段がない |
| GitHub依存 | GitHubリポジトリのみが対象(GitLab/Bitbucketは未サポート) |
| コード品質への依存性 | メタプログラミングが多い、または動的言語の比率が高いコードベースでは文書の精度が低下する場合がある |

---

## 7. 注意点

### 7.1 セキュリティとプライバシー

- 公開リポジトリのみを対象としているため、機密性の高いコードを誤って公開リポジトリにアップロードしてドキュメント化しないよう注意する
- プライベートリポジトリ向けのGemini CLI拡張はウェイティングリスト状態であり、コードを外部に送信せずにローカルでウィキを生成する方式で開発が進められている

### 7.2 AI生成文書の限界

- AI生成文書はhallucinationの可能性があるため、重要な(load-bearing)主張はソースリンクをクリックして実際のコードで検証すること
- 大規模モノレポは処理時間が長くなったり、生成範囲の制限に達する場合がある

### 7.3 ライセンスと法的考慮事項

- 生成された文書の利用権限は元のコードのライセンスに従うと考えるのが安全である
- 現時点では、企業内部コードやNDA対象コードには利用できない

### 7.4 将来のロードマップ

- Gemini CLI拡張による、ローカル/プライベートリポジトリのサポートが予定されている(ウェイティングリスト運用中)
- 価格ポリシーは未公開、企業向け有料プランの可能性が言及されている
- パブリックプレビュー段階のため、機能とポリシーが変更される可能性がある

---

## 8. まとめと選択ガイド

| 状況 | 推奨ツール | 理由 |
|------|-----------|------|
| OSSプロジェクトを素早く理解したい | Code WikiまたはDeepWiki | インストール不要、無料、事前インデックス |
| AIエージェント(Claude Code、Cursorなど)にリポジトリのコンテキストを提供 | DeepWiki(公式MCP)またはcodewiki-cli | DeepWikiが公式サポートを持つ点で優位 |
| プライベート/社内リポジトリの文書化(今すぐ) | OpenWikiまたはDeepWiki(Devin有料) | Code Wikiは未サポート |
| コードがインフラの外に出てはならない環境 | OpenWiki + ローカルLLM、またはセルフホスト型の代替手段 | 完全なエアギャップ構成が可能な唯一の選択肢 |
| CIへの文書自動更新の統合 | OpenWiki | GitHub Action + git diff差分更新の設計 |

---

### 参考資料

- Google Developers Blog: Introducing Code Wiki(2025-11-13)
- codewiki.google公式サイト
- InfoQ: Google Launches Code Wiki(2025-11)
- Cognition Blog: DeepWiki発表 / docs.devin.ai
- LangChain Blog: Introducing OpenWiki(2026-07) / github.com/langchain-ai/openwiki
- github.com/aeroxy/codewiki-cli(非公式CLI)
