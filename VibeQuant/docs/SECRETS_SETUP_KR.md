# 시크릿 키 설정 매뉴얼 (한국어)

VibeQuant용 **DeepSeek**, **Cloudflare**, **TOSS** 키 입력 방법입니다.  
스크립트는 키 값을 화면에 출력하지 않습니다. **커밋하지 마세요.** **채팅·이슈에 키를 붙여넣지 마세요.**

| 문서 | 언어 |
|---|---|
| [SECRETS_SETUP.md](SECRETS_SETUP.md) | English |
| 이 파일 | 한국어 |

관련: [SECURITY.md](../SECURITY.md) · [cloudflare/DEPLOY_KR.md](../cloudflare/DEPLOY_KR.md) · [LLM_QUANT_PROMPT.md](LLM_QUANT_PROMPT.md)

---

## 0. 작업 디렉터리

```bash
cd /Users/dennis/vibe-investing/VibeQuant/cloudflare
# 또는: cd <클론경로>/VibeQuant/cloudflare
```

---

## 1. 시크릿 목록

| 이름 | 저장 위치 | 용도 | 스크립트 |
|---|---|---|---|
| `DEEPSEEK_API_KEY` | Worker 시크릿 및/또는 `.dev.vars` | LLM Quant Prompt (DeepSeek V4 Pro / Flash) | `./scripts/setup-deepseek.sh` |
| `CLOUDFLARE_API_TOKEN` | **개발 PC / CI만** (`.dev.vars`) | `wrangler` 배포·`secret put` | `./scripts/setup-secrets.sh --local` |
| `CLOUDFLARE_ACCOUNT_ID` | `.dev.vars` + `wrangler.toml`의 `account_id` | 동일 | `./scripts/setup-secrets.sh --local` |
| `TOSS_CLIENT_ID` | Worker 시크릿 / `.dev.vars` | TOSS Open API (선택; IP 제한으로 후순위) | `./scripts/setup-secrets.sh` |
| `TOSS_CLIENT_SECRET` | Worker 시크릿 / `.dev.vars` | TOSS OAuth 시크릿 | `./scripts/setup-secrets.sh` |

위 키를 `pages/`나 브라우저 JS에 **넣지 마세요.**

| 위치 | 의미 |
|---|---|
| `cloudflare/.dev.vars` | 로컬 `wrangler dev`·스크립트용 (chmod 600, gitignore) |
| Worker 시크릿 (`wrangler secret put`) | 프로덕션 `vibequant-api` 런타임 |
| Pages / GitHub | API 키 **금지** |

---

## 2. 처음 설정 권장 순서

1. Cloudflare 토큰·계정 → 로컬 `.dev.vars`  
2. DeepSeek 키 → Worker (`--remote`) — 라이브 사이트용  
3. TOSS (선택) — IP/프록시 해결 후에만  

```bash
cd /Users/dennis/vibe-investing/VibeQuant/cloudflare
npm install

./scripts/setup-secrets.sh --local
./scripts/setup-deepseek.sh --remote
# 나중에 선택:
# ./scripts/setup-secrets.sh --remote
```

---

## 3. DeepSeek API 키

**발급:** https://platform.deepseek.com/api_keys  

키는 보통 `sk-…` 형태입니다. 대시보드에 보이는 **전체 문자열**을 사용하세요.  
스크립트가 `DEEPSEEK_API_KEY (hidden):`을 물으면 키를 붙여넣고 Enter.  
입력 중 화면에 글자가 안 보이는 것이 정상입니다.

### 3.1 프로덕션 (라이브 사이트 / Worker)

```bash
cd /Users/dennis/vibe-investing/VibeQuant/cloudflare
./scripts/setup-deepseek.sh --remote
# 또는: npm run setup-deepseek:remote
```

예시 화면:

```text
VibeQuant — DeepSeek API key
============================
Get key: https://platform.deepseek.com/api_keys

DEEPSEEK_API_KEY (hidden):
OK: DEEPSEEK_API_KEY uploaded to Worker secrets
```

`secret put` 후 **재배포는 필요 없습니다.** 다음 요청부터 적용됩니다.

### 3.2 로컬 wrangler

```bash
./scripts/setup-deepseek.sh --local
# 또는: npm run setup-deepseek
```

