import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";
import { parseDodoBundlePayment } from "../supabase/functions/_shared/dodo-bundles.mjs";

const bundles = [
  ["pdt_0NqfgfmW3N3YEOYOdQeqZ", "The Stories We Left Behind"],
  ["pdt_0NqfgsCjN9s7aPwZUT3Zp", "Of Little Things & Passing Days"],
  ["pdt_0NqfhFlg3qTBuktD9n3K2", "Whisper of Grace"],
  ["pdt_0Nqfh88mzTwN3HdozCrZ3", "Christ Garden Full Collection"],
];

function payment(productId, overrides = {}) {
  return {
    status: "succeeded",
    payment_id: "pay_123",
    product_cart: [{ product_id: productId, quantity: 1 }],
    total_amount: 19900,
    currency: "USD",
    customer: { name: "Reader", email: "reader@example.com" },
    ...overrides,
  };
}

test("each verified Dodo bundle maps to its order item", () => {
  for (const [productId, itemName] of bundles) {
    assert.deepEqual(parseDodoBundlePayment(payment(productId), "pay_123"), {
      productId,
      itemName,
      amount: 199,
      checkoutSessionId: null,
      customerName: "Reader",
      contactEmail: "reader@example.com",
    });
  }
});

test("library bundle prices point to the matching live Dodo products", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const section = html.match(/<section class="shop-bundles"[\s\S]*?<\/section>/)?.[0] || "";
  const cards = [...section.matchAll(/<article class="shop-bundle[\s\S]*?<strong>\$(\d+)<\/strong><a href="https:\/\/checkout\.dodopayments\.com\/buy\/(pdt_[A-Za-z0-9]+)"/g)];
  assert.deepEqual(cards.map((card) => [Number(card[1]), card[2]]), [
    [199, bundles[0][0]],
    [299, bundles[1][0]],
    [399, bundles[2][0]],
    [499, bundles[3][0]],
  ]);
});

test("seed products stay outside the bundle order path", () => {
  assert.equal(parseDodoBundlePayment(payment("pdt_seed"), "pay_123"), null);
});

test("a bundle order requires a successful single-product payment", () => {
  const productId = bundles[0][0];
  for (const invalidPayment of [
    payment(productId, { status: "failed" }),
    payment(productId, { payment_id: "pay_other" }),
    payment(productId, { currency: "EUR" }),
    payment(productId, { total_amount: 0 }),
    payment(productId, { product_cart: [{ product_id: productId, quantity: 2 }] }),
    payment(productId, { product_cart: [{ product_id: productId, quantity: 1 }, { product_id: "pdt_other", quantity: 1 }] }),
  ]) {
    assert.throws(() => parseDodoBundlePayment(invalidPayment, "pay_123"));
  }
});
