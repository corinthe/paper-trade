# Prophet Trader MCP Server

Model Context Protocol (MCP) server exposing 50+ trading tools for Claude Code integration.

## Overview

This MCP server provides comprehensive access to the Prophet Trader system, allowing Claude Code to:
- Execute stock and options trades
- Analyze market data and technical indicators
- Aggregate and summarize news
- Manage automated positions with stop-loss/take-profit
- Search past trading decisions using vector similarity
- Log activities and decisions

## Tools Categories

### Trading Operations (11 tools)
- `get_account` - Account info
- `get_positions` / `get_position` - View positions
- `place_order` - Place stock orders
- `cancel_order` / `get_orders` / `get_order` - Manage orders
- `close_position` / `close_all_positions` - Close positions
- `is_market_open` - Check market status

### Market Data (7 tools)
- `get_latest_quote` / `get_latest_bar` - Real-time data
- `get_historical_bars` - Historical prices
- `get_snapshot` / `get_snapshots` - Market snapshots
- `get_latest_trades` / `get_multi_bars` - Multi-symbol data

### Options Trading (5 tools)
- `get_option_chain` - Option chain data
- `get_option_snapshot` - Option contract snapshot
- `get_option_bars` - Historical option prices
- `get_option_latest_trade` / `get_option_latest_quote` - Option quotes

### Position Management (5 tools)
- `create_managed_position` - Auto stop-loss/take-profit
- `get_managed_positions` / `get_managed_position` - View managed positions
- `update_managed_position` - Update parameters
- `close_managed_position` - Close position

### News (6 tools)
- `search_google_news` - Search Google News
- `get_marketwatch_top_stories` - MarketWatch top stories
- `get_marketwatch_realtime` - Real-time headlines
- `get_marketwatch_bulletins` - Breaking bulletins
- `get_marketwatch_market_pulse` - Quick market overview
- `get_cleaned_news` - AI-cleaned news

### Intelligence (3 tools)
- `get_quick_market_intelligence` - Quick market overview
- `analyze_stocks` - Comprehensive stock analysis
- `aggregate_and_summarize_news` - Multi-source news aggregation

### Technical Analysis (7 tools)
- `calculate_rsi` - Relative Strength Index
- `calculate_sma` / `calculate_ema` - Moving averages
- `calculate_macd` - MACD indicator
- `calculate_bollinger_bands` - Bollinger Bands
- `find_support_resistance` - S/R levels
- `detect_trend` - Trend detection

### Activity Logging (3 tools)
- `log_activity` - Log general activities
- `log_decision` - Log trading decisions
- `get_activity_log` - Retrieve logs

### Vector Search (3 tools)
- `store_trade_embedding` - Store trade with embedding
- `search_similar_trades` - Semantic search
- `get_trade_stats` - Trade statistics

## Setup

### 1. Build the MCP Server

```bash
npm install
npm run build
```

### 2. Configure Claude Code

Add to your Claude Code MCP settings:

**Production (Recommended)** - Uses Vercel deployment, no local backend needed:

```json
{
  "mcpServers": {
    "prophet-trader": {
      "command": "node",
      "args": ["/absolute/path/to/paper-trade/mcp-server/dist/index.js"],
      "env": {
        "API_BASE_URL": "https://paper-trade-iota.vercel.app"
      }
    }
  }
}
```

**Local Development** - For testing changes:

```json
{
  "mcpServers": {
    "prophet-trader": {
      "command": "node",
      "args": ["/absolute/path/to/paper-trade/mcp-server/dist/index.js"],
      "env": {
        "API_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
```

If using local development, start the Next.js backend first:
```bash
cd ../prophet-trader-nextjs
npm run dev
```

### 4. Use with Claude Code

The tools are now available in Claude Code! Try:

```
Hey Claude, use the prophet-trader MCP server to:
- Get my account balance
- Analyze AAPL stock
- Get quick market intelligence
```

## Environment Variables

- `API_BASE_URL` - Base URL of the Next.js backend
  - **Production (default)**: `https://paper-trade-iota.vercel.app`
  - **Local development**: `http://localhost:3000`

## Development

### Watch mode
```bash
npm run watch
```

### Testing
```bash
# Start the MCP server manually
npm run dev

# Or use the MCP inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

## Architecture

```
┌─────────────────┐
│  Claude Code    │
└────────┬────────┘
         │ MCP Protocol (stdio)
         ↓
┌─────────────────┐
│  MCP Server     │  ← 50+ tools
│  (This server)  │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│  Next.js API    │  ← Trading backend
│  (Vercel/Local) │  ← paper-trade-iota.vercel.app
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Alpaca/Claude   │  ← External services
└─────────────────┘
```

## Error Handling

All tools return errors in a consistent format:

```json
{
  "error": "Error message",
  "tool": "tool_name"
}
```

## Security

⚠️ **WARNING**: This is for paper trading only!

- Never use with real money
- API credentials should be paper trading only
- The MCP server has full access to your trading account
- Always verify trades before execution

## License

MIT
