export type Market = "real" | "demo";

export const DEFAULT_BASE_URLS: Record<Market, string> = {
  real: "https://api.kiwoom.com",
  demo: "https://mockapi.kiwoom.com",
};

export const TOKEN_PATH = "/oauth2/token";

export interface Config {
  appKey: string;
  appSecret: string;
  market: Market;
  timeout: number;
}
