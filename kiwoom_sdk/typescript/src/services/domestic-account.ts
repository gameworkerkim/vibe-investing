import type { KiwoomHttpClient, KiwoomResponse } from "../client";
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

function extractMap(body: Record<string, unknown>, key: string): Record<string, unknown> {
  const raw = body[key];
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, unknown>;
  if (Array.isArray(raw) && raw.length > 0) return raw[0] as Record<string, unknown>;
  return {};
}

export class DomesticAccountService {
  constructor(private http: KiwoomHttpClient) {}

  async listAccounts(): Promise<AccountInfo[]> {
    const response = await this.http.post("ka00001", "/api/dostk/acnt", {});
    return extractList(response.body, "output1").map((entry) => ({
      accountNumber: (entry.acnt_no as string) ?? "",
      accountName: (entry.acnt_name as string) ?? "",
      balance: 0,
      deposit: 0,
      totalValue: 0,
      profitLoss: 0,
      profitLossRatio: 0,
      currency: "KRW",
    }));
  }

  async getBalance(accountNumber: string): Promise<AccountInfo> {
    const response = await this.http.post("ka01690", "/api/dostk/bal", { acnt_no: accountNumber });
    let output = extractMap(response.body, "output1");
    if (Object.keys(output).length === 0) output = extractMap(response.body, "output2");
    return {
      accountNumber,
      accountName: "",
      balance: 0,
      deposit: toNumber(output.dmst_dncl_amt),
      totalValue: toNumber(output.tot_evlu_amt),
      profitLoss: toNumber(output.evlu_pfls_rt),
      profitLossRatio: toNumber(output.evlu_erng_rt1),
      currency: "KRW",
    };
  }

  async listHoldings(accountNumber: string): Promise<Holding[]> {
    const response = await this.http.post("ka10072", "/api/dostk/hldg", { acnt_no: accountNumber });
    return extractList(response.body, "output1").map((entry) => ({
      stockCode: (entry.stk_cd as string) ?? "",
      stockName: (entry.stk_nm as string) ?? "",
      quantity: toInt(entry.hldg_qty),
      averagePrice: toNumber(entry.pchs_avg_pric),
      currentPrice: toNumber(entry.now_pric),
      totalValue: toNumber(entry.evlu_amt),
      profitLoss: toNumber(entry.evlu_pfls_amt),
      profitLossRatio: toNumber(entry.evlu_pfls_rt),
    }));
  }
}
