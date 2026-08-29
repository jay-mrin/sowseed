import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (filePath) => readFileSync(path.join(repositoryRoot, filePath), "utf8");

test("the form uses a weekly switch without a frequency popup", () => {
  const html = read("index.html");
  const app = read("src/app.js");

  assert.match(html, /id="weeklySeedToggle"[^>]*type="checkbox"[^>]*role="switch"[\s\S]*Sow Seed Every Week/);
  assert.doesNotMatch(html, /id="frequencyDialog"|How would you like to sow your seed\?/);
  assert.match(app, /frequency: elements\.weeklySeedToggle\?\.checked \? "weekly" : "once"/);
  assert.match(app, /pendingDonation\.frequency === "weekly"[\s\S]*chooseWeeklySowing\(\)[\s\S]*chooseOneTimeSowing\(\)/);
  assert.doesNotMatch(app, /openFrequencyDialog|closeFrequencyDialog/);
});

test("weekly checkout requires a name and whole seeds and uses subscription intent", () => {
  const app = read("src/app.js");

  assert.match(app, /Add your name to begin weekly sowing/);
  assert.match(app, /Number\.isInteger\(seedUnits\)/);
  assert.match(app, /intent: billingFrequency === "weekly" \? "subscription" : "capture"/);
  assert.match(app, /params\.set\("vault", "true"\)/);
  assert.match(app, /createSubscription:[\s\S]*prepare-paypal-subscription[\s\S]*confirm-paypal-subscription/);
  assert.match(app, /elements\.cardButton\.hidden = frequency === "weekly"/);
  assert.match(app, /finishVerifiedSubscription[\s\S]*receiptSummary\.hidden = true/);
  assert.match(app, /finishVerifiedDonation[\s\S]*receiptSummary\.hidden = false/);
  assert.doesNotMatch(app, /was set up today\. Your next renewal/);
});

test("weekly plan preparation pins routing and Monday 6 PM IST", () => {
  const prepare = read("supabase/functions/prepare-paypal-subscription/index.ts");
  const paypal = read("supabase/functions/_shared/paypal.ts");

  assert.match(prepare, /resolvePaymentRoute\([\s\S]*highPaymentSuperAdminEnabled/);
  assert.match(prepare, /istDay === 1 \? 7/);
  assert.match(prepare, /12,[\s\S]*30,[\s\S]*0/);
  assert.match(prepare, /amountCents !== seedCount \* seedPriceCents/);
  assert.match(paypal, /interval_unit: "WEEK"/);
  assert.match(paypal, /setup_fee:[\s\S]*setup_fee_failure_action: "CANCEL"/);
});

test("subscription webhooks create idempotent weekly orders and track failures", () => {
  const subscriptions = read("supabase/functions/_shared/subscriptions.ts");
  const webhook = read("supabase/functions/paypal-webhook/index.ts");
  const migration = read("supabase/migrations/202608290001_weekly_subscriptions.sql");

  assert.match(webhook, /isSubscriptionWebhook[\s\S]*handleSubscriptionWebhook/);
  assert.match(subscriptions, /PAYMENT\.SALE\.COMPLETED/);
  assert.match(subscriptions, /BILLING\.SUBSCRIPTION\.PAYMENT\.FAILED/);
  assert.match(subscriptions, /membership_webhook_events/);
  assert.match(subscriptions, /record_weekly_subscription_payment/);
  assert.match(migration, /create table if not exists public\.memberships/);
  assert.match(migration, /create or replace function public\.record_weekly_subscription_payment/);
  assert.match(migration, /on conflict \(paypal_transaction_id\) do nothing/);
  assert.match(migration, /apply_standard_donation_to_meter/);
});

test("Admin and SuperAdmin subscription portals remain route scoped", () => {
  const admin = read("supabase/functions/admin-subscriptions/index.ts");
  const app = read("src/app.js");

  assert.match(admin, /adminProfile\.role === "super_admin"[\s\S]*"superadmin"[\s\S]*"standard"/);
  assert.match(admin, /\.eq\("payment_route", paymentRoute\)/);
  assert.match(admin, /cancelPayPalSubscription/);
  assert.match(app, /subscriptionFilter = "active"/);
  assert.match(app, /\["cancelled", "expired"\]/);
  assert.match(app, /subscription\.status === "active"\) return "active"/);
});