`.dev.vars`에 `DEEPSEEK_API_KEY=`를 추가/갱신합니다.

### 3.3 로컬 + 원격 동시

```bash
./scripts/setup-deepseek.sh --local --remote
# 또는: npm run setup-deepseek:all
```

### 3.4 확인

```bash
curl -sS https://vibequant-api.gameworker-4bb.workers.dev/api/health | python3 -m json.tool
```

기대 결과:

```json
"deepseek": { "configured": true }
```

Worker가 쓰는 모델:

| UI 선택 | API 모델 | 역할 |
|---|---|---|
| V4 Flash | `deepseek-v4-flash` | 기본 — 금융 게이트 + 퀀트 프롬프트 |
| V4 Pro | `deepseek-v4-pro` | 무거운 퀀트 답변 / 파이썬 생성 |

---

## 4. Cloudflare 배포 자격증명

노트북/CI에서 Wrangler 실행용입니다. Worker 런타임 시크릿으로 **올리지 않습니다.**

**토큰 발급:** https://dash.cloudflare.com/profile/api-tokens  

권장 Account 권한:

- Workers Scripts → Edit  
- D1 → Edit  
- Workers R2 Storage → Edit  
- Cloudflare Pages → Edit  
- Account Settings → Read  

**Account ID:** 대시보드 → Workers & Pages → Overview (오른쪽)

```bash
./scripts/setup-secrets.sh --local
```

`.dev.vars`(mode 600)를 쓰고 wrangler 설정에 `account_id`를 넣습니다.

---

## 5. TOSS Open API (선택 / 후순위)

Worker→TOSS 직통 실시간은 **후순위**입니다 (Cloudflare Free에 고정 egress IP 없음).  
데모 주 제공자는 Yahoo입니다. [WORKER_TOSS_IP.md](WORKER_TOSS_IP.md) 참고.

나중에 쓸 키만 미리 넣어 두려면:

```bash
./scripts/setup-secrets.sh --local    # TOSS 물음 — Enter로 건너뛰기 가능
./scripts/setup-secrets.sh --remote   # 설정돼 있으면 TOSS_* 업로드
```

포털: https://developers.tossinvest.com  

로컬 OAuth 확인 (IP 허용목록 때문에 실패할 수 있음):

```bash
./scripts/verify-toss.sh
```

---

## 6. 수동 `wrangler secret put` (고급)

헬퍼 스크립트 없이 넣을 때:

```bash
cd /Users/dennis/vibe-investing/VibeQuant/cloudflare
export CLOUDFLARE_API_TOKEN="…"   # 로컬 env / .dev.vars
export CLOUDFLARE_ACCOUNT_ID="…"

# 키 붙여넣기 후 Ctrl-D (EOF) — 값은 화면에 안 보임
npx wrangler secret put DEEPSEEK_API_KEY --config wrangler.toml
npx wrangler secret put TOSS_CLIENT_ID --config wrangler.toml
npx wrangler secret put TOSS_CLIENT_SECRET --config wrangler.toml

npx wrangler secret list --config wrangler.toml
```

---

## 7. 안전 체크리스트

- [ ] `.dev.vars`는 gitignore, 권한 `600`  
- [ ] pre-commit 훅 설치 (`scripts/install-pre-commit.sh`)  
- [ ] `pages/js/runtime-config.js`에는 API base URL만 (시크릿 없음)  
- [ ] 채팅·메일·공개 레포에 붙인 키는 폐기·재발급  
- [ ] LLM Quant Prompt 사용 전 `GET /api/health`에서 `deepseek.configured: true`  

---

## 8. 문제 해결

| 증상 | 조치 |
|---|---|
| 스크립트가 도움말만 출력 | `--local` 및/또는 `--remote` 붙이기 |
| 사이트에서 `DEEPSEEK_NOT_CONFIGURED` | `./scripts/setup-deepseek.sh --remote` |
| `wrangler secret put` 인증 오류 | `setup-secrets.sh --local`로 CF 토큰·계정 설정 |
| 금융 거부 / 30초 제한 | 설계상 동작 — [LLM_QUANT_PROMPT.md](LLM_QUANT_PROMPT.md) |
| TOSS가 항상 mock | Free Worker·고정 IP 없으면 정상 |

영문: [SECRETS_SETUP.md](SECRETS_SETUP.md)
