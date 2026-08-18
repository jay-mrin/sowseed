update public.site_settings
set settings = coalesce(settings, '{}'::jsonb)
  - 'paymentCopy'
  - 'paymentNote'
  - 'offeringMode'
  - 'wiseEnabled'
  - 'razorpayEnabled'
  - 'amountOptions'
  - 'fortuneNumberEnabled'
  - 'footerText'
  - 'paypalEnabled'
  - 'startingSeeds'
where id = true;

alter table public.donations
  drop column if exists super_approved,
  drop column if exists receiver_identifier;

drop function if exists public.refresh_membership_payment_summary(uuid);

drop table if exists public.membership_webhook_events;
drop table if exists public.membership_payments;
drop table if exists public.memberships;
drop table if exists public.membership_plans;

drop table if exists public.community_story_likes;
drop table if exists public.community_stories;
