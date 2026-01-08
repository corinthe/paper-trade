/**
 * Options trading tools
 */

import { MCPTool, callAPI } from '../types.js';

export const optionsTools: MCPTool[] = [
  {
    name: 'get_option_chain',
    description: 'Get the full option chain for an underlying symbol',
    inputSchema: {
      type: 'object',
      properties: {
        underlying_symbol: {
          type: 'string',
          description: 'Underlying stock symbol',
        },
        expiration_date: {
          type: 'string',
          description: 'Expiration date filter (YYYY-MM-DD)',
        },
        strike_price_gte: {
          type: 'number',
          description: 'Minimum strike price',
        },
        strike_price_lte: {
          type: 'number',
          description: 'Maximum strike price',
        },
        type: {
          type: 'string',
          enum: ['call', 'put'],
          description: 'Option type filter',
        },
      },
      required: ['underlying_symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        underlying_symbol: args.underlying_symbol as string,
      };
      if (args.expiration_date) query.expiration_date = args.expiration_date as string;
      if (args.strike_price_gte) query.strike_price_gte = String(args.strike_price_gte);
      if (args.strike_price_lte) query.strike_price_lte = String(args.strike_price_lte);
      if (args.type) query.type = args.type as string;

      return callAPI(apiBaseUrl, '/api/options/chain', { query });
    },
  },

  {
    name: 'get_option_snapshot',
    description: 'Get a snapshot of an option contract (greeks, bid/ask, volume)',
    inputSchema: {
      type: 'object',
      properties: {
        option_symbol: {
          type: 'string',
          description: 'Option contract symbol (OCC format)',
        },
      },
      required: ['option_symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const { option_symbol } = args as { option_symbol: string };
      return callAPI(apiBaseUrl, '/api/options/snapshot', {
        query: { symbol: option_symbol },
      });
    },
  },

  {
    name: 'get_option_bars',
    description: 'Get historical price bars for an option contract',
    inputSchema: {
      type: 'object',
      properties: {
        option_symbol: {
          type: 'string',
          description: 'Option contract symbol (OCC format)',
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
      required: ['option_symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        symbol: args.option_symbol as string,
      };
      if (args.timeframe) query.timeframe = args.timeframe as string;
      if (args.start) query.start = args.start as string;
      if (args.end) query.end = args.end as string;
      if (args.limit) query.limit = String(args.limit);

      return callAPI(apiBaseUrl, '/api/options/bars', { query });
    },
  },

  {
    name: 'get_option_latest_trade',
    description: 'Get the latest trade for an option contract',
    inputSchema: {
      type: 'object',
      properties: {
        option_symbol: {
          type: 'string',
          description: 'Option contract symbol (OCC format)',
        },
      },
      required: ['option_symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const { option_symbol } = args as { option_symbol: string };
      return callAPI(apiBaseUrl, '/api/options/trade', {
        query: { symbol: option_symbol },
      });
    },
  },

  {
    name: 'get_option_latest_quote',
    description: 'Get the latest quote (bid/ask) for an option contract',
    inputSchema: {
      type: 'object',
      properties: {
        option_symbol: {
          type: 'string',
          description: 'Option contract symbol (OCC format)',
        },
      },
      required: ['option_symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const { option_symbol } = args as { option_symbol: string };
      return callAPI(apiBaseUrl, '/api/options/quote', {
        query: { symbol: option_symbol },
      });
    },
  },
];
