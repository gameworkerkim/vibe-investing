import express from "express";
import {
  securityHeaders,
  corsMiddleware,
  globalRateLimit,
  routeRateLimit,
  notFoundHandler,
  errorHandler,
  requireApiKey,
} from "./middleware";
import healthRouter from "./routes/health";
import candlesRouter from "./routes/candles";
import marketDataRouter from "./routes/market-data";
import assetsRouter from "./routes/assets";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  app.use(securityHeaders());
  app.use(corsMiddleware());
  app.use(express.json({ limit: "1mb" }));

  app.use(globalRateLimit());

  if (process.env.API_KEY) {
    app.use("/api", requireApiKey);
  }

  // ── Health (no API key required) ──────────────────────
  app.get("/api/health", routeRateLimit("health"), healthRouter);

  // ── Data endpoints ────────────────────────────────────
  app.use(
    "/api/v1/candles",
    routeRateLimit("candles"),
    candlesRouter
  );
  app.use(
    "/api/v1/market-data",
    routeRateLimit("market-data"),
    marketDataRouter
  );
  app.use(
    "/api/v1/assets",
    routeRateLimit("assets"),
    assetsRouter
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

const port = Number(process.env.PORT) || 8080;
const app = createApp();
app.listen(port, () => {
  console.log(`[vibequant-data] running on http://localhost:${port}`);
  console.log(`[vibequant-data] providers: yahoo(yes) toss(${process.env.TOSS_CLIENT_ID ? "configured" : "not configured"})`);
});

export default app;
