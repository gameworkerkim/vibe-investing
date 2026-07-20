# Oracle Cloud Free Tier (OCI Free Tier) Guide (English)

*May 2026 · Korean user perspective · Always Free focused*

---

## 1. Why OCI Free Tier?

OCI's free tier offers the largest resource allocation in the industry with no time limit. Compared to equivalent AWS and GCP free tiers, the difference is stark.

| Item | OCI Always Free | AWS Free Tier (12 months) | GCP Always Free |
|---|---|---|---|
| Core VM | ARM Ampere A1 4 OCPU / 24 GB RAM | t2.micro / t3.micro 1 vCPU / 1 GB RAM | e2-micro 1 vCPU / 1 GB RAM |
| Instance splitting | Up to 4 instances | 1 instance | 1 instance |
| Additional x86 | E2.1.Micro 2 instances (1 OCPU / 1 GB) | — | — |
| Block storage | 200 GB | 30 GB EBS | 30 GB |
| Outbound traffic | 10 TB/month | 100 GB/month | 1 GB/month |
| Duration | Unlimited (Always Free) | 12 months | Unlimited |

The key isn't just ARM 4-core 24GB hardware — it's that **this is free forever**. It's effectively the only free cloud capable of running real workloads: personal VPNs, self-hosted AI agents, K3s clusters, lightweight LLM inference servers.

---

## 2. Two Free Tier Tracks

Signing up provides two types of free resources simultaneously. Confusing them can result in charges.

| Type | Always Free | Free Trial |
|---|---|---|
| Duration | Unlimited | 30 days from signup |
| Limits | Fixed resource list (see §3) | $300 USD credit |
| After expiry | Continues as-is | Unused credit expires; only Always Free remains |
| Risk | Nearly none | Creating paid resources within 30 days can auto-bill after credit exhaustion |

**Principle**: If you don't want to be charged, only create resources labeled "Always Free Eligible" in the console for the first 30 days. After 30 days, paid resource creation is blocked (if staying on Always Free).

---

## 3. Always Free Resource Details

All limits below apply only within your chosen Home Region.

### 3.1 Compute

| Shape | Quantity | Specs | Notes |
|---|---|---|---|
| VM.Standard.A1.Flex (ARM Ampere) | Up to 4 | Total 4 OCPU / 24 GB RAM | 3,000 OCPU hours + 18,000 GB hours monthly. 4 OCPU x 24h x 31d = 2,976h, well within limits |
| VM.Standard.E2.1.Micro (AMD x86) | 2 | Each 1 OCPU / 1 GB RAM | For software incompatible with ARM |

Mix ARM and x86 for up to 6 concurrent instances. Total boot volumes must not exceed 200 GB.

### 3.2 Storage

| Type | Limit |
|---|---|
| Block Volume (boot + additional) | 200 GB total, max 5 volumes |
| Block Volume Backup | 5 (stored in Object Storage) |
| Object Storage | Standard 10 GB + Infrequent Access 10 GB + Archive 10 GB, 50,000 API requests/month (S3 compatible) |

### 3.3 Database

| Type | Limit |
|---|---|
| Autonomous Database (ATP/ADW/JSON) | 2 instances, each 1 OCPU / 20 GB |
| NoSQL Database | Phoenix region only |

### 3.4 Networking & Other

- Flexible Load Balancer: 1 (10 Mbps)
- Network Load Balancer: 1
- VCN, Site-to-Site VPN: Unlimited
- Outbound traffic: 10 TB/month
- Vault, Bastions, Monitoring, Logging: Basic usage free
- Email Delivery: 200/day

---

## 4. Sign-Up Process (Korean Users)

### 4.1 Prerequisites

| Item | Recommendation |
|---|---|
| Card | Newly issued VISA/Master **credit or debit card** |
| Not accepted | PIN debit, **prepaid cards, virtual cards, disposable cards** (Oracle explicitly rejects) |
| Email | Address never used for OCI Free Tier or previous Free Trial |
| Phone | Number never used for OCI (SMS verification required) |
| Address (English) | Accurate romanized street address (masking/modifying causes rejection) |

