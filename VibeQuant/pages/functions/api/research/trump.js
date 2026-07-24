/**
 * GET /api/research/trump
 * Trump-related news + Truth Social-ish feed — Cache API TTL 30m
 * No auth / no LLM required (optional DeepSeek if DEEPSEEK_API_KEY set)
 */
import { getCached, setCached, json } from "../../_lib/cache.js";

const CACHE_KEY = "trump:feed:v1";
const TTL = 30 * 60;

const RSS_SOURCES = [
  {
    id: "politico",
    name: "Politico",
    url: "https://rss.politico.com/politics-news.xml",
  },
  {
    id: "npr",
    name: "NPR Politics",
    url: "https://feeds.npr.org/1014/rss.xml",
  },
  {
    id: "thehill",
    name: "The Hill",
    url: "https://thehill.com/feed/",
  },
];

const TRUMP_KEYWORDS = [
  /trump/i,
  /maga/i,
  /white house/i,
  /president/i,
  /republican/i,
  /truth social/i,
];

function stripHtml(s) {
  return (s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRssItems(xml, source) {
  const items = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks.slice(0, 25)) {
    const title = stripHtml((block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
    const link = stripHtml(
      (block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] ||
        (block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i) || [])[1]
    );
    const desc = stripHtml(
      (block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1]
    );
    const pub =
      stripHtml((block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1]) ||
      null;
    if (!title) continue;
    const hay = `${title} ${desc}`;
    if (!TRUMP_KEYWORDS.some((re) => re.test(hay))) continue;
    items.push({
      id: `${source.id}:${link || title}`.slice(0, 200),
      title,
      url: link || null,
      summary: desc.slice(0, 280),
      publishedAt: pub ? new Date(pub).toISOString() : null,
      source: source.name,
      sourceId: source.id,
    });
  }
  return items;
}

async function fetchSource(source) {
  try {
    const res = await fetch(source.url, {
      headers: {
        "user-agent": "VibeQuantResearch/1.0 (+https://vibequant.cc)",
        accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseRssItems(xml, source);
  } catch {
    return [];
  }
}

export async function onRequestGet(context) {
  const { request } = context;
  const cached = await getCached(request, CACHE_KEY);
  if (cached && !cached.stale) {
    return json({
      ...cached.data,
      fromCache: true,
      cachedSecondsAgo: cached.age,
    });
  }

  try {
    const batches = await Promise.all(RSS_SOURCES.map(fetchSource));
    const seen = new Set();
    const items = batches
      .flat()
      .filter((it) => {
        const k = it.url || it.title;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .sort((a, b) => {
        const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        return tb - ta;
      })
      .slice(0, 40);

    const payload = {
      generatedAt: new Date().toISOString(),
      items,
      count: items.length,
      fromCache: false,
    };
    await setCached(CACHE_KEY, payload, TTL);
    return json(payload);
  } catch (e) {
    if (cached) {
      return json({ ...cached.data, fromCache: true, stale: true, error: e.message });
    }
    return json({ error: e.message || String(e) }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
    },
  });
}
