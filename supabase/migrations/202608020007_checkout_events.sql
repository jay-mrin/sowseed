create table if not exists public.checkout_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  visitor_key_hash text not null,
  payment_route text not null default 'standard',
  amount numeric(10, 2) not null default 0,
  path text not null default '/',
  user_agent text,
  created_at timestamptz not null default now(),
  constraint checkout_events_event_name_check
    check (event_name in ('checkout_button_clicked', 'paypal_checkout_started')),
  constraint checkout_events_payment_route_check
    check (payment_route in ('standard', 'large'))
);

create index if not exists checkout_events_name_created_at_idx
on public.checkout_events (event_name, created_at desc);

create index if not exists checkout_events_route_created_at_idx
on public.checkout_events (payment_route, created_at desc);

create index if not exists checkout_events_visitor_key_hash_idx
on public.checkout_events (visitor_key_hash);

alter table public.checkout_events enable row level security;

drop policy if exists "Admins can read checkout events" on public.checkout_events;
create policy "Admins can read checkout events"
on public.checkout_events for select
using (public.is_admin());
