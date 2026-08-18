alter table public.community_stories
  add column if not exists base_likes integer not null default 0 check (base_likes >= 0);
update public.community_stories
set base_likes = 45 + floor(random() * 76)::integer
where import_key is not null and base_likes = 0;
create table if not exists public.community_story_likes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.community_stories(id) on delete cascade,
  visitor_key_hash text not null,
  created_at timestamptz not null default now(),
  unique (story_id, visitor_key_hash)
);
alter table public.community_story_likes enable row level security;
create index if not exists community_story_likes_story_id_idx
  on public.community_story_likes (story_id);
