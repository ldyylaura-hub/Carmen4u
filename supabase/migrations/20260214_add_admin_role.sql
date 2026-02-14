-- Add role column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create a secure function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for media_items
-- Allow public read access (already exists, but ensuring)
DROP POLICY IF EXISTS "Media items are viewable by everyone" ON public.media_items;
CREATE POLICY "Media items are viewable by everyone" ON public.media_items FOR SELECT USING (true);

-- Allow only admins to insert/update/delete
CREATE POLICY "Admins can insert media items" ON public.media_items FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update media items" ON public.media_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete media items" ON public.media_items FOR DELETE USING (public.is_admin());

-- Update RLS policies for timeline_events
-- Allow public read access
DROP POLICY IF EXISTS "Timeline events are viewable by everyone" ON public.timeline_events;
CREATE POLICY "Timeline events are viewable by everyone" ON public.timeline_events FOR SELECT USING (true);

-- Allow only admins to insert/update/delete
CREATE POLICY "Admins can insert timeline events" ON public.timeline_events FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update timeline events" ON public.timeline_events FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete timeline events" ON public.timeline_events FOR DELETE USING (public.is_admin());

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
