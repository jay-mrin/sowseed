import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { URL } from "node:url";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("public page has no backend integration and its scripts exist", () => {
  const html = read("index.html");
  assert.doesNotMatch(html, /supabase|config\.js|adminPanel|paypalButtonContainer|dodoPayButton/i);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
  assert.equal(new Set(ids).size, ids.length, "page IDs must be unique");
  for (const [, source] of html.matchAll(/<script src="([^"]+)"/g)) {
    assert.ok(existsSync(new URL(source.split("?")[0], root)), `${source} is missing`);
  }
  for (const [, source] of html.matchAll(/<(?:img|link)\b[^>]*(?:src|href)="(assets\/[^"]+)"/g)) {
    assert.ok(existsSync(new URL(source.split("?")[0], root)), `${source} is missing`);
  }
  for (const file of ["src/app.js", "src/home-dodo-checkout.js"]) {
    assert.doesNotMatch(read(file), /supabase|callEdge|SowYourSeedCheckout/i);
  }
});

test("book request form and Library use the same eligible book data", () => {
  const html = read("index.html");
  const checkout = read("src/home-dodo-checkout.js");
  const books = [...html.matchAll(/<article class="shop-book"[\s\S]*?<h4>([^<]+)<\/h4>[\s\S]*?<p class="shop-seed-cost"[^>]*>[\s\S]*?(\d+)\+ Seeds?/g)];
  assert.equal(books.length, 21);
  assert.equal(books.filter(([, , minimum]) => Number(minimum) <= 4).length, 5);
  assert.match(html, /id="dodoBookChoice" required/);
  assert.match(checkout, /item\.minimumSeeds <= seedCount/);
  assert.match(checkout, /checkout\.dodopayments\.com\/buy\/pdt_0Nq0zMUDbiKtD9EKOLkMD/);
  assert.match(checkout, /searchParams\.set\("quantity", String\(seedCount\)\)/);
  assert.match(checkout, /searchParams\.set\("metadata_bookTitle", bookChoice\.value\)/);
});
