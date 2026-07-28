import { errorResponse, handleOptions, jsonResponse } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/supabase.ts";

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const { supabase } = await requireAdmin(request);
    const url = new URL(request.url);
    const month = url.searchParams.get("month");
    let query = supabase
      .from("donations")
      .select("id, display_name, amount, seed_count, frequency, supporter_message, paypal_status, paypal_capture_id, created_at")
      .order("created_at", { ascending: false });

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, monthIndex] = month.split("-").map(Number);
      const start = new Date(Date.UTC(year, monthIndex - 1, 1));
      const end = new Date(Date.UTC(year, monthIndex, 1));
      query = query.gte("created_at", start.toISOString()).lt("created_at", end.toISOString());
    }

    const { data, error } = await query.limit(500);
    if (error) throw error;

    return jsonResponse({
      donations: (data || []).map((donation) => ({
        id: donation.id,
        name: donation.display_name,
        amount: Number(donation.amount),
        seedCount: donation.seed_count,
        frequency: donation.frequency,
        message: donation.supporter_message,
        status: donation.paypal_status,
        captureId: donation.paypal_capture_id,
        createdAt: donation.created_at,
      })),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse("Could not load admin donations.", 500, String(error));
  }
});
