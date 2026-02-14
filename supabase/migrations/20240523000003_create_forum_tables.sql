-- Create forum_posts table
create table if not exists public.forum_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  category text default 'general',
  view_count integer default 0,
  like_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create forum_replies table
create table if not exists public.forum_replies (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.forum_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.forum_posts enable row level security;
alter table public.forum_replies enable row level security;

-- Policies for forum_posts
create policy "Public posts are viewable by everyone."
  on public.forum_posts for select
  using ( true );

create policy "Users can insert their own posts."
  on public.forum_posts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own posts."
  on public.forum_posts for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own posts."
  on public.forum_posts for delete
  using ( auth.uid() = user_id );

-- Policies for forum_replies
create policy "Public replies are viewable by everyone."
  on public.forum_replies for select
  using ( true );

create policy "Users can insert their own replies."
  on public.forum_replies for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own replies."
  on public.forum_replies for delete
  using ( auth.uid() = user_id );
