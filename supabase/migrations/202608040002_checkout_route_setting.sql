update public.site_settings
set settings = jsonb_set(coalesce(settings, '{}'::jsonb), '{checkoutRoute}', '"standard"'::jsonb, true)
where id = true
  and not (coalesce(settings, '{}'::jsonb) ? 'checkoutRoute');
