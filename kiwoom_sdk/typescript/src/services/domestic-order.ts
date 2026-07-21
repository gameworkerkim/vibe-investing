import type { KiwoomHttpClient } from "../client";
import type { OrderResult } from "../models";

function toInt(value: unknown): number {
  if (typeof value === "number") return Math.floor(value);
  if (typeof value === "string" && value !== "") return parseInt(value, 10);
  return 0;
}

export class DomesticOrderService {
  constructor(private http: KiwoomHttpClient) {}

  async buy(
    stockCode: string,
    quantity: number,
    price = 0,
    orderType = "0",
    exchange = "KRX"
  ): Promise<OrderResult> {
    return this.placeOrder(stockCode, quantity, price, orderType, "1", exchange);
  }

  async sell(
    stockCode: string,
    quantity: number,
    price = 0,
    orderType = "0",
    exchange = "KRX"
  ): Promise<OrderResult> {
    return this.placeOrder(stockCode, quantity, price, orderType, "2", exchange);
  }

  async modify(
    orderNumber: string,
    stockCode: string,
    quantity: number,
    price: number
  ): Promise<OrderResult> {
    const body: Record<string, string> = {
      dmst_stex_tp: "KRX",
      ord_no: orderNumber,
      stk_cd: stockCode,
      ord_qty: String(quantity),
      ord_uv: price > 0 ? String(Math.floor(price)) : "",
      trde_tp: "0",
      trad_tp: "0",
    };
    const response = await this.http.post("kt10002", "/api/dostk/ordr_rvsecncl", body);
    return this.buildResult(response, "KRX");
  }

  async cancel(orderNumber: string, stockCode: string): Promise<OrderResult> {
    const body: Record<string, string> = {
      dmst_stex_tp: "KRX",
      ord_no: orderNumber,
      stk_cd: stockCode,
      ord_qty: "0",
      ord_uv: "",
      trde_tp: "0",
      trad_tp: "1",
    };
    const response = await this.http.post("kt10003", "/api/dostk/ordr_rvsecncl", body);
    return this.buildResult(response, "KRX");
  }

  private async placeOrder(
    stockCode: string,
    quantity: number,
    price: number,
    orderType: string,
    tradeType: string,
    exchange: string
  ): Promise<OrderResult> {
    const body: Record<string, string> = {
      dmst_stex_tp: exchange,
      stk_cd: stockCode,
      ord_qty: String(quantity),
      trde_tp: orderType,
      trad_tp: tradeType,
    };
    if (price > 0) body.ord_uv = String(Math.floor(price));
    const response = await this.http.post("kt10000", "/api/dostk/ordr", body);
    return this.buildResult(response, exchange);
  }

  private buildResult(response: { body: Record<string, unknown> }, exchange: string): OrderResult {
    return {
      orderNumber: (response.body.ord_no as string) ?? "",
      returnCode: toInt(response.body.return_code),
      returnMsg: (response.body.return_msg as string) ?? "",
      exchange,
    };
  }
}
