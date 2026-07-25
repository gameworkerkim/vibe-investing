---
title: "MCP 2026-07-28 仕様移行: セキュリティ視点の変更点と移行ガイド"
subtitle: "ステートレス化・OAuth 2.1認可標準化・Extension Frameworkがセキュリティ責任を開発者と運用者に移す理由"
description: "MCP 2026-07-28仕様をセキュリティ視点で解説する。ステートレスプロトコルへの移行、OAuth 2.1に基づく認可の必須化、Extension Frameworkの正式導入、そして実務的な移行チェックリストとツールを紹介する。"
abstract: |
  2026年7月28日、Model Context Protocol(MCP)はリリース以来最大のアーキテクチャ変更を含む新仕様へ移行する。
  柱は3つ。プロトコルのステートレス化(セッション概念の廃止、リクエストの自己完結化)、OAuth 2.1に基づく認可の標準化(RFC 9728/8707/9207)、そしてCoreからRoots/Sampling/Loggingを分離するExtension Frameworkの正式導入である。
  本質はセキュリティ責任の移転にある。プロトコル層(セッション、ハンドシェイク)が暗黙的に提供していた状態管理と信頼境界が失われ、その責任が開発者とプラットフォーム運用者の明示的な設計に移る。
  本書ではBreaking Changes、各変更が生む新たな脅威面、そして本番システム向けの段階的移行計画を、2つのオープンソース移行ツール(mcp-herald、mcp-auth-adapter)とともに解説する。
summary_for_ai: |
  本書はMCP(Model Context Protocol)2026-07-28仕様のセキュリティ視点の移行ガイドであり、MCPサーバー/クライアント開発者、プラットフォーム運用者、セキュリティ担当者を対象とする。
  基準となる移行: MCP 2025-11-25 → MCP 2026-07-28。最終仕様の発表は2026-07-28、その後12ヶ月のレガシーサポート(廃止予定)期間が設けられる。
  主な変更点: (1) ステートレス化 — `initialize`ハンドシェイクと`Mcp-Session-Id`ヘッダーを廃止し、`_meta`を含む自己完結型リクエストと`server/discover`メソッドに置き換え。(2) OAuth 2.1認可標準化 — RFC 9728(Protected Resource Metadata)、RFC 8707(Resource Indicators)、RFC 9207(Issuer検証)、Client ID Metadata Documents(CIMD)。(3) Extension Framework — Roots/Sampling/LoggingをCoreからExtensionへ分離(非推奨化)、初の公式ExtensionであるMCP Apps、長時間実行タスク用のTasks Extension。
  ステートレス化が生む新たな脅威ベクトルには、予測可能なリソースハンドルによる状態/ハンドルの乗っ取り、クライアントに返却されたstate objectの改ざん、`Mcp-Method`/`Mcp-Name`ヘッダーと本文の不一致を利用した攻撃が含まれる。
  本書はBreaking Changes一覧、TypeScriptによる移行前後のコード例、本番移行チェックリスト、そして12ヶ月の移行期間内で推奨される5段階のロールアウト計画(診断、プロトコル移行、認可標準化、検証、並行運用)を提示する。
date: 2026-07-19
author: "Dennis Kim"
lang: ja
tags:
  - MCP
  - Model Context Protocol
  - セキュリティ
  - OAuth 2.1
  - APIセキュリティ
  - 移行
keywords:
  - MCP 2026-07-28仕様
  - Model Context Protocolセキュリティ
  - MCPステートレス移行
  - OAuth 2.1 MCP認可
  - MCP Extension Framework
  - MCP Breaking Changes
group: llm-agents
featured: false
schema_type: TechArticle
draft: false
---

# MCP 2026-07-28 仕様移行: セキュリティ視点の変更点と移行ガイド

| 項目 | 内容 |
|------|------|
| 文書の目的 | MCP 2026-07-28仕様のセキュリティ視点の変更点の紹介と移行案内 |
| 対象読者 | MCPサーバー/クライアント開発者、プラットフォーム運用者、セキュリティ担当者 |
| 基準仕様 | MCP 2025-11-25 → MCP 2026-07-28 |
| 主な日程 | 2026-07-28に最終仕様を発表、その後12ヶ月間のレガシーサポート(廃止予定ウィンドウ) |
| 作成日 | 2026-07-19 |

