/**
 * Single Position API Route
 * GET /api/trading/positions/[symbol] - Get position for a specific symbol
 * DELETE /api/trading/positions/[symbol] - Close a position
 */

import { NextResponse } from 'next/server';
import { AlpacaTradingService } from '@/lib/services/alpaca/trading';
import { logger } from '@/lib/utils/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const tradingService = new AlpacaTradingService();
    const position = await tradingService.getPosition(symbol);

    return NextResponse.json(position);
  } catch (error) {
    logger.error('Failed to fetch position', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch position',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const tradingService = new AlpacaTradingService();
    const order = await tradingService.closePosition(symbol);

    return NextResponse.json(order);
  } catch (error) {
    logger.error('Failed to close position', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to close position',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
