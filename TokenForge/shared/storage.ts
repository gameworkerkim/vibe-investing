/** 기억(Memory) 저장소 — KV(기본) / Upstash Redis(REST, 옵션). Neon 은 Phase 2 예정. */

import type { Env, MemoryEntry } from "./types";

/** Cloudflare KV 와 호환되는 최소 인터페이스(테스트에서 인메모리로 대체 가능). */
export interface KvLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number }): Promise<{ keys: { name: string }[] }>;
}

const PREFIX = "mem:";

function newId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface MemoryStore {
  readonly backend: string;
  save(entry: Partial<MemoryEntry>): Promise<MemoryEntry>;
  get(id: string): Promise<MemoryEntry | null>;
  list(opts?: { q?: string; kind?: string; limit?: number }): Promise<MemoryEntry[]>;
  del(id: string): Promise<void>;
}

class KvMemoryStore implements MemoryStore {
  backend = "kv";
  constructor(private client: KvLike) {}

  async save(partial: Partial<MemoryEntry>): Promise<MemoryEntry> {
    const now = new Date().toISOString();
    const existing = partial.id ? await this.get(partial.id) : null;
    const entry: MemoryEntry = {
      id: existing?.id ?? partial.id ?? newId(),
      kind: partial.kind ?? existing?.kind ?? "project",
      title: partial.title ?? existing?.title ?? "무제",
      tags: partial.tags ?? existing?.tags ?? [],
      content: partial.content ?? existing?.content ?? "",
      plan: partial.plan !== undefined ? partial.plan : existing?.plan ?? null,
      sourceText: partial.sourceText !== undefined ? partial.sourceText : existing?.sourceText ?? null,
      optimizedText:
        partial.optimizedText !== undefined
          ? partial.optimizedText
          : existing?.optimizedText ?? null,
      targetFamily:
        partial.targetFamily !== undefined ? partial.targetFamily : existing?.targetFamily ?? null,
      stats: partial.stats !== undefined ? partial.stats : existing?.stats ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await this.client.put(PREFIX + entry.id, JSON.stringify(entry));
    return entry;
  }

  async get(id: string): Promise<MemoryEntry | null> {
    const raw = await this.client.get(PREFIX + id);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as MemoryEntry;
    } catch {
      return null;
    }
  }

  async list(opts: { q?: string; kind?: string; limit?: number } = {}): Promise<MemoryEntry[]> {
    const limit = opts.limit ?? 100;
    const res = await this.client.list({ prefix: PREFIX, limit: Math.min(1000, limit * 3) });
    const out: MemoryEntry[] = [];
    for (const k of res.keys) {
      const e = await this.get(k.name.slice(PREFIX.length));
      if (e) out.push(e);
    }
    return filterAndSort(out, opts, limit);
  }

  async del(id: string): Promise<void> {
    await this.client.delete(PREFIX + id);
  }
}

/** Upstash Redis(REST) 어댑터 — list 가 없어 인덱스 키로 id 목록 유지. */
class UpstashMemoryStore implements MemoryStore {
  backend = "upstash";
  private indexKey = "tf:index";
  constructor(private base: string, private token: string) {}

  private async raw(method: "GET" | "POST" | "DELETE", path: string, body?: string) {
    const r = await fetch(`${this.base}${path}`, {
      method,
      headers: { authorization: `Bearer ${this.token}` },
      body: body ?? undefined,
    });
    if (!r.ok) throw new Error(`upstash ${method} ${path} -> ${r.status}`);
    const t = await r.text();
    return t === "" ? null : t;
  }

  private async getValue(key: string): Promise<MemoryEntry | null> {
    const v = await this.raw("GET", `/get/${key}`);
    if (!v || v === "nil") return null;
    try {
      return JSON.parse(v) as MemoryEntry;
    } catch {
      return null;
    }
  }

  private async index(): Promise<string[]> {
    const v = await this.raw("GET", `/get/${this.indexKey}`);
    if (!v || v === "nil") return [];
    try {
      return JSON.parse(v) as string[];
    } catch {
      return [];
    }
  }

  async save(partial: Partial<MemoryEntry>): Promise<MemoryEntry> {
    const now = new Date().toISOString();
    const existing = partial.id ? await this.getValue(partial.id) : null;
    const entry: MemoryEntry = {
      id: existing?.id ?? partial.id ?? newId(),
      kind: partial.kind ?? existing?.kind ?? "project",
      title: partial.title ?? existing?.title ?? "무제",
      tags: partial.tags ?? existing?.tags ?? [],
      content: partial.content ?? existing?.content ?? "",
      plan: partial.plan !== undefined ? partial.plan : existing?.plan ?? null,
      sourceText: partial.sourceText !== undefined ? partial.sourceText : existing?.sourceText ?? null,
      optimizedText:
        partial.optimizedText !== undefined
          ? partial.optimizedText
          : existing?.optimizedText ?? null,
      targetFamily:
        partial.targetFamily !== undefined ? partial.targetFamily : existing?.targetFamily ?? null,
      stats: partial.stats !== undefined ? partial.stats : existing?.stats ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    const key = entry.id;
    await this.raw("POST", `/set/${key}`, JSON.stringify(entry));
    if (!existing) {
      const idx = await this.index();
      if (!idx.includes(key)) await this.raw("POST", `/set/${this.indexKey}`, JSON.stringify([...idx, key]));
    }
    return entry;
  }

  async get(id: string): Promise<MemoryEntry | null> {
    return this.getValue(id);
  }

  async list(opts: { q?: string; kind?: string; limit?: number } = {}): Promise<MemoryEntry[]> {
    const ids = await this.index();
    const out: MemoryEntry[] = [];
    for (const id of ids.slice(-300)) {
      const e = await this.getValue(id);
      if (e) out.push(e);
    }
    return filterAndSort(out, opts, opts.limit ?? 100);
  }

  async del(id: string): Promise<void> {
    await this.raw("DELETE", `/del/${id}`);
    const idx = await this.index();
    const next = idx.filter((x) => x !== id);
    await this.raw("POST", `/set/${this.indexKey}`, JSON.stringify(next));
  }
}

function filterAndSort(
  entries: MemoryEntry[],
  opts: { q?: string; kind?: string; limit?: number },
  limit: number
): MemoryEntry[] {
  const q = opts.q?.trim().toLowerCase();
  let out = entries.filter((e) => {
    if (opts.kind && e.kind !== opts.kind) return false;
    if (q) {
      const hay = `${e.title} ${e.tags.join(" ")} ${e.content} ${e.optimizedText ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  out.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  return out.slice(0, limit);
}

/** 환경에서 스토어 생성. 모두 없으면 null → 함수는 저장소 미구성 응답. */
export function createStore(env: Env): MemoryStore | null {
  const upUrl = env.UPSTASH_REDIS_REST_URL?.trim();
  const upTok = env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (upUrl && upTok) {
    return new UpstashMemoryStore(upUrl.replace(/\/+$/, ""), upTok);
  }
  if (env.NEON_DATABASE_URL?.trim()) {
    // Phase 2: Neon Postgres 어댑터 예정. 지금은 KV 폴백.
    // (없으면 null 이지만 KV 가 우선이므로 여기 도달하면 KV 가 없다는 뜻 → 폴백 주석)
  }
  if (env.TF_MEMORY) return new KvMemoryStore(env.TF_MEMORY);
  return null;
}