---

## 1. 概要

2026年7月28日、MCP(Model Context Protocol)はリリース以来最大規模のアーキテクチャ変更を含む新仕様へ移行する。今回の改訂の核心は3点である。

1. **プロトコルのステートレス化** — セッション概念を廃止し、リクエストの自己完結性を確保
2. **OAuth 2.1に基づく認可(Authorization)の標準化** — 実装者の裁量だった認可を標準として強制
3. **Extension Frameworkの正式導入** — Roots/Sampling/LoggingをCoreから分離、監査・同意・承認機能の標準化

この変化の本質は**セキュリティ責任の移転**である。従来はプロトコル層(セッション、ハンドシェイク)が暗黙的に提供していた状態管理と信頼境界が失われ、その責任が開発者とプラットフォーム運用者の明示的な設計に移る。ステートレス構造は拡張性とロードバランシングの観点で大きな利点があるが、クライアントが渡す状態情報を検証なしに信頼すると新たな攻撃面が開く。

---

## 2. セキュリティ視点の主な変更点

### 2.1 ステートレス構造への移行

`initialize`ハンドシェイクと`Mcp-Session-Id`ヘッダーが廃止され、すべてのリクエストが自己完結型構造に変わる。プロトコルバージョン・クライアント情報・能力(capabilities)は各リクエストの`_meta`オブジェクトに含まれ、サーバー能力の照会は`server/discover`メソッドが代替する。

**変更前(2025-11-25)** — セッション確立後`Mcp-Session-Id`で状態を維持:

```http
POST /mcp HTTP/1.1
Mcp-Session-Id: 1868a90c-3a3f-4f5b
Content-Type: application/json

{"jsonrpc":"2.0","id":2,"method":"tools/call",
 "params":{"name":"search","arguments":{"q":"otters"}}}
```

**変更後(2026-07-28)** — リクエスト自体に全コンテキストを含む:

```http
POST /mcp HTTP/1.1
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: search
Content-Type: application/json

{"jsonrpc":"2.0","id":1,"method":"tools/call",
 "params":{"name":"search","arguments":{"q":"otters"},
 "_meta":{"io.modelcontextprotocol/clientInfo":{"name":"my-app","version":"1.0"}}}}
```

**セキュリティ上の意味**

| 脅威 | 説明 | 対策 |
|------|------|------|
| 状態のハイジャック | クライアントが渡すリソースハンドル(例: `basket_id`)をサーバーが無条件に信頼すると、予測可能なIDによって他ユーザーのワークフローを乗っ取られる恐れがある | ハンドルに十分なエントロピーを持たせ、所有権(ownership)を検証する |
| State Objectの改ざん | クライアントへ返却し後で受け取り直すstate objectの整合性を検証しないと、権限昇格が可能になる | 署名(HMACなど)またはサーバー側保存+参照方式を適用する |
| ヘッダー/本文の不一致 | `Mcp-Method`/`Mcp-Name`ヘッダーとJSON-RPC本文が異なると、プロキシ・WAF回避ベクトルが生まれる | ヘッダーと本文の一致をサーバー側で必ず検証する |

### 2.2 OAuthに基づく認可の標準化

これまで実装者の裁量だった認可がOAuth 2.1標準として強制される。中核となる構成要素は次の4つである。

| 構成要素 | 標準 | 内容 | 防御する攻撃 |
|-----------|------|------|---------------|
| Protected Resource Metadata | RFC 9728 | `/.well-known/oauth-protected-resource`でAuthorization Server情報を公開 | 誤ったASへの接続、構成ミス |
| Resource Indicators | RFC 8707 | トークン要求時に`resource`パラメータで対象リソースサーバーを明示、サーバーは自分向けに発行されたトークンかを検証 | トークンの誤用(Token Passthrough)、Confused Deputy |
| Client ID Metadata Documents (CIMD) | - | サーバーごとのDCR反復登録を標準文書ベースの構成に置き換え | 登録の乱用、クライアント識別の混乱 |
| Issuer検証 | RFC 9207 | トークン発行後、`iss`パラメータで実際に要求したASが発行したかを検証することを義務化 | OAuth Mix-up Attack |

