/**
 * Positions API Route
 * GET /api/trading/positions - Get all positions
 */

import { NextResponse } from 'next/server';
import { AlpacaTradingService } from '@/lib/services/alpaca/trading';
import { logger } from '@/lib/utils/logger';

export async function GET() {
  try {
    const tradingService = new AlpacaTradingService();
    const positions = await tradingService.getPositions();

    return NextResponse.json(positions);
  } catch (error) {
    logger.error('Failed to fetch positions', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch positions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
