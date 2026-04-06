-- Fix updated_at for all PAID_OUT deals to be within 3-25 days of created_at
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

-- Fix AWZ-2026-0044 (APPROVED): approval should be within 20 days
UPDATE credit_requests SET updated_at = created_at + interval '20 days' WHERE tracking_id = 'AWZ-2026-0044';

-- Fix status_history for AWZ-2026-0044: VP_PENDING->APPROVED should be ~20 days after submission
UPDATE status_history SET created_at = '2026-03-08 14:00:00+00'
WHERE request_id = 'c1000000-0000-0000-0000-000000000003' AND to_status = 'APPROVED';

-- Fix VP_PENDING step to be around day 14
UPDATE status_history SET created_at = '2026-03-04 10:00:00+00'
WHERE request_id = 'c1000000-0000-0000-0000-000000000003' AND to_status = 'VP_PENDING';

-- Fix Director step to day 7
UPDATE status_history SET created_at = '2026-02-27 15:00:00+00'
WHERE request_id = 'c1000000-0000-0000-0000-000000000003' AND to_status = 'DIRECTOR_PENDING';