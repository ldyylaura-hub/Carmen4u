-- 1. Update is_admin to check the database role instead of hardcoded email
-- This ensures consistency with the frontend check
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.users 
    where id = auth.uid() 
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Grant permissions for Admins to UPDATE (Approve) and DELETE (Reject) items

-- For Forum Posts
create policy "Admins can update posts"
  on public.forum_posts for update
  using ( public.is_admin() );

create policy "Admins can delete posts"
  on public.forum_posts for delete
  using ( public.is_admin() );

-- For Fan Art (Media Items)
alter table public.media_items enable row level security;

create policy "Admins can update media"
  on public.media_items for update
  using ( public.is_admin() );

create policy "Admins can delete media"
  on public.media_items for delete
  using ( public.is_admin() );

-- For Charms
alter table public.idol_charms enable row level security;

create policy "Admins can update charms"
  on public.idol_charms for update
  using ( public.is_admin() );

create policy "Admins can delete charms"
  on public.idol_charms for delete
  using ( public.is_admin() );
