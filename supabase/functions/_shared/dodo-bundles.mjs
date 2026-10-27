const BUNDLES = Object.freeze({
  pdt_0NqfgfmW3N3YEOYOdQeqZ: "The Stories We Left Behind",
  pdt_0NqfgsCjN9s7aPwZUT3Zp: "Of Little Things & Passing Days",
  pdt_0NqfhFlg3qTBuktD9n3K2: "Whisper of Grace",
  pdt_0Nqfh88mzTwN3HdozCrZ3: "Christ Garden Full Collection",
});

export function parseDodoBundlePayment(payment, paymentId) {
  const cart = Array.isArray(payment.product_cart) ? payment.product_cart : [];
  const bundleItem = cart.find((item) => Object.hasOwn(BUNDLES, String(item?.product_id || "")));
  if (!bundleItem) return null;

  const productId = String(bundleItem.product_id);
  const amountCents = Number(payment.total_amount);
  if (
    payment.status !== "succeeded" || payment.payment_id !== paymentId ||
    cart.length !== 1 || Number(bundleItem.quantity) !== 1 ||
    String(payment.currency || "").toUpperCase() !== "USD" ||
    !Number.isSafeInteger(amountCents) || amountCents <= 0
  ) {
    throw new Error("Dodo bundle payment details are invalid.");
  }

  return {
    productId,
    itemName: BUNDLES[productId],
    amount: amountCents / 100,
    checkoutSessionId: String(payment.checkout_session_id || "") || null,
    customerName: String(payment.customer?.name || "Customer").trim().slice(0, 80) || "Customer",
    contactEmail: String(payment.customer?.email || "").trim().slice(0, 160) || null,
  };
}
