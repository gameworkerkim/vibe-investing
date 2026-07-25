---
title: "Pyodide 技術ドキュメント(検証・拡張版)"
description: "ブラウザとNode.jsでPythonを実行するWebAssemblyベースのCPythonディストリビューションPyodideについて、事実確認と拡張を加えた技術ガイド。PEP 783、性能、メモリ制限、導入手順を扱う。"
abstract: |
  Pyodideは完全なCPythonインタープリタをWebAssemblyにコンパイルし、サーバーなしでブラウザ内でPythonを直接実行できるようにする。
  本ガイドはバージョン体系、性能、メモリ制限、C拡張サポートに関する広く流布している主張を検証し、
  JS-Python FFI、Web Workerパターン、仮想ファイルシステム、開発ツールエコシステムについても補足する。
  最後に導入手順と、PyScript・MicroPython・Brython・Skulpt・Transcrypt・CPython WASIビルドとの比較を掲載する。
summary_for_ai: |
  本文書は2026-07-19時点のPyodide(最新安定版314.0.x、Python 3.14ベース、MPL-2.0ライセンス)に関する検証・拡張版技術資料である。
  広く繰り返される主張への主な訂正: バージョン体系は現在Pythonバージョンと連動している(0.29.x→314.x)。メモリはwasm32アドレス空間の上限である4GBまで使用可能(旧来の2GB上限ではない)。
  C拡張はPEP 783によるpyemscripten wheelのPyPI配布によりサポートが拡大しており、NumPy・SciPy・cryptographyなど250以上の拡張が既にポーティングされている。
  JS-Python FFI(PyProxy/JsProxy、自動型変換、BigIntラウンドトリップ)、Web Worker実行パターン、Emscripten仮想ファイルシステム(MEMFS/IDBFS)、
  パッケージ読み込みの二系統(loadPackage対micropip)、開発ツールエコシステム(pyodide-build、pytest-pyodide、pyodide-pack)を扱う。
  ブラウザCDNセットアップ、NumPy利用、micropipインストール、JS-Pythonデータ交換、非同期fetch、Web Worker構成、Node.js利用、カスタムwheelビルドの実行可能なコード例を含む。
  最後にPyScript、MicroPython(WASM)、Brython、Skulpt、Transcrypt、CPython WASIビルドとの比較表、選定ガイド、適合・不適合ユースケースをまとめる。
date: 2026-07-19
author: "Dennis Kim"
lang: ja
tags:
  - Python
  - WebAssembly
  - Pyodide
  - ブラウザ
  - データサイエンス
keywords:
  - Pyodide
  - ブラウザ内Python
  - WebAssembly Python
  - PEP 783
  - CPython WASM
  - JupyterLite
featured: false
schema_type: TechArticle
draft: false
---

# Pyodide 技術ドキュメント(検証・拡張版)

- 作成基準日: 2026-07-19
- 最新安定版: Pyodide 314.0.x(Python 3.14ベース)
- ライセンス: MPL-2.0
- 公式サイト: https://pyodide.org

---

## 1. Pyodideとは?

Pyodideは**WebAssembly**と**Emscripten**をベースにCPythonインタープリタを丸ごとコンパイルした**ブラウザおよびNode.js向けPythonディストリビューション**である。サーバーなしでブラウザから直接Pythonコードを実行でき、2018年にMozilla社内プロジェクト(iodide)として始まり、2019年以降は独立したコミュニティプロジェクトとして発展した。

### 検証ノート(2026年7月時点)

| 項目 | 原文の記述 | 検証結果 |
|------|-----------|-----------|
| プロジェクトの起源 | Mozilla、2018年開始 | 正確 |
| バージョン体系 | 言及なし | **変更あり。**2026年6月からPythonバージョン連動体系へ移行(0.29.x→314.x、Python 3.14対応)。メジャーリリースは年1回、Pythonアップストリームと同期 |
| 性能 | ネイティブ比3〜5倍遅い | 概ね正確。純粋なPythonコードでは3〜5倍、WASMコンパイルされたCコードでは2〜2.5倍程度 |
| メモリ制限 | 約2GB | **旧バージョン基準。**現在はwasm32アドレス空間の上限である4GBまで使用可能。2GB以上のアドレス領域に関するバグも最近修正された |
| C拡張パッケージ | ポーティングされなければ使用不可 | **緩和が必要。**PEP 783の採用によりpyemscriptenプラットフォームタグのバイナリwheelをPyPIに正式配布可能。NumPy、SciPy、cryptographyなどC/C++/Rust拡張250以上が既にポーティング済み |
| stdlibバンドル | 言及なし | 314.0からsqlite3、lzmaが標準バンドルに含まれる(unvendoringは中止) |

