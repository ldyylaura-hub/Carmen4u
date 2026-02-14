-- Add display_order column to albums
ALTER TABLE albums ADD COLUMN IF NOT EXISTS display_order SERIAL;

-- Add display_order column to timeline_events
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS display_order SERIAL;

-- Add display_order column to media_items (for sorting within an album)
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS display_order SERIAL;

-- Enable RLS for updates on these columns (if not already covered by existing policies)
-- The existing policies usually cover 'update' on the whole row, so this should be fine.
