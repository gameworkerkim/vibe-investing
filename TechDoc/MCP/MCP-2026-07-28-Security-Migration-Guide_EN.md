---
title: "MCP 2026-07-28 Spec Transition: Security-Critical Changes and Migration Guide"
subtitle: "How the shift to a stateless protocol, OAuth 2.1 authorization, and the Extension Framework moves security responsibility onto developers and platform operators"
description: "A security-focused breakdown of the MCP 2026-07-28 specification: the move to a stateless protocol, mandatory OAuth 2.1 authorization, and the new Extension Framework, plus a practical migration checklist and toolset."
abstract: |
  On July 28, 2026, the Model Context Protocol (MCP) shifts to a new specification containing its largest architectural change since launch.
  The three pillars are: a stateless protocol (session concept removed, requests become self-contained), OAuth 2.1-based authorization standardization (RFC 9728/8707/9207), and the official introduction of an Extension Framework that separates Roots/Sampling/Logging from Core.
  The underlying theme is a transfer of security responsibility: the trust boundaries and state management that the protocol layer used to provide implicitly disappear, and that responsibility moves to explicit design decisions made by developers and platform operators.
  This document explains the breaking changes, the new threat surface each change opens up, and a phased migration plan for production systems, backed by two open-source migration tools (mcp-herald, mcp-auth-adapter).
summary_for_ai: |
  This document is a security-oriented migration guide for the MCP (Model Context Protocol) 2026-07-28 specification, written for MCP server/client developers, platform operators, and security engineers.
  Baseline transition: MCP 2025-11-25 to MCP 2026-07-28, finalized 2026-07-28, with a 12-month legacy support (deprecation) window.
  Key changes: (1) stateless protocol - removal of the `initialize` handshake and `Mcp-Session-Id` header, replaced by self-contained requests carrying `_meta` and a `server/discover` method; (2) OAuth 2.1 authorization standardization via RFC 9728 (Protected Resource Metadata), RFC 8707 (Resource Indicators), RFC 9207 (Issuer verification), and Client ID Metadata Documents (CIMD); (3) Extension Framework - Roots/Sampling/Logging move from Core to Extensions (deprecated), with MCP Apps as the first official extension and a Tasks extension for long-running operations.
  New threat vectors introduced by statelessness include state/handle hijacking via predictable resource handles, tampering with client-returned state objects, and header/body mismatch attacks against `Mcp-Method`/`Mcp-Name`.
  The document provides a breaking-changes table, TypeScript before/after code samples, a production migration checklist, and a recommended five-phase rollout (diagnosis, protocol migration, authorization standardization, verification, parallel operation) within the 12-month window.
date: 2026-07-19
author: "Dennis Kim"
lang: en
tags:
  - MCP
  - Model Context Protocol
  - Security
  - OAuth 2.1
  - API Security
  - Migration
keywords:
  - MCP 2026-07-28 specification
  - Model Context Protocol security
  - MCP stateless migration
  - OAuth 2.1 MCP authorization
  - MCP Extension Framework
  - MCP breaking changes
group: llm-agents
featured: false
schema_type: TechArticle
draft: false
---

# MCP 2026-07-28 Spec Transition: Security-Critical Changes and Migration Guide

| Item | Details |
|------|------|
| Purpose | Introduce the security-relevant changes in the MCP 2026-07-28 spec and provide migration guidance |
| Audience | MCP server/client developers, platform operators, security engineers |
| Baseline spec | MCP 2025-11-25 -> MCP 2026-07-28 |
| Key schedule | Final spec published 2026-07-28, followed by a 12-month legacy support (deprecation) window |
| Written | 2026-07-19 |

---

## 1. Overview

On July 28, 2026, the Model Context Protocol (MCP) transitions to a new specification containing the largest architectural change since its launch. The revision centers on three points.

1. **A stateless protocol** — the session concept is removed, and requests become self-contained
2. **OAuth 2.1-based authorization standardization** — authorization, previously left to implementer discretion, is now enforced as a standard
3. **Official introduction of the Extension Framework** — Roots/Sampling/Logging are split out of Core, and auditing/consent/approval functions are standardized

The essence of this shift is a **transfer of security responsibility**. The state management and trust boundaries that the protocol layer (sessions, handshakes) used to provide implicitly disappear, and that responsibility moves to the explicit design of developers and platform operators. A stateless architecture has clear benefits for scalability and load balancing, but if a client's state data is trusted without validation, a new attack surface opens up.

---

## 2. Key Security-Relevant Changes

### 2.1 Transition to a Stateless Architecture

