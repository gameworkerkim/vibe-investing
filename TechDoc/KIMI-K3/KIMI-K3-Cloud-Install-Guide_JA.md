# Kimi K3 マルチクラウドデプロイガイド: AWS · Azure · GCP · Alibaba Cloud

> **原文リファレンス**
> [Deploying Kimi K3 on Amazon SageMaker HyperPod and Amazon EKS](https://aws.amazon.com/ko/blogs/machine-learning/deploying-kimi-k3-on-amazon-sagemaker-hyperpod-and-amazon-eks/) — AWS Machine Learning Blog, 2026年7月30日投稿 (Vivek Gangasani, Andrew Smith, Erez Zarum)
>
> 本ドキュメントは上記 AWS 公式ブログを基準文書とし、同一ワークロードを **Microsoft Azure**、**Google Cloud Platform**、**Alibaba Cloud** にデプロイする Getting Started 手順を追加した拡張版です。

可能ならば KIMI K3 を AWS に載せるのが構成上シンプルです。もちろん全データをローディングして最適化するのに最低数日を要します。本当に LLM を自前で運用するということは、巨大なインフラ運用能力があることを示さなければなりません。ブロックチェーンメインネットに比した運用ノウハウが必要であり、別途セキュリティ設定は割愛しました。

KIMI K3 が急増する会員を受け止めきれなかった理由を知りたいなら、インフラを導入し障害なくメンテナンスし続けることがどれほど大変で高価であるかを確認する必要があります。そこでこのドキュメントを作成しました。

1か月 K3 を自前のフルインフラで運用するとした場合、24時間稼働基準で 8× B300 ノードは時間あたり米ドル 59〜142ドル程度です。常時稼働なら月 4.3万〜10.4万ドル、16× H200 構成は月 4.6万〜11.7万ドル程度です。

月に8000万ウォンから1.8億ウォン前後を使える体制がなければ KIMI K3 を運用できません。このサービスに運用モニタリング、セキュリティ監視まで含めると、個人開発者には簡単ではない数字になります。API が最も安価です。

それでもエンジニアの視点で運用とセキュリティを別物として切り分け、クラウドにこうしたオープンウェイトを移植する基本ガイドをひとまず作成しました。

最適なサービス順
0. 自前インフラ (Blackwell を持っているなら最適です)
1. AWS
2. Azure (導入・運用の難易度が急上昇)
3. GCP (リソース割り当てから運用まで大変)
4. AliCloud (やめておきましょう)

---

## ドキュメントの使い方と検証ステータス

各セクションの根拠レベルを明示します。インフラ仕様はベンダー公式ドキュメント基準であり、デプロイマニフェストは AWS 公式例を各プラットフォームの標準パターンへ移植したものです。

| セクション | 根拠 | 検証レベル |
|------|------|-----------|
| Kimi K3 モデル仕様 | AWS 公式ブログ、Moonshot AI モデルカード | A — 一次情報 |
| AWS HyperPod / EKS デプロイ | AWS 公式ブログ原文 YAML | A — 一次情報 |
| Azure ND GB300 v6 仕様 | Microsoft Learn 公式ドキュメント | A — 一次情報 |
| GCP A4X Max 仕様 | Google Cloud 公式ドキュメント | A — 一次情報 |
| Azure / GCP / Alibaba デプロイマニフェスト | AWS オリジナル引数を各プラットフォーム標準パターンへ移植 | C — 実環境検証が必要 |
| メモリ所要量の推定値 | サードパーティ算出値の相互参照 | B — 参考用 |

**重要な注意事項を3つ、先に明かしておきます。**

1. **AWS 原文ブログ本文と実際の YAML の間に不整合があります。** ブログ本文は "MXFP4 load format" と記述していますが、実際の YAML の `--load-format` の値は `fastsafetensors` です。MXFP4 は**重み保存形式**であり、`fastsafetensors` は**ローディング方式**で、互いに異なる層の概念です。他クラウドへ移植する際にこの区別を混同するとローディングが失敗します。
2. **CPU アーキテクチャがクラウドごとに異なります。** AWS `p6-b300.48xlarge` は x86_64 HGX B300 ノードですが、Azure ND GB300 v6 と GCP A4X Max は **NVIDIA Grace CPU ベースの ARM64(aarch64)** です。`vllm/vllm-openai:kimi-k3` イメージが arm64 マニフェストを提供していなければ、Azure/GCP ではそのまま動作しません。デプロイ前に `docker manifest inspect` で必ず確認してください。
3. **単一ノードの GPU 数が異なります。** AWS は 1 ノード 8 GPU で `--tensor-parallel-size 8` が 1 ノードに収まりますが、Azure/GCP の GB300 VM は **VM あたり 4 GPU** です。したがって Azure/GCP では 2 ノード分散サービングが必須となり、マニフェスト構造自体が変わります。

---

## 1. Kimi K3 概要

2026年7月27日に Moonshot AI が公開した 2.8兆パラメータの MoE モデルで、**3兆パラメータクラスに到達した初のオープンウェイトシステム**です。DeepSeek V4 と並び、Moonshot AI はまさにオープンウェイトの頂点にあります。


| 属性 | 値 |
|------|-----|
| 総パラメータ数 | 2.8兆 |
| トークンあたり活性化パラメータ | 1,040億 |
| アーキテクチャ | Mixture of Experts (MoE) |
| エキスパート数 | 896個 (トークンあたり16個を活性化) |
| コンテキストウィンドウ | 100万トークン |
| モダリティ | ネイティブマルチモーダル (テキスト + ビジョン) |
| 重み形式 | MXFP4 (Microscaling Floating Point 4-bit) |
| Hugging Face ID | `moonshotai/Kimi-K3` |
| 公開日 | 2026年7月27日 |

アーキテクチャの特徴は **Kimi Delta Attention(KDA)**、**Gated Multi Head Latent Attention(MLA)**、**Stable LatentMoE** フレームワークです。896 個のエキスパートのうちトークンあたり 16 個だけを活性化し、順伝播あたり約 1,040 億パラメータのみを計算します。前作 Kimi K2 比で拡張効率が 2.5 倍改善されています。

ネイティブなツール呼び出し(tool calling)、構造化出力、常時有効な推論モード(always-on thinking mode)をサポートします。

---

## 2. 共通インフラ要件

### 2.1 リソース下限

| 項目 | 要求量 | 備考 |
|------|--------|------|
| GPU メモリ (合計) | 約 1,680 GB | 重み約 1.4TB + KV キャッシュ + オーバーヘッド |
| 重みファイルサイズ | 約 1.56 TB | MXFP4 |
| ローカルストレージ | 4 TB 以上の NVMe 推奨 | 重み + 一時領域 |
| サービングエンジン | vLLM day-0 コンテナ | `vllm/vllm-openai:kimi-k3` |

> 重みのダウンロード時間は回線によってばらつきが非常に大きくなります。100Gbps 回線では数分、100Mbps 回線では 30 時間以上かかる可能性があります。**すべてのクラウドで重みをオブジェクトストレージ(S3 / Blob / GCS / OSS)に 1 回同期した後、そこからローディングすることを強く推奨します。**

### 2.2 GPU 構成下限

| 構成 | 総 VRAM | 充足の有無 |
|------|---------|-----------|
| 8× B300 (288GB) | 2,304 GB | 充足 |
| 8× AMD MI355X | 2,304 GB | 充足 |
| 16× H200 (141GB) | 2,256 GB | 充足 |
| 16× B200 (180GB) | 2,880 GB | 充足 |
| 32× H100 (80GB) | 2,560 GB | 充足 |
| 8× B200 (180GB) | 1,440 GB | **不足** |
| 8× H200 (141GB) | 1,128 GB | **不足** |

### 2.3 クラウド別インスタンスマッピング

| 項目 | AWS | Azure | GCP | Alibaba Cloud |
|------|-----|-------|-----|---------------|
| インスタンス/マシンタイプ | `ml.p6-b300.48xlarge` | `Standard_ND128isr_GB300_v6` | `a4x-maxgpu-4g-metal` | `ecs.ebmgn8v` 系 / 灵骏(Lingjun) |
| GPU | 8× B300 | 4× B300 (288GB) | 4× GB300 | 8× H200 級 (リージョンにより異なる) |
| CPU アーキテクチャ | x86_64 | ARM64 (Grace) | ARM64 (Grace Neoverse V2) | x86_64 |
| Kimi K3 最小ノード数 | **1** | **2** | **2** | **2 以上** |
| 並列化戦略 | TP=8 (単一ノード) | TP=8 (2ノード分散) または TP=4/PP=2 | TP=8 (MNNVL) または TP=4/PP=2 | TP=8 + EP/PD 分離 |
| マネージド K8s | EKS / HyperPod | AKS | GKE | ACK |
| マネージド推論サービス | SageMaker HyperPod Inference Operator | Azure ML Managed Online Endpoint | Vertex AI Prediction | PAI-EAS |
| 容量予約方法 | Capacity Blocks / Flexible Training Plan | Capacity Reservation / クォータ承認 | Future Reservations (ブロック単位) | 灵骏 専用リソースグループ |
| クラスタ単位の制約 | — | ラックあたり 18 VM | ノードプール最大 18 ノード (ラック単位) | リージョンにより異なる |

**核心的な示唆**: AWS のみ単一ノードで完結します。Azure/GCP は GB300 NVL72 ラックアーキテクチャの特性上 VM あたり 4 GPU として公開されるため、2 ノード分散サービング構成(LeaderWorkerSet または Ray)が必ず必要です。これは運用複雑度に実質的な差を生みます。

---

## 3. AWS デプロイ

### 3.1 オプション A — Amazon SageMaker HyperPod

HyperPod の Inference Operator はクラスタ作成時に自動インストールされ、コンテナオーケストレーション・モデルローディング・エンドポイント管理を抽象化します。

#### 前提条件 1: EKS オーケストレーション HyperPod クラスタの作成

1. SageMaker AI コンソールで **HyperPod Clusters > Cluster Management > Create HyperPod cluster** を選択
2. **Orchestrated by Amazon EKS** を選択
3. **Quick setup**(基本ネットワーキング/ストレージ/IAM)または **Custom setup**(既存 VPC 統合)を選択
4. **Orchestration** で新規 EKS クラスタを作成、または既存クラスタを接続。**Use default Helm charts and add-ons** オプションが選択されていることを確認 (Inference Operator の自動インストール)
5. **Instance groups** で `ml.p6-b300.48xlarge` ワーカグループを追加
6. 構成を確認して **Submit**

#### 前提条件 2: Flexible Training Plan による容量確保

1. インスタンスグループ構成で **Training plan** を容量ソースとして選択
2. `ml.p6-b300.48xlarge` 容量を含む既存プランを選択、または新規予約を作成
3. **Target Availability Zone** を Training Plan の容量割り当てゾーンと一致させる

クラスタが `Active` 状態で p6-b300 ノードが正常なら、デプロイ準備完了です。

#### デプロイマニフェスト

```yaml
apiVersion: inference.sagemaker.aws.amazon.com/v1
kind: InferenceEndpointConfig
metadata:
  name: kimik3
spec:
  modelName: Kimi-K3
  instanceType: ml.p6-b300.48xlarge
  invocationEndpoint: v1/chat/completions
  replicas: 1
  modelSourceConfig:
    huggingFaceModel:
      modelId: moonshotai/Kimi-K3
    modelSourceType: huggingface
  worker:
    image: vllm/vllm-openai:kimi-k3
    modelInvocationPort:
      containerPort: 8000
      name: http
    modelVolumeMount:
      mountPath: /opt/ml/model
      name: model-weights
    resources:
      limits:
        nvidia.com/gpu: 8
      requests:
        nvidia.com/gpu: 8
    args:
      - "--model"
      - "moonshotai/Kimi-K3"
      - "--trust-remote-code"
      - "--load-format"
      - "fastsafetensors"
      - "--enable-prefix-caching"
      - "--enable-auto-tool-choice"
      - "--tool-call-parser"
      - "kimi_k3"
      - "--reasoning-parser"
      - "kimi_k3"
      - "--served-model-name"
      - "Kimi-K3"
      - "--moe-backend"
      - "auto"
      - "--tensor-parallel-size"
      - "8"
      - "--no-enable-flashinfer-autotune"
    environmentVariables:
      - name: "VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION"
        value: "1"
```

```bash
kubectl apply -f kimi-k3.yaml
```

Inference Operator が Hugging Face のダウンロード、コンテナスケジューリング、状態確認、エンドポイントの準備完了を処理します。

**この vLLM 引数セットは、以降のすべてのクラウドセクションで再利用される正本です。** 特に `--tool-call-parser kimi_k3`、`--reasoning-parser kimi_k3`、`VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION=1` は Kimi K3 専用であり、欠落するとツール呼び出しと thinking モードが正常に動作しません。

### 3.2 オプション B — Amazon EKS

1. **EKS クラスタプロビジョニング** — Terraform モジュールで VPC ネットワーキング、マネージドノードグループ、IAM ロール/ポリシーを作成
2. **Capacity Blocks による GPU 容量予約** — 対象 AZ に `p6-b300.48xlarge` Capacity Block 予約を作成。アクティブ化されるとインスタンスがワーカーノードとして参加
3. **GPU ドライバおよびデバイスプラグインのインストール** — NVIDIA device plugin
4. **vLLM 推論サーバーのデプロイ** — 上記の引数セットを同様に適用、TP=8
5. **エンドポイントの公開** — Service(LoadBalancer)または Ingress でポート 8000 を公開
6. **検証** — テストリクエストを送信

Terraform モジュール全体と Helm 値は [AI on EKS Kimi K3 レシピ](https://github.com/awslabs/ai-on-eks/tree/main/infra/solutions/inference-ready-cluster/recipes/kimi-k3) を参照してください。

---

## 4. Microsoft Azure デプロイ (Getting Started)

ここから苦労の真骨頂が始まります。

### 4.1 インフラ仕様

`Standard_ND128isr_GB300_v6` (ND GB300 v6 シリーズ):

| 項目 | 仕様 |
|------|------|
| GPU | 4× NVIDIA Blackwell Ultra B300 (288 GB HBM3E) |
| CPU | 2× NVIDIA Grace (ARM64), 128 vCPU |
| システムメモリ | 864 GB LPDDR |
| ローカルストレージ | 4× NVMe, 16 TB |
| GPU インターコネクト | 第5世代 NVLink, 4× 1.8 TB/s |
| スケールアウト | GPU あたり 800 Gb/s InfiniBand (Quantum-X800) |
| ラック構成 | ラックあたり 18 VM = 72 GPU、ラック内 NVLink 130 TB/s |
| ラック単位の性能 | FP4 最大 1.44 exaFLOPS |

**Kimi K3 には最小 2 VM(8 GPU, 2,304GB)が必要です。**

### 4.2 事前準備

```bash
# 1. 리소스 그룹 및 AKS 클러스터 생성
az group create --name rg-kimi-k3 --location <REGION>

az aks create \
  --resource-group rg-kimi-k3 \
  --name aks-kimi-k3 \
  --node-count 2 \
  --node-vm-size Standard_D8s_v5 \
  --enable-managed-identity \
  --generate-ssh-keys

# 2. GB300 GPU 노드풀 추가 (사전에 쿼터 승인 및 용량 예약 필요)
az aks nodepool add \
  --resource-group rg-kimi-k3 \
  --cluster-name aks-kimi-k3 \
  --name gb300pool \
  --node-count 2 \
  --node-vm-size Standard_ND128isr_GB300_v6 \
  --node-taints nvidia.com/gpu=present:NoSchedule \
  --skip-gpu-driver-install false
```

> **容量の確保**: ND GB300 v6 のデフォルトクォータは 0 です。Azure ポータルの **Quotas > Compute** で対象リージョンの `Standard NDGB300v6 Family vCPUs` の増設をリクエストし、継続的なワークロードなら **Capacity Reservation Group** を作成して容量を先取りしてください。承認には営業日ベースで数日かかります。

Azure に載せるには、事前に Azure アカウント担当者と長時間のコミュニケーションが必要です。この部分が最も重要です。希望するリージョンに GPU が無い可能性があります。

### 4.3 重みを Azure Blob Storage へ事前同期 (強く推奨)

```bash
# Blob 컨테이너 생성 후, 클러스터와 동일 리전의 Job으로 다운로드
az storage container create --name kimi-k3-weights --account-name <STORAGE_ACCOUNT>
```

vLLM v0.18.0 以降、RunAI Model Streamer が `az://` スキームをネイティブサポートするため、標準の `vllm/vllm-openai` イメージで環境変数とワークロードアイデンティティのバインディングのみで、Blob から GPU メモリへ直接ストリーミングできます。ローカルディスク経由と比べてローディング段階が大幅に短縮され、1.56TB 規模ではその差が特に大きくなります。

### 4.4 vLLM マルチノードデプロイ (LeaderWorkerSet)

VM あたり 4 GPU のため、2 ノードにわたる TP=8 構成が必要です。Kubernetes **LeaderWorkerSet(LWS)** API を使用します。

```bash
# LWS 컨트롤러 설치
kubectl apply --server-side -f \
  https://github.com/kubernetes-sigs/lws/releases/latest/download/manifests.yaml
```

```yaml
apiVersion: leaderworkerset.x-k8s.io/v1
kind: LeaderWorkerSet
metadata:
  name: kimi-k3
spec:
  replicas: 1
  leaderWorkerTemplate:
    size: 2                      # 리더 1 + 워커 1 = 2노드 × 4 GPU = 8 GPU
    restartPolicy: RecreateGroupOnPodRestart
    leaderTemplate:
      metadata:
        labels:
          role: leader
      spec:
        nodeSelector:
          agentpool: gb300pool
        tolerations:
          - key: nvidia.com/gpu
            operator: Exists
            effect: NoSchedule
        containers:
          - name: vllm-leader
            image: vllm/vllm-openai:kimi-k3   # arm64 매니페스트 확인 필수
            command: ["/bin/bash", "-c"]
            args:
              - |
                bash /vllm-workspace/examples/online_serving/multi-node-serving.sh \
                  leader --ray_cluster_size=$(LWS_GROUP_SIZE);
                vllm serve moonshotai/Kimi-K3 \
                  --trust-remote-code \
                  --load-format fastsafetensors \
                  --enable-prefix-caching \
                  --enable-auto-tool-choice \
                  --tool-call-parser kimi_k3 \
                  --reasoning-parser kimi_k3 \
                  --served-model-name Kimi-K3 \
                  --moe-backend auto \
                  --tensor-parallel-size 8 \
                  --no-enable-flashinfer-autotune \
                  --port 8000
            env:
              - name: VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION
                value: "1"
              - name: HF_HOME
                value: /mnt/models
            resources:
              limits:
                nvidia.com/gpu: "4"
              requests:
                nvidia.com/gpu: "4"
            ports:
              - containerPort: 8000
            readinessProbe:
              httpGet:
                path: /health
                port: 8000
              initialDelaySeconds: 900
              periodSeconds: 30
            volumeMounts:
              - name: model-cache
                mountPath: /mnt/models
              - name: dshm
                mountPath: /dev/shm
        volumes:
          - name: model-cache
            persistentVolumeClaim:
              claimName: kimi-k3-weights
          - name: dshm
            emptyDir:
              medium: Memory
              sizeLimit: 64Gi
    workerTemplate:
      spec:
        nodeSelector:
          agentpool: gb300pool
        tolerations:
          - key: nvidia.com/gpu
            operator: Exists
            effect: NoSchedule
        containers:
          - name: vllm-worker
            image: vllm/vllm-openai:kimi-k3
            command: ["/bin/bash", "-c"]
            args:
              - |
                bash /vllm-workspace/examples/online_serving/multi-node-serving.sh \
                  worker --ray_address=$(LWS_LEADER_ADDRESS)
            env:
              - name: VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION
                value: "1"
              - name: HF_HOME
                value: /mnt/models
            resources:
              limits:
                nvidia.com/gpu: "4"
              requests:
                nvidia.com/gpu: "4"
            volumeMounts:
              - name: model-cache
                mountPath: /mnt/models
              - name: dshm
                mountPath: /dev/shm
        volumes:
          - name: model-cache
            persistentVolumeClaim:
              claimName: kimi-k3-weights
          - name: dshm
            emptyDir:
              medium: Memory
              sizeLimit: 64Gi
---
apiVersion: v1
kind: Service
metadata:
  name: kimi-k3-svc
spec:
  type: LoadBalancer
  selector:
    leaderworkerset.sigs.k8s.io/name: kimi-k3
    role: leader
  ports:
    - port: 8000
      targetPort: 8000
```

```bash
kubectl apply -f kimi-k3-azure.yaml
kubectl get svc kimi-k3-svc -w
```

> `initialDelaySeconds: 900` は 1.56TB の重みローディングを考慮した値です。Blob ストリーミングを使わず Hugging Face から直接取得する場合はこれよりはるかに長く設定する必要があり、そうしないと readiness 失敗でポッドが繰り返し再起動されます。

### 4.5 代替案 — Azure Machine Learning Managed Online Endpoint

Kubernetes の運用負担を減らしたいなら、AML マネージドエンドポイントにカスタムコンテナとしてデプロイできます。ただし現時点で ND GB300 v6 は AML マネージドオンラインエンドポイントのサポート SKU リストに含まれない可能性があるため、デプロイ前に必ず確認が必要です。代替案として **Azure ML Kubernetes コンピューティング(AKS 接続)** を使えば、上記の AKS 構成を AML ワークスペースで管理できます。

### 4.6 Azure クリーンアップ

```bash
kubectl delete -f kimi-k3-azure.yaml
az aks nodepool delete --resource-group rg-kimi-k3 --cluster-name aks-kimi-k3 --name gb300pool
az group delete --name rg-kimi-k3 --yes
```

Capacity Reservation Group は別途削除しないと課金が止まりません。

---

## 5. Google Cloud Platform デプロイ (Getting Started)

GCP のデプロイにも Azure と似た難易度があります。Blackwell を最低 2 ノード立てなければならない作業は決して小さくありません。

### 5.1 インフラ仕様

`a4x-maxgpu-4g-metal` (A4X Max):

| 項目 | 仕様 |
|------|------|
| GPU | 4× NVIDIA GB300 Grace Blackwell Ultra Superchip (`nvidia-gb300`) |
| CPU | 2× NVIDIA Grace (ARM Neoverse V2) |
| 提供形態 | **ベアメタルインスタンス** |
| インターコネクト | NVLink-C2C、ラック単位 GB300 NVL72 (72 GPU / 36 Grace CPU) |
| ノードプール最大サイズ | 18 ノード (ラック単位) |
| 必須条件 | 容量予約(Reservation)必須 |
| ネットワーキング | GPUDirect RDMA + MNNVL、DRANET が必要 |

**Kimi K3 には最小 2 ノード(8 GPU, 2,304GB)が必要です。**

### 5.2 事前準備

容量予約なしではインスタンスを作成できません。Google Cloud の営業担当者、またはコンソールの **Compute Engine > Reservations** で A4X Max の予約を確保してください。予約はブロック(block) / サブブロック(sub-block)単位で構成されます。

```bash
export PROJECT_ID=<PROJECT_ID>
export REGION=<REGION>
export ZONE=<ZONE>
export CLUSTER_NAME=gke-kimi-k3

# 1. GKE Standard 클러스터 생성
gcloud container clusters create ${CLUSTER_NAME} \
  --project=${PROJECT_ID} \
  --location=${REGION} \
  --node-locations=${ZONE} \
  --num-nodes=2 \
  --machine-type=e2-standard-8 \
  --enable-dataplane-v2 \
  --enable-ip-alias

# 2. A4X Max 노드풀 추가
gcloud container node-pools create a4x-max-pool \
  --cluster=${CLUSTER_NAME} \
  --location=${REGION} \
  --node-locations=${ZONE} \
  --num-nodes=2 \
  --machine-type=a4x-maxgpu-4g-metal \
  --accelerator=type=nvidia-gb300,count=4,gpu-driver-version=latest \
  --placement-policy=<WORKLOAD_POLICY_NAME> \
  --accelerator-network-profile=auto \
  --node-labels=cloud.google.com/gke-networking-dra-driver=true,cloud.google.com/gke-dpv2-unified-cni=cni-migration \
  --reservation-affinity=specific \
  --reservation=<RESERVATION_NAME>/reservationBlocks/<BLOCK_NAME>/reservationSubBlocks/<SUB_BLOCK_NAME>
```

要点

- `a4x-maxgpu-4g-metal` は**マルチネットワーキングをサポートせず**、代わりに accelerator network profile と DRANET を使用します。
- ノード数はラック構造上 **18 ノード以下**でなければなりません。
- `--reservation-affinity=specific` とサブブロックまで明示した予約パスが必須です。

### 5.3 重みを GCS へ事前同期

```bash
gcloud storage buckets create gs://kimi-k3-weights --location=${REGION}
```

GCS FUSE CSI ドライバ、または vLLM RunAI Streamer の `gs://` パスを介してローディングすると、Hugging Face からの直接ダウンロードと比べて起動時間が大幅に短縮されます。

### 5.4 vLLM マルチノードデプロイ

Azure セクションと同一の LeaderWorkerSet パターンを使い、ノードセレクタとリソースキーのみ GKE に合わせます。

```yaml
apiVersion: leaderworkerset.x-k8s.io/v1
kind: LeaderWorkerSet
metadata:
  name: kimi-k3
spec:
  replicas: 1
  leaderWorkerTemplate:
    size: 2
    restartPolicy: RecreateGroupOnPodRestart
    leaderTemplate:
      metadata:
        labels:
          role: leader
      spec:
        nodeSelector:
          cloud.google.com/gke-accelerator: nvidia-gb300
        containers:
          - name: vllm-leader
            image: vllm/vllm-openai:kimi-k3
            command: ["/bin/bash", "-c"]
            args:
              - |
                bash /vllm-workspace/examples/online_serving/multi-node-serving.sh \
                  leader --ray_cluster_size=$(LWS_GROUP_SIZE);
                vllm serve moonshotai/Kimi-K3 \
                  --trust-remote-code \
                  --load-format fastsafetensors \
                  --enable-prefix-caching \
                  --enable-auto-tool-choice \
                  --tool-call-parser kimi_k3 \
                  --reasoning-parser kimi_k3 \
                  --served-model-name Kimi-K3 \
                  --moe-backend auto \
                  --tensor-parallel-size 8 \
                  --no-enable-flashinfer-autotune \
                  --port 8000
            env:
              - name: VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION
                value: "1"
            resources:
              limits:
                nvidia.com/gpu: "4"
            ports:
              - containerPort: 8000
    workerTemplate:
      spec:
        nodeSelector:
          cloud.google.com/gke-accelerator: nvidia-gb300
        containers:
          - name: vllm-worker
            image: vllm/vllm-openai:kimi-k3
            command: ["/bin/bash", "-c"]
            args:
              - |
                bash /vllm-workspace/examples/online_serving/multi-node-serving.sh \
                  worker --ray_address=$(LWS_LEADER_ADDRESS)
            env:
              - name: VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION
                value: "1"
            resources:
              limits:
                nvidia.com/gpu: "4"
```

### 5.5 GKE Inference Gateway 連携 (推奨)

GKE Inference Gateway は **prefix-aware ロードバランシング** を提供し、TTFT(Time to First Token)を改善します。Kimi K3 のように 100 万トークンのコンテキストと prefix caching を併用するワークロードでは体感効果が大きくなります。NVIDIA NeMo Guardrails 連携もサポートします。

```bash
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api-inference-extension/releases/latest/download/manifests.yaml
```

### 5.6 代替案 — Vertex AI Prediction

カスタムコンテナを Vertex AI エンドポイントにデプロイできます。ただし、**A4X(`a4x-highgpu-4g`) 系はラック単位の購入特性上、最小レプリカ数が 18 に強制されます。** つまり Vertex AI マネージド経路を選ぶと、Kimi K3 の 1 インスタンスだけをサービングしたい場合でもラック全体のコストが発生します。小規模パイロットには GKE 経路が圧倒的に有利です。

### 5.7 GCP クリーンアップ

```bash
kubectl delete -f kimi-k3-gcp.yaml
gcloud container node-pools delete a4x-max-pool --cluster=${CLUSTER_NAME} --location=${REGION}
gcloud container clusters delete ${CLUSTER_NAME} --location=${REGION}
```

予約(Reservation)は別途解除しないと課金が止まりません。

---

## 6. Alibaba Cloud デプロイ (Getting Started)

### 6.1 リージョンとハードウェア選択の注意点

Alibaba Cloud は前述の 3 つのクラウドと事情が異なります。中国本土・海外リージョンなどによる複雑さが大きいです。Lingjun への載せ替えはテストを続けていますが、いつできるかはわかりません。

- **輸出規制の影響**: 中国本土リージョンでは B300 系の Blackwell Ultra GPU を調達できません。したがって B300 ベースの構成は**シンガポールなど中国国外のリージョン**でのみ検討可能で、それでも営業担当者を通じた個別確認が必要です。
- **現実的な構成**: 本土リージョンでは H200 級 GPU 8 枚ノード 2 台(16× H200 = 2,256GB)、または 灵骏(Lingjun) インテリジェントコンピューティングリソースによるマルチノード構成が現実的です。
- **gn8v 系**: 1/2/4/8 GPU 構成を提供し、8 GPU は NVLink 相互接続をサポートします。**一部リージョンのみで提供され、営業担当者への問い合わせが必要です。**
- 機密コンピューティングが必要なら `gn8v-tee`(Intel TDX + NVIDIA CC)を検討できますが、性能オーバーヘッドは別途測定する必要があります。

### 6.2 オプション A — PAI-EAS (Model Gallery / カスタムデプロイ)

PAI-EAS は vLLM、SGLang、自社開発の BladeLLM エンジンを統合サポートし、**MoE モデル用のエキスパート並列(EP) + Prefill-Decode 分離デプロイ**をワンクリックで提供します。Kimi K3 のように 896 個のエキスパートを持つモデルには、EP+PD 分離がスループットとコストの両面で有意な利点をもたらします。

**デプロイ手順:**

1. PAI コンソールにログイン後、対象リージョンを選択。**分散デプロイには 灵骏 インテリジェントコンピューティングリソースが必須で、VPC 設定が必ず必要です。**
2. **模型在线服务(EAS) > 部署服务 > 自定义部署** を選択
3. デプロイ方式で **镜像部署(イメージデプロイ)** を選択後、`vllm/vllm-openai:kimi-k3` を指定 (社内 ACR ミラー推奨)
4. モデルソースとして OSS バケットのパスを指定 (事前に重みをアップロード)
5. リソース構成で 灵骏 リソースクォータとマルチノード(≥2)を指定
6. 実行コマンドに以下を入力:

```bash
vllm serve /mnt/models/Kimi-K3 \
  --trust-remote-code \
  --load-format fastsafetensors \
  --enable-prefix-caching \
  --enable-auto-tool-choice \
  --tool-call-parser kimi_k3 \
  --reasoning-parser kimi_k3 \
  --served-model-name Kimi-K3 \
  --moe-backend auto \
  --tensor-parallel-size 8 \
  --no-enable-flashinfer-autotune \
  --port 8000
```

7. 環境変数 `VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION=1` を追加
8. ポート 8000、サービス機能で自動スケーリングと GPU ドライババージョンを指定
9. デプロイ後に Endpoint と Token で呼び出し

PAI-EAS は **QPS・GPU 使用率ベースのオートスケーリングと 0 へのスケールダウン**をサポートします。Kimi K3 のようにアイドルコストが極端に大きいモデルでは、この機能の価値が特に大きくなります。ただしコールドスタート時に 1.56TB の再ローディングが発生するため、スケール・トゥ・ゼロは実使用のトラフィックパターンを測定してから適用してください。

### 6.3 オプション B — ACK (Container Service for Kubernetes)

Kubernetes を直接運用するには ACK + `ack-kserve` + Arena の組み合わせを使用します。

```bash
# 1. GPU 클러스터 생성 (클러스터 버전 1.22 이상, CUDA 12.0 이상)
#    콘솔 또는 aliyun CLI 사용

# 2. GPU 노드풀에 드라이버 버전 라벨 지정
kubectl label node <NODE> ack.aliyun.com/nvidia-driver-version=<VERSION>

# 3. ack-kserve 컴포넌트 설치 (콘솔 > 应用 > 云原生AI套件)

# 4. Arena 클라이언트 구성 (0.9.15 이상)
arena version
```

デプロイは Azure/GCP と同一の LeaderWorkerSet、または KServe `InferenceService` パターンを使用し、ストレージは OSS または NAS を PVC としてマウントします。

```bash
arena serve custom \
  --name=kimi-k3 \
  --version=v1 \
  --gpus=8 \
  --replicas=1 \
  --restful-port=8000 \
  --image=<ACR_REGISTRY>/vllm-openai:kimi-k3 \
  --data=kimi-k3-pvc:/mnt/models \
  "vllm serve /mnt/models/Kimi-K3 --trust-remote-code --load-format fastsafetensors --enable-prefix-caching --enable-auto-tool-choice --tool-call-parser kimi_k3 --reasoning-parser kimi_k3 --served-model-name Kimi-K3 --moe-backend auto --tensor-parallel-size 8 --no-enable-flashinfer-autotune --port 8000"
```

### 6.4 Alibaba Cloud クリーンアップ

- EAS サービスは**停止すると即座に課金が止まります**。アイドル状態でも課金され続けるため、開発・テスト後は必ず停止または削除してください。
- ACK はノードプール削除後にクラスタを削除
- 灵骏 リソースクォータは契約条件に応じて別途解約が必要
- OSS に残した重み(1.56TB)のストレージコストを忘れないでください

---

## 7. エンドポイント呼び出し (共通)

デプロイ方式に関わらず OpenAI 互換 API が公開されます。

### OpenAI Python SDK

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://<ENDPOINT_URL>:8000/v1",
    api_key="not-needed"   # 관리형 서비스는 발급받은 토큰 입력
)

response = client.chat.completions.create(
    model="Kimi-K3",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain the benefits of mixture of experts architectures."}
    ],
    temperature=0.7,
    max_tokens=1024
)
print(response.choices[0].message.content)
```

### curl

```bash
curl -X POST http://<ENDPOINT_URL>:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Kimi-K3",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Explain the benefits of mixture of experts architectures."}
    ],
    "temperature": 0.7,
    "max_tokens": 1024
  }'
