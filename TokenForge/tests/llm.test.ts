import { describe, expect, it } from "vitest";
import { chat, parseJsonLoose } from "../shared/llm";
import type { Env } from "../shared/types";
import { buildOptimizeSystem, buildOptimizeUser, PLAN_SYSTEM, buildPlanUser } from "../shared/prompts";

const env: Env = {}; // 키 없음 → mock

describe("llm mock mode", () => {
  it("mock optimize returns parseable JSON with optimized_prompt", async () => {
    const system = buildOptimizeSystem({ targetFamily: "claude" });
    const user = buildOptimizeUser({
      source: "파이썬 이동평균 함수를 만들어줘. 예외 처리도 해줘.",
      targetFamily: "claude",
    });
    const { text, mode } = await chat({ system, user, env, mode: "mock" });
    expect(mode).toBe("mock");
    const parsed = parseJsonLoose(text) as Record<string, unknown>;
    expect(parsed).not.toBeNull();
    expect(typeof parsed.optimized_prompt).toBe("string");
    expect(typeof parsed.summary_ko).toBe("string");
    expect(Array.isArray(parsed.changes)).toBe(true);
  });

  it("mock plan returns wholePromptEn and steps", async () => {
    const { text } = await chat({
      system: PLAN_SYSTEM,
      user: buildPlanUser({ goal: "정적 대시보드 + DeepSeek 연동 웹앱 만들기", planLang: "ko" }),
      env,
      mode: "mock",
    });
    const parsed = parseJsonLoose(text) as Record<string, unknown>;
    expect(parsed).not.toBeNull();
    expect(typeof parsed.wholePromptEn).toBe("string");
    expect(Array.isArray(parsed.steps)).toBe(true);
    expect((parsed.steps as unknown[]).length).toBeGreaterThan(0);
  });

  it("auto mode falls back to mock when no key", async () => {
    const { mode } = await chat({
      system: "system",
      user: "user",
      env,
      mode: "auto",
    });
    expect(mode).toBe("mock");
  });
});

describe("parseJsonLoose", () => {
  it("strips markdown fences", () => {
    expect(parseJsonLoose('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });
  it("extracts JSON embedded in prose", () => {
    expect(parseJsonLoose('here: {"a":1} trailing')).toEqual({ a: 1 });
  });
  it("returns null on garbage", () => {
    expect(parseJsonLoose("not json at all")).toBeNull();
  });
});
