import { describe, expect, it } from "vitest";
import { heuristicCount, modelStats, analyzeForTargets } from "../frontend/lib/tokens.js";

const ENGLISH =
  "Implement a Python function that computes the moving average of a list, handles exceptions, and returns a clean result.";

describe("heuristic token counter", () => {
  it("counts English roughly at ~4 chars/token", () => {
    const t = heuristicCount(ENGLISH, "chatgpt");
    expect(t).toBeGreaterThan(20);
    expect(t).toBeLessThan(80);
  });

  it("Korean is more token-expensive per char than English", () => {
    const korean =
      "파이썬 함수를 만들어줘. 리스트의 이동평균을 계산하고 예외 처리도 해주고 깔끔한 결과를 반환해줘.";
    const ko = heuristicCount(korean, "chatgpt");
    const en = heuristicCount(ENGLISH, "chatgpt");
    expect(ko / [...korean.replace(/\s/g, "")].length).toBeGreaterThan(
      en / ENGLISH.replace(/\s/g, "").length
    );
  });

  it("Claude params are at least as conservative as chatgpt for CJK", () => {
    const korean = "안녕하세요 반갑습니다 열심히 하겠습니다 감사합니다";
    expect(heuristicCount(korean, "claude")).toBeGreaterThanOrEqual(
      heuristicCount(korean, "chatgpt")
    );
  });

  it("empty/short text never returns 0", () => {
    expect(heuristicCount("", "chatgpt")).toBe(1);
    expect(heuristicCount("a", "claude")).toBeGreaterThanOrEqual(1);
  });
});

describe("savings math", () => {
  it("modelStats reports savings for a compressed prompt", () => {
    const short = "Make a Python moving average function.";
    const st = modelStats(ENGLISH, short, "chatgpt");
    expect(st.before).toBeGreaterThan(st.after);
    expect(st.saved).toBe(st.before - st.after);
    expect(st.percent).toBeGreaterThan(0);
  });

  it("analyzeForTargets (no network) returns heuristic precise:false", async () => {
    const out = await analyzeForTargets(ENGLISH, "Short.", false);
    expect(out.claude.family).toBe("claude");
    expect(out.chatgpt.family).toBe("chatgpt");
    expect(out.chatgpt.precise).toBe(false);
    expect(out.chatgpt.before).toBeGreaterThan(0);
  });
});
