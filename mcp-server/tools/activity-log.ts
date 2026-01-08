/**
 * Activity logging tools
 */

import { MCPTool, callAPI } from '../types.js';

export const activityLogTools: MCPTool[] = [
  {
    name: 'log_activity',
    description: 'Log a general activity or event in the trading system',
    inputSchema: {
      type: 'object',
      properties: {
        activity_type: {
          type: 'string',
          description: 'Type of activity (e.g., "trade", "analysis", "error")',
        },
        message: {
          type: 'string',
          description: 'Activity description',
        },
        metadata: {
          type: 'object',
          description: 'Additional metadata as JSON object',
        },
      },
      required: ['activity_type', 'message'],
    },
    handler: async (args, apiBaseUrl) => {
      return callAPI(apiBaseUrl, '/api/activity/log', {
        method: 'POST',
        body: args,
      });
    },
  },

  {
    name: 'log_decision',
    description: 'Log a trading decision with reasoning for future reference and AI learning',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol',
        },
        action: {
          type: 'string',
          enum: ['buy', 'sell', 'hold', 'close'],
          description: 'Trading action',
        },
        strategy: {
          type: 'string',
          description: 'Strategy used (e.g., "momentum", "mean-reversion")',
        },
        reasoning: {
          type: 'string',
          description: 'Detailed reasoning for the decision',
        },
        market_context: {
          type: 'string',
          description: 'Market conditions at time of decision',
        },
        confidence: {
          type: 'number',
          description: 'Confidence level (0-1)',
        },
        metadata: {
          type: 'object',
          description: 'Additional metadata',
        },
      },
      required: ['symbol', 'action', 'reasoning'],
    },
    handler: async (args, apiBaseUrl) => {
      return callAPI(apiBaseUrl, '/api/activity/decision', {
        method: 'POST',
        body: args,
      });
    },
  },

  {
    name: 'get_activity_log',
    description: 'Retrieve activity logs with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Filter by date (YYYY-MM-DD)',
        },
        activity_type: {
          type: 'string',
          description: 'Filter by activity type',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of logs (default: 50)',
        },
      },
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {};
      if (args.date) query.date = args.date as string;
      if (args.activity_type) query.activity_type = args.activity_type as string;
      if (args.limit) query.limit = String(args.limit);

      return callAPI(apiBaseUrl, '/api/activity/log', { query });
    },
  },
];
