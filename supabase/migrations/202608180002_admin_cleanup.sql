-- Remove settings for retired checkout tiers and page-footer controls.
update public.site_settings
set settings = coalesce(settings, '{}'::jsonb)
  - 'amountOptions'
  - 'fortuneNumberEnabled'
  - 'footerText'
where id = true;
