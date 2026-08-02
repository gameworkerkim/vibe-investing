-- 로드맵 2·3단계: 서버 신원 워터마크(변형 배정) 추적 + 세션→IP 연결

-- 세션→(앨범,페이지) 변형 할당 기록. 유출본의 변형 인덱스를 역으로 조회해 열람자 특정.
CREATE TABLE IF NOT EXISTS watermark_assignments (
  session_id TEXT NOT NULL,
  album_id INTEGER NOT NULL,
  page_no INTEGER NOT NULL,
  variant INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (session_id, album_id, page_no)
);

-- 뷰어 접속 세션 추적 (IP는 워터마크에서 제거하고 서버에서만 보관 — 로드맵 3단계)
CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  ip TEXT,
  user_agent TEXT,
  first_seen TEXT DEFAULT (datetime('now')),
  last_seen TEXT DEFAULT (datetime('now'))
);
