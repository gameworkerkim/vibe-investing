import { Router, type Request, type Response } from "express";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const status = {
    service: "vibequant-data",
    version: "0.0.1",
    timestamp: new Date().toISOString(),
    providers: {
      yahoo: {
        configured: true,
        status: "available",
      },
      toss: {
        configured: !!(process.env.TOSS_CLIENT_ID && process.env.TOSS_CLIENT_SECRET),
        status:
          process.env.TOSS_CLIENT_ID && process.env.TOSS_CLIENT_SECRET
            ? "available"
            : "not_configured",
      },
    },
    redis: {
      configured: !!(process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN),
    },
    database: {
      configured: !!process.env.DATABASE_URL,
    },
    uptime: process.uptime(),
  };

  res.json(status);
});

export default router;
