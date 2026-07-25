# Media-Column Fix History

2026-07-25 아카이브 재대조·복원 기록. `media-columns.csv` 130편 ↔ 로컬 `.md` 130편을 맞춘 뒤, 크롤이 불완전했던 본문을 원문과 대조해 고쳤다. 사이트 반영 커밋: [`90ef161`](https://github.com/gameworkerkim/vibe-investing/commit/90ef16105ea2130311fcc29a530d9f2bee5f7f21).

게시 위치: [docs.vibequant.cc/columns](https://docs.vibequant.cc/columns/) (`vibequant.cc/columns/` → 301).

## 무엇을 고쳤나

| 유형 | 건수 | 설명 |
|---|---|---|
| 도입부·본문 복원 | 22 | 주로 RPM9. 크롤이 2번째 문단부터 시작해 리드·중간 문단이 빠짐 |
| 크롤 잔여물 제거 | 7 | 게임톡·벤처스퀘어. `Facebook Twitter…`, 편집부 메일 등 |
| 말미 종결 정리 | 1 | 갤러리K. 전자신문 원문 자체도 말미가 잘려 `이루어져야 할 것이다.`로 종결만 정리 |

총 **30편** (커밋 `90ef161`의 `03. Media-Column/**` 변경분).

## 검증 방법

각 행의 세 링크를 열어 대조한다.

1. **원문** — 매체 게재본
2. **GitHub md** — 이 레포 아카이브
3. **docs** — [docs.vibequant.cc](https://docs.vibequant.cc/columns/) 게시본

### 빠른 스팟 체크

| 확인 포인트 | 원문 | GitHub | 사이트 |
|---|---|---|---|
| 유심 PIN — 도입부에 Jack Dorsey / SIM Swapping | [원문](https://www.rpm9.com/news/articleView.html?idxno=117482) | [md](Security/2022-04-26-스마트폰-유심에-비밀-번호를-설정하세요.md) | [docs](https://docs.vibequant.cc/columns/media-security-2022-04-26/) |
| 북한 가상화폐 — 잘렸던 본문 복원 | [원문](https://www.rpm9.com/news/articleView.html?idxno=119045) | [md](Security/2022-07-25-가상화폐를-노리는-불량국가-북한.md) | [docs](https://docs.vibequant.cc/columns/media-security-2022-07-25/) |
| 갤러리K — 말미 `이루어져야 할 것이다.` | [원문](https://www.etnews.com/20240923000070) | [md](Society-Culture/2024-09-23-미술-아트테크-갤러리K-사례와-투자-위험성.md) | [docs](https://docs.vibequant.cc/columns/media-society-culture-2024-09-23-k/) |

## 복원 목록

### 도입부·본문 복원 (RPM9 등)

| 발행일 | 제목 | 매체 | GitHub | 원문 | 사이트 |
|---|---|---|---|---|---|
| 2022-08-20 | 인공지능이 만드는 프로그램 개발의 혁신 | 전자신문(RPM9) | [md](AI/2022-08-20-인공지능이-만드는-프로그램-개발의-혁신.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=119334) | [docs](https://docs.vibequant.cc/columns/media-ai-2022-08-20/) |
| 2022-04-20 | 메타콩즈 사태로 보는 NFT 해킹과 미래 | 전자신문(RPM9) | [md](Blockchain-P2E/2022-04-20-메타콩즈-사태로-보는-NFT-해킹과-미래.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=117343) | [docs](https://docs.vibequant.cc/columns/media-blockchain-p2e-2022-04-20-nft/) |
| 2022-05-22 | 메인넷의 어려움과 NFT의 미래 | 전자신문(RPM9) | [md](Blockchain-P2E/2022-05-22-메인넷의-어려움과-NFT의-미래.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=118002) | [docs](https://docs.vibequant.cc/columns/media-blockchain-p2e-2022-05-22-nft/) |
| 2022-09-13 | P2E 산업, 공공의 적 | 전자신문(RPM9) | [md](Blockchain-P2E/2022-09-13-P2E-산업-공공의-적.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=119632) | [docs](https://docs.vibequant.cc/columns/media-blockchain-p2e-2022-09-13-p2e/) |
| 2022-09-24 | 메타콩즈의 이두희 사태의 본질과 해법 | 전자신문(RPM9) | [md](Blockchain-P2E/2022-09-24-메타콩즈의-이두희-사태의-본질과-해법.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=119788) | [docs](https://docs.vibequant.cc/columns/media-blockchain-p2e-2022-09-24/) |
| 2022-10-16 | 카카오톡 장애를 바라보는 블록체인의 철학 | 전자신문(RPM9) | [md](Blockchain-P2E/2022-10-16-카카오톡-장애를-바라보는-블록체인의-철학.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=119996) | [docs](https://docs.vibequant.cc/columns/media-blockchain-p2e-2022-10-16/) |
| 2022-05-09 | 비트코인 하락기를 어떻게 바라봐야 하나? | 전자신문(RPM9) | [md](Crypto-Stablecoin/2022-05-09-비트코인-하락기를-어떻게-바라봐야-하나.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=117724) | [docs](https://docs.vibequant.cc/columns/media-crypto-stablecoin-2022-05-09/) |
| 2022-05-12 | LUNA 급락과 가상화폐 투자의 기회 | 전자신문(RPM9) | [md](Crypto-Stablecoin/2022-05-12-LUNA-급락과-가상화폐-투자의-기회.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=117818) | [docs](https://docs.vibequant.cc/columns/media-crypto-stablecoin-2022-05-12-luna/) |
| 2022-07-11 | 가상화폐 폭락이 기존 금융 시장을 흔들 수 있을까? | 전자신문(RPM9) | [md](Crypto-Stablecoin/2022-07-11-가상화폐-폭락이-기존-금융-시장을-흔들-수-있을까.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=118832) | [docs](https://docs.vibequant.cc/columns/media-crypto-stablecoin-2022-07-11/) |
| 2022-08-29 | 비트코인 왜 폭락했나? | 전자신문(RPM9) | [md](Crypto-Stablecoin/2022-08-29-비트코인-왜-폭락했나.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=119450) | [docs](https://docs.vibequant.cc/columns/media-crypto-stablecoin-2022-08-29/) |
| 2022-10-03 | 루나 권도형은 왜 비트코인을 거래소로 송금했나? | 전자신문(RPM9) | [md](Crypto-Stablecoin/2022-10-03-루나-권도형은-왜-비트코인을-거래소로-송금했나.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=119877) | [docs](https://docs.vibequant.cc/columns/media-crypto-stablecoin-2022-10-03/) |
| 2022-08-15 | 소프트뱅크 손정의의 실패에서 배우는 스타트업 | 전자신문(RPM9) | [md](Macro-Policy/2022-08-15-소프트뱅크-손정의의-실패에서-배우는-스타트업.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=119265) | [docs](https://docs.vibequant.cc/columns/media-macro-policy-2022-08-15/) |
| 2020-02-21 | 개인 정보 보호를 위한 탈중앙화 아이디가 필요한 이유 | 전자신문(RPM9) | [md](Security/2020-02-21-개인-정보-보호를-위한-탈중앙화-아이디가-필요한-이유.md) | [원문](https://www.livebiz.today/news/articleView.html?idxno=100051) | [docs](https://docs.vibequant.cc/columns/media-security-2020-02-21/) |
| 2022-04-26 | 스마트폰 유심에 비밀 번호를 설정하세요 | 전자신문(RPM9) | [md](Security/2022-04-26-스마트폰-유심에-비밀-번호를-설정하세요.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=117482) | [docs](https://docs.vibequant.cc/columns/media-security-2022-04-26/) |
| 2022-06-18 | SIM Swapping 공격을 당해본 후기 | 전자신문(RPM9) | [md](Security/2022-06-18-SIM-Swapping-공격을-당해본-후기.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=118545) | [docs](https://docs.vibequant.cc/columns/media-security-2022-06-18-sim-swapping/) |
| 2022-07-07 | 가상화폐 지갑을 사용할 때 주의점 | 전자신문(RPM9) | [md](Security/2022-07-07-가상화폐-지갑을-사용할-때-주의점.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=118789) | [docs](https://docs.vibequant.cc/columns/media-security-2022-07-07/) |
| 2022-07-25 | 가상화폐를 노리는 불량국가 북한 | 전자신문(RPM9) | [md](Security/2022-07-25-가상화폐를-노리는-불량국가-북한.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=119045) | [docs](https://docs.vibequant.cc/columns/media-security-2022-07-25/) |
| 2022-08-04 | 사이버 전쟁은 시작되었다 | 전자신문(RPM9) | [md](Security/2022-08-04-사이버-전쟁은-시작되었다.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=119196) | [docs](https://docs.vibequant.cc/columns/media-security-2022-08-04/) |
| 2022-08-11 | 러시아 랜섬웨어 조직으로 보는 스타트업 경영 기법 | 전자신문(RPM9) | [md](Security/2022-08-11-러시아-랜섬웨어-조직으로-보는-스타트업-경영-기법.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=119248) | [docs](https://docs.vibequant.cc/columns/media-security-2022-08-11/) |
| 2022-08-24 | 빅테크 기업에게 개인 프라이버시는 있을까? | 전자신문(RPM9) | [md](Security/2022-08-24-빅테크-기업에게-개인-프라이버시는-있을까.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=119398) | [docs](https://docs.vibequant.cc/columns/media-security-2022-08-24/) |
| 2022-09-02 | 윈도우를 먹통으로 만든 알약의 오류 사태와 보안 | 전자신문(RPM9) | [md](Security/2022-09-02-윈도우를-먹통으로-만든-알약의-오류-사태와-보안.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=119520) | [docs](https://docs.vibequant.cc/columns/media-security-2022-09-02/) |
| 2022-10-23 | 블록체인 탈중앙화 금융 보안의 딜레마 | 전자신문(RPM9) | [md](Security/2022-10-23-블록체인-탈중앙화-금융-보안의-딜레마.md) | [원문](https://www.rpm9.com/news/articleView.html?idxno=120076) | [docs](https://docs.vibequant.cc/columns/media-security-2022-10-23/) |

### 크롤 잔여물 제거 (게임톡·벤처스퀘어)

| 발행일 | 제목 | 매체 | GitHub | 원문 | 사이트 |
|---|---|---|---|---|---|
| 2018-01-02 | 게임 생태계와 블록체인이 만들 혁신 | 벤처스퀘어 | [md](Blockchain-P2E/2018-01-02-게임-생태계와-블록체인이-만들-혁신.md) | [원문](https://www.venturesquare.net/757947/) | [docs](https://docs.vibequant.cc/columns/media-blockchain-p2e-2018-01-02/) |
| 2018-02-27 | ICO 진행 중 느낀 '블록체인을 위한 클라우드' | 벤처스퀘어 | [md](Blockchain-P2E/2018-02-27-ICO-진행-중-느낀-블록체인을-위한-클라우드.md) | [원문](https://www.venturesquare.net/760229/) | [docs](https://docs.vibequant.cc/columns/media-blockchain-p2e-2018-02-27-ico/) |
| 2022-07-11 | P2E, 기회와 리스크 | 게임톡 | [md](Blockchain-P2E/2022-07-11-P2E-기회와-리스크.md) | [원문](https://v.daum.net/v/20220711110306726) | [docs](https://docs.vibequant.cc/columns/media-blockchain-p2e-2022-07-11-p2e/) |
| 2022-07-22 | P2E를 위한 블록체인 기술의 이해 | 게임톡 | [md](Blockchain-P2E/2022-07-22-P2E를-위한-블록체인-기술의-이해.md) | [원문](https://v.daum.net/v/20220722105046109) | [docs](https://docs.vibequant.cc/columns/media-blockchain-p2e-2022-07-22-p2e/) |
| 2022-08-17 | P2E에서 클레이튼의 가능성과 리스크 | 게임톡 | [md](Blockchain-P2E/2022-08-17-P2E에서-클레이튼의-가능성과-리스크.md) | [원문](https://v.daum.net/v/20220817184306088) | [docs](https://docs.vibequant.cc/columns/media-blockchain-p2e-2022-08-17-p2e/) |
| 2022-09-05 | P2E의 대중화를 위한 법률 제언 | 게임톡 | [md](Blockchain-P2E/2022-09-05-P2E의-대중화를-위한-법률-제언.md) | [원문](https://v.daum.net/v/20220905132105120) | [docs](https://docs.vibequant.cc/columns/media-blockchain-p2e-2022-09-05-p2e/) |
| 2022-10-12 | 안전한 NFT 2차 거래 가이드라인 | 게임톡 | [md](Blockchain-P2E/2022-10-12-안전한-NFT-2차-거래-가이드라인.md) | [원문](https://v.daum.net/v/20221012150838266) | [docs](https://docs.vibequant.cc/columns/media-blockchain-p2e-2022-10-12-nft-2/) |

### 말미 종결 정리

| 발행일 | 제목 | 매체 | GitHub | 원문 | 사이트 |
|---|---|---|---|---|---|
| 2024-09-23 | 미술 아트테크: 갤러리K 사례와 투자 위험성 | 전자신문 | [md](Society-Culture/2024-09-23-미술-아트테크-갤러리K-사례와-투자-위험성.md) | [원문](https://www.etnews.com/20240923000070) | [docs](https://docs.vibequant.cc/columns/media-society-culture-2024-09-23-k/) |

## 참고

- 색인: [`media-columns.csv`](media-columns.csv) · 목록: [`readme.md`](readme.md)
- 원 게재 매체 링크가 아직 미확정인 별도 건: 2022-10-03 *기업용 NFT 시장은 어떻게 접근해야 할까?* (네이버 블로그 복원) — 본 복원 배치와 별개.
