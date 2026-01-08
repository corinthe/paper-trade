/**
 * Vector search tools (semantic search over trading history)
 */

import { MCPTool, callAPI } from '../types.js';

export const vectorSearchTools: MCPTool[] = [
  {
    name: 'store_trade_embedding',
    description: 'Store a trade decision with vector embedding for future semantic search',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol',
        },
        action: {
          type: 'string',
          enum: ['buy', 'sell', 'hold'],
          description: 'Trading action',
        },
        strategy: {
          type: 'string',
          description: 'Strategy used',
        },
        reasoning: {
          type: 'string',
          description: 'Reasoning for the trade',
        },
        market_context: {
          type: 'string',
          description: 'Market conditions',
        },
        result_pct: {
          type: 'number',
          description: 'Result as percentage (if known)',
        },
        result_dollars: {
          type: 'number',
          description: 'Result in dollars (if known)',
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
    description: 'Search for similar past trades using semantic similarity',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language query describing the trade scenario',
        },
        symbol: {
          type: 'string',
          description: 'Filter by symbol (optional)',
        },
        action: {
          type: 'string',
          enum: ['buy', 'sell', 'hold'],
          description: 'Filter by action (optional)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 10)',
        },
        min_similarity: {
          type: 'number',
          description: 'Minimum similarity score (0-1, default: 0.7)',
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
