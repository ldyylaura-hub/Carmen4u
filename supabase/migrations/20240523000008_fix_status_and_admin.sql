-- 1. Add the missing 'status' column
alter table public.forum_posts 
add column if not exists status text default 'pending' check (status in ('pending', 'approved', 'rejected'));

-- 2. Create the admin check function
create or replace function public.is_admin()
returns boolean as $$
declare
  current_user_role text;
begin
  -- 简单粗暴：如果是这个邮箱，就是管理员！
  return auth.email() = 'carmen_club@foxmail.com'; 
end;
$$ language plpgsql security definer;

-- 3. Reset policies
drop policy if exists "Public posts are viewable by everyone." on public.forum_posts;
drop policy if exists "Anyone can view approved posts" on public.forum_posts;
drop policy if exists "Users can view their own pending posts" on public.forum_posts;
drop policy if exists "Users can view their own posts" on public.forum_posts;
drop policy if exists "Admins can view all posts" on public.forum_posts;

-- 4. Create new policies
-- Rule A: Public can only see approved posts
create policy "Anyone can view approved posts"
  on public.forum_posts for select
  using ( status = 'approved' );

-- Rule B: Users can see their own posts (pending or approved)
create policy "Users can view their own posts"
  on public.forum_posts for select
  using ( auth.uid() = user_id );

-- Rule C: Admins can see ALL posts
create policy "Admins can view all posts"
  on public.forum_posts for select
  using ( public.is_admin() );
