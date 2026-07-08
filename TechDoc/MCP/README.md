# AMQS-AI-Infra MCP Server

vibe-investing repository: Adaptive Momentum Quant Strategy (AMQS) for AI Infra, MCP(Model Context Protocol) server implementation and documentation.

## Directory Contents

| File | Description |
|---|---|
| `Mcp server getting started.md` | MCP concept overview (Part 1) + hands-on server development (Part 2). Covers MCP architecture, 3 primitives (Tools/Resources/Prompts), and step-by-step implementation of the AMQS signal server. |
| `server.py` | Full MCP server implementation using `FastMCP` (Python). Exposes 4 tools (`get_regime`, `get_momentum_score`, `get_top_signals`, `check_stop_loss`), 1 resource (`amqs://universe`), and 1 prompt (`cross_validate_ticker`). Supports `AMQS_MOCK=1` for offline demo with synthetic data. |
| `requirements.txt` | Python dependencies: `mcp`, `yfinance`, `pandas`, `numpy`. |
| `claude_desktop_config.example.json` | Example configuration to connect this server to Claude Desktop via stdio transport. |
| `README.md` | This file. |
| `llms.txt` | Structured documentation index for LLM consumption (llmstxt.org format). |

## Quick Start

```bash
# 1. Set up Python virtual environment
python -m venv venv && source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run in mock mode (no network, no API keys)
AMQS_MOCK=1 python server.py

# 4. Run with real market data (requires internet)
python server.py
```

## Testing Pipeline

Three-stage verification as described in the getting started document:

1. **Unit test** -- call functions directly after import
2. **Protocol test** -- MCP client stdio handshake: `initialize` -> `list_tools` -> `call_tool`
3. **MCP Inspector** -- interactive browser UI:
   ```bash
   npx @modelcontextprotocol/inspector python server.py
   ```

## Claude Desktop Integration

Copy `claude_desktop_config.example.json` to your Claude Desktop config path, update the absolute path to `server.py`, and restart Claude Desktop.

| OS | Config Path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

## Key Design Decisions

- **Layered architecture**: Data layer (yfinance/cache) -> Strategy layer (pure functions) -> MCP layer (decorators). Strategy logic is decoupled from MCP for reusability and testability.
- **Domain rules enforced in code**: Subtheme cap (max 4 per theme) and stop-loss (-12%) are hard-coded, not left to LLM prompts.
- **Structured JSON returns**: All tool responses use `json.dumps` with `ensure_ascii=False` for Korean text preservation and LLM parsing stability.
- **Disclaimer at server level**: `FastMCP(instructions=...)` carries the research-only disclaimer so every interaction inherits it.

## References

- MCP Specification: https://modelcontextprotocol.io
- Python SDK: https://github.com/modelcontextprotocol/python-sdk
- MCP Inspector: https://github.com/modelcontextprotocol/inspector
- AMQS-AI-Infra Original Strategy: https://github.com/gameworkerkim/vibe-investing/tree/main/01.Trading%20Strategy/Adaptive%20Momentum%20Quant%20Strategy%20(AMQS)%20for%20AI%20Infra

## License

MIT -- "Built on AMQS by Dennis Kim, vibe-investing repository."

This code and documentation are for research and educational purposes only. AMQS is a high-risk quant strategy with potential for principal loss.
