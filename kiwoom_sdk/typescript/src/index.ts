import { KiwoomAuth } from "./auth";
import { KiwoomHttpClient } from "./client";
import type { Config, Market } from "./config";
import { DomesticAccountService } from "./services/domestic-account";
import { DomesticOrderService } from "./services/domestic-order";
import { OverseasAccountService } from "./services/overseas-account";
import { OverseasOrderService } from "./services/overseas-order";

export class KiwoomClient {
  private config: Config;
  auth: KiwoomAuth;
  private http: KiwoomHttpClient;
  domesticAccount: DomesticAccountService;
  domesticOrder: DomesticOrderService;
  overseasAccount: OverseasAccountService;
  overseasOrder: OverseasOrderService;

  constructor(
    appKey: string,
    appSecret: string,
    market: Market = "real",
    timeout = 30
  ) {
    this.config = { appKey, appSecret, market, timeout };
    this.auth = new KiwoomAuth(this.config);
    this.http = new KiwoomHttpClient(this.auth, timeout);
    this.domesticAccount = new DomesticAccountService(this.http);
    this.domesticOrder = new DomesticOrderService(this.http);
    this.overseasAccount = new OverseasAccountService(this.http);
    this.overseasOrder = new OverseasOrderService(this.http);
  }

  async authenticate(): Promise<string> {
    return this.auth.issueToken();
  }

  close(): void {}
}

export { KiwoomError, AuthError, APIError, InvalidCredentialsError, TokenExpiredError, RateLimitError, SymbolNotFoundError } from "./errors";
export type { AccountInfo, Holding, OrderResult } from "./models";
