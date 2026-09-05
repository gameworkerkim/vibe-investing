/** 공통 JSON 응답 헬퍼 (Vibe_Invest_Dashboard/shared/http.ts 스타일). */

export function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}

export function badRequest(message: string): Response {
  return jsonResponse({ ok: false, error: "bad_request", message }, 400);
}

export function serverError(message: string): Response {
  return jsonResponse({ ok: false, error: "internal_error", message }, 500);
}
