import { beforeEach, describe, expect, it } from "vitest";
import { createStore, type KvLike, type MemoryStore } from "../shared/storage";
import type { Env, MemoryEntry } from "../shared/types";
import { buildSkillMarkdown, memoryToContext } from "../shared/prompts";

function fakeKv(): KvLike {
  const map = new Map<string, string>();
  return {
    get: async (k) => map.get(k) ?? null,
    put: async (k, v) => void map.set(k, v),
    delete: async (k) => void map.delete(k),
    list: async (opts = {}) => {
      const prefix = opts.prefix ?? "";
      return { keys: [...map.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })) };
    },
  };
}

describe("createStore", () => {
  it("returns null when no storage configured", () => {
    expect(createStore({})).toBeNull();
  });
  it("returns kv store when TF_MEMORY present", () => {
    const env: Env = { TF_MEMORY: fakeKv() as unknown as KVNamespace };
    const store = createStore(env);
    expect(store).not.toBeNull();
    expect(store!.backend).toBe("kv");
  });
});

describe("KvMemoryStore", () => {
  let store: MemoryStore;
  beforeEach(() => {
    store = createStore({ TF_MEMORY: fakeKv() as unknown as KVNamespace })!;
  });

  it("saves and reads back a project entry", async () => {
    const saved = await store.save({ kind: "project", title: "테스트 프로젝트", tags: ["a"] });
    expect(saved.id).toBeTruthy();
    const got = await store.get(saved.id);
    expect(got?.title).toBe("테스트 프로젝트");
    expect(got?.kind).toBe("project");
  });

  it("upsert keeps createdAt, bumps updatedAt", async () => {
    const a = await store.save({ kind: "prompt", title: "A" });
    await new Promise((r) => setTimeout(r, 5));
    const b = await store.save({ id: a.id, kind: "prompt", title: "A2", content: "x" });
    expect(b.createdAt).toBe(a.createdAt);
    expect(b.title).toBe("A2");
    expect(b.content).toBe("x");
  });

  it("lists newest first and filters by q/kind", async () => {
    await store.save({ kind: "prompt", title: "파이썬 함수", content: "moving average" });
    await store.save({ kind: "project", title: "대시보드", content: "react dashboard" });
    const all = await store.list({});
    expect(all).toHaveLength(2);
    const projects = await store.list({ kind: "project" });
    expect(projects).toHaveLength(1);
    const q = await store.list({ q: "dashboard" });
    expect(q).toHaveLength(1);
    expect(q[0].title).toBe("대시보드");
  });

  it("deletes an entry", async () => {
    const a = await store.save({ kind: "prompt", title: "del" });
    await store.del(a.id);
    expect(await store.get(a.id)).toBeNull();
  });
});

describe("skill markdown + memory context", () => {
  it("buildSkillMarkdown bundles plan + steps", () => {
    const md = buildSkillMarkdown({
      title: "토큰 절약 대시보드",
      goal: "프롬프트를 영어로 최적화한다",
      wholePromptEn: "Plan the project...",
      steps: [
        { title: "계획", draftPrompt: "계획 세워줘", optimizedPrompt: "Create a plan." },
        { title: "구현", draftPrompt: "구현해줘" },
      ],
      tags: ["claude", "대시보드"],
    });
    expect(md).toContain("name:");
    expect(md).toContain("## Step 1: 계획");
    expect(md).toContain("<optimized-prompt>\nCreate a plan.");
    expect(md).toContain("## Overall Planning Prompt");
    expect(md).toContain("- tokenforge");
  });

  it("memoryToContext flattens plan + optimized prompt", () => {
    const ctx = memoryToContext({
      kind: "project",
      title: "P",
      plan: { wholePromptEn: "W", steps: [{ title: "s1", draftPrompt: "d" }] },
      optimizedText: "OPT",
    });
    expect(ctx).toContain("[project] P");
    expect(ctx).toContain("W");
    expect(ctx).toContain("s1");
    expect(ctx).toContain("OPT");
  });
});
