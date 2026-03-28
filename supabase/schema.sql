-- ────────────────────────────────────────────────────────────────────────────
-- Mello — Supabase Schema (v2)
-- Run this in your Supabase SQL editor to set up the database.
-- ────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Tasks ─────────────────────────────────────────────────────────────────────

create table if not exists tasks (
  id            text primary key,
  user_id       uuid references auth.users on delete cascade,
  title         text not null,
  energy_level  text check (energy_level in ('low', 'medium', 'high')) default 'medium',
  category      text default 'uncategorized',
  status        text check (status in ('pending', 'active', 'completed', 'skipped')) default 'pending',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── Subtasks ──────────────────────────────────────────────────────────────────

create table if not exists subtasks (
  id            text primary key,
  task_id       text references tasks(id) on delete cascade,
  user_id       uuid references auth.users on delete cascade,
  title         text not null,
  order_index   integer not null default 0,
  status        text check (status in ('pending', 'completed', 'skipped')) default 'pending',
  created_at    timestamptz default now()
);

-- ── Focus Sessions ────────────────────────────────────────────────────────────
-- Each completed timer run is a session. Used for dashboard stats.

create table if not exists focus_sessions (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users on delete cascade,
  task_id       text references tasks(id) on delete set null,
  task_title    text,
  category      text default 'uncategorized',
  duration      integer default 0,   -- seconds
  completed_at  timestamptz default now(),
  date          text not null         -- 'YYYY-MM-DD' for easy day grouping
);

-- ── User State ────────────────────────────────────────────────────────────────

create table if not exists user_state (
  user_id               uuid primary key references auth.users on delete cascade,
  energy_level          text check (energy_level in ('low', 'medium', 'high')),
  current_task_id       text references tasks(id) on delete set null,
  current_subtask_index integer default 0,
  completed_count       integer default 0,
  updated_at            timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table tasks          enable row level security;
alter table subtasks       enable row level security;
alter table focus_sessions enable row level security;
alter table user_state     enable row level security;

-- Tasks
create policy "Users view own tasks"   on tasks for select using (auth.uid() = user_id);
create policy "Users insert own tasks" on tasks for insert with check (auth.uid() = user_id);
create policy "Users update own tasks" on tasks for update using (auth.uid() = user_id);
create policy "Users delete own tasks" on tasks for delete using (auth.uid() = user_id);

-- Subtasks
create policy "Users view own subtasks"   on subtasks for select using (auth.uid() = user_id);
create policy "Users insert own subtasks" on subtasks for insert with check (auth.uid() = user_id);
create policy "Users update own subtasks" on subtasks for update using (auth.uid() = user_id);
create policy "Users delete own subtasks" on subtasks for delete using (auth.uid() = user_id);

-- Focus sessions
create policy "Users view own sessions"   on focus_sessions for select using (auth.uid() = user_id);
create policy "Users insert own sessions" on focus_sessions for insert with check (auth.uid() = user_id);

-- User state
create policy "Users view own state"   on user_state for select using (auth.uid() = user_id);
create policy "Users upsert own state" on user_state for insert with check (auth.uid() = user_id);
create policy "Users update own state" on user_state for update using (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────────────────────────

create index if not exists tasks_user_status_idx     on tasks(user_id, status);
create index if not exists sessions_user_date_idx    on focus_sessions(user_id, date);
create index if not exists sessions_user_cat_idx     on focus_sessions(user_id, category);
create index if not exists subtasks_task_id_idx      on subtasks(task_id);

-- ── Updated At Trigger ────────────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on tasks for each row execute function update_updated_at();

create trigger user_state_updated_at
  before update on user_state for each row execute function update_updated_at();

-- ── Dashboard Stats View ──────────────────────────────────────────────────────
-- Convenience view for per-user aggregate stats.

create or replace view user_stats as
select
  u.user_id,
  count(distinct case when s.date = current_date::text then s.id end)   as steps_today,
  coalesce(sum(case when s.date = current_date::text then s.duration end), 0) as focus_time_today,
  count(distinct s.id)                                                   as total_steps,
  coalesce(sum(s.duration), 0)                                           as total_focus_time,
  count(distinct t.id) filter (where t.status = 'completed')            as tasks_completed
from user_state u
left join focus_sessions s on s.user_id = u.user_id
left join tasks t           on t.user_id = u.user_id
group by u.user_id;
