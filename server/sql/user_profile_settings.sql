alter table if exists public.users
  add column if not exists bio text default '',
  add column if not exists website text default '',
  add column if not exists location text default '',
  add column if not exists notifications jsonb default '{
    "inAppAlerts": true,
    "emailAlerts": true,
    "newConversation": true,
    "chatActivity": false,
    "trainingUpdates": true,
    "clonePublished": true,
    "billingAlerts": true,
    "planLimitAlerts": true,
    "voiceUpdates": true,
    "weeklyAnalytics": false,
    "dailySummary": true,
    "productUpdates": true
  }'::jsonb;

create index if not exists users_email_idx on public.users (email);
