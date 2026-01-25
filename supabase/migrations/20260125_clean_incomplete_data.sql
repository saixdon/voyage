-- =====================================================
-- CLEAN: Delete all incomplete data and reset ingestion
-- =====================================================

-- Delete products with null titles (incomplete data)
DELETE FROM products WHERE title IS NULL;

-- Delete ingestion logs so we start fresh
DELETE FROM viator_ingestion_log WHERE entity_type = 'products';

-- Verify cleanup
SELECT COUNT(*) as remaining_products FROM products;
SELECT COUNT(*) as remaining_logs FROM viator_ingestion_log WHERE entity_type = 'products';
