# Python SaaS 무료 호스팅 플랫폼 비교 (2026년 7월 기준)

> 원본 문서를 기반으로 2026년 7월 현재 각 플랫폼의 실제 무료 티어 정책을 검증·반영한 개정판입니다.
> 원본 대비 정정 사항과 추가 사항은 문서 하단에 별도로 정리했습니다.

---

## 1. 요약: 2026년 무료 티어의 현실

2022년 이후 PaaS 업계 전반에서 영구 무료 티어가 순차적으로 폐지되었습니다.

| 연도 | 사건 |
| :--- | :--- |
| 2022년 11월 | Heroku 무료 플랜 종료 (최저 Eco $5/월) |
| 2023년 8월 | Railway 영구 무료 티어 폐지, 1회성 $5 트라이얼 체제로 전환 |
| 2024년 10월 | Fly.io 신규 가입자 대상 무료 리소스 할당 폐지 |
| 2025년 9월 | Render 무료 서비스 슬립 시간 단축 (30분 → 15분) |

따라서 2026년 현재 **"진짜 영구 무료"로 Python 웹 서비스를 상시 운영할 수 있는 선택지는 Render와 PythonAnywhere 정도**이며, 나머지는 트라이얼 크레딧 또는 조건부 무료입니다.

---

## 2. 플랫폼별 비교표

| 플랫폼 | 무료 티어 현황 (2026) | 장점 | 단점 / 제약 |
| :--- | :--- | :--- | :--- |
| **Render** | 영구 무료 티어 유지. 워크스페이스당 750 인스턴스 시간/월, 512MB RAM, 0.1 vCPU, 대역폭 100GB/월, 빌드 500분/월. 카드 등록 불필요 | 웹 서버 + PostgreSQL + Redis(Key Value) + Cron을 한 곳에서 관리. Git 연동 자동 배포. Heroku 대체재 중 가장 무난 | 15분 무트래픽 시 슬립, 콜드 스타트 30~60초. **무료 PostgreSQL은 1GB, 생성 후 30일 만료** (만료 후 14일 내 미업그레이드 시 데이터 삭제). 셀프 핑으로 슬립을 회피하는 방식은 정책 위반 소지 |
| **PythonAnywhere** | 영구 무료 티어 유지. 디스크 512MB, 웹앱 1개(`username.pythonanywhere.com`) | 웹 IDE 제공으로 브라우저에서 바로 코딩·배포. Django/Flask(WSGI) 최적화. 입문자에게 가장 진입장벽이 낮음 | 외부 네트워크 접근이 화이트리스트 도메인으로 제한. 커스텀 도메인 불가. ASGI(FastAPI 등) 지원은 베타 단계로 제한적 |
| **Vercel** | Hobby 플랜 무료(단, **개인·비상업 용도 한정**). Fluid Compute 기본 적용, Active CPU 과금(무료 한도 내) | FastAPI 제로 컨피그 배포 공식 지원(2025년 9월~). I/O 대기 시간은 과금하지 않는 Active CPU 모델. 프리뷰 배포 등 DX 최상급. Next.js 프론트 + Python API 조합에 강함 | 함수 실행 시간 제한 존재(maxDuration 설정 필요). WebSocket 등 지속 연결에 부적합. 상업 서비스는 Hobby 플랜 약관 위반 |
| **Fly.io** | **신규 가입자 무료 티어 없음.** 소액 트라이얼 크레딧 후 종량제(pay-as-you-go). 레거시 플랜 계정만 기존 무료 할당(공유 VM 3대 등) 유지 | 30개 이상 리전에 컨테이너 배치, 글로벌 저지연. WebSocket·상시 연결 지원. 최소 VM은 월 $2 수준으로 저렴 | 무료가 아님. Dockerfile 등 DevOps 역량 필요. 이그레스 종량 과금(아시아 $0.04/GB)으로 비용 예측이 어려움. 레거시 플랜에서 이탈하면 복귀 불가 |
| **Railway** | **영구 무료 티어 없음.** 가입 시 1회성 $5 트라이얼 크레딧(30일). 이후 최소 Hobby $5/월 + 종량 과금 | 템플릿 기반 초고속 프로비저닝. 프레임워크 자동 감지, Git push 배포. DB 프로비저닝 간편 | 트라이얼 소진 후 유료 전환 필수. 초 단위 종량 과금으로 예상보다 청구액이 커지는 사례 빈번. 고급 네트워크 설정·컴플라이언스 요건에는 부적합 |
| **Heroku** | 무료 플랜 없음(2022년 11월 종료). 최저 Eco $5/월(1,000 dyno 시간, 슬립 있음) | 성숙한 생태계, 방대한 애드온과 문서. 안정성 검증 완료 | 최저 플랜조차 결제 정보 필수. 무료 비교 대상에서 제외 |

