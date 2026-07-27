
# Solar Open2、DeepSeek V4、KIMI K3 — 比較分析

---

## 1. スペック一覧比較

| 区分 | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| リリース日 | 2026-07-22 | 2026-04-24 | 2026-04-24 | 2026-07-16 (API) |
| 総パラメータ | 250B | 284B | 1.6T | 2.8T |
| 活性パラメータ | 15B | 13B | 49B | 約50〜60B (16/896 experts) |
| コンテキスト | 1M トークン | 1M トークン | 1M トークン | 1M トークン |
| アーキテクチャ | Hybrid-Attention MoE (線形+softmax, NoPE) | CSA+HCA (スパース注意) | CSA+HCA (スパース注意) | KDA + AttnRes + Stable LatentMoE |
| 言語 | 韓・英・日 | 多言語 | 多言語 | 多言語 + ネイティブビジョン |
| ライセンス | Upstage Solar License (Apache 2.0 ベース、帰属表示必要) | MIT (最も自由) | MIT | TBD (オープンウェイト 2026-07-27 予定) |
| セルフホスト HW | 4×H200 (BF16) / 2×H200 (NVFP4) | 2×H200 / 4×A100 80GB | 8×H200 (クラスタ) | 64+ アクセラレータ (スーパーノード)、最小約1.4TB VRAM |
| API 価格 (入/出) | Upstage API | $0.14/$0.28 /M | $0.435/$0.87 /M | $3.00/$15.00 /M |

---

## 2. 主要ベンチマーク比較

### 2-1. 知識・推論

| ベンチマーク | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| MMLU-Pro | 86.2 | 85.9 | 87.5 | — |
| GPQA-Diamond | 86.3 | 88.9 | 90.1 | 93.5 |
| HLE (no tools) | 28.8 | 32.3 | 37.7 | — |
| HMMT2602 | 93.9 | 94.7 | 95.2 | 94.3 |
| AIME2026 | 95.7 | 97.0 | — | — |

### 2-2. コーディング

| ベンチマーク | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| LiveCodeBench | 92.4 | 92.3 | 93.5 | — |
| SWE-Bench Verified | 70.4 | 73.8 | 80.6 | 67.5 (DeepSWE) |
| SWE-Bench Pro | — | 76.2 | 76.2 | 81.2 (FrontierSWE) |
| Terminal-Bench 2.1 | — | — | — | 88.3 |
| Program Bench | — | — | — | 77.8 |

### 2-3. エージェント・ツール利用

| ベンチマーク | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| APEX-Agents | 16.6 (1位) | 13.2 | — | — |
| MCP-Atlas | 58.2 | 58.2 | 73.6 | 76.0 |
| GDPval-AA (Elo) | 1,128 | 1,187 | 1,554 | 1,687 |
| BrowseComp | — | — | 83.4 | 91.2 (1位) |
| Automation Bench | — | — | — | 30.8 (1位) |

### 2-4. 韓国語特化

| ベンチマーク | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| 韓国語ベンチ平均 | 85.4 (1位) | 84.9 | — | — |
| Ko-GDPval | 86.8 (1.6T Pro と同格) | 85.0 | 86.9 | — |
| CLiCK (言語・文化) | 90.7 (1位) | — | — | — |
| KBank-MMLU | 80.8 (1位) | — | — | — |

---

## 3. 各モデルの核心強み

### 3-1. Solar Open2: 韓国語・日本語特化、エージェントワークフロー最適化

- **ハイブリッド注意**: 36 線形 + 12 softmax 層で 1M コンテキストを full softmax 比 1/4 メモリで処理
- **NoPE (位置エンコーディングなし)**: 線形注意の再帰状態がトークン順序を内包エンコードし、長さ外挿限界を除去
- **韓国語トークン効率**: グローバルモデル比 24% 少ないトークン (4.41 bytes/token)
- **MOPD**: 12 ドメイン専門家を 1 モデルに統合
- **エージェント特化**: APEX-Agents 1位、MCP-Atlas で Flash と同点、IFBench 80.0
- **Ko-GDPval 86.8**: 1.6T DeepSeek-V4-Pro とほぼ同格、モデルサイズは 1/6

### 3-2. DeepSeek V4: 最もバランスの取れたオープンソースフロンティア

