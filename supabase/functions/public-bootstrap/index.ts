import { errorResponse, handleOptions, jsonResponse } from "../_shared/http.ts";
import { getSupabaseAdmin, hashText } from "../_shared/supabase.ts";

function amountToSeeds(amount: number) {
  if (!amount) return 0;
  return Math.max(1, Math.round(amount / 6));
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const url = new URL(request.url);
    const visitorKey = url.searchParams.get("visitorKey") || "";
    const visitorKeyHash = visitorKey ? await hashText(visitorKey) : "";
    const supabase = getSupabaseAdmin();

    const { data: settingsRow, error: settingsError } = await supabase
      .from("site_settings")
      .select("settings")
      .eq("id", true)
      .maybeSingle();
    if (settingsError) throw settingsError;

    const { data: donations, error: donationsError } = await supabase
      .from("donations")
      .select("id, display_name, amount, seed_count, frequency, supporter_message, paypal_status, created_at")
      .eq("paypal_status", "COMPLETED")
      .order("created_at", { ascending: false })
      .limit(50);
    if (donationsError) throw donationsError;

    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("id, title, description, image_url, published, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (postsError) throw postsError;

    const postIds = (posts || []).map((post) => post.id);
    const { data: comments, error: commentsError } = postIds.length
      ? await supabase
          .from("comments")
          .select("id, post_id, display_name, body, created_at")
          .in("post_id", postIds)
          .order("created_at", { ascending: true })
      : { data: [], error: null };
    if (commentsError) throw commentsError;

    const { data: likes, error: likesError } = postIds.length
      ? await supabase.from("post_likes").select("post_id, visitor_key_hash").in("post_id", postIds)
      : { data: [], error: null };
    if (likesError) throw likesError;

    const likesByPost = new Map<string, { count: number; liked: boolean }>();
    for (const like of likes || []) {
      const entry = likesByPost.get(like.post_id) || { count: 0, liked: false };
      entry.count += 1;
      entry.liked = entry.liked || Boolean(visitorKeyHash && like.visitor_key_hash === visitorKeyHash);
      likesByPost.set(like.post_id, entry);
    }

    const commentsByPost = new Map<string, unknown[]>();
    for (const comment of comments || []) {
      const list = commentsByPost.get(comment.post_id) || [];
      list.push({
        id: comment.id,
        name: comment.display_name,
        text: comment.body,
        createdAt: comment.created_at,
      });
      commentsByPost.set(comment.post_id, list);
    }

    const normalizedPosts = (posts || []).map((post) => {
      const likeEntry = likesByPost.get(post.id) || { count: 0, liked: false };
      return {
        id: post.id,
        title: post.title,
        description: post.description,
        imageUrl: post.image_url,
        createdAt: post.created_at,
        likes: likeEntry.count,
        liked: likeEntry.liked,
        comments: commentsByPost.get(post.id) || [],
      };
    });

    const donationSeeds = (donations || []).reduce((total, donation) => {
      return total + (donation.seed_count || amountToSeeds(Number(donation.amount)));
    }, 0);

    return jsonResponse({
      settings: settingsRow?.settings,
      donations: (donations || []).map((donation) => ({
        id: donation.id,
        name: donation.display_name,
        amount: Number(donation.amount),
        frequency: donation.frequency,
        message: donation.supporter_message,
        createdAt: donation.created_at,
      })),
      posts: normalizedPosts,
      totals: {
        donationSeeds,
      },
      payment: {
        paypalClientId: Deno.env.get("PAYPAL_CLIENT_ID") || "",
        currency: Deno.env.get("PAYPAL_CURRENCY") || "USD",
        env: Deno.env.get("PAYPAL_ENV") || "sandbox",
      },
    });
  } catch (error) {
    return errorResponse("Could not load public data.", 500, String(error));
  }
});
