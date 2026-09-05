import { describe, expect, it } from "vitest";
import { heuristicCount, modelStats } from "../frontend/lib/tokens.js";
import { buildMockOptimizedPrompt, mockOptimizeJson } from "../shared/mock";
import { parseJsonLoose } from "../shared/llm";

const VERBOSE_KO = `Claude Code로 정적 대시보드를 만들어줘. Cloudflare Pages 무료 티어만 쓰고,
DeepSeek API로 한국어 프롬프트를 영어로 최적화하는 기능이 필요해. UI는 한국어로,
토큰 절약 예상치를 Claude랑 ChatGPT 각각 보여줘. 가능하면 예쁘게 만들어주고
주석도 자세히 달아줘. 부탁드립니다. 예외 처리도 해주고 깔끔한 결과를 반환해줘.`;

describe("mock optimizer token savings", () => {
  it("strips Hangul from optimized English", () => {
    const out = buildMockOptimizedPrompt(VERBOSE_KO);
    expect(out).not.toMatch(/[가-힣]/);
    expect(out.toLowerCase()).toMatch(/caveman|verbatim|requirement|implement|make/);
    expect(out).not.toMatch(/^ROLE:/);
  });

  it("saves Claude tokens on a verbose Korean coding prompt", () => {
    const optimized = buildMockOptimizedPrompt(VERBOSE_KO);
    const st = modelStats(VERBOSE_KO, optimized, "claude");
    expect(st.before).toBeGreaterThan(st.after);
    expect(st.percent).toBeGreaterThanOrEqual(20);
  });

  it("saves ChatGPT tokens on the same Korean prompt", () => {
    const optimized = buildMockOptimizedPrompt(VERBOSE_KO);
    const st = modelStats(VERBOSE_KO, optimized, "chatgpt");
    expect(st.saved).toBeGreaterThan(0);
    expect(st.percent).toBeGreaterThanOrEqual(15);
  });

  it("CJK is more expensive per character than the English rewrite", () => {
    const optimized = buildMockOptimizedPrompt(VERBOSE_KO);
    const koPerChar = heuristicCount(VERBOSE_KO, "claude") / [...VERBOSE_KO].length;
    const enPerChar = heuristicCount(optimized, "claude") / [...optimized].length;
    expect(koPerChar).toBeGreaterThan(enPerChar);
  });

  it("mock JSON still satisfies the optimize contract", () => {
    const parsed = parseJsonLoose(mockOptimizeJson(VERBOSE_KO)) as Record<string, unknown>;
    expect(parsed.optimized_prompt).toBeTruthy();
    expect(Array.isArray(parsed.changes)).toBe(true);
  });
});
