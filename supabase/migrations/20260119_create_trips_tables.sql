-- Supabase SQL Migration: Create trips and trip_items tables
-- Run this in your Supabase SQL Editor

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    destination TEXT NOT NULL,
    summary TEXT,
    query TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trip_items table
CREATE TABLE IF NOT EXISTS trip_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    activity_id TEXT NOT NULL,
    day INTEGER NOT NULL,
    time_of_day TEXT NOT NULL CHECK (time_of_day IN ('morning', 'afternoon', 'evening')),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    currency TEXT DEFAULT 'EUR',
    image TEXT,
    product_url TEXT,
    status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'pending', 'booked')),
    booked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_items_trip_id ON trip_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_items_status ON trip_items(status);

-- Enable Row Level Security
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trips
CREATE POLICY "Users can view their own trips"
    ON trips FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips"
    ON trips FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
    ON trips FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
    ON trips FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for trip_items (via trip ownership)
CREATE POLICY "Users can view items of their trips"
    ON trip_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = trip_items.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert items to their trips"
    ON trip_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = trip_items.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update items of their trips"
    ON trip_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = trip_items.trip_id 
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete items of their trips"
    ON trip_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM trips 
            WHERE trips.id = trip_items.trip_id 
            AND trips.user_id = auth.uid()
        )
    );
