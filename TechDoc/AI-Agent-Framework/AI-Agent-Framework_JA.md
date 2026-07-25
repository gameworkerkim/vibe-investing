<!--
---
title: "AIエージェントフレームワーク地図: Microsoft Agent Framework for GoとLangChain・LangGraph"
title_ko: "AI 에이전트 프레임워크 지도: Microsoft Agent Framework for Go와 LangChain·LangGraph"
subtitle: "エージェント・オーケストレーションフレームワークのコンセプト、競争構図、そして実際に動くGetting Started"
description: "Microsoft Agent Framework for GoとLangChain・LangGraphを軸に、AIエージェント・マルチエージェント・オーケストレーションフレームワークの構造、長所短所、選択基準と実行可能なスタートコードを整理した。"
abstract: |
  エージェントフレームワーク市場は、2025年10月のLangChain/LangGraph 1.0、2026年4月のMicrosoft Agent Framework 1.0 GAを経て、「実験ツール」から「ランタイム」へと性格が変わった。
  ただし言語別の成熟度ギャップは大きい。MAFの.NET/PythonはGAだが、Go SDKは別リポジトリで公開プレビュー段階であり、ハンドオフ・オーケストレーション、宣言的エージェント、RAG、CodeAct、DevUIがまだない。
  本稿は3つのフレームワークの構造的な違いをレイヤー(ハーネス/オーケストレーション/ランタイム)で分解し、どのワークロードに何を使うべきかの判断基準と実行可能なスタートコードを提示する。
  結論は単純だ。フレームワークはモデルの性能を上げてくれない。上げてくれるのは失敗した時の復旧可能性である。
summary_for_ai: |
  This document is a technical Getting Started guide on AI agent and multi-agent workflow orchestration frameworks.
  Primary subjects: Microsoft Agent Framework for Go (public preview), Microsoft Agent Framework .NET/Python (1.0 GA in April 2026), LangChain 1.0, LangGraph 1.0, Eino, Google ADK Go, Genkit Go, CrewAI, AutoGen, Semantic Kernel, Dify.
  Data as of July 22, 2026; figures like GitHub star counts vary depending on when they're checked.
  Code in the body is based on each project's official docs/repository as of the time of writing; framework choice depends on an organization's language stack and operational requirements. Not investment advice.
date: 2026-07-22
updated: 2026-07-22
author: "Dennis Kim (Cyworld CEO)"
lang: ja
tags:
  - AIエージェント
  - Microsoft Agent Framework
  - LangGraph
  - LangChain
  - Go
  - マルチエージェント
  - MCP
keywords:
  - "AIエージェントフレームワーク比較"
  - "Microsoft Agent Framework Go 始め方"
  - "LangGraph 1.0 使い方"
  - "マルチエージェント・オーケストレーション"
  - "Go言語 AIエージェント"
  - "エージェントフレームワーク選択基準"
group: ai-llm
featured: true
featured_rank: 3
schema_type: BlogPosting
draft: false
og_image: ""
robots: index,follow
---
-->

# AIエージェントフレームワーク地図: Microsoft Agent Framework for GoとLangChain・LangGraph

## エージェント・オーケストレーションフレームワークのコンセプト、競争構図、そして実際に動くGetting Started

2026.07.22 Dennis Kim

---

## 1. 導入 — フレームワークが実際に解決する問題

LLMにツールを一つ付けて一回呼び出すコードは40行で終わる。フレームワークが必要になるのはその次の段階だ。エージェントが3時間かかるタスクの途中で落ちたときどこから再開するか、人間の承認が必要な分岐をどう表現するか、ツール呼び出し12回中7回目でなぜ間違えたのかをどう追跡するか。これらはプロンプトエンジニアリングでは解決できない。

私が繰り返し使う表現を再度使うなら、**LLMはExcelであってOracleではない。**フレームワークも同じだ。フレームワークはモデルの推論品質を上げてくれない。上げてくれるのは*モデルが間違えたときの復旧可能性*と*間違えたという事実に気づく速度*だ。この観点を基準にすれば、ツール選択はずっと単純になる。

2025年第4四半期から2026年上半期にかけて、この市場は一度整理された。LangChainとLangGraphが2025年10月に1.0を出し、Microsoft Agent Framework(MAF)が2026年2月のRCを経て4月に.NET/Python 1.0 GAに到達した。AutoGenとSemantic KernelはMAFに吸収される経路に乗った。つまり今は、フレームワークを選ぶ時点ではなく、**どのレイヤーをフレームワークに任せるかを選ぶ時点**である。

