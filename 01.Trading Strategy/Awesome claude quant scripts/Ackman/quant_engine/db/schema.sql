-- Ackman Quant Engine — MySQL schema
-- 적용: mysql -u root -p < db/schema.sql

CREATE DATABASE IF NOT EXISTS ackman_quant
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ackman_quant;

CREATE TABLE IF NOT EXISTS tickers (
  ticker            VARCHAR(20)  NOT NULL PRIMARY KEY,
  market            ENUM('KR', 'US') NOT NULL,
  name              VARCHAR(120) NULL,
  sector            VARCHAR(120) NULL,
  is_special_situation TINYINT(1) NOT NULL DEFAULT 0,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS price_snapshots (
  id                BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ticker            VARCHAR(20)  NOT NULL,
  as_of_date        DATE         NOT NULL,
  price             DECIMAL(18,4) NULL,
  pct_from_52w_low  DECIMAL(8,4) NULL,
  pct_from_52w_high DECIMAL(8,4) NULL,
  above_50ma        TINYINT(1)   NULL,
  above_200ma       TINYINT(1)   NULL,
  rsi_14            DECIMAL(6,2) NULL,
  avg_volume_30d    BIGINT       NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ticker_date (ticker, as_of_date),
  CONSTRAINT fk_price_ticker FOREIGN KEY (ticker) REFERENCES tickers(ticker)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fundamental_snapshots (
  id                BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ticker            VARCHAR(20)  NOT NULL,
  period            VARCHAR(20)  NOT NULL,          -- 예: 2026Q1, FY2025
  source            ENUM('DART', 'YAHOO') NOT NULL,
  revenue           DECIMAL(24,2) NULL,
  operating_income  DECIMAL(24,2) NULL,
  net_income        DECIMAL(24,2) NULL,
  fcf               DECIMAL(24,2) NULL,
  debt_ratio        DECIMAL(8,4) NULL,               -- 부채비율(%)
  per               DECIMAL(10,4) NULL,
  pbr               DECIMAL(10,4) NULL,
  psr               DECIMAL(10,4) NULL,
  ev_ebitda         DECIMAL(10,4) NULL,
  fcf_yield         DECIMAL(8,4) NULL,
  roe               DECIMAL(8,4) NULL,
  roic              DECIMAL(8,4) NULL,
  revenue_growth_yoy DECIMAL(8,4) NULL,
  net_income_growth_yoy DECIMAL(8,4) NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ticker_period_source (ticker, period, source),
  CONSTRAINT fk_fund_ticker FOREIGN KEY (ticker) REFERENCES tickers(ticker)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS news_items (
  id                BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ticker            VARCHAR(20)  NOT NULL,
  published_at      DATETIME     NULL,
  title             VARCHAR(500) NOT NULL,
  url               VARCHAR(1000) NULL,
  source             VARCHAR(120) NULL,
  sentiment_score   DECIMAL(5,4) NULL,               -- -1.0 ~ +1.0
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_news_ticker FOREIGN KEY (ticker) REFERENCES tickers(ticker)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ackman_scores (
  id                BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ticker            VARCHAR(20)  NOT NULL,
  run_date          DATE         NOT NULL,
  quality_score     DECIMAL(5,2) NOT NULL,
  valuation_score   DECIMAL(5,2) NOT NULL,
  catalyst_score    DECIMAL(5,2) NOT NULL,
  risk_score        DECIMAL(5,2) NOT NULL,
  total_score       DECIMAL(5,2) NOT NULL,
  grade             ENUM('Strong Buy', 'Buy', 'Watch', 'Pass') NOT NULL,
  position_weight_pct DECIMAL(5,2) NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ticker_rundate (ticker, run_date),
  CONSTRAINT fk_score_ticker FOREIGN KEY (ticker) REFERENCES tickers(ticker)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ackman_reports (
  id                BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ticker            VARCHAR(20)  NOT NULL,
  run_date          DATE         NOT NULL,
  report_text       LONGTEXT     NOT NULL,
  model_used        VARCHAR(60)  NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ticker_rundate_report (ticker, run_date),
  CONSTRAINT fk_report_ticker FOREIGN KEY (ticker) REFERENCES tickers(ticker)
    ON DELETE CASCADE
) ENGINE=InnoDB;
