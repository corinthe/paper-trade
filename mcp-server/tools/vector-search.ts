/**
 * Vector search tools (semantic search over trading history)
 */

import { MCPTool, callAPI } from '../types.js';

export const vectorSearchTools: MCPTool[] = [
  {
    name: 'store_trade_embedding',
    description: 'Store a trade decision with vector embedding for future semantic search. Use this after making trading decisions to build a searchable memory of past trades.',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., AAPL, TSLA)',
        },
        action: {
          type: 'string',
          enum: ['BUY', 'SELL', 'HOLD', 'CLOSE', 'ADJUST'],
          description: 'Trading action taken',
        },
        strategy: {
          type: 'string',
          description: 'Strategy used (e.g., momentum, breakout, mean_reversion)',
        },
        reasoning: {
          type: 'string',
          description: 'Detailed reasoning for the trade decision',
        },
        market_context: {
          type: 'string',
          description: 'Current market conditions and context',
        },
        confidence: {
          type: 'number',
          description: 'Confidence level (0-1)',
        },
        entry_price: {
          type: 'number',
          description: 'Entry price for the trade',
        },
        qty: {
          type: 'number',
          description: 'Quantity of shares',
        },
        stop_loss: {
          type: 'number',
          description: 'Stop loss price',
        },
        take_profit: {
          type: 'number',
          description: 'Take profit price',
        },
        result_pct: {
          type: 'number',
          description: 'Result as percentage (if trade is closed)',
        },
        result_dollars: {
          type: 'number',
          description: 'Result in dollars (if trade is closed)',
        },
      },
      required: ['symbol', 'action', 'reasoning'],
    },
    handler: async (args, apiBaseUrl) => {
      return callAPI(apiBaseUrl, '/api/vector/store', {
        method: 'POST',
        body: args,
      });
    },
  },

  {
    name: 'search_similar_trades',
    description: 'Search for similar past trades using semantic similarity. Use this to find historical trades with similar reasoning, market conditions, or strategies to inform current decisions.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language query describing the trade scenario (e.g., "momentum breakout on tech stock after earnings beat")',
        },
        symbol: {
          type: 'string',
          description: 'Filter by symbol (optional)',
        },
        action: {
          type: 'string',
          enum: ['BUY', 'SELL', 'HOLD', 'CLOSE', 'ADJUST'],
          description: 'Filter by action (optional)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 10)',
        },
        min_similarity: {
          type: 'number',
          description: 'Minimum similarity score (0-1, default: 0.5)',
        },
      },
      required: ['query'],
    },
    handler: async (args, apiBaseUrl) => {
      return callAPI(apiBaseUrl, '/api/vector/search', {
        method: 'POST',
        body: args,
      });
    },
  },

  {
    name: 'get_trade_stats',
    description: 'Get statistics on past trades from vector database',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Filter by symbol (optional)',
        },
        strategy: {
          type: 'string',
          description: 'Filter by strategy (optional)',
        },
        start_date: {
          type: 'string',
          description: 'Start date (YYYY-MM-DD)',
        },
        end_date: {
          type: 'string',
          description: 'End date (YYYY-MM-DD)',
        },
      },
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {};
      if (args.symbol) query.symbol = args.symbol as string;
      if (args.strategy) query.strategy = args.strategy as string;
      if (args.start_date) query.start_date = args.start_date as string;
      if (args.end_date) query.end_date = args.end_date as string;

      return callAPI(apiBaseUrl, '/api/vector/stats', { query });
    },
  },
];
