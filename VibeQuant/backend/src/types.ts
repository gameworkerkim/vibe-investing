export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface AssetInfo {
  id: string;
  provider: "yahoo" | "toss";
  symbol: string;
  name: string;
  assetType: string;
  exchange: string;
  currency: string;
}

export interface CandlesResponse {
  provider: string;
  symbol: string;
  interval: string;
  count: number;
  data: Candle[];
}

export interface PriceResponse {
  provider: string;
  symbol: string;
  prices: PricePoint[];
  count: number;
}

export interface LastPriceResponse {
  provider: string;
  symbol: string;
  last: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  };
}

export interface HealthResponse {
  service: string;
  version: string;
  timestamp: string;
  providers: {
    yahoo: { configured: boolean; status: string };
    toss: { configured: boolean; status: string };
  };
  redis: { configured: boolean };
  database: { configured: boolean };
  uptime: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  retryAfter?: number;
}
