CREATE TABLE IF NOT EXISTS cloud_custom_venues (
  id TEXT PRIMARY KEY,
  sync_space_id TEXT NOT NULL,
  venue_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (sync_space_id) REFERENCES sync_spaces(id)
);

CREATE TABLE IF NOT EXISTS cloud_user_preferences (
  sync_space_id TEXT PRIMARY KEY,
  preferences_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sync_space_id) REFERENCES sync_spaces(id)
);
