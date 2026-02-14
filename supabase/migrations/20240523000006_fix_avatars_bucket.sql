-- Create the avatars bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up security policies for the avatars bucket
-- 1. Allow public access to view avatars
create policy "Public Access avatars"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 2. Allow authenticated users to upload their own avatar
create policy "Authenticated Uploads avatars"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'avatars' );

-- 3. Allow authenticated users to update their own avatar
create policy "Authenticated Updates avatars"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'avatars' );
