# MCP Server Setup Guide

This guide explains how to set up and use the Prophet Trader MCP server with Claude Code.

## What is MCP?

Model Context Protocol (MCP) is a protocol that allows AI assistants like Claude to interact with external tools and services. The Prophet Trader MCP server exposes 50+ trading tools that Claude Code can use to:

- Execute trades
- Analyze stocks
- Get market data
- Manage positions
- Search trading history
- And much more!

## Prerequisites

**Build the MCP Server**
```bash
cd mcp-server
npm install
npm run build
```

That's it! The MCP server will connect to the production API on Vercel by default.

## Configuration

The MCP server can connect to either:
- ✅ **Production (Recommended)**: `https://paper-trade-iota.vercel.app` - No local setup needed!
- 🔧 **Local Development**: `http://localhost:3000` - For testing changes to the API

### Option 1: Production API (Recommended)

This is the **easiest option** - just point to the Vercel deployment!

#### For Claude Code Desktop

Add to your Claude Code MCP settings file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**Linux**: `~/.config/claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "prophet-trader": {
      "command": "node",
      "args": [
        "/absolute/path/to/paper-trade/mcp-server/dist/index.js"
      ],
      "env": {
        "API_BASE_URL": "https://paper-trade-iota.vercel.app"
      }
    }
  }
}
```

⚠️ **Important**: Replace `/absolute/path/to/paper-trade` with your actual project path!

#### For Claude Code CLI

If using the CLI version, add to `~/.config/claude-code/mcp.json`:

```json
{
  "mcpServers": {
    "prophet-trader": {
      "command": "node",
      "args": [
        "/absolute/path/to/paper-trade/mcp-server/dist/index.js"
      ],
      "env": {
        "API_BASE_URL": "https://paper-trade-iota.vercel.app"
      }
    }
  }
}
```

### Option 2: Local Development

Only use this if you're developing/testing changes to the Next.js API locally.

**Additional Prerequisites:**
```bash
cd prophet-trader-nextjs
npm run dev
```
The backend must be running on `http://localhost:3000`

Then use `http://localhost:3000` as the `API_BASE_URL` in your MCP configuration instead of the Vercel URL.

## Testing the Connection

### Method 1: MCP Inspector (Recommended)

```bash
cd mcp-server
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a web interface where you can:
- See all 50+ available tools
- Test individual tools
- Debug responses

### Method 2: Use with Claude Code

1. Restart Claude Code after adding the configuration
2. Start a conversation
3. Ask Claude to use the prophet-trader tools:

```
Hey Claude, can you use the prophet-trader MCP server to:
1. Get my account balance
2. Check if the market is open
3. Get quick market intelligence
```

Claude will automatically discover and use the available tools!

## Available Tools (50+)

### Trading (11 tools)
- Account management
- Position tracking
- Order execution
- Market status

### Market Data (7 tools)
- Real-time quotes
- Historical data
- Snapshots
- Multi-symbol queries

### Options (5 tools)
- Option chains
- Greeks
- Option quotes

### Position Management (5 tools)
- Automated stop-loss/take-profit
- Position monitoring
- Parameter updates

### News (6 tools)
- Google News search
- MarketWatch feeds
- AI-cleaned summaries

### Intelligence (3 tools)
- Stock analysis
- Market overview
- News aggregation

### Technical Analysis (7 tools)
- RSI, SMA, EMA, MACD
- Bollinger Bands
- Support/Resistance
- Trend detection

### Activity Logging (3 tools)
- Activity logs
- Decision tracking
- Log retrieval

### Vector Search (3 tools)
- Semantic search
- Trade history
- Performance stats

## Example Usage

```typescript
// Claude can now do things like:

// 1. Get account info
await get_account()

// 2. Analyze a stock
await analyze_stocks({ symbols: "AAPL,TSLA" })

// 3. Place an order
await place_order({
  symbol: "AAPL",
  qty: 10,
  side: "buy",
  type: "market"
})

// 4. Create managed position with auto stop-loss
await create_managed_position({
  symbol: "TSLA",
  qty: 5,
  side: "buy",
  stop_loss_pct: 0.05,  // 5% stop loss
  take_profit_pct: 0.10  // 10% take profit
})

// 5. Get market intelligence
await get_quick_market_intelligence()
```

## Troubleshooting

### Server won't start
- Make sure TypeScript compilation succeeded: `cd mcp-server && npm run build`
- Check that the path in config is absolute, not relative
- Verify node is in your PATH

### Tools not appearing in Claude
- Restart Claude Code after config changes
- Check the MCP server logs for errors
- Verify the config JSON is valid (use a JSON validator)

### API errors
- Ensure Next.js backend is running on port 3000
- Check `.env.local` has valid Alpaca credentials
- Verify `API_BASE_URL` in MCP config is correct

### Permission denied
- Make sure the compiled JS file is executable
- On Unix: `chmod +x mcp-server/dist/index.js`

## Development

### Watch mode (auto-rebuild on changes)
```bash
cd mcp-server
npm run watch
```

### Testing individual tools
```bash
cd mcp-server
npx @modelcontextprotocol/inspector node dist/index.js
```

Then test tools in the web interface.

### Adding new tools

1. Add tool definition to appropriate file in `mcp-server/tools/`
2. Rebuild: `cd mcp-server && npm run build`
3. Restart Claude Code

## Security Notes

⚠️ **IMPORTANT WARNINGS**:

1. **Paper Trading Only** - This server has full access to your Alpaca account. Use ONLY with paper trading credentials.

2. **Local Only** - The MCP server connects to localhost. Never expose it to the internet.

3. **Credentials** - Never commit API keys. Keep them in `.env.local` only.

4. **Verify Trades** - Always verify trades before execution, especially when using AI.

## Architecture

```
┌──────────────┐
│ Claude Code  │
└──────┬───────┘
       │ stdio (MCP Protocol)
       ↓
┌──────────────┐
│  MCP Server  │ ← This component
│  50+ Tools   │
└──────┬───────┘
       │ HTTP REST
       ↓
┌──────────────┐
│  Next.js API │ ← localhost:3000
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Alpaca API   │
│ Claude API   │
└──────────────┘
```

## Next Steps

### Using Production API (Recommended)

1. ✅ Build the MCP server (`cd mcp-server && npm install && npm run build`)
2. ✅ Add config to Claude Code (use Vercel URL: `https://paper-trade-iota.vercel.app`)
3. ✅ Restart Claude Code
4. ✅ Ask Claude to use the tools!

**No local backend needed!** 🎉

### Using Local Development

1. ✅ Build the MCP server (`cd mcp-server && npm install && npm run build`)
2. ✅ Start Next.js backend (`cd prophet-trader-nextjs && npm run dev`)
3. ✅ Add config to Claude Code (use localhost URL)
4. ✅ Restart Claude Code
5. ✅ Ask Claude to use the tools!

Happy trading! 🚀📈