---

## 2. 主な特徴

| 特徴 | 説明 |
|------|------|
| ブラウザ内Python実行 | サーバーなしでWebブラウザ上でCPython 3.14を実行 |
| JavaScript-Python FFI | 双方向オブジェクト自動変換、エラー伝播、async/await相互サポート |
| 科学計算スタック内蔵 | NumPy、pandas、SciPy、Matplotlib、scikit-learnなどを事前ビルドで提供 |
| micropip | PyPIの純粋なPython wheelおよびpyemscripten wheelをインストール |
| Web APIアクセス | DOM、fetch、Canvasなどブラウザ API全体にアクセス可能 |
| Node.jsサポート | npmパッケージ(`pyodide`)でサーバーサイド・CLI環境で実行 |
| PEP 783標準化 | Emscripten wheelのPyPI正式配布経路を確保(2026年) |

---

## 3. 追加機能(原文未収録項目)

### 3.1 JavaScript ↔ Python FFI詳細

- プロキシベースの相互運用: `PyProxy`(JSからPythonオブジェクトを参照)、`JsProxy`(PythonからJSオブジェクトを参照)
- 自動型変換: JS Array ↔ Python list、JS Map ↔ Python dict、TypedArray ↔ memoryview
- BigIntラウンドトリップ: 314.0から`pyodide.ffi.JsBigInt`導入により2^53を超える整数のJS bigint相互変換をサポート
- 例外の相互伝播: 一方の言語でthrowされた例外を他方でcatchできる

### 3.2 Web Worker実行

メインスレッドのブロッキングを避けるため、PyodideをWeb Worker内で動かすパターンが事実上の標準である。重い計算(pandas処理、モデル推論)をワーカーに分離し、`postMessage`で結果だけをやり取りする。

### 3.3 仮想ファイルシステム(Emscripten FS)

- メモリベースのMEMFSがデフォルトで、IndexedDBベースのIDBFSによりブラウザセッション間で永続化可能
- `pyodide.FS` APIによりJS側からファイルの読み書きを直接制御できる

### 3.4 パッケージ読み込みの二系統

| 方式 | 用途 |
|------|------|
| `pyodide.loadPackage()` | Pyodide CDNに事前ビルドされたパッケージ(NumPyなど)を読み込む |
| `micropip.install()` | PyPIの純粋なPython wheelおよびpyemscripten wheelをインストール |
| `loadPackagesFromImports()` | コードのimport文を解析し必要なパッケージを自動読み込み |

### 3.5 開発ツールエコシステム

| ツール | 機能 |
|------|------|
| pyodide-build | C/Rust拡張パッケージをpyemscripten wheelへクロスビルド |
| pytest-pyodide | Chrome/Firefox/Nodeランタイムでのpyodide向けテストを自動化 |
| pyodide-pack | 配布用バンドルの最小化(未使用モジュールを除去) |
| auditwheel-emscripten | Emscripten wheelの検証ツール |
| Pyodide CLI | ターミナルで`pyodide`コマンドによりvenv類似環境の作成とREPL実行 |

### 3.6 SharedArrayBufferと同期入出力

COOP/COEPヘッダーを設定すると、SharedArrayBufferベースでワーカーとメインスレッド間の同期通信が可能になり、これにより`input()`のような同期式標準入力をエミュレートできる。

---

## 4. 長所

1. **サーバーコスト削減とインフラの単純化** — Python処理をクライアント側で行うため、サーバーは認証やDBなど必須の処理のみを担当する。処理コストがユーザー数に比例して増加しない。
2. **インストール不要、即時実行** — ブラウザだけでPythonを実行。初回読み込み後はオフラインでも動作可能。
3. **JavaScriptとの完全な統合** — 双方向自動変換、例外伝播、async/awaitサポート。
4. **豊富な科学計算エコシステム** — データサイエンスに必須のライブラリを別途セットアップなしで利用できる。
5. **教育・インタラクティブコンテンツに最適** — JupyterLiteなどでサーバーレスノートブック環境を構築。学生のコードがブラウザのサンドボックスに隔離され、サーバー側のセキュリティリスクがない。
6. **(新規)パッケージング標準化** — PEP 783の採用によりパッケージ作者がPyPIに直接Emscripten wheelを配布可能。同一Pythonバージョン内のPyodideリリース間でwheelの互換性が保証される。

---

## 5. 短所

