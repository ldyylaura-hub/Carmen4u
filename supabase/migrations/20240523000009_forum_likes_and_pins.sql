-- 1. Create Likes table
create table if not exists public.forum_post_likes (
  user_id uuid references auth.users(id) on delete cascade not null,
  post_id uuid references public.forum_posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, post_id)
);

-- Enable RLS
alter table public.forum_post_likes enable row level security;

-- Policies
create policy "Public view likes"
  on public.forum_post_likes for select
  using ( true );

create policy "Users can like posts"
  on public.forum_post_likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can unlike posts"
  on public.forum_post_likes for delete
  using ( auth.uid() = user_id );

-- 2. Add Pinned status to posts
alter table public.forum_posts 
add column if not exists is_pinned boolean default false;

-- 3. Function to toggle like (helper to handle increment/decrement safely)
-- Note: We can handle count aggregation on client or use a trigger. 
-- For simplicity, let's keep using the 'like_count' column on posts as a cache, 
-- and use a trigger to keep it updated.

create or replace function public.handle_new_like()
returns trigger as $$
begin
  update public.forum_posts
  set like_count = like_count + 1
  where id = new.post_id;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_like_added
  after insert on public.forum_post_likes
  for each row execute procedure public.handle_new_like();

create or replace function public.handle_unlike()
returns trigger as $$
begin
  update public.forum_posts
  set like_count = like_count - 1
  where id = old.post_id;
  return old;
end;
$$ language plpgsql security definer;

create or replace trigger on_like_removed
  after delete on public.forum_post_likes
  for each row execute procedure public.handle_unlike();