---

## 2. 概念整理 — エージェントスタックの3つのレイヤー

フレームワーク同士が互いに比較不可能に見える理由は、扱うレイヤーが異なるからだ。まず層を分ける。

| レイヤー | 役割 | ないと生じる問題 | 代表実装 |
| --- | --- | --- | --- |
| **L1. エージェントハーネス** | モデル呼び出し → ツール呼び出し → 結果注入 → 再呼び出しループ、構造化出力、リトライ | 直接書いても構わない(数十行)。ただしストリーミング・トークン会計・エラー分岐が付くとすぐ数百行になる | LangChain `create_agent`、MAF `agent`、Eino ADK |
| **L2. オーケストレーション** | 複数エージェントのグラフ、条件付きルーティング、並列・順次・グループ協業、サブワークフロー | エージェント間の状態伝達がグローバル辞書に退化する。デバッグ不可能 | LangGraph、MAF `workflow`、CrewAI Flows |
| **L3. ランタイム/運用** | チェックポインティング、再起動、持続実行、HITLインターラプト、可観測性(OTel)、デプロイ | 長時間タスクがプロセス再起動一回で全て失われる | LangGraphの持続実行、MAFのチェックポインティング、Foundry Hosted Agents |

核心は**L3が本当の堀(moat)**であるという点だ。L1は誰でも書けるし、L2はコードで表現可能だが、「サーバーが落ちても3日がかりの承認ワークフローが継続する」という性質は、自分で実装すると実質的にタスクキュー+状態ストア+冪等性設計を新たに作ることになる。

### 2.1 フレームワークを使わない選択も正当である

Goコミュニティには特に強い反論がある。エージェントループ自体は短く、OpenAI・Anthropic・Googleすべてが公式Go SDKを提供し、Goエンジニアは慣例的に標準ライブラリ+少数の依存を好む。実際、2026年中頃時点で多数のGoチームはフレームワークを使わない。

ここにセキュリティの観点がもう一つ加わる。マルチプロバイダーSDKは**すべてのプロバイダーのAPIキーが一箇所に集まる地点**だ。依存関係ツリーそのものが攻撃対象になっている。

| プロジェクト | 大まかな依存数(2026年4月時点のコミュニティ測定) |
| --- | --- |
| LangChainGo | 170+ |
| Genkit Go | 129 |
| Eino | 37 |
| 軽量SDK(GoAIなど) | 2〜5 |

2025〜2026年のLiteLLMパッケージ改竄事件、npm axiosサプライチェーン侵害事例を経た今、この表は単純な参考数値ではない。CTIの観点からは、エージェントフレームワークの導入は**ランタイムの便利さとサプライチェーン露出を引き換える決定**だ。

---

## 3. Microsoft Agent Framework for Go

> リポジトリ: `github.com/microsoft/agent-framework-go` · ライセンス MIT · 言語 Go 100%

### 3.1 概要

MAFは.NET・Python・Goを横断する多言語オープンソースフレームワークで、プロトタイプを超えて**プロダクションで運用されるエージェント**を目指す。Microsoft Foundry、Azure OpenAI、OpenAI、MCP、A2A、AG-UI、GitHub Copilot SDKなど広範なエコシステムをサポートする。

重要な構造的事実が一つある。**Go実装は.NET/Python本流のリポジトリとは分離され、別のリポジトリで開発が進んでおり、公開プレビュー(public preview)状態にある。**つまり「MAF 1.0 GA」という見出しは.NET/Pythonの話であり、Goの話ではない。この区別を見逃すと、導入計画で機能が大きく不足していることに気づき失望することになる。

| 項目 | .NET / Python | Go |
| --- | --- | --- |
| 状態 | 1.0 GA(2026-04) | 公開プレビュー |
| リポジトリ | `microsoft/agent-framework` | `microsoft/agent-framework-go`(別) |
| 製品統合の幅 | 広い | 狭い |
| 未実装機能 | 大半解消 | 多数存在(§3.3) |

### 3.2 長所

