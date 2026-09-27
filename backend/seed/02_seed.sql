-- ============================================================
-- KhanRakshak demo seed
-- 3 subsidiaries -> 10 mines -> 40 compliance -> 60 inspections
-- Includes expired clearances and overdue corrective actions.
-- ============================================================

-- ------------------------------------------------------------
-- SUBSIDIARIES
-- ------------------------------------------------------------

INSERT INTO subsidiary (name) VALUES
  ('Northern Coalfields Limited'),
  ('South Eastern Coalfields Limited'),
  ('Western Coalfields Limited');


-- ------------------------------------------------------------
-- MINES
-- ------------------------------------------------------------

INSERT INTO mine (subsidiary_id, name, latitude, longitude) VALUES
  (1, 'Jayant Mine',       24.1330, 82.6820),
  (1, 'Nigahi Mine',       24.1830, 82.6530),
  (1, 'Dudhichua Mine',    24.1500, 82.7000),
  (1, 'Kakri Mine',        24.0800, 82.6900),

  (2, 'Gevra Mine',        22.3450, 82.6250),
  (2, 'Dipka Mine',        22.3700, 82.5600),
  (2, 'Kusmunda Mine',     22.4000, 82.6000),

  (3, 'Wani North Mine',   20.0500, 78.9500),
  (3, 'Umrer Mine',        20.8700, 79.3000),
  (3, 'Majri Mine',        20.2500, 78.9500);


-- ------------------------------------------------------------
-- CONTRACTORS
-- 20 contractors; some permits deliberately lapsed.
-- ------------------------------------------------------------

INSERT INTO contractor (mine_id, name, work_permit_expiry)
SELECT
  ((g - 1) % 10) + 1,
  'Contractor ' || LPAD(g::text, 2, '0'),
  CASE
    WHEN g IN (2, 7, 13, 18) THEN CURRENT_DATE - 30
    WHEN g IN (5, 11, 16) THEN CURRENT_DATE - 5
    ELSE CURRENT_DATE + 180
  END
FROM generate_series(1, 20) AS g;


-- ------------------------------------------------------------
-- COMPLIANCE RECORDS
-- Exactly 4 records per mine = 40 records.
-- Includes valid, expired and pending_renewal statuses.
-- ------------------------------------------------------------

INSERT INTO compliance_record
  (mine_id, type, issue_date, expiry_date, status, responsible_officer)
SELECT
  m.id,
  t.type,
  CASE
    WHEN t.type = 'EC' THEN DATE '2024-01-15'
    WHEN t.type = 'CTO' THEN DATE '2024-06-01'
    WHEN t.type = 'mine_plan_sanction' THEN DATE '2023-07-10'
    ELSE DATE '2025-01-01'
  END,
  CASE
    -- Deliberately expired clearances
    WHEN t.type = 'EC' AND m.id IN (2, 5, 8) THEN CURRENT_DATE - 120
    WHEN t.type = 'CTO' AND m.id IN (3, 6, 9) THEN CURRENT_DATE - 45

    -- Deliberately pending renewals
    WHEN t.type = 'mine_plan_sanction' AND m.id IN (1, 4, 7, 10)
      THEN CURRENT_DATE + 15
    WHEN t.type = 'labour_license' AND m.id IN (2, 6, 10)
      THEN CURRENT_DATE + 20

    -- Normal valid records
    ELSE CURRENT_DATE + 365
  END,
  CASE
    WHEN
      (t.type = 'EC' AND m.id IN (2, 5, 8))
      OR
      (t.type = 'CTO' AND m.id IN (3, 6, 9))
    THEN 'expired'

    WHEN
      (t.type = 'mine_plan_sanction' AND m.id IN (1, 4, 7, 10))
      OR
      (t.type = 'labour_license' AND m.id IN (2, 6, 10))
    THEN 'pending_renewal'

    ELSE 'valid'
  END,
  'Officer ' || LPAD(m.id::text, 2, '0')
FROM mine m
CROSS JOIN (
  VALUES
    ('EC'),
    ('CTO'),
    ('mine_plan_sanction'),
    ('labour_license')
) AS t(type);


-- ------------------------------------------------------------
-- INSPECTIONS
-- Exactly 6 inspections per mine = 60 inspections.
-- ------------------------------------------------------------

INSERT INTO inspection
  (mine_id, inspector_name, inspection_date, category, findings, severity)
