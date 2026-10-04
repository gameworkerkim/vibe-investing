/**
 * POST /api/playmalfoy/play — record a play (unique player today / all-time).
 */
import { recordPlay } from "../../_lib/playmalfoy-store.js";
import { json } from "../../_lib/cache.js";

export async function onRequestPost(context) {
  let uid = "";
  try {
    const body = await context.request.json();
    uid = String(body?.uid || "").slice(0, 64);
  } catch {
    /* ignore */
  }
  if (!uid) uid = "anon-" + (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()));
  const stats = await recordPlay(uid);
  return json(stats);
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