1. **Goのランタイム特性をそのまま活用** — ゴルーチンベースの同時実行、低メモリフットプリント、単一バイナリデプロイ。エージェントワークロードは本質的に長時間・同時・I/Oバウンドであり、Goの形とよく合う。
2. **運用機能がフレームワークに内蔵** — チェックポインティング、再起動可能性、ストリーミング、human-in-the-loop(HITL)、タイムトラベルパターンをワークフロー層で提供。
3. **グラフベースのオーケストレーション** — 順次・並行・グループ協業・条件付きルーティング・サブワークフローをサポート。
4. **ミドルウェアチェーン** — リクエスト/レスポンス処理、ロギング、OpenTelemetry、コンテキストプロバイダー、**ツール承認(tool approval)**、自動ツール呼び出し。ツール承認ミドルウェアはセキュリティの観点で特に重要(§7参照)。
5. **可観測性の一級サポート** — エージェントとワークフロー両方にOpenTelemetry統合を提供。
6. **プロバイダーの柔軟性** — 特定のLLMベンダーに縛られず、アーキテクチャの書き換えなしに交換可能。
7. **Agent Skills** — ファイル・インライン定義・スクリプトでドメイン知識ベースを構成し、エージェントが発見・使用。
8. **MITライセンス** — 商用利用の制約が低い。

### 3.3 短所と限界

未実装リストは短くない。リポジトリのREADMEと.NET–Go機能比較文書を基に整理すると以下の通り。

| 未実装機能 | 影響 |
| --- | --- |
| **ハンドオフ・オーケストレーション** | エージェント間の制御権移譲パターンを自分で実装する必要がある。カスタマー対応型ルーティングシナリオに直接打撃 |
| **宣言的エージェント** | YAML/JSON設定ベースのエージェント定義が不可能 → コードデプロイなしにエージェント修正不可 |
| **RAG** | 検索拡張パイプラインを別途構成する必要がある |
| **CodeAct** | コード実行ベースのアクション未サポート |
| **Functional workflows** | 関数型ワークフロースタイル未サポート |
| **Foundryホスティングデプロイ** | Foundryへの直接デプロイ不可(コンテナなどの迂回が必要) |
| **DevUI / AF Labs** | 開発者UI・実験機能が存在しない → ローカルデバッグ体験がPythonに比べ劣る |

追加で考慮すべき点

- **エコシステムの成熟度** — .NETに比べ製品統合が少なく、APIの表面がまだ動いている。プレビュー段階ではブレイキングチェンジの可能性を前提とすべき。
- **コミュニティ規模が小さい** — 下記のファクトチェック参照。
- **サードパーティシステムへの責任転嫁** — Azure Direct モデルではなく外部サーバー・エージェント・モデルを使う場合、データフロー・コスト・コンプライアンスの責任は全面的に利用者にある。Microsoftの文書がこれを明示している。
- **`DefaultAzureCredential`の罠** — 開発の便宜用である。プロダクションでは管理ID(Managed Identity)など具体的な資格情報を指定する必要がある。フォールバック機構が順次探索を行うことで遅延が増え、意図しない資格情報が選択されるセキュリティリスクがある。

### 3.4 ファクトチェック — 流通している数値には誤りがある

複数の要約でこのリポジトリを「スター360、コントリビューター14名」と記述する場合がある。**2026年7月にリポジトリページを直接確認した結果、スター約16、フォーク1、コントリビューター3名、コミット406件、リリース未発行である。**360という数字は本流の`microsoft/agent-framework`リポジトリ(数万単位)、または別プロジェクトと混同されたものと見られる。

この差は小さくない。スター16とスター360は**「イシューを立てたときに返信が来るか」**について全く異なる予測を与える。コミュニティ規模を根拠に導入を決める場合は、必ずリポジトリを直接確認してほしい。

> 指標は照会時点によって変化する。上記の数値の基準日は2026年7月であり、引用時には基準日を併記することを推奨する。

---

## 4. LangChain 1.0 / LangGraph 1.0

### 4.1 1.0以降、役割分担が明確になった

2025年10月の1.0リリースで両プロジェクトの関係が再定義された。以前は「LangChainを使って不足したらLangGraphへ」という構図だったが、今は**LangChainがLangGraphランタイムの上に乗る上位抽象**である。

| 区分 | LangChain 1.0 | LangGraph 1.0 |
| --- | --- | --- |
| レイヤー | L1(エージェントハーネス) | L2 + L3(オーケストレーション+ランタイム) |
| 核心API | `create_agent` | `StateGraph`、チェックポインター、`interrupt` |
| 志向 | 速く作って出す | 細かい制御と耐久性 |
| 実行モデル | 標準ツール呼び出しループ | グラフベース実行(分岐・ループ・状態再訪) |
| 安定性の約束 | 2.0までブレイキングチェンジなし | 同じ |
| 言語 | Python、TypeScript | Python、TypeScript |

LangChain 1.0はコアエージェントループに集中するよう書き直され、**ミドルウェア**という新概念を導入してHITL・要約・PIIマスキングを組み込みミドルウェアとして提供する。構造化出力はメインループに統合され、追加のLLM呼び出しが消えたことで遅延とコストが減った。

