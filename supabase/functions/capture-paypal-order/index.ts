import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import {
  capturePayPalOrder,
  centsToMoney,
  createDigitalOrderNumber,
  DIGITAL_ORDER_ITEM_NAME,
  getPayPalCurrency,
  getReceiverIdentifierFromPayPalOrder,
  parseMoneyToCents,
} from "../_shared/paypal.ts";
import { createRandomToken, getSupabaseAdmin, hashText } from "../_shared/supabase.ts";

type CaptureBody = {
  orderId?: string;
  donation?: {
    amount?: number;
    name?: string;
    frequency?: string;
    message?: string;
  };
};

function seedCountFromAmount(amount: number) {
  return Math.max(1, Math.round(amount / 7));
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

function getOrderNumberFromPayPal(order: Record<string, any>) {
  const customId = String(order.purchase_units?.[0]?.custom_id || "").trim();

  if (/^SYS-\d{8}-[A-Z0-9]{6,12}$/.test(customId)) return customId;

  return createDigitalOrderNumber();
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

function mapDigitalOrder(order: Record<string, any> | null) {
  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.order_number,
    donationId: order.donation_id,
    itemName: order.item_name,
    personalizedRequest: order.personalized_request,
    blessingMessage: order.blessing_message,
    fulfillmentStatus: order.fulfillment_status,
    fulfillmentNote: order.fulfillment_note,
    fulfilledAt: order.fulfilled_at,
    createdAt: order.created_at,
  };
}

function mapSeedComment(comment: Record<string, any> | null) {
  if (!comment) return null;

  return {
    id: comment.id,
    name: comment.display_name,
    text: comment.body,
    amount: comment.amount === null ? null : Number(comment.amount),
    seedCount: comment.seed_count,
    source: comment.source,
    createdAt: comment.created_at,
  };
}

async function ensureDigitalOrder(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  input: {
    donationId: string;
    orderNumber?: string;
    paypalOrderId?: string | null;
    paypalCaptureId?: string | null;
    customerName: string;
    payerEmail?: string | null;
    amount: number;
    currency: string;
    personalizedRequest?: string | null;
    blessingMessage?: string | null;
  },
) {
  const { data: existing, error: existingError } = await supabase
    .from("digital_orders")
    .select(
      "id, order_number, donation_id, item_name, personalized_request, blessing_message, fulfillment_status, fulfillment_note, fulfilled_at, created_at",
    )
    .eq("donation_id", input.donationId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("digital_orders")
    .insert({
      order_number: input.orderNumber || createDigitalOrderNumber(),
      donation_id: input.donationId,
      paypal_order_id: input.paypalOrderId || null,
      paypal_capture_id: input.paypalCaptureId || null,
      customer_name: input.customerName,
      payer_email: input.payerEmail || null,
      amount: input.amount,
      currency: input.currency,
      item_name: DIGITAL_ORDER_ITEM_NAME,
      personalized_request: input.personalizedRequest || null,
      blessing_message: input.blessingMessage || null,
      fulfillment_status: "paid_awaiting_personalized_writing",
    })
    .select(
      "id, order_number, donation_id, item_name, personalized_request, blessing_message, fulfillment_status, fulfillment_note, fulfilled_at, created_at",
    )
    .single();

  if (createError) throw createError;

  return created;
}

async function ensureSeedComment(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  input: {
    donationId: string;
    displayName: string;
    body?: string | null;
    amount: number;
    seedCount: number;
    createdAt?: string | null;
  },
) {
  const body = String(input.body || "").trim().slice(0, 280);

  if (!body) return null;

  const { data: existing, error: existingError } = await supabase
    .from("seed_comments")
    .select("id, display_name, body, amount, seed_count, source, created_at")
    .eq("donation_id", input.donationId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("seed_comments")
    .insert({
      donation_id: input.donationId,
      display_name: input.displayName,
      body,
      amount: input.amount,
      seed_count: input.seedCount,
      source: "payment",
      created_at: input.createdAt || new Date().toISOString(),
    })
    .select("id, display_name, body, amount, seed_count, source, created_at")
    .single();

  if (createError) throw createError;

  return created;
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
      .select(
        "id, fortune_message, display_name, amount, seed_count, frequency, supporter_message, paypal_order_id, paypal_capture_id, paypal_payer_email, payment_route, receiver_identifier, raw_payment, created_at",
      )
      .eq("paypal_order_id", orderId)
      .maybeSingle();

    if (existing) {
      const paymentRoute = "standard";
      const rawPayment =
        existing.raw_payment && typeof existing.raw_payment === "object" && !Array.isArray(existing.raw_payment)
          ? existing.raw_payment
          : {};
      const rawOrder = rawPayment.order && typeof rawPayment.order === "object" ? rawPayment.order : {};
      const rawRow = rawPayment.row && typeof rawPayment.row === "object" ? rawPayment.row : {};
      const digitalOrder = await ensureDigitalOrder(supabase, {
        donationId: existing.id,
        orderNumber: rawPayment.digitalOrder?.orderNumber || getOrderNumberFromPayPal(rawOrder),
        paypalOrderId: existing.paypal_order_id,
        paypalCaptureId: existing.paypal_capture_id,
        customerName: existing.display_name,
        payerEmail: existing.paypal_payer_email,
        amount: Number(existing.amount) || 0,
        currency: rawRow.Currency || getPayPalCurrency(),
        personalizedRequest: existing.supporter_message,
        blessingMessage: existing.fortune_message,
      });
      const seedComment = await ensureSeedComment(supabase, {
        donationId: existing.id,
        displayName: existing.display_name,
        body: existing.supporter_message,
        amount: Number(existing.amount) || 0,
        seedCount: Number(existing.seed_count) || seedCountFromAmount(Number(existing.amount) || 0),
        createdAt: existing.created_at,
      });

      return jsonResponse({
        donation: {
          ...existing,
          paymentRoute,
          receiverIdentifier: existing.receiver_identifier || null,
        },
        fortune: existing.fortune_message,
        digitalOrder: mapDigitalOrder(digitalOrder),
        seedComment: mapSeedComment(seedComment),
        donorAccessToken: null,
        paymentRoute,
        duplicate: true,
      });
    }

    const order = await capturePayPalOrder(orderId);
    const capture = captureFromOrder(order);

    if (!capture || capture.status !== "COMPLETED") {
      return errorResponse("PayPal payment was not completed.", 422, order);
    }

    const capturedAmountCents = parseMoneyToCents(capture.amount?.value);
    const capturedAmount = centsToMoney(capturedAmountCents);
    const currency = capture.amount?.currency_code || getPayPalCurrency();

    if (!capturedAmountCents || currency !== getPayPalCurrency()) {
      return errorResponse("PayPal captured amount or currency is invalid.", 422, order);
    }

    const paymentRoute = "standard";
    const receiverIdentifier = getReceiverIdentifierFromPayPalOrder(order);

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
    const orderNumber = getOrderNumberFromPayPal(order);
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
        payment_route: paymentRoute,
        receiver_identifier: receiverIdentifier,
        fortune_id: fortune.id,
        fortune_message: fortune.message,
        donor_token_id: donorToken.id,
        raw_payment: {
          provider: "PayPal",
          routing: {
            route: paymentRoute,
            receiverIdentifier,
          },
          row: exportRow,
          order,
          digitalOrder: {
            orderNumber,
            itemName: DIGITAL_ORDER_ITEM_NAME,
            fulfillmentStatus: "paid_awaiting_personalized_writing",
          },
        },
      })
      .select("id, display_name, amount, seed_count, frequency, supporter_message, fortune_message, created_at")
      .single();
    if (donationError) throw donationError;

    const digitalOrder = await ensureDigitalOrder(supabase, {
      donationId: donation.id,
      orderNumber,
      paypalOrderId: order.id,
      paypalCaptureId: capture.id,
      customerName: displayName,
      payerEmail: order.payer?.email_address || null,
      amount: capturedAmount,
      currency,
      personalizedRequest: supporterMessage,
      blessingMessage: fortune.message,
    });
    const seedComment = await ensureSeedComment(supabase, {
      donationId: donation.id,
      displayName,
      body: supporterMessage,
      amount: capturedAmount,
      seedCount: seedCountFromAmount(capturedAmount),
      createdAt: donation.created_at,
    });

    await supabase.from("donor_tokens").update({ donation_id: donation.id }).eq("id", donorToken.id);
    const meterCurrentAmount = await advanceMeterCycle(supabase, capturedAmount);

    return jsonResponse({
      donation: {
        ...donation,
        paymentRoute,
        receiverIdentifier,
      },
      fortune: fortune.message,
      digitalOrder: mapDigitalOrder(digitalOrder),
      seedComment: mapSeedComment(seedComment),
      donorAccessToken: rawDonorToken,
      meterCurrentAmount,
      paymentRoute,
    });
  } catch (error) {
    return errorResponse("Could not capture PayPal order.", 500, String(error));
  }
});
