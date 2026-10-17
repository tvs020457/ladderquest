-- LadderQuest Supabase Backend Schema
-- Run this script in your Supabase Project: Dashboard -> SQL Editor -> New query -> Run

-- 1. Create the user_progress table
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress_data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.user_progress enable row level security;

-- 3. Drop existing policies if they exist (allows safe re-runs)
drop policy if exists "Users can read their own progress" on public.user_progress;
drop policy if exists "Users can insert their own progress" on public.user_progress;
drop policy if exists "Users can update their own progress" on public.user_progress;

-- 4. Create RLS Policies
-- Policy: Allow users to view only their own progress record
create policy "Users can read their own progress"
  on public.user_progress
  for select
  using (auth.uid() = user_id);

-- Policy: Allow users to create their own progress record
create policy "Users can insert their own progress"
  on public.user_progress
  for insert
  with check (auth.uid() = user_id);

-- Policy: Allow users to update their own progress record
create policy "Users can update their own progress"
  on public.user_progress
  for update
  using (auth.uid() = user_id);

-- 5. Helper index for query performance
create index if not exists idx_user_progress_updated_at on public.user_progress(updated_at);
