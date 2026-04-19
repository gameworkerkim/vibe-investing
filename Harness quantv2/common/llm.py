"""
common/llm.py — Claude agentic loop

- Anthropic tool_use 방식으로 LLM이 자율적으로 도구를 호출
- 단일 분석용 (HarnessAgent) + 다중 에이전트 토론용 (MultiAgentDebate)
- 깊은 추론: claude-opus-4-7
- 빠른 분류/요약: claude-haiku-4-5-20251001
"""

import os
import json
from typing import List, Dict, Any, Optional, Callable

try:
    import anthropic
except ImportError:
    anthropic = None


DEEP_MODEL = "claude-opus-4-7"
QUICK_MODEL = "claude-haiku-4-5-20251001"


class HarnessAgent:
    """
    단일 LLM + 도구 호출 agentic loop.
    
    사용:
        agent = HarnessAgent(system="You are a stock analyst...",
                             tools=[get_price, get_sentiment],
                             model=DEEP_MODEL)
        result = agent.run("Analyze NVDA for earnings momentum.")
    """
    
    def __init__(
        self,
        system: str,
        tools: List[Dict[str, Any]],
        tool_dispatcher: Callable[[str, Dict], Any],
        model: str = DEEP_MODEL,
        max_turns: int = 15,
        max_tokens: int = 4096,
    ):
        if anthropic is None:
            raise RuntimeError("anthropic not installed. pip install anthropic")
        
        self.client = anthropic.Anthropic()
        self.system = system
        self.tools = tools
        self.tool_dispatcher = tool_dispatcher
        self.model = model
        self.max_turns = max_turns
        self.max_tokens = max_tokens
        self.trace: List[Dict] = []
    
    def run(self, user_prompt: str) -> Dict[str, Any]:
        """실행 → 최종 답변 + tool call trace."""
        messages = [{"role": "user", "content": user_prompt}]
        
        for turn in range(self.max_turns):
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=self.system,
                tools=self.tools,
                messages=messages,
            )
            
            # Tool use 없으면 종료
            if response.stop_reason != "tool_use":
                final_text = "".join(
                    block.text for block in response.content if hasattr(block, "text")
                )
                return {
                    "answer": final_text,
                    "trace": self.trace,
                    "turns_used": turn + 1,
                }
            
            # Tool 호출 처리
            assistant_message = {"role": "assistant", "content": response.content}
            messages.append(assistant_message)
            
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    try:
                        result = self.tool_dispatcher(block.name, block.input)
                        result_str = json.dumps(result, default=str) if not isinstance(result, str) else result
                    except Exception as e:
                        result_str = f"Error: {e}"
                    
                    self.trace.append({
                        "turn": turn,
                        "tool": block.name,
                        "input": block.input,
                        "output_preview": result_str[:500],
                    })
                    
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result_str,
                    })
            
            messages.append({"role": "user", "content": tool_results})
        
        return {"answer": "Max turns reached", "trace": self.trace, "turns_used": self.max_turns}


class MultiAgentDebate:
    """
    Bull / Bear / Risk / PM 네 에이전트 토론.
    
    각 에이전트는 독립된 system prompt로 구동되며,
    Bull과 Bear는 thesis를 작성, Risk는 downside scenario를 추가,
    PM은 모두를 종합해 conviction score (1-10)와 최종 결정을 내린다.
    """
    
    BULL_SYSTEM = """You are a BULL equity analyst. Your job is to build the strongest
possible case FOR buying this stock. Focus on:
- Revenue/EPS acceleration catalysts
- Market share gains
- Margin expansion trajectory
- Product cycle positioning
Write a concise 3-paragraph thesis. Be aggressive but factual.
Output JSON: {"thesis": "...", "conviction": 1-10, "key_catalysts": [...]}"""
    
    BEAR_SYSTEM = """You are a BEAR equity analyst. Your job is to build the strongest
possible case AGAINST buying this stock. Focus on:
- Valuation concerns
- Competitive threats
- Margin compression risks
- Execution risks
Write a concise 3-paragraph thesis. Be aggressive but factual.
Output JSON: {"thesis": "...", "conviction": 1-10, "key_risks": [...]}"""
    
    RISK_SYSTEM = """You are a RISK manager. Given a bull and bear thesis, your job is to
identify the specific scenario and triggers that would cause a -25%+ drawdown.
Be specific about what would need to happen.
Output JSON: {"downside_scenario": "...", "triggers": [...], "probability": 0.0-1.0}"""
    
    PM_SYSTEM = """You are a Portfolio Manager making a final decision. You have
received bull thesis, bear thesis, and risk scenario. Make a FINAL CALL:
- recommendation: STRONG_BUY / BUY / HOLD / SELL / STRONG_SELL
- conviction_score: 1-10 (how confident you are)
- target_price_12m: $ price
- stop_loss: $ price (if BUY)
- pm_verdict: 2-sentence explanation

Output JSON with all above fields."""
    
    def __init__(self, model: str = DEEP_MODEL):
        if anthropic is None:
            raise RuntimeError("anthropic not installed. pip install anthropic")
        self.client = anthropic.Anthropic()
        self.model = model
    
    def _call(self, system: str, user: str) -> str:
        resp = self.client.messages.create(
            model=self.model,
            max_tokens=1500,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return "".join(b.text for b in resp.content if hasattr(b, "text"))
    
    def _parse_json(self, text: str) -> Dict:
        """LLM 출력에서 JSON 블록 추출."""
        import re
        m = re.search(r"\{[\s\S]*\}", text)
        if m:
            try:
                return json.loads(m.group(0))
            except json.JSONDecodeError:
                pass
        return {"raw": text}
    
    def debate(self, ticker: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        context: {price, fundamentals, sentiment, analyst} 요약 dict
        """
        ctx_str = json.dumps(context, default=str, indent=2)
        base = f"Ticker: {ticker}\nContext:\n{ctx_str}"
        
        bull = self._call(self.BULL_SYSTEM, base)
        bull_j = self._parse_json(bull)
        
        bear = self._call(self.BEAR_SYSTEM, base)
        bear_j = self._parse_json(bear)
        
        risk_input = f"{base}\n\nBull: {bull_j.get('thesis', bull)}\n\nBear: {bear_j.get('thesis', bear)}"
        risk = self._call(self.RISK_SYSTEM, risk_input)
        risk_j = self._parse_json(risk)
        
        pm_input = f"{risk_input}\n\nRisk: {risk_j.get('downside_scenario', risk)}"
        pm = self._call(self.PM_SYSTEM, pm_input)
        pm_j = self._parse_json(pm)
        
        return {
            "ticker": ticker,
            "bull": bull_j,
            "bear": bear_j,
            "risk": risk_j,
            "pm": pm_j,
        }


if __name__ == "__main__":
    # 테스트 — ANTHROPIC_API_KEY 설정된 환경에서만 동작
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY not set — skip")
        exit()
    
    debate = MultiAgentDebate()
    result = debate.debate("NVDA", {
        "price": 142.50,
        "revenue_yoy": 0.94,
        "eps_surprise_pct": 0.12,
        "analyst_avg_target": 178.50,
        "news_sentiment": 0.62,
    })
    print(json.dumps(result, indent=2, default=str))
