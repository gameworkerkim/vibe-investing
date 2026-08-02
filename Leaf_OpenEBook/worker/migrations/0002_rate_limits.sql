-- 로드맵 1단계: D1 기반 분당 레이트리밋 테이블 (세션·IP·엔드포인트별)

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,             -- scope + window: e.g. 'img:<sid>:1787...' | 'img:ip:1.2.3.4:...'
  window_start INTEGER NOT NULL, -- epoch 초 (분 단위로 정규화)
  count INTEGER DEFAULT 0,
  PRIMARY KEY (key, window_start)
);
