-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure permissions are granted (redundant if already granted, but safe)
GRANT INSERT ON users TO authenticated;
