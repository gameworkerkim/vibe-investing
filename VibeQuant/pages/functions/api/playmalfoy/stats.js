/**
 * GET /api/playmalfoy/stats — today play + total player counts.
 */
import { getStats } from "../../_lib/playmalfoy-store.js";
import { json } from "../../_lib/cache.js";

export async function onRequestGet() {
  return json(await getStats());
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
    },
  });
}