OCI identifies duplicate signups by email + phone + card number combination. A card can be reused a limited number of times, but using a new card is safer. **Most importantly, match the address exactly as registered with your card issuer.**

### 4.2 Steps

1. Go to https://www.oracle.com/cloud/free/ -> "Start for free"
2. Email verification -> Set password
3. **Account info**: Name must match cardholder name; address in accurate English
4. **Choose Home Region**: Once selected, cannot be changed. Korean users typically choose:
   - **Seoul (ap-seoul-1)**: Lowest latency, but ARM capacity frequently full
   - **Chuncheon (ap-chuncheon-1)**: Korea's second region, relatively more capacity
   - **Tokyo / Osaka**: 30-50ms latency, easier ARM capacity
   - For availability: Chuncheon or Osaka; for latency: Seoul
5. **Phone verification**: 010-1234-5678 -> enter `1012345678` (drop leading 0)
6. **Card registration**: $1 authorization hold that is immediately reversed. No actual charge
7. Accept terms -> "Complete Sign-up"

### 4.3 If Sign-Up Fails

"Transaction processing error" is the most common message. Causes are usually:

- Card declined (many Korea-issued cards rejected)
- IP/location mismatch (turn off VPN)
- Repeated retries with same email/phone/card -> blocked
- Address doesn't match card registration address

