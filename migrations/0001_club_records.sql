CREATE TABLE IF NOT EXISTS club_records (
  collection TEXT NOT NULL,
  record_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  PRIMARY KEY (collection, record_id)
);

CREATE TABLE IF NOT EXISTS club_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  revision INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO club_meta (id, revision) VALUES (1, 0);
