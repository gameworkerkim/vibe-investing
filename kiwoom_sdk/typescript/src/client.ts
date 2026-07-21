import { DEFAULT_BASE_URLS } from "./config";
import type { KiwoomAuth } from "./auth";

export interface KiwoomResponse {
  body: Record<string, unknown>;
  statusCode: number;
  hasContinuation: boolean;
  nextKey: string | null;
}

export class KiwoomHttpClient {
  private auth: KiwoomAuth;
  private timeout: number;

  constructor(auth: KiwoomAuth, timeout: number) {
    this.auth = auth;
    this.timeout = timeout;
  }

  async post(
    apiId: string,
    path: string,
    body: Record<string, unknown>,
    retry = true
  ): Promise<KiwoomResponse> {
    const market = (this.auth as any).config.market as string;
    const baseUrl = DEFAULT_BASE_URLS[market as "real" | "demo"];
    const url = `${baseUrl}${path}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "api-id": apiId,
        authorization: await this.auth.authorizationHeader(),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout * 1000),
    });

    if (response.status === 401 && retry) {
      await this.auth.issueToken();
      return this.post(apiId, path, body, false);
    }

    const data = await response.json().catch(() => ({}));

    return {
      body: data as Record<string, unknown>,
      statusCode: response.status,
      hasContinuation: response.headers.get("cont-yn") === "Y",
      nextKey: response.headers.get("next-key"),
    };
  }
}
