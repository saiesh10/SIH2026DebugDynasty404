CREATE TABLE subsidiary (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE mine (
  id SERIAL PRIMARY KEY,
  subsidiary_id INT REFERENCES subsidiary(id),
  name TEXT NOT NULL,
  latitude FLOAT,
  longitude FLOAT
);

CREATE TABLE contractor (
  id SERIAL PRIMARY KEY,
  mine_id INT REFERENCES mine(id),
  name TEXT,
  work_permit_expiry DATE
);

CREATE TABLE compliance_record (
  id SERIAL PRIMARY KEY,
  mine_id INT REFERENCES mine(id),
  type TEXT CHECK (type IN ('EC','CTO','mine_plan_sanction','labour_license')),
  issue_date DATE,
  expiry_date DATE,
  status TEXT CHECK (status IN ('valid','expired','pending_renewal')),
  responsible_officer TEXT
);

CREATE TABLE inspection (
  id SERIAL PRIMARY KEY,
  mine_id INT REFERENCES mine(id),
  inspector_name TEXT,
  inspection_date DATE,
  category TEXT CHECK (category IN ('safety','environment','labour')),
  findings TEXT,
  severity TEXT CHECK (severity IN ('low','medium','high'))
);

CREATE TABLE corrective_action (
  id SERIAL PRIMARY KEY,
  inspection_id INT REFERENCES inspection(id),
  description TEXT,
  due_date DATE,
  status TEXT CHECK (status IN ('open','in_progress','closed')) DEFAULT 'open'
);

CREATE TABLE field_report (
  id SERIAL PRIMARY KEY,
  mine_id INT REFERENCES mine(id),
  latitude FLOAT,
  longitude FLOAT,
  photo_url TEXT,
  category TEXT CHECK (category IN ('safety_observation','incident','attendance')),
  submitted_at TIMESTAMP DEFAULT now(),
  synced BOOLEAN DEFAULT true
);

CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  action TEXT,
  table_name TEXT,
  record_id INT,
  prev_hash TEXT,
  this_hash TEXT,
  created_at TIMESTAMP DEFAULT now()
);