create table if not exists public.community_stories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 160),
  story text not null check (char_length(story) between 1 and 12000),
  created_at timestamptz not null default now()
);
alter table public.community_stories enable row level security;
create index if not exists community_stories_created_at_idx
  on public.community_stories (created_at desc);
