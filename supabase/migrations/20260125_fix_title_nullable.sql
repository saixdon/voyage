-- =====================================================
-- FIX: Make title column nullable to handle edge cases
-- =====================================================

ALTER TABLE products ALTER COLUMN title DROP NOT NULL;

-- Verify
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'title';
