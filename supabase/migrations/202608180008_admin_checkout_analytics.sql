alter table public.page_views
  add column if not exists payment_route text;

alter table public.page_views
  drop constraint if exists page_views_payment_route_check;

alter table public.page_views
  add constraint page_views_payment_route_check
  check (payment_route in ('standard', 'superadmin'));

create index if not exists page_views_route_last_seen_at_idx
  on public.page_views (payment_route, last_seen_at desc);

-- Historical page views did not record their checkout route. Keep them null so
-- they cannot be mistaken for Admin checkout traffic in the strict dashboard.
