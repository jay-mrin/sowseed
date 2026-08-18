alter table public.memberships
  add column if not exists customer_request text;
