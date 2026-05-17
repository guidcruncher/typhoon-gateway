-- migrate:up
CREATE TABLE IF NOT EXISTS stats_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  type TEXT NOT NULL,        -- counter | histogram | gauge
  key TEXT NOT NULL,         -- canonical key or operationId
  value REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stats_events_key
  ON stats_events (key);

CREATE INDEX IF NOT EXISTS idx_stats_events_timestamp
  ON stats_events (timestamp);

-- migrate:down
DROP TABLE IF EXISTS stats_events;
