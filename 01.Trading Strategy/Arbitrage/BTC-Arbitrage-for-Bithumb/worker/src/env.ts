export interface Env {
  /** 정적 자산 바인딩 (wrangler.jsonc assets.binding) */
  ASSETS: Fetcher;
  /** KV 네임스페이스 (스냅샷·히스토리·알림 상태) */
  ARB_DATA: KVNamespace;
  /** 텔레그램 봇 토큰 (secret) */
  TELEGRAM_BOT_TOKEN?: string;
  /** 텔레그램 채팅 ID (secret) */
  TELEGRAM_CHAT_ID?: string;
  /** 관리 토큰 — 수동 리프레시·테스트 API 인증용 (secret) */
  ADMIN_TOKEN?: string;
  ENVIRONMENT?: string;
  COINS?: string;
  SIGNAL_THRESHOLD_PCT?: string;
  SIGNAL_CLEAR_PCT?: string;
  ALERT_COOLDOWN_MIN?: string;
  BITHUMB_TAKER_FEE_PCT?: string;
  BINANCE_TAKER_FEE_PCT?: string;
  ASSUMED_CAPITAL_KRW?: string;
}
