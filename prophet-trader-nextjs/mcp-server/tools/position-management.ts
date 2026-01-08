/**
 * Position management tools (automated stop-loss/take-profit)
 */

import { MCPTool, callAPI } from '../types.js';

export const positionManagementTools: MCPTool[] = [
  {
    name: 'create_managed_position',
    description: 'Create a managed position with automatic stop-loss and take-profit monitoring',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol',
        },
        qty: {
          type: 'number',
          description: 'Quantity of shares',
        },
        side: {
          type: 'string',
          enum: ['buy', 'sell'],
          description: 'Position side',
        },
        stop_loss_price: {
          type: 'number',
          description: 'Price to trigger stop-loss (optional)',
        },
        stop_loss_pct: {
          type: 'number',
          description: 'Stop-loss as percentage from entry (e.g., 0.05 for 5%)',
        },
        take_profit_price: {
          type: 'number',
          description: 'Price to trigger take-profit (optional)',
        },
        take_profit_pct: {
          type: 'number',
          description: 'Take-profit as percentage from entry (e.g., 0.10 for 10%)',
        },
        trailing_stop: {
          type: 'boolean',
          description: 'Enable trailing stop-loss (default: false)',
        },
        trailing_pct: {
          type: 'number',
          description: 'Trailing stop percentage (e.g., 0.05 for 5%)',
        },
      },
      required: ['symbol', 'qty', 'side'],
    },
    handler: async (args, apiBaseUrl) => {
      return callAPI(apiBaseUrl, '/api/positions/managed', {
        method: 'POST',
        body: args,
      });
    },
  },

  {
    name: 'get_managed_positions',
    description: 'List all managed positions with their current status',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['open', 'closed', 'all'],
          description: 'Filter by status (default: open)',
        },
      },
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {};
      if (args.status) query.status = args.status as string;

      return callAPI(apiBaseUrl, '/api/positions/managed', { query });
    },
  },

  {
    name: 'get_managed_position',
    description: 'Get details of a specific managed position by ID',
    inputSchema: {
      type: 'object',
      properties: {
        position_id: {
          type: 'string',
          description: 'Managed position ID',
        },
      },
      required: ['position_id'],
    },
    handler: async (args, apiBaseUrl) => {
      const { position_id } = args as { position_id: string };
      return callAPI(apiBaseUrl, `/api/positions/managed/${position_id}`);
    },
  },

  {
    name: 'update_managed_position',
    description: 'Update stop-loss/take-profit parameters of a managed position',
    inputSchema: {
      type: 'object',
      properties: {
        position_id: {
          type: 'string',
          description: 'Managed position ID',
        },
        stop_loss_price: {
          type: 'number',
          description: 'New stop-loss price',
        },
        take_profit_price: {
          type: 'number',
          description: 'New take-profit price',
        },
        trailing_stop: {
          type: 'boolean',
          description: 'Enable/disable trailing stop',
        },
        trailing_pct: {
          type: 'number',
          description: 'New trailing stop percentage',
        },
      },
      required: ['position_id'],
    },
    handler: async (args, apiBaseUrl) => {
      const { position_id, ...updates } = args as any;
      return callAPI(apiBaseUrl, `/api/positions/managed/${position_id}`, {
        method: 'PATCH',
        body: updates,
      });
    },
  },

  {
    name: 'close_managed_position',
    description: 'Manually close a managed position before stop-loss/take-profit triggers',
    inputSchema: {
      type: 'object',
      properties: {
        position_id: {
          type: 'string',
          description: 'Managed position ID',
        },
      },
      required: ['position_id'],
    },
    handler: async (args, apiBaseUrl) => {
      const { position_id } = args as { position_id: string };
      return callAPI(apiBaseUrl, `/api/positions/managed/${position_id}`, {
        method: 'DELETE',
      });
    },
  },
];
