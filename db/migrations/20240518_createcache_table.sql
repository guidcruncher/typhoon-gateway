-- migrate:up
CREATE TABLE IF NOT EXISTS cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cache_expires
  ON cache (expires_at);

-- migrate:down
DROP TABLE IF EXISTS cache;
