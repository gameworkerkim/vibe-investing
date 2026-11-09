# Custom GPT 만들기 가이드 — 반도체 퀀트 v2

> 5분이면 만든다. ChatGPT에는 "스킬"이 없으므로, **Instructions(시스템 지침) + Knowledge(지식 파일)** 조합이 Claude의 스킬과 동등한 역할을 한다.

## 1. 만들기

1. ChatGPT → 왼쪽 사이드바 **Explore GPTs → + Create** (또는 https://chatgpt.com/gpts/editor)
2. "Configure" 탭으로 전환
3. **Name**: `Semiconductor Quant v2` (예: `Semiconductor Quant v2 (SEMI)` )
4. **Description**:
   ```
   반도체 4개 서브섹터(GPU/CPU/메모리/스토리지) 퀀트 스코어링. <DATA> 블록을 주면
   국면 판정(R1~R4)·모멘텀/멀티팩터 스코어·크라우딩 조정 포지션을 JSON으로 계산하고,
   백테스트는 코드(codegen)로 출력한다.
   ```
5. **Instructions**: `GPT-instructions-KR.md`의 내용을 통째로 붙여넣기 (영어 전용이면 `GPT-instructions-EN.md`)
6. **Knowledge**에 업로드:
   - `SEMICONDUCTOR-QUANT-PROMPTS-V2-2026-11.md` (규칙 원문 — 소스 오브 트루스)
   - (선택) `script/config.py` (모든 수치의 코드 구현본)
7. 저장: 우측 상단 **Create → Everyone / Only me**

## 2. 사용법

- **compute 모드** (권장):
  ```
  AS_OF=2026-11-09
  <DATA>
  {가격 시계열, NTM EPS 컨센서스+애널리스트 수, DRAM/NAND 계약가, 재고일수, CAPEX/매출, ...}
  </DATA>
  반도체 유니버스 스코어와 국면, 롱/숏 후보를 계산해줘
  ```
- **codegen 모드**: "프롬프트 D 규칙으로 워크포워드 백테스트 코드를 작성해줘" → 팩터·타이밍·헤지·백테스트 모듈 + 단위 테스트
- **해석 모드**: 이 레포 `result/`의 CSV/JSON을 Knowledge에 넣고 해석 요청

## 3. 주의

- **데이터 없이 스코어를 시키면 안 된다.** <DATA> 없는 요청에는 GPT가 "어떤 데이터가 필요한지" 되묻도록 지침에 명시돼 있다. 데이터를 넣지 않고 나온 숫자는 환각으로 간주한다.
- 복잡한 계산은 ChatGPT가 수치를 틀릴 수 있다 — 결정적인 계산은 Claude 스킬의 `validate` 모드(파이썬 파이프라인)를 우선하고, ChatGPT는 규칙 해석·JSON 구조화 용도로 쓰는 것을 권장한다.
- 지침의 가중치·임계값은 초기값이다. 프롬프트 원문을 고치면 Instructions도 함께 갱신한다.

## 4. Claude 스킬과의 대응

| Claude Agent Skill | ChatGPT Custom GPT | 담당 |
|---|---|---|
| `semiconductor-quant-v2` (compute) | Instructions의 프롬프트 A/B/C/E | 규칙 기반 스코어·포지션 산출 |
| `semiconductor-quant-v2` (codegen) | Instructions의 프롬프트 D | 백테스트 코드 생성 |
| `semiconductor-quant-v2` (validate — `script/run_validation.py` 실행) | 없음(코드 실행 불가) | 결정적 계산은 Claude/로컬 파이썬에서 |
