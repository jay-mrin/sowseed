create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id boolean primary key default true check (id),
  settings jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fortunes (
  id bigserial primary key,
  message text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.donor_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  donation_id uuid,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  amount numeric(10, 2) not null check (amount > 0),
  seed_count integer not null check (seed_count > 0),
  frequency text not null default 'once' check (frequency in ('once', 'monthly')),
  supporter_message text,
  payment_method text not null default 'paypal',
  paypal_order_id text unique,
  paypal_capture_id text unique,
  paypal_payer_email text,
  paypal_status text not null default 'created',
  fortune_id bigint references public.fortunes(id),
  fortune_message text,
  donor_token_id uuid references public.donor_tokens(id),
  raw_payment jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.donor_tokens
  drop constraint if exists donor_tokens_donation_id_fkey,
  add constraint donor_tokens_donation_id_fkey
  foreign key (donation_id) references public.donations(id) on delete cascade;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_path text,
  image_url text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  donor_token_id uuid not null references public.donor_tokens(id) on delete cascade,
  display_name text not null default 'Supporter',
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  visitor_key_hash text not null,
  created_at timestamptz not null default now(),
  unique (post_id, visitor_key_hash)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_site_settings_updated_at on public.site_settings;
create trigger touch_site_settings_updated_at
before update on public.site_settings
for each row execute function public.touch_updated_at();

drop trigger if exists touch_donations_updated_at on public.donations;
create trigger touch_donations_updated_at
before update on public.donations
for each row execute function public.touch_updated_at();

drop trigger if exists touch_posts_updated_at on public.posts;
create trigger touch_posts_updated_at
before update on public.posts
for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
  );
$$;

alter table public.admin_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.fortunes enable row level security;
alter table public.donor_tokens enable row level security;
alter table public.donations enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;

drop policy if exists "Admins can read their profile" on public.admin_profiles;
create policy "Admins can read their profile"
on public.admin_profiles for select
using (user_id = auth.uid());

drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings"
on public.site_settings for select
using (true);

drop policy if exists "Admins can manage settings" on public.site_settings;
create policy "Admins can manage settings"
on public.site_settings for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can read fortunes" on public.fortunes;
create policy "Admins can read fortunes"
on public.fortunes for select
using (public.is_admin());

drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
on public.posts for select
using (published = true);

drop policy if exists "Admins can manage posts" on public.posts;
create policy "Admins can manage posts"
on public.posts for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can read comments" on public.comments;
create policy "Public can read comments"
on public.comments for select
using (true);

drop policy if exists "Public can read post likes" on public.post_likes;
create policy "Public can read post likes"
on public.post_likes for select
using (true);

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read post images" on storage.objects;
create policy "Public can read post images"
on storage.objects for select
using (bucket_id = 'post-images');

