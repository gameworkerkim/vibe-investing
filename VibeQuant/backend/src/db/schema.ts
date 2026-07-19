import {
  pgTable,
  varchar,
  timestamp,
  doublePrecision,
  bigint,
  index,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const marketAssets = pgTable(
  "market_assets",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    provider: varchar("provider", { length: 32 }).notNull(),
    symbol: varchar("symbol", { length: 32 }).notNull(),
    name: varchar("name", { length: 256 }),
    assetType: varchar("asset_type", { length: 32 }).notNull().default("EQUITY"),
    exchange: varchar("exchange", { length: 32 }),
    currency: varchar("currency", { length: 8 }).notNull().default("USD"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_assets_provider_symbol").on(table.provider, table.symbol),
    index("idx_assets_type").on(table.assetType),
  ]
);

export const marketCandles = pgTable(
  "market_candles",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    assetId: varchar("asset_id", { length: 64 })
      .notNull()
      .references(() => marketAssets.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 32 }).notNull(),
    interval: varchar("interval", { length: 16 }).notNull().default("1d"),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    open: doublePrecision("open"),
    high: doublePrecision("high"),
    low: doublePrecision("low"),
    close: doublePrecision("close"),
    volume: bigint("volume", { mode: "number" }),
    meta: jsonb("meta"),
  },
  (table) => [
    index("idx_candles_asset_time").on(table.assetId, table.timestamp.desc()),
    index("idx_candles_asset_interval_time").on(
      table.assetId,
      table.interval,
      table.timestamp.desc()
    ),
    uniqueIndex("idx_candles_unique").on(
      table.assetId,
      table.provider,
      table.interval,
      table.timestamp
    ),
  ]
);

export const cacheMetadata = pgTable(
  "cache_metadata",
  {
    cacheKey: varchar("cache_key", { length: 256 }).primaryKey(),
    provider: varchar("provider", { length: 32 }).notNull(),
    endpoint: varchar("endpoint", { length: 128 }),
    hitCount: bigint("hit_count", { mode: "number" }).default(0),
    missCount: bigint("miss_count", { mode: "number" }).default(0),
    lastRefreshed: timestamp("last_refreshed"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);
