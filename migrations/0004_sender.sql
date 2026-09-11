-- Nitefill Sender (Chrome) pairing + real Instagram outreach.

alter table profiles add column if not exists extension_token text;
alter table profiles add column if not exists sender_last_seen timestamptz;
alter table profiles add column if not exists sender_ig_pk text;

alter table campaigns add column if not exists seed_accounts text not null default '';
alter table campaigns add column if not exists discover_status text not null default 'idle';
alter table campaigns add column if not exists discover_error text;

alter table audience_profiles add column if not exists ig_pk text;
alter table audience_profiles add column if not exists message text;
alter table audience_profiles add column if not exists fail_reason text;
alter table audience_profiles add column if not exists is_private boolean not null default false;

create unique index if not exists audience_campaign_handle_idx
  on audience_profiles (user_id, campaign_id, handle);
