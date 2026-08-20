import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

test("PayPal capture trusts the server-pinned payment attempt", () => {
  const source = read("supabase/functions/capture-paypal-order/index.ts");

  assert.match(source, /\.from\("payment_attempts"\)/);
  assert.match(source, /paymentAttempt\.payment_route/);
  assert.match(source, /capturedAmountCents !== parseMoneyToCents\(paymentAttempt\.amount\)/);
  assert.doesNotMatch(source, /body\.donation|paypal_checkout_sessions|resolvePaymentRoute/);
});

test("PayPal creation rejects a stale SDK route and persists checkout metadata", () => {
  const source = read("supabase/functions/create-paypal-order/index.ts");

  assert.match(source, /sdkRoute !== paymentRoute/);
  assert.match(source, /\.from\("payment_attempts"\)\s*\.insert/);
  assert.match(source, /customer_request: personalizedRequest/);
  assert.match(source, /supporter_message: supporterMessage/);
});

test("Admin order reads and mutations share the same role scope", () => {
  const source = read("supabase/functions/admin-donations/index.ts");
  const scopeCalls = source.match(/applyAdminDonationScope\(/g) || [];

  assert.ok(scopeCalls.length >= 4, "GET, PUT, DELETE, and the helper must all use the shared role scope");
  assert.match(source, /role === "super_admin"[\s\S]*visibility_scope", "superadmin_private"/);
  assert.match(source, /visibility_scope", "public"[\s\S]*payment_method", "paypal"/);
});

test("webhooks can recover completed captures without trusting browser metadata", () => {
  const source = read("supabase/functions/paypal-webhook/index.ts");

  assert.match(source, /supplementary_data\?\.related_ids\?\.order_id/);
  assert.match(source, /\.from\("payment_attempts"\)/);
  assert.match(source, /functions\.invoke\(\s*"capture-paypal-order"/);
  assert.match(source, /attemptRoute !== verifiedRoute/);
});

test("cleanup migrations close direct-table bypasses and remove retired schema", () => {
  const integrityMigration = read("supabase/migrations/202608180006_checkout_integrity.sql");
  const cleanupMigration = read("supabase/migrations/202608180007_remove_dead_checkout_fields.sql");

  for (const policy of [
    "Admins can manage settings",
    "Admins can read digital orders",
    "Admins can update digital orders",
    "Admins can read checkout events",
  ]) {
    assert.ok(integrityMigration.includes(`drop policy if exists \"${policy}\"`));
  }

  for (const table of [
    "membership_webhook_events",
    "membership_payments",
    "memberships",
    "membership_plans",
    "community_story_likes",
    "community_stories",
  ]) {
    assert.ok(cleanupMigration.includes(`drop table if exists public.${table}`));
  }
});

test("Admin analytics aggregate both routes while SuperAdmin remains route-scoped", () => {
  const analytics = read("supabase/functions/admin-analytics/index.ts");
  const bootstrap = read("supabase/functions/public-bootstrap/index.ts");
  const migration = read("supabase/migrations/202608180008_admin_checkout_analytics.sql");
  const roleScopeMigration = read("supabase/migrations/202608190001_role_scoped_checkout_analytics.sql");

  assert.match(analytics, /\.from\("payment_attempts"\)/);
  assert.match(analytics, /adminProfile\.role === "super_admin"/);
  assert.match(analytics, /includesAllRoutes = adminProfile\.role === "admin"/);
  assert.match(analytics, /pageViewsQuery\.in\("payment_route", \["standard", "superadmin"\]\)/);
  assert.match(analytics, /paymentAttemptsQuery\.in\("payment_route", \["standard", "superadmin"\]\)/);
  assert.match(analytics, /\.from\("checkout_analytics_state"\)/);
  assert.match(analytics, /contact_email/);
  assert.match(analytics, /attempt\.payment_route === "standard"/);
  assert.match(analytics, /attempt\.payment_route === "superadmin"[\s\S]*"cancelled"/);
  assert.doesNotMatch(analytics, /checkout_button_clicked|paypal_checkout_started/);
  assert.match(bootstrap, /payment_route: paymentRoute/);
  assert.match(migration, /add column if not exists payment_route text/);
  assert.match(roleScopeMigration, /payment_route text primary key/);
  assert.match(roleScopeMigration, /revoke all on table public\.checkout_analytics_state from anon, authenticated/);
});