The `initialize` handshake and the `Mcp-Session-Id` header are removed, and every request becomes self-contained. Protocol version, client information, and capabilities are now included in the `_meta` object of each request, and server capability discovery is replaced by the `server/discover` method.

**Before (2025-11-25)** — state maintained via `Mcp-Session-Id` after session establishment:

```http
POST /mcp HTTP/1.1
Mcp-Session-Id: 1868a90c-3a3f-4f5b
Content-Type: application/json

{"jsonrpc":"2.0","id":2,"method":"tools/call",
 "params":{"name":"search","arguments":{"q":"otters"}}}
```

**After (2026-07-28)** — all context is included in the request itself:

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

**Security implications**

| Threat | Description | Mitigation |
|------|------|------|
| State hijacking | If the server blindly trusts a resource handle passed by the client (e.g. `basket_id`), a predictable ID can let an attacker hijack another user's workflow | Use handles with sufficient entropy and verify ownership |
| State object tampering | If the integrity of a state object that is returned to the client and later sent back is not verified, privilege escalation becomes possible | Apply signing (e.g. HMAC) or store server-side and reference by ID |
| Header/body mismatch | If the `Mcp-Method`/`Mcp-Name` headers disagree with the JSON-RPC body, this creates a proxy/WAF bypass vector | The server must mandatorily verify that headers and body agree |

### 2.2 OAuth-Based Authorization Standardization

Authorization, which was previously left to implementer discretion, is now enforced under the OAuth 2.1 standard. There are four core components.

| Component | Standard | Description | Attack it defends against |
|-----------|------|------|---------------|
| Protected Resource Metadata | RFC 9728 | Exposes Authorization Server info via `/.well-known/oauth-protected-resource` | Connecting to the wrong AS, misconfiguration |
| Resource Indicators | RFC 8707 | Specifies the target resource server via the `resource` parameter in a token request; the server verifies the token was issued for itself | Token misuse (token passthrough), confused deputy |
| Client ID Metadata Documents (CIMD) | - | Replaces repeated per-server DCR registration with standard document-based configuration | Registration abuse, client identity confusion |
| Issuer verification | RFC 9207 | Mandates verifying, via the `iss` parameter, that the token was actually issued by the requested AS | OAuth mix-up attack |

Example Protected Resource Metadata configuration:

```json
{
  "authorization_servers": ["https://auth.example.com"],
  "resource": "https://mcp.example.com"
}
```

A token request including a Resource Indicator:

```http
POST /token HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=...&
resource=https://mcp.example.com
```

### 2.3 Introduction of the Extension Framework

Security operations functions such as audit logging, user consent, and approval are now standardized as official Extensions.

- **Roots, Sampling, Logging**: split from Core into Extensions, officially deprecated
- **MCP Apps**: the first official Extension, providing server-rendered UI support
- **Tasks Extension**: standardizes long-running operations

From a security standpoint, this means audit/consent/approval flows converge on a standard interface rather than each implementer's ad-hoc design — a positive for compliance and auditability. However, code that relied on former Core features (especially Sampling) must migrate to the Extension namespace pattern.

---

## 3. Breaking Changes Summary

| Change | Before (2025-11-25) | After (2026-07-28) |
|-----------|-------------------|-------------------|
| Sessions | `initialize` handshake + `Mcp-Session-Id` | Removed, stateless |
| Error codes | `-32002` (Resource not found) | `-32602` (JSON-RPC standard) |
| Capability discovery | Exchanged during handshake | `server/discover` method |
| HTTP headers | `Mcp-Session-Id` | `Mcp-Method`, `Mcp-Name` required |
| SSE | Server-Sent Events stream retained | Replaced by Multi Round-Trip Requests (MRTR) |
| Authorization | Implementation-dependent | OAuth 2.1 standardized |
| Roots/Sampling/Logging | Core features | Split into Extensions (deprecated) |
| Caching | Required separate implementation | `ttlMs`, `cacheScope` fields provided |

---

## 4. Migration Guide

### 4.1 Removing Session State

| Old approach | New approach |
|-----------|---------|
| `initialize` handshake | Capability discovery via `server/discover` |
| `Mcp-Session-Id` header | Client info included in the `_meta` object |
| Session-based state storage | State passed via explicit resource handles (e.g. `basket_id`) |
| Sticky sessions required | Round-robin load balancing possible |

