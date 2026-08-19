import { errorResponse, handleOptions, jsonResponse } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/supabase.ts";

type PaymentRoute = "standard" | "superadmin";

function createEmptyAnalytics(
  generatedAt: string,
  resetAt: string,
  paymentRoute: PaymentRoute,
) {
  return {
    generatedAt,
    resetAt,
    paymentRoute,
    pageViewsLast24h: 0,
    paymentStartsLast24h: 0,
    completedPaymentsLast24h: 0,
    paymentAttempts: [],
  };
}

async function getAnalyticsSince(supabase: any, paymentRoute: PaymentRoute) {
  const dayWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const { data, error } = await supabase
    .from("checkout_analytics_state")
    .select("reset_at")
    .eq("payment_route", paymentRoute)
    .maybeSingle();

  if (error) throw error;

  const resetAt = data?.reset_at ? new Date(data.reset_at) : new Date(0);
  const since = resetAt > dayWindow ? resetAt : dayWindow;

  return {
    since: since.toISOString(),
    resetAt: resetAt.toISOString(),
  };
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const { supabase, adminProfile } = await requireAdmin(request, {
      allowedRoles: ["admin", "super_admin"],
    });
    const paymentRoute: PaymentRoute = adminProfile.role === "super_admin"
      ? "superadmin"
      : "standard";

    if (request.method === "DELETE") {
      const resetAt = new Date().toISOString();
      const { error } = await supabase
        .from("checkout_analytics_state")
        .upsert(
          { payment_route: paymentRoute, reset_at: resetAt, updated_at: resetAt },
          { onConflict: "payment_route" },
        );

      if (error) throw error;

      return jsonResponse(createEmptyAnalytics(resetAt, resetAt, paymentRoute));
    }

    if (request.method !== "GET") {
      return errorResponse("Method not allowed.", 405);
    }

    const { since, resetAt } = await getAnalyticsSince(supabase, paymentRoute);

    const { data, error } = await supabase
      .from("page_views")
      .select("id")
      .gte("last_seen_at", since)
      .eq("payment_route", paymentRoute)
      .order("last_seen_at", { ascending: false })
      .limit(10000);

    if (error) throw error;

    const { data: paymentAttempts, error: paymentAttemptsError } = await supabase
      .from("payment_attempts")
      .select("id, display_name, contact_email, amount, currency, status, created_at, confirmed_at")
      .gte("created_at", since)
      .eq("payment_route", paymentRoute)
      .order("created_at", { ascending: false })
      .limit(10000);

    if (paymentAttemptsError) throw paymentAttemptsError;

    const rows = data || [];
    const attempts = paymentAttempts || [];
    const completedPayments = attempts.filter((attempt) => attempt.status === "confirmed").length;

    return jsonResponse({
      generatedAt: new Date().toISOString(),
      resetAt,
      paymentRoute,
      pageViewsLast24h: rows.length,
      paymentStartsLast24h: attempts.length,
      completedPaymentsLast24h: completedPayments,
      paymentAttempts: attempts.map((attempt) => ({
        id: attempt.id,
        name: attempt.display_name,
        email: attempt.contact_email,
        amount: Number(attempt.amount) || 0,
        currency: attempt.currency || "USD",
        completed: attempt.status === "confirmed",
        startedAt: attempt.created_at,
        completedAt: attempt.confirmed_at,
      })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse("Could not load checkout analytics.", 500, String(error));
  }
});
