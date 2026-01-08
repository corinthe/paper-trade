/**
 * Options Latest Trade API Route
 * GET /api/options/trade - Get latest trade for an option contract
 */

import { NextRequest, NextResponse } from 'next/server';
import { AlpacaOptionsService } from '@/lib/services/alpaca/options';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Option symbol is required' },
        { status: 400 }
      );
    }

    const optionsService = new AlpacaOptionsService();
    const trade = await optionsService.getOptionLatestTrade(symbol);

    return NextResponse.json({
      symbol,
      trade,
    });
  } catch (error) {
    logger.error('Failed to fetch option latest trade', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch option latest trade',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