1. **性能低下** — 純粋なPythonコードはネイティブ比約3〜5倍、WASMコンパイルされたCコードは約2〜2.5倍遅い。JITのないインタープリタ実行が根本原因。
2. **メモリ制約** — wasm32アドレス空間の上限により最大約4GB。初期読み込みだけで数百MBを占有するため、低スペック機器での複数タブ利用時に負担となる。(旧バージョンの2GBハードリミットは解消済み)
3. **初期読み込みサイズ** — コアランタイムだけで数MB、NumPy/pandasなどの読み込み時には数十MBのダウンロードが必要。キャッシュ戦略(Service Worker、CDN)が事実上必須。
4. **パッケージカバレッジの限界** — PEP 783により大幅に改善されたが、OS依存機能(マルチプロセッシング、低レベルソケット、同期sleepなど)は依然として制限がある。CPythonの完全な等価実装ではない。
5. **ネットワークリクエストの制限** — ブラウザのCORSポリシーが適用される。`requests`の代わりに`pyodide.http.pyfetch`を使用するか、プロキシで回避する必要がある。
6. **ブラウザ要件** — WebAssemblyをサポートする最新ブラウザが必要。SharedArrayBufferを活用する機能にはさらにCOOP/COEPヘッダーの設定が求められる。

---

## 6. Getting Started

### 6.1 ブラウザ: CDN一行で開始

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/pyodide/v314.0.2/full/pyodide.js"></script>
</head>
<body>
  <script type="module">
    const pyodide = await loadPyodide();
    // 基本実行
    console.log(pyodide.runPython("1 + 2"));  // 3

    // 複数行のPythonコード
    pyodide.runPython(`
      import sys
      print(f"Python {sys.version} in the browser")
    `);
  </script>
</body>
</html>
```

バージョン文字列(`v314.0.2`)は配布時に必ず固定すること。`dev`など非バージョンURLを本番環境で使用してはならない。

### 6.2 事前ビルド済みパッケージの読み込み(NumPy例)

```javascript
await pyodide.loadPackage("numpy");
pyodide.runPython(`
  import numpy as np
  a = np.random.rand(1000, 1000)
  print(a.mean())
`);
```

### 6.3 micropipによるPyPIパッケージのインストール

```javascript
await pyodide.loadPackage("micropip");
const micropip = pyodide.pyimport("micropip");
await micropip.install("cowsay");   // 純粋なPython wheel
pyodide.runPython(`
  import cowsay
  cowsay.cow("Hello from PyPI")
`);
```

### 6.4 JavaScript ↔ Pythonデータ交換

```javascript
// JS → Python
pyodide.globals.set("js_data", [10, 20, 30]);
const result = pyodide.runPython(`
  data = js_data.to_py()      # JsProxy → Python list
  sum(data)
`);
console.log(result);  // 60

// Python → JS
const pyDict = pyodide.runPython(`{"jp": "東京", "kr": "ソウル"}`);
console.log(pyDict.toJs());   // Map(2) { "jp" → "東京", ... }
pyDict.destroy();             // PyProxyメモリの解放(リーク防止)
```

### 6.5 非同期実行とネットワークリクエスト

```javascript
await pyodide.loadPackage("micropip");
const out = await pyodide.runPythonAsync(`
  from pyodide.http import pyfetch
  resp = await pyfetch("https://api.github.com/repos/pyodide/pyodide")
  data = await resp.json()
  data["stargazers_count"]
`);
```

### 6.6 Web Workerパターン(推奨プロダクション構成)

```javascript
// worker.js
importScripts("https://cdn.jsdelivr.net/pyodide/v314.0.2/full/pyodide.js");

let pyodideReady = loadPyodide();

self.onmessage = async (e) => {
  const pyodide = await pyodideReady;
  await pyodide.loadPackagesFromImports(e.data.code);
  const result = await pyodide.runPythonAsync(e.data.code);
  self.postMessage({ result });
};
```

```javascript
// main.js
const worker = new Worker("worker.js");
worker.postMessage({ code: "import numpy as np; float(np.pi)" });
worker.onmessage = (e) => console.log(e.data.result);
```

### 6.7 Node.jsでの利用

```bash
npm install pyodide
```

```javascript
import { loadPyodide } from "pyodide";

