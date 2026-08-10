import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { getRandomOrderRequest } from "../_shared/order-requests.ts";
import {
  captureRazorpayPayment,
  fetchRazorpayPayment,
  getRazorpayCurrency,
  parseMoneyToPaise,
  verifyRazorpaySignature,
} from "../_shared/razorpay.ts";
import { createRandomToken, getSupabaseAdmin, hashText } from "../_shared/supabase.ts";
import { DIGITAL_ORDER_ITEM_NAME, createDigitalOrderNumber } from "../_shared/paypal.ts";

const MIN_AMOUNT_PAISE = 700;

type CaptureBody = {
  orderId?: string;
  paymentId?: string;
  signature?: string;
  donation?: {
    amount?: number;
    name?: string;
    frequency?: string;
    message?: string;
    email?: string;
    paymentMode?: string;
  };
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function seedCountFromAmount(amount: number) {
  return Math.max(1, Math.round(amount / 7));
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

function formatCsvDateTime(dateValue?: string) {
  const numericDate = Number(dateValue);
  const date = Number.isFinite(numericDate) && numericDate > 100000
    ? new Date(numericDate * 1000)
    : new Date(dateValue || Date.now());
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

function buildExportRow(input: {
  payment: Record<string, any>;
  displayName: string;
  amount: number;
  currency: string;
}) {
  const address = input.payment?.notes || {};

  return {
    "DateTime (UTC)": formatCsvDateTime(input.payment.created_at),
    From: input.displayName,
    Item: "Personalised Digital Writing - Custom Order Made Writing",
    Received: formatCsvAmount(input.amount),
    Given: "0",
    Currency: input.currency,
    TransactionType: "Custom order payment",
    TransactionId: input.payment.id || "",
    Reference: input.payment.order_id || "",
    SalesTax: "",
    SalesTaxPercentage: "",
    SalesTaxIncludesShipping: "",
    BuyerCountry: address.BuyerCountry || "",
    BuyerStateOrProvince: address.BuyerStateOrProvince || "",
    BuyerEmail: input.payment.email || "",
    PaymentProvider: "Razorpay Test",
  };
}

function mapDigitalOrder(order: Record<string, any> | null) {
  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.order_number,
    donationId: order.donation_id,
    paypalOrderId: order.paypal_order_id,
    paypalCaptureId: order.paypal_capture_id,
    customerName: order.customer_name,
    contactEmail: order.contact_email,
    payerEmail: order.payer_email,
    amount: order.amount,
    currency: order.currency,
    itemName: order.item_name,
    personalizedRequest: order.personalized_request,
    blessingMessage: order.blessing_message,
    fulfillmentStatus: order.fulfillment_status,
    fulfillmentNote: order.fulfillment_note,
    fulfilledAt: order.fulfilled_at,
    createdAt: order.created_at,
  };
}

async function ensureDigitalOrder(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  input: {
    donationId: string;
    orderNumber?: string;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
    customerName: string;
    contactEmail?: string | null;
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
      "id, order_number, donation_id, paypal_order_id, paypal_capture_id, customer_name, contact_email, payer_email, amount, currency, item_name, personalized_request, blessing_message, fulfillment_status, fulfillment_note, fulfilled_at, created_at",
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
      paypal_order_id: input.razorpayOrderId || null,
      paypal_capture_id: input.razorpayPaymentId || null,
      customer_name: input.customerName,
      contact_email: input.contactEmail || null,
      payer_email: input.payerEmail || null,
      amount: input.amount,
      currency: input.currency,
      item_name: DIGITAL_ORDER_ITEM_NAME,
      personalized_request: input.personalizedRequest || null,
      blessing_message: input.blessingMessage || null,
      fulfillment_status: "paid_awaiting_personalized_writing",
    })
    .select(
      "id, order_number, donation_id, paypal_order_id, paypal_capture_id, customer_name, contact_email, payer_email, amount, currency, item_name, personalized_request, blessing_message, fulfillment_status, fulfillment_note, fulfilled_at, created_at",
    )
    .single();

  if (createError) throw createError;

  return created;
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const body = await readJson<CaptureBody>(request);
    const orderId = String(body.orderId || "").trim();
    const paymentId = String(body.paymentId || "").trim();
    const signature = String(body.signature || "").trim();
    const contactEmail = String(body.donation?.email || "").trim().slice(0, 160);

    if (!orderId || !paymentId || !signature) return errorResponse("Razorpay payment details are required.", 422);
    if (!isValidEmail(contactEmail)) return errorResponse("A valid email is required for the order detail.", 422);

    const supabase = getSupabaseAdmin();
    const verified = await verifyRazorpaySignature(orderId, paymentId, signature);
    if (!verified) return errorResponse("Razorpay payment signature could not be verified.", 422);

    let payment = await fetchRazorpayPayment(paymentId);
    if (payment.order_id !== orderId) return errorResponse("Razorpay payment does not match the order.", 422);

    if (payment.status === "authorized") {
      payment = await captureRazorpayPayment(
        paymentId,
        Number(payment.amount) || parseMoneyToPaise(body.donation?.amount || 0),
        payment.currency || getRazorpayCurrency(),
      );
    }

    if (payment.status !== "captured") {
      return errorResponse("Razorpay payment was not completed.", 422, payment);
    }

    const capturedAmountPaise = Math.max(Number(payment.amount) || 0, 0);
    const capturedAmount = Math.max(capturedAmountPaise, 0) / 100;
    const currency = payment.currency || getRazorpayCurrency();

    if (capturedAmountPaise < MIN_AMOUNT_PAISE) {
      return errorResponse("Razorpay captured amount is below the $7 minimum.", 422, payment);
    }

    const { data: fortunes, error: fortuneError } = await supabase
      .from("fortunes")
      .select("id, message")
      .eq("active", true)
      .limit(200);
    if (fortuneError || !fortunes?.length) throw fortuneError || new Error("No active fortune messages found.");

    const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    const displayName = String(body.donation?.name || payment.notes?.displayName || "Customer").trim().slice(0, 80);
    const supporterMessage = getRandomOrderRequest();
    const frequency = body.donation?.frequency === "monthly" ? "monthly" : "once";
    const orderNumber = String(payment.receipt || createDigitalOrderNumber());
    const exportRow = buildExportRow({
      payment,
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
        payment_method: "razorpay",
        paypal_order_id: payment.order_id,
        paypal_capture_id: payment.id,
        paypal_payer_email: payment.email || null,
        paypal_status: payment.status,
        payment_route: "superadmin",
        visibility_scope: "superadmin_private",
        receiver_identifier: null,
        fortune_id: fortune.id,
        fortune_message: fortune.message,
        donor_token_id: donorToken.id,
        raw_payment: {
          provider: "Razorpay Test",
          mode: "test",
          row: exportRow,
          order: {
            id: payment.order_id,
            receipt: payment.receipt || orderNumber,
            amount: payment.amount,
            currency,
          },
          payment,
          digitalOrder: {
            orderNumber,
            customerName: displayName,
            contactEmail,
            payerEmail: payment.email || null,
            paypalOrderId: payment.order_id,
            paypalCaptureId: payment.id,
            amount: capturedAmount,
            currency,
            itemName: DIGITAL_ORDER_ITEM_NAME,
            personalizedRequest: supporterMessage,
            fulfillmentStatus: "paid_awaiting_personalized_writing",
            createdAt: payment.created_at || new Date().toISOString(),
          },
        },
      })
      .select("id, display_name, amount, seed_count, frequency, supporter_message, fortune_message, created_at")
      .single();
    if (donationError) throw donationError;

    const digitalOrder = await ensureDigitalOrder(supabase, {
      donationId: donation.id,
      orderNumber,
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
      customerName: displayName,
      contactEmail,
      payerEmail: payment.email || null,
      amount: capturedAmount,
      currency,
      personalizedRequest: supporterMessage,
      blessingMessage: fortune.message,
    });

    await supabase.from("donor_tokens").update({ donation_id: donation.id }).eq("id", donorToken.id);

    return jsonResponse({
      donation: {
        ...donation,
        paymentRoute: "superadmin",
        receiverIdentifier: null,
      },
      fortune: fortune.message,
      digitalOrder: mapDigitalOrder(digitalOrder),
      donorAccessToken: rawDonorToken,
      paymentMode: "test",
    });
  } catch (error) {
    return errorResponse("Could not capture Razorpay order.", 500, String(error));
  }
});