Protected Resource Metadataの構成例:

```json
{
  "authorization_servers": ["https://auth.example.com"],
  "resource": "https://mcp.example.com"
}
```

Resource Indicatorを含むトークン要求:

```http
POST /token HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=...&
resource=https://mcp.example.com
```

### 2.3 Extension Frameworkの導入

監査ログ(Audit Logging)、ユーザー同意(Consent)、承認(Approval)などのセキュリティ運用機能が公式Extensionとして標準化された。

- **Roots、Sampling、Logging**: CoreからExtensionに分離、公式に非推奨化
- **MCP Apps**: 初の公式ExtensionとしてサーバーレンダリングUIをサポート
- **Tasks Extension**: 長時間実行(long-running)タスクを標準化

セキュリティ観点では、これは監査・同意・承認フローが各実装の独自設計ではなく標準インターフェースに収束することを意味する。コンプライアンスと監査可能性(auditability)の確保にはプラスだが、従来のCore機能(特にSampling)に依存していたコードは必ずExtension名前空間方式へ移行する必要がある。

---

## 3. Breaking Changes 要約

| 変更項目 | 従来(2025-11-25) | 新規(2026-07-28) |
|-----------|-------------------|-------------------|
| セッション | `initialize`ハンドシェイク + `Mcp-Session-Id` | 廃止、ステートレス化 |
| エラーコード | `-32002`(Resource not found) | `-32602`(JSON-RPC標準) |
| 能力検出 | ハンドシェイク時に交換 | `server/discover`メソッド |
| HTTPヘッダー | `Mcp-Session-Id` | `Mcp-Method`、`Mcp-Name`が必須 |
| SSE | Server-Sent Eventsストリームを維持 | Multi Round-Trip Requests(MRTR)で代替 |
| 認可 | 実装依存 | OAuth 2.1標準化 |
| Roots/Sampling/Logging | Core機能 | Extensionへ分離(非推奨) |
| キャッシュ | 個別実装が必要 | `ttlMs`、`cacheScope`フィールドを提供 |

---

## 4. 移行ガイド

### 4.1 セッション状態の除去

| 従来の方法 | 新しい方法 |
|-----------|---------|
| `initialize`ハンドシェイク | `server/discover`メソッドで能力を照会 |
| `Mcp-Session-Id`ヘッダー | `_meta`オブジェクトにクライアント情報を含める |
| セッションベースの状態保存 | 明示的なリソースハンドル(例: `basket_id`)で状態を伝達 |
| Sticky Sessionが必要 | Round-robinロードバランシングが可能 |

```typescript
// 従来: セッションベースの状態管理
class SessionManager {
  private sessions: Map<string, SessionState>;

  async handleRequest(sessionId: string, request: Request) {
    const session = this.sessions.get(sessionId);
    // セッション状態に依存
  }
}

// 新規: 明示的なハンドルベース
class StatelessHandler {
  async handleRequest(request: Request) {
    // 必要な情報はすべてリクエストに含まれる
    const { basketId, clientInfo } = request.params._meta;
    // basketIdを明示的なパラメータとして受け取り処理する
    // 注意: basketIdの所有権と整合性の検証が必須
  }
}
```

### 4.2 認可(Authorization)の移行

| 従来の方法 | 新しい方法 |
|-----------|---------|
| 独自実装の認可 | OAuth 2.1標準への準拠 |
| 個別設定が必要 | `.well-known/oauth-protected-resource`による自動検出 |
| トークンスコープ未指定 | Resource Indicators(RFC 8707)でスコープを指定 |
| DCRベースのクライアント登録 | CIMDベースの構成へ移行 |
| Issuer検証を省略可能 | Issuer検証の義務化(RFC 9207) |

実装チェックリスト:

1. `.well-known/oauth-protected-resource`エンドポイントを構成する(RFC 9728)
2. OAuth 2.1準拠の認可フローを実装する(PKCE必須)
3. Resource Indicatorsを適用する(RFC 8707)
4. Issuer(`iss`)パラメータの検証ロジックを追加する(RFC 9207)
5. CIMDベースのクライアント構成へ移行する

