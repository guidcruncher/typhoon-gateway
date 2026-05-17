-- migrate:up
CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  apiId TEXT NOT NULL,
  eventType TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  statusCode INTEGER NOT NULL,
  latencyMs INTEGER,
  clientIp TEXT,
  version TEXT
);

CREATE INDEX IF NOT EXISTS idx_stats_apiId ON stats (apiId);
CREATE INDEX IF NOT EXISTS idx_stats_eventType ON stats (eventType);
CREATE INDEX IF NOT EXISTS idx_stats_statusCode ON stats (statusCode);
CREATE INDEX IF NOT EXISTS idx_stats_timestamp ON stats (timestamp);

-- migrate:down
DROP TABLE IF EXISTS stats;
