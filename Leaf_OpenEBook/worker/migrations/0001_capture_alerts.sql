-- Leaf MVP: 캡처 알림 로그 테이블
-- (P3/P4 단계에서 users/albums/pages/purchases 확장 예정 — 기능명세 §9.4)

CREATE TABLE IF NOT EXISTS capture_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id INTEGER,
  page_no INTEGER,
  detail TEXT,
  ip TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_capture_alerts_created ON capture_alerts(created_at);
