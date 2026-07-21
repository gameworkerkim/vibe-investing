export interface AccountInfo {
  accountNumber: string;
  accountName: string;
  balance: number;
  deposit: number;
  totalValue: number;
  profitLoss: number;
  profitLossRatio: number;
  currency: string;
}

export interface Holding {
  stockCode: string;
  stockName: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossRatio: number;
}

export interface OrderResult {
  orderNumber: string;
  returnCode: number;
  returnMsg: string;
  exchange: string;
}