**Resolution order**:
1. Retry immediately with a different card (don't repeat with same info)
2. Contact [Oracle Cloud Customer Service](https://www.oracle.com/cloud/contact.html) chat or form
3. If still failing, sign up with new email + new phone + new card combination
4. Facebook "Oracle Cloud KR User Group" has active Oracle Korea employees who can help with rejections

---

## 5. ARM Instance Creation: "Out of host capacity" Workaround

The biggest real-world pitfall of OCI Free Tier. Korean and Tokyo regions are almost always at full ARM A1 allocation.

### 5.1 Recommended Settings

| Item | Recommendation |
|---|---|
| Image | Canonical Ubuntu 24.04 Minimal **aarch64** |
| Shape | VM.Standard.A1.Flex |
| OCPU/RAM | **2 OCPU / 12 GB** (easier to get than 4 OCPU) |
| Boot Volume | 47-50 GB (default) |
| SSH Key | Local `~/.ssh/id_ed25519.pub` or console key pair (download private key immediately) |
| Public IP | Check "Assign a public IPv4 address" |

### 5.2 Capacity Acquisition Strategies (by effectiveness)

1. **Reduce OCPU from 4 to 2**: 4 OCPU requests almost always fail. Split into 2 instances at 2 OCPU each — same total resources, much higher success rate.
2. **Try at dawn (KST 02:00-06:00)**: Resource reclamation occurs during low-activity hours.
3. **Change Availability Domain**: Try AD-1, AD-2, AD-3 separately. Capacity varies by AD within the same region.
4. **Auto-retry scripts**: OSS like `hitrov/oci-arm-host-capacity` on GitHub polls the OCI API and creates instances the moment capacity opens up. Requires your OCI API key.
5. **Switch to PAYG**: Numerous reports that switching to pay-as-you-go raises ARM capacity priority. Still $0 within Always Free limits, but **accidentally creating paid resources will incur charges** — set console alerts for unused paid services.

### 5.3 If Still Can't Get One

- Create a VM.Standard.E2.1.Micro (AMD) instance first. Instantly created. Try ARM later.
- To change Home Region, you must create a new account. Already-signed-up accounts can't change their Home Region.

---

## 6. Basic Security & Operations Setup

### 6.1 Networking

OCI **blocks all inbound traffic by default**. Unlike AWS Security Groups, two layers must be opened:

1. **VCN Security List**: Console -> Networking -> Virtual Cloud Networks -> select VCN -> Security Lists -> Default Security List -> Ingress Rules: add 80/443/needed ports
2. **Instance OS iptables**: Ubuntu images have iptables enabled for additional blocking. Check and open:

```bash
sudo iptables -L INPUT -n --line-numbers
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

Both steps must be completed or external access won't work.

### 6.2 SSH Access

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@<public-ip>
# Oracle Linux images use opc instead of ubuntu
```

### 6.3 Avoiding Idle Reclamation

Always Free instances are reclaimed when:
- 7-day CPU 95th percentile **below 20%** AND
- 7-day network usage 95th percentile **below 20%** AND
- 7-day memory usage 95th percentile **below 20%**

All three must be simultaneously true, so typical self-hosted workloads (blogs, VPNs, bots) are safe. For truly idle learning VMs, generate artificial load:

```bash
# /etc/cron.d/keepalive — 1 minute of CPU load every hour
0 * * * * root timeout 60 yes > /dev/null
```

### 6.4 Billing Alert Setup (Essential)

Console -> Billing -> Budgets: create a $1 limit budget. Set email alerts at 50%, 80%, 100% thresholds. Especially important when on PAYG.

---

## 7. Common Korean User Pitfalls

| Pitfall | Consequence | Avoidance |
|---|---|---|
| VPN on during signup | Location mismatch -> rejection | Turn off VPN for signup, re-enable after |
| Prepaid/virtual card | Rejection | Use VISA/Master credit or debit |
| Repeated retries with same info | Possible permanent block | Switch info after 1-2 tries |
| Requesting 4 OCPU at once | Infinite "out of capacity" | Split into 2 OCPU x 2 instances |
| Only opening Security List, not iptables | External access blocked | Configure both |
| Docker containers with crypto miners | Immediate permanent account ban | Only use trusted images; verify even from official hub |
| Creating paid resources during 30-day trial | Auto-billing after $300 credit exhaustion | Only use "Always Free Eligible" labeled resources |
| Wrong Home Region choice | Cannot change; need new account | Recommend Chuncheon/Osaka |

---

## 8. Recommended Use Cases

Real workloads possible on ARM 4 OCPU / 24 GB:

| Use | Configuration | Notes |
|---|---|---|
| Personal VPN | WireGuard alone | 1 OCPU sufficient, 10 TB traffic |
| Blog/Homepage | Nginx + WordPress + MariaDB | 1 OCPU / 6 GB |
| K3s Cluster | 1 control plane + 3 workers (1 OCPU / 6 GB each) | Kubernetes learning |
| Self-hosted AI | Ollama + 7B/8B quantized models | 8-20 tokens/s, full 4 OCPU |
| Automation Workflow | n8n + Postgres (Docker Compose) | Verify ARM-compatible images |
| Game Server | Minecraft Java + GeyserMC | 2 OCPU / 12 GB recommended |
| Personal DNS/Ad Block | AdGuard Home / Pi-hole | Almost no resources |

ARM compatibility: Most OSS provides multi-arch images. However, **some proprietary or old Docker images are amd64-only** — check platform options on `docker pull`. As a last resort, run on E2.1.Micro x86 instances.

---

## 9. PAYG (Pay-As-You-Go) Conversion Considerations

**Benefits**:
- Easier ARM A1 capacity acquisition
- Access to paid services (AI/ML, high-performance networking)
- Official customer support case registration
- Always Free resources remain free

**Risks**:
- Accidentally creating non-"Always Free Eligible" resources incurs immediate charges
- Boot volume exceeding 200 GB incurs overage charges
- Traffic exceeding 10 TB incurs overage charges

**Decision criterion**: Only convert if you absolutely need ARM instances in Korea/Tokyo regions and automated scripts still can't secure them. Otherwise, stay on Always Free.

---

## 10. Reference Links

- Official docs: https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm
- Korean FAQ: https://www.oracle.com/kr/cloud/free/faq/
- Korean user guide: http://taewan.kim/oci_docs/ (Kim Taewan)
- ARM auto-create script: https://github.com/hitrov/oci-arm-host-capacity
- Korean user group: Facebook "Oracle Cloud KR User Group"

---

*This document assumes Always Free limits only. Paid resource usage requires separate evaluation.*
