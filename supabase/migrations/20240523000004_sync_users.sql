-- Create a function to handle new user signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, nickname, role, created_at)
  values (new.id, new.email, split_part(new.email, '@', 1), 'user', now())
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users (Optional but recommended)
insert into public.users (id, email, nickname, role, created_at)
select id, email, split_part(email, '@', 1), 'user', created_at
from auth.users
on conflict (id) do nothing;