---

## 3. 추가 검토 대상 (원본에 없던 대안)

| 플랫폼 | 무료 티어 | 적합 용도 |
| :--- | :--- | :--- |
| **Google Cloud Run** | 월 200만 요청, vCPU·메모리 무료 할당(카드 등록 필요) | 컨테이너 기반 Python API. scale-to-zero로 소규모 SaaS에 사실상 무료 |
| **Koyeb** | 소규모 무료 인스턴스 제공 | Render 유사 PaaS. 유럽 리전 중심 |
| **Cloudflare Workers** | 일 10만 요청 무료, D1(SQLite)·R2 무료 할당 포함 | Python Workers는 베타 단계라 성숙도 주의. 엣지 API에 적합 |
| **Hugging Face Spaces** | CPU 인스턴스 무료 | Gradio/Streamlit 기반 데모, ML 프로토타입 |
| **Oracle Cloud Always Free** | ARM VM(4 OCPU/24GB) 영구 무료 | 사실상 무료 VPS. 직접 운영 부담은 가장 큼 |

---

## 4. 선택 가이드

1. **가장 쉽고 빠르게 풀스택 MVP**: Render. 단, 무료 PostgreSQL의 30일 만료를 반드시 인지하고, 데이터가 중요하면 처음부터 Starter($7/월) 이상 또는 외부 무료 DB(Neon, Supabase 등)를 결합할 것.
2. **Python 입문·교육용**: PythonAnywhere. Django/Flask 학습에는 여전히 최적. FastAPI 중심이라면 부적합.
3. **Next.js 프론트 + Python API**: Vercel. FastAPI 제로 컨피그 지원으로 원본 작성 시점보다 Python 백엔드 적합성이 크게 개선됨. 단 비상업 용도 제한과 지속 연결 불가는 유효.
4. **글로벌 저지연·WebSocket**: Fly.io. 다만 이제 "무료 대안"이 아니라 "저렴한 유료 대안"으로 분류해야 하며, 월 $5~20 예산을 전제로 검토.
5. **빠른 프로토타이핑 후 유료 전환 전제**: Railway. $5 트라이얼로 검증 후 Hobby로 자연스럽게 이관하는 흐름.
6. **비용 0원 상시 가동이 최우선**: Google Cloud Run(scale-to-zero) 또는 Oracle Always Free VM.

---

## 5. 원본 문서 대비 정정 사항