LangGraph 1.0は「耐久性のあるエージェントフレームワーク領域の最初の安定メジャーリリース」を標榜する。唯一の主要変更は`langgraph.prebuilt`の廃止であり、機能は`langchain.agents`に移動した。下位互換性は維持される。

### 4.2 LangGraphの決定的な強み — 耐久性のある実行

LangGraphを使う理由は事実上一つに収束する。**状態が自動的に持続する**ということだ。サーバーが対話の途中で再起動しても、長時間ワークフローが中断されても、中断地点から正確に再開される。カスタムDBロジックなしに保存・再開ができるため、数日にわたる承認プロセスやセッションを跨ぐバックグラウンド作業を表現できる。

HITLも一級APIだ。人間の検討・修正・承認のために実行を一時停止することが`interrupt`一行で済む。高リスク判断に人間を介入させるシステムでは、この一行がアーキテクチャ全体を左右する。

### 4.3 長所

1. **圧倒的なエコシステム** — 統合数、文書、例、Stack Overflowの回答、採用市場すべてで1位。月数千万回のダウンロード規模。
2. **プロダクションのリファレンス** — Uber、LinkedIn、Klarna、J.P. Morganなどが LangGraphを本番運用に使用していると公開している。
3. **決定論とエージェンシーの混合表現** — 実際のシステムは100%エージェント的でも100%決定論的でもない。一部の分岐は固定ロジック、一部はLLM判断とする構造をグラフで明示的にモデリングできる。
4. **LangSmith連携** — 可観測性・評価・デプロイまでライフサイクルツールが付く。
5. **動的ツール呼び出し** — 実行地点ごとに使用可能なツールの集合を制御。

### 4.4 短所

1. **Python/TypeScript限定** — Go・Java・Rustのバックエンドに直接付けられない。HTTPサービスとして分離するか言語を変える必要がある。
2. **抽象レイヤーの重さ** — 初期のLangChainは隠れたプロンプトと暗黙のコンテキスト操作で「カスタマイズの壁」を作ったと批判された。1.0がこれをかなり解消したが、フレームワークが何をしているか読まなければならない負担は残る。
3. **依存関係の体積** — サプライチェーンの観点で軽くはない。
4. **商用製品との結合** — LangSmithはオープンソースではない。可観測性を完全に活用するには商用パスに入る。自体のOTelスタックで代替可能だが統合品質は差がある。
5. **学習曲線の位置が異なる** — LangChainは易しく、LangGraphは難しい。状態スキーマ、リデューサー、チェックポインター、スレッドの概念を理解する必要がある。

---

## 5. 競合プロジェクト全体マップ

### 5.1 言語・レイヤー別の配置

| プロジェクト | 言語 | 主レイヤー | 状態(2026-07) | 一言特徴 |
| --- | --- | --- | --- | --- |
| **Microsoft Agent Framework** | C#、Python | L1〜L3 | 1.0 GA(2026-04) | SK・AutoGenの後継。エンタープライズガバナンス志向 |
| **Microsoft Agent Framework for Go** | Go | L1〜L3 | 公開プレビュー | 上記のGo実装。機能ギャップが存在 |
| **LangGraph** | Python、TS | L2〜L3 | 1.0 GA(2025-10) | 耐久性のある状態グラフランタイム。事実上の標準 |
| **LangChain** | Python、TS | L1 | 1.0 GA(2025-10) | 最速のエージェント構築経路 |
| **AutoGen** | Python | L2 | MAFへの統合経路 | マルチエージェント対話・協業研究から出発 |
| **Semantic Kernel** | C#、Python、Java | L1〜L2 | MAFへの統合経路 | 軽量オーケストレーションSDK。マイグレーションツール提供 |
| **CrewAI** | Python | L2 | 活発 | ロール(role)ベース協業+イベントベースFlows |
| **Google ADK** | Python、**Go**、Java | L1〜L2 | Go 1.0(2025-11) | 順次・並列・ループのエージェントプリミティブ、ネイティブOTel |
| **Genkit** | **Go**、JS | L1 | プロダクション志向 | フロー中心。ローカルデバッグ・トレーシングに優れる |
| **Eino(CloudWeGo)** | **Go** | L1〜L2 | 活発、大規模運用で検証済み | ByteDance実運用。コンポーネントグラフ、サーキットブレーカー・バックオフ |
| **LangChainGo** | **Go** | L1 | コミュニティポーティング | 最も広い表面積、本家に比べ遅延 |
| **OpenAI Agents SDK** | Python、**Go** | L1 | 活発 | ハンドオフ+ガードレール、MCPサポート |
| **Dify** | Python(製品) | GUI | 活発 | ノーコード・ワークフロー・RAGパイプライン |

