import { Router, type Request, type Response } from "express";
import { validateSymbol } from "../middleware";
import { getYahooAssetInfo } from "../providers/yahoo-finance";
import { getTossAssetInfo } from "../providers/toss";

const router = Router();

router.get("/:provider/:symbol", validateSymbol, async (req: Request<{ provider: string; symbol: string }>, res: Response) => {
  try {
    const { provider, symbol } = req.params;
    const upper = symbol.toUpperCase();

    let info;
    if (provider === "yahoo") {
      info = await getYahooAssetInfo(upper);
    } else if (provider === "toss") {
      info = await getTossAssetInfo(upper);
    } else {
      res.status(400).json({ error: "INVALID_PROVIDER" });
      return;
    }

    res.json({
      id: `${provider}:${upper}`,
      provider,
      ...info,
    });
  } catch (err: any) {
    console.error(`[assets] ${req.params.provider}/${req.params.symbol}:`, err.message);
    res.status(502).json({
      error: "UPSTREAM_ERROR",
      message: `Failed to fetch asset info: ${err.message}`,
    });
  }
});

export default router;
