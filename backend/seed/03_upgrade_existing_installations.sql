ALTER TABLE field_report
  ADD COLUMN IF NOT EXISTS observation TEXT NOT NULL DEFAULT '';

ALTER TABLE field_report
  ADD COLUMN IF NOT EXISTS voice_note_url TEXT;

ALTER TABLE compliance_record
  ADD COLUMN IF NOT EXISTS data_source TEXT CHECK (data_source IN ('PARIVESH', 'manual', 'other'));

CREATE TABLE IF NOT EXISTS notification (
  id SERIAL PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  notification_type TEXT NOT NULL,
  mine_id INT REFERENCES mine(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  read_at TIMESTAMP
);