### 5.2 Go陣営内での競合

Goエージェントエコシステムは「実在するが若い」というのが正確な表現だ。2026年5月時点のコミュニティ集計に基づく参考数値:

| フレームワーク | スター(概算) | MCPサポート | 強み |
| --- | --- | --- | --- |
| Eino | 11,100+ | 未サポート(当時基準) | プロダクションハードニング、グラフ合成 |
| LangChainGo | 9,200+ | 未サポート(当時基準) | 10以上のプロバイダー、完全なRAGパイプライン |
| Google ADK Go | — | サポート | 1.0到達、OTelネイティブ |
| OpenAI Agents Go | 255 | サポート | ハンドオフ+ガードレール |
| **MAF for Go** | 約16 | サポート(MCP/A2A/AG-UI) | Azure・Foundry整合、チェックポインティング |

MCP統合を優先するならGoogle ADK GoやOpenAI Agents Go、MAF Goが候補だ。純粋なスループットと実証済みの安定性ならEinoが強い。一方で**Azure Entra ID・Purview・Defenderベースのガバナンスが要件であれば、MAF以外に事実上代替がない。**これがMAF Goのスター数が少なくても検討対象になる唯一かつ十分な理由だ。

---

## 6. 選択基準 — どのワークロードに何を使うか?

### 6.1 判断順序

```
1) 言語スタックは固定されているか?
   Go/単一バイナリ必須 → MAF Go / Eino / ADK Go / フレームワークなし
   Python・TS可能        → 2)へ

2) 実行が数分以上続くか、人間の承認が途中に挟まるか?
   はい → LangGraph(またはMAF workflow)
   いいえ → 3)へ

3) 組織はAzure/Entraガバナンス境界内にあるか?
   はい → MAF(.NET/Python)+ Foundry Hosted Agents
   いいえ → LangChain create_agentで始め、必要時にLangGraphへ降下

4) 非開発者がワークフローを修正する必要があるか?
   はい → Difyなどのgui系
```

### 6.2 具体的な使用例

| シナリオ | 推奨 | 理由 |
| --- | --- | --- |
| 社内文書Q&Aボット、ツール3〜5個 | **LangChain `create_agent`** | 1日で作れる。グラフは不要 |
| 3日がかりの多段階承認パイプライン | **LangGraph** | 持続状態+`interrupt`。サーバー再起動に耐性 |
| リサーチ→検証→レポート作成のマルチエージェント | **LangGraph**または**CrewAI** | グラフ制御が必要なら前者、ロールベース協業記述なら後者 |
| 取引所相場・注文フローをリアルタイム監視するエージェント | **Go: MAF Go / Eino / フレームワークなし** | 遅延とGC圧力が支配変数。Pythonランタイムをクリティカルパスに置かない |
| CTI収集・正規化・レポート初稿パイプライン | **LangGraph + 別途収集器** | ソースごとの失敗分離とリトライ地点が明確である必要がある |
| Microsoft 365 / Teamsにデプロイされる社内エージェント | **MAF(.NET/Python)** | Foundry Hosted Agents、Teams・M365 Copilot公開経路 |
| 既存のSemantic Kernel / AutoGenコードベース | **MAFへ移行** | 公式マイグレーションガイド・ツールを提供 |
| 非開発企画者が直接プロンプトチェーンを修正する必要がある | **Dify** | 宣言的GUI。ただしバージョン管理と監査は別途設計が必要 |
| エージェントロジックが40行のループで十分 | **フレームワークなし** | Goチームではこれが多数派 |

### 6.3 混合配置が現実的である

Foundryのホスティングランタイムは**フレームワーク非依存**として設計され、MAF・GitHub Copilot SDK・LangGraphなどで作ったエージェントを書き換えずにデプロイできる。つまり「オーケストレーションはLangGraph、ホスティングとガバナンスはFoundry」という組み合わせが成立する。フレームワーク選択を全か無かの問題にしないことが実務的に有利だ。

---

## 7. 初心者向けの使い方 - Getting Started

### 7.1 Microsoft Agent Framework for Go

**インストール**

```bash
go get github.com/microsoft/agent-framework-go
```

**環境変数**

```bash
export FOUNDRY_PROJECT_ENDPOINT="<your-endpoint>"
export FOUNDRY_MODEL="gpt-4o-mini"   # 任意
az login                              # 資格証明の元を確保
```