### 4.3 Extensionへの移行

```typescript
// 従来: Coreに依存していたSampling
server.setCapabilities({
  sampling: { /* ... */ }
});

// 新規: Extensionに分離された機能を使用
server.setCapabilities({
  extensions: {
    "io.modelcontextprotocol/sampling": { /* ... */ },
    "io.modelcontextprotocol/logging": { /* ... */ }
  }
});
```

### 4.4 本番移行チェックリスト

- [ ] **セッション状態の除去**: `Mcp-Session-Id`ベースの状態保存ロジックを明示的なリソースハンドル構造へ移行
- [ ] **エラーコードの修正**: `-32002` → `-32602`へ変更
- [ ] **OAuth構成**: `.well-known/oauth-protected-resource`エンドポイントを構成する(RFC 9728)
- [ ] **Resource Indicators**: RFC 8707の適用状況を確認
- [ ] **CIMD移行**: DCRベース構成からCIMDベース構成への計画を立てる
- [ ] **Extension確認**: Roots、Sampling、LoggingのCore分離が反映されているか確認
- [ ] **ステートレステスト**: ロードバランサー配下の複数インスタンス環境でステートレス動作を検証
- [ ] **ヘッダー検証**: `Mcp-Method`、`Mcp-Name`ヘッダーと本文内容の一致検証ロジックを追加
- [ ] **`_meta`オブジェクト検証**: クライアントが渡す`_meta`オブジェクトの整合性検証ロジックを実装
- [ ] **トークン検証**: Issuer(`iss`)パラメータの検証ロジックを追加(RFC 9207)

---

## 5. 移行ツール

| ツール | 用途 | リンク |
|------|------|------|
| mcp-herald | MCP 2026-07-28仕様向けの静的移行リンター。ソースコードをスキャンしてBreaking Changeのシグネチャを検出し、修正方法を案内する | https://github.com/studiomeyer-io/mcp-herald |
| mcp-auth-adapter | OAuth 2.0/OIDC IdPの前段でMCP認可仕様に必要な機能(RFC 9728/8707/9207)を提供するアダプター | https://github.com/velias/mcp-auth-adapter |

推奨する活用順序: (1) mcp-heraldでコードベース全体をスキャンしBreaking Changeを一覧化する、(2) セッション・エラーコード・Extensionなどプロトコル層を修正する、(3) mcp-auth-adapterで認可層を標準化する、(4) ステートレス環境(複数インスタンス+ロードバランサー)で統合テストを行う。

---

## 6. 結論と提言

2026-07-28 MCP仕様の核心は、ステートレスアーキテクチャへの移行、OAuth 2.1に基づく認可の標準化、Extension Frameworkの導入である。プロトコルが暗黙的に提供していた信頼境界が失われ、セキュリティ責任が開発者とプラットフォーム運用者に移転したことで、各実装のセキュリティ設計の質がシステム全体のセキュリティレベルを決定するようになった。

12ヶ月の廃止予定期間(Deprecation Window)が設けられているため、次のような段階的アプローチを推奨する。

| 段階 | 期間(推奨) | 作業 |
|------|-----------|------|
| 1. 診断 | 1ヶ月 | mcp-heraldスキャン、Breaking Changeの影響度評価 |
| 2. プロトコル移行 | 2-3ヶ月 | セッション除去、ヘッダー/エラーコード修正、Extension移行 |
| 3. 認可標準化 | 2-3ヶ月 | OAuth 2.1フローの実装、RFC 9728/8707/9207の適用 |
| 4. 検証 | 1-2ヶ月 | ステートレス負荷テスト、侵入テスト、ヘッダー/本文不一致とハンドル改ざんシナリオの検証 |
| 5. 並行運用 | 残り期間 | 新旧仕様の並行サポート後にレガシーを終了 |

特に、ステートレス化への移行過程でクライアントが提供するデータ(リソースハンドル、state object、`_meta`)に対する検証ロジックが欠落すると、セッション時代には存在しなかったハイジャック・権限奪取ベクトルが生まれる点を、移行の全過程で念頭に置く必要がある。
