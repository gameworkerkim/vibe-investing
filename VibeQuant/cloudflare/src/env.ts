export interface Env {
  TOSS_CLIENT_ID?: string;
  TOSS_CLIENT_SECRET?: string;
  TOSS_BASE_URL?: string;
  DEFAULT_PROVIDER?: string;
  CDN_PUBLIC_BASE?: string;
  /** DeepSeek API — set via ./scripts/setup-deepseek.sh (never ship to Pages). */
  DEEPSEEK_API_KEY?: string;
  DB?: D1Database;
  DATA?: R2Bucket;
  STATIC?: R2Bucket;
}
