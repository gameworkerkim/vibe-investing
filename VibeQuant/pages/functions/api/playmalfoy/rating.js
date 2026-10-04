/**
 * POST /api/playmalfoy/rating — submit a player review (rating + optional comment).
 */
import { addRating } from "../../_lib/playmalfoy-store.js";
import { json } from "../../_lib/cache.js";

export async function onRequestPost(context) {
  let body = {};
  try {
    body = await context.request.json();
  } catch {
    /* ignore */
  }
  const rating = Math.max(1, Math.min(5, Number(body?.rating) || 0));
  if (!rating) return json({ error: "invalid rating" }, 400);
  const entry = {
    name: String(body?.name || "").slice(0, 30).trim() || "",
    comment: String(body?.comment || "").slice(0, 200).trim(),
    ending: String(body?.ending || "").slice(0, 32),
    rating,
    at: Date.now(),
  };
  const count = await addRating(entry);
  return json({ ok: true, count });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}