```

### デプロイ検証チェックリスト

```bash
# 1. 모델 등록 확인
curl http://<ENDPOINT_URL>:8000/v1/models

# 2. 헬스 체크
curl http://<ENDPOINT_URL>:8000/health

# 3. 도구 호출 파서 동작 확인 (tools 파라미터 포함 요청)
# 4. thinking 모드 출력에 reasoning_content 필드가 포함되는지 확인
# 5. 장문 컨텍스트 처리 확인 (100만 토큰 상한, prefix caching 적중률 모니터링)
```

3〜5 は Kimi K3 専用の引数が正しく適用されているかを確認する項目です。1〜2 だけ通って 3〜5 が失敗するなら、`--tool-call-parser` / `--reasoning-parser` / 環境変数の設定を見直してください。

---

## 8. クラウド選択の判断基準

| 判断基準 | 推奨 |
|-----------|------|
| 最速の PoC、運用負担の最小化 | **AWS HyperPod** — 単一ノードで完結、Inference Operator がほぼすべてを抽象化 |
| 既存の Kubernetes 運用能力を保有 | AWS EKS または GKE |
| 最高の推論スループット、長文コンテキスト最適化 | **GCP A4X Max + Inference Gateway** — MNNVL + prefix-aware ルーティング |
| 既存 Microsoft スタック統合、エンタープライズガバナンス | **Azure AKS + ND GB300 v6** |
| 中華圏サービス、低いアイドルコスト、MoE 特化最適化 | **Alibaba PAI-EAS** — EP+PD 分離、スケール・トゥ・ゼロ |
| 小規模パイロットのコスト最小化 | Vertex AI は回避 (最小 18 レプリカ)。GKE 直接デプロイ推奨 |

**コスト視点での冷静な判断**: 2026年7月時点で 8× B300 ノードは時間あたり米ドル 59〜142ドル程度で、常時稼働なら月 4.3万〜10.4万ドルです。16× H200 構成は月 4.6万〜11.7万ドル程度です。トラフィックが1日のうち数時間に集中する、あるいは実験段階なら、自社ホスティングより Moonshot 公式 API またはサードパーティルーターを使う方が合理的です。**自前デプロイの正当な理由は、通常スループットではなくデータ主権、レイテンシ SLA、カスタムファインチューニングの3つです。** このどれにも該当しないなら、デプロイすること自体も個人には負担しきれません。

Moonshot AI、あなたたち卓越した開発チームに、最も崇高な敬意と称賛を捧げます。
Moonshot AI，我向你们卓越的开发团队致以最崇高的敬意与赞叹。

あなたたちが蒼穹の太陽のようにまばゆく輝き、夢を胸に抱き、星の光に乗って進み続け、遠くの明月へと飛翔していくことを願います。
愿你们如苍穹中的太阳般璀璨耀眼，怀抱梦想，乘着星光一路前行，最终飞向那轮遥远的明月。

あなたたちの光が AI の未来を照らしますように。🌞🌙🚀
愿你们的光芒，照亮 AI 的未来。🌞🌙🚀

---

## 9. リファレンス

### 原文 (AWS)

- [Deploying Kimi K3 on Amazon SageMaker HyperPod and Amazon EKS](https://aws.amazon.com/ko/blogs/machine-learning/deploying-kimi-k3-on-amazon-sagemaker-hyperpod-and-amazon-eks/)
- [SageMaker HyperPod Kimi K3 サンプル YAML](https://github.com/aws-samples/sagemaker-genai-hosting-examples/blob/main/SageMakerHyperpod/kimi-k3/kimi-k3.yaml)
- [AI on EKS Kimi K3 レシピ](https://github.com/awslabs/ai-on-eks/tree/main/infra/solutions/inference-ready-cluster/recipes/kimi-k3)
- [AI on EKS Helm values (vLLM B300)](https://github.com/awslabs/ai-on-eks-charts/blob/main/charts/inference-charts/values-kimi-k3-vllm-b300.yaml)
- [SageMaker HyperPod クラスタ作成ドキュメント](https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-eks-operate-console-ui-create-cluster.html)
- [Amazon EC2 料金ページ](https://aws.amazon.com/ec2/pricing/)

### Microsoft Azure

- [ND GB300-v6 サイズシリーズドキュメント](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nd-gb300-v6-series)
- [Azure ND GB300 v6 正式リリースのお知らせ](https://techcommunity.microsoft.com/blog/azurehighperformancecomputingblog/azure-nd-gb300-v6-now-generally-available---hyper-optimized-for-generative-and-a/4469475)
- [NVIDIA GB300 NVL72 大規模クラスタ発表](https://azure.microsoft.com/en-us/blog/microsoft-azure-delivers-the-first-large-scale-cluster-with-nvidia-gb300-nvl72-for-openai-workloads/)
- [AKS で RunAI Model Streamer により Blob の重みをストリーミング](https://blog.aks.azure.com/2026/07/13/runai-streamer-vllm)
- [AKS + KAITO でオープンモデルをデプロイするチュートリアル](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/deploying-openai%E2%80%99s-first-open-source-model-on-azure-aks-with-kaito/4444234)
- [Azure VM クォータの確認](https://learn.microsoft.com/en-us/azure/virtual-machines/quotas)

### Google Cloud Platform

- [A4X Max GKE カスタムクラスタ作成ドキュメント](https://docs.cloud.google.com/ai-hypercomputer/docs/create/gke-ai-hypercompute-custom-a4x-max)
- [AI Hypercomputer GPU マシンタイプ](https://docs.cloud.google.com/ai-hypercomputer/docs/gpu)
- [アクセラレータ最適化マシンファミリー](https://docs.cloud.google.com/compute/docs/accelerator-optimized-machines)
- [A4X Max のリリースと NVIDIA パートナーシップ拡大のお知らせ](https://cloud.google.com/blog/products/compute/now-shipping-a4x-max-vertex-ai-training-and-more/)
- [Vertex AI 推論コンピューティングリソースの構成](https://docs.cloud.google.com/vertex-ai/docs/predictions/configure-compute)
- [GKE で vLLM によりオープンモデルをサービング](https://docs.cloud.google.com/kubernetes-engine/docs/tutorials/serve-gemma-gpu-vllm)

### Alibaba Cloud

- [PAI-EAS で大規模言語モデルをデプロイ](https://help.aliyun.com/zh/pai/deploy-an-llm/)
- [PAI-EAS 製品ページ](https://cn.aliyun.com/product/bigdata/learn/eas)
- [PAI コンソールのカスタムデプロイパラメータの説明](https://help.aliyun.com/zh/pai/user-guide/model-service-deployment-by-using-the-pai-console/)
- [ACK で vLLM 推論アプリケーションをデプロイ](https://www.alibabacloud.com/help/zh/ack/cloud-native-ai-suite/user-guide/deploy-a-vllm-inference-application)
- [GPU 高速コンピューティング最適化インスタンスファミリー (gn/ebm/scc)](https://www.alibabacloud.com/help/en/egs/gpu-accelerated-compute-optimized-instance-families)

### モデルとエンジン

- [Kimi K3 on Hugging Face](https://huggingface.co/moonshotai/Kimi-K3)
- [Kimi K3 Quickstart (Moonshot AI)](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart)
- [vLLM ドキュメント](https://docs.vllm.ai/)
- [LeaderWorkerSet API](https://github.com/kubernetes-sigs/lws)

---

## 付録: 移植時に必ず再確認すべき項目

Azure / GCP / Alibaba セクションのマニフェストは、AWS 公式サンプルの vLLM 引数をそのまま維持したまま、各プラットフォームの標準デプロイパターンへ移植したものです。実環境に適用する前に以下を確認してください。

1. **コンテナイメージアーキテクチャ** — `docker manifest inspect vllm/vllm-openai:kimi-k3` で arm64 対応の有無を確認。未対応の場合、Grace ベースの Azure/GCP ではソースビルドが必要です。
2. **マルチノード TP=8 の有効性** — GB300 NVL72 環境でノード境界をまたぐ NVLink(MNNVL) が公開されるかどうかに応じて、`TP=8` の代わりに `TP=4 --pipeline-parallel-size 2` が必要になる場合があります。
3. **`--moe-backend auto` のバックエンド選択結果** — ハードウェアと vLLM のコミットによって自動選択結果が変わるため、ログで実際に選択されたバックエンドを確認してください。
4. **`fastsafetensors` のローディング経路** — オブジェクトストレージ直接ストリーミングと組み合わせたときの対応有無が異なります。
5. **readiness probe のタイムアウト** — 1.56TB のローディング時間を実測してから調整してください。デフォルト値ではほぼ確実に失敗します。
6. **容量確保のリードタイム** — Azure のクォータ承認、GCP の予約、Alibaba の 灵骏 契約はいずれも営業日ベースで数日から数週間かかります。デプロイスケジュールの実質的なクリティカルパスは技術ではなく容量の調達です。
