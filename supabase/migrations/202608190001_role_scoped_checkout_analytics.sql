create table if not exists public.checkout_analytics_state (
  payment_route text primary key
    check (payment_route in ('standard', 'superadmin')),
  reset_at timestamptz not null default 'epoch'::timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.checkout_analytics_state (payment_route, reset_at, updated_at)
select 'standard', reset_at, updated_at
from public.analytics_state
where id = true
on conflict (payment_route) do nothing;

insert into public.checkout_analytics_state (payment_route, reset_at, updated_at)
values ('superadmin', 'epoch'::timestamptz, now())
on conflict (payment_route) do nothing;

drop trigger if exists touch_checkout_analytics_state_updated_at
  on public.checkout_analytics_state;
create trigger touch_checkout_analytics_state_updated_at
before update on public.checkout_analytics_state
for each row execute function public.touch_updated_at();

alter table public.checkout_analytics_state enable row level security;

-- Analytics are exposed only through the role-scoped Edge Function. Keeping
-- direct authenticated access closed prevents either role bypassing its route.
revoke all on table public.checkout_analytics_state from anon, authenticated;
