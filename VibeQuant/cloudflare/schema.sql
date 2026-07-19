-- D1 schema (meta/index only — candle bodies in R2)
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT,
  currency TEXT DEFAULT 'USD',
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_assets_ps ON assets(provider, symbol);

CREATE TABLE IF NOT EXISTS candle_objects (
  asset_id TEXT NOT NULL,
  interval TEXT NOT NULL DEFAULT '1d',
  r2_key TEXT NOT NULL,
  rows INTEGER,
  from_ts TEXT,
  to_ts TEXT,
  refreshed_at TEXT NOT NULL,
  PRIMARY KEY (asset_id, interval)
);

CREATE TABLE IF NOT EXISTS watchlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'yahoo',
  priority INTEGER DEFAULT 100
);
