/**
 * Market intelligence tools (AI-powered analysis)
 */

import { MCPTool, callAPI } from '../types.js';

export const intelligenceTools: MCPTool[] = [
  {
    name: 'get_quick_market_intelligence',
    description: 'Get quick market overview from MarketWatch top stories, cleaned and summarized by Claude AI',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async (args, apiBaseUrl) => {
      return callAPI(apiBaseUrl, '/api/intelligence/news/quick');
    },
  },

  {
    name: 'analyze_stocks',
    description: 'Comprehensive AI-powered analysis of one or more stocks (technical + fundamental + news)',
    inputSchema: {
      type: 'object',
      properties: {
        symbols: {
          type: 'string',
          description: 'Comma-separated list of stock symbols to analyze',
        },
        include_technicals: {
          type: 'boolean',
          description: 'Include technical analysis (default: true)',
        },
        include_news: {
          type: 'boolean',
          description: 'Include news analysis (default: true)',
        },
        include_options: {
          type: 'boolean',
          description: 'Include options flow analysis (default: false)',
        },
      },
      required: ['symbols'],
    },
    handler: async (args, apiBaseUrl) => {
      return callAPI(apiBaseUrl, '/api/intelligence/stocks/analyze', {
        method: 'POST',
        body: args,
      });
    },
  },

  {
    name: 'aggregate_and_summarize_news',
    description: 'Aggregate news from multiple sources and get AI summary with trading implications',
    inputSchema: {
      type: 'object',
      properties: {
        sources: {
          type: 'string',
          description: 'Comma-separated list of sources (marketwatch, google, etc.)',
        },
        symbol: {
          type: 'string',
          description: 'Stock symbol to focus on',
        },
        limit_per_source: {
          type: 'number',
          description: 'Maximum articles per source (default: 10)',
        },
      },
      required: ['sources'],
    },
    handler: async (args, apiBaseUrl) => {
      return callAPI(apiBaseUrl, '/api/intelligence/news/aggregate', {
        method: 'POST',
        body: args,
      });
    },
  },
];
