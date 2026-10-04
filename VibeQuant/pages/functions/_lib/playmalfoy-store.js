/**
 * PlayMalfoy counter + leaderboard store.
 * Zero-binding, best-effort persistence via Cloudflare Cache API + isolate memory.
 * For durable cross-datacenter storage, bind a D1 database named `PM_DB` and
 * replace the read/write helpers below with D1 queries.
 */

const ORIGIN = "https://playmalfoy.vibequant.internal";
const mem = new Map();

function req(name) {
  return new Request(`${ORIGIN}/${name}`);
}

async function read(name, fallback) {
  if (mem.has(name)) return mem.get(name);
  try {
    const hit = await caches.default.match(req(name));
    if (hit) {
      const data = await hit.json();
      mem.set(name, data);
      return data;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

async function write(name, data) {
  mem.set(name, data);
  try {
    await caches.default.put(
      req(name),
      new Response(JSON.stringify(data), {
        headers: { "content-type": "application/json" },
      })
    );
  } catch {
    /* ignore */
  }
}

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export async function recordPlay(uid) {
  const day = dayKey();

  const today = await read("today", { day, uids: [] });
  if (today.day !== day) {
    today.day = day;
    today.uids = [];
  }
  if (!today.uids.includes(uid)) today.uids.push(uid);
  await write("today", today);

  const total = await read("total", { uids: [] });
  if (!total.uids.includes(uid)) total.uids.push(uid);
  await write("total", total);

  return { today: today.uids.length, total: total.uids.length };
}

export async function getStats() {
  const day = dayKey();
  const today = await read("today", { day, uids: [] });
  const total = await read("total", { uids: [] });
  return {
    today: today.day === day ? today.uids.length : 0,
    total: total.uids.length,
  };
}

export async function addRating(entry) {
  const list = await read("ratings", []);
  list.push(entry);
  const trimmed = list.slice(-200);
  await write("ratings", trimmed);
  return trimmed.length;
}

export async function getLeaderboard() {
  const list = await read("ratings", []);
  return list
    .slice()
    .sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.at || 0) - (a.at || 0))
    .slice(0, 60);
}
