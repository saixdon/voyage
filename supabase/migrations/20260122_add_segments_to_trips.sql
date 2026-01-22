-- Add segments column to trips table to store transport, pause, and food preferences
ALTER TABLE trips ADD COLUMN IF NOT EXISTS segments JSONB DEFAULT '{}'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN trips.segments IS 'Stores metadata for intervals between activities (transport, pauses, restaurants)';
