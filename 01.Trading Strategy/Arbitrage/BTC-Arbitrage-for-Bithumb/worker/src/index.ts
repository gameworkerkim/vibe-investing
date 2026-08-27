import { handleApi } from "./api";
import { Env } from "./env";
import { runArbitrageScan } from "./scan";

/**
 * bithumb-arbitrage-signals
 *
 * - scheduled : 5분마다 빗썸·바이낸스·환율을 조회해 김치 프리미엄 기반 차익거래 시그널을
 *               평가하고, 트리거되면 텔레그램으로 알림을 보낸다.
 * - fetch     : /api/* 는 JSON API, 그 외 경로는 정적 대시보드(worker/static)를 서빙한다.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }
    return env.ASSETS.fetch(request);
  },

  async scheduled(event: ScheduledController, env: Env): Promise<void> {
    const result = await runArbitrageScan(env);
    console.log(
      `[scheduled ${event.cron}] ok=${result.ok} alerts=${result.alertsSent} ` +
        `usdKrw=${result.usdKrw} error=${result.error ?? "-"}`
    );
  },
} satisfies ExportedHandler<Env>;
