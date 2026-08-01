create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  visitor_key_hash text not null,
  view_hour timestamptz not null,
  path text not null default '/',
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (visitor_key_hash, view_hour)
);

create index if not exists page_views_last_seen_at_idx
on public.page_views (last_seen_at desc);

create index if not exists page_views_view_hour_idx
on public.page_views (view_hour desc);

create index if not exists page_views_visitor_key_hash_idx
on public.page_views (visitor_key_hash);

alter table public.page_views enable row level security;

drop policy if exists "Admins can read page views" on public.page_views;
create policy "Admins can read page views"
on public.page_views for select
using (public.is_admin());
