# Pyodide 기술 문서 (검증 및 확장판)

- 작성 기준일: 2026-07-19
- 최신 안정 버전: Pyodide 314.0.x (Python 3.14 기반)
- 라이선스: MPL-2.0
- 공식 사이트: https://pyodide.org

---

## 1. Pyodide란?

Pyodide는 **WebAssembly**와 **Emscripten**을 기반으로 CPython 인터프리터를 통째로 컴파일한 **브라우저 및 Node.js용 Python 배포판**이다. 서버 없이 브라우저에서 직접 Python 코드를 실행할 수 있으며, 2018년 Mozilla의 사내 프로젝트(iodide)에서 출발해 2019년 이후 독립 커뮤니티 프로젝트로 발전했다.

### 검증 노트 (2026년 7월 기준)

| 항목 | 원문 서술 | 검증 결과 |
|------|-----------|-----------|
| 프로젝트 기원 | Mozilla, 2018년 시작 | 정확 |
| 버전 체계 | 언급 없음 | **변경됨.** 2026년 6월부터 Python 버전 연동 체계로 전환 (0.29.x → 314.x, Python 3.14 대응). 메이저 릴리스는 연 1회 Python 업스트림과 동기화 |
| 성능 | 네이티브 대비 3~5배 느림 | 대체로 정확. 순수 Python 코드 기준 3~5배, WASM 컴파일된 C 코드는 2~2.5배 수준 |
| 메모리 제한 | 약 2GB | **구버전 기준.** 현재는 wasm32 주소 공간 한계인 4GB까지 사용 가능. 2GB 이상 주소 영역 관련 버그도 최근 수정됨 |
| C 확장 패키지 | 포팅 안 되면 사용 불가 | **완화 필요.** PEP 783 채택으로 pyemscripten 플랫폼 태그의 바이너리 wheel을 PyPI에 정식 배포 가능. NumPy, SciPy, cryptography 등 C/C++/Rust 확장 250개 이상이 이미 포팅됨 |
| stdlib 번들 | 언급 없음 | 314.0부터 sqlite3, lzma가 기본 번들에 포함 (unvendoring 중단) |

---

## 2. 주요 특징

| 특징 | 설명 |
|------|------|
| 브라우저 내 Python 실행 | 서버 없이 웹 브라우저에서 CPython 3.14 실행 |
| JavaScript-Python FFI | 양방향 객체 자동 변환, 에러 전파, async/await 상호 지원 |
| 과학 계산 스택 내장 | NumPy, pandas, SciPy, Matplotlib, scikit-learn 등 사전 빌드 제공 |
| micropip | PyPI의 순수 Python wheel 및 pyemscripten wheel 설치 |
| Web API 접근 | DOM, fetch, Canvas 등 브라우저 API 전체 접근 가능 |
| Node.js 지원 | npm 패키지(`pyodide`)로 서버사이드/CLI 환경 실행 |
| PEP 783 표준화 | Emscripten wheel의 PyPI 정식 배포 경로 확보 (2026) |

---

## 3. 추가 기능 (원문 미포함 항목)

### 3.1 JavaScript ↔ Python FFI 상세

- 프록시 기반 상호운용: `PyProxy`(JS에서 Python 객체 참조), `JsProxy`(Python에서 JS 객체 참조)
- 자동 타입 변환: JS Array ↔ Python list, JS Map ↔ Python dict, TypedArray ↔ memoryview
- BigInt 라운드트립: 314.0부터 `pyodide.ffi.JsBigInt` 도입으로 2^53 초과 정수의 JS bigint 왕복 변환 지원
- 예외 상호 전파: 한쪽 언어에서 throw한 예외를 다른 쪽에서 catch 가능

### 3.2 Web Worker 실행

메인 스레드 블로킹을 피하기 위해 Pyodide를 Web Worker에서 구동하는 패턴이 사실상 표준이다. 무거운 연산(pandas 처리, 모델 추론)을 워커로 격리하고 `postMessage`로 결과만 주고받는다.

### 3.3 가상 파일시스템 (Emscripten FS)

