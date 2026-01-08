/**
 * Market data tools
 */

import { MCPTool, callAPI } from '../types.js';

export const marketDataTools: MCPTool[] = [
  {
    name: 'get_latest_quote',
    description: 'Get the latest quote (bid/ask) for a symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol',
        },
      },
      required: ['symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const { symbol } = args as { symbol: string };
      return callAPI(apiBaseUrl, '/api/market/quote', {
        query: { symbol },
      });
    },
  },

  {
    name: 'get_latest_bar',
    description: 'Get the latest price bar (OHLCV) for a symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol',
        },
      },
      required: ['symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const { symbol } = args as { symbol: string };
      return callAPI(apiBaseUrl, '/api/market/bar', {
        query: { symbol },
      });
    },
  },

  {
    name: 'get_historical_bars',
    description: 'Get historical price bars for a symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol',
        },
        timeframe: {
          type: 'string',
          enum: ['1Min', '5Min', '15Min', '1Hour', '1Day'],
          description: 'Bar timeframe (default: 1Day)',
        },
        start: {
          type: 'string',
          description: 'Start date (RFC3339 format)',
        },
        end: {
          type: 'string',
          description: 'End date (RFC3339 format)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of bars (default: 100)',
        },
      },
      required: ['symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        symbol: args.symbol as string,
      };
      if (args.timeframe) query.timeframe = args.timeframe as string;
      if (args.start) query.start = args.start as string;
      if (args.end) query.end = args.end as string;
      if (args.limit) query.limit = String(args.limit);

      return callAPI(apiBaseUrl, '/api/market/bars', { query });
    },
  },

  {
    name: 'get_snapshot',
    description: 'Get a complete market snapshot for a symbol (latest quote, bar, trades)',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol',
        },
      },
      required: ['symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const { symbol } = args as { symbol: string };
      return callAPI(apiBaseUrl, '/api/market/snapshot', {
        query: { symbol },
      });
    },
  },

  {
    name: 'get_snapshots',
    description: 'Get market snapshots for multiple symbols at once',
    inputSchema: {
      type: 'object',
      properties: {
        symbols: {
          type: 'string',
          description: 'Comma-separated list of stock symbols',
        },
      },
      required: ['symbols'],
    },
    handler: async (args, apiBaseUrl) => {
      const { symbols } = args as { symbols: string };
      return callAPI(apiBaseUrl, '/api/market/snapshots', {
        query: { symbols },
      });
    },
  },

  {
    name: 'get_latest_trades',
    description: 'Get the latest trades for one or more symbols',
    inputSchema: {
      type: 'object',
      properties: {
        symbols: {
          type: 'string',
          description: 'Comma-separated list of stock symbols',
        },
      },
      required: ['symbols'],
    },
    handler: async (args, apiBaseUrl) => {
      const { symbols } = args as { symbols: string };
      return callAPI(apiBaseUrl, '/api/market/trades', {
        query: { symbols },
      });
    },
  },

  {
    name: 'get_multi_bars',
    description: 'Get latest bars for multiple symbols at once',
    inputSchema: {
      type: 'object',
      properties: {
        symbols: {
          type: 'string',
          description: 'Comma-separated list of stock symbols',
        },
        timeframe: {
          type: 'string',
          enum: ['1Min', '5Min', '15Min', '1Hour', '1Day'],
          description: 'Bar timeframe (default: 1Day)',
        },
      },
      required: ['symbols'],
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        symbols: args.symbols as string,
      };
      if (args.timeframe) query.timeframe = args.timeframe as string;

      return callAPI(apiBaseUrl, '/api/market/multi-bars', { query });
    },
  },
];
