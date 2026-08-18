alter table public.memberships
  add column if not exists personalized_request text;
