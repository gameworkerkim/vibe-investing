/**
 * GET /api/playmalfoy/leaderboard — top player reviews.
 */
import { getLeaderboard } from "../../_lib/playmalfoy-store.js";
import { json } from "../../_lib/cache.js";

export async function onRequestGet() {
  return json({ list: await getLeaderboard() });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
    },
  });
}
