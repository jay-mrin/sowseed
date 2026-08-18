import { errorResponse, handleOptions, jsonResponse } from "../_shared/http.ts";
import { getPayPalClientId } from "../_shared/paypal.ts";
import { getSupabaseAdmin, hashText } from "../_shared/supabase.ts";

function getCurrentGoalCycleAmount(totalAmount: number, goalAmount: number) {
  const numericTotal = Math.max(Number(totalAmount) || 0, 0);
  const numericGoal = Math.max(Number(goalAmount) || 0, 0);

  if (!numericGoal) return 0;

  return numericTotal % numericGoal;
}

function getUtcHourStart(date = new Date()) {
  const hour = new Date(date);
  hour.setUTCMinutes(0, 0, 0);
  return hour.toISOString();
}

function sanitizePath(value: string | null) {
  const path = String(value || "/").trim();

  if (!path || path.includes("://")) return "/";

  return path.slice(0, 180);
}

async function recordPageView(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  request: Request,
  visitorKeyHash: string,
  path: string,
) {
  if (!visitorKeyHash) return;

  const { error } = await supabase.from("page_views").upsert(
    {
      visitor_key_hash: visitorKeyHash,
      view_hour: getUtcHourStart(),
      path,
      user_agent: (request.headers.get("user-agent") || "").slice(0, 220),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "visitor_key_hash,view_hour" },
  );

  if (error) throw error;
}

async function loadCriticalData(
  supabase: ReturnType<typeof getSupabaseAdmin>,
) {
  const { data: settingsRow, error: settingsError } = await supabase
    .from("site_settings")
    .select("settings")
    .eq("id", true)
    .maybeSingle();
  if (settingsError) throw settingsError;

  const settings = settingsRow?.settings &&
      typeof settingsRow.settings === "object"
    ? settingsRow.settings
    : {};
  const checkoutRoute =
    (settings as Record<string, unknown>).checkoutRoute === "superadmin"
      ? "superadmin"
      : "standard";
  const highPaymentSuperAdminEnabled =
    (settings as Record<string, unknown>).highPaymentSuperAdminEnabled ===
      true ||
    (settings as Record<string, unknown>).highPaymentSuperAdminEnabled ===
      "true";
  const goalAmount = Math.max(Number(settings.seedGoal) || 0, 0);
  const seedPrice = Math.max(Number(settings.seedPrice) || 7, 1);
  const rawCurrentAmount = Math.max(
    Number(settings.meterCurrentAmount ?? settings.startingSeeds) || 0,
    0,
  );
  const donationAmount = goalAmount
    ? getCurrentGoalCycleAmount(rawCurrentAmount, goalAmount)
    : rawCurrentAmount;

  return {
    settings,
    totals: {
      donationSeeds: Math.floor(donationAmount / seedPrice),
      donationAmount,
    },
    payment: {
      paypalClientId: getPayPalClientId(),
      superAdminPayPalClientId: getPayPalClientId("superadmin"),
      checkoutRoute,
      highPaymentSuperAdminEnabled,
      currency: Deno.env.get("PAYPAL_CURRENCY") || "USD",
      env: Deno.env.get("PAYPAL_ENV") || "sandbox",
    },
  };
}

