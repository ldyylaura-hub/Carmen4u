-- Add status column to forum_posts
alter table public.forum_posts 
add column if not exists status text default 'pending' check (status in ('pending', 'approved', 'rejected'));

-- Create avatars bucket if not exists
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up storage policies for avatars
drop policy if exists "Public Access avatars" on storage.objects;
drop policy if exists "Authenticated Uploads avatars" on storage.objects;
drop policy if exists "Authenticated Updates avatars" on storage.objects;
drop policy if exists "Authenticated Deletes avatars" on storage.objects;

create policy "Public Access avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Authenticated Uploads avatars"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'avatars' );

create policy "Authenticated Updates avatars"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'avatars' );

-- Update RLS for users table to allow users to update their own profile
drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update
  using ( auth.uid() = id );