- 메모리 기반 MEMFS가 기본이며, IndexedDB 기반 IDBFS로 브라우저 세션 간 영속화 가능
- `pyodide.FS` API로 JS 측에서 파일 읽기/쓰기 직접 제어

### 3.4 패키지 로딩 이원화

| 방식 | 용도 |
|------|------|
| `pyodide.loadPackage()` | Pyodide CDN에 사전 빌드된 패키지(NumPy 등) 로드 |
| `micropip.install()` | PyPI의 순수 Python wheel 및 pyemscripten wheel 설치 |
| `loadPackagesFromImports()` | 코드의 import 문을 분석해 필요한 패키지 자동 로드 |

### 3.5 개발 도구 생태계

| 도구 | 기능 |
|------|------|
| pyodide-build | C/Rust 확장 패키지를 pyemscripten wheel로 크로스 빌드 |
| pytest-pyodide | Chrome/Firefox/Node 런타임에서 Pyodide 대상 테스트 자동화 |
| pyodide-pack | 배포용 번들 최소화(사용하지 않는 모듈 제거) |
| auditwheel-emscripten | Emscripten wheel 검증 도구 |
| Pyodide CLI | 터미널에서 `pyodide` 명령으로 venv 유사 환경 생성 및 REPL 실행 |

### 3.6 SharedArrayBuffer 및 동기 입출력

COOP/COEP 헤더 설정 시 SharedArrayBuffer 기반으로 워커-메인 간 동기 통신이 가능하며, 이를 통해 `input()` 같은 동기식 표준 입력을 에뮬레이션할 수 있다.

---

## 4. 장점

1. **서버 비용 절감 및 인프라 단순화** — Python 연산을 클라이언트에서 처리하므로 서버는 인증/DB 등 필수 작업만 담당. 연산 비용이 사용자 수에 비례해 증가하지 않는다.
2. **설치 불필요, 즉시 실행** — 브라우저만으로 Python 실행. 최초 로드 후에는 오프라인 동작 가능.
3. **JavaScript와의 완전한 통합** — 양방향 자동 변환, 예외 전파, async/await 지원.
4. **풍부한 과학 계산 생태계** — 데이터 과학 필수 라이브러리를 별도 설정 없이 사용.
5. **교육 및 인터랙티브 콘텐츠 최적** — JupyterLite 등으로 서버리스 노트북 환경 구축. 학생 코드가 브라우저 샌드박스에 격리되어 서버 보안 리스크가 없다.
6. **(신규) 패키징 표준화** — PEP 783 채택으로 패키지 저자가 PyPI에 Emscripten wheel을 직접 배포 가능. 동일 Python 버전 내 Pyodide 릴리스 간 wheel 호환성이 보장된다.

---

## 5. 단점

1. **성능 저하** — 순수 Python 코드는 네이티브 대비 약 3~5배, WASM 컴파일된 C 코드는 약 2~2.5배 느림. JIT가 없는 인터프리터 실행이 근본 원인.
2. **메모리 제약** — wasm32 주소 공간 한계로 최대 약 4GB. 초기 로드만으로 수백 MB를 점유하므로 저사양 기기에서 다중 탭 사용 시 부담. (구버전의 2GB 하드 리밋은 해소됨)
3. **초기 로드 크기** — 코어 런타임만 수 MB, NumPy/pandas 등 로드 시 수십 MB 다운로드 필요. 캐싱 전략(Service Worker, CDN)이 사실상 필수.
4. **패키지 커버리지 한계** — PEP 783로 크게 개선되었으나, OS 의존 기능(멀티프로세싱, 저수준 소켓, 동기 sleep 등)은 여전히 제한적. CPython의 완전한 동등 구현은 아님.
5. **네트워크 요청 제한** — 브라우저 CORS 정책 적용. `requests` 대신 `pyodide.http.pyfetch` 사용 또는 프록시 우회 필요.
6. **브라우저 요구사항** — WebAssembly 지원 최신 브라우저 필요. SharedArrayBuffer 활용 기능은 COOP/COEP 헤더 설정까지 요구.

