/**
 * Single Order API Route
 * GET /api/trading/orders/[id] - Get order details
 * DELETE /api/trading/orders/[id] - Cancel an order
 */

import { NextResponse } from 'next/server';
import { AlpacaTradingService } from '@/lib/services/alpaca/trading';
import { logger } from '@/lib/utils/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tradingService = new AlpacaTradingService();
    const order = await tradingService.getOrder(id);

    return NextResponse.json(order);
  } catch (error) {
    logger.error('Failed to fetch order', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch order',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tradingService = new AlpacaTradingService();
    await tradingService.cancelOrder(id);

    return NextResponse.json({ message: 'Order canceled successfully' });
  } catch (error) {
    logger.error('Failed to cancel order', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to cancel order',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
