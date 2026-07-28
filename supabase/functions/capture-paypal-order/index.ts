import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { capturePayPalOrder, getPayPalCurrency } from "../_shared/paypal.ts";
import { createRandomToken, getSupabaseAdmin, hashText } from "../_shared/supabase.ts";

type CaptureBody = {
  orderId?: string;
  donation?: {
    name?: string;
    frequency?: string;
    message?: string;
  };
};

function seedCountFromAmount(amount: number) {
  return Math.max(1, Math.round(amount / 6));
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function formatCsvDateTime(dateValue?: string) {
  const date = new Date(dateValue || Date.now());
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

  return [
    padDatePart(safeDate.getUTCMonth() + 1),
    padDatePart(safeDate.getUTCDate()),
    safeDate.getUTCFullYear(),
  ].join("/") + ` ${padDatePart(safeDate.getUTCHours())}:${padDatePart(safeDate.getUTCMinutes())}`;
}

function formatCsvAmount(value: number) {
  return (Number(value) || 0).toFixed(2);
}

function captureFromOrder(order: Record<string, any>) {
  return order.purchase_units?.[0]?.payments?.captures?.[0] || null;
}

function getBuyerAddress(order: Record<string, any>) {
  return order.payer?.address || order.purchase_units?.[0]?.shipping?.address || {};
}

function getSalesTax(order: Record<string, any>) {
  const taxValue = order.purchase_units?.[0]?.amount?.breakdown?.tax_total?.value;
  return taxValue === undefined || taxValue === null ? "" : String(taxValue);
}

function buildExportRow(input: {
  order: Record<string, any>;
  capture: Record<string, any>;
  displayName: string;
  amount: number;
  currency: string;
}) {
  const address = getBuyerAddress(input.order);

  return {
    "DateTime (UTC)": formatCsvDateTime(input.capture.create_time || input.order.create_time),
    From: input.displayName,
    Item: "Tip to Creator",
    Received: formatCsvAmount(input.amount),
    Given: "0",
    Currency: input.currency,
    TransactionType: "Tip",
    TransactionId: input.capture.id || "",
    Reference: input.order.id || input.order.purchase_units?.[0]?.custom_id || "",
    SalesTax: getSalesTax(input.order),
    SalesTaxPercentage: "",
    SalesTaxIncludesShipping: "",
    BuyerCountry: address.country_code || "",
    BuyerStateOrProvince: address.admin_area_1 || "",
    BuyerEmail: input.order.payer?.email_address || "",
    PaymentProvider: "PayPal",
  };
}

function getCurrentGoalCycleAmount(totalAmount: number, goalAmount: number) {
  const numericTotal = Math.max(Number(totalAmount) || 0, 0);
  const numericGoal = Math.max(Number(goalAmount) || 0, 0);

  if (!numericGoal) return numericTotal;

  return numericTotal % numericGoal;
}

async function advanceMeterCycle(supabase: ReturnType<typeof getSupabaseAdmin>, amount: number) {
  const { data: settingsRow, error } = await supabase
    .from("site_settings")
    .select("settings")
    .eq("id", true)
    .maybeSingle();

  if (error) throw error;

  const settings =
    settingsRow?.settings && typeof settingsRow.settings === "object" && !Array.isArray(settingsRow.settings)
      ? settingsRow.settings
      : {};
  const goalAmount = Math.max(Number(settings.seedGoal) || 0, 0);
  const currentAmount = Math.max(Number(settings.meterCurrentAmount ?? settings.startingSeeds) || 0, 0);
  const nextCurrentAmount = getCurrentGoalCycleAmount(currentAmount + amount, goalAmount);

  const { error: updateError } = await supabase
    .from("site_settings")
    .upsert(
      {
        id: true,
        settings: {
          ...settings,
          meterCurrentAmount: Number(nextCurrentAmount.toFixed(2)),
          startingSeeds: 0,
        },
      },
      { onConflict: "id" },
    );

  if (updateError) throw updateError;

  return nextCurrentAmount;
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const body = await readJson<CaptureBody>(request);
    const orderId = String(body.orderId || "").trim();

    if (!orderId) return errorResponse("PayPal order id is required.", 422);

    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from("donations")
      .select("id, fortune_message, display_name, amount, seed_count, frequency, created_at")
      .eq("paypal_order_id", orderId)
      .maybeSingle();

    if (existing) {
      return jsonResponse({
        donation: existing,
        fortune: existing.fortune_message,
        donorAccessToken: null,
        duplicate: true,
      });
    }

    const order = await capturePayPalOrder(orderId);
    const capture = captureFromOrder(order);

    if (!capture || capture.status !== "COMPLETED") {
      return errorResponse("PayPal payment was not completed.", 422, order);
    }

    const capturedAmount = Number(capture.amount?.value || 0);
    const currency = capture.amount?.currency_code || getPayPalCurrency();

    if (!capturedAmount || currency !== getPayPalCurrency()) {
      return errorResponse("PayPal captured amount or currency is invalid.", 422, order);
    }

    const { data: fortunes, error: fortuneError } = await supabase
      .from("fortunes")
      .select("id, message")
      .eq("active", true)
      .limit(200);

    if (fortuneError || !fortunes?.length) throw fortuneError || new Error("No active fortune messages found.");

    const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];

    const displayName = String(body.donation?.name || order.payer?.name?.given_name || "Supporter")
      .trim()
      .slice(0, 80);
    const supporterMessage = String(body.donation?.message || "").trim().slice(0, 280);
    const frequency = body.donation?.frequency === "monthly" ? "monthly" : "once";
    const exportRow = buildExportRow({
      order,
      capture,
      displayName,
      amount: capturedAmount,
      currency,
    });
    const rawDonorToken = createRandomToken();
    const donorTokenHash = await hashText(rawDonorToken);

    const { data: donorToken, error: donorTokenError } = await supabase
      .from("donor_tokens")
      .insert({
        token_hash: donorTokenHash,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();
    if (donorTokenError) throw donorTokenError;

    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert({
        display_name: displayName,
        amount: capturedAmount,
        seed_count: seedCountFromAmount(capturedAmount),
        frequency,
        supporter_message: supporterMessage || null,
        payment_method: "paypal",
        paypal_order_id: order.id,
        paypal_capture_id: capture.id,
        paypal_payer_email: order.payer?.email_address || null,
        paypal_status: capture.status,
        fortune_id: fortune.id,
        fortune_message: fortune.message,
        donor_token_id: donorToken.id,
        raw_payment: {
          provider: "PayPal",
          row: exportRow,
          order,
        },
      })
      .select("id, display_name, amount, seed_count, frequency, supporter_message, fortune_message, created_at")
      .single();
    if (donationError) throw donationError;

    await supabase.from("donor_tokens").update({ donation_id: donation.id }).eq("id", donorToken.id);
    const meterCurrentAmount = await advanceMeterCycle(supabase, capturedAmount);

    return jsonResponse({
      donation,
      fortune: fortune.message,
      donorAccessToken: rawDonorToken,
      meterCurrentAmount,
    });
  } catch (error) {
    return errorResponse("Could not capture PayPal order.", 500, String(error));
  }
});
