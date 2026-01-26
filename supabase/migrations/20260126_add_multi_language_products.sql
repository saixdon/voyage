-- =====================================================
-- Multi-Language Support for Products
-- Adds localized title and description columns
-- =====================================================

-- Step 1: Add JSONB columns for localized content
-- Format: {"en": "English Title", "de": "Deutscher Titel", "fr": "Titre français", ...}

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS titles_by_locale JSONB DEFAULT '{}'::jsonb;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS descriptions_by_locale JSONB DEFAULT '{}'::jsonb;

-- Step 2: Migrate existing English data into the new JSONB columns
UPDATE products 
SET titles_by_locale = jsonb_build_object('en', title)
WHERE titles_by_locale = '{}'::jsonb AND title IS NOT NULL;

UPDATE products 
SET descriptions_by_locale = jsonb_build_object('en', description)
WHERE descriptions_by_locale = '{}'::jsonb AND description IS NOT NULL;

-- Step 3: Create a helper function to get localized title with fallback
CREATE OR REPLACE FUNCTION get_localized_title(p products, locale TEXT DEFAULT 'en')
RETURNS TEXT AS $$
BEGIN
    -- Try requested locale first, fall back to English, then to base title
    RETURN COALESCE(
        p.titles_by_locale->>locale,
        p.titles_by_locale->>'en',
        p.title
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 4: Create a helper function to get localized description with fallback
CREATE OR REPLACE FUNCTION get_localized_description(p products, locale TEXT DEFAULT 'en')
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        p.descriptions_by_locale->>locale,
        p.descriptions_by_locale->>'en',
        p.description
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 5: Create index for faster locale-based searches
CREATE INDEX IF NOT EXISTS idx_products_titles_locale ON products USING gin(titles_by_locale);
CREATE INDEX IF NOT EXISTS idx_products_descriptions_locale ON products USING gin(descriptions_by_locale);

-- Step 6: Add column to track which locales have been synced
ALTER TABLE viator_ingestion_log 
ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';

COMMENT ON COLUMN products.titles_by_locale IS 'Localized titles: {"en": "...", "de": "...", "fr": "..."}';
COMMENT ON COLUMN products.descriptions_by_locale IS 'Localized descriptions by language code';
