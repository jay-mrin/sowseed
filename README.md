# Sow Your Seed

A Ko-fi-inspired creator tipping page with Supabase backend support, PayPal Checkout, admin controls, posts, gallery, likes, comments, donation calendar totals, and a fortune popup after confirmed payment capture.

## What Runs Locally

The page can still run as a static frontend:

```bash
npm run dev
```

Then open `http://127.0.0.1:5173`.

When `src/config.js` has `backendEnabled: false`, the app stays in local demo mode. When Supabase values are filled and `backendEnabled: true`, public data, admin edits, posts, donations, likes, comments, and PayPal checkout are loaded through Supabase Edge Functions.

## Files

- `index.html` - static app entrypoint
- `src/app.js` - frontend state, Supabase calls, PayPal SDK wiring
- `src/styles.css` - responsive UI and modal styling
- `src/config.js` - local browser config, never store secrets here
- `.env.example` - server secret placeholders
- `supabase/migrations/202607280001_initial_backend.sql` - database, RLS, storage bucket, seed data
- `supabase/functions/*` - public, admin, PayPal, and engagement Edge Functions

## Required Setup

1. Copy `src/config.example.js` to `src/config.js` and fill:
   - `supabaseUrl`
   - `supabaseAnonKey`
   - `paypalClientId`
   - `backendEnabled: true`

2. Copy `.env.example` to `.env` for your local notes only. Do not commit real secrets.

3. Install tooling:

```bash
npm install
```

4. Link your Supabase project and push the migration:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

5. Add one Supabase Auth user for yourself, then mark that user as admin:

```sql
insert into public.admin_profiles (user_id, email)
values ('YOUR_AUTH_USER_ID', 'you@example.com')
on conflict (user_id) do update set email = excluded.email;
```

6. Set Edge Function secrets:

```bash
npx supabase secrets set SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
npx supabase secrets set PAYPAL_ENV="sandbox"
npx supabase secrets set PAYPAL_CLIENT_ID="YOUR_SANDBOX_CLIENT_ID"
npx supabase secrets set PAYPAL_CLIENT_SECRET="YOUR_SANDBOX_CLIENT_SECRET"
npx supabase secrets set PAYPAL_WEBHOOK_ID="YOUR_SANDBOX_WEBHOOK_ID"
npx supabase secrets set PAYPAL_CURRENCY="USD"
npx supabase secrets set SITE_ORIGIN="http://127.0.0.1:5173"
```

7. Deploy functions:

```bash
npm run supabase:deploy
```

## PayPal Notes

This app uses PayPal Orders API with the PayPal JavaScript SDK. It renders a PayPal wallet button and a standalone card button when PayPal marks card funding eligible for the donor. If card funding is unavailable, the modal shows a PayPal wallet fallback.

For your India-registered PayPal Business account, keep the public wording as international PayPal/card checkout and test with sandbox buyer accounts before switching to live credentials.

The public meter treats the admin goal as a dollar goal and converts both the goal and paid amounts into seed units. With `$6 = 1 seed` and a `$600` goal, the target is `100 seeds`; a `$6` tip adds `1%`, a `$12` tip adds `2%`, and custom amounts contribute as `amount / 6`.

The current backend records `once` or `monthly` as donation frequency, but PayPal Orders captures a single payment. Automatic recurring monthly billing requires a separate PayPal Subscriptions flow with product/plan IDs.

## Verification

Use PayPal sandbox first:

- Successful wallet capture creates one donation row and returns a fortune.
- Successful eligible card capture creates one donation row and returns a fortune.
- Cancelled checkout creates no donation.
- Duplicate capture/webhook updates do not create duplicate donations.
- Admin login requires Supabase Auth and `admin_profiles`.
- Donor comments require the same-browser donor token returned after a completed donation.
