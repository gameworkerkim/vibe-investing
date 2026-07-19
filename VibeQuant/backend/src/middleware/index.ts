import type { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import { getGlobalLimiter, getRouteLimiter } from "../db/redis";

export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });
}

export function corsMiddleware() {
  return cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://vibe-investing.vercel.app", "https://vibequant.vercel.app"]
        : "*",
    methods: ["GET", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  });
}

export function globalRateLimit() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getGlobalLimiter().limit(
        req.ip || "unknown"
      );
      if (!result.success) {
        res.set("Retry-After", "1");
        res.set("X-RateLimit-Limit", String(result.limit));
        res.set("X-RateLimit-Remaining", String(result.remaining));
        res.set("X-RateLimit-Reset", String(result.reset));
        res.status(429).json({
          error: "TOO_MANY_REQUESTS",
          message: "Global rate limit exceeded. Retry after 1 second.",
          retryAfter: 1,
        });
        return;
      }
      res.set("X-Global-RateLimit-Limit", String(result.limit));
      res.set("X-Global-RateLimit-Remaining", String(result.remaining));
      next();
    } catch {
      next();
    }
  };
}

export function routeRateLimit(routeName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await getRouteLimiter(routeName).limit(
        `${req.ip}:${routeName}`
      );
      if (!result.success) {
        res.set("Retry-After", "1");
        res.set("X-RouteRateLimit-Limit", String(result.limit));
        res.set("X-RouteRateLimit-Remaining", String(result.remaining));
        res.status(429).json({
          error: "RATE_LIMITED",
          message: `Route '${routeName}' rate limit exceeded (${result.limit}/s).`,
          retryAfter: 1,
        });
        return;
      }
      res.set("X-RouteRateLimit-Remaining", String(result.remaining));
      next();
    } catch {
      next();
    }
  };
}

export function validateSymbol(req: Request, res: Response, next: NextFunction) {
  const symbol = req.params.symbol as string;
  if (!symbol || !/^[A-Za-z0-9.%^\-=]{1,32}$/.test(symbol)) {
    res.status(400).json({
      error: "INVALID_SYMBOL",
      message: "Symbol must be 1-32 alphanumeric characters.",
    });
    return;
  }
  next();
}

export function validateProvider(req: Request, res: Response, next: NextFunction) {
  const provider = req.params.provider as string;
  const allowed = ["yahoo", "toss"];
  if (!provider || !allowed.includes(provider.toLowerCase())) {
    res.status(400).json({
      error: "INVALID_PROVIDER",
      message: `Provider must be one of: ${allowed.join(", ")}`,
    });
    return;
  }
  next();
}

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-api-key"] as string | undefined || req.query.api_key as string | undefined;
  const expected = process.env.API_KEY;
  if (expected && key !== expected) {
    res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Invalid or missing API key.",
    });
    return;
  }
  next();
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Endpoint not found.",
  });
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error("[error]", err.message);
  res.status(500).json({
    error: "INTERNAL_ERROR",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error.",
  });
}