```typescript
// Before: session-based state management
class SessionManager {
  private sessions: Map<string, SessionState>;

  async handleRequest(sessionId: string, request: Request) {
    const session = this.sessions.get(sessionId);
    // Relies on session state
  }
}

// After: explicit handle-based
class StatelessHandler {
  async handleRequest(request: Request) {
    // Everything needed is included in the request
    const { basketId, clientInfo } = request.params._meta;
    // basketId is passed as an explicit parameter and processed
    // Note: verifying basketId ownership and integrity is mandatory
  }
}
```

### 4.2 Authorization Migration

| Old approach | New approach |
|-----------|---------|
| Custom-built authorization | OAuth 2.1 compliance |
| Separate configuration required | Auto-discovery via `.well-known/oauth-protected-resource` |
| Token scope unspecified | Scoped via Resource Indicators (RFC 8707) |
| DCR-based client registration | Migrate to CIMD-based configuration |
| Issuer verification optional | Issuer verification mandatory (RFC 9207) |

Implementation checklist:

1. Configure the `.well-known/oauth-protected-resource` endpoint (RFC 9728)
2. Implement an OAuth 2.1-compliant authorization flow (PKCE required)
3. Apply Resource Indicators (RFC 8707)
4. Add issuer (`iss`) parameter verification logic (RFC 9207)
5. Migrate to CIMD-based client configuration

### 4.3 Extension Migration

```typescript
// Before: Sampling relying on Core
server.setCapabilities({
  sampling: { /* ... */ }
});

// After: using functionality split into Extensions
server.setCapabilities({
  extensions: {
    "io.modelcontextprotocol/sampling": { /* ... */ },
    "io.modelcontextprotocol/logging": { /* ... */ }
  }
});
```

### 4.4 Production Migration Checklist

- [ ] **Remove session state**: migrate `Mcp-Session-Id`-based state storage logic to explicit resource handle structures
- [ ] **Fix error codes**: change `-32002` -> `-32602`
- [ ] **Configure OAuth**: set up the `.well-known/oauth-protected-resource` endpoint (RFC 9728)
- [ ] **Resource Indicators**: verify RFC 8707 adoption
- [ ] **CIMD migration**: plan the move from DCR-based to CIMD-based configuration
- [ ] **Verify Extensions**: confirm Roots, Sampling, and Logging have been split from Core
- [ ] **Stateless testing**: verify stateless behavior across multiple instances behind a load balancer
- [ ] **Header validation**: add logic to verify that `Mcp-Method`/`Mcp-Name` headers match the body content
- [ ] **`_meta` object validation**: implement integrity checks for the client-supplied `_meta` object
- [ ] **Token validation**: add issuer (`iss`) parameter verification logic (RFC 9207)

---

## 5. Migration Tools

| Tool | Purpose | Link |
|------|------|------|
| mcp-herald | A static migration linter for the MCP 2026-07-28 spec. Scans source code to detect breaking-change signatures and suggests fixes | https://github.com/studiomeyer-io/mcp-herald |
| mcp-auth-adapter | An adapter sitting in front of an OAuth 2.0/OIDC IdP that provides the functionality (RFC 9728/8707/9207) required by the MCP authorization spec | https://github.com/velias/mcp-auth-adapter |

Recommended usage order: (1) scan the entire codebase with mcp-herald to enumerate breaking changes, (2) fix protocol-layer items such as sessions/error codes/Extensions, (3) standardize the authorization layer with mcp-auth-adapter, (4) run integration tests in a stateless environment (multiple instances + load balancer).

---

## 6. Conclusion and Recommendations

The core of the 2026-07-28 MCP spec is the shift to a stateless architecture, standardization of authorization under OAuth 2.1, and the introduction of the Extension Framework. As the trust boundaries the protocol used to provide implicitly disappear, security responsibility moves to developers and platform operators, and the quality of each implementation's security design now determines the overall security level of the system.

Given the 12-month deprecation window, the following phased approach is recommended.

| Phase | Duration (recommended) | Work |
|------|-----------|------|
| 1. Diagnosis | 1 month | mcp-herald scan, assess breaking-change impact |
| 2. Protocol migration | 2-3 months | Remove sessions, fix headers/error codes, migrate Extensions |
| 3. Authorization standardization | 2-3 months | Implement OAuth 2.1 flow, apply RFC 9728/8707/9207 |
| 4. Verification | 1-2 months | Stateless load testing, penetration testing, verify header/body mismatch and handle-tampering scenarios |
| 5. Parallel operation | Remaining time | Support old and new specs in parallel before retiring the legacy path |

In particular, throughout the migration it is essential to keep in mind that if validation logic for client-supplied data (resource handles, state objects, `_meta`) is missing during the stateless transition, hijacking and privilege-escalation vectors that did not exist in the session era can emerge.
