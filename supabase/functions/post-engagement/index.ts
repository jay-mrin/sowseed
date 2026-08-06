import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { getSupabaseAdmin, hashText } from "../_shared/supabase.ts";

type EngagementBody = {
  action?: "like" | "comment";
  postId?: string;
  visitorKey?: string;
  donorAccessToken?: string;
  displayName?: string;
  comment?: string;
};

async function getLikeState(supabase: ReturnType<typeof getSupabaseAdmin>, postId: string, visitorKeyHash: string) {
  const { count } = await supabase
    .from("post_likes")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  const { data: liked } = visitorKeyHash
    ? await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("visitor_key_hash", visitorKeyHash)
        .maybeSingle()
    : { data: null };

  return {
    likes: count || 0,
    liked: Boolean(liked),
  };
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const body = await readJson<EngagementBody>(request);
    const supabase = getSupabaseAdmin();
    const postId = String(body.postId || "").trim();

    if (!postId) return errorResponse("postId is required.", 422);

    if (body.action === "like") {
      const visitorKey = String(body.visitorKey || "").trim();
      if (!visitorKey) return errorResponse("visitorKey is required.", 422);

      const visitorKeyHash = await hashText(visitorKey);
      const { data: existing } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("visitor_key_hash", visitorKeyHash)
        .maybeSingle();

      if (existing) {
        await supabase.from("post_likes").delete().eq("id", existing.id);
      } else {
        await supabase.from("post_likes").insert({ post_id: postId, visitor_key_hash: visitorKeyHash });
      }

      return jsonResponse(await getLikeState(supabase, postId, visitorKeyHash));
    }

    if (body.action === "comment") {
      const donorAccessToken = String(body.donorAccessToken || "").trim();
      const comment = String(body.comment || "").trim().slice(0, 280);
      const displayName = String(body.displayName || "Customer").trim().slice(0, 80) || "Customer";

      if (!donorAccessToken) return errorResponse("Complete a custom order to comment.", 403);
      if (!comment) return errorResponse("Comment is required.", 422);

      const tokenHash = await hashText(donorAccessToken);
      const { data: donorToken } = await supabase
        .from("donor_tokens")
        .select("id, expires_at")
        .eq("token_hash", tokenHash)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (!donorToken) return errorResponse("Complete a custom order to comment.", 403);

      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          donor_token_id: donorToken.id,
          display_name: displayName,
          body: comment,
        })
        .select("id, display_name, body, created_at")
        .single();

      if (error) throw error;

      return jsonResponse({
        comment: {
          id: data.id,
          name: data.display_name,
          text: data.body,
          createdAt: data.created_at,
        },
      });
    }

    return errorResponse("Unsupported engagement action.", 422);
  } catch (error) {
    return errorResponse("Could not save post engagement.", 500, String(error));
  }
});
