update public.site_settings
set settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object(
  'pageTitle', 'Seed Garden',
  'profileTitle', 'Sow Your Seed 💫',
  'postAuthorName', 'Sow Your Seed 💫',
  'paymentCopy', 'Choose the payment method that works best for your Seed Garden custom writing order.',
  'paymentNote', 'By proceeding, you are purchasing a personalised digital writing from Seed Garden. Your order is prepared directly for you.',
  'footerText', 'Seed Garden provides personalised digital writing created from your submitted request or intention. Each purchase is a custom order, prepared directly for the buyer. Contact: sowyourseed@christgarden.church'
)
where id = true;
