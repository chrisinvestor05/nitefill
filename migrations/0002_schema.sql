-- Nitefill product schema. Per-user rows always carry text user_id.

create table if not exists profiles (
  user_id text primary key,
  name text,
  email text,
  instagram_handle text,
  instagram_connected boolean not null default false,
  plan_id text not null default 'pro',
  billing_cycle text not null default 'monthly',
  trial_ends_at timestamptz,
  plan_status text not null default 'trial',
  city text,
  daily_limit integer not null default 35,
  created_at timestamptz not null default now()
);

create table if not exists campaigns (
  id text primary key,
  user_id text not null,
  name text not null,
  event_name text,
  venue text,
  city text not null default '',
  event_date text,
  genre text,
  gender_filter text not null default 'all',
  bio_keywords text,
  message_template text not null default '',
  daily_limit integer not null default 35,
  status text not null default 'draft',
  started_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists campaigns_user_id_idx on campaigns (user_id);

create table if not exists audience_profiles (
  id text primary key,
  user_id text not null,
  campaign_id text,
  handle text not null,
  display_name text not null,
  city text,
  gender text,
  bio text,
  recent_post text,
  genre_tags text,
  match_score integer not null default 70,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);
create index if not exists audience_user_id_idx on audience_profiles (user_id);
create index if not exists audience_campaign_idx on audience_profiles (campaign_id);

create table if not exists outreach_log (
  id text primary key,
  user_id text not null,
  campaign_id text not null,
  audience_id text not null,
  handle text not null,
  message text not null,
  sent_at timestamptz not null default now(),
  replied boolean not null default false,
  replied_at timestamptz
);
create index if not exists outreach_user_id_idx on outreach_log (user_id);
create index if not exists outreach_campaign_idx on outreach_log (campaign_id);

create table if not exists course_progress (
  user_id text not null,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists contact_messages (
  id text primary key,
  name text not null,
  email text not null,
  topic text,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists room_waitlist (
  id text primary key,
  email text not null,
  instagram text,
  created_at timestamptz not null default now()
);
