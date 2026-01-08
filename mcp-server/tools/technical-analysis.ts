/**
 * Technical analysis tools
 */

import { MCPTool, callAPI } from '../types.js';

export const technicalAnalysisTools: MCPTool[] = [
  {
    name: 'calculate_rsi',
    description: 'Calculate Relative Strength Index (RSI) for a symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol',
        },
        period: {
          type: 'number',
          description: 'RSI period (default: 14)',
        },
        timeframe: {
          type: 'string',
          enum: ['1Min', '5Min', '15Min', '1Hour', '1Day'],
          description: 'Bar timeframe (default: 1Day)',
        },
      },
      required: ['symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        symbol: args.symbol as string,
        indicator: 'rsi',
      };
      if (args.period) query.period = String(args.period);
      if (args.timeframe) query.timeframe = args.timeframe as string;

      return callAPI(apiBaseUrl, '/api/analysis/technical', { query });
    },
  },

  {
    name: 'calculate_sma',
    description: 'Calculate Simple Moving Average (SMA) for a symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol',
        },
        period: {
          type: 'number',
          description: 'SMA period (default: 20)',
        },
        timeframe: {
          type: 'string',
          enum: ['1Min', '5Min', '15Min', '1Hour', '1Day'],
          description: 'Bar timeframe (default: 1Day)',
        },
      },
      required: ['symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        symbol: args.symbol as string,
        indicator: 'sma',
      };
      if (args.period) query.period = String(args.period);
      if (args.timeframe) query.timeframe = args.timeframe as string;

      return callAPI(apiBaseUrl, '/api/analysis/technical', { query });
    },
  },

  {
    name: 'calculate_ema',
    description: 'Calculate Exponential Moving Average (EMA) for a symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol',
        },
        period: {
          type: 'number',
          description: 'EMA period (default: 12)',
        },
        timeframe: {
          type: 'string',
          enum: ['1Min', '5Min', '15Min', '1Hour', '1Day'],
          description: 'Bar timeframe (default: 1Day)',
        },
      },
      required: ['symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        symbol: args.symbol as string,
        indicator: 'ema',
      };
      if (args.period) query.period = String(args.period);
      if (args.timeframe) query.timeframe = args.timeframe as string;

      return callAPI(apiBaseUrl, '/api/analysis/technical', { query });
    },
  },

  {
    name: 'calculate_macd',
    description: 'Calculate MACD (Moving Average Convergence Divergence) for a symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol',
        },
        fast_period: {
          type: 'number',
          description: 'Fast EMA period (default: 12)',
        },
        slow_period: {
          type: 'number',
          description: 'Slow EMA period (default: 26)',
        },
        signal_period: {
          type: 'number',
          description: 'Signal line period (default: 9)',
        },
        timeframe: {
          type: 'string',
          enum: ['1Min', '5Min', '15Min', '1Hour', '1Day'],
          description: 'Bar timeframe (default: 1Day)',
        },
      },
      required: ['symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        symbol: args.symbol as string,
        indicator: 'macd',
      };
      if (args.fast_period) query.fast_period = String(args.fast_period);
      if (args.slow_period) query.slow_period = String(args.slow_period);
      if (args.signal_period) query.signal_period = String(args.signal_period);
      if (args.timeframe) query.timeframe = args.timeframe as string;

      return callAPI(apiBaseUrl, '/api/analysis/technical', { query });
    },
  },

  {
    name: 'calculate_bollinger_bands',
    description: 'Calculate Bollinger Bands for a symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol',
        },
        period: {
          type: 'number',
          description: 'Period (default: 20)',
        },
        std_dev: {
          type: 'number',
          description: 'Standard deviations (default: 2)',
        },
        timeframe: {
          type: 'string',
          enum: ['1Min', '5Min', '15Min', '1Hour', '1Day'],
          description: 'Bar timeframe (default: 1Day)',
        },
      },
      required: ['symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        symbol: args.symbol as string,
        indicator: 'bollinger',
      };
      if (args.period) query.period = String(args.period);
      if (args.std_dev) query.std_dev = String(args.std_dev);
      if (args.timeframe) query.timeframe = args.timeframe as string;

      return callAPI(apiBaseUrl, '/api/analysis/technical', { query });
    },
  },

  {
    name: 'find_support_resistance',
    description: 'Find support and resistance levels for a symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol',
        },
        lookback_days: {
          type: 'number',
          description: 'Days to look back (default: 30)',
        },
      },
      required: ['symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        symbol: args.symbol as string,
        indicator: 'support_resistance',
      };
      if (args.lookback_days) query.lookback_days = String(args.lookback_days);

      return callAPI(apiBaseUrl, '/api/analysis/technical', { query });
    },
  },

  {
    name: 'detect_trend',
    description: 'Detect the current trend for a symbol (uptrend, downtrend, sideways)',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol',
        },
        lookback_days: {
          type: 'number',
          description: 'Days to analyze (default: 30)',
        },
      },
      required: ['symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        symbol: args.symbol as string,
        indicator: 'trend',
      };
      if (args.lookback_days) query.lookback_days = String(args.lookback_days);

      return callAPI(apiBaseUrl, '/api/analysis/technical', { query });
    },
  },
];
