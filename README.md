# Sow Your Seed

A Ko-fi-inspired creator tipping page with Supabase backend support, PayPal Checkout, admin controls, posts, likes, comments, order calendar totals, and a fortune popup after confirmed payment capture.

## What Runs Locally

The page can still run as a static frontend:

```bash
npm run dev
```

Then open `http://127.0.0.1:5173`.

When `src/config.js` has `backendEnabled: false`, the app stays in local demo mode. When Supabase values are filled and `backendEnabled: true`, public data, admin edits, posts, donations, likes, comments, and PayPal checkout are loaded through Supabase Edge Functions.

The admin portal also shows real page-view analytics for the last 24 hours. A public page load records one view session per visitor per hour, then the admin-only analytics endpoint reports unique visitors, total hourly view sessions, checkout taps, PayPal starts, and completed payments. Admins can reset this dashboard so new activity starts counting from zero.

The payment column includes a Blessing Wall loaded from `seed_comments`. The initial comments are imported from the old-site CSV, and each completed payment with a written blessing request adds one new public comment with the captured payment timestamp.

## Files

- `index.html` - static app entrypoint
- `src/app.js` - frontend state, Supabase calls, PayPal SDK wiring
- `src/styles.css` - responsive UI and modal styling
- `src/config.js` - local browser config, never store secrets here
- `.env.example` - server secret placeholders
- `supabase/migrations/*` - database, RLS, storage bucket, seed/order data
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

5. Add a Supabase Auth user, then mark that user as admin:

```sql
insert into public.admin_profiles (user_id, email, role)
values ('YOUR_AUTH_USER_ID', 'you@example.com', 'admin')
on conflict (user_id) do update set email = excluded.email, role = excluded.role;
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

This app uses the PayPal Orders API with the PayPal JavaScript SDK. It renders the official PayPal wallet button and, when PayPal marks it eligible for the buyer, the official debit or credit card button.

For your India-registered PayPal Business account, test with PayPal sandbox buyer accounts before switching to live credentials.

SuperAdmin chooses whether payments use the Admin or SuperAdmin PayPal account. The optional `$21 or more` override always routes qualifying payments to SuperAdmin. Admin uses `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_WEBHOOK_ID`; SuperAdmin uses the corresponding `SUPER_ADMIN_PAYPAL_*` secrets.

The public meter is a repeating goal cycle, separate from the complete order calendar. Admin sets the goal amount and current cycle amount in dollars. With `$7 = 1 seed` and a `$700` goal, the target is `100 seeds`; a `$7` order adds `1%`, a `$14` order adds `2%`, and custom amounts contribute as `amount / 7`. When the current cycle reaches `$700`, the visible meter resets to `0%` and starts the next cycle.

Every completed PayPal capture also creates a linked digital-service order for `Personalised Digital Blessing and Sowing Seed`. The admin calendar shows the order ID, PayPal transaction ID, personalized-writing request, fulfillment status, and a proof PDF download for each payment.

The current backend records `once` or `monthly` as donation frequency, but PayPal Orders captures a single payment. Automatic recurring monthly billing requires a separate PayPal Subscriptions flow with product/plan IDs.

## Verification

Use PayPal sandbox first:

- Successful wallet capture creates one donation row and returns a fortune.
- Successful eligible card capture creates one donation row and returns a fortune.
- Cancelled checkout creates no donation.
- Duplicate capture/webhook updates do not create duplicate donations.
- Admin calendar can download a proof PDF for each digital-service order and mark orders fulfilled.
- Admin analytics shows unique visitors, view sessions, donation taps, PayPal starts, and completed payments from the last 24 hours; Reset views starts those counts fresh.
- Public Blessing Wall loads imported legacy comments and appends paid blessing requests after confirmed payment capture.
- Admin login requires Supabase Auth and `admin_profiles`; all completed payments appear in the normal admin calendar, where each order can be deleted.
- Donor comments require the same-browser donor token returned after a completed donation.
