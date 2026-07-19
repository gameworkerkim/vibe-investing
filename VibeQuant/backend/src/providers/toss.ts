import { cacheGet, cacheSet } from "../db/redis";

const TOSS_BASE = process.env.TOSS_BASE_URL || "https://openapi.tossinvest.com";

let _accessToken: string | null = null;
let _tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (_accessToken && Date.now() < _tokenExpiry) return _accessToken;

  const clientId = process.env.TOSS_CLIENT_ID;
  const clientSecret = process.env.TOSS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("TOSS_CLIENT_ID and TOSS_CLIENT_SECRET must be set");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${TOSS_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`TOSS auth failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  _accessToken = data.access_token;
  _tokenExpiry = Date.now() + (data.expires_in - 30) * 1000;
  return _accessToken;
}

interface TossCandle {
  time: string;
  open_price: number;
  close_price: number;
  high_price: number;
  low_price: number;
  volume: number;
}

export async function getTossCandles(
  symbol: string,
  days = 365
): Promise<
  { timestamp: string; open: number; high: number; low: number; close: number; volume: number }[]
> {
  if (!process.env.TOSS_CLIENT_ID) {
    throw new Error("TOSS API not configured — set TOSS_CLIENT_ID and TOSS_CLIENT_SECRET");
  }

  const cacheKey = `toss:candles:${symbol}:${days}`;
  const cached = await cacheGet<
    { timestamp: string; open: number; high: number; low: number; close: number; volume: number }[]
  >(cacheKey);
  if (cached) return cached;

  const token = await getAccessToken();
  const all: TossCandle[] = [];
  const pageSize = 200;
  let before: string | undefined = undefined;

  while (all.length < Math.ceil(days / 1) * 1) {
    const params = new URLSearchParams({
      symbol,
      interval: "1d",
      count: String(pageSize),
      ...(before ? { before } : {}),
    });

    const res = await fetch(
      `${TOSS_BASE}/api/v1/candles?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error(`TOSS candles failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as TossCandle[];
    if (!data.length) break;

    all.push(...data);
    before = data[data.length - 1].time;

    await new Promise((r) => setTimeout(r, 200));
  }

  const result = all.map((c) => ({
    timestamp: new Date(c.time).toISOString(),
    open: c.open_price,
    high: c.high_price,
    low: c.low_price,
    close: c.close_price,
    volume: c.volume,
  }));

  result.sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  await cacheSet(cacheKey, result);
  return result;
}

export async function getTossAssetInfo(
  symbol: string
): Promise<{
  symbol: string;
  name: string;
  assetType: string;
  exchange: string;
  currency: string;
}> {
  if (!process.env.TOSS_CLIENT_ID) {
    throw new Error("TOSS API not configured");
  }

  const cacheKey = `toss:asset:${symbol}`;
  const cached = await cacheGet<ReturnType<typeof getTossAssetInfo>>(cacheKey);
  if (cached) return cached;

  const token = await getAccessToken();
  const res = await fetch(
    `${TOSS_BASE}/api/v1/stocks?symbol=${encodeURIComponent(symbol)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`TOSS stock info failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    symbol: string;
    name?: string;
    exchange?: string;
    currency?: string;
    type?: string;
  };

  const info = {
    symbol: data.symbol,
    name: data.name || symbol,
    assetType: data.type || "EQUITY",
    exchange: data.exchange || "Unknown",
    currency: data.currency || "KRW",
  };

  await cacheSet(cacheKey, info);
  return info;
}
