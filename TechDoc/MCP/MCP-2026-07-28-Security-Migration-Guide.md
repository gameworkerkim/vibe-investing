# MCP 2026-07-28 스펙 전환: 보안 중심 변경 포인트 및 마이그레이션 가이드

| 항목 | 내용 |
|------|------|
| 문서 목적 | MCP 2026-07-28 스펙의 보안 관점 변경사항 소개 및 마이그레이션 안내 |
| 대상 독자 | MCP 서버/클라이언트 개발자, 플랫폼 운영자, 보안 담당자 |
| 기준 스펙 | MCP 2025-11-25 → MCP 2026-07-28 |
| 주요 일정 | 2026-07-28 최종 스펙 발표, 이후 12개월 레거시 지원(Deprecation Window) |
| 작성일 | 2026-07-19 |

---

## 1. 개요

2026년 7월 28일, MCP(Model Context Protocol)는 출시 이후 가장 큰 폭의 아키텍처 변경을 포함한 새 스펙으로 전환된다. 이번 개정의 핵심은 세 가지다.

1. **프로토콜의 무상태(Stateless) 전환** — 세션 개념 제거, 요청 자기완결성 확보
2. **OAuth 2.1 기반 인가(Authorization) 표준화** — 구현체 재량이던 인가를 표준으로 강제
3. **Extension Framework 공식 도입** — Roots/Sampling/Logging의 Core 분리, 감사·동의·승인 기능의 표준화

이 변화의 본질은 **보안 책임의 이동**이다. 기존에는 프로토콜 계층(세션, 핸드셰이크)이 암묵적으로 제공하던 상태 관리와 신뢰 경계가 사라지고, 그 책임이 개발자와 플랫폼 운영자의 명시적 설계로 넘어온다. 무상태 구조는 확장성과 로드밸런싱 측면에서 이점이 크지만, 클라이언트가 전달하는 상태 정보를 검증 없이 신뢰할 경우 새로운 공격 표면이 열린다.

---

## 2. 보안 관점 핵심 변경 포인트

### 2.1 무상태(Stateless) 구조 전환

`initialize` 핸드셰이크와 `Mcp-Session-Id` 헤더가 제거되고, 모든 요청이 자기완결적 구조로 바뀐다. 프로토콜 버전·클라이언트 정보·능력(capabilities)은 매 요청의 `_meta` 객체에 포함되며, 서버 능력 조회는 `server/discover` 메서드가 대체한다.

**변경 전 (2025-11-25)** — 세션 수립 후 `Mcp-Session-Id`로 상태 유지:

```http
POST /mcp HTTP/1.1
Mcp-Session-Id: 1868a90c-3a3f-4f5b
Content-Type: application/json

{"jsonrpc":"2.0","id":2,"method":"tools/call",
 "params":{"name":"search","arguments":{"q":"otters"}}}
```

**변경 후 (2026-07-28)** — 요청 자체에 모든 컨텍스트 포함:

```http
POST /mcp HTTP/1.1
MCP-Protocol-Version: 2026-07-28
Mcp-Method: tools/call
Mcp-Name: search
Content-Type: application/json

{"jsonrpc":"2.0","id":1,"method":"tools/call",
 "params":{"name":"search","arguments":{"q":"otters"},
 "_meta":{"io.modelcontextprotocol/clientInfo":{"name":"my-app","version":"1.0"}}}}
```

**보안 시사점**

| 위협 | 설명 | 대응 |
|------|------|------|
| 상태 하이재킹 | 클라이언트가 전달하는 리소스 핸들(예: `basket_id`)을 서버가 맹신할 경우, 예측 가능한 ID를 통해 타 사용자 워크플로 탈취 가능 | 핸들에 충분한 엔트로피 적용, 소유권(ownership) 검증 |
| State Object 위·변조 | 클라이언트로 반환했다가 되돌려받는 state object의 무결성 미검증 시 권한 상승 가능 | 서명(HMAC 등) 또는 서버측 저장 후 참조 방식 적용 |
| 헤더-본문 불일치 | `Mcp-Method`/`Mcp-Name` 헤더와 JSON-RPC 본문이 다를 경우 프록시·WAF 우회 벡터 발생 | 헤더와 본문 일치 여부를 서버에서 필수 검증 |

### 2.2 OAuth 기반 인가 표준화

구현체 재량이던 인가가 OAuth 2.1 표준으로 강제된다. 핵심 구성 요소는 다음 네 가지다.