| # | 원본 서술 | 정정 내용 | 심각도 |
| :--- | :--- | :--- | :--- |
| 1 | Railway: "무료 티어 내에서는 사용한 만큼 비용이 발생하여 효율적" | 영구 무료 티어는 2023년 8월 폐지. 현재는 1회성 $5 트라이얼(30일)뿐이며, 이후 최소 Hobby $5/월. "무료 티어" 항목으로 소개하는 것 자체가 부정확 | 높음 |
| 2 | Fly.io: "관대한 무료 티어 제공" | 2024년 10월 신규 가입자 대상 무료 할당 전면 폐지. 레거시 플랜 계정만 기존 혜택 유지. 신규 사용자는 소액 크레딧 후 전면 종량제 | 높음 |
| 3 | Render: "일정 시간 사용하지 않으면 슬립 상태로 전환될 수 있음" | 추정이 아닌 확정 사양. 15분 무트래픽 시 슬립(2025년 9월 30분에서 단축), 콜드 스타트 30~60초, 월 750시간 한도 | 중간 |
| 4 | Render 단점에 무료 DB 만료 미기재 | 무료 PostgreSQL은 생성 후 30일 만료. SaaS 운영 관점에서 슬립보다 치명적인 제약이므로 필수 기재 | 높음 |
| 5 | PythonAnywhere: "저장 공간 500MB" | 512MB가 정확한 수치. 또한 "비동기(ASGI)에 취약"은 유효하나, ASGI 베타 지원이 시작된 점은 반영 필요 | 낮음 |
| 6 | Vercel: "장시간 실행되는 Python 작업에 부적합" | 방향은 유효하나 구식 서술. Fluid Compute 도입(2025)으로 FastAPI 제로 컨피그 지원, Active CPU 과금(I/O 대기 무과금), maxDuration 조정 가능. WebSocket 제약과 Hobby 플랜의 비상업 용도 제한은 여전히 유효하므로 이쪽을 핵심 단점으로 기재 | 중간 |
| 7 | Heroku: "2022년부터 무료 플랜 중단" | 정확히는 2022년 11월 28일 종료. 최저 대안이 Eco $5/월이라는 점을 함께 기재하면 비교 맥락이 완성됨 | 낮음 |
| 8 | 전체: 무료 티어 3분류("영구 무료 / 관대한 무료 / 종료") | 2026년 기준 분류 자체가 붕괴. 실제 구도는 "영구 무료(Render, PythonAnywhere) / 조건부 무료(Vercel 비상업) / 트라이얼만 존재(Railway, Fly.io) / 무료 없음(Heroku)" | 높음 |

## 6. 원본 문서 대비 추가 제안

1. **업계 트렌드 섹션 추가**: Heroku → Railway → Fly.io로 이어진 무료 티어 폐지 흐름을 명시하면 "왜 지금 선택지가 이렇게 좁은가"에 대한 맥락이 생김.
2. **대안 플랫폼 추가**: Google Cloud Run, Koyeb, Cloudflare Workers, Hugging Face Spaces, Oracle Always Free. 특히 Cloud Run은 소규모 Python SaaS의 실질적 무료 운영 수단으로 비중 있게 다룰 가치가 있음.
3. **DB 전략 분리 서술**: 컴퓨트와 DB의 무료 정책이 별개로 움직이므로(예: Render 컴퓨트 무료 + DB 30일 만료), Neon/Supabase 등 무료 관리형 PostgreSQL과의 조합 패턴을 별도 항목으로 안내.
4. **슬립 회피 관련 주의 문구**: UptimeRobot 등으로 셀프 핑을 걸어 슬립을 우회하는 기법이 널리 공유되나, Render는 이를 비정상 트래픽으로 간주해 정지 대상이 될 수 있음을 명시.
5. **검증 일자 명기**: 무료 티어 정책은 분기 단위로 변동하므로 문서 상단에 "기준일"을 반드시 표기하고, 공식 pricing 페이지 링크를 참고 자료로 첨부.

---

## 참고 자료

- Render 공식 문서 (Deploy for Free): https://render.com/docs/free
- Render Pricing: https://render.com/pricing
- Vercel FastAPI 문서: https://vercel.com/docs/frameworks/backend/fastapi
- Vercel Fluid Compute: https://vercel.com/docs/fluid-compute
- Railway Pricing: https://railway.com/pricing
- Fly.io Pricing: https://fly.io/docs/about/pricing/
- PythonAnywhere Plans: https://www.pythonanywhere.com/pricing/

*기준일: 2026년 7월 19일. 무료 티어 정책은 수시로 변경되므로 배포 전 공식 페이지 재확인 권장.*
