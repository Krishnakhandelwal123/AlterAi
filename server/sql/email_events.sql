create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete cascade,
  event_type text not null,
  sent_at timestamptz not null default now(),
  unique (subscription_id, event_type)
);

alter table public.email_events enable row level security;

create index if not exists email_events_subscription_id_idx on public.email_events(subscription_id);
create index if not exists email_events_event_type_idx on public.email_events(event_type);
