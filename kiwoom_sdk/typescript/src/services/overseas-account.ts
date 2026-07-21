import type { KiwoomHttpClient } from "../client";
import type { AccountInfo, Holding } from "../models";

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value !== "") return parseFloat(value);
  return 0;
}

function toInt(value: unknown): number {
  if (typeof value === "number") return Math.floor(value);
  if (typeof value === "string" && value !== "") return parseInt(value, 10);
  return 0;
}

function extractList(body: Record<string, unknown>, key: string): Record<string, unknown>[] {
  const raw = body[key];
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (raw && typeof raw === "object") return [raw as Record<string, unknown>];
  return [];
}

export class OverseasAccountService {
  constructor(private http: KiwoomHttpClient) {}

  async listAccounts(): Promise<AccountInfo[]> {
    const response = await this.http.post("ust21050", "/api/us/acnt", {});
    return extractList(response.body, "output1").map((entry) => ({
      accountNumber: (entry.acnt_no as string) ?? "",
      accountName: (entry.acnt_name as string) ?? "",
      balance: 0,
      deposit: 0,
      totalValue: 0,
      profitLoss: 0,
      profitLossRatio: 0,
      currency: "USD",
    }));
  }

  async getBalance(accountNumber: string): Promise<AccountInfo> {
    const response = await this.http.post("ust21070", "/api/us/bal", { acnt_no: accountNumber });
    const output = extractList(response.body, "output1")[0] || {};
    return {
      accountNumber,
      accountName: "",
      balance: 0,
      deposit: toNumber(output.dmst_dncl_amt),
      totalValue: 0,
      profitLoss: 0,
      profitLossRatio: 0,
      currency: "USD",
    };
  }

  async listHoldings(accountNumber: string): Promise<Holding[]> {
    const response = await this.http.post("ust21661", "/api/us/hldg", { acnt_no: accountNumber });
    return extractList(response.body, "output1").map((entry) => ({
      stockCode: (entry.stk_cd as string) ?? "",
      stockName: (entry.stk_nm as string) ?? "",
      quantity: toInt(entry.hldg_qty),
      averagePrice: toNumber(entry.pchs_avg_pric),
      currentPrice: 0,
      totalValue: 0,
      profitLoss: 0,
      profitLossRatio: 0,
    }));
  }
}
