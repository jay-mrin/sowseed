update public.site_settings
set settings = coalesce(settings, '{}'::jsonb) - 'wiseEnabled' - 'razorpayEnabled'
where id = true;
