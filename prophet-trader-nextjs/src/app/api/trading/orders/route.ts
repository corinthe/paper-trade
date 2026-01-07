/**
 * Orders API Route
 * GET /api/trading/orders - Get orders with optional filters
 * POST /api/trading/orders - Place a new order
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AlpacaTradingService } from '@/lib/services/alpaca/trading';
import { logger } from '@/lib/utils/logger';

const OrderRequestSchema = z.object({
  symbol: z.string().min(1).max(10),
  qty: z.number().positive().optional(),
  notional: z.number().positive().optional(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit', 'stop', 'stop_limit', 'trailing_stop']),
  time_in_force: z.enum(['day', 'gtc', 'opg', 'cls', 'ioc', 'fok']).optional(),
  limit_price: z.number().positive().optional(),
  stop_price: z.number().positive().optional(),
  trail_price: z.number().positive().optional(),
  trail_percent: z.number().positive().optional(),
  extended_hours: z.boolean().optional(),
  client_order_id: z.string().optional(),
  order_class: z.enum(['simple', 'bracket', 'oco', 'oto']).optional(),
  take_profit: z
    .object({
      limit_price: z.number().positive(),
    })
    .optional(),
  stop_loss: z
    .object({
      stop_price: z.number().positive(),
      limit_price: z.number().positive().optional(),
    })
    .optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'open' | 'closed' | 'all' | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const tradingService = new AlpacaTradingService();
    const orders = await tradingService.getOrders({
      status: status || 'open',
      limit,
    });

    return NextResponse.json(orders);
  } catch (error) {
    logger.error('Failed to fetch orders', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const orderRequest = OrderRequestSchema.parse(body);

    const tradingService = new AlpacaTradingService();
    const order = await tradingService.placeOrder(orderRequest);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid order request', { errors: error.errors });
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    logger.error('Failed to place order', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to place order',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