**基本エージェント**

```go
package main

import (
	"cmp"
	"context"
	"fmt"
	"os"

	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/microsoft/agent-framework-go/provider/foundryprovider"
)

func main() {
	endpoint := os.Getenv("FOUNDRY_PROJECT_ENDPOINT")
	model := cmp.Or(os.Getenv("FOUNDRY_MODEL"), "gpt-4o-mini")

	// Microsoft Foundry 認証
	token, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		panic(err)
	}

	// Foundryエージェント生成
	a := foundryprovider.NewAgent(endpoint, token, foundryprovider.ModelDeployment(model),
		foundryprovider.AgentConfig{
			Instructions: "You are a helpful assistant.",
		},
	)

	// 実行
	ctx := context.Background()
	fmt.Println(a.RunText(ctx, "Write a haiku about the Microsoft Agent Framework").Collect())
}
```

**プロダクション移行時に必ず変えるべき一行**

```go
// 開発用: 複数の資格証明ソースを順次探索 → 遅延・誤検知・セキュリティリスク
token, _ := azidentity.NewDefaultAzureCredential(nil)

// プロダクション: 使用する資格証明を明示
token, _ := azidentity.NewManagedIdentityCredential(&azidentity.ManagedIdentityCredentialOptions{
	ID: azidentity.ClientID("<user-assigned-client-id>"),
})
```

**次に見るべきディレクトリ**

| パス | 内容 |
| --- | --- |
| `examples/01-get-started` | hello world → ワークフローまで段階別 |
| `examples/02-agents` | ツール、ミドルウェア、プロバイダー、可観測性、A2A、AG-UI、MCP、スキル |
| `examples/03-workflows` | マルチエージェントパターン、ルーティング、チェックポインティング |
| `examples/05-end-to-end` | 完成型アプリケーション |
| `docs/dotnet-go-sdk-feature-comparison.md` | **導入前必読。**.NETに対するGoの機能ギャップ |
| `provider/` | プロバイダーパッケージ一覧(Foundry以外のオプション確認) |

**トラブルシューティング要約**

| 症状 | 原因 | 対処 |
| --- | --- | --- |
| Azure資格証明認証失敗 | Azure CLI未ログイン、または資格証明ソース未設定 | `az login`を実行、または使用する資格証明を明示的に設定 |
| APIキーエラー | キーが間違っている、または対象リソースと不一致 | キーと該当リソース・プロバイダーの対応を確認 |
| プロバイダーエンドポイントエラー | エンドポイント・デプロイ名・モデル・APIバージョンの欠落または誤記 | サンプルの環境変数とコンストラクタオプションを対照 |

---

### 7.2 LangChain 1.0 — 最も速い経路

```bash
pip install --upgrade langchain
```

```python
from langchain.agents import create_agent
from langchain.tools import tool


@tool
def get_close_price(ticker: str) -> str:
    """指定したティッカーの直近の終値を返す。"""
    # 実際の実装ではデータソースを呼び出す
    return f"{ticker}: 検索結果なし"


agent = create_agent(
    model="openai:gpt-4.1-mini",
    tools=[get_close_price],
    system_prompt=(
        "あなたは市場データ検索のアシスタントです。"
        "ツールが値を返さない場合は「データなし」と答えてください。"
        "絶対に数値を推測して作り出さないでください。"
    ),
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "NVDAの直近の終値を教えて"}]}
)
print(result["messages"][-1].content)
```

システムプロンプトの最後の文は形式的な文言ではない。ツール失敗時にモデルがそれらしい数値を生成することが、エージェントシステムで最も頻繁かつ最も高コストな失敗モードだ。ツール結果が空の場合の挙動を明示しなければ必ず発生する。

---

### 7.3 LangGraph 1.0 — チェックポイント + 人間承認

```bash
pip install --upgrade langgraph langchain
```

