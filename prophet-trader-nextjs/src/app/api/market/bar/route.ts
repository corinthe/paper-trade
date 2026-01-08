/**
 * Market Bar API Route
 * GET /api/market/bar - Get latest bar for a symbol
 */

import { NextRequest, NextResponse } from 'next/server';
import { AlpacaDataService } from '@/lib/services/alpaca/data';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const dataService = new AlpacaDataService();
    const bar = await dataService.getLatestBar(symbol.toUpperCase());

    return NextResponse.json(bar);
  } catch (error) {
    logger.error('Failed to fetch bar', error as Error);

    return NextResponse.json(
      {
        error: 'Failed to fetch bar',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
