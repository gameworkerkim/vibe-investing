const SYMBOL_RE = /^[A-Za-z0-9.%^=-]{1,32}$/;
const PROVIDERS = new Set(["yahoo", "mock", "toss"]);

export type CandleQuery = {
  provider: string;
  symbol: string;
  days: number;
};

export function parseCandleParams(
  providerRaw: string,
  symbolRaw: string,
  daysRaw: string | null
): { ok: true; value: CandleQuery } | { ok: false; error: string; message: string; status: number } {
  const provider = decodeURIComponent(providerRaw || "").toLowerCase();
  if (!PROVIDERS.has(provider)) {
    return {
      ok: false,
      error: "INVALID_PROVIDER",
      message: "provider must be yahoo, mock, or toss",
      status: 400,
    };
  }

  let symbol = decodeURIComponent(symbolRaw || "").trim();
  if (!SYMBOL_RE.test(symbol)) {
    return {
      ok: false,
      error: "INVALID_SYMBOL",
      message: "symbol must match [A-Za-z0-9.%^=-]{1,32}",
      status: 400,
    };
  }

  let days = Number.parseInt(daysRaw || "90", 10);
  if (!Number.isFinite(days)) days = 90;
  days = Math.min(3650, Math.max(1, days));

  return { ok: true, value: { provider, symbol, days } };
}