| 구성 요소 | 표준 | 내용 | 방어하는 공격 |
|-----------|------|------|---------------|
| Protected Resource Metadata | RFC 9728 | `/.well-known/oauth-protected-resource`로 Authorization Server 정보 공개 | 잘못된 AS 연결, 구성 오류 |
| Resource Indicators | RFC 8707 | 토큰 요청 시 `resource` 파라미터로 대상 리소스 서버 명시, 서버는 자신을 위해 발급된 토큰인지 검증 | 토큰 오남용(Token Passthrough), Confused Deputy |
| Client ID Metadata Documents (CIMD) | - | 서버별 DCR 반복 등록을 표준 문서 기반 구성으로 대체 | 등록 남용, 클라이언트 신원 혼동 |
| Issuer 검증 | RFC 9207 | 토큰 발급 후 `iss` 파라미터로 실제 요청한 AS가 발급했는지 검증 의무화 | OAuth Mix-up Attack |

Protected Resource Metadata 구성 예시:

```json
{
  "authorization_servers": ["https://auth.example.com"],
  "resource": "https://mcp.example.com"
}
```

Resource Indicator를 포함한 토큰 요청:

```http
POST /token HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=...&
resource=https://mcp.example.com
```

### 2.3 Extension Framework 도입

감사 로깅(Audit Logging), 사용자 동의(Consent), 승인(Approval) 등 보안 운영 기능이 공식 Extension으로 표준화되었다.

- **Roots, Sampling, Logging**: Core에서 Extension으로 분리, 공식 Deprecated
- **MCP Apps**: 첫 공식 Extension으로 서버 렌더링 UI 지원
- **Tasks Extension**: 장기 실행(long-running) 작업 표준화

보안 관점에서 이는 감사·동의·승인 흐름이 각 구현체의 임의 설계가 아닌 표준 인터페이스로 수렴함을 의미한다. 컴플라이언스 및 감사 추적성(auditability) 확보 측면에서 긍정적이나, 기존 Core 기능(특히 Sampling)에 의존하던 코드는 반드시 Extension 네임스페이스 방식으로 전환해야 한다.

---

## 3. Breaking Changes 요약

| 변경 항목 | 기존 (2025-11-25) | 신규 (2026-07-28) |
|-----------|-------------------|-------------------|
| 세션 | `initialize` 핸드셰이크 + `Mcp-Session-Id` | 제거, 무상태 |
| 에러 코드 | `-32002` (Resource not found) | `-32602` (JSON-RPC 표준) |
| 능력 발견 | 핸드셰이크 시 교환 | `server/discover` 메서드 |
| HTTP 헤더 | `Mcp-Session-Id` | `Mcp-Method`, `Mcp-Name` 필수 |
| SSE | Server-Sent Events 스트림 유지 | Multi Round-Trip Requests(MRTR)로 대체 |
| 인가 | 구현체 의존 | OAuth 2.1 표준화 |
| Roots/Sampling/Logging | Core 기능 | Extension으로 분리 (Deprecated) |
| 캐싱 | 별도 구현 필요 | `ttlMs`, `cacheScope` 필드 제공 |

---

## 4. 마이그레이션 가이드

### 4.1 세션 상태 제거

| 기존 방식 | 새 방식 |
|-----------|---------|
| `initialize` 핸드셰이크 | `server/discover` 메서드로 능력 조회 |
| `Mcp-Session-Id` 헤더 | `_meta` 객체에 클라이언트 정보 포함 |
| 세션 기반 상태 저장 | 명시적 리소스 핸들(예: `basket_id`)로 상태 전달 |
| Sticky Session 필요 | Round-robin 로드밸런싱 가능 |

```typescript
// 기존: 세션 기반 상태 관리
class SessionManager {
  private sessions: Map<string, SessionState>;

  async handleRequest(sessionId: string, request: Request) {
    const session = this.sessions.get(sessionId);
    // 세션 상태에 의존
  }
}

// 신규: 명시적 핸들 기반
class StatelessHandler {
  async handleRequest(request: Request) {
    // 모든 필요한 정보는 요청에 포함
    const { basketId, clientInfo } = request.params._meta;
    // basketId를 명시적 파라미터로 전달받아 처리
    // 주의: basketId 소유권 및 무결성 검증 필수
  }
}
```

### 4.2 인가(Authorization) 마이그레이션

| 기존 방식 | 새 방식 |
|-----------|---------|
| 자체 구현 인가 | OAuth 2.1 표준 준수 |
| 별도 설정 필요 | `.well-known/oauth-protected-resource` 자동 발견 |
| 토큰 범위 미지정 | Resource Indicators(RFC 8707)로 범위 지정 |
| DCR 기반 클라이언트 등록 | CIMD 기반 구성으로 전환 |
| Issuer 검증 생략 가능 | Issuer 검증 의무화 (RFC 9207) |

구현 체크리스트:

