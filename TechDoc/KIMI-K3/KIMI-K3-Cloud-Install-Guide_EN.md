# Kimi K3 Multi-Cloud Deployment Guide: AWS · Azure · GCP · Alibaba Cloud

> **Original Reference**
> [Deploying Kimi K3 on Amazon SageMaker HyperPod and Amazon EKS](https://aws.amazon.com/ko/blogs/machine-learning/deploying-kimi-k3-on-amazon-sagemaker-hyperpod-and-amazon-eks/) — AWS Machine Learning Blog, published July 30, 2026 (Vivek Gangasani, Andrew Smith, Erez Zarum)
>
> This document uses the AWS official blog above as its baseline document, and is an extended edition that adds Getting Started procedures for deploying the same workload to **Microsoft Azure**, **Google Cloud Platform**, and **Alibaba Cloud**.

If possible, deploying KIMI K3 on AWS is the simplest in terms of configuration. Of course, loading and optimizing the entire dataset takes at least a few days. Truly operating an LLM independently requires demonstrating that you have the ability to operate a massive infrastructure. It requires operational know-how comparable to running a blockchain mainnet, and we have excluded separate security configurations.

If you want to understand why KIMI K3 hasn't been able to accept its surging user base, you need to look at how terrible and expensive it is to install the infrastructure and keep it running without failures. That is why I created this document.

If you were to run K3 on your own full infrastructure for a month on a 24/7 basis, an 8× B300 node costs roughly USD 59–142 per hour, or USD 43,000–104,000 per month when running continuously; a 16× H200 configuration runs at roughly USD 46,000–117,000 per month.

You need to be able to spend around KRW 80 million to 180 million per month to operate KIMI K3. If you include operational monitoring and security operations for this service, the numbers become tough for an individual developer. Using the API is the cheapest option.

Nevertheless, from an engineer's perspective, treating operations and security as separate concerns, I have written a basic guide for porting this open-weight model to the cloud.

Recommended service order
0. Self-hosted infrastructure (optimal if you have Blackwell hardware)
1. AWS
2. Azure (installation and operations difficulty rises sharply)
3. GCP (hard from resource allocation through operations)
4. AliCloud (don't do it.)

---

## Document Usage Guide and Verification Status

Each section states its level of evidence. Infrastructure specs are based on vendor official documentation, and the deployment manifests have been ported from the AWS official example into each platform's standard patterns.

| Section | Evidence | Verification Level |
|------|------|-----------|
| Kimi K3 model specs | AWS official blog, Moonshot AI model card | A — Primary source |
| AWS HyperPod / EKS deployment | YAML from the original AWS official blog | A — Primary source |
| Azure ND GB300 v6 specs | Microsoft Learn official documentation | A — Primary source |
| GCP A4X Max specs | Google Cloud official documentation | A — Primary source |
| Azure / GCP / Alibaba deployment manifests | AWS original args ported to each platform's standard patterns | C — Production verification required |
| Memory requirement estimates | Cross-referenced third-party calculations | B — Reference only |

**Let me first disclose three key caveats.**

1. **There is an inconsistency between the AWS original blog's prose and the actual YAML.** The blog text describes "MXFP4 load format", but the actual YAML's `--load-format` value is `fastsafetensors`. MXFP4 is a **weight storage format** while `fastsafetensors` is a **loading method**, which are concepts at different layers. Confusing this distinction when porting to other clouds will cause loading to fail.
2. **The CPU architecture differs per cloud.** AWS `p6-b300.48xlarge` is an x86_64 HGX B300 node, but Azure ND GB300 v6 and GCP A4X Max are **ARM64 (aarch64) based on NVIDIA Grace CPUs**. If the `vllm/vllm-openai:kimi-k3` image does not provide an arm64 manifest, it will not work as-is on Azure/GCP. You must verify this with `docker manifest inspect` before deployment.
3. **The number of GPUs per single node differs.** On AWS, one node has 8 GPUs so `--tensor-parallel-size 8` fits on a single node, but GB300 VMs on Azure/GCP have **4 GPUs per VM**. As a result, Azure/GCP require 2-node distributed serving, and the manifest structure itself differs.

---

## 1. Kimi K3 Overview

Released by Moonshot AI on July 27, 2026, it is a 2.8-trillion-parameter MoE model and the **first open-weight system to reach the 3-trillion-parameter class**. Along with DeepSeek V4, Moonshot AI is truly the best in open weights.


| Attribute | Value |
|------|-----|
| Total parameters | 2.8 trillion |
| Active parameters per token | 104 billion |
| Architecture | Mixture of Experts (MoE) |
| Number of experts | 896 (16 activated per token) |
| Context window | 1 million tokens |
| Modality | Native multimodal (text + vision) |
| Weight format | MXFP4 (Microscaling Floating Point 4-bit) |
| Hugging Face ID | `moonshotai/Kimi-K3` |
| Release date | July 27, 2026 |

Its architectural highlights are the **Kimi Delta Attention (KDA)**, **Gated Multi-Head Latent Attention (MLA)**, and **Stable LatentMoE** frameworks. Only 16 of the 896 experts are activated per token, computing roughly 104 billion parameters per forward pass, with a 2.5× improvement in scaling efficiency over its predecessor, Kimi K2.

It supports native tool calling, structured output, and an always-on thinking mode.

---

## 2. Common Infrastructure Requirements

### 2.1 Resource Lower Bounds

| Item | Requirement | Notes |
|------|--------|------|
| GPU memory (total) | approx. 1,680 GB | weights approx. 1.4 TB + KV cache + overhead |
| Weight file size | approx. 1.56 TB | MXFP4 |
| Local storage | 4 TB+ NVMe recommended | weights + temporary space |
| Serving engine | vLLM day-0 container | `vllm/vllm-openai:kimi-k3` |

> Weight download times vary enormously by network line. On a 100 Gbps line it may take minutes, while on a 100 Mbps line it can take 30+ hours. **We strongly recommend, on every cloud, syncing the weights once to object storage (S3 / Blob / GCS / OSS) and loading them from there.**

### 2.2 GPU Configuration Lower Bounds

| Configuration | Total VRAM | Meets Requirement |
|------|---------|-----------|
| 8× B300 (288GB) | 2,304 GB | Meets |
| 8× AMD MI355X | 2,304 GB | Meets |
| 16× H200 (141GB) | 2,256 GB | Meets |
| 16× B200 (180GB) | 2,880 GB | Meets |
| 32× H100 (80GB) | 2,560 GB | Meets |
| 8× B200 (180GB) | 1,440 GB | **Below** |
| 8× H200 (141GB) | 1,128 GB | **Below** |

### 2.3 Per-Cloud Instance Mapping

| Item | AWS | Azure | GCP | Alibaba Cloud |
|------|-----|-------|-----|---------------|
| Instance/machine type | `ml.p6-b300.48xlarge` | `Standard_ND128isr_GB300_v6` | `a4x-maxgpu-4g-metal` | `ecs.ebmgn8v` family / 灵骏 (Lingjun) |
| GPU | 8× B300 | 4× B300 (288GB) | 4× GB300 | 8× H200-class (varies by region) |
| CPU architecture | x86_64 | ARM64 (Grace) | ARM64 (Grace Neoverse V2) | x86_64 |
| Minimum Kimi K3 nodes | **1** | **2** | **2** | **2 or more** |
| Parallelization strategy | TP=8 (single node) | TP=8 (2-node distributed) or TP=4/PP=2 | TP=8 (MNNVL) or TP=4/PP=2 | TP=8 + EP/PD separation |
| Managed K8s | EKS / HyperPod | AKS | GKE | ACK |
| Managed inference service | SageMaker HyperPod Inference Operator | Azure ML Managed Online Endpoint | Vertex AI Prediction | PAI-EAS |
| Capacity reservation method | Capacity Blocks / Flexible Training Plan | Capacity Reservation / quota approval | Future Reservations (block units) | 灵骏 dedicated resource groups |
| Cluster-level constraint | — | 18 VMs per rack | max 18 nodes per node pool (rack unit) | varies by region |

**Key takeaway**: Only AWS is self-contained on a single node. On Azure/GCP, the GB300 NVL72 rack architecture exposes 4 GPUs per VM, so a 2-node distributed serving setup (LeaderWorkerSet or Ray) is mandatory. This creates a real difference in operational complexity.

---

## 3. AWS Deployment

### 3.1 Option A — Amazon SageMaker HyperPod

HyperPod's Inference Operator is installed automatically at cluster creation and abstracts container orchestration, model loading, and endpoint management.

#### Prerequisite 1: Create an EKS-orchestrated HyperPod cluster

1. In the SageMaker AI console, select **HyperPod Clusters > Cluster Management > Create HyperPod cluster**
2. Select **Orchestrated by Amazon EKS**
3. Select **Quick setup** (default networking/storage/IAM) or **Custom setup** (integration with existing VPC)
4. In **Orchestration**, create a new EKS cluster or connect an existing one. Confirm the **Use default Helm charts and add-ons** option is selected (automatically installs the Inference Operator)
5. Add a `ml.p6-b300.48xlarge` worker group in **Instance groups**
6. Review the configuration and click **Submit**

#### Prerequisite 2: Secure capacity with a Flexible Training Plan

1. In the instance group configuration, select **Training plan** as the capacity source
2. Select an existing plan containing `ml.p6-b300.48xlarge` capacity or create a new reservation
3. Match the **Target Availability Zone** to the zone where the Training Plan capacity is allocated

Once the cluster is in `Active` status and the p6-b300 nodes are healthy, you are ready to deploy.

#### Deployment Manifest

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

The Inference Operator handles Hugging Face download, container scheduling, health checks, and endpoint readiness.

**This vLLM argument set is the canonical version reused in all subsequent cloud sections.** In particular, `--tool-call-parser kimi_k3`, `--reasoning-parser kimi_k3`, and `VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION=1` are Kimi K3-specific; if omitted, tool calling and thinking mode will not work correctly.

### 3.2 Option B — Amazon EKS

1. **Provision the EKS cluster** — create VPC networking, managed node groups, and IAM roles/policies with Terraform modules
2. **Reserve GPU capacity with Capacity Blocks** — create a `p6-b300.48xlarge` Capacity Block reservation in the target AZ. When activated, the instances join as worker nodes
3. **Install GPU drivers and the device plugin** — NVIDIA device plugin
4. **Deploy the vLLM inference server** — apply the same argument set above, TP=8
5. **Expose the endpoint** — expose port 8000 via Service (LoadBalancer) or Ingress
6. **Verification** — send test requests

See the [AI on EKS Kimi K3 recipe](https://github.com/awslabs/ai-on-eks/tree/main/infra/solutions/inference-ready-cluster/recipes/kimi-k3) for the full Terraform modules and Helm values.

---

## 4. Microsoft Azure Deployment (Getting Started)

From here on, the real grind begins.

### 4.1 Infrastructure Specs

`Standard_ND128isr_GB300_v6` (ND GB300 v6 series):

| Item | Spec |
|------|------|
| GPU | 4× NVIDIA Blackwell Ultra B300 (288 GB HBM3E) |
| CPU | 2× NVIDIA Grace (ARM64), 128 vCPU |
| System memory | 864 GB LPDDR |
| Local storage | 4× NVMe, 16 TB |
| GPU interconnect | 5th-gen NVLink, 4× 1.8 TB/s |
| Scale-out | 800 Gb/s InfiniBand per GPU (Quantum-X800) |
| Rack configuration | 18 VMs per rack = 72 GPUs, in-rack NVLink 130 TB/s |
| Rack-level performance | up to 1.44 exaFLOPS (FP4) |

**Kimi K3 requires at least 2 VMs (8 GPUs, 2,304 GB).**

### 4.2 Prerequisites

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

> **Securing capacity**: ND GB300 v6 has a default quota of 0. In the Azure portal, request an increase of `Standard NDGB300v6 Family vCPUs` for your region under **Quotas > Compute**, and for persistent workloads, create a **Capacity Reservation Group** to pre-empt capacity. Approval takes several business days.

To get on Azure, you must have a long dialogue with your Azure account representative in advance. This part is the most important. The GPU may not be available in your desired region.

### 4.3 Pre-sync Weights to Azure Blob Storage (Strongly Recommended)

```bash
# Blob 컨테이너 생성 후, 클러스터와 동일 리전의 Job으로 다운로드
az storage container create --name kimi-k3-weights --account-name <STORAGE_ACCOUNT>
```

Since vLLM v0.18.0, RunAI Model Streamer natively supports the `az://` scheme, so with the standard `vllm/vllm-openai` image you can stream directly from Blob to GPU memory using only environment variables and workload identity binding. Compared to going through local disk, the loading step is greatly shortened, and at the 1.56 TB scale the difference is especially large.

### 4.4 vLLM Multi-Node Deployment (LeaderWorkerSet)

With 4 GPUs per VM, a TP=8 configuration spanning 2 nodes is required. Use the Kubernetes **LeaderWorkerSet (LWS)** API.

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

> `initialDelaySeconds: 900` accounts for the 1.56 TB weight loading. If you download directly from Hugging Face instead of using Blob streaming, you must set this much higher; otherwise the pod will restart repeatedly due to readiness failures.

### 4.5 Alternative — Azure Machine Learning Managed Online Endpoint

To reduce the Kubernetes operations burden, you can deploy to an AML managed endpoint as a custom container. However, as of now ND GB300 v6 may not be in the list of SKUs supported by AML managed online endpoints, so you must verify before deploying. As an alternative, using **Azure ML Kubernetes compute (AKS attach)** lets you manage the AKS setup above from an AML workspace.

### 4.6 Azure Cleanup

```bash
kubectl delete -f kimi-k3-azure.yaml
az aks nodepool delete --resource-group rg-kimi-k3 --cluster-name aks-kimi-k3 --name gb300pool
az group delete --name rg-kimi-k3 --yes
```

You must delete the Capacity Reservation Group separately for billing to stop.

---

## 5. Google Cloud Platform Deployment (Getting Started)

Deploying on GCP has a similar difficulty to Azure. Standing up at least 2 Blackwell nodes is no small task.

### 5.1 Infrastructure Specs

`a4x-maxgpu-4g-metal` (A4X Max):

| Item | Spec |
|------|------|
| GPU | 4× NVIDIA GB300 Grace Blackwell Ultra Superchip (`nvidia-gb300`) |
| CPU | 2× NVIDIA Grace (ARM Neoverse V2) |
| Provisioning type | **bare metal instance** |
| Interconnect | NVLink-C2C, rack-scale GB300 NVL72 (72 GPU / 36 Grace CPU) |
| Max node pool size | 18 nodes (rack unit) |
| Requirement | capacity Reservation mandatory |
| Networking | GPUDirect RDMA + MNNVL, DRANET required |

**Kimi K3 requires at least 2 nodes (8 GPUs, 2,304 GB).**

### 5.2 Prerequisites

You cannot create instances without a capacity reservation. Secure an A4X Max reservation through your Google Cloud sales representative or via **Compute Engine > Reservations** in the console. Reservations are organized in block / sub-block units.

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

Key points

- `a4x-maxgpu-4g-metal` does **not support multi-networking**; instead it uses the accelerator network profile and DRANET.
- Due to the rack structure, the node count must be **18 nodes or fewer**.
- The reservation path specifying `--reservation-affinity=specific` down to the sub-block is mandatory.

### 5.3 Pre-sync Weights to GCS

```bash
gcloud storage buckets create gs://kimi-k3-weights --location=${REGION}
```

Loading via the GCS FUSE CSI driver or the `gs://` path in vLLM's RunAI Model Streamer greatly reduces startup time compared to downloading directly from Hugging Face.

### 5.4 vLLM Multi-Node Deployment

Use the same LeaderWorkerSet pattern as in the Azure section, adjusting only the node selector and resource keys for GKE.

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

### 5.5 GKE Inference Gateway Integration (Recommended)

GKE Inference Gateway provides **prefix-aware load balancing** to improve TTFT (Time to First Token). For workloads like Kimi K3 that combine a 1-million-token context with prefix caching, the perceived benefit is large. It also supports NVIDIA NeMo Guardrails integration.

```bash
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api-inference-extension/releases/latest/download/manifests.yaml
```

### 5.6 Alternative — Vertex AI Prediction

You can deploy a custom container to a Vertex AI endpoint. However, **the A4X (`a4x-highgpu-4g`) family forces a minimum of 18 replicas due to rack-unit purchasing**. In other words, choosing the Vertex AI managed path means you pay for the entire rack even if you only want to serve a single Kimi K3 instance. For small-scale pilots, the GKE path is overwhelmingly more advantageous.

### 5.7 GCP Cleanup

```bash
kubectl delete -f kimi-k3-gcp.yaml
gcloud container node-pools delete a4x-max-pool --cluster=${CLUSTER_NAME} --location=${REGION}
gcloud container clusters delete ${CLUSTER_NAME} --location=${REGION}
```

You must release the Reservation separately for billing to stop.

---

## 6. Alibaba Cloud Deployment (Getting Started)

### 6.1 Considerations for Region and Hardware Selection

Alibaba Cloud is a different situation from the previous three clouds. Complexity is high depending on mainland China vs. overseas regions. Getting onto Lingjun is still being tested, but there's no telling when it will happen.

- **Export control impact**: Blackwell Ultra B300-series GPUs cannot be procured in mainland China regions. Therefore, B300-based configurations can only be considered in **regions outside China, such as Singapore**, and even then, individual confirmation via a sales representative is required.
- **Realistic configurations**: In mainland regions, a realistic setup is 2 nodes with 8 H200-class GPUs each (16× H200 = 2,256 GB), or a multi-node configuration via 灵骏 (Lingjun) intelligent computing resources.
- **gn8v family**: Offers 1/2/4/8-GPU configurations, with 8-GPU supporting NVLink interconnect. **Available only in some regions, and requires contacting a sales representative.**
- If you need confidential computing, you can consider `gn8v-tee` (Intel TDX + NVIDIA CC), but you must separately measure the performance overhead.

### 6.2 Option A — PAI-EAS (Model Gallery / Custom Deployment)

PAI-EAS integrates support for vLLM, SGLang, and its in-house BladeLLM engine, and offers one-click **expert parallel (EP) + Prefill-Decode separated deployment for MoE models**. For a model with 896 experts like Kimi K3, EP+PD separation provides meaningful benefits in both throughput and cost.

**Deployment procedure:**

1. Log in to the PAI console and select the target region. **Distributed deployment requires 灵骏 intelligent computing resources, and VPC configuration is mandatory.**
2. Select **模型在线服务 (EAS) > 部署服务 > 自定义部署**
3. In the deployment method, select **镜像部署 (image deployment)** and specify `vllm/vllm-openai:kimi-k3` (an internal ACR mirror is recommended)
4. Specify an OSS bucket path as the model source (upload weights in advance)
5. In the resource configuration, specify the 灵骏 resource quota and multiple nodes (≥2)
6. Enter the following as the run command:

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

7. Add the environment variable `VLLM_ENABLE_K3_LATENT_MOE_TAIL_FUSION=1`
8. Set port 8000, and in service features specify autoscaling and the GPU driver version
9. After deployment, invoke via the Endpoint and Token

PAI-EAS supports **autoscaling based on QPS and GPU utilization, as well as scale-to-zero**. For a model like Kimi K3 with extremely high idle cost, this feature is especially valuable. However, a cold start reloads the 1.56 TB weights, so apply scale-to-zero only after measuring your real traffic patterns.

### 6.3 Option B — ACK (Container Service for Kubernetes)

To operate Kubernetes directly, use the ACK + `ack-kserve` + Arena combination.

```bash
# 1. GPU 클러스터 생성 (클러스터 버전 1.22 이상, CUDA 12.0 이상)
#    콘솔 또는 aliyun CLI 사용

# 2. GPU 노드풀에 드라이버 버전 라벨 지정
kubectl label node <NODE> ack.aliyun.com/nvidia-driver-version=<VERSION>

# 3. ack-kserve 컴포넌트 설치 (콘솔 > 应用 > 云原生AI套件)

# 4. Arena 클라이언트 구성 (0.9.15 이상)
arena version
```

For deployment, use the same LeaderWorkerSet as Azure/GCP or the KServe `InferenceService` pattern, and mount OSS or NAS as a PVC for storage.

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

### 6.4 Alibaba Cloud Cleanup

- EAS services **stop billing immediately upon stop**. They keep billing even while idle, so be sure to stop or delete them after development and testing.
- For ACK, delete the node pool first, then the cluster
- The 灵骏 resource quota must be separately cancelled per the contract terms
- Don't forget the storage cost of the weights (1.56 TB) left in OSS

---

## 7. Endpoint Invocation (Common)

Regardless of the deployment method, an OpenAI-compatible API is exposed.

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

### Deployment Verification Checklist

```bash
# 1. 모델 등록 확인
curl http://<ENDPOINT_URL>:8000/v1/models

# 2. 헬스 체크
curl http://<ENDPOINT_URL>:8000/health

# 3. 도구 호출 파서 동작 확인 (tools 파라미터 포함 요청)
# 4. thinking 모드 출력에 reasoning_content 필드가 포함되는지 확인
# 5. 장문 컨텍스트 처리 확인 (100만 토큰 상한, prefix caching 적중률 모니터링)
```

Items 3–5 verify that the Kimi K3-specific arguments were applied correctly. If only items 1–2 pass but 3–5 fail, re-check the `--tool-call-parser` / `--reasoning-parser` / environment variable settings.

---

## 8. Cloud Selection Criteria

| Criterion | Recommendation |
|-----------|------|
| Fastest PoC, minimal operations burden | **AWS HyperPod** — self-contained on a single node, the Inference Operator abstracts most of it |
| Existing Kubernetes operations capability | AWS EKS or GKE |
| Highest inference throughput, long-context optimization | **GCP A4X Max + Inference Gateway** — MNNVL + prefix-aware routing |
| Existing Microsoft stack integration, enterprise governance | **Azure AKS + ND GB300 v6** |
| Chinese-language services, low idle cost, MoE-specific optimization | **Alibaba PAI-EAS** — EP+PD separation, scale-to-zero |
| Minimize small-pilot cost | Avoid Vertex AI (minimum 18 replicas). GKE direct deployment recommended |

**A sober assessment from a cost perspective**: As of July 2026, an 8× B300 node costs roughly USD 59–142 per hour, or USD 43,000–104,000 per month when running continuously. A 16× H200 configuration runs at roughly USD 46,000–117,000 per month. If traffic is concentrated in a few hours a day, or you're in an experimental phase, it's more reasonable to use Moonshot's official API or a third-party router than self-hosting. **The legitimate reasons to self-deploy are usually not throughput but three things: data sovereignty, latency SLAs, and custom fine-tuning.** If none of these apply, even the deployment itself is hard for an individual to bear.

Moonshot AI, I extend my highest respect and admiration to your outstanding development team.

Moonshot AI，我向你们卓越的开发团队致以最崇高的敬意与赞叹。

May you shine as brilliantly as the sun in the sky, hold your dreams close, journey forward riding the starlight, and finally fly to that distant bright moon.

愿你们如苍穹中的太阳般璀璨耀眼，怀抱梦想，乘着星光一路前行，最终飞向那轮遥远的明月。

May your light illuminate the future of AI. 🌞🌙🚀

愿你们的光芒，照亮 AI 的未来。🌞🌙🚀

---

## 9. References

### Original (AWS)

- [Deploying Kimi K3 on Amazon SageMaker HyperPod and Amazon EKS](https://aws.amazon.com/ko/blogs/machine-learning/deploying-kimi-k3-on-amazon-sagemaker-hyperpod-and-amazon-eks/)
- [SageMaker HyperPod Kimi K3 example YAML](https://github.com/aws-samples/sagemaker-genai-hosting-examples/blob/main/SageMakerHyperpod/kimi-k3/kimi-k3.yaml)
- [AI on EKS Kimi K3 recipe](https://github.com/awslabs/ai-on-eks/tree/main/infra/solutions/inference-ready-cluster/recipes/kimi-k3)
- [AI on EKS Helm values (vLLM B300)](https://github.com/awslabs/ai-on-eks-charts/blob/main/charts/inference-charts/values-kimi-k3-vllm-b300.yaml)
- [SageMaker HyperPod cluster creation documentation](https://docs.aws.amazon.com/sagemaker/latest/dg/sagemaker-hyperpod-eks-operate-console-ui-create-cluster.html)
- [Amazon EC2 pricing page](https://aws.amazon.com/ec2/pricing/)

### Microsoft Azure

- [ND GB300-v6 size series documentation](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/gpu-accelerated/nd-gb300-v6-series)
- [Azure ND GB300 v6 general availability announcement](https://techcommunity.microsoft.com/blog/azurehighperformancecomputingblog/azure-nd-gb300-v6-now-generally-available---hyper-optimized-for-generative-and-a/4469475)
- [NVIDIA GB300 NVL72 large-scale cluster announcement](https://azure.microsoft.com/en-us/blog/microsoft-azure-delivers-the-first-large-scale-cluster-with-nvidia-gb300-nvl72-for-openai-workloads/)
- [Streaming Blob weights with RunAI Model Streamer on AKS](https://blog.aks.azure.com/2026/07/13/runai-streamer-vllm)
- [Tutorial: deploying open models on Azure AKS with KAITO](https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/deploying-openai%E2%80%99s-first-open-source-model-on-azure-aks-with-kaito/4444234)
- [Azure VM quota check](https://learn.microsoft.com/en-us/azure/virtual-machines/quotas)

### Google Cloud Platform

- [A4X Max GKE custom cluster creation documentation](https://docs.cloud.google.com/ai-hypercomputer/docs/create/gke-ai-hypercompute-custom-a4x-max)
- [AI Hypercomputer GPU machine types](https://docs.cloud.google.com/ai-hypercomputer/docs/gpu)
- [Accelerator-optimized machine families](https://docs.cloud.google.com/compute/docs/accelerator-optimized-machines)
- [A4X Max launch and expanded NVIDIA partnership announcement](https://cloud.google.com/blog/products/compute/now-shipping-a4x-max-vertex-ai-training-and-more/)
- [Vertex AI inference compute resource configuration](https://docs.cloud.google.com/vertex-ai/docs/predictions/configure-compute)
- [Serving open models with vLLM on GKE](https://docs.cloud.google.com/kubernetes-engine/docs/tutorials/serve-gemma-gpu-vllm)

### Alibaba Cloud

- [Deploying large language models on PAI-EAS](https://help.aliyun.com/zh/pai/deploy-an-llm/)
- [PAI-EAS product page](https://cn.aliyun.com/product/bigdata/learn/eas)
- [PAI console custom deployment parameter descriptions](https://help.aliyun.com/zh/pai/user-guide/model-service-deployment-by-using-the-pai-console/)
- [Deploying a vLLM inference application on ACK](https://www.alibabacloud.com/help/zh/ack/cloud-native-ai-suite/user-guide/deploy-a-vllm-inference-application)
- [GPU-accelerated compute-optimized instance families (gn/ebm/scc)](https://www.alibabacloud.com/help/en/egs/gpu-accelerated-compute-optimized-instance-families)

### Model and Engine

- [Kimi K3 on Hugging Face](https://huggingface.co/moonshotai/Kimi-K3)
- [Kimi K3 Quickstart (Moonshot AI)](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart)
- [vLLM documentation](https://docs.vllm.ai/)
- [LeaderWorkerSet API](https://github.com/kubernetes-sigs/lws)

---

## Appendix: Items to Re-verify When Porting

The manifests in the Azure / GCP / Alibaba sections were ported to each platform's standard deployment pattern while keeping the vLLM arguments from the AWS official example intact. Before applying in a production environment, verify the following:

1. **Container image architecture** — check arm64 support with `docker manifest inspect vllm/vllm-openai:kimi-k3`. If unsupported, a source build is required for Grace-based Azure/GCP.
2. **Validity of multi-node TP=8** — depending on whether NVLink across node boundaries (MNNVL) is exposed in the GB300 NVL72 environment, `TP=4 --pipeline-parallel-size 2` may be needed instead of `TP=8`.
3. **Result of the `--moe-backend auto` backend selection** — the automatic selection differs by hardware and vLLM commit, so check the actually selected backend in the logs.
4. **`fastsafetensors` loading path** — support differs when combined with direct object storage streaming.
5. **readiness probe timeout** — measure the actual 1.56 TB loading time and adjust accordingly. With the default values, it will almost certainly fail.
6. **Capacity procurement lead time** — Azure quota approval, GCP reservations, and Alibaba 灵骏 contracts all take from several business days to several weeks. The real critical path for your deployment schedule is not technology but capacity procurement.
