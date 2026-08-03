import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/supabase.ts";

type UpdateOrderBody = {
  donationId?: string;
  fulfillmentStatus?: string;
  fulfillmentNote?: string;
};

function isDateOnly(value: string | null) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function getUtcDayStart(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function mapDigitalOrder(value: any) {
  const order = Array.isArray(value) ? value[0] : value;

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
    amount: Number(order.amount),
    currency: order.currency,
    itemName: order.item_name,
    personalizedRequest: order.personalized_request,
    blessingMessage: order.blessing_message,
    fulfillmentStatus: order.fulfillment_status,
    fulfillmentNote: order.fulfillment_note,
    fulfilledAt: order.fulfilled_at,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const { supabase, adminProfile } = await requireAdmin(request, { allowedRoles: ["admin", "super_admin"] });
    const url = new URL(request.url);

    if (request.method === "PATCH") {
      if (adminProfile.role !== "super_admin") {
        return errorResponse("Only superadmins can approve donations.", 403);
      }
      const body = await readJson<{ donationId?: string; superApproved?: boolean }>(request);
      const donationId = String(body.donationId || "").trim();
      const superApproved = Boolean(body.superApproved);

      if (!donationId) return errorResponse("Donation id is required.", 422);

      const { data, error } = await supabase
        .from("donations")
        .update({ super_approved: superApproved })
        .eq("id", donationId)
        .eq("payment_route", "superadmin")
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!data) return errorResponse("Superadmin donation not found.", 404);

      return jsonResponse({ success: true });
    }

    if (request.method === "PUT") {
      const body = await readJson<UpdateOrderBody>(request);
      const donationId = String(body.donationId || "").trim();
      const fulfillmentStatus =
        body.fulfillmentStatus === "fulfilled" ? "fulfilled" : "paid_awaiting_personalized_writing";
      const fulfillmentNote = String(body.fulfillmentNote || "").trim().slice(0, 1200);

      if (!donationId) return errorResponse("Donation id is required.", 422);

      const { data: donation, error: donationError } = await supabase
        .from("donations")
        .select("id")
        .eq("id", donationId)
        .maybeSingle();

      if (donationError) throw donationError;
      if (!donation) return errorResponse("Donation not found.", 404);

      const { data, error } = await supabase
        .from("digital_orders")
        .update({
          fulfillment_status: fulfillmentStatus,
          fulfillment_note: fulfillmentNote || null,
          fulfilled_at: fulfillmentStatus === "fulfilled" ? new Date().toISOString() : null,
        })
        .eq("donation_id", donationId)
        .select(
          "id, order_number, donation_id, paypal_order_id, paypal_capture_id, customer_name, contact_email, payer_email, amount, currency, item_name, personalized_request, blessing_message, fulfillment_status, fulfillment_note, fulfilled_at, created_at, updated_at",
        )
        .maybeSingle();

      if (error) throw error;
      if (!data) return errorResponse("Digital order not found for this donation.", 404);

      return jsonResponse({ order: mapDigitalOrder(data) });
    }

    const month = url.searchParams.get("month");
    const exportRows = url.searchParams.get("export") === "csv";
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    let query = supabase
      .from("donations")
      .select(
        [
          "id",
          "display_name",
          "amount",
          "seed_count",
          "frequency",
          "supporter_message",
          "payment_method",
          "paypal_status",
          "paypal_order_id",
          "paypal_capture_id",
          "paypal_payer_email",
          "payment_route",
          "super_approved",
          "receiver_identifier",
          "fortune_message",
          "raw_payment",
          "created_at",
          "digital_orders(id, order_number, donation_id, paypal_order_id, paypal_capture_id, customer_name, contact_email, payer_email, amount, currency, item_name, personalized_request, blessing_message, fulfillment_status, fulfillment_note, fulfilled_at, created_at, updated_at)",
        ].join(", "),
      )
      .order("created_at", { ascending: false });

    if (adminProfile.role === "admin") {
      query = query.neq("payment_route", "superadmin");
    } else if (adminProfile.role === "super_admin") {
      query = query.eq("payment_route", "superadmin");
    }

    if (exportRows && isDateOnly(startDate)) {
      query = query.gte("created_at", getUtcDayStart(startDate as string).toISOString());
    }

    if (exportRows && isDateOnly(endDate)) {
      const end = getUtcDayStart(endDate as string);
      end.setUTCDate(end.getUTCDate() + 1);
      query = query.lt("created_at", end.toISOString());
    }

    if (!exportRows && month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, monthIndex] = month.split("-").map(Number);
      const start = new Date(Date.UTC(year, monthIndex - 1, 1));
      const end = new Date(Date.UTC(year, monthIndex, 1));
      query = query.gte("created_at", start.toISOString()).lt("created_at", end.toISOString());
    }

    const { data, error } = await query.limit(exportRows ? 5000 : 500);
    if (error) throw error;

    return jsonResponse({
      donations: (data || []).map((donation) => ({
        id: donation.id,
        name: donation.display_name,
        amount: Number(donation.amount),
        seedCount: donation.seed_count,
        frequency: donation.frequency,
        message: donation.supporter_message,
        paymentMethod: donation.payment_method,
        status: donation.paypal_status,
        orderId: donation.paypal_order_id,
        captureId: donation.paypal_capture_id,
        payerEmail: donation.paypal_payer_email,
        paymentRoute: donation.payment_route || "standard",
        superApproved: donation.super_approved,
        receiverIdentifier: donation.receiver_identifier,
        fortuneMessage: donation.fortune_message,
        rawPayment: donation.raw_payment,
        digitalOrder: mapDigitalOrder(donation.digital_orders),
        createdAt: donation.created_at,
      })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse("Could not load admin donations.", 500, String(error));
  }
});
