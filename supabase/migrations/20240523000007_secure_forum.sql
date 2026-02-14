-- 1. Create is_admin function to check if current user is admin
-- (Assuming we identify admins by email or a role column in users table)
-- For simplicity, let's assume specific emails are admins or check public.users role
create or replace function public.is_admin()
returns boolean as $$
declare
  current_user_role text;
begin
  select role into current_user_role from public.users where id = auth.uid();
  return current_user_role = 'admin' or auth.email() = 'carmen_club@foxmail.com'; -- Add your email here
end;
$$ language plpgsql security definer;

-- 2. Update RLS for forum_posts to be secure
drop policy if exists "Public posts are viewable by everyone." on public.forum_posts;

create policy "Anyone can view approved posts"
  on public.forum_posts for select
  using ( status = 'approved' );

create policy "Users can view their own pending posts"
  on public.forum_posts for select
  using ( auth.uid() = user_id );

create policy "Admins can view all posts"
  on public.forum_posts for select
  using ( public.is_admin() );

-- 3. Update pending status logic
-- Make sure new posts are pending by default (already set in previous migration, but good to ensure)
alter table public.forum_posts alter column status set default 'pending';
