-- Social platform connections (GitHub, LinkedIn, Notion, Reddit, Twitter/X, Instagram, Medium)
-- Run in Supabase SQL Editor. Required for Training Data → Social Media tab.

create table if not exists public.social_connections (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  platform        text not null,
  handle          text not null default '',
  access_token    text not null,
  refresh_token   text,
  token_expires   timestamptz,
  post_count      integer not null default 0 check (post_count >= 0),
  last_synced     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint social_connections_user_platform_key unique (user_id, platform),
  constraint social_connections_platform_check check (
    platform in ('twitter', 'reddit', 'github', 'linkedin', 'notion', 'instagram', 'medium')
  )
);

create index if not exists social_connections_user_id_idx
  on public.social_connections (user_id);

create index if not exists social_connections_platform_idx
  on public.social_connections (platform);

create or replace function public.set_social_connections_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists social_connections_updated_at on public.social_connections;
create trigger social_connections_updated_at
  before update on public.social_connections
  for each row execute function public.set_social_connections_updated_at();

alter table public.social_connections enable row level security;

drop policy if exists "users_read_own_social_connections" on public.social_connections;
create policy "users_read_own_social_connections"
  on public.social_connections for select
  using (auth.uid() = user_id);

drop policy if exists "users_insert_own_social_connections" on public.social_connections;
create policy "users_insert_own_social_connections"
  on public.social_connections for insert
  with check (auth.uid() = user_id);

drop policy if exists "users_update_own_social_connections" on public.social_connections;
create policy "users_update_own_social_connections"
  on public.social_connections for update
  using (auth.uid() = user_id);

drop policy if exists "users_delete_own_social_connections" on public.social_connections;
create policy "users_delete_own_social_connections"
  on public.social_connections for delete
  using (auth.uid() = user_id);

-- API server uses service role and bypasses RLS for connect/sync/disconnect.
