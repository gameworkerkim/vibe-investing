---
title: "Claude Code + Cursor + ChatGPTで開発生産性を最大化する"
subtitle: "実務ワークフロー+プロンプトクックブック完全版"
description: "ChatGPT・Claude Code・Cursorを組み合わせたマルチLLM開発ワークフローの実践ガイド。設計・実装・レビュー・文書化までを解説し、CLAUDE.mdテンプレート、Cursor Rulesテンプレート、AIコードレビュープロンプト50選を提供する。"
abstract: |
  AIに単純にコードを任せる時代は終わった。本ガイドは複数のLLMを組み合わせて、より効率的で最適化された結果を得るための手法を共有する。
  開発は知っている分だけ品質が変わる分野であり、設計・レビュー・セキュリティまでLLMをどれだけ効率的に使うかで成果物が変わる。
  ChatGPTをテックリード、Claude Codeをシニアエンジニア、Cursorをペアプログラマーとして役割分担し、実際の9ステップワークフローを解説。すぐに使えるCLAUDE.mdテンプレートとCursor Rulesテンプレート、AIコードレビュープロンプト50選を提供する。
summary_for_ai: |
  本書はソフトウェア開発においてChatGPT・Claude Code・Cursorを組み合わせる実務ワークフローガイドであり、各ツールに明確な役割を割り当てる:ChatGPTはテックリード(要件分析、設計レビュー)、Claude Codeはシニアエンジニア(実装、リファクタリング、大規模コード変更、テスト生成)、Cursorはペアプログラマー(IDE内コード生成、高速反復、パターン適用)。
  具体的な9ステップワークフローを提示する:(1) ChatGPTで要件を整理、(2) ChatGPTで設計を批判的にレビュー、(3) Claude Codeで役割付与/APEI方式(Analyze-Plan-Execute-Iterate)/数値目標を使って実装、(4) Cursorで高速なIDE内修正、(5) ChatGPTで敵対的コードレビュー("Grill Me"/"10x Engineer"プロンプト)、(6) Claude Codeでレビュー反映(2〜3回繰り返す)、(7) git diffベースのClaude+ChatGPT同時レビュー、(8) AI時代のTDD(実装前にテストを書く)、(9) ドキュメント自動化(README、ADR、運用ガイド、CHANGELOG)。
  アーキテクチャ・命名規則・コードスタイル・テスト・エラー処理・ロギング・セキュリティ・パフォーマンス・文書化の規約を含む完全なCLAUDE.mdプロジェクトルールテンプレートと、役割・コード生成原則・Java/Spring及びTypeScript/React向け言語別ルール・テスト/リファクタリング/PRルール・出力形式を含むCursor Rulesテンプレートを収録。
  最後に、一般レビュー・パフォーマンスレビュー・セキュリティレビュー・設計レビュー・テストレビューの5カテゴリ各10個、計50個のAIコードレビュープロンプトのクックブックで締める。
date: 2026-06-16
author: "Dennis Kim"
lang: ja
tags:
  - AIコーディング
  - Claude Code
  - Cursor
  - ChatGPT
  - プロンプトエンジニアリング
  - 開発生産性
keywords:
  - AIコーディングワークフロー
  - Claude Code Cursor ChatGPT
  - CLAUDE.mdテンプレート
  - Cursor Rulesテンプレート
  - AIコードレビュープロンプト
  - マルチLLM開発ワークフロー
group: llm-agents
featured: false
schema_type: TechArticle
draft: false
---

# Claude Code + Cursor + ChatGPTで開発生産性を最大化する

> **実務ワークフロー+プロンプトクックブック完全版**

AIに単純にコードを任せる時代は終わった。LLMをより効率的に使い、最適化された成果物を作るために、複数のLLMを使いこなす手法を共有する。
開発は知っている分だけ品質が変わる分野であり、設計・レビュー・セキュリティまでLLMをどれだけ効率的に使うかによって成果物が変わる。

今は**設計 → 実装 → レビュー → 改善 → 文書化**という開発サイクル全体にAIを配置する人が、より速く、より良いコードを作る。

---

## 目次

