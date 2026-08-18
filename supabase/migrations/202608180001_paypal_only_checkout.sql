-- Remove retired checkout settings and permit only PayPal for new payments.
update public.site_settings
set settings = coalesce(settings, '{}'::jsonb) - 'wiseEnabled' - 'razorpayEnabled'
where id = true;
alter table public.checkout_events
  drop constraint if exists checkout_events_event_name_check;
alter table public.checkout_events
  add constraint checkout_events_event_name_check
  check (event_name in ('checkout_button_clicked', 'paypal_checkout_started')) not valid;
alter table public.donations
  drop constraint if exists donations_payment_method_paypal_only_check;
alter table public.donations
  add constraint donations_payment_method_paypal_only_check
  check (payment_method = 'paypal') not valid;
