import { errorResponse, handleOptions, jsonResponse, readJson } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/supabase.ts";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90) || "post-image";
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  try {
    const { supabase } = await requireAdmin(request);

    if (request.method === "DELETE") {
      const body = await readJson<{ postId?: string }>(request);
      if (!body.postId) return errorResponse("postId is required.", 422);
      const { error } = await supabase.from("posts").delete().eq("id", body.postId);
      if (error) throw error;
      return jsonResponse({ deleted: true });
    }

    if (request.method !== "POST") {
      return errorResponse("Method not allowed.", 405);
    }

    const form = await request.formData();
    const title = String(form.get("title") || "").trim().slice(0, 120);
    const description = String(form.get("description") || "").trim().slice(0, 800);
    const file = form.get("image");

    if (!title || !description) {
      return errorResponse("Title and description are required.", 422);
    }

    let imagePath: string | null = null;
    let imageUrl = "assets/sow-cover.png";

    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_IMAGE_BYTES) {
        return errorResponse("Image must be 5 MB or smaller.", 422);
      }

      const extensionName = safeFileName(file.name);
      imagePath = `${crypto.randomUUID()}-${extensionName}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(imagePath, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("post-images").getPublicUrl(imagePath);
      imageUrl = data.publicUrl;
    }

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        title,
        description,
        image_path: imagePath,
        image_url: imageUrl,
        published: true,
      })
      .select("id, title, description, image_url, created_at")
      .single();

    if (error) throw error;

    return jsonResponse({
      post: {
        id: post.id,
        title: post.title,
        description: post.description,
        imageUrl: post.image_url,
        createdAt: post.created_at,
        likes: 0,
        liked: false,
        comments: [],
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse("Could not manage post.", 500, String(error));
  }
});
