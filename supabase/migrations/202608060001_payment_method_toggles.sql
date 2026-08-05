update public.site_settings
set settings =
  jsonb_set(
    jsonb_set(coalesce(settings, '{}'::jsonb), '{razorpayEnabled}', 'true'::jsonb, true),
    '{paypalEnabled}',
    'true'::jsonb,
    true
  )
where id = true;
