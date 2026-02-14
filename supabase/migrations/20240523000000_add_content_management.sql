-- Create home_content table
CREATE TABLE IF NOT EXISTS home_content (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;

-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('concept', 'poster', 'mv', 'fancam', 'cut', 'fan_art')),
    description TEXT,
    cover_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

-- Update media_items table
ALTER TABLE media_items 
ADD COLUMN IF NOT EXISTS album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected'));

-- Update timeline_events table
ALTER TABLE timeline_events
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS album_id UUID REFERENCES albums(id) ON DELETE SET NULL;

-- RLS Policies

-- home_content
CREATE POLICY "Allow public read access home_content" ON home_content FOR SELECT USING (true);
CREATE POLICY "Allow admin full access home_content" ON home_content FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- albums
CREATE POLICY "Allow public read access albums" ON albums FOR SELECT USING (true);
CREATE POLICY "Allow admin full access albums" ON albums FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- media_items policies
-- Note: We are adding to existing policies. Ensure we don't break public access.
-- Drop existing broad policies if necessary, but for now we'll add specific ones.
-- Ideally we should review existing policies, but assuming 'public read' exists.

CREATE POLICY "Allow authenticated users to upload fan art" ON media_items FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    status = 'pending'
);

CREATE POLICY "Allow admin to see all media including pending" ON media_items FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Allow admin to update media" ON media_items FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Allow admin to delete media" ON media_items FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- timeline_events
CREATE POLICY "Allow admin full access timeline_events" ON timeline_events FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Grant permissions
GRANT SELECT ON home_content TO anon, authenticated;
GRANT ALL ON home_content TO authenticated;

GRANT SELECT ON albums TO anon, authenticated;
GRANT ALL ON albums TO authenticated;

GRANT SELECT ON media_items TO anon, authenticated;
GRANT ALL ON media_items TO authenticated;

GRANT SELECT ON timeline_events TO anon, authenticated;
GRANT ALL ON timeline_events TO authenticated;
