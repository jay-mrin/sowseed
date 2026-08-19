# Sow Your Seed

A personalised digital-writing order page with Supabase backend support, dual-account PayPal Checkout, role-based admin controls, posts, likes, comments, order calendars, and a fortune message after confirmed payment capture.

## What Runs Locally

The page can still run as a static frontend:

```bash
npm run dev
```

Then open `http://127.0.0.1:5173`.

When `src/config.js` has `backendEnabled: false`, the app stays in local demo mode. When Supabase values are filled and `backendEnabled: true`, public data, goal settings, posts, orders, likes, comments, and PayPal checkout are loaded through Supabase Edge Functions.

Each portal shows checkout analytics for its own payment route from the last 24 hours. A public page load records one hourly view session tagged with the active checkout route. The role-scoped analytics endpoint reports the current portal's page visits and persisted PayPal payment attempts, including each customer's name, email, amount, and server-verified completion status. Admin never receives SuperAdmin activity, and SuperAdmin never receives Admin activity. Each portal can reset its own dashboard without affecting the other portal.

The payment column includes a Blessing Wall loaded from `seed_comments`. Initial comments are imported from legacy data, and completed public Admin-routed orders can add a new comment with the captured payment timestamp.

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
   - `backendEnabled: true`

   PayPal client IDs are provided by the backend for the selected Admin or SuperAdmin route. Do not put PayPal client secrets in browser configuration.

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

5. Add Supabase Auth users, then assign each account the required role:

```sql
insert into public.admin_profiles (user_id, email, role)
values ('YOUR_AUTH_USER_ID', 'you@example.com', 'admin')
on conflict (user_id) do update set email = excluded.email, role = excluded.role;

insert into public.admin_profiles (user_id, email, role)
values ('YOUR_SUPERADMIN_AUTH_USER_ID', 'superadmin@example.com', 'super_admin')
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
npx supabase secrets set SUPER_ADMIN_PAYPAL_CLIENT_ID="YOUR_SUPERADMIN_SANDBOX_CLIENT_ID"
npx supabase secrets set SUPER_ADMIN_PAYPAL_CLIENT_SECRET="YOUR_SUPERADMIN_SANDBOX_CLIENT_SECRET"
npx supabase secrets set SUPER_ADMIN_PAYPAL_WEBHOOK_ID="YOUR_SUPERADMIN_SANDBOX_WEBHOOK_ID"
npx supabase secrets set PAYPAL_CURRENCY="USD"
npx supabase secrets set SUPERADMIN_PURGE_PASSWORD="YOUR_STRONG_PURGE_PASSWORD"
npx supabase secrets set SITE_ORIGIN="http://127.0.0.1:5173"
```

Use the deployed website origin for `SITE_ORIGIN` outside local development.

7. Deploy functions:

```bash
npm run supabase:deploy
```

## PayPal Notes

This app uses the PayPal Orders API with the PayPal JavaScript SDK. It renders the official PayPal wallet button and, when PayPal marks it eligible for the buyer, the official debit or credit card button.

For your India-registered PayPal Business account, test with PayPal sandbox buyer accounts before switching to live credentials.

SuperAdmin chooses whether payments use the Admin or SuperAdmin PayPal account. The optional `$21 or more` override always routes qualifying payments to SuperAdmin. Admin uses `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_WEBHOOK_ID`; SuperAdmin uses the corresponding `SUPER_ADMIN_PAYPAL_*` secrets.

A valid email address is required at checkout so the order can be delivered. Display name and message are optional. Checkout creates a single PayPal payment; it does not create a recurring subscription.

The public meter is a repeating goal cycle, separate from the complete order calendar. Admin sets the goal amount and current cycle amount in dollars. With `$7 = 1 seed` and a `$700` goal, the target is `100 seeds`; a `$7` order adds `1%`, a `$14` order adds `2%`, and custom amounts contribute as `amount / 7`. When the current cycle reaches `$700`, the visible meter resets to `0%` and starts the next cycle.

Every completed PayPal capture also creates a linked digital-service order for `Personalised Digital Writing - Custom Order Made Writing`. The calendar for the collecting role shows the order ID, PayPal transaction ID, personalised-writing request, fulfillment status, and a proof PDF download for each payment.

## Verification

Run the local validation suite before deployment:

```bash
npm run check
```

Use PayPal sandbox first:

- Successful wallet capture creates one donation row and returns a fortune.
- Successful eligible card capture creates one donation row and returns a fortune.
- Cancelled checkout creates no donation.
- Duplicate capture/webhook updates do not create duplicate donations.
- Admin calendar can download a proof PDF for each digital-service order and mark orders fulfilled.
- Admin and SuperAdmin analytics each show only their own route's visits, PayPal starts, and completed payments from the last 24 hours; resetting one portal does not affect the other.
- Public Blessing Wall loads imported legacy comments and appends paid blessing requests after confirmed payment capture.
- Admin login requires Supabase Auth and `admin_profiles`; Admin and SuperAdmin see only the orders routed to their respective collection account.
- Donor comments require the same-browser donor token returned after a completed donation.
