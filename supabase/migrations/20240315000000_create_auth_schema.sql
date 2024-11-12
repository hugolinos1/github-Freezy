-- Create auth schema if it doesn't exist
create schema if not exists auth;

-- Enable Row Level Security
alter table auth.users enable row level security;

-- Create users table if it doesn't exist
create table if not exists auth.users (
  id uuid references auth.users primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_sign_in_at timestamp with time zone,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean default false,
  role text default 'authenticated'::text
);

-- Create policies
create policy "Users can view their own data" on auth.users
  for select using (auth.uid() = id);

create policy "Users can update their own data" on auth.users
  for update using (auth.uid() = id);

-- Create trigger for updating updated_at
create or replace function auth.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_auth_users_updated_at
  before update on auth.users
  for each row
  execute function auth.update_updated_at_column();