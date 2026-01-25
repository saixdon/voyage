-- =====================================================
-- FIX: Allow Service Role to write to products table
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Service role write products" ON products;

-- Create new policies
-- 1. Everyone can read
CREATE POLICY "Public read products"
    ON products FOR SELECT
    USING (true);

-- 2. Service role can write (for ingestion)
CREATE POLICY "Service role write products"
    ON products FOR ALL
    USING (true)
    WITH CHECK (true);

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'products';