---

## 6. Getting Started

### 6.1 브라우저: CDN 한 줄로 시작

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/pyodide/v314.0.2/full/pyodide.js"></script>
</head>
<body>
  <script type="module">
    const pyodide = await loadPyodide();
    // 기본 실행
    console.log(pyodide.runPython("1 + 2"));  // 3

    // 여러 줄 Python 코드
    pyodide.runPython(`
      import sys
      print(f"Python {sys.version} in the browser")
    `);
  </script>
</body>
</html>
```

버전 문자열(`v314.0.2`)은 배포 시 반드시 고정할 것. `dev` 등 비버전 URL을 프로덕션에 사용하면 안 된다.

### 6.2 사전 빌드 패키지 로드 (NumPy 예시)

```javascript
await pyodide.loadPackage("numpy");
pyodide.runPython(`
  import numpy as np
  a = np.random.rand(1000, 1000)
  print(a.mean())
`);
```

### 6.3 micropip으로 PyPI 패키지 설치

```javascript
await pyodide.loadPackage("micropip");
const micropip = pyodide.pyimport("micropip");
await micropip.install("cowsay");   // 순수 Python wheel
pyodide.runPython(`
  import cowsay
  cowsay.cow("Hello from PyPI")
`);
```

### 6.4 JavaScript ↔ Python 데이터 교환

```javascript
// JS → Python
pyodide.globals.set("js_data", [10, 20, 30]);
const result = pyodide.runPython(`
  data = js_data.to_py()      # JsProxy → Python list
  sum(data)
`);
console.log(result);  // 60

// Python → JS
const pyDict = pyodide.runPython(`{"kr": "서울", "jp": "도쿄"}`);
console.log(pyDict.toJs());   // Map(2) { "kr" → "서울", ... }
pyDict.destroy();             // PyProxy 메모리 해제 (누수 방지)
```

### 6.5 비동기 실행 및 네트워크 요청

```javascript
await pyodide.loadPackage("micropip");
const out = await pyodide.runPythonAsync(`
  from pyodide.http import pyfetch
  resp = await pyfetch("https://api.github.com/repos/pyodide/pyodide")
  data = await resp.json()
  data["stargazers_count"]
`);
```

### 6.6 Web Worker 패턴 (권장 프로덕션 구조)

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

### 6.7 Node.js에서 사용

```bash
npm install pyodide
```

```javascript
import { loadPyodide } from "pyodide";

