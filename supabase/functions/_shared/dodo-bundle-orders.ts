import { getDodoPayment } from "./dodo.ts";
import { getSupabaseAdmin } from "./supabase.ts";
import { parseDodoBundlePayment } from "./dodo-bundles.mjs";

function createOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `SYS-${date}-${suffix}`;
}

export async function recordDodoBundlePayment(paymentId: string): Promise<boolean> {
  const payment = await getDodoPayment(paymentId);
  const bundle = parseDodoBundlePayment(payment, paymentId);
  if (!bundle) return false;

  const supabase = getSupabaseAdmin();
  const { data: existing, error: lookupError } = await supabase.from("donations")
    .select("id")
    .eq("dodo_payment_id", paymentId)
    .maybeSingle();
  if (lookupError) throw lookupError;

  let donation = existing;
  if (!donation) {
    const { data: created, error } = await supabase.from("donations").insert({
      display_name: bundle.customerName,
      amount: bundle.amount,
      seed_count: 1,
      frequency: "once",
      payment_method: "dodo",
      paypal_status: "COMPLETED",
      dodo_payment_id: paymentId,
      payment_route: "standard",
      visibility_scope: "public",
      raw_payment: {
        provider: "Dodo Payments",
        product: { type: "bundle", productId: bundle.productId, itemName: bundle.itemName },
        payment,
      },
    }).select("id").single();
    if (error?.code === "23505") {
      const { data: raced, error: racedError } = await supabase.from("donations")
        .select("id")
        .eq("dodo_payment_id", paymentId)
        .single();
      if (racedError) throw racedError;
      donation = raced;
    } else if (error) {
      throw error;
    } else {
      donation = created;
    }
  }

  if (!donation) throw new Error("Dodo bundle order could not be created.");

  const { data: order, error: orderLookupError } = await supabase.from("digital_orders")
    .select("id")
    .eq("donation_id", donation.id)
    .maybeSingle();
  if (orderLookupError) throw orderLookupError;
  if (!order) {
    const { error: orderError } = await supabase.from("digital_orders").insert({
      order_number: createOrderNumber(),
      donation_id: donation.id,
      payment_provider: "dodo",
      provider_order_id: bundle.checkoutSessionId || paymentId,
      provider_transaction_id: paymentId,
      customer_name: bundle.customerName,
      contact_email: bundle.contactEmail,
      payer_email: bundle.contactEmail,
      amount: bundle.amount,
      currency: "USD",
      item_name: bundle.itemName,
      redeemed_book_title: "",
      fulfillment_status: "fulfilled",
    });
    if (orderError?.code === "23505") {
      const { data: racedOrder, error: racedOrderError } = await supabase.from("digital_orders")
        .select("id")
        .eq("donation_id", donation.id)
        .maybeSingle();
      if (racedOrderError) throw racedOrderError;
      if (!racedOrder) throw orderError;
    } else if (orderError) {
      throw orderError;
    }
  }
  return true;
}
