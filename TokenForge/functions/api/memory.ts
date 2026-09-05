import { jsonResponse, badRequest } from "../../shared/http";
import type { Env, MemoryEntry, MemoryKind } from "../../shared/types";
import { createStore } from "../../shared/storage";

interface SaveBody extends Partial<MemoryEntry> {}

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const store = createStore(ctx.env);
  if (!store) return jsonResponse({ ok: true, backend: "none", items: [] });

  const url = new URL(ctx.request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const entry = await store.get(id);
    if (!entry) return jsonResponse({ ok: true, item: null }, 404);
    return jsonResponse({ ok: true, item: entry });
  }
  const kind = url.searchParams.get("kind") || undefined;
  const q = url.searchParams.get("q") || undefined;
  const limit = Number(url.searchParams.get("limit") ?? 100);
  const items = await store.list({ q, kind, limit: Number.isFinite(limit) ? limit : 100 });
  return jsonResponse({ ok: true, backend: store.backend, items });
};

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const store = createStore(ctx.env);
  if (!store)
    return jsonResponse({ ok: false, error: "storage_not_configured", backend: "none" }, 503);

  let body: SaveBody;
  try {
    body = (await ctx.request.json()) as SaveBody;
  } catch {
    return badRequest("JSON body required");
  }
  const kind: MemoryKind | undefined = body.kind;
  if (kind && !["project", "prompt", "wiki", "skill"].includes(kind)) {
    return badRequest(`unknown kind: ${kind}`);
  }
  const title = (body.title ?? "").trim();
  if (!title) return badRequest("title is required");
  const saved = await store.save({ ...body, kind: kind ?? "project", title });
  return jsonResponse({ ok: true, item: saved });
};

export const onRequestDelete: PagesFunction<Env> = async (ctx) => {
  const store = createStore(ctx.env);
  if (!store)
    return jsonResponse({ ok: false, error: "storage_not_configured", backend: "none" }, 503);
  const url = new URL(ctx.request.url);
  const id = url.searchParams.get("id");
  if (!id) return badRequest("id query param required");
  await store.del(id);
  return jsonResponse({ ok: true, deleted: id });
};
