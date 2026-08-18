alter table public.community_stories alter column email drop not null;
alter table public.community_stories add column if not exists import_key text;
create unique index if not exists community_stories_import_key_idx
  on public.community_stories (import_key)
  where import_key is not null;
