-- Temporarily disable the updated_at trigger
ALTER TABLE credit_requests DISABLE TRIGGER update_credit_requests_updated_at;

-- Fix updated_at for all PAID_OUT deals
UPDATE credit_requests SET updated_at = created_at + interval '8 days' WHERE tracking_id = 'AWZ-2026-0001';
UPDATE credit_requests SET updated_at = created_at + interval '12 days' WHERE tracking_id = 'AWZ-2026-0002';
UPDATE credit_requests SET updated_at = created_at + interval '5 days' WHERE tracking_id = 'AWZ-2026-0003';
UPDATE credit_requests SET updated_at = created_at + interval '4 days' WHERE tracking_id = 'AWZ-2026-0004';
UPDATE credit_requests SET updated_at = created_at + interval '15 days' WHERE tracking_id = 'AWZ-2026-0005';
UPDATE credit_requests SET updated_at = created_at + interval '10 days' WHERE tracking_id = 'AWZ-2026-0006';
UPDATE credit_requests SET updated_at = created_at + interval '18 days' WHERE tracking_id = 'AWZ-2026-0007';
UPDATE credit_requests SET updated_at = created_at + interval '22 days' WHERE tracking_id = 'AWZ-2026-0008';
UPDATE credit_requests SET updated_at = created_at + interval '6 days' WHERE tracking_id = 'AWZ-2026-0009';
UPDATE credit_requests SET updated_at = created_at + interval '20 days' WHERE tracking_id = 'AWZ-2026-0010';
UPDATE credit_requests SET updated_at = created_at + interval '7 days' WHERE tracking_id = 'AWZ-2026-0011';
UPDATE credit_requests SET updated_at = created_at + interval '14 days' WHERE tracking_id = 'AWZ-2026-0012';
UPDATE credit_requests SET updated_at = created_at + interval '25 days' WHERE tracking_id = 'AWZ-2026-0013';
UPDATE credit_requests SET updated_at = created_at + interval '9 days' WHERE tracking_id = 'AWZ-2026-0014';
UPDATE credit_requests SET updated_at = created_at + interval '16 days' WHERE tracking_id = 'AWZ-2026-0015';
UPDATE credit_requests SET updated_at = created_at + interval '5 days' WHERE tracking_id = 'AWZ-2026-0016';
UPDATE credit_requests SET updated_at = created_at + interval '11 days' WHERE tracking_id = 'AWZ-2026-0017';
UPDATE credit_requests SET updated_at = created_at + interval '23 days' WHERE tracking_id = 'AWZ-2026-0018';
UPDATE credit_requests SET updated_at = created_at + interval '8 days' WHERE tracking_id = 'AWZ-2026-0019';
UPDATE credit_requests SET updated_at = created_at + interval '19 days' WHERE tracking_id = 'AWZ-2026-0020';
UPDATE credit_requests SET updated_at = created_at + interval '20 days' WHERE tracking_id = 'AWZ-2026-0044';

-- Re-enable the trigger
ALTER TABLE credit_requests ENABLE TRIGGER update_credit_requests_updated_at;