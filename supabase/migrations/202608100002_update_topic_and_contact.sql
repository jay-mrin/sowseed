update public.site_settings
set settings = jsonb_set(
  jsonb_set(
    coalesce(settings, '{}'::jsonb),
    '{topicLabel}',
    to_jsonb('Digital writing'::text),
    true
  ),
  '{footerText}',
  to_jsonb('This platform provides personalised digital writing created from your submitted request or intention. Each purchase is a custom order, prepared directly for the buyer. Contact: sowyourseed@christgarden.church'::text),
  true
)
where id = true;
