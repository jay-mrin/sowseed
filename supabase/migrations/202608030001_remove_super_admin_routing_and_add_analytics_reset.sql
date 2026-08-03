update public.admin_profiles
set role = 'admin'
where role = 'super_admin';

update public.donations
set
  payment_route = 'standard',
  raw_payment = jsonb_set(
    coalesce(raw_payment, '{}'::jsonb),
    '{routing,route}',
    '"standard"'::jsonb,
    true
  )
where payment_route = 'large';

update public.checkout_events
set payment_route = 'standard'
where payment_route = 'large';

update public.site_settings
set settings = coalesce(settings, '{}'::jsonb) - 'largeDonationRoutingEnabled'
where id = true
  and coalesce(settings, '{}'::jsonb) ? 'largeDonationRoutingEnabled';

alter table public.admin_profiles
  drop constraint if exists admin_profiles_role_check;

alter table public.admin_profiles
  add constraint admin_profiles_role_check
  check (role = 'admin');

alter table public.donations
  drop constraint if exists donations_payment_route_check;

alter table public.donations
  add constraint donations_payment_route_check
  check (payment_route = 'standard');

alter table public.checkout_events
  drop constraint if exists checkout_events_payment_route_check;

alter table public.checkout_events
  add constraint checkout_events_payment_route_check
  check (payment_route = 'standard');

drop function if exists public.is_super_admin();
drop function if exists public.is_admin_or_super_admin();

create table if not exists public.analytics_state (
  id boolean primary key default true check (id),
  reset_at timestamptz not null default 'epoch'::timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.analytics_state (id, reset_at, updated_at)
values (true, 'epoch'::timestamptz, now())
on conflict (id) do nothing;

alter table public.analytics_state enable row level security;

drop policy if exists "Admins can read analytics state" on public.analytics_state;
create policy "Admins can read analytics state"
on public.analytics_state for select
using (public.is_admin());

drop policy if exists "Admins can reset analytics state" on public.analytics_state;
create policy "Admins can reset analytics state"
on public.analytics_state for insert
with check (public.is_admin());

drop policy if exists "Admins can update analytics state" on public.analytics_state;
create policy "Admins can update analytics state"
on public.analytics_state for update
using (public.is_admin())
with check (public.is_admin());
