import { Router, type Request, type Response } from "express";
import { validateSymbol, validateProvider } from "../middleware";
import { getYahooCandles } from "../providers/yahoo-finance";
import { getTossCandles } from "../providers/toss";

const router = Router();

router.get(
  "/:provider/:symbol",
  validateProvider,
  validateSymbol,
  async (
    req: Request<
      { provider: string; symbol: string },
      any,
      any,
      { days?: string; interval?: string; limit?: string }
    >,
    res: Response
  ) => {
    try {
      const { provider, symbol } = req.params;
      const days = Math.min(Number(req.query.days) || 365, 3650);
      const interval =
        provider === "yahoo" && req.query.interval === "1wk" ? "1wk" : "1d";
      const limit = Math.min(Number(req.query.limit) || 0, 10000);

      let candles;
      if (provider === "yahoo") {
        candles = await getYahooCandles(symbol.toUpperCase(), days, interval);
      } else if (provider === "toss") {
        candles = await getTossCandles(symbol, days);
      } else {
        res.status(400).json({ error: "INVALID_PROVIDER" });
        return;
      }

      let result = candles;
      if (limit > 0) {
        result = result.slice(-limit);
      }

      res.json({
        provider,
        symbol: symbol.toUpperCase(),
        interval,
        count: result.length,
        data: result,
      });
    } catch (err: any) {
      console.error(
        `[candles] ${req.params.provider}/${req.params.symbol}:`,
        err.message
      );
      res.status(502).json({
        error: "UPSTREAM_ERROR",
        message: `Failed to fetch candles: ${err.message}`,
      });
    }
  }
);

export function getLastClose(
  candles: { timestamp: string; close: number; volume: number }[]
) {
  for (let i = candles.length - 1; i >= 0; i--) {
    if (candles[i].close && candles[i].close > 0) return candles[i];
  }
  return null;
}

export function toPriceSeries(
  candles: { timestamp: string; close: number }[]
): { date: string; price: number }[] {
  return candles
    .filter((c) => c.close > 0)
    .map((c) => ({ date: c.timestamp.slice(0, 10), price: c.close }));
}

export default router;
