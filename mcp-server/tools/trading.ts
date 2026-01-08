/**
 * Trading operations tools
 */

import { MCPTool, callAPI } from '../types.js';

export const tradingTools: MCPTool[] = [
  {
    name: 'get_account',
    description: 'Get account information including buying power, cash, and portfolio value',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async (args, apiBaseUrl) => {
      return callAPI(apiBaseUrl, '/api/trading/account');
    },
  },

  {
    name: 'get_positions',
    description: 'Get all current trading positions',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async (args, apiBaseUrl) => {
      return callAPI(apiBaseUrl, '/api/trading/positions');
    },
  },

  {
    name: 'get_position',
    description: 'Get details of a specific position by symbol',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol (e.g., AAPL, TSLA)',
        },
      },
      required: ['symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const { symbol } = args as { symbol: string };
      return callAPI(apiBaseUrl, `/api/trading/positions/${symbol}`);
    },
  },

  {
    name: 'place_order',
    description: 'Place a stock order (market, limit, stop, or stop-limit)',
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
          description: 'Order side',
        },
        type: {
          type: 'string',
          enum: ['market', 'limit', 'stop', 'stop_limit'],
          description: 'Order type',
        },
        time_in_force: {
          type: 'string',
          enum: ['day', 'gtc', 'ioc', 'fok'],
          description: 'Time in force (default: day)',
        },
        limit_price: {
          type: 'number',
          description: 'Limit price (required for limit and stop_limit orders)',
        },
        stop_price: {
          type: 'number',
          description: 'Stop price (required for stop and stop_limit orders)',
        },
      },
      required: ['symbol', 'qty', 'side', 'type'],
    },
    handler: async (args, apiBaseUrl) => {
      return callAPI(apiBaseUrl, '/api/trading/orders', {
        method: 'POST',
        body: args,
      });
    },
  },

  {
    name: 'cancel_order',
    description: 'Cancel a pending order by ID',
    inputSchema: {
      type: 'object',
      properties: {
        order_id: {
          type: 'string',
          description: 'Order ID to cancel',
        },
      },
      required: ['order_id'],
    },
    handler: async (args, apiBaseUrl) => {
      const { order_id } = args as { order_id: string };
      return callAPI(apiBaseUrl, `/api/trading/orders/${order_id}`, {
        method: 'DELETE',
      });
    },
  },

  {
    name: 'get_orders',
    description: 'List orders with optional filters (status, limit, symbols)',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['open', 'closed', 'all'],
          description: 'Filter by order status (default: open)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of orders to return (default: 50)',
        },
        symbols: {
          type: 'string',
          description: 'Comma-separated list of symbols to filter',
        },
      },
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {};
      if (args.status) query.status = args.status as string;
      if (args.limit) query.limit = String(args.limit);
      if (args.symbols) query.symbols = args.symbols as string;

      return callAPI(apiBaseUrl, '/api/trading/orders', { query });
    },
  },

  {
    name: 'get_order',
    description: 'Get details of a specific order by ID',
    inputSchema: {
      type: 'object',
      properties: {
        order_id: {
          type: 'string',
          description: 'Order ID',
        },
      },
      required: ['order_id'],
    },
    handler: async (args, apiBaseUrl) => {
      const { order_id } = args as { order_id: string };
      return callAPI(apiBaseUrl, `/api/trading/orders/${order_id}`);
    },
  },

  {
    name: 'close_position',
    description: 'Close an entire position at market price',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol of position to close',
        },
      },
      required: ['symbol'],
    },
    handler: async (args, apiBaseUrl) => {
      const { symbol } = args as { symbol: string };
      return callAPI(apiBaseUrl, `/api/trading/positions/${symbol}`, {
        method: 'DELETE',
      });
    },
  },

  {
    name: 'close_all_positions',
    description: 'Close all open positions at market price (USE WITH CAUTION)',
    inputSchema: {
      type: 'object',
      properties: {
        cancel_orders: {
          type: 'boolean',
          description: 'Also cancel all open orders (default: true)',
        },
      },
    },
    handler: async (args, apiBaseUrl) => {
      const query: Record<string, string> = {};
      if (args.cancel_orders !== undefined) {
        query.cancel_orders = String(args.cancel_orders);
      }

      return callAPI(apiBaseUrl, '/api/trading/positions', {
        method: 'DELETE',
        query,
      });
    },
  },

  {
    name: 'is_market_open',
    description: 'Check if the stock market is currently open',
    inputSchema: {
      type: 'object',
      properties: {},
    },
    handler: async (args, apiBaseUrl) => {
      return callAPI(apiBaseUrl, '/api/trading/account', {
        query: { market_status: 'true' },
      });
    },
  },
];
