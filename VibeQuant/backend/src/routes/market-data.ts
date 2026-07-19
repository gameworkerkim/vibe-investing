import { Router, type Request, type Response } from "express";
import { validateProvider, validateSymbol } from "../middleware";
import { getYahooCandles } from "../providers/yahoo-finance";
import { getTossCandles } from "../providers/toss";
import { toPriceSeries } from "./candles";

const router = Router();

router.get(
  "/:provider/:symbol/price",
  validateProvider,
  validateSymbol,
  async (
    req: Request<{ provider: string; symbol: string }, any, any, { days?: string }>,
    res: Response
  ) => {
    try {
      const { provider, symbol } = req.params;
      const days = Math.min(Number(req.query.days) || 365, 3650);

      let candles;
      if (provider === "yahoo") {
        candles = await getYahooCandles(symbol.toUpperCase(), days);
      } else {
        candles = await getTossCandles(symbol, days);
      }

      res.json({
        provider,
        symbol: symbol.toUpperCase(),
        prices: toPriceSeries(candles),
        count: candles.length,
      });
    } catch (err: any) {
      res.status(502).json({
        error: "UPSTREAM_ERROR",
        message: err.message,
      });
    }
  }
);

router.get(
  "/:provider/:symbol/last",
  validateProvider,
  validateSymbol,
  async (
    req: Request<{ provider: string; symbol: string }>,
    res: Response
  ) => {
    try {
      const { provider, symbol } = req.params;

      let candles;
      if (provider === "yahoo") {
        candles = await getYahooCandles(symbol.toUpperCase(), 30);
      } else {
        candles = await getTossCandles(symbol, 30);
      }

      const last = candles[candles.length - 1];
      if (!last) {
        res.status(404).json({ error: "NO_DATA", message: "No price data found" });
        return;
      }

      res.json({
        provider,
        symbol: symbol.toUpperCase(),
        last: {
          date: last.timestamp.slice(0, 10),
          open: last.open,
          high: last.high,
          low: last.low,
          close: last.close,
          volume: last.volume,
        },
      });
    } catch (err: any) {
      res.status(502).json({
        error: "UPSTREAM_ERROR",
        message: err.message,
      });
    }
  }
);

export default router;
