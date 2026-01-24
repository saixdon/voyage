-- =====================================================
-- Viator Data Cache Tables
-- These tables store ingested data from Viator API
-- to enable local search and reduce API calls
-- =====================================================

-- 1. PRODUCTS TABLE (Main Product Catalog)
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Pricing (stored as JSONB for flexibility)
    pricing JSONB,
    
    -- Images (array of image objects)
    images JSONB,
    
    -- Reviews
    reviews JSONB,
    
    -- Duration
    duration JSONB,
    
    -- Destinations (array of destination refs)
    destinations JSONB,
    
    -- Tags (array of tag IDs)
    tags JSONB,
    
    -- Full Viator URL with affiliate tracking
    product_url TEXT,
    
    -- Status for filtering
    status TEXT DEFAULT 'ACTIVE',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    viator_modified_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_products_title ON products USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);

-- 2. DESTINATIONS TABLE
CREATE TABLE IF NOT EXISTS viator_destinations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    destination_id INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT, -- CITY, REGION, COUNTRY, etc.
    parent_id INTEGER, -- For hierarchy
    
    -- Localized names (stored as JSONB: {"en": "Paris", "de": "Paris", ...})
    names_by_locale JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_destinations_name ON viator_destinations(name);
CREATE INDEX IF NOT EXISTS idx_destinations_type ON viator_destinations(type);

-- 3. TAGS TABLE
CREATE TABLE IF NOT EXISTS viator_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tag_id INTEGER NOT NULL UNIQUE,
    
    -- Localized names (stored as JSONB: {"en": "Food & Drink", "de": "Essen & Trinken", ...})
    names_by_locale JSONB,
    
    -- Parent tags for hierarchy
    parent_tag_ids JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tags_tag_id ON viator_tags(tag_id);

-- 4. AVAILABILITY SCHEDULES TABLE (for cached availability)
CREATE TABLE IF NOT EXISTS viator_availability_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_code TEXT NOT NULL REFERENCES products(product_code) ON DELETE CASCADE,
    
    -- Schedule data from Viator
    schedule_data JSONB,
    
    -- When this schedule was last fetched
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Viator's modification timestamp
    viator_modified_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(product_code)
);

CREATE INDEX IF NOT EXISTS idx_availability_product ON viator_availability_schedules(product_code);

-- 5. INGESTION LOG TABLE (to track sync status)
CREATE TABLE IF NOT EXISTS viator_ingestion_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type TEXT NOT NULL, -- 'products', 'destinations', 'tags', 'availability'
    
    -- Cursor for modified-since pagination
    last_cursor TEXT,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Stats
    items_processed INTEGER DEFAULT 0,
    items_created INTEGER DEFAULT 0,
    items_updated INTEGER DEFAULT 0,
    
    -- Error tracking
    error_message TEXT,
    status TEXT DEFAULT 'running' -- 'running', 'completed', 'failed'
);

CREATE INDEX IF NOT EXISTS idx_ingestion_log_entity ON viator_ingestion_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_ingestion_log_status ON viator_ingestion_log(status);

-- =====================================================
-- RLS POLICIES (Read-only for authenticated users)
-- =====================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE viator_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE viator_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE viator_availability_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE viator_ingestion_log ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read (public catalog)
CREATE POLICY "Public read access for products"
    ON products FOR SELECT
    USING (true);

-- Destinations: Everyone can read
CREATE POLICY "Public read access for destinations"
    ON viator_destinations FOR SELECT
    USING (true);

-- Tags: Everyone can read
CREATE POLICY "Public read access for tags"
    ON viator_tags FOR SELECT
    USING (true);

-- Availability: Everyone can read
CREATE POLICY "Public read access for availability"
    ON viator_availability_schedules FOR SELECT
    USING (true);

-- Ingestion Log: Only service role can read/write (admin only)
-- No public policy needed

COMMENT ON TABLE products IS 'Cached Viator product catalog - synced hourly via modified-since';
COMMENT ON TABLE viator_destinations IS 'Cached Viator destinations - synced weekly';
COMMENT ON TABLE viator_tags IS 'Cached Viator tags/categories - synced weekly';
COMMENT ON TABLE viator_availability_schedules IS 'Cached availability schedules - synced hourly';
COMMENT ON TABLE viator_ingestion_log IS 'Tracks ingestion job status and cursors';
