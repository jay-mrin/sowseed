drop index if exists public.community_stories_import_key_idx;
create unique index community_stories_import_key_idx
  on public.community_stories (import_key);
