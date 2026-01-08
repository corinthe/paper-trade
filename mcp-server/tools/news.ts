/**
 * News aggregation tools
 */

import { MCPTool, callAPI } from '../types.js';

export const newsTools: MCPTool[] = [
  {
    name: 'search_google_news',
    description: 'Search Google News for articles related to a query or symbol',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., stock symbol or topic)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of articles (default: 10)',
        },
      },
      required: ['query'],
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        q: args.query as string,
      };
      if (args.limit) query.limit = String(args.limit);

      return callAPI(apiBaseUrl, '/api/intelligence/news/search', { query });
    },
  },

  {
    name: 'get_marketwatch_top_stories',
    description: 'Get top stories from MarketWatch',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of articles (default: 15)',
        },
      },
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        feed: 'top',
      };
      if (args.limit) query.limit = String(args.limit);

      return callAPI(apiBaseUrl, '/api/intelligence/news/marketwatch', { query });
    },
  },

  {
    name: 'get_marketwatch_realtime',
    description: 'Get real-time headlines from MarketWatch',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of articles (default: 15)',
        },
      },
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        feed: 'realtime',
      };
      if (args.limit) query.limit = String(args.limit);

      return callAPI(apiBaseUrl, '/api/intelligence/news/marketwatch', { query });
    },
  },

  {
    name: 'get_marketwatch_bulletins',
    description: 'Get breaking news bulletins from MarketWatch',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of bulletins (default: 10)',
        },
      },
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {
        feed: 'bulletins',
      };
      if (args.limit) query.limit = String(args.limit);

      return callAPI(apiBaseUrl, '/api/intelligence/news/marketwatch', { query });
    },
  },

  {
    name: 'get_marketwatch_market_pulse',
    description: 'Get quick market pulse updates from MarketWatch (15 articles, cleaned by Claude)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async (args, apiBaseUrl) => {
      return callAPI(apiBaseUrl, '/api/intelligence/news/quick');
    },
  },

  {
    name: 'get_cleaned_news',
    description: 'Get news articles cleaned and summarized by Claude AI for trading insights',
    inputSchema: {
      type: 'object',
      properties: {
        sources: {
          type: 'string',
          description: 'Comma-separated list of sources (e.g., "marketwatch,google")',
        },
        symbol: {
          type: 'string',
          description: 'Stock symbol to filter news',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of articles per source (default: 10)',
        },
      },
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {};
      if (args.sources) query.sources = args.sources as string;
      if (args.symbol) query.symbol = args.symbol as string;
      if (args.limit) query.limit = String(args.limit);

      return callAPI(apiBaseUrl, '/api/intelligence/news/cleaned', { query });
    },
  },
];
