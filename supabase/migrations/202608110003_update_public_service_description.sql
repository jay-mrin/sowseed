update public.site_settings
set settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object(
  'footerText',
  'Seed Garden provides personalized digital writing services. Customers submit requests for custom inspirational, faith-based and personal writings. Each order is individually prepared and delivered electronically to the customer''s provided email address as a PDF. No physical goods are sold.'
)
where id = true;