SELECT
  m.id,
  'Inspector ' || (((g - 1) % 6) + 1),
  CURRENT_DATE - (((g - 1) % 180) + 1),
  CASE ((g - 1) % 3)
    WHEN 0 THEN 'safety'
    WHEN 1 THEN 'environment'
    ELSE 'labour'
  END,
  CASE
    WHEN ((g - 1) % 5) = 0
      THEN 'Corrective action required for observed non-conformance.'
    WHEN ((g - 1) % 5) = 1
      THEN 'Minor observation recorded during inspection.'
    ELSE 'Inspection completed with routine observations.'
  END,
  CASE ((g - 1) % 3)
    WHEN 0 THEN 'high'
    WHEN 1 THEN 'medium'
    ELSE 'low'
  END
FROM mine m
CROSS JOIN generate_series(1, 6) AS s(g);


-- ------------------------------------------------------------
-- CORRECTIVE ACTIONS
-- Several deliberately overdue and open for risk-engine testing.
-- ------------------------------------------------------------

INSERT INTO corrective_action
  (inspection_id, description, due_date, status)
VALUES
  (1,  'Repair emergency access route and document completion.', CURRENT_DATE - 45, 'open'),
  (2,  'Update environmental monitoring records.',               CURRENT_DATE - 30, 'open'),
  (3,  'Renew contractor safety documentation.',                 CURRENT_DATE - 20, 'open'),
  (4,  'Complete electrical safety corrective work.',             CURRENT_DATE - 15, 'open'),
  (5,  'Close outstanding labour compliance observation.',        CURRENT_DATE - 10, 'open'),
  (6,  'Install required safety signage.',                        CURRENT_DATE + 15, 'in_progress'),
  (7,  'Update emergency response documentation.',                CURRENT_DATE + 20, 'in_progress'),
  (8,  'Complete drainage maintenance.',                          CURRENT_DATE - 25, 'open'),
  (9,  'Correct PPE compliance observation.',                     CURRENT_DATE - 12, 'open'),
  (10, 'Submit environmental inspection evidence.',               CURRENT_DATE + 10, 'in_progress'),
  (11, 'Repair inspection-area lighting.',                        CURRENT_DATE - 35, 'open'),
  (12, 'Update attendance documentation.',                        CURRENT_DATE + 25, 'closed');


-- ------------------------------------------------------------
-- FIELD REPORTS
-- ------------------------------------------------------------

INSERT INTO field_report
  (mine_id, latitude, longitude, photo_url, category, synced)
VALUES
  (1, 24.1331, 82.6821, '/uploads/jayant-safety.jpg',    'safety_observation', true),
  (2, 24.1831, 82.6531, '/uploads/nigahi-incident.jpg',   'incident',           true),
  (3, 24.1501, 82.7001, '/uploads/dudhichua-att.jpg',    'attendance',         true),
  (4, 24.0801, 82.6901, '/uploads/kakri-safety.jpg',      'safety_observation', true),
  (5, 22.3451, 82.6251, '/uploads/gevra-incident.jpg',    'incident',           true),
  (6, 22.3701, 82.5601, '/uploads/dipka-safety.jpg',      'safety_observation', true),
  (7, 22.4001, 82.6001, '/uploads/kusmunda-att.jpg',      'attendance',         true),
  (8, 20.0501, 78.9501, '/uploads/wani-incident.jpg',     'incident',           true),
  (9, 20.8701, 79.3001, '/uploads/umrer-safety.jpg',      'safety_observation', true),
  (10,20.2501, 78.9501, '/uploads/majri-att.jpg',         'attendance',         true);


-- ------------------------------------------------------------
-- AUDIT LOG
-- ------------------------------------------------------------

INSERT INTO audit_log
  (action, table_name, record_id, prev_hash, this_hash)
VALUES
  ('CREATE', 'subsidiary', 1, NULL, 'seed-hash-001'),
  ('CREATE', 'subsidiary', 2, NULL, 'seed-hash-002'),
  ('CREATE', 'subsidiary', 3, NULL, 'seed-hash-003'),
  ('CREATE', 'mine',       1, NULL, 'seed-hash-004'),
  ('CREATE', 'mine',       2, 'seed-hash-004', 'seed-hash-005'),
  ('CREATE', 'mine',       3, 'seed-hash-005', 'seed-hash-006'),
  ('CREATE', 'inspection', 1, 'seed-hash-006', 'seed-hash-007'),
  ('CREATE', 'inspection', 2, 'seed-hash-007', 'seed-hash-008'),
  ('CREATE', 'compliance_record', 1, 'seed-hash-008', 'seed-hash-009'),
  ('CREATE', 'corrective_action', 1, 'seed-hash-009', 'seed-hash-010');