```python
from typing import Annotated, TypedDict

from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt, Command


class State(TypedDict):
    messages: Annotated[list, add_messages]
    approval: str


llm = init_chat_model("openai:gpt-4.1-mini")


def analyze(state: State):
    """一次分析の草案を生成"""
    resp = llm.invoke(state["messages"])
    return {"messages": [resp]}


def human_review(state: State):
    """人間の承認を待って実行を中断する"""
    decision = interrupt(
        {
            "question": "この判断を承認しますか?",
            "draft": state["messages"][-1].content,
        }
    )
    return {"approval": decision}


def finalize(state: State):
    if state["approval"] != "approved":
        return {"messages": [{"role": "assistant", "content": "却下されました。再作成が必要です。"}]}
    return {"messages": [{"role": "assistant", "content": "承認されました。デプロイキューに登録しました。"}]}


builder = StateGraph(State)
builder.add_node("analyze", analyze)
builder.add_node("human_review", human_review)
builder.add_node("finalize", finalize)

builder.add_edge(START, "analyze")
builder.add_edge("analyze", "human_review")
builder.add_edge("human_review", "finalize")
builder.add_edge("finalize", END)

# チェックポインターが持続実行の核心。プロダクションではPostgres/Redisチェックポインターを使用
graph = builder.compile(checkpointer=InMemorySaver())

config = {"configurable": {"thread_id": "review-001"}}

# 段階1: interrupt地点で停止する
for event in graph.stream(
    {"messages": [{"role": "user", "content": "今四半期のリスクを要約してください"}]},
    config,
):
    print(event)

# ... ここでプロセスが落ちても問題ない。状態はチェックポインターに残る ...

# 段階2: 数日後に人間が承認したら、その地点から正確に再開
final = graph.invoke(Command(resume="approved"), config)
print(final["messages"][-1].content)
```

**ここで見るべき3つのポイント**

1. `thread_id`が対話・タスクのアイデンティティである。再開はこのキーで行われる。
2. `InMemorySaver`は例示専用である。プロダクションでこれをそのまま使うと、持続性という導入名分そのものが消える。
3. `interrupt`呼び出し部は**再開時にノードの最初から再実行される。**したがってインターラプト以前に副作用(決済、メール送信、注文)を置くと重複実行される。副作用はインターラプト以降のノードに分離する。

---

### 7.4 Goでフレームワークなしに — 構造分析

フレームワーク導入前にこの構造を一度手で書いてみると、フレームワークが何を代わりにしてくれているかが明確になる。以下はベンダーSDKに依存しない概念的な構造を持つ。

```go
// 概念スケッチ: 実際の型は使用するベンダーSDKに合わせて置き換える
func RunAgent(ctx context.Context, c ModelClient, tools map[string]Tool, prompt string) (string, error) {
	msgs := []Message{{Role: "user", Content: prompt}}

	for turn := 0; turn < maxTurns; turn++ {
		resp, err := c.Complete(ctx, msgs, toolSpecs(tools))
		if err != nil {
			return "", err
		}
		msgs = append(msgs, resp.Message)

		if len(resp.ToolCalls) == 0 {
			return resp.Message.Content, nil // 終了条件
		}

		// 同時実行: Goの強みが現れる地点
		results := make([]Message, len(resp.ToolCalls))
		var wg sync.WaitGroup
		for i, call := range resp.ToolCalls {
			wg.Add(1)
			go func(i int, call ToolCall) {
				defer wg.Done()
				out, err := tools[call.Name].Invoke(ctx, call.Args)
				results[i] = toolResultMessage(call.ID, out, err) // エラーもモデルに返す
			}(i, call)
		}
		wg.Wait()
		msgs = append(msgs, results...)
	}
	return "", fmt.Errorf("最大ターン(%d)を超過", maxTurns)
}
```

この約40行に**ないもの**のリストがそのままフレームワークの存在理由である。チェックポインティング、再開、ストリーミング、トークン会計、ツール承認ゲート、OTelスパン、サブエージェントルーティング、コンテキストウィンドウ管理。この中で必要な項目が2〜3個以下なら、直接書く方が大抵は良い。

---

## 8. 運用前チェックリスト — セキュリティ・ガバナンスの観点

エージェントフレームワークは**LLMに実行権限を付与する装置**である。導入前に確認すべき項目を整理した。

| 領域 | 確認事項 | 根拠 |
| --- | --- | --- |
| **サプライチェーン** | フレームワークの推移的依存数と署名検証体系。Goは`go.sum` + GOPROXY透明性ログが防御線 | 2025〜2026年の多数のパッケージ改竄事例 |
| **MCP信頼境界** | MCPサーバーは外部コードである。サーバー一覧・権限をホワイトリストで固定し、プロダクションで動的発見を有効にしないこと | MCPはツール説明自体がプロンプトインジェクションのベクトルになる |
| **ツール承認** | 破壊的作業(ファイル削除、送金、デプロイ)は必ず承認ミドルウェアの後ろに置く。MAFのtool approval、LangChainのHITLミドルウェアを使用 | 自動ツール呼び出しがデフォルトのフレームワークが多い |
| **資格証明** | フォールバック型の資格証明(`DefaultAzureCredential`など)を禁止。管理IDなど明示指定 | Microsoft公式推奨 |
| **データ境界** | サードパーティモデル・エージェント使用時、データが組織のコンプライアンス・地理的境界を超えるか検討。責任は利用者にある | MAF文書に明示 |
| **可観測性** | OTelスパンにプロンプト・応答の原文が載る可能性がある。マスキング方針を先行 | PII・企業秘密流出の経路 |
| **副作用の冪等性** | 再開・リトライ時に重複実行される作業がないか | §7.3参照 |
| **バージョン固定** | プレビュー状態のSDKはコミット単位での固定を推奨 | MAF Goはリリースタグ未発行 |

