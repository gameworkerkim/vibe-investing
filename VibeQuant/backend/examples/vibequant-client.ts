"""
VibeQuant Data Backend — TypeScript Client Example

Usage:
    import { VibeQuantClient } from './vibequant-client';
    const client = new VibeQuantClient('http://localhost:8080');

    const candles = await client.getCandles('yahoo', 'AAPL', 365);
    const price = await client.getLastPrice('yahoo', 'AAPL');
    const health = await client.getHealth();
"""

interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PricePoint {
  date: string;
  price: number;
}

interface HealthResponse {
  service: string;
  version: string;
  providers: Record<string, { configured: boolean; status: string }>;
  uptime: number;
}

export class VibeQuantClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  private async request<T>(path: string): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) headers["X-API-Key"] = this.apiKey;

    const res = await fetch(`${this.baseUrl}${path}`, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `VibeQuant API ${res.status}: ${err.message || res.statusText}`
      );
    }
    return res.json() as Promise<T>;
  }

  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/api/health");
  }

  async getCandles(
    provider: "yahoo" | "toss",
    symbol: string,
    days = 365
  ): Promise<Candle[]> {
    const data = await this.request<{ data: Candle[] }>(
      `/api/v1/candles/${provider}/${symbol}?days=${days}`
    );
    return data.data;
  }

  async getPriceSeries(
    provider: "yahoo" | "toss",
    symbol: string,
    days = 365
  ): Promise<PricePoint[]> {
    const data = await this.request<{ prices: PricePoint[] }>(
      `/api/v1/market-data/${provider}/${symbol}/price?days=${days}`
    );
    return data.prices;
  }

  async getLastPrice(
    provider: "yahoo" | "toss",
    symbol: string
  ): Promise<{ date: string; close: number }> {
    const data = await this.request<{ last: { date: string; close: number } }>(
      `/api/v1/market-data/${provider}/${symbol}/last`
    );
    return data.last;
  }

  async getAsset(
    provider: "yahoo" | "toss",
    symbol: string
  ): Promise<Record<string, unknown>> {
    return this.request(`/api/v1/assets/${provider}/${symbol}`);
  }
}
