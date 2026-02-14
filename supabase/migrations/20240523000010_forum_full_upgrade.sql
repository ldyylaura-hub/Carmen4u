-- 1. Support Images in Posts
-- Create bucket for post images
insert into storage.buckets (id, name, public)
values ('forum_images', 'forum_images', true)
on conflict (id) do nothing;

-- Policies for forum_images
create policy "Public view forum images"
  on storage.objects for select
  using ( bucket_id = 'forum_images' );

create policy "Users can upload forum images"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'forum_images' );

-- Add image_urls column to posts (store array of URLs)
alter table public.forum_posts 
add column if not exists image_urls text[] default array[]::text[];

-- 2. Support Tags
-- We'll store tags as a simple text array on the post for now (easier than many-to-many for MVP)
alter table public.forum_posts 
add column if not exists tags text[] default array[]::text[];

-- 3. Support Reports
create table if not exists public.forum_reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references auth.users(id) on delete cascade not null,
  post_id uuid references public.forum_posts(id) on delete cascade not null,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Reports
alter table public.forum_reports enable row level security;

create policy "Users can create reports"
  on public.forum_reports for insert
  with check ( auth.uid() = reporter_id );

create policy "Admins can view all reports"
  on public.forum_reports for select
  using ( public.is_admin() );

create policy "Admins can update reports"
  on public.forum_reports for update
  using ( public.is_admin() );
