CREATE TABLE scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL CHECK(length(username) <= 30),
  level_reached INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_scores_level ON scores(level_reached DESC);
