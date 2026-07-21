import { DEFAULT_BASE_URLS, type Config, TOKEN_PATH } from "../config";
import { AuthError } from "../errors";

interface TokenPayload {
  access_token: string;
  token_type: string;
  expires_at: string;
}

export class KiwoomAuth {
  private config: Config;
  private accessToken: string | null = null;
  private expiresAt: Date | null = null;

  constructor(config: Config) {
    this.config = config;
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && this.expiresAt && new Date() < this.expiresAt) {
      return this.accessToken;
    }
    return this.issueToken();
  }

  async issueToken(): Promise<string> {
    const baseUrl = DEFAULT_BASE_URLS[this.config.market];
    const response = await fetch(`${baseUrl}${TOKEN_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        appkey: this.config.appKey,
        secretkey: this.config.appSecret,
      }),
      signal: AbortSignal.timeout(this.config.timeout * 1000),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AuthError(`Token request failed: HTTP ${response.status}`);
    }

    const token = data.token;
    const expiresDt = data.expires_dt;

    if (!token || !expiresDt) {
      throw new AuthError("Token response missing required fields");
    }

    this.accessToken = token;
    this.expiresAt = new Date(Date.now() + 86400 * 1000);
    return token;
  }

  async authorizationHeader(): Promise<string> {
    return `Bearer ${await this.getAccessToken()}`;
  }
}
