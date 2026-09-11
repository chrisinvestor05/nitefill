-- Track in-flight Instagram sends so a crashed Sender can retry.

alter table audience_profiles add column if not exists sending_at timestamptz;
