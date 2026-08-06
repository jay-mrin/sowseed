-- V3: separate public Admin PayPal orders from private collection records.
alter table public.donations
  add column if not exists visibility_scope text not null default 'public';

alter table public.donations
  drop constraint if exists donations_visibility_scope_check;

alter table public.donations
  add constraint donations_visibility_scope_check
  check (visibility_scope in ('public', 'superadmin_private'));

update public.donations
set visibility_scope = case
  when payment_route = 'superadmin' or payment_method in ('wise', 'razorpay') then 'superadmin_private'
  else 'public'
end;

update public.site_settings
set settings = jsonb_set(
  jsonb_set(coalesce(settings, '{}'::jsonb), '{wiseEnabled}', 'true'::jsonb, true),
  '{checkoutRoute}',
  case when coalesce(settings->>'checkoutRoute', 'standard') = 'superadmin' then '"superadmin"'::jsonb else '"standard"'::jsonb end,
  true
)
where id = true;

alter table public.checkout_events drop constraint if exists checkout_events_event_name_check;
alter table public.checkout_events add constraint checkout_events_event_name_check
  check (event_name in ('checkout_button_clicked', 'paypal_checkout_started', 'razorpay_checkout_started', 'wise_payment_link_opened'));

alter table public.digital_orders
  alter column item_name set default 'Personalised Digital Writing - Custom Order Made Writing';

alter table public.digital_orders
  drop constraint if exists digital_orders_fulfillment_status_check;

alter table public.digital_orders
  add constraint digital_orders_fulfillment_status_check
  check (fulfillment_status in ('awaiting_payment_confirmation', 'paid_awaiting_personalized_writing', 'fulfilled'));