1. [なぜClaude、Cursor、ChatGPTを一緒に使うべきか?](#1-なぜclaudecursorchatgptを一緒に使うべきか)
2. [実際のワークフロー(9 Steps)](#2-実際のワークフロー9-steps)
3. [CLAUDE.mdテンプレート](#3-claudemdテンプレート)
4. [Cursor Rulesテンプレート](#4-cursor-rulesテンプレート)
5. [実践プロンプトクックブック](#5-実践プロンプトクックブック)
6. [AIコードレビュープロンプト50選](#6-aiコードレビュープロンプト50選)
7. [最終ワークフロー要約](#7-最終ワークフロー要約)
8. [結論](#8-結論)

---

## 1. なぜClaude、Cursor、ChatGPTを一緒に使うべきか?

多くの開発者が問う。

> 「Claudeが良い?」「ChatGPTが良い?」「Cursorだけでも十分では?」

実際に生産性が高い開発者は、一つだけを使わない。**各ツールの強みを役割別に分離する**。

| ツール | 役割 | 最も得意なこと |
|------|------|----------------|
| **ChatGPT** | テックリード | 要件分析、設計検証、アーキテクチャレビュー |
| **Claude Code** | シニアエンジニア | 実装、リファクタリング、大規模コード修正、テスト生成 |
| **Cursor** | ペアプログラマー | IDE内コード生成、反復修正、迅速なパターン適用 |

> AIを開発チームのメンバーのように考えるとわかりやすい。複数のLLMを使うことで、より最適化された結果が得られる。

---

## 2. 実際のワークフロー(9 Steps)

### STEP 1 — ChatGPTで要件を整理する

開発開始前に最初に行う作業である。

```
次の要件を分析してください。

目標: JWT認証サーバーの実装
要件:
- Spring Boot
- RedisでRefresh Tokenを管理
- Access Tokenは30分
- Refresh Tokenは14日
- OAuth2への拡張が可能

まず実装計画を作成し、
見落としている部分があれば指摘してください。
```

**得られる結果:** 実装範囲の整理 / 見落とした要件の発見 / APIリストの整理 / DB構造の提案 / リスク要因の分析

---

### STEP 2 — ChatGPTに設計を検証してもらう

自分で設計を作った場合でも、すぐに実装に入らない。

```
シニアバックエンドエンジニアの視点でレビューしてください。
拡張性/パフォーマンス/セキュリティ/保守性の観点から批判的に分析してください。

良い点は言わず、問題点だけを見つけてください。
```

> **Tip:** 「良い点は言わず」を追加すると、AIがはるかに積極的にレビューする。

---

### STEP 3 — Claude Codeに実装を任せる

設計が終わったら、実装はClaude Codeに任せる。Claudeは特に**大規模コード生成、ファイル間の参照、リファクタリング、テストコード生成**に強い。

**Claudeの性能を高める3つの方法**

**① 役割を付与する**
```
あなたは15年目のシニアバックエンドエンジニアです。
Clean Architectureを守り、
保守性とテスト可能性を最優先に考慮してください。
```

**② APEI方式を使う**
```
1. Analyze  — 要件と現在のコードを分析してください
2. Plan     — 実装計画を先に整理してください
3. Execute  — 計画通りに実装してください
4. Iterate  — 結果を検討し改善してください
```

**③ 目標を数値で提示する**
```
目標:
- TPS 1000以上
- 応答速度100ms以下
- テストカバレッジ80%以上
- 保守性を考慮

上記の条件を満たすように実装してください。
```

---

### STEP 4 — Cursorで素早く修正する

Claudeが生成したコードをCursorで仕上げる。IDE内で直接動作するため、反復作業の効率が高い。

```
このファイルのログをすべて構造化ログに変更してください。
例外処理パターンを統一してください。
すべてのAPIにSwagger Annotationを追加してください。
```

---

### STEP 5 — ChatGPTにコードレビューを任せる

実装後に必ず行う。

```
このコードをレビューしてください。
観点: パフォーマンス/セキュリティ/保守性/拡張性
良い点は除外し、問題点だけを見つけてください。
```

**強力な追加プロンプト:**

```
# Grill Me
この変更を容赦なく批判してください。

# 10x Engineer
10倍優れたエンジニアなら何を違うようにしたでしょうか?
```

---

### STEP 6 — Claudeに改善させる

ChatGPTが発見した問題をClaudeに伝える。**このプロセスを2〜3回繰り返す**とコード品質が大きく向上する。

```
次のレビュー内容を反映して改善してください。
[レビュー内容を貼り付け]
```

---

### STEP 7 — Git Diffベースのレビュー

```bash
git diff main..feature/my-branch
```

結果をそのままAIに渡す。

```
# Claudeへ
変更内容をレビューしてください。

# ChatGPTへ
このPRをレビューするつもりで問題点だけを見つけてください。
```

---

### STEP 8 — AI時代のTDD

実装より先にテストを書かせる。

```
# ステップ1
実装せず、テストコードだけ先に書いてください。

# ステップ2
このテストをパスする実装を書いてください。
```

> AIとTDDの相性は想像以上に良い。

---

### STEP 9 — 文書化の自動化

```
READMEを書いてください。
ADR(Architecture Decision Record)を書いてください。
運用ガイドを書いてください。
API文書を書いてください。
変更内容に基づいてCHANGELOGを更新してください。
```

---

## 3. CLAUDE.mdテンプレート

Claude Codeユーザーであれば事実上必須である。プロジェクトルートに`CLAUDE.md`ファイルを作成すると、Claudeがセッション開始時に自動で読み込み、**プロジェクト全体の一貫性**を維持する。

```markdown
# Project Rules for Claude

## Project Overview
- プロジェクト名: [プロジェクト名]
- 言語/フレームワーク: [例: Java 17 / Spring Boot 3.x]
- 目標: [核心目標 1〜2行]

## Architecture
- Clean Architectureを守る(Controller → Service → Repositoryのレイヤー分離)
- Service Layer必須 — Controllerにビジネスロジックを書かない
- Repositoryへの直接アクセス禁止(必ずServiceを経由)
- Domainオブジェクトは不変(Immutable)設計原則

## Naming Conventions
- DTOクラス: `XxxRequest`, `XxxResponse`接尾辞を使用
- Serviceインターフェースと実装を分離: `XxxService` / `XxxServiceImpl`
- Command Queryを分離(CQRSパターンを適用)
- 定数は`UPPER_SNAKE_CASE`、変数は`camelCase`

## Code Style
- 関数の最大長: 30行以下
- ネストしたif-elseは3段階以上禁止 → Early Returnパターンを使用
- マジックナンバー禁止 → 定数に分離
- コメントは「何」ではなく「なぜ」を説明する

## Testing
- すべてのServiceメソッドに単体テスト必須
- すべてのAPIエンドポイントに統合テストを作成
- テストカバレッジ目標: 80%以上
- テスト命名: `メソッド名_状況_期待結果`形式

## Error Handling
- カスタム例外を使用(`BusinessException`, `ValidationException`など)
- グローバル例外処理: `@ControllerAdvice`を活用
- API エラーレスポンス形式を統一: `{ code, message, data }`構造

## Logging
- 構造化ロギングを使用(JSON形式)
- ログレベル基準: ERROR(障害)、WARN(異常兆候)、INFO(主要フロー)、DEBUG(開発用)
- PII(個人情報)のログ出力禁止

## Security
- SQLインジェクション防止: PreparedStatementまたはORMのパラメータバインディングのみ使用
- XSS防止: 入力値検証と出力エンコーディング
- シークレットキー、パスワードのハードコーディング絶対禁止 → 環境変数またはVaultを使用

## Performance
- N+1問題防止: Fetch Joinまたは別クエリで解決
- ページネーション必須: 一覧取得APIにCursorベースのページネーションを適用
- キャッシング戦略: Redis TTLの明示必須

## Documentation
- すべてのPublic APIにSwagger/OpenAPIアノテーション必須
- 複雑なビジネスロジックにADR(Architecture Decision Record)を作成
- READMEは常に最新状態を維持
```

---

## 4. Cursor Rulesテンプレート

プロジェクトルートに`.cursorrules`ファイルを作成する。Cursorが自動で読み込み、コード生成品質を高める。

```
# Cursor Rules

## Role
You are a Senior Software Engineer with 15+ years of experience.
Always prioritize: correctness > readability > performance > brevity.

## Code Generation Principles
- Write self-documenting code; minimize comments except for "why" explanations
- Prefer composition over inheritance
- Follow SOLID principles
- Apply DRY but avoid premature abstraction
- Always handle edge cases and error conditions

## Language-Specific Rules (Java/Spring)
- Use constructor injection, not field injection (no @Autowired)
- Return Optional<T> instead of null for nullable values
- Use records for immutable DTOs
- Prefer stream API over imperative loops for collection processing
- Always use @Transactional(readOnly = true) for read operations

## Language-Specific Rules (TypeScript/React)
- Use functional components with hooks only (no class components)
- Define explicit TypeScript types; avoid `any`
- Use React Query for server state, Zustand for client state
- Apply error boundaries for async component errors
- Prefer named exports over default exports

## Testing Rules
- Write tests first when implementing new features (TDD)
- One assertion per test case (or logically grouped)
- Use descriptive test names: given_when_then format
- Mock external dependencies (DB, API calls) in unit tests
- Use real DB in integration tests (Testcontainers)

## Refactoring Rules
- Never change behavior when refactoring; tests must pass before and after
- Extract method when function exceeds 20 lines
- Replace magic numbers/strings with named constants
- Eliminate code duplication > 3 occurrences

## PR / Commit Rules
- Commit messages: feat / fix / refactor / test / docs / chore prefixを使用
- 1コミット1論理変更
- PR description: 変更理由(Why) → 変更内容(What) → テスト方法(How to Test)

## Output Format
- Always include necessary imports
- Show complete, runnable code (no placeholder comments like "// TODO: implement")
- If multiple approaches exist, briefly note the trade-offs
- Flag potential security issues immediately
```

---

## 5. 実践プロンプトクックブック

### 設計&アーキテクチャ

```
# 技術スタック選定
[要件]を実装するのに適した技術スタックを推薦してください。
各選択肢の長所短所を表で整理し、最終的な推薦理由を説明してください。

# アーキテクチャ設計
[システム名]のアーキテクチャを設計してください。
- 想定トラフィック: DAU [N]人, TPS [N]
- 核心制約: [レイテンシ/コスト/拡張性の優先順位]
図の説明+各コンポーネントの選定理由を含めてください。

# データベース設計
[ドメイン]のERDを設計してください。
正規化レベル、インデックス戦略、パーティショニングの考慮事項を含めてください。

# API設計
RESTful API設計原則に従い、[機能]のAPI仕様を作成してください。
エンドポイント、HTTPメソッド、リクエスト/レスポンススキーマ、エラーコードを含めてください。
```

---

### 実装

```
# 機能実装(詳細)
[機能名]を実装してください。
- 言語/フレームワーク: [例: Java 17 / Spring Boot 3]
- アーキテクチャパターン: [Clean Architecture / Hexagonal]
- 非機能要件: TPS [N], 応答速度[N]ms以下
- テストコードを含める
- エラー処理を含める

# リファクタリング
以下のコードをリファクタリングしてください。
[コードを貼り付け]
- 可読性の向上
- 重複の除去
- SOLID原則の適用
変更前/後の比較と理由を説明してください。

# パフォーマンス最適化
以下のコードのパフォーマンスボトルネックを見つけて最適化してください。
[コードを貼り付け]
想定される改善効果(Big-O基準)とトレードオフを明示してください。

# マイグレーション
[既存コード/ライブラリ]を[新規コード/ライブラリ]にマイグレーションしてください。
段階的な移行戦略とロールバック計画を含めてください。
```

---

### テスト

```
# 単体テスト生成
以下のコードの単体テストを作成してください。
[コードを貼り付け]
- Happy Path、Edge Case、Exception Caseをすべて含める
- テストフレームワーク: [JUnit5 / Jest / pytest]
- モッキング戦略の説明を含める

# 統合テスト生成
[APIエンドポイント]の統合テストを作成してください。
- 実際のDBを使用(Testcontainers)
- 認証/認可シナリオを含める
- データセットアップ/クリーンアップコードを含める

# テストカバレッジ分析
以下のテストコードを分析し、不足しているケースを見つけてください。
[テストコードを貼り付け]
追加すべきテストのリストを優先度順に整理してください。

# 負荷テストシナリオ
[API名]の負荷テストシナリオを作成してください。
- ツール: [k6 / JMeter / Locust]
- 目標: TPS [N], 応答時間P99 [N]ms以下
- 段階的な負荷増加シナリオを含める
```

---

### セキュリティ

```
# セキュリティ脆弱性チェック
以下のコードの脆弱性をOWASP Top 10基準で分析してください。
[コードを貼り付け]
脆弱性ごとのリスクレベル(High/Medium/Low)と修正方法を提示してください。

# 認証/認可設計
[システム]の認証/認可システムを設計してください。
- JWT vs Sessionの比較
- RBAC vs ABACの選定基準
- Refresh Tokenのセキュリティ戦略
- OAuth2/OIDC統合方案

# 暗号化戦略
[データ]の暗号化戦略を策定してください。
保存データ(at-rest)と転送データ(in-transit)の両方を含めてください。
```

---

### デバッグ

```
# エラー分析
以下のエラーログを分析し、原因と解決策を提示してください。
[エラーログを貼り付け]
再発防止方法も含めてください。

# パフォーマンス分析
以下のAPM/プロファイリング結果を分析し、改善方案を提示してください。
[プロファイリング結果を貼り付け]

# N+1問題を見つける
以下のコードでN+1クエリ問題を見つけてください。
[コードを貼り付け]
最適化されたクエリに修正してください。
```

---

### ドキュメント化

```
# README生成
以下のコード/プロジェクトのREADME.mdを作成してください。
[コード/説明を貼り付け]
含む項目: プロジェクト概要、インストール方法、使用法、APIリファレンス、コントリビュート方法、ライセンス

# ADR作成
[技術決定名]に関するADR(Architecture Decision Record)を作成してください。
含む項目: 背景、決定事項、検討した代案、結果、トレードオフ

# 技術的負債の文書化
以下のコードの技術的負債を分析し文書化してください。
[コードを貼り付け]
負債項目ごとの影響度、解決コスト、優先度を表で整理してください。

# 運用ガイド作成
[サービス名]の運用ガイドを作成してください。
含む項目: デプロイ手順、モニタリング項目、アラート基準、障害対応プレイブック、ロールバック方法
```

---

## 6. AIコードレビュープロンプト50選

### 一般レビュー(1〜10)

```
1. このコードをシニアエンジニアの視点でレビューしてください。良い点は除外し、問題点だけ。
2. このPRをマージする前に必ず確認すべき事項を見つけてください。
3. このコードで6ヶ月後に保守する際に問題になりそうな部分を見つけてください。
4. このコードを初めて見る開発者が理解しにくい部分を見つけてください。
5. Grill Me — このコードを容赦なく批判してください。
6. 10倍優れたエンジニアならこのコードをどう違うように書いたでしょうか?
7. このコードの複雑度(Cyclomatic Complexity)が高い部分を見つけ、単純化方法を提示してください。
8. このコードでSOLID原則に違反している部分を見つけてください。
9. このコードでDRY原則に違反している重複コードを見つけてください。
10. このコードの依存関係構造を分析し、循環依存があるか確認してください。
```

---

### パフォーマンスレビュー(11〜20)

```
11. このコードでパフォーマンスボトルネックになりうる部分を見つけてください。
12. このコードで不要なDBクエリが発生する部分を見つけてください。(N+1を含む)
13. このコードでメモリリークが発生しうる部分を見つけてください。
14. このコードでキャッシングを適用すると効果的な部分を見つけてください。
15. このコードで非同期処理により改善可能な部分を見つけてください。
16. このコードでインデックスが適切に活用されていないクエリを見つけてください。
17. このコードでGC負荷を減らすために改善すべき部分を見つけてください。
18. このコードでコネクションプール枯渇が発生しうるパターンを見つけてください。
19. このコードの時間複雑度を分析し、より効率的なアルゴリズムを提案してください。
20. このコードで不要なシリアライズ/デシリアライズが発生する部分を見つけてください。
```

---

### セキュリティレビュー(21〜30)

```
21. このコードをOWASP Top 10基準でセキュリティ脆弱性分析してください。
22. このコードでSQL Injection脆弱性がある部分を見つけてください。
23. このコードで認証/認可が欠けているAPIエンドポイントを見つけてください。
24. このコードで機密情報(PII、パスワード、トークン)がログに露出する部分を見つけてください。
25. このコードでハードコードされたシークレットや資格情報を見つけてください。
26. このコードでXSS脆弱性が発生しうる部分を見つけてください。
27. このコードでCSRF防御が不十分な部分を見つけてください。
28. このコードでRace Conditionが発生しうる部分を見つけてください。
29. このコードで入力値検証が欠けている部分を見つけてください。
30. このコードでエラーメッセージが内部情報を過度に露出する部分を見つけてください。
```

---

### 設計レビュー(31〜40)

```
31. このコードのレイヤー分離が適切か検討してください。
32. このコードでService Layerが過度に肥大化した部分を見つけてください。(God Classパターン)
33. このコードでドメインロジックが間違ったレイヤーに位置する部分を見つけてください。
34. このコードの拡張性を評価してください。要件が10倍増加したらどこが問題になるでしょうか?
35. このコードでStrategyパターン、Factoryパターンなどのデザインパターンを適用すると良い部分を見つけてください。
36. このコードのトランザクション境界が正しく設定されているか検討してください。
37. このコードで単一責任原則(SRP)に違反しているクラス/関数を見つけてください。
38. このコードのエラー処理戦略が一貫して適用されているか検討してください。
39. このコードのAPI契約(Contract)が変更に対して安全か評価してください。
40. このコードでイベント駆動アーキテクチャに改善すると良い部分を見つけてください。
```

---

### テストレビュー(41〜50)

```
41. このテストコードで不足しているケースを見つけてください。(Edge Case、Exception中心)
42. このテストが実際に意味のある検証をしているか評価してください。(False Positiveの点検)
43. このテストでテスト間の依存性(順序依存、グローバル状態共有)があるか見つけてください。
44. このテストコードの可読性を改善してください。(Arrange-Act-Assertパターンを適用)
45. このコードで単体テストが不可能な構造を見つけてください。テスト可能にするリファクタリング方法を提案してください。
46. このモッキング戦略が適切か評価してください。Over-mockingまたはUnder-mockingの有無を確認。
47. このテストの実行速度を改善できる部分を見つけてください。
48. このテストが非決定論的(Flaky)に動作しうる部分を見つけてください。
49. このコードのテストカバレッジを分析し、必ず追加すべきテストを優先度順に整理してください。
50. この統合テストが実際の運用環境を十分に再現しているか評価してください。
```

---

## 7. 最終ワークフロー要約

```
1. ChatGPT     → 要件分析および見落とし事項の確認
2. ChatGPT     → 設計検証(問題点だけ見つける)
3. Claude Code → CLAUDE.mdベースの実装
4. Claude Code → TDD — テスト先、実装後
5. Cursor      → IDE内の反復修正およびパターン統一
6. ChatGPT     → コードレビュー(Grill Me / 10x Engineer)
7. Claude Code → レビュー反映改善(2〜3回繰り返す)
8. Git Diff    → Claude + ChatGPT同時PRレビュー
9. AI          → README / ADR / 運用ガイドの文書化
```

---

## 8. 結論

AIは開発者を代替しない。

しかし**AIを上手く使う開発者は、AIを使わない開発者を代替する可能性が高い。**

重要なのはどのモデルが優れているかではない。より重要なのは:

- **ChatGPTで考え**
- **Claudeで実装し**
- **Cursorで生産性を高め**
- **再びChatGPTで検証する**

という開発プロセスを作ることである。

AIをコード自動補完ツールとしてだけ使わず、**設計者・レビュアー・シニアエンジニア**として活用してみてほしい。

生産性が完全に変わる。

---

## 要約(LinkedIn / SNS用)

✔ **ChatGPT** → 要件分析および設計検証
✔ **Claude Code** → 実装およびリファクタリング(CLAUDE.mdで一貫性を確保)
✔ **Cursor** → IDE内の生産性向上(.cursorrulesを活用)
✔ **ChatGPT** → コードレビューおよび最終検証
✔ **AIコードレビュープロンプト50選** → 品質基準の標準化

> AIを一つ選ぶ時代ではなく、**AIチームを構成する時代**が来た。

---

*#AI #ClaudeCode #ChatGPT #Cursor #SoftwareEngineering #DeveloperProductivity #Coding #Programming #GenerativeAI #PromptEngineering*