---

## 9. まとめ

どのソリューションを使うかは以下の観点で選択せよ。

1. **レイヤーを先に決めよ。** 必要なのがツールループ(L1)なのか、グラフ(L2)なのか、耐久性のあるランタイム(L3)なのかを区別すれば、候補は2〜3個に絞られる。大半のチームが実際に望んでいるのはL3であり、これだけは自作すると高コストである。

2. **言語が決定を支配する。** Python・TSならLangGraphが現実的な既定値、.NETならMAFが既定値だ。Goなら選択肢が薄い。MAF Goは方向性は正しいが、2026年7月現在公開プレビューであり、ハンドオフ・宣言的エージェント・RAG・CodeAct・DevUIがなく、コミュニティが非常に小さい。Azureガバナンスが要件でなければ、EinoやADK Go、またはフレームワークなしの実装がより安全な選択かもしれない。

3. **フレームワークは性能ではなく失敗処理を買う。** 導入検討文書に「性能が良くなる」と書かれているなら、その文書は誤りである。正しい文は「失敗が観測可能になり、復旧可能になる」だ。LLMはExcelであってOracleではなく、フレームワークはそのExcelを監査可能なスプレッドシートにする道具である。

MAF Goに対する実務的な推奨は以下の通りである。**今はパイロットと技術検証(PoC)段階に置き、`docs/dotnet-go-sdk-feature-comparison.md`で自分の必須機能が実装されているか先に確認すること。**ハンドオフ・オーケストレーションが要件に含まれている場合、現時点では導入対象ではない。

---

## 付録A. 参考リンク

| 項目 | URL |
| --- | --- |
| Microsoft Agent Framework for Go | https://github.com/microsoft/agent-framework-go |
| .NET–Go機能比較文書 | https://github.com/microsoft/agent-framework-go/blob/main/docs/dotnet-go-sdk-feature-comparison.md |
| Goリファレンス | https://pkg.go.dev/github.com/microsoft/agent-framework-go |
| MAF本流(.NET/Python) | https://github.com/microsoft/agent-framework |
| MS Learn文書 | https://learn.microsoft.com/agent-framework/ |
| Agent Framework開発ブログ | https://devblogs.microsoft.com/agent-framework/ |
| LangChain・LangGraph 1.0発表 | https://blog.langchain.com/langchain-langgraph-1dot0/ |
| LangGraph 1.0チェンジログ | https://changelog.langchain.com/announcements/langgraph-1-0-is-now-generally-available |
| Eino(CloudWeGo) | https://github.com/cloudwego/eino |
| Foundry Build 2026要約 | https://devblogs.microsoft.com/foundry/whats-new-in-microsoft-foundry-build-2026/ |

## 付録B. 用語対照表

| 略語 | 原語 | 意味 |
| --- | --- | --- |
| MAF | Microsoft Agent Framework | Microsoftの多言語エージェントフレームワーク |
| MCP | Model Context Protocol | モデルが外部ツールを発見・呼び出すための標準プロトコル |
| A2A | Agent-to-Agent | ランタイムを跨ぐエージェント間メッセージングプロトコル |
| AG-UI | Agent-GUI protocol | エージェントとユーザーインターフェース間の相互作用プロトコル |
| HITL | Human-in-the-Loop | 実行中に人間の検討・承認を挿入するパターン |
| OTel | OpenTelemetry | 分散トレーシング・メトリクス収集の標準 |
| SK | Semantic Kernel | Microsoftの前世代オーケストレーションSDK |
| GA | General Availability | 正式リリース。プロダクションサポート対象 |

---

*データ基準日: 2026年7月22日。GitHubの指標とフレームワークの機能リストは急速に変化する。引用時は基準日を併記し、導入決定前にリポジトリを直接確認することを推奨する。*

*本稿は技術情報提供の目的であり、特定製品の導入推奨や投資推奨ではない。*