- **V4-Flash (284B/13B)**: 最高のコスパセルフホスト — 2×H200 で 1M コンテキスト
- **V4-Pro (1.6T/49B)**: オープンソース最強コーディング・数学 — SWE-Bench Verified 80.6%、LiveCodeBench 93.5%
- **MIT ライセンス**: 最も自由な商用利用
- **トークン単位圧縮 + DSA**: V3.2 比 9.5 倍少ないメモリで 1M コンテキスト
- **Huawei Ascend NPU 学習**: 米国チップ依存の低減

### 3-3. KIMI K3: 規模とビジョン、フロントエンドコーディングの頂点

- **2.8T パラメータ**: オープンソース初の 3 兆級 — 896 experts 中 16 活性
- **ネイティブビジョン**: テキスト+画像入力
- **Frontend Code Arena #1**: 1,679 Elo、Claude Fable 5 (1,631) を上回る
- **2.5 倍スケーリング効率**: K2 比同コンピュートで 2.5 倍性能
- **GPU メモリ現実**: MXFP4 で約 1.4〜1.5TB — データセンター級クラスタ必須

---

## 4. ユースケース別推奨

### 4-1. シナリオ 1: 韓国語・日本語企業エージェント (事務・法務・金融)

| | Solar Open2 | DeepSeek V4 | KIMI K3 |
|---|---|---|---|
| 推奨度 | 5/5 | 3/5 | 2/5 |
| 根拠 | Ko-GDPval 86.8、韓国語トークン 24% 削減、韓・英・日公式対応 | 多言語一般性能優秀 | 韓国語特化データなし |

**結論**: 韓国企業が社内文書・法務・金融ワークフローを自動化するなら Solar Open2 が圧倒的。

### 4-2. シナリオ 2: 社内セルフホストコーディングエージェント

| | Solar Open2 | DeepSeek V4-Flash | DeepSeek V4-Pro | KIMI K3 |
|---|---|---|---|---|
| 推奨度 | 3/5 | 4/5 | 5/5 | 2/5 |

**結論**: 8×H200+ なら V4-Pro、コスパ重視なら V4-Flash。

### 4-3. シナリオ 3: フロントエンド・フルスタック開発支援

KIMI K3 が Frontend Code Arena 1位で圧倒的。バックエンド・フルスタックは DeepSeek V4-Pro がバランス良好。

### 4-4. シナリオ 4: 予算型セルフホスト

DeepSeek V4-Flash (INT4) と Solar Open2 (NVFP4) の二強。

### 4-5. シナリオ 5: API ベース本番 (コスト・速度重視)

DeepSeek V4-Flash が圧倒的コスパ。KIMI K3 は約 15〜20 倍高価。

### 4-6. シナリオ 6: 1M コンテキスト深層リサーチ

KIMI K3 が BrowseComp 等で最高。運用コストは DeepSeek V4-Flash または Solar Open2 が実用的。

### 4-7. シナリオ 7: ライセンス・商用自由度最優先

DeepSeek V4 (MIT) が最も自由。

---

## 5. 最終まとめ: 目的別モデル選択

| 利用目的 | 推奨モデル |
|---|---|
| 韓国語・日本語企業エージェント | Solar Open2 |
| コーディングエージェント (最高性能) | DeepSeek V4-Pro |
| コーディングエージェント (コスパセルフホスト) | DeepSeek V4-Flash |
| フロントエンド特化 | KIMI K3 |
| 予算型セルフホスト | DeepSeek V4-Flash (INT4) |
| 最も自由なライセンス | DeepSeek V4 (MIT) |
| API 低コスト本番 | DeepSeek V4-Flash |
| 1M コンテキスト深層リサーチ | KIMI K3 (API) / Solar Open2 (セルフ) |
| データセンター級フルスケール | KIMI K3 / DeepSeek V4-Pro |

---

## 6. 核心インサイト

1. **Solar Open2 は「小さいが強い」特化モデル** — 250B で 1.6T 級韓国語性能、2×H200 量子化、エージェントツール呼び出し 1 位。

2. **DeepSeek V4 は「最も汎用的なオープンソース」** — Flash はコスパセルフホストの標準、Pro は最強コーディング・数学。MIT で商用自由度最高。

3. **KIMI K3 は「規模のフロンティア」** — 2.8T 最大規模、フロントエンド Arena 1 位、ネイティブビジョン。HW 壁と高 API コストはコーディング性能で相殺。