insert into public.site_settings (id, settings)
values (
  true,
  jsonb_build_object(
    'profileTitle', 'Sow Your Seed Here for Your Soulmate 💫',
    'followersText', '167 Followers',
    'seedGoal', 600,
    'startingSeeds', 0,
    'seedPrice', 6,
    'amountOptions', jsonb_build_array(6, 11, 33, 99),
    'meterHeadline', '༺💗༻ Click the Donate button to sow your seed now. With every seed you sow, you whisper to the universe: “Bring my soulmate to me.” 🌱💫🌹',
    'meterCollapsed', 'Welcome, beloved seeker of love. 💗 You didn’t arrive by accident. This is your sacred step toward the soulmate your heart whispers for....',
    'meterExpanded', 'Welcome, beloved seeker of love. 💗 You didn’t arrive by accident. This is your sacred step toward the soulmate your heart whispers for.' || chr(10) || chr(10) || 'Every seed you sow is a seed of intention. 🌱 1 seed ($6) – I''m ready. 🌱🌱🌱 3 ($18) – Mind, body, soulmate aligned. 🌱🌱🌱🌱🌱🌱🌱 7 ($42) – Protection over reunion. 🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱🌱 11 ($66) – Eternal love. ༺💗༻ Click Donate to sow your seed now. Whisper to the universe: “Bring my soulmate to me.” The field is open. 🌱💫🌹',
    'aboutTitle', 'About',
    'aboutCollapsed', '🌱✨ Sow a Seed for the Soulmate You’ve Been Waiting For ✨🌱' || chr(10) || 'Tired of waiting for that special someone to...',
    'aboutExpanded', '🌱✨ Sow a Seed for the Soulmate You’ve Been Waiting For ✨🌱' || chr(10) || chr(10) || 'Tired of waiting for that special someone to appear? Every seed you sow is a loving step toward calling in your soulmate. I channel warm, heartfelt soulmate messages, signs, and gentle guidance just for you.' || chr(10) || chr(10) || 'Your donation isn’t just support, it’s an act of faith, intention, and hope. Sow your seed and let love meet you where you are.',
    'topicLabel', 'Spirituality',
    'supportTitle', 'Buy a Seed to Sow for the Love You’ve Been Waiting For💕💕 for Sow Your Seed Here for Your Soulmate 💫',
    'postAuthorName', 'Sow Your Seed Here for Your Soulmate 💫',
    'paymentCopy', 'You’re paying Sow Your Seed Here for Your Soulmate 💫 directly through international PayPal/card checkout. Tips are voluntary and freely given.',
    'paymentNote', 'By proceeding with your payment, you acknowledge that you are paying Sow Your Seed Here for Your Soulmate 💫 directly. Tips are voluntary support and are not tied to any guaranteed result.',
    'footerText', 'This is a creator tipping platform where supporters can voluntarily tip the creator for their work. Tips are freely given, paid directly to the creator, and are not tied to any indirect exchange, guaranteed result, or required purchase.'
  )
)
on conflict (id) do nothing;

insert into public.posts (title, description, image_path, image_url, published, created_at)
values (
  '༺💗༻ A Divine Invitation: Sow Your Seed Here for Your Soulmate 🌱💫🌹',
  'Each seed is a small act of trust, a prayerful step toward the love your heart has been waiting for.',
  null,
  'assets/sow-cover.png',
  true,
  '2026-07-27T12:00:00.000Z'
)
on conflict do nothing;

