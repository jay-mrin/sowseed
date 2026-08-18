-- PayPal is the only checkout method and is always available when configured.
-- SuperAdmin now controls only the default collection account and the $21 routing override.
update public.site_settings
set settings = coalesce(settings, '{}'::jsonb) - 'paypalEnabled'
where id = true;
