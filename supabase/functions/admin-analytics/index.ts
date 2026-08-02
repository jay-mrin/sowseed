import { errorResponse, handleOptions, jsonResponse } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/supabase.ts";

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const { supabase } = await requireAdmin(request, { allowedRoles: ["admin"] });
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("page_views")
      .select("visitor_key_hash, last_seen_at, path")
      .gte("last_seen_at", since)
      .order("last_seen_at", { ascending: false })
      .limit(10000);

    if (error) throw error;

    const { data: checkoutEvents, error: checkoutEventsError } = await supabase
      .from("checkout_events")
      .select("event_name")
      .eq("payment_route", "standard")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000);

    if (checkoutEventsError) throw checkoutEventsError;

    const { count: completedPaymentCount, error: completedPaymentError } = await supabase
      .from("donations")
      .select("id", { count: "exact", head: true })
      .eq("payment_route", "standard")
      .eq("paypal_status", "COMPLETED")
      .gte("created_at", since);

    if (completedPaymentError) throw completedPaymentError;

    const rows = data || [];
    const events = checkoutEvents || [];
    const uniqueVisitors = new Set(rows.map((row) => row.visitor_key_hash).filter(Boolean));
    const checkoutButtonClicks = events.filter((event) => event.event_name === "checkout_button_clicked").length;
    const paypalCheckoutStarts = events.filter((event) => event.event_name === "paypal_checkout_started").length;
    const topPaths = Array.from(
      rows.reduce((paths, row) => {
        const path = row.path || "/";
        paths.set(path, (paths.get(path) || 0) + 1);
        return paths;
      }, new Map<string, number>()),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, views]) => ({ path, views }));

    return jsonResponse({
      generatedAt: new Date().toISOString(),
      pageViewsLast24h: rows.length,
      uniqueVisitorsLast24h: uniqueVisitors.size,
      checkoutButtonClicksLast24h: checkoutButtonClicks,
      paypalCheckoutStartsLast24h: paypalCheckoutStarts,
      completedPaymentsLast24h: completedPaymentCount || 0,
      topPaths,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse("Could not load page view analytics.", 500, String(error));
  }
});
