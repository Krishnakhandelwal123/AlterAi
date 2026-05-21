create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'creator')),
  status text not null default 'inactive' check (status in ('inactive', 'active', 'cancelled', 'expired')),
  provider text,
  provider_order_id text,
  provider_payment_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('pro', 'creator')),
  amount integer not null check (amount > 0),
  currency text not null default 'INR',
  status text not null default 'created' check (status in ('created', 'paid', 'failed')),
  receipt text not null unique,
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  razorpay_signature text,
  razorpay_order jsonb,
  razorpay_payment jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  event_id text unique,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
alter table public.payment_orders enable row level security;
alter table public.payment_events enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'subscriptions'
  ) then
    alter publication supabase_realtime add table public.subscriptions;
  end if;
end $$;

drop policy if exists "Users can read own subscriptions" on public.subscriptions;
create policy "Users can read own subscriptions"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own payment orders" on public.payment_orders;
create policy "Users can read own payment orders"
on public.payment_orders
for select
to authenticated
using (auth.uid() = user_id);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists payment_orders_user_id_idx on public.payment_orders(user_id);
create index if not exists payment_orders_razorpay_order_id_idx on public.payment_orders(razorpay_order_id);
create index if not exists payment_events_event_id_idx on public.payment_events(event_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'subscriptions_user_id_key'
      and conrelid = 'public.subscriptions'::regclass
  ) then
    alter table public.subscriptions
      add constraint subscriptions_user_id_key unique (user_id);
  end if;
end $$;
