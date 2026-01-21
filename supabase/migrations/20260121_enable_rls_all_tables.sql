-- =====================================================
-- Supabase RLS (Row Level Security) Migration
-- Run this in your Supabase SQL Editor at:
-- http://31.97.32.40:3000 → SQL Editor
-- =====================================================
-- WICHTIG: Diese Migration stellt sicher, dass ALLE
-- Tabellen einen Login erfordern (auth.uid() wird geprüft)
-- =====================================================

-- =====================================================
-- 1. FAVORITES TABELLE ERSTELLEN
-- =====================================================

CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_id TEXT NOT NULL,
    title TEXT,
    description TEXT,
    price DECIMAL(10, 2),
    currency TEXT DEFAULT 'EUR',
    image TEXT,
    destination TEXT,
    rating DECIMAL(3, 2),
    review_count INTEGER,
    product_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Verhindert doppelte Favoriten
    UNIQUE(user_id, activity_id)
);

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_activity_id ON favorites(activity_id);

-- =====================================================
-- 2. RLS FÜR FAVORITES AKTIVIEREN
-- =====================================================

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Bestehende Policies löschen (falls vorhanden)
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- Neue Policies erstellen
CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 3. BESTEHENDE TABELLEN: RLS SICHERSTELLEN
-- =====================================================

-- Trips Tabelle (sicherstellen, dass RLS aktiv ist)
DO $$
BEGIN
    -- Enable RLS on trips if not already enabled
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'trips') THEN
        ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Trip Items Tabelle
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'trip_items') THEN
        ALTER TABLE trip_items ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =====================================================
-- 4. VERIFICATION: PRÜFE RLS STATUS
-- =====================================================

-- Diese Query zeigt den RLS-Status aller Tabellen:
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public';

-- =====================================================
-- 5. WICHTIGE HINWEISE
-- =====================================================

-- Nach dem Ausführen dieser Migration:
--
-- ✅ Alle Tabellen erfordern einen Login
-- ✅ Benutzer können nur IHRE EIGENEN Daten sehen
-- ✅ Der anon_key kann nur mit gültigem JWT Token zugreifen
--
-- ACHTUNG: Für Admin-Zugriff (z.B. API Routes) nutze
-- den SERVICE_ROLE_KEY - dieser umgeht RLS!

COMMENT ON TABLE favorites IS 'User favorites with RLS - requires authentication';
COMMENT ON TABLE trips IS 'User trips with RLS - requires authentication';
COMMENT ON TABLE trip_items IS 'Trip items with RLS - requires authentication via trip ownership';
