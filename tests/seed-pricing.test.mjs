import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("one seed starts at $11 in both checkout forms and server payment routes", () => {
  const html = read("index.html");
  const app = read("src/app.js");
  const dodo = read("supabase/functions/create-dodo-checkout/index.ts");
  const paypal = read("supabase/functions/create-paypal-order/index.ts");
  const capture = read("supabase/functions/capture-paypal-order/index.ts");

  assert.match(html, /id="dodoTotalAmount">\$11\.00/);
  assert.match(html, /id="amountInput"[^>]*min="11"[^>]*value="11\.00"/);
  assert.match(app, /const SEED_DOLLAR_VALUE = 11;/);
  assert.match(app, /const MIN_DONATION_AMOUNT = 11;/);
  assert.match(dodo, /const unitPrice = Math\.max\(Number\(settingsRow\?\.settings\?\.seedPrice\) \|\| 11, 11\)/);
  assert.match(paypal, /const MIN_AMOUNT_CENTS = 1100;/);
  assert.match(capture, /const MIN_AMOUNT_CENTS = 1100;/);
  assert.match(capture, /const LEGACY_BOOK_UNIT_CENTS = 700;/);
});
