-- =====================================================
-- SETUP PG_CRON JOBS FOR VIATOR SYNC
-- =====================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Clean up old jobs if they exist (to avoid duplicates)
SELECT cron.unschedule('viator-products-sync');
SELECT cron.unschedule('viator-availability-sync');
SELECT cron.unschedule('viator-bookings-check');

-- 3. Define Secrets & URL
-- PRODUCTION URL: https://tripvega.com
-- The CRON_SECRET is already correctly inserted.

-- JOB 1: Sync Products (Every Hour at :00)
SELECT cron.schedule(
  'viator-products-sync',
  '0 * * * *', 
  $$
  SELECT net.http_get(
    url := 'https://tripvega.com/api/cron/viator-products',
    headers := jsonb_build_object('Authorization', 'Bearer uFUTN1XvYSW90EDPdozq1QLLHc0NF1OjE1rK51FTaGU')
  );
  $$
);

-- JOB 2: Sync Availability (Every Hour at :30)
SELECT cron.schedule(
  'viator-availability-sync',
  '30 * * * *', 
  $$
  SELECT net.http_get(
    url := 'https://tripvega.com/api/cron/viator-availability',
    headers := jsonb_build_object('Authorization', 'Bearer uFUTN1XvYSW90EDPdozq1QLLHc0NF1OjE1rK51FTaGU')
  );
  $$
);

-- JOB 3: Check Bookings (Every 3 Minutes)
SELECT cron.schedule(
  'viator-bookings-check',
  '*/3 * * * *', 
  $$
  SELECT net.http_get(
    url := 'https://tripvega.com/api/cron/viator-bookings',
    headers := jsonb_build_object('Authorization', 'Bearer uFUTN1XvYSW90EDPdozq1QLLHc0NF1OjE1rK51FTaGU')
  );
  $$
);

-- 4. Verify Active Jobs
SELECT * FROM cron.job;
