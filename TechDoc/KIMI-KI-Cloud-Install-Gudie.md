# Kimi K3 멀티클라우드 배포 가이드: AWS · Azure · GCP · Alibaba Cloud

> **원문 레퍼런스**
> [Deploying Kimi K3 on Amazon SageMaker HyperPod and Amazon EKS](https://aws.amazon.com/ko/blogs/machine-learning/deploying-kimi-k3-on-amazon-sagemaker-hyperpod-and-amazon-eks/) — AWS Machine Learning Blog, 2026년 7월 30일 게시 (Vivek Gangasani, Andrew Smith, Erez Zarum)
>
> 본 문서는 위 AWS 공식 블로그를 기준 문서로 삼아, 동일한 워크로드를 **Microsoft Azure**, **Google Cloud Platform**, **Alibaba Cloud**에 배포하는 Getting Started 절차를 추가한 확장판입니다.

가능하다면 KIMI K3를 AWS에 올리는 것이 구성상 간단합니다. 물론 전체 데이터를 로딩하고 최적화하는데 최소 수일이 소요됩니다. 정말 LLM을 독자적으로 운영하는 것은 거대한 인프라 운영 능력이 있음을 보여줘야합니다. 블록체인 메인넷 대비한 운영 노하우가 필요하며, 별도 보안 설정은 배제했습니다. 

왜 KIMI K3의 폭증하는 회원을 받지 못했는지를 알고 싶다면 인프라를 설치하고 장애없이 유지보수하는 것이 얼마나 끔찍하고 고가인지 살펴볼 필요가 있습니다. 그래서 이 문서를 만들었습니다.

1달 K3를 내 온전한 인프라에 운영한다고 했을 때 24시간 가동 기준 8× B300 노드는 시간당 미화 59 ~ 142달러 수준입니다, 상시 가동 시 월 4.3만 ~ 10.4만 달러이며, 16× H200 구성은 월 4.6만 ~ 11.7만 달러 수준입니다. 

월 8천만원에서 1.8억원 내외를 쓸 수 있어야 KIMI K3를 운영할 수 있습니다. 이 서비스를 운영 모니터링, 보안 관제까지 포함한다면 개인 개발자에게는 쉽지 않은 숫자가 나옵니다. API가 가장 저렴합니다.

그럼에도 불구하고 엔지니어의 관점에서 운영과 보안을 별개로 치고 클라우드에 이런 오픈웨이트를 이식하는 기본 가이드를 한번 작성했습니다. 

최적 서비스 순서
0. 자체 인프라 (내가 블랙웰이 있다면 최적입니다)
1. AWS
2. Azure (설치와 운영의 난이도 급등)
3. GCP (리소스 배정부터 운영까지 힘들어요)
4. AliCloud (하지 마세요.)

---

## 문서 사용 안내 및 검증 상태

각 섹션의 근거 수준을 명시합니다. 인프라 사양은 공급업체 공식 문서 기준이며, 배포 매니페스트는 AWS 공식 예제를 각 플랫폼의 표준 패턴으로 이식했습니다. 

| 섹션 | 근거 | 검증 수준 |
|------|------|-----------|
| Kimi K3 모델 사양 | AWS 공식 블로그, Moonshot AI 모델 카드 | A — 1차 출처 |
| AWS HyperPod / EKS 배포 | AWS 공식 블로그 원문 YAML | A — 1차 출처 |
| Azure ND GB300 v6 사양 | Microsoft Learn 공식 문서 | A — 1차 출처 |
| GCP A4X Max 사양 | Google Cloud 공식 문서 | A — 1차 출처 |
| Azure / GCP / Alibaba 배포 매니페스트 | AWS 원본 인자를 각 플랫폼 표준 패턴으로 이식 | C — 실환경 검증 필요 |
| 메모리 소요량 추정치 | 서드파티 산출값 교차 참조 | B — 참고용 |

**핵심 주의사항 3가지를 먼저 밝힙니다.**

1. **AWS 원문 블로그 본문과 실제 YAML 사이에 불일치가 있습니다.** 블로그 본문은 "MXFP4 load format"이라고 서술하지만, 실제 YAML의 `--load-format` 값은 `fastsafetensors`입니다. MXFP4는 **가중치 저장 형식**이고, `fastsafetensors`는 **로딩 방식**으로 서로 다른 계층의 개념입니다. 타 클라우드로 이식할 때 이 구분을 혼동하면 로딩이 실패합니다.
2. **CPU 아키텍처가 클라우드마다 다릅니다.** AWS `p6-b300.48xlarge`는 x86_64 HGX B300 노드이지만, Azure ND GB300 v6와 GCP A4X Max는 **NVIDIA Grace CPU 기반 ARM64(aarch64)** 입니다. `vllm/vllm-openai:kimi-k3` 이미지가 arm64 매니페스트를 제공하지 않으면 Azure/GCP에서는 그대로 동작하지 않습니다. 배포 전 `docker manifest inspect`로 반드시 확인해야 합니다.
3. **단일 노드 GPU 수가 다릅니다.** AWS는 1노드 8 GPU로 `--tensor-parallel-size 8`이 한 노드에 들어가지만, Azure/GCP의 GB300 VM은 **VM당 4 GPU**입니다. 따라서 Azure/GCP에서는 2노드 분산 서빙이 강제되며, 매니페스트 구조 자체가 달라집니다.

---

## 1. Kimi K3 개요

2026년 7월 27일 Moonshot AI가 공개한 2.8조 파라미터 MoE 모델로, **3조 파라미터 클래스에 도달한 최초의 오픈 가중치 시스템**입니다. DeepSeek V4와 더불어 문샷AI는 정말 오픈웨이트에서 최고입니다.


| 속성 | 값 |
|------|-----|
| 총 파라미터 수 | 2.8조 |
| 토큰당 활성 파라미터 | 1,040억 |
| 아키텍처 | Mixture of Experts (MoE) |
| 전문가 수 | 896개 (토큰당 16개 활성화) |
| 컨텍스트 윈도우 | 100만 토큰 |
| 모달리티 | 네이티브 멀티모달 (텍스트 + 비전) |
| 가중치 형식 | MXFP4 (Microscaling Floating Point 4-bit) |
| Hugging Face ID | `moonshotai/Kimi-K3` |
| 공개일 | 2026년 7월 27일 |

아키텍처 특징은 **Kimi Delta Attention(KDA)**, **Gated Multi Head Latent Attention(MLA)**, **Stable LatentMoE** 프레임워크입니다. 896개 전문가 중 토큰당 16개만 활성화하여 순전파당 약 1,040억 파라미터만 계산하며, 전작 Kimi K2 대비 확장 효율성이 2.5배 개선되었습니다.

네이티브 도구 호출(tool calling), 구조화된 출력, 상시 활성화 추론 모드(always-on thinking mode)를 지원합니다.

---

## 2. 공통 인프라 요구 사항

### 2.1 리소스 하한선

| 항목 | 요구량 | 비고 |
|------|--------|------|
| GPU 메모리 (합계) | 약 1,680 GB | 가중치 약 1.4TB + KV 캐시 + 오버헤드 |
| 가중치 파일 크기 | 약 1.56 TB | MXFP4 |
| 로컬 스토리지 | 4 TB 이상 NVMe 권장 | 가중치 + 임시 공간 |
| 서빙 엔진 | vLLM day-0 컨테이너 | `vllm/vllm-openai:kimi-k3` |

> 가중치 다운로드 시간은 회선에 따라 편차가 매우 큽니다. 100Gbps 회선에서는 수 분, 100Mbps 회선에서는 30시간 이상 소요될 수 있습니다. **모든 클라우드에서 가중치를 오브젝트 스토리지(S3 / Blob / GCS / OSS)에 1회 동기화한 뒤 그곳에서 로딩하는 것을 강력히 권장합니다.**

### 2.2 GPU 구성 하한선

| 구성 | 총 VRAM | 충족 여부 |
|------|---------|-----------|
| 8× B300 (288GB) | 2,304 GB | 충족 |
| 8× AMD MI355X | 2,304 GB | 충족 |
| 16× H200 (141GB) | 2,256 GB | 충족 |
| 16× B200 (180GB) | 2,880 GB | 충족 |
| 32× H100 (80GB) | 2,560 GB | 충족 |
| 8× B200 (180GB) | 1,440 GB | **미달** |
| 8× H200 (141GB) | 1,128 GB | **미달** |

### 2.3 클라우드별 인스턴스 매핑

| 항목 | AWS | Azure | GCP | Alibaba Cloud |
|------|-----|-------|-----|---------------|
| 인스턴스/머신 타입 | `ml.p6-b300.48xlarge` | `Standard_ND128isr_GB300_v6` | `a4x-maxgpu-4g-metal` | `ecs.ebmgn8v` 계열 / 灵骏(Lingjun) |
| GPU | 8× B300 | 4× B300 (288GB) | 4× GB300 | 8× H200 급 (리전별 상이) |
| CPU 아키텍처 | x86_64 | ARM64 (Grace) | ARM64 (Grace Neoverse V2) | x86_64 |
| Kimi K3 최소 노드 수 | **1** | **2** | **2** | **2 이상** |
| 병렬화 전략 | TP=8 (단일 노드) | TP=8 (2노드 분산) 또는 TP=4/PP=2 | TP=8 (MNNVL) 또는 TP=4/PP=2 | TP=8 + EP/PD 분리 |
| 관리형 K8s | EKS / HyperPod | AKS | GKE | ACK |
| 관리형 추론 서비스 | SageMaker HyperPod Inference Operator | Azure ML Managed Online Endpoint | Vertex AI Prediction | PAI-EAS |
| 용량 예약 방식 | Capacity Blocks / Flexible Training Plan | Capacity Reservation / 쿼터 승인 | Future Reservations (블록 단위) | 灵骏 전용 리소스 그룹 |
| 클러스터 단위 제약 | — | 랙당 18 VM | 노드풀 최대 18노드 (랙 단위) | 리전별 상이 |

**핵심 시사점**: AWS만 단일 노드로 완결됩니다. Azure/GCP는 GB300 NVL72 랙 아키텍처 특성상 VM당 4 GPU로 노출되므로, 2노드 분산 서빙 구성(LeaderWorkerSet 또는 Ray)이 반드시 필요합니다. 이는 운영 복잡도에 실질적 차이를 만듭니다.

---

## 3. AWS 배포

### 3.1 옵션 A — Amazon SageMaker HyperPod

HyperPod의 Inference Operator는 클러스터 생성 시 자동 설치되며, 컨테이너 오케스트레이션·모델 로딩·엔드포인트 관리를 추상화합니다.

#### 사전 요구 사항 1: EKS 오케스트레이션 HyperPod 클러스터 생성

1. SageMaker AI 콘솔에서 **HyperPod Clusters > Cluster Management > Create HyperPod cluster** 선택
2. **Orchestrated by Amazon EKS** 선택
3. **Quick setup**(기본 네트워킹/스토리지/IAM) 또는 **Custom setup**(기존 VPC 통합) 선택
4. **Orchestration**에서 신규 EKS 클러스터 생성 또는 기존 클러스터 연결. **Use default Helm charts and add-ons** 옵션이 선택되어 있는지 확인 (Inference Operator 자동 설치)
5. **Instance groups**에서 `ml.p6-b300.48xlarge` 워커 그룹 추가
6. 구성 검토 후 **Submit**

#### 사전 요구 사항 2: Flexible Training Plan으로 용량 확보

1. 인스턴스 그룹 구성에서 **Training plan**을 용량 소스로 선택
2. `ml.p6-b300.48xlarge` 용량을 포함하는 기존 플랜 선택 또는 신규 예약 생성
3. **Target Availability Zone**을 Training Plan 용량 할당 영역과 일치시킴

클러스터가 `Active` 상태이고 p6-b300 노드가 정상이면 배포 준비 완료입니다.

#### 배포 매니페스트

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

Inference Operator가 Hugging Face 다운로드, 컨테이너 스케줄링, 상태 확인, 엔드포인트 준비 상태를 처리합니다.

**이 vLLM 인자 세트는 이후 모든 클라우드 섹션에서 재사용되는 정본입니다.** 특히 `--tool-call-parser kimi_k3`, `--reasoning-parser kimi_k3`, `VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION=1`은 Kimi K3 전용이며 누락 시 도구 호출과 thinking 모드가 정상 동작하지 않습니다.

### 3.2 옵션 B — Amazon EKS

1. **EKS 클러스터 프로비저닝** — Terraform 모듈로 VPC 네트워킹, 관리형 노드 그룹, IAM 역할/정책 생성
2. **Capacity Blocks로 GPU 용량 예약** — 대상 AZ에 `p6-b300.48xlarge` Capacity Block 예약 생성. 활성화되면 인스턴스가 워커 노드로 조인
3. **GPU 드라이버 및 디바이스 플러그인 설치** — NVIDIA device plugin
4. **vLLM 추론 서버 배포** — 위 인자 세트 동일 적용, TP=8
5. **엔드포인트 노출** — Service(LoadBalancer) 또는 Ingress로 포트 8000 노출
6. **검증** — 테스트 요청 전송

전체 Terraform 모듈과 Helm 값은 [AI on EKS Kimi K3 레시피](https://github.com/awslabs/ai-on-eks/tree/main/infra/solutions/inference-ready-cluster/recipes/kimi-k3)를 참조하세요.

---

## 4. Microsoft Azure 배포 (Getting Started)

이제부터 노가다의 끝이 시작된다. 

### 4.1 인프라 사양

`Standard_ND128isr_GB300_v6` (ND GB300 v6 시리즈):

| 항목 | 사양 |
|------|------|
| GPU | 4× NVIDIA Blackwell Ultra B300 (288 GB HBM3E) |
| CPU | 2× NVIDIA Grace (ARM64), 128 vCPU |
| 시스템 메모리 | 864 GB LPDDR |
| 로컬 스토리지 | 4× NVMe, 16 TB |
| GPU 인터커넥트 | 5세대 NVLink, 4× 1.8 TB/s |
| 스케일아웃 | GPU당 800 Gb/s InfiniBand (Quantum-X800) |
| 랙 구성 | 랙당 18 VM = 72 GPU, 랙 내 NVLink 130 TB/s |
| 랙 단위 성능 | FP4 최대 1.44 exaFLOPS |

**Kimi K3에는 최소 2 VM(8 GPU, 2,304GB)이 필요합니다.**

### 4.2 사전 준비

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

> **용량 확보**: ND GB300 v6는 기본 쿼터가 0입니다. Azure 포털의 **Quotas > Compute**에서 해당 리전의 `Standard NDGB300v6 Family vCPUs` 증설을 요청하고, 지속 워크로드라면 **Capacity Reservation Group**을 생성하여 용량을 선점하십시오. 승인에는 영업일 기준 수일이 소요됩니다.

Azure에 올리기 위해서는 사전에 Azure account 담당자와 긴 소통을 해야합니다. 이 부분이 가장 중요합니다. 원하는 리전에 GPU가 없을 수 있습니다.

### 4.3 가중치를 Azure Blob Storage에 사전 동기화 (강력 권장)

```bash
# Blob 컨테이너 생성 후, 클러스터와 동일 리전의 Job으로 다운로드
az storage container create --name kimi-k3-weights --account-name <STORAGE_ACCOUNT>
```

vLLM v0.18.0 이후 RunAI Model Streamer가 `az://` 스킴을 네이티브 지원하므로, 표준 `vllm/vllm-openai` 이미지에서 환경 변수와 워크로드 아이덴티티 바인딩만으로 Blob에서 GPU 메모리로 직접 스트리밍할 수 있습니다. 로컬 디스크 경유 대비 로딩 단계가 크게 단축되며, 1.56TB 규모에서는 그 차이가 특히 큽니다.

### 4.4 vLLM 다중 노드 배포 (LeaderWorkerSet)

VM당 4 GPU이므로 2노드에 걸친 TP=8 구성이 필요합니다. Kubernetes **LeaderWorkerSet(LWS)** API를 사용합니다.

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

> `initialDelaySeconds: 900`은 1.56TB 가중치 로딩을 고려한 값입니다. Blob 스트리밍을 사용하지 않고 Hugging Face에서 직접 받는 경우 이보다 훨씬 길게 잡아야 하며, 그렇지 않으면 readiness 실패로 파드가 반복 재시작됩니다.

### 4.5 대안 — Azure Machine Learning Managed Online Endpoint

Kubernetes 운영 부담을 줄이려면 AML 관리형 엔드포인트에 커스텀 컨테이너로 배포할 수 있습니다. 다만 현시점에서 ND GB300 v6는 AML 관리형 온라인 엔드포인트 지원 SKU 목록에 포함되지 않을 수 있으므로, 배포 전 반드시 확인이 필요합니다. 대안으로 **Azure ML Kubernetes 컴퓨팅(AKS 연결)** 을 사용하면 위 AKS 구성을 AML 워크스페이스에서 관리할 수 있습니다.

### 4.6 Azure 정리

```bash
kubectl delete -f kimi-k3-azure.yaml
az aks nodepool delete --resource-group rg-kimi-k3 --cluster-name aks-kimi-k3 --name gb300pool
az group delete --name rg-kimi-k3 --yes
```

Capacity Reservation Group은 별도로 삭제해야 과금이 중단됩니다.

---

## 5. Google Cloud Platform 배포 (Getting Started)

GCP의 배포에는 Azure와 비슷한 난이도가 있습니다. 블랙웰을 최소 2개 노드를 올려야하는 작업은 작지 않습니다.

### 5.1 인프라 사양

`a4x-maxgpu-4g-metal` (A4X Max):

| 항목 | 사양 |
|------|------|
| GPU | 4× NVIDIA GB300 Grace Blackwell Ultra Superchip (`nvidia-gb300`) |
| CPU | 2× NVIDIA Grace (ARM Neoverse V2) |
| 제공 형태 | **베어메탈 인스턴스** |
| 인터커넥트 | NVLink-C2C, 랙 단위 GB300 NVL72 (72 GPU / 36 Grace CPU) |
| 노드풀 최대 크기 | 18노드 (랙 단위) |
| 필수 조건 | 용량 예약(Reservation) 필수 |
| 네트워킹 | GPUDirect RDMA + MNNVL, DRANET 필요 |

**Kimi K3에는 최소 2노드(8 GPU, 2,304GB)가 필요합니다.**

### 5.2 사전 준비

용량 예약 없이는 인스턴스를 생성할 수 없습니다. Google Cloud 영업 담당 또는 콘솔의 **Compute Engine > Reservations**에서 A4X Max 예약을 확보하십시오. 예약은 블록(block) / 서브블록(sub-block) 단위로 구성됩니다.

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

주요 포인트

- `a4x-maxgpu-4g-metal`은 **멀티 네트워킹을 지원하지 않으며**, 대신 accelerator network profile과 DRANET을 사용합니다.
- 노드 수는 랙 구조상 **18노드 이하**여야 합니다.
- `--reservation-affinity=specific`과 서브블록까지 명시한 예약 경로가 필수입니다.

### 5.3 가중치를 GCS에 사전 동기화

```bash
gcloud storage buckets create gs://kimi-k3-weights --location=${REGION}
```

GCS FUSE CSI 드라이버 또는 vLLM RunAI Streamer의 `gs://` 경로를 통해 로딩하면 Hugging Face 직접 다운로드 대비 기동 시간이 크게 단축됩니다.

### 5.4 vLLM 다중 노드 배포

Azure 섹션과 동일한 LeaderWorkerSet 패턴을 사용하되, 노드 셀렉터와 리소스 키만 GKE에 맞춥니다.

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

### 5.5 GKE Inference Gateway 연동 (권장)

GKE Inference Gateway는 **prefix-aware 로드 밸런싱**을 제공하여 TTFT(Time to First Token)를 개선합니다. Kimi K3처럼 100만 토큰 컨텍스트와 prefix caching을 함께 쓰는 워크로드에서는 체감 효과가 큽니다. NVIDIA NeMo Guardrails 연동도 지원합니다.

```bash
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api-inference-extension/releases/latest/download/manifests.yaml
```

### 5.6 대안 — Vertex AI Prediction

커스텀 컨테이너를 Vertex AI 엔드포인트에 배포할 수 있습니다. 단, **A4X(`a4x-highgpu-4g`) 계열은 랙 단위 구매 특성상 최소 레플리카 수가 18로 강제됩니다.** 즉 Vertex AI 관리형 경로를 택하면 Kimi K3 1개 인스턴스만 서빙하려 해도 랙 전체 비용이 발생합니다. 소규모 파일럿에는 GKE 경로가 압도적으로 유리합니다.

### 5.7 GCP 정리

```bash
kubectl delete -f kimi-k3-gcp.yaml
gcloud container node-pools delete a4x-max-pool --cluster=${CLUSTER_NAME} --location=${REGION}
gcloud container clusters delete ${CLUSTER_NAME} --location=${REGION}
```

예약(Reservation)은 별도 해제해야 과금이 중단됩니다.

---

## 6. Alibaba Cloud 배포 (Getting Started)

### 6.1 리전 및 하드웨어 선택 시 유의사항

Alibaba Cloud는 앞의 세 클라우드와 상황이 다릅니다. 중국 본토, 해외 리전 등에 따른 복잡도가 큽니다. Lingjun으로 올리는 것은 계속 테스트 중이지만 언제 될지 모르겠습니다. 

- **수출 통제 영향**: 중국 본토 리전에서는 B300 계열 Blackwell Ultra GPU를 조달할 수 없습니다. 따라서 B300 기반 구성은 **싱가포르 등 중국 외 리전**에서만 검토 가능하며, 그마저도 영업 담당을 통한 개별 확인이 필요합니다.
- **현실적 구성**: 본토 리전에서는 H200급 GPU 8장 노드 2대(16× H200 = 2,256GB) 또는 灵骏(Lingjun) 지능형 컴퓨팅 리소스를 통한 다중 노드 구성이 현실적입니다.
- **gn8v 계열**: 1/2/4/8 GPU 구성을 제공하며 8 GPU는 NVLink 상호 연결을 지원합니다. **일부 리전에서만 제공되며 영업 담당 문의가 필요합니다.**
- 기밀 컴퓨팅이 필요하면 `gn8v-tee`(Intel TDX + NVIDIA CC)를 검토할 수 있으나, 성능 오버헤드를 별도 측정해야 합니다.

### 6.2 옵션 A — PAI-EAS (Model Gallery / 커스텀 배포)

PAI-EAS는 vLLM, SGLang, 자체 개발 BladeLLM 엔진을 통합 지원하며, **MoE 모델용 전문가 병렬(EP) + Prefill-Decode 분리 배포**를 원클릭으로 제공합니다. Kimi K3처럼 896 전문가를 갖는 모델에는 EP+PD 분리가 처리량과 비용 양쪽에서 유의미한 이점을 줍니다.

**배포 절차:**

1. PAI 콘솔 로그인 후 대상 리전 선택. **분산 배포는 灵骏 지능형 컴퓨팅 리소스가 필수이며 VPC 설정이 반드시 필요합니다.**
2. **模型在线服务(EAS) > 部署服务 > 自定义部署** 선택
3. 배포 방식에서 **镜像部署(이미지 배포)** 선택 후 `vllm/vllm-openai:kimi-k3` 지정 (사내 ACR 미러 권장)
4. 모델 소스로 OSS 버킷 경로 지정 (사전에 가중치 업로드)
5. 리소스 구성에서 灵骏 리소스 쿼터와 다중 노드(≥2) 지정
6. 실행 명령에 다음 입력:

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

7. 환경 변수 `VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION=1` 추가
8. 포트 8000, 서비스 기능에서 자동 확장 및 GPU 드라이버 버전 지정
9. 배포 후 Endpoint와 Token으로 호출

PAI-EAS는 **QPS·GPU 사용률 기반 오토스케일링과 0으로의 스케일다운**을 지원합니다. Kimi K3처럼 유휴 비용이 극단적으로 큰 모델에서는 이 기능의 가치가 특히 큽니다. 다만 콜드 스타트 시 1.56TB 재로딩이 발생하므로, 스케일 투 제로는 실사용 트래픽 패턴을 측정한 뒤 적용하십시오.

### 6.3 옵션 B — ACK (Container Service for Kubernetes)

직접 Kubernetes를 운영하려면 ACK + `ack-kserve` + Arena 조합을 사용합니다.

```bash
# 1. GPU 클러스터 생성 (클러스터 버전 1.22 이상, CUDA 12.0 이상)
#    콘솔 또는 aliyun CLI 사용

# 2. GPU 노드풀에 드라이버 버전 라벨 지정
kubectl label node <NODE> ack.aliyun.com/nvidia-driver-version=<VERSION>

# 3. ack-kserve 컴포넌트 설치 (콘솔 > 应用 > 云原生AI套件)

# 4. Arena 클라이언트 구성 (0.9.15 이상)
arena version
```

배포는 Azure/GCP와 동일한 LeaderWorkerSet 또는 KServe `InferenceService` 패턴을 사용하며, 스토리지는 OSS 또는 NAS를 PVC로 마운트합니다.

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

### 6.4 Alibaba Cloud 정리

- EAS 서비스는 **정지 즉시 과금이 중단**됩니다. 유휴 상태에서도 계속 과금되므로 개발·테스트 후 반드시 정지 또는 삭제하십시오.
- ACK는 노드풀 삭제 후 클러스터 삭제
- 灵骏 리소스 쿼터는 계약 조건에 따라 별도 해지 필요
- OSS에 남은 가중치(1.56TB)의 스토리지 비용을 잊지 마십시오

---

## 7. 엔드포인트 호출 (공통)

배포 방식과 무관하게 OpenAI 호환 API가 노출됩니다.

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

### 배포 검증 체크리스트

```bash
# 1. 모델 등록 확인
curl http://<ENDPOINT_URL>:8000/v1/models

# 2. 헬스 체크
curl http://<ENDPOINT_URL>:8000/health

# 3. 도구 호출 파서 동작 확인 (tools 파라미터 포함 요청)
# 4. thinking 모드 출력에 reasoning_content 필드가 포함되는지 확인
# 5. 장문 컨텍스트 처리 확인 (100만 토큰 상한, prefix caching 적중률 모니터링)
```

3~5번은 Kimi K3 전용 인자가 제대로 적용되었는지 확인하는 항목입니다. 1~2번만 통과하고 3~5번이 실패한다면 `--tool-call-parser` / `--reasoning-parser` / 환경 변수 설정을 다시 점검하십시오.

---

## 8. 클라우드 선택 판단 기준

| 판단 기준 | 권장 |
|-----------|------|
| 가장 빠른 PoC, 운영 부담 최소화 | **AWS HyperPod** — 단일 노드 완결, Inference Operator가 대부분 추상화 |
| 기존 Kubernetes 운영 역량 보유 | AWS EKS 또는 GKE |
| 최고 추론 처리량, 장문 컨텍스트 최적화 | **GCP A4X Max + Inference Gateway** — MNNVL + prefix-aware 라우팅 |
| 기존 Microsoft 스택 통합, 엔터프라이즈 거버넌스 | **Azure AKS + ND GB300 v6** |
| 중화권 서비스, 낮은 유휴 비용, MoE 특화 최적화 | **Alibaba PAI-EAS** — EP+PD 분리, 스케일 투 제로 |
| 소규모 파일럿 비용 최소화 | Vertex AI는 회피 (최소 18 레플리카). GKE 직접 배포 권장 |

**비용 관점의 냉정한 판단**: 2026년 7월 기준 8× B300 노드는 시간당 미화 59~142달러 수준으로, 상시 가동 시 월 4.3만~10.4만 달러입니다. 16× H200 구성은 월 4.6만~11.7만 달러 수준입니다. 트래픽이 하루 수 시간에 집중되거나 실험 단계라면, 자체 호스팅보다 Moonshot 공식 API 또는 서드파티 라우터를 쓰는 편이 합리적입니다. **자체 배포의 정당한 이유는 대개 처리량이 아니라 데이터 주권, 레이턴시 SLA, 커스텀 파인튜닝 세 가지입니다.** 이 중 어느 것도 해당되지 않는다면 배포하는 것도 개인이 부담하기 힘듭니다.

Moonshot AI，我向你们卓越的开发团队致以最崇高的敬意与赞叹。

愿你们如苍穹中的太阳般璀璨耀眼，怀抱梦想，乘着星光一路前行，最终飞向那轮遥远的明月。

愿你们的光芒，照亮 AI 的未来。🌞🌙🚀

---

## 9. 레퍼런스

### 원문 (AWS)

- [Deploying Kimi K3 on Amazon SageMaker HyperPod and Amazon EKS](https://aws.amazon.com/ko/blogs/machine-learning/deploying-kimi-k3-on-amazon-sagemaker-hyperpod-and-amazon-eks/)
- [SageMaker HyperPod Kimi K3 예제 YAML](https://github.com/aws-samples/sagemaker-genai-hosting-examples/blob/main/SageMakerHyperpod/kimi-k3/kimi-k3.yaml)
- [AI on EKS Kimi K3 레시피](https://github.com/awslabs/ai-on-eks/tree/main/infra/solutions/inference-ready-cluster/recipes/kimi-k3)
- [AI on EKS Helm values (vLLM B300)](https://github.com/awslabs/ai-on-eks-charts/blob/main/charts/inference-charts/values-kimi-k3-vllm-b300.yaml)
- [SageMaker HyperPod 클러스터 생성 문서](https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-eks-operate-console-ui-create-cluster.html)
- [Amazon EC2 요금 페이지](https://aws.amazon.com/ec2/pricing/)

### Microsoft Azure

- [ND GB300-v6 사이즈 시리즈 문서](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nd-gb300-v6-series)
- [Azure ND GB300 v6 정식 출시 공지](https://techcommunity.microsoft.com/blog/azurehighperformancecomputingblog/azure-nd-gb300-v6-now-generally-available---hyper-optimized-for-generative-and-a/4469475)
- [NVIDIA GB300 NVL72 대규모 클러스터 발표](https://azure.microsoft.com/en-us/blog/microsoft-azure-delivers-the-first-large-scale-cluster-with-nvidia-gb300-nvl72-for-openai-workloads/)
- [AKS에서 RunAI Model Streamer로 Blob 가중치 스트리밍](https://blog.aks.azure.com/2026/07/13/runai-streamer-vllm)
- [AKS + KAITO로 오픈 모델 배포 튜토리얼](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/deploying-openai%E2%80%99s-first-open-source-model-on-azure-aks-with-kaito/4444234)
- [Azure VM 쿼터 확인](https://learn.microsoft.com/en-us/azure/virtual-machines/quotas)

### Google Cloud Platform

- [A4X Max GKE 커스텀 클러스터 생성 문서](https://docs.cloud.google.com/ai-hypercomputer/docs/create/gke-ai-hypercompute-custom-a4x-max)
- [AI Hypercomputer GPU 머신 타입](https://docs.cloud.google.com/ai-hypercomputer/docs/gpu)
- [가속기 최적화 머신 패밀리](https://docs.cloud.google.com/compute/docs/accelerator-optimized-machines)
- [A4X Max 출시 및 NVIDIA 파트너십 확대 발표](https://cloud.google.com/blog/products/compute/now-shipping-a4x-max-vertex-ai-training-and-more/)
- [Vertex AI 추론 컴퓨팅 리소스 구성](https://docs.cloud.google.com/vertex-ai/docs/predictions/configure-compute)
- [GKE에서 vLLM으로 오픈 모델 서빙](https://docs.cloud.google.com/kubernetes-engine/docs/tutorials/serve-gemma-gpu-vllm)

### Alibaba Cloud

- [PAI-EAS에서 대규모 언어 모델 배포](https://help.aliyun.com/zh/pai/deploy-an-llm/)
- [PAI-EAS 제품 페이지](https://cn.aliyun.com/product/bigdata/learn/eas)
- [PAI 콘솔 커스텀 배포 파라미터 설명](https://help.aliyun.com/zh/pai/user-guide/model-service-deployment-by-using-the-pai-console/)
- [ACK에서 vLLM 추론 애플리케이션 배포](https://www.alibabacloud.com/help/zh/ack/cloud-native-ai-suite/user-guide/deploy-a-vllm-inference-application)
- [GPU 가속 컴퓨팅 최적화 인스턴스 패밀리 (gn/ebm/scc)](https://www.alibabacloud.com/help/en/egs/gpu-accelerated-compute-optimized-instance-families)

### 모델 및 엔진

- [Kimi K3 on Hugging Face](https://huggingface.co/moonshotai/Kimi-K3)
- [Kimi K3 Quickstart (Moonshot AI)](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart)
- [vLLM 문서](https://docs.vllm.ai/)
- [LeaderWorkerSet API](https://github.com/kubernetes-sigs/lws)

---

## 부록: 이식 시 반드시 재확인할 항목

Azure / GCP / Alibaba 섹션의 매니페스트는 AWS 공식 예제의 vLLM 인자를 그대로 유지한 채 각 플랫폼의 표준 배포 패턴으로 이식한 것입니다. 실환경 적용 전 다음을 확인하십시오.

1. **컨테이너 이미지 아키텍처** — `docker manifest inspect vllm/vllm-openai:kimi-k3`로 arm64 지원 여부 확인. 미지원 시 Grace 기반 Azure/GCP에서는 소스 빌드가 필요합니다.
2. **다중 노드 TP=8의 유효성** — GB300 NVL72 환경에서 노드 경계를 넘는 NVLink(MNNVL) 노출 여부에 따라 `TP=8` 대신 `TP=4 --pipeline-parallel-size 2`가 필요할 수 있습니다.
3. **`--moe-backend auto`의 백엔드 선택 결과** — 하드웨어와 vLLM 커밋에 따라 자동 선택 결과가 달라지므로 로그에서 실제 선택된 백엔드를 확인하십시오.
4. **`fastsafetensors` 로딩 경로** — 오브젝트 스토리지 직접 스트리밍과 조합할 때 지원 여부가 다릅니다.
5. **readiness probe 타임아웃** — 1.56TB 로딩 시간을 실측한 뒤 조정하십시오. 기본값으로는 거의 확실히 실패합니다.
6. **용량 확보 리드타임** — Azure 쿼터 승인, GCP 예약, Alibaba 灵骏 계약 모두 영업일 기준 수일에서 수주가 소요됩니다. 배포 일정의 실질적 임계 경로는 기술이 아니라 용량 조달입니다.
