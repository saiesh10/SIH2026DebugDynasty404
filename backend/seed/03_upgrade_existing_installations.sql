ALTER TABLE field_report
  ADD COLUMN IF NOT EXISTS observation TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS notification (
  id SERIAL PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  notification_type TEXT NOT NULL,
  mine_id INT REFERENCES mine(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  read_at TIMESTAMP
);