1. `.well-known/oauth-protected-resource` 엔드포인트 구성 (RFC 9728)
2. OAuth 2.1 준수 인가 흐름 구현 (PKCE 필수)
3. Resource Indicators 적용 (RFC 8707)
4. Issuer(`iss`) 파라미터 검증 로직 추가 (RFC 9207)
5. CIMD 기반 클라이언트 구성으로 마이그레이션

### 4.3 Extension 전환

```typescript
// 기존: Core에 의존하던 Sampling
server.setCapabilities({
  sampling: { /* ... */ }
});

// 신규: Extension으로 분리된 기능 사용
server.setCapabilities({
  extensions: {
    "io.modelcontextprotocol/sampling": { /* ... */ },
    "io.modelcontextprotocol/logging": { /* ... */ }
  }
});
```

### 4.4 프로덕션 마이그레이션 점검 리스트

- [ ] **세션 상태 제거**: `Mcp-Session-Id` 기반 상태 저장 로직을 명시적 리소스 핸들 구조로 전환
- [ ] **에러 코드 수정**: `-32002` → `-32602`로 변경
- [ ] **OAuth 구성**: `.well-known/oauth-protected-resource` 엔드포인트 구성 (RFC 9728)
- [ ] **Resource Indicators**: RFC 8707 적용 여부 확인
- [ ] **CIMD 마이그레이션**: DCR 기반 구성에서 CIMD 기반 구성으로 계획 수립
- [ ] **Extension 확인**: Roots, Sampling, Logging 기능의 Core 분리 반영
- [ ] **무상태 테스트**: 로드밸런서 뒤 다중 인스턴스 환경에서 Stateless 동작 검증
- [ ] **헤더 검증**: `Mcp-Method`, `Mcp-Name` 헤더와 본문 내용 일치 여부 검증 로직 추가
- [ ] **_meta 객체 검증**: 클라이언트가 전달하는 `_meta` 객체의 무결성 검증 로직 구현
- [ ] **토큰 검증**: Issuer(`iss`) 파라미터 검증 로직 추가 (RFC 9207)

---

## 5. 마이그레이션 도구

| 도구 | 용도 | 링크 |
|------|------|------|
| mcp-herald | MCP 2026-07-28 스펙 정적 마이그레이션 린터. 소스 코드를 스캔하여 Breaking Change 서명을 감지하고 수정 방법 안내 | https://github.com/studiomeyer-io/mcp-herald |
| mcp-auth-adapter | OAuth 2.0/OIDC IdP 앞단에서 MCP 인가 스펙에 필요한 기능(RFC 9728/8707/9207)을 제공하는 어댑터 | https://github.com/velias/mcp-auth-adapter |

권장 활용 순서: (1) mcp-herald로 코드베이스 전체 스캔 → Breaking Change 목록화, (2) 세션/에러 코드/Extension 등 프로토콜 계층 수정, (3) mcp-auth-adapter로 인가 계층 표준화, (4) 무상태 환경(다중 인스턴스 + 로드밸런서)에서 통합 테스트.

---

## 6. 결론 및 권고

2026-07-28 MCP 스펙의 핵심은 무상태 아키텍처 전환, OAuth 2.1 기반 인가 표준화, Extension Framework 도입이다. 프로토콜이 암묵적으로 제공하던 신뢰 경계가 사라지면서 보안 책임이 개발자와 플랫폼 운영자에게 이전되었고, 각 구현체의 보안 설계 품질이 시스템 전체의 보안 수준을 결정하게 되었다.

12개월의 Deprecation Window가 제공되므로, 다음과 같은 단계적 접근을 권고한다.

| 단계 | 기간(권고) | 작업 |
|------|-----------|------|
| 1. 진단 | 1개월 | mcp-herald 스캔, Breaking Change 영향도 평가 |
| 2. 프로토콜 전환 | 2-3개월 | 세션 제거, 헤더/에러 코드 수정, Extension 전환 |
| 3. 인가 표준화 | 2-3개월 | OAuth 2.1 흐름 구현, RFC 9728/8707/9207 적용 |
| 4. 검증 | 1-2개월 | 무상태 부하 테스트, 침투 테스트, 헤더-본문 불일치 및 핸들 위·변조 시나리오 검증 |
| 5. 병행 운영 | 잔여 기간 | 신·구 스펙 병행 지원 후 레거시 종료 |

특히 무상태 전환 과정에서 클라이언트 제공 데이터(리소스 핸들, state object, `_meta`)에 대한 검증 로직이 누락되면 세션 시대에는 존재하지 않던 하이재킹·권한 탈취 벡터가 생긴다는 점을 마이그레이션 전 과정에서 유념해야 한다.
