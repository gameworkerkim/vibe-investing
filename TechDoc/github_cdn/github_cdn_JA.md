---
title: "GitHubリポジトリとjsDelivr CDNを活用したJSONファイルホスティングガイド"
description: "GitHubの公開リポジトリとjsDelivr CDNを連携させて、JSONファイルを無料でホスティングし世界中に高速配信する方法の手順ガイド"
lang: ja
featured: false
schema_type: TechArticle
---

# GitHubリポジトリとjsDelivr CDNを活用したJSONファイルホスティングガイド

GitHubの公開リポジトリとjsDelivr CDNを連携させると、JSONファイルを無料でホスティングし、世界中に高速に配信できます。

このガイドは初心者でも簡単に実践できるよう、ステップごとの手順とともに制限事項や運用時の注意点をまとめています。


# 目次

1. GitHubリポジトリの作成
2. JSONファイルのアップロード
3. jsDelivr CDNアドレスの生成
4. CDNアドレスの利用と確認
5. 重要な参考事項
6. 参考資料



# ステップ1: GitHubリポジトリの作成

## リポジトリ作成手順

1. GitHubにログイン
2. 右上の「+」ボタンをクリック
3. 「New repository」を選択
4. リポジトリ名を入力

例:

text my-json-data

5. リポジトリを公開設定にする

text Public

> jsDelivrは公開リポジトリのみをサポートします。

6. 「Add a README file」にチェック
7. 「Create repository」をクリック



# ステップ2: JSONファイルのアップロード

作成されたリポジトリで:

1. 「Add file」
2. 「Upload files」
3. JSONファイルをアップロード
4. 「Commit changes」をクリック

例の構造:

text my-json-data/ ├── README.md └── data.json



# ステップ3: jsDelivr CDNアドレスの生成

## 基本URL形式

text https://cdn.jsdelivr.net/gh/ユーザー名/リポジトリ名/ファイルパス

### 例

| 項目 | 値 |
|--------|--------|
| ユーザー名 | honggildong |
| リポジトリ名 | my-json-data |
| ファイル名 | data.json |

生成されたURL:

text https://cdn.jsdelivr.net/gh/honggildong/my-json-data/data.json



## URL構造の説明

text https://cdn.jsdelivr.net/gh/user/repo@version/file

| 項目 | 説明 |
|--------|--------|
| user | GitHubのユーザー名または組織名 |
| repo | リポジトリ名 |
| version | ブランチ、タグ、コミットハッシュ |
| file | ファイルパス |

例:

text https://cdn.jsdelivr.net/gh/honggildong/my-json-data@v1.0.0/data.json



# ステップ4: CDNアドレスの利用と確認

## Webブラウザで確認

生成されたURLをブラウザのアドレスバーに入力します。

text https://cdn.jsdelivr.net/gh/honggildong/my-json-data/data.json

JSONの内容が表示されれば成功です。



## JavaScriptで使用

html <script> fetch('https://cdn.jsdelivr.net/gh/honggildong/my-json-data/data.json')   .then(response => response.json())   .then(data => console.log(data))   .catch(error => console.error(error)); </script>



## cURLでのテスト

bash curl https://cdn.jsdelivr.net/gh/honggildong/my-json-data/data.json



# 重要な参考事項

## 1. キャッシュの問題とバージョン管理

jsDelivrはCDNキャッシュを積極的に使用します。

### 一般的なキャッシュ方針

| 方式 | キャッシュ期間 |
|--------|--------|
| ブランチ参照 | 約12時間 |
| @latest | 最大7日 |

そのため、ファイルを修正しても即時に反映されない場合があります。



## 推奨方法: Gitタグの使用

### リリースの作成

1. リポジトリへ移動
2. 「Releases」
3. 「Draft a new release」
4. バージョンを入力

例:

text v1.0.0 v1.0.1 v1.1.0

5. 「Publish release」



### バージョン固定URLの使用

text https://cdn.jsdelivr.net/gh/ユーザー名/リポジトリ名@v1.0.0/data.json



### タグURLのキャッシュ方針

- 最大1年間キャッシュ
- S3に永久保存

本番サービスではタグURLの使用を推奨します。



## 2. GitHubリポジトリのサイズ制限

| 項目 | 制限 |
|--------|--------|
| 推奨リポジトリサイズ | 1GB未満 |
| GitHubの警告 | 1GB超過時 |
| 単一ファイル制限 | 100MB |
| 非公式な最大サイズ | 約5GB |



## GitHub Packagesのデータ転送量

Freeプラン基準:

text 月1GB



## 3. jsDelivr帯域幅の制限

### 長所

jsDelivr自体は

- 帯域幅制限なし
- 無料利用
- グローバルCDN



### 参考

GitHub Pagesには別途の制限が存在

text 月100GB



## 4. jsDelivrの利用制限

| 項目 | 制限 |
|--------|--------|
| パッケージサイズ | 150MB |
| 単一ファイル | 20MB |
| HTMLファイル | text/plainとして提供 |



### サポート対象外のケース

text Packages larger than 150 MB Single files larger than 20 MB



## 5. キャッシュパージ (Purge)

緊急にキャッシュを更新する必要がある場合に使用します。

### cURLの例

bash curl https://purge.jsdelivr.net/gh/ユーザー名/リポジトリ名@バージョン/ファイルパス

例:

bash curl https://purge.jsdelivr.net/gh/honggildong/my-json-data@v1.0.0/data.json



### Webインターフェース

jsDelivr公式のPurge Toolを使用

text https://www.jsdelivr.com/tools/purge



# 参考資料

| 資料 | 説明 |
|--------|--------|
| jsDelivr公式ホームページ | CDNサービス |
| jsDelivr GitHubリポジトリ | ソースコード |
| jsDelivr Purge Tool | キャッシュ削除 |
| GitHubリポジトリ制限ドキュメント | リポジトリ容量ポリシー |
| GitHub Billing Docs | データ転送ポリシー |
| jsDelivr GitHub Delivery Docs | URL構造とキャッシュ方針 |



# 運用チェックリスト

- [ ] GitHub公開リポジトリの作成
- [ ] JSONファイルのアップロード
- [ ] jsDelivr URLの生成
- [ ] ブラウザテストの完了
- [ ] JavaScript fetchテストの完了
- [ ] Gitリリースタグの作成
- [ ] バージョンURLの適用
- [ ] キャッシュ方針の確認
- [ ] データ転送量のモニタリング

---

# 注意事項

この方法は以下の用途に適しています。

- 個人プロジェクト
- 開発およびテスト
- 小規模サービス
- 設定ファイル(JSON)の配布
- 静的データの提供

以下の環境では別途のCDNまたはオブジェクトストレージの使用を推奨します。

- 大規模商用サービス
- 金融システム
- ミッションクリティカルサービス
- リアルタイム大容量データサービス

GitHubリポジトリを単純なファイルストレージとして過度に使用する場合、GitHub利用規約に抵触する可能性があるため注意が必要です。



## 結論

GitHub + jsDelivrの組み合わせは、無料でありながら非常に強力な静的JSON配信方法です。

特に:

- API設定ファイル
- LLMプロンプトデータ
- 株式/暗号資産のメタデータ
- バージョン管理が必要な静的データ

の配信に非常に適しており、Gitタグベースのバージョン管理を併用すれば、安定した本番運用も可能です。