async function loadPublicContent(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  visitorKeyHash: string,
) {
  const [donationsResult, seedCommentsResult, postsResult] = await Promise.all([
    supabase
      .from("donations")
      .select(
        "id, display_name, amount, seed_count, frequency, supporter_message, paypal_status, created_at, payment_route, visibility_scope, payment_method, raw_payment",
      )
      .eq("paypal_status", "COMPLETED")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("seed_comments")
      .select(
        "id, display_name, body, amount, seed_count, source, created_at, donations(payment_route, visibility_scope, payment_method, raw_payment)",
      )
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("posts")
      .select(
        "id, title, description, image_url, published, like_count_base, created_at",
      )
      .eq("published", true)
      .order("created_at", { ascending: false }),
  ]);

  if (donationsResult.error) throw donationsResult.error;
  if (seedCommentsResult.error) throw seedCommentsResult.error;
  if (postsResult.error) throw postsResult.error;

  const donations = (donationsResult.data || [])
    .filter((donation) => {
      if (
        donation.visibility_scope !== "public" ||
        donation.payment_method !== "paypal"
      ) return false;
      const rawPayment =
        donation.raw_payment && typeof donation.raw_payment === "object"
          ? donation.raw_payment
          : {};
      return rawPayment.mode !== "test";
    })
    .slice(0, 50);
  const seedComments = (seedCommentsResult.data || []).filter(
    (comment: Record<string, any>) => {
      if (comment.source === "legacy") return true;
      const donation = Array.isArray(comment.donations)
        ? comment.donations[0]
        : comment.donations;
      if (!donation) return true;
      if (
        donation.visibility_scope !== "public" ||
        donation.payment_method !== "paypal"
      ) return false;
      const rawPayment =
        donation.raw_payment && typeof donation.raw_payment === "object"
          ? donation.raw_payment
          : {};
      return rawPayment.mode !== "test";
    },
  ).slice(0, 520);

  const posts = postsResult.data || [];
  const postIds = posts.map((post) => post.id);
  const [commentsResult, likesResult] = postIds.length
    ? await Promise.all([
      supabase
        .from("comments")
        .select("id, post_id, display_name, body, created_at")
        .in("post_id", postIds)
        .order("created_at", { ascending: true }),
      supabase
        .from("post_likes")
        .select("post_id, visitor_key_hash")
        .in("post_id", postIds),
    ])
    : [
      { data: [], error: null },
      { data: [], error: null },
    ];

  if (commentsResult.error) throw commentsResult.error;
  if (likesResult.error) throw likesResult.error;

  const likesByPost = new Map<string, { count: number; liked: boolean }>();
  for (const like of likesResult.data || []) {
    const entry = likesByPost.get(like.post_id) || {
      count: 0,
      liked: false,
    };
    entry.count += 1;
    entry.liked = entry.liked ||
      Boolean(visitorKeyHash && like.visitor_key_hash === visitorKeyHash);
    likesByPost.set(like.post_id, entry);
  }

  const commentsByPost = new Map<string, unknown[]>();
  for (const comment of commentsResult.data || []) {
    const list = commentsByPost.get(comment.post_id) || [];
    list.push({
      id: comment.id,
      name: comment.display_name,
      text: comment.body,
      createdAt: comment.created_at,
    });
    commentsByPost.set(comment.post_id, list);
  }

  return {
    donations: donations.map((donation) => ({
      id: donation.id,
      name: donation.display_name,
      amount: Number(donation.amount),
      frequency: donation.frequency,
      message: donation.supporter_message,
      createdAt: donation.created_at,
    })),
    seedComments: seedComments.map((comment) => ({
      id: comment.id,
      name: comment.display_name,
      text: comment.body,
      amount: comment.amount === null ? null : Number(comment.amount),
      seedCount: comment.seed_count,
      source: comment.source,
      createdAt: comment.created_at,
    })),
    posts: posts.map((post) => {
      const likeEntry = likesByPost.get(post.id) || {
        count: 0,
        liked: false,
      };
      return {
        id: post.id,
        title: post.title,
        description: post.description,
        imageUrl: post.image_url,
        createdAt: post.created_at,
        likes: Math.max(Number(post.like_count_base) || 0, 0) +
          likeEntry.count,
        liked: likeEntry.liked,
        comments: commentsByPost.get(post.id) || [],
      };
    }),
  };
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const url = new URL(request.url);
    const requestedMode = url.searchParams.get("mode");
    const mode = requestedMode === "critical" || requestedMode === "content"
      ? requestedMode
      : "full";
    const visitorKey = url.searchParams.get("visitorKey") || "";
    const path = sanitizePath(url.searchParams.get("path"));
    const supabase = getSupabaseAdmin();
    const criticalDataPromise = mode === "content"
      ? Promise.resolve(null)
      : loadCriticalData(supabase);

    if (mode === "critical") {
      return jsonResponse(await criticalDataPromise);
    }

    const visitorKeyHash = visitorKey ? await hashText(visitorKey) : "";
    const pageViewPromise = recordPageView(
      supabase,
      request,
      visitorKeyHash,
      path,
    ).catch((pageViewError) => {
      console.error("Could not record page view.", pageViewError);
    });
    const [criticalData, contentData] = await Promise.all([
      criticalDataPromise,
      loadPublicContent(supabase, visitorKeyHash),
      pageViewPromise,
    ]);

    return jsonResponse(
      mode === "content"
        ? contentData
        : { ...(criticalData || {}), ...contentData },
    );
  } catch (error) {
    return errorResponse("Could not load public data.", 500, String(error));
  }
});
