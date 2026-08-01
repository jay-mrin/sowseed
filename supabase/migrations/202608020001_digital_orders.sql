create table if not exists public.digital_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  donation_id uuid not null unique references public.donations(id) on delete cascade,
  paypal_order_id text,
  paypal_capture_id text,
  customer_name text not null,
  payer_email text,
  amount numeric(10, 2) not null check (amount > 0),
  currency text not null default 'USD',
  item_name text not null default 'Personalised Digital Blessing and Sowing Seed',
  personalized_request text,
  blessing_message text,
  fulfillment_status text not null default 'paid_awaiting_personalized_writing'
    check (fulfillment_status in ('paid_awaiting_personalized_writing', 'fulfilled')),
  fulfillment_note text,
  fulfilled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists digital_orders_created_at_idx
on public.digital_orders (created_at desc);

create index if not exists digital_orders_paypal_capture_id_idx
on public.digital_orders (paypal_capture_id);

insert into public.digital_orders (
  order_number,
  donation_id,
  paypal_order_id,
  paypal_capture_id,
  customer_name,
  payer_email,
  amount,
  currency,
  item_name,
  personalized_request,
  blessing_message,
  fulfillment_status,
  created_at
)
select
  'SYS-' || to_char(d.created_at at time zone 'utc', 'YYYYMMDD') || '-' || upper(substr(replace(d.id::text, '-', ''), 1, 8)),
  d.id,
  d.paypal_order_id,
  d.paypal_capture_id,
  d.display_name,
  d.paypal_payer_email,
  d.amount,
  coalesce(d.raw_payment -> 'row' ->> 'Currency', 'USD'),
  'Personalised Digital Blessing and Sowing Seed',
  d.supporter_message,
  d.fortune_message,
  'paid_awaiting_personalized_writing',
  d.created_at
from public.donations d
on conflict (donation_id) do nothing;

drop trigger if exists touch_digital_orders_updated_at on public.digital_orders;
create trigger touch_digital_orders_updated_at
before update on public.digital_orders
for each row execute function public.touch_updated_at();

alter table public.digital_orders enable row level security;

drop policy if exists "Admins can read digital orders" on public.digital_orders;
create policy "Admins can read digital orders"
on public.digital_orders for select
using (public.is_admin());

drop policy if exists "Admins can update digital orders" on public.digital_orders;
create policy "Admins can update digital orders"
on public.digital_orders for update
using (public.is_admin())
with check (public.is_admin());
