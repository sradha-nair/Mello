-- ────────────────────────────────────────────────────────────────────────────
-- Mello — Supabase Schema
-- Run this in your Supabase SQL editor to set up the database.
-- ────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── Tasks ───────────────────────────────────────────────────────────────────
-- Each task is a thing the user wants to accomplish.
-- Energy level helps us match tasks to user's current cognitive state.

create table if not exists tasks (
  id            text primary key,
  user_id       uuid references auth.users on delete cascade,
  title         text not null,
  energy_level  text check (energy_level in ('low', 'medium', 'high')) default 'medium',
  status        text check (status in ('pending', 'active', 'completed', 'skipped')) default 'pending',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── Subtasks ─────────────────────────────────────────────────────────────────
-- AI-generated micro-steps for each task.
-- Stored so users can resume exactly where they left off.

create table if not exists subtasks (
  id            text primary key,
  task_id       text references tasks(id) on delete cascade,
  user_id       uuid references auth.users on delete cascade,
  title         text not null,
  order_index   integer not null default 0,
  status        text check (status in ('pending', 'completed', 'skipped')) default 'pending',
  created_at    timestamptz default now()
);

-- ── User State ───────────────────────────────────────────────────────────────
-- Tracks current session state so user can resume across devices.

create table if not exists user_state (
  user_id               uuid primary key references auth.users on delete cascade,
  energy_level          text check (energy_level in ('low', 'medium', 'high')),
  current_task_id       text references tasks(id) on delete set null,
  current_subtask_index integer default 0,
  completed_count       integer default 0,
  updated_at            timestamptz default now()
);

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Users can only see and modify their own data.

alter table tasks enable row level security;
alter table subtasks enable row level security;
alter table user_state enable row level security;

-- Tasks policies
create policy "Users can view own tasks"
  on tasks for select using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on tasks for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on tasks for update using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on tasks for delete using (auth.uid() = user_id);

-- Subtasks policies
create policy "Users can view own subtasks"
  on subtasks for select using (auth.uid() = user_id);

create policy "Users can insert own subtasks"
  on subtasks for insert with check (auth.uid() = user_id);

create policy "Users can update own subtasks"
  on subtasks for update using (auth.uid() = user_id);

create policy "Users can delete own subtasks"
  on subtasks for delete using (auth.uid() = user_id);

-- User state policies
create policy "Users can view own state"
  on user_state for select using (auth.uid() = user_id);

create policy "Users can upsert own state"
  on user_state for insert with check (auth.uid() = user_id);

create policy "Users can update own state"
  on user_state for update using (auth.uid() = user_id);

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists tasks_user_id_idx on tasks(user_id);
create index if not exists tasks_status_idx on tasks(user_id, status);
create index if not exists subtasks_task_id_idx on subtasks(task_id);
create index if not exists subtasks_order_idx on subtasks(task_id, order_index);

-- ── Updated At Trigger ───────────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

create trigger user_state_updated_at
  before update on user_state
  for each row execute function update_updated_at();
