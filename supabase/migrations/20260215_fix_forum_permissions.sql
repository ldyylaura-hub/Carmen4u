-- Fix RLS policies for forum_posts to ensure users can insert
-- First, drop existing policies to avoid conflicts or duplication with slightly different names
drop policy if exists "Users can insert their own posts." on public.forum_posts;
drop policy if exists "Users can insert their own posts" on public.forum_posts;

-- Re-create the INSERT policy
create policy "Users can insert their own posts"
  on public.forum_posts for insert
  to authenticated
  with check ( auth.uid() = user_id );

-- Ensure columns exist with correct defaults
alter table public.forum_posts 
add column if not exists image_urls text[] default array[]::text[],
add column if not exists tags text[] default array[]::text[],
add column if not exists status text default 'pending' check (status in ('pending', 'approved', 'rejected'));

-- Grant usage on sequence if any (not needed for uuid but good practice for serials)
-- grant usage on sequence ... to authenticated;
