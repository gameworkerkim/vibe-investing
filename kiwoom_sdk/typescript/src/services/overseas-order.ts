import type { KiwoomHttpClient } from "../client";
import type { OrderResult } from "../models";

function toInt(value: unknown): number {
  if (typeof value === "number") return Math.floor(value);
  if (typeof value === "string" && value !== "") return parseInt(value, 10);
  return 0;
}

export class OverseasOrderService {
  constructor(private http: KiwoomHttpClient) {}

  async buy(
    stockCode: string,
    quantity: number,
    price = 0,
    orderType = "0",
    exchange = "ND"
  ): Promise<OrderResult> {
    return this.placeOrder(stockCode, quantity, price, orderType, "1", exchange);
  }

  async sell(
    stockCode: string,
    quantity: number,
    price = 0,
    orderType = "0",
    exchange = "ND"
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
      ovrs_excg_cd: "ND",
      ord_no: orderNumber,
      stk_cd: stockCode,
      ord_qty: String(quantity),
      ord_uv: price > 0 ? String(price) : "",
      trde_tp: "0",
      trad_tp: "0",
    };
    const response = await this.http.post("ust20002", "/api/us/ordr_rvsecncl", body);
    return this.buildResult(response, "ND");
  }

  async cancel(orderNumber: string, stockCode: string): Promise<OrderResult> {
    const body: Record<string, string> = {
      ovrs_excg_cd: "ND",
      ord_no: orderNumber,
      stk_cd: stockCode,
      ord_qty: "0",
      ord_uv: "",
      trde_tp: "0",
      trad_tp: "1",
    };
    const response = await this.http.post("ust20003", "/api/us/ordr_rvsecncl", body);
    return this.buildResult(response, "ND");
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
      ovrs_excg_cd: exchange,
      stk_cd: stockCode,
      ord_qty: String(quantity),
      trde_tp: orderType,
      trad_tp: tradeType,
    };
    if (price > 0) body.ord_uv = String(price);
    const response = await this.http.post("ust20000", "/api/us/ordr", body);
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
