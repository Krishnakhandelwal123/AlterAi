-- In-app notifications — run in Supabase SQL editor

create table if not exists public.user_notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,
  title       text not null,
  body        text not null default '',
  link        text,
  metadata    jsonb default '{}'::jsonb,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists user_notifications_user_id_idx
  on public.user_notifications (user_id);

create index if not exists user_notifications_user_unread_idx
  on public.user_notifications (user_id, read_at)
  where read_at is null;

create index if not exists user_notifications_created_at_idx
  on public.user_notifications (user_id, created_at desc);

alter table public.user_notifications enable row level security;

drop policy if exists "users_read_own_notifications" on public.user_notifications;
create policy "users_read_own_notifications"
  on public.user_notifications for select
  using (auth.uid() = user_id);

drop policy if exists "users_update_own_notifications" on public.user_notifications;
create policy "users_update_own_notifications"
  on public.user_notifications for update
  using (auth.uid() = user_id);

drop policy if exists "users_delete_own_notifications" on public.user_notifications;
create policy "users_delete_own_notifications"
  on public.user_notifications for delete
  using (auth.uid() = user_id);

-- Service role inserts notifications from the API server
