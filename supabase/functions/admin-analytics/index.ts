import { errorResponse, handleOptions, jsonResponse } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/supabase.ts";

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const { supabase } = await requireAdmin(request);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("page_views")
      .select("visitor_key_hash, last_seen_at, path")
      .gte("last_seen_at", since)
      .order("last_seen_at", { ascending: false })
      .limit(10000);

    if (error) throw error;

    const rows = data || [];
    const uniqueVisitors = new Set(rows.map((row) => row.visitor_key_hash).filter(Boolean));
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
      topPaths,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse("Could not load page view analytics.", 500, String(error));
  }
});
