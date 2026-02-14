-- Create buckets
insert into storage.buckets (id, name, public)
values ('gallery_uploads', 'gallery_uploads', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Enable RLS (Usually enabled by default, skipping to avoid permission errors)
-- alter table storage.objects enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Public Access gallery_uploads" on storage.objects;
drop policy if exists "Authenticated Uploads gallery_uploads" on storage.objects;
drop policy if exists "Authenticated Updates gallery_uploads" on storage.objects;
drop policy if exists "Authenticated Deletes gallery_uploads" on storage.objects;

drop policy if exists "Public Access media" on storage.objects;
drop policy if exists "Authenticated Uploads media" on storage.objects;
drop policy if exists "Authenticated Updates media" on storage.objects;
drop policy if exists "Authenticated Deletes media" on storage.objects;

-- Create policies for gallery_uploads
create policy "Public Access gallery_uploads"
  on storage.objects for select
  using ( bucket_id = 'gallery_uploads' );

create policy "Authenticated Uploads gallery_uploads"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'gallery_uploads' );

create policy "Authenticated Updates gallery_uploads"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'gallery_uploads' );

create policy "Authenticated Deletes gallery_uploads"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'gallery_uploads' );

-- Create policies for media
create policy "Public Access media"
  on storage.objects for select
  using ( bucket_id = 'media' );

create policy "Authenticated Uploads media"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'media' );

create policy "Authenticated Updates media"
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'media' );

create policy "Authenticated Deletes media"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'media' );