const pyodide = await loadPyodide();
console.log(pyodide.runPython("2 ** 10"));  // 1024
```

### 6.8 자체 패키지 빌드 (C/Rust 확장)

```bash
pip install pyodide-build
pyodide build            # 프로젝트 루트에서 pyemscripten wheel 생성
```

생성된 wheel은 PEP 783 표준에 따라 PyPI에 직접 업로드할 수 있으며, micropip으로 설치 가능하다.

---

## 7. 경쟁 제품 비교

브라우저에서 Python을 실행하는 접근은 크게 세 가지 계열로 나뉜다: (A) CPython 자체를 WASM으로 포팅, (B) JavaScript로 Python 인터프리터를 재구현, (C) Python 코드를 JavaScript로 트랜스파일.

| 제품 | 접근 방식 | 강점 | 약점 | 주 용도 |
|------|-----------|------|------|---------|
| **Pyodide** | (A) CPython → WASM | 완전한 CPython 호환, 과학 스택, PEP 783 표준화 | 초기 로드 크기, 인터프리터 속도 | 데이터 과학, 범용 |
| **PyScript** | Pyodide/MicroPython 위의 프레임워크 | HTML 태그만으로 Python 삽입, 진입장벽 최저 | 자체 런타임 아님(하부는 Pyodide 의존), 추상화 오버헤드 | 교육, 프로토타입, 위젯 |
| **MicroPython (WASM)** | 경량 Python 재구현 → WASM | 로드 크기 수백 KB 수준, 기동 속도 최상 | 표준 라이브러리/CPython 호환성 대폭 축소, C 확장 생태계 없음 | 경량 스크립팅, 임베디드 위젯 |
| **Brython** | (B) JS로 인터프리터 재구현 | 로드 가벼움, `text/python` 스크립트 태그로 DOM 조작 자연스러움, 단순 연산은 CPython급 속도 | NumPy 등 C 확장 불가, 복잡 연산에서 성능 편차 큼 | DOM 중심 웹 스크립팅 |
| **Skulpt** | (B) JS로 인터프리터 재구현 | 완전 클라이언트 실행, 교육 플랫폼(Anvil 등) 검증 | 성능이 CPython 대비 수십 배 느림, Python 기능 커버리지 제한 | 초급 교육, 튜토리얼 |
| **Transcrypt** | (C) Python → JS 트랜스파일 | 산출물이 순수 JS라 로드/실행 빠름, JS 라이브러리 직접 활용 | 런타임 인터프리터 아님(동적 기능 제약), 빌드 단계 필요 | 프론트엔드 앱을 Python 문법으로 작성 |
| **CPython WASI 빌드** | (A) CPython → WASI | CPython 공식 upstream 지원(tier 2), 서버리스/엣지 런타임 적합 | 브라우저 통합(FFI, DOM)은 Pyodide 대비 미성숙 | 엣지 컴퓨팅, 샌드박스 실행 |

### 파생 생태계 (경쟁이 아닌 Pyodide 기반 제품)

| 제품 | 설명 |
|------|------|
| JupyterLite | 서버 없는 브라우저 내 Jupyter 노트북. 커널로 Pyodide 사용 |
| stlite | Streamlit 앱을 브라우저에서 서버리스로 구동 |
| marimo (WASM 모드) | 반응형 Python 노트북의 브라우저 실행 버전 |
| Cloudflare Workers Python | 엣지 런타임의 Python 지원에 Pyodide 활용 |

### 선택 가이드

| 요구사항 | 권장 |
|----------|------|
| NumPy/pandas 등 과학 스택 필요 | Pyodide |
| HTML만으로 빠르게 Python 삽입 | PyScript |
| 로드 크기가 최우선(수백 KB) | MicroPython(WASM) 또는 Brython |
| DOM 조작 중심의 가벼운 스크립팅 | Brython |
| 초급 프로그래밍 교육 플랫폼 | Skulpt 또는 PyScript |
| 빌드 산출물을 JS로 배포 | Transcrypt |
| 서버리스/엣지 샌드박스 실행 | CPython WASI 또는 Pyodide(Node) |

---

## 8. 활용 사례 정리

| 적합한 경우 | 부적합한 경우 |
|------------|--------------|
| 교육용 인터랙티브 콘텐츠 | 대규모 데이터 처리(수 GB 이상) |
| 프로토타이핑 및 데모 | 실시간 저지연이 필수인 애플리케이션 |
| 과학 계산 시각화, 브라우저 내 분석 도구 | 복잡한 네트워크/소켓 작업 |
| 서버리스 Python 애플리케이션 | 멀티프로세싱 등 OS 의존 워크로드 |
| 민감 데이터의 클라이언트 내 처리(데이터가 브라우저를 떠나지 않음) | 모든 PyPI 패키지가 필요한 경우 |

---

## 9. 결론

Pyodide는 "서버 없이 Python을 웹에서 실행한다"는 가능성을 연 프로젝트에서, 2026년 PEP 783 채택과 Python 버전 연동 릴리스 체계 도입으로 **브라우저 Python의 사실상 표준 플랫폼**으로 자리잡았다. 성능(네이티브 대비 3~5배 저하)과 초기 로드 크기라는 구조적 한계는 여전하므로, 연산 집약 워크로드보다는 교육·시각화·클라이언트 사이드 데이터 처리·서버리스 도구에 적용하는 것이 합리적이다. 경량성이 최우선이면 MicroPython/Brython 계열을, 완전한 CPython 생태계가 필요하면 Pyodide를 선택하는 것이 기본 원칙이다.