insert into public.fortunes (message) values
($f$In Jesus' name, may the love between you and your soulmate grow softer, deeper, and more patient with every day.$f$),
($f$May your soulmate feel cherished by you, and may your family feel surrounded by peace, warmth, and protection.$f$),
($f$May God bless your relationship with gentle words, honest affection, and a home filled with family laughter.$f$),
($f$May you and your soulmate keep choosing each other with tenderness, loyalty, and grace.$f$),
($f$In the name of Jesus, may every small misunderstanding between you and your soulmate turn into deeper understanding.$f$),
($f$May your home be a soft place for your soulmate, your family, and every heart that needs rest.$f$),
($f$May your soulmate feel safe in your love, and may your family feel steady under God's blessing.$f$),
($f$May the Lord fill your relationship with romance that stays kind and family bonds that stay strong.$f$),
($f$May you and your soulmate protect each other's peace and build a family atmosphere full of affection.$f$),
($f$In Jesus' name, may your soulmate's heart be comforted, your heart be understood, and your family be united.$f$),
($f$May God bless the conversations between you and your soulmate with patience, softness, and healing.$f$),
($f$May your family table be filled with joy, your soulmate's smile, and moments you will remember with gratitude.$f$),
($f$May your soulmate feel loved in the ordinary moments, not only the grand ones.$f$),
($f$In the name of Jesus, may your relationship be covered with forgiveness, laughter, and faithful devotion.$f$),
($f$May God place peace in your home and sweetness in the way you and your soulmate care for one another.$f$),
($f$May your soulmate see your effort, feel your love, and respond with tenderness.$f$),
($f$May your family be protected from division, and may your soulmate bond be protected from pride.$f$),
($f$In Jesus' name, may your love be patient in hard days and joyful in easy days.$f$),
($f$May the Lord bless your soulmate with peace and bless you with the wisdom to love them well.$f$),
($f$May affection rise in your home today, touching your soulmate, your family, and your own heart.$f$),
($f$May you and your soulmate speak kindly, listen closely, and hold each other's dreams with care.$f$),
($f$In the name of Jesus, may your family home glow with trust, respect, and steady love.$f$),
($f$May God bless your soulmate with strength and bless your family with harmony.$f$),
($f$May every hug, prayer, and gentle word between you and your soulmate become a seed of lasting peace.$f$),
($f$May your relationship be refreshed with romance, your family refreshed with joy, and your home refreshed with grace.$f$),
($f$In Jesus' name, may your soulmate feel honored by your love and your family feel blessed by your unity.$f$),
($f$May the Lord help you and your soulmate forgive quickly, love deeply, and protect what you have built.$f$),
($f$May your family be a circle of warmth, and may your soulmate always feel welcome inside your heart.$f$),
($f$May God turn every tense moment into a chance for you and your soulmate to grow closer.$f$),
($f$In the name of Jesus, may your love stay faithful, your home stay peaceful, and your family stay protected.$f$),
($f$May your soulmate be blessed by your patience, and may you be blessed by their devotion.$f$),
($f$May your family witness more laughter, more hugs, and more gentle healing in your relationship.$f$),
($f$May Jesus guide your words so your soulmate feels loved, not judged, and your family feels safe.$f$),
($f$May your home be filled with affectionate routines, warm meals, honest talks, and peaceful rest.$f$),
($f$In Jesus' name, may every burden carried by your soulmate become lighter through love and prayer.$f$),
($f$May God strengthen your family ties and sweeten the bond between you and your soulmate.$f$),
($f$May your soulmate look at you and feel thankful for the love you share.$f$),
($f$May your relationship be rich in kindness, full of tenderness, and steady through every season.$f$),
($f$In the name of Jesus, may your family be guarded from conflict and your soulmate bond guarded from distance.$f$),
($f$May the Lord bless your private love with warmth and your family life with peace.$f$),
($f$May you and your soulmate keep finding new reasons to smile at each other.$f$),
($f$May your family home become a sanctuary of affection, prayer, forgiveness, and calm.$f$),
($f$In Jesus' name, may your soulmate's love feel like comfort and your family love feel like shelter.$f$),
($f$May God help you notice the little ways your soulmate loves you every day.$f$),
($f$May your relationship be filled with gentle touch, grateful hearts, and family blessings.$f$),
($f$May the Lord heal old hurts in your home and make room for softer love between you and your soulmate.$f$),
($f$In the name of Jesus, may your soulmate feel respected, treasured, and emotionally safe with you.$f$),
($f$May your family be blessed with unity and your relationship blessed with renewed affection.$f$),
($f$May God protect the joy between you and your soulmate from stress, fear, and bitterness.$f$),
($f$May your home echo with laughter, your relationship with loyalty, and your family with peace.$f$),
($f$In Jesus' name, may your soulmate feel chosen by you again and again.$f$),
($f$May the Lord bless your love with patience in waiting, grace in speaking, and peace in returning to each other.$f$),
($f$May your family feel the beauty of two hearts loving each other with maturity and faith.$f$),
($f$May your soulmate be encouraged today by your kindness, your presence, and your prayers.$f$),
($f$In the name of Jesus, may your relationship stay rooted in compassion and your family stay rooted in love.$f$),
($f$May God fill your home with warm affection and fill your soulmate's heart with assurance.$f$),
($f$May every meal, message, and shared silence between you and your soulmate carry peace.$f$),
($f$May your family be blessed by the love you and your soulmate continue to build.$f$),
($f$In Jesus' name, may your soulmate feel understood even before everything is explained.$f$),
($f$May the Lord bless your relationship with emotional safety and your family with lasting joy.$f$),
($f$May you and your soulmate grow in patience, playful affection, and holy friendship.$f$),
($f$May your home become a place where love is spoken clearly and forgiveness comes quickly.$f$),
($f$In the name of Jesus, may your soulmate's heart be protected and your family be covered with grace.$f$),
($f$May God bless your relationship with deeper romance and your family with sweeter togetherness.$f$),
($f$May your soulmate feel your love in your words, your actions, and your quiet loyalty.$f$),
($f$May your family be strengthened by peace, and may your relationship be strengthened by tenderness.$f$),
($f$In Jesus' name, may every hard conversation end with more understanding between you and your soulmate.$f$),
($f$May the Lord bless your home with calm mornings, affectionate evenings, and family gratitude.$f$),
($f$May your soulmate feel supported in their dreams and cherished in their vulnerable moments.$f$),
($f$May God keep your relationship free from coldness and fill it with warmth, care, and devotion.$f$),
($f$In the name of Jesus, may your family be restored where it is tired and joyful where it is strong.$f$),
($f$May you and your soulmate love each other in ways that heal, not harm.$f$),
($f$May your home be blessed with soft voices, kind apologies, and steady affection.$f$),
($f$May the Lord remind you and your soulmate that love is renewed through small faithful choices.$f$),
($f$In Jesus' name, may your family be wrapped in unity and your relationship wrapped in peace.$f$),
($f$May God bless your soulmate with joy and bless you with a heart that keeps loving wisely.$f$),
($f$May your relationship grow more romantic, more honest, and more peaceful with time.$f$),
($f$May your family feel the comfort of God's presence in every room of your home.$f$),
($f$In the name of Jesus, may your soulmate feel celebrated, valued, and never alone beside you.$f$),
($f$May the Lord bless your love with trust that deepens and affection that does not grow tired.$f$),
($f$May your home be filled with family memories that feel tender, sacred, and full of light.$f$),
($f$May you and your soulmate protect each other from harsh words and choose gentleness instead.$f$),
($f$In Jesus' name, may your family line be blessed through the love, peace, and faith in your home.$f$),
($f$May God bring sweetness back into any place where your relationship has felt heavy.$f$),
($f$May your soulmate feel loved through your patience, your loyalty, and your willingness to grow.$f$),
($f$May your family be blessed with laughter that returns easily and peace that settles deeply.$f$),
($f$In the name of Jesus, may your home carry the fragrance of affection, gratitude, and prayer.$f$),
($f$May the Lord strengthen the promise between you and your soulmate and bless everyone connected to your family.$f$),
($f$May your relationship be a refuge where both hearts can rest, heal, and be known.$f$),
($f$May God bless your family with unity and bless your soulmate bond with gentle passion.$f$),
($f$In Jesus' name, may love keep blooming in your home, even in the places that once felt dry.$f$),
($f$May your soulmate feel the blessing of being loved by you, and may you feel the blessing of being loved by them.$f$),
($f$May your family be protected from resentment and filled with compassion, patience, and joy.$f$),
($f$May the Lord bless your relationship with peaceful nights, hopeful mornings, and faithful hearts.$f$),
($f$In the name of Jesus, may every seed of kindness between you and your soulmate become a harvest of love.$f$),
($f$May God help you and your soulmate keep romance alive through care, respect, and thoughtful affection.$f$),
($f$May your home become brighter because love is practiced there every day.$f$),
($f$May your family be surrounded by grace, and may your soulmate bond be surrounded by trust.$f$),
($f$In Jesus' name, may your soulmate and family feel deeply loved, divinely protected, and beautifully blessed today.$f$),
($f$In the mighty name of Jesus Christ, may your soulmate, family, home, and shared future overflow with faithful love, divine peace, and lasting joy. Amen.$f$)
on conflict do nothing;
