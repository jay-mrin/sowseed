import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const routingPath = path.join(repositoryRoot, "supabase/functions/_shared/payment-routing.ts");

async function loadPaymentRouting() {
  const typescript = await readFile(routingPath, "utf8");
  const javascript = typescript
    .replaceAll("export ", "")
    .replace(/:\s*(?:unknown|boolean|number)\b/g, "")
    .concat("\nexport { HIGH_PAYMENT_THRESHOLD_CENTS, normalizePaymentRoute, resolvePaymentRoute };\n");
  const moduleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(javascript)}`;

  return import(moduleUrl);
}

test("payment threshold remains $21", async () => {
  const { HIGH_PAYMENT_THRESHOLD_CENTS } = await loadPaymentRouting();

  assert.equal(HIGH_PAYMENT_THRESHOLD_CENTS, 2100);
});

test("Admin remains the default route when the override is disabled", async () => {
  const { resolvePaymentRoute } = await loadPaymentRouting();

  assert.equal(resolvePaymentRoute("standard", false, 700), "standard");
  assert.equal(resolvePaymentRoute("standard", false, 2100), "standard");
});

test("SuperAdmin selection routes every amount to SuperAdmin", async () => {
  const { resolvePaymentRoute } = await loadPaymentRouting();

  assert.equal(resolvePaymentRoute("superadmin", false, 700), "superadmin");
  assert.equal(resolvePaymentRoute("superadmin", false, 2100), "superadmin");
});

test("$21 override changes only qualifying Admin payments", async () => {
  const { resolvePaymentRoute } = await loadPaymentRouting();

  assert.equal(resolvePaymentRoute("standard", true, 2099), "standard");
  assert.equal(resolvePaymentRoute("standard", true, 2100), "superadmin");
  assert.equal(resolvePaymentRoute("standard", true, 4900), "superadmin");
});

test("unknown route values normalize to Admin", async () => {
  const { normalizePaymentRoute, resolvePaymentRoute } = await loadPaymentRouting();

  assert.equal(normalizePaymentRoute("admin"), "standard");
  assert.equal(normalizePaymentRoute("unexpected"), "standard");
  assert.equal(resolvePaymentRoute("unexpected", false, 700), "standard");
});