const pyodide = await loadPyodide();
console.log(pyodide.runPython("2 ** 10"));  // 1024
```

### 6.8 自作パッケージのビルド(C/Rust拡張)

```bash
pip install pyodide-build
pyodide build            # プロジェクトルートでpyemscripten wheelを生成
```

生成されたwheelはPEP 783標準に従いPyPIへ直接アップロードでき、micropipでインストール可能である。

---

## 7. 競合製品との比較

ブラウザでPythonを実行するアプローチは大きく3系統に分かれる: (A) CPython自体をWASMへポーティング、(B) JavaScriptでPythonインタープリタを再実装、(C) PythonコードをJavaScriptへトランスパイル。

| 製品 | アプローチ | 強み | 弱み | 主な用途 |
|------|-----------|------|------|---------|
| **Pyodide** | (A) CPython → WASM | 完全なCPython互換性、科学計算スタック、PEP 783標準化 | 初期読み込みサイズ、インタープリタ速度 | データサイエンス、汎用 |
| **PyScript** | Pyodide/MicroPython上のフレームワーク | HTMLタグだけでPythonを埋め込める、導入障壁が最も低い | 独自ランタイムではない(内部はPyodideに依存)、抽象化オーバーヘッド | 教育、プロトタイプ、ウィジェット |
| **MicroPython (WASM)** | 軽量Python再実装 → WASM | 読み込みサイズが数百KB規模、起動速度が最速 | 標準ライブラリ・CPython互換性が大幅に縮小、C拡張エコシステムなし | 軽量スクリプティング、組み込みウィジェット |
| **Brython** | (B) JSでインタープリタを再実装 | 読み込みが軽い、`text/python`スクリプトタグによるDOM操作が自然、単純演算はCPython級の速度 | NumPyなどのC拡張が不可、複雑な演算では性能差が大きい | DOM中心のWebスクリプティング |
| **Skulpt** | (B) JSでインタープリタを再実装 | 完全クライアント実行、教育プラットフォーム(Anvilなど)で実績あり | CPython比で数十倍遅い、Python機能のカバレッジが限定的 | 初級教育、チュートリアル |
| **Transcrypt** | (C) Python → JSトランスパイル | 出力が純粋なJSのため読み込み・実行が速い、JSライブラリを直接活用可能 | ランタイムインタープリタではない(動的機能に制約)、ビルド段階が必要 | フロントエンドアプリをPython文法で記述 |
| **CPython WASIビルド** | (A) CPython → WASI | CPython公式アップストリームでサポート(tier 2)、サーバーレス・エッジランタイムに適合 | ブラウザ統合(FFI、DOM)はPyodideより未成熟 | エッジコンピューティング、サンドボックス実行 |

### 派生エコシステム(競合ではなくPyodideベースの製品)

| 製品 | 説明 |
|------|------|
| JupyterLite | サーバーレスなブラウザ内Jupyterノートブック。カーネルにPyodideを使用 |
| stlite | Streamlitアプリをブラウザでサーバーレスに実行 |
| marimo (WASMモード) | リアクティブPythonノートブックのブラウザ実行版 |
| Cloudflare Workers Python | エッジランタイムのPythonサポートにPyodideを活用 |

### 選定ガイド

| 要件 | 推奨 |
|----------|------|
| NumPy/pandasなど科学計算スタックが必要 | Pyodide |
| HTMLだけで手早くPythonを埋め込みたい | PyScript |
| 読み込みサイズが最優先(数百KB) | MicroPython(WASM)またはBrython |
| DOM操作中心の軽量スクリプティング | Brython |
| 初級プログラミング教育プラットフォーム | SkulptまたはPyScript |
| ビルド成果物をJSとして配布 | Transcrypt |
| サーバーレス・エッジサンドボックス実行 | CPython WASIまたはPyodide(Node) |

---

## 8. 活用例のまとめ

| 適している場合 | 適していない場合 |
|------------|--------------|
| 教育用インタラクティブコンテンツ | 大規模データ処理(数GB以上) |
| プロトタイピングおよびデモ | リアルタイム低遅延が必須のアプリケーション |
| 科学計算の可視化、ブラウザ内分析ツール | 複雑なネットワーク・ソケット処理 |
| サーバーレスPythonアプリケーション | マルチプロセッシングなどOS依存ワークロード |
| 機密データのクライアント内処理(データがブラウザを離れない) | 全てのPyPIパッケージが必要な場合 |

---

## 9. 結論

Pyodideは「サーバーなしでPythonをウェブ上で実行する」という可能性を開いたプロジェクトから、2026年のPEP 783採用とPythonバージョン連動のリリース体系導入によって**ブラウザPythonの事実上の標準プラットフォーム**として位置づけられるようになった。性能(ネイティブ比3〜5倍の低下)と初期読み込みサイズという構造的な限界は依然として残るため、計算集約型ワークロードよりも教育・可視化・クライアントサイドデータ処理・サーバーレスツールへの適用が合理的である。軽量性が最優先ならMicroPython/Brython系を、完全なCPythonエコシステムが必要ならPyodideを選ぶのが基本原則である。
